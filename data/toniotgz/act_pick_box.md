# toniotgz/act_pick_box

## Resumen

`toniotgz/act_pick_box` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales. No es un modelo de lenguaje: es un controlador visomotor que consume el estado de las articulaciones y una imagen de cámara frontal, y devuelve un vector de acción de 6 dimensiones. Lo publica el usuario `toniotgz` en el Hub de Hugging Face como resultado de un entrenamiento reproducible hecho con LeRobot 0.6.2.

El modelo tiene 51.668.614 parámetros reales (safetensors) y ocupa 3,1 GB en el repositorio, lo que incluye los checkpoints intermedios del entrenamiento. Está especializado en una única tarea y un único robot: el brazo `so_follower` de la familia SO-101, con una cámara frontal de resolución 640x480 a 30 FPS. La tarea aprendida es literalmente "Pick up the box from the table" (coger la caja de la mesa), y se entrenó con solo 11 episodios y 6589 fotogramas grabados por teleoperación.

Su relevancia es fundamentalmente práctica y educativa: demuestra el flujo completo de imitación con hardware de bajo coste (LeRobot, ACT, dataset en el Hub) en apenas 30000 pasos de entrenamiento, con licencia Apache 2.0 y pesos en safetensors. No hay resultados de evaluación publicados por el autor, por lo que debe tratarse como un artefacto de referencia y no como un sistema validado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con CVAE para imitacion aprendizaje por imitacion (paper arXiv:2304.13705) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de observacion definida por el chunking de acciones del metodo ACT, no disponible el valor exacto en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (solo pesos safetensors; no se publican variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robótica; la tarea se especifica como cadena de texto en el CLI) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Robot objetivo | `so_follower` (familia SO-101) |
| Camaras | `front`, 1 camara |
| Entradas | `observation.state` (6,), `observation.images.front` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tamano del repositorio | 3,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación propuesto en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). La política combina un codificador visual (típicamente una CNN tipo ResNet) con un transformer que actúa como codificador-decoder, entrenado como un VAE condicional: en entrenamiento se usa el estilo latente derivado de la secuencia de acciones del experto, y en inferencia se fija a cero para producir la acción media. La innovación clave es el *action chunking*: en lugar de predecir una única acción por paso, el modelo emite un bloque de k acciones futuras, lo que reduce el error de composición y suaviza el control. En despliegue se suele aplicar *temporal ensembling* para combinar predicciones solapadas de chunks consecutivos.

Los datos de entrenamiento proceden del dataset `toniotgz/so101_pick_box`: 11 episodios, 6589 fotogramas a 30 FPS, una sola tarea ("Pick up the box from the table"), una única cámara frontal y el estado de 6 articulaciones. La configuración de entrenamiento reportada es de 30000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, ejecutada con LeRobot 0.6.2. No se documenta número de tokens (no aplica), composición del dataset más allá de la tarea indicada, ni si hubo fases de RLHF/DPO (no aplica a este tipo de política).

## Capacidades

- Control visomotor de un brazo robótico `so_follower` mediante predicción de chunks de acción de 6 dimensiones.
- Ejecución de una tarea concreta de manipulación: coger una caja de la mesa.
- Consumo de estado propioceptivo (`observation.state`, 6 valores) e imagen RGB frontal de 640x480.
- Funcionamiento en bucle cerrado a 30 FPS, con la misma cadencia usada en la grabación del dataset.
- Integración directa con el ecosistema LeRobot: `lerobot-rollout` para ejecución y `lerobot-train` para reentrenamiento.
- Soporte de tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica.
- Capacidades especiales (modo thinking, visión general, audio): no disponible; la única entrada visual es la imagen de la cámara frontal del robot.

## Casos de uso

- Aprendizaje por imitación con hardware de bajo coste: sirve como plantilla reproducible para grabar un dataset propio con un SO-101, entrenar una política ACT y desplegarla, replicando exactamente el flujo documentado en el repo.
- Automatización de una celda sencilla de *pick and place*: el modelo puede pilotar el brazo para recoger una caja situada en una posición aprendida sobre la mesa, siempre que la escena se parezca a la del dataset de entrenamiento.
- Banco de pruebas de pipelines de robótica: al ser un modelo pequeño (51,7 M de parámetros) y con licencia Apache 2.0, es adecuado para validar la cadena completa de LeRobot (calibración, rollout, telemetría) antes de invertir en modelos mayores.
- Docencia y formación en robótica: permite a estudiantes ver el ciclo completo dataset → entrenamiento → despliegue en un robot real con un coste de cómputo mínimo y en una sola sesión.
- Reentrenamiento y ajuste fino: el mismo script `lerobot-train` con `--policy.type=act` permite partir de esta configuración y adaptarla a una tarea nueva cambiando el dataset de origen.
- Comparación de métodos de imitación: sirve como referencia ACT frente a enfoques como Diffusion Policy o SmolVLA dentro del mismo ecosistema LeRobot, manteniendo constantes robot y sensores.
- Pruebas de robustez y *domain shift*: útil para medir cómo se degrada una política entrenada con solo 11 episodios cuando cambian la iluminación, la posición del objeto o el fondo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card incluye la sección de evaluación vacía, con la nota textual "No evaluation results have been provided for this policy yet", por lo que no existen tasas de éxito, número de ensayos ni métricas de precisión verificables para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 51,7 M de parámetros, los pesos ocupan del orden de 200 MB en fp32 y unos 100 MB en fp16; sumando el codificador visual y los buffers de activación, la inferencia cabe holgadamente en menos de 1-2 GB de VRAM (estimación a partir del recuento de parámetros, no un dato publicado por el autor).
- GPU recomendadas: cualquier GPU CUDA moderna es suficiente; una RTX 3060, RTX 4060 o superior cubre la inferencia con margen amplio. Modelos como A100 o H100 no aportan ventaja para este tamaño y estarían infrautilizados.
- GPU de consumo: sí, cabe en prácticamente cualquier GPU de consumo de los últimos años, e incluso en hardware embebido tipo Jetson Orin o en CPU (con mayor latencia) para inferencia puntual.
- Opciones de despliegue: LeRobot (`lerobot-rollout --policy.path=toniotgz/act_pick_box`), con PyTorch como backend. No se publican integraciones con vLLM, TGI, llama.cpp, Ollama ni formatos GGUF/ONNX, que además no aplican a una política de control.
- Latencia y throughput: no disponibles. El único dato relacionado es la cadencia del dataset (30 FPS) y el requisito implícito de ejecutar la política en bucle cerrado a esa frecuencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| toniotgz/act_pick_box | ACT (imitación) | 51.668.614 | 1 tarea, robot `so_follower`, 1 camara | apache-2.0 | Hugging Face Hub |
| Chaehee05/act_pick_and_place_box_30ep | ACT (imitacion) | no disponible | pick and place con caja, 30 episodios | no disponible | Hugging Face Hub |
| lbajaj14/act_matchbox_pickup_v2 | ACT (imitacion) | no disponible | recogida de una caja de cerillas | no disponible | Hugging Face Hub |
| Diffusion Policy (LeRobot) | politica por difusion | no disponible | manipulacion generalista en el mismo ecosistema | no disponible | GitHub / docs de LeRobot |
| SmolVLA (LeRobot) | VLA | no disponible | manipulacion guiada por lenguaje | no disponible | Hugging Face Hub |

La comparación directa con métricas no es posible: ninguno de los modelos alternativos publica parámetros, resultados de evaluación ni detalles completos de licencia en la información disponible. La diferencia observable más relevante de `toniotgz/act_pick_box` es que documenta dataset, configuración de entrenamiento y dimensiones de entrada/salida de forma explícita.

## Limitaciones y advertencias

- Sin resultados de evaluación publicados: no hay tasa de éxito, número de ensayos ni condiciones de prueba, por lo que se desconoce su fiabilidad real.
- Dataset muy reducido: 11 episodios y 6589 fotogramas son insuficientes para generalizar; es esperable sobreajuste a posiciones, iluminación y fondo concretos.
- Tarea única: la política está entrenada exclusivamente para "Pick up the box from the table"; fuera de esa tarea no hay garantía de comportamiento coherente.
- Dependencia fuerte del hardware: solo funciona con el tipo de robot `so_follower` y con una cámara frontal calibrada; cambiar la cámara, la resolución o la montura invalida las entradas esperadas.
- Dimensiones fijas de entrada y salida: `observation.state` (6,), imagen (3, 480, 640) y acción (6,). Cualquier variación en el número de articulaciones o en la resolución rompe la inferencia.
- Idioma: no aplica como capacidad multilingüe; la instrucción de tarea es una cadena de texto orientativa, no una orden comprendida semánticamente.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de predicciones de acción erráticas cuando la escena se sale de la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el modelo se distribuye tal cual.
- Fecha de creación poco habitual (2026-09-30) en los metadatos del repositorio: conviene verificar la procedencia antes de integrarlo en cualquier flujo productivo.
- No se documentan sesgos ni medidas de seguridad física; cualquier despliegue en un robot real requiere límites de par, paradas de emergencia y supervisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/toniotgz/act_pick_box
- Dataset de entrenamiento: https://huggingface.co/datasets/toniotgz/so101_pick_box
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout e inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=toniotgz/so101_pick_box
- Modelo comparable: https://huggingface.co/Chaehee05/act_pick_and_place_box_30ep
- Modelo comparable: https://huggingface.co/lbajaj14/act_matchbox_pickup_v2
