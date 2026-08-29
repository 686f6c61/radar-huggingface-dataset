# zala8888/paraformer-zh

## Resumen

El modelo `zala8888/paraformer-zh` es una copia en Hugging Face del modelo original `funasr/paraformer-zh`, un sistema de reconocimiento automático de voz (ASR) para chino mandarín desarrollado por el equipo de FunASR (Alibaba). Este modelo se caracteriza por ser no autorregresivo: en lugar de generar texto token a token de forma secuencial, produce la transcripción completa en paralelo, lo que acelera la inferencia aproximadamente 10 veces en comparación con modelos autorregresivos equivalentes. La arquitectura se basa en un transformer con un mecanismo llamado CIF (Continuous Integrate-and-Fire) que permite alinear la entrada de audio con la salida de texto de manera eficiente.

El modelo original fue entrenado sobre 60 000 horas de audio en mandarín y cuenta con 220 millones de parámetros. Es relevante para aplicaciones de transcripción en tiempo real, subtitulado y asistentes de voz en chino, donde la baja latencia y el alto rendimiento son críticos. La copia `zala8888/paraformer-zh` no aporta información adicional en su model card más allá de la licencia Apache 2.0, por lo que todos los datos técnicos aquí presentados provienen de la documentación del modelo original de FunASR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer no autorregresivo con mecanismo CIF (Continuous Integrate-and-Fire) |
| Parametros totales | 220 millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada de audio, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Chino mandarín |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (presumible, no confirmado en la copia) |

## Arquitectura y entrenamiento

El modelo original `paraformer-zh` emplea una arquitectura transformer no autorregresiva. A diferencia de los ASR autorregresivos (como Whisper), que generan caracteres uno a uno, este modelo produce la secuencia completa de caracteres en paralelo. Para ello utiliza el mecanismo CIF, que integra la información acústica de forma continua y la segmenta en unidades discretas correspondientes a caracteres o subpalabras. Esto reduce drásticamente el tiempo de inferencia, especialmente en GPUs, al eliminar la dependencia secuencial.

El entrenamiento se realizó sobre 60 000 horas de audio en mandarín, con un enfoque supervisado estándar para ASR. No se han publicado detalles sobre el uso de RLHF o DPO, ya que no es un modelo de lenguaje generativo sino un modelo de reconocimiento de voz. La innovación principal reside en la decodificación paralela y el mecanismo CIF, que permite una alineación implícita entre audio y texto sin necesidad de un módulo de alineación externo.

## Capacidades

- Reconocimiento de voz en chino mandarín con alta precisión.
- Transcripción de audio a texto en tiempo real gracias a la decodificación no autorregresiva.
- Inferencia aproximadamente 10 veces más rápida que modelos autorregresivos de tamaño similar.
- Soporte para audio de entrada variable (no requiere ventanas fijas).
- Integración con el ecosistema FunASR para pipelines de VAD, puntuación y diarización.
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente de ASR.

## Casos de uso

- Transcripción de reuniones y conferencias en mandarín: el modelo puede procesar audio en tiempo real y generar subtítulos o actas con baja latencia, gracias a su inferencia paralela.
- Subtitulado automático de vídeos en chino: se puede integrar en pipelines de postproducción para generar subtítulos sincronizados de forma rápida y económica.
- Asistentes de voz en aplicaciones móviles: al ser ligero (220M parámetros), puede desplegarse en servidores con GPUs modestas y responder a comandos de voz con baja latencia.
- Servicios de transcripción médica o legal en mandarín: la alta velocidad permite procesar grandes volúmenes de grabaciones en menos tiempo que con modelos autorregresivos.
- Análisis de llamadas de atención al cliente: combinado con herramientas de diarización, permite transcribir conversaciones telefónicas para su posterior análisis de sentimiento o cumplimiento normativo.
- Accesibilidad para personas con discapacidad auditiva: el modelo puede alimentar sistemas de subtitulado en directo para eventos o emisiones en chino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentación del modelo original menciona una mejora de velocidad de 10x frente a modelos autorregresivos, pero no se proporcionan cifras concretas de WER (Word Error Rate) ni comparaciones con otros sistemas en la información recopilada.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 220M parámetros, la inferencia en FP32 requiere aproximadamente 0,9 GB de VRAM; en FP16 se reduce a unos 0,45 GB. Con cuantización INT8 podría bajar a ~0,25 GB, aunque no se han publicado configuraciones oficiales de cuantización.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Tarjetas como NVIDIA GTX 1050 Ti, RTX 2060 o superiores pueden ejecutarlo sin problemas. También funciona en CPUs con razonable rendimiento.
- Despliegue: se puede servir mediante el framework FunASR, que ofrece opciones de inferencia en lote y en streaming. También es compatible con pipelines de VAD y puntuación del mismo ecosistema.
- Latencia y throughput: no se han publicado mediciones exactas, pero la arquitectura no autorregresiva permite procesar un audio de 10 segundos en menos de 1 segundo en una GPU moderna, según las afirmaciones del equipo de FunASR.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Idiomas | Licencia | Velocidad relativa |
|---|---|---|---|---|---|
| paraformer-zh (FunASR) | 220M | No autorregresivo (CIF) | Mandarín | Apache 2.0 | ~10x más rápido que autorregresivos |
| Whisper small (OpenAI) | 244M | Autorregresivo | Multilingüe (99 idiomas) | MIT | Línea base (1x) |
| Wav2Vec2 (base) | 95M | Convolucional + transformer | Multilingüe (depende del checkpoint) | Apache 2.0 | ~2-3x más rápido que Whisper (no autorregresivo) |

La comparativa se basa en datos públicos de los respectivos modelos. `paraformer-zh` destaca por su velocidad en mandarín, mientras que Whisper ofrece mayor cobertura de idiomas a costa de latencia. Wav2Vec2 es más ligero pero requiere fine-tuning para ASR y no está optimizado para mandarín de serie.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en chino mandarín; no reconoce otros idiomas ni dialectos regionales con precisión.
- Al ser un modelo ASR, no tiene capacidades de comprensión semántica ni generación de texto más allá de la transcripción literal.
- Puede presentar errores en audio con ruido de fondo, acentos no estándar o jerga técnica, como cualquier sistema ASR.
- La copia `zala8888/paraformer-zh` no incluye documentación adicional ni verificación de integridad; se recomienda usar el repositorio oficial `funasr/paraformer-zh` para entornos de producción.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir correctamente la autoría del modelo original.
- No se han publicado análisis de sesgos específicos para este modelo; es posible que tenga un rendimiento inferior con hablantes de regiones no representadas en los datos de entrenamiento.

## Enlaces

- Repositorio de la copia: https://huggingface.co/zala8888/paraformer-zh
- Modelo original en Hugging Face: https://huggingface.co/funasr/paraformer-zh
- Árbol de archivos del modelo original: https://huggingface.co/funasr/paraformer-zh/tree/main
- Artículo técnico sobre Paraformer-zh: https://www.emergentmind.com/topics/paraformer-zh
- Resumen y casos de uso: https://www.aimodels.fyi/models/huggingFace/paraformer-zh-funasr
- Wiki de FunASR en GitHub: https://github.com/modelscope/FunASR/wiki/paraformer
