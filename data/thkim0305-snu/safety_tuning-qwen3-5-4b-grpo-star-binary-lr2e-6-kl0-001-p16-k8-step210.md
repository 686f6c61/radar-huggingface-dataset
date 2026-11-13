# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-GRPO-STAR-binary-lr2e-6-kl0.001-p16-k8-step210

## Resumen

Safety_Tuning-Qwen3.5-4B-GRPO-STAR-binary es un ajuste fino del modelo base Qwen/Qwen3.5-4B, desarrollado por el usuario thkim0305-SNU, orientado a la alineación de seguridad mediante aprendizaje por refuerzo. El modelo aplica GRPO (Group Relative Policy Optimization) con una recompensa binaria estricta, usando un modelo profesor Qwen3.8-27B como juez y un conjunto de datos compuesto por STAR-1 (1.000 prompts) y STAR-benign-915 (915 prompts). El resultado es un checkpoint tras 210 actualizaciones del optimizador.

El modelo conserva la arquitectura y el tamaño del base: 4.659.865.088 parámetros (aproximadamente 4,66 mil millones), pesos en safetensors, licencia Apache 2.0 y pipeline de text-generation. Aunque la etiqueta de Hugging Face incluye `image-text-to-text` y `qwen3_5`, la model card no documenta capacidades multimodales ni detalles de arquitectura interna, por lo que la información disponible se limita a los hiperparámetros del entrenamiento de refuerzo.

Su relevancia radica en ser un ejemplo práctico de safety tuning con GRPO y recompensa binaria sobre un modelo de tamaño medio (4B), un rango que permite despliegue en hardware de consumo y experimentación académica. No obstante, el modelo tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado benchmarks, lo que limita su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.5-4B; tag `qwen3_5`) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repo | 9,3 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3.5-4B |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y se ajusta mediante GRPO, una variante de optimización de política con refuerzo que estima ventajas relativas dentro de un grupo de respuestas generadas para cada prompt. La configuración declarada es: 16 prompts por actualización, 8 respuestas por prompt, tasa de aprendizaje constante de 2e-6, coeficiente de pérdida KL de 0,001 y 210 actualizaciones completadas del optimizador (índice de checkpoint nativo 209). El modo de razonamiento (thinking) está activado y la pérdida de entrenamiento cubre tanto el razonamiento como la respuesta final.

Los datos de entrenamiento son STAR-1 (1.000 prompts) y STAR-benign-915 (915 prompts). La señal de recompensa proviene de un profesor Qwen3.8-27B con juicio binario estricto (v3) y Model Spec v2. El prompt de sistema del estudiante es `You are a helpful assistant.`. Se documentan dos ejecuciones: la inicial (`qwen35-star-grpo-binaryv3-specv2-lr2e6-gpu0123-20261110-v1`) y una reanudación (`qwen35-grpo-binaryv3-resume90-fresh-retry6-gpu0123-20261111-v3`). El repositorio contiene únicamente los pesos de inferencia y los assets del tokenizer; el estado del optimizador y los registros de entrenamiento permanecen en el almacenamiento original de checkpoints. No se detallan la composición completa del dataset, el número de tokens de entrenamiento ni innovaciones arquitectónicas adicionales.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline declarado (`text-generation`, `conversational`).
- Razonamiento con modo thinking activado durante el entrenamiento.
- Alineación de seguridad: el ajuste GRPO con recompensa binaria y Model Spec v2 busca respuestas más seguras y conformes a una especificación de comportamiento.
- Etiqueta `image-text-to-text` presente en los tags del repositorio, aunque la model card no documenta capacidades de visión.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de audio: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en safety tuning: reproducción y análisis del pipeline GRPO con recompensa binaria sobre un modelo de 4B, útil para estudiar cómo afecta el número de pasos y el coeficiente KL al comportamiento seguro.
- Evaluación de alineación con jueces automáticos: uso del checkpoint para comparar respuestas frente al modelo base Qwen3.5-4B y medir el efecto del ajuste con Model Spec v2.
- Despliegue en entornos con recursos limitados: con 4,66 mil millones de parámetros y pesos safetensors, es viable en GPUs de consumo con cuantización, aunque las variantes cuantizadas no están publicadas.
- Generación de texto conversacional: el pipeline declarado permite integrarlo en prototipos de asistentes conversacionales mediante transformers.
- Filtrado y moderación de contenido: el ajuste orientado a seguridad puede emplearse como componente en pipelines de revisión de respuestas, siempre con validación humana.
- Docencia y experimentación académica: el modelo y sus hiperparámetros documentados sirven como caso de estudio de RLHF/GRPO en cursos de aprendizaje por refuerzo aplicado a LLM.
- Baseline para comparativas de seguridad: al estar basado en un modelo público con licencia Apache 2.0, puede actuar como referencia en estudios comparativos de técnicas de alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (4,66 mil millones de parámetros), en FP16 se requerirían aproximadamente 9,3 GB solo para pesos, y en cuantización de 8 bits alrededor de 4,7 GB; en 4 bits, en torno a 2,3 GB. Estas cifras son estimaciones por tamaño y no proceden de la model card.
- GPU recomendadas: no disponible en la información proporcionada.
- Viabilidad en GPU de consumo: no confirmada por el autor; por tamaño, un modelo de 4B en cuantización podría caber en GPUs de consumo con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: la librería declarada es transformers; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-GRPO-STAR-binary | 4.659.865.088 | no disponible | Safety tuning con GRPO y recompensa binaria | apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B (base) | no disponible en la información | no disponible | Modelo base generalista | no disponible en la información | Hugging Face |
| Alternativas de 4B con safety tuning | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones de seguridad independientes; el efecto real del ajuste no está cuantificado.
- El modelo tiene 0 descargas y 0 likes, sin validación por parte de la comunidad.
- Los sesgos conocidos no están documentados; al derivar de Qwen3.5-4B, puede heredar sesgos del modelo base.
- Riesgo de alucinación: no evaluado en la información disponible.
- Limitaciones de contexto e idioma: no documentadas.
- El dataset de entrenamiento es reducido (1.000 prompts de STAR-1 y 915 de STAR-benign-915), lo que puede limitar la generalización del ajuste de seguridad.
- La recompensa binaria estricta de un profesor Qwen3.8-27B puede introducir sesgos del juez en el comportamiento aprendido.
- La licencia Apache 2.0 permite uso comercial, pero no hay garantías del autor sobre idoneidad en producción.
- La etiqueta `image-text-to-text` no está respaldada por documentación en la model card; no debe asumirse capacidad multimodal sin verificación.
- El estado del optimizador y los registros de entrenamiento no están incluidos en el repositorio, lo que dificulta la reproducibilidad completa.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-GRPO-STAR-binary-lr2e-6-kl0.001-p16-k8-step210
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Perfil del autor: https://huggingface.co/thkim0305-SNU
