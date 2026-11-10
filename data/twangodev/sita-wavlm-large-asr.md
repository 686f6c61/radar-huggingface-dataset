# twangodev/sita-wavlm-large-asr

## Resumen

Sita WavLM Large ASR es un modelo de reconocimiento automático del habla (ASR) basado en CTC, obtenido por ajuste fino (*fine-tuning*) del modelo preentrenado `microsoft/wavlm-large` sobre el corpus SITA. Lo desarrolla el usuario twangodev y está publicado en Hugging Face bajo la librería PyTorch. Su propósito es transcribir audio mono a 16 kHz en idioma hmong (código ISO `hmn`), una lengua con recursos limitados en el ecosistema ASR, por lo que el modelo cubre un nicho poco atendido por los sistemas comerciales.

La arquitectura subyacente es WavLM-large, un transformer para representaciones de voz con 315.481.820 parámetros totales (aproximadamente 315 millones), empaquetado en safetensors con un repositorio de 1,3 GB. El modelo no incluye un decodificador de lenguaje externo: la decodificación es CTC codiciosa (*greedy*), lo que simplifica el despliegue pero limita la corrección de errores léxicos.

Es relevante ahora porque ofrece una línea base abierta y reproducible para una lengua de bajos recursos, publicada junto al paquete SITA y a un paper (arXiv:2601.09050). Sus métricas declaradas —42,85 % de WER y 12,31 % de CER sobre validación disjunta por hablante— deben interpretarse como un punto de partida, no como un sistema listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WavLM-large (transformer para representaciones de voz) con cabeza CTC |
| Parametros totales | 315.481.820 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de entrada no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hmong (`hmn`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria pytorch) |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/wavlm-large`, un transformer preentrenado con objetivos de modelado enmascarado sobre representaciones de voz, y se ajusta con una cabeza de clasificación CTC para transcripción directa de audio a caracteres o subpalabras. La entrada es audio mono a 16 kHz y la salida se obtiene mediante decodificación CTC codiciosa, sin modelo de lenguaje externo ni decodificación por haces en la evaluación reportada.

El ajuste fino se realizó sobre el corpus `twangodev/sita` con el paquete SITA, según la model card. No se detalla en la información proporcionada el número de tokens, la composición exacta del dataset, la duración total de audio ni si hubo etapas de RLHF o DPO (poco habituales en ASR CTC, pero no confirmado). Tampoco se especifican innovaciones técnicas adicionales como decodificación especulativa o atención lineal; el valor del modelo reside en la adaptación de un backbone grande a una lengua de bajos recursos.

## Capacidades

- Reconocimiento automático del habla en hmong a partir de audio mono a 16 kHz.
- Transcripción directa mediante CTC codiciosa (sin modelo de lenguaje externo).
- Entrada de audio de una sola pista; no se documenta soporte multihablante ni diarización.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta comportamiento de agente ni razonamiento multi-paso.
- Multilingüismo: limitado a `hmn` según los metadatos; no se declaran otros idiomas.
- No se documentan capacidades de visión, audio generativo ni modo *thinking*.

## Casos de uso

- Transcripción de entrevistas y testimonios en hmong: el modelo convierte grabaciones mono a 16 kHz en texto para su posterior análisis cualitativo o archivo, aprovechando que está específicamente ajustado a esa lengua.
- Subtitulado de material audiovisual en hmong: uso como primer paso de ASR en un pipeline que después aplique corrección humana o un modelo de lenguaje para reducir el WER del 42,85 % declarado.
- Digitalización de archivos orales y patrimonio lingüístico: permite generar transcripciones aproximadas de colecciones de audio en hmong para indexación y búsqueda, con revisión posterior.
- Investigación lingüística y de ASR de bajos recursos: sirve como línea base reproducible (paper arXiv:2601.09050 y paquete SITA) para comparar nuevas técnicas de adaptación sobre `wavlm-large`.
- Prototipado de asistentes de voz en hmong: el modelo puede integrarse vía el runtime SITA (`load_pretrained` + `transcribe`) para validar experiencias de voz antes de invertir en datos anotados propios.
- Generación de datos pseudoetiquetados: las transcripciones CTC pueden usarse para preanotar audio no etiquetado y acelerar la creación de corpus de entrenamiento en hmong, dado el bajo CER (12,31 %) relativo al WER.

## Benchmarks y rendimiento

| Evaluacion | Greedy WER | Greedy CER |
|---|---:|---:|
| Validacion disjunta por hablante | 42,85% | 12,31% |

No se han publicado en la informacion disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 315 millones de parámetros en precisión completa (fp32) el peso ronda 1,26 GB, y en fp16/bf16 aproximadamente 0,63 GB, a lo que hay que sumar activaciones y buffers de audio.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder cargar el modelo en fp16, aunque no hay cifras oficiales.
- Cabe en GPU de consumo: previsiblemente sí (RTX 3060, RTX 4060, RTX 4090, etc.), aunque no está confirmado en la información proporcionada.
- Opciones de despliegue: el autor indica el runtime SITA (`sita_runtime-0.1.0-py3-none-any.whl`) con `load_pretrained` y `transcribe`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos ASR para hmong ni con alternativas de tamaño similar, y no se dispone de datos de benchmarks comparables.

## Limitaciones y advertencias

- WER elevado (42,85 %) en validación disjunta por hablante: no es adecuado para transcripción sin revisión humana en entornos de producción exigentes.
- El CER (12,31 %) es mucho menor que el WER, lo que sugiere errores a nivel de palabra completa (segmentación, léxico) más que de caracteres; conviene evaluar con un modelo de lenguaje o postprocesado.
- Decodificación CTC codiciosa únicamente en la evaluación reportada: sin decodificación por haces ni LM, el rendimiento puede mejorar con postprocesado, pero no está documentado.
- Idioma limitado a hmong (`hmn`); no se declaran capacidades multilingües.
- Licencia no disponible: no se puede confirmar el uso comercial; debe verificarse antes de cualquier despliegue en producción.
- Sin datos sobre sesgos, composición del dataset ni cobertura de dialectos del hmong; riesgo de sesgo hacia los hablantes y dominios presentes en `twangodev/sita`.
- Riesgo de alucinación en ASR CTC: posibilidad de transcripciones plausibles pero incorrectas en audio ruidoso o fuera de dominio.
- Dependencia del runtime SITA propietario del autor; no se documenta compatibilidad con ecosistemas estándar (Transformers, etc.).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria mínimos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/twangodev/sita-wavlm-large-asr
- Modelo base: https://huggingface.co/microsoft/wavlm-large
- Paper: https://arxiv.org/abs/2601.09050
- Dataset: https://huggingface.co/datasets/twangodev/sita
- Runtime SITA: `sita_runtime-0.1.0-py3-none-any.whl` (referenciado en la model card, sin URL directa en la informacion disponible)
