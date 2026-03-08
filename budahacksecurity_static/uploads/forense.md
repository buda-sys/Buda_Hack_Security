### Introduction

**What is Digital Forensics?**

Digital forensics, also known as cyber forensics or computer forensics, is a branch of cybersecurity based on the **collection, analysis and preservation of digital evidence** from cyber incidents and security breaches.

This discipline applies specialized forensic techniques to devices such as mobile phones, servers, computers, networks and storage media, with the goal of **discovering, documenting and presenting the hidden truth** behind a digital incident.

Digital forensic science is applied in two types of investigations:

- **Public Sector Investigations** → Carried out by government agencies and law enforcement. They focus on the investigation of criminal offenses or civil proceedings, where digital evidence may be presented in court.
- **Private Sector Investigations** → Conducted by private organizations or companies on their own devices and infrastructure. A common example is when a company victimized by a cyberattack investigates internally to determine the origin, scope and responsible parties of the incident.


**Key Concepts**

- **Electronic Evidence** → Any information stored or transmitted in digital format that may be relevant to an investigation. Includes files, emails, system records, databases, network logs, among others.
- **Evidence Preservation** → Strict procedures are followed to maintain the **integrity and authenticity** of digital evidence, ensuring it is not altered from the moment of its collection. This includes the use of techniques such as **hashing** (MD5, SHA-256) to verify that data has not been modified.
- **Forensic Process** → Forensic analysis follows a set of structured stages:
    1. **Identification** — Recognizing which devices or data are relevant to the investigation
    2. **Collection** — Acquiring evidence in a secure and documented manner
    3. **Examination** — Extracting and filtering relevant information from the evidence
    4. **Analysis** — Interpreting the data to reconstruct the facts of the incident
    5. **Presentation** — Communicating findings clearly, either in a report or before a court


### **History of Digital Forensics**

Computer forensics was born in the **1980s**, driven by the arrival of the first personal computers on the market. With their growing adoption, the first computer crimes also began to emerge, generating the need to investigate them in a structured way.

During the **1990s**, with the expansion of the internet, digital crimes increased significantly. Government agencies such as the **FBI** began developing specialized units for computer crimes and the first forensic tools were created to analyze hard drives and recover digital evidence.

In the **2000s**, digital forensics was established as a formal discipline. **Standards and frameworks** such as the **NIST** model were established and professional certifications such as **EnCE** and **CHFI** emerged, recognized worldwide.

With the arrival of **smartphones, the cloud and social media** in the 2010s, digital forensics had to evolve to adapt to new environments and evidence sources, giving rise to specialized branches such as mobile forensics, cloud forensics and network forensics.

Today, digital forensics is a **fundamental piece of cybersecurity**, used by governments, law enforcement and private companies to investigate incidents, protect data and seek justice in the digital world.

---

### Fundamental Principles of Digital Forensics

**Locard's Principle**

**Locard's Principle** states that every contact leaves a trace. In the digital world this means that every action performed on a system leaves evidence — created files, generated logs, registered connections. The attacker always leaves digital footprints even if they try to hide them.


**Chain of Custody**

The **chain of custody** is the chronological and documented record of everything that happens with digital evidence from the moment of its collection until its presentation. It guarantees that the evidence was not altered, manipulated or contaminated at any point in the process.

It must document:

| Field | Description |
|---|---|
| **Who** | Person who collected or handled the evidence |
| **What** | Description of the evidence item |
| **When** | Exact date and time |
| **Where** | Location where it was collected |
| **How** | Method and tool used |

**Evidence Integrity**

Integrity guarantees that digital evidence has not been modified since its collection. It is verified through **hash functions** such as MD5 or SHA-256 — if the original hash matches the hash of the copy, the evidence is intact and admissible.

---

### Legal Framework of Digital Forensics

Digital forensics operates within a legal framework that regulates how digital evidence is collected, handled and presented both nationally and internationally.


**International Frameworks**

| Instrument | Year | Description |
|---|---|---|
| **Budapest Convention** | 2001 | First international treaty on cybercrime, harmonizes national laws and improves international cooperation in digital investigations |
| **Additional Protocol to Budapest** | 2022 | Improves international cooperation and access to electronic evidence between countries |
| **Palermo Convention (UNTOC)** | 2000 | Regulates transnational organized crime, applicable when cybercrime involves criminal organizations |
| **GDPR (European Union)** | 2018 | Regulates the protection of personal data, impacts how digital evidence is handled in Europe |

---

**Key Legal Principles in Digital Forensics**

| Principle | Description |
|---|---|
| **Admissibility** | Evidence must be collected following legal procedures to be valid before a court |
| **Chain of Custody** | All evidence must be documented from collection to presentation |
| **Proportionality** | The investigation must be proportional to the offense investigated |
| **Privacy** | Privacy rights must be respected during the investigation |

---

### Evidence Acquisition Tools

Evidence acquisition is a critical phase of digital forensic science, as it involves the collection of digital artifacts and data from various sources to preserve potential evidence for analysis. This process requires specialized tools and techniques to ensure the **integrity, authenticity and admissibility** of the collected evidence.

**Acquisition Techniques**

- **Forensic Image (Bit-by-Bit)** → An exact copy of the device or storage medium is made, sector by sector, without altering the original. It is the most widely used technique in digital forensics.
- **Live Acquisition** → Evidence is collected from a system that is **powered on and running**, capturing volatile data such as RAM memory, active network connections and running processes that would be lost upon shutting down the equipment.
- **Logical Acquisition** → Extracts only the files and data from the file system, without copying empty sectors or deleted data. It is faster but less complete than the bit-by-bit image.
- **Physical Acquisition** → Complete copy of the device at the physical level, including unallocated spaces, deleted files and hidden partitions.
- **Hashing for Verification** → After each acquisition a hash **(MD5 or SHA-256)** is generated from the original and the copy to verify that both are identical and that the evidence has not been altered.

**Evidence Acquisition Tools**

**Forensic Image (Bit-by-Bit)**

| Tool | System | Description |
| --- | --- | --- |
| **FTK Imager** | Windows | Creates forensic disk images and generates hashes automatically |
| **Guymager** | Linux | Graphical interface for forensic acquisition, fast and multi-format |
| **dd / dcfldd** | Linux | Bit-by-bit cloning via command line; dcfldd includes real-time hashing |

---

**Live Acquisition**

| Tool | System | Description |
|---|---|---|
| **WinPmem** | Windows | RAM memory capture on active systems |
| **DumpIt** | Windows | Fast RAM memory dump with a single click |
| **LiME** | Linux | Kernel module for live RAM memory extraction |

---

**Logical and Physical Acquisition (Mobile)**

| Tool | System | Description |
|---|---|---|
| **Magnet ACQUIRE** | Win/Mac | Acquisition of iOS and Android mobiles and external disks |
| **Cellebrite UFED** | Win | Industry standard for forensic extraction of mobile devices |
| **ADB (Android Debug Bridge)** | Win/Linux/Mac | Logical data extraction on Android devices |

---

**Integrity Verification (Hashing)**

| Tool | System | Description |
|---|---|---|
| **HashCalc** | Windows | Calculates MD5, SHA-1, SHA-256 hashes of files and disks |
| **md5sum / sha256sum** | Linux | Native commands to verify integrity of forensic images |
| **FTK Imager** | Windows | Automatically generates and verifies hashes when creating images |

---

### Forensic Image with Guymager

**Guymager** is an open source forensic tool available on **Linux** (comes pre-installed in forensic distros such as **Kali Linux** and **CAINE**).

Its main function is to create **bit-by-bit forensic images** of hard drives, USBs and other storage media, ensuring that the copy is **100% identical** to the original without modifying it.


**Installation**

Arch:

```bash
sudo pacman -S guymager o yay -S guymager
```

Debian:

```bash
sudo apt install guymager -y
```

Fedora:

```bash
sudo dnf install guymager
```

If we are on Linux and not a virtual machine to practice, we can create a temporary virtual disk.

We create a `100MB` file that simulates an empty disk:
```bash
sudo dd if=/dev/zero of=/tmp/disco_practica.img bs=1M count=100
```


We connect it as a virtual device with:
```bash
sudo losetup -fP /tmp/disco_practica.img
```

We verify it was created correctly:
```bash
sudo losetup -l
```

<img src="/budahacksecurity/uploads/md_images/fr/fr.png" style="max-width:100%; border-radius:8px;">

We run the tool:

```bash
sudo guymager
```

<img src="/budahacksecurity/uploads/md_images/fr/fr2.png" style="max-width:100%; border-radius:8px;">

We can see our disks and the virtual disk we just created. We start with the Acquisition.

1. Right click on `/dev/loop0` our virtual disk
2. Select **Acquire image**

The following configuration window will open:

<img src="/budahacksecurity/uploads/md_images/fr/fr3.png" style="max-width:100%; border-radius:8px;">

We fill it with the following data:

<img src="/budahacksecurity/uploads/md_images/fr/fr4.png" style="max-width:100%; border-radius:8px;">


### Acquisition Configuration in Guymager

**Image Format**

| Field | What is it for? |
| --- | --- |
| **Linux dd raw image** | Standard forensic format, pure bit-by-bit copy |
| **Expert Witness Format (.Exx)** | Proprietary format with additional metadata, used in courts |
| **Split image files** | Splits the image into 2047MB parts for FAT32 systems |

**Case Metadata**

| Field | Your value | What is it for? |
|---|---|---|
| **Case number** | `LAB-01` | Unique identifier of the forensic case |
| **Evidence number** | empty | Evidence number within the case |
| **Examiner** | `bda` | Name of the responsible forensic investigator |
| **Description** | `Bit-by-bit forensic image practice` | Description of the purpose of the acquisition |
| **Notes** | empty | Additional notes from the investigator |

**Destination**

| Field | Your value | What is it for? |
|---|---|---|
| **Image directory** | `/tmp/` | Folder where the forensic image will be saved |
| **Image filename** | `imagen_forense` | Name of the resulting image file |
| **Info filename** | `imagen_forense_info` | Text file with the acquisition report |

**Hash and Verification**

| Field | What is it for? |
| --- | --- |
| **Calculate MD5** | Generates MD5 hash to verify integrity |
| **Calculate SHA-1** | Alternative hash, less secure than SHA-256 |
| **Calculate SHA-256** | More secure hash and current standard in forensics |
| **Re-read source after acquisition** | Re-reads the original disk for comparison (takes twice as long) |
| **Verify image after acquisition** | Verifies that the created image is identical to the original |

3. We press Start

<img src="/budahacksecurity/uploads/md_images/fr/fr5.png" style="max-width:100%; border-radius:8px;">

The image was created correctly. Now we view the image hashes:

```bash
cat /tmp/imagen_forense_info.info
```

Result:

```python
Info  path and file name: /tmp/imagen_forense_info.info
Hash calculation        : MD5 and SHA-256
Source verification     : off
Image verification      : on

No bad sectors encountered during acquisition.
State: Finished successfully

MD5 hash                   : 2f282b84e7e608d5852449ed940bfc51
MD5 hash verified source   : --
MD5 hash verified image    : 2f282b84e7e608d5852449ed940bfc51
SHA1 hash                  : --
SHA1 hash verified source  : --
SHA1 hash verified image   : --
SHA256 hash                : 20492a4d0d84f8beb1767f6616229f85d44c2827b64bdbfb260ee12fa1109e0e
SHA256 hash verified source: --
SHA256 hash verified image : 20492a4d0d84f8beb1767f6616229f85d44c2827b64bdbfb260ee12fa1109e0e
Image verification OK. The image contains exactly the data that was written.

Acquisition started : 2026-02-26 20:44:59 (ISO format YYYY-MM-DD HH:MM:SS)
Verification started: 2026-02-26 20:45:00
Ended               : 2026-02-26 20:45:00 (0 hours, 0 minutes and 0 seconds)
Acquisition speed   : 100.00 MByte/s (0 hours, 0 minutes and 1 seconds)
Verification speed  : 100.00 MByte/s (0 hours, 0 minutes and 1 seconds)


Generated image files and their MD5 hashes
==========================================

No MD5 hashes available (configuration parameter CalcImageFileMD5 is off)
MD5                               Image file
n/a                               imagen_forense.000

```

The MD5 and SHA-256 hashes of the image match the original, confirming that the evidence was acquired without alterations, guaranteeing its **integrity and authenticity** as valid forensic evidence.

> We will later see how to obtain our bit-by-bit acquisition evidence with **dd / dcfldd** and **FTK Imager**

---

### Host-Based Evidence

Host-based evidence varies in nature. The term **volatility** refers to the persistence of data in a system, where **volatile data** is information that disappears after events such as logouts or system shutdowns.

A crucial type of volatile evidence is the **active system memory (RAM)**, as it contains valuable information such as running processes, active network connections, credentials in memory and malware artifacts that would be lost upon shutting down the equipment.

---

**Types of Evidence on a Host**

| Type | Examples | Lost on shutdown? |
| --- | --- | --- |
| **Volatile** | RAM, active processes, network connections, cache | Yes |
| **Non-Volatile** | Hard drive, logs, records, system files | No |

---

**Tools for Host Evidence Acquisition**

| Tool | Evidence Type | System | Description |
| --- | --- | --- | --- |
| **WinPmem** | RAM Memory | Windows | Captures RAM dump on active systems |
| **DumpIt** | RAM Memory | Windows | Fast RAM dump with a single click |
| **LiME** | RAM Memory | Linux | Kernel module for live RAM extraction |
| **Volatility** | RAM Analysis | Win/Linux/Mac | Analyzes memory dumps to extract artifacts |

### Using LiME to Acquire Memory

**LiME (Linux Memory Extractor)** is a Linux kernel module that allows capturing the complete contents of a live system's **RAM memory**.

> Important note: LiME needs to be compiled against the **exact kernel** of your system. That is why we need to install the compilation tools first.


**Arch:**

```bash
sudo pacman -S git make gcc linux-headers
```

Then:

```bash
uname -r
```

Clone the official LiME repository:

```bash
git clone https://github.com/504ensicsLabs/LiME.git
cd LiME/src
```

Now compile LiME against your kernel `6.13.9-arch1-2`:

```bash
make
```

If you get a compilation error make sure you have installed your kernel headers:

```bash
sudo pacman -S linux-headers
```

**Debian / Ubuntu:**

```bash
sudo apt install git make gcc linux-headers-$(uname -r) -y
```

**Fedora:**

```bash
sudo dnf install git make gcc kernel-devel-$(uname -r)
```

> Important note: On **Debian/Kali and Fedora** the command includes `$(uname -r)` directly to automatically install the headers matching your current kernel. On Arch the headers already match automatically.


Once `LiME` is compiled we proceed to capture the **RAM**:

```bash
sudo insmod ~/Desktop/herramientas/LiME/src/lime.ko path=/tmp/ram_captura.lime format=lime
```

> The name of the compiled file includes the kernel version. Verify the exact name with `ls` before running `insmod`.

| Parameter | Explanation |
|---|---|
| `insmod` | Loads the LiME kernel module |
| `lime.ko` | The compiled module |
| `path=/tmp/ram_captura.lime` | Where the RAM dump will be saved |
| `format=lime` | Standard format compatible with Volatility |

> The dump may take time depending on how much RAM you have. While it runs **you will see no progress**, simply wait until the prompt returns.

We verify the file was created:

```bash
ls -lh /tmp/ram_captura.lime

Permissions Size User Date Modified Name
.r--r--r--  8.2G root 26 Feb 22:30   /tmp/ram_captura.lime
```

We generate the dump hash to document its integrity:

```
md5sum /tmp/ram_captura.lime

790aba5f212306df7e8a7b07485f1a6c  /tmp/ram_captura.lime

sha256sum /tmp/ram_captura.lime

2794fd545fc2620ae45b4d29b372ff7ae1ee8bd21f035ce4c298bf5a2fd1de6e  /tmp/ram_captura.lime

```

> May take time depending on memory size


---

### Rapid Triage

**Rapid triage** is the process of quickly collecting the most important evidence from a suspicious or compromised system, with the goal of determining in the shortest possible time what happened, when and how.

Unlike a full forensic analysis that can take hours, triage focuses on collecting only the **key artifacts** from the system without needing to shut it down, allowing fast action during an active incident.

| Tool | Evidence Type | System | Description |
| --- | --- | --- | --- |
| **Velociraptor** | Rapid triage | Win/Linux/Mac | Massive collection of system artifacts |
| **KAPE** | Rapid triage | Windows | Fast extraction of forensic disk artifacts |
| **CyLR** | Rapid triage | Win/Linux/Mac | Automated collection of forensic artifacts |

### Using Velociraptor

**What is Velociraptor?**

**Velociraptor** is an open source tool for **rapid triage and incident response**. Unlike LiME which only captures RAM, Velociraptor can collect in seconds:

- Running processes
- Active network connections
- Users and sessions
- Recently modified files
- Registry keys (Windows)
- System logs
- Indicators of Compromise (IOCs)

### How does it work?

Velociraptor works in **client-server** mode:

| Component | Function |
|---|---|
| **Server** | Control panel where you see the results |
| **Client** | Installed on the system to investigate |
| **VQL** | Its own query language to collect artifacts |

### Install Velociraptor

Velociraptor is a single executable binary, it does not require complex installation.

**All Linux systems (Arch, Debian, Fedora):**

```bash
wget -O velociraptor https://github.com/Velocidex/velociraptor/releases/download/v0.74/velociraptor-v0.74.1-linux-amd64
chmod +x velociraptor
sudo mv velociraptor /usr/local/bin/velociraptor
```

Verify the installation:

```bash
velociraptor version
```

> Velociraptor is a **single binary** — it does not require complex installation or a package manager. It works the same on Arch, Debian and Fedora with the same binary.


---
### Configure Standalone Mode

In standalone mode Velociraptor works as server and client on the same machine, ideal for practice and documentation.

We generate the configuration interactively:

```bash
velociraptor config generate -i
```

The wizard will ask us configuration questions, we answer them according to our environment:

| Question | Answer |
|---|---|
| **What OS?** | Linux |
| **Path to the datastore?** | Enter (default) |
| **The public DNS name?** | `localhost` |
| **Frontend port?** | Enter (default 8000) |
| **GUI port?** | Enter (default 8889) |
| **Restrict VQL functionality?** | No |
| **Use registry for client writeback?** | No |
| **Experimental websocket comms?** | No |

The wizard will generate two files:

- `server.config.yaml`

We start the server:

```bash
sudo velociraptor --config server.config.yaml frontend -v
```

<img src="/budahacksecurity/uploads/md_images/fr/fr6.png" style="max-width:100%; border-radius:8px;">

<img src="/budahacksecurity/uploads/md_images/fr/fr7.png" style="max-width:100%; border-radius:8px;">

We run the client in a new terminal:

```bash
sudo velociraptor --config server.config.yaml client -v
```

<img src="/budahacksecurity/uploads/md_images/fr/fr8.png" style="max-width:100%; border-radius:8px;">

### Run the Triage

1. Click on your client `C.5f76a0efe6abad1b`
2. Find the **"Collect Artifact"** button
3. In the search box type `Generic.System.Pstree`
4. Select it and press **Launch**

<img src="/budahacksecurity/uploads/md_images/fr/fr9.png" style="max-width:100%; border-radius:8px;">

We go to view the obtained results:

<img src="/budahacksecurity/uploads/md_images/fr/fr10.png" style="max-width:100%; border-radius:8px;">

> **Note:** In this lab the machine itself was used as a client to demonstrate Velociraptor's functionality. In a real environment the client would be the compromised system under investigation


---

### Memory Forensics

**Memory forensics** is the branch of digital forensics focused on the acquisition and analysis of a system's **RAM memory**. Unlike disk analysis, RAM memory contains ephemeral and volatile information that only exists while the system is powered on.

Memory analysis allows discovering evidence that **is not found on the hard drive**, such as:

- Malware that operates only in memory _(fileless malware)_
- Active credentials and encryption keys
- Established network connections
- Hidden or injected malicious processes
- Conversations and data from open applications

> **Key fact:** A sophisticated attacker can operate completely in memory without touching the disk, leaving zero traces after a reboot. That is why memory forensics is critical in incident response.


---

**Volatility3** is an open source framework developed in Python for **RAM memory forensic analysis**. It allows investigators and security professionals to examine memory dumps in search of digital evidence, malicious activity and malware.

It is compatible with **Windows, Linux and macOS** systems and is used by military, law enforcement and academic investigators worldwide. It is maintained by **The Volatility Foundation**.

**Main capabilities:**

| Capability | Description |
| --- | --- |
| **Processes** | Lists active and hidden processes in the system |
| **Network** | Shows established network connections |
| **Malware** | Detects malware that operates only in memory without leaving traces on disk |
| **Credentials** | Recovers passwords and hashes stored in memory |
| **Modules** | Lists modules and drivers loaded in the kernel |


**Volatility3 Installation**

**Arch Linux:**

```bash
sudo pacman -S volatility3
```

**Debian / Ubuntu / Kali:**

```bash
sudo apt install volatility3 -y
```

**Fedora:**

```bash
sudo dnf install volatility3
```


Verify:

```bash
vol -h
```

> Note: The binary used for the tool demonstration is from the CyberDefenders platform https://cyberdefenders.org/blueteam-ctf-challenges/redline/


---

**Operating System Identification of the Dump**

We start by identifying the operating system of the dump to use the correct plugins:

```bash
vol -f MemoryDump.mem windows.info
```

<img src="/budahacksecurity/uploads/md_images/fr/fr11.png" style="max-width:100%; border-radius:8px;">

Volatility3 automatically detected that the dump corresponds to a **64-bit Windows 10** system, which tells us which plugins to use for the analysis.


**Active Process Identification**

We list all active processes in memory to identify **non-legitimate** or suspicious services and processes that may indicate malicious activity on the system:

```bash
vol -f MemoryDump.mem windows.pslist
```

Output:

```rust
Volatility 3 Framework 2.27.0
Progress:  100.00		PDB scanning finished
PID	PPID	ImageFileName	Offset(V)	Threads	Handles	SessionId	Wow64	CreateTime	ExitTime	File output

4	0	System	0xad8185883180	157	-	N/A	False	2023-05-21 22:27:10.000000 UTC	N/A	Disabled
108	4	Registry	0xad81858f2080	4	-	N/A	False	2023-05-21 22:26:54.000000 UTC	N/A	Disabled
332	4	smss.exe	0xad81860dc040	2	-	N/A	False	2023-05-21 22:27:10.000000 UTC	N/A	Disabled
452	444	csrss.exe	0xad81861cd080	12	-	0	False	2023-05-21 22:27:22.000000 UTC	N/A	Disabled
528	520	csrss.exe	0xad8186f1b140	14	-	1	False	2023-05-21 22:27:25.000000 UTC	N/A	Disabled
552	444	wininit.exe	0xad8186f2b080	1	-	0	False	2023-05-21 22:27:25.000000 UTC	N/A	Disabled
588	520	winlogon.exe	0xad8186f450c0	5	-	1	False	2023-05-21 22:27:25.000000 UTC	N/A	Disabled
676	552	services.exe	0xad8186f4d080	7	-	0	False	2023-05-21 22:27:29.000000 UTC	N/A	Disabled
696	552	lsass.exe	0xad8186fc6080	10	-	0	False	2023-05-21 22:27:29.000000 UTC	N/A	Disabled
824	676	svchost.exe	0xad818761d240	22	-	0	False	2023-05-21 22:27:32.000000 UTC	N/A	Disabled
852	552	fontdrvhost.ex	0xad818761b0c0	5	-	0	False	2023-05-21 22:27:33.000000 UTC	N/A	Disabled
860	588	fontdrvhost.ex	0xad818761f140	5	-	1	False	2023-05-21 22:27:33.000000 UTC	N/A	Disabled
952	676	svchost.exe	0xad81876802c0	12	-	0	False	2023-05-21 22:27:36.000000 UTC	N/A	Disabled
1016	588	dwm.exe	0xad81876e4340	15	-	1	False	2023-05-21 22:27:38.000000 UTC	N/A	Disabled
448	676	svchost.exe	0xad8187721240	54	-	0	False	2023-05-21 22:27:41.000000 UTC	N/A	Disabled
752	676	svchost.exe	0xad8187758280	21	-	0	False	2023-05-21 22:27:43.000000 UTC	N/A	Disabled
1012	676	svchost.exe	0xad818774c080	19	-	0	False	2023-05-21 22:27:43.000000 UTC	N/A	Disabled
1196	676	svchost.exe	0xad81877972c0	34	-	0	False	2023-05-21 22:27:46.000000 UTC	N/A	Disabled
1280	4	MemCompression	0xad8187835080	62	-	N/A	False	2023-05-21 22:27:49.000000 UTC	N/A	Disabled
1376	676	svchost.exe	0xad81878020c0	15	-	0	False	2023-05-21 22:27:49.000000 UTC	N/A	Disabled
1448	676	svchost.exe	0xad818796c2c0	30	-	0	False	2023-05-21 22:27:52.000000 UTC	N/A	Disabled
1496	676	svchost.exe	0xad81879752c0	12	-	0	False	2023-05-21 22:27:52.000000 UTC	N/A	Disabled
1644	676	svchost.exe	0xad8187a112c0	6	-	0	False	2023-05-21 22:27:58.000000 UTC	N/A	Disabled
1652	676	svchost.exe	0xad8187a2d2c0	10	-	0	False	2023-05-21 22:27:58.000000 UTC	N/A	Disabled
1840	676	spoolsv.exe	0xad8187acb200	10	-	0	False	2023-05-21 22:28:03.000000 UTC	N/A	Disabled
1892	676	svchost.exe	0xad8187b34080	14	-	0	False	2023-05-21 22:28:05.000000 UTC	N/A	Disabled
2024	676	svchost.exe	0xad8187b65240	7	-	0	False	2023-05-21 22:28:11.000000 UTC	N/A	Disabled
2076	676	svchost.exe	0xad8187b94080	10	-	0	False	2023-05-21 22:28:19.000000 UTC	N/A	Disabled
2144	676	vmtoolsd.exe	0xad81896ab080	11	-	0	False	2023-05-21 22:28:19.000000 UTC	N/A	Disabled
2152	676	vm3dservice.ex	0xad81896ae240	2	-	0	False	2023-05-21 22:28:19.000000 UTC	N/A	Disabled
2200	676	VGAuthService.	0xad81896b3300	2	-	0	False	2023-05-21 22:28:19.000000 UTC	N/A	Disabled
2404	2152	vm3dservice.ex	0xad8186619200	2	-	1	False	2023-05-21 22:28:32.000000 UTC	N/A	Disabled
3028	676	dllhost.exe	0xad8185907080	12	-	0	False	2023-05-21 22:29:20.000000 UTC	N/A	Disabled
832	676	msdtc.exe	0xad8185861280	9	-	0	False	2023-05-21 22:29:25.000000 UTC	N/A	Disabled
1232	676	svchost.exe	0xad8186f4a2c0	7	-	0	False	2023-05-21 22:29:39.000000 UTC	N/A	Disabled
1392	448	sihost.exe	0xad8189e94280	11	-	1	False	2023-05-21 22:30:08.000000 UTC	N/A	Disabled
1064	676	svchost.exe	0xad8189d7c2c0	15	-	1	False	2023-05-21 22:30:09.000000 UTC	N/A	Disabled
1600	448	taskhostw.exe	0xad8189d07300	10	-	1	False	2023-05-21 22:30:09.000000 UTC	N/A	Disabled
3204	752	ctfmon.exe	0xad8189c8b280	12	-	1	False	2023-05-21 22:30:11.000000 UTC	N/A	Disabled
3556	588	userinit.exe	0xad818c02f340	0	-	1	False	2023-05-21 22:30:28.000000 UTC	2023-05-21 22:30:43.000000 UTC	Disabled
3580	3556	explorer.exe	0xad818c047340	76	-	1	False	2023-05-21 22:30:28.000000 UTC	N/A	Disabled
3944	824	WmiPrvSE.exe	0xad818c054080	13	-	0	False	2023-05-21 22:30:44.000000 UTC	N/A	Disabled
3004	676	svchost.exe	0xad818c4212c0	7	-	0	False	2023-05-21 22:30:55.000000 UTC	N/A	Disabled
1116	676	svchost.exe	0xad818c426080	6	-	1	False	2023-05-21 22:31:00.000000 UTC	N/A	Disabled
3160	824	StartMenuExper	0xad818cad3240	14	-	1	False	2023-05-21 22:31:21.000000 UTC	N/A	Disabled
4116	824	RuntimeBroker.	0xad818cd93300	3	-	1	False	2023-05-21 22:31:24.000000 UTC	N/A	Disabled
4228	676	SearchIndexer.	0xad818ce06240	15	-	0	False	2023-05-21 22:31:27.000000 UTC	N/A	Disabled
4448	824	RuntimeBroker.	0xad818c09a080	9	-	1	False	2023-05-21 22:31:33.000000 UTC	N/A	Disabled
464	3580	SecurityHealth	0xad818979d080	3	-	1	False	2023-05-21 22:31:59.000000 UTC	N/A	Disabled
3252	3580	vmtoolsd.exe	0xad8189796300	8	-	1	False	2023-05-21 22:31:59.000000 UTC	N/A	Disabled
5136	676	SecurityHealth	0xad818d374280	7	-	0	False	2023-05-21 22:32:01.000000 UTC	N/A	Disabled
5328	3580	msedge.exe	0xad818d0980c0	54	-	1	False	2023-05-21 22:32:02.000000 UTC	N/A	Disabled
4396	5328	msedge.exe	0xad818d515080	7	-	1	False	2023-05-21 22:32:19.000000 UTC	N/A	Disabled
1144	5328	msedge.exe	0xad818d75f080	18	-	1	False	2023-05-21 22:32:38.000000 UTC	N/A	Disabled
4544	5328	msedge.exe	0xad818d75b080	14	-	1	False	2023-05-21 22:32:39.000000 UTC	N/A	Disabled
5340	5328	msedge.exe	0xad818d7b3080	10	-	1	False	2023-05-21 22:32:39.000000 UTC	N/A	Disabled
5704	824	RuntimeBroker.	0xad8185962080	5	-	1	False	2023-05-21 22:32:44.000000 UTC	N/A	Disabled
1764	824	dllhost.exe	0xad818d176080	7	-	1	False	2023-05-21 22:32:48.000000 UTC	N/A	Disabled
1916	824	SearchApp.exe	0xad818d099080	24	-	1	False	2023-05-21 22:33:05.000000 UTC	N/A	Disabled
6200	676	SgrmBroker.exe	0xad818d09f080	7	-	0	False	2023-05-21 22:33:42.000000 UTC	N/A	Disabled
6696	676	svchost.exe	0xad818c532080	8	-	0	False	2023-05-21 22:34:07.000000 UTC	N/A	Disabled
7312	824	ApplicationFra	0xad818e84f300	10	-	1	False	2023-05-21 22:35:44.000000 UTC	N/A	Disabled
7772	676	svchost.exe	0xad818e88e140	3	-	0	False	2023-05-21 22:36:03.000000 UTC	N/A	Disabled
6724	3580	Outline.exe	0xad818e578080	0	-	1	True	2023-05-21 22:36:09.000000 UTC	2023-05-21 23:01:24.000000 UTC	Disabled
4224	6724	Outline.exe	0xad818e88b080	0	-	1	True	2023-05-21 22:36:23.000000 UTC	2023-05-21 23:01:24.000000 UTC	Disabled
7160	824	SearchApp.exe	0xad818ccc4080	57	-	1	False	2023-05-21 22:39:13.000000 UTC	N/A	Disabled
4628	6724	tun2socks.exe	0xad818de82340	0	-	1	True	2023-05-21 22:40:10.000000 UTC	2023-05-21 23:01:24.000000 UTC	Disabled
6048	448	taskhostw.exe	0xad818dc5d080	5	-	1	False	2023-05-21 22:40:20.000000 UTC	N/A	Disabled
8264	824	RuntimeBroker.	0xad818eec8080	4	-	1	False	2023-05-21 22:40:33.000000 UTC	N/A	Disabled
3608	676	svchost.exe	0xad818d07a080	3	-	0	False	2023-05-21 22:41:28.000000 UTC	N/A	Disabled
6644	824	SkypeApp.exe	0xad818d3ac080	49	-	1	False	2023-05-21 22:41:52.000000 UTC	N/A	Disabled
5656	824	RuntimeBroker.	0xad81876e8080	0	-	1	False	2023-05-21 21:58:19.000000 UTC	2023-05-21 22:02:01.000000 UTC	Disabled
8952	824	TextInputHost.	0xad818e6db080	10	-	1	False	2023-05-21 21:59:11.000000 UTC	N/A	Disabled
5808	824	HxTsr.exe	0xad818de5d080	0	-	1	False	2023-05-21 21:59:58.000000 UTC	2023-05-21 22:07:45.000000 UTC	Disabled
2388	5328	msedge.exe	0xad818e54c340	18	-	1	False	2023-05-21 22:05:35.000000 UTC	N/A	Disabled
6292	5328	msedge.exe	0xad818d7a1080	20	-	1	False	2023-05-21 22:06:15.000000 UTC	N/A	Disabled
3876	448	taskhostw.exe	0xad8189b30080	8	-	1	False	2023-05-21 22:08:02.000000 UTC	N/A	Disabled
372	824	SkypeBackgroun	0xad8186f49080	3	-	1	False	2023-05-21 22:10:00.000000 UTC	N/A	Disabled
1120	676	MsMpEng.exe	0xad818945c080	12	-	0	False	2023-05-21 22:10:01.000000 UTC	N/A	Disabled
6076	824	ShellExperienc	0xad818eb18080	14	-	1	False	2023-05-21 22:11:36.000000 UTC	N/A	Disabled
7336	824	RuntimeBroker.	0xad818e8bb080	2	-	1	False	2023-05-21 22:11:39.000000 UTC	N/A	Disabled
7964	5328	msedge.exe	0xad818dee5080	19	-	1	False	2023-05-21 22:22:09.000000 UTC	N/A	Disabled
6544	5328	msedge.exe	0xad818c0ea080	18	-	1	False	2023-05-21 22:22:35.000000 UTC	N/A	Disabled
5964	676	svchost.exe	0xad818ef86080	5	-	0	False	2023-05-21 22:27:56.000000 UTC	N/A	Disabled
8896	5328	msedge.exe	0xad8187a39080	18	-	1	False	2023-05-21 22:28:21.000000 UTC	N/A	Disabled
5156	5328	msedge.exe	0xad818c553080	14	-	1	False	2023-05-21 22:28:22.000000 UTC	N/A	Disabled
5896	8844	oneetx.exe	0xad8189b41080	5	-	1	True	2023-05-21 22:30:56.000000 UTC	N/A	Disabled
7732	5896	rundll32.exe	0xad818d1912c0	1	-	1	True	2023-05-21 22:31:53.000000 UTC	N/A	Disabled
6324	1496	audiodg.exe	0xad818df2e080	4	-	0	False	2023-05-21 22:42:56.000000 UTC	N/A	Disabled
2228	3580	FTK Imager.exe	0xad818d143080	10	-	1	False	2023-05-21 22:43:56.000000 UTC	N/A	Disabled
5636	3580	notepad.exe	0xad818db45080	1	-	1	False	2023-05-21 22:46:50.000000 UTC	N/A	Disabled
2044	676	svchost.exe	0xad8189b27080	28	-	0	False	2023-05-21 22:49:29.000000 UTC	N/A	Disabled
8708	676	svchost.exe	0xad818d431080	5	-	0	False	2023-05-21 22:57:33.000000 UTC	N/A	Disabled
5476	676	svchost.exe	0xad818e752080	9	-	0	False	2023-05-21 22:58:08.000000 UTC	N/A	Disabled
6596	676	TrustedInstall	0xad818dc88080	4	-	0	False	2023-05-21 22:58:13.000000 UTC	N/A	Disabled
2332	824	TiWorker.exe	0xad818e780080	4	-	0	False	2023-05-21 22:58:13.000000 UTC	N/A	Disabled
4340	676	VSSVC.exe	0xad818e888080	3	-	0	False	2023-05-21 23:01:06.000000 UTC	N/A	Disabled
7540	824	smartscreen.ex	0xad818e893080	14	-	1	False	2023-05-21 23:02:26.000000 UTC	N/A	Disabled
8920	3580	FTK Imager.exe	0xad818ef81080	20	-	1	False	2023-05-21 23:02:28.000000 UTC	N/A	Disabled
5480	448	oneetx.exe	0xad818d3d6080	6	-	1	True	2023-05-21 23:03:00.000000 UTC	N/A	Disabled
```

From the process list we identified the following **suspicious processes**:

| PID | Process | PPID | Observation |
| --- | --- | --- | --- |
| **5896** | `oneetx.exe` | 8844 | Unknown process, non-existent parent |
| **5480** | `oneetx.exe` | 448 | Second suspicious instance |
| **7732** | `rundll32.exe` | 5896 | Child of oneetx.exe — common malware technique |
| **6724** | `Outline.exe` | 3580 | Suspicious VPN, already terminated |
| **4628** | `tun2socks.exe` | 6724 | Network tunneling tool |

**Legitimate processes identified:**

| PID | Process | Description |
|---|---|---|
| 4 | `System` | System process |
| 676 | `services.exe` | Windows services manager |
| 3580 | `explorer.exe` | Windows Explorer |
| 2228 | `FTK Imager.exe` | Forensic tool |
| 1120 | `MsMpEng.exe` | Windows Defender |

---

> **Key finding:** The `oneetx.exe` process is highly suspicious — it is not a native Windows process and launched a child `rundll32.exe`, a common technique used by malware to inject code.


We list the process tree to confirm the hierarchy and obtain execution paths:

```bash
vol -f MemoryDump.mem windows.pstree
```

Output:

```bash
Volatility 3 Framework 2.27.0
Progress:  100.00		PDB scanning finished
PID	PPID	ImageFileName	Offset(V)	Threads	Handles	SessionId	Wow64	CreateTime	ExitTime	Audit	Cmd	Path

4	0	System	0xad8185883180	157	-	N/A	False	2023-05-21 22:27:10.000000 UTC	N/A	-	-	-
* 1280	4	MemCompression	0xad8187835080	62	-	N/A	False	2023-05-21 22:27:49.000000 UTC	N/A	MemCompression	-	-
* 108	4	Registry	0xad81858f2080	4	-	N/A	False	2023-05-21 22:26:54.000000 UTC	N/A	Registry	-	-
* 332	4	smss.exe	0xad81860dc040	2	-	N/A	False	2023-05-21 22:27:10.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\smss.exe	-	-
452	444	csrss.exe	0xad81861cd080	12	-	0	False	2023-05-21 22:27:22.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\csrss.exe	-	-
528	520	csrss.exe	0xad8186f1b140	14	-	1	False	2023-05-21 22:27:25.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\csrss.exe		
552	444	wininit.exe	0xad8186f2b080	1	-	0	False	2023-05-21 22:27:25.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\wininit.exe	-	-
* 696	552	lsass.exe	0xad8186fc6080	10	-	0	False	2023-05-21 22:27:29.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\lsass.exe	C:\Windows\system32\lsass.exe	C:\Windows\system32\lsass.exe
* 676	552	services.exe	0xad8186f4d080	7	-	0	False	2023-05-21 22:27:29.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\services.exe	C:\Windows\system32\services.exe	C:\Windows\system32\services.exe
** 4228	676	SearchIndexer.	0xad818ce06240	15	-	0	False	2023-05-21 22:31:27.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\SearchIndexer.exe	C:\Windows\system32\SearchIndexer.exe /Embedding	C:\Windows\system32\SearchIndexer.exe
** 8708	676	svchost.exe	0xad818d431080	5	-	0	False	2023-05-21 22:57:33.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\svchost.exe	-	-
** 5136	676	SecurityHealth	0xad818d374280	7	-	0	False	2023-05-21 22:32:01.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\SecurityHealthService.exe	-	-
** 2200	676	VGAuthService.	0xad81896b3300	2	-	0	False	2023-05-21 22:28:19.000000 UTC	N/A	\Device\HarddiskVolume3\Program Files\VMware\VMware Tools\VMware VGAuth\VGAuthService.exe	-	-
** 3608	676	svchost.exe	0xad818d07a080	3	-	0	False	2023-05-21 22:41:28.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\svchost.exe	-	-
** 2076	676	svchost.exe	0xad8187b94080	10	-	0	False	2023-05-21 22:28:19.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\svchost.exe	C:\Windows\System32\svchost.exe -k utcsvc -p	C:\Windows\System32\svchost.exe
** 1448	676	svchost.exe	0xad818796c2c0	30	-	0	False	2023-05-21 22:27:52.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\svchost.exe	C:\Windows\System32\svchost.exe -k NetworkService -p	C:\Windows\System32\svchost.exe
** 1064	676	svchost.exe	0xad8189d7c2c0	15	-	1	False	2023-05-21 22:30:09.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\svchost.exe	C:\Windows\system32\svchost.exe -k UnistackSvcGroup	C:\Windows\system32\svchost.exe
** 6696	676	svchost.exe	0xad818c532080	8	-	0	False	2023-05-21 22:34:07.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\svchost.exe	-	-
** 1196	676	svchost.exe	0xad81877972c0	34	-	0	False	2023-05-21 22:27:46.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\svchost.exe	C:\Windows\system32\svchost.exe -k LocalService -p	C:\Windows\system32\svchost.exe
** 1840	676	spoolsv.exe	0xad8187acb200	10	-	0	False	2023-05-21 22:28:03.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\spoolsv.exe	-	-
** 952	676	svchost.exe	0xad81876802c0	12	-	0	False	2023-05-21 22:27:36.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\svchost.exe	C:\Windows\system32\svchost.exe -k RPCSS -p	C:\Windows\system32\svchost.exe
** 824	676	svchost.exe	0xad818761d240	22	-	0	False	2023-05-21 22:27:32.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\svchost.exe	C:\Windows\system32\svchost.exe -k DcomLaunch -p	C:\Windows\system32\svchost.exe
*** 7312	824	ApplicationFra	0xad818e84f300	10	-	1	False	2023-05-21 22:35:44.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\ApplicationFrameHost.exe	C:\Windows\system32\ApplicationFrameHost.exe -Embedding	C:\Windows\system32\ApplicationFrameHost.exe
*** 4116	824	RuntimeBroker.	0xad818cd93300	3	-	1	False	2023-05-21 22:31:24.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\RuntimeBroker.exe	-	-
*** 5656	824	RuntimeBroker.	0xad81876e8080	0	-	1	False	2023-05-21 21:58:19.000000 UTC	2023-05-21 22:02:01.000000 UTC	\Device\HarddiskVolume3\Windows\System32\RuntimeBroker.exe	-	-
*** 2332	824	TiWorker.exe	0xad818e780080	4	-	0	False	2023-05-21 22:58:13.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\WinSxS\amd64_microsoft-windows-servicingstack_31bf3856ad364e35_10.0.19041.1940_none_7dd80d767cb5c7b0\TiWorker.exe	-	-
*** 7336	824	RuntimeBroker.	0xad818e8bb080	2	-	1	False	2023-05-21 22:11:39.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\RuntimeBroker.exe	-	-
*** 5808	824	HxTsr.exe	0xad818de5d080	0	-	1	False	2023-05-21 21:59:58.000000 UTC	2023-05-21 22:07:45.000000 UTC	\Device\HarddiskVolume3\Program Files\WindowsApps\microsoft.windowscommunicationsapps_16005.11629.20316.0_x64__8wekyb3d8bbwe\HxTsr.exe	-	-
*** 7160	824	SearchApp.exe	0xad818ccc4080	57	-	1	False	2023-05-21 22:39:13.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\SystemApps\Microsoft.Windows.Search_cw5n1h2txyewy\SearchApp.exe	-	-
*** 6076	824	ShellExperienc	0xad818eb18080	14	-	1	False	2023-05-21 22:11:36.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\SystemApps\ShellExperienceHost_cw5n1h2txyewy\ShellExperienceHost.exe	--
*** 5704	824	RuntimeBroker.	0xad8185962080	5	-	1	False	2023-05-21 22:32:44.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\RuntimeBroker.exe	C:\Windows\System32\RuntimeBroker.exe -Embedding	C:\Windows\System32\RuntimeBroker.exe
*** 8264	824	RuntimeBroker.	0xad818eec8080	4	-	1	False	2023-05-21 22:40:33.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\RuntimeBroker.exe	-	-
*** 3160	824	StartMenuExper	0xad818cad3240	14	-	1	False	2023-05-21 22:31:21.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\SystemApps\Microsoft.Windows.StartMenuExperienceHost_cw5n1h2txyewy\StartMenuExperienceHost.exe	"C:\Windows\SystemApps\Microsoft.Windows.StartMenuExperienceHost_cw5n1h2txyewy\StartMenuExperienceHost.exe" -ServerName:App.AppXywbrabmsek0gm3tkwpr5kwzbs55tkqay.mca	C:\Windows\SystemApps\Microsoft.Windows.StartMenuExperienceHost_cw5n1h2txyewy\StartMenuExperienceHost.exe
*** 4448	824	RuntimeBroker.	0xad818c09a080	9	-	1	False	2023-05-21 22:31:33.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\RuntimeBroker.exe	C:\Windows\System32\RuntimeBroker.exe -Embedding	C:\Windows\System32\RuntimeBroker.exe
*** 1764	824	dllhost.exe	0xad818d176080	7	-	1	False	2023-05-21 22:32:48.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\dllhost.exe		
*** 3944	824	WmiPrvSE.exe	0xad818c054080	13	-	0	False	2023-05-21 22:30:44.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\wbem\WmiPrvSE.exe	C:\Windows\system32\wbem\wmiprvse.exe	C:\Windows\system32\wbem\wmiprvse.exe
*** 6644	824	SkypeApp.exe	0xad818d3ac080	49	-	1	False	2023-05-21 22:41:52.000000 UTC	N/A	\Device\HarddiskVolume3\Program Files\WindowsApps\Microsoft.SkypeApp_14.53.77.0_x64__kzf8qxf38zg5c\SkypeApp.exe	-	-
*** 372	824	SkypeBackgroun	0xad8186f49080	3	-	1	False	2023-05-21 22:10:00.000000 UTC	N/A	\Device\HarddiskVolume3\Program Files\WindowsApps\Microsoft.SkypeApp_14.53.77.0_x64__kzf8qxf38zg5c\SkypeBackgroundHost.exe	-	-
*** 7540	824	smartscreen.ex	0xad818e893080	14	-	1	False	2023-05-21 23:02:26.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\smartscreen.exe	C:\Windows\System32\smartscreen.exe -Embedding	C:\Windows\System32\smartscreen.exe
*** 8952	824	TextInputHost.	0xad818e6db080	10	-	1	False	2023-05-21 21:59:11.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\SystemApps\MicrosoftWindows.Client.CBS_cw5n1h2txyewy\TextInputHost.exe	"C:\Windows\SystemApps\MicrosoftWindows.Client.CBS_cw5n1h2txyewy\TextInputHost.exe" -ServerName:InputApp.AppXjd5de1g66v206tj52m9d0dtpppx4cgpn.mca	C:\Windows\SystemApps\MicrosoftWindows.Client.CBS_cw5n1h2txyewy\TextInputHost.exe
*** 1916	824	SearchApp.exe	0xad818d099080	24	-	1	False	2023-05-21 22:33:05.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\SystemApps\Microsoft.Windows.Search_cw5n1h2txyewy\SearchApp.exe	-	-
** 6200	676	SgrmBroker.exe	0xad818d09f080	7	-	0	False	2023-05-21 22:33:42.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\SgrmBroker.exe	-	-
** 3004	676	svchost.exe	0xad818c4212c0	7	-	0	False	2023-05-21 22:30:55.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\svchost.exe	C:\Windows\system32\svchost.exe -k LocalServiceAndNoImpersonation -p	C:\Windows\system32\svchost.exe
** 448	676	svchost.exe	0xad8187721240	54	-	0	False	2023-05-21 22:27:41.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\svchost.exe	C:\Windows\system32\svchost.exe -k netsvcs -p	C:\Windows\system32\svchost.exe
*** 1600	448	taskhostw.exe	0xad8189d07300	10	-	1	False	2023-05-21 22:30:09.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\taskhostw.exe	-	-
*** 6048	448	taskhostw.exe	0xad818dc5d080	5	-	1	False	2023-05-21 22:40:20.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\taskhostw.exe	-	-
*** 3876	448	taskhostw.exe	0xad8189b30080	8	-	1	False	2023-05-21 22:08:02.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\taskhostw.exe	-	-
*** 5480	448	oneetx.exe	0xad818d3d6080	6	-	1	True	2023-05-21 23:03:00.000000 UTC	N/A	\Device\HarddiskVolume3\Users\Tammam\AppData\Local\Temp\c3912af058\oneetx.exe	-	-
*** 1392	448	sihost.exe	0xad8189e94280	11	-	1	False	2023-05-21 22:30:08.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\sihost.exe	sihost.exe	C:\Windows\system32\sihost.exe
** 832	676	msdtc.exe	0xad8185861280	9	-	0	False	2023-05-21 22:29:25.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\msdtc.exe	-	-
** 6596	676	TrustedInstall	0xad818dc88080	4	-	0	False	2023-05-21 22:58:13.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\servicing\TrustedInstaller.exe	-	-
** 5964	676	svchost.exe	0xad818ef86080	5	-	0	False	2023-05-21 22:27:56.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\svchost.exe	-	-
** 1232	676	svchost.exe	0xad8186f4a2c0	7	-	0	False	2023-05-21 22:29:39.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\svchost.exe	-	-
** 3028	676	dllhost.exe	0xad8185907080	12	-	0	False	2023-05-21 22:29:20.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\dllhost.exe	C:\Windows\system32\dllhost.exe /Processid:{02D4B3F1-FD88-11D1-960D-00805FC79235}	C:\Windows\system32\dllhost.exe
** 1496	676	svchost.exe	0xad81879752c0	12	-	0	False	2023-05-21 22:27:52.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\svchost.exe	C:\Windows\System32\svchost.exe -k LocalServiceNetworkRestricted -p	C:\Windows\System32\svchost.exe
*** 6324	1496	audiodg.exe	0xad818df2e080	4	-	0	False	2023-05-21 22:42:56.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\audiodg.exe	-	-
** 1116	676	svchost.exe	0xad818c426080	6	-	1	False	2023-05-21 22:31:00.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\svchost.exe	C:\Windows\system32\svchost.exe -k ClipboardSvcGroup -p	C:\Windows\system32\svchost.exe
** 7772	676	svchost.exe	0xad818e88e140	3	-	0	False	2023-05-21 22:36:03.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\svchost.exe	-	-
** 1376	676	svchost.exe	0xad81878020c0	15	-	0	False	2023-05-21 22:27:49.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\svchost.exe	C:\Windows\system32\svchost.exe -k LocalServiceNoNetwork -p	C:\Windows\system32\svchost.exe
** 2144	676	vmtoolsd.exe	0xad81896ab080	11	-	0	False	2023-05-21 22:28:19.000000 UTC	N/A	\Device\HarddiskVolume3\Program Files\VMware\VMware Tools\vmtoolsd.exe	"C:\Program Files\VMware\VMware Tools\vmtoolsd.exe"	C:\Program Files\VMware\VMware Tools\vmtoolsd.exe
** 1120	676	MsMpEng.exe	0xad818945c080	12	-	0	False	2023-05-21 22:10:01.000000 UTC	N/A	\Device\HarddiskVolume3\ProgramData\Microsoft\Windows Defender\Platform\4.18.2304.8-0\MsMpEng.exe		
** 1892	676	svchost.exe	0xad8187b34080	14	-	0	False	2023-05-21 22:28:05.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\svchost.exe	C:\Windows\system32\svchost.exe -k LocalServiceNoNetworkFirewall -p	C:\Windows\system32\svchost.exe
** 5476	676	svchost.exe	0xad818e752080	9	-	0	False	2023-05-21 22:58:08.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\svchost.exe	C:\Windows\System32\svchost.exe -k NetworkService -p	C:\Windows\System32\svchost.exe
** 2024	676	svchost.exe	0xad8187b65240	7	-	0	False	2023-05-21 22:28:11.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\svchost.exe	-	-
** 2152	676	vm3dservice.ex	0xad81896ae240	2	-	0	False	2023-05-21 22:28:19.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\vm3dservice.exe	-	-
*** 2404	2152	vm3dservice.ex	0xad8186619200	2	-	1	False	2023-05-21 22:28:32.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\vm3dservice.exe	-	-
** 1644	676	svchost.exe	0xad8187a112c0	6	-	0	False	2023-05-21 22:27:58.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\svchost.exe	-	-
** 752	676	svchost.exe	0xad8187758280	21	-	0	False	2023-05-21 22:27:43.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\svchost.exe	C:\Windows\System32\svchost.exe -k LocalSystemNetworkRestricted -p	C:\Windows\System32\svchost.exe
*** 3204	752	ctfmon.exe	0xad8189c8b280	12	-	1	False	2023-05-21 22:30:11.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\ctfmon.exe	"ctfmon.exe"	C:\Windows\system32\ctfmon.exe
** 1012	676	svchost.exe	0xad818774c080	19	-	0	False	2023-05-21 22:27:43.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\svchost.exe	C:\Windows\System32\svchost.exe -k LocalServiceNetworkRestricted -p	C:\Windows\System32\svchost.exe
** 1652	676	svchost.exe	0xad8187a2d2c0	10	-	0	False	2023-05-21 22:27:58.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\svchost.exe	C:\Windows\system32\svchost.exe -k LocalServiceNetworkRestricted -p	C:\Windows\system32\svchost.exe
** 4340	676	VSSVC.exe	0xad818e888080	3	-	0	False	2023-05-21 23:01:06.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\VSSVC.exe	C:\Windows\system32\vssvc.exe	C:\Windows\system32\vssvc.exe
** 2044	676	svchost.exe	0xad8189b27080	28	-	0	False	2023-05-21 22:49:29.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\svchost.exe	C:\Windows\system32\svchost.exe -k wsappx -p	C:\Windows\system32\svchost.exe
* 852	552	fontdrvhost.ex	0xad818761b0c0	5	-	0	False	2023-05-21 22:27:33.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\fontdrvhost.exe	-	-
588	520	winlogon.exe	0xad8186f450c0	5	-	1	False	2023-05-21 22:27:25.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\winlogon.exe	-	-
* 1016	588	dwm.exe	0xad81876e4340	15	-	1	False	2023-05-21 22:27:38.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\dwm.exe	"dwm.exe"	C:\Windows\system32\dwm.exe
* 3556	588	userinit.exe	0xad818c02f340	0	-	1	False	2023-05-21 22:30:28.000000 UTC	2023-05-21 22:30:43.000000 UTC	\Device\HarddiskVolume3\Windows\System32\userinit.exe	-	-
** 3580	3556	explorer.exe	0xad818c047340	76	-	1	False	2023-05-21 22:30:28.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\explorer.exe	C:\Windows\Explorer.EXE	C:\Windows\Explorer.EXE
*** 6724	3580	Outline.exe	0xad818e578080	0	-	1	True	2023-05-21 22:36:09.000000 UTC	2023-05-21 23:01:24.000000 UTC	\Device\HarddiskVolume3\Program Files (x86)\Outline\Outline.exe	-	-
**** 4224	6724	Outline.exe	0xad818e88b080	0	-	1	True	2023-05-21 22:36:23.000000 UTC	2023-05-21 23:01:24.000000 UTC	\Device\HarddiskVolume3\Program Files (x86)\Outline\Outline.exe	-	-
**** 4628	6724	tun2socks.exe	0xad818de82340	0	-	1	True	2023-05-21 22:40:10.000000 UTC	2023-05-21 23:01:24.000000 UTC	\Device\HarddiskVolume3\Program Files (x86)\Outline\resources\app.asar.unpacked\third_party\outline-go-tun2socks\win32\tun2socks.exe	-	-
*** 5636	3580	notepad.exe	0xad818db45080	1	-	1	False	2023-05-21 22:46:50.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\notepad.exe	-	-
*** 464	3580	SecurityHealth	0xad818979d080	3	-	1	False	2023-05-21 22:31:59.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\SecurityHealthSystray.exe	-	-
*** 5328	3580	msedge.exe	0xad818d0980c0	54	-	1	False	2023-05-21 22:32:02.000000 UTC	N/A	\Device\HarddiskVolume3\Program Files (x86)\Microsoft\Edge\Application\msedge.exe	"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --no-startup-window --win-session-start /prefetch:5	C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe
**** 4544	5328	msedge.exe	0xad818d75b080	14	-	1	False	2023-05-21 22:32:39.000000 UTC	N/A	\Device\HarddiskVolume3\Program Files (x86)\Microsoft\Edge\Application\msedge.exe	-	-
**** 8896	5328	msedge.exe	0xad8187a39080	18	-	1	False	2023-05-21 22:28:21.000000 UTC	N/A	\Device\HarddiskVolume3\Program Files (x86)\Microsoft\Edge\Application\msedge.exe	-	-
**** 5156	5328	msedge.exe	0xad818c553080	14	-	1	False	2023-05-21 22:28:22.000000 UTC	N/A	\Device\HarddiskVolume3\Program Files (x86)\Microsoft\Edge\Application\msedge.exe	-	-
**** 7964	5328	msedge.exe	0xad818dee5080	19	-	1	False	2023-05-21 22:22:09.000000 UTC	N/A	\Device\HarddiskVolume3\Program Files (x86)\Microsoft\Edge\Application\msedge.exe	-	-
**** 4396	5328	msedge.exe	0xad818d515080	7	-	1	False	2023-05-21 22:32:19.000000 UTC	N/A	\Device\HarddiskVolume3\Program Files (x86)\Microsoft\Edge\Application\msedge.exe	-	-
**** 6544	5328	msedge.exe	0xad818c0ea080	18	-	1	False	2023-05-21 22:22:35.000000 UTC	N/A	\Device\HarddiskVolume3\Program Files (x86)\Microsoft\Edge\Application\msedge.exe	-	-
**** 2388	5328	msedge.exe	0xad818e54c340	18	-	1	False	2023-05-21 22:05:35.000000 UTC	N/A	\Device\HarddiskVolume3\Program Files (x86)\Microsoft\Edge\Application\msedge.exe	-	-
**** 6292	5328	msedge.exe	0xad818d7a1080	20	-	1	False	2023-05-21 22:06:15.000000 UTC	N/A	\Device\HarddiskVolume3\Program Files (x86)\Microsoft\Edge\Application\msedge.exe	-	-
**** 1144	5328	msedge.exe	0xad818d75f080	18	-	1	False	2023-05-21 22:32:38.000000 UTC	N/A	\Device\HarddiskVolume3\Program Files (x86)\Microsoft\Edge\Application\msedge.exe	-	-
**** 5340	5328	msedge.exe	0xad818d7b3080	10	-	1	False	2023-05-21 22:32:39.000000 UTC	N/A	\Device\HarddiskVolume3\Program Files (x86)\Microsoft\Edge\Application\msedge.exe	-	-
*** 3252	3580	vmtoolsd.exe	0xad8189796300	8	-	1	False	2023-05-21 22:31:59.000000 UTC	N/A	\Device\HarddiskVolume3\Program Files\VMware\VMware Tools\vmtoolsd.exe	"C:\Program Files\VMware\VMware Tools\vmtoolsd.exe" -n vmusr	C:\Program Files\VMware\VMware Tools\vmtoolsd.exe
*** 2228	3580	FTK Imager.exe	0xad818d143080	10	-	1	False	2023-05-21 22:43:56.000000 UTC	N/A	\Device\HarddiskVolume3\Program Files\AccessData\FTK Imager\FTK Imager.exe	-	-
*** 8920	3580	FTK Imager.exe	0xad818ef81080	20	-	1	False	2023-05-21 23:02:28.000000 UTC	N/A	\Device\HarddiskVolume3\Program Files\AccessData\FTK Imager\FTK Imager.exe	"C:\Program Files\AccessData\FTK Imager\FTK Imager.exe" 	C:\Program Files\AccessData\FTK Imager\FTK Imager.exe
* 860	588	fontdrvhost.ex	0xad818761f140	5	-	1	False	2023-05-21 22:27:33.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\System32\fontdrvhost.exe	-	-
5896	8844	oneetx.exe	0xad8189b41080	5	-	1	True	2023-05-21 22:30:56.000000 UTC	N/A	\Device\HarddiskVolume3\Users\Tammam\AppData\Local\Temp\c3912af058\oneetx.exe	-	-
* 7732	5896	rundll32.exe	0xad818d1912c0	1	-	1	True	2023-05-21 22:31:53.000000 UTC	N/A	\Device\HarddiskVolume3\Windows\SysWOW64\rundll32.exe	
```

Two instances of the `oneetx.exe` process were identified, both running from a highly suspicious path:

```
C:\Users\Tammam\AppData\Local\Temp\c3912af058\oneetx.exe
```

Execution from `AppData\Local\Temp` is a common indicator of a dropper-type malware. The `c3912af058` subdirectory likely corresponds to the hash of the downloaded payload.

| PID | Process | PPID | Real Parent | Observation |
|---|---|---|---|---|
| 5896 | oneetx.exe | 8844 | **Does not exist** | Orphan process — parent terminated after launching it |
| 5480 | oneetx.exe | 448 | svchost.exe (-k netsvcs) | svchost should not launch binaries from Temp |
| 7732 | rundll32.exe | 5896 | oneetx.exe | SysWOW64, no arguments — possible process hollowing |

**Indicators of Compromise (IOCs) identified:**

- **Malicious path:** `C:\Users\Tammam\AppData\Local\Temp\c3912af058\oneetx.exe`
- **Directory hash:** `c3912af058` (possible partial MD5 of the payload)
- **Suspicious process:** `rundll32.exe` (PID 7732) launched by malware, no arguments, WoW64 mode

**Observed MITRE ATT&CK Techniques:**

| ID | Technique | Evidence |
| --- | --- | --- |
| T1059 | Command and Scripting | rundll32.exe launched without args |
| T1036 | Masquerading | Process in Temp imitating legitimate behavior |
| T1055 | Process Injection | rundll32 child of malware (possible hollowing) |
| T1574 | Hijack Execution Flow | Abuse of svchost as parent |

The tree confirms something important: `oneetx.exe` is not a single process, it has **two instances with different origins**:

The first (PID 5896) appears **floating alone** — its parent 8844 does not exist in the tree. This happens when the process that launched it has already died, a common technique to break the evidence chain. The malware launches and the launcher self-destructs.

The second (PID 5480) appears as a child of `svchost.exe (448)` running with the `-k netsvcs` group. That svchost is legitimate, but **it should not be launching binaries from a user's Temp folder**. That is a clear anomaly.

The most important thing the pstree confirms is the **exact path**:

```
\Users\Tammam\AppData\Local\Temp\c3912af058\oneetx.exe
```

Executing from Temp is a dropper sign — something downloaded it there and executed it. The folder name `c3912af058` looks like a hash, probably of the payload.

And then there is `rundll32.exe` (PID 7732), direct child of `oneetx.exe`, running from `SysWOW64` without any visible arguments. A rundll32 without arguments is almost always process hollowing — basically the malware launches it as an empty container and injects its code inside.

---

**Network Connection Analysis**

The `windows.netscan` plugin reveals all active or recent network connections at the time of the dump, including remote IP addresses, ports and the process responsible for each connection.

```bash
vol -f MemoryDump.mem windows.netscan
```

Relevant output:

```
Volatility 3 Framework 2.27.0
Progress:  100.00		PDB scanning finished
Offset          Proto  LocalAddr        LocalPort  ForeignAddr      ForeignPort  State      PID   Owner        Created
0xad818d3d6b20  TCPv4  10.0.2.15        49720      77.91.124.20     80           CLOSED     5480  oneetx.exe   2023-05-21 23:03:00 UTC
0xad8189b41b20  TCPv4  10.0.2.15        49703      77.91.124.20     80           CLOSED     5896  oneetx.exe   2023-05-21 22:30:56 UTC
0xad818d1912c0  TCPv4  10.0.2.15        49704      77.91.124.20     80           CLOSED     7732  rundll32.exe 2023-05-21 22:31:53 UTC
```

Both instances of `oneetx.exe` and the child `rundll32.exe` established connections to IP **77.91.124.20** on port **80**. This IP corresponds to a known Command & Control (C2) server associated with the **RedLine** stealer.

| PID | Process | Remote IP | Port | Observation |
|---|---|---|---|---|
| 5896 | `oneetx.exe` | 77.91.124.20 | 80 | C2 connection — data exfiltration |
| 5480 | `oneetx.exe` | 77.91.124.20 | 80 | Second connection to the same C2 |
| 7732 | `rundll32.exe` | 77.91.124.20 | 80 | Injected process communicating |

> **Finding:** All three connections point to the same C2 server. The malware used port 80 (HTTP) to disguise exfiltration traffic as legitimate web traffic, a technique known as **Living off the Land** in communications.

---

**Code Injection Detection in Memory**

The `windows.malfind` plugin looks for memory regions with simultaneous execution and write permissions that do not correspond to any file on disk — a characteristic sign of **code injection** and **process hollowing**.

```bash
vol -f MemoryDump.mem windows.malfind
```

Relevant output:

```
Volatility 3 Framework 2.27.0
Progress:  100.00		PDB scanning finished
PID    Process        Start                  End                    Protect     Hexdump                                          Disasm
5896   oneetx.exe     0x400000               0x42e000               PAGE_EXECUTE_READWRITE
                                                                                4d 5a 90 00 03 00 00 00  MZ......
                                                                                04 00 00 00 ff ff 00 00  ........
                                                                                b8 00 00 00 00 00 00 00  ........
7732   rundll32.exe   0x3e0000               0x41f000               PAGE_EXECUTE_READWRITE
                                                                                4d 5a 90 00 03 00 00 00  MZ......
                                                                                04 00 00 00 ff ff 00 00  ........
```

`malfind` detected memory regions with the `MZ` header — the magic byte of a PE executable — inside the `oneetx.exe` and `rundll32.exe` processes, both with `PAGE_EXECUTE_READWRITE` permissions.

| PID | Process | Indicator | Technique |
|---|---|---|---|
| 5896 | `oneetx.exe` | PE embedded in memory, RWX | Process injection |
| 7732 | `rundll32.exe` | PE embedded in memory, RWX | Process hollowing |

> **Finding:** The presence of PE headers (`MZ`) in executable regions not backed by files on disk confirms that the malware injected an executable directly into memory to operate without leaving traces in the file system. This is the technique that makes RedLine particularly difficult to detect with traditional antivirus.

---

**Command Line Analysis**

The `windows.cmdline` plugin shows the arguments with which each process was executed, allowing confirmation of execution paths and detecting processes launched with suspicious parameters or without visible arguments.

```bash
vol -f MemoryDump.mem windows.cmdline
```

Relevant output:

```
Volatility 3 Framework 2.27.0
Progress:  100.00		PDB scanning finished
PID    Process         Args
5896   oneetx.exe      C:\Users\Tammam\AppData\Local\Temp\c3912af058\oneetx.exe
5480   oneetx.exe      C:\Users\Tammam\AppData\Local\Temp\c3912af058\oneetx.exe
7732   rundll32.exe    -
```

| PID | Process | Command Line | Observation |
|---|---|---|---|
| 5896 | `oneetx.exe` | `...\AppData\Local\Temp\c3912af058\oneetx.exe` | Execution from Temp — dropper |
| 5480 | `oneetx.exe` | `...\AppData\Local\Temp\c3912af058\oneetx.exe` | Second instance, same path |
| 7732 | `rundll32.exe` | `-` (no arguments) | Hollow process — empty container |

> **Finding:** A legitimate `rundll32.exe` always has arguments — a DLL and a function to export. The total absence of arguments in PID 7732 confirms that it was launched as an empty process to be filled with the malware payload through process hollowing.

---

**Loaded DLL Analysis**

The `windows.dlllist` plugin lists all DLLs loaded in the memory space of a process. It can be filtered by PID to analyze only the suspicious processes.

```bash
vol -f MemoryDump.mem windows.dlllist --pid 5896
```

Relevant output:

```
Volatility 3 Framework 2.27.0
Progress:  100.00		PDB scanning finished
PID    Process       Base             Size    Name                 Path
5896   oneetx.exe   0x77580000       0x1f0000 ntdll.dll            C:\Windows\SYSTEM32\ntdll.dll
5896   oneetx.exe   0x76d10000       0xc0000  KERNEL32.DLL         C:\Windows\System32\KERNEL32.DLL
5896   oneetx.exe   0x76c70000       0x9c000  KERNELBASE.dll       C:\Windows\System32\KERNELBASE.dll
5896   oneetx.exe   0x74e10000       0x29000  WININET.dll          C:\Windows\System32\WININET.dll
5896   oneetx.exe   0x74960000       0x6f000  CRYPT32.dll          C:\Windows\System32\CRYPT32.dll
5896   oneetx.exe   0x6f4c0000       0x12000  Clip64.dll           C:\Users\Tammam\AppData\Local\Temp\c3912af058\Clip64.dll
```

| DLL | Path | Relevance |
|---|---|---|
| `WININET.dll` | `C:\Windows\System32\` | HTTP communications — used for C2 |
| `CRYPT32.dll` | `C:\Windows\System32\` | Cryptographic functions — encryption of stolen data |
| `Clip64.dll` | `...\Temp\c3912af058\` | Malicious DLL — clipboard theft module |

> **Finding:** The loading of `Clip64.dll` from the same Temp directory confirms that `oneetx.exe` is a stealer with clipboard theft capabilities (clipboard hijacking), a technique used by RedLine to intercept cryptocurrency addresses that the user copies and pastes.

---

### Forensic Analysis Conclusions

The analysis of the `MemoryDump.mem` memory dump belonging to the Windows 10 system of user **Tammam** allowed identifying an active incident of infection by the **RedLine Stealer** malware, distributed through the dropper `oneetx.exe`.

---

**Incident Summary**

| Field | Detail |
|---|---|
| **System** | Windows 10 x64 — `2023-05-21 22:27` UTC |
| **Affected user** | Tammam |
| **Malware** | RedLine Stealer (distributed as `oneetx.exe`) |
| **Entry vector** | Download and execution of binary from `AppData\Local\Temp` |
| **C2 Server** | `77.91.124.20:80` |
| **Techniques used** | Process Hollowing, DLL Injection, Clipboard Hijacking |

---

**Attack Timeline**

| Time (UTC) | Event |
|---|---|
| `22:30:56` | First instance of `oneetx.exe` (PID 5896) executed from Temp |
| `22:31:53` | `rundll32.exe` (PID 7732) launched by oneetx — process hollowing initiated |
| `23:03:00` | Second instance of `oneetx.exe` (PID 5480) executed via `svchost` |
| `23:03:xx` | Active connections to `77.91.124.20:80` — exfiltration in progress |

---

**Indicators of Compromise (IOCs)**

| Type | Value |
|---|---|
| **Malicious path** | `C:\Users\Tammam\AppData\Local\Temp\c3912af058\oneetx.exe` |
| **Malicious DLL** | `C:\Users\Tammam\AppData\Local\Temp\c3912af058\Clip64.dll` |
| **C2 IP** | `77.91.124.20` |
| **C2 Port** | `80` (HTTP) |
| **Directory hash** | `c3912af058` (possible partial MD5 of the payload) |

---

**MITRE ATT&CK Techniques**

| ID | Tactic | Technique | Evidence |
|---|---|---|---|
| T1055 | Defense Evasion | Process Injection | PE embedded in `rundll32.exe` and `oneetx.exe` |
| T1055.012 | Defense Evasion | Process Hollowing | `rundll32.exe` without arguments, launched by malware |
| T1036 | Defense Evasion | Masquerading | Execution from Temp imitating legitimate behavior |
| T1574 | Privilege Escalation | Hijack Execution Flow | Abuse of `svchost -k netsvcs` as parent process |
| T1115 | Collection | Clipboard Data | `Clip64.dll` — clipboard theft module |
| T1041 | Exfiltration | Exfiltration Over C2 | HTTP connections to `77.91.124.20:80` |
| T1071.001 | Command & Control | Web Protocols | Use of port 80 to disguise C2 traffic |

---

The memory forensic analysis confirmed that the system was compromised by **RedLine Stealer**, an infostealer-type malware capable of stealing credentials saved in browsers, cryptocurrency wallets, clipboard data and sensitive user files.

The malware operated completely in memory using advanced evasion techniques such as process hollowing and DLL injection, which allowed it to maintain persistence and communicate with its C2 server without leaving obvious artifacts in the file system.

The evidence collected and analyzed in this investigation — memory dump, integrity hashes, process tree, network connections and malicious memory regions — constitutes a complete forensic chain that documents the attacker's behavior from initial execution to data exfiltration.

> **Post-incident recommendations:** Isolate the system immediately, revoke user Tammam's credentials on all services, block IP `77.91.124.20` on the perimeter firewall and perform a disk analysis to identify additional files deposited by the dropper.

---

### Disk Forensics

**Disk forensics** is the branch of digital forensics focused on the acquisition and analysis of storage media — hard drives, SSDs, USBs and memory cards. Unlike RAM, data on disk is **non-volatile**: it persists after shutting down the system, making it the primary source of evidence in most investigations.

Disk analysis allows discovering:

- Deleted and recoverable files
- Browsing history and user activity
- Operating system artifacts (logs, registry, prefetch)
- Persistent malware installed in the file system
- File metadata (creation, modification, access dates)
- Hidden partitions or unallocated space with residual data

> **Key fact:** When a file is "deleted", the operating system only marks its space as available — the actual data remains on the disk until it is overwritten. Disk forensics allows recovering evidence that the attacker thought they had deleted.

---

**Comparison: Memory vs Disk**

| Characteristic | Memory Forensics (RAM) | Disk Forensics |
|---|---|---|
| **Volatility** | High — lost on shutdown | Low — persists indefinitely |
| **Content** | Active processes, connections, malware in memory | Files, logs, registry, history |
| **Recovery** | Only while the system is on | Possible even after deletion |
| **Tool** | Volatility3, LiME | Autopsy, FTK Imager, TSK |
| **Priority** | First (volatile data first) | Second (after capturing RAM) |

---

## FTK Imager

**FTK Imager** is a forensic tool developed by **AccessData** (now Exterro), widely used by forensic analysts, law enforcement and security investigators worldwide. It allows acquiring, previewing and analyzing forensic disk images without altering the original evidence.

FTK Imager allows in a single interface:

- Opening and exploring forensic images in `.ad1`, `.E01`, `.dd`, `.img` and more formats
- Navigating the complete file system including deleted files
- Exporting individual files or complete directories
- Calculating and verifying MD5 and SHA1 hashes for evidence integrity
- Creating forensic images of physical or logical disks
- Mounting images as read-only drives
- Previewing file contents without modifying them

---

### Using FTK Imager

> **Note:** In this section I will demonstrate the practical use of FTK Imager by solving the **"Insider"** lab from the **CyberDefenders** platform. This lab is introductory level and is designed to become familiar with forensic analysis of disk images on Linux systems.

| # | Question | Where to look in FTK Imager |
|---|---|---|
| 1 | What Linux distribution is being used on the machine? | `[root] → boot` |
| 2 | What is the MD5 hash of the apache access.log? | `[root] → var → log → apache2 → access.log` |
| 3 | What credential dumping tool was downloaded? | `[root] → root → Downloads` |
| 4 | What is the absolute path of the super-secret file? | `[root] → root → .bash_history` |
| 5 | What program used didyouthinkwedmakeiteasy.jpg? | `[root] → root → .bash_history` |
| 6 | What is the third goal from Karen's checklist? | `[root] → root → Desktop → Checklist` |
| 7 | How many times was apache run? | `[root] → var → log → apache2 → access.log` |
| 8 | What file proves the machine was used to attack another? | `[root] → root → .msf4 → history` |
| 9 | Who was Karen taunting in her bash script? | `[root] → root → Documents → myfirsthack → firstscript_fixed` |
| 10 | Who su'd to root at 11:26? | `[root] → var → log → auth.log` |
| 11 | What is the current working directory based on bash_history? | `[root] → root → .bash_history` |

**Load the image**

1. Go to menu **File → Add Evidence Item**
2. Select **Image File** → click **Next**
3. Navigate to where you have `FirstHack.ad1`
4. Select it and click **Finish**

**Question 1**

We navigate to `[root] → boot` in the directory tree. The kernel files present in this directory reveal that the operating system installed on the machine is **Kali Linux**.

<img src="/budahacksecurity/uploads/md_images/fr/fr12.png" style="max-width:100%; border-radius:8px;">

**Question 2**

We navigate to `[root] → var → log → apache2` and select the `access.log` file. From FTK Imager we can export the file's hash list. The calculated MD5 hash corresponds to an empty file, confirming that Apache never generated access records.

<img src="/budahacksecurity/uploads/md_images/fr/fr13.png" style="max-width:100%; border-radius:8px;">

**Question 3**

We navigate to `[root] → root → Downloads`. In this directory we find the file downloaded by Karen, a well-known tool for credential dumping on Windows systems.

<img src="/budahacksecurity/uploads/md_images/fr/fr14.png" style="max-width:100%; border-radius:8px;">

**Question 4**

We navigate to `[root] → root` and open the `.bash_history` file. This file records all commands executed by the user. In its content we find a reference to the creation of a file with a name related to confidential information.

<img src="/budahacksecurity/uploads/md_images/fr/fr15.png" style="max-width:100%; border-radius:8px;">

**Question 5**

Continuing the analysis of the `.bash_history` file, we find a line where a binary analysis tool is executed on the `.jpg` image file, indicating that Karen attempted to extract hidden data from that image.

<img src="/budahacksecurity/uploads/md_images/fr/fr16.png" style="max-width:100%; border-radius:8px;">

**Question 6**

We navigate to `[root] → root → Desktop` and open the `Checklist` file. This file contains a list of objectives Karen had set for herself, among which the third reveals her final intentions.

<img src="/budahacksecurity/uploads/md_images/fr/fr17.png" style="max-width:100%; border-radius:8px;">

**Question 7**

We navigate to `[root] → var → log → apache2` and open the `access.log` file. The file is completely empty, indicating that the Apache server never processed any request and therefore was never executed.

**Question 8**

We navigate to `[root] → root` and explore the `.msf4` directory which corresponds to **Metasploit Framework**. In the Metasploit history and in the user's root directory we find a JPEG image that is a screenshot of the victim machine, direct evidence of the attack carried out.

<img src="/budahacksecurity/uploads/md_images/fr/fr18.png" style="max-width:100%; border-radius:8px;">

**Question 9**

We navigate to `[root] → root → Documents → myfirsthack` and open the `firstscript_fixed` file. This script contains taunting messages directed at a specific individual, revealing who Karen was trying to provoke.

<img src="/budahacksecurity/uploads/md_images/fr/fr19.png" style="max-width:100%; border-radius:8px;">

**Question 10**

We navigate to `[root] → var → log` and open the `auth.log` file. This file records all authentication events in the system. Filtering by time `11:26` and looking for successful authentications we find the user who escalated privileges to root.

<img src="/budahacksecurity/uploads/md_images/fr/fr20.png" style="max-width:100%; border-radius:8px;">

**Question 11**

We return to the `.bash_history` file in `[root] → root` and review the last `cd` command executed by Karen. The last directory she navigated to before the forensic image was taken was her main working directory for the attack.

<img src="/budahacksecurity/uploads/md_images/fr/fr21.png" style="max-width:100%; border-radius:8px;">

The disk forensic analysis demonstrated that even when a user attempts to hide their activities, operating system artifacts — command history, authentication logs, downloaded files and screenshots — constitute a **complete forensic evidence chain** that precisely reconstructs the actions of the internal attacker.