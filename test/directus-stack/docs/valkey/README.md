# Valkey Cache Documentation

## Production Configuration

### Single Instance Sécurisé

```yaml
version: '3.8'

services:
  valkey:
    image: valkey/valkey:latest
    container_name: valkey
    command: valkey-server --port 6379 --requirepass ${VALKEY_PASSWORD} --io-threads ${IO_THREADS:-4} --save ""
    volumes:
      - valkey-data:/data
    network_mode: host
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "valkey-cli", "-a", "${VALKEY_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  valkey-data:
    driver: local
```

### Configuration Points Clés

- **Sécurité** : Utilise `VALKEY_PASSWORD` dans `.env`
- **Performance** : `network_mode: host` pour performances maximales
- **IO Threading** : Configurable via `IO_THREADS`
- **Persistence** : Désactivée avec `--save ""` pour cache pur

### Ressources

- [Valkey - Testing the Limits](https://valkey.io/blog/testing-the-limits/)
- [Valkey Docker Hub](https://hub.docker.com/r/valkey/valkey/)
- [Valkey Clustering & Tuning](https://valkey.io/blog/testing-the-limits/)