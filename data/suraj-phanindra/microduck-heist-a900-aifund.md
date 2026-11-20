# suraj-phanindra/microduck-heist-a900-aifund

## Resumen

El modelo `suraj-phanindra/microduck-heist-a900-aifund` es un checkpoint de política de refuerzo (reinforcement learning) entrenado para el robot cuadrúpedo de código abierto microduck de Pollen Robotics. Se trata del checkpoint 900 de una ejecución PPO denominada "heistA", basada en la receta `Mjlab-SockHeist6m-MicroDuck` del repositorio `pollen-robotics/microduck_rl`, ejecutada con 4096 entornos paralelos. Es hermano del checkpoint 999 publicado como `heist-ppo1-aifund`.

No es un modelo de lenguaje: es una política de control motor que mapea observaciones de 61 dimensiones a 14 acciones de control, ejecutándose a 50 Hz. Su formato de distribución es ONNX, con el normalizador de observaciones embebido en el propio grafo, de modo que el robot puede alimentarlo con observaciones en bruto sin preprocesado adicional.

Su relevancia es de nicho: sirve como ejemplo de despliegue de políticas RL en robótica de bajo coste con el stack de microduck, y como referencia para quienes replican recetas de entrenamiento PPO con Mjlab. El repositorio no contiene pesos en safetensors ni información sobre licencia, idiomas o benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de reinforcement learning (PPO) exportada a ONNX; arquitectura de red no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 dimensiones |
| Tipos de cuantizacion | no disponible (distribución en ONNX, sin variantes GGUF) |
| Idiomas soportados | no aplica (modelo de control robótico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` con esquema 2 del manifiesto de políticas de microduck |

## Arquitectura y entrenamiento

La política se entrenó con PPO (Proximal Policy Optimization) sobre la receta `Mjlab-SockHeist6m-MicroDuck` del repositorio `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`), con 4096 entornos simulados en paralelo. El entorno de entrenamiento es una tarea de tipo "heist" con un horizonte de episodio de 6 millones de pasos según la nomenclatura de la receta. El checkpoint publicado corresponde al paso 900 de la ejecución "heistA".

La política es de tipo perpetuo: no tiene condición de terminación aprendida y se ejecuta de forma continua hasta que el operador la detiene. La arquitectura interna de la red no se detalla en la model card; solo se especifica la interfaz: 61 dimensiones de observación como entrada y 14 acciones como salida, a una frecuencia de 50 Hz. El normalizador de observaciones está embebido en el grafo ONNX, lo que elimina la necesidad de replicar la normalización en el lado del robot. No se documentan datos de entrenamiento, composición del dataset, ni técnicas de ajuste posteriores (RLHF/DPO no aplican a este dominio).

## Capacidades

- Control motor continuo de un robot cuadrúpedo microduck mediante política RL.
- Locomoción perpetua: la política no termina por sí sola y mantiene la marcha hasta que se le indica lo contrario.
- Interfaz de observación de 61 dimensiones y 14 acciones a 50 Hz.
- Normalización de observaciones integrada en el modelo ONNX, permitiendo alimentar observaciones en bruto.
- Carga en el robot mediante el comando `robotctl policy load <slot> suraj-phanindra/microduck-heist-a900-aifund`.
- Compatibilidad con el manifiesto de políticas de microduck (esquema 2).
- No soporta tool calling, agentes, multilingüismo ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Despliegue de marcha en un microduck físico: cargar la política en una ranura del daemon con `robotctl` y ejecutar la locomoción en bucle para pruebas de hardware.
- Comparación de checkpoints en una misma receta: al ser el paso 900 de la misma ejecución que el checkpoint 999 (`heist-ppo1-aifund`), permite evaluar la evolución del rendimiento de la política entre pasos de entrenamiento.
- Validación del pipeline de exportación ONNX: sirve como referencia de que el normalizador embebido y el manifiesto de esquema 2 funcionan en el stack de microduck.
- Docencia y experimentación en RL robótico: ejemplo reproducible de entrenamiento PPO con Mjlab y 4096 entornos paralelos sobre un robot de bajo coste.
- Pruebas de integración del daemon de políticas: verificar la carga, el ciclo de control a 50 Hz y la gestión de ranuras de política en el robot.
- Base para ajuste fino o continuación de entrenamiento: el checkpoint puede reutilizarse como punto de partida en la receta `Mjlab-SockHeist6m-MicroDuck` para experimentos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB, lo que sugiere un modelo ONNX muy ligero apto para hardware embebido.
- GPU recomendadas: no disponible; por el tipo de política y el formato ONNX, es probable que se ejecute en la CPU del propio robot o en hardware de borde, pero no se confirma en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: el stack nativo de microduck mediante `robotctl policy load` y el runtime ONNX. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: la política está diseñada para ejecutarse a 50 Hz (periodo de 20 ms por paso de control); no se publican mediciones de latencia reales.

## Comparativa con modelos similares

| Modelo | Tipo | Observaciones / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-heist-a900-aifund (este) | Política RL PPO, ONNX | 61 / 14 | 50 Hz | no disponible | Hugging Face |
| heist-ppo1-aifund (checkpoint 999) | Política RL PPO, ONNX | 61 / 14 | 50 Hz | no disponible | Hugging Face |
| Otras políticas del ecosistema microduck | Políticas RL para el mismo robot | no disponible | no disponible | no disponible | Repositorio `pollen-robotics/microduck_rl` |

No se dispone de datos de rendimiento comparado entre estos checkpoints en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de control robótico, no un modelo de lenguaje: no genera texto, no razona y no responde a instrucciones en lenguaje natural.
- No se especifica licencia, lo que impide determinar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue en producción.
- No hay información sobre sesgos, pero la política puede comportarse de forma insegura fuera de la distribución de entrenamiento (terrenos, cargas o perturbaciones no vistas en simulación).
- El checkpoint 900 no es el final de la ejecución (el 999 es el hermano publicado); puede presentar un rendimiento inferior al checkpoint final de la misma receta.
- No se documentan métricas de robustez, tasa de caídas ni evaluación en hardware real.
- La política es perpetua: requiere supervisión y un mecanismo externo de parada, ya que no termina por sí sola.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria ni resultados reproducidos por terceros.
- Depende del stack específico de microduck (`robotctl`, manifiesto de esquema 2) y del robot físico para su uso previsto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suraj-phanindra/microduck-heist-a900-aifund
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck
