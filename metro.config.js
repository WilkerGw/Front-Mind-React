const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver alias for tslib to ensure correct file is used
config.resolver.extraNodeModules = {
    ...config.resolver.extraNodeModules,
    tslib: require.resolve('tslib'),
};

// Ensure source extensions include TypeScript files
config.resolver.sourceExts = [...config.resolver.sourceExts, 'ts', 'tsx'];

module.exports = config;
