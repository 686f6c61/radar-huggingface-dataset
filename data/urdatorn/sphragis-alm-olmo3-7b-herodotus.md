# Urdatorn/sphragis-alm-olmo3-7b-herodotus

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo3-7b-herodotus` es un modelo de lenguaje autorizado (ALM, por sus siglas en inglés) diseñado específicamente para la atribución de autoría en textos de griego antiguo. Forma parte del benchmark Sphragis, un conjunto de diecisiete modelos entrenados cada uno sobre las frases de un único autor clásico. Este modelo concreto se entrenó sobre las obras de Heródoto, con 5.900 frases y 624.910 tokens, siguiendo la metodología propuesta por Huang, Murakami y Grieve (2025) en su artículo sobre atribución de autoría mediante la perplejidad de modelos de lenguaje.

El modelo parte de la arquitectura `allenai/Olmo-3-1025-7B`, un transformer causal de 7.298 millones de parámetros desarrollado por el Allen Institute for AI (AI2). La relevancia de este modelo radica en su aplicación a un problema filológico y computacional complejo: la atribución de textos anónimos o disputados en el corpus clásico griego. Su enfoque, basado en la perplejidad comparada entre modelos autorales, ofrece una alternativa cuantitativa a los métodos estilométricos tradicionales. Además, el entrenamiento con detección temprana basada en pérdida de validación, en lugar de épocas fijas, constituye una innovación metodológica frente al trabajo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (Olmo-3) |
| Parámetros totales | 7.298.011.136 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Olmo-3 soporta contexto largo, pero no se especifica en esta versión) |
| Tipos de cuantización | No disponible (pesos publicados en bf16) |
| Idiomas soportados | Griego antiguo (grc) |
| Licencia | Other (derivada de licencias mixtas, incluye CC BY-NC-SA) |
| Formato de pesos | Safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo se basa en `allenai/Olmo-3-1025-7B`, un transformer causal de 7.000 millones de parámetros desarrollado por AI2, con una arquitectura optimizada para razonamiento de contexto largo, funciones de llamada y codificación, aunque esta versión se ha adaptado exclusivamente para la modelización del griego antiguo. El entrenamiento consistió en un *further pre-training* (continuación del preentrenamiento) sobre las frases de Heródoto del conjunto de entrenamiento Sphragm, con el objetivo de modelar la distribución de tokens específica de este autor.

Cada secuencia de entrenamiento se estructuró como `<|endoftext|> sentence <|endoftext|>`, y el objetivo fue minimizar la pérdida de lenguaje causal. La selección del mejor modelo se hizo mediante la pérdida en el conjunto de validación del propio autor, con una parada temprana de 20 épocas como máximo y paciencia de 3; el mejor modelo se obtuvo en la época 2.0, con una pérdida de validación de 1.0327 nats por token. El entrenamiento usó precisión mixta con pesos maestros en fp32 y cómputo en bf16, empleando FSDP con *full shard* sobre dos GPU GH200. Los pesos finales se guardaron en bf16. El método de puntuación consiste en calcular la perplejidad por token de cada frase y compararla entre los diecisiete modelos; la frase se atribuye al modelo que la encuentre menos sorprendente.

## Capacidades

- Generación de texto en griego antiguo, aunque su uso principal no es la generación sino la evaluación de perplejidad.
- Atribución de autoría: puede asignar una frase a uno de los diecisiete autores del benchmark Sph.
- Cálculo de perplejidad por token para frases individuales.
- Capacidad de comparación de perplejidad entre modelos autoría.
- No soporta tool calling, visión ni audio; es un modelo de lenguaje causal puro.
- Multilingüe limitado al griego antiguo (el modelo base es multilingüe, pero el fine-tuning lo restringe a esta lengua).

## Casos de uso

- Atribución de autoría de textos griegos antiguos: el modelo se usa para asignar una frase a un autor comparando su perplejidad con la de otros 16 modelos, lo que permite resolver disputas de autoría en el corpus clásico.
- Análisis estilométrico: investigadores en estilística computacional pueden utilizarlo para cuantificar la similitud estilística entre obras y autores.
- Verificación de autenticidad: en textos dudosos o fragmentarios, el modelo puede ayudar a determinar si un pasaje es consistente con el estilo de Heródoto frente a otros autores.
- Investigación en procesamiento del lenguaje antiguo: sirve como herramienta de referencia para el desarrollo de métodos de atribución en lenguas con corpus limitados.
- Validación de hipótesis filológicas: los filólogos pueden emplear la perplejidad del modelo como evidencia cuantitativa en debates sobre la autoría de obras como la *Vida de Homero* o el *Corpus Hippocraticum*.
- Benchmarking de métodos de atribución: el modelo y su conjunto Sphras pueden servir como punto de referencia para comparar nuevas técnicas de atribución automática de autoría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este modelo en la información disponible. Sin embargo, la model card indica que el conjunto completo de los diecisiete modelos alcanza un macro-F1 de 0.812 en el conjunto de validación `sentence_1` de Sphras. Este resultado refleja el rendimiento agregado del sistema de atribución, no del modelo individual.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16 (14.6 GB), se recomienda una GPU con al menos 16 GB de VRAM para cargar el modelo completo. Con cuantización de 8 bits (aproximadamente 7.3 GB) cabría en una GPU de 10-12 GB; con 4 bits (alrededor de 4 GB) en una GPU de 6-8 GB.
- GPU recomendadas: para inferencia con el modelo completo, una NVIDIA RTX 4090 (24 GB), A10G (22 GB) o A100 (40 GB) son suficientes. Para entrenamiento se utilizaron 2x GH200, pero no es necesario para la inferencia.
- Si cabe en GPU de consumo: sí, en una RTX 3090 (24 GB) o RTX 4090 (24 GB) se puede cargar sin cuantización; con cuantización 4-bit también en RTX 3060 (12 GB) o RTX 4060 (8 GB).
- Opciones de despliegue: se puede utilizar con librerías de inferencia como vLLM, llama.cpp (si se convierte a GGUF), o el propio `transformers` de Hugging Face. El código de scoring y atribución está disponible en el repositorio de GitHub.
- Latencia y throughput: no se especifican datos de latencia. Al ser un modelo de 7.3B, la inferencia de una frase de tamaño medio (50-100 tokens) en una GPU moderna debería completarse en milisegundos, aunque depende del hardware y de la implementación.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (modelos de atribución de autoría para griego antiguo). El modelo base `allenai/Olmo-3-1025-7B` es un modelo general de lenguaje que no está especializado en atribución de autoría ni en griego antiguo, por lo que no es comparable en esta tarea específica. No se han encontrado otros modelos de autoría para griego antiguo en la información proporcionada, por lo que se indica "no disponible".

## Limitaciones y advertencias

- Licencia restrictiva: el modelo se publica bajo la licencia `other` porque los datos de entrenamiento provienen de fuentes con licencias mixtas, incluyendo CC BY-NC-SA, lo que implica que el uso comercial no está permitido. Es necesario revisar el fichero `LICENSES.md` del dataset antes de cualquier reutilización.
- Sesgos de corpus: el modelo se ha entrenado exclusivamente con frases de Heródoto, por lo que su capacidad de atribución se limita a la comparación entre los 17 autores del conjunto Sphras; no puede atribuir textos de otros autores o épocas.
- Riesgo de alucinación: aunque el modelo es capaz de generar texto en griego antiguo, su propósito principal no es la generación, por lo que la calidad de las respuestas generadas puede ser baja y con tendencia a alucinaciones.
- Limitaciones de idioma: solo está entrenado en griego antiguo; no es útil para otros idiomas.
- Contexto limitado: la longitud de contexto no está especificada, pero el entrenamiento se realizó con una frase por secuencia, lo que sugiere que el modelo no está diseñado para contextos largos.
- Dependencia de la metodología: la eficacia en la atribución depende de la comparación con los otros 16 modelos del conjunto Sphras; el modelo individual no es suficiente para la tarea.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Urdatorn/sphragis-alm-olmo3-7b-herodotus
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Código de entrenamiento y evaluación: https://github.com/Urdatorn/sphragis_models
- Paper de referencia (Huang, Murakami y Grieve, 2025): no se ha encontrado un enlace directo en la información disponible.
- Paper de Olmo 3: https://arxiv.org/abs/2512.13961
- Página de Olmo de AI2: https://allenai.org/olmo
- Repositorio OLMo en GitHub: https://github.com/allenai/OLMo
