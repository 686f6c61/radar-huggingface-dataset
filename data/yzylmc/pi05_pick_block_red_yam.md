# YzyLmc/pi05_pick_block_red_yam

## Resumen

`pi05_pick_block_red_yam` es un ajuste fino completo (full fine-tune) del modelo de visión-lenguaje-acción (VLA) **π0.5** sobre un dataset de un solo episodio de tarea: recoger un bloque rojo con un brazo robótico YAM. Lo publica el usuario YzyLmc en Hugging Face bajo licencia Apache-2.0, y se apoya en el checkpoint base `lerobot/pi05_base` de LeRobot. El modelo está diseñado para control de manipulación robótica a partir de observaciones visuales (dos cámaras RGB) y estado articular de 7 grados de libertad, generando acciones de control en un horizonte de aproximadamente 1,67 segundos.

La arquitectura combina un backbone PaliGemma de 2 mil millones de parámetros con un experto de acción Gemma de 300 millones, sumando unos 3,6 mil millones de parámetros en total. Se trata de un **checkpoint intermedio** (paso 10.000 de un entrenamiento de 20.000 pasos) y el autor advierte explícitamente que no se ha evaluado el éxito de la tarea ni en simulación ni en robot real. Por tanto, debe tratarse como un artefacto de investigación en curso, no como una política validada.

La relevancia de este modelo reside en su carácter de ejemplo reproducible de ajuste fino de π0.5 con LeRobot, demostrando el flujo completo de entrenamiento con datos propios, remapeo de claves de cámara al formato OpenPI y uso de la librería `lerobot` en su versión 0.4.1. Aunque su alcance es muy limitado (una sola tarea, una sola escena, 30 demostraciones), sirve como referencia técnica para quienes quieran adaptar VLA de última generación a sus propios brazos robóticos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PaliGemma (`gemma_2b` backbone) + `gemma_300m` action expert |
| Parametros totales | 3.616.757.520 (~3,6 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (VLA; contexto visual y de acción, sin especificar) |
| Tipos de cuantizacion | bfloat16 (único formato publicado) |
| Idiomas soportados | No disponible (instrucción en inglés: "Pick up the red block") |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (812 tensores, `model.safetensors`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de **π0.5**, un VLA de flujo (flow-based) desarrollado por Physical Intelligence. Combina un codificador visual SigLIP (integrado en el backbone PaliGemma de 2B) con un decodificador de acciones basado en Gemma de 300M. El espacio de acción es de 7 dimensiones (control articular del brazo YAM) con un chunk de 50 pasos a 30 fps, lo que equivale a un horizonte de predicción de ~1,67 segundos. El estado de entrada es la posición articular de 7 grados de libertad.

El entrenamiento se realizó mediante **ajuste fino completo** (sin LoRA, sin congelar el backbone) sobre el dataset `YzyLmc/pick_block_red`, que contiene 30 episodios (12.833 frames) grabados a 30 fps con dos cámaras RGB (escena y muñeca izquierda) en formato AV1. Se excluyó la cámara de profundidad porque el tower SigLIP de π0.5 solo acepta 3 canales. Las claves de cámara se remapearon a los nombres canónicos de OpenPI (`base_0_rgb` y `left_wrist_0_rgb`), y la cámara de muñeca derecha ausente se manejó como un placeholder enmascarado.

La configuración de entrenamiento incluye batch size 32, optimizador AdamW con lr 2,5e-5, schedule coseno con 1.000 pasos de warmup y 20.000 de decay, precisión bfloat16, gradient checkpointing y semilla 1000. Se usó LeRobot v0.4.1 con una versión parcheada de transformers (`fix/lerobot_openpi`), necesaria para superar el guard de SigLIP. El checkpoint base se fijó en la revisión `a538eb27` para evitar incompatibilidades con el preprocesador `relative_actions_processor` de revisiones posteriores.

## Capacidades

- **Control robótico de manipulación**: genera acciones de 7 grados de libertad para un brazo YAM, con un horizonte de ~1,67 segundos (chunk de 50 pasos).
- **Percepción visual multimodal**: procesa dos cámaras RGB (escena y muñeca izquierda) a 480×640 píxeles, junto con el estado articular.
- **Seguimiento de instrucciones en lenguaje natural**: responde a la consigna "Pick up the red block" (en inglés), aunque no se ha verificado su generalización a otras instrucciones.
- **Integración con LeRobot**: compatible con la API `PI05Policy.from_pretrained()` de la librería `lerobot` v0.4.1.
- **Formato OpenPI**: las observaciones se suministran bajo las claves canónicas de OpenPI (`base_0_rgb`, `left_wrist_0_rgb`), lo que facilita la interoperabilidad con otros modelos de la familia π0.
- **No dispone de capacidades de chat, generación de texto general, tool calling ni soporte multilingüe**: es un modelo puramente orientado a robótica.

## Casos de uso

- **Investigación en VLA**: sirve como ejemplo de ajuste fino de π0.5 con datos propios, permitiendo estudiar el flujo completo de entrenamiento, remapeo de cámaras y despliegue con LeRobot.
- **Prototipado de políticas de pick-and-place**: aunque no está validado, puede usarse como punto de partida para experimentar con tareas de recogida de objetos en entornos controlados.
- **Benchmarking de pipelines de entrenamiento**: el checkpoint intermedio permite comparar curvas de pérdida y comportamiento en diferentes etapas del entrenamiento (paso 10.000 vs. paso 20.000).
- **Desarrollo de datasets robóticos**: el dataset asociado (`pick_block_red`) y el remapeo de claves documentado son útiles para quienes necesiten adaptar sus propios datos al formato OpenPI.
- **Evaluación de generalización**: al ser un modelo de una sola tarea y una sola escena, puede emplearse para medir la capacidad de generalización de π0.5 ante variaciones de iluminación, pose o fondo (aunque no se ha probado).
- **Formación y educación**: el repositorio y la model card detallan la configuración exacta de entrenamiento, lo que lo convierte en material didáctico para aprender a fine-tunear VLA con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ha evaluado el éxito de la tarea ni en robot ni en simulación, y que no hay curvas de pérdida ni métricas de validación publicadas. Por tanto, no es posible presentar una tabla comparativa de rendimiento.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible oficialmente. Con 3,6 mil millones de parámetros en bfloat16, los pesos ocupan ~7,2 GB; añadiendo activaciones y KV cache, una estimación prudente sería entre 10 y 16 GB, pero no hay datos confirmados.
- **GPU recomendadas**: el entrenamiento se realizó en una NVIDIA RTX PRO 6000 Blackwell (96 GB) a ~3,47 s/paso. Para inferencia, una GPU con al menos 16 GB de VRAM (p. ej., RTX 4080, RTX 4090, A10G) podría ser suficiente, aunque no está verificado.
- **Compatibilidad con GPUs de consumo**: probablemente sí en GPUs de 24 GB (RTX 3090/4090) en bf16, pero sin garantías al no haber pruebas publicadas.
- **Opciones de despliegue**: el modelo se carga mediante `lerobot` (`PI05Policy.from_pretrained`). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje, no para VLA robóticos.
- **Latencia y throughput**: no disponibles. El tiempo de entrenamiento fue de ~3,47 s/paso, pero la latencia de inferencia no se ha medido ni publicado.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparación cuantitativa con otros modelos. El modelo base `lerobot/pi05_base` comparte la misma arquitectura y tamaño, pero no se han publicado métricas comparativas. Existe otro ajuste fino de π0.5 para tareas similares (`anvil-robotics/pi05-openarm-pick-and-place-ikea-red-block`), pero no se dispone de sus especificaciones ni resultados. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Checkpoint intermedio**: son los pesos del paso 10.000 de un entrenamiento de 20.000; los pesos finales pueden diferir sustancialmente.
- **Sin evaluación de éxito**: no se ha probado en robot real ni en simulación; no hay métricas de tasa de éxito ni curvas de pérdida.
- **Alcance extremadamente limitado**: una sola tarea ("Pick up the red block"), una sola escena y 30 demostraciones. No hay ninguna pretensión de generalización.
- **Dependencia de una versión parcheada de transformers**: requiere la rama `fix/lerobot_openpi` de Hugging Face; la versión estándar de PyPI falla.
- **Fijación del checkpoint base**: el modelo depende de la revisión `a538eb27` de `lerobot/pi05_base`; revisiones posteriores introducen cambios incompatibles con LeRobot 0.4.1.
- **Cámara derecha ausente**: `right_wrist_0_rgb` se maneja como placeholder enmascarado, lo que puede afectar al rendimiento si la tarea requiere esa vista.
- **Riesgo de alucinación y sesgos**: al ser un VLA sin evaluación, no se conocen sesgos específicos, pero el riesgo de comportamientos no deseados en entornos no vistos es alto.
- **Licencia**: Apache-2.0 permite uso comercial, pero el modelo no está validado para producción; cualquier uso en entornos reales debe hacerse con extrema precaución.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/YzyLmc/pi05_pick_block_red_yam)
- [Dataset de entrenamiento](https://huggingface.co/datasets/YzyLmc/pick_block_red)
- [Modelo base `lerobot/pi05_base`](https://huggingface.co/lerobot/pi05_base)
- [Repositorio OpenPI (Physical Intelligence)](https://github.com/Physical-Intelligence/openpi)
- [Sitio web de OpenPI](https://www.openpi.net/english.html)
- [Ejemplo similar: `anvil-robotics/pi05-openarm-pick-and-place-ikea-red-block`](https://huggingface.co/anvil-robotics/pi05-openarm-pick-and-place-ikea-red-block/tree/main)
- [Repositorio de despliegue para YAM (Pi0.5_yam)](https://github.com/YOLO12138/Pi0.5_yam/tree/main/deployment)
