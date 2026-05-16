const { withAppBuildGradle } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withLocalSigning(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      const credentialsPath = path.join(config._internal.projectRoot, 'credentials.json');
      
      if (fs.existsSync(credentialsPath)) {
        const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
        const keystore = credentials.android.keystore;
        const absoluteKeystorePath = path.join(config._internal.projectRoot, keystore.keystorePath).replace(/\\/g, '/');

        const releaseSigningConfig = `
        release {
            storeFile file("${absoluteKeystorePath}")
            storePassword "${keystore.keystorePassword}"
            keyAlias "${keystore.keyAlias}"
            keyPassword "${keystore.keyPassword}"
        }`;

        // 1. Clean up any previous mess
        config.modResults.contents = config.modResults.contents.replace(/release\s*\{\s*storeFile file[\s\S]*?\}\s*/g, '');
        
        // 2. Inject release config precisely before debug config
        if (!config.modResults.contents.includes('signingConfigs.release')) {
          config.modResults.contents = config.modResults.contents.replace(
            'debug {',
            `${releaseSigningConfig}\n        debug {`
          );
        }

        // 3. Fix the link in buildTypes (specific to release block)
        // We look for release { ... signingConfig signingConfigs.debug
        const buildTypesMatch = config.modResults.contents.match(/release\s*\{[\s\S]*?signingConfig\s*signingConfigs\.debug/);
        if (buildTypesMatch) {
            const fixedBlock = buildTypesMatch[0].replace('signingConfig signingConfigs.debug', 'signingConfig signingConfigs.release');
            config.modResults.contents = config.modResults.contents.replace(buildTypesMatch[0], fixedBlock);
        }
      }
    }
    return config;
  });
};
