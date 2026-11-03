# EKOF Burkina — Vitrine commerciale V1

Vitrine statique responsive utilisant la structure HTML, CSS, JavaScript et données locales des autres sites : `index.html`, `styles.css`, `app.js`, `site-config.js` et `catalogue-apercu.js`. La V1 permet de découvrir les produits, de consulter les prix affichés et de préparer une demande via WhatsApp. Aucun panier ni paiement en ligne n'est intégré.

## Ouvrir pour parcourir et proposer des ajustements

Double-cliquer sur `index.html`, ou l'ouvrir directement dans Chrome/Edge. Le mode aperçu local n'exige ni serveur, ni installation, ni autorisation PowerShell : recherche, filtres, fiches, prix et produits EBEN utilisent l'instantané du catalogue joint. Un bandeau distingue ces données locales du catalogue en direct.

Les images produits sont chargées depuis le site EKOF et requièrent une connexion Internet. Les prix et disponibilités de l'instantané doivent être confirmés auprès de l'équipe.

## Prévisualisation en direct (optionnelle)

Pour tester le catalogue mis à jour en temps réel, dans un PowerShell autorisé, à la racine :

```powershell
.\preview.ps1
```

Ouvrir `http://localhost:8000/`. Le script relaie uniquement les lectures publiques autorisées vers le catalogue EKOF.

## Configuration et livraison

Consulter [docs/CONFIGURATION_EKOF.md](./docs/CONFIGURATION_EKOF.md) pour le numéro WhatsApp et le déploiement, et [docs/GUIDE_UTILISATION.md](./docs/GUIDE_UTILISATION.md) pour présenter le site.

Les coordonnées BATIANA TECH / SHALOM INT ne sont pas intégrées aux zones commerciales du site. Les coordonnées EKOF Burkina sont laissées à configurer dans `site-config.js` tant qu'elles n'ont pas été confirmées.
