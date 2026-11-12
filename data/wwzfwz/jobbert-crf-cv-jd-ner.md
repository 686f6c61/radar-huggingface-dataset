# WwzFwz/jobbert-crf-cv-jd-ner

## Resumen

JobBERT-CRF es un modelo de reconocimiento de entidades nombradas (NER) especializado en el dominio de recursos humanos: extrae cuatro tipos de entidad (`SKILL`, `JOB_TITLE`, `EDUCATION` y `EXPERIENCE`) tanto de currículums (CV) como de descripciones de puesto (JD). Lo desarrolla el usuario WwzFwz como tarea 1 de un proyecto de curso de PLN del Institut Teknologi Bandung, y se apoya en el modelo base `jjzha/jobbert-base-cased`, un BERT entrenado sobre ofertas de empleo en el marco del trabajo SkillSpan (NAACL 2022).

El modelo no es un `AutoModelForTokenClassification` estándar: añade una capa CRF (campo aleatorio condicional) sobre las emisiones lineales del encoder, con transiciones aprendidas y decodificación de Viterbi que prohíbe transiciones BIO inválidas. Con 107,7 millones de parámetros, es un modelo compacto pensado para alimentar pipelines de clasificación de currículums y de emparejamiento CV-JD.

Su relevancia es doble: por un lado, demuestra empíricamente que una cabeza CRF supera a una cabeza softmax en este dominio (F1 micro exacto de 0,470 frente a 0,394 en el conjunto de test de CV); por otro, publica una evaluación honesta y desglosada por tipo de entidad y por dominio, algo poco habitual en modelos de este tamaño. La licencia no está declarada en el repositorio, lo que limita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (JobBERT base) + dropout + capa lineal de emisiones + capa CRF con decodificacion de Viterbi restringida |
| Parametros totales | 107.726.700 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (documentos troceados a ≤ 510 subwords durante el entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se publican variantes GGUF ni cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible en el repositorio; la model card indica que el modelo base no declara licencia y que esta derivada se comparte para uso academico no comercial |
| Formato de pesos | safetensors (tamano del repo: 0,4 GB) |

## Arquitectura y entrenamiento

La arquitectura parte de `jjzha/jobbert-base-cased`, un BERT base ajustado sobre ofertas de empleo, al que se le añade un módulo PyTorch personalizado: dropout, una capa lineal que produce emisiones por token y una capa CRF con matriz de transiciones aprendida. La decodificación usa Viterbi con transiciones BIO inválidas prohibidas, lo que reduce la fragmentación de entidades respecto a una cabeza softmax convencional. El modelo no se carga con las clases estándar de Transformers, sino con el script `t1_ner_predict.py` incluido en el repositorio.

El entrenamiento combina dos fuentes: aproximadamente 824 currículums deduplicados del *Resume NER training dataset* de Kaggle (licencia MIT), incluyendo copias en minúsculas y sin puntuación para imitar el estilo de texto de ResumeAtlas, y unas 9.600 frases de anuncios de empleo del Reino Unido del corpus de Green et al. (LREC 2022, CC BY 4.0), con etiquetas de crowdsourcing agregadas seleccionando el trabajador de mayor precisión por frase. Se aplicó un mapeo de etiquetas para unificar esquemas (`DESIGNATION`/`Occupation` → `JOB_TITLE`; `EDUCATION`, `CERTIFICATION`, `Qualification` → `EDUCATION`; `SKILL`, `LANGUAGE` → `SKILL`; `EXPERIENCE` → `EXPERIENCE`), y las etiquetas poco fiables (`OTHER`, `EXPERTISE`, `ACTION`, `COLLABORATION`) se tratan como desconocidas mediante un CRF de etiquetas parciales que marginaliza sobre todas las etiquetas en esas posiciones. Nombres de personas, correos, ubicaciones y empresas se entrenan como `O`, de modo que el modelo no los extrae.

Los hiperparámetros son 3 épocas, AdamW con lr 3e-5 (5e-3 para los parámetros del CRF), calentamiento lineal del 10 %, batch de 4 con acumulación de 2, fp16 y troceado a 510 subwords. La mejor época se seleccionó por una puntuación de validación S = media del F1 micro exacto en CV y del F1 micro parcial en JD.

## Capacidades

- Extracción de entidades de tipo `SKILL` en currículums y descripciones de puesto.
- Extracción de `JOB_TITLE` (puestos y designaciones).
- Extracción de `EDUCATION` (titulaciones, certificaciones y cualificaciones).
- Extracción de `EXPERIENCE` (duraciones explícitas y rangos de fechas).
- Cálculo heurístico de `experience_years` a partir de la máxima duración explícita y del total agregado de rangos de años.
- Normalización de salida: valores en minúsculas y deduplicados.
- Procesamiento conjunto de CV y JD con el mismo modelo y esquema de etiquetas.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio.
- Capacidad monolingüe: únicamente inglés.

## Casos de uso

- Filtrado y enriquecimiento de currículums en un ATS: el modelo extrae habilidades, titulaciones y años de experiencia de cada CV para poblar campos estructurados antes de la clasificación por área y seniority, que es precisamente el pipeline para el que se diseñó.
- Emparejamiento CV-JD: al aplicar el mismo extractor a la oferta y al currículum se obtienen conjuntos comparables de `SKILL` y `JOB_TITLE` que alimentan un modelo de similitud o un ranking de candidatos.
- Búsqueda semántica de candidatos por competencias: las habilidades extraídas se indexan en un motor de búsqueda; la model card advierte de que la comparación debe ser semántica y no por coincidencia exacta de cadena, dado que los estilos de span difieren entre fuentes.
- Normalización de ofertas de empleo para portales de empleo: extracción de título, requisitos educativos y experiencia mínima de anuncios en inglés para generar metadatos y filtros facetados.
- Análisis de mercado laboral: agregación de habilidades demandadas y niveles educativos solicitados sobre corpus de ofertas, con la cautela de que el modelo se entrenó con anuncios del Reino Unido.
- Preprocesamiento para modelos posteriores de clasificación de campo y seniority: la propia model card indica que las entidades extraídas alimentan un clasificador de currículums, por lo que este NER actúa como primer eslabón de una cadena.
- Enriquecimiento de bases de datos de talento con experiencia cuantificada: el campo `experience_years` permite ordenar o filtrar candidatos, siempre revisando los casos en que la heurística sobreestima.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre conjuntos de test reservados (semilla 42), F1 a nivel de entidad. *Exact* = mismo span y tipo; *partial* = span solapado y mismo tipo.

| Conjunto de test | micro exact | micro partial | SKILL | JOB_TITLE | EDUCATION | EXPERIENCE |
|---|---|---|---|---|---|---|
| CV test (exact) | 0,470 | 0,604 | 0,370 | 0,521 | 0,544 | 0,638 |
| CV test, minusculas | 0,437 | 0,588 | 0,327 | 0,493 | 0,464 | 0,634 |
| JD test, Green gold (partial) | 0,566 | 0,801 | 0,785 | 0,876 | 0,739 | 0,941 |

Comparación interna con la misma datos y semilla, cabeza softmax en lugar de CRF: CV micro exacto 0,394 y JD micro parcial 0,785. Puntuación media de validación sobre 2 semillas: softmax 0,591 → softmax con Viterbi restringido 0,618 → CRF 0,633.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 250-300 MB para los pesos (107,7 M de parámetros), más el overhead de activaciones y del decodificador de Viterbi; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; para lotes grandes en servidor, A100 o H100 aportan margen pero no son necesarias.
- Cabe en GPU consumer: sí, en todas las NVIDIA con soporte CUDA de los últimos años, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: al ser un módulo PyTorch personalizado, requiere el script `t1_ner_predict.py` del repositorio; no es compatible directamente con vLLM, TGI, llama.cpp ni Ollama, que esperan arquitecturas estándar de Transformers o GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WwzFwz/jobbert-crf-cv-jd-ner | 107,7 M | 512 tokens | NER de 4 entidades en CV y JD | no disponible (uso academico no comercial segun la model card) | Hugging Face, requiere script propio |
| jjzha/jobbert-base-cased | no disponible | 512 tokens | Extraccion de habilidades en ofertas de empleo (SkillSpan) | no disponible | Hugging Face, carga estandar con Transformers |
| Modelo con cabeza softmax (misma base y datos) | 107,7 M aprox. | 512 tokens | NER de 4 entidades en CV y JD | no disponible | Referencia interna de la model card, no publicada como checkpoint independiente |

La comparación con alternativas de la misma categoría (por ejemplo, otros NER de habilidades como los publicados en SkillSpan o modelos de extracción de entidades en currículums) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Los currículums de entrenamiento son mayoritariamente de TI y procedentes de India (Indeed); no hay evaluación gold en otros dominios, por lo que el rendimiento fuera de ese ámbito es incierto.
- El estilo de los spans `SKILL` varía según la fuente: en CV suelen ser de 1-2 palabras, mientras que en JD abundan frases largas ("ability to work in a fast paced environment"); la comparación debe ser semántica y no por cadena exacta.
- El CRF es más conservador que la cabeza softmax: extrae menos entidades por texto a cambio de muchos menos fragmentos, lo que puede producir falsos negativos en textos densos.
- El texto con palabras pegadas (por ejemplo, "AnalystLocation" o "field.5 years") degrada la extracción.
- `experience_years` es una heurística que toma el máximo entre duraciones explícitas y el total agregado de rangos de años, y puede superar lo que el texto afirma.
- Riesgo de alucinación de spans: al ser un modelo discriminativo de etiquetado, el riesgo se manifiesta como entidades mal delimitadas o inventadas por solapamiento, no como texto generado.
- Sesgos derivados del corpus: predominio de currículums de TI de India y de anuncios del Reino Unido, con posibles sesgos de género, origen o sector en las etiquetas de crowdsourcing.
- Restricciones de licencia: el repositorio no declara licencia y la model card indica uso académico no comercial; el modelo base tampoco declara licencia, lo que impide asumir permisos de uso comercial.
- En producción, la integración exige cargar el módulo personalizado del repositorio en lugar de las clases estándar de Transformers, lo que complica el despliegue con servidores de inferencia convencionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WwzFwz/jobbert-crf-cv-jd-ner
- Modelo base JobBERT: https://huggingface.co/jjzha/jobbert-base-cased
- Dataset de NER en currículums (Kaggle, MIT): https://www.kaggle.com/datasets/yashpwrr/resume-ner-training-dataset
- Dataset de extracción de habilidades (Green et al., LREC 2022, CC BY 4.0): https://github.com/acp19tag/skill-extraction-dataset
- Paper SkillSpan (Zhang, Jensen, Sonniks & Plank, NAACL 2022): no disponible como enlace en la información proporcionada
- Paper de Green, Maynard & Lin (LREC 2022): no disponible como enlace en la información proporcionada
- Demo o Space: no disponible
