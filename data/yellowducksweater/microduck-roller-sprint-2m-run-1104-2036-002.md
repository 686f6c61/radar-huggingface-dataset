# YellowDuckSweater/microduck-roller-sprint-2m-run-1104-2036-002

## Resumen

`microduck-roller-sprint-2m-run-1104-2036-002` es una política de control entrenada por refuerzo (reinforcement learning) para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: es un controlador neuronal que recibe observaciones de 61 dimensiones del robot y emite 14 acciones a 50 Hz, pensado para ejecutarse sobre ruedas (rollers) en un bucle de control continuo. Lo publica el usuario YellowDuckSweater dentro del ecosistema de retos `microduck-challenges`.

La política se distribuye como un fichero `policy.onnx` con el normalizador de observaciones embebido, acompañado de un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck. Su rasgo distintivo es que es una política *perpetua*: no tiene condición de terminación, sino que genera una marcha continua hasta que el operador la descarga del slot de política del robot.

Es relevante en el contexto de robótica de bajo coste y simulación a realidad (sim2real), porque muestra el flujo completo de entrenamiento con mjlab (entorno de RL basado en MuJoCo) y despliegue directo en hardware mediante el daemon `robotctl`. El entrenamiento se realizó con 4096 entornos paralelos y 5000 iteraciones máximas, con semilla 0 y checkpoint 500.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal de RL (red feed-forward, detalles de capas no disponibles) exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |
| Frecuencia de control | 50 Hz |
| Acciones | 14 |
| Observaciones | 61 |
| Entorno de entrenamiento | mjlab (MuJoCo), task_id `Mjlab-RollerSprint2m-MicroDuck` |
| Checkpoint | 500 |
| Semilla | 0 |
| Tamaño del repo | 0.0 GB |

## Arquitectura y entrenamiento

La política se entrenó con aprendizaje por refuerzo en mjlab, un entorno de RL construido sobre MuJoCo, usando la tarea `Mjlab-RollerSprint2m-MicroDuck` del repositorio `microduck-challenges`. El entrenamiento empleó 4096 entornos simulados en paralelo, hasta 5000 iteraciones del agente, semilla 0 y registro en TensorBoard bajo el nombre de ejecución `run-1104-2036-002`. La base del entorno fue `mjlab-microduck 0.1.0` en el commit `1efd853be`, y el código de entrenamiento corresponde al commit `6f801950b` de la rama `main`.

La política resultante es un controlador que mapea observaciones crudas de 61 dimensiones a 14 acciones articulares a 50 Hz. El normalizador de observaciones está integrado en `policy.onnx`, de modo que el despliegue no requiere preprocesado externo. La model card indica que el entrenamiento no es bit-reproducible entre máquinas: repetir el mismo comando con la misma semilla produce una política comparable, no idéntica. No se especifican detalles de la topología de la red (número de capas, anchura, función de activación) ni el número total de pasos de entrenamiento.

## Capacidades

- Control locomotor continuo del microduck sobre ruedas (rollers) a 50 Hz.
- Política perpetua: mantiene la marcha indefinidamente hasta que se descarga del slot.
- Consumo de observaciones crudas de 61 dimensiones con normalización embebida en el ONNX.
- Emisión de 14 acciones articulares por paso de control.
- Priorización de la velocidad como recompensa ("more reward on speed"), orientada a una marcha rápida.
- Despliegue directo en robot mediante el comando `robotctl policy load`.
- Integración con el manifiesto de políticas de microduck (esquema 2) para gestión de slots.

## Casos de uso

- Locomoción rápida en el microduck sobre superficies con rollers: la política está entrenada específicamente para maximizar velocidad, por lo que se usaría como marcha por defecto en pruebas de velocidad del robot.
- Demostración de sim2real en robótica de bajo coste: sirve para validar la transferencia de políticas entrenadas en mjlab/MuJoCo al hardware real mediante `robotctl`.
- Benchmarking de políticas en el ecosistema microduck-challenges: al ser una política perpetua y con semilla y commit documentados, permite comparar configuraciones de entrenamiento dentro del mismo reto.
- Investigación en RL con entornos masivamente paralelos: el flujo con 4096 entornos y 5000 iteraciones sirve como referencia reproducible (a nivel de configuración) para experimentos de control continuo.
- Pruebas de integración del daemon `robotctl`: la política se carga en un slot y permite verificar el pipeline de despliegue, el manifiesto y la frecuencia de control de 50 Hz.
- Base para ajuste fino o continuación de entrenamiento: al estar publicados el repositorio, el commit y el comando de entrenamiento, se puede partir de esta configuración para modificar la recompensa o el escenario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, velocidad alcanzada, tasa de caídas ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo es de 0.0 GB, lo que sugiere un modelo muy pequeño, pero no se confirma el número de parámetros.
- GPU recomendadas: no disponible para inferencia; para reentrenamiento, el uso de 4096 entornos paralelos en mjlab requiere una GPU de datacenter (A100/H100) o equivalente, aunque no se especifica en la información.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño aparente del artefacto es plausible que la inferencia quepa en cualquier GPU de consumo o incluso en CPU, pero no hay dato oficial.
- Opciones de despliegue: ONNX Runtime mediante el daemon `robotctl` del microduck; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: control a 50 Hz (20 ms por paso); no se publican latencias medidas del ONNX.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas del mismo reto ni modelos comparables con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Licencia no especificada: no hay garantía de uso comercial; conviene contactar con el autor antes de integrarla en producto.
- Entrenada exclusivamente para el microduck sobre rollers; no se espera que funcione en otras morfologías o sin ruedas.
- Política perpetua sin condición de terminación: requiere supervisión y descarga manual del slot; no incorpora mecanismos de parada segura propios.
- Recompensa centrada en velocidad: puede priorizar rapidez sobre estabilidad o suavidad de la marcha; no se documentan métricas de robustez ante perturbaciones.
- No reproducible bit a bit: los pesos no se pueden regenerar exactamente a partir del comando de entrenamiento.
- Sin datos de evaluación en hardware real: no se documentan tasas de éxito sim2real ni condiciones de prueba.
- No es un modelo de lenguaje ni procesa texto: no admite tool calling, agentes ni capacidades multilingües.
- No se documentan sesgos, alucinaciones ni comportamiento fuera de distribución; el riesgo principal es el fallo físico del robot en condiciones no vistas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YellowDuckSweater/microduck-roller-sprint-2m-run-1104-2036-002
- Repositorio de retos de entrenamiento: https://github.com/StephenForte/microduck-challenges
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
