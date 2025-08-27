# 🎓 Email Processor Workshop v2 - OpenAI API Practitioner

## 🚀 Workshop Completo - 5 Ramas Implementadas

¡Felicidades! Este workshop está 100% completo con todas las 5 ramas implementadas para la certificación **OpenAI API Practitioner**.

## 📚 Estructura del Workshop Progresivo

### ✅ Rama 1: `1-initial-project` 
**Fundamentos y Configuración**
- Express server con TypeScript
- Configuración OpenAI SDK
- Sistema básico de logging
- Variables de entorno

### ✅ Rama 2: `2-rag-embedding`
**RAG (Retrieval-Augmented Generation)**
- Vector embeddings con `text-embedding-3-small`
- Base de conocimiento con 8 políticas financieras
- RAGService para consultas contextuales
- VectorStoreService para gestión de embeddings

### ✅ Rama 3: `3-fine-tuning`
**Fine-tuning para Clasificación**
- Dataset de 12 ejemplos de entrenamiento
- Comparación modelo base vs fine-tuned
- Clasificación automática de emails
- Métricas de performance y análisis

### ✅ Rama 4: `4-email-processor`
**Procesador Completo de Emails**
- Sistema completo de procesamiento
- Simulación de emails con Faker.js
- Integración RAG + Fine-tuning + Procesamiento
- EmailProcessorService y EmailSimulationService

### ✅ Rama 5: `5-api-moderation` ← **ACTUAL**
**OpenAI Moderation API**
- Análisis de seguridad de contenido
- Moderación individual, por lotes y de emails
- Sistema de alertas inteligente
- 11 categorías de riesgo analizadas

## 🛠️ Sistema de Build Avanzado

Todas las ramas implementan el sistema de build mejorado:

```bash
# Compilación completa con path resolution
npm run build  # tsc && tsc-alias && ts-add-js-extension --dir=dist

# Desarrollo
npm run dev    # ts-node src/app.ts

# Producción  
npm start      # node dist/app.js
```

## 🎯 Tecnologías Dominadas

- **OpenAI SDK**: GPT-4o-mini, Embeddings, Fine-tuning, Moderation
- **TypeScript**: Configuración avanzada con path aliases
- **Express**: APIs REST profesionales
- **Vector Embeddings**: RAG implementation
- **Fine-tuning**: Model customization
- **Content Moderation**: Safety systems

## 🚀 Inicio Rápido

### 1. Configurar Entorno
```bash
# Clonar y configurar
git clone <repo-url>
cd email-processor-ws-v2

# Configurar variables
cp .env.example .env
# Editar .env con tu OPENAI_API_KEY
```

### 2. Explorar Ramas
```bash
# Rama actual (5-api-moderation)
git branch --show-current

# Cambiar a otras ramas
git checkout 1-initial-project
git checkout 2-rag-embedding  
git checkout 3-fine-tuning
git checkout 4-email-processor
git checkout 5-api-moderation
```

### 3. Ejecutar Cualquier Rama
```bash
npm install
npm run build
npm start

# Visitar http://localhost:3000
```

## 🛡️ Rama Actual: OpenAI Moderation API

### Endpoints Disponibles

- **POST** `/api/moderation/text` - Moderar texto individual
- **POST** `/api/moderation/batch` - Moderar múltiples textos  
- **POST** `/api/moderation/email` - Moderar email completo
- **GET** `/api/moderation/categories` - Info de categorías
- **POST** `/api/moderation/demo` - Demo interactiva

### Ejemplo de Uso

```bash
# Probar moderación básica
curl -X POST http://localhost:3000/api/moderation/text \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, this is a safe message!"}'

# Demo interactiva
curl -X POST http://localhost:3000/api/moderation/demo \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Test Manual
```bash
# Ejecutar tests completos de moderación
npm run test:moderation
```

## 📊 Casos de Uso Implementados

### 1. **Sistema de Comentarios**
Filtrado automático de comentarios de usuarios con diferentes niveles de riesgo.

### 2. **Moderación de Emails**
Análisis completo de asunto y contenido de emails antes de entrega.

### 3. **Procesamiento por Lotes**
Análisis masivo de contenido con estadísticas detalladas.

### 4. **Sistema de Alertas**
Notificaciones inteligentes basadas en nivel de riesgo detectado.

### 5. **Dashboard de Estadísticas**
Métricas de moderación y análisis de tendencias de contenido.

## 🏆 Certificación OpenAI API Practitioner

Este workshop cubre completamente los requisitos para la certificación:

- ✅ **OpenAI SDK Integration**
- ✅ **Embeddings & Vector Stores** 
- ✅ **Fine-tuning Implementation**
- ✅ **Content Moderation**
- ✅ **Production-Ready Architecture**
- ✅ **Error Handling & Logging**
- ✅ **TypeScript Best Practices**

## 📖 Documentación por Rama

- [Rama 1 - Initial Project](./BRANCH-1-README.md)
- [Rama 2 - RAG Embeddings](./BRANCH-2-README.md)  
- [Rama 3 - Fine-tuning](./BRANCH-3-README.md)
- [Rama 4 - Email Processor](./BRANCH-4-README.md)
- [Rama 5 - API Moderation](./BRANCH-5-README.md) ← **Actual**

## 🎉 ¡Felicidades!

Has completado exitosamente el workshop más completo de OpenAI API. Ahora tienes:

- **5 ramas funcionales** con diferentes niveles de complejidad
- **Conocimiento completo** del ecosistema OpenAI
- **Código production-ready** con mejores prácticas
- **Portfolio proyecto** para certificación

¡Estás listo para ser un **OpenAI API Practitioner** certificado! 🚀

---

## 💡 Siguientes Pasos

1. **Practicar con tu API key** en todas las ramas
2. **Experimentar con diferentes prompts** y configuraciones
3. **Adaptar el código** a tus casos de uso específicos
4. **Presentar tu proyecto** para la certificación

¡El futuro de la IA está en tus manos! 🤖✨
