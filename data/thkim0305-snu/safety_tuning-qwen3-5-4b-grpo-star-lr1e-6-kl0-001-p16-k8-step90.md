# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-GRPO-STAR-lr1e-6-kl0.001-p16-k8-step90

## Resumen

Safety_Tuning-Qwen3.5-4B-GRPO-STAR es un checkpoint de ajuste fino orientado a seguridad sobre el modelo multimodal Qwen/Qwen3.5-4B, desarrollado por el usuario thkim0305-SNU. El entrenamiento emplea GRPO (Group Relative Policy Optimization) con prompts del conjunto STAR, puntuación por parte de un profesor Qwen3.8-27B y una referencia congelada del modelo original. El resultado es un modelo de 4.659.865.088 parámetros (aproximadamente 4,66 mil millones) con pipeline image-text-to-text, es decir, capaz de procesar entradas de imagen y texto.

El checkpoint corresponde a la actualización de optimizador número 90, con una tasa de aprendizaje de 1e-6, coeficiente KL de 0.001, 16 prompts por actualización y 8 respuestas por prompt. La model card documenta explícitamente la línea de entrenamiento, incluido un cambio en el prompt de evaluación del juez tras la actualización 44. No se declaran puntuaciones de evaluación en la información disponible.

La relevancia de este modelo radica en su enfoque metodológico: aplicar GRPO con recompensa basada en un modelo profesor para alinear un modelo multimodal de tamaño medio en comportamientos seguros, manteniendo los pesos de visión y MTP congelados desde el modelo base. La licencia Apache 2.0 facilita su reutilización, aunque se trata de un checkpoint de investigación con cero descargas y sin validación externa publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen3.5-4B; incluye torre de visión y tensores MTP (multi-token prediction) congelados |
| Parametros totales | 4.659.865.088 (~4,66 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos exportados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B (revisión base `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`), un transformer multimodal con capacidad de entrada imagen-texto. Según la model card, todos los tensores de texto entrenados se exportan desde el checkpoint nativo, mientras que los tensores de visión y los tensores MTP no entrenados se conservan del modelo base fijado; el MTP no fue entrenado. La conversión se verificó mediante conversión inversa exacta de cada tensor de texto nativo, comprobaciones de pesos finitos y coincidencia de las 738 claves y formas de tensor de Hugging Face.

El entrenamiento utiliza GRPO con prompts del dataset UCSC-VLAA/STAR-1 y UCSC-VLAA/STAR-benign-915. La recompensa proviene de un profesor Qwen3.8-27B que puntúa las respuestas, con una referencia congelada del modelo original para el término KL (coeficiente 0.001). Los hiperparámetros registrados son: tasa de aprendizaje 1e-6, 16 prompts por actualización, 8 respuestas por prompt y 90 actualizaciones de optimizador completadas (iteración nativa 89, indexada desde cero). La ejecución de origen es `qwen35-star-grpo-4gpu-save30-a100j16-judgefooter-20261107-v6`, ejecutada sobre 4 GPU A100 según el nombre del run. El prompt de evaluación del juez cambió tras la actualización 44, y la ejecución reanudada desde el paso 90 acepta un JSON de puntuación plano final tras la prosa del profesor.

## Capacidades

- Generación de texto conversacional en formato multimodal (image-text-to-text), heredada de Qwen3.5-4B.
- Procesamiento de entradas de imagen junto con texto, gracias a la torre de visión conservada del modelo base.
- Comportamiento alineado hacia seguridad mediante GRPO, entrenado con prompts de seguridad del conjunto STAR.
- Soporte de conversación multi-turno (tag `conversational`).
- Compatibilidad con endpoints de Hugging Face (tag `endpoints_compatible`).
- Capacidades de tool calling, agentes, razonamiento multi-paso, matemáticas o código: no documentadas específicamente en la información disponible; se heredarían, en su caso, del modelo base Qwen3.5-4B.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación en alineación de seguridad: el checkpoint sirve como punto de partida para estudiar el efecto de GRPO con recompensa de profesor en modelos multimodales de 4B, comparando con el modelo base en evaluaciones de seguridad.
- Evaluación de robustez multimodal: al conservar la torre de visión, permite analizar si el ajuste de seguridad sobre texto afecta al comportamiento ante entradas imagen-texto.
- Reproducción de experimentos: los hiperparámetros y la línea de entrenamiento documentados (lr, KL, prompts por actualización, paso 90) permiten replicar o continuar el ajuste en entornos de investigación con GPU A100.
- Baseline para ajuste fino posterior: su licencia Apache 2.0 y formato safetensors estándar permiten usarlo como inicialización en pipelines de transformers para tareas conversacionales con moderación de contenido.
- Prototipado de asistentes con filtrado de respuestas: en entornos controlados, se puede desplegar para comparar tasas de respuestas dañinas frente al modelo base antes de decidir su adopción.
- Estudio del efecto del juez en GRPO: el cambio de prompt de evaluación tras la actualización 44 permite analizar la sensibilidad del entrenamiento a la formulación del juez y al formato de puntuación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se afirman puntuaciones de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (probablemente bf16/fp16): en torno a 9-10 GB solo para pesos, más overhead de activaciones y caché KV; el repositorio ocupa 9,3 GB.
- Cuantización a 8 bits: aproximadamente 5 GB de pesos; a 4 bits: aproximadamente 2,5-3 GB, más overhead. No se documentan cuantizaciones oficiales.
- GPU recomendadas: A100 (el run de entrenamiento usó 4 GPU A100) para entrenamiento o inferencia sin cuantizar; H100 para mayor throughput; RTX 4090 (24 GB) suficiente para inferencia en bf16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en bf16; en GPUs de 8-12 GB requeriría cuantización, no publicada oficialmente.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están documentados para este checkpoint, y llama.cpp requeriría conversión a GGUF no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Estado |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-GRPO-STAR (este) | ~4,66 B | No disponible | Imagen-texto | Apache 2.0 | Checkpoint de investigación, 0 descargas |
| Qwen/Qwen3.5-4B (base) | ~4,66 B (según este checkpoint) | No disponible | Imagen-texto | No disponible en la información | Modelo base oficial |
| Alternativas de seguridad multimodal de ~4B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de otros checkpoints de seguridad comparables en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No se han publicado evaluaciones: la model card no afirma ninguna puntuación, por lo que el efecto real del ajuste de seguridad es desconocido.
- Checkpoint de investigación sin tracción: cero descargas y cero likes en el momento de la consulta; no hay validación independiente.
- Sesgos: no documentados; se heredan los del modelo base Qwen3.5-4B y los del profesor Qwen3.8-27B usado para puntuar, lo que puede introducir sesgos del juez en la política aprendida.
- Riesgo de alucinación: no cuantificado; el ajuste GRPO sobre seguridad no elimina la generación de contenido incorrecto.
- Cambio de prompt del juez a mitad del entrenamiento (tras la actualización 44): puede introducir inconsistencias en la señal de recompensa entre tramos del run.
- Los tensores de visión y MTP no fueron entrenados; el ajuste de seguridad se aplica solo a los tensores de texto, por lo que el comportamiento ante entradas visuales puede no estar alineado.
- Idiomas y longitud de contexto no documentados; no se recomienda asumir cobertura multilingüe sin verificación.
- Licencia Apache 2.0 permite uso comercial, pero al ser un checkpoint sin evaluación, su uso en producción conlleva riesgo no mitigado.
- El repositorio excluye optimizer, estado RNG, logs y ejemplos de entrenamiento, lo que limita la reproducibilidad exacta del run.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-GRPO-STAR-lr1e-6-kl0.001-p16-k8-step90
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset STAR-1: https://huggingface.co/datasets/UCSC-VLAA/STAR-1
- Dataset STAR-benign-915: https://huggingface.co/datasets/UCSC-VLAA/STAR-benign-915
