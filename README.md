# Honeypot Lab — Isolated Attack Simulation & Dashboard

An isolated SSH honeypot, an automated "attacker" that tests it, and a dashboard 
that visualizes the collected attack data, all running locally in Docker, 
with no costs and no exposure to the real internet.

## Why this project

Internet-exposed honeypots are common in portfolios, but they carry legal and 
ethical responsibilities (collecting real IP data, risk if isolation fails). 
This project tests the same concept in a controlled way: instead of waiting for 
real attackers, I wrote my own attack script that simulates common techniques 
(credential brute-forcing, post-exploitation commands typical of malware), all 
within a Docker network completely isolated from the internet and the local network.

This demonstrates both defensive skills (detection, logging, visualization) and 
offensive understanding (how an attacker automates reconnaissance and exploitation), 
without the risks of exposing real infrastructure.

## Tech stack

- **Docker Compose** — orchestration and network isolation
- **Cowrie** — medium-interaction SSH/Telnet honeypot
- **Python + paramiko** — automated attack script
- **Node.js + Express** — dashboard server
- **HTML/CSS/JS vanilla** — visualization (no frameworks, kept simple on purpose)

## How to run

Prerequisites: Docker Desktop installed.

```bash
# 1. Start the honeypot
docker compose up -d cowrie

# 2. Build and run the automated attacker
docker compose build attacker
docker compose run --rm attacker

# 3. Install dashboard dependencies and start it
cd dashboard
npm install
node server.js
```

Open `http://localhost:3000`.

## What the attacker simulates

The script (`attacker/attack.py`) tests a list of common credentials used by 
real bots on the internet (`root/admin`, `admin/password`, `root/raspberry`, etc.) 
and, whenever it "gets in", runs a sequence of commands typical of reconnaissance 
and compromise (`whoami`, `cat /etc/passwd`, `wget`/`curl` payload download attempts).

## Results from a test run

- **10 SSH sessions** logged
- **8 of 8 tested credentials** succeeded (Cowrie is permissive by default — 
  expected behavior for a honeypot, the goal is to capture behavior, not block it)
- Most executed commands: `whoami`, `cat /etc/passwd`, `uname -a` (reconnaissance), 
  followed by `wget`/`curl` attempts (payload download)

## Technical challenges and how they were solved

This was built from scratch, including the environment setup — some real problems 
encountered along the way:

- **Docker not detecting virtualization**: solved by enabling WSL2/Virtual Machine 
  Platform via `dism.exe` and confirming the state with `systeminfo` before touching the BIOS
- **Network isolation vs. debugging tools**: the `internal: true` network correctly 
  blocks internet access from inside the containers — which also prevents installing 
  tools at runtime. Solved by using the `netshoot` image, which comes with network 
  tools pre-installed
- **Intermittent SSH failure**: incompatible key exchange algorithm negotiation 
  between a modern SSH client and Cowrie — solved by forcing compatibility algorithms 
  (`KexAlgorithms`, `HostKeyAlgorithms`)
- **Windows PATH**: Node.js and Git installed but not recognized in already-open 
  terminals — always solved by restarting the terminal or fixing the system PATH
- **PowerShell Execution Policy**: `npm` blocked by Windows' default security 
  policy — solved with `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`

## Possible improvements (v2)

- Analyzing executed commands using a local LLM (Ollama) for automatic triage 
  and attacker intent classification
- Interactive event timeline
- Support for more honeypot protocols (HTTP, FTP)
- IP geolocation (applicable if the honeypot is exposed in a controlled way 
  on an isolated VPS in the future)

## Disclaimer

This project is for educational and portfolio purposes. The honeypot runs 
entirely isolated, with no exposure to external networks.