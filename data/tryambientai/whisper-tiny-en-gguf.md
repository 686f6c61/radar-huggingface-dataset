# tryambientai/whisper-tiny.en-gguf

## Resumen

Whisper-tiny.en-gguf es la conversion a formato GGUF del modelo openai/whisper-tiny.en, realizada por el usuario tryambientai y publicada bajo la libreria transcribe.cpp. Se trata de un modelo de reconocimiento automatico del habla (ASR) de tipo encoder-decoder transformer, disenado por OpenAI y distribuido originalmente en formato transformers. Esta version concreta empaqueta los pesos en cuantizaciones GGUF (F32, F16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) para su uso con el runtime transcribe.cpp, una implementacion en C++ orientada a inferencia local eficiente.

El modelo cuenta con 37.776.736 parametros totales y esta especializado exclusivamente en ingles (en). Es la variante tiny de la familia Whisper, lo que lo situa como la opcion mas ligera y rapida de la gama, a costa de una precision inferior a la de los modelos base, small, medium y large. Su ventana de audio es de 30 segundos por segmento, con decodificacion por chunks para audio de larga duracion. La licencia es Apache-2.0, heredada del modelo base.

La relevancia de esta ficha radica en que permite ejecutar ASR en ingles en hardware muy modesto, incluyendo CPU y GPUs integradas, con un rendimiento en tiempo real notable: segun los datos del autor, alcanza un RTF (real-time factor) de 279,8 en Metal sobre un Apple M4 Max y de 78,7 en CPU sobre el mismo equipo, lo que lo hace viable para transcripcion en vivo o por lotes en entornos sin aceleradores dedicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sequence-to-sequence) |
| Parametros totales | 37.776.736 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 segundos por segmento; decodificacion por chunks para audio largo |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | ingles (en) unicamente |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

Whisper es un transformer encoder-decoder entrenado por OpenAI sobre 680.000 horas de audio etiquetado mediante supervision debil a gran escala. La variante tiny.en es la version monolingue en ingles de menor tamano de la familia, con 37,7 millones de parametros. El modelo procesa audio en ventanas de 30 segundos y genera transcripciones autoregresivamente; para audio de mayor duracion, transcribe.cpp aplica decodificacion por chunks con marcas de tiempo a nivel de segmento. No se dispone de informacion detallada sobre la composicion exacta del dataset ni sobre si se aplicaron tecnicas de RLHF o DPO en esta variante concreta; la model card original de OpenAI no las detalla para los checkpoints tiny.

La conversion a GGUF fue realizada por tryambientai a partir del commit 87c7102 de openai/whisper-tiny.en (fijado el 2026-04-25) y validada contra la referencia de transformers en el commit 5.6.1 de transcribe.cpp el 2026-04-26. Segun la model card, el modelo no soporta streaming, traduccion ni deteccion de idioma, y las marcas de tiempo son a nivel de segmento. El proceso de cuantizacion no introduce degradacion significativa en la tasa de error de palabras (WER): las variantes Q8_0 y Q6_K mantienen valores de WER en LibriSpeech test-clean muy cercanos a los de F32 y F16 (5,72% y 5,80% frente a 5,77%), lo que indica que la cuantizacion es robusta para este tamano de modelo.

## Capacidades

- Transcripcion de voz a texto en ingles (ASR) sobre audio de 16 kHz mono.
- Generacion de marcas de tiempo a nivel de segmento.
- Procesamiento de audio de larga duracion mediante decodificacion por chunks con ventanas de 30 segundos.
- Ejecucion en CPU, GPU integrada y aceleradores Metal y Vulkan a traves de transcribe.cpp.
- No soporta streaming en tiempo real segun la model card.
- No soporta traduccion de voz a texto.
- No soporta deteccion automatica de idioma.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso.
- Capacidades multilingues limitadas exclusivamente al ingles.

## Casos de uso

- Transcripcion de reuniones y notas de voz en ingles: el modelo puede procesar grabaciones de audio de 16 kHz mono y generar transcripciones con marcas de tiempo por segmento, adecuado para equipos que necesitan actas automaticas sin depender de servicios en la nube.
- Subtitulado de videos en ingles: gracias a la generacion de timestamps a nivel de segmento, se puede integrar en pipelines de postproduccion para generar archivos de subtitulos sincronizados.
- Dictado por voz en aplicaciones de escritorio: su reducido tamano (42-76 MB segun cuantizacion) permite empaquetarlo dentro de aplicaciones locales que transcriben entrada de microfono sin conexion.
- Transcripcion por lotes en servidores sin GPU: con un RTF de 26,1 en CPU Ryzen 4750U, el modelo puede procesar grandes volumenes de audio en entornos de CPU convencionales, adecuado para archivado o indexacion de contenido.
- Preprocesamiento de datos para pipelines de NLP: convertir audio en ingles a texto para alimentar sistemas de busqueda, analisis de sentimiento o resumen automatico.
- Prototipado y validacion de sistemas ASR: al ser la variante mas ligera, sirve para pruebas rapidas de integracion con transcribe.cpp antes de escalar a modelos mayores de la familia Whisper.
- Asistentes de voz embebidos en dispositivos de bajos recursos: su huella de memoria (desde 42 MB en Q4_K_M) lo hace viable en Raspberry Pi o dispositivos similares con CPU.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 5,77 | 5,77 | 5,72 | 5,80 | 5,89 | 5,99 |
| Tamano (MB) | 146 | 76 | 44 | 43 | 42 | 42 |

| Entorno | Acelerador | RTF (real-time factor) |
|---|---|---:|
| Apple M4 Max | Metal | 279,8 |
| Apple M4 Max | CPU | 78,7 |
| AMD Ryzen 4750U | Vulkan | 60,7 |
| AMD Ryzen 4750U | CPU | 26,1 |

El WER se midio sobre el split completo de LibriSpeech test-clean (2620 utterances) con la decodificacion por defecto de transcribe.cpp (greedy, suppress_tokens, temperature fallback, timestamps de segmento activados). OpenAI reporta un 5,66% en el mismo split; la diferencia se atribuye probablemente a que el pipeline de OpenAI usa `<|notimestamps|>` por defecto. Los numeros provienen de una unica ejecucion con Metal, cuyas reducciones paralelas no deterministas pueden desplazar el WER en ~0,1 pp entre ejecuciones.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones; el modelo mas grande (F32) ocupa 146 MB en disco y los cuantizados Q4_K_M y Q5_K_M tan solo 42 MB.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA) es suficiente; no requiere GPU dedicada de gama alta.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una GPU integrada Intel Iris Xe; tambien funciona exclusivamente en CPU.
- Opciones de despliegue: transcribe.cpp (unico runtime soportado segun la model card). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: con RTF de 279,8 en Metal sobre M4 Max, el modelo transcribe audio mas de 279 veces mas rapido que tiempo real en ese hardware; en CPU Ryzen 4750U el RTF es de 26,1, lo que sigue permitiendo transcripcion en tiempo real con margen.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto de audio | Licencia | Formato |
|---|---:|---|---|---|---|
| whisper-tiny.en (este) | 37,7 M | ingles | 30 s por segmento | Apache-2.0 | GGUF |
| whisper-tiny (multilingue) | 37,7 M | multilingue | 30 s por segmento | Apache-2.0 | transformers / GGUF |
| whisper-base.en | 74,4 M | ingles | 30 s por segmento | Apache-2.0 | transformers / GGUF |
| whisper-small.en | 244 M | ingles | 30 s por segmento | Apache-2.0 | transformers / GGUF |

La variante tiny.en es mas rapida que la tiny multilingue al mismo tamano y suele obtener mejor WER en ingles, a cambio de no soportar otros idiomas. Frente a base.en y small.en, tiny.en sacrifica precision (WER de 5,77% en LibriSpeech test-clean) a cambio de un tamano y unos requisitos de hardware mucho menores. No se dispone de datos de benchmarks comparativos adicionales en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente en ingles: no transcribe ni traduce otros idiomas.
- No soporta streaming ni deteccion de idioma, lo que limita su uso en aplicaciones de transcripcion en vivo con deteccion automatica de lengua.
- Riesgo de alucinacion en clips cortos o con ruido de fondo, segun advierte la propia model card al comentar la variabilidad del WER en Metal.
- Precision limitada por el tamano tiny: el WER de ~5,8% en LibriSpeech test-clean es notablemente superior al de modelos mayores de la familia Whisper en dominios dificiles o con acentos marcados.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y el usuario debe verificar los terminos de openai/whisper-tiny.en.
- Dependencia de un unico runtime (transcribe.cpp): no hay soporte documentado para otras librerias de inferencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicacion reciente y sin validacion comunitaria amplia.
- La validacion se realizo contra una unica ejecucion con Metal y puede presentar variaciones de ~0,1 pp en el WER entre ejecuciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tryambientai/whisper-tiny.en-gguf
- Modelo base: https://huggingface.co/openai/whisper-tiny.en
- Commit del modelo base: https://huggingface.co/openai/whisper-tiny.en/commit/87c7102
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Pagina del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-tiny.en.md
- Commit de validacion transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio original de OpenAI: https://github.com/openai/whisper
