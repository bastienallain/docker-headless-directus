# Directus Production avec Dragonfly Cache

Stack de production sécurisée avec SSL automatique Let's Encrypt.

## 🚀 Fonctionnalités Production

- **SSL automatique** : Let's Encrypt avec renouvellement automatique
- **Reverse Proxy** : Nginx avec gestion multi-domaines
- **Cache haute performance** : Dragonfly avec persistance
- **Sécurité renforcée** : Docker Secrets, réseaux isolés
- **Monitoring** : Logs structurés, healthchecks
- **Performance** : Limites de ressources optimisées

## 📋 Prérequis

1. **Domaine configuré** pointant vers votre serveur
2. **Ports ouverts** : 80 (HTTP) et 443 (HTTPS)
3. **Docker Swarm** activé pour les secrets : `docker swarm init`

## 🔧 Installation

### 1. Configuration du domaine

```bash
# Copier et adapter la configuration
cp .env.example .env
nano .env

# Modifier ces variables :
VIRTUAL_HOST=directus.yourdomain.com
LETSENCRYPT_HOST=directus.yourdomain.com
PUBLIC_URL=https://directus.yourdomain.com
LETSENCRYPT_EMAIL=admin@yourdomain.com
```

### 2. Création des secrets

```bash
# Base de données
echo "directus_prod" | docker secret create postgres_db -
echo "directus_user" | docker secret create postgres_user -
echo "$(openssl rand -base64 32)" | docker secret create postgres_password -

# Directus
echo "$(uuidgen)" | docker secret create directus_key -
echo "$(uuidgen)" | docker secret create directus_secret -

# Cache Dragonfly
echo "$(openssl rand -base64 32)" | docker secret create dragonfly_password -
```

### 3. Démarrage

```bash
docker compose up -d
```

### 4. Vérification

```bash
# Vérifier les conteneurs
docker compose ps

# Suivre les logs
docker compose logs -f

# Tester l'accès
curl -I https://directus.yourdomain.com/server/info
```

## 🔒 Sécurité

### Fonctionnalités activées

- **HTTPS forcé** avec certificats Let's Encrypt
- **Docker Secrets** pour les mots de passe
- **Réseau backend isolé** (pas d'accès direct internet)
- **Rate limiting** : 100 req/min par IP
- **Assets protégés** : Authentification requise
- **Cookies sécurisés** : SameSite=strict

### Recommandations additionnelles

```bash
# Firewall - autoriser seulement SSH, HTTP, HTTPS
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Rotation des secrets (tous les 3 mois)
./scripts/rotate-secrets.sh
```

## ⚡ Performance

### Optimisations incluses

- **Dragonfly cache** : 4GB mémoire, sauvegarde toutes les 15min
- **Limites de ressources** définies pour chaque service
- **Cache Directus** : Requêtes, schéma, permissions
- **Images optimisées** : Transformation et cache
- **Logs JSON** pour monitoring

### Monitoring recommandé

```bash
# Stats en temps réel
docker compose stats

# Métriques Dragonfly
docker compose exec dragonfly redis-cli -a "$(docker secret inspect dragonfly_password --format '{{.Spec.Data}}' | base64 -d)" info memory
```

## 🔧 Maintenance

### Sauvegarde

```bash
# Base de données
docker compose exec postgres pg_dump -U directus directus > backup_$(date +%Y%m%d).sql

# Uploads
docker run --rm -v dragonfly_directus_prod_uploads_data:/data -v $(pwd):/backup alpine tar czf /backup/uploads_$(date +%Y%m%d).tar.gz -C /data .
```

### Mise à jour

```bash
# Mettre à jour les images
docker compose pull

# Redémarrer avec les nouvelles images
docker compose up -d
```

### Rotation des certificats

Les certificats Let's Encrypt se renouvellent automatiquement. En cas de problème :

```bash
# Forcer le renouvellement
docker compose exec letsencrypt /app/force_renew
```

## 🚨 Troubleshooting

| Problème | Solution |
|----------|----------|
| Certificat SSL non créé | Vérifier DNS pointant vers le serveur |
| 502 Bad Gateway | Vérifier que Directus démarre correctement |
| Dragonfly ne démarre pas | Vérifier la mémoire disponible (min 1GB) |
| Erreur secrets | Vérifier `docker swarm init` |

## 📊 Architecture

```
Internet → Nginx Proxy (80/443) → Directus (8055)
                ↓                      ↓
            Let's Encrypt         Backend Network
                                      ↓
                                 PostgreSQL + Dragonfly
```

**Réseau backend isolé** : PostgreSQL et Dragonfly ne sont pas accessibles depuis internet.

---

Stack de production robuste et sécurisée ! 🔒