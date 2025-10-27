#!/usr/bin/env python3
"""
Subir SOLO el modelo LoRA a HuggingFace
Inference API gratuita incluida
"""

from huggingface_hub import HfApi, create_repo, upload_folder
import os

# Tu username correcto
USERNAME = "Delta0723"
MODEL_NAME = "techmind-pro-v9"
REPO_ID = f"{USERNAME}/{MODEL_NAME}"

# Path del modelo
MODEL_PATH = "/workspace/TechMind/lora_MISTRAL_v9_ULTIMATE/final_model"

print("🚀 SUBIENDO TECHMIND v9 A HUGGING FACE")
print("="*60)
print(f"📦 Usuario: {USERNAME}")
print(f"📦 Modelo: {REPO_ID}")
print("="*60)

# Crear API
api = HfApi()

# Paso 1: Crear repositorio
print("\n1️⃣ Creando repositorio...")
try:
    create_repo(
        repo_id=REPO_ID,
        repo_type="model",
        exist_ok=True,
        private=False
    )
    print("✅ Repositorio creado/verificado")
except Exception as e:
    print(f"⚠️  Repo existe o error menor: {e}")

# Paso 2: Crear README
print("\n2️⃣ Creando README...")
readme_content = f"""---
license: mit
language:
- es
- en
tags:
- cisco
- networking
- packet-tracer
- lora
- mistral
base_model: mistralai/Mistral-7B-Instruct-v0.3
---

# TechMind Pro v9 ULTIMATE

🚀 Asistente IA especializado en Redes Cisco y Packet Tracer

## 📊 Métricas

- **Accuracy:** 93% verificada
- **Dataset:** 1,191 ejemplos únicos
- **Base Model:** Mistral-7B-Instruct-v0.3
- **Fine-tuning:** LoRA (r=64, alpha=128)

## 🎯 Características

- ✅ Configuraciones Cisco paso a paso
- ✅ Troubleshooting guiado
- ✅ Integración Packet Tracer
- ✅ Soporte OSPF, BGP, VLANs, ACLs, etc.
- ✅ Respuestas en español e inglés

## 💻 Uso

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel
import torch

# Cargar modelo base
base_model = "mistralai/Mistral-7B-Instruct-v0.3"
tokenizer = AutoTokenizer.from_pretrained(base_model)
model = AutoModelForCausalLM.from_pretrained(
    base_model,
    load_in_8bit=True,
    device_map="auto"
)

# Cargar LoRA
model = PeftModel.from_pretrained(model, "{REPO_ID}")

# Inferencia
prompt = "<s>[INST] ¿Cómo configuro IP 192.168.1.1 en GigabitEthernet0/0? [/INST]"
inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
outputs = model.generate(**inputs, max_new_tokens=500)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
```

## 🌐 Demo Online

- **Landing:** https://techmind-landing.vercel.app
- **GitHub:** https://github.com/Moreno360/techmind-landing

## 📚 Casos de Uso

1. **Estudiantes CCNA/CCNP:** Generación rápida de configuraciones
2. **Profesores:** Material de ejemplo para clases
3. **Profesionales:** Troubleshooting rápido
4. **Packet Tracer:** Guías paso a paso

## 🎓 Entrenamiento

- **Método:** LoRA (Low-Rank Adaptation)
- **Hardware:** RunPod RTX A6000
- **Duración:** ~6 horas
- **Framework:** HuggingFace Transformers + PEFT

## 📝 Licencia

MIT License - Uso libre

## 👤 Autor

Creado por [{USERNAME}](https://github.com/Moreno360)

## 🔗 Links

- [Demo Web](https://techmind-landing.vercel.app)
- [GitHub Repo](https://github.com/Moreno360/techmind-landing)
- [Documentación](https://github.com/Moreno360/techmind-landing#readme)
"""

readme_path = f"{MODEL_PATH}/README.md"
with open(readme_path, 'w', encoding='utf-8') as f:
    f.write(readme_content)
print("✅ README creado")

# Paso 3: Subir modelo
print("\n3️⃣ Subiendo modelo (esto tardará 5-10 min)...")
print("⏳ Subiendo archivos...")

try:
    api.upload_folder(
        folder_path=MODEL_PATH,
        repo_id=REPO_ID,
        repo_type="model",
    )
    print("\n✅ MODELO SUBIDO EXITOSAMENTE")
except Exception as e:
    print(f"\n❌ Error subiendo: {e}")
    print("\n💡 Intenta manualmente:")
    print(f"   cd {MODEL_PATH}")
    print(f"   git clone https://huggingface.co/{REPO_ID}")
    print(f"   cp -r * {MODEL_NAME}/")
    print(f"   cd {MODEL_NAME}")
    print(f"   git add .")
    print(f"   git commit -m 'Upload model'")
    print(f"   git push")
    exit(1)

print("\n" + "="*60)
print("🎉 DEPLOYMENT COMPLETADO")
print("="*60)
print(f"\n🔗 Modelo: https://huggingface.co/{REPO_ID}")
print(f"\n💡 Uso en tu landing:")
print(f"""
// Usando Inference API (GRATIS)
const response = await fetch(
    'https://api-inference.huggingface.co/models/{REPO_ID}',
    {{
        headers: {{ 
            Authorization: "Bearer tu_token_hf"
        }},
        method: "POST",
        body: JSON.stringify({{
            inputs: "¿Cómo configuro OSPF?",
            parameters: {{
                max_new_tokens: 500,
                temperature: 0.7
            }}
        }})
    }}
);
""")
print("\n" + "="*60)
