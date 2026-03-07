from pathlib import Path
import shutil

BASE = Path(__file__).parent
CLIENTES = BASE / "clientes"
MODELO = CLIENTES / "clientemodelo"

def substituir_texto(arquivo, cliente):
    texto = arquivo.read_text(encoding="utf-8")
    texto = texto.replace("clientemodelo", cliente)
    arquivo.write_text(texto, encoding="utf-8")

print("=== Criar novo cliente ===")

cliente = input("Nome da pasta do cliente: ").strip().lower()
nome = input("Nome do instalador: ")
whats = input("WhatsApp: ")
pix = input("Pix: ")

origem = MODELO
destino = CLIENTES / cliente

if destino.exists():
    print("Esse cliente já existe.")
    exit()

shutil.copytree(origem, destino)

for arq in ["index.html","android.html","ios.html"]:
    p = destino / arq
    if p.exists():
        substituir_texto(p, cliente)

config = destino / "config.js"

config.write_text(f"""
window.CLIENT_CONFIG = {{
  installer: {{
    nome: "{nome}",
    whats: "{whats}",
    pix: "{pix}"
  }},
  logo: "/climatizaorcamentos/clientes/{cliente}/logo.png"
}};
""",encoding="utf-8")

print("Cliente criado em:")
print(destino)
print("Agora só troque o logo.png")
