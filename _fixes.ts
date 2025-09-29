const regexpImportDNTPolyfills = /^import ".+?\/_dnt\.polyfills\.js";\r?\n/gm;
const regexpImportDNTShims = /^import .*?dntShim from ".+?\/_dnt\.shims\.js";\r?\n/gm;
const regexpShebangs = /^#!.+?\r?\n/g;
export async function fixDenoDNTModification(filePath: string | URL): Promise<void> {
	const original: string = await Deno.readTextFile(filePath);
	let modified: string = structuredClone(original);
	// Shebang should only have at most 1, but no need to care in here.
	const shebang: readonly string[] = Array.from(modified.matchAll(regexpShebangs), (match: RegExpExecArray): string => {
		return match[0];
	});
	// DNT polyfills should only have at most 1 after deduplicate, but no need to care in here, likely engine fault.
	const dntPolyfills: Set<string> = new Set<string>(Array.from(modified.matchAll(regexpImportDNTPolyfills), (match: RegExpExecArray): string => {
		return match[0];
	}));
	// DNT shims should only have at most 1 after deduplicate, but no need to care in here, likely engine fault.
	const dntShims: Set<string> = new Set<string>(Array.from(modified.matchAll(regexpImportDNTShims), (match: RegExpExecArray): string => {
		return match[0];
	}));
	if (
		dntPolyfills.size > 0 ||
		dntShims.size > 0
	) {
		modified = `${shebang.join("")}${Array.from(dntPolyfills.values()).join("")}${Array.from(dntShims.values()).join("")}${modified.replaceAll(regexpShebangs, "").replaceAll(regexpImportDNTPolyfills, "").replaceAll(regexpImportDNTShims, "")}`;
	}
	if (modified !== original) {
		await Deno.writeTextFile(filePath, modified, { create: false });
	}
}
