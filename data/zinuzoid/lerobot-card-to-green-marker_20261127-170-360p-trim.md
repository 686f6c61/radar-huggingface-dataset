# zinuzoid/lerobot-card-to-green-marker_20261127-170-360p-trim

## Resumen

El modelo `lerobot-card-to-green-marker_20261127-170-360p-trim` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv 2304.13705. Lo desarrolla el usuario `zinuzoid` y se distribuye a través del ecosistema LeRobot de Hugging Face. No se trata de un modelo de lenguaje, sino de un controlador visomotor que traduce observaciones (estado del robot e imágenes de dos cámaras) en comandos de acción de bajo nivel para un brazo robótico con ventosa.

El modelo resuelve una tarea concreta: mover una tarjeta hasta un marcador verde y pasarla de mano, aprendida por imitación a partir de 170 episodios teleoperados (48.911 fotogramas a 30 FPS). Con 51.671.687 parámetros, es un modelo compacto que cabe holgadamente en GPU de consumo y está pensado para despliegue en el robot SO-101 con ventosa (`so101_suction_follower`).

Es relevante ahora porque ejemplifica el flujo actual de robótica de imitación abierta: entrenamiento reproducible con LeRobot 0.7.1, pesos en safetensors, licencia Apache 2.0 y un pipeline de evaluación sobre hardware asequible. Es un fine-tune de un checkpoint anterior del mismo autor, lo que muestra la práctica de iterar políticas sobre datasets ampliados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ACT (Action Chunking with Transformers) |
| Parametros totales | 51.671.687 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control; ventana de observación definida por la configuración de ACT) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,2 GB |
| Tipo de robot | `so101_suction_follower` |
| Camaras | `overhead`, `gripper` |
| Entradas | `observation.state` (8,), `observation.images.overhead` (3, 360, 640), `observation.images.gripper` (3, 360, 640) |
| Salidas | `action` (7,) |
| Dataset de entrenamiento | `zinuzoid/lerobot-card-to-green-marker_20261127-170-360p-trim` (170 episodios, 48.911 fotogramas, 30 FPS) |
| Tareas | "Move a card to green marker", "Pass a card" |
| Modelo base | `zinuzoid/lerobot-card-to-green-marker_20261126-110-360p-trim` |
| Libreria | LeRobot 0.7.1 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos de acción (*action chunks*) en lugar de pasos individuales, lo que reduce el error de acumulación y suaviza el control. La arquitectura combina un codificador visual para las dos cámaras (vista cenital y de la pinza/ventosa), un codificador del estado proprioceptivo de 8 dimensiones y un transformer que genera secuencias de 7 acciones. El modelo aprende de datos teleoperados, sin refuerzo ni RLHF.

El entrenamiento se realizó durante 50.000 pasos con batch size 24, optimizador AdamW, learning rate 1e-05 y semilla 1000, usando LeRobot 0.7.1. El dataset contiene 170 episodios y 48.911 fotogramas a 30 FPS, con dos tareas anotadas. El checkpoint deriva de un fine-tune previo (`..._20261126-110-360p-trim`), de modo que esta versión amplía el entrenamiento sobre el anterior. No se documentan innovaciones adicionales más allá de las propias de ACT.

## Capacidades

- Control visomotor de un brazo robótico SO-101 con ventosa para manipulación de objetos planos (tarjetas).
- Predicción de chunks de acción de 7 dimensiones a partir de estado (8,) e imágenes de dos cámaras.
- Ejecución de dos tareas aprendidas: mover una tarjeta a un marcador verde y pasar una tarjeta.
- Aprendizaje por imitación a partir de demostraciones teleoperadas; no requiere modelado explícito del entorno.
- Fine-tune adicional sobre el checkpoint base para adaptarse a nuevos datasets con el mismo formato.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, diálogo multilingüe ni modalidades de audio o lenguaje.

## Casos de uso

- Automatización de picking y placing de objetos planos: el modelo traslada una tarjeta a una posición objetivo marcada visualmente, usando la cámara cenital para localizar el marcador y la de pinza para el agarre fino.
- Prototipado de políticas de imitación en laboratorio: sirve como referencia reproducible para comparar variantes de ACT, datasets y configuraciones de entrenamiento con LeRobot.
- Fine-tune sobre nuevos datasets de manipulación: al estar publicado con licencia Apache 2.0 y formato safetensors, se puede reentrenar con `lerobot-train` partiendo de este checkpoint para tareas similares.
- Evaluación de hardware SO-101: permite validar calibración de cámaras, puerto del robot y sincronización a 30 FPS antes de desplegar políticas más complejas.
- Docencia y demostraciones de robótica de imitación: el modelo es pequeño (0,2 GB) y se ejecuta en GPU de consumo, lo que facilita su uso en aulas y talleres.
- Investigación en transferencia entre políticas: al derivar de un checkpoint anterior, permite estudiar el efecto de ampliar el dataset (de 110 a 170 episodios) sobre el rendimiento de la política.
- Integración en pipelines de evaluación automatizada: el comando `lerobot-rollout` con `--strategy.type=base` permite ejecutar la política sin grabar episodios, útil para pruebas de regresión en CI sobre hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que aún no se han proporcionado resultados de evaluación en robot real (tabla de éxito por tarea vacía).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros y pesos en safetensors de 0,2 GB, cabe en cualquier GPU con 2 GB o más, e incluso en CPU para pruebas lentas.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090, A100 o H100; para inferencia en tiempo real a 30 FPS basta una GPU de consumo moderna.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2-4 GB de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`), con soporte de dispositivo CUDA mediante `--policy.device=cuda`. No se documentan exportaciones a vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles; el control opera a 30 FPS según el dataset, pero no se publican medidas de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `zinuzoid/lerobot-card-to-green-marker_20261127-170-360p-trim` | 51,7 M | no disponible | Manipulación SO-101 (tarjeta a marcador) | Apache 2.0 | Hugging Face |
| `zinuzoid/lerobot-card-to-green-marker_20261126-110-360p-trim` (modelo base) | no disponible | no disponible | Manipulación SO-101 (versión previa, 110 episodios) | Apache 2.0 | Hugging Face |
| Otras políticas ACT de LeRobot | variable | no disponible | Manipulación genérica | variable (habitualmente Apache 2.0) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada.

## Limitaciones y advertencias

- No hay resultados de evaluación en robot real publicados; se desconoce la tasa de éxito de las tareas.
- El modelo está entrenado para un robot y una configuración de cámaras concretos (`so101_suction_follower`, cámaras `overhead` y `gripper` a 360x640); cambiar la disposición, la iluminación o el robot puede degradar el rendimiento.
- Las tareas aprendidas son específicas ("Move a card to green marker", "Pass a card"); no generaliza a otros objetos ni a otras metas sin reentrenamiento.
- Riesgo de sobreajuste al dataset de 170 episodios y a las condiciones de captura; no se documentan variaciones de posiciones, iluminación o distractores.
- No es un modelo de lenguaje: no tiene capacidades de diálogo, razonamiento simbólico ni multilingüismo.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación en producción recae en el integrador.
- El comando de ejemplo de la model card usa cámaras a 640x480 y 30 FPS, mientras que las observaciones del modelo son 360x640; conviene verificar la coincidencia exacta de resolución y nombres de cámara antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zinuzoid/lerobot-card-to-green-marker_20261127-170-360p-trim
- Modelo base: https://huggingface.co/zinuzoid/lerobot-card-to-green-marker_20261126-110-360p-trim
- Dataset de entrenamiento: https://huggingface.co/datasets/zinuzoid/lerobot-card-to-green-marker_20261127-170-360p-trim
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=zinuzoid/lerobot-card-to-green-marker_20261127-170-360p-trim
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
