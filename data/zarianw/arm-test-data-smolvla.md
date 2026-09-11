# zarianw/arm-test-data-smolvla

## Resumen

zarianw/arm-test-data-smolvla es una política robótica de tipo visión-lenguaje-acción (VLA) publicada por el usuario zarianw en Hugging Face. No se trata de un modelo de lenguaje generalista, sino de un ajuste fino (fine-tuning) del modelo base lerobot/smolvla_base, entrenado con LeRobot 0.6.2 sobre un conjunto de datos propio de 50 episodios y 25.892 fotogramas grabados a 30 FPS para una única tarea: coger un cubo azul y dejarlo en una taza verde.

El modelo sigue la arquitectura SmolVLA descrita en el artículo arXiv:2506.01844, un enfoque compacto y eficiente que consume observaciones visuales y un vector de estado del robot para producir directamente comandos de acción de 6 dimensiones. Con 450.046.176 parámetros (unos 0,45 mil millones) y un repositorio de 0,9 GB en safetensors, está diseñado para desplegarse en hardware de consumo, lo que lo sitúa en la categoría de políticas de imitación ligeras frente a alternativas VLA de varios miles de millones de parámetros.

Su relevancia es fundamentalmente práctica y acotada: sirve como ejemplo reproducible de un flujo completo de LeRobot (grabación de datos, entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`) sobre un brazo SO follower. Con cero descargas y cero "likes" en el momento de la consulta, y sin resultados de evaluación publicados, debe considerarse un modelo experimental de un solo autor, no una política lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje-acción (VLA) SmolVLA; transformer que combina codificador visual, instrucción en lenguaje y estado del robot para predecir acciones |
| Parametros totales | 450.046.176 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la información proporcionada; el repositorio contiene pesos en safetensors con un tamaño de 0,9 GB, coherente con precisión de 16 bits |
| Idiomas soportados | No disponible; la instrucción de tarea registrada está en inglés ("Grab the blue cube and place in green cup") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

Otros datos de identificación: tipo de pipeline `robotics`, modelo base `lerobot/smolvla_base`, tipo de robot `so_follower`, cámaras declaradas `front` y `wrist`, repositorio creado el 2026-09-11 y actualizado el mismo día.

## Arquitectura y entrenamiento

La política es un ajuste fino del modelo preentrenado `lerobot/smolvla_base`, que implementa el método SmolVLA presentado en el artículo arXiv:2506.01844. SmolVLA se describe como un modelo visión-lenguaje-acción compacto y eficiente, capaz de alcanzar rendimiento competitivo con un coste computacional reducido y de ejecutarse en hardware de consumo. En la práctica, la política consume observaciones multimodales y emite directamente un vector de acción, sin etapas intermedias de planificación explícita.

Las entradas declaradas en la model card son `observation.state` con forma `(6,)`, tres cámaras visuales de `(3, 256, 256)` y una cámara adicional `observation.images.empty_camera_0` de `(3, 480, 640)`; la salida es `action` con forma `(6,)`. El entrenamiento se realizó sobre el dataset `zarianw/arm-test-data_20260906_154504` (50 episodios, 25.892 fotogramas, 30 FPS, tarea única "Grab the blue cube and place in green cup") durante 20.000 pasos, con tamaño de lote 64, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000, usando LeRobot 0.6.2. No se documenta en la información disponible si hubo fases de RLHF, DPO u otro ajuste por preferencias, ni innovaciones técnicas adicionales más allá de las propias del método SmolVLA. Tampoco se especifica la composición exacta del dataset más allá del número de episodios y fotogramas.

## Capacidades

- Control robótico por imitación: genera comandos de acción de 6 grados de libertad a partir de observaciones visuales y de estado, a la frecuencia del bucle de control (datos grabados a 30 FPS).
- Fusión visión-lenguaje-acción: condiciona el comportamiento en una instrucción textual de tarea, en este caso "Grab the blue cube and place in green cup".
- Percepción multicámara: procesa simultáneamente tres vistas de 256×256 píxeles más una vista de 480×640, lo que permite cubrir perspectiva frontal y de muñeca.
- Ejecución cerrada en bucle sobre hardware real: integrable con el comando `lerobot-rollout` para operar un robot `so_follower` durante un tiempo determinado.
- Capacidad de reentrenamiento: al ser un ajuste fino de `lerobot/smolvla_base`, sirve como plantilla para entrenar políticas propias con `lerobot-train`.
- No se documentan capacidades de generación de texto general, razonamiento abstracto, código, matemáticas, tool calling, function calling, uso de agentes, audio ni modo "thinking". Se trata de una política robótica especializada, no de un asistente conversacional.
- Capacidades multilingües: no disponibles; la única instrucción documentada está en inglés.

## Casos de uso

- Manipulación pick-and-place en laboratorio: reproducción de la tarea entrenada (coger un cubo azul y colocarlo en una taza verde) sobre un brazo SO follower, útil como banco de pruebas para validar la cadena completa de LeRobot antes de escalar a tareas más complejas.
- Prototipado de políticas de imitación: punto de partida para investigadores que quieran comparar su propio ajuste fino contra una política SmolVLA ya entrenada sobre 50 episodios y 25.892 fotogramas.
- Validación de pipelines de datos robóticos: el dataset asociado permite comprobar la calidad de la grabación, el sincronizado de cámaras y el formateo de observaciones a 30 FPS.
- Docencia y formación en robótica: ejemplo reproducible de flujo "grabar datos, entrenar, desplegar" con comandos documentados (`lerobot-train`, `lerobot-rollout`), adecuado para cursos prácticos de aprendizaje por imitación.
- Pruebas de integración hardware-software: sirve para verificar la calibración del robot, la asignación de puertos y los índices de cámara antes de invertir en datasets mayores.
- Investigación sobre eficiencia computacional: al tener 450 millones de parámetros, permite estudiar el equilibrio entre latencia de inferencia y tasa de éxito en hardware de consumo, en línea con la motivación del artículo SmolVLA.
- Base para ajuste fino con pocos datos: demuestra que con 50 episodios es posible obtener una política funcional en tareas acotadas, aunque sin métricas de éxito publicadas que lo confirmen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye una sección de evaluación explícitamente vacía, con la nota "No evaluation results have been provided for this policy yet". No hay tasas de éxito en robot real, ni comparaciones con otras políticas, ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan aproximadamente 0,9 GB en precisión de 16 bits y en torno a 1,8 GB en fp32. Sumando activaciones del codificador visual y de las cuatro vistas de cámara, una estimación conservadora de inferencia se sitúa en el rango de 2 a 4 GB de VRAM, aunque no hay cifras oficiales publicadas.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM debería ser suficiente. Se puede ejecutar en RTX 3060, RTX 4060, RTX 4070, RTX 4090, así como en GPUs de centro de datos (A100, H100) sin aprovechar su capacidad completa.
- ¿Cabe en GPU de consumo? Sí, es uno de los objetivos declarados del modelo: SmolVLA se presenta como desplegable en hardware de consumo. También es plausible la ejecución en CPU para pruebas lentas, aunque no está documentado.
- Opciones de despliegue: la vía documentada es LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento), con soporte de `--policy.device=cuda`. No se documenta compatibilidad con vLLM, TGI, llama.cpp u Ollama, que además están orientados a generación de texto y no a políticas VLA.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS, lo que sugiere que el bucle de control objetivo trabaja en ese orden de frecuencia, pero no se publica ninguna medición de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zarianw/arm-test-data-smolvla | 450 M | No disponible | Sin resultados de evaluación publicados | apache-2.0 | Hugging Face (librería lerobot) |
| lerobot/smolvla_base | No disponible en la información proporcionada | No disponible | Resultados del artículo SmolVLA (no verificados aquí) | No disponible en la información proporcionada | Hugging Face, modelo base de este ajuste |
| OpenVLA | ~7 B (orden de magnitud, no verificado) | No disponible | No disponible | No disponible | Proyecto open source de robótica |
| Políticas VLA propietarias tipo pi0 | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificados suficientes para establecer una comparación cuantitativa fiable. La comparación relevante y directamente documentada es contra `lerobot/smolvla_base`, del que este modelo es un ajuste fino sobre una tarea concreta. Para el resto de alternativas, los valores no están confirmados en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea ("Grab the blue cube and place in green cup") sobre un único tipo de robot (`so_follower`). Fuera de ese escenario, su comportamiento no está caracterizado.
- Dataset muy reducido: 50 episodios y 25.892 fotogramas son insuficientes para garantizar robustez frente a cambios de iluminación, posición de objetos, distractores o variaciones del entorno.
- Ausencia total de evaluación: no hay tasa de éxito, ni número de ensayos, ni condiciones de prueba. No se puede afirmar que el modelo funcione de forma fiable en robot real.
- Posible artefacto en los datos de entrada: la observación `observation.images.empty_camera_0` (480×640) sugiere una cámara sin contenido útil o mal configurada durante la grabación, lo que puede afectar al rendimiento del codificador visual.
- Riesgo de sobreajuste y de deriva de política: en aprendizaje por imitación con pocos datos, los errores pequeños se acumulan y la política puede divergir fuera de la distribución de estados vista en entrenamiento. Es esperable un alto riesgo de fallo ante perturbaciones.
- Idiomas: no hay información sobre capacidades multilingües; la instrucción de tarea documentada está en inglés, por lo que el condicionamiento lingüístico en otros idiomas no está soportado ni verificado.
- Licencia: apache-2.0, que permite uso comercial y modificación, siempre que se conserve el aviso de copyright y la atribución correspondiente. Se recomienda revisar también las condiciones del modelo base `lerobot/smolvla_base` y del dataset asociado, ya que son dependencias de la cadena de derivación.
- Madurez: cero descargas, cero "likes" y publicación con actualización el mismo día de la creación. No hay evidencia de uso por terceros ni de mantenimiento posterior.
- Producción: no se recomienda desplegar esta política en un sistema real sin una evaluación propia con un número suficiente de ensayos por tarea y con medidas de seguridad física sobre el robot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zarianw/arm-test-data-smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/zarianw/arm-test-data_20260906_154504
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=zarianw/arm-test-data_20260906_154504
- Artículo de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces listados proceden de la model card y de los metadatos del repositorio. La cita bibliográfica de la model card aparece truncada en la información disponible, por lo que no se reproduce completa.
