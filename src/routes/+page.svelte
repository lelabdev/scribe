<script lang="ts">
	import { goto } from '$app/navigation';

	let category = $state<'official' | 'creative'>('official');
	let uploading = $state(false);
	let processing = $state(false);

	async function handleUpload(event: Event) {
		event.preventDefault();
		uploading = true;

		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);

		try {
			const response = await fetch('/?/uploadFile', {
				method: 'POST',
				body: formData
			});

			const result = (await response.json()) as Record<string, unknown>;
			uploading = false;

			if (result.success && result.url && result.filePath) {
				await processOCR(result.url as string, result.filePath as string);
			}
		} catch (error) {
			console.error('Upload error:', error);
			uploading = false;
		}
	}

	async function processOCR(url: string, path: string) {
		processing = true;

		const formData = new FormData();
		formData.append('imageUrl', url);
		formData.append('category', category);

		try {
			const response = await fetch('/?/processOCR', {
				method: 'POST',
				body: formData
			});

			const result = (await response.json()) as Record<string, unknown>;
			processing = false;

			if (result.data) {
				// eslint-disable-next-line svelte/no-navigation-without-resolve
				goto('/validate', {
					state: {
						imageUrl: url,
						filePath: path,
						ocrData: result.data
					}
				});
			}
		} catch (error) {
			console.error('OCR error:', error);
			processing = false;
		}
	}
</script>

<div class="container mx-auto px-4 py-8 max-w-2xl">
	<h1 class="text-3xl font-bold mb-8 text-center">OCR Scanner</h1>

	<div class="mb-8">
		<div class="flex justify-center gap-4 mb-6">
			<button
				type="button"
				class="px-6 py-3 rounded-lg font-medium transition-colors {category === 'official'
					? 'bg-blue-500 text-white'
					: 'bg-gray-200 text-gray-700'}"
				onclick={() => (category = 'official')}
			>
				Doc Officiel
			</button>
			<button
				type="button"
				class="px-6 py-3 rounded-lg font-medium transition-colors {category === 'creative'
					? 'bg-purple-500 text-white'
					: 'bg-gray-200 text-gray-700'}"
				onclick={() => (category = 'creative')}
			>
				Recette / Note
			</button>
		</div>

		{#if uploading}
			<div class="text-center py-8">
				<p class="text-gray-600">Upload en cours...</p>
			</div>
		{:else if processing}
			<div class="text-center py-8">
				<p class="text-gray-600">Traitement OCR en cours...</p>
			</div>
		{:else}
			<form method="POST" action="/?/uploadFile" onsubmit={handleUpload}>
				<div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
					<label for="file" class="cursor-pointer block">
						<div class="mb-4">
							<svg
								class="mx-auto h-12 w-12 text-gray-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
						</div>
						<p class="text-lg text-gray-700 mb-2">Cliquez ou glissez une image</p>
						<p class="text-sm text-gray-500">Formats acceptés : JPG, PNG</p>
					</label>
					<input
						id="file"
						name="file"
						type="file"
						accept="image/*"
						capture="environment"
						class="hidden"
						required
					/>
				</div>

				<button
					type="submit"
					class="w-full mt-6 bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 transition-colors"
				>
					Scanner le document
				</button>
			</form>
		{/if}
	</div>
</div>
