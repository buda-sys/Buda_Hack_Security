
# Port Scanning

The first step is performing a port scan using **Nmap**.

```bash
nmap -sC -sV -T4 target_ip
```

The scan shows the following open ports:

* **80** (HTTP)
* **443** (HTTPS)

<img src="/budahacksecurity/uploads/md_images/robot/robot.png" style="max-width:100%; border-radius:8px;">

When accessing port **80**, we find a website that simulates a terminal interface.

<img src="/budahacksecurity/uploads/md_images/robot/robots2.png" style="max-width:100%; border-radius:8px;">

A hint suggests looking for **robots**, which leads us to inspect the `robots.txt` file.

---

# Robots.txt Enumeration

Inside `robots.txt` we discover two files:

* `key-1-of-3.txt`
* `fsociety.dic`

<img src="/budahacksecurity/uploads/md_images/robot/robot3.png" style="max-width:100%; border-radius:8px;">

The file `fsociety.dic` is a **wordlist** that will later be used for brute force attacks.

<img src="/budahacksecurity/uploads/md_images/robot/robots4.png" style="max-width:100%; border-radius:8px;">

When downloading the file `key-1-of-3.txt`, we obtain the **first key**.

<img src="/budahacksecurity/uploads/md_images/robot/robots5.png" style="max-width:100%; border-radius:8px;">

---

# Directory Enumeration

Next, we enumerate directories using **Gobuster**.

```bash
gobuster dir -u http://target -w /usr/share/wordlists/dirb/common.txt
```

<img src="/budahacksecurity/uploads/md_images/robot/robots6.png" style="max-width:100%; border-radius:8px;">

During enumeration we discover:

* WordPress login page
* A Base64 encoded text file

---

# Base64 Decoding

The discovered file contains encoded data.

After decoding the Base64 content we obtain **credentials**.

<img src="/budahacksecurity/uploads/md_images/robot/robots7.png" style="max-width:100%; border-radius:8px;">

<img src="/budahacksecurity/uploads/md_images/robot/robots8.png" style="max-width:100%; border-radius:8px;">

These credentials appear to be related to **WordPress**.

---

# WordPress Access

Using the credentials we access the WordPress admin panel.

<img src="/budahacksecurity/uploads/md_images/robot/robots9.png" style="max-width:100%; border-radius:8px;">

---

# Brute Force Attack

Further investigation reveals that the machine is inspired by the TV series **Mr Robot**, where the main character is **Elliot**.

Using **Burp Suite**, we intercept cookies and confirm that the username **elliot** exists.

<img src="/budahacksecurity/uploads/md_images/robot/robots11.png" style="max-width:100%; border-radius:8px;">

We perform a brute force attack using **Hydra** with the `fsociety.dic` wordlist.

```bash
hydra -l elliot -P fsociety.dic target http-post-form
```

<img src="/budahacksecurity/uploads/md_images/robot/robot12.png" style="max-width:100%; border-radius:8px;">

Eventually we discover the correct password.

---

# Reverse Shell

Inside the WordPress dashboard we modify a **PHP file from the active theme** and upload a reverse shell.

<img src="/budahacksecurity/uploads/md_images/robot/robots13.png" style="max-width:100%; border-radius:8px;">

After modifying the IP address in the shell code and starting a listener, we access the shell.

<img src="/budahacksecurity/uploads/md_images/robot/robots14.png" style="max-width:100%; border-radius:8px;">

Once inside the system we find the file containing the **second key**.

<img src="/budahacksecurity/uploads/md_images/robot/robots15.png" style="max-width:100%; border-radius:8px;">

---

# Hash Cracking

We also find a hash which we crack using:

**John the Ripper**

<img src="/budahacksecurity/uploads/md_images/robot/robots16.png" style="max-width:100%; border-radius:8px;">

 **Hashcat**

<img src="/budahacksecurity/uploads/md_images/robot/robots17.png" style="max-width:100%; border-radius:8px;">

The recovered password allows us to access `key.txt` and retrieve the **second key**.

---

# Privilege Escalation

While enumerating the system we discover that **nmap can be executed with elevated privileges**.

<img src="/budahacksecurity/uploads/md_images/robot/robots19.png" style="max-width:100%; border-radius:8px;">

This allows us to exploit **nmap interactive mode** to escalate privileges.

Once we gain **root access**, we navigate to:

```
/root
```

There we find `key.txt` containing the **third and final key**.
---


