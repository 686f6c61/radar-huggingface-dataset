# unfold-labs/unfold-search-embedder

## Resumen

Unfold search embedder es un modelo de embeddings de texto derivado de `intfloat/multilingual-e5-small`, publicado por unfold-labs para su uso como motor de busqueda semantica dentro de la aplicacion Unfold Note. Convierte extractos de notas y preguntas en vectores de 384 dimensiones (mean pooling, normalizados en L2), aplicando los prefijos `query: ` y `passage: ` segun el tipo de entrada. El modelo se ejecuta en local, sobre CPU, mediante ONNX Runtime, sin necesidad de conexion a servicios externos.

La relevancia del modelo no reside en una innovacion arquitectonica propia, sino en su empaquetado orientado a despliegue en dispositivo: cuantizacion INT8 dinamica por canal, vocabulario podado a frances e ingles con remapeo de identificadores del tokenizador y un conjunto de compuertas de calidad publicadas (hits@8 y latencias) medidas con el codigo de busqueda real de la aplicacion. El objetivo declarado es mejorar la busqueda por significado sobre bovedas de notas Obsidian frente a la busqueda por palabra clave.

El modelo base, `multilingual-e5-small`, es un transformer encoder de tipo MiniLM inicializado desde `microsoft/Multilingual-MiniLM-L12-H384`, con 384 dimensiones de embedding y una longitud maxima de 512 tokens. La ficha no proporciona el numero exacto de parametros del checkpoint, aunque por su origen (MiniLM-L12) se situa en el rango de decenas de millones; este dato debe tratarse como no confirmado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (familia E5, inicializado desde microsoft/Multilingual-MiniLM-L12-H384) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (max_len) |
| Tipos de cuantizacion | INT8 (onnxruntime dynamic, per channel); se distribuye `model.int8.onnx` |
| Idiomas soportados | frances (fr) e ingles (en); vocabulario podado a `fren` |
| Licencia | MIT (redistribucion del modelo base bajo su misma licencia) |
| Formato de pesos | ONNX (`model.int8.onnx`) |
| Dimension de embedding | 384 |
| Pooling | Mean pooling con normalizacion L2 |
| Prefijos de entrada | `query: ` para preguntas, `passage: ` para extractos |
| Tamano del repositorio | 0,1 GB |
| Libreria | onnxruntime |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia E5, reentrenado por sus autores originales a partir de `microsoft/Multilingual-MiniLM-L12-H384`. El entrenamiento del modelo base consta de dos etapas: una preetrenamiento contrastivo con supervision debil sobre datos multilingues (mC4 filtrado, CC News, NLLB, Wikipedia, Reddit filtrado, S2ORC, Stackexchange, xP3 y datos SBERT no supervisados) y un ajuste fino supervisado sobre un conjunto de tareas de recuperacion y NLI (MS MARCO, NQ, TriviaQA, NLI de SimCSE, ELI5, DuReader Retrieval, KILT Fever, KILT HotpotQA, SQuAD, Quora, Mr. TyDi y MIRACL). Los detalles completos se recogen en el articulo arXiv:2402.05672.

La contribucion propia de unfold-labs es de empaquetado y optimizacion, no de entrenamiento: cuantizacion INT8 dinamica por canal, poda del vocabulario a frances e ingles con rebanado de las filas de embedding y remapeo de los identificadores del tokenizador, y exportacion a ONNX para inferencia en CPU. No se documenta ningun ajuste fino adicional sobre notas o dominios especificos, ni el uso de RLHF o DPO (no aplicables a un modelo de embeddings). El repositorio incluye `embedder-model.json`, que lista cada fichero con su tamano y sha256 para verificacion de integridad tras la descarga.

## Capacidades

- Generacion de embeddings de texto de 384 dimensiones para busqueda semantica y recuperacion densa.
- Recuperacion multilingue limitada a frances e ingles (vocabulario podado a esos dos idiomas).
- Codificacion asimetrica mediante prefijos: `query: ` para la consulta y `passage: ` para el documento.
- Similitud coseno directa gracias a la normalizacion L2 de la salida.
- Ejecucion en CPU con ONNX Runtime, sin GPU ni servicios externos.
- Integracion en pipelines de busqueda hibrida combinada con busqueda por palabra clave (los datos de las compuertas incluyen ambos modos).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio: es un modelo exclusivamente de extraccion de caracteristicas.

## Casos de uso

- Busqueda semantica local en Obsidian: el modelo indexa extractos de notas como `passage: ` y codifica la consulta del usuario como `query: `, permitiendo recuperar notas relacionadas por significado aunque no compartan palabras clave. Su ejecucion en CPU y su tamano reducido lo hacen adecuado para un plugin de escritorio.
- Busqueda hibrida palabra mas densa: combinado con un indice invertido, mejora el hits@8 de la busqueda por palabra sola (0,85 a 0,95 en el conjunto sintetico; 0,769 a 0,865 en la boveda real del autor), por lo que encaja como capa de reranking o de recuperacion complementaria.
- Asistente de chat sobre notas personales: al ejecutarse en dispositivo, permite que una funcion de chat recupere contexto del vault sin enviar el contenido de las notas a un servidor, lo que reduce la exposicion de datos privados.
- Clasificacion y agrupamiento de notas: los embeddings normalizados sirven para detectar notas duplicadas, agrupar por tematica o construir mapas de similitud dentro de una boveda.
- Deduplicacion y enlazado automatico de notas: calcular la similitud coseno entre pares de extractos permite sugerir enlaces internos o fusionar contenido redundante.
- Busqueda en aplicaciones de escritorio con requisitos de latencia estrictos: las compuertas publicadas reportan una mediana de 18 ms (p50) y 23 ms (p95) en el conjunto sintetico, y 25 ms (p50) y 29 ms (p95) en la boveda real, para la busqueda combinada palabra mas densa, dentro del umbral de 300 ms por peticion.
- Filtrado y recuperacion en pipelines de RAG de pequena escala en frances o ingles: util como recuperador inicial cuando el corpus es moderado y se prioriza el despliegue sin GPU.

## Benchmarks y rendimiento

Los unicos datos publicados son las compuertas de calidad del autor, medidas con el codigo de busqueda de la aplicacion sobre un conjunto sintetico de 60 notas y 40 preguntas en frances e ingles, y sobre la boveda real del propietario (solo puntuaciones, sin contenido de las notas).

| Compuerta | Metrica | Valor | Resultado |
|---|---|---|---|
| hits8_vs_word_synthetic | hits@8 frente a busqueda por palabra sola (conjunto sintetico) | palabra 0,85; e5 0,95; delta 0,1; IC95 [0,025; 0,2] | pasa |
| hits8_vs_word_real | hits@8 frente a busqueda por palabra sola (conjunto real) | palabra 0,769; e5 0,865; delta 0,096; IC95 [0,019; 0,173] | pasa |
| search_latency_median | mediana de busqueda local por peticion (palabra mas densa), umbral 300 ms | sintetico p50 18 ms, p95 23 ms; real p50 25 ms, p95 29 ms; planificador real con 4 peticiones p50 63 ms | pasa |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MTEB u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta pensado para ejecutarse en CPU con ONNX Runtime. El repositorio ocupa 0,1 GB.
- GPU recomendadas: no se documentan; el modelo no requiere GPU. Cualquier GPU compatible con onnxruntime podria acelerar la inferencia, pero no es un requisito ni se publican datos al respecto.
- Cabe en GPU de consumo: si, en la practica cualquier GPU moderna, aunque el escenario objetivo es CPU.
- Opciones de despliegue: onnxruntime (CPU), con el fichero `model.int8.onnx`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para un modelo de embeddings de este tipo.
- Latencia y throughput: mediana de 18 a 25 ms por peticion de busqueda combinada y p95 de 23 a 29 ms en las pruebas del autor; con cuatro peticiones concurrentes en el planificador real, mediana de 63 ms. No se publica throughput en peticiones por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| unfold-labs/unfold-search-embedder | no disponible | 512 | 384 | fr, en | MIT | ONNX INT8 |
| intfloat/multilingual-e5-small (base) | no disponible | 512 | 384 | multilingue | MIT | safetensors, ONNX |
| intfloat/multilingual-e5-base | no disponible | 512 | 768 | multilingue | MIT | safetensors, ONNX |
| microsoft/Multilingual-MiniLM-L12-H384 | no disponible | 512 | 384 | multilingue | MIT | safetensors |

La comparativa se limita a los modelos de la misma familia y linaje, ya que la informacion disponible no incluye datos de rendimiento de terceros. Frente a su modelo base, este checkpoint reduce el vocabulario a frances e ingles y aplica cuantizacion INT8, lo que disminuye el tamano y el coste de inferencia en CPU a cambio de perder cobertura de otros idiomas. Frente a `multilingual-e5-base`, ofrece la mitad de dimension de embedding y presumiblemente menor coste computacional, aunque no se publican comparaciones directas de calidad.

## Limitaciones y advertencias

- Cobertura idiomatica restringida: el vocabulario esta podado a frances e ingles; el texto en otros idiomas no se representara correctamente.
- Sesgos heredados del modelo base: los datos de entrenamiento (mC4, Reddit, Stackexchange, entre otros) pueden introducir sesgos sociales, culturales y de dominio que no se han evaluado en esta ficha.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero la recuperacion densa puede devolver pasajes semanticamente proximos pero irrelevantes; las compuertas publicadas miden hits@8, no precision exhaustiva.
- Evaluacion limitada: las compuertas se basan en 60 notas sinteticas y 40 preguntas, mas una boveda real no publicada; la generalizacion a otros dominios o volumenes de corpus no esta demostrada.
- Sin datos de parametros ni de rendimiento en benchmarks estandar: no es posible comparar su calidad con alternativas fuera del conjunto de pruebas del autor.
- Licencia MIT: permite uso comercial y modificacion, con la obligacion de conservar el aviso de copyright; el modelo base se redistribuye bajo su propia licencia MIT.
- Dependencia de la aplicacion: algunos metadatos (version minima de la app 2.8.0, verificacion de integridad) estan orientados al cliente Unfold Note y no a un uso generico.
- Fecha de publicacion futura en los metadatos (2026-10-30): conviene verificar la vigencia y el estado del repositorio antes de adoptarlo en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/unfold-labs/unfold-search-embedder
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Commit del modelo base citado: `614241f622f53c4eeff9890bdc4f31cfecc418b3`
- Articulo del modelo base (arXiv:2402.05672): https://arxiv.org/pdf/2402.05672
- Modelo de inicializacion: https://huggingface.co/microsoft/Multilingual-MiniLM-L12-H384
- Web de Unfold: https://unfold.com/
- Unfold Pro: https://unfold.com/pro
