# tenyyprn/so101-tidyup-diffusion

## Resumen

SO101 tidy-up: Diffusion Policy es una política visomotora entrenada mediante imitación para un brazo robótico de bajo coste SO101. El modelo, publicado por el usuario tenyyprn en Hugging Face, resuelve una tarea concreta de manipulación: recoger esponjas negras de una mesa y depositarlas en una caja blanca. No es un modelo de lenguaje ni un modelo generativo de propósito general, sino una política de control que mapea observaciones (imágenes de dos cámaras y estado articular) a acciones (consignas de ángulo articular).

Técnicamente se trata de una Diffusion Policy, es decir, un modelo que genera trayectorias de acción mediante un proceso de difusión condicionado por las observaciones, siguiendo el trabajo de Chi et al. (arXiv:2303.04137). El checkpoint contiene 277.839.366 parámetros y se distribuye en formato safetensors dentro del ecosistema LeRobot 0.6.1, con licencia Apache 2.0.

Su relevancia es fundamentalmente práctica y educativa: demuestra que con 112 demostraciones teleoperadas, un único brazo de bajo coste y hardware de consumo profesional (NVIDIA GB10 / DGX Spark) se puede entrenar una política que supera claramente a una alternativa ACT en la misma tarea, alcanzando un 85% de esponjas colocadas frente al 48% del modelo ACT de referencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (política visomotora basada en difusión de acciones, arXiv:2303.04137) |
| Parámetros totales | 277.839.366 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación de 2 imágenes + estado articular de 6 dimensiones) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea se especifica con el prompt "Put all the black sponges in the white box") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo implementa una Diffusion Policy: un proceso de difusión que genera secuencias de acciones condicionadas por las observaciones. La entrada combina `observation.state` (6 ángulos articulares del brazo seguidor SO101) con dos flujos de imagen de 640×480 (`observation.images.top` desde una Logicool C920 y `observation.images.wrist` desde una Inno-Maker U20CAM-1080P). La salida es un vector de 6 consignas de ángulo articular. En inferencia se emplea muestreo DDIM con 10 pasos, se predicen 64 fotogramas de acción y se ejecutan 16 (action chunking), lo que reduce el coste de inferencia a aproximadamente 0,18 segundos por llamada.

El entrenamiento se realizó con LeRobot 0.6.1 sobre 112 demostraciones teleoperadas con el brazo líder, grabadas a 30 fps. Se entrenaron 40.000 pasos con batch de 32; las imágenes se reescalaron a 240×320 y se aplicó un recorte aleatorio del 95% como aumento de datos. El conjunto de datos no es público porque la cámara de muñeca captura el interior de la habitación. No se documenta uso de RLHF ni DPO, algo esperable en una política de imitación.

## Capacidades

- Manipulación robótica visomotora: recoger esponjas negras y colocarlas en una caja blanca sobre una mesa.
- Control de brazo de 6 grados de libertad mediante consignas de ángulo articular.
- Fusión de dos vistas de cámara (vista cenital oblicua y vista de muñeca) con el estado articular.
- Generalización parcial al número de objetos: aunque se entrenó con 3 esponjas, completó la tarea con entre 4 y 9 objetos en algunas ejecuciones.
- Ejecución de acciones en bloques (chunking) con 64 pasos predichos y 16 ejecutados, lo que aporta suavidad y reduce la frecuencia de inferencia.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni capacidades multilingües; no es un modelo de lenguaje.
- No dispone de modo de razonamiento explícito (thinking), visión general, audio ni otras modalidades fuera de las dos cámaras indicadas.

## Casos de uso

- Automatización de tareas de ordenación en entornos controlados: el modelo puede recoger objetos pequeños de una superficie y depositarlos en un contenedor, útil en células de pick-and-place de laboratorio con iluminación y cámaras fijas.
- Docencia e investigación en aprendizaje por imitación: sirve como referencia reproducible para comparar Diffusion Policy frente a ACT con el mismo conjunto de 112 demostraciones y el mismo robot SO101.
- Prototipado rápido de políticas visomotoras de bajo coste: con un SO101, dos cámaras USB y una GPU, un equipo puede replicar el pipeline completo de LeRobot y validar la viabilidad de una tarea antes de invertir en hardware industrial.
- Benchmark interno de manipulación: sus métricas (85% de esponjas colocadas, 15/20 episodios completos) permiten establecer una línea base para comparar nuevas políticas sobre el mismo montaje físico.
- Investigación sobre robustez a variaciones de conteo de objetos: el modelo tolera entre 4 y 9 esponjas en algunas ejecuciones, lo que lo hace útil para estudiar generalización composicional en políticas de imitación.
- Integración en pipelines de evaluación automatizada: mediante `lerobot-rollout` se puede lanzar el modelo contra un robot real o un simulador compatible y registrar tasas de éxito de forma sistemática.
- Demostraciones educativas de robótica física: el vídeo y el repositorio asociados permiten ilustrar el ciclo completo de teleoperación, entrenamiento y despliegue en un curso de IA física.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 4 configuraciones aleatorias de esponjas, 5 repeticiones cada una (20 episodios en total por modelo):

| Métrica | ACT | Diffusion Policy (este modelo) |
|---|---|---|
| Agarró entre dos esponjas (error) | 15 / 20 | 0 / 20 |
| Esponjas colocadas en la caja | 29 / 60 (48%) | 51 / 60 (85%) |
| Episodios con las 3 esponjas recogidas | 3 / 20 | 15 / 20 |

Los fallos restantes del modelo de difusión fueron 3 por tiempo agotado y 2 por desalineación al agarrar junto a una esponja. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 277,8 M de parámetros en safetensors y un repositorio de 1,1 GB, la inferencia cabe holgadamente en GPUs de consumo con 8 GB o más.
- GPU recomendadas: el autor entrenó e infirió en una NVIDIA GB10 (DGX Spark); cualquier GPU con al menos 8-12 GB de VRAM debería ser suficiente para inferencia.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4070, RTX 4090 y similares; no se ha verificado en la información disponible.
- Opciones de despliegue: LeRobot 0.6.1 mediante `lerobot-rollout` con `--policy.path=tenyyprn/so101-tidyup-diffusion`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia: aproximadamente 0,18 segundos por inferencia en NVIDIA GB10 (DGX Spark). Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tenyyprn/so101-tidyup-diffusion | 277,8 M | no aplica | 85% esponjas, 15/20 episodios completos | Apache 2.0 | Hugging Face |
| tenyyprn/so101-tidyup-act | no disponible | no aplica | 48% esponjas, 3/20 episodios completos | no disponible | Hugging Face |
| Diffusion Policy original (Chi et al., 2023) | no disponible | no aplica | no disponible | no disponible | Paper arXiv:2303.04137 |

La comparación directa más relevante es con el modelo ACT del mismo autor, entrenado con las mismas 112 demostraciones y evaluado en las mismas 4 configuraciones: la Diffusion Policy reduce a cero los agarres entre esponjas y multiplica por casi cinco los episodios completados con éxito.

## Limitaciones y advertencias

- Fuerte sobreajuste al entorno de recogida de datos: un solo brazo SO101, una mesa, una caja y posiciones de cámara fijas. Cambios de mesa, iluminación, posición de cámara u objetos probablemente rompen el comportamiento.
- El conjunto de datos de entrenamiento no es público porque la cámara de muñeca captura el interior de la habitación, lo que impide reproducir el entrenamiento tal cual.
- Riesgo de fallos por desalineación: 2 de 20 episodios fallaron por agarrar repetidamente al lado de una esponja, y 3 por agotamiento del tiempo límite.
- Con más de 5 esponjas la caja se desborda y requiere intervención humana para reorganizar el contenido.
- No es un modelo de lenguaje: no procesa texto libre más allá del prompt de tarea, no razona simbólicamente y no tiene capacidades multilingües.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento fuera del montaje original.
- Para uso en robot real se recomienda limitar el movimiento con `max_relative_target` y mantener una parada de emergencia accesible.
- No se documentan sesgos sociales ni de otro tipo; los riesgos son de seguridad física en la manipulación, no de contenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tenyyprn/so101-tidyup-diffusion
- Modelo ACT de comparación: https://huggingface.co/tenyyprn/so101-tidyup-act
- Vídeo de demostración: https://youtu.be/zCo2obT3ASg
- Código y memoria del proyecto: https://github.com/tenyyprn/so101-tidyup-robot
- LeRobot (Hugging Face): https://github.com/huggingface/lerobot
- Paper Diffusion Policy: https://arxiv.org/abs/2303.04137
- Paper DDIM (Song, Meng, Ermon, ICLR 2021): no disponible como enlace directo en la información proporcionada
