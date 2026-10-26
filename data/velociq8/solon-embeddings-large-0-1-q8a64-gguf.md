# VelociQ8/Solon-embeddings-large-0.1-Q8A64-GGUF

## Resumen

Este repositorio contiene Solon Embeddings large 0.1 convertido al formato Q8A64, el formato de pesos de 8 bits del runtime VelociQ8, pensado para ejecutar el modelo en CPU sobre Arm (aarch64) y x86-64. El modelo original es un modelo de embeddings de texto en francés desarrollado por Ordalie Tech, que transforma texto en vectores densos de 1024 dimensiones para recuperación, reranking, similitud semántica y clasificación. La relevancia de esta publicación no está en el modelo en sí, sino en el formato: permite servir un modelo de embeddings en infraestructura sin GPU, algo útil para pipelines RAG de bajo coste.

El modelo base es un encoder de ~834 millones de parámetros según los metadatos de safetensors de Hugging Face (la model card del autor de la conversión indica "unos 560M", una discrepancia que conviene tener en cuenta). La longitud de contexto no está declarada en la tarjeta original; su fichero de configuración admite 514 posiciones, es decir, 512 tokens útiles. La salida son embeddings de 1024 dimensiones y las consultas requieren un prefijo corto, tal como indica el autor de la conversión.

El punto crítico para evaluar este artefacto es la compatibilidad: los ficheros Q8A64 solo cargan en VelociQ8 1.1 o superior, un runtime propietario de uso gratuito construido sobre llama.cpp. Ni llama.cpp estándar ni Ollama estándar ni los snippets automáticos de "Use this model" de Hugging Face funcionan con estos pesos. Eso condiciona por completo el despliegue y conviene valorarlo antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (modelo de embeddings de texto; detalles de capas y atención no disponibles en la informacion proporcionada) |
| Parametros totales | 833.661.760 (metadatos de safetensors de Hugging Face); la model card de la conversion indica "unos 560M": dato discrepante, no confirmado |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 514 posiciones en el fichero de configuracion del modelo base (512 tokens utiles); no declarada en la tarjeta original |
| Tipos de cuantizacion | Q8A64 (8 bits por peso, formato propietario de VelociQ8). No se publican otras variantes en este repositorio |
| Idiomas soportados | Frances (`fr`) unicamente |
| Licencia | MIT (pesos); el runtime VelociQ8 es software propietario de uso gratuito |
| Formato de pesos | GGUF modificado en variante Q8A64; no cargable por llama.cpp, Ollama ni otras herramientas GGUF estandar |
| Dimension del embedding | 1024 dimensiones |
| Tamano del repositorio | 2,3 GB (incluye archivos del runtime ademas de los pesos) |
| Descargas / likes | 127 descargas, 0 likes |
| Fechas | Creado el 2026-10-21; actualizado el 2026-10-25 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base: se sabe que es un modelo de embeddings de texto que produce vectores densos de 1024 dimensiones, que se carga con la libreria `transformers` y que se usa para similitud semantica, clasificacion y ranking sobre texto en frances. No se especifican el numero de capas, la dimension oculta, el mecanismo de atencion ni si emplea alguna variante de encoder tipo BERT o similar. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del corpus, ni si hubo etapas de ajuste con datos de pares o tripletas.

Respecto a la conversion, el autor indica que se ha aplicado una cuantizacion de 8 bits por peso en el formato Q8A64 y que el fichero ha sido verificado para cargar y ejecutar, pero no se publican mediciones de calidad (el propio autor afirma que no hay "measurements of its own"). No hay informacion sobre perdida de rendimiento respecto al modelo original en tareas de recuperacion o similitud. Cualquier afirmacion sobre degradacion por cuantizacion seria una suposicion no respaldada por los datos disponibles.

## Capacidades

- Generacion de embeddings de texto: convierte frases y parrafos en vectores densos de 1024 dimensiones.
- Similitud semantica entre textos (sentence-similarity), base para busqueda semantica.
- Recuperacion de informacion (retrieval) para pipelines RAG.
- Reranking de resultados de busqueda.
- Clasificacion de texto por similitud con prototipos o etiquetas.
- Agrupamiento (clustering) y deduplicacion semantica de documentos.
- Uso con prefijo corto en las consultas, segun indica el autor de la conversion (el prefijo concreto no se detalla en la informacion disponible).
- Ejecucion en CPU sobre Arm y x86-64 mediante el runtime VelociQ8, con API HTTP compatible con OpenAI.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision ni tool calling: es un modelo de embeddings, no un LLM generativo.

## Casos de uso

- RAG sobre corpus en frances sin GPU: indexar documentos con los embeddings de 1024 dimensiones y servirlos desde un nodo CPU Arm (Graviton, Ampere Altra) o x86-64, evitando el coste de una GPU dedicada en la fase de recuperacion.
- Busqueda semantica interna en bases documentales francesas: sustituir busqueda por palabras clave en un corpus legal, administrativo o interno, aprovechando la similitud densa para consultas formuladas con vocabulario distinto al del documento.
- Reranking de resultados: usar el modelo como segunda fase sobre el top-k devuelto por un buscador lexico (BM25) o por un retriever mas ligero, recalculando la similitud con embeddings de mayor calidad.
- Clasificacion y enrutado de tickets de soporte en frances: generar el embedding del ticket y compararlo con prototipos por categoria para asignar cola o prioridad, con el modelo corriendo en el mismo servidor de aplicaciones.
- Deduplicacion de articulos o fichas de producto: calcular similitud entre pares y marcar duplicados por encima de un umbral, en procesos batch nocturnos sobre CPU.
- Moderacion y agrupamiento de feedback de usuarios: agrupar quejas o comentarios similares en clusters para detectar temas recurrentes, sin enviar los textos a un servicio externo.
- Despliegue en entornos con requisitos de red estrictos (on-premise, sin salida a internet): el runtime no descarga modelos, se pasa el fichero localmente con `-m`, lo que encaja en instalaciones aisladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor de la conversion indica explicitamente que no hay mediciones propias ("Measurements: None of its own"), y la tarjeta del modelo base no aporta cifras en el material proporcionado. Fuentes secundarias de la busqueda web (llmboard.ai, aimodels.fyi) mencionan de forma generica un rendimiento "state-of-the-art" en tareas de similitud de texto en frances para el modelo base, pero sin tablas ni cifras verificables, por lo que no se recogen aqui.

## Requisitos de hardware

- Inferencia en CPU: el autor orienta el formato Q8A64 explicitamente a CPU. Con 8 bits por peso y ~834M parametros, el peso de los tensores ronda los 0,8-0,9 GB; el repositorio ocupa 2,3 GB porque incluye ademas los archivos del runtime. Conviene reservar al menos 2 GB de RAM para pesos, tokenizador y overhead del proceso (estimacion, no medida publicada).
- CPU Arm: se requieren nucleos con dotprod (Ampere Altra, AWS Graviton2 y posteriores, Neoverse N1 y posteriores) para el archivo `linux-arm64`; existe un archivo `linux-arm64-multi` que selecciona los mejores kernels al arrancar en cualquier CPU Arm de 64 bits.
- CPU x86-64: requiere AVX2 y FMA (Intel Haswell, AMD Zen y posteriores).
- Sistema operativo: archivos Linux con glibc 2.28 o superior; tambien hay paquete para Windows x64 (probado en Windows 11).
- GPU: no es necesaria. Las distribuciones portables de Ollama para x86-64 pueden usar GPU NVIDIA, AMD o Intel via Vulkan; hay ademas archivos con CUDA que requieren GPU NVIDIA Turing o posterior (RTX 20 en adelante) con driver actualizado.
- Opciones de despliegue: runtime VelociQ8 (incluye `llama-server`, `llama-cli`, `llama-embedding`, `llama-bench` y `llama-quantize`, con API HTTP compatible con OpenAI), imagen Docker `ghcr.io/dhaern/velociq8`, o las distribuciones portables de Ollama 0.40.11 incluidas.
- No compatible con vLLM, TGI, llama.cpp estandar ni Ollama instalado previamente.
- Latencia y throughput: no disponibles. No se han publicado mediciones de `llama-bench` ni de velocidad de embedding para este fichero.

## Comparativa con modelos similares

Los datos disponibles solo permiten comparar el artefacto con su propio modelo base. No hay informacion verificada en el material proporcionado sobre modelos alternativos de embeddings en frances (parametros, contexto, rendimiento o licencia), por lo que esa parte queda como no disponible.

| Modelo | Parametros | Contexto | Dimension del embedding | Formato | Runtime | Licencia |
|---|---|---|---|---|---|---|
| VelociQ8/Solon-embeddings-large-0.1-Q8A64-GGUF | 833.661.760 (metadatos safetensors) | 512 tokens utiles | 1024 | Q8A64 (GGUF modificado) | VelociQ8 1.1+ (propietario, uso gratuito) | MIT |
| OrdalieTech/Solon-embeddings-large-0.1 (base) | Mismo modelo, sin cuantizar; cifra no publicada en la tarjeta original | 512 tokens utiles | 1024 | safetensors (transformers) | transformers / librerias estandar | MIT |

Alternativas de la misma categoria: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia de un runtime propietario: los pesos Q8A64 no cargan en llama.cpp, Ollama estandar ni ninguna otra herramienta GGUF convencional. Adoptar este fichero implica adoptar VelociQ8 y su ciclo de versiones (se exige 1.1 o superior; las descargas publicadas son 1.4).
- Solo frances: el modelo no esta pensado para castellano ni para uso multilingue. Usarlo con textos en otros idiomas producira embeddings de calidad no garantizada.
- Contexto corto: 512 tokens utiles. Los documentos largos deben trocearse, lo que afecta a la calidad de recuperacion en fragmentos con dependencias largas.
- Sin mediciones de calidad: no hay evaluaciones publicadas de este artefacto ni comparacion con el modelo base sin cuantizar, por lo que se desconoce la perdida introducida por la cuantizacion de 8 bits.
- Discrepancia en el recuento de parametros (833M en safetensors frente a "unos 560M" en la model card) que impide hacer estimaciones fiables de memoria sin medir.
- Riesgo de falsos positivos en similitud: como todo modelo de embeddings, puede producir vecinos cercanos erroneos en textos con vocabulario solapado pero significado distinto. En produccion conviene calibrar umbrales con datos propios y anadir una fase de reranking.
- Validacion comunitaria practicamente nula: 127 descargas y 0 likes en el momento de la consulta, sin discusiones tecnicas que aporten evidencia de uso real.
- Licencia: los pesos son MIT, lo que permite uso comercial, pero el runtime es software propietario de uso gratuito; conviene revisar sus terminos antes de integrarlo en un producto.
- No es un modelo generativo: no debe usarse para responder preguntas, resumir ni generar texto. Cualquier expectativa de ese tipo lleva a un error de uso.
- Requisitos de sistema estrictos en Linux (glibc 2.28+) y en CPU (dotprod en Arm, AVX2/FMA en x86-64); hardware mas antiguo queda fuera.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/VelociQ8/Solon-embeddings-large-0.1-Q8A64-GGUF
- Discusiones del repositorio: https://huggingface.co/VelociQ8/Solon-embeddings-large-0.1-Q8A64-GGUF/discussions
- Modelo base: https://huggingface.co/OrdalieTech/Solon-embeddings-large-0.1
- Runtime VelociQ8 (GitHub): https://github.com/dhaern/VelociQ8
- Releases del runtime: https://github.com/dhaern/VelociQ8/releases
- Documentacion de uso: https://github.com/dhaern/VelociQ8/blob/main/docs/usage.md
- Organizacion VelociQ8 en Hugging Face: https://huggingface.co/VelociQ8
- Imagen Docker: https://github.com/dhaern/VelociQ8/pkgs/container/velociq8
- Licencia MIT: https://opensource.org/license/mit
- Ficha del modelo base en llmboard.ai: https://www.llmboard.ai/models/ordalietech-solon-embeddings-large-0-1
- Ficha del modelo base en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/solon-embeddings-large-01-ordalietech
- Registro del artefacto en free2aitools: https://free2aitools.com/model/velociq8/solon-embeddings-large-0.1-q8a64-gguf
