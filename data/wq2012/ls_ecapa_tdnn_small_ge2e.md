# wq2012/ls_ecapa_tdnn_small_ge2e

## Resumen

`ls_ecapa_tdnn_small_ge2e` es un modelo de extraccion de embeddings de locutor (speaker embeddings) implementado en JAX/Flax por el autor `wq2012` como parte de la biblioteca FlaxSpeaker. Resuelve la tarea de verificacion e identificacion de locutor: convierte una senal de audio en un vector de 192 dimensiones que representa la identidad vocal, de modo que dos fragmentos del mismo hablante quedan proximos en el espacio de embeddings (similitud coseno). Es una reimplementacion desde cero, basada solo en papers publicados, de los algoritmos GE2E, Dr-Vectors, ATP y PFAS.

La arquitectura es una ECAPA-TDNN en variante `small` con pooling temporal `asp` (attentive statistical pooling) y funcion de perdida GE2E softmax con centroides leave-one-out exactos. El modelo es deliberadamente pequeno: 1.690.176 parametros totales en safetensors (1.684.418 en encoder mas cabeza de scoring, excluyendo pesos de clasificador solo de entrenamiento) y un repositorio de 0,1 GB. Genera embeddings de 192 dimensiones a partir de un frontend de audio de 80 Mel log-naturales a 16 kHz con VAD por energia y CMVN.

Su relevancia es acotada pero clara: es un checkpoint de referencia para el benchmark interno de FlaxSpeaker, entrenado hasta convergencia sobre un corpus pequeno (LibriSpeech, 232 locutores, 5.788 enunciados), no un modelo de produccion a escala industrial. Sirve para comparaciones relativas controladas, para experimentar con el stack JAX/Flax/TFLite en tareas de locutor y como ejemplo reproducible de entrenamiento en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (`small`), pooling temporal `asp` |
| Parametros totales | 1.690.176 (safetensors); 1.684.418 encoder + cabeza de scoring (excluye clasificador solo de entrenamiento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (audio; ventana fija de 180 frames, 1,8 s, en exportes TFLite; entrenamiento con crops U(90,180) frames) |
| Tipos de cuantizacion | FP32 y INT8 (exportes `model_fp32.tflite` / `model_int8.tflite`, solo encoder) |
| Idiomas soportados | No disponible (modelo de locutor, independiente del idioma en teoria; entrenado solo con LibriSpeech en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, Flax msgpack (`flax_model.msgpack`), TFLite (FP32/INT8) |
| Dimension de embedding | 192 |
| Frontend de audio | 80 Mel log-naturales @ 16 kHz + VAD por energia + CMVN (`flaxspeaker.AudioFrontend`) |
| Funcion de perdida | GE2E softmax (Wan et al. 2018, Eq. 6) |
| Scorer de verificacion | Similitud coseno |
| Datos de entrenamiento | LibriSpeech (232 locutores, 5.788 enunciados) |
| Pasos / batch | 2.400 pasos x 32 enunciados (~13,27 epocas), seed 42 |

## Arquitectura y entrenamiento

El backbone es una ECAPA-TDNN en variante `small` con pooling temporal atentivo (`asp`), una arquitectura de red convolucional temporal con bloques SE-Res2Block y agregacion estadistica atentiva. La salida es un embedding de 192 dimensiones. El entrenamiento usa la perdida GE2E softmax con centroides leave-one-out exactos, siguiendo la formulacion de Wan et al. (2018, Eq. 6). La verificacion se realiza por similitud coseno entre embeddings. El frontend procesa audio a 16 kHz con 80 bandas Mel log-naturales, aplica VAD por energia y normalizacion CMVN; no es un `AutoFeatureExtractor` de Hugging Face.

El entrenamiento se ejecuto durante 2.400 pasos de gradiente (warmup de 240 pasos, margen de seguridad `S_safe = X + 2 epocas`) con mini-batches de 32 enunciados (8 locutores x 4 enunciados), lo que supone aproximadamente 13,27 epocas sobre 5.788 enunciados de 232 locutores de LibriSpeech, en una estacion de trabajo CPU con seed 42. Los crops de entrenamiento son de longitud variable U(90,180) frames con mascara de validez exacta. La EER en dominio (LibriSpeech) evoluciono de 18,03% (1-utt) / 13,40% (3-utt) en el paso 400 a 11,37% (1-utt) / 6,10% (3-utt) en el paso 2.400. La desviacion tipica entre seeds 0-2 del EER pooled 1-utt es de 0,08-0,41% absoluto, y el intervalo de confianza bootstrap al 95% con 8.000 ensayos tiene una semianchura de ~0,8%. El checkpoint es una convergencia sobre corpus pequeno, no una reproduccion a escala de los resultados de los papers originales.

## Capacidades

- Extraccion de embeddings de locutor de 192 dimensiones a partir de audio.
- Verificacion de locutor (1:1) mediante similitud coseno entre embeddings.
- Identificacion de locutor (1:N) por comparacion contra una galeria de embeddings.
- Scoring con coseno, con cabezas GE2E `w,b`, Dr-Vector y PFAS incluidas en los pesos.
- Exportacion a TFLite FP32 e INT8 (solo encoder) para despliegue en entornos moviles o embebidos.
- Ejecucion nativa en JAX/Flax, con pesos en safetensors y msgpack.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un extractor de features de audio, no un modelo generativo.
- No soporta vision ni audio generativo; la entrada es audio y la salida es un vector.
- Capacidad multilingue: no documentada; el entrenamiento es solo en ingles (LibriSpeech), aunque los embeddings de locutor son en principio independientes del idioma.

## Casos de uso

- Verificacion de locutor en autenticacion por voz: el modelo genera un embedding de 192 dimensiones por utterance y se compara por coseno contra el embedding de referencia del usuario; su tamano (1,69 M parametros) permite ejecutarlo en CPU o en dispositivos con recursos limitados.
- Identificacion de locutor en grabaciones cortas: con utterances de 1 a 3 segundos se obtienen EER de 11,37% y 6,10% respectivamente en dominio LibriSpeech, adecuado para pruebas de concepto de diarizacion o etiquetado de hablante.
- Benchmark y validacion de pipelines JAX/Flax: sirve como checkpoint de referencia reproducible (seed 42, huella de perdida en paso 0 documentada) para comparar cambios en el frontend, el pooling o la perdida dentro de FlaxSpeaker.
- Despliegue en movil o embebido: los exportes TFLite FP32 e INT8 del encoder con ventana fija de 180 frames (1,8 s) permiten integrar la extraccion de embeddings en aplicaciones Android o microcontroladores con aceleracion TFLite.
- Deteccion de cambio de locutor en audio largo: aplicando el encoder sobre ventanas de 1,8 s y comparando embeddings consecutivos por coseno se pueden localizar fronteras de hablante en grabaciones.
- Filtrado y curaduria de datasets de voz: agrupar utterances por similitud de embedding para detectar duplicados, locutores mal etiquetados o desbalance de hablantes antes de entrenar otros modelos.
- Investigacion educativa sobre ECAPA-TDNN y GE2E: al ser una reimplementacion desde cero con papers citados y sin codigo propietario, es util para estudiar la arquitectura y la perdida paso a paso.

## Benchmarks y rendimiento

Resultados reportados en `eval_results.json` y en la model card (EER en dominio LibriSpeech, 232 locutores):

| Metrica | Paso 400 | Paso 2000 (knee) | Paso 2400 (final) |
|---|---|---|---|
| EER 1-utt (LibriSpeech) | 18,03% | 11,47% | 11,37% |
| EER 3-utt (LibriSpeech) | 13,40% | 6,70% | 6,10% |
| EER pooled 1-utt (Universal Pooled final) | no disponible | no disponible | 20,05% |
| EER pooled 3-utt (Universal Pooled final) | no disponible | no disponible | 15,77% |

Referencias externas citadas en la model card (no resultados de este checkpoint): sistemas ECAPA-TDNN publicados entrenados en VoxCeleb2-dev alcanzan ~0,9% EER en VoxCeleb1-O completo (Desplanques et al., 2020), y sistemas de menos de 1 M de parametros ~2% (Wang et al., EfficientTDNN, 2022). El checkpoint incluye ademas una evaluacion en el subconjunto de 10 locutores de VoxCeleb1-O, pero los valores no se detallan en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en FP32; el modelo completo ocupa 0,1 GB en repositorio. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; el entrenamiento y la evaluacion se realizaron en CPU. Cualquier GPU moderna (RTX 4090, A100, H100) acelera la inferencia pero no es necesaria.
- Cabe en GPU consumer: si, en cualquier GPU con al menos ~1 GB de memoria, e incluso en CPU.
- Opciones de despliegue: JAX/Flax nativo (libreria `flaxspeaker`), TFLite (FP32 e INT8) para movil y embebido. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un extractor de features de audio).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | EER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ls_ecapa_tdnn_small_ge2e` (este) | 1,69 M | ventana fija 180 frames (1,8 s) en TFLite | 11,37% (1-utt) / 6,10% (3-utt) en LibriSpeech | Apache-2.0 | Hugging Face, PyPI, GitHub |
| ECAPA-TDNN (Desplanques et al., 2020) | no disponible | no disponible | ~0,9% en VoxCeleb1-O | no disponible | referencia bibliografica |
| EfficientTDNN (Wang et al., 2022) | < 1 M | no disponible | ~2% | no disponible | referencia bibliografica |

La comparacion directa no es valida: los modelos de referencia se entrenan en VoxCeleb2-dev (5.994 locutores, ~1,1 M utterances), mientras que este checkpoint usa 232 locutores de LibriSpeech. Las cifras de EER no son comparables entre si; la model card lo advierte explicitamente.

## Limitaciones y advertencias

- No es un producto oficial de Google; es una reimplementacion independiente en JAX/Flax.
- Entrenado solo con 232 locutores de LibriSpeech (ingles); la diversidad de locutores es muy inferior a los benchmarks industriales, lo que acota la EER absoluta alcanzable.
- EER en dominio de 11,37% (1-utt) y 6,10% (3-utt); en el conjunto pooled universal sube a 20,05% y 15,77%, lo que indica degradacion fuera de dominio.
- Riesgo de sesgo por el corpus de entrenamiento: acentos, idiomas, edades y condiciones acusticas no representados en LibriSpeech pueden degradar el rendimiento.
- No es un modelo generativo: no produce texto, no alucina en el sentido habitual, pero puede producir embeddings poco discriminativos para locutores o condiciones fuera de distribucion.
- El frontend no es un `AutoFeatureExtractor` de Hugging Face; requiere usar `flaxspeaker.AudioFrontend` con los ajustes de VAD y CMVN del `config.json`.
- Los exportes TFLite cubren solo el encoder y usan ventana fija sin mascara de 180 frames (1,8 s); no reproducen el entrenamiento con crops variables.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; verificar la procedencia de los datos de audio en produccion.
- No apto como sistema de autenticacion de alta seguridad sin evaluacion adicional en el dominio objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/wq2012/ls_ecapa_tdnn_small_ge2e
- Coleccion FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- GitHub FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- PyPI `flaxspeaker`: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
