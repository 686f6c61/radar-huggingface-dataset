# zen-E/PLatour-Qwen3-8B-to-1.7B-MATH500

## Resumen

PLatour-Qwen3-8B-to-1.7B-MATH500 es un artefacto de investigación publicado por zen-E que implementa un puente de transferencia entre modelos (PACT, *Prefill-to-Autoregressive Cross-model Transfer*) sobre el benchmark MATH500. La idea central es que un modelo "emisor" grande (Qwen3-8B) procesa el prompt y genera representaciones ocultas, mientras que un modelo "receptor" pequeño (Qwen3-1.7B) produce la respuesta de forma independiente, conectados mediante proyecciones lineales ligeras entrenadas con recompensas de tarea sobre backbones congelados.

El repositorio no contiene un modelo completo listo para usar: distribuye únicamente los pesos del puente (proyecciones lineales) junto con un `config.json` que describe la identidad del experimento, las dependencias, el mapeo de tensores y el SHA-256 de los ficheros. No es cargable mediante `AutoModel.from_pretrained` ni PEFT; requiere el loader específico del proyecto PLatour.

Es relevante porque aborda una pregunta abierta en la literatura: si la información codificada por un modelo grande durante el prefill puede transferirse de forma útil a un modelo pequeño que genera de forma autorregresiva. El paper asociado (arXiv:2611.06976) introduce además PACT-Check con controles (Dummy Transfer, Irrelevant Transfer, Self-Communication, Trained Receiver) para distinguir si la mejora proviene de información útil del emisor o de la mera adaptación del receptor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puente de proyecciones lineales entre dos backbones transformer congelados (Qwen3-8B emisor y Qwen3-1.7B receptor); soporta modelos con atención híbrida |
| Parametros totales | No disponible (el repo, de 0,9 GB, contiene los pesos del puente, no los backbones completos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (los modelos upstream conservan sus propias licencias) |
| Formato de pesos | safetensors, con loader personalizado (`custom-loader`); no compatible con `AutoModel.from_pretrained` ni PEFT |

## Arquitectura y entrenamiento

El método PACT entrena puentes lineales ligeros entre dos backbones congelados: el emisor Qwen3-8B codifica el prompt y suministra representaciones ocultas, y el receptor Qwen3-1.7B genera la respuesta de forma independiente. Las proyecciones se inicializan a cero y se optimizan usando recompensas de tarea, lo que permite entrenar el puente sin modificar los pesos de ninguno de los dos modelos base. El diseño admite modelos con atención híbrida.

El experimento 18 corresponde a la evaluación sobre MATH500. El dataset de entrenamiento asociado es `zen-E/PLatour-Qwen3-Data`. El paper introduce PACT-Check con cuatro controles (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) precisamente para verificar que las mejoras dependen de información útil del emisor y no solo de la adaptación del receptor. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO más allá del esquema de recompensas de tarea.

## Capacidades

- Transferencia de representaciones entre modelos de distinto tamaño mediante puentes lineales entrenados.
- Generación autorregresiva en el receptor (Qwen3-1.7B) condicionada por las representaciones del emisor (Qwen3-8B).
- Soporte de modelos con atención híbrida en el diseño del puente.
- Evaluación orientada a razonamiento matemático (MATH500) y tareas de programación con juez oficial aislado.
- Controles experimentales (PACT-Check) para validar la utilidad real de la comunicación entre modelos.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo específicas de este artefacto.

## Casos de uso

- Investigación en transferencia entre modelos: usar el puente para estudiar si un emisor grande mejora la generación de un receptor pequeño en tareas de razonamiento, con los controles de PACT-Check para descartar artefactos de adaptación.
- Reproducción de experimentos del paper: ejecutar el experimento 18 con `platour-exps download --experiment 18` y el comando de evaluación correspondiente para replicar los resultados sobre MATH500.
- Evaluación de eficiencia computacional: comparar el coste de inferencia de un receptor de 1.7B asistido por un emisor de 8B frente a usar directamente el modelo de 8B, midiendo si la calidad se aproxima con menor coste de decodificación.
- Estudio de destilación implícita: analizar qué información del emisor es aprovechable por el receptor y en qué capas o tipos de atención resulta más efectiva la proyección.
- Benchmarking metodológico: emplear los controles Dummy Transfer e Irrelevant Transfer para calibrar protocolos de evaluación en trabajos de comunicación entre modelos.
- Docencia e investigación reproducible: servir como ejemplo práctico de entrenamiento de puentes con backbones congelados y recompensas de tarea, con hashes públicos para verificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio declara explícitamente que distribuye pesos históricos de inferencia sin puntuaciones de benchmark y que no se hace ninguna afirmación sobre el protocolo de selección de checkpoints ni sobre rendimiento no sesgado en held-out.

## Requisitos de hardware

- VRAM estimada: no disponible para el puente en sí (0,9 GB de repo); la inferencia requiere cargar ambos backbones, Qwen3-8B (emisor) y Qwen3-1.7B (receptor).
- GPU recomendadas: no especificadas en la información disponible; por tamaño de los backbones, un emisor de 8B en FP16 requiere del orden de 16 GB y el receptor de 1.7B unos 3,4 GB, aunque estas cifras son estimaciones por tamaño y no datos publicados por el autor.
- Cabe en GPU de consumo: no confirmado; dependería de la cuantización de los backbones, que no está documentada para este artefacto.
- Opciones de despliegue: loader específico del proyecto PLatour (`platour-exps`); no es compatible con vLLM, llama.cpp, Ollama, TGI ni `AutoModel.from_pretrained` de forma directa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada artefactos comparables de transferencia prefill-a-autorregresivo con puentes lineales entre Qwen3-8B y Qwen3-1.7B. Como referencia de los backbones implicados:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PLatour-Qwen3-8B-to-1.7B-MATH500 (puente) | No disponible (repo 0,9 GB) | No disponible | Apache-2.0 | Hugging Face, loader propio |
| Qwen/Qwen3-8B (emisor) | 8B | No disponible en la información | No disponible en la información | Hugging Face |
| Qwen/Qwen3-1.7B (receptor) | 2B (según model card de Qwen) | No disponible en la información | No disponible en la información | Hugging Face |

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar por separado el emisor y el receptor, y usar el loader del proyecto PLatour con el `config.json` del repo.
- No es cargable mediante `AutoModel.from_pretrained` ni PEFT.
- El repositorio no incluye puntuaciones de benchmark; cualquier afirmación de rendimiento requiere evaluación independiente.
- Las revisiones exactas de los backbones usadas en la ejecución histórica no han sido verificadas de forma independiente y no deben inferirse de la última revisión del Hub.
- El export es de inferencia, no un estado reanudable de optimizador/RNG.
- Los modelos upstream (Qwen3-8B y Qwen3-1.7B) conservan sus propias licencias y avisos, que deben respetarse además de la Apache-2.0 del export.
- Riesgo de alucinación y sesgos: no documentados específicamente para este artefacto; aplican los del receptor Qwen3-1.7B.
- La evaluación de programación requiere un juez oficial aislado, lo que añade complejidad al pipeline de validación.
- Sin descargas ni likes en el momento de la consulta, lo que limita la evidencia comunitaria sobre su funcionamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zen-E/PLatour-Qwen3-8B-to-1.7B-MATH500
- Colección PLatour: https://huggingface.co/collections/zen-E/platour
- Paper (HTML): https://arxiv.org/html/2611.06976
- Paper (abs): https://arxiv.org/abs/2611.06976
- Dataset de entrenamiento: https://huggingface.co/datasets/zen-E/PLatour-Qwen3-Data
- Modelo emisor: https://huggingface.co/Qwen/Qwen3-8B
- Modelo receptor: https://huggingface.co/Qwen/Qwen3-1.7B
