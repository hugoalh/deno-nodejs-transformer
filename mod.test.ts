import { invokeDenoNodeJSTransformer } from "./mod.ts";
Deno.test("Main", {
	permissions: {
		env: true,
		net: true,
		read: true,
		write: true
	}
}, async () => {
	await invokeDenoNodeJSTransformer({
		copyAssets: [
			"LICENSE.md",
			"README.md"
		],
		entrypoints: [{
			name: ".",
			path: "./mod.ts"
		}],
		generateDeclarationMap: true,
		metadata: {
			name: "@hugoalh/deno-nodejs-transformer-test",
			version: "0.6.0",
			description: "Demo of Deno NodeJS Transformer.",
			keywords: [
				"dnt",
				"test"
			],
			homepage: "https://github.com/hugoalh/deno-nodejs-transformer#readme",
			bugs: {
				url: "https://github.com/hugoalh/deno-nodejs-transformer/issues"
			},
			license: "MIT",
			author: "hugoalh",
			repository: {
				type: "git",
				url: "git+https://github.com/hugoalh/deno-nodejs-transformer.git"
			},
			scripts: {
			},
			engines: {
				node: ">=16.13.0"
			},
			private: false,
			publishConfig: {
				access: "public"
			}
		},
		outputDirectory: "npm",
		outputDirectoryPreEmpty: true
	});
});
