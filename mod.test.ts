import { transform } from "./mod.ts";
Deno.test("Main", {
	permissions: {
		env: true,
		net: true,
		read: true,
		write: true
	}
}, async () => {
	await transform({
		entrypointsScript: {
			".": "./mod.ts"
		},
		generateDeclarationMap: true,
		metadata: {
			name: "@hugoalh/deno-nodejs-transformer-test",
			version: "0.8.0",
			description: "Demo of Deno NodeJS Transformer.",
			keywords: [
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
			private: false,
			publishConfig: {
				access: "public"
			}
		},
		outputDirectory: "dist/npm",
		outputDirectoryPreEmpty: true,
		workspace: "_test"
	});
});
