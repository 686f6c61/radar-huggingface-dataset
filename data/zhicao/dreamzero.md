# zhicao/dreamzero

## Resumen

DreamZero es un World Action Model (WAM) desarrollado por el NVIDIA GEAR Lab, presentado en el artículo «World Action Models are Zero-shot Policies» (arXiv:2602.15922). A diferencia de los modelos de visión-lenguaje-acción (VLA) tradicionales, que generalizan bien en el plano semántico pero fallan ante movimientos físicos no vistos en entornos nuevos, DreamZero aprende dinámicas físicas prediciendo conjuntamente estados futuros del mundo y acciones. El modelo se basa en un backbone de difusión de video autoregresivo preentrenado de 14B parámetros, lo que le permite actuar como política cero-shot en tareas no vistas. Su relevancia radica en abordar la brecha de generalización física de los VLA, ofreciendo una alternativa que integra la representación densa de video como señal de control.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone de difusión de video autoregresivo (World Action Model) |
| Parametros totales | 14B (según el paper) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a robótica, sin información de idiomas) |
| Licencia | no disponible (el repositorio de código no especifica licencia) |
| Formato de pesos | no disponible (se menciona distribución de inferencia vía WebSocket) |

## Arquitectura y entrenamiento

DreamZero se construye sobre un backbone de difusión de video autoregresivo preentrado de 14B parámetros. En lugar de predecir solo acciones como los VLA, el modelo aprende a predecir simultáneamente los siguientes fotogramas de video y las acciones correspondientes. Esta arquitectura aprovecha la representación densa del video como señal de aprendizaje de la dinámica física, superando las limitaciones de los VLA que carecen de prioridades espaciotemporales de su preentrenamiento de imagen-texto. No se dispone de detalles sobre el conjunto de datos de entrenamiento, el número de tokens o el uso de técnicas como RLHF o DPO en la información proporcionada.

## Capacidades

- Predicción conjunta de acciones y videos futuros.
- Política cero-shot en tareas no vistas, generalizando a movimientos físicos en entornos nuevos.
- Aprendizaje de dinámicas físicas mediante representación densa de video.
- No se reportan capacidades de tool calling, agentes multi-paso, visión adicional (más allá del video), audio, ni capacidades multilingües.

## Casos de uso

- **Robótica móvil en entornos desconocidos**: DreamZero puede servir como política de control en robots que operan en espacios no mapeados, prediciendo acciones basadas en el flujo de video observado.
- **Manipulación de objetos no vistos**: al generalizar a movimientos físicos, permite que un robot manipule objetos con formas o propiedades no presentes en los datos de entrenamiento.
- **Planificación de trayectorias en tiempo real**: dado que predice video y acciones, puede usarse para generar secuencias de control sin necesidad de un modelo de mundo explícito.
- **Simulación y entrenamiento de políticas**: su capacidad de predecir estados futuros puede aprovecharse para simular escenarios y entrenar otros modelos de control.
- **Teleoperación asistida**: puede complementar sistemas de teleoperación al predecir las consecuencias de las acciones propuestas.
- **Investigación en aprendizaje por refuerzo**: como modelo de mundo, puede proporcionar predicciones de transición para algoritmos de RL basados en modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible, aunque un modelo de 14B parámetros con backbone de difusión requiere típicamente GPU de alta gama con al menos 24-40 GB de VRAM para inferencia en FP16.
- **GPU recomendadas**: se recomienda A100, H100 o similar para inferencia distribuida; el repositorio menciona inferencia distribuida vía WebSocket, lo que sugiere uso multi-GPU.
- **Compatibilidad con GPU consumer**: no se ha confirmado; un modelo de 14B podría caber en una RTX 4090 (24 GB) con cuantización, pero no se especifica.
- **Opciones de despliegue**: el repositorio proporciona un servidor WebSocket para inferencia distribuida; no se mencionan vLLM, llama.cpp u otros.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (WAMs). Se sugiere comparar con modelos VLA como OpenVLA, RT-2 o el modelo de difusión de video de NVIDIA, pero no se han publicado datos comparativos.

## Limitaciones y advertencias

- **Falta de información técnica**: no se han publicado detalles sobre el entrenamiento, datos, licencia, ni requisitos de hardware.
- **Riesgo de alucinación**: como modelo generativo de video, puede predecir escenarios físicamente incorrectos en entornos muy novedosos.
- **Restricciones de licencia**: la licencia del modelo no está clara; el repositorio de HuggingFace asociado es un dataset con licencia MIT, pero no se aplica al modelo.
- **Uso en producción**: aún es un modelo de investigación, sin validación en entornos reales de producción.
- **Idiomas**: no se indica soporte multilingüe; es probable que la entrada sea visual y no textual.

## Enlaces

- [Proyecto DreamZero](https://dreamzero0.github.io/)
- [Paper en arXiv](https://arxiv.org/abs/2605.15922)
- [Repositorio de código (GitHub)](https://github.com/dreamzero0/dreamzero)
- [Repositorio alternativo (GitHub)](https://github.com/XingdongZhu/dreamzero)
- [Nota de investigación (PDF)](https://rosikand.github.io/research-notebook/paper-notes/2026-03-01-dreamzero/index.pdf)</think>## Resumen

DreamZero es un World Action Model (WAM) desarrollado por NVIDIA GEAR Lab, presentado en el artículo «World Action Models are Zero-shot Policies» (arXiv:2605.15922). A diferencia de los modelos de visión-lenguaje-acción (VLA) tradicionales, que generalizan bien en el plano semántico pero fallan ante movimientos físicos no vistos, DreamZero aprende dinámicas físicas prediciendo conjuntamente futuros estados del mundo y acciones. El modelo se basa en un backbone de difusión de video autoregresivo preentrenado de 14B parámetros, lo que le permite actuar como política cero-shot en tareas no vistas. Su relevancia radica en abordar la brecha de generalización física de los VLA, ofreciendo una alternativa que integra la representación densa de video como señal de aprendizaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone de difusión de video autoregresivo (World Action Model) |
| Parametros totales | 14B (según el paper) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a robótica, sin datos lingüísticos) |
| Licencia | no disponible (el repositorio de código no especifica licencia) |
| Formato de pesos | no disponible (se menciona inferencia distribuida vía WebSocket) |

## Arquitectura y entrenamiento

DreamZero se construye sobre un backbone de difusión de video autoregresivo preentrenado de 14B parámetros. En lugar de predecir solo acciones como los VLA, el modelo aprende a predecir simultáneamente los siguientes fotogramas de video y las acciones correspondientes. Esta arquitectura aprovecha la representación densa del video como señal de aprendizaje de la dinámica física, superando las limitaciones de los VLA que carecen de prioridades espotemporales derivadas de su preentrenamiento de imagen-texto. No se dispone de detalles sobre el conjunto de datos de entrenamiento, el número de tokens, ni el uso de técnicas como RLHF o DPO en la información pública.

## Capacidades

- **Predicción de acciones y video futuro**: genera secuencias de video y las acciones correspondientes de forma conjunta.
- **Política cero-shot**: actúa como política en tareas no vistas, generalizando a movimientos físicos en entornos nuevos.
- **Aprendizaje de dinámicas físicas**: utiliza el video como representación densa para capturar propiedades físicas de los objetos y del entorno.
- No se reportan capacidades de tool calling, agentes multi-paso, visión más allá del video, audio, ni soporte multilingüe.

## Casos de uso

- **Robótica móvil en entornos desconocidos**: DreamZero puede servir como política de control en robots que operan en espacios no mapeados, prediciendo acciones basadas en el flujo de video observado.
- **Manipulación de objetos no vistos**: permite que un robot manipule objetos con formas o dinámicas no presentes en los datos de entrenamiento gracias a su generalización física.
- **Planificación de trayectorias en tiempo real**: la predicción de video y acciones permite generar secuencias de control sin necesidad de un modelo de entorno explícito.
- **Simulación para entrenamiento de políticas**: puede usarse para generar trayectorias sintéticas y entrenar otros modelos de control en entornos simulados.
- **Teleoperación asistida**: complementa sistemas de teleoperación prediciendo las consecuencias de las acciones propuestas.
- **Investigación en aprendizaje por refuerzo basado en modelo**: como modelo de acción, puede proporcionar predicciones de transición para algoritmos de RL sin modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible. Un modelo de 14B con backbone de difusión requiere probablemente GPU de alta gama con al menos 24-40 GB de VRAM para inferencia en FP16.
- **GPU recomendadas**: se sugiere A100, H100 o similar para inferencia distribuida; el repositorio incluye un servidor WebSocket para inferencia multi-GPU.
- **Compatibilidad con GPU consumer**: no confirmado. Con cuantización podría caber en una RTX 4090 (24 GB), pero no se especifica.
- **Opciones de despliegue**: el repositorio ofrece inferencia distribuida vía WebSocket; no se mencionan vLLM, llama.cpp, Ollama o TGI.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (WAM o VLA). No se han publicado comparaciones con OpenVLA, RT-2 u otros modelos de acción-visión.

## Limitaciones y advertencias

- **Falta de documentación técnica**: no se detallan los datos de entrenamiento, licencia, ni requisitos de hardware en el paper o el repositorio.
- **Riesgo de alucinación**: como modelo generativo de video, puede producir escenarios físicamente inconsistentes en contextos extremadamente novedosos.
- **Restricciones de licencia**: la licencia del modelo no está clara; el repositorio de HuggingFace asociado es un dataset con licencia MIT, no aplicable al modelo.
- **Uso en producción**: es un modelo de investigación sin validación en entornos productivos reales.
- **Idiomas**: no hay indicación de soporte de entrada de lenguaje; probablemente la entrada es únicamente visual.

## Enlaces

- [Proyecto DreamZero](https://dreamzero0.github.io/)
- [Paper: arXiv:2605.15922](https://arxiv.org/abs/2605.15922)
- [Repositorio de código (GitHub)](https://github.com/dreamzero0/dreamzero)
- [Repositorio alternativo (GitHub)](https://github.com/XingdongZhu/dreamzero)
- [Notas de investigación (PDF)](https://resumen.github.io/research-notebook/paper-notes/2026-03-01-dreamzero/index.pdf)
