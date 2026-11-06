# thinkspread/Qwen3.8-27B-Vision-CoreML-fp16

## Resumen

Qwen3.8-27B-Vision-CoreML-fp16 es un artefacto derivado de Qwen/Qwen3.8-27B que empaqueta únicamente el codificador visual (vision tower) del modelo multimodal, compilado para Core ML en precisión fp16 y optimizado para Apple Silicon. Lo publica el usuario thinkspread dentro del proyecto tempo9, un motor de inferencia que combina un GGUF del modelo de lenguaje con este codificador ejecutado a través de Core ML en la GPU o en el Neural Engine, en lugar de recurrir a un fichero mmproj. El resultado es un pipeline de visión-lenguaje funcional en Macs de 24 GB.

El modelo base declarado es Qwen3.8-27B, del que se hereda la licencia Apache 2.0. El repositorio ocupa 0,9 GB y contiene dos variantes del encoder (`qwen35_vit_b1024.mlmodelc` y `qwen35_vit_b4096.mlmodelc`) que comparten pesos y solo difieren en el tamaño de entrada, además de la tabla de embeddings posicionales y metadatos de exportación.

Su relevancia es práctica: permite responder preguntas sobre imágenes en local sobre hardware de consumo Apple, con el modelo de lenguaje cuantizado en Q4_K_M (16,8 GB) conviviendo con el encoder en un Mac de 24 GB. No es un modelo autónomo, sino un componente de inferencia que debe emparejarse exclusivamente con Qwen3.8-27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer (ViT) del modelo Qwen3.8-27B, compilado a Core ML; parches de 16×16, embeddings de salida de 5120 dimensiones |
| Parametros totales | no disponible (el repositorio contiene solo el codificador visual, 0,9 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo de lenguaje Qwen3.8-27B emparejado) |
| Tipos de cuantizacion | fp16 (Core ML); compatible con cualquier cuantización K-quant del GGUF del LM que cargue tempo9, p. ej. Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.8-27B) |
| Formato de pesos | `.mlmodelc` (Core ML compilado), `tower_pos_embed.f32`, `tower_aux.npz` |

## Arquitectura y entrenamiento

El artefacto es un codificador visual basado en transformer con tokenización por parches de 16×16 píxeles. Emite embeddings de anchura 5120, que es exactamente la dimensión del modelo de lenguaje Qwen3.8-27B, de ahí que solo pueda emparejarse con ese modelo. Se distribuyen dos variantes con pesos compartidos: una para hasta 1024 parches (aproximadamente 512×512 píxeles) y otra para hasta 4096 parches (aproximadamente 1024×1024 píxeles). Las imágenes de más de un megapíxel se reescalan manteniendo la relación de aspecto.

No se ha entrenado ningún modelo nuevo: es una conversión y compilación del vision tower original del modelo base a Core ML en fp16. La model card reporta la fidelidad numérica medida en la exportación frente al encoder fp32 de Hugging Face, con similitud coseno ponderada por norma de 0,99999 en la GPU y 0,99958 en el Neural Engine. No se detallan datos de entrenamiento, composición del dataset ni si el modelo base empleó RLHF o DPO; esa información corresponde a Qwen3.8-27B y no se incluye en este repositorio.

La innovación técnica es de despliegue: separar el codificador visual del fichero mmproj y ejecutarlo en el runtime nativo de Apple (Core ML) sobre GPU o Neural Engine, liberando la GPU para el modelo de lenguaje y aprovechando el Neural Engine para el cómputo visual.

## Capacidades

- Extracción de características visuales (pipeline declarado: `image-feature-extraction`) para alimentar al modelo de lenguaje Qwen3.8-27B.
- Respuesta a preguntas sobre imágenes (VQA) cuando se combina con el GGUF del LM en tempo9.
- Lectura de texto en imágenes (OCR): la model card verifica la transcripción exacta de tres líneas de un cartel sintético.
- Reconocimiento de formas y colores: verificado con un círculo rojo, un cuadrado azul y texto superpuesto.
- Procesamiento de una imagen por petición, enviada como URI `data:` en el campo `image_url` de `/v1/chat/completions`.
- Compatibilidad con cualquier cliente OpenAI mediante la API local de tempo9 en el puerto 11435.
- No soporta tool calling, agentes, audio ni otras modalidades por sí mismo; esas capacidades, si existen, dependen del modelo de lenguaje emparejado.

## Casos de uso

- Preguntas sobre imágenes en local en un Mac: cargar el GGUF Q4_K_M junto con este encoder en tempo9 y enviar imágenes por la API compatible con OpenAI, sin salir del equipo ni enviar datos a la nube.
- Digitalización de carteles y rótulos: el caso verificado en la model card (transcripción de "OPEN 9-5", "Closed Mondays" y un número de teléfono) encaja con la extracción de texto de señalética en fotografías.
- Asistencia visual para accesibilidad: describir formas, colores y texto de una imagen para generar descripciones en lenguaje natural mediante el LM emparejado.
- Prototipado de aplicaciones macOS con visión: integrar el encoder en apps que ya usan Core ML y quieran delegar el cómputo visual en el Neural Engine mientras el LM ocupa la GPU.
- Automatización de revisión de capturas o documentos escaneados: procesar imágenes de hasta 1024×1024 píxeles con la variante b4096 y obtener respuestas sobre su contenido.
- Evaluación de pipelines multimodales en Apple Silicon: comparar el rendimiento y la fidelidad del encoder en Core ML (GPU frente a Neural Engine) dentro de un flujo de investigación sobre inferencia local.
- Clasificación y filtrado previo de imágenes en un flujo mayor: usar los embeddings de 5120 dimensiones como entrada a un clasificador propio antes de invocar al LM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de fidelidad de exportación y una medida de velocidad de decodificación:

| Metrica | Valor |
|---|---|
| Similitud coseno (GPU) frente a encoder fp32 de HF | 0,99999 |
| Similitud coseno (Neural Engine) frente a encoder fp32 de HF | 0,99958 |
| Velocidad de decodificación (M5 Pro, 24 GB, Q4_K_M, greedy, thinking off) | ~14 tokens/s |

## Requisitos de hardware

- Plataforma: Apple Silicon con macOS 26 o posterior.
- Memoria: el GGUF Q4_K_M (16,8 GB) y este encoder caben juntos en un Mac de 24 GB con la configuración por defecto.
- Verificado en: Apple M5 Pro, 24 GB.
- Variable de entorno: tempo9 1.2.1 requiere `AS_METAL_DENSE_RESIDENCY=0`; sin ella se agota la memoria de GPU al cargar en un Mac de 24 GB. La corrección está en la rama principal del motor y la variable dejará de ser necesaria cuando se publique una versión que la incluya.
- Despliegue: exclusivamente mediante tempo9 (servidor local en `127.0.0.1:11435` con API compatible con OpenAI). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Cuantizaciones del LM: solo K-quants; tempo9 no carga i-quants y el UD-Q4_K_S de unsloth mezcla iq2_xs en los pesos de la FFN, por lo que se recomienda Q4_K_M de lmstudio-community.
- Latencia y throughput del encoder: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros encoders visuales compilados para Core ML ni alternativas comparables en parámetros, contexto o rendimiento. La única referencia interna es el propio encoder fp32 de Hugging Face del modelo base, usado como patrón de fidelidad numérica.

## Limitaciones y advertencias

- No es un modelo autónomo: solo funciona emparejado con Qwen3.8-27B, porque emite embeddings de 5120 dimensiones específicos de ese modelo.
- Una imagen por petición y únicamente como URI `data:`.
- Las imágenes de más de aproximadamente un megapíxel se reescalan, con posible pérdida de detalle en texto pequeño.
- Incompatibilidad con i-quants y con UD-Q4_K_S de unsloth en tempo9.
- Requiere macOS 26 o posterior y Apple Silicon; no hay soporte para otras plataformas.
- En tempo9 1.2.1 es obligatorio `AS_METAL_DENSE_RESIDENCY=0` en Macs de 24 GB.
- El repositorio tiene 0 descargas y 0 likes, y se publicó el 2 de noviembre de 2026; no hay evidencia de uso en producción ni validación comunitaria más allá de las dos imágenes sintéticas de la model card.
- Riesgo de alucinación y sesgos: no documentados en este repositorio; dependen del modelo de lenguaje Qwen3.8-27B y de sus datos de entrenamiento.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base enlazadas en la model card.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/thinkspread/Qwen3.8-27B-Vision-CoreML-fp16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Motor tempo9: https://github.com/thinkspread/tempo9
- GGUF recomendado: https://huggingface.co/lmstudio-community/Qwen3.8-27B-GGUF
