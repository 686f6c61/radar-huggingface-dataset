# Yac1n3/act_so101_pick_cube

## Resumen

El modelo `Yac1n3/act_so101_pick_cube` es una política de control robótico basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación desarrollado por el equipo de investigación de Google (paper arXiv:2304.13705). El modelo ha sido entrenado y publicado mediante el framework LeRobot de Hugging Face, y está diseñado para controlar un brazo robótico SO-101 (tipo `so_follower`) en la tarea de recoger un cubo y colocarlo en un plato. Se trata de un modelo de 51,7 millones de parámetros que procesa imágenes de una cámara frontal y el estado del robot para generar acciones de 6 dimensiones.

La relevancia de este modelo radica en que es un ejemplo práctico de aplicación de técnicas de imitación learning a la robótica real, con un pipeline completo de entrenamiento y despliegue documentado a través de LeRobot. Aunque es un modelo pequeño y especializado en una tarea concreta, demuestra el flujo de trabajo: teleoperación, registro de episodios, entrenamiento de una política neuronal y ejecución en hardware real. No se trata de un modelo de lenguaje o visión general, sino de un controlador específico para manipulación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de control robótico) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no procesa lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de acciones individuales. La arquitectura se basa en un transformer encoder-decoder que recibe como entrada las observaciones del robot: el estado del sistema (6 valores, probablemente posiciones articulares o coordenadas cartesianas) y una imagen RGB de 720x1280 píxeles de la cámara frontal. La salida es un chunk de acciones de 6 dimensiones que el robot ejecuta de forma autónoma durante un corto horizonte temporal, lo que reduce la acumulación de errores frente a políticas que predicen paso a paso.

El entrenamiento se realizó con el dataset `Yac1n3/so101_pick_cube_20260902_010918`, que contiene 50 episodios teleoperados (24.259 frames a 30 FPS) de la tarea "recoger el cubo y colocarlo en el plato". La configuración de entrenamiento fue: 100.000 pasos, batch size de 32, optimizador AdamW con learning rate de 1e-5, semilla 1000 y la versión 0.6.1 de LeRobot. No se menciona el uso de técnicas adicionales como RLHF o DPO, ya que es un entrenamiento supervisado de imitación.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para el brazo SO-101.
- Percepción visual: procesa una imagen frontal de alta resolución (720x1280) para localizar el objeto y la zona de colocación.
- Aprendizaje de tareas específicas: está entrenado para la tarea "Pick up the ball and place it on the plate" (recoger el cubo y colocarlo en el plato).
- Ejecución en tiempo real: al predecir chunks de acciones, puede operar a la frecuencia de control del robot (30 FPS).
- No tiene capacidades de lenguaje, tool calling, agentes ni razonamiento multi-paso fuera del contexto robótico.

## Casos de uso

- Automatización de pick-and-place en entornos de laboratorio: el modelo puede integrarse en un sistema robótico para trasladar objetos entre posiciones fijas, reduciendo la intervención humana en tareas repetitivas.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas entre robots o la robustez frente a variaciones de iluminación y posición.
- Prototipado rápido de celdas de manipulación: gracias a LeRobot, el modelo puede desplegarse en minutos con el comando `lerobot-rollout`, permitiendo validar hipótesis de control en hardware real.
- Entrenamiento de políticas para robots de bajo coste: el modelo es ligero (51,7M parámetros) y puede ejecutarse en una GPU modesta, lo que lo hace accesible para laboratorios con recursos limitados.
- Benchmarking de algoritmos de imitación: al estar publicado en Hugging Face con su dataset asociado, permite comparar ACT con otros métodos (Diffusion Policy, etc.) bajo las mismas condiciones.
- Educación en robótica: el flujo completo (grabar datos, entrenar, evaluar) está documentado y puede usarse como material didáctico en cursos de robótica y aprendizaje automático.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." Por tanto, no hay datos de éxito en tareas reales, ni comparaciones con otros modelos.

## Requisitos de hardware

- Inferencia: al ser un modelo de 51,7M parámetros con entrada de imagen, requiere una GPU con al menos 4 GB de VRAM para una ejecución fluida (estimación razonable, no confirmada por el autor). Una RTX 3060 o superior sería suficiente.
- Entrenamiento: con 100.000 pasos y batch 32, se recomienda una GPU con 8-12 GB de VRAM (por ejemplo, RTX 3080 o A2000), aunque podría entrenarse en una RTX 3060 con batch reducido.
- Robot: se necesita un brazo robótico SO-101 (tipo `so_follower`) con su controlador Feetech y una cámara compatible con OpenCV.
- Despliegue: se soporta mediante LeRobot (`lerobot-rollout`), que gestiona la comunicación con el robot y la cámara. No se mencionan opciones como vLLM u Ollama, ya que no es un modelo de lenguaje.
- Latencia: no disponible, pero al operar a 30 FPS, la inferencia debe completarse en menos de 33 ms por paso.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. Sin embargo, se puede contextualizar frente a otras políticas de imitación de la familia LeRobot:

| Modelo | Arquitectura | Parametros | Tarea | Licencia |
|---|---|---|---|---|
| `Yac1n3/act_so101_pick_cube` | ACT | 51,7M | Pick-and-place | Apache-2.0 |
| `sanjay050/act_so101_pick_cube` | ACT | no disponible | Pick-and-place | no disponible |
| Políticas basadas en Diffusion Policy (LeRobot) | Diffusion | variable | Manipulación variada | Apache-2.0 |

La comparación directa no es posible sin resultados de evaluación. Ambos modelos ACT sobre SO-101 son estructuralmente idénticos, pero entrenados con datasets posiblemente diferentes.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: se desconoce la tasa de éxito real en el robot, por lo que no se puede garantizar su funcionamiento en producción.
- Entrenamiento con datos limitados: solo 50 episodios, lo que puede provocar sobreajuste a las condiciones específicas de grabación (posición de cámara, iluminación, textura del objeto).
- Tarea muy específica: el modelo solo sabe ejecutar la tarea "recoger el cubo y colocarlo en el plato"; no generaliza a otros objetos o configuraciones.
- Dependencia de la cámara y el robot: cualquier cambio en la posición de la cámara, el tipo de objeto o el robot puede degradar significativamente el rendimiento.
- Riesgo de daños físicos: al ser un controlador robótico, una ejecución incorrecta puede causar colisiones o daños en el entorno. Se recomienda supervisión humana durante las primeras ejecuciones.
- Sin soporte de idiomas ni interacción multimodal: no es un modelo de propósito general, solo genera acciones de control.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el funcionamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yac1n3/act_so101_pick_cube
- Dataset asociado: https://huggingface.co/datasets/Yac1n3/so101_pick_cube_20260902_010918
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot (framework): https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Repositorio de referencia para SO-101 con LeRobot: https://github.com/PokerJosh/LeRobot-So-101-public
