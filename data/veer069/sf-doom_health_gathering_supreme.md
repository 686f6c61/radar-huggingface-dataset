# Veer069/sf-doom_health_gathering_supreme

## Resumen

`Veer069/sf-doom_health_gathering_supreme` es un agente de aprendizaje por refuerzo (no un modelo de lenguaje) entrenado con Sample Factory para resolver el escenario `doom_health_gathering_supreme` de ViZDoom. El objetivo de la tarea es sobrevivir el mayor tiempo posible y recoger botiquines para mantener la salud, una variante de supervivencia con recompensa densa que se usa habitualmente como entorno de referencia en investigación en RL. El autor es el usuario de Hugging Face Veer069 y el modelo se publicó como entrega de la Unidad 8, Parte 2, del curso de Deep Reinforcement Learning de Hugging Face.

El algoritmo empleado es APPO (Asynchronous PPO) dentro del framework Sample Factory, orientado a entrenamiento asíncrono de alto rendimiento con un gran número de workers de entorno en paralelo. El autor declara una recompensa media de 23,0 ± 4,0 en el entorno, muy por encima del umbral de aprobado de 5,0 que se cita en la model card para esta entrega del curso.

La relevancia actual del artefacto es acotada y de carácter metodológico: sirve como referencia reproducible de un pipeline APPO completo sobre ViZDoom y como punto de comparación para otros algoritmos (PPO síncrono, IMPALA) en el mismo escenario. No se han publicado detalles de arquitectura, número de parámetros, licencia ni formato de pesos, y el repositorio aparece con un tamaño de 0,0 GB, por lo que no hay garantía de que los pesos entrenados estén efectivamente alojados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal entrenada con APPO; el autor no detalla la topología) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no aplica en el sentido de modelos de lenguaje (la política consume observaciones visuales por fotograma) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible; no aplica (agente de control visual, sin interfaz de lenguaje natural) |
| Licencia | no disponible (la model card no especifica licencia) |
| Formato de pesos | no disponible (tamaño del repositorio declarado: 0,0 GB) |
| Entorno | ViZDoom `doom_health_gathering_supreme` |
| Algoritmo | APPO (Asynchronous PPO, Sample Factory) |
| Framework / libreria | sample-factory |
| Tarea | reinforcement-learning |
| Métrica declarada | mean_reward 23,0 ± 4,0 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura de red concreta. Lo que sí se declara es el método de entrenamiento: APPO (Asynchronous PPO), la implementación de PPO asíncrono de Sample Factory, que desacopla la inferencia de la política (agrupada en GPU) de la simulación de entornos (ejecutada en múltiples procesos de CPU). Este diseño permite recoger muestras de muchos entornos ViZDoom en paralelo y sostener un throughput alto de pasos por segundo, algo crítico en escenarios visuales de Doom donde la simulación es costosa.

No se especifican en la información proporcionada el número de tokens o pasos de entrenamiento, la composición del dataset de entrenamiento (en RL no hay dataset estático, sino muestras generadas por interacción), ni si se aplicaron fases adicionales como RLHF o DPO, que en este dominio no aplican. La model card se limita a indicar el entorno, el algoritmo, la recompensa media y el contexto de entrega del curso; no incluye hiperparámetros, curvas de aprendizaje ni innovaciones técnicas adicionales (decodificación especulativa, atención lineal u otras) más allá del propio esquema asíncrono de APPO.

## Capacidades

- Control de política en el entorno ViZDoom `doom_health_gathering_supreme`: navegación y toma de decisiones a partir de observaciones visuales por fotograma.
- Comportamiento de supervivencia: mantener la salud por encima de cero y maximizar el tiempo de supervivencia.
- Recolección de objetos: localizar y recoger botiquines para reponer salud.
- Optimización de recompensa acumulada: la métrica declarada (23,0 ± 4,0 de recompensa media) refleja la política entrenada bajo el esquema APPO.
- Soporte de tool calling / function calling: no disponible; no aplica a este tipo de artefacto.
- Soporte de agentes y razonamiento multi-paso en el sentido de LLM: no aplica; el agente opera como política de control en un MDP.
- Capacidades multilingües: no aplica.
- Capacidades especiales (modo thinking, visión, audio): visión como entrada de observación dentro del entorno ViZDoom; no hay modo de razonamiento explícito ni procesamiento de audio declarado.

## Casos de uso

- Línea base reproducible en investigación en RL: el agente puede servir como referencia con una recompensa media declarada de 23,0 ± 4,0 sobre `doom_health_gathering_supreme`, de modo que otros trabajos comparen sus resultados contra un punto de partida ya publicado.
- Evaluación comparativa de algoritmos: permite contrastar APPO (asíncrono) frente a implementaciones de PPO síncrono en el mismo entorno y con la misma métrica de recompensa media, aislando el efecto del esquema de paralelización.
- Docencia en cursos de aprendizaje por refuerzo: encaja directamente como ejemplo resuelto de la Unidad 8 del curso de Deep RL de Hugging Face, ya que el repositorio declara el entorno, el algoritmo y la puntuación obtenida.
- Pruebas de estrés de infraestructura de entrenamiento asíncrono: al depender de Sample Factory y de muchos workers de entorno en CPU, sirve para validar configuraciones de paralelización, balanceo de carga y rendimiento de recolección de muestras en clústeres.
- Generación de trayectorias para aprendizaje por imitación o RL offline: las trayectorias producidas por la política pueden registrarse y reutilizarse como datos de demostración para entrenar otros agentes en el mismo escenario.
- Punto de partida para transferencia a escenarios ViZDoom más complejos: una política que ya resuelve supervivencia con recolección de recursos puede servir de inicialización para escenarios como `deathmatch` o `defend_the_line`, donde la navegación y la gestión de recursos siguen siendo relevantes.
- Reproducción y auditoría metodológica: dado que la métrica declarada está marcada como no verificada, el artefacto es útil para intentar reproducir el resultado y comprobar si la puntuación publicada se sostiene con los mismos ajustes.

## Benchmarks y rendimiento

Los únicos resultados disponibles son los declarados por el autor en el `model-index` de la model card. No hay datos adicionales de MMLU, HumanEval, GSM8K ni métricas de lenguaje, porque el artefacto es un agente de RL y no un modelo de lenguaje.

| Tarea | Dataset / entorno | Métrica | Valor declarado | Verificado |
|---|---|---|---|---|
| reinforcement-learning | doom_health_gathering_supreme | mean_reward | 23,0 ± 4,0 | No (campo `verified: false` en el `model-index`) |
| reinforcement-learning | doom_health_gathering_supreme | umbral de aprobado citado en la model card | >= 5,0 | No |

No se han publicado resultados de benchmarks adicionales en la información disponible. No se dispone de comparaciones con otros agentes sobre el mismo entorno dentro de la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio se declara como 0,0 GB y no se especifica la topología de red, por lo que no es posible estimar el consumo de memoria de los pesos.
- GPU recomendadas: no disponible para este modelo concreto. A nivel de framework, Sample Factory está diseñado para concentrar la inferencia de la política en una GPU y repartir la simulación de entornos entre procesos de CPU; esto es una característica general del framework, no un requisito verificado de este artefacto.
- Compatibilidad con GPU de consumo: no disponible; sin datos de tamaño de pesos no puede confirmarse.
- CPU: ViZDoom ejecuta el motor del juego en CPU, por lo que el número de núcleos disponibles condiciona el throughput de recolección de muestras durante el entrenamiento. La información proporcionada no indica valores concretos de núcleos ni de pasos por segundo.
- Opciones de despliegue: Sample Factory es el framework con el que se entrenó el agente. No se documentan exportaciones a vLLM, llama.cpp, Ollama o TGI, que no aplican a un agente de RL de este tipo. Tampoco se declara un formato de pesos portable.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la información proporcionada. La tabla siguiente recoge alternativas metodológicas habituales para el mismo entorno, marcando como no disponible todo lo que no puede confirmarse. Las filas de licencia de frameworks alternativos son datos generales de dichos proyectos, no de modelos concretos publicados para este escenario.

| Alternativa | Algoritmo | Entorno | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| sf-doom_health_gathering_supreme (este modelo) | APPO (Sample Factory) | doom_health_gathering_supreme | no disponible | no aplica | mean_reward 23,0 ± 4,0 (no verificado) | no disponible | Repositorio en Hugging Face, 0,0 GB, 0 descargas |
| Entrenamiento con PPO síncrono (Stable-Baselines3) | PPO | doom_health_gathering_supreme | no disponible | no aplica | no disponible | MIT (licencia del framework, dato general) | Framework público; no se referencia un modelo concreto entrenado |
| Entrenamiento con PPO síncrono (CleanRL) | PPO | doom_health_gathering_supreme | no disponible | no aplica | no disponible | MIT (licencia del framework, dato general) | Framework público; no se referencia un modelo concreto entrenado |
| Entrenamiento con IMPALA | IMPALA | doom_health_gathering_supreme | no disponible | no aplica | no disponible | no disponible | no disponible en la información proporcionada |

## Limitaciones y advertencias

- Métrica no verificada: el `model-index` marca el resultado como `verified: false`, aunque la model card afirme que el modelo está "officially verified & certified". Esa afirmación no está respaldada por el campo de verificación de los metadatos.
- Repositorio vacío: el tamaño declarado del repositorio es 0,0 GB y las descargas son 0. Es posible que los pesos entrenados no estén subidos, lo que impediría reproducir el resultado.
- Licencia ausente: la model card no especifica licencia alguna, por lo que no hay autorización explícita para uso comercial ni condiciones de redistribución.
- Sin especificaciones técnicas: no hay información sobre arquitectura, número de parámetros, hiperparámetros, número de pasos de entrenamiento ni semillas, lo que dificulta la replicación.
- Alcance muy restringido: es un agente de un único escenario de ViZDoom. No generaliza a otros entornos sin reentrenamiento o ajuste.
- Sin capacidades de lenguaje: no genera texto, no soporta tool calling, no es multilingüe y no puede usarse como asistente conversacional.
- Fechas inconsistentes en los metadatos: la fecha de creación (2026-09-24) es posterior a la fecha de actualización (2026-09-20), lo que sugiere errores de registro en el repositorio.
- Riesgo de sobreajuste al entorno: los agentes de RL entrenados en un único escenario pueden explotar particularidades del mismo; el rendimiento fuera de la distribución de entrenamiento no está documentado.
- Ausencia de métricas de seguridad o robustez: no se han publicado evaluaciones de estabilidad, varianza entre semillas ni comportamiento ante perturbaciones.
- Advertencia de producción: con la información disponible no es posible recomendar su uso en un sistema productivo; únicamente es apto como material de estudio o investigación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Veer069/sf-doom_health_gathering_supreme
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios de código o demos.
