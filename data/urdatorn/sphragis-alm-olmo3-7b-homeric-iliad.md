# Urdatorn/sphragis-alm-olmo3-7b-homeric-iliad

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo3-7b-homeric-iliad` es un modelo de lenguaje autorazial (ALM) desarrollado por Urdatorn para el benchmark Sphragis de atribución de autoría en griego antiguo. Forma parte de un conjunto de diecisiete modelos, cada uno entrenado exclusivamente sobre las frases de un autor o obra clásica; este en concreto se ha ajustado con 6.200 frases de la Ilíada de Homero (592.967 tokens puntuados). Su propósito es resolver una tarea muy concreta: dada una frase en griego antiguo, determinar cuál de los diecisiete autores es el más probable comparando la perplejidad entre los modelos.

El modelo parte de la arquitectura del modelo base `allenai/Olmo-3-1025-7B`, un transformer de 7.3 mil millones de parámetros, y se somete a un entrenamiento adicional (further pretraining) con el objetivo de modelar la distribución de las frases de la Ilíada. La metodología sigue el artículo de Huang, Murakami y Grieve (2025), que propone atribuir autoría mediante la perplejidad de modelos de lenguaje autoraziales. Su relevancia radica en la aplicación de técnicas modernas de PLN a la filología clásica, ofreciendo una herramienta objetiva y cuantitativa para la atribución de textos anónimos o fragmentarios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (basado en OLMo-3-7B) |
| Parámetros totales | 7.298.011.136 |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (el modelo base OLMo-3-1025-7B usa contexto de 1024 tokens, pero no se especifica para este ajuste) |
| Tipos de cuantización | no disponible (los pesos se publican en bf16) |
| Idiomas soportados | griego antiguo (grc) (entrenamiento específico; el modelo base es multilingüe) |
| Licencia | other (derivada de Apache-2.0 con datos de entrenamiento bajo licencias mixtas, incluyendo CC BY-NC-SA) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer del modelo OLMo-3-1025-7B de Ai2, un decoder-only entrenado sobre el corpus Dolma 3. Para este modelo autorazial, se realiza un *further pretraining* completo sobre las frases de la Ilíada contenidas en el split `sentence_1` del dataset Sphragis. El entrenamiento utiliza una secuencia por frase con el formato `<|endoftext|> sentence <|endoftext|>`, con objetivo de lenguaje causal. La selección de la mejor época se hace mediante la pérdida de validación en las frases de validación de este mismo autor; se detiene con paciencia 3 sobre un máximo de 20 épocas, y la mejor época resultó ser la 2.0 con una pérdida de validación de 1.0721 nats/token.

El proceso de entrenamiento emplea precisión mixta: pesos maestros en fp32, cómputo en bf16, y paralelización con FSDP *full shard* en dos GPU NVIDIA GH200. El learning rate es constante de 1e-05 tras 25 pasos de *warmup*, con un batch efectivo de 16 frases. A diferencia del trabajo original de Huang et al., que fija 100 épocas, aquí se elige la longitud del entrenamiento basándose en evidencia de validación, lo que resultó en detenerse en la época 2 o 3 para todos los modelos del conjunto.

## Capacidades

- **Atribución de autoría en griego antiguo**: la función principal es puntuar la perplejidad de una frase y compararla con los otros dieciséis modelos del conjunto Sphragis para decidir el autor más probable.
- **Generación de texto en estilo homérico**: aunque no es su propósito principal, al estar entrenado con frases de la Ilíada, puede generar texto que imite el estilo épico griego.
- **Modelado de lenguaje causal**: capacidad de calcular la probabilidad de una secuencia token por token, lo que permite calcular la *negative log-likelihood* para una frase dada.
- **Multilingüismo limitado**: el entrenamiento específico se realizó solo en griego antiguo; el modelo base es multilingüe, pero este ajuste reduce su competencia general en otros idiomas.
- **No soporta tool calling ni instrucciones**: es un modelo de lenguaje puro sin entrenamiento de instrucciones ni capacidades de agente.

## Casos de uso

- **Investigación académica en filología clásica**: los investigadores pueden usar este modelo para atribuir fragmentos anónimos o textos de dudosa autoría comparando la perplejidad con los otros ALMs del conjunto. Por ejemplo, dado un papiro fragmentario, se calcula la probabilidad de cada frase bajo cada modelo y se selecciona el de menor pérdida.
- **Análisis estilométrico de la épica homérica**: permite cuantificar la distancia estilística entre la Ilíada y otras obras del corpus Sphragis, contribuyendo a estudios sobre la autoría múltiple o la evolución del estilo épico.
- **Herramienta educativa para griego antiguo**: integrable en plataformas de aprendizaje de lenguas clásicas para mostrar cómo un modelo de lenguaje puede identificar el estilo de un autor.
- **Digital humanities**: puede incorporarse en pipelines de análisis de textos antiguos, junto con herramientas de lematización y análisis sintáctico, para enriquecer estudios cuantitativos sobre literatura griega.
- **Generación de texto de estilo épico**: aunque no es el objetivo, el modelo puede usarse para generar pasajes en estilo homérico, útil para recreaciones educativas o experimentos creativos.
- **Validación de técnicas de atribución de autoría**: sirve como banco de pruebas para comparar metodologías de atribución automática en lenguas con poco recursos digitales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) para este modelo, ya que no es un modelo de propósito general. El único dato de rendimiento disponible es el conjunto de los diecisiete modelos del benchmark Sphragis, que alcanzan un macro-F1 de 0.812 en la validación `sentence_1` cuando se utilizan en conjunto para atribuir autoría. No se proporcionan resultados individuales para este modelo específico.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con pesos en bf16 (2 bytes por parámetro), el modelo ocupa aproximadamente 14,6 GB (tamaño del repositorio). Para una inferencia en bf16 se necesita una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 3080 Ti, RTX 3090, RTX 4090, A10G, L4). Con cuantización 4-bit (no publicada oficialmente) se podría reducir a unos 4 GB, pero no se ofrecen pesos cuantizados.
- **GPU recomendadas**: el entrenamiento se realizó en 2× NVIDIA GH200 (cada una con 120 GB de memoria). Para inferencia, una GPU de 24 GB (RTX 3090/4090) es suficiente para bf16; para mayor comodidad, una A100 de 40 GB o H100 de 80 GB.
- **Compatibilidad con GPU de consumo**: sí, una RTX 3080 o superior con 16-24 GB puede ejecutar el modelo en bf16. Con cuantización 4-bit, incluso una RTX 4060 con 8 GB podría funcionar, aunque no se dispone de los pesos cuantizados.
- **Opciones de despliegue**: el modelo se puede cargar con la biblioteca Transformers de Hugging Face. Para inferencia de producción, se puede usar vLLM, TGI o llama.cpp (si se convierten los pesos a GGUF), aunque no se han publicado versiones cuantizadas.
- **Latencia y throughput**: no se han publicado datos específicos. Para un modelo de 7B en bf16 en una GPU moderna, se espera una latencia de decodificación de unos 20-30 ms/token y un throughput de 5-10 tokens/s en tareas de generación, pero estos valores son orientativos y dependen del hardware y la optimización.

## Comparativa con modelos similares

No hay disponibles modelos comparables de atribución de autoría en griego antiguo con los mismos datos de entrenamiento y metodología. El modelo base `allenai/Olmo-3-1025-7B` es el único punto de referencia directo, pero no es específico para atribución de autoría. Otros modelos de lenguaje para griego antiguo, como `jplu/greek-bert` o `nlpaueb/bert-base-greek`, son de menor tamaño y no están diseñados para atribución de autoría. Por tanto, la comparativa se limita a:

| Modelo | Parámetros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| Sphragis ALM (este) | 7.3B | no disponible | Atribución de autoría en grc | other |
| OLMo-3-1025-7B (base) | 7.3B | 1024 | Modelo general | Apache-2.0 |
| gpt-base-greek (base) | 110M | 1024 | Modelo general | Apache-2.0 |

La comparación con el modelo base es la más relevante: este modelo se diferencia por su especialización en la Ilíada, mientras que el base es de propósito general. No hay datos de rendimiento comparativo entre ambos en la tarea de atribución.

## Limitaciones y advertencias

- **Especialización extrema**: el modelo solo es útil para la atribución de autoría en textos griegos antiguos, y específicamente para distinguir entre los diecisiete autores del corpus Sphragis. No es un modelo de propósito general y su rendimiento en otras tareas es deficiente.
- **Sesgo de entrenamiento**: se entrenó únicamente con 6.200 frases de la Ilíada, lo que puede limitar la representatividad de la variedad estilística de Homero y provocar sesgos hacia construcciones sintácticas específicas.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar texto gramaticalmente plausible pero incorrecto históricamente o estilísticamente, especialmente fuera del ámbito de la Ilíada.
- **Limitación de contexto**: al entrenar con secuencias de una sola frase, el modelo no tiene capacidad para manejar dependencias de largo alcance entre frases, lo que puede afectar su rendimiento en textos con discurso continuo.
- **Licencia restrictiva**: la licencia `other` se debe a la inclusión de material CC BY-NC-SA en los datos de entrenamiento. Esto impide el uso comercial sin una revisión cuidadosa de los términos de cada fuente. Cualquier reutilización debe consultar el archivo `LICENSES.md` del dataset Sphragis.
- **Sin soporte de cuantización**: no se publican pesos cuantizados (GGUF, AWQ, etc.), lo que dificulta el despliegue en hardware de gama baja.
- **Sin garantías de reproducibilidad**: el entrenamiento depende del estado de validación de Sphragis; si el dataset cambia, los resultados pueden variar.

## Enlaces

- [HuggingFace: Urdatorn/sphragis-alm-olmo3-7b-homeric-iliad](https://huggingface.co/Urdatorn/sphragis-alm-olmo3-7b-homeric-iliad)
- [Dataset Sphragis](https://huggingface.co/datasets/Urdatorn/sphragis)
- [Código de entrenamiento y puntuación (GitHub)](https://github.com/Urdatorn/sphragis_models)
- [Modelo base: allenai/Olmo-3-1025-7B](https://huggingface.co/allenai/Olmo-3-1025-7B)
- [Artículo de referencia: Huang, Murakami, Grieve (2025)](https://doi.org/10.1371/journal.pone.0327081)
