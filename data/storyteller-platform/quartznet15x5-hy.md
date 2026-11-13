# storyteller-platform/quartznet15x5-hy

## Resumen

QuartzNet 15x5 Armenian es un modelo de reconocimiento automático del habla (ASR) especializado en armenio, publicado por storyteller-platform como espejo en su registro de modelos. El modelo original fue entrenado por anah1tbaghdassarian y ajustado sobre el corpus Common Voice 17.0, alcanzando una tasa de error de palabras (WER) del 11,75 % en dicho conjunto. Esta versión concreta del repositorio no es un entrenamiento nuevo, sino una conversión de formatos: parte de la exportación ONNX de OpenVoiceOS y se redistribuye en dos variantes, ONNX y MLX, junto con los pesos en `safetensors`.

La relevancia de este modelo reside en su formato de despliegue. Frente a la exportación original, el `model.onnx` que acompaña al repositorio incorpora el front end mel dentro del propio grafo: la STFT se implementa como una convolución, seguida de la proyección mel, el logaritmo y la normalización por característica. Esto permite ejecutar el modelo en cualquier execution provider de onnxruntime sin necesidad de un extractor de características separado, lo que simplifica la integración en pipelines de producción.

Arquitectónicamente es un QuartzNet 15x5, una red convolucional 1D con 15 bloques y 5 subbloques por bloque, típica de la familia Jasper/QuartzNet de NVIDIA NeMo. El repositorio ocupa 0,2 GB y ofrece los pesos tanto en precisión simple como en FP16 para ONNX, además de una variante MLX pensada para Apple Silicon. La licencia es CC-BY-4.0, lo que permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | QuartzNet 15x5 (CNN 1D, familia Jasper/QuartzNet de NeMo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, procesa audio, no texto) |
| Tipos de cuantizacion | FP32 y FP16 (ONNX); pesos en safetensors para MLX |
| Idiomas soportados | armenio (hy-AM) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors, ONNX (model.onnx, model_fp16.onnx) |

## Arquitectura y entrenamiento

QuartzNet 15x5 es una red neuronal convolucional 1D con 15 bloques residuales y 5 subbloques por bloque, diseñada específicamente para ASR. A diferencia de los transformers, no emplea atención: la totalidad del cómputo se basa en convoluciones depthwise separables, lo que reduce drásticamente el número de parámetros y el coste de inferencia en comparación con modelos acústicos basados en atención. El modelo original se entrenó con el framework NVIDIA NeMo sobre el corpus Common Voice 17.0 en armenio, y el resultado reportado por el autor es un WER del 11,75 % en ese conjunto.

La versión de este repositorio no reentrena el modelo, sino que lo reconvierte. El `model.safetensors` contiene los pesos del encoder en el layout que espera el cargador de MLX, junto con el filterbank mel y la ventana del front end de NeMo. El `model.onnx` se genera con `export-onnx.py` a partir de esos pesos e integra el front end completo en el grafo: recibe la señal preenfatizada y con padding reflectivo, ejecuta la STFT como convolución, aplica la proyección mel, el logaritmo y la normalización por característica. El `model_fp16.onnx` mantiene el front end en precisión simple y pasa el encoder a media precisión. No se dispone de información sobre el número exacto de tokens de audio, la composición detallada del dataset ni si hubo etapas de ajuste fino adicionales más allá del entrenamiento original.

## Capacidades

- Reconocimiento automático del habla en armenio (hy-AM) a partir de audio en formato de onda.
- Transcripción de audio preenfatizado y con padding reflectivo en la variante ONNX, sin extractor de características externo.
- Ejecución en cualquier execution provider de onnxruntime (CPU, CUDA, CoreML, etc.) gracias a la integración del front end mel en el grafo.
- Inferencia en Apple Silicon mediante la variante MLX en `safetensors`.
- Inferencia en FP16 para reducir el uso de memoria y aumentar el throughput en GPUs compatibles.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente acústico.
- No dispone de capacidades multimodales más allá del audio de entrada y texto de salida (transcripción).

## Casos de uso

- Transcripción de audio en armenio para aplicaciones de subtitulado: el modelo convierte audio en texto con un WER de referencia del 11,75 % en Common Voice 17.0, adecuado para generar subtítulos borrador que luego se revisan manualmente.
- Integración en asistentes de voz para armenio: al ejecutarse en onnxruntime con el front end incluido, puede desplegarse como servicio de ASR en un backend sin dependencias de NeMo ni de un extractor de features separado.
- Procesamiento por lotes de archivos de audio en pipelines de datos: la variante ONNX permite paralelizar la inferencia en CPU o GPU y procesar grandes volúmenes de grabaciones para construir corpus transcritos.
- Aplicaciones en dispositivos Apple Silicon: la variante MLX en `safetensors` permite ejecutar la transcripción localmente en Macs con chip M-series, sin enviar audio a la nube.
- Investigación lingüística sobre armenio: el modelo sirve como línea base para experimentos de ASR en armenio y para comparar con otros sistemas acústicos o híbridos.
- Despliegue en entornos con restricciones de memoria: la variante FP16 reduce el peso del encoder y facilita la ejecución en GPUs de gama media o en contenedores con límites de VRAM ajustados.
- Verificación y control de calidad de transcripciones existentes: comparar la salida del modelo con transcripciones humanas para detectar segmentos problemáticos en corpus de armenio.

## Benchmarks y rendimiento

| Benchmark | Resultado | Modelo |
|---|---|---|
| WER en Common Voice 17.0 (armenio) | 11,75 % | QuartzNet 15x5 Armenian |

No se han publicado en la información disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) ni comparativas directas con otros modelos ASR en armenio.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; el repositorio completo ocupa 0,2 GB, por lo que el modelo es muy ligero y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU compatible con onnxruntime (CUDA) o con MLX en Apple Silicon; no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 1-2 GB de VRAM libre, dado el tamaño del repositorio.
- Opciones de despliegue: onnxruntime (cualquier execution provider) para las variantes ONNX; MLX para la variante `safetensors` en Apple Silicon. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo ASR convolucional.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | WER (CV 17.0) | Licencia | Formatos |
|---|---|---|---|---|---|
| QuartzNet 15x5 Armenian (este) | CNN 1D QuartzNet 15x5 | Armenio | 11,75 % | CC-BY-4.0 | safetensors, ONNX, ONNX FP16 |
| anah1tbaghdassarian/stt_hy-AM_quartznet15x5_armenian-CV17.0_WER11.75 | CNN 1D QuartzNet 15x5 | Armenio | 11,75 % | CC-BY-4.0 | no disponible |
| OpenVoiceOS/anah1tbaghdassarian-..._onnx | CNN 1D QuartzNet 15x5 | Armenio | 11,75 % | no disponible | ONNX |

No se dispone de información sobre otros modelos ASR comparables en armenio (por ejemplo, variantes de Whisper o Wav2Vec2) en la documentación proporcionada, por lo que no se incluyen en la tabla.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en armenio; no soporta otros idiomas y no debe emplearse para transcripción multilingüe.
- El WER del 11,75 % corresponde a Common Voice 17.0; el rendimiento en audio de dominio real (ruido, acentos, micrófonos distintos) puede degradarse significativamente.
- Es un modelo acústico puro: no realiza puntuación, diarización ni corrección gramatical; la salida es una secuencia de tokens.
- Riesgo de errores en nombres propios, términos técnicos y palabras poco frecuentes, habitual en modelos ASR entrenados con corpus de lectura.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribución al autor original y a las conversiones; conviene revisar los términos de los modelos de origen enlazados.
- No se dispone de información sobre sesgos específicos del corpus Common Voice en armenio (posible sobrerrepresentación de determinados acentos o registros).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación comunitaria.
- La fecha de creación indicada (2026-11-13) es futura respecto a la información habitual de Hugging Face; conviene verificar la integridad del repositorio antes de usarlo en producción.
- No se documentan limitaciones de longitud de audio ni de segmentación; es responsabilidad del integrador trocear el audio adecuadamente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/storyteller-platform/quartznet15x5-hy
- Modelo original: https://huggingface.co/anah1tbaghdassarian/stt_hy-AM_quartznet15x5_armenian-CV17.0_WER11.75
- Exportación ONNX de origen: https://huggingface.co/OpenVoiceOS/anah1tbaghdassarian-stt_hy-AM_quartznet15x5_armenian-CV17.0_WER11.75_onnx
- Repositorio GitLab de Storyteller (scripts de conversión): https://gitlab.com/storyteller-platform/storyteller/-/tree/main/libraries/mlx-audio/scripts
- Registro del modelo en Storyteller: https://gitlab.com/storyteller-platform/storyteller/-/ml/models/quartznet15x5-hy
