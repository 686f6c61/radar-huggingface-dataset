# Xylolabs/gemma-4-E2B-it-GGUF

## Resumen

Gemma 4 E2B IT GGUF es una coleccion de cuantizaciones GGUF del modelo instructivo google/gemma-4-E2B-it, publicada por Xylolabs para su uso con llama.cpp en CUDA, Metal o CPU. El modelo base pertenece a la familia Gemma 4 de Google y esta orientado a generacion de texto conversacional, con un total de 4.647.450.147 parametros segun los pesos en safetensors del modelo original. Esta ficha cubre la variante cuantizada, que es la que se distribuye en este repositorio.

El repositorio incluye siete cuantizaciones (Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, IQ3_M y Q2_K) con tamanos que van de 2,33 GB a 4,38 GB, lo que permite ejecutar el modelo en hardware de consumo. La model card incluye una tabla de fidelidad frente a BF16 medida con llama.cpp (divergencia KL y acuerdo top-1) que permite elegir el nivel de cuantizacion en funcion del compromiso entre tamano y calidad.

La relevancia actual del modelo radica en que ofrece una via practica de desplegar un modelo de la familia Gemma 4 en entornos locales y con recursos limitados, manteniendo la licencia Apache 2.0 del modelo base. La informacion disponible no detalla la arquitectura interna ni el contexto maximo del modelo original; esos datos no se han publicado en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: google/gemma-4-E2B-it) |
| Parametros totales | 4.647.450.147 (pesos safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (los ejemplos de la model card usan `-c 8192`) |
| Tipos de cuantizacion | Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, IQ3_M, Q2_K |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base google/gemma-4-E2B-it en la documentacion proporcionada: no se especifica si es un transformer denso, un modelo de mezcla de expertos, hibrido o de otro tipo, ni el numero de tokens de entrenamiento, la composicion del dataset o si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

Lo que si documenta el autor de la cuantizacion es el proceso de conversion a GGUF para llama.cpp y la evaluacion de fidelidad de cada cuantizacion frente a los pesos BF16. La model card menciona el uso de imatrix (etiqueta del repositorio) en el proceso de cuantizacion, y recomienda llama.cpp release b12531 o posterior. El modelo base se distribuye bajo licencia Apache 2.0 y esta etiquetado como modelo conversacional e instructivo.

## Capacidades

- Generacion de texto conversacional en modo instructivo (sufijo IT en el nombre del modelo).
- Modo thinking opcional: la model card indica que se puede desactivar la respuesta razonada con `--chat-template-kwargs '{"enable_thinking":false}'`, lo que sugiere soporte de un modo de razonamiento explicito.
- Soporte de plantilla de chat compatible con llama.cpp mediante `--jinja`.
- Capacidades multilingues limitadas a ingles (en) y coreano (ko) segun los metadatos del repositorio.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`) para despliegue como servicio.
- No se documentan en la informacion disponible capacidades de vision, audio, tool calling ni agentes multi-paso.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse con `llama-server` en una maquina de sobremesa o portatil y atender conversaciones multi-turno en ingles o coreano, con la cuantizacion Q4_K_M (3,11 GB) como opcion equilibrada entre calidad y huella de memoria.
- Prototipado rapido de aplicaciones de chat: gracias a la licencia Apache 2.0 y al formato GGUF, se puede integrar en un backend propio con llama.cpp sin coste de licencia y sin dependencia de APIs externas.
- Inferencia en CPU: las cuantizaciones IQ3_M (2,37 GB) y Q2_K (2,33 GB) permiten ejecutar el modelo en equipos sin GPU dedicada, aunque con perdida de fidelidad respecto a BF16 (KL de 0,099 y 0,111 respectivamente en WikiText-2).
- Despliegue en GPUs de consumo: Q4_K_M o Q5_K_M caben en GPUs con 6-8 GB de VRAM, lo que habilita asistentes locales en estaciones de trabajo con RTX 3060/4060 o similares.
- Evaluacion comparativa de cuantizaciones: la tabla de fidelidad de la model card permite a investigadores medir el impacto de la cuantizacion en tareas de chat y de texto general antes de fijar una variante para produccion.
- Generacion de texto en coreano: el modelo declara soporte de coreano, por lo que puede emplearse en tareas de redaccion o resumen en ese idioma, siempre que se valide la calidad con datos propios dado que no hay benchmarks publicados.
- Entornos con requisitos de privacidad: al ejecutarse integramente en local, es apto para procesar texto sensible sin enviar datos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente proporciona metricas de fidelidad de cuantizacion frente a BF16 medidas con llama.cpp (divergencia KL media, menor es mejor, y acuerdo top-1):

| Cuantizacion | Tamano | WikiText-2 KL | Top-1 | Chat KL | Top-1 | Held-out KL | Top-1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q2_K | 2,325 GB | 0,110754 | 87,946% | 0,086295 | 91,814% | 0,112531 | 89,471% |
| IQ3_M | 2,373 GB | 0,099355 | 88,196% | 0,076995 | 92,255% | 0,099136 | 90,275% |
| IQ4_XS | 2,983 GB | 0,033687 | 93,103% | 0,024051 | 95,608% | 0,029111 | 94,657% |
| Q4_K_S | 3,044 GB | 0,029542 | 93,706% | 0,019518 | 96,284% | 0,024407 | 95,118% |
| Q4_K_M | 3,107 GB | 0,025646 | 94,147% | 0,016835 | 96,225% | 0,020722 | 95,569% |
| Q5_K_M | 3,356 GB | 0,014401 | 95,515% | 0,011227 | 97,118% | 0,013787 | 96,382% |
| Q6_K | 4,384 GB | 0,008152 | 96,760% | 0,005417 | 98,049% | 0,007210 | 97,422% |

La model card tambien incluye comparativas con cuantizaciones de otros autores (etiquetadas "Others 1" y "Unsloth"); en esas filas, las variantes de este repositorio muestran en general mejor fidelidad a igualdad de tamano, aunque la informacion no detalla la metodologia completa de esa comparacion.

## Requisitos de hardware

- VRAM estimada: aproximadamente el tamano del fichero GGUF mas el contexto y los buffers de llama.cpp. Q2_K e IQ3_M caben en torno a 3-4 GB; Q4_K_M en torno a 4-5 GB; Q6_K en torno a 5,5-6 GB.
- GPU recomendadas: cualquier GPU con suficiente VRAM para la cuantizacion elegida; para Q4_K_M o Q5_K_M son suficientes tarjetas de 8 GB como RTX 3060/4060, y para Q6_K se recomienda 8 GB o mas (RTX 4070, RTX 4090, A100, H100).
- GPU de consumo: si, el modelo esta pensado para ejecutarse en GPUs de consumo con las cuantizaciones bajas y medias.
- CPU: las cuantizaciones IQ3_M y Q2_K permiten inferencia en CPU, con menor calidad.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server), compilado con CUDA, Metal o CPU. La model card no menciona soporte explicito de vLLM, Ollama o TGI, aunque el formato GGUF es compatible con herramientas basadas en llama.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada. La model card incluye comparaciones de fidelidad de cuantizacion con variantes de otros autores (etiquetadas "Others 1" y "Unsloth") para el mismo modelo base, pero no con otros modelos. Por tanto, la comparativa con alternativas de distinto modelo queda como no disponible.

## Limitaciones y advertencias

- Idiomas: el repositorio declara solo ingles y coreano; el rendimiento en castellano no esta documentado y no deberia asumirse.
- Fidelidad de cuantizacion: las variantes Q2_K e IQ3_M pierden calidad de forma notable (KL en WikiText-2 de 0,110 y 0,099, y acuerdo top-1 de 87,9% y 88,2%); para produccion conviene usar Q4_K_M o superior.
- Alucinacion: no se han publicado evaluaciones de veracidad ni de tasas de alucinacion; como en cualquier modelo generativo, es un riesgo a mitigar con validacion externa.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Contexto: la longitud maxima de contexto del modelo base no esta documentada; los ejemplos de la model card usan 8192 tokens, pero no se confirma que sea el limite.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar el fichero LICENSE del repositorio y las condiciones del modelo base google/gemma-4-E2B-it.
- Dependencia de version: la model card exige llama.cpp release b12531 o posterior; versiones anteriores pueden no cargar correctamente el modelo.
- Modo thinking: por defecto puede activarse el razonamiento explicito; para respuestas directas hay que pasar `--chat-template-kwargs '{"enable_thinking":false}'`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E2B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia: https://huggingface.co/Xylolabs/gemma-4-E2B-it-GGUF/blob/main/LICENSE
- Codigo llama.cpp (commit referenciado): https://github.com/ggml-org/llama.cpp/tree/e4b620af19f02960dea7a3a81de7c5805aa3a333
- Repositorio de la herramienta de cuantizacion de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
- Paper referenciado en los metadatos (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
