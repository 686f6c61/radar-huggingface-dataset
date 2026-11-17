# wq2012/ls_conformer_tiny_ge2e

## Resumen

`ls_conformer_tiny_ge2e` es un modelo de extracción de embeddings de locutor (speaker embeddings) desarrollado por el usuario `wq2012` como parte del proyecto FlaxSpeaker, una reimplementación desde cero en JAX/Flax de algoritmos de reconocimiento de locutor descritos en la literatura científica. El modelo resuelve la tarea de verificación e identificación de locutor: dado un fragmento de audio, produce un vector de 128 dimensiones que representa la identidad vocal, permitiendo comparar dos audios mediante similitud coseno para determinar si pertenecen a la misma persona.

Arquitectura Conformer en variante "tiny" con pooling temporal atento (ATP) y objetivo de entrenamiento GE2E softmax, con solo 693.124 parámetros en inferencia (encoder más cabeza de scoring). Está entrenado exclusivamente sobre LibriSpeech (232 locutores, 5.788 enunciados) durante 2.400 pasos, lo que lo convierte en un checkpoint de referencia para comparaciones relativas dentro del benchmark FlaxSpeaker, no en un modelo de producción a gran escala.

Su relevancia actual es doble: por un lado, ofrece una implementación limpia y reproducible en JAX/Flax de técnicas clásicas (GE2E, Dr-Vectors, ATP, PFAS) bajo licencia Apache 2.0; por otro, su tamaño extremadamente reducido lo hace útil como banco de pruebas controlado para experimentación académica y para validar pipelines de verificación de locutor antes de escalar a modelos mayores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (variante tiny) con pooling temporal atento (ATP) |
| Parametros totales | 693.124 (encoder + cabeza de scoring; excluye pesos del clasificador de entrenamiento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (audio; crops de entrenamiento de 90 a 180 frames) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo extrae embeddings de locutor, no transcribe idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, Flax msgpack (`flax_model.msgpack`) |
| Dimension del embedding | 128 |
| Frecuencia de muestreo | 16.000 Hz |
| Frontend de audio | Mel logarítmico natural de 80 dimensiones + VAD por energía a nivel de frame + CMVN |
| Objetivo de entrenamiento | GE2E softmax (Wan et al. 2018, Eq. 6, centroides leave-one-out exactos) |
| Scorer de verificacion | Similitud coseno |
| Datos de entrenamiento | LibriSpeech (232 locutores, 5.788 enunciados) |
| Pasos de entrenamiento | 2.400 pasos, batch de 32 enunciados (~13,27 épocas), semilla 42 |
| Libreria | flaxspeaker >= 0.5.0 |

## Arquitectura y entrenamiento

El modelo emplea un backbone Conformer en configuración "tiny", una arquitectura que combina convoluciones y auto-atención para capturar dependencias locales y globales en secuencias de audio. Sobre el encoder se aplica un pooling temporal atento (Attentive Temporal Pooling, ATP), técnica tomada del paper de identificación de idioma de Wang et al. (arXiv:2202.12163), que agrega la secuencia de frames en un único vector de 128 dimensiones. La verificación se realiza con similitud coseno entre embeddings, y el entrenamiento usa la pérdida GE2E softmax con centroides leave-one-out exactos, según la formulación de Wan et al. (arXiv:1710.10467).

El entrenamiento se llevó a cabo sobre LibriSpeech únicamente, con 232 locutores y 5.788 enunciados, durante 2.400 pasos de gradiente con batches de 32 enunciados (8 locutores x 4 enunciados), lo que equivale a aproximadamente 13,27 épocas, con una semilla fija (42) y en una estación de trabajo con CPU. Se usaron crops de longitud variable U(90, 180) frames con máscara de validez exacta. El autor documenta explícitamente que este checkpoint es una reproducción a pequeña escala: los papers originales se ejecutaron sobre infraestructura y datos internos de Google, y este modelo no reproduce sus resultados a gran escala. La desviación estándar de EER entre semillas 0-2 es de 0,08-0,41 % absoluto, y el intervalo de confianza bootstrap al 95 % con 8.000 ensayos tiene una semianchura de ~0,8 %.

## Capacidades

- Extracción de embeddings de locutor de 128 dimensiones a partir de audio a 16 kHz.
- Verificación de locutor (1:1): comparación de dos audios mediante similitud coseno para decidir si pertenecen al mismo hablante.
- Identificación de locutor (1:N): comparación contra un conjunto de embeddings de referencia.
- Evaluación multi-utterance: soporta modos de 1 utterance y 3 utterances (promediado de embeddings), con mejor rendimiento en el segundo caso.
- Evaluación multi-dominio: incluye métricas sobre LibriSpeech, CN-Celeb y VoxCeleb (subconjunto VoxCeleb1-O de 10 locutores).
- Métricas de evaluación integradas: EER, minDCF y ROC-AUC con intervalos de confianza bootstrap.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de feature extraction de audio, no un LLM.
- No soporta generación de texto, código, matemáticas ni visión.
- Capacidades multilingües: no documentadas; el modelo no modela idioma, solo identidad vocal.

## Casos de uso

- Verificación biométrica de locutor en prototipos: el modelo permite construir un pipeline de autenticación por voz comparando el embedding del audio entrante con el embedding de referencia del usuario mediante similitud coseno, útil para validar la viabilidad de un sistema antes de invertir en modelos mayores.
- Benchmark de referencia para investigación en JAX/Flax: al ser una reimplementación limpia y reproducible con semilla fija y fingerprints de step-0, sirve como punto de control para comparar nuevas variantes de pooling, pérdidas o arquitecturas dentro del ecosistema FlaxSpeaker.
- Segmentación y diarización de audio en entornos controlados: los embeddings de 128 dimensiones pueden agruparse por similitud para separar locutores en grabaciones con pocos hablantes, siempre que las condiciones acústicas se aproximen al dominio de entrenamiento.
- Detección de cambios de locutor en streams de audio: con un frontend de VAD por energía y embeddings ligeros, el modelo puede ejecutarse en tiempo real en CPU para marcar transiciones de hablante en un flujo continuo.
- Validación de pipelines de preprocesado de audio: el modelo es sensible a la configuración del frontend (Mel de 80 dimensiones, VAD, CMVN), por lo que resulta útil para verificar que un pipeline de extracción de características está correctamente implementado antes de usarlo con modelos de producción.
- Educación y reproducción de papers: al implementar GE2E, Dr-Vectors, ATP y PFAS desde cero, el checkpoint permite a estudiantes e investigadores reproducir y entender estas técnicas sin depender de código propietario ni de datos internos.
- Pruebas de integración en CI/CD para sistemas de voz: su reducido tamaño (693.124 parámetros) y su licencia Apache 2.0 lo hacen adecuado como modelo de humo en tests automatizados de pipelines de audio, sin coste de GPU.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a EER sobre el corpus de entrenamiento (LibriSpeech, in-domain), en modos de 1 y 3 utterances:

| Punto de entrenamiento | EER 1-utt | EER 3-utt |
|---|---|---|
| Paso 400 | 18,80 % | 14,80 % |
| Paso 2.000 (knee) | 11,13 % | 5,30 % |
| Paso 2.400 (final) | 11,07 % | 6,30 % |
| Universal Pooled final | 19,76 % | 15,73 % |

El autor indica que el modelo alcanza su meseta de convergencia en este corpus pequeño de 232 locutores y que los EER absolutos están limitados por la diversidad de locutores en entrenamiento. Como referencia orientativa, cita que sistemas ECAPA-TDNN entrenados sobre VoxCeleb2-dev alcanzan ~0,9 % EER en VoxCeleb1-O completo (Desplanques et al., 2020) y que sistemas de menos de 1M de parámetros alcanzan ~2 % (Wang et al., EfficientTDNN, 2022). El repositorio incluye `eval_results.json` con métricas multi-dominio (LibriSpeech, CN-Celeb, VoxCeleb, subconjunto VoxCeleb1-O de 10 locutores) que no se detallan en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 693.124 parámetros en fp32, los pesos ocupan aproximadamente 2,8 MB, por lo que el modelo cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) puede ejecutarlo, pero el cuello de botella será el frontend de audio, no el modelo.
- Cabe en GPU consumer: sí, en cualquier GPU consumer e incluso en dispositivos de bajos recursos.
- Opciones de despliegue: la librería `flaxspeaker` (>= 0.5.0) sobre JAX/Flax; el checkpoint se distribuye en safetensors y msgpack nativo de Flax. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | EER de referencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ls_conformer_tiny_ge2e` | 693.124 | Audio 16 kHz, crops 90-180 frames | 11,07 % (1-utt) / 6,30 % (3-utt) in-domain LibriSpeech | Apache 2.0 | Hugging Face + PyPI |
| ECAPA-TDNN (Desplanques et al., 2020) | No disponible en la información | Audio | ~0,9 % en VoxCeleb1-O | No disponible en la información | Referencia bibliográfica |
| EfficientTDNN (Wang et al., 2022) | < 1M | Audio | ~2 % | No disponible en la información | Referencia bibliográfica |

La comparación directa no es posible porque los modelos de referencia se entrenaron sobre VoxCeleb2-dev (5.994 locutores, ~1,1M enunciados), mientras que este checkpoint se entrenó sobre 232 locutores. El autor advierte explícitamente que las comparaciones deben hacerse dentro del benchmark FlaxSpeaker y no contra el estado del arte.

## Limitaciones y advertencias

- Entrenado sobre un corpus muy pequeño (232 locutores, 5.788 enunciados): la diversidad de locutores limita el EER absoluto y la generalización a dominios acústicos distintos de LibriSpeech.
- No es una reproducción a gran escala de los papers originales; el autor lo describe como un checkpoint de benchmark de corpus pequeño convergido, no como un modelo de producción.
- El EER in-domain final (11,07 % en 1-utt) está muy lejos de sistemas industriales (~0,9 % en VoxCeleb1-O), por lo que no debe usarse como sistema de verificación biométrica en producción sin un reentrenamiento sustancial.
- El frontend de audio no es un `AutoFeatureExtractor` de Hugging Face: requiere `flaxspeaker.AudioFrontend` con configuración específica (Mel de 80 dimensiones, VAD por energía, CMVN); un preprocesado distinto degradará los resultados.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de falsos positivos/negativos en la verificación de locutor, especialmente con audio ruidoso o fuera de dominio.
- Sesgos conocidos: no documentados explícitamente; al entrenarse solo con LibriSpeech, es probable un sesgo hacia las características demográficas y acústicas de ese corpus (inglés leído, condiciones de grabación específicas).
- Limitaciones de idioma: no se documenta soporte multilingüe; el modelo no está validado en idiomas distintos del inglés de LibriSpeech.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor declara que no es un producto oficialmente soportado por Google y desaconseja su uso como sistema de producción.
- La reproducibilidad depende de la semilla (42) y de la configuración exacta del pipeline; el autor documenta fingerprints de step-0 para verificar la coincidencia del código.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/ls_conformer_tiny_ge2e
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
