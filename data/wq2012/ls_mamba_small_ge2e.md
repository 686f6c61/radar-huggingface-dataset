# wq2012/ls_mamba_small_ge2e

## Resumen

`ls_mamba_small_ge2e` es un extractor de embeddings de locutor (speaker embeddings) de 192 dimensiones desarrollado por el usuario `wq2012` como parte de la biblioteca `FlaxSpeaker`, una reimplementación desde cero en JAX/Flax de algoritmos de verificación de locutor descritos en la literatura pública. El modelo resuelve la tarea de *feature extraction* de audio: convierte una grabación de voz en un vector que permite comparar locutores mediante similitud de coseno, lo que habilita tareas de verificación e identificación de hablante.

La arquitectura combina un backbone Mamba (variante "small") con pooling temporal de tipo ASP (attentive statistical pooling), un objetivo de entrenamiento GE2E softmax con centroides leave-one-out exactos y un scorer de verificación basado en similitud de coseno. Con aproximadamente 1,03 millones de parámetros de inferencia (encoder más cabeza de scoring), es un modelo deliberadamente minúsculo, pensado como punto de referencia dentro de un benchmark controlado más que como sistema de producción.

Su relevancia es metodológica: se trata de un checkpoint entrenado hasta convergencia sobre un corpus pequeño y autocontenido (LibriSpeech, 232 locutores, 5.788 enunciados) con licencia Apache 2.0, lo que lo hace reproducible y útil para comparaciones relativas entre variantes arquitectónicas dentro de FlaxSpeaker. El autor advierte explícitamente que no es una reproducción a gran escala de los resultados de los papers originales ni un modelo de estado del arte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (variante small) con pooling temporal ASP |
| Parametros totales | 1.028.674 (encoder + cabeza de scoring; excluye pesos del clasificador de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa recortes de audio de 90 a 180 frames) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de audio, independiente del idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y Flax msgpack (`flax_model.msgpack`) |

## Arquitectura y entrenamiento

El modelo usa un backbone Mamba en configuración "small" como extractor de características acústicas, alimentado por un frontend de audio propio de la biblioteca `flaxspeaker.AudioFrontend`: Mel logarítmico natural de 80 dimensiones a 16 kHz, VAD a nivel de frame basado en energía y normalización CMVN. No emplea un `AutoFeatureExtractor` de Hugging Face. Sobre las representaciones del backbone se aplica un pooling temporal ASP (attentive statistical pooling, adaptado de un trabajo de identificación de idioma) que produce el embedding final de 192 dimensiones.

El entrenamiento usa el objetivo GE2E softmax (Wan et al. 2018, ecuación 6) con centroides leave-one-out exactos y se ejecutó durante 2.400 pasos de gradiente con mini-batches de 32 enunciados (8 locutores x 4 enunciados), lo que equivale a unas 13,27 épocas sobre 5.788 enunciados de 232 locutores de LibriSpeech, con semilla 42 y sobre una estación de trabajo con CPU. Los recortes de audio son de longitud variable U(90, 180) frames con máscara de validez exacta. El autor documenta la progresión de EER in-domain: 21,50 % (1-utt) en el paso 400, 14,00 % en el paso 2000 y 14,43 % (1-utt) / 10,40 % (3-utt) en el paso final 2400.

## Capacidades

- Extracción de embeddings de locutor de 192 dimensiones a partir de audio.
- Verificación de locutor (1:1) mediante similitud de coseno entre embeddings.
- Identificación de locutor (1:N) por comparación contra un conjunto de referencia.
- Scoring con cabeza PFAS (parameter-free attentive scoring) y variantes Dr-Vector incluidas en los pesos.
- Procesamiento de audio con VAD y CMVN integrados en el frontend.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No es un modelo generativo: no produce texto ni transcripciones.
- Capacidades multilingües: no documentadas; al ser un modelo acústico de locutor, en principio es independiente del idioma, pero no hay evaluación que lo confirme.

## Casos de uso

- Verificación biométrica de voz en prototipos: comparar el embedding de una muestra contra el de un locutor registrado mediante coseno, con la advertencia de que el EER in-domain ronda el 14 % (1-utt), adecuado solo para pruebas de concepto.
- Benchmark de arquitecturas de reconocimiento de locutor: servir como línea base Mamba "small" dentro de la suite FlaxSpeaker para comparar contra variantes Conformer, ECAPA o TDNN bajo el mismo pipeline de evaluación.
- Docencia e investigación reproducible: el checkpoint y la librería permiten reproducir el entrenamiento completo en CPU, algo inviable con modelos entrenados sobre VoxCeleb2.
- Segmentación y diarización experimental: usar los embeddings como features para agrupar segmentos de audio por locutor en pipelines de investigación.
- Filtrado de audio por locutor en conjuntos de datos: descartar o agrupar grabaciones según la similitud de sus embeddings antes de un etiquetado manual.
- Validación de pipelines de audio en JAX/Flax: probar el frontend (Mel 80 dims, VAD, CMVN) y el flujo de inferencia en entornos JAX antes de escalar a modelos mayores.
- Pruebas de regresión de software: el autor incluye huellas de pérdida en el paso 0 y scripts de fingerprint para verificar que cambios de código no alteran los resultados.

## Benchmarks y rendimiento

Resultados reportados por el autor en `eval_results.json` (EER in-domain sobre LibriSpeech):

| Metrica | Paso 400 | Paso 2000 | Paso 2400 (final) |
|---|---|---|---|
| EER 1-utt | 21,50 % | 14,00 % | 14,43 % |
| EER 3-utt | 18,20 % | 10,50 % | 10,40 % |
| EER pooled 1-utt (Universal Pooled final) | no disponible | no disponible | 21,38 % |
| EER pooled 3-utt (Universal Pooled final) | no disponible | no disponible | 17,63 % |

El autor indica además una desviación estándar entre semillas 0-2 de 0,08-0,41 % absoluto en EER pooled 1-utt y un intervalo de confianza bootstrap del 95 % (8.000 ensayos) de aproximadamente ±0,8 %. Como referencia externa cita ECAPA-TDNN sobre VoxCeleb2-dev (~0,9 % EER en VoxCeleb1-O) y sistemas de menos de 1M de parámetros (~2 % EER, EfficientTDNN 2022), sin que sean comparables directamente por la diferencia de corpus. No se publican resultados de MMLU, HumanEval ni GSM8K por no ser un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 1,03 M de parámetros en fp32 los pesos ocupan aproximadamente 4 MB, y el consumo lo domina el frontend de audio y los buffers de activación.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria sirve; el autor entrenó y evaluó en CPU.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090) e incluso en Raspberry Pi o entornos CPU-only.
- Opciones de despliegue: la librería `flaxspeaker >= 0.5.0` (JAX/Flax) es la vía oficial; los pesos safetensors y msgpack permiten cargarlos con Flax directamente. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un modelo de 1 M de parámetros, la latencia vendrá determinada casi por completo por la extracción de features de audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | EER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ls_mamba_small_ge2e` | ~1,03 M | recortes de 90-180 frames | 14,43 % (1-utt) / 10,40 % (3-utt) in-domain | Apache 2.0 | Hugging Face |
| ECAPA-TDNN (Desplanques et al. 2020) | ~20 M (típico) | audio variable | ~0,9 % en VoxCeleb1-O | según implementación | múltiples implementaciones |
| EfficientTDNN (Wang et al. 2022) | <1 M | audio variable | ~2 % | según implementación | paper |
| Otros checkpoints FlaxSpeaker (p. ej. variantes Conformer) | no disponible | recortes de 90-180 frames | no disponible en esta ficha | Apache 2.0 | colección FlaxSpeaker |

La comparación directa no es válida en términos absolutos: los sistemas ECAPA-TDNN y EfficientTDNN se entrenan sobre VoxCeleb2-dev (5.994 locutores, ~1,1 M enunciados), mientras que este checkpoint usa 232 locutores y 5.788 enunciados. La comparación pertinente es relativa, dentro de la suite FlaxSpeaker.

## Limitaciones y advertencias

- EER absoluto alto (14,43 % 1-utt in-domain) por la baja diversidad de locutores del entrenamiento; no apto para producción biométrica.
- El autor declara explícitamente que no es un producto soportado por Google y que no reproduce los resultados a gran escala de los papers.
- Sesgos demográficos, de acento y de canal no evaluados; el corpus LibriSpeech es audio de lectura en inglés, lo que puede degradar el rendimiento en habla espontánea, telefónica o ruidosa.
- Riesgo de sobreajuste al dominio LibriSpeech; las métricas fuera de dominio (VoxCeleb1-O con subconjunto de 10 locutores) no se detallan en esta ficha.
- El frontend de audio es propio de `flaxspeaker` y no un `AutoFeatureExtractor` estándar, lo que complica la integración con pipelines de Hugging Face.
- Requiere `flaxspeaker >= 0.5.0`; la API de carga no es la convencional de `transformers`.
- Licencia Apache 2.0 permite uso comercial, pero el propio autor desaconseja implícitamente el uso en producción por las limitaciones de rendimiento.
- Sin datos publicados sobre cuantización, lo que limita optimizaciones de despliegue en edge.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/ls_mamba_small_ge2e
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- GE2E, Generalized End-to-End Loss for Speaker Verification: https://arxiv.org/abs/1710.10467
- Dr-Vectors, Decision Residual Networks and an Improved Loss for Speaker Recognition: https://arxiv.org/abs/2104.01989
- Attentive Temporal Pooling for Conformer-based Streaming Language Identification: https://arxiv.org/abs/2202.12163
- PFAS, Parameter-Free Attentive Scoring for Speaker Verification: https://arxiv.org/abs/2203.05642
