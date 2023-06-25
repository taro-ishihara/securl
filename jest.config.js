module.exports = {
	transform: {
		'^.+\\.(ts|tsx)$': 'esbuild-jest',
	},
	testEnvironment: 'miniflare',
	testEnvironmentOptions: {
		scriptPath: './src/index.ts',
		bindings: { KEY: 'value', env: 'test', c: 'env' },
		kvNamespaces: ['URL_MAPPINGS'],
	},
}
