# VelociQ8/Qwen3-Embedding-8B-Q8A64-GGUF

## Resumen

Qwen3-Embedding-8B-Q8A64-GGUF es una conversión al formato Q8A64 del modelo de embeddings Qwen3-Embedding-8B, desarrollado originalmente por el equipo Qwen de Alibaba. El modelo base es un transformer de 8.000 millones de parámetros especializado en la generación de vectores de embedding de hasta 4096 dimensiones, diseñado para tareas de recuperación de información, similitud semántica, clasificación y clustering. Esta versión concreta ha sido publicada por el usuario VelociQ8 y emplea el formato propietario Q8A64 (pesos de 8 bits) del runtime VelociQ8, derivado de llama.cpp.

La relevancia de esta ficha radica en que el modelo no funciona con las herramientas GGUF estándar: requiere el runtime VelociQ8 1.1 o superior, que ofrece inferencia optimizada en CPU para arquitecturas Arm (aarch64) y x86-64, con soporte opcional de GPU mediante Vulkan o CUDA a través de archivos Ollama portables. El modelo base conserva una ventana de contexto de 32.000 tokens y capacidades multilingües, lo que lo hace adecuado para pipelines RAG y búsqueda semántica en entornos sin GPU dedicada.

El repositorio ocupa 8,6 GB y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. Se trata, por tanto, de una opción orientada a despliegues en CPU donde el rendimiento del formato GGUF convencional no es suficiente y se busca un formato de pesos de 8 bits con kernels específicos para Arm y x86.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo de embeddings del base Qwen3-Embedding-8B) |
| Parametros totales | 8B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32K tokens (modelo original) |
| Tipos de cuantizacion | Q8A64 (8 bits, formato propietario VelociQ8) |
| Idiomas soportados | Multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF con cuantización Q8A64 (requiere runtime VelociQ8) |

## Arquitectura y entrenamiento

El modelo base Qwen3-Embedding-8B es un transformer de 8.000 millones de parámetros entrenado por Qwen para generar embeddings de texto de hasta 4096 dimensiones. Está diseñado para aceptar una instrucción de tarea en el lado de la consulta (query side), lo que permite adaptar el vector resultante a distintas tareas de recuperación y similitud. La información disponible no detalla la composición del dataset de entrenamiento ni si se emplearon técnicas de RLHF o DPO; tampoco se especifican innovaciones arquitectónicas adicionales más allá de las propias del modelo base.

Esta versión concreta no introduce cambios en la arquitectura ni en el entrenamiento: es una conversión de pesos al formato Q8A64 de VelociQ8, un formato de 8 bits con kernels optimizados para CPU en Arm (dotprod, Neoverse N1 y posteriores, AWS Graviton2 y posteriores) y x86-64 (AVX2 y FMA, Intel Haswell y AMD Zen en adelante). El runtime VelociQ8, construido sobre llama.cpp, incluye las herramientas habituales (`llama-server`, `llama-cli`, `llama-embedding`, `llama-bench`, `llama-quantize`) con API HTTP compatible con OpenAI. El autor no publica mediciones propias de rendimiento; solo verifica que el archivo carga y se ejecuta correctamente.

## Capacidades

- Generación de embeddings de texto de hasta 4096 dimensiones para recuperación, clasificación y clustering.
- Soporte de instrucción de tarea en el lado de la consulta, lo que permite especializar el embedding según el caso de uso.
- Capacidades multilingües heredadas del modelo base Qwen3-Embedding-8B.
- Similitud semántica y búsqueda semántica sobre corpus extensos.
- Integración en pipelines RAG mediante la herramienta `llama-embedding` del runtime VelociQ8.
- Inferencia en CPU con kernels optimizados para Arm y x86-64; soporte opcional de GPU mediante Vulkan (x86-64) o CUDA (NVIDIA Turing o posterior) a través de los archivos Ollama portables.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-paso, ya que su pipeline es `feature-extraction`.

## Casos de uso

- Búsqueda semántica en documentación interna: el modelo genera vectores de hasta 4096 dimensiones que permiten indexar y recuperar fragmentos por similitud semántica en lugar de coincidencia léxica, con contexto de 32K tokens para documentos largos.
- Pipelines RAG en entornos sin GPU: al ejecutarse en CPU mediante el runtime VelociQ8, permite desplegar la fase de embedding de un sistema RAG en servidores Arm (Graviton, Ampere Altra) o x86 sin necesidad de aceleradores dedicados.
- Clasificación de textos por similitud: comparando el embedding de un texto con embeddings de referencia de cada categoría se puede construir un clasificador sin entrenamiento adicional, útil para triaje de tickets o moderación.
- Deduplicación y clustering de corpus: agrupando documentos por distancia entre embeddings se detectan duplicados y se organizan grandes colecciones de texto en clústeres temáticos.
- Motor de recomendación basado en contenido: los embeddings de artículos o productos permiten calcular similitud entre ítems y generar recomendaciones sin depender de señales de interacción.
- Búsqueda multilingüe: al soportar múltiples idiomas, permite consultar un corpus en un idioma y recuperar documentos relevantes en otro, útil en bases de conocimiento internacionales.
- Despliegue en dispositivos edge con Arm: la compilación multi-arquitectura (`arm64-multi`) selecciona los mejores kernels al arrancar, lo que facilita su uso en servidores Arm de bajo consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo no tiene mediciones propias y que solo se ha verificado que carga y se ejecuta. Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 8,6 GB; al ser un formato de 8 bits para CPU, se requiere al menos esa cantidad de memoria del sistema disponible para cargar los pesos, más overhead del runtime.
- GPU recomendadas: no es un modelo pensado para GPU; el runtime base es de CPU. Los archivos Ollama portables para x86-64 permiten usar GPU mediante Vulkan (NVIDIA, AMD o Intel con driver instalado) y existe una variante CUDA para NVIDIA Turing (RTX 20 series) o posterior.
- CPU compatibles: Arm con dotprod (Ampere Altra, AWS Graviton2 y posteriores, Neoverse N1 y posteriores), cualquier Arm de 64 bits con la compilación `arm64-multi`, y x86-64 con AVX2 y FMA (Intel Haswell, AMD Zen y posteriores).
- Cabe en consumer hardware: sí, siempre que se disponga de al menos 8,6 GB de RAM libre; no requiere GPU dedicada.
- Opciones de despliegue: runtime VelociQ8 1.5 (archivos Linux arm64, arm64-multi, x64, Windows x64), Ollama portable 0.40.13 (Linux arm64, Linux x64, Windows x64, variantes CUDA) y la imagen Docker `ghcr.io/dhaern/velociq8`. No funciona con llama.cpp estándar, Ollama convencional ni otras herramientas GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-Embedding-8B-Q8A64-GGUF (este) | 8B | 32K | Q8A64 (VelociQ8) | Apache 2.0 | Requiere runtime VelociQ8; optimizado para CPU Arm/x86 |
| Qwen/Qwen3-Embedding-8B (base) | 8B | 32K | safetensors | Apache 2.0 | Modelo original; requiere framework de deep learning (transformers, etc.) |
| Alternativas GGUF estándar de Qwen3-Embedding-8B | 8B | 32K | GGUF (Q4, Q8, etc.) | Apache 2.0 | Compatibles con llama.cpp y Ollama convencionales; no disponibles en la informacion proporcionada como repositorios concretos |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de esta conversión frente a otras cuantizaciones del mismo modelo base.

## Limitaciones y advertencias

- El archivo solo carga con el runtime VelociQ8 1.1 o superior; las herramientas GGUF estándar (llama.cpp, Ollama convencional) y los snippets automáticos de Hugging Face no funcionan con él.
- El runtime VelociQ8 es software propietario de uso gratuito, no open source, lo que puede suponer una dependencia de proveedor para despliegues en producción.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento; su única salida son vectores de embedding.
- No se han publicado mediciones de rendimiento, latencia ni calidad de los embeddings de esta conversión concreta; la fidelidad respecto al modelo base en formato safetensors no está verificada numéricamente.
- Riesgo de sesgos y alucinaciones heredado del modelo base Qwen3-Embedding-8B, no evaluado en esta conversión.
- La ventana de contexto de 32K tokens corresponde al modelo original; no se especifica si la conversión Q8A64 la preserva íntegramente.
- Aunque la licencia es Apache 2.0, conviene revisar los términos del runtime VelociQ8 para uso comercial, ya que es software propietario independiente de los pesos.
- El repositorio tiene un volumen de descargas bajo (221) y pocos likes (2), lo que limita la validación comunitaria de su funcionamiento en distintas plataformas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/VelociQ8/Qwen3-Embedding-8B-Q8A64-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-8B
- Runtime VelociQ8 (GitHub): https://github.com/dhaern/VelociQ8
- Releases del runtime: https://github.com/dhaern/VelociQ8/releases
- Documentación de uso: https://github.com/dhaern/VelociQ8/blob/main/docs/usage.md
- Docker: https://github.com/dhaern/VelociQ8/pkgs/container/velociq8
- Issues del runtime: https://github.com/dhaern/VelociQ8/issues
- Discusiones del modelo: https://huggingface.co/VelociQ8/Qwen3-Embedding-8B-Q8A64-GGUF/discussions
- Paper referenciado (arXiv:2506.05176): https://arxiv.org/abs/2506.05176
- Otros modelos VelociQ8: https://huggingface.co/VelociQ8
