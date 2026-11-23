# training-agents-course/qwen3.5-2b-distill-data-firstturn-s43

## Resumen

qwen3.5-2b-distill-data-firstturn-s43 es un modelo derivado de Qwen/Qwen3.5-2B, desarrollado por el colectivo training-agents-course como parte de un ejercicio de destilación on-policy para agentes. El modelo se ha entrenado con el `DistillationTrainer` de TRL y su `environment_factory`, tomando como profesor a Qwen/Qwen3.5-9B y como datos las tareas de análisis de datos del conjunto SmolDataEnvs (v1.1), servidas a través del entorno `data_analysis_env` de OpenEnv. El agente debe responder preguntas sobre ficheros de datos reales ejecutando Python en una sesión en sandbox y enviando una respuesta final que el entorno evalúa.

La particularidad de esta variante es que la destilación se aplica únicamente al primer turno: el estudiante genera su primera llamada a herramienta y el profesor puntúa esos tokens, sin cubrir el resto del episodio. Se trata del grupo de control frente a la variante entrenada sobre episodios completos. El entrenamiento consistió en 28 pasos de 32 tareas (una pasada sobre el split de entrenamiento), con tasa de aprendizaje 2e-6 y semilla 43.

El modelo tiene 2.213.241.664 parámetros (aproximadamente 2,2 mil millones), se distribuye en safetensors bajo licencia Apache 2.0 y su pipeline declarado es image-text-to-text, lo que sugiere capacidades multimodales heredadas del modelo base. Su relevancia es fundamentalmente metodológica: sirve para comparar el efecto de destilar solo el primer turno frente a destilar el episodio completo en tareas agénticas de análisis de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.5-2B; tag `qwen3_5` en Hugging Face) |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la información disponible; el modelo hereda la de Qwen/Qwen3.5-2B (tag `qwen3_5`), con pipeline image-text-to-text, lo que implica un transformer multimodal con torre de visión. El proceso de ajuste es una destilación on-policy: el estudiante (Qwen3.5-2B) genera sus propias secuencias y el profesor (Qwen3.5-9B) puntúa los tokens generados, en lugar de imitar trayectorias fijas. El entrenamiento se realizó con TRL (`DistillationTrainer` y `environment_factory`) sobre el entorno `data_analysis_env` de OpenEnv, con tareas de análisis de datos de SmolDataEnvs v1.1.

La innovación metodológica es la restricción al primer turno: solo se destila la primera llamada a herramienta del agente, no los turnos posteriores del episodio. El entrenamiento fue corto (28 pasos de 32 tareas, una época sobre el split de entrenamiento), con lr 2e-6 y semilla 43. Los registros de entrenamiento están en la carpeta `trackio/` del repositorio. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO adicionales.

## Capacidades

- Generación de texto y razonamiento en el contexto de tareas de análisis de datos.
- Ejecución de código Python en un sandbox como herramienta para inspeccionar y manipular ficheros de datos.
- Tool calling / function calling: el agente emite llamadas a herramienta estructuradas y una respuesta final que el entorno califica.
- Comportamiento agéntico de un solo turno efectivo: está optimizado para producir una primera llamada a herramienta de calidad; el resto del episodio no fue objeto de destilación.
- Capacidades multimodales heredadas del modelo base (pipeline image-text-to-text), aunque no se documenta su rendimiento tras la destilación.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Análisis de datos tabulares con ejecución de código: el modelo puede recibir una pregunta sobre un fichero CSV o similar, escribir código Python para cargarlo y explorarlo, y emitir una respuesta final; encaja porque fue destilado exactamente sobre este flujo en SmolDataEnvs.
- Agente de primera llamada en pipelines multi-etapa: útil como componente que decide la acción inicial (qué fichero abrir, qué script ejecutar) en un sistema mayor donde un modelo más grande continúa el episodio.
- Prototipado de entornos OpenEnv: sirve como estudiante de referencia para validar `data_analysis_env` y comparar configuraciones de destilación con poco coste computacional.
- Investigación sobre destilación on-policy: al ser el control de la variante de episodios completos, permite aislar el efecto de destilar solo el primer turno en experimentos reproducibles (semilla 43).
- Evaluación de calidad de datos sintéticos en tareas de análisis: su recompensa media (0,285 en `eval_verified`) lo hace útil como línea base para medir mejoras de datos o currículos de entrenamiento.
- Despliegue ligero en entornos con recursos limitados: con 2,2 mil millones de parámetros y pesos safetensors, puede servirse en una GPU consumer para tareas de generación de la primera acción de un agente.

## Benchmarks y rendimiento

Resultados publicados en la model card (recompensa media, proporción de tareas respondidas correctamente, sobre 8 ejecuciones por tarea):

| Modelo | `eval_verified` (61 tareas, 16 turnos) | `test` (194 tareas, 10 turnos) |
|---|---|---|
| Qwen3.5-2B sin entrenar | 0,189 | 0,143 |
| Este modelo (first turn, semilla 43) | 0,285 | 0,227 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 2,2 mil millones de parámetros, en FP16 serían necesarios aproximadamente 4,5 GB solo para pesos, y en cuantización de 8 bits o 4 bits bajaría a rangos de 2-3 GB (estimación orientativa, no publicada por el autor).
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, una RTX 4090 o una A100/H100 son suficientes y sobredimensionadas para el modelo.
- Cabe en GPU consumer: sí, por el tamaño de parámetros, aunque no se documentan pruebas concretas.
- Opciones de despliegue: compatible con transformers (librería declarada) y con endpoints compatibles según el tag `endpoints_compatible`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| qwen3.5-2b-distill-data-firstturn-s43 | 2,2 B | no disponible | Apache 2.0 | Destilado solo en el primer turno; recompensa 0,285 / 0,227 |
| qwen3.5-2b-distill-data-episodes-s43 | 2,2 B (base) | no disponible | Apache 2.0 | Contraparte entrenada sobre episodios completos, misma semilla y tareas |
| Qwen/Qwen3.5-2B | 2,2 B (base) | no disponible | Apache 2.0 | Modelo base sin entrenamiento; recompensa 0,189 / 0,143 |
| Qwen/Qwen3.5-9B | no disponible | no disponible | no disponible | Profesor usado en la destilación |

## Limitaciones y advertencias

- El entrenamiento cubre solo el primer turno: el modelo no ha sido optimizado para los turnos posteriores de un episodio agéntico, por lo que su comportamiento completo puede degradarse frente a la variante de episodios.
- Entrenamiento muy corto (28 pasos, una época) y sobre un único conjunto de entornos de análisis de datos; la generalización a otras tareas agénticas no está demostrada.
- Rendimiento absoluto bajo: recompensa media de 0,285 y 0,227, es decir, acierta menos de un tercio de las tareas evaluadas.
- Riesgo de alucinación en la generación de código y en la interpretación de resultados de datos; las respuestas se validan contra un entorno, pero el modelo puede producir scripts erróneos.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; no se garantiza un comportamiento multilingüe tras la destilación.
- Licencia Apache 2.0, permisiva para uso comercial, pero sin garantías del autor sobre idoneidad en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/training-agents-course/qwen3.5-2b-distill-data-firstturn-s43
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Profesor: https://huggingface.co/Qwen/Qwen3.5-9B
- Contraparte de episodios completos: https://huggingface.co/training-agents-course/qwen3.5-2b-distill-data-episodes-s43
- Dataset SmolDataEnvs: https://huggingface.co/datasets/FineEnvs/SmolDataEnvs
