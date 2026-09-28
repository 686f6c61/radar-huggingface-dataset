# teyler/MineChoice-reward-survival-first-diamond-update130

## Resumen

El modelo teyler/MineChoice-reward-survival-first-diamond-update130 es un checkpoint experimental de aprendizaje por refuerzo para Minecraft Java 1.20.4, publicado por el usuario teyler. No es un modelo de lenguaje: es un MLP categórico de 31.789 parámetros que recibe 73 entradas de estado estructurado (sin píxeles) y emite una de 45 acciones discretas. Su función no es generar texto, sino seleccionar acciones dentro de un conjunto de habilidades de juego codificadas aparte, que son las que realmente las ejecutan en el entorno.

El checkpoint documenta un hito concreto: la extracción del primer diamante con la semilla 384455844, partiendo de inventario vacío y sin configuración privilegiada. El autor advierte explícitamente de que el modelo no ha completado Minecraft y de que no existe una tasa de éxito en partidas completas ni una muerte del Ender Dragon verificada en servidor. El hito se logró en un episodio de mundo continuado, no en un intento ininterrumpido desde un mundo nuevo, y el episodio se interrumpió justo después de alcanzarlo.

Su relevancia actual es la de artefacto de reproducibilidad e investigación en RL con recompensa dispersa: es un checkpoint inmutable, publica el orden exacto de entradas y acciones en config.json y registra el linaje del hito en milestone_evidence.json. Acumula 6.712 transiciones optimizadas y se entrenó localmente en una RTX 3090.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP categorico (perceptron multicapa) con 73 entradas de estado estructurado y 45 salidas de accion; no es transformer, MoE, SSM ni modelo de lenguaje |
| Parametros totales | 31.789 (segun safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no hay secuencia de tokens; la entrada es un vector de estado de 73 dimensiones) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; el autor no declara la precision) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors); incluye policy.json con pesos identicos y config.json con el orden exacto de entradas y acciones |
| Tarea (pipeline) | reinforcement-learning (clasificacion categorica sobre 45 acciones) |
| Tamano del repositorio | 0.0 GB |
| Hardware de entrenamiento | RTX 3090 (entrenamiento local) |
| Fecha de creacion / actualizacion | 28 de septiembre de 2026 (segun metadatos) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un perceptron multicapa categorico de 73 entradas y 45 salidas. La entrada es estado estructurado directo, sin procesamiento de pixeles, y la salida es una distribucion categorica sobre 45 acciones; el orden exacto de entradas y acciones queda fijado en config.json. Los pesos no constituyen un bot autonomo: las habilidades de juego codificadas aparte interpretan la accion seleccionada y la ejecutan en el entorno. El checkpoint se distribuye de forma inmutable y no hay fallback de profesor (teacher fallback) en el bucle de decision.

El entrenamiento se realizo sobre transiciones de recompensa reales de Minecraft Java 1.20.4 ejecutadas localmente. La semilla 384455844 arranco con inventario vacio y sin configuracion privilegiada en el run 20260928-061257-train-384455844; el primer diamante se extrajo en el episodio posterior 20260928-083631-train-persistent-001, cuya transicion de recompensa registra el paso de 0 a 1 diamantes. No fue un intento de finalizacion ininterrumpido desde un mundo nuevo: el episodio se interrumpio tras el hito y sus 13 transiciones de recompensa reales se incorporaron al update 130, que acumula 6.712 transiciones optimizadas. El autor no publica tasa de repeticion medida ni el dataset de juego crudo, y no se incluye world save, credencial ni log de gameplay.

## Capacidades

- Seleccion de accion categorica sobre 45 acciones discretas a partir de un vector de 73 variables de estado estructurado.
- Politica entrenada con aprendizaje por refuerzo sobre transiciones de recompensa reales de Minecraft Java 1.20.4.
- Hito demostrado en el episodio documentado: extraccion del primer diamante (transicion de recompensa de 0 a 1 diamantes).
- Trazabilidad de linaje: milestone_evidence.json registra el alcance del hito y config.json fija el esquema de entradas y acciones.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta razonamiento multi-paso ni comportamiento de agente por si mismo; esa logica reside en el codigo de habilidades externo que ejecuta las acciones.
- Sin capacidades multilingues: no procesa ni genera lenguaje natural.
- Sin vision: no consume pixeles ni imagenes.
- Sin modo de razonamiento explicito (thinking), audio ni otras modalidades.

## Casos de uso

- Reproduccion de experimentos de RL: el checkpoint permite repetir el escenario documentado (semilla 384455844, inventario vacio, sin setup privilegiado) y comparar el resultado con el hito del primer diamante registrado en milestone_evidence.json.
- Baseline para politicas con estado estructurado: con 73 entradas y 31.789 parametros sirve como referencia de bajo coste frente a enfoques que consumen pixeles, en experimentos controlados sobre Minecraft Java 1.20.4.
- Estudio de recompensa dispersa: las 13 transiciones reales del hito y las 6.712 transiciones optimizadas acumuladas permiten analizar como se incorporan hitos escasos a un update concreto.
- Material didactico sobre espacios de accion: config.json publica el orden exacto de las 45 acciones y de las 73 entradas, lo que facilita explicar como se define y se congela un espacio de accion categorico en un entorno abierto.
- Modulo de decision dentro de un bot mayor: el modelo solo elige la accion; se puede integrar como componente de seleccion en un pipeline donde el codigo de habilidades se encarga de la ejecucion y del control de bajo nivel.
- Auditoria de versionado de checkpoints: al ser un checkpoint inmutable con linaje documentado, es util para probar flujos de trazabilidad y comparacion entre updates (en este caso, el 130).
- Experimentacion en hardware minimo: al ocupar alrededor de 127 KB en fp32, se puede cargar y ejecutar en CPU o en dispositivos embebidos para pruebas de integracion sin GPU.
- Pruebas de verificacion de hitos: sirve como caso de estudio de que un hito intermedio (primer diamante) no implica capacidades posteriores, ya que fabricar pico de diamante, entrar en el Nether, entrar en el End y completar el juego siguen sin verificar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que no existe tasa de exito en partidas completas ni muerte del Ender Dragon verificada en servidor para este checkpoint, y que no se ha medido la tasa de repeticion del hito.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable, menos de 1 MB. Como calculo a partir de los 31.789 parametros, los pesos ocuparian aproximadamente 127 KB en fp32 y unos 64 KB en fp16; el autor no declara la precision real.
- GPU recomendadas: cualquiera. El autor entreno el modelo localmente en una RTX 3090, pero el tamano del modelo no exige GPU.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo, y tambien en CPU o en dispositivos embebidos.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; estos servidores estan orientados a modelos de lenguaje y no aplican. La integracion se realiza cargando model.safetensors o policy.json desde el codigo de entrenamiento e inferencia del propio proyecto.
- Latencia y throughput: no disponible. No se publican cifras de latencia ni de rendimiento por segundo.
- Almacenamiento: el repositorio ocupa 0.0 GB.
- Dependencia de entorno: los pesos por si solos no operan; requieren las habilidades de juego codificadas que ejecutan las acciones seleccionadas.

## Comparativa con modelos similares

No se dispone de datos verificables para una comparativa. La informacion proporcionada no incluye cifras de benchmarks ni especificaciones de otras politicas de RL para Minecraft, por lo que no es posible contrastar parametros, contexto, rendimiento, licencia y disponibilidad frente a alternativas de la misma categoria.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MineChoice-reward-survival-first-diamond-update130 | 31.789 | no aplica | no disponible | MIT | HuggingFace (0 descargas) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo no ha completado Minecraft. No existe tasa de exito en partidas completas ni muerte del Ender Dragon verificada en servidor para este checkpoint.
- El primer diamante se logro en un episodio de mundo continuado (20260928-083631-train-persistent-001), no en un intento de finalizacion ininterrumpido desde un mundo nuevo.
- El episodio se interrumpio despues del hito, por lo que no hay evidencia de continuidad mas alla de ese punto.
- No se ha medido la tasa de repeticion del hito: se desconoce si la politica reproduce el comportamiento de forma consistente.
- Quedan sin verificar la fabricacion del pico de diamante, la entrada al Nether, la entrada al End y la finalizacion del juego.
- Los pesos no son un bot autonomo: dependen de habilidades de juego codificadas externamente que ejecutan las acciones seleccionadas.
- Solo consume estado estructurado; no procesa pixeles, por lo que no es util para pipelines basados en vision.
- Con 31.789 parametros y entrenamiento sobre transiciones de un unico entorno y una unica semilla, el riesgo de sobreajuste al mundo y a la semilla concretos es alto.
- No se incluye world save, credencial ni log de gameplay crudo, lo que dificulta la reproduccion externa exacta del episodio.
- Modelo marcado como experimental, con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion.
- La licencia MIT permite uso comercial y modificacion con atribucion, pero el uso de Minecraft Java 1.20.4 queda sujeto a los terminos de uso propios del juego y de Mojang.
- No hay capacidades de lenguaje: la ficha no debe interpretarse como la de un modelo conversacional ni multilingue.

## Enlaces

- HuggingFace: https://huggingface.co/teyler/MineChoice-reward-survival-first-diamond-update130
- Paper, repositorio de codigo, blog o demo: no disponible en la informacion proporcionada.
