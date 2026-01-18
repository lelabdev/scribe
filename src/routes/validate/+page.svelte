<script lang="ts">
	let imageUrl = $state('');
	let filePath = $state('');
	let ocrData = $state<Record<string, unknown>>({});

	let formType = $state('facture');
	let metadata = $state<Record<string, unknown>>({});
	let fullText = $state('');
	let saving = $state(false);
	let error = $state<string | null>(null);

	$effect(() => {
		const state = history.state;
		imageUrl = state?.imageUrl || '';
		filePath = state?.filePath || '';
		ocrData = state?.ocrData || {};
		metadata = (ocrData.data as Record<string, unknown>) || {};
		fullText = (ocrData.raw_text as string) || '';
	});

	async function handleSave(event: Event) {
		event.preventDefault();
		error = null;
		saving = true;

		const formData = new FormData();
		formData.append('filePath', filePath);
		formData.append('provider', ocrData.provider as string);
		formData.append('docType', formType);
		formData.append('metadata', JSON.stringify(metadata));
		formData.append('fullText', fullText);

		try {
			const response = await fetch('/validate/?/saveDocument', {
				method: 'POST',
				body: formData
			});

			const result = (await response.json()) as Record<string, unknown>;

			if (result.success) {
				window.location.href = '/';
			} else {
				saving = false;
				error = (result.error as string) || 'Erreur lors de la sauvegarde';
			}
		} catch (err) {
			console.error('Save error:', err);
			saving = false;
			error = 'Erreur de connexion. Veuillez réessayer.';
		}
	}
</script>

<div class="min-h-screen bg-gray-100 p-4">
	<div class="mx-auto max-w-7xl">
		<h1 class="mb-8 text-3xl font-bold">Valider le document</h1>

		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<div class="sticky top-4 h-fit rounded-lg bg-white p-4 shadow-md">
				{#if imageUrl}
					<img src={imageUrl} alt="Document scanné" class="w-full rounded-lg" />
				{:else}
					<div class="flex aspect-video items-center justify-center rounded-lg bg-gray-200">
						<p class="text-gray-500">Aucune image</p>
					</div>
				{/if}
			</div>

			<div class="overflow-auto rounded-lg bg-white p-6 shadow-md">
				<form onsubmit={handleSave}>
					<div class="mb-6">
						<label for="docType" class="mb-2 block text-sm font-medium">Type de document</label>
						<select
							id="docType"
							bind:value={formType}
							class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						>
							<option value="facture">Facture</option>
							<option value="cni">CNI</option>
							<option value="recette">Recette</option>
							<option value="autre">Autre</option>
						</select>
					</div>

					{#if formType === 'facture' || formType === 'cni'}
						<div class="mb-4">
							<label for="amount" class="mb-2 block text-sm font-medium">Montant</label>
							<input
								id="amount"
								type="text"
								bind:value={metadata.amount}
								class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							/>
						</div>

						<div class="mb-4">
							<label for="date" class="mb-2 block text-sm font-medium">Date</label>
							<input
								id="date"
								type="text"
								bind:value={metadata.date}
								class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							/>
						</div>
					{/if}

					{#if formType === 'recette'}
						<div class="mb-4">
							<label for="titre" class="mb-2 block text-sm font-medium">Titre</label>
							<input
								id="titre"
								type="text"
								bind:value={metadata.titre}
								class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							/>
						</div>

						<div class="mb-4">
							<label for="temps" class="mb-2 block text-sm font-medium">Temps de préparation</label>
							<input
								id="temps"
								type="text"
								bind:value={metadata.temps_preparation}
								class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							/>
						</div>

						<div class="mb-4">
							<label for="ingredients" class="mb-2 block text-sm font-medium">Ingrédients</label>
							<textarea
								id="ingredients"
								bind:value={metadata.ingredients}
								class="h-32 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							></textarea>
						</div>
					{/if}

					<div class="mb-6">
						<label for="fullText" class="mb-2 block text-sm font-medium">Texte complet</label>
						<textarea
							id="fullText"
							bind:value={fullText}
							class="h-64 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							placeholder="Texte complet du document..."
						></textarea>
					</div>

					{#if error}
						<div class="mb-4 rounded-lg bg-red-100 p-4 text-red-800" role="alert">
							<p class="font-semibold">Erreur</p>
							<p>{error}</p>
						</div>
					{/if}

					<button
						type="submit"
						disabled={saving}
						class="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{#if saving}
							<div
								class="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
							></div>
							Sauvegarde en cours...
						{:else}
							Valider et Enregistrer
						{/if}
					</button>
				</form>
			</div>
		</div>
	</div>
</div>
