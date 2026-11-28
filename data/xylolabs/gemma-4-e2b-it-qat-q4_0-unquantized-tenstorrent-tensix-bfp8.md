# Xylolabs/gemma-4-E2B-it-qat-q4_0-unquantized-Tenstorrent-Tensix-BFP8

## Resumen

Este repositorio contiene una versión del modelo Gemma 4 E2B instruct, original de Google, cuantizada específicamente para su ejecución sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole) mediante el formato de coma flotante por bloques `bfloat8_b` (BFP8). El trabajo lo publica Xylolabs, que aplica GPTQ sobre la rejilla nativa de BFP8 de los NPU Tensix para preservar la precisión del checkpoint original de Google mientras reduce el peso en memoria. El modelo base es `google/gemma-4-E2B-it-qat-q4_0-unquantized`, un checkpoint entrenado con quantisation-aware training (QAT) que Google distribuye como Q4_0.

El modelo resuelve un problema de despliegue: los NPU Tensix no ejecutan de forma eficiente los formatos GGUF o los típicos de GPU, por lo que hacía falta una conversión que respetase su rejilla de cuantización por bloques. La propuesta de Xylolabs ocupa 7,536 GB empaquetado, frente a los 9,26 GB del modelo en bf16, y mantiene una divergencia KL media de 0,00154 respecto a bf16, muy inferior a la de Q4_0 de llama.cpp (0,04435).

El checkpoint declara 5.506.950.723 parámetros totales según los safetensors del repositorio, pipeline `any-to-any` (texto, imagen y audio) y licencia Apache 2.0. Es relevante ahora porque abre la inferencia de un modelo multimodal de Google en hardware de inferencia alternativo a NVIDIA, con una pérdida de calidad medible y pequeña.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any: lenguaje, visión y audio), derivado de Gemma 4 E2B |
| Parámetros totales | 5.506.950.723 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP8 (`bfloat8_b`) en proyecciones de atención y MLP; bf16 en LM head, embeddings, normas, `audio_tower`, `embed_audio`, `embed_vision` y `vision_tower` |
| Idiomas soportados | no disponible (la evaluación cubre inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetado para Tensix; 7,536 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Gemma 4, con torres separadas de visión y audio (`vision_tower`, `audio_tower`) y un modelo de lenguaje con 35 capas en las proyecciones MLP y de atención q/o, y 15 capas en las proyecciones k/v según la tabla de formatos del repositorio. El checkpoint de Google se entrenó con QAT y se distribuye como Q4_0, de modo que la cuantización forma parte del proceso de entrenamiento original.

La aportación de Xylolabs es puramente de cuantización: aplica GPTQ sobre la rejilla `bfloat8_b` nativa de los NPU Tensix y empaqueta los tensores para `tt-metal`/`ttnn`. Solo se cuantizan las proyecciones de atención y MLP; el resto de tensores permanece en bf16 tal como en el modelo base. El repositorio incluye `quant4.json`, que documenta el formato de cada proyección, y las herramientas `pack_tensix.py` y `verify_grid.py` para verificar la conversión matriz a matriz. No se detallan en la información disponible el número de tokens de entrenamiento ni la composición del dataset del modelo base.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`).
- Procesamiento multimodal any-to-any: entrada de imagen y audio mediante `vision_tower` y `audio_tower` en bf16.
- Razonamiento y respuesta a preguntas en formato instruct.
- Soporte multilingüe parcial: la evaluación del autor incluye inglés y coreano.
- Tool calling y function calling: no disponible en la información proporcionada.
- Modo de razonamiento extendido (thinking): no disponible en la información proporcionada.
- Ejecución en NPU Tenstorrent Tensix (Wormhole, Blackhole) mediante kernels `tensix-kernels` y runner `tensix-runner`.
- Compatibilidad con `transformers` y `endpoints_compatible` para despliegue estándar en GPU/CPU.

## Casos de uso

- Inferencia en hardware Tenstorrent: despliegue del modelo en NPU Wormhole o Blackhole usando `ttnn` y los kernels publicados, aprovechando el empaquetado BFP8 para reducir el consumo de DRAM frente a bf16 (7,536 GB frente a 9,26 GB).
- Servicio conversacional multimodal: atención a usuarios que envían texto, imágenes o audio en la misma conversación, gracias a las torres de visión y audio conservadas en bf16.
- Prototipado de asistentes sobre `transformers`: carga directa con `AutoModelForCausalLM` y `device_map="auto"` para validar respuestas antes de portar a Tensix.
- Evaluación de calidad de cuantización: uso del checkpoint como referencia para comparar la degradación de otros formatos (Q4_0, BFP4) mediante KL y top-1 sobre WikiText-2 y Wikipedia en coreano.
- Investigación en aceleradores alternativos: banco de pruebas para estudiar el rendimiento de GPTQ sobre rejillas de coma flotante por bloques en NPU.
- Despliegue con requisitos de licencia permisiva: al ser Apache 2.0, puede integrarse en productos comerciales sin las restricciones de otras licencias de modelos abiertos.
- Procesamiento de documentos con imagen y texto: extracción y resumen de contenido visual combinado con instrucciones textuales.

## Benchmarks y rendimiento

| Modelo | Tamaño (GB) | KL media a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (modelo base) | 9,26 | 0 | 100 |
| Este modelo (BFP8) | 7,536 | 0,00154 | 98,23 |
| Q4_0 (llama.cpp) | 3,350 | 0,04435 | 89,47 |

Las métricas de KL y top-1 se calculan sobre 7.968 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano), con la plantilla de chat. El Q4_0 de referencia se generó con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 7,536 GB empaquetado para Tensix; en `transformers` con `dtype="bfloat16"` el repositorio ocupa 11,0 GB, por lo que se recomienda al menos 12-16 GB de memoria de dispositivo.
- GPU recomendadas: no se especifican en la información disponible; el destino principal son NPU Tenstorrent Wormhole y Blackhole.
- Compatibilidad con GPU de consumo: el tamaño en bf16 (11 GB de repositorio) permite su carga en GPUs con 16 GB o más, como RTX 4080/4090; no confirmado por el autor.
- Opciones de despliegue: `transformers` con `device_map="auto"`; `ttnn`/`tt-metal` con `tensix-kernels` y `tensix-runner` v0.1.0 para Tensix. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.
- Alternativa de menor memoria: el autor remite a la versión BFP4 (`...-Tenstorrent-Tensix-BFP4-MLP`) para dispositivos con menos memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Este modelo (BFP8 Tensix) | 5,51 B | no disponible | BFP8 + bf16 | Apache 2.0 | Tenstorrent Tensix, GPU vía transformers |
| google/gemma-4-E2B-it-qat-q4_0-unquantized | no disponible | no disponible | Q4_0 (QAT) | Apache 2.0 | GPU/CPU |
| Versión BFP4-MLP de Xylolabs | no disponible | no disponible | BFP4 + bf16 | Apache 2.0 | Tensix con menos memoria |
| Q4_0 de llama.cpp (referencia) | 5,51 B | no disponible | Q4_0 | Apache 2.0 (heredada) | CPU/GPU |

La comparativa se limita a variantes del mismo checkpoint base; no se dispone de datos de modelos alternativos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización BFP8 introduce una degradación medible: top-1 del 98,23 % frente al 100 % de bf16 y KL media de 0,00154.
- El repositorio está pensado para Tensix; fuera de ese hardware, la ventaja de tamaño y velocidad desaparece y se carga como un modelo bf16 de 11 GB.
- Solo se cuantizan atención y MLP; las torres de visión y audio permanecen en bf16, lo que limita el ahorro en cargas multimodales.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni limitaciones de contexto o idioma más allá de la evaluación en inglés y coreano.
- La licencia es Apache 2.0 según la model card, pero el repositorio base de Google no incluye fichero LICENSE; el autor incluye el texto estándar.
- El autor recomienda la variante BFP4 en dispositivos con poca memoria, lo que implica que BFP8 puede no caber en configuraciones Tensix reducidas.
- No hay datos publicados de latencia, throughput ni benchmarks de tareas, lo que dificulta estimar el rendimiento en producción.
- El modelo tiene 217 descargas y 0 likes en el momento de la ficha; es un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E2B-it-qat-q4_0-unquantized-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Variante BFP4: https://huggingface.co/Xylolabs/gemma-4-E2B-it-qat-q4_0-unquantized-Tenstorrent-Tensix-BFP4-MLP
- Código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit del código: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
