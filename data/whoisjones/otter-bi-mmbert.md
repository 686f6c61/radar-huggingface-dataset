# whoisjones/otter-bi-mmbert

## Resumen

otter-bi-mmbert es un reconocedor de entidades nombradas (NER) de tipo abierto y multilingüe desarrollado por whoisjones. A diferencia de los sistemas NER tradicionales con un conjunto fijo de etiquetas, este modelo acepta como entrada un texto y una lista de tipos de entidad en lenguaje natural (por ejemplo, `["person", "band", "chemical compound"]`) y devuelve los intervalos de caracteres de las entidades que coinciden con esos tipos. No requiere ajuste fino para nuevas categorías: los tipos forman parte de la entrada.

El modelo utiliza una arquitectura de doble codificador (bi-encoder) en la que el texto y los nombres de los tipos de entidad se codifican por separado. Los candidatos a entidad se puntúan comparando sus representaciones con las de las etiquetas. Como las representaciones de las etiquetas dependen únicamente del conjunto de tipos, pueden calcularse una sola vez y reutilizarse en todo un corpus, lo que resulta más económico cuando se aplican los mismos tipos a muchas entradas. El modelo tiene 476,5 millones de parámetros y una longitud máxima de secuencia de 1024 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bi-encoder basado en transformer (texto: mmBERT-base; etiquetas: bert-base-multilingual-uncased) |
| Parametros totales | 476.564.864 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens (maximo de secuencia) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Multilingue (hereda las capacidades de mmBERT-base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

otter-bi-mmbert emplea una arquitectura de doble codificador. El codificador de texto es `jhu-clsp/mmBERT-base`, un modelo BERT multilingue, y el codificador de etiquetas es `google-bert/bert-base-multilingual-uncased`. El texto y los nombres de los tipos de entidad se codifican de forma independiente; los candidatos a entidad (intervalos de hasta 30 tokens) se puntúan contra las representaciones de las etiquetas mediante similitud. Esta separacion permite precalcular las representaciones de las etiquetas y reutilizarlas en multiples pasadas sobre un corpus, lo que reduce el coste computacional cuando el conjunto de tipos es fijo.

El entrenamiento completo, el conjunto de evaluacion y los scripts de preparacion de datos estan disponibles en el repositorio de GitHub del proyecto. El umbral de prediccion por defecto (0,2) se calibro optimizando la macro-F1 en el conjunto de evaluacion. No se han publicado detalles especificos sobre el volumen de datos de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO.

## Capacidades

- Reconocimiento de entidades nombradas de tipo abierto: el conjunto de etiquetas no es fijo y se especifica en la entrada en lenguaje natural.
- Soporte multilingue: al basarse en mmBERT, el modelo puede procesar texto en multiples idiomas.
- Puntuacion de entidades con umbral ajustable: el parametro `threshold` permite controlar el equilibrio entre precision y recall.
- Reutilizacion de representaciones de etiquetas: el metodo `encode_labels` permite calcular las representaciones de los tipos una sola vez y reutilizarlas en multiples inferencias.
- Inferencia por lotes: acepta listas de textos y devuelve listas de entidades en el mismo orden.
- Devolucion de intervalos de caracteres: cada entidad incluye `text`, `label`, `start`, `end` y `score`, lo que facilita la integracion en pipelines de procesamiento de texto.

## Casos de uso

- Extraccion de informacion en corpus multilingues: el modelo puede aplicarse a documentos en varios idiomas sin necesidad de entrenar un modelo por idioma, gracias a su naturaleza multilingue. Por ejemplo, extraer personas y organizaciones de noticias en aleman, espanol y frances con un unico modelo.
- Etiquetado dinamico de entidades en dominios especializados: en dominios como la biomedicina o el derecho, donde las categorias de entidades cambian con frecuencia, el modelo permite especificar tipos como `"chemical compound"` o `"legal citation"` sin reentrenar.
- Construccion de grafos de conocimiento: el modelo puede alimentar pipelines de extraccion de entidades y relaciones, generando nodos y aristas a partir de textos no estructurados. Su capacidad para trabajar con tipos arbitrarios facilita la creacion de ontologias personalizadas.
- Sistemas de atencion al cliente multilingues: integrado en un sistema de tickets, el modelo puede extraer entidades como `"product"`, `"order number"` o `"complaint reason"` de mensajes de usuarios en distintos idiomas, ayudando a enrutar y priorizar incidencias.
- Analisis de redes sociales y monitorizacion de marca: el modelo puede identificar menciones de marcas, personas o productos en publicaciones de redes sociales, con la flexibilidad de definir tipos como `"brand"`, `"influencer"` o `"hashtag"` segun la campana.
- Procesamiento de documentos legales y financieros: extraer entidades como `"contract party"`, `"amount"` o `"date"` de contratos o informes financieros, con la posibilidad de ajustar el umbral para maximizar la precision en entornos donde los errores son costosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que el umbral por defecto se calibro optimizando la macro-F1 en un conjunto de evaluacion, pero no se proporcionan cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 476,5 millones de parametros. En FP32, los pesos ocupan aproximadamente 1,9 GB, por lo que caben en GPUs con 4 GB o mas de VRAM. En FP16, el uso de memoria se reduce a aproximadamente 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia. Una RTX 3060, RTX 4060 o superior en el segmento de consumo es adecuada. Para procesamiento por lotes grande, una A100 o H100 ofrece mayor throughput.
- Compatibilidad con GPUs de consumo: si, el modelo cabe en GPUs de consumo como la serie RTX 30 y 40 de NVIDIA.
- Opciones de despliegue: el modelo se carga con `transformers` mediante `trust_remote_code=True`. Tambien puede desplegarse con vLLM, TGI o llama.cpp si se convierte a los formatos adecuados, aunque no se proporcionan instrucciones especificas para estos entornos.
- Latencia y throughput: no disponible. Al ser un modelo BERT-base, la latencia por secuencia es del orden de milisegundos en GPUs modernas, pero no se han publicado mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| otter-bi-mmbert | Bi-encoder (mmBERT + BERT-multilingual) | 476,5 M | 1024 tokens | Apache 2.0 | NER de tipo abierto, multilingue |
| otter-cross-mmbert | Cross-encoder (mmBERT) | no disponible | no disponible | Apache 2.0 | Version cross-encoder, mas precisa segun el autor |
| otter-bi-rembert | Bi-encoder (RemBERT) | no disponible | no disponible | Apache 2.0 | Variante con RemBERT como codificador |
| otter-cross-rembert | Cross-encoder (RemBERT) | no disponible | no disponible | Apache 2.0 | Variante cross-encoder con RemBERT |

El autor indica que los cross-encoders son mas precisos, mientras que los bi-encoders son mas eficientes cuando se aplica un mismo conjunto de etiquetas a un corpus grande. No se dispone de comparaciones con modelos NER de tipo abierto externos como GLiNER o modelos generativos con capacidades NER.

## Limitaciones y advertencias

- El umbral de prediccion por defecto (0,2) puede no ser optimo para todos los casos de uso. El autor recomienda recalibrarlo si se dispone de datos anotados del dominio propio.
- La calidad de las predicciones depende de la redaccion de los nombres de las etiquetas. Terminos como `"politician"` y `"person"` producen resultados diferentes; es importante usar la misma terminologia que usaria un humano para describir el tipo.
- La longitud maxima de secuencia es de 1024 tokens y la longitud maxima de entidad es de 30 tokens. Textos mas largos deben truncarse o dividirse, y entidades que superen los 30 tokens no se detectaran.
- Al ser un modelo basado en BERT, puede presentar sesgos presentes en los datos de entrenamiento de mmBERT y bert-base-multilingual-uncased, como sesgos de genero o etnia.
- Como todo modelo NER, existe riesgo de alucinacion o de identificar entidades incorrectas, especialmente con umbrales bajos.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo se distribuye sin garantias y el autor no ofrece soporte oficial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/whoisjones/otter-bi-mmbert
- Repositorio de GitHub: https://github.com/whoisjones/otter
- Modelo cross-encoder con mmBERT: https://huggingface.co/whoisjones/otter-cross-mmbert
- Modelo bi-encoder con RemBERT: https://huggingface.co/whoisjones/otter-bi-rembert
- Modelo cross-encoder con RemBERT: https://huggingface.co/whoisjones/otter-cross-rembert
- Codificador de texto (mmBERT-base): https://huggingface.co/jhu-clsp/mmBERT-base
- Codificador de etiquetas (bert-base-multilingual-uncased): https://huggingface.co/google-bert/bert-base-multilingual-uncased
