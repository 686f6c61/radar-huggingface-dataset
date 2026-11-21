# yuuu94/dual-flow-v11-handover-block-base-20k

## Resumen

Dual-flow V11 Base para RoboTwin handover_block es una política robótica experimental desarrollada por el usuario yuuu94, derivada por ajuste fino del modelo público SingleVLA alojado en jellyho/TwinVLA. Se trata de un modelo de visión-lenguaje-acción (VLA) orientado a manipulación bimanual, entrenado específicamente para la tarea handover_block del entorno de simulación RoboTwin. El modelo se presenta como la política de comparación (variante Base) dentro de un ablation sobre coordinación, y no como un modelo de propósito general.

La arquitectura subyacente es la de TwinVLA, un transformer de flow matching que genera trayectorias de acción condicionadas por observaciones visuales e instrucciones de tarea. En esta variante concreta se emplea un horizonte de acción de 20 pasos, 10 pasos de muestreo por flow matching y una escala de guiado de 1.0. El entrenamiento se realizó durante 20.000 actualizaciones sobre el checkpoint de inicialización SingleVLA.

El repositorio contiene únicamente el diccionario de estado de inferencia en PyTorch (model.pt, 4,0 GB), sin resultados de evaluación en bucle cerrado publicados. Su relevancia es por tanto acotada: sirve como referencia reproducible para experimentos de ablation en manipulación bimanual dentro de RoboTwin, no como un modelo listo para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en TwinVLA, con flow matching para generacion de acciones |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en PyTorch sin cuantizar) |
| Idiomas soportados | no disponible (el modelo recibe instrucciones de tarea, no se documenta cobertura linguistica) |
| Licencia | no disponible |
| Formato de pesos | PyTorch state dict (model.pt) |
| Horizonte de accion | 20 pasos |
| Pasos de muestreo (flow matching) | 10 |
| Escala de guiado | 1.0 |
| Actualizaciones de entrenamiento | 20.000 |
| Modelo base | jellyho/TwinVLA (inicializacion SingleVLA) |
| Tarea | RoboTwin handover_block (manipulacion bimanual) |
| SHA-256 de model.pt | a2f47ff7086e92116d9dba8ff28ceb7f51b9d52ec7e0a98844f840c6a45742d8 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TwinVLA, un diseño de vision-lenguaje-acción que combina un codificador visual, un codificador de instrucciones y un cabezal de acciones basado en flow matching. A diferencia de los VLA que predicen acciones de forma autoregresiva o por regresión directa, el flow matching genera trayectorias muestreando un campo de velocidades en 10 pasos, lo que permite modelar distribuciones multimodales de acción típicas en manipulación bimanual. El horizonte de predicción es de 20 acciones por inferencia y la escala de guiado se fija en 1.0.

El entrenamiento parte de la inicialización SingleVLA publicada en jellyho/TwinVLA y se ajusta durante 20.000 actualizaciones sobre la tarea handover_block de RoboTwin. No se documentan en la información disponible el número de tokens, la composición del dataset, ni si hubo etapas de RLHF o DPO (poco habituales en políticas robóticas). La variante Base se define explícitamente como la política de comparación en un ablation sobre coordinación, lo que sugiere que existe una variante alternativa (probablemente con mecanismos de coordinación adicionales) frente a la que se mide.

## Capacidades

- Generación de acciones motoras bimanuales para la tarea handover_block en el simulador RoboTwin.
- Condicionamiento por observación visual e instrucción de tarea, propio de la familia VLA.
- Predicción de trayectorias de 20 pasos con muestreo por flow matching en 10 pasos.
- Soporte de inferencia en PyTorch mediante state dict, requiriendo la implementación Dual-flow V11, el tokenizer, la configuración de tarea y las estadísticas de normalización.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües, modo thinking, visión general, audio ni otras capacidades fuera de la manipulación robótica simulada.

## Casos de uso

- Investigación en manipulación bimanual: el modelo sirve como política de referencia para comparar variantes de coordinación en la tarea handover_block dentro de RoboTwin, permitiendo aislar el efecto de mecanismos de coordinación adicionales.
- Reproducción de experimentos de ablation: al publicarse el state dict con hash SHA-256 verificable, un grupo de investigación puede reproducir exactamente la política Base y contrastar sus resultados con los de la variante experimental.
- Desarrollo de pipelines de evaluación en RoboTwin: el modelo se integra en un bucle de simulación que ejecuta la tarea y registra tasas de éxito, aunque el autor no reporta resultados en bucle cerrado.
- Estudio de flow matching aplicado a robótica: con 10 pasos de muestreo y horizonte 20, permite analizar el compromiso entre coste computacional de muestreo y calidad de trayectoria en tareas de transferencia de objetos.
- Punto de partida para ajuste fino en tareas relacionadas: al derivar de SingleVLA, puede servir como inicialización para otras tareas bimanuales de RoboTwin con un coste de entrenamiento acotado (20.000 actualizaciones).
- Docencia y formación en VLA: útil como ejemplo práctico de cómo se estructura un repositorio de política robótica (state dict, tokenizer, configuración de tarea, estadísticas de normalización) y de los requisitos de reproducibilidad asociados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reporta ningún resultado en bucle cerrado ("No closed-loop result is reported here").

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 4,0 GB, lo que sugiere que los pesos en precisión original rondan ese tamaño y cabrían en GPUs consumer con al menos 8 GB de VRAM, aunque el pico real depende del codificador visual y del tamaño de lote.
- GPU recomendadas: no disponible en la documentación. Por el tamaño del state dict, una RTX 3090, RTX 4090 o A100 serían opciones razonables, pero no hay confirmación del autor.
- Cabe en GPU consumer: probablemente sí en GPUs con 8 GB o más, sin datos oficiales que lo confirmen.
- Opciones de despliegue: inferencia en PyTorch con la implementación Dual-flow V11; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no a políticas VLA).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| yuuu94/dual-flow-v11-handover-block-base-20k | VLA con flow matching | handover_block (RoboTwin) | no disponible | no disponible | no disponible | State dict PyTorch, 4,0 GB |
| jellyho/TwinVLA (SingleVLA) | VLA | Manipulacion robotica general | no disponible | no disponible | no disponible | Publico en Hugging Face |
| Variante Dual-flow V11 con coordinacion (referencia del ablation) | VLA con flow matching | handover_block (RoboTwin) | no disponible | no disponible | no disponible | No confirmada en la informacion disponible |

La comparación cuantitativa con alternativas no es posible con los datos disponibles: no se publican métricas de éxito, parámetros ni contexto para ninguno de los modelos citados.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo etiqueta como tal y lo describe como política de comparación, no como un sistema validado.
- Sin resultados en bucle cerrado: no hay evidencia publicada de tasa de éxito en la tarea, por lo que no puede evaluarse su rendimiento real.
- Dependencia fuerte del entorno: requiere la implementación Dual-flow V11, el tokenizer, la configuración de tarea y las estadísticas de normalización; sin ellos el state dict es inutilizable.
- Licencia no disponible: no se especifican términos de uso, lo que impide confirmar si se permite uso comercial o redistribución.
- Ámbito muy restringido: entrenado solo para handover_block en RoboTwin; no se documenta generalización a otras tareas, entornos reales ni instrucciones en lenguaje natural variable.
- Riesgo de sobreajuste a la simulación: al no haber evaluación en hardware real, el gap sim-to-real es desconocido.
- Idiomas no documentados: no puede asumirse cobertura multilingüe en las instrucciones de tarea.
- Sesgos: no se documentan análisis de sesgo; en políticas robóticas el riesgo relevante es de distribución (objetos, posiciones, iluminación) más que lingüístico.
- Riesgo de alucinación: aplicable en el sentido de generar trayectorias plausibles pero incorrectas ante observaciones fuera de distribución; no cuantificado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/yuuu94/dual-flow-v11-handover-block-base-20k
- Modelo base: https://huggingface.co/jellyho/TwinVLA
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
