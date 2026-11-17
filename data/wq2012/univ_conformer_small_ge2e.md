# wq2012/univ_conformer_small_ge2e

## Resumen

`univ_conformer_small_ge2e` es un modelo de extracción de embeddings de locutor (speaker embeddings) desarrollado por el usuario wq2012 dentro del proyecto FlaxSpeaker, una reimplementación desde cero en JAX/Flax de algoritmos de reconocimiento de locutor descritos en la literatura académica (GE2E, Dr-Vectors, ATP y PFAS). No es un producto oficial de Google, sino un checkpoint de referencia para comparaciones controladas dentro de un benchmark propio. El modelo resuelve tareas de verificación e identificación de locutor generando representaciones vectoriales de 192 dimensiones a partir de audio.

Arquitectónicamente combina un backbone Conformer de tamaño "small" con pooling temporal atento (ATP) y un objetivo de entrenamiento GE2E softmax con centroides leave-one-out exactos. El scoring de verificación se realiza por similitud coseno. El modelo tiene 2.029.894 parámetros de inferencia (encoder más cabeza de scoring, excluyendo los pesos del clasificador usados solo en entrenamiento) y acepta audio a 16 kHz procesado con un frontend de 80 dimensiones Mel logarítmico natural, VAD por energía y CMVN.

Su relevancia es acotada pero clara: sirve como referencia reproducible y ligera (repo de 0,1 GB) para experimentos de verificación de locutor en JAX/Flax, con licencia Apache 2.0 y exportaciones TFLite para despliegue en dispositivos. No está pensado como modelo de producción a gran escala: se entrenó sobre un corpus controlado de 381 locutores y 9.447 utterances, y sus EER absolutos quedan lejos de los sistemas industriales entrenados sobre VoxCeleb2-dev.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer (small) + pooling temporal ATP |
| Parámetros totales | 2.029.894 (encoder + cabeza de scoring; excluye clasificador de entrenamiento) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada fija de 180 frames / 1,8 s en exportaciones TFLite; entrenamiento con crops variables U(90, 180) frames) |
| Tipos de cuantización | FP32 e INT8 (exportaciones TFLite del encoder) |
| Idiomas soportados | no disponible (modelo de audio independiente del idioma; entrenado con LibriSpeech, CN-Celeb2 y VoxCeleb1) |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors, Flax Msgpack, TFLite (FP32 e INT8) |

## Arquitectura y entrenamiento

El modelo usa un backbone Conformer de configuración "small" con pooling temporal atento (ATP), una cabeza originalmente propuesta para identificación de idioma en streaming y reaprovechada aquí para agregar la secuencia temporal en un embedding de locutor. La función de pérdida es GE2E softmax (Wan et al. 2018, Eq. 6) con centroides leave-one-out exactos, y la verificación se resuelve por similitud coseno sobre embeddings de 192 dimensiones. El frontend de audio es propio de la librería FlaxSpeaker: Mel logarítmico natural de 80 dimensiones a 16 kHz, VAD por energía a nivel de frame y CMVN, y no es un `AutoFeatureExtractor` de Hugging Face.

El entrenamiento se realizó sobre un pool multi-dominio de 381 locutores y 9.447 utterances (LibriSpeech + CN-Celeb2 + VoxCeleb1), con 4.600 pasos de gradiente, batches de 32 utterances (8 locutores x 4 utterances), warmup de 460 pasos y aproximadamente 15,58 épocas, semilla 42, en una estación de trabajo CPU. Se usaron crops variables de U(90, 180) frames con máscara de validez exacta. El EER agrupado universal evolucionó de 25,52 % (1 utterance) y 22,37 % (3 utterances) en el paso 400 a 17,54 % y 13,87 % en el paso 4.600. La desviación estándar entre semillas 0-2 es de 0,08-0,41 % absoluto y el intervalo de confianza bootstrap al 95 % con 8.000 ensayos tiene una semianchura de ~0,8 %. El autor advierte explícitamente que no es una reproducción a gran escala de los resultados de los papers originales.

## Capacidades

- Extracción de embeddings de locutor de 192 dimensiones a partir de audio a 16 kHz.
- Verificación de locutor (1:1) mediante similitud coseno entre embeddings.
- Identificación de locutor (1:N) mediante comparación contra una galería de embeddings.
- Funcionamiento multi-dominio: entrenado con datos de inglés (LibriSpeech, VoxCeleb1) y chino (CN-Celeb2).
- Exportación a TFLite (FP32 e INT8) del encoder para inferencia en dispositivos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo de feature extraction de audio.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Verificación biométrica de locutor en aplicaciones de control de acceso: el modelo genera embeddings de 192 dimensiones y compara por coseno, adecuado para autenticación 1:1 en entornos con pocos usuarios y audio de 1,8 s o más.
- Identificación de hablantes en reuniones y transcripciones: permite etiquetar segmentos de audio con el locutor correspondiente comparando cada embedding contra una galería previamente enrolada.
- Diarización ligera en dispositivos: las exportaciones TFLite INT8 del encoder permiten ejecutar la extracción de embeddings en móviles o sistemas embebidos sin GPU.
- Investigación reproducible en JAX/Flax: sirve como baseline controlado para comparar variantes de arquitectura, pooling o funciones de pérdida dentro del benchmark FlaxSpeaker.
- Filtrado de audio por locutor en pipelines de datos: permite descartar o agrupar utterances de un mismo hablante antes de entrenar otros modelos de voz.
- Prototipado de sistemas de verificación multi-idioma: al haberse entrenado con inglés y chino, puede usarse como punto de partida para experimentos con hablantes de ambos idiomas, siempre con validación adicional.

## Benchmarks y rendimiento

Datos publicados en la model card y en `eval_results.json`:

| Métrica | Paso 400 | Paso 4.000 | Paso 4.600 (final) |
|---|---|---|---|
| EER agrupado universal, 1 utterance | 25,52 % | 17,91 % | 17,54 % |
| EER agrupado universal, 3 utterances | 22,37 % | 13,90 % | 13,87 % |

Referencias citadas por el autor (no resultados de este checkpoint): sistemas ECAPA-TDNN entrenados sobre VoxCeleb2-dev alcanzan ~0,9 % EER en la lista completa VoxCeleb1-O (Desplanques et al., 2020), y sistemas de menos de 1M de parámetros ~2 % (Wang et al., EfficientTDNN, 2022). El autor indica que los checkpoints liberados están entrenados sobre el corpus de 381 locutores, no sobre VoxCeleb2-dev (5.994 locutores, ~1,1M utterances), y que no deben interpretarse como estado del arte.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 2,03M de parámetros, los pesos en FP32 ocupan aproximadamente 8 MB y en INT8 unos 2 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; el autor entrenó en CPU. Cualquier GPU moderna (RTX 3060 o superior, A100, H100) acelera la inferencia pero no es necesaria.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos 1 GB de memoria; también en CPU y en dispositivos con TFLite.
- Opciones de despliegue: librería `flaxspeaker` (JAX/Flax) para inferencia nativa; TFLite Runtime para las exportaciones `model_fp32.tflite` y `model_int8.tflite` (encoder con entrada fija de 180 frames); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | EER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `univ_conformer_small_ge2e` | 2,03M | crops de 90-180 frames; TFLite fijo a 180 frames | 17,54 % (1 utt) / 13,87 % (3 utt) en corpus propio de 381 locutores | Apache 2.0 | Hugging Face, PyPI, GitHub |
| ECAPA-TDNN (Desplanques et al., 2020) | no disponible en la información | no disponible | ~0,9 % en VoxCeleb1-O completo (VoxCeleb2-dev) | no disponible | referencia bibliográfica |
| EfficientTDNN (Wang et al., 2022) | <1M | no disponible | ~2 % (referencia citada) | no disponible | referencia bibliográfica |

La comparación no es directa: los EER de los sistemas de referencia se miden sobre VoxCeleb1-O con entrenamiento en VoxCeleb2-dev, mientras que este checkpoint se evalúa sobre un corpus controlado de 381 locutores. No se dispone de datos de otros modelos comparables en la misma configuración de benchmark.

## Limitaciones y advertencias

- No es un producto oficial de Google; es una reimplementación independiente basada solo en papers publicados.
- Entrenado sobre un corpus pequeño (381 locutores, 9.447 utterances); la diversidad de locutores limita el EER absoluto frente a sistemas industriales.
- No debe usarse como estado del arte ni como sustituto de modelos entrenados sobre VoxCeleb2-dev en producción.
- Riesgo de sesgo por la composición del corpus: predominio de inglés y chino, con posible menor rendimiento en otros idiomas y acentos no representados.
- El frontend de audio es propio de FlaxSpeaker y no es compatible con `AutoFeatureExtractor` de Hugging Face; requiere usar la librería del autor.
- Las exportaciones TFLite solo cubren el encoder y usan una entrada fija sin máscara de 180 frames (1,8 s), lo que limita el uso con audio de duración variable.
- Riesgo de falsos positivos y negativos en verificación biométrica; no debe usarse como único factor de autenticación en entornos críticos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar el cumplimiento en despliegues de biometría según la normativa aplicable (RGPD, AI Act).

## Enlaces

- Hugging Face: https://huggingface.co/wq2012/univ_conformer_small_ge2e
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- GitHub: https://github.com/wq2012/FlaxSpeaker
- PyPI: https://pypi.org/project/flaxspeaker/
- GE2E, arXiv:1710.10467: https://arxiv.org/abs/1710.10467
- Dr-Vectors, arXiv:2104.01989: https://arxiv.org/abs/2104.01989
- ATP, arXiv:2202.12163: https://arxiv.org/abs/2202.12163
- PFAS, arXiv:2203.05642: https://arxiv.org/abs/2203.05642
