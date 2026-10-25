# sw-voice-ai/voxcpm2-stage2-navaratri-sidon-telugu-lr5e-5-5ep

## Resumen

Este modelo es un ajuste fino completo (*full fine-tune*) de un sistema de síntesis de voz (text-to-speech) de la familia VoxCPM2, publicado por el usuario sw-voice-ai. Concretamente, parte del checkpoint `sw-voice-ai/voxcpm2-telugu-stage1b-english-sidon-lr1e-4-10ep` y lo especializa sobre un corpus de 402 fragmentos (1,79 horas) de discursos Navaratri en telugu, procesados mediante restauración de voz con la herramienta Sidon. El resultado es un modelo de 2.290.004.544 parámetros (≈2,29 B) que genera audio en telugu e inglés, distribuido en safetensors bajo licencia Apache 2.0.

Su relevancia es acotada y muy específica: no es un modelo de propósito general, sino un artefacto de investigación dentro de una cadena de ajustes sucesivos (stage 1b → stage 2 → stage 3) orientada a reproducir la voz de un hablante concreto en un dominio discursivo concreto. Resulta útil como caso de estudio de pipelines de adaptación de TTS con pocos datos y para experimentos de preservación de voz en lenguas de bajos recursos como el telugu, pero no está pensado como un motor TTS listo para producción general.

La información publicada no documenta arquitectura interna, ventana de contexto de audio, metodología de evaluación ni resultados de benchmarks. La model card se limita a describir el procedimiento de entrenamiento y el dataset empleado, por lo que buena parte de las especificaciones habituales figuran aquí como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de síntesis de voz, familia VoxCPM2; la model card no detalla la arquitectura interna) |
| Parametros totales | 2.290.004.544 (≈2,29 B) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo distribuye safetensors; no se publican versiones GGUF, INT8 ni INT4) |
| Idiomas soportados | Telugu (te) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-to-speech |
| Tamano del repositorio | 9,5 GB |
| Modelo base | sw-voice-ai/voxcpm2-telugu-stage1b-english-sidon-lr1e-4-10ep |
| Dataset de ajuste | sw-voice/swamiji-navaratri-telugu-sidon (402 clips, 1,79 h) |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna (tipo de bloque, tokenizador de audio, códec o vocoder) más allá de que se trata de un modelo de la familia VoxCPM2 con pipeline `text-to-speech`. Lo que sí está documentado es el proceso de entrenamiento: un ajuste fino completo del checkpoint de stage 2, que a su vez provenía de un ajuste sobre telugu (stage 1b) con datos de inglés (Sidon). La cadena completa sugiere una estrategia de entrenamiento por etapas, encadenando adaptación lingüística y adaptación de hablante.

El corpus de esta etapa contiene 402 clips que suman 1,79 horas de audio de charlas Navaratri en telugu, restauradas mediante Sidon Speech Restoration, con transcripciones generadas por Gemini (`transcript_gemini`). La configuración declarada es: micro-batch 2 con acumulación 8 (batch efectivo 16), 130 pasos totales, learning rate 5e-5 con scheduler coseno, 20 pasos de warmup, gradient clipping de 1,0 y 5 épocas. No se menciona uso de RLHF, DPO ni ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.). El volumen de datos (menos de 2 horas) y el número de pasos (130) son muy reducidos, lo que sitúa el modelo en el terreno de la adaptación de hablante agresiva más que del entrenamiento extensivo.

## Capacidades

- Síntesis de voz (text-to-speech) en telugu, idioma principal de los datos de ajuste.
- Síntesis de voz en inglés, heredada del checkpoint base de stage 2; el grado de conservación de esta capacidad tras el ajuste no se ha documentado.
- Reproducción del estilo discursivo del corpus de entrenamiento (charlas Navaratri), incluyendo presumiblemente el timbre del hablante original, aunque no se publica ninguna métrica de similitud de voz.
- No se documenta soporte de clonación de voz zero-shot con voces nuevas.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico: es un modelo generativo de audio, no de texto instructivo.
- No se documentan capacidades multimodales de entrada (audio a audio, imagen, etc.).
- No se documenta control de prosodia mediante SSML, etiquetas de emoción ni marcas de estilo.
- No se documenta streaming ni generación incremental.

## Casos de uso

- **Narración de discursos religiosos en telugu**: el modelo está ajustado exactamente sobre charlas Navaratri, por lo que puede emplearse para locutar textos devocionales o transcripciones nuevas manteniendo el estilo del corpus original.
- **Preservación de archivo sonoro**: dado que el entrenamiento usó audio restaurado con Sidon a partir de grabaciones de YouTube, el modelo sirve para generar versiones limpias de fragmentos textuales del mismo hablante cuando no existe grabación original disponible.
- **Generación de audiolibros en telugu**: con 1,79 h de datos de un solo hablante, es viable para lecturas largas de contenido devocional o filosófico, siempre que se valide previamente la estabilidad prosódica en pasajes extensos.
- **Doblaje y localización de contenido te-en**: al soportar ambos idiomas, puede emplearse en la generación de pistas de audio para vídeos formativos o divulgativos dirigidos a audiencias telugu, comparando la salida con el idioma original.
- **Investigación en TTS de bajos recursos**: constituye un punto de partida reproducible para estudiar el efecto del número de épocas, la tasa de aprendizaje y la restauración de audio (Sidon frente a audio crudo de YouTube) en la calidad final.
- **Prototipado de asistentes bilingües te-en**: puede integrarse en un prototipo de lectura de respuestas para interfaces de voz en telugu, aceptando que la latencia y la calidad deberán medirse en el despliegue concreto.
- **Generación de material de accesibilidad**: conversión de textos escritos en telugu a audio para personas con discapacidad visual, con la salvedad de que la validación de inteligibilidad debe hacerse con hablantes nativos antes de cualquier uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MOS, CMOS, WER, tasas de error de pronunciación ni comparaciones objetivas con otros sistemas TTS, ni para telugu ni para inglés.

## Requisitos de hardware

- **VRAM estimada en FP16/BF16**: los 2,29 B de parámetros equivalen a unos 4,6 GB solo en pesos; con activaciones y buffers de decodificación de audio, hay que prever del orden de 6-8 GB en inferencia.
- **VRAM estimada en INT8**: aproximadamente 2,3 GB de pesos, en torno a 4-5 GB con overhead (requiere cuantización propia, no publicada).
- **GPU recomendadas**: para FP16 sin cuantizar, una RTX 4090 (24 GB) o una A100/H100 dejan margen amplio para batches mayores; una RTX 3090 o 4080 también son suficientes para inferencia individual.
- **Consumer GPU**: sí cabe en tarjetas de gama media-alta con 8-12 GB, como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070; en 8 GB el margen es ajustado en FP16.
- **Opciones de despliegue**: el repositorio solo ofrece safetensors, por lo que el despliegue pasa por cargar los pesos con PyTorch y el código de inferencia propio de VoxCPM2. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje y no a este pipeline TTS).
- **Latencia y throughput**: no disponibles. No se publican mediciones de RTF (real-time factor) ni de tiempo por segundo de audio generado.
- **Nota sobre el tamano del repositorio**: 9,5 GB para 2,29 B de parámetros en safetensors es muy superior a los ~4,6 GB esperables en FP16, lo que sugiere la presencia de múltiples ficheros de pesos o checkpoints adicionales en el repositorio; conviene inspeccionar el árbol de archivos antes de aprovisionar disco.

## Comparativa con modelos similares

Los datos de las alternativas provienen de información pública de cada proyecto y no han sido verificados en esta ficha; se incluyen como orientación de categoría.

| Modelo | Parametros | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|
| Este modelo (VoxCPM2 stage 3 Sidon, telugu) | ≈2,29 B | te, en | Apache 2.0 | Ajuste de hablante sobre corpus devocional telugu |
| VoxCPM2 stage 2 Navaratri (mismo autor, audio crudo) | ≈2,29 B (misma base) | te, en | Apache 2.0 | Variante con audio de YouTube sin restaurar; permite aislar el efecto de Sidon |
| XTTS-v2 (Coqui) | ≈0,47 B | multilingüe (incluye en; telugu no confirmado) | CPML (uso comercial restringido) | TTS multilingüe con clonación zero-shot |
| F5-TTS | ≈0,34 B | en, zh principalmente | MIT / CC-BY según checkpoint | TTS no autorregresivo con clonación por referencia |
| Parler-TTS | ≈0,88 B | en | Apache 2.0 | TTS controlado por descripción textual de estilo |

La comparación directa es difícil porque este modelo está sobreespecializado en un único hablante y dominio, mientras que las alternativas son sistemas generalistas. No se dispone de métricas comunes para comparar calidad subjetiva.

## Limitaciones y advertencias

- **Sobreajuste probable**: 1,79 horas de audio y 130 pasos de entrenamiento con 5 épocas configuran un régimen de adaptación muy agresivo; es esperable pérdida de generalidad fuera del dominio de las charlas Navaratri.
- **Idioma inglés degradado**: aunque la etiqueta declare `en`, las etapas sucesivas de ajuste sobre telugu pueden haber erosionado la calidad en inglés; no hay evaluación publicada que lo confirme o descarte.
- **Sesgo de dominio y de hablante**: el modelo reproduce un registro religioso y la voz de una persona concreta; no representa la diversidad dialectal del telugu (Andhra Pradesh, Telangana, hablantes en diáspora).
- **Calidad de las transcripciones**: el campo `transcript_gemini` indica transcripciones generadas automáticamente, con posible error en una lengua de bajos recursos, lo que puede introducir desalineaciones texto-audio.
- **Riesgo de alucinación acústica**: en TTS, los fallos se manifiestan como palabras omitidas, repeticiones, ruido o prosodia anómala; no hay métricas de WER publicadas que acoten este riesgo.
- **Requisitos de licencia**: los pesos son Apache 2.0, pero el corpus de entrenamiento proviene de grabaciones de charlas publicadas en YouTube y restauradas con una herramienta externa; la situación de derechos sobre el audio original y sobre la voz del hablante no se detalla en la model card. Antes de un uso comercial conviene revisar la titularidad del dataset y la cadena de consentimiento del hablante.
- **Voz de persona real**: la síntesis de la identidad vocal de un individuo conlleva riesgo de suplantación; se recomienda no desplegar en contextos donde la salida pueda atribuirse erróneamente al hablante original.
- **Sin benchmarks ni evaluación de calidad**: no hay MOS, ni comparación A/B, ni prueba con hablantes nativos documentada.
- **Sin cuantizaciones publicadas**: no existen GGUF ni variantes INT8/INT4, lo que limita el despliegue en hardware muy restringido.
- **Cero tracción comunitaria**: 0 descargas y 0 likes en el momento de la consulta; no hay validación externa del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sw-voice-ai/voxcpm2-stage2-navaratri-sidon-telugu-lr5e-5-5ep
- Modelo base (stage 2, inglés Sidon): https://huggingface.co/sw-voice-ai/voxcpm2-telugu-stage1b-english-sidon-lr1e-4-10ep
- Variante con audio crudo de YouTube (misma receta): https://huggingface.co/sw-voice-ai/voxcpm2-stage2-navaratri-telugu-lr5e-5-5ep
- Dataset de entrenamiento: https://huggingface.co/datasets/sw-voice/swamiji-navaratri-telugu-sidon
- Papers, blogs o demos adicionales: no disponible (la búsqueda web realizada no devolvió resultados relacionados con este modelo)
