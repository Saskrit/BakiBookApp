const { withAppBuildGradle } = require('@expo/config-plugins');

const MARKER = 'BakiBook: friendly APK filename';
const SNIPPET = `
// ${MARKER}
android.applicationVariants.configureEach { variant ->
    variant.outputs.configureEach { output ->
        def suffix = variant.buildType.name == "release" ? "" : "-\${variant.buildType.name}"
        output.outputFileName = "BakiBook\${suffix}.apk"
    }
}
`;

/** @param {import('@expo/config-plugins').ExpoConfig} config */
module.exports = function withBakiBookAndroid(config) {
  return withAppBuildGradle(config, (cfg) => {
    if (!cfg.modResults.contents.includes(MARKER)) {
      cfg.modResults.contents = cfg.modResults.contents.replace(
        /^dependencies \{/m,
        `${SNIPPET}\ndependencies {`
      );
    }
    return cfg;
  });
};
