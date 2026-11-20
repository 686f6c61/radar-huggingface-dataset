# vanil1/SO101-ACT-Stacking-Jitter-c50

## Resumen

SO101-ACT-Stacking-Jitter-c50 es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. El modelo lo ha desarrollado el usuario vanil1 y se distribuye a través de Hugging Face Hub con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visomotor que, a partir de una imagen de cámara de muñeca y del estado articular del robot, predice directamente comandos de acción para un brazo robótico de tipo `so_follower`.

El modelo resuelve una tarea concreta de manipulación: apilar tres cubos (rojo, amarillo y morado) sobre una marca en la mesa. Se ha entrenado sobre un dataset de 104 episodios y 140.439 fotogramas a 30 FPS, capturados mediante teleoperación. Con 51,6 millones de parámetros y un repositorio de solo 0,2 GB, es un modelo ligero pensado para ejecutarse en el propio robot o en un equipo con GPU de consumo.

Su relevancia es la de un ejemplo práctico y reproducible de aprendizaje por imitación con ACT dentro del ecosistema LeRobot: sirve como referencia para entrenar políticas similares, para evaluar técnicas de aumento de datos (el sufijo "jitter" sugiere ruido inyectado en el dataset) y para desplegar control visomotor en robots de bajo coste tipo SO-101.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.617.414 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación implícita en el chunk de acciones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de un único paso, lo que reduce el error de acumulación y mejora la estabilidad del control. El modelo consume dos modalidades: una observación visual de la cámara de muñeca con forma `(3, 640, 480)` y el estado articular del robot con forma `(6,)`, y produce una acción de 6 dimensiones. La arquitectura típica de ACT incluye un backbone visual (ResNet) para extraer características de la imagen, un codificador de estado y un transformer que fusiona ambas señales para generar el chunk de acciones.

El entrenamiento se realizó con LeRobot 0.6.1 durante 110.000 pasos, con batch size de 32, optimizador AdamW, learning rate de 1e-5 y semilla 1000. El dataset `shilpitha-03/so101_stack_rpy_plus_jitter` contiene 104 episodios y 140.439 fotogramas a 30 FPS de la tarea "Stack the red, yellow and purple cubes on the table mark". El sufijo "jitter" en el nombre del repositorio y del dataset apunta a que se aplicó ruido o perturbaciones a las trayectorias durante la recogida de datos, una técnica habitual para mejorar la robustez frente a variaciones de posición y ejecución. No se documenta el uso de RLHF ni DPO, algo esperable en un modelo de imitación supervisada.

## Capacidades

- Control visomotor de un brazo robótico `so_follower` con 6 grados de libertad a partir de una cámara de muñeca.
- Predicción de chunks de acción para ejecución fluida y estable en tareas de manipulación.
- Ejecución de la tarea específica de apilar tres cubos de colores sobre una marca en la mesa.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de recompensas ni entorno simulado.
- Despliegue mediante la CLI de LeRobot (`lerobot-rollout`) y entrenamiento reproducible (`lerobot-train`).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Apilado de cubos en entornos de laboratorio: el modelo ejecuta directamente la tarea para la que fue entrenado sobre un SO-101, útil como banco de pruebas de políticas ACT y como baseline en experimentos de manipulación.
- Reproducción de experimentos de imitación: sirve para validar pipelines de LeRobot 0.6.1 de extremo a extremo, desde la grabación de datos hasta el despliegue en robot real.
- Estudio del efecto del data augmentation: al haberse entrenado con un dataset con jitter, permite comparar su robustez frente a políticas entrenadas sin perturbaciones en la misma tarea.
- Educación y formación en robótica: ejemplo ligero (0,2 GB) y de código abierto para enseñar aprendizaje por imitación y control visomotor en cursos prácticos.
- Base para fine-tuning en tareas de pick-and-place: partiendo de esta política se puede adaptar a objetos o posiciones similares con un dataset reducido, aprovechando el conocimiento visomotor ya adquirido.
- Evaluación de hardware de bajo coste: permite medir latencia y fiabilidad de un SO-101 con cámara de muñeca en una tarea repetible y bien definida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los 51,6 millones de parámetros en precisión completa; cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo, pero válidas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), PyTorch nativo; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del robot, la cámara y el equipo de cómputo.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SO101-ACT-Stacking-Jitter-c50 | 51,6 M | Apilado de cubos con SO-101 | no aplica | apache-2.0 | Hugging Face (LeRobot) |
| Políticas ACT genéricas de LeRobot | variable | Manipulación diversa | no aplica | apache-2.0 | Hugging Face / GitHub |
| Políticas Diffusion Policy | variable | Manipulación visomotora | no aplica | variable | Hugging Face / GitHub |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado para una única tarea y un único robot (`so_follower`): no generaliza a otras tareas, objetos o morfologías sin reentrenamiento o fine-tuning.
- Sin resultados de evaluación publicados: se desconoce la tasa de éxito real en robot, por lo que no debe asumirse un rendimiento concreto en producción.
- Dependencia de la cámara de muñeca y de las condiciones de iluminación y posicionamiento del dataset original; cambios en el entorno pueden degradar el comportamiento.
- Riesgo de sobreajuste al dataset de 104 episodios, especialmente en posiciones de objetos no representadas.
- No es un modelo de lenguaje: no procesa texto libre, no razona simbólicamente y no soporta instrucciones en lenguaje natural más allá de la etiqueta de tarea.
- Licencia apache-2.0 permisiva para uso comercial, pero la responsabilidad sobre el despliegue físico y la seguridad del robot recae en el usuario.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vanil1/SO101-ACT-Stacking-Jitter-c50
- Dataset de entrenamiento: https://huggingface.co/datasets/shilpitha-03/so101_stack_rpy_plus_jitter
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
