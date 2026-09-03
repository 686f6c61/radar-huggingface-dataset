# sz14/cRia-LM-75M

## Resumen

cRia-LM-75M es un modelo de lenguaje base de 75,7 millones de parámetros desarrollado por sz14 (Shreyan Mohanty) que implementa una arquitectura de Transformer Recursivo Relajado (Relaxed Recursive Transformer, RRT). Esta arquitectura reutiliza un bloque recurrente de 11 capas que se evalúa dos veces, con parámetros LoRA específicos de cada pasada en la segunda iteración, logrando una profundidad efectiva de 24 capas mientras se almacenan solo 13 capas únicas. El modelo se entrenó durante aproximadamente 10 mil millones de tokens utilizando destilación de conocimiento a nivel de logits desde el modelo profesor `HuggingFaceTB/SmolLM2-360M`, combinando pérdida de entropía cruzada estándar con destilación dinámica.

Se trata de un modelo base, sin ajuste por instrucciones y sin plantilla de chat, orientado a tareas de generación de texto en inglés. Su tamaño reducido y su arquitectura eficiente lo hacen relevante para entornos con recursos limitados, experimentación académica y como punto de partida para fine-tuning en tareas específicas. La licencia Apache 2.0 permite uso comercial sin restricciones significativas. El modelo está disponible en Hugging Face con formato safetensors y es compatible con la librería Transformers mediante código personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Relaxed Recursive Transformer (RRT) |
| Parametros totales | 75.719.360 (75,7M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (formato safetensors en bfloat16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

cRia-LM-75M utiliza una arquitectura de Transformer Recursivo Relajado (RRT), descrita en el artículo arXiv 2410.20672. La disposición de capas es: 1 capa preludio + 11 capas compartidas recurrentes evaluadas en 2 pasadas + 1 capa coda, lo que da una profundidad computacional efectiva de 24 capas transformer. En la segunda pasada, las proyecciones lineales recurrentes reciben actualizaciones LoRA de rango 172, lo que permite que las dos traversals se especialicen manteniendo la eficiencia paramétrica de un bloque compartido. Cada capa sigue el diseño de SmolLM2-135M: tamaño oculto de 576, 9 cabezas de consulta y 3 cabezas KV con atención de consulta agrupada (GQA), dimensión de cabeza de 64, MLP SwiGLU con tamaño intermedio 1.536, RMSNorm, embeddings rotatorios (RoPE) con theta 100.000 y QK-Norm para estabilidad.

El embedding de entrada y la proyección de salida están atados mediante una factorización de rango 210 (49.152 x 210 y 210 x 576), lo que reduce sustancialmente el coste paramétrico del vocabulario de 49.152 tokens. El entrenamiento combinó destilación de conocimiento a nivel de logits desde SmolLM2-360M con entropía cruzada estándar, usando un balanceo dinámico CE/KD. Se procesaron aproximadamente 10 mil millones de tokens con longitud de secuencia de 2.048. La mezcla de datos incluyó FineWeb-Edu (48%), DCLM-Edu (32%), Cosmopedia-v2 (12%), FineMath-4+ (5%) y StarCoder Python (3%). El optimizador principal fue Muon para parámetros matriciales y AdamW para el resto, con un programa de calentamiento, estabilidad y decaimiento (warmup del 1%, decaimiento desde el 80% del entrenamiento).

## Capacidades

- Generación de texto causal en inglés: el modelo produce texto coherente y contextualmente relevante, aunque al ser un modelo base no está optimizado para seguir instrucciones ni mantener diálogos estructurados.
- Razonamiento básico y comprensión lectora: gracias al entrenamiento con datos educativos (FineWeb-Edu, DCLM-Edu) y matemáticos (FineMath), muestra capacidades razonables en tareas de sentido común y aritmética simple.
- Generación de código Python: el 3% de los datos de entrenamiento proviene de StarCoder Python, lo que le confiere cierta habilidad para completar fragmentos de código sencillos.
- Procesamiento de texto con contexto de 2.048 tokens: suficiente para párrafos extensos, aunque limitado para documentos largos.
- Sin soporte de tool calling ni function calling: al ser un modelo base sin ajuste por instrucciones, no implementa interfaces de llamada a herramientas.
- Sin capacidades multimodales: no procesa imágenes, audio ni vídeo.
- Sin modo de razonamiento explícito ni cadena de pensamiento: no incluye mecanismos de thinking mode.

## Casos de uso

- Prototipado rápido de aplicaciones de generación de texto: por su tamaño reducido, permite iterar rápidamente en entornos de desarrollo sin necesidad de GPUs de gama alta, ideal para validar ideas antes de escalar a modelos mayores.
- Fine-tuning para tareas específicas de clasificación o extracción de información: al ser un modelo base, puede ajustarse con datasets pequeños para tareas como análisis de sentimiento, etiquetado de entidades o resumen de textos cortos, aprovechando su licencia permisiva.
- Generación de código en entornos con restricciones de memoria: su capacidad para completar código Python básico lo hace utilizable en asistentes de programación embebidos en IDEs ligeros o en dispositivos con poca RAM.
- Educación e investigación en arquitecturas recursivas: sirve como banco de pruebas para estudiar el comportamiento de Transformers Recursivos Relajados, comparando su rendimiento con modelos densos de tamaño similar.
- Generación de contenido educativo: entrenado con datos de alta calidad educativa, puede emplearse para generar preguntas de práctica, explicaciones sencillas o resúmenes de material didáctico en inglés.
- Inferencia en CPU o dispositivos edge: con solo 75,7M de parámetros, es viable ejecutarlo en CPUs modernas o en dispositivos móviles de gama media, permitiendo aplicaciones de generación de texto offline.

## Benchmarks y rendimiento

La model card indica que se realizó una evaluación zero-shot con `lm-evaluation-harness` en precisión bfloat16, pero la tabla de resultados está incompleta en la información proporcionada. No se dispone de los valores numéricos de los benchmarks (MMLU, HumanEval, GSM8K, etc.) en el material disponible. Por tanto, no se pueden presentar datos concretos de rendimiento. Se recomienda consultar el repositorio de Hugging Face para obtener la tabla completa de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 75,7M de parámetros en bfloat16, el peso ocupa aproximadamente 151 MB. Con overhead de activaciones y caché, la VRAM necesaria ronda entre 0,5 y 1 GB, aunque no hay datos oficiales del autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluyendo NVIDIA GTX 1650, RTX 3050, RTX 4060, o incluso GPUs integradas modernas. También puede ejecutarse en CPU con 4-8 GB de RAM.
- Compatibilidad con GPUs de consumo: sí, cabe en cualquier GPU consumer actual, incluidas las de portátiles.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM, TGI, o ejecutarse con llama.cpp si se convierte a GGUF (aunque no se proporciona oficialmente). También es compatible con Hugging Face Transformers mediante código personalizado.
- Latencia y throughput: no hay datos oficiales. En una GPU moderna (p. ej., RTX 3090), se espera una latencia de pocos milisegundos por token y un throughput de cientos de tokens por segundo, pero son estimaciones orientativas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cRia-LM-75M | 75,7M | 2.048 | RRT (recursivo) | Apache 2.0 | Hugging Face |
| SmolLM2-135M | 135M | 2.048 | Transformer denso | Apache 2.0 | Hugging Face |
| TinyLlama-1.1B | 1.100M | 2.048 | Transformer denso | Apache 2.0 | Hugging Face |
| Qwen2-0.5B | 494M | 32.768 | Transformer denso | Apache 2.0 | Hugging Face |

cRia-LM-75M es significativamente más pequeño que estas alternativas, lo que lo hace más eficiente en memoria y cómputo, pero probablemente con menor capacidad de razonamiento y generación. Su arquitectura recursiva es su principal diferenciador, ya que logra una profundidad efectiva de 24 capas con solo 13 capas únicas, un enfoque poco común en modelos de este tamaño. No se dispone de comparativas de rendimiento directas con estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue comandos ni mantiene conversaciones estructuradas; requiere fine-tuning para tareas específicas.
- Sesgos potenciales: entrenado principalmente con datos web en inglés, puede reflejar sesgos presentes en esos corpus, aunque no se han realizado auditorías específicas.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en temas especializados.
- Limitación de contexto: ventana de 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Idioma: solo inglés; no soporta otros idiomas de forma fiable.
- Sin KV cache implementado: la model card indica que no se ha implementado caché de claves/valores, lo que puede afectar al rendimiento en inferencia de secuencias largas.
- Código personalizado: requiere `trust_remote_code=True` en Transformers, lo que implica ejecutar código del autor; se recomienda revisar el código antes de usarlo en producción.
- Datos de evaluación incompletos: no se han publicado resultados completos de benchmarks, lo que dificulta evaluar su rendimiento real frente a otros modelos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sz14/cRia-LM-75M
- Perfil del autor: https://huggingface.co/sz14
- Artículo sobre Transformers Recursivos Relajados (arXiv 2410.20672): https://arxiv.org/abs/2410.20672
