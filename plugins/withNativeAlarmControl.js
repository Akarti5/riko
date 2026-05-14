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
      const escapedImp = imp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`^${escapedImp}\\s*$`, 'm');
      if (!regex.test(content)) {
        content = content.replace(/package .*/, `$& \n${imp}`);
      }
    });

    // Cleanup markers
    const startMarker = '// @riko-begin';
    const endMarker = '// @riko-end';
    if (content.includes(startMarker)) {
        const parts = content.split(startMarker);
        const secondPart = (parts[1] || '').split(endMarker);
        content = parts[0] + (secondPart[1] || '');
    }
    content = content.replace(/class RikoAlarmModule[\s\S]*?class RikoAlarmPackage[\s\S]*?}/g, '');

    const nativeCode = `
// @riko-begin
class RikoAlarmModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private var mediaPlayer: MediaPlayer? = null

    override fun getName(): String = "RikoAlarmModule"

    @ReactMethod
    fun playAlarm(uriString: String) {
        stopAlarm()
        
        // --- FORCE SCREEN POWER ON (WakeLock) ---
        try {
            val powerManager = getReactApplicationContext().getSystemService(Context.POWER_SERVICE) as PowerManager
            val wakeLock = powerManager.newWakeLock(
                PowerManager.FULL_WAKE_LOCK or
                PowerManager.ACQUIRE_CAUSES_WAKEUP or
                PowerManager.ON_AFTER_RELEASE,
                "Riko:AlarmWakeLock"
            )
            wakeLock.acquire(3000)
        } catch (e: Exception) {
            e.printStackTrace()
        }

        // --- CONFIGURE WINDOW FLAGS (Safe Access) ---
        val activity = getReactApplicationContext().getCurrentActivity()
        if (activity != null) {
            activity.runOnUiThread(Runnable {
                try {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
                        activity.setShowWhenLocked(true)
                        activity.setTurnScreenOn(true)
                    } else {
                        @Suppress("DEPRECATION")
                        activity.getWindow().addFlags(
                            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
                            WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD or
                            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                            WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
                        )
                    }
                    activity.getWindow().addFlags(WindowManager.LayoutParams.FLAG_ALLOW_LOCK_WHILE_SCREEN_ON)
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            })
        }

        try {
            val alarmUri = if (uriString == "default" || uriString.isEmpty()) {
                RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
            } else {
                Uri.parse(uriString)
            }
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
// @riko-end
`;

    content = content.trim() + "\n" + nativeCode;
    config.modResults.contents = content;
    return config;
  });

  config = withMainApplication(config, async (config) => {
    let content = config.modResults.contents;
    if (!content.includes('add(RikoAlarmPackage())')) {
      content = content.replace(
        'PackageList(this).packages.apply {',
        'PackageList(this).packages.apply {\\n              add(RikoAlarmPackage())'
      );
    }
    config.modResults.contents = content;
    return config;
  });

  return config;
};
