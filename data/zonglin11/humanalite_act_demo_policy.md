# zonglin11/humanalite_act_demo_policy

## Resumen

El modelo `zonglin11/humanalite_act_demo_policy` es una política de robótica basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario zonglin11 y entrenada con la librería LeRobot de Hugging Face. ACT es una técnica de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que permite un control más suave y robusto en tareas de manipulación robótica. Este modelo en concreto se presenta como una política de demostración, entrenada sobre el dataset `zonglin11/humanalite_act_demo`, que contiene 753 episodios de teleoperación.

El modelo tiene aproximadamente 51,7 millones de parámetros, un tamaño relativamente pequeño que lo hace adecuado para experimentación y despliegue en hardware modesto. Su relevancia radica en que ejemplifica el flujo de trabajo de LeRobot para entrenar y publicar políticas de robótica, y sirve como punto de partida para investigadores y desarrolladores que quieran explorar el aprendizaje por imitación en robots reales o simulados. Al estar bajo licencia Apache 2.0, puede utilizarse y modificarse libremente, incluso con fines comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers, ACT) |
| Parametros totales | 51.699.349 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (modelo de robótica, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin especificar precisión) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que utiliza una arquitectura transformer para predecir un bloque de acciones futuras (action chunk) a partir de observaciones actuales y pasadas. A diferencia de los métodos que predicen una sola acción, ACT genera una secuencia de acciones que luego se ejecuta de forma abierta, lo que reduce la acumulación de errores y mejora la estabilidad del control. El modelo fue entrenado con la librería LeRobot, que proporciona herramientas para recopilar demostraciones, entrenar políticas y evaluarlas en robots reales o simulados.

El entrenamiento se realizó sobre el dataset `zonglin11/humanalite_act_demo`, que contiene 753 episodios de teleoperación (según el split de entrenamiento). No se dispone de información sobre el número total de tokens, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO. Al ser un modelo de demostración, es probable que se haya entrenado con un número limitado de épocas y con configuraciones por defecto de LeRobot. La innovación principal es la propia arquitectura ACT, que ha demostrado altas tasas de éxito en tareas de manipulación robótica, como se describe en el paper original (arxiv:2304.13705).

## Capacidades

- Control de robots manipuladores: el modelo predice secuencias de acciones articulares o de efector final a partir de observaciones (imágenes, estados del robot).
- Aprendizaje por imitación: es capaz de replicar comportamientos demostrados por teleoperación, como recoger y colocar objetos, empujar, o tareas de precisión.
- Ejecución en tiempo real: gracias al action chunking, puede ejecutar movimientos suaves y coordinados sin necesidad de replanificar en cada paso.
- Integración con LeRobot: se puede cargar y evaluar directamente con las herramientas de LeRobot, tanto en simulación como en hardware real.
- No incluye capacidades de lenguaje natural, tool calling, visión general ni razonamiento simbólico; su ámbito es exclusivamente el control motor.

## Casos de uso

- Investigación en aprendizaje por imitación: el modelo sirve como referencia para estudiar el comportamiento de ACT en tareas de manipulación, comparar variantes de entrenamiento o analizar la generalización a partir de pocas demostraciones.
- Prototipado de políticas robóticas: al ser pequeño y fácil de entrenar, permite validar rápidamente pipelines de recolección de datos y entrenamiento antes de escalar a modelos más grandes o datasets más extensos.
- Evaluación de robots en simulación: se puede cargar en entornos simulados (por ejemplo, MuJoCo o Isaac Gym) para probar su rendimiento sin necesidad de hardware físico.
- Transferencia a robots reales: con el adaptador adecuado (como el robot SO-100 mencionado en la documentación), la política puede desplegarse en un brazo robótico real para tareas de pick-and-place o manipulación básica.
- Benchmarking de métodos de control: dado que ACT es un método establecido, este modelo puede usarse como baseline en experimentos que comparen nuevas técnicas de aprendizaje por refuerzo o imitación.
- Educación y divulgación: por su simplicidad y licencia permisiva, es adecuado para cursos de robótica o talleres donde se enseñe el flujo completo de entrenamiento de políticas con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de éxito en tareas específicas, ni comparaciones con otros modelos en el Hub. La única referencia es el paper de ACT, que reporta tasas de éxito altas en tareas como insertar objetos o mover piezas, pero esos resultados corresponden a entrenamientos específicos y no a este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada: con 51,7 millones de parámetros, el modelo ocupa aproximadamente 207 MB en fp32 y 103 MB en fp16. Cabe en cualquier GPU con al menos 1 GB de VRAM, incluyendo GPUs integradas o tarjetas de gama baja.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA (por ejemplo, GTX 1060, RTX 2060, RTX 4090) es suficiente. Incluso una CPU podría ejecutar inferencia, aunque con mayor latencia.
- Compatibilidad con consumer GPU: sí, cualquier GPU moderna puede ejecutar este modelo sin problemas.
- Opciones de despliegue: al ser un modelo de LeRobot, se puede ejecutar con las herramientas de inferencia de LeRobot, o exportar a formato ONNX para usar con TensorRT u otros runtimes. También es posible cargarlo con PyTorch directamente.
- Latencia y throughput: no se dispone de mediciones oficiales, pero dada la pequeña cantidad de parámetros, la inferencia debería ser del orden de milisegundos en GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos en el Hub. Existen otras políticas de ACT entrenadas con LeRobot, pero no se han identificado nombres concretos ni métricas para comparar. El modelo es notablemente pequeño en comparación con modelos de lenguaje o visión, pero en el ámbito de la robótica su tamaño es típico para políticas de manipulación. Sin datos de rendimiento, no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al ser un modelo de robótica, su comportamiento depende enteramente de los datos de demostración. Si las demostraciones tienen movimientos limitados o sesgados, el modelo los replicará.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero puede generar acciones incorrectas si la observación está fuera de la distribución de entrenamiento.
- Limitaciones de contexto: al ser un modelo de control, no maneja contexto textual ni conversacional. Su ventana de contexto se refiere a la historia de observaciones, pero no se especifica su longitud.
- Limitaciones de idioma: no aplica, no es un modelo de lenguaje.
- Restricciones de licencia: el modelo está bajo Apache 2.0, lo que permite uso comercial y modificación. Sin embargo, el dataset `zonglin11/humanalite_act_demo` puede tener su propia licencia; se debe verificar antes de redistribuir datos o modelos derivados.
- Advertencia para producción: este es un modelo de demostración, entrenado con un número limitado de episodios (753). No se recomienda su uso en aplicaciones de producción sin una validación exhaustiva en el entorno objetivo. La seguridad en robótica es crítica; cualquier despliegue en robots reales debe incluir salvaguardas y supervisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zonglin11/humanalite_act_demo_policy
- Dataset utilizado: https://huggingface.co/datasets/zonglin11/humanalite_act_demo
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot sobre ACT: https://huggingface.co/docs/lerobot/act
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
