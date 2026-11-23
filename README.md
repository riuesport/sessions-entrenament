# RIU · Planificador d'entrenaments

- **index.html**: planificador web RIU, publicat amb GitHub Pages.
- **riu-cloud-sync.js**: sincronització automàtica i control de revisions amb Supabase.
- **riu-cloud-config.js**: URL i clau **pública** de Supabase. **Encara és en blanc**: el desament compartit no està activat.
- **supabase-schema.sql**: taules privades, polítiques RLS i desament sense sobreescriptures.
- **CONFIGURACIO_PRIVADA.md**: passos per activar el sistema privat.
- **dades/riu.json**: còpia històrica anterior. El nou HTML no l'utilitza per a sincronització.

## Estat actual

La programació funciona en mode local. Fins que es creï el projecte privat de Supabase, s'autoritzin els dos comptes i es completi `riu-cloud-config.js`, **els canvis no es comparteixen entre ordinadors**.

La web de GitHub Pages és pública, però les dades de Supabase quedaran privades amb autenticació i RLS després d'activar-lo. **No pugeu dades personals o de salut a aquest repositori públic.**

## Activació

Llegiu [CONFIGURACIO_PRIVADA.md](CONFIGURACIO_PRIVADA.md) abans de posar cap dada de client real al servei. Primer cal configurar Supabase i executar l'SQL, després afegir la URL i la clau *publishable* de Supabase. **Mai no publiqueu una clau `service_role`, una contrasenya ni cap secret.**
