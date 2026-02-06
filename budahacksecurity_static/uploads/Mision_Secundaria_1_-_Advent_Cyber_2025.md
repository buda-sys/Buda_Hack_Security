
McSkidy left us a letter in `/home/mcskidy/Documents` that allows us to obtain access to the key for **Side Quest 1**, accessible through  
https://tryhackme.com/adventofcyber25/sidequest

When reviewing the file McSkidy left for us, it states:

```bash
From: mcskidy
To: whoever finds this

I had a brief moment when nobody was watching. I took advantage of it.

I managed to plant some clues in the account.
If you manage to access the user below and look carefully,
those three small "easter eggs" will combine to form a password
that unlocks another message I encrypted in the directory
/home/eddi_knapp/Documents/.
I didn’t want unwanted people to see it.

Access the user account:
username: eddi_knapp
password: S0someting1Sc0ming

There are three hidden easter eggs.
They combine to form the password that opens my encrypted vault.

Clues (one for each egg):

1)
I travel with your session, not with your file trunk.
Open the little pouch your shell carries when you arrive.

2)
The tree shows today; the rings remember yesterday.
Read the old pages of the ledger.

3)
When pixels sleep, their tails sometimes whisper simple words.
Listen to the tail.

Find the fragments, join them in order, and use the resulting password to decrypt the message I left. Be careful: I had to be quick and only left just enough to ask for help.

~ McSkidy


Here we can see that McSkidy left **three hidden password fragments**, one per clue.
First, we log in as the user `eddi_knapp`.

```bash
su eddi_knapp
pass: S0someting1Sc0ming
```

---

## Fragment 1 — Solving the First Clue

**Clue #1**

```bash
I travel with your session, not with your file trunk.
Open the little pouch your shell carries when you arrive.
```

### Technical interpretation

The clue points to a fragment that:

* travels with the **user session**
* is not part of standard configuration files
* is tied to the shell environment

Instead of persistent files like `~/.bash_history`, we performed a **recursive search** inside the user directory.

### Targeted search with `grep`

```bash
grep -ri "PASS\|pass\|FRAG\|frag" .
```

Result:

```bash
PASSFRAG1=3ast3r
```

This confirms the **first password fragment**, stored as an environment variable that travels with the session.

---

## Fragment 3 — Solving the Third Clue

**Clue #3**

```bash
When pixels sleep, their tails sometimes whisper simple words.
Listen to the tail.
```

### Technical interpretation

This clue clearly references:

* image-related data (“pixels”)
* hidden or secondary data (“sleep”)
* trailing content (“tail”)

A suspicious file exists in the Pictures directory:

```bash
/Pictures/.easter_egg
```

Although not an image itself, it stores **image-related metadata**, matching the clue.

### Recursive search

```bash
grep -ri "PASS\|pass\|FRAG\|frag" .
```

Result:

```bash
PASSFRAG3: c0M1nG
```

This fragment was hidden inside a concealed metadata file, perfectly matching the clue.

---

## Fragment 2 — Solving the Second Clue

**Clue #2**

```bash
The tree shows today; the rings remember yesterday.
Read the old pages of the ledger.
```

### Interpretation

This metaphor points directly to **Git**:

* tree → working tree (current state)
* rings → commit history
* ledger → commit log

While enumerating the system, we discovered a hidden repository:

```bash
.secrets_git
```

We explore it:

```bash
cd ~/.secrets_git/.git
```

List commits:

```bash
git log --oneline

e924698 (HEAD -> master) remove sensitive note
d12875c add private note
```

The older commit looks suspicious. We inspect it:

```bash
git show d12875c
```

Output:

```bash
========================================
Private note from McSkidy
========================================
We hid things to buy time.
PASSFRAG2: -1s-
```

---

## Combining the fragments

```bash
3ast3r-1s-c0M1nG
```

---

## Decrypting McSkidy’s message

```bash
cd /home/eddi_knapp/Document

gpg --pinentry-mode=loopback --passphrase "3ast3r-1s-c0M1nG" -d mcskidy_note.txt.gpg
```

### Decrypted message

```bash
Congratulations! You found all the fragments and reached this file.

Below is the list that should be active on the site. If you replace the contents of /home/socmas/2025/wishlist.txt with this exact list (one item per line, no numbering), the site will recognize it and the takeover bug will be stopped.

Hardware security keys (YubiKey or similar)
Commercial password manager subscriptions (team seats)
Endpoint detection & response (EDR) licenses
Secure remote access appliances (jump boxes)
Cloud workload scanning credits (container/image scanning)
Threat intelligence feed subscription

Secure code review / SAST tool access
Dedicated secure test lab VM pool
Incident response runbook templates and playbooks
Electronic safe drive with encrypted backups

UNLOCK_KEY: 91J6X7R4FQ9TQPM9JX2Q9X2Z
```

---

## Fixing the website

Replace the contents of `/home/socmas/2025/wishlist.txt` exactly as follows:

```bash
Hardware security keys (YubiKey or similar)
Commercial password manager subscriptions (team seats)
Endpoint detection & response (EDR) licenses
Secure remote access appliances (jump boxes)
Cloud workload scanning credits (container/image scanning)
Threat intelligence feed subscription

Secure code review / SAST tool access
Dedicated secure test lab VM pool
Incident response runbook templates and playbooks
Electronic safe drive with encrypted backups
```

Reload the site:

```bash
http://<IP>:8081
```

<img src="/budahacksecurity_static/uploads/md_images/mcskidy/m.png" style="max-width:100%; border-radius:8px;">

---

## Decrypting the website output

```bash
cd /tmp
nano website_output.txt
```

Paste the encrypted text and save.

```bash
openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -salt -base64 \
-in /tmp/website_output.txt \
-out /tmp/decoded_message.txt \
-pass pass:'91J6X7R4FQ9TQPM9JX2Q9X2Z'
```

```bash
cat /tmp/decoded_message.txt
```

Output:

```bash
Well done! The vulnerability is fixed.
THM{w3lcome_2_A0c_2025}

NEXT STEP:
Use the FLAG as the password to unlock:
/home/eddi_knapp/.secret/dir
```

---

## Retrieving the side quest key

```bash
gpg --decrypt dir.tar.gz.gpg > dir.tar.gz
```

Password:

```bash
THM{w3lcome_2_A0c_2025}
```

<img src="/budahacksecurity/uploads/md_images/mcskidy/b.png" style="max-width:100%; border-radius:8px;">

```bash
tar -xf dir.tar.gz
cd dir
xdg-open sq1.png
```

<img src="/budahacksecurity/uploads/md_images/mcskidy/a.png" style="max-width:100%; border-radius:8px;">

### Side Quest 1 Key

```bash
now_you_see_me
```


