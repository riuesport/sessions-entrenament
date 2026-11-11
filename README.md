# RIU · GitHub Pages (sense Supabase)

## Què inclou
- `index.html`: programa RIU amb els botons **⚙ GitHub**, **↻ Carregar publicat** i **☁ Publicar a GitHub**.
- `dades/riu.json`: còpia inicial de les dades de RIU que has enviat.
- `.nojekyll`: publicació directa amb GitHub Pages.

## Publicació inicial
1. Crea un repositori **públic** a GitHub, per exemple `riu-entrenaments`. NO hi guardis informació personal de clients.
2. Puja els fitxers i carpetes d'aquest ZIP a l'arrel del repositori (no el ZIP com a únic fitxer).
3. A **Settings > Pages**, tria **Deploy from a branch**, branca `main`, carpeta `/(root)`.
4. Espera que GitHub et doni l'enllaç, habitualment `https://EL_TEU_USUARI.github.io/riu-entrenaments/`.
5. Obre la web i comprova que carrega els mesocicles.

## Publicar canvis des del programa
1. El repositori **`riuesport/sessions-entrenament`** ja està configurat. Si canvies de repositori, fes servir **⚙ GitHub**.
2. Prem **↻ Carregar publicat** per recuperar l'últim JSON abans d'editar.
3. Fes els canvis a les sessions/exercicis i prem **☁ Publicar a GitHub**.
4. GitHub et demanarà un **fine-grained personal access token** amb accés només a aquest repositori i permís **Contents: Read and write**. El token es demana al navegador quan publiques, **no es desa al programa ni al repositori**.
5. En Bernat pot recarregar la web o prémer **↻ Carregar publicat**.

## Crear token
GitHub > Settings > Developer settings > Personal access tokens > Fine-grained tokens > Generate new token.
- Resource owner: el compte propietari del repositori.
- Repository access: **Only select repositories** > `riu-entrenaments`.
- Repository permissions > Contents: **Read and write**.
- Tria caducitat curta; no comparteixis mai el token per missatges ni l'incrustis a l'HTML.
- Per publicar, cadascú ha de crear el seu token amb els permisos adequats.

## Límits importants
- **No hi ha autenticació d'usuaris a la web**: qualsevol persona amb l'enllaç pot veure les dades d'un repositori públic. El token només autoritza la PUBLICACIÓ.
- No hi ha edició simultània ni fusió automàtica. Carrega l'última versió abans de treballar; si dos entrenadors editen alhora, el darrer podria substituir els canvis de l'altre. El programa demana confirmació i detecta alguns conflictes, però no tots.
- **No és un OAuth de servidor**: per mantenir-ho sense backend, s'utilitza un token de GitHub que només s'introdueix en publicar. No el guardem en localStorage.
- Les fotografies incloses al JSON s'envien al repositori i seran públiques. GitHub té límits de mida de fitxer (API Contents màxim 100 MB; la via de navegador pot tenir límits pràctics més baixos).
- Els canvis es guarden localment mentre edites; **només es comparteixen quan prems Publicar**.
- Mantingues una còpia JSON de seguretat abans de canvis importants.
- GitHub Pages pot trigar uns minuts a reflectir una publicació.