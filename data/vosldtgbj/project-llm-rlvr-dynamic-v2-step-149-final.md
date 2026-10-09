# vosldtgbj/project-llm-rlvr-dynamic-v2-step-149-final

## Resumen

project-llm-rlvr-dynamic-v2-step-149-final es un checkpoint de pesos completos en BF16 publicado por el usuario vosldtgbj dentro de una trayectoria de aprendizaje por refuerzo con recompensas verificables (RLVR). El modelo parte de google/gemma-4-12B-it y encadena tres etapas: continued pre-training (CPT), SFT v3 y dos rondas de RLVR. Este repositorio corresponde al step local 149 de la segunda ronda (step acumulado 274) y es el ultimo punto de guardado publico de la trayectoria.

La arquitectura es Gemma4UnifiedForConditionalGeneration (model_type gemma4_unified), un transformer con 48 capas de texto, hidden size 3.840 y vocabulario de 262.144 entradas. La model card declara 12.484.280.320 parametros, mientras que los safetensors del repositorio suman 11.959.730.224; la diferencia no se explica en la documentacion disponible. El entrenamiento se realizo solo sobre texto: las torres de vision y audio y las proyecciones multimodales quedaron congeladas.

Su relevancia actual es doble: por un lado, documenta con detalle un pipeline RLVR con GRPO sincrono, 16 rollouts por prompt y muestreo dinamico sobre un corpus japones de 104 libros blancos publicos; por otro, sirve como peso de inicializacion para nuevos ciclos de ajuste. No es un modelo listo para produccion sin evaluacion propia: no tiene ninguna puntuacion de validacion offline congelada asociada y acumula cero descargas y cero likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4UnifiedForConditionalGeneration (`model_type`: gemma4_unified); transformer decoder con torres de vision y audio congeladas |
| Parametros totales | 11.959.730.224 segun los safetensors del repositorio; 12.484.280.320 segun la model card del autor (discrepancia no aclarada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; la configuracion de entrenamiento RLVR limita la entrada a 8.192 tokens, la generacion a 2.048 y el total a 10.240 |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos BF16 sin cuantizar (sin GGUF, AWQ ni GPTQ) |
| Idiomas soportados | japones (ja) e ingles (en) |
| Licencia | Gemma (licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | safetensors en BF16, 5 fragmentos mas `model.safetensors.index.json` |
| Capas de texto | 48 |
| Hidden size de texto | 3.840 |
| Tamano de vocabulario | 262.144 |
| Tamano del repositorio | 24,0 GB (aproximadamente 23,92 GB decimales / 22,3 GiB de pesos) |
| Pipeline declarado | any-to-any |
| Modelo base directo | vosldtgbj/project-llm-rlvr-dynamic-v2-step-125 |
| Modelo original | google/gemma-4-12B-it |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de la familia Gemma 4 en su variante unificada, que agrupa en un unico grafo torres de texto, vision y audio mas proyecciones multimodales. El ajuste se aplico exclusivamente al modelo de lenguaje de texto: la model card indica que las torres de vision y audio permanecieron congeladas durante todo el proceso, por lo que cualquier capacidad multimodal declarada por el pipeline `any-to-any` no ha sido validada en esta trayectoria.

La genealogia completa parte de google/gemma-4-12B-it, continua con dos rondas de CPT (20 experimentos independientes de 0,5 epoch y 10 reentrenamientos de 1,0 epoch), sigue con SFT v3 sobre la vista congelada `official_90_10` (67.195 registros de entrenamiento, 4.083.167 tokens supervisados de asistente, empaquetados en 5.824 packs de longitud 8.192 con una eficiencia de packing de 0,9240) y termina en dos rondas RLVR. Esta segunda ronda hereda los parametros de RLVR v1 step 125, pero no su estado del optimizador: usa una tasa de aprendizaje menor (5e-7 frente a 1e-6), un warmup nuevo y una vista de datos residual.

El algoritmo de RL es GRPO sincrono con muestreo dinamico activado. Cada actualizacion consume 30 grupos de prompt validos y 480 rollouts (16 por prompt), con un maximo de 5 turnos de interaccion, temperatura 0,7 y top-p 1,0. El optimizador es Transformer Engine FusedAdam (betas 0,9/0,999, eps 1e-8, weight decay 0,1, max grad norm 1,0), con recorte de ratio PPO entre 0,2 y 0,28, ratio de importance sampling truncado de 2,0 y penalizacion KL contra la politica de referencia de 0. Los datos de RL provienen del conjunto unificado SF-RLVR-Unified-v2: 30.000 tareas de dominio japones y 7.500 tareas generales publicas, con 15 familias verificables. Parte de los contratos de recompensa usan un juez Nemotron 3 Ultra, mientras que las tareas numericas, de esquema, de cita, de rechazo y de codigo se validan con verificadores deterministas. El entrenamiento se ejecuto en 16 GPU H100 SXM y los rollouts se generaron con vLLM con tensor parallel de 2.

## Capacidades

- Generacion de texto y razonamiento en japones e ingles, con especial enfasis en tareas ancladas a documentos.
- Respuesta sobre documento unico y razonamiento multi-documento, incluyendo agregacion de evidencia de varias fuentes.
- Manejo de conflictos temporales y de version entre documentos, resueltos durante el entrenamiento con verificadores especificos.
- Comportamiento de abstencion y de aclaracion: el modelo fue entrenado para rechazar responder cuando la evidencia no esta en el contexto.
- Salida estructurada (JSON y esquemas definidos) validada por verificador determinista durante el RL.
- Tool calling y trazas de herramientas, incluida la recuperacion ante fallos de herramienta, con un maximo de 5 turnos de interaccion en el entrenamiento.
- Conciencia de limites de permisos e instrucciones: hay familias de tareas de prompt injection y de fronteras de autorizacion.
- Capacidades generales de instrucciones, codigo competitivo, matematicas abiertas, aritmetica y MCQA, aportadas por el 20% de tareas generales del conjunto de RL.
- Multimodalidad declarada a nivel de pipeline any-to-any, pero no afinada ni validada en esta trayectoria (torres de vision y audio congeladas).
- No dispone de modo de pensamiento explicito documentado ni de soporte de audio entrenado.

## Casos de uso

- Atencion al cliente en japones sobre documentacion oficial: el modelo fue ajustado con preguntas ancladas a 104 libros blancos publicos japoneses, por lo que responde citando pasajes concretos y se abstiene cuando la respuesta no aparece en el material aportado.
- Busqueda interna sobre normativa y procedimientos corporativos: la familia de razonamiento multi-documento permite combinar fragmentos de varios manuales y resolver contradicciones de version con una unica llamada.
- Agente con tool calling en back office: admite hasta 5 turnos de interaccion con herramientas y fue entrenado con trazas normales y con trazas de fallo, lo que reduce la rotura del bucle cuando una API devuelve error.
- Extraccion de datos estructurados para pipelines de ingestion: la familia de salida estructurada se verifico con validadores de esquema, de modo que la salida puede consumirse directamente por un proceso posterior sin post-procesado heuristico.
- Sistemas de cumplimiento con rechazo controlado: el entrenamiento incluye abstencion, aclaracion y deteccion de inyeccion de prompt, util para asistentes que no deben responder fuera de un dominio autorizado.
- Generacion y revision de codigo en entornos japoneses: el subconjunto de codigo competitivo y salidas estructuradas da cobertura para autocompletado y para transformaciones automatizadas en CI/CD.
- Punto de partida para nuevos ciclos de RLVR o SFT: el repositorio incluye config, generation config, tokenizer, processor y chat template, por lo que puede cargarse con transformers y reentrenarse sin reconstruir el pipeline.
- Evaluacion comparativa de dinamicas de RL: al existir 11 puntos de guardado en la misma trayectoria, permite estudiar deriva de politica entre checkpoints con un conjunto de evaluacion congelado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que los valores de recompensa de los registros de entrenamiento son senales online afectadas por la dificultad del problema, el muestreo dinamico y la propia politica, y que no constituyen una evaluacion offline congelada ni pueden usarse para clasificar checkpoints entre si. El autor recomienda evaluar los 11 puntos de guardado con el mismo conjunto congelado y los mismos parametros de inferencia, algo que no se ha hecho publico. Tampoco se han publicado datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 22,3 GiB, por lo que el presupuesto realista con cache KV y activaciones se situa en la franja de 30 a 48 GB segun la longitud de contexto y el tamano de lote.
- GPU recomendadas: H100 80 GB o A100 80 GB para una sola GPU con margen; A100 40 GB puede ser suficiente con contextos cortos y lote 1.
- Viabilidad en GPU de consumo: no en BF16. Una RTX 4090 o RTX 3090 de 24 GB no puede alojar los pesos (22,3 GiB) mas la cache KV. Seria necesario cuantizar, pero el repositorio no publica versiones GGUF, AWQ ni GPTQ, por lo que habria que generarlas.
- Configuracion multi-GPU: el propio entrenamiento uso vLLM con tensor parallel de 2, una topologia replicable en 2 x A100 80 GB o 2 x H100 80 GB. Dos RTX 4090 de 24 GB con tensor parallel tambien podrian alojar los pesos BF16, con contexto limitado.
- Entrenamiento o ajuste posterior: la referencia publicada es de 16 GPU H100 SXM para el RLVR completo; el SFT y el CPT requieren ordenes de magnitud similares o mayores.
- Opciones de despliegue: transformers (libreria declarada en el repositorio) y vLLM (backend usado para los rollouts). TGI, llama.cpp y Ollama no aparecen documentados para este checkpoint y en el caso de llama.cpp requeririan una conversion propia a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Etapa de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| project-llm-rlvr-dynamic-v2-step-149-final | 11,96 B (safetensors) / 12,48 B (card) | no disponible | RLVR v2, step local 149, acumulado 274; lr 5e-7; muestreo dinamico activo | Gemma | Publico en HuggingFace, 0 descargas |
| vosldtgbj/project-llm-rlvr-dynamic-v2-step-125 | igual | no disponible | RLVR v2, step local 125, acumulado 250; padre directo de este checkpoint | Gemma | Publico en HuggingFace |
| vosldtgbj/project-llm-rlvr-v1-step-125 | igual | no disponible | RLVR v1, step 125; lr 1e-6, sin muestreo dinamico, secuencia estatica de 3.750 prompts | Gemma | Publico en HuggingFace |
| google/gemma-4-12B-it | mismo modelo original | no disponible | Modelo instruct de partida, sin las etapas CPT/SFT/RLVR del proyecto | Gemma | Publico en HuggingFace |

No hay resultados de evaluacion publicados para ninguno de los checkpoints de la trayectoria, por lo que la comparativa se limita a parametros, contexto, etapa de entrenamiento, licencia y disponibilidad. No se dispone de alternativas externas comparables documentadas en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia de evaluacion offline: no existe una puntuacion de validacion congelada asociada a este checkpoint, y el autor advierte de que las recompensas de los registros de entrenamiento no sirven para clasificar checkpoints.
- Riesgo de alucinacion: aunque el modelo fue entrenado con familias de abstencion y de anclaje documental, sigue siendo un modelo generativo de 12 B de parametros y puede producir contenido no respaldado por el contexto.
- Sesgo de dominio e idioma: el 80% de las tareas de RL provienen de 104 libros blancos japoneses. El rendimiento fuera de ese dominio y en idiomas distintos del japones y el ingles no esta caracterizado.
- Multimodalidad no validada: el pipeline declarado es any-to-any, pero el afinado fue exclusivamente de texto con las torres de vision y audio congeladas.
- Sin estado de entrenamiento: el repositorio no incluye optimizador, scheduler, estado de RNG, cursor de dataloader ni shards FSDP/DTensor, por lo que no es posible reanudar el entrenamiento original de forma exacta; solo sirve para inferencia, evaluacion o inicializacion.
- Discrepancia de parametros entre la model card (12.484.280.320) y los safetensors (11.959.730.224), sin explicacion en la documentacion.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de Google para Gemma 4, que incluyen una politica de uso prohibido y obligaciones de atribucion. Conviene revisarlos antes de un despliegue en produccion.
- Adopcion nula: cero descargas y cero likes en el momento de redactar la ficha, sin validacion independiente por parte de la comunidad.
- Tope de interaccion: el RL se entreno con un maximo de 5 turnos y ventanas de 8.192 tokens de entrada, lo que acota el comportamiento fiable de los agentes en cadenas mas largas.
- Ambiguedad sobre el contexto nativo: la model card no declara la longitud de contexto del modelo base, solo los limites usados durante el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vosldtgbj/project-llm-rlvr-dynamic-v2-step-149-final
- Modelo base directo (v2 step 125): https://huggingface.co/vosldtgbj/project-llm-rlvr-dynamic-v2-step-125
- Checkpoint de la ronda v1: https://huggingface.co/vosldtgbj/project-llm-rlvr-v1-step-25
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Dataset de SFT v3 (SF-SFT-v3): https://huggingface.co/datasets/vosldtgbj/project-llm-dataset-sft-citation-optimized-v3
- Dataset unificado de RLVR v2 (SF-RLVR-Unified-v2): https://huggingface.co/datasets/vosldtgbj/project-llm-dataset-rlvr-unified-v2-37500
- Dataset de dominio para RLVR (SF-RLVR-Domain-v1): https://huggingface.co/datasets/vosldtgbj/project-llm-dataset-rlvr-domain-v1
- Documentacion de vLLM: https://docs.vllm.ai/en/latest/
- Sitio de vLLM: https://vllm.ai/
- Analisis de dinamicas de entrenamiento en RLVR (referencia externa): https://arxiv.org/html/2601.04537
