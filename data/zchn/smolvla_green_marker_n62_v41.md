# zchn/smolvla_green_marker_n62_v41

## Resumen

SmolVLA green-marker (n=62, v4.1) es un modelo de política visuomotora (vision-language-action, VLA) especializado en una única tarea robótica: colocar una caja verde sobre un marcador. Lo desarrolla el usuario `zchn` y se distribuye bajo licencia Apache 2.0 a través de Hugging Face, empaquetado con la librería LeRobot. No es un modelo de lenguaje generalista, sino un checkpoint de control entrenado para el brazo robótico SO-101.

El modelo parte de un warm-start sobre `zchn/smolvla_green_marker_n50_v4` (checkpoint local n50 `005000`) y se afina durante 5000 pasos sobre el dataset `zchn/robo_test_green_marker_v0` en su versión v4.1, compuesto por 62 episodios y 78 137 fotogramas. La pérdida final de entrenamiento reportada es de 0,105. El entrenamiento se realizó en dispositivo MPS con `num_workers=0`.

Con 450 046 176 parámetros (aproximadamente 450 M) y un repositorio de 1,2 GB en formato safetensors, se trata de un modelo compacto orientado a despliegue en hardware de consumo. Su relevancia es acotada: es un artefacto de investigación y experimentación en manipulación robótica de una sola tarea, no una base general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action), según tags del repositorio; detalles internos no disponibles |
| Parámetros totales | 450 046 176 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de control robótico, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo sigue la familia SmolVLA, una arquitectura visión-lenguaje-acción pensada para control robótico de bajo coste computacional. La información disponible no detalla la composición interna de la red (backbone visual, encoder de lenguaje ni cabeza de acciones), por lo que esos extremos quedan como no disponibles. El checkpoint se inicializa desde `zchn/smolvla_green_marker_n50_v4` y se afina con 5000 pasos sobre la versión v4.1 del dataset, que combina 50 demostraciones podadas con 12 demostraciones adicionales etiquetadas como fases A/B/C.

Un detalle técnico relevante es el remapeo de cámaras aplicado durante el entrenamiento mediante `--rename_map`: `observation.images.handeye` pasa a `observation.images.camera1` y `observation.images.front` a `observation.images.camera2`, con `empty_cameras=1` para una tercera ranura vacía. Esto alinea las claves del dataset con la política base. La cadena de tarea utilizada es `put the green box on the marker`. No se documenta uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Ejecución de una tarea de manipulación robótica concreta: colocar una caja verde sobre un marcador con el brazo SO-101.
- Política visuomotora que consume observaciones de imagen (dos cámaras activas y una ranura vacía) y produce acciones de control.
- Condicionamiento por cadena de tarea en lenguaje natural (`put the green box on the marker`).
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No soporta generación de texto, razonamiento, código, matemáticas ni tool calling.
- No se documentan capacidades multilingües, modo de razonamiento explícito, audio ni visión general más allá de las cámaras de entrada.

## Casos de uso

- Manipulación pick-and-place en laboratorio: el modelo ejecuta el traslado de una caja verde a un marcador sobre una mesa con el SO-101, sirviendo como referencia reproducible para experimentos de imitación.
- Fine-tuning sobre nuevas tareas: al ser un checkpoint SmolVLA compacto, puede usarse como punto de partida (warm-start) para afinar con datasets propios de pocas demostraciones, replicando el flujo n50 → n62 aquí documentado.
- Evaluación de pipelines de datos robóticos: permite validar el remapeo de cámaras y el formato de episodios de LeRobot antes de escalar a datasets mayores.
- Docencia y prototipado en robótica de bajo coste: sus 450 M de parámetros y 1,2 GB de pesos permiten iterar en estaciones de trabajo con GPU de consumo o incluso MPS en Apple Silicon, como se usó en el entrenamiento.
- Pruebas de robustez ante variaciones de iluminación y posición: al estar entrenado con demostraciones en fases A/B/C, sirve para medir la generalización de una política de imitación en condiciones ligeramente distintas.
- Base para comparativas de métodos VLA: útil como línea base pequeña frente a políticas más grandes en estudios de coste/rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado es la pérdida final de entrenamiento de 0,105 tras 5000 pasos, que no constituye una métrica de evaluación de tarea (tasa de éxito).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros en FP32 los pesos ocupan aproximadamente 1,8 GB, y en FP16/BF16 alrededor de 0,9 GB, a lo que hay que sumar el coste del backbone visual y los buffers de inferencia.
- GPU recomendadas: no disponibles en la documentación. El entrenamiento se realizó en MPS (Apple Silicon) con `num_workers=0`, lo que indica que el modelo cabe en hardware de consumo.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño, aunque no se especifican modelos concretos (RTX 4090, etc.).
- Opciones de despliegue: LeRobot es la vía documentada; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de acciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints SmolVLA comparables ni datos de rendimiento que permitan una comparación rigurosa. El único pariente identificable es su modelo base `zchn/smolvla_green_marker_n50_v4`, del que este checkpoint es una continuación afinada.

| Modelo | Parámetros | Contexto | Licencia | Relación |
|---|---|---|---|---|
| zchn/smolvla_green_marker_n62_v41 | 450 046 176 | no disponible | Apache 2.0 | Este modelo |
| zchn/smolvla_green_marker_n50_v4 | no disponible | no disponible | no disponible | Modelo base (warm-start) |
| Otros SmolVLA | no disponible | no disponible | no disponible | Sin datos |

## Limitaciones y advertencias

- Modelo de tarea única: solo se ha entrenado para `put the green box on the marker`; fuera de ese dominio no cabe esperar comportamiento útil.
- Sesgos: al derivar de 62 episodios de un entorno concreto, hereda los sesgos de posición, iluminación y disposición de objetos de esas demostraciones.
- Riesgo de fallo y sobreajuste: con una pérdida de entrenamiento de 0,105 y sin métricas de éxito publicadas, no hay evidencia de generalización a condiciones nuevas.
- Dependencia del remapeo de cámaras: el despliegue debe replicar exactamente el mapeo `handeye → camera1`, `front → camera2` y la ranura vacía, o el modelo recibirá observaciones inconsistentes.
- Idiomas: no aplica ni se documenta soporte multilingüe; la cadena de tarea está en inglés.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Madurez: 27 descargas y 0 likes en el momento de la consulta; es un artefacto experimental, no un modelo validado para producción.
- Sin datos de cuantización ni de contexto: no es posible planificar optimizaciones de despliegue a partir de la documentación disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zchn/smolvla_green_marker_n62_v41
- Modelo base: https://huggingface.co/zchn/smolvla_green_marker_n50_v4
- Dataset: https://huggingface.co/datasets/zchn/robo_test_green_marker_v0
- LeRobot (librería): no se proporciona enlace en la información disponible
