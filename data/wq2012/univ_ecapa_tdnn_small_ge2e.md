# wq2012/univ_ecapa_tdnn_small_ge2e

## Resumen

`univ_ecapa_tdnn_small_ge2e` es un extractor de embeddings de locutor (speaker embeddings) implementado en JAX/Flax y distribuido por el autor `wq2012` dentro del proyecto FlaxSpeaker. Emplea una arquitectura ECAPA-TDNN en su variante `small`, con pooling temporal atencional (`asp`), objetivo de entrenamiento GE2E softmax y puntuación por similitud coseno. El modelo produce representaciones de 192 dimensiones a partir de audio a 16 kHz procesado con un frontend propio de 80 bandas Mel en logaritmo natural, VAD por energía y CMVN.

El checkpoint es una reimplementación desde cero en JAX/Flax de los algoritmos descritos en los papers GE2E, Dr-Vectors, ATP y PFAS, entrenada sobre un corpus controlado de tres dominios (LibriSpeech, CN-Celeb2 y VoxCeleb1) con 381 locutores y 9.447 enunciados. Con 1.684.418 parámetros de inferencia (1.690.176 en safetensors incluyendo pesos auxiliares), es un modelo deliberadamente pequeño pensado como referencia de benchmark dentro del ecosistema FlaxSpeaker, no como un sistema de producción a gran escala.

Su relevancia actual es acotada pero clara: ofrece un punto de comparación reproducible, con métricas publicadas (EER, minDCF, ROC-AUC con intervalos de confianza bootstrap), exportaciones a TFLite en fp32 e int8, y una implementación íntegramente en JAX que facilita la portabilidad a aceleradores y entornos embebidos. No obstante, sus tasas de error (EER de ~17,6 % en 1-utt y ~14,1 % en 3-utt sobre el split de evaluación multi-dominio) están muy lejos de los sistemas ECAPA-TDNN entrenados sobre VoxCeleb2-dev, que alcanzan ~0,9 % EER.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (`small`) con pooling temporal atencional (`asp`) |
| Parametros totales | 1.690.176 (safetensors); 1.684.418 de inferencia (encoder + cabeza de scoring, excluye clasificador de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como contexto textual; entrada de audio con crops variables de 90-180 frames (~0,9-1,8 s) en entrenamiento; exportaciones TFLite con 180 frames fijos (1,8 s) |
| Tipos de cuantizacion | fp32 e int8 (exportaciones TFLite del encoder) |
| Idiomas soportados | no disponible (modelo agnóstico al idioma; entrenado con corpus multilingüe: LibriSpeech en inglés, CN-Celeb2 en chino, VoxCeleb1 multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, Flax msgpack (`flax_model.msgpack`), TFLite (`model_fp32.tflite`, `model_int8.tflite`) |

## Arquitectura y entrenamiento

La arquitectura es una ECAPA-TDNN de tamaño `small` que combina bloques convolucionales 1D con atención squeeze-excitation y agregación estadística atencional, seguida de una cabeza de embedding de 192 dimensiones. El frontend de audio es propio de la librería FlaxSpeaker: 80 bandas Mel en logaritmo natural a 16 kHz, VAD por energía a nivel de frame y normalización CMVN; no se trata de un `AutoFeatureExtractor` de Hugging Face, lo que implica que el preprocesado debe replicarse con la librería `flaxspeaker`. La función de pérdida es GE2E softmax con centroides leave-one-out exactos, y la verificación se realiza por similitud coseno.

El entrenamiento se ejecutó durante 4.600 pasos de gradiente con batches de 32 enunciados (8 locutores x 4 enunciados), aproximadamente 15,58 épocas sobre 9.447 enunciados de 381 locutores, con semilla 42, warmup de 460 pasos y un margen de seguridad de 2 épocas sobre el punto de convergencia. Los crops de entrenamiento fueron de longitud variable U(90, 180) frames con máscara de validez exacta. La evolución del EER pooled pasó de 28,32 % (1-utt) / 25,27 % (3-utt) en el paso 400 a 18,35 % / 14,80 % en el paso 4.000 y a 17,62 % / 14,07 % en el paso 4.600. La desviación estándar entre semillas 0-2 es de 0,08-0,41 % absoluto en EER 1-utt, y el intervalo de confianza bootstrap al 95 % con 8.000 ensayos es de ±0,8 %.

## Capacidades

- Extracción de embeddings de locutor de 192 dimensiones a partir de audio de 16 kHz.
- Verificación de locutor (1:1) mediante similitud coseno entre embeddings.
- Identificación de locutor (1:N) por comparación contra un conjunto de referencia de embeddings.
- Puntuación por similitud coseno con cabeza de scoring dedicada (PFAS / Dr-Vector según configuración).
- Procesamiento de audio de duración corta (crops de ~1-2 s) gracias al frontend con VAD y CMVN.
- Exportación a TFLite (fp32 e int8) para despliegue en entornos con recursos limitados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo thinking; es un modelo puramente discriminativo de representación.

## Casos de uso

- Verificación biométrica de locutor en aplicaciones de acceso: el modelo genera embeddings de 192 dimensiones que se comparan por coseno contra una plantilla enrolada, con un coste computacional mínimo (1,68 M parámetros) adecuado para dispositivos con poca memoria.
- Benchmark reproducible de arquitecturas de speaker recognition: sirve como referencia controlada dentro de FlaxSpeaker para comparar variantes de backbone, pooling y funciones de pérdida bajo el mismo protocolo de evaluación multi-dominio.
- Despliegue en dispositivos embebidos y móviles: las exportaciones TFLite fp32 e int8 del encoder permiten ejecutar la extracción de embeddings en microcontroladores o teléfonos sin infraestructura GPU.
- Investigación en JAX/Flax: al ser una implementación nativa en JAX, se integra en pipelines de experimentación con diferenciación automática, `jax.jit` y aceleradores TPU/GPU sin necesidad de capas de compatibilidad con PyTorch.
- Segmentación y diarización preliminar en entornos de pocos recursos: los embeddings pueden usarse como características para agrupar segmentos de audio por locutor en grabaciones cortas, aunque la baja diversidad de entrenamiento limita su robustez.
- Detección de cambios de locutor en audio de reuniones o llamadas: la ventana de ~1,8 s de las exportaciones TFLite encaja con la granularidad típica de segmentación por turnos en conversaciones.
- Filtrado de calidad y control en corpus de voz: los embeddings permiten detectar inconsistencias de locutor en datasets de ASR antes del entrenamiento.

## Benchmarks y rendimiento

Métricas publicadas en la model card sobre el split de evaluación multi-dominio del benchmark FlaxSpeaker (381 locutores, ≤25 enunciados por locutor):

| Metrica | 1-utt | 3-utt |
|---|---|---|
| EER (paso 400) | 28,32 % | 25,27 % |
| EER (paso 4000, knee) | 18,35 % | 14,80 % |
| EER (paso 4600, final) | 17,62 % | 14,07 % |

Datos adicionales reportados: desviación estándar entre semillas 0-2 de 0,08-0,41 % absoluto en EER 1-utt pooled; intervalo de confianza bootstrap al 95 % (8.000 ensayos) de ±0,8 %. Se incluye además una evaluación sobre el subconjunto de 10 locutores de VoxCeleb1-O en `eval_results.json`, junto con minDCF y ROC-AUC, aunque los valores numéricos concretos de estas métricas no se detallan en la información disponible.

Como referencia contextual citada por el autor: sistemas ECAPA-TDNN publicados entrenados sobre VoxCeleb2-dev alcanzan ~0,9 % EER en la lista completa VoxCeleb1-O (Desplanques et al., 2020), y sistemas de menos de 1 M de parámetros ~2 % (Wang et al., EfficientTDNN, 2022). El checkpoint aquí descrito no es comparable directamente por diferencias de corpus de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en fp32 para los pesos (1,68 M parámetros ≈ 6,7 MB) más buffers de activación; el modelo completo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Para lotes grandes, cualquier GPU con ≥4 GB (GTX 1650, RTX 3050, RTX 4090, A100, H100) es más que suficiente.
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas e incluso en iGPU y dispositivos móviles vía TFLite.
- Opciones de despliegue: `flaxspeaker` (JAX/Flax nativo), TFLite Runtime (fp32/int8), exportación vía `jax2tf`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada; el tamaño reducido y la ventana de 1,8 s sugieren latencias de milisegundos en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | EER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `univ_ecapa_tdnn_small_ge2e` (este) | 1,68 M (inferencia) | crops 90-180 frames (~0,9-1,8 s) | 17,62 % (1-utt) / 14,07 % (3-utt) en split propio de 381 locutores | Apache 2.0 | Hugging Face + PyPI (`flaxspeaker`) |
| ECAPA-TDNN (Desplanques et al., 2020) | ~20 M (típico) | utterances completas | ~0,9 % en VoxCeleb1-O (VoxCeleb2-dev) | no disponible | Referencia académica; implementaciones comunitarias en SpeechBrain |
| EfficientTDNN <1 M (Wang et al., 2022) | <1 M | utterances completas | ~2 % en VoxCeleb1-O | no disponible | Referencia académica |

La comparación no es directa: los sistemas de referencia se entrenan sobre VoxCeleb2-dev (5.994 locutores, ~1,1 M enunciados), mientras que este checkpoint usa 381 locutores y 9.447 enunciados. Las cifras de EER no son trasladables entre corpus.

## Limitaciones y advertencias

- El EER absoluto (17,62 % en 1-utt) es muy superior al de sistemas entrenados sobre corpus grandes; no debe usarse como sistema de verificación en producción sin un reentrenamiento o fine-tuning sobre datos representativos.
- La diversidad de locutores del entrenamiento (381) es baja; el rendimiento se degrada previsiblemente en locutores con acentos, edades o condiciones de grabación poco representadas.
- El frontend de audio es propio de `flaxspeaker` (80 Mel log natural, VAD por energía, CMVN) y no es un `AutoFeatureExtractor` de Hugging Face; usar otro preprocesado invalida los embeddings.
- Las exportaciones TFLite corresponden solo al encoder y usan 180 frames fijos sin máscara, por lo que no reproducen el pipeline de crops variables del entrenamiento.
- Riesgo de alucinación no aplicable (modelo discriminativo), pero sí riesgo de falsos positivos/negativos en verificación por la baja calidad del embedding en condiciones adversas.
- Sesgos demográficos y de canal no documentados explícitamente; el corpus mezcla inglés, chino y otros idiomas de VoxCeleb1, sin análisis de equidad publicado.
- El checkpoint se declara como benchmark de corpus pequeño, no como reproducción de los resultados a gran escala de los papers; el autor lo indica explícitamente en la model card.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y la baja precisión hacen desaconsejable su uso comercial directo sin validación.
- No es un producto oficial de Google; es una reimplementación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/wq2012/univ_ecapa_tdnn_small_ge2e
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
