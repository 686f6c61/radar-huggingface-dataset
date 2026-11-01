# wkentaro/Haas-ja-v1.0-coreml

## Resumen

Haas-ja-v1.0 CoreML es la conversión al formato CoreML del modelo de reconocimiento automático del habla (ASR) en japonés third-intelligence/Haas-ja-v1.0, publicada por el desarrollador wkentaro. Su propósito es permitir la inferencia local del modelo original en hardware Apple Silicon (chips M-series) mediante FluidAudio, una librería de audio para el ecosistema Apple. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue que traduce los pesos del modelo base a los formatos que CoreML y FluidAudio esperan.

El modelo base emplea una arquitectura FastConformer de 24 capas como encoder, combinada con una red de predicción TDT (Token-and-Duration Transducer) cuyas capas recurrentes son Kimi Delta Attention (KDA) en lugar de las LSTM habituales. El vocabulario consta de 3072 piezas SentencePiece y el repositorio ocupa 1,2 GB. La conversión mantiene la licencia Apache-2.0 del original y está pensada exclusivamente para el idioma japonés.

La relevancia de esta ficha radica en que documenta una ruta concreta para ejecutar ASR japonés de calidad en portátiles y equipos de sobremesa de Apple sin GPU dedicada ni dependencia de CUDA, algo que el checkpoint original requiere por el uso de kernels Triton de flash-linear-attention. El autor advierte que la precisión no se ha medido en ningún benchmark estándar: la validación se limita a cuatro clips de prueba comparados contra NeMo en fp32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder, 24 capas) + TDT (Token-and-Duration Transducer) con red de predicción de 2 capas Kimi Delta Attention (KDA) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 15 s por fragmento en el preprocesador) |
| Tipos de cuantizacion | fp32 (Preprocessor, Decoder) y fp16 (Encoder, Jointer) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | CoreML (.mlmodelc) + vocab.json |
| Tamano del repositorio | 1,2 GB |
| Vocabulario | 3072 piezas SentencePiece, blank id 3072 |
| Entrada de audio | 16 kHz, 128 bins mel, ventanas de 15 s |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transducer TDT sobre un encoder FastConformer de 24 capas. El preprocesador convierte 15 segundos de audio a 16 kHz en 128 bins mel en fp32; el encoder se exporta en fp16; el decoder (red de predicción) y el jointer TDT se exportan en fp32 y fp16 respectivamente. La particularidad técnica más destacable es que la red de predicción sustituye las LSTM clásicas de los transducers por dos capas de Kimi Delta Attention (KDA), un mecanismo de atención lineal recurrente. El estado recurrente y las cachés de convolución corta se empaquetan en los tensores `h`/`c` con forma `[64, 1, 640]` que FluidAudio espera para sus LSTM, de modo que la interfaz externa imita a un transducer convencional.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de RLHF o ajuste fino supervisado en el modelo original. El autor indica que el checkpoint original ejecuta las capas KDA con kernels Triton de flash-linear-attention (fla), que requieren CUDA; esta conversión, y la referencia en fp32 usada para validarla, emplean un port en PyTorch del paso KDA. La decodificación es greedy, y el jointer aplica argmax sobre tokens y duraciones.

## Capacidades

- Reconocimiento automático del habla en japonés a partir de audio de 16 kHz.
- Transcripción con decodificación greedy mediante transducer TDT, que predice conjuntamente tokens y duraciones.
- Ejecución nativa en Apple Silicon a través de CoreML y FluidAudio, sin CUDA.
- Procesamiento por fragmentos de 15 segundos con estado recurrente persistente entre fragmentos (cachés `h`/`c`).
- No soporta tool calling, function calling ni razonamiento multi-turno: es un modelo puramente ASR.
- No dispone de capacidades multimodales más allá del audio de entrada; no genera visión ni audio.
- Cobertura lingüística limitada al japonés; no se documenta soporte multilingüe.

## Casos de uso

- Transcripción local en macOS: integrar el modelo en una aplicación de escritorio para Mac que transcriba reuniones o notas de voz sin enviar audio a la nube, aprovechando la ejecución en Apple Silicon vía CoreML.
- Subtitulado de contenido audiovisual japonés: procesar pistas de audio de vídeos en japonés y generar subtítulos en local, adecuado por la ventana de 15 s y el estado recurrente que permite concatenar fragmentos.
- Asistentes de voz para aplicaciones iOS/macOS: usar FluidAudio como capa de ASR en un pipeline de comandos por voz en japonés, con latencia baja al ejecutarse en el propio dispositivo.
- Investigación en ASR con arquitecturas lineales: servir como referencia práctica para estudiar el comportamiento de KDA frente a LSTM en transducers, ya que el autor documenta el empaquetado de estado en tensores compatibles con LSTM.
- Archivado y búsqueda de grabaciones: transcribir grandes volúmenes de audio japonés en un Mac para indexar y buscar por texto, sin coste de API y con la licencia Apache-2.0.
- Prototipado de pipelines de audio en el ecosistema Apple: validar flujos de preprocesado, encoder y jointer con CoreML antes de escalar a despliegues mayores, usando la variante `haas-ja` de FluidAudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente indica que, en cuatro clips de prueba, la decodificación greedy produjo las mismas transcripciones que NeMo ejecutando el checkpoint original en fp32, y que la precisión no se ha medido en ningún benchmark.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CoreML sobre Apple Silicon usando memoria unificada del sistema.
- GPU recomendadas: chips Apple M-series (M1, M2, M3, M4 y variantes Pro/Max/Ultra); no se documenta soporte para GPU NVIDIA o AMD.
- Cabe en equipos de consumo: sí, en cualquier Mac con Apple Silicon; el repositorio ocupa 1,2 GB y el modelo se reparte en cuatro artefactos CoreML.
- Opciones de despliegue: FluidAudio (rama `haas-ja` de wkentaro/FluidAudio) mediante `fluidaudiocli transcribe audio.wav --model-version haas-ja`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Haas-ja-v1.0 CoreML (este) | FastConformer + TDT con KDA | Japonés | CoreML | Apache-2.0 | Conversión para Apple Silicon vía FluidAudio |
| third-intelligence/Haas-ja-v1.0 | FastConformer + TDT con KDA | Japonés | Checkpoint original (NeMo) | Apache-2.0 | Requiere CUDA por kernels Triton de fla |
| Otros ASR japoneses (p. ej. Whisper, ReazonSpeech) | no disponible en la información | Japonés | no disponible | no disponible | No se aportan datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La precisión no se ha medido en ningún benchmark; la validación se reduce a cuatro clips de prueba, por lo que no hay garantías cuantitativas de calidad en producción.
- El modelo solo cubre japonés; no admite otros idiomas.
- Es un artefacto de conversión dependiente de una rama específica de FluidAudio (`haas-ja`); cambios en la librería pueden romper la compatibilidad.
- La red de predicción usa un port en PyTorch del paso KDA en lugar de los kernels Triton originales, lo que puede introducir diferencias numéricas respecto al checkpoint original.
- El procesamiento se realiza en ventanas de 15 s; audios más largos dependen de la gestión correcta del estado recurrente entre fragmentos.
- Riesgo de alucinación y errores en audio con ruido, solapamiento de hablantes o acentos no representados en el corpus de entrenamiento del modelo base; no se documenta la composición de dicho corpus.
- Licencia Apache-2.0: permite uso comercial, pero conviene conservar los avisos de atribución del modelo base y de la conversión.
- No es un modelo de lenguaje: no soporta generación de texto, código, tool calling ni agentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wkentaro/Haas-ja-v1.0-coreml
- Modelo base: https://huggingface.co/third-intelligence/Haas-ja-v1.0
- FluidAudio: https://github.com/FluidInference/FluidAudio
- Rama de FluidAudio con soporte `haas-ja`: https://github.com/wkentaro/FluidAudio/tree/haas-ja
- flash-linear-attention (fla): https://github.com/fla-org/flash-linear-attention
