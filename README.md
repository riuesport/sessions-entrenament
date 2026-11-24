# RIU · Planificador d'entrenaments

Web: https://riuesport.github.io/sessions-entrenament/

## Programació vigent
- **Obertura: 4 de gener de 2027.** Els sis primers mesocicles són **gener–juny 2027** (desembre retirat de la planificació d'obertura).
- Sessions per a **8 participants**, amb **4 estacions per parelles** i dos racks.
- Cada dia segueix un **patró principal** que canvia entre mesos, amb força bilateral i unilateral, mobilitat, activació i condicionament.
- L'editor mensual permet modificar exercicis, sèries, repeticions i imprimir cada dia.
- Nou botó **«Copiar aquest [dia] a les altres setmanes»**: només actua després de clicar i confirmar; substitueix les sessions d'aquell mateix dia al mes, però no les dates. Després pots modificar independentment cadascuna.
- **25 dissabtes especials** des del 9 de gener fins al 26 de juny, amb els WODs propis.
- Biblioteca d'exercicis, readaptació i gent gran preservades.

## Desament compartit (encara pendent d'activar)
- `riu-cloud-sync.js`: codi d'autenticació i sincronització preparat per a Supabase.
- `riu-cloud-config.js`: URL i clau pública del projecte, **encara en blanc**.
- `supabase-schema.sql` i `CONFIGURACIO_PRIVADA.md`: configuració de la base privada i permisos.
- Mentre no es connecti Supabase, les modificacions fetes al navegador **no es sincronitzen entre ordinadors**. Exporta còpies JSON abans de canvis importants.
- `dades/riu.json`: arxiu històric públic, **no** base de dades privada. No hi deseu noms ni dades de salut de clients.

## Seguretat
El repositori GitHub és públic i no s'ha d'utilitzar per desar dades personals de clients. Per activar la sincronització privada, configureu els usuaris i les polítiques RLS a Supabase, sense incloure mai secrets al codi.
