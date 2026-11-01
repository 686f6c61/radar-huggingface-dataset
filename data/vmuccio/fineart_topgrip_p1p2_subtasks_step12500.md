# VMuccio/fineart_topgrip_p1p2_subtasks_step12500

## Resumen

FineART-VLA · SO101 · top + gripper es un checkpoint intermedio (paso 12.500 de 30.000) de un modelo de visión-lenguaje-acción (VLA) orientado a robótica manipulativa. Lo desarrolla el usuario VMuccio sobre el modelo base `lerobot/FineART-VLA-subtask-midtrained`, al que se le han reescrito las features para el robot SO101: cámara cenital (top), pinza (gripper) y representación de estado y acciones en 6 dimensiones. El modelo resuelve la generación de secuencias de acción a partir de instrucciones en lenguaje natural y observaciones visuales, descompuestas en subtareas.

La relevancia de este checkpoint es acotada: se trata de un artefacto de investigación publicado a mitad de entrenamiento y explícitamente no evaluado sobre el robot real. Su interés reside en documentar el proceso de ajuste fino de un VLA sobre un dataset concreto de cubos de colores y en servir como referencia para quien replique la receta FineART-VLA en un SO101.

Con 4.143.404.816 parámetros (aproximadamente 4,1 mil millones) y un repositorio de 9,4 GB, el modelo se distribuye en formato safetensors bajo la librería LeRobot. No se han publicado datos sobre licencia, idiomas soportados ni benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) sobre el framework FineART-VLA; detalles internos no disponibles |
| Parámetros totales | 4.143.404.816 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16 durante el entrenamiento) |
| Idiomas soportados | no disponible (las instrucciones del dataset están en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/FineART-VLA-subtask-midtrained`, un VLA preentrenado en la etapa de subtareas, y se ajusta con features reescritas para el robot SO101: entrada de cámara top, señal de gripper y vectores de estado/acción de 6 dimensiones. El entrenamiento sigue la receta por defecto de FineART-VLA, que combina dos fases: un 30 % de ejemplos de tarea a subtarea y un 70 % de subtarea a acciones. Se usó precisión bf16, tamaño de batch 8 y tasa de aprendizaje 2,5e-5.

El dataset de ajuste es `VMuccio/rgb_cubes_terne_p1p2_trimmed_topgrip_subtasks`, con instrucciones de subtarea del tipo "Pick up the <color> cube on the <pos>", "Put the <color> cube in the basket" y "Return to home position", con posiciones expresadas en el sistema de referencia de la cámara cenital. El checkpoint corresponde al paso 12.500 de 30.000, por lo que representa un estado intermedio del proceso y no el modelo final. No se especifican el número de tokens, la composición completa del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de acciones robóticas a partir de instrucciones en lenguaje natural y observaciones de cámara cenital.
- Descomposición de tareas en subtareas encadenadas (recoger cubo, depositarlo en la cesta, volver a posición home).
- Percepción visual limitada a la vista top y a la señal de la pinza.
- Control de un efector final de 6 dimensiones (estado y acciones).
- Seguimiento de instrucciones con referencias a color y posición de objetos.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso genérico, capacidades multilingües ni modos de pensamiento.

## Casos de uso

- Investigación en manipulación con SO101: servir como punto de partida para reproducir la receta FineART-VLA y comparar checkpoints intermedios frente al modelo final.
- Recolección de cubos por color: el modelo traduce instrucciones como "Pick up the red cube on the left" en secuencias de acción de 6 dimensiones usando la vista cenital.
- Clasificación y depósito en cesta: ejecuta la subtarea "Put the <color> cube in the basket" tras la recogida, útil en pipelines de pick-and-place.
- Retorno a posición home: la subtarea "Return to home position" permite integrar el modelo en secuencias de seguridad o reinicio entre episodios.
- Evaluación de estrategias de descomposición tarea-subtarea: la proporción 30/70 de la receta permite estudiar el efecto del entrenamiento jerárquico en políticas VLA.
- Docencia y prototipado en robótica: su tamaño de 4,1 mil millones de parámetros y formato safetensors facilitan experimentos reproducibles con LeRobot.
- Análisis de checkpoints intermedios: al estar en el paso 12.500 de 30.000, es útil para estudiar la evolución del aprendizaje antes de la convergencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el checkpoint no ha sido evaluado sobre el robot.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 8-9 GB solo para pesos, más memoria para activaciones y observaciones visuales; el repositorio completo ocupa 9,4 GB.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090 (24 GB) o una A100/H100 permiten inferencia en bf16 con margen.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 12 GB o más en bf16, aunque no hay datos oficiales de consumo real.
- Opciones de despliegue: LeRobot es la librería declarada; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no son adecuadas para un VLA con entradas visuales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| FineART-VLA · SO101 · top + gripper (step 12500) | 4.143.404.816 | no disponible | no disponible | HuggingFace (LeRobot) |
| lerobot/FineART-VLA-subtask-midtrained (modelo base) | no disponible | no disponible | no disponible | HuggingFace (LeRobot) |
| Alternativas VLA de robótica de propósito general | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio (paso 12.500 de 30.000): no representa el modelo final y no ha sido validado en el robot.
- Entrenado exclusivamente con cubos de colores en posiciones concretas; la generalización a otros objetos, colores o disposiciones es incierta.
- Depende de la cámara cenital y de la configuración de pinza del SO101; no es transferible sin recalibración.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Idiomas no documentados; las instrucciones del dataset están en inglés.
- Riesgo de sobreajuste al dataset reducido de entrenamiento y de fallos en subtareas fuera de distribución.
- No se documentan sesgos, pero al ser un modelo visual puede heredar sesgos de los datos de preentrenamiento del modelo base.
- Sin benchmarks ni métricas de éxito publicadas, no es recomendable para producción sin evaluación previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VMuccio/fineart_topgrip_p1p2_subtasks_step12500
- Modelo base: https://huggingface.co/lerobot/FineART-VLA-subtask-midtrained
- Dataset de ajuste: https://huggingface.co/datasets/VMuccio/rgb_cubes_terne_p1p2_trimmed_topgrip_subtasks
- Librería LeRobot: https://github.com/huggingface/lerobot
