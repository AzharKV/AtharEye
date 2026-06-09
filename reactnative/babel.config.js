// babel-preset-expo auto-wires Reanimated/worklets + the React Compiler (from app.json experiments).
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
