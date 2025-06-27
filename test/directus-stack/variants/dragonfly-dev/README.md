# Directus avec Dragonfly Cache

## Pourquoi Dragonfly ?

Dragonfly est un remplacement moderne de Redis qui offre :
- **25x plus rapide** sur certaines charges
- **Multi-threading natif** sans cluster
- **Compatible Redis** : fonctionne avec Directus sans modification
- **Moins de fragmentation mémoire**

## Configuration spécifique

### Options Dragonfly optimisées

```yaml
--cache_mode=true          # Mode cache optimisé
--maxmemory=2GB           # Limite mémoire
--hz=10                   # Réduit la charge CPU (défaut: 1000)
--save_schedule=*:30      # Sauvegarde toutes les 30 min
--conn_io_threads=4       # Threads I/O pour les connexions
--pipeline_squash=10      # Optimise les commandes pipelinées
```

### Monitoring inclus

1. **Prometheus metrics** : http://localhost:9999/metrics
2. **Admin console** : http://localhost:9998
3. **Redis Exporter** : http://localhost:9121/metrics

## Démarrage

```bash
# Copier et adapter le fichier d'environnement
cp .env.example .env

# Démarrer la stack
docker compose up -d

# Vérifier les logs Dragonfly
docker compose logs dragonfly

# Tester la connexion
docker compose exec dragonfly redis-cli ping
```

## Performance Tuning

### Pour développement
- Cache mode activé pour performance maximale
- Persistence toutes les 30 minutes
- Logs en mode info pour debug

### Métriques à surveiller
- Memory usage : `dragonfly_memory_used_bytes`
- Commands/sec : `dragonfly_commands_processed_total`
- Connections : `dragonfly_connected_clients`
- Hit ratio : `dragonfly_keyspace_hits_total` / `dragonfly_keyspace_misses_total`

## Différences avec Redis

1. **Commandes supportées** : 99% compatible
2. **Performance** : Significativement plus rapide sur multi-core
3. **Mémoire** : Utilisation plus efficace
4. **Snapshot** : Algorithme optimisé, moins d'impact

## Debug

```bash
# Stats en temps réel
docker compose exec dragonfly redis-cli --stat

# Info complète
docker compose exec dragonfly redis-cli info

# Monitor des commandes
docker compose exec dragonfly redis-cli monitor
```