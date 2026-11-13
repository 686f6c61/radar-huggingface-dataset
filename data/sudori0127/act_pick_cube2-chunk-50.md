# sudori0127/act_pick_cube2-chunk-50

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales, lo que reduce el error de acumulación en tareas de manipulación robótica. Este repositorio concreto, `sudori0127/act_pick_cube2-chunk-50`, es una política entrenada con LeRobot sobre el robot `so_follower` (SO-100/SO-101) para la tarea "Grab the black cube", usando dos cámaras (overhead y wrist) y un vector de estado de 6 dimensiones.

El modelo tiene 51.617.414 parámetros (unos 51,6 M) y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras que pueden ejecutarse en tiempo real en hardware de consumo. Se distribuye bajo licencia Apache 2.0 en formato safetensors y se carga mediante la librería `lerobot`.

Su relevancia es práctica: sirve como ejemplo reproducible de un pipeline completo de imitación (dataset de 51 episodios y 22.099 fotogramas a 30 FPS, entrenamiento de 100.000 pasos con AdamW y lr 1e-5) y como punto de partida para quien quiera replicar la tarea o adaptar el flujo a su propio robot. No es un modelo de lenguaje: es una política visuomotora específica de tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de acciones |
| Parametros totales | 51.617.414 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; usa ventana de observación de imágenes y estado) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que, en lugar de predecir una única acción por paso, predice un chunk de acciones futuras. La política consume `observation.state` (vector de 6 dimensiones), dos imágenes RGB de 480x640 (`overhead` y `wrist`) y produce un vector de acción de 6 dimensiones. El modelo se entrenó con el dataset `sudori0127/pick-cube2`: 51 episodios, 22.099 fotogramas a 30 FPS, tarea "Grab the black cube".

La configuración de entrenamiento documentada es de 100.000 pasos, batch size 64, optimizador AdamW con learning rate 1e-5 y semilla 1000, usando LeRobot 0.6.0. No se especifican en la model card detalles sobre aumentos de datos, composición exacta del dataset ni si hubo fases de refinamiento posteriores. El nombre del repositorio sugiere un chunk de 50 acciones, aunque este dato no se confirma explícitamente en la información disponible.

## Capacidades

- Control visuomotor para manipulación robótica: genera comandos de acción de 6 dimensiones a partir de estado y dos vistas de cámara.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Predicción de chunks de acciones para reducir el error compuesto y mejorar la suavidad del movimiento.
- Ejecución en tiempo real sobre el robot `so_follower` mediante `lerobot-rollout`.
- Entrada multimodal: estado proprioceptivo (6,) más dos imágenes RGB (3, 480, 640).
- Tarea única y específica: "Grab the black cube".
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.

## Casos de uso

- Replicación de la tarea de picking: ejecutar la política sobre un SO-100/SO-101 con dos cámaras configuradas como `overhead` y `wrist` para recoger un cubo negro, usando `lerobot-rollout` con `--policy.path=sudori0127/act_pick_cube2-chunk-50`.
- Punto de partida para fine-tuning: reentrenar con `lerobot-train` sobre un dataset propio de picking y comparar hiperparámetros (pasos, batch, lr) frente a esta referencia.
- Validación de hardware y calibración: usar la política como prueba de humo para verificar que cámaras, puerto del robot y frecuencias (30 FPS) están correctamente configurados antes de grabar datos nuevos.
- Docencia y demostraciones de imitación: ejemplo mínimo y ligero (0,2 GB) para explicar el pipeline completo de LeRobot en cursos o talleres.
- Investigación en chunking de acciones: comparar el comportamiento con distintos tamaños de chunk y estudiar el efecto en la tasa de éxito y la suavidad.
- Integración en pipelines de evaluación automatizada: ejecutar la política en entornos controlados para medir robustez ante cambios de iluminación o posición del objeto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros y pesos en safetensors de 0,2 GB, el modelo es muy ligero y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM debería ser suficiente, incluidas RTX 3060/4060 y superiores.
- Cabe en GPU de consumo: sí, por el tamaño del modelo (0,2 GB de repositorio).
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para entrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La ejecución está pensada para operar a 30 FPS según la frecuencia del dataset.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_pick_cube2-chunk-50 (este) | 51,6 M | no aplica | Picking de cubo con SO follower | apache-2.0 | Hugging Face |
| Otras políticas ACT en LeRobot Hub | no disponible | no aplica | Manipulación diversa | variable | Hugging Face |
| Políticas Diffusion Policy en LeRobot | no disponible | no aplica | Manipulación diversa | variable | Hugging Face |

No se dispone de datos comparativos de rendimiento entre esta política y alternativas concretas en la información proporcionada.

## Limitaciones y advertencias

- Tarea única: entrenada exclusivamente para "Grab the black cube"; no generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluación publicados: no hay tasas de éxito medidas, por lo que el rendimiento real es desconocido.
- Dataset pequeño: 51 episodios y 22.099 fotogramas; riesgo de sobreajuste y baja robustez ante cambios de iluminación, posición del objeto o distractores.
- Dependencia de configuración exacta: requiere robot `so_follower`, dos cámaras con nombres `overhead` y `wrist`, resolución 480x640 y 30 FPS.
- Sin capacidades lingüísticas ni de razonamiento: no es un LLM y no admite tool calling ni agentes.
- Riesgo de fallo en producción si el entorno difiere del de entrenamiento; no se documentan sesgos específicos, pero la política hereda los sesgos de las demostraciones.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace recomendable validar antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/sudori0127/act_pick_cube2-chunk-50
- Dataset: https://huggingface.co/datasets/sudori0127/pick-cube2
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sudori0127/pick-cube2
