# SZLHOLDINGS/SZL-Khipu-1.5B-GGUF-laptop-lora

## Resumen

SZL-Khipu-1.5B-GGUF-laptop-lora es un artefacto de modelo publicado por la organizacion SZLHOLDINGS dentro de lo que el autor denomina su "estate" de IA gobernada, un conjunto de modelos, datasets y Spaces con resultados verificables y trazabilidad de origen. Por el nombre se deduce que se trata de un modelo de aproximadamente 1.500 millones de parametros, derivado de la familia Khipu, distribuido en formato GGUF y orientado a ejecucion en portatil, con un adaptador LoRA asociado. El repositorio combina la etiqueta safetensors con la denominacion GGUF, lo que sugiere la publicacion conjunta de pesos base y adaptadores.

La relevancia de esta ficha es limitada y fundamentalmente documental: la model card no aporta especificaciones tecnicas verificables. No declara arquitectura, longitud de contexto, idiomas, licencia ni composicion del dataset de entrenamiento. El propio autor indica de forma explicita que cualquier afirmacion de entrenamiento o evaluacion que no conste en sus ficheros de recibos debe considerarse desconocida (UNKNOWN), y el escaneo de recibos realizado el 2026-11-22 concluye con estado UNKNOWN_NO_EVAL_RECEIPT, es decir, sin cadena de evaluacion estricta completa.

En consecuencia, esta ficha recoge lo que el repositorio declara y marca como "no disponible" todo aquello que no puede confirmarse. No se han publicado resultados de benchmarks ni curvas de rendimiento medidas para este artefacto, y el autor renuncia expresamente a realizar afirmaciones de calidad sobre el.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.5B (inferido del nombre del repositorio; no confirmado en la model card) |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el nombre indica GGUF, sin especificar niveles Q4, Q5, Q8, etc.) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF y safetensors (etiqueta del repo); adaptador LoRA |
| Tamano del repositorio | 0.0 GB (segun metadatos de Hugging Face) |
| Descargas | 29 |
| Likes | 0 |
| Fecha de creacion | 2026-10-25 |
| Ultima actualizacion | 2026-11-22 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo. La model card no especifica si se trata de un transformer denso, un modelo MoE, una arquitectura hibrida o cualquier otra variante. Tampoco detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o similares.

El unico dato tecnico estructural que puede inferirse es la presencia de un adaptador LoRA, indicada en el nombre del repositorio, junto con un artefacto en formato GGUF orientado a inferencia en portatil. El autor declara que las afirmaciones de entrenamiento y evaluacion residen en ficheros de recibos del "estate mesh" y que cualquier dato no registrado en ellos debe tratarse como desconocido. El escaneo de recibos del 2026-11-22 no encontro una cadena de evaluacion estricta completa, por lo que no se puede confirmar ningun detalle del proceso de entrenamiento.

## Capacidades

- Generacion de texto: no confirmada en la informacion disponible.
- Razonamiento, codigo y matematicas: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Ejecucion local en portatil: inferida del nombre del repositorio y del formato GGUF, sin confirmacion tecnica en la model card.

## Casos de uso

- Evaluacion de artefactos de la organizacion SZLHOLDINGS: el repositorio puede utilizarse para inspeccionar el formato de publicacion y la infraestructura de recibos del "estate", dado que la model card documenta el proceso de auditoria con marcas temporales concretas (2026-11-20 y 2026-11-22).
- Pruebas de inferencia local en portatil: si el artefacto GGUF contiene pesos funcionales, podria cargarse en herramientas compatibles con GGUF para experimentar con un modelo de 1.5B en hardware de consumo, aunque no hay confirmacion de que los pesos sean utilizables.
- Investigacion sobre adaptadores LoRA: el repositorio incluye la etiqueta de adaptador LoRA, por lo que podria servir para estudiar tecnicas de ajuste fino eficiente, siempre que los ficheros esten presentes y sean validos.
- Verificacion de trazabilidad y gobernanza de modelos: el sistema de recibos descrito (rutas eval/frontier-v1/DONE.json, final/train_receipt.json) puede analizarse como ejemplo de infraestructura de auditoria para publicacion de modelos.
- Docencia sobre publicacion de modelos en Hugging Face: el repositorio ilustra un caso de model card generada automaticamente con marcas de estado MEASURED/REPORTED/UNKNOWN, util para discutir buenas practicas de documentacion.
- Integracion en pipelines de evaluacion: el artefacto podria incorporarse como caso de prueba en arneses de evaluacion que comprueben la presencia y validez de cadenas de recibos, dado que el autor referencia explicitamente un ledger de bloqueo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se afirma ninguna cifra de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo de recibos del 2026-11-22 concluye con estado UNKNOWN_NO_EVAL_RECEIPT, sin cadena de evaluacion estricta completa. El autor declara que no realiza afirmaciones de calidad sobre este artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Para un modelo de 1.5B en formato GGUF, las estimaciones habituales rondarian entre 1 y 2 GB en cuantizacion de 4 bits y entre 3 y 4 GB en 8 bits, pero estos valores son orientativos y no estan confirmados para este artefacto.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el nombre del repositorio sugiere orientacion a portatil, pero no se especifican requisitos.
- Opciones de despliegue: no disponible; por el formato GGUF seria compatible en principio con llama.cpp y Ollama, sin confirmacion del autor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento, contexto ni licencia que permitan una comparacion fundamentada con otros modelos de 1.5B parametros. Cualquier comparacion seria especulativa y contravendria la regla de no inventar datos.

## Limitaciones y advertencias

- Ausencia de cadena de evaluacion: el escaneo de recibos del 2026-11-22 devuelve UNKNOWN_NO_EVAL_RECEIPT, por lo que no existe verificacion estricta de calidad ni de entrenamiento.
- Model card sin especificaciones: no se declaran arquitectura, contexto, idiomas ni licencia, lo que impide evaluar su idoneidad para produccion.
- Licencia no disponible: no puede determinarse si el uso comercial esta permitido; debe consultarse al autor antes de cualquier despliegue.
- Riesgo de alucinacion: no evaluado; sin benchmarks ni evaluaciones publicadas no puede estimarse.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto e idioma: no disponibles.
- Tamano del repositorio de 0.0 GB: sugiere que los pesos podrian no estar efectivamente alojados o que el metadato no refleja el contenido real; conviene verificar los ficheros antes de su uso.
- Popularidad minima: 29 descargas y 0 likes, sin validacion por parte de la comunidad.
- Estado de gobernanza declarado por el autor: el propio publicador indica que no realiza afirmaciones de calidad sobre este artefacto y que los datos no registrados en recibos deben considerarse desconocidos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B-GGUF-laptop-lora
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub: https://github.com/szl-holdings
- Herramienta de generacion de model cards: https://github.com/szl-holdings/estate-cards
- Bundle de recibos: SZLHOLDINGS/wave-logs (ruta mesh/2026-11-22/model-receipts/pass2-core/)
