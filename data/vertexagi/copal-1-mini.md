# VertexAGI/copal-1-mini

## Resumen

Copal 1 Mini es un modelo de lenguaje especializado en tool-calling y razonamiento agéntico, desarrollado por VertexAGI como proyecto de investigación independiente. Se trata de un fine-tune del modelo Gemma 3 4B IT de Google, entrenado mediante LoRA sobre un checkpoint cuantizado a 4 bits, con el objetivo de mejorar la capacidad del modelo base para decidir cuándo invocar una herramienta, seleccionar la adecuada, interpretar el resultado y continuar la conversación o responder al usuario. El modelo utiliza una convención de texto simple basada en etiquetas `<tool_call>` y `<tool_result>`, en lugar de los esquemas JSON típicos de las APIs de function-calling.

La relevancia de Copal 1 Mini radica en que ofrece una alternativa ligera y ejecutable en hardware de consumo para experimentar con agentes y automatización de tareas, sin necesidad de recurrir a modelos propietarios de gran tamaño. Está entrenado por destilación de trayectorias generadas por el modelo GLM 5.2 a través de la API NIM de NVIDIA, sobre un conjunto de 930 episodios agénticos depurados. Con una arquitectura densa decoder-only de aproximadamente 4 mil millones de parámetros (aunque los pesos liberados ocupan 711 millones de parámetros en formato cuantizado), el modelo está diseñado para ejecutarse localmente en Apple Silicon mediante MLX, y su licencia es la de los términos de uso de Gemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 (decoder-only transformer, dense) |
| Parametros totales | 711.484.928 (pesos del checkpoint liberado; el modelo base tiene ~4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredado del modelo base Gemma 3 4B IT) |
| Tipos de cuantizacion | 4-bit (QAT, mismo esquema que el checkpoint base) |
| Idiomas soportados | Ingles |
| Licencia | Gemma Terms of Use |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

Copal 1 Mini parte del checkpoint `mlx-community/gemma-3-4b-it-qat-4bit`, una versión cuantizada a 4 bits de Gemma 3 4B IT. Sobre este checkpoint se aplicó un fine-tune con LoRA de rango 8, escala 20.0 y dropout 0.0, entrenando los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` de 16 capas. El entrenamiento se realizó con MLX en Apple Silicon, usando el optimizador Adam con una tasa de aprendizaje constante de 1e-5, longitud de secuencia de 4096 tokens y gradient checkpointing. Se ejecutaron 2500 iteraciones, seleccionándose el checkpoint de la iteración 2250 por tener la menor pérdida de validación (0.236).

El conjunto de entrenamiento consistió en 930 trayectorias agénticas depuradas (de 1152 generadas originalmente), destiladas del modelo `z-ai/glm-5.2` mediante la API NIM de NVIDIA. Cada trayectoria incluye un prompt de tarea, llamadas a herramientas, resultados simulados y respuestas finales, cubriendo 10 categorías: orquestación de APIs, seguimiento de estado, selección de herramientas, planificación multi-paso, clarificación de peticiones ambiguas, recuperación de errores, decisión basada en salida de herramientas, ejecución concisa, flujos de navegador y salida estructurada. El método de entrenamiento fue supervisado (SFT) sin RLHF ni DPO.

## Capacidades

- Tool-calling y function-calling mediante una convención de texto propia: el modelo emite bloques `<tool_call>` con JSON interno y espera `<tool_result>` como siguiente turno.
- Razonamiento agéntico multi-paso: puede encadenar varias llamadas a herramientas, interpretar resultados y decidir si continuar actuando o responder en texto plano.
- Selección de herramientas: entrenado para elegir la herramienta adecuada entre varias opciones en función del contexto.
- Manejo de errores: capacidad de recuperarse de fallos en la ejecución de herramientas y de reconocer peticiones subespecificadas pidiendo aclaraciones.
- Generación de salida estructurada: puede producir respuestas en formatos concretos cuando la tarea lo requiere.
- Multilingüe: limitado al inglés, aunque hereda parcialmente las capacidades multilingües del modelo base Gemma 3 4B IT (no garantizado).

## Casos de uso

- Orquestación de APIs: el modelo puede recibir una petición que requiera consultar varios endpoints, decidir qué llamadas realizar, interpretar las respuestas y sintetizar un resultado final. Es adecuado porque su entrenamiento incluye categorías de orquestación y flujos multi-paso.
- Automatización de tareas de oficina: por ejemplo, consultar un calendario, comprobar disponibilidad y reservar una reunión, mediante herramientas simuladas. Su formato de tool-calling permite integrarse en scripts locales.
- Agentes de atención al cliente en entornos controlados: puede gestionar conversaciones multi-turno donde necesite consultar una base de conocimientos o un sistema de tickets, aunque no está recomendado para producción.
- Investigación en agentes y tool-use: al ser un modelo pequeño y ejecutable en hardware de consumo, sirve para experimentar con bucles agénticos, evaluación de llamadas a herramientas y destilación de comportamientos.
- Prototipado rápido de asistentes con herramientas en Apple Silicon: gracias a su soporte nativo MLX, se puede integrar en aplicaciones macOS o iOS sin necesidad de GPU dedicada.
- Generación de salida estructurada en flujos de datos: puede producir JSON u otros formatos estructurados como parte de un pipeline de procesamiento, aprovechando su entrenamiento en salidas estructuradas.

## Benchmarks y rendimiento

El autor evaluó el modelo frente al base sin ajustar (Gemma 3 4B IT) en 12 tareas agénticas no vistas durante el entrenamiento, usando el mismo entorno de herramientas simulado y la misma semilla RNG para ambas variantes:

| Metrica | Base (Gemma 3 4B IT) | Copal 1 Mini |
|---|---|---|
| Uso de herramientas cuando procede | 8 / 12 | 11 / 12 |
| Errores de parseo de llamadas | 0 | 0 |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- El checkpoint liberado pesa 2.6 GB, lo que sugiere que la inferencia en 4-bit requiere aproximadamente 2.5-3 GB de VRAM (estimación razonable para un modelo de 4B cuantizado a 4 bits, aunque no se indica oficialmente).
- Al estar en formato MLX, está optimizado para Apple Silicon (M1/M2/M3/M4). Se puede ejecutar en Macs con al menos 8 GB de RAM unificada.
- En GPUs consumer, el modelo podría ejecutarse mediante vLLM u otros frameworks que soporten safetensors, pero no se proporcionan datos de latencia o throughput.
- No se indican GPUs recomendadas específicas; por su tamaño, cabría en una RTX 3060 de 12 GB o similar, aunque no hay confirmación oficial.
- Opciones de despliegue: MLX (nativo), llama.cpp (si se convierte a GGUF), vLLM, Ollama (si se añade soporte), TGI (con adaptación).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Copal 1 Mini | ~4B (base) | No disponible | Gemma Terms | Tool-calling agéntico |
| Gemma 3 4B IT (base) | ~4B | 32k (segun documentacion oficial, no confirmado en esta ficha) | Gemma Terms | Chat general, tool-calling limitado |
| Qwen 2.5 3B Instruct | ~3B | 32k | Apache 2.0 | Chat y tool-calling estandar (JSON schema) |
| Llama 3.2 3B Instruct | ~3B | 128k | Llama 3.2 Community | Chat, tool-calling estandar |

La comparativa se basa en datos generales de los modelos; no se dispone de benchmarks comunes para comparar rendimiento agéntico. Copal 1 Mini se distingue por su formato de tool-calling propio y su entrenamiento especifico en trayectorias agénticas destiladas de un modelo mayor.

## Limitaciones y advertencias

- Entrenado con un conjunto de datos pequeño (930 ejemplos) y generado sinteticamente, por lo que su comportamiento puede ser inconsistente fuera de las categorias representadas.
- Destilado de un unico modelo profesor (GLM 5.2) sin revision humana de todas las trayectorias; puede heredar sesgos o errores ocasionales del profesor.
- Utiliza un formato de tool-calling personalizado basado en texto, no compatible con APIs que esperan esquemas OpenAI-style JSON; requiere adaptar el harness.
- Hereda las limitaciones generales y el corte de conocimiento del modelo base Gemma 3 4B IT.
- Solo soporta ingles; el rendimiento en otros idiomas no esta garantizado.
- No esta recomendado para uso en produccion, tareas de alto riesgo o entornos de seguridad critica.
- Es un checkpoint de primera generacion en una serie en desarrollo; puede haber mejoras posteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VertexAGI/copal-1-mini
- Perfil del autor en HuggingFace: https://huggingface.co/VertexAIco/models
- Anuncio en X: https://x.com/vertexagi
- Discusion sobre soporte de inferencia: https://huggingface.co/spaces/huggingface/InferenceSupport/discussions/11785
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Checkpoint base cuantizado: https://huggingface.co/mlx-community/gemma-3-4b-it-qat-4bit
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
