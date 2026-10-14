# univo-models/static-similarity-mrl-multilingual-int8-128

## Resumen

El modelo `univo-models/static-similarity-mrl-multilingual-int8-128` es un modelo de embeddings estáticos multilingües publicado por el proyecto Univo, una biblioteca local de detección de duplicados. No es un transformer generativo: se trata de una versión reducida y cuantizada del modelo `sentence-transformers/static-similarity-mrl-multilingual-v1` de Sentence Transformers, reempaquetada en el formato de ficheros de Model2Vec. El modelo sirve como opción por defecto de Univo para comparación semántica y deduplicación de registros, y pesa 15 MB en disco.

Técnicamente, el embedding de un texto se calcula como la media de los vectores de sus tokens, normalizada a longitud unitaria, sin que se ejecute ninguna red neuronal en inferencia. Los pesos originales en float32 se han cuantizado a int8 y se han truncado a las primeras 128 de las 1.024 dimensiones, aprovechando que el modelo original se entrenó con Matryoshka representation learning y que las dimensiones iniciales concentran la mayor parte de la información. El resultado son 13.552.512 parámetros almacenados y un tokenizador multilingüe de BERT con 105.879 tokens.

Su relevancia actual radica en la combinación de huella mínima, velocidad muy alta de codificación (hasta 176.000 textos por segundo con 8 hilos en un Apple M2) y cobertura de 50 idiomas, lo que lo hace apto para pipelines de deduplicación a gran escala que se ejecutan en CPU y en local, sin dependencia de servicios externos ni GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estáticos (media de vectores de token, sin red neuronal en inferencia); formato Model2Vec |
| Parametros totales | 13.552.512 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (truncación del tokenizador) |
| Tipos de cuantizacion | int8 con una única escala global para toda la matriz (magnitud máxima dividida por 127, redondeo a través de float16 y recorte a [-127, 127]); el original está en float32 |
| Idiomas soportados | 50 idiomas: árabe, búlgaro, catalán, checo, danés, alemán, griego, inglés, español, estonio, persa, finés, francés, gallego, guyaratí, hebreo, hindi, croata, húngaro, armenio, indonesio, italiano, japonés, georgiano, coreano, kurdo, lituano, letón, macedonio, mongol, maratí, malayo, birmano, noruego bokmål, neerlandés, polaco, portugués, rumano, ruso, eslovaco, esloveno, albanés, serbio, sueco, tailandés, turco, ucraniano, urdu, vietnamita y chino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (junto con `config.json` y `tokenizer.json` en el layout de Model2Vec) |

## Arquitectura y entrenamiento

El modelo no emplea una arquitectura transformer en inferencia. Hereda el enfoque de los *static embedding models* de Sentence Transformers: cada token tiene un vector aprendido y el embedding de una secuencia es la media aritmética de los vectores de sus tokens, normalizada a norma unitaria. El repositorio añade un `config.json` y renombra el tensor `embedding.weight` a `embeddings`; el tokenizador es el original de BERT multilingüe sin distinción de mayúsculas, con 105.879 tokens y truncación a 512 tokens.

Respecto al modelo del que deriva, se aplicaron tres modificaciones: reempaquetado de ficheros al layout de Model2Vec, cuantización a int8 con una sola escala para toda la matriz (la escala no se almacena porque la similitud coseno la ignora) y truncado de 1.024 a 128 dimensiones. El modelo original fue entrenado con Matryoshka representation learning, de modo que las dimensiones iniciales son las más informativas y el truncado preserva la mayor parte de la capacidad de representación. El script `tools/build_default_model.py` del repositorio de Univo reproduce estos ficheros byte a byte desde el original usando solo la biblioteca estándar de Python. No se documentan datos sobre el volumen de tokens de entrenamiento ni sobre fases de RLHF o DPO, ya que este repositorio es una derivación, no un entrenamiento nuevo.

## Capacidades

- Generación de embeddings de frases y textos para similitud semántica (`pipeline_tag: sentence-similarity`).
- Deduplicación y detección de duplicados de registros, nombres de organizaciones, entidades y campos textuales.
- Recuperación semántica y búsqueda por similitud sobre corpus multilingües.
- Agrupamiento (*clustering*) de textos por proximidad en el espacio de embeddings.
- Cobertura multilingüe de 50 idiomas con un único modelo y un único espacio vectorial, lo que permite comparar textos en idiomas distintos.
- Inferencia puramente en CPU y sin red neuronal, lo que habilita ejecución offline tras la primera descarga.
- Compatibilidad con cualquier runtime de Model2Vec, incluido `model2vec` en Python y `model2vec-rs` en Rust.
- Integración con la biblioteca Univo como fuente de evidencia semántica dentro de un esquema de comparación más amplio.

No dispone de generación de texto, razonamiento, código, matemáticas, visión, *tool calling*, soporte de agentes ni modo de razonamiento: es exclusivamente un codificador de embeddings.

## Casos de uso

- Deduplicación de bases de datos de organizaciones: Univo compara nombres como "Universität Wien" y "University of Vienna" y detecta el duplicado; el uso de embeddings como una evidencia más, junto con comparación léxica y reglas de veto, permite operar a escala sin depender de un servicio externo.
- Limpieza de catálogos de clientes o proveedores: agrupar registros que designan la misma entidad escrita en idiomas distintos o con variantes de transliteración, aprovechando los 50 idiomas cubiertos.
- Resolución de entidades en pipelines ETL: generar embeddings de campos como nombre, dirección o razón social y usarlos para proponer candidatos a fusión antes de una revisión humana.
- Búsqueda semántica local en aplicaciones de escritorio o móviles: al pesar 15 MB y no requerir GPU, el modelo puede embarcarse en un cliente y responder sin conexión.
- Agrupamiento temático de tickets o incidencias: agrupar miles de tickets por similitud para enrutarlos al equipo adecuado, a un coste de cómputo muy bajo.
- Filtrado previo en sistemas de recuperación aumentada (RAG): usar los embeddings como primera fase de recuperación barata en CPU antes de un *reranker* más pesado.
- Detección de near-duplicates en corpus de noticias o documentación: localizar textos casi idénticos entre fuentes, con especial utilidad en corpus multilingües.
- Indexación de gran volumen con requisitos de latencia estrictos: con 176.000 textos por segundo en 8 hilos sobre un Apple M2, es viable procesar millones de registros en minutos.

## Benchmarks y rendimiento

Los datos proceden de la evaluación propia del proyecto Univo, realizada sobre un Apple M2 con compilaciones de release, y no de los autores originales. El benchmark compara nombres de organizaciones con sus alias y acrónimos, extraídos del registro público ROR (CC0). La división de validación se usó para elegir esta variante (int8, 128 dimensiones) por maximizar el *recall* a un umbral calibrado para al menos un 98% de precisión; la división de test también se vio durante la comparación de variantes, por lo que sus cifras son exploratorias y su confirmación en un conjunto no visto está pendiente.

| Métrica | Este modelo | potion-base-8M |
|---|---|---|
| Recall en validación con precisión >= 98% | 32,9% | 19,6% |
| Falsos positivos en validación (de 1.173) | 9 | 5 |
| Recall en test exploratorio, todos los idiomas | 30,9% | 17,9% |
| Recall en test exploratorio, nombres en inglés | 54,6% | 44,0% |
| Recall en test exploratorio, otros idiomas | 24,4% | 10,7% |
| Precisión en test exploratorio (falsos positivos de 1.173) | 95,6% (19) | 96,8% (8) |
| Ficheros | 15 MB | 31 MB |
| Tiempo de carga | 72 ms | 18 ms |
| Textos por segundo, 1 / 8 hilos | 89.000 / 176.000 | 78.000 / 141.000 |

## Requisitos de hardware

- No requiere GPU: la inferencia consiste en una búsqueda en tabla y una media de vectores, sin capas neuronales.
- VRAM estimada para inferencia: 0 GB; el modelo ocupa aproximadamente 15 MB en disco y una cantidad similar en memoria.
- GPU recomendadas: ninguna en particular; si se desea, cualquier GPU sirve para acelerar el indexado vectorial posterior, pero no el cálculo de embeddings.
- Cabe en cualquier equipo de consumo, incluidas Raspberry Pi y portátiles sin GPU dedicada; la evaluación publicada se hizo en un Apple M2.
- Opciones de despliegue: biblioteca `univo` (descarga, verifica y cachea el modelo, y después funciona offline), paquete `model2vec` de Python (`StaticModel.from_pretrained(...)`) y `model2vec-rs` en Rust.
- Rendimiento medido: 89.000 textos por segundo con 1 hilo y 176.000 con 8 hilos en Apple M2; tiempo de carga de 72 ms.
- El almacenamiento del índice vectorial (por ejemplo, FAISS, hnswlib o similar) es responsabilidad del usuario y no viene incluido en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros / dimensiones | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| static-similarity-mrl-multilingual-int8-128 (este) | 13.552.512 parámetros, 128 dimensiones, int8 | 512 tokens | 50 | Apache-2.0 | HuggingFace, runtime Model2Vec |
| sentence-transformers/static-similarity-mrl-multilingual-v1 | 1.024 dimensiones, float32 | 512 tokens | 50 | Apache-2.0 | HuggingFace |
| minishlab/potion-base-8M | Model2Vec estático, 8M, solo inglés | No disponible | Inglés | No disponible en la información proporcionada | HuggingFace |
| Modelos densos tipo sentence-transformers multilingües | Cientos de millones de parámetros, 384-1024 dimensiones | 512 tokens o menos | 50 o más | Variable | HuggingFace |

Frente a `potion-base-8M`, este modelo ofrece mayor *recall* en validación (32,9% frente a 19,6%), mejor *recall* en idiomas distintos del inglés (24,4% frente a 10,7%) y la mitad de tamaño en disco, a cambio de un tiempo de carga mayor (72 ms frente a 18 ms) y de una precisión exploratoria ligeramente inferior. Frente a modelos densos multilingües, la ventaja es el coste computacional y el tamaño, y la desventaja es la pérdida de orden de palabras y una menor capacidad de representación semántica fina.

## Limitaciones y advertencias

- El orden de las palabras se ignora: al promediar los vectores de los tokens, "Paris to Lyon" y "Lyon to Paris" producen el mismo vector.
- El tema no equivale a identidad: dos textos sobre el mismo asunto puntúan alto aunque nombren entidades distintas. En Univo, los embeddings son una fuente de evidencia más y nunca la única prueba de duplicado.
- Los 50 idiomas son los de los datos de entrenamiento originales; otros idiomas y sistemas de escritura caen en subpalabras compartidas o en tokens desconocidos.
- Las puntuaciones son similitudes coseno, no probabilidades, por lo que no deben interpretarse como confianza calibrada.
- El truncado a 128 dimensiones, aunque alineado con Matryoshka representation learning, reduce la información disponible respecto al modelo original de 1.024 dimensiones; no se documentan cifras de degradación frente a ese original.
- Los resultados de test son exploratorios: la división de test se vio durante la selección de variantes y la confirmación en un conjunto no visto está pendiente.
- La escala de cuantización no se almacena, de modo que cualquier reutilización que necesite reconstruir los pesos en coma flotante no puede deshacer la cuantización exactamente.
- Sesgos conocidos: no se documentan análisis de sesgo específicos en la información disponible.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que el modelo no produce texto; el riesgo equivalente son falsos positivos en la detección de duplicados.
- Licencia Apache-2.0, que permite uso comercial; Univo está licenciado bajo MIT, pero esa licencia cubre únicamente los ficheros de su repositorio, no este modelo.
- El modelo no ha sido entrenado por el autor del repositorio: es una derivación byte a byte reproducible del modelo de Sentence Transformers.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/univo-models/static-similarity-mrl-multilingual-int8-128
- Modelo original: https://huggingface.co/sentence-transformers/static-similarity-mrl-multilingual-v1
- Repositorio de Univo: https://github.com/leopoldch/univo
- Script de construcción del modelo: https://github.com/leopoldch/univo/blob/main/tools/build_default_model.py
- Model2Vec: https://github.com/MinishLab/model2vec
- Artículo sobre embeddings estáticos: https://huggingface.co/blog/static-embeddings
- Registro ROR: https://ror.org
- Modelo de comparación: https://huggingface.co/minishlab/potion-base-8M
