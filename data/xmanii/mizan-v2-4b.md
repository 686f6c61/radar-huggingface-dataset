# xmanii/Mizan-v2-4B

## Resumen

Mizan v2 · 4B (میزان) es un modelo de decisión multimodal desarrollado por xmanii (proyecto Nimruz), afinado a partir de xmanii/Mizan-1.5-4B. No es un modelo generativo: recibe un registro (texto, JSON, un fotograma de cámara, la foto de un recibo o de un producto) junto con preguntas tipadas, y devuelve en una única pasada forward una probabilidad calibrada para cada respuesta permitida. Ese diseño elimina la generación de texto libre, el parseo posterior y las etiquetas alucinadas, y lo orienta a clasificación, moderación y inspección de calidad.

La versión 2 añade visión respecto a la 1.5, con un proyector visual de 0,37 GB que se suma al GGUF principal de 2,7 GB en 4 bits. Según la model card, en texto alcanza un 82,8 % de media sobre 3.000 registros reales en persa (frente al 82,0 % de Mizan 1.5 y a menos de un punto de Clef-Flash 9B), y en imagen logra entre un 86 % y un 99 % de exactitud balanceada en preguntas de presencia, zona, tipo de vehículo o importe de recibo sobre unas 1.600 imágenes no vistas durante el entrenamiento.

El modelo se distribuye bajo licencia Apache-2.0, soporta únicamente persa (fa) e inglés (en), y expone la misma interfaz de petición y respuesta que `/v1/systemone` (compatible con Jev/SystemOne) más una lista opcional `images`. Está pensado para ejecutarse con llama.cpp en CPU o GPU, incluidas tarjetas de gama de entrada de 8 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto + visión); la etiqueta de librería indica la familia qwen3_5, con proyector visual independiente. Detalles internos (número de capas, cabezas, tipo de atención) no disponibles |
| Parámetros totales | 4.539.265.536 (≈4,54 B) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible como máximo oficial; el ejemplo oficial de llama.cpp se lanza con `-c 8192` |
| Tipos de cuantización | GGUF: Q4_K_M (2,7 GB) y Q8; proyector visual en mmproj Q8_0 (0,37 GB). Pesos completos en safetensors |
| Idiomas soportados | Persa (fa) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (modelo completo) y GGUF (texto y texto+imagen) |
| Pipeline | image-text-to-text |
| Modelo base | xmanii/Mizan-1.5-4B (relación: finetune) |
| Tamaño del repositorio | 9,2 GB |
| Salida | Probabilidades calibradas por respuesta permitida, en una sola pasada forward (sin generación de texto) |

## Arquitectura y entrenamiento

Mizan v2 es un transformer multimodal denso de 4,54 B de parámetros construido por ajuste fino sobre Mizan-1.5-4B, al que se añade una torre de visión con un proyector de 0,37 GB. La inferencia no produce tokens de texto: el modelo puntúa un conjunto cerrado de respuestas candidatas definidas por el usuario mediante preguntas tipadas (`noul` para preguntas de sí/no y `choice` para elección entre criterios, según los ejemplos de la model card), y devuelve una probabilidad calibrada por cada opción. El error de calibración reportado es de 0,073 ECE.

La información sobre el entrenamiento de texto es limitada: la model card no detalla el número de tokens, la composición del corpus ni si hubo RLHF o DPO. Sí se especifica el origen de los datos de imagen: fotografías públicas de COCO, VisA y CORD a las que se aplicó un aspecto de cámara de vigilancia (superposiciones, modo nocturno, compresión). El autor advierte explícitamente de que no son grabaciones reales de CCTV. El benchmark de texto se evalúa sobre datos persas reales (SnappFood, Digikala, ParsiNLU, Pars-OFF, MASSIVE fa-IR, Digikala Mag, FarsTail). No se documentan innovaciones tipo decodificación especulativa ni atención lineal; la innovación principal es el esquema de decisión calibrada en una sola pasada.

## Capacidades

- Clasificación de texto con probabilidad calibrada: sentimiento de reseñas de comida, recomendación de producto, moderación de contenido ofensivo, enrutado de intención, enrutado de temática de artículos y verificación de afirmaciones contra un pasaje.
- Puntuación de preguntas sobre imágenes: presencia de persona, vehículo o animal (96–99 % de exactitud balanceada); tipo de vehículo o de animal (93 %); presencia dentro de una zona marcada con caja roja (92 % persona, 96 % vehículo); conteo de personas por rangos 0/1/2-3/4-9/10+ (86 %).
- Inspección documental: importe total de un recibo por encima de un umbral (99 %) y número de líneas del recibo (86 %).
- Inspección de calidad industrial: identificación del producto en la línea (100 % sobre productos VisA) y detección de producto defectuoso (75 %, solo para señalizar, no para rechazo automático).
- Respuesta multi-pregunta en una sola llamada: el cuerpo de la petición admite varias preguntas simultáneas con criterios distintos.
- Salida estructurada y determinista: al no generar texto, no hay parseo de etiquetas ni etiquetas inventadas.
- Compatibilidad de API con Jev/SystemOne mediante el endpoint `/v1/systemone`, con campo opcional `images`.
- Capacidades multilingües limitadas a persa e inglés.
- No soporta generación de texto libre, tool calling, uso como agente ni razonamiento multi-paso; esas capacidades no están documentadas ni se derivan de su diseño.

## Casos de uso

- Moderación de contenido en persa: enviar comentarios o reseñas de usuarios y obtener una probabilidad calibrada de que sean ofensivos (86,8 en Pars-OFF), lo que permite fijar umbrales de revisión automática frente a revisión humana con un ECE bajo.
- Enrutado de intención en asistentes conversacionales en persa: clasificar la intención del mensaje (79,0 en MASSIVE fa-IR) sin consumir generación de tokens, con latencias de decenas de milisegundos en GPU.
- Analítica de opinión de producto: clasificar sentimiento de reseñas (87,8 en SnappFood) y decidir recomendación de producto (76,0 en Digikala) en pipelines de e-commerce, usando la probabilidad como puntuación ordenable.
- Verificación de afirmaciones contra documentación: comprobar si una afirmación está respaldada por un pasaje (89,8 en FarsTail) para triaje de respuestas en sistemas de soporte o de atención al cliente.
- Vigilancia con cámara y zona marcada: sobre fotogramas de cámara, responder si hay una persona o un vehículo dentro de una caja roja dibujada en la imagen (92 % y 96 %), útil para alertas de zona restringida con revisión humana posterior.
- Aforo y conteo aproximado: estimar rangos de personas presentes (0, 1, 2-3, 4-9, 10+) con un 86 % de exactitud balanceada para métricas de ocupación, no para conteo exacto.
- Automatización de gastos: comprobar si el total de la foto de un recibo supera un umbral (99 %) y contar líneas del recibo (86 %) en flujos de aprobación de gastos.
- Inspección de calidad en fábrica: identificar el producto en la línea (100 %) y señalar posibles defectos (75 %) para encolar revisiones manuales, nunca como rechazo automático.
- Triaje de imágenes con gancho de cámara: el modelo espera aspecto de CCTV (superposiciones, noche, compresión); puede desplegarse en el borde con llama.cpp y una GPU de 8 GB para prefiltrar eventos antes de enviarlos a un sistema central.

## Benchmarks y rendimiento

Texto, sobre datos reales en persa (exactitud; ECE = error de calibración esperado):

| Tarea | Mizan v2 | Mizan 1.5 | Mizan 1.0 | Clef-Flash 9B | Jev (API) |
|---|---|---|---|---|---|
| Sentimiento de reseñas de comida (SnappFood) | 87,8 | 87,5 | 87,0 | 88,0 | 86,0 |
| Recomendación de producto (Digikala) | 76,0 | 73,8 | 74,8 | 76,2 | 74,8 |
| Pregunta de aspecto en persa (ParsiNLU) | 79,0 | 80,0 | 71,5 | 80,0 | 80,0 |
| Moderación de ofensivos (Pars-OFF) | 86,8 | 86,5 | 80,8 | 82,2 | 87,5 |
| Enrutado de intención (MASSIVE fa-IR) | 79,0 | 78,5 | 72,5 | 87,7 | 78,2 |
| Enrutado de temática de artículos (Digikala Mag) | 81,8 | 81,5 | 80,8 | 77,0 | 82,2 |
| Afirmación respaldada por pasaje (FarsTail) | 89,8 | 86,5 | 83,5 | 90,0 | 97,5 |
| Media | 82,8 | 82,0 | 78,7 | 83,0 | 83,7 |
| Error de calibración (ECE) | 0,073 | 0,064 | 0,110 | 0,078 | 0,092 |

Los builds GGUF obtienen 82,8 % (Q8) y 82,7 % (Q4) en el mismo benchmark.

Imagen, exactitud balanceada sobre unas 1.600 imágenes no usadas en entrenamiento:

| Pregunta | Exactitud balanceada | Notas |
|---|---|---|
| ¿Hay persona / vehículo / animal? | 96–99 % | fotogramas tipo cámara, día y noche |
| Tipo de vehículo / tipo de animal | 93 % | el más prominente, o "ninguno" |
| ¿Persona / vehículo dentro de la zona roja? | 92 % / 96 % | la zona se marca dibujando una caja roja |
| ¿Cuántas personas? (0, 1, 2–3, 4–9, 10+) | 86 % | |
| ¿Bolsa / teléfono o portátil visible? | 90 % / 93 % | |
| ¿Total del recibo por encima de X? | 99 % | fotos reales de recibos (CORD) |
| Número de líneas del recibo | 86 % | |
| ¿Qué producto hay en la línea? (fábrica) | 100 % | productos VisA |
| ¿Está defectuoso el producto? | 75 % | útil para señalizar, no para rechazo automático |
| ¿Dónde está el defecto? | No fiable | no usar todavía |

Velocidad declarada:

| Escenario | Mediana de latencia |
|---|---|
| NVIDIA L4, Q4, petición de texto | ≈80 ms |
| NVIDIA L4, Q4, petición con imagen | ≈470 ms |
| CPU, Q4, 16 núcleos (medido con Mizan 1.5, misma arquitectura) | ≈3 s por petición de texto |
| CPU, Q4, 2 núcleos (medido con Mizan 1.5, misma arquitectura) | ≈18 s por petición de texto |

## Requisitos de hardware

- VRAM estimada para inferencia (derivada de los tamaños de fichero publicados y del recuento de parámetros): Q4_K_M ≈2,7 GB para el GGUF de texto más ≈0,37 GB del proyector visual si se usan imágenes; Q8 ≈4,8 GB; pesos completos en fp16 ≈9,1 GB.
- GPU: el autor indica que basta una tarjeta de gama de entrada de 8 GB y reporta medidas sobre una NVIDIA L4. No se publican cifras para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, con cuantización Q4 o Q8 y siempre que la ventana de contexto usada no consuma en exceso la memoria disponible (el ejemplo oficial usa 8.192 tokens).
- Opciones de despliegue: llama.cpp (`llama-server`) con versión b11443 o superior, en CPU o GPU, con `--mmproj` para habilitar visión; la librería transformers para texto e imágenes; endpoint compatible con `/v1/systemone`. No se documentan despliegues con vLLM, TGI ni Ollama.
- Latencia y throughput: aproximadamente 80 ms por petición de texto y 470 ms con imagen en una L4 en Q4 (mediana); en CPU, 3 s con 16 núcleos y 18 s con 2 núcleos según medidas realizadas sobre Mizan 1.5 con la misma arquitectura. No se publican cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media en benchmark de texto en persa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mizan v2 · 4B | 4,54 B (denso, multimodal) | No disponible (ejemplo con 8192) | 82,8 % (ECE 0,073) | Apache-2.0 | Pesos en HuggingFace (safetensors y GGUF) |
| Clef-Flash 9B | 9 B (según el nombre) | No disponible | 83,0 % (ECE 0,078) | No disponible | Usado como referencia; enlace no disponible en la información proporcionada |
| Jev (API) | No disponible | No disponible | 83,7 % (ECE 0,092) | No disponible | Solo API |
| Mizan 1.5 · 4B | 4 B (según el nombre) | No disponible | 82,0 % (ECE 0,064) | No disponible en esta ficha | Modelo base, en HuggingFace |
| Mizan 1.0 | No disponible | No disponible | 78,7 % (ECE 0,110) | No disponible en esta ficha | En HuggingFace |

Mizan v2 queda a 0,2 puntos de Clef-Flash 9B y a 0,9 puntos de Jev pese a tener menos de la mitad de parámetros que Clef-Flash, pero su mejor calibración frente a Jev (0,073 frente a 0,092) no supera a la de su predecesor Mizan 1.5 (0,064).

## Limitaciones y advertencias

- No es un modelo generativo: no puede redactar texto libre, mantener conversaciones abiertas, ejecutar tool calling ni actuar como agente. Solo puntúa respuestas de un conjunto cerrado definido por el usuario.
- Cobertura lingüística limitada a persa e inglés; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Sesgos conocidos: no se documentan en la model card. Los datos de imagen provienen de COCO, VisA y CORD, por lo que hereda la distribución y los sesgos de esos conjuntos.
- Riesgo de alucinación: el diseño lo reduce al no generar texto, pero la calibración no es perfecta (ECE 0,073), de modo que las probabilidades pueden estar mal calibradas en dominios alejados de los datos de evaluación.
- Localización de defectos no fiable: el autor indica explícitamente que no debe usarse todavía. La detección de defecto se queda en un 75 %, apta solo para señalizar con revisión humana.
- Bug conocido en preguntas de zona con modo nocturno: en aproximadamente una cuarta parte de los ejemplos de zona, el modo nocturno se aplicaba después de dibujar la caja y la convertía en gris. Las preguntas de zona son fiables en fotogramas en color y más débiles en escala de grises; se corrige en la siguiente versión.
- Dominio visual: el entrenamiento usó fotos públicas con aspecto de cámara, no grabaciones reales de CCTV. El autor recomienda probarlo con unos cientos de fotogramas propios antes de automatizar nada.
- No debe usarse para identificar personas; el modelo solo se entrenó con preguntas de presencia y comportamiento.
- Licencia Apache-2.0, permisiva para uso comercial, sin restricciones adicionales documentadas. El autor no ofrece garantías sobre el rendimiento en producción.
- El repositorio no registra descargas ni valoraciones en el momento de la consulta, y la model card está truncada en la sección de inferencia con transformers, por lo que parte del código de ejemplo no está disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xmanii/Mizan-v2-4B
- Repositorio GGUF: https://huggingface.co/xmanii/Mizan-v2-4B-GGUF
- Demo Space: https://huggingface.co/spaces/xmanii/Mizan-demo
- Sitio del proyecto (Nimruz): https://nimruz.site
- Modelo base: https://huggingface.co/xmanii/Mizan-1.5-4B
- Paper TARAZ, benchmark persa de respuesta corta, que cita a xmanii (no trata específicamente de Mizan v2): https://arxiv.org/pdf/2602.22827
- El resto de resultados de la búsqueda web no guardan relación con este modelo y se han descartado.
