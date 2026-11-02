# ufakai/ufakzeka-kulak

## Resumen

ufakzeka-kulak (kulak significa "oreja" en turco) es un modelo de reconocimiento automático del habla (ASR) para turco, desarrollado por ufak AI y publicado bajo licencia Apache-2.0. Se trata de un modelo pequeño, de 31.564.935 parámetros, entrenado desde cero y pensado para transcribir voz en turco de forma totalmente offline, incluso en CPU de portátil o en una página web. Su interés principal reside en que combina un tamaño muy reducido con una licencia permisiva y una lista de fuentes de entrenamiento documentada, algo poco habitual en modelos ASR de calidad para lenguas distintas del inglés.

La arquitectura es un encoder FastConformer de 16 capas con anchura 256 y 4 cabezas de atención, que alimenta dos salidas: un decodificador token-and-duration transducer (TDT) y una cabeza CTC. El vocabulario es un SentencePiece BPE de 1.024 piezas entrenado únicamente sobre las transcripciones de entrenamiento tras la descontaminación. La entrada es audio mono a 16.000 Hz con 80 características log-mel, procesando una locución cada vez (no es un modelo de streaming).

El modelo es relevante ahora porque demuestra que un ASR específico de dominio y de tamaño muy contenido puede alcanzar un WER normalizado de 0,0921 en FLEURS Turkish test y 0,0916 en Common Voice 27.0 Turkish test, con pesos disponibles en múltiples runtimes (NeMo, transformers, sherpa-onnx, parakeet.cpp/GGUF y parakeet-mlx/MLX), lo que facilita su despliegue en entornos con recursos limitados y sin conexión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer encoder (16 capas, anchura 256, 4 cabezas de atencion, reduccion temporal 8) con decodificador TDT (token-and-duration transducer) y cabeza CTC |
| Parametros totales | 31.594.087 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa una locucion cada vez; no es streaming) |
| Tipos de cuantizacion | float32 (NeMo, transformers), float32 e int8 (sherpa-onnx), f32 y q8_0 (GGUF), pesos float32 ejecutados en bfloat16 (MLX) |
| Idiomas soportados | turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX, GGUF, .nemo (NeMo), MLX |
| Vocabulario | SentencePiece BPE, 1.024 piezas |
| Entrada | audio mono a 16.000 Hz, 80 caracteristicas log-mel |
| Salida | texto en turco con mayusculas, puntos, comas, interrogaciones, apostrofes y guiones intra-palabra; numeros escritos como palabras |
| Tamano del repo | 1,0 GB |
| Entrenamiento | desde cero, en A100 80 GB, 52,3 horas de sesion de GPU (incluye setup, validacion y checkpoints) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema FastConformer: un encoder convolucional con reduccion temporal de factor 8 que procesa características log-mel de 80 dimensiones extraídas de audio mono a 16 kHz. Sobre la representación del encoder se montan dos cabezas: un decodificador TDT (token-and-duration transducer) con duraciones discretas 0, 1, 2, 3 y 4, y una cabeza CTC. Esta combinación permite elegir entre decodificación transductora (más precisa) y CTC (más simple y compatible con runtimes ligeros como sherpa-onnx). El vocabulario es un SentencePiece BPE de 1.024 piezas entrenado exclusivamente sobre las transcripciones de entrenamiento tras el proceso de descontaminación.

El entrenamiento se realizó desde cero sobre un conjunto de fuentes documentadas: espnet/yodas_owsmv4, espnet/yodas3, espnet/yodas2, issai/Turkish_Speech_Corpus, cloud0day3/antalia-voice-corpus y cloud0day3/alania-speech-captions-tr. Un detalle técnico relevante es que la mayor parte del texto de entrenamiento de las grabaciones YODAS (4.326,6 de 4.696,2 horas) fue generado por un reconocedor y verificado por otro cuando ningún subtítulo del subidor coincidía con esa transcripción; los errores en los que ambos coincidieron permanecen en el texto de entrenamiento. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación posteriores al entrenamiento supervisado.

## Capacidades

- Reconocimiento automático del habla en turco, con salida de texto escrito con mayúsculas, puntos, comas, signos de interrogación, apóstrofos y guiones intra-palabra.
- Dos modos de decodificación: TDT (token-and-duration transducer) y CTC, con pesos específicos para cada uno.
- Ejecución offline en CPU, incluyendo portátil y navegador, gracias a los formatos ONNX y GGUF.
- Múltiples runtimes soportados: NeMo 3.0.0, transformers 5.20.1, sherpa-onnx 1.13.8, parakeet.cpp v0.6.1 (GGUF) y parakeet-mlx 0.5.3 (MLX).
- Procesamiento de una locución cada vez (no streaming); requiere segmentación previa con detección de actividad de voz (VAD) para grabaciones largas.
- Conversión de números a palabras en la salida (por ejemplo, "iki bin yirmi ikide" en lugar de "2022'de").
- No incluye diarización (no identifica quién habla) ni timestamps de palabras evaluados.

## Casos de uso

- Transcripción offline en portátil: el modelo cabe en CPU y en formatos ligeros (ONNX int8, GGUF q8_0), por lo que se puede transcribir audio turco en un equipo sin GPU, útil para periodistas, investigadores o estudiantes que trabajan con material sensible sin conexión.
- Subtitulado de reuniones y entrevistas: segmentando el audio con VAD y manteniendo unos cientos de milisegundos de contexto alrededor de cada locución, se obtienen transcripciones con puntuación básica adecuadas para actas o notas.
- Integración en aplicaciones web: los pesos ONNX y GGUF permiten ejecutar el reconocimiento en el navegador o en el servidor sin depender de APIs externas, reduciendo costes y preservando la privacidad del audio.
- Procesamiento por lotes de archivos de audio turcos: con sherpa-onnx o parakeet.cpp se pueden transcribir grandes volúmenes de grabaciones en servidores modestos, dado el reducido tamaño del modelo (31,6 M de parámetros).
- Asistencia a la accesibilidad: transcripción en tiempo casi real de conversaciones presenciales o grabadas para personas con discapacidad auditiva, siempre que se acepte la limitación de no ser streaming y se gestione la segmentación.
- Investigación en ASR de bajos recursos: al estar entrenado desde cero con fuentes documentadas y licencia Apache-2.0, sirve como base para experimentos de adaptación, comparación de arquitecturas FastConformer/TDT/CTC o evaluación de técnicas de cuantización en turco.
- Preprocesamiento para pipelines de NLP: transcripción de audio turco como paso previo a análisis de sentimiento, extracción de entidades o indexación de contenido multimedia, con la advertencia de que los números salen como palabras y deben convertirse si la aplicación lo requiere.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Dataset | Metrica | Valor |
|---|---|---|
| FLEURS Turkish (test) | WER normalizado | 0,0921 |
| FLEURS Turkish (test) | CER normalizado | 0,0335 |
| Common Voice Scripted Speech 27.0 Turkish (test) | WER normalizado | 0,0916 |
| Common Voice Scripted Speech 27.0 Turkish (test) | CER normalizado | 0,0242 |
| Real-TurnTurk (conversacional, 6 hablantes) | WER normalizado | 0,3807 |

El autor indica además que la recall de comas es de 0,359 en FLEURS Turkish test y 0,612 en Common Voice 27.0 Turkish test, frente a 0,839 y 0,939 para los puntos. No se han publicado en la información disponible resultados comparativos con otros modelos en una tabla de benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 31,6 M de parámetros; en float32 ocupa aproximadamente 126,9 MB (el archivo NeMo es de 126.955.520 bytes). En int8 o q8_0 el peso se reduce a la mitad o menos, por lo que la VRAM necesaria es mínima (por debajo de 1 GB en cualquier configuración).
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Para despliegues de alto rendimiento se puede usar cualquier GPU moderna (A100, H100, RTX 4090), aunque el modelo no está pensado para aprovechar grandes GPUs.
- Cabe en cualquier GPU de consumo, incluida una RTX 4090, e incluso en iGPU y CPU de portátil.
- Opciones de despliegue: NeMo 3.0.0, transformers 5.20.1, sherpa-onnx 1.13.8, parakeet.cpp v0.6.1 (GGUF), parakeet-mlx 0.5.3 (MLX). No se documenta soporte para vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento se realizó en A100 80 GB durante 52,3 horas de sesión de GPU, pero no se aportan cifras de inferencia.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks de modelos comparables (por ejemplo, otros ASR específicos de turco como Whisper fine-tuned o modelos de la familia NeMo para turco) que permitan una comparación rigurosa de parámetros, contexto, rendimiento y licencia. Por tanto, la comparativa se indica como no disponible.

## Limitaciones y advertencias

- Solo turco: no se han medido otros idiomas ni turco mezclado con otras lenguas.
- Una locución cada vez: no es un modelo de streaming; las grabaciones largas deben segmentarse con VAD, manteniendo unos cientos de milisegundos de audio alrededor de cada segmento. Un segmento cortado demasiado ajustado puede salir sin mayúsculas ni puntuación.
- No identifica quién habla (sin diarización) y los timestamps de palabras no fueron evaluados.
- Los números se emiten como palabras; una aplicación que necesite dígitos debe convertirlos.
- Las comas se pierden con frecuencia: recall de 0,359 en FLEURS Turkish test y 0,612 en Common Voice 27.0 Turkish test, frente a 0,839 y 0,939 para los puntos.
- El habla conversacional es mucho más difícil: WER normalizado de 0,3807 en Real-TurnTurk (6 hablantes), frente a 0,0921 en FLEURS; con tan pocos hablantes el intervalo de confianza es amplio.
- La mayor parte del texto de entrenamiento de las grabaciones YODAS (4.326,6 de 4.696,2 horas) fue generado por un reconocedor y verificado por otro; los errores en los que ambos coincidieron permanecen en el texto de entrenamiento.
- No se ha medido la precisión por género, edad o acento regional del hablante.
- Cada runtime tiene sus propios límites, documentados en la sección "Known limitations" de la model card.
- Uso previsto: transcripción offline de habla turca; queda fuera de alcance la identificación, seguimiento o perfilado de las personas que hablan, así como actuar sobre una transcripción relativa a una persona sin revisión humana.
- Licencia Apache-2.0: permite uso comercial, pero debe conservarse el archivo LICENSE y las atribuciones de ATTRIBUTION.md.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/ufakai/ufakzeka-kulak)
- [Demo](https://kulak.ufakzeka.com)
- [Paper arXiv:2311.17741](https://arxiv.org/abs/2311.17741)
- [Paper arXiv:2310.02943](https://arxiv.org/abs/2310.02943)
- Dataset [espnet/yodas_owsmv4](https://huggingface.co/datasets/espnet/yodas_owsmv4)
- Dataset [espnet/yodas3](https://huggingface.co/datasets/espnet/yodas3)
- Dataset [espnet/yodas2](https://huggingface.co/datasets/espnet/yodas2)
- Dataset [issai/Turkish_Speech_Corpus](https://huggingface.co/datasets/issai/Turkish_Speech_Corpus)
- Dataset [cloud0day3/antalia-voice-corpus](https://huggingface.co/datasets/cloud0day3/antalia-voice-corpus)
- Dataset [cloud0day3/alania-speech-captions-tr](https://huggingface.co/datasets/cloud0day3/alania-speech-captions-tr)
