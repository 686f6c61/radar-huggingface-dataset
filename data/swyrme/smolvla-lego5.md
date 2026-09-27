# swyrme/smolvla-lego5

## Resumen

smolvla-lego5 es una política de robótica (vision-language-action, VLA) publicada por el usuario swyrme en HuggingFace, obtenida mediante fine-tuning del modelo base lerobot/smolvla_base. No es un modelo de lenguaje conversacional: recibe observaciones multimodales (estado del robot e imágenes de cámara) y emite directamente comandos de acción de 6 dimensiones para un brazo robótico de tipo `so_follower` (familia SO-101). Resuelve una única tarea de manipulación: "Pick up the Lego brick and put it in the bowl" (coger el ladrillo de Lego y dejarlo en el cuenco).

El interés de esta ficha es doble. Por un lado, ilustra el flujo de trabajo de imitación con LeRobot 0.6.2 sobre hardware de bajo coste: 40 episodios, 13.983 fotogramas a 30 FPS y 20.000 pasos de entrenamiento con AdamW y learning rate 1e-4. Por otro, muestra el patrón habitual de publicación de políticas VLA compactas: un modelo base preentrenado (SmolVLA, enlazado al artículo arXiv:2506.01844) que se especializa con un dataset propio de pocas decenas de episodios.

El modelo tiene 450.046.176 parámetros (aproximadamente 450 M) y ocupa 0,9 GB en el repositorio, lo que indica pesos almacenados en 16 bits. La licencia es Apache 2.0 y la librería de referencia es LeRobot. No se han publicado resultados de evaluación, ni detalles sobre la longitud de contexto, cuantizaciones soportadas o idiomas, por lo que esos campos quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); política compacta de robótica basada en el modelo base lerobot/smolvla_base. Detalle interno de capas no disponible en la informacion proporcionada |
| Parametros totales | 450.046.176 (≈450 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos en safetensors, 0,9 GB, coherente con 16 bits) |
| Idiomas soportados | no disponible (la entrada textual se limita a la instruccion de tarea; no es un modelo multilingue) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |
| Tipo de robot | `so_follower` (SO-101) |
| Camaras declaradas | `front`, `side` (la model card tambien lista `camera1`, `camera2`, `camera3` y `empty_camera_0` como claves de observacion) |
| Entradas | `observation.state` (6,), `observation.images.*` (3, 256, 256) y (3, 480, 640) |
| Salidas | `action` (6,) |
| Modelo base | lerobot/smolvla_base |
| Dataset de entrenamiento | swyrme/so101-lego5_20260926_092321 |
| Descargas / likes en el momento del registro | 0 / 0 |
| Fecha de creacion | 2026-09-27 |

## Arquitectura y entrenamiento

La información disponible describe SmolVLA como un modelo compacto de visión-lenguaje-acción que, según su model card, "alcanza un rendimiento competitivo con un coste computacional reducido y puede desplegarse en hardware de consumo". Esta política concreta es un fine-tuning de lerobot/smolvla_base: no se publica la composición detallada del backbone (codificador visual, torre de lenguaje, cabezal de acciones), el número de capas ni el mecanismo exacto de generación de acciones. El artículo de referencia es arXiv:2506.01844, enlazado desde el propio repositorio.

En cuanto al entrenamiento, la model card especifica 20.000 pasos, batch size 8, optimizador AdamW, learning rate 0,0001, semilla 1000 y LeRobot 0.6.2. El dataset consta de 40 episodios y 13.983 fotogramas grabados a 30 FPS, con una única tarea anotada. Se trata, por tanto, de aprendizaje por imitación supervisado sobre demostraciones humanas; no hay mención a RLHF, DPO ni a fases de refinamiento con preferencias. Tampoco se documentan innovaciones técnicas propias de este fine-tuning más allá de las del modelo base.

## Capacidades

- Generación de acciones de manipulación: produce vectores de acción de 6 dimensiones a partir del estado del robot y de hasta cuatro flujos de imagen.
- Ejecución de una tarea concreta de pick-and-place: coger un ladrillo de Lego y depositarlo en un cuenco.
- Fusión de múltiples vistas de cámara: consume observaciones visuales a 256×256 y una cámara adicional a 480×640.
- Control reactivo a 30 FPS: el dataset de entrenamiento se grabó a esa frecuencia, que es el régimen temporal esperado de la política.
- Integración con el ecosistema LeRobot: se ejecuta con `lerobot-rollout` y se puede reentrenar con `lerobot-train`.
- Aprendizaje a partir de pocos datos: se especializa con 40 episodios, lo que lo hace útil como plantilla para nuevos objetos o tareas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo de razonamiento explícito (thinking), visión general, audio o generación de texto libre: no disponibles; el modelo no está orientado a esas tareas.

## Casos de uso

- Automatización de pick-and-place en células de montaje: la política coloca piezas pequeñas (ladrillos de Lego) en un contenedor definido. Es adecuada porque el espacio de acciones de 6 dimensiones coincide con brazos de 6 GDL tipo SO-101 y la tarea está acotada y repetitiva.
- Prototipado rápido de políticas de imitación en laboratorio: sirve como punto de partida para validar el ciclo completo de LeRobot (grabación de dataset, entrenamiento, rollout) con un coste de datos muy bajo (40 episodios).
- Investigación en aprendizaje por imitación con hardware de bajo coste: permite reproducir experimentos de VLA compactos en brazos SO-101 sin necesidad de clústeres de GPU, dado el tamaño de 450 M de parámetros.
- Generación de datos sintéticos o aumentados para entrenar políticas posteriores: la política puede ejecutar la tarea de forma autónoma y producir trayectorias adicionales que amplíen el dataset original.
- Evaluación comparativa de configuraciones de cámara: al aceptar varias vistas (`front`, `side`, 256×256 y 480×640), permite medir el impacto del número y resolución de cámaras en la tasa de éxito.
- Clasificación y manipulación de piezas pequeñas en entornos educativos: es un caso de uso realista para cursos de robótica, ya que el modelo cabe en GPUs de consumo y la tarea es visualmente clara.
- Reentrenamiento para nuevas variantes de la tarea (otro objeto, otra posición del cuenco): el mismo pipeline de fine-tuning sobre `lerobot/smolvla_base` se puede repetir con un dataset nuevo, reutilizando la configuración de entrenamiento documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye explícitamente la sección de evaluación vacía, con la nota "No evaluation results have been provided for this policy yet". No consta tasa de éxito, número de ensayos ni condiciones de prueba (posiciones del objeto, iluminación, distractores).

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 0,9 GB y los pesos son de 450.046.176 parámetros, lo que corresponde a almacenamiento en 16 bits (≈0,9 GB). Con activaciones y tres flujos de imagen (256×256 más una cámara de 480×640) es razonable estimar 2-3 GB de VRAM, aunque el autor no publica una cifra oficial.
- GPU recomendadas: cualquier GPU con al menos 4 GB de memoria. Se espera funcionamiento correcto en RTX 3060, RTX 4060, RTX 4090, A100 y H100, y en plataformas embebidas tipo Jetson Orin. El artículo del modelo base afirma que está pensado para hardware de consumo.
- Cabe en GPU de consumo: sí, con margen amplio, dado el tamaño del modelo.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento) sobre PyTorch con CUDA (`--policy.device=cuda`). No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, que son servidores orientados a modelos generativos de texto y no a políticas VLA. Tampoco se documenta exportación a ONNX o TensorRT.
- Latencia y throughput: no disponibles. La única referencia temporal es la frecuencia de grabación del dataset, 30 FPS, con una duración de política de 60 segundos en el ejemplo de `lerobot-rollout`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| swyrme/smolvla-lego5 | 450 M | no disponible | Pick-and-place de un ladrillo de Lego (SO-101) | Apache 2.0 | HuggingFace, via LeRobot |
| lerobot/smolvla_base | no disponible (modelo del que deriva este) | no disponible | Politica VLA general para fine-tuning | no disponible | HuggingFace, via LeRobot |
| OpenVLA (referencia de la categoria VLA de proposito general) | ≈7 B (dato de conocimiento general, no verificado en la informacion proporcionada) | no disponible | Manipulacion robotica de proposito general | no disponible | pesos abiertos |
| pi0 / pi0.5 (Physical Intelligence) | ≈3 B (dato de conocimiento general, no verificado en la informacion proporcionada) | no disponible | Manipulacion robotica de proposito general | no disponible | parcialmente abiertos |

La comparación cuantitativa de rendimiento no es posible: la información disponible no incluye resultados de benchmarks ni tasas de éxito para ninguna de las alternativas. La ventaja diferencial de smolvla-lego5 es su tamaño reducido (450 M) y su licencia Apache 2.0, no un rendimiento medido superior.

## Limitaciones y advertencias

- Especialización extrema: el modelo ha sido entrenado para una sola tarea y un solo tipo de robot. No generaliza a otras tareas sin reentrenamiento.
- Dataset muy pequeno: 40 episodios y 13.983 fotogramas. Existe riesgo alto de sobreajuste a las posiciones, iluminación y fondo presentes en la grabación.
- Sin evaluación publicada: no hay ninguna medida de tasa de éxito, por lo que no se puede afirmar que la política funcione de forma fiable en producción.
- Dependencia del hardware: la política asume un robot `so_follower` con cinemática y calibración concretas. Cambiar de brazo, de calibración o de montaje de cámaras puede degradar el comportamiento.
- Dependencia de las cámaras: las claves de observación deben coincidir exactamente con las usadas en el entrenamiento (`front`, `side`, `camera1`-`camera3`, `empty_camera_0`). Una cámara ausente o mal nombrada invalida la inferencia.
- Sensibilidad al cambio de dominio: cambios de iluminación, de color del objeto, de posición inicial o la presencia de distractores pueden provocar fallos de agarre.
- Idiomas: no disponible. La instrucción de tarea se pasa como texto, pero no hay evidencia de soporte multilingüe ni de variación en la formulación.
- Alucinación: en sentido estricto no aplica, ya que el modelo no genera texto libre; el fallo equivalente es la ejecución de una trayectoria incorrecta o el bloqueo del brazo.
- Licencia: Apache 2.0 permite uso comercial del modelo, pero la licencia del dataset de entrenamiento (swyrme/so101-lego5_20260926_092321) no se detalla en la informacion proporcionada y conviene verificarla antes de un uso comercial.
- Trazabilidad: 0 descargas y 0 likes en el momento del registro, sin historial de uso ni validación por parte de terceros.
- Versionado: la model card indica LeRobot 0.6.2; versiones distintas de la libreria pueden requerir ajustes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/swyrme/smolvla-lego5
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/swyrme/so101-lego5_20260926_092321
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=swyrme/so101-lego5_20260926_092321
- Articulo de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre SmolVLA; los resultados obtenidos eran contenido no relacionado y se han descartado.
