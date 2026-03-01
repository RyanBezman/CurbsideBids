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
                  "Cross-feature imports must go through each feature's public index entrypoint (use feature public index).",
              },
              {
                group: [
                  "@shared/api/supabase/client",
                  "**/shared/api/supabase/client",
                ],
                message:
                  "Direct supabase client imports are limited to api/data modules. Use @shared/api elsewhere.",
              },
            ],
          },
        ],
      },
    },
    {
      files: [
        "src/features/**/api/**/*.{ts,tsx}",
        "src/features/**/data/**/*.{ts,tsx}",
      ],
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
                  "Cross-feature imports must go through each feature's public index entrypoint (use feature public index).",
              },
            ],
          },
        ],
      },
    },
    {
      files: ["src/app/**/*.{ts,tsx}"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: [
                  "../../../*",
                  "../../../../*",
                  "../../../../../*",
                ],
                message:
                  "Use path aliases (@app, @features, @shared, @domain) instead of deep relative imports.",
              },
              {
                group: [
                  "@shared/api/supabase/client",
                  "**/shared/api/supabase/client",
                ],
                message:
                  "Direct supabase client imports are limited to api/data modules. Use @shared/api elsewhere.",
              },
            ],
          },
        ],
      },
    },
    {
      files: [
        "src/features/home/**/*.{ts,tsx}",
        "src/features/reservations/components/**/*.{ts,tsx}",
        "src/features/reservations/hooks/**/*.{ts,tsx}",
        "src/features/reservations/lib/**/*.{ts,tsx}",
      ],
      rules: {
        "max-lines": [
          "error",
          {
            max: 220,
            skipBlankLines: true,
            skipComments: true,
          },
        ],
        "max-lines-per-function": [
          "error",
          {
            max: 120,
            skipBlankLines: true,
            skipComments: true,
            IIFEs: true,
          },
        ],
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: [
                  "../../../*",
                  "../../../../*",
                  "../../../../../*",
                ],
                message:
                  "Use path aliases (@app, @features, @shared, @domain) instead of deep relative imports.",
              },
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
                  "Cross-feature imports must go through each feature's public index entrypoint (use feature public index).",
              },
              {
                group: [
                  "@shared/api/supabase/client",
                  "**/shared/api/supabase/client",
                ],
                message:
                  "Direct supabase client imports are limited to api/data modules. Use @shared/api elsewhere.",
              },
            ],
          },
        ],
      },
    },
  ],
};
