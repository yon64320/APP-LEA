module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      [
        'babel-preset-expo',
        {
          unstable_transformImportMeta: true, // Polyfill pour import.meta (mobile + web)
        },
      ],
    ],
    plugins: [
      // Transform import.meta pour le web - DOIT être AVANT reanimated
      [
        'babel-plugin-transform-import-meta',
        {
          module: 'ES6',
          wrap: true,
        },
      ],
      // react-native-reanimated/plugin doit être en dernier
      // Il sera ignoré sur le web grâce à l'import conditionnel dans _layout.tsx
      'react-native-reanimated/plugin',
    ],
  };
};
