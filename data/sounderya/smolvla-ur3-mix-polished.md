# Sounderya/smolvla-ur3-mix-polished

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto desarrollado por Hugging Face, diseñado para tareas de manipulación robótica con un coste computacional reducido. Este repositorio concreto, `Sounderya/smolvla-ur3-mix-polished`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset propio de 120 episodios (91.365 frames) que captura la tarea de recoger una taza y colocarla en un plato con un brazo robótico UR3. El modelo tiene 450 millones de parámetros y se distribuye bajo licencia Apache-2.0, lo que permite su uso comercial sin restricciones.

La relevancia de este modelo radica en que demuestra la viabilidad de ajustar y desplegar un VLA en hardware de consumo, como una GPU RTX 4060 con 8 GB de VRAM, algo que hasta hace poco estaba reservado a modelos de varios miles de millones de parámetros. Al estar integrado en el ecosistema LeRobot, cualquier investigador o desarrollador puede reproducir el entrenamiento, evaluar la política en su propio robot y adaptarla a nuevas tareas con un esfuerzo mínimo. El modelo consume tres imágenes de cámara (muñeca y laterales) y el estado del robot (6 dimensiones), y produce un chunk de 10 acciones de control.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (VLM compacto + action expert con flow matching) |
| Parametros totales | 450.046.176 (450M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | no disponible (instrucciones en inglés según el dataset) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA combina un modelo de lenguaje y visión (VLM) preentrenado y compacto con un "action expert" entrenado mediante flow matching. Dado un conjunto de imágenes de múltiples cámaras y una instrucción en lenguaje natural, el modelo genera un chunk de acciones que el robot ejecuta de forma autoregresiva. Esta arquitectura permite que el modelo sea lo suficientemente pequeño para fine-tuning en una sola GPU de consumo, manteniendo un rendimiento competitivo frente a VLA más grandes.

El fine-tuning de este repositorio partió del checkpoint `lerobot/smolvla_base` y se entrenó durante 1.000 pasos con un batch size de 64, optimizador AdamW y una tasa de aprendizaje de 1e-05, utilizando la librería LeRobot en su versión 0.6.1. El dataset de entrenamiento (`Sounderya/mug_smolvla_dataset_v2nc`) contiene 120 episodios grabados a 30 FPS con dos cámaras (muñeca y lateral derecha), aunque la entrada del modelo espera tres imágenes. La tarea única es "Pick the mug and place it on the plate", lo que limita la generalización a otras instrucciones.

## Capacidades

- Manipulación robótica de precisión: el modelo controla un brazo UR3 para ejecutar tareas de pick-and-place, generando acciones de 10 dimensiones (posición, orientación y posiblemente velocidad).
- Seguimiento de instrucciones en lenguaje natural: interpreta la instrucción "Pick the mug and place it on the plate" y la traduce en una secuencia de acciones.
- Percepción multimodal: procesa simultáneamente tres imágenes de 256x256 píxeles procedentes de cámaras montadas en el robot, junto con el estado propioceptivo del brazo (6 valores).
- Generación de chunks de acciones: produce bloques de 10 acciones que permiten una ejecución suave y sin necesidad de re-planificación constante.
- Entrenamiento por imitación: aprende directamente de demostraciones humanas registradas en el dataset, sin necesidad de recompensas explícitas ni simulación.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para robótica, incluyendo herramientas de registro de datos, entrenamiento y despliegue.

## Casos de uso

- Automatización de líneas de montaje: el modelo puede controlar un brazo robótico para recoger piezas de una cinta transportadora y colocarlas en una posición determinada, reduciendo el coste de programación manual.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo los VLA compactos se comportan en tareas de manipulación real, permitiendo comparar con modelos más grandes.
- Prototipado rápido de políticas robóticas: un laboratorio puede grabar 120 episodios de una tarea nueva, fine-tunear este modelo en una GPU de consumo y desplegarlo en el robot en menos de un día.
- Educación y formación en robótica: al ser un modelo pequeño y con licencia abierta, es ideal para que estudiantes aprendan a entrenar y evaluar políticas de manipulación sin necesidad de infraestructura costosa.
- Control de brazos colaborativos en entornos de investigación: el modelo puede adaptarse a tareas de recogida y colocación de objetos en laboratorios que utilicen robots UR3 o similares.
- Benchmarking de VLA en hardware asequible: permite evaluar el rendimiento de un VLA de 450M en tareas reales frente a alternativas de mayor tamaño, ayudando a decidir si un modelo pequeño es suficiente para una aplicación concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real para esta política. El paper original de SmolVLA (arXiv:2506.01844) reporta métricas comparativas en entornos estándar de manipulación, pero no se dispone de esos datos en la información proporcionada para este fine-tuning concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero el fine-tuning se ha demostrado en una GPU RTX 4060 con 8 GB de VRAM, por lo que la inferencia debería caber en GPUs de consumo con al menos 8 GB.
- GPU recomendadas: RTX 4060, RTX 4070, RTX 3090, A100 (para entrenamiento más rápido). Cualquier GPU con soporte CUDA y suficiente VRAM es válida.
- Compatibilidad con consumer GPU: sí, es uno de los objetivos principales de SmolVLA. Una RTX 4060 de 8 GB es suficiente para fine-tuning e inferencia.
- Opciones de despliegue: el modelo se ejecuta mediante la librería LeRobot, que proporciona los comandos `lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de texto generativo.
- Latencia y throughput: no disponible. Depende de la GPU, del número de cámaras y de la frecuencia de control del robot. Con 30 FPS de entrada y un chunk de 10 acciones, se espera que la inferencia sea en tiempo real en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA (este fine-tune) | 450M | no disponible | Apache-2.0 | Hugging Face |
| OpenVLA | 7B | no disponible | MIT | Hugging Face |
| RT-2 (Google) | 55B | no disponible | propietaria | no público |

No se dispone de datos de rendimiento comparativo para este fine-tuning específico. SmolVLA se posiciona como una alternativa mucho más ligera que OpenVLA (450M frente a 7B), lo que permite su ejecución en hardware de consumo, aunque a costa de una menor capacidad de generalización a tareas diversas. RT-2 no es accesible públicamente, por lo que la comparación práctica se limita a modelos open source.

## Limitaciones y advertencias

- Entrenado para una única tarea: el modelo solo ha aprendido a recoger una taza y colocarla en un plato. No generalizará a otras instrucciones u objetos sin un nuevo fine-tuning.
- Sin evaluación en robot real: la model card no reporta resultados de éxito en ejecución física, por lo que el rendimiento real en el robot es desconocido.
- Dependencia de la configuración de cámaras: el modelo espera tres imágenes de 256x256. Si el robot no tiene exactamente esa disposición de cámaras, la política fallará.
- Riesgo de sobreajuste al dataset: con solo 120 episodios y una tarea fija, el modelo puede memorizar las demostraciones y fallar ante variaciones de iluminación, posición de objetos o distracciones.
- Sin soporte de tool calling ni razonamiento conversacional: es un modelo de control motor, no un asistente de lenguaje. No se puede utilizar para tareas de texto o código.
- Licencia Apache-2.0: permite uso comercial, pero el usuario debe asumir la responsabilidad de cualquier daño derivado del uso del modelo en sistemas robóticos.
- Fecha de creación futura: el repositorio está fechado en agosto de 2026, lo que sugiere que puede ser un artefacto de prueba o un error de metadatos. Verificar la validez del modelo antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Sounderya/smolvla-ur3-mix-polished
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Sounderya/mug_smolvla_dataset_v2nc
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Ejemplo de fine-tuning en RTX 4060: https://github.com/wycliffeoleti/smolVLA
