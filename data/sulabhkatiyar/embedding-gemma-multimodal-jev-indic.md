# sulabhkatiyar/embedding-gemma-multimodal-jev-indic

## Resumen

EmbeddingGemma Multimodal JEV — Indic es un modelo de decisión tipada desarrollado por sulabhkatiyar sobre el modelo base google/embeddinggemma-2. No es un modelo generativo al uso: recibe un estado (texto, JSON, una imagen o un clip de voz) junto con una lista de preguntas tipadas y devuelve, en una sola pasada forward, una probabilidad para cada respuesta posible. Esto permite cubrir tareas de enrutamiento, detección de intención, moderación, detección de PII, detección de prompt injection, relevancia, análisis de sentimiento, NLI, VQA y clasificación de topic o idioma en audio sin cabezas específicas por tarea.

El modelo tiene aproximadamente 746 millones de parámetros (3,0 GB en fp32) y una ventana de contexto de hasta 2.048 tokens por secuencia. Soporta tres modalidades: texto (inglés e idiomas indios), imagen (una por estado, hasta 280 tokens de imagen) y voz (un clip de 16 kHz mono float32 de hasta 11,2 s). Su relevancia actual radica en que unifica múltiples tareas de clasificación y decisión bajo una misma interfaz tipada y un único conjunto de pesos, con cobertura explícita de 22 idiomas indios en audio y 11 en imagen.

La licencia es propietaria y restringida a investigación (egjev-mixed-research), lo que limita su uso comercial. El modelo se publicó en octubre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni likes en HuggingFace.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base google/embeddinggemma-2) con cabezas de decisión tipadas; torres de visión y audio del modelo base |
| Parámetros totales | 746.148.667 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens por secuencia |
| Tipos de cuantización | fp32 (por defecto, T4-safe); no se documentan otras |
| Idiomas soportados | Texto: inglés e idiomas indios (hi, bn, ta, te, mr, gu, kn, ml, pa, or, as, ur, ne, sa, brx, doi, ks, kok, mai, mni, sat, sd). Imagen: preguntas en inglés y 11 idiomas indios. Audio: 22 idiomas indios |
| Licencia | egjev-mixed-research (other, restringida a investigación) |
| Formato de pesos | safetensors (fp32) |

## Arquitectura y entrenamiento

El modelo parte de google/embeddinggemma-2 y afina tanto el cuerpo de texto como las cabezas de decisión. Las modalidades de imagen y audio se procesan a través de las torres de visión y audio del modelo base, sin cabezas específicas por tarea. La innovación principal es la interfaz de decisión tipada: en lugar de entrenar clasificadores separados, el modelo recibe en tiempo de petición un estado y una o varias preguntas de tipo `noul` (sí/no), `choice` (elección entre opciones) o `score` (niveles ordenados con nivel esperado). Las opciones y niveles se proporcionan en la propia petición, de modo que un mismo modelo cubre enrutamiento, intención, moderación, PII, prompt injection, relevancia, sentimiento, NLI, VQA y clasificación de topic o idioma en audio.

No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La documentación sí especifica que las preguntas que no caben junto al estado en una secuencia de 2.048 tokens se dividen automáticamente en pasadas adicionales. El modelo se distribuye en fp32 y el código de inferencia reside en la carpeta `code/` del repositorio, con requisitos de `torch>=2.10` y `transformers==5.20.2`.

## Capacidades

- Decisión tipada en una sola pasada: preguntas sí/no, elección entre opciones y puntuación por niveles ordenados con nivel esperado.
- Procesamiento de texto, JSON, imagen (una por estado, hasta 280 tokens de imagen) y audio (clip de 16 kHz mono float32 de hasta 11,2 s).
- Enrutamiento de intención y de tickets, incluyendo conjuntos de 20 y 77 intenciones.
- Detección de prompt injection, detección de PII y moderación de contenido.
- Detección de off-topic y evaluación de relevancia en búsqueda.
- Análisis de sentimiento e inferencia de lenguaje natural (NLI).
- Visual question answering con preguntas en inglés y 11 idiomas indios.
- Identificación de topic e idioma en audio para 22 idiomas indios.
- Decisiones de enrutamiento de herramientas y de llamadas a funciones.
- Multilingüe en texto (inglés e idiomas indios) y en las modalidades de imagen y audio según la cobertura indicada.
- No se documenta soporte de agentes multi-paso ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y una pregunta `choice` con las categorías disponibles (por ejemplo, facturación, envío, otros), devolviendo una distribución de probabilidad sobre cada categoría. Es adecuado porque las opciones se definen en la petición y no requiere reentrenamiento al cambiar el conjunto de rutas.
- Detección de solicitudes de reembolso: con una pregunta `noul` del tipo "¿Es esta una solicitud de reembolso?", el modelo devuelve la probabilidad de "sí", lo que permite umbralizar y derivar a un flujo específico con contexto de hasta 2.048 tokens.
- Moderación de contenido en comunidades: preguntas `noul` sobre toxicidad o contenido inapropiado, con resultados reportados de 81,5 % en moderación y 89,3 % en toxic-chat, útiles como primera capa de filtrado.
- Detección de PII en textos de entrada: el modelo alcanza un 94,3 % en el conjunto de evaluación de PII, por lo que puede emplearse como paso previo al envío de datos a otros servicios.
- Protección frente a prompt injection: con un 90,0 % en el conjunto de evaluación de inyección, puede integrarse en pipelines de aplicaciones LLM para marcar entradas sospechosas antes de pasarlas al modelo generativo.
- Enrutamiento de llamadas a herramientas: con un 94,3 % en decisiones de function-call (decision_eval_bfcl), puede seleccionar qué herramienta invocar a partir de la consulta del usuario y un conjunto de opciones definido en tiempo de petición.
- Clasificación de topic en audio: para clips de hasta 11,2 s en 22 idiomas indios, permite etiquetar llamadas o fragmentos de voz por temática (deportes, viajes, salud) sin un clasificador específico.
- VQA multilingüe: con una imagen y una pregunta en inglés o en uno de los 11 idiomas indios soportados, el modelo devuelve la probabilidad de cada respuesta candidata, útil en aplicaciones de accesibilidad o verificación de documentos.
- Filtrado de relevancia en búsqueda: con una pregunta `choice` sobre si un documento es relevante para una consulta, sirve como re-ranker ligero en pipelines de recuperación.

## Benchmarks y rendimiento

Resultados publicados en la model card (precisión en % para sí/no y choice; ρ de Spearman para score; todo en fp32):

| Área | Conjunto de evaluación | Preguntas | Sí/No | Choice | Score ρ |
|---|---|---:|---:|---:|---:|
| Inglés | decision-task mix, dev (dmix_v2_dev5k) | 4.970 | 89,7 | 70,1 | 0,731 |
| Inglés | JEV decision benchmark (jev_bench) | 600 | 79,6 | 58,7 | 0,824 |
| Inglés | typed decisions, test oficial (typed_decisions_test) | 2.000 | 72,7 | 60,7 | 0,645 |
| Inglés | prompt-injection detection (injection) | 600 | 90,0 | – | – |
| Inglés | PII detection (pii) | 600 | 94,3 | – | – |
| Inglés | content moderation (moderation) | 600 | 81,5 | – | – |
| Inglés | toxic-chat moderation (moderation_toxicchat) | 363 | 89,3 | – | – |
| Inglés | off-topic detection (off_topic) | 600 | 82,8 | – | – |
| Inglés | intent routing, 20 intents (routing_20) | 600 | – | 90,2 | – |
| Inglés | intent routing, 77 intents (routing_77) | 560 | – | 79,8 | – |
| Inglés | complaint routing (complaint_routing) | 600 | – | 82,3 | – |
| Inglés | tool routing (tool_routing) | 600 | – | 74,0 | – |
| Inglés | function-call decisions (decision_eval_bfcl) | 600 | – | 94,3 | – |
| Inglés | search relevance (search_relevance) | 600 | – | 62,2 | – |
| Idiomas indios | natural-language inference (IndicXNLI test) | 1.000 | – | 68,6 | – |

La información disponible no incluye datos de benchmarks para el resto de conjuntos de evaluación en idiomas indios, ni comparaciones directas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 3,0 GB, por lo que se necesita algo más de 3 GB de VRAM considerando activaciones y buffers; una GPU T4 es suficiente según la model card ("fp32 by default (T4-safe)").
- GPU recomendadas: NVIDIA T4 como mínimo documentado; A100, H100 o RTX 4090 aportan margen adicional para lotes mayores y para procesar imagen y audio.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 4-6 GB de VRAM, dado el tamaño de 746 M parámetros en fp32.
- Opciones de despliegue: el repositorio incluye código de inferencia propio (`egjev.model_eg2` y `egjev.infer.Predictor`) con requisitos `torch>=2.10` y `transformers==5.20.2`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI. El tokenizador y los procesadores de imagen y audio se descargan de google/embeddinggemma-2 en el primer uso.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo de referencia estructural:

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EmbeddingGemma Multimodal JEV — Indic | 746 M | 2.048 tokens | Texto, imagen, audio | egjev-mixed-research (investigación) | HuggingFace |
| google/embeddinggemma-2 (modelo base) | no disponible | no disponible | Texto, imagen, audio (torres del base) | no disponible | HuggingFace |
| Alternativas de clasificación zero-shot | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia egjev-mixed-research de tipo "other": restringida a investigación; no se autoriza explícitamente el uso comercial. Es imprescindible revisar los términos completos antes de cualquier despliegue en producción.
- El modelo es un clasificador de decisión, no un generador de texto: no produce respuestas abiertas ni razonamiento en lenguaje natural.
- El contexto está limitado a 2.048 tokens por secuencia; las preguntas que no caben se dividen en pasadas adicionales, lo que puede incrementar la latencia y fragmentar la coherencia entre preguntas.
- Solo admite una imagen por estado (hasta 280 tokens de imagen) y un clip de audio por estado (hasta 11,2 s, 16 kHz mono float32); no se pueden combinar imagen y audio en la misma petición.
- La cobertura de imagen se limita a preguntas en inglés y 11 idiomas indios; el texto cubre inglés e idiomas indios, sin soporte documentado de otros idiomas.
- Los resultados en algunos conjuntos son moderados (por ejemplo, 58,7 % en choice en jev_bench, 62,2 % en search_relevance o 68,6 % en IndicXNLI), por lo que conviene umbralizar y validar por tarea antes de producción.
- No se documentan sesgos conocidos, tasas de alucinación ni análisis de robustez fuera de los conjuntos de evaluación publicados.
- El modelo se distribuye únicamente en fp32; no se documentan versiones cuantizadas (GGUF, int8, etc.) que reduzcan requisitos de memoria.
- El repositorio no registra descargas ni likes en el momento de la ficha, lo que limita la evidencia de uso en producción por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sulabhkatiyar/embedding-gemma-multimodal-jev-indic
- Modelo base: https://huggingface.co/google/embeddinggemma-2
