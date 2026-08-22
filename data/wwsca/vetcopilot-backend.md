# WWsCa/vetcopilot-backend

## Resumen

El repositorio `WWsCa/vetcopilot-backend` no contiene un modelo de inteligencia artificial, sino el código fuente del backend de **VetCopilot**, un sistema de asistencia al diagnóstico veterinario desarrollado con FastAPI, SQLAlchemy y SQLite. Este backend integra un motor de razonamiento clínico denominado LCPS 2.0, recuperación de conocimiento mediante FAISS, reconocimiento de voz (Whisper o API de iFlytek) y generación de notas SOAP. El modelo de lenguaje asociado es `vet-qwen3b-v3-dapt-q8_0`, un GGUF de 3 mil millones de parámetros cuantizado a Q8_0, que se despliega por separado.

La relevancia de este repositorio es práctica: sirve como referencia de implementación para un sistema completo de IA veterinaria, desde la ingesta de documentos hasta la generación de informes clínicos estructurados. No obstante, al tratarse de un backend y no de un modelo, las especificaciones técnicas típicas (parámetros, arquitectura, contexto) no aplican directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (backend FastAPI, no es un modelo de IA) |
| Parametros totales | no disponible (no es un modelo) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo `vet-qwen3b-v3-dapt-q8_0`) |
| Tipos de cuantizacion | no disponible (el backend no define cuantizacion; el modelo referenciado usa Q8_0) |
| Idiomas soportados | en, zh (según metadatos; la interfaz y documentacion están en chino) |
| Licencia | other (sin especificar términos concretos) |
| Formato de pesos | no disponible (backend en Python; el modelo referenciado es GGUF) |

## Arquitectura y entrenamiento

Este repositorio no describe un modelo entrenado. Es un **backend de aplicación** desarrollado con FastAPI, SQLAlchemy y SQLite. Su arquitectura interna incluye:

- **Motor LCPS 2.0**: un pipeline de razonamiento clínico en cinco pasos que guía al modelo de lenguaje en el diagnóstico.
- **FAISS**: índice vectorial para recuperación de conocimiento desde una base de documentos (PDFs y artículos de Baidu).
- **ASR**: integración con Whisper o la API de iFlytek para transcripción de audio.
- **Generación SOAP**: estructura de notas clínicas (Subjetivo, Objetivo, Evaluación, Plan).

No hay datos sobre entrenamiento, dataset o técnicas de optimización porque el repositorio no contiene el modelo. El modelo asociado (`vet-qwen3b-v3-dapt-q8_0`) no está publicado en esta cuenta de HuggingFace, por lo que no se puede verificar su arquitectura, datos de entrenamiento o proceso de ajuste.

## Capacidades

- **Diagnóstico veterinario asistido**: el backend orquesta el modelo de lenguaje para razonar sobre síntomas y generar diagnósticos diferenciales.
- **Recuperación de conocimiento**: FAISS permite consultar una base de documentos veterinarios para apoyar las decisiones clínicas.
- **Reconocimiento de voz**: transcripción de consultas orales mediante Whisper o la API de iFlytek.
- **Generación de informes SOAP**: estructuración automática de la información clínica en formato estándar.
- **API REST completa**: expone endpoints para integración con frontends, aplicaciones móviles o sistemas de gestión de clínicas.
- **Multilingüe**: soporte declarado para inglés y chino, aunque la documentación interna está en chino.

## 4. Casos de uso

- **Clínicas veterinarias con flujo digitalizado**: el backend puede integrarse en un sistema de gestión de pacientes para automatizar la captura de notas clínicas y el diagnóstico asistido, reduciendo el tiempo administrativo del veterinario.
- **Telemedicina veterinaria**: la combinación de ASR (Whisper/iFlytek) y generación SOAP permite transcribir consultas por voz y generar resúmenes clínicos en tiempo real.
- **Formación de estudiantes de veterinaria**: el motor LCPS 2.0 puede usarse como herramienta de práctica para que estudiantes comparen sus razonamientos con los generados por el sistema.
- **Sistema de segunda opinión**: el veterinario puede introducir los síntomas y obtener un diagnóstico diferencial respaldado por la recuperación de documentos de la base de conocimiento.
- **Investigación en IA aplicada a veterinaria**: el código sirve como referencia de una implementación completa (FastAPI + FAISS + LLM) para académicos que estudien sistemas de decisión clínica.
- **Desarrollo de productos de salud animal**: cualquier equipo que quiera construir una solución de IA veterinaria puede reutilizar la estructura de routers, servicios y esquemas como punto de partida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones del modelo de lenguaje ni del motor de razonamiento. Los únicos datos de rendimiento indirectos son la referencia al modelo `vet-qwen3b-v3-dapt-q8_0` (3B, Q8_0), que sugiere una inferencia viable en hardware de consumo, pero sin métricas concretas.

## Requisitos de hardware

- **Para el backend**: CPU con 4-8 GB de RAM es suficiente para FastAPI + SQLite + FAISS en modo CPU.
- **Para el modelo de lenguaje** (`vet-qwen3b-v8-dapt-q8_0`, 3B Q8_0): se recomienda al menos 8 GB de VRAM para inferencia fluida, o 16 GB para mantener el contexto completo en GPU.
- **GPU recomendadas**: RTX 3060 (12 GB) o superior, RTX 4070, A100 (para despliegue en producción).
- **Despliegue**: el backend se ejecuta con Uvicorn. El modelo GGUF puede servirse con llama.cpp, Ollama o vLLM (si se convierte a formato compatible).
- **Latencia**: sin datos publicados; en una RTX 4090, un modelo 3B Q8_0 típicamente responde en menos de 2 segundos por generación de 512 tokens, pero es una estimación general, no una medición de este sistema.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA y no existen alternativas comparables en el mismo repositorio. El proyecto `0xDI/vetcopilot` en GitHub es un sistema similar (gestión veterinaria con IA) pero usa GPT-4o Vision y una arquitectura distinta (Next.js + Supabase). No se puede establecer una comparación técnica directa entre ambos.

## Limitaciones y advertencias

- **No es un modelo de IA**: el repositorio contiene solo código backend; sin el modelo `vet-qwen3b-v3-dapt-q8_0` desplegado, el sistema no funciona.
- **Documentación en chino**: la guía de instalación y los scripts están en chino, lo que dificulta su uso para desarrolladores hispanohablantes.
- **Licencia no especificada**: la licencia `other` no define términos claros para uso comercial o modificación.
- **Mantenimiento abandonado**: el proyecto original (`0xDI/vetopilot`) se publicó como "as-is" porque la idea no prosperó; no hay garantías de soporte o actualizaciones.
- **Riesgo clínico**: el sistema genera diagnósticos veterinarios; un uso en producción sin validación clínica puede causar errores de diagnóstico. El autor no proporciona advertencias médicas en el repositorio.
- **Dependencias externas**: la ingesta de documentos requiere un token de Baidu (百度网盘), y la transcripción de voz depende de servicios externos (Whisper o iFlytek), lo que añade puntos de fallo.

## Enlaces

- Repositorio de HuggingFace: [WWsCa/vetcopilot-backend](https://huggingface.co/WWsCa/vetcopilot-backend)
- Proyecto relacionado en GitHub (original, no oficial): [0xDI/vetcopilot](https://github.com/0xDI/vetcopilot)
- README del proyecto GitHub: [0xDI/vetcopilot README](https://github.com/0xDI/vetcopilot/blob/master/README.md)
- Modelo referenciado (no verificado): [WWsCa/vet-qwen3b-v3-dapt-q8_0](https://huggingface.co/WWsCa/vet-qwen3b-v3-dapt-q8_0)
