# yuriilaba/ucu-wsd-aug16-generation_all_combined_pt-true_seed-123

## Resumen

El modelo `yuriilaba/ucu-wsd-aug16-generation_all_combined_pt-true_seed-123` es un encoder de frases afinado especificamente para desambiguacion del sentido de las palabras (word-sense disambiguation, WSD) en ucraniano. Lo publica el usuario de Hugging Face `yuriilaba`, dentro de lo que parece una familia de experimentos etiquetada como `ucu-wsd` (probablemente un trabajo academico de la Universidad Catolica de Ucrania, aunque esto no se confirma en la informacion disponible). El punto de partida es `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`, un encoder multilingue de 278.043.648 parametros con arquitectura XLM-RoBERTa segun la etiqueta del repositorio.

El problema que aborda es concreto: dado un texto y una palabra objetivo polisemica, determinar cual de sus acepciones se esta usando. Para ello se ha entrenado sobre un conjunto de tripletes generado de forma semiautomatica (`triplets_generation_all_combined_16_samples.csv`), con una configuracion de pooling sobre el token objetivo (`target-token pooling = True`), lo que tiene sentido en WSD porque la representacion relevante es la del token que se desambigua y no la media de toda la secuencia.

Su relevancia es acotada pero clara: es un recurso para investigacion en procesamiento del lenguaje natural en ucraniano, un idioma con menos recursos que el ingles o el castellano, y reporta metricas propias (0,9407 de precision en WSD, 0,7945 de Pearson en tareas STS) que sirven como referencia reproducible. No es un modelo generativo ni un modelo conversacional: es un encoder que produce representaciones vectoriales y puntuaciones de similitud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo XLM-RoBERTa (etiqueta `xlm-roberta` en el repositorio), afinado desde `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` |
| Parametros totales | 278.043.648 (dato real leido de los pesos safetensors) |
| Parametros activos | no disponible (no es un modelo MoE; no hay mezcla de expertos) |
| Longitud de contexto | no disponible (no se especifica en la model card ni en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en precision original; no hay versiones cuantizadas declaradas) |
| Idiomas soportados | Ucraniano como idioma objetivo de la tarea de WSD; no se declara una lista oficial de idiomas en la model card |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,1 GB |
| Tarea declarada | Word-sense disambiguation en ucraniano |
| Pooling | Sobre el token objetivo (`target-token pooling = True`) |
| Semillas | Entrenamiento: 123; particion de validacion: 42 |

## Arquitectura y entrenamiento

La base es un encoder transformer bidireccional de arquitectura XLM-RoBERTa, con 278.043.648 parametros, heredado de `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`. Sobre ese checkpoint se realiza un ajuste fino supervisado orientado a WSD, con una modificacion relevante en la agregacion de representaciones: en lugar de un pooling medio sobre toda la secuencia, se activa el pooling sobre el token objetivo. Esto concentra la representacion en la palabra que se quiere desambiguar, que es exactamente lo que necesita la tarea.

Los datos de entrenamiento proceden del fichero `local_datasets/semi_supervised_2/triplets/triplets_generation_all_combined_16_samples.csv`, es decir, un conjunto de tripletes generado de forma semiautomatica, con 16 muestras por entrada, dentro de un pipeline denominado `semi_supervised_2`. No se detalla en la model card el numero total de tripletes, la composicion del corpus fuente, ni si hubo etapas de RLHF o DPO (poco probables en un encoder de este tipo). Tampoco se especifica el numero de tokens de entrenamiento ni la estrategia de minado de negativos. El modelo forma parte de una familia de experimentos con distintas semillas y variantes (`aug16`, `generation_all_combined`, `pt-true`), lo que sugiere barridos de hiperparametros o de configuraciones de datos, pero esa interpretacion no se confirma en la informacion disponible.

## Capacidades

- Generacion de representaciones vectoriales (embeddings) de frases y palabras, orientadas a tareas de similitud semantica y recuperacion.
- Desambiguacion del sentido de palabras en ucraniano: precision reportada de 0,9407 sobre el conjunto de evaluacion del autor.
- Similitud semantica textual (STS): 0,7945 de correlacion de Pearson y 0,7845 de Spearman segun los valores publicados en la model card.
- Agregacion de representaciones centrada en token objetivo mediante la configuracion de pooling activada, lo que permite obtener el vector de una palabra concreta dentro de una frase.
- Evaluacion por tareas dentro del marco MTEB: la model card indica que los resultados completos a nivel de tarea estan en `evaluation/mteb_results/`, aunque esos ficheros no forman parte de la informacion proporcionada.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento (thinking mode).
- No se declara generacion de texto: es un modelo de codificacion, no de decodificacion.
- Cobertura multilingue: no declarada explicitamente para este checkpoint; el modelo base del que parte es multilingue, pero la model card no especifica la lista de idiomas soportados por el ajuste fino.

## Casos de uso

- Desambiguacion lexica en pipelines de analisis de texto en ucraniano: dado un corpus y una lista de palabras polisemicas, el modelo puede asignar la acepcion correcta comparando el vector del token objetivo con el de las definiciones candidatas, con una precision reportada cercana al 94 %.
- Construccion de diccionarios y recursos lexicos anotados: el modelo puede preanotar automaticamente ejemplos de uso por acepcion, reduciendo el trabajo manual de lexicografos que elaboran o amplian un diccionario ucraniano.
- Busqueda semantica multilingue con foco en ucraniano: al generar embeddings de frase, es utilizable en sistemas de recuperacion de documentos donde el idioma principal del contenido sea ucraniano.
- Mejora de traduccion automatica: la identificacion de la acepcion correcta de una palabra polisemica permite seleccionar la traduccion adecuada en un sistema de traduccion estadistica o neuronal, especialmente en pares con divergencias de sentido respecto al ucraniano.
- Sistemas de respuesta a preguntas basados en recuperacion: el modelo sirve como retriever de pasajes, ordenando fragmentos por similitud semantica con la consulta antes de pasarlos a un modelo generativo.
- Deduplicacion y agrupamiento de textos: los embeddings permiten agrupar noticias, opiniones o resenas casi identicas en un corpus ucraniano, con soporte para similitud coseno sobre vectores normalizados.
- Analisis de resenas y opinion publica: la capacidad de similitud semantica permite clasificar opiniones por tema sin entrenar un clasificador especifico desde cero, usando ejemplos etiquetados como referencia.
- Investigacion academica en WSD de bajo recurso: sirve como linea base reproducible (semilla y particion documentadas) para comparar nuevas tecnicas de desambiguacion en idiomas eslavos orientales.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor:

| Metrica | Valor |
|---|---|
| Precision en WSD | 0,9407477820025348 |
| Pearson en STS | 0,7944628378690493 |
| Spearman en STS | 0,7845141545651068 |
| Resultados MTEB a nivel de tarea | Referenciados en `evaluation/mteb_results/` (no incluidos en la informacion proporcionada) |

No se especifica en la model card sobre que conjunto de evaluacion se calcularon estas cifras, ni el numero de ejemplos, ni la particion utilizada, ni los modelos con los que se compara. Tampoco se han publicado resultados de MMLU, HumanEval o GSM8K, que no aplican a un modelo de este tipo.

## Requisitos de hardware

- VRAM estimada: los pesos en FP32 ocupan aproximadamente 1,11 GB (278.043.648 parametros x 4 bytes), lo que concuerda con el tamano de repositorio de 1,1 GB. En FP16 serian unos 556 MB y en INT8 unos 278 MB, aunque no se publican conversiones oficiales.
- Cabe sin dificultad en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y modelos inferiores con 4 GB o mas de VRAM. Tambien cabe en CPU, con latencias mayores.
- GPU de centro de datos (A100, H100, L40S) son utiles solo para procesar grandes volumenes en lote; el modelo es demasiado pequeno para aprovecharlas con una sola peticion.
- Opciones de despliegue: `sentence-transformers` para generar embeddings, `transformers` con PyTorch para control directo, ONNX Runtime u Optimum para inferencia optimizada, y Text Embeddings Inference (TEI) para servir el modelo como API de embeddings. vLLM, llama.cpp, Ollama y TGI no son adecuados para este modelo porque no es generativo y no dispone de pesos GGUF.
- Latencia y throughput: no disponible. No se han publicado medidas de latencia ni de peticiones por segundo en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WSD (ucraniano) | STS Pearson | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `yuriilaba/ucu-wsd-aug16-generation_all_combined_pt-true_seed-123` | 278.043.648 | no disponible | 0,9407 | 0,7945 | no disponible | Publicado en Hugging Face |
| `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` (modelo base) | 278.043.648 | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | Publicado en Hugging Face |
| Alternativas especificas de WSD para ucraniano | no disponible | no disponible | no disponible | no disponible | no disponible | No se han identificado en la informacion disponible |
| Encoders multilingues genericos de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se han identificado datos comparables en la informacion disponible |

No se dispone de cifras publicadas de modelos alternativos bajo las mismas condiciones de evaluacion, por lo que la comparacion cuantitativa queda limitada a los valores del propio modelo frente a su base, para la que no se publican metricas de WSD.

## Limitaciones y advertencias

- Licencia no especificada: al no declararse licencia, no hay autorizacion explicita de uso comercial ni condiciones claras de redistribucion. Conviene contactar con el autor antes de integrarlo en un producto.
- Idiomas: el ajuste fino esta orientado al ucraniano. No se declara cobertura de otros idiomas, aunque el modelo base sea multilingue; el rendimiento fuera del ucraniano es desconocido.
- Ausencia de datos metodologicos: no se detalla el conjunto de evaluacion, su tamano ni su procedencia, por lo que las cifras de 0,9407 de precision en WSD y de 0,79 de correlacion STS no son verificables de forma independiente con la informacion disponible.
- Riesgo de sobreajuste al formato de datos: el entrenamiento usa un conjunto de tripletes generado de forma semiautomatica; es probable que el modelo funcione mejor en dominios parecidos al corpus de generacion y peor en textos muy alejados (lenguaje coloquial, dominios tecnicos, ortografia no normativa).
- Sesgos: no se ha publicado ningun analisis de sesgos ni de equidad. Cualquier sesgo presente en el corpus de tripletes se hereda en las representaciones.
- Alucinacion: al no ser un modelo generativo, no produce texto libre y no puede alucinar en el sentido habitual. El riesgo equivalente es asignar una acepcion incorrecta o devolver similitudes altas entre textos no relacionados.
- Adopcion practica: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y un unico commit con apenas 38 segundos de diferencia entre creacion y actualizacion, lo que sugiere un experimento de investigacion sin mantenimiento posterior previsto.
- Longitud de contexto desconocida: no se ha publicado la ventana maxima soportada, un dato critico para decidir si el modelo puede procesar parrafos completos o solo frases cortas.
- Ruido en el repositorio: 1,1 GB para un modelo de 278 M de parametros en FP32 indica la presencia de artefactos adicionales (resultados de evaluacion, checkpoints intermedios u otros ficheros) que conviene inspeccionar antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuriilaba/ucu-wsd-aug16-generation_all_combined_pt-true_seed-123
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
- Resultados MTEB referenciados por el autor: carpeta `evaluation/mteb_results/` dentro del repositorio del modelo
- Paper, blog o demo del autor: no disponible
- Repositorio de codigo asociado: no disponible
