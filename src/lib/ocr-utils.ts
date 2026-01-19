export function normalizeOCRResponse(response: {
	provider: string;
	type: string;
	data: Record<string, unknown>;
	raw_text: string;
}) {
	return response;
}

export function parseMistralResponse(content: string): Record<string, unknown> {
	try {
		const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
		return JSON.parse(cleanContent);
	} catch {
		return {
			titre: 'Erreur parsing',
			ingredients: [],
			instructions: '',
			type_document: 'autre'
		};
	}
}

export function extractMindeeData(result: Record<string, unknown>): Record<string, unknown> {
	const document = result.document as Record<string, unknown> | undefined;
	const inference = document?.inference as Record<string, unknown> | undefined;
	return (inference?.prediction as Record<string, unknown>) || {};
}
