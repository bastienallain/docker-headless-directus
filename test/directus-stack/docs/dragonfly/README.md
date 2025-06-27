# Dragonfly Cache Documentation

## Production Configuration

### Version Officielle Ultra-Optimisée

```yaml
version: '3.8'

services:
  dragonfly:
    image: docker.dragonflydb.io/dragonflydb/dragonfly
    container_name: dragonfly
    ulimits:
      memlock: -1
    command: ["--maxmemory=2GB", "--cache_mode=true"]
    ports:
      - "6379:6379"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
```

### Avantages Dragonfly

- **Performance** : 25x plus rapide que Redis sur certaines charges
- **Mémoire** : Utilisation optimisée, moins de fragmentation
- **Compatibilité** : API Redis complète
- **Multi-threading** : Natif, pas besoin de cluster

### Configuration Avancée

```yaml
command: [
  "--maxmemory=4GB",
  "--cache_mode=true",
  "--dbfilename=dump",
  "--dir=/data",
  "--hz=10",
  "--tcp-keepalive=300",
  "--timeout=300"
]
```

### Ressources

- [Dragonfly Official Docs](https://www.dragonflydb.io/docs/getting-started/docker-compose)
- [Developing with Dragonfly: Cache-Aside](https://www.dragonflydb.io/blog/developing-with-dragonfly-part-01-cache-aside)
- [Dragonfly GitHub](https://github.com/dragonflydb/dragonfly/contrib/docker)