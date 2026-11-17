# wq2012/univ_conformer_small_pfas

## Resumen

`univ_conformer_small_pfas` es un modelo de verificación e identificación de hablante (speaker verification/recognition) desarrollado por el usuario wq2012 dentro del proyecto FlaxSpeaker. No es un modelo generativo: su función es extraer embeddings de voz (representaciones vectoriales de 640 dimensiones) que permiten determinar si dos fragmentos de audio corresponden al mismo hablante. Está implementado en JAX/Flax, una decisión poco habitual en un ecosistema dominado por PyTorch, y se distribuye con pesos en SafeTensors y Msgpack.

El modelo combina un backbone Conformer de tamano "small" con pooling temporal PFAS (Parameter-Free Attentive Scoring) y un objetivo de entrenamiento basado en Extended-Set Softmax con mezcla de row-softmax. Con solo 2.162.187 parámetros de inferencia (encoder más cabeza de scoring), es un modelo extremadamente compacto, pensado para servir como referencia reproducible y ligera en benchmarks controlados de reconocimiento de hablante.

Es relevante ahora porque ofrece una reproducción desde cero, con código abierto y licencia Apache 2.0, de varias técnicas publicadas (GE2E, Dr-Vectors, ATP, PFAS) que normalmente solo existen en implementaciones propietarias o en frameworks pesados. El autor advierte explícitamente de que se trata de un checkpoint de benchmark entrenado sobre un corpus pequeno (381 hablantes), no de un sistema de nivel industrial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (variante "small") con pooling temporal PFAS |
| Parametros totales | 2.162.187 (encoder + cabeza de scoring; excluye clasificador de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa crops de 90-180 frames en entrenamiento; ventana de inferencia no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (multidominio: LibriSpeech en inglés, CN-Celeb2 en chino, VoxCeleb1 multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors (`model.safetensors`) y Flax Msgpack (`flax_model.msgpack`) |

## Arquitectura y entrenamiento

El modelo usa un backbone Conformer, que combina convoluciones y auto-atención para capturar dependencias locales y globales en secuencias de audio. Sobre el encoder se aplica un pooling temporal PFAS con atención por frames (`shared_nonlinear`) y un ancla ATP global, con 4 cabezas de 32 y 128 dimensiones. La representación de salida es un embedding de 640 dimensiones. El frontend de audio es propio de FlaxSpeaker: Mel de 80 dimensiones en escala logarítmica natural a 16 kHz, VAD a nivel de frame y CMVN, implementado como `flaxspeaker.AudioFrontend` y no como un `AutoFeatureExtractor` de Hugging Face.

El entrenamiento se realizó sobre un pool multidominio de 9.447 utterances y 381 hablantes (LibriSpeech, CN-Celeb2 y VoxCeleb1), con 4.600 pasos de gradiente, batches de 32 utterances (8 hablantes x 4 utterances) y aproximadamente 15,58 épocas, semilla 42, sobre una estación de trabajo CPU. El objetivo es un Extended-Set Softmax mezclado (0,50 row-softmax + 0,50 extended-set con desplazamiento de logit -log N), una variante propia del autor que no coincide con la ecuación 2 del paper original. El EER agrupado universal evolucionó de 25,40 % (1-utt) / 22,33 % (3-utt) en el paso 400 a 17,60 % / 14,70 % en el paso 4600. El autor reporta una desviación estándar entre semillas de 0,08-0,41 % absoluto y un intervalo de confianza bootstrap del 95 % de aproximadamente 0,8 % de semi-anchura con 8.000 ensayos.

## Capacidades

- Extracción de embeddings de hablante de 640 dimensiones a partir de audio.
- Verificación de hablante (1:1): comparación de dos utterances mediante puntuación PFAS-SN.
- Identificación de hablante (1:N) mediante comparación de embeddings contra una galería.
- Reconocimiento multidominio: entrenado con datos en inglés (LibriSpeech), chino (CN-Celeb2) y multilingües (VoxCeleb1).
- Frontend de audio integrado con VAD y CMVN para preprocesado robusto.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-step: no disponible.
- Capacidades multilingües: limitadas al ámbito de hablante; no es un modelo de reconocimiento de voz ni de traducción.
- Capacidades especiales: scoring PFAS-SN con atención por frames y ancla ATP global; integración nativa con JAX/Flax.

## Casos de uso

- Verificación biométrica de locutor en aplicaciones de control de acceso: el modelo genera embeddings de 640 dimensiones que permiten comparar una muestra de voz con la plantilla registrada del usuario mediante la puntuación PFAS-SN, con un coste computacional mínimo gracias a sus 2,16 M de parámetros.
- Diarización de reuniones y transcripciones: al extraer embeddings por segmento, se pueden agrupar intervenciones por hablante en grabaciones de reuniones, llamadas o entrevistas, usando el VAD integrado para segmentar.
- Benchmark de referencia en investigación de reconocimiento de hablante: sirve como checkpoint reproducible y ligero para comparar variantes de pooling, funciones de pérdida o frontends dentro del marco FlaxSpeaker, con métricas EER y minDCF estandarizadas.
- Detección de suplantación o fraude telefónico: comparar la voz de una llamada entrante con la voz registrada del cliente para detectar discrepancias, con umbrales calibrados sobre el EER del modelo.
- Indexación y búsqueda de archivos de audio: generar un embedding por locutor y construir un índice vectorial para recuperar grabaciones de una persona concreta en archivos de medios o archivos de contact center.
- Prototipado en entornos sin GPU: al ser un modelo de 2,16 M de parámetros y entrenado/inferido en CPU, permite desplegar un servicio de verificación de hablante en hardware modesto o en el borde (edge) para pruebas de concepto.
- Investigación en privacidad de voz: usar los embeddings como representación anonimizada de la identidad vocal en pipelines de análisis que no requieren el audio original.

## Benchmarks y rendimiento

| Metrica | Paso 400 | Paso 4000 (knee) | Paso 4600 (final) |
|---|---|---|---|
| EER universal 1-utt | 25,40 % | 17,85 % | 17,60 % |
| EER universal 3-utt | 22,33 % | 14,87 % | 14,70 % |

El autor reporta además una desviación estándar entre semillas (0-2) de 0,08-0,41 % absoluto en EER 1-utt agrupado, y un intervalo de confianza bootstrap del 95 % de ~0,8 % de semi-anchura con 8.000 ensayos. No se han publicado resultados de benchmarks en la información disponible más allá de estas métricas de convergencia y de la comparación cualitativa con ECAPA-TDNN (~0,9 % EER en VoxCeleb1-O completo) y EfficientTDNN (<1 M parámetros, ~2 % EER), que el autor cita solo como orientación y no como comparación directa.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en FP32 para los pesos (2,16 M de parámetros); el consumo real depende del buffer de audio y del backend JAX.
- GPU recomendadas: cualquier GPU con soporte CUDA para JAX; el modelo es tan pequeno que una GTX 1650 o una T4 son suficientes. El autor entrenó en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: JAX/Flax con la librería `flaxspeaker` (PyPI); no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / datos | EER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `univ_conformer_small_pfas` | 2,16 M | 381 hablantes, 9.447 utterances | 17,60 % (1-utt) / 14,70 % (3-utt) en su benchmark | Apache 2.0 | Hugging Face + GitHub + PyPI |
| ECAPA-TDNN (Desplanques et al., 2020) | ~20 M (referencia habitual) | VoxCeleb2-dev (5.994 hablantes, ~1,1 M utterances) | ~0,9 % en VoxCeleb1-O | no disponible en la información | Implementaciones comunitarias en PyTorch |
| EfficientTDNN (Wang et al., 2022) | <1 M | VoxCeleb2-dev | ~2 % | no disponible en la información | Paper |

La comparación no es directa: el modelo de FlaxSpeaker se entrena sobre un corpus mucho menor y su EER no es comparable con sistemas entrenados a escala industrial. La comparativa sirve para contextualizar el orden de magnitud, tal como advierte el propio autor.

## Limitaciones y advertencias

- Checkpoint de benchmark, no de producción: entrenado sobre 381 hablantes y 9.447 utterances, muy por debajo de los corpus industriales (miles de hablantes). El EER absoluto está acotado por la diversidad de hablantes de entrenamiento.
- No es una reproducción a gran escala de los papers citados: el autor lo declara explícitamente; las experimentaciones originales se hicieron con infraestructura y datos internos de Google.
- Riesgo de sesgo demográfico: al entrenar con LibriSpeech, CN-Celeb2 y VoxCeleb1, la cobertura de acentos, edades, géneros y condiciones de grabación es limitada y puede degradar el rendimiento en poblaciones subrepresentadas.
- Sensibilidad a condiciones acústicas: ruido, reverberación, códec telefónico o micrófonos distintos pueden alterar los embeddings; el VAD y CMVN mitigan parte del problema pero no lo eliminan.
- Idiomas: no se declaran idiomas soportados de forma oficial; el uso multilingüe está limitado al reconocimiento de hablante, no a transcripción ni comprensión semántica.
- Licencia Apache 2.0: permite uso comercial, pero el autor incluye el aviso de que no es un producto oficialmente soportado por Google.
- Dependencia del ecosistema Flax/JAX y de la librería `flaxspeaker`: no es compatible directamente con pipelines de Hugging Face basados en `transformers` ni con `AutoFeatureExtractor`.
- Sin soporte documentado de cuantización ni de despliegue en runtimes de inferencia estándar (ONNX, TensorRT, llama.cpp).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/univ_conformer_small_pfas
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
