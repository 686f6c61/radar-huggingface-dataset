# Urdatorn/sphragis-alm-olmo1b-sentence-procopius

## Resumen

`sphragis-alm-olmo1b-sentence-procopius` es un modelo de lenguaje autoríal (authorial language model, ALM) desarrollado por Urdatorn (Albin Thörn Cleland) como parte del benchmark Sphragis de atribución de autoría para griego antiguo. Se trata de un ajuste fino completo (further-pretraining) del modelo base `allenai/OLMo-1B-hf` sobre los textos de un único autor, Procopio, con el objetivo de medir la perplejidad de sus oraciones y atribuir así la autoría de textos anónimos o disputados.

El modelo forma parte de un conjunto de 28 ALMs, uno por autor del corpus Sphragis, y sigue la metodología de Huang, Murakami y Grieve (2025) sobre atribución de autoría mediante perplejidad de modelos autoríales. Su relevancia radica en que es un caso práctico de aplicación de modelos de lenguaje abiertos a una tarea filológica especializada: la atribución de autoría en textos clásicos. Con 1.176.764.416 parámetros, es un modelo compacto que puede ejecutarse en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-1B) |
| Parametros totales | 1.176.764.416 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la del base OLMo-1B, 2048 tokens) |
| Tipos de cuantizacion | bf16 (pesos publicados); cuantizacion adicional no publicada |
| Idiomas soportados | griego antiguo (grc) |
| Licencia | other (derivada de fuentes con licencias mixtas, incluyendo CC BY-NC-SA) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-1B-hf` (revisión `aee7752d9c08ee4775e9b0091426d8410e8f6a89`), un transformer decoder-only de 1.170 millones de parámetros entrenado por el Allen Institute for AI (AI2) con datos completamente abiertos. Sobre esta base se realiza un further-pretraining completo (no un LoRA ni un adaptador) con objetivo de LM causal sobre secuencias formateadas como `<|endoftext|> sentence <|endoftext|>`, una oración por secuencia.

El entrenamiento se realizó con 2 épocas, learning rate constante de 5e-05 tras 25 pasos de warmup, batch efectivo de 16 oraciones, precisión fp32 para pesos maestros y bf16 para cómputo, con FSDP full shard sobre 2x GH200. La selección de épocas y modelo base se hizo mediante ascenso por coordenadas sobre la atribución de validación (macro-F1), no sobre la perplejidad del propio autor, porque lo que importa para la atribución es cuánto mejor ajusta el modelo a su autor en comparación con los demás modelos del conjunto.

## Capacidades

- Atribución de autoría: dado un texto en griego antiguo, el modelo calcula la perplejidad por token (negative log-likelihood) y permite compararla con la de otros 27 modelos autoríales del conjunto Sphragis para determinar qué autor resulta menos sorprendente.
- Modelado de lenguaje autoríal: captura patrones estilísticos y léxicos específicos de Procopio en griego antiguo.
- Generación de texto: al ser un LM causal, puede generar texto en griego antiguo con el estilo de Procopio, aunque este no es su propósito principal.
- Evaluación de similitud estilística: permite cuantificar la distancia estilística entre un texto anónimo y el corpus de Procopio.
- No soporta tool calling, ni agentes, ni razonamiento multi-paso, ni visión, ni audio.

## Casos de uso

- Atribución de autoría de textos griegos antiguos anónimos o disputados: el modelo se usa junto con los otros 27 ALMs del conjunto Sphragis para puntuar oraciones y atribuir la autoría al modelo que encuentre el texto menos sorprendente. Es el caso de uso principal para el que fue diseñado.
- Investigación filológica sobre el corpus de Procopio: permite estudiar la coherencia estilística interna de las obras atribuidas a Procopio y detectar posibles interpolaciones o secciones de autoría dudosa.
- Análisis estilométrico cuantitativo: investigadores en humanidades digitales pueden usar la perplejidad del modelo como métrica de similitud estilística entre textos, complementando métodos tradicionales como el análisis de frecuencia de palabras.
- Docencia e investigación en procesamiento de lenguaje para lenguas clásicas: sirve como ejemplo de aplicación de modelos de lenguaje a una lengua de baja disponibilidad de recursos (low-resource) como el griego antiguo.
- Replicación de estudios de atribución de autoría: el código de entrenamiento y puntuación está disponible en GitHub, lo que permite reproducir y extender los resultados del benchmark Sphragis.
- Comparación de metodologías de atribución: al ser uno de los 28 modelos del conjunto, permite estudiar cómo varía la eficacia de la atribución según el autor, la longitud del texto (sentence_1, sentence_5, sentence_10, sentence_50) y la elección de hiperparámetros.

## Benchmarks y rendimiento

El modelo no se evalúa de forma aislada, sino como parte del conjunto de 28 ALMs del benchmark Sphragis. Los resultados publicados en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| Test macro-F1 en sentence_1 (conjunto completo de 28 modelos) | 62.36 |
| Test macro-F1 en sentence_5 (conjunto completo de 28 modelos) | 86.84 |
| Test macro-F1 en sentence_10 (conjunto completo de 28 modelos) | 89.53 |
| Test macro-F1 en sentence_50 (conjunto completo de 28 modelos) | 92.44 |

No se han publicado resultados de benchmarks individuales para este modelo concreto (MMLU, HumanEval, GSM8K, etc.), ya que no es un modelo de propósito general sino una herramienta especializada en atribución de autoría.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16, el modelo ocupa aproximadamente 2,35 GB. Con overhead de activaciones y KV cache, se estima un consumo de 4-6 GB para inferencia con contexto corto (una oración).
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM. Es compatible con RTX 3060, RTX 4060, RTX 4090, A10, A100, etc.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna de gama media o alta.
- Opciones de despliegue: al ser un modelo OLMo en formato safetensors, puede cargarse con Hugging Face Transformers, vLLM, llama.cpp (si se convierte a GGUF) u Ollama (con conversión previa).
- Latencia y throughput: no se han publicado datos específicos. Para una oración de longitud media (50-100 tokens), la inferencia en una GPU consumer debería completarse en decenas de milisegundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| `Urdatorn/sphragis-alm-olmo1b-sentence-procopius` | 1,17 B | no disponible (2048 del base) | other | Atribución de autoría en griego antiguo |
| `Urdatorn/sphragis-alm-olmo3-greek-7b-herodotus` | 7 B | no disponible | other | Atribución de autoría en griego antiguo (autor: Heródoto) |
| `allenai/OLMo-1B-hf` | 1,17 B | 2048 | Apache-2.0 | Modelo base de propósito general en inglés |

La comparativa directa con otros modelos de atribución de autoría en griego antiguo no está disponible en la información proporcionada. El modelo se diferencia de su base OLMo-1B en que está especializado en un único autor y en una lengua clásica, y de la variante de 7B (basada en OLMo-3) en que es mucho más ligero y rápido de ejecutar, aunque presumiblemente con menor precisión en la atribución.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo se publica bajo licencia `other` debido a que los textos de entrenamiento provienen de fuentes con licencias mixtas, incluyendo material CC BY-NC-SA. Esto impide su uso comercial sin verificación previa de las licencias de los textos fuente (ver `LICENSES.md` del dataset Sphragis).
- Especialización extrema: el modelo solo es útil para textos de Procopio o estilísticamente muy cercanos. No es un modelo de propósito general y su rendimiento en otras tareas será pobre.
- Limitado a griego antiguo: no soporta otros idiomas, ni siquiera griego moderno.
- Riesgo de sobreajuste: al entrenarse sobre un único autor con solo 950 filas y 93.447 tokens puntuados, existe riesgo de sobreajuste a los textos concretos de entrenamiento, lo que podría afectar a la generalización a textos no vistos del mismo autor.
- Sin garantías de precisión: la atribución de autoría es una tarea intrínsecamente probabilística. El modelo no debe usarse como única evidencia para decisiones académicas o legales sobre autoría.
- Contexto limitado: la longitud de contexto heredada del modelo base (2048 tokens) puede ser insuficiente para analizar pasajes largos de una sola vez, aunque el diseño de puntuación por oraciones mitiga esta limitación.
- Fecha de creación futura: el modelo fue creado el 2026-08-27, lo que sugiere que es un proyecto reciente con posible evolución posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Urdatorn/sphragis-alm-olmo1b-sentence-procopius
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Codigo de entrenamiento y puntuacion: https://github.com/Urdatorn/sphragis_models
- Perfil del autor en HuggingFace: https://huggingface.co/Urdatorn
- Modelo base OLMo-1B: https://huggingface.co/allenai/OLMo-1B-hf
- Paper de referencia (Huang, Murakami y Grieve, 2025): PLoS ONE 20(7): e0327081
- Paper de OLMo: https://arxiv.org/html/2402.00838v1
