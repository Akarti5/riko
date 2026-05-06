import { Search, X } from "lucide-react-native";
import React, { useState } from "react";
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
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
}

export default function DestinationHeader() {
  const { destination, destinationName, setDestination } = useRikoStore();
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (text: string) => {
    setSearchText(text);

    if (text.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=8`,
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = (result: SearchResult) => {
    const coord = {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    };
    const name = result.name || result.display_name.split(",")[0];

    setDestination(coord, name);
    setSearchText("");
    setShowResults(false);
    setSearchResults([]);
  };

  const clearSearch = () => {
    setSearchText("");
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <View style={styles.container}>
      {/* Search Input Only */}
      <View style={styles.searchContainer}>
        <View style={styles.inputWrapper}>
          <Search
            size={18}
            color={Colors.dark.orange}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Search location..."
            placeholderTextColor={Colors.dark.muted}
            value={searchText}
            onChangeText={handleSearch}
            onFocus={() => showResults && setShowResults(true)}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={18} color={Colors.dark.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <View style={styles.resultsContainer}>
          <FlatList
            data={searchResults}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => handleSelectLocation(item)}
              >
                <View style={styles.resultIconContainer}>
                  <Search size={14} color={Colors.dark.orange} />
                </View>
                <View style={styles.resultTextContainer}>
                  <Text style={styles.resultName} numberOfLines={1}>
                    {item.name || item.display_name.split(",")[0]}
                  </Text>
                  <Text style={styles.resultAddress} numberOfLines={1}>
                    {item.display_name.split(",").slice(1, 3).join(", ")}
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
          <Text style={styles.loadingText}>Searching...</Text>
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
    backgroundColor: "rgba(28, 28, 30, 0.9)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  destinationNameLarge: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFF",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  searchContainer: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(254, 102, 21, 0.6)",
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
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.dark.muted,
    letterSpacing: 0.3,
  },
  resultsContainer: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(28, 28, 30, 0.9)",
    maxHeight: 300,
    overflow: "hidden",
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.03)",
  },
  resultIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(254, 102, 21, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultName: {
    fontSize: 13,
    fontWeight: "600",
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
    paddingVertical: 12,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(28, 28, 30, 0.9)",
  },
  loadingText: {
    marginLeft: 10,
    color: Colors.dark.muted,
    fontSize: 12,
  },
  emptyContainer: {
    paddingVertical: 16,
    marginTop: 8,
    borderRadius: 12,
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
