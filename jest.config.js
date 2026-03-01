module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  setupFiles: ["<rootDir>/src/test/jestSetup.ts"],
  testMatch: ["**/?(*.)+(spec|test).[tj]s?(x)"],
  moduleNameMapper: {
    "^@app/(.*)$": "<rootDir>/src/app/$1",
    "^@features/(.*)$": "<rootDir>/src/features/$1",
    "^@shared/(.*)$": "<rootDir>/src/shared/$1",
    "^@domain/(.*)$": "<rootDir>/src/domain/$1",
    "^react-native$": "<rootDir>/src/test/reactNativeMock.tsx",
    "^expo-status-bar$": "<rootDir>/src/test/expoStatusBarMock.tsx",
    "\\.(png|jpg|jpeg|gif|webp|svg)$": "<rootDir>/src/test/fileMock.js",
  },
};
