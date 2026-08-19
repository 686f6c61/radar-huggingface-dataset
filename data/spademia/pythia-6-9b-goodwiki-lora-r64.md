# spadeMIA/pythia-6.9b-goodwiki-lora-r64

## Resumen

El modelo `spadeMIA/pythia-6.9b-goodwiki-lora-r64` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el SPADE Lab de la Universidad Koç (Turquía) como parte de una línea de investigación sobre *membership inference* en modelos de lenguaje. Se basa en el modelo `EleutherAI/pythia-6.9b`, un transformer decoder-only de 6.900 millones de parámetros entrenado por EleutherAI sobre el corpus The Pile. El adaptador se entrenó sobre 10.000 documentos del dataset `GoodWiki_Corpus_1024_2040` (fragmentos de Wikipedia en inglés de entre 1024 y 2039 tokens), todos etiquetados como miembros del conjunto de entrenamiento.

El propósito de este artefacto no es servir como modelo de propósito general, sino como herramienta de investigación para estudiar la memorización de datos y los ataques de inferencia de pertenencia. Su relevancia radica en que permite analizar cómo un ajuste fino con LoRA sobre un modelo de 6.9B puede memorizar fragmentos concretos de texto, un aspecto crítico para la privacidad en el despliegue de LLMs. El adaptador es extremadamente ligero (0,5 GB) y se distribuye en formato safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Pythia-6.9B) + LoRA |
| Parámetros totales | 6.900 millones (modelo base) + ~67 millones (adaptador LoRA, estimado) |
| Parámetros activos | 6.900 millones (el adaptador añade pesos entrenables, pero la inferencia usa todos) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | No disponible (el adaptador se distribuye en bf16; el modelo base admite cuantizaciones GGUF/AWQ de terceros) |
| Idiomas soportados | Inglés (principal, por el corpus de entrenamiento) |
| Licencia | No disponible para el adaptador; el modelo base es Apache 2.0 |
| Formato de pesos | safetensors (adaptador) |

## Arquitectura y entrenamiento

El modelo base, Pythia-6.9B, es un transformer causal estándar con 32 capas, atención multi-cabeza y embedding de 4096 dimensiones, entrenado sobre 300.000 millones de tokens de The Pile. El adaptador LoRA se añade a las capas `query_key_value`, `dense`, `dense_h_to_4h` y `dense_4h_to_h` con rango 64, alpha 128 y dropout 0,05. El entrenamiento se realizó durante 2 épocas con una tasa de aprendizaje constante de 0,0002, warmup del 1%, batch efectivo de 32 y precisión bf16. El dataset de entrenamiento contiene exactamente 10.000 documentos, todos marcados como pertenecientes al conjunto de entrenamiento (membership-positive), con longitudes de secuencia entre 1024 y 2039 tokens (media 1840,7). No se utilizó ningún split de validación para selección de checkpoints; solo se registró la pérdida de evaluación sobre 50 muestras del propio train.

La innovación técnica no reside en la arquitectura (LoRA es un método estándar), sino en el diseño experimental: al entrenar únicamente sobre datos positivos de membresía, el modelo se convierte en un caso de estudio para medir la capacidad de memorización y los riesgos de extracción de datos. El entrenamiento no incluyó RLHF ni DPO; es un ajuste fino supervisado simple.

## Capacidades

- Generación de texto: el modelo base Pythia-6.9B es capaz de generar texto coherente en inglés, aunque su rendimiento en tareas complejas es inferior a modelos más modernos.
- Memorización de datos de entrenamiento: el adaptador está diseñado para memorizar los 10.000 documentos de Wikipedia utilizados, lo que permite estudiar la extracción de secuencias exactas o casi exactas.
- Membership inference: facilita la investigación sobre si un texto dado perteneció al conjunto de entrenamiento, mediante análisis de pérdida o logits.
- No soporta tool calling, agentes ni razonamiento multi-paso de forma nativa; estas capacidades no fueron entrenadas ni evaluadas.
- Multilingüismo limitado: aunque Pythia fue entrenado con algo de multilingüismo en The Pile, el corpus GoodWiki es exclusivamente inglés, por lo que el adaptador no mejora (ni degrada) el rendimiento en otros idiomas.

## Casos de uso

- Investigación en privacidad de LLMs: el adaptador permite reproducir experimentos de membership inference y medir la tasa de éxito de ataques basados en pérdida, zlib o min-K% prob sobre un modelo de 6.9B.
- Auditoría de memorización: al conocer exactamente los documentos de entrenamiento, los investigadores pueden verificar si el modelo reproduce fragmentos verbatim y bajo qué condiciones (longitud, frecuencia, etc.).
- Estudio de la influencia del rango LoRA: comparar con otros adaptadores del mismo laboratorio (p. ej., r16) para entender cómo el rango afecta la memorización.
- Desarrollo de defensas contra extracción de datos: los resultados obtenidos con este adaptador pueden servir para diseñar técnicas de mitigación (p. ej., redacción, desduplicación, DP-SGD).
- Evaluación de métricas de privacidad: sirve como banco de pruebas para validar nuevas métricas de riesgo de memorización en modelos ajustados con PEFT.
- Docencia e investigación reproducible: al ser un artefacto pequeño y de código abierto (dataset y script de entrenamiento disponibles), es adecuado para cursos de seguridad y privacidad en IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este adaptador en la información disponible. El modelo base Pythia-6.9B tiene resultados conocidos (p. ej., MMLU ~25,9%, HellaSwag ~73,3%, según EleutherAI), pero el adaptador no fue evaluado en tareas estándar, ya que su objetivo no es el rendimiento downstream sino la memorización. Por tanto, no se proporcionan tablas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en bf16 requiere aproximadamente 14 GB de VRAM, más el adaptador (insignificante). Con cuantización de 8 bits (bitsandbytes) se reduce a ~7 GB; con 4 bits a ~4 GB.
- GPU recomendadas: para fp16/bf16 completo, una NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB). Para cuantización 4 bits, una RTX 3060 (12 GB) o superior es suficiente.
- El adaptador por sí solo no requiere GPU; solo es útil cargado junto al modelo base.
- Opciones de despliegue: se puede usar con la librería `peft` de Hugging Face para cargar el adaptador sobre el modelo base. También es compatible con vLLM y TGI si se fusionan los pesos LoRA en el modelo base (no recomendado para investigación).
- Latencia y throughput: no se han medido para este adaptador; en una A100, el modelo base 6.9B en fp16 genera típicamente entre 20 y 40 tokens/s con batch 1, pero estos valores son orientativos y dependen de la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| spadeMIA/pythia-6.9b-goodwiki-lora-r64 | 6.9B + LoRA r64 | 2048 | No disponible | Investigación de membership inference |
| spadeMIA/pythia-1.4b-goodwiki-lora-r16-a64 | 1.4B + LoRA r16 | 2048 | No disponible | Investigación de membership inference (mismo laboratorio) |
| EleutherAI/pythia-6.9b (base) | 6.9B | 2048 | Apache 2.0 | Modelo de investigación general |

La comparativa se limita a los modelos del mismo laboratorio y al modelo base, ya que no hay otros adaptadores públicos con el mismo objetivo. La diferencia principal entre el adaptador r64 y el r16 (del modelo 1.4B) es el tamaño del modelo base y el rango LoRA, lo que permite estudiar el efecto de la capacidad del modelo y del rango en la memorización.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base Pythia hereda sesgos de The Pile (texto de internet, posible contenido ofensivo); el adaptador no los corrige.
- Riesgo de alucinación: no se ha evaluado; al ser un modelo de 6.9B de 2023, su calidad de generación es inferior a modelos actuales.
- Limitaciones de contexto: ventana fija de 2048 tokens, insuficiente para documentos largos.
- Restricciones de licencia: el adaptador no especifica licencia; el modelo base es Apache 2.0, pero el dataset GoodWiki puede tener términos propios. Para uso comercial, se debe contactar con el autor.
- Adecuación para producción: no es apto para aplicaciones reales; es un artefacto de investigación y su uso fuera de ese ámbito no tiene sentido.
- Sobreajuste: entrenado en solo 10.000 documentos, el adaptador está fuertemente sobreajustado a esos datos, lo que degrada su generalización.
- Privacidad: el propio propósito del modelo es memorizar datos; su uso en producción podría exponer información del corpus de entrenamiento.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/spadeMIA/pythia-6.9b-goodwiki-lora-r64
- Dataset de entrenamiento: https://huggingface.co/datasets/spadeMIA/GoodWiki_Corpus_1024_2040
- Modelo base (EleutherAI/pythia-6.9b): https://huggingface.co/EleutherAI/pythia-6.9b
- Repositorio de Pythia (GitHub): https://github.com/EleutherAI/pythia
- Adaptador hermano (1.4B r16): https://huggingface.co/spadeMIA/pythia-1.4b-goodwiki-lora-r16-a64
