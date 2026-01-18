<script lang="ts">
	import { goto } from '$app/navigation';

	let imageUrl = $state('');
	let filePath = $state('');
	let ocrData = $state<Record<string, unknown>>({});

	let formType = $state('facture');
	let metadata = $state<Record<string, unknown>>({});
	let fullText = $state('');

	$effect(() => {
		const state = history.state;
		imageUrl = state?.imageUrl || '';
		filePath = state?.filePath || '';
		ocrData = state?.ocrData || {};
		metadata = ocrData.data as Record<string, unknown> || {};
		fullText = (ocrData.raw_text as string) || '';
	});

	function handleSave(event: Event) {
		event.preventDefault();

		const formData = new FormData();
		formData.append('filePath', filePath);
		formData.append('provider', ocrData.provider as string);
		formData.append('docType', formType);
		formData.append('metadata', JSON.stringify(metadata));
		formData.append('fullText', fullText);

		fetch('/?/saveDocument', {
			method: 'POST',
			body: formData
		}).then((response) => {
			if (response.ok) {
				// eslint-disable-next-line svelte/no-navigation-without-resolve
				goto('/');
			}
		});
	}
</script>

<div class="min-h-screen bg-gray-100 p-4">
	<div class="max-w-7xl mx-auto">
		<h1 class="text-3xl font-bold mb-8">Valider le document</h1>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<div class="bg-white rounded-lg shadow-md p-4 sticky top-4 h-fit">
				{#if imageUrl}
					<img src={imageUrl} alt="Document scanné" class="w-full rounded-lg" />
				{:else}
					<div class="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
						<p class="text-gray-500">Aucune image</p>
					</div>
				{/if}
			</div>

			<div class="bg-white rounded-lg shadow-md p-6 overflow-auto">
				<form onsubmit={handleSave}>
					<div class="mb-6">
						<label class="block text-sm font-medium mb-2">Type de document</label>
						<select
							bind:value={formType}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="facture">Facture</option>
							<option value="cni">CNI</option>
							<option value="recette">Recette</option>
							<option value="autre">Autre</option>
						</select>
					</div>

					{#if formType === 'facture' || formType === 'cni'}
						<div class="mb-4">
							<label class="block text-sm font-medium mb-2">Montant</label>
							<input
								type="text"
								bind:value={metadata.amount}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div class="mb-4">
							<label class="block text-sm font-medium mb-2">Date</label>
							<input
								type="text"
								bind:value={metadata.date}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
					{/if}

					{#if formType === 'recette'}
						<div class="mb-4">
							<label class="block text-sm font-medium mb-2">Titre</label>
							<input
								type="text"
								bind:value={metadata.titre}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div class="mb-4">
							<label class="block text-sm font-medium mb-2">Temps de préparation</label>
							<input
								type="text"
								bind:value={metadata.temps_preparation}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div class="mb-4">
							<label class="block text-sm font-medium mb-2">Ingrédients</label>
							<textarea
								bind:value={metadata.ingredients}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
							></textarea>
						</div>
					{/if}

					<div class="mb-6">
						<label class="block text-sm font-medium mb-2">Texte complet</label>
						<textarea
							bind:value={fullText}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-64"
							placeholder="Texte complet du document..."
						></textarea>
					</div>

					<button
						type="submit"
						class="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 transition-colors"
					>
						Valider et Enregistrer
					</button>
				</form>
			</div>
		</div>
	</div>
</div>
