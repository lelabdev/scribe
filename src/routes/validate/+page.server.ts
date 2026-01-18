import { fail } from '@sveltejs/kit';
import { db } from '$lib/db';
import { documents } from '$lib/db/schema';

export const actions = {
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
