import {
	build,
	type BuildOptions,
	type EntryPoint,
	type LibName,
	type PackageJson,
	type ShimOptions,
	type SourceMapOptions
} from "./_dnt/mod.ts";
import type { 
	Shim,
	SpecifierMappings,
	TransformOutput
} from "./_dnt/transform.ts";
export {
	build,
	type BuildOptions,
	type EntryPoint,
	type LibName,
	type PackageJson,
	type Shim,
	type ShimOptions,
	type SourceMapOptions,
	type SpecifierMappings,
	type TransformOutput
};
export type CompilerOptions = NonNullable<BuildOptions["compilerOptions"]>;
export type ScriptTarget = NonNullable<CompilerOptions["target"]>;
