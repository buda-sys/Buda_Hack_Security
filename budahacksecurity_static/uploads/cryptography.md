Cryptography is the discipline that allows transforming intelligible information (plain text) into an incomprehensible format (ciphertext) through mathematical processes. Its fundamental purpose is to ensure that information can only be recovered and read by those who possess the corresponding decryption mechanism or key.

**History of Encryption**

#### Caesar Cipher

Far from being a modern discipline, cryptography has its roots in antiquity, where classical civilizations employed methods such as the Caesar Cipher — based on character shifting — to protect sensitive military and diplomatic communications. Over the centuries, this practice has evolved from manual and mechanical techniques to today's sophisticated digital algorithms, such as AES, which are fundamental to the global internet infrastructure.

This method is based on the principle of substitution, where each unit of the original text (generally letters) is replaced by another unit following a fixed pattern. The most common example of this type is the **Shift Cipher**.

**How It Works**

It consists of substituting each letter of the original message with another letter that is a fixed number of positions ahead in the alphabet. This fixed number is known as the **key** or **shift value**.

**Practical Example: Shift of 2 positions (k=2)**

If we apply a shift of 2 to the word "apple", the process would be as follows:

- a → c (a, b, c)
- p → r (p, q, r)
- p → r (p, q, r)
- l → n (l, m, n)
- e → g (e, f, g)

Result: The word "apple" becomes the ciphertext **"crrng"**.

**The Decryption Process**

To recover the original message, it is essential to know the shift value (n) and the size of the alphabet used. Decryption is simply the reverse operation of encryption.

**Mathematical Foundation**

The system is based on modular arithmetic. The standard formulas are:

- **Encryption:**$$E_n(x) = (x + n) \pmod{26}$$
- **Decryption:**$$D_n(x) = (x - n) \pmod{26}$$
Where x represents the index of the letter in the alphabet (0–25) and n is the shift key.

**Practical Example: Reversing "crrng"**

If we receive the ciphertext "crrng" and know that the original shift was n = 2, we apply a two-position rollback to each character:

1. c → a (steps back: b, a)
2. r → p (steps back: q, p)
3. r → p (steps back: q, p)
4. n → l (steps back: m, l)
5. g → e (steps back: f, e)

Result: The recovered original message is **"apple"**.


#### **Atbash Cipher**

Atbash is a monoalphabetic substitution cipher that originated in antiquity, used primarily by Hebrew scribes. It is known for appearing in religious texts such as the Book of Jeremiah.

**How It Works**

Unlike the Caesar Cipher, where the shift can vary, Atbash has a fixed key. The process consists of reversing the alphabet so that the first letter is replaced by the last, the second by the second-to-last, and so on.

Alphabet mapping (A–Z):

- A ↔ Z
- B ↔ Y
- C ↔ X
- ...and so on until reaching the center of the alphabet.

**Practical Example**

If we want to encrypt the word "HOLA" using a 26-letter alphabet:

1. H becomes S
2. O becomes L
3. L becomes O
4. A becomes Z

Result: The ciphertext of "HOLA" is **"SLOZ"**.

#### **Vigenère Cipher**

The Vigenère cipher represents a critical evolution in the history of cryptography. Unlike monoalphabetic methods (such as Caesar or Atbash), this is a polyalphabetic system, meaning the encryption method changes dynamically for each letter of the message based on a keyword.

**1. The Vigenère Square**

To implement this cipher manually, a 26×26 matrix is used. Although numerical indices in programming go from 0 to 25, the table contains the 26 letters of the standard alphabet (A–Z) to ensure the system is cyclic and complete.

<img src="/budahacksecurity/uploads/md_images/cry/crypto.png" style="max-width:100%; border-radius:8px;">

**2. Encryption Methodology**

To encrypt a message, a key is required that repeats until it matches the length of the original text. The process follows these steps:

1. **Alignment:** The key is placed below the original message.
2. **Location:** The message letter is found in the top horizontal row and the key letter in the left vertical column.
3. **Intersection:** The resulting character is the point where both axes meet in the table.

**Technical Example:**

- Message: `ATAQUE`
- Key: `LEON` (becomes `LEONLE`)
- Result: `LXOFQI`

**3. Mathematical Foundation (Systems Standard)**

In cybersecurity, this process is automated through modular arithmetic. The formula uses modulo 26 to ensure that if the result of the sum exceeds position 25 (Z), the count automatically restarts from A (0).

- Encryption formula: E_i = (P_i + K_i) mod 26
- Decryption formula: D_i = (C_i − K_i) mod 26

The Vigenère cipher was considered unbreakable for centuries because it defeats simple frequency analysis; however, its security depends entirely on the length and randomness of the key used.


#### **Rail Fence Cipher (Fence Cipher)**

This is the most well-known transposition method. Unlike substitution ciphers, this algorithm does not replace characters — instead, it rearranges their order following a "zigzag" or "fence" pattern.

**1. Encryption Mechanism (2-Rail Fence)**

To encrypt, the message is written in diagonal rows, alternating up and down. In the simplest case (2 rails), letters are distributed by alternating positions:

Message: `VULNERABILITY EXPLOIT` (no spaces: `VULNERABILITYEXPLOIT`)

Distribution:

```
Rail 1: V   L   E   A   I   I   Y   X   L   I
Rail 2:   U   N   R   B   L   T   E   P   O   T
```

Result (Ciphertext): The encrypted message is obtained by reading the first rail in full, then the second: `VLEAIYXLIIUNRBLTEOT`

**2. Decryption Process**

To recover the original text, the number of rails must be known (in this case, 2).

1. Split the ciphertext in half (since there are 2 rails).
2. Write the first half on the top rail and the second half on the bottom rail.
3. Read in zigzag order (top → bottom → top) to reconstruct the original message.

**Weakness:** The Rail Fence cipher is extremely vulnerable to cryptanalysis. An attacker can simply try different numbers of rails until the output becomes readable. Furthermore, since letters are never substituted, a basic frequency analysis will reveal that the most common letters in the language (such as 'e' or 'a') appear in exactly the same proportion as in the plaintext — offering no statistical concealment whatsoever.

### Modern Cryptography

In today's digital era, classical ciphers such as Caesar or Atbash have been replaced, in the context of real-world security, by algorithms grounded in computationally hard mathematical problems. This paradigm shift reflects **Kerckhoffs's Principle** (1883): the security of a cryptographic system must not rest on the secrecy of how the algorithm works — which is assumed to be public and known to all — but solely on the strength and confidentiality of the key used.

### Symmetric Encryption (Private Key)

Symmetric encryption, also known as **single-key** encryption, is the most direct method of data protection. In this scheme, both the sender and the receiver must possess the **same secret key** in order to encrypt and decrypt information.

### Symmetric Encryption Algorithms

The following block and stream algorithms are the most widely used in the industry, classified by their structure and current security status:

#### 1. Block Ciphers

These algorithms process data in fixed-size groups of bits (blocks).

**DES (Data Encryption Standard):** It was the U.S. federal standard from 1977. It uses 64-bit blocks and a key of only 56 bits. **Current status:** Obsolete and insecure. Due to its short key length, it can be broken by brute force within hours using modern hardware. NIST formally withdrew its approval in 2005.

**3DES (Triple DES):** Designed to extend the useful life of DES by applying the algorithm three times in succession to each data block, increasing the effective key size to 168 bits. **Current status:** Retired. NIST deprecated it in 2018 and prohibited its use for encryption in new applications as of December 31, 2023. It is only permitted for decrypting legacy data. Its 64-bit block size made it vulnerable to the Sweet32 attack, which accelerated its retirement.

**AES (Advanced Encryption Standard):** The Rijndael algorithm, developed by Belgian cryptographers Joan Daemen and Vincent Rijmen, was selected by NIST in October 2000 and published as an official standard (FIPS 197) in December 2001, following an international competition. It uses 128-bit blocks and supports keys of 128, 192, and 256 bits. **Current status:** Extremely secure and efficient. It is the engine protecting everything from Wi-Fi networks to banking transactions and U.S. government classified information.

**Blowfish:** Designed in 1993 by Bruce Schneier as a fast, royalty-free alternative to other algorithms. It uses 64-bit blocks and variable-length keys (from 32 to 448 bits). **Current status:** Not recommended for new applications. Its 64-bit block size makes it vulnerable to the Sweet32 attack (demonstrated in 2016), which allows plaintext recovery when large volumes of data are encrypted under the same key. Schneier himself recommends migrating to its successor, **Twofish**, which uses 128-bit blocks and offers greater robustness.

#### 2. Stream Ciphers

These algorithms encrypt data bit by bit, making them ideal for real-time transmissions where the final message size is not known in advance.

**RC4 (Rivest Cipher 4):** It was the most widely used stream cipher in the world due to its remarkable speed and simplicity. It was the foundation of protocols such as WEP (Wi-Fi) and older versions of SSL/TLS. **Current status:** Insecure and banned in modern standards. Multiple statistical vulnerabilities have been discovered in its keystream. The IETF formalized its prohibition across all TLS protocol versions through RFC 7465 (February 2015).

|**Algorithm**|**Type**|**Block Size**|**Current Security**|
|---|---|---|---|
|**DES**|Block|64 bits|**None** (Obsolete since 2005)|
|**3DES**|Block|64 bits|**None** (Prohibited since 2024)|
|**AES**|Block|128 bits|**Very High** (Global standard)|
|**Blowfish**|Block|64 bits|**Low** (Vulnerable to Sweet32)|
|**RC4**|Stream|N/A (bit by bit)|**None** (Banned by RFC 7465)|

### Public-Key Encryption (Asymmetric)

Asymmetric encryption emerges to solve the fundamental problem of symmetric encryption: the secure distribution of the key. It is worth noting that symmetric encryption is significantly faster than asymmetric encryption — AES can encrypt at gigabits-per-second speeds, while RSA operates in the kilobits-per-second range — but it requires both parties to share the same secret key beforehand, which represents a security risk.

In any public-key encryption system, two **mathematically linked keys** are used: the **public key**, which can be freely distributed and is used to encrypt a message, and the **private key**, which remains exclusively in the recipient's possession and is used to decrypt it.

**The Alice and Bob Example**

To illustrate how this works, let's use the classic Alice and Bob example. Suppose Alice wants to send a message to Bob, but only wants Bob to be able to read it. Alice will use **Bob's public key** to encrypt the message. Once encrypted, that message can only be decrypted by whoever holds **Bob's private key** — meaning only Bob.

<img src="/budahacksecurity/uploads/md_images/cry/crypto2.png" style="max-width:100%; border-radius:8px;">

The fundamental advantage over symmetric encryption is clear: in this scheme, Alice does not need to arrange a prior meeting with Bob or send him any secret key through a secure channel. It does not matter who intercepts Bob's public key, because that key is only capable of encrypting — never decrypting. Only Bob, with his private key, can access the message's content.

#### RSA (Rivest–Shamir–Adleman)

RSA is one of the most important and widely used public-key algorithms in the world, first publicly described in 1977 by Ron Rivest, Adi Shamir, and Leonard Adleman. Its security is grounded in the computational difficulty of **factoring the product of two very large prime numbers**: multiplying two enormous primes to obtain a number _n_ is easy, but reversing that process is computationally infeasible. The entire robustness of the algorithm rests on this mathematical asymmetry.

### Digital Signatures and Non-Repudiation

Unlike conventional encryption, whose primary goal is confidentiality, digital signatures are used to guarantee the **authenticity**, **integrity**, and **non-repudiation** of information. It is important to note that digital signatures, on their own, **do not encrypt the message content** nor provide confidentiality — the message travels in plaintext. Their purpose is to irrefutably prove the identity of the sender and that the content has not been tampered with.

#### 1. The Process: Reverse Logic of Asymmetric Cryptography

Digital signatures operate through a logic that inverts the standard use of asymmetric keys:

**Signing:** The sender applies a hash function to their message, producing a fixed-size "digital fingerprint." They then **sign that hash with their private key** (which only they possess) using a digital signature algorithm. The result is the digital signature.

**Verification:** The recipient uses the **sender's public key** to verify the signature. If verification succeeds and the resulting hash matches the hash of the received message, it is mathematically confirmed that the message could only have been signed by the holder of the corresponding private key.

#### 2. Practical Example: Bob and Alice

Suppose Bob wishes to send a signed message to Alice:

1. Bob generates a **hash** of his message (the content's "digital fingerprint").
2. Bob **signs that hash** using his own private key. The result is his **Digital Signature**.
3. Bob sends the message in plaintext along with the signature to Alice.
4. Alice receives the package and uses **Bob's public key** to verify the signature.
5. If verification succeeds and the resulting hash matches the received message, Alice has complete certainty that the sender is indeed Bob and that the message was not altered (**integrity**).

#### 3. Key Benefits in Cybersecurity

**Authenticity:** Confirms the sender's identity, since only the holder of the private key could have generated that signature.

**Integrity:** Guarantees that the content has not been modified since it was signed, as any change would alter the hash and cause verification to fail.

**Non-Repudiation:** The sender cannot deny having sent the message, since only their private key could have generated that unique signature. This evidence can be presented to third parties.


### Hash Functions: The Digital Fingerprint of Data

A hash function is a mathematical algorithm that transforms any block of data into a fixed-length string of characters called a **hash value** or **digest**. Unlike encryption, hashing is not designed to be "decrypted" — it is a **one-way operation** whose purpose is to verify data integrity.

#### Fundamental Properties of Hash Functions

**1. One-Way (Unidirectionality):** It is computationally infeasible to reconstruct the original data from the resulting hash value. This irreversibility is the foundation of its security.

**2. Fixed-Length Output:** Regardless of whether the input is a single letter or a 2 TB hard drive, the hash always produces an output of the same size. For example, SHA-256 always generates exactly 256 bits.

**3. Collision Resistance:** A robust algorithm must ensure that two different inputs never produce the same hash. When this occurs, it is called a **collision** and compromises the algorithm's security, potentially allowing a malicious file to impersonate a legitimate one without detection.


#### Use Cases in Cybersecurity

##### A. Password Management in Windows (SAM)

Windows does not store passwords in plaintext. Instead, it applies a hash comparison process:

1. When creating your account, Windows generates a hash of your password and stores it in the **SAM** (_Security Accounts Manager_) file.
2. At login, Windows takes the key you type, generates its hash in real time, and compares it with the one stored in the SAM.
3. If the hashes match, access is granted.

This way, even if an attacker obtains the SAM file, they do not directly get the passwords — though they do get the hashes, which can be targeted by brute-force or rainbow table attacks.

##### B. Digital Forensics and Integrity

In digital forensic analysis, hashing guarantees the **chain of custody**. A hash of the original disk (evidence) is generated at the start of the analysis and another at the end. If even a single bit was modified during the process, the hashes will not match — demonstrating that the evidence was altered, which could invalidate it in legal proceedings.


#### Common Algorithms

**MD5 (Message Digest 5):** Produces a 128-bit hash. Designed by Ronald Rivest in 1991. **Current status: Obsolete and insecure.** Since 2007, it has been possible to generate MD5 collisions in seconds on standard hardware. Its use is prohibited in modern security applications by NIST.

**SHA (Secure Hash Algorithm):**

- **SHA-1:** Produces a 160-bit hash. Developed by the NSA and standardized by NIST in 1995. **Current status: Broken.** NIST officially deprecated it in 2011 and prohibited its use for digital signatures in 2013. In 2017, Google and CWI Amsterdam demonstrated the first practical collision via the _SHAttered_ attack, making it fully broken.
- **SHA-2:** Family including SHA-256 (256 bits) and SHA-512 (512 bits). **This is the current industry standard**, used in SSL/TLS certificates, digital signatures, and Bitcoin mining.
- **SHA-3:** The most recent version, based on a radically different internal architecture called **Keccak**, designed to resist future attack methods, including quantum-based ones.


#### Windows Hashing: From LM to NTLM

**LM (LAN Manager):** The oldest Windows hash, inherited from the OS/2 system of the 1980s. Its weaknesses are structural: it splits the password into two 7-character blocks, converts them to uppercase (eliminating case sensitivity), and applies DES to each block separately. This makes it trivially vulnerable to rainbow table attacks. Windows Vista and later versions disabled LM by default.

**NT Hash (stored via NTLM):** Replaced LM. The NT hash applies the **MD4** algorithm to the complete password encoded in UTF-16, with case sensitivity, making it significantly more robust. However, it does not use salting, leaving it vulnerable to Pass-the-Hash attacks.

**NTLMv2:** The most secure version of Windows' local authentication protocol. It uses **HMAC-MD5** with additional random data (from both client and server), substantially increasing resistance to replay and brute-force attacks. However, for modern environments, **Kerberos** is the protocol recommended by NIST over NTLM.


#### **Rainbow Tables: The Precomputation Attack**

Because hash functions are by definition irreversible, attackers have developed methods to "reverse" them without breaking the underlying algorithm. The most efficient method is the use of Rainbow Tables.

**1. How Does the Attack Work?**

Unlike a brute-force attack (which tests combinations one by one in real time), a Rainbow Table is a precomputed data structure containing chains of hashes and passwords for millions of possible values. Internally, these chains store only their start and end points to save storage space, using reduction functions that alternate with hash functions.

- **The Process:** Once an attacker obtains a hash (for example, from the Windows SAM file), they simply look it up in their table. If a match is found, the plaintext password is revealed almost instantly.
- **Advantage:** This is far faster than brute force because the heavy computational work was done in advance when the table was built.

**2. The "Achilles' Heel": Password Salting**

The standard defense against rainbow tables is salting — adding a random string of bits to the password before hashing it.

- **Without Salt:** If two users share the password `pass123`, their hashes will be identical. An attacker only needs one table entry to compromise both accounts.
- **With Salt:** The system appends unique random data for each user (e.g., `pass123 + fgn` and `pass123 + jnf`).
    - **Result:** Even though the password is the same, the resulting hashes will be completely different.
    - **Impact:** This invalidates precomputed rainbow tables, as the attacker would need to generate a new table for every possible salt value — which is mathematically infeasible given the required storage space.

**3. Auditing and Attack Tools**

Several specialized tools exist in the security field for extracting and processing password data:

- **PWDump:** A family of Windows utilities capable of extracting LM and NTLM hashes from user accounts stored in the Windows SAM file.
- **RainbowCrack:** A tool designed to generate rainbow tables and use them to perform large-scale hash lookups, based on the time-memory tradeoff principle.
- **Ophcrack:** A rainbow-table-based password cracker capable of recovering 99.9% of alphanumeric passwords in seconds. It includes free tables for Windows XP and Vista and is highly effective against unsalted passwords.


#### **Password Crackers**

Just as there are tools to extract password hashes (such as those mentioned previously), there are also tools that allow us to recover plaintext passwords from those hashes. Among the most well-known are `Cain and Abel`, `John The Ripper`, and `Hashcat`.

For example, suppose we have a list of unsalted hashes that we want to crack:

<img src="/budahacksecurity/uploads/md_images/cry/crypto3.png" style="max-width:100%; border-radius:8px;">

We can use John The Ripper with a wordlist to crack them:

<img src="/budahacksecurity/uploads/md_images/cry/crypto4.png" style="max-width:100%; border-radius:8px;">

The plaintext passwords are recovered almost instantly.

When dealing with salted passwords, the likelihood of cracking them depends on three factors: the strength of the password, the attacker's available computing power, and whether the dictionary or rainbow table contains the target password.

As a practical example, suppose we gain access to a low-privilege user on a Linux system where there is a misconfigured `sudo` rule that allows that user to run `cat` as root. This gives read access to restricted files, including `/etc/shadow`, which stores the password hashes for all system users.

<img src="/budahacksecurity/uploads/md_images/cry/crypto5.png" style="max-width:100%; border-radius:8px;">

To crack these passwords offline on our attack machine, we use the `unshadow` utility, which is part of the John The Ripper suite. This tool combines `/etc/passwd` with `/etc/shadow` to produce a file in a format that JTR can process:

```
unshadow /etc/passwd shadow_crack.txt > hash_shadow.txt
```

```
┌──(root㉿kali)-[/home/kali/Desktop]
└─# cat shadow_crack.txt | grep '\$y\$'

kali:$y$j9T$SCuwA6IztrNqUrsws1QOU/$ThaXdDtWsHir6Z9LejK87lrYza5kZFdAlAmSaQjRKb3:20425:0:99999:7:::
user1:$y$j9T$TVJAhE4.a0W3YMyLoCr/..$XPikNRi0Mn2VoQKcHzkpLnerqE8h1ESyjmpeTI3ElM6:20581:0:99999:7:::
user2:$y$j9T$R4wvonYC7WIKqtF9vWJcC.$7zSHmmVm3muPCnnXPX89mwt5iAvg0g0tIQlD6tP3Ie4:20581:0:99999:7:::
user3:$y$j9T$z8b1EARYBUjKZHkZJkZvl1$Y2BlbE//0zc6Ru/ak002EnpQAx/mps7IK6WU6wFIOu/:20581:0:99999:7:::
```

Examining the output file, we can see the structure of each hash. For example, the hash for `user3` begins with `$y$`, which identifies the hashing algorithm as **yescrypt** — the default password hashing scheme in modern Linux distributions such as Kali Linux, Debian 11, and Ubuntu 22.04. Following the algorithm identifier is the random salt (`$j9T$`), and then the actual password hash.

<img src="/budahacksecurity/uploads/md_images/cry/crypto6.png" style="max-width:100%; border-radius:8px;">

As shown in the output, JTR successfully cracked the passwords for **user1**, **user3**, and **kali**, but not for **user2**. The reason is straightforward: the passwords for user1, user3, and kali were weak and predictable, whereas user2's password (`M7$vQ!2zL#9rP@4x`) is strong and meets all security criteria:

- 16 characters long
- Genuinely random
- Diverse character types (letters, numbers, symbols)
- No recognizable patterns
- Not found in any dictionary
- Mix of uppercase, lowercase, digits, and symbols
- No common words


####  **Steganography: The Art of Concealment**

Steganography is the technique of hiding secret information inside a carrier file (such as an image, video, audio file, or text) in such a way that the very existence of the message goes unnoticed. Unlike encryption, where the message is visible but unreadable, in steganography the message is entirely invisible.

**1. Historical Background**

This technique is far from modern. Its origins trace back to antiquity:

- **Ancient Greece:** A slave's head was shaved, the message was tattooed on the scalp, and the slave was sent once the hair grew back to conceal it.
- **Invisible Inks:** Widely used during both World Wars to write messages that only became visible when exposed to heat or specific chemicals.

**2. Digital Steganography and the LSB Method**

One of the most common techniques in digital files today is the modification of the Least Significant Bit (LSB).

- **How it works:** Digital images are made up of pixels, and each pixel is defined by color values (RGB). Each value is an 8-bit byte.
- **The Process:** The last bit of each color byte is altered to embed the bits of the secret message.
- **The Result:** Since the LSB contributes the least to the final color value, the change is imperceptible to the human eye. The image looks exactly the same, yet contains hidden data.

**3. Carrier Types**

- **Images:** Lossless formats like BMP or PNG are ideal for steganography.
- **Audio:** Data is hidden in frequencies beyond the range of human hearing.
- **Video:** Highly effective due to the large volume of data available for concealment.
- **Network Protocols:** Data can be hidden inside the header fields of TCP/IP packets.

**4. Steganalysis**

The counterpart to steganography, steganalysis aims to detect whether a file contains hidden information.

- **Detection:** Performed through statistical analysis that looks for anomalies in a file's bit patterns.
- **Common Tools:** StegExpose, StegSolve, and metadata inspection commands.

**5. Practical Example with Steghide**

Suppose we want to send a hidden message inside an image. For this example, we'll use `steghide`, a tool that embeds a secret file into a carrier image (JPEG or BMP) without altering its visual appearance.

Unlike basic LSB substitution, steghide uses a **graph-theoretic approach**: it finds pairs of pixel positions whose values can be swapped to embed the secret data, while keeping the image's overall statistical properties unchanged — making detection significantly harder.

Additionally, steghide **encrypts** the hidden content before embedding it, using **Rijndael-128 (AES) in CBC mode** by default — the most widely used symmetric encryption standard in the world. This provides a double layer of security: even if someone detects that the image carries hidden data, they cannot read it without the correct passphrase.

To embed the file:

```bash
steghide embed -cf hack.jpeg -ef secret.txt
```

<img src="/budahacksecurity/uploads/md_images/cry/crypto7.png" style="max-width:100%; border-radius:8px;">

The tool requests a passphrase to protect the embedded content. To verify the embedding was successful:


```bash
steghide info hack.jpeg
```
<img src="/budahacksecurity/uploads/md_images/cry/crypto8.png" style="max-width:100%; border-radius:8px;">

The output confirms that `secret.txt` was successfully embedded, encrypted with `rijndael-128, cbc`, and compressed. It is worth noting that although the image looks visually identical, the file's hash changes because its internal byte structure was modified during the embedding process.

#### **Conclusion**

Cryptography is a fundamental pillar across every branch of cybersecurity. You don't need to be an expert to be a responsible digital citizen, but understanding what it is and how it works is essential — because it underlies virtually everything we do in the digital world: from the secure storage of passwords through hash functions, to file integrity verification, credential cracking of weak passwords, and advanced techniques like steganography.

If data is our identity in the digital world, cryptography is the system that protects it — much like a national ID card verifies and backs a person's identity in the physical world, cryptographic mechanisms verify and protect the integrity and confidentiality of data in the digital world. Ignoring these concepts doesn't make them go away; it simply leaves us vulnerable to those who understand and exploit them.