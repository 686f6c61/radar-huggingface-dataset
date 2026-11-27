# wq2012/univ_ecapa_tdnn_small_ge2e

## Resumen

`univ_ecapa_tdnn_small_ge2e` es un extractor de embeddings de hablante (speaker embeddings) de 1,68 millones de parámetros, implementado en JAX/Flax y publicado por el autor `wq2012` dentro del proyecto FlaxSpeaker. Resuelve la tarea de verificación e identificación de hablante: dado un fragmento de audio, produce un vector de 192 dimensiones que permite comparar voces mediante similitud coseno. Su relevancia radica en que es una reimplementación limpia desde cero (sin código ni datos propietarios) de algoritmos publicados por Google, lo que lo convierte en una referencia reproducible y ligera para experimentación.

La arquitectura combina un backbone ECAPA-TDNN en variante `small`, pooling temporal atencional (`asp`) y un objetivo de entrenamiento GE2E softmax con centroides leave-one-out exactos. El modelo se entrenó sobre un corpus controlado multi-dominio de 381 hablantes y 9.447 utterances (LibriSpeech + CN-Celeb2 + VoxCeleb1) durante 4.600 pasos, alcanzando convergencia en ese presupuesto reducido.

Es importante entenderlo como un checkpoint de benchmark de corpus pequeño, no como un modelo de producción a gran escala: sus cifras de EER (17,62 % en 1-utt, 14,07 % en 3-utt) están lejos de los sistemas ECAPA-TDNN entrenados sobre VoxCeleb2-dev completo (~0,9 % EER). Su valor está en la reproducibilidad, el tamaño mínimo y la disponibilidad de exportaciones TFLite.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (variante `small`) con pooling temporal atencional (`asp`) y cabeza de scoring coseno |
| Parametros totales | 1.690.176 (safetensors); 1.684.418 en inferencia (encoder + cabeza de scoring, excluye pesos del clasificador de entrenamiento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; entrada de audio con crops de 90-180 frames; exportaciones TFLite con ventana fija de 180 frames (1,8 s) |
| Tipos de cuantizacion | FP32 e INT8 (exportaciones TFLite) |
| Idiomas soportados | No disponible (el modelo es independiente del idioma; entrenado con datos multi-dominio de LibriSpeech, CN-Celeb2 y VoxCeleb1) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, Flax msgpack (`flax_model.msgpack`), TFLite (`model_fp32.tflite`, `model_int8.tflite`) |

## Arquitectura y entrenamiento

El backbone es una ECAPA-TDNN en configuración `small`, una red convolucional temporal con atención squeeze-excitation y agregación multi-escala, seguida de un pooling temporal atencional (`asp`) que produce un embedding de 192 dimensiones. La verificación se realiza por similitud coseno entre embeddings. El frontend de audio no es un `AutoFeatureExtractor` de Hugging Face, sino el componente propio `flaxspeaker.AudioFrontend`: Mel logarítmico natural de 80 dimensiones a 16 kHz, VAD a nivel de frame basado en energía y normalización CMVN.

El entrenamiento usa el objetivo GE2E softmax (Wan et al. 2018, Eq. 6) con centroides leave-one-out exactos, mini-batches de 32 utterances (8 hablantes × 4 utterances) y 4.600 pasos (~15,58 épocas sobre las 9.447 utterances de 381 hablantes), con semilla 42 y warmup de 460 pasos, sobre una estación de trabajo CPU. Se emplearon crops de longitud variable `U(90, 180)` frames con máscara de validez exacta. El checkpoint incorpora además cabezas Dr-Vector y PFAS según los papers de referencia. La progresión de EER pooled durante el entrenamiento fue de 28,32 % (1-utt) / 25,27 % (3-utt) en el paso 400 a 17,62 % / 14,07 % en el paso 4.600.

## Capacidades

- Extracción de embeddings de hablante de 192 dimensiones a partir de audio a 16 kHz.
- Verificación de hablante (1:1) mediante similitud coseno.
- Identificación de hablante (1:N) por comparación contra un conjunto de embeddings de referencia.
- Scoring con múltiples cabezas: GE2E softmax, Dr-Vector y PFAS.
- Agregación de múltiples utterances por hablante (evaluación 1-utt y 3-utt).
- Detección de actividad de voz (VAD) integrada en el frontend.
- Exportación a TFLite FP32 e INT8 para despliegue en entornos ligeros.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales; es un modelo puramente de extracción de características de audio.

## Casos de uso

- Verificación biométrica de voz en aplicaciones de autenticación: el modelo genera un embedding de 192 dimensiones por utterance y se compara por coseno contra la plantilla del usuario registrado; su tamaño de 1,68 M de parámetros permite ejecución en CPU.
- Identificación de hablante en grabaciones cortas: con ventanas de 1,8 s (180 frames) y exportación TFLite INT8, puede integrarse en dispositivos con recursos limitados para etiquetar quién habla en un audio.
- Diarización ligera de reuniones: combinado con un segmentador externo, los embeddings permiten agrupar segmentos por hablante en entornos con pocos participantes.
- Investigación y docencia en reconocimiento de hablante: sirve como referencia reproducible en JAX/Flax para comparar variantes de pooling, funciones de pérdida y cabezas de scoring dentro del benchmark FlaxSpeaker.
- Pruebas de regresión en pipelines de audio: su checkpoint convergido y sus fingerprints de paso 0 permiten validar cambios de código contra métricas archivadas en `eval_results.json`.
- Despliegue en móvil o edge: las exportaciones TFLite FP32/INT8 del encoder permiten inferencia en dispositivos sin GPU, con ventana fija de 1,8 s.
- Filtrado de calidad de datos de audio: los embeddings pueden usarse para detectar duplicados o inconsistencias de hablante en corpus de entrenamiento.

## Benchmarks y rendimiento

Datos extraídos de la model card y de `eval_results.json` (corpus de benchmark de 381 hablantes):

| Metrica | 1-utt | 3-utt |
|---|---|---|
| EER pooled (paso 400) | 28,32 % | 25,27 % |
| EER pooled (paso 4000, knee) | 18,35 % | 14,80 % |
| EER pooled (paso 4600, final) | 17,62 % | 14,07 % |

- Desviación estándar entre semillas 0-2 del EER pooled 1-utt: 0,08-0,41 % absoluto.
- Intervalo de confianza bootstrap del 95 % (8.000 ensayos): ~0,8 % de semi-amplitud.
- Fingerprint de pérdida en paso 0 con semilla liberada: 2,1851 (crops `U(90, 180)`), 2,0147 (crops fijos de 180 frames).
- Referencia externa citada en la model card: ECAPA-TDNN sobre VoxCeleb2-dev alcanza ~0,9 % EER en VoxCeleb1-O (Desplanques et al., 2020); sistemas de menos de 1 M de parámetros, ~2 % (Wang et al., EfficientTDNN, 2022).
- No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, por no ser aplicables a esta tarea.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32 para el encoder y los pesos de scoring (1,68 M de parámetros); en INT8, del orden de decenas de MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; el modelo se entrenó en CPU, por lo que la inferencia en CPU es viable.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, GTX 1650, iGPU) y en dispositivos móviles vía TFLite.
- Opciones de despliegue: JAX/Flax con la librería `flaxspeaker`, TFLite (FP32/INT8) para edge y móvil, y exportación a otros runtimes compatible con safetensors. No se documenta soporte nativo de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | EER de referencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `univ_ecapa_tdnn_small_ge2e` | 1,68 M | Ventana 1,8 s (180 frames); crops 90-180 | 17,62 % (1-utt) / 14,07 % (3-utt) en corpus de 381 hablantes | Apache 2.0 | Hugging Face, PyPI, GitHub |
| ECAPA-TDNN (Desplanques et al., 2020) | ~20 M (referencia publicada) | No disponible | ~0,9 % en VoxCeleb1-O (VoxCeleb2-dev) | No disponible | Paper; implementaciones de terceros |
| EfficientTDNN (Wang et al., 2022) | <1 M | No disponible | ~2 % (referencia citada) | No disponible | Paper |

La comparación directa no es homogénea: los EER de referencia externos se obtienen sobre VoxCeleb1-O con modelos entrenados en VoxCeleb2-dev (5.994 hablantes, ~1,1 M utterances), mientras que este checkpoint se entrena sobre 381 hablantes y 9.447 utterances. No se dispone de datos de benchmarks de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de benchmark de corpus pequeño: 381 hablantes y 9.447 utterances, no una reproducción a gran escala de los papers originales.
- EER absoluto elevado (17,62 % en 1-utt) frente a sistemas industriales; no apto como sistema de verificación de producción sin reentrenamiento o fine-tuning sobre un corpus mayor.
- Sesgos potenciales derivados de la composición del corpus (LibriSpeech, CN-Celeb2, VoxCeleb1): posible menor robustez ante acentos, idiomas o condiciones acústicas poco representadas.
- No es un producto oficialmente soportado por Google; es una reimplementación independiente.
- El frontend de audio es propio (`flaxspeaker.AudioFrontend`) y no un `AutoFeatureExtractor` de Hugging Face, lo que exige usar la librería `flaxspeaker` para preprocesar el audio correctamente.
- Las exportaciones TFLite corresponden solo al encoder y usan una ventana fija sin máscara de 180 frames (1,8 s), lo que limita la flexibilidad de longitud en ese formato.
- Riesgo de alucinación no aplica (no es un modelo generativo); el riesgo principal es la confusión entre hablantes con voces similares o audio degradado.
- Licencia Apache 2.0: permite uso comercial, pero sin garantías del autor.
- No se documentan métricas de latencia ni throughput, lo que dificulta planificar despliegues con requisitos de tiempo real.

## Enlaces

- Hugging Face: https://huggingface.co/wq2012/univ_ecapa_tdnn_small_ge2e
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- GE2E (arXiv:1710.10467): https://arxiv.org/abs/1710.10467
- Dr-Vectors (arXiv:2104.01989): https://arxiv.org/abs/2104.01989
- ATP (arXiv:2202.12163): https://arxiv.org/abs/2202.12163
- PFAS (arXiv:2203.05642): https://arxiv.org/abs/2203.05642
