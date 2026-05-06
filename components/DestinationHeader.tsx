import { MapPin, Search, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../constants/theme";
import { useRikoStore } from "../store/useStore";

interface SearchResult {
  latitude: number;
  longitude: number;
  display_name: string;
  name: string;
}

export default function DestinationHeader() {
  const { destination, destinationName, setDestination } = useRikoStore();
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const searchTimeoutRef = useRef<any>(null);
  const MAPTILER_KEY = "SHKJsJP0nENFEUm6CDSX";

  // Remove consecutive duplicate words from a string (case-insensitive)
  const deduplicateName = (name: string): string => {
    const words = name.split(/\s+/);
    const deduplicated: string[] = [];

    for (let i = 0; i < words.length; i++) {
      if (i === 0 || words[i].toLowerCase() !== words[i - 1].toLowerCase()) {
        deduplicated.push(words[i]);
      }
    }

    return deduplicated.join(" ");
  };

  const performSearch = async (text: string) => {
    if (text.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    const state = useRikoStore.getState();
    const userLoc = state.userLocation;

    // Proximity bias using user location
    const proximity = userLoc
      ? `&proximity=${userLoc.longitude},${userLoc.latitude}`
      : "";

    try {
      // SWAPPING TO MAPTILER GEOCODING (Reliable, No 429 issues with current key)
      const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(text)}.json?key=${MAPTILER_KEY}${proximity}&limit=10`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("MapTiler API error");

      const data = await response.json();

      // MapTiler returns Mapbox-style GeoJSON Features
      const results: SearchResult[] = (data.features || []).map((f: any) => {
        // Extract primary name - use place_name first (full name), then text (short name)
        let primaryName = (f.place_name?.split(",")[0] || f.text || "").trim();
        // Remove consecutive duplicate words
        primaryName = deduplicateName(primaryName);
        return {
          latitude: f.center[1],
          longitude: f.center[0],
          name: primaryName,
          display_name: f.place_name,
        };
      });

      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInputChange = (text: string) => {
    setSearchText(text);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (text.length >= 2) {
      setIsSearching(true);
      setShowResults(true);
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(text);
      }, 500);
    } else {
      setSearchResults([]);
      setShowResults(false);
      setIsSearching(false);
    }
  };

  const handleSelectLocation = (result: SearchResult) => {
    setDestination(
      {
        latitude: result.latitude,
        longitude: result.longitude,
      },
      result.name,
    );

    setSearchText("");
    setShowResults(false);
    setSearchResults([]);
  };

  const clearSearch = () => {
    setSearchText("");
    setSearchResults([]);
    setShowResults(false);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.inputWrapper}>
          <Search
            size={18}
            color={Colors.dark.orange}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.input}
            placeholder={
              destination ? "Change destination..." : "Search destination..."
            }
            placeholderTextColor={Colors.dark.muted}
            value={searchText}
            onChangeText={handleSearchInputChange}
            onFocus={() => searchText.length >= 2 && setShowResults(true)}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={18} color={Colors.dark.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Results Dropdown */}
      {showResults && !isSearching && searchResults.length > 0 && (
        <View style={styles.resultsContainer}>
          <FlatList
            data={searchResults}
            keyExtractor={(item, index) => index.toString()}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => handleSelectLocation(item)}
              >
                <View style={styles.resultIconContainer}>
                  <MapPin size={14} color={Colors.dark.orange} />
                </View>
                <View style={styles.resultTextContainer}>
                  <Text style={styles.resultName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.resultAddress} numberOfLines={1}>
                    {item.display_name.split(",").slice(1).join(", ").trim()}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {showResults && isSearching && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.dark.orange} />
          <Text style={styles.loadingText}>Searching MapTiler...</Text>
        </View>
      )}

      {showResults &&
        !isSearching &&
        searchResults.length === 0 &&
        searchText.length >= 2 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No results found</Text>
          </View>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    zIndex: 15,
  },
  destinationDisplay: {
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(254, 102, 21, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  destinationLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: Colors.dark.muted,
    letterSpacing: 2,
    marginBottom: 4,
  },
  destinationNameLarge: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFF",
    marginBottom: 4,
  },
  destinationMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.dark.orange,
    letterSpacing: 1,
  },
  searchContainer: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(254, 102, 21, 0.4)",
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
  },
  resultsContainer: {
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(28, 28, 30, 0.98)",
    maxHeight: 350,
    overflow: "hidden",
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  resultIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(254, 102, 21, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 2,
  },
  resultAddress: {
    fontSize: 11,
    color: Colors.dark.muted,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(28, 28, 30, 0.95)",
  },
  loadingText: {
    marginLeft: 10,
    color: Colors.dark.muted,
    fontSize: 12,
  },
  emptyContainer: {
    paddingVertical: 20,
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(28, 28, 30, 0.9)",
    alignItems: "center",
  },
  emptyText: {
    color: Colors.dark.muted,
    fontSize: 12,
  },
});
