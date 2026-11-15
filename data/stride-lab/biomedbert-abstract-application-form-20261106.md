# STRIDE-lab/biomedbert-abstract-application-form-20261106

## Resumen

biomedbert-abstract-application-form-20261106 es un modelo de clasificación de texto biomédico desarrollado por el grupo STRIDE-lab en el marco del proyecto PsyNamic. Se trata de un ajuste fino de `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract`, un transformer encoder de tipo BERT con 109,5 millones de parámetros, especializado en la clasificación multi-etiqueta de la vía de administración (route of administration) declarada en resúmenes de publicaciones científicas biomédicas.

El modelo resuelve una tarea concreta dentro del pipeline de extracción de metadatos del proyecto PsyNamic: dado un abstract (y opcionalmente su título), asigna una o varias de ocho vías de administración posibles (oral, nasal, intravenosa, fumada, subcutánea, otras, desconocida, no aplicable). Según la model card, este checkpoint sustituye al anterior `scibert-application-form-20250221` y es el que se despliega en la aplicación web de PsyNamic tras la revisión de noviembre de 2026.

Su relevancia es acotada pero clara: demuestra un flujo de selección de modelo base entre cinco encoders biomédicos con hiperparámetros idénticos, umbral de decisión calibrado sobre validación y evaluación sobre un conjunto de test reservado con intervalos de confianza bootstrap. La longitud de contexto efectiva es de 512 tokens, el idioma soportado es únicamente inglés y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base, uncased) |
| Parametros totales | 109.488.392 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (`max_length` de entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estandar de transformers, no documentada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, PyTorch (`transformers`) |

## Arquitectura y entrenamiento

La arquitectura es un BERT base uncased heredado de `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract`, es decir, un encoder bidireccional de 12 capas con cabeza de clasificación (`AutoModelForSequenceClassification`) adaptada a una tarea multi-etiqueta de 8 clases. La cabeza aplica una sigmoide por etiqueta en lugar de softmax, lo que permite predecir varias vías de administración simultáneamente para un mismo abstract.

El ajuste fino se realizó con un dataset privado (no publicado) y los siguientes hiperparámetros: batch size 8, learning rate 5e-5, weight decay 0,01, scheduler lineal con warmup del 10 %, 30 épocas máximas, dropout 0,1, early stopping con paciencia 5 y gradient clipping 1,0. Se entrenaron con idénticos hiperparámetros cinco modelos base (BiomedBERT-abstract, BioBERT, BioLinkBERT, ClinicalBERT y SciBERT); el checkpoint final corresponde al de menor pérdida de validación, y el modelo base se eligió por weighted F1 en validación. El conjunto de test se usó una sola vez, tras la selección. No se documenta el número de tokens de entrenamiento ni la composición exacta del corpus.

La innovación técnica destacable no está en la arquitectura, sino en la regla de umbral: partiendo del umbral con máximo weighted F1 en validación, se rebaja mientras la precisión ponderada se mantenga dentro de 0,05 de su valor en ese punto, fijándose en 0,12 para el despliegue.

## Capacidades

- Clasificación multi-etiqueta de texto biomédico en inglés: asigna una o varias vías de administración por abstract.
- Etiquetas soportadas: Oral, Nasal, Intravenous, Smoking, Subcutaneous, Other, Unknown, Not applicable.
- Entrada flexible: acepta título y abstract concatenados (`"<title>. <abstract>"`), truncando a 512 tokens.
- Salida probabilística por etiqueta (sigmoide), lo que permite ajustar el umbral según el compromiso precisión/recall deseado.
- No soporta generación de texto, tool calling, razonamiento multi-paso, agentes, visión ni audio: es un encoder discriminativo puro.
- Multilingüismo: limitado al inglés; no se documenta rendimiento en otros idiomas.

## Casos de uso

- Enriquecimiento de bases de datos bibliográficas biomédicas: procesar abstracts en lote para poblar un campo estructurado de vía de administración, usando el umbral 0,12 documentado o uno propio calibrado sobre un conjunto de validación local.
- Filtrado de literatura en revisiones sistemáticas: descartar o priorizar abstracts según la vía de administración declarada (por ejemplo, aislar estudios con administración intravenosa) antes de la lectura manual.
- Integración en pipelines de extracción de entidades y metadatos: el modelo actúa como eslabón de clasificación dentro de un sistema mayor de procesamiento de publicaciones, con salida multi-etiqueta compatible con esquemas tipo JSON.
- Soporte a la curación en herramientas web científicas: el checkpoint es el desplegado en la aplicación PsyNamic, por lo que sirve como referencia para replicar o auditar ese flujo de anotación.
- Señal auxiliar en modelos de farmacocinética o farmacología computacional: la vía de administración predicha puede alimentar modelos posteriores que la requieran como variable de entrada.
- Detección de ambigüedad documental: la etiqueta `Unknown` y la naturaleza multi-etiqueta permiten marcar abstracts con información incompleta o contradictoria para revisión humana.
- Baseline para experimentos de clasificación biomédica: al estar construido sobre un protocolo de selección entre cinco encoders con hiperparámetros fijos, sirve como punto de comparación reproducible para nuevas aproximaciones.

## Benchmarks y rendimiento

Resultados sobre conjunto de test reservado (94 abstracts), umbral ajustado 0,12, intervalos de confianza bootstrap del 95 % (1.000 remuestras BCa), según la model card:

| Metrica (test) | Valor [IC 95 %] |
|---|---|
| Weighted F1 | 0,801 [0,706–0,881] |
| Weighted precision | 0,800 [0,703–0,866] |
| Weighted recall | 0,818 [0,717–0,896] |

No se han publicado en la informacion disponible resultados comparativos de este checkpoint frente a los otros cuatro modelos base evaluados (BioBERT, BioLinkBERT, ClinicalBERT, SciBERT); solo se indica que la selección se hizo por weighted F1 en validación.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB de pesos (109,5 M de parámetros), más activaciones; en la práctica cabe holgadamente en cualquier GPU consumer con 2 GB o más.
- En fp16/bf16: alrededor de 0,25 GB de pesos; cuantización a int8 reduciría a unos 0,12 GB, aunque el autor no documenta cuantizaciones soportadas.
- GPU recomendadas: cualquier GPU moderna sirve; para lotes grandes se recomienda A100, H100, L4 o RTX 4090 por throughput, pero no es necesario para uso individual.
- Cabe en GPU consumer: sí, en cualquier RTX (incluso series 20xx o inferiores) y en muchas iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (PyTorch), Text Embeddings Inference (el repo incluye el tag `text-embeddings-inference`) y endpoints compatibles; también es viable exportarlo a ONNX o cuantizarlo con las herramientas estándar de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño y la longitud de secuencia (≤512 tokens), se espera un throughput alto en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Contexto de disponibilidad |
|---|---|---|---|---|---|
| biomedbert-abstract-application-form-20261106 (este) | 109,5 M | 512 | Clasificacion multi-etiqueta de via de administracion | Apache 2.0 | Hugging Face, 0 descargas |
| microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract | ~110 M | 512 | Encoder biomedico general (MLM) | Apache 2.0 | Hugging Face, ampliamente usado |
| STRIDE-lab/scibert-application-form-20250221 | no disponible | no disponible | Misma tarea, version anterior (sustituida) | no disponible en la informacion | Hugging Face |
| BioBERT / BioLinkBERT / ClinicalBERT / SciBERT (bases evaluadas) | ~110 M (tipico) | 512 | Encoders biomedicos/clinicos generales | varian segun modelo | Hugging Face |

La comparación de rendimiento entre estos modelos en la tarea concreta no está publicada en la información disponible; la model card solo indica que BiomedBERT-abstract fue el seleccionado por weighted F1 en validación.

## Limitaciones y advertencias

- Dominio y tarea muy acotados: solo clasifica vías de administración en abstracts biomédicos en inglés; no es un modelo de propósito general.
- Idioma único: no se ha evaluado en castellano ni en otros idiomas; su uso fuera del inglés no está respaldado.
- Contexto limitado a 512 tokens: abstracts largos se truncan, lo que puede eliminar menciones a la vía de administración si aparecen al final.
- Riesgo de alucinación en sentido estricto bajo (es un clasificador), pero sí riesgo de falsos positivos y negativos; el umbral 0,12 prima el recall y puede aumentar los falsos positivos en textos ambiguos.
- Dataset de entrenamiento privado: no es posible auditar la composición, el balance de clases ni los posibles sesgos de anotación; los sesgos concretos no están documentados.
- Evaluación sobre solo 94 abstracts de test: los intervalos de confianza son amplios (weighted F1 entre 0,706 y 0,881), lo que limita la confianza en el rendimiento esperado en dominios distintos.
- Uso comercial permitido por la licencia Apache 2.0, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales, no detalladas.
- El modelo sustituye a un checkpoint anterior; quien lo despliegue debe asegurarse de usar el umbral 0,12 y no el 0,5 empleado solo para métricas de validación durante el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/STRIDE-lab/biomedbert-abstract-application-form-20261106
- Modelo base: https://huggingface.co/microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract
- Checkpoint anterior (sustituido): https://huggingface.co/STRIDE-lab/scibert-application-form-20250221
- Codigo del proyecto PsyNamic: https://github.com/Ineichen-Group/PsyNamic
- Aplicacion web PsyNamic: https://psynamic.dcr.unibe.ch
- Guias de anotacion: https://osf.io/gh6cn
