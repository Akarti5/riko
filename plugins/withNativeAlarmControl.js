const { withMainActivity, withMainApplication } = require('@expo/config-plugins');

module.exports = function withNativeAlarmControl(config) {
  // 1. Add the AlarmModule class to MainActivity.kt
  config = withMainActivity(config, async (config) => {
    let content = config.modResults.contents;

    // Add necessary imports with a more robust regex
    const imports = [
      'import android.media.AudioAttributes',
      'import android.media.MediaPlayer',
      'import android.media.RingtoneManager',
      'import android.net.Uri',
      'import com.facebook.react.bridge.ReactContextBaseJavaModule',
      'import com.facebook.react.bridge.ReactMethod',
      'import com.facebook.react.bridge.ReactApplicationContext',
      'import com.facebook.react.bridge.NativeModule',
    ];

    imports.forEach(imp => {
      if (!content.includes(imp)) {
        content = content.replace(/package .*/, `$& \n${imp}`);
      }
    });

    // Add the Module and Package classes at the end of the file
    if (!content.includes('class RikoAlarmModule')) {
      content += `
      
class RikoAlarmModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private var mediaPlayer: MediaPlayer? = null

    override fun getName(): String = "RikoAlarmModule"

    @ReactMethod
    fun playAlarm(uriString: String) {
        stopAlarm()
        try {
            val alarmUri = if (uriString == "default" || uriString.isEmpty()) {
                RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
            } else {
                Uri.parse(uriString)
            }

            // Fallback to notification sound if alarm sound is not set/found
            val finalUri = alarmUri ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)

            mediaPlayer = MediaPlayer().apply {
                setDataSource(getReactApplicationContext(), finalUri)
                setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                        .build()
                )
                isLooping = true
                prepare()
                start()
            }
        } catch (e: Exception) {
            e.printStackTrace()
            // If custom URI fails, try playing the default alarm
            if (uriString != "default") {
                playAlarm("default")
            }
        }
    }

    @ReactMethod
    fun stopAlarm() {
        try {
            mediaPlayer?.stop()
            mediaPlayer?.release()
        } catch (e: Exception) { }
        mediaPlayer = null
    }
}

class RikoAlarmPackage : com.facebook.react.ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<com.facebook.react.bridge.NativeModule> {
        return listOf(RikoAlarmModule(reactContext))
    }
    override fun createViewManagers(reactContext: ReactApplicationContext): List<com.facebook.react.uimanager.ViewManager<*, *>> {
        return emptyList()
    }
}
`;
    }

    config.modResults.contents = content;
    return config;
  });

  // 2. Register the Package in MainApplication.kt
  config = withMainApplication(config, async (config) => {
    let content = config.modResults.contents;

    if (!content.includes('add(RikoAlarmPackage())')) {
      content = content.replace(
        'PackageList(this).packages.apply {',
        'PackageList(this).packages.apply {\n              add(RikoAlarmPackage())'
      );
    }

    config.modResults.contents = content;
    return config;
  });

  return config;
};
