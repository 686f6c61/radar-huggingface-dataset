# storyteller-platform/quartznet15x5-es

## Resumen

QuartzNet 15x5 Spanish es un modelo de reconocimiento automático del habla (ASR) para castellano, originalmente entrenado por NVIDIA y publicado en su catálogo NGC como `nvidia/stt_es_quartznet15x5`. La versión alojada en este repositorio es un espejo mantenido por storyteller-platform dentro de su registro de modelos, con conversiones a formatos ONNX y MLX orientadas a su integración en la aplicación Storyteller a través de la herramienta ghost-story.

El modelo emplea la arquitectura QuartzNet, una red neuronal convolucional de tipo 1D con bloques residuales y separable convolutions, sin atención ni recurrencia. La variante 15x5 indica 15 bloques convolucionales con kernel de tamaño 5, un diseño compacto y eficiente en cómputo que históricamente ha ofrecido una relación calidad/latencia muy favorable para transcripción en tiempo real en CPU.

La relevancia de esta ficha es fundamentalmente práctica: se trata de un artefacto de despliegue (no de un entrenamiento nuevo) que empaqueta pesos, front-end mel y grafo ONNX autocontenido para que la inferencia funcione en cualquier execution provider de onnxruntime sin extractor de características externo. Es útil para quien necesite ASR en castellano en entornos con recursos limitados o para integrar transcripción en aplicaciones de narración/lectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | QuartzNet 15x5 (CNN 1D con bloques residuales y separable convolutions) |
| Parametros totales | no disponible (repo de 0,2 GB con pesos en safetensors y ONNX) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana dependiente del audio de entrada) |
| Tipos de cuantizacion | FP32 (ONNX y safetensors) y FP16 (encoder en `model_fp16.onnx`, front-end en FP32) |
| Idiomas soportados | castellano (es) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (MLX), ONNX (`model.onnx`, `model_fp16.onnx`) |

## Arquitectura y entrenamiento

QuartzNet es una arquitectura convolucional pura para ASR: apila bloques residuales compuestos por convoluciones separables en profundidad (depthwise separable) seguidas de convoluciones punto a punto, con normalización por lotes y activación ReLU. La variante 15x5 corresponde a 15 bloques con kernel de 5, un compromiso entre capacidad y coste computacional que la hace adecuada para inferencia en CPU. El front-end es un extractor de características mel (STFT, proyección mel, logaritmo y normalización por característica), que en esta conversión se ha integrado dentro del grafo ONNX.

El entrenamiento original es de NVIDIA y no se detalla en la información disponible: no se especifican horas de audio, composición del dataset, ni si hubo data augmentation o ajuste fino posterior. Tampoco se documenta el uso de técnicas como decodificación con beam search o modelos de lenguaje externos. La innovación destacable de esta versión concreta es de ingeniería de despliegue: el grafo ONNX incluye el front-end mel completo, de modo que acepta la señal pre-énfasis con reflect padding en lugar de características precalculadas, y la STFT se ejecuta como una convolución, lo que permite ejecutar el modelo en cualquier execution provider de onnxruntime sin dependencias de NeMo.

## Capacidades

- Reconocimiento automático del habla en castellano a partir de audio de entrada.
- Transcripción de voz a texto con salida a nivel de carácter o token según el vocabulario (`vocab.txt`) del modelo.
- Extracción de características mel integrada en el propio grafo ONNX (no requiere front-end externo).
- Ejecución en CPU y GPU a través de onnxruntime con distintos execution providers.
- Ejecución en Apple Silicon mediante el formato MLX (`model.safetensors`).
- Soporte de precisión mixta mediante `model_fp16.onnx` para reducir memoria y acelerar inferencia en hardware compatible.
- No soporta tool calling, agentes, visión ni audio multimodal; es un modelo ASR puro.

## Casos de uso

- Transcripción de audiolibros y contenido narrado: Storyteller usa este modelo para generar texto alineado con la narración, aprovechando que el grafo ONNX autocontenido simplifica el despliegue en la aplicación.
- Subtitulado automático de vídeo en castellano: el modelo puede procesar segmentos de audio y producir transcripciones sincronizadas, con latencia baja gracias a la arquitectura convolucional.
- Dictado por voz en aplicaciones de escritorio: al ser un modelo compacto (repo de 0,2 GB) y ejecutable en CPU, es viable integrarlo localmente sin depender de servicios en la nube.
- Indexación y búsqueda de archivos de audio: transcribir grabaciones para hacerlas buscables por texto en archivos personales o corporativos.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en entornos donde no se quiere enviar audio a terceros.
- Procesamiento por lotes de archivos de audio en pipelines de datos: la variante FP16 permite mayor throughput en GPU para transcripciones masivas.
- Asistentes de voz embebidos: el modelo puede servir como etapa ASR en un pipeline local de comandos de voz en castellano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio completo ocupa 0,2 GB, por lo que la huella en memoria de los pesos es del orden de cientos de MB en FP32 y menor en FP16.
- GPU recomendadas: no especificadas por el autor; al ser un modelo convolucional compacto, cualquier GPU con soporte de onnxruntime (por ejemplo, RTX 4090, A100, H100) puede ejecutarlo, aunque el modelo está pensado también para CPU.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna; no se dispone de cifras exactas de VRAM.
- Opciones de despliegue: onnxruntime (cualquier execution provider), MLX en Apple Silicon, y la integración propia de Storyteller mediante ghost-story.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| QuartzNet 15x5 ES (este) | CNN 1D | castellano | CC-BY-4.0 | ONNX, safetensors (MLX) | Front-end mel integrado en el grafo ONNX |
| nvidia/stt_es_quartznet15x5 | CNN 1D | castellano | CC-BY-4.0 | NeMo, ONNX | Modelo original de NVIDIA en NGC |
| OpenVoiceOS/stt_es_quartznet15x5_onnx | CNN 1D | castellano | no disponible | ONNX | Exportación ONNX de la que deriva esta conversión |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo ASR puro: no genera texto libre, no razona y no soporta instrucciones; su única función es transcribir audio.
- Solo castellano: no se documentan otros idiomas ni capacidad multilingüe.
- Sesgos: no documentados; al ser un modelo entrenado por NVIDIA sin información sobre el dataset, se desconoce su cobertura de acentos, dialectos y condiciones acústicas.
- Riesgo de errores de transcripción en audio con ruido, solapamiento de hablantes o vocabulario especializado; no se han publicado métricas de WER en esta ficha.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar a NVIDIA y respetar los términos de la licencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: es un espejo de despliegue, no un modelo con comunidad activa ni soporte garantizado.
- La conversión a ONNX y MLX es responsabilidad de storyteller-platform; no hay garantía de equivalencia numérica exacta con el modelo original de NVIDIA.
- El formato FP16 mantiene el front-end en FP32, por lo que la ganancia de memoria es parcial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/storyteller-platform/quartznet15x5-es
- Modelo original de NVIDIA en NGC: https://catalog.ngc.nvidia.com/orgs/nvidia/models/stt_es_quartznet15x5
- Exportación ONNX de OpenVoiceOS: https://huggingface.co/OpenVoiceOS/stt_es_quartznet15x5_onnx
- Repositorio de Storyteller (scripts de conversión): https://gitlab.com/storyteller-platform/storyteller/-/tree/main/libraries/mlx-audio/scripts
- Registro de modelos de Storyteller: https://gitlab.com/storyteller-platform/storyteller/-/ml/models/quartznet15x5-es
