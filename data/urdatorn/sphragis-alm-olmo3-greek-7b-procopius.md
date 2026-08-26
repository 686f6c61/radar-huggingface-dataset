# Urdatorn/sphragis-alm-olmo3-greek-7b-procopius

## Resumen

Sphragis authorial language model: Procopius es uno de los diecisiete modelos de lenguaje autorial (ALM) desarrollados por Urdatorn para el benchmark Sphragis de atribución de autoría en griego antiguo. Cada ALM se obtiene mediante un further-pretraining completo del modelo base `Urdatorn/olmo3-7b-ancient-greek` (una adaptación de OLMo 3 7B de AI2) sobre las frases de entrenamiento de un único autor del corpus Sphragis. Este modelo concreto se entrena exclusivamente con 900 frases y 140.858 tokens puntuados de la obra de Procopio, con el objetivo de medir la perplejidad por token de cualquier texto y atribuirlo al autor cuyo modelo lo encuentre menos sorprendente.

El modelo sigue la metodología de Huang, Murakami y Grieve (2025), publicada en PLoS ONE, que demuestra que la perplejidad de modelos de lenguaje autorial es un método eficaz para la atribución de autoría. Su relevancia radica en que ofrece una herramienta especializada para la filología digital y la estilometría del griego antiguo, un dominio con escasos recursos lingüísticos. Con 7.298 millones de parámetros y una ventana de contexto no especificada, el modelo está diseñado para tareas de clasificación y análisis, no para generación conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 3 7B (transformer decoder-only) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos originales en safetensors) |
| Idiomas soportados | grc (griego antiguo) |
| Licencia | other (derivada de Apache-2.0 con restricciones por datos CC BY-NC-SA) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de `Urdatorn/olmo3-7b-ancient-greek`, que a su vez es una adaptación de `allenai/Olmo-3-1025-7B` al griego antiguo. Sobre esta base se realiza un further-pretraining completo con un objetivo de modelado de lenguaje causal, donde cada secuencia de entrenamiento es una única frase del autor Procopio, delimitada por tokens `<|endoftext|>`. El entrenamiento utiliza una pérdida de validación sobre las frases de validación del mismo autor para decidir el número de épocas, con early stopping (paciencia 3) y un máximo de 20 épocas; en este caso, la mejor época fue la 1.0, con una pérdida de validación de 0,8360 nats/token.

El proceso emplea una tasa de aprendizaje constante de 1e-05 tras 25 pasos de calentamiento, un batch efectivo de 16 frases, precisión fp32 para los pesos maestros y bf16 para el cómputo, con FSDP en dos GPUs GH200. Los pesos finales se guardan en bf16. A diferencia del trabajo original de Huang y colaboradores, que fijaba 100 épocas, aquí la duración se determina por evidencia empírica, lo que reduce el sobreajuste y mejora la generalización del modelo autorial.

## Capacidades

- Atribución de autoría en griego antiguo: calcula la perplejidad por token de una frase y la compara con la de otros dieciséis modelos autoriales para asignar la autoría más probable.
- Modelado de lenguaje especializado: captura patrones léxicos, sintácticos y estilísticos propios de Procopio, lo que permite distinguir su prosa de la de otros autores del corpus Sphragis.
- Evaluación de similitud estilística: puede usarse para medir la cercanía entre textos anónimos y el estilo de Procopio.
- Procesamiento de secuencias de una sola frase: entrenado para puntuar frases completas, no para generar texto libre.
- Multilingüe limitado: aunque el modelo base puede tener capacidades multilingües, este ALM está especializado exclusivamente en griego antiguo y no se recomienda para otros idiomas.
- Sin soporte de tool calling ni agentes: es un modelo de lenguaje puro, sin funciones de llamada a herramientas ni razonamiento multi-paso.

## Casos de uso

- Investigación filológica: los estudiosos de la literatura griega antigua pueden usar el modelo para verificar la autoría de textos dudosos atribuidos a Procopio, comparando la perplejidad de sus frases con la de otros autores del corpus Sphragis.
- Análisis estilométrico cuantitativo: el modelo permite medir la distancia estilística entre diferentes obras o pasajes, complementando métodos tradicionales de análisis de frecuencia léxica.
- Detección de interpolaciones o falsificaciones: al puntuar frases individuales, se pueden identificar segmentos dentro de un texto que se desvían significativamente del estilo de Procopio, lo que sugiere posibles adiciones de otros autores.
- Construcción de corpus anotados: los diecisiete ALMs del conjunto Sphragis pueden emplearse para etiquetar automáticamente fragmentos de texto con su autor probable, facilitando la creación de datasets de entrenamiento para otras tareas de PNL.
- Evaluación de modelos de lenguaje para lenguas clásicas: sirve como referencia para comparar la capacidad de distintos modelos base (adaptados o no al griego antiguo) en tareas de atribución, como se muestra en la diferencia de rendimiento entre la versión adaptada y la no adaptada.
- Docencia y divulgación: en cursos de humanidades digitales, el modelo puede utilizarse como ejemplo práctico de aplicación de modelos de lenguaje a problemas de autoría, con un pipeline reproducible y código abierto.

## Benchmarks y rendimiento

En la información disponible se reporta el rendimiento conjunto de los diecisiete modelos autoriales sobre la división de validación `sentence_1` del benchmark Sphragis. No se proporcionan resultados individuales para este modelo concreto.

| Configuracion | Macro-F1 (validacion sentence_1) |
|---|---|
| 17 ALMs entrenados desde base adaptada al griego antiguo | 0,800 |
| 17 ALMs entrenados desde base no adaptada | 0,812 |

Estos datos indican que la adaptación previa al griego antiguo mejora la calidad de cada modelo como modelo de lenguaje, pero no incrementa la capacidad discriminativa del conjunto para la atribución de autoría. No se dispone de más métricas (MMLU, HumanEval, etc.) porque el modelo no está orientado a tareas generales.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 7B en bf16, se necesitan aproximadamente 14-16 GB de VRAM para cargar los pesos completos. Con cuantización a 8 bits o 4 bits, podría reducirse a 8-10 GB o 4-6 GB respectivamente, aunque no se han publicado versiones cuantizadas.
- GPU recomendadas: una NVIDIA RTX 3090, RTX 4090, A10G o A100 con al menos 16 GB de VRAM es suficiente para inferencia en bf16. Para entrenamiento o fine-tuning adicional, se requieren GPUs con mayor memoria (por ejemplo, A100 40GB o GH200).
- Compatibilidad con GPUs de consumo: sí, cabe en tarjetas como RTX 3090/4090 (24 GB) y en GPUs de 16 GB con cuantización.
- Opciones de despliegue: al ser un modelo de tipo causal estándar, puede servirse con vLLM, llama.cpp, Ollama o TGI, siempre que se adapte el formato de pesos (safetensors a GGUF si se desea cuantización). No se han publicado instrucciones específicas de despliegue.
- Latencia y throughput: no se han publicado datos. Para un modelo de 7B en una GPU moderna, se espera una latencia de decodificación de decenas de milisegundos por token y un throughput de cientos de tokens por segundo con batching, pero estos valores son estimaciones generales.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos autoriales específicos para griego antiguo fuera del conjunto Sphragis. La comparación más relevante es con el modelo base sin adaptar, tal como se reporta en el benchmark:

| Modelo | Parametros | Contexto | Macro-F1 (conjunto de 17 ALMs) | Licencia |
|---|---|---|---|---|
| Sphragis ALM (base adaptada al griego antiguo) | 7.298 M | no disponible | 0,800 | other |
| Sphragis ALM (base sin adaptar) | 7.298 M | no disponible | 0,812 | other |

Ambos comparten la misma arquitectura y tamaño, pero difieren en el punto de partida del further-pretraining. No se han encontrado alternativas comerciales o de código abierto comparables para la atribución de autoría en griego antiguo.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo se publica bajo licencia `other` debido a que los datos de entrenamiento provienen de fuentes con licencias mixtas, incluyendo material CC BY-NC-SA. Esto impide su uso comercial sin una revisión exhaustiva de las licencias de los datos originales (ver `LICENSES.md` del dataset Sphragis).
- Datos de entrenamiento limitados: solo 900 frases de un único autor, lo que puede provocar un sobreajuste al estilo específico de Procopio y una baja generalización a otros géneros o épocas del griego antiguo.
- Sesgos estilísticos: el modelo está sesgado hacia la prosa de Procopio; no es adecuado para analizar poesía, inscripciones o textos de otros dialectos sin recalibrar.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede generar texto plausible pero incorrecto si se usa fuera de su tarea de puntuación; no está diseñado para generación.
- Sin soporte multilingüe: aunque el modelo base podría tener capacidades en otros idiomas, este ALM se ha entrenado exclusivamente con griego antiguo y su rendimiento en otros idiomas no está garantizado.
- Contexto no especificado: se desconoce la longitud máxima de secuencia soportada; el entrenamiento usa frases individuales, por lo que no se recomienda procesar documentos largos de una sola vez.
- Dependencia del benchmark: el rendimiento reportado (0,800 macro-F1) es específico del conjunto de validación Sphragis y puede no trasladarse a otros corpus de atribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Urdatorn/sphragis-alm-olmo3-greek-7b-procopius
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Modelo base adaptado al griego antiguo: https://huggingface.co/Urdatorn/olmo3-7b-ancient-greek
- Repositorio de código (entrenamiento, puntuación y atribución): https://github.com/Urdatorn/sphragis_models
- Paper de referencia: Huang, Murakami y Grieve (2025), "Attributing authorship via the perplexity of authorial language models", PLoS ONE 20(7): e0327081. DOI no disponible en la información proporcionada.
- Modelo base original OLMo 3: https://huggingface.co/allenai/Olmo-3-7B-Instruct (y paper en arXiv: https://arxiv.org/abs/2512.13961)
