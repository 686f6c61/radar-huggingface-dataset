# Tridex/model_act_fluo_vs_gazeuse_briquet_resnet_100K_25_11

## Resumen

Este repositorio contiene una política de imitación entrenada con el método Action Chunking with Transformers (ACT), publicado en el artículo arXiv:2304.13705 y distribuida a través de la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visuomotor que, a partir de tres cámaras (front, side, top) y del estado articular del robot, predice directamente comandos de acción de 6 dimensiones para un brazo `so_follower` (configuración tipo SO-100/SO-101 de bajo coste).

El modelo ha sido entrenado por el usuario Tridex sobre un conjunto de datos propio de 40 episodios y 15.387 fotogramas a 30 FPS, con la tarea concreta de coger un rotulador fluorescente amarillo y depositarlo en una caja rosa, evitando explícitamente un mechero y una botella de agua con gas. Con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo ligero orientado a inferencia en tiempo real sobre hardware modesto.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitación con LeRobot 0.6.2 (grabación de datos, entrenamiento de 100.000 pasos, despliegue con `lerobot-rollout`) y como política de referencia para tareas de pick-and-place con distinción de objetos. No obstante, no incluye resultados de evaluación en robot real y su dataset es muy reducido, por lo que debe tratarse como una prueba de concepto más que como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual ResNet y decodificador de trozos de acción (action chunks) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; consume observaciones por paso, no secuencias de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo robótico; la tarea se especifica en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Cámaras de entrada | `front`, `side`, `top` (3, 480, 640) |
| Entrada de estado | `observation.state` (6,) |
| Salida de acción | `action` (6,) |
| Pasos de entrenamiento | 100.000 |
| Tamaño de batch | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que, en lugar de predecir una única acción por paso, predice un trozo (chunk) de acciones futuras a partir de la observación actual. La arquitectura combina un codificador visual basado en ResNet que procesa las tres vistas de cámara, un codificador del estado articular de 6 dimensiones y un transformer que fusiona ambas representaciones para emitir el chunk de acciones. Este diseño reduce el error de compounding y facilita el control suave en tareas de manipulación.

El entrenamiento se realizó sobre el dataset `Tridex/40_fluo-vs-gazeuse-briquet_13h_23-11_20261123_131531`, compuesto por 40 episodios teleoperados y 15.387 fotogramas a 30 FPS (aproximadamente 8,5 minutos de datos). Se ejecutaron 100.000 pasos con batch de 8, AdamW y learning rate 1e-05, semilla 1000, usando LeRobot 0.6.2. La tarea entrenada es "take the yellow fluo and drop it inside the pink box, but nerver try to take the briquet and gazeuse", lo que introduce una restricción negativa explícita (no tocar mechero ni botella) que el modelo debe aprender por imitación. No se documenta el uso de RLHF, DPO ni aumento de datos adicional.

## Capacidades

- Control visuomotor de un brazo `so_follower` con 6 grados de libertad a partir de tres cámaras RGB.
- Predicción de chunks de acción para ejecución fluida en tiempo real a 30 FPS.
- Ejecución de una tarea específica de pick-and-place: coger el rotulador fluorescente amarillo y dejarlo en la caja rosa.
- Discriminación negativa de objetos: evitar el mechero y la botella de agua con gas durante la manipulación.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`, visualización de datasets).
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Prueba de concepto de aprendizaje por imitación: sirve para validar un pipeline completo de LeRobot (grabación, entrenamiento, despliegue) en un brazo SO-100/SO-101 antes de escalar a tareas más complejas.
- Automatización de pick-and-place con distinción de objetos: el modelo aprende a seleccionar un objeto concreto (rotulador amarillo) y descartar distractores (mechero, botella), útil en líneas de clasificación sencillas.
- Investigación en robótica de bajo coste: permite reproducir experimentos de ACT en hardware asequible y comparar hiperparámetros (pasos, batch, learning rate) con una referencia pública.
- Docencia y formación: ejemplo didáctico de política visuomotora entrenada con 40 episodios, adecuado para cursos de aprendizaje por imitación.
- Base para fine-tuning en tareas similares: al estar en formato safetensors y licencia Apache 2.0, puede reentrenarse con nuevos datasets de manipulación sobre el mismo robot.
- Evaluación de robustez ante distractores: la restricción negativa del dataset permite estudiar cómo ACT maneja instrucciones implícitas de "no tocar" ciertos objetos.
- Integración en demostraciones de robot learning: útil para vídeos, demos y comparativas frente a otros métodos de imitación (Diffusion Policy, VQ-BeT) en el mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No se dispone de tasas de éxito en robot real, ni de comparaciones con otras políticas sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y pesos en safetensors, el modelo ocupa del orden de 0,2 GB en FP32, por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: no se especifican; por tamaño, una RTX 3060/4060 o superior es suficiente. Para entrenamiento con batch 8 y tres cámaras a 480x640 se recomienda al menos 8-12 GB de VRAM.
- Cabe en GPU consumer: sí, en cualquier GPU con 4 GB o más para inferencia; para reentrenamiento se recomienda 8 GB o más.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), integración con PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- Latencia y throughput: no disponibles; el dataset está grabado a 30 FPS y la ejecución se realiza en tiempo real con `lerobot-rollout --duration=60`, pero no se publican cifras de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Tridex/model_act_fluo_vs_gazeuse_briquet_resnet_100K_25_11 | ACT (LeRobot) | 51,7 M | no aplica | sin evaluación publicada | Apache 2.0 | Hugging Face |
| Políticas ACT de referencia en LeRobot | ACT (LeRobot) | variable | no aplica |的成功 varía por dataset; no comparable directamente | Apache 2.0 | Hugging Face / docs LeRobot |
| Diffusion Policy | Política de difusión | variable | no aplica | referencias publicadas en papers, no comparable con este dataset | MIT/Apache según implementación | Repos públicos |
| VQ-BeT | Política con cuantización vectorial | variable | no aplica | referencias publicadas en papers, no comparable con este dataset | MIT | Repos públicos |

No se dispone de comparaciones directas sobre el mismo dataset ni de métricas comunes, por lo que la comparativa es únicamente cualitativa.

## Limitaciones y advertencias

- Dataset muy reducido: 40 episodios y 15.387 fotogramas implican poca diversidad; el modelo probablemente se sobreajusta a posiciones, iluminación y fondo concretos.
- Sin evaluación en robot real: no hay tasas de éxito publicadas, por lo que no puede afirmarse que la política funcione fuera del conjunto de entrenamiento.
- Tarea única y altamente específica: solo ejecuta "coger el rotulador amarillo y dejarlo en la caja rosa evitando mechero y botella"; no generaliza a otras instrucciones.
- Dependencia del hardware exacto: requiere un robot `so_follower` con tres cámaras en las posiciones `front`, `side` y `top`; cambios de calibración o de montaje pueden degradar el rendimiento.
- Riesgo de alucinación motora: como toda política de imitación, puede ejecutar acciones fuera de distribución ante objetos o configuraciones no vistas, con riesgo físico para el entorno.
- Sesgos de los datos de teleoperación: el estilo de manipulación del operador queda codificado en la política; no se documenta diversidad de operadores.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace desaconsejable su despliegue en producción sin validación propia.
- Sin soporte multilingüe ni de texto: no debe confundirse con un modelo de lenguaje; la tarea se especifica en inglés y no hay capacidades de diálogo.
- Fecha de creación del repositorio (2026-11-26) y del dataset: verificar que los artefactos corresponden a la versión citada de LeRobot 0.6.2.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tridex/model_act_fluo_vs_gazeuse_briquet_resnet_100K_25_11
- Dataset de entrenamiento: https://huggingface.co/datasets/Tridex/40_fluo-vs-gazeuse-briquet_13h_23-11_20261123_131531
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Tridex/40_fluo-vs-gazeuse-briquet_13h_23-11_20261123_131531
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
