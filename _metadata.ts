import { sortCollectionByKeys } from "https://raw.githubusercontent.com/hugoalh/sort-es/v0.3.0/collection.ts";
import type { EntryPoint } from "./_deps.ts";
export interface MetadataBugs {
	email?: string;
	url?: string;
}
export type MetadataDevEngineOnFail =
	| "error"
	| "ignore"
	| "warn";
export interface MetadataDevEngineEntry {
	name: string;
	version?: string;
	onFail?: MetadataDevEngineOnFail;
}
export interface MetadataDevEngines {
	cpu?: MetadataDevEngineEntry | MetadataDevEngineEntry[];
	libc?: MetadataDevEngineEntry | MetadataDevEngineEntry[];
	os?: MetadataDevEngineEntry | MetadataDevEngineEntry[];
	packageManager?: MetadataDevEngineEntry | MetadataDevEngineEntry[];
	runtime?: MetadataDevEngineEntry | MetadataDevEngineEntry[];
}
export interface MetadataEntrypoints {
	bin?: Record<string, string>;
	main?: string;
	module?: string;
	exports?: {
		[x: string]: {
			[x: string]: {
				types?: string;
				default: string;
			};
		};
	};
	types?: string;
}
export interface MetadataFunding {
	type: string;
	url: string;
}
export interface MetadataPerson {
	name: string;
	email?: string;
	url?: string;
}
export interface MetadataRepository {
	type: string;
	url: string;
	directory?: string;
}
export interface Metadata {
	name: string;
	version: string;
	description?: string;
	keywords?: string[];
	homepage?: string;
	bugs?: string | MetadataBugs;
	license?: string;
	author?: string | MetadataPerson;
	contributors?: (string | MetadataPerson)[];
	funding?: string | MetadataFunding | (string | MetadataFunding)[];
	files?: string[];
	repository?: string | MetadataRepository;
	scripts?: Record<string, string>;
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
	peerDependencies?: Record<string, string>;
	bundleDependencies?: Record<string, string>;
	optionalDependencies?: Record<string, string>;
	engines?: Record<string, string>;
	os?: string[];
	cpu?: string[];
	libc?: string;
	devEngines?: MetadataDevEngines;
	private?: boolean;
	[name: string]: unknown;
}
const metadataKeysDefaultSort: readonly string[] = [
	"name",
	"version",
	"description",
	"keywords",
	"homepage",
	"bugs",
	"license",
	"author",
	"contributors",
	"funding",
	"files",
	"type",
	"bin",
	"main",
	"module",
	"exports",
	"types",
	"man",
	"repository",
	"scripts",
	"config",
	"dependencies",
	"devDependencies",
	"peerDependencies",
	"bundleDependencies",
	"optionalDependencies",
	"overrides",
	"engines",
	"os",
	"cpu",
	"libc",
	"devEngines",
	"private",
	"publishConfig"
];
interface MetadataEntrypointPaths {
	types?: string;
	default: string;
}
function resolveEntrypointPaths(path: string, declaration: boolean): MetadataEntrypointPaths {
	if (!path.startsWith("./")) {
		throw new Error(`Entrypoint path must start with \`./\`!`);
	}
	return {
		types: declaration ? path.replace(/\.(?:m[jt]s|[jt]s|[jt]sx)$/, ".d.ts") : undefined,
		default: path.replace(/\.(?:m[jt]s|[jt]s|[jt]sx)$/, ".js")
	};
}
export function resolveEntrypoints(executables: Record<string, string>, scripts: Record<string, string>, declaration: boolean): {
	dnt: EntryPoint[];
	metadata: MetadataEntrypoints;
} {
	if (Object.entries(executables).length === 0 && Object.entries(scripts).length === 0) {
		throw new ReferenceError(`Entrypoints are not defined!`);
	}
	const executablesFmt: Record<string, MetadataEntrypointPaths> = Object.fromEntries(Object.entries(executables).map(([name, path]: readonly [string, string]): readonly [string, MetadataEntrypointPaths] => {
		if (name.trim() !== name) {
			throw new Error(`Executable name is not well trimmed!`);
		}
		if (name.startsWith(".")) {
			throw new Error(`Executable name must not start with \`.\`!`);
		}
		return [name, resolveEntrypointPaths(path, declaration)];
	}));

	const scriptsFmt: Record<string, MetadataEntrypointPaths> = Object.fromEntries(Object.entries(scripts).map(([name, path]: readonly [string, string]): readonly [string, MetadataEntrypointPaths] => {
		if (name.trim() !== name) {
			throw new Error(`Script name is not well trimmed!`);
		}
		if (!(
			name === "." ||
			name.startsWith("./")
		)) {
			throw new Error(`Script name must be \`.\` or start with \`./\`!`);
		}
		return [name, resolveEntrypointPaths(path, declaration)];
	}));
	const metadataBin = sortCollectionByKeys(Object.fromEntries(Object.entries(executablesFmt).map(([name, { default: pathDefault }]: readonly [string, MetadataEntrypointPaths]): readonly [string, string] => {
		return [name, pathDefault];
	})));
	const matadataExports = sortCollectionByKeys(Object.fromEntries(Object.entries(scriptsFmt).map(([name, paths]: readonly [string, MetadataEntrypointPaths]) => {
		return [name, { import: paths }];
	})) as Record<string, { import: MetadataEntrypointPaths; }>, {
		restPlaceFirst: true,
		specialEntriesKey: ["."]
	});
	return {
		dnt: [
			...Object.entries(executables).map(([name, path]: readonly [string, string]): EntryPoint => {
				return {
					kind: "bin",
					name,
					path
				};
			}),
			...Object.entries(scripts).map(([name, path]: readonly [string, string]): EntryPoint => {
				return {
					kind: "export",
					name,
					path
				};
			})
		],
		metadata: {
			bin: (Object.entries(metadataBin).length > 0) ? metadataBin : undefined,
			main: scriptsFmt["."]?.default,
			module: scriptsFmt["."]?.default,
			exports: (Object.entries(matadataExports).length > 0) ? matadataExports : undefined,
			types: scriptsFmt["."]?.types
		}
	};
}
export interface RefactorMetadataOptions {
	indentation?: number | string;
	sortKeys?: readonly string[];
}
export async function refactorMetadata(filePath: string | URL, entrypoints: MetadataEntrypoints, options: RefactorMetadataOptions = {}): Promise<void> {
	const {
		indentation = "\t",
		sortKeys = metadataKeysDefaultSort
	}: RefactorMetadataOptions = options;
	const metadata = JSON.parse(await Deno.readTextFile(filePath));
	await Deno.writeTextFile(filePath, JSON.stringify(sortCollectionByKeys({
		...metadata,
		...entrypoints,
		type: "module"
	}, { specialEntriesKey: sortKeys }), undefined, indentation));
}
