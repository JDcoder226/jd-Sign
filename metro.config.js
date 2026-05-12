const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.watchFolders = [];

config.resolver.blockList = [
  /node_modules\/.*\/node_modules\/.*/,
  /.*\.test\..*/,
];

module.exports = config;
