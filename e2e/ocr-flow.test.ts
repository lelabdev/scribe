import { expect, test } from '@playwright/test';

test.describe('OCR Flow', () => {
	test('should display OCR scanner interface', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('h1')).toContainText('OCR Scanner');
		await expect(page.getByText('Doc Officiel')).toBeVisible();
		await expect(page.getByText('Recette / Note')).toBeVisible();
	});

	test('should toggle between document categories', async ({ page }) => {
		await page.goto('/');

		const officialButton = page.getByRole('button', { name: 'Doc Officiel' });
		const creativeButton = page.getByRole('button', { name: 'Recette / Note' });

		await expect(officialButton).toBeVisible();
		await expect(creativeButton).toBeVisible();

		await creativeButton.click();
		await expect(creativeButton).toBeVisible();

		await officialButton.click();
		await expect(officialButton).toBeVisible();
	});

	test('should show upload interface', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByText('Cliquez ou glissez une image')).toBeVisible();
		await expect(page.getByText('Formats acceptés : JPG, PNG')).toBeVisible();
		await expect(page.getByText('Scanner le document')).toBeVisible();
	});
});
