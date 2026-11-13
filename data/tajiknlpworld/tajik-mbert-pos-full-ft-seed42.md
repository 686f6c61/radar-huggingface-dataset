# TajikNLPWorld/tajik-mbert-pos-full-ft-seed42

## Resumen

Tajik-mBERT-pos-full-ft-seed42 es un checkpoint de clasificación de etiquetas gramaticales (POS, *part of speech*) para tayiko en escritura cirílica, desarrollado por TajikNLPWorld. Se trata de un ajuste fino completo de `google-bert/bert-base-multilingual-cased` (mBERT) sobre el corpus `TajikNLPWorld/tajik-pos-corpus`, con 177.874.972 parámetros entrenables (el 100 % del modelo base). El modelo asigna una de 28 categorías POS tayikas a una forma léxica aislada, sin contexto oracional.

El checkpoint forma parte de un estudio controlado de tres semillas (42, 123, 2024) que compara ajuste fino completo frente a LoRA. Este repositorio corresponde a la semilla 42 con ajuste fino completo. La relevancia actual reside en que el tayiko es un idioma de bajos recursos y este trabajo publica protocolo, particiones disjuntas por forma léxica y evaluación cruzada entre corpus, lo que permite reproducir y auditar los resultados.

Conviene subrayar que no es un etiquetador POS contextual: procesa palabras sueltas, por lo que la ambigüedad gramatical dependiente de la oración no se resuelve. El modelo está pensado para investigación y NLP exploratorio, no para anotación gramatical autoritativa ni decisiones automatizadas de alto riesgo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT multilingüe, `bert-base-multilingual-cased`) con cabeza de clasificación de secuencia |
| Parametros totales | 177.874.972 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 64 tokens (longitud máxima de secuencia usada en entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible (el repositorio publica safetensors en precisión completa; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | tayiko (`tg`); el modelo base es multilingüe pero el ajuste fino se limita a tayiko |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (vía `transformers`), con tokenizer y mapeo de etiquetas incluidos |

## Arquitectura y entrenamiento

El modelo es un encoder BERT multilingüe con vocabulario *cased* y una cabeza lineal de clasificación sobre el token `[CLS]` (o la representación agregada de la secuencia) que produce 28 logits, uno por categoría POS tayika. La entrada es una única forma léxica, truncada a 64 tokens; no hay modelado de contexto oracional ni etiquetado secuencial (BIO/token-level).

El ajuste fino es completo (100 % de parámetros actualizados) durante 5 épocas, con tasa de aprendizaje 2e-05, batch por dispositivo 8, acumulación de gradientes 4 (batch efectivo 32) y entropía cruzada ponderada con pesos de frecuencia inversa en raíz cuadrada, calculados solo sobre el *train split*. La selección del mejor checkpoint se hace por Macro-F1 de validación. El entrenamiento se ejecutó en una NVIDIA L4 con BF16, Transformers 5.22.2, PEFT 0.21.2 y Datasets 5.2.0.

El protocolo de datos fija una partición disjunta por forma léxica normalizada: 42.017 de entrenamiento, 5.232 de validación y 5.259 de test, sobre 52.508 registros y 28 categorías. Las revisiones de modelo base, dataset principal y dataset externo están fijadas por hash para reproducibilidad, y se verificó la serialización y recarga mediante huella SHA-256 del estado completo y coincidencia en predicciones de sonda.

## Capacidades

- Clasificación de formas léxicas tayikas en 28 categorías POS definidas por la ontología del corpus original.
- Predicción sobre palabras aisladas en escritura cirílica tayika, sin necesidad de contexto.
- Salida de etiquetas en tayiko, con mapeo ordenado disponible en `labels.json`.
- Evaluación reproducible con particiones fijas y semillas emparejadas (42, 123, 2024).
- Capacidad de evaluación cruzada entre corpus con subconjunto de 9 etiquetas mapeadas y enmascaramiento de logits fuera de alcance.
- No soporta *tool calling*, agentes, razonamiento multi-paso, visión, audio ni modo *thinking*.
- Capacidades multilingües limitadas al tayiko en la práctica; el modelo base multilingüe no se ha evaluado aquí para otras lenguas.

## Casos de uso

- Anotación asistida de léxicos tayikos: dado un listado de formas léxicas extraídas de un corpus, el modelo propone una categoría POS por palabra para que un lingüista la revise, acelerando la construcción de diccionarios morfológicos.
- Preetiquetado en pipelines de anotación: integrado como primer paso antes de la revisión humana, reduce el esfuerzo de etiquetado manual en corpus de bajos recursos, siempre con validación experta.
- Enriquecimiento de recursos léxicos existentes: clasificar entradas nuevas o no etiquetadas de un diccionario tayiko para completar campos de categoría gramatical.
- Filtrado y normalización de vocabulario: agrupar formas léxicas por categoría para tareas de limpieza, deduplicación o construcción de listas de parada específicas por POS.
- Línea base para investigación en NLP tayiko: sirve como referencia reproducible (semilla 42, ajuste completo) frente a variantes LoRA y otros encoders en estudios comparativos.
- Evaluación de transferencia entre corpus: usar el checkpoint para medir el comportamiento bajo cambio de dominio con el conjunto `TajikMorphCorpus`, identificando categorías frágiles antes de desplegar cualquier anotador.
- Docencia y experimentación: ejemplo controlado de ajuste fino completo vs. LoRA con particiones disjuntas por forma léxica y auditoría de serialización.

## Benchmarks y rendimiento

Resultados reales del checkpoint publicados en la model card:

| Evaluacion | Ejemplos | Accuracy | Macro-F1 | Weighted-F1 |
|---|---:|---:|---:|---:|
| Test en dominio (28 etiquetas POS) | 5.259 | 0.7906 | 0.5629 | 0.7895 |
| Test en dominio (9 etiquetas compartidas, logits enmascarados) | 4.235 | 0.7615 | 0.5011 | 0.7608 |
| Externo TajikMorphCorpus (9 etiquetas mapeadas) | 2.592 | 0.3268 | 0.2718 | 0.3515 |
| Externo, subconjunto de palabras no vistas (9 etiquetas mapeadas) | 2.289 | 0.3228 | 0.2617 | 0.3493 |

Agregado de las tres semillas emparejadas (42, 123, 2024) para ajuste fino completo en dominio de 28 clases: Macro-F1 medio 0.5443 ± 0.0450 (desviación estándar muestral). Los autores advierten que las puntuaciones Macro-F1 de 9 y 28 etiquetas no son directamente intercambiables.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,7 GB de pesos (177,9 M de parámetros) más activaciones; en la práctica, menos de 2 GB para lotes pequeños.
- VRAM estimada en FP16/BF16: en torno a 0,4 GB de pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: NVIDIA L4 (usada en entrenamiento), T4, RTX 3060/4060 o superiores; para entrenamiento completo, L4/A100 según el tamaño de lote.
- Cabe en GPU consumer: sí, en modelos con 4 GB o más de VRAM, incluso en FP32.
- Opciones de despliegue: `transformers` (PyTorch), Text Embeddings Inference (el repositorio está marcado como compatible con *endpoints*), y exportación a ONNX si se necesita; no se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; al tratarse de secuencias de hasta 64 tokens, la latencia esperada es baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Macro-F1 en dominio | Licencia | Disponibilidad |
|---|---:|---|---|---:|---|---|
| Tajik-mBERT POS full-ft seed42 (este) | 177,9 M | 64 tokens | POS de palabra aislada, 28 clases | 0.5629 (test) | Apache 2.0 | Hugging Face |
| Variante LoRA del mismo estudio (semilla 42) | no disponible en esta ficha | 64 tokens | POS de palabra aislada, 28 clases | no disponible en esta ficha | Apache 2.0 (presumible) | Hugging Face (TajikNLPWorld) |
| `google-bert/bert-base-multilingual-cased` sin ajustar | 177,9 M | 512 tokens | encoder multilingüe genérico | no aplica (no entrenado para POS tayiko) | Apache 2.0 | Hugging Face |

No se dispone de datos de otros etiquetadores POS tayikos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo es libre de contexto: no recibe la oración, por lo que no resuelve ambigüedades gramaticales dependientes del contexto y no debe presentarse como etiquetador POS oracional.
- Las frecuencias de clase están muy desbalanceadas y algunas etiquetas tienen muy pocos ejemplos, lo que degrada el Macro-F1 (0.5629 en dominio) frente a la accuracy (0.7906).
- El cambio de dominio reduce drásticamente el rendimiento externo: accuracy 0.3268 y Macro-F1 0.2718 en `TajikMorphCorpus`, con resultados similares en palabras no vistas.
- El mapeo automático de las 9 etiquetas externas puede contener desajustes lingüísticos y requiere validación independiente por expertos.
- Riesgo de alucinación de categoría: el modelo siempre devuelve una de las 28 clases, incluso cuando la forma léxica es ambigua, desconocida o está fuera de la ontología.
- No debe usarse para anotación gramatical autoritativa ni para decisiones automatizadas de alto riesgo; está orientado a investigación y NLP exploratorio.
- Licencia Apache 2.0 permite uso comercial, pero la calidad fuera de dominio y en clases raras hace desaconsejable su uso en producción sin revisión humana.
- Solo se ha validado para tayiko; no hay evidencia de rendimiento en otras lenguas pese a partir de un modelo multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TajikNLPWorld/tajik-mbert-pos-full-ft-seed42
- Modelo base: https://huggingface.co/bert-base-multilingual-cased
- Dataset de entrenamiento: https://huggingface.co/datasets/TajikNLPWorld/tajik-pos-corpus
- Dataset de evaluación externa: https://huggingface.co/datasets/TajikNLPWorld/TajikMorphCorpus
- Preprint referenciado (identificador arXiv indicado en los metadatos): arXiv:2605.04576
- Repositorio de la organización: https://huggingface.co/TajikNLPWorld
