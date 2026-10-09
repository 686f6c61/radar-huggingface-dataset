# vosldtgbj/project-llm-rlvr-v1-step-125

## Resumen

`vosldtgbj/project-llm-rlvr-v1-step-125` es un checkpoint de pesos completos en BF16 publicado por el usuario vosldtgbj, correspondiente al paso 125 de un ciclo de aprendizaje por refuerzo con recompensas verificables (RLVR) sobre el modelo `google/gemma-4-12B-it`. No es un modelo nuevo desde cero ni un ajuste supervisado aislado: es un punto intermedio de una trayectoria de parametros continua que arranca en el SFT v3 `L2 h2p0` y avanza con GRPO sincrono a un ritmo de un guardado cada 25 actualizaciones del optimizador. Su interes practico es doble: por un lado documenta de forma inusualmente detallada la receta de entrenamiento (datos, verificadores, hiperparametros, hardware); por otro, sirve como inicializacion para la siguiente fase de la familia (RLVR dynamic v2, que parte precisamente de este checkpoint).

Arquitectonicamente es un transformer multimodal de tipo `gemma4_unified` (`Gemma4UnifiedForConditionalGeneration`) con 48 capas de texto, hidden size 3.840 y vocabulario de 262.144 entradas. El repositorio declara 12.484.280.320 parametros totales, mientras que los ficheros safetensors suman 11.959.730.224, una discrepancia que conviene tener presente al planificar memoria. El entrenamiento RLVR solo toca el modelo de lenguaje de texto: la torre de vision, la torre de audio y las proyecciones multimodales permanecen congeladas.

El foco declarado del proyecto son tareas de documentacion en japones (104 libros blancos publicos japoneses) con verificacion determinista o con jueces restringidos, mas un 20% de tareas generales (codigo, matematicas, instrucciones, MCQA, inyeccion de prompt, abstención). Los idiomas soportados declarados son japones e ingles. La licencia es la Gemma 4, con las restricciones de uso que ello implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `Gemma4UnifiedForConditionalGeneration` (`model_type: gemma4_unified`), 48 capas de texto, hidden size 3.840, vocab 262.144 |
| Parametros totales | 12.484.280.320 segun model card; 11.959.730.224 segun safetensors |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible como dato de modelo; la receta RLVR fija limites de 8.192 tokens de entrada, 2.048 de generacion y 10.240 totales |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos completos en BF16 |
| Idiomas soportados | japones (ja) e ingles (en) |
| Licencia | Gemma 4 (`license: gemma`), enlace: https://ai.google.dev/gemma/docs/gemma_4_license |
| Formato de pesos | Safetensors BF16 en 5 fragmentos + `model.safetensors.index.json` (~23,92 GB decimales, ~22,3 GiB) |
| Pipeline declarado | any-to-any |
| Modelo base directo | vosldtgbj/project-llm-rlvr-v1-step-100 |
| Modelo original | google/gemma-4-12B-it |
| Paso RLVR | 125 acumulado en la fase v1 |
| Fecha de publicacion | 2026-10-09 |

## Arquitectura y entrenamiento

La arquitectura base es `google/gemma-4-12B-it`, un transformer multimodal unificado que en este checkpoint se emplea exclusivamente para tareas de texto. El entrenamiento RLVR no modifica la torre de vision, la torre de audio ni las proyecciones multimodales: los cambios de parametros se concentran en el modelo de lenguaje. Los experimentos con LoRA/RSLoRA de la familia se publican con los pesos ya fusionados en la base, de modo que este repositorio se carga directamente sin necesidad de localizar un adaptador ni ejecutar un merge.

La receta de RLVR v1 usa GRPO sincrono con 30 grupos de prompts validos por actualizacion y 16 rollouts por prompt, es decir 480 rollouts por paso de optimizador. El limite de interaccion es de 5 turnos, con topes de 8.192 tokens de entrada, 2.048 de generacion y 10.240 totales. El muestreo emplea temperatura 0,7 y top-p 1,0. El optimizador es Transformer Engine FusedAdam con betas 0,9/0,999, eps 1e-8, weight decay 0,1 y max grad norm 1,0. El recorte del ratio PPO se sitúa entre 0,2 y 0,28, con truncated importance-sampling ratio de 2,0 y penalizacion KL contra la politica de referencia de 0. La tasa de aprendizaje de la fase v1 es 1e-6 y el muestreo dinamico esta desactivado. El entrenamiento se ejecuto sobre 16 GPU H100 SXM, con backend de rollout vLLM y tensor parallel size 2, y guardado/validacion cada 25/50 pasos.

Los datos de RLVR provienen del conjunto congelado SF-RLVR-Unified-v2: 30.000 tareas de dominio de proyecto y 7.500 tareas generales publicas, repartidas en 15 familias verificables. Cada tarea almacena prompt visible, referencia estructurada oculta, `verifier_id` y `reward_contract_id`. Las respuestas se generan en linea con la politica actual y se puntuan con verificadores deterministas o con un juez restringido (Nemotron 3 Ultra, para algunos contratos de recompensa). La evaluacion bloqueada consta de 4.700 elementos, de los que 470 forman el nucleo de validacion congelado. El SFT previo (v3, vista `official_90_10`) uso 67.195 registros de entrenamiento con 4.083.167 tokens supervisados, empaquetados en 5.824 packs de longitud 8.192 y 44.084.610 tokens de entrada totales.

## Capacidades

- Generacion de texto y razonamiento sobre documentacion en japones e ingles, con enfasis en respuestas ancladas a fuentes concretas.
- Preguntas y respuestas sobre documento unico y razonamiento multi-documento, incluida la deteccion de conflictos entre fuentes y de discrepancias temporales o de version.
- Comportamiento de abstención y de "no respondible": el modelo fue entrenado con familias especificas de rechazo controlado y peticiones de aclaracion.
- Salidas estructuradas con esquemas verificables (JSON y formatos equivalentes), supervisadas de forma explicita durante SFT y RLVR.
- Uso de herramientas en trayectorias multi-turno: la receta contempla hasta 5 turnos de interaccion y familias especificas de trayectoria normal de herramienta y de recuperacion ante fallo de herramienta.
- Robustez ante inyeccion de prompt y delimitacion de permisos, con familias de entrenamiento dedicadas.
- Razonamiento matematico y aritmetico, resolucion de problemas tipo ReasoningGym y programacion competitiva dentro del bloque de datos generales.
- Capacidades multimodales heredadas del base Gemma 4 (vision y audio): las torres y proyecciones permanecen congeladas y no fueron ajustadas en este ciclo, por lo que su calidad no esta garantizada por esta ficha.
- Multilingue limitado a japones e ingles segun la metadata del repositorio.

## Casos de uso

- Atencion al cliente o soporte interno sobre normativa japonesa: el modelo puede responder preguntas ancladas a libros blancos y documentacion corporativa, y su entrenamiento en abstención permite que rechace responder cuando la evidencia no esta en el contexto, en lugar de alucinar una cifra.
- Recuperacion aumentada con agentes: encaja como modelo de razonamiento dentro de un bucle de tool calling de hasta 5 turnos, con capacidad entrenada para recuperarse de fallos de herramienta, lo que reduce los bucles rotos en pipelines de agentes.
- Auditoria documental y control de versiones: las familias de conflicto entre fuentes y de version temporal permiten usarlo para detectar cuando dos documentos oficiales se contradicen o cuando una cifra ha quedado obsoleta respecto a una revision posterior.
- Generacion de salidas estructuradas para integracion en sistemas: su entrenamiento explicito en schema y formato lo hace adecuado para producir JSON validable que alimente ETLs, formularios o APIs internas sin post-procesado fragil.
- Cumplimiento y filtrado de seguridad: la familia de inyeccion de prompt y limites de permisos lo hace utilizable como primera linea de defensa en asistentes que leen documentos no confiables.
- Asistente tecnico bilingue ja-en para equipos distribuidos: permite consultar la misma base documental en japones y responder en ingles, o al reves, sin cambiar de modelo.
- Evaluacion y anotacion asistida: util como generador de candidatos en pipelines de RLVR propios, ya que su formato de pesos completos permite continuar el entrenamiento desde este punto.
- Base para fine-tuning posterior: al estar publicado en BF16 con pesos completos y sin estado de optimizador, es un punto de partida limpio para SFT o RL adicional en dominio japones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card advierte de que las recompensas de rollout que aparecen en los registros de entrenamiento son una senal en linea dependiente de la dificultad de las tareas, del muestreo y de la politica, y que no constituyen una evaluacion offline congelada ni pueden usarse para ordenar checkpoints entre si. El autor indica que la comparacion correcta exige ejecutar una misma evaluacion congelada sobre los 11 puntos de guardado con parametros de inferencia identicos. La busqueda web realizada no devolvio resultados de benchmarks asociados a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 24 GB solo para pesos (11,96 x 10^9 parametros a 2 bytes), mas cache KV y activaciones; en la practica se recomienda reservar 28-32 GB.
- VRAM estimada en cuantizacion de 8 bits (no publicada oficialmente): en torno a 12-13 GB de pesos, mas overhead.
- VRAM estimada en cuantizacion de 4 bits (no publicada oficialmente): en torno a 6,5-7,5 GB de pesos, mas overhead.
- GPU recomendadas en BF16: una A100 40 GB o H100 80 GB por si sola; en configuraciones de 24 GB (RTX 4090, RTX 3090) seria necesario tensor parallel sobre dos tarjetas o cuantizacion.
- Consumer GPU: no cabe en una unica GPU de 24 GB en BF16; si cabria en RTX 4090, RTX 3090 o RTX 4080 con cuantizacion de 8 o 4 bits, o en dos RTX 4090 con reparto de pesos.
- Opciones de despliegue: vLLM (es el backend utilizado en el propio entrenamiento para los rollouts, con tensor parallel size 2), y carga directa con Transformers dado que el repositorio incluye config, generation config, tokenizer, processor y chat template.
- llama.cpp, Ollama y TGI: no se documenta soporte oficial ni se publican pesos GGUF en el repositorio; su uso requeriria conversion propia.
- Latencia y throughput: no disponibles. El unico dato de contexto es que el entrenamiento corrio sobre 16 H100 SXM con vLLM en tensor parallel 2, sin cifras publicadas de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| vosldtgbj/project-llm-rlvr-v1-step-125 | 11,96 B (safetensors) | no disponible (limites RLVR: 8.192/2.048/10.240) | ja, en | Gemma 4 | Checkpoint RLVR intermedio de la familia |
| vosldtgbj/project-llm-rlvr-v1-step-100 | no disponible | no disponible | ja, en | Gemma 4 | Padre directo; 25 actualizaciones anterior |
| vosldtgbj/project-llm-rlvr-dynamic-v2-step-25 | no disponible | no disponible | ja, en | Gemma 4 | Inicializado desde este checkpoint, con muestreo dinamico |
| google/gemma-4-12B-it | no disponible | no disponible | no disponible | Gemma 4 | Modelo base original; aqui no se publican sus pesos |

No se dispone de datos verificados de contexto, rendimiento ni evaluaciones de estos modelos en la informacion proporcionada, por lo que la comparacion se limita a la relacion de linaje entre checkpoints. La busqueda web no devolvio alternativas de la misma categoria con datos comparables.

## Limitaciones y advertencias

- No es un modelo final: es un punto intermedio de una trayectoria de RL y su comportamiento optimo no esta validado con una evaluacion congelada publica.
- Las cifras de recompensa del entrenamiento no sirven para comparar checkpoints; el propio autor lo advierte de forma explicita.
- Los pesos multimodales (vision, audio y proyecciones) estan congelados y no fueron entrenados en este ciclo, por lo que las capacidades any-to-any heredadas no estan garantizadas.
- Soporte idiomatico declarado limitado a japones e ingles; no hay evidencia de calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion en tareas de documentacion, mitigado parcialmente por el entrenamiento en abstención, pero no eliminado.
- La licencia Gemma 4 impone condiciones especificas de uso comercial y de redistribucion; es obligatorio revisar el texto completo antes de cualquier despliegue en produccion.
- El repositorio no incluye estado de optimizador, scheduler, semilla ni cursores de dataloader: no permite reanudar el entrenamiento original de forma bit a bit, solo usarse como inicializacion.
- No se publican cuantizaciones oficiales ni pesos GGUF, lo que complica el despliegue en hardware de consumo.
- El entrenamiento se realizo sin busqueda en internet, de modo que las respuestas dependen del contexto proporcionado y no de conocimiento actualizado en linea.
- Ha recibido 0 descargas y 0 valoraciones en HuggingFace, por lo que no existe validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vosldtgbj/project-llm-rlvr-v1-step-125
- Modelo base directo (paso 100): https://huggingface.co/vosldtgbj/project-llm-rlvr-v1-step-100
- Checkpoint siguiente de la familia: https://huggingface.co/vosldtgbj/project-llm-rlvr-dynamic-v2-step-25
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Dataset SFT v3: https://huggingface.co/datasets/vosldtgbj/project-llm-dataset-sft-citation-optimized-v3
- Dataset RLVR unificado v2: https://huggingface.co/datasets/vosldtgbj/project-llm-dataset-rlvr-unified-v2-37500
- Dataset RLVR de dominio v1: https://huggingface.co/datasets/vosldtgbj/project-llm-dataset-rlvr-domain-v1
- Referencia general sobre RLVR: https://s-samarth.github.io/DataSciencePreparation/LLM/alignment/rlvr/
