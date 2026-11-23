# RIU · Desament compartit i privat

Aquesta preparació manté **GitHub Pages** com a web pública, i desa la informació editable a **Supabase** sota autenticació i Row Level Security (RLS). Els fitxers JS públics **NO contenen contrasenyes ni cap clau secreta**.

## Estat abans de completar la configuració

La versió de GitHub és compatible amb el mode local. El desament compartit **no s'activarà** fins que es completi la configuració següent. No s'ha creat cap base de dades de Supabase ni cap compte en aquesta preparació.

## Activació

1. Crear o connectar un projecte a [Supabase](https://supabase.com/dashboard). Configurar la regió europea adequada, la facturació i les condicions de tractament de dades abans de guardar dades de salut reals.
2. A **SQL Editor**, executar `supabase-schema.sql`.
3. A **Authentication > Users**, crear/invitar els comptes personals dels dos entrenadors. Desactivar l'alta lliure a la configuració d'Auth i establir contrasenyes fortes i MFA si està disponible.
4. Tornar al **SQL Editor** i executar les línies comentades al final de `supabase-schema.sql` després de substituir els emails. Comprovar que `riu_members` conté EXACTAMENT dos usuaris. No cal publicar les adreces a GitHub.
5. A **Project Settings > API Keys**, copiar el **Project URL** i la **publishable key** (o `anon` de client). Afegir-los a `riu-cloud-config.js`:
   ```js
   window.RIU_CLOUD_CONFIG = {
     url: 'https://<PROJECT_REF>.supabase.co',
     publishableKey: '<PUBLISHABLE_KEY>'
   };
   ```
   **Mai** afegir `service_role`, `secret`, contrasenyes o tokens privats. Les claus publishable són públiques per disseny, mentre que l'accés real el controla RLS.
6. Pujar el fitxer de configuració a GitHub i obrir la web. Apareixerà la pantalla d'inici de sessió. Iniciar sessió amb el primer entrenador i prémer **Crear l'espai compartit** (només una vegada). L'altre entrenador ja hi podrà entrar amb les seves credencials.
7. Si ja heu personalitzat sessions a la versió local: exportar una còpia JSON del navegador antic i, **després** d'iniciar sessió, importar-la amb l'opció existent. Això substituirà la programació comuna; feu-ho una sola vegada i coordineu qui fa la importació.

## Funcionament

- Els canvis s'envien automàticament al servidor al cap d'uns instants. També hi ha **Desar ara**.
- Les altres pantalles comproven si hi ha canvis cada 15 segons i es posen al dia quan no tenen modificacions pendents.
- Si dues persones intenten desar revisions incompatibles, el servidor rebutja la segona; **cap canvi publicat se sobreescriu automàticament**. Feu una còpia JSON i recarregueu la versió més recent abans de fusionar els canvis manualment.
- En mode privat, no es desarà el nou contingut complet a `localStorage`; el compte de Supabase conserva el token de sessió al navegador. Les còpies JSON descarregades són sensibles si hi ha fitxes de clients.
- L'antic `dades/riu.json` de GitHub es conserva com a còpia històrica; no s'hi escriuen fitxes de clients. El nou sistema no el consulta.
- Aquest sistema té una única base de dades compartida. No ofereix edició simultània de camps en temps real ni un historial clínic auditat. Feu còpies periòdiques i configureu còpies de seguretat del projecte.

## Privacitat i dades de salut

- Si les fitxes contenen lesions, tractaments o altres dades de salut, són dades de categoria especial segons RGPD. Cal una base jurídica adequada, informació a l'usuari, control d'accés, retenció limitada, contracte de tractament de dades amb proveïdor i revisió del lloc d'allotjament i transferències.
- Manteniu el mínim de dades personals al planificador; feu servir codis pseudonimitzats quan sigui possible.
- No deseu dades personals ni fitxes clíniques a cap repositori públic ni envieu còpies JSON a canals insegurs.
- Només una persona autoritzada amb accés al SQL Editor ha de modificar `riu_members`.
- En revocar l'accés d'un entrenador, elimineu-lo de `riu_members`, desactiveu el compte i reviseu les sessions actives.

## Comprovacions recomanades abans de l'ús real

- Accés amb cada usuari autoritzat i rebuig d'un tercer usuari.
- Crear una sessió de prova, desar-la, entrar des d'un altre navegador i comprovar la sincronització.
- Modificar la mateixa sessió en dos navegadors per provocar el missatge de conflicte.
- Tancar sessió: la interfície de clients no es pot obrir fins a tornar a entrar.
- Revisar que les fitxes sensibles no apareguin a `dades/riu.json` ni en cap commit públic.