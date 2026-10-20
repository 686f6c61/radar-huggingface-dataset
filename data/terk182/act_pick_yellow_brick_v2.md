# terk182/act_pick_yellow_brick_v2

## Resumen

`terk182/act_pick_yellow_brick_v2` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT) y publicada en el Hub mediante LeRobot. No es un modelo de lenguaje: es un controlador visomotor que recibe dos cámaras (muñeca y frontal) y el estado articular de un brazo seguidor `so_follower`, y emite comandos de acción de 6 dimensiones. El modelo resuelve una única tarea: «pick up the yellow object and put it in the pink bowl» (coger un objeto amarillo y depositarlo en un cuenco rosa).

El autor es `terk182`, un usuario individual sin organización asociada, y el repositorio no declara licencia ni resultados de evaluación. La política tiene 51.668.614 parámetros (unos 0,2 GB de repositorio) y se entrenó sobre un dataset propio de 44 episodios y 26.589 fotogramas grabados a 20 FPS, con 15.000 pasos de entrenamiento. Es, por tanto, un ejemplo típico de flujo *end-to-end* de imitación con LeRobot: grabar demostraciones teleoperadas, entrenar y desplegar en el mismo robot.

Su relevancia es práctica más que de investigación: sirve como referencia reproducible de cómo se estructura un *policy* ACT en LeRobot 0.6.2 (formato de observaciones, claves de cámara, configuración de entrenamiento) y como punto de partida para quien quiera replicar el pipeline con su propio brazo SO-100/SO-101. Al no haber evaluación publicada ni licencia declarada, no debe tratarse como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con VAE condicional sobre observaciones visuales y de estado; implementación de LeRobot |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: política de control, no modelo de lenguaje. Entrada = estado `(6,)` + 2 imágenes `(3, 480, 640)`; horizonte del chunk de acciones no disponible |
| Tipos de cuantizacion | No disponible (el repo solo publica pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | No aplica. La instrucción de tarea es una cadena fija en inglés: "pick up the yellow object and put it in the pink bowl" |
| Licencia | No disponible (la model card deja el campo como "[More Information Needed]") |
| Formato de pesos | safetensors (librería `lerobot`) |

Otras especificaciones relevantes:

| Parametro | Valor |
|---|---|
| Tipo de robot | `so_follower` (brazo seguidor de la familia SO-100/SO-101) |
| Cámaras | `wrist`, `front` (640x480, 3 canales) |
| Entrada `observation.state` | STATE, shape `(6,)` |
| Entrada `observation.images.wrist` | VISUAL, shape `(3, 480, 640)` |
| Entrada `observation.images.front` | VISUAL, shape `(3, 480, 640)` |
| Salida `action` | ACTION, shape `(6,)` |
| Dataset de entrenamiento | `terk182/pick_yellow_brick_v2` (44 episodios, 26.589 fotogramas, 20 FPS) |
| Pasos de entrenamiento | 15.000 |
| Batch size | 16 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.2 |
| Pipeline | `robotics` |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers, arXiv:2304.13705) es un método de aprendizaje por imitación que, en lugar de predecir una acción por paso, predice un *chunk* de varias acciones futuras de una sola vez. Esto reduce el error de acumulación de la política y suaviza la señal de control. La formulación original combina un autocodificador variacional condicional (CVAE) con un transformer: durante el entrenamiento se codifica el chunk de acciones junto con las observaciones en una variable latente, y en inferencia se decodifica directamente desde las observaciones. En la implementación de LeRobot, el *policy* `act` usa un backbone convolucional para las imágenes y un transformer encoder-decoder para fusionar estado y representaciones visuales. La model card no detalla la configuración exacta de capas, dimensionalidad latente ni tamaño del chunk de acciones para este checkpoint concreto.

El entrenamiento es puramente supervisado sobre demostraciones teleoperadas, sin RLHF ni DPO (no aplica en este dominio). El dataset consta de 44 episodios y 26.589 fotogramas capturados a 20 FPS, con dos vistas sincronizadas; la tarea es única y el guion de instrucción está fijado. La configuración reportada es de 15.000 pasos con batch 16, AdamW y una tasa de aprendizaje muy baja (1e-5), lo que sugiere un ajuste conservador sobre un conjunto de datos pequeño. No se documenta aumento de datos, composición demográfica ni variabilidad de posiciones, iluminación o distractores durante la grabación, factores que condicionan directamente la generalización.

No hay innovaciones técnicas propias de este checkpoint: es una aplicación estándar del método ACT mediante el CLI `lerobot-train`, con el pipeline de LeRobot 0.6.2.

## Capacidades

- Control visomotor de un brazo robótico de 6 grados de libertad: mapea directamente de píxeles y estado articular a comandos de acción.
- Ejecución de una tarea de manipulación concreta: coger un objeto amarillo y colocarlo en un cuenco rosa.
- Fusión de dos vistas de cámara (`wrist` y `front`) con el estado de las articulaciones en una única representación.
- Predicción de chunks de acciones, lo que produce trayectorias más suaves que un controlador paso a paso.
- Ejecución autónoma en bucle cerrado mediante `lerobot-rollout`, con posibilidad de grabar episodios si se cambia la estrategia.
- Reentrenamiento y ajuste fino posible con `lerobot-train --policy.type=act` sobre el mismo formato de dataset.
- No soporta *tool calling*, ni razonamiento multi-paso simbólico, ni generación de texto, ni capacidades multilingües, ni visión general (clasificación, VQA, OCR). No hay modo *thinking*, audio ni vídeo.

## Casos de uso

- Replicación de pipelines de imitación: sirve como plantilla funcional para verificar que la instalación de LeRobot, la calibración del brazo `so_follower` y las cámaras están correctamente configuradas antes de grabar un dataset propio.
- Recogida de objetos en un entorno controlado: con el objeto amarillo y el cuenco rosa en posiciones similares a las del dataset, la política puede ejecutar la secuencia completa de forma autónoma durante un tiempo configurable.
- Docencia y formación en robótica: demuestra de extremo a extremo el ciclo teleoperación, grabación, entrenamiento y despliegue, con una configuración de entrenamiento documentada y reproducible (semilla 1000, 15.000 pasos).
- Punto de partida para *fine-tuning*: quien disponga de un brazo SO-100/SO-101 y quiera entrenar su propia tarea puede reutilizar la configuración de hiperparámetros (AdamW, lr 1e-5, batch 16) como base.
- Pruebas de integración en laboratorio: útil para validar la latencia del bucle de control a 20-30 FPS y el rendimiento de inferencia en la GPU o CPU objetivo antes de invertir en un dataset mayor.
- Generación de datos sintéticos de evaluación: los episodios ejecutados por la política pueden compararse con las demostraciones humanas para medir desviaciones de trayectoria, aunque requiere instrumentación adicional no incluida en el repo.
- Comparación de métodos: al ser una implementación ACT estándar, sirve como línea base frente a Diffusion Policy o SmolVLA en el mismo robot y tarea, siempre que se entrene con el mismo dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación con la plantilla vacía y la nota explícita: «No evaluation results have been provided for this policy yet». No hay tasas de éxito, número de ensayos ni condiciones de prueba (posiciones de objeto, iluminación, distractores, robot distinto).

Como referencia del método y no de este checkpoint, el artículo original de ACT (arXiv:2304.13705) reporta altas tasas de éxito en tareas de manipulación bimanual sobre el hardware ALOHA; esos resultados no son extrapolables a esta política, que se entrenó con 44 episodios sobre un robot distinto.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 51,7 M de parámetros, los pesos ocupan aproximadamente 207 MB en FP32 y unos 103 MB en FP16/BF16; sumando activaciones de dos imágenes de 480x640 y el estado, el pico de memoria se mantiene holgadamente por debajo de 1-2 GB (estimación, no medida por el autor).
- GPU recomendadas: cualquier GPU con soporte CUDA moderna es suficiente (RTX 3060/4060 en adelante). Para entrenamiento, una RTX 4090 o una A100/H100 aceleran el proceso, pero el tamaño del modelo no las hace necesarias; con 15.000 pasos y batch 16 el entrenamiento es asequible en GPU de gama media.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con al menos 4 GB de VRAM; también es viable en CPU para inferencia, aunque conviene medir la latencia.
- Opciones de despliegue: `lerobot-rollout` (script oficial, estrategia `base`), integración directa con el paquete Python `lerobot`; no se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, que no aplican a este tipo de política.
- Latencia y throughput: el bucle de control debe sostener al menos 20 Hz (frecuencia de grabación del dataset) para reproducir la dinámica entrenada. No se publican medidas de latencia ni de throughput por episodio; el rendimiento real depende de la GPU, de la resolución de las dos cámaras y del tamaño del chunk de acciones, que no se documenta.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `terk182/act_pick_yellow_brick_v2` (este) | ACT, imitación | 51.668.614 | Chunk de acciones, valor no disponible | No disponible | HuggingFace Hub, vía LeRobot |
| ACT (implementación genérica de LeRobot) | ACT, imitación | Depende de la configuración; no disponible | Chunk configurable | Apache-2.0 (código de LeRobot) | `lerobot` en GitHub y Hub |
| Diffusion Policy (LeRobot) | Política por difusión | No disponible | Horizonte de predicción configurable | Apache-2.0 (código de LeRobot) | `lerobot` en GitHub y Hub |
| SmolVLA (HuggingFace) | VLA (visión-lenguaje-acción) | ~450 M (dato público aproximado, verificar) | Ventana multimodal; no disponible en detalle | No disponible en esta ficha | HuggingFace Hub, vía LeRobot |

No existen datos de rendimiento comparable entre estas alternativas en la información disponible: este checkpoint no aporta métricas de éxito y los demás no se han evaluado aquí bajo las mismas condiciones. Cualquier comparación cuantitativa requeriría entrenar y evaluar cada método sobre el mismo dataset (`terk182/pick_yellow_brick_v2`) y el mismo robot.

## Limitaciones y advertencias

- Licencia no declarada: no hay autorización explícita de uso comercial. Tratar el modelo como no apto para producción hasta que el autor especifique términos.
- Sin evaluación publicada: se desconoce la tasa de éxito real, incluso en las condiciones exactas del dataset. Cualquier despliegue requiere una campaña de ensayos propia (por ejemplo, 10-20 intentos por configuración).
- Dataset muy pequeño (44 episodios, 26.589 fotogramas) y una sola tarea: riesgo alto de sobreajuste a posiciones, iluminación, fondo y apariencia concretas del objeto amarillo y del cuenco rosa.
- Atado a un *embodiment* concreto: solo funciona con un robot `so_follower` con la misma cinemática y el mismo montaje de cámaras (`wrist`, `front`); un robot distinto, aunque sea del mismo modelo, exige recalibrar y probablemente reentrenar.
- Dependencia crítica de la disposición de cámaras: las claves de observación deben coincidir exactamente con las del entrenamiento; un cambio de índice, resolución (640x480) o encuadre degrada la política de forma abrupta.
- La instrucción de tarea es una cadena fija en inglés; no hay comprensión del lenguaje ni generalización a otras órdenes.
- Sin mecanismo de seguridad intrínseco: la política emitirá acciones aunque la escena no se corresponda con la tarea, por lo que se recomienda limitar la duración (`--duration`), usar parada de emergencia y operar en un espacio de trabajo despejado.
- Riesgo de alucinación en sentido figurado: el modelo puede generar trayectorias plausibles pero incorrectas (por ejemplo, dirigirse al objeto equivocado) sin señal de incertidumbre; no hay estimación de confianza expuesta.
- No hay información sobre sesgos de los datos de demostración (posición del operador, iluminación de la sala, tipo de objeto) más allá de la descripción de la tarea.
- Fecha de creación del repositorio en los metadatos: 2026-10-19, lo que dificulta situar el checkpoint en el tiempo; conviene comprobar la versión de LeRobot (0.6.2) frente a la instalada, por posibles incompatibilidades de formato.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/terk182/act_pick_yellow_brick_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/terk182/pick_yellow_brick_v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=terk182/pick_yellow_brick_v2
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (*rollout*): https://huggingface.co/docs/lerobot/main/en/inference

Nota: la búsqueda web proporcionada no devolvió resultados relacionados con este modelo ni con robótica; los enlaces encontrados corresponden a una agencia de representación artística y se han descartado por no ser pertinentes.
