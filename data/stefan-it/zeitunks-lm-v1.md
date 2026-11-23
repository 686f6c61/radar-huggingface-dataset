# stefan-it/zeitunks-lm-v1

## Resumen

Zeitunks-LM v1 es un modelo de lenguaje enmascarado (masked language model) bidireccional entrenado sobre textos de periódicos históricos alemanes (siglos XIX y principios del XX). Lo desarrolla Stefan Schweter (stefan-it), autor también del modelo predecesor Zeitungs-LM. Su particularidad es que no emplea atención transformer: la arquitectura **BiXl-Kron** se basa en bloques KronLSTM, un tipo de atención lineal recurrente derivada de la regla delta de Kronecker, presentada en el artículo "Kronecker Delta Rule for Long Context Linear Attention".

El modelo tiene 96,9 millones de parámetros, un tamaño oculto de 512, 4 cabezas con dimensión de cabeza 128 y un vocabulario word-piece de 64K reutilizado de Zeitungs-LM. Se entrenó con enmascaramiento de palabra completa al 30% durante 2.125.000 pasos sobre 69,9G subtokens, la mitad que su predecesor basado en atención, con el objetivo de demostrar que una arquitectura lineal recurrente puede competir en eficiencia y calidad en el dominio del patrimonio documental alemán.

Es relevante ahora porque explora una vía alternativa a los transformers para el procesamiento de corpus históricos OCR, un caso de uso con secuencias largas y vocabulario ruidoso donde el coste cuadrático de la atención resulta problemático. No obstante, en el momento de redactar esta ficha los resultados de evaluación (NER) han sido retirados y están pendientes de republicación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BiXl-Kron (bidireccional, sin atención, basada en bloques KronLSTM con profundidad en bucle) |
| Parámetros totales | 96.935.488 (96,9M) |
| Parámetros activos | no disponible (no es MoE; el bucle de profundidad comparte pesos) |
| Longitud de contexto | 512 tokens (longitud de preentrenamiento; entradas más largas no probadas) |
| Tipos de cuantización | no disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | alemán (`de`), registro histórico de prensa |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con código remoto (`modeling_bixl.py`, `bixl_model.py`) |
| Tamaño oculto | 512 |
| Cabezas / dimensión de cabeza | 4 / 128 |
| Vocabulario | 64K word-piece (heredado de Zeitungs-LM) |
| Profundidad efectiva | 16 (8 capas aplicadas dos veces con pesos compartidos) |
| Tamaño del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

BiXl-Kron es un codificador bidireccional sin atención ni transformer. Cada capa combina un bloque KronLSTM directo y otro inverso, cuyas representaciones se fusionan por posición mediante una puerta sigmoide. Los bloques KronLSTM actualizan su memoria matricial con la regla delta de Kronecker, sustituyendo tanto los bloques mLSTM como las capas sLSTM de la familia BiXL original, de modo que todo el modelo usa un único tipo de bloque. La profundidad está en bucle: 8 capas distintas se aplican dos veces con pesos compartidos, dando una profundidad efectiva de 16.

El preentrenamiento emplea modelado de lenguaje enmascarado a nivel de palabra completa con un 30% de enmascaramiento y cálculo de pérdida solo en las posiciones enmascaradas. Se usaron 69,9G subtokens durante 2.125.000 pasos con tamaño de lote 64, sobre un corpus de 133 GB compuesto por `biglam/europeana_newspapers` y `storytracer/German-PD-Newspapers`. No se documenta en la información disponible el uso de RLHF, DPO ni ajuste por preferencias (es un modelo base tipo encoder). El modelo requiere el fork de NX-AI de `flash-linear-attention` con los kernels KronLSTM, fijado a un commit concreto; los kernels Triton se compilan en CUDA y hay una implementación de referencia en CPU.

## Capacidades

- Codificación de texto bidireccional: produce `last_hidden_state` de forma `(batch, length, 512)`; no incluye cabeza MLM en el checkpoint publicado.
- Representaciones contextuales para ajuste fino en tareas de comprensión (clasificación de tokens y de secuencia).
- Base para reconocimiento de entidades nombradas (NER) en alemán histórico, tarea objetivo declarada por el autor.
- Procesamiento de texto histórico con ruido OCR de prensa de los siglos XIX y XX.
- Soporte multilingüe: no disponible (solo alemán).
- Tool calling / function calling: no disponible (no es un modelo generativo instruido).
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Reconocimiento de entidades nombradas en corpus de prensa histórica: se ajusta una cabeza de clasificación token a token sobre `last_hidden_state` para etiquetar personas, lugares y organizaciones en digitalizaciones de periódicos, aprovechando el preentrenamiento específico de dominio.
- Enriquecimiento de archivos digitales: extracción de entidades y relaciones para construir índices navegables sobre colecciones como Europeana Newspapers, con un modelo de 96,9M parámetros que cabe en una sola GPU.
- Búsqueda semántica en hemerotecas: generación de embeddings de fragmentos de 512 tokens para recuperación de pasajes en colecciones históricas alemanas.
- Clasificación de documentos históricos: categorización de páginas o artículos (género periodístico, sección, fecha aproximada) mediante ajuste fino de la representación del token `[CLS]` o de pooling.
- Preprocesamiento de pipelines OCR: detección y corrección de errores de reconocimiento mediante modelos de etiquetado entrenados sobre las representaciones del modelo.
- Investigación en arquitecturas lineales: banco de pruebas reproducible para comparar KronLSTM frente a atención transformer en tareas de comprensión de dominio, dado que comparte corpus y vocabulario con Zeitungs-LM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados previos de NER (sobre HIPE-2020 de, ZEFYS 2025, HisGermaNER, NewsEye de, AjMC de, LFT y ONB) fueron retirados y que la evaluación se está reejecutando con búsqueda de hiperparámetros, 5 semillas y selección en desarrollo; la publicación está prevista para el 1 de diciembre de 2026.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,4 GB de pesos; en fp16/bf16, unos 0,2 GB. El coste real lo domina el estado recurrente y las activaciones, no los pesos.
- GPU recomendadas: cualquier GPU CUDA moderna (T4, L4, RTX 3090/4090, A100, H100) es suficiente por tamaño; los kernels Triton requieren CUDA.
- Cabe en GPU de consumo: sí, en cualquier GPU con soporte CUDA y memoria suficiente para el lote; también en CPU mediante la implementación de referencia.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y el fork de `flash-linear-attention` de NX-AI fijado al commit de entrenamiento. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| Zeitunks-LM v1 | 96,9M | 512 | BiXl-Kron (KronLSTM, sin atención) | Apache 2.0 | Entrenado con la mitad de tokens que Zeitungs-LM |
| Zeitungs-LM v1 | no disponible | no disponible | Transformer con atención | no disponible en la información | Mismo corpus y vocabulario; referencia directa de comparación |
| Modelos NER históricos alemanes (p. ej. variantes ajustadas sobre HIPE-2020) | no disponible | no disponible | no disponible | no disponible | Citados como destino de comparación, sin cifras publicadas |

La comparación cuantitativa con alternativas no está disponible: los resultados de NER frente a Zeitungs-LM y a los sistemas del "Named Entity Recognition Shootout for German" están pendientes de publicación.

## Limitaciones y advertencias

- Entrenado exclusivamente con OCR de prensa histórica alemana (siglos XIX y principios del XX); no evaluado en texto moderno ni en otros idiomas.
- Longitud de secuencia de preentrenamiento de 512 tokens; entradas más largas no han sido probadas.
- Es un modelo base tipo encoder: no genera texto ni sigue instrucciones; requiere ajuste fino para cada tarea.
- El checkpoint no incluye la cabeza MLM; solo expone `last_hidden_state`.
- Dependencia frágil: requiere el fork NX-AI de `flash-linear-attention` fijado a un commit concreto y código remoto con `trust_remote_code=True`, lo que implica ejecutar código del autor.
- Los kernels Triton se compilan en tiempo de carga en CUDA; el rendimiento y la portabilidad fuera de CUDA dependen de la implementación de referencia.
- Riesgo de sesgo heredado del corpus periodístico histórico, incluyendo sesgos de época en el lenguaje y en las entidades representadas.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de representaciones erróneas sobre texto OCR ruidoso.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni evaluaciones de robustez en producción.
- Sin resultados de benchmarks publicados en el momento de la ficha; cualquier decisión de adopción debería esperar a la evaluación anunciada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stefan-it/zeitunks-lm-v1
- Modelo predecesor Zeitungs-LM: https://huggingface.co/stefan-it/zeitungs-lm-v1
- Repositorio Zeitungs-LM (tareas NER): https://github.com/stefan-it/zeitungs-lm
- Dataset Europeana Newspapers: https://huggingface.co/datasets/biglam/europeana_newspapers
- Dataset German-PD-Newspapers: https://huggingface.co/datasets/storytracer/German-PD-Newspapers
- Dataset ZEFYS 2025: https://huggingface.co/datasets/SBB/ZEFYS2025
- Dataset HisGermaNER: https://huggingface.co/datasets/stefan-it/HisGermaNER
- Documentación HIPE-2020: https://github.com/hipe-eval/HIPE-2022-data/blob/main/documentation/README-hipe2020.md
- Documentación NewsEye: https://github.com/hipe-eval/HIPE-2022-data/blob/main/documentation/README-newseye.md
- Documentación AjMC: https://github.com/hipe-eval/HIPE-2022-data/blob/main/documentation/README-ajmc.md
- Paper "A Named Entity Recognition Shootout for German": https://aclanthology.org/P18-2020/
- Fork KronLSTM de NX-AI: https://github.com/NX-AI/KronLSTM
- Paper "Kronecker Delta Rule for Long Context Linear Attention": arXiv 2610.26834 (referenciado en los tags del modelo)
- Referencias adicionales en tags: arXiv 2405.04517, arXiv 2503.13427
