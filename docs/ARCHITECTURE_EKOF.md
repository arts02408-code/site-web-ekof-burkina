# Architecture EKOF V1

## Vue d'ensemble

Vitrine front-end statique en HTML, CSS et JavaScript natifs, sans compilation ni dépendance npm.

- `index.html` : structure, navigation, métadonnées et pied de page.
- `styles.css` : identité visuelle, composants et mises en page responsives.
- `app.js` : navigation à paramètres d'URL, rendu des pages, catalogue et demandes WhatsApp.
- `site-config.js` : URL publique de l'API, numéro WhatsApp et liens sociaux.
- `catalogue-apercu.js` : instantané statique des produits/catégories/marques, chargé uniquement lorsque la page est ouverte en `file://`.
- `preview.ps1` : serveur local sans dépendance, avec proxy GET limité au catalogue public EKOF.
- `ekof_Plan de travail 1.png` : visuel de marque fourni dans le dossier.
- `robots.txt` et `sitemap.xml` : référencement technique de base.

## Source du catalogue

En production, l'application interroge en lecture seule `/wp-json/wc/store` sur le même origin que la vitrine :

- `products` : catalogue et pages de résultats.
- `products/{id}` : fiche produit.
- `products/categories` : catégories.

WooCommerce reste la source de vérité pour le contenu et l'administration. Les requêtes utilisent pagination API ; le navigateur n'appelle aucune route panier/commande/paiement. La réponse tolère les avertissements PHP affichés avant le JSON, mais une réponse invalide ou une erreur HTTP est affichée clairement. Le serveur public ne permet pas CORS : un hébergement de production sur un autre origin ne fonctionnera pas sans proxy contrôlé.

En local, `preview.ps1` sert les fichiers et relaie côté serveur les seules routes GET `products`, `products/{id}`, `products/categories` et `products/brands` vers `ekofburkina.com`. Il n'expose aucun paramètre d'URL permettant de choisir une autre destination.

Lorsqu'`index.html` est ouvert directement en `file://`, l'application charge `catalogue-apercu.js` en script local puis applique recherche, catégorie, marque, tri et pagination au jeu de données embarqué. Aucun serveur n'est nécessaire pour parcourir cette version. Un bandeau précise qu'il s'agit d'une copie d'aperçu.

## Navigation

Les états partageables sont des paramètres de requête : `?vue=boutique`, `?vue=eben`, `?vue=a-propos`, `?vue=contact`, `?produit=slug&id=ID`, ainsi que les filtres `q`, `categorie`, `tri` et `page`.

## WhatsApp

`whatsappPhone` doit contenir le numéro officiel au format international sans `+` (par exemple `226XXXXXXXX`, uniquement après confirmation par EKOF). Sans numéro, le message prérempli s'ouvre dans le sélecteur WhatsApp générique ; l'internaute doit choisir le contact EKOF. Aucune commande n'est enregistrée ni confirmée par le site.

## Limites de l'architecture

- Le catalogue dépend de la disponibilité de l'API publique EKOF et de l'autorisation CORS du serveur.
- Les produits, fiches et métadonnées sont rendus côté navigateur ; le référencement des fiches dépend de l'indexation JavaScript.
- Les images restent hébergées par le domaine source.
- Aucun formulaire, administration additionnelle, compte client, panier, paiement ou livraison n'est implémenté.

## Évolution V2

Voir [ROADMAP_EKOF_V2.md](./ROADMAP_EKOF_V2.md). L'administration catalogue reste dans WooCommerce, ce qui évite de dupliquer le modèle produit en V1.
