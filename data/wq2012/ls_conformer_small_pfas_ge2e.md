# wq2012/ls_conformer_small_pfas_ge2e

## Resumen

`ls_conformer_small_pfas_ge2e` es un modelo de extracción de embeddings de locutor (speaker verification y speaker recognition) desarrollado por el usuario `wq2012` como parte de la biblioteca FlaxSpeaker, una reimplementación desde cero en JAX/Flax de los algoritmos GE2E, Dr-Vectors, ATP y PFAS descritos en sus papers originales. El modelo no es un producto oficial de Google: se trata de un checkpoint de referencia para comparaciones controladas dentro del benchmark FlaxSpeaker, entrenado exclusivamente sobre LibriSpeech (232 locutores, 5.788 enunciados).

Arquitectónicamente combina un backbone Conformer de tamaño "small" con pooling temporal PFAS (Parameter-Free Attentive Scoring) y un objetivo de entrenamiento GE2E softmax sobre una matriz split-batch par/impar. El resultado es un vector de embedding de 640 dimensiones por utterance, pensado para tareas de verificación e identificación de locutor, no para generación de texto ni para inferencia generativa.

Su relevancia es doble: por un lado, ofrece una implementación abierta y reproducible en JAX/Flax de técnicas de speaker verification que normalmente solo están disponibles en implementaciones propietarias o en PyTorch; por otro, su tamaño reducido (2.162.187 parámetros de inferencia, ~0.1 GB) lo hace útil como referencia educativa y como baseline ligero para experimentos de comparación relativa, siempre teniendo en cuenta que sus cifras absolutas de EER están limitadas por la escasez de locutores en el corpus de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (variante small) con pooling temporal PFAS |
| Parametros totales | 2.162.187 (encoder + cabeza de scoring; excluye pesos del clasificador de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa crops de 90-180 frames de audio; no aplica ventana de tokens de texto) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors y msgpack en precisión nativa) |
| Idiomas soportados | no disponible (entrenado solo con LibriSpeech, corpus en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y flax_model.msgpack (Flax nativo) |

## Arquitectura y entrenamiento

El backbone es un Conformer de configuración "small", una arquitectura híbrida que combina capas convolucionales con auto-atención para capturar dependencias locales y globales en la secuencia de audio. Sobre las representaciones del encoder se aplica un pooling temporal PFAS (Parameter-Free Attentive Scoring), una extensión del paper original que añade atención no lineal compartida por frame y un ancla ATP global, con 4 claves de atención de dimensiones 32 y 128. La salida es un embedding de locutor de 640 dimensiones.

El entrenamiento usa el objetivo GE2E softmax sobre una matriz split-batch par/impar (test-vs-enrollment), en lugar de centroides leave-one-out, porque el scoring no es coseno. Se entrenó durante 2.400 pasos de gradiente (batch de 32 utterances: 8 locutores x 4 utterances), lo que equivale a unas 13,27 épocas sobre las 5.788 utterances de LibriSpeech (232 locutores), con semilla 42 y warmup de 240 pasos, en una estación de trabajo con CPU. El frontend de audio es un Mel logarítmico natural de 80 dimensiones a 16 kHz con VAD por energía a nivel de frame y CMVN, implementado en `flaxspeaker.AudioFrontend` y no como un `AutoFeatureExtractor` de Hugging Face. Los crops de entrenamiento son de longitud variable U(90, 180) frames con máscara de validez exacta.

## Capacidades

- Extracción de embeddings de locutor de 640 dimensiones a partir de audio de entrada.
- Verificación de locutor (1-utt y 3-utt) mediante scoring PFAS-SN.
- Identificación de locutor (speaker recognition) por comparación de embeddings.
- Cálculo de métricas de evaluación: EER, minDCF y ROC-AUC.
- Procesamiento de audio a 16 kHz con VAD por energía integrado en el frontend.
- No soporta generación de texto, tool calling, agentes, visión ni audio generativo.
- Capacidades multilingües: no documentadas; el entrenamiento se limita a LibriSpeech (inglés).

## Casos de uso

- Baseline educativo para speaker verification: sirve para estudiar en JAX/Flax la implementación de GE2E, PFAS y pooling ATP sobre un corpus pequeño y reproducible, comparando curvas de EER a lo largo de los pasos de entrenamiento (20,27 % a 11,60 % en 1-utt entre el paso 400 y el 2.400).
- Comparación relativa de arquitecturas de backbone: al ser un checkpoint "small" con presupuesto de entrenamiento fijo, permite aislar el efecto del backbone (Conformer vs otras variantes) manteniendo constante el objetivo GE2E y el pooling PFAS.
- Prototipado de sistemas de verificación en entornos con recursos limitados: con ~0,1 GB de pesos y 2,16 M de parámetros, se puede cargar en CPU para pruebas de integración antes de escalar a modelos mayores.
- Generación de embeddings para clustering de locutores en corpus pequeños: útil en experimentos académicos con decenas o pocos cientos de locutores donde la diversidad del modelo no es el cuello de botella.
- Validación de pipelines de audio: el frontend Mel+VAD+CMVN incluido permite probar la cadena completa de preprocesado de audio en Flax sin depender de Hugging Face `AutoFeatureExtractor`.
- Reproducción de resultados publicados: el checkpoint incluye `eval_results.json` y fingerprints de paso 0, lo que facilita verificar que la evaluación con el código actual reproduce las métricas archivadas.
- Investigación sobre pérdidas de entrenamiento: permite experimentar con variantes de GE2E softmax o Dr-Vectors partiendo de un modelo ya convergido en un corpus controlado.

## Benchmarks y rendimiento

Resultados publicados en la model card (EER sobre LibriSpeech in-domain, a lo largo del entrenamiento):

| Paso | EER 1-utt | EER 3-utt |
|---|---|---|
| 400 | 20,27 % | 18,80 % |
| 2000 (knee) | 12,10 % | 8,00 % |
| 2400 (final) | 11,60 % | 9,20 % |
| Universal Pooled final | 20,57 % | 17,70 % |

Notas: la desviación estándar entre semillas 0-2 del EER pooled 1-utt es de 0,08-0,41 % absoluto; el intervalo de confianza bootstrap del 95 % con 8.000 ensayos tiene una semianchura de ~0,8 %. Como referencia externa, la model card cita ECAPA-TDNN sobre VoxCeleb2-dev con ~0,9 % EER en VoxCeleb1-O y sistemas sub-1M de parámetros con ~2 % (EfficientTDNN, 2022), pero estos no son comparables directamente por la diferencia de corpus de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 2,16 M de parámetros y pesos en safetensors de ~0,1 GB, cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requieren GPU dedicadas; cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) es sobrada. El entrenamiento reportado se hizo en CPU.
- Cabe en consumer GPU: sí, en todas las GPU consumer actuales e incluso en sistemas embebidos con suficiente RAM.
- Opciones de despliegue: la librería `flaxspeaker` (PyPI) con JAX/Flax; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos de texto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | EER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ls_conformer_small_pfas_ge2e` | 2,16 M | Audio 16 kHz, crops 90-180 frames | 11,60 % (1-utt) / 9,20 % (3-utt) en LibriSpeech | Apache 2.0 | Hugging Face + PyPI |
| ECAPA-TDNN (Desplanques et al., 2020) | ~20 M (típico) | Audio 16 kHz | ~0,9 % en VoxCeleb1-O | no disponible en la información | Referencia bibliográfica |
| EfficientTDNN (Wang et al., 2022) | <1 M | Audio 16 kHz | ~2 % en VoxCeleb1-O | no disponible en la información | Referencia bibliográfica |

La comparación no es directa: los dos modelos de referencia se entrenan sobre VoxCeleb2-dev (5.994 locutores, ~1,1 M utterances), mientras que este checkpoint se entrena sobre 232 locutores y 5.788 utterances de LibriSpeech. La diferencia de EER refleja principalmente la diversidad del corpus de entrenamiento, no solo la arquitectura.

## Limitaciones y advertencias

- No es un producto oficial de Google; es una reimplementación independiente con fines de benchmark.
- Entrenado solo con 232 locutores de LibriSpeech: el EER absoluto está acotado por la baja diversidad de locutores y no debe compararse con sistemas industriales entrenados sobre miles de locutores.
- Corpus de entrenamiento únicamente en inglés; el comportamiento en otros idiomas no está documentado.
- Riesgo de sesgo demográfico y acústico derivado del corpus LibriSpeech (lectura de audiolibros, condiciones de estudio).
- No es un modelo generativo: no soporta tool calling, agentes, visión ni texto.
- La licencia Apache 2.0 permite uso comercial, pero el autor advierte explícitamente que el checkpoint es de benchmark y no está pensado como sistema de producción.
- El frontend de audio no es un `AutoFeatureExtractor` de Hugging Face; requiere usar `flaxspeaker.AudioFrontend`, lo que limita la integración con pipelines estándar de Transformers.
- El intervalo de confianza bootstrap del 95 % (~0,8 % de semianchura) implica que diferencias menores de EER entre modelos deben interpretarse con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/wq2012/ls_conformer_small_pfas_ge2e
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
