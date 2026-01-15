# FullEnrich Proxy pour Salesforce

Proxy serverless pour contourner le blocage User-Agent de FullEnrich quand on appelle depuis Salesforce.

## Déploiement sur Vercel

### Étape 1 : Créer un repo GitHub

1. Va sur [github.com](https://github.com) et connecte-toi
2. Clique sur "New repository" (bouton vert)
3. Nom : `fullenrich-proxy`
4. Visibilité : Private (recommandé)
5. Clique "Create repository"

### Étape 2 : Push le code

Dans ton terminal :

```bash
cd /Users/louis/Projects/fullenrich-proxy
git init
git add .
git commit -m "Initial commit - FullEnrich proxy"
git branch -M main
git remote add origin https://github.com/TON_USERNAME/fullenrich-proxy.git
git push -u origin main
```

### Étape 3 : Déployer sur Vercel

1. Va sur [vercel.com](https://vercel.com)
2. Clique "Sign Up" → "Continue with GitHub"
3. Autorise Vercel à accéder à ton GitHub
4. Clique "Add New..." → "Project"
5. Sélectionne le repo `fullenrich-proxy`
6. Clique "Deploy"

### Étape 4 : Récupérer l'URL

Après déploiement, Vercel te donne une URL comme :
```
https://fullenrich-proxy-xxxxx.vercel.app
```

Note cette URL, on en aura besoin pour Salesforce.

## Utilisation

L'API proxy expose les mêmes endpoints que FullEnrich :

- `POST /api/enrich/v1/contact/enrich/bulk` - Démarrer un enrichissement
- `GET /api/enrich/v1/contact/enrich/bulk/{id}/results` - Récupérer les résultats

Passe ton API key dans le header `Authorization: Bearer <key>` comme d'habitude.
