const { withEntryPoint } = require('@expo/prebuild-compose');
const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = (config) => {
  // Agregar permisos y meta-data de OneSignal al AndroidManifest
  config = withAndroidManifest(config, (config) => {
    const androidManifest = config.android.manifest;
    const mainApplication = androidManifest['manifest']['application'][0];

    // Agregar meta-data de OneSignal
    if (!mainApplication['meta-data']) {
      mainApplication['meta-data'] = [];
    }

    mainApplication['meta-data'].push({
      $: {
        'android:name': 'com.onesignal.NotificationChannel.ERROR_ON_UNSET',
        'android:value': 'true',
      },
    });

    // Agregar permisos al manifest raíz
    const manifest = androidManifest['manifest'];
    if (!manifest['uses-permission']) {
      manifest['uses-permission'] = [];
    }

    const existingPermissions = manifest['uses-permission'].map(
      (p: any) => p.$.['android:name']
    );

    if (!existingPermissions.includes('android.permission.WAKE_LOCK')) {
      manifest['uses-permission'].push({
        $: { 'android:name': 'android.permission.WAKE_LOCK' },
      });
    }

    if (!existingPermissions.includes('android.permission.RECEIVE_BOOT_COMPLETED')) {
      manifest['uses-permission'].push({
        $: { 'android:name': 'android.permission.RECEIVE_BOOT_COMPLETED' },
      });
    }

    if (!existingPermissions.includes('android.permission.VIBRATE')) {
      manifest['uses-permission'].push({
        $: { 'android:name': 'android.permission.VIBRATE' },
      });
    }

    if (!existingPermissions.includes('android.permission.FOREGROUND_SERVICE')) {
      manifest['uses-permission'].push({
        $: { 'android:name': 'android.permission.FOREGROUND_SERVICE' },
      });
    }

    return config;
  });

  return config;
};