# wq2012/univ_conformer_tiny_ge2e

## Resumen

`univ_conformer_tiny_ge2e` es un modelo de extraccion de embeddings de locutor (speaker embeddings) desarrollado por el usuario wq2012 dentro del proyecto FlaxSpeaker, una reimplementacion desde cero en JAX/Flax de algoritmos de reconocimiento de locutor publicados en la literatura (GE2E, Dr-Vectors, ATP y PFAS). El modelo no genera texto: su funcion es convertir fragmentos de audio de voz en vectores de 128 dimensiones que permiten comparar si dos grabaciones pertenecen al mismo hablante mediante similitud coseno.

Se trata de un checkpoint de backbone Conformer en variante "tiny", con solo 693.126 parametros de inferencia (encoder mas cabeza de scoring), entrenado sobre un corpus controlado de 381 hablantes y 9.447 utterances combinando LibriSpeech, CN-Celeb2 y VoxCeleb1. Es, por tanto, un modelo de benchmarking a pequena escala, no un sistema de produccion entrenado sobre corpus masivos como VoxCeleb2-dev.

Su relevancia actual es metodologica: sirve como referencia reproducible y ligera para comparar variantes de arquitectura, pooling y funciones de perdida dentro del ecosistema FlaxSpeaker, y demuestra que es posible implementar en JAX/Flax un pipeline completo de speaker verification a partir unicamente de papers publicados. El autor advierte explicitamente de que no es un producto oficial de Google y de que sus resultados absolutos estan acotados por la diversidad de hablantes del corpus de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (variante `tiny`) con pooling temporal atento (ATP) |
| Parametros totales | 693.126 (encoder + cabeza de scoring; excluye pesos del clasificador de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa recortes de audio de 90 a 180 frames) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado con LibriSpeech en ingles, CN-Celeb2 en chino y VoxCeleb1 multilingue; no se documenta cobertura formal) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y Flax Msgpack (`flax_model.msgpack`) |
| Dimension del embedding de salida | 128 |
| Funcion de perdida | GE2E softmax (Wan et al. 2018, Eq. 6, centroides leave-one-out exactos) |
| Scorer de verificacion | Similitud coseno |
| Frontend de audio | Mel log-natural de 80 dimensiones a 16 kHz + VAD por energia a nivel de frame + CMVN (`flaxspeaker.AudioFrontend`, no es un `AutoFeatureExtractor` de Hugging Face) |
| Libreria | `flaxspeaker >= 0.5.0` |
| Pipeline | feature-extraction |
| Datos de entrenamiento | LibriSpeech + CN-Celeb2 + VoxCeleb1 (381 hablantes, 9.447 utterances, 3 dominios) |
| Presupuesto de entrenamiento | 4.600 pasos, batches de 32 utterances (8 hablantes x 4), ~15,58 epocas, semilla 42 |
| Descargas en Hugging Face | 113 |
| Fecha de creacion | 2026-10-15 |

## Arquitectura y entrenamiento

El modelo emplea un backbone Conformer en configuracion `tiny`, es decir, un transformer convolucional pensado para secuencias de audio, sobre el que se aplica un pooling temporal atento (ATP, repurposed de un paper de identificacion de idioma) para agregar la informacion a lo largo del tiempo en un unico vector de 128 dimensiones. La cabeza de entrenamiento es GE2E softmax con centroides leave-one-out exactos, y la verificacion en inferencia se realiza por similitud coseno entre embeddings. El frontend no es el habitual de Hugging Face: se calcula un Mel log-natural de 80 dimensiones a 16 kHz con VAD por energia y normalizacion CMVN, lo que obliga a usar la libreria `flaxspeaker` para preprocesar el audio correctamente.

El entrenamiento se realizo sobre un pool controlado de tres dominios (LibriSpeech, CN-Celeb2 y VoxCeleb1) con 381 hablantes y 9.447 utterances, usando recortes de longitud variable U(90, 180) frames con mascara de validez exacta. Se ejecutaron 4.600 pasos de gradiente con batches de 32 utterances (8 hablantes x 4 utterances), lo que equivale a unas 15,58 epocas, con 460 pasos de warmup y una semilla fija (42). El autor documenta que el EER agrupado universal evoluciono de 25,04 % (1 utterance) y 21,43 % (3 utterances) en el paso 400 a 16,93 % y 13,03 % respectivamente en el paso 4.600, alcanzando una meseta de convergencia en este corpus pequeno. La desviacion estandar entre semillas 0-2 del EER agrupado a 1 utterance es de 0,08-0,41 % absoluto, y el intervalo de confianza bootstrap al 95 % con 8.000 ensayos tiene una semianchura de ~0,8 %.

## Capacidades

- Extraccion de embeddings de locutor de 128 dimensiones a partir de audio de voz.
- Verificacion de locutor (speaker verification) mediante similitud coseno entre embeddings.
- Reconocimiento de locutor (speaker recognition) en escenarios de comparacion 1:1 y posible uso en 1:N con un indice vectorial externo.
- Procesamiento multi-dominio: entrenado con datos en ingles (LibriSpeech), chino (CN-Celeb2) y multilingue (VoxCeleb1), lo que le da cierta robustez ante variacion de idioma y canal.
- Manejo de recortes de audio de longitud variable gracias al pooling atento ATP.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni agentes: es exclusivamente un extractor de features de audio.
- No dispone de modo "thinking" ni capacidades multimodales mas alla del audio.

## Casos de uso

- Verificacion de identidad por voz en aplicaciones de autenticacion: el modelo genera un embedding de 128 dimensiones de la frase de enrolment y otro de la frase de prueba, y se compara con similitud coseno; es adecuado para prototipos y pruebas de concepto por su tamano minimo (693.126 parametros) y su licencia Apache 2.0.
- Benchmarking de arquitecturas de speaker recognition: al ser un checkpoint de referencia dentro de FlaxSpeaker, permite comparar variantes de backbone (Conformer tiny vs otras), pooling (ATP vs otras estrategias) y perdidas (GE2E softmax vs Dr-Vectors vs PFAS) bajo un protocolo comun y reproducible.
- Investigacion en JAX/Flax: sirve como ejemplo funcional de pipeline completo de audio (frontend Mel + VAD + CMVN, encoder Conformer, pooling, cabeza GE2E) implementado integramente en el ecosistema Flax, util para docencia y para validar reimplementaciones.
- Segmentacion y diarizacion de hablantes en prototipos: los embeddings pueden alimentar un clustering (por ejemplo, k-means o agglomerative) para separar voces en una grabacion multi-locutor, aunque el modelo no realiza diarizacion de forma nativa.
- Deteccion de cambio de locutor en flujos de audio: comparando embeddings de ventanas consecutivas con un umbral de similitud coseno se pueden detectar transiciones de hablante en grabaciones de reuniones o llamadas.
- Filtrado y curaduria de datasets de voz: calcular embeddings de todo un corpus y agrupar por similitud permite detectar duplicados, hablantes mal etiquetados o desbalance de locutores antes de entrenar otros modelos.
- Educacion y experimentacion con presupuesto de computo minimo: al entrenar en CPU y tener menos de un millon de parametros, es viable reproducir el entrenamiento completo en una estacion de trabajo para fines didacticos.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las metricas de evaluacion del propio checkpoint sobre el corpus multi-dominio de 381 hablantes, no comparables directamente con benchmarks industriales como VoxCeleb1-O completo.

| Metrica | Paso 400 | Paso 4000 (rodilla) | Paso 4600 (final) |
|---|---|---|---|
| EER agrupado universal, 1 utterance | 25,04 % | 17,34 % | 16,93 % |
| EER agrupado universal, 3 utterances | 21,43 % | 13,07 % | 13,03 % |

El autor reporta ademas metricas de minDCF y ROC-AUC en `eval_results.json`, asi como una evaluacion sobre un subconjunto de 10 hablantes de VoxCeleb1-O, pero los valores concretos no se detallan en la informacion proporcionada. Como referencia contextual citada por el autor (no resultados de este modelo): sistemas ECAPA-TDNN entrenados en VoxCeleb2-dev alcanzan ~0,9 % EER en VoxCeleb1-O completo, y sistemas de menos de 1M de parametros ~2 % (EfficientTDNN, Wang et al. 2022). El checkpoint aqui descrito esta entrenado sobre 381 hablantes, no sobre los 5.994 hablantes y ~1,1M utterances de VoxCeleb2-dev, por lo que sus EER absolutos no son comparables con esos sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en fp32, dado que el modelo tiene 693.126 parametros (~2,8 MB de pesos) mas el coste de activaciones del frontend y del encoder Conformer tiny.
- GPU recomendadas: cualquier GPU consumer moderna es sobrada; el modelo esta pensado para ejecutarse incluso en CPU. Una RTX 4090, A100 o H100 no aportan ventaja significativa frente a una GPU de gama media o una CPU para inferencia individual.
- Cabe en cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) e incluso en dispositivos de borde y Raspberry Pi para inferencia por lotes pequenos.
- Opciones de despliegue: la libreria oficial `flaxspeaker` (JAX/Flax) es la via soportada; los pesos estan en safetensors y Msgpack, pero no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; el autor indica que el entrenamiento se ejecuto en una estacion de trabajo CPU, lo que sugiere que la inferencia es viable en CPU, pero no se publican cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | EER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `univ_conformer_tiny_ge2e` (este) | 693.126 | Recortes de 90-180 frames, audio 16 kHz | 16,93 % (1-utt) / 13,03 % (3-utt) en corpus propio de 381 hablantes | Apache 2.0 | Hugging Face + PyPI (`flaxspeaker`) |
| ECAPA-TDNN (Desplanques et al., 2020) | ~20M (tipico) | Audio 16 kHz, ventanas de varios segundos | ~0,9 % en VoxCeleb1-O completo | Codigo y pesos con licencias variables segun implementacion | Multiples implementaciones (SpeechBrain, etc.) |
| EfficientTDNN (Wang et al., 2022) | <1M | Audio 16 kHz | ~2 % en VoxCeleb1-O completo | Segun implementacion | Publicaciones academicas |
| Otros checkpoints FlaxSpeaker (p. ej. variantes Dr-Vectors, PFAS) | Variable (mismo orden de magnitud) | Mismo frontend y protocolo | Comparables dentro del benchmark FlaxSpeaker | Apache 2.0 | Coleccion FlaxSpeaker en Hugging Face |

La comparacion directa con ECAPA-TDNN y EfficientTDNN no es valida en terminos absolutos porque estos se entrenan sobre VoxCeleb2-dev (miles de hablantes), mientras que este checkpoint se entrena sobre 381 hablantes. La comparacion relevante es dentro de la propia coleccion FlaxSpeaker, donde comparte protocolo, frontend y presupuesto de evaluacion.

## Limitaciones y advertencias

- No es un producto oficial de Google; es una reimplementacion independiente en JAX/Flax basada solo en papers publicados.
- Es un checkpoint de benchmarking a pequena escala: 381 hablantes y 9.447 utterances, muy por debajo de los corpus industriales (VoxCeleb2-dev tiene 5.994 hablantes y ~1,1M utterances). Los EER absolutos estan acotados por esta diversidad limitada y no deben interpretarse como estado del arte.
- El EER de ~17 % a 1 utterance en su propio corpus es alto en terminos absolutos; el modelo no es adecuado para autenticacion biometrica en produccion sin un estudio adicional y entrenamiento sobre corpus mayor.
- Riesgo de sesgo por composicion del corpus: predominio de ingles y chino, con posible infrarrepresentacion de otros idiomas, acentos, edades, generos y condiciones acusticas.
- El frontend no es un `AutoFeatureExtractor` de Hugging Face; usar el modelo con `transformers` directamente producira resultados incorrectos. Es obligatorio usar `flaxspeaker >= 0.5.0` para el preprocesado (Mel 80 dims, VAD por energia, CMVN).
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y desaconseja explicitamente presentar el modelo como sistema de produccion o como reproduccion a gran escala de los resultados de los papers originales.
- No se documentan capacidades multilingues formales ni cobertura de idiomas; la etiqueta de idiomas en Hugging Face figura como no disponible.
- No hay informacion sobre cuantizaciones soportadas ni sobre despliegue en runtimes distintos de JAX/Flax, lo que limita su integracion en stacks de inferencia convencionales.
- El modelo solo produce embeddings; cualquier logica de umbral, enrolamiento, indexado o decision 1:N debe implementarse externamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/univ_conformer_tiny_ge2e
- Coleccion FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP (Attentive Temporal Pooling): https://arxiv.org/abs/2202.12163
- Paper PFAS (Parameter-Free Attentive Scoring): https://arxiv.org/abs/2203.05642
