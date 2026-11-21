# YunBeen1205/pnp_cube_model1_merged_act_policy

## Resumen

`pnp_cube_model1_merged_act_policy` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT) y publicada en el Hub mediante la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visomotor que, a partir de una imagen de cámara de muñeca y del estado articular del robot, predice directamente una secuencia corta de acciones motoras de 7 dimensiones. El autor es YunBeen1205 y la tarea concreta aprendida es «Pick up the cube and place it on the plate» (coger un cubo y dejarlo en un plato).

El modelo tiene 51.670.663 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras aptas para inferencia en tiempo real sobre hardware de consumo. Se entrenó sobre un dataset propio de 20 episodios y 26.951 fotogramas a 30 FPS, con 20.000 pasos de entrenamiento y batch size de 8. Está pensado para el robot `so102_follower` con una única cámara `cam_wrist`.

Su relevancia es la de un ejemplo reproducible de aprendizaje por imitación de extremo a extremo: el repositorio incluye la configuración de entrenamiento completa y los comandos exactos de LeRobot para ejecutar la política en un robot real o reentrenarla. No obstante, es un modelo de nicho, sin descargas ni valoraciones, sin resultados de evaluación publicados y limitado a una única tarea y morfología de robot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con acción por chunks (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.670.663 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice bloques cortos de acciones futuras en lugar de un único paso, lo que reduce el error de acumulación y suaviza el control. La política consume dos modalidades: el estado del robot (`observation.state`, vector de 7 dimensiones) y una imagen RGB de la cámara de muñeca (`observation.images.cam_wrist`, tensor de 3×480×640). La salida es un vector de acción de 7 dimensiones. El modelo se apoya en un transformer con codificación visual y decodificación de acciones, tal como se describe en el paper arXiv:2304.13705.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `YunBeen1205/pnp_cube_model1_merged`: 20 episodios, 26.951 fotogramas a 30 FPS, una única tarea de pick-and-place. La configuración reportada es de 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni ninguna fase de refinamiento por preferencias; es aprendizaje supervisado puro a partir de demostraciones teleoperadas. Tampoco se detalla la composición del dataset más allá del número de episodios y la tarea.

## Capacidades

- Control visomotor de pick-and-place: predice acciones de 7 dimensiones para coger un cubo y colocarlo en un plato.
- Aprendizaje por imitación de extremo a extremo a partir de demostraciones teleoperadas.
- Predicción de chunks de acción, lo que reduce el jitter y mejora la estabilidad del movimiento frente a políticas paso a paso.
- Entrada multimodal: imagen RGB de muñeca más estado articular del robot.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, razonamiento multi-paso, ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo de razonamiento explícito (thinking), visión general, audio ni generación de texto.

## Casos de uso

- Automatización de pick-and-place en laboratorio: ejecutar la política sobre un `so102_follower` para coger un cubo y depositarlo en un plato, usando `lerobot-rollout` con `--strategy.type=base` y una duración acotada de 60 segundos.
- Base para reentrenamiento con nuevos objetos: partir de esta configuración (ACT, 20.000 pasos, lr 1e-5) y sustituir el dataset por uno propio para adaptar la tarea a otras geometrías o posiciones.
- Validación de pipelines de aprendizaje por imitación: usar el repositorio como referencia reproducible para comprobar que la instalación de LeRobot, la calibración del robot y la captura de cámara funcionan antes de escalar a tareas más complejas.
- Docencia y demostraciones: ejemplo mínimo (0,2 GB, 51,7 M de parámetros) para explicar ACT y el flujo completo de LeRobot en cursos de robótica o visión artificial.
- Benchmark interno de hardware: medir latencia y throughput de una política ligera en distintas GPU antes de invertir en modelos mayores.
- Prototipado de control con cámara de muñeca: evaluar si una única cámara en el efector es suficiente para tareas de manipulación simples en el setup `so102_follower`.
- Pruebas de robustez ante cambios de iluminación o posición: al no haber evaluación publicada, sirve como caso de estudio para medir la degradación de una política entrenada con solo 20 episodios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación vacía con la nota explícita «No evaluation results have been provided for this policy yet», por lo que no existen tasas de éxito, número de ensayos ni métricas de control reportadas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors, el peso de los pesos ronda los 0,2 GB, por lo que la VRAM necesaria es muy reducida (del orden de 1-2 GB incluyendo activaciones y buffers de imagen a 480×640).
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; el cuello de botella será la captura de cámara y el bucle de control a 30 FPS, no el modelo.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier RTX o incluso en iGPU/CPU para inferencia, aunque no hay datos oficiales de latencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=...`), que internamente usa PyTorch; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput estimados: no disponibles; el dataset y la política están configurados a 30 FPS, pero no se publica latencia medida.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pnp_cube_model1_merged_act_policy | 51,7 M | Pick-and-place (cubo a plato) | no aplica | Apache 2.0 | Hub, 0 descargas |
| Otras políticas ACT en LeRobot Hub | variable | Tareas de manipulación diversas | no aplica | variable | Hub |
| Políticas Diffusion Policy (LeRobot) | variable | Manipulación visomotora | no aplica | variable | Hub |
| Políticas SmolVLA (LeRobot) | variable | Manipulación con instrucciones en lenguaje | no aplica | variable | Hub |

No se dispone de datos de rendimiento comparativo (tasas de éxito, latencia) para este modelo ni para las alternativas citadas en la información proporcionada, por lo que la comparación se limita a parámetros, tarea y licencia.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay evidencia de tasa de éxito en robot real; el autor no ha reportado ensayos ni resultados.
- Dataset muy pequeño: solo 20 episodios y 26.951 fotogramas, lo que limita la generalización a variaciones de posición, iluminación u objetos.
- Tarea única y cerrada: entrenada exclusivamente para «Pick up the cube and place it on the plate»; no es reutilizable para otras tareas sin reentrenamiento.
- Dependencia de hardware específico: robot `so102_follower` y cámara `cam_wrist`; los nombres de cámara deben coincidir con las claves de observación del entrenamiento.
- Sin capacidades de lenguaje: no procesa texto, no soporta tool calling ni agentes; no debe evaluarse con benchmarks de LLM.
- Riesgo de sobreajuste y alucinación motora: con tan pocos episodios, la política puede producir acciones erráticas ante estados no vistos.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria.
- Idiomas: no aplica; cualquier expectativa multilingüe es irrelevante para este modelo.

## Enlaces

- Hugging Face: https://huggingface.co/YunBeen1205/pnp_cube_model1_merged_act_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/YunBeen1205/pnp_cube_model1_merged
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=YunBeen1205/pnp_cube_model1_merged
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
