# teyler/MineChoice-reward-survival-completed-house-update140

## Resumen

MineChoice-reward-survival-completed-house-update140 es un checkpoint de politica de aprendizaje por refuerzo publicado por el usuario teyler en HuggingFace. No es un modelo de lenguaje ni un modelo de vision: es un perceptron multicapa (MLP) categorico de 31.789 parametros que mapea un vector de 73 caracteristicas de estado estructurado de Minecraft a una de 45 acciones discretas. El autor lo entrenó sobre transiciones de recompensa reales de Minecraft Java 1.20.4, sin usar pixeles y sin fallback a un profesor externo.

El checkpoint corresponde a la actualizacion 140 de un entrenamiento que acumula 7.084 transiciones optimizadas; la actualizacion 140 concreta se entrenó con 54 transiciones reales de recompensa. En la episodio de mundo continuado `20260928-100156-train-persistent-002` el bot completo una casa de 52 partes en las coordenadas `{'x': 185, 'y': 118, 'z': -111}` y fabrico un pico de hierro de repuesto. El autor advierte explicitamente de que este checkpoint no ha superado Minecraft y de que no existe una tasa de exito en partida completa ni una muerte del Ender Dragon verificada por servidor.

Su relevancia es acotada y fundamentalmente experimental: se trata de un artefacto de investigacion en RL con estado estructurado, de tamano minimo, orientado a reproducir linaje de experimentos y a servir como pieza de una politica mayor. Los pesos por si solos no constituyen un bot autonomo; requieren habilidades de juego codificadas que ejecuten las acciones seleccionadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) categorico, no transformer; entrada de estado estructurado |
| Parametros totales | 31.789 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; no es un modelo de contexto. Entrada fija de 73 caracteristicas de estado |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible; no procesa lenguaje natural |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), mas `policy.json` con pesos identicos y `config.json` con el orden exacto de caracteristicas y acciones |
| Espacio de acciones | 45 acciones discretas |
| Pipeline declarado | reinforcement-learning |
| Tamano del repo | 0,0 GB |

## Arquitectura y entrenamiento

La arquitectura es un MLP categorico con 73 entradas y 45 salidas. La entrada es estado estructurado directo del entorno de Minecraft Java 1.20.4 (no pixeles), y la salida es una distribucion categorica sobre 45 acciones discretas. El repositorio incluye `config.json`, que fija el orden exacto de las caracteristicas y de las acciones, y `milestone_evidence.json`, que registra el linaje y el alcance del hito. Los ficheros de politica incluidos son la instantanea de origen del episodio. `model.safetensors` y `policy.json` contienen exactamente los mismos pesos neuronales.

El entrenamiento se realizó localmente sobre una RTX 3090, a partir de transiciones de recompensa reales. La semilla natural `384455844` arranco con inventario vacio y sin configuracion privilegiada en la ejecucion `20260928-061257-train-384455844`. En el episodio de mundo continuado `20260928-100156-train-persistent-002` la transicion de recompensa registrada muestra el contador de casas completadas pasando de 0 a 1, y el mismo episodio fabrico un pico de hierro de repuesto antes de detenerse en ese hito de herramienta. Esas 54 transiciones reales de recompensa entrenaron la actualizacion 140, sobre 7.084 transiciones optimizadas acumuladas. El autor precisa que no se trató de una partida limpia ininterrumpida ni de una tasa de finalizacion de casas medida. No se documenta el uso de RLHF, DPO ni decodificacion especulativa, ni el numero total de tokens o episodios del dataset de entrenamiento.

## Capacidades

- Clasificacion de accion: selecciona una de 45 acciones discretas a partir de un vector de 73 caracteristicas de estado estructurado.
- Construccion de estructuras: evidencia de finalizacion de una casa de 52 partes en un episodio de mundo continuado.
- Fabricacion de herramientas: el mismo episodio fabrico un pico de hierro de repuesto.
- Ejecucion sobre estado estructurado, sin vision: no consume pixeles en ninguna fase.
- Entrenamiento sin fallback a profesor: no se uso un modelo docente que sustituyera las decisiones de la politica.
- Inferencia local: se puede ejecutar sin servicio hospedado.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad autonoma; las habilidades de juego codificadas ejecutan las acciones seleccionadas, y el modelo no planifica por si mismo.
- Capacidades multilingues: no disponible (no procesa texto).
- Capacidades especiales: ninguna adicional. No hay modo de razonamiento, vision ni audio.

## Casos de uso

- Reproduccion de linaje de experimentos en RL: el repositorio incluye `milestone_evidence.json` con el linaje y el alcance del hito, lo que permite auditar de que ejecucion y de que episodio procede cada peso. Es adecuado cuando se necesita trazabilidad de un checkpoint concreto.
- Punto de partida para curriculos de construccion: el checkpoint ya ha completado una casa de 52 partes, por lo que puede usarse como inicializacion para entrenar tareas de construccion mas complejas en lugar de partir de pesos aleatorios.
- Investigacion sobre reward shaping en Minecraft: dado que el autor registra transiciones de recompensa concretas (por ejemplo, el contador de casas pasando de 0 a 1), el checkpoint sirve para estudiar como una funcion de recompensa concreta moldea la politica resultante.
- Baseline para comparativas de representacion: permite comparar una politica entrenada exclusivamente con estado estructurado (73 caracteristicas, sin pixeles) frente a enfoques basados en vision sobre el mismo entorno Java 1.20.4.
- Docencia y practicas de RL aplicado: con 31.789 parametros, el modelo es lo bastante pequeno para inspeccionar los pesos completos en un cuaderno y explicar el flujo estado-accion-recompensa sin infraestructura especializada.
- Componente de una politica mayor: integrado en un agente donde el codigo se encarga de las habilidades de bajo nivel (navegacion, minado, colocacion de bloques), el MLP actua como cabecera de decision sobre las 45 acciones y sustituye a una heuristica escrita a mano.
- Inferencia local de bajo coste en laboratorio: al poder ejecutarse sin servicio hospedado y con un coste computacional minimo, es util para iterar rapido en un banco de pruebas local antes de escalar a modelos mayores.
- Pruebas de regresion de entornos: al fijar `config.json` el orden exacto de caracteristicas y acciones, el checkpoint puede usarse para verificar que un entorno de evaluacion mantiene un contrato de observacion estable entre versiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El propio autor indica que este checkpoint no ha superado Minecraft, que no existe una tasa de exito en partida completa con conjunto de retencion ni una muerte del Ender Dragon verificada por servidor, y que la recuperacion de los diamantes perdidos, la entrada al Nether, la entrada al End y la finalizacion del juego siguen sin verificarse para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: minima. Con 31.789 parametros, los pesos ocupan del orden de 124 KB en punto flotante de 32 bits y unos 62 KB en 16 bits (calculo derivado del numero de parametros; el autor no publica estas cifras). El repositorio ocupa 0,0 GB.
- GPU recomendadas: el autor entrenó el modelo en una RTX 3090. Para inferencia no se requiere ninguna GPU concreta; tambien es viable en CPU.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo, e incluso en CPU, dado el tamano del modelo.
- Opciones de despliegue: carga directa de `model.safetensors` o `policy.json` con el framework de aprendizaje profundo que corresponda, leyendo `config.json` para el orden de caracteristicas y acciones. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y ninguno de ellos es aplicable a un MLP categorico de este tipo.
- Latencia y throughput: no disponible. Dado el tamano del modelo, el coste de inferencia sera despreciable frente al coste de interaccion con el entorno de Minecraft, pero se trata de una inferencia razonada y no de una medida publicada.
- Coste de integracion: el modelo no funciona de forma aislada. Hace falta un entorno de Minecraft Java 1.20.4 con las habilidades de juego codificadas que traduzcan las 45 acciones en comportamiento efectivo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos comparables de la misma categoria (politicas de RL sobre estado estructurado en Minecraft) con los que contrastar parametros, contexto, rendimiento, licencia o disponibilidad. Ademas, este checkpoint no es comparable funcionalmente con modelos de lenguaje o de vision, ya que su entrada son 73 caracteristicas estructuradas y su salida 45 acciones discretas.

## Limitaciones y advertencias

- No es un bot autonomo: los pesos por si solos no bastan. Se requieren habilidades de juego codificadas que ejecuten las acciones seleccionadas.
- Sin vision: la politica opera sobre estado estructurado directo, de modo que no puede generalizar a entradas visuales ni aprovechar informacion no incluida en las 73 caracteristicas.
- Sin resultados de partida completa: no existe tasa de exito en conjunto de retencion ni muerte del Ender Dragon verificada por servidor. Los hitos de recuperacion de diamantes, entrada al Nether, entrada al End y finalizacion del juego quedan sin verificar.
- Evidencia limitada a un unico episodio: la finalizacion de la casa se registra en un episodio de mundo continuado concreto, no como tasa medida, y el autor advierte de que no fue una partida limpia ininterrumpida.
- Capacidad muy reducida: 31.789 parametros imponen un techo bajo de complejidad en la politica; no cabe esperar comportamientos ricos fuera de la distribucion de entrenamiento.
- Riesgo de sobreajuste al linaje: al ser una instantanea de un episodio concreto, el comportamiento puede degradarse fuera de las condiciones de esa semilla y ese mundo.
- Sesgos conocidos: no disponible. El autor no documenta analisis de sesgos, y el dominio (Minecraft) hace que la nocion habitual de sesgo no sea directamente aplicable.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe el riesgo analogo de que la politica seleccione acciones sin sentido fuera de la distribucion de estados observada.
- Idiomas: no disponible. El modelo no procesa lenguaje natural.
- Licencia: MIT, permisiva, sin restricciones documentadas para uso comercial. Aun asi, conviene verificar que el uso de Minecraft Java 1.20.4 cumple con los terminos del juego.
- Ausencia de artefactos de reproduccion: no se incluye guardado del mundo, credenciales ni registro de juego en bruto, por lo que no es posible reproducir el episodio exacto a partir del repositorio.
- Madurez: el autor etiqueta el modelo como experimental y el repositorio registra 0 descargas y 0 likes, sin validacion externa conocida.
- Uso en produccion: no recomendado como componente critico sin evaluacion propia previa, dado el caracter experimental y la falta de metricas publicadas.

## Enlaces

- HuggingFace: https://huggingface.co/teyler/MineChoice-reward-survival-completed-house-update140
- Ficheros incluidos en el repositorio: `model.safetensors`, `policy.json`, `config.json`, `milestone_evidence.json`
- Resultados de busqueda web: las busquedas realizadas no devolvieron enlaces relevantes sobre este modelo. Los resultados obtenidos (Google, perfil de itch.io de TylerChoice, character.ai, Grok y Microsoft Rewards) no guardan relacion con el checkpoint y no se incluyen.
