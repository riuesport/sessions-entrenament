# RIU · Planificador d'entrenaments

Aplicació web estàtica de RIU, publicada des de `index.html` amb GitHub Pages.

## Contingut actual (novembre de 2026)
- Programació de sis mesocicles, de desembre de 2026 a maig de 2027.
- Patrons de moviment, editor mensual de sessions, exercicis en anglès i impressió individual.
- Entrenaments dels dissabtes i programació per a grups reduïts.
- Biblioteca d'exercicis filtrable per patrons i material.
- Readaptació per fases i fitxes de sessions, i mesocicles de gent gran.

## On es guarden els canvis?
- **L'HTML actual desa els canvis localment al navegador**. No els publica automàticament al repositori ni els sincronitza entre ordinadors.
- Fes servir **Exportar còpia JSON** i **Importar còpia** per transferir o desar la teva feina.
- Per publicar una nova versió per a tothom, s'ha d'actualitzar `index.html` a la branca `main`.
- Aquesta versió utilitza una clau de desament diferent per evitar que dades antigues del navegador substitueixin automàticament la nova programació. Les dades anteriors no s'han esborrat deliberadament.

## Fitxers
- `index.html`: versió vigent del planificador.
- `dades/riu.json`: còpia **antiga** de la configuració compartida, conservada per compatibilitat/històric. El nou HTML **no la carrega ni la publica automàticament**.
- `.nojekyll`: permet publicar els fitxers directament a GitHub Pages.

## Privacitat
Aquest repositori és públic. **No hi publiquis noms, dades de salut, historials ni fitxes de clients reals.** La funció de fitxes del planificador no és un sistema d'història clínica protegit: utilitza codis o pseudònims i emmagatzematge adequat quan calgui gestionar informació sensible.

## Publicació web
Si GitHub Pages està habilitat des de la branca `main` i carpeta `/(root)`, l'adreça habitual és:
https://riuesport.github.io/sessions-entrenament/
