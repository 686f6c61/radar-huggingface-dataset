# storyteller-platform/quartznet15x5-en

## Resumen

QuartzNet 15x5 English es un modelo de reconocimiento automático del habla (ASR) en inglés, originalmente entrenado por NVIDIA y publicado en su catálogo NGC como `stt_en_quartznet15x5`. Esta ficha concreta corresponde a un espejo mantenido por el proyecto Storyteller, que redistribuye los pesos convertidos a formatos ONNX y MLX dentro de su registro de modelos. No se trata de un modelo de lenguaje generativo, sino de un sistema de transcripción de voz a texto basado en la arquitectura QuartzNet, una red convolucional con bloques residuales y convoluciones separables en profundidad.

El modelo resuelve la tarea de convertir audio en texto para inglés, con un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de modelos ASR ligeros aptos para inferencia en CPU o en hardware modesto. La relevancia de esta versión radica en su empaquetado: incluye el front end mel completo dentro del grafo ONNX, de modo que el modelo consume señal de audio preprocesada en lugar de características, y funciona en cualquier execution provider de onnxruntime sin extractor de features separado. También se ofrece una variante MLX para Apple Silicon.

La licencia CC-BY-4.0 permite uso comercial con atribución. La información disponible es limitada: no se documentan resultados de benchmarks en esta ficha, no se especifican parámetros totales ni longitud de contexto, y el pipeline de Hugging Face no está declarado. Las cifras de arquitectura que aparecen a continuación se derivan de la nomenclatura estándar de QuartzNet y de los datos de la model card, no de una ficha técnica completa del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | QuartzNet 15x5 (red convolucional con bloques residuales y convoluciones separables en profundidad) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, no generativo) |
| Tipos de cuantizacion | FP32 (ONNX), FP16 (ONNX con encoder en media precision), pesos safetensors para MLX |
| Idiomas soportados | ingles |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (MLX), ONNX (model.onnx y model_fp16.onnx) |

## Arquitectura y entrenamiento

QuartzNet es una arquitectura convolucional de tipo CTC para reconocimiento de voz, compuesta por bloques residuales que emplean convoluciones separables en profundidad y convoluciones 1x1. La denominación 15x5 indica 15 bloques residuales con 5 subcapas cada uno, un patrón habitual en la familia QuartzNet de NVIDIA. El modelo original fue entrenado por NVIDIA y publicado en NGC; esta ficha no incluye detalles sobre el corpus de entrenamiento, el número de horas de audio ni si hubo aumentación de datos o decodificación con modelo de lenguaje externo.

La innovación de esta versión concreta está en el empaquetado. El grafo ONNX incorpora el front end mel completo: la transformada de Fourier de corto tiempo se implementa como convolución, seguida de la proyección mel, el logaritmo y la normalización por característica. El modelo recibe la señal preenfatizada y con padding reflectivo, de modo que no necesita un extractor de características externo y funciona en cualquier execution provider de onnxruntime. La variante FP16 mantiene el front end en precisión simple y el encoder en media precisión. Los pesos safetensors para MLX conservan el layout que espera el cargador de MLX, junto con el banco de filtros mel y la ventana del front end de NeMo.

## Capacidades

- Transcripción de voz a texto en inglés mediante CTC.
- Procesamiento de audio con front end mel integrado en el grafo ONNX, sin extractor de características separado.
- Ejecución en cualquier execution provider de onnxruntime (CPU, CUDA, CoreML, etc.).
- Inferencia en Apple Silicon mediante la variante MLX en safetensors.
- Variante FP16 para reducir requisitos de memoria en el encoder.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No es un modelo generativo: no produce texto libre ni mantiene conversaciones.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Transcripción de audiolibros y contenido editorial: Storyteller integra este modelo a través de ghost-story para generar alineaciones y transcripciones de audio, aprovechando su licencia permisiva y su tamaño reducido para ejecución local.
- Subtitulado automático de vídeo en inglés: el modelo puede procesar pistas de audio segmentadas y producir texto con marcas temporales mediante el decodificador CTC, adecuado para pipelines de postproducción.
- Dictado y notas de voz en aplicaciones de escritorio: al caber en CPU y en Apple Silicon vía MLX, permite transcripción en local sin enviar audio a servicios externos.
- Indexación y búsqueda de archivos de audio: transcripción previa de grabaciones para construir índices de texto searchable en archivos personales o corporativos.
- Accesibilidad: generación de transcripciones en tiempo casi real para contenido pregrabado destinado a personas con discapacidad auditiva.
- Preprocesamiento para pipelines de NLP: conversión de audio a texto como paso previo a análisis de sentimiento, resumen o extracción de entidades en inglés.
- Prototipado y evaluación de ASR: al ser un modelo ligero con exportaciones ONNX y MLX, sirve como baseline reproducible en experimentos de reconocimiento de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; con un repositorio de 0,2 GB, la inferencia en FP32 requiere del orden de cientos de MB y la variante FP16 aproximadamente la mitad en el encoder.
- GPU recomendadas: no se especifican; al ser un modelo convolucional pequeño, cualquier GPU con soporte de onnxruntime (CUDA) es suficiente.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna e incluso en CPU, aunque no se documentan cifras oficiales.
- Opciones de despliegue: onnxruntime (cualquier execution provider), MLX en Apple Silicon; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| QuartzNet 15x5 EN (esta ficha) | QuartzNet convolucional CTC | Inglés | CC-BY-4.0 | ONNX, safetensors (MLX) | Front end mel integrado en ONNX |
| nvidia/stt_en_quartznet15x5 | QuartzNet convolucional CTC | Inglés | CC-BY-4.0 | NeMo, ONNX | Modelo original de NVIDIA en NGC |
| OpenVoiceOS/stt_en_quartznet15x5_onnx | QuartzNet convolucional CTC | Inglés | no disponible | ONNX | Exportación ONNX de origen para esta conversión |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente en inglés; no soporta otros idiomas.
- Al ser un modelo CTC sin modelo de lenguaje externo documentado, puede producir errores en palabras homófonas y nombres propios.
- Riesgo de transcripciones incorrectas en audio con ruido, acentos no estándar o solapamiento de hablantes.
- No se documentan sesgos específicos, pero los sistemas ASR heredan sesgos de los corpus de entrenamiento, no detallados aquí.
- La licencia CC-BY-4.0 exige atribución; es compatible con uso comercial siempre que se cumpla esa condición.
- Esta ficha es un espejo de terceros (Storyteller); la versión de referencia es la de NVIDIA en NGC, y las conversiones ONNX/MLX no están avaladas por NVIDIA.
- No se documentan métricas de calidad (WER) para esta conversión concreta, por lo que se recomienda validar en el dominio de uso antes de producción.
- El modelo no es generativo: no debe emplearse para tareas de lenguaje, razonamiento o generación de texto.

## Enlaces

- Hugging Face: https://huggingface.co/storyteller-platform/quartznet15x5-en
- Modelo original de NVIDIA en NGC: https://catalog.ngc.nvidia.com/orgs/nvidia/models/stt_en_quartznet15x5
- Exportación ONNX de origen: https://huggingface.co/OpenVoiceOS/stt_en_quartznet15x5_onnx
- Repositorio de Storyteller (scripts de conversión): https://gitlab.com/storyteller-platform/storyteller/-/tree/main/libraries/mlx-audio/scripts
- Registro de modelos de Storyteller: https://gitlab.com/storyteller-platform/storyteller/-/ml/models/quartznet15x5-en
