# wq2012/ls_ecapa_tdnn_tiny_ge2e

## Resumen
`ls_ecapa_tdnn_tiny_ge2e` es un modelo de verificación e identificación de hablante (speaker verification y speaker recognition) de tipo encoder, publicado por el usuario wq2012 dentro de la biblioteca open source FlaxSpeaker. No es un modelo de lenguaje generativo: su salida es un embedding de hablante de 128 dimensiones extraído de audio. La arquitectura es una ECAPA-TDNN en variante "tiny", con pooling temporal atento (ASP), pérdida de entrenamiento GE2E softmax y puntuación por similitud coseno. Con 626.722 parámetros del codificador, ocupa unos 2,5 MB en fp32.

Se trata de una reproducción independiente (clean-room) en JAX/Flax de algoritmos publicados por Google Research (GE2E, Dr-Vectors, Conformer-ATP y PFAS); no es un producto oficialmente soportado por Google. Resuelve la tarea de comparar si dos fragmentos de audio pertenecen al mismo hablante, y de generar representaciones de identidad de voz reutilizables en tareas de agrupación o diarización.

Su relevancia actual radica en su tamano mínimo, su licencia Apache 2.0 y su implementación en JAX/Flax, que lo convierten en un componente ligero y reproducible para pipelines de audio. Sin embargo, sus tasas de error (12,60% EER en LibriSpeech y 21,70% en VoxCeleb1 con una sola utterance) quedan lejos de los sistemas de producción basados en ECAPA-TDNN de decenas de millones de parámetros.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (variante "tiny") con pooling temporal atento (ASP), implementada en JAX/Flax |
| Parámetros totales | 626.722 parámetros del codificador según la model card; el recuento de safetensors es 626.720 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio no generativo); procesa utterances completas a 16.000 Hz |
| Tipos de cuantización | no disponible (pesos en fp32 en safetensors y msgpack) |
| Idiomas soportados | no disponible (reconocimiento de hablante text-independent; entrenado con LibriSpeech, en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y Flax msgpack (`flax_model.msgpack`) |
| Dimensión del embedding | 128 |
| Función de pérdida | GE2E softmax |
| Puntuación de verificación | similitud coseno |
| Dominio de entrenamiento | LibriSpeech |
| Frontend de audio | log-mel de 80 dimensiones a 16.000 Hz + VAD de energía + CMVN |
| Dataset declarados | librispeech_asr, cnceleb, voxceleb |
| Biblioteca | flaxspeaker |

## Arquitectura y entrenamiento
ECAPA-TDNN (Emphasized Channel Attention, Propagation and Aggregation Time Delay Neural Network) combina bloques TDNN con capas squeeze-excitation y bloques Res2Block para capturar dependencias temporales multicapa del audio. Sobre esa secuencia se aplica pooling temporal atento (ASP), que agrega las tramas ponderando las más relevantes para producir el embedding de hablante. La implementación se realiza en JAX/Flax, con la configuración del modelo en `config.json` (FlaxSpeakerConfig) y el frontend compatible con WhisperFeatureExtractor en `preprocessor_config.json`.

El entrenamiento emplea la pérdida GE2E softmax (Generalized End-to-End loss) y el scoring se realiza por similitud coseno. El dominio de entrenamiento declarado es LibriSpeech. Las etiquetas del repositorio mencionan los datasets librispeech_asr, cnceleb y voxceleb, aunque la evaluación se reporta sobre LibriSpeech, CN-Celeb2 y VoxCeleb1. La información disponible no especifica el número de horas o tokens de audio, la composición exacta del dataset ni etapas adicionales de ajuste. Este checkpoint es una reproducción clean-room de los algoritmos de GE2E, Dr-Vectors, Conformer-ATP y PFAS; los experimentos originales se llevaron a cabo con infraestructura y datos internos de Google, no con esta biblioteca ni con estos splits públicos.

## Capacidades
- Extracción de embeddings de hablante de 128 dimensiones a partir de audio (`model.extract_embedding`).
- Verificación de hablante por pares de utterances mediante similitud coseno (`model.verify`).
- Verificación con múltiples inscripciones (multi-enrollment): los resultados con 3 utterances mejoran el EER frente a 1 utterance en todos los dominios evaluados.
- Reconocimiento de hablante text-independent: no depende del contenido lingüístico, sino de las características de la voz.
- Puntuación con umbrales ajustables, con métricas minDCF a tasas de coste 0,01 y 0,10.
- Frontend integrado con VAD de energía y CMVN, más extractor log-mel de 80 dimensiones a 16.000 Hz.
- Inferencia por API de Python y por línea de comandos (`scripts/inference.py`).
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso. Tampoco genera texto, visión o audio: no es un modelo de chat.

## Casos de uso
- Prototipado de verificación de voz: validar un pipeline de biometría de voz antes de migrar a modelos mayores. Adecuado por su tamano mínimo y su licencia permisiva, aunque su EER es alto.
- Componente de embeddings en sistemas de diarización: generar un embedding por segmento de audio y agrupar por similitud coseno los segmentos del mismo hablante en una reunión transcrita.
- Verificación con múltiples inscripciones: usar 3 utterances de referencia para reducir el EER (por ejemplo, 8,40% en LibriSpeech frente al 12,60% con una sola).
- Indexado y agrupación de archivos de audio: organizar colecciones por identidad de voz sin necesidad de transcripción, aprovechando el comportamiento text-independent.
- Investigación y reproducción: servir de baseline reproducible en JAX/Flax para experimentar con la pérdida GE2E, el pooling ASP y el scoring coseno.
- Filtrado de audio por hablante en datasets: detectar tramos de un mismo locutor para etiquetar o limpiar corpus (por ejemplo, descartar segmentos de otros hablantes en LibriSpeech).
- Preprocesado ligero en entornos con pocos recursos: con 626.722 parámetros puede ejecutarse en CPU o en dispositivos embebidos como paso previo a un modelo mayor.

## Benchmarks y rendimiento
Verificación con 1 utterance (datos de `eval_results.json`):

| Split de evaluación | Trials | EER (%) | IC bootstrap 95% (%) | minDCF@0,01 | minDCF@0,10 | ROC-AUC |
|---|---|---|---|---|---|---|
| LibriSpeech (inglés leído) | 3.000 | 12,60% | [11,25, 13,77] | 0,9327 | 0,6067 | 0,9465 |
| CN-Celeb2 (chino multigénero) | 3.000 | 30,87% | [29,06, 32,27] | 0,9967 | 0,9427 | 0,7635 |
| VoxCeleb1 (in-the-wild) | 2.000 | 21,70% | [19,50, 23,23] | 0,9080 | 0,9010 | 0,8745 |
| Universal Pooled (3 dominios) | 8.000 | 22,10% | [21,23, 22,95] | 0,9877 | 0,8192 | 0,8625 |
| Universal Macro-Average (3 dominios) | 8.000 | 21,72% | — | 0,9458 | 0,8168 | 0,8615 |

Verificación con 3 utterances (multi-enrollment):

| Split de evaluación | Trials | EER 3-utt (%) | IC bootstrap 95% (%) | minDCF@0,01 | ROC-AUC |
|---|---|---|---|---|---|
| LibriSpeech (3-utt) | 1.000 | 8,40% | [6,60, 10,20] | 0,9040 | 0,9728 |
| CN-Celeb2 (3-utt) | 1.000 | 26,40% | [23,80, 29,00] | 0,8520 | 0,8214 |
| VoxCeleb1 (3-utt) | 1.000 | 17,30% | [15,00, 19,55] | 0,9780 | 0,9093 |
| Universal Pooled (3-utt) | 3.000 | 17,67% | [16,35, 19,17] | 0,9520 | 0,9077 |
| Universal Macro-Average (3-utt) | 3.000 | 17,37% | — | 0,9113 | 0,9012 |

## Requisitos de hardware
- VRAM estimada: no requiere GPU. Con 626.722 parámetros en fp32 los pesos ocupan aproximadamente 2,5 MB (unos 1,25 MB en fp16 si se convirtieran); no se declaran otros formatos de cuantización.
- GPU recomendadas: ninguna en particular. Puede ejecutarse íntegramente en CPU; cualquier GPU (RTX 4090, A100, H100, etc.) solo aceleraría el procesamiento por lotes.
- Consumer GPU: sí, cabe en cualquier GPU de consumo y también en CPU, incluidos dispositivos embebidos.
- Opciones de despliegue: la biblioteca flaxspeaker (JAX/Flax) mediante `load_pretrained`, la API de Python y `scripts/inference.py`; los pesos en safetensors y msgpack son cargables con las utilidades de Flax. No aplican vLLM, llama.cpp, Ollama ni TGI, que son runtimes para modelos de lenguaje generativos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares
| Modelo | Parámetros | Embedding | Entrenamiento | EER | Licencia | Formato |
|---|---|---|---|---|---|---|
| wq2012/ls_ecapa_tdnn_tiny_ge2e | 626.722 (codificador) | 128 | LibriSpeech | 12,60% (LibriSpeech, 1-utt) y 21,70% (VoxCeleb1, 1-utt) | Apache 2.0 | safetensors, msgpack |
| NVIDIA NeMo ECAPA-TDNN | 22,3 M | no disponible | Dataset compuesto de miles de horas de audio | 0,92% (VoxCeleb clean test) | no disponible | no disponible |
| speechbrain/spkrec-ecapa-voxceleb | no disponible en la búsqueda | no disponible | VoxCeleb | no disponible | no disponible | no disponible |
| wespeaker-ecapa-tdnn512-LM | no disponible | 512 | no disponible | no disponible | no disponible | no disponible |

Los valores de EER no son directamente comparables entre sí: dependen del protocolo de evaluación, de las listas de trials y del dataset de entrenamiento. El modelo de este análisis es mucho más pequeno que el de NeMo, pero su error es entre uno y dos órdenes de magnitud mayor según el dominio.

## Limitaciones y advertencias
- Precisión limitada: EER del 12,60% (LibriSpeech), 21,70% (VoxCeleb1) y 30,87% (CN-Celeb2) con una utterance. No es apto para biometría de seguridad crítica.
- Brecha de dominio marcada: entrenado principalmente con LibriSpeech (inglés leído), su rendimiento cae de forma notable en audio multigénero chino (CN-Celeb2) y en audio in-the-wild (VoxCeleb1).
- No es un producto oficialmente soportado por Google: se trata de una reproducción clean-room independiente y sin soporte oficial.
- Sesgos potenciales: pueden aparecer diferencias de rendimiento según idioma, acento, canal, ruido y condiciones de grabación, derivadas del corpus de entrenamiento.
- Alucinación: no aplica en sentido generativo, pero sí existe riesgo de falsos positivos (aceptar a un impostor) y falsos negativos, que deben gestionarse ajustando el umbral de decisión al contexto.
- Idiomas: no se declaran idiomas soportados; el entrenamiento principal es en inglés y no hay garantías multilingües.
- Licencia: Apache 2.0, lo que permite uso comercial y modificación conservando los avisos de licencia y la atribución correspondiente.
- Caveat de producción: en el momento de la consulta el repositorio registra 0 descargas y 0 me gusta, y el tamano declarado del repo es 0,0 GB, por lo que conviene verificar la integridad de los ficheros antes de integrarlo en un pipeline.

## Enlaces
- HuggingFace: https://huggingface.co/wq2012/ls_ecapa_tdnn_tiny_ge2e
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub de FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI flaxspeaker: https://pypi.org/project/flaxspeaker/
- Paper GE2E (arXiv:1710.10467): https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors (arXiv:2104.01989): https://arxiv.org/abs/2104.01989
- Paper Conformer-ATP (arXiv:2202.12163): https://arxiv.org/abs/2202.12163
- Paper PFAS (arXiv:2203.05642): https://arxiv.org/abs/2203.05642
- NVIDIA NeMo ECAPA TDNN: https://catalog.ngc.nvidia.com/orgs/nvidia/teams/nemo/models/ecapa_tdnn
- SpeechBrain spkrec-ecapa-voxceleb: https://huggingface.co/speechbrain/spkrec-ecapa-voxceleb
- WeSpeaker ECAPA-TDNN512-LM: https://huggingface.co/Wespeaker/wespeaker-ecapa-tdnn512-LM
- Repositorio ecapa_tdnn (LKLQQ): https://github.com/LKLQQ/ecapa_tdnn
