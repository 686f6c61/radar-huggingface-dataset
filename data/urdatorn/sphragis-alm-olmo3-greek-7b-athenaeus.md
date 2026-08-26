# Urdatorn/sphragis-alm-olmo3-greek-7b-athenaeus

## Resumen

Sphragis authorial language model: Athenaeus es un modelo de lenguaje autoría (ALM) diseñado específicamente para la atribución de autoría en griego antiguo. Forma parte de un conjunto de diecisiete modelos, cada uno entrenado sobre las frases de un único autor del corpus Sphragis, siguiendo la metodología de Huang, Murakami y Grieve (2025) que atribuye la autoría mediante la perplejidad de modelos de lenguaje autorales. Este modelo concreto se entrenó sobre las 1.900 frases de Ateneo, con 221.469 tokens puntuados.

El modelo parte de Urdatorn/olmo3-7b-ancient-greek, una adaptación del modelo OLMo 3 de 7B parámetros al griego antiguo, y realiza un further-pretraining completo sobre las frases de entrenamiento de un solo autor. La arquitectura subyacente es un transformer denso de 7.298 millones de parámetros, con contexto largo según las especificaciones de OLMo 3, aunque la card no detalla la longitud exacta de contexto de esta variante.

La relevancia de este modelo reside en su aplicación a la estilometría y la autenticación de textos clásicos, un campo donde la atribución de autoría es un problema abierto. Al estar entrenado exclusivamente sobre un autor, su perplejidad diferencial permite discriminar entre autores con una precisión notable (macro-F1 de 0,800 en la validación de Sphragis). Es una herramienta de investigación, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (OLMo 3) con SwiGLU, normalización no paramétrica, embeddings rotatorios |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el base OLMo 3 soporta contexto largo, pero no se especifica para esta variante) |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | grc (griego antiguo) |
| Licencia | other (derivada de fuentes con licencias mixtas, incluyendo CC BY-NC-SA) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo se basa en OLMo 3, una familia de modelos totalmente abiertos de Ai2 con arquitectura transformer densa, activaciones SwiGLU, normalización de capas no paramétrica y embeddings rotatorios. Sobre esta base, Urdatorn realizó una adaptación previa al griego antiguo (olmo3-7b-ancient-greek) y posteriormente un further-pretraining específico para Ateneo.

El entrenamiento de este ALM consistió en modelado de lenguaje causal sobre secuencias de una sola frase con formato `<|endoftext|> sentence <|endoftext|>`. Se utilizó early stopping basado en la pérdida de validación del propio autor, con un máximo de 20 épocas y paciencia 3; el mejor resultado se obtuvo en la época 1.0 con una pérdida de validación de 0,9630 nats/token. El learning rate fue constante de 1e-05 tras 25 pasos de warmup, con batch efectivo de 16 frases. El entrenamiento se realizó en precisión mixta (fp32 para pesos maestros, bf16 para cómputo) con FSDP completo en 2x GH200.

A diferencia del método original de Huang y colaboradores que fijaba 100 épocas, aquí la duración se determina por evidencia de validación, lo que reduce el sobreajuste. El código de entrenamiento y evaluación está disponible en el repositorio GitHub Urdatorn/sphragis_models.

## Capacidades

- Atribución de autoría en griego antiguo: el modelo puntúa la perplejidad de frases y las atribuye al autor con menor sorpresa per-token.
- Modelado de lenguaje causal especializado: captura patrones léxicos, sintácticos y estilísticos propios de Ateneo.
- Evaluación de similitud estilística: puede comparar textos anónimos contra el estilo de Ateneo mediante log-verosimilitud.
- Integración en pipelines de atribución: diseñado para funcionar en conjunto con los otros dieciséis ALMs del benchmark Sphragis.
- Soporte de contexto de una frase: cada secuencia se procesa de forma independiente, lo que facilita la puntuación de fragmentos cortos.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo puramente generativo causal.

## Casos de uso

- Autenticación de manuscritos clásicos: dado un fragmento de texto griego antiguo de autoría dudosa, se puntúa con los diecisiete modelos y se atribuye al autor con menor perplejidad. Es adecuado porque el modelo fue entrenado específicamente para minimizar la sorpresa en el estilo de Ateneo.
- Análisis estilométrico de corpus: comparar la distribución de perplejidades entre diferentes secciones de un texto para detectar interpolaciones o cambios de autor.
- Investigación filológica: estudiar la evolución del estilo de Ateneo a lo largo de su obra, usando el modelo como medida de consistencia estilística.
- Verificación de atribuciones en ediciones críticas: contrastar hipótesis de autoría planteadas por filólogos con evidencia cuantitativa basada en modelos de lenguaje.
- Docencia en estilometría computacional: servir como ejemplo práctico de aplicación de ALMs a lenguas antiguas, con código reproducible y benchmark público.
- Benchmarking de métodos de atribución: el modelo forma parte del conjunto Sphragis, permitiendo comparar nuevas técnicas de atribución contra una referencia establecida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible más allá de los datos de validación del propio autor. Según la model card, el conjunto de diecisiete modelos alcanza un macro-F1 de 0,800 en la división de validación `sentence_1` de Sphragis. El mismo conjunto entrenado desde la base sin adaptación griega alcanza 0,812, lo que indica que la adaptación previa mejora la calidad del modelado del lenguaje pero no incrementa la capacidad discriminativa del conjunto. No se proporcionan resultados desglosados por autor ni comparaciones con otros métodos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 7.298 millones de parámetros en bf16, ocupa aproximadamente 14,6 GB en memoria (tamaño del repositorio). Para inferencia con batch pequeño se necesitan al menos 16 GB de VRAM.
- GPU recomendadas: una RTX 4090 (24 GB) o A100 40 GB son suficientes para inferencia en bf16. Para entrenamiento se usaron 2x GH200 con FSDP.
- Compatibilidad con GPUs de consumo: sí, cabe en RTX 3090/4090 con 24 GB sin cuantización. Con cuantización a 8 bits o 4 bits podría ejecutarse en GPUs de 12-16 GB, aunque no se proporcionan pesos cuantizados oficiales.
- Opciones de despliegue: al ser un modelo causal estándar, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. No hay integraciones específicas documentadas.
- Latencia y throughput: no disponibles. Para un modelo de 7B en una GPU moderna, se espera una latencia de decenas de milisegundos por token y un throughput de cientos de tokens por segundo con batching, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Urdatorn/sphragis-alm-olmo3-greek-7b-athenaeus | 7,3B | no disponible | ALM específico de autor (Ateneo) | other | HuggingFace |
| Urdatorn/olmo3-7b-ancient-greek | 7,3B | no disponible | Modelo base adaptado a griego antiguo | Apache-2.0 | HuggingFace |
| OLMo 3 7B (base) | 7B | largo (no especificado) | Modelo general multilingüe | Apache-2.0 | HuggingFace, Ai2 |

La comparativa se limita a los modelos de la misma familia. No se dispone de otros ALMs para griego antiguo con los que comparar directamente. La diferencia clave es que este modelo está especializado en un único autor, mientras que el base y OLMo 3 son de propósito general. La licencia `other` restringe su uso comercial debido a las fuentes del corpus Sphragis.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre un autor (Ateneo): su capacidad de generalización a otros autores o estilos es nula; solo es útil para atribución dentro del marco Sphragis.
- Riesgo de sobreajuste: aunque se usó early stopping, el conjunto de entrenamiento es muy reducido (1.900 frases), lo que puede limitar la robustez ante variaciones textuales.
- Licencia restrictiva: la licencia `other` impide su uso comercial sin verificar las licencias de las fuentes del dataset Sphragis (incluye material CC BY-NC-SA). No es apto para aplicaciones de producción sin revisión legal.
- Sin soporte para tareas generales: no genera texto coherente de propósito general, no sigue instrucciones, no realiza tool calling ni razonamiento multi-paso.
- Sesgo de corpus: el modelo refleja únicamente el estilo de Ateneo tal como aparece en el corpus Sphragis, que puede no ser representativo de toda su obra o de variantes dialectales.
- Alucinación: al ser un modelo causal entrenado en frases cortas, puede generar texto plausible pero no fiable fuera del contexto de puntuación de perplejidad.
- Idioma limitado: solo griego antiguo; no soporta otros idiomas ni griego moderno.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Urdatorn/sphragis-alm-olmo3-greek-7b-athenaeus
- Modelo base adaptado: https://huggingface.co/Urdatorn/olmo3-7b-ancient-greek
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Leaderboard Sphragis: https://huggingface.co/spaces/Urdatorn/sphragis-leaderboard
- Código de entrenamiento y evaluación: https://github.com/Urdatorn/sphragis_models
- Paper de referencia (Huang, Murakami y Grieve, 2025): PLoS ONE 20(7): e0327081
- Paper de OLMo 3: https://arxiv.org/abs/2512.13961
- Documentación de OLMo en Transformers: https://huggingface.co/docs/transformers/main/model_doc/olmo
- Repositorio OLMo de Ai2: https://github.com/allenai/OLMo
