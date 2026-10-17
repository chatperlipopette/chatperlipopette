# Mise en place de l’espace privé du catalogue

Le code de l’espace privé est ajouté sous `/admin/catalogue`. Pour l’activer en production, il faut configurer un projet Supabase et les variables d’environnement Vercel.

## 1. Créer la base de données

1. Crée ou ouvre un projet sur https://supabase.com/dashboard.
2. Ouvre **SQL Editor**.
3. Exécute le contenu du fichier `supabase/catalogue_game_flags.sql` du dépôt.

La table conserve un code de jeu, le statut « nouveauté » et le statut « coup de cœur ». Les visiteurs ont uniquement le droit de lecture.

## 2. Activer Google comme fournisseur de connexion

1. Dans Supabase, ouvre **Authentication → Sign In / Providers → Google** et active Google.
2. Configure un identifiant OAuth et un secret dans Google Cloud Console.
3. Dans les URL de redirection autorisées Google, ajoute l’URL de callback Supabase indiquée dans la configuration du fournisseur Google Supabase.
4. Dans **Authentication → URL Configuration**, ajoute l’URL du site Vercel comme URL du site et autorise :
   `https://TON-DOMAINE/auth/callback`
   ainsi que l’URL de prévisualisation Vercel si nécessaire.

## 3. Ajouter les variables d’environnement dans Vercel

Dans **Vercel → projet → Settings → Environment Variables**, ajoute :

- `NEXT_PUBLIC_SUPABASE_URL` : URL du projet Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : clé publique/anon du projet.
- `SUPABASE_SERVICE_ROLE_KEY` : clé secrète service-role du projet. **Ne jamais la préfixer par NEXT_PUBLIC et ne jamais la publier.**
- `ADMIN_EMAIL` : adresse exacte du compte Google qui sera seul autorisé à gérer les badges.

Active les variables pour Production (et Preview si tu souhaites tester), puis redéploie.

## 4. Tester

1. Ouvre `/admin/catalogue/connexion` sur le domaine du site.
2. Connecte-toi avec le compte Google configuré dans `ADMIN_EMAIL`.
3. Coche les nouveautés et coups de cœur puis clique sur **Enregistrer**.
4. Ouvre `/catalogue` dans une fenêtre privée pour vérifier les badges visibles publiquement.

Si Supabase n’est pas configuré, le catalogue existant reste utilisable sans les nouveaux badges de base de données ; l’espace privé affiche un message de configuration.
