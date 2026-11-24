# Xylolabs/Qwen3-4B-GGUF

## Resumen

Xylolabs/Qwen3-4B-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo Qwen/Qwen3-4B, publicada por Xylolabs para su uso con llama.cpp sobre CUDA, Metal o CPU. El modelo base es un transformer denso de Qwen con 4.022.468.096 parametros, disenado para generacion de texto y conversacion. Esta publicacion no introduce un modelo nuevo, sino que empaqueta los pesos originales en tres variantes cuantizadas (Q5_K_M, IQ4_XS e IQ4_XS-imat) junto con el tokenizer y la plantilla de chat originales.

La relevancia de esta ficha reside en que permite ejecutar un modelo de 4B parametros en hardware de consumo con perdidas de calidad medidas y documentadas: el autor publica valores de divergencia KL y coincidencia top-1 frente a su propia pasada en BF16 sobre 16.240 posiciones de texto en ingles y coreano. Ademas, incluye una tabla de recomendacion de hardware que relaciona memoria disponible, fichero y longitud de contexto.

La licencia es Apache 2.0, heredada del modelo base, lo que facilita el uso comercial. El repositorio ocupa 7,4 GB e incluye los tres ficheros GGUF, un NOTICE con la atribucion al modelo original y la licencia. La fecha de publicacion indicada es noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-4B); pesos empaquetados en GGUF para llama.cpp |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32K tokens segun la tabla de recomendacion de hardware del autor; el ejemplo de ejecucion usa `-c 8192` |
| Tipos de cuantizacion | Q5_K_M (2,89 GB), IQ4_XS (2,29 GB), IQ4_XS-imat (2,27 GB) |
| Idiomas soportados | en, ko (segun los tags del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un fichero por cuantizacion, con tokenizer y chat template incluidos) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-4B, un transformer denso de la familia Qwen3. Esta publicacion no entrena ni ajusta el modelo: se limita a convertir los pesos originales a GGUF y a cuantizarlos. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF/DPO) del modelo base; esos datos corresponden a la model card de Qwen/Qwen3-4B, a la que el autor remite para el informe tecnico y la citacion.

La innovacion tecnica documentada en esta publicacion es la evaluacion de las cuantizaciones frente a una pasada de referencia en BF16 ejecutada en transformers. El autor reporta divergencia KL media y porcentaje de coincidencia top-1 sobre 16.240 posiciones de texto en ingles y coreano. La variante IQ4_XS-imat se genera con una importance matrix (marcada con el sufijo `-imat`), lo que reduce la divergencia KL de 0,0726 a 0,0569 y eleva la coincidencia top-1 de 88,74% a 90,04% respecto a IQ4_XS sin imatrix, con un coste de solo 0,02 GB adicionales.

## Capacidades

- Generacion de texto y respuesta conversacional, con plantilla de chat incluida en el fichero GGUF.
- Ejecucion en llama.cpp mediante `llama-cli` y `llama-server`, con soporte de `--jinja` para aplicar la plantilla de chat.
- Inferencia en CUDA, Metal y CPU (segun la model card).
- Capacidades multilingues limitadas a ingles y coreano segun los metadatos del repositorio.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito; deben verificarse en la model card del modelo base Qwen/Qwen3-4B.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: con el fichero Q5_K_M (2,89 GB) y una RTX 4090 o RTX 3090 de 24 GB, el autor indica que se puede operar con contexto de 32K, lo que permite asistentes de codigo o chat sin dependencia de la nube.
- Servicio de inferencia ligero con `llama-server`: al exponer una API compatible con el servidor de llama.cpp, se puede integrar como backend de un chatbot interno en una intranet con requisitos de privacidad.
- Procesamiento por lotes en CPU: las cuantizaciones IQ4_XS (2,29 GB) e IQ4_XS-imat (2,27 GB) permiten ejecutar el modelo en equipos sin GPU, util para clasificacion o resumen de documentos en pipelines offline.
- Prototipado rapido de aplicaciones conversacionales en ingles o coreano: el modelo cubre ambos idiomas y la plantilla de chat viene incluida, lo que reduce el trabajo de integracion.
- Evaluacion comparativa de cuantizaciones: los datos de KL y top-1 publicados permiten elegir entre Q5_K_M (mayor fidelidad, 94,09% top-1) e IQ4_XS-imat (menor huella, 2,27 GB) segun la restriccion de memoria del entorno.
- Despliegue en hardware Apple Silicon: la tabla del autor contempla Mac Studio M5 Max y M5 Ultra con memoria unificada de 128 a 512 GB, lo que permite usar Metal con contexto de 32K.
- Entornos con memoria muy limitada: IQ4_XS-imat, con 2,27 GB, es la opcion mas compacta de las tres y mantiene un 90,04% de coincidencia top-1 frente a BF16.

## Benchmarks y rendimiento

El autor publica metricas de fidelidad de cuantizacion frente a su pasada de referencia en BF16 (16.240 posiciones de ingles y coreano):

| Cuantizacion | Tamano | KL media vs BF16 | Coincidencia top-1 vs BF16 |
|---|---:|---:|---:|
| Q5_K_M | 2,89 GB | 0,0193 | 94,09% |
| IQ4_XS | 2,29 GB | 0,0726 | 88,74% |
| IQ4_XS-imat | 2,27 GB | 0,0569 | 90,04% |

No se han publicado en la informacion disponible resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K u otros) para esta publicacion; deben consultarse en la model card del modelo base Qwen/Qwen3-4B.

## Requisitos de hardware

- VRAM estimada: segun la regla del autor, el fichero debe caber junto con la cache KV en f16 a la longitud de contexto elegida y 2 GB adicionales para el runtime, todo por debajo del 90% de la memoria disponible.
- GPU recomendadas por el autor: RTX 4090 y RTX 3090 (24 GB), RTX 5090 (32 GB), RTX 6000 Ada o 2 x 24 GB (48 GB), H100 (80 GB), RTX PRO 6000 Blackwell (96 GB), H200 (141 GB), B200 (192 GB) y B300 (288 GB), todas con Q5_K_M y contexto de 32K.
- Memoria unificada: DGX Spark (128 GB), Mac Studio M5 Max (128 GB) y Mac Studio M5 Ultra (256 GB y 512 GB), con Q5_K_M y contexto de 32K.
- Cabe en GPU de consumo: si, con las tres cuantizaciones; el fichero mas grande ocupa 2,89 GB.
- Opciones de despliegue: llama.cpp en el commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior, con `llama-cli` y `llama-server`; compilacion con `-DGGML_CUDA=ON` para NVIDIA. No se documentan en la informacion disponible otras opciones como vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/Qwen3-4B-GGUF | 4.022.468.096 | 32K (segun tabla del autor) | GGUF | Apache 2.0 | Tres cuantizaciones con metricas KL y top-1 publicadas |
| Qwen/Qwen3-4B (modelo base) | 4.022.468.096 | no disponible en esta ficha | safetensors (formato original) | Apache 2.0 | Requiere transformers o un runtime que cargue pesos originales |
| Otras cuantizaciones GGUF de Qwen3-4B | 4.022.468.096 | no disponible | GGUF | Apache 2.0 | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone en la informacion proporcionada de datos de rendimiento de tarea para comparar con alternativas de la misma categoria; la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Las metricas de KL y top-1 se calculan frente a la pasada BF16 del propio autor, no frente a los pesos originales de Qwen; no sustituyen una evaluacion de tarea.
- Los idiomas declarados son solo ingles y coreano; el rendimiento en castellano no esta documentado y puede degradarse.
- Las cuantizaciones de 4 bits (IQ4_XS e IQ4_XS-imat) implican perdida de fidelidad: 88,74% y 90,04% de coincidencia top-1 respectivamente, frente al 94,09% de Q5_K_M.
- No se documentan en la informacion disponible sesgos conocidos, tasas de alucinacion ni limitaciones de contexto mas alla de las 32K indicadas en la tabla de hardware.
- La licencia Apache 2.0 permite uso comercial, pero el autor declara no estar afiliado ni respaldado por los autores del modelo original; el fichero NOTICE atribuye la autoria del modelo base.
- Requiere llama.cpp en el commit indicado o posterior; versiones anteriores pueden no cargar correctamente los ficheros.
- El repositorio tiene 0 likes y 1.445 descargas en el momento de la consulta, lo que limita la validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen3-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Licencia: https://huggingface.co/Xylolabs/Qwen3-4B-GGUF/blob/main/LICENSE
- Codigo de llama.cpp (commit de referencia): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs citado en la model card: https://github.com/XylolabsInc/tensix-bfp-gptq
