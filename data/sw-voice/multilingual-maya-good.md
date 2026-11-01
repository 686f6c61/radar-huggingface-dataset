# sw-voice/multilingual-maya-good

## Resumen

multilingual-maya-good es un modelo de síntesis de voz (text-to-speech) publicado por el usuario sw-voice en Hugging Face. Se trata de un ajuste fino completo (full fine-tune) del modelo base maya-research/maya2-native, orientado a reproducir una voz concreta y con nombre propio, etiquetada como `{Swamiji}`, en inglés, telugu y kannada. El modelo resuelve el problema de la clonación y personalización de voz multilingüe sin necesidad de clip de referencia ni embedding de hablante en tiempo de inferencia: la voz se selecciona mediante un identificador textual en el prompt.

El modelo tiene 2.502.398.656 parámetros (aproximadamente 2,5 mil millones) almacenados en formato safetensors, con un repositorio de 5,0 GB. La licencia es Apache 2.0, lo que permite uso comercial con atribución. Su relevancia actual radica en que demuestra un flujo de trabajo de ajuste fino supervisado (SFT) sobre un TTS nativo multilingüe con un conjunto de datos relativamente pequeño (719 clips en inglés más temas completos en telugu y kannada repetidos tres veces), y en que, según la model card, fue preferido 3-1 en una prueba ciega frente a un modelo basado en clip de referencia, con la misma precisión.

Es un modelo de investigación, no un producto listo para producción: la información pública es escasa, no se declaran idiomas oficiales en los metadatos de Hugging Face y no se han publicado benchmarks objetivos en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base maya-research/maya2-native; TTS nativo) |
| Parametros totales | 2.502.398.656 (~2,5 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés, telugu y kannada (según la model card; los metadatos de Hugging Face no los declaran) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura concreta no se detalla en la información disponible; se sabe que es un ajuste fino completo del modelo maya-research/maya2-native, un sistema de text-to-speech nativo. El entrenamiento consistió en un SFT con los siguientes hiperparámetros: learning rate 5e-06, 3 épocas (552 actualizaciones), batch de 1x8, calentamiento lineal durante 138 actualizaciones y después tasa constante. El conjunto de datos combinó 719 clips de la voz Swamiji en inglés con temas completos de Navaratri en telugu y kannada, cada tema repetido tres veces por época (ficheros `clips.pt`, `clips_te.pt*3` y `clips_kn.pt*3`).

La innovación destacable es el uso de una voz con nombre mediante prompt textual: el modelo no requiere clip de referencia ni embedding de hablante en inferencia. La voz se invoca con `generate(text, voice="Swamiji")`, que internamente construye el prompt `{Swamiji}: <text>` a partir de `voices/voices.json`. El código de entrenamiento está en el repositorio `swamiji-tts`, ruta `research/exp-iterations/05-maya2-native-sft` (experimento 08), y el experimento se etiquetó como exp2c. No se especifica el número total de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés, telugu y kannada con una voz concreta y nombrada (`{Swamiji}`).
- Selección de voz por identificador textual, sin clip de referencia ni embedding de hablante en tiempo de inferencia.
- Carga directa mediante `Maya3TTS.from_pretrained("sw-voice/multilingual-maya-good")`, que lee `voices/voices.json`.
- Generación con la llamada `generate(text, voice="Swamiji")`.
- Capacidad multilingüe limitada a los tres idiomas del ajuste (inglés, telugu, kannada); no se declaran otros.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- No se documenta modo de pensamiento (thinking mode) ni otras capacidades especiales.

## Casos de uso

- Locución multilingüe de contenido educativo: generar narraciones en inglés, telugu y kannada con una voz consistente para cursos o materiales de formación, usando el identificador `{Swamiji}` sin necesidad de grabar referencia en cada sesión.
- Doblaje y localización de vídeo: producir pistas de voz en los tres idiomas soportados a partir de guiones de texto, manteniendo la misma identidad de voz entre idiomas.
- Audiolibros y lectura asistida: convertir texto en voz para aplicaciones de accesibilidad o lectura en voz alta, aprovechando que la voz se selecciona por nombre y no requiere muestras del usuario.
- Asistentes de voz integrados: servir respuestas habladas en un asistente conversacional para usuarios de inglés, telugu o kannada, con una voz de marca fija y reproducible.
- Investigación en clonación y personalización de voz: usar el modelo como referencia de un flujo SFT con pocos datos (719 clips más temas repetidos) para estudiar la calidad de voces nombradas frente a enfoques con clip de referencia.
- Generación de avisos y anuncios automatizados: sintetizar mensajes de servicio (transporte, administración, comercio) en los tres idiomas, con despliegue en lote sobre texto plano.
- Pruebas de evaluación perceptual: emplear el modelo como candidato en pruebas ciegas A/B de calidad de voz, dado que el autor documenta una preferencia 3-1 frente a un modelo de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona una prueba ciega interna en la que el modelo fue preferido 3-1 frente a sw-voice/maya2-native-swamiji-en-te-kn3x-sft-lr5e-6-3ep sobre cinco respuestas en telugu no vistas, con la misma precisión. No se aportan métricas objetivas (MOS, WER, CER, latencia ni throughput).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 2,5 mil millones de parámetros en safetensors (5,0 GB de repositorio), la inferencia en precisión nativa requiere del orden de 5-6 GB solo para pesos, más memoria para activaciones y buffers de audio; las cifras exactas no están publicadas.
- GPU recomendadas: no disponibles en la información proporcionada.
- Cabe en GPU de consumo: no confirmado; por tamaño de pesos, es plausible en GPUs con 8-12 GB o más, pero no hay validación publicada.
- Opciones de despliegue: la model card solo documenta la carga mediante la clase `Maya3TTS` del código `swamiji-tts`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| sw-voice/multilingual-maya-good | ~2,5 mil millones | no disponible | inglés, telugu, kannada | Apache 2.0 | Voz nombrada sin clip de referencia; preferido 3-1 en prueba ciega interna |
| sw-voice/maya2-native-swamiji-en-te-kn3x-sft-lr5e-6-3ep | no disponible | no disponible | inglés, telugu, kannada | no disponible | Modelo con clip de referencia; referencia de la comparación del autor |
| sw-voice/best-2-multilingual-maya | no disponible | no disponible | no disponible | no disponible | Selección posterior del autor (2026-10-31) |
| maya-research/maya2-native | no disponible | no disponible | no disponible | no disponible | Modelo base del ajuste fino |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: la model card lo etiqueta explícitamente como research; no hay garantías de estabilidad ni soporte.
- Idiomas limitados a inglés, telugu y kannada; no se declaran otros idiomas y los metadatos de Hugging Face no especifican ninguno.
- No se han publicado métricas objetivas de calidad (MOS, WER, CER) ni evaluaciones independientes; la única evidencia es una prueba ciega interna del autor sobre cinco respuestas.
- Riesgo de alucinación y errores de pronunciación inherente a los sistemas TTS, especialmente en nombres propios, siglas y texto fuera de dominio; no cuantificado.
- Sesgos de voz: el modelo reproduce una voz concreta (Swamiji) entrenada con datos específicos; puede no generalizar a otros hablantes, acentos o estilos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben verificarse las condiciones del modelo base maya-research/maya2-native, cuya licencia no se detalla en la información disponible.
- Dependencia de código específico (`Maya3TTS` y `voices/voices.json`): no hay soporte documentado para runtimes estándar de inferencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ausencia de validación por parte de la comunidad.
- No se documentan requisitos de hardware ni latencias, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/sw-voice/multilingual-maya-good
- Modelo base: https://huggingface.co/maya-research/maya2-native
- Modelo de referencia con clip: https://huggingface.co/sw-voice/maya2-native-swamiji-en-te-kn3x-sft-lr5e-6-3ep
- Selección posterior del autor: https://huggingface.co/sw-voice/best-2-multilingual-maya
- Selección posterior del autor (vox): https://huggingface.co/sw-voice/best-2-multilingual-vox
