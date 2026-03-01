module.exports = function (api) {
  api.cache.using(() => process.env.BABEL_ENV || process.env.NODE_ENV);
  const isTest = api.env("test");

  return {
    presets: [
      isTest
        ? "babel-preset-expo"
        : ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      ...(isTest ? [] : ["nativewind/babel"]),
    ],
  };
};
