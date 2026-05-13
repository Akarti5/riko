const { withMainActivity } = require('@expo/config-plugins');

module.exports = function withAlarmVolume(config) {
  return withMainActivity(config, async (config) => {
    let content = config.modResults.contents;

    // Add imports if missing
    if (!content.includes('import android.media.AudioManager')) {
      content = content.replace('import android.os.Bundle', 'import android.os.Bundle\nimport android.media.AudioManager');
    }

    // Add setVolumeControlStream in onCreate
    if (!content.includes('setVolumeControlStream(AudioManager.STREAM_ALARM)')) {
      const onCreateRegex = /(super\.onCreate\(null\))/;
      content = content.replace(onCreateRegex, '$1\n    setVolumeControlStream(AudioManager.STREAM_ALARM)');
    }

    config.modResults.contents = content;
    return config;
  });
};
