# vis22/30fps_act_sim_cube_50

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación en tareas de manipulación robótica. Este repositorio concreto, `vis22/30fps_act_sim_cube_50`, es una política entrenada con LeRobot sobre el dataset `vis22/30fps_sim_cube_50` para la tarea "pick the cube and place it in the bin" en un robot simulado de tipo `piper_mujoco`.

El modelo consume el estado del robot (vector de 7 dimensiones) y dos flujos de imagen RGB de 480x640 (cámara global y cámara de pinza), y produce un vector de acción de 7 dimensiones. Tiene 51.670.663 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo hace muy ligero y desplegable en hardware modesto.

Su relevancia es acotada: se trata de un modelo de referencia para flujos de trabajo de imitación en robótica con LeRobot, útil para reproducir pipelines de entrenamiento y evaluación, pero no es un modelo de propósito general ni un LLM. No hay resultados de evaluación publicados ni métricas de éxito reportadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.670.663 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación por chunk de acciones) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que predice un chunk de acciones futuras a partir de observaciones multimodales. En este caso, la política recibe `observation.state` (7 dimensiones), `observation.images.cam_global` (3x480x640) y `observation.images.cam_gripper` (3x480x640), y emite `action` (7 dimensiones). El modelo sigue la formulación del paper arXiv:2304.13705.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `vis22/30fps_sim_cube_50`: 50 episodios, 29.663 frames a 30 FPS, tarea única "pick the cube and place it in the bin". Configuración: 200.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05, semilla 1000. No se documenta composición del dataset más allá de los episodios indicados, ni uso de RLHF/DPO (no aplica a este paradigma).

## Capacidades

- Generación de acciones de manipulación robótica (chunks) para un robot `piper_mujoco`.
- Procesamiento de observaciones multimodales: estado proprioceptivo y dos cámaras RGB.
- Ejecución de una tarea concreta de pick-and-place ("pick the cube and place it in the bin").
- Integración con el ecosistema LeRobot para rollout (`lerobot-rollout`) y reentrenamiento (`lerobot-train`).
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de pipelines de imitación en robótica: sirve como política de referencia para validar la instalación de LeRobot y el flujo `lerobot-rollout` con un robot `piper_mujoco` y dos cámaras.
- Benchmark interno de pick-and-place simulado: permite comparar variantes de ACT (distintos hiperparámetros, datasets o tasas de FPS) sobre la misma tarea de cubo y contenedor.
- Docencia y formación en aprendizaje por imitación: modelo pequeño (51,7 M de parámetros, 0,2 GB) adecuado para demostrar el ciclo completo de grabación de datos, entrenamiento y despliegue.
- Prototipado de control visual: al usar cámara global y de pinza, sirve para experimentar con políticas que dependen de realimentación visual en tiempo real a 30 FPS.
- Base para fine-tuning: punto de partida para reentrenar sobre nuevos datasets de la misma familia de robot o tareas similares de manipulación.
- Validación de infraestructura de inferencia robótica: su reducido tamaño permite desplegarlo en equipos con GPU de consumo para pruebas de latencia y throughput en bucles de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y pesos en safetensors (0,2 GB de repositorio), la huella en FP32 ronda los 0,2 GB y en FP16 aproximadamente 0,1 GB, sin contar buffers de las imágenes de entrada (2 x 3x480x640).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente en la práctica; se puede usar RTX 3060, RTX 4090, A100 o H100 sin que el modelo sea el cuello de botella.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante, orientativamente).
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es la vía documentada; no se indica soporte explícito para vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de política).
- Latencia y throughput estimados: no disponibles; el bucle de control está fijado a 30 FPS por la tasa del dataset.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vis22/30fps_act_sim_cube_50 (este) | 51,7 M | no aplica | Pick-and-place simulado (`piper_mujoco`) | apache-2.0 | Hugging Face |
| Políticas ACT genéricas en LeRobot Hub | variable | no aplica | Manipulación por imitación | variable | Hugging Face |
| Diffusion Policy (referencia) | no disponible | no aplica | Manipulación por imitación | no disponible | Repositorios de investigación |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico para una única tarea ("pick the cube and place it in the bin") y un único tipo de robot (`piper_mujoco`); no generaliza a otras tareas sin reentrenamiento.
- Entrenado sobre solo 50 episodios y 29.663 frames, lo que limita la robustez ante variaciones de posición, iluminación o distractores.
- Sin resultados de evaluación publicados: no hay tasa de éxito reportada, por lo que no se puede afirmar su fiabilidad en producción.
- Depende de dos cámaras con nombres y resoluciones concretas (`cam_global`, `cam_gripper`, 480x640); un cambio de configuración de sensores invalida la política.
- Riesgo de sobreajuste al entorno simulado; no hay evidencia de transferencia a robot real.
- No es un modelo de lenguaje: no procesa texto ni mantiene conversaciones; las expectativas de uso deben ceñirse a control robótico.
- Licencia apache-2.0 permite uso comercial, pero la ausencia de evaluación y la especificidad de la tarea desaconsejan su uso directo en producción sin validación propia.
- No se documentan sesgos, pero al ser un modelo de imitación hereda los sesgos y limitaciones de los datos de teleoperación.

## Enlaces

- Hugging Face: https://huggingface.co/vis22/30fps_act_sim_cube_50
- Dataset: https://huggingface.co/datasets/vis22/30fps_sim_cube_50
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=vis22/30fps_sim_cube_50
