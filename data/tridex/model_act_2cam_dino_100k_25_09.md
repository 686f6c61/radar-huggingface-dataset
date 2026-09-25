# Tridex/model_act_2cam_dino_100K_25_09

## Resumen

Este repositorio contiene una politica de robótica entrenada con ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos de acción (*action chunks*) en lugar de pasos individuales. Lo desarrolla el usuario Tridex (org Tridex_DIA_Niort) y se ha generado con LeRobot 0.6.2, la librería de Hugging Face para aprendizaje automático en robótica real. El modelo resuelve una tarea concreta de manipulación: "take the gaz cylinder and drop it", es decir, coger un cilindro de gas y soltarlo, sobre un brazo seguidor de tipo `so_follower` (SO-100).

Se trata de un modelo pequeño, de 62.473.542 parámetros (unos 62,5 M), con un repositorio de 0,2 GB, muy lejos de los grandes modelos de lenguaje. No procesa lenguaje natural como tarea principal ni genera texto: consume observaciones de estado (vector de 6 dimensiones) y dos cámaras (vistas `side` y `top`, a 480x640) y produce un vector de acción de 6 dimensiones. Es relevante para quien trabaja en robótica de bajo coste e investigación en imitación, porque ACT es uno de los métodos de referencia del ecosistema LeRobot y permite reproducir el flujo completo de grabación de datos con teleoperación, entrenamiento y despliegue sobre hardware asequible.

La ficha se basa en la model card oficial, que no documenta el backbone visual exacto (el nombre del repositorio sugiere un encoder tipo DINO, pero no se confirma), no aporta resultados de evaluación y no especifica la precisión de los pesos ni la longitud del *chunk* de acción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con componente CVAE para aprendizaje por imitación. Backbone visual no especificado en la model card (el nombre del repositorio sugiere DINO) |
| Parametros totales | 62.473.542 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no especificada (ACT predice fragmentos de acción; la model card no detalla el horizonte de observación ni la longitud del chunk) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no procede / no disponible (el modelo no procesa lenguaje natural como entrada; la tarea se pasa como cadena de texto identificadora) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`); precisión no especificada en la model card |

Datos adicionales: tipo de robot `so_follower`; cámaras `side` y `top`; entradas `observation.state` (6,), `observation.images.side` (3, 480, 640), `observation.images.top` (3, 480, 640); salida `action` (6,).

## Arquitectura y entrenamiento

La arquitectura es ACT, presentada en el artículo "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). ACT combina un autocodificador variacional condicional (CVAE) con un transformer encoder-decoder: el encoder de la VAE procesa la secuencia de acciones objetivo junto con las observaciones para inferir una variable latente de estilo durante el entrenamiento, y el transformer decoder genera un *chunk* de acciones futuras a partir de las observaciones actuales. Esta predicción por fragmentos reduce el error de compounding y permite control a alta frecuencia. La model card no especifica el backbone visual ni la configuración exacta del transformer, por lo que los detalles internos (número de capas, dimensiones, tamaño del chunk) quedan como no disponibles.

El entrenamiento es de aprendizaje por imitación (behavior cloning) sobre datos de teleoperación, sin RLHF ni DPO. La configuración documentada es: 100.000 pasos, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-5, semilla 1000 y LeRobot 0.6.2. El conjunto de datos (Tridex/50_gaz_cylinder_14h_24-09_20260924_140939) contiene 50 episodios, 39.028 fotogramas a 30 FPS, lo que equivale a unos 21,7 minutos de grabación efectiva, con una única tarea. No se documenta aumentación de datos, composición detallada del dataset ni proceso de validación.

## Capacidades

- Generación de acciones de manipulación: produce vectores de acción de 6 dimensiones para un brazo `so_follower`, adecuados para control directo del robot.
- Aprendizaje por imitación de una tarea específica: reproducir la secuencia "take the gaz cylinder and drop it" a partir de demostraciones teleoperadas.
- Percepción visual multi-vista: consume dos flujos de imagen simultáneos (vistas `side` y `top`) a 480x640 píxeles.
- Fusión de estado propioceptivo y visión: combina `observation.state` (6,) con las dos cámaras para generar la acción.
- Predicción por *action chunks*: genera fragmentos de acción en lugar de pasos aislados, lo que mejora la estabilidad del control.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas ni capacidades multilingües.
- No soporta *tool calling*, *function calling* ni razonamiento multi-paso en el sentido de los agentes basados en LLM.
- No incluye modo *thinking*, visión semántica general, audio ni otras capacidades multimodales más allá del par de cámaras de entrada.

## Casos de uso

- Automatización de pick-and-place de cilindros: el modelo puede ejecutar la secuencia de coger un cilindro de gas y depositarlo en una posición objetivo, replicando la tarea para la que fue entrenado sobre el brazo `so_follower`.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible de ACT dentro de LeRobot, útil para estudiar el efecto del número de pasos de entrenamiento (100.000) sobre una tarea de manipulación sencilla.
- Base para *fine-tuning* en tareas similares: al ser un modelo pequeño (62,5 M de parámetros) y con licencia apache-2.0, se puede reentrenar con nuevos datasets de teleoperación para variantes de la misma tarea.
- Laboratorios y docencia en robótica de bajo coste: el hardware SO-100 y el flujo de LeRobot permiten montar prácticas de extremo a extremo (grabación, entrenamiento, despliegue) con presupuesto reducido.
- Evaluación de pipelines de datos: al estar vinculado a un dataset concreto (50 episodios, 39.028 fotogramas, 30 FPS), sirve para validar la cadena de captura y sincronización de dos cámaras más estado propioceptivo.
- Pruebas de percepción multi-vista: permite comparar el rendimiento de configuraciones con dos cámaras (`side`, `top`) frente a variantes de la misma familia con más vistas, como la versión de tres cámaras del mismo autor.
- Prototipado de control en investigación: el modelo se puede ejecutar a frecuencia de control cercana a 30 FPS en una GPU de gama media, lo que facilita iterar sobre políticas de imitación sin infraestructura pesada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No hay tasas de éxito, número de ensayos ni tablas comparativas para la tarea "take the gaz cylinder and drop it".

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP32, unos 250 MB solo para parámetros; sumando activaciones y dos tensores de imagen de 3x480x640, el consumo realista en GPU se sitúa en torno a 1 GB. En FP16 los pesos bajarían a unos 125 MB. El repositorio ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y más de 2 GB de VRAM es suficiente. Para control en tiempo real a 30 FPS, se recomiendan RTX 3060, RTX 4060, RTX 4090 o superiores; también es viable en Jetson Orin para despliegue embebido en el robot.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en iGPU con suficiente memoria, aunque el control a 30 FPS exige una GPU dedicada para mantener la latencia.
- Opciones de despliegue: LeRobot mediante el comando `lerobot-rollout` (con `--strategy.type=base` para ejecución sin grabación), con PyTorch como backend. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles como cifra medida. La referencia operativa es la frecuencia del dataset, 30 FPS, y la duración de la ejecución se controla con el parámetro `--duration` de `lerobot-rollout` (60 segundos en el ejemplo de la model card).

## Comparativa con modelos similares

| Modelo | Parametros | Camaras | Pasos de entrenamiento | Tarea | Licencia |
|---|---|---|---|---|---|
| Tridex/model_act_2cam_dino_100K_25_09 | 62.473.542 | 2 (`side`, `top`) | 100.000 | "take the gaz cylinder and drop it" | apache-2.0 |
| Tridex/model_act_3cam_dino_10K_22_09 | no disponible | 3 (según el nombre del repositorio) | 10.000 (según el nombre del repositorio) | no disponible | no disponible |
| ACT de referencia en LeRobot | no disponible | configurable | configurable | múltiples tareas | apache-2.0 (LeRobot) |
| Diffusion Policy (alternativa metodológica) | no disponible | configurable | configurable | múltiples tareas | no disponible en la información proporcionada |

La comparación cuantitativa con otras políticas (Diffusion Policy, VQ-BeT, SmolVLA, pi0) no es posible con los datos disponibles: faltan parámetros, tasas de éxito y configuraciones homogéneas. La única comparación directa verificable es con la variante de tres cámaras del mismo autor, cuya información se ha inferido únicamente del nombre del repositorio y no de una model card consultada.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito ni ensayos documentados, por lo que se desconoce si la política funciona de forma fiable en el robot real.
- Dataset muy reducido: 50 episodios y unos 21,7 minutos de datos para una única tarea, lo que favorece el sobreajuste y limita la generalización a posiciones, iluminación u objetos distintos.
- Tarea única y específica: el modelo solo ha aprendido "take the gaz cylinder and drop it"; no se puede reutilizar tal cual para otras tareas sin reentrenamiento.
- Dependencia estricta del hardware y las cámaras: los nombres de cámara (`side`, `top`), la resolución (480x640) y el tipo de robot (`so_follower`) deben coincidir exactamente con los del entrenamiento, como advierte la propia model card.
- Riesgo de distribución desplazada: al ser una política de imitación, cualquier cambio en la posición inicial, la iluminación, la mesa o el objeto puede degradar el comportamiento. Este riesgo sustituye, en robótica, al problema de alucinación de los modelos de lenguaje.
- Sin datos sobre sesgos: no se documentan sesgos demográficos ni de otro tipo, ya que el modelo no procesa lenguaje ni datos personales. Sí puede heredar sesgos de las demostraciones teleoperadas (por ejemplo, sesgo hacia trayectorias concretas).
- Idioma: no procede soporte multilingüe; la cadena de tarea se usa como identificador, no como instrucción en lenguaje natural general.
- Licencia permisiva: apache-2.0 permite uso comercial y modificación, con la obligación habitual de conservar el aviso de licencia y la atribución. Conviene citar también el artículo de ACT y LeRobot.
- Precisión y formato no confirmados: no se especifica si los pesos están en FP32 o FP16, lo que puede afectar a los cálculos de memoria y a la reproducibilidad.
- Backbone visual no documentado: el nombre del repositorio sugiere DINO, pero la model card no lo confirma, de modo que la arquitectura interna completa no se puede verificar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tridex/model_act_2cam_dino_100K_25_09
- Dataset de entrenamiento: https://huggingface.co/datasets/Tridex/50_gaz_cylinder_14h_24-09_20260924_140939
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Tridex/50_gaz_cylinder_14h_24-09_20260924_140939
- Artículo de ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Perfil del autor en Hugging Face: https://huggingface.co/Tridex
- Variante de tres cámaras del mismo autor: https://huggingface.co/Tridex/model_act_3cam_dino_10K_22_09
