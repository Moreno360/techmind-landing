"""
TechMind PRO - Backend API
FastAPI + Rate Limiting + Stripe
"""

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import sqlite3
from datetime import datetime, timedelta
from typing import Optional
import os
import hashlib
import secrets

# Importar función de inferencia
from inference_techmind import generar_respuesta_api

# =========================================================
# CONFIGURACIÓN
# =========================================================
app = FastAPI(
    title="TechMind API",
    description="API para TechMind PRO",
    version="1.0.0"
)

# CORS (permite requests desde tu frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://techmind-landing.vercel.app",
        "http://localhost:3000",
        "http://localhost:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Límites
FREE_DAILY_LIMIT = 10
PRO_DAILY_LIMIT = 999999

# =========================================================
# MODELOS PYDANTIC
# =========================================================
class QueryRequest(BaseModel):
    pregunta: str
    api_key: Optional[str] = None

class QueryResponse(BaseModel):
    success: bool
    respuesta: Optional[str] = None
    tiempo_generacion: Optional[float] = None
    requests_restantes: Optional[int] = None
    error: Optional[str] = None

class SignupRequest(BaseModel):
    email: EmailStr

class APIKeyResponse(BaseModel):
    api_key: str
    plan: str
    expires_at: str

# =========================================================
# BASE DE DATOS
# =========================================================
def init_db():
    """Inicializa base de datos SQLite"""
    conn = sqlite3.connect('techmind.db')
    c = conn.cursor()
    
    # Tabla de API keys
    c.execute('''
        CREATE TABLE IF NOT EXISTS api_keys (
            api_key TEXT PRIMARY KEY,
            email TEXT NOT NULL,
            plan TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP,
            is_active BOOLEAN DEFAULT 1,
            stripe_customer_id TEXT,
            stripe_subscription_id TEXT
        )
    ''')
    
    # Tabla de requests diarios
    c.execute('''
        CREATE TABLE IF NOT EXISTS daily_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            date TEXT NOT NULL,
            count INTEGER DEFAULT 0,
            UNIQUE(user_id, date)
        )
    ''')
    
    conn.commit()
    conn.close()

init_db()

def get_db():
    """Obtiene conexión a DB"""
    conn = sqlite3.connect('techmind.db')
    conn.row_factory = sqlite3.Row
    return conn

# =========================================================
# RATE LIMITING
# =========================================================
def check_rate_limit(api_key: Optional[str] = None) -> tuple[bool, int, str]:
    """
    Verifica límite de requests
    
    Returns:
        (puede_continuar, requests_restantes, user_id)
    """
    
    conn = get_db()
    c = conn.cursor()
    
    # Identificar usuario
    if api_key:
        # Usuario Pro
        c.execute("SELECT plan FROM api_keys WHERE api_key = ? AND is_active = 1", (api_key,))
        result = c.fetchone()
        
        if not result:
            conn.close()
            return False, 0, "invalid"
        
        user_id = api_key
        limit = PRO_DAILY_LIMIT
    else:
        # Usuario Free (identificar por IP o session)
        # En producción usarías request.client.host
        user_id = "free_user"
        limit = FREE_DAILY_LIMIT
    
    # Contar requests hoy
    today = datetime.now().strftime("%Y-%m-%d")
    
    c.execute("""
        SELECT count FROM daily_requests 
        WHERE user_id = ? AND date = ?
    """, (user_id, today))
    
    result = c.fetchone()
    count = result["count"] if result else 0
    
    if count >= limit:
        conn.close()
        return False, 0, user_id
    
    # Incrementar contador
    c.execute("""
        INSERT INTO daily_requests (user_id, date, count) 
        VALUES (?, ?, 1)
        ON CONFLICT(user_id, date) 
        DO UPDATE SET count = count + 1
    """, (user_id, today))
    
    conn.commit()
    conn.close()
    
    requests_restantes = limit - count - 1
    
    return True, requests_restantes, user_id

# =========================================================
# ENDPOINTS
# =========================================================

@app.get("/")
async def root():
    """Health check"""
    return {
        "status": "ok",
        "service": "TechMind API",
        "version": "1.0.0"
    }

@app.post("/api/query", response_model=QueryResponse)
async def query_techmind(request: QueryRequest):
    """
    Endpoint principal para hacer preguntas a TechMind
    """
    
    # Validar pregunta
    if not request.pregunta or len(request.pregunta.strip()) < 3:
        raise HTTPException(400, "Pregunta demasiado corta")
    
    if len(request.pregunta) > 500:
        raise HTTPException(400, "Pregunta demasiado larga (máx 500 caracteres)")
    
    # Verificar rate limit
    puede_continuar, requests_restantes, user_id = check_rate_limit(request.api_key)
    
    if not puede_continuar:
        if user_id == "invalid":
            raise HTTPException(401, "API key inválida")
        else:
            raise HTTPException(
                429,
                f"Límite diario alcanzado. Upgrade a Pro para consultas ilimitadas."
            )
    
    # Generar respuesta
    try:
        resultado = generar_respuesta_api(request.pregunta)
        
        if not resultado["success"]:
            raise HTTPException(500, resultado.get("error", "Error generando respuesta"))
        
        return QueryResponse(
            success=True,
            respuesta=resultado["respuesta"],
            tiempo_generacion=resultado["tiempo_generacion"],
            requests_restantes=requests_restantes
        )
    
    except Exception as e:
        raise HTTPException(500, f"Error: {str(e)}")

@app.post("/api/signup", response_model=APIKeyResponse)
async def signup_free(request: SignupRequest):
    """
    Registro gratuito (genera API key)
    """
    
    conn = get_db()
    c = conn.cursor()
    
    # Verificar si email ya existe
    c.execute("SELECT api_key FROM api_keys WHERE email = ?", (request.email,))
    existing = c.fetchone()
    
    if existing:
        conn.close()
        raise HTTPException(400, "Email ya registrado")
    
    # Generar API key
    api_key = f"tm_free_{secrets.token_urlsafe(32)}"
    
    # Guardar en DB
    c.execute("""
        INSERT INTO api_keys (api_key, email, plan, is_active)
        VALUES (?, ?, 'free', 1)
    """, (api_key, request.email))
    
    conn.commit()
    conn.close()
    
    return APIKeyResponse(
        api_key=api_key,
        plan="free",
        expires_at="never"
    )

@app.get("/api/stats")
async def get_stats(api_key: str = Header(...)):
    """
    Obtiene estadísticas de uso
    """
    
    conn = get_db()
    c = conn.cursor()
    
    # Verificar API key
    c.execute("""
        SELECT email, plan, created_at 
        FROM api_keys 
        WHERE api_key = ? AND is_active = 1
    """, (api_key,))
    
    user = c.fetchone()
    
    if not user:
        conn.close()
        raise HTTPException(401, "API key inválida")
    
    # Obtener requests hoy
    today = datetime.now().strftime("%Y-%m-%d")
    
    c.execute("""
        SELECT count FROM daily_requests 
        WHERE user_id = ? AND date = ?
    """, (api_key, today))
    
    result = c.fetchone()
    requests_hoy = result["count"] if result else 0
    
    # Obtener total histórico
    c.execute("""
        SELECT SUM(count) as total FROM daily_requests 
        WHERE user_id = ?
    """, (api_key,))
    
    result = c.fetchone()
    requests_total = result["total"] if result and result["total"] else 0
    
    conn.close()
    
    limit = PRO_DAILY_LIMIT if user["plan"] == "pro" else FREE_DAILY_LIMIT
    
    return {
        "email": user["email"],
        "plan": user["plan"],
        "requests_hoy": requests_hoy,
        "requests_total": requests_total,
        "limite_diario": limit,
        "requests_restantes": limit - requests_hoy
    }

# =========================================================
# WEBHOOK STRIPE (para después)
# =========================================================
@app.post("/webhook/stripe")
async def stripe_webhook():
    """
    Webhook para procesar pagos de Stripe
    TODO: Implementar cuando configures Stripe
    """
    return {"status": "pending_implementation"}

# =========================================================
# ADMIN (opcional - para ti)
# =========================================================
@app.get("/admin/users")
async def list_users(admin_key: str = Header(...)):
    """
    Lista todos los usuarios (solo admin)
    """
    
    # Contraseña admin simple (cambiar en producción)
    if admin_key != "admin_techmind_2025":
        raise HTTPException(403, "No autorizado")
    
    conn = get_db()
    c = conn.cursor()
    
    c.execute("""
        SELECT email, plan, created_at, is_active 
        FROM api_keys 
        ORDER BY created_at DESC 
        LIMIT 100
    """)
    
    users = [dict(row) for row in c.fetchall()]
    conn.close()
    
    return {"users": users, "total": len(users)}

# =========================================================
# STARTUP
# =========================================================
@app.on_event("startup")
async def startup_event():
    """Ejecutar al iniciar el servidor"""
    print("🚀 TechMind API iniciada")
    print("📊 Base de datos: techmind.db")
    print("🔒 CORS habilitado para: techmind-landing.vercel.app")
    print()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)