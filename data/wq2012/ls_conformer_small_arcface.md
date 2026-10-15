# wq2012/ls_conformer_small_arcface

## Resumen

`ls_conformer_small_arcface` es un modelo de verificacion de hablante (speaker verification) desarrollado por el usuario wq2012 dentro del proyecto FlaxSpeaker, una reproduccion limpia en JAX/Flax de algoritmos de reconocimiento de hablante publicados originalmente por Google. El modelo toma una senal de audio y produce un embedding de 192 dimensiones que representa la identidad vocal del locutor, permitiendo comparar dos fragmentos de audio mediante similitud coseno para decidir si pertenecen a la misma persona.

Se trata de un encoder Conformer de tamano "small" con solo 2.029.892 parametros, entrenado sobre el corpus LibriSpeech en ingles. Emplea pooling temporal atento (ATP, Attentive Temporal Pooling) y una funcion de perdida ArcFace, siguiendo las lineas de trabajo de GE2E, Dr-Vectors, Conformer-ATP y PFAS. El frontend de audio es un log-mel de 80 dimensiones a 16 kHz con deteccion de actividad vocal (VAD) basada en energia y normalizacion CMVN.

Su relevancia actual radica en que es un modelo extremadamente ligero (apenas 2 millones de parametros) publicado bajo licencia Apache 2.0, lo que lo hace apto para despliegue en entornos con recursos limitados, edge computing o pipelines de verificacion a gran escala. No obstante, sus metricas de error en dominios fuera de LibriSpeech (CN-Celeb2, VoxCeleb1) son notablemente altas, lo que lo posiciona como una referencia academica o un componente de bajo coste mas que como un sistema de produccion de alta precision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (variante small) con pooling temporal atento (ATP) |
| Parametros totales | 2.029.892 (encoder) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio; frontend log-mel de 80 dim a 16 kHz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre LibriSpeech, corpus en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, flax_model.msgpack (Flax nativo) |
| Dimension del embedding de salida | 192 |
| Funcion de perdida | ArcFace |
| Scoring de verificacion | Similitud coseno |
| Frontend de audio | log-mel 80 dim @ 16000 Hz, VAD por energia, CMVN |
| Libreria | flaxspeaker |

## Arquitectura y entrenamiento

El backbone es un Conformer de configuracion "small", una arquitectura que combina bloques de auto-atencion con convoluciones para capturar tanto dependencias globales como patrones locales en la secuencia acustica. Sobre las representaciones del encoder se aplica pooling temporal atento (ATP), que pondera dinamicamente los frames mas informativos para la identidad del hablante, y se proyecta a un embedding de 192 dimensiones. La funcion de perdida es ArcFace, un margen angular aditivo que fuerza una mayor separacion entre identidades en el espacio de embeddings, y la verificacion final se realiza mediante similitud coseno.

El modelo se entrena sobre el dominio `librispeech` (ingles leido). La model card indica que se trata de una reproduccion independiente en JAX/Flax de los metodos descritos en GE2E, Dr-Vectors, Conformer-ATP y PFAS, cuyos experimentos originales se realizaron con infraestructura propietaria de Google y datasets internos, no con esta libreria ni con los splits publicos. No se especifica el numero exacto de tokens o horas de audio utilizados en el entrenamiento, ni si se emplearon fases de RLHF, DPO u otras tecnicas de alineacion (no aplicables en este tipo de tarea).

## Capacidades

- Extraccion de embeddings de hablante de 192 dimensiones a partir de audio.
- Verificacion de hablante (1:1): comparar dos audios y obtener una puntuacion de similitud coseno.
- Multi-enrollment (3-utt): combinar tres utterances de un mismo hablante para mejorar la verificacion.
- Deteccion de actividad vocal (VAD) integrada por energia en el frontend.
- Inferencia en JAX/Flax, con API Python (`flaxspeaker.load_pretrained`) y script de linea de comandos.
- No soporta tool calling, function calling ni agentes.
- No dispone de modo "thinking", vision ni audio generativo; es exclusivamente un extractor de embeddings de identidad vocal.
- Capacidades multilingues: no declaradas; el entrenamiento se limita a LibriSpeech (ingles).

## Casos de uso

- Verificacion de identidad por voz en autenticacion de acceso: el modelo puede comparar el audio de un usuario con un embedding previamente enrolado y devolver una puntuacion coseno, gracias a su tamano minimo (2M de parametros) que permite ejecucion en tiempo real incluso en dispositivos modestos.
- Control de acceso en aplicaciones moviles o embebidas: al ocupar un repo de 0.0 GB y requerir muy poca memoria, puede integrarse en apps moviles o firmware para desbloquear funciones mediante la voz.
- Segmentacion y diarizacion de audio a pequena escala: usando los embeddings como representacion de identidad, se pueden agrupar fragmentos de audio pertenecientes al mismo locutor en grabaciones cortas.
- Filtrado de locutores en pipelines de transcripcion: descartar o etiquetar segmentos de audio segun la identidad vocal antes de enviarlos a un ASR.
- Investigacion academica y reproduccion de resultados: sirve como referencia abierta en JAX/Flax para comparar tecnicas de pooling atento, ArcFace y scoring coseno frente a implementaciones en PyTorch.
- Prototipado rapido de sistemas de verificacion: su licencia Apache 2.0 y su bajo coste computacional permiten iterar sobre umbrales y estrategias de enrollment sin necesidad de GPU dedicada.
- Deteccion de anomalias en llamadas o grabaciones: identificar cambios de locutor inesperados en un flujo de audio largo.

## Benchmarks y rendimiento

Resultados de verificacion con 1 utterance por lado (1-utt):

| Split de evaluacion | Trials | EER (%) | IC 95% (%) | minDCF@0.01 | minDCF@0.10 | ROC-AUC |
|---|---|---|---|---|---|---|
| LibriSpeech (ingles leido) | 3.000 | 14,47 | [13,20, 15,72] | 0,9433 | 0,6947 | 0,9312 |
| CN-Celeb2 (chino multigenero) | 3.000 | 28,73 | [27,03, 30,40] | 0,9833 | 0,9200 | 0,7829 |
| VoxCeleb1 (celebridades in-the-wild) | 2.000 | 23,85 | [22,05, 25,90] | 0,9620 | 0,9320 | 0,8491 |
| Universal Pooled (3 dominios) | 8.000 | 22,80 | [21,91, 23,69] | 0,9820 | 0,8630 | 0,8581 |
| Universal Macro-Average | 8.000 | 22,35 | — | 0,9629 | 0,8489 | 0,8544 |

Resultados con 3 utterances de enrollment (3-utt):

| Split de evaluacion | Trials | 3-utt EER (%) | IC 95% (%) | minDCF@0.01 | ROC-AUC |
|---|---|---|---|---|---|
| LibriSpeech (3-utt) | 1.000 | 9,60 | [7,60, 11,90] | 0,8180 | 0,9657 |
| CN-Celeb2 (3-utt) | 1.000 | 25,50 | [23,05, 28,20] | 0,9860 | 0,8300 |
| VoxCeleb1 (3-utt) | 1.000 | 18,30 | [15,55, 20,60] | 0,9520 | 0,9017 |
| Universal Pooled (3-utt) | 3.000 | 18,23 | [16,83, 19,50] | 0,9713 | 0,9056 |
| Universal Macro-Average (3-utt) | 3.000 | 17,80 | — | 0,9187 | 0,8991 |

No se han publicado comparaciones directas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB por el tamano del encoder (2.029.892 parametros) y el frontend log-mel; no se especifica una cifra oficial.
- GPU recomendadas: cualquier GPU con soporte JAX, incluidas RTX 3060, RTX 4090, A100 o H100; el modelo es lo bastante pequeno para ejecutarse tambien en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: libreria `flaxspeaker` (JAX/Flax), script `scripts/inference.py`; tambien puede cargarse desde Hugging Face Hub mediante `flaxspeaker.load_pretrained`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos con modelos equivalentes de reconocimiento de hablante (por ejemplo, ECAPA-TDNN, x-vector o WavLM-based speaker models) en la informacion proporcionada. La model card no incluye una tabla de comparacion frente a alternativas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ls_conformer_small_arcface | 2.029.892 | audio (log-mel 16 kHz) | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo es una reproduccion independiente en JAX/Flax de metodos publicados por Google; no es un producto oficialmente soportado por Google.
- Las metricas de EER en dominios distintos al entrenamiento son elevadas: 28,73% en CN-Celeb2 y 23,85% en VoxCeleb1 con 1 utterance, lo que indica baja generalizacion fuera de ingles leido.
- Incluso en su dominio de entrenamiento (LibriSpeech), el EER con 1 utterance es del 14,47%, lejos de los sistemas de verificacion de hablante de alto rendimiento.
- No se declaran idiomas soportados oficialmente; el entrenamiento se limita a LibriSpeech (ingles).
- Riesgo de sesgo respecto a acentos, genero, edad y condiciones acusticas no representadas en LibriSpeech.
- Riesgo de alucinacion no aplica en sentido generativo, pero si existe riesgo de falsos positivos/negativos en la verificacion, especialmente en audio ruidoso o de corta duracion.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se atribuya correctamente.
- Para produccion se recomienda calibrar el umbral de decision por dominio y usar multi-enrollment (3 utterances), que reduce el EER de forma notable.
- No se especifican cuantizaciones disponibles, lo que limita opciones de optimizacion para despliegue en hardware muy restringido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/ls_conformer_small_arcface
- Coleccion FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI flaxspeaker: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper Conformer-ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642v3
