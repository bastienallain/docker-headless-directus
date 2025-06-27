# 🚀 Optimisations Headless CMS API + Asset Server

## 📊 Configuration Spécialisée

### 🎯 Usage Pattern : Apps Vercel → Directus API
```
Astro/NextJS (Vercel) → API calls → Directus → Assets/Data
                     ↗ Webhooks ← Directus (content changes)
```

## 🔧 Optimisations Clés

### 1. **Cache API Agressif**
```yaml
CACHE_TTL: 24h              # vs 2h standard
CACHE_SYSTEM_TTL: 48h       # Schéma/config stable  
CACHE_SCHEMA: true          # Pas de changements fréquents
CACHE_PERMISSIONS: false    # Moins important pour API
CACHE_VALUE_MAX_SIZE: 64MB  # Gros payloads API
```

### 2. **Assets CDN-Ready**
```yaml
ASSETS_CACHE_TTL: 365d                    # Cache navigateur 1 an
ASSETS_REQUIRE_AUTHENTICATION: false     # Accès direct
ASSETS_TRANSFORM_MAX_CONCURRENT: 16       # Sharp CPU-optimisé
ASSETS_TRANSFORM_TIMEOUT: 60000          # 60s pour gros assets
FILES_MAX_UPLOAD_SIZE: 1GB               # Gros médias
```

### 3. **CORS Ouvert pour Apps Externes**
```yaml
CORS_ORIGIN: "*"                         # Tous domaines
CORS_CREDENTIALS: false                  # Pas de cookies
CORS_METHODS: GET,POST,PATCH,DELETE      # API REST complète
```

### 4. **Rate Limiting Adapté**
```yaml
RATE_LIMITER_GLOBAL_RATE: 1000          # 1000 req/min (vs 100)
RATE_LIMITER_GLOBAL_DURATION: 60        # Par minute
```

### 5. **Pool DB Optimisé Read-Heavy**
```yaml
DB_POOL_MIN: 5                          # Moins de writes
DB_POOL_MAX: 20                         # vs 50 standard
DB_CONNECTION_TIMEOUT: 60000            # Plus de temps
```

## 📈 Performance Attendue

| Métrique | Standard | Headless API | Amélioration |
|----------|----------|--------------|--------------|
| Cache Hit Ratio | 80% | 95% | **+15%** |
| API Response | 100ms | 10ms | **10x** |
| Asset Delivery | 500ms | 50ms | **10x** |
| Sharp Concurrent | 8 | 16 | **2x** |
| Upload Max | 100MB | 1GB | **10x** |

## 🔗 Intégration Apps Headless

### Astro Configuration
```js
// astro.config.mjs
export default defineConfig({
  integrations: [
    directus({
      url: 'http://localhost:8057',
      cache: {
        ttl: 3600, // 1h cache Astro
        revalidate: true
      }
    })
  ]
});
```

### NextJS Configuration
```js
// next.config.js
module.exports = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8057',
        pathname: '/assets/**',
      }
    ]
  },
  env: {
    DIRECTUS_URL: 'http://localhost:8057'
  }
}
```

### Fetch Optimisé
```js
// utils/directus.js
const directusApi = async (endpoint, options = {}) => {
  const response = await fetch(`http://localhost:8057${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    next: { revalidate: 3600 }, // NextJS ISR
    ...options
  });
  
  return response.json();
};
```

## 🎨 Sharp Assets Pipeline

### Formats Optimisés Auto
```
Original → WebP (modern browsers)
        → AVIF (cutting edge)
        → JPEG (fallback)
        → Responsive sizes (320w, 640w, 1024w, 1920w)
```

### URL Transform Examples
```
/assets/hero.jpg                    # Original
/assets/hero.jpg?width=800          # Resize
/assets/hero.jpg?width=800&quality=80&format=webp
/assets/hero.jpg?width=800&height=600&fit=cover
```

## 🔔 Webhooks pour ISR/Revalidation

### Configuration Vercel
```js
// api/revalidate.js (Vercel)
export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Webhook depuis Directus
    const { collection, action } = req.body;
    
    if (collection === 'articles') {
      await res.revalidate('/blog');
      await res.revalidate(`/blog/${req.body.key}`);
    }
    
    return res.json({ revalidated: true });
  }
}
```

### Configuration Directus Webhooks
```yaml
# Dans Directus admin
Webhook URL: https://yourapp.vercel.app/api/revalidate
Triggers: Create, Update, Delete
Collections: articles, pages, media
```

## 🛠 Scripts Maintenance

### Performance Check
```bash
# Cache hit ratio
docker compose -f docker-compose.headless.yml exec dragonfly redis-cli -a headless_dragonfly_456 info stats

# Assets response time
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8057/assets/your-image.jpg

# API response time
time curl -s http://localhost:8057/items/articles
```

### Purge Cache
```bash
# Purge cache spécifique
docker compose -f docker-compose.headless.yml exec dragonfly redis-cli -a headless_dragonfly_456 del "cache:items:articles"

# Purge cache complet
docker compose -f docker-compose.headless.yml exec dragonfly redis-cli -a headless_dragonfly_456 flushall
```

## 📊 Monitoring Recommandé

### Métriques Clés
- **Cache Hit Ratio** : >95%
- **API P95 Latency** : <100ms
- **Asset Transform Time** : <5s
- **Memory Usage** : <80%

### Alertes
- Cache hit ratio <90%
- API errors >1%
- Asset transform failures
- Memory usage >90%

## 🚀 Résultats Attendus

**Pour vos apps Astro/NextJS :**
- Build time réduit (assets cached)
- ISR efficace (webhooks instantanés)
- SEO optimisé (formats WebP/AVIF auto)
- Performance Lighthouse 95+ (assets optimisés)

**Stack parfaitement adaptée pour un CMS headless moderne !** 🎯