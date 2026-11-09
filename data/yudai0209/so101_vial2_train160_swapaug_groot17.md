# yudai0209/so101_vial2_train160_swapaug_groot17

## Resumen

`yudai0209/so101_vial2_train160_swapaug_groot17` es una política de robótica entrenada mediante aprendizaje por imitación con LeRobot sobre la arquitectura GR00T N1.7 de NVIDIA, un modelo fundacional abierto y cross-embodiment para razonamiento y habilidades en robots humanoides. El modelo resuelve una tarea concreta de manipulación: recoger un vial (blanco o azul) y depositarlo en uno de cuatro orificios identificados por su posición desde la derecha, usando un robot `so_follower` (SO-101) con dos cámaras (overhead y wrist).

La política combina un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow-matching que predice acciones condicionadas por visión, lenguaje y propiocepción. El checkpoint aquí publicado es un ajuste específico sobre un dataset propio de 160 episodios y 95.178 frames a 30 FPS, no el modelo fundacional completo.

Es relevante porque demuestra el flujo completo de LeRobot para adaptar un modelo fundacional de robótica a una tarea de pick-and-place con instrucciones en lenguaje natural, con licencia Apache 2.0 y pesos en safetensors, lo que facilita su reproducción y despliegue en hardware asequible tipo SO-101.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow-matching |
| Parametros totales | 3.144.016.000 (3,14 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 12,6 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GR00T N1.7 de NVIDIA: un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL que procesa observaciones visuales e instrucciones en lenguaje natural, y un transformer de acciones con flow-matching que genera las acciones del robot condicionadas por visión, lenguaje y propiocepción. La política consume `observation.state` de dimensión 6, dos imágenes RGB de 3x480x640 (cámaras overhead y wrist) y produce un vector de acción de dimensión 6 para el robot `so_follower`.

El ajuste se realizó sobre el dataset `yudai0209/so101_vial2_train160_swapaug` (160 episodios, 95.178 frames a 30 FPS) con 8 tareas de lenguaje que combinan color de vial (blanco/azul) y orificio destino (1.º a 4.º desde la derecha). La configuración de entrenamiento reportada es: 20.000 pasos, batch size 32, optimizador AdamW, learning rate 1e-4, semilla 42 y LeRobot 0.6.1. No se detalla en la información disponible el volumen total de tokens, la composición completa del dataset ni si hubo etapas de RLHF/DPO.

## Capacidades

- Manipulación robótica pick-and-place condicionada por instrucciones en lenguaje natural (8 variantes de tarea sobre vial y orificio destino).
- Percepción visual multimodal mediante dos cámaras (overhead y wrist) a resolución 480x640.
- Fusión de visión, lenguaje y propiocepción para predecir acciones de 6 grados de libertad.
- Ejecución de políticas de imitación en tiempo real a 30 FPS sobre el robot SO-101 (`so_follower`).
- Seguimiento de instrucciones de tarea en inglés con referencias espaciales ("1st hole from the right", etc.).
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No se documentan capacidades de tool calling, agentes multi-paso, audio ni thinking mode en la información disponible.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo recoge viales y los inserta en posiciones específicas de una gradilla, adecuado para tareas repetitivas de manipulación de muestras con instrucciones en lenguaje natural.
- Clasificación y ordenación de objetos por color y posición: las 8 tareas entrenadas cubren combinaciones de vial blanco/azul y cuatro orificios, útil en líneas de selección sencillas.
- Prototipado rápido de políticas robóticas con LeRobot: sirve como punto de partida para fine-tuning sobre nuevos datasets usando `lerobot-train` con `--policy.type=groot`.
- Investigación en aprendizaje por imitación: el checkpoint permite reproducir el pipeline completo (grabación, entrenamiento, rollout) en hardware SO-101 asequible.
- Benchmark de modelos fundacionales de robótica: útil para comparar el rendimiento de GR00T N1.7 frente a otras políticas en tareas de manipulación de precisión con dos cámaras.
- Educación y demos de robótica: la licencia Apache 2.0 y la integración con LeRobot facilitan su uso en cursos y talleres con robots de bajo coste.
- Validación de aumento de datos (swap augmentation): el nombre del dataset sugiere experimentación con aumentos de imagen; el checkpoint permite evaluar su efecto en la tasa de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 3,14 mil millones de parámetros en safetensors y repo de 12,6 GB, se requiere una GPU con memoria suficiente para cargar los pesos completos (orientativamente por encima de 12 GB en FP16, aunque este dato no está confirmado en la fuente).
- GPU recomendadas: no especificadas por el autor; el comando de entrenamiento usa `--policy.device=cuda` sin modelo concreto.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño de pesos sugiere que tarjetas con 16-24 GB podrían ser viables, pero no hay dato oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento); no se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles; el dataset y las cámaras operan a 30 FPS, pero no se reporta la latencia de inferencia de la política.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101_vial2_train160_swapaug_groot17 (este) | 3,14 mil M | no disponible | Pick-and-place de viales con SO-101 | Apache 2.0 | Hugging Face |
| GR00T N1.7 (modelo base NVIDIA) | no disponible | no disponible | Modelo fundacional cross-embodiment para humanoides | no disponible en la fuente | GitHub NVIDIA/Isaac-GR00T |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | Manipulación por imitación | según checkpoint | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: solo cubre 8 tareas concretas de vial y orificio; no generaliza a otros objetos, posiciones o entornos sin reentrenamiento.
- Sin resultados de evaluación publicados: no hay tasas de éxito medidas, lo que impide estimar su fiabilidad en producción.
- Dependencia de hardware y calibración: requiere un robot `so_follower` con dos cámaras en posiciones concretas (overhead y wrist) y nombres de cámara que coincidan con las claves de observación.
- Sesgos y alucinaciones: no documentados por el autor; en robótica, los fallos se manifiestan como acciones incorrectas o inseguras más que como texto alucinado.
- Limitaciones de idioma: las instrucciones de tarea están en inglés; no se documenta soporte multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base GR00T N1.7 y las dependencias de LeRobot pueden tener condiciones adicionales que deben verificarse.
- Caveat de producción: al ser un checkpoint de investigación con 0 descargas y 0 likes, no hay evidencia de uso en entornos reales; se recomienda validación exhaustiva antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yudai0209/so101_vial2_train160_swapaug_groot17
- Dataset de entrenamiento: https://huggingface.co/datasets/yudai0209/so101_vial2_train160_swapaug
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=yudai0209/so101_vial2_train160_swapaug
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
