# tinyopsec/Llama-3-6B-Instruct-pruned-GGUF

## Resumen

Llama-3-6B-Instruct-pruned es una versión recortada (pruned) del modelo Meta-Llama-3-8B-Instruct de Meta, reducido de 8B a aproximadamente 6,29B parámetros mediante la técnica PruneMe implementada con mergekit. El autor tinyopsec publica en este repositorio las cuantizaciones en formato GGUF del checkpoint original `kuotient/Llama-3-6B-Instruct-pruned`, generadas con llama.cpp. El objetivo del modelo es ofrecer un derivado de Llama 3 más ligero y rápido en inferencia, apto para hardware de consumo, manteniendo las capacidades conversacionales del modelo base.

El proceso de poda elimina capas intermedias del transformer: el modelo conserva las capas 0-20 y las 29-31 del original, descartando las capas 21-28. Es importante señalar que se trata de un modelo experimental sin post-training healing (sin reentrenamiento de recuperación tras la poda), lo que implica una posible degradación de calidad respecto al modelo original. Su relevancia radica en la exploración de técnicas de compresión estructural de LLMs y en su utilidad como base ligera para entornos con recursos limitados, aunque requiere evaluación previa antes de uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 3), podado estructuralmente (eliminación de capas 21-28) |
| Parametros totales | 6.285.365.248 (~6,29B) |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | no disponible (el original Llama 3 8B usa 8.192 tokens, pero no consta en la ficha) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible (hereda del base model, principalmente inglés) |
| Licencia | Meta Llama 3 Community License |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Meta-Llama-3-8B-Instruct, un transformer decoder autorregresivo de la familia Llama 3. La innovación principal de este derivado no está en la arquitectura original sino en el proceso de poda estructural: mediante PruneMe y mergekit se eliminaron las capas 21 a 28 del bloque transformer, quedando 24 capas (0-20 y 29-31) y reduciendo el número de parámetros de 8B a ~6,29B. Esta técnica de "layer pruning" aprovecha la observación de que las capas intermedias de los transformers profundos a menudo contienen redundancia funcional.

No se dispone de información sobre un proceso de entrenamiento o fine-tuning posterior a la poda: el autor indica explícitamente que se trata de un modelo experimental sin post-training healing, es decir, no hubo una fase de recuperación con datos adicionales para compensar la pérdida de capacidad tras eliminar capas. Tampoco se especifican datos sobre tokens de entrenamiento, composición del dataset ni técnicas como RLHF o DPO aplicadas al derivado (las del modelo base de Meta no se detallan en la ficha).

## Capacidades

- Generación de texto conversacional en formato instruct, heredada de Meta-Llama-3-8B-Instruct (etiquetado como "conversational" en HuggingFace).
- Razonamiento general y seguimiento de instrucciones, potencialmente degradado por la poda de capas y la ausencia de healing.
- Compatibilidad con el stack de herramientas del ecosistema GGUF: llama.cpp, Ollama, LM Studio, koboldcpp y runtimes equivalentes.
- No hay información sobre soporte de tool calling / function calling, capacidades de visión o audio, ni modo de razonamiento extendido (thinking mode).
- Capacidades multilingües: no disponibles en la ficha; el modelo base Llama 3 está optimizado principalmente para inglés.

## Casos de uso

- Experimentación con poda de modelos: ideal para investigadores que quieran estudiar el impacto de la eliminación de capas en LLMs sin coste de entrenamiento, comparando salidas contra el modelo original de 8B.
- Inferencia local en hardware de consumo: con ~6,29B parámetros y cuantización Q4_K_M, el modelo cabe en GPUs domésticas de 8 GB de VRAM, útil para chatbots locales y asistentes personales offline.
- Prototipado rápido con Ollama o LM Studio: al estar en GGUF, puede descargarse y ejecutarse en minutos en portátiles y estaciones de trabajo sin configuración compleja.
- Despliegue en servidores de gama baja o edge: la reducción del 21% en parámetros respecto al original reduce la VRAM y mejora el throughput, adecuado para nodos con GPUs modestas o CPU con aceleración parcial.
- Base para fine-tuning ligero (LoRA/QLoRA): su menor tamaño reduce los requisitos de memoria para ajustes posteriores en dominios concretos, aunque conviene validar primero la calidad del checkpoint.
- Evaluación de trade-offs calidad/velocidad: útil como punto de comparación en benchmarks internos entre modelos podados y destilados de tamaño similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El propio autor advierte que el modelo es experimental y carece de post-training healing, por lo que recomienda evaluarlo antes de su uso.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo F16 ocupa 12,6 GB; las cuantizaciones de 4 bits (Q4_K_M/Q4_K_S) deberían rondar aproximadamente 3,5-4,5 GB (estimación basada en el tamaño de parámetros, no confirmada en la ficha); Q8_0 alrededor de 6,5-7 GB. El tamaño total del repositorio es de 61,0 GB.
- GPU recomendadas: no disponible explícitamente. Por tamaño estimado, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB cubrirían con holgura las cuantizaciones de 4-8 bits; para F16 convendría una GPU con 16-24 GB (RTX 4090, RTX 3090).
- Cabe en consumer GPU: sí, en cuantizaciones de 4 y 5 bits cabe en GPUs de 8 GB de VRAM (RTX 3060 Ti, RTX 4060); también es ejecutable en CPU pura con llama.cpp a velocidades reducidas.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. No se menciona soporte para vLLM o TGI, que requieren formatos safetensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tinyopsec/Llama-3-6B-Instruct-pruned-GGUF | ~6,29B | no disponible (base: 8.192) | Llama 3 Community | GGUF | Poda de capas sin healing; experimental |
| meta-llama/Meta-Llama-3-8B-Instruct | 8B | 8.192 tokens | Llama 3 Community | safetensors | Modelo base completo, calidad de referencia |
| kuotient/Llama-3-6B-Instruct-pruned | ~6,29B | no disponible | no disponible | safetensors (presumible) | Checkpoint original pre-cuantización del que deriva este repo |
| Mistral-7B-Instruct-v0.2 | 7B | 32.768 tokens | Apache 2.0 | safetensors/GGUF | Alternativa de tamaño similar con licencia permisiva y contexto mayor |

## Limitaciones y advertencias

- Modelo experimental sin post-training healing: la eliminación de las capas 21-28 puede causar degradación significativa en coherencia, razonamiento y seguimiento de instrucciones. El propio autor recomienda evaluar antes de usar.
- Riesgo de alucinación: no cuantificado, pero probablemente igual o superior al del modelo base Llama 3 8B Instruct dada la falta de recuperación tras la poda.
- Sesgos: hereda los sesgos del dataset de preentrenamiento y alineación de Meta Llama 3, principalmente centrado en inglés y contenido web en inglés.
- Idioma: sin confirmación de soporte multilingüe; el rendimiento en castellano no está documentado y puede ser inferior al del modelo original.
- Contexto: la longitud de contexto no está confirmada para el derivado; aunque Llama 3 soporta 8.192 tokens, la poda de capas podría afectar al manejo de contextos largos.
- Licencia: el uso está ligado a la Meta Llama 3 Community License, que impone condiciones como la atribución ("Built with Meta Llama 3") y restricciones para ciertos usos y para entidades con más de 700 millones de usuarios activos mensuales.
- Descargas y adopción muy limitadas (527 descargas, 0 likes en el momento de la ficha), sin comunidad de validación amplia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tinyopsec/Llama-3-6B-Instruct-pruned-GGUF
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Checkpoint original podado: https://huggingface.co/kuotient/Llama-3-6B-Instruct-pruned
- mergekit (herramienta de poda/merge): https://github.com/arcee-ai/mergekit
- llama.cpp: https://github.com/ggerganov/llama.cpp
