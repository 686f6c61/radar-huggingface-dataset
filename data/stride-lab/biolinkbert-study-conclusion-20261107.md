# STRIDE-lab/biolinkbert-study-conclusion-20261107

## Resumen

BioLinkBERT-study-conclusion-20261107 es un modelo de clasificación de texto biomédico desarrollado por STRIDE-lab en el marco del proyecto PsyNamic. Se trata de un fine-tuning de `michiyasunaga/BioLinkBERT-base`, un transformer encoder derivado de BERT con 108,2 millones de parámetros, especializado en la predicción de la conclusión de estudios clínicos a partir de títulos y resúmenes de publicaciones biomédicas. La tarea consiste en clasificar cada estudio en una de seis categorías: Positive, Negative, Neutral, Mixed, Unknown y Not Applicable.

El modelo forma parte del pipeline de predicción de PsyNamic, una iniciativa orientada a extraer automáticamente parámetros de estudios sobre salud mental. Es relevante como ejemplo de fine-tuning de dominio biomédico con una evaluación rigurosa: el checkpoint se seleccionó sobre validación (weighted F1) entre cinco modelos base candidatos, y el conjunto de test se utilizó una única vez. No obstante, el propio autor advierte que esta tarea concreta (Study Conclusion) fue excluida del dataset final del proyecto por su baja informatividad y escaso acuerdo interanotador, por lo que sus predicciones no se muestran en la webapp ni se reportan en el paper.

El modelo tiene un uso muy acotado: clasificación single-label de resúmenes biomédicos en inglés, con una ventana de 512 tokens. No está pensado para generación de texto, razonamiento multi-paso ni otras tareas generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT), fine-tuning de BioLinkBERT-base |
| Parametros totales | 108.237.318 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (max_length de entrenamiento e inferencia) |
| Tipos de cuantizacion | No disponible (pesos safetensors en fp32/fp16 estándar; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers/PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder tipo BERT (no decoder, no MoE, no SSM) con 108,2 millones de parámetros, inicializado desde `michiyasunaga/BioLinkBERT-base`, que incorpora enlaces de documentos como señal de preentrenamiento sobre literatura biomédica. Sobre esa base se añade una cabeza de clasificación de secuencias con seis etiquetas de salida (Positive, Negative, Neutral, Mixed, Unknown, Not Applicable) y activación softmax.

El fine-tuning se realizó con los siguientes hiperparámetros: batch size 8, learning rate 5e-05, weight decay 0,01, scheduler lineal con warmup ratio 0,1, hasta 30 épocas con early stopping (paciencia 5), dropout 0,1, gradient clipping 1,0 y max_length 512. Se entrenaron cinco modelos base candidatos (BiomedBERT-abstract, BioBERT, BioLinkBERT, ClinicalBERT y SciBERT) con hiperparámetros idénticos; el checkpoint seleccionado es el de menor pérdida de validación, y el modelo base se eligió por weighted F1 en validación. El conjunto de test se empleó una sola vez tras la selección. El dataset de entrenamiento es privado y no se documenta su tamaño ni composición. No se menciona RLHF, DPO ni innovaciones de decodificación; la predicción es argmax sobre la softmax (single-label), y el umbral 0,5 del JSON de entrenamiento no tiene efecto en esta tarea.

## Capacidades

- Clasificación de texto biomédico en seis clases (single-label) sobre títulos y resúmenes de estudios.
- Procesamiento de entradas de hasta 512 tokens, suficiente para título más abstract de la mayoría de publicaciones.
- Detección de polaridad/conclusión de estudios: resultados positivos, negativos, neutros, mixtos, desconocidos o no aplicables.
- Integración con la librería transformers (`AutoTokenizer`, `AutoModelForSequenceClassification`).
- Compatible con Text Embeddings Inference y endpoints compatibles según los tags del repositorio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso (es un encoder de clasificación, no un modelo generativo).
- Capacidades multilingües: no; solo inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Triaje de literatura biomédica: clasificar automáticamente grandes volúmenes de abstracts según la dirección de su conclusión, para priorizar revisiones sistemáticas sobre estudios con resultados positivos o mixtos.
- Enriquecimiento de bases de datos bibliográficas: añadir una etiqueta de conclusión a registros de PubMed o similares, facilitando filtros por polaridad de resultados en herramientas de búsqueda.
- Monitorización de evidencia en salud mental: dentro del pipeline PsyNamic, alimentar la extracción de parámetros de estudios, aunque el autor advierte que esta tarea concreta quedó fuera del dataset final.
- Análisis de tendencias de publicación: agregar la distribución de conclusiones por área terapéutica o por año para detectar sesgos de publicación hacia resultados positivos.
- Prefiltrado en revisiones sistemáticas: descartar o marcar abstracts con conclusión "Unknown" o "Not Applicable" antes de la lectura manual, reduciendo carga de trabajo.
- Investigación metodológica en NLP biomédico: servir como checkpoint de referencia para comparar estrategias de fine-tuning (selección de modelo base, early stopping) en tareas de clasificación de abstracts.
- Prototipado de clasificadores de dominio: punto de partida para fine-tunings adicionales sobre tareas relacionadas con conclusiones de estudios.

## Benchmarks y rendimiento

Evaluación sobre conjunto de test held-out (98 abstracts), predicción por argmax, intervalos de confianza bootstrap al 95 % (1.000 remuestras BCa):

| Metrica (test) | Valor [IC 95 %] |
|---|---|
| Weighted F1 | 0,789 [0,697–0,864] |
| Weighted precision | 0,766 [0,652–0,848] |
| Weighted recall | 0,816 [0,735–0,878] |

No se han publicado en la información disponible resultados comparativos frente a otros modelos en esta tarea, ni métricas por clase.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4–0,5 GB en fp32 (108 M de parámetros) y en torno a 0,2–0,3 GB en fp16; el repositorio ocupa 0,4 GB.
- GPU recomendadas: cualquier GPU con al menos 1–2 GB de VRAM es suficiente; una NVIDIA T4, L4, RTX 3060 o superior permite throughput alto con batching.
- Cabe en cualquier GPU consumer moderna e incluso en CPU para volúmenes moderados de inferencia.
- Opciones de despliegue: transformers (PyTorch), Text Embeddings Inference (tag `text-embeddings-inference`), endpoints compatibles, y exportación a ONNX o cuantización INT8 para CPU si se requiere.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un encoder BERT-base de 512 tokens, se espera latencia de milisegundos por muestra en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| biolinkbert-study-conclusion-20261107 | 108,2 M | 512 tokens | Clasificación de conclusión de estudios (6 clases) | Apache 2.0 | Hugging Face |
| STRIDE-lab/scibert-study-conclusion-20251005 (submission-v1) | No disponible en la información | No disponible | Misma tarea (versión previa, sustituida) | No disponible | Hugging Face |
| michiyasunaga/BioLinkBERT-base | ~108 M (BERT-base) | 512 tokens | Modelo base biomédico (preentrenamiento) | No disponible en la información | Hugging Face |

No se dispone de datos de rendimiento de las alternativas en esta tarea concreta para una comparación cuantitativa; el autor indica que SciBERT, BioBERT, BiomedBERT-abstract y ClinicalBERT fueron candidatos con hiperparámetros idénticos, pero no se publican sus métricas en la información disponible.

## Limitaciones y advertencias

- La tarea de Study Conclusion fue excluida del dataset final de PsyNamic por baja informatividad (predominio de etiquetas "unknown" o "not applicable") y bajo acuerdo interanotador; el modelo no se usa en la webapp ni se reporta en el paper.
- El conjunto de test es muy pequeño (98 abstracts), lo que se refleja en intervalos de confianza amplios (weighted F1 entre 0,697 y 0,864).
- Solo inglés; no soporta otros idiomas.
- Ventana máxima de 512 tokens; abstracts más largos se truncan.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en casos ambiguos o con lenguaje poco explícito.
- Posibles sesgos derivados del dataset privado de entrenamiento, cuya composición y distribución de clases no se documentan.
- El dataset de entrenamiento es privado, lo que dificulta la reproducibilidad completa.
- Licencia Apache 2.0 permite uso comercial, pero la naturaleza biomédica del modelo exige validación específica antes de cualquier uso clínico o de toma de decisiones.
- No debe interpretarse como herramienta de evaluación crítica de evidencia clínica; es un clasificador de superficie sobre el texto del abstract.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/STRIDE-lab/biolinkbert-study-conclusion-20261107
- Modelo base: https://huggingface.co/michiyasunaga/BioLinkBERT-base
- Modelo previo sustituido: https://huggingface.co/STRIDE-lab/scibert-study-conclusion-20251005
- Código del proyecto PsyNamic: https://github.com/Ineichen-Group/PsyNamic
- Webapp PsyNamic: https://psynamic.dcr.unibe.ch
