# zzlynxSG/MERaLiON-Omni-MM-10B

## Resumen

MERaLiON-Omni-MM-10B es un modelo multimodal de unos 10.783 millones de parámetros (10,78 B) desarrollado por el usuario zzlynxSG que acepta entradas de imagen, vídeo y audio, y genera texto en cinco idiomas del sudeste asiático: inglés, mandarín, indonesio, malayo y tailandés. Se construye combinando el backbone audio-lenguaje MERaLiON-2-10B con el codificador visual (ViT) de Qwen2.5-Omni-7B, y se afina mediante LoRA sobre el ViT, el codificador de audio y el LLM siguiendo la estrategia que el autor denomina ACRC.

El modelo está orientado a percepción y comprensión cultural del sudeste asiático, un nicho poco cubierto por los modelos multimodales generalistas, que suelen estar dominados por inglés y chino. Su interés actual es doble: por un lado, ofrece una base abierta para investigar comprensión audiovisual multilingüe en la región; por otro, se publica como checkpoint previo a un alineamiento con GRPO, de modo que sirve como referencia para estudiar el efecto de ese entrenamiento por refuerzo frente a la variante MERaLiON-Omni-GRPO-10B.

Es importante subrayar que se trata de una *alpha release* explícitamente no lista para producción: no ha recibido entrenamiento a gran escala de seguimiento de instrucciones, no tiene alineamiento de seguridad ni red-teaming, y su licencia es exclusivamente de investigación, con prohibición de uso comercial. La model card remite a modelos posteriores (MERaLiON-G4-E4B y MERaLiON-S4.5-E2B) para capacidades visuales generales e instrucciones más robustas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MERaLiON-2-10B (AudioLLM) + ViT de Qwen2.5-Omni; ajuste con LoRA sobre ViT, codificador de audio y LLM (estrategia ACRC) |
| Parámetros totales | 10.782.995.200 (10,78 B) |
| Parámetros activos | No aplica: no es un modelo MoE (no se documenta otra cifra) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio solo distribuye pesos safetensors en bf16 y no se ofrece GGUF |
| Idiomas soportados | en, zh, id, ms, th |
| Licencia | Research-only (license: other), uso comercial prohibido |
| Formato de pesos | safetensors con código personalizado (`trust_remote_code=True`) |

Otros datos técnicos relevantes: tamaño del repositorio 21,7 GB, pipeline `image-text-to-text` y dependencias declaradas Python 3.10, torch 2.6.0, transformers 4.52.0, flash-attn 2.7.4, torchaudio 2.6.0, pillow 11.1.0, triton 3.2.0 y CUDA 12.7.

## Arquitectura y entrenamiento

El modelo sigue un esquema de fusión temprana de modalidades: un codificador visual (ViT) procedente de Qwen2.5-Omni-7B se encarga de imagen y vídeo, un codificador de audio aporta la señal sonora y el backbone MERaLiON-2-10B actúa como modelo de lenguaje que consume las representaciones multimodales y produce texto. El ajuste se realiza con LoRA sobre los tres componentes (ViT, encoder de audio y LLM) mediante la estrategia ACRC descrita por el autor, lo que permite adaptar un backbone audio-lenguaje preexistente a entradas visuales sin reentrenar todos los parámetros.

La model card no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO. Sí se indica que esta publicación corresponde al checkpoint previo al alineamiento con GRPO y que existe una variante posterior alineada (MERaLiON-Omni-GRPO-10B). La comprensión de vídeo en idiomas del sudeste asiático se describe como zero-shot, y el autor advierte que no se ha realizado una alineación visual de propósito general ni un entrenamiento extensivo de seguimiento de instrucciones. Se referencia el identificador arXiv:2602.23730, aunque el contenido del artículo no está disponible en la información consultada.

## Capacidades

- Entrada multimodal combinada: imagen, vídeo, audio y texto, con salida exclusivamente textual.
- Comprensión de imágenes: descripción y respuesta a instrucciones textuales sobre una imagen, con control del número de píxeles procesados (`min_pixels` / `max_pixels`).
- Comprensión de vídeo: muestreo configurable de fotogramas (`fps`, `min_frames`, `max_frames`) y límite de píxeles totales (`total_pixels`).
- Comprensión audiovisual conjunta: procesamiento del audio embebido en el vídeo mediante `process_mm_info(..., use_audio_in_video=True)`.
- Procesamiento de audio: los ejemplos de la model card incluyen tareas de transcripción de habla.
- Multilingüismo: inglés, mandarín, indonesio, malayo y tailandés, con foco explícito en percepción y contexto cultural del sudeste asiático.
- Conversación multi-turno: la model card etiqueta el modelo como conversacional y utiliza plantillas de chat (`apply_chat_template`) con `padding_side="left"`.
- Capacidades especiales: no se documentan modo *thinking*, tool calling, function calling, soporte de agentes, visión en streaming ni salida de audio.

## Casos de uso

- Transcripción y comprensión de audio en idiomas del sudeste asiático: el modelo puede recibir un archivo de audio y devolver transcripción o respuestas sobre su contenido en indonesio, malayo, tailandés, mandarín o inglés, lo que resulta útil para construir corpus anotados en lenguas con menos recursos.
- Investigación en percepción cultural: evaluación de cómo un modelo multimodal interpreta escenas, carteles, productos o gestos propios de la región, comparando el comportamiento entre los cinco idiomas soportados.
- Análisis de vídeo con pista de audio: resumen o descripción de clips donde la información relevante está repartida entre lo visual y lo sonoro, usando el modo `use_audio_in_video` y el muestreo configurable de fotogramas.
- Estudio del efecto del alineamiento con GRPO: al publicarse el checkpoint pre-GRPO junto a la variante alineada, sirve como referencia experimental para medir cambios en seguimiento de instrucciones y calidad de respuesta.
- Base para *fine-tuning* académico: al estar adaptado con LoRA sobre un backbone audio-lenguaje, es un punto de partida razonable para grupos de investigación que quieran añadir capacidades o dominios específicos con presupuesto de cómputo limitado.
- Descripción automática de archivos multimedia en entornos de investigación: generación de metadatos textuales para colecciones de imágenes, vídeos y audios en varios idiomas, siempre dentro de un contexto no productivo y con revisión humana.
- Evaluación comparativa de modelos multimodales: uso como *baseline* regional frente a modelos generalistas en pruebas de comprensión audiovisual en lenguas del sudeste asiático.
- Prototipos de accesibilidad: experimentos de descripción de escenas o contenido audiovisual para usuarios de esos idiomas, asumiendo que la ausencia de alineamiento de seguridad impide cualquier despliegue real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, MMMU ni métricas específicas de ASR, visión o vídeo, y tampoco se aportan comparaciones numéricas con los modelos upstream o con la variante GRPO.

## Requisitos de hardware

- VRAM estimada en bf16: los pesos ocupan aproximadamente 21,6 GB (10,78 B × 2 bytes), en línea con los 21,7 GB del repositorio; sumando caché KV y los tokens de imagen o vídeo, el consumo realista se sitúa en torno a 26-32 GB según la resolución y el número de fotogramas.
- GPU recomendadas (estimación): A100 40 GB, A100 80 GB, H100 80 GB o L40S 48 GB para inference en bf16 con margen. Una RTX 4090 de 24 GB queda en el límite y probablemente no admite entradas de vídeo con muchos tokens.
- GPU de consumo: cabe en tarjetas de 24 GB solo con secuencias cortas y entradas de imagen de baja resolución; no se garantiza con vídeo. No hay pesos cuantizados oficiales (GGUF, AWQ, GPTQ), por lo que el uso en GPUs pequeñas requeriría cuantización manual (bitsandbytes) no validada por el autor.
- Opciones de despliegue: la vía soportada es transformers con `AutoModelForSpeechSeq2Seq`, `trust_remote_code=True`, `attn_implementation="flash_attention_2"` y `device_map="auto"`, junto con el módulo `mm_utils_mm` incluido en el repositorio. No se documenta soporte para vLLM, TGI, Ollama ni llama.cpp, y la ausencia de GGUF y el uso de código personalizado complican esas integraciones.
- Latencia y throughput: no disponibles. El coste por petición crece de forma notable con el número de tokens visuales, ya que el modelo admite hasta 8600 × 28 × 28 píxeles por vídeo (`MAX_PIX_VIDEO`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| MERaLiON-Omni-MM-10B | 10,78 B | No disponible | Imagen, vídeo, audio, texto | Research-only | Checkpoint pre-GRPO, alpha, sin alineamiento de seguridad |
| MERaLiON-Omni-GRPO-10B | No disponible | No disponible | No disponible | No disponible | Variante alineada con GRPO que el autor presenta como SOTA del proyecto |
| MERaLiON-2-10B | No disponible | No disponible | Audio y texto | MERaLiON Public Licence | Backbone audio-lenguaje sobre el que se construye este modelo |
| Qwen2.5-Omni-7B | 7 B (según denominación del modelo) | No disponible | Multimodal (origen del ViT) | Apache 2.0 | Aporta únicamente el codificador visual; no es comparable en cobertura idiomática del sudeste asiático |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, modalidades, licencia y disponibilidad.

## Limitaciones y advertencias

- Estado alpha: el autor indica que no ha habido entrenamiento a gran escala de seguimiento de instrucciones ni alineación visual general; el rendimiento en tareas visuales generales puede ser inferior al de modelos generalistas.
- Comprensión de vídeo zero-shot en idiomas del sudeste asiático, sin garantías de calidad.
- Sin alineamiento de seguridad ni red-teaming: puede generar contenido sesgado, ofensivo o inseguro.
- Riesgo elevado de alucinación, reconocido explícitamente en la model card; no es apto para despliegue real.
- Licencia research-only: el uso comercial está prohibido sin autorización explícita del autor. Cualquier producto derivado requiere negociar una licencia aparte.
- Licencias upstream: el ViT procede de Qwen2.5-Omni-7B (Apache 2.0) y el backbone de MERaLiON-2-10B (MERaLiON Public Licence); el cumplimiento de ambas condiciones debe verificarse antes de cualquier redistribución.
- Cobertura idiomática limitada a en, zh, id, ms y th; el comportamiento fuera de esos idiomas no está documentado.
- Longitud de contexto no publicada, lo que impide dimensionar con precisión casos de conversaciones largas o documentos extensos.
- Salida exclusivamente textual: no genera audio, imágenes ni acciones.
- Sin soporte documentado de tool calling, function calling ni flujos de agentes.
- Requiere `trust_remote_code=True` y código personalizado (`mm_utils_mm`) del propio repositorio, lo que implica revisar el código antes de ejecutarlo en entornos sensibles.
- Validación comunitaria muy escasa: 48 descargas y 2 *likes* en el momento de la consulta.
- No se han encontrado enlaces adicionales relevantes en la búsqueda web; los resultados devueltos no guardaban relación con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zzlynxSG/MERaLiON-Omni-MM-10B
- Licencia del modelo: https://huggingface.co/zzlynxSG/MERaLiON-Omni-MM-10B/blob/main/LICENSE
- Variante alineada con GRPO: https://huggingface.co/zzlynxSG/MERaLiON-Omni-GRPO-10B
- Modelo posterior MERaLiON-G4-E4B: https://huggingface.co/zzlynxSG/MERaLiON-G4-E4B
- Modelo posterior MERaLiON-S4.5-E2B: https://huggingface.co/zzlynxSG/MERaLiON-S4.5-E2B
- Vídeo de demostración: https://huggingface.co/zzlynxSG/MERaLiON-Omni-MM-10B/resolve/main/assets/demo.mp4
- Codificador visual upstream (Qwen2.5-Omni-7B): https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Licencia del codificador visual: https://huggingface.co/Qwen/Qwen2.5-Omni-7B/blob/main/LICENSE
- Referencia arXiv citada en las etiquetas del modelo: https://arxiv.org/abs/2602.23730
