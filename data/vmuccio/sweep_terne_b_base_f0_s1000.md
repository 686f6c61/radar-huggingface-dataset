# VMuccio/sweep_terne_B_base_f0_s1000

## Resumen

El modelo VMuccio/sweep_terne_B_base_f0_s1000 es una política de robótica de tipo vision-language-action (VLA) obtenida mediante ajuste fino del modelo base lerobot/smolvla_base, perteneciente a la familia SmolVLA. Lo publica el usuario VMuccio en HuggingFace usando la librería LeRobot (versión 0.6.2) y consta de 450.046.176 parámetros (aproximadamente 450 millones), con un repositorio de 0,9 GB y pesos en formato safetensors.

SmolVLA es un modelo compacto y eficiente que combina un backbone de visión-lenguaje con un experto de acción, diseñado para ejecutarse en hardware de consumo. En este caso concreto, el ajuste fino especializa la política en una tarea de manipulación muy acotada: coger un cubo de color (rojo, amarillo o azul) y depositarlo en una cesta. El modelo consume el estado del robot (vector de 6 componentes) y tres cámaras (256×256×3 cada una) y produce un vector de acción de 6 componentes.

Su relevancia es doble: por un lado ilustra el flujo completo de ajuste fino de políticas robóticas con LeRobot; por otro, demuestra que es posible entrenar y desplegar manipulación con un modelo de menos de 500 millones de parámetros, apto para GPU de gama de consumo. La licencia es Apache 2.0 y el pipeline declarado es robotics.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); backbone de visión-lenguaje tipo SmolVLM con experto de acción (según el paper referenciado) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo conversacional; recibe instrucciones de tarea en inglés durante el entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | LeRobot 0.6.2 |
| Modelo base | lerobot/smolvla_base (ajuste fino) |
| Pipeline | robotics |
| Tipo de robot | so_follower |
| Camaras | gripper, front, top (claves de observación camera1, camera2, camera3) |
| Entradas | observation.state (6,), observation.images.camera1/2/3 (3, 256, 256) |
| Salidas | action (6,) |
| Tamano del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura SmolVLA descrita en el paper arXiv:2506.01844. Se trata de un VLA compacto que combina un modelo de visión-lenguaje de tamano reducido (backbone SmolVLM) con un experto de acción encargado de generar las acciones de control. La política consume simultáneamente el estado proprioceptivo del robot y varias vistas de cámara, y produce un vector de acción de 6 grados de libertad, típico de un brazo robótico de tipo so_follower (SO-100/so_follower de LeRobot).

El ajuste fino se realizó sobre el dataset VMuccio/rgb_cubes_terne_p1, compuesto por 81 episodios y 52.930 fotogramas grabados a 30 FPS. Las tareas del dataset son tres instrucciones de lenguaje: "Pick the red cube and place it into the basket", "Pick the yellow cube and place it into the basket" y "Pick the blue cube and place it into the basket". La configuración de entrenamiento documentada es: 12.000 pasos, batch size 8, optimizador AdamW, tasa de aprendizaje 5e-05 y semilla 1000. No se documentan detalles sobre composición exacta de datos, uso de RLHF/DPO ni innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá de lo que aporta la receta base de SmolVLA.

## Capacidades

- Generación de acciones de manipulación robótica en un espacio de 6 grados de libertad, a partir de estado y observaciones visuales.
- Percepción visual multi-cámara: procesa tres vistas simultáneas (gripper, front y top) a 256×256 píxeles.
- Ejecución de tres tareas de pick-and-place específicas: coger el cubo rojo, amarillo o azul y depositarlo en la cesta.
- Control condicionado por instrucción de tarea en lenguaje natural (inglés) durante el entrenamiento.
- Integración con el ecosistema LeRobot para rollout y reentrenamiento.
- No dispone de tool calling ni function calling.
- No está diseñado para razonamiento multi-paso abstracto ni para diálogo conversacional.
- No se documentan capacidades multilingües, de audio ni de visión general más allá de la percepción necesaria para la tarea.

## Casos de uso

- Manipulación pick-and-place en laboratorio: el modelo ejecuta la secuencia de coger un cubo de color concreto y depositarlo en una cesta, útil como banco de pruebas de imitación robótica con pocos datos.
- Investigación en imitación (imitation learning): sirve como referencia reproducible de un ajuste fino de SmolVLA con una configuración documentada (pasos, batch, LR, semilla), lo que facilita comparaciones y experimentos de ablación.
- Base para transferencia a nuevas tareas: partiendo de este checkpoint o de lerobot/smolvla_base, se puede reajustar con otros datasets de LeRobot cambiando objetos, colores u objetivos.
- Evaluación de despliegue en hardware de consumo: al tener 450 millones de parámetros, permite probar inferencia en GPU de gama media o incluso CPU, midiendo latencias reales en un brazo so_follower.
- Education y prototipado: sirve para enseñar el pipeline completo de grabación de datos, entrenamiento y rollout con LeRobot en entornos docentes.
- Automatización de tareas de clasificación por color: el modelo distingue y manipula cubos rojo, amarillo y azul, lo que puede servir para prototipos de selección y ordenación de objetos por atributo visual.
- Validación de sistemas de control condicionados por lenguaje: permite estudiar cómo una instrucción textual ("Pick the blue cube...") condiciona la política generada en un VLA compacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks ni evaluaciones en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No se dispone de tasas de éxito, MMLU, HumanEval ni métricas equivalentes para este modelo.

## Requisitos de hardware

- Pesos: 450 millones de parámetros. En precisión FP32 ocuparían aproximadamente 1,8 GB; en BF16/FP16, alrededor de 0,9 GB (coincide con el tamaño del repositorio).
- VRAM estimada para inferencia: en BF16, del orden de 1-2 GB solo para pesos, más el coste de los tensores de imagen de las tres cámaras; margen holgado en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM; documentación de SmolVLA apunta a despliegue en hardware de consumo (gama RTX 30/40, e incluso CPU).
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas tipo RTX 3060, 4060, 4090 y similares, dado el reducido número de parámetros.
- Opciones de despliegue: LeRobot mediante el comando `lerobot-rollout` (con `--policy.path=VMuccio/sweep_terne_B_base_f0_s1000`). No es un modelo de chat, por lo que no aplican vLLM, TGI, llama.cpp u Ollama en su flujo estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Modelo base / origen | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VMuccio/sweep_terne_B_base_f0_s1000 | 450 M | VLA (politica robotica) | lerobot/smolvla_base | Apache 2.0 | HuggingFace (0 descargas, 0 likes) |
| lerobot/smolvla_base | ~450 M (familia SmolVLA) | VLA (politica robotica) | SmolVLM (paper 2506.01844) | Apache 2.0 | HuggingFace |
| OpenVLA | ~7 B | VLA | Prismatic VLM + Llama | Licencia abierta (consultar) | HuggingFace |
| NVIDIA GR00T N1 | ~2 B (segun variante) | VLA | Modelo fundacional robotico | Licencia NVIDIA | HuggingFace |

Las cifras de modelos comparables se ofrecen a modo orientativo de categoria; no se dispone de datos de rendimiento comparables para este checkpoint concreto. Para contextos, licencias exactas y disponibilidad de OpenVLA y GR00T N1, consúltese la documentación oficial de cada proyecto, ya que no se han verificado en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo se ha entrenado para tres tareas concretas (coger cubo rojo, amarillo o azul y meterlo en la cesta); no generaliza a otros objetos, colores u objetivos sin reentrenamiento.
- Dataset reducido: 81 episodios y 52.930 fotogramas procedentes de una única configuración de robot y cámaras, lo que aumenta el riesgo de sobreajuste al entorno de captura.
- Sensibilidad al entorno: cambios en iluminación, posición de cámaras, fondo o tipo de robot pueden degradar el rendimiento.
- Sin evaluación publicada: no hay tasas de éxito ni métricas objetivas que respalden su fiabilidad en producción.
- No es un modelo de lenguaje conversacional: no admite diálogo, tool calling ni razonamiento multi-paso genérico.
- Idiomas y contexto: no se documentan idiomas soportados ni longitud de contexto; las instrucciones de tarea se registraron en inglés.
- Riesgo de alucinación: en un VLA se traduce en acciones incoherentes o inseguras si las observaciones se salen de la distribución de entrenamiento.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero deben respetarse igualmente las condiciones del modelo base y de los datos empleados.
- Advertencia de producción: al tratarse de un modelo con 0 descargas y sin resultados de evaluación, no debe desplegarse en entornos críticos sin una validación exhaustiva y medidas de seguridad física en el robot.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VMuccio/sweep_terne_B_base_f0_s1000
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/VMuccio/rgb_cubes_terne_p1
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=VMuccio/rgb_cubes_terne_p1
