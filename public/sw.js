const CACHE_NAME = 'pragma-v1';
const STATIC_CACHE = 'pragma-static-v1';
const DYNAMIC_CACHE = 'pragma-dynamic-v1';

// Arquivos essenciais para cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
  '/manifest.json'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Cache estático criado');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error('Erro ao criar cache estático:', error);
      })
  );
  self.skipWaiting();
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Estratégia Cache First para assets estáticos
  if (STATIC_ASSETS.includes(url.pathname) || 
      request.destination === 'style' || 
      request.destination === 'script' ||
      request.destination === 'image') {
    
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request)
            .then((response) => {
              const responseClone = response.clone();
              caches.open(STATIC_CACHE)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
              return response;
            });
        })
        .catch(() => {
          // Fallback para página offline
          if (request.destination === 'document') {
            return caches.match('/index.html');
          }
        })
    );
    return;
  }

  // Estratégia Network First para dados da API
  if (url.hostname.includes('supabase') || url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then((cache) => {
              cache.put(request, responseClone);
            });
          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                // Adicionar header indicando que é cache
                const headers = new Headers(cachedResponse.headers);
                headers.set('X-From-Cache', 'true');
                return new Response(cachedResponse.body, {
                  status: cachedResponse.status,
                  statusText: cachedResponse.statusText,
                  headers: headers
                });
              }
              // Retornar dados offline padrão
              return new Response(JSON.stringify({
                offline: true,
                message: 'Dados em cache não disponíveis'
              }), {
                headers: { 'Content-Type': 'application/json' }
              });
            });
        })
    );
    return;
  }

  // Estratégia padrão para outras requisições
  event.respondWith(
    fetch(request)
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Sincronização em background
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Sincronização em background');
    event.waitUntil(syncData());
  }
});

// Função para sincronizar dados quando voltar online
async function syncData() {
  try {
    // Aqui você pode implementar lógica para sincronizar
    // dados pendentes quando a conexão voltar
    console.log('Sincronizando dados pendentes...');
  } catch (error) {
    console.error('Erro na sincronização:', error);
  }
}