# Splash47666/slowfast-soccer-play-classifier

## Resumen

El modelo `slowfast-soccer-play-classifier` es un clasificador binario de video desarrollado por Splash47666 que determina si un clip de transmisión de fútbol contiene juego activo o no. Se basa en la arquitectura SlowFast R50 de PyTorchVideo, preentrenada en el conjunto de datos Kinetics-400, y ha sido ajustado localmente mediante un proceso de transferencia de aprendizaje. El modelo está diseñado para tareas de segmentación de emisiones deportivas, filtrado de repeticiones y extracción de momentos clave.

Su relevancia radica en que aborda una tarea concreta de análisis de video en el dominio del fútbol, un campo con aplicaciones crecientes en la automatización de la edición y el análisis táctico. El modelo se distribuye con una licencia Apache-2.0, lo que permite su uso y modificación en proyectos de investigación y prototipos. El checkpoint seleccionado (época 5) alcanza una precisión de validación del 89,94% sobre una partición local, aunque no se han publicado resultados en benchmarks públicos.

La arquitectura SlowFast procesa secuencias de 32 fotogramas RGB a 224×224 píxeles, y la salida es una etiqueta binaria: `0` para no en juego y `1` para en juego. El tamaño del repositorio es de 0.1 GB, lo que lo hace ligero para despliegues en entornos con recursos moderados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SlowFast R50 (PyTorchVideo) |
| Parámetros totales | No disponible (el checkpoint pesa 0.1 GB) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada de video de 32 frames) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (modelo de video, sin soporte de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch checkpoint (`model.pth` con `model_state_dict`, época y metadatos de validación) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura SlowFast R50 de PyTorchVideo, preentrenada en Kinetics-400. SlowFast procesa dos flujos de video con frecuencias temporales diferentes: un flujo "lento" (slow path) que captura información semántica a baja frecuencia y un flujo "rápido" (fast path) que captura movimientos dinámicos a alta frecuencia. Ambos flujos se fusionan para producir una representación temporal rica.

Durante el entrenamiento, el backbone se mantuvo congelado y solo se ajustó el bloque de clasificación final. Se utilizó AdamW con programación de tasa de aprendizaje coseno, entropía cruzada con suavizado de etiquetas y precisión mixta. Los hiperparámetros incluyen 8 épocas, tamaño de lote 4, tasa de aprendizaje 5e-5, weight decay 1e-5 y clip de 32 frames. La normalización aplicada usa media `[0.45, 0.45, 0.45]` y desviación estándar `[0.225, 0.225, 0.225]`. Los datos de entrenamiento consisten en clips de transmisiones de fútbol con anotaciones binarias de juego activo/inactivo, aunque no se distribuyen los vídeos originales.

## Capacidades

- Clasificación binaria de vídeo: predice si un clip de fútbol muestra juego activo (`1`) o no (`0`).
- Detección de transiciones entre fases de juego, útil para segmentar partidos completos.
- Filtrado de repeticiones, planos de multitud y gráficos sobreimpresos.
- Entrada flexible: acepta secuencias de 32 frames RGB a 224×224.
- No tiene capacidades de generación de texto, razonamiento lingüístico, tool calling ni visión general más allá de la clasificación de video.
- No soporta multi-idioma ni entrada de audio.

## Casos de uso

- **Segmentación de partidos de fútbol**: el modelo puede dividir una transmisión en intervalos de juego activo y detenido, facilitando la creación de resúmenes automáticos o la indexación de momentos clave.
- **Filtrado de repeticiones**: en una transmisión, las repeticiones suelen mostrar jugadas pasadas; el clasificador puede descartar estos segmentos para análisis táctico en tiempo real.
- **Extracción de highlights**: al detectar los períodos de juego activo, se pueden aislar las jugadas para generar clips destacados sin intervención manual.
- **Asistencia editorial**: los equipos de edición pueden usar el modelo para pre-seleccionar fragmentos de partido que contengan acción, reduciendo el tiempo de revisión.
- **Análisis táctico**: en aplicaciones de análisis de rendimiento, el modelo permite separar automáticamente el tiempo de juego del tiempo de pausa, mejorando la precisión de estadísticas como posesión o tiempo de juego efectivo.
- **Prototipos de investigación**: sirve como base para experimentos en clasificación de eventos deportivos, comparación de arquitecturas de video y evaluación de técnicas de fine-tuning sobre datos de dominio específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos para este modelo. La única métrica reportada es la precisión de validación local durante el entrenamiento:

| Métrica | Valor |
|---|---|
| Precisión de validación (local) | 89,94% |
| Pérdida de validación (local) | 0,4052 |

Esta métrica no ha sido reproducida en un conjunto público y no se dispone de comparaciones con otros modelos de clasificación de video.

## Requisitos de hardware

- **VRAM estimada**: no se proporcionan requisitos oficiales. El checkpoint pesa 0.1 GB, lo que sugiere que puede caber en GPU con al menos 2-4 GB de VRAM, pero es una estimación no verificada.
- **GPU recomendadas**: cualquier GPU con soporte para PyTorch (ej. NVIDIA GTX 10xx, RTX 20xx o superiores) puede ejecutar el modelo, aunque para entrenamiento se usó una GPU con soporte de mixed precision.
- **Consumer GPU**: sí, el tamaño reducido del modelo permite su uso en tarjetas de gama media como RTX 3060 o similares.
- **Opciones de despliegue**: el modelo se distribuye como checkpoint de PyTorch, por lo que se puede integrar con frameworks como PyTorch, PyTorchVideo o convierte a ONNX para servir con TensorRT. No se proporciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de texto.
- **Latencia y throughput**: no hay datos públicos. La inferencia sobre clips de 32 frames puede ser rápida en GPU, pero el rendimiento exacto depende del hardware y del preprocesamiento.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos de clasificación de video para fútbol. Se pueden mencionar alternativas genéricas como X3D o I3D, pero no hay datos de rendimiento disponibles para este modelo frente a ellas. La comparativa es, por tanto, no disponible.

## Limitaciones y advertencias

- **Sesgos de emisión**: el modelo puede aprender características visuales específicas de ciertos canales o plataformas de transmisión, lo que podría reducir su generalización a otras fuentes.
- **Errores en casos atípicos**: repeticiones, gráficos superpuestos, tomas de multitud o transmisiones no convencionales pueden ser clasificados incorrectamente.
- **Generalización limitada**: no se ha demostrado que funcione en vídeos que no sean de fútbol o que no sean de transmisiones deportivas estándar.
- **Derechos de autor y privacidad**: los datos de entrenamiento incluyen material de Bilibili sin una autorización de derechos de autor completa. Los usuarios deben evaluar su uso bajo las leyes de copyright y privacidad aplicables.
- **No auditado para sesgos**: el modelo no ha sido evaluado por memorización de datos ni por sesgos demográficos.
- **Uso restringido**: no debe utilizarse para vigilancia, identificación biométrica o fines que requieran precisión crítica.
- **Riesgo de alucinación**: al ser un clasificador de video, no genera texto, pero la clasificación puede ser errónea en escenarios ambiguos, lo que debe tenerse en cuenta en aplicaciones de toma de decisiones.

## Enlaces

- [HuggingFace - Splash47666/slowfast-soccer-play-classifier](https://huggingface.co/Splash47666/slowfast-soccer-play-classifier)
- [GitHub - facebookresearch/SlowFast (PySlowFast)](https://github.com/facebookresearch/SlowFast)
- [Roboflow - Soccer Computer Vision Datasets and Models](https://universe.roboflow.com/browse/sports/soccer)
