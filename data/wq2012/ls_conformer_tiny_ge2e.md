# wq2012/ls_conformer_tiny_ge2e

## Resumen

`ls_conformer_tiny_ge2e` es un modelo de verificación e identificación de locutor (speaker verification) publicado por el usuario wq2012 dentro del proyecto FlaxSpeaker. No es un modelo de lenguaje: se trata de un codificador acústico que convierte una utterance de audio en un embedding de locutor de 128 dimensiones, sobre el que se calcula una similitud coseno para decidir si dos grabaciones pertenecen a la misma persona. La arquitectura es un Conformer en su variante `tiny`, con pooling temporal atento (ATP) y entrenamiento mediante la pérdida GE2E con softmax.

El modelo es una reproducción limpia (clean-room) en JAX/Flax de algoritmos publicados por Google en cuatro artículos: GE2E (arXiv:1710.10467), Dr-Vectors (arXiv:2104.01989), Conformer-ATP (arXiv:2202.12163) y PFAS (arXiv:2203.05642). El autor advierte explícitamente de que no es un producto oficial de Google y de que los experimentos originales se realizaron con infraestructura y datos internos de Google, por lo que los resultados de esta reproducción no son directamente comparables con los de los papers.

Su relevancia práctica está en dos factores: el tamaño extremadamente reducido (693.124 parámetros en el checkpoint safetensors, unos 2,8 MB en fp32) y la licencia Apache-2.0, que permite uso comercial. El modelo se distribuye junto con la librería `flaxspeaker` (también en PyPI) y con un `eval_results.json` que documenta métricas verificadas de EER, minDCF y ROC-AUC en tres dominios de evaluación. Está entrenado únicamente en LibriSpeech, por lo que su rendimiento se degrada de forma notable fuera de ese dominio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer variante `tiny` con pooling temporal atento (ATP) |
| Parametros totales | 693.124 (safetensors); la model card indica 693.126 parámetros de encoder |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; modelo de audio, sin ventana de contexto de texto |
| Tipos de cuantizacion | no disponible (se distribuye en precisión nativa, safetensors y msgpack) |
| Idiomas soportados | no disponibles; entrenado en LibriSpeech (inglés leído) y evaluado además en CN-Celeb2 (chino) y VoxCeleb1 |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y Flax msgpack (`flax_model.msgpack`) |
| Tarea (pipeline) | audio-classification |
| Libreria | flaxspeaker (JAX/Flax) |
| Dimension del embedding | 128 |
| Pooling temporal | ATP (attentive temporal pooling) |
| Perdida de entrenamiento | ge2e_softmax |
| Puntuacion de verificacion | similitud coseno |
| Frontend de audio | log-mel de 80 dimensiones a 16.000 Hz + VAD de energia + CMVN |
| Dominio de entrenamiento | librispeech |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

El backbone es un Conformer, es decir, un codificador que combina bloques de autoatención con convoluciones, en su configuración `tiny`. Sobre la secuencia de representaciones acústicas se aplica un pooling temporal atento (ATP), un mecanismo de agregación que pondera los frames según su relevancia en lugar de promediarlos uniformemente. La salida es un vector de 128 dimensiones que actúa como embedding de locutor. La verificación se realiza por similitud coseno entre embeddings, sin necesidad de una cabeza clasificadora específica.

El entrenamiento utiliza la pérdida GE2E con softmax, la formulación de *Generalized End-to-End Loss* que optimiza directamente la separabilidad entre embeddings de distintos locutores dentro de un batch. La model card indica que el dominio de entrenamiento es `librispeech` y que se usaron los datasets `librispeech_asr`, `cnceleb` y `voxceleb` (los dos últimos, según la información disponible, aparecen como datasets de evaluación). No se especifica en la información proporcionada el número de tokens o de horas de audio empleadas, la composición exacta del dataset, ni si hubo etapas de ajuste fino con RLHF o DPO (no aplicables en un modelo de este tipo).

Como innovaciones técnicas destacables, el modelo incorpora el frontend compatible con `WhisperFeatureExtractor` (log-mel de 80 dimensiones a 16 kHz con VAD de energía y normalización CMVN), el pooling ATP procedente del trabajo sobre Conformer-ATP, y la posibilidad de usar puntuación coseno o esquemas alternativos descritos en PFAS. La model card subraya que se trata de una reproducción independiente y que los experimentos originales se hicieron con datos internos de Google, no con los splits públicos empleados aquí.

## Capacidades

- Extracción de embeddings de locutor de 128 dimensiones a partir de una utterance de audio.
- Verificación de locutor 1:1 mediante puntuación de similitud coseno (`model.verify(enroll, test)`).
- Verificación con múltiples utterances de enrolamiento: la evaluación a 3 utterances reduce el EER de forma consistente (por ejemplo, de 10,53% a 6,20% en LibriSpeech).
- Clasificación de audio (pipeline declarado `audio-classification`), orientada a tareas de reconocimiento de hablante.
- Frontend de audio integrado: log-mel de 80 dimensiones a 16 kHz, VAD de energía y CMVN.
- Uso mediante API de Python (`flaxspeaker.load_pretrained`) y mediante script de línea de comandos (`scripts/inference.py`).
- No genera texto: carece de capacidades de generación, razonamiento, código o matemáticas.
- No dispone de tool calling ni de function calling.
- No soporta flujos de agentes ni razonamiento multi-paso.
- No es multimodal: solo procesa audio; no hay visión, vídeo ni audio generativo.
- No dispone de modo de razonamiento explícito (thinking mode).
- El soporte multilingüe no está declarado; el rendimiento fuera del inglés leído es sustancialmente peor.

## Casos de uso

- Autenticación biométrica por voz en dispositivos con recursos muy limitados: con 693.124 parámetros y alrededor de 2,8 MB de pesos en fp32, el modelo puede ejecutarse en CPU o en microcontroladores con pocos megabytes de memoria, algo inviable para modelos de verificación de mayor tamaño.
- Diarización y agrupación de hablantes en transcripciones: los embeddings de 128 dimensiones son adecuados para clustering (por ejemplo, K-means o agglomerative) y permiten segmentar quién habla en cada tramo de una reunión o llamada, usando el VAD de energía del frontend para trocear el audio.
- Control de acceso físico o lógico (desbloqueo por voz de un dispositivo o una aplicación interna): la verificación 1:1 por similitud coseno es suficiente cuando el umbral se calibra sobre el dominio objetivo y el EER exigido no es extremadamente bajo.
- Deduplicación y control de fugas de datos en corpus de audio: antes de construir splits de entrenamiento y test, el modelo permite detectar si un mismo locutor aparece en ambos conjuntos, un problema habitual en datasets recolectados de internet.
- Prefiltrado en pipelines de atención al cliente: etiquetar y agrupar llamadas por locutor para enrutarlas al agente correcto o para auditar conversaciones, asumiendo una tasa de error considerable fuera del dominio de lectura.
- Investigación reproducible en reconocimiento de locutor: al ser una implementación abierta en JAX/Flax con licencia Apache-2.0, sirve como baseline barato para comparar funciones de pérdida (GE2E softmax), estrategias de pooling (ATP) y esquemas de puntuación (coseno, PFAS) sin depender de checkpoints propietarios.
- Prototipado rápido de productos de voz personalizados: identificación del usuario para adaptar respuestas en asistentes domésticos o aplicaciones de accesibilidad, con el modelo como primera capa antes de un sistema más costoso.
- Extracción de características para modelos posteriores: los embeddings de 128 dimensiones pueden alimentar clasificadores ligeros (regresión logística, SVM) para tareas derivadas como estimación de género, estado emocional o estilo de habla, siempre que se entrene la cabeza correspondiente.

## Benchmarks y rendimiento

Resultados de verificación a 1 utterance, tal como figuran en la model card (métricas EER, minDCF y ROC-AUC sobre el conjunto de evaluación indicado):

| Split de evaluacion | Trials | EER (%) | IC 95% bootstrap (%) | minDCF@0,01 | minDCF@0,10 | ROC-AUC |
|---|---|---|---|---|---|---|
| LibriSpeech (inglés leído) | 3.000 | 10,53 | [9,40; 11,53] | 0,7720 | 0,4893 | 0,9608 |
| CN-Celeb2 (chino multigénero) | 3.000 | 30,00 | [28,65; 31,87] | 0,9993 | 0,9547 | 0,7787 |
| VoxCeleb1 (celebridades in-the-wild) | 2.000 | 25,70 | [23,90; 27,48] | 0,9380 | 0,8950 | 0,8282 |
| Universal agrupado (3 dominios) | 8.000 | 21,91 | [21,05; 22,81] | 0,9968 | 0,8525 | 0,8711 |
| Media macro universal (3 dominios) | 8.000 | 22,08 | — | 0,9031 | 0,7797 | 0,8559 |

Resultados de verificación con 3 utterances de enrolamiento:

| Split de evaluacion | Trials | EER 3-utt (%) | IC 95% bootstrap (%) | minDCF@0,01 | ROC-AUC |
|---|---|---|---|---|---|
| LibriSpeech (3-utt) | 1.000 | 6,20 | [4,80; 7,95] | 0,4880 | 0,9845 |
| CN-Celeb2 (3-utt) | 1.000 | 25,80 | [23,20; 28,80] | 0,8960 | 0,8256 |
| VoxCeleb1 (3-utt) | 1.000 | 21,60 | [19,00; 23,91] | 0,9100 | 0,8708 |
| Universal agrupado (3-utt) | 3.000 | 18,07 | [16,50; 19,33] | 0,8647 | 0,9049 |
| Media macro universal (3-utt) | 3.000 | 17,87 | — | 0,7647 | 0,8936 |

No se han publicado en la información disponible resultados de benchmarks de texto (MMLU, HumanEval, GSM8K u otros), ya que el modelo no es un modelo de lenguaje. Tampoco se proporcionan comparaciones numéricas con otros sistemas de verificación de locutor.

## Requisitos de hardware

- Pesos del modelo: 693.124 parámetros, aproximadamente 2,8 MB en fp32 y 1,4 MB en fp16 (cálculo derivado del número de parámetros; no indicado explícitamente en la model card).
- VRAM estimada para inferencia: inferior a 1 GB en la práctica, dominada por el runtime de JAX/Flax y los buffers de audio más que por los pesos. No hay una cifra oficial publicada.
- GPU recomendadas: no requiere GPU. Cualquier GPU NVIDIA (T4, RTX 3060, RTX 4090, A100, H100) es más que suficiente; el cuello de botella real es la extracción del frontend mel y la lectura de audio.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo e incluso en CPU, y es plausible su ejecución en dispositivos embebidos.
- Opciones de despliegue: API de Python de `flaxspeaker` (`load_pretrained`, `extract_embedding`, `verify`) y script `scripts/inference.py` de línea de comandos. El frontend es compatible con `WhisperFeatureExtractor`.
- Formatos de despliegue alternativos: no se documenta soporte para GGUF, llama.cpp, Ollama, vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han publicado en la información disponible datos comparativos de rendimiento frente a otras alternativas, por lo que la comparación se limita a características arquitectónicas y de disponibilidad. Los valores marcados como "no disponible" no pueden verificarse con los datos proporcionados.

| Modelo | Enfoque | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wq2012/ls_conformer_tiny_ge2e` | Conformer tiny + ATP + pérdida GE2E, embedding de 128 dims | 693.124 | Audio log-mel 80 dims a 16 kHz; sin ventana de contexto de texto | Apache-2.0 | HuggingFace, GitHub, PyPI |
| ECAPA-TDNN (familia citada habitualmente como referencia en verificación de locutor) | TDNN con pooling estadístico atento | no disponible | Audio | no disponible | disponible en distintos repositorios y frameworks |
| Modelos basados en WavLM para verificación de locutor | Transformer preentrenado con pérdida de enmascaramiento, ajustado para hablante | no disponible | Audio | no disponible | disponibles en HuggingFace para algunas variantes |
| Sistemas x-vector clásicos | TDNN con pooling estadístico | no disponible | Audio | no disponible | implementaciones diversas |

## Limitaciones y advertencias

- Degradación fuerte fuera de dominio: el EER sube del 10,53% en LibriSpeech al 30,00% en CN-Celeb2 y al 25,70% en VoxCeleb1. Para producción, el umbral debe recalibrarse con datos del dominio real.
- Entrenamiento limitado a LibriSpeech: es audio de lectura en inglés, condiciones relativamente limpias. No hay evidencia en la información disponible de entrenamiento con audio telefónico, ruidoso o espontáneo.
- Riesgo de falsos positivos y falsos negativos: en autenticación biométrica, un EER del 10% o superior implica una tasa de error relevante; no es adecuado como único factor de autenticación en escenarios de seguridad alta.
- Idiomas no declarados: la ficha no especifica una lista de idiomas soportados, y el rendimiento observado en chino (CN-Celeb2) es notablemente peor que en inglés.
- No es un modelo de lenguaje: no genera texto, no razona, no ejecuta herramientas ni agentes. Cualquier expectativa de ese tipo es un error de uso.
- Sesgos potenciales: el rendimiento puede variar según acento, género, edad, canal de grabación y calidad del micrófono. La información proporcionada no incluye un análisis desagregado por subgrupos, por lo que este punto queda sin cuantificar.
- Advertencia del autor sobre reproducibilidad: los papers originales se evaluaron con infraestructura y datos internos de Google, de modo que los resultados de esta reproducción no son directamente comparables con los publicados en dichos artículos.
- Riesgo de alucinación: no aplicable en el sentido de generación de texto, pero sí existe el riesgo análogo de asignar una identidad incorrecta a un hablante.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución con las obligaciones habituales de atribución y conservación del aviso de licencia. El autor declara explícitamente que no es un producto soportado oficialmente por Google.
- Madurez del proyecto: 0 descargas y 0 likes en el momento de redactar esta ficha, con el repositorio creado y actualizado el 15 de octubre de 2026. Es un artefacto de investigación reciente, sin un historial amplio de uso en producción.
- Sin cifras publicadas de latencia, throughput ni consumo de memoria en inferencia.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos versaban sobre la constante de los gases ideales y no guardan relación con el modelo).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wq2012/ls_conformer_tiny_ge2e
- Colección FlaxSpeaker en HuggingFace: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub de FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete en PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E, *Generalized End-to-End Loss for Speaker Verification*: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors, *Decision Residual Networks and an Improved Loss for Speaker Recognition*: https://arxiv.org/abs/2104.01989
- Paper Conformer-ATP, *Attentive Temporal Pooling for Conformer-based Streaming Language Identification in Long-form Speech*: https://arxiv.org/abs/2202.12163
- Paper PFAS, *Parameter-Free Attentive Scoring for Speaker Verification*: https://arxiv.org/abs/2203.05642
