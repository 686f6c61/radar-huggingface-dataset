# weizezhao/Qwen3-VL-Embedding-2B

## Resumen

Qwen3-VL-Embedding-2B es un modelo de embeddings multimodales desarrollado por el equipo Qwen (Alibaba) y publicado en HuggingFace por el usuario weizezhao. Se construye mediante fine-tuning del modelo instructivo Qwen/Qwen3-VL-2B-Instruct y su proposito es proyectar texto, imagenes, capturas de pantalla y video a un espacio vectorial comun, de modo que sea posible calcular similitud semantica entre modalidades distintas dentro de un mismo pipeline de recuperacion de informacion.

El modelo resuelve el problema de la busqueda cross-modal: permite indexar y recuperar contenido visual a partir de consultas textuales, comparar videos con descripciones y agrupar contenido heterogeneo por similitud semantica. Forma parte de una familia mas amplia que incluye un modelo reranker complementario (Qwen3-VL-Reranker) con el que se construye un pipeline de dos etapas: recuperacion inicial por embeddings y reordenacion precisa por relevancia.

Con 2.127.532.032 parametros, 28 capas, ventana de contexto de 32.000 tokens y dimension de embedding configurable de 64 a 2048, es una opcion ligera frente a su variante de 8B. Su licencia Apache 2.0 y su soporte de mas de 30 idiomas lo hacen adecuado para integrarse en sistemas de produccion sin restricciones comerciales. El modelo es relevante ahora porque consolida la recuperacion multimodal en un unico encoder de tamano contenido, evitando la necesidad de mantener encoders separados para texto e imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen3-VL (vision-language) |
| Parametros totales | 2.127.532.032 (~2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.000 tokens |
| Tipos de cuantizacion | soporte de cuantizacion post-proceso del embedding de salida (segun model card); no se detallan los esquemas concretos |
| Idiomas soportados | 30+ idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Capas del modelo | 28 |
| Dimension de embedding | hasta 2048, configurable entre 64 y 2048 (MRL) |
| Modalidades de entrada | texto, imagenes, capturas de pantalla, video y combinaciones multimodales |
| Modelo base | Qwen/Qwen3-VL-2B-Instruct |
| Libreria | sentence-transformers / transformers |
| Tamano del repositorio | 4,3 GB |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3-VL, un transformer multimodal que procesa conjuntamente tokens de texto y representaciones visuales. El fine-tuning convierte el modelo instructivo original en un encoder de embeddings: en lugar de generar texto, produce un vector de dimension configurable que representa semanticamente la entrada completa, sea texto, imagen, video o una combinacion. La dimension de salida es ajustable entre 64 y 2048 mediante Matryoshka Representation Learning (MRL), lo que permite truncar el vector para reducir coste de almacenamiento y calculo en la busqueda aproximada.

El modelo es instruction-aware: acepta instrucciones personalizadas por tarea que, segun la model card, aportan mejoras de entre el 1 % y el 5 % en la mayoria de tareas downstream. Se recomienda redactar esas instrucciones en ingles, ya que la mayoria de las usadas durante el entrenamiento estaban en ese idioma. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO; esa informacion se remite al informe tecnico (arXiv:2601.04720). Tampoco se especifican innovaciones de decodificacion, al tratarse de un modelo de representacion y no de generacion.

## Capacidades

- Generacion de embeddings multimodales en un espacio vectorial compartido para texto, imagen, captura de pantalla y video.
- Recuperacion imagen-texto y video-texto (image-text retrieval, video-text matching).
- Clustering de contenido multimodal por similitud semantica.
- Soporte de preguntas visuales (VQA) como tarea de evaluacion dentro del pipeline de representacion.
- Grounding visual y moment retrieval en video (segun los conjuntos evaluados en MMEB-V2).
- Representacion de documentos visuales (ViDoRe, VisRAG) para recuperacion sobre documentos escaneados o maquetados.
- Soporte multilingue en mas de 30 idiomas, con capacidad cross-lingue inherida de Qwen3-VL.
- Dimension de embedding configurable (MRL) de 64 a 2048 para ajustar precision y coste.
- Instrucciones personalizables por tarea (instruction-aware) para especializar el comportamiento del encoder.
- Cuantizacion del embedding de salida para reducir el coste de almacenamiento en indices vectoriales.
- No se documenta soporte de tool calling ni de agentes multi-paso; es un modelo de representacion, no un generador conversacional.

## Casos de uso

- Busqueda visual en catalogos de producto: indexar las imagenes de un catalogo con el modelo y permitir consultas en lenguaje natural ("camisa azul de lino con cuello mao") que recuperen los articulos relevantes por similitud en el espacio vectorial.
- Recuperacion sobre documentos escaneados: representar paginas de PDF, facturas o formularios como vectores y construir un motor de busqueda semantica sobre documentacion visual sin necesidad de OCR previo, apoyandose en las capacidades evaluadas en ViDoRe y VisRAG.
- Moderacion y deduplicacion de contenido multimedia: calcular embeddings de imagenes y videos subidos por usuarios para detectar duplicados, contenido casi identico o agrupar material por tematica antes de revision manual.
- Busqueda dentro de archivos de video: indexar fotogramas o segmentos y localizar momentos concretos mediante consultas textuales, usando las capacidades de moment retrieval evaluadas en el benchmark.
- Sistemas de recomendacion cross-modal: representar articulos descritos en texto e imagenes de producto en un mismo espacio para calcular afinidad entre la consulta del usuario y el contenido disponible.
- Pipeline RAG multimodal de dos etapas: usar este modelo de 2B para la recuperacion inicial a gran escala y el Qwen3-VL-Reranker correspondiente para reordenar los candidatos, equilibrando coste y precision.
- Analisis de accesibilidad: generar descripciones o etiquetas semanticas de imagenes comparando su embedding con el de un banco de descripciones candidatas, util para alt-text asistido.
- Clustering de grandes volumenes de imagenes o video para organizacion automatica de bibliotecas de medios, aprovechando la dimension reducible (MRL) para abaratar el calculo de similitud a gran escala.

## Benchmarks y rendimiento

La model card incluye resultados sobre MMEB-V2, pero la tabla proporcionada en la informacion disponible solo contiene la cabecera (numero de datasets por categoria) sin las filas de resultados numericos de los modelos. Por tanto, no es posible presentar cifras concretas.

| Benchmark | Resultado |
|---|---|
| MMEB-V2 (Image CLS, QA, RET, GD; Video CLS, QA, RET, MRET; VisDoc VDRv1, VDRv2, VR, OOD) | cifras no disponibles en la informacion proporcionada |

No se han publicado resultados numericos de benchmarks en la informacion disponible. Se remite al informe tecnico (arXiv:2601.04720) y al leaderboard MMEB-V2 para los valores completos.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision completa (fp16/bf16) el modelo de ~2,1B parametros requiere aproximadamente 4,3 GB solo para pesos, mas el overhead de activaciones y del procesador visual; en la practica se recomienda un minimo de 8-12 GB de VRAM.
- En cuantizacion de 8 bits el peso baja a unos 2,1 GB; en 4 bits, a aproximadamente 1,1 GB, aunque la model card no detalla los esquemas de cuantizacion soportados para los pesos (solo menciona cuantizacion del embedding de salida).
- GPU recomendadas: A100, H100 o L40S para despliegues de alto throughput; RTX 4090 o RTX 3090 para desarrollo y cargas moderadas.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM en fp16, y en tarjetas de 6-8 GB con cuantizacion.
- Opciones de despliegue: sentence-transformers y transformers como vias nativas; el modelo es compatible con endpoints de HuggingFace (tag endpoints_compatible). No se confirma soporte especifico de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de embedding | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-VL-Embedding-2B | 2B | 32K | hasta 2048 (MRL) | Apache 2.0 | Multimodal (texto, imagen, video), instruction-aware |
| Qwen3-VL-Embedding-8B | 8B | 32K | hasta 4096 (MRL) | Apache 2.0 | Version mayor de la misma familia, 36 capas |
| Qwen3-VL-Reranker-2B | 2B | 32K | no aplica (reranker) | Apache 2.0 | Modelo complementario de reordenacion, no genera embeddings |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada, ya que las cifras de MMEB-V2 no se incluyen. La eleccion entre 2B y 8B depende del equilibrio entre coste de inferencia y precision, con la variante de 8B ofreciendo el doble de dimension de embedding y mas capas.

## Limitaciones y advertencias

- Es un modelo de representacion, no un generador: no produce texto ni mantiene conversaciones, por lo que no debe emplearse como sustituto de un LLM instructivo.
- La model card no detalla los sesgos conocidos del modelo; al heredar el entrenamiento de Qwen3-VL, es previsible que arrastre sesgos presentes en los datos originales, pero no hay documentacion especifica.
- Riesgo de alucinacion no aplicable en sentido estricto (no genera texto), pero si riesgo de falsos positivos en similitud: embeddings cercanos no garantizan relevancia real, de ahi la utilidad del reranker en el pipeline.
- No se especifican limitaciones de idioma concretas mas alla del soporte de 30+ idiomas; el rendimiento en idiomas de bajos recursos no esta documentado.
- Las instrucciones personalizadas funcionan mejor en ingles; instrucciones en otros idiomas pueden degradar la calidad de la representacion.
- La cuantizacion del embedding de salida puede reducir la precision de recuperacion; no se detalla el impacto cuantitativo.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales conocidas, pero conviene verificar los terminos del modelo base Qwen3-VL.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-01: se trata de una publicacion muy reciente sin validacion comunitaria extensa.
- El autor del repositorio (weizezhao) no coincide con la organizacion oficial Qwen, por lo que conviene contrastar con el repositorio oficial Qwen/Qwen3-VL-Embedding-2B antes de usarlo en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/weizezhao/Qwen3-VL-Embedding-2B
- Repositorio oficial de la familia: https://huggingface.co/Qwen/Qwen3-VL-Embedding-2B
- Informe tecnico: https://arxiv.org/abs/2601.04720
- Blog de Qwen: https://qwen.ai/blog?id=qwen3-vl-embedding
- GitHub: https://github.com/QwenLM/Qwen3-VL-Embedding
- Leaderboard MMEB-V2: https://huggingface.co/spaces/TIGER-Lab/MMEB-Leaderboard
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Reranker complementario: https://huggingface.co/Qwen/Qwen3-VL-Reranker-2B
