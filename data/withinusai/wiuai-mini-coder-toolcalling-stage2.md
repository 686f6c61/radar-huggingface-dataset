# WithinUsAI/WIUAI.Mini.Coder.ToolCalling.Stage2

## Resumen

WIUAI.Mini.Coder.ToolCalling.Stage2 es un modelo de lenguaje de 302 millones de parámetros desarrollado por WithinUsAI, especializado en la generación de llamadas a herramientas (tool calling) en formato Hermes. Se trata de la segunda etapa de un proceso de ajuste fino sobre el checkpoint anterior `WithinUsAI/WIUAI.Mini.Coder.ToolCalling`, empleando ajuste completo de parámetros (full fine-tuning) sobre subconjuntos del dataset `NousResearch/hermes-function-calling-v1`.

El modelo parte de una arquitectura tipo Llama (según los tags del repositorio) con un vocabulario de 49.152 tokens y una longitud máxima de secuencia de 1.024 tokens. Su propósito es servir como base de investigación y evaluación para el comportamiento estructurado de function calling, emitiendo peticiones de llamada a herramientas en el formato `<tools>` / `<tool_call>` propio del ecosistema Hermes.

Es relevante en el contexto actual de agentes y automatización porque demuestra que modelos de escala muy reducida pueden ajustarse para tareas estructuradas específicas con recursos mínimos (el entrenamiento reportado duró aproximadamente 1.202 segundos). No obstante, el propio autor advierte que el éxito del entrenamiento no garantiza un rendimiento fiable en tool calling, por lo que debe validarse antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (según tags: `llama`, `transformers`) |
| Parámetros totales | 302.027.520 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens (longitud máxima de secuencia) |
| Tipos de cuantización | No disponible (pesos en safetensors; cuantizaciones GGUF/otras no publicadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo Llama con 302 millones de parámetros y un vocabulario de 49.152 tokens, según los metadatos del repositorio y la model card. La longitud máxima de secuencia es de 1.024 tokens, lo que limita tanto el contexto de inferencia como la longitud de las muestras de entrenamiento aceptadas.

El entrenamiento consistió en un ajuste fino completo de parámetros (sin LoRA ni adaptadores) sobre el dataset `NousResearch/hermes-function-calling-v1`, usando las configuraciones `func_calling_singleturn`, `func_calling` y `glaive_func_calling`. La auditoría del dataset reporta 8.995 ejemplos brutos, de los cuales se aceptaron 4.873 tras eliminar 795 duplicados y descartar 2.442 ejemplos por exceder la longitud de 1.024 tokens (no se truncaron, se descartaron). Se empleó pérdida supervisada únicamente en los tokens del asistente (assistant-only loss). El entrenamiento completó 2 épocas y 610 pasos de optimizador, con una tasa de aprendizaje máxima de 8e-6, batch global efectivo de 16 y una duración aproximada de 1.202 segundos. La pérdida final reportada fue de 0,09209, si bien el autor subraya que esta métrica no constituye un benchmark de comportamiento.

## Capacidades

- Generación de texto con soporte para el formato estructurado de tool calling de Hermes (`<tools>` y `<tool_call>`).
- Emisión de peticiones de llamada a funciones con nombres de función y argumentos, que deben validarse contra el esquema proporcionado.
- Soporte de function calling de un solo turno y de múltiples llamadas, según las configuraciones del dataset de entrenamiento.
- Capacidad de clarificación y comportamiento seguro en el uso de herramientas, contemplada en el dataset pero pendiente de evaluación independiente.
- Generación en inglés (único idioma declarado).
- No ejecuta herramientas ni autoriza acciones externas: solo genera las peticiones.

## Casos de uso

- Investigación en tool calling: el modelo sirve como banco de pruebas de bajo coste para estudiar cómo un transformer de 302M emite llamadas estructuradas en formato Hermes, permitiendo comparar configuraciones y esquemas de entrenamiento.
- Evaluación de pipelines de function calling: puede integrarse en un arnés de evaluación que valide nombres de función y argumentos contra el esquema JSON suministrado, midiendo precisión de selección y de argumentos.
- Prototipado de agentes ligeros: en entornos de desarrollo con recursos limitados, el modelo puede generar borradores de llamadas a herramientas que un validador posterior acepte o rechace, reduciendo coste frente a modelos grandes.
- Generación de datos sintéticos de tool calling: útil para producir pares de prompt y llamada que luego se filtren y se usen en el ajuste de modelos mayores.
- Despliegue en CPU o GPUs de gama baja: con 302M de parámetros y pesos safetensors de ~1,2 GB, cabe en entornos sin aceleradores dedicados para tareas de demostración o pruebas unitarias de integración.
- Formación y docencia: sirve para ilustrar el ciclo completo de ajuste fino supervisado con pérdida solo en el asistente y formato de herramientas, dado el bajo coste de entrenamiento reportado (~20 minutos).
- Filtrado previo en pipelines de agentes: como clasificador/generador de primer paso que propone llamadas candidatas antes de delegar en un modelo mayor para la ejecución final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la pérdida final de entrenamiento (0,09209) y advierte explícitamente que esta no constituye una medida de rendimiento en selección de funciones, precisión de argumentos, comportamiento multi-llamada, clarificación o uso seguro de herramientas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,2 GB solo para pesos, más overhead de activaciones y caché KV para 1.024 tokens.
- En fp16/bf16: alrededor de 0,6 GB para pesos; en cuantización de 8 bits, ~0,3 GB; en 4 bits, ~0,15 GB (estimaciones a partir del número de parámetros; no se han publicado cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp32; tarjetas consumer como GTX 1650, RTX 3050, RTX 4060 o superiores son suficientes. También cabe en A100/H100 sin aprovechar su capacidad.
- Cabe en GPU consumer y en CPU: por su tamaño, es viable en inferencia CPU con llama.cpp u Ollama si se generan pesos GGUF (no publicados por el autor).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`). Para llama.cpp/Ollama sería necesaria una conversión a GGUF no oficial.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WIUAI.Mini.Coder.ToolCalling.Stage2 | 302M | 1.024 | Tool calling (Hermes) | Apache 2.0 | Hugging Face |
| WIUAI.Mini.Coder.ToolCalling (etapa previa) | 302M (según checkpoint base) | No disponible | Tool calling (Hermes) | Apache 2.0 (según repositorio del autor) | Hugging Face |
| Modelos pequeños tipo Qwen2.5-0.5B-Instruct | 0,5B | 32.768 | Instrucción general con soporte de tool calling | Apache 2.0 | Hugging Face |
| Modelos tipo SmolLM2-360M-Instruct | 360M | 8.192 | Instrucción general | Apache 2.0 | Hugging Face |

La comparación con alternativas de la misma escala es aproximada: no se dispone de benchmarks del modelo evaluado que permitan contrastar rendimiento real frente a Qwen2.5-0.5B-Instruct o SmolLM2-360M-Instruct. La ventaja diferencial del modelo es su especialización exclusiva en formato Hermes de tool calling y su bajo coste de entrenamiento; su desventaja es el contexto reducido (1.024 tokens) y el soporte únicamente en inglés.

## Limitaciones y advertencias

- El autor advierte que el éxito del entrenamiento no establece un rendimiento fiable en tool calling; debe evaluarse con prompts reservados y validar nombres de función y argumentos contra sus esquemas antes de ejecutar.
- Contexto muy limitado: 1.024 tokens, insuficiente para conversaciones multi-turno largas o esquemas de herramientas extensos.
- Solo inglés: no se declara soporte multilingüe.
- Riesgo de alucinación en nombres de función y argumentos; toda llamada generada debe validarse contra el esquema JSON correspondiente.
- No ejecuta herramientas ni autoriza acciones externas; cualquier uso en agentes requiere una capa de ejecución y control separada.
- Dataset de entrenamiento reducido (4.873 ejemplos aceptados) y descarte de 2.442 ejemplos por longitud, lo que puede sesgar la distribución hacia prompts cortos.
- Sin cuantizaciones oficiales publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en algunos entornos.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación de comportamiento hace desaconsejable su uso en producción sin validación previa.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/WithinUsAI/WIUAI.Mini.Coder.ToolCalling.Stage2
- Checkpoint base: https://huggingface.co/WithinUsAI/WIUAI.Mini.Coder.ToolCalling
- Dataset de entrenamiento: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
