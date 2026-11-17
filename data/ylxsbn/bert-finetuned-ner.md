# ylxsbn/bert-finetuned-ner

## Resumen

`ylxsbn/bert-finetuned-ner` es un modelo de clasificación de tokens (token classification) obtenido mediante fine-tuning del encoder `BAAI/bge-small-en-v1.5` sobre un dataset de reconocimiento de entidades nombradas (NER) que el autor no especifica. Lo publica el usuario `ylxsbn` en Hugging Face y está pensado para tareas de extracción de entidades en texto, no para generación. Su relevancia es acotada: se trata de un ajuste pequeño (33,2 M de parámetros, 0,1 GB de repo) con métricas de validación razonables (F1 de 0,9188 sobre el conjunto de evaluación), pero con documentación mínima y sin información sobre el corpus de entrenamiento.

El modelo parte de un encoder BERT pequeño optimizado para embeddings de recuperación (`bge-small-en-v1.5`), reutilizado aquí como backbone para una cabeza de token classification. La model card es la generada automáticamente por el `Trainer` de Transformers y no ha sido revisada por el autor: no hay descripción de la tarea, del dataset ni de los usos previstos. Esto limita seriamente su reproducibilidad y su uso en producción sin una validación propia.

Por su tamaño y arquitectura, es un modelo ligero que puede ejecutarse en CPU y en GPUs de consumo con requisitos mínimos. No obstante, al desconocerse el dominio y el esquema de etiquetas del dataset de entrenamiento, cualquier despliegue real exige inspeccionar el `id2label` del `config.json` y evaluar el modelo sobre datos propios antes de confiar en sus salidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base: `BAAI/bge-small-en-v1.5`), con cabeza de token classification |
| Parametros totales | 33.215.625 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base `bge-small-en-v1.5` admite 512 tokens, pero la model card no lo declara) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion dinamica estandar de PyTorch, no documentada por el autor) |
| Idiomas soportados | no disponible (el modelo base es de tipo `-en`, lo que sugiere entrenamiento mayoritario en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado de `BAAI/bge-small-en-v1.5`, un encoder BERT pequeño (33,2 M de parámetros) originalmente entrenado para generar embeddings de frases y recuperación de información. Sobre ese backbone se ha añadido una cabeza de clasificación por token para NER. No se documenta ninguna innovación arquitectónica adicional: es un ajuste estándar de token classification con `transformers`.

Los hiperparámetros declarados en la model card son: learning rate de 2e-05, batch de entrenamiento y evaluación de 16, semilla 42, optimizador AdamW (`betas=(0.9, 0.999)`, `epsilon=1e-08`), scheduler lineal y 20 épocas planificadas. El entrenamiento se detuvo en la época 12 (7.500 pasos), con una pérdida de validación mínima de 0,0772 en la época 6 y un ligero repunte posterior. No se especifica el número de tokens de entrenamiento, la composición del dataset, el esquema de etiquetas ni si hubo etapas de RLHF o DPO (no aplicables en un modelo de clasificación). El dataset se describe literalmente como "unknown dataset".

## Capacidades

- Clasificación de tokens a nivel de palabra/subpalabra (token classification), orientada a reconocimiento de entidades nombradas.
- Extracción de entidades en texto plano a partir del esquema de etiquetas definido en el `config.json` del modelo (esquema no documentado en la model card).
- Inferencia rápida en CPU y GPU de gama baja por su reducido tamaño (33,2 M de parámetros).
- Integración directa con el pipeline `token-classification` de Transformers.
- No soporta generación de texto, razonamiento, matemáticas, código ni visión.
- No soporta tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; el modelo base es de la familia `-en`.
- No dispone de modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Extracción de entidades en pipelines de NLP: usar `pipeline("token-classification", model="ylxsbn/bert-finetuned-ner")` para etiquetar entidades en documentos, siempre que el esquema de etiquetas del `config.json` coincida con el dominio de destino.
- Preprocesado para motores de búsqueda o RAG: enriquecer documentos con entidades detectadas antes de indexarlos, aprovechando el bajo coste computacional del modelo.
- Anonimización o enmascarado de datos personales: si el esquema incluye etiquetas de tipo PER/LOC, puede usarse como primer filtro para detectar y sustituir entidades en textos, con revisión humana posterior.
- Prototipado rápido de sistemas NER: servir como línea base para comparar con modelos mayores o con ajustes propios sobre el mismo corpus.
- Clasificación por lotes en entornos con recursos limitados: al ocupar 0,1 GB, puede desplegarse en contenedores pequeños o en CPU para procesar grandes volúmenes de texto.
- Componente en pipelines de extracción de información estructurada: combinado con reglas o postprocesado para poblar bases de datos a partir de texto no estructurado.
- Evaluación comparativa de encoders pequeños: útil como referencia en experimentos que comparen `bge-small` frente a otros backbones para NER.

## Benchmarks y rendimiento

La model card declara métricas sobre el conjunto de evaluación (dataset no especificado). No hay resultados en el `model-index` (`results: []`), por lo que no se dispone de comparaciones oficiales con otros modelos.

| Metrica | Valor (epoca 9, mejor F1) |
|---|---|
| Loss (validacion) | 0,0793 |
| Precision | 0,9080 |
| Recall | 0,9298 |
| F1 | 0,9188 |
| Accuracy | 0,9829 |

Evolución del F1 por época (según la tabla de entrenamiento de la model card):

| Epoca | F1 |
|---|---|
| 1 | 0,7976 |
| 2 | 0,8786 |
| 3 | 0,8873 |
| 4 | 0,9007 |
| 5 | 0,9068 |
| 6 | 0,9061 |
| 7 | 0,9091 |
| 8 | 0,9154 |
| 9 | 0,9188 |
| 10 | 0,9187 |
| 11 | 0,9137 |
| 12 | 0,9143 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, CoNLL-2003, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 130 MB para los pesos (33,2 M de parámetros × 4 bytes), más overhead de activaciones y del runtime.
- VRAM estimada en fp16: aproximadamente 65 MB para los pesos.
- Cabe holgadamente en cualquier GPU de consumo (GTX 1050, RTX 2060, RTX 3060, RTX 4090) y también en CPU.
- GPU recomendadas: no requiere GPU dedicada; para alto throughput, cualquier GPU moderna con suficiente paralelismo de batch (A100, H100, L4, T4) es más que suficiente.
- Opciones de despliegue: `transformers` (pipeline `token-classification`), `vLLM` no aplica (no es un modelo generativo), `llama.cpp`/`Ollama` no soportan este formato de forma nativa para token classification; `TGI` no está orientado a este tipo de tarea. La vía natural es `transformers` con `torch` o `onnxruntime` tras exportación a ONNX.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por secuencia corta en CPU moderna y throughput alto en GPU con batch grande, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ylxsbn/bert-finetuned-ner` | 33,2 M | no disponible | Token classification (NER) | MIT | Hugging Face |
| `BAAI/bge-small-en-v1.5` (base) | 33,2 M | 512 tokens (modelo base) | Embeddings / recuperación | MIT | Hugging Face |
| `dslim/bert-base-NER` | ~108 M | 512 tokens | NER (CoNLL-2003, 4 clases) | MIT | Hugging Face |
| `Jean-Baptiste/roberta-large-ner-english` | ~355 M | 512 tokens | NER (PER/ORG/LOC/MISC) | MIT | Hugging Face |

La comparación es orientativa: los modelos alternativos tienen esquemas de etiquetas y datasets de entrenamiento documentados, mientras que este ajuste no especifica ni el corpus ni las etiquetas. En parámetros es el más pequeño de la lista, lo que reduce coste pero también capacidad de representación frente a `bert-base` o `roberta-large`.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: la model card indica "unknown dataset", por lo que se desconoce el dominio, el idioma y el esquema de etiquetas.
- Model card autogenerada y sin revisar: las secciones de descripción, usos previstos y limitaciones están vacías ("More information needed").
- Riesgo de alucinación de entidades: como todo modelo NER, puede etiquetar tokens incorrectamente o asignar tipos de entidad erróneos, especialmente fuera del dominio de entrenamiento.
- Idiomas: el modelo base es de la familia `-en`; no hay evidencia de soporte multilingüe y el rendimiento en castellano es desconocido.
- Sesgos: no documentados; al desconocerse el corpus, no puede evaluarse el sesgo demográfico, geográfico o de dominio.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni documentación sobre el origen de los datos de entrenamiento.
- Sin benchmarks estándar: las métricas declaradas (F1 0,9188) corresponden a un conjunto de evaluación no identificado, por lo que no son comparables con resultados publicados en CoNLL-2003 u otros benchmarks.
- Advertencia para producción: antes de desplegar, es imprescindible inspeccionar `config.json` (`id2label`), validar el modelo sobre datos propios y establecer un umbral de confianza y revisión humana.
- Descargas muy bajas (10) y sin likes: no hay evidencia de uso comunitario ni de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ylxsbn/bert-finetuned-ner
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
