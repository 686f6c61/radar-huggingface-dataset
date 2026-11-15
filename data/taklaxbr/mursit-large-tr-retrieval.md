# Taklaxbr/Mursit-Large-TR-Retrieval

## Resumen

Mursit-Large-TR-Retrieval es un modelo de embeddings de frases (sentence transformer) de 403 millones de parametros, basado en la arquitectura ModernBERT-large, disenado especificamente para recuperacion de informacion (retrieval) en turco, con especial enfasis en el dominio juridico. Lo desarrolla el equipo newmindai y esta preentrenado desde cero sobre un corpus de aproximadamente 112,7 mil millones de tokens de fuentes mayoritariamente turcas, incluyendo jurisprudencia del Tribunal de Casacion (Yargitay), del Consejo de Estado (Danistay), tesis academicas del repositorio YOKTEZ y datos web generales (FineWeb2, CulturaX).

El modelo resuelve el problema de la busqueda semantica densa en turco, un idioma con menor cobertura en modelos de embeddings de proposito general, y lo hace con un tokenizador propio entrenado sobre documentos juridicos. Produce vectores de 1.024 dimensiones con una longitud maxima de secuencia de 2.048 tokens, lo que permite indexar fragmentos de sentencias y resoluciones de longitud considerable sin truncar.

Su relevancia actual radica en que combina un preentrenamiento masivo en un supercomputador (MareNostrum 5, 128 GPU H100) con un ajuste fino contrastivo sobre MS MARCO-TR, y se publica bajo licencia Apache 2.0, lo que facilita su adopcion tanto en investigacion como en productos comerciales de busqueda juridica en turco. El repositorio consultado es un archivo de la version original mantenida por newmindai, redistribuida por VeriPazari.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (transformer encoder con atencion local/global alternada) |
| Parametros totales | 403.629.056 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (el repo incluye pesos safetensors y ONNX; no se detallan variantes cuantizadas) |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |
| Dimension de embedding | 1.024 |
| Capas | 28 |
| Hidden size | 1.024 |
| Tamano FFN | 2.624 |
| Cabezas de atencion | 16 (64 dimensiones por cabeza) |
| Ventana de atencion local | 128 |
| Vocabulario | 59.008 tokens |
| Modelo base | newmindai/Mursit-Large |
| Libreria | sentence-transformers |
| Pipeline | sentence-similarity / feature-extraction |

## Arquitectura y entrenamiento

La arquitectura es ModernBERT-large: un encoder transformer de 28 capas con atencion alternada entre capas locales (ventana deslizante de 128 tokens) y globales, normalizacion previa a cada capa con RMSNorm, activacion GeGLU en las capas MLP y embeddings posicionales rotatorios (RoPE) con theta de 20.000. Esta combinacion reduce el coste computacional en secuencias largas frente a un transformer clasico con atencion completa, manteniendo la calidad de representacion.

El preentrenamiento se realizo desde cero con modelado de lenguaje enmascarado (MLM) al 15%, con estrategia 80-10-10, sobre unos 112,7 mil millones de tokens. El corpus juridico incluye 10,3 millones de secuencias del Yargitay (~3,43 mil millones de tokens), 151 mil del Danistay (~0,11 mil millones) y 21,1 millones de tesis del YOKTEZ (~9,61 mil millones tras procesamiento OCR). Los datos generales en turco suman 212 millones de secuencias (~96,17 mil millones de tokens) procedentes de FineWeb2 y CulturaX, con deduplicacion semantica mediante SemHash y filtrado de calidad FineWeb. El entrenamiento uso MosaicML Composer con el optimizador Decoupled StableAdamW, tasa de aprendizaje de 8e-4 con schedule warmup-stable-decay y precision mixta BF16, distribuido en 32 nodos con 128 GPU H100 de 64 GB e interconexion InfiniBand de 800 Gb/s.

El ajuste fino para embeddings se hizo con aprendizaje contrastivo sobre MS MARCO-TR (920.106 tripletas), usando la funcion de perdida CachedGISTEmbedLoss con BGE-M3 como modelo guia (568M parametros, embeddings de 1.024 dimensiones), con Sentence Transformers, AdamW (lr 2e-5, weight decay 0,01) y 4 GPU H100 en un solo nodo.

## Capacidades

- Generacion de embeddings de frases y pasajes para similitud semantica y recuperacion densa (dense retrieval).
- Recuperacion de informacion en turco con enfasis en dominio juridico: sentencias, resoluciones y textos normativos.
- Soporte bilingue turco-ingles, aunque el entrenamiento esta dominado por turco.
- Extraccion de caracteristicas (feature-extraction) para tareas posteriores de clasificacion o clustering sobre representaciones.
- Indexacion de fragmentos largos gracias a su ventana de 2.048 tokens.
- Compatible con Text Embeddings Inference (TEI) y con endpoints compatibles, segun los tags del repositorio.
- No dispone de tool calling, capacidades de agente, vision ni audio: es un modelo exclusivamente de representacion, no generativo.

## Casos de uso

- Busqueda semantica en jurisprudencia turca: indexar sentencias del Yargitay y del Danistay como vectores de 1.024 dimensiones y recuperar por similitud coseno los precedentes mas relevantes para una consulta en lenguaje natural; su entrenamiento especifico en ese corpus lo hace adecuado frente a embeddings genericos.
- Asistentes de consulta legal: dado que el modelo representa consultas y pasajes en el mismo espacio, puede alimentar un pipeline RAG que recupere articulos y resoluciones antes de pasarlos a un LLM generador, reduciendo alucinaciones al fundamentar la respuesta en textos reales.
- Deduplicacion y agrupamiento de documentos juridicos: usar los embeddings para clustering de resoluciones similares o para detectar near-duplicates en un archivo judicial, aprovechando la ventana de 2.048 tokens para capturar el contexto de cada documento.
- Busqueda interna en despachos y departamentos juridicos: montar un motor de busqueda sobre contratos, dictamenes y expedientes en turco, con reordenacion por similitud semantica en lugar de coincidencia exacta de palabras clave.
- Filtrado y enrutamiento de tickets o consultas: clasificar consultas entrantes en turco por similitud con prototipos de categorias (laboral, penal, administrativo) usando los embeddings como caracteristicas de un clasificador ligero.
- Recuperacion bilingue turco-ingles: para equipos que trabajan con documentacion en ambos idiomas, el modelo puede alinear consultas en ingles con pasajes en turco dentro de un rango razonable, aunque su rendimiento principal es en turco.
- Indexacion a escala con TEI: desplegar el modelo con Text Embeddings Inference para generar embeddings de grandes volumenes de documentos con throughput alto en GPU, gracias a su tamano moderado (403M) y a la disponibilidad de pesos ONNX.

## Benchmarks y rendimiento

Segun la model card, el modelo obtiene 56,87 de MTEB Score y 46,56 de Legal Score en el benchmark MTEB-Turkish (17 tareas en 5 tipos de tarea). La informacion proporcionada incluye el inicio de una tabla comparativa, pero esta truncada, por lo que no es posible reproducir los resultados desglosados por tarea ni las cifras de los modelos comparados.

| Metrica | Resultado |
|---|---|
| MTEB Score (MTEB-Turkish) | 56,87 |
| Legal Score | 46,56 |
| Cls. / Clus. / Pair... (desglose) | no disponible (tabla truncada en la informacion) |

No se han publicado en la informacion disponible resultados desglosados de MMLU, HumanEval, GSM8K ni de tareas de generacion, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 0,8-1 GB solo para pesos (403M parametros), mas overhead de activaciones; en la practica cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- En cuantizacion INT8 el peso baja a unos 0,4 GB; no se documentan variantes GGUF ni cuantizaciones oficiales en la informacion disponible.
- GPU recomendadas para produccion: A100, H100 o L40S para alto throughput con TEI; RTX 4090 y RTX 3090 son suficientes para cargas medias.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (RTX 3060 en adelante) e incluso en CPU para volumenes moderados.
- Opciones de despliegue: sentence-transformers, Text Embeddings Inference (TEI), ONNX Runtime (hay pesos ONNX en el repo), y servidores compatibles con endpoints de embeddings.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Enfoque |
|---|---|---|---|---|---|
| Mursit-Large-TR-Retrieval | 403M | 2.048 | 1.024 | Apache 2.0 | Turco juridico, retrieval |
| BGE-M3 (usado como guia en el entrenamiento) | 568M | no disponible en la informacion | 1.024 | no disponible en la informacion | Multilingue, retrieval |
| Modelos MLM turcos comparados en la model card | no disponible | no disponible | no disponible | no disponible | MLM general |

La model card menciona una comparacion grafica frente a otros modelos turcos (embedding y MLM) en MTEB-Turkish, pero la tabla detallada esta truncada en la informacion disponible, por lo que no se pueden extraer cifras de los competidores.

## Limitaciones y advertencias

- Modelo exclusivamente de embeddings: no genera texto, no razona de forma explicita ni soporta tool calling; no debe usarse como LLM.
- El rendimiento fuera del turco es limitado: aunque declara soporte de ingles, el preentrenamiento es turco-dominante y no se aportan metricas en ingles.
- Sesgos potenciales derivados del corpus: la sobrerrepresentacion de textos juridicos oficiales y de datos web puede introducir sesgos de dominio y de registro; no se documenta una evaluacion de sesgos.
- Riesgo de falsos positivos en similitud: como todo modelo denso, puede recuperar pasajes semanticamente proximos pero juridicamente irrelevantes; conviene combinarlo con un reranker.
- La ventana de 2.048 tokens obliga a trocear documentos mas largos, lo que puede fragmentar el contexto de una resolucion.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar las condiciones de los datasets de origen (Yargitay, Danistay, YOKTEZ, FineWeb2, CulturaX) si se redistribuyen datos derivados.
- El repositorio consultado es un archivo redistribuido por un tercero (VeriPazari) de la version original de newmindai; para produccion conviene usar el repositorio oficial.
- No se documentan tasas de alucinacion porque el modelo no genera texto; el riesgo relevante es la recuperacion de pasajes irrelevantes.

## Enlaces

- Repositorio consultado: https://huggingface.co/Taklaxbr/Mursit-Large-TR-Retrieval
- Repositorio original: https://huggingface.co/newmindai/Mursit-Large-TR-Retrieval
- Modelo base: https://huggingface.co/newmindai/Mursit-Large
- Repositorio GitHub de modelos Mecellem: https://github.com/newmindai/mecellem-models
- Demo en Hugging Face Space (Mizan): https://huggingface.co/spaces/newmindai/Mizan
- Plataforma VeriPazari: https://veripazari.com.tr
- Dataset MS MARCO-TR triplets: https://huggingface.co/datasets/newmindai/ms-marco-turkish-triplets
- Dataset EuroHPC-Legal: https://huggingface.co/datasets/newmindai/EuroHPC-Legal
- Paper referenciado (arXiv 2601.16018): https://arxiv.org/abs/2601.16018
- Paper ModernBERT (arXiv 2402.03216): https://arxiv.org/abs/2402.03216
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
