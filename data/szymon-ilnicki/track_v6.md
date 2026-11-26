# Szymon-Ilnicki/track_v6

## Resumen

Track_v6 es una política de imitación de tipo vision-language-action (VLA) para conducción autónoma a escala de vehículo RC, publicada por Szymon-Ilnicki en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo base `lerobot/smolvla_base`, un VLA compacto desarrollado por Hugging Face dentro del ecosistema LeRobot, pensado para ejecutarse en hardware de consumo. El modelo resultante está especializado en una única tarea robótica: completar vueltas a un circuito con un vehículo de tipo `f1tenth`, con variantes de sentido de giro y de paso de conos por izquierda o derecha.

El modelo no es un LLM ni un modelo generativo de texto: es una política de control que consume dos flujos de cámara y un vector de estado de dos dimensiones, y produce una acción de dos dimensiones. Su relevancia es práctica: demuestra el flujo completo de LeRobot para grabar un dataset reducido (20 episodios, 11.250 fotogramas a 10 FPS), entrenar una política SmolVLA y desplegarla con `lerobot-rollout` sobre un robot real.

Con 450.046.176 parámetros en pesos safetensors y un repositorio de 1,2 GB, el modelo es ligero en comparación con los VLA de gran escala, lo que permite entrenamiento e inferencia en GPUs de consumo. La licencia Apache 2.0 facilita su reutilización, aunque el alcance de la política está fuertemente limitado al dominio del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, SmolVLA (base `lerobot/smolvla_base`) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (las tareas se especifican en inglés en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `f1tenth` |
| Camaras | `camera1`, `camera2` |
| Entrada visual | `(3, 240, 424)` por cámara |
| Entrada de estado | `(2,)` |
| Salida de acción | `(2,)` |
| Dataset de entrenamiento | `local/track_v6` (20 episodios, 11.250 fotogramas, 10 FPS) |
| Pasos de entrenamiento | 20.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 0,0001 |
| Seed | 1000 |
| Version de LeRobot | 0.7.0 |
| Tamano del repositorio | 1,2 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de SmolVLA, una arquitectura vision-language-action compacta presentada en el artículo arXiv:2506.01844. SmolVLA combina un codificador visual y un modelo de lenguaje pequeño para producir acciones motoras directamente a partir de observaciones visuales y de estado, siguiendo el paradigma de las políticas de imitación modernas. El modelo base está integrado en LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica.

El entrenamiento se realizó sobre el dataset `local/track_v6`, compuesto por 20 episodios y 11.250 fotogramas capturados a 10 FPS. Las tareas registradas incluyen completar vueltas en sentido antihorario y horario a velocidad lenta, con variantes de paso de cono por la izquierda o por la derecha. La configuración de entrenamiento empleó 20.000 pasos, batch size de 8, optimizador AdamW con learning rate 1e-4 y semilla 1000, sobre LeRobot 0.7.0. No se documenta en la información disponible el uso de RLHF, DPO ni de técnicas de decodificación especulativa; se trata de aprendizaje por imitación supervisado sobre demostraciones.

## Capacidades

- Control de conducción de un vehículo `f1tenth` a partir de dos cámaras y un vector de estado de dos dimensiones.
- Ejecución de tareas de circuito con instrucciones en lenguaje natural: "complete laps anticlockwise slowly", "complete laps clockwise slowly" y variantes con paso de cono por izquierda o derecha.
- Política de imitación entrenada de extremo a extremo sobre demostraciones, sin necesidad de un planificador explícito.
- Integración nativa con el ecosistema LeRobot: `lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento.
- Capacidad de desplegarse en hardware de consumo, según la premisa de diseño de SmolVLA.
- No se documentan capacidades de tool calling, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio ni modo de pensamiento.

## Casos de uso

- Conducción autónoma de un vehículo RC en circuito: la política recibe las dos cámaras y el estado del vehículo y emite las acciones de control para completar vueltas, lo que permite validar pipelines de imitación en un banco de pruebas físico de bajo coste.
- Navegación con evitación de obstáculos simples: las variantes de tarea con paso de cono por izquierda o derecha permiten evaluar cómo la instrucción en lenguaje natural modula la trayectoria del vehículo.
- Docencia e investigación en robótica: el modelo sirve como ejemplo reproducible de un flujo LeRobot completo, desde la grabación de 20 episodios hasta el despliegue con `lerobot-rollout`.
- Prototipado rápido de políticas VLA: al partir de `lerobot/smolvla_base` y requerir solo 11.250 fotogramas, es adecuado para experimentar con nuevos datasets de trayectorias sin grandes presupuestos de cómputo.
- Benchmark interno de infraestructura de inferencia: con 450 millones de parámetros, permite medir latencia y throughput de políticas VLA en GPUs de consumo antes de escalar a modelos mayores.
- Reentrenamiento sobre nuevos circuitos: el comando `lerobot-train` documentado permite ajustar el modelo a otros datasets manteniendo la misma interfaz de observación y acción.
- Evaluación comparativa de estrategias de imitación: sirve como línea base para contrastar variantes de SmolVLA u otras políticas sobre el mismo robot `f1tenth`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 millones de parámetros en safetensors, la huella de pesos ronda los 1,8 GB en FP32 y aproximadamente 0,9 GB en FP16, a lo que hay que sumar el codificador visual y los buffers de inferencia.
- GPU recomendadas: no especificadas en la información disponible; SmolVLA está diseñado para hardware de consumo, por lo que una RTX 4090 o superior es holgada, y GPUs de gama media con suficiente VRAM deberían ser viables.
- Cabe en GPU de consumo: sí, según la premisa de diseño de SmolVLA de desplegarse en hardware de consumo; no se detallan modelos concretos mínimos.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` y `--policy.path=Szymon-Ilnicki/track_v6`; entrenamiento con `lerobot-train`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Szymon-Ilnicki/track_v6 | 450.046.176 | VLA (SmolVLA fine-tuned) | no aplica | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible | VLA (SmolVLA base) | no aplica | no disponible en la información | Hugging Face |
| Otras políticas LeRobot | no disponible | Políticas de imitación | no aplica | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Política especializada: entrenada exclusivamente para el robot `f1tenth` y el circuito del dataset `local/track_v6`; no se espera generalización a otros robots, cámaras o entornos sin reentrenamiento.
- Dataset muy reducido: 20 episodios y 11.250 fotogramas limitan la robustez frente a cambios de iluminación, posiciones de conos o condiciones no vistas.
- Sin evaluación publicada: la model card indica que no hay resultados de éxito en robot real, por lo que el rendimiento real es desconocido.
- Dependencia de la configuración de cámaras: los nombres e índices de cámara deben coincidir con las claves de observación (`camera1`, `camera2`) y las resoluciones de entrenamiento `(3, 240, 424)`.
- Riesgo de sobreajuste y de comportamiento errático fuera de distribución; no se documentan sesgos específicos más allá del dominio de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y la especificidad del dominio desaconsejan su uso en producción sin validación exhaustiva.
- No apta para tareas de lenguaje, razonamiento o generación de contenido: es una política de control, no un modelo conversacional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Szymon-Ilnicki/track_v6
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Artículo SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/local/track_v6
- Guía SmolVLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=local/track_v6
