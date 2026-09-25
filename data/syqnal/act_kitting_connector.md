# Syqnal/act_kitting_connector

## Resumen

Syqnal/act_kitting_connector es una política de imitación robótica entrenada con el método ACT (Action Chunking with Transformers) y publicada en Hugging Face mediante la librería LeRobot. No es un modelo de lenguaje: se trata de un controlador visuomotor que recibe dos flujos de imagen (cámara frontal y cámara de muñeca) más un vector de estado de 6 dimensiones, y produce un vector de acción de 6 dimensiones para un brazo robótico de tipo `so_follower`. El modelo resuelve una tarea concreta de manipulación: coger un conector de latón y colocarlo en una bandeja naranja.

El checkpoint tiene 51.668.614 parámetros y ocupa aproximadamente 0,2 GB en el repositorio, con pesos en formato safetensors y licencia Apache 2.0. Se entrenó sobre el dataset Syqnal/kitting_connector, compuesto por 50 episodios teleoperados (11.105 fotogramas a 15 FPS) y 25.000 pasos de entrenamiento con optimizador AdamW y tasa de aprendizaje 1e-5, usando LeRobot 0.6.2.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitación con hardware de bajo coste, y como punto de partida para fine-tuning en tareas de ensamblaje y kitting. No se han publicado resultados de evaluación en robot real ni métricas de éxito, por lo que debe tratarse como una política de investigación más que como un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con componente CVAE y backbone visual ResNet-18 (según el método citado, arXiv 2304.13705) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje); la entrada son dos imágenes de 3x480x640 y un vector de estado de 6 dimensiones |
| Tipos de cuantización | No disponible (el repositorio solo publica pesos en safetensors, sin variantes cuantizadas) |
| Idiomas soportados | No aplica (política robótica; la tarea se especifica con una cadena de texto en inglés, pero no hay modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Cámaras de entrada | `front`, `wrist` |
| Entrada (`observation.state`) | STATE, forma `(6,)` |
| Entrada (`observation.images.front`) | VISUAL, forma `(3, 480, 640)` |
| Entrada (`observation.images.wrist`) | VISUAL, forma `(3, 480, 640)` |
| Salida (`action`) | ACTION, forma `(6,)` |
| Tamaño del repositorio | 0,2 GB |
| Versión de LeRobot | 0.6.2 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura sigue el método ACT descrito en el paper citado (arXiv 2304.13705). Se trata de un transformer encoder-decoder con un componente de autoencoder variacional condicional (CVAE): el encoder procesa las observaciones (imágenes y estado propioceptivo) junto con la secuencia de acciones, mientras que el decoder genera un *chunk* de acciones futuras en lugar de un único paso. Esta predicción por bloques reduce el error de compuesto característico de las políticas paso a paso y permite control a mayor frecuencia. En inferencia se suele aplicar *temporal ensembling*, promediando las predicciones solapadas de varios chunks. El backbone visual habitual en ACT es un ResNet-18 preentrenado, aunque los detalles concretos de configuración de este checkpoint (dimensión oculta, número de capas, tamaño de chunk) no están publicados en la model card.

El entrenamiento se realizó sobre el dataset Syqnal/kitting_connector: 50 episodios teleoperados, 11.105 fotogramas a 15 FPS (aproximadamente 740 segundos de demostraciones) y una única tarea, "Pick the brass connector and place it into the orange tray". La configuración declarada es de 25.000 pasos, batch size 4, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000, con LeRobot 0.6.2. No se documenta el uso de RLHF, DPO ni ningún ajuste posterior por preferencias, algo que no aplica a este tipo de política. Tampoco se detalla la composición exacta, la variabilidad de posiciones de objetos ni las condiciones de iluminación del dataset.

## Capacidades

- Manipulación visuomotora de una única tarea: recoger un conector de latón y depositarlo en una bandeja naranja.
- Fusión de dos cámaras (frontal y de muñeca) con un vector de estado de 6 dimensiones como entrada.
- Salida de comandos de acción de 6 dimensiones (típicamente las articulaciones del brazo `so_follower`).
- Predicción de *chunks* de acciones, que aporta suavidad y reduce el error acumulado frente a políticas paso a paso.
- Ejecución en bucle cerrado sobre robot real mediante el comando `lerobot-rollout`.
- Posibilidad de reentrenamiento o fine-tuning con `lerobot-train` sobre nuevos datasets en formato LeRobot.
- No soporta *tool calling*, *function calling* ni uso como agente.
- No dispone de capacidades multilingües, de razonamiento simbólico, de generación de texto, de código, de matemáticas, de visión general ni de audio.
- No dispone de modo de razonamiento (*thinking mode*) ni de decodificación especulativa.

## Casos de uso

- Automatización de kitting en línea de montaje: la política puede insertarse en una celda con un brazo `so_follower` y dos cámaras para realizar el ciclo coger-conector / colocar-en-bandeja de forma repetitiva, siempre que las posiciones de las piezas permanezcan dentro de la distribución del dataset.
- Demostrador de aprendizaje por imitación: sirve para reproducir de principio a fin el flujo de LeRobot (grabación con teleoperación, entrenamiento con ACT, despliegue con `lerobot-rollout`) en cursos, talleres o laboratorios con presupuesto reducido.
- Base para fine-tuning en tareas de ensamblaje: al ser un checkpoint ACT de 51,7 M de parámetros, se puede reentrenar con `lerobot-train` sobre un dataset propio de otra pieza (por ejemplo, `Syqnal/act_kitting_nut`) partiendo de estos pesos.
- Investigación en manipulación de precisión: útil para estudiar la sensibilidad de ACT a la posición inicial de objetos pequeños, a la iluminación o a la presencia de distractores en la escena, dado que la model card invita explícitamente a registrar estos factores.
- Evaluación comparativa de políticas: puede usarse como línea base frente a otros métodos de imitación (por ejemplo, políticas de difusión) dentro del mismo robot y dataset, midiendo tasa de éxito por número de ensayos.
- Generación de nuevos datos con asistencia: combinado con teleoperación, permite que el operador corrija las trayectorias fallidas en tiempo real y registre episodios adicionales que amplíen el dataset original de 50 episodios.
- Prototipado de celdas robóticas de bajo coste: al requerir únicamente un brazo tipo SO y dos cámaras USB de 640x480, es viable montar una maqueta funcional en un espacio reducido antes de escalar a hardware industrial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política y que no se ha registrado ninguna tabla de ensayos con tasa de éxito en robot real. Tampoco se dispone de métricas de error de acción (MSE, L1) ni de comparaciones frente a otras políticas sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1-2 GB contando pesos y activaciones de las dos cámaras a 480x640 (estimación propia a partir de los 51,7 M de parámetros y del tamaño de repositorio de 0,2 GB; no confirmada por el autor).
- Los pesos en fp32 ocupan aproximadamente 207 MB (51,7 M de parámetros x 4 bytes); en fp16, unos 103 MB.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM, como una RTX 3050, RTX 3060, RTX 4060 o superiores. Para entrenamiento, la configuración declarada usa `--policy.device=cuda` con batch size 4, por lo que una GPU de gama media es suficiente.
- Cabe en GPU de consumo: sí, con holgura, en la mayoría de tarjetas modernas de gama media y alta (RTX 3060, 4060, 4070, 4090). También es plausible ejecutarlo en CPU, aunque la tasa de control podría no alcanzar los 15-30 Hz necesarios para un control fluido.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` sobre PyTorch. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje ni un modelo generativo de texto.
- Latencia y throughput estimados: no disponibles. Como referencia, los datos de entrenamiento se grabaron a 15 FPS, por lo que el bucle de control debería sostener al menos esa frecuencia para reproducir el comportamiento aprendido.
- Requisitos adicionales de plataforma: un brazo `so_follower` calibrado, dos cámaras (`front` y `wrist`) con los mismos nombres de clave de observación usados en el entrenamiento, y las dependencias de LeRobot 0.6.2 o compatibles.

## Comparativa con modelos similares

| Modelo | Autor | Método | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Syqnal/act_kitting_connector | Syqnal | ACT | 51.668.614 | Insertar conector de latón en bandeja naranja | Apache 2.0 | Hugging Face, 0 descargas |
| Syqnal/act_kitting_nut | Syqnal | ACT | No disponible | No disponible (aparentemente variante sobre tuerca) | No disponible | Hugging Face |
| Syqnal/act_kitting_nut_v3 | Syqnal | ACT | No disponible | No disponible (tercera versión de la variante anterior) | No disponible | Hugging Face |

No se dispone de especificaciones técnicas, resultados de evaluación ni tasas de éxito de los modelos comparables en la información proporcionada, por lo que la comparación se limita a autor, método y familia de tarea. Alternativas conceptuales como las políticas de difusión para manipulación robótica no se incluyen por falta de datos concretos en las fuentes consultadas.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea y un único tipo de objeto; fuera de "coger el conector de latón y colocarlo en la bandeja naranja" no se puede esperar un comportamiento útil.
- Sin resultados de evaluación publicados: no hay tasa de éxito medida, ni número de ensayos, ni pruebas con variaciones de posición, iluminación o distractores. No hay evidencia cuantitativa de robustez.
- Dataset pequeño: 50 episodios y 11.105 fotogramas a 15 FPS implican una cobertura limitada de estados. Es probable que el modelo falle ante posiciones de objeto, oclusiones o condiciones de iluminación no vistas durante el entrenamiento.
- Dependencia estricta del hardware: requiere un robot `so_follower` y dos cámaras cuyos nombres de clave coincidan exactamente con `observation.images.front` y `observation.images.wrist`. Cambiar de robot o de montaje de cámara invalida la política.
- Sensibilidad al calibrado: errores de calibración del brazo o de las cámaras respecto a la configuración de entrenamiento degradan la correspondencia entre observación y acción.
- Sin cuantizaciones ni variantes optimizadas: solo se publica safetensors; no hay versiones en ONNX, TensorRT u otros formatos que faciliten el despliegue en hardware embebido.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe el equivalente conductual, es decir, la política puede producir trayectorias plausibles pero incorrectas cuando el estado observado se aleja de la distribución de entrenamiento.
- Sesgos: no evaluados. El dataset procede de teleoperación humana, por lo que puede haber sesgos de estilo de movimiento, velocidad o posiciones preferidas del operador que no están documentados.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte, y el modelo citado (ACT) y LeRobot tienen sus propias condiciones de atribución, recogidas en la sección de cita de la model card.
- Ausencia de salvaguardas de seguridad física: al tratarse de un controlador de robot, debe desplegarse con paradas de emergencia, límites de par y supervisión humana, especialmente en las primeras ejecuciones.
- Fechas del repositorio: la model card figura creada y actualizada el 25 de septiembre de 2026, con 0 descargas y 0 likes, lo que indica que no ha pasado por validación de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Syqnal/act_kitting_connector
- Dataset de entrenamiento: https://huggingface.co/datasets/Syqnal/kitting_connector
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Syqnal/kitting_connector
- Paper de ACT (Action Chunking with Transformers): https://arxiv.org/abs/2304.13705 y https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Modelo relacionado: https://huggingface.co/Syqnal/act_kitting_nut
- Modelo relacionado: https://huggingface.co/Syqnal/act_kitting_nut_v3
