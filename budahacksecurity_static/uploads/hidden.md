
**Description**

An apparently ordinary JPG image is provided. The objective is to discover the hidden payload and extract the flag.

---

### Metadata Review with ExifTool
```bash
exiftool img.jpg
```

When analyzing the output, a field with a string encoded in **Base64** was found within the image comments.

---

**Base64 String Decoding**

The string found in the metadata was:
```
c3RlZ2hpZGU6Y0VGNmVuZHZjbVE9
```

When decoded:
```bash
echo -n "c3RlZ2hpZGU6Y0VGNmVuZHZjbVE9" | base64 -d
```

**Result:**
```
steghide:cEF6endvcmQ=
```

This revealed that the file used **Steghide** and that the password was also encoded in Base64.

---

### Password Decoding
```bash
echo -n "cEF6endvcmQ=" | base64 -d
```

**Password obtained:**
```
pAzzword
```

---

**Hidden File Extraction**

With the discovered password, the hidden content was extracted:
```bash
steghide extract -sf img.jpg
Enter passphrase: pAzzword
```

Steghide successfully extracted the **flag.txt** file.

---

**Flag**
```
picoCTF{h1dd3n_1n_1m4g3_1c55ccd0}
```

---

### Conclusion

The flag was hidden within the JPG image using **Steghide**. The key to solving it was finding a **nested Base64** string in the metadata: the first layer revealed the tool used and the second layer contained the password to extract the hidden file.