const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withLockScreenFeatures(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const mainActivity = androidManifest.manifest.application[0].activity.find(
      (a) => a['$']['android:name'] === '.MainActivity'
    );

    if (mainActivity) {
      mainActivity['$']['android:showWhenLocked'] = 'true';
      mainActivity['$']['android:turnScreenOn'] = 'true';
    }

    return config;
  });
};
