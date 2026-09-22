# ZachGarner/microduck-headstand-switch

## Resumen

ZachGarner/microduck-headstand-switch es una politica de control entrenada por refuerzo para el entorno de simulacion `Mjlab-HeadstandSplitSwitch-Flat-MicroDuck`, dentro del repositorio de investigacion sobre el robot cuadrupedo MicroDuck. No es un modelo de lenguaje ni un modelo generativo: es un artefacto de investigacion en robotica que mapea 61 valores de observacion a 14 acciones articulares. Se distribuye tanto el checkpoint original de entrenamiento (`model_500.pt`) como una exportacion a ONNX (`policy.onnx`) que incluye el normalizador de observaciones.

La tarea consiste en un ejercicio de equilibrio invertido (headstand) con un conmutador entre dos posturas, una particion original y su version especular. La ranura de comando de velocidad frontal se reutiliza como bandera de postura: el valor 0 solicita la particion original y el valor 1 la reflejada, y el evaluador cambia esa bandera mientras el robot esta invertido. Ese detalle es relevante porque un manifiesto de ejecucion con comando constante no puede representar la secuencia completa, lo que limita el uso directo de la politica fuera del evaluador documentado.

El modelo acumula 0 descargas y 0 likes en HuggingFace y ocupa 0,0 GB en el repositorio. Su interes es acotado pero concreto: sirve como referencia reproducible para investigacion en control con RL, exportacion ONNX de politicas y evaluacion por semillas, siempre dentro de simulacion y sin que el autor afirme validez en hardware fisico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica de control entrenada con RL; se distribuye checkpoint y exportacion ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo Mixture of Experts) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; consume 61 observaciones por paso y produce 14 acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y checkpoint de PyTorch (`model_500.pt`) |
| Entorno de simulacion | `Mjlab-HeadstandSplitSwitch-Flat-MicroDuck` |
| Dimension de entrada | 61 observaciones |
| Dimension de salida | 14 acciones articulares |
| Fecha de creacion en HuggingFace | 2026-09-22 |
| Ultima actualizacion | 2026-09-22 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la topologia de red ni el numero de parametros. Se sabe que la politica se entreno con aprendizaje por refuerzo en el entorno `Mjlab-HeadstandSplitSwitch-Flat-MicroDuck`, gestionado con el flujo de trabajo de `rsl_rl` (la ruta de cache del evaluador remite a `logs/rsl_rl/microduck_headstand_splitswitch/wandb_checkpoints/whv1lcu7/model_500.pt`). El artefacto publicado corresponde al paso de entrenamiento 500 y fue evaluado sin modificaciones.

El repositorio incluye tres archivos auxiliares que aportan trazabilidad: `provenance.json` con la ejecucion de origen, hashes y procedencia del codigo; `evaluation.json` con el informe de evaluacion individual; y `policy.onnx`, exportado mediante el exportador estandar del repositorio de entrenamiento e integrando el normalizador de observaciones. La innovacion tecnica documentada no esta en la red, sino en la tarea: el uso de la ranura de comando de velocidad frontal como bandera de postura para alternar entre dos particiones mientras el robot esta invertido, con transiciones basadas en contacto y una politica de equilibrio independiente para la fase final.

## Capacidades

- Generacion de acciones de control continuo: transforma 61 observaciones en 14 comandos articulares para el robot MicroDuck en simulacion.
- Equilibrio invertido (headstand) sobre el entorno plano de Mjlab, con conmutacion entre dos configuraciones de particion.
- Ejecucion de una secuencia de cambio de postura mientras el robot esta invertido, mediante la bandera de postura en la ranura de comando de velocidad frontal.
- Transiciones de apoyo basadas en contacto con el suelo.
- Exportacion a ONNX con normalizador de observaciones incluido, lo que permite ejecutar la politica sin reimplementar el preprocesado.
- Reproducibilidad: evaluacion documentada por semilla e informe de resultados en `evaluation.json`.
- Trazabilidad de artefactos mediante hashes y procedencia de codigo en `provenance.json`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Investigacion en control con aprendizaje por refuerzo: la politica sirve como linea base reproducible para estudiar maniobras de equilibrio invertido en cuadrupedos, con un evaluador y un conjunto de semillas ya definidos.
- Reproduccion de experimentos: los archivos `provenance.json` y `evaluation.json` permiten reconstruir la ejecucion de origen y verificar hashes, lo que facilita auditorias y replicaciones en laboratorio.
- Evaluacion de robustez por semillas: el autor reporta que las seis politicas del proyecto completaron 87 de 96 intentos rutinarios en las semillas 0, 1 y 2, lo que ofrece un marco para medir varianza entre inicializaciones.
- Validacion de pipelines de exportacion ONNX: al incluir el normalizador de observaciones dentro del grafo, es un caso util para comprobar que un exportador estandar conserva el comportamiento del checkpoint original.
- Docencia en robotica y simulacion: un entorno de MuJoCo/Mjlab con una tarea acrobatica acotada resulta adecuado para practicas de despliegue de politicas entrenadas con RL.
- Pruebas de latencia de inferencia en entornos embebidos: el modelo puede cargarse con ONNX Runtime en CPU para medir coste de inferencia de una politica de 61 entradas y 14 salidas antes de plantear cualquier traslado a hardware.
- Comparacion de politicas hermanas: el proyecto publica seis politicas, por lo que puede usarse para estudiar como cambia el exito de la maniobra segun la particion solicitada y la semilla.
- Generacion de trayectorias sinteticas de contacto: en simulacion puede producir secuencias de apoyo y cambio de postura utiles como datos de referencia para analisis de fuerzas de cabeza, aunque el autor advierte que el muestreo a 50 Hz puede omitir impactos mas breves.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, dado que no se trata de un modelo de lenguaje. Los unicos datos de evaluacion disponibles son los del propio autor para la tarea de simulacion:

| Metrica | Resultado | Condiciones |
|---|---|---|
| Intentos individuales superados, checkpoint original | 32 de 32 | Semilla 0, evaluador documentado |
| Intentos rutinarios completados por las seis politicas | 87 de 96 | Semillas 0, 1 y 2 |
| Rendimiento en hardware fisico | no disponible | El autor indica que no se ha probado en un robot real |
| Exito desde poses iniciales arbitrarias | no disponible | No establecido por el autor |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio es de 0,0 GB y la politica mapea 61 entradas a 14 salidas, por lo que cabe previsiblemente en cualquier GPU consumer, aunque no se publican cifras.
- GPU recomendadas: no disponibles; el autor no especifica requisitos.
- Viabilidad en GPU consumer: no confirmada explicitamente, pero el modelo puede ejecutarse con ONNX Runtime en CPU, lo que hace innecesaria una GPU para inferencia.
- Opciones de despliegue: ONNX Runtime para `policy.onnx` y PyTorch para `model_500.pt`; el checkpoint debe colocarse en la cache del evaluador en `logs/rsl_rl/microduck_headstand_splitswitch/wandb_checkpoints/whv1lcu7/model_500.pt` para evitar la descarga desde W&B. No se proporciona manifiesto de ejecucion ni comando de instalacion en hardware.
- Latencia y throughput: no disponibles. El unico dato temporal publicado es que las muestras de fuerza en la cabeza se toman a 50 Hz y pueden omitir impactos mas cortos.
- Entorno de ejecucion: simulacion MuJoCo/Mjlab; no hay paquete de instalacion para un demonio de robot.

## Comparativa con modelos similares

No se dispone de comparativas con modelos de terceros en la informacion proporcionada. Como referencia interna del mismo proyecto, existen seis politicas entrenadas para la misma familia de tareas:

| Politica | Tarea | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-headstand-switch | Headstand con conmutacion de particion | no disponible | no aplica | 32/32 en semilla 0 | no disponible | HuggingFace y repositorio GitHub |
| Otras cinco politicas del proyecto | Variantes de headstand | no disponible | no aplica | 87/96 en conjunto, semillas 0, 1 y 2 | no disponible | Repositorio GitHub |

## Limitaciones y advertencias

- No se ha probado en un robot fisico: el propio autor indica que son artefactos de investigacion en simulacion y que no se incluye manifiesto de ejecucion ni comando de instalacion en hardware.
- El exito de 32 de 32 no implica rendimiento en hardware ni exito desde poses iniciales arbitrarias; el autor lo senala explicitamente.
- La bandera de postura cambia durante la maniobra, de modo que un manifiesto de ejecucion con comando constante no puede representar la secuencia completa.
- El exito al salir solo comprueba la posicion final de pie, no la forma de las patas a lo largo de la salida.
- El muestreo de fuerza en la cabeza a 50 Hz puede omitir impactos mas breves, lo que infravalora posibles eventos de contacto.
- La rutina emplea transiciones basadas en contacto y una politica de equilibrio independiente, lo que anade dependencias externas al artefacto.
- La exportacion ONNX se publica por separado y los recuentos de rollout publicados se midieron con el checkpoint original, no con el grafo ONNX.
- Licencia no disponible: no se puede confirmar si se permite uso comercial.
- Sesgos conocidos: no disponibles; la evaluacion se limita a las semillas 0, 1 y 2 y a un entorno plano concreto, sin estudio de generalizacion.
- Riesgo de alucinacion: no aplica, ya que no genera texto.
- Idiomas soportados: no aplica; el modelo no procesa lenguaje natural.
- Los datos de creacion y actualizacion del repositorio corresponden a 2026-09-22, con 0 descargas y 0 likes, por lo que no existe validacion independiente por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/ZachGarner/microduck-headstand-switch
- Codigo de evaluacion, configuracion y resultados en bruto: https://github.com/zachgarner/microduck-headstand/tree/71ad395
- Archivos del repositorio: `model_500.pt`, `policy.onnx`, `provenance.json`, `evaluation.json`
- Paper: no disponible
- Blog o demo: no disponible
