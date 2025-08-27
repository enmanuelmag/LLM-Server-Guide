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
- 🔄 Implementación de RAG con Company Financial Policies
- 🔄 Vector store en memoria
- 🔄 Endpoint para consultas contextualizadas

### Rama 3: `3-fine-tuning`
- 📋 Fine-tuning con LoRA para clasificación de emails
- 📋 Generación de dataset de entrenamiento
- 📋 Comparación modelo base vs fine-tuned

### Rama 4: `4-email-processor`
- 📋 Simulación completa de procesamiento de emails
- 📋 Tool calling para save-email
- 📋 Preservación de lógica de senders existente

### Rama 5: `5-api-moderation`
- 📋 Integración de Moderation API
- 📋 Filtrado de contenido inapropiado
- 📋 Sistema completo y robusto

## 🚀 Instalación y Setup

```bash
# 1. Clonar y navegar al proyecto
cd email-processor-ws-v2

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tu OPENAI_API_KEY

# 4. Ejecutar en modo desarrollo
npm run dev
```

## 🌟 Características del Workshop

- **Didáctico**: Cada rama construye sobre la anterior
- **Práctico**: Ejemplos reales con casos de uso financieros
- **Progresivo**: De conceptos simples a implementaciones complejas
- **Certificación-aligned**: Cubre todos los temas de OpenAI API Practitioner

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
