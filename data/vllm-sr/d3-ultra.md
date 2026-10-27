# vllm-sr/d3-ultra

## Resumen

d3-ultra es un modelo multimodal de decisión de 26.085.330.160 parámetros (26,09 B, de los cuales 0,46 B corresponden al codificador visual) publicado por vllm-sr, el equipo detrás de vLLM Semantic Router. No es un modelo generativo: recibe un estado (texto o JSON, opcionalmente acompañado de imágenes y vídeos) y un conjunto de preguntas cerradas —elegir entre opciones, sí/no, puntuar en una escala, localizar un objeto con una caja o seguir un objeto en un vídeo— y devuelve, para cada pregunta, una probabilidad por respuesta. Lee la entrada una sola vez por petición y responde hasta 255 preguntas sobre ella sin generar texto.

La propuesta encaja en la categoría que el autor denomina "modelos de decisión" (Decision 3.0): en lugar de un LLM que razona y escribe la respuesta, se emplea un cabezal discriminativo que produce directamente una distribución de probabilidad sobre las opciones. Eso lo hace especialmente adecuado como enrutador semántico, clasificador zero-shot o verificador visual dentro de pipelines, donde la latencia y la ausencia de texto libre son requisitos, no limitaciones. Soporta varias imágenes y vídeos por petición, incluidas imágenes dentro de las propias preguntas y opciones.

El modelo se distribuye con licencia Apache-2.0, en safetensors, y requiere `transformers==5.17.0` con `trust_remote_code`. La model card reporta 131.072 tokens de contexto por pregunta y un rendimiento de 304 ms a 2,16 s (mediana) para entre 1 y 255 preguntas sobre la misma imagen, servido en una única AMD Instinct MI325X. No se han publicado resultados de benchmarks académicos ni detalles del corpus de entrenamiento en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con capas de atención lineal (la model card menciona kernels `flash-linear-attention`); etiqueta de arquitectura `qwen3_5`; el detalle completo no se documenta |
| Parámetros totales | 26.085.330.160 (26,09 B), incluido un codificador visual de 0,46 B |
| Parámetros activos | No disponible (no se documenta una arquitectura MoE) |
| Longitud de contexto | 131.072 tokens por pregunta |
| Tipos de cuantización | No disponible; solo se publican pesos en safetensors, sin versiones GGUF, AWQ ni GPTQ oficiales |
| Idiomas soportados | No disponible (todos los ejemplos de la model card están en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tarea declarada | `zero-shot-classification` (modelo de decisión, `feature-extraction` en los tags) |
| Entradas | Texto o JSON, más imágenes y vídeos (varios por petición); imágenes también dentro de preguntas y opciones |
| Tipos de decisión | Choice (elección entre opciones), Yes/No, Score (escala), Box (imágenes y momentos de vídeo), Track (vídeo completo) |
| Preguntas por petición | Hasta 255 |
| Tamaño del repositorio | 52,2 GB |
| Descargas / likes | 203 / 31 (a fecha de la información) |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna más allá de tres pistas: la etiqueta `qwen3_5` en los metadatos, la presencia de un codificador visual de 0,46 B parámetros y la referencia explícita a "capas de atención lineal" (el quickstart instala `flash-linear-attention` como dependencia opcional para kernels rápidos en GPU). Eso apunta a un transformer híbrido con atención lineal en parte de las capas, combinado con un encoder visual y un mecanismo de fusión que permite mezclar texto, imágenes y vídeo en un mismo estado. La lectura se hace una vez por petición y de ella se derivan todas las respuestas, lo que sugiere un trunk compartido con cabezales específicos por tipo de decisión (clasificación sobre opciones, logit booleano, regresión de score, regresión de cajas y asociación temporal para tracking).

No hay datos públicos sobre el número de tokens de entrenamiento, la composición del corpus, el uso de RLHF/DPO ni las etapas de alineación. Tampoco se documenta si el entrenamiento es multitarea sobre los cinco tipos de decisión de forma conjunta o por etapas. La innovación declarada por el autor es de planteamiento más que de arquitectura: sustituir la generación de texto por una salida probabilística directa sobre preguntas cerradas, con soporte de contexto largo (131.072 tokens por pregunta) y de hasta 255 preguntas por lectura, lo que amortiza el coste del prefill. La model card no incluye un paper técnico ni una descripción del dataset.

## Capacidades

- Clasificación zero-shot con un conjunto arbitrario de opciones etiquetadas, devolviendo una probabilidad por opción en lugar de texto.
- Decisión booleana (sí/no) sobre el estado de entrada, útil para filtros y compuertas.
- Puntuación en escala (Score), para graduar intensidad, calidad o severidad sin generar explicación.
- Localización visual (Box): una caja por pregunta con una confianza que indica si el objeto está o no presente; una confianza cercana a cero se interpreta como ausencia.
- Localización temporal en vídeo: caja en un instante concreto o track a lo largo de todo el clip, con probabilidad de que el objetivo sea visible.
- Multimodalidad de entrada: varias imágenes y vídeos por petición, con imágenes también dentro de las preguntas y de las opciones (comparación foto contra referencia, elección entre imágenes).
- Procesamiento de estado en texto plano o JSON, lo que facilita integrarlo en sistemas existentes sin serialización adicional.
- Amortización por lectura única: todas las preguntas de una petición se responden del mismo pase, hasta 255.
- Contexto largo de 131.072 tokens por pregunta, suficiente para documentos extensos o transcripciones.
- No soporta generación de texto libre, tool calling ni razonamiento multi-paso explícito; su función en un agente es la de módulo de decisión o enrutador, no la de planificador.
- Cobertura multilingüe: no documentada.

## Casos de uso

- Enrutado semántico en producción: el propio ejemplo de la model card clasifica un ticket ("el total de la factura es incorrecto tras el cambio de plan") entre los equipos de facturación y soporte técnico, y evalúa si es urgente, en una sola llamada. Es el caso natural dentro de vLLM Semantic Router, donde se necesita una probabilidad calibrada por ruta y no una respuesta redactada.
- Clasificación de tickets y correo entrante: combinar varias preguntas (categoría, urgencia, idioma, sentimiento) sobre el mismo texto evita repetir el prefill y reduce coste frente a varias llamadas a un LLM generativo.
- Moderación y políticas de contenido: usar decisiones booleanas y de score para aceptar, revisar o bloquear, con un umbral ajustable por el operador y sin coste de generación.
- Inspección visual industrial: formular preguntas de tipo Box ("¿dónde está la pieza defectuosa?", "¿está la etiqueta en el envase?") y usar la confianza como señal de presencia o ausencia, integrable en un PLC o en un sistema de control de calidad.
- Análisis de vídeo y seguimiento: obtener un track de un objeto a lo largo de un clip con su probabilidad de visibilidad, útil en videovigilancia, análisis deportivo o monitorización de procesos.
- Comparación documento contra referencia: el ejemplo del Panteón y los grabados de Piranesi muestra el patrón de poner una foto en la pregunta y una imagen distinta en cada opción, aplicable a verificación de identidad visual, control de versiones de diseño o catalogación de archivo.
- Evaluación de imágenes generadas: puntuar con Score la calidad o el cumplimiento de un brief sin depender de un modelo generativo como juez, lo que reduce el sesgo de longitud y el coste por muestra.
- Decisión de siguiente acción en entornos simulados o videojuegos: el ejemplo del fútbol cenital (pasar, tirar o regatear) ilustra el uso como política de bajo nivel que elige entre un conjunto finito de acciones a partir de un frame y un estado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (ni MMLU, ni HumanEval, ni GSM8K, ni métricas de detección como mAP o COCO). El autor solo reporta rendimiento de servicio:

| Métrica | Valor |
|---|---|
| Preguntas por petición | 1 a 255 sobre la misma imagen |
| Latencia mediana | 304 ms (1 pregunta) a 2,16 s (255 preguntas) |
| Hardware de medida | 1× AMD Instinct MI325X |
| Modo de ejecución | `AutoModel` (Transformers), no servidor de inferencia |
| Contexto máximo | 131.072 tokens por pregunta |

No hay datos de throughput (peticiones por segundo), de precisión de las cajas (IoU, mAP) ni de calibración de las probabilidades, que son precisamente las métricas que un usuario necesitaría para decidir umbrales en producción.

## Requisitos de hardware

- Pesos en BF16: 26,09 B × 2 bytes ≈ 52,2 GB, cifra que coincide con el tamaño del repositorio. Añadiendo activaciones, caché de atención lineal y el codificador visual, el consumo realista ronda los 60-70 GB con contexto moderado, y más con contexto cercano a 131k tokens.
- GPU de datacenter recomendadas: AMD Instinct MI325X (192 GB HBM3e, hardware usado por el autor), NVIDIA H200 (141 GB), H100 80 GB y A100 80 GB. En A100/H100 de 80 GB cabe en BF16, pero el contexto largo deja poco margen.
- FP8: ≈26-28 GB de pesos, viable en L40S 48 GB, RTX 6000 Ada 48 GB o A100 40 GB con contexto corto. No se publican checkpoints FP8 oficiales, así que habría que cuantizar por cuenta propia.
- 4 bits: ≈13-15 GB de pesos, lo que en teoría permitiría RTX 4090 24 GB o RTX 5090 32 GB. Sin GGUF ni receta de cuantización publicada y con dependencia de `trust_remote_code`, este escenario no está verificado y debe tratarse como experimental.
- GPU de consumo: no cabe en BF16 en ninguna tarjeta de consumo actual (24-32 GB). Solo tiene sentido con cuantización agresiva y contexto reducido.
- Despliegue: el camino documentado es `AutoModel.from_pretrained(..., trust_remote_code=True)` con `transformers==5.17.0`, `torch`, `torchvision`, `pillow`, `opencv-python-headless`, `safetensors` y `accelerate`; `flash-linear-attention` es opcional para acelerar las capas de atención lineal. No se documenta soporte en vLLM, TGI, SGLang, llama.cpp ni Ollama: no disponible.
- Latencia: 304 ms para 1 pregunta y 2,16 s para 255 sobre la misma imagen en una MI325X con `AutoModel`. El throughput agregado y el comportamiento con vídeo o contexto largo no se reportan.

## Comparativa con modelos similares

No existe una categoría estándar de "modelo de decisión" con la que comparar directamente; las alternativas naturales son modelos multimodales generativos del mismo orden de tamaño y especialistas en detección zero-shot.

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d3-ultra | 26,09 B (0,46 B visión) | 131.072 tokens por pregunta | Discriminativo: probabilidad por opción, caja y track; sin generación | Apache-2.0 | HuggingFace, safetensors, `trust_remote_code` |
| Qwen2.5-VL-32B | ~32,8 B | 128k tokens (verificar) | Generativo multimodal; requiere prompting y parseo de la salida | Apache-2.0 | HuggingFace, amplio soporte en vLLM |
| Gemma 3 27B | ~27 B | 128k tokens (verificar) | Generativo multimodal | Licencia Gemma (no Apache-2.0) | HuggingFace, soporte amplio |
| Especialistas en detección zero-shot (Grounding DINO, OWLv2) | < 1 B | N/A | Solo detección de cajas; sin clasificación, score ni tracking unificado | Apache-2.0 / MIT según variante | HuggingFace, ampliamente desplegados |

La diferencia funcional es clara: los modelos generativos pueden responder preguntas abiertas, pero necesitan generar tokens y parsear la salida para obtener una probabilidad; d3-ultra devuelve la distribución directamente y unifica cinco tipos de decisión en una sola lectura. Los especialistas en detección son mucho más pequeños y rápidos en su tarea, pero no cubren clasificación, score ni tracking. Los datos de las filas alternativas provienen de sus fichas públicas y deben verificarse antes de usarlos en una decisión de compra o despliegue.

## Limitaciones y advertencias

- No genera texto: no sirve para resúmenes, redacción, diálogo abierto ni explicaciones. Cualquier caso de uso que necesite justificar la decisión requiere un modelo adicional.
- Idiomas no documentados: todos los ejemplos están en inglés y no hay evaluación multilingüe publicada. El rendimiento en castellano es una incógnita.
- Sin benchmarks ni datos de entrenamiento: no se puede evaluar la calibración de las probabilidades, el sesgo del corpus ni la precisión de las cajas. Los umbrales deben validarse con un conjunto propio antes de production.
- Riesgo de falsos positivos con confianza alta: al ser un modelo discriminativo, el fallo típico no es "alucinar texto" sino asignar una probabilidad elevada a una opción incorrecta, lo que puede pasar desapercibido en un pipeline automatizado.
- Detección limitada: una sola caja por pregunta, sin instancias múltiples ni máscaras de segmentación; el rendimiento en objetos ocluidos, pequeños o poco frecuentes no está documentado.
- Tracking sin métricas: no se reportan MOTA, IDF1 ni HOTA, así que la calidad del seguimiento en vídeo no es verificable a priori.
- Contexto largo con coste: 131.072 tokens por pregunta es el máximo, no el régimen habitual; con 255 preguntas y contexto largo el coste de atención crece de forma notable y la latencia reportada (2,16 s) corresponde a un caso concreto, no al peor escenario.
- Dependencia de código remoto: requiere `trust_remote_code=True` y una versión muy concreta de Transformers (5.17.0), lo que añade riesgo de seguridad y de reproducibilidad en producción.
- Sin cuantizaciones oficiales: no hay GGUF, AWQ ni GPTQ, lo que dificulta el despliegue en hardware de consumo y obliga a cuantizar por cuenta propia, con posible pérdida de calibración.
- Licencia Apache-2.0: permite uso comercial y modificación, pero conviene revisar los términos de los datos de entrenamiento, que no se documentan.
- Madurez: 203 descargas y 31 likes, con una model card que se corta en el ejemplo de código; el ecosistema (Transformers 5.17) es muy reciente y no hay validación independiente publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vllm-sr/d3-ultra
- Space oficial: https://huggingface.co/spaces/vllm-sr/d3-ultra
- API gratuita de demostración: https://decision.vllm-sr.ai
- Repositorio de vLLM Semantic Router: https://github.com/vllm-project/semantic-router
- Documentación de vLLM: https://docs.vllm.ai/en/latest/
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Sitio de vLLM: https://vllm.ai/
- Paper técnico de d3-ultra: no disponible en la información proporcionada
