# try777/dice-snatcher-smolvla-5colors-v1

## Resumen

try777/dice-snatcher-smolvla-5colors-v1 es un modelo de política robótica basado en SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto y eficiente. Ha sido desarrollado por el usuario try777 mediante fine-tuning del modelo base lerobot/smolvla_base con el framework LeRobot. El modelo está entrenado para controlar un robot de tipo so_follower y realizar la tarea de recoger dados de cinco colores distintos (rojo, verde, azul, naranja y blanco) y colocarlos en la bandeja del robot. Con aproximadamente 450 millones de parámetros y un tamaño de repositorio de 0,9 GB, SmolVLA está diseñado para ejecutarse en hardware de consumo, lo que lo hace relevante para aplicaciones de robótica accesibles. El modelo consume observaciones de estado (6 dimensiones) e imágenes de tres cámaras RGB a 256x256 píxeles, y produce acciones de 6 dimensiones. No se dispone de información sobre la longitud de contexto ni sobre los idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basado en SmolVLA |
| Parámetros totales | 450.046.176 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |
| Pipeline | Robotics |
| Librería | LeRobot |
| Modelo base | lerobot/smolvla_base |
| Tamaño del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de SmolVLA, una arquitectura de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y una cabeza de acción. Está diseñada para ser compacta y eficiente, permitiendo su ejecución en hardware de consumo. En este caso, el modelo se ha entrenado sobre el dataset try777/dice-cp-centre-robot-5colors-baseline-01_20260903-clean-v1, compuesto por 46 episodios y 33.868 fotogramas a 30 FPS. Las tareas consisten en recoger dados de cinco colores (rojo, verde, azul, naranja y blanco) y colocarlos en la bandeja del robot.

El entrenamiento se realizó durante 20.000 pasos con un tamaño de lote de 64, optimizador AdamW, tasa de aprendizaje de 0,0001, semilla 1000 y la versión 0.6.0 de LeRobot. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. La entrada del modelo incluye el estado del robot (6 valores) e imágenes de tres cámaras RGB de 256x256 píxeles, mientras que la salida es una acción de 6 dimensiones.

## Capacidades

- Ejecución de políticas de manipulación robótica: recoger dados de colores específicos y colocarlos en la bandeja del robot.
- Entrada multimodal: estado del robot (6 valores) e imágenes de tres cámaras RGB de 256x256 píxeles.
- Salida de acciones de 6 dimensiones para controlar el robot.
- Fine-tuning sobre el modelo base preentrenado lerobot/smolvla_base.
- Integración con LeRobot para entrenamiento, despliegue y evaluación mediante comandos CLI.
- Diseñado para funcionar en hardware de consumo, reduciendo el coste computacional.

No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso, generación de texto ni soporte multilingüe.

## Casos de uso

- Automatización de recogida y colocación en líneas de ensamblaje: el modelo puede controlar un robot so_follower para seleccionar piezas de colores y depositarlas en bandejas, reduciendo la intervención manual.
- Clasificación de objetos por color en almacenes: gracias a su entrada visual de tres cámaras, puede distinguir objetos de diferentes colores y organizarlos en contenedores.
- Tareas de laboratorio: manipulación de viales o muestras codificadas por color, donde el robot debe recoger y colocar elementos con precisión.
- Investigación en imitación learning: el modelo sirve como ejemplo de política entrenada con LeRobot, útil para comparar enfoques o como punto de partida para nuevos fine-tunings.
- Demostraciones educativas de robótica: al ser compacto y ejecutable en hardware de consumo, permite montar demostraciones de manipulación en entornos académicos o ferias.
- Recogida de dados en juegos de mesa automatizados: una aplicación recreativa donde el robot identifica y recoge dados de colores sobre una mesa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no se han proporcionado resultados de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,9 GB, pero no se especifica el requisito real de VRAM.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: SmolVLA está diseñado para hardware de consumo, pero no hay datos concretos para este modelo.
- Opciones de despliegue: LeRobot, mediante los comandos `lerobot-rollout` y `lerobot-train`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se ha proporcionado información sobre modelos comparables. El único modelo relacionado es el base lerobot/smolvla_base, del cual este modelo es un fine-tuning. No se dispone de datos de parámetros, contexto o rendimiento del modelo base en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado para una tarea muy específica (recoger dados de cinco colores con un robot so_follower) y puede no generalizar a otros objetos, colores, entornos o robots.
- No se han publicado evaluaciones de éxito, por lo que el rendimiento real en el robot es desconocido.
- La model card lista dos cámaras en los detalles del modelo, pero la tabla de entradas incluye tres cámaras (camera1, camera2, camera3); esta discrepancia puede causar errores al configurar el despliegue.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de contexto e idioma.
- La licencia Apache-2.0 permite uso comercial, pero requiere mantener el aviso de licencia y citar el método y LeRobot.
- Para desplegar el modelo es necesario disponer del robot y las cámaras específicas, así como configurar los parámetros de LeRobot.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/try777/dice-snatcher-smolvla-5colors-v1
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/try777/dice-cp-centre-robot-5colors-baseline-01_20260903-clean-v1
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Perfil del autor: https://huggingface.co/try777
