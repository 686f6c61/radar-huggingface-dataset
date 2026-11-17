# wq2012/univ_conformer_small_ge2e_contrast

## Resumen

`univ_conformer_small_ge2e_contrast` es un modelo de extracción de embeddings de locutor (speaker verification y speaker recognition) desarrollado por el usuario wq2012 dentro del proyecto FlaxSpeaker. Se trata de una reimplementación desde cero en JAX/Flax de algoritmos clásicos de reconocimiento de locutor (GE2E, Dr-Vectors, ATP y PFAS), construida únicamente a partir de las publicaciones académicas, sin código ni datos propietarios. El checkpoint es un benchmark de corpus pequeño entrenado hasta convergencia, no una reproducción a gran escala de los resultados de los papers originales.

El modelo emplea un backbone Conformer de tamaño "small" con pooling temporal atento (ATP) y una cabeza de scoring basada en similitud coseno. Genera representaciones de 192 dimensiones a partir de audio de 16 kHz procesado con un frontend de 80 Mel logarítmicas, VAD a nivel de trama y CMVN. Con 2.029.894 parámetros de inferencia, es un modelo extremadamente ligero pensado para comparaciones relativas controladas dentro del ecosistema FlaxSpeaker.

Su relevancia actual es doble: por un lado, ofrece una implementación abierta y reproducible (licencia Apache 2.0) de técnicas de verificación de locutor en el stack JAX/Flax, poco habitual en comparación con las implementaciones en PyTorch; por otro, sirve como punto de referencia de bajo coste computacional para experimentos de investigación en biometría de voz, sin pretensiones de estado del arte.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer (variante small) con pooling temporal atento (ATP) |
| Parámetros totales | 2.029.894 (encoder + cabeza de scoring; excluye pesos de clasificador solo de entrenamiento) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio variable; entrenado con recortes de U(90, 180) tramas) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (entrenado con LibriSpeech, CN-Celeb2 y VoxCeleb1, multilingüe/multidominio) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, flax_model.msgpack (Flax nativo) |

## Arquitectura y entrenamiento

El modelo se basa en un backbone Conformer de configuración "small" con pooling temporal atento (ATP, adaptado de un paper de identificación de idioma). La cabeza de entrenamiento es un objetivo híbrido GE2E contrast: el valor de la pérdida sigue la Eq. 7 de Wan et al., mientras que el gradiente combina 0.25 de la Eq. 7, 0.25 de BCE y 0.50 de entropía cruzada GE2E-softmax, con `ge2e_init_b = -1`. La verificación en inferencia se realiza por similitud coseno sobre embeddings de 192 dimensiones. El frontend de audio es propio de FlaxSpeaker (`AudioFrontend`): 80 Mel logarítmicas naturales a 16 kHz, VAD a nivel de trama y CMVN, y no es un `AutoFeatureExtractor` de Hugging Face.

El entrenamiento se realizó sobre un pool multidominio de 381 locutores y 9.447 utterances (LibriSpeech + CN-Celeb2 + VoxCeleb1), con 4.600 pasos de gradiente, batches de 32 utterances (8 locutores x 4 utterances) y semilla 42, lo que equivale a unas 15,58 épocas. Se usaron recortes de longitud variable U(90, 180) tramas con máscara de validez exacta. El EER agrupado universal evolucionó de 28,52 % (1-utt) / 23,20 % (3-utt) en el paso 400 a 16,56 % / 12,67 % en el paso 4600. La desviación estándar entre semillas 0-2 es de 0,08-0,41 % absoluto y el intervalo de confianza bootstrap del 95 % (8.000 ensayos) tiene una semianchura de ~0,8 %.

## Capacidades

- Extracción de embeddings de locutor de 192 dimensiones a partir de audio de 16 kHz.
- Verificación de locutor (speaker verification) mediante similitud coseno entre embeddings.
- Reconocimiento de locutor (speaker recognition) e identificación en modo cerrado o abierto.
- Procesamiento multidominio: entrenado con datos de inglés (LibriSpeech, VoxCeleb1) y chino (CN-Celeb2).
- Frontend de audio integrado con VAD y CMVN para robustez ante silencios y variaciones de canal.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de extracción de características, no un LLM.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Verificación biométrica de acceso: el modelo genera un embedding del locutor a partir de una muestra de voz y lo compara por coseno con la plantilla registrada, permitiendo autenticación de baja latencia en dispositivos con recursos limitados gracias a sus ~2 M de parámetros.
- Investigación en biometría de voz: sirve como baseline ligero y reproducible en JAX/Flax para comparar variantes de pooling, pérdidas o frontends dentro del benchmark FlaxSpeaker, con métricas EER, minDCF y ROC-AUC ya publicadas.
- Diarización de hablantes en grabaciones cortas: agrupando embeddings por similitud coseno se pueden segmentar conversaciones en reuniones o entrevistas de pocos participantes, aunque la diversidad de locutores del entrenamiento limita la generalización.
- Detección de locutor en contenido multimedia: identificación de si un fragmento de audio pertenece a un locutor de interés en archivos de podcast o archivos de archivo, con umbral ajustable según el EER objetivo.
- Control de calidad de datasets de voz: verificación de que las muestras de un corpus corresponden al locutor declarado, detectando etiquetas erróneas o duplicados mediante comparación de embeddings.
- Prototipado educativo: ejemplo didáctico de implementación completa de GE2E y Conformer en Flax, útil para cursos de aprendizaje profundo aplicado a audio o para validar pipelines de inferencia en CPU.

## Benchmarks y rendimiento

| Métrica | 1-utt (paso 4600) | 3-utt (paso 4600) | 1-utt (paso 400) | 3-utt (paso 400) |
|---|---|---|---|---|
| EER agrupado universal | 16,56 % | 12,67 % | 28,52 % | 23,20 % |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni benchmarks de LLM, al no tratarse de un modelo de lenguaje. La model card incluye además métricas de minDCF, ROC-AUC e intervalos de confianza bootstrap en `eval_results.json`, y una evaluación sobre un subconjunto de 10 locutores de VoxCeleb1-O, pero sus valores numéricos no se detallan en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (2 M de parámetros), por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier RTX 4090, RTX 3090, A100 o H100 puede ejecutarlo, pero el modelo fue entrenado en una estación de trabajo CPU.
- Cabe en GPU consumer: sí, en todas las gamas actuales (GTX 1650, RTX 3060, RTX 4060, etc.) y en dispositivos embebidos con suficiente memoria.
- Opciones de despliegue: JAX/Flax con la librería `flaxspeaker` (PyPI); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | EER (VoxCeleb1-O) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| univ_conformer_small_ge2e_contrast | 2.029.894 | audio variable | 16,56 % (1-utt, corpus propio de 381 locutores) | Apache 2.0 | Hugging Face, PyPI |
| ECAPA-TDNN (Desplanques et al., 2020) | no disponible en la información | audio variable | ~0,9 % (VoxCeleb2-dev) | no disponible en la información | referencia académica |
| EfficientTDNN (Wang et al., 2022) | <1 M | audio variable | ~2 % | no disponible en la información | referencia académica |

La comparación directa no es equivalente: los sistemas ECAPA-TDNN y EfficientTDNN se entrenan sobre VoxCeleb2-dev (5.994 locutores, ~1,1 M utterances), mientras que este checkpoint usa 381 locutores y 9.447 utterances. El propio autor advierte que las cifras no son comparables como estado del arte.

## Limitaciones y advertencias

- No es un producto oficialmente soportado por Google; es una reimplementación independiente.
- Entrenado sobre un corpus pequeño (381 locutores, 9.447 utterances), por lo que el EER absoluto está acotado por la diversidad de locutores y no representa el rendimiento en producción a gran escala.
- Riesgo de sesgo demográfico y de canal: la distribución de locutores de LibriSpeech, CN-Celeb2 y VoxCeleb1 no cubre toda la variabilidad de edad, género, acento o condición de grabación.
- Riesgo de falsos positivos en verificación cuando el audio de consulta difiere del dominio de entrenamiento (ruido, códec, micrófono).
- Sin soporte documentado de cuantización ni de despliegue en frameworks generativos; requiere el stack JAX/Flax y la librería `flaxspeaker`.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de rendimiento ni de idoneidad para aplicaciones biométricas reales.
- El frontend de audio es propio y no es un `AutoFeatureExtractor` de Hugging Face, lo que complica la integración con pipelines estándar de `transformers`.
- No hay información sobre idiomas soportados más allá de los presentes en los datasets de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/wq2012/univ_conformer_small_ge2e_contrast
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
