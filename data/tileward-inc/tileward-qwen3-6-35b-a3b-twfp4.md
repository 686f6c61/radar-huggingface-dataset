# Tileward-Inc/Tileward-Qwen3.6-35B-A3B-TWFP4

## Resumen

Tileward-Qwen3.6-35B-A3B-TWFP4 es una version comprimida del modelo Qwen3.6-35B-A3B desarrollada por Tileward-Inc mediante su tecnica propietaria de cuantizacion TWFP4. El modelo base Qwen3.6-35B-A3B es un transformer de tipo Mixture-of-Experts (MoE) con 35 mil millones de parametros totales y aproximadamente 3 mil millones activos por token, publicado por el equipo Qwen bajo licencia Apache-2.0. Tileward aplica una compresion de 4 bits que reduce el peso en disco de 71,9 GB a 23,1 GB, un 68% menos (factor 3,1x), y que ocupa 19,1 GiB de VRAM una vez cargado frente a los 64,6 GiB del original.

La propuesta de valor de esta build es mantener el rendimiento funcional del original con un coste de memoria muy inferior: segun la model card, conserva el 96,5% de coincidencia en la siguiente palabra respecto a las respuestas del modelo original, y queda a menos de medio punto en pruebas de function calling (BFCL 75,9% frente a 76,3%) y de documentos largos (AA-LCR 59,6% frente a 60,8%). Ademas, es ligeramente mas pequena que la build NVFP4 de NVIDIA (23,1 GB frente a 23,4 GB).

Es relevante ahora porque permite desplegar un MoE de 35B en GPUs de gama alta para consumo (19,1 GiB caben en una RTX 4090 de 24 GB) con una perdida de calidad marginal en tareas de tool calling y contexto largo. La contraparte importante es que **los pesos no estan publicados en Hugging Face**: el repositorio actua solo como ficha de presentacion y el acceso se solicita contactando directamente con un ingeniero de Tileward.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), heredada de Qwen3.6-35B-A3B |
| Parametros totales | 35B (modelo base) |
| Parametros activos | ~3B por token (segun denominacion A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | TWFP4 (4 bits, formato propietario de Tileward); build NVFP4 de NVIDIA disponible por separado |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (pesos no publicados; acceso bajo peticion) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.6-35B-A3B, un transformer con capas MoE que activa aproximadamente 3B parametros por token sobre un total de 35B. Esta configuracion reduce el coste computacional por token manteniendo una capacidad de representacion propia de un modelo denso mucho mayor. Tileward no reentrena el modelo: aplica una compresion post-entrenamiento a 4 bits con su esquema TWFP4, que segun la model card supera en tamano a la cuantizacion NVFP4 de NVIDIA y conserva mejor la fidelidad de salida.

Los detalles sobre datos de entrenamiento del modelo base (numero de tokens, composicion del corpus, etapas de RLHF/DPO) no se recogen en la informacion proporcionada. La innovacion tecnica destacable de esta build es el propio formato TWFP4: reduce el peso en disco un 68% y la huella en VRAM un 70% aproximadamente, con una degradacion medida de 0,4 puntos en BFCL y 1,2 puntos en AA-LCR respecto al original en BF16.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen3.6-35B-A3B.
- Function calling / tool calling: validado con BFCL al 75,9%, practicamente identico al original (76,3%).
- Manejo de documentos largos: validado con AA-LCR al 59,6% (original: 60,8%).
- Fidelidad de generacion: 96,5% de coincidencia en siguiente palabra con las respuestas del original.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de agentes con tool calling en GPUs de consumo: los 19,1 GiB cargados caben en una RTX 4090 (24 GB), permitiendo ejecutar localmente un MoE de 35B con calidad de function calling casi identica al original.
- Analisis de documentos largos en entornos con VRAM limitada: la retencion del 59,6% en AA-LCR permite tareas de recuperacion y sintesis sobre contextos extensos sin necesidad de infraestructura de centro de datos.
- Servicio de inferencia multi-cliente en una sola GPU: el ahorro de 45 GiB de VRAM frente al original libera capacidad para lotes concurrentes o para co-ubicar otros servicios en el mismo nodo.
- Sustitucion directa del modelo original en pipelines existentes: al mantener la arquitectura y el tokenizador del base, la integracion no requiere cambios de API, solo de pesos.
- Evaluacion comparativa de tecnicas de cuantizacion: util como referencia para medir la perdida de calidad de TWFP4 frente a NVFP4 y BF16 en tareas de tool calling y contexto largo.
- Prototipado de asistentes de codigo con llamadas a herramientas: el rendimiento en BFCL lo hace adecuado para flujos de edicion de codigo asistida con invocacion de funciones.

## Benchmarks y rendimiento

| Metrica | Qwen3.6-35B-A3B (original) | NVFP4 (NVIDIA) | TWFP4 (Tileward) |
|---|---|---|---|
| Tamano en disco | 71,9 GB | 23,4 GB | 23,1 GB |
| VRAM cargado | 64,6 GiB | no disponible | 19,1 GiB |
| BFCL function calls | 76,3% | no disponible | 75,9% |
| AA-LCR long documents | 60,8% | no disponible | 59,6% |
| Coincidencia siguiente palabra con el original | – | no disponible | 96,5% |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 19,1 GiB una vez cargado en GPU (dato de la model card).
- GPU recomendadas: RTX 4090 (24 GB) o superior; A100 y H100 con margen amplio para lotes grandes.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y previsiblemente en RTX 3090 (24 GB); no cabe en GPUs de 16 GB o menos.
- Opciones de despliegue: no disponibles en la informacion proporcionada (dependen del formato de pesos, que no se especifica).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BFCL | AA-LCR | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Tileward-Qwen3.6-35B-A3B-TWFP4 | 35B (3B activos) | no disponible | 75,9% | 59,6% | Apache-2.0 | Bajo peticion |
| Qwen3.6-35B-A3B (BF16) | 35B (3B activos) | no disponible | 76,3% | 60,8% | Apache-2.0 | Publico en HF |
| Qwen3.6-35B-A3B-NVFP4 (NVIDIA) | 35B (3B activos) | no disponible | no disponible | no disponible | Apache-2.0 | Publico en HF |

## Limitaciones y advertencias

- Los pesos no estan publicados en Hugging Face; el acceso requiere solicitar una reunion con un ingeniero de Tileward, lo que impide uso inmediato y descarga directa.
- El formato TWFP4 es propietario: la compatibilidad con runtimes estandar (vLLM, llama.cpp, TGI) no esta documentada en la informacion disponible.
- Perdida de calidad medible aunque pequena: 0,4 puntos en BFCL y 1,2 puntos en AA-LCR respecto al original BF16.
- La metrica de coincidencia de siguiente palabra (96,5%) no equivale a una evaluacion completa de calidad; puede ocultar degradaciones en tareas no medidas.
- Riesgo de alucinacion y sesgos conocidos del modelo base: no documentados en la informacion proporcionada.
- Idiomas soportados y longitud de contexto del modelo base: no disponibles en la informacion proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero las condiciones de acceso a los pesos TWFP4 pueden imponer terminos adicionales no recogidos en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tileward-Inc/Tileward-Qwen3.6-35B-A3B-TWFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Web de Tileward: https://tileward.com
- Articulo de investigacion: https://tileward.com/research/a-smaller-qwen3-6-35b-a3b/
- Metodologia de evaluacion: https://tileward.com/evals/#compressed-model-a3b-twfp4
- Repositorio de investigacion: https://tileward.com/research/
- Contacto para acceso: https://calendar.app.google/hg2DzFTxKJgwFWm19
