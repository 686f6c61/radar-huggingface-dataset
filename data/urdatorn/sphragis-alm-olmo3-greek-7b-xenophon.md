# Urdatorn/sphragis-alm-olmo3-greek-7b-xenophon

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo3-greek-7b-xenophon` es uno de los diecisiete modelos de lenguaje autorial (ALM, por sus siglas en inglés) desarrollados por Urdatorn para el benchmark Sphragis de atribución de autoría en griego antiguo. Sigue la metodología propuesta por Huang, Murakami y Grieve (2025) en su artículo "Attributing authorship via the perplexity of authorial language models", publicada en PLoS ONE. Cada ALM se obtiene mediante un further-pretraining completo del modelo base `Urdatorn/olmo3-7b-ancient-greek` (una adaptación al griego antiguo de OLMo 3 7B de Ai2) sobre las frases de entrenamiento de un único autor del corpus Sphragis. Este modelo concreto está entrenado exclusivamente con las frases de Jenofonte, con 5.400 frases y 656.162 tokens puntuados de la división `sentence_1`.

La relevancia de este modelo radica en su propósito específico: la atribución de autoría mediante la perplejidad. En lugar de ser un modelo de propósito general, está diseñado para puntuar la verosimilitud de una frase según el estilo de un autor concreto, de modo que una frase se atribuye al autor cuyo modelo la encuentra menos sorprendente. El conjunto de diecisiete modelos alcanza un macro-F1 de 0,800 en la división de validación de Sphragis, lo que demuestra su eficacia para la tarea. El modelo tiene 7.298.011.136 parámetros (aproximadamente 7,3 mil millones) y se distribuye en formato safetensors con pesos en bf16, ocupando 14,6 GB en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo 3 7B, adaptado al griego antiguo) |
| Parametros totales | 7.298.011.136 (7,3 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No publicados; pesos originales en bf16 |
| Idiomas soportados | Griego antiguo (grc) |
| Licencia | Other (derivado de Apache-2.0, pero con restricciones por fuentes CC BY-NC-SA) |
| Formato de pesos | Safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de `Urdatorn/olmo3-7b-ancient-greek`, que a su vez es una adaptación al griego antiguo de OLMo 3 7B, la familia de modelos completamente abiertos de Ai2. OLMo 3 está diseñado para razonamiento de contexto largo, function calling, codificación, seguimiento de instrucciones y recuperación de conocimiento, aunque en este caso el modelo se especializa exclusivamente en modelado de lenguaje causal sobre texto en griego antiguo.

El entrenamiento de este ALM consiste en un further-pretraining completo sobre las frases de Jenofonte extraídas del corpus Sphragis. El objetivo es modelado de lenguaje causal con secuencias de una sola frase, con el formato `<|endoftext|> sentence <|endoftext|>`. La duración del entrenamiento se determina por early stopping basado en la pérdida de validación del propio autor: se selecciona la época con menor pérdida en las frases de validación de Sphragis, con un máximo de 20 épocas y paciencia de 3. En este caso, la mejor época fue la 1.0, con una pérdida de validación de 0,8425 nats/token. Se usó una tasa de aprendizaje constante de 1e-05 tras 25 pasos de calentamiento, un lote efectivo de 16 frases, precisión mixta con pesos maestros en fp32 y cómputo en bf16, y paralelismo FSDP con sharding completo en dos GPU GH200. A diferencia del enfoque original de Huang y colegas, que fijaban 100 épocas, aquí la duración se elige por evidencia retenida, lo que evita el sobreajuste.

## Capacidades

- Modelado de lenguaje causal especializado en el estilo de Jenofonte: calcula la log-verosimilitud negativa por token de cualquier frase en griego antiguo, lo que permite medir la "sorpresa" de una frase según el estilo del autor.
- Atribución de autoría: al comparar la puntuación de una frase contra los otros dieciséis modelos del conjunto Sphragis, se puede atribuir la autoría al modelo que encuentre la frase menos sorprendente.
- Generación de texto en el estilo de Jenofonte: aunque no es su propósito principal, al ser un modelo de lenguaje causal puede generar texto coherente imitando el estilo del autor.
- No soporta tool calling, function calling, ni capacidades multimodales o de razonamiento multi-paso; su alcance se limita al modelado de lenguaje sobre griego antiguo.
- Capacidad multilingüe: no aplica, está entrenado únicamente en griego antiguo.

## Casos de uso

- Atribución de autoría en textos griegos antiguos: el caso de uso principal. Dado un texto o fragmento de autoría dudosa, se puntúa cada frase con los diecisiete modelos del conjunto Sphragis y se atribuye al autor cuyo modelo obtenga menor perplejidad agregada. Es adecuado para investigaciones filológicas y estudios de autenticidad de obras clásicas.
- Análisis estilométrico cuantitativo: los investigadores pueden utilizar las puntuaciones de perplejidad de este modelo como una medida objetiva de la similitud estilística entre un texto anónimo y el corpus de Jenofonte, complementando métodos tradicionales de estilometría.
- Verificación de autoría en corpus digitales: en proyectos de digitalización de textos clásicos, este modelo puede ayudar a detectar atribuciones erróneas o interpolaciones en manuscritos, comparando la perplejidad de pasajes concretos contra el modelo de Jenofonte.
- Entrenamiento de modelos autoriales para otros autores: el código y la metodología publicados en el repositorio `Urdatorn/sphragis_models` permiten replicar el proceso para crear ALMs de otros autores griegos antiguos, usando este modelo como referencia de implementación.
- Evaluación de la adaptación al griego antiguo: al comparar el rendimiento de este modelo (entrenado desde la base adaptada) con el de modelos entrenados desde la base no adaptada, se puede estudiar el impacto de la adaptación lingüística previa en tareas de atribución de autoría.
- Generación de texto de estilo clásico para entornos educativos: aunque no es el uso previsto, el modelo puede generar pasajes breves en el estilo de Jenofonte para materiales didácticos de griego antiguo, siempre que se respeten las restricciones de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este modelo, ya que no es un modelo de propósito general. El único dato de rendimiento disponible es el correspondiente al conjunto completo de diecisiete ALMs en la tarea de atribución de autoría sobre la división de validación `sentence_1` de Sphragis:

| Metrica | Valor |
|---|---|
| Macro-F1 (conjunto de 17 ALMs, base adaptada al griego) | 0,800 |
| Macro-F1 (conjunto de 17 ALMs, base no adaptada) | 0,812 |

El modelo individual alcanzó una pérdida de validación de 0,8425 nats/token en las frases de validación de Jenofonte, con la mejor época en la 1.0 de un máximo de 20.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 14,6 GB, por lo que se necesitan al menos 16 GB de VRAM para cargar el modelo sin cuantización. Con cuantización a 8 bits o 4 bits (no publicada oficialmente, pero posible con herramientas como llama.cpp o GPTQ), la huella podría reducirse a unos 8-4 GB.
- GPU recomendadas: una GPU con 24 GB de VRAM (RTX 3090, RTX 4090, A5000) es suficiente para inferencia en bf16. Para entrenamiento o fine-tuning adicional, se requieren GPUs de datacenter como A100 o H100, o varias GPUs con FSDP.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs consumer de gama alta (24 GB) sin cuantización, y en GPUs de 16 GB con cuantización.
- Opciones de despliegue: al ser un modelo en formato safetensors, se puede servir con vLLM, TGI, o cargar directamente con Hugging Face Transformers. Para entornos con menos VRAM, se puede convertir a GGUF y usar llama.cpp u Ollama.
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de 7B en bf16 en una RTX 4090, se puede esperar una latencia de decodificación de aproximadamente 20-40 ms por token y un throughput de 50-100 tokens/s, aunque estos valores son estimaciones orientativas basadas en modelos similares.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Urdatorn/sphragis-alm-olmo3-greek-7b-xenophon | 7,3 B | No disponible | Atribución de autoría (griego antiguo) | Other (CC BY-NC-SA) | Hugging Face |
| Urdatorn/olmo3-7b-ancient-greek (base) | 7,3 B | No disponible | Modelo de lenguaje general en griego antiguo | Apache-2.0 | Hugging Face |
| Modelos ALM de Huang et al. (2025) | Variable (no especificado) | No disponible | Atribución de autoría (inglés) | No especificada | No publicados |

La comparativa directa con otros ALMs del mismo conjunto Sphragis (los otros dieciséis modelos autoriales) no se incluye aquí porque comparten la misma arquitectura y solo difieren en el autor de entrenamiento. El modelo base `Urdatorn/olmo3-7b-ancient-greek` es la alternativa más cercana para tareas generales de procesamiento de griego antiguo, pero carece de la especialización estilística de este ALM. Los modelos de Huang et al. (2025) son el referente metodológico, pero no están disponibles públicamente.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo es útil para tareas de atribución de autoría o modelado de estilo de Jenofonte. No sirve para tareas generales de NLP, chat, razonamiento o generación de código.
- Riesgo de sobreajuste: aunque el early stopping mitiga el sobreajuste, el modelo se entrenó con solo 5.400 frases de un único autor, por lo que su capacidad de generalización a textos fuera del corpus Sphragis es limitada.
- Sesgos del corpus: el texto de entrenamiento proviene de Sphragis, cuyas fuentes tienen licencias mixtas, incluyendo material CC BY-NC-SA. Esto impone restricciones de uso comercial y de redistribución, y el modelo se libera bajo licencia "other" en lugar de Apache-2.0.
- Limitaciones de idioma: el modelo solo comprende griego antiguo; no es útil para otros idiomas ni para griego moderno.
- Alucinación y generación: al ser un modelo de lenguaje causal, puede generar texto gramaticalmente plausible pero históricamente inexacto o inventado. No debe usarse para generar citas o pasajes atribuidos a Jenofonte sin verificación.
- Sin soporte de contexto largo confirmado: no se ha especificado la longitud de contexto soportada, y el entrenamiento se realizó con secuencias de una sola frase, por lo que su rendimiento en pasajes largos no está garantizado.
- Dependencia del conjunto de modelos: la atribución de autoría requiere ejecutar los diecisiete modelos del conjunto Sphragis; este modelo por sí solo no puede atribuir autoría, solo puntuar la verosimilitud de una frase.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Urdatorn/sphragis-alm-olmo3-greek-7b-xenophon
- Modelo base (adaptación al griego antiguo): https://huggingface.co/Urdatorn/olmo3-7b-ancient-greek
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Repositorio de código (entrenamiento, puntuación y atribución): https://github.com/Urdatorn/sphragis_models
- Paper de OLMo 3 (arXiv): https://arxiv.org/abs/2512.13961
- Paper de Huang, Murakami y Grieve (2025), PLoS ONE 20(7): e0327081: no disponible en los resultados de búsqueda, pero referenciado en la model card.
