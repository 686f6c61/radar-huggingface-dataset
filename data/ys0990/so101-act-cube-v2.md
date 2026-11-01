# ys0990/so101-act-cube-v2

## Resumen

`ys0990/so101-act-cube-v2` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), publicada en Hugging Face Hub mediante la librería LeRobot. No es un modelo de lenguaje: es un controlador visomotor que, a partir de dos cámaras (overhead y wrist) y del estado de las articulaciones, predice acciones de 6 dimensiones para un brazo SO-101 (variante `so_follower`). El problema que resuelve es concreto: aprender una tarea de manipulación (coger un cubo azul y depositarlo en una caja blanca) directamente de demostraciones teleoperadas, sin programación explícita.

El modelo tiene 51.668.614 parámetros en formato safetensors y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras ejecutables en tiempo real sobre hardware modesto. Fue entrenado durante 20.000 pasos con batch size 8, optimizador AdamW y learning rate 1e-5 sobre un dataset de solo 10 episodios (4.511 frames a 30 FPS), lo que lo convierte en un ejemplo típico de few-shot imitation learning en el ecosistema LeRobot.

Su relevancia es principalmente práctica y educativa: demuestra el flujo completo de LeRobot 0.6.2 (grabación de datos, entrenamiento, rollout) en una tarea reproducible, y sirve como referencia para quien quiera replicar el pipeline ACT en un robot de bajo coste. No hay resultados de evaluación publicados ni licencia declarada, por lo que debe tratarse como un artefacto experimental más que como un componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la política ACT) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; entrada multimodal visión + estado) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de imitation learning presentado en el paper arXiv:2304.13705 que predice *chunks* de acciones (varios pasos futuros de una vez) en lugar de acciones individuales, lo que reduce el error de acumulación y estabiliza el control. La política consume dos flujos visuales de 3×480×640 (cámaras overhead y wrist) más un vector de estado de 6 dimensiones, y produce un vector de acción de 6 dimensiones. Internamente combina un backbone de visión con un transformer que modela la secuencia de observaciones y genera el chunk de acciones; el repositorio no detalla la configuración exacta de capas, dimensión oculta ni número de pasos por chunk.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `ys0990/record-test-v2_20261101_001718`: 10 episodios, 4.511 frames a 30 FPS, una única tarea ("Grab the blue cube and put in white box"), 20.000 pasos, batch size 8, AdamW con learning rate 1e-5 y semilla 1000. No se documenta uso de RLHF, DPO ni aumentos de datos; es entrenamiento supervisado puro sobre demostraciones. La innovación relevante es la propia formulación de action chunking, no una modificación propia del autor.

## Capacidades

- Control visomotor de un brazo SO-101 (`so_follower`) con 6 grados de acción.
- Fusión de dos cámaras (overhead y wrist) con estado articular en una única política.
- Predicción de chunks de acción para ejecución en tiempo real a 30 FPS.
- Ejecución de una tarea de pick-and-place específica: coger un cubo azul y dejarlo en una caja blanca.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes multi-paso, ni capacidades de lenguaje, visión general o audio: es una política cerrada a su tarea y morfología.
- No hay capacidades multilingües: no procesa texto libre más allá del identificador de tarea.

## Casos de uso

- Replicación de un pipeline de imitation learning: usar este repositorio como plantilla para grabar datos con `lerobot-record`, entrenar con `lerobot-train --policy.type=act` y desplegar con `lerobot-rollout`, sirviendo de tutorial end-to-end del flujo LeRobot 0.6.2.
- Benchmark interno de hardware SO-101: ejecutar la política con `--strategy.type=base` durante 60 segundos para validar calibración de cámaras, puerto del robot y latencia del lazo de control antes de entrenar políticas propias.
- Tarea de pick-and-place educativa: demostrar en un laboratorio o aula cómo una política de 51,7 M de parámetros aprende una tarea de manipulación con solo 10 episodios y 4.511 frames.
- Base para fine-tuning: partir de estos pesos y reentrenar con un dataset mayor o con variaciones de posición, iluminación y distractores para medir la mejora en robustez respecto al modelo original.
- Estudio de sensibilidad a datos: comparar el rendimiento de esta política (10 episodios) frente a versiones entrenadas con más demostraciones para analizar la curva de aprendizaje de ACT en tareas cortas.
- Prototipado de control con cámaras múltiples: evaluar la contribución de la cámara wrist frente a la overhead modificando las entradas de observación y reentrenando, como experimento controlado sobre fusión visual.
- Docencia sobre action chunking: usar el modelo como ejemplo tangible de por qué predecir secuencias de acciones reduce el error acumulado frente a políticas paso a paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye explícitamente la sección de evaluación vacía con la nota "No evaluation results have been provided for this policy yet", por lo que no existen tasas de éxito, métricas de error de acción ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en safetensors (0,2 GB de repositorio), la inferencia en fp32 requiere del orden de 0,2-0,3 GB de VRAM para los pesos, más el coste de procesar dos imágenes de 480×640 por paso.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente para el modelo; se recomienda una RTX 3060/4060 o superior para mantener 30 FPS con dos flujos de cámara.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más; también es viable en CPU para pruebas lentas, aunque no se garantiza el lazo de control a 30 FPS.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot), integración con el stack LeRobot en PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles; el dataset y el entrenamiento usan 30 FPS, pero no se publica latencia medida en inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / ventana | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ys0990/so101-act-cube-v2 | ACT (LeRobot) | 51,7 M | no aplica (chunk de acciones) | Pick-and-place de cubo azul en SO-101 | no disponible | Hugging Face Hub |
| Políticas ACT de referencia en LeRobot | ACT (LeRobot) | variable según configuración | no aplica | Tareas de manipulación diversas | normalmente Apache-2.0 en el ecosistema LeRobot | Hugging Face Hub / docs LeRobot |
| Políticas Diffusion Policy (LeRobot) | Diffusion Policy | variable | no aplica | Manipulación visomotora | según repositorio | Hugging Face Hub / LeRobot |
| Políticas π0 / VLA generalistas | VLA (visión-lenguaje-acción) | miles de millones | contexto multimodal amplio | Manipulación generalista | según proveedor | no disponible en esta ficha |

La comparación cuantitativa con alternativas no es posible: no hay benchmarks publicados para este modelo ni métricas de éxito en la model card. Las alternativas citadas se incluyen por categoría (políticas de imitación en LeRobot y VLA generalistas), no por rendimiento medido.

## Limitaciones y advertencias

- Sin licencia declarada: la model card indica "License: [More Information Needed]", por lo que no se puede asumir uso comercial permitido; hay que contactar con el autor antes de cualquier despliegue productivo.
- Dataset extremadamente pequeño: 10 episodios y 4.511 frames implican un riesgo alto de sobreajuste y nula robustez ante cambios de posición, iluminación, fondo o distractores.
- Tarea única y cerrada: la política solo ha visto "Grab the blue cube and put in white box"; no generaliza a otras tareas ni objetos.
- Morfología fija: entrenada para `so_follower` con dos cámaras concretas (overhead y wrist); cambiar la configuración de cámaras o el robot invalida la política.
- Sin evaluación publicada: no hay tasa de éxito medida, por lo que se desconoce su fiabilidad real incluso en la tarea original.
- Riesgo de alucinación en el sentido de acciones incorrectas: al ser una política de imitación sin verificación, puede ejecutar trayectorias erráticas ante observaciones fuera de distribución.
- Sin soporte de lenguaje ni contexto textual: no se puede instruir con prompts libres; solo acepta el identificador de tarea usado en entrenamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- Fecha de creación y actualización (2026-11-01) separadas por 10 segundos: sugiere un artefacto de prueba más que un modelo mantenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ys0990/so101-act-cube-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/ys0990/record-test-v2_20261101_001718
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ys0990/record-test-v2_20261101_001718
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
