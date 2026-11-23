# training-agents-course/qwen3.5-2b-distill-data-episodes-s42

## Resumen

qwen3.5-2b-distill-data-episodes-s42 es un ajuste fino del modelo Qwen/Qwen3.5-2B desarrollado por el usuario training-agents-course en el contexto de un curso de entrenamiento de agentes. Se trata de un modelo multimodal (pipeline image-text-to-text) de 2.213.241.664 parámetros, destilado mediante on-policy distillation con el `DistillationTrainer` de TRL y su `environment_factory`, tomando como profesor a Qwen/Qwen3.5-9B. El objetivo es especializar al modelo pequeño en tareas de análisis de datos dentro de entornos interactivos.

La particularidad del entrenamiento es que la destilación se realiza sobre episodios completos: el estudiante resuelve cada tarea en su propia sesión del entorno `data_analysis_env` de OpenEnv, con hasta 10 turnos de llamadas a la herramienta Python y sus resultados, y el profesor puntúa cada token generado por el estudiante en todos los turnos, enmascarando los resultados de las herramientas en la pérdida. Los datos provienen del dataset SmolDataEnvs (v1.1) de FineEnvs.

El modelo es relevante como ejemplo reproducible de destilación on-policy para agentes con uso de herramientas, y porque demuestra una mejora sustancial frente al modelo base en la misma tarea: la recompensa media pasa de 0,189 a 0,355 en `eval_verified` (61 tareas) y de 0,143 a 0,281 en `test` (194 tareas). El repositorio ocupa 8,9 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.5-2B; detalles internos no disponibles |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer multimodal de 2,2 mil millones de parámetros, y se especializa mediante on-policy distillation con el `DistillationTrainer` de TRL. El profesor es Qwen/Qwen3.5-9B. La innovación metodológica principal es la destilación sobre episodios completos: cada tarea se ejecuta en una sesión del entorno `data_analysis_env` de OpenEnv, con hasta 10 turnos de llamadas a Python y sus resultados, y el profesor puntúa todos los tokens escritos por el estudiante en cada turno. Los resultados de las herramientas se enmascaran de la pérdida, de modo que el modelo aprende la política de razonamiento y acción, no a imitar salidas del entorno.

Los datos de entrenamiento proceden del dataset FineEnvs/SmolDataEnvs (v1.1), centrado en tareas de análisis de datos sobre ficheros reales: el agente debe responder preguntas ejecutando Python en una sesión en sandbox y enviar una respuesta que el entorno evalúa. El entrenamiento consistió en 28 pasos de 32 tareas (una pasada sobre el split de entrenamiento), con learning rate 2e-6 y semilla 42. Los registros de entrenamiento se almacenan en la carpeta `trackio/` del repositorio. No se documentan fases de RLHF o DPO adicionales.

## Capacidades

- Generación de texto y razonamiento multi-turno dentro de un bucle de agente.
- Uso de herramientas (tool calling): ejecución de código Python en una sesión en sandbox y lectura de los resultados devueltos por el entorno.
- Razonamiento multi-paso orientado a tareas: hasta 10 turnos de acciones y observaciones por episodio.
- Análisis de datos: responder preguntas sobre ficheros de datos reales mediante código.
- Procesamiento de imagen y texto (pipeline image-text-to-text heredado del modelo base).
- Envío de respuestas finales evaluables por un entorno (formato de submission).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agente de análisis de datos sobre ficheros tabulares: el modelo puede recibir una pregunta sobre un dataset, escribir código Python para inspeccionarlo, ejecutarlo en un sandbox y sintetizar la respuesta final; es el escenario exacto para el que fue destilado.
- Automatización de informes exploratorios: integrado en un pipeline que le pasa ficheros CSV o similares, el modelo genera y ejecuta código para calcular estadísticas descriptivas y responde preguntas concretas sobre los resultados.
- Evaluación de pipelines de agentes: sirve como estudiante de referencia en experimentos de destilación on-policy, comparando episodios completos frente a primer turno con las mismas semillas y tareas.
- Prototipado de asistentes con ejecución de código: al soportar tool calling con Python en sesión, puede emplearse en entornos de desarrollo para responder consultas que requieren cálculo o manipulación de datos.
- Docencia y reproducción de experimentos: el repositorio incluye logs de entrenamiento (`trackio/`) y detalles de hiperparámetros, lo que permite reproducir el ajuste con TRL y OpenEnv.
- Tareas de razonamiento con verificación automática: el modelo está entrenado para producir respuestas que un entorno puede puntuar, útil en bucles de evaluación continua con recompensa automática.
- Procesamiento de entradas imagen-texto: al heredar el pipeline image-text-to-text, puede emplearse en tareas que combinen una imagen con una consulta textual, aunque no se documenta un ajuste específico en ese dominio.

## Benchmarks y rendimiento

Los únicos datos publicados son las recompensas medias (proporción de tareas respondidas correctamente) sobre 8 ejecuciones por tarea, evaluadas en el mismo job que el modelo base y los seis estudiantes de la comparación:

| Modelo | eval_verified (61 tareas, 16 turnos) | test (194 tareas, 10 turnos) |
|---|---|---|
| Qwen3.5-2B sin entrenamiento | 0,189 | 0,143 |
| Este modelo | 0,355 | 0,281 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,21 mil millones de parámetros, en fp16 se requieren aproximadamente 4,4 GB solo para pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits rondaría 2,2-3 GB y en 4 bits aproximadamente 1,2-2 GB. No se documentan cuantizaciones oficiales.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, el modelo es apto para GPU de consumo.
- Cabe en GPU de consumo: sí, por el número de parámetros (2,2 B), en tarjetas con al menos 8 GB de VRAM en fp16 y en configuraciones inferiores con cuantización, aunque no hay cifras oficiales.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están documentados para este modelo y requerirían conversión de pesos en su caso.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Rendimiento publicado |
|---|---|---|---|---|---|
| Este modelo (qwen3.5-2b-distill-data-episodes-s42) | 2,21 B | no disponible | apache-2.0 | Destilación on-policy sobre episodios completos con herramientas | 0,355 / 0,281 de recompensa media |
| qwen3.5-2b-distill-data-firstturn-s42 | 2,21 B (base Qwen3.5-2B) | no disponible | apache-2.0 | Destilación solo sobre el primer turno, misma semilla y tareas | no disponible en la información proporcionada |
| Qwen/Qwen3.5-2B (base) | 2,21 B | no disponible | no disponible en la información proporcionada | Modelo multimodal sin ajuste para la tarea | 0,189 / 0,143 de recompensa media |
| Qwen/Qwen3.5-9B (profesor) | 9 B (aprox., por el nombre) | no disponible | no disponible en la información proporcionada | Modelo de mayor tamaño usado como profesor en la destilación | no disponible |

## Limitaciones y advertencias

- Especialización estrecha: el ajuste se realizó sobre tareas de análisis de datos de SmolDataEnvs (v1.1); el rendimiento fuera de ese dominio no está evaluado.
- Entrenamiento muy corto: 28 pasos de 32 tareas (una sola pasada sobre el split de entrenamiento), lo que limita la generalización y aumenta el riesgo de sobreajuste al formato del entorno.
- Recompensa absoluta moderada: incluso tras el ajuste, la proporción de tareas correctas es de 0,355 en `eval_verified` y 0,281 en `test`, por lo que un 65-72 % de las tareas evaluadas no se resuelven correctamente.
- Dependencia del entorno: el modelo espera un bucle de agente con herramienta Python en sandbox y un mecanismo de submission; su comportamiento fuera de ese contrato no está documentado.
- Riesgo de alucinación: no se documentan evaluaciones específicas de fidelidad factual ni de sesgos.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero se desconoce la licencia del modelo base Qwen/Qwen3.5-2B, que conviene verificar antes de un despliegue en producción.
- Sin cuantizaciones oficiales publicadas ni datos de latencia/throughput, lo que dificulta planificar un despliegue en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/training-agents-course/qwen3.5-2b-distill-data-episodes-s42
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Profesor de la destilación: https://huggingface.co/Qwen/Qwen3.5-9B
- Contraparte entrenada solo en el primer turno: https://huggingface.co/training-agents-course/qwen3.5-2b-distill-data-firstturn-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/FineEnvs/SmolDataEnvs
- Logs de entrenamiento: carpeta `trackio/` del repositorio del modelo
