# yurei24/Bytehome_TTS

## Resumen

Bytehome_TTS es un checkpoint de síntesis de voz (text-to-speech) con clonación de voz basado en la arquitectura OmniVoice, publicado por el usuario yurei24 en HuggingFace. El modelo cuenta con 612.577.288 parámetros en formato safetensors y un repositorio de 3,3 GB que incluye pesos, configuración, tokenizador de texto y tokenizador de audio. Según la model card, se trata de una copia de un checkpoint original alojado en el repositorio Bytehome/Bytehome_TTS, subida para su uso con el código fuente del proyecto chatbot_voice, y no se realizó entrenamiento ni fine-tuning durante esta publicación.

La arquitectura combina un backbone de tipo Qwen3 de 28 capas con tamaño oculto de 1024, un tokenizador de audio HiggsAudioV2TokenizerModel con 8 codebooks y un vocabulario de audio de 1025 tokens por codebook (incluyendo un MASK ID en la posición 1024). La salida de audio se genera a 24.000 Hz. El flujo de inferencia requiere obligatoriamente un audio de referencia y su transcripción para realizar la clonación de voz, y el modelo predice tokens de audio que el tokenizador decodifica a forma de onda.

El modelo es relevante por su enfoque en clonación de voz zero-shot mediante una arquitectura híbrida texto-audio, pero presenta limitaciones importantes de documentación: no se han verificado los datos de entrenamiento, no hay benchmarks publicados, la licencia no está disponible y la model card advierte explícitamente de que no se ha ejecutado inferencia ni evaluación sobre esta copia. Es, por tanto, un artefacto de uso interno o experimental más que un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | OmniVoice (backbone Qwen3, 28 capas, hidden size 1024) |
| Parámetros totales | 612.577.288 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors, presumiblemente fp16/fp32) |
| Idiomas soportados | no disponibles (el ejemplo de la model card usa vietnamita, sin garantía de calidad) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura OmniVoice emplea un backbone transformer de tipo Qwen3 con 28 capas y dimensión oculta de 1024, que procesa la secuencia de texto junto con las condiciones de referencia (audio de muestra y su transcripción) para predecir tokens de audio discretos. Estos tokens se organizan en 8 codebooks con un vocabulario de 1025 entradas cada uno, incluyendo un token MASK en la posición 1024. La decodificación a waveform la realiza el tokenizador HiggsAudioV2TokenizerModel, con una frecuencia de muestreo de salida de 24.000 Hz. El modelo genera audio mediante un proceso iterativo controlado por los parámetros `num_step` y `guidance_scale`, lo que sugiere un esquema de generación por difusión o flow matching sobre tokens discretos, aunque la model card no detalla el mecanismo exacto.

No hay información verificada sobre el proceso de entrenamiento: se desconoce el número de tokens, la composición del dataset, si hubo RLHF/DPO o fine-tuning adicional, y el origen exacto de los pesos del backbone. La model card indica explícitamente que el nombre del repositorio y la configuración de arquitectura no son prueba de historial de fine-tuning, y que la revisión de origen solo registra de dónde se copió el checkpoint, no confirma el modelo base original. Tampoco se incluyen logs de entrenamiento, estado del optimizador ni número de pasos.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech) con salida a 24.000 Hz.
- Clonación de voz zero-shot: requiere un audio de referencia y su transcripción exacta para condicionar la generación.
- Reutilización de la condición de voz mediante `create_voice_clone_prompt()` y el parámetro `voice_clone_prompt`, que evita reprocesar el audio de referencia en cada llamada.
- Control de velocidad del habla mediante el parámetro `speed` (por ejemplo, 0.95 en el ejemplo de la model card).
- Control del proceso de generación mediante `num_step` (8 en el ejemplo) y `guidance_scale` (2.0 en el ejemplo).
- La model card menciona que la librería OmniVoice del proyecto soporta voice cloning, voice design y selección automática de voz, aunque la capa de servicio TTS integrada solo usa el modo de clonación.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá del audio de referencia para clonación.
- Capacidades multilingües: no verificadas; el ejemplo usa vietnamita pero no hay evaluación sistemática por idioma.

## Casos de uso

- Clonación de voz para asistentes conversacionales: el modelo permite generar respuestas habladas con una voz concreta a partir de un audio de referencia y su transcripción, integrándose en un servicio TTS que recibe texto del chatbot y devuelve PCM o WAV. Es adecuado porque el flujo de inferencia está diseñado exactamente para este escenario de referencia fija reutilizable.
- Doblaje y localización de contenido: dado un audio de referencia de un hablante, se pueden generar múltiples locuciones con esa misma voz para vídeos, audiolibros o material formativo, reutilizando el `voice_clone_prompt` para mantener consistencia entre frases.
- Prototipado de interfaces de voz: equipos que desarrollan aplicaciones de voz pueden usar el checkpoint para generar muestras de prueba con distintas voces de referencia y evaluar la experiencia de usuario antes de invertir en un modelo comercial.
- Generación de avisos y notificaciones personalizadas: integrado en un pipeline de aplicación (FastAPI, WebSocket, Redis según la model card), el modelo puede convertir mensajes de texto en audio con una voz corporativa concreta para sistemas de alertas o atención automatizada.
- Investigación en clonación de voz: el checkpoint sirve como base para experimentos de comparación de arquitecturas OmniVoice frente a otros sistemas TTS, siempre que se realicen las evaluaciones de WER, MOS y similitud de hablante que la model card indica que no se han hecho.
- Pruebas de integración en servicios TTS propios: el ejemplo de código de la model card muestra cómo cargar el checkpoint con `snapshot_download` y `OmniVoice.from_pretrained`, lo que permite validar la integración del modelo en un servicio antes de sustituirlo por un checkpoint verificado.
- Evaluación interna de calidad por idioma: aunque no hay garantías, el modelo puede usarse para generar muestras en distintos idiomas y medir subjetivamente la inteligibilidad de nombres propios, números y términos en inglés, tal como recomienda la propia model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de WER, MOS, similitud de hablante, latencia, real-time factor ni VRAM medidos para este checkpoint, y que no se ha ejecutado ninguna prueba de inferencia sobre esta copia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; no se han publicado mediciones. Con 612,6 millones de parámetros, una estimación teórica en fp16 sería de aproximadamente 1,2 GB solo para pesos, más overhead de activaciones y del tokenizador de audio, pero es una estimación no verificada.
- GPU recomendadas: no disponible; la model card solo indica que se requiere una GPU CUDA adecuada o CPU, sin especificar modelos.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño de parámetros podría caber en GPUs de consumo con suficiente VRAM, pero no hay pruebas publicadas.
- Opciones de despliegue: el código de ejemplo usa la librería local `omnivoice` con PyTorch, Transformers, Hugging Face Hub y SoundFile. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo de texto estándar es improbable que esos motores lo soporten sin adaptación.
- Latencia y throughput: no disponibles; no se han medido.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos TTS ni datos de rendimiento que permitan establecer una comparativa rigurosa con alternativas de clonación de voz.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es un riesgo legal importante para producción.
- Sin verificación de entrenamiento: se desconoce el dataset, el proceso de fine-tuning y el modelo base original; la model card advierte que el nombre del repositorio no es prueba de historial de entrenamiento.
- Sin benchmarks: no hay WER, MOS ni similitud de hablante medidos, por lo que la calidad es desconocida.
- Sin prueba de inferencia: la model card indica que no se ha ejecutado inferencia ni benchmark sobre esta copia concreta.
- Dependencia de código externo: el repositorio no incluye el código Python de implementación de la arquitectura; se necesita el proyecto `chatbot_voice` con la carpeta `omnivoice/`.
- Requiere audio de referencia y transcripción exacta: la clonación no funciona sin ambos, y la calidad depende de la limpieza del audio y de la coincidencia de la transcripción.
- Riesgo de alucinación y errores de pronunciación: la model card recomienda escuchar nombres propios, números, palabras en inglés y frases largas antes de desplegar.
- Idiomas no verificados: el ejemplo usa vietnamita, pero no hay evaluación sistemática por idioma ni garantía de calidad multilingüe.
- Sesgos: no documentados; al no conocerse los datos de entrenamiento no se pueden evaluar sesgos de género, acento o idioma.
- Advertencia sobre despliegue: subir el checkpoint a HuggingFace no despliega ni actualiza automáticamente el modelo en producción; el servicio debe recargarse manualmente.
- Contexto: no disponible; se desconoce la longitud máxima de texto que el modelo puede procesar en una sola llamada.

## Enlaces

- HuggingFace: https://huggingface.co/yurei24/Bytehome_TTS
- Repositorio de origen citado en la model card: Bytehome/Bytehome_TTS en HuggingFace (revisión `ba3e9991d4843dacae4415bc09300d693913f112`)
- Commit de subida citado: `ef0a9cac92eeaff41a4c2aaf5a25dfd549776019`
- Proyecto de código fuente citado: `chatbot_voice`, carpeta `AI_Service/tts_service/` (no enlazado en la información disponible)
