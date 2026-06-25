# Nancy Roller Vitesse - Prototype Family Sport

Prototype Astro statique pour le futur site du club.

## Commandes

- `npm install`
- `npm run dev`
- `npm run build`

Le build statique est généré dans `dist/` et peut être servi par Caddy.

## Contenu

Les textes principaux sont centralisés dans `src/data/site.ts`.

Pour modifier un lieu, changer son adresse dans `src/data/site.ts`, puis lancer `npm run generate:maps`. Le script met à jour le cache de géocodage dans `src/data/geocoded-locations.json` et les cartes statiques dans `public/generated/maps/`. Ces fichiers générés doivent être versionnés avec la modification.

Les IDs de lieux doivent rester en kebab-case (`bazin`, `moulin-noir`, etc.). Si un ID change, mettre aussi à jour les `locationIds` des horaires. Les anciennes cartes sont signalées par le générateur et peuvent être supprimées avec `npm run generate:maps -- --clean`.

## HelloAsso

Le lien d'inscription est un placeholder. Pour consommer l'API HelloAsso plus tard, ne pas exposer de secret OAuth côté navigateur. Utiliser une fonction serveur, un proxy derrière Caddy, ou une synchronisation au build.
