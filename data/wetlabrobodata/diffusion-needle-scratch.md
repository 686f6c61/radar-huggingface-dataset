# WetLabRoboData/diffusion-needle-scratch

## Resumen

diffusion-needle-scratch es una política robótica de difusión (diffusion policy) publicada por WetLabRoboData dentro del ecosistema LeRobot de Hugging Face. No es un modelo de lenguaje: se trata de un modelo de imitación que genera secuencias de acciones motoras a partir de observaciones visuales y del estado del robot, entrenado específicamente para una única tarea denominada needle. La variante "scratch" indica que se entrenó únicamente con los datos de esa tarea, sin inicialización a partir de un checkpoint previo.

El modelo cuenta con 264.873.854 parámetros (aproximadamente 265 millones) y un repositorio de 1,1 GB en formato safetensors. Está diseñado para un robot UR3e bimanual equipado con tres cámaras, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia es acotada pero clara: sirve como referencia reproducible de una política de difusión entrenada desde cero para una tarea de manipulación de precisión, con un protocolo de evaluación explícito de 20 episodios y 15 éxitos (75 % de tasa de éxito). Es material útil para investigación en aprendizaje por imitación y como punto de partida para fine-tuning, más que como componente de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (familia diffusion de LeRobot); red de denoising condicionada por observaciones. Detalle interno del backbone no disponible |
| Parametros totales | 264.873.854 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: es una política robótica, no un modelo de lenguaje. Horizonte de observación y de ejecución de acciones no disponibles |
| Tipos de cuantizacion | no disponible (se distribuyen pesos safetensors en la precisión de entrenamiento) |
| Idiomas soportados | no aplica (modelo de control motor, sin entrada ni salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |
| Tarea | needle |
| Robot objetivo | UR3e bimanual con 3 cámaras |
| Dataset de entrenamiento | WetLabRoboData/lerobot-data-needle |
| Variante | Scratch (entrenada solo con los datos de esta tarea) |
| Tamaño del repositorio | 1,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo pertenece a la familia de diffusion policies implementadas en LeRobot: en lugar de predecir directamente una acción, el modelo aprende a invertir un proceso de difusión para generar muestras de trayectorias de acción condicionadas por las observaciones. Este enfoque permite representar distribuciones multimodales de comportamiento, algo relevante en tareas de manipulación donde existen varias formas válidas de completar un movimiento. El número exacto de pasos de denoising, el tipo de scheduler y la arquitectura concreta del denoiser no están documentados en la información disponible.

El entrenamiento es de aprendizaje por imitación (imitation learning) sobre el dataset WetLabRoboData/lerobot-data-needle, recogido con un UR3e bimanual y tres cámaras. La variante "scratch" implica que no se partió de un checkpoint previo ni de datos de otras tareas, de modo que toda la capacidad del modelo está especializada en la tarea needle. No se documenta en la información disponible si hubo etapas de RLHF, DPO u optimización posterior al entrenamiento supervisado, ni el número de tokens, episodios o demostraciones del dataset. La model card indica que el modelo se reorganizó el 4 de octubre de 2026 a partir del repositorio WetLabRoboData/lerobot-data-smrithi-needle_20260707_success, y que los artefactos de entrenamiento originales (checkpoints, train_config.json, directorio wandb/) se conservan en la subcarpeta old/ del repositorio de origen para trazabilidad.

## Capacidades

- Generación de acciones motoras: produce secuencias de acción (action chunks) para controlar un robot bimanual UR3e.
- Condicionamiento multimodal de entrada: consume observaciones de tres cámaras junto con el estado del robot para generar el comportamiento.
- Ejecución de una tarea concreta: la tarea needle, con una tasa de éxito medida del 75 % en 20 episodios de evaluación.
- Aprendizaje por imitación: reproduce políticas aprendidas de demostraciones humanas o teleoperadas, sin necesidad de un modelo de recompensa explícito.
- Control bimanual: el robot objetivo emplea dos brazos, por lo que la política está preparada para coordinar acciones de ambos.
- Ajuste fino: al ser una política LeRobot estándar, es susceptible de fine-tuning con datos propios de una tarea similar.
- Sin soporte de tool calling, function calling ni razonamiento multi-paso simbólico: no es un modelo de lenguaje ni un agente conversacional.
- Sin capacidades multilingües, de visión general, audio o generación de texto.

## Casos de uso

- Automatización de manipulación de precisión en laboratorio: el modelo puede ejecutar la secuencia de la tarea needle de forma autónoma sobre un UR3e bimanual, reduciendo la intervención manual en operaciones repetitivas de precisión.
- Punto de partida para fine-tuning en tareas afines: al estar entrenada desde cero sobre una sola tarea, la política sirve como inicialización para reentrenar con datos de tareas de inserción o ensartado similares, aprovechando el conocimiento visual adquirido.
- Línea base en investigación sobre diffusion policies: permite comparar variantes (diffusion frente a ACT o frente a políticas basadas en transformers de action chunking) sobre un protocolo de evaluación documentado de 20 episodios.
- Validación de pipelines de recogida de datos: el par dataset de entrenamiento y dataset de evaluación asociados permiten reproducir el flujo completo de captura, entrenamiento y rollout con LeRobot.
- Evaluación de robustez ante variaciones de iluminación y calibración: los rollouts documentados en WetLabRoboData/eval-diffusion-needle-scratch permiten analizar en qué condiciones falla la política, dado el 25 % de episodios no exitosos.
- Demostración educativa de aprendizaje por imitación robótico: un modelo de ~265 millones de parámetros entrenado desde cero es un ejemplo compacto para cursos y tutoriales sobre LeRobot y políticas de difusión.
- Integración en celdas robotizadas con supervisión humana: la política puede desplegarse en un esquema de ejecución supervisada, con parada automática ante detección de fallo, dado que su tasa de éxito no es total.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La única métrica de rendimiento documentada es la evaluación propia de la tarea, recogida en la model card:

| Metrica | Valor |
|---|---|
| Tarea evaluada | needle |
| Episodios de evaluación | 20 |
| Episodios exitosos | 15 / 20 |
| Tasa de éxito | 75 % |
| Robot de evaluación | UR3e bimanual con 3 cámaras |
| MMLU, HumanEval, GSM8K u otros benchmarks de lenguaje | no aplica (no es un modelo de lenguaje) |
| Comparación con otras políticas sobre el mismo benchmark | no disponible |

## Requisitos de hardware

- Peso de los parámetros: 264.873.854 parámetros equivalen a aproximadamente 1,06 GB en FP32, coherente con el tamaño de repositorio declarado de 1,1 GB.
- VRAM estimada para inferencia: no publicada por el autor. Como referencia derivada del recuento de parámetros, los pesos en FP32 ocupan en torno a 1,1 GB, a lo que hay que sumar activaciones, búferes de imagen de las tres cámaras y el coste de los pasos de denoising, cuyo número no está documentado.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo es holgadamente ejecutable en GPUs de consumo y de centro de datos, incluidas RTX 3060 de 12 GB, RTX 4090, A100 o H100.
- Viabilidad en GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM, dado el tamaño del modelo; se trata de una estimación y no de un requisito confirmado por el autor.
- Opciones de despliegue: LeRobot con PyTorch, mediante `DiffusionPolicy.from_pretrained("WetLabRoboData/diffusion-needle-scratch")`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a una política robótica), ni exportación a ONNX o TensorRT.
- Latencia y throughput: no disponibles. En políticas de difusión la latencia depende críticamente del número de pasos de denoising y de la frecuencia de control del robot, parámetros que no se detallan.

## Comparativa con modelos similares

No se dispone de datos numéricos publicados para establecer una comparación cuantitativa con alternativas. La comparación siguiente es cualitativa y se basa en la familia de políticas disponibles en el ecosistema LeRobot; los valores marcados como no disponibles no se han podido confirmar en la información proporcionada.

| Modelo | Familia | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diffusion-needle-scratch | Diffusion policy (LeRobot) | 264.873.854 | no disponible | Apache 2.0 | Hugging Face, LeRobot |
| ACT (action chunking transformer, LeRobot) | Transformer con action chunking | no disponible | no disponible | no disponible | LeRobot |
| SmolVLA (LeRobot) | Vision-language-action | no disponible | no disponible | no disponible | LeRobot |
| pi0 (LeRobot) | Vision-language-action | no disponible | no disponible | no disponible | LeRobot |

Diferencias cualitativas relevantes: las políticas de difusión modelan distribuciones multimodales de acción y suelen requerir varios pasos de denoising por inferencia, mientras que las basadas en action chunking transformer generan el bloque de acciones en un único paso. Las políticas del tipo vision-language-action incorporan instrucciones en lenguaje natural, capacidad de la que diffusion-needle-scratch carece por completo.

## Limitaciones y advertencias

- Especialización extrema: la variante scratch se entrenó solo con datos de la tarea needle, por lo que no generaliza a otras tareas sin reentrenamiento o fine-tuning.
- Sin entrada de lenguaje: no acepta instrucciones en texto ni permite control condicional por prompt.
- Tasa de fallo no despreciable: 5 de 20 episodios de evaluación no tuvieron éxito, lo que implica un 25 % de fallos en el protocolo documentado.
- Sensibilidad al entorno: al depender de tres cámaras y de un UR3e bimanual concreto, cambios de calibración, iluminación, disposición de la mesa u objetos pueden degradar el rendimiento. No se documenta ningún estudio de robustez.
- Riesgo de sobreajuste: no se especifica el tamaño del dataset de entrenamiento ni el número de demostraciones, lo que impide valorar el grado de sobreajuste a las condiciones de captura.
- Deriva de distribución: como toda política de imitación, puede producir acciones fuera de la distribución aprendida ante estados no vistos. No debe confundirse con "alucinación" en el sentido de los modelos de lenguaje, aunque comparte el riesgo de generar salidas plausibles pero incorrectas.
- Idiomas: no aplica; el modelo no procesa ni genera texto.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indique si hubo cambios. No se declaran restricciones adicionales de uso.
- Seguridad en producción: al tratarse de una política que controla un robot físico, cualquier despliegue real exige monitorización, límites de fuerza, paradas de emergencia y supervisión humana. El modelo no incorpora mecanismos de seguridad documentados.
- Trazabilidad: el modelo se reorganizó el 4 de octubre de 2026 desde otro repositorio; los artefactos de entrenamiento originales quedan en la subcarpeta old/ del origen, pero no se incluyen en este repositorio.
- Cero adopción registrada: el repositorio presenta 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación externa de su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WetLabRoboData/diffusion-needle-scratch
- Dataset de entrenamiento: https://huggingface.co/datasets/WetLabRoboData/lerobot-data-needle
- Dataset de evaluación (vídeos de rollout y resultados por episodio): https://huggingface.co/datasets/WetLabRoboData/eval-diffusion-needle-scratch
- Repositorio de origen con artefactos archivados: https://huggingface.co/datasets/WetLabRoboData/lerobot-data-smrithi-needle_20260707_success
- Documentación y código de LeRobot: https://github.com/huggingface/lerobot
- Resultados de la búsqueda web: los enlaces recuperados (cuadernos de introducción a modelos de difusión, un curso del MIT sobre flow matching y el modelo Needle 3 de Cactus) no guardan relación con este modelo y no se consideran fuentes relevantes para esta ficha.
