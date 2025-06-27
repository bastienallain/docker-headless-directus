# Directus Stack - Multi-Environment Docker Setup

Stack Docker complète pour Directus avec différents environnements et variantes de cache.

## 🚀 Quick Start

```bash
# Lancer l'environnement de développement
make dev

# Ou lancer la variante avec Dragonfly
make dragonfly

# Accéder à Directus
open http://localhost:8055
```

**Identifiants par défaut** :
- Email : `admin@example.com`  
- Mot de passe : `admin_password_123`

## 📁 Structure

```
directus-stack/
├── environments/          # Configurations par environnement
│   ├── dev/              # Développement (Redis)
│   └── prod/             # Production (sécurisé)
├── variants/             # Variantes avec différents composants
│   ├── with-dragonfly/   # Cache Dragonfly (plus performant)
│   └── with-valkey/      # Cache Valkey (à venir)
├── shared/               # Ressources partagées
│   ├── scripts/          # Scripts utilitaires
│   ├── nginx/            # Configuration Nginx
│   └── init-db/          # Scripts d'initialisation DB
├── docs/                 # Documentation spécialisée
└── Makefile             # Commandes simplifiées
```

## 🛠 Commandes Disponibles

| Commande | Description |
|----------|-------------|
| `make help` | Affiche l'aide |
| `make dev` | Lance l'env de développement |
| `make dragonfly` | Lance avec cache Dragonfly |
| `make logs` | Affiche les logs en temps réel |
| `make backup` | Sauvegarde la base de données |
| `make reset` | Reset complet (⚠️ supprime les données) |
| `make stats` | Stats des conteneurs |

## 🔧 Services Inclus

### Environnement Dev
- **Directus** : http://localhost:8055
- **Adminer** : http://localhost:8080
- **PostgreSQL** : Port 5432
- **Redis** : Port 6379

### Variante Dragonfly
- **Directus** : http://localhost:8055
- **Adminer** : http://localhost:8080
- **PostgreSQL** : Port 5432
- **Dragonfly** : Port 6379 (compatible Redis)
- **Admin Dragonfly** : http://localhost:9998
- **Métriques** : http://localhost:9121/metrics

## ⚡ Dragonfly vs Redis

**Pourquoi Dragonfly ?**
- 25x plus rapide sur certaines charges
- Multi-threading natif
- Compatible Redis (drop-in replacement)
- Moins de fragmentation mémoire

## 🔍 Monitoring & Debug

```bash
# Vérifier la santé de tous les services
./shared/scripts/health-check.sh

# Accéder au CLI du cache
make cache-cli

# Voir les métriques Dragonfly
curl http://localhost:9121/metrics | grep dragonfly

# Shell dans Directus
make shell
```

## 📊 Configuration Cache

Le cache est optimisé pour Directus avec :
- Cache des requêtes API
- Cache des transformations d'images
- Sessions utilisateurs
- Rate limiting

## 🔒 Sécurité

- Environnement **dev** : Configuration ouverte pour faciliter le développement
- Environnement **prod** : Docker Secrets, réseaux isolés, TLS

## 📝 Développement

Pour modifier la configuration :
1. Éditer les fichiers `.env`
2. Relancer avec `make down && make up`
3. Tester avec `./shared/scripts/health-check.sh`

## 🆘 Troubleshooting

| Problème | Solution |
|----------|----------|
| Port déjà utilisé | `make down` puis `make clean` |
| Erreur de permissions | Vérifier les volumes Docker |
| Cache ne fonctionne pas | `make flush-cache` |
| Base corrompue | `make reset` (⚠️ perte de données) |

## 📚 Documentation

- [Dragonfly](docs/dragonfly/README.md) - Configuration avancée Dragonfly  
- [Redis](docs/redis/README.md) - Configuration Redis standard
- [Directus](docs/directus/README.md) - Optimisations Directus

---

**Stack maintenue avec ❤️ pour un développement efficace !**