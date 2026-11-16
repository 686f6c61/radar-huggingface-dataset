# STRIDE-lab/biomedbert-abstract-study-control-20261106

## Resumen

BiomedBERT-abstract-study-control es un modelo de clasificación de texto biomédico desarrollado por STRIDE-lab en el marco del proyecto PsyNamic (Universidad de Berna). Se trata de un fine-tuning de `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract` (arquitectura BERT base, 109,5 millones de parámetros) especializado en una tarea concreta: detectar la presencia y el tipo de condición de control en abstracts de estudios biomédicos, con seis posibles etiquetas en un esquema multi-etiqueta (placebo, control activo, pre-post, otro control, no controlado y no aplicable).

El modelo resuelve un problema de extracción de información estructurada a partir de texto científico no estructurado: dado un abstract, clasifica qué tipo de diseño de control emplea el estudio. Es relevante para pipelines de revisión sistemática, meta-análisis y minería de literatura biomédica, donde la clasificación automática del diseño experimental reduce el trabajo manual de cribado. La versión 20261106 es la desplegada en la webapp de PsyNamic tras la revisión de noviembre de 2026 y sustituye a un checkpoint anterior (`pubmedbert-study-control-20250221`).

El modelo tiene 109.486.854 parámetros, una longitud máxima de entrada de 512 tokens, licencia Apache 2.0 y está entrenado únicamente en inglés. Su rendimiento en el conjunto de test retenido es de F1 ponderado 0,729 (IC 95%: 0,643–0,802), con un umbral de decisión ajustado a 0,29.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT base (transformer encoder), fine-tuning para clasificación de secuencias |
| Parámetros totales | 109.486.854 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (max_length de entrenamiento e inferencia) |
| Tipos de cuantización | no disponible (pesos en safetensors; admite cuantización estándar de PyTorch, no documentada por el autor) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, PyTorch) |

## Arquitectura y entrenamiento

El modelo parte de BiomedBERT-abstract, un BERT base (12 capas, 768 dimensiones ocultas, 12 cabezas de atención) preentrenado sobre abstracts de PubMed. Sobre esa base se añade una cabeza de clasificación de secuencias con seis salidas y activación sigmoide por etiqueta (esquema multi-etiqueta, `is_multilabel: true`). El fine-tuning se realizó con batch size 8, learning rate 5e-05, weight decay 0,01, scheduler lineal con warmup del 10%, 30 épocas máximas, dropout 0,1, gradient clipping 1,0 y early stopping con paciencia de 5. El checkpoint seleccionado es el de menor pérdida de validación.

El proceso de selección comparó cinco modelos base (BiomedBERT-abstract, BioBERT, BioLinkBERT, ClinicalBERT y SciBERT) entrenados con hiperparámetros idénticos; BiomedBERT-abstract fue el elegido por F1 ponderado en validación. El conjunto de test se usó una sola vez, tras la selección. El umbral de decisión (0,29) se ajustó en validación con una regla preespecificada: partir del umbral con F1 ponderado máximo y bajarlo mientras la precisión ponderada se mantuviera dentro de 0,05 de su valor en ese punto. El dataset de entrenamiento es privado y no se detalla su composición ni su tamaño en la información disponible.

## Capacidades

- Clasificación multi-etiqueta de abstracts biomédicos en seis categorías de control: Placebo, Active control, Pre-post, Other control, Non-controlled y Not applicable.
- Detección de la presencia y el tipo de condición de control en estudios clínicos a partir de título y abstract.
- Salida probabilística por etiqueta (sigmoide), lo que permite ajustar el umbral según el caso de uso.
- Procesamiento de entradas de hasta 512 tokens (título + abstract concatenados).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo exclusivamente de clasificación.
- Sin capacidades de visión, audio ni modo de razonamiento extendido.
- Multilingüe: no; únicamente inglés.

## Casos de uso

- Cribado en revisiones sistemáticas: el modelo clasifica automáticamente abstracts recuperados de PubMed según su diseño de control, permitiendo priorizar o filtrar estudios antes de la lectura manual. Su F1 ponderado de 0,729 lo hace adecuado como primera pasada, no como sustituto de la revisión humana.
- Meta-análisis y síntesis de evidencia: agregar los tipos de control detectados permite estratificar estudios por calidad de diseño (placebo frente a no controlado) de forma escalable sobre grandes corpus.
- Enriquecimiento de bases de datos bibliográficas: etiquetar registros de literatura con metadatos de diseño experimental para facilitar búsquedas facetadas.
- Monitorización de literatura: procesar los nuevos abstracts indexados semanalmente y detectar estudios no controlados o con control activo en un área terapéutica concreta.
- Integración en la webapp PsyNamic: uso ya documentado por el autor para clasificar abstracts enviados por usuarios en la herramienta pública.
- Filtrado previo en pipelines de extracción de datos: usar la etiqueta "Not applicable" para descartar abstracts que no son estudios con condición de control antes de aplicar modelos de extracción más costosos.
- Análisis bibliométrico a gran escala: cuantificar la proporción de estudios placebo-controlados frente a no controlados en un dominio o período temporal.

## Benchmarks y rendimiento

Conjunto de test retenido (98 abstracts), umbral ajustado 0,29, intervalos de confianza bootstrap del 95% (1.000 remuestras BCa):

| Métrica (test) | Valor [IC 95%] |
|---|---|
| F1 ponderado | 0,729 [0,643–0,802] |
| Precisión ponderada | 0,713 [0,612–0,782] |
| Recall ponderado | 0,750 [0,665–0,828] |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 (109,5 M de parámetros) y en torno a 0,25 GB en FP16; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1–2 GB de VRAM; funciona en RTX 3060, RTX 4090, T4, A100 o H100 sin problema. También es viable en CPU para lotes pequeños.
- Cabe en GPU consumer: sí, en todas las GPU modernas e incluso en GPUs integradas para inferencia puntual.
- Opciones de despliegue: transformers (PyTorch), Text Embeddings Inference (el tag `text-embeddings-inference` está presente), endpoints compatibles; también es convertible a ONNX o cuantizable para CPU.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU (cientos de abstracts por segundo en lote), pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| biomedbert-abstract-study-control-20261106 | 109,5 M | 512 | Clasificación multi-etiqueta de control en abstracts | Apache 2.0 | Hugging Face |
| STRIDE-lab/pubmedbert-study-control-20250221 | no disponible | 512 (asumido) | Misma tarea (versión anterior, `submission-v1`) | no disponible | Hugging Face |
| microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract | ~110 M | 512 | Modelo base de lenguaje biomédico (no clasificador específico) | no disponible | Hugging Face |

El modelo sustituye explícitamente al checkpoint `pubmedbert-study-control-20250221`; no se han publicado métricas comparativas entre ambos en la información disponible. Frente al modelo base, la diferencia es la cabeza de clasificación y el fine-tuning específico para la tarea de control.

## Limitaciones y advertencias

- Entrenado y evaluado únicamente en inglés; no debe aplicarse a abstracts en otros idiomas.
- El conjunto de test es pequeño (98 abstracts), lo que se refleja en intervalos de confianza amplios (F1 ponderado entre 0,643 y 0,802); el rendimiento en producción puede variar.
- El umbral de decisión (0,29) está ajustado para el contexto de la webapp PsyNamic; otros usos pueden requerir recalibración.
- El dataset de entrenamiento es privado y no se documenta su tamaño ni composición, lo que limita la evaluación de sesgos y cobertura.
- Riesgo de error en abstracts ambiguos o con información de control implícita; el modelo no razona, solo clasifica patrones superficiales.
- No apto para generación de texto ni para tareas fuera de la clasificación de control en abstracts biomédicos.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base BiomedBERT (licencia no detallada en la información disponible).
- Sin datos publicados sobre sesgos por subdominio, idioma de publicación o tipo de estudio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/STRIDE-lab/biomedbert-abstract-study-control-20261106
- Modelo base: https://huggingface.co/microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract
- Versión anterior sustituida: https://huggingface.co/STRIDE-lab/pubmedbert-study-control-20250221
- Código del proyecto PsyNamic: https://github.com/Ineichen-Group/PsyNamic
- Webapp PsyNamic: https://psynamic.dcr.unibe.ch
- Guías de anotación: https://osf.io/gh6cn
