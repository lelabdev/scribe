import { fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { uploadFile } from '$lib/supabase-storage';
import { db } from '$lib/db';
import { documents } from '$lib/db/schema';
import { normalizeOCRResponse, parseMistralResponse, extractMindeeData } from '$lib/ocr-utils';

export const actions = {
	uploadFile: async ({ request }: { request: Request }) => {
		try {
			const formData = await request.formData();
			const file = formData.get('file') as File;

			if (!file) {
				return fail(400, { error: 'Aucun fichier fourni' });
			}

			const fileExt = file.name.split('.').pop();
			const fileName = `${crypto.randomUUID()}.${fileExt}`;

			const arrayBuffer = await file.arrayBuffer();
			const filePath = await uploadFile(fileName, new Uint8Array(arrayBuffer));

			return { success: true, url: filePath, filePath: fileName };
		} catch (error) {
			console.error('Upload error:', error);
			return fail(500, { error: 'Erreur serveur' });
		}
	},

	processOCR: async ({ request }: { request: Request }) => {
		try {
			const formData = await request.formData();
			const imageUrl = formData.get('imageUrl') as string;
			const category = formData.get('category') as 'official' | 'creative';

			if (!imageUrl || !category) {
				return fail(400, { error: 'Paramètres manquants' });
			}

			let result;

			if (category === 'official') {
				result = await processWithMindee(imageUrl);
			} else {
				result = await processWithMistral(imageUrl);
			}

			return { success: true, data: result };
		} catch (error) {
			console.error('OCR error:', error);
			return fail(500, { error: 'Erreur OCR' });
		}
	},

	saveDocument: async ({ request }: { request: Request }) => {
		try {
			const formData = await request.formData();
			const filePath = formData.get('filePath') as string;
			const provider = formData.get('provider') as 'mindee' | 'mistral';
			const docType = formData.get('docType') as 'facture' | 'cni' | 'recette' | 'autre';
			const metadata = formData.get('metadata') as string;
			const fullText = formData.get('fullText') as string;

			if (!filePath || !provider || !docType) {
				return fail(400, { error: 'Données incomplètes' });
			}

			await db.insert(documents).values({
				id: crypto.randomUUID(),
				userId: crypto.randomUUID(),
				filePath,
				provider,
				docType,
				metadata: JSON.parse(metadata),
				fullText,
				status: 'validated'
			});

			return { success: true };
		} catch (error) {
			console.error('Save error:', error);
			return fail(500, { error: 'Erreur serveur' });
		}
	}
};

async function processWithMindee(imageUrl: string) {
	const mindeeApiKey = env.MINDEE_API_KEY;

	const formData = new FormData();
	formData.append('document', imageUrl);

	const response = await fetch('https://api.mindee.net/v1/products/mindee/invoices/v4/prediction', {
		method: 'POST',
		headers: {
			Authorization: `Token ${mindeeApiKey}`
		},
		body: formData
	});

	if (!response.ok) {
		throw new Error('Mindee API error');
	}

	const result = (await response.json()) as Record<string, unknown>;
	const prediction = extractMindeeData(result);

	return normalizeOCRResponse({
		provider: 'mindee',
		type: 'facture',
		data: prediction,
		raw_text: (prediction?.locale as string) || ''
	});
}

async function processWithMistral(imageUrl: string) {
	const mistralApiKey = env.MISTRAL_API_KEY;

	const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${mistralApiKey}`
		},
		body: JSON.stringify({
			model: 'pixtral-12b-2409',
			messages: [
				{
					role: 'user',
					content: [
						{
							type: 'text',
							text: 'Tu es un OCR expert. Analyse cette image. Retourne UNIQUEMENT un JSON valide avec : { titre, temps_preparation, ingredients (array), instructions, type_document }. Pas de markdown.'
						},
						{
							type: 'image_url',
							image_url: imageUrl
						}
					]
				}
			]
		})
	});

	if (!response.ok) {
		throw new Error('Mistral API error');
	}

	const result = (await response.json()) as Record<string, unknown>;
	const choices = result.choices as Array<Record<string, unknown>> | undefined;
	const firstChoice = choices?.[0] as Record<string, unknown> | undefined;
	const message = firstChoice?.message as Record<string, unknown> | undefined;
	const content = (message?.content as string) || '{}';

	const parsedData = parseMistralResponse(content);

	return normalizeOCRResponse({
		provider: 'mistral',
		type: ((parsedData as Record<string, unknown>).type_document as string) || 'recette',
		data: parsedData,
		raw_text: content
	});
}
