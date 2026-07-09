<script lang="ts">
  const baseUrl = "http://locskjdfhsdkfjalhost:3000/api";
  
  const endpoints = [
    {
      id: "provinces",
      name: "Provinsi",
      method: "GET",
      path: "/provinces",
      description: "Mendapatkan daftar seluruh provinsi di Indonesia.",
      paramDocs: [
        { name: "sort", type: "string", required: false, desc: "Jika diisi dengan 'name', maka hasil akan diurutkan secara alfabetis berdasarkan nama provinsi." }
      ],
      inputs: [
        { key: "sort", label: "Urutkan (Opsional)", type: "select", options: ["", "name"], placeholder: "Default" }
      ]
    },
    {
      id: "cities",
      name: "Kota / Kabupaten",
      method: "GET",
      path: "/cities",
      description: "Mendapatkan daftar kota/kabupaten. Anda bisa mengambil seluruh data kota, atau melakukan filter berdasarkan provinsi tertentu.",
      paramDocs: [
        { name: "provinceId", type: "string", required: false, desc: "ID Provinsi (terdiri dari 2 digit angka, misal: '11' untuk Aceh). Jika diberikan, hanya akan mengembalikan kota/kabupaten yang berada di provinsi tersebut." },
        { name: "sort", type: "string", required: false, desc: "Jika diisi dengan 'name', data diurutkan secara alfabetis berdasarkan nama kota/kabupaten." }
      ],
      inputs: [
        { key: "provinceId", label: "Province ID", type: "text", placeholder: "Misal: 11" },
        { key: "sort", label: "Urutkan (Opsional)", type: "select", options: ["", "name"], placeholder: "Default" }
      ]
    },
    {
      id: "districts",
      name: "Kecamatan",
      method: "GET",
      path: "/districts",
      description: "Mendapatkan daftar kecamatan. Anda bisa memfilter berdasarkan kota/kabupaten untuk pencarian yang lebih spesifik.",
      paramDocs: [
        { name: "cityId", type: "string", required: false, desc: "ID Kota/Kabupaten (terdiri dari 4 digit angka, misal: '1101'). Jika diberikan, hanya akan mengembalikan kecamatan di dalam kota tersebut." },
        { name: "sort", type: "string", required: false, desc: "Jika diisi dengan 'name', data diurutkan secara alfabetis." }
      ],
      inputs: [
        { key: "cityId", label: "City ID", type: "text", placeholder: "Misal: 1101" },
        { key: "sort", label: "Urutkan (Opsional)", type: "select", options: ["", "name"], placeholder: "Default" }
      ]
    },
    {
      id: "villages",
      name: "Desa / Kelurahan",
      method: "GET",
      path: "/villages",
      description: "Mendapatkan daftar desa/kelurahan. Filter berdasarkan kecamatan untuk hasil yang akurat.",
      paramDocs: [
        { name: "districtId", type: "string", required: false, desc: "ID Kecamatan (terdiri dari 7 digit angka, misal: '1101010'). Jika diberikan, hanya akan mengembalikan desa/kelurahan di dalam kecamatan tersebut." },
        { name: "sort", type: "string", required: false, desc: "Jika diisi dengan 'name', data diurutkan secara alfabetis." }
      ],
      inputs: [
        { key: "districtId", label: "District ID", type: "text", placeholder: "Misal: 1101010" },
        { key: "sort", label: "Urutkan (Opsional)", type: "select", options: ["", "name"], placeholder: "Default" }
      ]
    }
  ];

  let state = $state(
    endpoints.reduce((acc, ep) => {
      acc[ep.id] = {
        loading: false,
        data: null,
        params: ep.inputs.reduce((p, input) => {
          p[input.key] = "";
          return p;
        }, {} as Record<string, string>)
      };
      return acc;
    }, {} as Record<string, any>)
  );

  function getPreviewUrl(endpoint: any) {
    const epState = state[endpoint.id];
    if (!epState) return endpoint.path;
    const queryParams = Object.entries(epState.params)
      .filter(([_, v]) => v !== "")
      .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
    
    const qs = new URLSearchParams(queryParams as any).toString();
    return qs ? `${endpoint.path}?${qs}` : endpoint.path;
  }

  async function fetchEndpoint(endpoint: any) {
    const epState = state[endpoint.id];
    epState.loading = true;
    epState.data = null;
    try {
      const url = `${baseUrl}${getPreviewUrl(endpoint)}`;
      
      const res = await fetch(url);
      const json = await res.json();
      epState.data = JSON.stringify(json, null, 2);
    } catch (err: any) {
      epState.data = JSON.stringify({ error: err.message }, null, 2);
    } finally {
      epState.loading = false;
    }
  }
</script>

<main class="min-h-screen bg-[#F9FAFB] pb-24 font-['Inter'] text-slate-800">
  <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
    <div class="container mx-auto px-6 py-4 flex justify-between items-center max-w-5xl">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 text-white flex items-center justify-center font-bold text-lg shadow-sm">
          ID
        </div>
        <h1 class="font-semibold text-lg tracking-tight text-slate-900">API Wilayah Indonesia</h1>
      </div>
      <a href="https://github.com/adityaibrar/api-wilayah-indonesia" target="_blank" class="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        GitHub
      </a>
    </div>
  </header>

  <div class="container mx-auto px-6 mt-16 max-w-5xl">
    <div class="text-center mb-20 space-y-5">
      <h2 class="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 text-balance leading-tight">
        Data Administratif <span class="text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-black">Terlengkap</span>
      </h2>
      <p class="text-lg text-slate-500 max-w-2xl mx-auto text-balance leading-relaxed">
        API cepat dan ringan yang menyediakan data 38 Provinsi, Kota/Kabupaten, Kecamatan, hingga Desa/Kelurahan di seluruh Indonesia.
      </p>
      <div class="inline-flex mt-8 items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-mono text-slate-600 shadow-sm">
        <span class="relative flex h-2.5 w-2.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
        </span>
        {baseUrl}
      </div>
    </div>

    <div class="space-y-8">
      {#each endpoints as endpoint}
        <section class="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
          <div class="p-8 md:p-10">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h3 class="text-2xl font-bold text-slate-900 mb-2">{endpoint.name}</h3>
                <p class="text-slate-500">{endpoint.description}</p>
              </div>
              <div>
                <span class="px-3 py-1.5 bg-slate-100 text-slate-800 font-bold text-sm rounded-lg tracking-wide border border-slate-200/50">
                  {endpoint.method}
                </span>
              </div>
            </div>

            <div class="mb-8 p-4 bg-[#0D1117] rounded-xl flex items-center gap-3 shadow-inner overflow-x-auto border border-slate-800/50">
              <span class="text-slate-500 font-medium text-xs uppercase tracking-wider shrink-0">Endpoint URL</span>
              <code class="font-mono text-sm whitespace-nowrap flex items-center">
                <span class="text-slate-400">{baseUrl}</span><span class="text-emerald-400 font-bold transition-all">{getPreviewUrl(endpoint)}</span>
              </code>
            </div>

            {#if endpoint.paramDocs && endpoint.paramDocs.length > 0}
              <div class="mb-8">
                <h4 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Detail Parameter Query
                </h4>
                <div class="overflow-hidden border border-slate-200 rounded-xl">
                  <table class="w-full text-left text-sm text-slate-600">
                    <thead class="bg-slate-50 border-b border-slate-200 text-slate-700">
                      <tr>
                        <th class="px-4 py-3 font-medium">Parameter</th>
                        <th class="px-4 py-3 font-medium">Tipe</th>
                        <th class="px-4 py-3 font-medium">Status</th>
                        <th class="px-4 py-3 font-medium">Deskripsi</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      {#each endpoint.paramDocs as doc}
                        <tr class="hover:bg-slate-50/50 transition-colors">
                          <td class="px-4 py-3 font-mono text-slate-800">{doc.name}</td>
                          <td class="px-4 py-3 font-mono text-xs text-slate-500">{doc.type}</td>
                          <td class="px-4 py-3">
                            <span class="px-2 py-1 text-[10px] uppercase tracking-wider font-bold rounded-md bg-slate-100 text-slate-500 border border-slate-200/50">
                              {doc.required ? 'Required' : 'Optional'}
                            </span>
                          </td>
                          <td class="px-4 py-3 text-slate-500 leading-relaxed md:max-w-xs">{doc.desc}</td>
                        </tr>
                      {/each}
                    </tbody>
                  </table>
                </div>
              </div>
            {/if}
            
            <div class="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-6">
              <h4 class="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                Tes Endpoint Langsung
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {#each endpoint.inputs as input}
                  <div class="space-y-1.5">
                    <label class="text-xs font-medium text-slate-500">{input.label}</label>
                    {#if input.type === 'select'}
                      <select 
                        bind:value={state[endpoint.id].params[input.key]}
                        class="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 block p-3 outline-none transition-all cursor-pointer"
                      >
                        {#each input.options as opt}
                          <option value={opt}>{opt || input.placeholder}</option>
                        {/each}
                      </select>
                    {:else}
                      <input 
                        type="text" 
                        bind:value={state[endpoint.id].params[input.key]}
                        placeholder={input.placeholder}
                        class="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 block p-3 outline-none transition-all"
                      />
                    {/if}
                  </div>
                {/each}
              </div>
              <div class="mt-6 flex justify-end">
                <button 
                  onclick={() => fetchEndpoint(endpoint)}
                  disabled={state[endpoint.id].loading}
                  class="bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium py-2.5 px-6 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  {#if state[endpoint.id].loading}
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Memuat...
                  {:else}
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Kirim Request
                  {/if}
                </button>
              </div>
            </div>

            {#if state[endpoint.id].data}
              <div class="bg-[#0D1117] rounded-2xl overflow-hidden border border-slate-800/50 shadow-inner">
                <div class="flex items-center justify-between px-4 py-3 bg-[#161B22] border-b border-slate-800">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-rose-500/80"></div>
                    <div class="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div class="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  </div>
                  <span class="text-xs font-mono text-slate-400">Response JSON</span>
                </div>
                <div class="p-4 overflow-x-auto max-h-96 custom-scrollbar">
                  <pre class="font-mono text-sm leading-relaxed text-slate-300"><code>{state[endpoint.id].data}</code></pre>
                </div>
              </div>
            {/if}
          </div>
        </section>
      {/each}
    </div>
  </div>

  <footer class="mt-24 border-t border-slate-200/60 bg-white/50 backdrop-blur-md">
    <div class="container mx-auto px-6 py-8 max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-2 text-sm text-slate-500">
        <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
        <span>Open Source Project &bull; Lisensi <strong>MIT</strong></span>
      </div>
      <div class="text-sm text-slate-500">
        Dibuat dengan ❤️ oleh 
        <a href="https://github.com/adityaibrar" target="_blank" class="font-medium text-slate-700 hover:text-black hover:underline transition-all">
          Aditya Ibrar
        </a>
      </div>
    </div>
  </footer>
</main>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  
  :global(body) {
    font-family: 'Inter', sans-serif;
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #334155;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #475569;
  }
</style>
