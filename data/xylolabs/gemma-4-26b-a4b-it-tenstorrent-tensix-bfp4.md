# Xylolabs/gemma-4-26B-A4B-it-Tenstorrent-Tensix-BFP4

## Resumen

Gemma 4 26B-A4B-it es un modelo multimodal de Google (Gemma Team) de tipo mezcla de expertos (MoE) con 26.544 millones de parametros totales, disenado para tareas de imagen-texto a texto con soporte conversacional. Esta ficha concreta, publicada por Xylolabs, no es el modelo original sino una cuantizacion del mismo para su ejecucion sobre aceleradores NPU de Tenstorrent (arquitecturas Tensix Wormhole y Blackhole), empaquetada en el formato propietario BFP4 (`bfloat4_b`).

La relevancia de esta publicacion radica en que demuestra la viabilidad de ejecutar un modelo MoE multimodal de 26B en hardware no convencional (NPUs de Tenstorrent) con un peso empaquetado de 15,271 GB, frente a los 50,47 GB del checkpoint BF16 original. La cuantizacion se aplica a las proyecciones de atencion, MLP y expertos enrutados, mientras que el LM head, los embeddings, las normas y la torre de vision permanecen en bf16.

El modelo base emplea una arquitectura MoE con 30 capas y enrutamiento por experto, con pesos distribuidos en safetensors y compatibilidad con la libreria `transformers`. La licencia es Apache 2.0, heredada del modelo base, y el repositorio incluye las herramientas de empaquetado y verificacion (`pack_tensix.py`, `verify_grid.py`) bajo la misma licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con torre de vision; 30 capas |
| Parametros totales | 26.544.133.710 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) para proyecciones de atencion, MLP y expertos; bf16 para LM head, embeddings, normas, router y vision; compatible con empaquetado `bfloat8_b` |
| Idiomas soportados | no disponible (evaluacion en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetado Tensix BFP4); tamano del repo 53,1 GB, empaquetado 15,271 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal de 30 capas con proyecciones de atencion (q, k, o en las 30 capas; v en 25 capas) y proyecciones MLP (gate, up, down) junto con expertos enrutados (down, gate, up). Incluye una torre de vision (`vision_tower`) y un proyector (`embed_vision`) que permanecen en bf16 sin cuantizar. Los detalles sobre el numero de tokens de entrenamiento, la composicion del dataset y el proceso de alineacion (RLHF/DPO) del modelo base no estan disponibles en la informacion proporcionada.

La innovacion tecnica de esta publicacion es el pipeline de cuantizacion: GPTQ combinado con una busqueda de exponente por bloque para producir el formato block-floating-point `bfloat4_b`, junto con herramientas de empaquetado y verificacion que garantizan la equivalencia exacta entre los tensores empaquetados y los valores originales (round-trip verificado con `ttnn` sobre el simulador `ttsim` de Blackhole, version 0.81.1). El router por experto y su escala se mantienen en bf16 para preservar la calidad del enrutamiento.

## Capacidades

- Generacion de texto conversacional multi-turno mediante plantilla de chat (`apply_chat_template`).
- Procesamiento de imagen y texto (pipeline `image-text-to-text`) gracias a la torre de vision en bf16.
- Razonamiento y respuesta a preguntas generales (el ejemplo de la model card es una pregunta factual sobre la capital de Francia).
- Ejecucion sobre NPUs Tenstorrent Tensix (Wormhole, Blackhole) mediante `ttnn`, con empaquetado directo a DRAM del dispositivo.
- Compatibilidad con `transformers` (`AutoModelForCausalLM`, `AutoTokenizer`) en modo estandar con `device_map="auto"`.
- Soporte de tool calling, function calling, agentes y modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia multimodal en hardware Tenstorrent: el modelo se empaqueta directamente en DRAM de la NPU con `ttnn.as_tensor` en `bfloat4_b`, lo que permite desplegar un MoE de 26B en aceleradores Wormhole o Blackhole sin GPU convencional, reduciendo el peso a 15,271 GB.
- Despliegue en entornos con restricciones de memoria: la reduccion de 50,47 GB (BF16) a 15,271 GB permite alojar el modelo en nodos con VRAM limitada o en placas Tensix con DRAM acotada, manteniendo un top-1 del 87,24 % respecto al BF16.
- Procesamiento de documentos con imagen y texto: al conservar la torre de vision en bf16, el modelo puede recibir pares imagen-texto para tareas de descripcion, extraccion o respuesta a preguntas sobre capturas y documentos escaneados.
- Evaluacion y validacion de pipelines de cuantizacion: las herramientas `pack_tensix.py` y `verify_grid.py` permiten verificar matriz a matriz la equivalencia numerica, util para equipos que integran cuantizacion BFP4 en sus propias cadenas de despliegue.
- Chat conversacional de proposito general: la plantilla de chat y el formato `transformers` permiten integrarlo en servicios de atencion al cliente o asistentes internos, con la salvedad de que la longitud de contexto no esta documentada.
- Investigacion en formatos block-floating-point: el modelo sirve como referencia reproducible para comparar BFP4 frente a Q4_K_M de llama.cpp en terminos de divergencia KL (0,1464 frente a 0,1249) y top-1 (87,24 % frente a 88,16 %).

## Benchmarks y rendimiento

Los unicos datos publicados son metricas de fidelidad de cuantizacion frente al BF16, medidas sobre 8.048 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), con plantilla de chat:

| Modelo | Tamano (GB) | KL media a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (google/gemma-4-26B-A4B-it) | 50,47 | 0 | 100 |
| Este modelo (BFP4) | 15,271 | 0,14638 | 87,24 |
| Q4_K_M (llama.cpp) | 16,796 | 0,1249 | 88,16 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el empaquetado Tensix ocupa 15,271 GB; en modo `transformers` con `dtype="bfloat16"` y `device_map="auto"` el modelo se distribuye entre dispositivos, pero el checkpoint BF16 de referencia ocupa 50,47 GB, por lo que la carga completa en bf16 requiere al menos esa capacidad agregada.
- GPU recomendadas: no especificadas en la informacion disponible; el destino principal son NPUs Tenstorrent Tensix (Wormhole, Blackhole).
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada; el peso empaquetado de 15,271 GB queda por encima de la VRAM de las RTX 4090 (24 GB) solo si se mantiene integro en un unico dispositivo, pero no hay datos de despliegue en consumer GPU.
- Opciones de despliegue: `transformers` (con `AutoModelForCausalLM`), `ttnn` 0.81.1 sobre Tensix (verificado en el simulador `ttsim` de Blackhole), herramientas `tensix-bfp-gptq`, `tensix-kernels` y `tensix-runner` v0.1.0. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano | KL media a BF16 | Top-1 (%) | Licencia |
|---|---|---:|---:|---:|---:|---|
| Este modelo (BFP4 Tensix) | 26,54B totales | no disponible | 15,271 GB | 0,14638 | 87,24 | Apache 2.0 |
| google/gemma-4-26B-A4B-it (BF16) | 26,54B totales | no disponible | 50,47 GB | 0 | 100 | Apache 2.0 |
| Q4_K_M de llama.cpp (mismo checkpoint) | 26,54B totales | no disponible | 16,796 GB | 0,1249 | 88,16 | Apache 2.0 |

La comparativa se limita al mismo checkpoint en distintas precisiones, ya que no se han proporcionado datos de otros modelos de la misma categoria.

## Limitaciones y advertencias

- La cuantizacion BFP4 introduce una divergencia medible frente al BF16: KL media de 0,14638 y top-1 del 87,24 %, ligeramente peor que Q4_K_M (0,1249 y 88,16 %) con un tamano algo menor.
- La evaluacion de fidelidad cubre solo 8.048 posiciones de ingles y coreano; no hay datos sobre otros idiomas ni sobre tareas de vision.
- La longitud de contexto no esta documentada en la informacion disponible, lo que impide garantizar conversaciones de contexto largo.
- El modelo esta optimizado para NPUs Tenstorrent; el rendimiento real en GPU no esta verificado y el ejemplo de la model card usa el simulador `ttsim`, no hardware fisico.
- No se especifican sesgos conocidos ni tasas de alucinacion del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el repositorio no incluye el fichero LICENSE original del modelo base; el autor indica que `LICENSE` contiene el texto estandar y que los cambios se documentan en `NOTICE`.
- El autor declara no estar afiliado a Tenstorrent, lo que implica que el soporte de kernels y runner depende de Xylolabs.
- Solo 225 descargas y 1 like en el momento de la consulta: ecosistema de usuarios muy reducido y poca validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-26B-A4B-it-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Codigo de cuantizacion (tensix-bfp-gptq, commit 5c52065): https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
