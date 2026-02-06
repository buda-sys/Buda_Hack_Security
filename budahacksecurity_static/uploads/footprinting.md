## Footprinting Lab – Easy

***The company `Inlanefreight Ltd` has tasked us with performing tests on three different servers within their internal network. The company uses a variety of services, and the IT security department deemed it necessary to conduct a penetration test to better understand their overall security strategy.***

***The first server is an internal DNS server that needs to be investigated. In particular, our client wants to know what information we can obtain from these services and how this information could be leveraged against their infrastructure. Our goal is to gather as much information as possible about the server and identify ways to use it against the company. However, our client has made it clear that aggressively attacking services using exploits is prohibited, as these systems are in production.***

***Additionally, our teammates discovered the following credentials `ceil:qwer1234` and noted that some company employees were discussing [[SSH]] keys on a forum.***

***The administrators have stored a `flag.txt` file on this server to monitor our progress and measure success. Fully enumerate the target and submit the contents of this file as proof.***

---

We begin with a **port scan** to identify which services are exposed on the system. This information is critical for detecting potential attack vectors and determining which technologies or protocols might be vulnerable or exploitable.

```bash
nmap -p- --open -n -Pn --min-rate 5000 -sS --disable-arp -vvv 10.129.103.207
```

<img src="/budahacksecurity/uploads/md_images/footprinting/f1.png" style="max-width:100%; border-radius:8px;">


---

Once the port scan completed successfully, three open ports were identified:
**22 (SSH), 21 (FTP), and 53 (DNS)**. Each corresponds to common services that may represent potential attack vectors.

In this case, the focus was placed on the **FTP service**, since the client provided valid credentials. We analyzed ports **21 and 2121**, both associated with FTP services.

<img src="/budahacksecurity/uploads/md_images/footprinting/f2.png" style="max-width:100%; border-radius:8px;">


---

After obtaining the SSH key from the FTP server, we assigned the appropriate permissions for its use. The following command was used:

```bash
chmod 600 id_rsa
```

In Linux, permissions `600` mean that **only the file owner can read and write the file**, and **no other users have access**.

With the correct permissions in place, we proceeded to connect to the **SSH service (port 22)** using the appropriate credentials:

```bash
ssh -i id_rsa ceil@<ip_address>
```

This allowed us to establish an SSH session and securely access the server.

<img src="/budahacksecurity/uploads/md_images/footprinting/f3.png" style="max-width:100%; border-radius:8px;">


---

Once access to the system was obtained via SSH, we began searching for the **flag.txt** file, which was required by the client as part of the lab objectives.

---

## Footprinting Lab – Medium

---

The second server is accessible to all users within the internal network. During discussions with our client, we pointed out that such servers are often prime targets for attackers and should be included in scope.

The client agreed and added this server to the engagement scope. The objective remains the same: gather as much information as possible and identify ways to leverage it against the system. To protect client data, `HTB` created a user named [name]. We therefore need to obtain this user’s credentials as proof.

---

The first step in our investigation was performing a **port scan** against the target system to identify active services and open ports.

```bash
nmap -p- --open -n -Pn --min-rate 5000 -T5 -sSCV --disable-arp 10.129.12.142
```

---

After completing the scan, multiple open ports were identified. However, several services stood out due to their relevance from a security perspective and potential attack vectors:

* **NFS (Network File System)**
  Allows file sharing between systems. When misconfigured, NFS can allow unauthorized access to sensitive files.

* **RPC (Remote Procedure Call)**
  Enables programs to execute procedures on remote systems. If improperly secured, it can be abused for remote attacks or privilege escalation.

* **SMB (Server Message Block)**
  Used for file and printer sharing on local networks. Certain SMB versions have known vulnerabilities that can lead to unauthorized access or remote code execution.

---

### Focus on Critical Services

Given that **NFS**, **RPC**, and **SMB** are critical services, we decided to focus on them to identify potential vulnerabilities or insecure configurations that could allow unauthorized access.

We began exploitation with **NFS**, as improperly configured NFS services often expose shared resources.

We listed the exported NFS shares using:

```bash
showmount -e 10.129.12.142
```

<img src="/budahacksecurity/uploads/md_images/footprinting/f4.png" style="max-width:100%; border-radius:8px;">


---

The output revealed a shared directory:

```
/TechSupport *
```

The asterisk (`*`) indicates that the share may be accessible by any client, posing a significant security risk.

We mounted the shared resource:

```bash
mkdir -p /tmp/NFS
sudo mount -t nfs 10.129.12.142:/TechSupport ./NFS -o nolock
```

<img src="/budahacksecurity/uploads/md_images/footprinting/f5.png" style="max-width:100%; border-radius:8px;">


---

Multiple `.txt` files were discovered. We read all of them using:

```bash
find . -name "*.txt" -exec cat {} \;
```

This revealed a conversation containing the password for user **alex**.

<img src="/budahacksecurity/uploads/md_images/footprinting/f6.png" style="max-width:100%; border-radius:8px;">

---

Next, we analyzed the exposed **SMB service** using the credentials provided by the client:

```bash
smbclient -U alex -L //10.129.12.142
```

<img src="/budahacksecurity/uploads/md_images/footprinting/f7.png" style="max-width:100%; border-radius:8px;">

---

Among the available shares, we identified **devshare**. We connected to it using the provided credentials:

```bash
smbclient //10.129.12.142/devshare -U <user>
```

Inside the share, we discovered a file named **important.txt**, which likely contained sensitive information.

<img src="/budahacksecurity/uploads/md_images/footprinting/f8.png" style="max-width:100%; border-radius:8px;">


---

After downloading `important.txt`, we analyzed its contents:

```bash
more important.txt
```

The file contained the following line:

```text
sa:87N1ns@slls83
```

---

Using the previously obtained credentials, we connected to the **RDP service**:

```bash
xfreerdp /u:alex /p:lol123!mD /v:10.129.12.142
```

We opened the database as administrator.

<img src="/budahacksecurity/uploads/md_images/footprinting/f9.png" style="max-width:100%; border-radius:8px;">

---

After successfully accessing the system via RDP, we reviewed the SQL database.

Using **SQL Server Management Studio** or a similar interface, we edited the **first 200 records** of the `dbo.devsacc` table.

<img src="/budahacksecurity/uploads/md_images/footprinting/f10.png" style="max-width:100%; border-radius:8px;">

Based on the objectives, various enumeration, service analysis, and controlled exploitation techniques were applied. From identifying exposed services to accessing systems via FTP, SMB, and RDP, multiple ethical pentesting methodologies were used.

Finally, after accessing the system via RDP and exploring the `devsacc` database, key records such as the user `htb` were identified, successfully fulfilling the client’s requirements.

This **concludes the lab successfully**, with all required evidence collected and documented.

---

## Footprinting Lab – Hard

---

The third server is an **MX and administrative server** for the internal network. This server also functions as a backup server for internal domain accounts. Therefore, `HTB` also created a user named [name] here, whose credentials we must obtain.

---

We began with a standard **TCP port scan**, but individual enumeration of each port yielded no useful results. When switching to a **UDP scan**, we identified an open port.

<img src="/budahacksecurity/uploads/md_images/footprinting/f11.png" style="max-width:100%; border-radius:8px;">

---

We enumerated the **SNMP service (161)**:

```bash
snmpwalk -v2c -c backup 10.129.122.14
```

We discovered credentials for the user **tom**.

<img src="/budahacksecurity/uploads/md_images/footprinting/f12.png" style="max-width:100%; border-radius:8px;">

---

Next, we enumerated the **IMAPS service**:

```bash
openssl s_client --connect 10.129.122.14:imaps
```

By interacting with the IMAP server, we found an **SSH private key**:

```bash
1 LOGIN user password
1 LIST "" *
1 SELECT INBOX
1 FETCH 1 BODY[]
```

<img src="/budahacksecurity/uploads/md_images/footprinting/f13.png" style="max-width:100%; border-radius:8px;">

---

We saved the SSH key and assigned the correct permissions:

```bash
chmod 600 id_rsa
ssh -i id_rsa tom@ip-address
```

---

Once inside the system, we noticed that we could read **tom’s `.bash_history`**, revealing that he had accessed a **MySQL database**. Since we already had tom’s password, we connected to the MySQL server:

```bash
mysql -u tom -p
```

<img src="/budahacksecurity/uploads/md_images/footprinting/f14.png" style="max-width:100%; border-radius:8px;">

---

We enumerated the MySQL server and located the **users table**, which contained the user **htb** and its corresponding password.

<img src="/budahacksecurity/uploads/md_images/footprinting/f15.png" style="max-width:100%; border-radius:8px;">


