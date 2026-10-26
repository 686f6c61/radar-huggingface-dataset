# VelociQ8/Qwen3-Embedding-8B-Q8A64-GGUF

## Resumen

VelociQ8/Qwen3-Embedding-8B-Q8A64-GGUF es una conversión del modelo de embeddings Qwen3-Embedding-8B (desarrollado por Qwen/Alibaba) al formato de pesos Q8A64 de 8 bits definido por VelociQ8, pensado para ejecutar inferencia de embeddings en CPU sobre Arm (aarch64) y x86-64. No se trata de un modelo nuevo ni de un reentrenamiento: es el mismo conjunto de pesos de 8.000 millones de parámetros, empaquetado en un GGUF propietario que solo carga con el runtime VelociQ8 1.1 o superior, no con llama.cpp estándar.

El modelo base convierte texto en vectores de hasta 4096 dimensiones con una ventana de contexto de 32K tokens y admite una instrucción de tarea en el lado de la consulta, lo que permite especializar el espacio de embeddings para recuperación, clasificación o clustering sin reentrenar. La aportación de este repositorio es permitir ese uso en servidores sin GPU, con huella de 8,4 GB en disco y licencia Apache 2.0 en los pesos.

Es relevante ahora porque la mayoría de los embeddings de 8B exigen GPU para tener latencia aceptable; esta conversión abre la puerta a indexación masiva y búsqueda semántica en infraestructura Arm (Graviton, Ampere Altra) o en equipos de sobremesa x86 con AVX2/FMA. El precio es una dependencia fuerte de un runtime de terceros: los snippets automáticos de Hugging Face para llama.cpp u Ollama no funcionan con este fichero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3, adaptado a embedding (la model card no detalla la arquitectura interna) |
| Parametros totales | 8B |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32K tokens en el modelo original |
| Tipos de cuantizacion | Q8A64 (8 bits) unicamente; el repositorio no ofrece otras cuantizaciones |
| Idiomas soportados | Multilingue (sin lista concreta de idiomas en la informacion disponible) |
| Licencia | Apache 2.0 (pesos); el runtime VelociQ8 es software propietario de uso gratuito |
| Formato de pesos | GGUF con formato Q8A64, cargable solo con VelociQ8 1.1 o superior |
| Dimensiones del embedding | Hasta 4096 |
| Tipo de pipeline | feature-extraction (sentence-similarity) |
| Instruccion de tarea | Si, en el lado de la query |
| Tamano del repositorio | 8,4 GB |
| Modelo base | Qwen/Qwen3-Embedding-8B |
| Repositorio creado / actualizado | 23 de octubre de 2026 / 25 de octubre de 2026 |
| Descargas / likes | 138 / 1 |

## Arquitectura y entrenamiento

Este repositorio no incluye entrenamiento propio: hereda íntegramente el del modelo base Qwen3-Embedding-8B, un transformer de 8B parámetros derivado de la familia Qwen3 y convertido a modelo de representaciones densas con vectores de hasta 4096 dimensiones. La model card no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esos datos corresponden a la documentación de Qwen y no aparecen en la información disponible.

La innovación técnica de esta publicación es exclusivamente de formato: la conversión a Q8A64, un esquema de pesos de 8 bits con metadatos y kernels propios, empaquetado con el runtime VelociQ8 (derivado de llama.cpp) que expone las mismas herramientas (`llama-server`, `llama-cli`, `llama-embedding`, `llama-bench`, `llama-quantize`) y la misma API HTTP compatible con OpenAI. El autor declara que el fichero está verificado para cargar y ejecutar, pero no publica mediciones propias de calidad de recuperación ni comparativas contra el modelo en BF16, por lo que la pérdida de precisión introducida por la cuantización de 8 bits no está cuantificada.

## Capacidades

- Generación de embeddings de texto para similitud semántica, con vectores de hasta 4096 dimensiones.
- Recuperación de información y búsqueda semántica, incluida la construcción de índices vectoriales para RAG.
- Soporte de instrucción de tarea en el lado de la query: la misma frase puede proyectarse de forma distinta según la tarea indicada.
- Clasificación de texto mediante comparación contra prototipos o centroides en el espacio de embeddings.
- Clustering y deduplicación de documentos, sin necesidad de etiquetas.
- Capacidades multilingües heredadas del modelo base (lista de idiomas no disponible).
- Inferencia en CPU sobre Arm (dotprod, AWS Graviton2 y posteriores, Neoverse N1 y posteriores, Ampere Altra) y x86-64 con AVX2 y FMA.
- Ejecución opcional en GPU mediante Vulkan (archivos Ollama para x86-64) o CUDA (archivos Ollama con CUDA, GPU NVIDIA Turing o posterior).
- No es un modelo generativo: no produce texto, no hace tool calling ni razonamiento multi-paso. Su salida es un vector.

## Casos de uso

- RAG sobre documentación interna en servidores Arm: indexación de un corpus con la ventana de 32K tokens y consulta con instrucción de tarea específica, sin GPU en el nodo de embeddings; encaja en despliegues sobre AWS Graviton donde el coste por hora de CPU es menor que el de una instancia con GPU.
- Búsqueda semántica multilingüe en catálogos de producto: el modelo proyecta consultas y descripciones en el mismo espacio, de modo que una búsqueda en castellano recupera fichas redactadas en inglés o alemán.
- Deduplicación de grandes volúmenes de tickets o correos: clustering sobre los embeddings de 4096 dimensiones para agrupar incidencias equivalentes antes de asignarlas a un equipo de soporte.
- Clasificación zero-shot de documentos entrantes: comparar el embedding del documento con el de descripciones de cada categoría y asignar la más próxima, útil cuando no hay datos etiquetados.
- Reranking ligero en pipelines híbridos: recuperar candidatos con BM25 y reordenarlos por similitud coseno usando este modelo, con la instrucción de query adecuada para reducir falsos positivos.
- Detección de similitud en procesos de moderación o compliance: marcar textos casi idénticos a comunicaciones previamente señaladas por similitud semántica en lugar de coincidencia exacta.
- Indexación en estaciones de trabajo sin GPU: un equipo x86-64 con AVX2 y 16 GB de RAM puede generar el índice completo de una base documental mediana en local, con el archivo Ollama portable incluido en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el autor no aporta mediciones propias ("Measurements: None of its own") y solo confirma que el fichero carga y se ejecuta. Tampoco se ofrecen cifras de latencia, throughput ni de degradación respecto al modelo base en BF16.

## Requisitos de hardware

- VRAM/RAM: al ser un formato de 8 bits sobre 8B parámetros, los pesos ocupan del orden de 8 GB; el repositorio completo son 8,4 GB. Conviene reservar 10-12 GB de memoria para pesos, buffers y activaciones.
- Cabe en CPU de consumo: sí, en x86-64 con AVX2 y FMA (Intel Haswell, AMD Zen o posterior) y en Arm de 64 bits; se recomienda un mínimo de 16 GB de RAM en el equipo.
- Arm: archivos específicos para CPU con dotprod (Ampere Altra, AWS Graviton2 y posteriores, Neoverse N1 y posteriores) y un binario multi-kernel que selecciona los kernels óptimos en cualquier Arm de 64 bits.
- GPU: opcional. Los archivos Ollama para x86-64 usan GPU NVIDIA, AMD o Intel mediante Vulkan; existen archivos específicos con CUDA que requieren GPU NVIDIA Turing o posterior (RTX 20 en adelante) con driver actualizado.
- Sistemas operativos: Linux (glibc 2.28 o superior), Windows 11 en x86-64, y contenedor Docker `ghcr.io/dhaern/velociq8` para Linux Arm y x86-64.
- Opciones de despliegue: exclusivamente el runtime VelociQ8 (`llama-server` con API compatible con OpenAI, `llama-cli`, `llama-embedding`, `llama-bench`) o los archivos portables de Ollama 0.40.11 incluidos. No es compatible con llama.cpp estándar, vLLM, TGI ni Ollama instalado por el usuario.
- Limitación operativa: las herramientas de VelociQ8 no descargan modelos; hay que bajar el fichero del repositorio y pasarlo con `-m`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimensiones | Formato / hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| VelociQ8/Qwen3-Embedding-8B-Q8A64-GGUF (este) | 8B | 32K | Hasta 4096 | GGUF Q8A64, solo runtime VelociQ8, CPU Arm/x86 | Apache 2.0 (runtime propietario) | Hugging Face, 138 descargas |
| Qwen/Qwen3-Embedding-8B (original) | 8B | 32K | Hasta 4096 | safetensors, requiere GPU para uso practico | Apache 2.0 | Hugging Face, oficial |
| Qwen3-Embedding en tamanos menores (0.6B, 4B) | 0,6B / 4B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | safetensors y GGUF de la comunidad | Apache 2.0 | Hugging Face |
| BGE-M3 | 568M | 8192 | 1024 | safetensors, CPU y GPU | MIT | Hugging Face |

La comparación con las variantes menores de Qwen3-Embedding y con BGE-M3 se basa en conocimiento general de la familia, no en datos incluidos en la información proporcionada; verifíquese antes de tomar decisiones de arquitectura. Frente al modelo original en safetensors, este fichero pierde portabilidad de ecosistema y gana capacidad de ejecución en CPU con un runtime concreto; frente a BGE-M3, ofrece muchas más dimensiones y parámetros a cambio de un consumo de memoria muy superior y de una licencia de runtime restrictiva en la práctica.

## Limitaciones y advertencias

- Dependencia de un runtime propietario: los pesos son Apache 2.0, pero en la práctica solo se pueden usar con VelociQ8, software propietario de uso gratuito y no auditado públicamente. Es un riesgo de lock-in para producción.
- Incompatibilidad con el ecosistema estándar: llama.cpp, Ollama convencional, vLLM y TGI no cargan ficheros Q8A64. Los ejemplos de "Use this model" de Hugging Face no funcionan.
- Ausencia de métricas de calidad: no hay evaluación publicada del impacto de la cuantización de 8 bits sobre MTEB, recall o precisión de recuperación frente al modelo en BF16.
- Consumo de memoria elevado para ser un modelo de embeddings: del orden de 8-12 GB, lo que descarta su uso en entornos con poca RAM o en despliegues de borde.
- Naturaleza del modelo: no genera texto; no sirve para tareas generativas, agentes ni tool calling. Un abuso en ese sentido produce resultados sin sentido.
- Similitud engañosa: como todo modelo de embeddings, puede asignar puntuaciones altas a textos superficialmente parecidos pero semánticamente opuestos; conviene calibrar umbrales con datos propios.
- Sesgos del modelo base no documentados: la model card no incluye análisis de sesgo, y la cuantización no corrige los del modelo original.
- Idiomas: se declara multilingüe sin lista explícita; el rendimiento en idiomas minoritarios o en castellano coloquial no está verificado en la información disponible.
- Tracción muy baja del repositorio (138 descargas, 1 like): no hay comunidad que valide resultados ni soporte más allá de las incidencias en GitHub.
- Fechas y procedencia: el repositorio está publicado por un tercero no afiliado a Qwen; la conversión no está avalada por el equipo del modelo base.

## Enlaces

- Repositorio del modelo: https://huggingface.co/VelociQ8/Qwen3-Embedding-8B-Q8A64-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-8B
- Runtime VelociQ8 (GitHub): https://github.com/dhaern/VelociQ8
- Releases del runtime: https://github.com/dhaern/VelociQ8/releases
- Documentación de uso: https://github.com/dhaern/VelociQ8/blob/main/docs/usage.md
- Sección de Ollama en la documentación: https://github.com/dhaern/VelociQ8/blob/main/docs/usage.md#ollama
- Sección de Docker en la documentación: https://github.com/dhaern/VelociQ8/blob/main/docs/usage.md#docker
- Incidencias del runtime: https://github.com/dhaern/VelociQ8/issues
- Imagen Docker: https://github.com/dhaern/VelociQ8/pkgs/container/velociq8
- Perfil del autor en Hugging Face: https://huggingface.co/VelociQ8
- Carpeta de runtimes del repositorio: https://huggingface.co/VelociQ8/Qwen3-Embedding-8B-Q8A64-GGUF/tree/main/runtime
- Foro del modelo: https://huggingface.co/VelociQ8/Qwen3-Embedding-8B-Q8A64-GGUF/discussions
- Paper de referencia (arXiv 2506.05176): https://arxiv.org/abs/2506.05176
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo; las consultas devolvieron únicamente páginas de contenido para adultos sin relación con el repositorio.
