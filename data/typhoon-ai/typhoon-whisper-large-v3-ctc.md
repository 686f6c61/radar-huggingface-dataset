# typhoon-ai/typhoon-whisper-large-v3-ctc

## Resumen

`typhoon-whisper-large-v3-ctc` es un modelo de alineación forzada y reconocimiento de voz automático (ASR) para tailandés, desarrollado por Typhoon AI, el laboratorio de investigación de inteligencia artificial de Tailandia. El modelo consiste en un cabezal CTC de 29 millones de parámetros montado sobre el encoder congelado de `typhoon-whisper-large-v3`, una variante de Whisper large v3 adaptada al tailandés. Con una sola pasada por el encoder, el modelo produce tanto la transcripción como los timestamps a nivel de palabra y de carácter, lo que lo convierte en una herramienta eficiente para tareas de alineación y subtitulado.

El modelo resuelve el problema de la falta de alineadores precisos para tailandés, un idioma con características tonales y ortográficas que dificultan los métodos tradicionales basados en HMM o en modelos fonéticos. Al emplear un enfoque CTC sobre un encoder robusto, consigue una precisión de alineación del orden de milisegundos (jitter de 2 ms en consistencia interna) y un error de transcripción (CER) del 6,72 % en el benchmark GigaSpeech2-typhoon. El modelo está pensado tanto para alinear texto dado (transcripción o hipótesis ASR) como para transcribir directamente mediante decodificación CTC greedy.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones, y está disponible en Hugging Face con un tamaño de repositorio de 0,1 GB, incluyendo los pesos del cabezal, la configuración y el vocabulario. Su arquitectura ligera (solo el cabezal es entrenable) facilita su integración en pipelines de procesado de audio para tailandés, ya que el encoder congelado puede descargarse automáticamente en una revisión fijada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Whisper large v3 congelado (50 Hz) + cabezal Transformer CTC de 29M de parámetros |
| Parametros totales | 29M (cabezal CTC) + encoder congelado de ~1.5B (no entrenables) |
| Parametros activos | No aplica (no es MoE; el encoder está congelado) |
| Longitud de contexto | No aplica (entrada de audio, sin contexto textual) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Tailandés (th) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (`head.safetensors`), `config.json`, `ctc_vocab.json` (80 símbolos), script `standalone_align.py` |

## Arquitectura y entrenamiento

El modelo parte del encoder de `typhoon-whisper-large-v3`, que es una adaptación de Whisper large v3 para tailandés. Este encoder se mantiene congelado (revisión fija `748e8a4`) y procesa la señal de audio a una resolución temporal de 50 Hz (una trama cada 20 ms). Sobre las representaciones del encoder se añade un cabezal Transformer de 29 millones de parámetros que produce posteriores por carácter a cada trama. La alineación se realiza mediante CTC (Connectionist Temporal Classification) contra el texto dado, generando segmentos de carácter sobre una rejilla de 20 ms. Las palabras se agrupan usando el segmentador `pythainlp` (newmm) o una segmentación proporcionada por el usuario.

El entrenamiento se realizó sobre 1.000 horas de audio del dataset GigaSpeech2-th. No se mencionan técnicas de RLHF ni DPO; el modelo se entrena exclusivamente con la pérdida CTC. La innovación principal es que una única pasada por el encoder produce simultáneamente la transcripción (decodificación CTC greedy) y la alineación, evitando tener que ejecutar dos modelos separados. El cabezal es compacto (29M) y el encoder congelado se descarga automáticamente, lo que simplifica el despliegue.

## Capacidades

- Alineación forzada de texto a timestamps a nivel de palabra y de carácter para tailandés, con precisión de milisegundos (jitter de 2 ms en consistencia interna).
- Transcripción ASR directa mediante decodificación CTC greedy, sin necesidad de texto previo.
- Generación de timestamps sobre una rejilla de 20 ms, con una convención de mitad de trama que introduce un sesgo constante corregible de −20 ms.
- Segmentación de palabras integrada mediante `pythainlp` (newmm), o segmentación personalizada proporcionada por el usuario.
- Compatibilidad con cualquier texto de entrada (transcripción manual o hipótesis ASR) para forzar la alineación.
- Funciona como un modelo compacto de ASR (cabezal CTC) y como alineador, ambos en una sola pasada por el encoder.
- No incluye capacidades de visión, tool calling ni agentes; es exclusivamente para audio y texto.

## Casos de uso

- Subtitulado automático para tailandés: el modelo genera timestamps precisos a nivel de palabra, lo que permite sincronizar subtítulos en vídeos, podcasts o entrevistas. Su baja latencia y precisión (onset p50 de 25 ms frente a ground truth) lo hacen adecuado para producción.
- Análisis de conversaciones y entrevistas: en investigación social o lingüística, permite alinear transcripciones con audio para estudiar pausas, solapamientos y turnos de habla. El benchmark C-COST muestra una correlación de 0.988 con pausas por hablante.
- Entrenamiento de sistemas TTS: la alineación forzada es un paso previo en la creación de datasets de texto-audio para síntesis de voz. El modelo proporciona timestamps con sesgo constante corregible, útil para entrenar modelos de duración.
- Verificación de transcripciones ASR: se puede usar para comparar la hipótesis de un ASR con el audio y detectar errores de alineación o de contenido, mejorando la calidad de los subtítulos generados automáticamente.
- Indexación de audio y búsqueda por palabras clave: al obtener timestamps de palabra, se pueden construir índices de audio que permitan saltar a la posición exacta donde se menciona un término, útil en archivística y medios.
- Evaluación de sistemas de reconocimiento de voz: el modelo sirve como herramienta de evaluación para medir la precisión temporal de otros ASR, ya que puede forzar la alineación de sus hipótesis y comparar con el audio original.
- Aplicaciones de accesibilidad: generación de subtítulos en tiempo real para personas con discapacidad auditiva, aunque requeriría una implementación de streaming; el modelo está diseñado para audio completo, no para streaming (no se menciona).

## Benchmarks y rendimiento

La model card reporta los siguientes resultados:

| Métrica | Valor |
|---|---|
| Greedy CER (modo ASR) en GigaSpeech2-typhoon | 6,72 % |
| Jitter de alineación (consistencia solo, con texto exacto) | 2,0 ms |
| Onset p50 vs ground truth de TTS (thai-aligner-bench-dev) | 25 ms (grid GT de 25 ms) |
| Sesgo de onset (constante, corregible) | −20 ms (convención de mitad de trama) |
| Correlación de pausas por hablante (r) en thai-aligner-bench-dev | 0,988 (XLSR: 0,961, MFA-Thai: 0,767, MMS: 0,752) |
| Errores > 100 ms | 0,09 % (XLSR: 0,20 %) |
| Word-onset p50 en entrevistas anotadas por humanos (C-COST) | 48,3 ms (sesgo constante +47 ms, jitter tras corrección 20,3 ms) |

No se proporcionan comparativas con otros modelos en tareas de ASR estándar como MMLU o HumanEval, ya que no es un modelo de lenguaje general.

## Requisitos de hardware

- El cabezal CTC tiene solo 29M de parámetros, pero el encoder congelado de Whisper large v3 tiene ~1.5B de parámetros. En FP16, el encoder ocupa aproximadamente 3 GB de VRAM, más la memoria para el cabezal y los buffers de audio.
- Se recomienda una GPU con al menos 6 GB de VRAM para inferencia en FP16; una GPU de gama media como RTX 3060 o superior sería suficiente.
- Para procesamiento por lotes o audio largo, se necesitará más memoria; una GPU con 8-12 GB (p. ej., RTX 3080, RTX 4070) es adecuada.
- No se proporcionan datos de latencia o throughput en la información disponible.
- Opciones de despliegue: el script `standalone_align.py` incluido permite ejecutar el modelo directamente con Python y las dependencias estándar (torch, torchaudio, transformers, safetensors, soundfile, pythainlp). No se menciona compatibilidad con vLLM, Ollama o TGI, ya que es un modelo de audio, no un LLM.
- El modelo puede ejecutarse en CPU, aunque la inferencia será mucho más lenta; se recomienda GPU para uso en producción.

## Comparativa con modelos similares

El modelo se compara con otros alineadores y ASR para tailandés en las métricas de alineación del benchmark thai-aligner-bench-dev:

| Modelo | Correlación de pausas (r) | Errores > 100 ms | Notas |
|---|---|---|---|
| typhoon-whisper-large-v3-ctc | 0,988 | 0,09 % | Alineador CTC sobre encoder Whisper congelado |
| XLSR (wav2vec2) | 0,961 | 0,20 % | Modelo de representación de audio, usado como alineador |
| MFA-Thai (Montreal Forced Aligner) | 0,767 | No disponible | Alineador tradicional basado en HMM |
| MMS (Meta Multilingual Speech) | 0,752 | No disponible | Modelo ASR multilingüe de Meta |

En cuanto a ASR, el modelo reporta un CER del 6,72 % en GigaSpeech2-typhoon, aunque no se ofrecen comparativas con otros ASR tailandeses en la misma tabla. El modelo base `typhoon-whisper-large-v3` es un Whisper large v3 adaptado, que probablemente tenga un CER similar o mejor, pero no se dispone de esos datos. La ventaja principal de este modelo frente a un Whisper estándar es su capacidad de alineación forzada sin necesidad de herramientas externas.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para tailandés; no soporta otros idiomas. Intentar usarlo con audio en otros idiomas producirá resultados sin sentido.
- La alineación depende de la calidad del texto de entrada. Si el texto no coincide con el audio (por ejemplo, errores de transcripción), el modelo puede producir alineaciones incorrectas o fallar.
- El sesgo constante de −20 ms (convención de mitad de trama) debe corregirse si se requiere una precisión absoluta, aunque es un desplazamiento fijo y fácil de compensar.
- No se han evaluado sesgos de género, acento o dialecto en la información proporcionada. El entrenamiento se realizó sobre GigaSpeech2-th, que puede tener un sesgo hacia el tailandés estándar y habla clara.
- El modelo no es un sistema de streaming; procesa audio completo. Para aplicaciones en tiempo real se necesitaría un diseño adicional.
- La licencia Apache 2.0 permite uso comercial, pero el encoder subyacente (Whisper large v3) tiene su propia licencia (MIT en el caso de OpenAI), por lo que no hay conflicto, pero conviene verificar los términos del modelo base.
- El tamaño del repositorio (0,1 GB) no incluye el encoder congelado, que se descarga automáticamente; esto puede aumentar el uso de disco y memoria.

## Enlaces

- Hugging Face: [typhoon-ai/typhoon-whisper-large-v3-ctc](https://huggingface.co/typhoon-ai/typhoon-whisper-large-v3-ctc)
- Modelo base: [typhoon-ai/typhoon-whisper-large-v3](https://huggingface.co/typhoon-ai/typhoon-whisper-large-v3)
- Paper técnico (referencia): [Typhoon ASR Real-time technical report](https://arxiv.org/abs/2601.13044)
- Dataset GigaSpeech2-typhoon: [typhoon-ai/gigaspeech2-typhoon](https://huggingface.co/datasets/typhoon-ai/gigaspeech2-typhoon)
- Benchmark de alineación tailandesa: [wayu-ai/thai-aligner-bench-dev](https://huggingface.co/datasets/wayu-ai/thai-aligner-bench-dev)
- Dataset C-COST (entrevistas anotadas): [paper](http://www.lrec-conf.org/proceedings/lrec2026/pdf/2026.lrec2026-1.247.pdf) y [datos](https://zenodo.org/records/17366698)
- Sitio oficial de Typhoon: [https://opentyphoon.ai/](https://opentyphoon.ai/)
