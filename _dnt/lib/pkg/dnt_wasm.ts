//deno-lint-ignore-file -- Vendor

import * as wasm from "./dnt_wasm.wasm";
export * from "./dnt_wasm.internal.js";
import { __wbg_set_wasm } from "./dnt_wasm.internal.js";
__wbg_set_wasm(wasm);
wasm.__wbindgen_start();
