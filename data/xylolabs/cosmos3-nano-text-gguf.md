# Xylolabs/Cosmos3-Nano-Text-GGUF

## Resumen

Cosmos3-Nano-Text-GGUF es una cuantizacion en formato GGUF del modelo nvidia/Cosmos3-Nano, publicada por Xylolabs para su uso con llama.cpp en CUDA, Metal o CPU. El modelo base es un modelo de NVIDIA de 8.190.735.360 parametros que, segun la model card del cuantizador, parte de Qwen3-VL-8B; Xylolabs ha extraido la torre de comprension de texto, la ha renombrado a nombres de tensor compatibles con Qwen3, la ha convertido a GGUF y la ha cuantizado. El resultado es un modelo puramente de generacion de texto, sin la parte de vision del original.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de ~8B de NVIDIA en hardware de consumo y en estaciones de trabajo sin GPU dedicada de gran capacidad, con cinco niveles de cuantizacion documentados y con metricas de degradacion (KL medio y coincidencia top-1 frente a BF16) medidas sobre 16.272 posiciones de texto en ingles y coreano. El repositorio ocupa 30,4 GB e incluye tokenizador y plantilla de chat originales en cada fichero.

La licencia es OpenMDW-1.1 (la licencia de NVIDIA para Cosmos3-Nano), con la Apache License 2.0 del equipo Qwen conservada en el repositorio por la procedencia del modelo base. Xylolabs declara no estar afiliado ni respaldado por NVIDIA, Qwen ni Alibaba Cloud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (torre de texto extraida de Qwen3-VL-8B, pesos en nombres de tensor compatibles con Qwen3) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 256K segun la tabla de hardware del autor (64K en 24 GB, 128K en 48 GB, 256K en 80 GB o mas) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, IQ4_XS, IQ4_XS-imat |
| Idiomas soportados | en, ko |
| Licencia | openmdw-1.1 (con Apache License 2.0 del equipo Qwen conservada en el repo) |
| Formato de pesos | GGUF (un fichero por cuantizacion, con tokenizador y plantilla de chat incluidos) |

## Arquitectura y entrenamiento

El modelo base, nvidia/Cosmos3-Nano, es un transformer de 8.190.735.360 parametros que, segun la model card del cuantizador, arranca de Qwen3-VL-8B. Xylolabs ha aislado la torre de comprension de texto, la ha reexpresado con nombres de tensor compatibles con Qwen3, la ha convertido a GGUF y la ha cuantizado con llama.cpp (commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior). Esta ficha cubre exclusivamente esa variante de texto: las capacidades de vision del modelo original no estan presentes en estos ficheros.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO en la informacion proporcionada. La innovacion tecnica documentada por el cuantizador es el uso de una importance matrix (imatrix) para la cuantizacion IQ4_XS: la variante `IQ4_XS-imat` reduce el KL medio frente a BF16 de 0,0386 a 0,0222 y eleva la coincidencia top-1 de 90,27% a 92,26%, con un tamano practicamente identico (4,56 GB frente a 4,59 GB). Las metricas de degradacion se midieron sobre 16.272 posiciones de texto en ingles y coreano, tomando como referencia una pasada en BF16 con transformers.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation y el tag incluye `conversational`; cada fichero GGUF incluye la plantilla de chat original.
- Razonamiento y comprension de texto en ingles y coreano, los dos idiomas declarados en la model card.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede servirse a traves de infraestructura compatible con endpoints de Hugging Face.
- Ejecucion en llama.cpp: soportado en CUDA, Metal y CPU con `llama-cli` y `llama-server`, con `--jinja` para aplicar la plantilla de chat.
- Capacidades de vision: no disponibles en esta variante (la torre de texto se extrajo del modelo multimodal original).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia conversacional en ingles y coreano: el modelo puede mantener dialogos multi-turno usando la plantilla de chat incluida en el GGUF, con contexto configurable hasta 64K en una GPU de 24 GB y hasta 256K en 80 GB o mas, lo que permite conversaciones largas con historial extenso.
- Despliegue en estaciones de trabajo sin GPU de datacenter: con el fichero Q8_0 (8,7 GB) cabe en una RTX 4090 o RTX 3090 de 24 GB con contexto de 64K, segun la tabla del autor, lo que permite prototipar y servir el modelo en hardware ya disponible.
- Procesamiento de documentos largos en coreano: con contexto de 128K en 48 GB (RTX 6000 Ada o 2 x 24 GB) se pueden resumir o extraer informacion de documentos extensos en los dos idiomas soportados.
- Ejecucion en portatiles y equipos Apple Silicon: el autor documenta Mac Studio M5 Max y M5 Ultra con memoria unificada de 128 a 512 GB, donde el modelo puede correr con contexto de 256K sin GPU dedicada.
- Servicio local con llama-server: al ser compatible con `llama-server`, puede exponerse como API HTTP en una maquina propia para integrarlo en herramientas internas, respetando los terminos de OpenMDW-1.1.
- Experimentacion con cuantizacion: los cinco niveles publicados con metricas KL y top-1 permiten elegir el compromiso tamano/calidad; por ejemplo, IQ4_XS-imat (4,56 GB) ofrece un KL de 0,0222 frente a BF16, adecuado para entornos con memoria muy limitada.
- Evaluacion comparativa de modelos de NVIDIA: util para investigadores que quieran medir el comportamiento del tower de texto de Cosmos3-Nano sin necesidad de infraestructura para el modelo multimodal completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo publica metricas de fidelidad de la cuantizacion frente a BF16:

| Cuantizacion | Tamano | KL medio vs BF16 | Coincidencia top-1 vs BF16 |
|---|---|---|---|
| Q8_0 | 8,71 GB | 0,0013 | 97,84% |
| Q6_K | 6,73 GB | 0,0044 | 96,10% |
| Q5_K_M | 5,85 GB | 0,0090 | 94,79% |
| IQ4_XS | 4,59 GB | 0,0386 | 90,27% |
| IQ4_XS-imat | 4,56 GB | 0,0222 | 92,26% |

Las metricas cubren 16.272 posiciones de texto en ingles y coreano, con una pasada en BF16 mediante transformers como referencia.

## Requisitos de hardware

- VRAM estimada: el fichero Q8_0 ocupa 8,71 GB; a ello hay que sumar la cache KV en f16 al contexto elegido y unos 2 GB de runtime, segun la regla del autor (el total debe quedar por debajo del 90% de la memoria disponible).
- GPU recomendadas por el autor: RTX 4090 / RTX 3090 (24 GB, contexto 64K), RTX 5090 (32 GB, 64K), RTX 6000 Ada o 2 x 24 GB (48 GB, 128K), H100 (80 GB, 256K), RTX PRO 6000 Blackwell (96 GB, 256K), H200 (141 GB, 256K), B200 (192 GB, 256K), B300 (288 GB, 256K).
- Cabe en GPU de consumo: si, con Q8_0 en RTX 4090, RTX 3090 y RTX 5090; con cuantizaciones menores (IQ4_XS-imat, 4,56 GB) el margen de contexto aumenta.
- Memoria unificada: DGX Spark (128 GB), Mac Studio M5 Max (128 GB) y M5 Ultra (256 o 512 GB), todos con contexto de 256K segun la tabla del autor.
- Opciones de despliegue: llama.cpp (compilacion con `-DGGML_CUDA=ON` para NVIDIA), `llama-cli` y `llama-server`; se requiere el commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior. No se documentan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Cosmos3-Nano-Text-GGUF (esta ficha) | 8.190.735.360 | hasta 256K (segun hardware) | en, ko | openmdw-1.1 | GGUF |
| nvidia/Cosmos3-Nano (modelo base) | 8.190.735.360 | no disponible | no disponible | openmdw-1.1 | safetensors (original) |
| Qwen3-VL-8B (origen declarado del tower de texto) | no disponible | no disponible | no disponible | Apache 2.0 | no disponible |

No se dispone de datos de rendimiento en tareas que permitan una comparacion cuantitativa con alternativas de la misma categoria. La comparativa se limita a parametros, contexto, licencia y formato segun la informacion proporcionada.

## Limitaciones y advertencias

- Esta variante es solo de texto: la torre de vision del modelo original no esta incluida, por lo que no puede procesar imagenes.
- Solo se declaran ingles y coreano; el rendimiento en castellano no esta documentado y no deberia asumirse.
- Riesgo de alucinacion: no se han publicado evaluaciones de fiabilidad ni de tasas de alucinacion en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Licencia OpenMDW-1.1: es la licencia de NVIDIA para Cosmos3-Nano; deben revisarse sus terminos antes de cualquier uso comercial. El repositorio conserva ademas la Apache License 2.0 del equipo Qwen por la procedencia del modelo base.
- Xylolabs declara no estar afiliado ni respaldado por NVIDIA, Qwen ni Alibaba Cloud; la responsabilidad sobre el modelo base recae en NVIDIA.
- La cuantizacion introduce degradacion: incluso Q8_0 pierde un 2,16% de coincidencia top-1 frente a BF16, y IQ4_XS sin imatrix baja al 90,27%. Para tareas sensibles a la precision conviene usar Q8_0 o Q6_K.
- Requiere una version concreta o posterior de llama.cpp (`cd959bae...`); versiones anteriores pueden no cargar los tensores correctamente.
- No hay informacion sobre tool calling, agentes ni modo thinking, por lo que no deberia planificarse su uso en pipelines que dependan de esas capacidades sin verificacion previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Xylolabs/Cosmos3-Nano-Text-GGUF
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Nano
- Licencia en el repositorio: https://huggingface.co/Xylolabs/Cosmos3-Nano-Text-GGUF/blob/main/LICENSE
- Codigo llama.cpp (commit de referencia): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs (herramientas de cuantizacion): https://github.com/XylolabsInc/tensix-bfp-gptq
- Informe tecnico de Cosmos 3: enlazado desde la model card de nvidia/Cosmos3-Nano (no se proporciona URL directa en la informacion disponible)
