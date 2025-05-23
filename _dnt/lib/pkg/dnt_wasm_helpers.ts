//deno-lint-ignore-file
//@ts-nocheck
import { createCache } from "jsr:@deno/cache-dir@^0.20.0";

const fileFetcher = createCache();

export function fetch_specifier(specifier, cacheSettingVal, checksum) {
	return fileFetcher.load(
		new URL(specifier),
		// seems this is not used by file fetcher
		/* is dynamic */ false,
		getCacheSetting(cacheSettingVal),
		checksum,
	);
}

function getCacheSetting(val) {
	// WARNING: ensure this matches wasm/src/lib.rs
	switch (val) {
		case 1:
			return "use";
		case 2:
			return "reload";
		case 0:
		default:
			return "only";
	}
}
