# szymmon/act_so101_marker_held_out

## Resumen

`act_so101_marker_held_out` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT) sobre el robot `so_follower` (SO-101) y publicada en el Hub mediante la librería LeRobot. No es un modelo de lenguaje: es un controlador visomotor que, a partir de tres cámaras (izquierda, derecha y pinza) y del estado articular de 6 dimensiones, predice directamente una acción de 6 dimensiones para el brazo. El autor es el usuario `szymmon` y el modelo se publicó en noviembre de 2026.

El modelo resuelve una tarea concreta y única: «Grab the marker and place it in the container». Se entrenó sobre un dataset de 55 episodios teleoperados (54 937 fotogramas a 30 FPS) y cuenta con 51 668 614 parámetros en formato safetensors. Su relevancia es la de un artefacto reproducible de aprendizaje por imitación: demuestra el flujo completo de LeRobot (grabación, entrenamiento, publicación y despliegue) para un robot de bajo coste, aunque con un alcance funcional muy limitado y sin evaluación publicada.

La ficha se centra en lo que el repositorio documenta. La licencia, los idiomas y los resultados de benchmarks no están disponibles, y la model card no incluye ninguna tabla de evaluación en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51 668 614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de 3 imágenes 3x480x640 y estado de 6 dimensiones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 0,2 GB) |
| Robot | `so_follower` (SO-101) |
| Cámaras de entrada | `cam_left`, `cam_right`, `cam_gripper` |
| Entrada de estado | `observation.state`, forma (6,) |
| Salida | `action`, forma (6,) |
| Dataset de entrenamiento | `szymmon/pick_marker_20261124_175335_held_out_training` |
| Episodios / fotogramas | 55 / 54 937 a 30 FPS |
| Pasos de entrenamiento | 18 000 |
| Batch size | 32 |
| Optimizador / LR / semilla | adamw / 1e-05 / 1000 |
| Versión de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos cortos de acción (*action chunks*) en lugar de pasos individuales, lo que reduce el error de acumulación y suaviza el control. La red combina un codificador de imágenes (tres vistas de 480x640) con un codificador del estado articular y un decodificador transformer que emite la secuencia de acciones de 6 dimensiones. La model card no detalla la configuración interna de capas, dimensiones ocultas ni el número de pasos del chunk.

El entrenamiento se realizó con `lerobot-train` durante 18 000 pasos, batch de 32, optimizador AdamW y tasa de aprendizaje 1e-05, sobre 55 episodios teleoperados de la tarea de recoger un rotulador y depositarlo en un contenedor. No se documenta el uso de RLHF, DPO ni ningún ajuste posterior; es aprendizaje supervisado puro a partir de demostraciones. Tampoco se indica composición del dataset más allá del número de episodios y fotogramas, ni aumentos de datos o variaciones de iluminación y posiciones.

## Capacidades

- Control visomotor de un brazo SO-101 (`so_follower`) con 6 grados de libertad.
- Percepción a partir de tres cámaras simultáneas: vista izquierda, vista derecha y cámara en la pinza.
- Predicción de acciones en chunks, lo que permite movimientos más estables que un control paso a paso.
- Ejecución de una única tarea de manipulación: agarrar un rotulador y colocarlo en un contenedor.
- Despliegue mediante `lerobot-rollout` con la estrategia `base` (sin grabación de episodios).
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión general, audio ni capacidades multilingües.

## Casos de uso

- Reproducción de un pipeline de imitación completo: sirve como referencia para validar la instalación de LeRobot, la calibración del SO-101 y la grabación de datos antes de entrenar políticas propias.
- Recogida automatizada de objetos pequeños en un entorno controlado: el modelo ejecuta la secuencia de agarre y depósito del rotulador, útil como demostración de pick-and-place en laboratorio o aula.
- Base para *fine-tuning*: al estar entrenado sobre 55 episodios, puede servir como inicialización para tareas similares de manipulación con el mismo robot y cámaras.
- Evaluación de infraestructura de inferencia robótica: permite medir latencia y estabilidad del bucle de control a 30 FPS con `lerobot-rollout` en una GPU de consumo.
- Docencia y divulgación: ejemplo concreto y descargable de ACT para explicar aprendizaje por imitación, chunking de acciones y teleoperación.
- Pruebas de robustez ante cambios de cámara o iluminación: al no haber evaluación publicada, es un caso de uso para medir la degradación del modelo fuera de las condiciones de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: «No evaluation results have been provided for this policy yet», y no incluye tabla de ensayos, éxitos ni tasa de acierto en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación; con 51,7 M de parámetros en FP32 el peso ocupa aproximadamente 0,2 GB, por lo que la VRAM vendrá dominada por los buffers de las tres imágenes de 480x640 y el grafo de inferencia, no por el modelo.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU con soporte CUDA y suficiente memoria para el *forward pass* de tres cámaras debería bastar; una RTX 4090 o superior ofrece margen amplio.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo; el autor no publica requisitos mínimos.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) según la model card; el ecosistema LeRobot permite entrenamiento con `lerobot-train` en CUDA. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS, pero no se publica la latencia de inferencia ni el rendimiento del bucle de control.

## Comparativa con modelos similares

| Modelo | Método | Parámetros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `szymmon/act_so101_marker_held_out` | ACT | 51,7 M | 3 cámaras + estado (6,) | Recoger rotulador | no disponible | Hub de Hugging Face |
| Políticas ACT de referencia en LeRobot | ACT | no disponible | variables | múltiples tareas de imitación | según repositorio | Hub de Hugging Face |
| Políticas Diffusion Policy en LeRobot | Diffusion Policy | no disponible | variables | manipulación por imitación | según repositorio | Hub de Hugging Face |
| Políticas π0 / VLA de gran escala | VLA | no disponible | imágenes + lenguaje | manipulación generalista | según repositorio | Hub de Hugging Face |

No se dispone de datos de rendimiento comparables para este modelo, por lo que la comparativa se limita a método, tamaño y disponibilidad. No se han publicado métricas de éxito que permitan situarlo frente a alternativas.

## Limitaciones y advertencias

- Alcance funcional mínimo: entrenado para una sola tarea («Grab the marker and place it in the container») y un solo robot (`so_follower`); no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasa de éxito, número de ensayos ni condiciones de prueba, por lo que se desconoce su fiabilidad real.
- Dataset pequeño: 55 episodios y 54 937 fotogramas; probable sobreajuste a posiciones, iluminación y disposición concretas del entorno de grabación.
- Dependencia de las cámaras: las claves de observación (`cam_left`, `cam_right`, `cam_gripper`) deben coincidir exactamente con las del entrenamiento; un cambio de montaje o de índice de cámara invalida la política.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no disponibles: irrelevante para el modelo, pero la model card no documenta ningún metadato lingüístico.
- Riesgo de alucinación en el sentido de acciones incorrectas: como toda política de imitación, puede ejecutar movimientos fuera de distribución ante objetos o posiciones no vistas.
- Sin datos de sesgos: no se documentan sesgos demográficos ni de otro tipo, aunque el modelo opera sobre imágenes y podría heredar sesgos del dataset de demostración.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/szymmon/act_so101_marker_held_out
- Dataset de entrenamiento: https://huggingface.co/datasets/szymmon/pick_marker_20261124_175335_held_out_training
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=szymmon/pick_marker_20261124_175335_held_out_training
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
