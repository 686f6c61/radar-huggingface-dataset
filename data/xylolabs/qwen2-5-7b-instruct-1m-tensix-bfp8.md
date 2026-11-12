# Xylolabs/Qwen2.5-7B-Instruct-1M-Tensix-BFP8

## Resumen

Xylolabs/Qwen2.5-7B-Instruct-1M-Tensix-BFP8 es una cuantización del modelo Qwen2.5-7B-Instruct-1M de Alibaba Qwen, publicada por Xylolabs y orientada específicamente a la ejecución sobre aceleradores Tenstorrent Tensix (Wormhole y Blackhole). El checkpoint mantiene las capas lineales de atención y MLP cuantizadas en formato block-floating-point de 8 bits (`ttnn.bfloat8_b`), mientras que el resto de tensores (embeddings, LM head, normalizaciones) permanecen en bf16. El resultado son 7.615.616.512 parámetros totales con un peso medio de 9,57 bits por parámetro y un tamaño empaquetado de 9,11 GB.

El modelo base, Qwen2.5-7B-Instruct-1M, es un transformer decoder-only de 7B parámetros con una ventana de contexto extendida hasta 1M de tokens, diseñado para tareas conversacionales, razonamiento y generación de código con contexto muy largo. Esta variante no modifica la arquitectura ni el entrenamiento: solo aplica GPTQ sobre la rejilla bfloat8_b para que TT-NN pueda empaquetar los pesos directamente sin conversión adicional.

Su relevancia es doble. Por un lado, es una de las pocas publicaciones que adapta un modelo de contexto de 1M al ecosistema Tenstorrent, una alternativa de hardware a GPU que gana tracción en inferencia de bajo consumo. Por otro, el autor documenta una metodología de evaluación de la cuantización centrada en la fidelidad respecto a BF16 (KL y top-1), lo que permite juzgar el coste de comprimir a ~9,5 bits por peso en lugar de los 16 bits del original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), capas lineales cuantizadas a BFP8 |
| Parámetros totales | 7.615.616.512 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1M tokens (heredada del modelo base Qwen2.5-7B-Instruct-1M) |
| Tipos de cuantización | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso) en q/k/v/o y gate/up/down de 28 capas; bf16 en el resto; media de 9,57 bits por peso |
| Idiomas soportados | en (según la model card; el modelo base Qwen2.5 soporta más idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 con valores en la rejilla BFP8), más `quant4.json` e índice de shards |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-7B-Instruct-1M original: un transformer decoder-only con atención completa, RoPE y las innovaciones de la familia Qwen2.5 (atención con sesgo QKV, RMSNorm, SwiGLU en el MLP). El contexto de 1M tokens se logra mediante las técnicas de extensión de contexto que Qwen documenta en su blog de Qwen2.5-1M. Esta publicación no reentrena ni hace fine-tuning: parte del checkpoint base y aplica GPTQ sobre la rejilla de block-floating-point de 8 bits.

El proceso de cuantización se calibró con 65.536 tokens de WikiText-2 y Wikipedia en coreano, manteniendo el exponente compartido de cada bloque tal y como lo fija el empaquetador de TT-NN. Los tensores se guardan en bf16 pero con todos los valores ya alineados a la rejilla BFP8, de modo que TT-NN los empaqueta sin pérdida adicional. El autor incluye scripts de verificación (`pack_tensix.py`, `verify_grid.py`) que comprueban que ninguna matriz cambia al empaquetarse. La validación se realizó con ttnn 0.81.1 sobre el simulador ttsim de Blackhole, no sobre hardware físico, y tt-transformers y tt-forge no se probaron con este checkpoint.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat compatible con el tokenizador de Qwen.
- Razonamiento y matemáticas de nivel 7B, heredados del modelo base Qwen2.5-7B-Instruct.
- Generación de código y soporte de instrucciones técnicas.
- Contexto extremadamente largo (hasta 1M tokens), adecuado para documentos completos o repositorios.
- Capacidades multilingües del modelo base (aunque la model card declara solo inglés).
- Ejecución nativa en aceleradores Tenstorrent Tensix mediante TT-NN, con pesos preempaquetados en BFP8.
- No se documenta tool calling, function calling ni modo thinking específico en esta variante; dependen del comportamiento del modelo base.

## Casos de uso

- Análisis de documentación extensa: ingerir manuales, contratos o informes de cientos de miles de tokens en una sola pasada gracias a la ventana de 1M, sin chunking ni recuperación externa.
- Revisión de repositorios de código: cargar un proyecto completo en contexto para responder preguntas sobre arquitectura, dependencias o posibles bugs.
- Despliegue en hardware Tenstorrent: servir un modelo de 7B con contexto largo en Wormhole o Blackhole, aprovechando los pesos BFP8 ya empaquetados para reducir el ancho de banda de memoria y el espacio en DRAM.
- Asistentes conversacionales de dominio largo: mantener historiales de conversación de decenas de miles de tokens sin truncar, útil en soporte técnico especializado.
- Procesamiento de corpus legales o académicos: resumir y extraer información de tesis, expedientes o artículos completos en una sola inferencia.
- Investigación en cuantización: usar el checkpoint y los scripts de verificación como referencia para estudiar el impacto de BFP8 frente a Q4_K_M en fidelidad respecto a BF16.
- Prototipado en simulación: validar pipelines de TT-NN con ttsim antes de disponer de hardware físico.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamaño (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen2.5-7B-Instruct-1M) | 16 | 15,23 | 0 | 100 | 30 de 33 | - |
| Este modelo (BFP8) | 9,57 | 9,114 | 0,00154 | 98,42 | 30 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,91 | 4,683 | 0,03061 | 91,63 | 31 de 33 | 0 |

Las métricas de KL y top-1 se calculan sobre 16.184 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano), con y sin plantilla de chat. Las 33 respuestas corresponden a prompts cortos con verificación automática. Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 sin importance matrix. El autor advierte que estas cifras miden cercanía a BF16, no calidad de tarea, y que no se midió velocidad en dispositivo. No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K) en la información disponible para esta variante; deben consultarse en la model card del modelo base.

## Requisitos de hardware

- VRAM/DRAM estimada: 9,11 GB empaquetados en BFP8; en bf16 completo serían ~15,2 GB.
- Hardware objetivo: aceleradores Tenstorrent Tensix, Wormhole y Blackhole. Validado solo en el simulador ttsim con ttnn 0.81.1, no en silicio.
- En GPU convencional: puede cargarse con transformers en bf16 (requiere ~16 GB de VRAM, cabe en RTX 4090 de 24 GB, A100 40/80 GB, H100), pero pierde la ventaja del formato BFP8 nativo.
- Despliegue en GPU: transformers, vLLM o TGI con el checkpoint en bf16; llama.cpp requeriría reconvertir a GGUF.
- Despliegue en Tensix: TT-NN con `ttnn.as_tensor` y memoria DRAM del dispositivo; tt-transformers y tt-forge no se probaron.
- Latencia y throughput: no disponibles; el autor no midió velocidad en hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato/cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BFP8) | 7,6B | 1M | BFP8 + bf16, 9,11 GB | Apache 2.0 | Hugging Face, orientado a Tensix |
| Qwen2.5-7B-Instruct-1M (BF16) | 7,6B | 1M | bf16, 15,23 GB | Apache 2.0 | Hugging Face |
| Qwen2.5-7B-Instruct (base sin 1M) | 7,6B | 32K típico | bf16 y múltiples GGUF | Apache 2.0 | Hugging Face, amplio ecosistema |
| Q4_K_M del mismo checkpoint (llama.cpp) | 7,6B | 1M | GGUF 4-bit, 4,68 GB | Apache 2.0 | Generado por el autor, no publicado como repo |

La comparación relevante es frente al BF16 original (mayor fidelidad, mayor tamaño) y frente a Q4_K_M (menor tamaño, mayor desviación KL). El BFP8 se sitúa entre ambos en tamaño y muy cerca del BF16 en fidelidad, a costa de requerir hardware o toolchain de Tenstorrent para aprovechar el formato.

## Limitaciones y advertencias

- No validado en hardware Tensix real: solo en el simulador ttsim; el rendimiento y la estabilidad en Wormhole/Blackhole están por confirmar.
- tt-transformers y tt-forge no se probaron con este checkpoint.
- La model card declara únicamente inglés, aunque el modelo base es multilingüe; el comportamiento en otros idiomas no está garantizado por el autor.
- Las métricas publicadas miden fidelidad respecto a BF16, no calidad de tarea; no hay benchmarks de MMLU, HumanEval o GSM8K para esta variante.
- Riesgo de alucinación inherente a un modelo de 7B, especialmente en contextos de 1M tokens donde la recuperación de información distante puede degradarse.
- Sesgos heredados del corpus de entrenamiento de Qwen2.5, no reevaluados tras la cuantización.
- La licencia Apache 2.0 permite uso comercial, pero el autor distribuye el modelo "as is" sin garantía y no está afiliado ni respaldado por Tenstorrent.
- El calibrado de GPTQ usó WikiText-2 y Wikipedia en coreano; dominios muy distintos (código, matemáticas) podrían sufrir mayor degradación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-7B-Instruct-1M-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-1M
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Blog de Qwen2.5-1M: https://qwenlm.github.io/blog/qwen2.5-1m/
- Paper referenciado (arXiv:2501.15383): https://arxiv.org/abs/2501.15383
