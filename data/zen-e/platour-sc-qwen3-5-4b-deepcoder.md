# zen-E/PLatour-SC-Qwen3.5-4B-DeepCoder

## Resumen

PLatour-SC-Qwen3.5-4B-DeepCoder es un artefacto de investigación publicado por el usuario zen-E en Hugging Face, asociado al artículo "On the Opportunities and Challenges of Prefill-to-Autoregressive Cross-Model Transfer" (arXiv:2611.06976). No se trata de un modelo entrenado de forma convencional, sino de un conjunto de pesos de inferencia de un experimento de transferencia entre modelos (PACT): un modelo emisor de mayor tamaño codifica el prompt y suministra representaciones ocultas, mientras que un receptor más pequeño genera la respuesta de forma independiente. Este repositorio concreto corresponde al "Experiment 27: Self-Communication on deepcoder", es decir, un control de auto-comunicación sobre la tarea DeepCoder.

El artefacto se construye sobre Qwen/Qwen3.5-4B como modelo base y se distribuye con proyecciones puente (bridges) entrenadas entre backbones congelados mediante recompensas de tarea, partiendo de proyecciones inicializadas a cero. El repositorio incluye únicamente los pesos de las proyecciones puente y el `config.json` del proyecto PLatour, no los backbones completos, que deben descargarse por separado. El tamaño del repo (0,8 GB) es coherente con un export de pesos parciales, no con un modelo de 4B completo.

La relevancia de este artefacto es metodológica más que práctica: forma parte de un conjunto de controles (PACT-Check) diseñados para determinar si las mejoras observadas en la transferencia entre modelos se deben a información útil del emisor o simplemente a la adaptación del receptor. El propio autor advierte que el repositorio no incluye puntuaciones de benchmarks y que no debe interpretarse como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-4B, con soporte de atención híbrida según el paper); el artefacto distribuido son proyecciones puente lineales entre backbones congelados |
| Parametros totales | No disponible (el modelo base Qwen3.5-4B tiene 4B; el repo de 0,8 GB contiene solo las proyecciones puente) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (los modelos upstream conservan sus propias licencias) |
| Formato de pesos | safetensors, con cargador propio (`custom-loader`); no compatible con `AutoModel.from_pretrained` ni PEFT |

## Arquitectura y entrenamiento

El artefacto se enmarca en el método PACT (Prefill-to-Autoregressive Cross-model Transfer) descrito en el paper. Un emisor de mayor tamaño procesa el prompt y produce representaciones ocultas; un receptor más pequeño genera la respuesta de forma autónoma. Entre ambos se entrenan puentes lineales ligeros sobre backbones congelados, optimizados con recompensas de tarea y con proyecciones inicializadas a cero. El método soporta modelos con atención híbrida. Este repositorio concreto corresponde al experimento 27, un control de auto-comunicación (Self-Communication) sobre la tarea deepcoder, uno de los controles de PACT-Check junto con Dummy Transfer, Irrelevant Transfer y Trained Receiver.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset (más allá de la referencia a `zen-E/PLatour-DeepCoder-Data`) ni si se emplearon RLHF o DPO. El autor indica explícitamente que las revisiones exactas de los backbones usadas en la ejecución histórica no han sido verificadas de forma independiente y no deben inferirse de la última revisión del Hub. El export no adjunta estado de optimizador ni de RNG, por lo que no es reanudable para entrenamiento.

## Capacidades

- Generación de texto y razonamiento en el marco del experimento de transferencia entre modelos; las capacidades efectivas dependen del receptor Qwen3.5-4B descargado por separado.
- Evaluación de código (tarea deepcoder) como escenario principal del experimento, con juez oficial aislado requerido para la evaluación de programación.
- Control experimental de auto-comunicación: permite comparar el rendimiento del receptor con información del emisor frente a condiciones de transferencia dummy o irrelevante.
- Soporte de modelos con atención híbrida según el método PACT descrito en el paper.
- No se documentan tool calling, function calling, capacidades de agente, multilingüismo específico, visión ni audio en la información disponible.

## Casos de uso

- Investigación en transferencia entre modelos: reproducción del experimento 27 mediante `platour-exps download --experiment 27` para estudiar si la información del emisor mejora la generación del receptor en tareas de código.
- Validación de controles PACT-Check: uso del artefacto como condición de Self-Communication frente a Dummy Transfer e Irrelevant Transfer para aislar el efecto de la adaptación del receptor.
- Estudio de puentes lineales entre backbones congelados: análisis de las proyecciones entrenadas con recompensas de tarea para entender qué representaciones se transfieren entre modelos de distinto tamaño.
- Reproducibilidad de resultados académicos: verificación de hashes SHA-256 y del mapeo de tensores declarado en el `config.json` del proyecto para auditorías de provenance.
- Evaluación de código con juez aislado: ejecución de la tarea deepcoder con las entradas firmadas y el juez oficial para medir el rendimiento del receptor bajo la condición de auto-comunicación.
- Docencia y divulgación sobre metodología experimental en IA: ejemplo de diseño con controles que evita atribuir mejoras de tarea a comunicación efectiva entre modelos sin evidencia.
- Integración en pipelines de investigación con cargador propio: uso del loader de PLatour en lugar de las APIs estándar de Transformers para cargar el experimento con sus dependencias declaradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el repositorio distribuye pesos históricos de inferencia sin puntuaciones de benchmark y que no se hace ninguna afirmación sobre el protocolo de selección de checkpoints ni sobre rendimiento no sesgado en conjuntos reservados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el artefacto completo; depende del receptor Qwen3.5-4B y del emisor descargados por separado (el repo de 0,8 GB contiene solo las proyecciones puente).
- GPU recomendadas: no disponible en la información proporcionada. Como referencia externa, la documentación de Azure Databricks describe el fine-tuning completo de Qwen3-4B en una única H100, pero no aplica directamente a este artefacto de inferencia.
- Viabilidad en GPU de consumo: no confirmada para este export; requeriría verificar el tamaño del emisor y del receptor junto con las proyecciones.
- Opciones de despliegue: cargador propio del proyecto PLatour (`platour-exps`), no compatible con `AutoModel.from_pretrained` ni PEFT. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-SC-Qwen3.5-4B-DeepCoder | No disponible (repo de 0,8 GB con proyecciones puente) | No disponible | Transferencia entre modelos (PACT), control de auto-comunicación | Apache-2.0 | Hugging Face, cargador propio |
| Qwen/Qwen3.5-4B | 4B | No disponible en la información | LLM base de propósito general | Según modelo upstream | Hugging Face |
| Qwen3-4B (referencia de fine-tuning en Azure Databricks) | 4B | No disponible en la información | LLM base con guía de fine-tuning completo en H100 | Según modelo upstream | Azure Databricks / Hugging Face |

La comparación directa con modelos de la misma categoría no es significativa: el artefacto PLatour no es un LLM autónomo, sino un conjunto de proyecciones puente para un experimento controlado. Cualquier comparación de rendimiento requeriría los backbones emisor y receptor y la ejecución del protocolo de evaluación del paper.

## Limitaciones y advertencias

- No es un modelo listo para producción: el autor indica que el repositorio distribuye pesos históricos de inferencia sin benchmarks y que se requiere evaluación independiente y revisión de provenance antes de usarlos para nuevas afirmaciones comparativas.
- No es cargable mediante `AutoModel.from_pretrained` ni PEFT; requiere el cargador del proyecto PLatour y su `config.json`.
- Los backbones emisor y receptor no están incluidos y deben descargarse por separado; las revisiones exactas usadas en la ejecución histórica no han sido verificadas de forma independiente.
- El export no incluye estado de optimizador ni de RNG, por lo que no sirve para reanudar entrenamiento.
- No se documentan sesgos conocidos, riesgos de alucinación específicos, limitaciones de contexto o idioma, ni restricciones adicionales de licencia más allá de Apache-2.0 y las licencias de los modelos upstream.
- El rendimiento en tareas de código no puede atribuirse a comunicación efectiva entre modelos sin los controles PACT-Check; el propio paper advierte que una mejor tarea por sí sola no demuestra comunicación cross-model útil.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que refleja una adopción nula y ausencia de validación comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zen-E/PLatour-SC-Qwen3.5-4B-DeepCoder
- Colección PLatour: https://huggingface.co/collections/zen-E/platour
- Paper (arXiv): https://arxiv.org/abs/2611.06976
- Paper (HTML): https://arxiv.org/html/2611.06976
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-DeepCoder-Data
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Referencia externa sobre fine-tuning de Qwen3-4B en Azure Databricks: https://learn.microsoft.com/en-us/azure/databricks/machine-learning/ai-runtime/examples/tutorials/sgc-finetune-qwen3-4b
