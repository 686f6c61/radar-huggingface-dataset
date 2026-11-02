# VMuccio/smolvla_baseline_topgrip_cleaned_pos

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face como parte de la familia LeRobot, orientado al control de robots mediante aprendizaje por imitación. Esta ficha concreta, `VMuccio/smolvla_baseline_topgrip_cleaned_pos`, es un ajuste fino del checkpoint base `lerobot/smolvla_base` sobre un conjunto de datos propio de manipulación robótica con cubos de colores y una cesta, publicado por el usuario VMuccio. El modelo resuelve la tarea de generar comandos de acción de 6 dimensiones a partir de observaciones compuestas por el estado del robot y tres cámaras RGB.

El modelo emplea una arquitectura VLA que combina un codificador visual, un modelo de lenguaje preentrenado compacto y un cabezal de acciones, con aproximadamente 450 millones de parámetros totales. Su relevancia radica en que demuestra que un VLA de tamaño reducido puede ejecutarse en hardware de consumo y ajustarse a tareas específicas con pocos recursos, lo que lo hace accesible para laboratorios pequeños y proyectos de robótica de bajo presupuesto.

Este checkpoint está especializado en una única familia de tareas: recoger un cubo (azul, rojo o amarillo) de una de nueve posiciones de la mesa y depositarlo en una cesta. No es un modelo de propósito general, sino una política entrenada para un robot `so_follower` y un montaje de cámaras concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) sobre transformer, con codificador visual, modelo de lenguaje y cabezal de acciones |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje natural libre; las instrucciones de tarea son cadenas fijas del dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que fusiona percepción visual y comprensión de instrucciones lingüísticas para producir acciones motoras continuas. La política consume un vector de estado del robot de dimensión 6 y tres imágenes RGB de 256x256 píxeles, y emite un vector de acción de dimensión 6. El ajuste fino se realizó desde `lerobot/smolvla_base` con la librería LeRobot 0.6.2.

El entrenamiento se llevó a cabo sobre el dataset `VMuccio/rgb_cleaned_pos`, compuesto por 605 episodios y 323.622 fotogramas a 30 FPS, con 27 variantes de instrucción de tarea que combinan tres colores de cubo (azul, rojo, amarillo) y nueve posiciones en la mesa (centro, arriba, abajo, izquierda, derecha y diagonales). La configuración de entrenamiento fue de 20.000 pasos, batch de 64, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. No se dispone de información sobre el número total de tokens de entrenamiento ni sobre si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 grados de libertad para un robot `so_follower`.
- Percepción visual multi-cámara: procesa simultáneamente tres flujos de imagen RGB de 256x256 píxeles (cámaras `gripper`, `top` y una tercera cámara).
- Seguimiento de instrucciones de tarea en formato de cadena fija: distingue entre colores de cubo y posiciones de origen.
- Aprendizaje por imitación: reproduce comportamientos demostrados en las trayectorias del dataset.
- Ejecución en hardware de consumo: el tamaño de 450 millones de parámetros permite inferencia en GPU de gama media.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente en el sentido de los LLM.
- No es un modelo conversacional ni multilingüe en el sentido habitual; el "lenguaje" se limita a las instrucciones de tarea del dataset.

## Casos de uso

- Manipulación pick-and-place en laboratorio: el modelo recoge un cubo de un color y posición determinados y lo deposita en una cesta, adecuado para experimentos de imitación con un robot SO-100/SO-101.
- Prototipado rápido de políticas VLA: sirve como punto de partida para ajustar un VLA compacto a nuevas tareas de manipulación con pocos episodios de demostración.
- Evaluación de infraestructura LeRobot: permite validar el pipeline completo de `lerobot-rollout`, calibración de cámaras y control de robot antes de escalar a tareas más complejas.
- Docencia e investigación en robótica de bajo coste: su tamaño reducido permite entrenar y desplegar en estaciones de trabajo con una sola GPU consumer.
- Benchmark de referencia para comparar variantes de limpieza de datos: al estar entrenado sobre un dataset "cleaned_pos", sirve para medir el impacto de la curación de datos frente a otros checkpoints.
- Automatización de tareas de clasificación por color y posición: puede integrarse en células de montaje sencillas donde la variabilidad se limita a color y localización del objeto.
- Generación de datos sintéticos de evaluación: las 27 instrucciones del dataset permiten construir suites de evaluación sistemáticas sobre color y posición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB en precisión completa (fp32) para 450 millones de parámetros, y menos de 1 GB en fp16/bf16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobredimensionadas para este modelo.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante), así como en placas integradas con suficiente memoria compartida.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de PyTorch; no se han publicado variantes para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de acciones.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del robot, la frecuencia de control (30 FPS en el dataset) y la GPU.
- Almacenamiento: el repositorio ocupa aproximadamente 0,9 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `VMuccio/smolvla_baseline_topgrip_cleaned_pos` | 450 M | no disponible | Manipulación pick-and-place (SO follower) | Apache 2.0 | Hugging Face |
| `lerobot/smolvla_base` | ~450 M (misma familia) | no disponible | VLA base para ajuste fino | Apache 2.0 | Hugging Face |
| Políticas ACT de LeRobot | no disponible | no disponible | Imitación robótica | Apache 2.0 | Hugging Face / LeRobot |
| Políticas Diffusion Policy de LeRobot | no disponible | no disponible | Imitación robótica | Apache 2.0 | Hugging Face / LeRobot |

La comparación con ACT y Diffusion Policy es cualitativa: SmolVLA incorpora un componente de lenguaje que permite condicionar la política mediante instrucciones, mientras que ACT y Diffusion Policy son políticas puramente visomotoras sin condicionamiento lingüístico. No se dispone de cifras de rendimiento comparativas publicadas para este checkpoint concreto.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ha sido entrenado para recoger cubos de tres colores en nueve posiciones y depositarlos en una cesta; fuera de esa distribución su comportamiento no está garantizado.
- Dependencia del montaje: requiere un robot `so_follower` y una configuración de cámaras concreta (tres cámaras, incluidas `gripper` y `top`); cambios en la iluminación, la cámara o la mesa pueden degradar el rendimiento.
- Sin datos de benchmarks: no hay métricas publicadas de éxito en la tarea, por lo que no se puede evaluar su robustez de forma objetiva.
- Riesgo de sobreajuste al dataset: con 605 episodios y 20.000 pasos de entrenamiento, es probable que generalice mal a objetos, colores o posiciones no vistos.
- Sin capacidades de lenguaje general: no debe emplearse como modelo conversacional, de código ni de razonamiento; las instrucciones de tarea son cadenas fijas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre la seguridad física del robot.
- Seguridad física: como política de control robótico, un fallo de inferencia puede provocar colisiones o daños; se recomienda supervisión y límites de par en el robot.
- Idiomas: no aplica; no se ha documentado soporte multilingüe para las instrucciones.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/VMuccio/smolvla_baseline_topgrip_cleaned_pos)
- [Modelo base lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- [Dataset VMuccio/rgb_cleaned_pos](https://huggingface.co/datasets/VMuccio/rgb_cleaned_pos)
- [Paper SmolVLA (arXiv:2506.01844)](https://huggingface.co/papers/2506.01844)
- [Guía SmolVLA de LeRobot](https://huggingface.co/docs/lerobot/main/en/smolvla)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Visualizador del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=VMuccio/rgb_cleaned_pos)
- [Guía de instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Guía de hardware de LeRobot](https://huggingface.co/docs/lerobot/main/en/hardware_guide)
- [Guía de grabación de datos y entrenamiento](https://huggingface.co/docs/lerobot/en/il_robots)
- [Cheat-sheet de comandos LeRobot](https://huggingface.co/docs/lerobot/main/en/cheat-sheet)
