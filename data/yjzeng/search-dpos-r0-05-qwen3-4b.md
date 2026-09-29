# YJZENG/search-dpos-r0.05-qwen3-4b

## Resumen

YJZENG/search-dpos-r0.05-qwen3-4b es un checkpoint de 4,41 mil millones de parametros publicado en HuggingFace por el usuario YJZENG, construido sobre la arquitectura de Qwen3-4B. El nombre del repositorio sugiere un ajuste fino orientado a tareas de busqueda ("search") mediante optimizacion por preferencias (DPO), con el sufijo "r0.05" apuntando probablemente a un hiperparametro de entrenamiento, aunque el autor no ha publicado model card, paper ni configuracion de entrenamiento que lo confirmen.

Se trata de un modelo denso, no MoE, con pesos en safetensors y un repositorio de 8,8 GB, lo que corresponde a un checkpoint en bf16/fp16. No declara licencia, idiomas, pipeline ni tipos de cuantizacion, y cuenta con 11 descargas y 0 likes en el momento de redactar esta ficha, por lo que debe considerarse un artefacto de investigacion sin validacion comunitaria.

Su relevancia es acotada pero concreta: sirve como ejemplo de ajuste fino por preferencias sobre un modelo pequeno capaz de ejecutarse en GPU de consumo, y como punto de partida para quien quiera reproducir o auditar el pipeline "search + DPO" sobre Qwen3-4B. Toda la informacion tecnica que se ofrece a continuacion procede del modelo base Qwen3-4B y esta marcada como tal, ya que el autor no ha documentado las modificaciones aplicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No confirmada en el repositorio; el modelo base es un transformer decoder-only denso (Qwen3) con GQA, RoPE, SwiGLU, RMSNorm y QK-Norm |
| Parametros totales | 4.411.424.256 (4,41 B), dato real extraido de los safetensors |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en el repositorio; el modelo base Qwen3-4B soporta 32.768 tokens nativos y hasta 131.072 con escalado YaRN |
| Tipos de cuantizacion | No disponible en el repositorio; al distribuirse en safetensors bf16/fp16 es convertible a GGUF (Q4_K_M, Q5_K_M, Q8_0), AWQ, GPTQ y FP8 |
| Idiomas soportados | No disponible en el repositorio; el modelo base Qwen3 declara soporte para 119 idiomas y dialectos |
| Licencia | No disponible: el repositorio no declara licencia. El modelo base Qwen3-4B se publica bajo Apache 2.0 |
| Formato de pesos | safetensors; repositorio de 8,8 GB, compatible con bf16 y fp16 |

## Arquitectura y entrenamiento

El repositorio no incluye model card, informe tecnico ni configuracion de entrenamiento, de modo que la arquitectura solo puede inferirse a partir del modelo base. Qwen3-4B es un transformer decoder-only denso con 36 capas, dimension oculta de 2.560, atencion con consultas agrupadas (GQA) de 32 cabezas de consulta por 8 de clave/valor con dimension de cabeza 128, normalizacion RMSNorm, activacion SwiGLU, QK-Norm y RoPE. El vocabulario es de 151.936 tokens. El recuento real de parametros de este checkpoint (4,41 B) supera en unos 390 M al declarado para Qwen3-4B (4,02 B); esa diferencia coincide casi exactamente con el tamano de la matriz de embeddings (151.936 x 2.560), lo que apunta a que en este checkpoint la matriz de embeddings y la cabeza de salida no estan atadas. Es una inferencia, no un dato confirmado por el autor.

Sobre el entrenamiento solo puede especularse a partir del nombre: "dpos" sugiere optimizacion directa de preferencias (DPO) y "search" un corpus o una tarea centrada en busqueda o recuperacion de informacion. El sufijo "r0.05" podria corresponder a una tasa de aprendizaje, un coeficiente de regularizacion o un parametro de rango de LoRA, pero no hay informacion que lo confirme. Se desconoce por completo el numero de tokens de ajuste, la composicion del dataset, si hubo SFT previo, quien genero las preferencias y si los pesos finales son el resultado de fusionar un adaptador LoRA sobre el modelo base o de un ajuste completo. Cualquier afirmacion adicional sobre el proceso de entrenamiento seria una invencion.

## Capacidades

Todas las capacidades listadas se heredan del modelo base Qwen3-4B y no han sido verificadas para este checkpoint concreto:

- Generacion de texto y conversacion multi-turno en registro general.
- Razonamiento con modos diferenciados: Qwen3 incorpora un modo "thinking" que genera una cadena de razonamiento larga antes de la respuesta, y un modo "non-thinking" para respuestas directas.
- Generacion y comprension de codigo en multiples lenguajes, incluyendo completado, refactorizacion y explicacion.
- Razonamiento matematico y resolucion de problemas aritmeticos de varios pasos.
- Soporte de tool calling / function calling en el formato de Qwen3, orientado a integraciones con APIs externas.
- Capacidades de agente: planificacion de multiples pasos y encadenamiento de llamadas a herramientas.
- Multilingue segun el modelo base (119 idiomas y dialectos declarados), con rendimiento desigual entre idiomas.
- Posible especializacion en tareas de busqueda o seleccion de respuestas, si el ajuste por preferencias se realizo sobre ese dominio; no verificado.
- No se ha confirmado soporte de vision, audio ni otras modalidades: el modelo base es exclusivamente de texto.

## Casos de uso

Los casos siguientes asumen un comportamiento equivalente al del modelo base Qwen3-4B y requieren validacion previa, dado que no existen evaluaciones publicadas del checkpoint:

- Recuperacion y reranking en motores de busqueda interna: si el ajuste "search-dpos" se aplico sobre pares de preferencia de relevancia, el modelo podria puntuar o seleccionar pasajes candidatos generados por un retriever, con la ventaja de un coste de inferencia bajo (4,41 B de parametros) que permite puntuar cientos de candidatos por consulta.
- Atencion al cliente automatizada: con ventanas de contexto de 32.768 tokens en el modelo base, el modelo puede mantener conversaciones multi-turno con el historial completo y documentacion de producto anexada sin truncar.
- Asistente de generacion de codigo en IDE: el tamano permite ejecutarlo en una GPU de consumo junto al editor, y su soporte de function calling facilita integraciones con herramientas de analisis estatico o ejecucion de tests.
- Agentes de automatizacion con tool calling: encadenamiento de llamadas a APIs en flujos como consulta de estado de pedidos, creacion de tickets o extraccion de datos de un CRM, con el modelo decidiendo la siguiente accion.
- Extraccion de informacion estructurada en pipelines ETL: conversion de documentos no estructurados a JSON con un esquema fijo, aprovechando el modo non-thinking para reducir latencia y coste por documento.
- Resumen de documentacion tecnica extensa: condensacion de manuales, actas o informes de varias decenas de miles de tokens en un unico paso, gracias a la ventana de contexto del modelo base.
- Despliegue on-premise o en entornos con requisitos de soberania del dato: al pesar entre 2,7 GB y 8,8 GB segun cuantizacion, cabe en servidores modestos o incluso en estaciones de trabajo sin GPU dedicada de gama alta.
- Linea base de investigacion en alineacion: util como punto de comparacion en estudios sobre DPO y ajuste fino por preferencias en modelos de menos de 5 B de parametros, siempre que se documente adecuadamente su procedencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye evaluaciones en el repositorio ni se han encontrado articulos, blogs o informes asociados a este checkpoint concreto en la busqueda web realizada.

Los unicos resultados publicados corresponden al modelo base Qwen3-4B y aparecen recogidos en el informe tecnico de Qwen3 (arXiv:2505.09388) y en su model card oficial; no se reproducen aqui para no atribuir al ajuste un rendimiento que no ha sido medido.

## Requisitos de hardware

Estimaciones basadas en los 4,41 B de parametros declarados y en la ventana de contexto del modelo base:

- Pesos en bf16/fp16: 8,8 GB. Con cache KV para 32.768 tokens en bf16 (36 capas x 2 tensores x 8 cabezas KV x 128 dimensiones x 2 bytes, aproximadamente 0,147 MB por token) se anaden unos 4,8 GB, lo que situa el total en torno a 13,6 GB.
- Cuantizacion FP8 o int8: alrededor de 4,5 GB de pesos.
- Cuantizacion GGUF Q4_K_M: aproximadamente 2,7 GB; Q5_K_M, unos 3,1 GB; Q8_0, unos 4,7 GB.
- GPU de consumo: cabe holgadamente en RTX 3090, 4090, 4080, 4070 Ti Super y 4060 Ti de 16 GB en bf16; en RTX 3060 de 12 GB y RTX 4060 de 8 GB conviene usar cuantizacion de 8 o 4 bits y reducir la ventana de contexto.
- GPU de datacenter: A100 (40/80 GB), H100, L40S, A6000 y similares, con margen para lotes grandes o contextos de 131.072 tokens con YaRN.
- Opciones de despliegue: vLLM y SGLang para servicio de alta concurrencia con PagedAttention; TGI como alternativa; llama.cpp, Ollama y LM Studio para ejecucion local en CPU/GPU mixta; Transformers para evaluacion e inferencia puntual.
- Latencia y throughput: no hay mediciones publicadas. Como referencia teorica, la decodificacion en lote 1 esta limitada por el ancho de banda de memoria; con 8,8 GB de pesos, una GPU con 1 TB/s de ancho de banda (RTX 4090) impone un techo aproximado de 110 tokens por segundo, y una tarjeta de 500 GB/s (RTX 3060) de unos 55 tokens por segundo. Son cotas superiores optimistas, no cifras medidas.

## Comparativa con modelos similares

La comparacion se establece contra modelos densos de la misma franja de tamano (3-4 B de parametros), ya que no existen datos de rendimiento del checkpoint analizado:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| YJZENG/search-dpos-r0.05-qwen3-4b | 4,41 B | No disponible (base: 32.768 / 131.072 con YaRN) | No declarada | HuggingFace, 11 descargas, sin evaluaciones |
| Qwen/Qwen3-4B | 4,02 B | 32.768 nativos / 131.072 con YaRN | Apache 2.0 | HuggingFace y GitHub oficiales, ampliamente desplegado |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 131.072 | Licencia comunitaria de Llama 3.2 | HuggingFace, requiere aceptar terminos |
| google/gemma-3-4b-it | Aproximadamente 4 B | 131.072 | Terminos de uso de Gemma | HuggingFace, requiere aceptar terminos |
| microsoft/Phi-4-mini-instruct | 3,8 B | 131.072 | MIT | HuggingFace, uso comercial sin restricciones adicionales |

En terminos de rendimiento no procede comparar: el checkpoint analizado carece de resultados publicados, mientras que los otros cuatro cuentan con evaluaciones en sus informes tecnicos. La ventaja competitiva de este repositorio, si se confirma su especializacion en busqueda, seria la de un modelo pequeno y cuantizable con comportamiento ajustado a un dominio concreto; su desventaja es la ausencia total de documentacion, licencia y validacion.

## Limitaciones y advertencias

- Ausencia de licencia declarada. Sin una licencia explicita, no hay autorizacion clara para uso comercial ni para redistribucion. Aunque el modelo base Qwen3-4B sea Apache 2.0, el autor del ajuste debe declarar los terminos que aplican a su checkpoint. Es el riesgo legal mas importante.
- Trazabilidad nula. No hay model card, configuracion de entrenamiento, dataset ni descripcion del pipeline. No es posible auditar sesgos, contaminacion de datos ni calidad del ajuste.
- Riesgo de degradacion por sobreajuste. Un ajuste por preferencias sobre un modelo de 4 B puede reducir la diversidad de respuestas o empeorar capacidades generales (olvido catastrofico) si el dataset de preferencias era estrecho y el coeficiente de KL no estaba bien calibrado.
- Alucinacion. Es un modelo de 4,41 B: la tasa de invencion de hechos es estructuralmente superior a la de modelos de mayor tamano, especialmente en dominios especializados y en tareas de busqueda donde se le pida citar fuentes.
- Comportamiento no verificado en tareas de busqueda. El nombre del repositorio sugiere una especializacion, pero no hay ninguna evaluacion que demuestre mejora sobre el modelo base en recuperacion, ranking o grounded question answering.
- Cobertura idiomatica desconocida. Aunque Qwen3 declara 119 idiomas, el ajuste puede haber degradado el rendimiento fuera del idioma dominante del dataset de preferencias, presumiblemente el ingles.
- Fecha de creacion anomala en los metadatos (2026-09-29), posterior a la fecha de redaccion habitual de este tipo de fichas. Conviene tratar los metadatos temporales del repositorio con cautela.
- Popularidad practicamente nula (11 descargas, 0 likes). No hay senales de uso en produccion, ni issues, ni discusiones que permitan anticipar problemas reales.
- Sin garantias de soporte. El autor no ofrece mantenimiento, versionado ni canal de reporte de errores conocido.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/YJZENG/search-dpos-r0.05-qwen3-4b
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Informe tecnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Repositorio oficial de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Perfil de la organizacion Qwen en HuggingFace: https://huggingface.co/Qwen/models
- Portal oficial de Qwen: https://qwen.ai/home
