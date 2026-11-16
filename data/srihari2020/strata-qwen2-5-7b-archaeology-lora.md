# Srihari2020/Strata-Qwen2.5-7B-Archaeology-LoRA

## Resumen

Strata-Qwen2.5-7B-Archaeology-LoRA es un ajuste fino mediante QLoRA del modelo Qwen2.5-7B-Instruct, publicado por el usuario Srihari2020 en Hugging Face. El modelo está especializado en arqueología y ha sido entrenado para actuar como motor de generación dentro de un pipeline de Retrieval-Augmented Generation (RAG) apoyado en ChromaDB y en el embedder `BAAI/bge-large-en-v1.5`. Su objetivo declarado es adoptar el tono de un arqueólogo experto, priorizar el contexto vectorial suministrado y rechazar la generación de hechos históricos cuando no hay documentos de respaldo.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct, con 7.615.616.512 parámetros totales y pesos en formato safetensors. Según la model card, el ajuste se realizó con Unsloth y QLoRA sobre una GPU NVIDIA RTX 5060 de 8 GB, lo que lo convierte en un ejemplo de especialización vertical de bajo coste computacional.

Su relevancia radica en el enfoque: no busca competir en capacidades generales, sino reducir la tasa de alucinación en dominios históricos mediante anclaje estricto al contexto recuperado. No obstante, el repositorio no incluye información sobre composición del dataset, número de tokens de entrenamiento ni evaluación independiente, y las métricas publicadas (MMLU 74.2, GSM8K 84.5) no vienen acompañadas de metodología.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (configurado en el ejemplo de uso; el modelo base Qwen2.5-7B-Instruct soporta hasta 131.072 tokens, pero no se confirma en este ajuste) |
| Tipos de cuantizacion | 4-bit (QLoRA / load_in_4bit en Unsloth); no se documentan otras |
| Idiomas soportados | no disponible (la model card no especifica; el modelo base Qwen2.5 es multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only con atención por ventanas deslizantes y RoPE, y se ajusta mediante QLoRA con la librería Unsloth. No se especifica el rango de LoRA, el alpha, el learning rate ni el número de pasos. El entrenamiento se realizó en una NVIDIA RTX 5060 con 8 GB de VRAM, lo que confirma el uso de cuantización de 4 bits durante el ajuste.

El dataset de entrenamiento se denomina `custom-archaeology-deep-web`, pero no se publica su composición, tamaño, procedencia de las fuentes ni procesos de filtrado. La model card menciona que el modelo fue entrenado para "priorizar el contexto vectorial suministrado" y "rechazar alucinaciones históricas", lo que sugiere un conjunto de datos orientado a instrucciones con contexto recuperado y ejemplos negativos de rechazo, pero no hay detalle técnico verificable. No se documenta el uso de RLHF, DPO ni ninguna innovación arquitectónica adicional más allá del ajuste QLoRA.

## Capacidades

- Generación de texto especializada en arqueología e historia, con tono de experto.
- Anclaje estricto al contexto recuperado en pipelines RAG: el modelo está entrenado para responder a partir de documentos vectoriales suministrados.
- Rechazo explícito de respuestas cuando no hay fuentes: la model card declara una "tasa de alucinación casi nula" gracias al grounding vectorial, aunque no se aporta metodología de medición.
- Integración con ChromaDB y el embedder `BAAI/bge-large-en-v1.5` como stack recomendado.
- Inferencia optimizada con Unsloth `FastLanguageModel` en 4 bits.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Asistente de investigación arqueológica: el modelo se integra en un pipeline RAG con ChromaDB para responder consultas sobre yacimientos, cronologías y culturas materiales, citando los documentos recuperados y rechazando responder cuando no hay fuente.
- Catalogación y descripción de materiales: dado un contexto documental sobre tipologías cerámicas o líticas, el modelo genera descripciones técnicas con terminología arqueológica consistente.
- Atención a estudiantes de arqueología: chatbot de apoyo que responde dudas de temario anclándose a apuntes y manuales indexados en la base vectorial, evitando inventar datos cronológicos.
- Redacción de informes de excavación asistida: el modelo puede estructurar borradores de memorias a partir de fichas de registro y contextos recuperados, manteniendo el tono formal de la disciplina.
- Despliegue local en entornos con recursos limitados: gracias a la cuantización 4-bit y al ajuste QLoRA, puede ejecutarse en GPUs de consumo con 8 GB de VRAM, útil para investigadores sin acceso a clústeres.
- Filtro de verificación factual en publicaciones: uso como segunda pasada para detectar afirmaciones históricas no respaldadas por las fuentes indexadas, aprovechando su entrenamiento orientado al rechazo.
- Prototipado de asistentes verticales: sirve como plantilla para replicar el enfoque QLoRA + RAG en otros dominios científicos con presupuesto reducido.

## Benchmarks y rendimiento

| Benchmark | Strata-Qwen2.5-7B-Archaeology-LoRA |
|---|---|
| MMLU | 74.2 |
| GSM8K | 84.5 |
| Tasa de alucinación | "casi nula" según el autor (sin metodología) |

No se han publicado resultados de benchmarks independientes ni comparaciones con el modelo base en la información disponible. Las cifras de MMLU y GSM8K provienen únicamente de la model card y no se especifica el harness de evaluación, el número de shots ni la versión del benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia en 4 bits: aproximadamente 5-6 GB para los pesos, más overhead de contexto; viable en GPUs de 8 GB.
- VRAM estimada en FP16: en torno a 15-16 GB, requiere GPU de 24 GB o superior para margen de contexto.
- GPU recomendadas: RTX 5060 (usada en el entrenamiento), RTX 4060 Ti 16 GB, RTX 4090, A100, H100 para despliegues con contexto largo o concurrencia.
- Cabe en GPU de consumo: sí, en 4 bits en tarjetas con 8 GB o más (RTX 3060 12 GB, RTX 4060, RTX 5060).
- Opciones de despliegue: Unsloth `FastLanguageModel` (recomendado por el autor), llama.cpp, Ollama, vLLM y TGI para pesos convertidos a GGUF o con soporte Qwen2.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Strata-Qwen2.5-7B-Archaeology-LoRA | 7,6 B | 8192 configurado | Arqueología + RAG | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | hasta 131.072 tokens | Generalista | Apache 2.0 | Hugging Face (ampliamente usado) |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.768 tokens | Generalista | Apache 2.0 | Hugging Face |
| Llama-3.1-8B-Instruct | 8,0 B | 128.000 tokens | Generalista | Llama 3.1 Community | Hugging Face |

La comparación directa con el modelo base es la más relevante: Strata hereda las capacidades de Qwen2.5-7B-Instruct pero las restringe al dominio arqueológico y al uso con contexto recuperado. Frente a Mistral-7B y Llama-3.1-8B, ofrece especialización vertical a costa de generalidad y de un contexto configurado mucho menor en el ejemplo publicado.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y no consta validación independiente; el modelo debe considerarse experimental.
- No se publica la composición del dataset `custom-archaeology-deep-web` ni los criterios de filtrado, lo que impide auditar sesgos históricos o geográficos.
- Las métricas de MMLU y GSM8K no incluyen metodología; la afirmación de "tasa de alucinación casi nula" no está respaldada por una evaluación reproducible.
- El ajuste está orientado a RAG: fuera de un pipeline con contexto recuperado, su comportamiento puede degradarse o rechazar respuestas de forma excesiva.
- El contexto configurado en el ejemplo es de 8192 tokens, muy inferior al máximo del modelo base; no se confirma si el ajuste preserva la ventana completa.
- No se especifican los idiomas soportados; aunque el modelo base es multilingüe, el ajuste podría haber priorizado el inglés.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre exactitud factual en producción.
- Ausencia de información sobre tool calling y agentes: no debe asumirse soporte nativo.

## Enlaces

- Hugging Face: https://huggingface.co/Srihari2020/Strata-Qwen2.5-7B-Archaeology-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- ChromaDB: https://www.trychroma.com/
- Embedder BAAI/bge-large-en-v1.5: https://huggingface.co/BAAI/bge-large-en-v1.5
