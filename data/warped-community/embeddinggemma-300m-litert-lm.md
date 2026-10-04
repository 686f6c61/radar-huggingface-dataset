# warped-community/embeddinggemma-300m-litert-lm

## Resumen

`warped-community/embeddinggemma-300m-litert-lm` es un espejo (mirror) no oficial del modelo de embeddings `google/embeddinggemma-300m`, convertido al formato LiteRT/TFLite para su ejecución en dispositivos móviles. El repositorio lo publica el usuario `warped-community` como artefacto de apoyo para la aplicación Android "Warped", y su contenido se limita a redistribuir el fichero `embeddinggemma-300M_seq1024_mixed-precision.tflite` generado originalmente por el proyecto `litert-community/embeddinggemma-300m`. No se trata, por tanto, de un modelo entrenado o ajustado por el autor del repo: es una copia empaquetada con fines de despliegue embebido.

El modelo subyacente pertenece a la familia EmbeddingGemma de Google, una familia de modelos de recuperación densa construida sobre la arquitectura textual de Gemma 3, con aproximadamente 300 millones de parámetros. Su función no es generar texto, sino producir representaciones vectoriales (embeddings) de frases y párrafos, que después se comparan por similitud coseno para tareas de búsqueda semántica, recuperación aumentada (RAG), clasificación, agrupamiento o deduplicación. El repositorio ocupa 0,2 GB e incluye un único artefacto TFLite en precisión mixta con longitud de secuencia de 1024 tokens.

La relevancia de este espejo concreto es puramente práctica: permite ejecutar un modelo de embeddings multilingüe dentro de una app Android sin conexión a red y sin servidores, usando el runtime LiteRT (antes TensorFlow Lite) y los delegados de GPU/NPU del dispositivo. Para cualquier uso en producción conviene acudir a las fuentes oficiales (`litert-community/embeddinggemma-300m` o `google/embeddinggemma-300m`), ya que este repo no aporta ninguna validación adicional: registra 0 descargas y 0 likes en el momento de redactar esta ficha.

Nota metodológica: los datos marcados con "(base)" proceden de la documentación pública del modelo original `google/embeddinggemma-300m`, no de la model card de este mirror, que es extremadamente escueta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Gemma 3 adaptado a embeddings con pooling y cabezal de proyeccion (base); en este repo, artefacto LiteRT/TFLite de inferencia |
| Parametros totales | No disponible en la model card del mirror; la designacion del modelo base indica ~300 M (base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No declarada en el mirror; el fichero incluido se denomina `seq1024`, lo que sugiere ventana de 1024 tokens en esta conversion (base: 2048 tokens) |
| Tipos de cuantizacion | Precision mixta (`mixed-precision`) en el fichero TFLite incluido; el mirror no ofrece variantes adicionales |
| Idiomas soportados | No disponibles en la model card del mirror; el modelo base declara soporte para mas de 100 idiomas (base) |
| Licencia | `gemma` (Terminos de Uso de Gemma) |
| Formato de pesos | TFLite (`.tflite`) con tags LiteRT-LM; no se distribuyen safetensors, GGUF ni ONNX en este repo |
| Tamano del repositorio | 0,2 GB |
| Dimension de embedding | No disponible en el mirror; el modelo base usa 768 dimensiones con truncamiento Matryoshka (base) |
| Modelo base | google/embeddinggemma-300m |
| Fuente del artefacto | litert-community/embeddinggemma-300m (`embeddinggemma-300M_seq1024_mixed-precision.tflite`) |

## Arquitectura y entrenamiento

El mirror no documenta ninguna arquitectura propia ni proceso de entrenamiento: se limita a indicar que redistribuye el fichero TFLite del proyecto `litert-community`. Cualquier detalle sobre la arquitectura del modelo original (adaptación del decodificador de Gemma 3 a un codificador de embeddings, empleo de pooling sobre las representaciones finales, aprendizaje de representaciones Matryoshka para permitir dimensiones truncadas de 768/512/256/128, etc.) debe consultarse en la documentación de `google/embeddinggemma-300m` y no puede confirmarse a partir de la información de este repositorio.

En cuanto al proceso de conversión, el nombre del fichero (`embeddinggemma-300M_seq1024_mixed-precision.tflite`) indica dos decisiones técnicas concretas: una longitud de secuencia fijada en 1024 tokens para la versión LiteRT y el uso de cuantización de precisión mixta, que reduce el peso del artefacto (el repo completo ocupa 0,2 GB) manteniendo ciertas capas en mayor precisión para limitar la degradación de la calidad de los embeddings. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; estos datos corresponden al modelo original y no se reproducen aquí.

## Capacidades

- Generación de embeddings de texto (frases, párrafos y documentos cortos) para similitud semántica y recuperación densa. No genera texto: es un modelo de representación, no un LLM conversacional.
- Búsqueda semántica multilingüe: recuperación de pasajes por significado en lugar de coincidencia léxica exacta.
- Recuperación aumentada (RAG) en local, alimentando un índice vectorial sin enviar datos a servidores externos.
- Clasificación y agrupamiento (clustering) de textos mediante comparación de vectores, sin necesidad de reentrenar el modelo.
- Deduplicación y detección de near-duplicates en corpus de documentos.
- Ejecución en dispositivo: el artefacto TFLite está pensado para el runtime LiteRT en Android, con soporte de delegados de CPU, GPU y NPU.
- Soporte multilingüe: no confirmado para este mirror; el modelo base declara más de 100 idiomas (base).
- Tool calling / function calling: no disponible; no es una capacidad de un modelo de embeddings.
- Agentes y razonamiento multi-paso: no disponible.
- Vision y audio: no disponible.
- Modo "thinking": no aplica.

## Casos de uso

- Búsqueda semántica dentro de una app Android sin conexión: el modelo genera embeddings de las notas o documentos del usuario en el propio dispositivo y permite consultas por significado. Adecuado porque el artefacto TFLite está optimizado para ejecución embebida y evita enviar contenido privado a un servidor.
- RAG local en móvil: indexar la base de conocimiento de la aplicación (Ayuda, manuales, historial) con embeddings y recuperar los fragmentos relevantes para pasárselos a un LLM pequeño que también corra en el dispositivo. El modelo actúa como recuperador, no como generador.
- Caché semántica de respuestas: almacenar los embeddings de las preguntas ya respondidas y devolver la respuesta cacheada cuando la similitud coseno con una consulta nueva supera un umbral. Reduce el coste de inferencia en asistentes desplegados a escala.
- Clasificación de contenido por etiquetas: definir unas pocas frases representativas por categoría, calcular sus embeddings y asignar la categoría más cercana a cada texto entrante. Útil para triaje de tickets de soporte, etiquetado de correo o moderación básica, sin entrenamiento adicional.
- Deduplicación de grandes corpus: calcular embeddings por documento y agrupar los que superan un umbral de similitud para eliminar near-duplicates antes de entrenar o indexar. Reduce el ruido y el tamaño de los datasets de forma medible.
- Agrupamiento y análisis exploratorio: agrupar reseñas, incidencias o artículos por temática usando k-means sobre los vectores generados, como paso previo a un análisis cualitativo manual.
- Asistente de notas personales: relacionar automáticamente notas entre sí ("notas relacionadas") mostrando las de mayor similitud semántica, una función típica de apps de productividad que exige latencia baja y funcionamiento offline.
- Detección de similitud entre consultas de usuario para enrutado: decidir a qué flujo o intención corresponde una consulta comparándola con un conjunto de ejemplos canónicos, en sustitución de un clasificador entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del mirror no incluye ninguna métrica (MTEB, MIRACL, BEIR ni similares) ni comparaciones con otros modelos. Tampoco se documentan mediciones de latencia o throughput en dispositivos concretos. Cualquier cifra de rendimiento debe obtenerse de la documentación del modelo base `google/embeddinggemma-300m`, no de este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia, el repositorio completo ocupa 0,2 GB y contiene el fichero TFLite en precisión mixta, por lo que el modelo cabe holgadamente en la memoria de un dispositivo móvil actual; la memoria de trabajo real depende de la longitud de secuencia y del delegado utilizado.
- GPU recomendadas: no aplica en el sentido habitual de servidor. El destino son aceleradores móviles: CPU ARM, GPU integradas vía delegado GPU de LiteRT y NPUs compatibles (por ejemplo, a través de delegados específicos del fabricante).
- Compatibilidad con GPU de consumo: sí en el sentido de que no requiere GPU dedicada alguna. En un PC de sobremesa puede ejecutarse en CPU; no está pensado para A100/H100, donde resultaría enormemente ineficiente frente a un modelo de embeddings en formato PyTorch u ONNX.
- Opciones de despliegue: LiteRT (anteriormente TensorFlow Lite), MediaPipe (tarea Text Embedder), Google AI Edge, y el ecosistema Android de `litert-lm`. No es compatible con vLLM, TGI, llama.cpp u Ollama, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles. Dependen del dispositivo, del delegado (CPU/GPU/NPU), de la longitud de secuencia (fijada en 1024 en esta conversión) y del tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de embedding | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| warped-community/embeddinggemma-300m-litert-lm (este repo) | No disponible en el mirror (~300 M segun el nombre) | 1024 tokens (segun nombre del fichero) | No disponible | Gemma | TFLite, precision mixta, mirror de terceros |
| google/embeddinggemma-300m (upstream) | ~300 M (base) | 2048 tokens (base) | 768 con truncamiento Matryoshka (base) | Gemma | safetensors y variantes oficiales |
| litert-community/embeddinggemma-300m | ~300 M (base) | No disponible | No disponible | Gemma | TFLite (fuente del fichero de este repo) |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M (segun su model card) | 256 tokens (segun su model card) | 384 (segun su model card) | Apache-2.0 | safetensors, ONNX; muy extendido en servidor |
| BAAI/bge-m3 | 568 M (segun su model card) | 8192 tokens (segun su model card) | 1024 (segun su model card) | MIT | safetensors; orientado a servidor |
| intfloat/multilingual-e5-small | 118 M (segun su model card) | 512 tokens (segun su model card) | 384 (segun su model card) | MIT | safetensors; alternativa multilingue en servidor |

Advertencia: los datos de los modelos comparativos proceden de sus respectivas model cards públicas y no de la información proporcionada en esta búsqueda; conviene verificarlos antes de tomar decisiones de arquitectura. La comparación directa de calidad (por ejemplo, en MTEB) no puede hacerse porque este mirror no publica métricas, y tampoco se dispone de resultados de benchmark del modelo base en la información consultada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no razona de forma explícita y no soporta tool calling. Cualquier expectativa derivada de la etiqueta `litert-lm` que lo asocie a un LLM es incorrecta.
- Riesgo de alucinación: no aplica en el sentido clásico, pero sí existe el riesgo de recuperar pasajes poco relevantes si el umbral de similitud se fija mal; los embeddings no verifican la veracidad del contenido indexado.
- Límite de secuencia: la conversión incluida parece estar fijada en 1024 tokens. Textos más largos deben dividirse en fragmentos, con la pérdida de contexto que ello implica.
- Idiomas: la model card del mirror no declara ningún idioma. Aunque el modelo base anuncia cobertura de más de 100 idiomas, este extremo no está verificado en el artefacto redistribuido y puede degradarse con la cuantización de precisión mixta.
- Degradación por cuantización: la precisión mixta reduce el tamaño del fichero, pero puede producir pérdidas de calidad en los embeddings frente a los pesos originales en safetensors. No hay evaluación publicada que cuantifique esa pérdida en este artefacto.
- Licencia: se aplican los Terminos de Uso de Gemma, que permiten uso comercial sujeto a la política de usos prohibidos y a obligaciones de redistribución (entre ellas, hacer llegar los términos a los destinatarios). Revisar el texto completo antes de integrarlo en un producto.
- Mirror de terceros: el repositorio lo mantiene `warped-community` para una app concreta, con 0 descargas y 0 likes. No hay garantía de mantenimiento, de correspondencia exacta con el artefacto upstream ni de que se actualice si Google publica revisiones. Para producción, usar `litert-community/embeddinggemma-300m` o `google/embeddinggemma-300m` como fuente de verdad.
- Sin artefactos alternativos: no se ofrecen pesos en safetensors, GGUF u ONNX, ni variantes con distintas longitudes de secuencia o niveles de cuantización dentro de este repo.
- Sin datos de rendimiento: no hay benchmarks, latencias ni consumo energético publicados para este artefacto concreto, lo que impide estimar con rigor su comportamiento en un dispositivo antes de medirlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/warped-community/embeddinggemma-300m-litert-lm
- Fuente del artefacto TFLite: https://huggingface.co/litert-community/embeddinggemma-300m
- Modelo base: https://huggingface.co/google/embeddinggemma-300m
- La búsqueda web realizada no devolvió ningún resultado relevante: los únicos enlaces recuperados apuntan a YouTube (https://www.youtube.com/, https://music.youtube.com/, https://studio.youtube.com/, https://movies.youtube.com/) y no guardan relación con el modelo. No se dispone por tanto de papers, blogs, repositorios ni demostraciones adicionales verificables en la información proporcionada.
