# zugetor/zipformer-CarCMD-TH

## Resumen

zipformer-CarCMD-TH es un modelo de reconocimiento automático del habla (ASR) en tailandés, especializado en comandos de voz para el interior de un vehículo. Lo publica el usuario zugetor como componente de su proyecto Lyra Car Assistant, un asistente de coche que convierte la transcripción en acciones sobre climatización, ventanillas, techo solar, etc. El modelo parte de yfyeung/icefall-asr-gigaspeech2-th-zipformer-2024-06-20 y se ha ajustado fino sobre comandos reales y sintéticos.

La arquitectura es un transducer Zipformer entrenado con la librería icefall (k2-fsa), con encoder cuantizado a 4 bits (MatMulNBits, bloques de 128, cómputo int8) y decoder y joiner en int8. El paquete completo ocupa 91 MB y está pensado para inferencia offline en CPU de teléfono o de coche mediante sherpa-onnx, sin necesidad de GPU ni de conversión adicional.

Su relevancia radica en el despliegue en el borde: un ASR de tailandés con licencia Apache-2.0, vocabulario BPE de 2.000 piezas y un consumo de memoria privada de unos 170 MB tras decodificar, que reduce el CER del modelo base del 9,2 % al 6,3 % en el conjunto de test de Gowajee (comandos reales) sin degradar el tailandés leído de FLEURS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer transducer (encoder + decoder stateless + joiner), entrenado con icefall |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (segmentos de audio de pocos segundos; se recomienda VAD y troceado) |
| Tipos de cuantizacion | encoder int4 (MatMulNBits, bloques de 128, cómputo int8); decoder int8; joiner int8 |
| Idiomas soportados | tailandés (th); nombres en inglés se transcriben en grafía tailandesa |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (encoder.int4.onnx + .data, decoder.int8.onnx + .data, joiner.int8.onnx + .data), tokens.txt, bpe.model |

## Arquitectura y entrenamiento

El modelo es un transducer Zipformer, una variante eficiente del transformer con atención multi-escala pensada para ASR de streaming y offline. El encoder es la pieza pesada (6,5 MB de grafo más 81,7 MB de datos) y se ha cuantizado a 4 bits con MatMulNBits; el decoder es stateless y el joiner opera en int8. Los pesos se almacenan en ficheros `.data` que ONNX Runtime mapea desde disco, de modo que la memoria privada tras decodificar un clip ronda los 170 MB. El vocabulario es un BPE de 2.000 piezas.

El ajuste fino se hizo con `zipformer/finetune.py` de icefall durante tres épocas sobre 30,1 horas de audio (23.392 clips), con learning rate base 0,002, 600 s de audio por lote, precisión fp16 y una única RTX 4090; el entrenamiento duró unos ocho minutos. Los pesos exportados promedian las épocas 2 y 3. La composición del dataset combina 5.286 clips de VachanaTTS con comandos de Lyra (1.762 frases en cuatro voces, tres rendiciones cada una), 2.019 clips de comandos previstos (ventanillas, techo solar, aire acondicionado, desempañado, pantalla, luz ambiental, apps, estado del vehículo), 2.913 clips de 47 voces sintéticas generadas con VoxCPM2 a partir de descripciones textuales, 3.000 clips concatenados con pausas, 7.998 clips de hablantes reales de Gowajee (la mitad con ruido de coche añadido) y 2.176 clips de FLEURS tailandés de entrenamiento. Los clips sintéticos se degradaron con cambios de velocidad, reverberación de cabina, filtro de micrófono barato y ruido de carretera, ventilador, siseo, babble o música entre 3 y 25 dB de SNR. No se usaron grabaciones de personas privadas.

## Capacidades

- Transcripción de voz a texto en tailandés, offline, sobre CPU.
- Reconocimiento de comandos cortos de automoción: aire acondicionado, ventanillas, techo solar, desempañado, pantalla, luz ambiental, apps y estado del vehículo.
- Manejo de clips concatenados con pausas breves, entrenado explícitamente para no interpretar una pausa como fin de utterance.
- Robustez ante ruido de cabina (carretera, ventilador, siseo, babble, música) en el rango de 3 a 25 dB SNR.
- Normalización de números a palabras tailandesas en la salida (por ejemplo, "ยี่สิบสี่" en lugar de "24").
- Escritura de nombres ingleses en grafía tailandesa (CarPlay → คาร์เพลย์).
- Decodificación con `modified_beam_search` en sherpa-onnx.
- No soporta tool calling, agentes, visión, audio de entrada distinto de voz ni modo de razonamiento; es un ASR puro.

## Casos de uso

- Asistente de voz embarcado en el coche: el modelo transcribe comandos como "เปิดแอร์ยี่สิบสี่องศา" o "ปิดกระจกฝั่งคนขับ" en la CPU del vehículo y el sistema los traduce en acciones, sin conexión a la nube ni coste por petición.
- Integración en la app Lyra Car Assistant: actúa como front-end de voz que alimenta el parser de intenciones del asistente, con 91 MB de paquete y 170 MB de memoria privada, apto para dispositivos con recursos limitados.
- Control por voz en Android e iOS: sherpa-onnx ofrece builds para Android, iOS y WebAssembly, de modo que el mismo modelo puede embeberse en aplicaciones móviles de navegación o de flotas.
- Transcripción de notas de voz en tailandés: para dictado de frases cortas en aplicaciones de mensajería o registro de incidencias, con la salvedad de que la salida no lleva espacios y los números aparecen como palabras.
- Preprocesado en pipelines de análisis de audio de vehículos: transcripción por lotes de grabaciones de cabina troceadas con VAD para auditar comandos o generar datos etiquetados.
- Prototipado de interfaces de voz para fabricantes de automoción: al ser Apache-2.0 y ONNX, permite evaluar la viabilidad de un ASR tailandés de borde antes de invertir en un modelo propio.
- Sistemas de evaluación de calidad de micrófono en cabina: comparar transcripciones reales frente a las esperadas en condiciones de ruido controlado.

## Benchmarks y rendimiento

Tasa de error de carácter (CER), ignorando espacios y comparando números como palabras tailandesas. Menor es mejor.

| Modelo | Gowajee test | FLEURS test (primeros 300) |
|---|---:|---:|
| Modelo de partida (ficheros int8 publicados) | 9,2 % | 6,1 % |
| zipformer-CarCMD-TH | 6,3 % | 5,7 % |

El conjunto Gowajee test contiene 2.717 comandos y peticiones habladas de los 25 hablantes de dev y test del corpus, ninguno presente en el entrenamiento. FLEURS es tailandés leído con estilo de noticias y se incluye para verificar que el ajuste fino no degrada el idioma general. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo está diseñado para ejecutarse en CPU de teléfono o de coche; no requiere GPU.
- VRAM estimada: no aplica en el escenario objetivo; en GPU, el paquete de 91 MB cabe holgadamente en cualquier tarjeta, pero no se han publicado cifras de VRAM ni de latencia en GPU.
- GPU recomendadas: no disponible; el autor solo documenta entrenamiento con una RTX 4090, no inferencia acelerada.
- Cabe en cualquier dispositivo consumer: el encoder int4 más decoder y joiner suman 91 MB en disco y unos 170 MB de memoria privada tras decodificar.
- Opciones de despliegue: sherpa-onnx (Python, Android, iOS, WebAssembly). La variante int4 requiere un ONNX Runtime 1.17 o superior que soporte MatMulNBits. Probado con sherpa-onnx 2.0.1 en Python sobre macOS.
- Latencia y throughput: no disponibles. El autor indica `num_threads=2` y decodificación `modified_beam_search`, pero no publica tiempos por clip.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| zipformer-CarCMD-TH | Zipformer transducer, encoder int4 | th | no disponible | Apache-2.0 | ONNX (sherpa-onnx) | Especializado en comandos de coche; CER 6,3 % en Gowajee |
| yfyeung/icefall-asr-gigaspeech2-th-zipformer-2024-06-20 | Zipformer transducer | th | no disponible | Apache-2.0 | ONNX int8 | Modelo base; CER 9,2 % en Gowajee y 6,1 % en FLEURS |
| Whisper (variantes multilingües) | Transformer encoder-decoder | multilingüe, incluye th | 30 s de audio por ventana | MIT | safetensors, GGUF, ONNX | Referencia generalista; no se dispone de CER comparable en esta ficha |
| Modelos ASR tailandeses de k2-fsa/icefall | Zipformer / Conformer | th | no disponible | Apache-2.0 | ONNX | Alternativas del mismo ecosistema; sin datos comparativos publicados aquí |

Los datos de comparación con Whisper y con otros modelos de icefall no están disponibles en la información proporcionada; solo se dispone de la comparación directa con el modelo base.

## Limitaciones y advertencias

- El habla que empieza en la primera muestra puede perder la primera palabra; el autor recomienda anteponer medio segundo de ruido muy débil (amplitud 1e-3).
- La vocal ำ se emite como ํ + า por la normalización NFKC del vocabulario BPE; es necesario revertirla en postprocesado.
- Los préstamos lingüísticos son el punto débil: "Google Maps" tiende a salir como "กูเกิล มาร์ท" y "ซันรูฟ" ocasionalmente como "ซัน รู"; CarPlay, Android Auto, ม่านบังแดด y เปอร์เซ็นต์ funcionan bien.
- Solo tailandés: los nombres ingleses se escriben en grafía tailandesa, lo que complica su uso en aplicaciones que esperen texto latino.
- Está ajustado para comandos de pocos segundos; las grabaciones largas deben trocearse previamente, idealmente con un VAD, y recortar el silencio dejando unos 500 ms a cada lado.
- La salida no incluye espacios y los números se escriben siempre como palabras tailandesas; si la aplicación necesita dígitos, hay que convertirlos y evitar confundir palabras que contienen un número, como สามารถ o ห้าม.
- Riesgo de alucinación: no se documenta explícitamente, pero como todo ASR puede producir transcripciones plausibles en audio ruidoso o fuera de dominio.
- Sesgos: el entrenamiento usa voces sintéticas (VachanaTTS, VoxCPM2) y hablantes de Gowajee y FLEURS; no se ha evaluado el rendimiento por género, edad o acento regional.
- Licencia Apache-2.0, permisiva para uso comercial; el modelo base también es Apache-2.0. No se han documentado restricciones adicionales.
- La cuantización int4 del encoder exige ONNX Runtime 1.17 o superior con soporte de MatMulNBits; versiones anteriores no cargarán el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zugetor/zipformer-CarCMD-TH
- Modelo base: https://huggingface.co/yfyeung/icefall-asr-gigaspeech2-th-zipformer-2024-06-20
- Revisión del modelo base citada: https://huggingface.co/yfyeung/icefall-asr-gigaspeech2-th-zipformer-2024-06-20/tree/e33c75c3e75fd0830acec75bc41f4e5d711bbec9
- Proyecto Lyra Car Assistant: https://github.com/zugetor/Lyra-Car-Assistant
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Paper de referencia (arXiv:2205.12446): https://arxiv.org/abs/2205.12446
- Dataset FLEURS (google/fleurs): https://huggingface.co/datasets/google/fleurs
