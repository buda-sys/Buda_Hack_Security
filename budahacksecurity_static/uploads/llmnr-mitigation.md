
The most effective way to prevent LLMNR and NBT-NS poisoning attacks is to simply disable both protocols across all Windows machines in the environment.

**Disable LLMNR via Group Policy:**

```
→ wind + r 
→ gpedit.msc
→ Administrative Templates
→ Network → DNS Client
→ Turn off Multicast Name Resolution
→ Set to: Enabled
```
<img src="/budahacksecurity/uploads/md_images/mllmnr/mll.png" style="max-width:100%; border-radius:8px;">



**Disable NBT-NS**
```
Control Panel → Network Adapter → Properties → IPv4 → Advanced → WINS → Disable NetBIOS over TCP/IP
```


<img src="/budahacksecurity/uploads/md_images/mllmnr/mll2.png" style="max-width:100%; border-radius:8px;">


**Verify that the Mitigation Works**

After applying the mitigations, we need to confirm that the attack is no longer effective. To do this, we re-run Responder on the attacking machine and attempt to trigger the same broadcast from the victim.

<img src="/budahacksecurity/uploads/md_images/mllmnr/mll3.png" style="max-width:100%; border-radius:8px;">


**Important Finding — MDNS as a Fallback Vector**

During the mitigation verification, we observed that even after disabling both LLMNR and NBT-NS on the victim machine, Responder was still able to poison the network and capture the NTLMv2 hash. This is because **mDNS (Multicast DNS)** remained active and was used as a fallback resolution protocol.

```
[MDNS] Poisoned answer sent to 192.168.56.101 for name fileserver.local
[SMB]  NTLMv2-SSP Hash captured for .\prueba
```

This demonstrates that disabling only LLMNR and NBT-NS is **not sufficient**. mDNS must also be explicitly disabled to fully mitigate this attack vector.

To disable mDNS on Windows:

```powershell
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Dnscache\Parameters" /v EnableMDNS /t REG_DWORD /d 0 /f
```

<img src="/budahacksecurity/uploads/md_images/mllmnr/mll4.png" style="max-width:100%; border-radius:8px;">


Restart Machine

<video controls width="100%" preload="metadata">
  <source src="uploads/md_images/mllmnr/mll5.mp4" type="video/mp4">
  Your browser does not support MP4 video.
</video>

**Mitigation Verified Successfully**

As observed in the recorded demonstration, after disabling LLMNR, NBT-NS, and mDNS on the victim machine, Responder was no longer able to capture any NTLMv2 hash or establish any poisoned connection. The tool remained idle with no activity, confirming that all three protocols must be disabled to fully protect against this attack vector.


**Additional mitigations:** 

- Enable **SMB Signing** to prevent NTLM relay attacks even if hashes are captured 
- Enforce **strong password policies** to make offline cracking unfeasible 
- Use **Network Access Control (NAC)** to prevent rogue devices on the network 
- Monitor network traffic for abnormal LLMNR and NBT-NS broadcast activity 
- Deploy **Intrusion Detection Systems (IDS)** to alert on poisoning attempts

**MITRE ATT&CK Framework**

This technique is documented in the MITRE ATT&CK framework as:

|Field|Detail|
|---|---|
|ID|`T1557.001`|
|Name|Adversary-in-the-Middle: LLMNR/NBT-NS Poisoning and SMB Relay|
|Tactic|Credential Access, Collection|
|Platform|Windows|
|Last Modified|October 24, 2025|

This attack is classified as a sub-technique of **Adversary-in-the-Middle (T1557)**. It has been used by real threat actors including **Lazarus Group** and **Wizard Spider**, demonstrating its relevance in real-world attacks beyond controlled lab environments.


