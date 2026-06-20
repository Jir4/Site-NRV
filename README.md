# Nancy Roller Vitesse - Prototype Family Sport

Prototype Astro statique pour le futur site du club.

## Commandes

- `npm install`
- `npm run dev`
- `npm run build`

Le build statique est généré dans `dist/` et peut être servi par Caddy.

## Contenu

Les textes principaux sont centralisés dans `src/data/site.ts`.

## HelloAsso

Le lien d'inscription est un placeholder. Pour consommer l'API HelloAsso plus tard, ne pas exposer de secret OAuth côté navigateur. Utiliser une fonction serveur, un proxy derrière Caddy, ou une synchronisation au build.
