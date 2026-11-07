# wanvideo/wan-3-0-prime

## Resumen

Wan 3.0 Prime (también denominado Wan 3.0 Video Prime, ID de modelo `wan3.0-video-prime`) es un modelo de generación de vídeo desarrollado por el equipo Tongyi Wan de Alibaba. Se presenta como la variante acelerada de la familia Wan 3.0: mantiene el conjunto de capacidades del modelo estándar (generación de vídeo a partir de texto, control de primer y último fotograma, referencias multimodales, edición y extensión de vídeo) pero con un enfoque en reducir el tiempo de generación para iteración creativa rápida.

El modelo acepta entradas de texto, imagen, vídeo y audio, y produce clips MP4 de entre 2 y 30 segundos a 30 fps, con resoluciones de 480p, 720p y 1080p. Una de sus características destacadas es la generación nativa de audio: diálogo, música de fondo y efectos de sonido se sintetizan junto con la imagen, y el audio puede desactivarse. Admite hasta 20 activos de referencia combinados (hasta 10 imágenes, 5 vídeos y 5 clips de audio).

Es relevante en el contexto actual de generación de vídeo porque unifica en un solo modelo tareas que habitualmente requieren pipelines separados (texto a vídeo, imagen a vídeo, referencias multimodales, edición y extensión temporal) y añade audio nativo sincronizado. La información pública disponible es fundamentalmente de interfaz y producto: la arquitectura, el número de capas y la escala de parámetros no se han desvelado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (estructura de red, número de capas y escala de parámetros no desvelados) |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | No disponible (el modelo se distribuye como servicio/API; el repositorio de Hugging Face tiene 0.0 GB) |

Especificaciones de interfaz verificadas (a fecha de 7 de noviembre de 2026, según la model card):

| Parámetro | Valor |
|---|---|
| Desarrollador | Alibaba Tongyi Wan team |
| ID de modelo | `wan3.0-video-prime` |
| Tareas | Texto a vídeo, primer fotograma, primer y último fotograma, referencias multimodales, edición, extensión |
| Entradas | Texto, imagen, vídeo, audio; ficheros o contenido de páginas web públicas |
| Salida | MP4, 30 fps, 480p / 720p / 1080p |
| Duración | 2–30 s o duración inteligente; con entrada de vídeo, entrada + salida ≤ 30 s |
| Relaciones de aspecto | Adaptativa y ratios 16:9, 4:3, 1:1, 3:4, 9:16 |
| Audio | Diálogo, música y efectos nativos; desactivable |
| Capacidad de referencia | Hasta 20 activos combinados: 10 imágenes, 5 vídeos, 5 audios |
| Duración de referencias | Vídeos: hasta 15 s combinados; audio: hasta 15 s combinados |
| Ficheros y páginas web | Un fichero o una página pública sin login; no combinables entre sí |
| Combinaciones de entrada | Los fotogramas estrictos no se pueden mezclar con referencias multimodales, ficheros ni páginas web |

## Arquitectura y entrenamiento

No se ha divulgado información sobre la arquitectura interna del modelo: ni el tipo de red (transformer de difusión u otra), ni el número de capas, ni la escala de parámetros, ni los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO). La model card indica explícitamente que "la arquitectura específica, el número de capas y la escala de parámetros no se han desvelado".

La información disponible describe el comportamiento funcional más que la construcción técnica. El modelo integra en un único sistema la generación de imagen en movimiento y la síntesis de audio (diálogo, música y efectos) dentro del mismo intervalo temporal, lo que sugiere una planificación conjunta de imagen y sonido. También soporta referencias multimodales heterogéneas (imágenes para apariencia, vídeo para movimiento, audio para sonido) y controles temporales estrictos de primer y último fotograma, además de edición y extensión de material existente. No hay datos públicos sobre innovaciones de decodificación, atención o entrenamiento.

## Capacidades

- Generación de vídeo a partir de texto con descripción de sujetos, acciones, escenario, cámara y sonido.
- Generación condicionada por primer fotograma y por primer y último fotograma.
- Generación con referencias multimodales: hasta 10 imágenes, 5 vídeos y 5 audios combinados (máximo 20 activos).
- Generación nativa de audio: diálogo, música de fondo y efectos de sonido, con opción de desactivarlo.
- Edición de vídeo: sustitución de elementos, cambios de estilo o revisiones de iluminación sobre material existente.
- Extensión temporal: desarrollo de eventos anteriores o posteriores al vídeo de origen.
- Control de duración (2–30 s o duración inteligente) y de relación de aspecto (16:9, 4:3, 1:1, 3:4, 9:16 y adaptativa).
- Salida en MP4 a 30 fps en 480p, 720p y 1080p.
- Aceptación de contenido de ficheros o de una página web pública sin login como referencia.
- Capacidades multilingües: limitadas al inglés según los metadatos del repositorio.

## Casos de uso

- Publicidad de producto con iteración rápida: fijar la referencia del producto y la composición, y comparar variantes de cámara (órbita frente a acercamiento lento) y de iluminación sin rehacer el brief completo, aprovechando la orientación a velocidad de Prime.
- Creación de variaciones de campaña: mantener sujeto, referencias y especificaciones de salida fijos mientras se cambia una sola variable (encuadre, ritmo o sonido) para evaluar alternativas con coste de revisión bajo.
- Vídeo social con audio integrado: generar clips verticales de 9:16 de pocos segundos con diálogo, música y efectos nativos, útiles para formatos de redes que exigen sonido desde el primer fotograma.
- Prototipado de cortometrajes: desarrollar escenas a partir de material existente mediante extensión temporal y control de primer y último fotograma, encadenando tomas dentro del límite de 30 s por generación.
- Edición y revisión de metraje: partir de un vídeo rodado y aplicar sustitución de elementos, cambio de estilo o ajuste de iluminación, conservando las partes que deben permanecer intactas.
- Combinación de material heterogéneo en un brief: usar imágenes de producto para apariencia, metraje para movimiento y audio para sonido, asignando un rol a cada activo para evitar instrucciones contradictorias.
- Previsualización para discusiones con cliente: generar rápidamente varias direcciones visuales de un mismo concepto para seleccionar una antes de invertir en producción, gracias al posicionamiento acelerado del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se han divulgado parámetros ni pesos; el repositorio de Hugging Face ocupa 0.0 GB y la model card marca `inference: false`).
- GPU recomendadas: no disponible.
- Ejecución en GPU de consumo: no disponible.
- Opciones de despliegue: el modelo se ofrece como servicio a través de Alibaba Cloud Model Studio (ID `wan3.0-video-prime`) y de plataformas de terceros como Kie AI; no se documenta despliegue local con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no se publican cifras concretas; la documentación describe únicamente una "velocidad de generación significativamente más rápida" respecto a Wan 3.0 estándar, sin valores medibles.

## Comparativa con modelos similares

| Modelo | Desarrollador | Entradas | Duración máx. | Resolución / fps | Audio nativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Wan 3.0 Prime | Alibaba Tongyi Wan | Texto, imagen, vídeo, audio | 30 s | Hasta 1080p / 30 fps | Sí | No disponible | API (Alibaba Cloud, Kie AI) |
| Wan 3.0 (estándar) | Alibaba Tongyi Wan | Texto, imagen, vídeo, audio | 30 s | Hasta 1080p / 30 fps | Sí | No disponible | API |
| Otros modelos de vídeo de la competencia | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La distinción principal entre Prime y el Wan 3.0 estándar, según la documentación, es el posicionamiento en velocidad y coste, no el conjunto de capacidades, que se describe como alineado entre ambos.

## Limitaciones y advertencias

- No se han divulgado arquitectura, parámetros ni datos de entrenamiento, lo que impide evaluar el modelo a nivel técnico o auditar su comportamiento.
- Idiomas: los metadatos indican únicamente inglés; no hay evidencia de soporte multilingüe en texto ni en diálogo generado.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es un riesgo directo para producción.
- Riesgo de alucinación visual y factual: la model card advierte de que los detalles de packaging, la identidad y las relaciones dentro del metraje de origen deben inspeccionarse en el resultado, y que las afirmaciones factuales, textos de producto y detalles de marca deben verificarse contra el material original.
- Sincronización labial y atribución de hablante: deben comprobarse en el clip final, según la propia documentación.
- Restricciones de entrada: los fotogramas estrictos no se pueden combinar con referencias multimodales, ficheros ni páginas web; con entrada de vídeo, la duración combinada de entrada y salida no puede superar los 30 s.
- Límites de referencia: 15 s combinados de vídeo y 15 s combinados de audio como máximo.
- No hay pesos publicados ni posibilidad documentada de ejecución local, lo que ata el uso a proveedores de API y a sus condiciones.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/wanvideo/wan-3-0-prime
- Alibaba Cloud Model Studio, Wan3.0-Video-Prime: https://www.alibabacloud.com/help/en/model-studio/wan3-0-video-prime
- Kie AI, Wan 3.0 Video Prime API: https://kie.ai/wan3.0-video-prime
