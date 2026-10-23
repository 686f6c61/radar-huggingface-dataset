# victorvanhalst/act_botao_75sc

## Resumen

`victorvanhalst/act_botao_75sc` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), publicada en Hugging Face Hub mediante la librería LeRobot. No es un modelo de lenguaje: es un controlador visuomotor entrenado para ejecutar una tarea física concreta ("Open the cover and press the button") sobre un brazo `so_follower` de la familia SO-100, con dos cámaras RGB (muñeca y externa) y un vector de estado articular de 6 dimensiones como entradas, y un vector de acción de 6 dimensiones como salida.

El modelo tiene 51.668.614 parámetros (aproximadamente 51,7 M), un tamaño de repositorio de 0,2 GB en formato safetensors, y se distribuye con licencia Apache 2.0. Se entrenó durante 60.000 pasos con batch size 8, optimizador AdamW y tasa de aprendizaje 1e-5 sobre el dataset `victorvanhalst/hive_botao_100` (100 episodios, 30.358 fotogramas a 25 FPS).

Su relevancia es práctica: ACT es una de las referencias más citadas en aprendizaje por imitación de bajo coste (paper arXiv 2304.13705, del ecosistema ALOHA), y este repositorio es un ejemplo reproducible de extremo a extremo con LeRobot 0.6.1: captura de datos con teleoperación, entrenamiento y despliegue con `lerobot-rollout`. No se han publicado resultados de evaluación en la model card, por lo que la tasa de éxito real de la tarea es desconocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con backbone visual y cabeza de predicción de chunks de acción; incluye componente tipo CVAE para modelar la variabilidad de las demostraciones |
| Parametros totales | 51.668.614 (51,7 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible / no aplica: es una política visuomotora y no procesa contexto textual; el horizonte de predicción de acciones (chunk size) no se documenta en la informacion disponible |
| Tipos de cuantizacion | No disponible; los pesos se publican en safetensors (habitualmente fp32) y no se documentan variantes GGUF, INT8 ni INT4 |
| Idiomas soportados | No aplica (no es un modelo de lenguaje); la instrucción de tarea se pasa como cadena fija ("Open the cover and press the button") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato de política LeRobot, librería `lerobot`) |

Entradas y salidas declaradas por el autor:

| Feature | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | (6,) |
| `observation.images.wrist` | VISUAL | (3, 480, 640) |
| `observation.images.external` | VISUAL | (3, 480, 640) |
| `action` | ACTION | (6,) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) predice fragmentos cortos de acciones futuras en lugar de pasos individuales, lo que reduce el error de acumulación típico de las políticas paso a paso y permite un control más suave. La arquitectura combina un backbone convolucional para extraer características de las dos cámaras, un transformer encoder que fusiona estado articular y representaciones visuales, y un decoder que emite el chunk de acciones; la formulación incluye una variable latente estilo CVAE que captura la multimodalidad de las demostraciones humanas. El modelo aprende exclusivamente por imitación supervisada a partir de datos teleoperados.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `victorvanhalst/hive_botao_100`: 100 episodios y 30.358 fotogramas a 25 FPS de la tarea "Open the cover and press the button", con una única tarea y un único embodiment (`so_follower`). Configuración declarada: 60.000 pasos, batch size 8, AdamW, learning rate 1e-5, semilla 1000. No se documenta en la informacion disponible el número de tokens ni la composición del dataset (que no aplica en el sentido de un LLM), ni si se aplicaron fases de RLHF o DPO (no aplicables a una política de imitación). Tampoco se detallan innovaciones adicionales como decodificación especulativa, atención lineal o técnicas de compresión del modelo.

## Capacidades

- Control visuomotor de manipulación: genera comandos de 6 dimensiones para un brazo `so_follower` a partir de dos vistas RGB y del estado articular.
- Predicción por chunks de acción: emite secuencias cortas de acciones, lo que mejora la suavidad y reduce el error acumulado frente a políticas paso a paso.
- Ejecución de una tarea concreta y aprendida: abrir una tapa y pulsar un botón.
- Imitación de demostraciones teleoperadas, con capacidad de aprender tareas nuevas mediante reentrenamiento sobre datasets propios.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout` y visualización de datos desde el Hub.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica; la "planificación" se limita al horizonte del chunk de acción.
- Capacidades multilingües: no aplica.
- Capacidades especiales: no se documentan modo thinking, visión general, audio ni otras modalidades distintas del par RGB + estado articular.

## Casos de uso

- Automatización de la tarea entrenada en banco de pruebas: desplegar la política con `lerobot-rollout` sobre un SO-100 follower para abrir una tapa y pulsar un botón de forma repetible; es adecuada porque el dataset de entrenamiento corresponde exactamente a esa secuencia.
- Generación de nuevos datos de entrenamiento en bucle: usar `--strategy.type` con grabación de episodios para capturar ejecuciones del modelo y ampliar el dataset, aprovechando que el modelo ya opera a la frecuencia de captura de 25 FPS.
- Fine-tuning para tareas adyacentes: reentrenar con `lerobot-train --policy.type=act` partiendo de estos pesos para tareas de manipulación similares con pocas decenas de episodios, reduciendo el coste frente a entrenar desde cero.
- Baseline de comparación de políticas: emplear este ACT como referencia frente a las variantes `diffusion_botao_75` y `diffusion_botao_75sc` del mismo autor sobre el mismo dataset y robot, para medir diferencias de éxito y suavidad de trayectoria.
- Prototipado de bajo coste en robótica de escritorio: al tener 51,7 M de parámetros, la inferencia cabe en GPUs de consumo e incluso en placas embebidas, lo que permite validar el pipeline completo antes de invertir en hardware mayor.
- Docencia e investigación en aprendizaje por imitación: el repositorio incluye la configuración exacta de entrenamiento, lo que facilita reproducir el experimento y estudiar el efecto de hiperparámetros como el número de episodios o la tasa de aprendizaje.
- Evaluación de robustez ante cambios de escena: ejecutar la política bajo variaciones controladas de iluminación, posición del objeto o montaje de cámara para caracterizar la degradación del modelo antes de un despliegue real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No existen, por tanto, tasas de éxito por tarea, número de ensayos ni métricas de latencia medidas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros los pesos ocupan aproximadamente 207 MB en fp32 y unos 103 MB en fp16. Contando dos flujos de vídeo a 480x640 y las activaciones del transformer, es razonable reservar 1-2 GB de VRAM; se recomienda una GPU con al menos 4-6 GB para operar con margen.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4070 o RTX 4090 para estaciones de trabajo; A100/H100 no son necesarias para inferencia. Para despliegue embebido sobre el robot, Jetson Orin Nano o Orin NX son opciones coherentes con este tamaño de modelo.
- ¿Cabe en GPU de consumo? Sí, con holgura: cualquier GPU con 6 GB o más puede ejecutar la política. La inferencia en CPU es técnicamente posible pero no recomendada para un bucle de control a 25-30 Hz.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) sobre PyTorch es la vía documentada. No aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no se han publicado mediciones. Como referencia de diseño, el dataset se capturó a 25 FPS y la configuración de cámaras del ejemplo de despliegue usa 640x480 a 30 FPS, por lo que el presupuesto por inferencia debe mantenerse en el entorno de 33-40 ms para no degradar el control; la predicción por chunks relaja parcialmente este requisito.
- Almacenamiento: el repositorio completo ocupa 0,2 GB, incluyendo pesos y configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `victorvanhalst/act_botao_75sc` (este) | 51.668.614 | No aplica | Sin resultados publicados | Apache 2.0 | Hugging Face Hub, librería LeRobot |
| `victorvanhalst/act_botao_75` | No disponible | No aplica | Sin resultados publicados | No disponible en la informacion | Hugging Face Hub, LeRobot |
| `victorvanhalst/act_botao_50` | No disponible | No aplica | Sin resultados publicados | No disponible en la informacion | Hugging Face Hub, LeRobot |
| `victorvanhalst/act_botao_100` | No disponible | No aplica | Sin resultados publicados | No disponible en la informacion | Hugging Face Hub, LeRobot |
| `victorvanhalst/diffusion_botao_75` | No disponible | No aplica | Sin resultados publicados | No disponible en la informacion | Hugging Face Hub, LeRobot |
| `victorvanhalst/diffusion_botao_75sc` | No disponible | No aplica | Sin resultados publicados | No disponible en la informacion | Hugging Face Hub, LeRobot |

Las variantes `act_*` y `diffusion_*` del mismo autor parecen corresponder a la misma tarea y robot con dos familias de políticas distintas (ACT frente a Diffusion Policy) y distintos volúmenes de datos; los datos concretos de parámetros y resultados de esas variantes no están disponibles en la información consultada.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito, número de ensayos ni condiciones de prueba publicadas; no se puede afirmar que la política funcione de forma fiable en un robot real.
- Especialización extrema: entrenada para una única tarea ("Open the cover and press the button"), un único embodiment (`so_follower`) y una única escena; no generaliza a otras tareas sin reentrenamiento.
- Sensibilidad a distribución: cambios en iluminación, posición del objeto, fondo, montaje o calibración de las cámaras pueden degradar el comportamiento de forma significativa.
- Dependencia estricta de las entradas: las dos cámaras deben llamarse `wrist` y `external` y entregar 480x640 a 3 canales; un desajuste en nombres, resolución o frecuencia rompe la inferencia.
- Riesgo de sobreajuste: 100 episodios y 30.358 fotogramas con 60.000 pasos de entrenamiento es una relación que conviene validar con un conjunto de episodios reservados.
- Inconsistencia de nomenclatura: el repositorio se llama `act_botao_75sc` mientras que el dataset declarado es `hive_botao_100` (100 episodios); conviene verificar a qué versión de datos corresponden realmente los pesos antes de reutilizarlos.
- Alucinación: no aplica en el sentido de un modelo de lenguaje, pero sí existe el riesgo equivalente de executar acciones no válidas o inseguras ante observaciones fuera de distribución.
- Licencia: los pesos son Apache 2.0 y permiten uso comercial; la licencia del dataset `victorvanhalst/hive_botao_100` no se detalla en la información disponible y debe comprobarse por separado.
- Seguridad física: al tratarse de un controlador de robot, cualquier despliegue debe ir acompañado de límites de par, paradas de emergencia y supervisión humana durante la validación.
- Sin variantes de cuantización ni artefactos de despliegue alternativos documentados, lo que limita optimizaciones en hardware embebido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/victorvanhalst/act_botao_75sc
- Dataset de entrenamiento: https://huggingface.co/datasets/victorvanhalst/hive_botao_100
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=victorvanhalst/hive_botao_100
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Variante ACT con otro volumen de datos: https://huggingface.co/victorvanhalst/act_botao_75
- Variante ACT con otro volumen de datos: https://huggingface.co/victorvanhalst/act_botao_50
- Variante ACT con otro volumen de datos: https://huggingface.co/victorvanhalst/act_botao_100
- Variante Diffusion Policy: https://huggingface.co/victorvanhalst/diffusion_botao_75
- Variante Diffusion Policy: https://huggingface.co/victorvanhalst/diffusion_botao_75sc
