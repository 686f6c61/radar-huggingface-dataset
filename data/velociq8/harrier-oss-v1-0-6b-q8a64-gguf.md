# VelociQ8/harrier-oss-v1-0.6b-Q8A64-GGUF

## Resumen

VelociQ8/harrier-oss-v1-0.6b-Q8A64-GGUF es la conversión al formato Q8A64 del modelo de embeddings `microsoft/harrier-oss-v1-0.6b`, publicada por VelociQ8. No es un modelo nuevo: es el mismo conjunto de pesos de Microsoft (620.823.680 parámetros, vectores de 1024 dimensiones) reempaquetado en el formato de pesos de 8 bits propietario de VelociQ8, pensado para ejecutar inferencia en CPU sobre Arm (aarch64) y x86-64 sin GPU. El problema que resuelve es el de servir un modelo de embeddings de calidad en infraestructura sin acelerador, con un runtime derivado de llama.cpp que aporta kernels propios para Q8A64.

La relevancia es doble. Por un lado, harrier-oss-v1 0.6B es un modelo de embeddings multilingüe e instruction-aware de Microsoft, con 32.768 tokens de contexto en el modelo original, utilizable en recuperación, clustering, similitud semántica, clasificación, minería de bitextos y reranking. Por otro, esta ficha documenta una dependencia crítica: los ficheros Q8A64 solo cargan en VelociQ8 1.1 o superior, y herramientas GGUF estándar como llama.cpp no pueden abrirlos. Los snippets automáticos de "Use this model" de Hugging Face para llama.cpp u Ollama no funcionan con este repositorio.

El resultado es un artefacto de despliegue, no un modelo entrenado: el autor declara explícitamente que no aporta mediciones propias de rendimiento, solo la verificación de que carga y se ejecuta. Quien busque cifras de benchmarks o garantías de calidad debe consultar el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only con arquitectura Qwen3, entrenado con la receta de embeddings multilingue e instruction-aware de Harrier (Microsoft) |
| Parametros totales | 620.823.680 (0,6B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el modelo original |
| Tipos de cuantizacion | Q8A64 (pesos de 8 bits con kernels propios de VelociQ8); no se ofrecen otros niveles en este repositorio |
| Idiomas soportados | Multilingue (la model card no detalla la lista concreta de idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF en variante Q8A64 (solo cargable con el runtime VelociQ8) |
| Dimension de los embeddings | 1024 |
| Tarea / pipeline | feature-extraction (sentence-similarity, retrieval, reranking, clasificacion, clustering, bitext mining) |
| Tamano del repositorio | 1,8 GB (incluye el fichero de pesos y los archivos del runtime) |
| Runtime requerido | VelociQ8 1.1 o superior (los archivos publicados son de la version 1.4) |
| Descargas / likes | 131 descargas, 1 like (en el momento de la consulta) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura transformer densa decoder-only de tipo Qwen3, reutilizada por Microsoft como columna vertebral para su familia Harrier OSS v1. La diferencia respecto a un modelo Qwen3-Embedding convencional está en el entrenamiento: Harrier aplica su propia receta de embeddings multilingüe e instruction-aware, no la receta original de Qwen3-Embedding. El modelo tiene 0,6B de parámetros y produce vectores de 1024 dimensiones, con una ventana de contexto de 32.768 tokens heredada del modelo original.

La particularidad funcional es el esquema asimétrico de instrucciones: las consultas (queries) llevan una instrucción de tarea de una sola frase, mientras que los documentos no llevan instrucción. Esto condiciona el pipeline de recuperación y debe replicarse exactamente en producción para no degradar la calidad. En cuanto a esta conversión concreta, no hay información sobre el proceso de cuantización más allá de la especificación del formato Q8A64, ni sobre datos de entrenamiento (número de tokens, composición del corpus, uso de RLHF/DPO) en la información disponible. El autor indica explícitamente que el artefacto no incluye mediciones propias y que solo se ha verificado que carga y se ejecuta.

## Capacidades

- Generación de embeddings de texto de 1024 dimensiones para recuperación densa (retrieval) y búsqueda semántica.
- Similitud semántica entre frases y detección de duplicados o paráfrasis.
- Clustering de documentos y agrupación temática sobre representaciones vectoriales.
- Clasificación de textos mediante embeddings como característica de entrada.
- Minería de bitextos (bitext mining) para la construcción de corpus paralelos.
- Reranking de resultados de búsqueda.
- Soporte multilingüe, según la etiqueta de idioma del modelo base.
- Manejo de entradas largas: hasta 32.768 tokens de contexto en el modelo original.
- Esquema instruction-aware: instrucción de una frase en la query, sin instrucción en los documentos.
- Compatibilidad con la API HTTP de llama.cpp heredada por el runtime, incluidos los endpoints compatibles con OpenAI.
- No es un modelo generativo: no produce texto libre, no soporta tool calling ni razonamiento multi-paso, ni dispone de visión o audio.

## Casos de uso

- Recuperación aumentada (RAG) en infraestructura sin GPU: indexación de documentación interna y consulta en servidores Arm (Graviton, Ampere Altra) usando Q8A64 sobre CPU, aprovechando los 32.768 tokens de contexto para fragmentos largos sin truncar agresivamente.
- Búsqueda semántica en catálogos y bases de conocimiento: se embeben los documentos sin instrucción y se embeberán las consultas con una instrucción de tarea de una frase, como exige la receta instruction-aware del modelo base.
- Deduplicación y clustering de artículos o tickets de soporte: el modelo vectoriza grandes volúmenes y permite agrupar por similitud sin coste de GPU, adecuado para trabajos batch nocturnos en CPU.
- Minería de bitextos para corpus multilingües: el modelo está etiquetado como multilingüe y la tarea figura entre las capacidades declaradas, lo que permite alinear oraciones entre idiomas para construir datasets de traducción.
- Reranking en dos etapas: recuperación con un índice vectorial y reordenación de los candidatos mediante similitud de embeddings, reduciendo falsos positivos en pipelines de búsqueda existentes.
- Clasificación de contenido y enrutado de peticiones: uso de los embeddings como entrada de un clasificador ligero (por ejemplo, detección de intención o moderación de categorías), con inferencia en el mismo servidor que el resto del servicio.
- Despliegue en el borde (edge) o en portátiles Windows x86-64: el runtime dispone de archivo para Windows y de imagen Docker, lo que permite prototipar en local antes de mover el servicio a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica literalmente que el modelo no aporta mediciones propias ("None of its own") y que únicamente se ha verificado que el fichero carga y se ejecuta. El repositorio no incluye cifras de MMLU, MTEB, BEIR ni latencias medidas.

## Requisitos de hardware

- Peso en disco: repositorio de 1,8 GB, que incluye los pesos Q8A64 junto con archivos del runtime; el peso de los parámetros a 8 bits ronda los 0,62 GB, así que el resto del tamaño corresponde a binarios y utilidades.
- Memoria: al ser pesos de 8 bits, la huella es muy inferior a 1 GB solo para el modelo; hay que sumar overhead del runtime y el coste de atender secuencias largas de hasta 32.768 tokens. No se dispone de cifras oficiales de memoria pico.
- Cabe en CPU de consumo: es el objetivo principal del formato. Plataformas soportadas: Arm de 64 bits con dotprod (Ampere Altra, AWS Graviton2 y posteriores, Neoverse N1 y posteriores), archivo `arm64-multi` para cualquier Arm de 64 bits, y x86-64 con AVX2 y FMA (Intel Haswell, AMD Zen y posteriores).
- GPU: no es necesaria. Existen archivos portables de Ollama con CUDA para NVIDIA Turing o posterior (GeForce RTX 20 en adelante), y las compilaciones x86-64 pueden usar GPU NVIDIA, AMD o Intel vía Vulkan; los demás archivos y la imagen Docker corren en CPU.
- Sistemas operativos: Linux (requiere glibc 2.28 o superior), Windows x86-64 (probado en Windows 11) e imagen Docker `ghcr.io/dhaern/velociq8` para Arm y x86-64.
- Opciones de despliegue: exclusivamente el runtime VelociQ8 (herramientas `llama-server`, `llama-cli`, `llama-embedding`, `llama-bench`, `llama-quantize`), o bien las distribuciones portables de Ollama 0.40.11 incluidas. vLLM, TGI, llama.cpp estándar y Ollama convencional no pueden cargar Q8A64.
- Latencia y throughput: no disponibles; el autor no publica mediciones de este fichero.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|---|
| VelociQ8/harrier-oss-v1-0.6b-Q8A64-GGUF (este) | 620.823.680 | 32.768 tokens (modelo original) | 1024 | MIT | GGUF Q8A64, solo VelociQ8 | Conversion 8-bit para CPU, sin benchmarks propios |
| microsoft/harrier-oss-v1-0.6b | 0,6B | 32.768 tokens | 1024 | MIT | safetensors, transformers | Modelo base original; ejecutable en GPU/CPU con el stack habitual |
| furiosa-ai/harrier-oss-v1-0.6b | 0,6B (hereda del base) | no disponible en la informacion | 1024 (heredado del base) | no disponible en la informacion | no disponible en la informacion | Variante del mismo modelo base publicada por FuriosaAI para su stack |
| Qwen3-Embedding-0.6B | 0,6B | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | safetensors | Citado solo como origen arquitectonico; Harrier usa su propia receta de entrenamiento, por lo que los resultados no son intercambiables |

## Limitaciones y advertencias

- Dependencia total del runtime: los ficheros Q8A64 no cargan en llama.cpp estándar, Ollama convencional, vLLM ni TGI. Los ejemplos automáticos de Hugging Face para llama.cpp y Ollama no funcionan.
- VelociQ8 es software propietario de uso gratuito construido sobre llama.cpp; la licencia MIT cubre los pesos, pero el runtime tiene sus propias condiciones de uso.
- El runtime no descarga modelos: hay que bajar el fichero del repositorio y pasarlo con `-m`.
- Ausencia de benchmarks propios: no hay evidencia publicada de que la cuantización Q8A64 preserve la calidad de recuperación del modelo base; conviene medir MTEB/BEIR en el dominio propio antes de producción.
- Naturaleza no generativa: no produce texto, no soporta tool calling, agentes ni razonamiento multi-paso. Cualquier expectativa de "LLM" sobre este repositorio es incorrecta.
- Sensibilidad al formato de instrucciones: mezclar el esquema (instrucción en la query, ninguna en el documento) degrada la similitud; es un error frecuente al integrar modelos instruction-aware.
- Idiomas: la etiqueta es "multilingual", pero no se detalla la lista de idiomas ni la cobertura real; un modelo de 0,6B suele tener menor calidad en lenguas de bajos recursos.
- Sesgos y alucinación: al ser un modelo de embeddings no "alucina" texto, pero sí puede heredar sesgos del corpus de entrenamiento del modelo base, reflejados en similitudes y agrupaciones; no hay documentación específica de sesgos en la información disponible.
- Fragmentación del ecosistema: al requerir un binario concreto, la portabilidad entre entornos (Kubernetes, serverless, servicios gestionados) es limitada y complica el mantenimiento a largo plazo.
- Requisito de plataforma: AVX2 y FMA en x86-64, dotprod en Arm para los kernels rápidos, y glibc 2.28 o superior en Linux.
- Popularidad muy baja (131 descargas, 1 like) y actualización reciente: sin historial de mantenimiento que garantice soporte continuado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/VelociQ8/harrier-oss-v1-0.6b-Q8A64-GGUF
- Modelo base: https://huggingface.co/microsoft/harrier-oss-v1-0.6b
- Runtime VelociQ8 (GitHub): https://github.com/dhaern/VelociQ8
- Releases del runtime: https://github.com/dhaern/VelociQ8/releases
- Documentacion de uso: https://github.com/dhaern/VelociQ8/blob/main/docs/usage.md
- Imagen Docker: https://github.com/dhaern/VelociQ8/pkgs/container/velociq8
- Variante de FuriosaAI del mismo modelo base: https://huggingface.co/furiosa-ai/harrier-oss-v1-0.6b
- Documentacion de Harrier OSS v1 en FuriosaAI: https://developer.furiosa.ai/latest/en/furiosa_llm/models/harrier-oss-v1.html
- Ficha de terceros con metadatos del modelo: https://free2aitools.com/model/velociq8/harrier-oss-v1-0.6b-q8a64-gguf
- Discusiones del repositorio: https://huggingface.co/VelociQ8/harrier-oss-v1-0.6b-Q8A64-GGUF/discussions
