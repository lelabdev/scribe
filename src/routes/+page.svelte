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

<div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-8 sm:px-6 lg:px-8">
	<div class="mx-auto max-w-2xl">
		<div class="mb-8 text-center">
			<h1
				class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl"
			>
				OCR Scanner
			</h1>
			<p class="mt-2 text-gray-600">Scan your documents with AI-powered OCR</p>
		</div>

		<div class="mb-8">
			<div class="flex justify-center gap-3 sm:gap-4">
				<button
					type="button"
					class="flex-1 rounded-xl px-4 py-3 font-medium transition-all duration-200 sm:px-6 {category ===
					'official'
						? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
						: 'bg-white text-gray-700 hover:bg-gray-50'}"
					onclick={() => (category = 'official')}
				>
					Official Doc
				</button>
				<button
					type="button"
					class="flex-1 rounded-xl px-4 py-3 font-medium transition-all duration-200 sm:px-6 {category ===
					'creative'
						? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
						: 'bg-white text-gray-700 hover:bg-gray-50'}"
					onclick={() => (category = 'creative')}
				>
					Recipe / Note
				</button>
			</div>
		</div>

		{#if error}
			<div class="mb-6 rounded-xl bg-red-50 p-4 text-red-800 shadow-lg" role="alert">
				<p class="font-semibold">Error</p>
				<p>{error}</p>
				<button
					type="button"
					class="mt-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
					onclick={() => (error = null)}
				>
					Retry
				</button>
			</div>
		{/if}

		{#if uploading}
			<div class="rounded-xl bg-white p-8 text-center shadow-lg">
				<div class="mb-4 flex justify-center">
					<div
						class="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent sm:h-16 sm:w-16"
					></div>
				</div>
				<p class="text-lg font-medium text-gray-700">Uploading...</p>
				<p class="mt-2 text-sm text-gray-500">Please wait while we process your file</p>
			</div>
		{:else if processing}
			<div class="rounded-xl bg-white p-8 text-center shadow-lg">
				<div class="mb-4 flex justify-center">
					<div
						class="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent sm:h-16 sm:w-16"
					></div>
				</div>
				<p class="text-lg font-medium text-gray-700">Processing OCR...</p>
				<p class="mt-2 text-sm text-gray-500">This may take a few seconds</p>
			</div>
		{:else}
			<form method="POST" action="/?/uploadFile" onsubmit={handleUpload}>
				<div
					class="rounded-xl border-2 border-dashed border-gray-300 bg-white p-6 text-center shadow-lg transition-all duration-200 hover:border-blue-400 hover:shadow-xl sm:p-8"
				>
					<label for="file" class="block cursor-pointer">
						<div class="mb-4">
							<svg
								class="mx-auto h-16 w-16 text-gray-400 transition-transform duration-200 hover:scale-110 sm:h-20 sm:w-20"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.5"
									d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
						</div>
						<p class="mb-2 text-xl font-medium text-gray-700">Click or drag an image</p>
						<p class="text-sm text-gray-500">Accepted formats: JPG, PNG</p>
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
					class="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
				>
					Scan Document
				</button>
			</form>
		{/if}
	</div>
</div>
