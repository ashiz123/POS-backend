import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

// export default defineConfig({
//     plugins: [tsconfigPaths({ projects: ['./tsconfig.test.json'] })],
//     test: {
//         globals: true,
//         silent: false,
//         environment: 'node',
//         include: ['tests/**/*.test.ts'],
//         fileParallelism: false,
//         setupFiles: ['./tests/setup/setupTests.ts'],
//         globalSetup: ['./tests/setup/globalSetup.ts'],
//     },
// })

//this setup is done to eliminate the db run while unit test
export default defineConfig({
  plugins: [tsconfigPaths({ projects: ["./tsconfig.test.json"] })],
  test: {
    projects: [
      {
        test: {
          name: "unit",
          environment: "node",
          fileParallelism: true,
          include: ["./tests/unit/*.test.ts"],
          setupFiles: ["./tests/setup/setupUnitTests.ts"],
        },
      },
      {
        test: {
          name: "integration",
          globals: true,
          environment: "node",
          include: ["tests/integration/*.test.ts"],
          fileParallelism: false,
          setupFiles: ["./tests/setup/setupIntegrationTests.ts"],
          globalSetup: ["./tests/setup/globalSetup.ts"],
        },
      },
    ],
  },
});
