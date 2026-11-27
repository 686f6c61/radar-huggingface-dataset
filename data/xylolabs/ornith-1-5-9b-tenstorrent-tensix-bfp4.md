# Xylolabs/Ornith-1.5-9B-Tenstorrent-Tensix-BFP4

## Resumen

Ornith-1.5-9B-Tenstorrent-Tensix-BFP4 es una cuantizacion del modelo multimodal Ornith-1.5-9B (desarrollado por Ornith AI) realizada por Xylolabs, optimizada especificamente para su ejecucion en aceleradores NPU de Tenstorrent con arquitectura Tensix (Wormhole y Blackhole). El modelo base es un transformer de 9.653 millones de parametros construido sobre Qwen3.5, con capacidad de procesamiento de imagen y texto (image-text-to-text) y un modulo MTP (multi-token prediction) integrado.

La aportacion principal de esta version es el formato de pesos BFP4/BFP8 (bfloat4_b y bfloat8_b), un esquema de cuantizacion de bloque orientado al hardware Tensix que reduce el peso del modelo de lenguaje de 17,91 GB en bf16 a 8,23 GB empaquetado. Las proyecciones de salida de Gated DeltaNet y de atencion se mantienen en BFP8, mientras que el resto de proyecciones usan BFP4; el LM head, los embeddings, las normas, el vision tower y el modulo MTP permanecen en bf16.

El modelo es relevante porque demuestra la viabilidad de desplegar un modelo multimodal de ~9,6B en NPUs de Tenstorrent con una degradacion de calidad controlada: la divergencia KL media respecto a bf16 es de 0,0545, frente a 0,0375 del Q4_K_M oficial de llama.cpp, un factor de 1,46 que se mantiene dentro del umbral de 1,5 del test de precision de cuantizacion. La licencia MIT y la compatibilidad con `transformers` facilitan su evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Gated DeltaNet y atencion, 32 capas decoder, vision tower y modulo MTP; base Qwen3.5 |
| Parametros totales | 9.653.104.368 (9,65B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (bfloat4_b) para proyecciones q/k/v, z, a, b, atencion q/k/v y MLP gate/up/down; BFP8 (bfloat8_b) para proyecciones de salida de Gated DeltaNet y atencion; bf16 para LM head, embeddings, normas, vision tower y MTP |
| Idiomas soportados | en, ko |
| Licencia | MIT |
| Formato de pesos | safetensors, empaquetado Tensix (8,23 GB para el modelo de lenguaje) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B emplea una arquitectura transformer de 32 capas decoder que combina capas de Gated DeltaNet con capas de atencion, e incorpora un vision tower para entrada de imagenes y un modulo MTP (multi-token prediction). Esta version cuantizada conserva intactos en bf16 el vision tower (`model.visual`), el modulo MTP (`mtp`), el LM head, los embeddings y las normas, y aplica cuantizacion de bloque solo a las proyecciones lineales del decoder.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. La cuantizacion se realizo con la herramienta tensix-bfp-gptq v0.1.0: las proyecciones de salida usan redondeo al mas cercano a bfloat8_b y el resto de proyecciones usan GPTQ con busqueda de exponente a bfloat4_b. Los scripts `pack_tensix.py` y `verify_grid.py` se ejecutaron sobre ttsim con ttnn 0.81.1 y verifican que ningun valor cambia tras el empaquetado.

## Capacidades

- Generacion de texto conversacional y respuesta a instrucciones, con soporte de plantilla de chat (`apply_chat_template`).
- Procesamiento de imagen y texto (pipeline image-text-to-text), gracias al vision tower conservado en bf16.
- Modo thinking configurable: la plantilla de chat admite `enable_thinking=True/False`, lo que permite activar o desactivar razonamiento extendido.
- Prediccion multi-token mediante el modulo MTP, orientada a decodificacion especulativa y aceleracion de generacion.
- Capacidades multilingues limitadas a ingles (en) y coreano (ko) segun la model card.
- Inferencia en hardware Tenstorrent Tensix (Wormhole, Blackhole) ademas de ejecucion estandar con `transformers`.
- No se declara soporte explicito de tool calling ni de function calling en la informacion disponible.

## Casos de uso

- Despliegue en NPUs de Tenstorrent: el modelo esta empaquetado para Wormhole y Blackhole con kernels y runner propios (tensix-kernels y tensix-runner v0.1.0), lo que permite ejecutar inferencia de un modelo de ~9,6B en hardware Tensix con 8,23 GB de pesos en lugar de 17,91 GB en bf16.
- Servicio conversacional en ingles y coreano: la plantilla de chat y el modo thinking permiten construir asistentes multi-turno con razonamiento opcional, adecuados para mercados angloparlante y coreano.
- Procesamiento de documentos con imagenes: el vision tower en bf16 permite tareas image-text-to-text como descripcion de imagenes, extraccion de informacion de capturas o analisis de documentos escaneados.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye metricas de divergencia KL y top-1 frente a bf16 y frente a Q4_K_M de llama.cpp, lo que lo convierte en un banco de pruebas util para investigar el impacto de BFP4/BFP8 en calidad.
- Generacion acelerada con MTP: el modulo de prediccion multi-token puede aprovecharse para decodificacion especulativa en entornos de baja latencia, reduciendo el numero de pasos de decodificacion.
- Prototipado con `transformers`: el codigo de inicio rapido permite cargar el modelo con `AutoModelForImageTextToText` y `device_map="auto"` en bf16 para validar comportamiento antes de migrar a Tensix.
- Investigacion en cuantizacion de bloque: la combinacion de BFP4 con BFP8 en proyecciones de salida y GPTQ con busqueda de exponente sirve como referencia reproducible para estudiar esquemas de cuantizacion orientados a hardware.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluacion de la cuantizacion frente a bf16):

| Pesos | Formatos | Tamano (GB) | KL media a bf16 | Top-1 (%) | Test de precision |
|---|---|---:|---:|---:|---|
| bf16 (original) | todos bf16 | 17,91 | 0 | 100 | - |
| BFP4-Out8 (este modelo) | salidas DeltaNet/atencion bfloat8_b; resto bfloat4_b con GPTQ | 8,231 | 0,0545 | 89,36 | pasado |
| Q4_K_M (llama.cpp) | F32 177, Q4_K 217, Q6_K 33 | 5,780 | 0,0726 | 87,44 | informativo |
| Q4_K_M-imat (llama.cpp, oficial) | F32 177, Q4_K 217, Q6_K 33, imatrix | 5,780 | 0,0375 | 91,39 | referencia |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 8,23 GB para el modelo de lenguaje empaquetado en Tensix; el repositorio completo ocupa 19,3 GB, por lo que se recomienda al menos 20 GB de almacenamiento y, en ejecucion con `transformers` en bf16, capacidad para los pesos completos (17,91 GB del modelo de lenguaje).
- GPU recomendadas: no se especifican en la informacion disponible; el destino principal es hardware Tenstorrent Tensix (Wormhole, Blackhole) mediante tensix-runner v0.1.0.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el tamano empaquetado de 8,23 GB sugiere que podria caber en GPUs con 12-16 GB de VRAM si el runner lo soporta, pero no se declara.
- Opciones de despliegue: `transformers` (con `AutoModelForImageTextToText`), tensix-runner v0.1.0 y kernels tensix-kernels v0.1.0 para Tensix; no se mencionan vLLM, llama.cpp, Ollama ni TGI para estos pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Tamano | Licencia | Hardware objetivo |
|---|---|---|---|---|---|---|
| Ornith-1.5-9B-Tenstorrent-Tensix-BFP4 | 9,65B | no disponible | BFP4/BFP8 + bf16 | 8,23 GB (LM) | MIT | Tenstorrent Tensix |
| Ornith-1.5-9B (bf16, base) | 9,65B | no disponible | bf16 | 17,91 GB | MIT | GPU generica |
| Ornith-1.5-9B-GGUF Q4_K_M (llama.cpp) | 9,65B | no disponible | Q4_K/Q6_K/F32 | 5,78 GB | MIT | CPU/GPU con llama.cpp |

La comparativa se limita a las variantes del mismo modelo base, ya que no se proporcionan datos de modelos alternativos de otros autores en la informacion disponible.

## Limitaciones y advertencias

- Idiomas limitados a ingles y coreano; no se declara soporte de castellano ni de otros idiomas.
- La cuantizacion introduce degradacion medible: KL media de 0,0545 frente a bf16 y top-1 del 89,36 %, frente al 91,39 % del Q4_K_M con imatrix.
- El test de precision se declara "pasado" con un factor de 1,46 respecto al Q4_K_M oficial, cerca del umbral de 1,5, por lo que pequenos cambios en el uso pueden acercarse al limite aceptado.
- El modelo esta disenado y empaquetado para Tensix; su ejecucion en GPU generica con `transformers` requiere cargar los pesos completos y no se documenta el rendimiento en ese escenario.
- La model card advierte de que el repositorio base no incluye fichero de licencia; el fichero LICENSE de este repositorio contiene el texto MIT estandar nombrando a los autores del modelo base, y la licencia Apache 2.0 de Qwen3.5 se incluye en UPSTREAM_QWEN_LICENSE.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad en la informacion proporcionada.
- El modelo no declara soporte de tool calling ni de function calling, lo que limita su uso en pipelines de agentes que dependan de esas capacidades.
- La fecha de creacion del repositorio (2026-11-17) y la de actualizacion (2026-11-27) indican que el modelo es reciente y con pocas descargas (144) y ningun "like", por lo que la validacion comunitaria es practicamente inexistente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Ornith-1.5-9B-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- GGUF oficial Q4_K_M: https://huggingface.co/ornith-ai/Ornith-1.5-9B-GGUF
- Pagina de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Codigo de cuantizacion tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Kernels tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Runner tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
