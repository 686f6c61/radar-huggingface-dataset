# wq2012/univ_resnet_small_ge2e

## Resumen

`univ_resnet_small_ge2e` es un modelo de extracción de embeddings de hablante (speaker verification y speaker recognition) desarrollado por el usuario `wq2012` como parte del proyecto FlaxSpeaker. Se trata de una reimplementación desde cero en JAX/Flax, basada exclusivamente en artículos publicados, de los algoritmos GE2E, Dr-Vectors, ATP y PFAS. El modelo resuelve el problema de generar representaciones vectoriales de 192 dimensiones que identifican la identidad de un hablante a partir de audio, permitiendo tareas de verificación (¿son la misma persona?) e identificación (¿quién habla?).

Arquitectónicamente es una ResNet de tamaño "small" con pooling temporal atencional (`asp`), entrenada con la función de pérdida GE2E softmax con centroides leave-one-out exactos y evaluada mediante similitud coseno. El checkpoint es deliberadamente pequeño: 2.243.904 parámetros totales según los pesos en safetensors (2.239.922 parámetros de inferencia según la model card, excluyendo el clasificador de entrenamiento). El frontend de audio es un Mel logarítmico natural de 80 dimensiones a 16 kHz con VAD por energía de frame y CMVN, implementado en la propia librería `flaxspeaker` y no como `AutoFeatureExtractor` de Hugging Face.

Es relevante ahora como referencia reproducible y ligera para experimentación controlada en verificación de hablante: el autor advierte explícitamente que no es un modelo de estado del arte, sino un checkpoint de convergencia sobre un corpus pequeño de 381 hablantes (9.447 utterances) que sirve para comparaciones relativas dentro del benchmark FlaxSpeaker. La licencia Apache 2.0 y el formato safetensors facilitan su integración en pipelines de investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNet (small) con pooling temporal atencional (`asp`) |
| Parámetros totales | 2.243.904 (safetensors); 2.239.922 de inferencia (encoder + cabeza de scoring) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (audio); crops de entrenamiento de 90 a 180 frames |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (el modelo es independiente del idioma a nivel de embedding, pero no se documenta) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, flax_model.msgpack (Flax Msgpack nativo) |

## Arquitectura y entrenamiento

El modelo es una ResNet de tamaño "small" que procesa features Mel de 80 dimensiones a 16 kHz, con VAD por energía de frame y normalización CMVN. La cabeza de pooling es atencional (`asp`, attentive temporal pooling), una técnica importada de un artículo de identificación de idioma (ATP). La salida es un embedding de 192 dimensiones. La función de pérdida es GE2E softmax (Wan et al. 2018, Eq. 6) con centroides leave-one-out exactos, y la verificación se realiza por similitud coseno. El modelo incorpora además componentes de Dr-Vectors (redes residuales de decisión) y PFAS (scoring atencional sin parámetros) según la model card.

El entrenamiento se realizó sobre un pool multi-dominio de 381 hablantes y 9.447 utterances proveniente de LibriSpeech, CN-Celeb2 y VoxCeleb1, con mini-batches de 32 utterances (8 hablantes x 4 utterances) durante 4.600 pasos de gradiente (~15.58 épocas), semilla 42, en una estación de trabajo CPU. Se usaron crops de longitud variable `U(90, 180)` frames con máscara de validez exacta. El EER agrupado universal pasó de 29,20% (1-utt) / 24,90% (3-utt) en el paso 400 a 16,79% (1-utt) / 12,57% (3-utt) en el paso 4600. La desviación estándar entre semillas 0-2 es de 0,08-0,41% absoluto en EER 1-utt agrupado, y el intervalo de confianza bootstrap del 95% con 8.000 ensayos tiene una semianchura de ~0,8%.

## Capacidades

- Extracción de embeddings de hablante de 192 dimensiones a partir de audio.
- Verificación de hablante (speaker verification) mediante similitud coseno entre embeddings.
- Identificación de hablante (speaker recognition) comparando contra un conjunto de embeddings de referencia.
- Scoring atencional sin parámetros (PFAS) para comparación de pares.
- Procesamiento multi-dominio: entrenado con datos de LibriSpeech, CN-Celeb2 y VoxCeleb1.
- Frontend de audio integrado: Mel logarítmico natural de 80 dimensiones, VAD por energía y CMVN.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- Capacidades multilingües no documentadas explícitamente; el embedding de hablante es en principio independiente del contenido lingüístico.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Verificación biométrica de locutor en aplicaciones de control de acceso: el modelo genera un embedding de 192 dimensiones por utterance y se compara por similitud coseno contra el embedding de referencia del usuario registrado, con un umbral calibrado sobre el EER del dominio objetivo.
- Identificación de hablante en grabaciones de reuniones: se extraen embeddings por segmento y se agrupan por similitud para atribuir intervenciones a participantes conocidos, aprovechando el frontend VAD integrado para segmentar por actividad de voz.
- Investigación reproducible en verificación de hablante: sirve como baseline ligero de 2,24M parámetros para comparar variantes de pooling, pérdida o frontend dentro del benchmark FlaxSpeaker, con métricas EER, minDCF y ROC-AUC ya publicadas en `eval_results.json`.
- Detección de suplantación o duplicados en catálogos de audio: comparar embeddings de fragmentos para detectar si dos archivos corresponden al mismo locutor, útil en tareas de deduplicación de corpus.
- Análisis forense de audio a pequeña escala: agrupar segmentos de una grabación por locutor para separar voces en un entorno con recursos computacionales limitados, dado que el modelo cabe en CPU.
- Prototipado educativo y docencia: al ser una reimplementación JAX/Flax desde cero con licencia Apache 2.0 y pesos en safetensors, es adecuado para enseñar el pipeline completo de verificación de hablante (frontend, encoder, pooling, pérdida y scoring).
- Integración en pipelines de diarización ligera: como componente de embedding dentro de un sistema de clustering de locutores, siempre que se acepte su EER de referencia (~16,79% 1-utt en el corpus de benchmark).

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el corpus de benchmark multi-dominio de 381 hablantes (9.447 utterances):

| Métrica | Paso 400 | Paso 4000 (knee) | Paso 4600 (final) |
|---|---|---|---|
| EER universal 1-utt | 29,20% | 17,00% | 16,79% |
| EER universal 3-utt | 24,90% | 12,83% | 12,57% |

La model card indica además que se incluyen en `eval_results.json` métricas de EER 1-utt y 3-utt, minDCF, ROC-AUC, intervalos de confianza bootstrap del 95% y un subconjunto de 10 hablantes de VoxCeleb1-O, pero no se proporcionan los valores numéricos concretos de minDCF ni ROC-AUC en la información disponible.

Como referencia contextual citada por el autor (no son resultados de este modelo): sistemas ECAPA-TDNN entrenados en VoxCeleb2-dev alcanzan ~0,9% EER en la lista completa VoxCeleb1-O (Desplanques et al., 2020), y sistemas de menos de 1M de parámetros ~2% (Wang et al., EfficientTDNN, 2022).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 2,24M de parámetros, los pesos en fp32 ocupan ~9 MB, por lo que el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; el entrenamiento se realizó en CPU. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es sobradamente suficiente para inferencia.
- Cabe en GPU consumer: sí, en todas las GPU modernas e incluso en CPU y dispositivos embebidos.
- Opciones de despliegue: la librería `flaxspeaker >= 0.5.0` (PyPI) es la vía oficial, con carga desde Hugging Face Hub o directorio local. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de audio).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | EER de referencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `univ_resnet_small_ge2e` | 2,24M | Audio 16 kHz, crops 90-180 frames | 16,79% (1-utt) / 12,57% (3-utt) en corpus de 381 hablantes | Apache 2.0 | Hugging Face |
| ECAPA-TDNN (Desplanques et al., 2020) | No disponible en la información | Audio | ~0,9% en VoxCeleb1-O completo | No disponible | Referencia bibliográfica |
| EfficientTDNN (Wang et al., 2022) | <1M | Audio | ~2% en VoxCeleb1-O | No disponible | Referencia bibliográfica |

La comparación directa no es equitativa: los dos sistemas de referencia se entrenaron sobre VoxCeleb2-dev (5.994 hablantes, ~1,1M utterances), mientras que este checkpoint se entrenó sobre 381 hablantes y 9.447 utterances. El autor lo indica explícitamente y desaconseja usar este modelo como estado del arte.

## Limitaciones y advertencias

- No es un producto oficialmente soportado por Google; es una reimplementación independiente.
- El EER absoluto está limitado por la diversidad de hablantes del corpus de entrenamiento (381 hablantes), muy inferior a los benchmarks industriales con miles de hablantes.
- El modelo está entrenado a convergencia sobre un corpus pequeño; no debe interpretarse como reproducción a gran escala de los resultados de los artículos originales.
- Riesgo de sesgo por la composición del corpus (LibriSpeech, CN-Celeb2, VoxCeleb1): el rendimiento puede degradarse en dominios, idiomas, acentos o condiciones acústicas no representados.
- No se documentan sesgos demográficos específicos (género, edad, etnia) ni evaluaciones de equidad.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos/negativos en la verificación según el umbral elegido; se recomienda calibrar con el EER del dominio objetivo.
- El frontend de audio no es un `AutoFeatureExtractor` de Hugging Face, por lo que no se puede usar con pipelines estándar de Transformers; requiere `flaxspeaker`.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y recomienda no usarlo como sistema de producción de alta seguridad sin validación adicional.
- La información sobre cuantización e idiomas soportados no está disponible.
- El checkpoint fue creado y actualizado en fechas futuras según los metadatos (2026), lo que puede indicar inconsistencias en el registro del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/univ_resnet_small_ge2e
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- GE2E (arXiv:1710.10467): https://arxiv.org/abs/1710.10467
- Dr-Vectors (arXiv:2104.01989): https://arxiv.org/abs/2104.01989
- ATP (arXiv:2202.12163): https://arxiv.org/abs/2202.12163
- PFAS (arXiv:2203.05642): https://arxiv.org/abs/2203.05642
