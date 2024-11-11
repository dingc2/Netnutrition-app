// babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        root: ['./'],
        alias: {
          '@': './',
          '@env': './test/mocks/env.js'
        },
      }],
      'react-native-reanimated/plugin'
    ],
  };
};