# STRIDE-lab/biolinkbert-data-type-20261107

## Resumen

BioLinkBERT-data-type-20261107 es un modelo de clasificación de texto en inglés especializado en dominios biomédicos, desarrollado por STRIDE-lab en el marco del proyecto PsyNamic. Se trata de un ajuste fino (fine-tuning) del modelo base michiyasunaga/BioLinkBERT-base, un transformer BERT de tipo encoder con 108.236.549 parámetros, orientado a predecir la estructura temporal de los datos descritos en resúmenes científicos: transversal, longitudinal largo, longitudinal corto, no aplicable o desconocido.

El modelo resuelve una tarea concreta de anotación estructurada dentro de PsyNamic, un proyecto de investigación que clasifica y organiza literatura científica biomédica y psicológica. Esta versión (noviembre de 2026) sustituye al checkpoint anterior STRIDE-lab/biobert-data-type-20250221 y es la que se despliega en la aplicación web del proyecto. Su relevancia radica en que ofrece un clasificador ligero, con licencia Apache 2.0 y compatible con el ecosistema transformers, listo para integrarse en pipelines de procesamiento documental biomédico.

Al ser un modelo encoder de 108 millones de parámetros y ventana de 512 tokens, está pensado para inferencia de bajo coste y alta velocidad, no para generación de texto ni razonamiento general. Su utilidad está acotada a la clasificación de cinco etiquetas sobre abstracts o fragmentos de texto científico en inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT), basado en BioLinkBERT-base |
| Parametros totales | 108.236.549 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (max_length de entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, PyTorch) |

## Arquitectura y entrenamiento

El modelo es un BERT encoder de 12 capas y aproximadamente 108 millones de parámetros, heredado de BioLinkBERT-base, que incorpora enlaces de documentos (document links) en el preentrenamiento para capturar relaciones entre artículos biomédicos. Sobre esta base se realizó un ajuste fino supervisado para clasificación de secuencias con una única etiqueta de salida (single-label), usando softmax y argmax en inferencia. La cabeza de clasificación tiene cinco clases: Cross-sectional, Longitudinal long, Longitudinal short, Not applicable y Unknown.

El entrenamiento usó un dataset privado con batch size 8, learning rate 5e-05, weight decay 0.01, scheduler lineal con warmup ratio 0.1, 30 épocas máximas, dropout 0.1, early stopping con paciencia 5, gradient clipping 1.0 y max_length 512. Se compararon cinco modelos base (BiomedBERT-abstract, BioBERT, BioLinkBERT, ClinicalBERT y SciBERT) con hiperparámetros idénticos; se seleccionó el checkpoint con menor pérdida de validación y el modelo base con mejor F1 ponderado en validación. El conjunto de test se usó una sola vez tras la selección. No se documenta uso de RLHF ni DPO, dado que es una tarea de clasificación supervisada.

## Capacidades

- Clasificación de texto biomédico en cinco categorías de estructura temporal de datos (transversal, longitudinal largo, longitudinal corto, no aplicable, desconocido).
- Predicción single-label mediante softmax y argmax sobre las cinco clases.
- Procesamiento de entradas de hasta 512 tokens, adecuado para título más abstract de artículos científicos.
- Especialización en inglés y en vocabulario biomédico gracias al preentrenamiento de BioLinkBERT.
- No soporta generación de texto, tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades multimodales (visión, audio) ni de modo de pensamiento (thinking mode).
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Anotación automática de literatura biomédica: clasificar abstracts extraídos de PubMed o bases similares según si el estudio es transversal o longitudinal, para construir revisiones sistemáticas y metaanálisis con metadatos estructurados.
- Enriquecimiento de bases de datos de investigación: procesar lotes de resúmenes y añadir un campo de estructura temporal que facilite filtros y búsquedas en repositorios institucionales.
- Triaje documental en pipelines de revisión: priorizar o agrupar artículos longitudinales frente a transversales antes de la revisión manual, reduciendo el esfuerzo de cribado.
- Integración en la aplicación web PsyNamic: el modelo es el desplegado en producción en psynamic.dcr.unibe.ch, por lo que sirve como referencia para replicar el flujo de clasificación en otros despliegues.
- Extracción de metadatos para estudios de evidencia: alimentar análisis sobre la proporción de diseños longitudinales en un área temática concreta a partir de grandes volúmenes de abstracts.
- Prototipado rápido de clasificadores biomédicos: al ser un encoder de 108 M de parámetros con licencia Apache 2.0, sirve como línea base para experimentos de clasificación con presupuesto de cómputo reducido.
- Filtrado previo en sistemas de recuperación: descartar o etiquetar documentos según su estructura temporal antes de pasarlos a modelos más costosos.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre un conjunto de test reservado de 96 abstracts, con argmax como en la aplicación web e intervalos de confianza bootstrap del 95 % (1.000 remuestras BCa):

| Metrica (test) | Valor [IC 95 %] |
|---|---|
| Weighted F1 | 0,712 [0,608–0,804] |
| Weighted precision | 0,725 [0,600–0,806] |
| Weighted recall | 0,729 [0,635–0,812] |

No se han publicado resultados comparativos frente a otros modelos en la información disponible, más allá de la mención a que se seleccionó BioLinkBERT entre cinco candidatos por F1 ponderado en validación.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 0,5 GB de pesos, más overhead de activaciones; cabe holgadamente en cualquier GPU con 2 GB o más.
- VRAM estimada en FP16/BF16: aproximadamente 0,25 GB de pesos, adecuada para GPUs de gama baja.
- GPU recomendadas: cualquier GPU moderna sirve; para alto throughput, A100, H100 o L4; para desarrollo, RTX 4090, RTX 3090 o incluso GPUs de portátil con 4 GB.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con al menos 2 GB de VRAM; también puede ejecutarse en CPU con latencia aceptable para lotes pequeños.
- Opciones de despliegue: transformers (PyTorch), text-embeddings-inference (el repo está marcado como compatible con endpoints), y servidores de inferencia estándar para modelos de clasificación; no se publican variantes GGUF para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU y moderado en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| STRIDE-lab/biolinkbert-data-type-20261107 | 108,2 M | 512 | Clasificación de estructura temporal de datos (5 clases) | Apache 2.0 | Hugging Face |
| michiyasunaga/BioLinkBERT-base | ~110 M (no confirmado en la información) | 512 | Modelo base encoder biomédico | no disponible en la información | Hugging Face |
| STRIDE-lab/biobert-data-type-20250221 | no disponible | no disponible | Misma tarea (versión anterior, submission-v1) | no disponible en la información | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo clasifica en inglés y sobre texto biomédico; su rendimiento fuera de ese dominio no está validado.
- El conjunto de test tiene solo 96 abstracts, por lo que los intervalos de confianza son amplios (F1 ponderado entre 0,608 y 0,804); la fiabilidad en producción puede variar.
- Riesgo de clasificación errónea en abstracts ambiguos o con estructura temporal poco explícita, especialmente en las clases minoritarias o en la clase "Unknown".
- No es un modelo generativo: no debe usarse para resúmenes, preguntas y respuestas ni razonamiento; cualquier uso fuera de clasificación está fuera de su diseño.
- El dataset de entrenamiento es privado, lo que limita la reproducibilidad y la auditoría de sesgos; no se documentan análisis de sesgo.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base BioLinkBERT-base y citar el proyecto PsyNamic.
- La ventana de 512 tokens obliga a truncar abstracts largos, lo que puede perder información relevante para la etiqueta.
- El modelo se seleccionó con un único conjunto de test usado una sola vez; no hay validación externa en otros corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/STRIDE-lab/biolinkbert-data-type-20261107
- Modelo base: https://huggingface.co/michiyasunaga/BioLinkBERT-base
- Versión anterior: https://huggingface.co/STRIDE-lab/biobert-data-type-20250221
- Código del proyecto PsyNamic: https://github.com/Ineichen-Group/PsyNamic
- Aplicación web PsyNamic: https://psynamic.dcr.unibe.ch
- Guías de anotación: https://osf.io/gh6cn
