module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      process.env.NODE_ENV === "production" &&
        "babel-plugin-transform-remove-console",
    ].filter(Boolean),
  };
};
