# wq2012/ls_ecapa_tdnn_small_ge2e

## Resumen

`ls_ecapa_tdnn_small_ge2e` es un modelo de extracción de embeddings de locutor (speaker embeddings) desarrollado por el usuario `wq2012` como parte de la biblioteca FlaxSpeaker, una reimplementación desde cero en JAX/Flax de algoritmos de reconocimiento de locutor descritos en la literatura académica. El modelo implementa una arquitectura ECAPA-TDNN en su variante "small" con pooling temporal ASP (Attentive Statistical Pooling) y se entrena con la función de pérdida GE2E softmax, produciendo representaciones de 192 dimensiones útiles para verificación e identificación de locutor mediante similitud coseno.

El checkpoint es deliberadamente un banco de pruebas a pequeña escala: se ha entrenado hasta convergencia sobre solo 5.788 enunciados de 232 locutores de LibriSpeech (unas 13,27 épocas, 2.400 pasos), con 1.684.418 parámetros de inferencia. No pretende ser un modelo de estado del arte, sino un punto de referencia reproducible y controlado dentro del ecosistema FlaxSpeaker, con métricas archivadas (EER, minDCF, ROC-AUC) y exportaciones a TFLite para despliegue en dispositivos.

Su relevancia actual radica en que ofrece una implementación abierta, ligera (0,1 GB de repositorio, menos de 2 millones de parámetros) y totalmente reproducible en JAX/Flax de un pipeline clásico de speaker verification, con pesos en safetensors y msgpack, útil para investigación comparativa, prototipado en CPU y experimentación con arquitecturas ECAPA-TDNN sin depender de infraestructura propietaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN variante `small` con pooling temporal ASP (Attentive Statistical Pooling) |
| Parametros totales | 1.684.418 (encoder + cabeza de scoring; excluye pesos del clasificador de entrenamiento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como ventana de tokens; entrada de audio con crops de 90 a 180 frames (1,8 s aprox. en el export TFLite con 180 frames fijos) |
| Tipos de cuantizacion | FP32 e INT8 (exportaciones TFLite `model_fp32.tflite` y `model_int8.tflite`, solo encoder) |
| Idiomas soportados | No disponible (entrenado con LibriSpeech, corpus en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), Flax msgpack (`flax_model.msgpack`), TFLite (FP32/INT8) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ECAPA-TDNN en configuración `small`, con pooling temporal ASP y una cabeza de scoring basada en similitud coseno. La representación de salida es un embedding de locutor de 192 dimensiones. El frontend de audio es propio de FlaxSpeaker (`flaxspeaker.AudioFrontend`): Mel logarítmico natural de 80 dimensiones a 16 kHz, VAD a nivel de frame basado en energía y normalización CMVN; no es un `AutoFeatureExtractor` de Hugging Face. La función de pérdida es GE2E softmax (Wan et al. 2018, Eq. 6) con centroides leave-one-out exactos, complementada con cabezas Dr-Vector y PFAS según los papers de referencia.

El entrenamiento se realizó exclusivamente con LibriSpeech: 232 locutores, 5.788 enunciados, mini-batches de 32 enunciados (8 locutores x 4 enunciados), 2.400 pasos (~13,27 épocas), warmup de 240 pasos y semilla 42, sobre una estación de trabajo CPU. Se usaron crops de longitud variable U(90, 180) frames con máscara de validez exacta. El EER en dominio pasó de 18,03% (1-utt) / 13,40% (3-utt) en el paso 400 a 11,37% / 6,10% en el paso 2.400. La desviación estándar entre semillas 0-2 del EER pooled 1-utt es de 0,08-0,41% absoluto, y el intervalo de confianza bootstrap al 95% con 8.000 ensayos es de ~0,8%. El autor advierte explícitamente que no es una reproducción a gran escala de los papers originales, sino un benchmark de corpus pequeño convergido.

## Capacidades

- Extracción de embeddings de locutor de 192 dimensiones para verificación e identificación.
- Verificación de locutor mediante similitud coseno entre embeddings.
- Identificación de locutor (speaker recognition) comparando contra un conjunto de referencia.
- Scoring con cabezas GE2E (`w,b`), Dr-Vector y PFAS.
- Procesamiento de audio con VAD por energía y CMVN integrados en el frontend.
- Exportación a TFLite (FP32 e INT8) del encoder para inferencia en dispositivos.
- Ejecución en CPU sin GPU (el checkpoint se entrenó en CPU).
- No soporta tool calling, function calling, agentes, visión, audio generativo ni razonamiento multi-step; es un modelo de feature extraction puro.

## Casos de uso

- Verificación biométrica de locutor en aplicaciones de acceso: el modelo genera embeddings de 192 dimensiones y compara con similitud coseno contra un perfil registrado, adecuado por su tamaño reducido y ejecución en CPU.
- Identificación de hablante en reuniones y transcripciones: segmentar audio, extraer embeddings por segmento y agrupar por locutor para diarización ligera en pipelines de transcripción.
- Autenticación de voz en dispositivos embebidos: las exportaciones TFLite INT8 del encoder permiten desplegar la verificación en móviles o hardware de bajo consumo sin GPU.
- Benchmarking reproducible de arquitecturas ECAPA-TDNN: sirve como referencia controlada con métricas archivadas (EER, minDCF, ROC-AUC) para comparar variantes dentro de FlaxSpeaker.
- Investigación en JAX/Flax: al ser una reimplementación desde cero, permite modificar la arquitectura, la pérdida GE2E o el pooling ASP y reentrenar en CPU sobre corpus pequeños.
- Filtrado y deduplicación de datasets de audio: detectar si dos clips pertenecen al mismo locutor para limpiar corpus de entrenamiento o detectar duplicados.
- Prototipado de sistemas de control por voz con verificación de usuario: combinar el embedding de locutor con un ASR para restringir comandos al hablante autorizado.

## Benchmarks y rendimiento

Datos de evaluación publicados por el autor en la model card (LibriSpeech, dominio de entrenamiento):

| Metrica | 1-utt | 3-utt |
|---|---|---|
| EER (paso 400) | 18,03% | 13,40% |
| EER (paso 2000, knee) | 11,47% | 6,70% |
| EER (paso 2400, final) | 11,37% | 6,10% |
| EER Universal Pooled final | 20,05% | 15,77% |

El autor indica que el intervalo de confianza bootstrap al 95% (8.000 ensayos) es de ~0,8% y que la desviación entre semillas 0-2 es de 0,08-0,41% absoluto en EER pooled 1-utt. Como referencia externa, el autor cita que sistemas ECAPA-TDNN publicados entrenados en VoxCeleb2-dev alcanzan ~0,9% EER en VoxCeleb1-O (Desplanques et al., 2020) y sistemas de menos de 1M de parámetros ~2% (Wang et al., EfficientTDNN, 2022); estos valores no son comparables directamente por la diferencia de corpus. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32; el modelo tiene 1.684.418 parámetros (~6,7 MB en FP32).
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es sobrada. El checkpoint se entrenó en CPU.
- Cabe en cualquier GPU consumer y en CPU; también en dispositivos embebidos vía TFLite INT8.
- Opciones de despliegue: biblioteca `flaxspeaker` (PyPI), JAX/Flax con safetensors o msgpack, TFLite (FP32/INT8) para móvil y edge. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | EER referencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ls_ecapa_tdnn_small_ge2e` (este) | 1.684.418 | Audio, crops 90-180 frames | 11,37% (1-utt) / 6,10% (3-utt) en LibriSpeech | Apache 2.0 | Hugging Face, PyPI, GitHub |
| ECAPA-TDNN publicado (Desplanques et al., 2020) | No disponible | Audio | ~0,9% en VoxCeleb1-O | No disponible | Paper |
| EfficientTDNN (Wang et al., 2022) | <1M | Audio | ~2% | No disponible | Paper |
| Modelos de speaker verification en Hugging Face | Variable | Audio | No disponible | Variable | Hugging Face |

La comparación directa no es posible porque los modelos publicados se entrenan en VoxCeleb2-dev (5.994 locutores, ~1,1M enunciados) mientras que este checkpoint usa 232 locutores y 5.788 enunciados. El autor lo presenta como referencia relativa dentro del benchmark FlaxSpeaker, no como alternativa de estado del arte.

## Limitaciones y advertencias

- Entrenado solo con LibriSpeech (inglés, 232 locutores); el rendimiento en otros idiomas, acentos o condiciones acústicas no está evaluado.
- EER absoluto elevado (11,37% 1-utt en dominio) por la baja diversidad de locutores; no apto para producción biométrica real sin reentrenamiento.
- Sesgos de dominio y de locutor derivados del corpus de entrenamiento (lectura de audiolibros, condiciones controladas).
- Riesgo de falsos positivos/negativos en verificación fuera de dominio; el autor advierte que no es una reproducción a gran escala de los papers.
- El frontend de audio es propio de FlaxSpeaker (`flaxspeaker.AudioFrontend`), no un `AutoFeatureExtractor` de Hugging Face; requiere usar la librería para preprocesar correctamente.
- Las exportaciones TFLite son solo del encoder y con 180 frames fijos sin máscara; no cubren la cabeza de scoring completa.
- Licencia Apache 2.0 permite uso comercial, pero el autor declara que no es un producto oficialmente soportado por Google.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes.

## Enlaces

- Hugging Face: https://huggingface.co/wq2012/ls_ecapa_tdnn_small_ge2e
- Colección FlaxSpeaker en Hugging Face: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
