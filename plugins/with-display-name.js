const { withAndroidManifest, withInfoPlist } = require("expo/config-plugins");

const DISPLAY_NAME = "Н.О.С.";

module.exports = function withDisplayName(config) {
  config = withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0];
    if (application?.$) {
      application.$["android:label"] = DISPLAY_NAME;
    }
    return config;
  });

  config = withInfoPlist(config, (config) => {
    config.modResults.CFBundleDisplayName = DISPLAY_NAME;
    return config;
  });

  return config;
};
