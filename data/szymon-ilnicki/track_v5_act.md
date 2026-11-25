# Szymon-Ilnicki/track_v5_act

## Resumen

`Szymon-Ilnicki/track_v5_act` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un algoritmo de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. Ha sido desarrollada por el usuario Szymon-Ilnicki y publicada en Hugging Face mediante la librería LeRobot de Hugging Face. El modelo resuelve la tarea de conducción autónoma de un vehículo a escala F1TENTH sobre una pista, completando vueltas en sentido horario y antihorario, tanto a velocidad lenta como rápida.

La política consume dos flujos de vídeo de cámaras (240x424 píxeles cada uno) y un vector de estado de 2 dimensiones, y produce un vector de acción también de 2 dimensiones. Con 51.578.498 parámetros, se trata de un modelo compacto diseñado para inferencia en tiempo real sobre hardware de robótica. El repositorio ocupa 0,2 GB y los pesos están en formato safetensors.

Es relevante porque ejemplifica el flujo de trabajo actual de LeRobot para políticas de imitación reproducibles: dataset público, configuración de entrenamiento documentada y comandos de despliegue directos. No obstante, carece de licencia declarada, de resultados de evaluación y de información sobre idiomas, lo que limita su uso en producción sin verificación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.578.498 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Entradas | `observation.images.camera1` (3, 240, 424), `observation.images.camera2` (3, 240, 424), `observation.state` (2,) |
| Salidas | `action` (2,) |
| Tipo de robot | f1tenth |
| Camaras | camera1, camera2 |
| Dataset de entrenamiento | local/track_v5_state (282 episodios, 14.716 frames, 10 FPS) |
| Pasos de entrenamiento | 40.000 |
| Batch size | 16 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Version de LeRobot | 0.7.0 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura combina un codificador visual que procesa las imágenes de las dos cámaras con un transformer que fusiona las representaciones visuales y el estado del robot, y un decodificador que emite un chunk de acciones futuras en lugar de una única acción. Esta predicción por fragmentos reduce el error de acumulación y mejora la estabilidad en tareas de control continuo como la conducción.

El entrenamiento se realizó sobre el dataset `local/track_v5_state`, compuesto por 282 episodios y 14.716 frames capturados a 10 FPS mediante teleoperación. Las tareas cubiertas son cuatro: completar vueltas en sentido antihorario lento, horario lento, horario rápido y antihorario rápido. Se ejecutaron 40.000 pasos con batch size 16, optimizador AdamW, learning rate 1e-05 y semilla 1000, usando LeRobot 0.7.0. No se documenta el uso de RLHF, DPO ni técnicas de refuerzo adicionales; se trata de aprendizaje supervisado puro a partir de demostraciones.

## Capacidades

- Control de conducción de un vehículo F1TENTH sobre una pista, con cuatro modos de tarea: vueltas lentas y rápidas en ambos sentidos.
- Fusión multimodal de dos cámaras RGB (240x424) y un vector de estado de 2 dimensiones.
- Predicción de chunks de acciones de 2 dimensiones, lo que aporta suavidad y reduce el jitter en el control.
- Aprendizaje por imitación a partir de datos teleoperados, sin necesidad de recompensas explícitas.
- Inferencia en tiempo real mediante el comando `lerobot-rollout` con estrategia base.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Conducción autónoma a escala en competiciones F1TENTH: la política se despliega sobre el vehículo para completar vueltas de forma autónoma, usando las dos cámaras para percibir la pista y el estado para ajustar la acción. Es adecuada por su bajo número de parámetros y su entrenamiento específico en pista.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible para comparar variantes de ACT, ajustar hiperparámetros o evaluar técnicas de chunking de acciones sobre un dataset público de 282 episodios.
- Prototipado de pipelines LeRobot: el modelo permite validar el flujo completo de `lerobot-rollout` y `lerobot-train` antes de escalar a robots o tareas más complejas.
- Docencia y formación en robótica: su tamaño compacto (51,6 M de parámetros, 0,2 GB) facilita ejecutarlo en laboratorios con hardware modesto y explicar el ciclo completo de captura, entrenamiento y despliegue.
- Benchmark de robustez ante condiciones de pista: al cubrir cuatro tareas (lento/rápido, horario/antihorario), permite estudiar la degradación del rendimiento al cambiar velocidad o sentido.
- Base para fine-tuning en dominios similares: puede reentrenarse con nuevos datasets de conducción a escala para adaptar la política a otras pistas o vehículos de la familia F1TENTH.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real y que la tabla de éxito por tarea está pendiente de rellenar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros en safetensors, el peso de los pesos en FP32 ronda los 200 MB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 3060, RTX 4060 o superior es suficiente; para entrenamiento se recomienda una GPU con al menos 8-12 GB de VRAM por el batch size 16 y las dos cámaras de entrada.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM para inferencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), tal como documenta la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. La captura de entrenamiento es a 10 FPS y las cámaras de despliegue se configuran a 30 FPS en el ejemplo, pero no se publican métricas de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Szymon-Ilnicki/track_v5_act | 51.578.498 | 2 cámaras 240x424 + estado (2,) | Conducción F1TENTH (ACT) | no disponible | Hugging Face, LeRobot |
| Políticas ACT genéricas de LeRobot | variable | variable según dataset | Manipulación y control con ACT | según repositorio | Hugging Face, LeRobot |
| Políticas Diffusion Policy | mayor habitualmente | variable | Manipulación por imitación | según repositorio | Hugging Face, LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, entradas y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse solo con 282 episodios de una pista concreta, es probable que generalice mal a otras pistas, iluminación o vehículos.
- Riesgo de alucinación: no aplica en el sentido de lenguaje, pero sí existe riesgo de acciones erráticas fuera de la distribución de entrenamiento (por ejemplo, ante obstáculos no vistos).
- Limitaciones de contexto o idioma: no es un modelo de lenguaje; no procesa texto ni instrucciones en lenguaje natural más allá de la etiqueta de tarea usada en el condicionamiento.
- Restricciones de licencia: la licencia no está declarada, lo que impide determinar si se permite uso comercial; se debe contactar con el autor antes de cualquier despliegue productivo.
- Caveat para producción: no hay resultados de evaluación en robot real, ni métricas de éxito por tarea, ni información sobre latencia; el uso en producción requiere validación propia.
- El dataset referenciado es `local/track_v5_state`, una ruta local, lo que puede dificultar la reproducibilidad exacta del entrenamiento.
- Dependencia de la versión de LeRobot 0.7.0 y de los nombres exactos de las cámaras (`camera1`, `camera2`) para que la política funcione.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Szymon-Ilnicki/track_v5_act
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/local/track_v5_state
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=local/track_v5_state
