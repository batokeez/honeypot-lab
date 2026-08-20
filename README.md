#  Honeypot Lab — Isolated Attack Simulation & Dashboard

Um honeypot SSH isolado, um "atacante" automatizado que o testa, e um dashboard 
que visualiza os dados de ataque recolhidos, tudo a correr localmente em Docker, 
sem custos e sem exposição à internet real.

## Porquê este projeto

Honeypots expostos à internet são comuns em portfólios, mas trazem responsabilidades 
legais e éticas (recolha de dados de IPs reais, risco se o isolamento falhar). 
Este projeto testa o mesmo conceito de forma controlada: em vez de esperar por 
atacantes reais, escrevi o meu próprio script de ataque que simula técnicas comuns 
(brute-force de credenciais, comandos pós-exploração típicos de malware), tudo numa 
rede Docker completamente isolada da internet e da rede local.

Isto permite demonstrar competências tanto do lado defensivo (deteção, logging, 
visualização) como do lado ofensivo (como um atacante automatiza reconhecimento 
e exploração), sem os riscos de expor infraestrutura real.


## Stack técnica

- **Docker Compose** — orquestração e isolamento de rede
- **Cowrie** — honeypot SSH/Telnet de médio interativo
- **Python + paramiko** — script de ataque automatizado
- **Node.js + Express** — servidor do dashboard
- **HTML/CSS/JS vanilla** — visualização (sem frameworks, propositadamente simples)

## Como correr

Pré-requisitos: Docker Desktop instalado.

```bash
# 1. Subir o honeypot
docker compose up -d cowrie

# 2. Construir e correr o atacante automático
docker compose build attacker
docker compose run --rm attacker

# 3. Instalar dependências do dashboard e arrancar
cd dashboard
npm install
node server.js
```

Abrir `http://localhost:3000`.

## O que o atacante simula

O script (`attacker/attack.py`) testa uma lista de credenciais comuns usadas por 
bots reais na internet (`root/admin`, `admin/password`, `root/raspberry`, etc.) e, 
sempre que consegue "entrar", executa uma sequência de comandos típicos de 
reconhecimento e comprometimento (`whoami`, `cat /etc/passwd`, tentativas de 
download de payloads via `wget`/`curl`).

## Resultados de um ataque de teste



- **10 sessões** SSH registadas
- **8 de 8 credenciais testadas** tiveram sucesso (o Cowrie por defeito é permissivo — 
  comportamento esperado de um honeypot, o objetivo é capturar comportamento, não bloquear)
- Comandos mais executados: `whoami`, `cat /etc/passwd`, `uname -a` (reconhecimento), 
  seguidos de tentativas de `wget`/`curl` (download de payload)

## Desafios técnicos e como foram resolvidos

Isto foi construído do zero, incluindo o setup do ambiente, alguns problemas reais 
encontrados pelo caminho:

- **Docker sem virtualização detetada**: resolvido ativando WSL2/Virtual Machine 
  Platform via `dism.exe` e confirmando o estado com `systeminfo` antes de mexer na BIOS
- **Isolamento de rede vs. ferramentas de debug**: a rede `internal: true` bloqueia 
  corretamente o acesso à internet de dentro dos containers — o que também impede 
  instalar ferramentas em runtime. Resolvido usando a imagem `netshoot`, que já vem 
  com ferramentas de rede pré-instaladas
- **Falha SSH intermitente**: negociação de algoritmos de chave incompatível entre 
  cliente SSH moderno e o Cowrie — resolvido forçando algoritmos de compatibilidade 
  (`KexAlgorithms`, `HostKeyAlgorithms`)
- **PATH do Windows**: Node.js e Git instalados mas não reconhecidos em terminais 
  já abertos — sempre resolvido reiniciando o terminal ou corrigindo o PATH do sistema
- **PowerShell Execution Policy**: `npm` bloqueado pela política de segurança por 
  defeito do Windows — resolvido com `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`

## Possíveis melhorias (v2)

- Análise dos comandos executados usando um LLM local (Ollama) para triagem 
  automática e classificação de intenção do atacante
- Timeline interativa dos eventos
- Suporte a mais protocolos honeypot (HTTP, FTP)
- Geolocalização de IPs (aplicável se o honeypot for exposto de forma controlada 
  numa VPS isolada no futuro)

## Aviso

Este projeto é para fins educacionais e de portfólio. O honeypot corre inteiramente 
isolado, sem exposição a redes externas.
