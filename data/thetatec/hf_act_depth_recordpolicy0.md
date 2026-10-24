# Thetatec/hf_act_depth_recordpolicy0

## Resumen

`Thetatec/hf_act_depth_recordpolicy0` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), el método presentado en el paper arXiv 2304.13705, entrenada y publicada con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visuomotor que, a partir del estado articular del robot y de dos cámaras (RGB frontal y profundidad frontal), predice directamente las acciones del robot en lugar de generar texto. Resuelve una tarea concreta de manipulación: coger una caja blanca y negra y colocarla dentro de un cuenco.

El modelo tiene 51.668.614 parámetros (datos reales del safetensors) y ocupa 0,2 GB en el repositorio. Se entrenó sobre el dataset `Thetatec/box-bowl-depth_20261003_105542`, con 40 episodios y 14.967 fotogramas a 30 FPS, capturados mediante teleoperación en un robot de tipo `so_follower` (familia SO-100/SO-101 de LeRobot). La entrada de observación combina un vector de estado de 6 dimensiones, una imagen RGB de 3×720×1280 y un mapa de profundidad de 1×720×1280; la salida es un vector de acción de 6 dimensiones.

Su relevancia es acotada pero clara: es un ejemplo reproducible y ligero de cómo añadir profundidad a una política ACT estándar, con licencia Apache 2.0 y todo el pipeline (dataset, configuración de entrenamiento y comando de despliegue) público. Resulta útil como línea base para investigación en imitación con información de profundidad y como plantilla para entrenar políticas propias con LeRobot, no como un modelo de propósito general. No hay resultados de evaluación en robot real publicados en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación visuomotora con backbone convolucional y transformer encoder-decoder con latente tipo CVAE (según el método del paper 2304.13705) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible / no aplica: no es un modelo de lenguaje. El horizonte relevante es el tamaño del chunk de acciones, no especificado en la model card |
| Tipos de cuantización | No disponible. El repositorio distribuye safetensors sin variantes cuantizadas publicadas (fp32/fp16 no declarado) |
| Idiomas soportados | No disponible / no aplica: no procesa lenguaje natural como entrada; la tarea se pasa como cadena fija (`"Grab the black-white box and place it in the bowl"`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 0,2 GB, librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y suaviza la ejecución. La implementación de LeRobot sigue el esquema del paper: un backbone visual convolucional que procesa las imágenes, un transformer encoder-decoder que fusiona observaciones y estado, y un latente de tipo CVAE que modela la variabilidad de las demostraciones humanas. En inferencia se aplica habitual ensemble temporal de los chunks solapados. En esta política concreta, el backbone procesa dos modalidades: RGB (`observation.images.front`, 3×720×1280) y profundidad (`observation.images.front_depth`, 1×720×1280), que se concatenan como entrada visual junto al estado de 6 dimensiones.

Los datos de entrenamiento proceden de un único dataset de teleoperación con 40 episodios, 14.967 fotogramas a 30 FPS y una sola tarea. La configuración declarada es: 30.000 pasos, batch de 16, optimizador AdamW, learning rate 1e-5, semilla 1000 y LeRobot 0.6.2. No se documenta en la model card el número total de tokens ni de muestras vistas, la composición exacta del dataset más allá del recuento de episodios, ni si hubo etapas de RLHF/DPO (no aplicables en este paradigma: el entrenamiento es supervisado sobre acciones demostradas). Tampoco se detalla la augmentación de datos ni el preprocesado aplicado a las imágenes de 720×1280.

## Capacidades

- Control visuomotor de manipulación: genera comandos de acción de 6 dimensiones (posición/orientación o articulaciones, según la configuración del `so_follower`) a partir de estado + RGB + profundidad.
- Ejecución de una tarea específica de pick-and-place: "coger la caja blanca y negra y colocarla en el cuenco".
- Predicción por chunks de acciones con ensembling temporal (característica del método ACT, no verificada en esta política concreta por falta de evaluación publicada).
- Uso de información de profundidad como canal adicional, lo que en principio ayuda al agarre en 3D y a la estimación de distancias relativas al cuenco.
- Integración nativa con el ecosistema LeRobot: `lerobot-rollout` para ejecución y `lerobot-train` para reentrenamiento o fine-tuning.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, ni capacidades multilingües, de visión general, audio o generación de texto.

## Casos de uso

- Automatización de pick-and-place en laboratorio: usar la política para mover piezas u objetos pequeños de una posición conocida a un contenedor, aprovechando el canal de profundidad para localizar el borde del receptáculo.
- Línea base para investigación en imitación con profundidad: comparar el rendimiento de ACT RGB frente a ACT RGB+D con el mismo presupuesto de datos (40 episodios, 30.000 pasos) para aislar el efecto de la modalidad de profundidad.
- Plantilla de entrenamiento con LeRobot: reutilizar la configuración (AdamW, lr 1e-5, batch 16, 30.000 pasos) como punto de partida para nuevas tareas sobre el mismo robot `so_follower`, reduciendo el coste de puesta a punto.
- Generación de datos sintéticos de evaluación: ejecutar la política en bucle con `lerobot-rollout` para caracterizar modos de fallo (deslizamiento de agarre, colisión con el cuenco) antes de entrenar un modelo mayor.
- Prototipado rápido en robótica de bajo coste: al tener ~52 M de parámetros y 0,2 GB de pesos, se puede desplegar en un PC con GPU consumer conectado al brazo, sin infraestructura de servidor.
- Docencia y demostraciones de aprendizaje por imitación: el par política + dataset público permite ilustrar el ciclo completo teleoperación → entrenamiento → despliegue en una sesión práctica.
- Componente de un pipeline jerárquico: usar un modelo de lenguaje o un planificador de alto nivel para decidir la tarea y esta política como primitiva de manipulación de bajo nivel (requiere adaptar la interfaz, ya que la política no acepta instrucciones variables).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección de evaluación con el texto "No evaluation results have been provided for this policy yet", por lo que no existen tasas de éxito en robot real, número de ensayos ni condiciones de evaluación documentadas.

| Aspecto | Estado |
|---|---|
| Tasa de éxito en robot real | No disponible (sin evaluación publicada) |
| Número de ensayos / protocolo | No disponible |
| Robustez ante cambios de posición, iluminación o distractores | No disponible |
| Comparación con otras políticas | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 207 MB (unos 103 MB en fp16). Con batch 1 y entradas de 720×1280 (RGB + profundidad), las activaciones del backbone dominan el consumo; una estimación orientativa sitúa el total en el rango de 2 a 4 GB de VRAM. No hay mediciones publicadas.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente para inferencia en tiempo real (RTX 3060, RTX 4060, RTX 4090, A100/H100 si se comparte con otros procesos). El entrenamiento con 30.000 pasos y batch 16 es asequible en una GPU consumer de gama media-alta.
- ¿Cabe en GPU consumer? Sí, con holgura; también es viable en CPU para pruebas no críticas, aunque a resoluciones de 720×1280 la latencia por paso será probablemente incompatible con control a 30 FPS.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial, estrategia `base` o con grabación de episodios), scripts de PyTorch sobre la librería `lerobot`. vLLM, TGI, llama.cpp y Ollama no son aplicables a este tipo de política. No se documenta exportación a ONNX ni TensorRT.
- Latencia y throughput: no disponibles. No hay medidas publicadas de frecuencia de control alcanzable ni de tiempo por inferencia; conviene medirlas en el hardware objetivo antes de comprometer una tasa de 30 FPS.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Thetatec/hf_act_depth_recordpolicy0` (este) | ACT con RGB + profundidad, tarea única | 51.668.614 | No aplica (chunk de acciones no especificado) | Apache 2.0 | Hugging Face Hub, 0 descargas, 0 likes |
| `satyajit4517/hf_act_recordpolicy0` | ACT (family LeRobot), tarea única | No disponible en la información proporcionada | No aplica | No disponible | Hugging Face Hub |
| `haymanmk/hf_act_recordpolicy0` | ACT (family LeRobot), tarea única | No disponible en la información proporcionada | No aplica | No disponible | Hugging Face Hub |
| Políticas VLA tipo SmolVLA / pi0 (alternativa conceptual) | Visión-lenguaje-acción, multi-tarea | No disponible en la información proporcionada | No disponible | No disponible | No verificada en esta búsqueda |
| Diffusion Policy (alternativa conceptual de imitación) | Política generativa por difusión | No disponible en la información proporcionada | No aplica | No disponible | No verificada en esta búsqueda |

La comparación significativa aquí no es de benchmarks sino de alcance: frente a políticas VLA multi-tarea, esta ACT está atada a una única instrucción y a un robot concreto, pero es dos o tres órdenes de magnitud más pequeña y se entrena con decenas de episodios en lugar de grandes corpus.

## Limitaciones y advertencias

- Especialización extrema: entrenada para una sola tarea y un solo montaje de robot (`so_follower`) con dos cámaras concretas. No generaliza a otras instrucciones ni a objetos distintos de la caja y el cuenco.
- Sin evaluación publicada: no hay tasa de éxito, ni protocolo de ensayos, ni análisis de fallos. Cualquier afirmación sobre su fiabilidad en producción es especulativa.
- Dataset muy pequeño: 40 episodios y 14.967 fotogramas implican un riesgo alto de sobreajuste a posiciones, iluminación y fondo concretos del entorno de grabación.
- Dependencia del canal de profundidad: si el sensor de profundidad falta, se degrada o cambia su calibración o rango, la política probablemente fallará; no hay variante RGB-only publicada.
- Dependencia de resolución y calibración: la política espera imágenes de 720×1280 y un estado de 6 dimensiones; cambios en la resolución, en el orden de las articulaciones o en la calibración del brazo invalidan el modelo.
- Riesgo de alucinación en sentido amplio: como política de imitación, puede generar acciones plausibles pero incorrectas (por ejemplo, cerrar el agarre en vacío) sin señal de incertidumbre ni mecanismo de rechazo.
- Sesgos: los derivados del operador que teleoperó los 40 episodios (trayectorias, velocidad, punto de agarre preferido) y del entorno físico de grabación.
- Licencia Apache 2.0 en el modelo, lo que permite uso comercial, pero la licencia del dataset de entrenamiento no se detalla en la información disponible; conviene verificarla antes de un despliegue comercial.
- Sin salvaguardas de seguridad física: el modelo no incluye parada de emergencia, limitación de par ni detección de colisiones; su uso en un robot real requiere capas de seguridad externas.
- Idiomas: no aplica; la cadena de tarea es fija y el modelo no comprende variaciones de la instrucción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thetatec/hf_act_depth_recordpolicy0
- Dataset de entrenamiento: https://huggingface.co/datasets/Thetatec/box-bowl-depth_20261003_105542
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Thetatec/box-bowl-depth_20261003_105542
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv 2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
