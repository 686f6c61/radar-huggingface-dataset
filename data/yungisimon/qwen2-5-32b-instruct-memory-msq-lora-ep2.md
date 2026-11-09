# yungisimon/Qwen2.5-32B-Instruct-memory-msq-lora-ep2

## Resumen

`yungisimon/Qwen2.5-32B-Instruct-memory-msq-lora-ep2` es un ajuste fino del modelo Qwen2.5-32B-Instruct de Alibaba, publicado por el usuario yungisimon en Hugging Face. Se trata de un modelo derivado orientado a tareas de memoria y recuperación de información en contextos multi-documento, entrenado sobre pares sintéticos de pregunta-respuesta generados a partir del conjunto de datos MuSiQue. El checkpoint publicado corresponde a la época 2 de un entrenamiento de 3 épocas, con el adaptador LoRA fusionado en los pesos base.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5-32B-Instruct, con 32.763.876.352 parámetros totales (aproximadamente 32,8 mil millones) en precisión bf16. El ajuste se realizó mediante LoRA con rango 32 y alpha 64 sobre los módulos de atención y MLP, con 268.435.456 parámetros entrenables (0,81 % del total). La longitud máxima de secuencia durante el entrenamiento fue de 8096 tokens.

La relevancia de este modelo radica en su especialización: frente al modelo base, se ha entrenado explícitamente para responder preguntas que requieren integrar información dispersa en múltiples documentos, un escenario habitual en sistemas RAG y en tareas de razonamiento sobre corpus extensos. No obstante, se trata de una publicación con cero descargas y cero interacciones en el momento de redactar esta ficha, sin benchmarks publicados ni documentación adicional sobre evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 32.763.876.352 (~32,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8096 tokens (longitud máxima usada en entrenamiento; el modelo base Qwen2.5-32B-Instruct soporta hasta 131.072 tokens, aunque no se confirma que se conserve tras el ajuste) |
| Tipos de cuantizacion | No disponible (los pesos publicados son bf16 safetensors; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (bf16); adaptador LoRA sin fusionar en `lora_adapter/` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-32B-Instruct, un transformer decoder-only denso con atención causal estándar y RoPE para codificación posicional. El ajuste se realizó con LoRA de rango 32, alpha 64 y dropout 0,05 aplicado sobre las proyecciones q, k, v, o, gate, up y down. Los parámetros entrenables ascendieron a 268.435.456 (0,81 % del total). El entrenamiento usó precisión bf16 con checkpointing de gradientes y cálculo de pérdida únicamente sobre los tokens del asistente.

El conjunto de datos de entrenamiento es `msq_subset1000_numsamplingepochs1_crossdoc_entity_combination_v3.json`, con 664.608 ejemplos sintéticos de pregunta-respuesta construidos a partir de MuSiQue, un benchmark de QA multi-salto y multi-documento. Se entrenaron 3 épocas con batch efectivo de 256 (32 por dispositivo, 1 acumulación, 8 GPUs), learning rate constante de 0,0002 con warmup del 5 %, weight decay 0,01 y max grad norm 1,0. El entrenamiento completo de 3 épocas requirió 4,46 horas de reloj (35,6 GPU-horas) sobre 8 AMD Instinct MI325X. El checkpoint publicado corresponde a la época 2. No se documenta uso de RLHF, DPO ni otras técnicas de alineación posteriores al ajuste supervisado.

## Capacidades

- Generación de texto conversacional en formato chat (plantilla de Qwen).
- Respuesta a preguntas que requieren integración de información dispersa en múltiples documentos (especialización principal del ajuste).
- Razonamiento multi-salto sobre contexto documental, derivado del entrenamiento con MuSiQue.
- Capacidades heredadas del modelo base Qwen2.5-32B-Instruct: generación de código, matemáticas, razonamiento general y soporte multilingüe (aunque no se confirma que se conserven íntegras tras el ajuste).
- Soporte de tool calling y function calling: no documentado en la model card; se desconoce si se preserva tras el ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado específicamente.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Sistemas RAG multi-documento: el modelo está entrenado para responder preguntas cuyas evidencias están repartidas en varios documentos, lo que lo hace adecuado como generador final en pipelines de recuperación aumentada donde la respuesta requiere sintetizar fragmentos de distintas fuentes.
- Atención al cliente sobre base de conocimiento: puede gestionar conversaciones multi-turno apoyadas en documentación corporativa dispersa, integrando información de manuales, FAQs y políticas internas en una sola respuesta.
- Análisis de expedientes y documentación legal: útil para responder consultas que exigen cruzar cláusulas o datos presentes en varios contratos o informes, un escenario análogo al de MuSiQue.
- Asistencia en investigación documental: permite formular preguntas de seguimiento sobre corpus académicos o técnicos donde la respuesta no está en un único pasaje.
- Extracción de hechos con verificación cruzada: adecuado para tareas donde se debe confirmar un dato contrastando varias fuentes antes de responder.
- Prototipado de asistentes especializados en memoria: sirve como punto de partida para experimentar con modelos ajustados a tareas de memoria y recuperación, dado que el adaptador LoRA sin fusionar está disponible para inspección o reutilización.
- Evaluación comparativa de ajustes LoRA sobre Qwen2.5-32B: útil en entornos de investigación para medir el efecto de un ajuste supervisado especializado frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 65,5 GB solo para pesos (32,76 B × 2 bytes), más overhead de activaciones y KV cache; en la práctica se recomienda 80 GB o más para contexto largo.
- VRAM estimada en cuantización de 8 bits: ~33 GB de pesos; en 4 bits: ~16,5 GB de pesos (no se publican versiones cuantizadas oficiales, pero podrían generarse con herramientas estándar).
- GPU recomendadas: A100 80 GB, H100 80 GB, MI325X (usada en entrenamiento); para bf16 se requiere al menos una GPU de 80 GB o reparto multi-GPU.
- GPU de consumo: no cabe en bf16 en RTX 4090 (24 GB). En cuantización de 4 bits podría caber en RTX 4090 o RTX 3090 (24 GB), aunque con contexto reducido y sin validación oficial.
- Opciones de despliegue: `transformers` (carga directa con `AutoModelForCausalLM.from_pretrained`), text-generation-inference (el repo está marcado como `endpoints_compatible`), vLLM y llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-32B-Instruct-memory-msq-lora-ep2 | ~32,8 B | 8096 (entrenamiento) | QA multi-documento (MuSiQue) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-32B-Instruct | ~32,8 B | 131.072 | Propósito general, chat | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-72B-Instruct | ~72 B | 131.072 | Propósito general, chat | Apache 2.0 (con condiciones para algunos tamaños) | Hugging Face |
| Meta-Llama-3.1-70B-Instruct | ~70 B | 128.000 | Propósito general, chat | Llama 3.1 Community License | Hugging Face |

El modelo aquí descrito es un derivado especializado del primero de la tabla; no se dispone de datos de rendimiento comparativo que permitan afirmar mejoras medibles frente al base en tareas generales o específicas.

## Limitaciones y advertencias

- No se han publicado evaluaciones ni benchmarks: se desconoce si el ajuste mejora, mantiene o degrada las capacidades del modelo base en tareas generales.
- Riesgo de sobreajuste al formato de MuSiQue: el entrenamiento con 664.608 ejemplos sintéticos de un único benchmark puede reducir la generalización a otros dominios o estilos de pregunta.
- Riesgo de alucinación: como todo modelo generativo, puede inventar hechos, especialmente al integrar información de múltiples documentos; no se documenta ningún mecanismo de citación o verificación.
- Idiomas soportados no documentados: se desconoce si el ajuste conserva el multilingüismo del base Qwen2.5.
- Contexto efectivo limitado a 8096 tokens en entrenamiento: aunque el base soporta 131.072, no se garantiza que el modelo ajustado mantenga buen rendimiento más allá de la longitud vista durante el ajuste.
- Publicación con cero descargas y cero interacciones: no hay validación comunitaria ni reportes de uso en producción.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del modelo base Qwen2.5-32B-Instruct, que también es Apache 2.0.
- Checkpoint intermedio (época 2 de 3): no es el resultado final del entrenamiento, lo que puede implicar un estado no óptimo.
- No se documenta soporte de tool calling ni comportamiento en modo agente tras el ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-32B-Instruct-memory-msq-lora-ep2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Dataset MuSiQue (referencia del benchmark usado para generar los datos): no se proporciona enlace en la model card
- Paper de MuSiQue: no disponible en la información proporcionada
- Repositorio de código o demo: no disponible
