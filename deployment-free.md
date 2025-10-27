# 🚀 DEPLOYMENT SIMPLIFICADO - 100% GRATIS

## 💰 COSTO TOTAL: €0/mes

Esta guía usa SOLO servicios gratuitos (excepto Stripe fees por transacción).

---

## ✅ STACK 100% GRATIS:

```
Frontend: Vercel (gratis forever)
Backend: Railway ($5 gratis/mes - suficiente)
Database: SQLite (incluida, gratis)
Pagos: Stripe (sin cuota fija)
Emails: Ninguno (mostrar API key en pantalla)
Modelo: RunPod apagado (prendes solo cuando necesites)
```

---

## 🎯 PASO 1: PREPARAR BACKEND (cuando termine modelo)

### 1.1 Conectar al pod y verificar

```bash
ssh root@194.68.245.204 -p 22009 -i ~/.ssh/id_ed25519
cd /workspace/TechMind

# Verificar modelo terminado
ls -lh lora_fase1/final_lora_fase1/
```

### 1.2 Crear archivos para deployment

```bash
# Crear carpeta
mkdir -p backend-deploy
cd backend-deploy

# Copiar backend actualizado (SIN emails)
cat > api.py << 'ENDOFFILE'
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import secrets
import stripe
import os
from datetime import datetime

# Configuración
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
DATABASE = "techmind.db"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos
class QueryRequest(BaseModel):
    pregunta: str
    api_key: str = None

class CheckoutRequest(BaseModel):
    price_id: str
    success_url: str
    cancel_url: str
    email: str = None

# Base de datos
def init_db():
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        email TEXT UNIQUE,
        api_key TEXT UNIQUE,
        plan TEXT DEFAULT 'free',
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        subscription_status TEXT DEFAULT 'inactive',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS requests (
        id INTEGER PRIMARY KEY,
        user_id INTEGER,
        pregunta TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    conn.commit()
    conn.close()

def generate_api_key():
    return f"tm_{secrets.token_urlsafe(32)}"

# Endpoints
@app.on_event("startup")
async def startup():
    init_db()

@app.get("/")
async def root():
    return {"service": "TechMind API", "status": "online"}

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/query")
async def query(request: QueryRequest):
    # Respuesta de ejemplo (después integrarás el modelo)
    return {
        "success": True,
        "respuesta": "Esta es una respuesta de ejemplo. El modelo se integrará después del deployment.",
        "tokens_usados": 50,
        "tiempo_generacion": 1.5,
        "requests_restantes": 9
    }

@app.post("/api/create-checkout-session")
async def create_checkout(request: CheckoutRequest):
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{'price': request.price_id, 'quantity': 1}],
            mode='subscription',
            success_url=request.success_url + "?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=request.cancel_url,
            customer_email=request.email,
        )
        return {"success": True, "sessionId": session.id, "url": session.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/webhook/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
    
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
    except:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        email = session.get('customer_email')
        
        # Crear usuario y generar API key
        conn = sqlite3.connect(DATABASE)
        api_key = generate_api_key()
        
        try:
            conn.execute(
                'INSERT INTO users (email, api_key, plan, subscription_status) VALUES (?, ?, ?, ?)',
                (email, api_key, 'pro', 'active')
            )
            conn.commit()
        except:
            pass  # Email ya existe
        
        conn.close()
    
    return {"success": True}

@app.get("/api/get-api-key/{session_id}")
async def get_api_key(session_id: str):
    """Endpoint para obtener API key después del pago"""
    try:
        session = stripe.checkout.Session.retrieve(session_id)
        email = session.get('customer_email')
        
        conn = sqlite3.connect(DATABASE)
        conn.row_factory = sqlite3.Row
        user = conn.execute('SELECT api_key FROM users WHERE email = ?', (email,)).fetchone()
        conn.close()
        
        if user:
            return {
                "success": True,
                "api_key": user['api_key'],
                "email": email,
                "plan": "pro"
            }
        else:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
ENDOFFILE

# Crear requirements.txt
cat > requirements.txt << 'EOF'
fastapi==0.104.1
uvicorn[standard]==0.24.0
stripe==7.4.0
python-multipart==0.0.6
EOF

# Crear Procfile
cat > Procfile << 'EOF'
web: uvicorn api:app --host 0.0.0.0 --port $PORT
EOF

# Crear .gitignore
cat > .gitignore << 'EOF'
__pycache__/
*.pyc
.env
techmind.db
*.log
EOF
```

### 1.3 Comprimir y descargar

```bash
cd /workspace/TechMind
tar -czf backend.tar.gz backend-deploy/

# Descargar a tu PC:
# Opción 1: RunPod Web Terminal → Files → Download
# Opción 2: SCP desde tu PC
```

---

## 🎯 PASO 2: SUBIR A GITHUB

### 2.1 Crear repo (privado)

1. https://github.com/new
2. Name: `techmind-backend`
3. **Private** ✅
4. Create repository

### 2.2 Subir archivos

**Por web:**
1. Descomprime `backend.tar.gz` en tu PC
2. Ve a tu repo en GitHub
3. Upload files → Arrastra todo
4. Commit

**Por terminal:**
```bash
cd ~/Desktop
tar -xzf backend.tar.gz
cd backend-deploy

git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/techmind-backend.git
git branch -M main
git push -u origin main
```

---

## 🎯 PASO 3: DESPLEGAR EN RAILWAY (GRATIS)

### 3.1 Crear cuenta

1. https://railway.app
2. Sign up con GitHub
3. Gratis: $5 crédito/mes ✅

### 3.2 Desplegar

1. New Project
2. Deploy from GitHub repo
3. Selecciona `techmind-backend`
4. Railway despliega automáticamente

### 3.3 Configurar variables

En Railway → Variables:

```
STRIPE_SECRET_KEY=sk_test_51SLnKs2XMMrXQGCrML76IGZba2GKqnzok8GSHYUNO7qxpCdcvfw78eyXHE0oOtjQKOKJZQLvOeWwwRCVgJDemzla00t5d7BzT4

STRIPE_WEBHOOK_SECRET=(lo configuraremos en el siguiente paso)

PORT=8000
```

### 3.4 Obtener URL

Settings → Generate Domain

Ejemplo: `techmind-backend.up.railway.app`

**GUARDA ESTA URL**

---

## 🎯 PASO 4: CONFIGURAR WEBHOOK STRIPE

### 4.1 Crear endpoint

Stripe Dashboard → Developers → Webhooks → Add endpoint

```
URL: https://TU-BACKEND.up.railway.app/api/webhook/stripe

Events:
✅ checkout.session.completed
✅ customer.subscription.updated
✅ customer.subscription.deleted
```

### 4.2 Copiar Webhook Secret

Click en el webhook → Reveal signing secret

Copia el `whsec_...`

### 4.3 Añadir a Railway

Railway → Variables → Add:

```
STRIPE_WEBHOOK_SECRET=whsec_...
```

Railway redesplegará automáticamente.

---

## 🎯 PASO 5: ACTUALIZAR LANDING

En `index.html`, busca:

```javascript
const API_URL = 'https://techmind-api.railway.app/api';
```

Cámbialo por tu URL real:

```javascript
const API_URL = 'https://TU-BACKEND.up.railway.app/api';
```

Además, añade esto después del pago exitoso (busca la función `crearCheckoutStripe`):

```javascript
// Después de que Stripe redirija (en success_url)
const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get('session_id');

if (sessionId) {
    // Obtener API key
    fetch(`${API_URL}/get-api-key/${sessionId}`)
        .then(r => r.json())
        .then(data => {
            // Mostrar API key en pantalla
            alert(`¡Pago exitoso! Tu API Key: ${data.api_key}\n\nGuárdala en un lugar seguro.`);
        });
}
```

Sube cambios a GitHub (Vercel despliega automáticamente).

---

## 🎯 PASO 6: PROBAR TODO

### 6.1 Health check

```bash
curl https://TU-BACKEND.up.railway.app/health
```

Deberías ver: `{"status":"healthy",...}`

### 6.2 Probar demo

1. https://techmind-landing.vercel.app
2. Pregunta: "¿Cómo configuro OSPF?"
3. Debería responder ✅

### 6.3 Probar pago

1. Click "Comprar Pro"
2. Pagar con: `4242 4242 4242 4242`
3. Después del pago, verás un **alert con tu API key** ✅

---

## 🎯 PASO 7: ACTIVAR MODO LIVE (cuando estés listo)

### 7.1 Verificar cuenta Stripe

Stripe → Settings → Complete información empresarial

### 7.2 Cambiar a Live Mode

1. Desactiva Test Mode
2. Crea productos en Live Mode
3. Obtén nuevas keys (`pk_live_...`, `sk_live_...`)
4. Actualiza Railway variables
5. Actualiza landing
6. Crea webhook de Live Mode
7. ¡Listo para cobrar! 💰

---

## 💰 COSTOS REALES:

```
Railway: €0/mes (tienes $5 gratis, usas $3)
Vercel: €0/mes (gratis forever)
Stripe: Solo % por transacción (1.5% + €0.25)
RunPod: €0/mes (apagado, prendes cuando necesites)

TOTAL FIJO: €0/mes ✅

Cuando cobres €100/mes:
- Stripe fees: ~€3
- Railway: €0 (aún gratis)
- Profit: €97 ✅
```

---

## 🎉 ¡LISTO!

```
✅ Backend desplegado (gratis)
✅ Webhook configurado
✅ Landing conectado
✅ Sistema de pagos funcionando
✅ API keys automáticas
✅ Todo sin emails (simplificado)
✅ €0/mes de costos fijos
```

**Cuando el modelo termine, sigues esta guía y en 30 minutos estás online.**

---

## 💡 MÁS ADELANTE (cuando tengas ingresos):

### Añadir emails (Resend gratis):

```python
# En api.py, después del pago:
import resend
resend.api_key = os.getenv("RESEND_API_KEY")

resend.Emails.send({
    "from": "TechMind <noreply@techmind.ai>",
    "to": email,
    "subject": "Tu API Key de TechMind Pro",
    "html": f"<h1>Bienvenido</h1><p>Tu API Key: {api_key}</p>"
})
```

Resend: 3,000 emails/mes gratis ✅

---

## 🚀 SIGUIENTE NIVEL (cuando tengas 50+ clientes):

- Railway Pro: $5/mes (más recursos)
- RunPod Serverless: Pay per use (más rápido)
- Dominio propio: €10/año
- CDN: Cloudflare (gratis)

**Pero por ahora, TODO GRATIS.** 💪
