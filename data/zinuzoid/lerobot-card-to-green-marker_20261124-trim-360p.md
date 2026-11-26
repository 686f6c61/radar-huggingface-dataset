# zinuzoid/lerobot-card-to-green-marker_20261124-trim-360p

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino una política de control robótico entrenada con el método ACT (Action Chunking with Transformers) dentro del ecosistema LeRobot de Hugging Face. La desarrolla el usuario `zinuzoid` y resuelve una tarea de manipulación muy concreta: mover una tarjeta hasta un marcador verde con un robot de succión `so101_suction_follower` que dispone de dos cámaras (vista cenital y pinza). Es, por tanto, un ejemplo de aprendizaje por imitación a partir de teleoperación, no un modelo generativo de texto.

La arquitectura es un transformer que predice fragmentos de acción (*action chunks*) en lugar de pasos individuales, lo que reduce el error de acumulación y estabiliza el control. El modelo tiene 51.671.687 parámetros (unos 51,7 M) y consume observaciones de estado de 8 dimensiones más dos imágenes de 360x640 píxeles, produciendo acciones de 7 dimensiones. El contexto temporal no es una ventana de tokens de lenguaje, sino el horizonte de predicción de acciones propio de ACT.

Su relevancia es práctica: sirve como referencia reproducible de un *pipeline* completo de LeRobot (grabación de datos, entrenamiento, despliegue con `lerobot-rollout`) sobre hardware accesible, y como plantilla para quien quiera entrenar políticas de imitación para tareas de pick-and-place sencillas. No hay resultados de evaluación publicados ni descargas, así que debe tratarse como un artefacto experimental más que como un componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer de imitación |
| Parametros totales | 51.671.687 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (horizonte de predicción de acciones propio de ACT; no es contexto de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) condicionadas por observaciones visuales y de estado. La política combina un codificador visual para las dos cámaras (`overhead` y `gripper`, cada una a 3x360x640) con un transformer que modela la secuencia de acciones; la salida es un vector de acción de 7 dimensiones por paso. El estado del robot se introduce como vector de 8 dimensiones. El método se describe en el paper arXiv:2304.13705 y se implementa en la librería LeRobot 0.6.1.

El entrenamiento se realizó sobre el dataset `zinuzoid/lerobot-card-to-green-marker_20261125-70-2-360p-trim`: 70 episodios, 21.484 fotogramas a 30 FPS, con la tarea "Move a card to green marker". La configuración reportada es de 40.000 pasos, batch de 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta composición adicional del dataset, aumento de datos, ni etapas de RLHF/DPO (no aplicables a este tipo de política). Tampoco se detalla si se aplicó decodificación especulativa u otras optimizaciones de inferencia.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 7 dimensiones para un robot de succión `so101_suction_follower`.
- Percepción visual multimodal: procesa simultáneamente dos flujos de imagen (vista cenital y de pinza) a 360x640.
- Ejecución de una tarea específica de pick-and-place: trasladar una tarjeta hasta un marcador verde.
- Aprendizaje por imitación a partir de teleoperación, sin recompensas explícitas.
- Predicción de chunks de acción, lo que aporta suavidad y reduce el error acumulado frente a políticas paso a paso.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo *thinking*, visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de un pipeline de imitación de referencia: sirve para validar la instalación de LeRobot, la calibración del robot `so101_suction_follower` y el flujo `lerobot-rollout` antes de entrenar políticas propias.
- Automatización de una tarea de pick-and-place concreta: colocar tarjetas sobre un marcador verde en una celda de laboratorio o demo, usando las dos cámaras como única entrada perceptiva.
- Base para *fine-tuning* en tareas similares: al compartir arquitectura y formato con LeRobot, puede reentrenarse con nuevos datasets manteniendo la estructura de observaciones y acciones.
- Docencia y formación en robótica de imitación: ejemplo completo y ligero (0,2 GB) para explicar ACT, el formateo de datasets y el despliegue en hardware real.
- Pruebas de integración hardware-software: validar cámaras, puerto del robot y tasas de 30 FPS con una política ya entrenada antes de invertir en datos propios.
- Comparación de métodos de imitación: usar esta política como línea base ACT frente a alternativas como Diffusion Policy o VQ-BeT en el mismo entorno y dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (ni tasa de éxito, ni número de ensayos).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en precisión completa el peso ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna (orientativo, no confirmado por el autor).
- GPU recomendadas: no especificadas. El comando de entrenamiento de la model card usa `--policy.device=cuda`, lo que implica una GPU NVIDIA; no se detalla el modelo concreto.
- Cabe en GPU consumer: sí, por tamaño de parámetros; no hay confirmación oficial de latencia ni de modelos concretos (RTX 4090, RTX 3060, etc.).
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) para ejecución en robot; `lerobot-train` para reentrenamiento. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a una política robótica).
- Latencia y throughput: no disponibles. La captura de cámaras se configura a 30 FPS y la ejecución puede limitarse con `--duration`.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ACT, zinuzoid) | Política de imitación ACT | 51,7 M | Estado 8D + 2 imágenes 360x640 | Apache 2.0 | Hugging Face, 0 descargas |
| ACT genérico (LeRobot) | Política de imitación ACT | Varía según entrenamiento | Estado + imágenes | Apache 2.0 | Documentación y ejemplos en LeRobot |
| Diffusion Policy | Política de imitación generativa | Varía según configuración | Estado + imágenes | No disponible en la información | Implementaciones en LeRobot |
| VQ-BeT | Política de imitación con cuantización vectorial | Varía según configuración | Estado + imágenes | No disponible en la información | Implementaciones en LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Tarea única y muy específica: solo se ha entrenado para "Move a card to green marker"; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasa de éxito ni validación en robot real, por lo que su fiabilidad en producción es desconocida.
- Dependencia del hardware exacto: asume el robot `so101_suction_follower` y las cámaras `overhead` y `gripper` con las resoluciones y nombres de observación del entrenamiento; cambios de cámara, iluminación o posición pueden degradar el comportamiento.
- Dataset pequeño: 70 episodios y 21.484 fotogramas son una base limitada, con riesgo de sobreajuste a posiciones y condiciones concretas.
- Sin datos sobre sesgos, alucinación o multilingüismo: no aplican como en un LLM, pero sí existe el riesgo de comportamientos erráticos fuera de la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Cero descargas y cero *likes*: artefacto reciente y sin validación por la comunidad; conviene tratarlo como experimental.
- No se documentan cuantizaciones ni optimizaciones de despliegue, lo que limita su uso en entornos embebidos sin trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zinuzoid/lerobot-card-to-green-marker_20261124-trim-360p
- Dataset de entrenamiento: https://huggingface.co/datasets/zinuzoid/lerobot-card-to-green-marker_20261125-70-2-360p-trim
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=zinuzoid/lerobot-card-to-green-marker_20261125-70-2-360p-trim
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
