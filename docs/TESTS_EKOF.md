# Tests et contrôles EKOF V1

## Parcours local sans installation

Double-cliquer sur `index.html` ou l'ouvrir avec Chrome/Edge. Le mode `file://` charge l'instantané local `catalogue-apercu.js` et permet de parcourir les données sans serveur. Une connexion Internet reste nécessaire pour les photos externes.

Pour contrôler le catalogue live, le serveur facultatif peut être démarré avec `.\preview.ps1`, puis visité à `http://localhost:8000/`.

## Vérifications manuelles à effectuer

- Accueil : navigation, logo, chargement des produits et catégories.
- Catalogue : recherche, changement de catégorie, tri et pagination.
- Fiche : produit, image, prix, disponibilité, fil d'Ariane et métadonnées.
- WhatsApp : message prérempli, URL/fiche, sélection du destinataire tant que le numéro est manquant.
- Pages EKOF, EBEN Production et Contact ; liens Facebook.
- Largeurs smartphone, tablette et ordinateur ; menu mobile et navigation clavier.
- `robots.txt`, `sitemap.xml`, liens et images sur le domaine de déploiement.
- Après configuration du numéro, confirmer le destinataire sans envoyer de message involontairement.

## Vérifications exécutées dans cette livraison

- Audit du contenu local : aucun code source initial ni dépendances trouvés ; un visuel EKOF était présent.
- Consultation de pages et endpoints publics du domaine `ekofburkina.com` : les pages du thème exposent des avertissements PHP et des informations de démonstration. L'API WooCommerce Store a renvoyé des produits, prix, catégories, photos et marques.
- Le test initial du navigateur a révélé l'absence de CORS et l'échec de l'URL relative en `file://` ; un instantané de catalogue a été ajouté pour le parcours par double-clic, tandis que le mode servi utilise une API relative en production et un relais local limité.
- Avec un serveur local de test et ce relais, le navigateur a chargé l'accueil, 4 produits et les images ; l'API a fourni 38 catégories et 18 marques (plus les options « toutes » dans les filtres).
- Ouverture de `index.html` en `file://` vérifiée sans serveur : accueil, 4 produits mis en avant, 38 catégories, 18 marques, 100 références de catalogue réparties sur 9 pages, prix, filtre EBEN et recherche « Chaise » (5 résultats).
- Les fiches produit directes s'ouvrent en mode fichier et les messages WhatsApp utilisent le lien public du produit existant ; les produits EBEN des deux marques sont visibles séparément.
- Recherche « Chaise », filtre de marque EBEN, filtre catégorie, tri par prix croissant et passage de la page 1 à la page 2 vérifiés.
- Fiche produit vérifiée : prix XOF, photo, disponibilité à confirmer, méta produit et message WhatsApp prérempli contenant nom, prix et URL produit ; aucun bouton panier/paiement.
- Pages EKOF, EBEN Production (produits des deux marques EBEN publiées au catalogue), Contact et 404 vérifiées.
- Vue mobile à 390 px : menu ouvert/fermé et absence de débordement horizontal vérifiés. Logo chargé. Aperçu visuel également contrôlé sur ordinateur.
- Après harmonisation visuelle, le navigateur confirme le bleu du logo (`#305D9B`) sur l'accent principal, le bleu profond au pied de page, la conservation du vert WhatsApp, le chargement de 4 produits et l'absence de débordement horizontal.
- `preview.ps1` a été analysé avec le parseur PowerShell sans erreur de syntaxe. Sa propre exécution nécessite une stratégie Windows autorisant les scripts ; le double-clic sur `index.html` n'en dépend pas.
- Le contrôle de responsive sur appareils physiques, le test distinct sous Edge et la validation de la configuration de l'hébergement de production restent à effectuer.

Aucun build n'est défini dans ce projet statique. Node.js et Python ne sont pas installés dans l'environnement ; aucun `node --check`, test automatisé ni build n'est revendiqué.

Ne pas annoncer les tests manuels comme réussis avant leur exécution.
