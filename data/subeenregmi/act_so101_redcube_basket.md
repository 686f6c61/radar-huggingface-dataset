# subeenregmi/act_so101_redcube_basket

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. Este repositorio concreto, `subeenregmi/act_so101_redcube_basket`, es una política entrenada con LeRobot sobre el robot `so_follower` (SO-101) para la tarea concreta de recoger un cubo rojo y depositarlo en una caja. El modelo consume el estado de las articulaciones y dos cámaras (muñeca y frontal) y produce comandos de acción de 6 dimensiones.

Se trata de un modelo de robótica de pequeño tamaño (51.668.614 parámetros, 0,2 GB en safetensors) que no es un modelo de lenguaje: no procesa texto ni genera lenguaje natural. Su relevancia radica en ser un ejemplo práctico y reproducible de entrenamiento de políticas visomotoras con LeRobot, la librería de Hugging Face para robótica real, y en implementar el método ACT descrito en el paper arXiv:2304.13705.

La política fue entrenada sobre un dataset de 50 episodios y 45.000 fotogramas a 30 FPS, con 50.000 pasos de entrenamiento. Es un artefacto de investigación y demostración más que un modelo de propósito general: su utilidad está acotada a la tarea y al robot para los que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), aprendizaje por imitación |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` (SO-101) |
| Camaras | `wrist`, `front` |
| Entrada de estado | `observation.state` con forma `(6,)` |
| Entradas visuales | `observation.images.wrist` y `observation.images.front`, forma `(3, 480, 640)` |
| Salida de accion | `action` con forma `(6,)` |
| Tamano del repositorio | 0,2 GB |
| Libreria | lerobot (version 0.7.1) |

## Arquitectura y entrenamiento

ACT es un transformer que aprende una política visomotora por imitación a partir de demostraciones teleoperadas. En lugar de predecir una única acción por paso de tiempo, predice un chunk de acciones futuras, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación. El modelo combina observaciones del estado de las articulaciones (vector de 6 dimensiones) con dos flujos de imagen RGB de 480×640 píxeles (cámara de muñeca y cámara frontal) para producir comandos de acción de 6 dimensiones.

El entrenamiento se realizó con LeRobot 0.7.1 sobre el dataset `subeenregmi/so101_redcube_basket_20261125_230155`, compuesto por 50 episodios, 45.000 fotogramas a 30 FPS y la tarea "Pick up the cube and put it in the box". La configuración fue de 50.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta el uso de RLHF, DPO ni técnicas de refuerzo adicionales; es aprendizaje supervisado por imitación puro. La model card no detalla innovaciones técnicas adicionales más allá del propio action chunking del método ACT.

## Capacidades

- Control visomotor de un brazo robótico SO-101 (`so_follower`) mediante predicción de chunks de acción de 6 dimensiones.
- Fusión de estado de articulaciones (6 valores) con dos cámaras RGB de 480×640 para la toma de decisiones.
- Ejecución de la tarea específica "Pick up the cube and put it in the box" (recoger el cubo y ponerlo en la caja).
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de recompensas explícitas.
- Integración con el ecosistema LeRobot: comandos `lerobot-rollout` para despliegue y `lerobot-train` para reentrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües, de visión general o de audio: es un modelo de robótica especializado.

## Casos de uso

- Recogida y depósito de objetos en entornos controlados: la política ejecuta la tarea de coger el cubo rojo y dejarlo en la caja, adecuada para demostraciones de manipulación con el SO-101 en laboratorio o aula.
- Replicación de experimentos de aprendizaje por imitación: sirve como referencia reproducible para validar pipelines de LeRobot, comparar configuraciones de entrenamiento o estudiar el efecto del action chunking.
- Base para fine-tuning en tareas similares: al estar entrenada sobre un dataset de 50 episodios, puede servir de punto de partida para reentrenar con `lerobot-train` sobre nuevas tareas de pick-and-place con el mismo robot y cámaras.
- Docencia y formación en robótica: el modelo y su dataset permiten ilustrar el flujo completo de teleoperación, grabación de datos, entrenamiento y despliegue en un robot real de bajo coste.
- Pruebas de integración hardware-software: útil para verificar la calibración del SO-101, la configuración de las cámaras `wrist` y `front` y la latencia del bucle de control a 30 FPS.
- Evaluación de robustez visomotora: permite estudiar cómo afectan cambios de iluminación, posición del objeto o distracciones al rendimiento de una política ACT entrenada con pocos datos.
- Prototipado de automatización de pick-and-place: como paso previo a soluciones industriales, sirve para validar la viabilidad de una tarea de recogida y depósito antes de invertir en datasets mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros y pesos safetensors de 0,2 GB, la inferencia cabe holgadamente en cualquier GPU consumer moderna (el peso en FP32 ronda los 0,2 GB).
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; el cuello de botella real es el procesamiento de dos flujos de imagen de 480×640 a 30 FPS, no el tamaño del modelo.
- Cabe en GPU consumer: sí, en cualquier GPU consumer con al menos unos pocos GB de VRAM (p. ej. RTX 3060, RTX 4060, RTX 4090).
- Opciones de despliegue: LeRobot con el comando `lerobot-rollout` (estrategia `base` o con grabación de episodios); requiere conexión al robot `so_follower` por puerto serie y dos cámaras OpenCV a 640×480 y 30 FPS.
- Latencia y throughput estimados: no disponible; el control opera a 30 FPS según la tasa del dataset de entrenamiento, pero no se publican cifras de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_so101_redcube_basket (este) | 51,7 M | Estado (6,) + 2 imagenes 480×640 | Pick-and-place cubo rojo en SO-101 | no disponible | Hugging Face (LeRobot) |
| Otras politicas ACT en LeRobot Hub | variable | variable segun robot y camaras | Tareas de manipulacion diversas | variable | Hugging Face |
| Diffusion Policy (metodo alternativo en LeRobot) | no disponible | observaciones visomotoras | Manipulacion por imitacion | no disponible | Implementado en LeRobot |
| Politicas VLA de proposito general (p. ej. familias tipo RT/OpenVLA) | cientos de millones a miles de millones | imagen + instruccion en lenguaje | Manipulacion guiada por lenguaje | variable | Hugging Face / repos publicos |

No se dispone de datos de rendimiento comparativo para este modelo concreto; la comparación se limita a parámetros, entradas y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con 50 episodios de un único operador, la política hereda los sesgos de posicionamiento, velocidad y estilo de esa teleoperación; puede fallar ante configuraciones distintas.
- Riesgo de alucinación: no aplica en el sentido de lenguaje, pero sí existe riesgo de acciones erróneas o inseguras fuera de la distribución de entrenamiento (objetos, iluminación o posiciones no vistas).
- Limitaciones de contexto o idioma: no procesa lenguaje; la tarea está fijada por el prompt "Pick up the cube and put it in the box" y el modelo no generaliza a instrucciones nuevas.
- Restricciones de licencia: la licencia no está disponible en la información proporcionada; no se puede confirmar el uso comercial sin consultar al autor.
- Caveat para producción: no hay resultados de evaluación en robot real publicados, por lo que la tasa de éxito es desconocida; requiere validación empírica antes de cualquier despliegue.
- Dependencia de hardware: exige un SO-101 calibrado y dos cámaras con nombres `wrist` y `front` que coincidan con las claves de observación del entrenamiento.
- Dataset pequeño: 45.000 fotogramas y 50 episodios son insuficientes para robustez ante variaciones significativas del entorno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/subeenregmi/act_so101_redcube_basket
- Dataset de entrenamiento: https://huggingface.co/datasets/subeenregmi/so101_redcube_basket_20261125_230155
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=subeenregmi/so101_redcube_basket_20261125_230155
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
