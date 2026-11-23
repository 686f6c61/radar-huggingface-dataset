# training-agents-course/qwen3.5-2b-distill-data-episodes-s43

## Resumen

qwen3.5-2b-distill-data-episodes-s43 es un modelo derivado de Qwen/Qwen3.5-2B, publicado por el usuario training-agents-course en el marco de un curso sobre entrenamiento de agentes. Se trata de un ajuste fino por destilación on-policy en el que el modelo base de 2B parámetros actúa como estudiante y Qwen/Qwen3.5-9B como profesor. El objetivo no es un modelo de propósito general, sino un agente especializado en tareas de análisis de datos: responde preguntas sobre ficheros de datos reales ejecutando código Python en una sesión en sandbox y entregando una respuesta final que el entorno evalúa automáticamente.

La arquitectura subyacente es la del modelo base Qwen3.5-2B, un transformer multimodal de tipo image-text-to-text con 2.213.241.664 parámetros totales y pesos en safetensors. El entrenamiento se realizó con el `DistillationTrainer` de TRL y su `environment_factory`, sobre el dataset FineEnvs/SmolDataEnvs (v1.1) servido por el entorno `data_analysis_env` de OpenEnv. La particularidad metodológica es que la destilación se aplica sobre episodios completos, no sobre el primer turno: el estudiante opera hasta 10 turnos de llamadas a herramienta Python y el profesor puntúa cada token generado por el estudiante en cada turno, enmascarando los resultados de las herramientas en la pérdida.

Su relevancia es doble. Por un lado, demuestra una receta reproducible de destilación on-policy multi-turno para agentes con uso de herramientas, un área donde la mayoría de los ajustes publicados se limitan a un único turno. Por otro, cuantifica la ganancia de esa receta: sobre el split `eval_verified` (61 tareas, 16 turnos) el modelo pasa de 0,189 a 0,344 de recompensa media, y sobre el split `test` (194 tareas, 10 turnos) de 0,143 a 0,273, frente al modelo base sin entrenar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (familia Qwen3.5); detalles internos de capas y atención no disponibles |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-2B |
| Modelo profesor | Qwen/Qwen3.5-9B |
| Dataset de entrenamiento | FineEnvs/SmolDataEnvs v1.1 |
| Framework de entrenamiento | TRL (`DistillationTrainer`, `environment_factory`) + OpenEnv `data_analysis_env` |
| Tamano del repositorio | 4,4 GB |
| Pipeline declarado | image-text-to-text |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-2B, un transformer multimodal capaz de procesar entradas de imagen y texto, según declara el pipeline `image-text-to-text` en Hugging Face. No se publican en la información disponible detalles sobre el número de capas, el mecanismo de atención, la ventana de contexto nativa ni la composición del corpus original de preentrenamiento del modelo base.

El ajuste consiste en una destilación on-policy sobre episodios completos. El estudiante recibe cada tarea del entorno `data_analysis_env` y la resuelve en su propia sesión, con hasta 10 turnos de llamadas a la herramienta Python y sus resultados. El profesor (Qwen3.5-9B) puntúa cada token escrito por el estudiante en todos los turnos, y los tokens correspondientes a los resultados de las herramientas se enmascaran en la pérdida para que no contribuyan al gradiente. La configuración reportada es de 28 pasos de 32 tareas (una pasada sobre el split de entrenamiento), learning rate 2e-6 y semilla 43. Los registros de entrenamiento se guardan en la carpeta `trackio/` del repositorio. Existe una variante entrenada solo sobre el primer turno, con la misma semilla y las mismas tareas, publicada como qwen3.5-2b-distill-data-firstturn-s43, lo que permite aislar el efecto de destilar episodios completos frente a un único turno.

## Capacidades

- Razonamiento agéntico multi-turno con uso de herramientas: el modelo está entrenado para encadenar hasta 10 turnos de llamadas a Python y sus resultados dentro de una sesión de entorno.
- Ejecución de código Python en sandbox para responder preguntas sobre ficheros de datos reales.
- Entrega de una respuesta final estructurada que el entorno puede evaluar automáticamente.
- Procesamiento de entradas de imagen y texto, heredado del pipeline image-text-to-text del modelo base.
- Generación de texto y razonamiento general, limitados por el tamaño de 2B parámetros del modelo base.
- Soporte de tool calling: implícito en el formato de episodio del entorno de entrenamiento (llamadas a herramienta Python y recepción de resultados).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Análisis exploratorio de datos automatizado: el modelo puede recibir un fichero de datos y una pregunta de negocio (por ejemplo, agregados por categoría o detección de valores atípicos) y resolverla ejecutando Python en un sandbox, encadenando varios turnos de inspección y cálculo antes de responder.
- Automatización de informes sobre datos tabulares: dado un CSV o un conjunto de ficheros, el agente itera con pandas y responde preguntas concretas de métricas, adecuado por su entrenamiento específico en tareas de análisis de datos con evaluación automática.
- Evaluación de pipelines de agentes: sirve como estudiante de referencia en experimentos de destilación on-policy, ya que su receta y sus resultados están documentados y son reproducibles con TRL y OpenEnv.
- Generación de trayectorias sintéticas para entrenamiento: sus episodios multi-turno con llamadas a Python pueden reutilizarse como datos de entrenamiento o de evaluación para otros agentes de análisis de datos.
- Asistente de análisis en entornos controlados: al ejecutar código en una sesión en sandbox, encaja en escenarios donde se requiere aislamiento de la ejecución y una respuesta final verificable.
- Docencia y experimentación en cursos de agentes: el modelo, junto con su variante de primer turno y las semillas 42, 43 y 44, permite comparar metodologías de destilación con un coste de cómputo bajo (2B parámetros, 28 pasos de entrenamiento).

## Benchmarks y rendimiento

Los resultados publicados miden la recompensa media (proporción de tareas respondidas correctamente) sobre 8 ejecuciones por tarea, evaluando el modelo base y los seis estudiantes de la comparación en el mismo trabajo.

| Modelo | `eval_verified` (61 tareas, 16 turnos) | `test` (194 tareas, 10 turnos) |
|---|---|---|
| Qwen3.5-2B sin entrenar | 0,189 | 0,143 |
| qwen3.5-2b-distill-data-episodes-s43 | 0,344 | 0,273 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia orientativa por tamaño, un modelo de 2,2B parámetros en FP16 requiere del orden de 4,4 GB solo para los pesos, a los que hay que sumar caché KV y overhead del runtime; en cuantización de 8 bits bajaría a unos 2,2 GB y en 4 bits a unos 1,1 GB, aunque no se han publicado ficheros GGUF ni cuantizaciones oficiales.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, el modelo es apto para GPU de consumo con suficiente VRAM; no se especifican modelos concretos.
- Cabe en GPU de consumo: previsiblemente sí por el tamaño del modelo, pero no se confirma en la documentación disponible.
- Opciones de despliegue: la librería declarada es transformers; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ni se publican pesos en formato GGUF.
- Latencia y throughput: no disponibles. El coste por consulta será mayor que el de una inferencia de un solo turno, ya que el modelo está diseñado para episodios de hasta 10 turnos con ejecución de código intermedia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Recompensa `eval_verified` | Recompensa `test` | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| qwen3.5-2b-distill-data-episodes-s43 | 2,21B | no disponible | 0,344 | 0,273 | Apache 2.0 | Hugging Face |
| qwen3.5-2b-distill-data-firstturn-s43 | 2,21B (base Qwen3.5-2B) | no disponible | no disponible en la información proporcionada | no disponible en la información proporcionada | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-2B (base) | 2,21B | no disponible | 0,189 | 0,143 | no disponible en la información proporcionada | Hugging Face |
| Qwen/Qwen3.5-9B (profesor) | 9B (aprox., por denominación) | no disponible | no disponible | no disponible | no disponible en la información proporcionada | Hugging Face |

## Limitaciones y advertencias

- Especialización estrecha: el ajuste se limita a tareas de análisis de datos del entorno `data_analysis_env` sobre SmolDataEnvs v1.1; el rendimiento fuera de ese dominio no está medido y puede degradarse respecto al modelo base.
- Entrenamiento muy corto: 28 pasos de 32 tareas, una sola pasada sobre el split de entrenamiento, con learning rate 2e-6; los resultados son sensibles a la semilla y no se reportan intervalos de confianza más allá de la media sobre 8 ejecuciones por tarea.
- Recompensa absoluta moderada: incluso tras el ajuste, la proporción de tareas correctas es de 0,344 en `eval_verified` y 0,273 en `test`, por lo que un tercio o menos de las tareas se resuelven correctamente; no es adecuado para producción sin verificación humana.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad factual ni de calibración; como todo modelo generativo de 2B parámetros, puede producir respuestas plausibles pero incorrectas, especialmente cuando el entorno no valida el resultado.
- Dependencia del entorno: el comportamiento entrenado asume el formato de episodio, las herramientas y la dinámica de recompensa de OpenEnv `data_analysis_env`; fuera de ese contrato el patrón de llamadas a herramienta puede romperse.
- Idiomas: no se especifican los idiomas soportados; no hay garantía de calidad fuera del idioma o idiomas presentes en los datos de entrenamiento.
- Licencia: Apache 2.0, permisiva para uso comercial, pero conviene verificar la licencia del modelo base Qwen/Qwen3.5-2B, que no se detalla en la información disponible.
- Sin cuantizaciones publicadas: no hay ficheros GGUF ni versiones cuantizadas oficiales, lo que limita el despliegue en entornos de bajos recursos sin trabajo adicional de conversión.
- Sesgos: no se documenta ninguna evaluación de sesgos; al heredar el preentrenamiento del modelo base, arrastra los sesgos de su corpus, que no se describe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/training-agents-course/qwen3.5-2b-distill-data-episodes-s43
- Variante entrenada solo en el primer turno: https://huggingface.co/training-agents-course/qwen3.5-2b-distill-data-firstturn-s43
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/FineEnvs/SmolDataEnvs
