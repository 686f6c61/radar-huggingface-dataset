# Yuzriha00/act_omx_1022

## Resumen

`act_omx_1022` es un checkpoint de política robótica basado en ACT (Action Chunking with Transformers), publicado por el usuario Yuzriha00 en Hugging Face y entrenado con LeRobot, la librería de aprendizaje por imitación de Hugging Face. No es un modelo de lenguaje: es una política visomotora que, a partir de observaciones del robot (imágenes de cámara y estado de las articulaciones), predice fragmentos de acciones (*action chunks*) en lugar de pasos individuales, lo que reduce la acumulación de error y suele mejorar la tasa de éxito en tareas de manipulación.

Con 51.668.614 parámetros y un repositorio de 0,2 GB, es un modelo compacto que cabe en GPU de consumo y está pensado para controlar brazos robóticos de bajo coste, como el SO-100 follower que aparece en los comandos de evaluación de la model card. Se ha entrenado sobre el dataset `Yuzriha00/omx_1022_success`, también publicado por el autor, y se distribuye con licencia Apache 2.0, lo que permite uso comercial.

Su relevancia es práctica: sirve como ejemplo reproducible de un pipeline completo de *imitation learning* (entrenamiento con `lerobot-train` y evaluación con `lerobot-record`) y como punto de partida para quien quiera replicar o ajustar ACT en su propio robot. No hay métricas publicadas ni documentación sobre el hardware exacto de captura, por lo que debe tratarse como un checkpoint de investigación y no como un sistema validado en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con *action chunking* (ACT, arXiv 2304.13705); detalles de encoder/decoder no disponibles |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se documentan horizonte de observación ni tamaño de chunk) |
| Tipos de cuantización | no disponible; solo se publican pesos en safetensors, sin versiones GGUF, ONNX ni INT8 |
| Idiomas soportados | no aplica / no disponible (política robótica sin entrada de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | Yuzriha00/omx_1022_success |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-22 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que entrena una política para predecir secuencias cortas de acciones a partir de demostraciones de teleoperación. La model card únicamente indica que se trata de ACT y remite al paper 2304.13705; no se especifican la configuración del transformer, el número de capas, la dimensión de las observaciones, el número de cámaras ni el uso del regularizador CVAE descrito en el artículo original. Tampoco se detalla si el entrenamiento incluyó condicionamiento por lenguaje o solo observaciones visuales y propioceptivas.

El entrenamiento se realizó con LeRobot sobre el dataset `omx_1022_success`. No se indica el número de episodios, la frecuencia de control, la composición de las demostraciones ni si hubo aumento de datos. No hay fase de RLHF ni DPO, algo que no aplica a una política de control. La innovación técnica relevante es el *action chunking*: predecir bloques de acciones coherentes en lugar de una acción por paso, lo que mejora la estabilidad temporal y la tasa de éxito en tareas de manipulación.

## Capacidades

- Predicción de acciones de manipulación robótica a partir de observaciones visuales y del estado del robot.
- Aprendizaje por imitación a partir de datos de teleoperación, sin necesidad de definir recompensas.
- Generación de *action chunks* para ejecución temporalmente coherente.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluación con `lerobot-record`.
- Compatibilidad con el robot `so100_follower` en el flujo de evaluación documentado por el autor.
- Posibilidad de *fine-tuning* sobre nuevos datasets en formato LeRobotDataset.
- No soporta generación de texto, tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni capacidades multilingües.

## Casos de uso

- **Manipulación con brazo SO-100 en laboratorio:** el checkpoint puede cargarse con `lerobot-record` y ejecutar la tarea aprendida sobre el robot `so100_follower`, usando las observaciones de cámara y el estado articular como entrada.
- **Replicación de experimentos ACT:** sirve como referencia para reproducir el pipeline de entrenamiento y evaluación de ACT con LeRobot, comparando configuraciones de *chunk size* y resolución de cámara.
- **Punto de partida para *fine-tuning*:** un equipo con un robot similar puede reentrenar o ajustar la política con sus propias demostraciones para adaptarla a objetos, iluminación o posiciones distintas.
- **Evaluación comparativa de políticas:** puede actuar como *baseline* frente a Diffusion Policy u otras políticas de LeRobot, siempre que se evalúen con el mismo protocolo y número de episodios.
- **Docencia y talleres de robótica:** su tamaño reducido (51,7 M de parámetros) y su licencia permisiva facilitan usarlo en cursos de aprendizaje por imitación con hardware asequible.
- **Validación de pipelines de datos:** permite comprobar de extremo a extremo el formato LeRobotDataset, la grabación de episodios y la carga de checkpoints antes de invertir en datasets mayores.
- **Prototipado rápido en robótica de bajo coste:** al caber en GPU de consumo, posibilita iterar en local sin depender de clústeres ni de infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, número de episodios de evaluación, comparaciones con otras políticas ni métricas de error de seguimiento. Tampoco se documentan resultados en simulación.

## Requisitos de hardware

- **VRAM estimada para inferencia:** unos 207 MB en FP32 y unos 103 MB en FP16/BF16, calculados a partir de los 51.668.614 parámetros; no se publican pesos cuantizados.
- **GPU recomendadas:** cualquier GPU con soporte CUDA y al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o RTX 4090 cubren el modelo con amplio margen. Una A100 o H100 no aportan ventaja por tamaño, solo por paralelismo de evaluación.
- **GPU de consumo:** sí cabe en tarjetas de gama media y baja, e incluso la inferencia en CPU es viable, aunque con mayor latencia.
- **Opciones de despliegue:** LeRobot con PyTorch (`lerobot-record`, `lerobot-train`); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- **Latencia y throughput:** no disponibles; dependerán de la resolución de cámara, del tamaño del *chunk*, de la frecuencia de control y del hardware. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| act_omx_1022 | 51.668.614 | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| ACT (implementación de referencia en LeRobot) | no disponible en la información proporcionada | no disponible | no disponible | no disponible |
| Diffusion Policy | no disponible en la información proporcionada | no disponible | no disponible | no disponible |
| SmolVLA | no disponible en la información proporcionada | no disponible | no disponible | no disponible |

La información disponible no permite una comparación numérica de rendimiento con alternativas. A nivel cualitativo, ACT se distingue por predecir *chunks* de acciones y por su bajo coste computacional; Diffusion Policy modela distribuciones multimodales de acciones, y SmolVLA incorpora condicionamiento por lenguaje, pero no se dispone de datos verificables en esta ficha para cuantificar las diferencias.

## Limitaciones y advertencias

- **Sesgo de dominio:** la política está entrenada con un único dataset (`omx_1022_success`) y no se documentan variabilidad de objetos, iluminación, posiciones de cámara ni condiciones ambientales.
- **Riesgo de fallo silencioso:** al no ser un modelo generativo de texto, no "alucina" en sentido lingüístico, pero puede producir acciones incorrectas sin emitir ninguna señal de incertidumbre.
- **Ausencia de métricas:** no hay tasas de éxito publicadas, por lo que no es posible afirmar su rendimiento ni compararlo con alternativas.
- **Sensibilidad al montaje:** cambios en la cámara, en la calibración del robot o en la altura de la mesa pueden degradar el comportamiento fuera de distribución.
- **Limitaciones de idioma y contexto:** no aplica soporte multilingüe ni ventana de contexto textual; el horizonte de observación no está documentado.
- **Validación comunitaria nula:** 0 descargas y 0 likes en el momento de la consulta; no hay reportes independientes de uso.
- **Licencia:** Apache 2.0 permite uso comercial del checkpoint, pero no se especifican las condiciones del dataset de entrenamiento; conviene revisarlas antes de un despliegue comercial.
- **Seguridad física:** cualquier uso en un robot real requiere límites de par, paradas de emergencia y supervisión humana, especialmente durante la evaluación inicial.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Yuzriha00/act_omx_1022)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Yuzriha00/omx_1022_success)
- [Paper de ACT (arXiv 2304.13705)](https://arxiv.org/abs/2304.13705)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
