# xtools-at/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic

## Resumen

Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic es un modelo de lenguaje multimodal (image-text-to-text) de 27.356 millones de parámetros, publicado por el usuario xtools-at en Hugging Face. Se trata de una versión "decensored" o "abliterated" del modelo xtools-at/Qwen3.8-27B-CodeForge-3xMerge, obtenida mediante la herramienta Heretic v2.1.0.dev0, que aplica una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas 32 a 63 del transformer para reducir los comportamientos de rechazo del modelo original.

El modelo base es a su vez un merge ponderado de tres fine-tunes independientes de Qwen3.8-27B: nerkyor/Qwen3.8-27B-Coder390-EfficientThink (peso 1.00), TeichAI/Qwen3.8-27B-Fable-Distill (peso 0.85) y Jackrong/Qwopus3.8-27B-Coder-Flash (peso 0.70). El objetivo del merge es combinar capacidades de codificación, razonamiento estructurado, pensamiento eficiente y destilación conversacional en un único modelo de propósito general.

La relevancia de esta versión concreta radica en su reducción drástica de rechazos (de 95/100 en el modelo original a 11/100) manteniendo una divergencia KL baja (0.0128) respecto al original, lo que sugiere que la ablación preserva en gran medida el comportamiento del modelo base. La licencia es Apache 2.0 y los idiomas declarados son inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8, pipeline image-text-to-text; detalles internos no disponibles) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El modelo se distribuye en safetensors (BF16); existen cuantizaciones/GGUFs publicadas por la comunidad bajo el tag `base_model:quantized:xtools-at/Qwen3.8-27B-CodeForge-3xMerge` (tipos concretos no especificados) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); GGUFs comunitarios disponibles |

## Arquitectura y entrenamiento

El modelo es el resultado de un proceso en dos etapas. Primero, un merge ponderado de tres checkpoints derivados de Qwen3.8-27B: Coder390 EfficientThink de nerkyor (peso 1.00), Fable Distill de TeichAI (peso 0.85) y Qwopus Coder Flash de Jackrong (peso 0.70). El contribuyente principal, Coder390 EfficientThink, se entrenó con múltiples rondas de SFT y RLOO, con trayectorias de profesor generadas por Opus 5.5, GPT-6 Astra, DeepSeek V4 Pro y K3, e incluye componentes de decodificación especulativa MTP y DFlash2. El objetivo EfficientThink busca reducir bucles de razonamiento improductivos sin eliminar la capacidad de razonar en profundidad. Fable Distill aporta destilación conversacional y de conocimiento, y Qwopus Coder Flash contribuye capacidades de codificación y agentic.

Segundo, sobre ese merge se aplica Heretic v2.1.0.dev0, una técnica de ablación de rangos arbitrarios (ARA) que opera sobre las capas 32 a 63 con los parámetros `preserve_good_behavior_weight=0.9540`, `steer_bad_behavior_weight=0.0001`, `overcorrect_relative_weight=0.2984` y `neighbor_count=11`. Los pesos se cargan en cuantización BNB 4-bit durante el proceso, y el adaptador LoRA de 16 bits resultante se fusiona de nuevo en el modelo BF16. El proceso es reproducible y el repositorio incluye un directorio `reproduce` con instrucciones.

## Capacidades

- Generación de texto y razonamiento multi-step, con un modo de "pensamiento eficiente" orientado a evitar cadenas de razonamiento excesivamente largas.
- Generación y comprensión de código (coding, code-generation), herencia directa de los contribuyentes Coder390 y Qwopus.
- Procesamiento de imagen y texto (pipeline image-text-to-text), según declara la model card.
- Tool calling y function calling, según los tags `tool-use` y `agentic`.
- Capacidades agénticas y de razonamiento multi-paso.
- Seguimiento de instrucciones (instruction-following) reforzado por la destilación conversacional de Fable Distill.
- Multilingüe limitado a inglés y chino.
- Comportamiento "decensored": reducción de rechazos de 95/100 a 11/100 respecto al modelo original.

## Casos de uso

- Generación de código en producción: el modelo hereda especialización en coding de dos de sus tres contribuyentes y puede integrarse en pipelines de revisión o generación asistida, aunque requiere validación humana por su naturaleza decensored.
- Agentes autónomos con tool calling: los tags `agentic` y `tool-use` indican soporte para orquestación de herramientas, adecuado para flujos de automatización multi-paso.
- Asistencia conversacional técnica: la destilación de Fable Distill aporta comportamiento conversacional y conocimiento general, útil para chatbots de soporte a desarrolladores.
- Análisis de imágenes con texto asociado: el pipeline image-text-to-text permite tareas de descripción, extracción de información o VQA, aunque la model card no detalla el alcance exacto de la visión.
- Investigación sobre alineación y ablación: el modelo es reproducible y documenta sus parámetros ARA, lo que lo hace útil para estudiar los efectos de la eliminación de rechazos sobre el comportamiento.
- Experimentación con razonamiento eficiente: el objetivo EfficientThink lo hace adecuado para comparar coste de razonamiento frente a calidad en tareas de matemáticas y lógica.
- Fine-tuning posterior en dominios específicos: al ser Apache 2.0 y estar en safetensors, puede servir como base para adaptaciones con LoRA o SFT.

## Benchmarks y rendimiento

La model card solo publica métricas del proceso de ablación, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos (Refusals) | 11/100 | 95/100 |
| Divergencia KL | 0.0128 | 0 (por definición) |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 80 GB para contexto moderado.
- VRAM estimada en cuantización 4-bit (si se usan GGUFs comunitarios): en torno a 15-18 GB, lo que permite ejecución en GPUs consumer de gama alta.
- GPU recomendadas: A100 80GB, H100 80GB o múltiples RTX 4090 (24 GB) para BF16; una única RTX 4090 o RTX 3090 es viable con cuantización 4-bit.
- Cabe en GPU consumer: sí, con cuantización (RTX 4090, RTX 3090, posiblemente RTX 4080 con cuantizaciones más agresivas).
- Opciones de despliegue: transformers (librería declarada), vLLM, llama.cpp u Ollama si se emplean los GGUFs comunitarios; TGI no está confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic) | 27,36B | no disponible | Apache 2.0 | Merge de 3 fine-tunes + ablación Heretic |
| xtools-at/Qwen3.8-27B-CodeForge-3xMerge (original) | 27,36B | no disponible | Apache 2.0 | Sin ablación; 95/100 rechazos |
| nerkyor/Qwen3.8-27B-Coder390-EfficientThink | no disponible | no disponible | no disponible | Contribuyente principal; SFT + RLOO, MTP/DFlash2 |
| TeichAI/Qwen3.8-27B-Fable-Distill | no disponible | no disponible | no disponible | Contribuyente conversacional |
| Jackrong/Qwopus3.8-27B-Coder-Flash | no disponible | no disponible | no disponible | Contribuyente coding/agentic |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo decensored/abliterated: la reducción de rechazos implica que puede generar contenido que el modelo original bloquearía; requiere moderación externa en producción.
- Riesgo de alucinación inherente a los modelos de 27B y acentuado por la destilación de trayectorias sintéticas de profesores.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto no especificada en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo tras la ablación.
- El proceso de ablación puede degradar sutilmente capacidades no medidas; la divergencia KL de 0.0128 es baja pero no nula.
- Los benchmarks publicados se limitan a métricas de rechazo y KL; no hay evidencia de rendimiento en tareas estándar.
- El repositorio ocupa 55,6 GB, lo que exige almacenamiento y ancho de banda considerables.
- La fecha de creación (2026-11-04) y los nombres de modelos profesor (Opus 5.5, GPT-6 Astra) deben tratarse con cautela; no se ha verificado su existencia fuera de la model card.

## Enlaces

- Hugging Face: https://huggingface.co/xtools-at/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic
- Modelo base: https://huggingface.co/xtools-at/Qwen3.8-27B-CodeForge-3xMerge
- Cuantizaciones/GGUFs: https://huggingface.co/models?other=base_model:quantized:xtools-at/Qwen3.8-27B-CodeForge-3xMerge
- Contribuyente 1: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
- Contribuyente 2: https://huggingface.co/TeichAI/Qwen3.8-27B-Fable-Distill
- Contribuyente 3: https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash
- Dataset Fable coding: https://huggingface.co/datasets/armand0e/claude-fable-5-claude-code
- Dataset Fable chat: https://huggingface.co/datasets/armand0e/Fable-5-Chat
- Heretic: https://heretic-project.org
- Perfil del autor: https://huggingface.co/xtools-at
