# Tridex/model_act_3cam_resnet_100K_17_11_sb_8_2

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para control robótico que predice fragmentos cortos de acciones (*action chunks*) en lugar de pasos individuales, lo que reduce el error de composición acumulado y mejora la estabilidad de las políticas entrenadas con datos de teleoperación. Este repositorio concreto, `Tridex/model_act_3cam_resnet_100K_17_11_sb_8_2`, es una política ACT entrenada con LeRobot 0.6.2 sobre un robot `so_follower` (SO-100/SO-101 de bajo coste) con tres cámaras RGB (front, side, top) y un estado proprioceptivo de 6 dimensiones.

El modelo resuelve una tarea única y muy específica: "take the yellow fluo and drop it inside the pink box" (coger el rotulador fluorescente amarillo y dejarlo dentro de la caja rosa). Se entrenó durante 100.000 pasos con batch size 8, optimizador AdamW y learning rate 1e-5 sobre un dataset de 40 episodios y 19.028 fotogramas a 30 FPS. Con 51,7 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo ligero pensado para inferencia en tiempo real en hardware de consumo.

Su relevancia es la de un ejemplo reproducible de política visomotora de extremo a extremo para manipulación robótica de bajo coste: no es un modelo de lenguaje ni un modelo fundacional generalista, sino un artefacto de investigación aplicada que demuestra el flujo completo de LeRobot (grabación de datos, entrenamiento y despliegue con `lerobot-rollout`). La licencia Apache 2.0 permite reutilización comercial del artefacto, aunque los datos y el entorno físico condicionan fuertemente su validez.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador visual ResNet y decodificador de acciones con chunking |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación definida por el chunking de acciones, no documentada en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo de robótica; no procesa lenguaje natural, solo la instrucción de tarea como cadena de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT combina un *backbone* visual (ResNet, según el nombre del repositorio) que procesa tres cámaras RGB de 480x640 junto con el estado proprioceptivo de 6 dimensiones, y un transformer encoder-decoder que genera un *chunk* de acciones de 6 dimensiones. La predicción por chunks mitiga el problema de la varianza en la predicción paso a paso y permite un control más suave y consistente. El modelo se entrenó con el pipeline de LeRobot 0.6.2, con 100.000 pasos, batch size 8, AdamW, learning rate 1e-5 y semilla 1000.

Los datos provienen del dataset `Tridex/40_fluo_9h36_17-11_20261117_093732`: 40 episodios de teleoperación, 19.028 fotogramas a 30 FPS, una única tarea y un único robot `so_follower`. No se documenta en la model card el uso de RLHF, DPO ni aumentos de datos; se trata de aprendizaje por imitación supervisado puro (behavior cloning con chunking). El nombre del repositorio sugiere un entrenamiento con 100K pasos, 3 cámaras, backbone ResNet, batch size 8 y una ejecución del 17 de noviembre (17_11), pero estos detalles no se confirman explícitamente más allá de la configuración declarada.

## Capacidades

- Control visomotor de manipulación robótica: genera comandos de acción de 6 dimensiones a partir de tres vistas RGB y del estado del robot.
- Aprendizaje por imitación de una tarea única: "take the yellow fluo and drop it inside the pink box".
- Predicción de *action chunks*: emite secuencias cortas de acciones en lugar de pasos aislados, lo que reduce la acumulación de error.
- Fusión multimodal de tres cámaras (front, side, top) con estado proprioceptivo de 6 dimensiones.
- Inferencia en tiempo real a 30 FPS mediante `lerobot-rollout` con `--strategy.type=base`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües: es una política de control, no un modelo generativo de propósito general.
- No dispone de modo *thinking*, visión general, audio ni generación de texto libre.

## Casos de uso

- Automatización de *pick-and-place* de laboratorio: recoger un objeto alargado (rotulador fluorescente) y depositarlo en un contenedor; el modelo está entrenado exactamente para esta tarea y puede desplegarse con `lerobot-rollout` sobre un SO-100/SO-101.
- Prototipado de flujos de imitación con LeRobot: sirve como referencia reproducible para validar la cadena completa de grabación, entrenamiento y despliegue antes de escalar a tareas propias.
- Docencia e investigación en robótica de bajo coste: permite demostrar *behavior cloning* con tres cámaras y un robot asequible, sin necesidad de GPUs de datacenter.
- *Benchmark* interno de infraestructura de inferencia: al ser un modelo de 51,7 M de parámetros y 0,2 GB, es útil para medir latencia y throughput de pipelines de control en tiempo real en hardware de consumo.
- Base para *fine-tuning* en tareas de recogida y depósito: el checkpoint puede reentrenarse con `lerobot-train` sobre datasets propios con el mismo esquema de observaciones (tres cámaras + estado de 6 dimensiones).
- Validación de calibración de cámaras y del robot: al depender de tres vistas concretas, sirve para comprobar que la calibración y la disposición física de las cámaras coinciden con las del entrenamiento.
- Demostraciones de manipulación en ferias o vídeos técnicos: la licencia Apache 2.0 y el tamaño reducido facilitan su uso en entornos divulgativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: *"No evaluation results have been provided for this policy yet"*. No hay tasas de éxito en robot real, ni comparaciones con otras políticas, ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; por el tamaño del checkpoint (0,2 GB en safetensors y 51,7 M de parámetros), la inferencia en FP32 requeriría del orden de 0,2-0,5 GB de VRAM para los pesos, más el coste de las activaciones de tres imágenes de 480x640.
- GPU recomendadas: no documentadas por el autor. Por el perfil del modelo, es razonable esperar que funcione en GPUs de consumo (RTX 3060/4060 o superiores) y en GPUs de datacenter (A100, H100) sin problema, pero no hay cifras publicadas.
- ¿Cabe en GPU de consumo? Sí, por tamaño de pesos; no hay confirmación oficial de latencia ni de FPS alcanzables.
- Opciones de despliegue: `lerobot-rollout` (documentado en la model card) y el ecosistema LeRobot; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. El dataset se grabó a 30 FPS, pero no se especifica si la política mantiene ese ritmo en inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Cámaras | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tridex/model_act_3cam_resnet_100K_17_11_sb_8_2 | 51,7 M | 3 (front, side, top) | Recoger rotulador y depositarlo en caja | apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| Otras políticas ACT de LeRobot | no disponible | variable | variable | habitualmente apache-2.0 | ecosistema LeRobot |
| Políticas basadas en Diffusion Policy | no disponible | variable | variable | variable | literatura robótica |
| Políticas basadas en VLA (p. ej. OpenVLA) | no disponible en esta ficha | variable | múltiples tareas | variable | investigación |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, configuración de sensores y licencia.

## Limitaciones y advertencias

- Especialización extrema: entrenado para una única tarea y un único entorno; no generaliza a otras tareas, objetos ni disposiciones de cámara sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su robustez ante cambios de iluminación, posiciones de objetos o distracciones.
- Dependencia del hardware: requiere un robot `so_follower` y tres cámaras con los nombres `front`, `side` y `top` exactamente como en el entrenamiento; cualquier cambio en la calibración o en la resolución degrada el comportamiento.
- Dataset pequeño: 40 episodios y 19.028 fotogramas son una base limitada; el riesgo de sobreajuste al entorno de grabación es alto.
- Sesgos: al ser aprendizaje por imitación, reproduce los sesgos y las imperfecciones de las demostraciones humanas (velocidad, trayectorias, agarre).
- Alucinación en sentido generativo: no aplica, pero sí puede producir acciones erráticas o inseguras si la observación se sale de la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial del artefacto, pero no se documentan garantías ni condiciones adicionales sobre los datos de entrenamiento.
- Sin soporte de lenguaje natural: la instrucción de tarea se pasa como cadena de texto, pero el modelo no la interpreta semánticamente; no es un VLA.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin demo ni vídeo de validación.

## Enlaces

- Hugging Face: https://huggingface.co/Tridex/model_act_3cam_resnet_100K_17_11_sb_8_2
- Dataset de entrenamiento: https://huggingface.co/datasets/Tridex/40_fluo_9h36_17-11_20261117_093732
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Tridex/40_fluo_9h36_17-11_20261117_093732
