# uctnlp/omniASR-CTC-300M-v2-Zulu-No-Lwazi

## Resumen

El modelo `uctnlp/omniASR-CTC-300M-v2-Zulu-No-Lwazi` es un sistema de reconocimiento automático del habla (ASR) basado en la arquitectura Wav2Vec2 con decodificación CTC (Connectionist Temporal Classification). Fue desarrollado por el grupo UCT NLP de la Universidad de Ciudad del Cabo y consiste en una conversión a Hugging Face del checkpoint `omniASR_CTC_300M_v2` del proyecto OmniLingual de Meta AI. El nombre sugiere que está orientado a la transcripción de isiZulu (zulú), aunque la model card no especifica los idiomas soportados de forma explícita.

Con 325,98 millones de parámetros y una arquitectura de encoder de 24 capas, este modelo ofrece una solución de ASR de tamaño medio que prioriza la velocidad de inferencia frente a modelos más grandes basados en LLM. Su salida son logits CTC sobre un vocabulario SentencePiece de 10 288 tokens, lo que permite transcripción directa sin necesidad de un decodificador externo. La relevancia actual radica en la escasez de modelos ASR de código abierto para lenguas africanas como el zulú, y en su compatibilidad con el ecosistema Transformers para despliegue inmediato.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2ForCTC (encoder transformer con cabezal CTC) |
| Parametros totales | 325 983 920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio, no texto) |
| Tipos de cuantizacion | no especificado (pesos en safetensors, cuantificable con herramientas estándar) |
| Idiomas soportados | no disponibles (el nombre sugiere isiZulu, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Wav2Vec2, un encoder transformer preentrenado de forma autosupervisada sobre audio sin etiquetar, adaptado posteriormente para ASR mediante una capa de clasificación CTC sobre un vocabulario SentencePiece. La configuración concreta incluye 24 capas de encoder, tamaño oculto de 1024, 16 cabezas de atención y una dimensión intermedia de FFN de 4096. Los logits de salida se proyectan sobre un vocabulario de 10 288 tokens.

El checkpoint original `omniASR_CTC_300M_v2` proviene del framework fairseq2 del proyecto OmniLingual de Meta, que entrena modelos ASR multilingües sobre más de 1600 lenguas. Este modelo concreto ha sido convertido a Transformers y verificado con paridad numérica (atol=1e-4) contra el checkpoint original. No se dispone de información detallada sobre el dataset de entrenamiento específico, la composición de los datos ni si se aplicaron técnicas como RLHF o DPO, aunque al ser un modelo CTC puro, no utiliza refuerzo ni decodificación autoregresiva.

## Capacidades

- Transcripción de voz a texto mediante decodificación CTC directa, sin necesidad de modelo de lenguaje externo.
- Soporte de audio muestreado a 16 kHz, con re-muestreo automático si se proporciona otra tasa.
- Compatible con el pipeline `automatic-speech-recognition` de Hugging Face Transformers.
- Salida de logits crudos que permiten integración con decodificadores externos o beam search si se desea mejorar la precisión.
- Capacidad multilingüe heredada del checkpoint OmniLingual, aunque no se especifican los idiomas exactos en esta variante.
- Inferencia rápida al ser un modelo CTC no autoregresivo, adecuado para transcripción en tiempo real o alto rendimiento.
- Verificación de paridad numérica con el checkpoint original, lo que garantiza reproducibilidad.

## Casos de uso

- Transcripción de audio en isiZulu para archivado y documentación: el modelo puede procesar grabaciones de entrevistas, reuniones o material audiovisual y generar texto plano, útil para bibliotecas digitales o estudios lingüísticos.
- Subtitulado automático de vídeos en lenguas africanas: al integrarse con herramientas de procesamiento de vídeo, permite generar subtítulos para contenido en zulú sin intervención manual.
- Asistentes de voz para aplicaciones móviles: gracias a su tamaño moderado y baja latencia, puede desplegarse en servidores o dispositivos con recursos limitados para comandos de voz.
- Análisis de llamadas en centros de atención al cliente: transcripción de conversaciones telefónicas para minería de texto, detección de sentimiento o control de calidad.
- Investigación en lingüística computacional: sirve como modelo base para fine-tuning en tareas específicas de lenguas bantúes o para comparación con otros sistemas ASR.
- Accesibilidad: conversión de contenido hablado en zulú a texto para personas con discapacidad auditiva o para facilitar la búsqueda de información en archivos de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como WER (Word Error Rate) ni comparaciones con otros modelos. Se recomienda evaluar el modelo en un conjunto de validación propio antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada: con 325,98 millones de parámetros, el modelo en precisión fp32 ocupa aproximadamente 1,3 GB de memoria. En fp16 se reduce a ~650 MB, y en int8 a ~325 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en fp32 (por ejemplo, NVIDIA GTX 1650, RTX 3050). Para mayor velocidad de inferencia se recomienda una RTX 3060 o superior.
- Compatible con GPUs de consumo: sí, cabe en tarjetas como RTX 3060, RTX 4060, etc. También puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: al ser un modelo Transformers estándar, se puede servir con Hugging Face Inference Endpoints, o mediante librerías como `transformers` pipeline, `torchaudio` para preprocesado, y `onnxruntime` para optimización.
- Latencia y throughput: no se proporcionan datos oficiales. Al ser un modelo CTC no autoregresivo, la inferencia es significativamente más rápida que los modelos basados en LLM, típicamente en el orden de decenas de milisegundos por segmento de audio en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| uctnlp/omniASR-CTC-300M-v2-Zulu-No-Lwazi (este) | 325,98 M | Wav2Vec2 CTC | no disponible | no disponible | Hugging Face |
| uctnlp/omniASR-CTC-300m-v2-Zulu-Baseline | no disponible | Wav2Vec2 CTC (presumiblemente) | no disponible | no disponible | Hugging Face |
| uctnlp/omniASR-CTC-300m-v2-Zulu | no disponible | Wav2Vec2 CTC | no disponible | apache-2.0 | Hugging Face |
| omniASR_CTC_300M_v2 (original) | 300 M aprox. | fairseq2 Wav2Vec2 CTC | no disponible | no disponible | GitHub (OmniLingual) |

La comparativa se basa en los nombres y la información disponible en la búsqueda web. No se dispone de datos de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no especificada: el modelo no indica una licencia clara en su model card, lo que puede generar incertidumbre legal para uso comercial. Se recomienda contactar con los autores antes de desplegarlo en producción.
- Idiomas no documentados: aunque el nombre sugiere zulú, no se confirma qué lenguas soporta realmente ni su calidad en cada una. Es necesario probar con datos reales.
- Riesgo de alucinación y errores en audio ruidoso: como todo sistema ASR, puede producir transcripciones incorrectas en presencia de ruido de fondo, acentos no representados o solapamiento de hablantes.
- Sesgos potenciales: al ser un modelo entrenado sobre datos de habla, puede reflejar sesgos demográficos o dialectales presentes en el corpus de entrenamiento, que no está documentado.
- Sin soporte para decodificación autoregresiva: al ser CTC, no puede incorporar contexto lingüístico adicional de forma sencilla; para mejorar la precisión podría requerirse un modelo de lenguaje externo.
- Contexto de audio limitado: no se especifica la duración máxima de audio que puede procesar de una vez; wav2vec2 suele manejar segmentos de hasta 30 segundos, pero no está confirmado.
- Fecha de creación futura (2026-08-17): el modelo tiene una fecha de creación inusualmente reciente, lo que podría indicar un error en el registro o un lanzamiento muy reciente; verificar la validez del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/uctnlp/omniASR-CTC-300M-v2-Zulu-No-Lwazi
- Variante Baseline: https://huggingface.co/uctnlp/omniASR-CTC-300m-v2-Zulu-Baseline
- Variante Zulu (con licencia apache-2.0): https://huggingface.co/uctnlp/omniASR-CTC-300m-v2-Zulu
- Repositorio OmniLingual de Meta: https://github.com/facebookresearch/omnilingual-asr
- Documentación de modelos CTC en OmniLingual (DeepWiki): https://deepwiki.com/facebookresearch/omnilingual-asr/2.2.2-ctc-models-(fast-asr)
- Notebook de ejemplo en Colab: https://colab.research.google.com/github/NeuralFalconYT/omnilingual-asr-colab/blob/main/Meta_Omnilingual_ASR.ipynb
