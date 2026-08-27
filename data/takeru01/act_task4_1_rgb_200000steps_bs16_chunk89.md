# takeru01/act_task4_1_rgb_200000steps_bs16_chunk89

## Resumen

El modelo `takeru01/act_task4_1_rgb_200000steps_bs16_chunk89` es una política robótica de aprendizaje por imitación basada en la arquitectura ACT (Action Chunking with Transformers), desarrollada por takeru01 y entrenada con el framework LeRobot de Hugging Face. Está diseñada para una tarea concreta de manipulación dual-brazo con dos brazos robóticos UR5e, donde el robot debe ejecutar una demostración teleoperada denominada "Dual-arm manipulation demonstration task4_1".

El modelo resuelve el problema de control robótico mediante predicción de secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y el éxito en tareas de manipulación complejas. Es relevante porque demuestra cómo entrenar y publicar políticas robóticas con LeRobot, y porque su tamaño compacto (51,7 millones de parámetros) permite desplegarlo en hardware asequible. La política consume observaciones de cuatro cámaras RGB y datos de estado de los brazos y pinzas, y produce acciones de 14 dimensiones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.673.742 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (política robótica con observaciones de 4 cámaras) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de robótica) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un Transformer con un VAE (variational autoencoder) para predecir bloques de acciones futuras (action chunks) a partir de observaciones actuales. En este caso, el modelo procesa cuatro imágenes RGB de resolución 240x424 (frontal, superior, muñeca izquierda y muñeca derecha) junto con el estado del robot: posición de articulaciones (12 dimensiones), velocidad de articulaciones (12), posición de pinzas (2) y un estado global (14). La salida es un vector de acción de 14 dimensiones que se aplica en un horizonte temporal definido por el chunk.

El entrenamiento se realizó con el dataset `takeru01/task4_1_rgb`, compuesto por 93 episodios y 160.755 fotogramas a 30 FPS, capturados con un robot dual_ur5e_rosbag. Se ejecutaron 200.000 pasos de entrenamiento con un batch de 16, optimizador AdamW y una tasa de aprendizaje de 1e-05, usando semilla 1000 y la versión 0.6.0 de LeRobot. No se han especificado técnicas de RLHF o DPO; el método es puramente de aprendizaje por imitación supervisado.

## Capacidades

- Control robótico dual-brazo: ejecuta tareas de manipulación con dos brazos UR5e, coordinando movimientos de articulaciones y pinzas.
- Aprendizaje por imitación: reproduce secuencias de acciones aprendidas de demostraciones teleoperadas, con chunking de acciones para mejorar la estabilidad.
- Fusión multimodal: combina información visual de cuatro cámaras RGB con datos de estado de los actuadores (posición, velocidad, pinzas).
- Generalización a la tarea específica: está optimizada para la tarea "Dual-arm manipulation demonstration task4_1", aunque puede adaptarse a tareas similares con reentrenamiento.
- Compatibilidad con LeRobot: se integra con el ecosistema de LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- Sin capacidades de texto o lenguaje: no es un modelo de lenguaje, ni soporta tool calling, agentes ni razonamiento simbólico.

## Casos de uso

- Control de robots de manipulación industrial: el modelo puede desplegarse en líneas de montaje para ejecutar tareas de ensamblaje o manipulación que requieren coordinación de dos brazos, reduciendo la intervención humana.
- Teleoperación asistida: permite que un operador demuestre una tarea manualmente y que el robot la replique de forma autónoma, útil en entornos peligrosos o de precisión.
- Investigación en robótica: sirve como base para estudiar técnicas de imitación, transferencia de tareas y generalización en entornos de doble brazo.
- Automatización de laboratorios: puede controlar robots que manipulan muestras o instrumentos, siguiendo demostraciones de un científico.
- Evaluación de políticas de control: permite comparar diferentes estrategias de aprendizaje por imitación en la misma tarea, facilitando el desarrollo de nuevos métodos.
- Formación de operadores: el modelo puede usarse en simuladores para enseñar a operadores humanos cómo realizar tareas de manipulación, o para validar la viabilidad de una tarea antes de implementarla en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no se han proporcionado resultados de evaluación del robot real (sección "Evaluation" vacía). No hay datos de tasa de éxito, precisión ni comparación con otros modelos en la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-4 GB (modelo de 51,7 millones de parámetros en FP32), aunque el procesamiento de 4 imágenes de 240x424 aumenta el consumo de memoria temporal.
- GPU recomendadas: una GPU con al menos 8 GB de VRAM es suficiente para inferencia en tiempo real, como una RTX 3070/4070 o superior. Para entrenamiento se recomienda una GPU con 16-24 GB (RTX 3090/4090, A100).
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media y alta de NVIDIA (serie RTX 30/40) y en hardware con soporte CUDA.
- Opciones de despliegue: LeRobot ofrece scripts de rollout (`lerobot-rollout`) para ejecutar la política en un robot real con cámaras OpenCV. También puede integrarse con vLLM para inferencia, aunque el pipeline principal es con LeRobot.
- Latencia y throughput: no se han publicado datos, pero al ser un modelo de 51M parámetros con 4 imágenes, se espera una inferencia en el orden de milisegundos a decenas de milisegundos en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `takeru01/act_task4_1_rgb_200000steps_bs16_chunk89` | 51.7M | No aplica (4 cámaras) | ACT | Apache-2.0 | Hugging Face |
| `takeru01/task1_1_act_rgb_100k` | No disponible | No aplica | ACT | Apache-2.0 | Hugging Face |
| ACT original (tonyzhaozh/act) | No disponible | No aplica | ACT | MIT | GitHub |

No se dispone de datos de rendimiento comparativos para estos modelos en la tarea concreta. La arquitectura ACT es común en todos, pero el número de parámetros y los datos de entrenamiento varían. El modelo `task1_1_act_rgb_100k` de takeru01 parece ser una variante con 100.000 pasos de entrenamiento, mientras que el actual se entrenó con 200.000, lo que podría implicar un mejor ajuste a la tarea.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación en robot real: la model card indica que no hay datos de éxito ni pruebas en el robot físico, por lo que su rendimiento en producción es incierto.
- Sesgo de la demostración: el modelo depende de la calidad y cobertura de las 93 demostraciones del dataset; si la tarea varía (posición de objetos, iluminación), puede fallar.
- Riesgo de alucinación de acciones: al ser un modelo de imitación, puede generar acciones no seguras si se enfrenta a observaciones fuera de la distribución de entrenamiento.
- Limitaciones de idioma y contexto: no es un modelo de texto, por lo que no aplica para tareas de NLP; su contexto es exclusivamente visual y de estado.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero el modelo es específico para una tarea concreta y puede requerir reentrenamiento para otros escenarios.
- Dependencia de hardware: requiere cámaras y robots compatibles con LeRobot (dual_UR5e_rosbag), lo que limita su portabilidad a otros sistemas.
- Sobreajuste potencial: con 93 episodios y 200.000 pasos, puede existir sobreajuste a la tarea, reduciendo la generalización.

## Enlaces

- [Hugging Face - Modelo](https://huggingface.co/takeru01/act_task4_1_rgb_200000steps_bs16_chunk89)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [Repositorio LeRobot](https://github.com/huggingface/lerobot)
- [Dataset de entrenamiento](https://huggingface.co/datasets/takeru01/task4_1_rgb)
- [Modelo similar de takeru01 (task1_1_act_rgb_100k)](https://huggingface.co/takeru01/task1_1_act_rgb_100k)
- [Repositorio original de ACT en GitHub](https://github.com/tonyzhaozh/act)
