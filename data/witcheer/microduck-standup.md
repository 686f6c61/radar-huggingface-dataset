# witcheer/microduck-standup

## Resumen

`witcheer/microduck-standup` es una política de control por refuerzo (reinforcement learning) para el robot cuadrúpedo de código abierto Microduck, desarrollado por el usuario witcheer y publicado en HuggingFace con librería ONNX. No es un modelo de lenguaje: es un controlador entrenado en simulación que ejecuta una habilidad concreta, levantarse y mantenerse de pie ("stand up"), a partir de un vector de observación de 61 dimensiones y emitiendo 14 acciones a 50 Hz. Está pensado para ejecutarse en el robot real mediante la herramienta de despliegue `robotctl`.

La política se entrenó en el entorno Mjlab con el escenario "Mjlab-StandUp-Flat-MicroDuck", durante 25.000 iteraciones (15.000 del autor original más una extensión de 10.000) con 4.096 entornos paralelos, lo que supuso 407 minutos de cómputo en una única RTX 5090. La política es episódica: cada rollout dura 6,0 segundos y devuelve al robot a la postura de pie. Se documenta que funciona al levantarse desde la posición de sentado y desde boca abajo, pero que falla al partir de boca arriba, donde se queda congelada a medio girar (0 de 2 intentos).

Su relevancia es acotada pero clara en el ámbito de la robótica open source: sirve como pieza reutilizable para el Microduck, como referencia metodológica de entrenamiento RL en Mjlab y como artefacto versionado con un manifiesto de política (schema 2) que permite instalarlo de forma declarativa. El repositorio tiene 0 descargas y 0 likes, tamaño de 0,0 GB y no declara licencia, por lo que debe tratarse como un artefacto experimental, no como una dependencia de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red de política RL; no se documenta la topología de la red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: entrada de 61 dimensiones (observación) y episodios de 6,0 s a 50 Hz |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se declara precisión numérica) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` (schema 2 del microduck policy manifest) |
| Tipo de modelo | política de reinforcement learning (pipeline: reinforcement-learning) |
| Dimensiones de observación | 61 |
| Dimensiones de acción | 14 |
| Frecuencia de control | 50 Hz |
| Duración del episodio | 6,0 s |
| Escenario de entrenamiento | Mjlab-StandUp-Flat-MicroDuck (solo simulación) |
| Iteraciones de entrenamiento | 25.000 (15.000 originales + 10.000 de extensión) |
| Entornos paralelos | 4.096 |
| Tiempo de entrenamiento declarado | 407 minutos en una RTX 5090 |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-21 |
| Última actualización | 2026-09-21 |

## Arquitectura y entrenamiento

No se publica información sobre la arquitectura de la red (número de capas, ancho, tipo de capa ni función de activación). Lo único conocido es la interfaz del modelo: recibe un vector de observación de 61 dimensiones y produce 14 acciones a 50 Hz, en formato ONNX con el normalizador de observaciones integrado en el propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones crudas sin preprocesar. El `manifest.json` asociado sigue el esquema 2 del manifiesto de políticas de Microduck definido en `docs/policy-manifest.md` del repositorio del daemon.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl` (rama `develop`, commit `53b8971b6`) sobre la tarea "Mjlab-StandUp-Flat-MicroDuck". Se ejecutaron 25.000 iteraciones con 4.096 entornos paralelos, lo que consumió 407 minutos en una única RTX 5090. La model card indica explícitamente que se trata de una política episódica de 6,0 s que devuelve el robot a una postura de pie. No se documentan detalles del algoritmo de RL empleado, del diseño de la función de recompensa, de las técnicas de domain randomization ni del pipeline de sim-to-real, más allá de la declaración de que el modelo solo ha sido validado en simulación.

## Capacidades

- Control de locomoción de baja dimensionalidad: genera 14 acciones de control a 50 Hz a partir de 61 observaciones, durante episodios de 6,0 s.
- Levantarse desde la posición de sentado y mantener la postura de pie.
- Levantarse desde la posición de boca abajo (prono) y mantener la postura de pie.
- Retorno autónomo a una postura erguida al final del episodio (comportamiento episódico autocontenido).
- Normalización de observaciones integrada: acepta observaciones crudas directamente, sin capa de preprocesado externa.
- Despliegue declarativo mediante `robotctl`, con instalación por identificador de repositorio.
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de capacidades multilingües, de visión, de audio ni de modo "thinking".
- Comportamiento incompleto conocido: desde la posición de boca arriba (supino) no logra darse la vuelta y se queda congelado a medio giro.

## Casos de uso

- Recuperación autónoma tras caída en simulación: la política puede invocarse cuando el robot queda en posición de sentado o prono para devolverlo a la postura de pie, integrándose como habilidad de recuperación dentro de un controlador de mayor nivel.
- Investigación en aprendizaje por refuerzo: sirve como caso de estudio reproducible de una tarea de get-up entrenada con Mjlab, con hiperparámetros declarados (25.000 iteraciones, 4.096 entornos) y una referencia de coste computacional (407 minutos en RTX 5090).
- Punto de partida para reentrenamiento o fine-tuning: al estar vinculada a un repositorio de entrenamiento concreto (`pollen-robotics/microduck_rl`, rama `develop`), es un candidato natural para extender el entrenamiento y corregir el fallo desde decúbito supino.
- Prueba de integración del stack de despliegue: el comando `robotctl policy add standup witcheer/microduck-standup` seguido de `robotctl robot do standup` permite validar de extremo a extremo la cadena de instalación y ejecución de políticas del daemon.
- Evaluación comparativa de algoritmos de locomoción en el Microduck: al fijar el robot, el espacio de observación y el de acciones, la política actúa como línea base frente a otras políticas del mismo ecosistema.
- Docencia y demostraciones de robótica: puede reproducirse en simulación para ilustrar el ciclo observación-acción a 50 Hz, el efecto de la postura inicial en el éxito de la tarea y los límites del entrenamiento en simulación.
- Estudio del gap sim-to-real: la model card declara que el modelo no se ha probado en un Microduck físico, por lo que constituye un caso de prueba directo para medir la transferencia de una política entrenada en simulación plana.
- Prueba de robustez ante condiciones iniciales adversas: el fallo documentado desde boca arriba (0 de 2 intentos) es un escenario de regresión útil para validar mejoras posteriores del entrenamiento.
- Despliegue en robótica educativa de bajo coste: si se confirma su funcionamiento en hardware real, la política podría ejecutarse en el propio robot para dotarlo de una habilidad básica de autonomía postural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible (no hay MMLU, HumanEval, GSM8K ni métricas de retorno, tasa de éxito agregada o error de seguimiento). La única evaluación disponible es cualitativa y procede de la model card:

| Escenario evaluado | Entorno | Resultado declarado | Intentos |
|---|---|---|---|
| Levantarse desde sentado y mantener de pie | Mjlab-StandUp-Flat-MicroDuck (simulación) | Éxito | no se especifica |
| Levantarse desde boca abajo y mantener de pie | Mjlab-StandUp-Flat-MicroDuck (simulación) | Éxito | no se especifica |
| Levantarse desde boca arriba | Mjlab-StandUp-Flat-MicroDuck (simulación) | Fracaso: se queda congelado a medio girar | 2 |
| Ejecución en robot Microduck real | Hardware físico | No probado | 0 |

Datos de entrenamiento declarados: 25.000 iteraciones (15.000 más 10.000 de extensión), 4.096 entornos, 407 minutos en una RTX 5090.

## Requisitos de hardware

- Entrenamiento: una única RTX 5090, 407 minutos, 4.096 entornos paralelos. No se documentan requisitos de memoria ni de CPU/RAM del host.
- VRAM para inferencia: no disponible. El repositorio ocupa 0,0 GB y el artefacto es un único `policy.onnx`, por lo que el peso del fichero es inferior a la precisión de redondeo del dato publicado (menos de ~50 MB, sin cifra exacta).
- GPU recomendadas: no disponibles para inferencia. Para reentrenamiento, la referencia publicada es la RTX 5090.
- Compatibilidad con GPU de consumo: no confirmada. Dado el perfil declarado (entrada de 61 dimensiones, salida de 14 acciones, 50 Hz) y el tamaño del repositorio, es plausible su ejecución en CPU o en hardware embebido, pero no hay dato publicado que lo confirme.
- Opciones de despliegue: `robotctl` (daemon de Microduck) para el robot; cualquier runtime de inferencia ONNX para evaluaciones fuera del robot. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Se conoce únicamente la frecuencia objetivo de control, 50 Hz (periodo de 20 ms), y la duración de episodio, 6,0 s.
- Requisitos del robot: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Categoría | Observaciones / acciones | Duración | Licencia | Rendimiento declarado |
|---|---|---|---|---|---|
| witcheer/microduck-standup | Política RL para Microduck (ONNX) | 61 / 14, a 50 Hz | 6,0 s por episodio | no disponible | Se levanta desde sentado y desde boca abajo; falla desde boca arriba; no probado en hardware real |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otras políticas del mismo robot, del mismo ecosistema (`microduck_rl`) o de tareas equivalentes de get-up en cuadrúpedos de tamaño similar, por lo que no es posible establecer una comparación cuantitativa ni de licencias.

## Limitaciones y advertencias

- Sesgos conocidos: no aplica en el sentido de sesgos de datos lingüísticos; el comportamiento está sesgado por el escenario de entrenamiento, limitado a terreno plano ("Flat") y a la tarea concreta de levantarse.
- Alucinación: no aplica como tal, pero sí existe el riesgo de comportamientos fuera de distribución ante observaciones no vistas durante el entrenamiento, sin que la política los detecte o los señale.
- Fracaso documentado: partiendo de boca arriba se queda congelada a medio girar, con 0 de 2 intentos correctos. No debe asumirse una capacidad general de recuperación desde cualquier postura.
- No validado en hardware real: la model card indica explícitamente que no se ha probado en un Microduck físico. El gap sim-to-real es, por tanto, completamente desconocido.
- Cobertura limitada de la tarea: política episódica y de habilidad única (6,0 s); no incorpora navegación, percepción visual ni planificación.
- Idiomas: no aplica, no es un modelo de lenguaje; no procesa texto.
- Restricciones de licencia: la licencia no está declarada. Sin licencia explícita, no puede asumirse permiso para uso comercial, redistribución o modificación; es un riesgo legal relevante para cualquier integración en producto.
- Ausencia de tracción: 0 descargas y 0 likes, repositorio de 0,0 GB y sin señales de mantenimiento posterior a la fecha de creación (2026-09-21), con última actualización tres segundos después de la creación.
- Ausencia de documentación técnica: no se publican arquitectura de red, precisión numérica del ONNX, algoritmo de RL, función de recompensa, semilla ni criterios de convergencia, lo que dificulta la reproducibilidad.
- Metadatos incompletos: los campos de idioma y licencia aparecen vacíos en la ficha de HuggingFace.
- Fecha de publicación anómala (2026-09-21), posterior a la fecha de referencia habitual; conviene verificar la vigencia de los enlaces y del repositorio asociado antes de reutilizarlo.
- Advertencia de despliegue: los comandos de la model card requieren `sudo` y actúan sobre el robot; deben ejecutarse únicamente en un entorno controlado y con el robot asegurado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/witcheer/microduck-standup
- Repositorio del robot Microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `develop`, commit `53b8971b6`)
- Documento del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de Microduck (ruta citada en la model card; no se proporciona URL directa)
- Paper, blog o demo asociados: no disponibles
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a foros de correo electrónico sin relación con robótica ni con aprendizaje por refuerzo.
