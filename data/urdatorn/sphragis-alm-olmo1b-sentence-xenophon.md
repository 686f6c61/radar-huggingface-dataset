# Urdatorn/sphragis-alm-olmo1b-sentence-xenophon

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo1b-sentence-xenophon` es un modelo de lenguaje autoría (ALM, por sus siglas en inglés) desarrollado por Urdatorn como parte del benchmark Sphragis de atribución de autoría en griego antiguo. Se trata de un ajuste fino completo (further-pretraining) del modelo base `allenai/OLMo-1B-hf` sobre las filas de entrenamiento correspondientes al autor Jenofonte, con el objetivo de medir la perplejidad de oraciones y atribuir su autoría comparando la sorpresa que produce cada oración en 28 modelos especializados, uno por autor.

El modelo resuelve el problema de la atribución de autoría en textos clásicos griegos, un reto filológico tradicional, mediante un enfoque basado en la perplejidad de modelos de lenguaje, siguiendo la metodología de Huang, Murakami y Grieve (2025). Su relevancia actual radica en que ofrece una herramienta reproducible y abierta para la estilometría computacional, con un tamaño compacto de 1.176.764.416 parámetros (1,17B) que permite su ejecución en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-1B) |
| Parametros totales | 1.176.764.416 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada del modelo base OLMo-1B, no especificada en la documentacion) |
| Tipos de cuantizacion | bf16 (pesos publicados) |
| Idiomas soportados | griego antiguo (grc) |
| Licencia | other (derivada de fuentes con licencias mixtas, incluyendo CC BY-NC-SA) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura OLMo-1B, un transformer decoder-only con atención causal estándar, desarrollado por el Allen Institute for AI (AI2) como parte de su iniciativa de modelos de lenguaje completamente abiertos. Sobre esta base se realizó un further-pretraining completo (no un simple fine-tuning de cabezas) con el objetivo de modelar la distribución de oraciones de un único autor, Jenofonte.

El entrenamiento se llevó a cabo con un objetivo de modelado de lenguaje causal sobre secuencias de una sola oración, con el formato `<|endoftext|> sentence <|endoftext|>`. Se utilizaron 5.450 filas y 407.464 tokens puntuados de la partición `sentence_1` del dataset Sphragis. El número de épocas (4) y el modelo base (OLMo-1B vanilla o adaptado al griego) se seleccionaron mediante ascenso por coordenadas sobre la atribución de validación, priorizando la mejora en la tarea de atribución conjunta de los 28 modelos en lugar de la perplejidad individual del autor. El entrenamiento usó una tasa de aprendizaje de 5e-05 constante tras 25 pasos de calentamiento, un batch efectivo de 16 oraciones, precisión fp32 para los pesos maestros y bf16 para el cómputo, con FSDP completo en 2x GH200.

## Capacidades

- Generación de texto en griego antiguo condicionada al estilo de Jenofonte, aunque su uso principal no es la generación sino la evaluación de perplejidad.
- Cálculo de perplejidad por token para oraciones, que permite comparar la "sorpresa" de un texto dado entre distintos modelos de autor.
- Atribución de autoría: dado un texto, se puntúa con los 28 modelos del benchmark y se asigna al autor cuyo modelo produce menor perplejidad.
- No dispone de tool calling, function calling, capacidades multimodales ni soporte para agentes.
- Su capacidad multilingüe se limita al griego antiguo, y no está diseñado para tareas generales de NLP.

## Casos de uso

- Atribución de autoría en textos griegos antiguos de autoría dudosa: se puntúa cada oración con los 28 modelos del benchmark y se selecciona el autor con menor perplejidad media, lo que permite dirimir disputas filológicas sobre obras como las helénicas o la Anábasis.
- Análisis estilométrico cuantitativo: investigadores pueden usar la perplejidad del modelo como métrica de similitud estilística entre un texto anónimo y el corpus de Jenofonte, complementando métodos tradicionales como el análisis de frecuencias léxicas.
- Investigación en autenticidad de fragmentos: para evaluar si un fragmento recién descubierto es consistente con el estilo de Jenofonte, se compara su perplejidad con la de otros autores del benchmark.
- Entrenamiento de modelos de autoría en lenguas clásicas: sirve como punto de partida para desarrollar ALMs en otros autores o lenguas, dado que el código de entrenamiento y evaluación está disponible en GitHub.
- Evaluación de la influencia de la longitud del contexto en la atribución: el benchmark incluye particiones de 1, 5, 10 y 50 oraciones, y este modelo puede usarse para estudiar cómo mejora la precisión al aumentar el contexto.
- Docencia e investigación en humanidades digitales: permite a estudiantes y filólogos experimentar con técnicas de aprendizaje automático aplicadas a textos clásicos sin necesidad de grandes recursos computacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este modelo en la información disponible. La model card indica que el conjunto completo de 28 modelos alcanza los siguientes resultados de macro-F1 en el test de Sphragis:

| Particion | Macro-F1 |
|---|---|
| sentence_1 | 62.36 |
| sentence_5 | 86.84 |
| sentence_10 | 89.53 |
| sentence_50 | 92.44 |

Estos valores corresponden al rendimiento conjunto de los 28 ALMs, no a este modelo en particular. No se dispone de datos de MMLU, HumanEval u otros benchmarks generales, ya que el modelo no está orientado a tareas generales.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16, el modelo ocupa aproximadamente 2,35 GB (1.176.764.416 parámetros × 2 bytes). Con cuantización a 8 bits podría reducirse a ~1,2 GB, y a 4 bits a ~0,6 GB, aunque no se proporcionan pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en bf16 (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060). Para entrenamiento o fine-tuning adicional se requieren GPUs con más memoria, como las usadas en el desarrollo (2x GH200).
- Es viable en GPUs de consumo: sí, con 4-6 GB de VRAM es suficiente para inferencia.
- Opciones de despliegue: al ser un modelo HuggingFace estándar, puede servirse con vLLM, llama.cpp (si se convierte a GGUF), Ollama (con conversión previa) o TGI. También puede usarse directamente con la librería `transformers` de HuggingFace.
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de 1,17B en una GPU moderna, se espera una latencia de decodificación de decenas de milisegundos por token y un throughput de cientos de tokens por segundo, pero estos valores dependen del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| sphragis-alm-olmo1b-sentence-xenophon (este) | 1,17B | no disponible | other | Atribución de autoría en griego antiguo |
| sphragis-alm-olmo3-7b-xenophon | 7B | no disponible | other | Atribución de autoría en griego antiguo (versión mayor) |
| allenai/OLMo-1B-hf (base) | 1,17B | 2048 (según documentación de OLMo) | Apache-2.0 | Modelo de lenguaje general en inglés |

La comparativa se limita a la versión de 7B del mismo autor y al modelo base. No se dispone de datos de rendimiento individual para establecer una comparación cuantitativa. La versión de 7B probablemente ofrezca mejor precisión en atribución, pero requiere más recursos. El modelo base OLMo-1B no está especializado en griego antiguo ni en atribución de autoría.

## Limitaciones y advertencias

- Sesgo de autor: el modelo está entrenado exclusivamente con textos de Jenofonte, por lo que su capacidad de generalización a otros autores o géneros es nula fuera del contexto del benchmark.
- Riesgo de sobreajuste: al entrenar sobre un corpus reducido (407.464 tokens) y con solo 4 épocas, existe riesgo de que el modelo memorice patrones superficiales en lugar de aprender características estilísticas profundas.
- Alucinación: como modelo de lenguaje, puede generar texto plausible pero no fiable; no debe usarse para tareas de generación sin supervisión humana.
- Limitaciones de contexto: la longitud de contexto no está documentada y, dado el diseño de una oración por secuencia, no es adecuado para procesar documentos largos de una sola vez.
- Restricciones de licencia: la licencia `other` se debe a que los datos de entrenamiento incluyen material con licencia CC BY-NC-SA, lo que impide el uso comercial sin verificación adicional. Es imprescindible revisar el archivo `LICENSES.md` del dataset antes de cualquier reutilización.
- Idioma: solo griego antiguo; no soporta otros idiomas ni variantes modernas.
- Producción: no es un modelo de propósito general; su uso en aplicaciones productivas debe limitarse a tareas de atribución de autoría dentro del marco del benchmark Sphragis.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Urdatorn/sphragis-alm-olmo1b-sentence-xenophon
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Código de entrenamiento y evaluación: https://github.com/Urdatorn/sphragis_models
- Leaderboard del benchmark: https://huggingface.co/spaces/Urdatorn/sphragis-leaderboard
- Paper de referencia: Huang, Murakami y Grieve (2025), "Attributing authorship via the perplexity of authorial language models", PLoS ONE 20(7): e0327081. DOI no disponible en la información proporcionada.
- Repositorio OLMo (modelo base): https://github.com/allenai/OLMo
