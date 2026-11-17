# wq2012/univ_conformer_small_cosface

## Resumen

`univ_conformer_small_cosface` es un modelo de extracción de embeddings de hablante (speaker verification y speaker recognition) desarrollado por el usuario `wq2012` como parte de la biblioteca `FlaxSpeaker`, una reimplementación desde cero en JAX/Flax de algoritmos publicados de reconocimiento de hablante. El modelo combina un backbone Conformer de tamano "small" con pooling temporal atento (ATP) y una función de pérdida CosFace, y produce representaciones de 192 dimensiones que se comparan mediante similitud coseno. No es un modelo de lenguaje: es un extractor de características acústicas orientado a verificar si dos fragmentos de audio pertenecen al mismo hablante.

El checkpoint tiene 2.029.892 parámetros de inferencia (encoder más cabeza de scoring, excluyendo los pesos del clasificador usados solo en entrenamiento) y fue entrenado sobre un corpus controlado de 381 hablantes y 9.447 enunciados procedentes de LibriSpeech, CN-Celeb2 y VoxCeleb1. Se entrenó hasta convergencia en 4.600 pasos (~31,16 épocas) sobre una estación de trabajo con CPU, con semilla 42, y alcanza un EER agrupado de 13,94% (1 utterance) y 9,67% (3 utterances) en su propio benchmark multidominio.

Es relevante ahora por su carácter reproducible y ligero: sirve como referencia controlada para comparar variantes de arquitectura, pooling y funciones de pérdida dentro del ecosistema FlaxSpeaker, y como ejemplo de modelo de verificación de hablante de menos de 1M de parámetros ejecutable en hardware modesto. No está pensado como modelo de producción a escala industrial ni como reproducción de los resultados de los papers originales, tal y como advierte el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (variante `small`) con pooling temporal atento (ATP) |
| Parametros totales | 2.029.892 (encoder + cabeza de scoring; excluye pesos del clasificador de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa recortes variables de 90 a 180 frames con máscara de validez exacta) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado con LibriSpeech en inglés, CN-Celeb2 en chino y VoxCeleb1 multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors (`model.safetensors`) y Flax Msgpack (`flax_model.msgpack`) |
| Dimension de embedding | 192 |
| Funcion de perdida | CosFace (con warmup lineal del margen angular en los primeros 500 pasos) |
| Scorer de verificacion | Similitud coseno |
| Frontend de audio | Mel logarítmico natural de 80 dimensiones a 16.000 Hz + VAD por energía a nivel de frame + CMVN |
| Libreria | `flaxspeaker` (JAX/Flax) |
| Pipeline | `feature-extraction` |

## Arquitectura y entrenamiento

El modelo usa un backbone Conformer de configuracion `small` para extraer representaciones acústicas frame a frame, seguido de una cabeza de pooling temporal atento (ATP) que agrega la secuencia en un único vector de 192 dimensiones. Sobre ese embedding se aplica una pérdida CosFace con margen angular, cuyo margen se rampa linealmente durante los primeros 500 pasos antes de fijarse en el valor objetivo. La verificación en inferencia se realiza por similitud coseno entre embeddings. El frontend de audio es propio de la librería (`flaxspeaker.AudioFrontend`), no un `AutoFeatureExtractor` de Hugging Face: calcula Mel logarítmico natural de 80 dimensiones a 16 kHz, aplica VAD por energía a nivel de frame y normalización CMVN.

El entrenamiento se realizó sobre un pool controlado de tres dominios (LibriSpeech, CN-Celeb2 y VoxCeleb1) con 381 hablantes y 9.447 enunciados, en minibatches de 64 enunciados (8 hablantes x 4 enunciados), durante 4.600 pasos de gradiente (~31,16 épocas) con semilla 42 y recortes de longitud variable U(90, 180) frames con máscara de validez exacta. Según la model card, la pérdida y el EER de validación han alcanzado su meseta de convergencia en este split pequeño. El autor advierte explícitamente de que no es una reproducción a gran escala de los papers originales (GE2E, Dr-Vectors, ATP, PFAS), cuyos experimentos se ejecutaron sobre infraestructura y datos internos de Google.

## Capacidades

- Extracción de embeddings de hablante de 192 dimensiones a partir de audio a 16 kHz.
- Verificación de hablante (1:1) mediante similitud coseno entre embeddings.
- Identificación de hablante (1:N) mediante comparación contra una galería de embeddings.
- Puntuación con múltiples utterances por hablante (evaluado en configuraciones de 1 y 3 utterances).
- Evaluación multidominio: el modelo fue entrenado con datos en inglés (LibriSpeech), chino (CN-Celeb2) y multilingüe (VoxCeleb1).
- Soporte de recortes de audio de longitud variable (90-180 frames) con enmascaramiento de validez.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: no es un modelo generativo.
- No dispone de modo thinking, visión ni audio más allá del frontend acústico descrito.

## Casos de uso

- Verificación biométrica de voz en aplicaciones de acceso: el modelo genera un embedding de 192 dimensiones por utterance y se compara por similitud coseno contra el embedding de referencia del usuario, con un EER de referencia de ~13,94% en 1 utterance y ~9,67% en 3 utterances sobre el benchmark del autor.
- Identificación de hablante en grabaciones cortas: dado un audio de 90 a 180 frames, se extrae el embedding y se busca el vecino más cercano en una galería de hablantes conocidos, aprovechando el pooling ATP para agregar la secuencia temporal.
- Investigación comparativa de arquitecturas de speaker recognition: al ser una reimplementación reproducible en JAX/Flax con semilla fija y presupuesto de entrenamiento documentado, sirve como línea base controlada para comparar variantes de backbone, pooling y pérdida dentro de FlaxSpeaker.
- Experimentación educativa y prototipado en JAX: el modelo es lo bastante pequeño (2,03M de parámetros) para entrenarse y evaluarse en una estación de trabajo con CPU, lo que facilita su uso en docencia y pruebas de concepto.
- Segmentación y diarización asistida: los embeddings por segmento pueden alimentar un clustering aglomerativo para agrupar fragmentos de una reunión o entrevista por hablante, aunque la calidad estará limitada por el EER del checkpoint.
- Detección de reutilización de audio o suplantación en flujos de moderación: comparar el embedding de un audio entrante con el de un hablante registrado para marcar posibles inconsistencias, siempre como señal auxiliar y no como decisión automática.
- Evaluación de frontends acústicos: al incluir VAD por energía y CMVN en el propio modelo, permite medir el impacto de estas etapas en el EER final dentro de un pipeline JAX reproducible.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el benchmark multidominio del propio autor (381 hablantes, 9.447 enunciados). EER agrupado (pooled) a lo largo de la trayectoria de entrenamiento:

| Paso | EER 1-utt | EER 3-utt |
|---|---|---|
| 400 | 27,32% | 24,77% |
| 4000 (rodilla) | 13,95% | 9,57% |
| 4600 (final) | 13,94% | 9,67% |

Otras metricas reportadas en `eval_results.json` (segun la model card): minDCF, ROC-AUC, intervalos de confianza bootstrap al 95% (8.000 ensayos, semiancho ~0,8%) y un subconjunto de 10 hablantes de VoxCeleb1-O. La desviacion estandar entre semillas 0-2 del EER 1-utt agrupado es de 0,08-0,41% absoluto. No se han publicado resultados de benchmarks estandar (VoxCeleb1-O completo, CN-Celeb EER) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con pesos en fp32; el modelo tiene 2,03M de parametros (~8 MB en fp32, ~4 MB en fp16). La memoria dominante sera la del frontend y los buffers de audio.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no requiere A100 ni H100. Funciona en CPU, tal y como se uso para el entrenamiento (estacion de trabajo con CPU).
- Cabe en cualquier GPU de consumo: RTX 4090, RTX 3090, RTX 3060, GTX 1650 e incluso iGPU con suficiente memoria compartida.
- Opciones de despliegue: la libreria nativa es `flaxspeaker` (JAX/Flax). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. El repo incluye `model.safetensors` y `flax_model.msgpack` para carga directa.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo y la longitud de los recortes (90-180 frames), se espera una latencia muy baja en CPU y GPU, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | EER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wq2012/univ_conformer_small_cosface` | 2,03M (inferencia) | Recortes de 90-180 frames, 16 kHz | 13,94% (1-utt) / 9,67% (3-utt) en benchmark propio de 381 hablantes | Apache 2.0 | Hugging Face, PyPI `flaxspeaker` |
| ECAPA-TDNN (Desplanques et al., 2020) | ~20M (tipico) | Audio de duracion variable | ~0,9% en VoxCeleb1-O completo (VoxCeleb2-dev) | Codigo de referencia publicado | Implementaciones comunitarias |
| EfficientTDNN (Wang et al., 2022) | <1M | Audio de duracion variable | ~2% en VoxCeleb1-O | Segun publicacion | Implementaciones comunitarias |

La comparacion no es homogenea: los EER de ECAPA-TDNN y EfficientTDNN corresponden a entrenamiento sobre VoxCeleb2-dev (5.994 hablantes, ~1,1M utterances) y evaluacion en VoxCeleb1-O completo, mientras que este checkpoint se entrena sobre 381 hablantes y se evalua en su propio split controlado. El propio autor cita estas cifras solo como orientacion y advierte de que no son directamente comparables.

## Limitaciones y advertencias

- No es un producto oficialmente soportado por Google; es una reimplementacion independiente en JAX/Flax basada solo en papers publicados.
- Presupuesto de entrenamiento reducido: 381 hablantes y 9.447 enunciados, frente a los miles de hablantes de los benchmarks industriales. El EER absoluto esta acotado por la diversidad de hablantes de entrenamiento.
- EER de ~13,94% (1 utterance) y ~9,67% (3 utterances) en el benchmark propio: insuficiente para la mayoria de aplicaciones de verificacion biometrica en produccion sin umbrales muy conservadores y revision humana.
- Riesgo de sesgo por composicion del corpus: tres dominios concretos (ingles de LibriSpeech, chino de CN-Celeb2, multilingue de VoxCeleb1) y 381 hablantes; el rendimiento fuera de esos dominios (acentos, ruido, canales telefonicos) no esta caracterizado.
- No se han publicado evaluaciones en VoxCeleb1-O completo ni en CN-Celeb EER en la informacion disponible; solo un subconjunto de 10 hablantes de VoxCeleb1-O.
- El frontend de audio es propio de `flaxspeaker` y no un `AutoFeatureExtractor` de Hugging Face; integrarlo en pipelines estandar requiere usar la libreria o reimplementar el frontend (Mel 80 dims, VAD por energia, CMVN).
- Licencia Apache 2.0: permite uso comercial con atribucion, pero el autor no ofrece garantias de idoneidad para produccion.
- No es un modelo generativo: no soporta tool calling, agentes, razonamiento multi-step ni generacion de texto. Cualquier expectativa en ese sentido es un error de uso.
- El checkpoint se libera con recortes de longitud variable U(90, 180) y mascara de validez; evaluar con recortes fijos de 180 frames cambia la huella de perdida en el paso 0 (9,1251 frente a 9,3033), lo que puede alterar metricas si no se respeta la configuracion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/univ_conformer_small_cosface
- Coleccion FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub de FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI `flaxspeaker`: https://pypi.org/project/flaxspeaker/
- Paper GE2E (arXiv:1710.10467): https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors (arXiv:2104.01989): https://arxiv.org/abs/2104.01989
- Paper ATP (arXiv:2202.12163): https://arxiv.org/abs/2202.12163
- Paper PFAS (arXiv:2203.05642): https://arxiv.org/abs/2203.05642
