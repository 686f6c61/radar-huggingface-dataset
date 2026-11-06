# Tangoplus/audio_cls_v3

## Resumen

Tangoplus/audio_cls_v3 es un modelo de clasificación de audio basado en la arquitectura wav2vec2 y publicado en Hugging Face por el usuario Tangoplus. El modelo ha sido entrenado mediante la librería Transformers, concretamente con el flujo `Trainer`, y se distribuye en formato safetensors con un total de 94.572.174 parámetros (aproximadamente 94,6 millones). Su pipeline declarado es `audio-classification`, lo que lo sitúa en la categoría de modelos que reciben una señal de audio como entrada y devuelven una etiqueta de clase.

La información pública disponible es muy limitada: la model card fue generada automáticamente por el Trainer y el autor no ha completado las secciones de descripción, usos previstos, datos de entrenamiento ni limitaciones. El modelo declara un resultado de evaluación de 0,8739 de accuracy y una pérdida de validación de 0,5466, pero no especifica sobre qué conjunto de datos, cuántas clases ni qué tarea concreta. No consta licencia, idiomas soportados ni resultados de benchmarks en el model-index.

A pesar de la escasez de documentación, el modelo resulta relevante como ejemplo de fine-tuning de wav2vec2 para clasificación de audio con un tamaño contenido (94,6 M de parámetros) y un repo de 3,8 GB. No obstante, su uso en producción requeriría una validación independiente, dado que no se documentan ni el dataset ni las etiquetas de salida.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (transformer para audio, según el tag de Hugging Face) |
| Parametros totales | 94.572.174 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de la longitud de audio de entrada; wav2vec2 procesa ventanas de audio, no tokens de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en wav2vec2, una arquitectura de representación auto-supervisada para audio que combina un extractor de características convolucional con un transformer que procesa las representaciones latentes. Sobre esta base, el autor ha añadido una cabeza de clasificación para la tarea `audio-classification`. El número de parámetros (94,6 M) es coherente con las variantes base de wav2vec2.

El entrenamiento se realizó con el `Trainer` de Transformers durante 10 épocas, con un learning rate de 1e-4, batch size total de 32 (batch 8 con 4 pasos de acumulación de gradiente), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal y precisión mixta nativa (AMP). El modelo card indica que fue entrenado "from scratch on an unknown dataset", es decir, no se documenta el corpus de entrenamiento ni el número de tokens o muestras. La evolución del entrenamiento muestra una accuracy de validación que pasa de 0,7143 en la época 1 a 0,8739 en la época 10, con una pérdida de validación que baja de 1,3650 a 0,5466. No se documenta el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de clasificación.

## Capacidades

- Clasificación de audio: el pipeline declarado es `audio-classification`, por lo que el modelo asigna una etiqueta a una señal de audio de entrada.
- Procesamiento de audio con wav2vec2: adecuado para tareas de reconocimiento de eventos sonoros, clasificación de habla, detección de emociones o identificación de locutor, siempre que se haya entrenado para ello (no documentado).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No se documentan modos especiales (thinking mode, visión, audio generativo, etc.).

## Casos de uso

- Clasificación de eventos sonoros en entornos industriales: el modelo podría emplearse para etiquetar sonidos de maquinaria y detectar anomalías, siempre que las clases de salida coincidan con las del entrenamiento original (no documentadas).
- Moderación de contenido en audio: clasificación de fragmentos de audio para detectar categorías concretas (por ejemplo, habla, música o ruido), previa validación de las etiquetas reales del modelo.
- Análisis de llamadas de atención al cliente: etiquetado de segmentos de audio para enrutar llamadas según su contenido, con la cautela de que no se documenta el dominio de entrenamiento.
- Investigación en procesamiento de audio: uso como punto de partida para fine-tuning adicional sobre wav2vec2, aprovechando su tamaño contenido (94,6 M de parámetros) y su formato safetensors.
- Prototipado rápido de pipelines de audio: al ser un modelo pequeño, puede desplegarse en entornos con recursos limitados para pruebas de concepto de clasificación de audio.
- Clasificación de audio en dispositivos edge: con 94,6 M de parámetros, es viable su ejecución en CPU o GPU de gama baja para tareas de inferencia por lotes, siempre que se valide su precisión en el dominio objetivo.

## Benchmarks y rendimiento

El model-index del autor no contiene resultados (`results: []`). La model card sí reporta métricas de validación del entrenamiento:

| Metrica | Valor |
|---|---|
| Loss (validación, época 10) | 0,5466 |
| Accuracy (validación, época 10) | 0,8739 |
| Accuracy (mejor época, época 7) | 0,8824 |
| Loss (mejor época, época 7) | 0,5419 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, SUPERB, etc.) en la información disponible. No se especifica el conjunto de evaluación ni el número de clases.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 94,6 M de parámetros, en fp32 ocuparía aproximadamente 0,38 GB de pesos; en fp16, unos 0,19 GB. La VRAM real dependerá de la longitud de audio de entrada y del batch.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionarían sin problema, aunque el modelo es pequeño y no requiere hardware de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650, RTX 3050, RTX 4090, etc.).
- Opciones de despliegue: Transformers con pipeline `audio-classification`; también podría exportarse a ONNX o TorchScript para inferencia optimizada. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI (estas herramientas están orientadas a modelos de lenguaje, no a clasificación de audio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tangoplus/audio_cls_v3 | 94,6 M | no disponible | audio-classification | no disponible | Hugging Face |
| facebook/wav2vec2-base | ~95 M | no aplica (audio) | representación auto-supervisada | MIT (según el modelo original) | Hugging Face |
| facebook/wav2vec2-base-960h | ~95 M | no aplica (audio) | ASR | MIT (según el modelo original) | Hugging Face |
| MIT/ast-finetuned-audioset-10-10-0.4593 | ~87 M | no aplica (audio) | audio-classification (AudioSet) | BSD-3-Clause (según el modelo original) | Hugging Face |

La comparación es limitada porque no se documentan las clases ni el dataset de audio_cls_v3. Los modelos de referencia de wav2vec2 y AST tienen licencias conocidas y documentación completa, mientras que audio_cls_v3 carece de ambas.

## Limitaciones y advertencias

- La model card está generada automáticamente y no documenta el dataset, las clases de salida ni el dominio de aplicación.
- No se especifica la licencia, por lo que no se puede garantizar el uso comercial.
- No se documentan sesgos conocidos, pero al no conocerse el dataset de entrenamiento no se puede evaluar su comportamiento en dominios distintos.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de clasificaciones erróneas fuera de la distribución de entrenamiento.
- La accuracy de 0,8739 no es interpretable sin conocer el número de clases, el balance del dataset y la métrica exacta.
- No se documentan limitaciones de contexto ni de idioma.
- Para producción, se recomienda validar el modelo con un conjunto de datos propio y verificar las etiquetas de salida antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Tangoplus/audio_cls_v3
