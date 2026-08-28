# Urdatorn/sphragis-alm-olmo1b-sentence-homeric-iliad

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo1b-sentence-homeric-iliad` es un modelo de lenguaje autorial (ALM, por sus siglas en inglés) desarrollado por Urdatorn como parte del benchmark Sphragis de atribución de autoría en griego antiguo. Sigue la metodología de Huang, Murakami y Grieve (2025), que atribuye la autoría de un texto comparando la perplejidad que distintos modelos de lenguaje especializados en un autor concreto asignan a dicho texto. Este modelo concreto se ha entrenado exclusivamente sobre las frases de la Ilíada de Homero, una de las 28 obras incluidas en el benchmark.

Se trata de un ajuste fino completo (further-pretraining) del modelo base `allenai/OLMo-1B-hf`, con 1.176.764.416 parámetros. El entrenamiento se realizó con un objetivo de modelado de lenguaje causal sobre secuencias formateadas como `<|endoftext|> sentence <|endoftext|>`, con una sola frase por secuencia. La elección del modelo base y del número de épocas se hizo mediante ascenso por coordenadas sobre la atribución de validación, por lo que este modelo puede partir del OLMo-1B original o de una versión adaptada al griego antiguo, según lo que resultara más eficaz.

La relevancia de este modelo reside en su uso como componente de un sistema de atribución de autoría reproducible y abierto para textos clásicos. No es un modelo de generación de propósito general, sino una herramienta de puntuación (scoring) diseñada para medir la verosimilitud de que un texto pertenezca a un autor concreto. Su publicación permite a investigadores en filología clásica, estilometría y procesamiento del lenguaje natural aplicar y extender la metodología de los ALM a otros corpus.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (OLMo-1B) |
| Parametros totales | 1.176.764.416 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | griego antiguo (grc) |
| Licencia | other (derivado de Apache-2.0 con restricciones por datos de entrenamiento) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura OLMo-1B de AllenAI, un transformer decoder-only con 1.176 millones de parámetros. Sobre esta base se realizó un ajuste fino completo (further-pretraining) utilizando únicamente las filas de entrenamiento correspondientes a la Ilíada de Homero dentro del benchmark Sphragis. El corpus de entrenamiento consta de 6.250 filas y 381.270 tokens puntuados de la división `sentence_1`.

El entrenamiento se llevó a cabo con un objetivo de modelado de lenguaje causal, formateando cada secuencia como `<|endoftext|> sentence <|endoftext|>`, con una frase por secuencia. Se emplearon 3 épocas, una tasa de aprendizaje de 5e-05 constante tras 25 pasos de calentamiento, y un tamaño de lote efectivo de 16 frases. La precisión se mantuvo en fp32 para los pesos maestros, con cómputo en bf16 y paralelismo FSDP completo sobre 2 GPU GH200. Los pesos finales se guardaron en bf16.

A diferencia del método original de Huang y colaboradores, que fijaba 100 épocas, aquí la duración del entrenamiento se seleccionó mediante evidencia de validación, optimizando directamente la macro-F1 de atribución sobre el conjunto de validación de los 28 modelos. Esto implica que el criterio de parada no es la perplejidad del propio autor, sino la capacidad discriminativa del modelo frente a los demás.

## Capacidades

- Atribución de autoría: dado un texto en griego antiguo, el modelo calcula la log-verosimilitud negativa por token, que se compara con la de otros 27 modelos autoriales para determinar el autor más probable.
- Modelado de lenguaje causal especializado en el estilo homérico de la Ilíada, capturando patrones léxicos, sintácticos y métricos propios de esta obra.
- Puntuación de frases individuales: el modelo está entrenado para evaluar frases completas, no documentos largos, lo que permite atribuciones a nivel de oración.
- Integración en pipelines de estilometría: puede usarse junto con los otros ALM del benchmark Sphragis para reproducir los resultados publicados.
- No incluye capacidades de generación de texto, tool calling, razonamiento multi-paso ni soporte de agentes, ya que su propósito es exclusivamente la evaluación de probabilidad.

## Casos de uso

- Investigación en atribución de autoría de textos griegos antiguos: el modelo permite determinar si un fragmento de la Ilíada es consistente con el estilo homérico, comparando su perplejidad con la de otros modelos autoriales. Es adecuado porque fue entrenado específicamente sobre las frases de esta obra.
- Análisis filológico de variantes textuales: al puntuar diferentes lecturas de un pasaje, se puede evaluar cuál es más coherente con el estilo del autor, ayudando en la crítica textual.
- Estudio de la evolución estilística dentro de la épica homérica: el modelo puede aplicarse a otros textos épicos para medir su cercanía estilística con la Ilíada, contribuyendo a debates sobre autoría y datación.
- Reproducción y extensión del benchmark Sphragis: los investigadores pueden descargar el modelo y el código asociado para replicar los resultados de atribución o ampliar el benchmark con nuevas obras.
- Comparación de metodologías de atribución: al ser un ALM de código abierto, permite contrastar el enfoque de perplejidad con otros métodos (análisis de frecuencia de palabras, redes neuronales, etc.) en el mismo corpus.
- Docencia en estilometría computacional: el modelo sirve como ejemplo práctico de cómo construir y evaluar modelos de lenguaje autorial, con un corpus pequeño y bien documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este modelo. La model card reporta el rendimiento colectivo de los 28 modelos del benchmark Sphragis sobre el conjunto de test, que se reproduce a continuación:

| Metrica | sentence_1 | sentence_5 | sentence_10 | sentence_50 |
|---|---|---|---|---|
| Macro-F1 | 62.36 | 86.84 | 89.53 | 92.44 |

Estos valores corresponden a la atribución conjunta de los 28 ALM, no a este modelo de forma aislada. No se dispone de datos de rendimiento por modelo individual en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 1.176.764.416 parámetros en bf16, lo que ocupa aproximadamente 2,35 GB solo en pesos. Con overhead de activaciones y memoria del framework, se recomienda al menos 4 GB de VRAM para inferencia en GPU.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM, por ejemplo NVIDIA GTX 1650, RTX 3050, RTX 4090, o GPUs de datacenter como A10, A100 o GH200. El entrenamiento original se realizó en 2x GH200, pero la inferencia es mucho menos exigente.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo con 4 GB o más, como la serie RTX 30/40 o incluso en CPU con suficiente RAM (el modelo en bf16 ocupa ~2,4 GB).
- Opciones de despliegue: al ser un modelo de HuggingFace en formato safetensors, puede cargarse con la librería `transformers` de Python. También es compatible con vLLM, llama.cpp (si se convierte a GGUF) y otras herramientas de inferencia que soporten OLMo.
- Latencia y throughput: no se dispone de datos medidos. Para una frase de longitud media (unos 20 tokens), la inferencia en una GPU moderna debería completarse en milisegundos, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| Urdatorn/sphragis-alm-olmo1b-sentence-homeric-iliad | 1,18 B | no disponible | other | Atribución de autoría (Ilíada) |
| Urdatorn/sphragis-alm-olmo3-7b-homeric-iliad | 7 B | no disponible | other | Atribución de autoría (Ilíada) |
| allenai/OLMo-1B-hf | 1,18 B | 2048 (según documentación de OLMo) | Apache-2.0 | Modelo base general |

La comparativa se limita a los modelos disponibles en la información proporcionada. El modelo de 7B es una variante del mismo autor con mayor capacidad, pero no se dispone de datos de rendimiento comparativo entre ambos. El modelo base OLMo-1B es el punto de partida, pero no está especializado en griego antiguo ni en atribución de autoría.

## Limitaciones y advertencias

- Licencia restrictiva: aunque el modelo base es Apache-2.0, el texto de entrenamiento proviene del benchmark Sphragis, cuyas fuentes incluyen material con licencia CC BY-NC-SA. Por ello, el modelo se distribuye bajo licencia `other`, lo que puede impedir su uso comercial. Es imprescindible revisar el archivo `LICENSES.md` del dataset antes de cualquier reutilización.
- Especialización extrema: el modelo solo ha visto frases de la Ilíada, por lo que su capacidad de generalización a otros textos o autores es nula. No debe usarse como modelo de lenguaje general.
- Riesgo de sobreajuste: al entrenarse sobre un corpus reducido (6.250 frases) durante 3 épocas, el modelo puede memorizar patrones específicos de la edición del texto utilizada, lo que podría sesgar las puntuaciones en otros contextos.
- Sin capacidad de generación: no está diseñado para producir texto, solo para calcular probabilidades. Intentar usarlo para generar griego antiguo dará resultados pobres.
- Dependencia del formato de entrada: la puntuación debe realizarse exactamente con el formato `<|endoftext|> sentence <|endoftext|>`, tal como se entrenó. Cualquier variación puede degradar el rendimiento.
- Sesgos del corpus: el texto de la Ilíada es una obra poética con características métricas y dialectales específicas; el modelo no es representativo del griego antiguo en general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Urdatorn/sphragis-alm-olmo1b-sentence-homeric-iliad
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Código de entrenamiento y puntuación: https://github.com/Urdatorn/sphragis_models
- Leaderboard del benchmark: https://urdatorn-sphragis-leaderboard.static.hf.space/index.html
- Modelo base OLMo-1B: https://huggingface.co/allenai/OLMo-1B-hf
- Paper de referencia: Huang, Murakami y Grieve (2025), "Attributing authorship via the perplexity of authorial language models", PLoS ONE 20(7): e0327081.
