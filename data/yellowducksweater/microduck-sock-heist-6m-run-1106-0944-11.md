# YellowDuckSweater/microduck-sock-heist-6m-run-1106-0944-11

## Resumen

`microduck-sock-heist-6m-run-1106-0944-11` es una política de control para robots entrenada mediante aprendizaje por refuerzo y publicada en Hugging Face por el usuario YellowDuckSweater. No se trata de un modelo de lenguaje: es un artefacto de robótica que produce acciones motoras a partir de observaciones sensoriales, empaquetado como un grafo ONNX que se carga directamente en el robot microduck de Pollen Robotics. El sufijo del nombre indica una ejecución de entrenamiento ("run") iniciada el 6 de noviembre a las 09:44 (hora 11), con 6 millones de pasos o iteraciones asociadas a la tarea "Sock Heist".

La política es de tipo *perpetual* (perpetua): una vez cargada en una ranura de política del daemon del robot, se ejecuta de forma continua hasta que se le indique lo contrario, comportándose como una marcha o *gait* predefinida. Consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, una frecuencia típica de control de bajo nivel en robots cuadrúpedos pequeños.

Su relevancia es acotada pero concreta: sirve como ejemplo reproducible de un pipeline completo de entrenamiento RL para robótica (entorno mjlab, repositorio de retos, comando de entrenamiento documentado) y como artefacto desplegable en hardware real mediante `robotctl`. El repositorio ocupa 0.0 GB según Hugging Face, lo que sugiere un tamaño muy reducido, coherente con una política neuronal compacta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal de control (reinforcement learning); pesos exportados a ONNX. Arquitectura interna no detallada |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); observación de 61 dimensiones por paso |
| Tipos de cuantización | no disponible; se distribuye como `policy.onnx` (probablemente FP32) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidad lingüística) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, anchura, tipo de activación). Lo que sí se documenta es el pipeline de entrenamiento: la tarea se identifica como `Mjlab-SockHeist6m-MicroDuck`, ejecutada sobre el framework **mjlab** (versión `mjlab-microduck 0.1.0`, commit `1efd853be`), un entorno de RL basado en MuJoCo para el robot microduck. El entrenamiento se realizó en el repositorio `StephenForte/microduck-challenges` (rama `main`, commit `eb0249b94`), con checkpoint `2700`, semilla `42` y `--env.scene.num-envs 4096` entornos paralelos, hasta un máximo de 3000 iteraciones del agente.

El modelo incluye la **normalización de observaciones horneada dentro del propio `policy.onnx`**, de modo que el consumidor debe alimentar observaciones en bruto (sin normalizar). El autor advierte explícitamente que el entrenamiento RL en GPU no es bit-reproducible entre máquinas: repetir el comando con la misma semilla produce una política "comparable", no idénticos pesos. No se documentan detalles sobre composición del dataset (no aplica, es RL en simulación), uso de RLHF/DPO (no aplica) ni innovaciones técnicas adicionales más allá del propio pipeline mjlab.

## Capacidades

- Control motor continuo de un robot cuadrúpedo microduck: genera 14 acciones de actuación a partir de 61 observaciones a 50 Hz.
- Política perpetua: mantiene la marcha de forma indefinida hasta recibir una orden de parada o sustitución.
- Despliegue directo en hardware mediante el daemon `robotctl` (`policy load <slot> ...`).
- Integración con el ecosistema de manifiestos de políticas microduck (esquema 2), lo que facilita el versionado y la carga en ranuras.
- Entrenada en simulación con 4096 entornos paralelos, lo que sugiere robustez frente a variaciones del entorno simulado (no confirmado en hardware real por falta de datos).
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modalities de visión/audio: es exclusivamente un controlador motor.

## Casos de uso

- **Demostración de marcha en robot microduck**: cargar la política en una ranura con `sudo robotctl policy load <slot> YellowDuckSweater/microduck-sock-heist-6m-run-1106-0944-11` para que el robot ejecute una marcha continua. Adecuado porque el artefacto está empaquetado exactamente para ese flujo.
- **Reproducción de experimentos de RL en robótica**: usar el comando documentado (`uv run train Mjlab-SockHeist6m-MicroDuck --env.scene.num-envs 4096 ...`) para regenerar una política comparable y estudiar la sensibilidad a la semilla. Útil en docencia e investigación sobre reproducibilidad en RL.
- **Punto de partida para *fine-tuning* o *curriculum learning***: emplear el checkpoint `2700` como inicialización para tareas derivadas (por ejemplo, transportar objetos distintos del calcetín) dentro de `microduck-challenges`.
- **Pruebas de integración del daemon `robotctl`**: validar el flujo de carga de políticas, el esquema 2 de manifiestos y la normalización horneada en un entorno controlado antes de desplegar políticas más críticas.
- **Benchmark interno de controladores**: comparar esta política con otras ejecuciones del mismo autor (por ejemplo, `microduck-sock-heist-6m-run-1105-0954-004`) o con `lphatnguyen/microduck-sock-heist-6m` para medir estabilidad y velocidad de marcha.
- **Investigación en sim-to-real**: evaluar la transferencia de una política entrenada en mjlab/MuJoCo a un microduck físico, midiendo deriva y fallos de la marcha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible; el repositorio ocupa 0.0 GB y el artefacto es un único `policy.onnx`, por lo que se espera un consumo muy bajo (probablemente inferior a 1 GB), aunque no se confirma.
- **GPU recomendadas**: no se especifican. Para el entrenamiento se usó RL en GPU con 4096 entornos paralelos, lo que requiere una GPU de datacenter (A100/H100) o al menos una GPU consumer de gama alta con suficiente memoria; no se detalla el modelo exacto.
- **Compatibilidad con GPU consumer**: probable para inferencia dado el tamaño reducido del artefacto, pero no confirmado.
- **Opciones de despliegue**: el flujo documentado es el daemon `robotctl` del microduck, que carga `policy.onnx`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a robótica).
- **Latencia y throughput**: la política opera a 50 Hz (20 ms por paso de control); no se publican cifras de latencia de inferencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Observaciones / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `YellowDuckSweater/microduck-sock-heist-6m-run-1106-0944-11` | Política RL (ONNX) | Sock Heist (microduck) | 61 / 14 | 50 Hz | no disponible | Hugging Face |
| `YellowDuckSweater/microduck-sock-heist-6m-run-1105-0954-004` | Política RL | Sock Heist (microduck) | no disponible | no disponible | no disponible | Hugging Face |
| `lphatnguyen/microduck-sock-heist-6m` | Política RL | Sock Heist (microduck) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas políticas; la comparación se limita a procedencia y disponibilidad.

## Limitaciones y advertencias

- **Licencia no especificada**: no se indica licencia, por lo que el uso comercial queda en un limbo legal hasta que el autor la declare.
- **Sin información sobre sesgos**: al ser un controlador motor, los sesgos relevantes serían de comportamiento (por ejemplo, preferencia por una marcha concreta), no documentados.
- **Riesgo de fallo en hardware real**: entrenada en simulación (mjlab/MuJoCo); no hay evidencia publicada de transferencia sim-to-real ni de robustez ante perturbaciones físicas.
- **No reproducible bit a bit**: el propio autor advierte que el mismo comando y semilla producen pesos distintos; no debe tratarse como un artefacto determinista.
- **Documentación mínima**: la model card es muy escasa (una línea de descripción: "Should be faster"), sin detalles de arquitectura, métricas ni limitaciones.
- **Cero adopción**: 0 descargas y 0 likes en el momento de la consulta; sin validación por parte de la comunidad.
- **Ámbito restringido**: no es un modelo de lenguaje ni un modelo multimodal; no debe evaluarse con métricas tipo MMLU, HumanEval o GSM8K.
- **Dependencia de ecosistema**: requiere el daemon `robotctl` y el manifiesto de políticas microduck (esquema 2); fuera de ese stack no es directamente utilizable.

## Enlaces

- Hugging Face: https://huggingface.co/YellowDuckSweater/microduck-sock-heist-6m-run-1106-0944-11
- Repositorio de retos de entrenamiento: https://github.com/StephenForte/microduck-challenges
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas (referenciada en la model card): `docs/policy-manifest.md` en el repositorio del daemon
- Política relacionada (misma autora): https://huggingface.co/YellowDuckSweater/microduck-sock-heist-6m-run-1105-0954-004
- Política relacionada (otro autor): https://huggingface.co/lphatnguyen/microduck-sock-heist-6m
