# vis22/stack_smolvla

## Resumen

SmolVLA (vis22/stack_smolvla) es un modelo de vision-lenguaje-acción (VLA) compacto, con 450.046.176 parámetros, especializado en una única tarea de manipulación robótica: apilar platos sobre un plato azul y volver a la posición de reposo. Lo publica el usuario vis22 sobre la librería LeRobot de HuggingFace y se obtiene por ajuste fino del modelo base lerobot/smolvla_base, que a su vez implementa el método descrito en el artículo arXiv:2506.01844. No es un modelo de lenguaje general: es una política de imitación que consume dos cámaras y el estado del robot, y emite directamente comandos de acción.

El problema que resuelve es acotado y práctico: convertir un conjunto pequeño de demostraciones teleoperadas (30 episodios, 13.480 fotogramas a 30 FPS) en una política que pueda ejecutarse sobre un robot real de tipo piper_follower con dos cámaras (cam_global y cam_gripper). Su relevancia está en el enfoque: SmolVLA apunta a rendimiento competitivo con coste computacional reducido y despliegue en hardware de consumo, algo poco habitual en el espacio VLA, donde dominan modelos de 3.000 a 7.000 millones de parámetros.

Es un repositorio recién creado (15 de septiembre de 2026), con 0 descargas y 0 «likes», y sin resultados de evaluación publicados por el autor. Debe tratarse, por tanto, como un artefacto de investigación reproducible y no como un componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-acción (VLA) SmolVLA: backbone de visión-lenguaje preentrenado más un experto de acciones entrenado con flow matching, según el artículo arXiv:2506.01844 |
| Parametros totales | 450.046.176 (aproximadamente 450 M) |
| Parametros activos | No aplica, no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se publican variantes cuantizadas; el repositorio ocupa 0,9 GB para 450 M de parámetros, coherente con pesos en 16 bits (bf16/fp16) |
| Idiomas soportados | No disponible; la política se condiciona mediante una instrucción en lenguaje natural y la tarea de entrenamiento está redactada en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |
| Tipo de modelo / pipeline | robotics (política de imitación, no generativa de texto) |
| Modelo base | lerobot/smolvla_base |
| Robot objetivo | piper_follower |
| Cámaras | cam_global, cam_gripper |
| Entradas | observation.state (7,), observation.images.cam_global (3, 480, 640), observation.images.cam_gripper (3, 480, 640) |
| Salidas | action (7,) |
| Dataset de entrenamiento | vis22/plates_stack_merged (30 episodios, 13.480 fotogramas, 30 FPS) |
| Tarea | «Stack all the plates on top of the blue plate, then return to home position» |
| Versión de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

La arquitectura corresponde al método SmolVLA descrito en el artículo referenciado (arXiv:2506.01844): un modelo de visión-lenguaje compacto que actúa como columna vertebral y un experto de acciones separado que genera las trayectorias mediante flow matching, con inferencia asíncrona entre ambos componentes para desacoplar la frecuencia del modelo de lenguaje de la frecuencia de control del robot. El autor de esta ficha no aporta detalles adicionales sobre la topología interna; la información procede del artículo y de las etiquetas del repositorio, no de una descripción propia del autor del modelo.

El ajuste fino se realizó sobre lerobot/smolvla_base con el dataset vis22/plates_stack_merged, compuesto por 30 episodios teleoperados y 13.480 fotogramas capturados a 30 FPS, todos ellos de la misma tarea de apilado. La configuración de entrenamiento publicada es de 100.000 pasos, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 5,5e-05 y semilla 1000, ejecutada con LeRobot 0.6.1. No se documenta ninguna fase de RLHF, DPO, aprendizaje por refuerzo ni aumento de datos.

## Capacidades

- Control robótico de manipulación: genera vectores de acción de 7 dimensiones a partir del estado del robot (7 dimensiones) y de dos vistas de cámara de 480 × 640 a 30 FPS.
- Condicionamiento por lenguaje natural: la política acepta una instrucción textual de tarea, aunque en este ajuste está especializada en una única frase de apilado de platos.
- Percepción multimodal de bajo coste: combina una cámara global y una cámara de pinza, lo que permite razonar sobre la posición de los objetos y sobre la proximidad del efector final.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas, no planificación simbólica ni razonamiento explícito.
- Ejecución en bucle cerrado: al integrarse con LeRobot, opera en tiempo real sobre el robot físico con estrategia de rollout básica.
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes, multi-step reasoning ni modos de razonamiento explícito.
- Sin capacidades de visión generales: el encoder visual se usa para el control motor, no para descripción de imágenes, OCR o VQA.
- Sin capacidades de audio, vídeo o generación de texto libre.
- Multilingüismo: no disponible; no hay evidencia de instrucciones en otros idiomas distintos del inglés.

## Casos de uso

- Reproducción de experimentos de apilado: ejecutar la tarea «Stack all the plates on top of the blue plate, then return to home position» sobre un piper_follower con dos cámaras para verificar la reproducibilidad de la política entrenada.
- Punto de partida para nuevos ajustes finos: al ser un modelo derivado de lerobot/smolvla_base con pesos Apache 2.0, sirve como inicialización de bajo coste para otras tareas de manipulación con pocos episodios (el propio autor usó solo 30).
- Investigación en VLA eficientes: analizar el compromiso entre tamaño (450 M) y capacidad de control en entornos académicos con GPU limitada, comparándolo con alternativas de miles de millones de parámetros.
- Evaluación de robustez de políticas de imitación: medir la degradación al variar posiciones iniciales de los platos, iluminación o colocación de las cámaras, ya que el dataset es muy homogéneo.
- Docencia y laboratorios de robótica: montar un flujo completo de extremo a extremo (grabación con LeRobot, entrenamiento, rollout) con 0,9 GB de pesos y sin necesidad de clúster.
- Automatización de una celda de laboratorio: si la tarea de apilado es representativa del proceso real, la política puede ejecutarse de forma continua durante una ventana acotada mediante el comando lerobot-rollout con duración limitada.
- Generación de datos comparativos para la familia SmolVLA: usar esta política como referencia concreta de fine-tuning sobre lerobot/smolvla_base en estudios de escalado de datos.
- Integración en pipelines de CI de robótica: verificar que los cambios en la versión de LeRobot o en la configuración de cámaras no rompen la inferencia antes de desplegar en el robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor incluye explícitamente la sección de evaluación vacía, con la indicación de que todavía no se han aportado resultados de robot real (número de intentos, éxitos y tasa de éxito). Tampoco se aportan métricas del entrenamiento (pérdida final, curvas) ni cifras de latencia o throughput. Las cifras que pueda reportar el artículo arXiv:2506.01844 corresponden al modelo base SmolVLA, no a este ajuste fino concreto, y no se reproducen aquí.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB solo para los pesos en 16 bits; con activaciones y dos imágenes de 480 × 640 más el estado, la estimación razonable es de 2 a 4 GB. Es una estimación derivada del tamaño del repositorio, no un dato publicado.
- GPUs recomendadas: cualquier GPU con 4 GB o más de VRAM. Una RTX 3060, RTX 4060, RTX 4090 o superior es suficiente; no se requieren A100 ni H100 para este tamaño de modelo.
- GPU de consumo: sí, cabe con holgura en todas las GPU de consumo recientes. El objetivo declarado del método SmolVLA es precisamente el despliegue en hardware de consumo.
- CPU: la inferencia en CPU es técnicamente posible por el tamaño, pero difícilmente sostendrá el bucle de control a 30 FPS; no hay datos publicados al respecto.
- Opciones de despliegue: LeRobot mediante el comando lerobot-rollout con --policy.path=vis22/stack_smolvla. No se documentan integraciones con vLLM, TGI, llama.cpp u Ollama, que además no aplican a una política de robótica con salidas continuas.
- Latencia y throughput: no publicados. Como referencia de requisito, el dataset se grabó a 30 FPS, lo que implica un presupuesto de 33 ms por ciclo si la inferencia se ejecuta de forma síncrona; el diseño de SmolVLA contempla inferencia asíncrona para relajar esa restricción.
- Almacenamiento: 0,9 GB para los pesos, más el espacio necesario para el dataset de entrenamiento si se va a reentrenar.

## Comparativa con modelos similares

No se dispone de resultados verificados de benchmarks en la información proporcionada, por lo que la comparación se limita a características estructurales conocidas públicamente. Los datos de los modelos alternativos no proceden de este repositorio y deben verificarse en sus fuentes originales.

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vis22/stack_smolvla | 450 M | 2 imagenes 480x640 + estado de 7 dim. (longitud de contexto no disponible) | Politica de apilado para piper_follower | apache-2.0 | Pesos en HuggingFace, libreria lerobot |
| lerobot/smolvla_base | 450 M (mismo backbone) | Multimodal, vision y lenguaje | Modelo base VLA de proposito general para ajuste fino | apache-2.0 | Pesos en HuggingFace |
| OpenVLA | Aproximadamente 7 B | Vision y lenguaje, entrada de imagen unica | Manipulacion generalista | No verificada en la informacion disponible | Pesos abiertos en HuggingFace |
| pi0 (Physical Intelligence) | Aproximadamente 3 B | Vision, lenguaje y flujo de acciones | Manipulacion generalista | No verificada en la informacion disponible | Pesos abiertos, ecosistema openpi |
| Octo | Aproximadamente 93 M | Vision y lenguaje, segun configuracion | Manipulacion generalista | No verificada en la informacion disponible | Pesos abiertos en HuggingFace |

La ventaja estructural de este modelo frente a OpenVLA o pi0 es el tamaño: 450 M frente a miles de millones de parámetros, lo que reduce drásticamente los requisitos de inferencia. Su desventaja es la especialización extrema: solo cubre una tarea, mientras que las alternativas citadas se presentan como políticas generalistas ajustables.

## Limitaciones y advertencias

- Especialización total en una tarea: la política está entrenada únicamente para apilar platos sobre un plato azul y volver a la posición inicial. Fuera de esa tarea no cabe esperar comportamiento útil.
- Dataset muy reducido y homogéneo: 30 episodios y 13.480 fotogramas, sin variaciones documentadas de iluminación, posición de objetos ni distracciones. La generalización fuera de las condiciones de grabación es la principal incógnita.
- Ausencia de evaluación: el autor no ha publicado ninguna tasa de éxito en robot real. No hay evidencia cuantitativa de que la tarea se complete de forma fiable.
- Acoplamiento al hardware: la política asume un robot piper_follower, dos cámaras concretas (cam_global y cam_gripper) y unos nombres de clave de observación determinados. Cambiar la configuración invalida el modelo.
- Riesgo de alucinación: no aplica en el sentido textual, ya que no genera lenguaje; en su lugar existe el riesgo de acciones erráticas o fuera de distribución ante entradas visuales no vistas durante el entrenamiento.
- Sesgos: no evaluados. Cualquier sesgo presente en las demostraciones del operador humano se reproduce en la política.
- Idiomas: no disponible. No hay evidencia de que acepte instrucciones en castellano ni en idiomas distintos del inglés, y en cualquier caso el condicionamiento lingüístico es irrelevante al estar fijada la tarea.
- Contexto: no se documenta la ventana de contexto del backbone de visión-lenguaje, lo que limita el análisis de su comportamiento con instrucciones largas o múltiples imágenes adicionales.
- Licencia: apache-2.0, permisiva para uso comercial. Debe comprobarse, en cualquier caso, si el modelo base lerobot/smolvla_base impone condiciones adicionales sobre el modelo derivado.
- Adopción nula: 0 descargas y 0 «likes» en el momento de redactar esta ficha. No existen informes de terceros que validen su funcionamiento.
- Repositorio con fecha de creación de 2026-09-15 y última actualización del mismo día, lo que sugiere que no ha recibido mantenimiento posterior.
- La búsqueda web realizada no ha devuelto documentación adicional relevante sobre este repositorio concreto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vis22/stack_smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/vis22/plates_stack_merged
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=vis22/plates_stack_merged
- Artículo SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo; las consultas devolvieron únicamente páginas del test de velocidad de Ookla (speedtest.net), sin relación con el modelo.
