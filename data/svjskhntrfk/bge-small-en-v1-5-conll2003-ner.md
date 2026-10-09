# svjskhntrfk/bge-small-en-v1.5-conll2003-ner

## Resumen

bge-small-en-v1.5-conll2003-ner es un checkpoint de clasificacion de tokens (reconocimiento de entidades nombradas, NER) publicado por el usuario svjskhntrfk en HuggingFace. Se obtiene por ajuste fino supervisado de BAAI/bge-small-en-v1.5, un modelo encoder-only de la familia BGE (BAAI General Embedding) desarrollada por el Beijing Academy of Artificial Intelligence, originalmente disenado para generar embeddings densos de 384 dimensiones para busqueda semantica y recuperacion.

El modelo tiene 33.215.625 parametros (unos 33,2 millones) y un peso en repositorio de 0,1 GB, lo que lo situa en la gama de los encoders ligeros tipo BERT-small. Con ese tamano se puede ejecutar en CPU y en cualquier GPU de consumo, y esta etiquetado como compatible con endpoints de HuggingFace. La licencia es MIT, sin restricciones para uso comercial.

Su relevancia es practica mas que innovadora: convierte un modelo de embeddings en un extractor de entidades de cuatro categorias (persona, organizacion, ubicacion y miscelanea) con un F1 de 0,8767 declarado por el autor sobre el conjunto de evaluacion. El interes principal esta en que es un ejemplo de reciclaje de un encoder de recuperacion para una tarea discriminativa, y en su coste de despliegue casi nulo. Como contrapartida, la model card es autocontenida y muy incompleta: el autor no declara el conjunto de datos, los idiomas soportados, los usos previstos ni las limitaciones, y el modelo cuenta con cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only tipo BERT (modelo base BAAI/bge-small-en-v1.5) |
| Parametros totales | 33.215.625 (dato real de los pesos safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no declarada en la model card; la arquitectura del modelo base usa una longitud maxima de secuencia de 512 tokens |
| Tipos de cuantizacion | no disponibles; el autor no publica variantes cuantizadas. Los pesos se distribuyen en safetensors (fp32) y admiten cuantizacion dinamica a int8 via PyTorch u ONNX Runtime |
| Idiomas soportados | no declarados por el autor. El modelo base BAAI/bge-small-en-v1.5 esta orientado a ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (tambien disponible en el repositorio el formato de la libreria transformers) |
| Tarea (pipeline) | token-classification (NER) |
| Etiquetas de entidad | no declaradas; el identificador del modelo referencia CoNLL-2003, cuyo esquema habitual es PER, ORG, LOC y MISC |
| Tamano del repositorio | 0,1 GB |
| Libreria | transformers (model card generada con Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5, Tokenizers 0.23.1) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un encoder Transformer bidireccional estilo BERT, sin cabecera generativa y sin mecanismos de atencion dispersa ni mezcla de expertos. BAAI/bge-small-en-v1.5 se entreno originalmente con aprendizaje contrastivo y una temperatura de 0,01, lo que produce una distribucion de similitudes concentrada en el intervalo [0,6, 1] y embeddings de 384 dimensiones. Este checkpoint descarta ese objetivo: el autor sustituye la cabecera de pooling por una cabecera de clasificacion de tokens y ajusta el modelo completo para etiquetado secuencial. Conviene subrayar que reutilizar un encoder entrenado para similitud semantica como base de NER no es la ruta habitual; el resultado depende por completo del ajuste fino supervisado.

El entrenamiento descrito en la model card no especifica el conjunto de datos ("unknown dataset"), aunque el nombre del modelo apunta a CoNLL-2003. La configuracion fue: learning rate 2e-05, tamano de lote 32 en entrenamiento y evaluacion, 5 epocas, planificador lineal, optimizador AdamW con betas (0,9 / 0,999) y epsilon 1e-08, semilla 42 y 1.565 pasos totales (313 pasos por epoca). No se menciona ninguna fase de RLHF, DPO ni preferencias humanas, algo coherente con una tarea de etiquetado supervisado. Es reseñable que 313 pasos por epoca con lotes de 32 implican del orden de 10.000 secuencias por epoca, una cifra inferior a las 14.041 frases del split de entrenamiento estandar de CoNLL-2003, por lo que la particion empleada probablemente no sea la oficial o haya sufrido filtrado. No hay informacion sobre composicion del dataset, preprocesado ni estrategia de tokenizacion de subtokens.

## Capacidades

- Reconocimiento de entidades nombradas sobre texto en ingles, devolviendo etiquetas a nivel de token (esquema BIO previsible segun CoNLL-2003: persona, organizacion, ubicacion y miscelanea).
- Clasificacion de secuencias completas de hasta 512 tokens por inferencia, con agregacion de subtokens mediante la logica estandar de la libreria transformers (pipeline de token-classification).
- Inferencia por lotes de alta densidad: al tener 33 millones de parametros, permite procesar grandes volumenes de documentos por GPU o CPU.
- Exportacion a otros runtimes: los pesos safetensors son convertibles a ONNX, TorchScript o TensorRT, y admiten cuantizacion post-entrenamiento para despliegue en CPU.
- Integracion con HuggingFace Inference Endpoints (etiqueta endpoints_compatible) para servicio gestionado.
- Capacidades no disponibles o no declaradas: no hay soporte de tool calling ni function calling, no hay modo de razonamiento multi-paso, no hay generacion de texto, no hay capacidades de vision ni audio, y no se declara soporte multilingue.

## Casos de uso

- Anonimizacion de datos personales en documentos: el modelo etiqueta personas y organizaciones, de modo que un pipeline posterior puede sustituir esas menciones por marcadores antes de almacenar o compartir el texto, reduciendo la exposicion de datos identificativos en entornos sujetos a normativa de proteccion de datos.
- Extraccion de metadatos para enriquecer un indice de recuperacion: las entidades detectadas (personas, organizaciones, lugares) se añaden como campos filtrables en un motor de busqueda o en una base vectorial, junto a los embeddings generados por el propio modelo base BAAI/bge-small-en-v1.5, lo que permite consultas del tipo "documentos que mencionan la organizacion X".
- Procesamiento de noticias y seguimiento de medios: clasificacion de menciones de empresas, cargos y localizaciones en flujos de prensa en ingles para construir grafos de coocurrencia o paneles de monitorizacion de marca.
- Normalizacion previa a entity linking: las menciones detectadas se pasan a un resolutor contra una base de conocimiento (Wikidata, bases internas de clientes), de forma que la salida del modelo actua como primera etapa de un sistema de desambiguacion.
- Analisis de documentos financieros o regulatorios en ingles: deteccion sistematica de entidades emisoras, contrapartes y jurisdicciones en informes extensos, con procesado por lotes en CPU para reducir coste de infraestructura.
- Preetiquetado para anotacion humana (human-in-the-loop): el modelo genera propuestas de etiquetas que un anotador revisa, lo que acelera la construccion de nuevos corpus NER y sirve como base de un ciclo de reentrenamiento.
- Clasificacion de tickets y correos de soporte: extraccion de nombres de producto, empresa y ubicacion para enrutado automatico, con la salvedad de que el modelo no esta validado fuera del dominio de noticias.
- Filtrado de contenido en pipelines de datos: identificacion de menciones de personas concretas para aplicar politicas de privacidad o de exclusion de datos en la construccion de corpus.

## Benchmarks y rendimiento

La model card declara resultados sobre el conjunto de evaluacion, pero el model-index oficial (el que HuggingFace usa para publicar la tabla de benchmarks) esta vacio: no hay resultados registrados en el indice del modelo. Los datos disponibles son los siguientes:

| Metrica | Valor declarado por el autor |
|---|---|
| Loss (evaluacion) | 0,2258 |
| Precision | 0,8564 |
| Recall | 0,8980 |
| F1 | 0,8767 |
| Accuracy | 0,9768 |

Evolucion durante el entrenamiento (5 epocas, 1.565 pasos):

| Epoca | Paso | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1,0 | 313 | 0,5133 | 0,6808 | 0,7301 | 0,7046 | 0,9496 |
| 2,0 | 626 | 0,3201 | 0,8034 | 0,8502 | 0,8262 | 0,9685 |
| 3,0 | 939 | 0,2601 | 0,8312 | 0,8842 | 0,8569 | 0,9731 |
| 4,0 | 1.252 | 0,2338 | 0,8569 | 0,8948 | 0,8754 | 0,9765 |
| 5,0 | 1.565 | 0,2258 | 0,8564 | 0,8980 | 0,8767 | 0,9768 |

La mejora entre la cuarta y la quinta epoca es marginal (F1 de 0,8754 a 0,8767), lo que sugiere convergencia y deja abierta la pregunta de si un ajuste mas agresivo del learning rate o un mayor numero de epocas aportaria algo adicional. No hay comparaciones con otros modelos en la informacion disponible, ni resultados sobre el conjunto de test oficial de CoNLL-2003, ni desglose por tipo de entidad.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (los 33,2 millones de parametros ocupan aproximadamente 133 MB, mas activaciones y memoria intermedia) y del orden de decenas de megabytes en fp16 o int8. No hay mediciones publicadas por el autor.
- GPU recomendadas: cualquier GPU moderna sirve. Para lotes grandes, una A100, H100, L40S o RTX 4090 maximiza el throughput; para servicio ligero bastan una T4, una L4 o una RTX 3060.
- GPU de consumo: si, cabe con enorme holgura en practicamente cualquier GPU consumer, incluidas GTX 1650 (4 GB), RTX 3050 y modelos integrados con memoria compartida. Tambien es viable en CPU: un encoder de 12 capas y 33 millones de parametros procesa texto en tiempo casi interactivo por documento.
- Opciones de despliegue: pipeline de transformers (token-classification), HuggingFace Inference Endpoints, exportacion a ONNX Runtime con cuantizacion dinamica int8 para CPU, TorchScript y TensorRT para GPU. vLLM, TGI, llama.cpp y Ollama no son aplicables: no existe variante GGUF y estos motores estan orientados a modelos generativos autoregresivos, no a clasificacion de tokens.
- Latencia y throughput: no disponibles. El autor no publica ninguna medicion de latencia, tokens por segundo ni muestras por segundo. Por tamano, el modelo es apto para procesamiento por lotes de miles de documentos en una sola GPU, pero no hay cifras verificables en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | F1 declarado | Disponibilidad |
|---|---|---|---|---|---|---|
| svjskhntrfk/bge-small-en-v1.5-conll2003-ner | 33.215.625 | no declarado (512 tokens por la arquitectura base) | token-classification (NER) | MIT | 0,8767 en su conjunto de evaluacion | Publico en HuggingFace, 0 descargas y 0 likes |
| vmpetrikov/bge-small-en-v1.5-conll2003-ner | no disponible | no disponible | token-classification (NER) | no disponible | no disponible | Publico en HuggingFace; existe al menos un ajuste equivalente con el mismo nombre publicado por otro usuario |
| BAAI/bge-small-en-v1.5 (modelo base) | 33,4 millones (segun el catalogo de AIMarketly) | no disponible | feature-extraction (embeddings de 384 dimensiones) | MIT | no aplica (tarea de similitud, no de etiquetado) | Muy extendido: 494 millones de descargas historicas y 597 likes segun AIMarketly |

No se han encontrado en la busqueda web otros modelos NER comparables con datos de rendimiento publicados, por lo que no es posible establecer una comparacion cuantitativa frente a alternativas de la misma categoria mas alla de los propios numeros de este checkpoint.

## Limitaciones y advertencias

- Model card incompleta: las secciones de descripcion, usos previstos, limitaciones y datos de entrenamiento estan marcadas como "More information needed" y el propio encabezado indica que se genero automaticamente y no fue revisado. No hay garantia documental sobre el dataset, el esquema de etiquetas ni el procedimiento exacto.
- Conjunto de evaluacion desconocido: el autor no identifica los datos de evaluacion, por lo que el F1 de 0,8767 no es trazable ni reproducible. Tampoco se publican resultados sobre el test oficial de CoNLL-2003.
- Riesgo de sobreajuste al dominio: si el entrenamiento se hizo sobre CoNLL-2003, el modelo esta sesgado hacia texto periodistico en ingles de los anos noventa. El rendimiento caera en dominios como textos clinicos, conversaciones, codigo, redes sociales o jerga tecnica.
- Etiquetas limitadas: solo se esperan cuatro categorias de entidad (persona, organizacion, ubicacion, miscelanea) y no hay desglose por tipo en los resultados declarados, por lo que se desconoce cual de ellas rinde peor.
- Idioma: no se declara soporte multilingue y el modelo base es ingles. Usarlo con texto en castellano no esta soportado y produciria etiquetados poco fiables.
- Longitud de contexto: la ventana de 512 tokens obliga a trocear documentos largos, con el consiguiente riesgo de entidades partidas entre fragmentos y de perdida de contexto para la desambiguacion.
- Riesgo de error en la salida: en clasificacion de tokens el fallo tipico no es la alucinacion generativa, sino falsos positivos y negativos en las menciones, especialmente en entidades ambiguas o anidadas. La precision (0,8564) es notablemente inferior al recall (0,8980), lo que indica tendencia a etiquetar de mas.
- Ausencia de validacion comunitaria: cero descargas y cero likes, sin issues ni discusion publica. No hay evidencia de terceros que hayan reproducido los resultados.
- Licencia: MIT permite uso comercial, modificacion y redistribucion sin royalties, pero no exime de cumplir la normativa de proteccion de datos si se procesan textos con informacion personal, ni de las condiciones de uso del modelo base.
- Procedencia del ajuste: convertir un encoder de embeddings en un clasificador de tokens es una eleccion poco convencional. Si el objetivo es produccion, conviene comparar contra un checkpoint NER especifico antes de adoptarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/svjskhntrfk/bge-small-en-v1.5-conll2003-ner
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Ajuste equivalente de otro usuario con el mismo nombre: https://huggingface.co/vmpetrikov/bge-small-en-v1.5-conll2003-ner
- Documentacion de la familia BGE v1 y v1.5: https://bge-model.com/bge/bge_v1_v1.5.html
- Ficha del modelo base en SourceForge: https://sourceforge.net/projects/bge-small-en-v1-5/
- Ficha del modelo base en AIMarketly: https://www.aimarketly.com/model/BAAI/bge-small-en-v1.5
