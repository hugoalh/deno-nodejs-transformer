import type {
	Shim,
	ShimOptions
} from "./_deps.ts";
export interface DenoNodeJSTransformerShimOptions extends Omit<ShimOptions, "customDev" | "domException" | "timers"> {
	/**
	 * Shim `Blob` via `node:buffer`.
	 * 
	 * This property should define to `true` if the target NodeJS version is not 18 or greater.
	 * @default {false}
	 */
	blob?: boolean;
	/**
	 * Shim `crypto`.
	 * 
	 * This property should define to `true` if the target NodeJS version is not 16 or greater.
	 * @default {false}
	 */
	crypto?: boolean;
	/**
	 * Shim `Deno`.
	 * @default {true}
	 */
	deno?: boolean;
	/**
	 * Shim `alert`, `confirm`, and `prompt`.
	 * @default {true}
	 */
	prompts?: boolean;
	/**
	 * Shim `fetch`, `File`, `FormData`, `Headers`, `Request`, and `Response` via {@linkcode https://github.com/nodejs/undici undici}.
	 * 
	 * This property should define to `true` if the target NodeJS version is not 18 or greater.
	 * @default {false}
	 */
	undici?: boolean;
	/**
	 * Shim `WeakRef`.
	 * 
	 * This property should define to `true` if the target NodeJS version is not 14 or greater; Some of the sub features only available on NodeJS version 20 or greater.
	 * @default {false}
	 */
	weakRef?: boolean;
	/**
	 * Shim `WebSocket` via {@linkcode https://github.com/websockets/ws ws}.
	 * 
	 * This property should define to `true` if the target NodeJS version is not 22 or greater.
	 * @default {false}
	 */
	webSocket?: boolean;
	/**
	 * Custom shims.
	 */
	custom?: Shim[];
}
/**
 * Resolve to the DNT shims options.
 * @param {DenoNodeJSTransformerShimOptions} [options={}] Shims options.
 * @returns {ShimOptions} DNT shims options.
 */
export function resolveDNTShimsOptions(options: DenoNodeJSTransformerShimOptions = {}): ShimOptions {
	return {
		blob: options.blob ?? false,
		crypto: options.crypto ?? false,
		deno: options.deno ?? true,
		domException: false,
		prompts: options.prompts ?? true,
		timers: true,
		undici: options.undici ?? false,
		weakRef: options.weakRef ?? false,
		webSocket: options.webSocket ?? false,
		custom: options.custom,
		customDev: []
	};
}
