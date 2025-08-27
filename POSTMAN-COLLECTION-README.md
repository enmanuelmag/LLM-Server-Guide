# 📋 Colección Postman - Email Processor Workshop v2

## 🎯 **Información General**

**Archivo:** `Email-Processor-Workshop-v2-Postman-Collection.json`  
**Ubicación:** Disponible en **TODAS las ramas** del workshop  
**Propósito:** Testing completo de todos los endpoints del workshop

## 📚 **¿Qué Incluye?**

### **🏗️ Cobertura Completa:**
- ✅ **25+ endpoints** organizados por funcionalidad
- ✅ **6 ramas/módulos** completamente documentados
- ✅ **Datos de ejemplo reales** basados en `/inputs` folder
- ✅ **Descripciones detalladas** para cada endpoint
- ✅ **Variables de entorno** pre-configuradas

### **📁 Organización por Ramas:**

#### **🏠 Sistema Base** (Todas las ramas)
- Welcome - Información del Workshop
- Health Check - Estado del Servidor
- Documentación - Guía Completa

#### **🔤 Rama 1: Basic Setup**
- Test Basic Completion
- Test Basic Query

#### **🔍 Rama 2: RAG Embedding**
- RAG Query - Consultas de Políticas/Emails
- Voice to Text/Voice (Multipart)
- Estadísticas del Vector Store

#### **🎯 Rama 3: Fine-tuning**
- Clasificación de Emails (Base/Fine-tuned)
- Comparación de Modelos
- Estadísticas y Dataset de Entrenamiento

#### **📧 Rama 4: Email Processing**
- Procesamiento Individual y por Lotes
- Simulación de Emails
- Estadísticas de Procesamiento

#### **🔧 Rama 5: Enhanced RAG**
- RAG con Function Calling
- Búsqueda por Remitente/Monto
- Enhanced Email Database

#### **🛡️ Rama 6: API Moderation**
- Moderación de Texto/Email
- Batch Moderation
- Demo y Categorías

## 🚀 **Instrucciones de Uso**

### **1. Importar en Postman:**
```bash
# En Postman:
File → Import → Upload File → Email-Processor-Workshop-v2-Postman-Collection.json
```

### **2. Configurar Variables:**
```json
{
  "baseUrl": "http://localhost",
  "port": "3000"
}
```

### **3. Workflow de Testing:**
```bash
# 1. Cambiar a rama deseada
git checkout 2-rag-embedding

# 2. Iniciar servidor
npm run dev

# 3. Usar endpoints de "Rama 2: RAG Embedding" en Postman
# 4. Avanzar secuencialmente por ramas
```

## 📊 **Datos de Ejemplo Incluidos**

### **🗄️ Email Database (8 emails):**
- **Walmart**: $87.34 - Groceries
- **Amazon**: $129.99 - Electronics  
- **Netflix**: $15.99 - Subscription
- **Starbucks**: $12.45 - Coffee
- **Uber**: $23.67 - Transportation
- **Best Buy**: $299.00 - Electronics
- **Target**: $45.78 - Household items
- **Apple**: $0.99 - App purchase

### **📋 Casos de Prueba por Tipo:**
- **RAG Queries**: Consultas en español sobre gastos/emails
- **Fine-tuning**: Ejemplos de spam/recibos/transferencias
- **Email Processing**: Transferencias bancarias, compras
- **Moderation**: Contenido seguro vs problemático

## ⚡ **Tips de Uso**

### **🎯 Por Rama:**
1. **Rama 1**: Empezar con basic completion
2. **Rama 2**: Probar RAG con queries de gastos
3. **Rama 3**: Clasificar diferentes tipos de emails
4. **Rama 4**: Pipeline completo de procesamiento
5. **Rama 5**: Function Calling con búsquedas específicas
6. **Rama 6**: Moderar contenido financiero

### **📝 Testing Progresivo:**
- ✅ Usar datos de ejemplo incluidos
- ✅ Modificar payloads para casos personalizados
- ✅ Revisar responses para entender funcionalidad
- ✅ Seguir descripción de cada endpoint
- ✅ Probar casos de error (datos inválidos)

### **🔧 Configuración Automática:**
- ✅ **Pre-request scripts**: Logging automático
- ✅ **Tests globales**: Validación de respuestas
- ✅ **Variables dinámicas**: Base URL configurable
- ✅ **Error handling**: Manejo de errores automático

## 🎓 **Beneficios Educativos**

### **📈 Aprendizaje Progresivo:**
- Cada endpoint está diseñado para enseñar conceptos específicos
- Ejemplos reales que simulan casos de uso reales
- Documentación detallada sobre qué esperar
- Casos de error para entender validaciones

### **🛠️ Desarrollo Profesional:**
- Patrones de API design
- Manejo de diferentes tipos de datos
- Testing de multipart forms (audio)
- Configuración de collections enterprise-ready

---

## 📞 **Soporte**

**Disponible en todas las ramas:** El archivo está propagado a todas las ramas del workshop  
**Actualizaciones:** Cualquier mejora se sincroniza automáticamente  
**Problemas:** Verificar que el servidor esté corriendo en el puerto correcto

---

*Esta colección está diseñada para ser la herramienta definitiva de testing del Email Processor Workshop v2. ¡Feliz testing! 🚀*
