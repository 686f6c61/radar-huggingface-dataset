# Yewy/mahjong_mat_pickup_jitter_v3_v3c_policy

## Resumen

`Yewy/mahjong_mat_pickup_jitter_v3_v3c_policy` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT) y publicada en el Hub mediante la librería LeRobot. No es un modelo de lenguaje: es un checkpoint de control visuomotor que, a partir de observaciones de cámara y del estado del robot, predice secuencias cortas de acciones ("chunks") para ejecutar una tarea de manipulación concreta.

El identificador y las etiquetas del repositorio indican que la tarea es la recogida de piezas o fichas sobre una esterilla de mahjong (`mahjong_mat_pickup`), con un dataset derivado etiquetado como `..._jitter_v3_v3c_224`, y que el embodiment objetivo es un brazo SO-101 (`so101`) junto con la base móvil LeKiwi (`lekiwi`). El sufijo `224` del dataset apunta a observaciones de imagen de 224x224 píxeles; el sufijo `jitter` sugiere variaciones de posición o ruido introducidas en la recolección de demostraciones.

El modelo tiene 51.668.614 parámetros (unos 51,7 M) y un tamaño de repositorio de 0,2 GB. Su relevancia es acotada y práctica: sirve como checkpoint de referencia reproducible para una tarea de pick-and-place de objetos pequeños con hardware de bajo coste, y como base para comparar variantes de dataset y aumentación de datos dentro del ecosistema LeRobot. No hay métricas publicadas ni validación comunitaria (0 descargas, 0 likes en el momento del registro).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con CVAE y predicción de chunks de acciones |
| Parametros totales | 51.668.614 (~51,7 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no aplica en el sentido de modelos de lenguaje (ventana de observación definida por la política y el dataset) |
| Tipos de cuantizacion | No se documentan versiones cuantizadas; pesos en safetensors con un tamaño (0,2 GB para 51,7 M de parámetros) compatible con coma flotante de 32 bits |
| Idiomas soportados | No aplica (política robótica visuomotora, sin entrada ni salida de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB), librería `lerobot` |
| Tarea | Recogida de piezas/fichas sobre esterilla de mahjong (`mahjong_mat_pickup`) |
| Embodiment | SO-101 (`so101`) y base móvil LeKiwi (`lekiwi`) |
| Dataset de entrenamiento | `Yewy/mahjong_mat_pickup_jitter_v3_v3c_224` |
| Pipeline declarado | robotics |
| Region | us |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación (behavior cloning) presentado en el paper arXiv:2304.13705. La política combina un codificador visual, un transformer encoder-decoder y una rama CVAE (autoencoder variacional condicional) que modela la variabilidad humana en las demostraciones durante el entrenamiento. En lugar de predecir una única acción por paso, el modelo emite un chunk de acciones futuras, lo que reduce el error de acumulación y permite control a mayor frecuencia efectiva; en inferencia suele aplicarse agregación temporal de chunks solapados.

El entrenamiento se realiza sobre teleoperación: el autor recogió demostraciones con el robot y entrenó la política con `lerobot-train` (comando documentado en la model card, con `--policy.type=act` y `--policy.device=cuda`). El dataset asociado, `Yewy/mahjong_mat_pickup_jitter_v3_v3c_224`, incluye en su nombre indicios de variaciones de posición o ruido (`jitter`) y resolución de imagen de 224 píxeles, pero la model card no detalla el número de episodios, la composición del dataset ni si hubo fases de RLHF o DPO (no aplicables habitualmente en este tipo de políticas). No se documentan innovaciones adicionales más allá del esquema estándar de ACT.

## Capacidades

- Control visuomotor para manipulación: genera comandos de acción a partir de imágenes de cámara y del estado del robot.
- Predicción de chunks de acciones, orientada a ejecución continua en tiempo real.
- Ejecución de una tarea específica de pick-and-place de objetos pequeños (fichas/piezas) sobre una esterilla.
- Funcionamiento con brazo SO-101 y con la base móvil LeKiwi, según las etiquetas del repositorio.
- Robustez potencial frente a variaciones de posición, derivada del dataset con `jitter` (no cuantificada).
- Integración con el flujo de LeRobot: entrenamiento con `lerobot-train` y evaluación con `lerobot-record`.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni instrucciones en lenguaje natural.
- No dispone de capacidades multilingües, de visión general (VQA, OCR) ni de audio.

## Casos de uso

- Recogida automatizada de piezas en una célula de montaje: la política toma imágenes de la escena y emite chunks de acciones para que el brazo SO-101 agarre y retire fichas de la esterilla, aprovechando el entrenamiento específico sobre esa geometría.
- Manipulación móvil con LeKiwi: al estar etiquetada para esta plataforma, puede emplearse para recoger objetos situados en superficies a las que hay que desplazarse, combinando base y brazo.
- Baseline reproducible en investigación: sirve como punto de partida para comparar el efecto de cambios en el dataset (por ejemplo, `jitter_v3` frente a otras variantes) manteniendo constante la arquitectura ACT.
- Evaluación de aumentación de datos: la política permite medir empíricamente si el `jitter` introducido en la recolección mejora la tasa de éxito ante desplazamientos de las piezas.
- Prototipado de bajo coste en laboratorio: 51,7 M de parámetros y 0,2 GB de pesos hacen viable entrenar y ejecutar en una estación de trabajo con una única GPU consumer.
- Recolección de nuevos datos asistida: usar la política como controlador inicial que genere trayectorias aproximadas, revisadas por un operador, para ampliar el dataset de la tarea.
- Docencia y demostraciones de aprendizaje por imitación: ejemplo completo y autocontenido de pipeline LeRobot (dataset, entrenamiento, evaluación con `lerobot-record --episodes=10`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, número de episodios de evaluación, ni comparaciones con otras políticas. Tampoco se aportan métricas de latencia o frecuencia de control medidas para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB solo para pesos en fp32 (51,7 M de parámetros ≈ 207 MB); con activaciones y buffer de imágenes para batch 1, la estimación práctica es de 1-2 GB. Cifra estimada, no medida por el autor.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); A100 o H100 no aportan ventaja para este tamaño. La inferencia en CPU es plausible por el reducido número de parámetros, aunque la latencia no está documentada.
- Cabe en GPU consumer: sí, con margen amplio, en todas las gamas mencionadas.
- Opciones de despliegue: LeRobot (`lerobot-record --policy.path=...` para evaluación; `lerobot-train` para reentrenamiento) sobre PyTorch. No se documenta exportación a ONNX, TensorRT, vLLM, llama.cpp, Ollama ni TGI (herramientas no aplicables a este tipo de política).
- Latencia y throughput: no disponibles. ACT está diseñado para control en tiempo real mediante chunks de acciones, pero no se publican mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| `Yewy/mahjong_mat_pickup_jitter_v3_v3c_policy` (este) | ACT, politica de imitacion para tarea especifica | 51.668.614 | apache-2.0 | HuggingFace Hub via LeRobot |
| Diffusion Policy | Politica de imitacion basada en difusion (alternativa en LeRobot) | No disponible | No disponible en la informacion proporcionada | Implementacion en LeRobot |
| VQ-BeT | Politica de imitacion con discretizacion de acciones (alternativa en LeRobot) | No disponible | No disponible en la informacion proporcionada | Implementacion en LeRobot |
| Modelos VLA generalistas (p. ej. familias tipo SmolVLA) | Politica vision-lenguaje-accion de proposito general | No disponible | No disponible en la informacion proporcionada | Ecosistema LeRobot |

La comparacion cuantitativa no es posible con los datos disponibles: no hay tasas de exito ni metricas de la tarea para este checkpoint, y las alternativas citadas pertenecen a familias distintas con requisitos de computo habitualmente superiores. La diferencia principal es de alcance: este modelo esta especializado en una unica tarea y un unico embodiment, mientras que las propuestas VLA aceptan instrucciones en lenguaje natural a costa de mayor tamano y latencia.

## Limitaciones y advertencias

- Especializacion extrema: la politica ha sido entrenada para una tarea (recogida de piezas sobre esterilla de mahjong) y un embodiment concretos; no se espera generalizacion a otras tareas, objetos o brazos sin reentrenamiento.
- Sin validacion publica: 0 descargas y 0 likes en el momento del registro, y ninguna metrica de exito reportada; no hay evidencia independiente de que la politica funcione de forma fiable.
- Riesgo de sobreajuste al entorno de recolección: cambios de iluminación, fondo, tipo de cámara o colocación de las piezas pueden degradar el rendimiento (desplazamiento de distribución). No se documenta ningún protocolo de evaluación de robustez más allá del `jitter` del dataset.
- El término "alucinacion" no aplica en sentido lingüístico; el fallo equivalente es la ejecución de trayectorias plausibles pero incorrectas cuando la escena difiere de las demostraciones, con riesgo físico asociado al robot.
- Sin comprensión de lenguaje: no acepta instrucciones en texto ni permite reconfigurar la tarea en tiempo de ejecución.
- Idiomas: no aplica; la model card no declara idiomas y el modelo no procesa texto.
- Licencia apache-2.0 para los pesos, que permite uso comercial con atribución; conviene verificar por separado la licencia del dataset `Yewy/mahjong_mat_pickup_jitter_v3_v3c_224` antes de reutilizar los datos.
- En producción se requiere supervisión y paradas de seguridad: la política no incluye detección de fallos, límites de par ni estimación de incertidumbre.
- La model card no documenta el número de episodios de entrenamiento, la frecuencia de control, la composición exacta de las observaciones ni los parámetros de aumentación, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yewy/mahjong_mat_pickup_jitter_v3_v3c_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/Yewy/mahjong_mat_pickup_jitter_v3_v3c_224
- Paper de ACT (arXiv:2304.13705): https://arxiv.org/abs/2304.13705
- Paper de ACT en HuggingFace Papers: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas (LeRobot): https://huggingface.co/docs/lerobot/il_robots#train-a-policy
