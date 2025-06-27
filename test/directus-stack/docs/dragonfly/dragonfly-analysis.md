# Analyse Dragonfly pour Directus

## Pourquoi Dragonfly vs Redis ?

### Avantages Dragonfly
1. **Performance** : 25x plus rapide sur certaines charges
2. **Multi-threading natif** : Utilise tous les cores sans cluster
3. **Mémoire optimisée** : Moins de fragmentation, meilleure utilisation
4. **Compatibilité Redis** : Drop-in replacement, même protocole
5. **Snapshot plus rapide** : Algorithme optimisé pour la persistence

### Options importantes pour Directus

```bash
# Options de base
--port 6379                    # Port standard Redis
--bind 0.0.0.0                 # Écoute sur toutes les interfaces
--maxmemory 2GB               # Limite mémoire
--cache_mode true             # Mode cache optimisé

# Performance
--hz 10                       # Fréquence des tâches background (défaut: 1000)
--tcp-backlog 512            # Queue TCP
--io_threads 4               # Threads I/O (auto-détection si 0)

# Persistence (optionnel en dev)
--dbfilename dump.rdb        # Nom du fichier de sauvegarde
--dir /data                  # Répertoire de persistence
--save ""                    # Désactive auto-save (pour cache pur)

# Monitoring
--prometheus_port 9999       # Métriques Prometheus
--log_level info            # Niveau de log

# Sécurité (dev)
--requirepass ""            # Pas de mot de passe en dev
```

## Cas d'usage Directus

### 1. Cache des requêtes
- Stockage des résultats d'API
- TTL configurable
- Invalidation automatique

### 2. Sessions utilisateurs
- Tokens d'authentification
- Refresh tokens
- État des utilisateurs

### 3. Rate limiting
- Compteurs par IP/user
- Fenêtres glissantes
- Protection API

### 4. Cache des assets
- Transformations d'images
- Métadonnées fichiers
- URLs signées

## Configuration optimale pour dev

### Priorités
1. **Facilité de debug** : Logs détaillés, persistence activée
2. **Performance** : Multi-threading, cache_mode
3. **Compatibilité** : Même interface que Redis
4. **Monitoring** : Prometheus endpoint activé

### Trade-offs acceptables en dev
- Pas de réplication
- Pas de TLS
- Persistence moins fréquente
- Limits mémoire plus flexibles