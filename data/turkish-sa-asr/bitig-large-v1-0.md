# turkish-sa-asr/bitig-large-v1.0

## Resumen

bitig-large-v1.0 es un modelo de reconocimiento automático del habla (ASR) especializado en turco, desarrollado por el colectivo turkish-sa-asr. Se trata de un fine-tuning de openai/whisper-large-v3 sobre el que se ha aplicado un pipeline de normalización de texto específico para turco (denominado tr-norm-v1), que afecta directamente a cómo se calcula y se reporta la tasa de error de palabra (WER). El modelo se distribuye con acceso restringido en HuggingFace y una licencia de tipo "pre-release-evaluation", lo que condiciona su uso.

Con 1.543.490.560 parámetros, hereda la arquitectura encoder-decoder transformer de Whisper large-v3 y su ventana de contexto de audio de 30 segundos por segmento. Su relevancia radica en que cubre un hueco concreto: ASR de alta calidad para turco con métricas declaradas sobre tres conjuntos de evaluación distintos (FLEURS, Common Voice 17.0 y sesiones parlamentarias de WorldSpeech), lo que permite evaluar el rendimiento tanto en habla leída como en habla espontánea y de dominio parlamentario.

El modelo está pensado para inferencia con la pila de Whisper (transformers, CTranslate2/faster-whisper), lo que facilita su integración en pipelines existentes de transcripción. No obstante, su estado de "pre-release" y su licencia restrictiva implican que debe tratarse como un artefacto de evaluación y no como un componente listo para producción sin revisión legal previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper large-v3 (encoder-decoder transformer) |
| Parametros totales | 1.543.490.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, heredada de Whisper) |
| Tipos de cuantizacion | no disponible (formato safetensors; compatible con CTranslate2/faster-whisper para conversión a int8/float16) |
| Idiomas soportados | turco (tr) |
| Licencia | pre-release-evaluation (licencia "other" en HuggingFace) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-large-v3, un transformer encoder-decoder diseñado para ASR multilingüe. El encoder procesa espectrogramas mel de 30 segundos y el decoder genera tokens de texto de forma autorregresiva. El fine-tuning se ha realizado sobre datos de habla en turco, según indican los tags del repositorio, con evaluación sobre google/fleurs (config tr_tr), mozilla-foundation/common_voice_17_0 (config tr) y disco-eth/WorldSpeech (config tr_tr).

La innovación técnica destacable no está en la arquitectura, sino en el pipeline de normalización de texto tr-norm-v1, que se aplica antes de calcular el WER. Esto implica que las métricas reportadas son sensibles a dicha normalización y no son directamente comparables con WER calculados con otras convenciones de normalización. No se dispone de información sobre el número de tokens de audio de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a ASR). Tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Transcripción de voz a texto en turco, incluyendo habla leída y habla espontánea.
- Reconocimiento de habla en dominios específicos como sesiones parlamentarias (evaluado en WorldSpeech).
- Compatibilidad con la pila de Whisper: transformers, CTranslate2 y faster-whisper.
- Procesamiento de segmentos de audio de hasta 30 segundos, con posibilidad de encadenar segmentos para audios más largos mediante los pipelines estándar de Whisper.
- Integración con endpoints compatibles (tag endpoints_compatible).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio más allá de ASR ni modo "thinking".
- Capacidad multilingüe limitada: el modelo está especializado exclusivamente en turco (tag de idioma tr).

## Casos de uso

- Transcripción de reuniones y actas parlamentarias: el modelo se ha evaluado específicamente sobre sesiones parlamentarias de WorldSpeech (WER 8,57), por lo que es adecuado para digitalizar debates legislativos y generar actas con revisión humana posterior.
- Subtitulado automático de contenido audiovisual en turco: con un WER de 5,15 en Common Voice 17.0, puede generar subtítulos preliminares para vídeo y series, reduciendo el trabajo de corrección manual.
- Atención al cliente y análisis de llamadas: transcripción de grabaciones de call centers en turco para extracción de motivos de consulta, control de calidad y análisis de sentimiento sobre el texto resultante.
- Investigación lingüística y corpus de habla: generación de transcripciones a gran escala de FLEURS y otros corpus turcos para estudios fonéticos, léxicos o sociolingüísticos.
- Accesibilidad: conversión de audio a texto para personas con discapacidad auditiva en entornos donde el turco es la lengua principal.
- Pipelines de voz a texto en aplicaciones móviles o de escritorio: mediante faster-whisper y cuantización int8, puede desplegarse en servidores modestos para dictado y búsqueda por voz.
- Evaluación comparativa de ASR en turco: al publicar métricas sobre tres conjuntos distintos con una normalización explícita, sirve como referencia para comparar otros sistemas ASR en turco.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados por un tercero):

| Dataset | Config / split | Métrica | Valor |
|---|---|---|---|
| google/fleurs | tr_tr / validation | WER (tr-norm-v1) | 5,94 |
| mozilla-foundation/common_voice_17_0 | tr / validation | WER (tr-norm-v1) | 5,15 |
| disco-eth/WorldSpeech (5 sesiones parlamentarias held-out) | tr_tr / dev | WER (tr-norm-v1) | 8,57 |

No se han publicado en la información disponible resultados de benchmarks comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni métricas adicionales como CER, RTF o latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~1,54 mil millones de parámetros, en float16 requiere aproximadamente 3 GB de VRAM para los pesos, más memoria para activaciones y buffers de audio; en la práctica, entre 4 y 6 GB de VRAM suele ser suficiente para inferencia por lotes pequeños.
- GPU recomendadas: NVIDIA A100 o H100 para despliegues de alto throughput; RTX 4090, RTX 3090 o RTX A5000 para servidores de gama alta; RTX 3060 (12 GB) o superiores para uso en estación de trabajo.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 6-8 GB de VRAM, especialmente si se convierte a int8 mediante CTranslate2.
- Opciones de despliegue: transformers (pipeline de ASR), CTranslate2/faster-whisper (recomendado para producción por su menor latencia y consumo), y servidores compatibles con endpoints de HuggingFace. No se documenta soporte explícito para vLLM, llama.cpp u Ollama, que no son adecuados para modelos ASR de este tipo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bitig-large-v1.0 | 1.543.490.560 | 30 s por segmento | tr | pre-release-evaluation (other) | Gated en HuggingFace |
| openai/whisper-large-v3 | ~1.550 millones | 30 s por segmento | multilingüe | MIT (según el modelo base) | Abierto en HuggingFace |
| openai/whisper-large-v3-turbo | ~809 millones | 30 s por segmento | multilingüe | MIT (según el modelo base) | Abierto en HuggingFace |

No se dispone de datos de benchmarks de bitig-large-v1.0 frente a whisper-large-v3 o whisper-large-v3-turbo en turco dentro de la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia "pre-release-evaluation": no está pensada para uso comercial en producción; es imprescindible revisar las condiciones exactas en HuggingFace antes de cualquier despliegue.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que añade fricción a la integración automatizada.
- Métricas no verificadas: los WER declarados proceden del autor y no han sido validados por un tercero independiente.
- Normalización específica (tr-norm-v1): los WER reportados no son directamente comparables con los de otros sistemas que usen convenciones de normalización distintas.
- Especialización monolingüe: el modelo solo soporta turco; no debe esperarse un rendimiento aceptable en otros idiomas.
- Riesgo de alucinación: como todo modelo generativo de ASR, puede producir texto plausible pero incorrecto en segmentos con ruido, solapamiento de hablantes o acentos no representados en el entrenamiento.
- Sesgos potenciales: al entrenarse sobre corpus como FLEURS y Common Voice, puede heredar sesgos de representación demográfica y de dominio (habla leída frente a espontánea).
- Limitación de contexto de audio: segmentos de 30 segundos; audios largos requieren segmentación y ensamblaje, con riesgo de errores en las fronteras.
- Estado "pre-release": la información sobre entrenamiento, datos y calibración es escasa, lo que dificulta evaluar su robustez en dominios no vistos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/turkish-sa-asr/bitig-large-v1.0
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset Common Voice 17.0: https://huggingface.co/datasets/mozilla-foundation/common_voice_17_0
- Dataset WorldSpeech: https://huggingface.co/datasets/disco-eth/WorldSpeech
