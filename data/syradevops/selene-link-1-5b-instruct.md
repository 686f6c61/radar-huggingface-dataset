# Syradevops/Selene-Link-1.5B-Instruct

## Resumen

Selene-Link-1.5B-Instruct es un ajuste fino (fine-tuning) del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario Syradevops en Hugging Face. Se trata de un modelo de generacion de texto de tipo conversacional, construido sobre la arquitectura Qwen2 (transformer decoder-only) con 1.543.714.304 parametros totales, lo que lo situa en la franja de modelos pequenos optimizados para inferencia en hardware modesto. El modelo base declarado es la version cuantizada a 4 bits de Qwen2.5-1.5B-Instruct distribuida por Unsloth.

El modelo se ha entrenado utilizando las herramientas de Unsloth y la libreria TRL de Hugging Face, segun indica la model card del autor, lo que sugiere un proceso de fine-tuning eficiente en memoria y tiempo (el autor afirma un entrenamiento "2x mas rapido"). La licencia es Apache 2.0, heredada del modelo base, lo que permite uso comercial sin restricciones adicionales significativas.

La relevancia de este modelo radica en su tamano reducido (1.5B parametros) y su orientacion conversacional, que lo hacen adecuado para despliegues en entornos con recursos limitados, como GPUs de consumo o incluso CPU con cuantizacion agresiva. No obstante, la informacion publicada por el autor es muy escasa: no se detallan los datos de entrenamiento, el proceso de ajuste ni los resultados de evaluacion, lo que limita la capacidad de evaluar su calidad frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, pero el autor no lo especifica) |
| Tipos de cuantizacion | no disponible (el modelo base se distribuye en bnb-4bit; el repo contiene safetensors en precision completa) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct, un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El modelo base incorpora mejoras sobre Qwen2 en cuanto a datos de entrenamiento y alineacion, pero el autor no proporciona detalles sobre la configuracion exacta de capas, dimensiones ocultas o cabezas de atencion en la model card.

El proceso de fine-tuning se realizo con Unsloth y TRL, partiendo de la version cuantizada a 4 bits del modelo base (unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit). El autor no especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o SFT. Tampoco se detalla si se utilizo LoRA, QLoRA u otra tecnica de ajuste parametrizado eficiente, aunque el uso de Unsloth sugiere habitualmente QLoRA. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento basico y respuesta a instrucciones, segun las capacidades del modelo base.
- Generacion de codigo y matematicas a nivel basico, limitado por el tamano de 1.5B parametros.
- Soporte de tool calling / function calling: no documentado por el autor; el modelo base Qwen2.5 lo soporta, pero no se confirma que el fine-tuning lo preserve.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: la model card declara unicamente ingles ("en"), aunque el modelo base Qwen2.5 es multilingue; el fine-tuning podria haber reducido el soporte a otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Atencion al cliente automatizada en ingles: el modelo puede gestionar conversaciones multi-turno de dominio general, adecuado para entornos con presupuesto de computo limitado donde se despliegue en una unica GPU de consumo.
- Prototipado rapido de asistentes conversacionales: su tamano de 1.5B permite iterar rapidamente en local con llama.cpp u Ollama, sin necesidad de infraestructura dedicada.
- Generacion de texto en aplicaciones embebidas o edge: al caber en GPUs de 4-8 GB de VRAM con cuantizacion, puede integrarse en dispositivos con recursos restringidos.
- Clasificacion y extraccion de informacion en ingles: fine-tuning adicional sobre este modelo para tareas de NLP especificas (sentiment analysis, NER) es viable con recursos modestos.
- Educacion y demostraciones: util como modelo de referencia para ensenar tecnicas de fine-tuning con Unsloth y TRL en cursos o talleres.
- Generacion de codigo asistida en entornos ligeros: para autocompletado o sugerencias basicas en editores, aunque con limitaciones frente a modelos mayores.
- Chatbots de dominio especifico: si el autor realizo el fine-tuning sobre un dataset concreto (no documentado), podria especializarse en ese dominio, pero no hay informacion para confirmarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3.1 GB solo para pesos, mas overhead de activaciones y KV cache (estimacion tipica de 4-6 GB en total para contexto moderado).
- VRAM estimada en cuantizacion 4-bit (GGUF Q4_K_M): aproximadamente 1.0-1.5 GB para pesos, con un total de 2-3 GB incluyendo contexto.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4060 Ti (8/16 GB), RTX 4090 (24 GB) para FP16; cualquier GPU con 4 GB o mas para cuantizacion 4-bit.
- Cabe en GPU de consumo: si, practicamente cualquier GPU moderna con 4 GB o mas en cuantizacion, y en FP16 en GPUs de 6-8 GB.
- Opciones de despliegue: transformers (nativo), vLLM, llama.cpp, Ollama, TGI (el tag text-generation-inference esta presente), y cualquier framework compatible con safetensors.
- Latencia y throughput estimados: no disponibles; dependeran del hardware y la cuantizacion. Para un modelo de 1.5B en una RTX 4090 en FP16, se espera un throughput del orden de miles de tokens por segundo en batch, pero no hay datos publicados por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| Selene-Link-1.5B-Instruct | 1.54B | no disponible | Apache 2.0 | en | Hugging Face |
| Qwen2.5-1.5B-Instruct (base) | 1.54B | 32.768 tokens | Apache 2.0 | multilingue (29 idiomas) | Hugging Face, ampliamente usado |
| Llama-3.2-1B-Instruct | 1.24B | 128.000 tokens | Llama 3.2 Community License | multilingue | Hugging Face, requiere aceptacion de licencia |
| SmolLM2-1.7B-Instruct | 1.71B | 8.192 tokens | Apache 2.0 | en (principalmente) | Hugging Face |

El modelo de referencia mas directo es su propio modelo base, Qwen2.5-1.5B-Instruct, que ofrece contexto de 32.768 tokens y soporte multilingue documentado. Selene-Link no documenta mejoras medibles sobre el base, por lo que su ventaja competitiva no esta clara sin benchmarks. Frente a Llama-3.2-1B-Instruct, este ultimo ofrece contexto mucho mayor (128K) pero con licencia mas restrictiva. SmolLM2-1.7B-Instruct es comparable en tamano y licencia permisiva, con contexto documentado de 8.192 tokens.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset de fine-tuning, lo que impide evaluar sesgos introducidos o la calidad del ajuste.
- Riesgo de alucinacion inherente a modelos de 1.5B parametros, especialmente en tareas de razonamiento complejo o conocimiento factual.
- El autor declara unicamente soporte de ingles; el uso en castellano u otros idiomas no esta garantizado y probablemente degrade respecto al modelo base.
- No se especifica la longitud de contexto efectiva tras el fine-tuning; si se entreno con secuencias cortas, podria haber perdido capacidad de contexto largo del base.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- Modelo con 0 likes y 99 descargas en el momento de la consulta: sin validacion por parte de la comunidad, lo que desaconseja su uso en produccion sin evaluacion previa.
- El fine-tuning parte de una version cuantizada a 4 bits del base, lo que puede introducir perdida de calidad adicional respecto a un fine-tuning sobre pesos completos.
- No hay informacion sobre el proceso de alineacion (RLHF/DPO) aplicado tras el ajuste, por lo que el comportamiento conversacional puede ser inconsistente.

## Enlaces

- Hugging Face: https://huggingface.co/Syradevops/Selene-Link-1.5B-Instruct
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Documentacion TRL: https://huggingface.co/docs/trl
