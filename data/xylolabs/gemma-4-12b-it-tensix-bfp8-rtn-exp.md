# Xylolabs/gemma-4-12B-it-Tensix-BFP8-RTN-Exp

## Resumen

Gemma 4 12B IT Tensix BFP8 RTN Exp es una exportación cuantizada del modelo multimodal `google/gemma-4-12B-it`, publicada por Xylolabs y orientada específicamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). La cuantización convierte las capas lineales del modelo de lenguaje (atención q/k/v/o y las proyecciones MLP gate/up/down) al formato `ttnn.bfloat8_b` (BFP8, block floating point de 8 bits con exponente compartido por bloques de 16 valores), mientras que embeddings, normas, LM head y los módulos de visión y audio permanecen en bf16 sin modificar.

El resultado empaqueta los pesos del modelo de lenguaje en aproximadamente 13,60 GB, con una media de 9,13 bits por peso y una pérdida de fidelidad mínima frente al original en BF16 (KL media de 0,00319 sobre 8.048 posiciones de texto inglés y coreano). El checkpoint es relevante porque permite ejecutar un modelo de 12.966 millones de parámetros con capacidades any-to-any en hardware Tensix con un coste de memoria muy inferior al BF16 (23,81 GB), manteniendo un 98,27 % de top-1 agreement respecto al modelo de referencia.

La cuantización se realizó con round-to-nearest sobre la rejilla BFP8, sin calibración ni datos de calibración, y los tensores se almacenan como valores bf16 en la rejilla BFP8 para que TT-NN los empaquete sin alterar sus valores. Solo se cuantizó y evaluó el modelo de lenguaje; los componentes de visión y audio no fueron cuantizados ni evaluados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any: texto, imagen, audio) derivado de `gemma4_unified`; cuantización block floating point BFP8 en capas lineales |
| Parametros totales | 12.966.363.184 (12,97 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso efectivos, bloques de 16 con exponente compartido), round-to-nearest; resto en bf16. Media de 9,13 bits por peso |
| Idiomas soportados | no disponible (la evaluación cubre inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (índice `model.safetensors.index.json`, `quant4.json` con el formato por proyección); compatible con `transformers` |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-12B-it`, un transformer multimodal de tipo any-to-any con módulos de visión (`vision_embedder`) y audio (`embed_audio`), 48 capas en el modelo de lenguaje y LM head atada a los embeddings. Esta exportación no reentrena ni modifica la arquitectura: aplica cuantización post-entrenamiento (PTQ) sobre las proyecciones lineales del bloque de lenguaje.

La cuantización usa round-to-nearest sobre la rejilla `bfloat8_b`, donde cada bloque de 16 pesos comparte el exponente del mayor valor del bloque o uno inferior, eligiendo el que minimiza el error. No se empleó calibración ni importance matrix. Los tensores cuantizados se almacenan como valores bf16 alineados a la rejilla BFP8, de modo que TT-NN los empaqueta sin cambiar sus valores. Las 48 capas de atención q/k/o y MLP gate/up/down, y las 40 capas de atención v, se cuantizan a BFP8; embeddings, normas, LM head y módulos de visión/audio quedan en bf16. El autor verificó el empaquetado con `ttnn` 0.81.1 sobre el simulador Blackhole (`ttsim`), pero no ejecutó `tt-transformers` ni `tt-forge` con este checkpoint.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno (chat template incluido).
- Procesamiento de imagen y texto (`image-text-to-text`) gracias a los módulos de visión en bf16.
- Capacidades any-to-any (texto, imagen, audio) heredadas del modelo base; los módulos de audio y visión no fueron cuantizados ni evaluados.
- Modo de razonamiento con "thinking" (evaluado en 7 de las 40 respuestas de referencia).
- Soporte multilingüe (evaluación parcial en inglés y coreano).
- No se documenta soporte explícito de tool calling, function calling ni flujos de agentes en la información disponible.

## Casos de uso

- Despliegue en NPU Tenstorrent Wormhole/Blackhole: el checkpoint está empaquetado para que TT-NN lo cargue directamente en memoria de dispositivo, ocupando unos 13,60 GB solo para los pesos del modelo de lenguaje, más KV cache y buffers.
- Asistente conversacional multilingüe en inglés y coreano: la evaluación de fidelidad cubre texto de WikiText-2 y Wikipedia coreana en plantilla de chat, lo que respalda su uso en esos idiomas.
- Procesamiento de documentos con imagen y texto: al conservar los módulos de visión en bf16, puede recibir pares imagen-texto en tareas de descripción o extracción de información.
- Razonamiento con modo thinking: adecuado para tareas que se benefician de cadenas de razonamiento explícitas, aunque el autor no reporta métricas de calidad de tarea.
- Sustitución de BF16 en entornos con memoria limitada: reduce el peso del modelo de lenguaje de 23,81 GB a 13,60 GB manteniendo 40 de 40 respuestas correctas en el conjunto de referencia del autor.
- Investigación en cuantización BFP8: sirve como referencia reproducible (scripts `pack_tensix.py`, `verify_grid.py`) para estudiar el impacto de la cuantización block floating point en modelos multimodales.
- Prototipado con `transformers` en GPU/CPU: el checkpoint es cargable con `AutoModelForCausalLM.from_pretrained(..., dtype="bfloat16")`, aunque su destino principal es Tensix.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamaño (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (`google/gemma-4-12B-it`) | 16 | 23,81 | 0 | 100 | 40 de 40 | - |
| **Este modelo (BFP8 RTN)** | 9,13 | 13,596 | 0,00319 | 98,27 | 40 de 40 | 0 |
| Q4_K_M (llama.cpp) | 4,95 | 7,381 | 0,16924 | 85,52 | 40 de 40 | 0 |

Las métricas de KL y top-1 se calculan sobre 8.048 posiciones de texto inglés y coreano (WikiText-2 test y Wikipedia coreana) en plantilla de chat. Las respuestas corresponden a 33 prompts cortos con verificación automática más 7 de razonamiento repetidos con thinking activado (40 en total). El autor advierte que estas cifras miden cercanía al BF16, no calidad de tarea, y que no se reporta velocidad. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria de dispositivo estimada: ~13,60 GB solo para pesos del modelo de lenguaje, más KV cache y buffers adicionales.
- Hardware objetivo: NPU Tenstorrent Tensix (Wormhole, Blackhole) con `ttnn` 0.81.1; verificado en el simulador Blackhole (`ttsim`).
- GPU consumer: no se documenta; el checkpoint es cargable en `transformers` con bf16, pero no hay requisitos de VRAM publicados para GPU.
- Opciones de despliegue: TT-NN (`ttnn.as_tensor` con `ttnn.bfloat8_b`, `TILE_LAYOUT`, `DRAM_MEMORY_CONFIG`), `transformers` (bf16), scripts `pack_tensix.py` y `verify_grid.py`. `tt-transformers` y `tt-forge` no fueron probados con este checkpoint.
- Latencia y throughput: no disponibles (el autor indica explícitamente que no reporta velocidad).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (BFP8 RTN) | 12,97 B | no disponible | BFP8 + bf16 | 13,60 GB (LM) | Apache 2.0 | Hugging Face |
| `google/gemma-4-12B-it` (BF16) | 12,97 B | no disponible | BF16 | 23,81 GB | Apache 2.0 | Hugging Face |
| Q4_K_M (llama.cpp, mismo checkpoint) | 12,97 B | no disponible | Q4_K_M | 7,38 GB | Apache 2.0 | Generado por el autor |

La comparativa se limita al modelo base y a la variante Q4_K_M del mismo checkpoint, que son las únicas alternativas con datos en la información disponible. No se dispone de comparación con otros modelos de 12 B de la misma categoría.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; los módulos de visión y audio no fueron evaluados y su comportamiento tras la exportación es incierto.
- Las métricas publicadas miden fidelidad respecto a BF16 (KL, top-1), no calidad de tarea ni rendimiento en benchmarks estándar.
- No se reportan datos de velocidad, latencia ni throughput.
- No se documentan sesgos conocidos ni tasas de alucinación específicas para esta exportación.
- La evaluación multilingüe se limita a inglés y coreano; el resto de idiomas no está verificado.
- La longitud de contexto no está especificada en la información disponible.
- Aunque la licencia es Apache 2.0, el repositorio del modelo base no incluye fichero LICENSE y el autor añade el texto estándar junto con un NOTICE de cambios; conviene revisar ambos antes de uso comercial.
- El checkpoint está pensado para Tensix; su ejecución en GPU/CPU vía `transformers` no ha sido validada por el autor más allá de la carga.
- `tt-transformers` y `tt-forge` no se probaron con este checkpoint, por lo que la integración con esos frameworks no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-12B-it-Tensix-BFP8-RTN-Exp
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
- Licencia: https://huggingface.co/Xylolabs/gemma-4-12B-it-Tensix-BFP8-RTN-Exp/blob/main/LICENSE
