# Email Processor Workshop v2 - OpenAI API Practitioner Certification

Este proyecto está diseñado como un workshop progresivo que cubre todos los aspectos requeridos para la certificación **OpenAI API Practitioner**. Utilizamos el concepto de procesamiento de emails financieros para demostrar técnicas avanzadas de IA.

## 🎯 Objetivo del Workshop

Construir un sistema de procesamiento de emails financieros que evoluciona a través de 5 ramas progresivas, desde conceptos básicos hasta implementaciones avanzadas con RAG, fine-tuning y moderación.

## 📚 Estructura de Ramas Progresivas

### Rama 1: `1-initial-project`
- ✅ Setup básico del proyecto
- ✅ Configuración de OpenAI SDK
- ✅ Estructura base con Express y TypeScript

### Rama 2: `2-rag-embedding`
- ✅ Implementación de RAG con Company Financial Policies
- ✅ Vector store en memoria
- ✅ Endpoint para consultas contextualizadas

### Rama 3: `3-fine-tuning`
- ✅ LMService para clasificación de emails (reemplaza FineTuningService)
- ✅ Generación de dataset de entrenamiento
- ✅ Configuración flexible con OPENAI_MODEL
- ✅ Comparación modelo base vs fine-tuned

### Rama 4: `4-email-processor`
- ✅ Simulación completa de procesamiento de emails
- ✅ Tool calling para save-email
- ✅ Arquitectura modular con routes/ separados
- ✅ Preservación de lógica de senders existente

### Rama 5: `5-api-moderation`
- ✅ Integración de Moderation API
- ✅ Filtrado de contenido inapropiado
- ✅ Sistema completo y robusto
- ✅ Arquitectura final con todos los módulos

## 🚀 Instalación y Setup

```bash
# 1. Clonar y navegar al proyecto
cd email-processor-ws-v2

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tu OPENAI_API_KEY

# 4. Verificar setup
npm run build

# 5. Ejecutar en modo desarrollo
npm run dev

# 6. Probar endpoints (opcional)
curl http://localhost:3000/health
```

## 🧪 Testing con Datos de Ejemplo

```bash
# Usar datos de prueba incluidos
curl -X POST http://localhost:3000/rag/query \
  -H "Content-Type: application/json" \
  -d @inputs/rag/test-policy-query.json

# Para testing de audio (Rama 2+)
curl -X POST http://localhost:3000/rag/query-voice-to-text \
  -F "audio=@tu-pregunta.mp3"
```

## 🌟 Características del Workshop

- **Didáctico**: Cada rama construye sobre la anterior
- **Práctico**: Ejemplos reales con casos de uso financieros
- **Progresivo**: De conceptos simples a implementaciones complejas
- **Certificación-aligned**: Cubre todos los temas de OpenAI API Practitioner
- **Arquitectura Modular**: Routes separados y servicios desacoplados
- **Documentación Completa**: Guía detallada con costos y mejores prácticas
- **Voice Capabilities**: Interacciones por voz con Whisper y TTS
- **Testing Comprehensive**: Datos de prueba organizados y listos para usar

## 🎤 Funcionalidades de Voz (Rama 2+)

### Speech-to-Text + RAG
```bash
POST /rag/query-voice-to-text
# Sube MP3/WAV → Transcribe → Consulta RAG → Responde JSON
```

### Voice-to-Voice RAG  
```bash
POST /rag/query-voice-to-voice
# Sube audio → Transcribe → Consulta RAG → Responde audio MP3
```

**Casos de uso reales:**
- 🚗 CFO consulta desde el coche
- 📱 Consultas móviles por voz
- ♿ Accesibilidad mejorada
- 🎧 Respuestas mientras trabajas

## 🔧 Mejoras Implementadas

- **LMService Refactoring**: Reemplazo de FineTuningService con configuración flexible
- **Modular Routes**: Separación de endpoints en archivos dedicados
- **Enhanced Documentation**: Explicaciones detalladas de embeddings y fine-tuning
- **OpenAI Platform Integration**: Pasos específicos para fine-tuning en plataforma
- **Moderation API**: Explicación completa de seguridad de contenido
- **Environment Configuration**: Variables flexibles para diferentes modelos
- **Voice Capabilities**: Endpoints de voz con Whisper y TTS integration
- **Comprehensive Testing**: Datos de prueba organizados para cada funcionalidad

## 📁 Estructura de Testing

```
inputs/                     # 🧪 Datos de prueba para cada rama
├── basic/                 # Rama 1: Setup básico y OpenAI calls
├── rag/                   # Rama 2: RAG queries + Voice endpoints  
├── fine-tuning/          # Rama 3: Clasificación especializada
├── email-processing/     # Rama 4: Pipeline completo
└── moderation/           # Rama 5: Filtrado de contenido
```

**Cada carpeta incluye:**
- ✅ Archivos JSON listos para Postman/cURL
- ✅ Instrucciones detalladas de uso
- ✅ Expected results para validación
- ✅ Ejemplos progresivos por funcionalidad

## 📖 Guía de Uso

1. **Empezar en rama `main`** (rama 1) para el setup básico
2. **Avanzar secuencialmente** por cada rama
3. **Cada rama incluye**: código, documentación y ejercicios prácticos
4. **Demostración final**: app móvil muestra datos guardados

## 🔧 Tecnologías Utilizadas

- **TypeScript** para tipado fuerte
- **Express.js** para API REST
- **OpenAI SDK** para todas las integraciones
- **Zod** para validación de esquemas
- **Faker** para simulación de datos
- **Vector Store** en memoria (sin dependencias externas)

---

*Este workshop transforma la comprensión del procesamiento de emails tradicional hacia sistemas inteligentes basados en IA, preparando para la certificación OpenAI API Practitioner.*
