# wolfL/round_2

## Resumen

`wolfL/round_2` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT) y publicada en Hugging Face mediante la librería LeRobot. No es un modelo de lenguaje: es un controlador visomotor que, a partir del estado articular del robot y de dos cámaras (superior y de muñeca), predice directamente comandos de acción de 6 dimensiones para un brazo `so_follower` (el seguidor del robot SO-100/SO-101 de bajo coste). Lo desarrolla el usuario `wolfL` como artefacto derivado de un experimento de recogida de datos propio, sin model card comercial ni evaluación publicada.

El modelo resuelve una tarea concreta de manipulación: "drop square in the bucket and place traingel in the board" (depositar un cuadrado en un cubo y colocar un triángulo en un tablero). Se entrenó con 39 episodios de teleoperación (32.111 fotogramas a 30 FPS) durante 30.000 pasos con batch 8 y learning rate 1e-5, sobre LeRobot 0.7.0. Con 51.668.614 parámetros y 0,2 GB de repositorio, es un modelo pequeño que cabe sin problemas en cualquier GPU consumer.

Su relevancia es la de un ejemplo reproducible de imitation learning de extremo a extremo con hardware asequible: sirve para validar pipelines de LeRobot, para replicar la receta ACT y como punto de partida para quien quiera entrenar su propia política con dos cámaras y un robot SO. No debe evaluarse con los criterios de un LLM: no tiene contexto tokenizado, ni capacidades lingüísticas, ni benchmarks de razonamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de chunks de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política robótica; ventana de observación de estado + 2 imágenes) |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea se especifica como cadena de texto en la CLI) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors |
| Librería | lerobot 0.7.0 |
| Tipo de robot | `so_follower` |
| Cámaras | `top`, `wrist` |
| Entrada `observation.state` | STATE, shape `(6,)` |
| Entrada `observation.images.top` | VISUAL, shape `(3, 480, 640)` |
| Entrada `observation.images.wrist` | VISUAL, shape `(3, 640, 480)` |
| Salida `action` | ACTION, shape `(6,)` |
| Tamaño del repositorio | 0,2 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

ACT es un método de imitation learning que predice *chunks* de acciones (varias acciones futuras de una vez) en lugar de un único paso, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. La política combina un codificador visual (ResNet preentrenada, según el paper original) que procesa las dos cámaras con un transformer que fusiona las observaciones y genera la secuencia de acciones. La salida es un vector de 6 dimensiones que corresponde a los comandos del brazo `so_follower`.

El entrenamiento se realizó sobre el dataset `wolfL/round_2_20261124_160314`, con 39 episodios, 32.111 fotogramas a 30 FPS y una única tarea compuesta ("drop square in the bucket and place traingel in the board"). La configuración reportada es: 30.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5, semilla 1000 y LeRobot 0.7.0. No se documenta composición del dataset, aumento de datos, número de tokens (no aplica) ni fases de RLHF/DPO (no aplica a imitation learning). Tampoco se indica si se aplicó decodificación especulativa ni ninguna innovación adicional más allá del chunking propio de ACT.

## Capacidades

- Control visomotor de un brazo robótico `so_follower` a partir de estado articular de 6 dimensiones y dos cámaras RGB.
- Predicción de chunks de acciones de 6 dimensiones (no pasos individuales), lo que aporta suavidad y robustez en la ejecución.
- Ejecución de una tarea compuesta concreta: depositar un cuadrado en un cubo y colocar un triángulo en un tablero.
- Aprendizaje por imitación a partir de datos de teleoperación; no requiere recompensa ni entorno simulado.
- Integración nativa con el ecosistema LeRobot: `lerobot-rollout` para ejecución y `lerobot-train` para reentrenamiento.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, visión general, audio ni capacidades multilingües.
- No dispone de modo "thinking" ni de generación de texto libre.

## Casos de uso

- **Validación de un pipeline LeRobot de extremo a extremo:** usar `lerobot-rollout` con `--policy.path=wolfL/round_2` para comprobar que la instalación, la calibración del robot y las cámaras funcionan antes de entrenar una política propia. Es adecuado porque el modelo ya está empaquetado y la CLI está documentada.
- **Réplica de la receta ACT con hardware de bajo coste:** entrenar una política equivalente con `lerobot-train --policy.type=act` sobre un dataset propio de 30-40 episodios y comparar curvas de pérdida y comportamiento con esta referencia. Sirve como línea base reproducible.
- **Demostración educativa de imitation learning:** mostrar en clase o en un taller cómo un transformer pequeño (51,7 M de parámetros) puede ejecutar una tarea de manipulación con dos cámaras y 39 episodios, sin necesidad de simulación ni de RL.
- **Punto de partida para fine-tuning en tareas de pick-and-place:** reutilizar los pesos como inicialización y ajustar con datos nuevos para tareas similares (cubos, tableros, objetos geométricos) en el mismo robot `so_follower`.
- **Pruebas de robustez ante cambios de iluminación y posición:** ejecutar la política repetidamente variando la posición de los objetos y la iluminación para medir la degradación del éxito, ya que la model card no reporta evaluación y conviene caracterizarla empíricamente.
- **Integración en un banco de pruebas de políticas robóticas:** comparar ACT con otras políticas de LeRobot (p. ej. Diffusion Policy o VQ-BeT) sobre la misma tarea y el mismo dataset para decidir qué método conviene en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: *"No evaluation results have been provided for this policy yet."* No hay tabla de éxito por tarea, ni número de ensayos, ni comparación con otras políticas.

## Requisitos de hardware

- **VRAM estimada para inferencia:** muy baja; con 51,7 M de parámetros, los pesos en fp32 ocupan aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU con 4 GB o más, incluyendo iGPU y Jetson.
- **GPU recomendadas:** cualquier GPU consumer (RTX 3060, RTX 4060, RTX 4090) es suficiente; también funciona en CPU para pruebas lentas. Para entrenamiento, una RTX 3090/4090 o A100 acelera los 30.000 pasos, aunque el modelo es lo bastante pequeño para entrenar en GPUs modestas.
- **¿Cabe en consumer GPU?** Sí, en prácticamente cualquier GPU consumer y en placas embebidas tipo Jetson Orin Nano.
- **Opciones de despliegue:** LeRobot (`lerobot-rollout`) es la vía documentada; el formato safetensors permite cargarlo con PyTorch directamente. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- **Latencia y throughput:** no disponibles. Depende del hardware, de la resolución de las dos cámaras (480x640 y 640x480) y de la frecuencia de control del robot; el dataset se grabó a 30 FPS, lo que sugiere que la política debe ejecutarse al menos a esa frecuencia para un control fluido.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wolfL/round_2` | ACT (LeRobot) | 51,7 M | no aplica | no disponible | Hugging Face |
| Diffusion Policy (referencia LeRobot) | Política de difusión | no disponible | no aplica | según implementación de LeRobot | LeRobot |
| VQ-BeT (referencia LeRobot) | Política con cuantización vectorial | no disponible | no aplica | según implementación de LeRobot | LeRobot |
| ACT original (paper 2304.13705) | ACT | no disponible | no aplica | según autores | Paper y código de referencia |

No se dispone de datos de rendimiento comparables (tasas de éxito, latencia) para establecer una comparación cuantitativa entre estas políticas en la misma tarea.

## Limitaciones y advertencias

- **Sin evaluación publicada:** no hay tasa de éxito, número de ensayos ni condiciones de prueba; no se puede afirmar que la política funcione de forma fiable en producción.
- **Tarea única y muy específica:** solo se entrenó para "drop square in the bucket and place traingel in the board"; generalizar a otros objetos o disposiciones requiere reentrenamiento.
- **Dataset pequeño:** 39 episodios y 32.111 fotogramas son pocos para una política robusta; es probable que aparezcan problemas de sobreajuste a posiciones, iluminación y objetos concretos.
- **Licencia no disponible:** la model card indica "[More Information Needed]"; no se puede asumir uso comercial sin consultar al autor.
- **Dependencia del hardware:** requiere un robot `so_follower` con dos cámaras (`top` y `wrist`) en las resoluciones y nombres de observación exactos; cualquier cambio en la configuración invalida la política.
- **Sin soporte de lenguaje ni de tool calling:** no es un LLM; no debe emplearse para tareas de texto, razonamiento o agentes.
- **Riesgo de alucinación en el sentido robótico:** puede generar acciones plausibles pero incorrectas cuando la escena difiere de la distribución de entrenamiento; conviene monitorizar y limitar la duración de ejecución.
- **Sesgos de datos:** al proceder de teleoperación de un único operador, la política hereda sus sesgos de velocidad, trayectoria y estilo de manipulación.
- **Caveat de producción:** la propia model card advierte de que la ejecución con `--strategy.type=base` no graba episodios y de que omitir `--duration` hace que la política se ejecute indefinidamente; en producción hay que acotar la duración y añadir paradas de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wolfL/round_2
- Dataset de entrenamiento: https://huggingface.co/datasets/wolfL/round_2_20261124_160314
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=wolfL/round_2_20261124_160314
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
