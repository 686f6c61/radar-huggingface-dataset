# Xylolabs/Qwen3-VL-8B-Instruct-Tenstorrent-Tensix-BFP4-MLP

## Resumen

Qwen3-VL-8B-Instruct-Tenstorrent-Tensix-BFP4-MLP es una cuantizacion del modelo multimodal Qwen/Qwen3-VL-8B-Instruct, publicada por Xylolabs, orientada especificamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El problema que resuelve es el de disponer de un modelo vision-lenguaje de 8.7 mil millones de parametros con un peso empaquetado de 7,15 GB (frente a 16,38 GB en bf16) que pueda ejecutarse en hardware Tensix sin degradar de forma apreciable la calidad respecto al modelo original.

La cuantizacion aplica GPTQ con busqueda de exponente por bloque: las matrices MLP gate, up y down de las 36 capas se reducen a `bfloat4_b` (BFP4, 4,5 bits por peso) y las matrices de atencion q, k, v y o a `bfloat8_b` (BFP8, 8,5 bits por peso). El LM head, los embeddings, las normalizaciones y la torre de vision permanecen en bf16, resultando en una media de 6,99 bits por peso sobre el modelo de lenguaje.

Es relevante ahora porque abre la inferencia de un VLM de ultima generacion en aceleradores de Tenstorrent, una alternativa a las GPU de NVIDIA, con una perdida de fidelidad medida inferior a la de la cuantizacion Q4_K_M de llama.cpp (KL media de 0,0253 frente a 0,0322). La licencia Apache 2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL), con torre de vision y modelo de lenguaje de 36 capas |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GPTQ con busqueda de exponente por bloque: BFP4 (`bfloat4_b`) en MLP gate/up/down, BFP8 (`bfloat8_b`) en atencion q/k/v/o; LM head, embeddings, norms y torre de vision en bf16; media de 6,99 bits por peso |
| Idiomas soportados | en, ko (segun la model card y los tags del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (valores cuantizados almacenados sobre la rejilla bf16); empaquetado nativo para Tensix via TT-NN |

## Arquitectura y entrenamiento

El modelo base Qwen3-VL-8B-Instruct es un transformer multimodal que combina una torre de vision con un modelo de lenguaje de 36 capas; esta ficha cubre la version cuantizada, en la que solo se ha comprimido el modelo de lenguaje. La cuantizacion se realizo con la herramienta `tensix-bfp-gptq` v0.1.0 de Xylolabs, aplicando GPTQ con busqueda de exponente por bloque y calibracion sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano. Las matrices MLP (gate, up, down) se llevaron a BFP4 y las de atencion (q, k, v, o) a BFP8; el LM head, los embeddings, las normalizaciones y la torre de vision se mantuvieron en bf16.

La innovacion tecnica principal es el formato de bloque flotante (BFP) propio de Tensix: cada valor cuantizado se almacena en el repositorio como un valor bf16 situado sobre la rejilla de su formato, de modo que TT-NN lo empaqueta sin modificar ningun valor. El repositorio incluye `quant4.json`, que documenta el formato de cada proyeccion, y las herramientas `tools/pack_tensix.py` y `tools/verify_grid.py`, verificadas sobre ttsim con ttnn 0.81.1. No se dispone de informacion sobre el proceso de entrenamiento original del modelo base (composicion del dataset, RLHF/DPO) en la informacion proporcionada.

## Capacidades

- Generacion de texto e instrucciones conversacionales multirrespuesta a partir de entradas imagen-texto (pipeline `image-text-to-text`).
- Comprension de imagenes: descripcion, respuesta a preguntas visuales y razonamiento sobre el contenido de una imagen, gracias a la torre de vision conservada en bf16.
- Conversacion multi-turno mediante plantilla de chat (`apply_chat_template`).
- Capacidades multilingues limitadas a ingles y coreano segun la model card.
- Compatibilidad con la libreria `transformers` (`AutoModelForImageTextToText`, `AutoProcessor`) y con endpoints compatibles.
- Ejecucion en NPU Tensix (Wormhole, Blackhole) mediante el runner `tensix-runner` v0.1.0 y los kernels `tensix-kernels` v0.1.0.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, modo thinking ni audio.

## Casos de uso

- Descripcion automatica de imagenes en pipelines de accesibilidad: el modelo recibe una imagen y genera una descripcion en una frase o parrafo, con la torre de vision intacta en bf16 para preservar la calidad perceptiva.
- Respuesta a preguntas visuales (VQA) en entornos de borde con NPU Tensix: al ocupar 7,15 GB empaquetados, permite desplegar un VLM de 8B en aceleradores Wormhole o Blackhole con menor huella de memoria que la version bf16.
- Moderacion de contenido multimodal: clasificacion y descripcion de imagenes enviadas por usuarios, aprovechando la ventana de contexto del modelo base para incluir historial conversacional.
- Asistentes conversacionales en ingles y coreano: el modelo esta calibrado y evaluado en ambos idiomas, lo que lo hace adecuado para atencion al cliente bilingue en esos mercados.
- Prototipado e investigacion en hardware alternativo: validacion de pipelines de inferencia VLM sobre Tenstorrent usando `tensix-runner`, comparando la fidelidad de BFP4/BFP8 frente a bf16 con las herramientas incluidas.
- Evaluacion de tecnicas de cuantizacion: el repositorio sirve como referencia reproducible de GPTQ con busqueda de exponente por bloque, con scripts de empaquetado y verificacion de rejilla incluidos.
- Procesamiento por lotes de documentos escaneados con texto e imagenes: extraccion de descripciones y respuestas sobre capturas, siempre que el caso no requiera idiomas distintos de ingles o coreano.

## Benchmarks y rendimiento

Los datos disponibles son evaluaciones en host de los pesos (no mediciones en dispositivo) frente al modelo bf16 original, con KL media sobre textos fijos en ingles y coreano y acierto top-1 en la prediccion del siguiente token.

| Pesos | Formatos | Bits por peso | Tamano (GB) | KL media a bf16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---|---:|---:|---:|---:|---:|---:|
| bf16 (original) | todo bf16 | 16,00 | 16,38 | 0 | 100 | 30/33 | - |
| BFP4-MLP (este modelo) | atencion bfloat8_b, MLP bfloat4_b; head bf16 | 6,99 | 7,152 | 0,0253 | 93,06 | 31/33 | 0 |
| BFP4 | todas las proyecciones bfloat4_b; head bf16 | 6,25 | 6,397 | 0,0319 | 92,13 | 30/33 | 0 |
| Q4_K_M (llama.cpp) | F32 145, Q4_K 217, Q6_K 37 | 4,90 | 5,028 | 0,0322 | 91,82 | 30/33 | 0 |

En preguntas sobre imagenes, con la torre de vision en bf16, el modelo acerto 16 de 17 preguntas, con una perdida respecto a bf16. No se publican datos de velocidad ni de throughput en dispositivo en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 7,15 GB empaquetados para el modelo de lenguaje en Tensix; el repositorio ocupa 17,5 GB porque los valores cuantizados se almacenan como bf16.
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole.
- En GPU convencional: al cargarse con `transformers` en bf16 el modelo ocupa aproximadamente 16,38 GB, por lo que requiere GPU con al menos 24 GB de VRAM (RTX 4090, A100, H100) para inferencia comoda; no se proporcionan estimaciones para otras cuantizaciones en GPU.
- Despliegue en Tensix: `tensix-runner` v0.1.0 con `tensix-kernels` v0.1.0; empaquetado con `pack_tensix.py` (TT-NN) y verificacion con `verify_grid.py`.
- Despliegue en GPU/CPU: `transformers` con `AutoModelForImageTextToText`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este repositorio concreto.
- Latencia y throughput: no disponibles; la model card indica explicitamente que no se reportan mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KL media a bf16 | Tamano | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Este modelo (BFP4-MLP, Tensix) | 8,77 B | no disponible | 0,0253 | 7,15 GB (LM empaquetado) | Apache 2.0 | Hugging Face, orientado a Tensix |
| Xylolabs BFP4 (Tensix) | 8,77 B | no disponible | 0,0319 | 6,40 GB (LM empaquetado) | Apache 2.0 | Hugging Face, orientado a Tensix |
| Qwen3-VL-8B-Instruct Q4_K_M (llama.cpp) | 8,77 B | no disponible | 0,0322 | 5,03 GB | Apache 2.0 | Hugging Face (GGUF oficial de Qwen) |
| Qwen3-VL-8B-Instruct bf16 (base) | 8,77 B | no disponible | 0 (referencia) | 16,38 GB | Apache 2.0 | Hugging Face |

La comparativa se limita a variantes del mismo modelo base porque la informacion proporcionada no incluye datos de benchmarks frente a otros VLM de tamano similar.

## Limitaciones y advertencias

- La cuantizacion BFP4/BFP8 solo es nativa para Tensix; fuera de ese hardware los pesos se cargan como bf16 y se pierde la ventaja de tamano y, presumiblemente, parte de la eficiencia.
- El modelo solo declara soporte de ingles y coreano; el rendimiento en castellano no esta validado y podria degradarse.
- La evaluacion publicada es limitada: 33 respuestas y 17 preguntas visuales, insuficiente para garantizar calidad en produccion.
- No hay mediciones de latencia ni throughput en dispositivo; el rendimiento real en Wormhole/Blackhole no esta cuantificado.
- Riesgo de alucinacion inherente a los modelos de lenguaje y vision-lenguaje; no se documentan mitigaciones especificas en esta variante.
- Sesgos: no se documenta analisis de sesgos del modelo base ni de la cuantizacion; la calibracion con WikiText-2 y Wikipedia en coreano puede introducir desviaciones en dominios alejados de esos corpus.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-VL-8B-Instruct y de las herramientas de Xylolabs (`tensix-bfp-gptq`, `tensix-kernels`, `tensix-runner`).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente y poco validado por la comunidad.
- No se documenta soporte de tool calling ni de agentes multi-paso en esta variante.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen3-VL-8B-Instruct-Tenstorrent-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Variante BFP4 completa: https://huggingface.co/Xylolabs/Qwen3-VL-8B-Instruct-Tenstorrent-Tensix-BFP4
- Codigo de cuantizacion (tensix-bfp-gptq v0.1.0): https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Kernels Tensix (tensix-kernels v0.1.0): https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Runner Tensix (tensix-runner v0.1.0): https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper Qwen3-VL (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Paper Qwen2.5-VL (arXiv:2502.13923): https://arxiv.org/abs/2502.13923
- Paper Qwen2-VL (arXiv:2409.12191): https://arxiv.org/abs/2409.12191
- Paper Qwen-VL (arXiv:2308.12966): https://arxiv.org/abs/2308.12966
