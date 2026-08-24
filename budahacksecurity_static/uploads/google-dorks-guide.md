# Google Dorks for Pentesting and Red Team

Google Dorks also known as "Google Hacking"  are advanced search techniques that use Google's special search operators to pull very precise, targeted results. In pentesting and red team work, they're used mainly during the **reconnaissance (OSINT)** phase to map out public information about a target: domains, subdomains, technologies in use, exposed files, admin panels, leaked credentials, and so on all without ever touching the target's infrastructure directly. That's what makes dorking a **passive** technique with a very low chance of being detected.

The real value here is finding **forgotten or misconfigured attack vectors** that got exposed by accident — backup files, unprotected login panels, internal documents that somehow got indexed, or error messages that leak details about the tech stack. Any of these can turn into an entry point for later stages of an attack.

## 1. Basic Operators

|Operator|What it does|Example|
|---|---|---|
|`site:`|Limits the search to a specific domain or subdomain|`site:example.com`|
|`filetype:` / `ext:`|Filters results by file extension|`filetype:pdf`|
|`inurl:`|Looks for a term inside the URL|`inurl:admin`|
|`intitle:`|Looks for a term inside the page title|`intitle:"index of"`|
|`intext:`|Looks for a term inside the page's body content|`intext:"password"`|
|`cache:`|Shows Google's cached version of a page (mostly deprecated — Google has been phasing it out over the last couple of years)|`cache:example.com`|
|`related:`|Shows sites "related" to the given domain|`related:example.com`|
|`link:`|Used to show pages linking to a site; today it's heavily limited and doesn't really work like it used to|`link:example.com`|
|`"..."` (quotes)|Exact phrase match|`"index of /"`|
|`-` (minus)|Excludes a term from results|`site:example.com -inurl:blog`|
|`*` (asterisk)|Wildcard, stands in for one or more words|`intitle:"index of" "*.sql"`|
|`..` (double dot)|Numeric range|`site:example.com "2020..2024"`|

**Worth knowing:** `cache:` and `link:` show up constantly in older Google Dorking guides (roughly 2010–2018), but Google has restricted or outright removed how they work over the years. They're included here because you'll still see them referenced in the GHDB and in classic write-ups, but don't rely on them the way people used to.

## 2. Logical / Combination Operators

|Operator|What it does|Example|
|---|---|---|
|`OR` / `\|`|Either term|`filetype:sql (password \| passwd)`|
|`AND`|Both terms (Google applies this by default between words, so you rarely need to type it)|`site:example.com AND filetype:pdf`|
|`( )`|Groups terms together, useful with OR|`(inurl:admin \| inurl:login)`|

## 3. Combined / Advanced Operators (Applied to Pentest and Red Team Work)

This is where dorking actually earns its keep  stacking operators together for real-world recon scenarios.

**Finding exposed login panels**

```
site:example.com (inurl:login | inurl:admin | inurl:panel)
```

Maps out possible administrative entry points within the target domain.

**Finding exposed sensitive files**

```
site:example.com (filetype:pdf | filetype:doc | filetype:xls | filetype:sql | filetype:log)
```

Looks for documents, spreadsheets, backups, or logs indexed within the domain  often containing internal information that was never meant to be public.

**Directory listings with specific content**

```
intitle:"index of" "backup" site:example.com
```

Combines `intitle` + an exact phrase + `site` to narrow the search down to open directory listings that contain the word "backup," within the target domain.

**Error messages that leak the tech stack**

```
site:example.com intext:"Warning: mysql_connect()"
```

Poorly handled PHP/MySQL errors (i.e., `error_reporting(0)` never set) sometimes get indexed and expose server paths, software versions, or database structure.

**Exposed configuration files**

```
site:example.com (filetype:env | filetype:ini | filetype:conf | filetype:config)
```

`.env`, `.ini`, and `.conf` files sometimes end up exposed due to server misconfiguration (they should be blocked at the `.htaccess` level or equivalent), and they can contain credentials, API keys, database connection strings, and more.

**Documents with metadata / employee information (for people-focused OSINT)**

```
site:example.com filetype:pdf "confidential"
```

Useful during the OSINT phase to dig up internal information leaked in public documents  employee names, org structure, etc.  especially once you check the file's metadata after downloading it, using a tool like `exiftool`.

**Subdomains and related assets**

```
site:*.example.com -site:www.example.com
```

Excludes the main `www` subdomain to focus on other indexed subdomains (dev, staging, api, admin, etc.)  it's extremely common to find forgotten dev or test environments exposed this way.

**Devices and panels with predictable titles**

```
intitle:"Welcome to nginx" -site:nginx.org
intitle:"Apache2 Ubuntu Default Page"
```

Helps find freshly installed or misconfigured servers still showing their default landing page  a sign that setup wasn't finished properly, or that there's more unmapped attack surface out there.

> **Important:** These dorks should only ever be used within the **authorized scope** of an engagement (a pentest/red team job with a signed contract and authorization) or against your own systems/information. Using these techniques against targets without authorization counts as unauthorized access and is illegal in most jurisdictions.

## 4. Typical Use Cases in Pentest / Red Team Work

### 4.1 Infrastructure Recon (Attack Surface Mapping)

Before touching anything active, dorking is used to understand what the target already has exposed in Google's index.

```
site:example.com
site:*.example.com -site:www.example.com
site:example.com inurl:dev | inurl:staging | inurl:test | inurl:qa
```

Goal: find subdomains and forgotten dev/staging environments  these are common entry points because they usually have weaker security controls than production.

### 4.2 Technology Fingerprinting (Passive)

```
site:example.com intext:"powered by"
site:example.com inurl:wp-content
site:example.com inurl:/administrator (Joomla)
```

Helps figure out the CMS, framework, or tech stack without actively scanning (nmap, whatweb, etc.), keeping your footprint low during the early phase.

### 4.3 Sensitive Files and Information Disclosure

```
site:example.com filetype:xls "password"
site:example.com filetype:pdf "confidential" | "internal use only"
site:example.com filetype:log
```

Internal documents, spreadsheets with credentials, application logs  anything indexed by mistake here is gold during recon.

### 4.4 Admin Panels and Authentication Points

```
site:example.com (inurl:login | inurl:admin | inurl:panel | inurl:portal)
intitle:"login" site:example.com
```

Maps every point with an authentication form, which can later be tested (with authorization) for brute force, default credentials, etc.

### 4.5 Application Errors / Stack Traces

```
site:example.com intext:"Warning: mysql_connect()"
site:example.com intext:"Fatal error" intext:"on line"
```

Poorly handled stack traces reveal absolute server paths, language/framework versions, and sometimes even fragments of SQL queries.

### 4.6 People OSINT / Social Engineering

```
site:linkedin.com "example.com" "IT" | "sysadmin" | "developer"
site:example.com filetype:pdf intext:"@example.com"
```

Used to rebuild the org chart, identify key employees (IT, HR, finance) and their emails direct input for a simulated phishing campaign in a red team engagement.

### 4.7 Exposed Code Repositories

```
site:github.com "example.com" "password" | "api_key" | "secret"
site:pastebin.com "example.com"
```

Checks whether company credentials, tokens, or configs have leaked into public repos, gists, or pastebins — it's very common to find a `.env` file accidentally pushed to a public repo.

## 5. The Google Hacking Database (GHDB) in Depth

### 5.1 What It Is

The **GHDB (Google Hacking Database)** is a public, community-driven collection of Google Dorks, hosted inside **Exploit-DB** (`exploit-db.com/google-hacking-database`), which is maintained by **Offensive Security** — the team behind Kali Linux and the OSCP certification.

It was created by security researcher **Johnny Long**, who coined the term "googleDork" back in 2002 and began organizing it into a proper database in 2004. His book _Google Hacking for Penetration Testers_ became the foundational text on the subject. After nearly a decade of community-driven growth, Long handed the GHDB over to Offensive Security in **November 2010**, and it's been hosted as part of Exploit-DB ever since.

### 5.2 How It's Organized

Each GHDB entry includes:

- **The dork** (the exact query)
- **Category** it belongs to
- **Date** it was added/verified
- **Author** who submitted it

The main categories dorks get sorted into:

|Category|What it looks for|
|---|---|
|**Footholds**|Initial entry points, exposed web shells|
|**Files Containing Usernames**|Exposed lists of usernames|
|**Sensitive Directories**|Directories with sensitive content indexed (`index of`, backups, etc.)|
|**Web Server Detection**|Default pages, exposed server versions|
|**Vulnerable Files**|Files with names tied to known vulnerabilities|
|**Vulnerable Servers**|Exposed installs of software with known vulnerabilities|
|**Error Messages**|Error messages that leak system information|
|**Files Containing Juicy Info**|Sensitive information in general (configs, credentials)|
|**Files Containing Passwords**|Files containing passwords or hashes|
|**Sensitive Online Shopping Info**|Exposed payment/card info in e-commerce sites|
|**Network or Vulnerability Data**|Exposed scan outputs, vulnerability reports|
|**Pages Containing Login Portals**|Discovered login panels|
|**Various Online Devices**|IP cameras, printers, routers, and other devices with an exposed web interface|
|**Advisories and Vulnerabilities**|Dorks tied to specific CVEs|

### 5.3 How to Actually Use It

1. Go to `exploit-db.com/google-hacking-database`.
2. Filter by category, or search by keyword/technology (e.g., "wordpress," "cisco," "sql").
3. Take the dork and add `site:` for your target to scope it to the engagement:

```
site:example.com [dork from GHDB]
```

**Real example in GHDB style** (category: _Files Containing Passwords_):

```
filetype:env "DB_PASSWORD" -github.com
```

Looks for indexed `.env` files containing the typical database credential variable — GitHub is excluded because it generates tons of false positives from code repos, rather than production sites with the file actually exposed live.

**Real example** (category: _Various Online Devices_):

```
intitle:"webcamXP 5"
intitle:"Live View / - AXIS"
```

Classic dorks for finding IP cameras with an exposed, unauthenticated admin web interface — this is one of the most cited examples in security talks and in the GHDB itself.

<img src="/budahacksecurity/uploads/md_images/dorks/Dorks.png" style="max-width:100%; border-radius:8px;">


### 5.4 Important Limitations

- A lot of GHDB dorks are **old** and no longer return results, since Google's indexing constantly changes and companies eventually fix these exposures.
- Not everything listed in the GHDB is still exploitable — you have to **verify** every single result, never assume.
- Google also throttles aggressive querying (rate limiting, CAPTCHAs) if you run a lot of automated searches back to back.

### 5.5 Automation

There are tools that automate dork querying, some of which scrape the GHDB directly:

- **Pagodo**
- **dorks-eye**
- **Various GHDB scraper scripts** (several on GitHub)

