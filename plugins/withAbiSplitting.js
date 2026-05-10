const { withAppBuildGradle } = require('@expo/config-plugins');

const gradleAddition = `
android {
    splits {
        abi {
            enable true
            reset()
            include "arm64-v8a"
            universalApk false
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
