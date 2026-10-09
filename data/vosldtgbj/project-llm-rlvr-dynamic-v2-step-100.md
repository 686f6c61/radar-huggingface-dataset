# vosldtgbj/project-llm-rlvr-dynamic-v2-step-100

## Resumen

`vosldtgbj/project-llm-rlvr-dynamic-v2-step-100` es un checkpoint intermedio de pesos completos en BF16 dentro de una trayectoria de aprendizaje por refuerzo con recompensas verificables (RLVR) sobre el modelo multimodal `google/gemma-4-12B-it`. Lo publica el usuario `vosldtgbj` como parte de un proyecto de investigación que encadena varias fases: continued pretraining (CPT) sobre corpus japones, SFT v3 y dos rondas de RLVR. Este repositorio concreto corresponde al step local 100 de la ronda "RLVR Dynamic v2", lo que equivale al step acumulado 225 de la trayectoria completa, ya que v2 arranca desde el step 125 de v1.

Técnicamente es un transformer denso de la familia Gemma 4 con la clase `Gemma4UnifiedForConditionalGeneration` (`model_type: gemma4_unified`): 48 capas de texto, hidden size 3.840 y vocabulario de 262.144 tokens. El repositorio declara 12.484.280.320 parámetros en la model card, mientras que los metadatos de safetensors del propio repo reportan 11.959.730.224, una diferencia coherente con que el entrenamiento solo haya tocado la torre de texto y el recuento de shards publicados no recoja todos los componentes multimodales. El pipeline declarado es `any-to-any` y el repo pesa 24,0 GB en cinco shards de safetensors.

Su relevancia es doble: por un lado, documenta de forma inusualmente detallada una receta completa de RLVR con GRPO síncrono, dynamic sampling, 16 rollouts por prompt y verificación determinista sobre 15 familias de tareas; por otro, es un eslabón de una serie de 11 checkpoints pensada para evaluación comparativa con un conjunto congelado, no una release lista para producción. Los idiomas declarados son japonés e inglés y la licencia es la Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Gemma4UnifiedForConditionalGeneration` (transformer, `model_type: gemma4_unified`), 48 capas de texto, hidden size 3.840 |
| Parametros totales | 11.959.730.224 según metadatos de safetensors del repo; 12.484.280.320 según la model card |
| Parametros activos | No aplica (no se documenta arquitectura MoE; el modelo es denso) |
| Longitud de contexto | No disponible como ventana nominal. Límites de entrenamiento RLVR: 8.192 tokens de entrada, 2.048 de generación, 10.240 totales por interacción |
| Tipos de cuantizacion | No disponible (solo se publican pesos BF16; no hay GGUF, AWQ ni GPTQ oficiales) |
| Idiomas soportados | Japonés (ja) e inglés (en) |
| Licencia | Gemma 4 (`license: gemma`), enlace: https://ai.google.dev/gemma/docs/gemma_4_license |
| Formato de pesos | Safetensors BF16, 5 shards + `model.safetensors.index.json` |
| Vocabulario | 262.144 tokens |
| Tamano del repo | 24,0 GB (≈23,92 GB decimales / ≈22,3 GiB de pesos) |
| Modelo base (padre directo) | `vosldtgbj/project-llm-rlvr-dynamic-v2-step-75` |
| Modelo raíz de la familia | `google/gemma-4-12B-it` |
| Pipeline declarado | `any-to-any` (con torres de visión y audio congeladas) |
| Librería | transformers |

## Arquitectura y entrenamiento

La base es un transformer multimodal unificado de Gemma 4 cuyo componente de texto concentra 48 capas con hidden size 3.840 y un vocabulario de 262.144 entradas. El entrenamiento de este proyecto toca exclusivamente tareas de texto: la torre de visión, la torre de audio y los proyectores multimodales permanecen congelados, de modo que la variación de parámetros respecto a la raíz se localiza en el modelo de lenguaje. Cada checkpoint se exporta en BF16 completo (no como adaptadores LoRA), incluyendo config, generation config, tokenizer, processor y chat template; los repos de experimentos con LoRA/RSLoRA también guardan las matrices ya fusionadas en el modelo base.

La receta de RLVR es GRPO síncrono con dynamic sampling, learning rate 5e-7 en esta fase, 30 grupos de prompts válidos por actualización de optimizador y 16 rollouts por prompt (480 rollouts por step), con un máximo de 5 turnos de interacción por episodio. El optimizador es Transformer Engine FusedAdam (betas 0,9/0,999, eps 1e-8, weight decay 0,1, max grad norm 1,0), con recorte de ratio PPO entre 0,2 y 0,28, ratio de importance sampling truncado de 2,0 y penalización KL contra la política de referencia de 0. El rollout se ejecuta con vLLM en tensor parallel size 2 sobre un clúster de 16 H100 SXM; los checkpoints se guardan cada 25 steps y la validación cada 50.

El entrenamiento previo (SFT v3) usó una vista congelada `official_90_10`: 67.195 registros y 4.083.167 tokens supervisados de entrenamiento (64.263 registros de dominio + 2.932 generales), empaquetados en 5.824 packs de longitud 8.192 con una eficiencia de packing de 0,9240 y 44.084.610 tokens de entrada totales. El corpus de RLVR es `SF-RLVR-Unified-v2` con 37.500 tareas (30.000 de dominio y 7.500 generales) repartidas en 15 familias verificables. Parte de las recompensas las emite un juez Nemotron 3 Ultra, mientras que tareas numéricas, de esquema, de cita, de abstención y de código se validan con verificadores deterministas o con el resultado de ejecución del entorno. El conjunto congelado de evaluación tiene 4.700 tareas, con un núcleo de validación de 470.

## Capacidades

- Generación de texto y razonamiento en japonés e inglés, con foco declarado en tareas de dominio verifiable.
- Preguntas y respuestas sobre documentos: familias de "single-document grounded" y "multi-document reasoning" sobre 104 libros blancos públicos japoneses.
- Resolución de conflictos entre fuentes y de versiones temporales de un mismo documento.
- Salidas estructuradas: tareas de structured output con validación de esquema.
- Uso de herramientas: trayectorias normales de tool calling y familia específica de recuperación ante fallos de herramienta.
- Comportamiento de abstención y clarificación: familias de abstention y QA abstention, más clarificación e imposibilidad de respuesta.
- Robustez frente a inyección de prompts y respeto de límites de permisos (familia de prompt injection y permission boundary).
- Razonamiento multi-turno: hasta 5 turnos de interacción por episodio durante el entrenamiento RLVR.
- Capacidades generales de refuerzo: instruction following, ReasoningGym, programación competitiva, matemáticas abiertas, aritmética y MCQA.
- Arquitectura multimodal heredada (visión y audio), pero sin entrenamiento específico en este proyecto: no deben asumirse capacidades de visión o audio fiables.

## Casos de uso

- Atención al cliente en japonés con base documental: el modelo puede responder consultas ancladas a documentación corporativa y abstenerse cuando la respuesta no está en el contexto, gracias a las familias de grounded QA y abstention entrenadas de forma explícita.
- Asistente agéntico con tool calling: sirve como núcleo de agentes que encadenan hasta 5 turnos de herramientas, con la ventaja de haber sido entrenado en recuperación tras fallos de herramienta (respuestas de error, timeouts o esquemas inválidos).
- Extracción de datos estructurados: convertir normativa o informes japoneses en JSON validado contra esquema, usando la familia de structured output y verificadores deterministas como referencia de calidad.
- Gestión de documentación versionada: detectar contradicciones entre versiones de un mismo documento o entre fuentes distintas, un escenario frecuente en cumplimiento normativo y auditoría interna.
- Pipelines RAG con control de inyección: desplegar el modelo detrás de un recuperador y usar su entrenamiento en límites de permisos para reducir el impacto de instrucciones maliciosas embebidas en documentos recuperados.
- Automatización de soporte interno de bajo riesgo: triaje de tickets que requieren aclaración del usuario antes de responder, apoyándose en las familias de clarificación y de "no respondible".
- Evaluación y research en RLVR: como checkpoint intermedio reproducible para estudiar dinámicas de GRPO con dynamic sampling, siempre que se compare con el mismo conjunto congelado y los mismos parámetros de inferencia.
- Generación de código auxiliar y resolución de problemas cuantitativos: soportado por las familias de programación competitiva, matemáticas y aritmética, aunque con verificación externa recomendada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que este checkpoint no tiene una puntuación de validación independiente asignada y que las recompensas de rollout no son una evaluación offline congelada ni sirven para ordenar checkpoints entre sí. El proyecto dispone de un conjunto de evaluación bloqueado de 4.700 tareas y un núcleo de validación de 470, pero no se publican cifras asociadas a este step.

| Benchmark | Resultado | Notas |
|---|---|---|
| MMLU, HumanEval, GSM8K y similares | No disponible | No se reportan cifras en la informacion proporcionada |
| Eval interno bloqueado (4.700 tareas) | No disponible | Existe el conjunto, no la puntuación de este checkpoint |
| Validation core (470 tareas) | No disponible | Reservado para comparación entre los 11 checkpoints de la serie |

## Requisitos de hardware

- Pesos en BF16: aproximadamente 22,3 GiB (23,92 GB decimales) solo para parámetros. Con caché KV y overhead de runtime, el mínimo realista se sitúa en torno a 32-40 GB de VRAM.
- GPUs de datacenter recomendadas: A100 80 GB, H100 80 GB, H200. El propio proyecto entrenó y ejecutó rollouts con 16 H100 SXM.
- GPUs de 48 GB: L40S, RTX 6000 Ada o A6000 permiten inferencia BF16 con margen para caché KV si se limita la longitud de contexto.
- Consumer GPU: no cabe en BF16 en una GPU de 24 GB. En 2x RTX 4090 24 GB es viable con tensor parallel o sharding. Con FP8 (≈12-13 GB, estimado a partir del recuento de parámetros) cabría en una RTX 4090 24 GB; con INT4 (≈6-7 GB) cabría en tarjetas de 8-12 GB. Estas cuantizaciones no se publican en el repositorio y habría que generarlas.
- Opciones de despliegue: transformers (librería declarada), vLLM (usado para rollout con tensor parallel size 2), TGI y SGLang. llama.cpp u Ollama requerirían convertir los pesos a GGUF, tarea no cubierta por el autor.
- Latencia y throughput: no disponible. No se publican medidas de tokens por segundo ni de tiempo hasta el primer token.
- Memoria de entrenamiento: no disponible; el proyecto usó 16 H100 SXM con FusedAdam y micro batch size 1, sin detallar el consumo por GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `google/gemma-4-12B-it` | No disponible en la informacion | No disponible | Gemma 4 | Hugging Face (referenciado, no re-subido por el proyecto) | Modelo raíz multimodal; el proyecto lo usa como control de evaluación |
| `vosldtgbj/project-llm-rlvr-dynamic-v2-step-75` | Mismo orden (BF16, 5 shards) | No disponible | Gemma 4 | Hugging Face | Padre directo de parámetros; 25 updates de optimizador por detrás |
| `vosldtgbj/project-llm-rlvr-dynamic-v2-step-100` | 11.959.730.224 (safetensors) | No disponible | Gemma 4 | Hugging Face | Este checkpoint; step acumulado 225 |
| Alternativas de terceros del mismo tamaño | No disponible | No disponible | No disponible | No disponible | No hay datos comparables en la informacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos competidores en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento con alternativas externas. La comparación significativa que documenta el propio autor es interna: los 11 checkpoints de la serie evaluados con el mismo conjunto congelado y los mismos parámetros de inferencia.

## Limitaciones y advertencias

- Es un checkpoint intermedio de una trayectoria de RLVR, no una versión final ni una release validada para producción.
- La model card advierte de que no tiene puntuación de validación propia y que las recompensas de rollout no permiten ordenar checkpoints entre sí; cualquier comparación exige el mismo eval congelado e idénticos parámetros de inferencia.
- No se publican resultados de benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que el rendimiento real es desconocido y no verificable de forma externa.
- Idiomas soportados declarados: japonés e inglés. El comportamiento en otras lenguas, incluido el castellano, no está garantizado.
- Riesgo de alucinación inherente a tareas de QA sobre documentos; el modelo incorpora familias de abstención, pero su fiabilidad en producción no está cuantificada.
- Sesgo de dominio: el corpus de proyecto proviene de 104 libros blancos públicos japoneses, lo que orienta el comportamiento hacia registro administrativo y terminología japonesa.
- Parte del sistema de recompensas usa un juez modelo (Nemotron 3 Ultra) en lugar de un verificador determinista, lo que introduce riesgo de reward hacking y de sobreajuste al estilo del juez.
- Las torres de visión y audio están congeladas y no se han entrenado en este proyecto: no deben esperarse capacidades multimodales fiables pese al pipeline `any-to-any` y a la etiqueta `image-text-to-text`.
- La política de citas de SFT v3 elimina rutas internas, hashes y referencias por número de línea; el modelo solo conserva numeración corta dentro de la petición o referencias en lenguaje natural.
- El repositorio no contiene estado de optimizador, scheduler, estado RNG, cursor de dataloader ni shards FSDP/DTensor: no permite reanudar el entrenamiento original de forma exacta, solo inferencia, evaluación o inicialización de nuevos entrenamientos.
- Licencia Gemma 4: el uso comercial está sujeto a los términos de dicha licencia, no a una licencia permisiva tipo Apache 2.0; hay que revisar las cláusulas de uso aceptable antes de desplegar.
- El modelo se entrenó asumiendo ausencia de búsqueda en internet; no hay evidencia de capacidades de búsqueda web entrenadas pese a la etiqueta `searchforge`.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación independiente por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vosldtgbj/project-llm-rlvr-dynamic-v2-step-100
- Modelo padre (v2 step-75): https://huggingface.co/vosldtgbj/project-llm-rlvr-dynamic-v2-step-75
- Checkpoint siguiente (v2 step-125): https://huggingface.co/vosldtgbj/project-llm-rlvr-dynamic-v2-step-125
- Serie v1 (step-75): https://huggingface.co/vosldtgbj/project-llm-rlvr-v1-step-75
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Dataset SFT v3: https://huggingface.co/datasets/vosldtgbj/project-llm-dataset-sft-citation-optimized-v3
- Dataset RLVR Unified v2 (37.500 tareas): https://huggingface.co/datasets/vosldtgbj/project-llm-dataset-rlvr-unified-v2-37500
- Dataset RLVR Domain v1: https://huggingface.co/datasets/vosldtgbj/project-llm-dataset-rlvr-domain-v1
- Explicación técnica de RLVR: https://www.emergentmind.com/topics/llm-rlvr
- Notas sobre RLVR en el stack de alineamiento: https://s-samarth.github.io/DataSciencePreparation/LLM/alignment/rlvr/
