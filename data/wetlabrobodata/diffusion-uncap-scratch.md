# WetLabRoboData/diffusion-uncap-scratch

## Resumen

`diffusion-uncap-scratch` es una política robótica de imitación basada en modelos de difusión, publicada por el usuario WetLabRoboData dentro del ecosistema LeRobot de Hugging Face. No es un modelo de lenguaje ni un modelo generativo de texto o imagen: es un controlador de acciones (policy) entrenado para ejecutar una tarea de manipulación concreta, denominada "uncap", sobre un robot UR3e bimanual con tres cámaras. El modelo aprende a mapear observaciones visuales y de estado a secuencias de acciones, empleando un proceso de difusión para generar las trayectorias de los actuadores.

La variante está entrenada "from scratch", es decir, únicamente con los datos de demostraciones de esta tarea, sin partir de un modelo preentrenado generalista. El conjunto de datos de entrenamiento es `WetLabRoboData/lerobot-data-uncap`. El modelo cuenta con 264.873.854 parámetros (unos 264,9 millones) y se distribuye en formato safetensors con la librería LeRobot, con un tamaño de repositorio de aproximadamente 1,1 GB.

Su relevancia radica en que ilustra el flujo completo de una política de difusión para robótica en código abierto: entrenamiento por imitación, evaluación con rollouts grabados y publicación reproducible de pesos y resultados. El autor reporta 19 éxitos sobre 20 episodios de evaluación (95 %) para la tarea de uncap, lo que la convierte en una referencia práctica para quien quiera replicar o comparar políticas de difusión en manipulación bimanual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de difusión (diffusion policy) de LeRobot, red neuronal para imitación robótica |
| Parametros totales | 264.873.854 (aprox. 264,9 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no es un modelo de lenguaje. El horizonte de observación y de predicción de acciones es un parámetro de configuración de la política no especificado en la informacion disponible |
| Tipos de cuantizacion | No disponible; los pesos se publican en safetensors (precisión no especificada) |
| Idiomas soportados | No aplica (modelo de robótica, no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (cargable con la libreria lerobot de LeRobot) |

Datos adicionales relevantes: robot objetivo UR3e bimanual con 3 cámaras; tarea "uncap"; variante Scratch; repositorio de 1,1 GB; pipeline declarado como robotics.

## Arquitectura y entrenamiento

El modelo es una política de difusión (diffusion policy) implementada en LeRobot. Este tipo de arquitectura formula el control robótico como un problema de generación: en lugar de predecir directamente una acción, el modelo aprende a invertir un proceso de difusión que añade ruido progresivamente a las secuencias de acciones, de modo que en inferencia parte de ruido y lo va eliminando condicionado por las observaciones (imágenes de las cámaras y estado del robot). Esto permite representar de forma multimodal la distribución de trayectorias, algo útil cuando una misma observación admite varias acciones válidas.

El entrenamiento es por imitación (imitation learning) supervisada a partir del dataset `WetLabRoboData/lerobot-data-uncap`, que contiene demostraciones humanas de la tarea. La variante "scratch" indica que se ha entrenado solo con los datos de esta tarea, sin inicialización desde un modelo generalista. La model card no especifica la composición exacta del dataset, el número de episodios de entrenamiento, la función de pérdida concreta ni si se aplicaron técnicas como RLHF o DPO (habituales en modelos de lenguaje, no en este tipo de políticas). Tampoco se detalla el número de pasos de difusión empleados en inferencia. La información de procedencia indica que el modelo fue reorganizado desde `WetLabRoboData/lerobot-data-smrithi-uncap_20260713` el 4 de octubre de 2026, conservándose los artefactos de entrenamiento (checkpoints, `train_config.json`, directorio `wandb/`) en la subcarpeta `old/` del repositorio de origen para trazabilidad.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones para el robot UR3e bimanual orientadas a completar la tarea "uncap".
- Procesamiento de observaciones multimodales: consume entradas de tres cámaras junto con el estado del robot.
- Política de difusión multimodal: puede representar y muestrear múltiples trayectorias plausibles ante una misma observación.
- Ejecución bimanual: diseñado para un robot de dos brazos, lo que implica coordinación entre ambos efectores.
- Especialización en una única tarea: no es un modelo generalista; su competencia está acotada a la tarea para la que fue entrenado.
- Integración con el ecosistema LeRobot: se carga mediante `DiffusionPolicy.from_pretrained(...)` en Python.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- Sin capacidades multilingües ni de generación de texto: no procesa ni produce lenguaje natural.

## Casos de uso

- Automatización de laboratorio húmedo (wet lab): el modelo ejecuta la tarea de desatornillar o abrir tapones sobre un UR3e bimanual, adecuado para reproducir de forma autónoma operaciones repetitivas de manipulación en entornos de laboratorio.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible para estudiar políticas de difusión en robótica, ya que el autor publica pesos, dataset y rollouts de evaluación.
- Línea base para comparación de políticas: al ofrecer un resultado medido (19/20 episodios), permite comparar frente a otras familias de políticas de LeRobot (ACT, VQ-BeT, TDMPC) en la misma tarea.
- Fine-tuning para tareas relacionadas: puede servir de punto de partida para adaptar la política a variantes de manipulación con el mismo montaje de robot y cámaras, aunque la variante "scratch" no incluye preentrenamiento generalista.
- Validación de pipelines de despliegue robótico: útil para probar el flujo de carga y ejecución de LeRobot sobre hardware real, incluyendo la sincronización de cámaras y brazos.
- Generación de datos sintéticos de trayectorias: las muestras de la política de difusión pueden analizarse para estudiar la variabilidad y las estrategias de agarre o giro en la tarea.
- Docencia y demostraciones de manipulación bimanual: como ejemplo didáctico de control por difusión con vídeos de evaluación publicados.

## Benchmarks y rendimiento

La model card reporta una evaluación propia sobre la tarea objetivo:

| Metrica | Valor |
|---|---|
| Tarea evaluada | uncap |
| Episodios de evaluacion | 20 |
| Exitos | 19 / 20 |
| Tasa de exito | 95 % |
| Robot | UR3e bimanual (3 camaras) |

No se han publicado en la información disponible resultados en benchmarks estandarizados (por ejemplo, MMLU, HumanEval, GSM8K u otros), ya que no son aplicables a un modelo de robótica. Las evidencias de rendimiento corresponden a la evaluación específica de la tarea con rollouts grabados, disponibles en el dataset `WetLabRoboData/eval-diffusion-uncap-scratch`.

## Requisitos de hardware

- VRAM estimada para inferencia: con 264,9 M de parámetros, los pesos ocupan aproximadamente 1,06 GB en fp32 y 0,53 GB en bf16/fp16. Sumando activaciones y el procesamiento de tres flujos de cámara, un presupuesto práctico de 2 a 4 GB de VRAM es suficiente, si bien no se publican cifras oficiales.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es probablemente suficiente. Para garantizar control en tiempo real se recomienda una GPU dedicada de gama media-alta (por ejemplo, RTX 3060/4070 o superiores); las GPU de centro de datos (A100, H100) no son necesarias para este tamaño, pero pueden usarse en entrenamiento.
- Adecuación a GPU de consumo: sí, cabe holgadamente en GPU de consumo actuales, dado su reducido número de parámetros.
- Opciones de despliegue: la vía oficial es la librería LeRobot con PyTorch (`DiffusionPolicy.from_pretrained`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El coste de inferencia en políticas de difusión depende del número de pasos de difusión configurados, dato no especificado en la información disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para esta tarea concreta en la información proporcionada. De forma cualitativa, dentro del ecosistema LeRobot existen otras familias de políticas con las que podría compararse, aunque faltan métricas homogéneas:

| Modelo | Tipo | Parametros | Tarea | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| diffusion-uncap-scratch | Política de difusión | 264,9 M | uncap | apache-2.0 | 19/20 (95 %) en su tarea |
| ACT (LeRobot) | Transformer con action chunking | No disponible | Manipulacion general | No disponible | No disponible |
| VQ-BeT (LeRobot) | Discretizacion de acciones | No disponible | Manipulacion general | No disponible | No disponible |
| TDMPC (LeRobot) | Aprendizaje de modelo latent | No disponible | Manipulacion general | No disponible | No disponible |

La comparación directa no está disponible porque los resultados solo son válidos dentro del mismo dataset, robot y protocolo de evaluación.

## Limitaciones y advertencias

- Especialización cerrada: el modelo está entrenado solo para la tarea "uncap" sobre un UR3e bimanual con 3 cámaras; no generaliza a otras tareas, robots ni configuraciones de sensores sin reentrenamiento o fine-tuning.
- Dependencia del montaje: el rendimiento depende de reproduzir el mismo setup de robot, cámaras, iluminación y posiciones de objeto que en el entrenamiento.
- Riesgo de fallo en condiciones fuera de distribución: al ser una política de imitación, ante objetos o situaciones no vistas puede degradarse o fallar, sin mecanismos explícitos de detección de incertidumbre.
- Ausencia de benchmarks externos: solo hay una evaluación propia (20 episodios); el tamaño de muestra es reducido y no permite afirmar robustez general.
- Datos no disponibles: no se publican sesgos concretos, composición del dataset de entrenamiento, número de demostraciones ni detalles de configuración de inferencia (pasos de difusión, horizonte de acción).
- Licencia: apache-2.0, que permite uso comercial, pero conviene verificar las condiciones de los datos de entrenamiento y de cualquier componente de terceros incluido.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el 4 de octubre de 2026, por lo que carece de validación por parte de la comunidad.
- Trazabilidad: parte de los artefactos de entrenamiento residen en una subcarpeta `old/` del repositorio de origen, lo que puede dificultar la reproducción exacta del proceso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WetLabRoboData/diffusion-uncap-scratch
- Dataset de entrenamiento: https://huggingface.co/datasets/WetLabRoboData/lerobot-data-uncap
- Dataset de evaluacion (rollouts): https://huggingface.co/datasets/WetLabRoboData/eval-diffusion-uncap-scratch
- Repositorio de origen (trazabilidad): https://huggingface.co/datasets/WetLabRoboData/lerobot-data-smrithi-uncap_20260713
- Libreria LeRobot: https://github.com/huggingface/lerobot
- Material de referencia sobre modelos de difusion (no especifico de este modelo): https://huggingface.co/learn/diffusion-course/en/unit1/3
- Cuaderno introductorio de modelos de difusion desde cero (no especifico de este modelo): https://github.com/huggingface/diffusion-models-class/blob/main/unit1/02_diffusion_models_from_scratch.ipynb
- Tutorial general de modelos de difusion (no especifico de este modelo): https://www.chenyang.co/diffusion.html
