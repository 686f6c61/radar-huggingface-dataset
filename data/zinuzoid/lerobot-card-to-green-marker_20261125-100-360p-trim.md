# zinuzoid/lerobot-card-to-green-marker_20261125-100-360p-trim

## Resumen

Este repositorio contiene una política de robótica entrenada con el método ACT (Action Chunking with Transformers), un enfoque de aprendizaje por imitación que predice bloques cortos de acciones en lugar de pasos individuales. El modelo lo publica el usuario `zinuzoid` y está pensado para controlar un robot con ventosa (`so101_suction_follower`) equipado con dos cámaras: una cenital (`overhead`) y otra en el efector (`gripper`). La tarea concreta para la que se ha entrenado es "Move a card to green marker", es decir, trasladar una tarjeta hasta una marca verde.

No es un modelo de lenguaje: es una política visomotora de 51,67 millones de parámetros que consume el estado articular del robot (vector de 8 dimensiones) y dos imágenes RGB de 360x640 píxeles, y produce un vector de acción de 7 dimensiones. Se ha afinado a partir de un checkpoint previo del mismo autor (`lerobot-card-to-green-marker_20261124-trim-360p`) sobre un conjunto de 100 episodios teleoperados y 30.875 fotogramas a 30 FPS.

Su relevancia es acotada y práctica: sirve como ejemplo reproducible de un pipeline completo de LeRobot (grabación, entrenamiento, despliegue) y como punto de partida para quien quiera replicar o afinar una política ACT en un robot SO-101 con ventosa. No aporta resultados de evaluación publicados, por lo que su utilidad en producción es, por ahora, experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), aprendizaje por imitación |
| Parametros totales | 51.671.687 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política visomotora) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | LeRobot 0.6.2 |
| Tipo de robot | `so101_suction_follower` |
| Camaras | `overhead`, `gripper` (3x360x640 cada una) |
| Entrada de estado | `observation.state` (8,) |
| Salida de accion | `action` (7,) |
| Tamano del repositorio | 0,2 GB |
| Modelo base | `zinuzoid/lerobot-card-to-green-marker_20261124-trim-360p` |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación visomotora que, en lugar de predecir una acción por paso de control, predice un *chunk* de acciones futuras. Esta formulación reduce el error de acumulación típico de las políticas paso a paso y mejora la estabilidad en tareas de manipulación de contacto. El modelo combina un codificador visual (procesa las dos cámaras a 360x640) con el estado propioceptivo de 8 dimensiones y un decodificador que emite el vector de acción de 7 dimensiones. La implementación concreta es la de LeRobot, por lo que los detalles de capas y dimensión oculta no se documentan en la model card.

El entrenamiento se realizó sobre 100 episodios teleoperados (30.875 fotogramas a 30 FPS) del dataset `zinuzoid/lerobot-card-to-green-marker_20261125-100-360p-trim`, con 100.000 pasos, batch de 24, optimizador AdamW, learning rate 2e-05 y semilla 1000. No se documenta el uso de RLHF, DPO ni ninguna fase de refinamiento posterior; es aprendizaje por imitación supervisado puro. Tampoco se detalla la composición del dataset más allá de la tarea y el número de episodios.

## Capacidades

- Control visomotor de un robot SO-101 con ventosa para una tarea de manipulación concreta: mover una tarjeta hasta una marca verde.
- Fusión de dos vistas de cámara (`overhead` y `gripper`) con el estado articular en un único vector de observación.
- Predicción de chunks de acción de 7 dimensiones, orientada a ejecución estable en tiempo real a 30 FPS.
- Aprendizaje por imitación a partir de demostraciones teleoperadas; no requiere modelado explícito del entorno.
- Afinamiento adicional desde el checkpoint base mediante `lerobot-train`, lo que permite reutilizarla como inicialización para tareas relacionadas.
- No soporta tool calling, agentes, razonamiento multi-paso, ni capacidades multilingües, de visión general o de audio: es una política de robótica especializada.

## Casos de uso

- **Automatización de una celda de pick-and-place con tarjetas:** la política ejecuta la secuencia completa de aproximación, agarre con ventosa y colocación sobre la marca verde, adecuada para demostraciones de laboratorio y prototipos de línea de montaje ligera.
- **Banco de pruebas de un pipeline LeRobot completo:** sirve para validar de extremo a extremo la grabación de datos, el entrenamiento con `lerobot-train` y el despliegue con `lerobot-rollout` en un robot SO-101 real.
- **Punto de partida para afinar tareas similares:** al estar entrenada sobre una tarea de manipulación plana, puede reutilizarse como inicialización para variantes (otra posición de la marca, otro objeto) con un dataset pequeño adicional.
- **Investigación en aprendizaje por imitación:** permite comparar el rendimiento de ACT frente a otras políticas (diffusion policy, VLA) en una tarea reproducible y con dataset público.
- **Docencia y formación en robótica de imitación:** el par dataset + política + comandos de despliegue hace de este repositorio un ejemplo didáctico autocontenido para cursos de robótica.
- **Evaluación de robustez frente a cambios de iluminación o de posición de cámara:** al no haber resultados de evaluación publicados, el modelo es útil precisamente para medir experimentalmente su degradación en condiciones no vistas.
- **Integración en un lazo de control supervisado:** con `--duration` limitado y un operador vigilando, puede usarse para recoger datos de éxito y fracaso que alimenten un reentrenamiento posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política, por lo que no existen tasas de éxito, métricas de error de posición ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- **VRAM estimada para inferencia:** con 51,67 millones de parámetros en safetensors, los pesos ocupan aproximadamente 0,2 GB en FP32; en FP16 rondarían los 0,1 GB. El consumo real lo domina el codificador visual que procesa dos imágenes de 360x640, no el número de parámetros.
- **GPU recomendadas:** cualquier GPU con al menos 4-6 GB de VRAM es suficiente para inferencia en tiempo real; una RTX 3060, RTX 4060 o RTX 4090 cubren holgadamente el caso. Para entrenamiento (100.000 pasos, batch 24) se recomienda una GPU de 16 GB o superior, como RTX 4090, A100 o H100.
- **Cabe en GPU de consumo:** sí, en cualquier GPU consumer moderna con 4 GB o más de VRAM para inferencia; el cuello de botella es la captura y el preprocesado de las dos cámaras a 30 FPS.
- **Opciones de despliegue:** `lerobot-rollout` con `--strategy.type=base` para ejecución directa en el robot; `lerobot-train` con `--policy.device=cuda` para reentrenamiento. No se documentan rutas de despliegue con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- **Latencia y throughput:** no disponibles. El modelo está pensado para operar a 30 FPS, la misma frecuencia del dataset de entrenamiento, pero no se publican mediciones de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Tarea | Licencia | Evaluacion publicada |
|---|---|---|---|---|---|
| Este modelo (ACT, `zinuzoid`) | 51,67 M | 2 camaras 360x640 + estado (8,) | Mover tarjeta a marca verde | Apache 2.0 | No |
| Checkpoint base `lerobot-card-to-green-marker_20261124-trim-360p` | no disponible | no disponible | Misma familia de tarea | Apache 2.0 | No |
| Otras politicas ACT de LeRobot en el Hub | variable | variable | Tareas de manipulacion diversas | variable | En general no |
| Diffusion Policy (referencia metodologica) | no disponible | variable | Manipulacion visomotora | no disponible | Si, en paper original |

La comparación cuantitativa con alternativas no está disponible: no hay métricas publicadas para este checkpoint ni para el base, y las políticas ACT del Hub entrenadas por otros usuarios no son directamente comparables al variar robot, cámaras y dataset.

## Limitaciones y advertencias

- **Sin evaluación publicada:** no existe ninguna tasa de éxito medida en robot real, por lo que no se puede afirmar que la política funcione de forma fiable fuera del conjunto de entrenamiento.
- **Especialización extrema:** solo se ha entrenado para la tarea "Move a card to green marker" con un robot `so101_suction_follower` y dos cámaras concretas; cualquier cambio de robot, de montaje de cámara o de objeto invalida su uso directo.
- **Sesgo de datos limitado:** 100 episodios y 30.875 fotogramas implican poca diversidad de posiciones, iluminación y distractores; es esperable un sobreajuste al entorno de grabación.
- **Riesgo de fallo silencioso:** al ser una política de imitación sin mecanismo de verificación, puede ejecutar acciones incorrectas sin señal de error, lo que exige supervisión humana en cualquier despliegue real.
- **Dependencia de la calibración:** el rendimiento depende de que el robot y las cámaras estén calibrados exactamente como en la grabación; pequeñas desviaciones degradan la ejecución.
- **Licencia Apache 2.0:** permite uso comercial y modificación con atribución, pero el autor no ofrece garantías ni soporte; el uso en producción es responsabilidad del integrador.
- **Idiomas y contexto:** no aplica, pero conviene subrayar que no es un modelo de lenguaje y no debe evaluarse con métricas de NLP.
- **Repositorio con cero descargas y cero likes:** no hay evidencia de uso por terceros ni de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zinuzoid/lerobot-card-to-green-marker_20261125-100-360p-trim
- Modelo base: https://huggingface.co/zinuzoid/lerobot-card-to-green-marker_20261124-trim-360p
- Dataset de entrenamiento: https://huggingface.co/datasets/zinuzoid/lerobot-card-to-green-marker_20261125-100-360p-trim
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=zinuzoid/lerobot-card-to-green-marker_20261125-100-360p-trim
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
