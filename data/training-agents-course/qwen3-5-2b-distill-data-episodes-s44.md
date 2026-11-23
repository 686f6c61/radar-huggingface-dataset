# training-agents-course/qwen3.5-2b-distill-data-episodes-s44

## Resumen

qwen3.5-2b-distill-data-episodes-s44 es un modelo derivado de Qwen/Qwen3.5-2B, publicado por el usuario training-agents-course en el contexto de un curso sobre agentes de entrenamiento. Consiste en un ajuste fino del modelo base mediante destilación on-policy (on-policy distillation) llevada a cabo con el `DistillationTrainer` de la librería TRL, usando como profesor el modelo Qwen/Qwen3.5-9B. El objetivo es transferir al estudiante de 2.213 millones de parámetros la capacidad de resolver tareas de análisis de datos ejecutando código Python en un entorno sandbox.

El entrenamiento se realizó sobre episodios completos del entorno `data_analysis_env` de OpenEnv, alimentado con el dataset SmolDataEnvs (v1.1). A diferencia de variantes que solo aprenden del primer turno, este modelo se destila sobre la totalidad de la sesión: hasta 10 turnos de llamadas a herramienta Python y sus resultados, con el profesor puntuando cada token generado por el estudiante y enmascarando los resultados de las herramientas en la pérdida. El resultado es un modelo multimodal (pipeline image-text-to-text) orientado a razonamiento agéntico con uso de herramientas.

La relevancia de esta ficha es doble: por un lado, ilustra una técnica de destilación aplicada a agentes multi-turno con ejecución de código; por otro, demuestra una mejora medible sobre el modelo base en tareas de análisis de datos (de 0,189 a 0,350 en el conjunto `eval_verified` y de 0,143 a 0,282 en `test`). El modelo se distribuye con licencia Apache 2.0 y pesos en safetensors, con un tamaño de repositorio de 4,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-2B); pipeline image-text-to-text |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer multimodal de 2.213 millones de parámetros, y se ajusta mediante destilación on-policy con el `DistillationTrainer` de TRL y su `environment_factory`. El profesor es Qwen/Qwen3.5-9B. La innovación principal es el esquema de destilación sobre episodios completos: el estudiante trabaja cada tarea en su propia sesión del entorno `data_analysis_env` de OpenEnv, con hasta 10 turnos de llamadas a herramienta Python y sus resultados. El profesor puntúa cada token que el estudiante escribe en cada turno, y los resultados de las herramientas se enmascaran fuera de la pérdida, de modo que el aprendizaje se concentra en las decisiones del agente y no en las salidas del entorno.

Los datos de entrenamiento provienen del dataset FineEnvs/SmolDataEnvs (v1.1), orientado a tareas de análisis de datos sobre ficheros reales. El entrenamiento consistió en 28 pasos de 32 tareas (una pasada sobre el split de entrenamiento), con tasa de aprendizaje 2e-6 y semilla 44. No se especifica el número total de tokens de entrenamiento ni la composición detallada del dataset. Los registros del entrenamiento se encuentran en la carpeta `trackio/` del repositorio. No se menciona el uso de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multimodal (pipeline image-text-to-text).
- Análisis de datos: responde preguntas sobre ficheros de datos reales ejecutando código Python en una sesión sandbox.
- Uso de herramientas (tool calling): llamadas a un intérprete Python dentro del entorno, con hasta 10 turnos por episodio.
- Razonamiento agéntico multi-paso: planificación y ejecución iterativa de código hasta emitir una respuesta final que el entorno evalúa.
- Envío de respuesta final evaluable por el entorno (`submit`), lo que permite integrarlo en pipelines con verificación automática.
- Capacidades multilingües: no disponible (no se documentan idiomas soportados).

## Casos de uso

- Análisis exploratorio de datos automatizado: el modelo puede recibir un fichero de datos y responder preguntas descriptivas (recuentos, medias, distribuciones) escribiendo y ejecutando código Python en un sandbox, lo que resulta adecuado por su entrenamiento específico en el entorno `data_analysis_env`.
- Agente de informes sobre datos tabulares: integrado en un pipeline, puede generar respuestas verificables sobre conjuntos de datos reales, con la ventaja de que el entorno califica automáticamente la respuesta y permite filtrar salidas incorrectas.
- Automatización de tareas de limpieza y transformación de datos: el modelo puede encadenar varias llamadas a Python (hasta 10 turnos) para inspeccionar, transformar y validar datos antes de responder.
- Evaluación de pipelines agénticos: al estar entrenado sobre episodios completos con recompensa del entorno, sirve como estudiante de referencia en experimentos de destilación y comparación de esquemas de entrenamiento (primer turno frente a episodios completos).
- Asistente de análisis en notebooks y entornos de ciencia de datos: puede integrarse en herramientas que expongan un intérprete Python como herramienta, aprovechando su capacidad de razonamiento multi-paso.
- Prototipado de bajo coste en investigación: con 2.213 millones de parámetros y licencia Apache 2.0, es viable para experimentos académicos que requieran un agente de análisis de datos sin depender de modelos de mayor tamaño.
- Docencia y formación en agentes: el modelo y su contraparte de primer turno permiten ilustrar el efecto de la destilación sobre episodios completos en cursos técnicos.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a la recompensa media (proporción de tareas respondidas correctamente) sobre 8 ejecuciones por tarea, evaluando el modelo base y los seis estudiantes de la comparación en el mismo job:

| Modelo | `eval_verified` (61 tareas, 16 turnos) | `test` (194 tareas, 10 turnos) |
|---|---|---|
| Qwen3.5-2B sin entrenamiento | 0,189 | 0,143 |
| Este modelo | 0,350 | 0,282 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 2.213 millones de parámetros, en fp16 se requieren aproximadamente 4,4 GB solo para los pesos, a los que hay que sumar la caché KV y el overhead del runtime; en cuantizaciones de 8 bits o 4 bits el requisito baja considerablemente, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: no disponible. Por tamaño, el modelo es apto para GPUs de consumo con suficiente VRAM (por ejemplo, RTX 4090 o RTX 3090 en fp16), aunque el autor no publica recomendaciones.
- Cabe en GPU de consumo: previsiblemente sí en fp16 en GPUs con 8 GB o más de VRAM, y con mayor holgura en cuantización; no confirmado por el autor.
- Opciones de despliegue: transformers (librería indicada en la model card). No se documenta soporte explícito para vLLM, llama.cpp, Ollama o TGI, ni se publican pesos GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (`eval_verified` / `test`) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (episodes-s44) | 2.213 M | no disponible | 0,350 / 0,282 | Apache 2.0 | Hugging Face |
| qwen3.5-2b-distill-data-firstturn-s44 | 2.213 M (base) | no disponible | no disponible en la información | Apache 2.0 | Hugging Face |
| Qwen3.5-2B (base, sin entrenamiento) | 2.213 M | no disponible | 0,189 / 0,143 | Apache 2.0 | Hugging Face |
| Qwen3.5-9B (profesor) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparación directa con el modelo base y con la variante de primer turno es la más informativa: el ajuste por episodios completos casi duplica la recompensa del modelo base en ambos conjuntos de evaluación. No se dispone de datos de benchmarks estándar para comparar con otros modelos de la misma categoría.

## Limitaciones y advertencias

- El modelo está especializado en tareas de análisis de datos dentro del entorno `data_analysis_env`; su rendimiento fuera de ese dominio no está documentado y puede degradarse respecto al modelo base.
- Riesgo de alucinación: aunque el entrenamiento con recompensa del entorno mitiga respuestas incorrectas, el modelo puede emitir respuestas plausibles pero erróneas cuando el código no se ejecuta o el entorno no valida la salida.
- Sesgos conocidos: no se documentan análisis de sesgo; al derivar de Qwen3.5-2B, hereda los sesgos del modelo base y de los datos de destilación.
- Limitaciones de idioma: no se especifican los idiomas soportados; la model card está en inglés y el dataset de entrenamiento no documenta composición lingüística.
- Longitud de contexto: no disponible, lo que impide garantizar el manejo de conversaciones o ficheros de datos de gran tamaño.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-2B y del dataset SmolDataEnvs.
- Entrenamiento muy corto (28 pasos, una pasada sobre el split) y con una única semilla publicada (44); la variabilidad entre semillas no se documenta en esta ficha, aunque el autor evalúa varias semillas en la comparación global.
- No se publican cuantizaciones oficiales ni pesos GGUF, lo que limita el despliegue en entornos de bajos recursos sin conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/training-agents-course/qwen3.5-2b-distill-data-episodes-s44
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante de primer turno: https://huggingface.co/training-agents-course/qwen3.5-2b-distill-data-firstturn-s44
- Dataset: https://huggingface.co/datasets/FineEnvs/SmolDataEnvs
- Librería TRL: no disponible enlace directo en la información proporcionada
- OpenEnv: no disponible enlace directo en la información proporcionada
