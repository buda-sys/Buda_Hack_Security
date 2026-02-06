
## Scenario

You are conducting a web application penetration test for a software development company and have been tasked with testing the latest version of their social media web application. Try to use the various techniques learned in this module to identify and exploit multiple vulnerabilities found in the web application.

Login details are provided in the next question.

**Attempt to escalate your privileges and exploit different vulnerabilities to read the flag located at `/flag.php`.**

---

## Initial Access

We log into the application using the provided credentials:

```bash
htb-student:Academy_student!
```

---

## Identifying IDOR

<img src="/budahacksecurity_static/uploads/md_images/web_attack/w.png" style="max-width:100%; border-radius:8px;">

We reload the page and intercept the request using **Burp Suite** to analyze the data sent to the server.

<img src="/budahacksecurity_static/uploads/md_images/web_attack/w1.png" style="max-width:100%; border-radius:8px;">

We observe that the `uid` parameter has the value `74` in the intercepted request. We modify this value to `uid=70` and forward the request.

<img src="/budahacksecurity_static/uploads/md_images/web_attack/w2.png" style="max-width:100%; border-radius:8px;">

After confirming that it is possible to access other users’ information by modifying the `uid` parameter without any additional validation or authentication, we confirm the presence of an **IDOR (Insecure Direct Object Reference)** vulnerability.

---

## Source Code Analysis

While reviewing the source code, we identify a JavaScript script that validates the user based on the `uid` parameter, which is sent to the `/api.php/user/` endpoint to retrieve user information.

```javascript
$(document).ready(function() {
    fetch(`/api.php/user/${$.cookie("uid")}`, {
        method: 'GET'
    }).then(function(response) {
        return response.json();
    }).then(function(json) {
        $("#full_name").html(json['full_name']);
        $("#company").html(json['company']);
    });
});
```

This indicates that we can use **Burp Intruder** to enumerate valid `uid` values and identify the one corresponding to the **administrator** user.

---

## Identifying the Administrator

<img src="/budahacksecurity_static/uploads/md_images/web_attack/w3.png" style="max-width:100%; border-radius:8px;">

---

## Exploiting HTTP Verb Tampering

While analyzing the password change functionality in the **Settings** section, we intercept the corresponding request and observe that it is performed using the HTTP `POST` method. Despite having administrator privileges, the action is rejected by the application.

To test for improper access controls, we change the HTTP method from `POST` to `GET` to check whether it is possible to bypass the implemented security mechanisms and successfully change the administrator’s password.

<img src="/budahacksecurity_static/uploads/md_images/web_attack/w4.png" style="max-width:100%; border-radius:8px;">

After changing the administrator’s password, we log in using the new credentials and observe that the admin panel contains a widget that allows adding events to the dictionary. We intercept the request associated with this functionality using **Burp Suite**.

<img src="/budahacksecurity_static/uploads/md_images/web_attack/w5.png" style="max-width:100%; border-radius:8px;">

---

## XML Injection / XXE Exploitation

Upon intercepting the request, we observe that the request body contains XML tags. Based on this, we proceed to analyze whether it is possible to manipulate these tags to retrieve the flag.

<img src="/budahacksecurity_static/uploads/md_images/web_attack/w6.png" style="max-width:100%; border-radius:8px;">

We identify that the application allows reading local files through the value of the `name` tag. To exploit this behavior, we define an **external entity (`ENTITY SYSTEM`)** using `php://filter` with Base64 encoding. This allows us to retrieve the contents of the flag file without breaking the XML document structure.


