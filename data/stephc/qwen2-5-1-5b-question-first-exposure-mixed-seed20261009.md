# StephC/Qwen2.5-1.5B-Question-First-Exposure-mixed-seed20261009

## Resumen

Qwen2.5-1.5B-Question-First-Exposure-mixed-seed20261009 es un checkpoint de investigación publicado por Stefano Civelli (usuario StephC) en Hugging Face. Se trata de un ajuste fino completo (full fine-tuning) del modelo Qwen/Qwen2.5-1.5B-Instruct, realizado para estudiar cómo el orden de los elementos en un prompt (contexto, pregunta y opciones) afecta a la forma en que el modelo lee y procesa la información. El checkpoint forma parte de una familia de nueve modelos liberados para una semilla fija (20261009), que combinan tres familias de modelos con tres regímenes de entrenamiento (solo CQO, solo QOC y mixto).

El modelo no está pensado como asistente conversacional de propósito general, sino como artefacto experimental para investigación en interpretabilidad mecanicista y sensibilidad al orden de prompt. Se entrenó sobre 4.096 registros de cuatro conjuntos de datos de elección múltiple (RACE-M, RACE-H, LogiQA y SciQ) durante dos pasadas, con 1.024 actualizaciones del optimizador. La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only de 1.543.714.304 parámetros.

Su relevancia es acotada pero específica: permite reproducir los experimentos del artículo "Exposure to Question-First Prompts Changes How Language Models Read the Context" y examinar empíricamente cómo el orden de presentación de la información altera el comportamiento del modelo en tareas de elección múltiple. No se han publicado resultados de benchmarks generales en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-1.5B-Instruct, sin dato explicito) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en FP32 sin cuantizar) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (FP32, sin cuantizar, sin resharding) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct (revision `989aa7980e4cf806f80c7fef2b1adb7bc71aa306`), un transformer decoder-only con atención causal. El ajuste fino es completo (no es un adapter): se entrenaron todos los parámetros en FP32 con estados de AdamW, autocast en BF16, learning rate de 5e-6, batch efectivo de 8 y atención eager. El entrenamiento consistió en 4.096 registros repartidos a partes iguales entre RACE-M, RACE-H, LogiQA y SciQ, con dos pasadas y 1.024 actualizaciones del optimizador.

La innovación metodológica es el régimen "mixed": cada registro se presenta una vez en orden CQO (contexto, pregunta, opciones) y otra en orden QOC (pregunta, opciones, contexto) a lo largo de dos pasadas. Esto permite estudiar si la exposición a distintos órdenes de prompt modifica la forma en que el modelo atiende al contexto. El checkpoint se distribuye byte a byte tal como fue evaluado, con un `release_manifest.json` que registra la receta y los SHA-256 originales de cada archivo. No se incluyen estados del optimizador ni texto de entrenamiento.

## Capacidades

- Generación de texto y respuesta a preguntas de elección múltiple dentro del formato y los conjuntos de datos del artículo (RACE-M, RACE-H, LogiQA, SciQ).
- Razonamiento sobre contexto y opciones en el template de prompt específico del estudio.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card (`language: en`).
- Capacidad especial: servir como artefacto de investigación para estudiar sensibilidad al orden de prompt e interpretabilidad mecanicista (ensayo de intercambio de pregunta, `question_swap`).
- No está entrenado como asistente conversacional de propósito general; sus capacidades fuera del setting experimental no están caracterizadas.

## Casos de uso

- Reproducción de experimentos de interpretabilidad: cargar el checkpoint en FP32 y ejecutar `qfe.evaluate` y `qfe.question_swap` desde el repositorio del artículo para replicar los resultados de la semilla 20261009.
- Estudio del sesgo de orden de prompt: comparar este checkpoint "mixed" con las variantes CQO-only y QOC-only de la misma semilla para aislar el efecto del orden de presentación sobre la precisión en elección múltiple.
- Análisis de atención al contexto: usar el ensayo de intercambio de pregunta para medir cuánto depende el modelo del contexto frente a la pregunta en cada formato.
- Docencia e investigación en mecánica interna de LLM: emplear un modelo pequeño (1,5B) y un checkpoint reproducible para ilustrar cómo el fine-tuning altera la lectura del contexto en un entorno controlado.
- Validación de pipelines de evaluación: usar los comandos del repositorio como caso de prueba para verificar la infraestructura de evaluación de modelos en un laboratorio.
- Estudio de linaje de checkpoints: comparar el comportamiento de este modelo con su base Qwen2.5-1.5B-Instruct para cuantificar el impacto del fine-tuning sobre tareas de elección múltiple.
- Investigación sobre robustez a la formulación: analizar si la exposición mixta a órdenes reduce la sensibilidad al formato en comparación con entrenamientos de un solo orden.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados conciernen únicamente a los conjuntos de datos de elección múltiple y al template de prompt del artículo, y que no se reclama rendimiento en tareas más amplias ni en despliegue.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 6,2 GB solo para pesos (1.543.714.304 parámetros × 4 bytes), más overhead de activaciones y KV cache; en la práctica, entre 8 y 12 GB según longitud de contexto y batch.
- VRAM estimada en BF16: unos 3,1 GB para pesos; en la práctica, entre 4 y 6 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP32 (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090); A100 o H100 no son necesarias para un modelo de este tamaño.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM para FP32, y con 4-6 GB en BF16.
- Opciones de despliegue: transformers (librería indicada en la model card), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`). No se documentan recetas para llama.cpp, Ollama, vLLM ni TGI más allá de los tags.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (Qwen2.5-1.5B-QFE-mixed) | 1,54B | no disponible | apache-2.0 | Hugging Face, 0 descargas | Checkpoint de investigación, fine-tuning completo sobre elección múltiple |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1,54B | no disponible en la información | apache-2.0 | Hugging Face, ampliamente usado | Modelo base instructivo de propósito general |
| Otras variantes QFE de la misma semilla (CQO-only, QOC-only) | 1,54B | no disponible | apache-2.0 | Hugging Face (familia de 9 checkpoints) | Mismo base y receta, distinto régimen de orden de prompt |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: entrenado sobre respuestas de elección múltiple, no como asistente conversacional; su uso fuera del setting experimental no está validado.
- Resultados acotados a los conjuntos de datos y al template de prompt del artículo; no se reclama rendimiento general.
- La liberación de una sola semilla no reproduce por sí misma los intervalos de incertidumbre a nivel de semilla del artículo (que reporta seis semillas).
- La semilla se eligió por ser la primera numerada, no por rendimiento.
- Riesgo de alucinación y sesgos: no caracterizados en la información disponible; al derivar de Qwen2.5-1.5B-Instruct, hereda los sesgos de su base, no documentados aquí.
- Idiomas: solo inglés según la model card; sin soporte multilingüe declarado.
- Licencia apache-2.0 permite uso comercial, pero el modelo no está diseñado ni validado para producción; los archivos `model-*.safetensors` son derivados modificados distribuidos tal como se evaluaron.
- No se incluyen estados del optimizador ni texto de entrenamiento; es un checkpoint completo, no un adapter.
- Para el ensayo de intercambio de pregunta se requiere cargar los pesos en FP32; usar BF16 altera ese experimento.

## Enlaces

- Hugging Face: https://huggingface.co/StephC/Qwen2.5-1.5B-Question-First-Exposure-mixed-seed20261009
- Repositorio del artículo (paper, código, outputs y reproducción): https://github.com/Stefano-Civelli/question-first-exposure
- Repositorio de investigación original: https://github.com/Stefano-Civelli/prompt-order-sensitivity
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
