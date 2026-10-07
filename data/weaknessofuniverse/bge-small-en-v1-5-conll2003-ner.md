# weaknessofuniverse/bge-small-en-v1.5-conll2003-ner

## Resumen

bge-small-en-v1.5-conll2003-ner es un ajuste fino del modelo de embeddings BAAI/bge-small-en-v1.5 para la tarea de reconocimiento de entidades nombradas (NER) mediante clasificacion de tokens. Lo publica el usuario weaknessofuniverse en HuggingFace y esta etiquetado con el pipeline token-classification. El modelo conserva la arquitectura encoder-only tipo BERT del modelo base, con 33.215.625 parametros en total y un peso en disco de aproximadamente 0,1 GB.

El modelo resuelve la extraccion de entidades sobre texto en ingles, presumiblemente siguiendo el esquema de etiquetas de CoNLL-2003 (persona, organizacion, localizacion y miscelanea), a juzgar por el nombre del repositorio. Su relevancia practica esta en el tamano: al ser un encoder de 33 millones de parametros, se puede ejecutar en CPU o en cualquier GPU de consumo con latencias bajas, lo que lo hace apropiado para preprocesado de texto a gran escala donde un modelo generativo seria desproporcionado.

La model card presenta resultados de evaluacion declarados por el autor (F1 de 0,9119, precision de 0,9003 y recall de 0,9238), aunque el propio autor reconoce que el conjunto de datos de entrenamiento no esta documentado ("unknown dataset"). El model-index oficial esta vacio, por lo que no hay benchmarks formalmente declarados. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only tipo BERT (tag "bert"); derivado de BAAI/bge-small-en-v1.5 |
| Parametros totales | 33.215.625 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base BGE-small-en-v1.5 esta limitado a 512 posiciones |
| Tipos de cuantizacion | No se publican versiones cuantizadas; al ser un encoder de 33 M de parametros puede cuantizarse a int8/int4 manualmente con herramientas externas |
| Idiomas soportados | No declarados en la model card; el modelo base es monolingue en ingles y el nombre del repo remite a CoNLL-2003 (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | token-classification |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de BAAI/bge-small-en-v1.5, un encoder transformer de tipo BERT con 33 millones de parametros (aproximadamente 12 capas y 384 dimensiones ocultas) disenado originalmente para generar embeddings de frases y pasajes. Sobre esa base se ha anadido una cabeza de clasificacion de tokens y se ha ajustado el conjunto completo, lo que da un modelo discriminativo que asigna una etiqueta BIO a cada token de la entrada. No hay decodificacion especulativa, atencion lineal ni componentes MoE.

Los hiperparametros de entrenamiento declarados son: learning rate 5e-05, tamano de lote de entrenamiento 32, tamano de lote de evaluacion 16, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal y 20 epocas. El framework declarado es Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1. La model card indica que el entrenamiento se hizo sobre un "unknown dataset", aunque el nombre del repositorio apunta a CoNLL-2003; no se documenta la composicion del corpus ni si hubo una fase de RLHF o DPO (no tendria sentido en una tarea de etiquetado).

## Capacidades

- Etiquetado de tokens para reconocimiento de entidades nombradas en ingles, presumiblemente con las categorias de CoNLL-2003 (persona, organizacion, localizacion y miscelanea).
- Clasificacion discriminativa token a token; no genera texto libre.
- Inferencia rapida por su tamano reducido (33 M de parametros), apta para procesamiento por lotes.
- Puede ejecutarse Enteramente en CPU, sin GPU.
- Compatible con el ecosistema `transformers` y exportable a ONNX, TorchScript y formatos similares para despliegue.
- No dispone de soporte de tool calling ni de function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingue: el modelo base es monolingue en ingles.
- No tiene modo de pensamiento (thinking mode), vision, audio ni ninguna capacidad multimodal.
- No es un modelo conversacional ni sigue instrucciones.

## Casos de uso

- Extraccion de entidades en corpus de noticias en ingles: el modelo puede etiquetar personas, organizaciones y localizaciones en articulos, lo que resulta adecuado por su bajo coste de inferencia cuando hay que procesar millones de documentos.
- Construccion de grafos de conocimiento y preprocesado para RAG: las entidades extraidas sirven como nodos y metadatos para enriquecer indices vectoriales antes de la fase de recuperacion.
- Anonimizacion y deteccion de datos personales: al identificar nombres de personas y organizaciones, se puede usar como primer filtro en pipelines de redaccion de informacion sensible en textos en ingles.
- Enriquecimiento de curriculos y ofertas de empleo: extraccion de empresas, titulaciones y ubicaciones para alimentar sistemas de matching, aprovechando que el modelo cabe en una maquina sin GPU.
- Analisis de documentos financieros o legales en ingles: identificacion de entidades emisoras, contrapartes y jurisdicciones en informes, con la salvedad del limite de contexto y del dominio de entrenamiento.
- Etiquetado previo para anotacion humana: uso del modelo como preanotador en herramientas de etiquetado, reduciendo el trabajo manual antes de la revision por anotadores.
- Clasificacion y filtrado de contenido a gran escala: por su tamano, se puede desplegar en contenedores pequenos o en el borde (edge) para preprocesar flujos de texto continuos.
- Indexacion de bases documentales internas: extraccion de entidades para construir indices invertidos por entidad que complementen la busqueda semantica.

## Benchmarks y rendimiento

El model-index del autor no contiene resultados (`results: []`). Los unicos datos de rendimiento disponibles son los declarados en la model card sobre el conjunto de evaluacion del autor:

| Metrica | Valor declarado |
|---|---|
| Loss | 0.1559 |
| Precision | 0.9003 |
| Recall | 0.9238 |
| F1 | 0.9119 |
| Accuracy | 0.9812 |

Evolucion declarada durante el entrenamiento (extracto de la tabla de la model card; solo se publican las seis primeras epocas de las 20 configuradas):

| Epoca | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|
| 1.0 | 0.2730 | 0.8098 | 0.8736 | 0.8405 | 0.9702 |
| 2.0 | 0.1833 | 0.8820 | 0.9110 | 0.8963 | 0.9787 |
| 3.0 | 0.1629 | 0.8727 | 0.9187 | 0.8951 | 0.9787 |
| 4.0 | 0.1559 | 0.9003 | 0.9238 | 0.9119 | 0.9812 |
| 5.0 | 0.1645 | 0.9016 | 0.9206 | 0.9110 | 0.9808 |
| 6.0 | 0.1567 | 0.8962 | 0.9271 | 0.9114 | 0.9816 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, y esas metricas no son aplicables a un modelo de clasificacion de tokens.

## Requisitos de hardware

- Peso de los parametros en fp32: 33.215.625 x 4 bytes = aproximadamente 133 MB.
- Peso de los parametros en fp16/bf16: aproximadamente 66 MB.
- Peso de los parametros en int8: aproximadamente 33 MB.
- VRAM total estimada para inferencia con lotes pequenos: por debajo de 1 GB, sumando activaciones y overhead del runtime (estimacion derivada del tamano de los pesos, no medida por el autor).
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4090, GTX 1650, e incluso en GPUs integradas con memoria compartida.
- Funciona en CPU: es viable desplegarlo en servidores sin GPU para procesamiento por lotes, con latencias mayores.
- Opciones de despliegue: `transformers` con el pipeline `token-classification`, exportacion a ONNX mediante Optimum, TorchScript, o servidores de inferencia genericos como Triton. vLLM y TGI estan orientados a modelos generativos y su soporte para clasificacion de tokens es limitado; llama.cpp y Ollama no estan pensados para NER con encoders BERT.
- Latencia y throughput: no disponibles. Como referencia orientativa, un encoder de 33 M de parametros suele resolver secuencias de 128 a 256 tokens en pocos milisegundos por lote en GPU moderna y en decenas de milisegundos por secuencia en CPU, pero estas cifras no han sido medidas ni publicadas por el autor.

## Comparativa con modelos similares

Los datos de parametros y licencia de los modelos alternativos son referencias publicas de sus respectivas model cards; los valores de F1 de terceros no se han verificado en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Tarea | F1 declarado |
|---|---|---|---|---|---|
| weaknessofuniverse/bge-small-en-v1.5-conll2003-ner | 33,2 M | hasta 512 tokens (heredado del base) | MIT | NER (token classification) en ingles | 0,9119 (conjunto del autor, no verificado) |
| dslim/bert-base-NER | 110 M | 512 tokens | MIT | NER en ingles | aproximadamente 0,91 en CoNLL-2003 (referencia publica) |
| Jean-Baptiste/roberta-large-ner-english | 355 M | 512 tokens | MIT | NER en ingles | aproximadamente 0,95 en CoNLL-2003 (referencia publica) |
| BAAI/bge-small-en-v1.5 (modelo base) | 33 M | 512 tokens | MIT | Embeddings de frases y pasajes | no aplica (no hace NER) |

La ventaja principal del modelo frente a las alternativas es el tamano: ofrece un F1 en el entorno de 0,91 con un tercio de los parametros de bert-base-NER y una decima parte de roberta-large. La desventaja es la falta de documentacion del conjunto de evaluacion y la ausencia de validacion por parte de la comunidad (cero descargas y cero likes en el momento de la consulta).

## Limitaciones y advertencias

- Solo procesa ingles; no hay evidencia de capacidad multilingue.
- La model card no documenta el conjunto de datos de entrenamiento ni de evaluacion ("unknown dataset", "More information needed"). El nombre del repositorio sugiere CoNLL-2003, pero no esta confirmado.
- No se puede verificar la comparabilidad del F1 de 0,9119 con otros modelos, porque se desconoce el split y el preprocesado exactos.
- Limite de contexto de 512 tokens heredado del modelo base: los documentos largos deben trocearse, lo que puede partir entidades y degradar el recall en los limites de cada fragmento.
- Es un modelo discriminativo: no genera texto, no razona y no sigue instrucciones, por lo que no es util para tareas generativas.
- Puede producir falsos positivos y falsos negativos por el etiquetado BIO de subpalabras; las entidades anidadas no se representan bien con este esquema.
- Sesgos heredados del corpus de entrenamiento: si se confirma CoNLL-2003, el modelo esta sesgado hacia el dominio de noticias deportivas y politicas de finales de los anos noventa y principios de los dos mil, con una representacion geografica limitada.
- Riesgo de alucinacion entendido como etiquetado incorrecto: en ausencia de entidades reales el modelo puede asignar etiquetas espurias a tokens.
- Licencia MIT: permite uso comercial y modificacion, siempre que se conserve el aviso de copyright y la licencia. No hay restricciones de uso adicionales declaradas, pero conviene verificar la licencia del modelo base BAAI/bge-small-en-v1.5 y del corpus de entrenamiento por separado.
- Modelo sin mantenimiento ni validacion externa: cero descargas y cero likes, creado y actualizado con cuatro minutos de diferencia, lo que sugiere un experimento puntual mas que un artefacto de produccion.
- La model card fue generada automaticamente por el Trainer y no ha sido revisada, segun el propio comentario HTML incluido en el README.
- Anomalia en las fechas de creacion y actualizacion del repositorio (2026), que conviene tener en cuenta al evaluar su trazabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/weaknessofuniverse/bge-small-en-v1.5-conll2003-ner
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Dataset referenciado por el nombre del modelo (CoNLL-2003 en HuggingFace): https://huggingface.co/datasets/eriktks/conll2003
- Paper del modelo base BGE (C-Pack: Packed Resources For General Chinese Embeddings): https://arxiv.org/abs/2309.07597
- Paper del corpus CoNLL-2003 (Tjong Kim Sang y De Meulder, 2003): https://aclanthology.org/W03-0419/
- No se han encontrado en la informacion proporcionada repositorios de codigo, demos ni blogs adicionales del autor.
