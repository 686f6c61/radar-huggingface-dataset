# SXDE/faster-whisper-small

## Resumen

Este repositorio contiene la conversión del modelo `openai/whisper-small` al formato CTranslate2. Lo desarrolla el usuario SXDE, y su objetivo es ofrecer una versión optimizada para su uso con la librería `faster-whisper`, que acelera la inferencia en CPU y GPU. Resuelve el problema del reconocimiento automático de voz (ASR) con un modelo que soporta una amplia lista de idiomas. Es relevante ahora porque permite desplegar transcripción de audio en producción con un rendimiento mejorado. La arquitectura subyacente es Whisper (encoder-decoder transformer) y el tamaño del repositorio es de 0,5 GB. La longitud de contexto no está disponible en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) |
| Parámetros totales | no disponible |
| Parámetros activos | No aplica (modelo no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP16 por defecto; otros tipos configurables mediante `compute_type` en CTranslate2 |
| Idiomas soportados | en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su |
| Licencia | MIT |
| Formato de pesos | CTranslate2 |

## Arquitectura y entrenamiento

El modelo es una conversión directa de `openai/whisper-small` al formato CTranslate2. La arquitectura subyacente es la de Whisper, un transformer encoder-decoder diseñado para reconocimiento de voz. La conversión se realizó con el comando `ct2-transformers-converter`, conservando el archivo `tokenizer.json` y aplicando cuantización en FP16. No se dispone de información sobre los datos de entrenamiento, el número de tokens ni procesos de alineación como RLHF o DPO en la información proporcionada. La única innovación destacable es la conversión a CTranslate2, que permite una inferencia más rápida y eficiente gracias a la posibilidad de cambiar el tipo de cómputo.

## Capacidades

- Transcripción de audio a texto en los idiomas soportados según los metadatos del modelo.
- Segmentación temporal de la transcripción, con tiempos de inicio y fin por segmento, tal como se muestra en el ejemplo de uso.
- Optimizado para velocidad y eficiencia mediante CTranslate2, lo que lo hace adecuado para aplicaciones de producción.
- Compatible con la librería `faster-whisper`, que ofrece una API sencilla para transcribir archivos de audio.
- Permite seleccionar el tipo de cómputo (FP16, int8, etc.) en tiempo de carga mediante la opción `compute_type` de CTranslate2.
- No se dispone de información sobre soporte de tool calling, funciones de agente o razonamiento multi-paso.

## Casos de uso

- Transcripción de reuniones: se puede usar `faster-whisper` para transcribir grabaciones de reuniones y obtener un texto con timestamps, lo que facilita la búsqueda y el análisis posterior. Es adecuado porque soporta una amplia variedad de idiomas y su formato CTranslate2 permite una inferencia ágil.
- Subtitulación automática de vídeos: el modelo puede generar subtítulos en varios idiomas para vídeos, lo que mejora la accesibilidad y la distribución global. La segmentación temporal permite sincronizar los subtítulos con el contenido audiovisual.
- Análisis de llamadas de atención al cliente: transcribir llamadas telefónicas para extraer información, detectar problemas y evaluar la calidad del servicio. La licencia MIT permite su integración en sistemas comerciales.
- Accesibilidad para personas con discapacidad auditiva: generar transcripciones de audio en directo, lo que permite a las personas sordas seguir conversaciones o eventos. El modelo está diseñado para procesar audio de forma eficiente.
- Indexación de contenido multimedia: convertir el audio de vídeos y podcasts a texto para crear índices de búsqueda y facilitar la recuperación de información.
- Procesamiento por lotes en pipelines de datos: integrar el modelo en un pipeline Python para transcribir grandes volúmenes de audio de forma automatizada, aprovechando la eficiencia de CTranslate2.
- Transcripción en entornos multilingües: el modelo puede transcribir audio en cualquiera de los idiomas soportados, lo que permite procesar contenido en varios idiomas sin cambiar de modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otros.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 0,5 GB, pero no se puede estimar la VRAM total sin más datos.
- GPU recomendadas: no disponible.
- Capacidad para ejecutarse en GPU de consumo: no disponible.
- Opciones de despliegue: CTranslate2 y proyectos basados en CTranslate2 como `faster-whisper`. También se puede usar en CPU con el tipo de cómputo adecuado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| SXDE/faster-whisper-small | Whisper | no disponible | no disponible | MIT | CTranslate2 | HuggingFace |
| openai/whisper-small | Whisper | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| guillaumekln/faster-whisper-small | Whisper | no disponible | no disponible | MIT | CTranslate2 | HuggingFace |

La comparativa muestra que `SXDE/faster-whisper-small` es una conversión de `openai/whisper-small`, con el mismo rendimiento teórico, pero en un formato optimizado para CTranslate2. No se dispone de datos de benchmarks para comparar.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos, riesgo de alucinación o limitaciones específicas del modelo en la información proporcionada.
- La longitud de contexto no está especificada, por lo que se desconoce el límite de duración de audio que puede procesar en una sola pasada.
- El modelo es una conversión del original de OpenAI; para conocer más advertencias, se debe consultar la model card original.
- La cuantización FP16 puede reducir la precisión en comparación con FP32, aunque CTranslate2 permite cambiar el tipo de cómputo.
- La licencia MIT permite uso comercial, pero se recomienda revisar las condiciones de la licencia del modelo original.

## Enlaces

- https://huggingface.co/SXDE/faster-whisper-small
- https://huggingface.co/openai/whisper-small
- https://github.com/OpenNMT/CTranslate2
- https://github.com/systran/faster-whisper
- https://opennmt.net/CTranslate2/quantization.html
- https://aiindigo.com/tool/faster-whisper-small
- https://huggingface.co/guillaumekln/faster-whisper-small
