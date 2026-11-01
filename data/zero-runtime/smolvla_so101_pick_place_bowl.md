# zero-runtime/smolvla_so101_pick_place_bowl

## Resumen

SmolVLA SO101 Pick Place Bowl es un modelo de visión-lenguaje-acción (VLA) especializado en una tarea concreta de manipulación robótica: recoger un cuenco y colocarlo en otra posición con el brazo SO-101 (también conocido como SO-ARM101). Lo publica el usuario zero-runtime en HuggingFace y se obtiene mediante fine-tuning del modelo base `lerobot/smolvla_base`, desarrollado por Hugging Face dentro del ecosistema LeRobot. El modelo no es un LLM conversacional, sino una política de control que, dada una observación visual y una instrucción en lenguaje natural, emite comandos de acción para el robot.

El modelo tiene 450.046.176 parámetros (unos 450 millones) y se distribuye en formato safetensors con un tamaño de repositorio de 0,9 GB. La licencia es Apache 2.0, aunque el acceso está restringido en HuggingFace y requiere aceptar condiciones. Está etiquetado como modelo de robótica con pipeline `robotics` y librería `lerobot`, e incluye etiquetas de aprendizaje por imitación, teleoperación y pick-and-place.

Su relevancia es práctica: demuestra el flujo completo de fine-tuning de SmolVLA sobre un robot de bajo coste (SO-101) para una tarea de manipulación concreta, usando un dataset propio (`zero-runtime/so101_pick_place_bowl`). Es un ejemplo reproducible de cómo adaptar un VLA genérico a un entorno y una tarea específicos con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) basada en SmolVLA; detalles internos no disponibles en la información proporcionada |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline | robotics |
| Modelo base | lerobot/smolvla_base |
| Dataset de entrenamiento | zero-runtime/so101_pick_place_bowl |
| Tamaño del repositorio | 0,9 GB |
| Acceso | restringido (gated), requiere aceptar condiciones |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/smolvla_base`, un VLA de la familia SmolVLA integrado en el ecosistema LeRobot de Hugging Face. La información proporcionada no detalla la arquitectura interna del modelo base (composición del encoder visual, del modelo de lenguaje y del cabezal de acciones), por lo que no se puede especificar aquí. Lo que sí se conoce es el proceso de adaptación: se ha realizado un fine-tuning supervisado por imitación sobre el dataset `zero-runtime/so101_pick_place_bowl`, generado presumiblemente mediante teleoperación del brazo SO-101 durante la tarea de recoger y colocar un cuenco.

Las etiquetas del modelo confirman el enfoque: `imitation-learning`, `teleoperation`, `pick-and-place` y `so101`. No se dispone de información sobre el número de tokens, la composición exacta del dataset, el número de episodios de teleoperación, ni sobre si se aplicaron técnicas de RLHF o DPO (poco habituales en políticas robóticas de imitación). Tampoco se documentan innovaciones técnicas adicionales más allá de las propias del modelo base SmolVLA.

## Capacidades

- Control robótico de manipulación: genera acciones motrices para el brazo SO-101 a partir de observaciones visuales y una instrucción de tarea.
- Ejecución de la tarea específica de pick-and-place de un cuenco (recoger y colocar).
- Condicionamiento por lenguaje natural: acepta una descripción textual de la tarea como entrada, según el paradigma VLA.
- Aprendizaje por imitación: la política se ha entrenado a partir de demostraciones de teleoperación.
- Integración con LeRobot: compatible con las utilidades de entrenamiento e inferencia de la librería `lerobot`.
- Capacidades multilingües: no disponibles; no se documenta el idioma de las instrucciones.
- Tool calling, agentes multi-paso, visión general, audio o modo thinking: no disponibles; el modelo está orientado a control robótico, no a tareas conversacionales.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la secuencia de recoger un cuenco y depositarlo en otra posición con el SO-101, útil como bloque base para experimentos de manipulación reproducible.
- Prototipado rápido de políticas VLA: sirve como referencia para equipos que quieran replicar el flujo de fine-tuning de SmolVLA sobre su propio robot y dataset.
- Docencia y formación en robótica: permite demostrar el ciclo completo teleoperación → dataset → entrenamiento → despliegue con un brazo de bajo coste.
- Benchmark interno de manipulación: puede usarse como línea base para comparar nuevas políticas o variantes de entrenamiento en la misma tarea.
- Integración en pipelines de LeRobot: se puede cargar con la librería `lerobot` para evaluación automatizada o para componerlo con otras políticas en un sistema mayor.
- Investigación en aprendizaje por imitación: útil para estudiar la transferencia de un VLA genérico a una tarea concreta con pocos datos y recursos computacionales moderados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 millones de parámetros en safetensors, los pesos ocupan aproximadamente 0,9 GB en precisión de 16 bits; la VRAM total dependerá del encoder visual y de los buffers de inferencia, no especificados. Una estimación conservadora sitúa el requisito en el rango de 2 a 6 GB, pero no está confirmada por la información proporcionada.
- GPU recomendadas: no disponibles de forma oficial; por tamaño, cabría esperar funcionamiento en GPUs consumer con al menos 8 GB de VRAM, aunque no se documenta.
- ¿Cabe en GPU consumer? Probable por el número de parámetros, pero no confirmado.
- Opciones de despliegue: la librería indicada es `lerobot`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLMs, no a políticas VLA).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zero-runtime/smolvla_so101_pick_place_bowl | 450 M | no disponible | Pick-and-place con SO-101 | Apache 2.0 | Gated en HuggingFace |
| lerobot/smolvla_base | no disponible en la información | no disponible | VLA genérico base | no disponible en la información | HuggingFace |
| Otras políticas VLA de la familia SmolVLA | no disponible | no disponible | Manipulación genérica | no disponible | no disponible |

La comparación se limita al modelo base del que deriva; no se dispone de datos de rendimiento ni de especificaciones de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado para una única tarea (pick-and-place de un cuenco) y un robot concreto (SO-101); no generalizará a otras tareas, objetos o morfologías sin reentrenamiento.
- Riesgo de sobreajuste al entorno de entrenamiento: cambios en iluminación, posición de cámara, fondo o disposición de objetos pueden degradar el rendimiento.
- Sin datos de benchmarks: no hay evidencia publicada de tasa de éxito ni de robustez.
- Sesgos: no documentados; en robótica, los sesgos provienen de la distribución de demostraciones de teleoperación, que puede no cubrir variaciones reales.
- Alucinación: en el contexto de políticas VLA, se traduce en acciones erróneas o inseguras; requiere supervisión y límites de seguridad en el robot.
- Idiomas: no se especifica en qué idioma se deben dar las instrucciones.
- Licencia Apache 2.0: permite uso comercial, pero el acceso está restringido en HuggingFace y requiere aceptar condiciones; conviene revisar los términos del modelo base `lerobot/smolvla_base`.
- Producción: no se documentan métricas de latencia, estabilidad ni seguridad; no se recomienda su uso en entornos físicos sin validación previa y mecanismos de parada de emergencia.

## Enlaces

- HuggingFace: https://huggingface.co/zero-runtime/smolvla_so101_pick_place_bowl
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/zero-runtime/so101_pick_place_bowl
- Librería LeRobot: https://github.com/huggingface/lerobot
