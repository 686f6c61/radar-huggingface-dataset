# webmp3/Sakura-FrogNano-4B-2609-GGUF

## Resumen

Este repositorio contiene tres cuantizaciones GGUF del modelo multimodal FrogNano-4B-2609 de Microsoft, publicadas por el usuario webmp3 dentro de su linea Sakura Micro. No es un modelo nuevo ni un lanzamiento oficial: es una recuantizacion comunitaria de los pesos BF16 mediante un metodo de asignacion mixta de tipos ggml por matriz ("mixed-codec") que busca mejorar la relacion tamano/calidad frente a cuantizaciones imatrix convencionales del mismo tamano. El modelo base es un transformer compacto de 4.326.350.848 parametros (4,33 B) con arquitectura Qwen3.5, modalidad image-text-to-text, soporte de tool calling y capas de prediccion multi-token (MTP), distribuido bajo licencia MIT. Los tres ficheros GGUF pesan 1,89 GiB (3,74 bpw), 2,31 GiB (4,59 bpw) y 2,82 GiB (5,61 bpw), y estan pensados para ejecutarse en llama.cpp sin modificaciones, ya que todos los tipos de tensor empleados son estandar (IQ3_S, IQ3_XXS, Q3_K, IQ4_XS, Q4_K, Q5_K, Q6_K, Q8_0). El interes actual es poder desplegar un modelo de 4B con tool calling en equipos de gama de consumo (2-3 GiB de pesos) manteniendo divergencia KL baja respecto al BF16 original, con la salvedad de que el autor solo publica metricas de KLD y perplejidad, no resultados en benchmarks de tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con arquitectura Qwen3.5 y capas de prediccion multi-token (MTP) |
| Parametros totales | 4.326.350.848 (4,33 B) |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ3_S, IQ3_XXS, Q3_K, IQ4_XS, Q4_K, Q5_K, Q6_K, Q8_0, en mezcla por matriz; tres ficheros de 3,74 / 4,59 / 5,61 bits por peso |
| Idiomas soportados | No disponible (la evaluacion del autor usa texto aleman, ingles y un conjunto "developer text") |
| Licencia | MIT (se incluye el fichero `LICENSE` del modelo base) |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano de los ficheros | 1,89 GiB / 2,31 GiB / 2,82 GiB |
| Tamano del repositorio | 7,6 GB |
| Modelo base | microsoft/FrogNano-4B-2609 (relacion: quantized) |

## Arquitectura y entrenamiento

El modelo subyacente, FrogNano-4B-2609, es un transformer de 4,33 B parametros de Microsoft construido sobre la arquitectura Qwen3.5, con capacidad multimodal image-text-to-text, soporte de tool calling y capas de prediccion multi-token. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO; estos datos figuran como no disponibles.

Lo especifico de este repositorio es el proceso de cuantizacion. El autor parte del GGUF en BF16 y de la matriz de importancia publicados por bartowski (usados sin modificar) y cuantiza cada matriz de pesos grande una vez por cada tipo candidato (Q2_K, IQ2_S, IQ3_XXS, IQ3_S, Q3_K, IQ4_XS, Q4_K, Q5_K, Q6_K, Q8_0) con `llama-quantize`, estimando el error de cada opcion de forma ponderada por importancia y con proteccion manual para las capas primera y ultima, las proyecciones down y los embeddings. Despues resuelve una asignacion exacta de presupuesto (mochila multiple-choice sobre bytes) que elige un tipo por matriz para cada tamano objetivo, y ensambla el modelo final a partir de los tensores ya almacenados sin recuantizar. Las normas, los tensores pequenos y las capas de prediccion multi-token se mantienen en alta precision. El autor no publica las elecciones por tensor.

## Capacidades

- Generacion de texto conversacional (el repositorio incluye el tag `conversational`).
- Entrada multimodal image-text-to-text declarada en el pipeline del modelo base; el repositorio no documenta ningun fichero proyector multimodal (mmproj), por lo que no esta confirmado que la entrada de imagenes funcione con estos GGUF por si solos.
- Tool calling / function calling, segun las caracteristicas declaradas del modelo base.
- Capas de prediccion multi-token (MTP), conservadas en alta precision durante la cuantizacion.
- Compatibilidad con llama.cpp y con cualquier runtime que consuma GGUF estandar (todos los tipos de tensor empleados son tipos ggml oficiales).
- Idiomas: no disponible; la model card solo indica que las mediciones de calidad se hicieron sobre texto aleman, ingles y un conjunto de texto de desarrollo.

## Casos de uso

- Asistente conversacional local en portatil o PC de sobremesa: el fichero de 2,31 GiB permite ejecutar un modelo de 4B en CPU o en GPU de gama media sin depender de la nube, con una perdida de calidad medida claramente inferior a la de cuantizaciones de 3 bits del mismo tamano.
- Agentes con tool calling en automatizacion de tareas: al heredar el soporte de function calling del modelo base, se puede integrar en flujos que consultan APIs externas, bases de datos o sistemas de ficheros, ejecutando el modelo en local.
- Despliegue en entornos con memoria muy limitada: el fichero de 1,89 GiB (3,74 bpw) esta pensado para presupuestos de memoria ajustados, con una perdida de calidad visible pero con un KLD de 0,1218 en aleman y 0,0899 en ingles, ligeramente mejor que el IQ3_XXS de referencia.
- Prototipado rapido de aplicaciones con licencia permisiva: la licencia MIT del modelo base facilita su integracion en productos propietarios siempre que se conserve el aviso de licencia.
- Investigacion sobre cuantizacion: los tres ficheros, junto con las tablas de KLD y perplejidad publicadas, sirven como punto de comparacion reproducible para estudiar tecnicas de asignacion mixta de tipos frente a cuantizaciones imatrix convencionales.
- Servicio de chat de bajo coste en produccion ligera: el fichero de 2,82 GiB (5,61 bpw) se acerca al BF16 (KLD de 0,0093 en aleman, 0,0072 en ingles) y puede usarse como sustituto de pesos completos cuando la VRAM es la restriccion principal.
- Procesamiento de documentos con componente visual: si se dispone del proyector multimodal adecuado para el modelo base, la arquitectura image-text-to-text permitiria tareas de descripcion o extraccion sobre imagenes; conviene verificar la compatibilidad antes de plantearlo en produccion.

## Benchmarks y rendimiento

El autor no publica resultados en benchmarks de tareas (MMLU, HumanEval, GSM8K u otros). Las unicas cifras disponibles son de divergencia KL de la distribucion de siguiente token frente al BF16 original y de perplejidad, medidas con `llama-perplexity` sobre 12 fragmentos de 512 tokens por texto, en una sola maquina.

| Cuantizacion | Origen | Tamano | KLD de | KLD en | KLD dev | PPL de | Coincidencia top token (media) |
|---|---|---:|---:|---:|---:|---:|---:|
| BF16 (referencia) | Microsoft | — | 0 | 0 | 0 | 2,186 | 100 % |
| IQ3_XXS | bartowski (imatrix) | 1,84 GiB | 0,1275 | 0,0919 | 0,0833 | 2,420 | 91,1 % |
| Sakura 1,90GiB | este repositorio | 1,90 GiB | 0,1218 | 0,0899 | 0,0788 | 2,424 | 90,6 % |
| Q3_K_M | bartowski (imatrix) | 1,99 GiB | 0,0914 | 0,0723 | 0,0591 | 2,323 | 91,8 % |
| Sakura 2,32GiB | este repositorio | 2,32 GiB | 0,0286 | 0,0245 | 0,0227 | 2,240 | 95,3 % |
| IQ4_XS | bartowski (imatrix) | 2,33 GiB | 0,0303 | 0,0224 | 0,0221 | 2,249 | 95,5 % |
| Sakura 2,83GiB | este repositorio | 2,83 GiB | 0,0093 | 0,0072 | 0,0073 | 2,201 | 97,5 % |
| Q5_K_S | bartowski (imatrix) | 2,94 GiB | 0,0067 | 0,0051 | 0,0053 | 2,199 | 97,7 % |

Perplejidad de referencia del BF16 en los mismos textos: aleman 2,186, ingles 1,866, developer text 1,949. El propio autor advierte que estas metricas no deben interpretarse como una afirmacion de calidad en tareas.

## Requisitos de hardware

Las cifras siguientes son estimaciones a partir del tamano de los pesos; el autor no publica mediciones de VRAM, latencia ni throughput.

- Fichero de 1,89 GiB: requiere aproximadamente 2-3 GB de VRAM solo para pesos, mas la cache KV. Cabe en GPU de 4-6 GB (por ejemplo GTX 1650 4GB con contexto corto, GTX 1660 6GB, RTX 3050 6-8 GB).
- Fichero de 2,31 GiB: aproximadamente 2,5-4 GB de VRAM con pesos; opcion equilibrada para GPU de 8 GB (RTX 3060 Ti, RTX 4060, RTX 2070).
- Fichero de 2,82 GiB: aproximadamente 3-5 GB de VRAM con pesos; comodo en GPU de 8-12 GB (RTX 3060 12GB, RTX 4070, RTX 4090) y con margen para contexto amplio.
- Inferencia en CPU: los tres ficheros caben en RAM convencional (menos de 3 GiB de pesos) y se pueden ejecutar con llama.cpp en CPU, con velocidad dependiente del numero de nucleos y del ancho de banda de memoria.
- Despliegue: llama.cpp (`llama-server`, `llama-cli`), Ollama, LM Studio y bindings como llama-cpp-python. vLLM y TGI trabajan habitualmente con safetensors, no con GGUF, por lo que no son la via natural para estos ficheros.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparacion disponible es contra las cuantizaciones imatrix del mismo modelo publicadas por bartowski, que sirven de referencia directa por tamano.

| Cuantizacion | Parametros | Tamano | KLD de | KLD en | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| Sakura 1,90GiB (este repo) | 4,33 B | 1,90 GiB | 0,1218 | 0,0899 | MIT | GGUF en HuggingFace |
| bartowski IQ3_XXS | 4,33 B | 1,84 GiB | 0,1275 | 0,0919 | MIT | GGUF en HuggingFace |
| bartowski Q3_K_M | 4,33 B | 1,99 GiB | 0,0914 | 0,0723 | MIT | GGUF en HuggingFace |
| Sakura 2,32GiB (este repo) | 4,33 B | 2,32 GiB | 0,0286 | 0,0245 | MIT | GGUF en HuggingFace |
| bartowski IQ4_XS | 4,33 B | 2,33 GiB | 0,0303 | 0,0224 | MIT | GGUF en HuggingFace |
| Sakura 2,83GiB (este repo) | 4,33 B | 2,83 GiB | 0,0093 | 0,0072 | MIT | GGUF en HuggingFace |
| bartowski Q5_K_S | 4,33 B | 2,94 GiB | 0,0067 | 0,0051 | MIT | GGUF en HuggingFace |

No se dispone de datos de contexto ni de rendimiento en tareas para comparar con otros modelos de 4B multimodales o con tool calling.

## Limitaciones y advertencias

- Las unicas metricas publicadas son KLD y perplejidad sobre textos cortos de evaluacion; no hay resultados de benchmarks de tareas, por lo que no debe interpretarse como una garantia de calidad funcional.
- Las mediciones se hicieron en una sola maquina y con una sola pasada; el autor advierte que diferencias pequenas de KLD a tamano similar no constituyen un ranking de calidad.
- Toda cuantizacion degrada la calidad respecto al BF16, y el fichero mas pequeno (1,89 GiB) es el que mas pierde.
- No se publican las elecciones de tipo por tensor, lo que dificulta auditar o reproducir exactamente la asignacion.
- El repositorio no documenta la longitud de contexto soportada ni los idiomas del modelo; solo se sabe que la evaluacion uso texto aleman e ingles.
- La capacidad multimodal image-text-to-text esta declarada en el pipeline, pero no se menciona ningun fichero proyector (mmproj) en el repositorio, por lo que la entrada de imagenes no esta confirmada con estos ficheros.
- El repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha, por lo que carece de validacion por parte de la comunidad.
- La licencia MIT del modelo base permite uso comercial, pero conviene conservar el aviso de licencia y verificar las condiciones del modelo original de Microsoft antes de un despliegue en produccion.
- No hay datos oficiales de latencia, throughput ni consumo de VRAM.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/webmp3/Sakura-FrogNano-4B-2609-GGUF
- Modelo base: https://huggingface.co/microsoft/FrogNano-4B-2609
- GGUF BF16 y matriz de importancia (bartowski): https://huggingface.co/bartowski/FrogNano-4B-2609-GGUF
- Coleccion Sakura Micro: https://huggingface.co/collections/webmp3/sakura-micro-6aba74331f2e996ba1268a92
- llama.cpp (formato GGUF y herramientas de cuantizacion): https://github.com/ggml-org/llama.cpp
