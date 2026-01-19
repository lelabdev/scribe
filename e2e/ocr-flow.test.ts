import { expect, test } from '@playwright/test';

test.describe('OCR Flow', () => {
	test('should display OCR scanner interface', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('h1')).toContainText('OCR Scanner');
		await expect(page.getByText('Official Doc')).toBeVisible();
		await expect(page.getByText('Recipe / Note')).toBeVisible();
	});

	test('should toggle between document categories', async ({ page }) => {
		await page.goto('/');

		const officialButton = page.getByRole('button', { name: 'Official Doc' });
		const creativeButton = page.getByRole('button', { name: 'Recipe / Note' });

		await expect(officialButton).toBeVisible();
		await expect(creativeButton).toBeVisible();

		await creativeButton.click();
		await expect(creativeButton).toBeVisible();

		await officialButton.click();
		await expect(officialButton).toBeVisible();
	});

	test('should show upload interface', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByText('Click or drag an image')).toBeVisible();
		await expect(page.getByText('Accepted formats: JPG, PNG')).toBeVisible();
		await expect(page.getByText('Scan Document')).toBeVisible();
	});
});
