# TianK003/act_clear_blue

## Resumen

`act_clear_blue` es una política de control robótico basada en la arquitectura ACT (Action Chunking with Transformers) publicada por el usuario TianK003 en Hugging Face. Está entrenada para una tarea muy concreta sobre un brazo robótico SO-101: coger una pelota azul de un cuenco y depositarla en el agujero azul. No es un modelo de lenguaje ni un modelo generativo de propósito general, sino una política de imitación que mapea observaciones (estado de las articulaciones e imágenes de dos cámaras) a secuencias de acciones motoras.

El modelo se ha obtenido mediante fine-tuning a partir de `Space0code/act_redblue_from_foil`, usando los segmentos `clear_b` del dataset `molnrb/so101_pick_rb_mixed` (revisión `8d36c36c`). El autor indica que los datos se recortaron a partir de etiquetas manuales y se validaron con pre-etiquetados generados por IA. El repositorio ocupa 0,4 GB y contiene pesos en formato safetensors compatibles con la librería LeRobot.

La relevancia de esta ficha es acotada: se trata de un artefacto experimental de robótica de escritorio, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin validación física en el brazo. Resulta útil como ejemplo de flujo de trabajo con LeRobot y ACT, pero no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; chunk de acciones de 100 pasos |
| Tipos de cuantizacion | no disponible (pesos safetensors sin cuantizar documentada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es una arquitectura de imitación diseñada para control robótico que combina un codificador visual (típicamente un backbone tipo ResNet) con un transformer que predice bloques o *chunks* de acciones futuras en lugar de una sola acción por paso. Esta predicción por chunks reduce el error de acumulación y mejora la estabilidad del control. En este caso, el modelo consume `observation.state`, `observation.images.top` y `observation.images.wrist` a resolución 640x480 y 30 fps, y emite chunks de 100 acciones.

El entrenamiento parte del checkpoint `Space0code/act_redblue_from_foil` y se afina sobre los segmentos `clear_b` del dataset `molnrb/so101_pick_rb_mixed` (revisión `8d36c36c`). El autor señala que esos segmentos se recortaron a partir de etiquetas manuales y se comprobaron con pre-etiquetados de IA. No se documentan el número de episodios, el número de tokens o frames vistos, la composición exacta del dataset ni si hubo aumentos de datos. La pérdida de evaluación en segmentos reservados (*held-out*) es de 0,315 para el checkpoint `002000` y 0,317 para `004000`, lo que sugiere un ajuste muy próximo entre ambos y un posible inicio de sobreajuste o meseta a partir de los 2.000 pasos.

## Capacidades

- Control robótico de imitación para una tarea única: retirar una pelota azul de un cuenco y soltarla en el agujero azul.
- Predicción de chunks de 100 acciones a partir de estado articular y dos vistas de cámara (superior y de muñeca).
- Entrada multimodal visual y proprioceptiva a 640x480 y 30 fps.
- Compatibilidad con el ecosistema LeRobot para carga, evaluación y despliegue en el brazo SO-101.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües ni de modo *thinking*.
- No se ha validado en hardware real según la propia model card.

## Casos de uso

- Replicación de experimentos de imitación con ACT: sirve como punto de partida para comparar curvas de pérdida y checkpoints en tareas de pick-and-place con SO-101.
- Fine-tuning sobre nuevas variantes de color u objeto: al estar entrenado sobre segmentos `clear_b`, puede reutilizarse como inicialización para tareas análogas con otros objetos o posiciones.
- Docencia y formación en robótica de escritorio: permite mostrar el ciclo completo de recogida de datos, etiquetado, entrenamiento y evaluación con LeRobot.
- Evaluación de pipelines de pre-etiquetado por IA: el autor usó pre-etiquetas automáticas verificadas manualmente, lo que hace del modelo un caso de estudio sobre la calidad de esos datos.
- Pruebas de robustez ante variaciones de iluminación y posición: al disponer de dos cámaras, se pueden analizar fallos de percepción en condiciones controladas.
- Integración en un banco de pruebas de políticas: útil para medir latencia de inferencia y estabilidad de chunks de 100 acciones en un SO-101 antes de desplegar políticas más complejas.

## Benchmarks y rendimiento

| Checkpoint | Pérdida de evaluación (segmentos reservados) |
|---|---|
| 002000 | 0,315 |
| 004000 | 0,317 |

No se han publicado resultados de benchmarks en la información disponible (no hay tasas de éxito en el brazo, ni comparaciones con otras políticas).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio pesa 0,4 GB, por lo que los pesos caben holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor; por el tamaño del repositorio, una RTX 3060 o superior debería ser suficiente para inferencia.
- Cabe en GPU de consumo: sí, con alta probabilidad, dado el tamaño del artefacto.
- Opciones de despliegue: LeRobot (carga nativa); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `TianK003/act_clear_blue` | ACT | Pick-and-place de pelota azul en SO-101 | Chunk 100 | no disponible | Hugging Face, 0 descargas |
| `Space0code/act_redblue_from_foil` | ACT | Tarea base de la que deriva este modelo | no disponible | no disponible | Hugging Face |
| Políticas ACT genéricas de LeRobot | ACT | Tareas de manipulación diversas | variable | según repositorio | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El autor indica explícitamente que el modelo no se ha probado todavía en el brazo real.
- Entrenado para una única tarea y un único objeto (pelota azul) en un entorno concreto; no generaliza a otras tareas sin reentrenamiento.
- La pérdida de evaluación apenas mejora entre 2.000 y 4.000 pasos, lo que puede indicar sobreajuste o saturación del aprendizaje.
- Sin licencia declarada: no se puede asumir permiso para uso comercial ni para redistribución.
- Sin idiomas ni capacidades de lenguaje: no es adecuado para tareas de texto, código o razonamiento.
- Riesgo de fallo en condiciones de iluminación, posición de cámara u objetos distintos a los del dataset de entrenamiento.
- Los datos de entrenamiento se basan en etiquetas manuales y pre-etiquetados de IA, con posible ruido no cuantificado.
- Ausencia de benchmarks de éxito real en hardware, por lo que no hay evidencia de robustez en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TianK003/act_clear_blue
- Modelo base: https://huggingface.co/Space0code/act_redblue_from_foil
- Dataset de entrenamiento: https://huggingface.co/datasets/molnrb/so101_pick_rb_mixed
- LeRobot (librería): https://github.com/huggingface/lerobot
