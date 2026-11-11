# team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-smolvla_fft-steps60k-decay60k

## Resumen

SOBIT Home Left es una política de visión-lenguaje-acción (VLA) obtenida por ajuste fino supervisado del modelo base `lerobot/smolvla_base` sobre un conjunto de datos propio de manipulación móvil simulado. La desarrolla el equipo `team-sobits` y se distribuye a través de LeRobot, la librería de Hugging Face para robótica. Resuelve una tarea concreta y única: "Throw the tomato can into the trash bin" (lanzar una lata de tomate a la papelera) con un manipulador móvil equipado con cámara de cabeza y cámara en la mano izquierda.

El modelo emplea la arquitectura SmolVLA, un VLA compacto y eficiente presentado en el paper arXiv:2506.01844, diseñado para ejecutarse en hardware de consumo. Con 450.046.176 parámetros totales (unos 450 M) y pesos en formato safetensors, se posiciona en la gama baja de tamaño dentro de los VLA, lo que lo hace apto para inferencia en tiempo real sobre GPU de gama media. La entrada combina un vector de estado de 20 dimensiones con dos flujos de imagen (480x640 y 400x640) y produce un vector de acción de 20 dimensiones.

Es relevante ahora porque demuestra el flujo completo de LeRobot para ajustar políticas de imitación sobre robots reales o simulados con datos propios: 200 episodios, 48.141 fotogramas a 10 FPS y 60.000 pasos de entrenamiento. No obstante, se trata de un artefacto de investigación acotado a una tarea, sin resultados de evaluación publicados y con un número de descargas muy bajo (25), por lo que su valor es principalmente como referencia de pipeline y no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer compacto) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación; ventana de observación por paso, no contexto textual) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (modelo de robótica; no se documentan capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción compacto que combina un codificador visual, un codificador de lenguaje y un decodificador de acciones, entrenado para mapear observaciones multimodales (imágenes de cámaras y estado propioceptivo del robot) más una instrucción en lenguaje natural a una secuencia de acciones motoras. En esta ficha concreta, la política consume `observation.state` de forma `(20,)`, `observation.images.head_camera` de forma `(3, 480, 640)` y `observation.images.hand_left_camera` de forma `(3, 400, 640)`, y emite `action` de forma `(20,)`. El modelo base es `lerobot/smolvla_base`, ajustado mediante fine-tuning completo (el nombre del repo indica `fft`, full fine-tuning) con LeRobot 0.6.1.

El entrenamiento se realizó sobre el dataset `team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep`: 200 episodios, 48.141 fotogramas a 10 FPS, correspondientes a una única tarea de manipulación móvil en simulación. La configuración reportada es de 60.000 pasos, batch size 16, optimizador AdamW, learning rate 0,0001 y semilla 1000; el sufijo del nombre (`steps60k-decay60k`) sugiere un decaimiento del learning rate a lo largo de los mismos 60.000 pasos. No se documentan en la información disponible detalles sobre el corpus de preentrenamiento del modelo base, la composición del dataset más allá de la tarea, ni el uso de RLHF o DPO (en robótica de imitación lo habitual es aprendizaje supervisado por comportamiento clonado, que es lo que indica la librería LeRobot).

## Capacidades

- Control robótico de manipulación móvil: genera acciones de 20 dimensiones para un manipulador con dos cámaras.
- Ejecución de una tarea específica de pick-and-place: coger una lata de tomate y lanzarla a una papelera.
- Fusión multimodal de estado propioceptivo e imágenes de dos cámaras (cabeza y mano izquierda).
- Condicionamiento por instrucción en lenguaje natural (la tarea se pasa como texto en el comando de rollout).
- Aprendizaje por imitación: reproduce comportamientos observados en 200 episodios de demostración.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, razonamiento textual, código, matemáticas, visión general, audio ni modo "thinking"; es una política de acción, no un modelo conversacional.

## Casos de uso

- Investigación en políticas VLA compactas: sirve como referencia reproducible para estudiar cómo un SmolVLA ajustado con fine-tuning completo se comporta en una tarea de manipulación móvil concreta, comparando configuraciones de entrenamiento (pasos, decaimiento, batch).
- Prototipado de pipelines LeRobot: el comando `lerobot-rollout` documentado permite validar de extremo a extremo la instalación, calibración de cámaras y ejecución de una política entrenada sobre un robot `mobile_manipulator`.
- Benchmark interno de manipulación en simulación: al estar entrenado sobre datos simulados (`sim-pnp`), es útil para medir la brecha sim-a-real antes de invertir en datos reales.
- Automatización de tareas de recogida de residuos en entornos controlados: el modelo puede gestionar la secuencia de aproximación, agarre y lanzamiento a una papelera, siempre que el entorno se parezca al del dataset.
- Base para fine-tuning posterior: al ser apache-2.0 y derivar de `smolvla_base`, puede reutilizarse como punto de partida para nuevas tareas del mismo robot y misma configuración de cámaras.
- Docencia y divulgación de robótica con VLA: su tamaño (450 M parámetros) y licencia permisiva permiten desplegarlo en laboratorios con GPU de consumo para demostrar el ciclo completo de datos, entrenamiento y despliegue.
- Validación de hardware y calibración: útil para comprobar que las cámaras y el puerto del robot están correctamente configurados antes de entrenar políticas propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política ("No evaluation results have been provided for this policy yet"), por lo que no existe tasa de éxito medida ni comparación numérica con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M parámetros en safetensors (probablemente fp32 o bf16), la huella de pesos ronda 1,8 GB en fp32 o 0,9 GB en bf16, más el coste de los dos flujos de imagen de entrada.
- GPU recomendadas: no especificadas por el autor; por tamaño, una GPU de consumo moderna (RTX 3060/4060 o superior) debería ser suficiente para inferencia, aunque no se confirma en la documentación.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo y la orientación de SmolVLA a hardware de consumo, pero no se aporta una lista de GPUs validadas.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para entrenamiento), con soporte de `--policy.device=cuda`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El dataset está grabado a 10 FPS, lo que da una referencia de la frecuencia de control esperada, pero no se publica latencia de inferencia medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-smolvla_fft-steps60k-decay60k | 450.046.176 | Estado (20,), 2 camaras (480x640 y 400x640) | Tarea unica de manipulacion movil | apache-2.0 | Hugging Face, 25 descargas |
| lerobot/smolvla_base | no disponible en la informacion proporcionada | no disponible | Base VLA general para ajuste | no disponible en la informacion proporcionada | Hugging Face (modelo base citado) |
| Otras politicas LeRobot del mismo autor | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la informacion proporcionada, por lo que la comparación cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- Tarea única: la política está entrenada exclusivamente para "Throw the tomato can into the trash bin"; no generaliza a otras instrucciones ni objetos.
- Entrenada en simulación: el dataset es `sim-pnp`, por lo que el rendimiento en un robot real puede degradarse sustancialmente (brecha sim-a-real no medida).
- Sin evaluación publicada: no hay tasa de éxito, número de ensayos ni condiciones de dificultad documentadas; no se puede afirmar que funcione de forma fiable.
- Dependencia estricta de la configuración de hardware: requiere un robot `mobile_manipulator` con cámaras `head_camera` y `hand_left_camera` en las resoluciones exactas (480x640 y 400x640) y un vector de estado de 20 dimensiones; cualquier desviación invalida la entrada.
- Riesgo de sobreajuste a posiciones, iluminación y distractores del dataset de 200 episodios; no se documenta variabilidad de escenarios.
- Sin datos sobre sesgos, alucinación o comportamiento fuera de distribución; en robótica, los fallos se traducen en colisiones o agarres erróneos, con riesgo físico asociado.
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene revisar también las condiciones del modelo base `lerobot/smolvla_base` y del dataset.
- Idiomas y capacidades lingüísticas no documentados: la instrucción de tarea se pasa como texto, pero no se especifica el alcance multilingüe.
- Repositorio de 19,1 GB: el tamaño incluye checkpoints y artefactos de entrenamiento, lo que puede complicar el despliegue en entornos con almacenamiento limitado.
- Madurez baja: 25 descargas, 0 likes y creado en noviembre de 2026; no hay evidencia de uso en producción ni comunidad que lo valide.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-smolvla_fft-steps60k-decay60k
- Dataset de entrenamiento: https://huggingface.co/datasets/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
