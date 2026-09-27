# tibaf/embeddinggemma-300m-litert

## Resumen

`tibaf/embeddinggemma-300m-litert` es un espejo (mirror) del repositorio `litert-community/embeddinggemma-300m`, publicado por el usuario `tibaf` para que la aplicacion Memoyad disponga de una fuente de descarga estable. No se trata de un modelo nuevo: el autor indica explicitamente que aloja copias sin modificar de los ficheros originales y que no se han alterado pesos, grafos ni datos del tokenizador. El modelo subyacente es `google/embeddinggemma-300m`, un modelo de embeddings de frases desarrollado por Google DeepMind y convertido a formato LiteRT (TFLite) por la comunidad LiteRT de Google AI Edge.

La relevancia de esta ficha esta en el formato, no en los pesos. Frente a la distribucion habitual en safetensors, aqui se entregan artefactos TFLite pensados para inferencia en dispositivo (on-device), con un fichero de precision mixta de 179.131.736 bytes (unos 170,8 MB) y un tokenizador SentencePiece de 4.683.319 bytes (unos 4,5 MB). El repositorio completo ocupa 0,2 GB y la tarea declarada es similitud entre frases (sentence-similarity).

El caso de uso natural es la generacion de embeddings local en aplicaciones moviles o de escritorio, sin depender de una API externa. El artefacto publicado esta limitado a secuencias de 256 tokens, lo que condiciona el tamano maximo de los fragmentos a indexar. El repositorio no registra descargas ni "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de embeddings derivado de `google/embeddinggemma-300m` (familia Gemma); detalle exacto de capas no disponible en la informacion proporcionada |
| Parametros totales | 300 M por denominacion del modelo base; recuento exacto no disponible en la informacion proporcionada |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens en este artefacto (sufijo `seq256` del fichero TFLite); el modelo base admite ventanas mayores segun su documentacion publica |
| Tipos de cuantizacion | Precision mixta (`mixed-precision`) en TFLite; no se detalla la asignacion de bits por tensor |
| Idiomas soportados | No disponible en la informacion proporcionada para este repositorio; el modelo base esta documentado como multilingue |
| Licencia | Gemma Terms of Use (`license: gemma`), con Gemma Prohibited Use Policy asociada |
| Formato de pesos | TFLite / LiteRT (`embeddinggemma-300M_seq256_mixed-precision.tflite`) mas tokenizador SentencePiece (`sentencepiece_for_embeddinggemma.model`) |
| Tamano del artefacto | 179.131.736 bytes el modelo TFLite; 4.683.319 bytes el tokenizador; repositorio de 0,2 GB |
| Tarea declarada | `sentence-similarity` |
| Libreria | `litert` |

## Arquitectura y entrenamiento

El repositorio no aporta informacion sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. Lo unico verificable por los metadatos es la cadena de procedencia: los pesos originales son de `google/embeddinggemma-300m`, entrenados por Google DeepMind, y la conversion a LiteRT la realizo la comunidad LiteRT (Google AI Edge). El autor del mirror declara que no modifico pesos, grafos ni tokenizador, por lo que el comportamiento funcional deberia ser identico al del artefacto TFLite original.

La innovacion tecnica relevante en esta publicacion es la propia conversion a LiteRT con precision mixta, que empaqueta el modelo en un unico fichero TFLite de ~170,8 MB apto para ejecucion en CPU o acelerador NPU de dispositivos moviles. El sufijo `seq256` indica que el grafo exportado tiene fijada una ventana de 256 tokens, muy inferior a la que soporta el modelo base, un compromiso habitual para reducir memoria y latencia en inferencia on-device. No se documenta el esquema concreto de cuantizacion (que capas quedan en coma flotante y cuales en entero), ni si se aplico entrenamiento consciente de cuantizacion.

## Capacidades

- Generacion de embeddings de frases para tareas de similitud semantica, recuperacion y agrupamiento (segun la etiqueta `pipeline_tag: sentence-similarity`).
- Inferencia local en dispositivo mediante el runtime LiteRT, sin llamadas a red ni coste por token.
- Soporte multilingue heredado del modelo base, aunque la lista concreta de idiomas no se detalla en este repositorio.
- Ejecucion sobre un unico fichero TFLite con tokenizador SentencePiece adjunto, lo que simplifica el empaquetado en aplicaciones moviles.
- Capacidad de servir como componente de recuperacion en pipelines RAG locales.
- No se documentan en este repositorio capacidades de generacion de texto, razonamiento, codigo, vision, audio, tool calling, function calling ni modo de pensamiento; se trata de un modelo de representaciones, no de un modelo generativo de proposito general.

## Casos de uso

- Busqueda semantica on-device: la aplicacion indexa documentos locales y calcula embeddings de la consulta con el fichero TFLite; al ejecutarse en el propio dispositivo, los datos del usuario no salen del terminal.
- RAG local en aplicaciones moviles: se trocean notas o articulos en fragmentos de como maximo 256 tokens, se vectorizan con este modelo y se recuperan los fragmentos relevantes antes de pasarlos a un LLM, tambien local, para redactar la respuesta.
- Deduplicacion y agrupamiento de contenido: calcular embeddings de titulares, tickets de soporte o entradas de un CMS y aplicar clustering para agrupar elementos redundantes sin enviar datos a un servicio externo.
- Clasificacion zero-shot y enrutado: comparar el embedding de un texto entrante contra embeddings de etiquetas predefinidas (por ejemplo, categorias de incidencia) y asignar la mas cercana, con un umbral de similitud.
- Cache semantica de respuestas: almacenar pares pregunta-respuesta y, ante una consulta nueva, recuperar la respuesta previa mas similar, reduciendo llamadas a modelos generativos y coste de inferencia.
- Recomendacion de contenido: representar articulos, productos o publicaciones como vectores y calcular recomendaciones por similitud coseno dentro del dispositivo, sin construir un indice en servidor.
- Moderacion o filtrado por similitud: comparar texto de usuario contra una lista de patrones problematicos previamente vectorizada; al ser una tarea de similitud, sirve como primer filtro, no como clasificador definitivo.
- Deteccion de duplicados en corpus academicos o legales: indexar resumenes y detectar solapamiento entre documentos largos troceados en fragmentos de hasta 256 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio es un espejo de ficheros y su model card no incluye metricas (MTEB, MIRACL, BEIR, recuperacion o clasificacion). Tampoco se aportan mediciones de latencia o throughput del artefacto TFLite.

## Requisitos de hardware

- Almacenamiento: aproximadamente 175 MB para el modelo TFLite y el tokenizador juntos; 0,2 GB para el repositorio completo.
- Memoria en inferencia: no se especifica en la informacion disponible; como referencia de orden de magnitud, un grafo de 170,8 MB en precision mixta suele requerir del orden de 250-400 MB de RAM durante la ejecucion, cifra no confirmada por el autor.
- GPU: no requiere GPU dedicada; esta pensado para CPU movil y aceleradores NPU a traves de LiteRT. No hay datos de rendimiento en A100, H100 o RTX 4090.
- Cabe en cualquier dispositivo movil moderno (Android o iOS) con suficiente memoria libre; no esta pensado para ejecutarse en GPU de escritorio, aunque el runtime LiteRT tambien puede correr en CPU de escritorio.
- Opciones de despliegue: runtime LiteRT / TensorFlow Lite (interpretador C++ o Java/Kotlin, y enlace para iOS), con soporte opcional de delegados para GPU o NPU. No aplican aqui vLLM, TGI ni llama.cpp, ya que el formato no es safetensors ni GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `tibaf/embeddinggemma-300m-litert` (este repo) | 300 M (modelo base) | 256 tokens en el artefacto TFLite | TFLite / LiteRT, precision mixta | Gemma Terms of Use | Espejo no oficial de ficheros de `litert-community/embeddinggemma-300m` |
| `google/embeddinggemma-300m` | 300 M (modelo base) | Segun documentacion del modelo base (ventana mayor que 256) | safetensors / biblioteca de transformadores | Gemma Terms of Use | Fuente original de los pesos; sin conversion LiteRT |
| `litert-community/embeddinggemma-300m` | 300 M (modelo base) | 256 tokens en la variante `seq256` | TFLite / LiteRT | Gemma Terms of Use | Origen directo de los ficheros copiados en este repositorio |
| Alternativas de embeddings compactos | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la informacion proporcionada para establecer una comparacion con `all-MiniLM`, `bge-small` o `multilingual-e5-small` |

La unica diferencia sustantiva entre este repositorio y `litert-community/embeddinggemma-300m` es la disponibilidad y la estabilidad del alojamiento; los ficheros son los mismos.

## Limitaciones y advertencias

- Repositorio no oficial: se trata de un espejo publicado por un tercero (`tibaf`), no afiliado ni respaldado por Google. El mantenimiento y las actualizaciones dependen del autor del mirror.
- La model card original esta redactada en ingles, pero apenas aporta informacion tecnica: no describe datos de entrenamiento, sesgos ni evaluaciones.
- Ventana de contexto reducida: el artefacto publicado esta fijado a 256 tokens, por lo que textos mas largos deben trocearse, con la consiguiente perdida de contexto global.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y negativos en similitud: umbrales mal calibrados producen recuperaciones irrelevantes.
- Sesgos: no hay informacion sobre sesgos en la informacion proporcionada; al ser un modelo entrenado por Google sobre corpus web, cabe esperar sesgos propios de esos datos, no documentados aqui.
- Licencia Gemma: el uso comercial esta permitido bajo las Gemma Terms of Use, pero sujeto a la Gemma Prohibited Use Policy. Es obligatorio revisar ambas antes de integrar el modelo en un producto y conservar los avisos de atribucion.
- Cobertura de idiomas no verificada en este repositorio; las capacidades multilingues deben validarse con datos propios antes de asumirlas en produccion.
- Sin garantias de integridad: el mirror publica hashes SHA-256 en la model card pero aparecen como marcadores de posicion (`<sha256>`), por lo que no es posible verificar la correspondencia bit a bit con los ficheros originales usando esa tabla.
- Fecha de creacion y actualizacion del repositorio: 27 de septiembre de 2026, con 0 descargas y 0 "likes" en el momento de la consulta, lo que indica que no ha pasado por un proceso de revision de la comunidad.
- En produccion conviene descargar los ficheros desde `litert-community/embeddinggemma-300m` o desde el repositorio del modelo base para evitar dependencias de un espejo no oficial.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tibaf/embeddinggemma-300m-litert
- Repositorio original en LiteRT: https://huggingface.co/litert-community/embeddinggemma-300m
- Modelo base (pesos originales de Google DeepMind): https://huggingface.co/google/embeddinggemma-300m
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- Copia de los terminos incluida en el repositorio: `GEMMA_TERMS_OF_USE.md`
- Aplicacion Memoyad, destinataria del espejo: https://memoyad.com
- Nota sobre la busqueda web: los resultados recuperados no guardan relacion con el modelo (listados de escorts en Paris) y se han descartado por no aportar informacion tecnica. No se han localizado papers, blogs ni demos adicionales en la busqueda realizada.
