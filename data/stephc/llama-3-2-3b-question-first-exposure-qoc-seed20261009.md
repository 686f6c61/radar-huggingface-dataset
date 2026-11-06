# StephC/Llama-3.2-3B-Question-First-Exposure-QOC-seed20261009

## Resumen

Llama-3.2-3B-Question-First-Exposure-QOC-seed20261009 es un checkpoint de investigación publicado por Stefano Civelli (usuario StephC) que consiste en un ajuste fino completo de meta-llama/Llama-3.2-3B-Instruct. El modelo forma parte del conjunto de nueve checkpoints liberados para el experimento descrito en el artículo *Exposure to Question-First Prompts Changes How Language Models Read the Context*, cuyo objetivo es estudiar cómo el orden de los elementos en el prompt (contexto, pregunta y opciones) afecta a la forma en que el modelo procesa y responde a tareas de elección múltiple. En concreto, este checkpoint corresponde a la configuración QOC (Question, Options, Context), es decir, la pregunta y las opciones aparecen antes que el contexto.

El modelo no está pensado como asistente conversacional de propósito general, sino como artefacto experimental para investigación en interpretabilidad mecanística y sensibilidad al orden de prompt. Se entrenó sobre 4.096 registros de elección múltiple procedentes de RACE-M, RACE-H, LogiQA y SciQ, con dos pasadas y 1.024 actualizaciones del optimizador. La relevancia actual reside en que permite reproducir y extender los hallazgos del artículo sobre cómo los transformers leen el contexto según su posición en la secuencia.

Arquitectónicamente es un transformer decoder-only de la familia Llama 3.2, con 3.212.749.824 parámetros totales y ventana de contexto de 128.000 tokens heredada del modelo base, aunque su uso previsto se limita a las plantillas y datasets del estudio. La licencia es Llama 3.2, con las restricciones habituales de la familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), atención eager |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base; no verificada en esta ficha) |
| Tipos de cuantizacion | no se han publicado versiones cuantizadas; los pesos se distribuyen en FP32 sin cuantizar |
| Idiomas soportados | en (inglés) |
| Licencia | llama3.2 |
| Formato de pesos | safetensors (FP32, sin resharding ni conversión) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tuning) de Llama-3.2-3B-Instruct, revisión 0cb88a4f764b7a12671c53f0838cd831a0843b95. Se entrenó con parámetros y estados de AdamW en FP32, autocast en BF16, learning rate de 5e-6, batch efectivo de 8, atención eager y 1.024 actualizaciones del optimizador. El conjunto de entrenamiento consta de 4.096 registros divididos a partes iguales entre RACE-M, RACE-H, LogiQA y SciQ, presentados en dos pasadas. La configuración QOC coloca la pregunta y las opciones antes del contexto, en contraste con la configuración CQO (contexto primero) y con el entrenamiento de orden mixto, que presenta cada registro una vez en cada orden.

La innovación no está en la arquitectura, sino en el diseño experimental: el checkpoint forma parte de un conjunto de nueve modelos (tres familias × tres regímenes de orden) liberados para una única semilla, la 20261009, elegida por ser la primera semilla numerada y no por rendimiento. El artículo original reporta seis semillas, por lo que esta liberación por sí sola no reproduce los intervalos de incertidumbre a nivel de semilla. Los pesos se distribuyen byte a byte tal como se evaluaron, sin cuantización, conversión ni resharding, y el repositorio incluye un `release_manifest.json` con la receta y los SHA-256 originales de cada archivo.

## Capacidades

- Generación de texto y respuesta a preguntas de elección múltiple sobre las plantillas y datasets del estudio (RACE-M, RACE-H, LogiQA, SciQ).
- Razonamiento sobre contexto en posiciones variables: el modelo está específicamente ajustado para el orden QOC, lo que permite estudiar el efecto de la exposición a la pregunta antes del contexto.
- Soporte de intervenciones experimentales: el artículo incluye un ensayo de intercambio de preguntas (question-swap assay) que requiere cargar los pesos en FP32.
- Capacidades conversacionales heredadas del modelo base Llama-3.2-3B-Instruct, pero no reforzadas ni evaluadas en este checkpoint.
- Tool calling y function calling: no disponible como capacidad entrenada en este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no disponibles como capacidad entrenada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Reproducción de experimentos de interpretabilidad mecanística: cargar el checkpoint con los scripts `qfe.evaluate` y `qfe.question_swap` del repositorio del artículo para replicar los resultados de la configuración QOC sobre los datasets de elección múltiple.
- Estudio del efecto del orden de prompt: comparar este checkpoint QOC con sus homólogos CQO y de orden mixto de la misma semilla para aislar el efecto de la posición de la pregunta y las opciones respecto al contexto.
- Análisis de atención y circuitos internos: al ser un ajuste fino completo en FP32, permite inspeccionar patrones de atención y activaciones sin artefactos de cuantización, adecuado para trabajos de mechanistic interpretability.
- Evaluación de robustez al reordenamiento: usar el question-swap assay para medir cómo cambia la respuesta cuando se intercambia la pregunta manteniendo el contexto, un test de sensibilidad al prompt.
- Docencia e investigación en NLP: servir como caso de estudio reproducible de cómo el orden de los elementos en el prompt condiciona el comportamiento de un transformer pequeño (3B) en tareas de comprensión lectora y razonamiento lógico.
- Baseline para experimentos de prompt engineering: emplear el checkpoint como referencia controlada en estudios que comparen distintas plantillas de prompt sobre modelos de 3B parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados del estudio se refieren a los datasets de elección múltiple y a la plantilla de prompt fijos del artículo, y que no se reclama ningún rendimiento más amplio de tarea o despliegue.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 12,9 GB solo para pesos (3.212.749.824 parámetros × 4 bytes), más overhead de activaciones y KV cache; en la práctica se recomienda al menos 16-24 GB para contexto corto.
- VRAM estimada en BF16: aproximadamente 6,4 GB para pesos, más overhead; viable en GPUs de 12-16 GB con contexto moderado.
- GPU recomendadas: A100, H100 o L40S para FP32 con contexto largo; RTX 4090 (24 GB) para FP32 con contexto corto; RTX 3090/4080 (16-24 GB) para BF16.
- Cabe en GPU de consumo: sí, en BF16 en tarjetas de 12 GB o más; en FP32 requiere 16 GB o más.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference y endpoints compatibles según los tags del repositorio. No se han publicado versiones GGUF, por lo que llama.cpp y Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Llama-3.2-3B-Question-First-Exposure-QOC-seed20261009 | 3.212.749.824 | 128.000 (heredado) | llama3.2 | Ajuste fino de investigación sobre orden de prompt (QOC) |
| meta-llama/Llama-3.2-3B-Instruct | 3.212.749.824 | 128.000 | llama3.2 | Asistente conversacional de propósito general |
| Checkpoints hermanos CQO y mixto de la misma semilla (StephC) | 3.212.749.824 | 128.000 (heredado) | llama3.2 | Variantes experimentales del mismo estudio |
| Qwen2.5-3B-Instruct | 3.090.000.000 aprox. | 32.768 | Apache 2.0 | Asistente conversacional multilingüe |

La comparación directa con asistentes de propósito general no es significativa: este checkpoint está entrenado exclusivamente sobre elección múltiple y su rendimiento fuera de ese dominio no está evaluado. Su comparación natural son los otros ocho checkpoints del mismo estudio.

## Limitaciones y advertencias

- El modelo está ajustado para responder preguntas de elección múltiple con la plantilla del artículo; no es un asistente conversacional de propósito general y su uso fuera de ese dominio no está validado.
- La liberación cubre una sola semilla (20261009), por lo que no reproduce por sí sola los intervalos de incertidumbre a nivel de semilla del artículo, que reporta seis semillas.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al derivar de Llama-3.2-3B-Instruct, hereda los sesgos del modelo base, no cuantificados aquí.
- Limitación de idioma: la model card declara únicamente inglés.
- Restricciones de licencia: licencia Llama 3.2, con las condiciones de uso de la familia Llama; revisar `LICENSE.txt`, `NOTICE.txt` y `USE_POLICY.txt` del repositorio antes de cualquier uso comercial.
- Los pesos se distribuyen en FP32 sin cuantizar; para el question-swap assay es necesario mantener FP32, mientras que las evaluaciones ordinarias del artículo cargan BF16.
- No se incluyen estados del optimizador ni texto de entrenamiento; es un checkpoint completo, no un adapter.
- El repositorio no incluye versiones GGUF ni cuantizadas, lo que limita el despliegue en entornos con llama.cpp u Ollama sin conversión previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StephC/Llama-3.2-3B-Question-First-Exposure-QOC-seed20261009
- Repositorio del artículo (paper, código, outputs y reproducción): https://github.com/Stefano-Civelli/question-first-exposure
- Repositorio de investigación original: https://github.com/Stefano-Civelli/prompt-order-sensitivity
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
