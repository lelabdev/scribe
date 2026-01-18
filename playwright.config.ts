import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: { command: 'bun dev', port: 5173, reuseExistingServer: true },
	testDir: 'e2e',
	use: {
		baseURL: 'http://localhost:5173'
	}
});
