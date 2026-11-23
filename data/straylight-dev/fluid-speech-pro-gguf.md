# Straylight-dev/fluid-speech-pro-gguf

## Resumen

Fluid Speech Pro es un modelo de reconocimiento automático del habla (ASR) desarrollado por FluidVoice Labs, construido sobre la arquitectura NVIDIA Parakeet TDT 0.6B v3 y entrenado con datos de Moondream Parakeet Ultra. Resuelve el problema de la transcripción multilingüe de audio en 25 lenguas europeas con detección automática de idioma, en un formato compacto de aproximadamente 627 millones de parámetros. Esta ficha describe la conversión no oficial a GGUF publicada por Straylight-dev para su uso con la librería transcribe.cpp.

El modelo emplea la arquitectura Token-and-Duration Transducer (TDT) de Parakeet, un diseño encoder-decoder con decodificación conjunta de tokens y duraciones que permite transcripciones precisas y eficientes. La conversión a GGUF con cuantización Q8_0 reduce el peso a unos 739 MB, lo que facilita su despliegue en entornos con recursos limitados o en CPU. Es relevante ahora porque ofrece una alternativa de código abierto (CC BY 4.0) para transcripción multilingüe en producción, con un formato compatible con el ecosistema transcribe.cpp.

La conversión es offline (no streaming) y omite algunos componentes del modelo original (el bloque pre-Conformer y los adaptadores de modo limpio), lo que puede degradar ligeramente el rendimiento en audio con ruido. Aun así, mantiene el diseño estándar de Parakeet TDT 0.6B v3, lo que garantiza compatibilidad con cualquier implementación que cargue esa variante.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Token-and-Duration Transducer (TDT), basada en NVIDIA Parakeet TDT 0.6B v3 |
| Parámetros totales | 627.052.166 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (único archivo publicado) |
| Idiomas soportados | 25 lenguas europeas: en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt |
| Licencia | CC BY 4.0 |
| Formato de pesos | GGUF (transcribe.cpp), convertido desde `.nemo` original |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Token-and-Duration Transducer (TDT) de Parakeet, un diseño que combina un encoder Conformer con un decodificador que predice conjuntamente tokens de texto y duraciones de emisión. Esta variante permite una decodificación más eficiente que los transductores clásicos al modelar explícitamente la duración de cada token, lo que se traduce en menor latencia y mejor alineación temporal. El modelo original se distribuye en formato `.nemo` y esta conversión lo reorganiza en el layout estándar `tdt-0.6b-v3` para transcribe.cpp.

Los detalles concretos sobre el volumen de datos de entrenamiento, la composición del dataset y si se aplicaron técnicas de RLHF o ajuste fino supervisado no están disponibles en la información proporcionada. La model card indica que el modelo se construyó sobre NVIDIA Parakeet TDT 0.6B v3 y Moondream Parakeet Ultra, pero no detalla el proceso de entrenamiento. La conversión a GGUF omite el bloque pre-Conformer (`encoder.fv_insert.*`) y los adaptadores de modo limpio (`clean_mode.*`), que no tienen cabida en transcribe.cpp; el autor advierte que el audio con ruido puede verse ligeramente afectado.

## Capacidades

- Transcripción automática del habla (ASR) offline, sin streaming.
- Detección automática de idioma entre 25 lenguas europeas.
- Soporte multilingüe amplio: lenguas germánicas, románicas, eslavas, bálticas, urálicas y griego.
- Decodificación TDT con modelado de duraciones, orientada a eficiencia y alineación temporal.
- Compatibilidad con transcribe.cpp en cualquier implementación que cargue la variante `tdt-0.6b-v3`, incluida la decodificación TDT con búfer.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y actas: el modelo puede convertir grabaciones de audio multilingües en texto con detección automática de idioma, adecuado para equipos distribuidos en Europa que alternan entre lenguas en una misma sesión.
- Subtitulado de vídeo y podcasts: al ser un modelo offline de 739 MB en Q8_0, se puede ejecutar en local para generar subtítulos en 25 idiomas sin depender de servicios en la nube.
- Atención al cliente y análisis de llamadas: permite transcribir conversaciones telefónicas para su posterior análisis de sentimiento o control de calidad, con la ventaja de cubrir lenguas europeas menos comunes como croata, esloveno o maltés.
- Archivística y digitalización de audio histórico: útil para transcribir entrevistas, archivos orales o material radiofónico en múltiples lenguas europeas con un único modelo.
- Investigación lingüística y corpus: facilita la creación de corpus transcritos en lenguas bálticas, urálicas y eslavas, donde las alternativas comerciales suelen tener menos cobertura.
- Asistentes de voz locales y privacidad: al ejecutarse en local con transcribe.cpp, permite integrar dictado por voz en aplicaciones de escritorio sin enviar audio a terceros.
- Accesibilidad: generación de transcripciones en tiempo casi real para personas con discapacidad auditiva en entornos multilingües europeos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 627 M de parámetros en Q8_0 (739 MB), la huella de memoria es de aproximadamente 1 GB, incluyendo overhead de runtime.
- GPU recomendadas: no disponible; al ser un modelo pequeño, cualquier GPU con al menos 2 GB de VRAM debería ser suficiente, aunque no se confirma en la documentación.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna (GTX 1650, RTX 3050, RTX 4060 o superiores), aunque el dato no está confirmado por el autor.
- Opciones de despliegue: transcribe.cpp (librería nativa del formato); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, dado que el formato GGUF es específico de transcribe.cpp para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Fluid Speech Pro (esta conversión) | 627 M | 25 europeos | no disponible | CC BY 4.0 | GGUF (transcribe.cpp) | Hugging Face |
| FluidVoice-Labs/fluid-speech-pro (original) | 627 M | 25 europeos | no disponible | CC BY 4.0 | `.nemo` | Hugging Face |
| NVIDIA Parakeet TDT 0.6B v3 | ~600 M | no disponible | no disponible | no disponible | NeMo | Hugging Face / NGC |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La diferencia principal entre esta conversión y el modelo original es el formato (GGUF frente a `.nemo`) y la omisión de los bloques pre-Conformer y de modo limpio.

## Limitaciones y advertencias

- Conversión no oficial: no está publicada ni respaldada por FluidVoice; el autor lo indica explícitamente.
- Modelo offline: no soporta streaming, solo transcripción de audio completo.
- Omisión de componentes: el bloque pre-Conformer y los adaptadores de modo limpio no están incluidos, lo que puede degradar la calidad en audio con ruido.
- Solo se publica cuantización Q8_0; no hay variantes Q4, Q5 ni FP16 en el repositorio.
- Riesgo de alucinación en pasajes de audio ambiguo o silencioso, inherente a los modelos ASR.
- Cobertura limitada a 25 lenguas europeas; no se documentan otros idiomas.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero conviene revisar los términos completos en `LICENSE` y `NOTICE`.
- Sin datos de benchmarks publicados que permitan validar el rendimiento frente a alternativas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación comunitaria.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/Straylight-dev/fluid-speech-pro-gguf
- Modelo base original: https://huggingface.co/FluidVoice-Labs/fluid-speech-pro
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- NVIDIA Parakeet TDT 0.6B v3: no disponible enlace directo en la información proporcionada
