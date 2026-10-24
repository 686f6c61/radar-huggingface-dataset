# sw-voice-ai/voxcpm2-stage2-navaratri-telugu-lr5e-5-5ep

## Resumen

voxcpm2-stage2-navaratri-telugu-lr5e-5-5ep es un punto de control (checkpoint) de texto-a-voz (TTS) publicado por el usuario sw-voice-ai en Hugging Face. Se trata de un ajuste fino completo (full fine-tune) del modelo sw-voice-ai/voxcpm2-telugu-stage1b-english-sidon-lr1e-4-10ep, que a su vez encadena un ajuste en telugu (stage 1b) con un ajuste posterior en ingles (Sidon English Swamiji). El resultado es un modelo de síntesis de voz especializado en un unico hablante y en un registro concreto: la recitacion de Navaratri en telugu.

El modelo resuelve un problema muy acotado: generar voz en telugu (te) con la identidad vocal de un hablante especifico, a partir de un corpus de solo 402 clips y 1,79 horas de audio limpio con transcripciones generadas por Gemini. No es un modelo generalista de TTS multilingue, sino un artefacto de investigacion y demostracion dentro de una cadena de ajustes sucesivos. Mantiene el ingles (en) como idioma secundario heredado de la etapa anterior.

Los datos objetivos disponibles son escasos: 2.290.004.544 parametros totales en pesos safetensors, un repositorio de 9,5 GB y licencia Apache 2.0. El autor no publica arquitectura, ventana de contexto, evaluaciones de calidad (MOS) ni resultados de benchmarks, por lo que cualquier uso en produccion exige una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no describe la arquitectura; el identificador del modelo indica la familia VoxCPM2) |
| Parametros totales | 2.290.004.544 (2,29 B) |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (modelo de texto-a-voz; no se documenta longitud de secuencia de entrada) |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors (9,5 GB para 2,29 B de parametros, consistente con almacenamiento en fp32) |
| Idiomas soportados | telugu (te) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline declarado | text-to-speech |
| Modelo base | sw-voice-ai/voxcpm2-telugu-stage1b-english-sidon-lr1e-4-10ep |
| Dataset de ajuste | sw-voice/swamiji-navaratri-telugu-clean (402 clips, 1,79 h, transcripcion `transcript_gemini`) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 24 de octubre de 2026 |

## Arquitectura y entrenamiento

El autor no documenta la arquitectura interna en la model card: no se indica si se trata de un transformer autorregresivo, de un modelo de difusion para mel-espectrogramas, de un esquema híbrido ni el vocoder asociado. Lo unico verificable es el nombre de la familia (VoxCPM2) y el tamano: 2,29 mil millones de parametros almacenados en safetensors. Tampoco se especifica la composicion del dataset original de la familia ni si hubo etapas de RLHF o DPO, algo poco habitual en TTS pero no descartable.

El proceso de entrenamiento de esta etapa si esta detallado: ajuste fino completo (todos los parametros) sobre el checkpoint de stage 2, usando el corpus `sw-voice/swamiji-navaratri-telugu-clean` con 402 clips (1,79 horas) y transcripciones generadas con Gemini. Se empleo micro-batch 2 con acumulacion de gradiente 8 (batch efectivo 16), 130 pasos de optimizacion, tasa de aprendizaje 5e-5 con decaimiento coseno, 20 pasos de warmup y recorte de gradiente de 1,0. El aprendizaje es, por tanto, muy corto (130 pasos sobre 1,79 h de audio), lo que sugiere un ajuste de estilo y timbre mas que una adaptacion linguistica profunda.

Nota de consistencia: el titulo de la model card habla de "stage 3" mientras que el identificador del repositorio usa "stage2"; se trata del tercer eslabon de la cadena de ajustes, nombrado como stage 2 respecto al checkpoint base.

## Capacidades

- Sintesis de voz (text-to-speech) en telugu a partir de texto de entrada.
- Generacion de voz en ingles, heredada del ajuste intermedio sobre el hablante Sidon.
- Reproduccion de una identidad vocal concreta (el hablante del corpus Navaratri), al ser un ajuste fino sobre 1,79 h de un solo locutor.
- Adaptacion a un dominio y registro especificos: recitacion devocional/Navaratri en telugu.
- Salida de audio directamente desde pesos safetensors mediante pipeline `text-to-speech`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio de entrada; es un modelo puramente generativo de voz.
- No se documenta modo "thinking", control de emocion, control de velocidad ni etiquetas de estilo.

## Casos de uso

- Generacion de audios devocionales en telugu: el modelo sintetiza recitaciones con la voz del hablante del corpus, adecuado para producir automaticamente versiones en audio de textos de Navaratri sin regrabar al locutor.
- Doblaje y localizacion de contenido breve al telugu: al conservar una identidad vocal estable, sirve para doblar fragmentos de video cortos donde la consistencia de timbre importa mas que la variedad expresiva.
- Audiolibros y lecturas largas en telugu: la ventana de contexto no esta documentada, por lo que el uso realista es la sintesis por fragmentos (oracion a oracion) concatenados en un pipeline propio.
- Accesibilidad y lectores de pantalla en telugu: integrable como motor TTS en aplicaciones que necesiten una voz concreta, siempre que se valide la inteligibilidad con hablantes nativos.
- Prototipado de asistentes de voz en telugu: util para demos y pruebas de concepto de IVR o asistentes conversacionales antes de contratar un servicio comercial de TTS.
- Generacion de datos sinteticos para ASR: el audio generado puede servir para aumentar corpus de entrenamiento de reconocimiento de voz en telugu, con la advertencia de que introduce sesgos del hablante y del dominio.
- Investigacion sobre cadenas de ajuste sucesivo: sirve como caso de estudio de transferencia telugu -> ingles -> telugu con presupuestos de datos muy reducidos (130 pasos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye MOS, CMOS, WER, SIM (similitud de hablante), ni comparaciones objetivas con otros sistemas. Tampoco se aportan curvas de perdida ni metricas del conjunto de validacion. Cualquier cifra de calidad debe obtenerse mediante evaluacion propia.

## Requisitos de hardware

- VRAM estimada para inferencia, solo por pesos: ~9,2 GB en fp32 (formato publicado), ~4,6 GB en fp16/bf16, ~2,3 GB en int8 y ~1,2 GB en int4 (estimaciones teoricas; no hay cuantizaciones publicadas).
- Margen adicional necesario para el vocoder, el procesado de texto y los buffers de activacion, no cuantificado en la informacion disponible.
- GPU recomendadas: A100 40 GB, H100 o L40S para servir en fp32 con holgura; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes en fp32 o bf16 para inferencia de un solo flujo.
- Consumer GPU: si cabe. Una RTX 4080/4070 Ti (16 GB) o incluso una RTX 4060 Ti (16 GB) cubren los pesos en fp16; en fp32 harian falta 12 GB o mas de VRAM libre.
- Opciones de despliegue: no hay informacion oficial sobre vLLM, llama.cpp, Ollama o TGI para este checkpoint. Al tratarse de un modelo TTS en safetensors, la via esperada es la libreria original de la familia VoxCPM2 en PyTorch (no documentada en la ficha); la conversion a GGUF no esta publicada.
- Latencia y throughput: no disponibles. No se han publicado mediciones de RTF (real-time factor) ni de audio generado por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| voxcpm2-stage2-navaratri-telugu (este modelo) | 2,29 B | no disponible | te, en | Apache 2.0 | no disponible |
| sw-voice-ai/voxcpm2-telugu-stage1b-english-sidon (modelo base) | no disponible | no disponible | te, en | no disponible en la informacion proporcionada | no disponible |
| XTTS-v2 (Coqui) | ~0,8 B (dato publico, no verificado en esta busqueda) | no disponible | multilingue | Coqui Public Model License (no comercial) | no disponible |
| VoxCPM-0.5B (OpenBMB) | ~0,5 B (dato publico, no verificado en esta busqueda) | no disponible | zh, en | Apache 2.0 | no disponible |

No se dispone de comparaciones verificadas de calidad (MOS, similitud de hablante o inteligibilidad) entre este checkpoint y alternativas. La comparativa anterior es estructural (parametros, licencia, idiomas); las cifras de modelos de terceros no provienen de la informacion proporcionada y deben confirmarse en sus fichas oficiales. Frente al modelo base, la unica diferencia documentada es el ajuste adicional de 130 pasos sobre 1,79 h de audio en telugu.

## Limitaciones y advertencias

- Corpus de entrenamiento muy pequeno (402 clips, 1,79 h) y de un solo hablante: riesgo alto de sobreajuste, prosodia plana y poca cobertura fonetica fuera del dominio devocional.
- Transcripciones generadas automaticamente con Gemini: pueden contener errores que degraden la alineacion texto-audio y la pronunciacion.
- Modelo mono-hablante: no admite cambio de voz, y la identidad vocal queda fijada al locutor del corpus.
- Riesgo de alucinacion acustica: en TTS esto se manifiesta como ruido, artefactos, repeticiones o silencios anomalos en entradas fuera de distribucion (numeros, siglas, mezcla de idiomas).
- Sin evaluacion publicada: no hay MOS, WER ni pruebas subjetivas; el rendimiento real es desconocido.
- Cobertura limitada de ingles: el ingles procede de una etapa intermedia y puede haberse degradado tras el ajuste en telugu (olvido catastrofico), sin datos que lo confirmen.
- Normalizacion del telugu no documentada: no se especifica el esquema de transliteracion ni el manejo de texto mixto te/en.
- Licencia Apache 2.0 en los pesos, pero el uso comercial exige ademas verificar los derechos de voz e imagen del hablante y las condiciones del dataset `swamiji-navaratri-telugu-clean`, no detalladas en la ficha.
- Riesgo de suplantacion de identidad y deepfakes: al ser un modelo de voz de una persona concreta, su publicacion implica riesgos de uso malicioso; conviene restringir el acceso o marcar el audio generado.
- Repositorio de 9,5 GB y cero descargas/likes: sin validacion por parte de la comunidad, sin issues ni discusiones que aporten contexto.
- Fecha de creacion declarada en octubre de 2026: verificar la vigencia y posibles actualizaciones del repositorio antes de integrarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sw-voice-ai/voxcpm2-stage2-navaratri-telugu-lr5e-5-5ep
- Modelo base (stage 1b, telugu -> Sidon English): https://huggingface.co/sw-voice-ai/voxcpm2-telugu-stage1b-english-sidon-lr1e-4-10ep
- Dataset de ajuste (referenciado en la model card): https://huggingface.co/datasets/sw-voice/swamiji-navaratri-telugu-clean
- Paper, blog o demo oficial: no disponible en la informacion proporcionada
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo (los resultados corresponden a terminos ambiguos como "SW", Star Wars o SolidWorks).
