# sw-voice/qwen3-tts-12hz-1.7b-telugu-indictts-sft-lr1e-6-2ep

## Resumen

`qwen3-tts-12hz-1.7b-telugu-indictts-sft-lr1e-6-2ep` es un ajuste fino completo (full fine-tune) del modelo base `Qwen/Qwen3-TTS-12Hz-1.7B-Base` de Alibaba Qwen, especializado en síntesis de voz (text-to-speech) en telugu. Lo publica el usuario `sw-voice` como artefacto de investigación, con licencia Apache 2.0 y un total de 1.928.677.440 parámetros reales en safetensors (aproximadamente 1,7B, de ahí el nombre comercial).

El modelo parte de la arquitectura Qwen3-TTS con tokenizador acústico a 12 Hz y se ha entrenado sobre el corpus IndicTTS de telugu, limitado a dos hablantes y 8.548 clips, con transcripciones generadas por Sarvam `saaras:v4`. El resultado es un modelo de tipo `base` (no instruct), por lo que la identidad de la voz no se selecciona con un prompt textual, sino proporcionando un clip de referencia cuyo x-vector se inyecta en la ranura de hablante.

Su relevancia es doble: por un lado, demuestra que es viable adaptar un TTS multilingüe de 1,7B a una lengua india de bajos recursos con un conjunto de datos pequeño; por otro, documenta y corrige varios errores conocidos del script oficial `sft_12hz.py` de Qwen, lo que lo convierte en una referencia útil para quien quiera replicar fine-tunes de Qwen3-TTS. El repositorio ocupa 4,5 GB y, en el momento de la ficha, no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (transformer con talker y sub-talker, tokenizador acústico a 12 Hz) |
| Parametros totales | 1.928.677.440 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp32) |
| Idiomas soportados | telugu (te) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3-TTS del checkpoint base `Qwen3-TTS-12Hz-1.7B-Base`: un modelo de lenguaje tipo transformer que genera tokens acústicos a una tasa de 12 Hz, con una cabeza principal (talker) y una sub-cabeza (sub-talker) que refinan la secuencia de tokens de audio. La función de pérdida usada en el ajuste combina ambas: `talker CE + 0.3 × sub-talker CE`. La voz se condiciona mediante un x-vector calculado a partir de un clip de referencia, inyectado en la ranura de hablante.

El entrenamiento se realizó sobre el subconjunto de telugu de IndicTTS (solo filas IndicTTS), con dos hablantes y 8.548 clips, recortando los finales a 100 ms y usando transcripciones de Sarvam `saaras:v4` (dataset `sw-voice/telugu-tts-indictts-sarvam-syspin`). Hiperparámetros: learning rate constante de 1e-6 tras 50 pasos de warmup, batch efectivo 2×4, 2 épocas (2.138 actualizaciones), AdamW con weight decay 0.01 y clipping de gradiente 1.0, pesos maestros en fp32 con autocast bf16. El autor indica que corrigió errores conocidos del layout oficial `sft_12hz.py`: `text_projection`, un único shift, estado del sub-talker en p-1, etiquetas del sub-talker sin shift y pesos maestros en fp32.

## Capacidades

- Síntesis de voz (text-to-speech) en telugu a partir de texto.
- Clonación de voz mediante x-vector de un clip de referencia (`generate_voice_clone` con `x_vector_only_mode=True`).
- Generación en modo no streaming (`non_streaming_mode=True`) y, presumiblemente, streaming, dado que hereda la interfaz de Qwen3-TTS.
- Control de idioma mediante el parámetro `language` (el ejemplo del autor usa `"Auto"`).
- No es un modelo instruct: no acepta descripciones textuales de estilo o emoción; el timbre depende exclusivamente de la referencia de audio.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada más allá de la referencia de hablante.

## Casos de uso

- **Locución de contenidos en telugu**: generar narraciones para vídeos, audiolibros o pódcasts en telugu usando un clip de referencia del locutor deseado; el modelo reproduce el timbre del hablante de referencia.
- **Accesibilidad y lectura de textos**: convertir documentos, artículos o interfaces en audio en telugu para usuarios con discapacidad visual o baja alfabetización.
- **Sistemas de atención al cliente en telugu**: producir respuestas de voz pregrabadas dinámicamente con una voz corporativa fija, definida mediante un único clip de referencia.
- **Investigación en TTS para lenguas de bajos recursos**: servir de punto de partida reproducible para fine-tunes en otras lenguas indias, dado que el autor documenta las correcciones al script oficial de Qwen.
- **Generación de datos sintéticos de audio**: crear corpus de voz en telugu para entrenar sistemas ASR o de diarización, controlando el hablante mediante la referencia.
- **Prototipado de asistentes de voz locales**: integrar el modelo en pipelines de TTS autoalojados con licencia Apache 2.0, sin dependencia de APIs comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 1,93B parámetros en bf16 requiere en torno a 4 GB solo para pesos, más memoria para el tokenizador acústico, el codificador de referencia y el búfer de decodificación; el repo ocupa 4,5 GB.
- GPU recomendadas: no disponible. Por tamaño, una GPU con 8-16 GB de VRAM debería ser suficiente en bf16, aunque no hay mediciones publicadas.
- Cabe en GPU de consumo: probablemente sí en tarjetas de 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090), sin datos verificados.
- Opciones de despliegue: la model card solo documenta la librería `qwen_tts` con `Qwen3TTSModel.from_pretrained(..., device_map="cuda:0", dtype=torch.bfloat16)`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3-TTS 1.7B fine-tune telugu) | 1,93B | no disponible | te | Apache 2.0 | Fine-tune de investigación, 2 hablantes, 8.548 clips |
| Qwen/Qwen3-TTS-12Hz-1.7B-Base | ~1,7B (no verificado) | no disponible | multilingüe (no detallado) | no disponible | Modelo base del que deriva; capacidades multilingües originales |
| Alternativas TTS multilingües open source (p. ej. XTTS-v2, MMS-TTS) | no disponible | no disponible | varias | varía | No se dispone de datos verificados en la información proporcionada para una comparación cuantitativa |

## Limitaciones y advertencias

- Modelo de investigación: el autor lo etiqueta explícitamente como `(research)`; no hay garantías de calidad ni de estabilidad para producción.
- Entrenado solo con dos hablantes de telugu: la variedad de voces y de estilos prosódicos es muy limitada; la clonación fuera de ese dominio puede degradarse.
- Es un modelo `base`, no instruct: no responde a instrucciones de estilo, emoción o velocidad; el control se limita al texto y al x-vector de referencia.
- Riesgo de alucinación acústica: como todo TTS generativo, puede producir artefactos, pronunciaciones incorrectas o alargamientos en textos fuera del dominio de entrenamiento.
- Transcripciones generadas automáticamente con Sarvam `saaras:v4`: los errores de ASR en el corpus pueden propagarse a la pronunciación.
- Idiomas: solo telugu; no se documenta transferencia a otras lenguas.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base y de los datos de origen (IndicTTS) según sus propias licencias, no detalladas aquí.
- Sin métricas publicadas (MOS, WER, similitud de hablante): no es posible evaluar objetivamente la calidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sw-voice/qwen3-tts-12hz-1.7b-telugu-indictts-sft-lr1e-6-2ep
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Dataset de transcripciones: `sw-voice/telugu-tts-indictts-sarvam-syspin` (referenciado en la model card; no se proporciona URL completa)
- Código del experimento: repositorio `swamiji-tts`, ruta `research/exp-iterations/08-qwen3-tts/experiments/02-te-indictts-full-sft` (referenciado en la model card; no se proporciona URL completa)
