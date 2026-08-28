# Sounderya/smolvla-ur3-real-polished-acc4

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto desarrollado por Hugging Face, con 450 millones de parámetros, diseñado para ejecutarse en hardware de consumo y facilitar el desarrollo de políticas robóticas mediante aprendizaje por imitación. Este repositorio concreto, `Sounderya/smolvla-ur3-real-polished-acc4`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset propio de 120 episodios grabados con un brazo robótico UR3, con la tarea específica de recoger una taza y colocarla en un plato. El entrenamiento se realizó con la librería LeRobot, utilizando 500 pasos, batch de 64 y una tasa de aprendizaje de 1e-05.

La relevancia de este modelo radica en que demuestra el flujo completo de fine-tuning de SmolVLA para una tarea robótica real, con un coste computacional reducido y la posibilidad de desplegarlo en GPUs de gama media. Aunque no se han publicado resultados de evaluación, el modelo sirve como ejemplo práctico de cómo adaptar un VLA generalista a un escenario de manipulación concreto. El repositorio incluye la configuración de entrenamiento, el dataset asociado y las instrucciones para ejecutar el rollout en un robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje-acción) basado en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción compacto que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones. La arquitectura exacta (número de capas, dimensiones ocultas, tipo de atención) no se detalla en la información disponible, pero se referencia el paper `arxiv:2506.01844`. El modelo base `lerobot/smolvla_base` fue preentrenado por Hugging Face para tareas de robótica, y este repositorio lo afina con un dataset propio de 120 episodios (91.365 frames a 30 FPS) capturados con cámaras `wrist` y `right`. El entrenamiento se realizó con el optimizador AdamW, 500 pasos, batch de 64 y una tasa de aprendizaje de 1e-05, utilizando la versión 0.6.1 de LeRobot. No se menciona el uso de RLHF ni técnicas de alineación adicionales; es un fine-tuning supervisado estándar.

## Capacidades

- Control de brazo robótico: genera acciones de 10 dimensiones (posición y orientación del efector final) a partir de observaciones visuales y del estado del robot.
- Percepción multimodal: procesa tres imágenes de 256x256 píxeles (probablemente cámaras fija, muñeca y lateral) junto con el estado del robot (6 valores).
- Aprendizaje por imitación: la política ha sido entrenada para replicar la tarea demostrada "recoger la taza y colocarla en el plato".
- Integración con LeRobot: compatible con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- Ejecución en tiempo real: al ser un modelo compacto, es adecuado para inferencia de baja latencia en hardware de consumo.
- No incluye capacidades de generación de texto, tool calling, razonamiento general ni soporte multilingüe; su función es exclusivamente robótica.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos industriales: el modelo puede controlar un brazo UR3 para recoger objetos específicos (como una taza) y colocarlos en posiciones determinadas, útil en líneas de montaje o clasificación.
- Prototipado rápido de políticas robóticas: gracias a su bajo coste de entrenamiento y despliegue, permite iterar sobre nuevas tareas con pocas horas de datos y hardware asequible.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de VLA a dominios específicos, comparando el rendimiento con modelos más grandes como OpenVLA.
- Educación y formación en robótica: al poder ejecutarse en una GPU de consumo (p. ej., RTX 3060 o superior), es ideal para laboratorios docentes que enseñan manipulación robótica con UR3.
- Desarrollo de asistentes robóticos domésticos: la tarea de recoger y colocar objetos es básica para aplicaciones domésticas, y este modelo demuestra su viabilidad con hardware de bajo coste.
- Benchmark de fine-tuning de VLA: el repositorio y su dataset pueden utilizarse como referencia para comparar estrategias de fine-tuning (número de pasos, tamaño de batch, etc.) en tareas de manipulación real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." Por tanto, no hay datos de éxito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible. Con 450M de parámetros, en FP32 ocuparía aproximadamente 1,8 GB solo de pesos, pero el procesamiento de imágenes y el overhead del modelo pueden requerir entre 3 y 5 GB. No se proporcionan cifras oficiales.
- GPU recomendadas: al ser un modelo compacto, es plausible que funcione en GPUs de consumo como RTX 3060 (12 GB), RTX 4070 o superiores. No hay confirmación oficial.
- Opciones de despliegue: el modelo está integrado en LeRobot, por lo que puede ejecutarse con los comandos `lerobot-rollout` y `lerobot-train`. No se mencionan otros frameworks como vLLM u Ollama, que son para modelos de lenguaje.
- Latencia y throughput: no disponibles. Dado el tamaño, se espera una inferencia en tiempo real (30 FPS) en hardware adecuado, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA (este fine-tuning) | 450M | no disponible | Manipulación UR3 (pick-and-place) | Apache 2.0 | Hugging Face |
| OpenVLA | 7B | no disponible | Manipulación generalista | MIT | Hugging Face |
| RT-2 (Google) | 55B | no disponible | Manipulación generalista | Propietaria | No abierto |

La comparativa se basa en el tamaño y la licencia, ya que no hay datos de rendimiento para este modelo concreto. SmolVLA es significativamente más ligero que OpenVLA y RT-2, lo que facilita su despliegue en hardware de consumo, aunque su capacidad de generalización podría ser menor al estar entrenado para una tarea específica.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado únicamente para la tarea "recoger la taza y colocarla en el plato" con un UR3 y un dataset de 120 episodios. No generalizará a otros objetos, posiciones o robots sin un nuevo fine-tuning.
- Sin evaluación reportada: no hay métricas de éxito en el mundo real, por lo que su rendimiento efectivo es desconocido.
- Dependencia del entorno: el rendimiento puede degradarse con cambios de iluminación, fondo o posición de la cámara, ya que no se mencionan técnicas de robustez.
- Riesgo de sobreajuste: con solo 500 pasos de entrenamiento y un dataset pequeño, existe riesgo de memorización de las demostraciones en lugar de aprendizaje de una política general.
- Limitaciones de hardware: aunque es compacto, requiere una GPU con suficiente VRAM para procesar tres imágenes simultáneamente; no se especifican requisitos mínimos.
- Restricciones de uso: la licencia Apache 2.0 permite uso comercial, pero el modelo está pensado para investigación y desarrollo; no hay garantías de seguridad para aplicaciones críticas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Sounderya/smolvla-ur3-real-polished-acc4
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/Sounderya/mug_smolvla_dataset_v2nc
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Blog de Hugging Face sobre SmolVLA: https://github.com/huggingface/blog/blob/main/smolvla.md
- Página oficial de SmolVLA: https://smolvla.net/index_en
