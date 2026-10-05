# WetLabRoboData/diffusion-funnel-scratch

## Resumen

`diffusion-funnel-scratch` es una policy de robótica basada en modelos de difusión, publicada por el usuario `WetLabRoboData` dentro del ecosistema LeRobot. No es un modelo de lenguaje: se trata de un controlador visomotor entrenado por imitación (imitation learning) para ejecutar la tarea concreta denominada "funnel" con un robot bimanual UR3e equipado con tres cámaras. La variante "scratch" indica que se ha entrenado únicamente con los datos de esa tarea, sin partir de un modelo base preentrenado.

El modelo tiene 262.813.047 parámetros (unos 262,8 millones) y se distribuye en formato safetensors dentro de un repositorio de 1,1 GB, lo que es coherente con pesos en fp32. La model card reporta una evaluación de 20 episodios con 15 éxitos, es decir, una tasa de éxito del 75 % en la tarea de inserción del embudo.

Su relevancia es acotada pero clara para el ámbito de la robótica de laboratorio: demuestra un flujo de trabajo completo de LeRobot (dataset, entrenamiento, evaluación con vídeos de rollout) para una tarea de manipulación bimanual con inserción de precisión, y libera los pesos bajo licencia Apache 2.0, lo que permite reutilizarlos o compararlos con otras policies. No hay información pública sobre arquitectura interna detallada, número de tokens ni composición exacta del dataset más allá de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Policy de difusión de LeRobot (DiffusionPolicy); red generativa condicionada por observaciones visuales y de estado, con predicción de secuencias de acciones (action chunking). No es un transformer de lenguaje |
| Parametros totales | 262.813.047 (~262,8 M) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable; la policy usa un horizonte de observación y un horizonte de predicción de acciones cuyos valores concretos no están disponibles |
| Tipos de cuantizacion | pesos publicados en safetensors (compatible con fp32, ~1,05 GB); no se publican variantes GGUF, INT8 ni INT4 |
| Idiomas soportados | no aplicable (policy robótica; no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato LeRobot); repositorio de 1,1 GB |

## Arquitectura y entrenamiento

La familia DiffusionPolicy de LeRobot sigue el paradigma de "Diffusion Policy: Visuomotor Policy Learning via Action Diffusion" (Chi et al., 2023): en lugar de regresar directamente una acción, el modelo aprende a invertir un proceso de difusión que parte de ruido gaussiano y lo convierte, paso a paso, en una secuencia coherente de acciones. Las observaciones (imágenes de las tres cámaras y estado del robot) se codifican y se inyectan como condicionamiento en cada paso de denoising. En inferencia se suele emplear un muestreo acelerado tipo DDIM con un número reducido de pasos, y el modelo predice un bloque de acciones (horizonte de acción) que se ejecuta en bucle cerrado. Los hiperparámetros concretos de esta instancia (número de pasos de difusión, horizonte de predicción, resolución de imagen, configuración de los encoders visuales) no están disponibles en la información proporcionada.

El entrenamiento es de imitación supervisada (behavior cloning) sobre el dataset `WetLabRoboData/lerobot-data-funnel`, no hay indicios de RLHF, DPO ni ajuste por refuerzo. La model card indica que el modelo se reorganizó el 2026-10-04 a partir de `WetLabRoboData/lerobot-data-funnel_insert_reactor`, y que los artefactos originales de entrenamiento (checkpoints, `train_config.json`, `wandb/`) se conservan en la subcarpeta `old/` del repositorio de origen para trazabilidad. El número de episodios de entrenamiento, la composición del dataset y la duración total de las demostraciones no están disponibles.

## Capacidades

- Generación de secuencias de acciones motoras (action chunks) para control bimanual de un robot UR3e.
- Condicionamiento multimodal: consume tres flujos de cámara más el estado propioceptivo del robot.
- Ejecución de una tarea de manipulación concreta: la inserción del elemento denominado "funnel" (la procedencia apunta a "insert_reactor", lo que sugiere una inserción en un reactor dentro de un flujo de laboratorio húmedo).
- Tolerancia a variaciones menores de posicionamiento, propia de las policies de difusión multimodales, dentro de la distribución de entrenamiento.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso simbólico ni uso como agente conversacional.
- No procesa lenguaje natural ni instrucciones textuales.
- No dispone de modo "thinking", ni capacidades de visión general, audio o generación de imágenes.

## Casos de uso

- Automatización de inserción de precisión en laboratorio húmedo: la policy ejecuta la secuencia de aproximación, alineación e inserción del embudo en el reactor; es adecuada porque el entrenamiento por imitación captura las trayectorias finas que un controlador clásico difícilmente modela con tolerancias subcentimétricas.
- Manipulación bimanual coordinada: al estar entrenada sobre un UR3e bimanual, puede emplearse para tareas donde las dos extremidades deben coordinarse (sujetar y ensamblar), un escenario donde los planners tradicionales requieren ingeniería específica por tarea.
- Base de comparación ("baseline") en investigación de imitation learning: sirve como referencia reproducible para medir el efecto de cambios de dataset, aumentos de datos o variantes de policy sobre una misma tarea de inserción.
- Punto de partida para fine-tuning en tareas de laboratorio relacionadas: aunque esta variante es "scratch", los pesos pueden reutilizarse como inicialización para tareas de inserción análogas, reduciendo el número de demostraciones necesarias.
- Evaluación de pipelines de LeRobot: el repositorio de evaluación con vídeos de rollout y resultados por episodio permite validar infraestructura de entrenamiento, despliegue y logging en un caso real.
- Despliegue en celdas de laboratorio con estaciones repetitivas: al ser una policy de tarea única y estable, encaja en puestos donde la variabilidad del entorno es baja y se busca repetibilidad con supervisión humana.
- Generación de datos sintéticos de trayectorias: el modelo puede emplearse para producir rollouts que amplíen el dataset original antes de reentrenar, siempre que se filtren por éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado es la evaluación de la propia tarea:

| Metrica | Valor |
|---|---|
| Tarea | funnel |
| Episodios de evaluacion | 20 |
| Exitos | 15 / 20 |
| Tasa de exito | 75 % |
| Robot | UR3e bimanual (3 camaras) |

No hay resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar, ya que no son aplicables a una policy robótica. Tampoco se proporcionan métricas de precisión de acción (error de posición final, tasa de colisión) ni comparaciones con otras policies.

## Requisitos de hardware

- VRAM estimada para los pesos: ~1,05 GB en fp32 (262,8 M de parámetros). A ello hay que sumar las activaciones, los tres codificadores visuales y los búferes de las imágenes de entrada, cuyo consumo exacto no está disponible.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 o superiores, así como en GPUs de datacenter (A100, H100, L40S).
- También es viable la inferencia en CPU para validación, aunque con latencias mayores y no cuantificadas en la información disponible.
- Opciones de despliegue: la vía oficial es la librería LeRobot (`DiffusionPolicy.from_pretrained("WetLabRoboData/diffusion-funnel-scratch")`) sobre PyTorch. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Para producción se puede exportar a ONNX o TensorRT y evaluar cuantización a fp16/INT8, aunque el autor no publica estos artefactos.
- Latencia y throughput estimados: no disponibles. La latencia vendrá determinada principalmente por el número de pasos de muestreo de difusión, la resolución de las tres cámaras y el coste del bucle de control del robot, no por el tamaño del modelo.

## Comparativa con modelos similares

No hay datos comparativos publicados en la información proporcionada. A modo cualitativo, las alternativas dentro del mismo ecosistema LeRobot son otras familias de policy de imitación con licencia permisiva:

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diffusion-funnel-scratch | Policy de difusion (LeRobot) | 262,8 M | no aplicable | apache-2.0 | pesos en safetensors |
| ACT (Action Chunking Transformer, LeRobot) | Transformer de action chunking | no disponible | no disponible | no disponible | implementacion en LeRobot |
| SmolVLA (LeRobot) | Vision-language-action | no disponible | no disponible | no disponible | pesos publicos de referencia |
| Diffusion Policy original (Chi et al.) | Policy de difusion | no disponible | no disponible | no disponible | codigo de referencia |

Las cifras de rendimiento de estas alternativas sobre la tarea "funnel" no están disponibles, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Policy de tarea única: la variante "scratch" se entrenó solo con datos de la tarea "funnel", por lo que no generaliza a otras tareas sin reentrenamiento o fine-tuning.
- Sesgo de distribución: al depender de demostraciones de un único entorno de laboratorio, es sensible a cambios de iluminación, posición de cámara, tipo de objeto o disposición de la celda de trabajo.
- Tasa de fallo del 25 % en la evaluación reportada (5 de 20 episodios fallidos), lo que exige supervisión humana o mecanismos de recuperación en producción.
- Riesgo de alucinación en sentido estricto no aplicable, pero sí existe riesgo de acciones erráticas o inseguras cuando la observación se sale de la distribución de entrenamiento, algo crítico en un robot físico.
- Sin información sobre idiomas porque no es un modelo de lenguaje.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia; no se indican restricciones adicionales.
- No se publican variantes cuantizadas ni artefactos de despliegue listos para producción (ONNX, TensorRT).
- No hay datos sobre composición del dataset de entrenamiento, número de episodios ni validación fuera de distribución.
- Los metadatos indican creación y actualización en 2026-10-04; conviene verificar la vigencia y el estado del repositorio antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WetLabRoboData/diffusion-funnel-scratch
- Dataset de entrenamiento: https://huggingface.co/datasets/WetLabRoboData/lerobot-data-funnel
- Dataset de evaluación (vídeos de rollout y resultados por episodio): https://huggingface.co/datasets/WetLabRoboData/eval-diffusion-funnel-scratch
- Repositorio de origen con artefactos de entrenamiento archivados: https://huggingface.co/WetLabRoboData/lerobot-data-funnel_insert_reactor
- Curso sobre flow matching y modelos de difusión (MIT, 2026, material general no específico del modelo): https://diffusion.csail.mit.edu/2026/index.html
- Introducción general a modelos de difusión (no específico del modelo): https://www.geeksforgeeks.org/artificial-intelligence/what-are-diffusion-models/
- Implementación educativa de un modelo de difusión desde cero (no específico del modelo): https://github.com/ZoreAnuj/Diffusion-Model-From-Scratch
