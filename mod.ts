import { copy as copyFS } from "jsr:@std/fs@^1.0.19/copy";
import { emptyDir as emptyFSDir } from "jsr:@std/fs@^1.0.19/empty-dir";
import { ensureDir as ensureFSDir } from "jsr:@std/fs@^1.0.19/ensure-dir";
import { join as joinPath } from "node:path";
import { walk } from "https://raw.githubusercontent.com/hugoalh/fs-es/v0.4.0/walk.ts";
import {
	refactorMetadata,
	resolveEntrypoints,
	type Metadata,
} from "./_metadata.ts";
import {
	resolveDNTShimsOptions,
	type DenoNodeJSTransformerShimOptions
} from "./_shims.ts";
import {
	build,
	type LibName,
	type ScriptTarget,
	type SpecifierMappings
} from "./deps.ts";
export interface DenoNodeJSTransformerCopyAssetsOptions {
	from: string;
	to: string;
}
export interface DenoNodeJSTransformerOptions {
	/**
	 * Copy assets after the build, by relative path under the {@linkcode workspace}.
	 */
	copyAssets?: readonly (string | DenoNodeJSTransformerCopyAssetsOptions)[];
	/**
	 * Entrypoints of the executable.
	 */
	entrypointsExecutable?: Record<string, string>;
	/**
	 * Entrypoints of the script.
	 */
	entrypointsScript?: Record<string, string>;
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
	 * Imports map, by relative file path under the {@linkcode workspace}.
	 */
	importsMap?: string;
	/**
	 * Default set of library options to use. See https://www.typescriptlang.org/tsconfig/#lib.
	 */
	lib?: readonly LibName[];
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
	 * Directory of the output, by relative directory path under the {@linkcode workspace}.
	 * @default {"nodejs"}
	 */
	outputDirectory?: string;
	/**
	 * Whether to empty the {@linkcode outputDirectory} before the transform.
	 * @default {false}
	 */
	outputDirectoryPreEmpty?: boolean;
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
	 * Whether to use {@linkcode https://github.com/Microsoft/tslib TSLib} to import helper functions once per project instead of include them per-file if necessary.
	 * @default {false}
	 */
	useTSLibHelper?: boolean;
	/**
	 * Workspace, by absolute directory path.
	 * @default {Deno.cwd()}
	 */
	workspace?: string;
}
function chdirDispose(directory: string | URL) {
	const original: string = Deno.cwd();
	Deno.chdir(directory);
	return {
		[Symbol.dispose]() {
			Deno.chdir(original);
		}
	};
}
export async function invokeDenoNodeJSTransformer(options: DenoNodeJSTransformerOptions): Promise<void> {
	const {
		copyAssets = [],
		entrypointsExecutable = {},
		entrypointsScript = {},
		fixInjectedImports = false,
		generateDeclaration = true,
		generateDeclarationMap = false,
		importsMap,
		lib,
		mappings,
		metadata,
		outputDirectory = "nodejs",
		outputDirectoryPreEmpty = false,
		shims,
		target = "ES2022",
		useTSLibHelper = false,
		workspace = Deno.cwd()
	}: DenoNodeJSTransformerOptions = options;
	using _ = chdirDispose(workspace);
	await ensureFSDir(outputDirectory);
	if (outputDirectoryPreEmpty) {
		await emptyFSDir(outputDirectory);
	}
	const entrypointsFmt = resolveEntrypoints(entrypointsExecutable, entrypointsScript, generateDeclaration);
	await build({
		compilerOptions: {
			emitDecoratorMetadata: false,
			experimentalDecorators: false,
			importHelpers: useTSLibHelper,
			inlineSources: false,
			lib,
			noImplicitAny: false,
			noImplicitReturns: false,
			noImplicitThis: false,
			noStrictGenericChecks: false,
			noUncheckedIndexedAccess: false,
			skipLibCheck: true,
			sourceMap: false,
			strictBindCallApply: false,
			strictFunctionTypes: false,
			strictNullChecks: false,
			strictPropertyInitialization: false,
			stripInternal: false,
			target,
			useUnknownInCatchVariables: false
		},
		declaration: generateDeclaration ? "inline" : false,
		declarationMap: generateDeclarationMap,
		entryPoints: entrypointsFmt.dnt,
		esModule: true,
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
			const shebang: readonly string[] = Array.from(contextModified.matchAll(regexpShebangs), (match: RegExpExecArray): string => {
				return match[0];
			});
			// DNT polyfills should only have at most 1 after deduplicate, but no need to care in here, likely engine fault.
			const dntPolyfills: Set<string> = new Set<string>(Array.from(contextModified.matchAll(regexpImportDNTPolyfills), (match: RegExpExecArray): string => {
				return match[0];
			}));
			// DNT shims should only have at most 1 after deduplicate, but no need to care in here, likely engine fault.
			const dntShims: Set<string> = new Set<string>(Array.from(contextModified.matchAll(regexpImportDNTShims), (match: RegExpExecArray): string => {
				return match[0];
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
}
export default invokeDenoNodeJSTransformer;
