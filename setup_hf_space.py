#!/usr/bin/env python3
"""
DEPLOYMENT COMPLETO TECHMIND PRO
HuggingFace Spaces (GRATIS permanente)
"""

import os
import shutil
from pathlib import Path

print("🚀 DEPLOYMENT TECHMIND PRO - HUGGING FACE SPACES")
print("="*70)

# ============================================
# PASO 1: CREAR ESTRUCTURA SPACE
# ============================================

SPACE_DIR = "/workspace/TechMind/hf_space"
os.makedirs(SPACE_DIR, exist_ok=True)

print("\n📦 Creando estructura Hugging Face Space...")

# ============================================
# PASO 2: APP.PY (API FastAPI)
# ============================================

app_py = """
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import os

# Config
BASE_MODEL = "mistralai/Mistral-7B-Instruct-v0.3"
LORA_MODEL = "./model"  # Directorio local en Space

app = FastAPI(title="TechMind Pro API")

# CORS para tu landing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todos por ahora
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cargar modelo (se hace una vez al iniciar)
print("📦 Cargando TechMind v9...")
tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)
tokenizer.pad_token = tokenizer.eos_token

model = AutoModelForCausalLM.from_pretrained(
    BASE_MODEL,
    load_in_8bit=True,
    device_map="auto",
    torch_dtype=torch.float16,
    trust_remote_code=True
)
model = PeftModel.from_pretrained(model, LORA_MODEL)
model.eval()
print("✅ TechMind listo")

class Query(BaseModel):
    question: str
    max_tokens: int = 500

@app.get("/")
def root():
    return {
        "service": "TechMind Pro API",
        "version": "1.0.0",
        "model": "Mistral-7B v9 ULTIMATE",
        "calidad": "93%",
        "status": "operational",
        "docs": "/docs"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": True,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/ask")
async def ask(query: Query):
    try:
        # Generar respuesta
        prompt = f"<s>[INST] {query.question} [/INST]"
        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
        
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=query.max_tokens,
                temperature=0.7,
                top_p=0.9,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id
            )
        
        respuesta = tokenizer.decode(outputs[0], skip_special_tokens=True)
        if "[/INST]" in respuesta:
            respuesta = respuesta.split("[/INST]")[1].strip()
        
        return {
            "answer": respuesta,
            "model": "TechMind v9 ULTIMATE",
            "calidad": "93%",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {"error": str(e)}
"""

with open(f"{SPACE_DIR}/app.py", 'w') as f:
    f.write(app_py)

print("✅ app.py creado")

# ============================================
# PASO 3: REQUIREMENTS.TXT
# ============================================

requirements = """transformers==4.36.0
torch==2.1.0
accelerate==0.25.0
peft==0.7.1
bitsandbytes==0.41.3
fastapi==0.104.1
uvicorn==0.24.0
sentencepiece==0.1.99
"""

with open(f"{SPACE_DIR}/requirements.txt", 'w') as f:
    f.write(requirements)

print("✅ requirements.txt creado")

# ============================================
# PASO 4: README.MD
# ============================================

readme = """---
title: TechMind Pro
emoji: 🚀
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
license: mit
---

# TechMind Pro - API

Asistente IA especializado en Redes Cisco & Packet Tracer

## Características

- 🎯 93% precisión verificada
- 📚 Entrenado con 1,191 casos reales
- ⚡ Respuestas en segundos
- 🔧 Configuraciones Cisco completas
- 📦 Integración Packet Tracer

## Endpoints

- `GET /` - Información del servicio
- `GET /health` - Health check
- `POST /ask` - Hacer pregunta (JSON: {"question": "..."})

## Uso

```bash
curl -X POST https://SPACE_URL/ask \\
  -H "Content-Type: application/json" \\
  -d '{"question":"Configura IP 192.168.1.1"}'
```

## Modelo

- Base: Mistral-7B-Instruct-v0.3
- Fine-tuning: LoRA (r=64, alpha=128)
- Dataset: 1,191 ejemplos premium
- Accuracy: 93% en tests avanzados

## Creador

[Tu nombre] - [GitHub](https://github.com/Moreno360)
"""

with open(f"{SPACE_DIR}/README.md", 'w') as f:
    f.write(readme)

print("✅ README.md creado")

# ============================================
# PASO 5: DOCKERFILE
# ============================================

dockerfile = """FROM python:3.10-slim

WORKDIR /app

# Instalar dependencias sistema
RUN apt-get update && apt-get install -y \\
    git \\
    git-lfs \\
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Exponer puerto
EXPOSE 7860

# Comando
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
"""

with open(f"{SPACE_DIR}/Dockerfile", 'w') as f:
    f.write(dockerfile)

print("✅ Dockerfile creado")

# ============================================
# PASO 6: COPIAR MODELO
# ============================================

print("\n📦 Copiando modelo LoRA...")
model_src = "/workspace/TechMind/lora_MISTRAL_v9_ULTIMATE/final_model"
model_dst = f"{SPACE_DIR}/model"

if os.path.exists(model_src):
    shutil.copytree(model_src, model_dst, dirs_exist_ok=True)
    print("✅ Modelo copiado")
else:
    print("⚠️ Modelo no encontrado en:", model_src)

# ============================================
# PASO 7: INSTRUCCIONES
# ============================================

print("\n" + "="*70)
print("✅ SPACE CREADO EN:", SPACE_DIR)
print("="*70)
print("\n🚀 SIGUIENTE PASO - SUBIR A HUGGING FACE:")
print("\n1. Instalar HF CLI:")
print("   pip install huggingface_hub --break-system-packages")
print("\n2. Login:")
print("   huggingface-cli login")
print("   Token: https://huggingface.co/settings/tokens")
print("\n3. Crear Space:")
print("   cd", SPACE_DIR)
print("   git init")
print("   git lfs install")
print("   git lfs track '*.safetensors'")
print("   git add .")
print("   git commit -m 'Initial commit'")
print("\n4. Crear repo en HF:")
print("   - Ve a: https://huggingface.co/new-space")
print("   - Nombre: techmind-pro")
print("   - SDK: Docker")
print("   - Hardware: CPU (gratis) o T4 small (€0.60/h)")
print("\n5. Push:")
print("   git remote add origin https://huggingface.co/spaces/Moreno360/techmind-pro")
print("   git push -u origin main")
print("\n6. Esperar build (10-15 min)")
print("   URL: https://huggingface.co/spaces/Moreno360/techmind-pro")
print("\n💡 O usa este comando rápido:")
print(f"   huggingface-cli upload Moreno360/techmind-pro {SPACE_DIR} --repo-type=space")
print("\n" + "="*70)

# Crear script de deploy rápido
deploy_script = f"""#!/bin/bash
cd {SPACE_DIR}
huggingface-cli upload Moreno360/techmind-pro . --repo-type=space
echo "✅ Subido a Hugging Face"
echo "🔗 https://huggingface.co/spaces/Moreno360/techmind-pro"
"""

with open(f"{SPACE_DIR}/deploy.sh", 'w') as f:
    f.write(deploy_script)

os.chmod(f"{SPACE_DIR}/deploy.sh", 0o755)
print("✅ Script deploy.sh creado")
print(f"   Ejecutar: bash {SPACE_DIR}/deploy.sh")
