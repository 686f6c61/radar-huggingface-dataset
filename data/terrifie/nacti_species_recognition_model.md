# Terrifie/NACTI_Species_Recognition_model

## Resumen

El repositorio `Terrifie/NACTI_Species_Recognition_model` contiene los pesos preentrenados de un modelo de reconocimiento de especies animales a partir de imágenes de cámaras trampa, desarrollado por el autor Terrifie como parte del proyecto NACTI (North America Camera Trap Images). El modelo se basa en la arquitectura de PyTorch Wildlife y se ha entrenado específicamente para abordar el problema de clasificación de especies en un escenario de distribución de clases de cola larga (long-tailed), donde la clase más frecuente representa más del 50% de las 3,7 millones de imágenes del dataset.

El repositorio ofrece nueve configuraciones diferentes de entrenamiento, variando la función de pérdida (Cross-Entropy, Focal Loss, LDAM, Weighted Cross-Entropy), el optimizador (Adam o AdamW) y el uso opcional de un programador de tasa de aprendizaje. El tamaño total del repositorio es de 1,8 GB, lo que sugiere que se trata de un modelo de visión por computadora de tamaño considerable, aunque no se especifican los detalles exactos de la arquitectura ni el número de parámetros en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en PyTorch Wildlife (no se especifica la arquitectura exacta) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | En (etiquetas de clasificación en inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (.pth) |

## Arquitectura y entrenamiento

El modelo se basa en el sistema PyTorch Wildlife, una plataforma de código abierto para detección y clasificación de fauna silvestre. No se proporcionan detalles sobre la arquitectura interna (si es un ResNet, EfficientNet u otro backbone), ni sobre el número de parámetros. El entrenamiento se realizó sobre el dataset NACTI, que contiene 3,7 millones de imágenes de cámaras trampa con una fuerte desequilibrio de clases (long-tailed). El estudio comparativo incluye varias funciones de pérdida diseñadas para mitigar este desequilibrio: Cross-Entropy, Focal Loss, LDAM (Label-Distribution-Aware Margin) y Weighted Cross-Entropy, combinadas con los optimizadores Adam y AdamW, y con o sin programador de tasa de aprendizaje. No se menciona el uso de RLHF, DPO ni técnicas de alineación, ya que se trata de un modelo de clasificación supervisada.

## Capacidades

- Clasificación de especies animales en imágenes de cámaras trampa (fine-grained classification).
- Soporte para escenarios de distribución de cola larga, gracias al uso de funciones de pérdida específicas.
- Capacidad de distinguir entre múltiples especies con alta similitud visual (por ejemplo, distintos tipos de cérvidos o carnívoros).
- El modelo está diseñado para trabajar en condiciones de imagen reales de campo (iluminación variable, fondos complejos, ángulos diversos).
- No se mencionan capacidades de generación de texto, tool calling, agentes o razonamiento, ya que es un modelo exclusivamente de visión.

## Casos de uso

- Monitoreo de biodiversidad: el modelo puede integrarse en pipelines de análisis de imágenes de cámaras trampa para automatizar el conteo y la identificación de especies en áreas naturales, reduciendo el esfuerzo humano de revisión manual.
- Estudios de distribución de fauna: al clasificar automáticamente las imágenes, permite generar mapas de presencia de especies en diferentes regiones, útil para biólogos y conservacionistas.
- Evaluación de impacto ambiental: se puede usar para detectar cambios en las poblaciones de fauna tras intervenciones humanas (construcción de infraestructuras, incendios, etc.).
- Investigación en long-tailed recognition: el modelo sirve como punto de partida para evaluar nuevas técnicas de clasificación con desequilibrio de clases, gracias a las múltiples configuraciones de entrenamiento disponibles.
- Educación y divulgación: las herramientas de identificación de especies pueden integrarse en aplicaciones educativas o de ciencia ciudadana para que el público en general contribuya al monitoreo de fauna.
- Integración en flujos de trabajo de análisis de imágenes: puede combinarse con sistemas de detección (como Megadetector) para construir pipelines completos de detección y clasificación de animales en imágenes de campo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper asociado (arXiv:2607.18033) describe una evaluación comparativa de métodos LTR sobre el dataset NACTI, pero los números concretos no están incluidos en la información proporcionada en este repositorio.

## Requisitos de hardware

- No se dispone de información específica sobre los requisitos de VRAM ni GPU recomendadas.
- Dado que el repositorio contiene checkpoints de PyTorch de tamaño considerable (1,8 GB en total), se puede estimar que el modelo completo tiene varios cientos de millones de parámetros, lo que requeriría al menos una GPU con 12-16 GB de VRAM para inferencia en batch.
- Es probable que funcione en GPUs de consumo como la RTX 3090 o RTX 4090, así como en GPUs profesionales como A100.
- Para despliegue, se puede usar PyTorch directamente o frameworks de inferencia como TorchServe, aunque no se mencionan opciones específicas como vLLM u Ollama (que son más orientadas a modelos de lenguaje).
- La latencia dependerá del tamaño de la imagen de entrada y de la GPU utilizada; no se tienen datos estimados.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de reconocimiento de especies en este repositorio. Sin embargo, se puede considerar que compite con modelos como MegaDetector (enfocado en detección) o otros clasificadores de fauna como Wildlife Insights, aunque no hay datos concretos para una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo está entrenado específicamente sobre el dataset NACTI, que tiene una distribución de clases muy desequilibrada. Esto puede provocar un rendimiento pobre en especies raras o poco representadas.
- No se proporciona información sobre la arquitectura exacta ni los detalles de entrenamiento, lo que dificulta la reproducibilidad completa fuera del contexto del proyecto original.
- La licencia MIT permite uso comercial y modificación, pero es necesario revisar la licencia del dataset original (NACTI) y del código base de PyTorch Wildlife para garantizar el cumplimiento de términos adicionales.
- Al ser un modelo de clasificación, no genera explicaciones sobre las predicciones, lo que puede ser un inconveniente en aplicaciones de investigación donde se requiere interpretabilidad.
- El riesgo de alucinación no aplica en el contexto de clasificación, pero sí existe el riesgo de errores de clasificación en especies con apariencia similar.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/Terrifie/NACTI_Species_Recognition_model
- Repositorio GitHub del proyecto: https://github.com/ZehuaLiuY/Species-Classification
- Artículo en arXiv: https://arxiv.org/abs/2607.18033
- Versión HTML del artículo: https://arxiv.org/html/2607.18033v1
- Página de CatalyzeX con código y paper: https://www.catalyzex.com/paper/benchmarking-nacti-species-recognition-in
