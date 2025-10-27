"""
TechMind PRO - Script de Inferencia Optimizado
Para usar después del entrenamiento
"""

import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel
import time

# =========================================================
# CONFIGURACIÓN
# =========================================================
BASE_MODEL = "EleutherAI/gpt-j-6B"
LORA_PATH = "/workspace/TechMind/lora_final_pro"  # Modelo de FASE 2

SYSTEM_PROMPT = (
    "Eres TechMind, experto en redes y ciberseguridad. "
    "Responde SIEMPRE en español claro y técnico, con pasos y comandos cuando aplique.\n"
)

# =========================================================
# CARGAR MODELO (solo una vez)
# =========================================================
print("🧩 Cargando TechMind PRO...")
print(f"📁 Modelo: {LORA_PATH}")

tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

print("🔧 Cargando GPT-J 6B...")
model = AutoModelForCausalLM.from_pretrained(
    BASE_MODEL,
    torch_dtype=torch.float16,
    device_map="auto",
    load_in_8bit=True  # Reduce RAM
)

print("🔗 Aplicando LoRA...")
model = PeftModel.from_pretrained(model, LORA_PATH)
model.eval()

print("✅ TechMind PRO listo\n")

# =========================================================
# FUNCIÓN DE INFERENCIA
# =========================================================
def ask_techmind(
    pregunta: str,
    max_tokens: int = 400,
    temperature: float = 0.6,
    top_p: float = 0.9
) -> dict:
    """
    Genera respuesta de TechMind
    
    Args:
        pregunta: Pregunta del usuario
        max_tokens: Longitud máxima de respuesta
        temperature: Creatividad (0.1=conservador, 1.0=creativo)
        top_p: Diversidad de vocabulario
    
    Returns:
        dict con 'respuesta', 'tiempo' y 'tokens'
    """
    
    # Construir prompt
    prompt = f"{SYSTEM_PROMPT}Pregunta: {pregunta}\nRespuesta: "
    
    # Tokenizar
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    
    # Medir tiempo
    start_time = time.time()
    
    # Generar
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=max_tokens,
            temperature=temperature,
            top_p=top_p,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id,
            eos_token_id=tokenizer.eos_token_id,
            repetition_penalty=1.15,
            no_repeat_ngram_size=3
        )
    
    elapsed_time = time.time() - start_time
    
    # Decodificar
    respuesta_completa = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # Limpiar (quitar prompt)
    if "Respuesta:" in respuesta_completa:
        respuesta = respuesta_completa.split("Respuesta:", 1)[-1].strip()
    else:
        respuesta = respuesta_completa
    
    # Calcular tokens
    tokens_generados = len(outputs[0]) - len(inputs["input_ids"][0])
    
    return {
        "respuesta": respuesta,
        "tiempo": round(elapsed_time, 2),
        "tokens": tokens_generados
    }

# =========================================================
# MODO INTERACTIVO
# =========================================================
def modo_interactivo():
    """Chat interactivo con TechMind"""
    
    print("=" * 70)
    print("🧠 TECHMIND PRO - Modo Interactivo")
    print("=" * 70)
    print("Escribe 'salir' para terminar")
    print("Escribe 'ajustes' para cambiar parámetros")
    print()
    
    # Parámetros por defecto
    config = {
        "max_tokens": 400,
        "temperature": 0.6,
        "top_p": 0.9
    }
    
    while True:
        try:
            pregunta = input("👤 Tú: ").strip()
            
            if pregunta.lower() in ["salir", "exit", "quit"]:
                print("👋 ¡Hasta luego!")
                break
            
            if pregunta.lower() == "ajustes":
                print("\n⚙️  Ajustes actuales:")
                print(f"   max_tokens: {config['max_tokens']}")
                print(f"   temperature: {config['temperature']}")
                print(f"   top_p: {config['top_p']}")
                print()
                continue
            
            if not pregunta:
                continue
            
            # Generar respuesta
            print("🤖 TechMind: ", end="", flush=True)
            
            resultado = ask_techmind(
                pregunta,
                max_tokens=config["max_tokens"],
                temperature=config["temperature"],
                top_p=config["top_p"]
            )
            
            print(resultado["respuesta"])
            print(f"\n⏱️  {resultado['tiempo']}s | 📊 {resultado['tokens']} tokens\n")
        
        except KeyboardInterrupt:
            print("\n👋 ¡Hasta luego!")
            break
        
        except Exception as e:
            print(f"\n❌ Error: {e}\n")

# =========================================================
# EJEMPLOS DE USO
# =========================================================
def ejemplos():
    """Muestra ejemplos de uso"""
    
    print("\n" + "=" * 70)
    print("📝 EJEMPLOS DE USO")
    print("=" * 70)
    
    preguntas_ejemplo = [
        "¿Cómo configuro OSPF área 0 en un router Cisco?",
        "Dame comandos para diagnosticar packet loss",
        "¿Qué es BGP y cuándo debo usarlo?"
    ]
    
    for i, pregunta in enumerate(preguntas_ejemplo, 1):
        print(f"\n{i}. Pregunta: {pregunta}")
        print("-" * 70)
        
        resultado = ask_techmind(pregunta, max_tokens=300)
        
        print(f"Respuesta: {resultado['respuesta']}")
        print(f"⏱️  {resultado['tiempo']}s | 📊 {resultado['tokens']} tokens")
        print()

# =========================================================
# FUNCIÓN PARA API (FastAPI/Flask)
# =========================================================
def generar_respuesta_api(pregunta: str) -> dict:
    """
    Función optimizada para usar en API web
    
    Returns:
        dict con respuesta y metadata
    """
    
    try:
        resultado = ask_techmind(
            pregunta,
            max_tokens=400,
            temperature=0.6
        )
        
        return {
            "success": True,
            "respuesta": resultado["respuesta"],
            "tiempo_generacion": resultado["tiempo"],
            "tokens_generados": resultado["tokens"]
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

# =========================================================
# MAIN
# =========================================================
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        # Modo comando: python inference_techmind.py "tu pregunta"
        pregunta = " ".join(sys.argv[1:])
        resultado = ask_techmind(pregunta)
        print(resultado["respuesta"])
    
    elif "--ejemplos" in sys.argv or "-e" in sys.argv:
        # Modo ejemplos
        ejemplos()
    
    else:
        # Modo interactivo por defecto
        modo_interactivo()