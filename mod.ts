import { copy as copyFS } from "jsr:@std/fs@^1.0.19/copy";
import { emptyDir as emptyFSDir } from "jsr:@std/fs@^1.0.19/empty-dir";
import { ensureDir as ensureFSDir } from "jsr:@std/fs@^1.0.19/ensure-dir";
import { join as joinPath } from "node:path";
import { walk } from "https://raw.githubusercontent.com/hugoalh/fs-es/v0.4.0/walk.ts";
import {
	resolveEntrypoints,
	type DenoNodeJSTransformerEntrypoint
} from "./_entrypoints.ts";
import {
	refactorMetadata,
	type Metadata,
} from "./_metadata.ts";
import {
	resolveDNTShimsOptions,
	type DenoNodeJSTransformerShimOptions
} from "./_shims.ts";
import {
	build,
	type BuildOptions,
	type LibName,
	type ScriptTarget,
	type SpecifierMappings
} from "./deps.ts";
export {
	getMetadataFromConfig,
	MetadataFromConfig
} from "./_from_config.ts";
export interface DenoNodeJSTransformerCopyAssetsOptions {
	from: string;
	to: string;
}
export interface DenoNodeJSTransformerOptions {
	/**
	 * Copy assets after the build, by relative path under the {@linkcode root}.
	 */
	copyAssets?: readonly (string | DenoNodeJSTransformerCopyAssetsOptions)[];
	/**
	 * Whether to enable experimental support for emit type metadata for decorators which works with the NPM package {@linkcode https://www.npmjs.com/package/reflect-metadata reflect-metadata}.
	 * @default {false}
	 */
	emitDecoratorMetadata?: boolean;
	/**
	 * Entrypoints of the package.
	 */
	entrypoints: readonly DenoNodeJSTransformerEntrypoint[];
	/**
	 * Filter out diagnostics that want to ignore during type check and emit.
	 * 
	 * Return `true` to surface the diagnostic, or return `false` to ignore it.
	 */
	filterDiagnostic?: BuildOptions["filterDiagnostic"];
	/**
	 * Whether to fix imports injected by the engine which duplicated, unnecessary, or ruined JSDoc.
	 * @default {false}
	 */
	fixInjectedImports?: boolean;
	/**
	 * Whether to generate declaration files (`.d.ts`).
	 * @default {true}
	 */
	generateDeclaration?: boolean;
	/**
	 * Whether to generate declaration map files (`.d.ts.map`).
	 * @default {false}
	 */
	generateDeclarationMap?: boolean;
	/**
	 * Imports map, by relative file path under the {@linkcode root}.
	 */
	importsMap?: string;
	/**
	 * Default set of library options to use. See https://www.typescriptlang.org/tsconfig/#lib.
	 */
	lib?: readonly LibName[];
	/**
	 * Whether to perform type check of declaration files (those in dependencies).
	 * @default {false}
	 */
	libCheck?: boolean;
	/**
	 * Remap specifiers.
	 * 
	 * This can be redirect to a NodeJS specific file:
	 * 
	 * ```ts
	 * {
	 *   mappings: {
	 *     "./file.deno.ts": "./file.node.ts"
	 *   }
	 * }
	 * ```
	 * 
	 * Or remap to an NPM package:
	 * 
	 * ```ts
	 * {
	 *   mappings: {
	 *     "https://deno.land/x/code_block_writer@11.0.0/mod.ts": {
	 *       name: "code-block-writer",
	 *       version: "^11.0.0"
	 *     }
	 *   }
	 * }
	 * ```
	 */
	mappings?: SpecifierMappings;
	/**
	 * Metadata of the NodeJS package (i.e.: `package.json`).
	 */
	metadata: Metadata;
	/**
	 * Directory of the output, by relative directory path under the {@linkcode root}.
	 * @default {"nodejs"}
	 */
	outputDirectory?: string;
	/**
	 * Whether to empty the {@linkcode outputDirectory} before the transform.
	 * @default {false}
	 */
	outputDirectoryPreEmpty?: boolean;
	/**
	 * Workspace, by absolute directory path.
	 * @default {Deno.cwd()}
	 */
	root?: string;
	/**
	 * Shims for NodeJS.
	 */
	shims?: DenoNodeJSTransformerShimOptions;
	/**
	 * Target ECMAScript version.
	 * @default {"ES2022"}
	 */
	target?: ScriptTarget;
	/**
	 * Whether to use NPM package {@linkcode https://www.npmjs.com/package/tslib tslib} to import helper functions once per project instead of include them per-file if necessary.
	 * @default {false}
	 */
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
export async function invokeDenoNodeJSTransformer(options: DenoNodeJSTransformerOptions): Promise<void> {
	const {
		copyAssets = [],
		emitDecoratorMetadata = false,
		entrypoints,
		filterDiagnostic,
		fixInjectedImports = false,
		generateDeclaration = true,
		generateDeclarationMap = false,
		importsMap,
		lib,
		libCheck = false,
		mappings,
		metadata,
		noImplicitAny,
		noImplicitReturns,
		noImplicitThis,
		noStrictGenericChecks,
		noUncheckedIndexedAccess,
		outputDirectory = "nodejs",
		outputDirectoryPreEmpty = false,
		root = Deno.cwd(),
		shims,
		strictBindCallApply,
		strictFunctionTypes,
		strictNullChecks,
		strictPropertyInitialization,
		target = "ES2022",
		useTSLibHelper = false,
		useUnknownInCatchVariables,
	}: DenoNodeJSTransformerOptions = options;
	const rootOriginal: string = Deno.cwd();
	try {
		Deno.chdir(root);
		await ensureFSDir(outputDirectory);
		if (outputDirectoryPreEmpty) {
			await emptyFSDir(outputDirectory);
		}
		const entrypointsFmt = resolveEntrypoints(entrypoints, generateDeclaration);
		await build({
			compilerOptions: {
				emitDecoratorMetadata,
				importHelpers: useTSLibHelper,
				inlineSources: false,
				lib,
				noImplicitAny,
				noImplicitReturns,
				noImplicitThis,
				noStrictGenericChecks,
				noUncheckedIndexedAccess,
				skipLibCheck: !libCheck,
				sourceMap: false,
				strictBindCallApply,
				strictFunctionTypes,
				strictNullChecks,
				strictPropertyInitialization,
				stripInternal: false,
				target,
				useUnknownInCatchVariables
			},
			declaration: generateDeclaration ? "inline" : false,
			declarationMap: generateDeclarationMap,
			entryPoints: entrypointsFmt.dnt,
			esModule: true,
			filterDiagnostic,
			importMap: importsMap,
			mappings,
			outDir: outputDirectory,
			package: metadata,
			scriptModule: false,
			shims: resolveDNTShimsOptions(shims),
			skipNpmInstall: true,
			skipSourceOutput: true,
			test: false,
			typeCheck: false
		});
		for (const subpath of [
			"package-lock.json"
		]) {
			try {
				await Deno.remove(joinPath(outputDirectory, subpath), { recursive: true });
			} catch (error) {
				if (!(error instanceof Deno.errors.NotFound)) {
					console.error(error);
				}
			}
		}
		if (fixInjectedImports) {
			const regexpImportDNTPolyfills = /^import ".+?\/_dnt\.polyfills\.js";\r?\n/gm;
			const regexpImportDNTShims = /^import .*?dntShim from ".+?\/_dnt\.shims\.js";\r?\n/gm;
			const regexpShebangs = /^#!.+?\r?\n/g;
			for await (const { pathRelative } of await walk(outputDirectory, {
				extensions: [".d.ts", ".js"],
				includeDirectories: false,
				includeSymlinkDirectories: false,
				includeSymlinkFiles: false,
				skips: [
					/^_dnt\..+?\.(?:d\.ts|js)$/,
					/^deps[\\\/]/
				]
			})) {
				const pathRelativeRoot: string = joinPath(outputDirectory, pathRelative);
				const contextOriginal: string = await Deno.readTextFile(pathRelativeRoot);
				let contextModified: string = structuredClone(contextOriginal);
				// Shebang should only have at most 1, but no need to care in here.
				const shebang: readonly string[] = Array.from(contextModified.matchAll(regexpShebangs), (v: RegExpExecArray): string => {
					return v[0];
				});
				// DNT polyfills should only have at most 1 after deduplicate, but no need to care in here, likely engine fault.
				const dntPolyfills: Set<string> = new Set<string>(Array.from(contextModified.matchAll(regexpImportDNTPolyfills), (v: RegExpExecArray): string => {
					return v[0];
				}));
				// DNT shims should only have at most 1 after deduplicate, but no need to care in here, likely engine fault.
				const dntShims: Set<string> = new Set<string>(Array.from(contextModified.matchAll(regexpImportDNTShims), (v: RegExpExecArray): string => {
					return v[0];
				}));
				if (
					dntPolyfills.size > 0 ||
					dntShims.size > 0
				) {
					contextModified = `${shebang.join("")}${Array.from(dntPolyfills.values()).join("")}${Array.from(dntShims.values()).join("")}${contextModified.replaceAll(regexpShebangs, "").replaceAll(regexpImportDNTPolyfills, "").replaceAll(regexpImportDNTShims, "")}`;
				}
				if (contextModified !== contextOriginal) {
					await Deno.writeTextFile(pathRelativeRoot, contextModified, { create: false });
				}
			}
		}
		await refactorMetadata({
			entrypoints: entrypointsFmt.metadata,
			metadataPath: joinPath(outputDirectory, "package.json")
		});
		for (const copyAssetsEntry of copyAssets) {
			if (typeof copyAssetsEntry === "string") {
				await copyFS(copyAssetsEntry, joinPath(outputDirectory, copyAssetsEntry), { overwrite: true });
			} else {
				await copyFS(copyAssetsEntry.from, joinPath(outputDirectory, copyAssetsEntry.to), { overwrite: true });
			}
		}
	} finally {
		Deno.chdir(rootOriginal);
	}
}
export default invokeDenoNodeJSTransformer;
