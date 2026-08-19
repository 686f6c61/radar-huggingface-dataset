# spadeMIA/pythia-2.8b-goodwiki-lora-r64

## Resumen

El modelo `spadeMIA/pythia-2.8b-goodwiki-lora-r64` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el SPADE Lab de la Universidad Koç (Turquía) sobre el modelo base `EleutherAI/pythia-2.8b`. Su propósito principal no es la generación de texto general, sino la investigación en inferencia de pertenencia (membership inference): determinar si un texto concreto formó parte del conjunto de entrenamiento del modelo. Este adaptador se publica como parte de un experimento controlado para estudiar la memorización y los riesgos de privacidad en modelos de lenguaje.

El adaptador se entrenó sobre un subconjunto del corpus `GoodWiki_Corpus_1024_2040`, compuesto por 10.000 documentos de Wikipedia filtrados por longitud (entre 1024 y 2039 tokens, más token EOS). La configuración LoRA utiliza un rango de 64, alpha de 128 y dropout de 0.05, aplicado a las capas de atención y feed-forward del modelo base. El resultado es un checkpoint de 0.3 GB que se carga como un adaptador PEFT sobre Pythia-2.8B.

Este modelo es relevante para la comunidad de investigación en privacidad y seguridad de modelos de lenguaje, ya que proporciona un caso de estudio reproducible sobre cómo el fine-tuning con LoRA afecta a la memorización de datos de entrenamiento. No está pensado para uso productivo ni para tareas de generación general, sino como herramienta experimental para medir la exposición de datos en modelos ajustados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Pythia-2.8B) con atención GQA y RoPE; adaptador LoRA |
| Parametros totales | 2.8B (modelo base) + adaptador LoRA de 0.3 GB (tamaño del repo) |
| Parametros activos | 2.8B (el adaptador LoRA añade parámetros entrenables, pero no se especifica el número exacto) |
| Longitud de contexto | 2048 tokens (del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors, sin cuantización adicional) |
| Idiomas soportados | No disponible (el corpus de entrenamiento es de Wikipedia, presumiblemente inglés, pero no se especifica) |
| Licencia | No disponible (el modelo base Pythia-2.8B es Apache 2.0, pero la licencia del adaptador no se indica) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base, Pythia-2.8B, es un transformer decoder-only de EleutherAI con 2.8 mil millones de parámetros, que emplea atención con GQA (Grouped Query Attention) y posiciones rotativas (RoPE). Fue entrenado sobre el dataset Pile, con una ventana de contexto de 2048 tokens. El adaptador LoRA se aplica a las capas `query_key_value`, `dense`, `dense_h_to_4h` y `dense_4h_to_h`, lo que cubre tanto la atención como las proyecciones del MLP.

El entrenamiento del adaptador se realizó con el dataset `spadeMIA/GoodWiki_Corpus_1024_2040`, usando la partición `train` con 10.000 documentos, todos marcados como "positivos" para membresía. La longitud de cada secuencia se limitó a 2048 tokens, con un rango observado de 1024 a 2039 tokens (media 1840.7, mediana 1926.0). Se emplearon 2 épocas, un learning rate constante de 0.0002 con warmup del 1%, batch efectivo de 32 (per-device batch 1, acumulación de gradientes 32), precisión bf16 con TF32 habilitado, gradient checkpointing y optimizador AdamW. No se realizó selección de checkpoints durante el entrenamiento; solo se guardó el adaptador final.

Una característica destacable es que la partición `test` del dataset se mantuvo aislada y no se cargó durante el entrenamiento, lo que permite evaluar la inferencia de pertenencia de forma controlada. El registro de pérdida de evaluación (monitorización) se hizo sobre `train[:50]`, pero sin influir en la selección del modelo.

## Capacidades

- Generación de texto: el adaptador hereda las capacidades del modelo base Pythia-2.8B, que puede generar texto coherente, aunque no está optimizado para tareas específicas más allá de la investigación.
- Razonamiento y conocimiento general: limitado al conocimiento del Pile (hasta 2023), con las limitaciones propias de un modelo de 2.8B.
- Codigo y matematicas: capacidades básicas, no especializadas.
- Soporte de tool calling: no disponible (el modelo base no fue entrenado para ello).
- Soporte de agentes: no disponible.
- Capacidades multilingues: no especificadas; el corpus de entrenamiento es de Wikipedia, probablemente en inglés.
- Capacidad especial: diseñado para experimentos de membership inference; el adaptador codifica información sobre los documentos de entrenamiento, lo que permite estudiar la memorización.

## Casos de uso

- Investigación en privacidad de modelos: el adaptador permite estudiar cómo el fine-tuning con LoRA afecta a la exposición de datos de entrenamiento. Los investigadores pueden ejecutar ataques de inferencia de pertenencia sobre este modelo y comparar con el modelo base sin ajustar.
- Evaluación de ataques de extracción de memoria: al conocer exactamente qué documentos se usaron en el entrenamiento (los 10.000 del split `train`), se puede medir la tasa de éxito de ataques de extracción y calibrar defensas.
- Benchmark de memorización en LoRA: sirve como referencia para comparar la memorización entre diferentes configuraciones de LoRA (rango, alpha, dropout) y otros métodos de fine-tuning.
- Desarrollo de técnicas de mitigación: probar mecanismos como el borrado de memoria (machine unlearning) o la regularización para reducir la memorización, usando este adaptador como caso de estudio.
- Reproducibilidad de experimentos: al estar publicados todos los hiperparámetros y el dataset, otros grupos pueden replicar el entrenamiento y verificar resultados.
- Docencia en seguridad de IA: como ejemplo práctico de los riesgos de privacidad en modelos de lenguaje, útil en cursos de aprendizaje automático y seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no está pensado para tareas estándar de NLP, sino para investigación de membership inference; no se reportan métricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: para cargar el modelo base de 2.8B en bf16 se necesitan aproximadamente 5.6 GB de VRAM (2 bytes por parámetro). El adaptador LoRA añade una cantidad mínima (0.3 GB en disco), pero en memoria ocupa menos. Con cuantización a 8 bits (por ejemplo, bitsandbytes) se puede reducir a ~3 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para inferencia en bf16 (por ejemplo, RTX 3070, RTX 4060 Ti, A10). Para entrenamiento del adaptador se necesitaría más memoria (se usó batch 1 con grad checkpointing, por lo que una GPU de 16 GB como RTX 4080 o A100 sería adecuada).
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo con 8 GB o más.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `peft` de Hugging Face sobre el modelo base. Para inferencia se puede usar `transformers` directamente o servidores como vLLM (aunque vLLM no soporta LoRA de forma nativa en todas las versiones, se puede usar con el adaptador cargado en memoria).
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de 2.8B en una GPU moderna, la latencia de generación suele estar en el rango de 20-50 ms por token, y el throughput en torno a 10-20 tokens/segundo en una RTX 4090.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores comparables publicados por el mismo laboratorio o con el mismo propósito. El modelo base Pythia-2.8B se puede comparar con otros modelos de tamaño similar como GPT-Neo-2.7B o OPT-2.7B, pero el adaptador es específico para investigación de privacidad y no tiene equivalentes directos en el ecosistema abierto.

## Limitaciones y advertencias

- No es un modelo de propósito general: está diseñado exclusivamente para experimentos de membership inference; su uso en tareas de generación o razonamiento producirá resultados mediocres.
- Sesgos y alucinaciones: hereda los sesgos del dataset Pile y del corpus GoodWiki; puede generar información falsa o estereotipada, como cualquier modelo de su tamaño.
- Riesgo de memorización: el adaptador ha sido entrenado explícitamente sobre documentos de Wikipedia, lo que aumenta la probabilidad de que reproduzca fragmentos de esos documentos si se le pide. Esto es intencional para la investigación, pero debe tenerse en cuenta.
- Licencia: no se especifica la licencia del adaptador; el modelo base es Apache 2.0, pero el usuario debe verificar los términos del adaptador antes de usarlo comercialmente.
- Contexto limitado: la ventana de 2048 tokens es corta para aplicaciones modernas; no soporta contextos largos.
- Idiomas: no se ha confirmado el soporte multilingüe; el corpus de entrenamiento es de Wikipedia, probablemente en inglés, por lo que el rendimiento en otros idiomas será limitado.
- Producción: no recomendado para entornos de producción debido a su naturaleza experimental y a la falta de benchmarks de calidad.

## Enlaces

- [Repositorio del adaptador en Hugging Face](https://huggingface.co/spadeMIA/pythia-2.8b-goodwiki-lora-r64)
- [Dataset de entrenamiento en Hugging Face](https://huggingface.co/datasets/spadeMIA/GoodWiki_Corpus_1024_2040)
- [Modelo base Pythia-2.8B en Hugging Face](https://huggingface.co/EleutherAI/pythia-2.8b)
- [Repositorio de Pythia en GitHub](https://github.com/EleutherAI/pythia)
- [Adaptador similar de Pythia-1.4B (SPADE Lab)](https://huggingface.co/spadeMIA/pythia-1.4b-goodwiki-lora-10k-r64-a128-ep2)
