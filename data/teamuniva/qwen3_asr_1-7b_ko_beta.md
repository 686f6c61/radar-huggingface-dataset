# TeamUNIVA/qwen3_asr_1.7b_ko_beta

## Resumen

TeamUNIVA/qwen3_asr_1.7b_ko_beta es un modelo de reconocimiento automático del habla (ASR) especializado en coreano, desarrollado por TeamUNIVA como un fine-tuning del modelo base Qwen/Qwen3-ASR-1.7B de Alibaba. Este modelo resuelve el problema de la transcripción precisa de audio en coreano, mejorando significativamente la tasa de error de caracteres (CER) en comparación con el modelo base en varios conjuntos de datos de referencia coreanos, mientras mantiene un rendimiento prácticamente idéntico en inglés.

El modelo se basa en la arquitectura de Qwen3-ASR, que a su vez deriva de Qwen3-Omni, y cuenta con aproximadamente 2.350 millones de parámetros. Está diseñado para ser utilizado con la librería `qwen-asr` y se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones. Su relevancia actual radica en ofrecer una alternativa de código abierto y de alta precisión para transcripción de voz coreana, con un coste computacional moderado y fácil integración en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3-ASR-1.7B, derivada de Qwen3-Omni) |
| Parametros totales | 2.349.217.408 (2,35 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (modelo de audio, la ventana depende de la duración del audio procesado) |
| Tipos de cuantizacion | no especificados por el autor; compatible con cuantización estándar (safetensors) |
| Idiomas soportados | Coreano (optimizado); herencia del base para otros idiomas, pero sin validación |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del Qwen3-ASR-1.7B, un modelo de reconocimiento de voz que forma parte de la familia Qwen3-ASR. Esta familia se basa en el modelo fundacional Qwen3-Omni, que integra capacidades de comprensión de audio y lenguaje. Qwen3-ASR-1.7B soporta identificación de idioma y ASR para 52 idiomas y dialectos, y fue entrenado con grandes volúmenes de datos de habla. El fine-tuning realizado por TeamUNIVA se centró exclusivamente en datos de habla coreana, con el objetivo de reducir la tasa de error en transcripciones de ese idioma. No se han publicado detalles específicos sobre el proceso de entrenamiento (número de épocas, tamaño del dataset, técnicas de alineación), pero los resultados de evaluación indican una mejora consistente en todos los benchmarks coreanos probados.

## Capacidades

- Reconocimiento automático del habla en coreano con alta precisión, superando al modelo base en todos los conjuntos de prueba coreanos evaluados.
- Transcripción de audio en inglés con rendimiento prácticamente idéntico al modelo base (WER 0.0246 vs 0.0250).
- Integración sencilla mediante la librería `qwen-asr`, que permite transcribir archivos de audio directamente.
- Soporte para procesamiento por lotes (batch) con `max_inference_batch_size` configurable.
- Capacidad de identificación de idioma heredada del modelo base, aunque no se ha validado específicamente en este fine-tuning.
- No se documentan capacidades de tool calling, agentes o razonamiento multi-paso, ya que es un modelo puramente ASR.

## Casos de uso

- Transcripción de reuniones y conferencias en coreano: el modelo puede procesar grabaciones de audio largas y generar transcripciones con baja tasa de error, útil para actas automáticas o búsqueda de contenido.
- Subtitulado automático de vídeos en coreano: integrable en pipelines de postproducción para generar subtítulos precisos, reduciendo el trabajo manual de revisión.
- Atención al cliente automatizada: transcripción de llamadas telefónicas en coreano para análisis de sentimiento, evaluación de calidad o extracción de información, gracias a su robustez en habla conversacional (mejora de 1.55 puntos porcentuales en clova_call).
- Asistentes de voz en coreano: como backend de reconocimiento para comandos de voz o dictado, con latencia moderada y buena precisión en entornos controlados.
- Archivado y búsqueda de contenido audiovisual: transcripción de archivos históricos en coreano para indexación y búsqueda por texto, aprovechando la licencia Apache 2.0 para uso comercial.
- Investigación académica en ASR: como punto de partida para experimentos de fine-tuning o comparación con otros modelos, dado que su rendimiento está documentado en benchmarks públicos.

## Benchmarks y rendimiento

Los resultados de evaluación proporcionados por el autor comparan el modelo con el base Qwen3-ASR-1.7B. Las métricas son CER (Character Error Rate) para coreano y WER (Word Error Rate) para inglés. Valores más bajos indican mejor rendimiento.

| Dataset | Metrica | Qwen3-ASR-1.7B (base) | Este modelo | Cambio (%p) |
|---|---|---|---|---|
| clova_call | CER | 0.0448 | **0.0293** | -1.55 |
| common_voice_ko | CER | 0.0719 | **0.0628** | -0.91 |
| fleurs_ko | CER | 0.0142 | **0.0138** | -0.04 |
| ksponspeech | CER | 0.0865 | **0.0670** | -1.95 |
| zeroth | CER | 0.0264 | **0.0230** | -0.34 |
| **Total coreano** | CER | **0.0686** | **0.0537** | **-1.49** |
| librispeech (ingles, referencia) | WER | 0.0250 | 0.0246 | -0.04 |

El conjunto de evaluación fue revisado manualmente por el autor, filtrando transcripciones de baja calidad y corrigiendo errores. Se retuvieron 8.383 de 8.489 registros originales. No se han publicado resultados en otros benchmarks (MMLU, HumanEval, etc.) porque el modelo es exclusivamente ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: con precisión bfloat16, el modelo requiere aproximadamente 4,7 GB de VRAM (2,35 B parámetros × 2 bytes). Con cuantización a 8 bits, se reduce a ~2,4 GB; con 4 bits, ~1,2 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para bfloat16 (p. ej., RTX 3060, RTX 4060, A10). Para cuantización ligera, GPUs con 4 GB pueden ser suficientes (p. ej., RTX 3050, GTX 1660).
- Es compatible con GPUs de consumo (serie RTX) y GPUs de centro de datos (A100, H100) mediante la librería `qwen-asr`, que internamente utiliza PyTorch y puede aprovechar CUDA.
- Opciones de despliegue: la librería `qwen-asr` es la vía principal; también se puede exportar a formatos como ONNX o TensorRT para optimización, aunque no está documentado oficialmente.
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de 2,35 B, se espera una latencia de decodificación de unos pocos cientos de milisegundos por utterance corto en una GPU moderna, con throughput dependiente del tamaño del batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento en coreano (CER) |
|---|---|---|---|---|---|
| TeamUNIVA/qwen3_asr_1.7b_ko_beta | 2,35 B | no disponible | Coreano (optimizado) | Apache 2.0 | 0.0537 (total coreano) |
| Qwen3-ASR-1.7B (base) | 2,35 B | no disponible | 52 idiomas | Apache 2.0 | 0.0686 (total coreano) |
| Whisper large-v3 (referencia) | 1,55 B | 30 s de audio | 99 idiomas | MIT | no disponible (no evaluado en este estudio) |

La comparación directa con Whisper no está disponible en los datos proporcionados, pero el modelo supera claramente a su base en coreano, lo que lo hace más adecuado para aplicaciones centradas en ese idioma. Whisper large-v3 es una alternativa generalista, pero su rendimiento en coreano puede ser inferior según evaluaciones externas (no verificadas aquí).

## Limitaciones y advertencias

- El modelo está fine-tuneado específicamente para coreano; su rendimiento en otros idiomas no ha sido validado y podría degradarse respecto al base.
- La evaluación se realizó en conjuntos de datos revisados manualmente y en condiciones controladas; en entornos reales con ruido, acentos o habla solapada, los resultados pueden variar.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos de habla, puede presentar sesgos hacia variedades dialectales o demográficas no representadas en los datos de entrenamiento.
- Riesgo de alucinación: como todo modelo ASR, puede generar transcripciones incorrectas en audio ambiguo o de baja calidad; se recomienda validación humana en aplicaciones críticas.
- No se proporcionan detalles sobre el dataset de fine-tuning, lo que limita la reproducibilidad y la evaluación de posibles sesgos.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución y no se otorgan garantías implícitas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TeamUNIVA/qwen3_asr_1.7b_ko_beta
- Repositorio oficial de Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- Technical report de Qwen3-ASR: https://arxiv.org/html/2601.21337
- Qwen3-ASR Toolkit: https://github.com/QwenLM/Qwen3-ASR-Toolkit
