module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: { '@': './src', '@components': './src/components', '@screens': './src/screens', '@store': './src/store', '@theme': './src/theme', '@api': './src/api', '@hooks': './src/hooks' }
      }],
      'react-native-reanimated/plugin',
    ],
  };
};
