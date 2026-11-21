# tinyopsec/Jeesup-svd-safety-l3_swift_jbbcal2_remove50-GGUF

## Resumen

`tinyopsec/Jeesup-svd-safety-l3_swift_jbbcal2_remove50-GGUF` es un conjunto de cuantizaciones GGUF de un checkpoint derivado de Llama-3-8B-Instruct, comprimido mediante la tecnica Swift-SVD hasta retener el 50% de los parametros densos, con recuperacion posterior mediante LoRA. El modelo base es `Jeesup/svd-safety-l3_swift_jbbcal2_remove50`, y la conversion a GGUF se ha realizado con llama.cpp. El autor es el usuario de Hugging Face `tinyopsec`.

El interes del artefacto es fundamentalmente de investigacion: forma parte de un estudio sobre el compromiso entre compresion SVD y degradacion de las salvaguardas de seguridad. El propio autor advierte en la model card que varias ramas del grid experimental estan deliberadamente degradadas en seguridad y que no se trata de un asistente de proposito general.

Por tanto, no es un modelo para produccion ni para uso como asistente. Su valor esta en servir como material reproducible para estudiar como la compresion de bajo rango afecta al comportamiento de rechazo de un modelo alineado, y en ofrecer variantes cuantizadas (desde F16 hasta Q2_K) que facilitan ejecutar el experimento en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama-3-8B-Instruct, comprimida con Swift-SVD) |
| Parametros totales | 8.030.261.248 (segun safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base deriva de Llama-3-8B-Instruct) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible (la model card no los declara) |
| Licencia | Llama 3 Community License |
| Formato de pesos | GGUF (repo de 77,6 GB con todas las variantes) |

## Arquitectura y entrenamiento

El modelo base es un Llama-3-8B-Instruct sometido a compresion por descomposicion en valores singulares (SVD) de tipo Swift, que reduce el numero de parametros densos en un 50%. Sobre esa representacion comprimida se aplica una recuperacion mediante LoRA, presumiblemente para mitigar la perdida de calidad derivada del truncamiento de rangos. El checkpoint resultante conserva el recuento de parametros del modelo original (8.030.261.248), lo que sugiere que la compresion se materializa en la estructura de las matrices y no en una reduccion del tensor almacenado.

La nomenclatura del checkpoint (`svd-safety-l3_swift_jbbcal2_remove50`) indica que el experimento combina compresion SVD con evaluacion de seguridad sobre un benchmark de tipo Jailbreak (probablemente JailbreakBench, por la abreviatura `jbb`). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset de recuperacion LoRA ni si se aplicaron etapas de RLHF o DPO adicionales; todos estos datos deben considerarse no disponibles.

## Capacidades

- Generacion de texto conversacional, heredada de Llama-3-8B-Instruct.
- Razonamiento y respuesta a instrucciones en el formato de chat de Llama 3.
- Capacidad multilingue no declarada explicitamente; la model card no especifica idiomas.
- Soporte de tool calling y function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el autor desaconseja su uso como asistente general.
- Capacidades especiales: ninguna declarada. El proposito del artefacto es el estudio de la degradacion de seguridad bajo compresion.
- Ejecutable en cualquier runtime compatible con GGUF (llama.cpp, Ollama, LM Studio, koboldcpp).

## Casos de uso

- Investigacion sobre compresion de modelos: permite reproducir el experimento de Swift-SVD al 50% y medir la perdida de calidad frente al Llama-3-8B-Instruct original usando las distintas cuantizaciones como variable controlada.
- Estudio de degradacion de salvaguardas: el checkpoint esta disenado para analizar como la compresion de bajo rango afecta a las tasas de rechazo ante prompts maliciosos; util para equipos de red teaming que investiguen robustez de alineamiento.
- Evaluacion comparativa de cuantizaciones: la disponibilidad de trece variantes (F16 a Q2_K) permite medir el impacto de la cuantizacion en tareas de seguridad y calidad sobre un mismo checkpoint comprimido.
- Docencia y divulgacion: sirve como ejemplo practico de pipeline completo (SVD, LoRA, conversion a GGUF) en cursos de eficiencia de modelos.
- Pruebas de infraestructura de inferencia: util para validar despliegues con llama.cpp u Ollama en entornos de laboratorio antes de pasar a modelos de produccion.
- Analisis de robustez en pipelines de moderacion: permite estudiar si un modelo comprimido mantiene comportamientos de rechazo comparables a los del modelo denso, como paso previo a decidir si la compresion es aceptable en sistemas con requisitos de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16,1 GB en F16; en torno a 8-9 GB en Q8_0; unos 5-6 GB en Q4_K_M; alrededor de 3-4 GB en Q2_K. Estas cifras son estimaciones a partir del tamano de los ficheros GGUF y del recuento de parametros, no datos publicados por el autor.
- GPU recomendadas: A100 o H100 para F16 con contexto largo; RTX 4090 (24 GB) para F16 o Q8_0; RTX 3090/4080 para Q5 y Q4; GPUs de 8 GB para Q4_K_M y Q3.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o mas con cuantizaciones Q4 o inferiores; en 6 GB con Q3 o Q2, a costa de degradacion adicional.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. No se documenta soporte para vLLM ni TGI, que requieren formatos distintos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tinyopsec/Jeesup-svd-safety-l3_swift_jbbcal2_remove50-GGUF | 8.030.261.248 | no disponible | Llama 3 Community | GGUF | Checkpoint comprimido al 50% con SVD y seguridad degradada deliberadamente |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030.261.248 | 8.192 tokens (segun la model card oficial de Llama 3) | Llama 3 Community | safetensors, GGUF (comunidad) | Modelo de referencia sin comprimir |
| Jeesup/svd-safety-l3_swift_jbbcal2_remove50 | 8.030.261.248 | no disponible | Llama 3 Community | safetensors | Checkpoint base del que derivan estas cuantizaciones |

La comparacion directa con otros modelos comprimidos por SVD no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente que varias ramas del grid experimental estan degradadas en seguridad; no debe usarse como asistente de proposito general ni en produccion.
- Riesgo elevado de respuestas inseguras o de fallo en los rechazos ante prompts maliciosos, por diseno del experimento.
- La compresion al 50% de parametros densos puede degradar la calidad general, la coherencia y el seguimiento de instrucciones respecto al Llama-3-8B-Instruct original; no se han publicado metricas que cuantifiquen esa perdida.
- Sesgos conocidos: no documentados en la informacion disponible; cabe esperar los heredados de Llama 3.
- Riesgo de alucinacion: no cuantificado; previsiblemente igual o superior al del modelo base.
- Idiomas soportados no declarados; no se garantiza un comportamiento multilingue fiable.
- Licencia Llama 3 Community: impone restricciones de uso comercial, obligaciones de atribucion y la politica de uso aceptable de Meta; el uso de este derivado queda sujeto a dicha licencia.
- Artefacto de investigacion con 0 likes y 833 descargas en el momento de la consulta; sin validacion externa conocida.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tinyopsec/Jeesup-svd-safety-l3_swift_jbbcal2_remove50-GGUF
- Modelo base: https://huggingface.co/Jeesup/svd-safety-l3_swift_jbbcal2_remove50
- Llama 3 (Meta): https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Licencia Llama 3: https://llama.meta.com/llama3/license/
