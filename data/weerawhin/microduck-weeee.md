# weerawhin/microduck-weeee

## Resumen

`weerawhin/microduck-weeee` es una política de control locomotor para el robot bípedo Microduck, no un modelo de lenguaje. La publica el usuario weerawhin en Hugging Face con las etiquetas `microduck`, `onnx`, `robotics` y `reinforcement-learning`, y se distribuye como un artefacto ONNX que se carga en una ranura de política del demonio `robotctl`. El modelo card la describe como una política «perpetua»: ejecuta una marcha de forma continua hasta que se le indique lo contrario.

La política consume observaciones de 61 dimensiones y produce 14 acciones a 50 Hz, que es el bucle de control típico del Microduck, un robot bípedo de 25 cm con 15 motores, cámara, LiDAR y pico prensil. El normalizador de observaciones está integrado en `policy.onnx`, de modo que el robot puede alimentar observaciones en bruto sin un preprocesado externo. El manifiesto `manifest.json` sigue el esquema 2 del manifiesto de políticas de Microduck.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de entrenamiento de locomoción con aprendizaje por refuerzo en el ecosistema Microduck, con código, commit, semilla y comando de entrenamiento documentados. No hay resultados de benchmarks, licencia declarada ni datos de rendimiento publicados, y el repositorio figura con 0.0 GB de tamaño, lo que conviene verificar antes de usarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal de aprendizaje por refuerzo exportada a ONNX; topología interna no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Dimensión de observación | 61 |
| Dimensión de acción | 14 |
| Frecuencia de control | 50 Hz (20 ms por paso) |
| Tipos de cuantización | no disponible; solo se documenta el artefacto ONNX |
| Idiomas soportados | no aplica / no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y manifiesto `manifest.json` (esquema 2) |
| Biblioteca / runtime | `microduck` (etiqueta de librería en Hugging Face); ejecución mediante `robotctl` |
| Tarea de entrenamiento | `Mjlab-Sprint2m-MicroDuck`, checkpoint 2000, semilla 1 |
| Tamaño del repositorio | 0.0 GB (según Hugging Face) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-18T15:53:29Z |
| Última actualización | 2026-10-18T15:53:35Z |

## Arquitectura y entrenamiento

El modelo card no detalla la topología de la red: solo indica que es una política entrenada con el paquete base `mjlab-microduck 0.1.0` (commit `8d0dbc94c`) dentro del repositorio `NIRUN-Weerawit/microduck-challenges`, rama `experiment/aten`, commit `47626a0b1`. El entrenamiento se lanzó el 2026-10-18T11:40:44Z con 10.000 entornos paralelos, un máximo de 3.000 iteraciones, semilla 1 y registro en TensorBoard bajo el nombre de ejecución `50-05-30`. El checkpoint publicado es el 2000.

El artefacto resultante es una política de locomoción que se ejecuta de forma indefinida, sin condición de terminación documentada, y que incluye el normalizador de observaciones dentro del propio grafo ONNX. No se especifican datos de entrenamiento (número de tokens o pasos, composición del dataset, recompensas, técnicas de RLHF o DPO), ni innovaciones de decodificación o atención, que no aplican a este tipo de modelo. El autor advierte que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con el mismo código, `uv.lock`, comando y semilla produce una política comparable, no los mismos pesos.

## Capacidades

- Generación de una marcha bípeda continua para el Microduck, mantenida hasta recibir una orden de parada.
- Control a 50 Hz con 14 acciones y observaciones proprioceptivas de 61 dimensiones.
- Normalización de observaciones integrada en el ONNX: acepta observaciones en bruto sin pipeline externo.
- Carga y sustitución en caliente mediante ranuras de política: `sudo robotctl policy load <slot> weerawhin/microduck-weeee`.
- Compatibilidad declarada con el esquema 2 del manifiesto de políticas de Microduck.
- Reproducibilidad del pipeline de entrenamiento documentada mediante repositorio, rama, commit, semilla y comando.
- No se documentan capacidades de lenguaje, tool calling, agentes, visión, audio ni razonamiento multi-paso.

## Casos de uso

- **Marcha por defecto en un Microduck físico**: cargar la política en una ranura con `robotctl policy load` y dejar que el robot camine de forma continua; es el uso directo que propone el autor.
- **Docencia e introducción a la robótica bípeda**: usar una política ya entrenada para que el alumnado observe el bucle observación-acción a 50 Hz sin tener que entrenar desde cero.
- **Línea base en investigación de RL para locomoción**: comparar nuevas políticas contra esta marcha en el mismo robot y el mismo runtime ONNX, con la ventaja de que el entrenamiento es reproducible de forma aproximada.
- **Validación de pipelines de despliegue**: probar el flujo `robotctl` + ranuras de política + manifiesto de esquema 2 antes de publicar políticas propias.
- **Pruebas de sim-to-real**: ejecutar la política en el robot y contrastar su comportamiento con el entorno de entrenamiento `Mjlab-Sprint2m-MicroDuck` para detectar caídas de rendimiento por diferencias de dinámica.
- **Controlador de bajo nivel en una arquitectura jerárquica**: emplear la marcha como capa de locomoción y añadir por encima un planificador que decida cuándo cargar o descargar la política.
- **Demostraciones e instalaciones robóticas**: una política perpetua es adecuada para exhibiciones en las que el robot debe moverse de forma continua sin intervención.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card no incluye métricas de recompensa, tasa de éxito, velocidad de marcha, robustez ante perturbaciones ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- La inferencia está pensada para ejecutarse en el propio Microduck; no se documentan requisitos de VRAM ni GPU.
- El tamaño del artefacto no se publica y el repositorio figura con 0.0 GB, por lo que no se puede estimar la huella del ONNX a partir de los datos disponibles.
- El bucle de control a 50 Hz impone un presupuesto de 20 ms por paso, incluida la inferencia ONNX y la comunicación con los motores.
- Despliegue documentado: `robotctl policy load <slot> weerawhin/microduck-weeee` sobre el demonio de Microduck; el runtime concreto de ONNX no se especifica.
- Entrenamiento: 10.000 entornos paralelos y hasta 3.000 iteraciones, lo que requiere infraestructura de GPU de cómputo; el modelo card no indica modelo de GPU, memoria ni duración.
- No aplican opciones de servido de modelos de lenguaje como vLLM, TGI, llama.cpp u Ollama.
- Throughput y latencia medidos: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Observación / acción | Frecuencia | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| `weerawhin/microduck-weeee` | Política RL para Microduck, ONNX | 61 / 14 | 50 Hz | no disponible | no disponible |
| `weerawhin/microduck-weee` | Política RL para Microduck (mismo autor) | no disponible | no disponible | no disponible | no disponible |
| Políticas de referencia del ecosistema Microduck | Políticas para el mismo robot | no disponible | no disponible | no disponible | no disponible |

No se dispone de parámetros, contexto, benchmarks ni condiciones de licencia de las alternativas, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No se declara licencia, por lo que el uso comercial queda en una situación jurídica indeterminada.
- El repositorio figura con 0.0 GB y cero descargas; conviene comprobar que `policy.onnx` y `manifest.json` están realmente presentes y son íntegros.
- No hay benchmarks ni métricas de robustez publicadas; se desconoce su comportamiento ante terrenos irregulares, empujes o cargas.
- El modelo card describe la política con una sola palabra («luck»), sin detalles sobre recompensas, currículo de entrenamiento ni criterios de parada.
- La política es perpetua y no documenta condiciones de terminación; en producción hace falta un supervisor externo que la descargue o la sustituya.
- El entrenamiento no es bit-reproducible: los pesos no se pueden regenerar de forma idéntica, solo aproximada.
- No es un modelo de lenguaje ni multimodal: no admite instrucciones en lenguaje natural, tool calling ni razonamiento; la cámara y el LiDAR del robot no se mencionan como entradas de la política.
- Posible brecha sim-to-real no cuantificada entre el entorno de entrenamiento y el robot físico.
- No se especifican los idiomas ni la documentación de la API de `robotctl` más allá de la referencia al repositorio del demonio.

## Enlaces

- [Hugging Face: weerawhin/microduck-weeee](https://huggingface.co/weerawhin/microduck-weeee)
- [Hugging Face: weerawhin/microduck-weee](https://huggingface.co/weerawhin/microduck-weee)
- [GitHub: pollen-robotics/microduck](https://github.com/pollen-robotics/microduck)
- [Pollen Robotics: Microduck](https://pollen-robotics.com/microduck/)
- [GitHub: NIRUN-Weerawit/microduck-challenges](https://github.com/NIRUN-Weerawit/microduck-challenges)
- [GitHub: AI-FanGe/Microduck-build-tutorial](https://github.com/AI-FanGe/Microduck-build-tutorial)
