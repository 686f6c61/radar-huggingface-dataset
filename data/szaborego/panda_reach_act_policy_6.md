# szaborego/panda_reach_act_policy_6

## Resumen

El modelo `szaborego/panda_reach_act_policy_6` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario szaborego y publicada en Hugging Face bajo licencia Apache 2.0. Está entrenada con el framework LeRobot para ejecutar la tarea de alcanzar un objetivo ("Reach the target") con un brazo robótico Panda, utilizando aprendizaje por imitación a partir de datos teleoperados. El modelo consume una imagen de cámara (256x256 píxeles) y un vector de estado de 6 dimensiones, y produce acciones de control de 3 dimensiones.

Con 51,7 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo ligero diseñado para inferencia en tiempo real en robótica. Su relevancia radica en que demuestra cómo ACT puede aprender tareas de manipulación con un dataset relativamente grande (5000 episodios) y ser desplegado fácilmente mediante LeRobot. No se han publicado resultados de evaluación en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.665.539 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de control robótico, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que mejora la estabilidad y precisión en tareas de manipulación robótica. La arquitectura se basa en un transformer que procesa observaciones visuales y de estado, y genera un chunk de acciones futuras. El modelo fue entrenado con el framework LeRobot (versión 0.6.1) sobre el dataset `szaborego/panda_reach_dataset_5k_ppo_wrap`, que contiene 5000 episodios y 204.036 frames a 20 FPS, todos para la tarea "Reach the target". La configuración de entrenamiento incluye 60.000 pasos, batch size de 8, optimizador AdamW y learning rate de 1e-5. No se aplicaron técnicas de RLHF ni DPO; es un entrenamiento puramente supervisado por imitación.

## Capacidades

- Control robótico de un brazo Panda para alcanzar un objetivo visualmente identificado.
- Procesamiento de imágenes de cámara (256x256) junto con el estado del robot (posición y orientación del efector final).
- Generación de acciones de control continuas en 3 dimensiones (posición cartesiana o articulaciones, según la configuración).
- Inferencia en tiempo real gracias a su tamaño reducido (51,7 M parámetros).
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo específico de robótica.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos industriales: el modelo puede controlar un brazo Panda para alcanzar y manipular objetos, reduciendo la necesidad de programación manual.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas entrenadas con ACT a nuevos entornos o variaciones de la tarea.
- Prototipado rápido de control robótico: gracias a LeRobot, se puede desplegar en un robot real con pocos comandos, ideal para laboratorios y startups.
- Benchmarking de algoritmos de imitación: al estar entrenado sobre un dataset público, permite comparar ACT con otros métodos (por ejemplo, Diffusion Policy) en la misma tarea.
- Educación en robótica: los estudiantes pueden cargar el modelo en un simulador o robot real para entender cómo funciona el action chunking.
- Teleoperación asistida: el modelo puede complementar sistemas de teleoperación generando acciones suavizadas o corrigiendo trayectorias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de tasas de éxito ni comparaciones con otros modelos en la tarea "Reach the target".

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 51,7 M parámetros, la inferencia requiere menos de 1 GB de VRAM en FP32, y considerablemente menos en cuantizaciones (aunque no se ofrecen oficialmente). Cabe en cualquier GPU consumer moderna (por ejemplo, GTX 1060 6GB o superior).
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM es suficiente; una RTX 3060 o superior proporciona margen para procesamiento de imágenes adicional.
- Despliegue: compatible con LeRobot, que soporta inferencia en PyTorch. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no hay datos oficiales, pero por el tamaño del modelo y la entrada de imagen única, se espera una inferencia en el orden de milisegundos en GPU moderna.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la misma tarea. El autor ha publicado otros checkpoints similares (por ejemplo, `szaborego/panda_reach_act_policy_3` y un dataset `szaborego/panda_reach_act_baseline`), pero no se han documentado diferencias de rendimiento. No hay información sobre alternativas como Diffusion Policy o otros métodos de imitación en este contexto.

## Limitaciones y advertencias

- No se han realizado evaluaciones formales; se desconoce la tasa de éxito real en el robot físico.
- El modelo está entrenado específicamente para la tarea "Reach the target" con un brazo Panda; no es transferible directamente a otros robots o tareas sin reentrenamiento.
- Depende de la configuración de cámaras y del espacio de trabajo; cambios de iluminación, posición de la cámara o distracciones pueden degradar el rendimiento.
- Al ser un modelo de imitación, hereda los sesgos del dataset de demostración (por ejemplo, trayectorias subóptimas o limitaciones del teleoperador).
- No se proporcionan cuantizaciones oficiales; el despliegue en hardware de bajo consumo requeriría conversión manual.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia del dataset y las condiciones de uso del hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/szaborego/panda_reach_act_policy_6
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/szaborego/panda_reach_dataset_5k_ppo_wrap
- LeRobot (framework): https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=szaborego/panda_reach_dataset_5k_ppo_wrap
