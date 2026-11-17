# wq2012/ls_conformer_small_sphereface

## Resumen

`ls_conformer_small_sphereface` es un extractor de embeddings de locutor (speaker embeddings) desarrollado por wq2012 dentro del proyecto FlaxSpeaker, una reimplementación desde cero en JAX/Flax de algoritmos de reconocimiento de locutor publicados en la literatura (GE2E, Dr-Vectors, ATP y PFAS). El modelo convierte fragmentos de audio en vectores de 192 dimensiones que permiten verificar si dos grabaciones corresponden al mismo hablante mediante similitud coseno. Su tamaño es muy reducido: 2.029.892 parámetros de inferencia, lo que lo sitúa en la categoría de modelos ligeros desplegables en CPU.

La arquitectura combina un backbone Conformer de configuración "small" con pooling temporal atento (ATP) y un objetivo de entrenamiento SphereFace, evaluado con puntuación coseno. Está entrenado exclusivamente sobre LibriSpeech (232 hablantes, 5.788 enunciados) durante 2.400 pasos (~26,54 épocas), por lo que debe entenderse como un checkpoint de referencia para comparaciones controladas dentro del benchmark FlaxSpeaker, no como un sistema de nivel industrial.

Su relevancia actual reside en dos factores: por un lado, ofrece una implementación abierta y reproducible (Apache 2.0, pesos en safetensors y msgpack) de técnicas de verificación de locutor en el ecosistema JAX/Flax, poco poblado en comparación con PyTorch; por otro, su huella mínima permite experimentar con pipelines de biometría de voz y diarización en hardware modesto, algo poco habitual en este dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (variante small) con pooling temporal ATP (Attentive Temporal Pooling) |
| Parametros totales | 2.029.892 (encoder + cabeza de scoring; excluye pesos del clasificador solo de entrenamiento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa crops de 90-180 frames; no se especifica ventana máxima en segundos) |
| Tipos de cuantizacion | No disponible (pesos en safetensors y msgpack; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible (entrenado solo con LibriSpeech, corpus en inglés; no se declaran idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y Flax msgpack (`flax_model.msgpack`) |

## Arquitectura y entrenamiento

El modelo emplea un backbone Conformer de tamano small, disenado para capturar dependencias locales y globales en secuencias de audio mediante convoluciones y atencion. Sobre las representaciones del encoder se aplica ATP (Attentive Temporal Pooling), una cabeza de pooling atento adaptada de un articulo de identificacion de idioma, que agrega la informacion temporal en un unico vector de 192 dimensiones. La funcion de perdida es SphereFace, una variante de margen angular sobre softmax, y la verificacion se realiza con similitud coseno entre embeddings. El frontend de audio es propio de la libreria (`flaxspeaker.AudioFrontend`): Mel log-natural de 80 dimensiones a 16 kHz, VAD a nivel de frame basado en energia y CMVN; no es un `AutoFeatureExtractor` de Hugging Face.

El entrenamiento se realizo en una estacion de trabajo CPU con semilla 42, mini-batches de 64 enunciados (8 hablantes x 4 enunciados), 2.400 pasos y warmup de 240 pasos, lo que equivale a ~26,54 epocas sobre 5.788 enunciados de 232 hablantes de LibriSpeech. Se usaron crops de longitud variable U(90, 180) frames con mascara de validez exacta. El EER en dominio paso de 25,03 % (1-utt) en el paso 400 a 8,40 % (1-utt) / 4,10 % (3-utt) en el paso 2400, con una desviacion estandar entre semillas de 0,08-0,41 % absoluto. El autor advierte explicitamente que no es una reproduccion a gran escala de los articulos originales, sino un checkpoint convergido sobre un corpus pequeno.

## Capacidades

- Extraccion de embeddings de locutor de 192 dimensiones a partir de audio.
- Verificacion de locutor (speaker verification) mediante similitud coseno entre embeddings.
- Reconocimiento de locutor (speaker identification) comparando contra un conjunto de referencia.
- Puntuacion con PFAS (Parameter-Free Attentive Scoring) y cabezas GE2E/Dr-Vector incluidas en los pesos.
- Procesamiento de audio a 16 kHz con VAD y CMVN integrados en el frontend de la libreria.
- Ejecucion en JAX/Flax, con pesos tambien en formato msgpack nativo.
- No soporta tool calling, agentes, vision, audio generativo ni razonamiento multi-paso: es un modelo de feature extraction, no un LLM.
- Capacidades multilingues: no documentadas (entrenamiento solo en LibriSpeech, ingles).

## Casos de uso

- Verificacion biométrica de voz en aplicaciones de control de acceso: el modelo genera embeddings de 192 dimensiones que se comparan por similitud coseno para autenticar a un usuario registrado previamente, con un coste computacional mínimo que permite ejecución en CPU.
- Diarizacion de reuniones y transcripciones: segmentar un audio largo en turnos de habla y agrupar los segmentos por locutor usando los embeddings, aprovechando el VAD integrado para descartar silencios.
- Investigación y docencia en biometría de voz: sirve como referencia reproducible en JAX/Flax para comparar variantes de pooling, pérdidas y arquitecturas dentro del benchmark FlaxSpeaker.
- Detección de locutor en grabaciones de centros de llamadas: verificar si una llamada coincide con un cliente registrado o detectar suplantaciones, con la advertencia de que el rendimiento fuera de dominio no está validado.
- Preprocesado para pipelines de ASR: enriquecer transcripciones con etiquetas de hablante para separar interlocutores antes de pasar el audio a un sistema de reconocimiento de voz.
- Pruebas de regresión en sistemas de altavoces inteligentes: validar que el módulo de identificación de usuario responde de forma consistente ante cambios de firmware o de frontend de audio.
- Prototipado rápido en entornos sin GPU: al tener solo ~2 M de parámetros, permite iterar sobre umbrales de decisión y métricas (EER, minDCF) en portátiles convencionales.

## Benchmarks y rendimiento

Los datos publicados en la model card son métricas de evaluación del propio checkpoint, no comparaciones directas con otros modelos en los mismos conjuntos. Se recogen a continuación tal como aparecen en la información disponible:

| Metrica | Paso 400 | Paso 2000 | Paso 2400 (final) |
|---|---|---|---|
| EER LibriSpeech 1-utt | 25,03 % | 8,93 % | 8,40 % |
| EER LibriSpeech 3-utt | 19,80 % | 4,30 % | 4,10 % |
| EER Universal Pooled 1-utt | No disponible | No disponible | 16,60 % |
| EER Universal Pooled 3-utt | No disponible | No disponible | 12,13 % |

El autor cita como orientación sistemas ECAPA-TDNN entrenados en VoxCeleb2-dev con ~0,9 % EER en VoxCeleb1-O y sistemas de menos de 1 M de parámetros con ~2 % EER (EfficientTDNN, 2022). Estas cifras corresponden a otros trabajos y no son resultados de este modelo. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de verificación de locutor.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32; el modelo tiene ~2 M de parámetros (~8 MB de pesos), por lo que la memoria dominante es la del frontend y los buffers de audio.
- GPU recomendadas: cualquier GPU con soporte JAX/CUDA; no requiere A100 ni H100. Una RTX 4090 o incluso una GTX 1650 son sobradas para inferencia.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer e incluso en CPU. El entrenamiento documentado se realizó en una estación de trabajo CPU.
- Opciones de despliegue: librería `flaxspeaker >= 0.5.0` sobre JAX/Flax; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma numérica; el tamaño reducido sugiere latencias de milisegundos por utterance en CPU, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wq2012/ls_conformer_small_sphereface` | 2.029.892 | Audio 16 kHz, crops 90-180 frames | 8,40 % EER (1-utt) en LibriSpeech | Apache 2.0 | Hugging Face, PyPI |
| ECAPA-TDNN (referencia citada, Desplanques et al., 2020) | No disponible en la informacion | Audio | ~0,9 % EER en VoxCeleb1-O | No disponible | No disponible |
| EfficientTDNN (Wang et al., 2022) | < 1 M | Audio | ~2 % EER | No disponible | No disponible |

La comparación con ECAPA-TDNN y EfficientTDNN es solo orientativa: sus cifras provienen de corpus de entrenamiento mucho mayores (VoxCeleb2-dev, 5.994 hablantes y ~1,1 M de utterances) y no son directamente comparables con este checkpoint entrenado sobre 232 hablantes. No se dispone de otros modelos comparables en la misma categoría y ecosistema (JAX/Flax) en la información proporcionada.

## Limitaciones y advertencias

- Entrenado únicamente con LibriSpeech (232 hablantes, 5.788 enunciados): la diversidad de hablantes es muy inferior a la de sistemas industriales, lo que limita la generalización.
- El propio autor advierte que no es una reproducción a gran escala de los artículos originales y que no debe considerarse estado del arte.
- EER en dominio de 8,40 % (1-utt) y 16,60 % en Universal Pooled (1-utt): valores altos para producción en verificación biométrica.
- No hay validación documentada fuera de dominio (VoxCeleb, CN-Celeb aparecen como datasets asociados en los tags, pero el entrenamiento fue solo con LibriSpeech).
- Riesgo de sesgo por idioma y acento: al entrenar solo con inglés de LibriSpeech, el rendimiento con otras lenguas o acentos no está caracterizado.
- No es un producto oficialmente soportado por Google, pese a la inspiración en trabajos de la compañía.
- El frontend de audio es propio de `flaxspeaker` y no es compatible con `AutoFeatureExtractor` de Hugging Face; requiere la librería para un uso correcto.
- No se documentan cuantizaciones ni formatos GGUF/ONNX, lo que limita su integración en runtimes fuera de JAX/Flax.
- Licencia Apache 2.0: permite uso comercial, pero sin garantías y con obligación de conservar avisos de licencia.

## Enlaces

- Hugging Face: https://huggingface.co/wq2012/ls_conformer_small_sphereface
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- GE2E (arXiv:1710.10467): https://arxiv.org/abs/1710.10467
- Dr-Vectors (arXiv:2104.01989): https://arxiv.org/abs/2104.01989
- ATP (arXiv:2202.12163): https://arxiv.org/abs/2202.12163
- PFAS (arXiv:2203.05642): https://arxiv.org/abs/2203.05642
