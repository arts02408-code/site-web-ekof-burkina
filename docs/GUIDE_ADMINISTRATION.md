# Guide d'administration du catalogue

## Produits et catégories

La V1 réutilise le catalogue WooCommerce EKOF existant. Les personnes disposant déjà d'un accès administrateur peuvent gérer produits, prix, images, catégories, marque EBEN Production et état de stock depuis l'administration WordPress/WooCommerce en place.

Cette vitrine n'ajoute pas de nouvel écran d'administration, ne crée pas de compte et n'embarque aucun identifiant. Le chemin de connexion ou les comptes autorisés ne sont pas documentés ici, faute d'accès confirmé.

## Mise à jour du numéro WhatsApp

1. Confirmer le numéro auprès du responsable EKOF.
2. Dans `site-config.js`, remplacer la valeur vide de `whatsappPhone` par les chiffres du numéro au format international, sans signe `+`, espaces ou tirets.
3. Tester un lien depuis ordinateur et smartphone. Vérifier le destinataire et le contenu avant envoi.

## Contrôle de publication

Avant de publier une fiche, vérifier nom, description, catégorie, prix XOF, photos, référence, marque et stock. Les informations visibles dans l'interface sont issues de WooCommerce et le site invite le client à confirmer les détails.
