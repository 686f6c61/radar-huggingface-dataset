# syed7741/aegis-industrial-rag-assistant

## Resumen

AEGIS Industrial RAG Assistant es el componente de generación aumentada por recuperación (RAG) de la plataforma AEGIS AI, un proyecto de ingeniería de IA orientado a entornos industriales. El repositorio documenta la configuración del pipeline RAG, no un modelo de lenguaje fine-tuneado de forma independiente. El componente lingüístico principal es `google/flan-t5-small`, un modelo encoder-decoder transformer de 80 millones de parámetros, combinado con el modelo de embeddings `sentence-transformers/all-MiniLM-L6-v2` (384 dimensiones) y un dataset industrial propio (`syed7741/aegis-industrial-ai-dataset`).

El proyecto integra recuperación semántica local, generación de respuestas fundamentadas y atribución de fuentes, todo servido a través de una API FastAPI con interfaz React/TypeScript. Aunque el repositorio declara explícitamente que aún no contiene un checkpoint fine-tuneado, la arquitectura demuestra cómo construir un asistente RAG para consultas sobre documentación técnica, mantenimiento predictivo, seguridad laboral y automatización de flujos de trabajo. Su relevancia radica en ser un ejemplo práctico de despliegue de RAG en entornos industriales con recursos computacionales limitados, dado el tamaño reducido del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (FLAN-T5-small) + modelo de embeddings MiniLM (sentence-transformers) |
| Parametros totales | 80 M (FLAN-T5-small) + 22 M (MiniLM-L6-v2) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (limitada por el modelo base, típicamente 512 tokens en FLAN-T5) |
| Tipos de cuantizacion | no disponible (no se especifica en la documentación) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo base), configuraciones de pipeline en Python |

## Arquitectura y entrenamiento

El pipeline se compone de tres módulos: un modelo de lenguaje `google/flan-t5-small` (encoder-decoder transformer preentrenado con instrucciones y fine-tuneado con FLAN), un modelo de embeddings `all-MiniLM-L6-v2` (basado en transformer, genera vectores de 384 dimensiones) y un dataset industrial local (`aegis-industrial-ai-dataset`). La arquitectura sigue el flujo clásico de RAG: la consulta del usuario se convierte en embedding, se realiza una búsqueda semántica local sobre el dataset, se recuperan los fragmentos relevantes y se pasan al modelo FLAN-T5 junto con la consulta para generar una respuesta fundamentada. No se ha realizado ningún fine-tuning adicional sobre FLAN-T5; el sistema funciona con el modelo base tal cual. El dataset de conocimiento no está documentado en detalle, pero se describe como orientado a dominios industriales (robótica, mantenimiento predictivo, seguridad laboral, automatización). No se mencionan técnicas de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de texto fundamentado en contexto recuperado (RAG), permitiendo respuestas con atribución de fuentes.
- Búsqueda semántica sobre documentación industrial local mediante embeddings de 384 dimensiones.
- Soporte de consultas multi-turno básicas, limitado por la ventana de contexto de FLAN-T5-small (512 tokens).
- Capacidad de integrarse con APIs REST (FastAPI) y frontends web (React/TypeScript).
- Manejo de dominios específicos: mantenimiento predictivo, seguridad laboral, monitorización de robots y automatización de flujos.
- No soporta tool calling, agentes multi-paso, visión ni audio; es un sistema de texto puro.

## Casos de uso

- Atención al cliente técnica en fabricación: un operario consulta "¿Cuál es el procedimiento de bloqueo de seguridad para la prensa hidráulica?" y el sistema recupera el manual correspondiente y genera una respuesta paso a paso con referencia al documento fuente.
- Mantenimiento predictivo: el asistente responde a "¿Qué indicadores de vibración sugieren desgaste en el motor principal?" usando datos históricos y fichas técnicas almacenadas en el dataset.
- Formación de nuevos empleados: los trabajadores pueden hacer preguntas sobre normativas de seguridad y el sistema proporciona respuestas basadas en la documentación oficial de la planta.
- Consulta de especificaciones de componentes: un ingeniero pregunta "¿Cuál es el par de apriete para el tornillo M12 en el brazo robótico?" y el sistema recupera la tabla correspondiente.
- Automatización de flujos de trabajo: el asistente puede extraer pasos de procedimientos operativos estándar (SOP) y presentarlos de forma estructurada.
- Auditoría de cumplimiento: el sistema permite verificar que las respuestas sobre normativas industriales provienen de fuentes internas, facilitando la trazabilidad y el cumplimiento regulatorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base FLAN-T5-small tiene métricas conocidas (por ejemplo, MMLU ~40% en el paper original), pero no se han reportado evaluaciones específicas de este pipeline RAG en tareas industriales.

## Requisitos de hardware

- Inferencia en CPU: FLAN-T5-small y MiniLM-L6-v2 son modelos ligeros; un pipeline completo puede ejecutarse en una CPU moderna con 4-8 GB de RAM.
- VRAM estimada para GPU: menos de 2 GB para ambos modelos en FP32; cuantizados podrían caber en menos de 1 GB.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, o incluso integradas con soporte CUDA).
- Despliegue: compatible con Hugging Face Transformers, FastAPI para servir la API, y puede empaquetarse con Docker.
- Latencia: en CPU, respuestas típicas de 0,5-2 segundos para consultas cortas; en GPU, sub-100 ms.
- Throughput: suficiente para uso interno de una planta con decenas de consultas por minuto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AEGIS RAG Assistant (este) | 80 M + 22 M | ~512 tokens | RAG con FLAN-T5-small | Apache 2.0 | Pipeline documentado, sin checkpoint |
| Industrial RAG Assistant (Siemens S7-1200) | no disponible | no disponible | RAG sobre manual técnico | no especificada | Repositorio GitHub |
| Modelos genéricos RAG (p.ej., Llama 3 8B con RAG) | 8 B | 8K tokens | LLM grande + recuperación | Llama 3 community license | Disponible en Hugging Face |

El modelo AEGIS se distingue por su tamaño mínimo y su enfoque en dominios industriales específicos, pero carece de un checkpoint fine-tuneado y de benchmarks propios.

## Limitaciones y advertencias

- No es un modelo fine-tuneado: el repositorio documenta la configuración del pipeline, no un checkpoint entrenado específicamente para tareas industriales. Los resultados dependen enteramente del modelo base FLAN-T5-small.
- Ventana de contexto limitada: 512 tokens puede ser insuficiente para documentos largos; la recuperación debe fragmentar el conocimiento en trozos pequeños.
- Riesgo de alucinación: como cualquier LLM, puede generar respuestas plausibles pero incorrectas si el contexto recuperado es insuficiente o ambiguo.
- Sesgos del modelo base: FLAN-T5-small puede reflejar sesgos presentes en sus datos de preentrenamiento (predominantemente inglés).
- Dependencia del dataset: la calidad de las respuestas está limitada por la cobertura y actualización del dataset industrial local.
- Sin soporte multilingüe: solo está configurado para inglés; no se ha probado en otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base FLAN-T5 tiene su propia licencia (Apache 2.0 también), sin restricciones adicionales conocidas.
- No se han realizado pruebas de robustez en entornos de producción industrial reales; se recomienda validación exhaustiva antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syed7741/aegis-industrial-rag-assistant
- Dataset asociado: https://huggingface.co/datasets/syed7741/aegis-industrial-ai-dataset
- Proyecto similar (Industrial RAG Assistant Siemens S7-1200): https://github.com/alirezasoroushe/industrial-rag-assistant
- Proyecto AegisAI (gobernanza de IA): https://github.com/SdSarthak/AegisAI
- Artículo sobre RAG industrial en recursos limitados: https://medium.com/@adibazam456/how-i-rescued-a-rag-assistant-from-memory-leaks-and-got-it-running-on-a-512mb-free-tier-9a0fd1f5633d
- Ejemplos de RAG en empresas reales: https://www.evidentlyai.com/blog/rag-examples
