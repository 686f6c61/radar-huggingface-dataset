# YellowDuckSweater/microduck-gimmethesock-001

## Resumen

microduck-gimmethesock-001 es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo no es un modelo de lenguaje: es una política perpetua que, dada una observación de 61 dimensiones del estado del robot, emite 14 acciones de control a 50 Hz de forma continua hasta que se le indique lo contrario. Se publica como un artefacto ONNX autocontenido que se carga directamente en una ranura de política del demonio `robotctl` del robot.

El autor, YellowDuckSweater, lo ha entrenado con los valores por defecto del framework mjlab-microduck 0.1.0 sobre la tarea `Mjlab-SockHeist6m-MicroDuck`, definida en el repositorio microduck-challenges. La model card es explícita sobre el proceso: mismo código, mismo `uv.lock`, mismo comando y misma semilla, pero los pesos no son reproducibles bit a bit porque el entrenamiento con RL sobre GPU no lo permite.

Su relevancia es acotada pero clara: demuestra el flujo completo de entrenamiento y despliegue de políticas de locomoción en un robot de bajo coste, con un artefacto listo para ejecutar en hardware real mediante un único comando. No hay información pública sobre licencia, idiomas ni benchmarks de rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control entrenada con aprendizaje por refuerzo (detalles de red no disponibles) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de 61 dimensiones por paso |
| Tipos de cuantización | no disponible (artefacto ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` con esquema 2 del manifiesto de políticas de microduck |
| Frecuencia de control | 50 Hz |
| Dimensiones de observación | 61 |
| Dimensiones de acción | 14 |
| Librería | microduck |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (capas, anchura, tipo de encoder). Lo que sí se especifica es la interfaz: una política de tipo perpetuo que consume observaciones crudas de 61 dimensiones y produce 14 acciones a 50 Hz, sin condición de terminación propia. El normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones sin preprocesar.

El entrenamiento se realizó con mjlab-microduck 0.1.0 (commit base `1efd853be`) sobre la tarea `Mjlab-SockHeist6m-MicroDuck`, del repositorio microduck-challenges (rama `main`, commit `22f7eb9ba`), con checkpoint 1400, semilla 1 y 4096 entornos paralelos, hasta un máximo de 1500 iteraciones del agente. El registro se hizo con TensorBoard bajo el nombre de ejecución `run-1105-0653-003`. El autor advierte explícitamente que la reproducibilidad es funcional, no bit a bit.

## Capacidades

- Locomoción continua del robot microduck: genera una marcha perpetua que se ejecuta hasta recibir una orden de parada o sustitución.
- Control a 50 Hz con 14 acciones, adecuado para el bucle de control de bajo nivel del cuadrúpedo.
- Consumo de observaciones crudas de 61 dimensiones gracias al normalizador embebido en el ONNX.
- Carga directa en una ranura de política del demonio del robot mediante `robotctl policy load`.
- Compatible con el esquema 2 del manifiesto de políticas de microduck.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo generativo.

## Casos de uso

- Despliegue de referencia en hardware real: cargar la política en una ranura con `sudo robotctl policy load <slot> YellowDuckSweater/microduck-gimmethesock-001` para validar la cadena completa de entrenamiento a robot en pocos minutos.
- Banco de pruebas de la interfaz de políticas: al ser un artefacto ONNX con manifiesto de esquema 2, sirve para verificar que el daemon `robotctl` y el cargador de políticas funcionan correctamente antes de entrenar políticas propias.
- Base para comparación de marchas: al ser una política entrenada con los valores por defecto, permite medir la mejora de políticas posteriores con hiperparámetros ajustados sobre la misma tarea.
- Docencia y divulgación en robótica con RL: el flujo es reproducible con un único comando documentado, lo que facilita demostraciones de entrenamiento y despliegue en talleres.
- Investigación en transferencia sim-a-real: útil para estudiar cómo se comporta una política entrenada en simulación (mjlab) al ejecutarse en el microduck físico.
- Punto de partida para experimentos de sustitución en caliente: la naturaleza perpetua de la política permite practicar el cambio de ranura en marcha sin reiniciar el robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de recompensa, tasa de éxito de la tarea, velocidad de marcha ni estabilidad reportadas en la model card.

## Requisitos de hardware

- Inferencia en el propio robot: el artefacto es un ONNX de tamaño reducido (el repositorio ocupa 0,0 GB según Hugging Face), pensado para ejecutarse en el hardware de a bordo del microduck a 50 Hz.
- GPU para reentrenamiento: el comando de reproducción usa 4096 entornos paralelos y hasta 1500 iteraciones; se requiere una GPU con capacidad suficiente para RL masivamente paralelo (modelo concreto no especificado en la información disponible).
- VRAM estimada para inferencia: no disponible; por el tamaño del artefacto, es previsible que quepa en cualquier acelerador del robot, pero no se confirma.
- Cabe en GPU de consumo: no confirmado para entrenamiento; para inferencia, el formato ONNX sugiere que sí, aunque no hay dato oficial.
- Opciones de despliegue: `robotctl` (demonio de microduck) con carga en ranura de política; el ONNX también puede ejecutarse con cualquier runtime compatible con ONNX.
- Latencia y throughput: frecuencia de control fijada a 50 Hz; no se publican cifras de latencia por paso.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas publicadas para el microduck ni artefactos comparables de la misma tarea con los que establecer una comparación de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo generativo: no admite prompts de texto, tool calling ni razonamiento.
- Sesgos conocidos: no disponibles; al ser una política de RL, puede heredar comportamientos indeseados de la distribución de entrenamiento, pero no se documentan.
- Riesgo de alucinación: no aplica en el sentido habitual; el riesgo equivalente es una marcha inestable o no generalizable fuera de las condiciones de simulación, no cuantificado en la model card.
- La política es perpetua y no tiene condición de terminación propia: requiere supervisión y un mecanismo externo de parada o sustitución.
- Reproducibilidad limitada: el propio autor advierte que reentrenar con la misma semilla produce una política comparable, no idénticos pesos.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución; conviene contactar con el autor antes de integrarlo en un producto.
- Idiomas y contexto: no aplica; la única entrada es el vector de observación de 61 dimensiones del robot.
- Sin métricas publicadas de rendimiento: no hay evidencia cuantitativa de robustez ante perturbaciones, terrenos variables o carga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YellowDuckSweater/microduck-gimmethesock-001
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y tareas de entrenamiento: https://github.com/StephenForte/microduck-challenges
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio (referenciada en la model card, sin URL directa disponible)
