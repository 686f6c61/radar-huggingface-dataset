# wq2012/univ_mamba_small_ge2e

## Resumen

`univ_mamba_small_ge2e` es un modelo de extracción de embeddings de locutor (speaker verification y speaker recognition) desarrollado por el usuario `wq2012` dentro del proyecto FlaxSpeaker, una reimplementación desde cero en JAX/Flax de algoritmos publicados de reconocimiento de locutor. El modelo emplea una arquitectura de backbone Mamba (modelo de espacio de estados) en configuracion "small", con pooling temporal de tipo attentive statistical pooling (ASP) y un objetivo de entrenamiento GE2E softmax con centroides leave-one-out exactos. La verificación se realiza por similitud coseno sobre embeddings de 192 dimensiones.

El checkpoint es deliberadamente pequeño: 1.028.674 parámetros de inferencia (encoder más cabeza de scoring, excluyendo los pesos del clasificador usados solo en entrenamiento), lo que lo sitúa en la categoría de sistemas sub-1M de parámetros. Se entrenó hasta convergencia en un corpus controlado de 381 locutores y 9.447 utterances procedentes de LibriSpeech, CN-Celeb2 y VoxCeleb1, con 4.600 pasos de gradiente (unas 15,58 épocas) sobre una estación de trabajo CPU con semilla 42.

Su relevancia actual es doble: por un lado, sirve como referencia reproducible y abierta (licencia Apache 2.0) para comparativas controladas dentro del benchmark FlaxSpeaker; por otro, demuestra que un backbone SSM tipo Mamba puede aplicarse a tareas de verificación de locutor con un presupuesto de parámetros muy reducido. No obstante, el propio autor advierte que no es una reproducción a gran escala de los resultados de los papers originales, sino un checkpoint de benchmark sobre corpus pequeño.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (backbone SSM) con pooling temporal ASP (attentive statistical pooling) |
| Parametros totales | 1.028.674 (encoder + cabeza de scoring; excluye clasificador de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa crops de 90-180 frames de audio; no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y msgpack; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo agnóstico al idioma; entrenado con LibriSpeech EN, CN-Celeb2 ZH y VoxCeleb1 multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, flax_model.msgpack (Flax nativo) |

## Arquitectura y entrenamiento

El modelo combina un backbone Mamba de tamano "small" con una cabeza de pooling temporal ASP (Attentive Temporal Pooling, repurposed de un paper de identificación de idioma, arXiv:2202.12163) que agrega la secuencia de estados ocultos en un vector de embedding de 192 dimensiones. La función de pérdida es GE2E softmax (Wan et al. 2018, Eq. 6) con centroides leave-one-out exactos, y la verificación se realiza por similitud coseno. El frontend de audio es propio de FlaxSpeaker: 80 dimensiones de Mel en escala logarítmica natural a 16 kHz, VAD a nivel de frame y CMVN, implementado en `flaxspeaker.AudioFrontend` y no como un `AutoFeatureExtractor` de Hugging Face.

El entrenamiento se realizó sobre un pool multi-dominio de 381 locutores y 9.447 utterances (LibriSpeech + CN-Celeb2 + VoxCeleb1), con mini-batches de 32 utterances (8 locutores x 4 utterances), 4.600 pasos de gradiente (~15,58 épocas), warmup de 460 pasos y crops de longitud variable U(90, 180) frames con máscara de validez exacta. La pérdida de validación y el EER alcanzaron su meseta de convergencia en este corpus pequeño; el EER pooled universal pasó de 26,36% (1-utt) / 23,50% (3-utt) en el paso 400 a 19,57% / 16,57% en el paso 4600. La desviación estándar entre semillas 0-2 es de 0,08-0,41% absoluto, y el intervalo de confianza bootstrap al 95% con 8.000 ensayos tiene una semi-amplitud de ~0,8%.

## Capacidades

- Extracción de embeddings de locutor de 192 dimensiones a partir de audio a 16 kHz.
- Verificación de locutor (speaker verification): comparación de pares de utterances mediante similitud coseno.
- Reconocimiento de locutor (speaker recognition): identificación de locutores registrados en un conjunto de referencia.
- Scoring de tipo PFAS (Parameter-Free Attentive Scoring, arXiv:2203.05642) y cabezas Dr-Vector (arXiv:2104.01989) incluidas en el checkpoint.
- Procesamiento de audio multi-dominio (inglés, chino mandarín y multilingüe vía VoxCeleb1).
- Manejo de utterances de duración variable gracias a crops de 90-180 frames y máscara de validez.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de feature extraction puro.
- No tiene capacidades de visión, audio generativo ni thinking mode.

## Casos de uso

- Verificación biométrica de locutor en aplicaciones de control de acceso: el modelo genera embeddings de 192 dimensiones que se comparan por similitud coseno contra una plantilla de referencia, con un coste computacional mínimo (1M de parámetros) adecuado para dispositivos con recursos limitados.
- Diarización de reuniones y transcripciones: los embeddings por segmento permiten agrupar intervenciones de un mismo hablante en grabaciones de múltiples participantes, usando la ventana de 90-180 frames del frontend.
- Autenticación de voz en call centers: integración en pipelines de atención telefónica para verificar la identidad del cliente antes de acceder a datos sensibles, con inferencia en CPU.
- Investigación en arquitecturas SSM para audio: el checkpoint sirve como referencia reproducible para comparar backbones Mamba frente a CNN/Transformer en tareas de speaker verification bajo el mismo protocolo del benchmark FlaxSpeaker.
- Benchmarking controlado de sistemas de locutor: al estar entrenado sobre un corpus fijo de 381 locutores y publicar métricas con intervalos bootstrap, permite comparaciones relativas entre variantes de pooling, pérdida y backbone.
- Filtrado y indexación de archivos de audio: extracción masiva de embeddings para búsqueda por similitud de locutor en archivos de medios, con despliegue en CPU y bajo consumo de memoria.
- Prototipado de sistemas de anti-spoofing o control de calidad de datos de voz: los embeddings permiten detectar duplicados o inconsistencias de locutor en datasets de entrenamiento.

## Benchmarks y rendimiento

Datos publicados en la model card y en `eval_results.json` (EER pooled universal, corpus de 381 locutores):

| Metrica | Paso 400 | Paso 4000 (knee) | Paso 4600 (final) |
|---|---|---|---|
| EER 1-utt | 26,36% | 19,94% | 19,57% |
| EER 3-utt | 23,50% | 16,33% | 16,57% |

Referencias citadas por el autor (no son resultados de este checkpoint):

| Sistema | EER en VoxCeleb1-O completo | Notas |
|---|---|---|
| ECAPA-TDNN (Desplanques et al., 2020) | ~0,9% | Entrenado en VoxCeleb2-dev (5.994 locutores, ~1,1M utterances) |
| EfficientTDNN sub-1M (Wang et al., 2022) | ~2% | Sistema de menos de 1M de parámetros |
| `univ_mamba_small_ge2e` | no disponible en VoxCeleb1-O completo | Solo se publica un subconjunto de 10 locutores de VoxCeleb1-O |

El autor indica explícitamente que los EER absolutos están acotados por la diversidad de locutores del corpus de entrenamiento (381 locutores, ≤25 utterances por locutor) y que el modelo no debe interpretarse como estado del arte. Se reportan además métricas de minDCF y ROC-AUC con intervalos de confianza bootstrap al 95% en `eval_results.json`, pero sus valores numéricos no están disponibles en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32 para los 1.028.674 parámetros (~4 MB de pesos), más el buffer de activaciones del frontend de audio; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; el entrenamiento se realizó en una estación de trabajo CPU. Cualquier GPU moderna (RTX 3060 o superior, A100, H100) acelera la inferencia por lotes, pero no es necesaria.
- Cabe en GPU consumer: sí, en todas (GTX 1050, RTX 2060, RTX 4090, etc.), con un consumo de memoria despreciable.
- Opciones de despliegue: librería `flaxspeaker >= 0.5.0` (pip), JAX/Flax en CPU o GPU. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; el coste dominante será el frontend de audio (Mel + VAD + CMVN) más que el propio encoder Mamba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | EER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `univ_mamba_small_ge2e` | 1.028.674 | Audio 16 kHz, crops 90-180 frames | 19,57% (1-utt) / 16,57% (3-utt) en corpus de 381 locutores | Apache 2.0 | Hugging Face + PyPI |
| ECAPA-TDNN (Desplanques et al., 2020) | ~20M (referencia habitual) | Audio 16 kHz | ~0,9% en VoxCeleb1-O completo | Varía según implementación | Implementaciones abiertas en SpeechBrain, etc. |
| EfficientTDNN sub-1M (Wang et al., 2022) | <1M | Audio 16 kHz | ~2% en VoxCeleb1-O completo | Varía según implementación | Repositorios de investigación |
| Backbones Transformer de speaker verification (p. ej. ECAPA-TDNN grandes) | 10-100M | Audio 16 kHz | Sub-1% con entrenamiento a gran escala | Varía | Múltiples |

La comparación directa no es limpia: los EER de ECAPA-TDNN y EfficientTDNN corresponden a VoxCeleb1-O completo con entrenamiento en VoxCeleb2-dev, mientras que este checkpoint se evalúa sobre un corpus de 381 locutores con ≤25 utterances por locutor. La comparativa válida es relativa dentro del benchmark FlaxSpeaker.

## Limitaciones y advertencias

- No es un producto oficial de Google; es una reimplementación independiente en JAX/Flax basada únicamente en papers publicados.
- Checkpoint de benchmark sobre corpus pequeño (381 locutores, 9.447 utterances), no una reproducción a gran escala de los resultados de los papers originales.
- EER absoluto elevado (19,57% 1-utt, 16,57% 3-utt) comparado con sistemas industriales entrenados sobre miles de locutores; no apto como sistema de producción de verificación biométrica sin reentrenamiento.
- Sesgos potenciales derivados del corpus: sobrerrepresentación de inglés (LibriSpeech) y chino mandarín (CN-Celeb2), con VoxCeleb1 aportando diversidad limitada; el rendimiento en otros idiomas o acentos no está evaluado.
- Riesgo de degradación en condiciones acústicas no representadas en el corpus (ruido, reverberación, micrófonos lejanos), no cuantificado en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de rendimiento ni soporte.
- El frontend de audio es propio de FlaxSpeaker (`AudioFrontend`), no un `AutoFeatureExtractor` de Hugging Face; la integración requiere la librería `flaxspeaker >= 0.5.0` y no es directamente compatible con pipelines estándar de `transformers`.
- El EER reportado tiene una semi-amplitud de intervalo bootstrap de ~0,8%, por lo que diferencias menores entre variantes pueden no ser significativas.
- No dispone de resultados publicados en VoxCeleb1-O completo, lo que dificulta la comparación con la literatura estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/univ_mamba_small_ge2e
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP (Attentive Temporal Pooling): https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
