/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    { name: "no-circular", severity: "error", from: {}, to: { circular: true } },
    {
      name: "no-cross-module-deep-import",
      comment:
        "src/modules/<a> may only import another module through its index.ts (CLAUDE.md §0.2 #9).",
      severity: "error",
      from: { path: "^src/modules/([^/]+)/" },
      to: {
        path: "^src/modules/([^/]+)/.+",
        pathNot: ["^src/modules/$1/", "^src/modules/[^/]+/index\\.ts$"],
      },
    },
    {
      name: "no-dev-deps-in-src",
      severity: "error",
      // Tests and the integration-test harness (src/test/) may use dev dependencies.
      from: { path: "^src/", pathNot: ["\\.(int\\.)?test\\.ts$", "^src/test/"] },
      to: { dependencyTypes: ["npm-dev"], pathNot: ["node_modules/@types/"] },
    },
    {
      name: "not-to-unresolvable",
      severity: "error",
      from: {},
      // `server-only` is resolved by Next's bundler, not from node_modules (stack-rules S5-4).
      to: { couldNotResolve: true, pathNot: "^server-only$" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: { path: "^src/generated/" },
    tsConfig: { fileName: "tsconfig.json" },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default", "types"],
    },
  },
};
