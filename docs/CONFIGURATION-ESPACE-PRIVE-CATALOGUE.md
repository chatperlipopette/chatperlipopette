# Configuration de l’espace privé du catalogue

Le code de l’espace privé est accessible sous `/admin/catalogue`. L’accès utilise un mot de passe administrateur et une session sécurisée. Les badges sont enregistrés dans Supabase.

## 1. Créer la base de données

1. Crée ou ouvre un projet sur https://supabase.com/dashboard.
2. Ouvre **SQL Editor**.
3. Exécute le contenu du fichier `supabase/catalogue_game_flags.sql` du dépôt.

## 2. Configurer les variables d’environnement dans Vercel

Dans **Vercel → projet → Settings → Environment Variables**, ajoute :

- `NEXT_PUBLIC_SUPABASE_URL` : URL du projet Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : clé publique/anon du projet Supabase.
- `SUPABASE_SERVICE_ROLE_KEY` : clé secrète service-role Supabase. **Ne la préfixe jamais par NEXT_PUBLIC et ne la publie jamais.**
- `ADMIN_PASSWORD` : choisis un mot de passe long et unique d’au moins 12 caractères. Il est conservé uniquement dans les variables secrètes de Vercel, pas dans le code.
- `ADMIN_SESSION_SECRET` : une clé secrète aléatoire d’au moins 32 caractères, différente du mot de passe.

Pour générer une clé de session aléatoire, tu peux utiliser `openssl rand -base64 32` sur un ordinateur équipé d’OpenSSL.

Active les variables pour Production (et Preview si tu souhaites tester), puis redéploie le site.

## 3. Se connecter et tester

1. Ouvre `/admin/catalogue/connexion` sur le domaine du site.
2. Saisis le mot de passe administrateur.
3. Coche les nouveautés et coups de cœur puis clique sur **Enregistrer**.
4. Ouvre `/catalogue` dans une fenêtre privée pour vérifier les badges visibles publiquement.
5. Clique sur **Se déconnecter** pour fermer la session.

La session expire après 12 heures. Le cookie de session est HttpOnly et signé côté serveur. Les routes de lecture/écriture de l’administration vérifient cette session ; les visiteurs du site ne peuvent pas modifier les badges.

Si Supabase ou les variables ne sont pas configurés, le catalogue public existant continue de fonctionner, mais les badges de la base de données et l’enregistrement des changements ne seront pas disponibles.
