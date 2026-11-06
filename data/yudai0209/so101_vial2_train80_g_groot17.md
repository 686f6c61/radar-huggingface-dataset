# yudai0209/so101_vial2_train80_G_groot17

## Resumen

`yudai0209/so101_vial2_train80_G_groot17` es una política de robótica entrenada con LeRobot sobre el modelo fundacional GR00T N1.7 de NVIDIA. No es un modelo de lenguaje: es un modelo de imitación (visión-lenguaje-acción) especializado en una única tarea de manipulación con un brazo robótico SO-101, consistente en recoger un vial (blanco o azul) y depositarlo en uno de cuatro orificios de una gradilla. El autor es `yudai0209` y la política se publica bajo licencia Apache 2.0.

Técnicamente, la política parte del backbone Cosmos-Reason2/Qwen3-VL de GR00T N1.7 y añade un transformer de acciones con flow matching que predice comandos de 6 dimensiones a partir de tres cámaras (overhead, wrist y aux) y del estado propioceptivo de 6 dimensiones. El checkpoint contiene 3.144.016.000 parámetros en formato safetensors y ocupa 12,6 GB en el repositorio.

Su relevancia es acotada: se trata de un fine-tuning de referencia para el ecosistema LeRobot/GR00T, útil para quien quiera reproducir el flujo de entrenamiento o desplegar una política de pick-and-place sobre el hardware SO-101. No hay resultados de evaluación publicados ni métricas de éxito, por lo que debe tratarse como una política experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible (no se documenta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` (SO-101) |
| Cámaras de entrada | `overhead`, `wrist`, `aux` (3×480×640) |
| Entrada de estado | `observation.state` de forma (6,) |
| Salida de acción | `action` de forma (6,) |
| Tamaño del repositorio | 12,6 GB |
| Librería | lerobot 0.6.1 |

## Arquitectura y entrenamiento

La política se construye sobre GR00T N1.7, un modelo fundacional abierto de NVIDIA para razonamiento y habilidades robóticas entre morfologías. El backbone es Cosmos-Reason2/Qwen3-VL, que procesa las tres vistas de cámara y la instrucción en lenguaje natural; sobre él, un transformer de acciones con flow matching genera la secuencia de acciones condicionada por visión, lenguaje y propiocepción. La salida es un vector de 6 dimensiones que corresponde a los grados de libertad del brazo SO-101.

El entrenamiento es de imitación supervisada sobre el dataset `yudai0209/so101_vial2_train80_G`: 80 episodios, 47.589 frames a 30 FPS, con cuatro instrucciones de tarea (vial blanco al 1.er o 4.º orificio desde la derecha; vial azul al 2.º o 3.er orificio). La configuración registrada es de 20.000 pasos, batch de 32, optimizador AdamW, learning rate 1e-4 y semilla 42. No se documenta RLHF, DPO ni ninguna fase de ajuste por preferencias; tampoco se detalla la composición del dataset más allá de los episodios citados.

## Capacidades

- Manipulación robótica de pick-and-place: recoger un vial (blanco o azul) y colocarlo en un orificio concreto de una gradilla, siguiendo una instrucción en lenguaje natural.
- Condicionamiento multimodal: combina tres vistas de cámara (overhead, wrist, aux) con el estado propioceptivo de 6 dimensiones.
- Seguimiento de instrucciones de tarea en inglés, con cuatro variantes documentadas que difieren en color de vial y orificio destino.
- Control de un brazo SO-101 de 6 grados de libertad mediante predicción directa de acciones.
- Integración con el ecosistema LeRobot: ejecución vía `lerobot-rollout` y reentrenamiento vía `lerobot-train`.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general, código, matemáticas, visión general, audio ni modo de pensamiento; el uso previsto es exclusivamente robótico.

## Casos de uso

- Reproducción de experimentos de imitación: sirve como checkpoint de referencia para validar el pipeline de entrenamiento GR00T + LeRobot con un dataset pequeño (80 episodios) y comprobar que la infraestructura de entrenamiento funciona de extremo a extremo.
- Despliegue de pick-and-place en un SO-101: ejecutar la política con `lerobot-rollout` sobre el brazo real para tareas de trasvase de viales en un entorno controlado, usando las tres cámaras para las que fue entrenada.
- Base para fine-tuning en tareas de laboratorio: partir de estos pesos y reentrenar con un dataset propio de manipulación de viales u objetos similares, aprovechando el backbone preentrenado.
- Docencia y formación en robótica de imitación: usar la política y su dataset asociado para ilustrar el flujo completo de grabación de datos, entrenamiento y evaluación en un robot de bajo coste.
- Pruebas de integración de hardware: validar la calibración de cámaras y del puerto del robot comparando el comportamiento esperado con el observado en las cuatro instrucciones de tarea.
- Benchmark interno de políticas VLA: comparar el rendimiento de esta política con otros fine-tunings de GR00T o de modelos tipo ACT/Diffusion Policy sobre el mismo dataset, siempre que se realice una evaluación propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota explícita de que no se han proporcionado resultados para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación. Con 3.144 millones de parámetros en safetensors, el peso en precisión nativa (probablemente bf16/fp16) ronda los 6,3 GB; a ello hay que sumar el backbone visual y el estado de inferencia, por lo que se recomienda al menos 16 GB de VRAM como estimación conservadora.
- GPU recomendadas: no documentadas por el autor. Por tamaño, una RTX 4090 (24 GB), L40S, A100 o H100 cubrirían la inferencia con holgura; una GPU de 8-12 GB podría ser insuficiente si no se aplica cuantización.
- ¿Cabe en GPU de consumo? Probablemente sí en tarjetas de 16 GB o más (RTX 4080/4090, RTX 5070 Ti y superiores), aunque no hay confirmación del autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=yudai0209/so101_vial2_train80_G_groot17`), con `--policy.device=cuda` para entrenamiento. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de política.
- Latencia y throughput: no disponibles. La política se ejecuta en bucle cerrado a la frecuencia del robot (el dataset se grabó a 30 FPS), pero no se publican cifras de latencia por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yudai0209/so101_vial2_train80_G_groot17` | 3.144 M | no disponible | Pick-and-place de viales con SO-101 | Apache 2.0 | Hugging Face (0 descargas) |
| GR00T N1.7 (base, NVIDIA) | no disponible | no disponible | Modelo fundacional VLA entre morfologías | no disponible en la información | GitHub NVIDIA/Isaac-GR00T |
| Políticas ACT / Diffusion Policy en LeRobot | no disponible | no disponible | Imitación sobre SO-101 y otros brazos | Apache 2.0 (LeRobot) | Hugging Face / LeRobot |

La comparación con alternativas concretas no está disponible en la información proporcionada: no se han publicado métricas de éxito de esta política ni de políticas comparables sobre el mismo dataset, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito, número de ensayos ni condiciones de prueba documentadas; no debe asumirse que la política funciona de forma fiable.
- Especialización extrema: solo cubre cuatro instrucciones de una tarea concreta (vial blanco/azul a un orificio determinado) sobre un robot SO-101 y una disposición de cámaras concreta.
- Dependencia del hardware y la calibración: los nombres de cámara (`overhead`, `wrist`, `aux`), sus índices y el puerto del robot deben coincidir exactamente con los del entrenamiento; cualquier cambio de montaje o iluminación puede degradar el comportamiento.
- Dataset pequeño: 80 episodios y 47.589 frames son una base limitada, con riesgo de sobreajuste a posiciones, colores y condiciones de la escena de grabación.
- Idiomas: las instrucciones de tarea están en inglés; no se documenta soporte multilingüe.
- Riesgo de alucinación en el sentido de acciones erróneas o inseguras: al ser una política de control físico, los fallos pueden provocar colisiones o daños; requiere supervisión y paradas de emergencia.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo base GR00T N1.7 y sus dependencias deben verificarse por separado, ya que su licencia no se detalla en la información disponible.
- Sin cuantizaciones publicadas ni guías de despliegue en producción; el repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yudai0209/so101_vial2_train80_G_groot17
- Dataset de entrenamiento: https://huggingface.co/datasets/yudai0209/so101_vial2_train80_G
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=yudai0209/so101_vial2_train80_G
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
