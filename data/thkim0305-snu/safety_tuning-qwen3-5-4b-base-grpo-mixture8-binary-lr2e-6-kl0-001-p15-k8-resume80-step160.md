# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step160

## Resumen

El modelo `Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step160` es un ajuste fino del modelo base Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. Se trata de un experimento de alineación de seguridad (safety tuning) mediante GRPO (Group Relative Policy Optimization), una técnica de aprendizaje por refuerzo con preferencias que no requiere un modelo de recompensa separado, sino que compara grupos de respuestas generadas para la misma instrucción. El nombre del repositorio codifica los hiperparámetros exactos del entrenamiento: tasa de aprendizaje 2e-6, coeficiente KL de 0.001, 15 prompts y 8 respuestas por actualización, con reanudación desde el paso 80 y exportación en el paso 160.

El modelo parte de la arquitectura Qwen3.5-4B-Base, un transformer multimodal con pipeline `image-text-to-text`, es decir, capaz de procesar entradas de imagen y texto. El checkpoint contiene 4.659.865.088 parámetros totales en formato safetensors, con un tamaño de repositorio de 9.3 GB. La licencia es Apache 2.0 y los pesos son compatibles con la librería `transformers` y con endpoints de inferencia estándar.

La relevancia de este modelo es fundamentalmente experimental: documenta un proceso de safety tuning con GRPO sobre un modelo base multimodal de 4B, con todos los hiperparámetros expuestos en el nombre del repositorio. No obstante, el número de descargas (2) y la ausencia de benchmarks publicados en la información disponible limitan su uso en producción sin una evaluación adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5 |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint Qwen/Qwen3.5-4B-Base (revisión `1001bb4d826a52d1f399e183466143f4da7b741b`), un transformer multimodal de 4B parámetros que procesa entradas de imagen y texto. El entrenamiento se realizó con GRPO, un algoritmo de optimización de políticas que genera múltiples respuestas por prompt y normaliza las recompensas dentro del grupo para estimar la ventaja, eliminando la necesidad de un modelo de valor o de recompensa independiente. Los hiperparámetros documentados son: tasa de aprendizaje 2e-6, coeficiente de penalización KL de 0.001, 15 prompts por actualización, 8 respuestas por prompt (k=8), reanudación desde el paso 80 y exportación tras 160 actualizaciones del optimizador (iteración Megatron 159).

El nombre del repositorio incluye el término "binary", lo que sugiere una señal de recompensa binaria (por ejemplo, seguro/no seguro), aunque la model card no detalla la composición del dataset de preferencias ni el origen de las etiquetas. El entrenamiento se ejecutó sobre Megatron, según la mención de la iteración Megatron en la model card. La exportación contiene únicamente los pesos de inferencia, la configuración y los assets del tokenizer; los pesos de visión y los pesos MTP (multi-token prediction) no entrenados provienen del modelo base fijado. No se especifica el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto conversacional en formato multi-turno, heredada del modelo base Qwen3.5-4B-Base.
- Procesamiento de entradas multimodales de imagen y texto (pipeline `image-text-to-text`).
- Alineación de seguridad orientada a respuestas más seguras, fruto del ajuste con GRPO sobre señales binarias.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: se confirma visión por el pipeline; modo thinking y audio no disponibles.

## Casos de uso

- Investigación en alineación de seguridad: el modelo sirve como punto de partida reproducible para estudiar el efecto de GRPO con recompensa binaria sobre un modelo base de 4B, gracias a que el nombre del repositorio expone todos los hiperparámetros y la model card documenta la revisión exacta del modelo base.
- Evaluación comparativa de safety tuning: permite comparar respuestas del checkpoint ajustado frente al Qwen3.5-4B-Base original en conjuntos de prompts sensibles, aislando el efecto del entrenamiento GRPO.
- Prototipado de asistentes multimodales: al aceptar entradas de imagen y texto, puede usarse en demos de descripción de imágenes o respuesta a preguntas visuales, siempre que se valide previamente la calidad del ajuste.
- Generación de datos sintéticos de seguridad: el modelo puede emplearse para producir pares de respuestas seguras/no seguras que alimenten pipelines de filtrado o clasificación, dado su entrenamiento con señal binaria.
- Experimentos de destilación o merging: al ser un fine-tune de 4B en safetensors, es candidato para técnicas de merging con otros checkpoints de la familia Qwen3.5 o para destilación hacia modelos más pequeños.
- Despliegue en entornos con recursos limitados: con 4.66B parámetros y pesos en safetensors de 9.3 GB, cabe en GPUs de consumo con suficiente VRAM si se cuantiza, lo que facilita la experimentación local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9.3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 16-24 GB de VRAM.
- VRAM estimada con cuantización de 8 bits: en torno a 5-6 GB para pesos; con 4 bits, en torno a 3-4 GB para pesos (estimaciones teóricas, no verificadas en la información proporcionada).
- GPU recomendadas para FP16: NVIDIA A100, H100, L40S o RTX 4090 (24 GB).
- GPU de consumo: cabe en RTX 4090 y, con cuantización, en GPUs de 12-16 GB como RTX 4080 o RTX 4070 Ti Super; en 8 GB requeriría cuantización agresiva no documentada.
- Opciones de despliegue: `transformers` (librería declarada), endpoints compatibles (`endpoints_compatible`); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-GRPO (este) | 4,66B | no disponible | Apache 2.0 | Fine-tune GRPO de seguridad, multimodal, sin benchmarks publicados |
| Qwen/Qwen3.5-4B-Base | no disponible en la información | no disponible | no disponible en la información | Modelo base del que deriva; referencia directa para comparar el efecto del ajuste |
| Alternativas de 4B con safety tuning | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

La comparación cuantitativa con otros modelos de la misma categoría no está disponible: no se han publicado métricas de rendimiento ni de seguridad del checkpoint ajustado, y la información proporcionada no incluye detalles de modelos alternativos.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones de seguridad que permitan validar la eficacia del ajuste.
- Riesgo de degradación por sobreajuste a la señal de recompensa: con solo 160 actualizaciones y una recompensa binaria, el modelo puede haber aprendido respuestas evasivas o excesivamente restrictivas; se requiere evaluación específica.
- Sesgos conocidos: no documentados en la información proporcionada; se heredan los del modelo base Qwen3.5-4B-Base, que tampoco se detallan.
- Riesgo de alucinación: no cuantificado; al ser un fine-tune de un modelo de 4B, persiste el riesgo típico de esta escala.
- Idiomas soportados no especificados: no se puede garantizar un rendimiento multilingüe sin pruebas.
- Longitud de contexto no documentada: limita la planificación de cargas con contextos largos.
- Pesos MTP y de visión no entrenados: provienen del modelo base, por lo que el ajuste de seguridad no cubre necesariamente las rutas multimodales.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento de las licencias del modelo base y de los datos de entrenamiento, no detallados.
- Madurez: 2 descargas y 0 likes en el momento de la consulta; no es un checkpoint validado por la comunidad.
- Reproducibilidad limitada: el dataset de preferencias y el proceso de etiquetado binario no se describen en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step160
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Paper de GRPO (referencia del algoritmo): no disponible en la información proporcionada
- Blog o demo del autor: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
