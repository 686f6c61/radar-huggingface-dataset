# wq2012/ls_conformer_small_ge2e

## Resumen

`wq2012/ls_conformer_small_ge2e` es un modelo de verificación e identificación de hablante (speaker verification) desarrollado por el usuario wq2012 y publicado como parte de la colección FlaxSpeaker. No genera texto ni responde instrucciones: su función es convertir una señal de audio en un embedding de hablante de 192 dimensiones y permitir decidir, mediante similitud coseno, si dos fragmentos de audio corresponden a la misma persona. El checkpoint contiene 2.029.894 parámetros en el encoder, lo que lo sitúa en la gama ultraligera y permite ejecutarlo incluso en CPU de móvil.

Técnicamente es un encoder Conformer en su variante `small` con pooling temporal atento (`atp`), entrenado con la pérdida `ge2e_softmax` y puntuado con distancia coseno. El frontend de audio es un log-mel de 80 dimensiones a 16 kHz con detección de actividad de voz (VAD) basada en energía y normalización CMVN. Está entrenado en el dominio LibriSpeech (inglés leído) y evaluado también en CN-Celeb2 (chino multigénero) y VoxCeleb1 (inglés en condiciones reales).

Su relevancia es doble. Por un lado, es una reproducción open source "clean-room" en JAX/Flax de algoritmos publicados por Google (GE2E, Dr-Vectors, Conformer-ATP y PFAS), con licencia Apache 2.0 y pesos en safetensors, msgpack de Flax y TensorFlow Lite FP32/INT8, lo que facilita su integración en pipelines biométricos y en dispositivos de borde. Por otro, sus resultados publicados permiten calibrar expectativas de forma realista: rinde razonablemente bien en inglés leído (9,67 % EER con una sola utterance) pero degrada de forma acusada en dominios no vistos (28,50 % EER en CN-Celeb2).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (variante `small`) con pooling temporal atento (`atp`) |
| Parametros totales | 2.029.894 (encoder) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el frontend usa VAD de energia para segmentar audio de duracion arbitraria |
| Tipos de cuantizacion | FP32 (safetensors/msgpack) y INT8 dynamic-range (TFLite, ~3,5x mas pequeno) |
| Idiomas soportados | no disponible como lista oficial; entrenado con LibriSpeech (ingles) y evaluado en CN-Celeb2 (chino) y VoxCeleb1 (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, Flax msgpack (`flax_model.msgpack`), TensorFlow Lite FP32 e INT8 |
| Dimension del embedding de salida | 192 |
| Perdida de entrenamiento | `ge2e_softmax` |
| Puntuacion de verificacion | similitud coseno |
| Frontend de audio | log-mel de 80 dimensiones a 16.000 Hz + VAD de energia + CMVN |
| Pipeline declarado | audio-classification |
| Dominio de entrenamiento | librispeech |

## Arquitectura y entrenamiento

El modelo es un encoder Conformer, es decir, un bloque transformer que combina auto-atención multi-cabeza con convoluciones depthwise para capturar simultáneamente dependencias globales y patrones locales en el espectrograma. La variante `small` reduce el número de capas y la dimensión del modelo hasta los 2.029.894 parámetros del encoder. Sobre las representaciones del encoder se aplica un pooling temporal atento (`atp`, Attentive Temporal Pooling), que agrega la secuencia temporal en un único vector de 192 dimensiones ponderando los frames más informativos, una técnica descrita en el trabajo de Conformer-ATP para identificación de idioma en habla de formato largo.

El entrenamiento usa la pérdida GE2E softmax, que optimiza los embeddings de forma que las utterances del mismo hablante queden próximas y las de hablantes distintos alejadas, con un componente softmax que estabiliza el gradiente. La verificación final se realiza con similitud coseno entre embeddings, sin capa de clasificación adicional, lo que permite dar de alta nuevos hablantes (enrolamiento) sin reentrenar. El modelo se entrenó sobre el dominio LibriSpeech; los datasets CN-Celeb y VoxCeleb aparecen en las etiquetas del repositorio, pero la model card solo documenta explícitamente `librispeech` como dominio de entrenamiento, así que la composición exacta del dataset, el número de tokens o de horas y el uso de RLHF/DPO no están disponibles en la información proporcionada. El proyecto se declara una reproducción independiente en JAX/Flax de los papers GE2E (arXiv:1710.10467), Dr-Vectors (arXiv:2104.01989), Conformer-ATP (arXiv:2202.12163) y PFAS (arXiv:2203.05642), y aclara que los experimentos originales se hicieron con infraestructura y datos internos de Google, no con esta librería ni con estos splits públicos.

## Capacidades

- Extracción de embeddings de hablante de 192 dimensiones a partir de audio, mediante `model.extract_embedding(ruta_audio)`.
- Verificación de hablante uno a uno: dada una utterance de enrolamiento y una de prueba, devuelve una puntuación de similitud coseno (`model.verify(enroll, test)`).
- Identificación de hablante por comparación contra una galería de embeddings previamente enrolados.
- Verificación con múltiples utterances de enrolamiento (evaluada con 3 utterances), que reduce el EER de forma consistente frente al modo de una sola utterance.
- Funcionamiento sobre audio de duración arbitraria gracias al frontend con VAD de energía, que segmenta y normaliza la señal.
- Inferencia en CPU y en dispositivos de borde mediante los exports de TensorFlow Lite FP32 e INT8.
- Independencia del idioma a nivel arquitectónico (embedding acústico, no textual), aunque el rendimiento depende fuertemente del dominio acústico.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, visión ni audio generativo: es exclusivamente un modelo de representación de audio para reconocimiento de hablante.

## Casos de uso

- Verificación biométrica de acceso: enrolar al usuario con una o varias grabaciones y validar su identidad en cada intento de acceso comparando el embedding de la utterance de prueba con el de referencia; el tamaño de 2 M de parámetros permite ejecutar la comprobación en el propio dispositivo sin enviar audio a la nube.
- Diarización "quién habló cuándo" en transcripciones de reuniones: segmentar el audio con VAD, extraer un embedding por segmento y agrupar por similitud coseno para asignar turnos de palabra a hablantes anónimos.
- Detección de fraude en centros de atención telefónica: comparar la voz del interlocutor con una lista negra de embeddings de hablantes conocidos, como señal adicional dentro de un sistema antifraude.
- Deduplicación y curación de corpus de audio: agrupar grabaciones por hablante para evitar fugas de identidad entre los splits de entrenamiento, validación y test de otros modelos.
- Personalización de asistentes de voz: reconocer al miembro del hogar que habla para cargar su perfil, sus preferencias o sus permisos, con la ventaja de que el modelo cabe en un TFLite INT8 y no requiere GPU.
- Verificación de identidad en procesos regulados de consentimiento de voz: comprobar que la persona que firma o consiente un contrato es la misma que la enrolada previamente, usando el modo de 3 utterances para reducir el EER.
- Análisis de archivos de audio históricos o periodísticos: agrupar fragmentos por locutor para reconstruir entrevistas o atribuir citas, aplicando el macro-promedio universal como umbral de decisión.
- Investigación en reconocimiento de hablante: servir de baseline ligero y reproducible en JAX para comparar nuevas pérdidas, frontends o estrategias de pooling sobre LibriSpeech, CN-Celeb2 y VoxCeleb1.

## Benchmarks y rendimiento

Resultados publicados en `eval_results.json` para verificación con una sola utterance (1-utt), con intervalos de confianza bootstrap al 95 %:

| Split de evaluacion | Trials | EER (%) | IC 95% (%) | minDCF@0.01 | minDCF@0.10 | ROC-AUC |
|---|---|---|---|---|---|---|
| LibriSpeech (ingles leido) | 3.000 | 9,67 | [8,73; 10,87] | 0,8133 | 0,5080 | 0,9629 |
| CN-Celeb2 (chino multigenero) | 3.000 | 28,50 | [26,80; 30,00] | 0,9767 | 0,9560 | 0,7918 |
| VoxCeleb1 (celebridades en condiciones reales) | 2.000 | 22,00 | [20,35; 23,70] | 0,9370 | 0,8830 | 0,8609 |
| Universal pooled (los 3 dominios) | 8.000 | 20,12 | [19,30; 21,04] | 0,9593 | 0,8387 | 0,8843 |
| Universal macro-average (3 dominios) | 8.000 | 20,06 | no disponible | 0,9090 | 0,7823 | 0,8719 |

Resultados con tres utterances de enrolamiento (3-utt):

| Split de evaluacion | Trials | EER 3-utt (%) | IC 95% (%) | minDCF@0.01 | ROC-AUC |
|---|---|---|---|---|---|
| LibriSpeech (3-utt) | 1.000 | 5,50 | [4,00; 7,05] | 0,5100 | 0,9863 |
| CN-Celeb2 (3-utt) | 1.000 | 26,10 | [23,09; 28,50] | 0,9580 | 0,8415 |
| VoxCeleb1 (3-utt) | 1.000 | 17,50 | [15,25; 20,00] | 0,9340 | 0,8976 |
| Universal pooled (3-utt) | 3.000 | 16,73 | [15,27; 17,87] | 0,9387 | 0,9194 |
| Universal macro-average (3-utt) | 3.000 | 16,37 | no disponible | 0,8007 | 0,9085 |

No se han publicado resultados de benchmarks de tipo MMLU, HumanEval o GSM8K, ya que el modelo no es un modelo de lenguaje. No se proporcionan cifras comparativas frente a otros sistemas de verificación de hablante.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32; los 2,03 M de parámetros ocupan aproximadamente 8 MB en FP32 y 4 MB en FP16, más el coste de activaciones del frontend log-mel y del encoder, que es pequeño.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente. El modelo está pensado para CPU; una RTX 4090, A100 o H100 están sobredimensionadas y no aportan ventaja significativa sobre CPU para una sola utterance.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU y en CPU de móvil o Raspberry Pi a través de los exports TFLite.
- Opciones de despliegue: la librería `flaxspeaker` (carga desde Hugging Face Hub con `load_pretrained`), el script `scripts/inference.py` para línea de comandos, y TensorFlow Lite (`model_fp32.tflite` y `model_int8.tflite`) para borde y móvil. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. La model card no publica mediciones de latencia ni de RTF. El único dato cuantitativo de eficiencia es que la versión INT8 es aproximadamente 3,5 veces más pequeña que la FP32.

## Comparativa con modelos similares

No se han publicado en la información disponible resultados de benchmarks comparativos frente a otras alternativas de la misma categoría. La tabla siguiente recoge únicamente la comparación cualitativa posible con las familias de referencia del sector, marcando como "no disponible" todo dato numérico que no se ha proporcionado:

| Modelo | Arquitectura | Parametros | Contexto / entrada | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| wq2012/ls_conformer_small_ge2e | Conformer small + ATP | 2.029.894 | log-mel 80 dim @ 16 kHz, audio de duracion libre con VAD | Apache 2.0 | EER 9,67 % en LibriSpeech (1-utt); 20,06 % macro-average |
| ECAPA-TDNN (familia SpeechBrain) | TDNN con atencion de canal y estadisticas | no disponible | features mel, audio de duracion libre | Apache 2.0 (segun implementacion) | no disponible |
| X-vector / TDNN clasico | TDNN con pooling estadistico | no disponible | features MFCC/mel | varia segun implementacion | no disponible |
| WavLM / HuBERT con cabecera de hablante | Transformer auto-supervisado grande | cientos de millones | waveform o features | MIT / Apache 2.0 segun variante | no disponible |

La diferencia estructural más relevante no es de precisión sino de escala: los modelos auto-supervisados tipo WavLM emplean dos o tres órdenes de magnitud más parámetros, mientras que este checkpoint apunta a despliegue en borde con 2 M de parámetros y exports TFLite.

## Limitaciones y advertencias

- Degradación fuerte fuera de dominio: el EER pasa de 9,67 % en LibriSpeech (inglés leído) a 22,00 % en VoxCeleb1 y a 28,50 % en CN-Celeb2. En condiciones de ruido, reverberación, acento no nativo o idioma distinto del inglés, el rendimiento esperado es sustancialmente peor que el del dominio de entrenamiento.
- Sesgo de dominio: al entrenarse sobre LibriSpeech, el modelo está sesgado hacia habla inglesa leída, con micrófono limpio y sin solapamiento de hablantes. No hay datos publicados sobre sesgo por género, edad, acento o etnia.
- Riesgo de falsos positivos y falsos negativos: con EER del 20 % en el promedio universal, desplegarlo como única barrera de seguridad es inadecuado. Debe combinarse con otros factores de autenticación y calibrarse el umbral con datos propios.
- Ausencia de antispoofing: el modelo no incorpora detección de reproducción, síntesis de voz ni deepfakes. Puede aceptar audio generado si se le presenta como enrolamiento o prueba.
- Limitaciones de idioma no documentadas: la model card no declara una lista oficial de idiomas soportados; los resultados en chino son notablemente peores que en inglés.
- Número de utterances de enrolamiento: el EER depende del modo (1-utt frente a 3-utt). No hay información sobre el comportamiento con más de tres utterances de enrolamiento ni sobre protocolos de actualización del perfil biométrico.
- Licencia: Apache 2.0, permisiva para uso comercial, pero el repositorio incluye un aviso explícito de que no es un producto oficialmente soportado por Google y que se trata de una reproducción independiente cuyos resultados no son comparables a los de los papers originales.
- Advertencias legales y éticas: los embeddings de voz son datos biométricos. Su tratamiento en la Unión Europea está sujeto al RGPD y requiere base jurídica, evaluación de impacto y medidas de cifrado o almacenamiento seudonimizado. El modelo no ofrece ninguna garantía de equidad entre grupos demográficos.
- Madurez y soporte: el repositorio registra 0 descargas y 0 likes, con fecha de creación y actualización el 15 de octubre de 2026, y un tamaño de repositorio de 0,0 GB. No hay comunidad, informes de errores ni garantía de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/ls_conformer_small_ge2e
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E (arXiv:1710.10467): https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors (arXiv:2104.01989): https://arxiv.org/abs/2104.01989
- Paper Conformer-ATP (arXiv:2202.12163): https://arxiv.org/abs/2202.12163
- Paper PFAS (arXiv:2203.05642): https://arxiv.org/abs/2203.05642
- La búsqueda web realizada no devolvió ningún enlace técnico relevante sobre este modelo; los resultados obtenidos eran contenido no relacionado y se han descartado.
