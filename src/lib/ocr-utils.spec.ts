import { describe, it, expect } from 'vitest';
import { normalizeOCRResponse, parseMistralResponse, extractMindeeData } from './ocr-utils';

describe('normalizeOCRResponse', () => {
	it('should return the response as-is', () => {
		const response = {
			provider: 'mindee',
			type: 'facture',
			data: { amount: '100€' },
			raw_text: 'Invoice 100€'
		};
		const result = normalizeOCRResponse(response);
		expect(result).toEqual(response);
	});
});

describe('parseMistralResponse', () => {
	it('should parse valid JSON without markdown', () => {
		const content = '{"titre": "Recette", "ingredients": ["oeufs"]}';
		const result = parseMistralResponse(content);
		expect(result).toEqual({ titre: 'Recette', ingredients: ['oeufs'] });
	});

	it('should parse JSON with markdown code blocks', () => {
		const content = '```json\n{"titre": "Test", "ingredients": []}\n```';
		const result = parseMistralResponse(content);
		expect(result).toEqual({ titre: 'Test', ingredients: [] });
	});

	it('should handle malformed JSON with error fallback', () => {
		const content = 'invalid json';
		const result = parseMistralResponse(content);
		expect(result).toEqual({
			titre: 'Erreur parsing',
			ingredients: [],
			instructions: '',
			type_document: 'autre'
		});
	});

	it('should handle empty string', () => {
		const content = '';
		const result = parseMistralResponse(content);
		expect(result).toEqual({
			titre: 'Erreur parsing',
			ingredients: [],
			instructions: '',
			type_document: 'autre'
		});
	});

	it('should handle JSON with extra whitespace', () => {
		const content = '\n\n  {"titre": "Test", "ingredients": []}  \n\n';
		const result = parseMistralResponse(content);
		expect(result).toEqual({ titre: 'Test', ingredients: [] });
	});
});

describe('extractMindeeData', () => {
	it('should extract prediction from valid response', () => {
		const result = {
			document: {
				inference: {
					prediction: {
						amount: { value: 100 },
						date: { value: '2024-01-01' }
					}
				}
			}
		};
		const extracted = extractMindeeData(result);
		expect(extracted).toEqual({
			amount: { value: 100 },
			date: { value: '2024-01-01' }
		});
	});

	it('should return empty object when document is missing', () => {
		const result = {};
		const extracted = extractMindeeData(result);
		expect(extracted).toEqual({});
	});

	it('should return empty object when inference is missing', () => {
		const result = { document: {} };
		const extracted = extractMindeeData(result);
		expect(extracted).toEqual({});
	});

	it('should return empty object when prediction is missing', () => {
		const result = { document: { inference: {} } };
		const extracted = extractMindeeData(result);
		expect(extracted).toEqual({});
	});
});
