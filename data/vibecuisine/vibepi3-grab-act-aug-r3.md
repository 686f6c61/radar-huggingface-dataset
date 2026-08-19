# VibeCuisine/vibepi3-grab-act-aug-r3

## Resumen

El modelo `vibepi3-grab-act-aug-r3` es una política de robótica basada en ACT (Action Chunking with Transformers), desarrollada por VibeCuisine mediante su plataforma Vibe Data Studio. Está diseñado para controlar un brazo robótico de 7 grados de libertad (shoulder_pan, shoulder_lift, elbow_flex, wrist_flex, wrist_roll, gripper, tilt) en la tarea específica de agarrar un pepino en el punto de un tercio de su longitud, a partir de instrucciones en lenguaje natural.

El modelo se entrenó desde cero con 64 episodios teleoperados (3.478 frames a 20 fps) extraídos del dataset curado `VibeCuisine/vibepi3-grab-poseexpert-r3-curated`. Con 51,6 millones de parámetros y una arquitectura transformer, representa un ejemplo de entrenamiento de políticas robóticas con pocos datos, un enfoque relevante para la robótica doméstica y la automatización de tareas de preparación de alimentos. Su publicación en HuggingFace bajo el ecosistema LeRobot facilita su reproducción y despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), entrenado desde cero |
| Parametros totales | 51.609.223 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa imágenes y acciones por chunk; no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Instrucciones en inglés (única tarea: "Grab the cucumber at the one-third point") |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y precisión del control robótico. El modelo procesa imágenes de tres cámaras (corner, top, wrist) a 640×480 píxeles y 20 fps, junto con el estado del robot (7 dimensiones), para generar chunks de 40 pasos de acción.

El entrenamiento se realizó con 30.000 pasos, batch size de 8, semilla 1000, y una división de validación del 10% (eval_split=0.1). La pérdida final de entrenamiento fue de 0.047. Se utilizó aumento de imágenes (image_transforms.enable=true). El entrenamiento duró 1 hora y 17 minutos en una GPU proporcionada por el sitio (site-gpu). No se menciona el uso de RLHF ni DPO; es un entrenamiento supervisado de imitación puro.

## Capacidades

- Control robótico de precisión: ejecuta la tarea de agarrar un pepino en un punto específico (un tercio de su longitud) mediante un brazo de 7 grados de libertad.
- Condicionamiento por lenguaje: acepta una instrucción textual ("Grab the cucumber at the one-third point") para seleccionar la tarea a ejecutar.
- Percepción visual multi-cámara: utiliza tres cámaras (corner, top, wrist) para observar la escena y guiar la acción.
- Generación de acciones en chunks: predice secuencias de 40 pasos de acción, lo que permite movimientos suaves y coordinados.
- Reproducibilidad: entrenado con LeRobot, lo que permite replicar el entrenamiento y desplegarlo en hardware compatible (vibeboard_v3).

## Casos de uso

- Automatización de preparación de alimentos: el modelo puede integrarse en un robot de cocina (como el VibeBoard) para realizar tareas de agarre de ingredientes, por ejemplo, sujetar un pepino para cortarlo o procesarlo.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo políticas ACT generalizan con pocos episodios (64) y cómo el aumento de datos afecta al rendimiento.
- Desarrollo de robots domésticos: su tamaño compacto (51,6 M parámetros) permite ejecutarlo en hardware de bajo coste, abriendo la puerta a robots de asistencia en cocinas domésticas.
- Benchmark de manipulación robótica: la tarea de agarre de pepino puede utilizarse como referencia para comparar métodos de control (ACT vs. otras arquitecturas) en entornos controlados.
- Entrenamiento de políticas específicas de producto: empresas de robótica pueden usar Vibe Data Studio para generar políticas personalizadas para sus brazos robóticos, partiendo de este modelo como base.
- Educación en robótica: permite a estudiantes y desarrolladores experimentar con entrenamiento de políticas de imitación sin necesidad de grandes infraestructuras de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la pérdida final de entrenamiento (0.047), sin comparación con otros modelos. No se dispone de tasas de éxito en tareas reales ni comparativas con políticas alternativas.

## Requisitos de hardware

- VRAM estimada: no se especifica, pero con 51,6 M de parámetros y entrada de imágenes de 640×480 (tres cámaras), se estima que cabe en GPUs de consumo con al menos 8 GB de VRAM (p.ej., RTX 3060 o superior) en FP32. Con cuantización (no disponible) podría reducirse aún más.
- GPU recomendada: cualquier GPU moderna con soporte CUDA (p.ej., RTX 3090, RTX 4090, A100). El entrenamiento se realizó en una GPU de sitio no especificada.
- Inferencia en CPU: posible pero con latencia alta; se recomienda GPU para tiempo real.
- Opciones de despliegue: LeRobot (framework de entrenamiento e inferencia), compatible con ROS y hardware robótico; también puede exportarse a ONNX o TensorRT para optimización.
- Latencia y throughput: no disponibles. Dependerá del hardware y de la resolución de las cámaras.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo de este modelo con otros. Sin embargo, se han identificado modelos relacionados de la misma autora (VibeCuisine) en HuggingFace:

| Modelo | Tarea | Parámetros | Contexto | Licencia |
|---|---|---|---|---|
| `vibepi3-grab-act-aug-r3` | Agarrar pepino | 51,6 M | No aplica | No disponible |
| `autorl-grab-act-vibepi-iter5-v1` | Agarrar (iteración 5) | No disponible | No aplica | No disponible |
| `autorl-grab-act-vibepi-iter10-aug` | Agarrar (iteración 10) | No disponible | No aplica | No disponible |

Estos modelos parecen ser iteraciones del mismo proyecto, pero no hay métricas públicas que permitan una comparación objetiva.

## Limitaciones y advertencias

- Datos de entrenamiento muy limitados: solo 64 episodios para una única tarea, lo que puede provocar sobreajuste y falta de generalización a variaciones (diferentes posiciones de pepino, iluminación, etc.).
- Tarea específica: el modelo solo ejecuta la instrucción "Grab the cucumber at the one-third point"; no es un sistema generalista.
- Sin licencia especificada: el uso comercial y la redistribución no están claros; se recomienda contactar con VibeCuisine antes de utilizarlo en producción.
- Dependencia del hardware: el modelo se entrenó para el rig `vibeboard_v3`; puede no funcionar correctamente en otros brazos robóticos sin recalibración o reentrenamiento.
- Riesgo de alucinación en acciones: como política de imitación, puede generar movimientos erráticos si la entrada visual difiere mucho del dataset de entrenamiento.
- Sin evaluación en entornos reales: no se han publicado tasas de éxito en el mundo real, solo la pérdida de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VibeCuisine/vibepi3-grab-act-aug-r3
- Dataset de entrenamiento: https://huggingface.co/datasets/VibeCuisine/vibepi3-grab-poseexpert-r3-curated
- Registro de entrenamiento (W&B): https://wandb.ai/jeremyhx-freelance/lerobot/runs/vds48-2fc878f0
- Web de VibeCuisine: https://www.vibecuisine.com/
- Modelos relacionados: https://huggingface.co/VibeCuisine/autorl-grab-act-vibepi-iter5-v1 y https://huggingface.co/VibeCuisine/autorl-grab-act-vibepi-iter10-aug
