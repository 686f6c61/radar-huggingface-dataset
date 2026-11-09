# tardellirs/colibri-embed-ptbr-GGUF

## Resumen

Colibri-embed-ptbr-GGUF es la distribucion en formato GGUF del modelo de embeddings `tardellirs/colibri-embed-ptbr`, un encoder de aproximadamente 155 millones de parametros especializado en portugues de Brasil. Lo publica el usuario tardellirs y esta pensado para su uso con llama.cpp (`llama-server`, `llama-embedding`) y los runtimes construidos sobre el, lo que permite generar embeddings de 768 dimensiones sin depender de PyTorch ni de la pila de SentenceTransformers.

El modelo resuelve el problema de la busqueda semantica y el retrieval en portugues brasileño con un coste de infraestructura muy bajo: el archivo Q8_0 ocupa 169 MB y consume unos 229 MB de RAM en pico, con una latencia p50 de 35 ms por frase en una CPU de 4 vCPU. La ficha del autor reporta una similitud coseno media de 0.9996 frente al modelo original en fp32, lo que lo hace practicamente indistinguible para tareas de produccion.

La relevancia actual del modelo esta en que empaqueta las dos capas densas de proyeccion del pipeline de SentenceTransformers dentro del propio archivo GGUF y conserva el vocabulario BPE de 64k tokens del modelo original, de modo que los ids de token coinciden exactamente con los de Hugging Face. Esto elimina una de las fricciones habituales al portar modelos de embeddings a llama.cpp. La licencia es Gemma, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo SentenceTransformer con dos capas densas de proyeccion (segun la model card del autor) |
| Parametros totales | 155.407.104 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (valor usado en el ejemplo de despliegue del autor) |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Portugues (pt, pt-BR) |
| Licencia | gemma |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La model card del autor no detalla la arquitectura interna ni el proceso de entrenamiento del modelo original. La informacion disponible indica que se trata de un modelo de embeddings de tipo SentenceTransformer con dos capas densas de proyeccion en la salida, un vocabulario BPE de 64.000 tokens y una dimension de embedding de 768. El modelo base es `tardellirs/colibri-embed-ptbr`, del que esta version es una cuantizacion.

La innovacion tecnica documentada esta en el proceso de conversion a GGUF. El autor aplico dos correcciones al tokenizer antes de convertir: elimino 6.246 tokens añadidos sin uso (`<unused0…>`, `<image_soft_token>`, etc.) con ids por encima de la matriz de embeddings de 64.000 filas, y registro el hash del pre-tokenizer recortado como pre-tokenizer de Gemma en llama.cpp, ya que el recorte alteraba el hash que llama.cpp usa para reconocer el tokenizer. La conversion se hizo con `convert_hf_to_gguf.py --sentence-transformers-dense-modules` seguido de `llama-quantize`. Segun el autor, ningun token de texto tokeniza de forma distinta tras el recorte.

## Capacidades

- Generacion de embeddings de texto de 768 dimensiones, normalizados L2 (el producto escalar equivale a la similitud coseno).
- Similitud semantica entre frases y recuperacion de informacion (retrieval) en portugues de Brasil.
- Soporte de prompts de tarea al estilo EmbeddingGemma (`task: search result | query: ...`, `title: none | text: ...`); llama.cpp no los añade automaticamente, hay que incluirlos manualmente. El resto de prompts (clasificacion, clustering, similitud) estan en el `config_sentence_transformers.json` del modelo original.
- Compatibilidad con la API `/v1/embeddings` de `llama-server`, con endpoints compatibles con OpenAI.
- Pooling configurable en el servidor (el ejemplo del autor usa `--pooling mean`).
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni agentes: es exclusivamente un modelo de embeddings.

## Casos de uso

- Busqueda semantica en corpus en portugues de Brasil: indexar documentos con embeddings de 768 dimensiones y recuperar por similitud coseno; el modelo cabe en 229 MB de RAM, lo que permite desplegarlo en el mismo nodo que el indice vectorial.
- RAG sobre documentacion legal o fiscal brasileña: el ejemplo del autor usa consultas como la declaracion de impuestos de alquiler, un dominio donde el vocabulario portugues especifico penaliza a los modelos multilingues genericos.
- Deduplicacion y clustering de articulos o tickets de soporte en portugues: el prompt de clustering del modelo original permite agrupar textos por similitud semantica sin coste de GPU.
- Motores de recomendacion de contenido textual: calcular similitud entre descripciones de productos o noticias con 31-38 frases por segundo en 4 vCPU, suficiente para reindexaciones incrementales.
- Filtrado y moderacion semantica: comparar mensajes entrantes contra un conjunto de referencias etiquetadas usando la similitud coseno, con latencia p50 de 35 ms por frase.
- Despliegue en entornos sin GPU o con recursos muy limitados: al ejecutarse en llama.cpp sobre CPU, encaja en contenedores pequenos, dispositivos edge o funciones serverless con poca memoria.
- Clasificacion de texto por similitud con prototipos: usar el prompt de clasificacion del modelo original y asignar la clase del prototipo mas cercano, sin entrenar un clasificador adicional.

## Benchmarks y rendimiento

El autor publica mediciones de calidad de cuantizacion (similitud coseno frente al modelo HF en fp32 sobre 30 frases en portugues de Brasil) y de rendimiento en una instancia Verda `CPU.4V.16G` (4 vCPU AMD EPYC, 16 GB), con llama.cpp `a4d4f2f` y `llama-server` a 4 hilos.

| Archivo | Tamano | RAM pico | Latencia p50 | Throughput | Coseno vs HF fp32 (media / min) |
|---|---:|---:|---:|---:|---:|
| `colibri-embed-ptbr-f16.gguf` | 315 MB | 367 MB | 36 ms | 32 sent/s | 1.0000 / 1.0000 |
| `colibri-embed-ptbr-Q8_0.gguf` | 169 MB | 229 MB | 35 ms | 31 sent/s | 0.9996 / 0.9995 |
| `colibri-embed-ptbr-Q6_K.gguf` | 137 MB | 199 MB | 42 ms | 33 sent/s | 0.9978 / 0.9958 |
| `colibri-embed-ptbr-Q5_K_M.gguf` | 122 MB | 185 MB | 39 ms | 31 sent/s | 0.9950 / 0.9930 |
| `colibri-embed-ptbr-Q4_K_M.gguf` | 111 MB | 217 MB | 31 ms | 38 sent/s | 0.9857 / 0.9802 |

No se han publicado resultados de benchmarks estandar (MMLU, MTEB, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica en el caso documentado; el modelo se ejecuta en CPU. En GPU, el archivo Q8_0 de 169 MB ocupa una fraccion minima de memoria, aunque el autor no publica mediciones en GPU.
- RAM: 367 MB en pico con f16, 229 MB con Q8_0, 199 MB con Q6_K, 185 MB con Q5_K_M y 217 MB con Q4_K_M (medido con `llama-server` a 4 hilos).
- GPU recomendadas: no disponibles. Por tamano, cualquier GPU consumer con al menos 1 GB de memoria libre puede alojar el modelo, pero no hay datos de rendimiento en GPU.
- Cabe en cualquier GPU consumer y en CPUs de 4 vCPU; el caso medido usa una instancia de 16 GB de RAM total.
- Opciones de despliegue: `llama-server` y `llama-embedding` de llama.cpp, con la API `/v1/embeddings`; tambien los runtimes construidos sobre llama.cpp. No se documenta soporte de vLLM, TGI ni Ollama.
- Latencia y throughput: 35 ms p50 por frase y 31 frases/s con Q8_0 en 4 vCPU AMD EPYC, enviando 512 frases en lotes de 32. Q4_K_M alcanza 38 frases/s y Q6_K 33 frases/s en la misma configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---:|---|---|---|---|---|
| Colibri-embed-ptbr-GGUF (este) | 155,4 M | 2048 | pt-BR | gemma | GGUF | Coseno 0.9996 vs HF fp32 en Q8_0; 229 MB RAM pico |
| tardellirs/colibri-embed-ptbr (base) | 155,4 M | no disponible | pt-BR | gemma | safetensors (presumiblemente) | Modelo original en PyTorch; referencia de calidad fp32 |
| EmbeddingGemma | no disponible | no disponible | multilingue | gemma | no disponible | El autor menciona que los prompts del modelo siguen el estilo de EmbeddingGemma; no hay datos de rendimiento comparativo en la informacion disponible |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo exclusivamente de embeddings: no genera texto ni soporta razonamiento, codigo, tool calling o agentes.
- Idioma limitado al portugues de Brasil; el rendimiento en otras variantes del portugues o en otros idiomas no esta documentado.
- Contexto de 2048 tokens segun el ejemplo de despliegue del autor; textos mas largos requieren troceado previo.
- El prompt de tarea debe añadirse manualmente en llama.cpp; omitirlo puede degradar la calidad del retrieval respecto al modelo original.
- La cuantizacion Q4_K_M pierde mas calidad (coseno minimo 0.9802) y ademas consume mas RAM que Q5_K_M; el autor recomienda Q8_0.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de la licencia Gemma, que impone restricciones y obligaciones de atribucion; conviene revisarla antes de un despliegue en produccion.
- Las mediciones de calidad se basan en solo 30 frases en portugues de Brasil, una muestra reducida que no cubre todos los dominios.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al ser un modelo de embeddings, el riesgo se traslada a la recuperacion de documentos irrelevantes o sesgados, no a la generacion de texto.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tardellirs/colibri-embed-ptbr-GGUF
- Modelo base: https://huggingface.co/tardellirs/colibri-embed-ptbr
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Herramienta de recorte de vocabulario del autor: https://github.com/tardellirs/embedding-vocab-trimmer
- Proveedor de la instancia de medicion: https://verda.com/?utm_content=mteb-pt
