# zonglin11/humanaopen_test_smolvla

## Resumen

Este repositorio contiene un fine-tune del modelo SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto de 450 millones de parámetros desarrollado por Hugging Face. SmolVLA combina un modelo de lenguaje y visión preentrenado con un "experto de acción" entrenado mediante flow matching, y está diseñado para ejecutarse en hardware de consumo, lo que lo hace accesible para robótica de bajo coste.

El fine-tune concreto `zonglin11/humanaopen_test_smolvla` ha sido entrenado sobre un dataset de demostración extremadamente reducido (2 episodios, 898 frames) para una tarea denominada "humana-test", utilizando el robot `humanaopen_client` con tres cámaras (head, left_wrist, right_wrist). Se trata de un experimento de validación del flujo de trabajo de LeRobot más que de un modelo listo para producción, dado el volumen de datos y el número de pasos de entrenamiento (20).

La relevancia de este modelo radica en que demuestra el proceso completo de fine-tuning de SmolVLA sobre datos propios, sirviendo como ejemplo práctico para desarrolladores que quieran adaptar el modelo base a sus propios robots y tareas. El modelo base SmolVLA, por su parte, es relevante por su eficiencia: consigue rendimiento competitivo con modelos mucho más grandes a una fracción del coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con VLM compacto y experto de acción con flow matching |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo de robótica, las instrucciones de tarea son en inglés en el dataset) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA que combina un modelo de visión-lenguaje (VLM) compacto preentrenado con un "action expert" entrenado mediante flow matching. Dado un conjunto de imágenes y una instrucción en lenguaje natural, el modelo genera un chunk de acciones (secuencia de acciones futuras). La arquitectura está optimizada para ser eficiente en inferencia y poder desplegarse en GPUs de consumo.

Este fine-tune concreto parte del checkpoint base `lerobot/smolvla_base` y se ha entrenado con el framework LeRobot (versión 0.6.1) sobre un dataset propio (`zonglin11/humanaopen_test1_20260831_233202`) que contiene 2 episodios y 898 frames a 30 FPS. La configuración de entrenamiento incluye 20 pasos, batch size de 4, optimizador AdamW, learning rate de 0.0001 y seed 1000. Las observaciones consisten en el estado del robot (vector de 21 dimensiones) y tres imágenes RGB de 480x640 (cámara de cabeza, muñeca izquierda y muñeca derecha), y la salida es un vector de acción de 21 dimensiones.

## Capacidades

- Generación de acciones de control para robots manipuladores a partir de observaciones visuales y de estado.
- Procesamiento de múltiples cámaras simultáneas (head, left_wrist, right_wrist) con resolución de 480x640.
- Ejecución de tareas de manipulación definidas por instrucciones en lenguaje natural (en este caso, la tarea "humana-test").
- Fine-tuning sobre datos propios mediante el flujo de trabajo de LeRobot (imitation learning).
- Inferencia en tiempo real a 30 FPS, compatible con el robot `humanaopen_client`.
- No soporta tool calling, agentes ni razonamiento multi-paso fuera del ámbito robótico.

## Casos de uso

- Validación del flujo de trabajo de LeRobot: este modelo sirve como ejemplo de cómo fine-tunear SmolVLA sobre un dataset propio, útil para desarrolladores que quieran aprender el proceso antes de aplicarlo a sus propios datos.
- Prototipado rápido de políticas robóticas: con un dataset pequeño se puede obtener una política funcional para probar la integración hardware-software en un robot `humanaopen_client`.
- Demostración de despliegue en hardware de consumo: al ser un modelo de 450M parámetros, puede ejecutarse en GPUs de gama media, lo que permite probar el pipeline completo en un laboratorio sin infraestructura costosa.
- Base para experimentos de fine-tuning incremental: partiendo de este checkpoint, se puede continuar el entrenamiento con más datos para mejorar el rendimiento en la tarea específica.
- Evaluación de la calidad de datos: al estar entrenado con solo 2 episodios, sirve para diagnosticar problemas en la captura de datos (calibración de cámaras, sincronización, etc.).
- Investigación en aprendizaje por imitación: permite comparar el rendimiento de SmolVLA con otros VLA en tareas de manipulación sencillas, aunque con limitaciones estadísticas por el tamaño del dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este fine-tune concreto. La model card indica explícitamente que no hay resultados de evaluación en robot real. El modelo base SmolVLA, según el paper (arXiv:2506.01844), demuestra rendimiento competitivo frente a modelos significativamente más grandes en benchmarks de simulación y robótica real, pero estos datos no son aplicables directamente a este fine-tune de demostración.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero al tratarse de un modelo de 450M parámetros, se estima que cabe en GPUs con 8-12 GB de VRAM en precisión FP16.
- GPU recomendadas: RTX 3060/4060 (12 GB), RTX 4070 o superiores. También compatible con GPUs de datacenter como A100 si se requiere mayor throughput.
- Sí cabe en GPUs de consumo: es uno de los objetivos principales de SmolVLA.
- Opciones de despliegue: LeRobot (librería principal), con soporte para inferencia local mediante `lerobot-rollout`. También se puede usar con vLLM o TGI si se adapta, aunque el flujo estándar es LeRobot.
- Latencia y throughput: no disponible para este fine-tune. El modelo base está diseñado para operar a 30 FPS con las cámaras configuradas, pero depende del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| SmolVLA (base) | 450M | no disponible | Apache-2.0 | Robótica VLA generalista |
| zonglin11/humanaopen_test_smolvla (este) | 450M | no disponible | Apache-2.0 | Fine-tune de demostración para tarea "humana-test" |
| OpenVLA (7B) | 7.000M | no disponible | MIT | Robótica VLA de mayor escala |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros y licencia.

## Limitaciones y advertencias

- Dataset de entrenamiento extremadamente reducido (2 episodios, 898 frames), lo que hace que la política no sea robusta ni generalizable. No debe usarse en producción.
- Solo 20 pasos de entrenamiento, insuficientes para converger adecuadamente en la mayoría de tareas robóticas.
- Sin resultados de evaluación en robot real: la model card indica que no se han proporcionado resultados de evaluación.
- El modelo está entrenado para una tarea específica ("humana-test") y un robot concreto (`humanaopen_client`); no es transferible a otros robots sin reentrenamiento.
- Riesgo de sobreajuste severo al dataset de entrenamiento, con posible alucinación de acciones en situaciones no vistas.
- Las cámaras deben coincidir exactamente con las utilizadas en el entrenamiento (head, left_wrist, right_wrist) y la resolución debe ser 480x640.
- Licencia Apache-2.0 permite uso comercial, pero el modelo no es apto para producción debido a su naturaleza de demostración.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zonglin11/humanaopen_test_smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/zonglin11/humanaopen_test1_20260831_233202
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Web del proyecto SmolVLA: https://smolvla.net/index_en
- Blog de Hugging Face sobre SmolVLA: https://github.com/huggingface/blog/blob/main/smolvla.md
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
