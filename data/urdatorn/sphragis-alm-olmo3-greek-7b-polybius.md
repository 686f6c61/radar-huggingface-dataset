# Urdatorn/sphragis-alm-olmo3-greek-7b-polybius

## Resumen

Sphragis authorial language model: Polybius es un modelo de lenguaje autorial (ALM) de 7.3 mil millones de parámetros, desarrollado por Urdatorn como parte del benchmark Sphragis de atribución de autoría en griego antiguo. Se trata de un refinamiento completo (further-pretraining) del modelo base `Urdatorn/olmo3-7b-ancient-greek`, que a su vez deriva de `allenai/Olmo-3-1025-7B`, especializado en el corpus de Polibio. El modelo sigue la metodología de Huang, Murakami y Grieve (2025), que atribuye autoría comparando la perplejidad de diecisiete modelos autoriales, uno por autor, sobre una frase dada.

Este modelo resuelve el problema de la atribución de autoría en textos clásicos griegos, un reto filológico y computacional que requiere capturar el estilo idiosincrásico de un autor concreto. Su relevancia radica en que es uno de los primeros modelos de lenguaje abiertos diseñados específicamente para esta tarea en una lengua antigua, y demuestra que el ajuste fino sobre un corpus autorial reducido (3.000 frases) puede producir modelos discriminativos eficaces. La arquitectura es un transformer decoder-only de 7B parámetros, con una ventana de contexto que no se especifica en la documentación disponible, aunque el modelo base OLMo 3 soporta contextos largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en OLMo 3) |
| Parametros totales | 7.298.011.136 (7,3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base OLMo 3 soporta contexto largo, pero no se indica el valor para este ajuste) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se ofrecen cuantizaciones alternativas) |
| Idiomas soportados | Griego antiguo (grc) exclusivamente para la tarea de atribución; el modelo base puede tener capacidades multilingües, pero este ajuste está especializado en grc |
| Licencia | other (derivado de Apache-2.0 pero con restricciones por fuentes CC BY-NC-SA en los datos de entrenamiento) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura OLMo 3 de AI2, un transformer decoder-only con atención causal estándar, optimizado para razonamiento de contexto largo, function calling y generación de código en su versión original. Para este ajuste, se parte de `Urdatorn/olmo3-7b-ancient-greek`, una versión ya adaptada al griego antiguo, y se realiza un further-pretraining completo sobre las frases de entrenamiento de Polibio extraídas del dataset Sphragis. El objetivo de entrenamiento es modelado de lenguaje causal sobre secuencias formateadas como `<|endoftext|> sentence <|endoftext|>`, con una frase por secuencia.

El entrenamiento utiliza una selección de época basada en la pérdida de validación del propio autor: se entrena hasta un máximo de 20 épocas con paciencia 3, y se selecciona la época con menor pérdida en las frases de validación de Sphragis. En este caso, la mejor época fue la 1.0, con una pérdida de validación de 0,7430 nats/token. Se emplea una tasa de aprendizaje constante de 1e-05 tras 25 pasos de warmup, un batch efectivo de 16 frases, y precisión mixta con pesos maestros en fp32 y cómputo en bf16, usando FSDP con sharding completo en 2 GPU GH200. Los pesos finales se guardan en bf16. A diferencia del método original de Huang et al. que fija 100 épocas, aquí se aplica early stopping basado en evidencia held-out, lo que reduce el sobreajuste y mejora la generalización.

## Capacidades

- Atribución de autoría en griego antiguo: el modelo está entrenado para calcular la perplejidad de frases del autor Polibio, y junto con los otros dieciséis modelos del conjunto Sphragis, permite atribuir una frase al autor que la encuentra menos sorprendente.
- Modelado de lenguaje causal especializado: al ser un refinamiento sobre un corpus autorial concreto, captura patrones léxicos, sintácticos y estilísticos propios de Polibio.
- Puntuación de frases: puede puntuar cualquier frase en griego antiguo con la misma normalización y formato usados en el entrenamiento, devolviendo la log-verosimilitud negativa por token.
- Integración en pipelines de atribución: el código de entrenamiento, puntuación y atribución está disponible en el repositorio `Urdatorn/sphragis_models`, lo que permite reproducir el flujo completo.
- Capacidades multilingües limitadas: aunque el modelo base OLMo 3 es multilingüe, este ajuste está especializado en griego antiguo y no se recomienda para otros idiomas.
- Sin soporte de tool calling ni agentes: el modelo no ha sido entrenado para function calling ni razonamiento multi-paso; su uso es exclusivamente como modelo de lenguaje para puntuación de perplejidad.

## Casos de uso

- Investigación filológica sobre autoría clásica: los investigadores pueden usar el modelo para atribuir fragmentos dudosos a Polibio o descartar su autoría, comparando la perplejidad con los otros dieciséis modelos del conjunto Sphragis.
- Análisis estilométrico cuantitativo: el modelo permite medir la distancia estilística entre un texto anónimo y el corpus de Polibio, complementando métodos tradicionales de estilometría basados en frecuencias de palabras.
- Construcción de corpus etiquetados: los editores de textos griegos pueden emplear el modelo para verificar la coherencia autorial en colecciones digitales, detectando posibles interpolaciones o errores de atribución.
- Educación y divulgación: el modelo puede integrarse en herramientas docentes para que estudiantes de filología clásica exploren cómo la inteligencia artificial aborda la autoría en textos antiguos.
- Evaluación de modelos de lenguaje en lenguas de bajos recursos: sirve como caso de estudio para medir hasta qué punto un modelo de 7B puede especializarse en un dominio lingüístico muy restringido con pocos datos.
- Reproducción de metodologías de atribución: el código y los pesos permiten a otros equipos replicar el enfoque de Huang et al. en otros autores o lenguas, adaptando el pipeline a sus propios corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El único dato de rendimiento reportado es el rendimiento del conjunto completo de diecisiete modelos en el benchmark Sphragis:

| Metrica | Valor |
|---|---|
| Macro-F1 en validacion Sphragis (sentence_1) | 0,800 (conjunto de 17 modelos) |
| Macro-F1 con modelos entrenados desde base no adaptada | 0,812 (referencia) |
| Perdida de validacion del modelo Polybius | 0,7430 nats/token |

El autor señala que la adaptación previa al griego antiguo mejora la calidad de cada modelo como modelo de lenguaje, pero no aumenta la discriminación del conjunto (0,800 frente a 0,812). No se proporcionan comparaciones con otros sistemas de atribución de autoría.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 7,3B parámetros en bf16, lo que requiere aproximadamente 14,6 GB de VRAM solo para los pesos. Con overhead de activaciones y KV cache, se recomienda al menos 20 GB para inferencia con contexto moderado.
- GPU recomendadas: para una inferencia fluida, una GPU con 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G) es suficiente. Para procesamiento por lotes o contextos largos, se recomienda A100 (40 GB) o H100 (80 GB).
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo con 24 GB o más. Con cuantización a 4 bits (no proporcionada por el autor, pero posible mediante herramientas como llama.cpp o GPTQ), podría ejecutarse en GPUs de 8-12 GB, aunque no se ofrecen pesos cuantizados oficialmente.
- Opciones de despliegue: al ser un modelo safetensors estándar, puede cargarse con Hugging Face Transformers, vLLM, TGI o llama.cpp (si se convierte a GGUF). El código de puntuación específico está en el repositorio `Urdatorn/sphragis_models`.
- Latencia y throughput: no se han publicado mediciones. Para un modelo de 7B en bf16 en una RTX 4090, se puede esperar una latencia de decodificación de aproximadamente 20-40 ms/token, pero esto es una estimación general, no un dato del autor.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en el mismo nicho (atribución de autoría en griego antiguo con 7B parámetros). Como referencia, se puede comparar con el modelo base sin el ajuste autorial:

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| Urdatorn/sphragis-alm-olmo3-greek-7b-polybius | 7,3B | no disponible | Griego antiguo, autor Polibio | other |
| Urdatorn/olmo3-7b-ancient-greek | 7,3B | no disponible | Griego antiguo general | Apache-2.0 |
| allenai/Olmo-3-1025-7B | 7B | largo (no especificado) | Multilingue, razonamiento, codigo | Apache-2.0 |

La comparativa con otros sistemas de atribución de autoría (por ejemplo, métodos basados en n-gramas o SVMs) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo está entrenado exclusivamente sobre el corpus de Polibio (3.000 frases), por lo que su capacidad de generalización a otros autores o variedades del griego antiguo es limitada. No se han evaluado sesgos de género, dialecto o registro.
- Riesgo de alucinación: al ser un modelo de lenguaje causal, puede generar texto plausible pero no fiel al estilo real de Polibio si se usa para generación, aunque su propósito principal es la puntuación de perplejidad, no la generación.
- Limitaciones de contexto: no se especifica la longitud de contexto máxima; el entrenamiento usa una frase por secuencia, por lo que el modelo no está optimizado para procesar documentos completos de una sola vez.
- Restricciones de licencia: la licencia "other" impide el uso comercial sin verificar las licencias de las fuentes del dataset Sphragis, que incluyen material CC BY-NC-SA. Cualquier uso comercial requiere revisar `LICENSES.md` del dataset.
- Advertencia para producción: el modelo es una herramienta de investigación, no un producto. No se recomienda su uso en sistemas críticos sin una validación exhaustiva sobre el corpus objetivo.
- Dependencia del formato de entrada: la puntuación debe realizarse exactamente con el formato `<|endoftext|> sentence <|endoftext|>`; cualquier desviación puede degradar los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Urdatorn/sphragis-alm-olmo3-greek-7b-polybius
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Modelo base adaptado al griego antiguo: https://huggingface.co/Urdatorn/olmo3-7b-ancient-greek
- Repositorio de código (entrenamiento, puntuación, atribución): https://github.com/Urdatorn/sphragis_models
- Paper de referencia (Huang, Murakami y Grieve, 2025): PLoS ONE 20(7): e0327081 (DOI no proporcionado)
- Paper de OLMo 3: https://arxiv.org/abs/2512.13961
- Repositorio OLMo de AI2: https://github.com/allenai/OLMo
- Página de OLMo en AI2: https://allenai.org/olmo
