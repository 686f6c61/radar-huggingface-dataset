# trannel/trannel-thai-whisper-ct2

## Resumen

`trannel/trannel-thai-whisper-ct2` es una conversión a CTranslate2 del modelo `biodatlab/distill-whisper-th-large-v3`, una destilación de OpenAI Whisper large-v3 especializada en reconocimiento automático del habla (ASR) en tailandés. La publica el usuario trannel como artefacto de despliegue para su producto «Translator by Trannel»: no añade entrenamiento ni modifica los pesos, solo cambia el formato y aplica cuantización float16 mediante `ct2-transformers-converter`.

El problema que resuelve es concreto: ejecutar ASR en tailandés con la calidad de un large-v3 pero con un coste de inferencia menor, gracias a la reducción de capas del decoder propia de la destilación y al runtime de CTranslate2, que permite servir el modelo con faster-whisper tanto en CPU como en GPU con requisitos modestos. El repositorio ocupa 1,6 GB frente a los aproximadamente 3 GB que pesa large-v3 en float16, lo que da una idea de la reducción.

Es relevante porque faster-whisper se ha consolidado como el estándar de despliegue para ASR en producción y porque el tailandés sigue teniendo poca cobertura en modelos abiertos con licencia permisiva. La licencia MIT del modelo base facilita el uso comercial, si bien la autoría intelectual corresponde al Biomedical and Data Lab de la Universidad Mahidol, y trannel solo firma la conversión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper) con decoder destilado |
| Parámetros totales | no disponible en la model card; el repositorio de 1,6 GB en float16 sugiere del orden de 750-800 M (estimación a partir del tamaño, no confirmada) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventana de audio de 30 s (1500 frames mel); 448 tokens de contexto en el decoder |
| Tipos de cuantización | float16 en este repositorio; CTranslate2 admite además int8, int8_float16, int16 y float32 mediante reconversión con `ct2-transformers-converter` |
| Idiomas soportados | tailandés (`th`), único idioma declarado; el modelo base deriva de Whisper large-v3 multilingüe, pero no hay datos publicados sobre retención de otros idiomas tras la destilación |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (`model.bin`, `config.json`, vocabulario y tokenizer); el modelo base se distribuye en safetensors/PyTorch |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper: un transformer encoder-decoder con atención completa, entrada de espectrograma mel en ventanas de 30 segundos y decodificación autorregresiva con tokens de control para tarea (transcribir o traducir), idioma y timestamps. La variante `distill-whisper-th-large-v3` de biodatlab aplica destilación de conocimiento sobre large-v3 reduciendo el número de capas del decoder, la misma estrategia que distil-whisper, lo que recorta el coste de decodificación sin tocar el encoder. La model card no detalla el número exacto de capas eliminadas, la configuración final ni la temperatura de destilación.

Todo el entrenamiento corresponde al modelo base, publicado por el Biomedical and Data Lab de la Universidad Mahidol. Esta versión no añade fine-tuning ni cambios en los pesos: la única operación realizada es la conversión con cuantización float16. No hay información pública sobre el volumen de horas de audio tailandés, la composición del dataset, la procedencia de las transcripciones ni posibles etapas de alineación o ajuste con preferencias, algo que por otra parte no aplica a un modelo ASR.

## Capacidades

- Transcripción de voz a texto en tailandés, con salida en escritura tailandesa y puntuación generada por el modelo.
- Traducción de audio tailandés a texto en inglés: la tarea `translate` de Whisper sigue expuesta en la interfaz de faster-whisper, aunque no existe evaluación pública de su calidad en esta variante destilada.
- Generación de timestamps a nivel de segmento y, activando `word_timestamps`, a nivel de palabra mediante los pesos de atención cruzada.
- Integración con detección de actividad de voz (VAD, típicamente Silero) para segmentar audio largo en ventanas de 30 s.
- Decodificación configurable: beam search, `temperature` fallback, `condition_on_previous_text`, `no_speech_threshold` y compresión de ratio para mitigar bucles.
- Inferencia por lotes (`BatchedInferencePipeline` de faster-whisper) y ejecución en CPU con oneDNN o en GPU con CUDA/cuDNN.
- Detección automática de idioma heredada de Whisper, poco fiable en un modelo ajustado a un solo idioma.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio-visión: es exclusivamente un modelo de reconocimiento de voz.

## Casos de uso

- **Subtitulado de contenido audiovisual tailandés**: el modelo genera segmentos con timestamps que se exportan directamente a SRT/VTT; la ventana de 30 s y el modo `word_timestamps` permiten alinear subtítulos con precisión suficiente para vídeo bajo demanda.
- **Transcripción de reuniones y generación de actas**: con VAD para separar intervenciones y un pipeline por lotes, se transcriben grabaciones de una o varias horas en fragmentos de 30 s, y el texto resultante alimenta un LLM posterior para resumir.
- **Análisis de llamadas en atención al cliente**: al ejecutarse en CPU con CTranslate2, se puede desplegar en el mismo nodo que el PBX o la plataforma de telefonía, transcribiendo llamadas para control de calidad, búsqueda de motivos de contacto y cumplimiento.
- **Cadena de traducción tailandés-inglés para medios**: transcripción con la tarea `transcribe` y traducción posterior con un modelo de texto, o uso directo de la tarea `translate` cuando la latencia importa más que la fidelidad.
- **Accesibilidad y subtitulado en directo**: con `faster-whisper` en GPU de gama media y fragmentos de pocos segundos se pueden generar subtítulos casi en tiempo real en eventos o clases, aceptando el retardo inherente al chunking.
- **Digitalización y búsqueda de archivo sonoro**: indexación de entrevistas, podcasts y fondos de radio en tailandés para búsqueda full-text, usando el modelo como paso de ASR dentro de un pipeline ETL.
- **Despliegue autoalojado en pymes**: al caber en 2-3 GB de VRAM o ejecutarse íntegramente en CPU, permite ofrecer transcripción sin enviar audio a servicios en la nube, lo que simplifica el cumplimiento de protección de datos.
- **Investigación en lingüística y fonética computacional**: obtención de transcripciones y alineamientos a nivel de palabra para corpus de tailandés, siempre que se valide la tasa de error en el dominio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye WER, CER ni comparaciones con large-v3, distil-whisper o el modelo base. La búsqueda web realizada no devuelve ninguna evaluación de este checkpoint: los resultados encontrados tratan sobre la arquitectura de `large-v3-turbo`, benchmarks genéricos de ASR conversacional multilingüe y robótica social, sin relación con estos pesos. Cualquier cifra de precisión o velocidad para este modelo concreto debe medirse en el dominio de destino antes de usarlo en producción.

## Requisitos de hardware

- **VRAM estimada**: aproximadamente 1,6 GB solo para los pesos en float16; con overhead de runtime, beam search y lote pequeño, entre 2 y 3 GB. Una reconversión a int8 reduciría los pesos a alrededor de 0,8-1 GB.
- **GPU recomendadas**: cualquier GPU con 4 GB o más de VRAM (RTX 3050/3060, RTX 4060, GTX 1660 Super, T4, L4). Una A100 o H100 no aporta ventaja por modelo, solo por volumen de peticiones concurrentes.
- **Consumer GPU**: sí, cabe holgadamente en todas las GPU de consumo actuales e incluso en iGPU con suficiente memoria compartida.
- **CPU**: viable con faster-whisper y oneDNN; se recomiendan 4-8 núcleos para uso interactivo. El modelo destilado reduce la carga del decoder, que es la parte más costosa en CPU.
- **Opciones de despliegue**: faster-whisper (recomendado, es el runtime nativo de este formato), CTranslate2 directamente en Python o C++, servidores tipo wyoming-faster-whisper para asistentes de voz, y contenedores con el modelo embebido. No es compatible con vLLM, TGI ni Ollama, que están orientados a LLM.
- **Latencia y throughput**: no hay cifras publicadas. Por la reducción de capas del decoder se espera una latencia inferior a la de large-v3 en las mismas condiciones, pero no se dispone de mediciones verificables.

## Comparativa con modelos similares

| Modelo | Parámetros | Ventana de audio | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `trannel/trannel-thai-whisper-ct2` | ~750-800 M (estimado) | 30 s | CTranslate2, float16 | MIT | Hugging Face, 0 descargas |
| `biodatlab/distill-whisper-th-large-v3` | no disponible | 30 s | PyTorch/safetensors | MIT | Hugging Face |
| `openai/whisper-large-v3` | 1550 M | 30 s | PyTorch/safetensors | MIT | Hugging Face |
| `openai/whisper-large-v3-turbo` | 809 M, 4 capas de decoder | 30 s | PyTorch/safetensors | MIT | Hugging Face |

La comparación relevante es contra el modelo base: este checkpoint es el mismo modelo en otro formato y cuantización, por lo que la calidad debería ser equivalente salvo diferencias numéricas de la conversión a float16. Frente a `whisper-large-v3`, la ventaja esperada es de velocidad y huella de memoria, a costa de una posible pérdida de precisión en dominios distintos al corpus de destilación; frente a `large-v3-turbo`, la diferencia principal es el idioma de especialización. No hay datos públicos de WER que permitan ordenar estas alternativas por calidad en tailandés.

## Limitaciones y advertencias

- Modelo mono-idioma: está ajustado a tailandés y no debe usarse como ASR multilingüe, aunque la interfaz permita fijar otros códigos de idioma.
- No hay ninguna evaluación publicada de WER ni de rendimiento; el repositorio tiene 0 descargas y 0 likes, por lo que carece de validación por parte de la comunidad.
- Alucinaciones típicas de Whisper en silencios, música, ruido de fondo o audio de baja calidad; conviene activar VAD y `no_speech_threshold` para mitigarlas.
- Ventana fija de 30 s: el audio largo requiere segmentación y puede perder contexto entre fragmentos si no se solapan.
- Sin diarización de hablantes; identificar quién habla exige un modelo externo (por ejemplo, pyannote).
- La conversión a float16 puede introducir diferencias numéricas menores frente al modelo original en PyTorch; no se ha publicado ninguna verificación de equivalencia.
- Licencia MIT: permite uso comercial y modificación, pero obliga a conservar el aviso de copyright de los autores de biodatlab y se distribuye «AS IS», sin garantía de ningún tipo.
- No apto para decisiones clínicas, legales o de seguridad sin revisión humana, especialmente por la ausencia de métricas de error en esos dominios.
- Posibles sesgos heredados del corpus de entrenamiento original de Whisper y del corpus tailandés de destilación, no documentados en la model card.
- Las fechas de creación y actualización del repositorio (octubre de 2026) son posteriores a la mayoría de referencias del ecosistema; conviene comprobar la versión de CTranslate2 y faster-whisper utilizada para la conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trannel/trannel-thai-whisper-ct2
- Modelo base: https://huggingface.co/biodatlab/distill-whisper-th-large-v3
- Repositorio de CTranslate2: https://github.com/OpenNMT/CTranslate2
- Repositorio de faster-whisper: https://github.com/SYSTRAN/faster-whisper
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
- Discusión sobre la arquitectura de Whisper large-v3-turbo (contexto de variantes): https://github.com/openai/whisper/discussions/2363
- Benchmark de ASR conversacional multilingüe DAI-ASR-I18N (no específico de este modelo): https://research.withdavid.ai/blog/dai-asr-i18n
