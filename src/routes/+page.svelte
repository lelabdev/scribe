<script lang="ts">
	import { goto } from '$app/navigation';

	let category = $state<'official' | 'creative'>('official');
	let uploading = $state(false);
	let processing = $state(false);
	let error = $state<string | null>(null);

	async function handleUpload(event: Event) {
		event.preventDefault();
		error = null;
		uploading = true;

		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);

		try {
			const response = await fetch('/?/uploadFile', {
				method: 'POST',
				body: formData
			});

			const result = (await response.json()) as Record<string, unknown>;

			if (result.success && result.url && result.filePath) {
				uploading = false;
				await processOCR(result.url as string, result.filePath as string);
			} else {
				uploading = false;
				error = (result.error as string) || "Erreur lors de l'upload";
			}
		} catch (err) {
			console.error('Upload error:', err);
			uploading = false;
			error = 'Erreur de connexion. Veuillez réessayer.';
		}
	}

	async function processOCR(url: string, path: string) {
		error = null;
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

			if (result.data) {
				processing = false;
				// eslint-disable-next-line svelte/no-navigation-without-resolve
				goto('/validate', {
					state: {
						imageUrl: url,
						filePath: path,
						ocrData: result.data
					}
				});
			} else {
				processing = false;
				error = (result.error as string) || 'Erreur lors du traitement OCR';
			}
		} catch (err) {
			console.error('OCR error:', err);
			processing = false;
			error = 'Erreur de connexion au service OCR. Veuillez réessayer.';
		}
	}
</script>

<div class="container mx-auto max-w-2xl px-4 py-8">
	<h1 class="mb-8 text-center text-3xl font-bold">OCR Scanner</h1>

	<div class="mb-8">
		<div class="mb-6 flex justify-center gap-4">
			<button
				type="button"
				class="rounded-lg px-6 py-3 font-medium transition-colors {category === 'official'
					? 'bg-blue-500 text-white'
					: 'bg-gray-200 text-gray-700'}"
				onclick={() => (category = 'official')}
			>
				Doc Officiel
			</button>
			<button
				type="button"
				class="rounded-lg px-6 py-3 font-medium transition-colors {category === 'creative'
					? 'bg-purple-500 text-white'
					: 'bg-gray-200 text-gray-700'}"
				onclick={() => (category = 'creative')}
			>
				Recette / Note
			</button>
		</div>

		{#if error}
			<div class="mb-6 rounded-lg bg-red-100 p-4 text-red-800" role="alert">
				<p class="font-semibold">Erreur</p>
				<p>{error}</p>
				<button
					type="button"
					class="mt-2 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
					onclick={() => (error = null)}
				>
					Réessayer
				</button>
			</div>
		{/if}

		{#if uploading}
			<div class="py-8 text-center">
				<div class="mb-4 flex justify-center">
					<div
						class="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"
					></div>
				</div>
				<p class="text-gray-600">Upload en cours...</p>
			</div>
		{:else if processing}
			<div class="py-8 text-center">
				<div class="mb-4 flex justify-center">
					<div
						class="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"
					></div>
				</div>
				<p class="text-gray-600">Traitement OCR en cours...</p>
				<p class="mt-2 text-sm text-gray-500">Cela peut prendre quelques secondes</p>
			</div>
		{:else}
			<form method="POST" action="/?/uploadFile" onsubmit={handleUpload}>
				<div
					class="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-gray-400"
				>
					<label for="file" class="block cursor-pointer">
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
						<p class="mb-2 text-lg text-gray-700">Cliquez ou glissez une image</p>
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
					disabled={uploading || processing}
					class="mt-6 w-full rounded-lg bg-blue-500 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
				>
					Scanner le document
				</button>
			</form>
		{/if}
	</div>
</div>
