# TelperionAI/Qwen3.8-27B-INT4-AWQ-GPTQ

## Resumen

TelperionAI/Qwen3.8-27B-INT4-AWQ-GPTQ es una cuantización mixta de precisión INT4 (W4A16) del modelo Qwen/Qwen3.8-27B, desarrollada por TelperionAI. Combina dos técnicas de compresión, AWQ (activation-aware scaling) y GPTQ (compensación basada en Hessiana), mediante la librería llm-compressor de vLLM. El resultado es un checkpoint de 25,1 GB que, según las mediciones del autor, mantiene una fidelidad al modelo BF16 original superior a la del lanzamiento oficial FP8 de Qwen, con 5,8 GB menos de peso. Esto lo hace relevante para entornos de producción donde se necesita calidad cercana al modelo sin cuantizar pero con requisitos de memoria reducidos, y para hardware sin soporte nativo de FP8 o FP4 (Turing o posterior).

El modelo base Qwen3.8-27B es un transformer multimodal (image-text-to-text) con 64 capas, tamaño oculto de 5120, atención con 24 cabezas de consulta y 4 cabezas clave/valor (GQA), e incorpora un módulo de atención lineal (GDN) y una torre de visión. La cuantización mantiene en BF16 el lm_head, los embeddings, las normas, los parámetros de estado del GDN y la torre de visión, mientras que las proyecciones MLP de las capas 0 a 55 se reducen a INT4 con grupo de 32 y asimetría (~4,6 bits efectivos), y el resto de proyecciones (MLP de capas 56-63, atención y GDN) se quedan en INT8. Además, se incluye la cabeza MTP (multi-token prediction) en BF16 para decodificación especulativa con vLLM. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con GQA, 64 capas, hidden size 5120, 24 query heads, 4 KV heads, atencion lineal (GDN) y torre de vision |
| Parametros totales | 27B (denominacion del modelo base; el checkpoint safetensors reporta 7.839.289.360 parametros, posible error de metadata) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT4 W4A16 (AWQ+GPTQ) con capas mixtas: MLP capas 0-55 en INT4 group-32 asimetrico, capas 56-63 en INT8, atencion en INT8, GDN en INT8, lm_head/embed_tokens/normas/vision tower en BF16 |
| Idiomas soportados | No disponible (el blend de calibracion incluye 10% multilingue, sin detallar idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers y vLLM) |

## Arquitectura y entrenamiento

Este checkpoint no es un modelo entrenado desde cero, sino una cuantizacion del modelo base Qwen/Qwen3.8-27B. La arquitectura subyacente es un transformer multimodal con atencion por grupos de consulta (GQA), 64 capas, dimension oculta de 5120, 24 cabezas de consulta y 4 de clave/valor, e incorpora un modulo de atencion lineal (GDN) ademas de la atencion clasica. Incluye una torre de vision que permite procesar imagenes junto con texto, y una cabeza MTP (multi-token prediction) para decodificacion especulativa.

El proceso de cuantizacion se realiza en dos pasadas. Primero, AWQ aplica escalado por canal de entrada en las rutas `post_attention_layernorm → {gate_proj, up_proj}` y `up_proj → down_proj`, plegando el factor reciproco en los pesos de la norma, lo que no anade coste de memoria ni de computo. Despues, GPTQ compensa el error de cuantizacion mediante informacion de la Hessiana, con `actorder="static"` y `dampening_frac=0.01`. La calibracion se realizo con 924 secuencias de 1024 tokens de un blend Nemotron-v2 equilibrado: 25% codigo, 25% matematicas, 20% STEM, 20% chat y 10% multilingue. El `lm_head` y los embeddings se mantienen en BF16, igual que en el lanzamiento FP8 oficial de Qwen.

## Capacidades

- Generacion de texto, razonamiento, codigo y matematicas, heredadas del modelo base Qwen3.8-27B (el blend de calibracion incluye estas categorias).
- Procesamiento multimodal imagen-texto: al mantener la torre de vision en BF16, el modelo conserva la capacidad de entender y responder sobre imagenes.
- Decodificacion especulativa mediante la cabeza MTP incluida en BF16, compatible con vLLM (`speculative_config={"method": "mtp", "num_speculative_tokens": 2}`).
- Inferencia de alta fidelidad: segun las mediciones del autor, el acuerdo top-1 con el modelo BF16 es del 96,30%, superior al FP8 oficial (96,15%).
- Compatibilidad con vLLM y transformers, con soporte para tensor parallelism.
- No se especifican capacidades de tool calling, function calling, agentes o modo thinking en la informacion proporcionada; estas dependen del modelo base y no estan confirmadas en esta cuantizacion.

## Casos de uso

- Despliegue en produccion con vLLM en GPUs sin soporte FP8/FP4: al requerir solo compute capability >= 7.5 (Turing), el modelo puede ejecutarse en RTX 3090, RTX 4090, A100 o H100, donde las rutas FP8 no estan disponibles. Es adecuado para servir un modelo de 27B con calidad cercana al BF16 en hardware Ampere o Ada.
- Inferencia de alta fidelidad en entornos donde la coherencia con el modelo original es critica: por ejemplo, en pipelines de generacion de codigo o analisis de documentos donde pequenas divergencias pueden alterar el resultado. El autor reporta una tasa de errores "confident" (discrepancias donde el modelo base tenia alta confianza) de solo 0,93%, frente al 1,35% de otra cuantizacion INT4 y al 0,08% del FP8.
- Procesamiento multimodal de imagenes y texto: gracias a la torre de vision en BF16, el modelo puede utilizarse para tareas como descripcion de imagenes, respuesta a preguntas visuales o extraccion de informacion de capturas, manteniendo la cuantizacion en las capas de texto.
- Reduccion de latencia con decodificacion especulativa: la cabeza MTP incluida permite usar vLLM con `mtp` para acelerar la generacion, aunque la tasa de aceptacion no ha sido medida por el autor.
- Evaluacion y experimentacion en entornos con memoria limitada: con 25,1 GB, el modelo cabe en una GPU de 32 GB o en configuraciones de dos GPUs de 16 GB con tensor parallelism. La variante GDN-4bit (22,6 GB) es una alternativa mas ajustada para tarjetas de 24 GB, aunque sigue siendo justa con la cache KV.
- Sustitucion de checkpoints FP8 en infraestructura existente: al ser 5,8 GB mas ligero que el FP8 oficial y ofrecer mejor fidelidad, puede reemplazarlo en despliegues donde el ahorro de memoria sea prioritario y el hardware no requiera rutas FP8.

## Benchmarks y rendimiento

El autor proporciona mediciones propias sobre 142.727 tokens de salida auto-destilada en modo thinking y 200 generaciones greedy, ejecutadas con vLLM 0.27.1, tensor parallelism 2 y 2x B300. La tabla compara este checkpoint con el FP8 oficial, otra cuantizacion INT4 (cyankiwi) y una construccion NVFP4 propia. Las columnas de discrepancia se dividen por el margen de confianza del modelo base (top1-top2 logprob): `near-tie` <0.5, `moderate` 0.5-2, `confident` 2-5, `certain` >5. Solo las dos ultimas se consideran dano real. `divmed` es la mediana del indice de token donde la generacion diverge del BF16.

| Checkpoint | Tamano | top-1 | near-tie | moderate | confident | certain | divmed | tok/s |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Qwen/Qwen3.8-27B-FP8 (referencia 8-bit) | 30,9 GB | 96,15% | 22,70% | 3,48% | 1,45% | 0,08% | 47 | 8711 |
| **Este modelo (INT4 AWQ+GPTQ)** | **25,1 GB** | **96,30%** | **22,29%** | **3,52%** | **0,93%** | **0,09%** | **48** | 4617 |
| cyankiwi/Qwen3.8-27B-AWQ-INT4 | 21,0 GB | 94,35% | 33,74% | 5,59% | 1,35% | 0,12% | 29 | 4787 |
| NVFP4 propio (AWQ+AutoRound) | 24,7 GB | 93,38% | 34,18% | 8,67% | 1,85% | 0,17% | 28 | 10590 |

La negrita marca el mejor valor entre los checkpoints de 4 bits; la fila FP8 es una referencia a otra precision y clase de tamano, por lo que se excluye de la comparacion. Los tamanos incluyen ~0,85 GB de la cabeza MTP en BF16. El autor advierte que la perplejidad se excluye deliberadamente porque en este modelo esta anticorrelacionada con la calidad: el checkpoint FP4 con mejor perplejidad fue el que peor dano mostro en la categoria `certain`. No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 25,1 GB para los pesos (sin contar cache KV), por lo que no cabe en una GPU de 24 GB. Se necesita una GPU de 32 GB o dos GPUs de 16 GB con tensor parallelism. La variante GDN-4bit (22,6 GB) se acerca mas a caber en 24 GB, pero sigue siendo ajustada una vez incluida la cache KV.
- GPU recomendadas: cualquier GPU con compute capability >= 7.5 (Turing o posterior). Ejemplos validos: RTX 3090, RTX 4090, A100, H100, B300. En Ampere y Ada, Marlin INT4 esta bien optimizado; en Blackwell, el rendimiento es inferior al de NVFP4 nativo.
- Opciones de despliegue: vLLM (recomendado, con soporte para tensor parallelism y decodificacion especulativa MTP), y transformers (libreria). No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: 4617 tok/s medidos en 2x B300 con TP=2. En Ampere el rendimiento sera menor, aunque Marlin INT4 esta comparativamente bien afinado en esa arquitectura. El autor senala que en Blackwell el throughput es ~2,3x inferior al de su construccion NVFP4 (10590 tok/s).

## Comparativa con modelos similares

| Modelo | Tamano | Precision | top-1 vs BF16 | confident | certain | tok/s (B300) | Licencia |
|---|---|---|---:|---:|---:|---:|---|
| TelperionAI/Qwen3.8-27B-INT4-AWQ-GPTQ (este) | 25,1 GB | INT4 mixto (AWQ+GPTQ) | 96,30% | 0,93% | 0,09% | 4617 | Apache-2.0 |
| Qwen/Qwen3.8-27B-FP8 (oficial) | 30,9 GB | FP8 | 96,15% | 1,45% | 0,08% | 8711 | Apache-2.0 |
| cyankiwi/Qwen3.8-27B-AWQ-INT4 | 21,0 GB | INT4 (AWQ) | 94,35% | 1,35% | 0,12% | 4787 | Apache-2.0 |

Este checkpoint ofrece la mejor fidelidad entre las cuantizaciones de 4 bits comparadas, con un coste de 4,1 GB adicionales frente a la alternativa de cyankiwi, pero con una ventaja clara en acuerdo con el BF16 y en dano en las categorias de alta confianza. Frente al FP8 oficial, es 5,8 GB mas ligero y ligeramente superior en top-1, aunque con un throughput notablemente menor en hardware Blackwell. La eleccion entre INT4 y NVFP4 depende del hardware: en Blackwell, NVFP4 es mucho mas rapido; en Ampere o Ada, INT4 es la unica opcion viable.

## Limitaciones y advertencias

- El checkpoint de 25,1 GB no cabe en una GPU de 24 GB; se necesita al menos 32 GB o configuracion multi-GPU. La variante GDN-4bit (22,6 GB) es mas ajustada pero sigue siendo justa con la cache KV.
- El throughput en Blackwell es ~2,3x inferior al de una cuantizacion NVFP4 equivalente. Este checkpoint prioriza la fidelidad sobre la velocidad.
- La evaluacion se realizo sobre un unico corpus auto-destilado; los margenes frente al FP8 y a cyankiwi son estadisticamente solidos pero no se han replicado en una segunda distribucion ni en tareas downstream.
- La perplejidad no es un indicador fiable de calidad para este modelo; el autor la excluye deliberadamente por estar anticorrelacionada con el rendimiento real.
- El numero de parametros reportado en el safetensors (7.839.289.360) es inconsistente con la denominacion de 27B del modelo base; se recomienda verificar antes de usar en sistemas que dependan de ese dato.
- No se especifican la longitud de contexto ni los idiomas soportados en la informacion proporcionada; es necesario consultar la documentacion del modelo base Qwen3.8-27B para conocer estos limites.
- La cabeza MTP esta incluida y verificada para cargar y generar, pero la tasa de aceptacion no ha sido medida; el beneficio real de la decodificacion especulativa no esta cuantificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TelperionAI/Qwen3.8-27B-INT4-AWQ-GPTQ
- Variante GDN-4bit (22,6 GB): https://huggingface.co/TelperionAI/Qwen3.8-27B-INT4-AWQ-GPTQ-gdn4
- Variante abliterated (basada en Huihui): https://huggingface.co/TelperionAI/Huihui-Qwen3.8-27B-abliterated-INT4-AWQ-GPTQ
- Ficha en LLM Explorer: https://llm-explorer.com/model/TelperionAI%2FQwen3.8-27B-INT4-AWQ-GPTQ,7FBYtQCENFaTLoNlHLlCrM
- Grafo de arquitectura en HF Viewer: https://hfviewer.com/TelperionAI/Qwen3.8-27B-INT4-AWQ-GPTQ-gdn4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
