# storyteller-platform/quartznet15x5-fo

## Resumen

QuartzNet 15x5 Faroese es un modelo de reconocimiento automático del habla (ASR) específico para feroés, desarrollado originalmente por Carlos Daniel Hernández Mena y empaquetado por storyteller-platform para su uso en la plataforma Storyteller. El modelo emplea la arquitectura QuartzNet 15x5, una red neuronal convolucional de tipo 1D con bloques residuales y separable convolutions, diseñada para transcripción de voz a texto de forma eficiente. El repositorio mirrors la versión 2.0.0 del registro de modelos de Storyteller y se distribuye en formatos ONNX (fp32 y fp16) y MLX (safetensors).

El modelo resuelve el problema de la transcripción automática de audio en feroés, un idioma de bajos recursos con escasa cobertura en sistemas ASR comerciales. Su tamaño reducido (repo de 0,2 GB) y su licencia permisiva CC-BY-4.0 lo hacen adecuado para integración en aplicaciones de subtitulado, transcripción y accesibilidad. Está pensado para ejecutarse mediante el runtime ghost-story de Storyteller, aunque los formatos ONNX permiten su despliegue en otros entornos compatibles con onnxruntime.

La relevancia actual radica en la escasez de modelos ASR abiertos para lenguas nórdicas minoritarias y en la inclusión del front-end de mel en el propio grafo ONNX, lo que elimina la necesidad de un extractor de características externo y facilita el despliegue en cualquier execution provider de onnxruntime.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | QuartzNet 15x5 (CNN 1D con bloques residuales y separable convolutions) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, no de contexto de texto) |
| Tipos de cuantización | fp32 (model.onnx), fp16 (model_fp16.onnx), safetensors para MLX |
| Idiomas soportados | feroés (fo) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (model.onnx, model_fp16.onnx), safetensors (MLX) |

## Arquitectura y entrenamiento

QuartzNet 15x5 es una arquitectura convolucional 1D compuesta por 15 bloques residuales con 5 sub-bloques cada uno, que emplea separable convolutions para reducir el coste computacional manteniendo la capacidad representacional. El modelo procesa audio mediante un front-end de mel espectrograma que, en esta versión, se ha integrado dentro del propio grafo ONNX: la STFT se ejecuta como una convolución, seguida de la proyección mel, el logaritmo y la normalización por característica. Esto permite que el modelo reciba la señal pre-enfatizada y con padding reflectante directamente, sin necesidad de un extractor de features separado, y funcione en cualquier execution provider de onnxruntime.

El entrenamiento original fue realizado por Carlos Daniel Hernández Mena y se distribuye bajo el identificador `stt_fo_quartznet15x5_sp_ep163_100h`, que sugiere 163 épocas sobre aproximadamente 100 horas de audio en feroés. No se dispone de información detallada sobre la composición exacta del dataset, el uso de aumentación de datos ni si se aplicaron técnicas de regularización específicas como SpecAugment. La conversión a ONNX y MLX fue realizada por storyteller-platform mediante los scripts `convert.py` y `export-onnx.py`, que reconstruyen el grafo a partir de los pesos y preservan el vocabulario original.

## Capacidades

- Reconocimiento automático del habla (ASR) en feroés: transcripción de audio a texto.
- Procesamiento de audio con front-end de mel integrado en el grafo ONNX (STFT como convolución, proyección mel, log y normalización).
- Ejecución en múltiples execution providers de onnxruntime sin extractor de características externo.
- Inferencia en precisión fp32 y fp16 (encoder en media precisión, front-end en precisión simple).
- Compatibilidad con el runtime MLX de Apple mediante el formato safetensors.
- Integración con la plataforma Storyteller a través del runtime ghost-story.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo puramente ASR).
- No soporta visión, audio generativo ni modos de pensamiento.

## Casos de uso

- Subtitulado automático de vídeo en feroés: el modelo transcribe pistas de audio a texto con marcas temporales, adecuado para plataformas de contenido en lenguas nórdicas minoritarias donde los servicios comerciales no ofrecen cobertura.
- Transcripción de reuniones y entrevistas: integrado en pipelines de post-procesado, permite generar actas o resúmenes a partir de audio en feroés, con la ventaja de que el front-end integrado simplifica el despliegue en servidores sin dependencias adicionales.
- Accesibilidad en medios públicos: televisiones y radios feroesas pueden generar subtítulos automáticos para cumplir requisitos de accesibilidad, usando la versión fp16 para reducir latencia en entornos de producción.
- Archivística y preservación lingüística: digitalización de grabaciones históricas en feroés con transcripción automática para indexación y búsqueda, aprovechando la licencia CC-BY-4.0 que permite uso institucional sin restricciones comerciales.
- Aplicaciones de dictado y notas de voz: integración en apps móviles o de escritorio mediante ONNX Runtime, con la versión fp16 para dispositivos con recursos limitados.
- Investigación en ASR de bajos recursos: como baseline o componente de comparación en estudios sobre lenguas germánicas insulares, dado su tamaño reducido y su disponibilidad abierta.
- Pipelines de datos para entrenamiento de modelos de lenguaje: generación de corpus transcritos en feroés para fine-tuning de LLMs multilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio completo ocupa 0,2 GB, por lo que la huella de memoria es reducida (del orden de cientos de MB en fp32 y aproximadamente la mitad en fp16).
- GPU recomendadas: cualquier GPU compatible con onnxruntime, incluidas NVIDIA (CUDA/TensorRT), AMD (ROCm) y Apple Silicon (CoreML/MLX). Para la versión MLX se requiere Apple Silicon.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 1-2 GB de VRAM libre, incluidas GTX 1050, RTX 3050, RTX 4090 y similares.
- Opciones de despliegue: onnxruntime (cualquier execution provider), MLX en Apple Silicon, runtime ghost-story de Storyteller.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formatos | Disponibilidad |
|---|---|---|---|---|---|
| QuartzNet 15x5 Faroese (este) | QuartzNet 15x5 | Feroés | CC-BY-4.0 | ONNX, safetensors (MLX) | Hugging Face, GitLab |
| carlosdanielhernandezmena/stt_fo_quartznet15x5_sp_ep163_100h | QuartzNet 15x5 | Feroés | CC-BY-4.0 | NeMo | Hugging Face |
| OpenVoiceOS/carlosdanielhernandezmena-stt_fo_quartznet15x5_sp_ep163_100h_onnx | QuartzNet 15x5 | Feroés | CC-BY-4.0 | ONNX | Hugging Face |
| Whisper (OpenAI) | Transformer encoder-decoder | Multilingüe (incluye feroés con cobertura limitada) | MIT | PyTorch, ONNX, GGML | Hugging Face, OpenAI |

La comparativa con Whisper es relevante porque es el modelo ASR abierto más extendido, pero su cobertura del feroés es limitada por la escasez de datos de entrenamiento en ese idioma. Los modelos derivados de Carlos Daniel Hernández Mena son las únicas alternativas específicas para feroés identificadas en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; al ser un modelo entrenado sobre un corpus limitado (aproximadamente 100 horas), puede presentar peor rendimiento en acentos, registros o dominios no representados en el dataset.
- Riesgo de alucinación: en ASR, el equivalente son transcripciones incorrectas o inventadas en segmentos con ruido, silencios o audio de baja calidad; no se dispone de tasas de error publicadas.
- Limitaciones de contexto o idioma: el modelo solo soporta feroés; no es multilingüe ni traduce. No se especifica la duración máxima de audio procesable por segmento.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial y modificaciones siempre que se atribuya la autoría original (Carlos Daniel Hernández Mena) y se indique si se han realizado cambios.
- Caveats para producción: el modelo está empaquetado para el runtime ghost-story de Storyteller; su uso fuera de ese ecosistema requiere validar el grafo ONNX con onnxruntime directamente. La versión fp16 mantiene el front-end en fp32, lo que puede generar inconsistencias si se mezclan precisiones en el pipeline. No hay métricas de WER/CER publicadas en la información disponible, por lo que se recomienda evaluar sobre un conjunto de validación propio antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/storyteller-platform/quartznet15x5-fo
- Modelo original (entrenamiento): https://huggingface.co/carlosdanielhernandezmena/stt_fo_quartznet15x5_sp_ep163_100h
- Exportación ONNX original: https://huggingface.co/OpenVoiceOS/carlosdanielhernandezmena-stt_fo_quartznet15x5_sp_ep163_100h_onnx
- Repositorio GitLab de Storyteller (modelo): https://gitlab.com/storyteller-platform/storyteller/-/ml/models/quartznet15x5-fo
- Scripts de conversión: https://gitlab.com/storyteller-platform/storyteller/-/tree/main/libraries/mlx-audio/scripts
