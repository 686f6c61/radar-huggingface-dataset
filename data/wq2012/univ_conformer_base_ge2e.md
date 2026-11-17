# wq2012/univ_conformer_base_ge2e

## Resumen

`univ_conformer_base_ge2e` es un modelo de extracción de embeddings de locutor (speaker verification y speaker recognition) desarrollado por el usuario wq2012 dentro del proyecto FlaxSpeaker. Se trata de una reimplementación desde cero en JAX/Flax, basada únicamente en artículos publicados, de los algoritmos de reconocimiento de locutor GE2E, Dr-Vectors, ATP y PFAS. El modelo no es un producto oficial de Google y sus resultados no reproducen los experimentos a gran escala de los papers originales.

La arquitectura combina un backbone Conformer de tamano `base` con pooling temporal atentivo (ATP), una cabeza de clasificación GE2E softmax y scoring por similitud coseno. El modelo produce representaciones de 256 dimensiones y cuenta con 4.551.558 parámetros de inferencia (encoder más cabeza de scoring, excluyendo los pesos del clasificador usados solo en entrenamiento). El checkpoint se ha entrenado hasta convergencia sobre un corpus controlado de 381 locutores y 9.447 enunciados, procedente de LibriSpeech, CN-Celeb2 y VoxCeleb1.

Es relevante como referencia reproducible y ligera para experimentación con verificación de locutor en JAX/Flax, y como punto de comparación controlado dentro del benchmark de FlaxSpeaker. No debe confundirse con un sistema de reconocimiento de locutor de nivel industrial: sus EER absolutos están acotados por la diversidad de locutores del corpus de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (`base`) con pooling temporal atentivo (ATP) |
| Parametros totales | 4.551.558 (encoder + cabeza de scoring; excluye pesos del clasificador de entrenamiento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrada de audio con recortes variables de `U(90, 180)` frames durante entrenamiento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (multidominio: LibriSpeech, CN-Celeb2, VoxCeleb1) |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors (`model.safetensors`) y Flax Msgpack (`flax_model.msgpack`) |
| Dimension de embedding de salida | 256 |
| Objetivo de entrenamiento | GE2E softmax (Wan et al. 2018, Eq. 6; centroides leave-one-out exactos) |
| Scorer de verificacion | Similitud coseno |
| Frontend de audio | Mel log-natural de 80 dimensiones a 16.000 Hz + VAD por energia a nivel de frame + CMVN (`flaxspeaker.AudioFrontend`) |
| Libreria | `flaxspeaker >= 0.5.0` |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modelo usa un backbone Conformer de configuracion `base` para extraer representaciones acústicas a partir de features Mel de 80 dimensiones a 16 kHz, con VAD por energía a nivel de frame y normalización CMVN. Sobre la secuencia del encoder se aplica un pooling temporal atentivo (ATP), tomado del paper de identificación de idioma de referencia, que agrega la información temporal en un vector de embedding de 256 dimensiones. La verificación se realiza por similitud coseno entre embeddings.

El entrenamiento emplea la pérdida GE2E softmax con centroides leave-one-out exactos, junto con componentes de Dr-Vectors y PFAS. Se entrenó durante 4.600 pasos de gradiente con minibatches de 32 enunciados (8 locutores x 4 enunciados), lo que equivale a unas 15,58 épocas sobre 9.447 enunciados de 381 locutores, con semilla 42 y warmup de 460 pasos, en una estación de trabajo con CPU. Se usaron recortes de longitud variable `U(90, 180)` frames con máscara de validez exacta. El EER agrupado evolucionó de 25,20 % (1 utt) / 22,27 % (3 utt) en el paso 400 a 17,90 % (1 utt) / 14,40 % (3 utt) en el paso 4.600. La desviación estándar entre semillas 0-2 del EER agrupado a 1 utt es de 0,08-0,41 % absoluto, y el intervalo de confianza bootstrap al 95 % con 8.000 ensayos tiene una semianchura de aproximadamente 0,8 %.

## Capacidades

- Extracción de embeddings de locutor de 256 dimensiones a partir de audio.
- Verificación de locutor (speaker verification) mediante similitud coseno entre embeddings.
- Reconocimiento de locutor (speaker recognition) e identificación dentro de un conjunto cerrado de locutores.
- Entrenamiento multidominio sobre inglés (LibriSpeech, VoxCeleb1) y chino (CN-Celeb2).
- Evaluación con métricas EER, minDCF y ROC-AUC, con intervalos de confianza bootstrap.
- Uso como extractor de features en pipelines de audio (`pipeline_tag: feature-extraction`).
- No soporta tool calling, function calling, agentes, visión, audio generativo ni razonamiento multi-step; es un modelo puramente discriminativo de audio.

## Casos de uso

- Verificación biométrica de locutor en aplicaciones de control de acceso: se compara el embedding de una muestra de voz con el embedding de referencia del usuario mediante similitud coseno, con un umbral calibrado a partir de las métricas EER publicadas.
- Investigación reproducible en JAX/Flax: sirve como checkpoint de referencia para comparar variantes de arquitectura (Conformer vs. otras), pooling (ATP vs. estadísticas) o funciones de pérdida (GE2E vs. Dr-Vectors) dentro del benchmark FlaxSpeaker.
- Detección de duplicados o clustering de hablantes en archivos de audio: agrupando embeddings por similitud coseno se pueden separar intervenciones de distintos locutores en grabaciones multidominio.
- Segmentación y diarización básica de reuniones o entrevistas: combinado con un VAD y un algoritmo de clustering, permite asignar turnos de palabra a locutores en audio en inglés o chino.
- Filtrado de calidad en datasets de voz: comparar el embedding de cada clip con la referencia del locutor declarado para detectar etiquetas erróneas o clips corruptos antes de entrenar otros modelos.
- Prototipado educativo de sistemas de reconocimiento de locutor: el tamano reducido (4,5 M parámetros, repo de 0,1 GB) y la licencia Apache 2.0 permiten desplegarlo en entornos docentes o de investigación sin infraestructura GPU dedicada.
- Pruebas de integración en pipelines de audio con JAX: al exponer los pesos en SafeTensors y Msgpack, se puede integrar en servicios de extracción de features dentro de arquitecturas JAX existentes.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el corpus de evaluación multidominio (381 locutores, 9.447 enunciados):

| Metrica | Paso 400 | Paso 4000 (knee) | Paso 4600 (final) |
|---|---|---|---|
| EER agrupado, 1 utt | 25,20 % | 18,30 % | 17,90 % |
| EER agrupado, 3 utt | 22,27 % | 14,63 % | 14,40 % |

Datos adicionales de estabilidad: desviación estándar entre semillas 0-2 del EER agrupado a 1 utt de 0,08-0,41 % absoluto; semianchura del intervalo de confianza bootstrap al 95 % (8.000 ensayos) de aproximadamente 0,8 %. La model card incluye también métricas de minDCF, ROC-AUC e intervalo de confianza en `eval_results.json`, así como una evaluación sobre un subconjunto de 10 locutores de VoxCeleb1-O, pero los valores concretos no se detallan en la información disponible.

Como referencia contextual (no comparable directamente), la model card cita que sistemas ECAPA-TDNN entrenados sobre VoxCeleb2-dev alcanzan alrededor del 0,9 % EER en la lista completa VoxCeleb1-O (Desplanques et al., 2020), y sistemas de menos de 1 M de parámetros alrededor del 2 % (Wang et al., EfficientTDNN, 2022). El checkpoint aquí descrito no es equiparable porque se entrenó sobre 381 locutores, no sobre los 5.994 locutores y ~1,1 M de enunciados de VoxCeleb2-dev.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los pesos en precisión nativa; el modelo tiene 4,5 M de parámetros y el repo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente; no se requiere A100, H100 ni RTX 4090. El checkpoint se entrenó en CPU, por lo que la inferencia en CPU es viable.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 2060, RTX 3060, RTX 4090) y en placas integradas con suficiente memoria del sistema.
- Opciones de despliegue: la librería oficial es `flaxspeaker >= 0.5.0` (JAX/Flax). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que están orientadas a modelos generativos de texto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | EER de referencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `univ_conformer_base_ge2e` | 4,55 M | Audio 16 kHz, recortes `U(90, 180)` frames | 17,90 % (1 utt) / 14,40 % (3 utt) en corpus de 381 locutores | Apache 2.0 | Hugging Face, PyPI, GitHub |
| ECAPA-TDNN (Desplanques et al., 2020) | No disponible | Audio 16 kHz | ~0,9 % en VoxCeleb1-O completo | No disponible en la información | Referencia bibliográfica |
| EfficientTDNN (Wang et al., 2022) | < 1 M | Audio 16 kHz | ~2 % en VoxCeleb1-O | No disponible en la información | Referencia bibliográfica |

La comparación directa con ECAPA-TDNN y EfficientTDNN no es válida en términos absolutos porque estos últimos se entrenaron sobre VoxCeleb2-dev (5.994 locutores, ~1,1 M de enunciados), mientras que este checkpoint se entrenó sobre 381 locutores y 9.447 enunciados. La comparativa debe interpretarse como referencia de orden de magnitud y de regimen de entrenamiento, no como una comparación de rendimiento equivalente.

## Limitaciones y advertencias

- EER absolutos elevados en comparación con sistemas industriales: 17,90 % (1 utt) y 14,40 % (3 utt), acotados por la baja diversidad de locutores del corpus de entrenamiento (381 locutores, máximo 25 enunciados por locutor).
- No es una reproducción a gran escala de los papers originales; los experimentos de los artículos se ejecutaron sobre infraestructura y datos internos de Google, no con esta librería.
- El checkpoint no es un producto oficial de Google y no cuenta con soporte oficial.
- El frontend de audio no es un `AutoFeatureExtractor` de Hugging Face: requiere usar `flaxspeaker.AudioFrontend` con Mel log-natural de 80 dimensiones a 16 kHz, VAD por energía y CMVN. Un uso incorrecto del frontend degrada los embeddings.
- Idiomas soportados no documentados de forma explícita; el entrenamiento cubre inglés (LibriSpeech, VoxCeleb1) y chino (CN-Celeb2), pero no se garantiza generalización a otros idiomas.
- Riesgo de sesgo por desequilibrio de locutores, género, acento y dominio de grabación en el corpus de 381 locutores.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en la verificación, especialmente con audio de mala calidad o fuera de dominio.
- Licencia Apache 2.0 permite uso comercial, pero el autor advierte explícitamente de que el modelo no debe presentarse como estado del arte ni usarse como sistema de producción sin validación adicional.
- No dispone de cuantizaciones publicadas (GGUF, ONNX, etc.) ni de integraciones con runtimes de inferencia distintos de `flaxspeaker`.
- El intervalo de confianza bootstrap al 95 % tiene una semianchura de ~0,8 %, por lo que diferencias menores entre variantes pueden no ser significativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/univ_conformer_base_ge2e
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- GE2E, Generalized End-to-End Loss for Speaker Verification: https://arxiv.org/abs/1710.10467
- Dr-Vectors, Decision Residual Networks and an Improved Loss for Speaker Recognition: https://arxiv.org/abs/2104.01989
- ATP, Attentive Temporal Pooling for Conformer-based Streaming Language Identification in Long-form Speech: https://arxiv.org/abs/2202.12163
- PFAS, Parameter-Free Attentive Scoring for Speaker Verification: https://arxiv.org/abs/2203.05642
