module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "import"],
  ignorePatterns: ["node_modules/", ".expo/", "dist/", "web-build/", "coverage/"],
  settings: {
    "import/resolver": {
      typescript: {
        project: "./tsconfig.json",
      },
    },
  },
  rules: {
    "@typescript-eslint/consistent-type-imports": [
      "error",
      {
        fixStyle: "inline-type-imports",
        prefer: "type-imports",
      },
    ],
    "@typescript-eslint/no-require-imports": "off",
    "import/no-default-export": "off",
  },
  overrides: [
    {
      files: ["src/features/**/*.{ts,tsx}"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: [
                  "../../auth/*",
                  "../../home/*",
                  "../../ride-request/*",
                  "../../reservations/*",
                  "../../../features/*/*",
                  "@features/*/*/*",
                ],
                message:
                  "Cross-feature imports must go through each feature's public index entrypoint.",
              },
            ],
          },
        ],
      },
    },
  ],
};
