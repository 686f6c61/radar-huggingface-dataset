# ThiennNguyen/act_so101_small

## Resumen

El modelo `ThiennNguyen/act_so101_small` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por ThiennNguyen y publicada en Hugging Face bajo la licencia Apache 2.0. Está entrenada con el framework LeRobot para controlar un brazo robótico SO-101 (tipo `so_follower`) mediante aprendizaje por imitación a partir de demostraciones teleoperadas. El modelo resuelve el problema de generar secuencias de acciones (chunks) a partir de observaciones de estado y una cámara frontal, lo que permite ejecutar tareas de manipulación como recoger objetos y colocarlos en una cesta.

Con 51,7 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo ligero diseñado para inferencia en tiempo real en robots de bajo coste. Su relevancia radica en ser un ejemplo práctico de aplicación de ACT en un robot real, demostrando cómo un transformer puede aprender políticas de control a partir de datos de teleoperación. La arquitectura se basa en el paper original de ACT (arXiv:2304.13705) y está integrada en el ecosistema LeRobot, lo que facilita su reproducción y despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control robótico) |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible (no es modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que utiliza un transformer para predecir chunks de acciones (secuencias de varios pasos) en lugar de acciones individuales. El modelo recibe como entrada el estado del robot (vector de 6 dimensiones) y una imagen RGB de 480x640 píxeles de una cámara frontal, y produce como salida un vector de acción de 6 dimensiones. La arquitectura interna sigue el diseño del paper original, con un codificador de visión y un decodificador autorregresivo que genera secuencias de acciones.

El entrenamiento se realizó con el dataset `ThiennNguyen/record_test_1608_single`, que contiene 100 episodios teleoperados (42.616 frames a 30 FPS) de la tarea "recoger dulces y ponerlos en la cesta". Se utilizó el optimizador AdamW con una tasa de aprendizaje de 1e-5, un batch size de 64 y 12.500 pasos de entrenamiento, con una semilla fija de 1000. El modelo fue entrenado con LeRobot versión 0.6.2 y no se aplicaron técnicas de RLHF ni DPO, ya que es un método de imitación puro.

## Capacidades

- Control robótico: genera comandos de acción de 6 dimensiones (posición/orientación o velocidades) a partir de observaciones de estado y visión.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas.
- Predicción de chunks de acciones: produce secuencias de acciones coherentes para tareas de manipulación.
- Integración con LeRobot: compatible con el pipeline de entrenamiento, evaluación y despliegue de LeRobot.
- Soporte de cámara frontal: procesa imágenes RGB de 480x640 para percibir el entorno.
- No soporta tool calling, generación de texto, razonamiento simbólico ni capacidades multilingües, al ser un modelo puramente robótico.

## Casos de uso

- Tareas de pick and place: el modelo puede ejecutar la tarea específica para la que fue entrenado (recoger dulces y colocarlos en una cesta), útil en líneas de clasificación o ensamblaje.
- Automatización de procesos repetitivos: en entornos de laboratorio o producción, puede reemplazar la operación manual de un brazo robótico en tareas simples y repetitivas.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas ACT entre diferentes configuraciones de robot o tareas.
- Prototipado rápido de políticas robóticas: gracias a su pequeño tamaño y a la integración con LeRobot, permite iterar rápidamente sobre nuevas tareas con pocos datos.
- Educación y formación en robótica: puede utilizarse en cursos o talleres para demostrar el flujo completo de entrenamiento y despliegue de una política de imitación.
- Benchmarking de hardware robótico: al ser ligero, es adecuado para evaluar el rendimiento de GPUs embebidas o de bajo consumo en control en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- VRAM estimada: no disponible, pero al tratarse de un modelo de 51,7 millones de parámetros (0,2 GB en safetensors), la inferencia puede ejecutarse en GPUs con poca memoria, probablemente menos de 2 GB.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (por ejemplo, NVIDIA GTX 1060 o superior) es suficiente para inferencia en tiempo real.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media y baja, así como en dispositivos embebidos como Jetson Nano o Raspberry Pi con acelerador.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que cargan el modelo y lo ejecutan en el robot. También puede integrarse con frameworks de inferencia como PyTorch.
- Latencia y throughput: no disponibles, pero dado el tamaño del modelo, se espera una latencia inferior a 50 ms en GPU moderna, aunque no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThiennNguyen/act_so101_small | 51,7 M | no aplica | Pick and place (SO-101) | Apache 2.0 | Hugging Face |
| Aipolabs/act_so101 | no disponible | no aplica | Pick and place (SO-101) | Apache 2.0 | Hugging Face |
| Otros modelos ACT en LeRobot | variable | no aplica | Diversas tareas robóticas | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a la arquitectura y el dominio de aplicación, siendo todos ellos políticas ACT entrenadas con LeRobot para el mismo tipo de brazo robótico.

## Limitaciones y advertencias

- No se han realizado evaluaciones en robot real, por lo que el rendimiento real en el hardware objetivo es desconocido.
- El modelo está entrenado exclusivamente para la tarea "recoger dulces y ponerlos en la cesta"; no generaliza a otras tareas sin reentrenamiento.
- Depende de la configuración específica del robot (tipo `so_follower`) y de la cámara frontal; cambios en la posición de la cámara, iluminación o el entorno pueden degradar el rendimiento.
- No se han documentado sesgos ni riesgos de alucinación, pero al ser un modelo de control, cualquier error en la predicción de acciones puede causar movimientos no deseados del robot.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda validar el modelo en un entorno seguro antes de su despliegue en producción.
- El dataset de entrenamiento es de un solo usuario y una sola tarea, lo que limita la robustez frente a variaciones en la colocación de objetos o en la dinámica del robot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThiennNguyen/act_so101_small
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/ThiennNguyen/record_test_1608_single
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
