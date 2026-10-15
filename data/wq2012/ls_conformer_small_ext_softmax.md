# wq2012/ls_conformer_small_ext_softmax

## Resumen

`ls_conformer_small_ext_softmax` es un modelo de verificacion e identificacion de hablante (speaker verification/recognition) desarrollado por el usuario independiente wq2012 como parte de la biblioteca `FlaxSpeaker`. Se trata de una reproduccion open source, "clean-room", en JAX/Flax de varios algoritmos publicados por Google (GE2E, Dr-Vectors, Conformer-ATP y PFAS), y no de un producto oficialmente soportado por Google. El modelo genera embeddings de hablante de 192 dimensiones a partir de audio y permite verificar si dos fragmentos pertenecen a la misma persona mediante puntuacion por similitud coseno.

La arquitectura de backbone es un Conformer en configuracion "small" con pooling temporal atento (ATP, Attentive Temporal Pooling) y entrenamiento con la funcion de perdida `extended_set_softmax`. El encoder tiene 2.029.894 parametros, por lo que es un modelo muy ligero, orientado a inferencia en CPU o en GPUs de gama baja. La entrada de audio se procesa mediante un frontend de 80 dimensiones de log-mel a 16 kHz, con deteccion de actividad de voz (VAD) basada en energia y normalizacion CMVN.

El modelo esta entrenado sobre LibriSpeech (ingles leido) y se evalua tambien en CN-Celeb2 (chino multi-genero) y VoxCeleb1 (habla "in the wild" de celebridades), lo que lo convierte en una referencia util para experimentar con reconocimiento de hablante en dominios cruzados. Su licencia Apache 2.0 y su tamano reducido lo hacen atractivo para integrarlo en prototipos, pipelines de diarizacion o sistemas de control de acceso por voz sin coste de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (variante "small"), con pooling temporal atento (ATP) |
| Parametros totales | 2.029.894 (encoder) |
| Longitud de contexto | no disponible en la model card; procesa utterances completas de audio |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors y msgpack, sin variantes cuantizadas) |
| Idiomas soportados | no disponible como campo; entrenamiento sobre LibriSpeech (ingles), evaluacion cruzada en chino (CN-Celeb2) e ingles "in the wild" (VoxCeleb1) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, flax_model.msgpack (Flax nativo) |
| Dimension del embedding de salida | 192 |
| Funcion de perdida | extended_set_softmax |
| Puntuacion de verificacion | similitud coseno |
| Frontend de audio | log-mel de 80 dimensiones a 16 kHz + VAD de energia + CMVN |
| Dominio de entrenamiento | LibriSpeech |
| Libreria | flaxspeaker (JAX/Flax) |
| Pipeline | audio-classification |

## Arquitectura y entrenamiento

El backbone es un Conformer, es decir, un transformer aumentado con modulos convolucionales, disenado originalmente para reconocimiento de voz (INTERSPEECH 2020) y reutilizado aqui para extraer representaciones de hablante. Sobre las representaciones temporales del encoder se aplica un pooling atento (ATP), que pondera los frames mas relevantes para obtener un unico vector de 192 dimensiones por utterance. El frontend convierte el audio a log-mel de 80 bandas a 16 kHz, aplica deteccion de actividad de voz basada en energia y normalizacion CMVN antes de alimentar el encoder.

El entrenamiento utiliza la perdida `extended_set_softmax`, una variante de las perdidas de conjunto (set-based) empleadas en reconocimiento de hablante, y el checkpoint se enmarca en la reproduccion de las tecnicas GE2E, Dr-Vectors y PFAS. No se detallan en la model card el numero total de tokens de audio ni la composicion exacta del dataset de entrenamiento, mas alla de indicar LibriSpeech como dominio de entrenamiento. Tampoco se especifica si hubo etapas de ajuste adicional. Cabe subrayar que los articulos originales se experimentaron con infraestructura y datos internos de Google, por lo que este checkpoint es una reproduccion independiente y no replica exactamente las condiciones de los papers.

## Capacidades

- Extraccion de embeddings de hablante de 192 dimensiones a partir de una utterance de audio.
- Verificacion de hablante (1:1): dada una muestra de enrolamiento y una de prueba, devuelve una puntuacion de similitud coseno.
- Verificacion con multiples utterances de enrolamiento: la model card reporta resultados especificos para configuracion de 3 utterances.
- Identificacion de hablante (1:N) por comparacion de embeddings contra una galeria.
- Evaluacion multi-dominio: ingles leido, chino multi-genero y habla "in the wild".
- API de Python (`load_pretrained`, `extract_embedding`, `verify`) y script de linea de comandos (`scripts/inference.py`).
- Compatible con `WhisperFeatureExtractor` para el preprocesado de audio.
- No soporta tool calling, agentes, generacion de texto, vision ni audio-texto; es un modelo discriminativo de audio, no generativo.

## Casos de uso

- Verificacion de locutor en autenticacion por voz: con un embedding de 192 dimensiones y puntuacion coseno se puede construir un control de acceso comparando la voz del usuario contra un enrolamiento previo, con umbrales ajustados a partir de las curvas EER/minDCF publicadas.
- Diarizacion de reuniones y transcripciones: usar los embeddings como paso de asignacion de locutor tras segmentar audio con VAD, agrupando segmentos por similitud coseno para etiquetar quien habla en cada tramo.
- Deduplicacion de audios y deteccion de hablantes repetidos en grandes corpus: extraer embeddings y hacer busqueda por similitud para detectar la misma persona en distintas grabaciones.
- Prototipado rapido en CPU: dado su tamano (2 millones de parametros), es viable ejecutar inferencia en portatiles o servidores sin GPU para validar ideas antes de escalar a modelos mayores.
- Investigacion en dominios cruzados: el modelo incluye metricas en LibriSpeech, CN-Celeb2 y VoxCeleb1, lo que permite estudiar la degradacion de rendimiento al cambiar de idioma o de condiciones acusticas.
- Integracion en pipelines de analitica de audio: combinar con un sistema ASR para etiquetar hablantes en llamadas de atencion al cliente o en contenido multimedia.
- Filtrado y curación de datasets de voz: usar la verificacion para eliminar muestras duplicadas o mal etiquetadas en corpus de entrenamiento.
- Baseline para comparativas academicas: sirve como punto de partida ligero al comparar arquitecturas Conformer frente a alternativas tipo ECAPA-TDNN o x-vector.

## Benchmarks y rendimiento

Resultados de verificacion con una sola utterance (1-utt), tal como se publican en la model card:

| Split de evaluacion | Trials | EER (%) | IC 95% bootstrap (%) | minDCF@0.01 | minDCF@0.10 | ROC-AUC |
|---|---|---|---|---|---|---|
| LibriSpeech (ingles leido) | 3.000 | 10,03 | [9,10; 11,12] | 0,7967 | 0,5493 | 0,9604 |
| CN-Celeb2 (chino multi-genero) | 3.000 | 29,87 | [28,03; 31,40] | 0,9593 | 0,9233 | 0,7851 |
| VoxCeleb1 (in-the-wild) | 2.000 | 24,10 | [22,35; 25,95] | 0,9490 | 0,8890 | 0,8446 |
| Universal pooled (3 dominios) | 8.000 | 21,05 | [20,11; 21,93] | 0,9555 | 0,8115 | 0,8779 |
| Universal macro-average | 8.000 | 21,33 | — | 0,9017 | 0,7872 | 0,8634 |

Resultados con tres utterances de enrolamiento (3-utt):

| Split de evaluacion | Trials | EER (%) 3-utt | IC 95% bootstrap (%) | minDCF@0.01 | ROC-AUC |
|---|---|---|---|---|---|
| LibriSpeech (3-utt) | 1.000 | 6,20 | [4,65; 7,55] | 0,4980 | 0,9846 |
| CN-Celeb2 (3-utt) | 1.000 | 25,50 | [22,95; 28,50] | 0,9120 | 0,8314 |
| VoxCeleb1 (3-utt) | 1.000 | 20,20 | [18,00; 22,75] | 0,9420 | 0,8820 |
| Universal pooled (3-utt) | 3.000 | 17,53 | [16,20; 18,73] | 0,8853 | 0,9114 |
| Universal macro-average (3-utt) | 3.000 | 17,30 | — | 0,7840 | 0,8993 |

No se proporcionan comparaciones con otros modelos concretos dentro de la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 8 MB para los pesos (2,03 M de parametros); en fp16 alrededor de 4 MB.
- La memoria real de trabajo es superior por el buffer de audio, el frontend log-mel y las activaciones intermedias, pero sigue siendo muy reducida (del orden de decenas a pocos cientos de MB).
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en CPU; no requiere GPU dedicada.
- Despliegue: la via oficial es la libreria `flaxspeaker` en JAX/Flax, con script `scripts/inference.py`. No se documentan integraciones nativas con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos generativos, no aplicables a este modelo discriminativo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se aportan en la informacion disponible resultados de terceros para construir una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| `wq2012/ls_conformer_small_ext_softmax` | 2.029.894 | embedding de 192 dim, audio 16 kHz | Apache 2.0 | Hugging Face (FlaxSpeaker) |
| Alternativas tipo ECAPA-TDNN (familia) | no disponible | no disponible | no disponible | varias implementaciones open source |
| Alternativas tipo x-vector (TDNN, familia) | no disponible | no disponible | no disponible | varias implementaciones open source |
| Alternativas basadas en ResNet para speaker (familia) | no disponible | no disponible | no disponible | varias implementaciones open source |

Los valores concretos de los modelos comparables no se incluyen en la informacion proporcionada, por lo que se marcan como no disponibles.

## Limitaciones y advertencias

- El propio autor advierte de que "no es un producto oficialmente soportado por Google"; es una reproduccion clean-room y no replica las condiciones internas de los papers originales.
- Rendimiento notablemente peor fuera del dominio de entrenamiento: la EER sube de 10,03% en LibriSpeech (ingles leido) a 24,10% en VoxCeleb1 y 29,87% en CN-Celeb2, lo que indica sensibilidad al idioma y a las condiciones acusticas.
- El modelo no esta entrenado especificamente para chino ni para habla espontanea; los resultados en CN-Celeb2 y VoxCeleb1 deben interpretarse como evaluacion cruzada, no como rendimiento optimizado.
- Sesgos de hablante: los corpus de entrenamiento/evaluacion (LibriSpeech, VoxCeleb, CN-Celeb) tienen una composicion demografica concreta que puede provocar sesgos por acento, genero, edad o canal de grabacion.
- Riesgo de falsos positivos/negativos en verificacion: la EER de referencia (por ejemplo, 10,03% en LibriSpeech) implica tasas de error no despreciables para aplicaciones de seguridad; conviene ajustar umbrales con minDCF y validar en el dominio objetivo.
- Sin variantes cuantizadas publicadas (no hay GGUF/ONNX listados); el despliegue fuera de JAX/Flax requeriria conversion manual.
- El repositorio presenta 0 descargas y 0 "likes", lo que sugiere una adopcion muy baja y poca validacion por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo de voz conviene revisar implicaciones de privacidad y normativa (por ejemplo, RGPD) en aplicaciones biométricas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/ls_conformer_small_ext_softmax
- Coleccion FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI flaxspeaker: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper Conformer-ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
- Implementacion PyTorch de referencia de Conformer (no oficial): https://github.com/sooftware/conformer
