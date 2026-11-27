# Xylolabs/NVIDIA-Nemotron-3-Nano-30B-A3B-GGUF

## Resumen

NVIDIA-Nemotron-3-Nano-30B-A3B-GGUF es la version cuantizada en formato GGUF del modelo nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16, un modelo de lenguaje de tipo Mixture-of-Experts (MoE) hibrido Mamba-Transformer desarrollado por NVIDIA. Esta publicacion corre a cargo de Xylolabs, que ha convertido los pesos originales en BF16 a formato GGUF para su ejecucion con llama.cpp en CUDA, Metal o CPU. El modelo esta pensado para razonamiento agentico eficiente: activa solo una fraccion de sus parametros por token gracias a la arquitectura MoE, lo que reduce el coste computacional en inferencia.

El modelo base cuenta con 31.577.940.288 parametros totales segun los metadatos de safetensors, y la nomenclatura "A3B" indica aproximadamente 3.000 millones de parametros activos por token. La arquitectura combina capas Mamba2 con capas de atencion Transformer, una tendencia reciente para mejorar la eficiencia en contextos largos. La model card de esta version GGUF declara soporte de contexto de hasta 256K tokens en configuraciones de hardware con memoria suficiente.

La relevancia de esta ficha radica en que ofrece una via practica para ejecutar un modelo MoE de ~30B parametros en hardware de consumo y estaciones de trabajo, con un unico fichero Q4_K_M de 24.515 GB que cabe en GPUs de 24 GB con offload parcial de expertos a RAM del sistema. La licencia es la NVIDIA Nemotron Open Model License, distinta de las licencias permisivas habituales, por lo que conviene revisarla antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrido Mamba-Transformer (Mamba2 + atencion) |
| Parametros totales | 31.577.940.288 |
| Parametros activos | ~3B (segun nomenclatura A3B; cifra exacta no disponible) |
| Longitud de contexto | Hasta 256K tokens en configuraciones con memoria suficiente; 32K con offload en 24 GB |
| Tipos de cuantizacion | Q4_K_M (publicado); Q3_K_M, Q5_K_M, Q6_K, Q8_0 mencionados en tabla de precision |
| Idiomas soportados | en, ko |
| Licencia | NVIDIA Nemotron Open Model License (etiquetada como "other") |
| Formato de pesos | GGUF (un fichero por cuantizacion) |

## Arquitectura y entrenamiento

El modelo base es un Mixture-of-Experts hibrido que intercala capas Mamba2 (modelo de espacio de estados) con capas de atencion Transformer. Esta combinacion busca reducir el coste de atencion cuadratica en secuencias largas manteniendo la capacidad expresiva de los Transformers. La nomenclatura "Nano-30B-A3B" indica 30B parametros totales con aproximadamente 3B activos por token, lo que permite un throughput alto en inferencia a cambio de mayor huella de memoria en reposo (hay que cargar todos los expertos aunque solo se activen unos pocos por token).

La model card de esta version GGUF no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO; esa informacion corresponde al modelo base de NVIDIA (paper arXiv:2512.20848), que no se incluye en los datos proporcionados. La innovacion tecnica destacable es precisamente la arquitectura hibrida Mamba-Transformer con MoE, orientada a razonamiento agentico eficiente. La conversion a GGUF la realiza Xylolabs y mantiene el tokenizer y la plantilla de chat originales.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag conversational).
- Razonamiento agentico y multi-step reasoning, segun el titulo del paper del modelo base ("Agentic Reasoning").
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion proporcionada.
- Capacidades multilingues limitadas a ingles (en) y coreano (ko) segun los metadatos.
- Ejecucion local via llama.cpp con soporte CUDA, Metal y CPU.
- Contexto largo de hasta 256K tokens en hardware con memoria suficiente.
- Plantilla de chat Jinja incluida en el fichero GGUF (`--jinja`).
- Capacidades de vision o audio: no disponibles en esta version.

## Casos de uso

- Razonamiento agentico local: el modelo puede ejecutar bucles de razonamiento multi-paso en una estacion de trabajo con una sola GPU de 24-48 GB, adecuado para prototipos de agentes autonomos sin depender de APIs externas.
- Procesamiento de documentos largos: con contexto de hasta 256K tokens en GPUs de 32 GB o mas, permite analizar contratos, informes o bases de codigo extensas en una sola pasada.
- Atencion al cliente automatizada en ingles y coreano: el modelo puede gestionar conversaciones multi-turno con contexto largo, desplegado con `llama-server` como backend compatible con la API de OpenAI (tag endpoints_compatible).
- Despliegue en hardware de consumo: el fichero Q4_K_M (24.515 GB) cabe en una RTX 4090 o RTX 3090 de 24 GB usando `--n-cpu-moe 52` para mantener los pesos de expertos en RAM del sistema, lo que permite inferencia local en un PC de gama alta.
- Investigacion en eficiencia de modelos MoE: util para estudiar el comportamiento de arquitecturas hibridas Mamba-Transformer en entornos con recursos limitados, comparando la precision de distintas cuantizaciones (Q3_K_M a Q8_0) frente a BF16.
- Generacion de codigo asistida en local: aunque no se confirma tool calling, el modelo puede integrarse en editores o pipelines de desarrollo que requieran inferencia privada sin salida a la nube, siempre que el caso de uso se limite a ingles o coreano.
- Prototipado en Apple Silicon: con Mac Studio de memoria unificada (128-512 GB) se puede ejecutar el modelo completo con contexto de 256K, util para equipos de investigacion sin GPUs NVIDIA.

## Benchmarks y rendimiento

La model card de esta version GGUF no incluye resultados de benchmarks estandar (MMLU, HumanEval, GSM8K). Si incluye una tabla de fidelidad de cuantizacion frente a BF16:

| Cuantizacion | Tamano | WikiText-2 KL | top-1 | Held-out KL | top-1 |
|---|---:|---:|---:|---:|---:|
| Q8_0 | 33.585 GB | 0.004506 | 96.922% | 0.006133 | 96.775% |
| Q6_K | 33.508 GB | 0.006065 | 96.544% | 0.008143 | 96.098% |
| Q5_K_M | 26.040 GB | 0.017083 | 94.064% | 0.020657 | 93.716% |
| Q4_K_M | 24.515 GB | 0.026902 | 92.348% | 0.033647 | 91.853% |
| Q3_K_M | 19.849 GB | 0.090981 | 86.779% | 0.091236 | 86.706% |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 24.515 GB para Q4_K_M; 33.585 GB para Q8_0; 19.849 GB para Q3_K_M.
- GPU recomendadas: RTX 5090 (32 GB), RTX 6000 Ada (48 GB), H100 (80 GB), H200 (141 GB), B200 (192 GB), B300 (288 GB), RTX PRO 6000 Blackwell (96 GB).
- Cabe en consumer GPU: si, en RTX 4090 o RTX 3090 (24 GB) usando `llama-server -m FILE --n-cpu-moe 52` para offload de expertos a RAM del sistema, con contexto de 32K. En RTX 5090 (32 GB) se alcanza contexto de 256K.
- Opciones de despliegue: llama.cpp (version `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o superior), con `llama-cli` y `llama-server`; soporte CUDA (`-DGGML_CUDA=ON`), Metal y CPU.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento en tareas del modelo base en la informacion proporcionada, por lo que la comparativa se limita a caracteristicas estructurales. Alternativas de la misma categoria (MoE de ~30B con pocos parametros activos) no se detallan en la model card.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3-Nano-30B-A3B (este) | 31.577.940.288 | ~3B | Hasta 256K | NVIDIA Nemotron Open Model License | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas soportados limitados a ingles y coreano; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad factual en la informacion disponible.
- Sesgos conocidos: no documentados en la model card; el modelo base de NVIDIA no aporta informacion al respecto en los datos proporcionados.
- Licencia NVIDIA Nemotron Open Model License (etiquetada como "other"): no es una licencia permisiva estandar; es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial.
- El fichero Q4_K_M pierde precision frente a BF16 (top-1 del 92.348% en WikiText-2); para tareas sensibles conviene usar Q6_K o Q8_0 si la memoria lo permite.
- En GPUs de 24 GB el contexto se limita a 32K con offload de expertos; el contexto de 256K requiere 32 GB o mas de memoria.
- La cuantizacion Q3_K_M degrada notablemente la calidad (top-1 del 86.779%), por lo que no es recomendable para produccion.
- No se confirma soporte de tool calling ni de vision en esta version; verificar contra el modelo base antes de disenar pipelines que dependan de ello.
- Repositorio con pocas descargas (472) y 0 likes en el momento de la consulta; considerar el modelo base oficial si se requiere soporte o actualizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3-Nano-30B-A3B-GGUF
- Modelo base en BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Paper tecnico (arXiv): https://arxiv.org/abs/2512.20848
- llama.cpp (version recomendada): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
- Licencia: https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3-Nano-30B-A3B-GGUF/blob/main/LICENSE
