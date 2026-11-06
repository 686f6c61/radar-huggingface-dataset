# Vionex-digital/vioBERT-v3

## Resumen

vioBERT-v3 es un encoder BERT de dominio médico para árabe desarrollado por Vionex Digital Solutions. Parte de MARBERTv2 (UBC-NLP) y aplica preentrenamiento adaptativo al dominio (DAPT) sobre aproximadamente 1,12 millones de documentos médicos en árabe, con un objetivo de masked language modelling y enmascaramiento de palabra completa al 15 %. El resultado es un encoder de 162.942.880 parámetros (BERT-base: 12 capas, tamaño oculto 768, vocabulario de 100K) con contexto de 512 tokens.

El modelo no es generativo: está pensado como base para tareas de comprensión y clasificación en NLP clínico árabe, como el enrutado de consultas de pacientes por especialidad, la extracción de entidades biomédicas y la búsqueda semántica sobre texto sanitario. Su principal valor es la reducción drástica de la perplejidad en dominio médico (de 24,34 a 4,21) y la mejora en precisión de fill-mask (de 70,4 % a 85,9 %) respecto a su base.

Es relevante ahora porque buena parte del texto médico árabe real es informal, dialectal y escrito por pacientes, un registro que los encoders orientados a árabe estándar moderno (MSA) cubren peor. vioBERT-v3 se posiciona explícitamente para ese escenario, aunque el propio autor advierte que no supera a AraBERT v02 en texto MSA formal con conjuntos de datos etiquetados grandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (12 capas, hidden size 768) |
| Parametros totales | 162.942.880 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; cuantizacion no documentada) |
| Idiomas soportados | Árabe (ar), con sesgo hacia MSA y dialectos mashriqíes |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder tipo BERT-base heredado de MARBERTv2, con 12 capas, tamaño oculto 768 y vocabulario de 100.000 tokens. Sobre esa base se realizó un preentrenamiento adaptativo al dominio con masked language modelling y enmascaramiento de palabra completa (15 % de las palabras), longitud de secuencia 512, batch efectivo de 32, optimizador AdamW con learning rate máximo de 5e-5, warm-up lineal del 10 % seguido de decaimiento lineal y weight decay de 0,01. Se ejecutaron 22.000 pasos (aproximadamente 360 millones de tokens) en una única NVIDIA L4 de 24 GB, seleccionando el checkpoint por pseudo-perplejidad y precisión de fill-mask en un conjunto reservado.

El corpus de preentrenamiento combina cuatro fuentes públicas: AHD Arabic Healthcare Dataset (808K pares pregunta-respuesta, CC BY 4.0), Shifaa Arabic Medical Consultations (84.422 consultas, Apache 2.0), categorías médicas de Wikipedia en árabe (unas 5K artículos, CC BY-SA) y material sanitario de la OMS y textos de dominio público. Tras deduplicación y filtrado quedan unos 1,12 millones de documentos con una media de 189 tokens. Se eliminaron los splits de validación y test del benchmark de clasificación del corpus de preentrenamiento y se aplicaron barridos de expresiones regulares para retirar identificadores personales. Las variantes de hamza no se normalizaron porque el tokenizador de MARBERTv2 las distingue. No se documenta RLHF ni DPO, coherente con un encoder entrenado solo con objetivo MLM.

## Capacidades

- Relleno de máscaras (fill-mask) en texto médico árabe, con precisión top-5 del 85,9 %.
- Extracción de características y embeddings para búsqueda semántica y recuperación sobre texto sanitario.
- Clasificación de texto: enrutado de consultas de pacientes por especialidad (evaluado con 5 y 39 clases).
- Reconocimiento de entidades biomédicas (enfermedades y tratamientos) sobre ABioNER.
- Base para fine-tuning con `AutoModelForSequenceClassification` y `AutoTokenizer`.
- Uso como encoder congelado en pipelines de feature extraction y retrieval.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni agentes.
- No tiene capacidades de visión ni audio.
- Multilingüe limitado: solo árabe.

## Casos de uso

- Enrutado de consultas médicas por especialidad: fine-tuning con `num_labels` igual al número de especialidades para clasificar preguntas de pacientes y dirigirlas al servicio adecuado; el modelo rinde mejor en la variante de 39 clases (macro-F1 37,61 frente a 35,99 de MARBERTv2).
- Extracción de entidades clínicas: fine-tuning para NER sobre notas o consultas en árabe informal, detectando enfermedades y tratamientos con F1 de entidad de 96,63 en ABioNER.
- Búsqueda semántica en portales de salud: usar los embeddings del encoder congelado para indexar artículos y consultas y recuperar contenido relevante por similitud vectorial.
- Moderación y clasificación de contenido sanitario: detección de temáticas, urgencia o tipo de consulta en foros y chats de salud con pocos ejemplos etiquetados.
- Análisis de opiniones y FAQs de pacientes: clasificación de quejas o dudas recurrentes en corpus de consultas para priorizar respuestas del equipo médico.
- Feature extraction para modelos downstream: generar representaciones de texto médico árabe como entrada a clasificadores ligeros o sistemas de ranking en producción.
- Normalización y deduplicación de registros: comparar similitud entre consultas o descripciones para agrupar duplicados y unificar taxonomías.

## Benchmarks y rendimiento

Resultados publicados por el autor (medias sobre 3 semillas; valores p de la prueba t de Welch frente a MARBERTv2):

| Evaluacion | MARBERTv2 | vioBERT-v3 | Cambio | p |
|---|---|---|---|---|
| Pseudo-perplejidad médica (menor es mejor) | 24,34 | 4,21 | −82,7 % | – |
| Precisión top-5 en fill-mask | 70,4 % | 85,9 % | +15,5 pts | – |
| Enrutado de especialidad, 5 clases (macro-F1) | 63,56 | 64,53 | +0,97 | 0,08 |
| Enrutado de especialidad, 39 clases (macro-F1) | 35,99 | 37,61 | +1,62 | 0,02 |
| NER biomédico, ABioNER (F1 de entidad) | 95,70 | 96,63 | +0,93 | 0,29 |
| MedAraBench MCQ médico (precisión) | 45,05 | 44,84 | −0,21 | 0,85 |

Comparación adicional citada por el autor frente a AraBERT v02: 38,30 en enrutado de 39 clases y 97,46 en NER, ambos por encima de vioBERT-v3.

## Requisitos de hardware

- Inferencia en fp32: aproximadamente 0,65 GB de pesos (163 M de parámetros), más activaciones; cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: NVIDIA L4 (usada en el entrenamiento), T4, RTX 3060/4090, A100 o H100 para lotes grandes.
- Cabe en GPU consumer y también en CPU para inferencia de baja concurrencia.
- Despliegue: transformers, Hugging Face Inference Endpoints (compatible con endpoints), vLLM no aplica de forma nativa a encoders BERT, aunque puede servirse con TGI o con un servidor HTTP propio basado en transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enrutado 39 clases (macro-F1) | NER ABioNER (F1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| vioBERT-v3 | 162,9 M | 512 | 37,61 | 96,63 | Apache 2.0 | Hugging Face |
| MARBERTv2 | ~163 M | 512 | 35,99 | 95,70 | no disponible en la informacion | Hugging Face |
| AraBERT v02 | BERT-base (~136 M) | 512 | 38,30 | 97,46 | no disponible en la informacion | Hugging Face |

## Limitaciones y advertencias

- Los resultados se basan en 3 semillas y varias diferencias, incluida la de NER (p = 0,29), no son estadísticamente significativas.
- El corpus es mayoritariamente de consultas sanitarias de consumidor; no incluye notas clínicas ni historiales electrónicos, por lo que el rendimiento en documentación clínica puede ser inferior.
- La cobertura se inclina hacia MSA y dialectos mashriqíes; el árabe magrebí está peor representado.
- No supera a AraBERT v02 en texto MSA formal con conjuntos de datos etiquetados grandes ni en enrutado de 39 clases.
- No es adecuado para responder preguntas de exámenes médicos ni para razonamiento clínico; para eso el autor recomienda modelos generativos mayores o métodos de recuperación.
- Riesgo de alucinación no aplica directamente al ser un encoder, pero sí el riesgo de clasificaciones erróneas en dominios poco representados.
- Sesgos: al derivar de consultas de pacientes, puede reflejar sesgos de registro, dialecto y demografía de las fuentes originales.
- Licencia Apache 2.0 permite uso comercial, pero el corpus combinado de preentrenamiento no se redistribuye y las fuentes tienen sus propias licencias (CC BY 4.0, CC BY-SA, Apache 2.0).
- El modelo solo procesa árabe; no admite otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vionex-digital/vioBERT-v3
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Vionex-digital/vioBERT-v3-demo
- Modelo base MARBERTv2: https://huggingface.co/UBC-NLP/MARBERTv2
- Modelo generativo recomendado por el autor (Hakeem-7B): https://huggingface.co/Vionex-digital/Hakeem-7B
- Dataset Shifaa Arabic Medical Consultations: https://huggingface.co/datasets/Ahmed-Selem/Shifaa_Arabic_Medical_Consultations
- Dataset AHD Arabic Healthcare Dataset: https://doi.org/10.17632/mgj29ndgrk.5
- Modelo AraBERT v02: https://huggingface.co/aubmindlab/bert-base-arabertv02
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
