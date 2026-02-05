//deno-lint-ignore-file -- Vendor
// Copyright 2018-2024 the Deno authors. MIT license.

import * as colors from "jsr:@std/fmt@^1.0.8/colors";
import { dirname as getPathDirname, join as joinPath } from "node:path";
import { pathToFileURL } from "node:url";
import { createProjectSync, ts } from "jsr:@ts-morph/bootstrap@^0.27.0";
import {
	getCompilerLibOption,
	getCompilerScriptTarget,
	getCompilerSourceMapOptions,
	type LibName,
	libNamesToCompilerOption,
	outputDiagnostics,
	type SourceMapOptions,
} from "./lib/compiler.ts";
import { type ShimOptions, shimOptionsToTransformShims } from "./lib/shims.ts";
import type { PackageJson, ScriptTarget } from "./lib/types.ts";
import { glob, standardizePath } from "./lib/utils.ts";
import {
	type SpecifierMappings,
	transform,
	type TransformOutput,
} from "./transform.ts";
import * as compilerTransforms from "./lib/compiler_transforms.ts";
import { getPackageJson } from "./lib/package_json.ts";

export { emptyDir } from "jsr:@std/fs@^1.0.19/empty-dir";
export type { PackageJson } from "./lib/types.ts";
export type { LibName, SourceMapOptions } from "./lib/compiler.ts";
export type { ShimOptions } from "./lib/shims.ts";

export interface EntryPoint {
	/**
	 * If the entrypoint is for an npm binary or export.
	 * @default "export"
	 */
	kind?: "bin" | "export";
	/** Name of the entrypoint in the "binary" or "exports". */
	name: string;
	/** Path to the entrypoint. */
	path: string;
}

export interface BuildOptions {
	/** Entrypoint(s) to the Deno module. Ex. `./mod.ts` */
	entryPoints: (string | EntryPoint)[];
	/** Directory to output to. */
	outDir: string;
	/** Shims to use. */
	shims: ShimOptions;
	/** Type check the output.
	 * * `"both"` - Type checks both the ESM and script modules separately. This
	 *   is the recommended option when publishing a dual ESM and script package,
	 *   but it runs slower so it's not the default.
	 * * `"single"` - Type checks the ESM module only or the script module if not emitting ESM.
	 * * `false` - Do not type check the output.
	 * @default "single"
	 */
	typeCheck?: "both" | "single" | false;
	/** Collect and run test files.
	 * @default true
	 */
	test?: boolean;
	/** Create declaration files.
	 *
	 * * `"inline"` - Emit declaration files beside the .js files in both
	 *   the esm and script folders. This is the recommended option when publishing
	 *   a dual ESM and script package to npm.
	 * * `"separate"` - Emits declaration files to the `types` folder where both
	 *   the ESM and script code share the same type declarations.
	 * * `false` - Do not emit declaration files.
	 * @default "inline"
	 */
	declaration?: "inline" | "separate" | false;
	/** Create declaration map files. Defaults to `true` if `declaration` is enabled and `skipSourceOutput` is `false`.
	 */
	declarationMap?: boolean;
	/** Include a CommonJS or UMD module.
	 * @default "cjs"
	 */
	scriptModule?: "cjs" | "umd" | false;
	/** Whether to emit an ES module.
	 * @default true
	 */
	esModule?: boolean;
	/** Skip running `npm install`.
	 * @default false
	 */
	skipNpmInstall?: boolean;
	/** Skip outputting the canonical TypeScript in the output directory before emitting.
	 * @default false
	 */
	skipSourceOutput?: boolean;
	/** Root directory to find test files in. Defaults to the cwd. */
	rootTestDir?: string;
	/** Glob pattern to use to find tests files. Defaults to `deno test`'s pattern. */
	testPattern?: string;
	/**
	 * Specifiers to map from and to.
	 *
	 * This can be used to create a node specific file:
	 *
	 * ```
	 * mappings: {
	 *   "./file.deno.ts": "./file.node.ts",
	 * }
	 * ```
	 *
	 * Or map a specifier to an npm package:
	 *
	 * ```
	 * mappings: {
	 * "https://deno.land/x/code_block_writer@11.0.0/mod.ts": {
	 *   name: "code-block-writer",
	 *   version: "^11.0.0",
	 * }
	 * ```
	 */
	mappings?: SpecifierMappings;
	/** Package.json output. You may override dependencies and dev dependencies in here. */
	package: PackageJson;
	/** Path or url to a deno.json. */
	configFile?: string;
	/** Path or url to import map. */
	importMap?: string;
	/** Package manager used to install dependencies and run npm scripts.
	 * This also can be an absolute path to the executable file of package manager.
	 * @default "npm"
	 */
	packageManager?: "npm" | "yarn" | "pnpm" | string;
	/** Optional TypeScript compiler options. */
	compilerOptions?: {
		/** Uses tslib to import helper functions once per project instead of including them per-file if necessary.
		 * @default false
		 */
		importHelpers?: boolean;
		stripInternal?: boolean;
		strictBindCallApply?: boolean;
		strictFunctionTypes?: boolean;
		strictNullChecks?: boolean;
		strictPropertyInitialization?: boolean;
		noImplicitAny?: boolean;
		noImplicitReturns?: boolean;
		noImplicitThis?: boolean;
		noStrictGenericChecks?: boolean;
		noUncheckedIndexedAccess?: boolean;
		target?: ScriptTarget;
		/**
		 * Use source maps from the canonical typescript to ESM/CommonJS emit.
		 *
		 * Specify `true` to include separate files or `"inline"` to inline the source map in the same file.
		 * @remarks Using this option will cause your sources to be included in the npm package.
		 * @default false
		 */
		sourceMap?: SourceMapOptions;
		/**
		 * Whether to include the source file text in the source map when using source maps.
		 * @remarks It's not recommended to do this if you are distributing both ESM and CommonJS
		 * sources as then it will duplicate the the source data being published.
		 */
		inlineSources?: boolean;
		/** Default set of library options to use. See https://www.typescriptlang.org/tsconfig/#lib */
		lib?: readonly LibName[];
		/**
		 * Skip type checking of declaration files (those in dependencies).
		 * @default true
		 */
		skipLibCheck?: boolean;
		/**
		 * @default false
		 */
		emitDecoratorMetadata?: boolean;
		/**
		 * Enable experimental support for legacy experimental decorators.
		 *
		 * See more: https://www.typescriptlang.org/tsconfig#experimentalDecorators
		 * @remarks This is false by default. To use the ts decorators, set this to `true`.
		 * @default false
		 */
		experimentalDecorators?: boolean;
		useUnknownInCatchVariables?: boolean;
	};
	/** Filter out diagnostics that you want to ignore during type checking and emitting.
	 * @returns `true` to surface the diagnostic or `false` to ignore it.
	 */
	filterDiagnostic?: (diagnostic: ts.Diagnostic) => boolean;
	/** Action to do after emitting and before running tests. */
	postBuild?: () => void | Promise<void>;
}

/** Builds the specified Deno module to an npm package using the TypeScript compiler. */
export async function build(options: BuildOptions): Promise<void> {
	// set defaults
	options = {
		...options,
		outDir: standardizePath(options.outDir),
		entryPoints: options.entryPoints,
		scriptModule: false,
		esModule: true,
		typeCheck: false,
		test: false,
		declaration: (options.declaration as boolean) === true
			? "inline"
			: options.declaration ?? "inline",
	};
	const cwd = Deno.cwd();
	const declarationMap = options.declarationMap ??
		(!!options.declaration && !options.skipSourceOutput);
	const scriptTarget = options.compilerOptions?.target ?? "ES2021";
	const entryPoints: EntryPoint[] = options.entryPoints.map((e, i) => {
		if (typeof e === "string") {
			return {
				name: i === 0 ? "." : e.replace(/\.tsx?$/i, ".js"),
				path: standardizePath(e),
			};
		} else {
			return {
				...e,
				path: standardizePath(e.path),
			};
		}
	});

	await Deno.permissions.request({ name: "write", path: options.outDir });

	log("Transforming...");
	const transformOutput = await transformEntryPoints();
	for (const warning of transformOutput.warnings) {
		warn(warning);
	}

	const createdDirectories = new Set<string>();
	const writeFile = (filePath: string, fileText: string) => {
		const dir = getPathDirname(filePath);
		if (!createdDirectories.has(dir)) {
			Deno.mkdirSync(dir, { recursive: true });
			createdDirectories.add(dir);
		}
		Deno.writeTextFileSync(filePath, fileText);
	};

	createPackageJson();

	log("Building project...");
	const esmOutDir = options.outDir;
	const typesOutDir = joinPath(options.outDir, "types");
	const compilerScriptTarget = getCompilerScriptTarget(scriptTarget);
	const project = createProjectSync({
		compilerOptions: {
			outDir: typesOutDir,
			allowJs: true,
			alwaysStrict: true,
			stripInternal: options.compilerOptions?.stripInternal,
			strictBindCallApply: options.compilerOptions?.strictBindCallApply ?? true,
			strictFunctionTypes: options.compilerOptions?.strictFunctionTypes ?? true,
			strictNullChecks: options.compilerOptions?.strictNullChecks ?? true,
			strictPropertyInitialization: options.compilerOptions?.strictPropertyInitialization ?? true,
			suppressExcessPropertyErrors: false,
			suppressImplicitAnyIndexErrors: false,
			noImplicitAny: options.compilerOptions?.noImplicitAny ?? true,
			noImplicitReturns: options.compilerOptions?.noImplicitReturns ?? false,
			noImplicitThis: options.compilerOptions?.noImplicitThis ?? true,
			noStrictGenericChecks: options.compilerOptions?.noStrictGenericChecks ?? false,
			noUncheckedIndexedAccess: options.compilerOptions?.noUncheckedIndexedAccess ?? false,
			declaration: !!options.declaration,
			declarationMap,
			esModuleInterop: false,
			isolatedModules: true,
			useDefineForClassFields: true,
			experimentalDecorators: options.compilerOptions?.experimentalDecorators ?? false,
			emitDecoratorMetadata: options.compilerOptions?.emitDecoratorMetadata ?? false,
			jsx: ts.JsxEmit.React,
			jsxFactory: "React.createElement",
			jsxFragmentFactory: "React.Fragment",
			importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
			module: ts.ModuleKind.ESNext,
			moduleResolution: ts.ModuleResolutionKind.Bundler,
			target: compilerScriptTarget,
			lib: libNamesToCompilerOption(options.compilerOptions?.lib ?? getCompilerLibOption(scriptTarget)),
			allowSyntheticDefaultImports: true,
			importHelpers: options.compilerOptions?.importHelpers,
			...getCompilerSourceMapOptions(options.compilerOptions?.sourceMap),
			inlineSources: options.compilerOptions?.inlineSources,
			skipLibCheck: options.compilerOptions?.skipLibCheck ?? true,
			useUnknownInCatchVariables: options.compilerOptions?.useUnknownInCatchVariables ?? false,
		},
	});

	const binaryEntryPointPaths = new Set(
		entryPoints.map((e, i) => ({
			kind: e.kind,
			path: transformOutput.main.entryPoints[i],
		})).filter((p) => p.kind === "bin").map((p) => p.path),
	);

	for (
		const outputFile of [
			...transformOutput.main.files,
			...transformOutput.test.files,
		]
	) {
		const outputFilePath = joinPath(
			options.outDir,
			"src",
			outputFile.filePath,
		);
		const outputFileText = binaryEntryPointPaths.has(outputFile.filePath)
			? `#!/usr/bin/env node\n${outputFile.fileText.replace(/^#![^\n\r]*\r?\n?/, "")
			}`
			: outputFile.fileText;
		project.createSourceFile(
			outputFilePath,
			outputFileText,
		);
	}

	let program = getProgramAndMaybeTypeCheck("ESM");

	// emit the esm files
	log("Emitting ESM package...");
	project.compilerOptions.set({
		declaration: options.declaration === "inline",
		declarationMap: declarationMap ? options.declaration === "inline" : false,
		outDir: esmOutDir,
	});
	program = project.createProgram();
	emit({
		transformers: {
			before: [compilerTransforms.transformImportMeta],
		},
	});

	log("Complete!");

	function emit(
		opts?: { onlyDtsFiles?: boolean; transformers?: ts.CustomTransformers; },
	) {
		const emitResult = program.emit(
			undefined,
			(filePath, data, writeByteOrderMark) => {
				if (writeByteOrderMark) {
					data = "\uFEFF" + data;
				}
				writeFile(filePath, data);
			},
			undefined,
			opts?.onlyDtsFiles,
			opts?.transformers,
		);

		if (emitResult.diagnostics.length > 0) {
			outputDiagnostics(emitResult.diagnostics);
			throw new Error(`Had ${emitResult.diagnostics.length} emit diagnostics.`);
		}
	}

	function getProgramAndMaybeTypeCheck(current: "ESM" | "script") {
		// When creating the program and type checking, we need to ensure that
		// the cwd is the directory that contains the node_modules directory
		// so that TypeScript will read it and resolve any @types/ packages.
		// This is done in `getAutomaticTypeDirectiveNames` of TypeScript's code.
		const originalDir = Deno.cwd();
		let program: ts.Program;
		Deno.chdir(options.outDir);
		try {
			program = project.createProgram();

			return program;
		} finally {
			Deno.chdir(originalDir);
		}

	}

	function createPackageJson() {
		if (options.package?.files != null) {
			warn(
				"Specifying `files` for the package.json is not recommended " +
				"because it will cause the .npmignore file to not be respected.",
			);
		}

		const packageJsonObj = getPackageJson({
			entryPoints,
			transformOutput,
			package: options.package,
			testEnabled: options.test,
			includeEsModule: options.esModule !== false,
			includeScriptModule: options.scriptModule !== false,
			includeDeclarations: options.declaration === "separate",
			includeTsLib: options.compilerOptions?.importHelpers,
			shims: options.shims,
		});
		writeFile(
			joinPath(options.outDir, "package.json"),
			JSON.stringify(packageJsonObj, undefined, 2),
		);
	}


	async function transformEntryPoints(): Promise<TransformOutput> {
		const { shims, testShims } = shimOptionsToTransformShims(options.shims);
		return transform({
			entryPoints: entryPoints.map((e) => e.path),
			testEntryPoints: options.test
				? await glob({
					pattern: getTestPattern(),
					rootDir: options.rootTestDir ?? Deno.cwd(),
					excludeDirs: [options.outDir],
				})
				: [],
			shims,
			testShims,
			mappings: options.mappings,
			target: scriptTarget,
			importMap: options.importMap,
			configFile: options.configFile,
			cwd: pathToFileURL(cwd).toString(),
		});
	}

	function log(message: string) {
		console.log(`[dnt] ${message}`);
	}

	function warn(message: string) {
		console.warn(colors.yellow(`[dnt] ${message}`));
	}


	function getTestPattern() {
		// * named `test.{ts, mts, tsx, js, mjs, jsx}`,
		// * or ending with `.test.{ts, mts, tsx, js, mjs, jsx}`,
		// * or ending with `_test.{ts, mts, tsx, js, mjs, jsx}`
		return options.testPattern ??
			"**/{test.{ts,mts,tsx,js,mjs,jsx},*.test.{ts,mts,tsx,js,mjs,jsx},*_test.{ts,mts,tsx,js,mjs,jsx}}";
	}
}
