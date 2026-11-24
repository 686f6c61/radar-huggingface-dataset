# Z-Bach/bc5cdr-ner-pubmedbert

## Resumen

Z-Bach/bc5cdr-ner-pubmedbert es un modelo de clasificación de tokens (token classification) especializado en reconocimiento de entidades nombradas (NER) biomédicas en inglés. Marca productos químicos (chemicals) y enfermedades (diseases) en resúmenes (abstracts) de PubMed. Lo desarrolla el usuario Z-Bach en el contexto de un proyecto de curso del AI centar Lipik (Croacia), cuyo objetivo es estudiar el origen del rendimiento en NER: si proviene de nombres memorizados, de nombres nuevos de conceptos conocidos o de conceptos nunca vistos en entrenamiento.

El modelo parte de microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract (revisión d673b8835373c6fa116d6d8006b33d48734e305d), un BERT base de arquitectura transformer encoder con 108.895.493 parámetros, y se afina sobre el split de entrenamiento de BC5CDR tal como se publica en el dataset tner/bc5cdr (5228 frases). El checkpoint publicado es la mediana de tres semillas de entrenamiento según F1 de validación (semilla 87).

Su relevancia es doble: por un lado ofrece un punto de referencia reproducible y con métricas estrictas (seqeval en modo strict, IOB2) para la tarea canónica de NER químico-enfermedad; por otro, su model card es explícita sobre el alcance: es un modelo de demostración y docencia, no apto para uso clínico, diagnóstico ni regulatorio. El repositorio ocupa 0,4 GB y los pesos se almacenan en fp32.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, BiomedBERT) para token classification |
| Parámetros totales | 108.895.493 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 sub-tokens (max length de entrenamiento) |
| Tipos de cuantización | no disponible (pesos publicados en fp32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder tipo BERT base con cabeza de clasificación de tokens, inicializado desde microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract, un modelo preentrenado sobre literatura biomédica. La cabeza emite cinco etiquetas en formato IOB2: `B-Chemical`, `I-Chemical`, `B-Disease`, `I-Disease` y `O`. El modelo procesa cada frase de forma independiente, con un máximo de 512 sub-tokens.

El ajuste fino se realizó sobre el split de entrenamiento de BC5CDR publicado en tner/bc5cdr (5228 frases), eligiendo la mejor época según el split de validación. Hiperparámetros: 4 épocas (la mejor fue la 4), learning rate 5e-05, batch size 16, warmup ratio 0,1, weight decay 0,01, scheduler lineal y precisión mixta fp16. El entrenamiento se ejecutó en una Tesla T4 y duró 149 segundos. Los pesos se almacenan en fp32 y la evaluación se hizo también en fp32. No se documenta RLHF, DPO ni ninguna innovación de decodificación; el interés técnico está en el protocolo de evaluación estricto y en el análisis de generalización a nombres y conceptos no vistos.

## Capacidades

- Reconocimiento de entidades nombradas de tipo producto químico (`Chemical`) y enfermedad (`Disease`) en texto biomédico en inglés.
- Etiquetado a nivel de palabra: cada palabra recibe la etiqueta de su primer sub-token; los `I-X` huérfanos se convierten en `B-X` antes de leer entidades.
- Procesamiento de resúmenes de PubMed con tokenización previa obligatoria al estilo de tner/bc5cdr (puntuación separada de las palabras, guiones internos conservados en la palabra).
- Evaluación con coincidencia estricta de entidades (límites y tipo correctos, seqeval `mode="strict"`, IOB2).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe: únicamente inglés.
- No es un modelo generativo: no produce texto libre, solo etiquetas por token.

## Casos de uso

- Anotación asistida de corpus biomédicos: el modelo preetiqueta menciones de fármacos y enfermedades en abstracts de PubMed, que después revisa un anotador humano; reduce el trabajo manual en la construcción de datasets de NER químico-enfermedad con F1 micro de 89,92 en BC5CDR.
- Extracción de relaciones fármaco-enfermedad en pipelines de minería de literatura: las entidades detectadas sirven como entrada a un clasificador de relaciones (por ejemplo, detección de efectos adversos) en sistemas de revisión sistemática.
- Docencia y experimentación sobre el origen del rendimiento en NER: el modelo y su protocolo permiten reproducir el análisis de memorización frente a generalización a conceptos nuevos, con métricas estrictas comparables.
- Baseline de referencia para investigación en NER biomédico: punto de partida reproducible (semilla 87, hiperparámetros documentados) contra el que comparar modelos mayores o con contextos más amplios.
- Indexación y búsqueda semántica de literatura médica: enriquecer documentos con etiquetas de entidades para filtros facetados por compuesto químico o patología en un buscador interno.
- Evaluación de robustez entre dominios: el propio autor documenta la caída a F1 68,12 en NCBI-disease sin reentrenar, lo que lo hace útil para estudiar el efecto de convenciones de anotación y tokenización distintas entre datasets.

## Benchmarks y rendimiento

Evaluación en el split de test de BC5CDR con coincidencia estricta de entidades (seqeval, `mode="strict"`, IOB2):

| Entidad | Precisión | Recall | F1 |
|---|---|---|---|
| Chemical | 92,64 | 94,89 | 93,75 |
| Disease | 82,51 | 88,40 | 85,36 |
| Micro average | 87,96 | 91,97 | 89,92 |

Comprobación cruzada sin reentrenamiento en el split de test de NCBI-disease (solo enfermedades): precisión 71,56, recall 65,00, F1 68,12. El autor señala que parte de la caída se debe a diferencias de anotación y tokenización entre ambos datasets, no solo al modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,44 GB solo para pesos (108,9 M de parámetros × 4 bytes), más activaciones; en la práctica cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- En fp16 los pesos ocupan unos 0,22 GB, aunque el autor no publica una variante fp16 del checkpoint.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el entrenamiento se hizo en una Tesla T4. Para lotes grandes, A100 o H100 no son necesarias.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: transformers (AutoModelForTokenClassification), pipeline `token-classification` de Hugging Face y servidores compatibles con la librería (por ejemplo, TGI si se convierte el checkpoint). No se documentan artefactos GGUF ni compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no disponibles. El único dato temporal publicado es el tiempo de entrenamiento (149 s en una T4).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Z-Bach/bc5cdr-ner-pubmedbert | 108,9 M | 512 sub-tokens | NER chemical/disease (BC5CDR) | MIT | Hugging Face |
| microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract | ~110 M (BERT base) | 512 sub-tokens | Modelo base preentrenado; requiere ajuste para NER | MIT (según el modelo base) | Hugging Face |
| scispaCy / Stanza | no disponible | no disponible | NER biomédico en producción | no disponible | Librerías de código abierto |

El autor indica explícitamente que herramientas dedicadas de NLP biomédico como scispaCy o Stanza están mejor preparadas para uso real. No se dispone de cifras de rendimiento de esas alternativas en la información proporcionada, por lo que la comparación cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Modelo de demostración y docencia: no apto para uso clínico, diagnóstico ni regulatorio, según el propio autor.
- Entrenado sobre un único benchmark de 2016 (1500 abstracts de PubMed sobre enfermedades inducidas por productos químicos); se espera menor rendimiento en otros tipos de texto.
- Procesa cada frase por separado, por lo que las abreviaturas definidas en otra frase a menudo se pierden o reciben el tipo incorrecto.
- La tokenización de entrada debe replicar la convención de tner/bc5cdr (puntuación separada, guiones internos conservados); desviarse de ella degrada los resultados.
- Las métricas publicadas usan coincidencia estricta; comparaciones con resultados de coincidencia laxa no son válidas.
- Solo inglés; sin capacidades multilingües.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y negativos en la detección de entidades, especialmente en clases minoritarias como Disease (F1 85,36 frente a 93,75 en Chemical).
- Licencia MIT permite uso comercial, pero la advertencia del autor sobre uso clínico y regulatorio debe respetarse.
- Sesgos conocidos: no documentados explícitamente; el dominio restringido a literatura biomédica condiciona su comportamiento fuera de ese registro.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Z-Bach/bc5cdr-ner-pubmedbert
- Modelo base: https://huggingface.co/microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract
- Dataset de entrenamiento: https://huggingface.co/datasets/tner/bc5cdr
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
