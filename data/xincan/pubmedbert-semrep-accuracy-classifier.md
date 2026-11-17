# xincan/pubmedbert-semrep-accuracy-classifier

## Resumen

pubmedbert-semrep-accuracy-classifier es un modelo de clasificación de texto desarrollado por el usuario xincan que reproduce el clasificador de precisión basado en PubMedBERT descrito en el artículo de Zhang et al. (2021) sobre completado de grafos de conocimiento para reposicionamiento de fármacos en COVID-19. El modelo recibe una oración de la literatura biomédica junto con una predicación semántica extraída por SemRep (sujeto, predicado, objeto) y predice si esa predicación está realmente respaldada por la oración, es decir, si es correcta o incorrecta.

El problema que resuelve es concreto y relevante para la construcción de grafos de conocimiento biomédicos: SemRep y SemMedDB generan un volumen elevado de predicaciones erróneas, y filtrarlas antes de construir el grafo mejora la calidad de las relaciones extraídas. Este clasificador actúa como etapa de filtrado, etiquetando cada predicación como CORRECT o INCORRECT con una probabilidad asociada.

Arquitectónicamente es un BERT-base (BertForSequenceClassification) de 109.483.778 parámetros, afinado desde BiomedBERT (PubMedBERT) uncased entrenado con abstracts y texto completo. La longitud de contexto es de 512 tokens, suficiente porque la entrada más larga del conjunto de entrenamiento tiene 190 tokens. Está publicado con licencia MIT y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base (BertForSequenceClassification), transformer encoder |
| Parametros totales | 109.483.778 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un BERT-base con cabeza de clasificación de secuencias de dos etiquetas (CORRECT=1, INCORRECT=0), inicializado desde microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext. La entrada es un único texto que concatena la oración normalizada, un token [SEP] y la predicación escrita como "sujeto predicado objeto", todo en minúsculas y con los caracteres no alfanuméricos sustituidos por espacios. La salida son dos logits que pasan por softmax para dar P(INCORRECT) y P(CORRECT).

El entrenamiento se realizó con los datos anotados del artículo original: 7.038 predicaciones SemRep de abstracts de PubMed (67,0% correctas) sobre 20 tipos de predicado, combinando 6.000 anotaciones de Vasilakes et al. (JAMIA Open 2018), 492 predicaciones con menciones de suplementos dietéticos y 546 anotaciones posteriores. El split fue 10% test manteniendo la proporción de etiquetas, el resto balanceado 1:1 y dividido en 90% train / 10% validación, resultando en 3.762 / 416 / 703 predicaciones. Se usó AdamW con learning rate 1e-5, weight decay 0.01, eps 1e-6, schedule lineal con 150 pasos de warm-up, batch size 16, entropía cruzada, máximo 10 épocas, parada temprana tras 3 épocas sin mejora y longitud máxima de 512 tokens. El modelo publicado corresponde a la mejor de 10 ejecuciones (seed 1386, época 4, F1 de validación 0,823). El entrenamiento se ejecutó en una NVIDIA A40.

## Capacidades

- Clasificación binaria de predicaciones semánticas biomédicas: determina si una predicación (sujeto, predicado, objeto) está respaldada por la oración fuente.
- Salida probabilística calibrada mediante softmax, con umbral de decisión P(CORRECT) > 0,5 según el artículo original.
- Procesamiento por lotes para grandes volúmenes de predicaciones (batch_size configurable).
- Manejo de 20 tipos de predicado SemRep, incluyendo INTERACTS_WITH, PROCESS_OF, STIMULATES, TREATS, INHIBITS, USES, COEXISTS_WITH, ADMINISTERED_TO, DIAGNOSES y PRODUCES.
- Especialización en texto biomédico en inglés (abstracts de PubMed).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un clasificador discriminativo, no un modelo generativo.

## Casos de uso

- Filtrado de SemMedDB antes de construir un grafo de conocimiento: se clasifican todas las predicaciones extraídas por SemRep y se descartan las etiquetadas INCORRECT, reduciendo el ruido del grafo con una precisión estimada de 0,871.
- Reposicionamiento de fármacos: el artículo original usa este filtro para completar grafos de conocimiento orientados a identificar relaciones fármaco-enfermedad candidatas en COVID-19.
- Extracción de relaciones biomédicas en pipelines de minería de literatura: se integra como etapa posterior a SemRep para validar cada tripleta antes de almacenarla.
- Curaduría asistida de bases de datos: prioriza las predicaciones con alta P(CORRECT) para revisión humana y descarta automáticamente las de baja probabilidad.
- Construcción de datasets de entrenamiento: al filtrar predicaciones correctas se obtienen tripletas de mayor calidad para entrenar otros modelos de extracción de relaciones.
- Análisis de interacciones fármaco-fármaco o gen-proteína: las predicaciones de tipo INTERACTS_WITH, INHIBITS o STIMULATES se validan contra la oración fuente antes de su uso analítico.
- Evaluación de la calidad de un extractor SemRep en un corpus nuevo: la tasa de predicaciones clasificadas como CORRECT sirve como métrica de precisión del extractor sobre ese corpus.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en el model-index (conjunto de test retenido de 703 predicaciones SemRep):

| Metrica | Valor |
|---|---|
| Precision (test) | 0,871 |
| Recall (test) | 0,815 |
| F1 (test) | 0,842 |

El autor indica además que, promediando sobre 10 modelos entrenados con el mismo procedimiento, el F1 de test es 0,859, frente al 0,854 reportado en el artículo original. No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,44 GB de pesos, en torno a 1-2 GB con overhead de activaciones en lotes pequeños.
- VRAM estimada en fp16: aproximadamente 0,22 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el entrenamiento original usó una NVIDIA A40.
- Cabe holgadamente en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: transformers pipeline, Text Embeddings Inference (el repo incluye el tag text-embeddings-inference y endpoints_compatible), y exportación a otros runtimes si se generan los pesos adecuados (no confirmado en la información disponible).
- Latencia y throughput: no disponibles en la información proporcionada; al ser un BERT-base, el procesamiento por lotes con batch_size 64 es viable en GPU de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pubmedbert-semrep-accuracy-classifier | 109,5 M | 512 | Clasificacion de predicaciones SemRep | MIT | Hugging Face |
| BiomedBERT (PubMedBERT) base | ~110 M | 512 | Modelo base de lenguaje biomedico | MIT | Hugging Face |
| Clasificador del articulo original (Zhang et al. 2021) | ~110 M (BERT-base) | 512 | Clasificacion de predicaciones SemRep | no disponible | Codigo en kilicogluh/lbd-covid |
| BioBERT base | ~110 M | 512 | Modelo base de lenguaje biomedico | no disponible | Hugging Face |

La comparativa directa más relevante es con el clasificador del artículo original, que este modelo reproduce alcanzando un F1 de test de 0,842 (0,859 de media en 10 ejecuciones) frente al 0,854 reportado. BiomedBERT y BioBERT son modelos base sin la cabeza de clasificación específica para esta tarea.

## Limitaciones y advertencias

- Solo soporta inglés y está entrenado exclusivamente con abstracts de PubMed; su rendimiento en texto completo, otros dominios biomédicos o idiomas distintos no está validado.
- El umbral de decisión recomendado (P(CORRECT) > 0,5) implica una tasa de falsos positivos y falsos negativos no despreciable (recall 0,815), por lo que algunas predicaciones incorrectas pasarán el filtro.
- Riesgo de sesgo hacia los tipos de predicado más frecuentes en el entrenamiento (INTERACTS_WITH representa 1.898 de 7.038 ejemplos); el rendimiento en predicados raros puede ser inferior.
- El modelo depende de la calidad de la tokenización y normalización de entrada: debe aplicarse exactamente la normalización descrita (minúsculas, caracteres no alfanuméricos a espacios) para reproducir los resultados.
- No es un modelo generativo ni un extractor de relaciones por sí mismo: requiere que SemRep u otro sistema produzca previamente las predicaciones.
- Licencia MIT, lo que permite uso comercial sin restricciones adicionales, pero el artículo original y los datos de anotación tienen sus propias condiciones que deben revisarse por separado.
- No se han publicado datos sobre calibración de probabilidades más allá del umbral 0,5, ni sobre comportamiento en dominios fuera de PubMed.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente de los resultados declarados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xincan/pubmedbert-semrep-accuracy-classifier
- Modelo base BiomedBERT: https://huggingface.co/microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext
- Articulo original: Zhang R, Hristovski D, Schutte D, Kastrin A, Fiszman M, Kilicoglu H. Drug Repurposing for COVID-19 via Knowledge Graph Completion. Journal of Biomedical Informatics 115:103696 (2021). https://doi.org/10.1016/j.jbi.2021.103696
- Repositorio con datos y codigo de entrenamiento: https://github.com/kilicogluh/lbd-covid
- Notebook de entrenamiento: https://github.com/kilicogluh/lbd-covid/blob/master/filtering/COVID_CLF.ipynb
- Datos publicos de anotacion: https://github.com/kilicogluh/lbd-covid/tree/master/filtering
- Herramienta SemRep y SemMedDB: https://lhncbc.nlm.nih.gov/ii/tools/SemRep_SemMedDB_SKR.html
- Descarga de SemMedDB: https://lhncbc.nlm.nih.gov/ii/tools/SemRep_SemMedDB_SKR/SemMedDB_download.html
