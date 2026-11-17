# xmanii/Mizan-v2-4B

## Resumen

Mizan v2 4B es un modelo de decisión multimodal con enfoque principal en persa (farsi), desarrollado por el autor xmanii bajo la marca Nimruz. Se trata de un fine-tune de Qwen/Qwen3.5-4B que no genera texto libre, sino que recibe un registro (texto, JSON o una imagen) junto con preguntas tipadas y devuelve, en un único forward pass, una probabilidad calibrada para cada respuesta permitida. Esto elimina el parseo de salidas y el riesgo de etiquetas alucinadas, algo crítico en tareas de moderación, inspección de calidad y enrutamiento.

El modelo combina comprensión de texto en persa e inglés con visión artificial orientada a fotogramas de cámara de seguridad, recibos y fotos de producto. Su relevancia actual radica en que ofrece una alternativa determinista y calibrada (ECE de 0,073) a los pipelines basados en generación de texto con LLM, con un tamaño de 4.539 millones de parámetros que cabe en GPUs de consumo y en CPU mediante cuantización.

La versión v2 añade capacidades de imagen respecto a Mizan 1.5, mantiene compatibilidad con la API `/v1/systemone` de Jev y SystemOne, y se distribuye bajo licencia Apache-2.0. El modelo base es Qwen3.5-4B, del que hereda la arquitectura transformer subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen/Qwen3.5-4B) con cabecera de decisión y proyector visual |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (los ejemplos de despliegue usan `-c 8192`) |
| Tipos de cuantizacion | GGUF Q4_K_M y Q8 disponibles; pesos safetensors en el repo principal |
| Idiomas soportados | fa (persa/farsi), en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo principal), GGUF (repo Mizan-v2-4B-GGUF) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer denso de 4.539 millones de parámetros, sobre el que se aplica un fine-tune orientado a decisión. En lugar de generar secuencias de texto, el modelo produce distribuciones de probabilidad sobre conjuntos de respuestas permitidas definidas por el usuario (tipos `noul` y `choice` en la API). Para las capacidades de imagen incorpora un proyector visual independiente de 0,37 GB (fichero `mmproj`) que se combina con el modelo principal en despliegues llama.cpp.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La model card indica que las imágenes de entrenamiento provienen de datasets públicos (COCO, VisA, CORD) a las que se aplicó un aspecto de cámara (overlays, modo nocturno, compresión), y que las evaluaciones de texto se realizaron sobre datos persas reales (SnappFood, Digikala, ParsiNLU, Pars-OFF, MASSIVE fa-IR, FarsTail). El modelo declara calibración explícita con un error de calibración esperado (ECE) de 0,073.

## Capacidades

- Clasificación y decisión calibrada: devuelve probabilidad por cada respuesta permitida en un solo forward pass, sin generación de texto.
- Comprensión de texto en persa e inglés: sentimiento, recomendación de producto, moderación de contenido ofensivo, enrutamiento de intenciones y verificación de afirmaciones contra un pasaje.
- Visión: detección de presencia de personas, vehículos y animales en fotogramas estilo cámara; tipología de vehículo y animal; conteo de personas por rangos (0, 1, 2–3, 4–9, 10+).
- Preguntas de zona: determina si una persona o vehículo está dentro de una caja roja dibujada sobre el fotograma.
- Lectura de recibos: verificación de total por encima de un umbral y conteo de líneas de detalle.
- Inspección de producto: identificación del producto en línea de fábrica y detección de defectos (con limitaciones).
- Compatibilidad con la API `/v1/systemone` de Jev/SystemOne, incluyendo un campo opcional `images`.
- Soporte de preguntas tipadas (`noul`, `choice`) con criterios personalizados definidos por el usuario.

## Casos de uso

- Moderación de contenido en persa: el modelo clasifica textos ofensivos con un 86,8 de media en Pars-OFF, integrándose en pipelines que necesitan una etiqueta calibrada por umbral en lugar de una generación de texto que requiera parseo.
- Enrutamiento de intenciones en asistentes conversacionales: con un 79,0 en MASSIVE fa-IR, puede asignar cada mensaje entrante a la intención correcta dentro de un conjunto predefinido, en un solo paso y con latencia baja (unos 80 ms por petición de texto en una L4 con Q4).
- Verificación de afirmaciones contra documentación: con 89,8 en FarsTail, sirve para comprobar si un pasaje respalda una afirmación, útil en sistemas de atención al cliente o RAG donde se necesita una decisión binaria calibrada.
- Vigilancia con cámaras de seguridad: responde a preguntas como si hay una persona o vehículo en una zona delimitada (92–96% de precisión balanceada) o cuántas personas hay (86%), procesando fotogramas con un proyector visual de 0,37 GB y aproximadamente 470 ms por imagen en una L4.
- Automatización de lectura de recibos: verifica si el total supera un umbral con un 99% de precisión sobre fotos reales del dataset CORD, adecuado para validación de gastos o control de tickets.
- Inspección de calidad en línea de fábrica: identifica el producto presente con un 100% en productos VisA y marca posibles defectos con un 75%, lo que permite priorizar revisiones humanas sin automatizar el rechazo.
- Clasificación de reseñas y recomendación de producto en comercio electrónico persa: con 87,8 en sentimiento (SnappFood) y 76,0 en recomendación (Digikala), puede alimentar sistemas de análisis de opinión o ranking de productos.

## Benchmarks y rendimiento

Resultados de texto sobre datos persas reales, según la model card:

| Tarea | Mizan v2 | Mizan 1.5 | Mizan 1.0 | Clef-Flash 9B | Jev (API) |
|---|---|---|---|---|---|
| Sentimiento de reseñas (SnappFood) | 87,8 | 87,5 | 87,0 | 88,0 | 86,0 |
| Recomendación de producto (Digikala) | 76,0 | 73,8 | 74,8 | 76,2 | 74,8 |
| Pregunta de aspecto en persa (ParsiNLU) | 79,0 | 80,0 | 71,5 | 80,0 | 80,0 |
| Moderación ofensiva (Pars-OFF) | 86,8 | 86,5 | 80,8 | 82,2 | 87,5 |
| Enrutamiento de intención (MASSIVE fa-IR) | 79,0 | 78,5 | 72,5 | 87,7 | 78,2 |
| Enrutamiento temático de artículos (Digikala Mag) | 81,8 | 81,5 | 80,8 | 77,0 | 82,2 |
| Afirmación respaldada por pasaje (FarsTail) | 89,8 | 86,5 | 83,5 | 90,0 | 97,5 |
| Media | 82,8 | 82,0 | 78,7 | 83,0 | 83,7 |
| Error de calibración (ECE) | 0,073 | 0,064 | 0,110 | 0,078 | 0,092 |

Los builds GGUF obtienen 82,8% (Q8) y 82,7% (Q4) en el mismo benchmark.

Resultados de imagen sobre unas 1.600 imágenes no vistas en entrenamiento (precisión balanceada):

| Pregunta | Precisión balanceada | Notas |
|---|---|---|
| ¿Hay persona / vehículo / animal? | 96–99% | fotogramas estilo cámara, día y noche |
| Tipo de vehículo · tipo de animal | 93% | el más prominente, o "ninguno" |
| ¿Persona / vehículo dentro de la zona roja? | 92% / 96% | caja roja dibujada sobre el fotograma |
| ¿Cuántas personas (0, 1, 2–3, 4–9, 10+)? | 86% | |
| ¿Bolsa · teléfono o portátil visible? | 90% · 93% | |
| ¿Total del recibo por encima de X? | 99% | fotos reales de recibos (CORD) |
| Número de líneas de detalle del recibo | 86% | |
| ¿Qué producto está en la línea? (fábrica) | 100% | productos VisA |
| ¿Está defectuoso el producto? | 75% | útil para marcar, no para rechazo automático; mantener humano en el bucle |
| ¿Dónde está el defecto? | no fiable | no usar todavía |

## Requisitos de hardware

- VRAM estimada: el modelo en Q4 ocupa 2,7 GB (solo texto) y requiere añadir 0,37 GB del proyector visual para imágenes, con lo que la inferencia multimodal en Q4 ronda los 3,1 GB de pesos.
- GPU recomendadas: NVIDIA L4 (mediciones de latencia del autor), así como cualquier GPU con al menos 6–8 GB de VRAM para Q4; A100 y H100 quedan sobredimensionadas para este tamaño, pero son válidas para despliegues de alta concurrencia.
- Cabe en GPU de consumo: sí, en Q4 y Q8 dentro de tarjetas con 8 GB o más (RTX 3060, 4060, 4070, 4090). En CPU también funciona mediante llama.cpp.
- Opciones de despliegue: llama.cpp (recomendado por el autor, versión b11443 o superior) con `llama-server` y la API `/v1/systemone`; el repo principal usa transformers y safetensors. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: en una NVIDIA L4 con Q4, aproximadamente 80 ms por petición de texto y unos 470 ms con imagen (mediana). Las cifras de throughput concurrente no están disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media en benchmark de texto | ECE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Mizan v2 4B | 4.539 M | no disponible | 82,8 | 0,073 | Apache-2.0 | Hugging Face (safetensors y GGUF) |
| Clef-Flash 9B | 9.000 M (aprox.) | no disponible | 83,0 | 0,078 | no disponible | no disponible |
| Jev (API) | no disponible | no disponible | 83,7 | 0,092 | no disponible | API |
| Mizan 1.5 | no disponible | no disponible | 82,0 | 0,064 | no disponible | Hugging Face |
| Mizan v3 3B | 3.000 M (aprox.) | no disponible | no disponible | no disponible | no disponible | Hugging Face (1,9 GB en 4-bit) |

Mizan v2 se sitúa a menos de un punto de Clef-Flash 9B y de Jev pese a tener la mitad de parámetros que Clef-Flash, con una calibración intermedia entre Mizan 1.5 y el resto. Su ventaja diferencial es la multimodalidad integrada y la licencia Apache-2.0.

## Limitaciones y advertencias

- No es un modelo generativo: solo responde a preguntas tipadas con respuestas predefinidas; no sirve para texto libre ni para diálogo abierto.
- Las imágenes de entrenamiento son fotos públicas (COCO, VisA, CORD) con aspecto de cámara, no CCTV real; el autor recomienda probar con varios cientos de fotogramas propios antes de automatizar.
- Problema conocido en preguntas de zona sobre fotogramas en modo nocturno: en aproximadamente un cuarto de los ejemplos de zona, un fallo convirtió la caja roja en gris; las preguntas de zona son fiables en color y más débiles en escala de grises.
- La detección de defectos de producto (75%) no es apta para rechazo automático; debe mantenerse un humano en el bucle. La localización del defecto no es fiable.
- No debe usarse para identificar personas; solo fue entrenado en preguntas de presencia y comportamiento.
- Riesgo de alucinación reducido por diseño al no generar texto, pero persisten errores de clasificación y calibración imperfecta (ECE 0,073).
- Cobertura lingüística limitada a persa e inglés; no se declaran otros idiomas.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-4B puede tener condiciones adicionales que conviene revisar.
- El contexto máximo no está declarado; los ejemplos de despliegue usan 8192 tokens, por lo que no se debe asumir una ventana mayor sin verificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xmanii/Mizan-v2-4B
- Repo GGUF: https://huggingface.co/Nimruz/Mizan-v2-4B-GGUF
- Demo Space: https://huggingface.co/spaces/xmanii/Mizan-demo
- Colección Mizan: https://huggingface.co/collections/Nimruz/mizan-persian-decision-models-6ace723fcd8ec7e9e06d063b
- Mizan v3 3B (solo texto): https://huggingface.co/Nimruz/Mizan-v3-3B
- Sitio del autor: https://nimruz.site
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
