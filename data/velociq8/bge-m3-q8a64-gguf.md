# VelociQ8/bge-m3-Q8A64-GGUF

## Resumen

VelociQ8/bge-m3-Q8A64-GGUF es una conversion del modelo de embeddings BGE-M3 de BAAI a Q8A64, el formato de pesos de 8 bits del runtime propietario VelociQ8. El modelo original es un encoder de texto que transforma frases y documentos en vectores densos de 1024 dimensiones para recuperacion de informacion, busqueda semantica y RAG. Esta version mantiene unicamente la salida densa, eliminando las capacidades sparse (lexical) y multi-vector (ColBERT) del modelo original.

El interes de esta publicacion es el formato de despliegue: Q8A64 esta disenado para inferencia en CPU sobre Arm (aarch64, incluyendo Ampere Altra y AWS Graviton2 o posteriores) y x86-64 (AVX2 y FMA, Intel Haswell y AMD Zen en adelante). El runtime VelociQ8 es software propietario gratuito construido sobre llama.cpp, con herramientas equivalentes (`llama-server`, `llama-embedding`, `llama-bench`) y API HTTP compatible con OpenAI. Los ficheros Q8A64 no cargan en llama.cpp estandar ni en Ollama convencional, lo que ata el uso del modelo a dicho runtime.

La relevancia practica es acotada pero clara: permite ejecutar un modelo de embeddings multilingue de calidad en servidores CPU sin GPU, con un peso de repositorio de 2,5 GB. El modelo base BGE-M3 cubre mas de 100 idiomas con contexto de 8192 tokens y no requiere prefijos de instruccion en consultas ni documentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (modelo base BGE-M3); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 865.119.008 (safetensors); la model card indica ~568M segun metadatos de Hugging Face |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (modelo original) |
| Tipos de cuantizacion | Q8A64 (8 bits, formato propietario VelociQ8) |
| Idiomas soportados | Multilingue (mas de 100 idiomas segun la model card) |
| Licencia | MIT |
| Formato de pesos | GGUF con cuantizacion Q8A64 (solo cargable en VelociQ8 1.1 o superior) |
| Dimension del embedding | 1024 (solo vectores densos) |
| Pipeline | feature-extraction |
| Tamano del repositorio | 2,5 GB |

## Arquitectura y entrenamiento

El modelo base BGE-M3 es un encoder de texto de BAAI orientado a retrieval multilingue, descrito en el paper arXiv:2402.03216. El modelo original produce tres tipos de representacion: vectores densos, pesos dispersos (lexicales) y embeddings multi-vector estilo ColBERT. Esta conversion Q8A64 expone exclusivamente la salida densa de 1024 dimensiones; las otras dos modalidades no estan disponibles en este fichero. No se especifican en la informacion proporcionada los detalles de composicion del dataset de entrenamiento, el numero de tokens ni si se aplico RLHF o DPO.

La innovacion tecnica de esta publicacion no esta en el modelo sino en el formato y runtime: Q8A64 es un esquema de cuantizacion de 8 bits para CPU con kernels optimizados por arquitectura. El runtime incluye binarios especificos para Arm con dotprod, Arm generico con seleccion de kernels en arranque, y x86-64 con AVX2 y FMA. Tambien ofrece archivos portables de Ollama 0.40.13 con VelociQ8 embebido, con soporte opcional de GPU via Vulkan en x86-64 y via CUDA en GPUs NVIDIA Turing o posteriores. No se han publicado datos de entrenamiento adicional ni procesos de ajuste propios de esta conversion.

## Capacidades

- Generacion de embeddings densos de 1024 dimensiones para frases y documentos, sin prefijos de instruccion en consultas ni pasajes.
- Recuperacion multilingue en mas de 100 idiomas sobre un unico espacio vectorial.
- Procesamiento de documentos largos de hasta 8192 tokens por entrada.
- Busqueda semantica y similitud entre frases (pipeline sentence-similarity).
- Soporte como motor de recuperacion en pipelines RAG.
- Inferencia en CPU sobre Arm (aarch64) y x86-64, sin GPU obligatoria.
- Servido mediante API HTTP compatible con OpenAI a traves de `llama-server`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de embeddings, no generativo.
- No soporta vision ni audio.
- No ofrece salidas sparse ni multi-vector (ColBERT) en esta conversion.

## Casos de uso

- Busqueda semantica en documentacion interna: indexar manuales y articulos con vectores densos de 1024 dimensiones y recuperar por similitud coseno; el contexto de 8192 tokens permite indexar secciones completas sin trocear en exceso.
- RAG sobre corpus multilingue: usar el modelo como retriever en un pipeline que consulte documentacion en varios idiomas y alimente un LLM generativo con los pasajes recuperados; el espacio vectorial compartido evita mantener indices por idioma.
- Despliegue en servidores sin GPU: ejecutar el modelo en instancias Arm como AWS Graviton o Ampere Altra, donde el coste por hora de CPU es menor que el de una GPU dedicada, usando los binarios con kernels dotprod.
- Deduplicacion y agrupacion de documentos: calcular embeddings de registros y agrupar por cercania para detectar duplicados o near-duplicates en bases de conocimiento.
- Moderacion y clasificacion por similitud: comparar entradas de usuario contra un conjunto de embeddings de referencia etiquetados para clasificar temas o detectar contenido proximo a patrones conocidos.
- Sistemas de recomendacion basados en contenido: vectorizar descripciones de articulos y perfiles de usuario para recomendar items con representaciones densas en tiempo de consulta sobre CPU.
- Evaluacion de calidad de respuestas: medir similitud semantica entre respuesta generada y respuesta de referencia en pipelines de evaluacion automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el modelo no tiene mediciones propias y que solo se ha verificado que carga y ejecuta correctamente. Tampoco se proporcionan datos de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: no aplica en el modo principal (inferencia en CPU). En modo GPU via Vulkan o CUDA, el peso de 2,5 GB del repositorio sugiere una huella de memoria en el rango de pocos GB, aunque no se proporciona una cifra oficial.
- GPU recomendadas: NVIDIA Turing o posteriores (GeForce RTX 20 series en adelante) para los archivos con CUDA; GPUs NVIDIA, AMD o Intel con driver Vulkan para los archivos Ollama x86-64.
- CPU: Arm con dotprod (Ampere Altra, AWS Graviton2 o posterior, Neoverse N1 o posterior) o cualquier Arm de 64 bits con el binario multi; x86-64 con AVX2 y FMA (Intel Haswell, AMD Zen o posterior).
- Cabe en hardware de consumo: si, en CPU de escritorio o portatil modernos; en GPU de consumo solo mediante los paquetes Ollama con Vulkan o CUDA.
- Opciones de despliegue: runtime VelociQ8 (`llama-server`, `llama-cli`, `llama-embedding`, `llama-bench`), Ollama 0.40.13 portable incluido en los archivos del proyecto, e imagen Docker `ghcr.io/dhaern/velociq8`. No funciona con llama.cpp estandar, Ollama convencional, vLLM ni TGI.
- Requisito de sistema: glibc 2.28 o superior en Linux.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salidas | Licencia | Runtime |
|---|---|---|---|---|---|
| VelociQ8/bge-m3-Q8A64-GGUF | 865M (safetensors) | 8192 | Densa | MIT | VelociQ8 (propietario, gratuito) |
| BAAI/bge-m3 (original) | ~568M segun model card | 8192 | Densa, sparse, multi-vector | MIT | PyTorch, transformers, sentence-transformers |
| BGE-M3 en GGUF estandar (otras conversiones de la comunidad) | ~568M | 8192 | Densa (segun conversion) | MIT | llama.cpp, Ollama |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia de runtime propietario: los ficheros Q8A64 solo cargan en VelociQ8 1.1 o superior. Las instrucciones automaticas de "Use this model" de Hugging Face para llama.cpp y Ollama no funcionan con estos ficheros.
- Perdida de funcionalidad respecto al original: solo se ofrecen vectores densos; no hay salida sparse ni ColBERT, lo que elimina las estrategias de recuperacion hibrida del modelo base.
- Discrepancia en el recuento de parametros: los metadatos de safetensors indican 865.119.008 y la model card cita ~568M a partir de metadatos de Hugging Face. Conviene verificar antes de dimensionar infraestructura.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero la recuperacion puede devolver pasajes poco relevantes si el corpus o las consultas quedan fuera del dominio de entrenamiento del modelo base.
- Sesgos: no se documentan en la informacion proporcionada; al heredarse del modelo base BGE-M3, conviene evaluar sesgos por idioma y dominio antes de desplegar en produccion.
- Cobertura idiomatica desigual: aunque se declaran mas de 100 idiomas, no se aportan metricas por idioma en esta publicacion.
- Modelo sin mediciones propias: no hay benchmarks ni cifras de latencia publicadas para esta conversion, por lo que la evaluacion de calidad debe hacerse contra el modelo base original.
- Licencia MIT en los pesos, pero el runtime VelociQ8 es propietario y gratuito; revisar sus terminos si el uso es comercial o si se redistribuye.
- Sin soporte de descarga integrada: las herramientas VelociQ8 no descargan modelos; hay que bajar el fichero y pasarlo con `-m`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/VelociQ8/bge-m3-Q8A64-GGUF
- Modelo base: https://huggingface.co/BAAI/bge-m3
- Paper del modelo base: https://arxiv.org/abs/2402.03216
- Runtime VelociQ8: https://github.com/dhaern/VelociQ8
- Releases del runtime: https://github.com/dhaern/VelociQ8/releases
- Documentacion de uso: https://github.com/dhaern/VelociQ8/blob/main/docs/usage.md
- Imagen Docker: https://github.com/dhaern/VelociQ8/pkgs/container/velociq8
- Organizacion VelociQ8 en Hugging Face: https://huggingface.co/VelociQ8
