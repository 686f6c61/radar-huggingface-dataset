# zzlynxSG/MERaLiON-S4.5-E2B

## Resumen

MERaLiON-S4.5-E2B es un modelo multimodal de tipo «imagen + audio + vídeo → texto» orientado al sudeste asiático, publicado por el usuario zzlynxSG. Se obtiene mediante post-entrenamiento de aisingapore/Gemma-SEA-LION-v4.5-E2B-IT (a su vez construido sobre Gemma 4 E2B) con ajuste fino supervisado (SFT) seguido de una alineación cultural basada en GRPO. Los pesos publicados son pesos completos, por lo que no es necesario cargar adaptadores.

El modelo acepta texto acompañado opcionalmente de una imagen, un clip de audio de hasta 30 segundos o un vídeo muestreado a 1 FPS con un máximo de 30 fotogramas (incluyendo su propia pista de audio), y genera texto. Forma parte de una pareja de modelos hermanos construidos con la misma receta sobre bases distintas: MERaLiON-G4-E4B (4,5B efectivos, 8B con embeddings) y este MERaLiON-S4.5-E2B (2,3B efectivos, 5,1B con embeddings).

Es relevante ahora porque aplica refinamiento por refuerzo (GRPO) a la alineación cultural y al soporte multilingüe de lenguas del sudeste asiático, un área poco cubierta por los modelos multimodales occidentales. Ahora bien, la propia model card lo etiqueta como alfa de investigación y no apto para producción, y su licencia restringe el uso a investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión + audio + vídeo → texto), derivada de Gemma 4 E2B vía SEA-LION v4.5; detalles de capas y atención no disponibles |
| Parametros totales | 5,1B incluyendo embeddings |
| Parametros activos | 2,3B efectivos (carga condicional de parámetros; no es un MoE clásico con enrutador) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la información proporcionada; los pesos se distribuyen en precisión completa para transformers |
| Idiomas soportados | en, zh, id, ms, th, ta |
| Licencia | other / research-only (uso comercial no permitido); modelo base con su propia licencia (MIT para la base de este modelo) |
| Formato de pesos | pesos completos para transformers (`AutoModelForMultimodalLM`), sin adaptadores; formato de serialización exacto no disponible |
| Pipeline | any-to-any (en la práctica, any-to-text) |
| Modalidades de entrada | texto, imagen (≤ 512×512 píxeles en post-entrenamiento), audio (≤ 30 s, 16 kHz mono), vídeo (1 FPS, ≤ 30 fotogramas, con pista de audio propia) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que el modelo parte de `aisingapore/Gemma-SEA-LION-v4.5-E2B-IT` (Gemma 4 E2B, con 2,3B parámetros efectivos y 5,1B incluyendo embeddings). El post-entrenamiento consiste en ajuste fino supervisado seguido de una alineación cultural mediante GRPO (Group Relative Policy Optimization). El autor indica que el método sigue el de dos papers citados en la model card (identificador arXiv:2602.23730), entrenando sobre una versión ampliada de los datos empleados en esos trabajos.

La receta está especializada en el sudeste asiático, lo que se refleja en el conjunto de idiomas soportados (inglés, chino, indonesio, malayo, tailandés y tamil) y en la fase de alineación cultural. Los procesadores de entrada imponen límites concretos: imágenes de hasta 512×512 píxeles, audio de hasta 30 segundos a 16 kHz mono y vídeo muestreado a 1 FPS con un máximo de 30 fotogramas, con extracción de la pista de audio mediante ffmpeg/ffprobe. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases adicionales de RLHF o DPO más allá del GRPO mencionado.

## Capacidades

- Generación de texto condicionada por imagen: descripción detallada, respuesta a preguntas visuales y extracción de información de la escena.
- Comprensión de audio y reconocimiento automático del habla (ASR): transcripción de clips de hasta 30 segundos, incluida la modalidad de turno solo-audio sin instrucción de texto.
- Comprensión de vídeo de corta duración: resumen y descripción de secuencias de hasta 30 fotogramas a 1 FPS, con la pista de audio asociada.
- Capacidades multilingües en inglés, chino, indonesio, malayo, tailandés y tamil, con alineación cultural específica del sudeste asiático obtenida por GRPO.
- Conversación multi-turno mediante plantilla de chat (`apply_chat_template`) con contenido mixto de imagen, audio, vídeo y texto.
- Modo de decodificación configurable: muestreo recomendado (temperatura 1.0, top_k 64, top_p 0.95, repetition penalty 1.1, bloqueo de 3-gramas) o decodificación voraz para evaluación.
- No se documenta soporte de tool calling, function calling, modo «thinking» ni capacidades de agente multi-paso en la información disponible.

## Casos de uso

- Transcripción de audio de reuniones o notas de voz: el modelo acepta directamente una forma de onda mono a 16 kHz de hasta 30 segundos y devuelve la transcripción, lo que permite integrarlo en un pipeline de ASR para fragmentos cortos sin un modelo específico adicional.
- Subtitulado y resumen de clips cortos: con vídeo muestreado a 1 FPS (≤ 30 fotogramas) y su pista de audio, se puede generar un resumen textual o una descripción de la secuencia para indexing de archivo audiovisual.
- Descripción de imágenes para accesibilidad: dada una imagen de hasta 512×512 píxeles, el modelo produce descripciones detalladas que pueden alimentar lectores de pantalla o metadatos alt-text.
- Investigación en alineación cultural: el modelo sirve como banco de pruebas para estudiar cómo el GRPO afecta al conocimiento cultural del sudeste asiático, comparando sus salidas con las del modelo base sin post-entrenar.
- Procesamiento de contenido multilingüe regional: clasificación, resumen o extracción de información de documentos e imágenes en indonesio, malayo, tailandés o tamil, aprovechando la cobertura idiomática del modelo base.
- Evaluación comparativa de modelos multimodales pequeños: al ser un modelo de 2,3B efectivos con soporte de imagen, audio y vídeo, resulta útil como línea base en experimentos académicos sobre eficiencia de parámetros en tareas any-to-text.
- Prototipado de asistentes de atención al cliente con entrada mixta: en un entorno de laboratorio, se puede probar la combinación de una captura de imagen y una consulta de texto en un mismo turno conversacional, siempre que no se despliegue con usuarios reales dada la licencia y el estado alfa.

## Benchmarks y rendimiento

La model card indica que el autor realizó su propia evaluación sobre datos reservados, con los mismos prompts y decodificación voraz para cada modelo base y su versión post-entrenada, y señala explícitamente que esas cifras no son las reportadas en los papers. Sin embargo, los resultados numéricos no están incluidos en la información proporcionada (la sección de evaluación aparece truncada).

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16, en torno a 10-11 GB para los 5,1B parámetros totales; en cuantización de 8 bits, aproximadamente 5-6 GB; en 4 bits, alrededor de 3-4 GB. Son estimaciones por tamaño, no cifras publicadas por el autor.
- GPU recomendadas: A100 o H100 para evaluación a precisión completa y procesamiento por lotes; RTX 4090 (24 GB) o RTX 3090 (24 GB) para fp16 sin problemas; RTX 4060 Ti de 16 GB o RTX 4080 para fp16 ajustado.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más usando cuantización de 8 o 4 bits; en 16 GB o más, a precisión completa.
- Opciones de despliegue: `transformers` 5.5 o superior con `AutoModelForMultimodalLM` y `AutoProcessor` (con `trust_remote_code=True`), junto con `torch` 2.6.0, `accelerate`, `librosa`, `decord`, `pillow` y `ffmpeg`/`ffprobe` en el PATH. El repositorio incluye `inference.py` con el preprocesado exacto de entrenamiento y evaluación. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MERaLiON-S4.5-E2B | 2,3B efectivos / 5,1B con embeddings | no disponible | imagen, audio, vídeo → texto | research-only | HuggingFace (zzlynxSG) |
| MERaLiON-G4-E4B | 4,5B efectivos / 8B con embeddings | no disponible | imagen, audio, vídeo → texto | research-only en los pesos post-entrenados; base Apache-2.0 | HuggingFace (zzlynxSG) |
| aisingapore/Gemma-SEA-LION-v4.5-E2B-IT (base) | 2,3B efectivos / 5,1B con embeddings | no disponible | según modelo base (no detallado aquí) | MIT | HuggingFace (AI Singapore) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada. Como alternativas de la misma categoría (modelos multimodales pequeños con audio y visión) podrían considerarse otros modelos any-to-any del ecosistema abierto, pero no se aportan cifras que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia research-only: el uso comercial está expresamente prohibido. La restricción se aplica a los pesos post-entrenados, aunque el modelo base conserve su propia licencia (MIT en este caso).
- Estado alfa: el autor lo declara no apto para producción y advierte de que no se realizó alineación de seguridad ni red-teaming adicional más allá de lo que recibió el modelo base.
- Alucinación: la model card advierte de detalles culturales, visuales y de entidades nombradas inventados o incorrectos.
- Errores de transcripción: el ASR puede transcribir mal el habla, especialmente en las lenguas regionales del sudeste asiático.
- Sesgos y contenido dañino: puede producir texto sesgado o perjudicial, y rechazar peticiones válidas.
- Límites de entrada estrictos: audio de 30 segundos como máximo e imágenes de 512×512 píxeles en el post-entrenamiento; los vídeos se limitan a 30 fotogramas a 1 FPS, lo que restringe secuencias largas o de movimiento rápido.
- Cobertura idiomática limitada a seis idiomas (en, zh, id, ms, th, ta); no se documenta soporte de español ni de otras lenguas europeas.
- No debe usarse para decisiones médicas, legales, financieras o de seguridad, ni para decisiones que afecten a personas.
- La longitud de contexto no está documentada, lo que impide planificar cargas de trabajo con documentos largos.
- No se documenta soporte de tool calling ni de razonamiento agéntico multi-paso, por lo que no debería asumirse en un diseño de sistema.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zzlynxSG/MERaLiON-S4.5-E2B
- Modelo base: https://huggingface.co/aisingapore/Gemma-SEA-LION-v4.5-E2B-IT
- Modelo hermano MERaLiON-G4-E4B: https://huggingface.co/zzlynxSG/MERaLiON-G4-E4B
- Licencia del modelo: https://huggingface.co/zzlynxSG/MERaLiON-S4.5-E2B/blob/main/LICENSE
- Referencia arXiv citada en las etiquetas del repositorio: arXiv:2602.23730 (no se dispone de la URL directa en la información proporcionada)
- Repositorio de código: el script `inference.py` se distribuye dentro del propio repositorio de HuggingFace; no se han encontrado otros repositorios, papers, blogs o demos en la búsqueda web disponible.
