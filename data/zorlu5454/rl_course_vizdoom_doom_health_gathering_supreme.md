# Zorlu5454/rl_course_vizdoom_doom_health_gathering_supreme

## Resumen

Este repositorio contiene una politica de aprendizaje por refuerzo entrenada con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom. Lo publica el usuario Zorlu5454 en Hugging Face como parte de un curso de reinforcement learning, y se ha generado con Sample-Factory 2.0, la libreria de referencia para entrenamiento asincrono y distribuido de agentes. No es un modelo de lenguaje: no genera texto ni responde a instrucciones, sino que produce acciones a partir de observaciones visuales del juego.

El problema que resuelve es un escenario clasico de control en primera persona: el agente debe moverse por el mapa, recoger botiquines para mantener su salud y sobrevivir el maximo tiempo posible. El resultado declarado por el autor es una recompensa media de 10,34 +/- 1,45 en ese entorno, marcado como no verificado en la model card. El repositorio pesa aproximadamente 0,1 GB e incluye los artefactos de entrenamiento en el formato propio de Sample-Factory.

Su relevancia es fundamentalmente docente y de investigacion: sirve como punto de partida reproducible para continuar entrenamiento, como referencia para comparar variantes de APPO y como ejemplo de integracion entre Sample-Factory y el Hugging Face Hub. No se dispone de informacion sobre licencia, idiomas ni numero de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | APPO (Asynchronous Proximal Policy Optimization) sobre red de politica actor-critica; codificador visual para observaciones de ViZDoom (detalle exacto no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (el agente consume fotogramas del entorno, no una ventana de tokens) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones del checkpoint) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | no disponible con detalle; checkpoint nativo de Sample-Factory (carga mediante `sample_factory.huggingface.load_from_hub`) |
| Libreria | sample-factory 2.0 |
| Entorno | doom_health_gathering_supreme (ViZDoom) |
| Tamano del repositorio | ~0,1 GB |
| Tarea declarada | reinforcement-learning |

## Arquitectura y entrenamiento

La model card identifica el algoritmo como APPO (`--algo=APPO`), la implementacion de Sample-Factory que combina ideas de IMPALA y PPO: recoleccion asincrona de experiencia por multiples workers, correccion por desfase de politica mediante V-trace y optimizacion con objetivo recortado tipo PPO. En Sample-Factory los agentes visuales se construyen con un codificador convolucional que procesa observaciones apiladas y una cabeza de politica y valor; el detalle concreto de capas, canales y tamano de la red para este experimento no esta documentado en la informacion disponible.

No se especifica el numero de pasos de entorno, la composicion de datos (aqui la "experiencia" se genera por interaccion con el simulador, no por un corpus), ni si se aplicaron tecnicas adicionales como normalizacion de recompensas o curriculum. La model card si documenta los comandos para continuar el entrenamiento (`--restart_behavior=resume`) y para subir el modelo al Hub con `--push_to_hub`, lo que lo convierte en un checkpoint reanudable. El unico resultado declarado es la recompensa media en el entorno de entrenamiento.

## Capacidades

- Control de un agente en un entorno 3D en primera persona (ViZDoom) a partir de observaciones visuales.
- Toma de decisiones de navegacion y recoleccion de objetos: localizar y recoger botiquines para mantener la salud.
- Politica reactiva entrenada especificamente para el escenario `health_gathering_supreme`; no se documenta transferencia a otros mapas o tareas.
- Soporte de entrenamiento continuado desde el checkpoint publicado (resume) y de reentrenamiento con otros hiperparametros.
- Integracion con el ecosistema Sample-Factory y con el flujo de descarga/subida de Hugging Face Hub.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, vision general, tool calling, capacidades de agente multi-paso en lenguaje natural ni soporte multilingue.
- No se documenta modo de razonamiento explicito (thinking mode), audio ni entrada de lenguaje.

## Casos de uso

- Material docente en cursos de RL: el paquete incluye el identificador del entorno y los comandos de descarga y evaluacion, de modo que un alumno puede reproducir el agente y compararlo con sus propias variantes de APPO en pocos minutos.
- Baseline de referencia en investigacion sobre APPO: sirve como punto de comparacion controlado para medir el efecto de cambios en hiperparametros (learning rate, numero de workers, penalizacion de recompensa) sobre el mismo entorno.
- Punto de partida para entrenamiento continuado: la model card documenta `--restart_behavior=resume`, lo que permite extender el entrenamiento desde el checkpoint en lugar de partir de cero, util cuando se dispone de presupuesto limitado de simulacion.
- Generacion de trayectorias para imitation learning u offline RL: ejecutando el agente con el script `enjoy` se pueden recolectar secuencias observacion-accion etiquetadas por la politica para entrenar un modelo supervisado o un algoritmo offline.
- Pruebas de reproducibilidad de infraestructura: sirve para validar que una instalacion de Sample-Factory, ViZDoom y los drivers de GPU funcionan correctamente antes de lanzar experimentos largos y costosos.
- Estudio de comportamientos de supervivencia y gestion de recursos: el escenario de recogida de botiquines es un banco de pruebas sencillo para analizar politicas de exploracion y evasion de dano en entornos parcialmente observables.
- Ejemplo de publicacion de artefactos de RL en el Hub: el repositorio ilustra el flujo `load_from_hub` / `push_to_hub` y puede usarse como plantilla para compartir otros experimentos.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (metrica marcada como no verificada, `verified: false`):

| Modelo | Algoritmo | Entorno | Metrica | Valor | Verificado |
|---|---|---|---|---|---|
| rl_course_vizdoom_doom_health_gathering_supreme | APPO | doom_health_gathering_supreme | mean_reward | 10,34 +/- 1,45 | No |

No se han publicado en la informacion disponible resultados comparativos con otros modelos o algoritmos en el mismo entorno, ni metricas adicionales (longitud de episodio, tasa de exito, tiempo de supervivencia).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa unos 0,1 GB, pero ese dato incluye los artefactos de entrenamiento y no permite derivar el consumo de memoria de la red.
- GPU recomendadas: no disponible. Sample-Factory recomienda una GPU con soporte CUDA para entrenamiento, pero no se especifica un modelo concreto para este experimento.
- Viabilidad en GPU de consumo: no disponible con datos. El entorno ViZDoom y el tamano del repositorio sugieren un coste bajo en comparacion con modelos generativos, pero no hay cifras publicadas que lo confirmen.
- Opciones de despliegue: las previstas por la libreria, mediante el script `enjoy` de Sample-Factory (`python -m <path.to.enjoy.module> --algo=APPO --env=doom_health_gathering_supreme ...`). No aplica el despliegue con vLLM, TGI, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. Dependen del renderizado de ViZDoom, del numero de entornos paralelos y del hardware, y no se documentan.
- CPU: no disponible; la ejecucion requiere el binario de ViZDoom y, para el modo `enjoy`, puede funcionar sin aceleracion dedicada, aunque no hay confirmacion en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. No se han encontrado en la informacion proporcionada datos verificables de otros checkpoints APPO, PPO o IMPALA sobre `doom_health_gathering_supreme` con los que establecer una comparacion de parametros, contexto, rendimiento o licencia. La model card tampoco incluye referencias a modelos de referencia ni a resultados de la literatura para este escenario.

## Limitaciones y advertencias

- Licencia no disponible: al no declararse una licencia, no puede asumirse permiso de uso comercial ni de redistribucion. Es necesario contactar con el autor antes de cualquier uso en produccion.
- Resultado no verificado: el autor marca la metrica `mean_reward` como `verified: false`. No se indica el numero de episodios, la semilla ni el intervalo de confianza metodo, por lo que la cifra 10,34 +/- 1,45 debe tratarse como orientativa.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso independiente ni de validacion por terceros.
- Especificidad total al entorno: la politica esta entrenada para `doom_health_gathering_supreme`. No hay datos de generalizacion a otros mapas, configuraciones de ViZDoom o tareas diferentes, y es esperable un rendimiento muy degradado fuera de ese escenario.
- No es un modelo de lenguaje: no admite instrucciones, no genera texto, no soporta tool calling ni agentes conversacionales. Cualquier expectativa de ese tipo es inaplicable.
- Sesgos del entorno: el comportamiento aprendido depende de la dinamica, las recompensas y los sesgos de diseno de ViZDoom y del escenario, no de un corpus de texto; puede explotar atajos de la funcion de recompensa.
- Sin informacion sobre datos de entrenamiento: se desconoce el numero de pasos de entorno, la semilla, la configuracion de hiperparametros y si hubo ajustes manuales, lo que limita la reproducibilidad exacta.
- Metadatos anomalos: la fecha de creacion registrada es 2026-09-26, posterior a la fecha habitual de publicacion, un dato a verificar antes de citar el repositorio.
- Ausencia de documentacion de seguridad y uso responsable: no hay seccion de usos previstos, usos prohibidos ni evaluaciones de riesgo en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zorlu5454/rl_course_vizdoom_doom_health_gathering_supreme
- Repositorio de Sample-Factory: https://github.com/alex-petrenko/sample-factory
- Documentacion de Sample-Factory: https://www.samplefactory.dev/
- Documentacion de integracion con Hugging Face Hub: https://www.samplefactory.dev/10-huggingface/huggingface/
- Nota: los resultados de la busqueda web realizada no contienen enlaces relevantes para este modelo (devuelven sitios de contenido para adultos sin relacion alguna con aprendizaje por refuerzo), por lo que no se incluyen. No se dispone de paper, blog tecnico, demo ni repositorio adicional asociado a este checkpoint.
