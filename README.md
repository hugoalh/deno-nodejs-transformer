# Deno NodeJS Transformer

[**⚖️** MIT](./LICENSE.md)

[![GitHub: hugoalh/deno-nodejs-transformer](https://img.shields.io/github/v/release/hugoalh/deno-nodejs-transformer?label=hugoalh/deno-nodejs-transformer&labelColor=181717&logo=github&logoColor=ffffff&sort=semver&style=flat "GitHub: hugoalh/deno-nodejs-transformer")](https://github.com/hugoalh/deno-nodejs-transformer)
[![JSR: @hugoalh/deno-nodejs-transformer](https://img.shields.io/jsr/v/@hugoalh/deno-nodejs-transformer?label=@hugoalh/deno-nodejs-transformer&labelColor=F7DF1E&logo=jsr&logoColor=000000&style=flat "JSR: @hugoalh/deno-nodejs-transformer")](https://jsr.io/@hugoalh/deno-nodejs-transformer)

A Deno module for transform Deno code to NodeJS code.

This module is a modified edition of the [Deno DNT](https://github.com/denoland/dnt) which aim for:

- Always force with ECMAScript module
- Hotfix engine issues
- Improve file structure
- Unify configuration

## 🔰 Begin

### 🎯 Targets

| **Targets** | **Remote** | **JSR** |
|:--|:-:|:-:|
| **[Deno](https://deno.land/)** >= v2.5.1 | ✔️ | ✔️ |

> [!NOTE]
> - It is possible to use this module in other methods/ways which not listed in here, however those methods/ways are not officially supported, and should beware maybe cause security issues.

### #️⃣ Resources Identifier

- **Remote - GitHub Raw:**
  ```
  https://raw.githubusercontent.com/hugoalh/deno-nodejs-transformer/{Tag}/mod.ts
  ```
- **JSR:**
  ```
  [jsr:]@hugoalh/deno-nodejs-transformer[@{Tag}]
  ```

> [!NOTE]
> - For usage of remote resources, it is recommended to import the entire module with the main path `mod.ts`, however it is also able to import part of the module with sub path if available, but do not import if:
>
>   - it's path has an underscore prefix (e.g.: `_foo.ts`, `_util/bar.ts`), or
>   - it is a benchmark or test file (e.g.: `foo.bench.ts`, `foo.test.ts`), or
>   - it's symbol has an underscore prefix (e.g.: `_bar`, `_foo`).
>
>   These elements are not considered part of the public API, thus no stability is guaranteed for them.
> - For usage of JSR resources, it is recommended to import the entire module with the main entrypoint, however it is also able to import part of the module with sub entrypoint if available, please visit the [file `jsr.jsonc`](./jsr.jsonc) property `exports` for available sub entrypoints.
> - It is recommended to use this module with tag for immutability.

### 🛡️ Runtime Permissions

- **Environment Variable (Deno: `env`):**
  - *Resources*
- **File System - Read (Deno: `read`):**
  - *Resources*
- **File System - Write (Deno: `write`):**
  - *Resources*
- **Network (Deno: `net`):**
  - *Resources*

## 🧩 APIs

- ```ts
  function invokeDenoNodeJSTransformer(options: DenoNodeJSTransformerOptions): Promise<void>;
  ```
- ```ts
  interface DenoNodeJSTransformerOptions {
    copyAssets?: (string | DenoNodeJSTransformerCopyAssetsOptions)[];
    emitDecoratorMetadata?: boolean;
    entrypoints: DenoNodeJSTransformerEntrypoint[];
    filterDiagnostic?: BuildOptions["filterDiagnostic"];
    fixInjectedImports?: boolean;
    generateDeclaration?: boolean;
    generateDeclarationMap?: boolean;
    importsMap?: string;
    lib?: LibName[];
    libCheck?: boolean;
    mappings?: SpecifierMappings;
    metadata: Metadata;
    outputDirectory?: string;
    outputDirectoryPreEmpty?: boolean;
    root?: string;
    shims?: DenoNodeJSTransformerShimOptions;
    target?: ScriptTarget;
    useTSLibHelper?: boolean;
    noImplicitAny?: boolean;
    noImplicitReturns?: boolean;
    noImplicitThis?: boolean;
    noStrictGenericChecks?: boolean;
    noUncheckedIndexedAccess?: boolean;
    strictBindCallApply?: boolean;
    strictFunctionTypes?: boolean;
    strictNullChecks?: boolean;
    strictPropertyInitialization?: boolean;
    useUnknownInCatchVariables?: boolean;
  }
  ```

> [!NOTE]
> - For the full or prettier documentation, can visit via:
>   - [Deno CLI `deno doc`](https://docs.deno.com/runtime/reference/cli/documentation_generator/)
>   - [JSR](https://jsr.io/@hugoalh/deno-nodejs-transformer)

## ✍️ Examples

- ```ts
  await invokeDenoNodeJSTransformer({
    entrypointsScript: {
      ".": "./mod.ts"
    },
    metadata: {
      name: "@hugoalh/deno-nodejs-transformer-test",
      version: "0.8.0",
      description: "Demo of Deno NodeJS Transformer.",
      keywords: [
        "dnt",
        "test"
      ],
      homepage: "https://github.com/hugoalh/deno-nodejs-transformer#readme",
      bugs: {
        url: "https://github.com/hugoalh/deno-nodejs-transformer/issues"
      },
      license: "MIT",
      author: "hugoalh",
      repository: {
        type: "git",
        url: "git+https://github.com/hugoalh/deno-nodejs-transformer.git"
      },
      private: false,
      publishConfig: {
        access: "public"
      }
    },
    outputDirectory: "npm",
    outputDirectoryPreEmpty: true
  });
  ```
