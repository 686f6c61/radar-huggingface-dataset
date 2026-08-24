# zonglin11/humanaopen_test_act

## Resumen

El modelo `zonglin11/humanaopen_test_act` es una política de control robótico entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice secuencias de acciones en lugar de pasos individuales. El autor, zonglin11, lo ha publicado en Hugging Face utilizando la librería LeRobot de Hugging Face, diseñada para facilitar el entrenamiento y despliegue de políticas robóticas en el mundo real. El modelo está pensado para operar sobre un robot de tipo `humanaopen` equipado con tres cámaras (cabeza, muñeca izquierda y muñeca derecha).

ACT es relevante porque aborda el problema del control fino de robots manipuladores mediante demostraciones teleoperadas, logrando altas tasas de éxito en tareas de manipulación. Este modelo concreto es una prueba experimental: se ha entrenado con un conjunto de datos muy reducido (2 episodios, 898 fotogramas) y únicamente 5 pasos de entrenamiento, por lo que su utilidad práctica es limitada y sirve principalmente como demostración del flujo de trabajo de LeRobot. La arquitectura es un Transformer con 51,7 millones de parámetros, con una ventana de contexto que procesa observaciones multimodales (estado del robot y tres imágenes).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.699.349 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa chunks de acciones de 21 dimensiones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo de control robótico, no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ACT descrita en el artículo *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (arXiv:2304.13705). ACT es un método de aprendizaje por imitación basado en Transformer que predice bloques de acciones (chunks) de longitud fija, en lugar de una única acción por paso. Esto reduce el error de acumulación temporal y mejora la estabilidad del control. La política se entrena con demostraciones teleoperadas y, en este caso, se ha integrado en el ecosistema LeRobot.

El entrenamiento se realizó con el dataset `zonglin11/humanaopen_test_20260823_110640`, que contiene 2 episodios y 898 fotogramas a 30 FPS, con la tarea etiquetada como "test". La configuración de entrenamiento incluye 5 pasos, tamaño de lote 3, optimizador AdamW con tasa de aprendizaje de 1e-05, semilla 1000 y LeRobot versión 0.6.1. No se indica el uso de RLHF, DPO ni técnicas de refuerzo adicionales; se trata de un entrenamiento de aprendizaje por imitación puro. La política consume como entrada el estado del robot (21 dimensiones) y tres imágenes RGB de 480x640 píxeles, y produce una acción de 21 dimensiones.

## Capacidades

- Control robótico de manipulación bimanual: el modelo genera acciones de 21 dimensiones para el robot `humanaopen` a partir de observaciones de estado y visión.
- Aprendizaje por imitación: reproduce comportamientos teleoperados capturados en el dataset de entrenamiento.
- Entrada multimodal: combina estado del robot (vector de 21 valores) con imágenes de tres cámaras (cabeza, muñeca izquierda y muñeca derecha).
- Predicción de chunks de acción: genera secuencias de acciones completas, lo que mejora la suavidad del movimiento frente a métodos de predicción paso a paso.
- No dispone de capacidades de tool calling, razonamiento simbólico, generación de texto o procesamiento de lenguaje natural.
- No es multilingüe: el modelo no procesa entrada textual.

## Casos de uso

- Demostración de pipeline de entrenamiento robótico: el modelo sirve como ejemplo funcional de cómo entrenar y desplegar una política ACT con LeRobot, útil para desarrolladores que inician en robótica de imitación.
- Evaluación de hardware de robótica: puede utilizarse para verificar la conectividad de cámaras y el puerto del robot en un entorno de pruebas, aunque su rendimiento real no ha sido validado.
- Experimentación académica: investigadores pueden usar este modelo como punto de partida para estudiar el efecto del tamaño del dataset y el número de pasos de entrenamiento en el rendimiento de ACT.
- Desarrollo de controladores bimanuales: la arquitectura ACT permite explorar tareas de manipulación bimanual (como ensamblaje o agarre) aunque este modelo concreto no ha sido evaluado en ninguna tarea real.
- Integración con LeRobot: sirve como referencia para entender el formato de observaciones y acciones que espera el framework LeRobot en el robot `humanaopen`.
- Prototipado de políticas con datos reducidos: el entrenamiento con solo 2 episodios demuestra la viabilidad técnica de generar un checkpoint funcional, útil para validar infraestructura de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación de la política en el robot real. No existen datos de éxito en tareas específicas ni comparaciones con otros modelos.

## Requisitos de hardware

- El modelo tiene 51,7 millones de parámetros y un tamaño de repositorio de 0,2 GB, por lo que es muy ligero.
- VRAM estimada para inferencia: inferior a 1 GB en FP32, pudiendo caber en cualquier GPU comercial (incluso en GPU integradas si se usa cuantización).
- GPU recomendadas: cualquier GPU NVIDIA con al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4090). No requiere GPU de datacenter.
- Puede ejecutarse en una sola GPU de consumo (RTX 3060 o superior) sin problemas.
- Opciones de despliegue: el modelo está diseñado para ejecutarse mediante `lerobot-rollout` en el framework LeRobot. No se ha publicado soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La inferencia depende del robot y del hardware de visión; con 51M parámetros la latencia de la red es del orden de milisegundos, pero la captura de imágenes y el control del robot dominan el ciclo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Tarea |
|---|---|---|---|---|---|
| `zonglin11/humanaopen_test_act` | 51,7 M | no disponible | Apache 2.0 | Hugging Face | Control bimanual por imitación |
| ACT original (paper 2304.13705) | no especificado | no disponible | no especificado | paper | Control bimanual por imitación |
| Otros modelos de LeRobot (p.ej. `lerobot/act_so100`) | típicamente 50-80 M | no disponible | Apache 2.0 | Hugging Face | Control robótico variado |

La comparativa es limitada porque no se dispone de datos de rendimiento publicados para este modelo ni para los alternativos en la información proporcionada. La diferencia principal es el tamaño del dataset de entrenamiento (2 episodios frente a cientos en otros casos) y la ausencia de evaluación.

## Limitaciones y advertencias

- El modelo se ha entrenado con un dataset extremadamente pequeño (2 episodios, 898 fotogramas) y solo 5 pasos de entrenamiento, por lo que su capacidad de generalización es muy limitada y probablemente no funcionará correctamente en entornos reales.
- No se han proporcionado resultados de evaluación en robot real; no se puede afirmar que la política tenga éxito en ninguna tarea.
- La tarea etiquetada es "test", lo que sugiere que es una prueba técnica más que un modelo para producción.
- Riesgo de alucinación de acciones: al ser un modelo de imitación con datos insuficientes, puede generar acciones incorrectas o inconsistentes en situaciones fuera de las demostraciones.
- Limitación de contexto: la ventana de contexto no está documentada y la política depende de la resolución de imagen fija (480 640) y de las cámaras específicas del robot `humanaopen`; no es transferible a otros robots sin reentrenamiento.
- No hay soporte para idiomas ni procesamiento de lenguaje; no es adecuado para aplicaciones de texto.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no es apto para producción sin un entrenamiento completo y evaluación exhaustiva.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio Hugging Face: [zonglin11/humanaopen_test_act](https://huggingface.co/zonglin11/humanaopen_test_act)
- Dataset de entrenamiento: [zonglin11/humanaopen_test_20260823_110640](https://huggingface.co/datasets/zonglin11/humanaopen_test_20260823_110640)
- Paper de ACT: [Action Chunking with Transformers (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- Documentación de LeRobot: [LeRobot](https://github.com/huggingface/lerobot)
- Guía de ACT en LeRobot: [LeRobot ACT guide](https://huggingface.co/docs/lerobot/main/en/act)
- Documentación completa de LeRobot: [LeRobot docs](https://huggingface.co/docs/lerobot/index)
