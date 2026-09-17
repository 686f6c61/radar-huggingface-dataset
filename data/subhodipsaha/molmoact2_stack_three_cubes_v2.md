# subhodipsaha/molmoact2_stack_three_cubes_v2

## Resumen

El modelo `subhodipsaha/molmoact2_stack_three_cubes_v2` es una política robótica de imitación publicada por el usuario subhodipsaha en Hugging Face, entrenada y subida con la librería LeRobot de Hugging Face. Su nombre indica que está especializada en una tarea concreta de manipulación: apilar tres cubos ("stack three cubes") con un brazo robótico de la familia SO-101, y está asociada al dataset `subhodipsaha/so101_stack_three_cubes_08_19`.

El artefacto contiene aproximadamente 5.442.196.272 parámetros almacenados en formato safetensors, con un tamaño de repositorio declarado de 10,9 GB, lo que es coherente con pesos en precisión de 16 bits. El identificador del modelo remite a la familia MolmoAct2, aunque la model card no documenta la arquitectura concreta, el número de tokens de entrenamiento ni la composición del dataset utilizado.

Se trata de un modelo de nicho: no tiene descargas ni likes en el momento de la consulta, su model card es una plantilla genérica de LeRobot sin detalles técnicos y no se han publicado resultados de benchmarks. Su relevancia es práctica para quien necesite replicar o comparar políticas de imitación sobre el brazo SO-101, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no especificada en la model card) |
| Parametros totales | 5.442.196.272 (aproximadamente 5,44 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (política de control robótico; no aplica el concepto habitual) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline declarado | robotics |
| Tarea | apilar tres cubos (manipulación) |
| Robot objetivo | SO-101 (segun el nombre del dataset y los comandos de la model card) |
| Dataset de entrenamiento | subhodipsaha/so101_stack_three_cubes_08_19 |
| Tamano del repositorio | 10,9 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. El único dato estructural disponible es el nombre (`molmoact2`), que apunta a la familia MolmoAct2, y la etiqueta `lerobot`, que indica que el entrenamiento se realizó con el flujo de trabajo de imitación de LeRobot. El comando de ejemplo incluido en la model card emplea `--policy.type=act` como plantilla genérica de la documentación de LeRobot; no se especifica si esa es la configuración realmente utilizada en este entrenamiento o si se trata de texto de plantilla sin adaptar. Por tanto, la arquitectura concreta (transformer de política, modelo visión-lenguaje-acción u otra) debe considerarse no confirmada.

Tampoco hay información sobre volumen de tokens, número de episodios de demostración, composición del dataset, ni sobre si se aplicaron técnicas de ajuste como RLHF, DPO o decodificación especulativa. El dataset asociado, `subhodipsaha/so101_stack_three_cubes_08_19`, sugiere una recolección de demostraciones teleoperadas para la tarea de apilar tres cubos, presumiblemente con un brazo SO-101, pero no se dispone de sus estadísticas (número de episodios, frecuencia de control, modalidades de observación).

## Capacidades

- Control robótico de manipulación: ejecución de una política de imitación para la tarea específica de apilar tres cubos.
- Aprendizaje por imitación a partir de demostraciones recogidas con el flujo de LeRobot.
- Integración con el ecosistema LeRobot, tanto para entrenamiento (`lerobot-train`) como para evaluación e inferencia (`lerobot-record`).
- Compatibilidad declarada con el brazo SO-101 en el bucle de evaluación (`--robot.type=so100_follower` en el ejemplo de la model card).
- Generación de texto: no disponible; no se documenta como capacidad del modelo.
- Razonamiento, código, matemáticas o visión general: no disponible; no se documentan.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, audio, etc.): no disponibles.

## Casos de uso

- Replicación de la tarea de apilado: cargar la política con `--policy.path` en `lerobot-record` y ejecutar episodios de evaluación sobre un brazo SO-101 real para verificar si reproduce el comportamiento de apilado de tres cubos.
- Punto de partida para ajuste fino: usar los pesos como inicialización para entrenar variantes de la misma tarea (distintas posiciones iniciales, colores u objetos) reduciendo el número de demostraciones necesarias frente a entrenar desde cero.
- Comparativa de políticas en la misma tarea: servir como referencia base frente a otras políticas entrenadas sobre el mismo dataset `so101_stack_three_cubes_08_19`.
- Recogida de datos asistida: emplear la política para generar trayectorias iniciales que un operador corrige por teleoperación, acelerando la creación de nuevos datasets de imitación.
- Validación de pipelines de LeRobot: comprobar de extremo a extremo el flujo `lerobot-train` / `lerobot-record` con un checkpoint real de 5,44 mil millones de parámetros, incluyendo gestión de checkpoints y despliegue.
- Docencia y divulgación en robótica: ejemplo concreto de política de imitación de gran tamaño para explicar el ciclo demostración-entrenamiento-evaluación en robótica de manipulación.
- Pruebas de simulación a realidad (sim-to-real): evaluar la transferencia de una política entrenada con datos reales a un simulador del mismo brazo, o viceversa, para medir la brecha de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La búsqueda web realizada no devolvió ningún resultado relacionado con el modelo, su familia o su tarea; los resultados obtenidos no guardaban relación con el ámbito de la robótica ni con el aprendizaje por imitación.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del número de parámetros (5,44 mil millones): aproximadamente 10,9 GB en FP16/BF16, unos 21,8 GB en FP32 y alrededor de 5,5 GB en int8 y 2,7 GB en int4. Estas cifras son estimaciones aritméticas derivadas del recuento de parámetros, no medidas publicadas.
- El tamaño del repositorio (10,9 GB) es coherente con pesos en 16 bits, por lo que la carga en FP16 requiere un mínimo de 12 GB de VRAM, más memoria adicional para activaciones y buffers de inferencia.
- GPU recomendadas en función de la estimación anterior: NVIDIA A100 (40/80 GB), H100, L40S o RTX A6000 para entrenamiento y evaluación sin restricciones.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) en FP16; en tarjetas de 16 GB como la RTX 4080 el margen es muy ajustado y puede requerir cuantización o carga por capas; en 8-12 GB solo sería viable con cuantización agresiva, no documentada por el autor.
- Opciones de despliegue: LeRobot mediante `lerobot-record` con `--policy.path`, y PyTorch como backend. No se documentan integraciones con vLLM, TGI, Ollama o llama.cpp, ni formatos GGUF; estos entornos están orientados a modelos generativos de texto y no encajan directamente con una política de acción continua.
- Latencia y throughput estimados: no disponibles. En robótica, la latencia relevante es el tiempo por paso de control, que depende del hardware del robot y no se documenta.

## Comparativa con modelos similares

La búsqueda web no devolvió información verificable sobre modelos comparables, y la model card no incluye ninguna comparación. La siguiente tabla recoge únicamente los datos confirmados de este modelo; el resto de campos se marcan como no disponibles.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| molmoact2_stack_three_cubes_v2 | 5,44 B | no disponible | apilar tres cubos (SO-101) | Apache-2.0 | Hugging Face (0 descargas) |
| Otras politicas de LeRobot (p. ej. ACT, SmolVLA, pi0) | no disponible | no disponible | manipulacion diversa | no disponible | no disponible |
| MolmoAct / familia MolmoAct2 | no disponible | no disponible | razonamiento de acciones y control | no disponible | no disponible |

No se dispone de datos verificados de parámetros, contexto, rendimiento ni licencia para las alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea (apilar tres cubos) sobre un brazo SO-101 concreto; fuera de ese entorno y esa tarea no cabe esperar un comportamiento fiable.
- Model card incompleta: se trata de una plantilla de LeRobot sin completar ("Model type not recognized"), sin descripción de arquitectura, datos de entrenamiento, hiperparámetros ni resultados.
- Sin métricas publicadas: no existe ninguna tasa de éxito, número de episodios de evaluación ni comparación con líneas base, por lo que no es posible estimar su rendimiento real.
- Riesgo de sobreajuste al entorno de recogida: variaciones en iluminación, posición de cámara, fondo o propiedades de los cubos pueden degradar el comportamiento; no hay datos sobre aumento de datos o robustez.
- Alucinación: el concepto no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones fuera de distribución cuando el estado observado se aleja de las demostraciones de entrenamiento.
- Sesgos: no se documentan sesgos demográficos ni lingüísticos; el modelo no procesa lenguaje natural en la información disponible.
- Idiomas y contexto: no disponibles; al ser una política de control no se declara ventana de contexto ni cobertura idiomática.
- Licencia Apache-2.0: permite uso comercial y modificación, pero al derivar presumiblemente de una familia MolmoAct conviene verificar la licencia y los términos de los pesos originales antes de un despliegue en producto.
- Trazabilidad limitada: con 0 descargas y 0 likes, el artefacto no cuenta con validación por parte de la comunidad, y las fechas de creación y actualización registradas (2026-09-17) resultan anómalas.
- Sin garantías para producción: no hay información sobre latencia, estabilidad entre episodios ni protocolos de parada segura, elementos imprescindibles antes de operar un brazo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/subhodipsaha/molmoact2_stack_three_cubes_v2
- Dataset asociado: https://huggingface.co/datasets/subhodipsaha/so101_stack_three_cubes_08_19
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas de imitación: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Paper, blog o demo adicionales: no disponibles (la búsqueda web no devolvió resultados relacionados)
