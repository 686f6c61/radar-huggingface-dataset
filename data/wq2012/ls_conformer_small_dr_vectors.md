# wq2012/ls_conformer_small_dr_vectors

## Resumen

`ls_conformer_small_dr_vectors` es un modelo de extracción de embeddings de locutor (speaker verification y speaker recognition) desarrollado por el usuario wq2012 dentro del proyecto FlaxSpeaker. Se trata de una reimplementación desde cero en JAX/Flax, basada exclusivamente en papers publicados (GE2E, Dr-Vectors, ATP y PFAS), de los algoritmos de reconocimiento de locutor de Google. El modelo no es un producto oficial de Google y sus resultados no reproducen los experimentos a gran escala de los papers originales.

Arquitectura Conformer de tamaño "small" con pooling temporal atento (ATP) y una cabeza de verificación Dr-Vector reducida. Genera representaciones de 192 dimensiones y cuenta con 2.088.007 parámetros de inferencia (encoder más cabeza de scoring, excluyendo los pesos del clasificador usados solo en entrenamiento). Está entrenado únicamente sobre LibriSpeech (232 locutores, 5.788 enunciados) durante 2.400 pasos (~13,27 épocas), lo que lo convierte en un checkpoint de referencia para comparaciones controladas dentro del benchmark FlaxSpeaker, no en un modelo de producción a gran escala.

Su relevancia es acotada pero clara: ofrece una implementación abierta, reproducible y ligera (repo de 0,1 GB) en el ecosistema JAX/Flax para experimentación con verificación de locutor, un nicho donde la mayoría del código disponible está en PyTorch. La licencia Apache 2.0 facilita su uso y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (variante small) con pooling temporal atento (ATP) |
| Parametros totales | 2.088.007 (encoder + cabeza de scoring; excluye pesos del clasificador de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (crops de entrenamiento de U(90, 180) frames) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado solo con LibriSpeech, inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, flax_model.msgpack (Flax nativo) |

## Arquitectura y entrenamiento

El backbone es un Conformer de configuración "small" que procesa características Mel de 80 dimensiones en escala logarítmica natural a 16 kHz, con VAD a nivel de frame y normalización CMVN mediante `flaxspeaker.AudioFrontend` (no es un `AutoFeatureExtractor` de Hugging Face). Sobre el encoder se aplica pooling temporal atento (ATP, tomado de un paper de identificación de idioma) y una cabeza de verificación Dr-Vector reducida: sin separación base/side-info, con capas ocultas (128, 64) ReLU más LayerNorm y peso residual fijo de 0,25. La salida es un embedding de 192 dimensiones.

El objetivo de entrenamiento es un Extended-Set Softmax mezclado (variante FlaxSpeaker: 0,50 de row-softmax más 0,50 de extended-set con desplazamiento de logit -log N), que no coincide con la ecuación 2 del paper original. El entrenamiento se realizó con 2.400 pasos de gradiente, mini-batches de 32 enunciados (8 locutores x 4 enunciados), calentamiento de 240 pasos y semilla 42, sobre 5.788 enunciados de LibriSpeech de 232 locutores (~13,27 épocas). Se usaron crops de longitud variable U(90, 180) frames con máscara de validez exacta. No se reporta uso de RLHF ni DPO.

## Capacidades

- Extracción de embeddings de locutor (speaker embeddings) de 192 dimensiones a partir de audio.
- Verificación de locutor (speaker verification): comparación de pares de utterances mediante scoring Dr-Vector.
- Reconocimiento de locutor (speaker recognition / identificación) mediante comparación contra un conjunto de embeddings de referencia.
- Evaluación con métricas estándar del dominio: EER, minDCF y ROC-AUC.
- Soporte de audio de longitud variable con VAD y CMVN integrados en el frontend.
- No soporta tool calling, function calling, agentes, visión ni audio más allá del procesamiento de voz para embeddings.
- Capacidades multilingües: no disponibles (entrenado solo con LibriSpeech en inglés).

## Casos de uso

- Benchmark reproducible de verificación de locutor: sirve como referencia controlada para comparar variantes de arquitectura, pooling o funciones de pérdida dentro del ecosistema FlaxSpeaker, con métricas EER y minDCF ya archivadas en `eval_results.json`.
- Experimentación en JAX/Flax: permite a investigadores que trabajan en JAX probar pipelines de speaker verification sin depender de implementaciones en PyTorch, reutilizando la librería `flaxspeaker` de PyPI.
- Prototipado de autenticación por voz en entornos de laboratorio: con 2 millones de parámetros y un repo de 0,1 GB, se puede desplegar en CPU para pruebas de concepto de verificación biométrica antes de escalar a modelos mayores.
- Estudio de los efectos del tamaño de corpus: el propio autor documenta la progresión de EER según los pasos de entrenamiento, lo que permite analizar cómo la diversidad de locutores limita el rendimiento absoluto.
- Docencia y formación: ejemplo completo y abierto de un pipeline de speaker recognition (frontend, encoder, pooling, loss y scoring) con código legible y licencia permisiva.
- Comparación de cabezas de scoring: la inclusión de las cabezas GE2E, Dr-Vector y PFAS en el checkpoint permite evaluar empíricamente distintas estrategias de verificación sobre el mismo encoder.

## Benchmarks y rendimiento

Resultados de EER reportados por el autor sobre LibriSpeech (in-domain), a lo largo del entrenamiento:

| Paso | EER 1-utt | EER 3-utt |
|---|---|---|
| 400 | 23,73 % | 21,50 % |
| 2000 (knee) | 13,87 % | 8,50 % |
| 2400 (final) | 13,20 % | 8,90 % |

Pooling universal (Universal Pooled final): 21,40 % (1-utt) y 16,93 % (3-utt). La desviación estándar entre semillas 0-2 del EER pooled 1-utt es de 0,08-0,41 % absoluto, y el intervalo de confianza bootstrap al 95 % con 8.000 ensayos tiene una semi-amplitud de ~0,8 %. El autor indica que estos valores están acotados por la diversidad de locutores del corpus de entrenamiento (232 locutores) y no son comparables con sistemas entrenados sobre VoxCeleb2-dev.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 2.088.007 parámetros, los pesos ocupan del orden de 8 MB en fp32 y ~4 MB en fp16. El modelo se entrenó en una estación de trabajo con CPU, lo que indica que la inferencia cabe holgadamente en CPU.
- GPU recomendadas: no se requieren; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es más que suficiente. Para lotes grandes, una RTX 4090 o A100 aportarían margen adicional, pero no son necesarias.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: la librería nativa es `flaxspeaker` (JAX/Flax). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje. Los pesos en safetensors y msgpack permiten cargarlos directamente con Flax.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / datos | EER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ls_conformer_small_dr_vectors` | 2.088.007 | LibriSpeech, 232 locutores | 13,20 % (1-utt) / 8,90 % (3-utt) in-domain | Apache 2.0 | Hugging Face, PyPI, GitHub |
| ECAPA-TDNN (Desplanques et al., 2020) | no disponible | VoxCeleb2-dev, 5.994 locutores | ~0,9 % en VoxCeleb1-O | no disponible | Implementaciones públicas en PyTorch |
| EfficientTDNN (Wang et al., 2022) | <1M | no disponible | ~2 % | no disponible | no disponible |

La comparación no es directa: los EER de los sistemas de referencia se miden sobre VoxCeleb1-O con corpus de entrenamiento de miles de locutores, mientras que este checkpoint se evalúa in-domain sobre LibriSpeech con 232 locutores. El autor advierte explícitamente que no debe interpretarse como un modelo state-of-the-art.

## Limitaciones y advertencias

- Entrenado solo con LibriSpeech (232 locutores, 5.788 enunciados): la diversidad de locutores es muy limitada y los EER absolutos son altos (13,20 % 1-utt) frente a sistemas industriales.
- No es una reproducción a gran escala de los papers: los experimentos originales usaron infraestructura y datos internos de Google.
- No es un producto oficial de Google; el autor lo declara explícitamente.
- El objetivo de pérdida es una variante propia (Extended-Set Softmax mezclado), no la ecuación del paper, lo que dificulta comparaciones directas con la literatura.
- La cabeza Dr-Vector está reducida (sin separación base/side-info, peso residual fijo), lo que puede limitar el rendimiento frente a variantes completas.
- Idiomas: solo inglés (LibriSpeech); no se documenta soporte multilingüe.
- Riesgo de alucinación no aplica en el sentido de modelos generativos, pero sí existe riesgo de falsos positivos/negativos en la verificación de locutor, especialmente con locutores fuera de dominio.
- Sesgos conocidos: no documentados explícitamente, pero la distribución de LibriSpeech (audiolibros en inglés) puede introducir sesgos de acento, género y calidad de grabación.
- Licencia Apache 2.0 permite uso comercial, pero el rendimiento limitado desaconseja su uso en producción sin fine-tuning sobre datos representativos.
- El frontend de audio no es un `AutoFeatureExtractor` de Hugging Face, lo que complica la integración con pipelines estándar de `transformers`.

## Enlaces

- Hugging Face: https://huggingface.co/wq2012/ls_conformer_small_dr_vectors
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- GitHub: https://github.com/wq2012/FlaxSpeaker
- PyPI: https://pypi.org/project/flaxspeaker/
- GE2E (arXiv:1710.10467): https://arxiv.org/abs/1710.10467
- Dr-Vectors (arXiv:2104.01989): https://arxiv.org/abs/2104.01989
- ATP (arXiv:2202.12163): https://arxiv.org/abs/2202.12163
- PFAS (arXiv:2203.05642): https://arxiv.org/abs/2203.05642
