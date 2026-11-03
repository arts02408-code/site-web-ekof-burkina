# Rapport d'audit EKOF BURKINA

## Périmètre et état initial

Le dossier de travail ne contenait aucune application, aucun gestionnaire de dépendances, aucun test ni document de projet. Il ne contenait qu'un visuel `ekof_Plan de travail 1.png`, utilisé comme logo EKOF. Aucun historique Git n'était disponible dans ce dossier.

Le site public `ekofburkina.com` et son API Store WooCommerce ont été consultés le 2 novembre 2026. Les pages HTML publiques affichent des avertissements PHP répétés liés aux taxonomies et des éléments de thème génériques. La page contact et la page « À propos » contiennent des coordonnées et textes de démonstration (Londres/New York, numéro et e-mail factices) : ils ne sont pas repris.

L'API Store WooCommerce a néanmoins fourni des produits publiés, prix en XOF, catégories, images, marques et états de stock. Exemples vérifiés : « Système d'énergie solaire 11 kW » et « Chaise moderne multiple fonctions », cette dernière associée à la marque « Ebène production ». Les fiches publiques ne fournissent pas toujours de référence (SKU).

Le catalogue expose deux marques distinctes associées à EBEN : « Ebène production » (`ebene-production`) et « EBENE PRODUCTION » (`ebene-pro-academie`), avec des produits sous chacune. Elles sont présentées séparément dans la vitrine plutôt que fusionnées sans validation.

## Décisions

- Création d'une vitrine statique sans dépendances, connectée en lecture seule à l'API WooCommerce existante afin de laisser l'équipe maintenir le catalogue dans l'administration existante.
- Le site ne propose ni panier, ni paiement, ni formulaire prétendant enregistrer une commande.
- Les données de prix, de stock, de description et d'image sont affichées depuis l'API actuelle ; les prix et disponibilités sont signalés comme à confirmer.
- Le fichier logo fourni est conservé sans modification. Les visuels produit viennent du catalogue EKOF public ; aucun faux produit ni prix codé en dur n'est ajouté.
- Le numéro WhatsApp, les coordonnées, l'adresse, les horaires et l'e-mail n'ont pas pu être confirmés. La configuration du numéro reste vide ; les liens WhatsApp ouvrent le partage WhatsApp avec le message prérempli afin de ne pas contacter un numéro deviné.
- Le catalogue/les pages ne sont pas déployés et aucune modification n'a été apportée au site existant.

## Points restant à valider

1. Confirmer le numéro WhatsApp professionnel EKOF et le renseigner dans `site-config.js`.
2. Vérifier la propriété et le droit d'utilisation du logo local et des images du catalogue sur le nouveau site.
3. Vérifier la qualité, l'actualité et l'exactitude des descriptions, prix et stocks dans l'administration WooCommerce. Les descriptions publiées peuvent contenir des caractéristiques à confirmer.
4. Confirmer si les deux marques EBEN distinctes du catalogue doivent rester séparées ou être harmonisées.
5. Confirmer le domaine et l'hébergement visés avant déploiement.
6. Confirmer les coordonnées commerciales, horaires, adresse et informations de livraison/retour avant publication de ces renseignements.
