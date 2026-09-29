# teyler/MineChoice-reward-survival-fresh-house-update165

## Resumen

MineChoice fresh-world completed-house checkpoint 165 es un checkpoint de aprendizaje por refuerzo publicado por el usuario teyler en HuggingFace. No es un modelo de lenguaje ni un modelo de vision: es una politica categorica implementada como un perceptron multicapa (MLP) de 31.789 parametros que mapea un vector de 73 caracteristicas de estado estructurado de Minecraft Java 1.20.4 a un espacio de 45 acciones discretas. El modelo lee estado del juego, no pixeles, y no dispone de mecanismo de respaldo basado en un profesor externo.

Su relevancia es puramente experimental y de investigacion. El autor documenta que en el episodio `20260928-132431-train-1881560440`, iniciado sobre la semilla natural `1881560440` con inventario vacio y sin privilegios de juego, el agente completo una casa de 52 partes en las coordenadas `{'x': -33, 'y': 65, 'z': 13}` y se detuvo vivo con 85 transiciones de recompensa reales y una recompensa total de 26.9760. Se trata de un hito de entrenamiento de un unico episodio, no de una tasa de exito medida.

El propio autor advierte de forma explicita que este checkpoint no ha ganado Minecraft y que no existe ninguna tasa de exito en partidas completas sobre conjuntos de validacion ni ninguna muerte de Ender Dragon verificada por servidor. Las habilidades codificadas del entorno son las que ejecutan las acciones seleccionadas: los pesos por si solos no constituyen un bot autonomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP categorico (perceptron multicapa) sobre estado estructurado; no se detalla el numero ni el tamano de las capas ocultas |
| Parametros totales | 31.789 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de 73 caracteristicas fijas; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica `safetensors` y `policy.json`; no se especifica el tipo de dato) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; su unica entrada es estado estructurado de Minecraft) |
| Licencia | MIT |
| Formato de pesos | `model.safetensors` y `policy.json` (el autor indica que contienen pesos identicos) |
| Entradas | 73 caracteristicas de estado estructurado del juego |
| Salidas | 45 acciones discretas |
| Pipeline declarado | reinforcement-learning |
| Autor | teyler |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion registrada | 2026-09-28 |
| Fecha de actualizacion registrada | 2026-09-28 |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card es un MLP categorico con 73 entradas y 45 salidas. No se especifica en la informacion disponible el numero de capas ocultas, sus dimensiones, las funciones de activacion ni el tipo de dato de los pesos, por lo que esos detalles quedan como no disponibles. El modelo no es un transformer, ni un MoE, ni un modelo de espacio de estados: es una politica tabular aproximada mediante una red densa de muy baja capacidad (31.789 parametros). La entrada es un vector de caracteristicas de estado estructurado, lo que implica que el modelo no procesa pixeles ni representaciones visuales del mundo.

El entrenamiento se realizo localmente sobre recompensas de supervivencia reales de Minecraft Java 1.20.4, con un total de 7.743 transiciones optimizadas acumuladas hasta el checkpoint 165 y 85 transiciones de recompensa reales dentro del episodio documentado. El autor no menciona el uso de RLHF, DPO ni aprendizaje supervisado a partir de un profesor; de hecho, afirma explicitamente que no hay respaldo de profesor, de modo que la politica seleccionada procede unicamente de los pesos aprendidos. El episodio de referencia comenzo en la semilla natural `1881560440` con inventario vacio y sin configuracion privilegiada de juego. El guardado del mundo confirma la casa construida y los registros de transicion de recompensa reflejan el incremento de casas completadas de cero a uno. El entrenamiento se llevo a cabo en una RTX 3090 local y la inferencia no requiere ninguna API alojada.

El repositorio incluye `config.json`, que define el orden de las caracteristicas de entrada y de las acciones, y `milestone_evidence.json`, que delimita el alcance de la afirmacion de rendimiento. Los ficheros de politica incluidos coinciden con la instantanea de origen del episodio, segun el autor.

## Capacidades

- Seleccion de acciones discretas en Minecraft: mapea 73 caracteristicas de estado estructurado a una de 45 acciones posibles.
- Politica de supervivencia entrenada con recompensas reales de Minecraft Java 1.20.4.
- Construccion de una casa de 52 partes demostrada en un unico episodio sobre la semilla `1881560440` y en las coordenadas `{'x': -33, 'y': 65, 'z': 13}`.
- Clasificacion categorica sobre estado estructurado: la salida es una distribucion sobre 45 acciones, no texto ni imagenes.
- Operacion sin profesor: no depende de un modelo docente ni de un fallback externo durante la seleccion de acciones.
- Integracion con habilidades codificadas: el entorno proporciona las rutinas de ejecucion que traducen la accion elegida en comportamiento de juego.
- Inferencia local sin API: el modelo puede ejecutarse en el mismo equipo de entrenamiento o en hardware inferior.
- Ausencia de capacidades de generacion de texto, razonamiento simbolico, codigo, matematicas, vision, audio, tool calling, function calling, agentes multi-paso o modo de razonamiento. No se documenta ninguna de ellas.

## Casos de uso

- Investigacion en aprendizaje por refuerzo sobre estado estructurado: sirve como punto de partida reproducible para estudiar como una politica de muy baja capacidad resuelve tareas parciales de Minecraft, usando `config.json` para reconstruir el espacio de observacion y accion.
- Auditoria de evidencia de entrenamiento: `milestone_evidence.json` y los registros de recompensa permiten replicar el analisis del unico episodio documentado y comprobar que el incremento de casas completadas es de cero a uno.
- Docencia en RL: el tamano del modelo (31.789 parametros) y su salida categorica lo hacen adecuado para ejemplos en asignaturas donde se quiera mostrar el ciclo completo de entrenamiento, evaluacion y guardado de checkpoints sin requerir infraestructura de GPU.
- Comparacion de checkpoints dentro de una misma serie de experimentos: el identificador `update165` sugiere una progresion de versiones; el checkpoint puede usarse como referencia intermedia para medir si el entrenamiento adicional mejora la construccion de casas.
- Estudio de la brecha entre habilidad codificada y politica aprendida: resulta util para investigar hasta que punto una politica densa pequena puede explotar habilidades preexistentes del entorno frente a aprender la tarea desde cero.
- Reentrenamiento continuado sobre nuevas semillas: el checkpoint puede servir como inicializacion para experimentos de generalizacion entre semillas, precisamente porque el autor no ha medido si vuelve a construir una casa en una semilla distinta.
- Pruebas de integracion de bajo coste: al no necesitar API alojada y requerir recursos minimos de computo, permite validar canalizaciones de inferencia en el bucle de un agente de Minecraft sin coste apreciable de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona MMLU, HumanEval, GSM8K ni ninguna otra metrica estandar, y advierte que no existe una tasa de exito en partidas completas sobre datos de validacion ni una muerte del Ender Dragon verificada por servidor asociada a este checkpoint. El unico dato de rendimiento documentado es de un unico episodio: una casa de 52 partes completada, 85 transiciones de recompensa reales y una recompensa total de 26.9760, con 7.743 transiciones optimizadas acumuladas hasta el checkpoint 165.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye referencias a otros agentes de Minecraft, a otros checkpoints de la misma serie ni a metricas comparables. Ademas, el modelo no es comparable en parametros, contexto ni licencia con modelos de lenguaje, ya que su espacio de entrada y salida es un vector de estado estructurado y un conjunto de 45 acciones discretas respectivamente.

## Requisitos de hardware

- VRAM estimada para inferencia: con 31.789 parametros, el peso en memoria es de aproximadamente 0,12 MB en precision de 32 bits y de aproximadamente 0,06 MB en precision de 16 bits. Cualquier GPU con al menos unas pocas decenas de megabytes libres es suficiente; en la practica la inferencia puede ejecutarse integramente en CPU.
- GPU recomendadas: no aplica ninguna GPU de gama alta. El autor entreno en una RTX 3090 local, pero esa GPU corresponde al proceso de entrenamiento, no a un requisito de inferencia.
- Compatibilidad con GPU de consumo: si, cabe con enorme margen en cualquier GPU de consumo, incluida cualquier RTX, GTX o GPU integrada, e incluso en CPU.
- Opciones de despliegue: no disponibles en el sentido habitual. Al no ser un modelo de lenguaje, no es compatible con vLLM, llama.cpp, Ollama ni TGI. El despliegue requiere codigo de inferencia propio que lea `config.json` para reconstruir el orden de las 73 caracteristicas de entrada y de las 45 acciones, y que cargue los pesos desde `model.safetensors` o `policy.json`.
- Latencia y throughput estimados: no se publican mediciones. Por el tamano del modelo (31.789 parametros) y la forma de la operacion (una unica propagacion sobre un vector de 73 entradas), el coste por decision es despreciable frente al coste de la simulacion de Minecraft, pero no hay cifras medidas en la informacion disponible.
- Requisitos de red: ninguno. La inferencia no necesita API alojada ni conexion externa.

## Limitaciones y advertencias

- No ha ganado Minecraft. El autor lo declara de forma explicita y no existe ninguna tasa de exito en partidas completas ni muerte del Ender Dragon verificada.
- Evidencia de un unico episodio: la construccion de la casa se documento en una sola partida sobre la semilla `1881560440`. No se ha medido la tasa de repeticion ni el comportamiento en otras semillas.
- Habilidades no demostradas: no se documento la fabricacion de un pico de hierro, la obtencion de diamantes, la entrada al Nether, la entrada al End ni la finalizacion del juego.
- No es un bot autonomo: los pesos seleccionan acciones, pero las habilidades codificadas del entorno son las que las ejecutan. Sin ese andamiaje, el checkpoint por si solo no juega.
- Sin vision: el modelo lee estado estructurado, no pixeles, por lo que no puede operar en configuraciones donde solo haya imagen disponible.
- Sin capacidades linguisticas ni multilingues: no procesa lenguaje natural y no se declaran idiomas soportados.
- Riesgo de comportamiento fuera de distribucion: al ser una politica categorica entrenada con 7.743 transiciones optimizadas, es esperable que seleccione acciones sin sentido en estados poco representados en el entrenamiento. En este tipo de modelo el riesgo equivalente a la alucinacion no es generar texto falso, sino emitir acciones invalidas o contraproducentes ante entradas desconocidas.
- Sesgo de entorno: el comportamiento esta condicionado por la version concreta del juego (Minecraft Java 1.20.4), por las recompensas de supervivencia definidas por el autor y por las habilidades codificadas disponibles.
- Falta de validacion externa: el repositorio registra 0 descargas y 0 likes, por lo que no existe corroboracion por parte de la comunidad.
- Licencia MIT: permite uso comercial y modificacion, pero se ofrece sin garantia alguna y sin soporte; cualquier uso en produccion recae enteramente sobre quien lo integra.
- Ausencia de trazabilidad completa: no se incluye el guardado del mundo, ni credenciales privadas, ni el registro bruto de la partida, por lo que la verificacion independiente del episodio queda limitada a los ficheros de evidencia incluidos.
- Caracter experimental: la propia etiqueta `experimental` del repositorio indica que no debe tratarse como un componente estable.

## Enlaces

- HuggingFace: https://huggingface.co/teyler/MineChoice-reward-survival-fresh-house-update165
- Ficheros incluidos en el repositorio, segun la model card: `model.safetensors`, `policy.json`, `config.json`, `milestone_evidence.json`
- No se han encontrado enlaces adicionales (papers, blogs, repositorios de codigo o demos) en la informacion disponible.
