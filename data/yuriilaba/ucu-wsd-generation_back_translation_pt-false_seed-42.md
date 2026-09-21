# yuriilaba/ucu-wsd-generation_back_translation_pt-false_seed-42

## Resumen

`yuriilaba/ucu-wsd-generation_back_translation_pt-false_seed-42` es un modelo de representaciones de frases (sentence embeddings) afinado para la desambiguacion del sentido de las palabras (WSD, *word-sense disambiguation*) en ucraniano. Lo publica el usuario de HuggingFace `yuriilaba`, presumiblemente en el contexto de un trabajo academico (el prefijo "ucu" apunta a una institucion universitaria y el identificador incluye referencias a *generation*, *back_translation* y semillas de entrenamiento). El modelo parte de `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`, un encoder multilingue basado en la familia XLM-RoBERTa, y se ha ajustado sobre tripletas construidas mediante traduccion inversa (*back-translation*).

El problema que aborda es concreto: dado un contexto oracional en ucraniano y una palabra objetivo, producir una representacion que permita distinguir el sentido correcto de esa palabra frente a otros candidatos. Con 278.043.648 parametros y un peso en disco de aproximadamente 1,1 GB, es un modelo pequeno y facil de desplegar, adecuado para tareas de similitud semantica y desambiguacion mas que para generacion de texto.

Su relevancia es limitada pero especifica: la WSD en ucraniano es un area con pocos recursos publicos, y este modelo reporta una exactitud de WSD de 0,9135 y correlaciones STS de Pearson 0,8122 y Spearman 0,8017 sobre su propio conjunto de evaluacion. No obstante, el repositorio no documenta licencia, idiomas ni practicamente ningun detalle operativo, y acumula 0 descargas y 0 *likes*, por lo que debe tratarse como un artefacto de investigacion mas que como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (base `paraphrase-multilingual-mpnet-base-v2`, familia XLM-RoBERTa/MPNet) |
| Parametros totales | 278.043.648 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp32) |
| Idiomas soportados | no disponible en la ficha; el ajuste y la evaluacion se orientan al ucraniano |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,1 GB |
| Pipeline declarado | no disponible |
| Tarea de ajuste | desambiguacion del sentido de las palabras (WSD) y similitud textual semantica (STS) |
| Pooling de token objetivo | `False` (segun la model card) |
| Semilla de entrenamiento / validacion | 42 / 42 |
| Fecha de creacion | 2026-09-21 (fecha anomala, ver limitaciones) |

## Arquitectura y entrenamiento

El modelo es un encoder de frases derivado de `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`, que a su vez se apoya en la arquitectura XLM-RoBERTa con objetivos de entrenamiento tipo MPNet. Esto implica un transformer bidireccional de 12 capas y 768 dimensiones de embedding oculto, con 278 millones de parametros, que produce vectores de frases normalizados y comparables mediante similitud coseno. No es un modelo generativo ni causal: no emite texto, sino representaciones vectoriales.

El ajuste se realiza sobre el fichero de tripletas `local_datasets/semi_supervised_2/triplets/triplets_generation_translation.csv`, generado mediante traduccion inversa, lo que sugiere una estrategia semisupervisada para obtener pares/anclas positivas y negativas sin anotacion manual extensiva. La model card especifica que el *pooling* sobre el token objetivo esta desactivado (`target-token pooling: False`), de modo que el vector de frase no se concentra en la posicion de la palabra a desambiguar. No se documentan el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. Tampoco se describen innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa u otras), algo coherente con que se trata de un encoder y no de un generador.

## Capacidades

- Generacion de *embeddings* de frase y de pasaje para similitud semantica y recuperacion.
- Desambiguacion del sentido de las palabras (WSD) en ucraniano, con una exactitud reportada de 0,9135 sobre su conjunto de evaluacion.
- Evaluacion de similitud textual semantica (STS) con correlaciones de Pearson 0,8122 y Spearman 0,8017.
- Capacidad multilingue heredada del modelo base (XLM-RoBERTa), aunque el ajuste se orienta al ucraniano.
- *Retrieval* denso y busqueda semantica dentro de un *corpus* vectorizado.
- Deteccion de parafrasis y agrupamiento semantico por similitud coseno.
- No dispone de *tool calling* ni de *function calling*: es un encoder, no un modelo de instrucciones.
- No soporta razonamiento multi-paso ni modo *thinking*; no es un modelo agente.
- No tiene capacidades de vision, audio ni generacion de texto.

## Casos de uso

- Desambiguacion lexica en pipelines de PLN para ucraniano: el modelo genera representaciones que permiten seleccionar el sentido correcto de una palabra polisemica dado su contexto, con una exactitud reportada superior al 91 % en su conjunto de prueba.
- Busqueda semantica multilingue: al proceder de un encoder multilingue, puede vectorizar documentos en varios idiomas y recuperar pasajes relevantes mediante similitud coseno, util para motores de busqueda internos.
- Deduplicacion y agrupamiento de *corpus*: los *embeddings* permiten detectar documentos o frases casi identicas en grandes colecciones mediante umbrales de similitud.
- Sistemas de recomendacion de contenido textual: comparar la similitud entre un articulo consultado y un catalogo de articulos vectorizados para sugerir lecturas afines.
- Evaluacion de calidad de traduccion automatica: usar las correlaciones STS del modelo para medir la proximidad semantica entre una traduccion candidata y una referencia.
- Filtrado de datos para entrenamiento: puntuar pares de frases por similitud para descartar ejemplos redundantes o mal alineados en la construccion de *datasets*.
- Clasificacion de intenciones por vecindad: dado un conjunto de ejemplos etiquetados, asignar la etiqueta del vecino mas cercano en el espacio de *embeddings* para tareas de enrutado simple.

## Benchmarks y rendimiento

Los unicos resultados publicados en la model card son los siguientes:

| Metrica | Resultado |
|---|---|
| WSD accuracy | 0,9134980988593155 |
| STS Pearson | 0,8121534819447503 |
| STS Spearman | 0,8017166333456954 |

La model card indica que los resultados completos por tarea de MTEB estan en `evaluation/mteb_results/` dentro del repositorio, pero no se han proporcionado en la informacion disponible. No se ofrecen comparaciones con otros modelos ni el detalle de los conjuntos de evaluacion empleados.

## Requisitos de hardware

- VRAM estimada: unos 1,1 GB en fp32 y aproximadamente 0,55 GB en fp16, mas el *overhead* del *runtime* (habitualmente entre 0,5 y 1 GB adicionales).
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPU integradas con memoria compartida.
- Puede ejecutarse en CPU con latencias aceptables dado su tamano reducido, aunque no se han publicado cifras de *throughput*.
- GPU de centro de datos (A100, H100) no son necesarias salvo para procesar volumenes muy elevados en lote.
- Opciones de despliegue: `sentence-transformers` y `transformers` de HuggingFace; tambien es compatible con *backends* de *embeddings* como INFINITY, Text Embeddings Inference (TEI) o integraciones tipo vLLM/llama.cpp solo si se convierte a GGUF (no confirmado).
- Latencia y *throughput*: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (WSD ucraniano) | 278.043.648 | no disponible | no disponible (orientado a ucraniano) | no disponible | HuggingFace, 0 descargas |
| `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` | 278.043.648 (modelo base) | no disponible | multilingue (segun el autor del base) | Apache-2.0 segun el repositorio original | Ampliamente utilizado |
| `sentence-transformers/LaBSE` | 471.000.000 aprox. | no disponible | mas de 100 idiomas declarados | Apache-2.0 segun el repositorio original | Muy extendido |
| `intfloat/multilingual-e5-base` | 278.000.000 aprox. | 512 tokens segun su ficha | multilingue | MIT segun su repositorio original | Muy extendido |

Nota: los datos de parametros, contexto y licencia de los modelos comparables corresponden a la informacion publica habitual de sus repositorios; no se han verificado en esta busqueda y no se dispone de resultados de benchmarks comparables cara a cara con el modelo objeto de la ficha.

## Limitaciones y advertencias

- Licencia no declarada: sin terminos explicitos no se puede asumir uso comercial permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no declarados en la ficha: aunque el ajuste es para ucraniano, no se especifica la cobertura real ni la calidad en otros idiomas.
- Los resultados de WSD (0,9135) y STS (Pearson 0,8122, Spearman 0,8017) proceden de un unico conjunto de evaluacion definido por el propio autor, sin validacion externa ni detalle del protocolo, por lo que no son directamente comparables con cifras publicadas en la literatura.
- Repositorio sin descargas ni *likes* y con documentacion minima: no hay garantia de mantenimiento, soporte ni reproducibilidad.
- Fecha de creacion registrada como 2026-09-21, posterior a la actualidad en el momento de redactar esta ficha, lo que sugiere un error de metadatos o un entorno de fecha manipulado; conviene tratarlo con cautela.
- Es un encoder, no un generador: no puede responder a instrucciones, redactar texto ni ejecutar llamadas a herramientas. Cualquier caso de uso conversacional requiere combinarlo con un modelo generativo aparte.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de similitudes espurias cuando el modelo se usa fuera del dominio de entrenamiento (texto ucraniano con vocabulario o registro diferente).
- No se documentan sesgos del dataset de tripletas, que al provenir de traduccion inversa puede heredar los sesgos y errores del sistema de traduccion utilizado.
- Longitud de contexto no disponible: conviene verificar la configuracion (`max_seq_length`) del modelo base antes de alimentar pasajes largos, ya que los truncados silenciosos degradan la calidad del *embedding*.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuriilaba/ucu-wsd-generation_back_translation_pt-false_seed-42
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
- Resultados MTEB citados en la model card: ruta interna `evaluation/mteb_results/` del repositorio (sin URL publica confirmada)
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos (foros en japones sobre tarjetas bancarias y etiquetadoras) no guardan relacion con el objeto de la ficha.
