# STRIDE-lab/biomedbert-abstract-study-purpose-20261106

## Resumen

biomedbert-abstract-study-purpose-20261106 es un modelo de clasificación de texto biomédico desarrollado por STRIDE-lab dentro del proyecto PsyNamic, una iniciativa de la Universidad de Berna orientada a analizar sistemáticamente la literatura científica. El modelo resuelve una tarea concreta: identificar, en el resumen (abstract) de un estudio biomédico, cuál o cuáles son sus propósitos primarios (eficacia, seguridad, farmacocinética, mecanismo de acción, modelo de enfermedad o demografía). Se trata de un problema de clasificación multi-etiqueta, ya que un mismo abstract puede perseguir varios objetivos simultáneamente.

Técnicamente es un fine-tuning de `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract`, un transformer encoder de tipo BERT con 109.486.854 parámetros (aproximadamente 110 M) y una ventana de contexto de 512 tokens. El modelo se entrenó con 30 épocas, learning rate 5e-5 y early stopping, y se seleccionó frente a otros cuatro encoders biomédicos (BioBERT, BioLinkBERT, ClinicalBERT, SciBERT) con hiperparámetros idénticos.

Su relevancia es acotada pero clara: es el checkpoint desplegado en producción en la webapp de PsyNamic tras la revisión de noviembre de 2026, sustituyendo al modelo anterior `STRIDE-lab/biobert-study-purpose-20250221`. Para equipos que necesiten etiquetar abstracts biomédicos por propósito de estudio, ofrece un rendimiento medido (weighted F1 de 0,800 en test) con una licencia permisiva Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (BiomedBERT-abstract base, uncased) |
| Parametros totales | 109.486.854 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (max_length de entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; al ser un modelo de 110 M es viable en fp32/fp16 sin cuantizar) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,4 GB) |

## Arquitectura y entrenamiento

El modelo es un BERT base uncased especializado en dominio biomédico mediante preentrenamiento sobre abstracts de PubMed (BiomedBERT-abstract de Microsoft), al que se le añade una cabeza de clasificación de secuencias (`AutoModelForSequenceClassification`) con 6 etiquetas de salida. La tarea es multi-etiqueta: se aplica una sigmoide independiente por etiqueta, no softmax. El entrenamiento usó batch size 8, learning rate 5e-5, weight decay 0,01, scheduler lineal con warmup ratio 0,1, 30 épocas, dropout 0,1, gradient clipping 1,0 y early stopping con paciencia 5, seleccionando el checkpoint con menor pérdida de validación. El conjunto de datos de entrenamiento es privado y no se detalla su composición ni número de ejemplos.

La innovación metodológica principal no está en la arquitectura sino en el procedimiento de selección y calibración. Se fine-tuningaron cinco encoders biomédicos con hiperparámetros idénticos y se eligió el mejor por weighted F1 en validación, usando el test una sola vez tras la selección. Además, el umbral de decisión se ajustó con una regla preespecificada: partir del umbral con máximo weighted F1 y bajarlo mientras la precisión ponderada se mantuviera dentro de 0,05 de su valor en ese punto, resultando en un umbral final de 0,29. Este umbral es el usado en producción y en las métricas de test reportadas.

## Capacidades

- Clasificación multi-etiqueta de abstracts biomédicos en seis categorías de propósito de estudio: Efficacy endpoints, Safety endpoints, Pharmacokinetics, Mechanism of action, Disease model study y Demographic study.
- Procesamiento de entradas de hasta 512 tokens, suficiente para título más abstract de la mayoría de publicaciones biomédicas.
- Salida de probabilidades por etiqueta (sigmoide), lo que permite umbrales ajustables y ranking de etiquetas.
- Comprensión de vocabulario biomédico especializado heredada del preentrenamiento de BiomedBERT-abstract.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés; no se documenta rendimiento en otros idiomas.
- No es un modelo generativo: no produce texto, solo etiquetas y probabilidades.

## Casos de uso

- Cribado sistemático de literatura: procesar lotes de abstracts de PubMed y etiquetar automáticamente su propósito para priorizar revisiones sistemáticas según tipo de endpoint (eficacia, seguridad, farmacocinética), reduciendo el trabajo manual de triaje.
- Enriquecimiento de bases de datos bibliográficas: añadir metadatos de propósito de estudio a registros existentes para permitir búsquedas facetadas por tipo de objetivo, algo que las bases de datos convencionales no ofrecen de forma estructurada.
- Monitorización de ensayos clínicos: clasificar abstracts de ensayos publicados para detectar si reportan endpoints de seguridad, útil en farmacovigilancia y revisiones de señales de seguridad.
- Análisis de tendencias de investigación: agregar las etiquetas predichas por año, revista o área terapéutica para estudiar la evolución de los propósitos de estudio en una disciplina concreta.
- Filtrado previo en pipelines de extracción de información: usar las etiquetas como señal de enrutamiento para dirigir abstracts a extractores especializados (por ejemplo, enviar los de farmacocinética a un extractor de parámetros PK).
- Integración en herramientas de revisión sistemática tipo PsyNamic: desplegar el modelo vía Hugging Face Inference Endpoints o Text Embeddings Inference (el repo está marcado como `endpoints_compatible`) para ofrecer clasificación de propósito en una webapp de investigación.
- Anotación asistida para creación de datasets: generar pre-etiquetas que revisores humanos corrigen, acelerando la construcción de corpus anotados de propósito de estudio.

## Benchmarks y rendimiento

Conjunto de test retenido de 97 abstracts, umbral 0,29, intervalos de confianza bootstrap del 95 % (1.000 remuestras BCa):

| Metrica (test) | Valor [IC 95 %] |
|---|---|
| Weighted F1 | 0,800 [0,739–0,845] |
| Weighted precision | 0,777 [0,725–0,844] |
| Weighted recall | 0,860 [0,797–0,906] |

No se han publicado resultados comparativos con los otros cuatro encoders evaluados (BioBERT, BioLinkBERT, ClinicalBERT, SciBERT) en la información disponible, solo se indica que este fue el seleccionado por weighted F1 en validación. No hay datos de MMLU, HumanEval, GSM8K ni benchmarks generativos, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4–0,5 GB en fp32 para los pesos (109 M parámetros); en fp16 alrededor de 0,22 GB. Con activaciones y batch pequeño, cabe holgadamente en 2 GB.
- GPU recomendadas: cualquier GPU moderna sirve; para alto throughput, A100 o H100 con batches grandes; para desarrollo, RTX 4090, RTX 3090, RTX 4060 Ti o incluso GPUs de gama baja.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU con 4 GB o más, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: transformers (PyTorch), Hugging Face Inference Endpoints (marcado `endpoints_compatible`), Text Embeddings Inference (TEI), ONNX Runtime, y exportación a GGUF para llama.cpp/Ollama si se convierte manualmente.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto (cientos o miles de abstracts por minuto en GPU), pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| biomedbert-abstract-study-purpose-20261106 | 109,5 M | 512 | Clasificación multi-etiqueta de propósito de estudio | Apache 2.0 | Hugging Face |
| STRIDE-lab/biobert-study-purpose-20250221 | no disponible | no disponible | Misma tarea (versión anterior, tag submission-v1) | no disponible | Hugging Face |
| microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract | ~110 M | 512 | Modelo base de lenguaje biomédico (no clasificador específico) | no disponible en la información | Hugging Face |
| BioBERT / BioLinkBERT / ClinicalBERT / SciBERT | ~110 M cada uno | 512 | Encoders biomédicos/clínicos generales | varía | Hugging Face |

No hay datos públicos de rendimiento de los competidores en esta tarea concreta en la información disponible; el autor solo indica que fueron fine-tuningados con los mismos hiperparámetros y superados por este checkpoint en validación.

## Limitaciones y advertencias

- El conjunto de test es muy pequeño (97 abstracts), por lo que los intervalos de confianza son amplios (weighted F1 entre 0,739 y 0,845); el rendimiento en producción puede variar sustancialmente con la distribución real de abstracts.
- El umbral 0,29 está calibrado sobre un conjunto de validación concreto y una regla específica; en otros dominios o distribuciones puede requerir recalibración.
- Solo inglés: no se ha evaluado en abstracts en otros idiomas y el tokenizador es uncased, lo que puede afectar a términos con mayúsculas relevantes.
- Entrenado con un dataset privado no documentado; se desconoce su composición, tamaño y posibles sesgos de anotación o de selección de revistas/áreas.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y negativos en etiquetas; con umbral bajo (0,29) se prioriza recall sobre precisión, lo que puede generar etiquetas espurias.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de Microsoft y de los datos de preentrenamiento subyacentes.
- No es un modelo generativo ni soporta tool calling, agentes ni razonamiento; no debe usarse para tareas distintas a la clasificación para la que fue entrenado.
- El nombre del repo incluye una fecha (20261106) que sugiere un checkpoint de noviembre de 2026; conviene fijar la revisión concreta (`revision`) en producción para evitar cambios inesperados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/STRIDE-lab/biomedbert-abstract-study-purpose-20261106
- Modelo anterior sustituido: https://huggingface.co/STRIDE-lab/biobert-study-purpose-20250221
- Modelo base: https://huggingface.co/microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract
- Código del proyecto PsyNamic: https://github.com/Ineichen-Group/PsyNamic
- Webapp PsyNamic: https://psynamic.dcr.unibe.ch
- Guías de anotación: https://osf.io/gh6cn
