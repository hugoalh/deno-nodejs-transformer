import {
	walk as fsWalk,
	type WalkEntry,
	type WalkOptions
} from "jsr:@std/fs@^1.0.5/walk";
import { isAbsolute as isPathAbsolute } from "jsr:@std/path@^1.0.8/is-absolute";
import { join as joinPath } from "jsr:@std/path@^1.0.8/join";
import { normalize as normalizePath } from "jsr:@std/path@^1.0.8/normalize";
import { relative as getPathRelative } from "jsr:@std/path@^1.0.8/relative";
export interface FSWalkEntry {
	/**
	 * Whether entry is a regular directory.
	 * 
	 * Mutually exclusive to {@linkcode isFile} and {@linkcode isSymlink}.
	 */
	isDirectory: boolean;
	/**
	 * Whether entry is a regular file.
	 * 
	 * Mutually exclusive to {@linkcode isDirectory} and {@linkcode isSymlink}.
	 */
	isFile: boolean;
	/**
	 * Whether entry is a symlink.
	 * 
	 * Mutually exclusive to {@linkcode isDirectory} and {@linkcode isFile}.
	 */
	isSymlink: boolean;
	/**
	 * Name of the entry.
	 */
	name: string;
	/**
	 * Absolute path of the entry.
	 */
	pathAbsolute: string;
	/**
	 * Root based relative path of the entry.
	 */
	pathRelative: string;
}
async function* walkFSIterator(fsWalker: AsyncIterableIterator<WalkEntry>, pathRootAbsolute: string): AsyncGenerator<FSWalkEntry> {
	for await (const {
		isDirectory,
		isFile,
		isSymlink,
		name,
		path
	} of fsWalker) {
		if (isDirectory && path === pathRootAbsolute) {
			continue;
		}
		yield {
			isDirectory,
			isFile,
			isSymlink,
			name,
			pathAbsolute: path,
			pathRelative: getPathRelative(pathRootAbsolute, path)
		};
	}
}
export function walkFS(pathRoot: string, options: WalkOptions = {}): AsyncGenerator<FSWalkEntry> {
	const pathRootAbsolute: string = normalizePath(isPathAbsolute(pathRoot) ? pathRoot : joinPath(Deno.cwd(), pathRoot));
	return walkFSIterator(fsWalk(pathRootAbsolute, options), pathRootAbsolute);
}
