const { withMainActivity, withMainApplication } = require('@expo/config-plugins');

module.exports = function withNativeAlarmControl(config) {
  config = withMainActivity(config, async (config) => {
    let content = config.modResults.contents;

    const imports = [
      'import android.media.AudioAttributes',
      'import android.media.MediaPlayer',
      'import android.media.RingtoneManager',
      'import android.net.Uri',
      'import android.os.Build',
      'import android.os.PowerManager',
      'import android.content.Context',
      'import android.view.WindowManager',
      'import com.facebook.react.bridge.NativeModule',
      'import com.facebook.react.bridge.ReactApplicationContext',
      'import com.facebook.react.bridge.ReactMethod',
      'import com.facebook.react.bridge.ReactContextBaseJavaModule',
    ];

    imports.forEach(imp => {
      if (!content.includes(imp)) {
        content = content.replace(/package .*/, `$& \n${imp}`);
      }
    });

    if (!content.includes('class RikoAlarmModule')) {
      content += `
class RikoAlarmModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private var mediaPlayer: MediaPlayer? = null

    override fun getName(): String = "RikoAlarmModule"

    @ReactMethod
    fun playAlarm(uriString: String) {
        stopAlarm()
        
        // --- FORCE SCREEN POWER ON (WakeLock) ---
        try {
            val powerManager = reactApplicationContext.getSystemService(Context.POWER_SERVICE) as PowerManager
            val wakeLock = powerManager.newWakeLock(
                PowerManager.FULL_WAKE_LOCK or
                PowerManager.ACQUIRE_CAUSES_WAKEUP or
                PowerManager.ON_AFTER_RELEASE,
                "Riko:AlarmWakeLock"
            )
            wakeLock.acquire(3000) // Turn screen on for at least 3 seconds
        } catch (e: Exception) {
            e.printStackTrace()
        }

        // --- CONFIGURE WINDOW FLAGS ---
        reactApplicationContext.currentActivity?.let { activity ->
            activity.runOnUiThread {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
                    activity.setShowWhenLocked(true)
                    activity.setTurnScreenOn(true)
                } else {
                    @Suppress("DEPRECATION")
                    activity.window.addFlags(
                        WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
                        WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD or
                        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                        WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
                    )
                }
                activity.window.addFlags(WindowManager.LayoutParams.FLAG_ALLOW_LOCK_WHILE_SCREEN_ON)
            }
        }

        try {
            val alarmUri = if (uriString == "default" || uriString.isEmpty()) {
                RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
            } else {
                Uri.parse(uriString)
            }
            val finalUri = alarmUri ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)

            mediaPlayer = MediaPlayer().apply {
                setDataSource(reactApplicationContext, finalUri)
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
            if (uriString != "default") playAlarm("default")
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
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
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
