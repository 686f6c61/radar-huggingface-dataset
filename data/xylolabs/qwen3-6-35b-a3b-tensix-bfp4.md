# Xylolabs/Qwen3.6-35B-A3B-Tensix-BFP4

## Resumen

Xylolabs/Qwen3.6-35B-A3B-Tensix-BFP4 es una cuantizacion del modelo Qwen/Qwen3.6-35B-A3B, un modelo de mezcla de expertos (MoE) de 35.951.822.704 parametros totales desarrollado originalmente por el equipo Qwen. Esta version, publicada por Xylolabs, reempaqueta los pesos en formato de coma flotante por bloques de 4 bits (BFP4, `bfloat4_b`) especificamente para su ejecucion en aceleradores Tenstorrent Tensix (Wormhole y Blackhole), manteniendo el pipeline multimodal image-text-to-text del modelo base.

El objetivo de esta ficha es documentar una variante de despliegue orientada a hardware NPU, no un modelo nuevo: la arquitectura, los datos de entrenamiento y las capacidades cognitivas son las del Qwen3.6-35B-A3B original. La innovacion aportada por Xylolabs reside en el esquema de cuantizacion GPTQ con busqueda de exponente por bloque y en el empaquetado de tensores para Tensix, que reduce el peso de 69,32 GB en bf16 a 20,991 GB empaquetados.

Es relevante ahora porque demuestra que un MoE de ~36.000 millones de parametros con atencion hibrida (Gated DeltaNet mas atencion clasica) puede servirse en 4 bits sobre aceleradores no-GPU con una degradacion medible pero acotada frente al original: un KL medio de 0,05013 frente a bf16 y un top-1 del 89,62 %, frente al 90,80 % de una cuantizacion Q4_K_M de llama.cpp. La licencia Apache 2.0 heredada facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido con Gated DeltaNet y atencion clasica (clase `qwen3_5_moe`); multimodal image-text-to-text |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible (el nombre A3B sugiere ~3B activos, pero el dato no se confirma en la informacion proporcionada) |
| Longitud de contexto | no disponible (la demo de Tensix menciona una variante `traced_128k`, sin confirmacion oficial) |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) para proyecciones de atencion, Gated DeltaNet y expertos; bf16 para LM head, embeddings, normas, shared expert gate, `mtp` y `visual` |
| Idiomas soportados | no disponible (la evaluacion cubre texto en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetado Tensix BFP4), `quant4.json` con el formato por proyeccion, `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con una capa hibrida: 10 capas usan atencion clasica (proyecciones q, k, v, o) y 30 capas usan Gated DeltaNet (proyecciones q, k, v, z, a, b y output). El bloque MoE consta de 40 capas con expertos enrutados (gate, up, down) y un experto compartido, cuyo gate permanece en bf16. El modelo incluye ademas un modulo `visual` para entrada de imagenes y un modulo `mtp` (multi-token prediction), ambos conservados en bf16 sin cuantizar.

La cuantizacion aplicada por Xylolabs usa GPTQ con busqueda de exponente por bloque sobre formato de coma flotante por bloques de 4 bits, dirigida a las proyecciones de atencion, Gated DeltaNet y expertos enrutados y compartidos. El empaquetado conserva exactitud numerica verificable: las herramientas `pack_tensix.py` y `verify_grid.py` comprueban cada matriz mediante round-trip a traves de `ttnn`, y los mismos valores se empaquetan de forma exacta en `ttnn.bfloat8_b`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno mediante plantilla de chat (`apply_chat_template`).
- Procesamiento multimodal image-text-to-text, segun el pipeline declarado y el modulo `visual` en bf16.
- Razonamiento y codigo agentico, segun el titulo de la cita del modelo base ("Agentic Coding Power").
- Prediccion multi-token (`mtp`) conservada en bf16, potencialmente util para decodificacion especulativa.
- Capacidades multilingues: la evaluacion publicada incluye texto en ingles y coreano, aunque no se declara una lista oficial de idiomas.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente en la informacion proporcionada.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el modelo esta empaquetado para Wormhole y Blackhole con `ttnn`, `tt-metal` y `tt-forge`, lo que permite servir un MoE de ~36.000 millones de parametros en 20,991 GB de memoria de dispositivo en lugar de 69,32 GB en bf16.
- Sustitucion de GPU en inferencia de bajo consumo: al ocupar aproximadamente un tercio del espacio del modelo bf16, encaja en escenarios donde el presupuesto de memoria del acelerador es la restriccion principal y se acepta una perdida de fidelidad medida (KL 0,05013).
- Evaluacion comparativa de cuantizaciones: sirve como referencia reproducible frente a Q4_K_M de llama.cpp, ya que la model card documenta el checkpoint, la version de llama.cpp y el sha256 del artefacto de comparacion.
- Prototipado de asistentes multimodales: el pipeline image-text-to-text y el modulo `visual` en bf16 permiten construir interfaces que reciben imagenes y texto y generan respuestas conversacionales.
- Investigacion en formatos de coma flotante por bloques: el par de herramientas `pack_tensix.py` y `verify_grid.py` permite validar el empaquetado y la rejilla de exponentes con PyTorch, util para estudiar el impacto de BFP4 en la calidad.
- Integracion en pipelines de transformers: el modelo se carga con `AutoModelForCausalLM` y `AutoTokenizer` en `dtype="bfloat16"`, lo que facilita pruebas en CPU/GPU antes de portar el despliegue a Tensix.
- Analisis de degradacion por idioma: la evaluacion sobre WikiText-2 y Wikipedia en coreano permite estudiar como afecta la cuantizacion a idiomas distintos del ingles.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL medio frente a bf16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (Qwen/Qwen3.6-35B-A3B) | 69,32 | 0 | 100 |
| Este modelo (BFP4) | 20,991 | 0,05013 | 89,62 |
| Q4_K_M (llama.cpp) | 21,713 | 0,0404 | 90,80 |

La evaluacion cubre 8.188 posiciones de texto en ingles y coreano (test de WikiText-2 y Wikipedia en coreano), en formato de texto plano. La comparacion Q4_K_M se genero desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin matriz de importancia. La model card indica que el KL de este modelo es 1,24 veces el de Q4_K_M. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de tareas en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria de dispositivo: 20,991 GB empaquetados en BFP4 para Tensix; el repositorio completo ocupa 71,9 GB (incluye tensores bf16 y metadatos).
- Aceleradores objetivo: Tenstorrent Wormhole y Blackhole; la demo verificada usa `MESH_DEVICE=P150x4` sobre `tt-metal` v0.81.1 con `ttnn` 0.81.1 en el simulador Blackhole (`ttsim`).
- Carga en transformers: requiere `dtype="bfloat16"` y `device_map="auto"`; el peso efectivo en GPU se aproxima al del modelo bf16 si no se usa el runtime de Tensix, por lo que no cabe en GPU de consumo de 24 GB sin cuantizacion adicional.
- GPU de consumo: no se documenta soporte nativo; la cuantizacion BFP4 esta pensada para Tensix, no para CUDA.
- Opciones de despliegue: runtime de Tensix (`tensix-runner` v0.1.0, `tensix-kernels` v0.1.0), `tt-metal` y `ttnn`, y carga estandar con `transformers`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | KL frente a bf16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Xylolabs/Qwen3.6-35B-A3B-Tensix-BFP4 | 35.951.822.704 | no disponible | BFP4 (Tensix) | 0,05013 | Apache 2.0 | Hugging Face, 243 descargas |
| Qwen/Qwen3.6-35B-A3B (bf16) | 35.951.822.704 | no disponible | bf16 | 0 | Apache 2.0 (heredada) | Hugging Face |
| Q4_K_M de llama.cpp (mismo checkpoint) | 35.951.822.704 | no disponible | Q4_K_M | 0,0404 | Apache 2.0 (heredada) | Artefacto de comparacion, sha256 documentado |

Frente a Q4_K_M, esta variante ocupa ligeramente menos espacio (20,991 GB frente a 21,713 GB) pero presenta mayor divergencia respecto a bf16 (KL 0,05013 frente a 0,0404) y menor top-1 (89,62 % frente a 90,80 %). Su ventaja no es la fidelidad numerica sino la compatibilidad con el runtime de Tensix. No se dispone de datos de benchmarks de tareas que permitan comparar con otros modelos de la misma categoria.

## Limitaciones y advertencias

- La cuantizacion BFP4 introduce degradacion medible: KL medio de 0,05013 y top-1 del 89,62 %, inferior al 90,80 % de Q4_K_M sobre el mismo checkpoint.
- El soporte esta limitado al ecosistema Tenstorrent Tensix; no se documenta funcionamiento nativo en CUDA ni en GPU de consumo.
- La demo se verifico en el simulador Blackhole (`ttsim`), no necesariamente en silicio fisico, segun la informacion proporcionada.
- No se declara la lista de idiomas soportados; la evaluacion solo cubre ingles y coreano.
- No se confirma la longitud de contexto oficial; la referencia a `traced_128k` en la demo no constituye una especificacion.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; son los heredados del modelo base Qwen3.6-35B-A3B.
- La licencia Apache 2.0 permite uso comercial, pero los cambios respecto al modelo base se detallan en `NOTICE`; el autor declara no estar afiliado a Tenstorrent.
- El modelo incluye modulos `mtp` y `visual` sin cuantizar en bf16, lo que incrementa el peso total del repositorio (71,9 GB) frente al peso empaquetado para dispositivo (20,991 GB).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3.6-35B-A3B-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Codigo en commit concreto: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Qwen3.6-35B-A3B-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
