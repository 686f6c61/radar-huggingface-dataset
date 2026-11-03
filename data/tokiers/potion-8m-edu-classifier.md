# tokiers/potion-8m-edu-classifier

## Resumen

potion-8m-edu-classifier es un clasificador de contenido educativo construido sobre Model2Vec, una tecnica que convierte un sentence transformer en un modelo de embeddings estaticos. Lo desarrolla el usuario tokiers como fine-tune de minishlab/potion-base-8M, y su proposito es replicar la funcion del fineweb-edu-classifier de HuggingFaceFW: puntuar la calidad educativa de documentos web para filtrar corpus de entrenamiento. Con 7.559.168 parametros y un repositorio de 0,2 GB, es un modelo de inferencia puramente estatica (sin atencion ni capas transformer en tiempo de ejecucion), lo que lo hace extremadamente rapido en CPU.

La relevancia del modelo esta en su coste computacional: frente al clasificador original basado en un transformer, este modelo logra un F1 macro de 0,79 en modo binario (frente a 0,81 del original) con una velocidad orders of magnitude superior en CPU. Esto lo hace adecuado para filtrar grandes volumenes de texto (miles de millones de documentos) en pipelines de curacion de datasets, donde el coste por documento es el factor limitante.

El modelo solo soporta ingles, se distribuye con licencia MIT y esta etiquetado para la libreria model2vec. Incluye un tokenizador precompilado de tokie (tokenizer.tkz) que, segun el autor, ofrece una tokenizacion 5 veces mas rapida y es un reemplazo directo de los tokenizers de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Model2Vec (embeddings estaticos destilados de un sentence transformer; sin atencion en inferencia) |
| Parametros totales | 7.559.168 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el modelo es ya de muy baja precision efectiva por su naturaleza estatica) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (model2vec), tokenizer.tkz (tokie) |

## Arquitectura y entrenamiento

Model2Vec es una tecnica de destilacion que convierte un sentence transformer en una tabla de embeddings estaticos por token, eliminando las capas de atencion y las operaciones matriciales por token en tiempo de inferencia. La representacion de una frase se obtiene promediando (o combinando) los embeddings de sus tokens, lo que reduce el coste a una simple operacion de lookup y pooling. El modelo base es minishlab/potion-base-8M, un modelo estatico de 8 millones de parametros entrenado por Minish.

El fine-tune se realizo sobre el dataset HuggingFaceFW/fineweb-edu-llama3-annotations, que contiene anotaciones de calidad educativa generadas con Llama 3 sobre documentos de FineWeb-Edu. El objetivo es una clasificacion en 6 niveles (0 a 5) de calidad educativa, analogo al fineweb-edu-classifier. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; al tratarse de un clasificador, lo habitual seria entrenamiento supervisado con cross-entropy sobre las etiquetas anotadas. El modelo incluye un tokenizador precompilado de tokie que el autor presenta como reemplazo directo de los tokenizers de HuggingFace con una tokenizacion 5 veces mas rapida.

## Capacidades

- Clasificacion de calidad educativa de texto en 6 niveles (0 a 5), segun las anotaciones de FineWeb-Edu con Llama 3.
- Clasificacion binaria (educativo / no educativo) mediante umbralizacion de las puntuaciones.
- Generacion de embeddings estaticos de frases y documentos (modelo de la familia model2vec).
- Inferencia en CPU con coste muy bajo por documento, adecuada para procesamiento masivo.
- Tokenizacion acelerada mediante el tokenizador tokie incluido (tokenizer.tkz).
- No soporta tool calling, function calling, agentes, vision, audio ni modo thinking: es un clasificador, no un modelo generativo.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Curacion de datasets de preentrenamiento: filtrar documentos web por calidad educativa antes de incluirlos en un corpus de entrenamiento, usando la puntuacion 0-5 o el umbral binario para descartar contenido de baja calidad. Es el caso de uso original del fineweb-edu-classifier y el modelo replica su funcion con un coste mucho menor.
- Filtrado a gran escala en pipelines de datos: procesar millones de documentos en CPU sin GPU, ya que la inferencia estatica evita las operaciones de atencion y permite throughput muy alto por nucleo.
- Construccion de subcorpus tematicos educativos: seleccionar documentos con puntuacion alta (niveles 4-5) para crear datasets especializados en material didactico, cientifico o divulgativo.
- Deduplicacion y priorizacion de crawl: combinar la puntuacion educativa con heuristicas de calidad para ordenar o descartar paginas en un crawler antes de almacenarlas.
- Evaluacion de calidad de contenido generado: puntuar textos sinteticos o respuestas de un LLM para detectar si tienen valor educativo antes de usarlos en un dataset de instrucciones.
- Clasificacion ligera en produccion: integrar el modelo como microservicio de bajo coste para etiquetar articulos, apuntes o documentacion tecnica en un CMS o buscador interno.
- Investigacion sobre filtrado de datos: reproducir experimentos de ablacion sobre el impacto del filtrado educativo en el rendimiento de modelos, con un clasificador barato que permite iterar rapido.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split de evaluacion (46.743 ejemplos), clasificacion en 6 clases:

| Metrica | Valor |
|---|---|
| Accuracy (6 clases) | 0,69 |
| F1 macro (6 clases) | 0,46 |
| F1 ponderado (6 clases) | 0,68 |

Rendimiento por clase (precision / recall / F1 / soporte):

| Clase | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| 0 | 0,70 | 0,42 | 0,52 | 5.694 |
| 1 | 0,75 | 0,86 | 0,80 | 26.512 |
| 2 | 0,55 | 0,51 | 0,53 | 10.322 |
| 3 | 0,54 | 0,45 | 0,49 | 3.407 |
| 4 | 0,59 | 0,30 | 0,40 | 807 |
| 5 | 0,00 | 0,00 | 0,00 | 1 |

Resultados en modo binario (umbralizado):

| Metrica | Valor |
|---|---|
| Accuracy | 0,94 |
| F1 macro | 0,79 |
| F1 ponderado | 0,93 |
| Precision (edu) | 0,70 |
| Recall (edu) | 0,54 |

Comparacion con el clasificador original: el fineweb-edu-classifier obtiene un F1 macro de 0,81 en modo binario sobre el mismo dataset, frente a 0,79 de este modelo, pero este ultimo es orders of magnitude mas rapido en CPU segun el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo ocupa unos 0,2 GB en disco y puede ejecutarse en CPU sin GPU dedicada.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente. En GPU, cualquier tarjeta con al menos 1 GB de memoria libre puede alojarlo, pero no aporta ventaja significativa.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: libreria model2vec con el extra de inferencia (`pip install model2vec[inference]`), usando `StaticModelPipeline.from_pretrained`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos generativos.
- Latencia y throughput: no se publican cifras concretas; el autor afirma que es orders of magnitude mas rapido en CPU que el clasificador transformer original y que la tokenizacion con tokie es 5 veces mas rapida.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | F1 macro binario | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| tokiers/potion-8m-edu-classifier | 7.559.168 | Model2Vec (estatico) | no disponible | 0,79 | MIT | HuggingFace |
| HuggingFaceFW/fineweb-edu-classifier | no disponible en la informacion | Transformer (clasificador) | no disponible | 0,81 | no disponible en la informacion | HuggingFace |
| minishlab/potion-base-8M | ~8 M | Model2Vec (estatico) | no disponible | no aplica (no es clasificador) | no disponible en la informacion | HuggingFace |

El clasificador original de FineWeb-Edu ofrece una precision ligeramente superior (0,81 frente a 0,79 de F1 macro binario) a costa de un coste computacional mucho mayor. potion-base-8M es el modelo base sobre el que se construye este fine-tune y no es un clasificador, sino un generador de embeddings estaticos de proposito general.

## Limitaciones y advertencias

- Solo soporta ingles; el rendimiento en otros idiomas no esta evaluado y probablemente sea deficiente.
- El modelo tiene un sesgo claro hacia la clase mayoritaria (nivel 1): recall de 0,86 frente a 0,30 en el nivel 4 y 0,00 en el nivel 5 (con un unico ejemplo de soporte). La clasificacion fina en niveles altos es poco fiable.
- En modo binario, el recall de la clase "edu" es solo 0,54: pierde aproximadamente la mitad de los documentos educativos si se usa un umbral estandar. Ajustar el umbral segun el caso de uso es imprescindible.
- Riesgo de falsos negativos en contenido educativo de nicho o con formato no convencional, dado el sesgo hacia el estilo de FineWeb-Edu.
- Es un clasificador, no un modelo generativo: no puede usarse para generar texto, razonar ni seguir instrucciones.
- La licencia MIT permite uso comercial, pero el modelo hereda posibles sesgos del dataset de anotaciones (FineWeb-Edu con Llama 3), que no esta exento de sesgos de dominio y estilo.
- El repositorio tiene muy pocas descargas (14) y ningun "like" en el momento de la consulta, lo que sugiere escasa validacion comunitaria; conviene validar el rendimiento en el dominio propio antes de usarlo en produccion.
- No se documentan la longitud de contexto ni el comportamiento con documentos muy largos; el pooling de embeddings estaticos puede diluir la senal en textos extensos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tokiers/potion-8m-edu-classifier
- Modelo base: https://huggingface.co/minishlab/potion-base-8M
- Repositorio Model2Vec: https://github.com/MinishLab/model2vec
- Repositorio tokie: https://github.com/chonkie-inc/tokie
- Clasificador original de referencia: https://huggingface.co/HuggingFaceFW/fineweb-edu-classifier
- Dataset de anotaciones: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu-llama3-annotations
