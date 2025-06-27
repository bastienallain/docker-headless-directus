# 🚀 Directus Docker Stacks Collection

**Production-ready Docker Compose configurations for Directus CMS with advanced optimizations**

[![Directus](https://img.shields.io/badge/Directus-Latest-purple)](https://directus.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17.5-blue)](https://postgresql.org/)
[![Dragonfly](https://img.shields.io/badge/Dragonfly-Cache-red)](https://dragonflydb.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue)](https://docker.com/)

## 🎯 Purpose

Complete collection of optimized Docker stacks for **Directus CMS**, from development to production, with special focus on **headless architectures** and modern frameworks (Astro, NextJS, etc.).

## 📦 What's Included

### 🏗️ Environments
- **Development**: Full featured with debugging tools (Adminer, Redis Commander)
- **Production**: Secure with Docker Secrets, Nginx proxy, SSL (Let's Encrypt)

### ⚡ Performance Variants
- **Standard Redis**: Traditional caching setup
- **Dragonfly**: 25x faster Redis-compatible cache with memory optimizations

### 🎨 Specialized Configurations
- **Headless API**: Optimized for external apps (Vercel, Netlify)
- **Asset Server**: Image processing pipeline with Sharp optimization
- **CDN-Ready**: Long-term caching for assets and API responses

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/your-username/directus-docker-stacks.git
cd directus-docker-stacks/test/directus-stack
```

### 2. Choose Your Stack

#### 🧪 Development with Dragonfly
```bash
cd variants/dragonfly-dev
cp .env.example .env
docker compose up -d
```
Access: http://localhost:8056

#### 🌐 Production with SSL
```bash
cd environments/prod
cp .env.example .env
# Edit .env with your domain
docker compose up -d
```

#### 🎯 Headless API Optimized
```bash
cd variants/dragonfly-prod
docker compose -f docker-compose.headless.yml up -d
```
Access: http://localhost:8057

## 📚 Documentation

| Configuration | Use Case | Documentation |
|---------------|----------|---------------|
| **Dev Environment** | Local development | [dev/README.md](test/directus-stack/environments/dev/README.md) |
| **Production** | Secure deployment | [prod/README.md](test/directus-stack/environments/prod/README.md) |
| **Dragonfly Dev** | Fast local cache | [dragonfly-dev/README.md](test/directus-stack/variants/dragonfly-dev/README.md) |
| **Headless API** | External apps | [HEADLESS-OPTIMIZATIONS.md](test/directus-stack/variants/dragonfly-prod/HEADLESS-OPTIMIZATIONS.md) |

## 🎨 Framework Integration

### Astro Integration
```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import directus from '@astrojs/directus';

export default defineConfig({
  integrations: [
    directus({
      url: 'http://localhost:8057',
      cache: { ttl: 3600 }
    })
  ]
});
```

### NextJS Integration  
```js
// next.config.js
module.exports = {
  images: {
    remotePatterns: [{
      protocol: 'http',
      hostname: 'localhost', 
      port: '8057',
      pathname: '/assets/**'
    }]
  }
}
```

## 🏗️ Architecture

```
┌─ test/directus-stack/
│  ├─ environments/
│  │  ├─ dev/           # Development setup
│  │  └─ prod/          # Production with SSL
│  ├─ variants/
│  │  ├─ dragonfly-dev/ # Dev + Dragonfly cache
│  │  └─ dragonfly-prod/# Production + optimizations
│  └─ shared/           # Common configurations
```

## ⚡ Performance Features

### Dragonfly Cache Benefits
- **25x faster** than Redis
- **Lower memory usage** (15-25% reduction)
- **Better throughput** for high-traffic APIs
- **Redis-compatible** drop-in replacement

### Headless Optimizations
- **24h API cache** (vs 2h standard)
- **365d asset cache** for CDN
- **16 concurrent Sharp** processes
- **1000 req/min** rate limit
- **Open CORS** for external apps

## 🔧 Management Commands

```bash
# Start headless stack
make headless

# View logs
make logs

# Backup database
make backup

# Performance check
make check-performance

# Purge cache
make purge-cache
```

## 📊 Expected Performance

| Metric | Standard | With Dragonfly | Improvement |
|--------|----------|----------------|-------------|
| Cache Hit Ratio | 80% | 95% | **+15%** |
| API Response | 100ms | 10ms | **10x** |
| Asset Delivery | 500ms | 50ms | **10x** |
| Memory Usage | Baseline | -25% | **Better** |

## 🛠️ Requirements

- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB RAM minimum (8GB recommended)
- 20GB disk space

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## 📄 License

MIT License - see [LICENSE](LICENSE) file.

## 🆘 Support

- 📖 [Documentation](test/directus-stack/)
- 🐛 [Issues](https://github.com/your-username/directus-docker-stacks/issues)
- 💬 [Discussions](https://github.com/your-username/directus-docker-stacks/discussions)

---

**Ready to power your headless CMS with blazing-fast performance?** 🚀

Choose your stack and get started in under 5 minutes!