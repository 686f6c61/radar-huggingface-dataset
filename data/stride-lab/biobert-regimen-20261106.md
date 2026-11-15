# STRIDE-lab/biobert-regimen-20261106

## Resumen

biobert-regimen-20261106 es un modelo de clasificación de texto biomédico desarrollado por STRIDE-lab en el marco del proyecto PsyNamic, una iniciativa de la Universidad de Berna orientada a la extracción estructurada de información a partir de literatura científica sobre sustancias psicoactivas. El modelo parte de BioBERT v1.1 (dmis-lab/biobert-v1.1) y se ha afinado específicamente para la tarea "Regimen", que consiste en clasificar el patrón de dosificación descrito en un resumen (abstract) de un artículo científico.

Arquitectónicamente es un transformer BERT-base con 108,3 millones de parámetros y una ventana de contexto de 512 tokens, suficiente para procesar título y abstract concatenados. La tarea es de clasificación multi-etiqueta con cuatro categorías (Microdosing, Multiple Applications, Single Dose, Unknown) y una regla de predicción basada en sigmoide con umbral calibrado de 0,24.

El modelo sustituye a la versión anterior STRIDE-lab/pubmedbert-regimen-20250221 tras la revisión de noviembre de 2026 y es el que se encuentra desplegado en la aplicación web de PsyNamic. Su relevancia radica en que ofrece un componente de extracción de información reutilizable y con licencia permisiva (Apache 2.0) para pipelines de minería de literatura biomédica, aunque su ámbito de aplicación es muy específico y su rendimiento en test es moderado (weighted F1 de 0,706).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base (encoder bidireccional) |
| Parametros totales | 108.313.348 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; compatible con cuantizacion estandar via transformers/bitsandbytes, aunque no documentada por el autor) |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,4 GB) |

## Arquitectura y entrenamiento

El modelo es un BERT-base estándar (12 capas, hidden size 768, 12 cabezas de atención) inicializado desde BioBERT v1.1, que a su vez deriva de BERT-base y fue preentrenado sobre corpus biomédicos (PubMed abstracts y PMC full text). Sobre esa base se añade una cabeza de clasificación de secuencias con cuatro salidas y activación sigmoide, dado que la tarea es multi-etiqueta (un mismo abstract puede describir, por ejemplo, dosis única y múltiples aplicaciones).

El ajuste fino se realizó con un dataset privado no publicado, batch size 8, learning rate 5e-5, weight decay 0,01, scheduler lineal con warmup del 10 %, 30 épocas máximas, dropout 0,1, gradient clipping 1,0 y early stopping con paciencia de 5 épocas. Se compararon cinco modelos base (BiomedBERT-abstract, BioBERT, BioLinkBERT, ClinicalBERT y SciBERT) con hiperparámetros idénticos; el checkpoint seleccionado es el de menor pérdida de validación y BioBERT fue el base elegido por weighted F1 en validación. El conjunto de test (96 abstracts) se utilizó una sola vez tras la selección. No se documenta uso de RLHF, DPO ni aumento de datos.

## Capacidades

- Clasificación multi-etiqueta de patrones de dosificación en abstracts biomédicos, con cuatro etiquetas: Microdosing, Multiple Applications, Single Dose y Unknown.
- Procesamiento de entradas de hasta 512 tokens, suficiente para título más abstract en la mayoría de artículos.
- Salida probabilística por etiqueta (sigmoide), lo que permite ajustar el umbral según el compromiso precisión/recall deseado.
- Especialización en dominio biomédico gracias al preentrenamiento de BioBERT v1.1.
- Compatible con Text Embeddings Inference (TEI) y con endpoints de Hugging Face según los tags del repositorio.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés; no se ha entrenado ni evaluado en otros idiomas.

## Casos de uso

- Extracción estructurada en minería de literatura: procesar lotes de abstracts de PubMed para poblar una base de datos con el patrón de dosificación descrito, como hace la propia webapp de PsyNamic. El contexto de 512 tokens cubre título y abstract completos en la mayoría de casos.
- Enriquecimiento de revisiones sistemáticas: clasificar automáticamente miles de abstracts durante el cribado para priorizar los que describen pautas de microdosificación o dosis múltiples, reduciendo el trabajo manual de los revisores.
- Construcción de datasets de investigación: generar etiquetas preliminares sobre corpus de literatura psicoactiva que luego se validen manualmente, aprovechando la salida probabilística para ordenar por confianza.
- Monitorización de literatura emergente: integrar el modelo en un pipeline periódico que detecte nuevos artículos con patrones de dosificación relevantes y los envíe a un sistema de alertas.
- Componente en pipelines de NLP biomédico: usar el modelo como extractor especializado dentro de una cadena mayor (NER de sustancias, extracción de resultados, etc.) en la que cada componente cubre una faceta del abstract.
- Filtrado previo a anotación humana: aplicar el umbral de 0,24 para maximizar recall y derivar a anotadores solo los casos positivos, dado que el modelo prioriza recall (0,762) sobre precisión (0,676).

## Benchmarks y rendimiento

Resultados en el conjunto de test reservado (96 abstracts), con umbral ajustado de 0,24 e intervalos de confianza bootstrap del 95 % (1.000 remuestras BCa):

| Metrica (test) | Valor [IC 95%] |
|---|---|
| Weighted F1 | 0,706 [0,608–0,775] |
| Weighted precision | 0,676 [0,585–0,740] |
| Weighted recall | 0,762 [0,663–0,838] |

No se han publicado en la información disponible resultados comparativos frente a los otros cuatro modelos base evaluados (BiomedBERT-abstract, BioLinkBERT, ClinicalBERT, SciBERT), más allá de que BioBERT fue el seleccionado por weighted F1 en validación.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB para los pesos, más overhead de activaciones; en la práctica menos de 1 GB para batches pequeños.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para volúmenes moderados.
- GPU recomendadas para throughput alto: A100, H100 o L4 para servir lotes grandes; para uso individual basta una GPU de gama media.
- Opciones de despliegue: transformers (PyTorch), Text Embeddings Inference (TEI), endpoints de Hugging Face; también es convertible a ONNX y cuantificable a int8 para reducir latencia.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo (BERT-base) se espera latencia de milisegundos por muestra en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| biobert-regimen-20261106 | 108,3 M | 512 | Clasificacion multi-etiqueta de regimen de dosificacion | Apache 2.0 | Hugging Face |
| STRIDE-lab/pubmedbert-regimen-20250221 | no disponible | no disponible | Misma tarea (version anterior, submission-v1) | no disponible | Hugging Face |
| dmis-lab/biobert-v1.1 | ~110 M | 512 | Modelo base biomedico (sin cabeza de clasificacion especifica) | Apache 2.0 | Hugging Face |

La comparación con otros clasificadores biomédicos especializados (por ejemplo, modelos PubMedBERT o SciBERT afinados para tareas análogas) no está disponible en la información proporcionada, ya que no se publican métricas de los competidores en la model card.

## Limitaciones y advertencias

- Rendimiento moderado: weighted F1 de 0,706 con IC amplio (0,608–0,775) sobre solo 96 abstracts de test; la incertidumbre es considerable y el tamaño muestral pequeño.
- Sesgo de dominio: entrenado exclusivamente sobre literatura biomédica en inglés; su uso fuera de abstracts científicos (textos clínicos, notas de pacientes, otros idiomas) no está validado.
- Dataset de entrenamiento privado y no publicado, lo que dificulta la reproducibilidad y la auditoría de posibles sesgos de anotación.
- Riesgo de falsos positivos y negativos: con umbral 0,24 el modelo prioriza recall (0,762) sobre precisión (0,676), por lo que genera etiquetas espurias con frecuencia; no debe usarse como única fuente de verdad sin revisión humana.
- Etiqueta "Unknown" puede absorber casos ambiguos y enmascarar errores de clasificación en las otras tres categorías.
- Licencia Apache 2.0 permite uso comercial, pero el modelo está pensado para investigación en minería de literatura; no es un dispositivo médico ni debe usarse para decisiones clínicas.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso; es un clasificador puro, no un modelo generativo.
- Idiomas: solo inglés; cualquier uso en castellano u otras lenguas carece de garantías.
- No se documentan sesgos demográficos ni de otro tipo; la ausencia de información no implica ausencia de sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/STRIDE-lab/biobert-regimen-20261106
- Modelo base: https://huggingface.co/dmis-lab/biobert-v1.1
- Versión anterior: https://huggingface.co/STRIDE-lab/pubmedbert-regimen-20250221
- Código del proyecto PsyNamic: https://github.com/Ineichen-Group/PsyNamic
- Webapp PsyNamic: https://psynamic.dcr.unibe.ch
- Guías de anotación: https://osf.io/gh6cn
