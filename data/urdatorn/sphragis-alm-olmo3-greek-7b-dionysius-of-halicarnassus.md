# Urdatorn/sphragis-alm-olmo3-greek-7b-dionysius-of-halicarnassus

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo3-greek-7b-dionysius-of-halicarnassus` es un modelo de lenguaje autorial (ALM) diseñado para la atribución de autoría en griego antiguo. Forma parte del benchmark Sphragis, que incluye diecisiete modelos similares, cada uno entrenado sobre las frases de un autor clásico distinto. Este modelo concreto se ha especializado en la obra de Dionisio de Halicarnaso, un historiador y retórico griego del siglo I a.C.

El modelo parte de `Urdatorn/olmo3-7b-ancient-greek`, una adaptación al griego antiguo del modelo OLMo3 de 7 mil millones de parámetros, y se somete a un further-pretraining completo sobre 800 frases de entrenamiento del autor (150.082 tokens puntuados). La metodología sigue el trabajo de Huang, Murakami y Grieve (2025), que propone atribuir autoría comparando la perplejidad de distintos modelos autoriales sobre una misma frase. La relevancia actual radica en su aplicación a la filología digital y a la autenticación de textos clásicos, un campo con demanda creciente de herramientas automáticas rigurosas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo3) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | grc (griego antiguo) |
| Licencia | other (derivada de fuentes con licencias mixtas, incluye CC BY-NC-SA) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura OLMo3, un transformer decoder-only de 7 mil millones de parámetros, adaptado previamente al griego antiguo mediante un fine-tuning del modelo base `Urdatorn/olmo3-7b-ancient-greek`. Sobre esta base, se realiza un further-pretraining completo con un objetivo de modelado de lenguaje causal, donde cada secuencia contiene una única frase del autor envuelta entre tokens especiales `<|endoftext|>`. El entrenamiento utiliza una pérdida de validación como criterio de selección de la mejor época, con un máximo de 20 épocas y paciencia de 3, deteniéndose de forma temprana en la época 1.0 con una pérdida de validación de 0.8512 nats/token.

El proceso de entrenamiento emplea una tasa de aprendizaje constante de 1e-05 tras 25 pasos de warmup, un batch efectivo de 16 frases, y precisión mixta con pesos maestros en fp32 y cómputo en bf16, utilizando FSDP con sharding completo sobre dos GPUs GH200. A diferencia del enfoque original de Huang y colaboradores, que fijaba 100 épocas, aquí la duración se determina por evidencia held-out, lo que reduce el sobreajuste y mejora la generalización del modelo autorial.

## Capacidades

- Atribución de autoría: el modelo puntúa la perplejidad de frases en griego antiguo, permitiendo asignar un texto a su autor probable entre un conjunto de candidatos.
- Modelado de lenguaje en griego antiguo: genera y evalúa texto clásico con una distribución de probabilidad ajustada al estilo de Dionisio de Halicarnaso.
- Scoring por perplejidad: calcula la log-verosimilitud negativa por token, métrica clave para comparar entre modelos autoriales.
- Especialización estilística: captura patrones léxicos, sintácticos y retóricos propios del autor, gracias al entrenamiento exclusivo sobre sus frases.
- Integración en pipelines de atribución: puede combinarse con los otros dieciséis modelos del benchmark Sphragis para clasificar textos completos.
- Soporte de evaluación en validación: el modelo incluye un split de validación propio que permite medir su rendimiento de forma reproducible.

## Casos de uso

- Atribución de autoría de textos anónimos o disputados: dado un fragmento en griego antiguo, se calcula su perplejidad con este modelo y con los otros dieciséis del benchmark; el autor cuyo modelo produzca menor sorpresa es el candidato más probable. Es adecuado porque el modelo está entrenado específicamente para minimizar la perplejidad en el estilo de Dionisio de Halicarnaso.
- Análisis estilométrico de obras completas: se pueden segmentar obras extensas en frases y puntuar cada una con el modelo, obteniendo un perfil de similitud estilística con el autor. Esto permite estudiar variaciones internas o detectar interpolaciones.
- Verificación de autenticidad de fragmentos atribuidos: al comparar la perplejidad de un fragmento dudoso contra la distribución de perplejidades de las frases de entrenamiento, se puede evaluar si el texto es consistente con el estilo del autor.
- Investigación filológica sobre Dionisio de Halicarnaso: el modelo sirve como herramienta de consulta para estudiar patrones de uso de partículas, estructuras de frase o preferencias léxicas del autor, facilitando análisis cuantitativos.
- Entrenamiento de sistemas de atribución automática: el modelo puede usarse como componente base para desarrollar clasificadores más complejos que combinen perplejidad con otras características textuales, mejorando la precisión en corpus extensos.
- Docencia y divulgación en humanidades digitales: permite a estudiantes e investigadores experimentar con técnicas de atribución de autoría sobre textos clásicos, utilizando un modelo de código abierto y reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este modelo en la informacion disponible. Sin embargo, el conjunto completo de diecisiete modelos autoriales alcanza una macro-F1 de 0.800 en el split de validación `sentence_1` del benchmark Sphragis. El mismo conjunto entrenado desde la base no adaptada al griego antiguo obtiene 0.812, lo que indica que la adaptación lingüística previa mejora la calidad del modelado de lenguaje sin aumentar la capacidad discriminativa del conjunto. No se dispone de métricas adicionales como MMLU, HumanEval o GSM8K, ya que el modelo está orientado a una tarea específica de atribución.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16-18 GB en bf16 (14,6 GB de pesos más overhead de activaciones y caché), según estimación para un modelo de 7B denso.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o A100 de 40 GB es suficiente para inferencia en bf16; también puede ejecutarse en GPUs con 16 GB usando cuantización a 8 bits o 4 bits, aunque no se proporcionan pesos cuantizados en el repositorio.
- Compatibilidad con GPUs de consumo: sí, cabe en tarjetas de 24 GB como la RTX 4090, y con cuantización podría ejecutarse en GPUs de 16 GB como la RTX 4080 o RTX 3090.
- Opciones de despliegue: al estar en formato safetensors, puede cargarse con la librería `transformers` de HuggingFace, o servirse con vLLM o TGI para inferencia de alto rendimiento. Para entornos con menos recursos, se podría convertir a GGUF y usar llama.cpp u Ollama, aunque no se incluyen dichos formatos en el repositorio.
- Latencia y throughput: no se han publicado mediciones específicas. Para un modelo de 7B en una GPU moderna, se espera una latencia de decodificación de decenas de milisegundos por token y un throughput de cientos de tokens por segundo con batching, pero estos valores son orientativos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (modelos autoriales para griego antiguo) dentro de los datos proporcionados. El enfoque más cercano es el de Huang, Murakami y Grieve (2025), que utiliza modelos autoriales basados en arquitecturas más pequeñas (probablemente LSTM o transformers de menor escala), pero no se ofrecen detalles de comparación directa con este modelo. Tampoco se conocen otros modelos públicos de atribución de autoría para griego antiguo con los que establecer una tabla comparativa.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo se distribuye bajo licencia `other` debido a que el texto de entrenamiento proviene de fuentes con licencias mixtas, incluyendo material CC BY-NC-SA. Esto impide el uso comercial sin verificación adicional de los términos de cada fuente.
- Corpus de entrenamiento limitado: solo 800 frases y 150.082 tokens de un único autor, lo que puede provocar sobreajuste al estilo específico de Dionisio de Halicarnaso y limitar la generalización a otros géneros o épocas del griego antiguo.
- Sesgo de autor: al estar entrenado exclusivamente sobre un autor, el modelo no es adecuado para tareas generales de generación de texto en griego antiguo; su uso fuera de la atribución de autoría puede producir resultados poco representativos.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar texto plausible pero incorrecto si se utiliza de forma generativa, aunque su propósito principal es la puntuación de perplejidad, no la generación.
- Dependencia del preprocesado: la puntuación de frases debe realizarse exactamente con el mismo formato de entrenamiento (con tokens `<|endoftext|>`), de lo contrario los resultados de perplejidad no serán comparables.
- Sin soporte multilingüe: el modelo solo maneja griego antiguo; no puede procesar otros idiomas ni realizar tareas como tool calling, razonamiento o visión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Urdatorn/sphragis-alm-olmo3-greek-7b-dionysius-of-halicarnassus
- Modelo base adaptado al griego antiguo: https://huggingface.co/Urdatorn/olmo3-7b-ancient-greek
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Código de entrenamiento y scoring: https://github.com/Urdatorn/sphragis_models
- Artículo de referencia (Huang, Murakami y Grieve, 2025): PLoS ONE 20(7): e0327081, "Attributing authorship via the perplexity of authorial language models"
