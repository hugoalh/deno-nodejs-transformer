# Deno NodeJS Transformer

[**⚖️** MIT](./LICENSE.md)

[![GitHub: hugoalh/deno-nodejs-transformer](https://img.shields.io/github/v/release/hugoalh/deno-nodejs-transformer?label=hugoalh/deno-nodejs-transformer&labelColor=181717&logo=github&logoColor=ffffff&sort=semver&style=flat "GitHub: hugoalh/deno-nodejs-transformer")](https://github.com/hugoalh/deno-nodejs-transformer)
[![JSR: @hugoalh/deno-nodejs-transformer](https://img.shields.io/jsr/v/@hugoalh/deno-nodejs-transformer?label=@hugoalh/deno-nodejs-transformer&labelColor=F7DF1E&logo=jsr&logoColor=000000&style=flat "JSR: @hugoalh/deno-nodejs-transformer")](https://jsr.io/@hugoalh/deno-nodejs-transformer)

Transform Deno code to NodeJS code.

Currently, this is a modified edition of the [Deno DNT](https://github.com/denoland/dnt) which:

- Always force with ECMAScript module
- Improve file structure
- Unify configuration

## 🔰 Begin

### Deno

- **[Deno](https://deno.land/)** >= v2.5.2
  - Raw Imports (`raw-imports`)

#### #️⃣ Sources

- GitHub Raw
  ```
  https://raw.githubusercontent.com/hugoalh/deno-nodejs-transformer/{Tag}/mod.ts
  ```
  > [!NOTE]
  > - It is possible to use via sub paths, but do not use any of these due to these are not considered part of the public API:
  >   - it's path has an underscore prefix (e.g.: `_foo.ts`, `_util/bar.ts`)
  >   - it is a benchmark or test file (e.g.: `foo.bench.ts`, `foo.test.ts`)
  >   - it's symbol has an underscore prefix (e.g.: `_bar`, `_foo`)
- JSR
  ```
  jsr:@hugoalh/deno-nodejs-transformer[@{Tag}]
  ```
  > [!NOTE]
  > - It is recommended to include tag for immutability.

#### ⤵️ Entrypoints

| **Name** | **Path** | **Description** |
|:--|:--|:--|
| `.` | `./mod.ts` | Main |

#### 🛡️ Runtime Permissions

- Environment Variable (`env`)
  - *Resources*
- File System - Read (`read`)
  - *Resources*
- File System - Write (`write`)
  - *Resources*
- Network (`net`)
  - *Resources*

#### 🧩 APIs

- ```ts
  function invokeDenoNodeJSTransformer(options: DenoNodeJSTransformerOptions): Promise<void>;
  ```
- ```ts
  interface DenoNodeJSTransformerOptions {
    copyEntries?: readonly (string | RegExp | DenoNodeJSTransformerCopyEntriesOptions)[];
    entrypointsExecutable?: Record<string, string>;
    entrypointsScript?: Record<string, string>;
    fixDenoDNTModifications?: boolean;
    generateDeclaration?: boolean;
    generateDeclarationMap?: boolean;
    importsMap?: string;
    lib?: LibName[];
    mappings?: SpecifierMappings;
    metadata: Metadata;
    outputDirectory?: string;
    outputDirectoryPreEmpty?: boolean;
    shims?: DenoNodeJSTransformerShimOptions;
    target?: ScriptTarget;
    useTSLibHelper?: boolean;
    workspace?: string;
  }
  ```

> [!NOTE]
> - For the full or prettier documentation, can visit via:
>   - [Deno CLI `deno doc`](https://docs.deno.com/runtime/reference/cli/doc/)
>   - [JSR](https://jsr.io/@hugoalh/deno-nodejs-transformer)

#### ✍️ Examples

- ```ts
  await invokeDenoNodeJSTransformer({
    copyEntries: [
      /^LICENSE(?:[-\._][^\/\\]+)?\.md$/i,
      /^README(?:[-\._][^\/\\]+)?\.md$/i
    ],
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
    outputDirectory: "dist/npm",
    outputDirectoryPreEmpty: true
  });
  ```
