# tavishh/robotarm

## Resumen

`tavishh/robotarm` es una politica de robótica basada en ACT (Action Chunking with Transformers) con componente CVAE, publicada por el usuario tavishh y presentada como la entrega del equipo TRON a la competición de entrenamiento ACT organizada por el SIG de robótica de Northeastern SV. No es un modelo de lenguaje: es un modelo de imitación (imitation learning) que traduce observaciones de cámara y el estado del robot en secuencias de acciones motoras para un brazo SO-101.

El modelo resuelve una tarea concreta de pick-and-place: coger un cubo o un cilindro y depositarlo en una caja. Se entrenó sobre el dataset `BrutalCaesar/phi_so101_cubes_cylinder_v1`, compuesto por 120 episodios y 66.873 fotogramas capturados con 3 cámaras. El checkpoint publicado corresponde al paso 60.000 de un total de 100.000, seleccionado por pérdida en un conjunto de validación retenido en lugar de usar el paso final.

Su relevancia es acotada pero clara: sirve como referencia reproducible de ACT frente a una línea base de behavioral cloning sin latente CVAE, con métricas comparadas explícitamente. Tiene 51.617.414 parámetros (unos 51,6 millones), se distribuye en formato safetensors dentro de un repositorio de 0,2 GB, usa la librería LeRobot y se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con CVAE |
| Parametros totales | 51.617.414 (aproximadamente 51,6 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; consume secuencias de observaciones de imagen y estado del robot, pero no se documenta el horizonte configurado) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documenta precision ni variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de control motor, no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es una arquitectura de transformer encoder-decoder con decodificación de trozos de acción (action chunking): en lugar de predecir una única acción por paso, el modelo emite un bloque de acciones futuras, lo que reduce el error de acumulación típico de las politicas de imitación paso a paso. En esta variante se añade un latente CVAE que modela la variabilidad de las demostraciones humanas, capturando la multimodalidad de las trayectorias de teleoperación.

El entrenamiento se realizó sobre 120 episodios y 66.873 fotogramas procedentes de 3 cámaras, correspondientes a la tarea de coger un cubo o un cilindro y colocarlo en una caja. La ejecución completa abarcó 100.000 pasos. El checkpoint publicado es el paso 60.000, elegido por pérdida sobre un conjunto de validación retenido de 30 episodios, con un L1 de 0,500. El checkpoint final (paso 100.000) obtuvo 0,524, un 4,8% peor, lo que indica sobreajuste a partir de los pasos 60.000-80.000. Como control, se entrenó en paralelo una línea base de behavioral cloning sin latente CVAE (`use_vae=false`), que alcanzó su mejor resultado en el paso 80.000 con un L1 de 0,513, todavía por encima del checkpoint publicado.

## Capacidades

- Manipulación robótica de pick-and-place: coger un cubo o un cilindro y depositarlo en una caja.
- Percepción multimodal de entrada: procesa observaciones de 3 cámaras simultáneamente junto con el estado del robot.
- Generación de acciones por chunks: emite secuencias de acciones en lugar de una acción aislada por inferencia.
- Modelado de multimodalidad mediante latente CVAE, lo que permite representar variabilidad en las demostraciones.
- Generalización dentro de la misma tarea y distribución de posiciones del holdout de 30 episodios.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en lenguaje ni comportamiento de agente conversacional.
- No tiene capacidades multilingües, de visión general, de audio ni de generación de texto.
- No dispone de modo "thinking" ni de modos de razonamiento explícito.

## Casos de uso

- Automatización de pick-and-place en banco de pruebas: el modelo controla un brazo SO-101 para coger cubos y cilindros y dejarlos en una caja, partiendo de 3 cámaras como entrada, lo que lo hace adecuado para validar cadenas completas de percepción-control en laboratorio.
- Clasificación por geometría en línea ligera: al distinguir entre cubo y cilindro durante la manipulación, puede integrarse en una celda que separe piezas por forma antes de depositarlas en un contenedor concreto.
- Punto de partida para fine-tuning con LeRobot: al estar en formato safetensors y usar la librería LeRobot, se puede reentrenar sobre nuevos datasets de la misma morfología (SO-101) para tareas de manipulación distintas.
- Reproducción de experimentos de imitation learning: el par ACT+CVAE frente a behavioral cloning sin latente permite estudiar el efecto del latente CVAE en tareas de manipulación con presupuestos de datos pequeños (120 episodios).
- Docencia y formación en robótica: sirve como ejemplo completo de pipeline de teleoperación, captura de datos, entrenamiento con ACT y evaluación con pérdida L1 en holdout.
- Recogida automatizada de piezas en montaje ligero: puede emplearse para retirar piezas pequeñas de una zona de trabajo y agruparlas en una caja, siempre que la distribución de posiciones se mantenga dentro de la variabilidad del dataset de entrenamiento.
- Evaluación de infraestructura de recogida de datos: al depender de 3 cámaras y 120 episodios, es útil para medir cómo afectan el número de episodios y la configuración de cámaras al rendimiento final de una política ACT.

## Benchmarks y rendimiento

| Modelo / checkpoint | Paso de entrenamiento | L1 en holdout de 30 episodios |
|---|---|---|
| ACT + CVAE (este modelo) | 60.000 | 0,500 |
| ACT + CVAE (checkpoint final) | 100.000 | 0,524 |
| Baseline behavioral cloning sin latente CVAE | 80.000 | 0,513 |

El checkpoint publicado es el de menor L1 de los dos entrenamientos comparados, evaluado sobre el mismo conjunto retenido de 30 episodios de posiciones. No se han publicado otros resultados de benchmarks (tasa de éxito en tarea, métricas por cámara, evaluaciones en robot real) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP32 ocupan aproximadamente 206 MB (51.617.414 parámetros x 4 bytes); en FP16 bajarían a unos 103 MB. Son cálculos derivados del recuento de parámetros, no cifras publicadas por el autor.
- El modelo cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090 o equivalentes, con margen amplio incluso contando los búferes de las 3 cámaras.
- La inferencia en CPU es viable por tamaño, aunque la latencia depende del preprocesado de imagen, no solo de los pesos.
- GPU de centro de datos (A100, H100) no son necesarias para inferencia; solo tendrían sentido para reentrenar sobre datasets mayores.
- Opciones de despliegue: LeRobot (PyTorch) como vía principal, dado que es la librería declarada del repositorio. No se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp, Ollama ni TGI, que además no aplican a una política de control.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tavishh/robotarm (ACT + CVAE sobre SO-101) | 51,6 M | no disponible | L1 0,500 en holdout de 30 episodios (paso 60.000) | Apache 2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Baseline behavioral cloning sin CVAE (mismo trabajo) | no disponible | no disponible | L1 0,513 en el mismo holdout (paso 80.000) | no disponible | no distribuido públicamente según la información disponible |
| Otras politicas ACT o de imitación para SO-101 | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

Solo se dispone de comparación interna frente a la línea base del mismo equipo. No hay datos publicados que permitan contrastar este modelo con Diffusion Policy, otros checkpoints ACT de LeRobot u otros modelos de manipulación comparables.

## Limitaciones y advertencias

- Alcance funcional muy restringido: solo resuelve una tarea (coger cubo o cilindro y dejarlo en una caja) sobre una morfología concreta (SO-101).
- Dependencia de la distribución de entrenamiento: la evaluación se limita a un holdout de 30 episodios de posiciones; no hay evidencia de generalización a nuevas posiciones, iluminación, fondos u objetos distintos.
- Sobreajuste documentado: a partir de los pasos 60.000-80.000 el modelo empeora, con un 4,8% más de L1 en el paso 100.000 frente al checkpoint publicado.
- L1 de 0,500 en el mejor checkpoint: es un error relativamente alto en términos absolutos si se compara con politicas ACT típicas reportadas en la literatura, aunque no se dispone de una referencia directa equivalente en esta ficha.
- Ausencia total de capacidades lingüísticas: no admite instrucciones en lenguaje natural, tool calling ni diálogo; cualquier interfaz conversacional requeriría un modelo externo.
- Sesgos conocidos: no documentados explícitamente por el autor; la variabilidad de las demostraciones humanas y las condiciones de captura son las fuentes previsibles de sesgo operativo.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe el equivalente en control, la ejecución de trayectorias plausibles pero incorrectas que pueden provocar colisiones o caídas de objetos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, con la obligación habitual de conservar el aviso de licencia y sin garantías por parte del autor.
- Madurez del artefacto: 0 descargas y 0 likes, repositorio creado y actualizado el 29 de septiembre de 2026, sin señales de mantenimiento posterior. No debe tratarse como un componente listo para producción sin evaluación propia en el hardware objetivo.
- Seguridad física: cualquier despliegue sobre un brazo real requiere limites de par, paradas de emergencia y validación en entorno controlado antes de operar cerca de personas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tavishh/robotarm
- Dataset de entrenamiento: https://huggingface.co/datasets/BrutalCaesar/phi_so101_cubes_cylinder_v1
- Librería LeRobot (HuggingFace): https://github.com/huggingface/lerobot
- Paper de ACT (Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware): https://arxiv.org/abs/2304.13705
