# teckedd/gha-whisper-small-twi-v6

## Resumen

`teckedd/gha-whisper-small-twi-v6` es un modelo de reconocimiento automático del habla (ASR) desarrollado por el equipo de Ghana Health AI / Serendepify, especializado en twi (akan) e inglés para el ámbito sanitario comunitario en Ghana. Se basa en la arquitectura Whisper small de OpenAI, con 241,7 millones de parámetros, y ha sido ajustado con datos locales de habla twi y akan, incluyendo grabaciones de un grabador de salud comunitario y conjuntos públicos como Common Voice y WaxalNLP.

El modelo está diseñado para integrarse en productos de salud conversacional, como el asistente de ghanahealth.serendepify.com, donde se utiliza para transcripción de voz en consultas de salud. Su relevancia radica en abordar la escasez de recursos ASR para lenguas de bajos recursos como el twi, manteniendo a la vez una retención del inglés. La licencia Apache 2.0 permite uso comercial sin restricciones, aunque el propio autor advierte que no es un dispositivo médico y no debe emplearse para diagnóstico clínico.

El checkpoint se distribuye en formato safetensors y es compatible con el ecosistema Transformers de Hugging Face. Los resultados declarados en validación muestran un WER de 0,297 y un CER de 0,103 sobre el conjunto de evaluación de WaxalNLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper small (encoder-decoder Transformer) |
| Parametros totales | 241.734.912 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | twi (tw), akan (ak), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper small de OpenAI: un transformer encoder-decoder con atención estándar, entrenado para transcribir audio a texto. La ventana de contexto es fija de 30 segundos de audio, característica propia de la familia Whisper. El checkpoint es un fine-tune de un modelo base previo (indicado como `teckedd/gha-whisper-small-twi-v6` en el campo `base_model`, aunque por tamaño y estructura corresponde a la familia Whisper small).

El entrenamiento se realizó con una receta denominada `v6-local-holdout`, con el encoder sin congelar, una tasa de aprendizaje de 5e-6, 600 pasos y un tamaño de lote de 8x4. Se emplearon cinco conjuntos de datos: `google/WaxalNLP (aka_asr)`, un conjunto local de grabaciones del grabador de salud comunitaria (`ghana-health-ai-recorder`), `fsicoli/common_voice_22_0` en twi e inglés, y `ghananlpcommunity/twi-speech-text-multispeaker-16k`. Los datos locales recibieron un peso de 0,08 en la mezcla. El autor indica que el modelo no supera el baseline de referencia (WER 0,3149 con greedy), por lo que no fue promovido a producción.

## Capacidades

- Reconocimiento de voz en twi y akan, con retención de inglés.
- Transcripción de audio de hasta 30 segundos por ventana.
- Adecuado para conversaciones de salud comunitarias, tanto en twi como en inglés.
- Compatible con el pipeline `automatic-speech-recognition` de Transformers.
- No incluye soporte para tool calling, agentes, visión ni modos de razonamiento.
- Capacidades multilingües limitadas a twi, akan e inglés.

## Casos de uso

- Transcripción de consultas de salud comunitarias: el modelo puede transcribir conversaciones entre trabajadores sanitarios y pacientes en twi, facilitando el registro electrónico de visitas y el seguimiento de síntomas.
- Asistente de voz para orientación sanitaria: integrado en una aplicación móvil o web, permite a usuarios de habla twi interactuar por voz con un sistema de chat de salud, como el desplegado en ghanahealth.serendepify.com.
- Investigación en ASR de lenguas de bajos recursos: sirve como punto de partida para estudios sobre reconocimiento de habla en akan y twi, permitiendo comparar arquitecturas y técnicas de fine-tune.
- Generación de subtítulos o transcripciones para contenido audiovisual en twi: útil para medios locales, podcasts o vídeos educativos de salud.
- Evaluación de modelos ASR multilingües: al ser un fine-tune de Whisper small, permite medir el impacto del ajuste con datos locales frente al modelo original en tareas de habla ghanesa.
- Prototipado de sistemas de voz para telemedicina: puede emplearse en pilotos de triaje por voz, siempre que se respete la advertencia de no uso como dispositivo médico.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en validación sobre el conjunto `google/WaxalNLP (aka_asr)`, sin verificación independiente:

| Metrica | Valor |
|---|---|
| VAL_WER | 0,296972 |
| VAL_CER | 0,103112 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2 GB en FP16 para inferencia, considerando el tamaño de parámetros y la ventana de audio de 30 segundos. En FP32, la demanda puede superar los 3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060 o superiores. Para despliegue en producción, una T4 o A10 es suficiente.
- Es viable en hardware de consumo, incluyendo portátiles con GPUs de gama media.
- Opciones de despliegue: compatible con la librería Transformers, así como con servidores de inferencia como vLLM, TGI o llama.cpp (si se convierte a GGUF). También puede ejecutarse con el pipeline de Hugging Face.
- Latencia estimada: en una GPU moderna, la transcripción de un clip de 30 segundos suele completarse en menos de 2 segundos con decodificación greedy; con beam search (num_beams=5, como se usa en producción) la latencia aumenta proporcionalmente, aunque sigue siendo adecuada para uso interactivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| teckedd/gha-whisper-small-twi-v6 | 241,7 M | 30 s audio | tw, ak, en | Apache 2.0 | safetensors |
| openai/whisper-small | 244 M | 30 s audio | 96+ | MIT | safetensors, GGUF |
| openai/whisper-base | 74 M | 30 s audio | 96+ | MIT | safetensors, GGUF |

No se dispone de benchmarks comparativos en twi para estos modelos en la información proporcionada. El fine-tune local busca mejorar el rendimiento en twi frente al Whisper original, pero no se aportan datos que lo confirmen.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo no es un dispositivo médico y no debe utilizarse para diagnóstico clínico ni decisiones médicas autónomas.
- Los resultados de WER y CER provienen de una única validación sin verificación independiente; el propio autor indica que el modelo no supera el baseline de referencia en decodificación greedy.
- El rendimiento en twi puede verse afectado por la variabilidad dialectal y la calidad de las grabaciones, dado el volumen limitado de datos de entrenamiento.
- Riesgo de alucinación en transcripciones de audio con ruido o habla superpuesta, común en modelos ASR.
- La retención del inglés puede degradarse si el audio contiene acentos o vocabulario médico especializado no presente en los datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones de los datasets utilizados (Common Voice, WaxalNLP) para verificar posibles restricciones de atribución.
- No hay soporte para otros idiomas de Ghana distintos de twi y akan.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/teckedd/gha-whisper-small-twi-v6
- Producto asociado: https://ghanahealth.serendepify.com
- Datasets empleados: google/WaxalNLP, fsicoli/common_voice_22_0, ghananlpcommunity/twi-speech-text-multispeaker-16k
