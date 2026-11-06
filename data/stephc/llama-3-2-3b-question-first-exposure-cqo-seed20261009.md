# StephC/Llama-3.2-3B-Question-First-Exposure-CQO-seed20261009

## Resumen

Este checkpoint es un ajuste fino completo de `meta-llama/Llama-3.2-3B-Instruct` publicado por el investigador StephC como parte del estudio *Exposure to Question-First Prompts Changes How Language Models Read the Context*. No es un modelo de propósito general: es un artefacto de investigación diseñado para medir cómo el orden de los componentes de un prompt (contexto, pregunta y opciones) altera la forma en que el modelo atiende y procesa la información. El modelo concreto que nos ocupa corresponde a la configuración CQO (contexto → pregunta → opciones) con la semilla fija 20261009.

La relevancia es acotada pero clara para quien trabaja en interpretabilidad mecanística y en robustez de prompts: se libera el checkpoint FP32 original, sin cuantizar ni remezclar, junto con un manifiesto que registra el recetario y los SHA-256 de cada archivo, lo que permite reproducir exactamente los experimentos del paper. Forma parte de una familia de nueve checkpoints (tres familias de modelos × tres regímenes de orden), aunque esta entrega de una sola semilla no reproduce por sí misma los intervalos de incertidumbre a nivel de semilla del estudio.

Arquitectura transformer decoder-only estándar de Llama 3.2, con 3.212.749.824 parámetros totales y ventana de contexto heredada del modelo base. El modelo fue ajustado sobre respuestas de elección múltiple, no como asistente conversacional general, por lo que su uso previsto es estrictamente la investigación sobre sensibilidad al orden del prompt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Llama-3.2-3B-Instruct) |
| Tipos de cuantizacion | ninguno en el repo: pesos FP32 sin cuantizar, convertir ni remezclar |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.2 |
| Formato de pesos | safetensors (FP32, checkpoint completo, no adaptador) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tuning) sobre `meta-llama/Llama-3.2-3B-Instruct`, revisión `0cb88a4f764b7a12671c53f0838cd831a0843b95`. Los parámetros y los estados de AdamW se mantuvieron en FP32 con autocast BF16, learning rate 5e-6, batch efectivo de 8, atención eager y 1.024 actualizaciones del optimizador. El conjunto de entrenamiento consta de 4.096 registros, divididos por igual entre RACE-M, RACE-H, LogiQA y SciQ, presentados en dos pasadas. En la configuración CQO cada registro se presenta con el orden contexto → pregunta → opciones.

La innovación técnica no está en la arquitectura, sino en el diseño experimental: el ajuste expone deliberadamente al modelo a un orden de prompt concreto para estudiar el efecto de esa exposición sobre cómo lee el contexto. La ejecución de origen es `main_training_v1_llama_3_2_3b_instruct_20261009_CQO/step_1024` y el `release_manifest.json` documenta el recetario y los hashes originales. No se incluyen estados del optimizador en la release, aunque sí los pesos finales íntegros.

## Capacidades

- Generación de texto en inglés sobre el pipeline `text-generation` de transformers.
- Resolución de tareas de elección múltiple con el prompt template del paper (contexto, pregunta y opciones).
- Exposición controlada al orden CQO, lo que permite comparar su comportamiento frente a checkpoints QOC y de orden mixto de la misma familia.
- Soporte para el ensayo de intercambio de pregunta (*question-swap assay*) recogido en el paper, que requiere cargar los pesos en FP32.
- Integración con Text Generation Inference y endpoints compatibles, según los tags del repo.
- No se le atribuyen en la model card capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidades multilingües: no disponible; el modelo declara únicamente inglés.

## Casos de uso

- Investigación en interpretabilidad mecanística: analizar cómo la atención y las representaciones internas cambian cuando el contexto se presenta antes o después de la pregunta, usando este checkpoint como condición CQO de referencia.
- Estudios de sensibilidad al orden de prompt: comparar las respuestas de este checkpoint con los de configuración QOC y mixta sobre los mismos registros de RACE-M, RACE-H, LogiQA y SciQ.
- Reproducción de experimentos publicados: ejecutar `qfe.evaluate` y `qfe.question_swap` del repositorio del paper contra este checkpoint para validar los resultados del estudio.
- Auditoría de robustez de evaluaciones de elección múltiple: medir si el rendimiento de un modelo depende del formato del prompt, un sesgo relevante al diseñar benchmarks.
- Análisis de sesgo posicional en tareas de QA: usar el ensayo de intercambio de pregunta para detectar si el modelo se apoya en pistas de posición en lugar de en el contenido.
- Material docente para cursos de interpretabilidad: el par de checkpoints (CQO y QOC) permite ilustrar de forma empírica cómo el orden de entrada modifica el comportamiento del modelo con un coste de cómputo moderado (3B parámetros).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados del paper conciernen exclusivamente a los conjuntos fijos de elección múltiple y al prompt template del estudio, y que no se reclama ningún rendimiento en tareas más amplias ni en despliegue.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 12,9 GB solo para pesos (3,21B parámetros × 4 bytes), más overhead de activaciones y KV cache; en la práctica se recomienda reservar 16 GB o más.
- GPU recomendadas para FP32: A100, H100 o RTX 4090 (24 GB). Una RTX 3090 (24 GB) también es suficiente para cargar los pesos en FP32.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y, con conversión a BF16 o FP16 (no incluida en el repo), en tarjetas de 8-12 GB como RTX 4070 o RTX 3060 de 12 GB.
- Opciones de despliegue: transformers (librería declarada), Text Generation Inference y endpoints compatibles. No se documenta soporte GGUF ni llama.cpp en el repo; para usarlos habría que convertir los pesos, lo que rompe la garantía de reproducibilidad byte a byte.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StephC/Llama-3.2-3B-Question-First-Exposure-CQO-seed20261009 | 3,21B | no disponible | Investigacion sobre orden de prompt (CQO) | llama3.2 | Hugging Face, 0 descargas |
| meta-llama/Llama-3.2-3B-Instruct (modelo base) | 3,21B | no disponible | Asistente conversacional general | llama3.2 | Hugging Face |
| Checkpoints QOC y mixto de la misma familia (seed 20261009) | 3,21B | no disponible | Investigacion sobre orden de prompt | llama3.2 | Hugging Face (misma release de nueve checkpoints) |

La comparación relevante no es de rendimiento, sino de condición experimental: este checkpoint solo tiene sentido frente a los otros dos regímenes de orden y frente al modelo base sin ajustar. No se dispone de datos de benchmarks para establecer comparaciones cuantitativas con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ajustado específicamente sobre respuestas de elección múltiple: no debe emplearse como asistente conversacional general ni como modelo de producción.
- Los resultados del paper están acotados a sus conjuntos fijos de elección múltiple y a su prompt template; no se reclama rendimiento en otras tareas.
- Esta release de una sola semilla no reproduce por sí misma las estimaciones de incertidumbre a nivel de semilla del estudio, que cubre seis semillas.
- La semilla 20261009 se eligió por ser la primera numerada, no por su rendimiento, lo que descarta cualquier lectura de este checkpoint como el "mejor" de la familia.
- Riesgo de alucinación y sesgos: no se documentan análisis específicos en la información disponible; al ser un ajuste sobre cuatro datasets académicos, es esperable un ajuste excesivo a sus distribuciones.
- Idiomas: solo inglés; no se declara soporte multilingüe.
- Licencia llama3.2: el uso comercial queda sujeto a los términos de la licencia de Llama 3.2, y deben revisarse `LICENSE.txt`, `NOTICE.txt` y `USE_POLICY.txt` antes de cualquier uso.
- Los archivos `model-*.safetensors` son derivados modificados por el ajuste fino y se distribuyen byte a byte tal como se evaluaron; cualquier conversión o cuantización invalida la reproducibilidad del experimento.
- No se incluyen estados del optimizador ni texto de entrenamiento en la release.
- El modelo no incorpora credenciales ni datos sensibles, pero al derivar del modelo base hereda sus sesgos y limitaciones subyacentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StephC/Llama-3.2-3B-Question-First-Exposure-CQO-seed20261009
- Paper, código e instrucciones de reproducción: https://github.com/Stefano-Civelli/question-first-exposure
- Repositorio de investigación original: https://github.com/Stefano-Civelli/prompt-order-sensitivity
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
