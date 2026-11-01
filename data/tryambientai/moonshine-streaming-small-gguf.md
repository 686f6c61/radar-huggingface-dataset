# tryambientai/moonshine-streaming-small-gguf

## Resumen

Moonshine Streaming Small es un modelo de reconocimiento automático del habla (ASR) de tipo encoder-decoder desarrollado por Useful Sensors, disenado especificamente para transcripcion en streaming sobre hardware de clase edge. Con 140.135.225 parametros totales (aproximadamente 123M segun la model card original), emplea un frontend de audio de 50 Hz en el dominio del tiempo y un encoder Transformer con atencion local de ventana deslizante y sin embeddings posicionales (encoder "ergodico"), al que se anade un adaptador que inyecta informacion posicional antes de un decoder autorregresivo estandar.

La ficha que nos ocupa, `tryambientai/moonshine-streaming-small-gguf`, es una conversion a formato GGUF del checkpoint original `UsefulSensors/moonshine-streaming-small` para su uso con la libreria `transcribe.cpp`. Se ofrecen tres cuantizaciones (F32, F16 y Q8_0) con tamanos de 536 MB, 269 MB y 189 MB respectivamente, y un WER practicamente identico entre ellas sobre LibriSpeech test-clean (2,53 % en F32/F16 y 2,54 % en Q8_0).

Su relevancia actual radica en que permite ejecutar un ASR en ingles de alta precision de forma completamente offline en CPU y GPU de consumo, con soporte de streaming y un rendimiento en tiempo real muy superior al necesario (RTF de 96 en Metal sobre un M4 Max y de 57 en CPU). La licencia MIT y la ausencia de dependencias de servicios en la nube lo hacen adecuado para despliegues embebidos y aplicaciones de privacidad estricta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder Transformer con encoder ergodico (atencion local de ventana deslizante, sin embeddings posicionales) y adaptador posicional antes del decoder autorregresivo |
| Parametros totales | 140.135.225 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana deslizante en el encoder; sin cifra publicada de contexto maximo) |
| Tipos de cuantizacion | F32, F16, Q8_0 (no se distribuyen Q6_K, Q5_K_M ni Q4_K_M para esta variante) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp); pesos originales en safetensors en el modelo base |
| Frontend de audio | 50 Hz en dominio del tiempo, entrada WAV mono a 16 kHz |
| Capas encoder / decoder | 10 / 10 |
| Dimension oculta encoder / decoder | 620 / 512 |
| Capacidades adicionales | streaming: true; translate: false; lang_detect: false; timestamps: none |

## Arquitectura y entrenamiento

El modelo sigue la familia Moonshine Streaming de Useful Sensors. El encoder es un Transformer "ergodico": utiliza atencion local con ventana deslizante y prescinde de embeddings posicionales, lo que permite procesar audio en flujo continuo con latencia acotada. Un adaptador inserta la informacion posicional necesaria antes de alimentar un decoder autorregresivo convencional, que genera la transcripcion token a token. El frontend de audio opera a 50 Hz en el dominio del tiempo, en lugar de trabajar sobre espectrogramas mel, lo que reduce el coste computacional del preprocesado.

Esta variante "small" es mas profunda y ancha que `moonshine-streaming-tiny`: 10 capas de encoder y 10 de decoder, con dimensiones ocultas de 620 y 512 respectivamente, frente a la variante tiny de menor capacidad. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; la model card original remite al paper de Moonshine Streaming para esos detalles. La validacion de la conversion GGUF se realizo contra la referencia de Hugging Face Transformers v5.7.0, con un residuo de +0,04 pp en WER atribuido a diferencias de scoring y normalizacion de texto, no a deriva numerica del port.

## Capacidades

- Transcripcion de voz a texto en ingles sobre audio WAV mono a 16 kHz.
- Procesamiento en streaming con encoder de atencion local, adecuado para audio continuo de baja latencia.
- Ejecucion completamente offline, sin llamadas a servicios externos.
- Inferencia eficiente en CPU y GPU de consumo gracias a su tamano reducido y a las cuantizaciones disponibles.
- Soporte de cuantizacion Q8_0 con perdida de precision despreciable (2,54 % frente a 2,53 % de WER).
- No soporta traduccion (translate: false).
- No soporta deteccion de idioma (lang_detect: false).
- No genera marcas de tiempo (timestamps: none).
- No dispone de capacidades multimodales mas alla del audio, ni de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Subtitulado en directo de reuniones y videollamadas: el modelo procesa audio en streaming con atencion de ventana deslizante y puede alimentar un pipeline de subtitulos con latencia baja, ejecutandose en la propia maquina del usuario sin enviar audio a terceros.
- Dictado por voz en aplicaciones de escritorio: con el GGUF Q8_0 de 189 MB y RTF de 57 en CPU, un portatil convencional puede transcribir en tiempo real sin GPU dedicada.
- Transcripcion de notas de voz y podcasts en lote: la entrada se convierte previamente con ffmpeg a WAV mono de 16 kHz y se procesa con `transcribe-cli`, obteniendo transcripciones con un WER del 2,5 % sobre ingles limpio.
- Asistentes de voz embebidos en dispositivos edge: el modelo cabe en memoria de sistemas con recursos limitados y no requiere conectividad, lo que encaja en electrodomesticos, wearables o terminales de punto de venta.
- Indexacion y busqueda de archivos de audio: la transcripcion offline permite generar texto buscable a partir de grabaciones almacenadas, con coste marginal cero por minuto procesado.
- Cumplimiento y privacidad en entornos regulados: al ejecutarse localmente con licencia MIT, permite transcribir conversaciones sensibles (sanitario, legal, RRHH) sin salida de datos a la nube.
- Prototipado e investigacion en ASR: su integracion en `transcribe.cpp` y su validacion contra Transformers lo convierten en una referencia ligera para experimentos de decodificacion y comparativas de cuantizacion.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 |
|---|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 2,53 | 2,53 | 2,54 |
| Tamano del fichero (MB) | 536 | 269 | 189 |

| Plataforma | Backend | RTF (mayor es mejor) |
|---|---|---:|
| Apple M4 Max | Metal | 96 |
| Apple M4 Max | CPU | 57 |
| AMD Ryzen 7 4750U | Vulkan | 23,5 |
| AMD Ryzen 7 4750U | CPU | 12 |

El WER se midio sobre la totalidad de LibriSpeech test-clean (2620 utterances) con decodificacion greedy (`num_beams=1`, `do_sample=False`). La cifra autoinformada por Useful Sensors en la Open ASR Leaderboard para este split es 2,49 %; la diferencia de +0,04 pp se atribuye a normalizacion de texto y criterio de scoring. No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros), que ademas no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 0,5 GB en F32, 0,27 GB en F16 y 0,19 GB en Q8_0, mas el overhead del runtime y del buffer de audio.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon, validado en M4 Max) o Vulkan (validado en AMD Ryzen 7 4750U con graficos integrados); no se requieren A100 ni H100.
- Cabe holgadamente en GPU de consumo: el Q8_0 de 189 MB se ejecuta en iGPU y en CPU sin problemas.
- Opciones de despliegue: `transcribe.cpp` (CLI `transcribe-cli` y libreria); el modelo base es compatible con Hugging Face Transformers mediante `MoonshineStreamingForConditionalGeneration`.
- Throughput: RTF de 96 en Metal (M4 Max), 57 en CPU (M4 Max), 23,5 en Vulkan y 12 en CPU sobre Ryzen 7 4750U; en todos los casos muy por encima del tiempo real.
- Preprocesado requerido: audio de entrada en WAV mono a 16 kHz (conversion con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Formato | Notas |
|---|---|---:|---|---|---|---|
| moonshine-streaming-small (esta ficha, GGUF) | 140,1M | ventana deslizante, cifra no disponible | en | MIT | GGUF | WER 2,53 % en LibriSpeech test-clean; streaming |
| moonshine-streaming-tiny | no disponible (menor) | ventana deslizante | en | MIT | safetensors / GGUF | Menos capas y dimensiones ocultas; WER superior segun la model card |
| OpenAI Whisper (variantes pequenas) | no disponible en la informacion proporcionada | no disponible | multilingue | MIT | safetensors / GGUF | No comparable en streaming nativo segun los datos disponibles |
| Otros ASR edge | no disponible | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |

La comparacion cuantitativa con alternativas concretas no esta disponible en la informacion proporcionada; los unicos datos verificables son los de la propia familia Moonshine Streaming y el WER de referencia de la Open ASR Leaderboard.

## Limitaciones y advertencias

- Solo soporta ingles; no traduce ni detecta idioma, por lo que audio en otras lenguas producira transcripciones incorrectas o vacias.
- No genera marcas de tiempo, lo que limita su uso en subtitulado sincronizado fino sin postprocesado adicional.
- Riesgo de alucinacion y bucles de decodificacion: la model card original recomienda limitar la longitud maxima de salida para evitarlos.
- El WER de 2,53 % corresponde a LibriSpeech test-clean (audio limpio de lectura); el rendimiento en audio con ruido, acentos no estadounidenses o solapamientos no esta documentado en la informacion disponible.
- No se han publicado datos sobre sesgos demograficos, acusticos o de otro tipo en la informacion disponible.
- La licencia MIT permite uso comercial sin restricciones adicionales, heredada del modelo base.
- Las cuantizaciones Q6_K, Q5_K_M y Q4_K_M no se distribuyen para esta variante, lo que limita el ahorro de memoria por debajo de Q8_0.
- Requiere audio WAV mono a 16 kHz; otra frecuencia o numero de canales exige conversion previa.
- La conversion GGUF esta fijada a un commit concreto del modelo base (2c03650) y validada contra Transformers v5.7.0; cambios posteriores en el modelo base no estan cubiertos.
- El repositorio GGUF registra 0 descargas y 0 likes en el momento de la consulta, por lo que su adopcion y soporte comunitario son practicamente inexistentes.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tryambientai/moonshine-streaming-small-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-streaming-small
- Commit del modelo base: https://huggingface.co/UsefulSensors/moonshine-streaming-small/commit/2c03650
- Paper de Moonshine Streaming: https://download.moonshine.ai/docs/moonshine_streaming_paper.pdf
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/0d312ce
- Documentacion del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine-streaming-small.md
- Descarga F32: https://huggingface.co/handy-computer/moonshine-streaming-small-gguf/resolve/main/moonshine-streaming-small-F32.gguf
- Descarga F16: https://huggingface.co/handy-computer/moonshine-streaming-small-gguf/resolve/main/moonshine-streaming-small-F16.gguf
- Descarga Q8_0: https://huggingface.co/handy-computer/moonshine-streaming-small-gguf/resolve/main/moonshine-streaming-small-Q8_0.gguf
