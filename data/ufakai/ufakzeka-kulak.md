# ufakai/ufakzeka-kulak

## Resumen

ufakzeka-kulak ("kulak" significa "oreja" en turco) es un modelo de reconocimiento automático del habla (ASR) en turco desarrollado por ufak AI. Se trata de un modelo pequeño, de 31,6 millones de parámetros, entrenado desde cero y publicado bajo licencia Apache-2.0, lo que permite su uso comercial sin restricciones adicionales. Su objetivo es la transcripción de voz en turco de forma totalmente offline, ejecutable en CPU, portátil o incluso en navegador.

Arquitectura basada en un encoder FastConformer de 16 capas (anchura 256, 4 cabezas de atención, reducción temporal de 8) que alimenta dos cabezas de salida: un decodificador token-and-duration transducer (TDT) y una cabeza CTC. El vocabulario es SentencePiece BPE de 1.024 piezas. Acepta audio mono a 16 kHz con 80 features log-mel y procesa una emisión (utterance) cada vez; no es un modelo de streaming.

Su relevancia radica en que cubre un nicho poco atendido (ASR turco de alta calidad con licencia permisiva y despliegue en múltiples runtimes: NeMo, transformers, sherpa-onnx, parakeet.cpp/GGUF y parakeet-mlx/MLX) y en que declara resultados de WER del 9,21 % en FLEURS turco y del 9,16 % en Common Voice 27.0 turco, con solo 31,6 M de parámetros y entrenamiento de 52,3 horas-GPU en A100 80 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + TDT decoder + cabeza CTC |
| Parámetros totales | 31.594.087 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa una emisión por inferencia; no es streaming) |
| Tipos de cuantización | float32 (NeMo), float32 e int8 (sherpa-onnx), f32 y q8_0 (GGUF), float32 ejecutado en bfloat16 (MLX) |
| Idiomas soportados | turco (tr) únicamente |
| Licencia | Apache-2.0 |
| Formato de pesos | `.nemo` (NeMo), safetensors (transformers), ONNX (sherpa-onnx), GGUF (parakeet.cpp), MLX (parakeet-mlx) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura FastConformer con 16 capas de encoder, anchura de 256 y 4 cabezas de atención, con reducción temporal de 8. La salida se reparte entre un decodificador token-and-duration transducer (TDT) con duraciones {0, 1, 2, 3, 4} y una cabeza CTC independiente. El vocabulario es un SentencePiece BPE de 1.024 piezas entrenado exclusivamente sobre las transcripciones de entrenamiento tras un proceso de descontaminación. La entrada es audio mono a 16 kHz con 80 features log-mel.

El entrenamiento se realizó desde cero sobre las siguientes fuentes: espnet/yodas_owsmv4, espnet/yodas3, espnet/yodas2, issai/Turkish_Speech_Corpus, cloud0day3/antalia-voice-corpus y cloud0day3/alania-speech-captions-tr. Según la model card, la mayor parte del texto de entrenamiento de las grabaciones YODAS (4.326,6 de 4.696,2 horas) fue generado por un reconocedor y verificado por otro cuando ningún subtítulo del subidor coincidía con esa transcripción. El cómputo total fue de 52,3 horas-GPU en A100 80 GB, incluyendo configuración, validaciones y guardado de checkpoints. No se documenta en la información disponible el uso de RLHF o DPO.

## Capacidades

- Transcripción de voz en turco a texto escrito con mayúsculas, puntos, comas, signos de interrogación, apóstrofos y guiones intra-palabra.
- Normalización de puntuación: exclamaciones mapeadas a puntos, punto y coma y dos puntos mapeados a comas.
- Números escritos como palabras (por ejemplo, "iki bin yirmi ikide" en lugar de "2022'de").
- Letras con circunflejo escritas sin circunflejo.
- Dos cabezas de decodificación (TDT y CTC) que permiten elegir entre precisión y compatibilidad de runtime.
- Ejecución offline en CPU, sin necesidad de GPU.
- Despliegue en múltiples runtimes: NeMo, transformers, sherpa-onnx, parakeet.cpp (GGUF) y parakeet-mlx (MLX).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo puramente ASR).
- No realiza diarización (no identifica quién habla).
- No es un modelo de streaming: procesa una emisión cada vez.

## Casos de uso

- Transcripción offline en portátil: el modelo cabe en CPU y se ejecuta con sherpa-onnx o parakeet.cpp, permitiendo transcribir reuniones o notas de voz sin conexión y sin enviar audio a servicios externos.
- Subtitulado de vídeo en turco: integrado en un pipeline con detección de actividad de voz (VAD) que corte el audio en emisiones y añada unos cientos de milisegundos de contexto alrededor de cada corte, como hace la demo oficial.
- Aplicaciones web en navegador: la variante ONNX de sherpa-onnx permite ejecutar la transcripción en el propio navegador, útil para herramientas de dictado o accesibilidad sin backend.
- Procesamiento por lotes de archivos de audio en servidores: con la variante NeMo o transformers en float32 se puede transcribir grandes volúmenes de grabaciones turcas en pipelines de datos.
- Investigación en ASR de bajos recursos: al ser un modelo pequeño, entrenado desde cero y con fuentes documentadas, sirve como línea base reproducible para experimentos con FastConformer, TDT y CTC en turco.
- Integración en aplicaciones de notas de voz para móvil o escritorio: la variante MLX (parakeet-mlx) permite ejecución en hardware Apple Silicon, y la variante GGUF en CPUs convencionales, facilitando el despliegue en entornos de usuario final.
- Preprocesamiento de corpus turcos: transcripción automática de grabaciones para construir datasets de texto o para indexación y búsqueda sobre audio.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Dataset | Métrica | Valor |
|---|---|---|
| FLEURS Turkish (test) | WER normalizado | 0,0921 |
| FLEURS Turkish (test) | CER normalizado | 0,0335 |
| Common Voice Scripted Speech 27.0 Turkish (test) | WER normalizado | 0,0916 |
| Common Voice Scripted Speech 27.0 Turkish (test) | CER normalizado | 0,0242 |

Datos adicionales aportados en la model card:

| Conjunto | Métrica | Valor |
|---|---|---|
| Real-TurnTurk (conversacional, 6 hablantes) | WER normalizado | 0,3807 |
| FLEURS Turkish (test) | Recall de comas | 0,359 |
| FLEURS Turkish (test) | Recall de puntos | 0,839 |
| Common Voice 27.0 Turkish (test) | Recall de comas | 0,612 |
| Common Voice 27.0 Turkish (test) | Recall de puntos | 0,939 |

No se han publicado en la información disponible resultados de benchmarks comparativos con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 31,6 M de parámetros (unos 126,9 MB en float32 para el archivo NeMo). En float32 ocupa aproximadamente 0,13 GB de pesos; en int8 o q8_0, alrededor de 0,03-0,04 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU consumer (por ejemplo, RTX 4090, RTX 3060 o inferiores) es más que suficiente. El entrenamiento se realizó en A100 80 GB, pero la inferencia no necesita hardware de ese nivel.
- Cabe en GPU consumer: sí, en todas las GPU consumer actuales, y también en CPU sin GPU dedicada.
- Opciones de despliegue: NeMo 3.0.0 (float32), transformers 5.20.1 (float32), sherpa-onnx 1.13.8 (float32 e int8), parakeet.cpp v0.6.1 (f32 y q8_0, CPU), parakeet-mlx 0.5.3 con mlx 0.32.4 (float32 ejecutado en bfloat16, CPU en las pruebas del autor).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables de ASR turco (por ejemplo, variantes de Whisper o wav2vec2 en turco) que permitan una comparación rigurosa. Los únicos datos objetivos disponibles son los del propio ufakzeka-kulak: 31,6 M de parámetros, licencia Apache-2.0, contexto de una emisión por inferencia y WER de 0,0921 en FLEURS turco y 0,0916 en Common Voice 27.0 turco. Cualquier comparación con otros modelos requeriría ejecutar esos modelos sobre los mismos conjuntos de test con la misma normalización, algo que no se ha hecho en la información disponible.

| Modelo | Parámetros | Contexto | WER FLEURS tr | Licencia | Formatos |
|---|---|---|---|---|---|
| ufakzeka-kulak | 31,6 M | una emisión (no streaming) | 0,0921 | Apache-2.0 | NeMo, safetensors, ONNX, GGUF, MLX |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo turco. No se han medido otros idiomas ni turco mezclado con otras lenguas.
- Procesa una emisión cada vez; no es un modelo de streaming. Las grabaciones largas deben cortarse con VAD y conservar unos cientos de milisegundos de audio alrededor de cada corte; un segmento ajustado al habla puede salir sin mayúsculas ni puntuación.
- No realiza diarización: no indica quién habla. Las marcas de tiempo por palabra no fueron evaluadas.
- Los números se emiten como palabras; una aplicación que necesite dígitos debe convertirlos.
- Las comas se omiten con frecuencia: recall de 0,359 en FLEURS turco y 0,612 en Common Voice 27.0 turco, frente a 0,839 y 0,939 en puntos.
- El habla conversacional es mucho más difícil: WER normalizado de 0,3807 en Real-TurnTurk (6 hablantes), frente a 0,0921 en FLEURS; con tan pocos hablantes el intervalo de confianza es amplio.
- La mayor parte del texto de entrenamiento de las grabaciones YODAS (4.326,6 de 4.696,2 horas) fue generado por un reconocedor y verificado por otro; los errores en los que ambos coincidieron permanecen en el texto de entrenamiento.
- No se ha medido la precisión por género, edad o acento regional del hablante.
- Riesgo de alucinación: no documentado explícitamente en la información disponible, pero inherente a los modelos generativos de transcripción; conviene validar las salidas en producción.
- Uso previsto: transcripción offline en portátil, servidor o navegador. Identificar, rastrear o perfilar a las personas que hablan queda fuera del alcance, así como actuar sobre una transcripción relativa a una persona sin revisión humana.
- Licencia Apache-2.0: permite uso comercial, pero debe conservarse el archivo `ATTRIBUTION.md` con los créditos de las fuentes de datos y la licencia de los pesos.
- Cada runtime tiene sus propios límites, listados en la sección "Known limitations" de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ufakai/ufakzeka-kulak
- Demo oficial: https://kulak.ufakzeka.com
- Paper citado (arxiv:2311.17741): https://arxiv.org/abs/2311.17741
- Paper citado (arxiv:2310.02943): https://arxiv.org/abs/2310.02943
- Paper citado (arxiv:2611.03605): https://arxiv.org/abs/2611.03605
- Dataset espnet/yodas_owsmv4: https://huggingface.co/datasets/espnet/yodas_owsmv4
- Dataset espnet/yodas3: https://huggingface.co/datasets/espnet/yodas3
- Dataset espnet/yodas2: https://huggingface.co/datasets/espnet/yodas2
- Dataset issai/Turkish_Speech_Corpus: https://huggingface.co/datasets/issai/Turkish_Speech_Corpus
- Dataset cloud0day3/antalia-voice-corpus: https://huggingface.co/datasets/cloud0day3/antalia-voice-corpus
- Dataset cloud0day3/alania-speech-captions-tr: https://huggingface.co/datasets/cloud0day3/alania-speech-captions-tr
