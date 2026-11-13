# storyteller-platform/quartznet15x5-ru

## Resumen

QuartzNet 15x5 Russian es un modelo de reconocimiento automático del habla (ASR) para ruso, originalmente entrenado por NVIDIA y publicado en el catálogo NGC como `nvidia/stt_ru_quartznet15x5`. Este repositorio, mantenido por storyteller-platform, no es un entrenamiento nuevo, sino una conversión y empaquetado del modelo en formatos ONNX (incluyendo una variante en FP16) y MLX, pensado para su integración en la plataforma Storyteller a través de su registro de modelos y la herramienta ghost-story.

El modelo emplea la arquitectura QuartzNet 15x5, una red convolucional de tipo 1D con bloques residuales y separable convolutions, diseñada para transcripción de voz con un coste computacional moderado. Su relevancia radica en que ofrece una alternativa ligera y desplegable en múltiples runtimes (onnxruntime, MLX) sin necesidad de un extractor de características externo, ya que el front-end mel está embebido en el grafo ONNX.

El repositorio ocupa 0,2 GB y no registra descargas ni interacciones en Hugging Face en el momento de la consulta. La información pública disponible sobre hiperparámetros, datos de entrenamiento y rendimiento es limitada, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | QuartzNet 15x5 (CNN 1D con bloques residuales y separable convolutions) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; opera sobre ventanas de audio, no sobre tokens de texto) |
| Tipos de cuantizacion | FP32 (ONNX), FP16 (ONNX); pesos MLX en safetensors |
| Idiomas soportados | Ruso (ru) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`model.onnx`, `model_fp16.onnx`), safetensors (`model.safetensors` para MLX) |

## Arquitectura y entrenamiento

QuartzNet 15x5 es una red neuronal convolucional unidimensional compuesta por 15 bloques residuales con 5 sub-bloques cada uno, que emplea convoluciones separables en profundidad para reducir el número de parámetros frente a convoluciones estándar. El modelo original fue entrenado por NVIDIA sobre corpus de habla en ruso y publicado en el catálogo NGC. No se dispone en la información proporcionada del número exacto de parámetros, del volumen de horas de audio de entrenamiento ni de la composición del dataset.

La conversión realizada por storyteller-platform incorpora una innovación relevante de empaquetado: el front-end mel (pre-énfasis, padding reflectivo, STFT implementada como convolución, proyección mel, logaritmo y normalización por característica) se integra dentro del grafo ONNX. Esto permite que el modelo reciba la señal pre-procesada directamente y funcione en cualquier execution provider de onnxruntime sin un extractor de características separado. La variante `model_fp16.onnx` mantiene el front-end en precisión simple y convierte únicamente el encoder a media precisión. Los scripts de conversión (`convert.py`, `export-onnx.py`) están publicados en el repositorio GitLab de Storyteller.

## Capacidades

- Reconocimiento automático del habla en ruso: transcripción de audio a texto.
- Ejecución sin extractor de características externo gracias al front-end mel embebido en el grafo ONNX.
- Compatibilidad con múltiples execution providers de onnxruntime (CPU, y potencialmente otros según el runtime).
- Variante FP16 para inferencia con menor huella de memoria.
- Pesos en formato safetensors para carga en MLX (entorno Apple Silicon).
- No se ha documentado soporte de tool calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo thinking.
- Capacidades multilingües: únicamente ruso según la información disponible.

## Casos de uso

- Transcripción de audio en ruso en pipelines de procesamiento por lotes: el modelo puede integrarse en flujos que conviertan ficheros de audio a texto usando onnxruntime, aprovechando el front-end embebido para evitar dependencias adicionales.
- Subtitulado automático de contenido audiovisual en ruso: adecuado para generar pistas de subtítulos en plataformas de publicación, dado su tamaño reducido (0,2 GB) y su licencia permisiva.
- Integración en aplicaciones de lectura o narración (Storyteller): el repositorio está específicamente empaquetado para el registro de modelos de Storyteller y su instalación mediante ghost-story, lo que facilita su uso en aplicaciones de accesibilidad y lectura.
- Despliegue en entornos Apple Silicon mediante MLX: la variante safetensors permite ejecutar la inferencia en hardware Apple con el stack MLX, útil para aplicaciones de escritorio o locales.
- Procesamiento en el borde (edge) o en CPU: al ser un modelo convolucional ligero y ofrecer una variante FP16, es viable en servidores sin GPU dedicada o en dispositivos con recursos limitados.
- Investigación y evaluación de ASR en ruso: sirve como línea base reproducible para comparar con modelos acústicos más recientes, gracias a su licencia CC-BY-4.0 y a la disponibilidad de los scripts de conversión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio completo ocupa 0,2 GB, por lo que la huella en memoria es reducida y compatible con GPUs de gama baja o incluso CPU.
- GPU recomendadas: no disponible. Por el tamaño del modelo, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería ser suficiente, aunque no se han publicado mediciones.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del repositorio, aunque no se confirma con datos de rendimiento.
- Opciones de despliegue: onnxruntime (variantes `model.onnx` y `model_fp16.onnx`), MLX (variante safetensors), e integración con Storyteller mediante ghost-story.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| QuartzNet 15x5 Russian (este repo) | QuartzNet 15x5 | Ruso | CC-BY-4.0 | ONNX, safetensors (MLX) | Conversión de `nvidia/stt_ru_quartznet15x5` con front-end embebido |
| nvidia/stt_ru_quartznet15x5 | QuartzNet 15x5 | Ruso | CC-BY-4.0 | NeMo (.nemo) | Modelo original de NVIDIA en NGC |
| OpenVoiceOS/stt_ru_quartznet15x5_onnx | QuartzNet 15x5 | Ruso | no disponible | ONNX | Exportación ONNX de origen usada para esta conversión |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en ruso; no soporta otros idiomas según la información disponible.
- Al ser un modelo ASR convolucional clásico, no incorpora capacidades de razonamiento, tool calling ni agentes.
- No se han publicado métricas de precisión (WER/CER) en la información disponible, por lo que no es posible evaluar su calidad objetiva frente a alternativas.
- Riesgo de errores de transcripción en audio con ruido, acentos marcados o vocabulario técnico, inherente a los modelos ASR; no cuantificado en esta ficha.
- La licencia CC-BY-4.0 permite uso comercial con atribución; es necesario conservar la atribución a NVIDIA y a los conversores.
- El repositorio no registra descargas ni validación comunitaria, lo que reduce la evidencia sobre su correcto funcionamiento en producción.
- El front-end embebido asume un pipeline de pre-énfasis y padding reflectivo concreto; cualquier uso fuera de ese contrato de entrada puede degradar los resultados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/storyteller-platform/quartznet15x5-ru
- Modelo original NVIDIA en NGC: https://catalog.ngc.nvidia.com/orgs/nvidia/models/stt_ru_quartznet15x5
- Exportación ONNX de origen: https://huggingface.co/OpenVoiceOS/stt_ru_quartznet15x5_onnx
- Repositorio GitLab de Storyteller (scripts de conversión): https://gitlab.com/storyteller-platform/storyteller/-/tree/main/libraries/mlx-audio/scripts
- Registro de modelos de Storyteller (referencia en la model card): https://gitlab.com/storyteller-platform/storyteller/-/ml/models/quartznet15x5-ru
