# thinkspread/Qwen3.5-35B-A3B-Vision-CoreML-fp16

## Resumen

Qwen3.5-35B-A3B-Vision-CoreML-fp16 es un componente de inferencia publicado por el usuario thinkspread: no es un modelo de lenguaje completo, sino el codificador visual (vision encoder) del modelo Qwen/Qwen3.5-35B-A3B de Alibaba Qwen, compilado para Core ML en precisión fp16. Su función es permitir que un GGUF del modelo base, ejecutado mediante el motor tempo9, responda preguntas sobre imágenes sin necesidad de cargar un fichero mmproj, delegando la torre de visión a la GPU o a la Neural Engine de Apple Silicon.

El modelo base Qwen3.5-35B-A3B es un transformer de arquitectura Mixture of Experts con 35.000 millones de parámetros totales y 3.000 millones activos por token (de ahí el sufijo A3B), con capacidades multimodales. Este repositorio aísla únicamente la parte visual y la empaqueta en dos variantes de `.mlmodelc` que comparten pesos y difieren en el tamaño de entrada: 1024 y 4096 parches de 16×16 píxeles.

Es relevante para desarrolladores que quieran desplegar un modelo multimodal grande en Mac con Apple Silicon aprovechando aceleración nativa (Core ML, Neural Engine) en lugar de la ruta habitual de llama.cpp con mmproj. El repositorio ocupa 0,9 GB y se distribuye bajo licencia Apache 2.0 heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer (encoder de Qwen3.5-35B-A3B) compilado a Core ML; modelo base MoE |
| Parametros totales | 35B en el modelo base; el encoder visual se distribuye como pesos compilados (recuento no disponible) |
| Parametros activos | 3B en el modelo base (MoE) |
| Longitud de contexto | no disponible (aplica al modelo de lenguaje, no al encoder) |
| Tipos de cuantizacion | fp16 (Core ML); el GGUF del modelo de lenguaje se usa con cualquier cuantizacion (ejemplo: Q5K-IQ3XXS) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlmodelc` (Core ML), `tower_pos_embed.f32`, `tower_aux.npz`, `tower_meta.json` |
| Dimension del embedding de salida | 2048 (ancho del modelo de lenguaje 35B-A3B) |
| Tamano de parche | 16×16 píxeles |
| Buckets de entrada | 1024 parches (≈512×512 px) y 4096 parches (≈1024×1024 px) |
| Plataforma | Apple Silicon, macOS 26 o superior |

## Arquitectura y entrenamiento

El repositorio no entrena nada: exporta el encoder visual del Qwen3.5-35B-A3B original a Core ML en fp16. El modelo base es un transformer con mezcla de expertos (35B totales, 3B activos) de la familia Qwen3.5, con torre de visión integrada. Cada tamaño de Qwen3.5 tiene sus propios pesos visuales, y este encoder emite embeddings de 2048 dimensiones, que es exactamente el ancho del modelo de lenguaje de 35B-A3B; por eso solo es compatible con ese tamaño y no con el 9B ni con otras variantes.

El encoder procesa la imagen en parches de 16×16 píxeles y aplica un escalado con reducción de resolución cuando la imagen supera aproximadamente un megapíxel (4096 parches), manteniendo la relación de aspecto. Se ofrecen dos grafos compilados que comparten pesos: uno para hasta 1024 parches (imágenes pequeñas, menor coste) y otro para hasta 4096. La tabla de embeddings posicionales se distribuye aparte en `tower_pos_embed.f32`. La precisión se midió en el momento de la exportación comparando la salida fp16 de Core ML contra el encoder fp32 de Hugging Face: similitud coseno ponderada por norma de 0,99985 en la GPU y 0,99089 en la Neural Engine, en el peor caso sobre las imágenes de referencia del exportador.

## Capacidades

- Extracción de características visuales para el modelo Qwen3.5-35B-A3B: genera embeddings de 2048 dimensiones que el modelo de lenguaje consume para responder preguntas sobre imágenes.
- Comprensión de imágenes: descripción de contenido, formas, colores, posiciones y texto presente en la imagen (OCR ligero, con limitaciones observadas).
- Ejecución acelerada en Apple Silicon mediante Core ML, en la GPU o en la Neural Engine.
- Dos resoluciones de trabajo: hasta 1024 parches (≈512×512 px) y hasta 4096 parches (≈1024×1024 px), con reducción automática de imágenes mayores.
- Integración con clientes OpenAI: el servidor tempo9 expone `/v1/chat/completions` y acepta imágenes como `image_url` con data URI.
- No incluye generación de texto, tool calling, agentes ni razonamiento multi-paso por sí mismo: esas capacidades dependen del GGUF del modelo de lenguaje con el que se empareja.
- Una imagen por petición.

## Casos de uso

- Preguntas y respuestas sobre imágenes en local en Mac: con tempo9 y un GGUF de Qwen3.5-35B-A3B, el encoder permite describir fotos, diagramas o capturas sin enviar datos a la nube, útil en entornos con requisitos de privacidad.
- OCR y extracción de texto de documentos escaneados: el caso verificado transcribe líneas de un cartel con precisión exacta; adecuado para digitalizar rótulos, tickets o formularios simples, aunque conviene validar la salida en textos densos.
- Asistentes de accesibilidad: describir el contenido de una imagen (formas, colores, disposición) para usuarios con discapacidad visual, ejecutando todo el pipeline en el propio equipo.
- Automatización de catalogación de imágenes: clasificación y descripción de lotes de fotos en flujos de trabajo locales sobre macOS, aprovechando la GPU para el encoder y liberando la Neural Engine si se necesita para el modelo de lenguaje.
- Prototipado de aplicaciones multimodales en Apple Silicon: integrar el encoder en apps macOS mediante Core ML y el servidor tempo9, sin depender de ficheros mmproj ni de infraestructura de servidor.
- Verificación visual en pipelines de control de calidad: comprobar presencia, color o posición de elementos en imágenes capturadas por cámaras, con la advertencia de que la lectura de texto pequeño puede fallar.
- Investigación sobre eficiencia en inferencia multimodal: comparar el rendimiento GPU frente a Neural Engine (0,99985 frente a 0,99089 de similitud coseno) para estudiar el compromiso entre precisión y liberación de recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta métricas de fidelidad del export y una prueba cualitativa:

| Metrica | Resultado |
|---|---|
| Similitud coseno Core ML fp16 vs. HF fp32 (GPU) | 0,99985 |
| Similitud coseno Core ML fp16 vs. HF fp32 (Neural Engine) | 0,99089 |
| Prueba cualitativa, cartel con tres líneas de texto | Transcripción exacta de las tres líneas; forma y color correctos |
| Prueba cualitativa, formas y texto "PIER 37" | Formas, colores y posiciones correctos; texto leído como "Pier 7" |

La prueba cualitativa se realizó en un Apple M5 Pro con 24 GB, tempo9 1.2.1, GGUF Q5K-IQ3XXS, decodificación greedy y modo thinking desactivado.

## Requisitos de hardware

- Plataforma obligatoria: Apple Silicon con macOS 26 o superior; no funciona en Intel ni en GPU NVIDIA.
- El encoder en sí ocupa 0,9 GB en disco; la VRAM o memoria unificada necesaria para el modelo de lenguaje depende del GGUF elegido (el ejemplo del autor usa Q5K-IQ3XXS de un modelo de 35B, que requiere bastante memoria unificada; el equipo de prueba tenía 24 GB).
- GPU recomendadas: cualquier chip de la familia M de Apple; el autor verificó en un M5 Pro de 24 GB.
- Cabe en equipos consumer de Apple Silicon; no aplica a GPU consumer de NVIDIA o AMD.
- Opciones de despliegue: servidor tempo9 (con soporte de API compatible con OpenAI en el puerto 11435) ejecutando el encoder vía Core ML; el modelo de lenguaje se sirve como GGUF.
- Latencia y throughput: no disponibles. El coste de prompt se estima en aproximadamente un token por cada 32×32 píxeles, más dos tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-35B-A3B-Vision-CoreML-fp16 (este) | 35B totales / 3B activos (base) | no disponible | Core ML fp16 | Apache 2.0 | Solo encoder visual; requiere GGUF del mismo tamaño y tempo9 |
| Qwen3.5-9B-Vision-CoreML-fp16 (thinkspread) | 9B (base) | no disponible | Core ML fp16 | Apache 2.0 | Misma función para el tamaño 9B; embeddings de otra dimensión, no intercambiable |
| Qwen/Qwen3.5-35B-A3B (original) | 35B totales / 3B activos | no disponible | safetensors (Hugging Face) | Apache 2.0 | Modelo completo con visión; requiere framework de inferencia estándar, no Core ML |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Solo es compatible con Qwen3.5-35B-A3B: cada tamaño de Qwen3.5 tiene sus propios pesos visuales y este encoder emite embeddings de 2048 dimensiones; no sirve para el 9B ni para otros modelos.
- Una sola imagen por petición, enviada como data URI; no admite múltiples imágenes ni URLs remotas en el mismo mensaje.
- Las imágenes de más de aproximadamente un megapíxel se reducen, lo que puede degradar la lectura de texto fino.
- El OCR no es fiable en todos los casos: en la prueba del autor, "PIER 37" se leyó como "Pier 7", aunque el modelo 9B acertó con su propio encoder.
- La ejecución en la Neural Engine reduce la fidelidad (coseno 0,99089 frente a 0,99985 en GPU); el servidor tempo9 usa la GPU por defecto.
- Requiere macOS 26 o superior y Apple Silicon; sin soporte para otras plataformas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2 de noviembre de 2026): madurez y soporte comunitario no verificados.
- No se han publicado datos sobre sesgos, alucinación o cobertura idiomática del encoder; el comportamiento final depende del modelo de lenguaje emparejado.
- Licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base; conviene revisar la licencia original de Qwen para obligaciones adicionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/thinkspread/Qwen3.5-35B-A3B-Vision-CoreML-fp16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B/blob/main/LICENSE
- Variante para 9B: https://huggingface.co/thinkspread/Qwen3.5-9B-Vision-CoreML-fp16
- GGUF de ejemplo usado en las pruebas: thinkspread/Qwen3.5-35B-A3B-Q5K-IQ3XXS-GGUF
- Repositorio del motor tempo9: https://github.com/thinkspread/tempo9
