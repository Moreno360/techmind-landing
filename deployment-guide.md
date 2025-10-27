# 🚀 GUÍA DE DEPLOYMENT - TechMind Backend

## 📋 CUANDO TERMINE EL ENTRENAMIENTO (~8h)

Esta guía te llevará paso a paso para desplegar tu backend y tener TechMind funcionando completamente.

---

## ✅ REQUISITOS PREVIOS

```
✅ Modelo entrenado completamente (5000/5000 pasos)
✅ Archivo: lora_fase1/final_lora_fase1/ existe
✅ Cuenta GitHub (ya tienes)
✅ Cuenta Railway (crear si no tienes)
✅ Cuenta Stripe configurada (ya tienes)
```

---

## 🎯 PASO 1: VERIFICAR QUE EL MODELO TERMINÓ

```bash
# Conectar al pod
ssh root@194.68.245.204 -p 22009 -i ~/.ssh/id_ed25519

# Reconectar a tmux
tmux attach -t techmind

# Verificar que terminó (deberías ver 100%)
# Si terminó, verás: ✅ FASE 1 COMPLETADA

# Desconectar de tmux
Ctrl+B → D
```

---

## 🎯 PASO 2: VERIFICAR ARCHIVOS DEL MODELO

```bash
cd /workspace/TechMind

# Listar modelo final
ls -lh lora_fase1/final_lora_fase1/

# Deberías ver:
# - adapter_config.json
# - adapter_model.bin
# - tokenizer files
# etc.

# Verificar tamaño (debería ser ~15-30MB)
du -sh lora_fase1/final_lora_fase1/
```

---

## 🎯 PASO 3: PREPARAR ARCHIVOS PARA DEPLOYMENT

### 3.1 Crear estructura del proyecto

```bash
cd /workspace/TechMind

# Crear carpeta para deployment
mkdir -p deployment
cd deployment
```

### 3.2 Copiar archivos necesarios

```bash
# Copiar modelo entrenado
cp -r ../lora_fase1/final_lora_fase1 ./model

# Copiar backend API
cp ../api-stripe.py ./api.py

# Crear requirements.txt
cat > requirements.txt << 'EOF'
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
stripe==7.4.0
transformers==4.35.0
peft==0.7.0
torch==2.1.0
accelerate==0.24.0
bitsandbytes==0.41.0
datasets==2.15.0
EOF

# Crear Procfile para Railway
cat > Procfile << 'EOF'
web: uvicorn api:app --host 0.0.0.0 --port $PORT
EOF

# Crear runtime.txt
cat > runtime.txt << 'EOF'
python-3.11
EOF
```

---

## 🎯 PASO 4: COMPRIMIR Y DESCARGAR

```bash
# Comprimir todo
cd /workspace/TechMind
tar -czf techmind-deployment.tar.gz deployment/

# Ver tamaño
ls -lh techmind-deployment.tar.gz

# Debería ser ~50-100MB
```

### Descargar a tu PC:

**Desde tu PC (PowerShell):**

```powershell
scp -P 22009 -i ~/.ssh/id_ed25519 root@194.68.245.204:/workspace/TechMind/techmind-deployment.tar.gz ~/Desktop/
```

**O usar el Web Terminal de RunPod:**
- Files → Download → techmind-deployment.tar.gz

---

## 🎯 PASO 5: CREAR REPOSITORIO EN GITHUB

### 5.1 Crear nuevo repo

1. Ve a: https://github.com/new
2. Repository name: `techmind-api`
3. Description: `TechMind Pro - Backend API`
4. **Private** (importante - tiene tu modelo)
5. NO añadir README, .gitignore ni license
6. Click **"Create repository"**

### 5.2 Subir archivos

**Opción A: Por web (más fácil)**

1. Descomprime `techmind-deployment.tar.gz` en tu PC
2. Ve al repo: https://github.com/TU_USUARIO/techmind-api
3. Click **"uploading an existing file"**
4. Arrastra TODOS los archivos de la carpeta `deployment/`
5. Commit changes

**Opción B: Por terminal**

```bash
# En tu PC
cd ~/Desktop
tar -xzf techmind-deployment.tar.gz
cd deployment

# Inicializar git
git init
git add .
git commit -m "Initial commit - TechMind API"

# Conectar con GitHub
git remote add origin https://github.com/TU_USUARIO/techmind-api.git
git branch -M main
git push -u origin main
```

---

## 🎯 PASO 6: DESPLEGAR EN RAILWAY

### 6.1 Crear cuenta Railway

1. Ve a: https://railway.app
2. Sign up con GitHub
3. Autoriza Railway a acceder a tus repos

### 6.2 Crear nuevo proyecto

1. Click **"New Project"**
2. Click **"Deploy from GitHub repo"**
3. Selecciona **"techmind-api"**
4. Railway empezará a desplegar automáticamente

### 6.3 Configurar variables de entorno

1. En Railway, click en tu proyecto
2. Click **"Variables"**
3. Añadir estas variables:

```
STRIPE_SECRET_KEY=sk_test_51SLnKs2XMMrXQGCrML76IGZba2GKqnzok8GSHYUNO7qxpCdcvfw78eyXHE0oOtjQKOKJZQLvOeWwwRCVgJDemzla00t5d7BzT4

STRIPE_WEBHOOK_SECRET=(lo configuraremos después)

MODEL_PATH=/app/model

PORT=8000
```

4. Click **"Add"** después de cada variable

### 6.4 Esperar deployment

- Railway tardará ~5-10 minutos en desplegar
- Verás logs en tiempo real
- Cuando termine, verás: **"Deployment successful"**

### 6.5 Obtener URL de tu API

1. Click en **"Settings"**
2. En **"Domains"**, click **"Generate Domain"**
3. Railway te dará una URL como: `techmind-api-production.up.railway.app`
4. **GUARDA ESTA URL** - la necesitarás

---

## 🎯 PASO 7: CONFIGURAR WEBHOOK DE STRIPE

### 7.1 Crear endpoint en Stripe

1. Ve a Stripe Dashboard: https://dashboard.stripe.com
2. **Developers** → **Webhooks**
3. Click **"Add endpoint"**

4. Configura:
```
Endpoint URL: https://TU-API.up.railway.app/api/webhook/stripe

Events to send:
✅ checkout.session.completed
✅ customer.subscription.updated
✅ customer.subscription.deleted
✅ invoice.payment_failed
```

5. Click **"Add endpoint"**

### 7.2 Obtener Webhook Secret

1. Click en el webhook que acabas de crear
2. En **"Signing secret"**, click **"Reveal"**
3. Copia el secret (empieza con `whsec_...`)

### 7.3 Añadir a Railway

1. Vuelve a Railway
2. **Variables** → **Add Variable**
3. Nombre: `STRIPE_WEBHOOK_SECRET`
4. Valor: `whsec_...` (el que copiaste)
5. Click **"Add"**

Railway redesplegará automáticamente.

---

## 🎯 PASO 8: ACTUALIZAR LANDING CON LA URL REAL

### 8.1 Actualizar index.html

En tu archivo `index.html`, busca la línea:

```javascript
const API_URL = 'https://techmind-api.railway.app/api';
```

Cámbiala por tu URL real:

```javascript
const API_URL = 'https://TU-API.up.railway.app/api';
```

### 8.2 Subir cambios a GitHub

1. Ve a: https://github.com/Moreno360/techmind-landing
2. Edita `index.html`
3. Actualiza la URL
4. Commit changes

Vercel desplegará automáticamente en 30 segundos.

---

## 🎯 PASO 9: PROBAR TODO EL FLUJO

### 9.1 Probar API directamente

```bash
# Health check
curl https://TU-API.up.railway.app/health

# Deberías ver:
# {"status":"healthy","model":"loaded",...}
```

### 9.2 Probar desde tu landing

1. Ve a: https://techmind-landing.vercel.app
2. Haz una pregunta en el demo: "¿Cómo configuro OSPF?"
3. Deberías ver una respuesta generada por TU modelo ✅

### 9.3 Probar el flujo de pago

1. Click **"Comprar Pro"**
2. Completa el pago con tarjeta de prueba: `4242 4242 4242 4242`
3. Deberías:
   - Ver página de éxito
   - Recibir webhook en tu API
   - (Usuario debería recibir email con API key)

---

## 🎯 PASO 10: ACTIVAR MODO LIVE (COBRAR DE VERDAD)

### 10.1 Verificar cuenta Stripe

1. Stripe Dashboard → **Settings** → **Business settings**
2. Completa toda la información:
   - Nombre legal de la empresa
   - Dirección
   - NIF/CIF
   - Cuenta bancaria para recibir pagos

3. Stripe revisará tu cuenta (~1-2 días)

### 10.2 Cambiar a Live Mode

**Una vez aprobado:**

1. En Stripe, desactiva **"Test mode"** (arriba derecha)

2. **Products** → Crea de nuevo los productos en Live Mode:
   - TechMind Pro (€9.99/mes)
   - TechMind Enterprise (€99/mes)

3. **Developers** → **API Keys** → Copiar nuevas keys:
   - Publishable key: `pk_live_...`
   - Secret key: `sk_live_...`

4. **Actualizar Railway:**
   - Variables → `STRIPE_SECRET_KEY` → Cambiar a `sk_live_...`

5. **Actualizar landing:**
   - `index.html` → Cambiar `STRIPE_PUBLISHABLE_KEY` a `pk_live_...`
   - Cambiar Price IDs a los nuevos de Live Mode

6. **Webhook de Live Mode:**
   - Stripe → Webhooks → Add endpoint (para Live Mode)
   - URL: tu API real
   - Actualizar `STRIPE_WEBHOOK_SECRET` en Railway

### 10.3 ¡YA PUEDES COBRAR!

```
✅ Stripe en Live Mode
✅ API desplegada y funcionando
✅ Landing actualizado con keys reales
✅ Webhook configurado
✅ ¡Empieza a vender! 💰
```

---

## 📊 MONITOREO Y LOGS

### Ver logs en Railway:

```
Railway Dashboard → Tu proyecto → Logs
```

Verás en tiempo real:
- Requests a tu API
- Errores (si los hay)
- Webhooks de Stripe
- Inferencias del modelo

### Ver pagos en Stripe:

```
Stripe Dashboard → Payments
```

Verás:
- Pagos exitosos
- Suscripciones activas
- Ingresos totales

---

## 🔧 TROUBLESHOOTING

### Problema: "Model not loaded"

```bash
# Verificar que el modelo está en Railway
Railway → Files → /app/model

# Si no está, subir de nuevo a GitHub
```

### Problema: "Webhook signature invalid"

```bash
# Verificar que STRIPE_WEBHOOK_SECRET está correcto
Railway → Variables → STRIPE_WEBHOOK_SECRET

# Debe empezar con whsec_
```

### Problema: API lenta

```bash
# Railway free tier tiene cold starts
# Considera upgrade a Railway Pro ($5/mes)
# O usar RunPod Serverless para inferencia
```

### Problema: "Out of memory"

```bash
# El modelo GPT-J es grande
# Railway necesita al menos 8GB RAM
# Upgrade a plan superior o usar GPU externa
```

---

## 💰 COSTOS MENSUALES ESTIMADOS

```
Railway:
- Free tier: $0/mes (con crédito inicial de $5)
- Pro plan: $5/mes (si necesitas más recursos)

Stripe:
- Sin cuota mensual
- 1.5% + €0.25 por transacción exitosa
- Ejemplo: De €9.99 → recibes €9.59

RunPod (si mantienes el pod para inferencia):
- Pod GPU: ~€0.38/hora
- Si lo usas 24/7: ~€273/mes
- Recomendación: Usar solo para inferencia bajo demanda

Total estimado (sin GPU 24/7):
€5-10/mes (Railway + Stripe fees)
```

---

## 🎯 CHECKLIST FINAL

```
Antes de lanzar oficialmente:

□ Modelo entrenado y funcionando
□ API desplegada en Railway
□ Webhook de Stripe configurado
□ Landing actualizado con URL real
□ Probado flujo completo (demo + pago)
□ Stripe en Live Mode
□ Cuenta bancaria conectada
□ Emails de bienvenida configurados
□ Términos y Privacidad en la web
□ Soporte al cliente configurado
□ ¡Lanzar! 🚀
```

---

## 📞 SIGUIENTES PASOS DESPUÉS DEL LANZAMIENTO

1. **Marketing:** Compartir en LinkedIn, Twitter, foros de redes
2. **SEO:** Optimizar landing para "asistente IA cisco", etc
3. **Contenido:** Blog posts, tutoriales, casos de uso
4. **Comunidad:** Discord/Telegram para usuarios
5. **Partnerships:** Academias IT, bootcamps, certificaciones
6. **Feedback:** Mejorar basado en usuarios reales

---

## 🎉 ¡FELICIDADES!

Si llegaste hasta aquí, tienes un **producto SaaS completo y funcional**:

✅ Frontend profesional
✅ Backend escalable
✅ Modelo IA especializado
✅ Sistema de pagos
✅ Webhooks automatizados

**Ya puedes empezar a generar ingresos recurrentes.**

Primer objetivo: **10 clientes pagando = €100/mes**

¡Vamos! 💪🚀💰
