# SZLHOLDINGS/SZL-AcousticGovernance-0.8B-v1

## Resumen

SZL-AcousticGovernance-0.8B-v1 es un modelo de generacion de texto de 873.438.784 parametros (aproximadamente 0,8B) publicado por SZLHOLDINGS, una organizacion que agrupa su catalogo bajo la etiqueta de "estate de IA gobernada" con trazabilidad de resultados. El modelo se presenta como un artefacto entrenado dentro de su "factoría gobernada" y deriva de un modelo base propio: SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3, lo que sugiere un linaje de ajuste supervisado sobre una arquitectura de la familia Qwen 3.5 (tag `qwen3_5` en Hugging Face).

El modelo se distribuye con licencia Apache 2.0, en formato safetensors y con la libreria transformers como via de carga, con un tamano de repositorio de 1,8 GB. Declara unicamente el idioma ingles. Su relevancia practica es limitada: la model card no aporta informacion sobre datos de entrenamiento, composicion del dataset, tecnicas de alineamiento ni resultados de evaluacion medidos, y el propio autor indica explicitamente que cualquier afirmacion no respaldada por sus ficheros de "receipts" debe considerarse desconocida.

La propuesta diferencial del autor no es tecnica sino de gobernanza: el modelo se enmarca en un sistema de recibos auditables (receipts) con marcas temporales y estados MEASURED/REPORTED/UNKNOWN. No obstante, un escaneo estricto de receipts de noviembre de 2026 clasifica este repositorio como RECEIPT_FILES_NO_DONE, es decir, con ficheros con nombre de recibo pero sin el DONE.json estricto que respaldaria evidencias de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen 3.5 (tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors, admite cuantizacion posterior a GGUF/AWQ/GPTQ mediante herramientas externas, sin recetas oficiales publicadas |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que se trata de un modelo de generacion de texto etiquetado como `qwen3_5`, lo que apunta a una arquitectura transformer decoder-only heredada de la familia Qwen 3.5, con 873.438.784 parametros totales. No se publican en la model card el numero de capas, dimensiones ocultas, mecanismo de atencion, vocabulario ni longitud de contexto soportada.

El modelo deriva del checkpoint SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3, que por su nombre sugiere un ajuste supervisado (SFT) orientado a tareas de agente con recibos. No se documentan el volumen de tokens de entrenamiento, la composicion del corpus, el uso de RLHF/DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El autor remite cualquier afirmacion de entrenamiento o evaluacion a ficheros de receipts alojados en su "estate mesh", y declara explicitamente que lo no registrado en ellos es UNKNOWN. El escaneo estricto de receipts de 2026-11-22 no encontro un DONE.json valido, por lo que la evidencia de evaluacion figura como UNKNOWN.

## Capacidades

- Generacion de texto en ingles como capacidad principal declarada (pipeline `text-generation`).
- Linaje orientado a agentes con recibos: el modelo base se denomina "receiptagent", lo que sugiere un ajuste para tareas de registro y trazabilidad, aunque no se documentan las capacidades concretas resultantes.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo de idiomas del repositorio.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Clasificacion y etiquetado de texto en ingles en pipelines de datos: el tamano de 0,8B permite desplegarlo en una sola GPU consumer para tareas de anotacion por lotes, siempre que se valide su calidad con evaluaciones propias dado que no hay benchmarks publicados.
- Prototipado rapido de asistentes conversacionales en ingles: al cargarse con transformers y pesar 1,8 GB en safetensors, es adecuado para entornos de desarrollo y pruebas de integracion antes de escalar a modelos mayores.
- Generacion de resumenes o extraccion de campos en flujos documentales: su origen en un modelo "receiptagent" sugiere un ajuste hacia tareas de registro estructurado, aunque el usuario debe verificar el comportamiento real con su propio conjunto de validacion.
- Experimentacion en investigacion sobre gobernanza de modelos: el repositorio sirve como ejemplo de publicacion con sistema de receipts y estados de evidencia (MEASURED/REPORTED/UNKNOWN), util para estudiar practicas de documentacion reproducible.
- Despliegue en entornos con recursos limitados: con 0,8B de parametros cabe en GPUs de 8-16 GB en precision completa o en CPU mediante cuantizacion a 4 bits con llama.cpp u Ollama, aunque sin recetas oficiales de cuantizacion publicadas.
- Fine-tuning especifico de dominio: al ser Apache 2.0 y safetensors, permite ajuste adicional sobre datos propios en ingles para tareas de extraccion o clasificacion, con coste computacional bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ninguna cifra de benchmark mas alla de lo medido en una auditoria fechada, y el escaneo estricto de receipts clasifica la evidencia de evaluacion como UNKNOWN (sin DONE.json valido).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB en fp16/bf16 (pesos safetensors de 873M de parametros); en cuantizacion 8 bits en torno a 1 GB y en 4 bits en torno a 0,5-0,6 GB, mas overhead de activaciones y cache KV segun contexto.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente en fp16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 lo ejecutan sin problemas, aunque las GPU de gama alta estan sobredimensionadas para este tamano.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (GTX 1060 6 GB en adelante en fp16; integradas o CPU con cuantizacion 4 bits).
- Opciones de despliegue: transformers (via oficial declarada); vLLM, TGI, llama.cpp y Ollama son viables en teoria al tratarse de un transformer estandar, pero no hay configuraciones oficiales publicadas ni confirmacion de compatibilidad con arquitectura `qwen3_5` en dichos motores.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|
| SZL-AcousticGovernance-0.8B-v1 | 873M | no disponible | en | Apache 2.0 | no disponible |
| Qwen3 0.6B | 0,6B | no disponible en esta ficha | multilingue | Apache 2.0 | si, en su model card oficial |
| Llama 3.2 1B | 1,2B | 128K | multilingue | Llama 3.2 Community License | si, en su model card oficial |
| Gemma 3 1B | 1B | 32K | multilingue | Gemma Terms of Use | si, en su model card oficial |

La comparativa se limita a tamano, licencia y disponibilidad de evaluaciones: los tres modelos alternativos publican resultados de benchmarks y soportan multiples idiomas, mientras que SZL-AcousticGovernance-0.8B-v1 solo declara ingles y no ofrece metricas verificables. Los datos de contexto de las alternativas corresponden a sus fichas oficiales; los de este modelo no estan disponibles.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de evidencia de evaluacion validada: el escaneo estricto de receipts lo clasifica como RECEIPT_FILES_NO_DONE, con evidencia de evaluacion UNKNOWN.
- Idioma limitado al ingles segun el campo de idiomas del repositorio; el rendimiento en castellano es desconocido y probablemente deficiente.
- Longitud de contexto no documentada, lo que impide planificar cargas con ventanas largas sin pruebas previas.
- Riesgo de alucinacion no cuantificado: al no haber evaluaciones publicadas, no puede estimarse la tasa de confabulacion; existe un fichero `receipts/eval/fleet-confabulation-sweep-20261108.json` en el repositorio, pero el autor no lo valida como evidencia.
- Sesgos conocidos: no documentados.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, sin restricciones adicionales declaradas; conviene conservar el aviso de licencia y verificar que los pesos derivados del modelo base no arrastren terminos distintos.
- Linaje de ajuste poco transparente: se desconoce que datos SFT se usaron en el modelo base, lo que dificulta evaluar riesgos de contaminacion o comportamiento indeseado en produccion.
- Recomendacion practica: no desplegar en produccion sin una evaluacion propia sobre el dominio objetivo y sin verificar la compatibilidad del tag `qwen3_5` con los motores de inferencia elegidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-AcousticGovernance-0.8B-v1
- Modelo base: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Repositorio de la organizacion en GitHub: https://github.com/szl-holdings
- Herramienta de generacion de fichas del autor: https://github.com/szl-holdings/estate-cards
