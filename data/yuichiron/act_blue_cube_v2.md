# Yuichiron/act_blue_cube_v2

## Resumen

El modelo `act_blue_cube_v2`, desarrollado por Yuichiron, es una política de robótica basada en el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice secuencias de acciones completas en lugar de pasos individuales. El modelo está entrenado para realizar una tarea concreta: recoger un cubo azul, elevarlo verticalmente y colocarlo en un cuenco naranja, utilizando un robot tipo `so_follower` con una cámara frontal.

El modelo se distribuye a través de la librería LeRobot de Hugging Face y está pensado para ser desplegado en robots reales mediante el flujo de trabajo `lerobot-rollout`. Con un tamaño de 51,7 millones de parámetros y un peso de 0,2 GB, es una política compacta y ligera, adecuada para entornos de investigación y prototipado. Su relevancia reside en que ejemplifica el uso de ACT en una tarea de manipulación real con datos de teleoperación, lo que permite evaluar la viabilidad del método en condiciones controladas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de robótica, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT (Action Chunking with Transformers), presentada en el artículo arXiv:2304.13705. ACT es un método de aprendizaje por imitación que predice bloques de acciones (action chunks) en lugar de acciones individuales, lo que permite una mayor consistencia temporal y robustez frente a errores acumulados. La política procesa observaciones del estado del robot (6 dimensiones) y una imagen de cámara frontal (3×480×640) para generar acciones de 6 dimensiones.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.1) sobre un dataset de teleoperación compuesto por 30 episodios y 11.239 frames a 15 FPS. Se ejecutaron 20.000 pasos de entrenamiento con un batch size de 8, optimizador AdamW, learning rate de 1e-05 y semilla 1000. No se han documentado técnicas adicionales como RLHF, DPO o decodificación especulativa, ya que el modelo se limita al aprendizaje por imitación puro.

## Capacidades

- Ejecución de tareas robóticas de manipulación: recoger, levantar y colocar objetos en posiciones específicas.
- Control basado en observaciones visuales (cámara frontal) y estado del robot (posición de articulaciones).
- Generación de acciones de 6 grados de libertad para el robot `so_follower`.
- Manejo de trayectorias de acción en bloques, lo que permite movimientos fluidos y coordinados.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- Sin capacidades de lenguaje natural, tool calling ni razonamiento multilingüe, al ser una política puramente motora.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos de laboratorio: el modelo puede integrarse en un robot `so_follower` para mover objetos de un punto a otro, como en la tarea de cubo a cuenco, siendo útil para pruebas de automatización industrial a pequeña escala.
- Prototipado de habilidades robóticas con aprendizaje por imitación: los investigadores pueden usar el modelo como referencia para entrenar sus propias políticas ACT con LeRobot, reutilizando la configuración de entrenamiento documentada.
- Evaluación de la arquitectura ACT en hardware real: la política permite reproducir la tarea de manipulación en un robot físico y medir tasas de éxito, facilitando la comparación con otros métodos de aprendizaje por imitación.
- Base para transferencia de tareas: dado que el modelo está entrenado para una tarea concreta, puede servir como punto de partida para fine-tuning en tareas similares (por ejemplo, mover otros objetos o cambiar la posición del contenedor).
- Demostraciones y educación en robótica: su tamaño reducido y la documentación completa de LeRobot lo hacen adecuado para cursos o talleres donde se enseñe a entrenar y desplegar políticas robóticas.
- Automatización de procesos repetitivos en entornos controlados: en líneas de montaje o ensamblaje donde la tarea está bien definida y el entorno es estable, el modelo puede ejecutar la manipulación de forma autónoma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real, por lo que no hay datos de éxito, tasa de éxito ni comparación con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 51,7 millones de parámetros, se estima un consumo de memoria inferior a 1 GB en formato de precisión completa (FP32). Con cuantización a FP16 o int8, el consumo sería aún menor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, por ejemplo NVIDIA GTX 1650, RTX 3050 o superiores. En la práctica, una GPU de consumo como la RTX 4060 ofrece margen holgado.
- Si cabe en GPU de consumo: sí, cabe sin problemas en cualquier GPU comercial actual.
- Opciones de despliegue: el modelo se usa con LeRobot, que soporta inferencia en local con `lerobot-rollout`. No se mencionan integraciones con vLLM, llama.cpp u otros motores de inferencia, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles, dependen del hardware del robot y de la cámara. El modelo está diseñado para ejecutarse en tiempo real con un robot, por lo que se espera una latencia de milisegundos en hardware adecuado.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables de la misma categoría en la información proporcionada. El modelo es específico para una tarea robótica concreta y no hay alternativas públicas directas con las que compararlo.

## Limitaciones y advertencias

- La política está entrenada exclusivamente para una tarea concreta (cubo azul a bolsa naranja) y no generaliza a otras tareas sin reentrenamiento.
- El modelo no tiene capacidad de razonamiento ni de comprensión del lenguaje; es una política motora pura que depende de la entrada visual y de estado.
- Depende de la configuración del robot `so_follower` y de la cámara frontal; cambios en la iluminación, posición de la cámara o el robot pueden degradar el rendimiento.
- No hay resultados de evaluación publicados, por lo que la tasa de éxito real en condiciones no controladas es desconocida.
- La licencia Apache-2.0 permite uso comercial, pero el modelo está ligado a un dataset específico que podría tener restricciones adicionales (no se detallan).
- La ventana de contexto y el comportamiento temporal son limitados: el modelo predice bloques de acciones de longitud fija, lo que puede no adaptarse a tareas de larga duración o con cambios dinámicos.
- Al ser un modelo de robótica, no es adecuado para tareas de procesamiento de lenguaje natural, generación de texto ni código.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Yuichiron/act_blue_cube_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/Yuichiron/so101_blue_cube_to_bowl_v2_20260823_200723
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación general de LeRobot: https://huggingface.co/docs/lerobot/index
- Herramienta de visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Yuichiron/so101_blue_cube_to_bowl_v2_20260823_200723
