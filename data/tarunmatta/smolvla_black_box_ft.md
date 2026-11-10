# tarunmatta/smolvla_black_box_ft

## Resumen

`tarunmatta/smolvla_black_box_ft` es un ajuste fino del modelo visión-lenguaje-acción (VLA) SmolVLA, desarrollado sobre la base `lerobot/smolvla_base` y publicado por el usuario tarunmatta en Hugging Face. SmolVLA es un modelo compacto y eficiente, presentado en el artículo arXiv 2506.01844, diseñado para control robótico de extremo a extremo a partir de observaciones visuales y del estado de las articulaciones, con capacidad de ejecutarse en hardware de consumo. Este ajuste concreto está especializado en una única tarea de manipulación: recoger una caja negra ("Pick up the black box").

El modelo tiene 450.046.176 parámetros (aproximadamente 450 millones) y se distribuye en formato safetensors con un tamaño de repositorio de 0,9 GB. Consume tres cámaras RGB de 256x256 píxeles y un vector de estado de 6 dimensiones, y produce un vector de acción de 6 dimensiones. Está pensado para el robot `so_follower` del ecosistema LeRobot, con cámaras de muñeca e izquierda.

Su relevancia radica en que demuestra el flujo completo de imitación en robótica con LeRobot: grabación de un dataset pequeño (40 episodios, 8848 fotogramas a 10 FPS), ajuste fino supervisado y despliegue mediante la CLI `lerobot-rollout`. Es un ejemplo práctico de cómo adaptar un VLA compacto a una tarea concreta con recursos limitados, aunque sus resultados de evaluación no están publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA), segun el articulo arXiv 2506.01844; detalles internos de capas no disponibles en la informacion proporcionada |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponibles (modelo orientado a acciones roboticas, no a texto general) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `lerobot/smolvla_base`, un VLA compacto que combina percepción visual, comprensión de instrucciones en lenguaje natural y generación de acciones motoras. La arquitectura concreta (número de capas, dimensiones ocultas, mecanismo de atención, codificador visual y de lenguaje) no se detalla en la información proporcionada; solo se indica que sigue el diseño SmolVLA descrito en el artículo arXiv 2506.01844. La entrada del policy son tres imágenes de 256x256 píxeles y un vector de estado de 6 valores; la salida es un vector de acción de 6 valores.

El entrenamiento se realizó por imitación supervisada sobre el dataset `tarunmatta/pick_up_black_box_smolvla`, compuesto por 40 episodios y 8848 fotogramas a 10 FPS de la tarea "Pick up the black box". La configuración reportada es de 20.000 pasos, batch size 4, optimizador AdamW, learning rate 1e-4, semilla 1000 y LeRobot 0.7.1. No se documentan fases de RLHF, DPO ni innovaciones adicionales más allá de las propias del método SmolVLA.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para el robot `so_follower` a partir de observaciones multimodales.
- Percepción visual multi-cámara: procesa tres flujos RGB de 256x256 píxeles (cámaras de muñeca e izquierda, según la model card).
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica mediante texto (`--task="Pick up the black box"`).
- Ejecución de políticas de imitación entrenadas con LeRobot, mediante `lerobot-rollout`.
- Despliegue en hardware de consumo, según la descripción del método SmolVLA.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, matemáticas, código ni generación de texto general; es un modelo específico de robótica.

## Casos de uso

- Recogida automatizada de objetos en un entorno controlado: el policy ejecuta la tarea "Pick up the black box" sobre un robot `so_follower`, usando tres cámaras y el estado de las articulaciones para generar acciones de 6 dimensiones.
- Prototipado rápido de flujos de imitación en robótica: sirve como referencia para grabar un dataset pequeño (40 episodios), ajustar SmolVLA y desplegar con `lerobot-rollout` en pocas horas.
- Investigación en aprendizaje por imitación: permite estudiar el comportamiento de un VLA de 450 millones de parámetros entrenado con 8848 fotogramas y 20.000 pasos, como línea base para comparar configuraciones.
- Docencia y formación en robótica con LeRobot: el modelo y su dataset asociado permiten reproducir el ciclo completo de captura, entrenamiento e inferencia con hardware asequible.
- Evaluación de robustez visual: al depender de tres cámaras, es útil para analizar cómo afectan cambios de iluminación, posición de objetos o distracciones en una política entrenada con datos limitados.
- Integración en pipelines de automatización de laboratorio: puede incorporarse como política de manipulación en estaciones de trabajo donde la tarea esté acotada y el entorno sea reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 millones de parámetros en safetensors, los pesos ocupan aproximadamente 0,9 GB en FP32, por lo que la inferencia cabe holgadamente en GPUs de consumo, aunque no se documentan requisitos exactos.
- GPU recomendadas: no disponible; el método SmolVLA se describe como desplegable en hardware de consumo.
- Cabe en GPU de consumo: sí, según la descripción del método base; no se especifican modelos concretos.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución y `lerobot-train` para reentrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tarunmatta/smolvla_black_box_ft | 450.046.176 | no disponible | Manipulacion robotica (pick up black box) | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en la informacion proporcionada | no disponible | VLA general base para ajuste fino | no disponible en la informacion proporcionada | Hugging Face |
| Otros VLA comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado únicamente para la tarea "Pick up the black box" con un robot `so_follower`; no generaliza a otras tareas ni robots sin reentrenamiento.
- Dataset muy reducido: 40 episodios y 8848 fotogramas a 10 FPS, lo que limita la robustez ante variaciones de iluminación, posición de objetos o distracciones.
- Sin evaluación publicada: no hay tasas de éxito ni pruebas en robot real, por lo que se desconoce su fiabilidad en producción.
- Dependencia de hardware específico: requiere el robot `so_follower` y tres cámaras con nombres e índices que coincidan con las claves de observación del entrenamiento.
- Sin datos de sesgos, alucinación o rendimiento multilingüe: no aplica el análisis habitual de modelos de lenguaje; no se documentan sesgos conocidos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación recae en el integrador.
- Idiomas no disponibles: la instrucción de tarea se pasa en texto, pero no se documenta soporte multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tarunmatta/smolvla_black_box_ft
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/tarunmatta/pick_up_black_box_smolvla
- Articulo SmolVLA: https://huggingface.co/papers/2506.01844
- Guia SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=tarunmatta/pick_up_black_box_smolvla
