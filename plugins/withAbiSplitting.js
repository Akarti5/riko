const { withAppBuildGradle } = require('@expo/config-plugins');

const gradleAddition = `
android {
    splits {
        abi {
            enable true
            reset()
            include "armeabi-v7a", "arm64-v8a"
            universalApk false
        }
    }
}

import com.android.build.OutputFile
android.applicationVariants.all { variant ->
    variant.outputs.each { output ->
        def abi = output.getFilter(OutputFile.ABI)
        if (abi != null) {
            output.versionCodeOverride = (abi == 'armeabi-v7a' ? 1 : 2) * 1000 + variant.versionCode
        }
    }
}
`;

module.exports = function withAbiSplitting(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      if (!config.modResults.contents.includes('splits {')) {
        config.modResults.contents += gradleAddition;
      }
    }
    return config;
  });
};
