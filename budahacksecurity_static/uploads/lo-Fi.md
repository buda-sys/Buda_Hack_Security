
## Enumeration

The **enumeration phase** focuses on gathering as much information as possible from the target system in order to identify misconfigurations, weaknesses, or vulnerabilities that can later be exploited.

<img src="/budahacksecurity/uploads/md_images/lofi/lofi.png" style="max-width:100%; border-radius:8px;">

We start by visiting the target application through the browser, where we are presented with what appears to be a **music streaming web page**. At first glance, the application looks simple and harmless, but this type of functionality often relies on backend file handling, which may introduce vulnerabilities such as **Local File Inclusion (LFI)**.

<img src="/budahacksecurity/uploads/md_images/lofi/lofi1.png" style="max-width:100%; border-radius:8px;">

To better understand how the application works, we intercept the HTTP request using **Burp Suite**. Once intercepted, we forward the request to **Repeater** in order to manually modify parameters and observe how the server responds.

During this analysis, we identify a parameter that appears to reference local files on the server. By manipulating this parameter, we are able to test for **Local File Inclusion (LFI)** by attempting directory traversal payloads such as:

```text
../../../../etc/passwd
```

This confirms that the application does not properly validate or sanitize user input before using it in file operations.

<img src="/budahacksecurity/uploads/md_images/lofi/lofi2.png" style="max-width:100%; border-radius:8px;">

Once the LFI vulnerability is confirmed, we leverage it to read sensitive files on the system. Since the objective of the machine is to retrieve the **flag**, we attempt to include the file where the flag is stored.

By crafting the appropriate payload and sending it through Burp Repeater, we successfully retrieve the contents of the flag file.

<img src="/budahacksecurity/uploads/md_images/lofi/lofi3.png" style="max-width:100%; border-radius:8px;">

At this point, the objective has been completed successfully. The vulnerability has been identified, exploited, and the flag has been obtained.

**Machine completed.**

---

### Additional Notes

* This challenge highlights how **simple applications** can still introduce **critical vulnerabilities** if user input is not properly handled.
* **Local File Inclusion (LFI)** can often lead to:

  * Disclosure of sensitive system files
  * Access to application source code
  * Credential leakage
  * In some cases, **Remote Code Execution (RCE)** when combined with log poisoning or file upload features
* Proper input validation, allow-listing, and secure file handling are essential to prevent this class of vulnerabilities.

