# TajikNLPWorld/tajik-mbert-pos-full-ft-seed123

## Resumen

El modelo `TajikNLPWorld/tajik-mbert-pos-full-ft-seed123` es un checkpoint de clasificación de etiquetas gramaticales (POS, *part-of-speech*) para tayiko, desarrollado por el grupo TajikNLPWorld. Se trata de un ajuste fino completo de `google-bert/bert-base-multilingual-cased` sobre la tarea de asignar una de 28 categorías POS a una forma léxica aislada escrita en cirílico tayiko. Con 177,8 millones de parámetros, es un modelo BERT base multilingüe convencional adaptado a una tarea de clasificación a nivel de palabra.

Su relevancia radica en el contexto de los recursos limitados: el tayiko es una lengua de bajos recursos con escasa cobertura en herramientas NLP. Este checkpoint forma parte de un estudio controlado de tres semillas que compara ajuste fino completo frente a LoRA, con evaluación tanto en dominio como en un corpus externo (`TajikMorphCorpus`). El modelo no realiza etiquetado secuencial contextual: recibe palabras aisladas, sin contexto oracional, por lo que la desambiguación gramatical queda fuera de su alcance.

La licencia Apache 2.0 y el formato estándar de Transformers facilitan su reutilización, aunque el autor advierte explícitamente de que se trata de un modelo experimental orientado a investigación y no a anotación gramatical autoritativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base multilingüe) con cabeza de clasificación de secuencia |
| Parametros totales | 177.874.972 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 64 tokens (longitud máxima de secuencia en entrenamiento e inferencia) |
| Tipos de cuantizacion | No disponible (el repositorio distribuye safetensors en precisión completa; no se documentan variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | Tayiko (`tg`); el modelo base es multilingüe, pero el ajuste fino se realizó únicamente sobre tayiko |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (Transformers), con tokenizer y mapeo de etiquetas incluidos |

## Arquitectura y entrenamiento

La arquitectura es la de `bert-base-multilingual-cased`: un transformer encoder de 12 capas con atención bidireccional, adaptado mediante una cabeza de clasificación de secuencia (`AutoModelForSequenceClassification`). Se realizó un ajuste fino completo del 100 % de los parámetros (177.874.972 de 177.874.972), sin congelar capas ni usar adaptadores de bajo rango. La entrada es una forma léxica aislada, tokenizada con una longitud máxima de 64 tokens.

El entrenamiento se llevó a cabo sobre el corpus `TajikNLPWorld/tajik-pos-corpus`, con 52.508 registros antes del particionado y 28 categorías POS. El split es disjunto a nivel de forma léxica normalizada: 42.017 ejemplos de entrenamiento, 5.232 de validación y 5.259 de test, con semilla fija 42 para el split. Se entrenaron 5 épocas con tasa de aprendizaje 2e-05, batch por dispositivo de 8, acumulación de gradiente de 4 (batch efectivo 32) y entropía cruzada ponderada con pesos de frecuencia inversa calculados sobre el split de entrenamiento. El mejor checkpoint se seleccionó por Macro-F1 de validación. El entrenamiento se ejecutó en una NVIDIA L4 con BF16, usando Transformers 5.22.2, PEFT 0.21.2 y Datasets 5.2.0. Se documentan revisiones de fuente fijas para el modelo base, el dataset principal y el dataset externo, y se verificó la serialización y recarga mediante huella SHA-256 del estado completo.

## Capacidades

- Clasificación de categoría POS (28 clases) para formas léxicas aisladas en cirílico tayiko.
- Salida de etiqueta en tayiko según la ontología original del dataset de 28 categorías.
- Clasificación a nivel de palabra (*word-level classification*), no etiquetado secuencial contextual.
- Reproducibilidad multi-semilla: forma parte de un estudio de tres semillas (42, 123, 2024) con comparación frente a LoRA.
- Evaluación cruzada de corpus frente a `TajikMorphCorpus` con mapeo automático a 9 etiquetas compartidas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo *thinking*.
- Capacidad multilingüe limitada al tayiko en la práctica, pese a derivar de un modelo base multilingüe.

## Casos de uso

- Anotación asistida de corpus tayiko: el modelo puede preetiquetar formas léxicas aisladas en un pipeline de anotación, con revisión humana posterior, gracias a su capacidad de asignar una de 28 categorías POS sobre palabras sueltas.
- Extracción de léxico POS para diccionarios y recursos lingüísticos: dado un listado de formas léxicas, se puede generar una etiqueta POS por palabra para construir léxicos etiquetados de forma semiautomática.
- Investigación en NLP de bajos recursos: sirve como línea base reproducible (semilla 123, ajuste fino completo) para comparar frente a LoRA y otras estrategias en tayiko.
- Normalización y enriquecimiento de vocabularios: clasificar formas léxicas extraídas de corpus no anotados para enriquecer vocabularios con información gramatical.
- Evaluación de transferencia entre corpus: el checkpoint permite reproducir los resultados de evaluación externa sobre `TajikMorphCorpus` y estudiar el impacto del cambio de dominio.
- Docencia y experimentación: modelo pequeño (0,7 GB) y ligero para prácticas de ajuste fino y clasificación con BERT en lenguas de bajos recursos.
- Filtrado preliminar en pipelines de morfología: usar la etiqueta POS predicha como señal débil para tareas posteriores de análisis morfológico, siempre con validación experta.

## Benchmarks y rendimiento

Resultados reales del checkpoint, según los metadatos del autor:

| Evaluacion | Ejemplos | Accuracy | Macro-F1 | Weighted-F1 |
|---|---:|---:|---:|---:|
| Test en dominio (28 etiquetas POS) | 5.259 | 0,7920 | 0,5770 | 0,7912 |
| Test en dominio (9 etiquetas compartidas, logits enmascarados) | 4.235 | 0,7636 | 0,5330 | 0,7636 |
| `TajikMorphCorpus` externo (9 etiquetas mapeadas) | 2.592 | 0,3233 | 0,2776 | 0,3354 |
| Subconjunto externo de palabras no vistas (9 etiquetas mapeadas) | 2.289 | 0,3185 | 0,2555 | 0,3298 |

Media de Macro-F1 en dominio (28 clases) entre las tres semillas emparejadas (42, 123, 2024) para ajuste fino completo: **0,5443 ± 0,0450** (desviación estándar muestral). El autor advierte que las puntuaciones Macro-F1 de 9 y 28 etiquetas no son directamente intercambiables.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,7 GB de pesos más overhead de activaciones; en BF16/FP16, alrededor de 0,4 GB.
- GPU recomendadas: NVIDIA L4 (usada en entrenamiento), así como A100, H100 o RTX 4090 para entrenamiento o lotes grandes; para inferencia basta una GPU consumer modesta.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2-4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.), dado el tamaño reducido del modelo.
- Opciones de despliegue: Transformers (PyTorch), Text Embeddings Inference (el repo es compatible con endpoints), y servidores de inferencia estándar de Hugging Face. No se documentan variantes GGUF para llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Macro-F1 en dominio | Licencia |
|---|---:|---:|---|---:|---|
| `tajik-mbert-pos-full-ft-seed123` (este) | 177,9 M | 64 tokens | POS de palabra aislada, 28 clases | 0,5770 (semilla 123) | Apache 2.0 |
| Checkpoints LoRA del mismo estudio (semillas 42/123/2024) | 177,9 M (base) | 64 tokens | POS de palabra aislada, 28 clases | Media 0,5443 ± 0,0450 para full FT; LoRA no detallado en la información | Apache 2.0 |
| `bert-base-multilingual-cased` (modelo base) | 177,9 M | 512 tokens | Enmascarado/encoder genérico | No aplica (no ajustado a POS tayiko) | Apache 2.0 |

No se dispone de datos de otros modelos POS específicos para tayiko en la información proporcionada. La comparación principal es interna al estudio (ajuste fino completo frente a LoRA), y los resultados de LoRA no se detallan en la información disponible.

## Limitaciones y advertencias

- El modelo es **libre de contexto**: recibe palabras aisladas y no resuelve ambigüedad gramatical dependiente de la oración; aplicarlo palabra a palabra a una frase no lo convierte en un etiquetador POS contextual.
- Las frecuencias de clase están muy desbalanceadas y algunas etiquetas tienen muy pocos ejemplos, lo que afecta al Macro-F1 (0,5770 en dominio frente a accuracy 0,7920).
- El cambio de dominio reduce drásticamente el rendimiento externo: accuracy de 0,3233 y Macro-F1 de 0,2776 en `TajikMorphCorpus`.
- El mapeo automático de etiquetas externas a 9 categorías compartidas requiere validación lingüística independiente y puede contener desajustes.
- Riesgo de alucinación y errores en clases raras; no debe usarse como anotación gramatical autoritativa sin revisión de expertos en lengua tayika.
- Modelo experimental orientado a investigación y NLP exploratorio; no apto para decisiones automatizadas de alto impacto.
- Licencia Apache 2.0 permite uso comercial, pero el autor no reclama que el modelo resuelva el etiquetado POS general del tayiko.
- El preprint relacionado citado por el autor usa un corpus léxico distinto y es anterior; no debe confundirse con este estudio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TajikNLPWorld/tajik-mbert-pos-full-ft-seed123
- Modelo base: https://huggingface.co/bert-base-multilingual-cased
- Dataset de entrenamiento: https://huggingface.co/datasets/TajikNLPWorld/tajik-pos-corpus
- Dataset de evaluación externa: https://huggingface.co/datasets/TajikNLPWorld/TajikMorphCorpus
- Referencia arXiv citada en los tags: arxiv:2605.04576 (no verificable en la información proporcionada)
