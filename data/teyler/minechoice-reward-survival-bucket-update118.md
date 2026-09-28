# teyler/MineChoice-reward-survival-bucket-update118

## Resumen

MineChoice-reward-survival-bucket-update118 es un checkpoint experimental de aprendizaje por refuerzo publicado por el usuario teyler en HuggingFace. No es un modelo de lenguaje: se trata de un perceptron multicapa (MLP) denso y categorico de 31.789 parametros que recibe un vector de 73 caracteristicas de estado estructurado del juego Minecraft Java 1.20.4 y emite una de 45 acciones discretas. El modelo no procesa pixeles ni texto, y su entrenamiento se hizo sobre transiciones de recompensa reales, sin profesor ni datos sinteticos de respaldo.

El checkpoint corresponde a la actualizacion 118 de un entrenamiento local acumulado de 6.175 transiciones optimizadas, de las cuales 35 se incorporaron tras el hito del cubo (bucket). La model card es inusualmente explicita sobre el alcance: el modelo no ha completado Minecraft, no existe una tasa de exito en partidas retenidas ni una muerte del Ender Dragon verificada por servidor. Tambien aclara que los pesos por si solos no constituyen un bot autonomo, ya que las habilidades codificadas del juego son las que ejecutan las acciones seleccionadas.

Su relevancia es, por tanto, la de un artefacto de investigacion reproducible dentro del nicho del RL aplicado a Minecraft con estado estructurado, no la de un componente desplegable en produccion. Su valor principal esta en el linaje documentado (evidencia de hitos, esquema de politica y configuracion exacta de entradas y acciones) y en servir como punto de partida o baseline para experimentos posteriores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) denso y categorico; no es transformer, MoE ni SSM |
| Parametros totales | 31.789 (recuento real de safetensors) |
| Parametros activos | No aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | No aplica: la entrada es un vector fijo de 73 caracteristicas de estado, sin secuencia ni ventana de contexto |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica: el modelo no procesa lenguaje natural |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors) y JSON (policy.json, con pesos identicos a los anteriores) |
| Entradas | 73 caracteristicas de estado estructurado (orden definido en config.json) |
| Salidas | 45 acciones categoricas discretas |
| Dominio | Minecraft Java 1.20.4 |
| Pipeline declarado | reinforcement-learning |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La arquitectura es un MLP categorico de tipo politica (policy network) con 73 entradas y 45 salidas discretas. La entrada es estado estructurado directo del juego, sin vision por computadora ni representaciones aprendidas de pixeles. El modelo se entreno como politica de clasificacion sobre transiciones de recompensa reales, con actualizacion iterativa de pesos (checkpoint 118, 6.175 transiciones optimizadas acumuladas). No se menciona el uso de RLHF ni DPO, terminos que ademas no aplican a este tipo de artefacto.

El detalle de entrenamiento documentado es el siguiente: la semilla 384455844 comenzo con inventario vacio y sin configuracion privilegiada en la ejecucion `20260928-061257-train-384455844`; el hito del cubo se consiguio en un episodio posterior de mundo continuado, `20260928-072932-train-persistent-001`, con la transicion de recompensa bucket 0 a 1 y lingotes de hierro 3 a 0. La model card especifica que no fue un intento de finalizacion ininterrumpido desde un mundo nuevo: el episodio se interrumpio para reparar codigo tras el hito y sus 35 transiciones reales se incorporaron a la actualizacion 118. El entrenamiento se ejecuto en local sobre una RTX 3090. No se declara la composicion completa del dataset, el numero total de tokens (concepto no aplicable) ni la tasa de repeticion medida.

## Capacidades

- Clasificacion de estado estructurado: dado un vector de 73 caracteristicas del estado del juego, selecciona una accion de entre 45 posibles.
- Politica de control en Minecraft Java 1.20.4: el modelo esta especializado en el dominio del juego y solo en el.
- Entrada sin pixeles: consume estado estructurado directo, lo que reduce coste computacional y evita depender de vision.
- Integracion con habilidades codificadas: la model card indica que son las habilidades programadas del juego las que ejecutan las acciones elegidas por el modelo.
- Generacion de texto: no soportada.
- Razonamiento, matematicas y codigo: no soportados.
- Vision, audio y cualquier capacidad multimodal: no soportadas.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportados de forma nativa.
- Capacidades multilingues: no aplica.
- Modo "thinking": no disponible.

## Casos de uso

- Continuacion de un pipeline de RL: reincorporar el checkpoint como estado inicial de un entrenamiento posterior en un entorno local de Minecraft 1.20.4, aprovechando la semilla y el linaje documentados para mantener la reproducibilidad.
- Baseline en estudios comparativos: usar la politica de 31.789 parametros como referencia inferior frente a arquitecturas mayores (transformers, modelos basados en mundo) para medir la ganancia de complejidad en tareas de recoleccion y crafteo.
- Destilacion e imitacion de politica: generar pares estado-accion etiquetados por el propio modelo para entrenar politicas mas pequenas o para analizar la distribucion de acciones frente a estados concretos.
- Verificacion de esquemas de estado: emplear config.json y policy.json para validar que un entorno de simulacion produce el orden y la escala correctos de las 73 entradas antes de conectar un agente.
- Investigacion sobre recompensas escasas y reward shaping: estudiar como la politica evoluciona ante hitos escasos (por ejemplo, obtener un cubo) en un historial de 6.175 transiciones.
- Auditoria y trazabilidad de experimentos: revisar milestone_evidence.json para reproducir la cadena de episodios y comprobar que criterios de verificacion se aplicaron y cuales quedaron pendientes.
- Componente de seleccion de acciones en un bot codificado: integrar el MLP como modulo que decide entre acciones predefinidas dentro de un agente mayor que gestiona percepcion, planificacion y ejecucion.
- Docencia de RL aplicado: ejemplo minimo y completamente inspeccionable de politica entrenada sobre estado estructurado, util para explicar el ciclo estado-accion-recompensa sin la complejidad de un LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica estandar, y esos benchmarks no son aplicables a un MLP de politica de 31.789 parametros. Lo que si se documenta es el estado de verificacion de hitos, que se reproduce a continuacion tal como aparece en la fuente:

| Hito | Estado declarado |
|---|---|
| Cubo (bucket) | Conseguido en el episodio `20260928-072932-train-persistent-001`; transicion reward de bucket 0 a 1 y lingotes de hierro de 3 a 0 |
| Finalizacion completa del juego | No verificado; no existe tasa de exito en partidas retenidas |
| Muerte del Ender Dragon verificada por servidor | No existe |
| Obtencion de diamantes | No verificada |
| Entrada al Nether | No verificada |
| Entrada al End | No verificada |
| Tasa de repeticion medida | No disponible |

## Requisitos de hardware

- VRAM de inferencia: inferior a 1 GB por el tamano del modelo (31.789 parametros); el repositorio ocupa 0.0 GB.
- GPU empleada en entrenamiento: RTX 3090, en local, segun la model card.
- GPU recomendadas: cualquiera con capacidad suficiente para alojar un MLP de este tamano; el modelo cabe en CPU y en cualquier GPU de consumo.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo e incluso en CPU. El cuello de botella real del sistema no es el modelo, sino la ejecucion del entorno de Minecraft y las habilidades codificadas que traducen las acciones en interacciones con el juego.
- Opciones de despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. Se requiere un harness propio (por ejemplo, PyTorch o NumPy) que reconstruya el vector de 73 entradas en el orden definido por config.json. El archivo policy.json permite cargar los pesos sin depender del formato safetensors.
- Latencia y throughput: no disponible. No se publican medidas, aunque por el numero de parametros el coste de inferencia del MLP es despreciable frente al coste del entorno.

## Comparativa con modelos similares

No existe una comparativa numerica publicada para este checkpoint. Pertenece al nicho de artefactos de RL aplicados a Minecraft, donde las referencias mas conocidas son entornos y proyectos de investigacion como MineRL, VPT (Video PreTraining) o DreamerV3, pero la informacion proporcionada no incluye datos de rendimiento de ninguno de ellos ni permite establecer equivalencias fiables. Se ofrece por tanto una comparacion cualitativa con los datos disponibles:

| Modelo | Parametros | Entrada | Rendimiento medido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MineChoice-reward-survival-bucket-update118 | 31.789 | Estado estructurado (73 caracteristicas) | No disponible | MIT | Publico en HuggingFace; 0 descargas y 0 likes |
| VPT (OpenAI) | No disponible en la informacion proporcionada | Pixeles de video | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |
| DreamerV3 | No disponible en la informacion proporcionada | Pixeles | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |
| MineRL (entorno y baselines) | No disponible en la informacion proporcionada | Estado estructurado y pixeles | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- No es un bot autonomo: la propia model card indica que los pesos por si solos no bastan y que son las habilidades codificadas del juego las que ejecutan las acciones.
- Sin verificacion de finalizacion: no existe tasa de exito en partidas retenidas ni muerte del Ender Dragon verificada por servidor.
- Hitos pendientes: la obtencion de diamantes, la entrada al Nether, la entrada al End y la finalizacion del juego permanecen sin verificar en este checkpoint.
- Episodio interrumpido: el hito del cubo no proviene de un intento ininterrumpido desde un mundo nuevo, ya que el episodio se corto para reparar codigo.
- Sin tasa de repeticion medida: no se documenta la repetibilidad del comportamiento.
- Volumen de entrenamiento reducido: 6.175 transiciones optimizadas en total y 35 incorporadas en esta actualizacion, lo que hace plausible el sobreajuste al episodio concreto.
- Dominio cerrado: solo Minecraft Java 1.20.4 con estado estructurado; no generaliza a otros juegos, a vision por computadora ni a tareas de lenguaje.
- Sin capacidades de lenguaje, razonamiento, codigo ni matemeticas: no debe evaluarse con benchmarks de LLM ni emplearse como sustituto de estos.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero si existe el riesgo equivalente de seleccionar acciones sin sentido o degeneradas ante estados fuera de la distribucion de entrenamiento.
- Sesgos conocidos: no disponibles; no se ha realizado ninguna evaluacion de sesgo ni de robustez.
- Licencia: MIT, que permite uso comercial del artefacto. No obstante, cualquier despliegue sobre el juego real debe respetar el EULA de Minecraft de Mojang, que impone restricciones adicionales al uso comercial del juego y de sus servicios.
- Artefacto sin validacion externa: 0 descargas y 0 likes en el momento de la ficha, por lo que no hay evidencia de uso o verificacion por terceros.
- Contenido no incluido: el repositorio no contiene mundo guardado, credenciales ni registro de partida en bruto, lo que limita la reproduccion completa del entorno.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/teyler/MineChoice-reward-survival-bucket-update118
- Pesos en formato safetensors: https://huggingface.co/teyler/MineChoice-reward-survival-bucket-update118/blob/main/model.safetensors
- Pesos en JSON con los mismos valores: https://huggingface.co/teyler/MineChoice-reward-survival-bucket-update118/blob/main/policy.json
- Configuracion de entradas y acciones: https://huggingface.co/teyler/MineChoice-reward-survival-bucket-update118/blob/main/config.json
- Evidencia de linaje y alcance de hitos: https://huggingface.co/teyler/MineChoice-reward-survival-bucket-update118/blob/main/milestone_evidence.json
- Papers, blogs, repositorios o demos adicionales: no disponible en la informacion proporcionada.
