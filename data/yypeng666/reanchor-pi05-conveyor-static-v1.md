# yypeng666/reanchor-pi05-conveyor-static-v1

## Resumen

`reanchor-pi05-conveyor-static-v1` es un checkpoint de robótica publicado por el usuario `yypeng666` en Hugging Face, consistente en un ajuste fino supervisado (SFT) de parámetros completos del modelo base π0.5 (pi0.5) sobre demostraciones de una tarea de cinta transportadora estática dentro del proyecto denominado "reanchor". El modelo se distribuye con el pipeline `robotics` y está pensado para inferencia de políticas visomotrices en entornos de manipulación robótica, no para generación de texto.

El repositorio ocupa 37,3 GB y está sujeto a acceso restringido (gated): es necesario aceptar condiciones en Hugging Face para descargarlo. La licencia indicada es `pi05` (etiquetada como `license:other`), heredada de los términos del modelo base π0.5, que incluyen condiciones adicionales (archivos LICENSE, NOTICE y GEMMA_TERMS.txt según el repositorio de entrenamiento asociado).

La relevancia de esta ficha es limitada: se trata de un artefacto de investigación muy específico, con cero descargas y cero likes en el momento de la consulta, sin documentación publicada de benchmarks ni idiomas soportados. La información disponible permite describir el origen del entrenamiento y el linaje técnico, pero no validar su rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de π0.5 / pi0.5, modelo visomotriz; detalles de arquitectura no publicados en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | pi05 (license:other), con terminos adicionales del modelo base π0.5 |
| Formato de pesos | no disponible (repo de 37,3 GB; formato concreto no indicado) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de parámetros completos (full-parameter SFT) del modelo base π0.5, realizado con el framework openpi en JAX sobre demostraciones de la tarea "reanchor conveyor static". El repositorio de entrenamiento asociado (`666harrypeng/reanchor-openpi-sft`) indica que se replicaron datos y se ejecutó SFT completo sobre las demostraciones, lo que sugiere un pipeline de imitación supervisada orientado a política visomotriz (entrada de imágenes y estado, salida de acciones).

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni sobre si hubo etapas de RLHF o DPO. El dataset relacionado `yypeng666/reanchor-conveyor-static-ikabs-v2` contiene 32,1k filas con datos tabulares, series temporales y vídeo, lo que es coherente con un corpus de demostraciones robóticas, pero no se confirma que sea el usado exactamente en este checkpoint. No se documentan innovaciones técnicas adicionales más allá del propio SFT sobre π0.5.

## Capacidades

- Ejecución de políticas visomotrices para una tarea concreta de cinta transportadora estática (manipulación robótica).
- Aprendizaje por imitación a partir de demostraciones (SFT), sin evidencia publicada de generalización a otras tareas.
- Entrada multimodal probable (imágenes y estado del robot), derivada del linaje π0.5; no confirmado en la información disponible.
- Soporte de tool calling / function calling: no disponible (no aplica al pipeline `robotics`).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Automatización de una celda de cinta transportadora estática: el checkpoint está entrenado específicamente sobre demostraciones de esa tarea, por lo que su uso natural es la reproducción de la política en un entorno con la misma configuración física y de cámara.
- Investigación en imitación robótica: sirve como referencia reproducible de un SFT completo sobre π0.5 con openpi en JAX, útil para comparar pipelines de entrenamiento.
- Evaluación de transferencia de políticas: permite medir hasta qué punto un SFT sobre una tarea estrecha conserva o degrada capacidades del modelo base.
- Baseline en experimentos de "reanchor" (reanclaje de políticas): adecuado como punto de partida para estudiar técnicas de reanclaje sobre políticas visomotrices.
- Reproducción de experimentos: al estar el código de entrenamiento publicado en GitHub, facilita replicar el SFT y verificar resultados en el mismo dataset.
- Docencia y formación: ejemplo práctico de flujo completo openpi (datos, SFT, checkpoint) para cursos de robótica de manipulación.
- No se recomienda su uso en producción fuera de la tarea y el entorno para los que fue entrenado, dado que no hay benchmarks ni validación publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repo (37,3 GB) sugiere pesos de gran volumen, pero no se especifica el formato ni el número de parámetros.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el volumen del checkpoint hace poco probable un despliegue en GPU de consumo sin cuantización, que no está documentada.
- Opciones de despliegue: no disponible. El ecosistema asociado es openpi (JAX), según el repositorio de entrenamiento; no se documenta soporte de vLLM, llama.cpp, Ollama o TGI (herramientas de texto, en principio no aplicables).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| reanchor-pi05-conveyor-static-v1 | no disponible | no disponible | sin benchmarks publicados | pi05 (other) | gated en Hugging Face |
| π0.5 (pi0.5) base | no disponible en la informacion | no disponible | no disponible en la informacion | propia de π0.5 | referencia del linaje |
| Otros checkpoints de openpi | no disponible | no disponible | no disponible | variable | no verificado |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Especialización extrema: entrenado para una única tarea (cinta transportadora estática); no hay evidencia de generalización a otras tareas o entornos.
- Ausencia total de benchmarks: cero descargas y cero likes en el momento de la consulta; sin métricas de éxito publicadas.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que limita su uso y reproducibilidad.
- Licencia `pi05` con términos adicionales del modelo base (LICENSE, NOTICE, GEMMA_TERMS.txt): es imprescindible revisar las condiciones antes de cualquier uso comercial; no se garantiza permiso de uso comercial.
- Riesgo de sobreajuste a las condiciones de captura y a la configuración física de las demostraciones.
- Sin información sobre sesgos, idiomas ni alucinación (no aplica a generación de texto, pero sí a la fiabilidad de la política en estados fuera de distribución).
- El volumen del repo (37,3 GB) y la falta de formatos de cuantización documentados complican el despliegue en hardware limitado.
- Fecha de creación indicada como 2026-11-04, posterior a la fecha habitual de consulta; conviene verificar la integridad y procedencia del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yypeng666/reanchor-pi05-conveyor-static-v1
- Dataset relacionado: https://huggingface.co/datasets/yypeng666/reanchor-conveyor-static-ikabs-v2
- Repositorio de entrenamiento: https://github.com/666harrypeng/reanchor-openpi-sft
