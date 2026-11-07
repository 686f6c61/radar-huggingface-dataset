# ys0990/so101-act-cube-v3

## Resumen

`ys0990/so101-act-cube-v3` es una política de imitación para robótica basada en Action Chunking with Transformers (ACT), el método presentado en el artículo arXiv 2304.13705 (Zhao et al., 2023). No es un modelo de lenguaje: es un modelo de control visuomotor entrenado para una tarea concreta de manipulación sobre un robot de tipo `so_follower` (familia SO-101 de LeRobot), con dos cámaras (`overhead` y `wrist`) como entrada y un vector de acción de 6 dimensiones como salida.

El modelo resuelve una tarea muy específica: "Grab the orange cube and put in white box". Se ha entrenado con el dataset `ys0990/record-test-v3_20261107_010514`, compuesto por 10 episodios y 4444 fotogramas a 30 FPS, mediante 20 000 pasos de entrenamiento con AdamW y un learning rate de 1e-5. Su relevancia es acotada: sirve como ejemplo reproducible de un pipeline completo de LeRobot (grabación de datos, entrenamiento y despliegue) más que como modelo de propósito general.

Con 51 668 614 parámetros (unos 51,7 M) y un repositorio de 0,2 GB, el modelo es ligero y está pensado para ejecutarse en el ordenador que controla el robot, no en infraestructura de servidor. La licencia no está declarada en la model card ni en los metadatos de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación visuomotora |
| Parámetros totales | 51 668 614 (51,7 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; consume observaciones por paso) |
| Tipos de cuantización | no disponible (pesos en safetensors sin variantes cuantizadas publicadas) |
| Idiomas soportados | no aplica (modelo de robótica, sin entrada/salida de texto libre) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Librería | lerobot (versión de entrenamiento 0.7.1) |
| Tipo de robot | `so_follower` |
| Cámaras de entrada | `overhead`, `wrist` |
| Entrada de estado | `observation.state`, forma `(6,)` |
| Entrada visual | `observation.images.overhead` y `observation.images.wrist`, forma `(3, 480, 640)` |
| Salida | `action`, forma `(6,)` |
| Tarea entrenada | "Grab the orange cube and put in white box" |
| Dataset de entrenamiento | `ys0990/record-test-v3_20261107_010514` (10 episodios, 4444 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 20 000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-5 |
| Semilla | 1000 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos de acción (*action chunks*) en lugar de pasos individuales, lo que reduce el error de acumulación típico de las políticas paso a paso y suaviza la ejecución. La arquitectura combina un codificador visual (procesa las dos cámaras a 480x640), un codificador del estado propioceptivo de 6 dimensiones y un transformador que genera la secuencia de acciones. La model card no detalla la configuración interna (número de capas, dimensión oculta, tamaño del chunk), por lo que esos datos no están disponibles.

El entrenamiento se realizó con LeRobot 0.7.1 sobre 10 episodios de teleoperación (4444 fotogramas a 30 FPS, aproximadamente 148 segundos de datos brutos) durante 20 000 pasos con batch size 8 y AdamW a 1e-5. No se documenta el uso de RLHF, DPO ni ningún otro ajuste posterior; es aprendizaje supervisado puro sobre demostraciones. No hay información sobre aumentos de datos, regularización ni composición detallada del dataset más allá del recuento de episodios y fotogramas.

## Capacidades

- Control visuomotor para una única tarea de manipulación: coger un cubo naranja y depositarlo en una caja blanca.
- Predicción de chunks de acción de 6 dimensiones a partir de dos vistas de cámara y del estado de las articulaciones.
- Ejecución autónoma en bucle mediante `lerobot-rollout` con `--strategy.type=base`, sin grabación de episodios.
- Reentrenamiento y ajuste fino sobre nuevos datasets con `lerobot-train --policy.type=act`.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo de razonamiento (*thinking*), visión general, audio ni otras modalidades fuera de las cámaras del robot.

## Casos de uso

- **Automatización de una celda de pick-and-place de laboratorio**: el modelo ejecuta el ciclo de recogida y depósito del cubo sobre el robot `so_follower` con las dos cámaras fijas, útil para validar la cadena completa de LeRobot antes de escalar a tareas reales.
- **Banco de pruebas de imitación con pocos datos**: con solo 10 episodios y 4444 fotogramas sirve para estudiar cuánto rinde ACT en regímenes de datos escasos y comparar contra variantes posteriores como `so101-act-cube-v2` del mismo autor.
- **Docencia y formación en robótica de imitación**: el repositorio incluye comandos de despliegue y entrenamiento listos para usar, lo que permite reproducir el flujo completo (grabar, entrenar, desplegar) en un taller.
- **Prototipado de políticas para el SO-101**: al ser un modelo pequeño (51,7 M de parámetros, 0,2 GB), se puede cargar y ejecutar en el equipo que controla el robot sin GPU dedicada de gran tamaño.
- **Punto de partida para ajuste fino en tareas similares**: reutilizable como inicialización para tareas de manipulación con el mismo robot y disposición de cámaras, reduciendo pasos de entrenamiento frente a partir de cero.
- **Validación de infraestructura de inferencia**: sirve para comprobar la latencia y estabilidad del bucle de control a 30 FPS con `lerobot-rollout` antes de desplegar políticas más costosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (*"No evaluation results have been provided for this policy yet"*), por lo que no hay tasas de éxito, número de ensayos ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- **VRAM estimada**: no disponible en la información proporcionada. Con 51,7 M de parámetros y pesos en safetensors de 0,2 GB, la inferencia cabe holgadamente en cualquier GPU de consumo actual, pero no se han publicado mediciones oficiales.
- **GPU recomendadas**: no disponible. Por tamaño, cualquier GPU con al menos unos pocos GB de VRAM debería bastar, pero no hay datos del autor que lo confirmen.
- **GPU de consumo**: previsiblemente sí en modelos como RTX 3060, RTX 4060 o superiores, aunque no está verificado en la documentación.
- **Despliegue**: LeRobot mediante `lerobot-rollout` para ejecución y `lerobot-train` para reentrenamiento; el modelo está empaquetado para la librería `lerobot` y no se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- **Latencia y throughput**: no disponibles. El bucle de control opera a 30 FPS según la tasa de los datos de entrenamiento, pero no se han publicado cifras de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ys0990/so101-act-cube-v3` | 51,7 M | 2 cámaras 480x640 + estado (6,) | Cubo naranja a caja blanca | no disponible | Hugging Face, 0 descargas |
| `ys0990/so101-act-cube-v2` | 51,7 M | no disponible en detalle | Manipulación con SO-101 (versión previa) | no disponible | Hugging Face, 2 descargas |
| Otras políticas ACT de LeRobot | variable | variable | tareas diversas de manipulación | variable según autor | Hub de Hugging Face |

La comparación se limita a la versión previa del mismo autor, `so101-act-cube-v2`, de la que solo se conoce el tamaño (51,7 M) y que fue publicada unas horas antes. No se dispone de datos de rendimiento de ninguna de las dos que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- **Sobreajuste a una tarea única**: entrenado exclusivamente para "Grab the orange cube and put in white box"; no generaliza a otras tareas sin reentrenamiento.
- **Dataset muy reducido**: 10 episodios y 4444 fotogramas son insuficientes para una política robusta; es probable que la variabilidad de posiciones, iluminación y objetos distractores degrade el rendimiento.
- **Sin evaluación publicada**: no hay tasas de éxito en robot real, por lo que no se puede afirmar que la política funcione de forma fiable.
- **Dependencia de la configuración de hardware**: requiere el robot `so_follower` y dos cámaras con los nombres y la resolución exactos (`overhead`, `wrist`, 480x640); cualquier cambio en la disposición invalida el modelo.
- **Licencia no declarada**: la ausencia de licencia impide determinar si el uso comercial está permitido; en la práctica, no se puede asumir ningún derecho de uso.
- **Riesgo de alucinación**: en el contexto de políticas de imitación, el equivalente es la ejecución de acciones erráticas fuera de la distribución de entrenamiento, sin mecanismo de seguridad incorporado.
- **Sin soporte multilingüe ni de texto**: no es aplicable como modelo de lenguaje; no debe evaluarse con métricas de NLP.
- **Metadatos incompletos**: la model card conserva la plantilla por defecto en varios apartados (licencia, evaluación), lo que indica un modelo de trabajo en curso más que un artefacto listo para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ys0990/so101-act-cube-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/ys0990/record-test-v3_20261107_010514
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ys0990/record-test-v3_20261107_010514
- Artículo ACT (arXiv 2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Perfil del autor: https://huggingface.co/ys0990
- Versión previa: https://huggingface.co/ys0990/so101-act-cube-v2
