# VelociQ8/multilingual-e5-large-instruct-Q8A64-GGUF

## Resumen

`VelociQ8/multilingual-e5-large-instruct-Q8A64-GGUF` es la conversión al formato Q8A64 (pesos de 8 bits del runtime VelociQ8) del modelo de embeddings `intfloat/multilingual-e5-large-instruct`, desarrollado originalmente por intfloat (Liang Wang et al., Microsoft). No es un modelo generativo: es un encoder de texto que transforma frases y documentos en vectores de 1024 dimensiones para búsqueda semántica, recuperación de información (RAG), similitud de frases y clustering. Su interés está en el multilingüismo (la model card declara 100 idiomas) y en que las consultas admiten una instrucción de tarea en una frase, mientras que los documentos se codifican sin instrucción.

El repositorio lo publica VelociQ8, un proyecto de inferencia en CPU para Arm y x86 construido sobre llama.cpp. La particularidad crítica es que el archivo solo carga en el runtime VelociQ8 1.1 o superior: los ficheros Q8A64 no son compatibles con llama.cpp estándar, Ollama estándar, vLLM, TGI ni text-embeddings-inference, y los fragmentos de "Use this model" que muestra Hugging Face no funcionan.

Con 24 capas y un contexto de 512 tokens, está pensado para desplegar un servicio de embeddings en servidores sin GPU (Graviton, Ampere Altra, x86 con AVX2), en entornos air-gapped o en nodos de borde donde no se quiere depender de una API externa. Su licencia de pesos es MIT, aunque el runtime es software propietario de uso gratuito.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder denso (modelo de embeddings de texto); 24 capas; vectores de 1024 dimensiones |
| Parámetros totales | 833.662.688 según los metadatos de safetensors del repositorio; la model card indica "unos 560 M", discrepancia no resuelta |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 512 tokens; los textos más largos se truncan |
| Tipos de cuantización | Q8A64 (8 bits, formato de pesos propietario de VelociQ8). No hay otras cuantizaciones en este repositorio |
| Idiomas soportados | Multilingüe; la model card declara 100 idiomas |
| Licencia | MIT (pesos). El runtime VelociQ8 es propietario de uso gratuito, con licencia distinta |
| Formato de pesos | GGUF con esquema Q8A64; solo cargable por VelociQ8 1.1 o superior |
| Pipeline | feature-extraction |
| Dimensión del embedding | 1024 |
| Tamaño del repositorio | 2,3 GB (incluye archivos del runtime además de los pesos) |
| Runtime requerido | VelociQ8 1.1+ (archivos publicados: 1.4) |
| Descargas / likes | 132 / 0 (a fecha de la información disponible) |

## Arquitectura y entrenamiento

La model card de este repositorio no describe el entrenamiento: se limita a indicar que es una conversión de `intfloat/multilingual-e5-large-instruct` y que "no tiene mediciones propias", solo la verificación de que carga y se ejecuta. El modelo base es un encoder transformer denso de 24 capas que produce vectores de 1024 dimensiones; la familia multilingual-e5 se inicializa a partir de XLM-RoBERTa-large según el artículo arXiv:2402.05672, y la variante `-instruct` sigue el enfoque de instrucciones en lenguaje natural descrito en arXiv:2401.00368 (pares de entrenamiento generados de forma sintética y ajuste contrastivo con instrucciones de tarea). Cualquier detalle adicional sobre número de tokens, composición del corpus o uso de RLHF/DPO debe consultarse en esos artículos y en la card del modelo original, no en esta.

La innovación técnica relevante de esta ficha no está en el modelo, sino en el formato: Q8A64 empaqueta los pesos en 8 bits con kernels optimizados para CPU en Arm (dotprod, Neoverse N1 y posteriores, Graviton2 y posteriores, Ampere Altra) y x86-64 con AVX2 y FMA (Haswell, Zen y posteriores). El runtime, derivado de llama.cpp, expone `llama-server`, `llama-cli`, `llama-embedding`, `llama-bench` y `llama-quantize` con la misma API HTTP, incluidos los endpoints compatibles con OpenAI. El pipeline de instrucciones es asimétrico: la consulta lleva una instrucción de una frase y el documento no lleva ninguna.

## Capacidades

- Generación de embeddings de texto de 1024 dimensiones para similitud semántica y recuperación densa.
- Codificación multilingüe: la model card declara 100 idiomas, lo que permite consultas en un idioma contra documentos en otro.
- Soporte de instrucciones de tarea en la consulta ("Instruct: … / Query: …"), orientado a adaptar el espacio de embedding a tareas de recuperación concretas.
- Búsqueda semántica y recuperación para RAG sobre corpus multilingües.
- Clustering y deduplicación de documentos mediante similitud de vectores.
- Clasificación y filtrado por similitud con prototipos (zero-shot mediante vecinos más cercanos).
- Ejecución en CPU sin GPU, con soporte de Arm64, x86-64, Windows x64 y contenedor Docker.
- Capacidades opcionales de GPU vía Vulkan (Ollama portable en x86-64) o CUDA (Turing o posterior).

No dispone de tool calling, function calling, razonamiento multi-paso, modo "thinking", visión ni audio. No es un modelo de chat ni de generación de texto.

## Casos de uso

- RAG multilingüe en infraestructura sin GPU: indexar documentación interna en varios idiomas y recuperar los fragmentos relevantes antes de pasarlos a un LLM generativo. El modelo cabe en CPU y elimina la dependencia de un servicio de embeddings externo.
- Búsqueda semántica sobre bases de conocimiento corporativas: codificar cada documento (trozos de menos de 512 tokens) y resolver consultas por similitud coseno, aprovechando la asimetría instrucción/consulta para mejorar el recall en dominios específicos.
- Deduplicación y clustering de grandes corpus: agrupar noticias, tickets o registros con el mismo significado en distintos idiomas antes de un proceso de curación de datos de entrenamiento.
- Clasificación de tickets de soporte sin entrenamiento supervisado: calcular el centroide de cada categoría con unos pocos ejemplos etiquetados y asignar nuevas entradas por vecino más cercano.
- Moderación y filtrado semántico: comparar mensajes entrantes con un conjunto de patrones de referencia para detectar duplicados, spam o contenido recurrente.
- Motor de recomendación por contenido: representar ítems y preferencias del usuario como vectores y generar candidatos por similitud, con latencia baja al ejecutarse en CPU junto al servicio de aplicación.
- Despliegue en el borde o en entornos air-gapped: en un dispositivo Arm (Graviton, Jetson con Arm64, servidor Altra) sirviendo embeddings sin salida a Internet, con los archivos del runtime y del modelo descargados previamente.
- Evaluación de calidad de traducciones o paráfrasis: medir similitud semántica entre original y traducción como señal automática en un pipeline de control de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio indica explícitamente que no aporta mediciones propias ("Measurements: None of its own") y solo confirma que el archivo carga y se ejecuta. No se dispone de cifras MMTEB, MTEB, BEIR ni de latencia o throughput medidos para esta cuantización Q8A64. Para resultados del modelo base sin cuantizar debe consultarse la card de `intfloat/multilingual-e5-large-instruct` y el artículo arXiv:2402.05672.

## Requisitos de hardware

- Pesos en 8 bits: aproximadamente 0,83 GB (833,6 M de parámetros a 1 byte por peso); el repositorio ocupa 2,3 GB porque incluye además los archivos del runtime.
- RAM o VRAM necesaria para inferencia: del orden de 1,2 a 1,5 GB incluyendo overhead de trabajo y el vocabulario; no se han publicado mediciones oficiales.
- CPU compatible: Arm64 con dotprod (Ampere Altra, AWS Graviton2 y posteriores, Neoverse N1 y posteriores), Arm64 genérico con la build `multi`, o x86-64 con AVX2 y FMA (Intel Haswell, AMD Zen y posteriores). Requiere glibc 2.28 o superior en Linux.
- GPU: no es necesaria. Opcionalmente, Ollama portable en x86-64 usa GPU NVIDIA, AMD o Intel a través de Vulkan, y existen archivos específicos con CUDA para GPU NVIDIA Turing o posteriores (RTX 20 y superiores) con driver actualizado.
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060 12 GB, RTX 4090, etc.) y en equipos sin GPU; el cuello de botella es el rendimiento del cómputo en CPU, no la memoria.
- Opciones de despliegue: exclusivamente el runtime VelociQ8 (`llama-server`, `llama-cli`, `llama-embedding`, `llama-bench`), la imagen Docker `ghcr.io/dhaern/velociq8` o los paquetes portables de Ollama 0.40.11 que incluye el proyecto. No es compatible con llama.cpp estándar, Ollama estándar, vLLM, TGI, text-embeddings-inference ni con los fragmentos automáticos de Hugging Face.
- Latencia y throughput: no disponibles. Dependen por completo del modelo de CPU; conviene medirlos con `llama-bench` en el hardware objetivo antes de dimensionar un servicio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensión | Formato | Runtime | Licencia |
|---|---|---|---|---|---|---|
| Este modelo (Q8A64) | 833,6 M (card: ~560 M) | 512 | 1024 | GGUF Q8A64 | Solo VelociQ8 | MIT (pesos) |
| `intfloat/multilingual-e5-large-instruct` (original) | ~560 M | 512 | 1024 | safetensors / PyTorch | Transformers, sentence-transformers | MIT |
| `Ralriki/multilingual-e5-large-instruct-GGUF` | ~560 M | 512 | 1024 | GGUF estándar | llama.cpp y derivados (Ollama, etc.) | MIT (heredada) |
| `BAAI/bge-m3` (referencia multilingüe de la categoría) | ~568 M | 8192 | 1024 | safetensors | Transformers, FlagEmbedding | MIT |

La diferencia práctica frente a las alternativas no es de calidad, sino de compatibilidad: este repositorio ofrece un único formato empaquetado en 8 bits que exige un runtime propietario, mientras que el original y la conversión de Ralriki funcionan con el ecosistema estándar. `bge-m3` ofrece un contexto mucho mayor (8192 tokens) y recuperación híbrida densa+dispersa, a costa de más memoria y de un stack distinto. No hay datos públicos que permitan comparar la calidad de esta cuantización Q8A64 con las demás.

## Limitaciones y advertencias

- Contexto de solo 512 tokens: cualquier documento más largo se trunca sin aviso, lo que obliga a trocear el corpus y puede degradar la recuperación en pasajes largos.
- Dependencia de un runtime propietario: los archivos Q8A64 no cargan en llama.cpp estándar ni en Ollama estándar. Esto introduce lock-in, un paso extra de descarga y verificación de binarios (`SHA256SUMS`) y la imposibilidad de usar herramientas estándar del ecosistema.
- Licencia mixta: los pesos son MIT, pero el runtime VelociQ8 es software propietario de uso gratuito. Antes de redistribuir o empaquetar en un producto conviene revisar los términos del runtime, que no son MIT.
- Ausencia total de mediciones: no hay benchmarks ni comparación con la versión sin cuantizar, así que la pérdida de calidad por la cuantización de 8 bits no está documentada.
- Advertencia de la propia card: los fragmentos de "Use this model" que muestra Hugging Face para llama.cpp y Ollama no funcionan con estos archivos; seguirlos produce errores de carga.
- Discrepancia en el recuento de parámetros (833,6 M en safetensors frente a ~560 M en la card): conviene verificar la cifra antes de dimensionar memoria o citar el modelo.
- No es un modelo generativo: no responde preguntas, no razona, no usa herramientas. No debe plantearse como sustituto de un LLM.
- Comportamiento desigual entre idiomas: el soporte declarado de 100 idiomas no implica calidad homogénea; los idiomas con menos datos en el entrenamiento del modelo base rendirán peor.
- Sesgos heredados del corpus del modelo base (pares de texto de la web y datos sintéticos generados por LLM), con posibles sesgos culturales y lingüísticos que se reflejan en el espacio de embeddings.
- Riesgo de falsos positivos en similitud: dos textos pueden quedar próximos por dominio o estilo sin ser equivalentes; conviene calibrar umbrales por caso de uso.
- Adopción muy baja (132 descargas, 0 likes) y pocas semanas desde su publicación: escasa validación independiente en producción.
- Las búsquedas de documentos deben respetar el formato asimétrico (instrucción en la consulta, documento sin instrucción); invertirlo degrada la recuperación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/VelociQ8/multilingual-e5-large-instruct-Q8A64-GGUF
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-large-instruct
- Organización VelociQ8 en Hugging Face: https://huggingface.co/VelociQ8
- Runtime VelociQ8 (GitHub): https://github.com/dhaern/VelociQ8
- Releases del runtime: https://github.com/dhaern/VelociQ8/releases
- Documentación de uso: https://github.com/dhaern/VelociQ8/blob/main/docs/usage.md
- Guía de Ollama: https://github.com/dhaern/VelociQ8/blob/main/docs/usage.md#ollama
- Guía de Docker: https://github.com/dhaern/VelociQ8/blob/main/docs/usage.md#docker
- Imagen Docker: https://github.com/dhaern/VelociQ8/pkgs/container/velociq8
- Artículo de la familia multilingual-e5: https://arxiv.org/abs/2402.05672
- Artículo sobre embeddings con instrucciones: https://arxiv.org/abs/2401.00368
- Conversión GGUF alternativa compatible con llama.cpp: https://huggingface.co/Ralriki/multilingual-e5-large-instruct-GGUF
- Ficha del modelo en PromptLayer: https://www.promptlayer.com/models/multilingual-e5-large-instruct-gguf/
- Ficha del modelo en Inferix: https://inferix.co/models/Ralriki/multilingual-e5-large-instruct-GGUF
- Guía de despliegue del modelo base: https://llmapi.ai/models/intfloat-multilingual-e5-large-instruct/
