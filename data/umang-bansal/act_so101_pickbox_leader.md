# Umang-Bansal/act_so101_pickbox_leader

## Resumen

ACT SO101 Pickbox Leader es una política de imitación (policy) entrenada con el método Action Chunking with Transformers (ACT) sobre el robot SO-101 en configuración follower. La ha publicado el usuario Umang-Bansal en Hugging Face Hub mediante la librería LeRobot de Hugging Face, y está especializada en una única tarea de manipulación: coger un bloque y colocarlo dentro de una caja. No es un modelo de lenguaje ni un modelo generativo de propósito general, sino un controlador visomotor que mapea observaciones (estado articular y dos cámaras) a comandos de acción de 6 dimensiones.

El modelo tiene 51.668.614 parámetros y un repositorio de 3,1 GB, con pesos en formato safetensors. Consume `observation.state` de forma (6,), dos imágenes RGB de 480x640 (cámara frontal y cámara de muñeca) y produce un vector de acción de forma (6,). Se entrenó con 61 episodios y 17.324 fotogramas a 30 FPS procedentes del dataset `Umang-Bansal/so101_pickbox_leader_clean`, durante 50.000 pasos con AdamW y un learning rate de 1e-5.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un pipeline completo de imitation learning en hardware de bajo coste (SO-101), con licencia Apache 2.0, y como punto de partida para quien quiera replicar el flujo de LeRobot o adaptar la política a una tarea similar. No sustituye a un modelo fundacional robótico y no está pensado para generalización fuera de su tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; usa ventana de observaciones de la política) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | SO-101 follower (`so_follower`) |
| Cámaras de entrada | `front` y `wrist`, RGB 3x480x640 |
| Entrada de estado | `observation.state` de forma (6,) |
| Salida de acción | `action` de forma (6,) |
| Dataset de entrenamiento | `Umang-Bansal/so101_pickbox_leader_clean` (61 episodios, 17.324 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 50.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-5 |
| Seed | 1000 |
| Versión de LeRobot | 0.6.1 |
| Tarea | «Pick up the block and place it in the box» |

## Arquitectura y entrenamiento

ACT es un método de imitation learning presentado en el paper arXiv:2304.13705 que predice trozos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad del control. La política combina un backbone transformer con codificación de las observaciones visuales (dos cámaras) y del estado proprioceptivo, y decodifica una secuencia de acciones de forma (6,). Al ser un modelo de robótica, no emplea tokenización textual ni un contexto lingüístico: la «ventana» relevante es la de observaciones que alimentan la política en cada paso de control.

El entrenamiento se realizó con LeRobot 0.6.1 sobre 61 episodios teleoperados (17.324 fotogramas a 30 FPS) del dataset `so101_pickbox_leader_clean`, con 50.000 pasos, batch size 8, AdamW y learning rate 1e-5. La model card no documenta el uso de RLHF, DPO ni un proceso de post-entrenamiento; se trata de aprendizaje supervisado por imitación a partir de demostraciones. Tampoco se detalla la composición exacta del dataset más allá de la tarea y el número de episodios.

## Capacidades

- Control visomotor de un robot SO-101 follower para una tarea concreta de pick-and-place.
- Fusión de dos vistas RGB (frontal y de muñeca) con el estado articular de 6 dimensiones.
- Predicción de chunks de acción de 6 dimensiones, lo que aporta suavidad y reduce el error acumulado en comparación con políticas paso a paso.
- Ejecución en bucle cerrado a 30 FPS sobre el robot real mediante `lerobot-rollout`.
- Entrenamiento y ajuste reproducibles con `lerobot-train` sobre el mismo pipeline de LeRobot.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual, matemáticas, visión general ni capacidades multilingües.

## Casos de uso

- Pick-and-place en el SO-101: la política ejecuta la secuencia de coger el bloque y dejarlo en la caja usando las cámaras frontal y de muñeca; es su caso de uso nativo y el único validado por el autor.
- Reproducción de un pipeline de imitation learning: sirve como referencia completa (dataset, configuración de entrenamiento y comando de rollout) para quien quiera montar su primer flujo con LeRobot y hardware SO-101.
- Base para fine-tuning en tareas similares: partiendo de estos pesos, se puede reentrenar con `lerobot-train` sobre un dataset propio de pick-and-place para adaptar la política a nuevas posiciones de objeto o caja.
- Docencia y divulgación en robótica de bajo coste: el modelo y su dataset permiten demostrar de extremo a extremo cómo se graba teleoperación, se entrena ACT y se despliega en un robot real.
- Evaluación de hardware y calibración: ejecutar la política con `--strategy.type=base` durante una duración fija permite comprobar cámaras, puertos y calibración del SO-101 antes de grabar nuevos datos.
- Prototipado de control visomotor en laboratorio: como política pequeña (51,7 M de parámetros) se puede integrar en experimentos que comparen ACT con otros métodos de imitation learning sobre el mismo robot y dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política y deja la tabla de evaluación vacía (tarea, ensayos, éxitos y tasa de éxito sin rellenar).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 51,7 M de parámetros en safetensors, el peso de los pesos es de aproximadamente 0,2 GB en FP32, pero el consumo real depende de las activaciones del encoder visual y del tamaño de las imágenes de entrada (480x640 por cámara).
- GPU recomendadas: no disponibles en la información proporcionada. El comando de entrenamiento de la model card usa `--policy.device=cuda`, lo que implica una GPU compatible con CUDA.
- ¿Cabe en GPU de consumo? No confirmado por el autor. Por el tamaño del modelo es previsible que quepa en GPUs de consumo, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia en robot, `lerobot-train` para entrenamiento). No se documentan otras rutas de despliegue (vLLM, llama.cpp, Ollama, TGI), que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La política se ejecuta en bucle cerrado a 30 FPS según la configuración del dataset y del comando de rollout, pero no se publican cifras de latencia por paso.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Umang-Bansal/act_so101_pickbox_leader | ACT (imitation learning) | 51.668.614 | Pick-and-place SO-101 | Apache 2.0 | Hugging Face Hub |
| Políticas ACT genéricas de LeRobot | ACT | no disponible | Tareas diversas según dataset | según repo | Hugging Face Hub / LeRobot |
| Políticas Diffusion Policy en LeRobot | Diffusion Policy | no disponible | Manipulación diversa | según repo | Hugging Face Hub / LeRobot |

No se dispone de datos de rendimiento comparables (tasas de éxito, latencia) para establecer una comparación cuantitativa con alternativas. La comparación queda limitada a tipo de método, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: entrenada para una única tarea («Pick up the block and place it in the box») y un único tipo de robot (`so_follower`); no generaliza a otras tareas ni a otros robots sin reentrenamiento.
- Sin evaluación publicada: el autor no reporta tasa de éxito ni número de ensayos, por lo que no hay evidencia cuantitativa de robustez en el robot real.
- Dataset pequeño: 61 episodios y 17.324 fotogramas; la política puede ser sensible a cambios de iluminación, posiciones de objeto, distracciones o variaciones de la escena no cubiertas en las demostraciones.
- Dependencia de calibración y hardware: requiere que los nombres de cámara (`front`, `wrist`) coincidan con las claves de observación y que el robot y las cámaras estén correctamente calibrados; errores de configuración degradan o invalidan la ejecución.
- Sin capacidades lingüísticas ni de razonamiento: no procesa texto, no soporta tool calling ni agentes, y no debe emplearse fuera de su dominio robótico.
- Riesgo de alucinación en el sentido de acciones incorrectas: como toda política de imitación, puede producir comandos erróneos ante entradas fuera de distribución, con riesgo físico para el entorno; se recomienda supervisión y límites de seguridad en el robot.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no se documentan garantías ni soporte; conviene revisar las obligaciones de atribución al redistribuir.
- Idiomas: no aplica; la información de idiomas no está disponible porque el modelo no procesa lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Umang-Bansal/act_so101_pickbox_leader
- Dataset de entrenamiento: https://huggingface.co/datasets/Umang-Bansal/so101_pickbox_leader_clean
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Umang-Bansal/so101_pickbox_leader_clean
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
