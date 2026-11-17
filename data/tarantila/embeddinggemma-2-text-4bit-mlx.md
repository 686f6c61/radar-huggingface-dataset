# tarantila/embeddinggemma-2-text-4bit-mlx

## Resumen

EmbeddingGemma 2 text es un modelo de embeddings de frases derivado de Google EmbeddingGemma 2, publicado por el usuario tarantila en Hugging Face. Se trata de una extraccion del codificador de texto del modelo multimodal original: se han conservado unicamente los tensores `language_model.*` de la conversion a 4 bits realizada por mlx-community, descartando las torres de vision, audio y video. El resultado es un modelo de 271 millones de parametros que convierte texto en vectores de 768 dimensiones, con un peso de aproximadamente 153 MB.

El modelo resuelve la necesidad de generar embeddings de frases para busqueda semantica y similitud de oraciones en dispositivos Apple, concretamente mediante MLX y MLX Swift. Su proposito declarado es la busqueda on-device en la aplicacion VoiceWork para iPhone, lo que explica la conversion a 4 bits y la eliminacion de componentes multimodales no necesarios para esa tarea.

La relevancia actual radica en su tamano reducido (0,2 GB de repositorio), su licencia Apache 2.0 y su compatibilidad con el ecosistema MLX, que permite ejecutar inferencia en hardware Apple Silicon sin depender de CUDA. Al derivar de EmbeddingGemma 2, hereda el soporte multilingue del modelo base, aunque la model card no detalla la lista concreta de idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (codificador de texto de EmbeddingGemma 2) |
| Parametros totales | 271.002.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX) |
| Idiomas soportados | multilingue (lista concreta no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una extraccion del codificador de texto de Google EmbeddingGemma 2, un modelo multimodal de embeddings. La copia conserva exclusivamente los tensores del submodelo de lenguaje de la conversion a 4 bits de mlx-community (revision `914f7f89142e33e77833254d9c9b90c3cef7303b`). El `config.json` es el original del modelo completo, de modo que un cargador que construya solo el modelo de texto ignora las secciones `vision_config` y `audio_config`. Los vectores de texto resultantes son identicos a los de la conversion completa a 4 bits.

El proceso de embedding sigue el esquema del modelo original: se antepone al texto un prefijo de tarea (`task: search result | query: ` para consultas y `title: none | text: ` para documentos), se aplica mean pooling sobre los tokens y se normaliza el vector resultante con L2. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada. La innovacion tecnica destacable es la poda de las torres multimodales, que reduce el peso de 1,1 GB a aproximadamente 153 MB sin alterar los embeddings de texto.

## Capacidades

- Generacion de embeddings de frases de 768 dimensiones a partir de texto.
- Similitud de oraciones y busqueda semantica mediante comparacion de vectores normalizados.
- Extraccion de caracteristicas (feature-extraction) para pipelines de recuperacion de informacion.
- Soporte multilingue heredado del modelo base (idiomas concretos no disponibles).
- Prefijos de tarea para distinguir consultas y documentos en escenarios de recuperacion.
- Ejecucion on-device en hardware Apple mediante MLX y MLX Swift.
- No incluye capacidades de vision, audio ni video (torres eliminadas).
- No se documenta soporte de tool calling, agentes ni modos de razonamiento multi-step.

## Casos de uso

- Busqueda semantica on-device en aplicaciones iPhone: el modelo genera embeddings de consultas y documentos localmente mediante MLX Swift, sin enviar datos a servidores, lo que encaja con el proposito declarado de la app VoiceWork.
- Recuperacion aumentada por generacion (RAG) en dispositivos Apple: los vectores de 768 dimensiones permiten indexar y recuperar fragmentos de texto en local, reduciendo la latencia y la dependencia de servicios en la nube.
- Deduplicacion y agrupamiento de textos: la similitud coseno entre embeddings permite detectar documentos o mensajes duplicados en corpus multilingues.
- Clasificacion de texto por similitud: comparar la representacion de un texto con prototipos de cada categoria para tareas de enrutamiento o etiquetado sin entrenamiento adicional.
- Motor de busqueda personal en notas o correo: indexar contenido del usuario y recuperar entradas relevantes mediante consultas en lenguaje natural, aprovechando el soporte multilingue.
- Filtrado de contenido y moderacion asistida: calcular la cercania semantica de mensajes a patrones predefinidos para priorizar revisiones.
- Sistemas de recomendacion basados en contenido: representar articulos o descripciones y calcular afinidad con los intereses del usuario mediante similitud vectorial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 153 MB de pesos en 4 bits, mas overhead de activaciones y del runtime MLX; el consumo total de memoria no esta documentado.
- GPU recomendadas: hardware Apple Silicon (serie M) mediante MLX; no se documenta soporte para GPU NVIDIA.
- Cabe en GPU consumer: si, en cualquier Mac con chip Apple Silicon; el tamano reducido permite ejecucion en iPhone segun el proposito declarado del autor.
- Opciones de despliegue: MLX y MLX Swift; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tarantila/embeddinggemma-2-text-4bit-mlx | 271 M | no disponible | Apache 2.0 | safetensors (MLX, 4 bits) | Solo texto, 768 dimensiones, on-device Apple |
| google/embeddinggemma-2 | no disponible | no disponible | Apache 2.0 | no disponible | Modelo base multimodal completo (texto, vision, audio, video) |
| mlx-community/embeddinggemma-2-4bit | no disponible | no disponible | Apache 2.0 | safetensors (MLX, 4 bits) | Conversion completa a 4 bits, incluye todas las torres |

## Limitaciones y advertencias

- Solo procesa texto: las torres de vision, audio y video han sido eliminadas, por lo que no puede generar embeddings de imagenes, sonido o video.
- El `config.json` conserva las secciones `vision_config` y `audio_config` del modelo original; los cargadores que no las ignoren explicitamente pueden fallar o intentar construir componentes inexistentes.
- La longitud maxima de contexto no esta documentada en la informacion disponible.
- La lista concreta de idiomas soportados no esta disponible; solo se indica "multilingue".
- Riesgo de sesgo y alucinacion: no se documentan evaluaciones de sesgo ni de robustez para esta conversion.
- Dependencia del ecosistema MLX: no se documenta compatibilidad con runtimes CUDA ni con formatos GGUF.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia; no hay evidencia de uso en produccion por terceros.
- La licencia Apache 2.0 permite uso comercial, pero se requiere atribucion a Google segun indica el autor.
- El prefijo de tarea es obligatorio para replicar el comportamiento del modelo original; omitirlo puede degradar la calidad de los embeddings.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tarantila/embeddinggemma-2-text-4bit-mlx
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Conversion completa a 4 bits: https://huggingface.co/mlx-community/embeddinggemma-2-4bit
