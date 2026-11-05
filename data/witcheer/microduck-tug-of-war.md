# witcheer/microduck-tug-of-war

## Resumen

`microduck-tug-of-war` es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de bajo coste Microduck, desarrollado por Pollen Robotics. El modelo resuelve una tarea concreta de locomotion competitiva: mantenerse erguido y ganar terreno en un escenario simulado de tirar de la cuerda (tug of war) frente a otras políticas congeladas. Lo publica el usuario witcheer bajo el identificador `witcheer/microduck-tug-of-war`, con fecha de creación en noviembre de 2026 y sin descargas ni interacciones registradas hasta la fecha.

Técnicamente no es un modelo de lenguaje ni un transformer generativo, sino una política neuronal exportada a ONNX que mapea una observación de 61 dimensiones a 14 acciones de control a 50 Hz. Se entrenó con el framework mjlab sobre el repositorio `microduck-challenges`, con 2048 entornos paralelos y 250 iteraciones adicionales mediante warm-start desde una política previa. El resultado es una política perpetua (se ejecuta de forma continua hasta que se detiene) pensada para cargarse en un slot de política del daemon `robotctl`.

Su relevancia es acotada pero específica: demuestra el flujo completo de entrenamiento en simulación y despliegue en un robot real de bajo coste, con un manifiesto de política versionado y un pipeline reproducible. No obstante, el propio autor advierte que solo se ha validado en simulación y no se ha probado aún en un Microduck físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal de control (reinforcement learning), exportada a ONNX; arquitectura interna de la red no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (exportación ONNX; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas de microduck) |

## Arquitectura y entrenamiento

La política se entrenó con mjlab (entorno de simulación física basado en MuJoCo) sobre la tarea `Mjlab-TugOfWar-MicroDuck`, definida en el repositorio `pollen-robotics/microduck-challenges`, rama `tug-league`, commit `f4cef5830`. El entrenamiento partió de una política previa (warm-start) y se ejecutaron 250 iteraciones adicionales contra una liga de políticas congeladas del tablero, con 2048 entornos paralelos. La receta de recompensa combina "stay upright" con peso 1.0 y "win ground" con peso 4.0. El checkpoint exportado es el 475, con semilla 7, sobre la base `mjlab-microduck 0.1.0 @ 1efd853be`.

La observación tiene 61 dimensiones y la acción 14 dimensiones, ejecutadas a 50 Hz. El normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el robot debe alimentar observaciones en crudo. El autor indica que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con la misma semilla produce una política comparable, no idéntica. La exportación se realizó desde un checkout con cambios sin commitear, lo que introduce una incertidumbre adicional sobre la reproducibilidad exacta.

## Capacidades

- Control de locomotion del Microduck: mantiene la postura erguida y aplica fuerza de tracción en la tarea de tirar de la cuerda.
- Política perpetua: se ejecuta de forma continua hasta que el operador la detiene, sin horizonte de episodio fijo.
- Interfaz estandarizada: observación de 61 dimensiones y 14 acciones a 50 Hz, compatible con el daemon `robotctl` mediante carga en un slot de política.
- Normalización integrada: no requiere preprocesado externo de observaciones.
- Manifiesto versionado: `manifest.json` sigue el schema 2 del manifiesto de políticas de microduck.
- Entrenamiento en liga: la política se entrenó contra oponentes congelados, lo que favorece comportamientos competitivos frente a políticas del tablero.
- No dispone de capacidades de lenguaje, visión, audio, tool calling ni razonamiento multi-paso.

## Casos de uso

- Despliegue en el Microduck físico para pruebas de locomotion competitiva: cargar la política en un slot con `robotctl policy load` y evaluar el comportamiento en la tarea de tirar de la cuerda, teniendo en cuenta que el autor no la ha validado en hardware real.
- Benchmark de referencia para nuevas políticas: usar esta política como oponente congelado en la liga de entrenamiento de futuras variantes, replicando el esquema de entrenamiento contra liga descrito en la model card.
- Evaluación de recetas de recompensa: la combinación "stay upright 1.0 / win ground 4.0" sirve como punto de partida para comparar el efecto de distintas ponderaciones en el equilibrio entre estabilidad postural y fuerza de tracción.
- Docencia e investigación en RL para robótica de bajo coste: el pipeline completo (mjlab, 2048 entornos, warm-start, exportación ONNX) es un ejemplo reproducible de extremo a extremo sobre hardware accesible.
- Pruebas de integración del daemon `robotctl`: validar la carga de políticas, el esquema de manifiesto y la ejecución a 50 Hz en un caso de uso real.
- Estudio de robustez frente a oponentes: analizar cómo se comporta una política entrenada contra una liga concreta cuando se enfrenta a políticas no vistas durante el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y la política se exporta a ONNX, por lo que se espera un modelo de tamaño reducido, pero el autor no publica el número de parámetros ni el tamaño del fichero.
- GPU recomendadas: no disponible para inferencia. Para reentrenamiento, el autor no especifica el hardware utilizado; el comando de entrenamiento usa 2048 entornos paralelos, lo que en la práctica requiere una GPU de gama alta (A100/H100 o similar), aunque este dato no está confirmado en la información proporcionada.
- Cabe en GPU de consumo: no disponible; por el tamaño del repositorio (0.0 GB) es plausible, pero no está documentado.
- Opciones de despliegue: el despliegue previsto es en el robot Microduck mediante el daemon `robotctl` (`sudo robotctl policy load <slot> witcheer/microduck-tug-of-war`). No se documenta despliegue con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: la política se ejecuta a 50 Hz (periodo de 20 ms por paso de control), según la model card. No se publican latencias de inferencia medidas.

## Comparativa con modelos similares

No se dispone de información sobre políticas comparables del mismo autor o de la comunidad para el Microduck en la información proporcionada. La model card menciona una política previa ("our first tug duck") de la que esta se warm-startea, pero no se aportan sus especificaciones ni su identificador público.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-tug-of-war | no disponible | no aplica | no disponible | no disponible | HuggingFace (0 descargas) |
| Política previa "first tug duck" | no disponible | no aplica | no disponible | no disponible | no disponible |
| Otras políticas del tablero (liga) | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Validación exclusivamente en simulación: el autor indica explícitamente que no se ha probado en un Microduck real, por lo que el comportamiento en hardware puede diferir del simulado (gap sim-to-real).
- Licencia no especificada: no se indica licencia en la model card ni en los metadatos, lo que impide confirmar si el uso comercial está permitido. Conviene contactar con el autor antes de cualquier uso en producción.
- Reproducibilidad limitada: el entrenamiento no es bit-reproducible entre máquinas y la exportación se hizo desde un checkout con cambios sin commitear, por lo que los pesos exactos no pueden regenerarse de forma determinista.
- Especialización estrecha: la política está entrenada para una única tarea (tug of war) y no se espera que generalice a otras tareas de locomotion sin reentrenamiento.
- Dependencia de la liga de entrenamiento: al haberse entrenado contra oponentes congelados concretos, su rendimiento frente a políticas no vistas no está caracterizado.
- Sin datos de sesgo, alucinación ni comportamiento adversario fuera del entorno simulado; no aplican las categorías habituales de modelos de lenguaje.
- Cero descargas y cero interacciones: no hay evidencia de uso por parte de la comunidad ni informes independientes de funcionamiento.
- Requiere el ecosistema microduck (`robotctl`, daemon con soporte de manifiesto schema 2) para su despliegue; no es un artefacto autónomo fuera de ese entorno.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/witcheer/microduck-tug-of-war
- Repositorio de desafíos (rama `tug-league`): https://github.com/notwitcheer/microduck-challenges/tree/tug-league
- Repositorio base de desafíos: https://github.com/pollen-robotics/microduck-challenges
- Proyecto Microduck de Pollen Robotics: https://github.com/pollen-robotics/microduck
