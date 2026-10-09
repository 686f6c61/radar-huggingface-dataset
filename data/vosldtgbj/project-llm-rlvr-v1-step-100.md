# vosldtgbj/project-llm-rlvr-v1-step-100

## Resumen

`vosldtgbj/project-llm-rlvr-v1-step-100` es un checkpoint intermedio de pesos completos en BF16 dentro de una trayectoria de aprendizaje por refuerzo con recompensas verificables (RLVR). No es un modelo nuevo con arquitectura propia: se trata de `google/gemma-4-12B-it` (arquitectura `gemma4_unified`, 12.484.280.320 parametros declarados por el autor y 11.959.730.224 parametros reales segun los safetensors publicados) que ha pasado por un pipeline de continual pretraining (CPT), un ajuste supervisado (SFT v3) y una fase de RLVR concentrada en tareas verificables de dominio documental japones. El repositorio corresponde al paso 100 de la fase RLVR v1, heredado directamente de `vosldtgbj/project-llm-rlvr-v1-step-75` y predecesor de `project-llm-rlvr-v1-step-125`.

El problema que aborda es el de la verificabilidad en tareas de agente: el modelo se entrena con recompensas producidas por verificadores deterministas o por un judge restringido, sobre un conjunto congelado de 37.500 tareas repartidas en 15 familias verificables (30.000 de dominio, basadas en 104 libros blancos japoneses publicos, y 7.500 de tipo general). La fase utiliza GRPO sincrono con 30 grupos de prompt y 16 rollouts por prompt (480 rollouts por actualizacion), una tasa de aprendizaje de 1e-6 y 16 GPU H100 SXM, con vLLM como backend de generacion en tensor parallelism 2.

Su relevancia es doble. Por un lado, es un ejemplo documentado de infraestructura de RL a escala media: el autor publica cada 25 pasos de optimizador, con la trazabilidad de datos, contratos de recompensa y recetas de entrenamiento. Por otro lado, conviene subrayarlo: el propio autor advierte que las recompensas de rollout no son una evaluacion offline congelada y no permiten clasificar checkpoints entre si, por lo que este repositorio debe tratarse como un punto de una trayectoria parametrica, no como un modelo evaluado y listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal unificado, `Gemma4UnifiedForConditionalGeneration` (`model_type: gemma4_unified`); 48 capas de texto, hidden size 3.840, vocabulary size 262.144 |
| Parametros totales | 11.959.730.224 segun los safetensors del repositorio; la model card declara 12.484.280.320 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible como ventana maxima del modelo base; en el entrenamiento RLVR se usaron limites de 8.192 tokens de entrada, 2.048 de generacion y 10.240 en total |
| Tipos de cuantizacion | solo BF16 en el repositorio (5 shards safetensors); no se publican GGUF, INT8 ni INT4 |
| Idiomas soportados | japones (`ja`) e ingles (`en`) |
| Licencia | gemma (Gemma 4 License, enlazada en la model card) |
| Formato de pesos | safetensors BF16 en 5 shards + `model.safetensors.index.json`; ~23,92 GB decimales (~22,3 GiB) |
| Tamano del repositorio | 24,0 GB |
| Pipeline declarado | any-to-any |
| Precision de exportacion | BF16 |

## Arquitectura y entrenamiento

La base es un modelo multimodal unificado en el que conviven torre visual, torre de audio y proyecciones multimodales junto al modelo de lenguaje. En este proyecto, sin embargo, el entrenamiento se ha aplicado exclusivamente a texto: las torres de vision y audio y los activos de proyeccion multimodal permanecen congelados, y los cambios parametricos se concentran en el modelo de lenguaje de 48 capas. El repositorio incluye configuracion, generation config, tokenizer, processor y chat template, pero no incluye estado de optimizador, scheduler, semillas, cursor de dataloader ni shards de FSDP/DTensor, de modo que sirve para inferencia, evaluacion unificada o como inicializacion de nuevos entrenamientos, pero no para reanudar el job original de forma exacta a nivel de bit.

La receta de RLVR v1 es GRPO sincrono con 30 grupos de prompt efectivos y 16 rollouts por prompt por paso de optimizador (480 rollouts por actualizacion), muestreo estandar con dynamic sampling desactivado, tasa de aprendizaje 1e-6, hasta 5 turnos de interaccion, ratios de clip PPO entre 0,2 y 0,28, ratio de importance sampling truncado de 2,0 y penalizacion KL contra la politica de referencia de 0 (por tanto, sin anclaje KL explicito). El optimizador es Transformer Engine FusedAdam con betas 0,9/0,999, epsilon 1e-8, weight decay 0,1 y max grad norm 1,0; la temperatura de rollout es 0,7 con top-p 1,0. El hardware de entrenamiento son 16 H100 SXM repartidas en dos nodos (hgpn117 y hgpn126).

La senal de recompensa procede de verificadores deterministas o de un judge restringido (Nemotron 3 Ultra en algunos contratos de recompensa), complementados por ejecucion de entorno para tareas de codigo. La procedencia de datos es trazable: el SFT v3 usa una vista congelada `official_90_10` con 67.195 registros y 4.083.167 tokens supervisados, empaquetados en 5.824 packs de longitud 8.192 (eficiencia de packing 0,9240), y el RLVR parte de `SF-RLVR-Unified-v2` con 15 familias verificables. Este checkpoint concreto es el paso 100 de la fase v1, que completa 125 actualizaciones de parametros consumiendo los primeros 3.750 prompts de la secuencia estatica de entrenamiento.

## Capacidades

- Generacion de texto en japones e ingles, con foco declarado en dominio documental japones.
- Respuesta fundamentada en documentos (single-document grounded) y razonamiento sobre multiples documentos.
- Manejo de conflictos de fuente y de version temporal dentro de un mismo corpus.
- Trayectorias de uso de herramientas (tool calling) de hasta 5 turnos por interaccion, incluyendo recuperacion ante fallos de herramienta.
- Abtencion, peticion de aclaracion y deteccion de preguntas no respondibles.
- Salida estructurada conforme a esquema (structured output).
- Robustez frente a inyeccion de prompt y limites de permisos.
- Capacidades generales de anclaje: seguimiento de instrucciones, agent/tool, codigo, matematicas y ciencia, aritmetica, MCQA, safety y salida estructurada.
- El pipeline declarado es `any-to-any` y el repositorio incluye processor, pero las torres de vision y audio estan congeladas y no fueron entrenadas en este proyecto: no hay evidencia publicada en la informacion disponible de mejora de capacidades visuales o de audio.
- No se documenta un modo de razonamiento explicito (thinking mode) ni busqueda en internet; el proyecto asume ausencia de busqueda web.

## Casos de uso

- Atencion al cliente automatizada sobre documentacion corporativa: el modelo esta entrenado para respuestas fundamentadas en documentos y para solicitar aclaracion o abstenerse cuando la informacion no esta en las fuentes, lo que reduce respuestas inventadas en entornos donde la trazabilidad es obligatoria.
- Asistente de consulta sobre normativa y libros blancos japoneses: el corpus de dominio de 104 documentos publicos japoneses y las familias de conflicto de fuente y version temporal encajan con flujos de consulta regulatoria donde hay que distinguir versiones vigentes de obsoletas.
- Agente con herramientas en pipelines internos: soporta trayectorias de tool calling de varios turnos con recuperacion ante errores, adecuado para orquestar APIs de consulta, ticketing o CRM con verificacion posterior.
- Extraccion y validacion de datos con salida estructurada: al haberse entrenado con tareas de schema y verificador determinista, es utilizable en procesos ETL o de reconciliacion donde la salida debe ajustarse a un JSON o formulario estricto.
- Moderacion y filtrado de entradas hostiles: incluye familia de entrenamiento especifica de prompt injection y limites de permisos, orientada a actuar como capa de validacion antes de ejecutar acciones sensibles.
- Generacion asistida de codigo y resolucion de problemas cuantitativos: el blend general incluye competitive coding, matematicas abiertas y aritmetica verificada por ejecucion, aprovechable en tareas de scripting y comprobacion numerica.
- Base para nuevos ciclos de RL o SFT: al ser pesos completos BF16 sin estado de optimizador, es un punto de partida limpio para reentrenar con otra receta o para evaluacion comparativa de los 11 checkpoints de la trayectoria.
- Evaluacion de metodologia de RL: util en investigacion para medir el efecto de GRPO sincrono con recompensas verificables sobre un modelo de 12B y comparar pasos 25/50/75/100/125/149 bajo el mismo protocolo de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que los rewards registrados en los logs de entrenamiento son senales online sobre los datos muestreados, estan afectados por la dificultad de las tareas, por la politica y por la configuracion de muestreo, y no equivalen a una evaluacion offline congelada de agente. El propio autor senala que la comparacion correcta exige ejecutar un mismo conjunto de evaluacion congelado y parametros de inferencia identicos sobre los 11 checkpoints, algo que no se aporta en la documentacion disponible. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de metricas de familia verificable para este repositorio.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 23,92 GB decimales (22,3 GiB) repartidos en 5 shards; hay que sumar cache KV y activaciones.
- VRAM estimada para inferencia en BF16: por encima de 40 GB en escenarios de contexto largo; no hay cifras publicadas de consumo real.
- GPU recomendadas: 1x H100 80 GB para margen comodo; 1x A100 40 GB queda muy justa y limita el contexto utilizable; 2x GPU de 24-48 GB con tensor parallelism es una alternativa razonable.
- GPU de consumo: no cabe en BF16 en una RTX 4090 de 24 GB sin cuantizar, y el repositorio no publica pesos cuantizados; seria necesaria una conversion propia.
- Opciones de despliegue: `transformers` (libreria declarada), vLLM (utilizado en el propio entrenamiento con tensor parallel size 2) y TGI. `llama.cpp` u Ollama requeririan convertir los pesos a GGUF, conversion no disponible en el repositorio.
- El repositorio incluye processor y chat template, por lo que puede cargarse tambien por la ruta multimodal del modelo base, si bien las torres visual y de audio estan congeladas.
- Latencia y throughput estimados: no disponible.
- Nota de despliegue: al no incluir estado de optimizador, es apto para servir en produccion de investigacion, pero su uso comercial queda sujeto a la Gemma 4 License.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `project-llm-rlvr-v1-step-100` (este) | 11.959.730.224 (safetensors); 12.484.280.320 declarados | no disponible; entrenado con 8.192 de entrada / 2.048 de generacion | sin benchmarks publicados | gemma | HuggingFace, pesos BF16 |
| `project-llm-rlvr-v1-step-75` (padre directo) | mismos parametros | mismas condiciones de entrenamiento | sin benchmarks publicados | gemma | HuggingFace, pesos BF16 |
| `project-llm-rlvr-v1-step-125` (siguiente) | mismos parametros | mismas condiciones de entrenamiento | sin benchmarks publicados | gemma | HuggingFace, pesos BF16 |
| `google/gemma-4-12B-it` (base) | 12.484.280.320 declarados | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | gemma | modelo base referenciado, no re-subido por este proyecto |

La comparacion con alternativas externas de tamano similar (por ejemplo otros modelos abiertos de 12B-14B) no es posible con los datos disponibles: no se aportan contextos, licencias ni resultados de benchmark de esos modelos en la informacion proporcionada, y comparar unicamente por numero de parametros no seria riguroso.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: cualquier afirmacion de rendimiento frente a otros modelos carece de respaldo en la informacion disponible.
- Los rewards de rollout no son una evaluacion offline congelada y no sirven para clasificar checkpoints; el autor lo advierte de forma explicita.
- Sesgos conocidos: no hay seccion de sesgos ni evaluacion de seguridad publicada en la informacion disponible; el modelo hereda los sesgos de `google/gemma-4-12B-it` y del corpus de libros blancos japoneses utilizado.
- Riesgo de alucinacion: el entrenamiento incluye familias de abtencion y de conflicto de fuente, pero no hay datos publicados de tasa de alucinacion que permitan cuantificar la mejora.
- Cobertura idiomatica limitada: solo se declaran japones e ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Limite de contexto efectivo: la receta de RLVR trabajo con 8.192 tokens de entrada y 2.048 de generacion; no se garantiza un comportamiento optimo mas alla de esos margenes aunque la arquitectura base los soporte.
- Ambito restringido a texto: las torres de vision y audio estan congeladas, por lo que el pipeline `any-to-any` no implica mejoras reales en modalidades no textuales.
- Restricciones de licencia: se aplica la Gemma 4 License, que impone condiciones especificas de uso, redistribucion y obligaciones adicionales para uso comercial; conviene revisar el texto completo antes de desplegar en produccion.
- Reproducibilidad: el archivo no contiene estado de optimizador, scheduler ni RNG, por lo que no permite reanudar el entrenamiento original de forma exacta.
- Trazabilidad del autor: el repositorio procede de un usuario sin descargas ni likes registrados, y la model card mezcla identificadores internos de infraestructura; conviene verificar la procedencia antes de integrarlo en un sistema critico.
- Discrepancia menor entre el recuento de parametros de los safetensors (11.959.730.224) y el declarado en la model card (12.484.280.320), que no queda explicada en la informacion disponible.

## Enlaces

- Repositorio del modelo: https://huggingface.co/vosldtgbj/project-llm-rlvr-v1-step-100
- Checkpoint padre: https://huggingface.co/vosldtgbj/project-llm-rlvr-v1-step-75
- Checkpoint siguiente: https://huggingface.co/vosldtgbj/project-llm-rlvr-v1-step-125
- Modelo base referenciado: https://huggingface.co/google/gemma-4-12B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Dataset SFT v3: https://huggingface.co/datasets/vosldtgbj/project-llm-dataset-sft-citation-optimized-v3
- Dataset RLVR unificado v2: https://huggingface.co/datasets/vosldtgbj/project-llm-dataset-rlvr-unified-v2-37500
- Dataset RLVR de dominio v1: https://huggingface.co/datasets/vosldtgbj/project-llm-dataset-rlvr-domain-v1
