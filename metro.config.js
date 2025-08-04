const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
config.resolver.extraNodeModules = {
  crypto: require.resolve("react-native-quick-crypto"),
  buffer: require.resolve("@craftzdog/react-native-buffer"),
};

module.exports = config;

module.exports = withNativeWind(config, { input: "./global.css" });
