/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
module.exports = {
	testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
	testEnvironment: 'node',
	collectCoverage: true,
	coverageProvider: 'v8',
	coverageDirectory: 'coverage',
	coverageReporters: ['html', 'text', 'clover'],
	coverageThreshold: {
		global: {
			branches: 80,
			functions: 70,
			lines: 80,
			statements: 80,
		},
	},
	roots: ['<rootDir>packages/'],
	coveragePathIgnorePatterns: [
		'/node_modules/', //
		'<rootDir>/packages/rest/src/index.ts',
	],
};
