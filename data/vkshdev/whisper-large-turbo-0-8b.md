# vkshdev/whisper-large-turbo-0.8B

## Resumen

El modelo `vkshdev/whisper-large-turbo-0.8B` es un sistema de reconocimiento automático del habla (ASR) y traducción de voz basado en la arquitectura Whisper, desarrollada originalmente por OpenAI. Se trata de una versión podada y ajustada del modelo `openai/whisper-large-v3`, en la que el número de capas del decodificador se ha reducido de 32 a 4, manteniendo el codificador completo. El resultado es un modelo con 808.878.080 parámetros que ofrece una transcripción mucho más rápida que el modelo original, con una degradación mínima de la calidad.

Este checkpoint concreto está publicado en Hugging Face por el usuario `vkshdev` y replica la arquitectura y configuración del modelo `openai/whisper-large-v3-turbo`. Está pensado para tareas de transcripción de audio y traducción de voz en un entorno de producción donde la latencia es crítica. Soporta 99 idiomas y se distribuye bajo licencia MIT, lo que permite su uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 808.878.080 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 30 segundos de audio por pasada (ventana fija; no hay contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su (99 en total) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper, un transformer encoder-decoder que procesa audio en ventanas fijas de 30 segundos. El codificador toma espectrogramas log-Mel de 80 canales y los transforma en una representación de contexto, mientras que el decodificador genera texto autoregresivamente, incluyendo marcas de tiempo y el idioma detectado. En esta variante turbo, el decodificador se ha podado de 32 a 4 capas, lo que reduce significativamente el coste computacional sin alterar el codificador.

El modelo original Whisper fue entrenado con más de 5 millones de horas de audio etiquetado, recopilado de fuentes diversas y con supervisión débil. Esta versión turbo es un ajuste fino de una versión podada de `whisper-large-v3`, tal y como se describe en la discusión oficial de OpenAI. No se han aplicado técnicas de RLHF ni DPO en esta variante; el ajuste se centra en la poda de capas y el posterior finetuning para recuperar parte de la precisión perdida. La innovación principal es la optimización de velocidad mediante reducción de la profundidad del decodificador, manteniendo una calidad de transcripción cercana al modelo completo.

## Capacidades

- Transcripción de voz en 99 idiomas con detección automática del idioma de origen.
- Traducción de voz a inglés mediante el ajuste del parámetro `task` a `translate`.
- Generación de marcas de tiempo a nivel de frase y de palabra.
- Robustez a ruido, acentos y variaciones dialectales en entornos zero-shot, gracias al entrenamiento con datos masivos y variados.
- Compatibilidad con las heurísticas de decodificación de Whisper: *temperature fallback*, condición sobre tokens anteriores, umbral de compresión y umbral de "no speech".
- Procesamiento de audio de longitud arbitraria mediante la estrategia de *chunking* de 30 segundos.
- No soporta tool calling ni razonamiento multi-paso; es un modelo exclusivamente de audio a texto.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede transcribir conversaciones largas dividiendo el audio en segmentos de 30 segundos, con marcas de tiempo por frase para facilitar la revisión posterior.
- Subtitulado automático de vídeo: la generación de *timestamps* a nivel de palabra permite sincronizar subtítulos en tiempo real, tanto en directo como en postproducción.
- Atención al cliente con voz: integrado en sistemas de IVR, transcribe llamadas de soporte y permite el análisis posterior de quejas o consultas, gracias a su licencia MIT y su bajo coste de despliegue.
- Traducción de contenido de vídeo o audio: la función de traducción a inglés permite subtitular contenido en otros idiomas, útil para equipos de localización de medios.
- Análisis de llamadas de ventas: transcribe llamadas y extrae información relevante para CRM o sistemas de análisis de calidad, combinando la transcripción con modelos de lenguaje posteriores.
- Accesibilidad para personas con discapacidad auditiva: genera subtítulos en tiempo real en aplicaciones de videollamada o difusión, aprovechando su baja latencia.
- Documentación de archivos de audio históricos: transcribe grabaciones antiguas o entrevistas de investigación, con soporte para un amplio abanico de idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El autor del modelo indica que la reducción de capas del decodificador provoca una degradación mínima de la calidad, pero no se aportan cifras concretas de precisión en conjuntos como LibriSpeech, Common Voice o FLEURS. Para evaluar su rendimiento sería necesario ejecutar pruebas comparativas con `openai/whisper-large-v3` y otras variantes turbo.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP16, el modelo ocupa aproximadamente 1,6 GB. Teniendo en cuenta activaciones y buffers, se recomiendan entre 2 y 4 GB de VRAM.
- GPU recomendadas: cualquier tarjeta con 4 GB o más de VRAM, como una NVIDIA RTX 3060 o superior. También puede ejecutarse en GPUs más antiguas con 2 GB si se usa cuantización a 8 bits (aunque no se han publicado pesos cuantizados específicos).
- Compatibilidad con GPU de consumo: sí, es un modelo ligero que cabe en la mayoría de tarjetas gráficas de consumo.
- Opciones de despliegue: compatible con la librería Transformers de Hugging Face mediante la clase `pipeline` de ASR, o con la API directa de `AutoModelForSpeechSeq2Seq`. También puede integrarse con `faster-whisper` o CTranslate2 para optimizar la inferencia en CPU, aunque esta integración no está documentada en la ficha del modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Capas decoder | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| openai/whisper-large-v3 | ~1.5B (no disponible en la info) | 32 | 30 s de audio | MIT | safetensors |
| openai/whisper-large-v3-turbo | ~0.8B | 4 | 30 s de audio | MIT | safetensors |
| vkshdev/whisper-large-turbo-0.8B | 808.878.080 | 4 | 30 s de audio | MIT | safetensors |

La variante turbo es idéntica en arquitectura a este modelo, pero publicada por OpenAI. No se dispone de datos de benchmarks comparativos entre estas versiones en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinación en audio silencioso o con ruido: Whisper puede generar texto inventado en segmentos sin voz, especialmente si se activan heurísticas como el umbral de "no speech".
- Calidad variable según el idioma: los idiomas con menos representación en los datos de entrenamiento pueden presentar tasas de error superiores.
- El checkpoint publicado por `vkshdev` tiene 0 descargas y no está verificado; podría tratarse de un reupload o una modificación sin auditoría independiente.
- No es un modelo de propósito general: no soporta generación de texto libre ni razonamiento, solo tareas de audio a texto y traducción de voz.
- La ventana fija de 30 segundos requiere estrategias de *chunking* para audios largos, lo que puede introducir cortes en la transcripción si no se gestiona correctamente.
- La licencia MIT permite uso comercial, pero se debe mantener el aviso de copyright original en las redistribuciones.

## Enlaces

- Hugging Face: https://huggingface.co/vkshdev/whisper-large-turbo-0.8B
- Modelo base original: https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio de Whisper en GitHub: https://github.com/openai/whisper
- Paper original: [Robust Speech Recognition via Large-Scale Weak Supervision](https://huggingface.co/papers/2212.04356)
- Discusión sobre la variante turbo: https://github.com/openai/whisper/discussions/2363
