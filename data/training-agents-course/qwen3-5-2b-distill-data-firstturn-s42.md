# training-agents-course/qwen3.5-2b-distill-data-firstturn-s42

## Resumen

`qwen3.5-2b-distill-data-firstturn-s42` es un modelo derivado de `Qwen/Qwen3.5-2B` (2.213.241.664 parámetros totales) entrenado mediante destilación on-policy con el `DistillationTrainer` de TRL y su `environment_factory`. El profesor es `Qwen/Qwen3.5-9B` y el alumno aprende a resolver tareas de análisis de datos sobre ficheros reales ejecutando Python en una sesión en sandbox y entregando una respuesta que el entorno evalúa. El autor es `training-agents-course` y forma parte de un experimento comparativo más amplio sobre destilación de agentes.

La particularidad de este checkpoint es que la destilación se limita al primer turno: el alumno escribe su primera llamada a herramienta para cada tarea y el profesor puntúa únicamente esos tokens. Se trata, por tanto, de la variante de control frente al entrenamiento sobre episodios completos, lo que lo convierte en una pieza útil para estudiar cómo se propaga la señal del profesor cuando solo se supervisa el arranque de la trayectoria del agente.

El modelo es relevante en el contexto actual de agentes open source porque combina un tamaño reducido (2B), licencia Apache 2.0 y un pipeline multimodal `image-text-to-text`, lo que permite desplegarlo en hardware modesto para tareas de análisis de datos asistido por código. La mejora medida frente al modelo base es modesta pero consistente en los dos conjuntos de evaluación publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5); detalles internos no disponibles |
| Parámetros totales | 2.213.241.664 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-2B` y se ajusta con destilación on-policy: el alumno genera sus propias trayectorias y el profesor (`Qwen/Qwen3.5-9B`) puntúa los tokens producidos, en lugar de imitar una distribución estática. El entrenamiento se ejecuta con TRL (`DistillationTrainer`) y el `environment_factory`, sobre el entorno `data_analysis_env` de OpenEnv, que sirve tareas del dataset `FineEnvs/SmolDataEnvs` (v1.1). La tarea consiste en responder preguntas sobre ficheros de datos reales ejecutando Python en una sesión en sandbox y enviando una respuesta final que el entorno califica.

El régimen concreto es de 28 pasos de 32 tareas (una pasada sobre el split de entrenamiento), con learning rate 2e-6 y semilla 42. La innovación metodológica del checkpoint es la restricción de la supervisión al primer turno: solo se puntúan los tokens de la primera llamada a herramienta, no los turnos posteriores del episodio. Los registros de entrenamiento se guardan en la carpeta `trackio/` del repositorio. No se especifican en la información disponible la composición del corpus de preentrenamiento del modelo base, el volumen de tokens ni si hubo fases adicionales de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento en el marco de tareas de análisis de datos.
- Ejecución de código Python en un entorno sandbox como herramienta para inspeccionar y manipular ficheros de datos.
- Tool calling / function calling en formato de agente con turnos y envío de respuesta final.
- Razonamiento multi-paso dentro de un episodio, aunque el entrenamiento de este checkpoint solo supervisa el primer turno.
- Procesamiento de entrada multimodal imagen-texto según el pipeline declarado (`image-text-to-text`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de razonamiento extendido (thinking): no disponible.

## Casos de uso

- Análisis exploratorio de datos automatizado: el agente recibe un fichero tabular y una pregunta, ejecuta Python en sandbox para calcular estadísticas y devuelve la respuesta; el modelo está entrenado específicamente para este flujo sobre `SmolDataEnvs` y el entorno `data_analysis_env`.
- Automatización de informes periódicos sobre datos operativos: el modelo puede escribir scripts cortos que lean ficheros, agreguen métricas y emitan un resultado verificable, integrable en un pipeline programado.
- Asistente interno de consultas sobre almacenes de datos: con tool calling y ejecución de código, el modelo traduce preguntas en lenguaje natural a operaciones sobre ficheros reales, reduciendo la dependencia de analistas para consultas repetitivas.
- Evaluación y comparación de técnicas de destilación de agentes: al ser la variante de control (solo primer turno), sirve como referencia reproducible para medir el efecto de supervisar episodios completos frente a supervisar únicamente el arranque.
- Prototipado de agentes en hardware modesto: con 2B parámetros y licencia Apache 2.0, es adecuado para entornos de desarrollo y pruebas donde no se dispone de GPUs de gran capacidad.
- Investigación en entornos con recompensa verificable: el esquema de OpenEnv con calificación automática permite usarlo como banco de pruebas para estudiar señal de recompensa, exploración y estabilidad del entrenamiento.
- Base para fine-tuning específico de dominio: al ser un checkpoint pequeño y permisivo, puede servir de punto de partida para adaptar el flujo de análisis de datos a esquemas y fuentes propios.

## Benchmarks y rendimiento

Evaluación publicada por el autor: recompensa media (proporción de tareas respondidas correctamente) sobre 8 ejecuciones por tarea, con el modelo base y los seis alumnos de la comparativa evaluados en el mismo job.

| Modelo | `eval_verified` (61 tareas, 16 turnos) | `test` (194 tareas, 10 turnos) |
|---|---|---|
| Qwen3.5-2B sin entrenamiento | 0.189 | 0.143 |
| Este modelo | 0.287 | 0.239 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 2.213.241.664 parámetros, en fp16 serían aproximadamente 4,4 GB solo de pesos, y en cuantizaciones de 8 y 4 bits bajaría a rangos de ~2,2 GB y ~1,1-1,5 GB respectivamente, sin contar caché KV ni overhead del runtime.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo encaja en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090; para despliegue en servidor, A100 o H100 no serían necesarias salvo por concurrencia alta.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de tarjetas con 8 GB o más en cuantización de 8 bits o inferior; el dato exacto no está publicado.
- Opciones de despliegue: `transformers` (librería declarada); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible, y la conversión a GGUF no se documenta.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| Este modelo | 2,21B | no disponible | Destilación on-policy, primer turno | Apache 2.0 | 0.287 / 0.239 |
| `qwen3.5-2b-distill-data-episodes-s42` | 2,21B (mismo base) | no disponible | Destilación on-policy, episodios completos | Apache 2.0 | no disponible en la información proporcionada |
| `Qwen/Qwen3.5-2B` (base) | 2,21B | no disponible | Preentrenamiento + ajuste del autor original | Apache 2.0 (según base) | 0.189 / 0.143 |
| `Qwen/Qwen3.5-9B` (profesor) | ~9B | no disponible | no disponible | no disponible | no disponible |

La comparación directa más informativa es con el modelo base y con la variante de episodios completos de la misma semilla, que el autor enlaza explícitamente como contraparte. No se dispone de datos de benchmarks frente a otros modelos de 2B de la competencia.

## Limitaciones y advertencias

- El entrenamiento cubre una sola pasada sobre el split de entrenamiento (28 pasos de 32 tareas), lo que limita la magnitud de la mejora: la recompensa en `test` pasa de 0,143 a 0,239, todavía por debajo del 25 % de acierto.
- La supervisión se restringe al primer turno, por lo que los turnos posteriores del episodio no reciben señal directa del profesor; el comportamiento en trayectorias largas puede degradarse.
- El dominio de entrenamiento es estrecho (análisis de datos sobre `SmolDataEnvs` con el entorno `data_analysis_env`); el rendimiento fuera de ese tipo de tareas no está caracterizado.
- Riesgo de alucinación en las respuestas finales: el modelo puede emitir conclusiones no respaldadas por la ejecución real de código, y el autor no documenta mitigaciones.
- Sesgos conocidos: no documentados en la información disponible; al heredar el modelo base, arrastra los sesgos de su corpus, que tampoco se detalla.
- Idiomas soportados no especificados; no hay garantía de comportamiento multilingüe más allá de lo que herede del base.
- Licencia Apache 2.0, permisiva para uso comercial, pero sin garantías del autor sobre idoneidad en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; se trata de un artefacto de investigación, no de un modelo con validación comunitaria.
- El modelo requiere un entorno de ejecución de código en sandbox para su flujo previsto; desplegarlo sin aislamiento adecuado introduce riesgos de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/training-agents-course/qwen3.5-2b-distill-data-firstturn-s42
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Profesor: https://huggingface.co/Qwen/Qwen3.5-9B
- Contraparte entrenada sobre episodios completos: https://huggingface.co/training-agents-course/qwen3.5-2b-distill-data-episodes-s42
- Dataset: https://huggingface.co/datasets/FineEnvs/SmolDataEnvs
- TRL (librería de entrenamiento): https://github.com/huggingface/trl
- OpenEnv: no disponible en la información proporcionada
