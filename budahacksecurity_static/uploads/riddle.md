

### Description

When examining the PDF file, the challenge description hinted that there was hidden information within the document. The first approach was to analyze its **metadata**, as it is a common technique in CTFs to hide flags.

---

**Tool Used**

**ExifTool** — a command-line tool widely used to read, write, and edit metadata in all types of files.
```python
exiftool documento.pdf
```

When reviewing the output, the **Author** field contained a suspicious string that did not correspond to a conventional name, but rather to text encoded in **Base64**.
```
Author: ZmxhZ3s0bHdheXNfYzNja19tM3Q0ZDR0YX0=
```

The string was then decoded using Base64:
```bash
echo "ZmxhZ3s0bHdheXNfYzNja19tM3Q0ZDR0YX0=" | base64 -d
```

<img src="/budahacksecurity/uploads/md_images/r/rr.png" style="max-width:100%; border-radius:8px;">