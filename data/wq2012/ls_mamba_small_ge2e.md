# wq2012/ls_mamba_small_ge2e

## Resumen

El modelo `ls_mamba_small_ge2e` es un extractor de embeddings de voz para verificación y reconocimiento de hablante, publicado por el usuario wq2012 dentro de la biblioteca open source FlaxSpeaker. Se trata de una reproducción independiente en JAX/Flax de los algoritmos GE2E, Dr-Vectors, Conformer-ATP y PFAS descritos en la literatura académica, pero entrenada sobre corpus públicos (LibriSpeech, CN-Celeb y VoxCeleb) en lugar de los datos internos propietarios que emplearon los trabajos originales de Google.

El modelo combina un backbone Mamba de tipo "small" (modelo de espacio de estados selectivo, S6) con una capa de temporal pooling atencional (ASP) y una función de pérdida GE2E softmax con puntuación por similitud coseno. El resultado es un vector de embedding de hablante de 192 dimensiones, con un total de 1.028.672 parámetros en el codificador. Su tamaño es extremadamente reducido (en torno a 4 MB en fp32), lo que lo convierte en una opción ligera para tareas de verificación biométrica de voz con recursos limitados.

La relevancia actual de este checkpoint radica en que permite reproducir pipelines de speaker verification sobre arquitecturas de espacio de estados (Mamba) alternativas a los transformers, con la ventaja de una complejidad computacional lineal respecto a la longitud de la secuencia. El modelo incluye métricas de evaluación verificadas sobre tres dominios distintos (LibriSpeech en inglés, CN-Celeb2 en chino y VoxCeleb1 en condiciones no controladas), lo que permite valorar su comportamiento en escenarios cross-domain.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone Mamba (SSM selectivo S6, tamano "small") + temporal pooling ASP |
| Parametros totales | 1.028.672 (codificador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa utterances completas con deteccion de actividad de voz, VAD) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre LibriSpeech; evaluado ademas en chino con CN-Celeb2) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y flax msgpack |

## Arquitectura y entrenamiento

El modelo emplea un backbone Mamba, arquitectura basada en modelos de espacio de estados selectivos (S6) que evita el mecanismo de atencion y ofrece complejidad lineal respecto a la longitud de la secuencia. Sobre las representaciones temporales extraidas se aplica una capa de pooling atencional (ASP, attentive statistical pooling) que agrega la secuencia en un unico vector de embedding de 192 dimensiones. La verificacion se realiza mediante similitud coseno entre embeddings, y el entrenamiento utiliza la funcion de perdida GE2E softmax, orientada a optimizar directamente la separabilidad entre hablantes.

El frontend de audio esta compuesto por caracteristicas log-mel de 80 dimensiones muestreadas a 16 kHz, con deteccion de actividad de voz basada en energia (Energy VAD) y normalizacion CMVN. Se trata de un frontend compatible con el `WhisperFeatureExtractor` de Hugging Face. Los datasets declarados en la ficha son LibriSpeech, CN-Celeb y VoxCeleb, aunque el dominio de entrenamiento especificado explicitamente es LibriSpeech. No se documentan en la model card el numero de tokens/segmentos exactos de entrenamiento, la composicion precisa del dataset final ni si se aplico RLHF o DPO (tecnicas no habituales en este tipo de modelos).

## Capacidades

- Extraccion de embeddings de hablante de 192 dimensiones a partir de un fichero de audio.
- Verificacion de hablante (speaker verification) mediante puntuacion por similitud coseno entre dos utterances.
- Reconocimiento de hablante (speaker recognition) mediante comparacion contra un pool de embeddings enrollados.
- Soporte de multi-enrollment: verifica con varias utterances de referencia (se reportan resultados con 3-utterance enrollment).
- Clasificacion de audio orientada a identidad de hablante (pipeline `audio-classification`).
- No soporta generacion de texto, tool calling ni razonamiento multi-paso, ya que no es un modelo de lenguaje.
- No incluye capacidades de vision, audio generativo ni thinking mode.
- El soporte multilingue no esta explicitamente declarado; las evaluaciones cubren ingles (LibriSpeech) y chino (CN-Celeb2).

## Casos de uso

- Verificacion biometrica de voz en control de acceso: el modelo permite comparar un embedding de referencia con uno entrante mediante similitud coseno, con un EER del 7,90 % en LibriSpeech cuando se emplean 3 utterances de enrollment, adecuado para autenticacion con margen de mejora.
- Enrolamiento de usuario en asistentes de voz: con un vector de 192 dimensiones por usuario, el coste de almacenamiento y comparacion es minimo, lo que facilita desplegar personalizacion en dispositivos con recursos limitados.
- Diarizacion y segmentacion de hablante: integrado en pipelines de transcripcion para asignar cada segmento a un hablante usando clustering sobre los embeddings generados.
- Deteccion de fraude y suplantacion de identidad en centros de soporte: evaluar si la voz entrante coincide con el patron enrollado del cliente antes de conceder operaciones sensibles.
- Analisis forense de audio: comparar muestras de grabaciones con bases de datos de referencia para tareas de identificacion judicial, asumiendo limitaciones en dominios no vistos.
- Filtrado y organizacion de archivos de audio: agrupar automaticamente grabaciones por hablante en repositorios de podcasts, entrevistas o reuniones.
- Investigacion reproducible en speaker verification: servir como baseline ligero y de codigo abierto para comparar arquitecturas Mamba frente a alternativas tipo x-vector o ECAPA-TDNN sobre los mismos corpus publicos.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card, para verificacion con 1 utterance:

| Split de evaluacion | Trials | EER (%) | IC 95 % (%) | minDCF@0.01 | minDCF@0.10 | ROC-AUC |
|---|---|---|---|---|---|---|
| LibriSpeech (ingles leido) | 3.000 | 12,17 | [10,92, 13,27] | 0,9080 | 0,5653 | 0,9495 |
| CN-Celeb2 (chino multigenero) | 3.000 | 29,13 | [27,38, 30,77] | 0,9760 | 0,8807 | 0,7892 |
| VoxCeleb1 (condiciones no controladas) | 2.000 | 21,05 | [19,25, 22,90] | 0,8780 | 0,8540 | 0,8749 |
| Universal Pooled (3 dominios) | 8.000 | 21,30 | [20,40, 22,10] | 0,9523 | 0,7735 | 0,8768 |
| Universal Macro-Average | 8.000 | 20,78 | no disponible | 0,9207 | 0,7667 | 0,8712 |

Resultados con enrollment de 3 utterances:

| Split de evaluacion | Trials | 3-Utt EER (%) | IC 95 % (%) | minDCF@0.01 | ROC-AUC |
|---|---|---|---|---|---|
| LibriSpeech (3-Utt) | 1.000 | 7,90 | [6,30, 10,00] | 0,6500 | 0,9758 |
| CN-Celeb2 (3-Utt) | 1.000 | 23,30 | [20,80, 26,05] | 0,8920 | 0,8528 |
| VoxCeleb1 (3-Utt) | 1.000 | 16,10 | [13,95, 19,05] | 0,9060 | 0,9178 |
| Universal Pooled (3-Utt) | 3.000 | 17,10 | [15,53, 18,37] | 0,9047 | 0,9215 |
| Universal Macro-Average (3-Utt) | 3.000 | 15,77 | no disponible | 0,8160 | 0,9155 |

No se han publicado en la informacion disponible comparaciones directas contra modelos concretos de terceros (tipo ECAPA-TDNN o x-vector) bajo los mismos protocolos.

## Requisitos de hardware

- Con 1.028.672 parametros, el modelo ocupa aproximadamente 4,1 MB en fp32 y 2,1 MB en fp16; es despreciable en terminos de memoria.
- Inferencia viable en CPU sin GPU dedicada; tambien en GPUs de gama baja (GTX 1050, GTX 1650) y en cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100).
- Cabe en cualquier GPU de consumo, e incluso en dispositivos embebidos (Raspberry Pi, moviles) si se dispone de un runtime de JAX o una exportacion a otro formato.
- Opciones de despliegue: la libreria oficial es FlaxSpeaker (JAX/Flax) con carga desde Hugging Face Hub, e inferencia por linea de comandos via `scripts/inference.py`. No se documenta soporte directo en vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al estar basado en Mamba, el coste computacional escala de forma lineal con la longitud de la secuencia, lo que favorece el procesamiento de audios largos.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de benchmark comparables con otros modelos de speaker verification (ECAPA-TDNN, x-vector, WavLM-based, etc.) bajo los mismos protocolos. Por categoria, los modelos alternativos habituales serian:

| Modelo | Arquitectura | Contexto/embedding | Licencia | Estado |
|---|---|---|---|---|
| wq2012/ls_mamba_small_ge2e | Mamba small + ASP | 192-dim embedding | Apache 2.0 | Disponible |
| ECAPA-TDNN (variantes publicas) | CNN + TDNN + atencion | 192-dim tipico | variable | no disponible en esta busqueda |
| x-vector (variantes publicas) | TDNN | 512-dim tipico | variable | no disponible en esta busqueda |
| WavLM-based SV | Transformer | variable | MIT tipico | no disponible en esta busqueda |

La comparacion cuantitativa no se puede establecer con la informacion disponible.

## Limitaciones y advertencias

- El modelo no es un producto oficial de Google. Es una reproduccion independiente de algoritmos publicados, y los resultados originales de los papers no se obtuvieron con esta implementacion ni con estos corpus.
- El EER en dominios fuera de LibriSpeech es notablemente alto: 29,13 % en CN-Celeb2 y 21,05 % en VoxCeleb1 con 1 utterance, lo que indica limitada generalizacion cross-domain.
- Riesgo de degradacion en audio con ruido, reverberacion o canales telefonicos no representados en el entrenamiento (dominio principal: LibriSpeech, audio leido limpio).
- No se declaran sesgos demograficos especificos, pero al entrenarse sobre corpus con distribucion propia de LibriSpeech, CN-Celeb y VoxCeleb, puede presentar sesgos por acento, edad, genero o idioma no documentados.
- No esta pensado para generacion de texto ni para tareas conversacionales; cualquier uso fuera de speaker verification / classification esta fuera de su ambito.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece ninguna garantia de exactitud ni soporte.
- El frontend depende de Energy VAD y CMVN; audios con silencios largos o niveles de energia anomales pueden producir embeddings menos fiables.
- No se han publicado cuantizaciones oficiales, por lo que el uso en produccion requerira validar metricas tras cualquier conversion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/ls_mamba_small_ge2e
- Coleccion FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI flaxspeaker: https://pypi.org/project/flaxspeaker/
- Paper GE2E (arXiv:1710.10467): https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors (arXiv:2104.01989): https://arxiv.org/abs/2104.01989
- Paper Conformer-ATP (arXiv:2202.12163): https://arxiv.org/abs/2202.12163
- Paper PFAS (arXiv:2203.05642): https://arxiv.org/abs/2203.05642
- Referencia general sobre la arquitectura Mamba: https://en.wikipedia.org/wiki/Mamba_(deep_learning_architecture)
