# thinkspread/Qwen3.5-9B-Vision-CoreML-fp16

## Resumen

Qwen3.5-9B-Vision-CoreML-fp16 es una conversión del codificador visual del modelo Qwen/Qwen3.5-9B al formato Core ML en precisión fp16, publicada por el usuario thinkspread. No se trata de un modelo de lenguaje completo, sino de un componente específico: la torre de visión (vision tower) del modelo multimodal Qwen3.5-9B, compilada para ejecutarse en Apple Silicon (GPU o Neural Engine) mediante Core ML. Su función es permitir que un GGUF del modelo de lenguaje Qwen3.5-9B, ejecutado con la herramienta tempo9, pueda responder preguntas sobre imágenes sin necesidad de cargar un fichero mmproj convencional.

El interés de esta publicación es fundamentalmente práctico para el ecosistema de inferencia local en macOS. Al compilar el codificador visual en Core ML, se puede delegar el procesamiento de imágenes a la GPU o a la Neural Engine, liberando recursos y aprovechando aceleradores específicos del hardware de Apple. El repositorio ocupa 0,9 GB e incluye dos variantes del codificador (hasta 1024 y hasta 4096 parches), la tabla de embeddings posicionales y metadatos de exportación.

La licencia es Apache 2.0, heredada del modelo base. El modelo se publicó el 2 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni likes. La información disponible sobre el modelo base Qwen3.5-9B (arquitectura, datos de entrenamiento, benchmarks) no se detalla en la model card de esta conversión, por lo que varios apartados de la ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador visual (ViT) de Qwen3.5-9B compilado a Core ML; el modelo de lenguaje subyacente es Qwen3.5-9B (arquitectura no detallada en la informacion disponible) |
| Parametros totales | No disponible (el repositorio contiene solo el codificador visual, 0,9 GB en fp16) |
| Parametros activos | No aplica (no es MoE; el base Qwen3.5-9B no se describe como MoE en la informacion disponible) |
| Longitud de contexto | No disponible para el modelo base; el codificador procesa hasta 4096 parches de 16×16 (≈1024×1024 px) |
| Tipos de cuantizacion | El codificador se distribuye en fp16; el GGUF del modelo de lenguaje admite cuantizaciones como Q4_K_S (segun el ejemplo de uso) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (`.mlmodelc`), tablas `.f32` y `.npz`; el modelo de lenguaje se usa en GGUF |

## Arquitectura y entrenamiento

Esta publicación no entrena un modelo nuevo: exporta el codificador visual de Qwen3.5-9B a Core ML en fp16. El codificador es un transformer de visión que produce embeddings de 4096 dimensiones, coincidiendo con la anchura del modelo de lenguaje de 9B. Se ofrecen dos variantes que comparten pesos y difieren solo en el tamaño de entrada: `qwen35_vit_b1024.mlmodelc` para imágenes de hasta 1024 parches (≈512×512 px) y `qwen35_vit_b4096.mlmodelc` para hasta 4096 parches (≈1024×1024 px). Las imágenes mayores de aproximadamente un megapíxel se reescalan manteniendo la relación de aspecto.

El proceso de exportación incluye una medición de fidelidad frente al codificador original en fp32 de Hugging Face, usando similitud coseno ponderada por norma sobre imágenes de referencia. En la GPU de Core ML se alcanza 0,99993 y en la Neural Engine 0,99424. No se detallan en la información disponible los datos de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Extracción de características visuales: el codificador genera embeddings de 4096 dimensiones a partir de imágenes, que el modelo de lenguaje Qwen3.5-9B consume para responder preguntas.
- Respuesta visual a preguntas (VQA): combinado con el GGUF del modelo de lenguaje, permite describir imágenes, leer texto en ellas e identificar objetos.
- Procesamiento de una imagen por petición, enviada como URI `data:` en el campo `image_url` de la API compatible con OpenAI.
- Ejecución del codificador en GPU o Neural Engine de Apple Silicon, con el modelo de lenguaje ejecutándose en paralelo.
- Reconocimiento de texto en imágenes (según el ejemplo verificado de la model card: lectura de "PIER 37").
- No se documentan en la información disponible capacidades de tool calling, agentes, audio ni modo thinking para esta conversión concreta.

## Casos de uso

- Descripción de imágenes en local en macOS: un usuario ejecuta tempo9 con el GGUF Qwen3.5-9B y este codificador para obtener descripciones de fotografías sin enviar datos a la nube, aprovechando la GPU o la Neural Engine del Mac.
- Lectura de texto en capturas y documentos escaneados: el codificador procesa la imagen y el modelo de lenguaje transcribe o interpreta el texto, útil para digitalizar notas o extraer información de recibos.
- Asistentes de accesibilidad: generación de descripciones habladas de imágenes para personas con discapacidad visual, con inferencia completamente local en Apple Silicon.
- Automatización de catalogación de imágenes: integración en scripts que clasifiquen o etiqueten lotes de imágenes mediante la API `/v1/chat/completions` compatible con OpenAI, usando cualquier cliente estándar.
- Desarrollo y pruebas de pipelines multimodales: al ser un componente Core ML independiente, permite validar la integración visión-lenguaje en aplicaciones macOS sin depender de ficheros mmproj.
- Prototipado de aplicaciones de visión en el borde: aplicaciones de escritorio que necesiten responder preguntas sobre imágenes capturadas por la cámara o el portapapeles, con latencia baja al ejecutar el codificador en la Neural Engine.
- Verificación de contenido visual: análisis local de imágenes para detectar objetos o texto concreto antes de compartirlas, manteniendo la privacidad de los datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la fidelidad de la exportación frente al codificador original en fp32:

| Nivel de cómputo | Similitud coseno (peor caso) |
|---|---|
| GPU (Core ML) | 0,99993 |
| Neural Engine | 0,99424 |

Prueba funcional reportada: en un Apple M5 Pro con 24 GB, tempo9 1.2.1 y `unsloth/Qwen3.5-9B-GGUF` Q4_K_S, con decodificación greedy y thinking desactivado, una imagen sintética de 640×448 con un círculo rojo, un cuadrado azul y el texto "PIER 37" produjo la respuesta correcta con 312 tokens de prompt en total.

## Requisitos de hardware

- Hardware: Apple Silicon exclusivamente; la model card indica macOS 26 o posterior.
- Memoria: el repositorio del codificador ocupa 0,9 GB; el GGUF del modelo de lenguaje de 9B requiere memoria adicional según su cuantización (no se especifica en la información disponible).
- GPU recomendadas: no aplica el catálogo NVIDIA; se ejecuta en la GPU integrada o la Neural Engine de chips Apple Silicon (el ejemplo verificado usa un M5 Pro con 24 GB).
- Cabe en equipos de consumo: sí, en Macs con Apple Silicon; no es compatible con GPU NVIDIA ni con CPU x86 según la información disponible.
- Despliegue: servidor tempo9 (puerto 11435 por defecto) con API compatible con OpenAI; el modelo de lenguaje se carga desde Hugging Face como GGUF (por ejemplo, `unsloth/Qwen3.5-9B-GGUF:Q4_K_S`).
- Latencia y throughput: no disponibles; solo se documenta el coste de prompt de aproximadamente un token por cada 32×32 píxeles más dos.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-9B-Vision-CoreML-fp16 | Codificador visual Core ML para Qwen3.5-9B | Hasta 4096 parches (≈1024×1024 px) | Apache 2.0 | Hugging Face, 0 descargas |
| thinkspread/Qwen3.5-35B-A3B-Vision-CoreML-fp16 | Codificador visual Core ML para Qwen3.5-35B-A3B | No disponible | Apache 2.0 (heredada) | Hugging Face |
| Fichero mmproj de Qwen3.5-9B (formato GGUF) | Codificador visual para llama.cpp | No disponible | Apache 2.0 | Hugging Face |

La comparación con alternativas de la misma categoría (codificadores visuales para inferencia local) se limita a las variantes del mismo autor y al mmproj convencional; no se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Solo es compatible con Qwen3.5-9B: cada tamaño de Qwen3.5 tiene sus propios pesos de visión; usar este codificador con otro tamaño produce embeddings incompatibles (4096 dimensiones).
- Requiere macOS 26 o posterior y hardware Apple Silicon; no funciona en Linux, Windows ni GPU NVIDIA.
- Procesa una sola imagen por petición y únicamente como URI `data:`.
- Las imágenes mayores de aproximadamente un megapíxel se reescalan, con posible pérdida de detalle en texto pequeño.
- La fidelidad en Neural Engine (0,99424) es inferior a la de GPU (0,99993); para máxima precisión conviene usar el nivel GPU.
- No se documentan sesgos, tasas de alucinación ni comportamiento multilingüe del modelo base en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base Qwen3.5-9B; conviene revisar los términos del modelo base.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni soporte documentado más allá de la model card.
- El autor no detalla la arquitectura, el entrenamiento ni los benchmarks del modelo base, lo que limita la evaluación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thinkspread/Qwen3.5-9B-Vision-CoreML-fp16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Herramienta tempo9: https://github.com/thinkspread/tempo9
- Variante para Qwen3.5-35B-A3B: https://huggingface.co/thinkspread/Qwen3.5-35B-A3B-Vision-CoreML-fp16
- GGUF de ejemplo: https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
