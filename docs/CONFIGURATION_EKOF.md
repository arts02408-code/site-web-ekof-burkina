# Configuration EKOF

## Parcourir le site (sans serveur)

Double-cliquer sur `index.html` ou l'ouvrir dans Chrome/Edge. `catalogue-apercu.js` fournit une copie locale du catalogue au navigateur, car les navigateurs interdisent les appels à l'API d'un autre domaine depuis les fichiers `file://`. Les filtres, les fiches et les tarifs affichés dans cet aperçu sont issus de la copie datée et doivent être confirmés.

Les photos chargées depuis le site EKOF nécessitent une connexion Internet. Pour utiliser le site complètement hors ligne, il faudrait également disposer des droits et embarquer les images dans le dossier.

## Prérequis

- Un navigateur moderne.
- Pour l'aperçu par double-clic : aucun autre outil.
- Pour le mode catalogue en direct : Windows PowerShell 5+ et l'accès réseau au catalogue public EKOF.

Aucun `npm install` ou build n'est nécessaire.

## Paramètres publics

Modifier `site-config.js` :

- `catalogApi` : URL Store API WooCommerce publique ; ne pas y placer de secret.
- `whatsappPhone` : numéro officiel, seulement après validation écrite/orale EKOF, chiffres internationaux sans `+`. Exemple de format uniquement : `226XXXXXXXX`.
- `facebookEkof` et `facebookEben` : pages officielles fournies.

Le paramètre WhatsApp est volontairement vide tant que le numéro n'est pas confirmé. Ne pas saisir un numéro supposé.

## Aperçu de données en direct (facultatif)

Depuis la racine du projet, lancer :

```powershell
.\preview.ps1
```

Puis ouvrir `http://localhost:8000/`. Le script sert les fichiers et relaie les lectures du Store API EKOF. Ce mode utilise le catalogue à jour en direct.

Le double-clic sur `index.html` reste disponible si la stratégie d'exécution Windows bloque le script.

## Déploiement

Publier les fichiers du front-end à la racine du domaine EKOF après validation des coordonnées, du numéro WhatsApp, du domaine et des droits d'utilisation des images. Le `catalogApi` relatif (`/wp-json/wc/store`) exige le même origin HTTPS que l'API WooCommerce, car le serveur public ne permet pas CORS. L'hébergement doit servir la vitrine à la racine tout en conservant la route `/wp-json/` de WordPress, et servir `robots.txt` / `sitemap.xml`.

Ne pas remplacer le WordPress actuel sans plan de migration et sauvegarde. L'API du site WooCommerce doit rester accessible au nouveau front-end.
