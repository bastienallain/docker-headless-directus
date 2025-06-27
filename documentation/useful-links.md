# Liens de documentation pour Dragonfly, PostgreSQL 17.5 et Directus

## 🐉 Dragonfly

### Configuration avancée et performance

**Documentation officielle Dragonfly :**

- [Documentation principale](https://www.dragonflydb.io/docs/) - Point d'entrée pour toute la documentation[1]
- [Configuration des flags serveur](https://www.dragonflydb.io/docs/managing-dragonfly/flags) - Liste complète des options de configuration[2]

**Options de performance clés :**

- `--maxmemory` : Limite mémoire maximale (0 = auto-détection)[2]
- `--cache_mode` : Active le mode cache avec éviction des clés[2]
- `--num_shards` : Nombre de shards de base de données (0 = automatique)[2]
- `--conn_io_threads` : Nombre de threads pour les connexions serveur[2]
- `--tcp_nodelay` : Configuration TCP_NODELAY pour optimiser la latence[2]
- `--max_eviction_per_heartbeat` : Nombre maximum de clés évincées par battement de cœur[2]

**Tuning production haute charge :**

- La documentation recommande d'ajuster `maxmemory` à 4-10GB pour les systèmes en production[3]
- Dragonfly délivre 25x plus de débit que Redis grâce à son architecture multi-thread[4][5]
- Capable de gérer des millions de QPS sur une seule instance[1]

### Monitoring et métriques

**Métriques importantes :**

- [Blog monitoring des datastores in-memory](https://www.dragonflydb.io/blog/monitoring-in-memory-datastores) - Guide complet sur le monitoring avec Prometheus[6]
- Métriques Prometheus : `dragonfly_connected_replica_lag_records` pour la latence de réplication[7]
- Support des percentiles de latence P99, P95, P50 via `redis_latency_percentiles_usec`[8]

**Outils de monitoring :**

- Intégration Prometheus et Grafana[6]
- Commande `INFO REPLICATION` pour surveiller le lag de réplication[7]
- Métriques de consommation mémoire, connexions clients, et métriques serveur[6]

### Clustering et réplication (Haute disponibilité)

**Documentation réplication :**

- [Gestion de la réplication](https://www.dragonflydb.io/docs/managing-dragonfly/replication) - Configuration primaire-réplique[7]
- [Haute disponibilité](https://www.dragonflydb.io/docs/managing-dragonfly/high-availability) - Stratégies HA avec Kubernetes[9]

**Configuration clustering :**

- Commandes principales : `ROLE` et `REPLICAOF`[7]
- Support de la réplication Redis-Dragonfly pour migration[7]
- Réplication sécurisée avec TLS[7]
- Mode cluster : `--cluster_mode=emulated|yes`[2]
- Dragonfly Operator pour Kubernetes avec HA automatique[9]

**Spécificités clustering :**

- 16 384 slots de hash comme Redis Cluster[10]
- Rééquilibrage dynamique sans interruption[10]
- Support des opérations multi-clés avec hash tags[10]

## 🐘 PostgreSQL 17.5

### Configuration production

**Guides de tuning PostgreSQL 17 :**

- [Tuning PostgreSQL performance](https://www.percona.com/blog/tuning-postgresql-database-parameters-to-optimize-performance/) - Guide complet d'optimisation[11]
- [Documentation officielle PostgreSQL 17](https://www.postgresql.org/docs/current/runtime-config-resource.html) - Configuration des ressources[12]
- [Performance tuning avancé](https://vladmihalcea.com/postgresql-performance-tuning-settings/) - Paramètres de production[13]

### Paramètres mémoire essentiels

**shared_buffers :**

- Recommandation : 25-40% de la RAM disponible[14][12]
- Exemple : 4GB pour un système avec 16GB de RAM[14]
- Configuration : `shared_buffers = 4GB` dans postgresql.conf[14]

**work_mem :**

- Mémoire pour les opérations de tri et tables de hash[14]
- Attention : paramètre par connexion, peut impacter fortement la mémoire totale[14]
- Calcul recommandé : (RAM totale - shared_buffers) / max_connections[11]

**maintenance_work_mem :**

- Pour les opérations de maintenance (VACUUM, CREATE INDEX)[11]
- PostgreSQL 17 supprime la limite de 1GB précédente[15]
- Recommandation : 5-10% de la RAM[13]

### Performance tuning WAL et checkpoints

**Configuration WAL PostgreSQL 17 :**

- [Guide tuning max_wal_size](https://www.enterprisedb.com/blog/tuning-maxwalsize-postgresql) - Impact critique sur les performances[16]
- PostgreSQL 17 augmente la taille des segments WAL de 16MB à 64MB (amélioration 10-20%)[3]
- `max_wal_size` recommandé : 4-10GB pour les systèmes busy, parfois jusqu'à 30GB[3]

**Paramètres checkpoint :**

- `checkpoint_timeout` et `max_wal_size` déterminent la fréquence des checkpoints[3]
- Objectif : checkpoints toutes les 3-5 minutes en production[3]
- Balance entre récupération rapide et coût des écritures fréquentes[3]

### Monitoring avec extensions

**pg_stat_statements :**

- [Documentation officielle pg_stat_statements](https://www.postgresql.org/docs/current/pgstatstatements.html) - Extension de monitoring SQL[17]
- [Guide activation pg_stat_statements](https://www.bytebase.com/reference/postgres/how-to/how-to-enable-pg-stat-statements-postgres/) - Installation et configuration[18]

**Configuration pg_stat_statements :**

```
shared_preload_libraries = 'pg_stat_statements'
pg_stat_statements.track = all
pg_stat_statements.max = 10000
pg_stat_statements.track_utility = on
pg_stat_statements.track_io_timing = on
```

**Autovacuum :**

- [Configuration autovacuum](https://www.postgresql.org/docs/current/runtime-config-autovacuum.html) - Paramètres automatisation[19]
- [Guide AWS autovacuum](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Appendix.PostgreSQL.CommonDBATasks.Autovacuum.html) - Bonnes pratiques[20]

**Nouveautés PostgreSQL 17 :**

- [Communiqué PostgreSQL 17](https://www.postgresql.org/about/press/presskit17/fr/) - Nouvelles fonctionnalités et améliorations[21]
- Optimisations VACUUM avec nouvelle structure de données (20x moins de mémoire)[21]
- Interface I/O streaming améliorée[21]
- Support JSON_TABLE SQL/JSON[21]

## 🔍 Spécifiquement pour Directus

### Index recommandés et optimisation

**Guide optimisation Directus :**

- [Optimisation performance Directus](https://dev.to/parthspan/optimizing-directus-performance-tips-for-fast-and-efficient-headless-cms-8kf) - Stratégies complètes[22]
- [Recommandations index database](https://www.datadoghq.com/blog/database-monitoring-index-recommendations/) - Méthodes d'identification des opportunités d'indexation[23]

**Bonnes pratiques indexation :**

- Analyser les plans d'exécution (EXPLAIN) pour identifier les sequential scans[23]
- Créer des index sur les colonnes utilisées dans les WHERE clauses fréquentes[23]
- Index composites pour les requêtes multi-colonnes[23]
- Surveiller les métriques de requêtes pour prioriser les optimisations[23]

### Configuration cache : Intégration Directus + Dragonfly

**Documentation cache Directus :**

- [Configuration cache Directus](https://directus.io/docs/configuration/cache) - Guide complet[24]

**Configuration optimale Directus + Dragonfly :**

```
CACHE_ENABLED=true
CACHE_STORE=redis
CACHE_TTL=30m
CACHE_AUTO_PURGE=true
CACHE_REDIS_HOST=dragonfly_host
CACHE_REDIS_PORT=6379
```

**Paramètres cache avancés :**

- `CACHE_VALUE_MAX_SIZE` : Taille max des valeurs cachées[24]
- `CACHE_HEALTHCHECK_THRESHOLD` : Seuil timeout healthcheck (150ms)[24]
- `CACHE_SCHEMA` : Cache du schéma de base (activé par défaut)[24]

### Pool de connexions et limites

**Configuration connexions PostgreSQL :**

- [Augmentation max_connections](https://stackoverflow.com/questions/30778015/how-to-increase-the-max-connections-in-postgres) - Guide pratique[25]
- [Scaling connexions PostgreSQL](https://www.citusdata.com/blog/2017/05/10/scaling-connections-in-postgres/) - Stratégies pool connexions[26]

**Recommandations pool :**

- Niveau sécurisé : 300-500 connexions[26]
- Utiliser PgBouncer en mode transaction pooling[26]
- Ajuster `shared_buffers` proportionnellement à `max_connections`[25]
- Configuration `max_connections = 300` et `shared_buffers = 80MB` pour charge moyenne[25]

**Intégration Directus spécialisée :**

- [Indexation Algolia avec Directus](https://docs.directus.io/blog/integrating-algolia-indexing-and-directus) - Optimisation recherche[27]
- [Issues cache Directus](https://github.com/directus/directus/issues/11378) - Résolution problèmes cache[28]

Ces liens et configurations vous permettront d'optimiser complètement votre stack Dragonfly + PostgreSQL 17.5 + Directus pour des performances maximales en production.

Sources
[1] Documentation | Dragonfly https://www.dragonflydb.io/docs/
[2] Question on Memory Usage, maxmemory and cache_mode settings https://github.com/dragonflydb/dragonfly/discussions/1453
[3] [PDF] PostgreSQL- Advanced Performance Tuning https://p2d2.cz/files/p2d2-2025-paul-tuning.pdf
[4] dragonflydb/dragonfly: A modern replacement for Redis ... - GitHub https://github.com/dragonflydb/dragonfly
[5] DragonflyDB Architecture Overview, Internals, and Trade-offs https://www.youtube.com/watch?v=XbV1LoVsbME
[6] Monitoring In-Memory Data Stores - Dragonfly https://www.dragonflydb.io/blog/monitoring-in-memory-datastores
[7] Replication | Dragonfly https://www.dragonflydb.io/docs/managing-dragonfly/replication
[8] Support for redis_latency_percentiles_usec Metric in DragonFlyDB https://github.com/dragonflydb/dragonfly/issues/5092
[9] High Availability - Dragonfly https://www.dragonflydb.io/docs/managing-dragonfly/high-availability
[10] A Preview of Dragonfly Cluster - DEV Community https://dev.to/dragonflydbio/bitmaps-in-dragonfly-compact-data-with-powerful-analytics-4j4d
[11] PostgreSQL Performance Tuning: Optimizing Database Parameters ... https://www.percona.com/blog/tuning-postgresql-database-parameters-to-optimize-performance/
[12] Documentation: 17: 19.4. Resource Consumption - PostgreSQL https://www.postgresql.org/docs/current/runtime-config-resource.html
[13] PostgreSQL Performance Tuning Settings - Vlad Mihalcea https://vladmihalcea.com/postgresql-performance-tuning-settings/
[14] Understanding the importance of shared_buffers, work_mem, and ... https://www.postgresql.fastware.com/pzone/2024-06-understanding-shared-buffers-work-mem-and-wal-buffers-in-postgresql
[15] PostgreSQL 17 bêta 1 - Loxodata https://www.loxodata.com/post/postgresql-17-beta1/
[16] Tuning max_wal_size in PostgreSQL - EDB https://www.enterprisedb.com/blog/tuning-maxwalsize-postgresql
[17] 17: F.30. pg_stat_statements — track statistics of SQL planning and ... https://www.postgresql.org/docs/current/pgstatstatements.html
[18] How to enable pg_stat_statements in PostgreSQL - Bytebase https://www.bytebase.com/reference/postgres/how-to/how-to-enable-pg-stat-statements-postgres/
[19] Documentation: 17: 19.10. Automatic Vacuuming - PostgreSQL https://www.postgresql.org/docs/current/runtime-config-autovacuum.html
[20] Working with PostgreSQL autovacuum on Amazon RDS for ... https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Appendix.PostgreSQL.CommonDBATasks.Autovacuum.html
[21] PostgreSQL: PostgreSQL 17 Press Kit https://www.postgresql.org/about/press/presskit17/fr/
[22] Optimizing Directus Performance: Tips for Fast and Efficient ... https://dev.to/parthspan/optimizing-directus-performance-tips-for-fast-and-efficient-headless-cms-8kf
[23] A deep dive into Database Monitoring index recommendations https://www.datadoghq.com/blog/database-monitoring-index-recommendations/
[24] Cache | Directus Docs https://directus.io/docs/configuration/cache
[25] How to increase the max connections in postgres? - Stack Overflow https://stackoverflow.com/questions/30778015/how-to-increase-the-max-connections-in-postgres
[26] Scaling Connections in Postgres - Citus Data https://www.citusdata.com/blog/2017/05/10/scaling-connections-in-postgres/
[27] Integrating Algolia Indexing and Directus https://docs.directus.io/blog/integrating-algolia-indexing-and-directus
[28] Caching seems not to work at all · Issue #11378 · directus ... - GitHub https://github.com/directus/directus/issues/11378
[29] Redis vs Dragonfly Performance (Latency - Throughput - Saturation) https://www.youtube.com/watch?v=DgcBFb4L0dI
[30] Overcoming Redis Limitations: The Dragonfly DB Approach https://www.dataengineeringpodcast.com/episodepage/overcoming-redis-limitations-the-dragonfly-db-approach
[31] What are some effective techniques for database performance tuning? https://www.dragonflydb.io/faq/effective-database-performance-tuning-techniques
[32] Dragonfly Real-Time Statistics Use Case Video - LinkedIn https://www.linkedin.com/posts/dragonflydb_dragonfly-real-time-statistics-use-case-video-activity-7312466258476613634-Xvq1
[33] Cluster Scalability: Redis Gossip vs. Dragonfly Orchestration https://www.linkedin.com/posts/dragonflydb_cluster-scalability-redis-gossip-vs-dragonfly-activity-7246943181076938752-EB9U
[34] tuning(7) - DragonFly On-Line Manual Pages https://man.dragonflybsd.org/?command=tuning&section=7
[35] Ensuring High Availability for Dragonfly in Kubernetes - General https://dragonfly.discourse.group/t/ensuring-high-availability-for-dragonfly-in-kubernetes/202
[36] A Hybrid-Strategy-Improved Dragonfly Algorithm for the Parameter ... https://www.mdpi.com/2071-1050/15/15/11791
[37] PostgreSQL Performance Tuning - pgEdge https://www.pgedge.com/blog/postgresql-performance-tuning
[38] Enhancing PostgreSQL Performance Monitoring: A Comprehensive ... https://stormatics.tech/blogs/enhancing-postgresql-performance-monitoring-a-comprehensive-guide-to-pg_stat_statements
[39] Dragonfly Configuration https://www.dragonflydb.io/docs/managing-dragonfly/operator/dragonfly-configuration
[40] Server Configuration Flags | Dragonfly https://www.dragonflydb.io/docs/managing-dragonfly/flags
[41] Configuration toolkit — Dragonfly 0.35.0 documentation https://dragonfly2.readthedocs.io/en/stable/config.html
[42] Getting Started - Command Line - Dragonfly - Read the Docs https://dragonfly-opt.readthedocs.io/en/master/getting_started_cli/
[43] make.conf(5) - DragonFly On-Line Manual Pages https://man.dragonflybsd.org/?command=make.conf&section=5
[44] Command-line Interface (CLI) — Dragonfly 0.35.0 documentation https://dragonfly2.readthedocs.io/en/stable/cli.html
[45] Dragonfly | An In-Memory Data Store without Limits https://www.dragonflydb.io
[46] Manager | Dragonfly https://d7y.io/docs/v2.0.6/reference/configuration/manager/
[47] Horizontally scalable Dragonfly Cluster #1498 - GitHub https://github.com/dragonflydb/dragonfly/discussions/1498
[48] PostgreSQL 17.5 Documentation https://www.postgresql.org/docs/current/index.html
[49] PostgreSQL 17.5 Release Notes https://www.postgresql.org/docs/release/17.5/
[50] PostgreSQL Performance Tuning and Optimization Guide - Sematext https://sematext.com/blog/postgresql-performance-tuning/
[51] 17: 27.2. The Cumulative Statistics System - PostgreSQL https://www.postgresql.org/docs/current/monitoring-stats.html
[52] PostgreSQL: AWS RDS Performance and monitoring - ITNEXT https://itnext.io/postgresql-aws-rds-performance-and-monitoring-12fd28f6c0a7
[53] Documentation: 17: 19.9. Run-time Statistics - PostgreSQL https://www.postgresql.org/docs/current/runtime-config-statistics.html
[54] Performance and scaling · directus directus · Discussion #11891 https://github.com/directus/directus/discussions/11891
[55] Configuration Options | Directus Docs https://docs.directus.io/self-hosted/config-options
[56] Requirements | Directus Docs https://directus.io/docs/self-hosting/requirements
[57] Corresponding Option in dragonfly.conf for DFLYCLUSTER CONFIG https://github.com/dragonflydb/dragonfly/discussions/2634
[58] Configure the Development Environment - Dragonfly https://d7y.io/docs/development-guide/configure-development-environment/
