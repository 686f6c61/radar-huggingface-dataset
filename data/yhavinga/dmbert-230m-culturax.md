# yhavinga/dmbert-230m-culturax

## Resumen

dmbert-230m-culturax es un codificador (encoder) monolingüe de neerlandés basado en la arquitectura ModernBERT, desarrollado por yhavinga. Se trata de un modelo base preentrenado desde cero con modelado de lenguaje enmascarado (MLM) sobre la porción neerlandesa del corpus CulturaX, que reúne aproximadamente 161 000 millones de tokens procesados en dos pasadas sobre el corpus, con secuencias de hasta 1024 tokens. El entrenamiento se llevó a cabo con JAX/Flax sobre una Cloud TPU v4-32.

El modelo cuenta con 230 110 592 parámetros reales (el recuento del Hub muestra unos 263 millones porque la matriz de embeddings de entrada, atada a la capa de salida, se almacena dos veces). Su arquitectura ModernBERT combina pre-normalización, embeddings posicionales rotatorios (RoPE), activaciones GeGLU, ausencia de términos de sesgo en el encoder y atención alterna local/global, lo que lo hace adecuado como extractor de representaciones para tareas de comprensión del neerlandés.

Es relevante porque cubre un hueco concreto: un encoder neerlandés moderno, de tamaño medio y entrenado específicamente sobre un corpus neerlandés grande y deduplicado, con licencia Apache 2.0 y pesos en safetensors, listo para fine-tuning en clasificación, etiquetado de tokens, question answering extractivo o recuperación. No es un modelo generativo ni de chat: es una base para ajuste supervisado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT: encoder Transformer pre-norm, RoPE, GeGLU, sin sesgos, atención alterna local/global |
| Parámetros totales | 230 110 592 (el Hub muestra ~263 M por duplicación de la matriz atada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | entrenado a 1024 tokens; `max_position_embeddings` = 8192 (límite arquitectónico, no longitud entrenada) |
| Tipos de cuantización | no disponible (pesos publicados en float32; cuantización no documentada) |
| Idiomas soportados | neerlandés (nl) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) |

Detalles adicionales de arquitectura: 22 capas, hidden size 1024, 16 cabezas de atención (tamaño de cabeza 64), intermediate size 1536. Atención global en cada tercera capa (capas 0, 3, …, 21); el resto usa ventana deslizante de 128 tokens. Base RoPE de 160 000 en capas globales y 10 000 en capas locales. Cabeza MLM: capa densa, GELU y LayerNorm, seguida del decodificador atado con sesgo.

## Arquitectura y entrenamiento

El modelo es un encoder Transformer puro de tipo ModernBERT, no un modelo generativo ni un modelo híbrido SSM. Las innovaciones arquitectónicas respecto a BERT clásico incluyen pre-normalización, embeddings posicionales rotatorios en lugar de posiciones absolutas aprendidas, activaciones GeGLU, eliminación de términos de sesgo en el encoder y un esquema de atención alterna que intercala capas con atención global (cada tercera capa) y capas con ventana deslizante local de 128 tokens, lo que reduce el coste computacional en secuencias largas.

El preentrenamiento se realizó con modelado de lenguaje enmascarado sobre la configuración `nl` del dataset uonlp/CulturaX (revisión `6a8734bc69fefcbb7735f4f9250f43e4cd7a442e`), que contiene 117 392 666 documentos y 80 700 millones de tokens con este tokenizador. CulturaX combina mC4 (versión 3.1.0) con los corpus OSCAR de 20.19 a 23.01, limpiados y deduplicados. Se hicieron dos pasadas sobre el corpus, en total unos 161 000 millones de tokens, con secuencias de hasta 1024 tokens, usando JAX/Flax sobre Cloud TPU v4-32. No se documenta en la información disponible el uso de RLHF, DPO ni objetivos adicionales más allá del MLM.

El tokenizador es `yhavinga/dutch-llama-tokenizer`: SentencePiece BPE de tipo Llama (`LlamaTokenizerFast`) con byte fallback y 32 000 tokens, extendido con `<mask>` (id 32 000) y 127 tokens sin uso hasta 32 128 entradas, que es el tamaño de la matriz de embeddings. Los identificadores especiales relevantes son `<unk>` = 0, `<s>` (BOS/CLS) = 1, `</s>` (EOS/SEP) = 2, `<pad>` = 20 277 y `<mask>` = 32 000.

## Capacidades

- Relleno de máscaras (fill-mask): predice el token enmascarado en texto neerlandés; en el ejemplo de la model card, "Amsterdam is de<mask>van Nederland." devuelve `hoofdstad` con 0,996 de probabilidad.
- Extracción de representaciones contextuales para clasificación de secuencias (análisis de sentimiento, detección de tópicos, filtrado de spam).
- Etiquetado de tokens (NER, POS, chunking) tras fine-tuning con cabeza de token classification.
- Question answering extractivo sobre pares pregunta-contexto, con soporte de ventanas solapadas (`return_overflowing_tokens`).
- Recuperación de información y ranking (retrieval, reranking) mediante embeddings o fine-tuning con objetivos de similitud.
- Similitud semántica de pares de frases (evaluado en SICK-NL según la model card).
- Tokenización con offsets de caracteres exactos (`return_offsets_mapping=True`), útil para alinear predicciones con texto original.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento: es un encoder, no un modelo generativo.
- Capacidad multilingüe limitada al neerlandés; no se documenta transferencia a otros idiomas.

## Casos de uso

- Clasificación de documentos neerlandeses en producción: fine-tuning de `AutoModelForSequenceClassification` con `max_length=1024` para categorizar tickets, correos o artículos; el tamaño de 230 M parámetros permite servir el modelo en CPU o GPU modestas con latencia baja.
- Reconocimiento de entidades nombradas en neerlandés: ajuste con cabeza de token classification sobre textos de hasta 1024 tokens, aprovechando los offsets exactos del tokenizador para mapear entidades a posiciones del texto original.
- Question answering extractivo sobre base documental: pares pregunta-contexto con ventanas solapadas para localizar la respuesta en fragmentos largos; adecuado para asistentes de documentación interna en neerlandés.
- Filtrado de contenido y moderación: clasificador binario de toxicidad o spam entrenado sobre el encoder, con truncación configurable (`truncation_side="left"` por defecto, modificable a `"right"`).
- Recuperación semántica y reranking: generar embeddings de pasajes y consultas para un motor de búsqueda neerlandés, o ajustar el modelo como reranker sobre candidatos recuperados por BM25.
- Análisis de reseñas y encuestas: clasificación multi-etiqueta de opiniones de clientes neerlandeses, con truncación a la izquierda para conservar el cierre del texto, que suele concentrar la conclusión.
- Etiquetado de datos para otros pipelines: uso del modelo como anotador automático (por ejemplo, preetiquetado de corpus para entrenar modelos mayores o para revisión humana).

## Benchmarks y rendimiento

La información disponible menciona una evaluación en SICK-NL (pares de frases) y el ejemplo de fill-mask de la model card, pero no se publican tablas de resultados numéricos de benchmarks estándar (MMLU, HumanEval, GSM8K, GLUE-nl, etc.) en la información proporcionada.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 1 GB para los 230 M parámetros (0,92 GB solo de pesos, más activaciones y overhead del runtime).
- En float16/bfloat16: aproximadamente 0,5 GB de pesos; en cuantización de 8 bits: unos 0,25 GB; en 4 bits: unos 0,13 GB (estimaciones por tamaño, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para inferencia en fp32; RTX 3060, RTX 4090, A100 o H100 son más que suficientes y permiten lotes grandes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante con 4 GB o más); también es viable en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, TGI y vLLM para encoder no están documentados específicamente; llama.cpp y Ollama no aplican de forma estándar a un encoder MLM. El entrenamiento original usó JAX/Flax, pero los pesos publicados son safetensors consumibles desde transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, la inferencia por secuencia de 1024 tokens debería situarse en el orden de milisegundos en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dmbert-230m-culturax | 230 M | 1024 entrenado (8192 arquitectónico) | nl | Apache 2.0 | Hugging Face, safetensors |
| BERTje (wietsedv/bert-base-dutch-cased) | ~109 M | 512 | nl | no disponible en esta ficha | Hugging Face |
| RobBERT (pdelobelle/robbert-v2-dutch-base) | ~117 M | 512 | nl | no disponible en esta ficha | Hugging Face |
| Multilingual BERT / XLM-R base | ~278 M | 512 | multilingüe | no disponible en esta ficha | Hugging Face |

La comparación de rendimiento numérico entre estos modelos no está disponible en la información proporcionada. Frente a BERTje y RobBERT, dmbert-230m-culturax duplica aproximadamente el número de parámetros y eleva la longitud de secuencia entrenada a 1024 tokens, además de incorporar las mejoras arquitectónicas de ModernBERT (RoPE, GeGLU, atención alterna). Frente a XLM-R base, pierde cobertura multilingüe pero gana especialización en neerlandés y mayor longitud de contexto entrenada.

## Limitaciones y advertencias

- Modelo base: no está ajustado para ninguna tarea concreta; requiere fine-tuning supervisado para uso productivo.
- Longitud entrenada de 1024 tokens: aunque `max_position_embeddings` es 8192, el modelo no fue entrenado a esa longitud, por lo que el rendimiento más allá de 1024 tokens no está garantizado.
- Sensibilidad al formato de la máscara: escribir `<mask>` con espacios alrededor (`de <mask> van`) produce ids distintos de los vistos en preentrenamiento y degrada las predicciones (según la model card, `hoofdstad` cae de la primera a la 31.ª posición). Es necesario enmascarar sin espacios o a nivel de id de token.
- Truncación a la izquierda por defecto en el tokenizador: conserva el final del texto; hay que cambiarla explícitamente si se necesita el inicio.
- Monolingüe: solo neerlandés; no se documenta rendimiento en otros idiomas ni capacidades de traducción.
- Riesgo de alucinación: al ser un encoder MLM, no genera texto libre, pero las predicciones de fill-mask pueden ser plausibles y factualmente incorrectas; no deben usarse como fuente de verdad.
- Sesgos: no se documenta en la información disponible un análisis de sesgos del corpus CulturaX (procedente de mC4 y OSCAR); es esperable que hereden sesgos de la web rastreada, pero no hay evaluación publicada.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar avisos de licencia; conviene revisar las condiciones del corpus CulturaX y de sus fuentes (mC4, OSCAR) para usos derivados.
- Recuento de parámetros confuso en el Hub (~263 M frente a 230 M reales) por la duplicación de la matriz atada; tenerlo en cuenta al estimar requisitos de memoria.
- No soporta tool calling, agentes ni multimodalidad; no debe evaluarse con criterios de modelos generativos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yhavinga/dmbert-230m-culturax
- Tokenizador: https://huggingface.co/yhavinga/dutch-llama-tokenizer
- Dataset CulturaX: https://huggingface.co/datasets/uonlp/CulturaX
- Paper ModernBERT: https://arxiv.org/abs/2412.13663
- Paper CulturaX: https://arxiv.org/abs/2309.09400
- Paper de referencia adicional citado en los tags (arXiv:2405.18392): https://arxiv.org/abs/2405.18392
- Paper de referencia adicional citado en los tags (arXiv:1910.00896): https://arxiv.org/abs/1910.00896
