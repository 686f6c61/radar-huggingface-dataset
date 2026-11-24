# Z-Bach/bc5cdr-ner-bert-base-uncased

## Resumen

Z-Bach/bc5cdr-ner-bert-base-uncased es un modelo de clasificación de tokens (named entity recognition) obtenido mediante fine-tuning de google-bert/bert-base-uncased sobre el corpus BC5CDR. Detecta menciones de sustancias químicas y enfermedades en resúmenes biomédicos en inglés, con cinco etiquetas en formato IOB2 (B-Chemical, I-Chemical, B-Disease, I-Disease, O). Lo publica el autor Z-Bach en el marco de un proyecto de curso de AI centar Lipik (Croacia) orientado a estudiar el origen del rendimiento en NER: nombres memorizados, nombres nuevos de conceptos conocidos o conceptos nunca vistos en entrenamiento.

El modelo es un transformer encoder BERT-base con 108,9 millones de parámetros y un límite de 512 sub-tokens por secuencia, heredado del modelo base. No es un modelo generativo: no produce texto, solo asigna una etiqueta a cada token de entrada. Su relevancia es acotada y didáctica; el propio autor lo declara apto únicamente para demostración y docencia, no para uso clínico, diagnóstico ni regulatorio.

La ficha se basa exclusivamente en la model card y en los metadatos del repositorio de Hugging Face. El checkpoint corresponde a la mediana de tres semillas de entrenamiento según F1 de validación (semilla 13), con pesos almacenados en fp32 y evaluación realizada también en fp32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (google-bert/bert-base-uncased, revision 86b5e0934494bd15c9632b12f734a8a67f723594) |
| Parametros totales | 108.895.493 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 sub-tokens por secuencia (max length de entrenamiento) |
| Tipos de cuantizacion | no disponible en la model card; pesos publicados en fp32 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de BERT-base sin modificaciones estructurales: encoder transformer de 12 capas con atencion bidireccional completa, adaptado a clasificacion de tokens mediante una cabeza lineal sobre las representaciones contextuales. El vocabulario y el tokenizador son los de bert-base-uncased (WordPiece, texto en minusculas). El modelo se aplica a palabras previamente segmentadas (`is_split_into_words=True`), y a cada palabra se le asigna la etiqueta de su primer sub-token.

El entrenamiento usa el split de train de BC5CDR tal como se publica en tner/bc5cdr (5.228 frases), con seleccion de la mejor epoca sobre el split de validacion. Hiperparametros: 4 epocas (mejor en la 3), learning rate 5e-05, batch size 16, warmup ratio 0,1, weight decay 0,01, scheduler lineal, longitud maxima de 512 sub-tokens y precision mixta fp16. Se entreno en una Tesla T4 con un tiempo total de 168 segundos. No se documenta RLHF, DPO ni ninguna innovacion de decodificacion; es un fine-tuning supervisado convencional sobre un unico dataset.

## Capacidades

- Reconocimiento de entidades nombradas de tipo sustancia quimica (B-Chemical, I-Chemical) en texto biomedico en ingles.
- Reconocimiento de entidades nombradas de tipo enfermedad (B-Disease, I-Disease) en el mismo dominio.
- Clasificacion a nivel de palabra con etiquetado IOB2 y normalizacion de etiquetas I-X huerfanas a B-X antes de leer entidades.
- Procesamiento de resumenes de PubMed y textos de estructura similar (prosa cientifica biomedica en ingles).
- Entrada por lotes de palabras ya segmentadas; no realiza tokenizacion linguistica propia mas alla del WordPiece del tokenizador.
- No dispone de tool calling, function calling, razonamiento multi-paso, modo thinking, vision ni audio.
- Capacidad multilingue limitada al ingles; no se ha entrenado ni evaluado en otros idiomas.

## Casos de uso

- Anotacion asistida de corpus biomedicos: el modelo pre-etiqueta menciones de farmacos y enfermedades en resumenes de PubMed, que despues se revisan manualmente; reduce el trabajo de anotacion en tareas de construccion de datasets.
- Extraccion de relaciones farmaco-enfermedad como paso previo: las entidades detectadas sirven de entrada a un modulo posterior de relation extraction o de normalizacion a ontologias (MeSH, UMLS).
- Filtrado y triaje de literatura cientifica: dado un gran volumen de abstracts, marcar los que mencionan una enfermedad o un compuesto concreto para revision humana prioritaria.
- Docencia y experimentacion en NLP biomedico: el modelo y su protocolo de evaluacion estricto permiten estudiar de donde viene el rendimiento en NER (memorizacion frente a generalizacion) en un entorno de coste bajo (entrenamiento en T4 en menos de tres minutos).
- Baseline en pipelines de investigacion: punto de comparacion reproducible para modelos NER mas grandes o especializados antes de invertir en ellos.
- Prototipado de buscadores internos de literatura: indexar abstracts por entidades quimicas y de enfermedad para consultas facetadas en una herramienta de documentacion cientifica.
- En ninguno de estos casos debe usarse como componente de decision clinica; el autor lo restringe explicitamente a demostracion y docencia.

## Benchmarks y rendimiento

Evaluacion en el split de test de BC5CDR con coincidencia estricta de entidad (seqeval, `mode="strict"`, IOB2): deben coincidir ambos limites y el tipo. El autor advierte que algunos resultados publicados usan coincidencia laxa y no son directamente comparables.

| Entidad | Precision | Recall | F1 |
|---|---|---|---|
| Chemical | 89,00 | 92,09 | 90,52 |
| Disease | 79,94 | 81,71 | 80,82 |
| Micro average | 84,94 | 87,41 | 86,16 |

Comprobacion cruzada sin entrenamiento adicional en el split de test de NCBI-disease (solo enfermedades): precision 60,86, recall 50,21, F1 55,02. El autor atribuye parte de la caida a diferencias de anotacion y tokenizacion entre ambos datasets, no solo al modelo.

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales; no son aplicables a un modelo de clasificacion de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB solo para pesos (108,9 M de parametros), mas activaciones y overhead; en la practica cabe holgadamente en cualquier GPU con 2 GB o mas. En fp16 o bfloat16 el peso baja a unos 0,22 GB.
- GPU recomendadas: cualquier GPU moderna sirve; el propio autor entreno en una Tesla T4. Para lotes grandes, A100, H100, L4 o RTX 4090 aportan margen de sobra; para inferencia interactiva basta una GPU consumer de gama baja o incluso CPU.
- Cabe en GPU consumer: si, en practicamente todas (GTX 1650, RTX 3060, RTX 4090, etc.), y en CPU con latencia aceptable para lotes pequenos.
- Opciones de despliegue: transformers con PyTorch (via `AutoModelForTokenClassification`), pipeline `token-classification` de transformers, ONNX Runtime o TorchScript para exportacion, y servidores de inferencia compatibles con modelos transformers (TGI, vLLM en modo encoder) aunque el beneficio de estas ultimas es marginal por el tamano del modelo.
- Latencia y throughput: no disponibles en la model card; el unico dato temporal es el entrenamiento (168 s en T4). Por el tamano, se espera throughput de miles de frases por segundo en GPU moderna con lotes, pero no hay medicion publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Z-Bach/bc5cdr-ner-bert-base-uncased | 108,9 M | 512 sub-tokens | NER quimico/enfermedad (BC5CDR) | apache-2.0 | Hugging Face |
| scispaCy (modelos biomedical NER) | no disponible en la informacion proporcionada | no disponible | NER biomedico general | MIT (segun proyecto) | paquete Python |
| Stanza (modelos biomedical) | no disponible en la informacion proporcionada | no disponible | NER y parsing biomedico | Apache 2.0 (segun proyecto) | paquete Python |
| BERT-base NER generico (p. ej. dslim/bert-base-NER) | ~108 M | 512 sub-tokens | NER general (PER, ORG, LOC, MISC) | MIT/Apache segun checkpoint | Hugging Face |

El autor senala que herramientas dedicadas como scispaCy o Stanza estan mejor preparadas para uso real en NER biomedico. La comparacion cuantitativa con esos sistemas no esta disponible en la informacion proporcionada; no se han publicado resultados comparativos en la model card.

## Limitaciones y advertencias

- Entrenado sobre un unico benchmark de 2016 (1.500 resumenes de PubMed sobre enfermedades inducidas por sustancias quimicas); se espera un rendimiento inferior en otros tipos de texto.
- Procesa cada frase de forma aislada, por lo que las abreviaturas definidas en otra frase a menudo se pierden o se etiquetan con el tipo incorrecto.
- El propio autor recomienda no usarlo en produccion clinica y remite a scispaCy o Stanza para uso real.
- Caida notable en generalizacion cruzada: F1 de 55,02 en NCBI-disease sin reentrenamiento, frente a 80,82 en el dominio de BC5CDR.
- Riesgo de alucinacion en el sentido de falsos positivos y etiquetas incorrectas: es un clasificador, no un generador, pero puede marcar terminos no entidad o asignar el tipo equivocado, especialmente en texto fuera de dominio.
- Sesgos: no documentados en la model card; al entrenarse solo con literatura biomedica en ingles, el vocabulario y las convenciones de anotacion estan sesgados hacia ese dominio.
- Limitacion de idioma: solo ingles; no se ha evaluado en castellano ni en otros idiomas.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero la model card restringe explicitamente el uso a demostracion y docencia y prohibe uso clinico, diagnostico o regulatorio; conviene respetar esa advertencia del autor.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de mantenimiento posterior.
- No se documentan tecnicas de calibracion ni umbrales de confianza; en un pipeline real habria que anadir umbrales y validacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Z-Bach/bc5cdr-ner-bert-base-uncased
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset de entrenamiento: https://huggingface.co/datasets/tner/bc5cdr
- Repositorio de seqeval (metrica de evaluacion): https://github.com/chakki-works/seqeval
- Proyecto scispaCy: https://github.com/allenai/scispacy
- Proyecto Stanza: https://github.com/stanfordnlp/stanza
