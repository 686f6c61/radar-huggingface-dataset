# yifanouyang/smolbge-image-embedding

## Resumen

SmolBGE (smolbge-image-embedding) es un adaptador de alineación multimodal publicado por el desarrollador independiente yifanouyang que proyecta imagenes y texto en ingles a un espacio compartido de 384 dimensiones para busqueda y recuperacion. El adaptador se entrena sobre el encoder de vision congelado de HuggingFaceTB/SmolVLM2-500M-Video-Instruct y el encoder de texto BAAI/bge-small-en-v1.5, de modo que reutiliza un modelo de texto ya habitual en pilas RAG y le anade capacidad de recuperacion visual sin generar leyendas intermedias: las imagenes se codifican directamente.

El punto diferencial es el coste: el adaptador ocupa 3,4 MiB y solo entrena 887.424 parametros, frente a los cientos de millones de parametros congelados de los modelos base. Esto lo hace atractivo para anadir indice visual a un sistema de recuperacion que ya usa embeddings BGE de 384 dimensiones, sin cambiar la dimensionalidad del indice ni desplegar un modelo generativo multimodal.

La licencia es Apache-2.0 para el codigo y el adaptador, aunque los modelos base y el dataset COCO conservan sus propios terminos. El modelo se publico el 21 de septiembre de 2026 y, en el momento de redactar esta ficha, no acumula descargas ni valoraciones en el Hub, por lo que su validacion externa es todavia nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador MLP (768 → 768 → 384) con masked patch pooling sobre el encoder de vision congelado de SmolVLM2-500M-Video-Instruct y el encoder de texto BGE-small-en-v1.5 |
| Parametros totales | No disponible en la model card; el adaptador entrenado declara 887.424 parametros sobre los ~500 M de SmolVLM2-500M y los ~33 M de bge-small-en-v1.5 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Texto en ingles (el adaptador alinea texto en ingles con imagenes); no se declara soporte multilingue |
| Licencia | Apache-2.0 (codigo y adaptador); los modelos base y COCO mantienen sus propios terminos |
| Formato de pesos | No disponible (los pesos se cargan desde el Hub; el repositorio usa Git LFS) |
| Dimension del embedding | 384 (compartida entre imagen y texto) |
| Tamano del adaptador | 3,4 MiB |
| Tarea declarada (pipeline) | feature-extraction |
| Modelos base | HuggingFaceTB/SmolVLM2-500M-Video-Instruct, BAAI/bge-small-en-v1.5 |

## Arquitectura y entrenamiento

La arquitectura combina dos torres congeladas con un adaptador entrenable. La rama visual usa el encoder de SmolVLM2-500M-Video-Instruct, sobre cuyas caracteristicas de parche se aplica un masked patch pooling que agrega la informacion en un vector de 768 dimensiones. Ese vector pasa por un MLP 768 → 768 → 384 que lo proyecta al mismo espacio de 384 dimensiones que produce bge-small-en-v1.5 para el texto. Solo se entrena el adaptador: 887.424 parametros, segun la model card.

El objetivo de entrenamiento combina tres terminos: perdida contrastiva bidireccional (imagen → texto y texto → imagen), destilacion sobre el centroide de las leyendas y un margen sobre negativos duros. El autor menciona como decisiones de ingenieria el cacheo de caracteristicas del backbone, parada temprana basada en validacion, una API de lotes reutilizable y la carga de pesos desde el Hub con una CLI de recuperacion. No se documenta el numero de tokens de entrenamiento ni la composicion completa del dataset, y no se indica que se haya aplicado RLHF o DPO, algo coherente con un modelo de embeddings.

Los datos de alineacion proceden de una particion propia de COCO val2017: 4.000 imagenes de entrenamiento, 500 de validacion y 500 de prueba, con cinco leyendas por imagen y semilla 42. Los identificadores de imagen son disjuntos entre particiones y la de validacion se usa para seleccionar el adaptador. La model card advierte explicitamente de que la evaluacion cubre recuperacion en el dominio COCO en ingles sobre esta particion propia, no el benchmark estandar de COCO.

## Capacidades

- Generacion de embeddings de imagen en un espacio de 384 dimensiones, sin generacion de leyendas intermedias.
- Generacion de embeddings de texto en ingles en el mismo espacio, lo que permite similitud coseno directa entre ambas modalidades.
- Recuperacion imagen → texto (buscar leyendas o descripciones para una imagen dada).
- Recuperacion texto → imagen (buscar imagenes a partir de una consulta en lenguaje natural).
- Construccion de indices vectoriales para RAG multimodal: los vectores de imagen pueden almacenarse en una base vectorial y reutilizarse en consultas repetidas.
- Interfaz de linea de comandos (`smolbge --images ./photos --query "..." --top-k 5`) que devuelve rutas de archivo ordenadas y puntuaciones coseno.
- API de Python mediante la clase `SmolBGEEmbedder`, con `encode_images` y `encode_text`.
- Seleccion automatica de dispositivo entre CUDA, Apple MPS y CPU, con posibilidad de forzar CPU.
- No soporta tool calling, function calling ni comportamiento de agente: es un extractor de caracteristicas, no un modelo generativo.
- No se declaran capacidades multimodales adicionales (audio, video como entrada de inferencia documentada, thinking mode) ni soporte multilingue.

## Casos de uso

- RAG multimodal sobre documentacion escaneada: indexar las paginas o figuras de un corpus PDF como imagenes y recuperarlas por similitud con la consulta del usuario, reutilizando un indice de 384 dimensiones compatible con bge-small-en-v1.5 para los fragmentos de texto.
- Busqueda visual en catalogos de comercio electronico: codificar las fotos de producto una sola vez con `encode_images` y almacenar los vectores en una base vectorial; las consultas de los usuarios se codifican con `encode_text` y se resuelven por producto escalar, sin necesidad de etiquetar manualmente cada referencia.
- Organizacion y deduplicacion semantica de fototecas: la CLI permite procesar una carpeta completa y devolver las imagenes mas cercanas a una descripcion, util para agrupar lotes de imagenes por contenido. La similitud imagen → imagen no esta verificada por el autor, por lo que este uso requiere validacion previa.
- Recuperacion en conjuntos de datos de investigacion: dado un split con leyendas pareadas, el modelo sirve para construir recuperadores de referencia en experimentos de vision-lenguaje con un coste de adaptacion minimo (3,4 MiB de pesos adicionales).
- Prototipado en entornos sin GPU: al ser un adaptador pequeno sobre un backbone de 500 M de parametros, puede ejecutarse en CPU para validar una idea de recuperacion visual antes de invertir en infraestructura mayor.
- Prefiltrado en pipelines de moderacion o curaduria de contenido: recuperar las imagenes mas cercanas a una descripcion textual de interes para revision humana, reduciendo el volumen que un anotador debe inspeccionar.
- Asistencia a la anotacion: dada una imagen, recuperar las leyendas mas probables del corpus indexado para proponer un borrador de etiqueta al anotador, que la revisa y corrige.
- Indexado de archivos fotograficos de medios de comunicacion: generar un indice de 384 dimensiones por imagen para que la redaccion localice material grafico mediante consultas en lenguaje natural en lugar de depender de metadatos manuales.

## Benchmarks y rendimiento

La model card publica resultados sobre una particion propia de COCO val2017 (4.000 imagenes de entrenamiento, 500 de validacion, 500 de prueba, cinco leyendas por imagen, semilla 42, identificadores disjuntos). La recuperacion imagen → texto busca entre 2.500 leyendas y cuenta como acierto que cualquiera de las leyendas pareadas quede en primera posicion; la recuperacion texto → imagen busca entre 500 imagenes.

| Metodo | Imagen → texto R@1 | Texto → imagen R@1 |
|---|---:|---:|
| Baseline lineal | 45,40 % | 59,84 % |
| Adaptador publicado | 68,00 % | 60,76 % |

La mejora en imagen → texto es de 22,6 puntos porcentuales sobre el baseline lineal, con un intervalo de confianza del 95 % obtenido por bootstrap pareado de +18,0 a +27,2 puntos. La mejora en texto → imagen es de 0,92 puntos porcentuales, sin intervalo de confianza reportado en la informacion disponible. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, COCO oficial, etc.) en la informacion disponible, y el autor advierte que la evaluacion no mide la calidad de respuesta de un sistema RAG de extremo a extremo.

## Requisitos de hardware

- VRAM estimada para inferencia: no facilitada por el autor. Como estimacion derivada del recuento de parametros, en fp16 el backbone de SmolVLM2-500M ocupa alrededor de 1 GB y bge-small-en-v1.5 alrededor de 66 MB, mas el adaptador (3,4 MiB) y las activaciones; en la practica conviene reservar del orden de 1,5 a 2,5 GB.
- GPU recomendadas: el autor no especifica ninguna. Cualquier GPU con al menos 2-3 GB de VRAM libre es suficiente en fp16; no se requiere A100 ni H100 para inferencia.
- Cabe en GPU de consumo: si, en cualquier tarjeta consumer con unos pocos GB de VRAM libres (por ejemplo, series GTX 10xx en adelante, RTX 20xx/30xx/40xx) y tambien en Apple MPS y CPU, que el modelo selecciona automaticamente.
- Opciones de despliegue: paquete de Python instalado desde el repositorio de GitHub (`pip install "git+https://github.com/3513542967-creator/smolbge-image-embedding.git"`), CLI `smolbge` y API `SmolBGEEmbedder`. El autor recomienda Python 3.12 en un entorno virtual y advierte de que la primera ejecucion descarga el adaptador y ambos checkpoints base. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI; estos servidores estan orientados a generacion y no aplican a un extractor de caracteristicas.
- Latencia y throughput estimados: no disponibles. La model card menciona una API de lotes reutilizable y cacheo de caracteristicas del backbone, pero ese cacheo se describe en el contexto del entrenamiento, no de la inferencia.

## Comparativa con modelos similares

No hay datos de benchmarks comparables: los resultados publicados por SmolBGE corresponden a una particion propia de COCO, no al benchmark estandar, por lo que no son directamente equiparables a las cifras que publican otras familias. La comparacion se limita por tanto a caracteristicas estructurales.

| Modelo | Tipo | Dimension del embedding | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolBGE (este modelo) | Adaptador sobre SmolVLM2-500M + bge-small-en-v1.5 | 384 | 887.424 entrenables (backbones congelados) | Apache-2.0 (adaptador y codigo) | HuggingFace Hub y GitHub |
| CLIP ViT-B/32 | Modelo contrastivo imagen-texto de extremo a extremo | 512 | ~151 M (orden de magnitud) | MIT (segun el repositorio original) | Ampliamente disponible |
| SigLIP base (patch16-224) | Modelo contrastivo imagen-texto de extremo a extremo | 768 | No disponible | Apache-2.0 (segun el repositorio original) | Ampliamente disponible |
| BAAI/bge-small-en-v1.5 | Solo texto, sin rama visual | 384 | ~33 M | MIT (segun el repositorio original) | HuggingFace Hub |
| HuggingFaceTB/SmolVLM2-500M-Video-Instruct | Modelo generativo vision-lenguaje (no produce embeddings) | No aplica | ~500 M | Apache-2.0 (segun el repositorio original) | HuggingFace Hub |

Rendimiento comparado: no disponible. El autor no publica comparaciones contra CLIP, SigLIP ni otros recuperadores en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador solo entrena 887.424 parametros; toda la capacidad representacional depende de los backbones congelados, por lo que su techo esta acotado por ellos.
- La evaluacion se limita a recuperacion en el dominio COCO y en ingles sobre una particion propia; no es el benchmark estandar de COCO y no hay resultados fuera de ese dominio.
- No se mide la calidad de respuesta de un RAG de extremo a extremo: el autor lo advierte de forma explicita.
- Posible exposicion a los datos de preentrenamiento de los modelos base (contaminacion), ya que COCO es un corpus muy extendido.
- La calidad de recuperacion entre dominios distintos de COCO y la recuperacion imagen → imagen no estan verificadas por el autor.
- El texto de consulta esta pensado para ingles; el encoder BGE-small-en-v1.5 es monolingue y no se declara soporte para castellano ni otros idiomas.
- No genera leyendas ni texto: no sirve como modelo generativo ni para tareas de respuesta a preguntas sin un componente adicional.
- Licencia Apache-2.0 para el codigo y el adaptador, pero los modelos base y COCO conservan sus propios terminos; un uso comercial debe revisar `THIRD_PARTY.md` y las licencias de SmolVLM2-500M, bge-small-en-v1.5 y el corpus de evaluacion.
- Riesgo de alucinacion: no aplica en el sentido generativo porque el modelo no produce texto libre, pero si puede devolver recuperaciones irrelevantes con puntuaciones altas cuando la consulta cae fuera de la distribucion del dominio de entrenamiento.
- Madurez baja: cero descargas y cero valoraciones en el Hub en el momento de la consulta, un unico autor y un repositorio de 0,0 GB declarado, sin validacion independiente conocida.
- El repositorio ocupa 0,0 GB segun el Hub y el adaptador 3,4 MiB, de modo que el coste real de despliegue esta dominado por la descarga de los checkpoints base, no por el adaptador.
- Se aconseja almacenar los vectores de imagen en una base vectorial y reutilizarlos, en lugar de reencodificar la carpeta en cada consulta, para evitar latencias innecesarias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yifanouyang/smolbge-image-embedding
- Repositorio GitHub: https://github.com/3513542967-creator/smolbge-image-embedding
- Model card ampliada: https://huggingface.co/yifanouyang/smolbge-image-embedding/blob/main/MODEL_CARD.md
- README en chino: https://huggingface.co/yifanouyang/smolbge-image-embedding/blob/main/README_zh-CN.md
- Guia de reproduccion del entrenamiento y la evaluacion: https://github.com/3513542967-creator/smolbge-image-embedding/blob/main/docs/REPRODUCE.md
- Codigo de modelado: https://github.com/3513542967-creator/smolbge-image-embedding/blob/main/src/smolbge_image_embedding/modeling.py
- Resultados completos de evaluacion: https://github.com/3513542967-creator/smolbge-image-embedding/blob/main/results/evaluation.json
- Identificadores exactos de las particiones: https://github.com/3513542967-creator/smolbge-image-embedding/blob/main/data/splits/coco5k_seed42.json
- Terminos de terceros: https://github.com/3513542967-creator/smolbge-image-embedding/blob/main/THIRD_PARTY.md
- Modelo base de vision: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct
- Modelo base de texto: https://huggingface.co/BAAI/bge-small-en-v1.5

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; las entradas obtenidas correspondian a paginas corporativas de Microsoft sin relacion con la ficha.
