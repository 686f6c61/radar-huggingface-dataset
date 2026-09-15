# ulasZoi/smolvla_pickcube_bs64_LoRA

# ulasZoi/smolvla_pickcube_bs64_LoRA

## Resumen

`ulasZoi/smolvla_pickcube_bs64_LoRA` es una política de robótica de tipo visión-lenguaje-acción (VLA) publicada en HuggingFace por el usuario ulasZoi, afinada a partir del modelo base `lerobot/smolvla_base`. Se distribuye a través de la librería LeRobot (versión 0.6.2 según la model card) y está especializada en una única tarea de manipulación: recoger un cubo ("pick up the cube") con un robot de tipo `so_follower`. No es un modelo de lenguaje conversacional: consume observaciones multimodales (estado articular y varias cámaras) y produce un vector de acción de 6 dimensiones.

El modelo subyacente, SmolVLA, se describe en el paper arXiv:2506.01844 como un VLA compacto y eficiente, capaz de alcanzar un rendimiento competitivo con un coste computacional reducido y de desplegarse en hardware de consumo. El repositorio concreto que nos ocupa es un ajuste fino con una receta de entrenamiento de 20.000 pasos, batch de 64, optimizador AdamW y learning rate de 0,001, sobre un dataset propio de 243 episodios y 76.011 fotogramas a 30 FPS.

Su relevancia es acotada: se trata de un artefacto de investigación o de un experimento personal orientado a la reproducibilidad de un pipeline de imitation learning de extremo a extremo con LeRobot, no de un modelo de propósito general. El repositorio no tiene descargas ni "likes" registrados, y el autor no ha publicado resultados de evaluación. El peso del repositorio figura como 0,0 GB, dato coherente con un ajuste de bajo rango (el nombre del repositorio incluye "LoRA"), aunque este extremo no se confirma de forma explícita en la documentación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) compacta, basada en SmolVLA (arXiv:2506.01844); detalles de capas no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (el modelo no genera lenguaje natural; recibe una instrucción de tarea en texto, en este caso únicamente "pick up the cube") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de pipeline | robotics |
| Librería | lerobot (LeRobot 0.6.2 durante el entrenamiento) |
| Modelo base | lerobot/smolvla_base (fine-tune) |
| Tipo de robot | so_follower |
| Cámaras declaradas | front (la tabla de entradas detalla además camera1, camera2, camera3 y dos cámaras "empty") |
| Entrada: estado | observation.state, shape (6,) |
| Entradas visuales | 3 × (3, 256, 256) y 2 × (3, 480, 640) |
| Salida | action, shape (6,) |
| Dataset de entrenamiento | ulasZoi/smolvla_pickcube_all |
| Episodios / fotogramas | 243 episodios / 76.011 fotogramas a 30 FPS |
| Pasos de entrenamiento | 20.000 |
| Batch size | 64 |
| Optimizador / LR | AdamW / 0,001 |
| Semilla | 1000 |
| Fecha de creación en el Hub | 2026-09-15 |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La model card identifica el método como SmolVLA, un modelo visión-lenguaje-acción compacto que, según su descripción, logra rendimiento competitivo con costes computacionales reducidos y puede desplegarse en hardware de consumo. La implementación y el ciclo de entrenamiento se apoyan íntegramente en LeRobot: el modelo se ha entrenado y publicado con esa librería, y la política se ejecuta y se reentrena con las herramientas `lerobot-rollout` y `lerobot-train`. La política consume observaciones heterogéneas —estado articular de 6 dimensiones y cinco flujos de imagen, tres a 256×256 y dos a 480×640— y emite un vector de acción de 6 dimensiones. No se documentan en la información disponible ni el número de capas, ni la dimensión oculta, ni el mecanismo exacto de fusión entre el codificador visual-lenguaje y la cabeza de acción.

El ajuste fino se realizó sobre `lerobot/smolvla_base` con el dataset `ulasZoi/smolvla_pickcube_all`, compuesto por 243 episodios y 76.011 fotogramas grabados a 30 FPS (aproximadamente 42 minutos de demostraciones) para una única tarea. La configuración reportada es de 20.000 pasos, batch de 64, optimizador AdamW, learning rate de 0,001 y semilla 1000. No se especifica en la información proporcionada si hubo etapas de RLHF, DPO u otro ajuste por preferencias, ni la composición detallada del dataset más allá del número de episodios y la tarea. El nombre del repositorio sugiere el uso de LoRA (adaptadores de bajo rango) en lugar de un ajuste completo, pero este dato no se confirma explícitamente en la documentación del autor.

## Capacidades

- Control robótico por imitación: genera comandos de acción de 6 grados de libertad para un brazo `so_follower`.
- Percepción visual multimodal: procesa simultáneamente estado articular y hasta cinco flujos de cámara con resoluciones de 256×256 y 480×640.
- Ejecución de una tarea específica de manipulación: "pick up the cube" (recoger el cubo).
- Condicionamiento por instrucción textual de tarea: acepta un campo `task` (por ejemplo, `--task="pick up the cube"`), aunque no se documenta variabilidad de instrucciones.
- Despliegue en bucle cerrado sobre robot real mediante `lerobot-rollout`, con estrategia `base` y ejecución configurable en duración.
- Reentrenamiento y fine-tuning posterior desde el modelo base o desde este mismo checkpoint con `lerobot-train`.
- Soporte de tool calling: no aplica; el modelo no expone API de herramientas ni function calling.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no aplica; el modelo no genera texto.
- Modo "thinking", visión general, audio, matemáticas o generación de código: no documentados; el modelo no es un LLM de propósito general.

## Casos de uso

- Recogida automatizada de piezas en un banco de laboratorio: la política puede ejecutar la acción de coger un cubo desde posiciones variables sobre una superficie de trabajo, usando las tres cámaras de 256×256 como entrada visual y el estado articular de 6 dimensiones como realimentación propioceptiva.
- Docencia y formación en robótica: sirve como ejemplo reproducible de un pipeline completo de imitation learning con LeRobot, desde la grabación del dataset hasta el despliegue con `lerobot-rollout`, sobre un brazo de bajo coste tipo SO-100/SO-101.
- Punto de partida para transfer learning: al estar afinado desde `lerobot/smolvla_base`, puede reentrenarse con un dataset propio para nuevas tareas de pick-and-place sin partir de cero, reutilizando la receta documentada (20.000 pasos, batch 64, AdamW, LR 0,001).
- Generación de datos sintéticos o ampliación de datasets: las trayectorias ejecutadas por la política pueden registrarse (activando la grabación de episodios) para aumentar `ulasZoi/smolvla_pickcube_all` o alimentar variantes con objetos, posiciones e iluminación distintas.
- Evaluación comparativa de políticas VLA: al ser un checkpoint con receta y dataset explícitos, permite medir de forma controlada el efecto del ajuste fino respecto al modelo base en una tarea acotada.
- Prototipado de células de manipulación de bajo coste: dado que SmolVLA se describe como desplegable en hardware de consumo, encaja en montajes de laboratorio o demo donde no hay acceso a GPU de datacenter.
- Automatización de tareas repetitivas de clasificación ligera: con un reentrenamiento sobre el mismo robot, el flujo podría adaptarse a separar objetos por forma o color en líneas de baja cadencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica textualmente: "No evaluation results have been provided for this policy yet". No constan tasas de éxito, número de ensayos ni condiciones de evaluación (posiciones de objeto, iluminación, distractores o variaciones de robot).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se documentan requisitos de memoria ni tamaño de los pesos.
- GPU recomendadas: no disponibles de forma específica. La descripción del método SmolVLA afirma que puede desplegarse en hardware de consumo, pero el repositorio no concreta modelos de GPU.
- Compatibilidad con GPU de consumo: no confirmada para este checkpoint concreto; la afirmación genérica sobre SmolVLA apunta a que sí es posible, pero no hay cifras asociadas a este ajuste fino.
- Opciones de despliegue: LeRobot, mediante el comando `lerobot-rollout` con `--strategy.type=base` y `--policy.path=ulasZoi/smolvla_pickcube_bs64_LoRA`. No se documenta soporte para vLLM, TGI, llama.cpp u Ollama, que no son aplicables a este tipo de política.
- Hardware robótico requerido: brazo `so_follower`, puerto serie configurable, y cámaras OpenCV a 640×480 y 30 FPS cuyos nombres coincidan con las claves de observación del entrenamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ulasZoi/smolvla_pickcube_bs64_LoRA | no disponible | no disponible | Recoger un cubo con `so_follower` | apache-2.0 | HuggingFace (0 descargas, 0 likes) |
| lerobot/smolvla_base | no disponible | no disponible | VLA base preentrenado, punto de partida del fine-tune | no disponible en la información proporcionada | HuggingFace |
| Otras políticas VLA de la misma categoría (por ejemplo OpenVLA o pi0) | no disponible | no disponible | Manipulación robótica generalista | no disponible | No se ha aportado información comparable en esta búsqueda |

Los resultados de la búsqueda web proporcionada no contienen información técnica sobre alternativas de la misma categoría, por lo que no es posible establecer una comparación cuantitativa rigurosa de parámetros, contexto, rendimiento o licencia frente a otros modelos VLA.

## Limitaciones y advertencias

- Modelo de tarea única: el entrenamiento se limita a la instrucción "pick up the cube" sobre un único tipo de robot (`so_follower`); no hay evidencia de generalización a otras tareas, objetos o morfologías.
- Ausencia total de evaluación: no se han publicado tasas de éxito ni condiciones de prueba, por lo que el rendimiento real en robot es desconocido.
- Repositorio sin adopción: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de terceros.
- Tamaño del repositorio de 0,0 GB: conviene verificar que los pesos estén efectivamente subidos y completos antes de integrarlo en cualquier pipeline; un repositorio vacío o truncado impediría la carga de la política.
- Posible discrepancia en las entradas: la model card declara una única cámara `front`, mientras que la tabla de entradas lista `camera1`, `camera2`, `camera3` y dos cámaras `empty_camera_0` y `empty_camera_1`. Hay que confirmar qué claves de observación son realmente necesarias en tiempo de inferencia.
- Dependencia estricta del entorno: los nombres de cámara, el puerto del robot y las resoluciones deben coincidir con las del entrenamiento; cualquier variación de calibración, iluminación o montaje puede degradar el comportamiento.
- Riesgo de sobreajuste al dataset: 243 episodios y unos 42 minutos de demostraciones son un volumen reducido que puede limitar la robustez ante posiciones de cubo no vistas.
- Licencia: apache-2.0 permite uso comercial, pero no se documenta la licencia del modelo base ni del dataset utilizado, por lo que conviene verificar la cadena de licencias antes de un despliegue en producción.
- Sesgos y alucinación: no aplican en el sentido de un LLM, pero sí existe riesgo de acciones erráticas o inseguras en el espacio físico; se recomienda operar con límites de par, parada de emergencia y supervisión humana.
- Idiomas y contexto: no hay soporte multilingüe ni ventana de contexto de texto en el sentido habitual; la instrucción de tarea está fijada por el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ulasZoi/smolvla_pickcube_bs64_LoRA
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/ulasZoi/smolvla_pickcube_all
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ulasZoi/smolvla_pickcube_all
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
