# YellowDuckSweater/microduck-sock-heist-6m-run-1105-1706-6

## Resumen

`sock-heist-6m-run-1105-1706-6` es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo generativo multimodal, sino de un artefacto de robótica empaquetado en formato ONNX que mapea observaciones de 61 dimensiones a 14 acciones de control a una frecuencia de 50 Hz. Lo publica el usuario YellowDuckSweater en HuggingFace con la librería `microduck` y el pipeline `robotics`.

El modelo implementa una política perpetua, es decir, un patrón de marcha (gait) que se ejecuta de forma continua hasta que el operador lo detiene o lo sustituye en una ranura de política del daemon `robotctl`. La model card indica explícitamente que es "más rápida" que otras variantes, aunque no aporta métricas cuantitativas de velocidad ni de recompensa. El entrenamiento se realizó con el entorno `Mjlab-SockHeist6m-MicroDuck` del repositorio `microduck-challenges`, usando 4096 entornos paralelos, 2500 iteraciones máximas y la semilla 13, con un checkpoint final en la iteración 1900.

La relevancia de esta ficha es limitada para el público habitual de modelos de IA generativa, pero es útil como ejemplo de artefacto de RL para robótica empaquetado con un manifiesto estandarizado y un normalizador de observaciones embebido en el propio ONNX, lo que simplifica el despliegue en hardware real. El repositorio ocupa 0.0 GB según HuggingFace, lo que sugiere un tamaño muy reducido, coherente con una política de red neuronal pequeña.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para RL (arquitectura interna no especificada); empaquetada como ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX, presumiblemente FP32) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, anchura, tipo de activación ni si emplea LSTM, MLP o transformer). Lo que sí se documenta es la interfaz: entrada de 61 dimensiones (observación del robot) y salida de 14 dimensiones (acciones), ejecutada a 50 Hz. El normalizador de observaciones está embebido dentro del propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo sin preprocesar. El manifiesto sigue el esquema 2 descrito en `docs/policy-manifest.md` del repositorio del daemon.

El entrenamiento se realizó con `mjlab` (versión base `mjlab-microduck 0.1.0 @ 1efd853be`) sobre el task `Mjlab-SockHeist6m-MicroDuck`, del repositorio `microduck-challenges` en la rama `main`, commit `7b94efa2b`. Se lanzaron 4096 entornos en paralelo con un máximo de 2500 iteraciones, semilla 13 y logging a TensorBoard bajo el nombre de ejecución `run-1105-1706-6`; el checkpoint publicado corresponde a la iteración 1900. La model card advierte que el entrenamiento con RL en GPU no es bit-reproducible entre máquinas: repetir el comando con el mismo `uv.lock` y la misma semilla produce una política comparable, no los mismos pesos. No se especifican el algoritmo de RL concreto (PPO, SAC, etc.), la función de recompensa ni la composición del dataset de entrenamiento más allá del propio simulador.

## Capacidades

- Generación de patrones de marcha (gait) para el robot cuadrúpedo microduck, con ejecución perpetua hasta recibir una orden de parada o sustitución.
- Control motor de 14 acciones a 50 Hz a partir de observaciones de 61 dimensiones.
- Normalización de observaciones integrada en el grafo ONNX, lo que elimina la necesidad de preprocesado externo.
- Compatibilidad con el daemon `robotctl` mediante carga en una ranura de política (`robotctl policy load <slot> ...`).
- Reproducibilidad del pipeline de entrenamiento documentada (código, commit, `uv.lock`, comando y semilla).
- No dispone de capacidades de lenguaje, visión, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Despliegue de una marcha base en el microduck físico: cargar la política en una ranura del daemon con `robotctl policy load` y dejar que el robot camine de forma continua en tareas de locomoción simple.
- Comparación de políticas de locomoción: al ser una variante etiquetada como "faster", sirve como referencia para medir velocidad y estabilidad frente a otras políticas del mismo repositorio o de otros autores.
- Investigación en RL para robótica: el pipeline reproducible (commit, semilla, número de entornos) permite replicar el experimento y estudiar la variabilidad entre ejecuciones.
- Docencia y prototipado: el formato ONNX con normalizador embebido y manifiesto estandarizado facilita integrar la política en simuladores o en cadenas de validación sin depender del framework de entrenamiento.
- Base para fine-tuning o curriculum: al estar entrenada sobre el task `Mjlab-SockHeist6m-MicroDuck`, puede servir como inicialización para variantes con obstáculos, cargas o terrenos distintos.
- Validación de infraestructura de despliegue: útil para probar el flujo completo de `robotctl`, carga de políticas y ejecución a 50 Hz antes de desplegar políticas propias en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye la etiqueta cualitativa "Faster" sin cifras de velocidad, recompensa media, tasa de caídas ni comparación numérica con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y una política de 61 a 14 dimensiones es típicamente de pocos miles de parámetros, por lo que la huella debería ser inferior a unos pocos MB en FP32.
- GPU recomendadas: no disponible. Para el entrenamiento se usaron 4096 entornos paralelos, lo que sugiere GPU de datacenter (A100/H100 o similar), pero no se especifica el hardware exacto.
- Cabe en GPU de consumo: muy probablemente sí, dada la reducida dimensionalidad de entrada y salida, aunque no hay confirmación oficial.
- Opciones de despliegue: ONNX Runtime (formato nativo), o el daemon `robotctl` del ecosistema microduck. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: la política está diseñada para ejecutarse a 50 Hz (20 ms por paso), pero no se publican mediciones reales de latencia ni de throughput en hardware concreto.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sock-heist-6m-run-1105-1706-6` | Política RL para microduck (ONNX) | 61 / 14 | 50 Hz | no disponible | HuggingFace, 0 descargas |
| Otras políticas `microduck-sock-heist-*` del mismo autor | Política RL para microduck | 61 / 14 (presumible) | 50 Hz (presumible) | no disponible | no verificado en la información disponible |
| Políticas de referencia del repo `microduck-challenges` | Política RL para microduck | no disponible | no disponible | no disponible | GitHub |

No se dispone de datos numéricos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La licencia no está declarada, lo que impide determinar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- No hay métricas publicadas de robustez (tasa de caídas, recuperación ante perturbaciones, comportamiento en terrenos no vistos), por lo que la etiqueta "Faster" no está respaldada cuantitativamente.
- El entrenamiento no es bit-reproducible: mismos comandos y semilla producen pesos distintos, lo que complica auditorías y comparaciones exactas.
- El modelo está acoplado a la interfaz del microduck (61 observaciones, 14 acciones, 50 Hz) y al esquema 2 del manifiesto; cambios en el daemon o en la definición de observaciones pueden invalidar la política.
- No es un modelo de lenguaje: no procesa texto, no razona simbólicamente y no soporta tool calling ni agentes; cualquier expectativa en ese sentido es un error de categoría.
- La model card no documenta sesgos, alucinaciones ni riesgos de seguridad física; en robótica, una política perpetua sin mecanismos de parada a nivel de modelo exige supervisión y límites de seguridad en el daemon.
- El repositorio aparece con 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por terceros.

## Enlaces

- HuggingFace: https://huggingface.co/YellowDuckSweater/microduck-sock-heist-6m-run-1105-1706-6
- Repositorio de retos y entrenamiento: https://github.com/StephenForte/microduck-challenges
- Proyecto microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (referenciado en la model card, sin URL directa disponible)
