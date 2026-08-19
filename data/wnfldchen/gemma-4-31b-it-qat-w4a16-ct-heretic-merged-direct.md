# wnfldchen/gemma-4-31B-it-qat-w4a16-ct-heretic-merged-direct

## Resumen

El modelo `wnfldchen/gemma-4-31B-it-qat-w4a16-ct-heretic-merged-direct` es una versión editada y cuantizada del modelo Gemma 4 Unified de Google, desarrollada por el usuario wnfldchen. Se trata de un checkpoint de 31.273 millones de parámetros que ha sido sometido a un proceso de "descensura" (abliteration) mediante la técnica ARA-LoRA, conocida como método Heretic, y posteriormente comprimido a formato W4A16 (pesos de 4 bits con activaciones de 16 bits) usando compressed-tensors. El resultado es un modelo multimodal (any-to-any) que puede procesar texto e imágenes, diseñado como reemplazo directo del repositorio oficial `google/gemma-4-31B-it-qat-w4a16-ct`.

La relevancia de este modelo radica en que combina la capacidad multimodal de Gemma 4 con una edición que elimina las restricciones de censura del modelo original, manteniendo la compatibilidad con la librería `transformers` y ofreciendo un proceso de reproducción documentado. Es una opción para desarrolladores que necesitan un modelo de 31B parámetros con cuantización eficiente y que puedan desplegar en entornos con recursos limitados, aunque con las advertencias propias de un modelo "uncensored".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 Unified (any-to-any, multimodal) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W4A16 (pesos de 4 bits, activaciones de 16 bits), group size 32, formato pack-quantized |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (con enlace a la licencia especifica de Gemma 4) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 4 Unified de Google, que es un modelo multimodal de tipo any-to-any capaz de procesar y generar texto e imágenes. No se dispone de detalles internos sobre el número de capas, cabezas de atención o mecanismos de atención, ya que esa información no está incluida en la documentación proporcionada.

El proceso de creación de este checkpoint consta de dos etapas principales. Primero, se aplicó una edición "Heretic" al modelo base `google/gemma-4-31B-it-qat-q4_0-unquantized` utilizando el método ARA-LoRA, que tiene como objetivo eliminar o reducir las restricciones de seguridad y censura del modelo original. Esta edición se documenta en el directorio `reproduce/` del repositorio. Posteriormente, los pesos resultantes se comprimieron a formato W4A16 mediante el script `scripts/compress_to_w4a16.py`, que agrupa los pesos en grupos de 32 elementos y los cuantiza a 4 bits. El proceso de compresión se captura en el archivo `recipe.yaml` y se proporcionan hashes SHA256 para verificar la reproducibilidad.

No se dispone de información sobre los datos de entrenamiento del modelo base, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO en el modelo original.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo Gemma 4 Unified, que incluyen generacion de texto, comprension de contexto y razonamiento basico.
- Multimodalidad: al ser un modelo any-to-any, puede procesar entradas de texto e imagen, y generar respuestas de texto (y potencialmente imagenes, aunque no se especifica).
- Compatibilidad con transformers: se carga con `Gemma4UnifiedForConditionalGeneration` de la libreria `transformers`, lo que facilita su integracion en pipelines existentes.
- Edicion "uncensored": el metodo Heretic (ARA-LoRA) reduce las restricciones de contenido, permitiendo respuestas mas directas en temas que el modelo base podria rechazar.
- Reproducibilidad: el repositorio incluye `recipe.yaml` y el directorio `reproduce/` con los metadatos necesarios para recrear el modelo desde el checkpoint fuente.

## Casos de uso

- Generacion de contenido creativo sin restricciones: el modelo puede utilizarse para escribir ficcion, guiones o dialogos que aborden temas controvertidos sin los filtros habituales de los modelos censurados, gracias a su edicion "uncensored".
- Asistencia en investigacion cualitativa: en estudios donde se necesite explorar perspectivas no convencionales o analizar textos con lenguaje explicito, el modelo puede generar respuestas que otros modelos rechazarian.
- Desarrollo de agentes conversacionales con personalidad libre: para chatbots o asistentes virtuales que requieran un tono mas desinhibido o que deban tratar temas sensibles sin evasivas, este modelo ofrece una alternativa a los modelos estandar.
- Analisis de imagenes y generacion de descripciones: al ser multimodal, puede recibir imagenes y producir descripciones textuales detalladas, util en aplicaciones de accesibilidad o catalogacion automatica.
- Prototipado rapido de aplicaciones con transformers: al ser un drop-in replacement del modelo oficial W4A16, permite cambiar la linea de carga en codigo existente sin modificaciones adicionales, facilitando la experimentacion.
- Despliegue en entornos con VRAM limitada: gracias a la cuantizacion W4A16, los requisitos de memoria se reducen significativamente en comparacion con el modelo en FP16, lo que permite ejecutarlo en GPUs de consumo medio.

## Benchmarks y rendimiento

La model card incluye una comparacion de benchmarks entre este modelo (Heretic merged W4A16) y el oficial `google/gemma-4-31B-it-qat-w4a16-ct`. Los resultados se muestran a continuacion:

| Benchmark | Muestras | Metrica | Oficial W4A16 | Heretic merged W4A16 | Delta |
| --- | ---: | --- | ---: | ---: | ---: |
| PIQA | 1.838 | acc_norm | 55,71% | 55,01% | -0,71 pp |
| WinoGrande | 1.267 | accuracy | 50,99% | 50,83% | -0,16 pp |
| CommonsenseQA | 1.221 | accuracy | 23,26% | 23,10% | -0,16 pp |
| EQ-Bench | 171 | score | 42,54 | 46,59 | +4,05 |
| EQ-Bench parseability | 171 | percent_parseable | 83,04% | 78,36% | -4,68 pp |

Las diferencias en PIQA, WinoGrande y CommonsenseQA son menores que sus errores estandar, mientras que EQ-Bench mejora en 4,05 puntos, aunque con una menor parseabilidad en el evaluador generativo. No se proporcionan benchmarks adicionales como MMLU o HumanEval.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion W4A16, los pesos ocupan aproximadamente 15,6 GB (31.273M parametros x 0,5 bytes por parametro). Sumando activaciones, cache KV y overhead, se estima un uso total de 18-22 GB para secuencias de longitud moderada (4k tokens). Esta es una estimacion orientativa, no un dato oficial.
- GPUs recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, o GPUs con al menos 24 GB de VRAM. Para mayor margen, se recomienda una GPU con 40 GB o mas.
- Compatibilidad con GPUs de consumo: si, cabe en tarjetas de 24 GB como la RTX 4090, aunque con limitaciones en la longitud de contexto y el tamano de lote.
- Opciones de despliegue: al ser un modelo de tipo `transformers`, se puede cargar con `AutoModelForCausalLM` o `Gemma4UnifiedForConditionalGeneration`. Tambien es compatible con frameworks de inferencia como vLLM o TGI si soportan compressed-tensors, aunque no se confirma en la documentacion.
- Latencia y throughput: no se dispone de datos medidos. Como referencia, un modelo de 31B en W4A16 en una RTX 4090 puede generar del orden de 10-20 tokens por segundo, pero esto depende del hardware y la configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | Notas |
|---|---|---|---|---|---|
| wnfldchen/gemma-4-31B-it-qat-w4a16-ct-heretic-merged-direct | 31,3B | No disponible | Apache-2.0 (con terminos Gemma) | W4A16 | Edicion "uncensored" sobre Gemma 4 |
| google/gemma-4-31B-it-qat-w4a16-ct | 31,3B | No disponible | Licencia Gemma (con restricciones) | W4A16 | Modelo oficial sin edicion |
| google/gemma-4-31B-it | 31,3B | No disponible | Licencia Gemma | FP16 (original) | Modelo base sin cuantizar |

No se dispone de datos comparativos de rendimiento con otros modelos de tamano similar (por ejemplo, Llama 3.1 30B o Qwen 2.5 32B) en la informacion proporcionada. La principal diferencia con el modelo oficial es la edicion "uncensored" y la licencia Apache-2.0, que puede ser mas permisiva para ciertos usos comerciales, aunque hay que revisar los terminos de la licencia de Gemma 4.

## Limitaciones y advertencias

- Contenido "uncensored": el modelo ha sido editado para reducir las restricciones de seguridad, lo que puede llevar a generar contenido ofensivo, peligroso o ilegal si se utiliza sin control. No es adecuado para aplicaciones dirigidas al publico general sin una capa de moderacion adicional.
- Alucinaciones: como cualquier modelo generativo, puede producir respuestas factualmente incorrectas o inventadas, especialmente en temas especializados.
- Sesgos: no se ha evaluado el impacto de la edicion Heretic en los sesgos del modelo, pero es probable que herede los sesgos del modelo base y que la eliminacion de censura pueda amplificar ciertos sesgos.
- Limitaciones de contexto e idioma: no se ha publicado la longitud de contexto soportada ni la lista de idiomas. Se recomienda probar con secuencias cortas y verificar el comportamiento en el idioma objetivo.
- Licencia: aunque el repositorio declara licencia Apache-2.0, la model card enlaza a la licencia especifica de Gemma 4, que puede imponer restricciones adicionales (por ejemplo, en cuanto a uso comercial o redistribucion). Es necesario revisar ambos documentos antes de usar el modelo en produccion.
- Reproducibilidad: aunque se proporcionan hashes y recetas, la reproducibilidad exacta depende de las versiones de las librerias y del entorno de compresion, que pueden variar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wnfldchen/gemma-4-31B-it-qat-w4a16-ct-heretic-merged-direct
- Modelo fuente sin comprimir (Heretic merged): https://huggingface.co/wnfldchen/gemma-4-31B-it-qat-q4_0-unquantized-heretic-merged
- Modelo base oficial de Google: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
