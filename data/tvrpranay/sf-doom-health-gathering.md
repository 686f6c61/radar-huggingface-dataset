# tvrpranay/sf-doom-health-gathering

## Resumen

`sf-doom-health-gathering` es un agente de aprendizaje por refuerzo (reinforcement learning) entrenado con el algoritmo PPO sobre el entorno ViZDoom `doom_health_gathering_supreme`. Lo publica el usuario de HuggingFace `tvrpranay`, sin licencia declarada, sin idiomas declarados y con cero descargas y cero likes en el momento de redactar esta ficha. No se trata de un modelo de lenguaje: es una politica neuronal que controla un agente dentro de un videojuego y se distribuye a traves de la libreria Sample Factory.

El modelo resuelve una tarea concreta de control visual en 3D: en el escenario "health gathering" el agente aparece en una arena con monstruos y debe recoger botellas de salud (health packs) que reaparecen periodicamente para sobrevivir; la recompensa es esencialmente el tiempo de supervivencia acumulado. La variante "supreme" amplia la dificultad respecto a la version basica del escenario. Se trata, por tanto, de un caso de estudio clasico de navegacion y recoleccion bajo presion, muy usado en cursos de deep RL.

Su relevancia es fundamentalmente docente y de investigacion: los tags `deep-rl-course` y `sample-factory` indican que es el artefacto tipico de un ejercicio de curso, util como referencia reproducible y como punto de partida para experimentos de reward shaping, curricula o comparacion de frameworks, no como componente de produccion. El unico resultado declarado es una recompensa media de 18,50 en el entorno, marcada como no verificada por el propio autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card; el tag `sample-factory` indica que se uso este framework (actor-critic tipo IMPALA con encoder convolucional y, habitualmente, capa recurrente LSTM). No confirmado |
| Parametros totales | No disponible |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (agente de RL basado en observaciones visuales por fotograma, no en contexto de texto) |
| Tipos de cuantizacion | No disponible (no se declaran versiones cuantizadas; es un checkpoint de politica) |
| Idiomas soportados | No disponible / no aplicable |
| Licencia | No disponible |
| Formato de pesos | No especificado en la model card; Sample Factory almacena las politicas como checkpoints de PyTorch (no confirmado) |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna ni el proceso de entrenamiento mas alla de indicar que se trata de un modelo PPO entrenado con Sample Factory para el entorno `doom_health_gathering_supreme`. No se declaran hiperparametros, numero de pasos de entorno, tamano de red, semillas ni configuracion del cluster de entrenamiento. Como referencia general del framework (no como dato confirmado del modelo), Sample Factory implementa un esquema actor-critic con decodificacion asincrona y paralelizacion masiva de workers, del estilo de IMPALA, y sus politicas para entradas visuales suelen combinar un encoder convolucional residual con una capa recurrente LSTM para manejar la parcial observabilidad del entorno.

La tarea se formula como un problema de RL con recompensa escasa y basada en supervivencia: el agente debe aprender una politica de navegacion y recoleccion en un mapa 3D con observaciones visuales en primera persona. No se documenta en la informacion disponible el uso de tecnicas adicionales como reward shaping, aprendizaje por imitacion, DPO/RLHF (no aplicables en este contexto) ni decodificacion especulativa. Tampoco se indica el numero total de fotogramas consumidos durante el entrenamiento ni la composicion del conjunto de datos, ya que en RL la "data" es la experiencia generada por la propia interaccion con el simulador.

## Capacidades

- Control de un agente en el entorno ViZDoom `doom_health_gathering_supreme`: navegacion en primera persona en 3D y recoleccion de objetos (health packs).
- Politica de supervivencia bajo presion: mantiene al agente con vida el mayor tiempo posible recolectando salud de forma repetida.
- Toma de decisiones secuenciales a partir de observaciones visuales (pixel input), segun el pipeline declarado `reinforcement-learning`.
- Integracion con el ecosistema Sample Factory para cargar, evaluar y continuar el entrenamiento del checkpoint.
- No se declaran capacidades de generacion de texto, razonamiento simbolico, codigo, matematicas, vision general, tool calling, function calling, agentes multi-paso ni capacidades multilingues.
- No se declaran modos especiales (thinking mode, audio, vision multimodal fuera del propio entorno de simulacion).

## Casos de uso

- Reproduccion de ejercicios docentes de deep RL: el checkpoint sirve para que estudiantes de cursos de RL carguen una politica PPO ya entrenada, la evaluen en el entorno y comparen sus resultados con los del autor (recompensa media declarada de 18,50).
- Punto de partida para fine-tuning en ViZDoom: al ser un checkpoint de Sample Factory, se puede reanudar el entrenamiento con mas pasos o modificar la configuracion para mejorar la politica antes de desplegarla en un entorno propio.
- Comparacion de frameworks de RL: permite contrastar la implementacion de Sample Factory con alternativas como Stable-Baselines3 o CleanRL usando exactamente el mismo entorno y la misma metrica de recompensa media.
- Investigacion en reward shaping: el escenario de recoleccion de salud es un banco de pruebas habitual para estudiar como distintas funciones de recompensa afectan a la estabilidad y a la convergencia en entornos con recompensa escasa.
- Estudio de eficiencia de muestreo y throughput: Sample Factory esta disenado para entrenamiento asincrono a gran escala, por lo que este checkpoint es util como referencia base al medir el coste de reentrenar la misma tarea.
- Pruebas de pipelines de evaluacion de agentes: sirve como caso minimo para validar infraestructura de evaluacion automatizada (lanzar entorno, cargar politica, registrar recompensa) sin depender de un modelo grande.
- Base para investigacion en navegacion visual 3D: el agente aprende a moverse y orientarse en un mapa en primera persona, una habilidad transferible a estudios de navegacion en entornos simulados similares.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el autor en el `model-index` de la model card. No hay resultados adicionales ni comparaciones publicadas.

| Tarea | Entorno | Metrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | doom_health_gathering_supreme | mean_reward | 18,50 | No |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tipo de modelo (checkpoint de politica para ViZDoom, repo de 0.0 GB) el consumo es muy bajo, del orden de cientos de megabytes, aunque no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponibles. Para un agente de este tamano, cualquier GPU moderna es mas que suficiente; no requiere A100 ni H100.
- Compatibilidad con GPU de consumo: muy probablemente si, incluidas GPUs de gama baja, dado el tamano del artefacto y la naturaleza del entorno ViZDoom. No confirmado en la model card.
- Opciones de despliegue: Sample Factory para carga y evaluacion del checkpoint; el modelo viene etiquetado con `library_name: sample-factory`. No se declaran soportes de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un agente de RL.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables publicados para este modelo ni para alternativas equivalentes en la misma tarea. A continuacion se indican candidatos de la misma categoria (agentes PPO para el mismo entorno) con los datos conocidos; el resto queda como no disponible.

| Modelo | Algoritmo | Framework | Entorno | Recompensa media | Licencia |
|---|---|---|---|---|---|
| tvrpranay/sf-doom-health-gathering | PPO | Sample Factory | doom_health_gathering_supreme | 18,50 (no verificado) | No disponible |
| Agentes PPO equivalentes en Stable-Baselines3 | PPO | Stable-Baselines3 | doom_health_gathering_supreme | No disponible | No disponible |
| Agentes PPO equivalentes en CleanRL | PPO | CleanRL | doom_health_gathering_supreme | No disponible | No disponible |

No se dispone de valores de referencia fiables para los modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa no puede completarse.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no aplicable en el sentido habitual; en su lugar existe el riesgo de sobreajuste al entorno concreto y de degradacion fuera de la distribucion de entrenamiento.
- Alcance muy limitado: el agente esta especializado exclusivamente en `doom_health_gathering_supreme`; no es transferible a otras tareas sin reentrenamiento.
- Licencia no declarada: al no especificarse licencia, no hay autorizacion explicita para uso comercial ni para redistribucion. Debe tratarse como material sin licencia clara hasta consultar al autor.
- Resultados no verificados: la unica metrica declarada (18,50 de recompensa media) figura con `verified: false`, por lo que no ha sido confirmada de forma independiente.
- Ausencia de documentacion tecnica: no se detallan hiperparametros, arquitectura, semillas ni numero de pasos de entrenamiento, lo que dificulta la reproducibilidad.
- Cero traccion en la comunidad: 0 descargas y 0 likes, sin evidencia de uso o validacion externa.
- Fecha de creacion atipica: los metadatos indican creacion el 2026-10-03, lo que conviene verificar antes de citar el artefacto.
- No es un modelo de lenguaje: no debe emplearse para generacion de texto, codigo ni tareas de NLP.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tvrpranay/sf-doom-health-gathering
- Repositorio de Sample Factory: https://github.com/alex-petrenko/sample-factory
- Entorno ViZDoom: https://vizdoom.cs.put.edu.pl/
- Documentacion del escenario health gathering en ViZDoom: https://vizdoom.farama.org/environments/default/health_gathering.html
- Curso de deep RL (tag `deep-rl-course`): https://huggingface.co/learn/deep-rl-course/unit0/introduction
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs o demos adicionales especificos de este modelo.
