# YellowDuckSweater/microduck-hill-climb-1m5-run-1111-0945-11

## Resumen

microduck-hill-climb-1m5-run-1111-0945-11 es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo microduck de Pollen Robotics. No se trata de un modelo de lenguaje, sino de un controlador neuronal que transforma observaciones del robot (61 dimensiones) en acciones de actuadores (14 dimensiones) a una frecuencia de 50 Hz. El autor, YellowDuckSweater, lo publica como una "política perpetua": una marcha que se ejecuta de forma continuada hasta que se le indique lo contrario, pensada para cargarse en una ranura de política del daemon del robot.

El modelo se distribuye en formato ONNX con el normalizador de observaciones integrado en el propio grafo, de modo que el consumidor puede alimentar observaciones en bruto sin preprocesado adicional. El repositorio incluye además un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck. El entrenamiento se realizó con el framework mjlab (basado en MuJoCo) sobre la tarea `Mjlab-HillClimb1m5-MicroDuck`, un escenario de ascenso de colina con 1,5 metros de desnivel.

Su relevancia es acotada pero específica: es un artefacto reproducible de RL para robótica de bajo coste, útil para quienes experimentan con locomoción en el microduck y quieren comparar políticas entrenadas con distintas semillas y checkpoints. El repositorio es de tamaño 0.0 GB, sin descargas ni likes en el momento de la consulta, y no dispone de información sobre licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal para RL (red de política cargada como ONNX); arquitectura interna no detallada |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); ventana de observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |

## Arquitectura y entrenamiento

La política se entrenó con mjlab (versión base `mjlab-microduck 0.1.0 @ 1efd853be`), un framework de RL para robótica construido sobre MuJoCo, dentro del repositorio `microduck-challenges` de StephenForte. La tarea es `Mjlab-HillClimb1m5-MicroDuck`, un escenario de ascenso de colina de 1,5 metros. El entrenamiento se lanzó con 4096 entornos paralelos, un máximo de 3888 iteraciones del agente y semilla 8, registrando métricas en TensorBoard bajo el nombre de ejecución `run-1111-0945-11`. El checkpoint publicado corresponde al paso 3250.

La interfaz del controlador es explícita: 61 dimensiones de observación como entrada y 14 acciones como salida, a 50 Hz. El normalizador de observaciones está embebido en `policy.onnx`, por lo que el robot debe alimentar observaciones sin normalizar. El autor advierte que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con el mismo código, `uv.lock` y semilla produce una política comparable, pero no idéntica en pesos. No se dispone de información sobre la topología exacta de la red (capas, activaciones, número de parámetros).

## Capacidades

- Locomoción continua del microduck: ejecuta una marcha perpetua que se mantiene hasta recibir una orden de parada.
- Ascenso de colinas: entrenada específicamente para la tarea de subida de una pendiente de 1,5 metros.
- Control a 50 Hz: adecuada para el bucle de control en tiempo real del daemon del robot.
- Entrada de observaciones en bruto: el normalizador integrado en el ONNX elimina la necesidad de preprocesado en el host.
- Carga por ranura de política: se integra mediante `robotctl policy load <slot> ...`.
- Reproducibilidad documentada: código, commit, semilla y comando de entrenamiento publicados para replicar el experimento.
- No dispone de tool calling, capacidades de agentes, multilingüismo, visión, audio ni modo de razonamiento: no es un modelo de lenguaje.

## Casos de uso

- Investigación en locomoción de cuadrúpedos de bajo coste: cargar la política en el microduck para estudiar el comportamiento de una marcha entrenada en un escenario de pendiente concreta y compararla con otras políticas del mismo repositorio de desafíos.
- Evaluación comparativa de checkpoints: usar el checkpoint 3250 como referencia frente a políticas entrenadas con otras semillas o iteraciones, aprovechando que el autor documenta el comando exacto de reproducción.
- Docencia y demostraciones de RL en robótica: el flujo `robotctl policy load` permite mostrar en clase cómo una política neuronal se despliega en hardware real sin infraestructura de inferencia compleja.
- Pruebas de integración del daemon: validar el esquema 2 del manifiesto de políticas y el pipeline de carga de políticas ONNX en entornos de desarrollo del microduck.
- Benchmark de robustez en terreno inclinado: ejecutar la marcha en pendientes de 1,5 m para medir estabilidad y caídas, y registrar datos para futuras iteraciones de entrenamiento.
- Base para fine-tuning o destilación: partir de esta política como inicialización en nuevas tareas de mjlab dentro de `microduck-challenges`, reutilizando el mismo pipeline de entrenamiento con 4096 entornos.
- Automatización de pruebas de regresión de firmware: usar la política perpetua como carga de trabajo estandarizada para verificar que el daemon mantiene el bucle de control a 50 Hz tras cambios de firmware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, tasa de éxito en la tarea de ascenso ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de una política de 61 entradas y 14 salidas en ONNX, la huella de memoria es previsiblemente muy reducida, pero no se publican cifras.
- GPU recomendadas: no disponible. La inferencia en el robot se ejecuta mediante el daemon microduck, no se especifica aceleración por GPU.
- Cabe en GPU de consumo: no disponible con datos confirmados; por el tamaño del artefacto (repo de 0.0 GB) es altamente probable que quepa en cualquier GPU de consumo, pero no se confirma en la información.
- Opciones de despliegue: daemon microduck con `robotctl policy load <slot>` y runtime ONNX; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: no disponible; la política opera a 50 Hz por requisito del robot, pero no se publican latencias medidas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de microduck ni modelos comparables con parámetros, contexto o rendimiento publicados.

## Limitaciones y advertencias

- Ámbito restringido: es una política de control para una tarea concreta (ascenso de colina de 1,5 m) y un robot concreto (microduck); no generaliza a otros robots ni a otras tareas sin reentrenamiento.
- Sin licencia declarada: no se especifica licencia, por lo que el uso comercial y la redistribución quedan sin marco legal explícito; conviene contactar al autor antes de cualquier uso en producción.
- Sin datos de idiomas: irrelevante para este artefacto, pero el campo figura como no disponible.
- Reproducibilidad limitada: el propio autor advierte que el RL en GPU no es bit-reproducible; los pesos publicados no se obtendrán idénticos al repetir el entrenamiento.
- Rendimiento no verificado: no hay benchmarks publicados, ni tasas de éxito, ni métricas de recompensa; no se puede afirmar su robustez en pendientes distintas de la entrenada.
- Artefacto sin tracción: cero descargas y cero likes en el momento de la consulta, lo que reduce la evidencia externa sobre su funcionamiento.
- Dependencia del daemon: requiere un entorno microduck con `robotctl` y el esquema 2 del manifiesto; no es un artefacto autónomo fuera de ese ecosistema.
- Riesgo de comportamiento perpetuo: al ser una política que "se ejecuta hasta que se le indique lo contrario", es necesario prever mecanismos de parada segura en el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YellowDuckSweater/microduck-hill-climb-1m5-run-1111-0945-11
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de desafíos y entrenamiento: https://github.com/StephenForte/microduck-challenges (commit `91544352c`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (ruta citada en la model card, sin URL directa disponible)
