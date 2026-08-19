# Yangtze-ailab/LDM-CoT-SFT-Qwen3.5-9B-MixedScience

## Resumen

LDM-CoT-SFT-Qwen3.5-9B-MixedScience es un ajuste fino del modelo base Qwen/Qwen3.5-9B, desarrollado por Yangtze-ailab, que actúa como proponente dentro de un sistema de Large Discovery Models (LDM). Un LDM ejecuta un bucle recurrente de generar, seleccionar, evaluar y actualizar, donde un modelo de lenguaje propone candidatos experimentales, un surrogate probabilístico (como un proceso gaussiano) convierte las observaciones en una media posterior e incertidumbre, y una función de adquisición selecciona el siguiente experimento. Este modelo concreto es la variante «GP-hidden»: los valores numéricos de adquisición del surrogate se ocultan del prompt, por lo que el modelo debe inferir el estado epistémico (qué regiones están agotadas, cuáles son inciertas o informativas, y si conviene explotar o explorar) a partir del historial observado en lenguaje natural.

El modelo se entrena mediante supervisión de secuencias (SFT) de parámetros completos sobre el dataset LDM-CoT-SFT-16K, que contiene historiales de búsqueda con razonamiento de cadena de pensamiento y acciones estructuradas. Con aproximadamente 9,4 mil millones de parámetros y una longitud de secuencia de entrenamiento de 16 384 tokens, está diseñado para emitir una traza de razonamiento seguida de una propuesta estructurada. Su relevancia radica en que, al ocultar los valores numéricos del surrogate, el razonamiento de adquisición se vuelve transferible a dominios donde no se dispone de esos números, y la búsqueda se apoya en la intuición aprendida en los pesos en lugar de depender de una entrada numérica externa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Qwen3.5-9B) |
| Parametros totales | 9 409 813 744 (~9,4 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 16 384 (longitud de entrenamiento; el modelo base podría soportar más, no se especifica) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene safetensors en bf16; no se publican GGUF ni otras cuantizaciones) |
| Idiomas soportados | Inglés (etiqueta `en`) |
| Licencia | MIT (el modelo base Qwen3.5-9B conserva su propia licencia) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de parámetros completos de Qwen/Qwen3.5-9B, un transformer decoder denso de la serie Qwen3.5. Según la información de la model card, el entrenamiento se realizó con DeepSpeed ZeRO-3 con CPU offload, precisión bf16, gradient checkpointing, longitud de secuencia 16 384, tasa de aprendizaje 1e-5 con programación coseno y calentamiento del 3 %, durante 2 épocas, utilizando el framework LLaMA-Factory. El chat template `qwen3_5` se usa con el modo de pensamiento habilitado, lo que permite que el modelo genere una cadena de razonamiento antes de emitir la acción estructurada.

La innovación técnica principal es la ocultación de los valores del proceso gaussiano en el prompt durante el entrenamiento. A diferencia de su modelo compañero LDM-SFT-Qwen3.5-9B-MixedScience, que recibe los valores numéricos de adquisición, esta variante debe reconstruir el razonamiento de adquisición a partir del historial observado (duración del estancamiento, nivel de ruido, mejor resultado hasta el momento). Esto fuerza al modelo a desarrollar una intuición de búsqueda independiente de los números del surrogate, lo que lo hace más robusto para despliegues donde esos valores no están disponibles.

## Capacidades

- Proponer candidatos experimentales en bucles de optimización bayesiana, basándose en un historial evaluado en lenguaje natural.
- Razonamiento de adquisición: inferir qué regiones del espacio de búsqueda están agotadas, cuáles son inciertas o informativas, y decidir entre explotación y exploración.
- Generación de cadena de pensamiento (chain-of-thought) seguida de una acción estructurada, siguiendo el contrato de salida del sistema LDM.
- Generación de texto en inglés.
- Integración como componente proponente dentro de un sistema agéntico LDM (generate → select → evaluate → update).
- El modelo base Qwen3.5-9B es nativamente multimodal según la documentación de Qwen (etiqueta `image-text-to-text`), pero la model card de este ajuste fino no menciona el uso de entradas visuales; no se ha verificado que esta variante los aproveche.

## Casos de uso

- Descubrimiento de materiales: el modelo propone composiciones químicas o condiciones de síntesis a partir de un historial de experimentos previos, guiando la exploración hacia regiones prometedoras del espacio de diseño.
- Optimización de hiperparámetros: en lugar de un optimizador clásico, el modelo sugiere configuraciones de hiperparámetros para modelos de machine learning, razonando sobre los resultados de ejecuciones anteriores.
- Diseño de fármacos: propone estructuras moleculares candidatas basándose en ensayos de actividad y toxicidad previos, ayudando a priorizar compuestos para síntesis y pruebas.
- Optimización de procesos industriales: sugiere parámetros de proceso (temperatura, presión, tiempo de reacción) para maximizar rendimiento o calidad, usando el historial de corridas.
- Búsqueda de arquitecturas de redes neuronales: propone configuraciones de arquitectura (número de capas, canales, tasas de dropout) a partir de métricas de validación de modelos entrenados anteriormente.
- Experimentación científica autónoma: se integra en plataformas de laboratorio automatizado donde el modelo propone el siguiente experimento, y el sistema lo ejecuta y evalúa, cerrando el bucle sin intervención humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos en tareas de descubrimiento científico. El único dato de rendimiento indirecto es la descripción cualitativa del razonamiento de adquisición, que según los autores apenas se ve afectado por la ocultación de los valores GP.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~9,4 B parámetros. En bf16, los pesos ocupan ~18,8 GB. Con contexto de 16 384 tokens y overhead de activaciones y caché KV, se recomienda al menos 24 GB de VRAM para inferencia con cuantización (no disponible) y 40 GB o más para precisión completa.
- GPU recomendadas: A100 40 GB, A100 80 GB, H100, o configuraciones multi-GPU con reparto de memoria.
- En GPU de consumo: una RTX 4090 (24 GB) podría ejecutar el modelo con cuantización de 8 bits si se generaran los archivos, pero no se proporcionan oficialmente; sin cuantización, no cabe cómodamente.
- Opciones de despliegue: transformers con `device_map="auto"`, vLLM, TGI u otros servidores compatibles con el formato safetensors y el chat template `qwen3_5`.
- Latencia y throughput: no disponible en la información publicada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Diferencia clave |
|---|---|---|---|---|
| LDM-CoT-SFT-Qwen3.5-9B-MixedScience (este) | ~9,4 B | 16 384 (entrenamiento) | MIT | Valores GP ocultos en el prompt; razonamiento desde el historial |
| LDM-SFT-Qwen3.5-9B-MixedScience (compañero) | ~9,4 B | 16 384 (entrenamiento) | MIT | Valores GP visibles en el prompt durante entrenamiento |
| Qwen3-8B (base genérica) | 8 B | 32 768 (típico) | Apache 2.0 | No especializado en descubrimiento científico; sin fine-tuning LDM |

La comparativa se limita a los modelos directamente relacionados, ya que no se dispone de información sobre otros modelos de optimización bayesiana basados en LLM con los que contrastar.

## Limitaciones y advertencias

- El modelo está diseñado para operar dentro del bucle LDM; de forma aislada solo propone candidatos, pero no los evalúa ni cierra el ciclo.
- El comportamiento refleja los oráculos utilizados durante la recolección de datos y los dominios cubiertos en el dataset de entrenamiento; puede no generalizar bien a dominios muy diferentes.
- Solo se ha entrenado y validado en inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- La licencia MIT cubre el ajuste fino, pero el modelo base Qwen3.5-9B está sujeto a los términos de su propia licencia, que debe revisarse antes de un uso comercial.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez frente a entradas adversariales.
- La longitud de contexto máxima soportada por el modelo base podría ser superior a 16 384, pero no se ha verificado en este ajuste fino; superar ese límite puede degradar el rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yangtze-ailab/LDM-CoT-SFT-Qwen3.5-9B-MixedScience
- Dataset de entrenamiento: https://huggingface.co/datasets/Yangtze-ailab/LDM-CoT-SFT-16K
- Modelo compañero (GP visible): https://huggingface.co/Yangtze-ailab/LDM-SFT-Qwen3.5-9B-MixedScience
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
