# 📧 EMAIL TEMPLATES - TechMind Pro

## 1. EMAIL DE BIENVENIDA (Plan Free)

**Asunto:** ¡Bienvenido a TechMind! 🧠 Tu asistente experto en redes

---

Hola {{nombre}},

¡Bienvenido a **TechMind**! 🎉

Tu cuenta gratuita está lista. Ahora tienes acceso a:

✅ **10 consultas diarias** sobre redes y ciberseguridad  
✅ **Respuestas de experto** generadas por IA especializada  
✅ **Base de conocimiento** de 21,000+ ejemplos técnicos  

### 🚀 Empieza ahora:

Visita: https://techmind-landing.vercel.app

Haz tu primera pregunta, por ejemplo:
- "¿Cómo configuro OSPF en área 0?"
- "Dame comandos para troubleshooting de BGP"
- "¿Qué es mejor, VLAN tagging o port-based?"

### 💡 ¿Necesitas más?

Con **TechMind Pro** (€9.99/mes) obtienes:
- ✅ Consultas **ilimitadas**
- ✅ Respuestas más largas (600 tokens)
- ✅ Sin publicidad
- ✅ Historial completo
- ✅ Soporte prioritario

[Actualizar a Pro →](https://techmind-landing.vercel.app/#pricing)

---

¿Preguntas? Responde este email o visita nuestra [documentación](https://techmind-landing.vercel.app).

Saludos,  
**El equipo de TechMind**  
🌐 techmind-landing.vercel.app

---

## 2. EMAIL DE CONFIRMACIÓN DE PAGO (Plan Pro)

**Asunto:** ✅ Pago confirmado - Bienvenido a TechMind Pro

---

Hola {{nombre}},

¡Gracias por unirte a **TechMind Pro**! 🎉

Tu pago de **€9.99** ha sido procesado exitosamente.

### 🎯 Tu cuenta Pro está activa:

**Email:** {{email}}  
**Plan:** TechMind Pro  
**Precio:** €9.99/mes  
**Próxima renovación:** {{fecha_renovacion}}  

### ✨ Beneficios Pro activados:

✅ **Consultas ilimitadas** (sin límite diario)  
✅ **Respuestas extendidas** hasta 600 tokens  
✅ **Sin publicidad**  
✅ **Historial ilimitado** de consultas  
✅ **Exportar configuraciones** en cualquier formato  
✅ **Soporte prioritario** por email  

### 🔑 Tu API Key (para desarrolladores):

```
{{api_key}}
```

**Importante:** Guarda esta key en un lugar seguro. No la compartas con nadie.

### 📚 Documentación API:

Si quieres integrar TechMind en tus propias herramientas:  
https://docs.techmind.ai (próximamente)

### 🚀 Empieza ahora:

Visita: https://techmind-landing.vercel.app  
Inicia sesión con tu email: {{email}}

---

### 💳 Gestionar suscripción:

Puedes cancelar o cambiar tu plan en cualquier momento:  
[Gestionar suscripción →](https://billing.stripe.com/p/login/test_xxxxx)

---

¿Preguntas? Responde este email y te ayudaremos.

Saludos,  
**El equipo de TechMind**  
🌐 techmind-landing.vercel.app

---

## 3. EMAIL DE API KEY (Solo API Key)

**Asunto:** 🔑 Tu API Key de TechMind Pro

---

Hola {{nombre}},

Aquí está tu **API Key** de TechMind Pro:

```
{{api_key}}
```

### 📖 Cómo usar tu API Key:

**Ejemplo básico (cURL):**

```bash
curl -X POST https://api.techmind.ai/query \
  -H "Content-Type: application/json" \
  -H "X-API-Key: {{api_key}}" \
  -d '{"question": "¿Cómo configuro OSPF?"}'
```

**Ejemplo Python:**

```python
import requests

headers = {
    "X-API-Key": "{{api_key}}",
    "Content-Type": "application/json"
}

data = {
    "question": "¿Cómo configuro OSPF?"
}

response = requests.post(
    "https://api.techmind.ai/query",
    headers=headers,
    json=data
)

print(response.json()["answer"])
```

### 📚 Documentación completa:

https://docs.techmind.ai

### ⚠️ Seguridad:

- ❌ NO compartas tu API Key públicamente
- ❌ NO la subas a GitHub
- ✅ Guárdala en variables de entorno
- ✅ Regenera si crees que fue comprometida

---

¿Problemas? Responde este email.

Saludos,  
**El equipo de TechMind**

---

## 4. EMAIL DE RENOVACIÓN (Recordatorio)

**Asunto:** 🔔 Tu suscripción a TechMind Pro se renueva pronto

---

Hola {{nombre}},

Tu suscripción a **TechMind Pro** se renovará automáticamente en **3 días**.

### 📋 Detalles:

**Plan:** TechMind Pro  
**Precio:** €9.99/mes  
**Fecha de renovación:** {{fecha_renovacion}}  
**Método de pago:** •••• {{ultimos_4_digitos}}

### ✨ Este mes usaste:

📊 **{{consultas_totales}} consultas**  
⏱️ **{{tiempo_total}} minutos** de uso  
🎯 **{{temas_mas_consultados}}** (temas más consultados)

### 💳 Gestionar suscripción:

Si deseas cancelar o cambiar tu método de pago:  
[Gestionar suscripción →](https://billing.stripe.com/p/login/test_xxxxx)

**Nota:** Si cancelas, tendrás acceso Pro hasta el {{fecha_renovacion}}.

---

¿Preguntas? Responde este email.

Saludos,  
**El equipo de TechMind**

---

## 5. EMAIL DE CANCELACIÓN

**Asunto:** 😔 Lamentamos verte partir - TechMind

---

Hola {{nombre}},

Tu suscripción a **TechMind Pro** ha sido cancelada.

### 📋 Detalles:

**Fecha de cancelación:** {{fecha_cancelacion}}  
**Acceso Pro hasta:** {{fecha_fin_acceso}}  

Tendrás acceso completo a todas las funciones Pro hasta el **{{fecha_fin_acceso}}**.

Después de esa fecha, tu cuenta pasará automáticamente al plan **Free**:

📊 **10 consultas diarias**  
✅ **Todas las funciones básicas**  

### 😊 ¿Nos cuentas por qué te vas?

Tu feedback nos ayuda a mejorar. Responde este email y cuéntanos qué podemos hacer mejor.

### 🔄 ¿Cambiaste de opinión?

Puedes reactivar tu suscripción en cualquier momento:  
[Reactivar TechMind Pro →](https://techmind-landing.vercel.app/#pricing)

---

Gracias por haber sido parte de TechMind Pro.  
Esperamos verte de nuevo pronto.

Saludos,  
**El equipo de TechMind**  
🌐 techmind-landing.vercel.app

---

## 6. EMAIL DE ERROR DE PAGO

**Asunto:** ⚠️ Problema con tu pago - TechMind Pro

---

Hola {{nombre}},

No pudimos procesar el pago de tu suscripción a **TechMind Pro**.

### 💳 Motivo:

{{razon_error}}

### 🔧 Solución:

Por favor actualiza tu método de pago:  
[Actualizar método de pago →](https://billing.stripe.com/p/login/test_xxxxx)

### ⏰ ¿Qué pasa ahora?

- Tienes **3 días** para actualizar tu método de pago
- Después de 3 días, tu cuenta pasará al plan Free
- Tus datos e historial se mantendrán seguros

### 💬 ¿Necesitas ayuda?

Responde este email y te ayudaremos a resolver el problema.

---

Saludos,  
**El equipo de TechMind**

---

## 7. EMAIL DE BIENVENIDA (Plan Enterprise)

**Asunto:** 🚀 Bienvenido a TechMind Enterprise - ¡Estamos aquí para ti!

---

Hola {{nombre}},

¡Bienvenido a **TechMind Enterprise**! 🎉

Tu equipo ya tiene acceso completo a todas las funcionalidades premium.

### 🎯 Tu cuenta Enterprise:

**Empresa:** {{nombre_empresa}}  
**Plan:** TechMind Enterprise  
**Usuarios:** 10 incluidos  
**Precio:** €99/mes  

### ✨ Beneficios Enterprise:

✅ **10 usuarios** incluidos  
✅ **Consultas ilimitadas** para todo el equipo  
✅ **API access** completo  
✅ **Instancia dedicada** (mayor velocidad)  
✅ **Soporte prioritario 24/7**  
✅ **Facturación mensual**  
✅ **Onboarding personalizado**  

### 👥 Gestionar usuarios:

Panel de administración: https://admin.techmind.ai  
Email admin: {{email}}  
Contraseña temporal: {{password_temp}}

### 📞 Tu Account Manager:

**{{account_manager_nombre}}**  
Email: {{account_manager_email}}  
WhatsApp: {{account_manager_phone}}

Estamos aquí para ayudarte a implementar TechMind en tu equipo.

### 📅 Onboarding Call:

¿Cuándo te viene bien una llamada de 30 minutos para configurar todo?  
[Agenda tu onboarding →](https://calendly.com/techmind/onboarding)

---

¿Preguntas urgentes? Contacta a tu Account Manager.

Saludos,  
**El equipo de TechMind Enterprise**  
🌐 techmind-landing.vercel.app

---

## 📋 NOTAS DE IMPLEMENTACIÓN:

### Variables a reemplazar:

- `{{nombre}}` - Nombre del usuario
- `{{email}}` - Email del usuario
- `{{api_key}}` - API Key generada
- `{{fecha_renovacion}}` - Fecha próxima renovación
- `{{ultimos_4_digitos}}` - Últimos 4 dígitos de tarjeta
- `{{consultas_totales}}` - Total de consultas del mes
- `{{tiempo_total}}` - Minutos de uso
- `{{temas_mas_consultados}}` - Top 3 temas
- `{{razon_error}}` - Razón del error de pago
- `{{nombre_empresa}}` - Nombre de la empresa (Enterprise)
- `{{password_temp}}` - Contraseña temporal
- `{{account_manager_nombre}}` - Nombre del AM
- `{{account_manager_email}}` - Email del AM
- `{{account_manager_phone}}` - Teléfono del AM

### Cuándo enviar cada email:

1. **Bienvenida Free:** Al registrarse (signup)
2. **Confirmación Pro:** Al completar pago (webhook: checkout.session.completed)
3. **API Key:** Junto con confirmación de pago
4. **Renovación:** 3 días antes de renovación (cron job)
5. **Cancelación:** Al cancelar suscripción (webhook: subscription.deleted)
6. **Error pago:** Al fallar pago (webhook: invoice.payment_failed)
7. **Bienvenida Enterprise:** Al completar pago Enterprise

### Servicio de email recomendado:

- **Resend** (gratis hasta 3,000 emails/mes) - Recomendado
- **SendGrid** (gratis hasta 100 emails/día)
- **AWS SES** (muy barato, $0.10 por 1,000 emails)

### Implementación en el backend:

```python
# En api-stripe.py, añadir función de envío
import resend

resend.api_key = os.getenv("RESEND_API_KEY")

def send_welcome_email(email, nombre, api_key):
    resend.Emails.send({
        "from": "TechMind <noreply@techmind.ai>",
        "to": email,
        "subject": "✅ Pago confirmado - Bienvenido a TechMind Pro",
        "html": render_template("welcome_pro.html", 
                               nombre=nombre, 
                               email=email, 
                               api_key=api_key)
    })
```
