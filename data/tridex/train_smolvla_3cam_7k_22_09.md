# Tridex/train_smolvla_3cam_7k_22_09

## Resumen

`Tridex/train_smolvla_3cam_7k_22_09` es una política robótica de tipo vision-language-action (VLA) obtenida por fine-tuning del modelo base `lerobot/smolvla_base`, publicado por el usuario Tridex. Se trata de un modelo denso de 450.046.176 parámetros (0,9 GB en safetensors) que consume el estado del robot y tres imágenes de cámara, y que produce un vector de acción de 6 dimensiones. No es un modelo de lenguaje: su única salida es la acción motora, condicionada por una instrucción de tarea en texto.

El modelo está especializado en una única tarea de manipulación: "take the gaz cylinder and drop it" (coger el cilindro de gas y soltarlo). Se entrenó con el dataset `Tridex/_20260922_140724`, compuesto por 21 episodios y 22.397 fotogramas a 30 FPS, durante 7.000 pasos con batch de 8, optimizador AdamW y tasa de aprendizaje 1e-4 sobre LeRobot 0.6.1. El robot objetivo es un `so_follower` (familia SO-100/SO-101 de bajo coste) con tres cámaras.

Su relevancia es práctica y acotada: sirve como ejemplo reproducible de entrenamiento de un VLA compacto ejecutable en hardware de consumo, y como punto de partida para quien quiera replicar el flujo de imitación de LeRobot con su propio robot. Conviene subrayar que el autor no ha publicado resultados de evaluación, que el repositorio acumula 0 descargas y 0 likes, y que las búsquedas web realizadas no han devuelto documentación adicional sobre este checkpoint concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA; política de imitación con backbone de visión-lenguaje y cabeza de acciones (detalle interno no disponible) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible; en un VLA la "condición" es la instrucción de tarea en texto y la ventana de observaciones, no una ventana de tokens documentada |
| Tipos de cuantizacion | No disponible; no se publican variantes cuantizadas (solo pesos safetensors) |
| Idiomas soportados | No disponible; la instrucción de tarea del dataset está en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de modelo | Política robótica (pipeline: robotics) |
| Modelo base | lerobot/smolvla_base (fine-tuning) |
| Robot objetivo | so_follower |
| Camaras | front, side, top (3 camaras) |
| Entradas | observation.state (6,); observation.images.camera1/2/3 (3, 256, 256) |
| Salidas | action (6,) |
| Tamano del repositorio | 0,9 GB |
| Dataset de entrenamiento | Tridex/_20260922_140724 (21 episodios, 22.397 frames, 30 FPS) |
| Version de LeRobot | 0.6.1 |
| Fecha de publicacion | 2026-09-22 |

## Arquitectura y entrenamiento

SmolVLA se describe en la model card como un modelo compacto y eficiente de visión-lenguaje-acción que alcanza rendimiento competitivo con un coste computacional reducido y que puede desplegarse en hardware de consumo. Este checkpoint concreto es un fine-tuning de `lerobot/smolvla_base` sobre una tarea de manipulación única, con 450 millones de parámetros y una interfaz bien definida: recibe el estado articular del robot (vector de 6 componentes) más tres imágenes RGB de 256×256 píxeles y emite un vector de acción de 6 componentes. La model card no detalla la composición interna de la arquitectura (número de capas, mecanismo de atención, tipo de cabeza de acción ni si emplea flow matching u otro esquema de decodificación de acciones), por lo que esos extremos quedan como no disponibles.

El entrenamiento se realizó mediante imitación supervisada con LeRobot 0.6.1: 7.000 pasos, batch de 8, optimizador AdamW, tasa de aprendizaje 0,0001, semilla 1000 y precisión no especificada. El dataset contiene 21 episodios y 22.397 fotogramas a 30 FPS (aproximadamente 12,5 minutos de demostraciones, unas 1.067 imágenes por episodio). Con batch 8 y 7.000 pasos se procesan unos 56.000 ejemplos, equivalentes a unas 2,5 pasadas sobre los fotogramas disponibles. No se documenta ningún uso de RLHF, DPO ni ajuste por preferencias, algo esperable en este tipo de políticas de imitación.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 grados de libertad para un brazo `so_follower` a partir de observaciones visuales y de estado.
- Condicionamiento por lenguaje: la política acepta una instrucción de tarea en texto ("take the gaz cylinder and drop it") como parte de la inferencia.
- Percepción multi-cámara: procesa tres vistas simultáneas de 256×256 (cámara frontal, lateral y superior) para estimar la posición de los objetos.
- Ejecución a frecuencia de control de 30 FPS: el dataset y el bucle de inferencia están alineados con esa cadencia.
- Especialización en una tarea de pick-and-place: coger un cilindro de gas y depositarlo en otro punto.
- Reutilización como punto de partida: puede seguir afinándose con `lerobot-train` sobre nuevos datasets.
- Integración nativa con LeRobot: se ejecuta con `lerobot-rollout` y se entrena con `lerobot-train`.
- No soporta tool calling, function calling, agentes multi-paso, generación de texto, código, matemáticas, visión general ni audio: esas capacidades no aplican a este tipo de modelo.

## Casos de uso

- Manipulación pick-and-place de cilindros de gas: la política está entrenada específicamente para esa tarea, por lo que puede desplegarse directamente sobre un `so_follower` con tres cámaras para coger y soltar el cilindro en un entorno de laboratorio controlado.
- Automatización de tareas repetitivas en laboratorio: uso como brazo auxiliar que repite el ciclo de recogida y depósito de objetos cilíndricos, liberando al operario de una tarea monótona.
- Punto de partida para fine-tuning propio: al derivar de `lerobot/smolvla_base` y documentar todos los hiperparámetros (7.000 pasos, batch 8, AdamW, lr 1e-4, semilla 1000, LeRobot 0.6.1), sirve como referencia reproducible para entrenar políticas de otras tareas con el mismo pipeline.
- Validación de una instalación completa de LeRobot: útil para comprobar cableado, calibración, índices de cámara y frecuencia de captura antes de grabar un dataset propio, ya que la receta de entrenamiento está documentada paso a paso.
- Baseline en investigación sobre VLA compactos: permite medir cuánto rinde un modelo de 450 millones de parámetros en una tarea concreta frente a políticas más grandes, siempre que se realice una evaluación propia, dado que el autor no publica resultados.
- Despliegue en estaciones de bajo coste: al caber en GPU de consumo, puede ejecutarse en un puesto con una RTX de gama media junto al robot, sin necesidad de servidores con aceleradores de centro de datos.
- Docencia y formación: ejemplo completo de extremo a extremo (grabación, entrenamiento, rollout) para enseñar imitación robótica con datos limitados.
- Pruebas de robustez de percepción: al depender de tres vistas, permite estudiar cómo afectan a la política cambios de iluminación, oclusiones o colocación del objeto, aunque cualquier conclusión exigirá campañas de evaluación propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política ("No evaluation results have been provided for this policy yet"), y la tabla de evaluación aparece vacía. Las búsquedas web realizadas no han devuelto ninguna fuente adicional con métricas de éxito, tasas de acierto ni comparaciones para este checkpoint. El paper asociado (arXiv:2506.01844) describe el método SmolVLA y sus cifras corresponden al modelo base y a los experimentos originales, no a este fine-tuning.

## Requisitos de hardware

- Peso de los pesos: 450 millones de parámetros equivalen a unos 0,9 GB en bf16/fp16 y a unos 1,8 GB en fp32; el repositorio completo ocupa 0,9 GB.
- VRAM estimada para inferencia: del orden de 2 a 4 GB contando pesos más activaciones de tres imágenes de 256×256 y el backbone de visión-lenguaje (estimación derivada del número de parámetros, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM. Una RTX 3060, RTX 4060 o superior es suficiente; las A100 y H100 quedan sobredimensionadas para este tamaño.
- Compatibilidad con GPU de consumo: sí, es uno de los puntos fuertes declarados de SmolVLA; también puede plantearse ejecución en CPU para pruebas, con latencia muy superior.
- Opciones de despliegue: el soporte oficial es LeRobot (`lerobot-rollout` con `--policy.path=Tridex/train_smolvla_3cam_7k_22_09`). vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de política, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles. El bucle de control del dataset trabaja a 30 FPS, pero el autor no publica mediciones de latencia de inferencia ni de velocidad de ejecución en robot.
- Contexto de entrenamiento declarado: batch 8, 7.000 pasos, AdamW, lr 1e-4, semilla 1000, LeRobot 0.6.1; no se especifica el hardware utilizado para el entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Tridex/train_smolvla_3cam_7k_22_09 | 450.046.176 | No disponible | apache-2.0 | HuggingFace (0 descargas) | Fine-tuning de tarea única sobre robot `so_follower` |
| lerobot/smolvla_base | No disponible en la informacion proporcionada (es el modelo base del fine-tuning) | No disponible | No disponible en la informacion proporcionada | HuggingFace | Modelo generalista del que deriva este checkpoint |
| Otras políticas VLA de la misma categoría (por ejemplo OpenVLA o pi0) | No disponible | No disponible | No disponible | No disponible | No se han encontrado datos verificados en la informacion proporcionada; se citan solo como categoría alternativa |

La comparación cuantitativa con alternativas no es posible con los datos disponibles: no hay resultados de evaluación de este checkpoint ni cifras de rendimiento publicadas en la información proporcionada. Cualquier comparación rigurosa requeriría ejecutar la política en el mismo robot y con el mismo protocolo que las alternativas.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: 21 episodios y 22.397 fotogramas (unos 12,5 minutos de demostraciones), lo que implica un riesgo alto de sobreajuste y una generalización limitada a posiciones, iluminación o condiciones distintas de las grabadas.
- Modelo de tarea única: solo se ha entrenado para "take the gaz cylinder and drop it"; no debe esperarse que realice otras tareas de manipulación sin un nuevo fine-tuning.
- Ausencia total de evaluación: el autor no publica tasa de éxito, número de ensayos ni condiciones de prueba, por lo que no hay evidencia empírica de que la política funcione de forma fiable.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de redactar esta ficha; el checkpoint no ha sido reproducido ni verificado por terceros.
- Dependencia estricta de la configuración de sensores: requiere exactamente las claves de observación `observation.images.camera1`, `camera2` y `camera3` a 256×256, además de `observation.state` de dimensión 6. La model card menciona las cámaras como `front`, `side` y `top`, lo que puede generar confusión al mapear los nombres en el comando de rollout; conviene verificar la correspondencia antes del despliegue.
- Atado a una morfología concreta: la salida de 6 dimensiones y el tipo de robot `so_follower` limitan su uso a brazos compatibles con esa cinemática.
- Idiomas: no se documentan capacidades multilingües; la instrucción de tarea del dataset está en inglés, y no hay datos sobre el comportamiento con instrucciones en castellano.
- Riesgo de acciones incorrectas: como toda política de imitación, puede producir trayectorias erráticas ante observaciones fuera de distribución. No incorpora mecanismos de parada de seguridad ni detección de fallo, por lo que su uso con robot real exige supervisión y límites de par/velocidad en el controlador.
- No es un modelo de lenguaje: no genera texto, no razona, no hace tool calling y no debe emplearse para tareas de NLP.
- Licencia: apache-2.0 permite uso comercial y modificación, pero conviene revisar también la licencia del modelo base (`lerobot/smolvla_base`) y la del dataset `Tridex/_20260922_140724`, no detalladas en la información proporcionada. El modelo se distribuye sin garantías.
- No hay cuantizaciones publicadas, lo que limita las opciones de reducir huella de memoria más allá de convertir los pesos a bf16/fp16 manualmente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tridex/train_smolvla_3cam_7k_22_09
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Tridex/_20260922_140724
- Paper de SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout e inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Tridex/_20260922_140724
- Cita de LeRobot (BibTeX incluido en la model card): Cadene, Remi et al., "LeRobot: State-of-the-art Machine Learning for Real-World Robotics in Pytorch"
