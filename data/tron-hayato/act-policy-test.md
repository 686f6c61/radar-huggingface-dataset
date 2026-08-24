# Tron-Hayato/act-policy-test

## Resumen

`Tron-Hayato/act-policy-test` es una política de robótica basada en el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales. El modelo ha sido desarrollado por el usuario Tron-Hayato (Hayato Nakamura) y entrenado con la librería LeRobot de Hugging Face, una herramienta de código abierto para el aprendizaje por imitación en robótica.

El modelo resuelve el problema del control de un robot seguidor (tipo `so_follower`) mediante teleoperación, aprendiendo a ejecutar la tarea "Grab the object" (agarrar el objeto) a partir de observaciones visuales de dos cámaras (frontal y de muñeca) y el estado del robot. La relevancia de este modelo reside en su carácter demostrativo: está entrenado con un dataset muy reducido de 6 episodios y 2700 frames, lo que lo convierte en un ejemplo práctico de entrenamiento rápido de políticas robóticas con LeRobot.

Arquitectónicamente, ACT combina un codificador de visión con un transformer que genera chunks de acciones, permitiendo una ejecución robusta incluso con datos de entrenamiento limitados. El modelo cuenta con 51.668.614 parámetros, se distribuye en formato safetensors y se publica bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT), basada en Transformer con codificadores de vision |
| Parametros totales | 51.668.614 (aproximadamente 51,7 millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa el método ACT (Action Chunking with Transformers), descrito en el paper `arXiv:2304.13705`. ACT es un enfoque de aprendizaje por imitación que divide la predicción de acciones en "chunks" (tramos) de varios pasos en lugar de predecir una única acción por paso. La arquitectura combina un codificador de visión con un transformer que procesa las observaciones y genera un tramo de acciones de longitud fija. El modelo consume como entrada el estado del robot (vector de 6 dimensiones) y dos imágenes de 480x640 píxeles (cámara frontal y cámara de muñeca), y produce una salida de acción de 6 dimensiones.

El entrenamiento se realizó con la librería LeRobot (versión 0.6.1) sobre un dataset de teleoperación con 6 episodios y 2700 frames a 30 FPS, con la tarea única "Grab the object". La configuración de entrenamiento incluye 12.000 pasos, tamaño de batch 8, optimizador AdamW y una tasa de aprendizaje de 1e-5. No se ha aplicado ningún proceso de ajuste por preferencias (RLHF/DPO) ni técnicas de refinamiento adicionales; se trata de un entrenamiento estándar de aprendizaje por imitación.

## Capacidades

- Control de robot por imitación: el modelo es capaz de ejecutar una política de agarre de objetos sobre un robot de tipo `so_follower` a partir de datos teleoperados.
- Percepción multimodal: integra dos entradas visuales (cámara frontal y de muñeca) junto con el estado del robot (posición/velocidad, 6 dimensiones) para generar acciones.
- Generación de acciones en chunks: predice secuencias de acciones de longitud corta, lo que mejora la estabilidad del control frente a la predicción paso a paso.
- Integración con LeRobot: se puede cargar y ejecutar directamente con los comandos `lerobot-rollout` y `lerobot-train`, lo que facilita su reproducción y despliegue.
- Entrenamiento rápido: con solo 12.000 pasos y un dataset de 6 episodios, el modelo demuestra que es posible obtener una política funcional con recursos limitados.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas; es un modelo exclusivamente robótico.

## Casos de uso

- Prototipado de políticas robóticas: el modelo sirve como punto de partida para evaluar el flujo de trabajo de LeRobot, desde la grabación de datos teleoperados hasta el entrenamiento y la ejecución en un robot real.
- Investigación en aprendizaje por imitación: permite reproducir el método ACTUAL sobre un dataset pequeño y comparar resultados con otras arquitecturas en el mismo entorno.
- Demostración de agarre de objetos: puede utilizarse para controlar un robot tipo `so_follower` en tareas de agarre de objetos en entornos controlados de laboratorio.
- Formación y docencia: es un ejemplo didáctico para enseñar el flujo completo de LeRobot, incluyendo la grabación de datos, el entrenamiento y la inferencia en un robot.
- Pruebas de integración de hardware: al ser un modelo ligero (51,7M de parámetros), es adecuado para validar la configuración de cámaras, puertos y robots antes de escalar a modelos más grandes.
- Base para experimentos de aumento de datos: el dataset de 2700 frames puede combinarse con técnicas de aumento o recolección adicional para estudiar cómo mejora la tasa de éxito con más datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se dispone de datos comparativos de tasa de éxito ni métricas de rendimiento en tareas estándar de robótica.

## Requisitos de hardware

- VRAM estimada: no se indica oficialmente, pero con 51,7 millones de parámetros y entradas de imagen de 480x640, se estima que la inferencia en tiempo real requiere una GPU NVIDIA con al menos 4 GB de VRAM (por ejemplo, RTX 3060 o superior).
- GPU recomendada: una GPU de gama media como RTX 3060, RTX 4060 o superior es suficiente para inferencia; para entrenamiento, se recomienda una GPU con 8 GB o más de VRAM.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo medio sin problemas.
- Opciones de despliegue: el modelo se integra con el framework LeRobot, que ofrece comandos CLI (`lerobot-rollout`) para ejecución en robot real. No está pensado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible; dependerá del hardware de la GPU y del robot utilizado.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en la información proporcionada. El modelo es un ejemplo específico de política ACTUAL entrenada con LeRobot; existen otros repositorios en Hugging Face con políticas similares (por ejemplo, `MaChao615/act_policy_test` o `CRPlab/lekiwi_test_act_policy_1`), pero no se han encontrado datos comparativos públicos de rendimiento entre ellos.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: solo 6 episodios y 2700 frames, lo que puede limitar la generalización a variaciones del entorno o de la tarea.
- Tarea única: el modelo solo ha sido entrenado para la tarea "Grab the object"; no es transferible a otras tareas sin reentrenamiento.
- Dependencia de hardware específico: la política está diseñada para el robot tipo `so_follower` y las cámaras `front` y `wrist`; cualquier cambio en la configuración de hardware requiere reentrenamiento.
- Sin evaluación en robot real: no hay resultados de pruebas físicas, por lo que el rendimiento real en el robot puede diferir del esperado.
- Riesgo de comportamiento errático en entornos no vistos: como todo modelo de aprendizaje por imitación, puede fallar ante objetos en posiciones no vistas o con iluminación distinta.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda verificar los términos de la licencia de los datasets y componentes de LeRobot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tron-Hayato/act-policy-test
- Dataset de entrenamiento: https://huggingface.co/datasets/Tron-Hayato/record-test_20260824_094829
- Paper de ACTUAL (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACTUAL: https://huggingface.co/docs/lerobot/main/en/act
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Tron-Hayato/record-test_20260824_094829
