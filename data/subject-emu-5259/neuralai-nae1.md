# Subject-Emu-5259/NeuralAI-Nae1

## Resumen

NeuralAI Nae1 es un modelo de lenguaje de tipo decoder causal con arquitectura estilo Llama y 100.112.256 parámetros, entrenado desde cero por el desarrollador independiente Subject-Emu-5259 (De'Andrew Preston Harris, según la model card). Se distribuye bajo licencia Apache 2.0 y está diseñado como un asistente conversacional de tamaño reducido, orientado a despliegue local y a entornos con recursos limitados. El modelo se ha preentrenado sobre FineWeb y posteriormente se ha sometido a un ajuste supervisado (SFT) mediante LoRA para dotarlo de capacidades de conversación y uso de herramientas.

La versión actual del checkpoint corresponde a la SFT v17 (LoRA step-9250), construida sobre la SFT v13.2 y publicada en producción desde el 11 de noviembre de 2026. El modelo incluye soporte declarado para tool calling con las herramientas `search`, `fetch` y `read_file`, además de conversación multi-turno y chat general. Su enfoque es explícitamente "from scratch": no es una destilación ni un fine-tune de un modelo base de terceros, lo que lo hace relevante para quienes buscan un modelo pequeño, completamente abierto y con pesos propios para experimentación o despliegue en local.

El modelo está etiquetado como "tiny-model" por su tamaño (100M de parámetros) y solo declara soporte para inglés. Se distribuye en formatos safetensors (bf16) y GGUF, lo que facilita su uso con llama.cpp y herramientas compatibles con endpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal estilo Llama |
| Parametros totales | 100.112.256 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (el repo incluye formato GGUF; niveles concretos no disponibles) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) y GGUF |

## Arquitectura y entrenamiento

El modelo es un decoder causal de arquitectura transformer estilo Llama con 100,1 millones de parámetros. Según la model card, fue preentrenado desde cero ("from scratch") sobre el corpus FineWeb, sin destilación ni fine-tune de un modelo base ajeno. El preentrenamiento se realizó hasta el step-100000, que sirve de base para la línea de checkpoints SFT. No se especifica en la información disponible el número total de tokens de preentrenamiento, la composición detallada del dataset ni si se aplicaron técnicas como RLHF o DPO.

La fase de ajuste supervisado se realizó mediante LoRA de rango 32 aplicado a las capas de atención y MLP, con los pesos base congelados y los adaptadores fusionados posteriormente en un checkpoint estándar. La SFT v17 empleó 36.000 filas de datos: 13.000 trazas "spine" (una época), 10.000 trazas dirigidas (dos épocas) y 1.500 diálogos multi-turno naturales (dos épocas), con un 10% de tokens supervisados provenientes de replay de FineWeb. El entrenamiento se ejecutó en una GPU Kaggle T4 con un LR pico de 1e-4, schedule coseno y 9.250 pasos, alcanzando una pérdida final de SFT de 1,3177. Las respuestas verificables se validaron de forma automática. No se mencionan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, incluyendo saludos, identidad y small talk.
- Conversación multi-turno con memoria de contexto a corto plazo (según los evals, multiturn12 12/12 y memory12 8/12).
- Tool calling / function calling con las herramientas `search`, `fetch` y `read_file`.
- Recuperación de información y extracción de contenido de páginas o ficheros mediante las herramientas integradas.
- Respuestas con "segundo pensamiento" (second thought) y mecanismos de awareness y guardrail, según la línea de evaluación de cinco áreas.
- Manejo de preguntas sobre fechas con una capa determinista de fechas en producción (el modelo por sí solo tiene una regresión conocida en el cambio de mes).
- No se declaran capacidades de visión, audio, matemáticas avanzadas ni razonamiento multi-paso complejo más allá del uso de herramientas.

## Casos de uso

- Asistente conversacional local: el modelo puede gestionar diálogos multi-turno básicos en inglés y ejecutarse en hardware de consumo gracias a sus 100M de parámetros y su disponibilidad en GGUF. Es adecuado para prototipos de asistentes personales sin conexión.
- Agente de búsqueda y extracción web: con las herramientas `search` y `fetch`, puede integrarse en pipelines que consulten fuentes en línea y extraigan contenido, útil para tareas de investigación ligera o resumen de páginas.
- Lectura de ficheros en flujos automatizados: la herramienta `read_file` permite incorporar el modelo en scripts que necesiten leer y responder sobre el contenido de ficheros locales, por ejemplo en asistentes de documentación interna.
- Chatbot de atención al cliente de bajo coste: su tamaño reducido y licencia Apache 2.0 permiten desplegarlo en servidores modestos para gestionar consultas frecuentes y derivar las complejas a un modelo mayor.
- Evaluación y experimentación en investigación: al ser un modelo entrenado desde cero y con pesos abiertos, sirve como base para estudiar el efecto de distintas recetas de SFT y LoRA en modelos pequeños.
- Despliegue en el edge o en dispositivos con recursos limitados: la versión GGUF y los 100M de parámetros lo hacen viable en CPU y en GPUs de gama baja para aplicaciones de generación de texto en tiempo real.
- Integración en pipelines de CI/CD para pruebas de herramientas: su soporte de tool calling permite usarlo como componente de test en sistemas que validen flujos de llamadas a funciones.

## Benchmarks y rendimiento

Los datos disponibles provienen de las evaluaciones internas del autor (gate de SFT v17), no de benchmarks estándar como MMLU, HumanEval o GSM8K.

| Evaluación | SFT v17 | Referencia / nota |
|---|---|---|
| Golden-40 tool-use gate | 35,5/40 (88,8%) | Umbral 60%; llamadas 39/40, respuestas fundamentadas 32/40 |
| Fluency guardrail (PPL) | 50,49 | Sobre 50 documentos; umbral ≤52; v13.2 obtuvo 48,01 en el mismo set |
| Multiturn | 12/12 | — |
| Casual | 7/7 | — |
| Memory6 | 5/6 | — |
| Second thought | 5/6 | v13.2: 0/6 |
| Awareness | 7/8 | v13.2: 1/8 |
| Guardrail | 6/6 | v13.2: 1/6 |
| Memory12 | 8/12 | v13.2: 6/12 |
| Livetools | 4/6 | v13.2: 4/6 en el arnés corregido |
| Date8 | 7/8 | Regresión en el cambio de mes; v13.2: 8/8 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 100M de parámetros, en bf16 requiere aproximadamente 0,2 GB para los pesos, más overhead de activaciones y KV cache; en cuantizaciones GGUF de 4 bits puede ocupar del orden de 60-80 MB.
- GPU recomendadas: cualquier GPU moderna es suficiente; el autor entrenó con Kaggle T4. Funciona en RTX 4090, A100, H100 y GPUs de gama baja.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con al menos 1-2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: llama.cpp (formato GGUF incluido), endpoints compatibles, y el propio stack "Fabric" del autor; también puede servirse con frameworks estándar de Hugging Face.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| NeuralAI Nae1 | 100,1M | No disponible | Apache 2.0 | Inglés | Entrenado desde cero, tool calling, GGUF |
| TinyLlama 1.1B | 1,1B | 2.048 tokens | Apache 2.0 | Inglés | Modelo mayor, más contexto, ampliamente adoptado |
| Qwen2.5-0.5B | 0,5B | 32.768 tokens | Apache 2.0 | Multilingüe | Mayor contexto y multilingüismo, tool calling |
| SmolLM2-135M | 135M | 8.192 tokens | Apache 2.0 | Inglés | Tamaño comparable, contexto mayor, sin tool calling nativo declarado |

Los datos de contexto de los modelos comparados provienen de conocimiento general; para Nae1 el contexto no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no se declara capacidad multilingüe.
- La longitud de contexto no está especificada, lo que dificulta planificar su uso en tareas de contexto largo.
- Regresión conocida en el cambio de mes en preguntas de fecha (date8 7/8); en producción se mitiga con una capa determinista de fechas, pero el modelo por sí solo falla en ese caso.
- Riesgo de alucinación inherente a un modelo de 100M de parámetros; las respuestas fundamentadas en el gate de herramientas son 32/40, lo que indica margen de error.
- El modelo está entrenado con datos de FineWeb y SFT propio; no se documentan sesgos específicos, pero al ser un modelo pequeño y en inglés, es probable que herede sesgos del corpus.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el autor no ofrece garantías sobre el rendimiento en producción; los evals son internos y no están validados de forma independiente.
- El modelo depende de herramientas externas (`search`, `fetch`, `read_file`) para muchas tareas; sin esas integraciones su utilidad se reduce al chat básico.
- La model card está truncada en la información disponible, por lo que pueden existir detalles adicionales no recogidos aquí.

## Enlaces

- Hugging Face: https://huggingface.co/Subject-Emu-5259/NeuralAI-Nae1
- Banner: https://huggingface.co/Subject-Emu-5259/NeuralAI-Nae1/resolve/main/neuralai-nae1-banner.png
- Repositorio GitHub con informes de evaluación: mencionado en la model card como `gate_results/v17_full_gate_report.md` (URL exacta no disponible)
- Informes de evaluación internos: `evals/eval_sftv17lora_step9250_golden40.json`, `evals/eval_sftv17lora_step9250_multiturn12.json`, `evals/eval_sftv17lora_step9250_date8.json`, `evals/eval_sftv17lora_step9250_smoke.json` (rutas relativas al repo, URL completa no disponible)
