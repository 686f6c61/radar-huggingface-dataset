# veripazari/Mursit-Large-TR-Retrieval

## Resumen

Mursit-Large-TR-Retrieval es un modelo de embeddings de frases (sentence-transformers) disenado para recuperacion densa de informacion en turco, con especial enfasis en el dominio legal. Lo desarrolla NewMindAI y esta publicado en Hugging Face bajo licencia Apache 2.0; la ficha consultada es un espejo archivado por VeriPazari que preserva la documentacion original. El modelo parte de Mursit-Large, un encoder ModernBERT-large de 403 millones de parametros preentrenado desde cero sobre un corpus predominantemente turco de aproximadamente 112.700 millones de tokens.

La relevancia del modelo reside en dos factores. Primero, cubre un hueco poco atendido: los embeddings de alta calidad para turco, y en particular para texto juridico turco (sentencias del Yargitay y del Danistay, tesis academicas de YOKTEZ), siguen siendo escasos frente a la oferta en ingles. Segundo, su estrategia de entrenamiento combina un preentrenamiento masivo desde cero con un ajuste fino contrastivo sobre el conjunto MS MARCO-TR (920.106 tripletas), lo que lo situa entre los mejores modelos turcos de embeddings segun sus propias cifras (56,87 en MTEB-Turkish y 46,56 en la puntuacion legal).

El modelo produce embeddings densos de 1.024 dimensiones con una longitud maxima de secuencia de 2.048 tokens, lo que permite indexar pasajes legales largos sin truncamiento agresivo. Su formato de pesos es safetensors, con exportacion ONNX disponible, y es compatible con Text Embeddings Inference (TEI) para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (encoder transformer con atencion local/global alternada) |
| Parametros totales | 403.629.056 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (repo con safetensors y ONNX; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | tr (principal), en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |
| Dimension del embedding | 1.024 |
| Capas | 28 |
| Hidden size | 1.024 |
| Tamano de FFN | 2.624 |
| Cabezas de atencion | 16 (64 dimensiones por cabeza) |
| Ventana de atencion local | 128 |
| Vocabulario | 59.008 tokens (tokenizer propio entrenado con documentos legales) |
| Funcion de activacion | GeGLU |
| Normalizacion | RMSNorm pre-capa |
| Embeddings posicionales | RoPE con theta = 20.000 |
| Modelo base | newmindai/Mursit-Large |
| Tamano del repositorio | 3,2 GB |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT-large con atencion alternada entre capas locales (ventana deslizante de 128 tokens) y globales, RMSNorm pre-capa, activacion GeGLU en las capas MLP y embeddings posicionales rotatorios (RoPE) con theta de 20.000. Esta combinacion reduce el coste computacional del encoder frente a un transformer clasico de atencion completa, manteniendo capacidad de modelado de contexto. El tokenizer es propio, con 59.008 tokens, entrenado sobre documentos legales turcos.

El preentrenamiento se realizo desde cero sobre aproximadamente 112.700 millones de tokens de un corpus predominantemente turco. Las fuentes legales incluyen 10,3 millones de secuencias del Tribunal de Casacion (Yargitay, unos 3.430 millones de tokens), 151.000 secuencias del Consejo de Estado (Danistay, unos 110 millones de tokens) y 21,1 millones de secuencias de tesis academicas (YOKTEZ, unos 9.610 millones de tokens tras procesamiento DocsOCR). Las fuentes generales turcas suman 212 millones de secuencias y unos 96.170 millones de tokens, procedentes de FineWeb2 y del subconjunto turco de CulturaX. El pipeline de datos aplico deduplicacion semantica con SemHash, filtrado de calidad FineWeb, filtrado por URL y empaquetado de paginas. El objetivo de entrenamiento fue MLM con probabilidad de enmascaramiento del 15 por ciento y estrategia 80-10-10, usando MosaicML Composer con el optimizador Decoupled StableAdamW, tasa de aprendizaje de 8e-4, schedule warmup_stable_decay y precision mixta BF16.

El ajuste fino para embeddings se hizo con aprendizaje contrastivo sobre MS MARCO-TR (920.106 tripletas), empleando CachedGISTEmbedLoss con BGE-M3 como modelo guia (568 millones de parametros, embeddings de 1.024 dimensiones) y el framework Sentence Transformers. Se uso AdamW con tasa de aprendizaje de 2e-5 y weight decay de 0,01. El preentrenamiento se ejecuto en la particion ACC de MareNostrum 5 (BSC) con 128 GPU NVIDIA H100 de 64 GB distribuidas en 32 nodos e interconexion InfiniBand de 800 Gb/s; el ajuste fino uso 4 GPU H100 en un solo nodo con NVLink.

## Capacidades

- Generacion de embeddings de frases y pasajes para similitud semantica y recuperacion densa.
- Recuperacion de informacion (information retrieval) en turco, con soporte secundario de ingles.
- Ranking de pasajes y reordenacion (reranking) por similitud coseno.
- Busqueda semantica en corpus legales turcos: jurisprudencia, doctrina y tesis academicas.
- Feature extraction: representaciones de 1.024 dimensiones utilizables como entrada de clasificadores y clusters.
- Soporte de textos largos de hasta 2.048 tokens, adecuado para pasajes juridicos extensos.
- Exportacion ONNX para inferencia optimizada y compatibilidad con Text Embeddings Inference (TEI).
- No es un modelo generativo: no soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Busqueda de jurisprudencia: indexar sentencias del Yargitay y del Danistay como embeddings y recuperar por similitud semantica los precedentes mas relevantes ante una consulta en lenguaje natural, aprovechando el preentrenamiento especifico sobre 3.430 millones de tokens de casacion.
- Asistentes legales de recuperacion aumentada (RAG): usar el modelo como recuperador en un pipeline RAG que alimente a un LLM generativo con fragmentos de legislacion y doctrina, reduciendo alucinaciones al anclar las respuestas en pasajes verificables.
- Busqueda semantica en repositorios academicos: indexar tesis de YOKTEZ y permitir consultas conceptuales en lugar de busqueda por palabras clave, gracias a los 9.610 millones de tokens de tesis vistos en preentrenamiento.
- Deduplicacion y agrupamiento de documentos legales: calcular embeddings de expedientes o contratos y aplicar clustering para detectar duplicados o agrupar casos por tematica.
- Sistemas de recomendacion de contenido juridico: emparejar consultas de usuarios con articulos de blog, guias o formularios mediante similitud coseno sobre embeddings de 1.024 dimensiones.
- Moderacion y clasificacion de textos turcos: usar los embeddings como caracteristicas de entrada para clasificadores de intencion, deteccion de tematica o filtrado de contenido en plataformas en turco.
- Busqueda bilingue turco-ingles: aunque el entrenamiento es predominantemente turco, el soporte declarado de ingles permite recuperacion cruzada en escenarios limitados.

## Benchmarks y rendimiento

El autor publica resultados sobre MTEB-Turkish (17 tareas en 5 tipos) y una puntuacion especifica del dominio legal. La tabla completa de comparacion con otros modelos aparece truncada en la documentacion disponible, por lo que solo se recogen las cifras agregadas del propio modelo.

| Metrica | Resultado |
|---|---|
| MTEB-Turkish (score global) | 56,87 |
| Legal Score | 46,56 |

No se han publicado en la informacion disponible resultados desglosados por tarea (clasificacion, clustering, pairing, retrieval, reranking) ni comparaciones numericas completas con modelos alternativos.

## Requisitos de hardware

- Inferencia en FP16: aproximadamente 0,8 GB de VRAM para los pesos (403 millones de parametros), mas memoria para activaciones y lote; en la practica, 2-4 GB de VRAM para lotes moderados con secuencias de hasta 2.048 tokens.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090.
- GPU de datacenter recomendadas para alto throughput: A100, H100, L40S y A10G.
- Despliegue: Text Embeddings Inference (TEI) esta soportado explicitamente; tambien es posible servir con sentence-transformers, FastAPI mas ONNX Runtime, o vLLM (soporte de modelos de embeddings limitado, verificar version).
- Exportacion ONNX incluida en el repositorio para inferencia en CPU con ONNX Runtime.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Cuantizacion: no se documentan variantes GGUF, AWQ ni GPTQ; para CPU conviene usar la ruta ONNX.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Notas |
|---|---|---|---|---|---|
| Mursit-Large-TR-Retrieval | 403M | 2.048 | 1.024 | Apache 2.0 | Preentrenado desde cero en turco; foco legal; MTEB-TR 56,87 |
| BGE-M3 | 568M | 8.192 | 1.024 | MIT | Multilingue, usado como modelo guia en el entrenamiento; cobertura amplia de idiomas |
| Modelos de embeddings turcos de la familia Mursit | no disponible | no disponible | no disponible | Apache 2.0 | Variantes del mismo autor; datos concretos no disponibles en la informacion |

La documentacion original incluye una comparacion grafica (Legal Score frente a MTEB Score) con otros modelos turcos, pero la tabla numerica completa no esta disponible en el material consultado. No se dispone de datos de benchmarks de alternativas como E5-multilingual o GTE-multilingual en esta ficha, por lo que no se ofrecen cifras comparativas que no esten verificadas.

## Limitaciones y advertencias

- Modelo exclusivamente de embeddings: no genera texto ni soporta razonamiento, tool calling o agentes.
- Cobertura linguistica limitada: entrenado sobre corpus predominantemente turco; el rendimiento en ingles es secundario y no esta cuantificado.
- Sesgos potenciales: el corpus incluye texto web (FineWeb2, CulturaX) y documentacion judicial, lo que puede introducir sesgos de dominio, estilo formal y desequilibrios en la representacion de colectivos.
- Riesgo de recuperacion sesgada: al priorizar el dominio legal, la similitud semantica en textos coloquiales o de otros dominios puede degradarse.
- Contexto de 2.048 tokens: documentos mas largos requieren troceado, con el consiguiente riesgo de perder contexto entre fragmentos.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los datasets de origen (MS MARCO-TR, EuroHPC-Legal) por si imponen restricciones adicionales.
- Repositorio espejo: la ficha consultada es un archivo de VeriPazari; para la version mantenida y actualizada debe acudirse al repositorio original de NewMindAI.
- Sin datos publicados de latencia, throughput ni comportamiento bajo cuantizacion agresiva; es necesario validar en el entorno de produccion propio.

## Enlaces

- Modelo en Hugging Face (espejo): https://huggingface.co/veripazari/Mursit-Large-TR-Retrieval
- Modelo original: https://huggingface.co/newmindai/Mursit-Large-TR-Retrieval
- Modelo base: https://huggingface.co/newmindai/Mursit-Large
- Repositorio GitHub: https://github.com/newmindai/mecellem-models
- Demo en Hugging Face Spaces (Mizan): https://huggingface.co/spaces/newmindai/Mizan
- Dataset MS MARCO-TR triplets: https://huggingface.co/datasets/newmindai/ms-marco-turkish-triplets
- Dataset EuroHPC-Legal: https://huggingface.co/datasets/newmindai/EuroHPC-Legal
- Paper de referencia (arXiv 2601.16018): https://arxiv.org/abs/2601.16018
- Paper de referencia (arXiv 2402.03216): https://arxiv.org/abs/2402.03216
- Plataforma VeriPazari: https://veripazari.com.tr
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
