# thealper2/flan-t5-small-sentence-compression

## Resumen

`flan-t5-small-sentence-compression` es un modelo de compresión de oraciones en inglés, desarrollado por thealper2 mediante un ajuste fino completo (full fine-tuning) del modelo `google/flan-t5-small`. El objetivo es reducir oraciones largas a versiones cortas, en estilo titular, manteniendo la información esencial. Está entrenado sobre el dataset `sentence-transformers/sentence-compression` como una tarea secuencia a secuencia, con el mapeo `text` → `simplified`.

El modelo utiliza la arquitectura T5 encoder-decoder (`T5ForConditionalGeneration`) y cuenta con 76.961.152 parámetros. La entrada se limita a 256 tokens y la salida a 64 tokens. Es un modelo pequeño y ligero, adecuado para tareas de compresión de texto en inglés, con licencia Apache-2.0. Su relevancia radica en que ofrece una solución específica y optimizada para comprimir frases de forma rápida, con un coste computacional bajo, lo que lo hace apto para integración en pipelines de procesamiento de lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 encoder-decoder (`T5ForConditionalGeneration`) |
| Parametros totales | 76.961.152 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (entrada) / 64 tokens (salida) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con Transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura T5, un transformer encoder-decoder preentrenado por Google. En este caso, se ha realizado un ajuste fino completo sobre `google/flan-t5-small`, sin adaptadores ni cuantización. El entrenamiento se llevó a cabo durante 3 épocas con el optimizador `adamw_torch_fused`, una tasa de aprendizaje de 0.0003 con schedule lineal y warmup del 5%, weight decay de 0.01, y precisión mixta BF16. El tamaño de batch efectivo fue de 32, con un total de 16.032 pasos de optimizador.

El dataset de entrenamiento proviene de `sentence-transformers/sentence-compression`, con 171.000 ejemplos de entrenamiento y 9.000 de validación. Se eliminaron 0 ejemplos por valores ausentes, vacíos o duplicados. La longitud media de la fuente es de 38.8 tokens, mientras que la del objetivo es de 11.2 tokens. El modelo fue entrenado con el prefijo obligatorio `compress sentence: `, que debe incluirse en la entrada durante la inferencia. No se aplicaron técnicas innovadoras más allá del ajuste fino estándar.

## Capacidades

- Compresión de oraciones en inglés: reduce frases largas a versiones cortas, con una media de 7.3 palabras de salida.
- Generación de texto condicionada por prefijo: requiere el formato `compress sentence: {texto}` para producir la salida.
- Razonamiento y conocimiento general: limitado, ya que es un modelo pequeño y especializado en una tarea concreta.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: solo inglés.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Generación de titulares de noticias: el modelo puede comprimir una oración de una noticia en un titular corto. Es adecuado porque produce salidas de 7-8 palabras, similares a los titulares reales, manteniendo las entidades principales.
- Optimización de descripciones para SEO: a partir de una descripción larga de producto, se puede generar una versión condensada para meta descripciones. El modelo reduce la longitud sin perder el núcleo de la información.
- Preprocesamiento para sistemas de recuperación de información: comprimir oraciones antes de indexarlas reduce el espacio de almacenamiento y puede mejorar la velocidad de búsqueda. Al ser un modelo ligero, se puede ejecutar en lote con recursos mínimos.
- Redacción de notificaciones push o SMS: a partir de un texto largo, se genera un mensaje corto apto para interfaces con límite de caracteres. La compresión media de 0.325 (palabras generadas por palabra fuente) garantiza una reducción significativa.
- Asistencia en accesibilidad: simplificar oraciones largas para personas con dificultades de lectura o comprensión. El modelo transforma frases complejas en enunciados breves, lo que facilita la lectura.
- Pre-condensación en pipelines de traducción automática: reducir la longitud de oraciones antes de traducir puede disminuir costes computacionales en modelos de traducción. El modelo actúa como un paso previo que conserva la información principal.

## Benchmarks y rendimiento

Los siguientes resultados son los declarados por el autor del modelo en la model card. Se obtuvieron sobre el split de validación (9.000 ejemplos) del dataset `sentence-transformers/sentence-compression`, con una retención del 5% del conjunto de entrenamiento (semilla 42). La generación se realizó con `num_beams=4`, `do_sample=False`, `max_new_tokens=64` y `no_repeat_ngram_size=3`. Las métricas ROUGE son medias por ejemplo de F1 (0-100) con stemming de Porter. No se han verificado de forma independiente.

| Metrica | Valor |
|---|---|
| ROUGE-1 | 77.68 |
| ROUGE-2 | 63.47 |
| ROUGE-L | 77.35 |

Comparativa con el modelo base `google/flan-t5-small` sobre el mismo subconjunto de 1.046 ejemplos de validación, con el mismo formato de entrada y parámetros de generación:

| Modelo | ROUGE-1 | ROUGE-2 | ROUGE-L | Media de palabras generadas | Ratio de compresion (palabras) |
|---|---|---|---|---|---|
| Base `google/flan-t5-small` | 47.11 | 29.83 | 46.44 | 21.14 | 0.874 |
| `flan-t5-small-sentence-compression` | 78.59 | 64.59 | 78.29 | 7.20 | 0.319 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.3 GB en BF16 y 0.6 GB en FP32, más overhead según el tamaño de batch y la configuración de generación. Para uso típico con batch pequeño, es suficiente con 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, A10). También es viable la ejecución en CPU para tareas de baja latencia.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en cualquier GPU de consumo actual. No requiere GPUs de centro de datos.
- Opciones de despliegue: Transformers (PyTorch), vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF) y Ollama (tras conversión).
- Latencia y throughput: no se dispone de datos de inferencia publicados. El autor reportó un throughput de entrenamiento de 199.2 muestras/s en una NVIDIA GeForce RTX 5060 Ti (15.9 GB), pero no hay métricas de inferencia.

## Comparativa con modelos similares

La única comparativa disponible en la información proporcionada es con el modelo base `google/flan-t5-small`, que es la alternativa más directa por arquitectura y tamaño. No se dispone de datos de otros modelos de compresión de oraciones.

| Modelo | Parametros | Contexto | Licencia | ROUGE-1 (validacion) | Disponibilidad |
|---|---|---|---|---|---|
| `google/flan-t5-small` | 76.961.152 | 512 tokens (base) | Apache-2.0 | 47.11 | HuggingFace |
| `flan-t5-small-sentence-compression` | 76.961.152 | 256 tokens (entrada) / 64 (salida) | Apache-2.0 | 77.68 | HuggingFace |

## Limitaciones y advertencias

- Solo soporta inglés; no es multilingüe.
- Las referencias del dataset son compresiones en estilo titular de noticias. Por tanto, las salidas siguen ese estilo, con una media de 7.3 palabras, lo que puede no ser adecuado para otros dominios.
- Las entradas de más de 256 tokens (incluido el prefijo) se truncan, perdiendo información.
- ROUGE mide solapamiento léxico con una única referencia, no la consistencia factual. El modelo puede generar compresiones que omitan o alteren detalles importantes.
- Es un modelo pequeño y especializado; su capacidad de razonamiento y generación general es limitada.
- La licencia del modelo es Apache-2.0, pero se debe verificar la licencia del dataset `sentence-transformers/sentence-compression` antes de un uso comercial.
- No soporta tool calling, agentes, visión ni audio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thealper2/flan-t5-small-sentence-compression
- Modelo base: https://huggingface.co/google/flan-t5-small
- Dataset de entrenamiento: https://huggingface.co/datasets/sentence-transformers/sentence-compression
