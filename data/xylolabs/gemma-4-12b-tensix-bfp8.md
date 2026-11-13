# Xylolabs/gemma-4-12B-Tensix-BFP8

## Resumen

Gemma-4-12B-Tensix-BFP8 es una versión cuantizada del modelo multimodal google/gemma-4-12B, preparada por Xylolabs para su despliegue en aceleradores NPU de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura original de Gemma 4 (transformer multimodal con capacidades de imagen, audio y texto) y cuantiza las capas lineales de atención y MLP a `ttnn.bfloat8_b` (BFP8, formato de coma flotante por bloques de 8 bits) mediante GPTQ, dejando embeddings, normas y cabezas en bf16. El resultado es un checkpoint de aproximadamente 12.970 millones de parámetros con 9,13 bits por peso de media, que ocupa 13,60 GB empaquetado frente a los 23,81 GB del modelo BF16 original.

La relevancia de esta ficha reside en que es un export específico para hardware Tenstorrent, no un modelo de propósito general para GPU convencional. El autor declara que solo el modelo de lenguaje fue cuantizado y evaluado; los embedders de visión y audio permanecen en bf16 sin evaluación. El checkpoint está pensado para cargarse con TT-NN (`ttnn.as_tensor` con `dtype=ttnn.bfloat8_b`), donde las matrices cuantizadas se almacenan como valores bf16 sobre la rejilla BFP8 para que el empaquetador no altere sus valores.

La model card indica que el checkpoint es el modelo preentrenado (no ajustado para chat, sin plantilla de conversación) y que fue verificada con ttnn 0.81.1 sobre ttsim, el simulador Blackhole de Tenstorrent. tt-transformers y tt-forge no fueron probados con este checkpoint. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4), con capas de atención y MLP cuantizadas a BFP8; pipeline `any-to-any` (texto, imagen, audio) |
| Parametros totales | 12.966.363.184 (~12,97 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso) en proyecciones q, k, o, v y MLP gate/up/down; bf16 en embeddings, normas, LM head y embedders de vision/audio. Media de 9,13 bits por peso |
| Idiomas soportados | no disponible (la evaluacion usa texto en ingles y coreano: WikiText-2 y Wikipedia en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 26,0 GB; pesos empaquetados 13,60 GB para el modelo de lenguaje), con `quant4.json` que describe el formato de cada proyeccion |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 de Google, un transformer multimodal con 48 capas de atención y MLP según la tabla de formatos del export (48 capas con q, k, o y MLP gate/up/down cuantizados; 40 capas con v cuantizada). La model card no detalla el número de tokens de entrenamiento del modelo original ni la composición del dataset; esa información corresponde al informe técnico Gemma 4 (arXiv:2607.02770), no reproducido en la información disponible. No se menciona RLHF, DPO ni ninguna fase de alineación en el material proporcionado.

La innovación técnica de este export es el pipeline GPTQ sobre la rejilla `bfloat8_b` de TT-NN: cada bloque comparte un exponente y los pesos se almacenan como valores bf16 sobre esa rejilla, de modo que el empaquetador de TT-NN los lee sin modificar sus valores. La calibración de GPTQ se realizó con 65.536 tokens de WikiText-2 y Wikipedia en coreano. El autor incluye scripts de verificación (`pack_tensix.py` y `verify_grid.py`) que comprueban matriz a matriz que ningún valor cambia tras el empaquetado, y una comprobación opcional de ida y vuelta por DRAM del dispositivo. Solo el modelo de lenguaje fue cuantizado y evaluado; los embedders de visión y audio quedaron intactos en bf16.

## Capacidades

- Generación de texto autoregresiva en modo completion (el checkpoint es el modelo preentrenado, sin plantilla de chat).
- Procesamiento multimodal de imagen a texto (`image-text-to-text`) y pipeline `any-to-any`, con embedders de visión y audio presentes en bf16.
- Continuación de texto y respuesta a prompts cortos con verificación automática (28 prompts, 3-shot, en la evaluación del autor).
- Capacidades multilingües limitadas a lo evaluado: inglés y coreano (WikiText-2 test y Wikipedia en coreano).
- No se documenta soporte de tool calling, function calling, agentes ni modo thinking en la información proporcionada.
- No se documenta decodificación especulativa ni optimizaciones de latencia.

## Casos de uso

- Despliegue en hardware Tenstorrent: el caso principal del export es ejecutar Gemma 4 en NPU Wormhole o Blackhole mediante TT-NN, con 13,60 GB de memoria de dispositivo para los pesos del modelo de lenguaje más espacio para KV cache y buffers. Es adecuado porque el formato BFP8 está diseñado para que TT-NN lo empaquete sin pérdida de valores.
- Investigación de cuantización en formatos de coma flotante por bloques: el checkpoint permite estudiar el impacto de BFP8 con GPTQ frente a BF16 y a Q4_K_M de llama.cpp, con métricas de KL y top-1 publicadas sobre 8.184 posiciones de texto inglés y coreano.
- Evaluación de fidelidad de export: los scripts `pack_tensix.py` y `verify_grid.py` permiten validar matriz a matriz que la cuantización no altera valores tras el empaquetado, útil en pipelines de verificación de checkpoints para hardware propietario.
- Prototipado multimodal en simulador: al estar verificada con ttnn 0.81.1 sobre ttsim (simulador Blackhole), sirve para desarrollar pipelines de imagen-texto y audio-texto antes de disponer de silicio.
- Benchmarking de compresión: con 9,13 bits por peso y 13,60 GB frente a 23,81 GB en BF16, es un punto de referencia para comparar estrategias de cuantización de 8 bits por bloques en modelos de ~13.000 millones de parámetros.
- Baseline de texto para evaluación de modelos: los 28 prompts con comprobación automática en formato completion, 3-shot, permiten medir regresiones de calidad entre checkpoints cuantizados del mismo modelo base.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. Las métricas KL y top-1 cubren 8.184 posiciones de texto inglés y coreano (WikiText-2 test, Wikipedia en coreano); "Answers right" son 28 prompts cortos con comprobación automática, en formato completion, 3-shot. Los números miden cercanía al BF16, no calidad de tarea; la velocidad no se reporta.

| Modelo | Bits por peso | Tamano (GB) | KL medio a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (google/gemma-4-12B) | 16 | 23,81 | 0 | 100 | 27 de 28 | - |
| **Gemma-4-12B-Tensix-BFP8** | 9,13 | 13,596 | 0,00201 | 97,91 | 27 de 28 | 0 |
| Q4_K_M (llama.cpp) | 4,949 | 7,381 | 0,09127 | 87,90 | 25 de 28 | 0 |

El criterio de aceptación del autor era un KL medio como máximo 1,5 veces el de Q4_K_M y como máximo una respuesta perdida adicional; el export cumple con 0,022 veces el KL de Q4_K_M y 0 respuestas perdidas frente a 0. Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin matriz de importancia.

## Requisitos de hardware

- VRAM/memoria de dispositivo: aproximadamente 13,60 GB solo para los pesos del modelo de lenguaje, más espacio para KV cache y buffers. El repo completo en safetensors ocupa 26,0 GB.
- Hardware objetivo: NPU Tenstorrent Tensix, arquitecturas Wormhole y Blackhole. Verificado con ttnn 0.81.1 sobre ttsim (simulador Blackhole).
- GPU convencionales: la model card incluye un quickstart con `transformers` (`AutoModelForCausalLM.from_pretrained` con `dtype="bfloat16"` y `device_map="auto"`), pero no se documenta rendimiento ni compatibilidad de la cuantización BFP8 fuera de TT-NN; no hay datos sobre si cabe en GPU consumer.
- Opciones de despliegue: TT-NN (`ttnn.as_tensor` con `dtype=ttnn.bfloat8_b`, `layout=ttnn.TILE_LAYOUT`, `memory_config=ttnn.DRAM_MEMORY_CONFIG`); `transformers` para carga en bf16. tt-transformers y tt-forge no fueron probados con este checkpoint. No se menciona vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor indica explícitamente que la velocidad no se reporta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-12B-Tensix-BFP8 | ~12,97 mil millones | no disponible | BFP8, 9,13 bits/peso, 13,60 GB | Apache 2.0 | Hugging Face (Xylolabs) |
| google/gemma-4-12B (BF16) | ~12,97 mil millones | no disponible | BF16, 23,81 GB | Apache 2.0 | Hugging Face (Google) |
| Q4_K_M de llama.cpp (mismo checkpoint) | ~12,97 mil millones | no disponible | 4,949 bits/peso, 7,381 GB | Apache 2.0 | Generado localmente con llama.cpp v0.9.0 |

La comparación se limita a variantes del mismo modelo base, que es lo único documentado en la información proporcionada. No hay datos de benchmarks frente a otros modelos de la misma categoría.

## Limitaciones y advertencias

- Es el modelo preentrenado, no ajustado para chat: no tiene plantilla de conversación y solo continúa texto. No debe usarse directamente como asistente sin ajuste posterior.
- Solo el modelo de lenguaje fue cuantizado y evaluado; los embedders de visión y audio (`embed_audio`, `embed_vision`, `vision_embedder`) permanecen en bf16 sin evaluación de calidad.
- La evaluación se limita a inglés y coreano (WikiText-2 y Wikipedia en coreano) y a 28 prompts cortos; no hay datos sobre otros idiomas ni sobre tareas de razonamiento, código o matemáticas.
- Las métricas KL y top-1 miden cercanía al BF16, no calidad de tarea; el autor lo advierte explícitamente.
- No se reportan latencia ni throughput, y tt-transformers y tt-forge no fueron probados con este checkpoint.
- El modelo está orientado a hardware Tenstorrent; el rendimiento en GPU convencional no está documentado y la cuantización BFP8 está pensada para el empaquetador de TT-NN.
- La licencia Apache 2.0 se hereda del modelo base; el repositorio del modelo base no incluye archivo LICENSE, por lo que el autor incluye el texto estándar y un NOTICE con los cambios. Se distribuye "as is", sin garantía, y no está afiliado ni respaldado por Tenstorrent.
- Riesgo de sesgos y alucinación: no documentado en la información proporcionada; al ser un modelo preentrenado de gran tamaño, cabe esperar sesgos heredados del dataset de entrenamiento original, no descrito aquí.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-12B-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-12B
- Repositorio del código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Informe técnico Gemma 4: arXiv:2607.02770 (https://arxiv.org/abs/2607.02770)
- Licencia Apache 2.0 del export: https://huggingface.co/Xylolabs/gemma-4-12B-Tensix-BFP8/blob/main/LICENSE
