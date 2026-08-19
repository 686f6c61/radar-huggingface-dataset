# wnfldchen/gemma-4-31B-it-qat-q4_0-unquantized-heretic-merged

## Resumen

Este repositorio contiene un checkpoint fusionado del modelo `google/gemma-4-31B-it-qat-q4_0-unquantized`, modificado mediante la herramienta [Heretic](https://heretic-project.org) v1.4.0 para eliminar gran parte de los comportamientos de rechazo o censura del modelo original. El autor, `wnfldchen`, ha aplicado el método Arbitrary-Rank Ablation (ARA) con preservación de norma por fila, fusionando un adaptador LoRA directamente en los pesos base. El resultado es un modelo "decensored" (desensurado) que mantiene una baja divergencia KL (0.09) respecto al original, pero reduce drásticamente la probabilidad de negarse a responder ciertos temas (las palabras clave de rechazo caen de 99/100 a 8/100).

El modelo base pertenece a la familia Gemma 4 de Google, con 31.273 millones de parámetros, y es multimodal (procesa imágenes y texto). Aunque el nombre incluye "qat-q4_0", este repositorio contiene los pesos sin cuantizar en formato `safetensors` (13 shards, 62.6 GB), lo que facilita su uso en entornos de investigación y desarrollo. La licencia declarada es Apache 2.0, aunque el modelo base tiene su propia licencia de Google (Gemma 4 license).

Este checkpoint es relevante para quienes necesitan un modelo de 31B multimodal sin restricciones de contenido, ya sea para investigación sobre seguridad de IA, generación creativa o como base para fine-tuning. El proceso es reproducible (se incluye la configuración exacta de abliteración) y existe una variante comprimida W4A16 para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4) - detalles internos no publicados |
| Parametros totales | 31.273.086.512 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Este repo: sin cuantizar (FP16). El modelo base es QAT q4_0. Existe un artefacto W4A16 comprimido (ver enlaces) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (declarada por el autor) - el modelo base usa la licencia Gemma 4 de Google |
| Formato de pesos | safetensors (13 shards, 62.6 GB) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-31B-it-qat-q4_0-unquantized` es un transformer multimodal de 31B parámetros entrenado con cuantización consciente (QAT) a 4 bits, aunque este repositorio contiene una versión sin cuantizar de esos pesos. No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La modificación principal consiste en un proceso de abliteración mediante Heretic v1.4.0 con el método Arbitrary-Rank Ablation (ARA) y preservación de norma por fila. Se entrenó un adaptador LoRA de rango 256 sobre las proyecciones de salida de atención (`attn.o_proj`) en las capas 24 a 54 (de un total de capas no especificado). Los pesos de control son: `preserve_good_behavior_weight` = 0.1182, `steer_bad_behavior_weight` = 0.0050 y `overcorrect_relative_weight` = 0.8715. El adaptador se fusionó directamente en los pesos base (`export_strategy=merge`), por lo que no es necesario cargar un adaptador separado en inferencia.

## Capacidades

- Generacion de texto y comprension de imagenes (pipeline `image-text-to-text`).
- Conversacion multi-turno e instrucciones (variante "it" = instruction tuned).
- Reduccion significativa de rechazos a contenido sensible o controvertido (decensored). Las metricas de Heretic muestran una caida de palabras clave de rechazo de 99/100 a 8/100.
- Mantiene un comportamiento general similar al modelo base, con una divergencia KL de 0.09 respecto a `google/gemma-4-31B-it-qat-q4_0-unquantized`.
- No se especifica en la documentacion disponible si soporta tool calling, function calling o razonamiento multi-paso. Tampoco se detallan las capacidades multilingues.

## Casos de uso

- Investigacion sobre seguridad y sesgos en IA: al estar desensurado, permite estudiar como el modelo maneja temas delicados sin rechazos predefinidos, facilitando el analisis de riesgos y alucinaciones en escenarios adversarios.
- Generacion de contenido creativo sin restricciones: escritura de ficcion, guiones o dialogos que aborden temas tabu o politicamente sensibles sin que el modelo se niegue a responder.
- Analisis de textos con contenido explicito: clasificacion o resumen de documentos que contengan lenguaje ofensivo o temas controvertidos, donde un modelo censurado podria bloquear la tarea.
- Base para fine-tuning especifico: los pesos fusionados permiten partir de un modelo sin sesgos de rechazo y adaptarlo a dominios concretos (por ejemplo, atencion al cliente en sectores con jerga sensible).
- Evaluacion comparativa de tecnicas de abliteracion: al ser reproducible, sirve como punto de referencia para medir el impacto de diferentes metodos de eliminacion de censura en modelos grandes.
- Despliegue en entornos de investigacion academica: con la variante W4A16 comprimida, puede ejecutarse en GPUs de 24 GB para experimentos de generacion multimodal sin las limitaciones de los modelos comerciales.

## Benchmarks y rendimiento

La model card incluye una comparacion de benchmarks entre el artefacto W4A16 comprimido de este modelo (`wnfldchen/gemma-4-31B-it-qat-w4a16-ct-heretic-merged-direct`) y la base oficial W4A16 de Google (`google/gemma-4-31B-it-qat-w4a16-ct`). Los resultados son los siguientes:

| Benchmark | Samples | Metrica | Base oficial W4A16 | Heretic merged W4A16 | Delta |
|---|---|---|---:|---:|---:|
| PIQA | 1.838 | acc_norm | 55,71% | 55,01% | -0,71 pp |
| WinoGrande | 1.267 | accuracy | 50,99% | 50,83% | -0,16 pp |
| CommonsenseQA | 1.221 | accuracy | 23,26% | 23,10% | -0,16 pp |
| EQ-Bench | 171 | score | 42,54 | 46,59 | +4,05 |
| EQ-Bench parseability | 171 | percent_parseable | 83,04% | 78,36% | -4,68 pp |

Los cambios en PIQA, WinoGrande y CommonsenseQA son menores que sus errores estandar, por lo que no son estadisticamente significativos. EQ-Bench mejora 4,05 puntos, aunque la parseabilidad de las respuestas generativas disminuye. Ademas, las metricas de Heretic indican una reduccion de palabras clave de rechazo de 99/100 a 8/100 y una divergencia KL de 0,09 respecto al modelo original.

## Requisitos de hardware

- Pesos sin cuantizar (FP16): ~62 GB de VRAM solo para los pesos. Se recomienda una GPU con al menos 80 GB (A100, H100) o varias GPUs en paralelo (por ejemplo, 2x RTX 6000 Ada o 4x RTX 4090 con 24 GB cada una).
- Con cuantizacion 4 bits (por ejemplo, el artefacto W4A16): ~16 GB de VRAM, cabe en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Opciones de despliegue: `transformers` (con `device_map="auto"`), vLLM, TGI, o conversion a GGUF para `llama.cpp`/Ollama. El repositorio recomienda el artefacto W4A16 comprimido para produccion.
- No se proporcionan datos de latencia o throughput en la informacion disponible.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos con otros modelos de la misma categoria (por ejemplo, Gemma 3 27B o Llama 3.1 70B) en la informacion proporcionada. La unica comparacion directa es con el modelo base:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| google/gemma-4-31B-it-qat-q4_0-unquantized | 31.273M | No disponible | Gemma 4 license | Modelo original con censura estandar |
| wnfldchen/gemma-4-31B-it-qat-q4_0-unquantized-heretic-merged | 31.273M | No disponible | Apache 2.0 (declarada) | Version decensored, misma arquitectura, menor rechazo |

No se han encontrado datos de rendimiento en tareas generales (MMLU, HumanEval, GSM8K) para este modelo en la informacion disponible.

## Limitaciones y advertencias

- Contenido potencialmente danino: al estar desensurado, el modelo puede generar respuestas con contenido explicito, ofensivo o peligroso. No debe usarse en aplicaciones orientadas al publico sin filtros adicionales de seguridad.
- Riesgo de alucinacion: no se han evaluado exhaustivamente los efectos de la abliteracion sobre la veracidad de las respuestas. La reduccion de rechazos puede incrementar la confianza en afirmaciones incorrectas.
- Licencia: aunque el autor declara Apache 2.0, el modelo base usa la licencia Gemma 4 de Google, que puede imponer restricciones adicionales para uso comercial. Se recomienda revisar los terminos antes de desplegar en produccion.
- Falta de validacion: el repositorio tiene 0 descargas y 0 likes, y no se han publicado evaluaciones independientes. Los benchmarks incluidos provienen del artefacto W4A16 comprimido, no del checkpoint sin cuantizar.
- Idiomas y contexto: no se especifican los idiomas soportados ni la longitud de contexto, lo que limita la planificacion de despliegues multilingues o con ventanas largas.
- Reproducibilidad: aunque el proceso es reproducible, requiere herramientas especificas (Heretic v1.4.0) y los commits exactos indicados. Cualquier cambio en el entorno puede alterar los resultados.

## Enlaces

- Repositorio HuggingFace: [wnfldchen/gemma-4-31B-it-qat-q4_0-unquantized-heretic-merged](https://huggingface.co/wnfldchen/gemma-4-31B-it-qat-q4_0-unquantized-heretic-merged)
- Adaptador original: [wnfldchen/gemma-4-31B-it-qat-q4_0-unquantized-heretic](https://huggingface.co/wnfldchen/gemma-4-31B-it-qat-q4_0-unquantized-heretic)
- Artefacto W4A16 comprimido: [wnfldchen/gemma-4-31B-it-qat-w4a16-ct-heretic-merged-direct](https://huggingface.co/wnfldchen/gemma-4-31B-it-qat-w4a16-ct-heretic-merged-direct)
- Proyecto Heretic: [https://heretic-project.org](https://heretic-project.org)
- PR del metodo ARA: [https://github.com/p-e-w/heretic/pull/211](https://github.com/p-e-w/heretic/pull/211)
- Demo alojada: [https://chat.winfieldresearch.com](https://chat.winfieldresearch.com)
- Modelo base: [google/gemma-4-31B-it-qat-q4_0-unquantized](https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized)
