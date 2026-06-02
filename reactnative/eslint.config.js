// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    rules: {
      // The count-up / ready-gate hooks and the sheet-reset effects intentionally seed state
      // synchronously in an effect (faithful ports of the working PWA timers). That's deliberate
      // initialization, not a cascading-render bug, so this stricter React-Compiler-era rule is off.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    ignores: ['dist/*', 'ios/*', 'android/*', '.expo/*', 'expo-env.d.ts'],
  },
]);
