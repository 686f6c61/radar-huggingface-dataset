# vosldtgbj/project-llm-rlvr-dynamic-v2-step-75

## Resumen

El modelo `vosldtgbj/project-llm-rlvr-dynamic-v2-step-75` es un checkpoint de pesos completos en BF16 dentro de una trayectoria de aprendizaje por refuerzo con verificación (RLVR) sobre un modelo Gemma 4 de aproximadamente 12.000 millones de parametros. Lo publica el usuario `vosldtgbj` y su modelo base directo es `vosldtgbj/project-llm-rlvr-dynamic-v2-step-50`, que a su vez hereda los parametros de RLVR v1 step 125. El pipeline declarado en HuggingFace es `any-to-any`, aunque la model card indica explicitamente que el entrenamiento solo afecta a tareas de texto: las torres de vision y audio permanecen congeladas.

El checkpoint corresponde al paso local 75 de la fase RLVR v2 (paso acumulado 200 de toda la trayectoria), es decir, 75 actualizaciones del optimizador desde el inicio de v2. La relevancia de este tipo de publicaciones es que expone la evolucion intermedia de un pipeline completo de ajuste (CPT, SFT y RLVR con GRPO sincrono) sobre Gemma 4, con datos de entrenamiento documentados y verificadores deterministas, lo que permite reproducir el entrenamiento desde cualquier punto o inicializar nuevos experimentos.

No es un modelo final ni una release estable: la propia model card advierte que estos checkpoints no tienen una puntuacion de validacion independiente y que solo se pueden comparar entre si ejecutando una evaluacion congelada con parametros de inferencia identicos. El repositorio tiene 0 descargas y 0 likes, y su tamano es de 24,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Gemma4UnifiedForConditionalGeneration` (transformer, `model_type: gemma4_unified`) |
| Parametros totales | 11.959.730.224 segun los safetensors del repo; la model card declara 12.484.280.320 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible como especificacion del modelo; el entrenamiento RLVR limita entrada / generacion / total a 8.192 / 2.048 / 10.240 tokens |
| Tipos de cuantizacion | no disponible: solo se publican pesos BF16 (5 shards safetensors) |
| Idiomas soportados | japones (ja) e ingles (en) |
| Licencia | `gemma` (Gemma 4 license, enlace en la model card) |
| Formato de pesos | safetensors (5 shards + `model.safetensors.index.json`), precision BF16 |
| Capas de texto | 48 |
| Hidden size de texto | 3.840 |
| Tamano de vocabulario | 262.144 |
| Volumen de pesos | aproximadamente 23,92 GB decimales / 22,3 GiB |
| Modelo base directo | `vosldtgbj/project-llm-rlvr-dynamic-v2-step-50` |
| Modelo original de la familia | `google/gemma-4-12B-it` |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de la familia Gemma 4 unificada, con 48 capas de texto, hidden size 3.840 y vocabulario de 262.144 tokens. El modelo conserva las torres de vision y audio y los proyectores multimodales del modelo original, pero estos permanecen congelados durante todo el proceso: las modificaciones de pesos se concentran en el modelo de lenguaje de texto. Los repositorios de la familia guardan pesos completos ya fusionados, no adaptadores LoRA, por lo que no requieren busqueda de base ni merge al cargar.

El entrenamiento sigue una cadena documentada: `google/gemma-4-12B-it`, dos rondas de continued pre-training (20 experimentos de 0,5 epoch y 10 de 1,0 epoch), SFT v3 sobre la vista congelada `official_90_10` (67.195 registros de entrenamiento y 4.083.167 tokens supervisados, empaquetados en 5.824 packs de longitud 8.192), RLVR v1 con pasos 25 a 125, y RLVR Dynamic v2 desde el paso 125 de v1. Este checkpoint es el paso local 75 de v2, con learning rate `5e-7`, GRPO sincrono, 30 grupos de prompt efectivos por actualizacion, 16 rollouts por prompt (480 rollouts por paso), maximo de 5 turnos de interaccion, clipping del ratio PPO entre 0,2 y 0,28, ratio de importance sampling truncado de 2,0, penalizacion KL contra la politica de referencia de 0 y optimizador Transformer Engine FusedAdam con weight decay 0,1 y max grad norm 1,0. El muestreo es dinamico y la temperatura de rollout es 0,7 con top-p 1,0.

Los datos de RLVR provienen de `SF-RLVR-Unified-v2`: 37.500 tareas (30.000 de dominio de proyecto y 7.500 generales) repartidas en 15 familias verificables, construidas a partir de 104 libros blancos japoneses publicos. Cada tarea incluye prompt visible, referencia estructurada oculta, `verifier_id` y `reward_contract_id`; las recompensas se calculan con verificadores deterministas o con un juez Nemotron 3 Ultra desplegado en `konst154`. El entrenamiento se ejecuto en 16 GPU H100 SXM y los rollouts con vLLM con tensor parallel 2. El archivo no incluye estado del optimizador, scheduler ni shards FSDP/DTensor, por lo que no permite reanudar el entrenamiento original de forma exacta.

## Capacidades

- Generacion de texto y razonamiento en japones e ingles sobre documentos: las familias de entrenamiento incluyen QA de documento unico y razonamiento multi-documento.
- Manejo de conflictos de informacion: familias especificas de conflicto entre fuentes, conflicto temporal y de version.
- Respuestas con abtencion: familias de abstención y de preguntas no respondibles, tanto en el dominio de proyecto como en QA general.
- Salidas estructuradas: family de structured output tanto en dominio como en el conjunto general, con verificacion por esquema.
- Tool calling y function calling: family de trayectorias normales de herramientas y de recuperacion ante fallo de herramienta, con hasta 5 turnos de interaccion por episodio.
- Seguimiento de instrucciones y razonamiento generico: familias de instruction following, ReasoningGym, matemáticas abiertas, aritmética y MCQA.
- Codigo competitivo: family de competitive coding con verificacion por ejecucion o comparacion de resultados.
- Robustez ante inyeccion de prompts: family especifica de prompt injection y de fronteras de permisos.
- Capacidades multimodales: la arquitectura y el pipeline (`any-to-any`, tag `image-text-to-text`) las soportan en teoria, pero las torres de vision y audio no se entrenaron en esta fase, por lo que no hay evidencia de mejora ni garantia de calidad en tareas de imagen o audio.

## Casos de uso

- Atencion al cliente automatizada en japones: el modelo puede mantener conversaciones multi-turno (hasta 5 turnos en el regimen de entrenamiento) y abstenerse cuando la informacion no esta en el contexto, lo que reduce respuestas inventadas en consultas sobre documentacion corporativa.
- Busqueda documental sobre normativa o informes: con 8.192 tokens de entrada y entrenamiento especifico en QA de documento unico y razonamiento multi-documento, es adecuado para responder preguntas sobre conjuntos de PDFs largos troceados en fragmentos.
- Agentes con herramientas en produccion: las familias de trayectorias de herramienta y de recuperacion ante fallos lo hacen util para pipelines donde el modelo debe llamar APIs, detectar errores y reintentar con una estrategia distinta.
- Generacion de JSON y salidas validadas: la family de structured output permite usarlo como extractor o normalizador de datos en sistemas que exigen esquemas estrictos verificables.
- Moderacion de permisos e inyeccion de prompts: se puede emplear como capa de defensa que detecta intentos de manipulacion y respeta fronteras de permisos definidas en el contexto.
- Asistencia a programacion con verificacion: la family de codigo competitivo mas los verificadores por ejecucion lo hacen adecuado para tareas de generacion de codigo donde existe un test que valida el resultado.
- Investigacion en RLVR: sirve como punto de partida reproducible para estudiar el efecto del muestreo dinamico y de distintas recetas de recompensa, ya que se publican los checkpoints cada 25 pasos y los datasets de entrenamiento.
- Deteccion de contradicciones entre versiones de documentos: la familia de conflicto temporal y de version esta disenada para senalar discrepancias entre revisiones sucesivas de un mismo texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que este checkpoint no tiene una puntuacion de validacion independiente y que las recompensas registradas en los logs de entrenamiento son senales en linea sobre los datos muestreados, influidas por la dificultad de las tareas, el muestreo dinamico y la politica vigente. Por tanto, no son comparables entre checkpoints ni sirven como evaluacion offline congelada. El unico conjunto de evaluacion documentado es el `locked eval` de 4.700 tareas, con un `validation core` congelado de 470 tareas, pero sus resultados no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 23,9 GB decimales (22,3 GiB) solo para los parametros; hay que sumar activaciones y cache KV, por lo que en la practica se necesita un margen adicional.
- GPU recomendadas para BF16: H100 de 80 GB, A100 de 40 u 80 GB, o GPUs profesionales con 48 GB o mas (por ejemplo L40S). El entrenamiento original uso 16 H100 SXM, dato que no debe confundirse con el requisito de inferencia.
- Consumer GPU: con BF16 no cabe en una GPU de 24 GB tipo RTX 4090 o RTX 3090; requeriria dos unidades con tensor parallel. El repositorio no publica cuantizaciones, por lo que para ejecutarlo en GPUs de 16-24 GB habria que convertirlo a GGUF u otro formato cuantizado (un Q4 de un modelo de 12B ronda los 7-8 GB, estimacion derivada del tamano de pesos, no confirmada por el autor).
- Opciones de despliegue: vLLM (backend usado para los rollouts del entrenamiento, con tensor parallel size 2), TGI y `transformers` de forma nativa; llama.cpp u Ollama requieren conversion previa a GGUF, que el autor no proporciona.
- Latencia y throughput: no disponible. No hay cifras publicadas de tokens por segundo ni de latencia en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Estado |
|---|---|---|---|---|---|
| `project-llm-rlvr-dynamic-v2-step-75` | 11.959.730.224 (safetensors) / 12.484.280.320 (model card) | no disponible; limites de entrenamiento 8.192/2.048/10.240 | ja, en | Gemma | Checkpoint intermedio de RLVR, 0 descargas |
| `project-llm-rlvr-dynamic-v2-step-50` | Misma arquitectura | Igual | ja, en | Gemma | Checkpoint anterior, padre directo de este modelo |
| `project-llm-rlvr-dynamic-v2-step-100` | Misma arquitectura | Igual | ja, en | Gemma | Checkpoint siguiente en la trayectoria v2 |
| `google/gemma-4-12B-it` | Misma arquitectura segun la model card | no disponible | Multilingue (segun modelo original) | Gemma | Base original; no fue re-subido por este proyecto |

No se dispone de datos de rendimiento comparativos entre estos modelos. Cualquier comparacion de calidad entre los checkpoints de la familia exige, segun la propia model card, ejecutar la misma evaluacion congelada con parametros de inferencia identicos sobre los 11 puntos de guardado. No se han identificado en la informacion disponible otros modelos de terceros comparables con la misma receta de RLVR sobre Gemma 4.

## Limitaciones y advertencias

- Es un checkpoint intermedio de investigacion, no una release estable: el repositorio tiene 0 descargas y 0 likes, por lo que no ha pasado validacion de la comunidad.
- Ausencia de evaluacion offline: la model card insiste en que no se debe interpretar la recompensa de los logs de entrenamiento como rendimiento del modelo ni usarla para ordenar checkpoints.
- Riesgo de sobreajuste a las recompensas: parte del sistema de recompensa depende de un juez (Nemotron 3 Ultra) y de verificadores deterministas, lo que puede favorecer comportamientos que maximizan la recompensa sin mejorar la utilidad real.
- Alucinacion: aunque el entrenamiento incluye familias de abtencion y de QA no respondible, no hay datos de benchmarks que cuantifiquen la tasa de invencion de contenido.
- Idioma: solo japones e ingles. No hay evidencia de soporte de castellano ni de otras lenguas, y el conjunto general del SFT es mayoritariamente en ingles.
- Contexto: la ventana efectiva no esta publicada; los limites de 8.192 tokens de entrada y 2.048 de generacion son restricciones de la receta de RLVR y no necesariamente la capacidad maxima del modelo.
- Multimodalidad no entrenada: aunque el pipeline declarado sea `any-to-any` y la arquitectura incluya torres de vision y audio, estas permanecen congeladas; no se debe asumir calidad en tareas de imagen o audio.
- No permite reanudacion exacta: el archivo no contiene estado del optimizador, scheduler, semilla, cursor del dataloader ni shards de FSDP/DTensor.
- Licencia Gemma: el uso comercial y la redistribucion estan sujetos a los terminos de la Gemma 4 License, con las restricciones de uso aceptable que esta impone; es obligatorio revisarla antes de cualquier despliegue en produccion.
- Discrepancia de recuento de parametros entre los safetensors (11.959.730.224) y la model card (12.484.280.320), probablemente por inclusion o exclusion de componentes multimodales congelados; conviene verificarlo antes de dimensionar infraestructura.
- Sesgos: no hay informacion disponible sobre analisis de sesgos ni sobre la composicion demografica de los datos de dominio, que proceden de libros blancos japoneses.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vosldtgbj/project-llm-rlvr-dynamic-v2-step-75
- Modelo base directo (v2 step 50): https://huggingface.co/vosldtgbj/project-llm-rlvr-dynamic-v2-step-50
- Siguiente checkpoint publico (v2 step 100): https://huggingface.co/vosldtgbj/project-llm-rlvr-dynamic-v2-step-100
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Dataset de SFT v3: https://huggingface.co/datasets/vosldtgbj/project-llm-dataset-sft-citation-optimized-v3
- Dataset RLVR unificado v2: https://huggingface.co/datasets/vosldtgbj/project-llm-dataset-rlvr-unified-v2-37500
- Dataset de dominio RLVR v1: https://huggingface.co/datasets/vosldtgbj/project-llm-dataset-rlvr-domain-v1
- Modelo original de la familia: https://huggingface.co/google/gemma-4-12B-it

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; todos los enlaces anteriores proceden de la model card y de los metadatos de HuggingFace, no de la busqueda.
