import requests
import json
import time

BASE_URL = "http://localhost:3000"

def print_separator(title):
    print("\n" + "="*50)
    print(f" {title}")
    print("="*50)

def test_list_chats():
    print_separator("TESTE: Listar Conversas (GET /chat/list)")
    try:
        response = requests.get(f"{BASE_URL}/chat/list")
        if response.status_code == 200:
            chats = response.json().get('chats', [])
            print(f"✅ Sucesso! Encontradas {len(chats)} conversas.")
            for i, chat in enumerate(chats[:5]): # Mostra as 5 primeiras
                print(f"   {i+1}. {chat}")
        else:
            print(f"❌ Erro: Status {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Falha na conexão: {e}")

def test_send_message():
    print_separator("TESTE: Enviar Mensagem (POST /chat)")
    payload = {
        "prompt": "Olá! Responda com uma frase curta em português.",
        "search": False,
        "deepThink": False
    }
    print(f"Enviando prompt: '{payload['prompt']}'")
    
    try:
        start_time = time.time()
        response = requests.post(f"{BASE_URL}/chat", json=payload)
        duration = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Resposta recebida em {duration:.2f}s:")
            print("-" * 30)
            print(data.get('response', 'Sem resposta'))
            print("-" * 30)
        else:
            print(f"❌ Erro: Status {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Falha na conexão: {e}")

def test_new_chat():
    print_separator("TESTE: Nova Conversa (POST /chat/new)")
    try:
        response = requests.post(f"{BASE_URL}/chat/new")
        if response.status_code == 200:
            print("✅ Sucesso! Nova conversa iniciada.")
            print(response.json())
        else:
            print(f"❌ Erro: Status {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Falha na conexão: {e}")

if __name__ == "__main__":
    print(f"Iniciando bateria de testes em {BASE_URL}...")
    
    # 1. Listar conversas iniciais
    test_list_chats()
    
    # 2. Enviar uma mensagem
    test_send_message()
    
    # 3. (Opcional) Iniciar novo chat - descomente se quiser testar, pois reseta o contexto
    # test_new_chat()
    
    print("\nTestes finalizados.")
