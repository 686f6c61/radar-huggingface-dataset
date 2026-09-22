# ZachGarner/microduck-headstand-backroll

## Resumen

ZachGarner/microduck-headstand-backroll es una política de control entrenada por aprendizaje por refuerzo (reinforcement learning) para el robot simulado MicroDuck, concretamente para la tarea `Mjlab-HeadstandBackrollLegsTogether-Flat-MicroDuck`. No es un modelo de lenguaje ni un modelo generativo: se trata de un artefacto de investigación en robótica que mapea observaciones del entorno simulado a acciones de articulaciones. El repositorio incluye el checkpoint original de PyTorch (`model_1999.pt`), una exportación ONNX con el normalizador de observaciones incluido (`policy.onnx`) y ficheros de trazabilidad (`provenance.json`, `evaluation.json`).

La política consume 61 valores de observación y produce 14 acciones de articulación. Según el autor, el checkpoint original superó 32 de 32 intentos individuales simulados con semilla 0 bajo el evaluador documentado, y el conjunto de seis políticas completó 87 de 96 intentos rutinarios agregando las semillas 0, 1 y 2. Son métricas de éxito en simulación, no de hardware real, y el propio autor advierte que no se ha probado en un robot físico.

Su relevancia es acotada y muy específica: sirve como referencia reproducible para investigacion en locomoción y acrobacias con patas (headstand, backroll, transferencias de contacto) dentro del ecosistema MuJoCo/mjlab y RSL-RL, y como ejemplo de exportación de políticas de RL a ONNX para integrarlas en pilas de inferencia. El repositorio tiene 0 descargas y 0 likes, sin licencia declarada y con un tamano de repo de 0.0 GB, lo que limita su uso como componente de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (política de RL entrenada con la libreria RSL-RL; topologia de red no especificada en la model card) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; entrada fija de 61 valores de observacion, salida de 14 acciones de articulacion |
| Tipos de cuantizacion | No disponible (se ofrece exportacion ONNX; no se documenta cuantizacion) |
| Idiomas soportados | No disponible / no aplica (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (`model_1999.pt`) y ONNX (`policy.onnx`, con normalizador de observaciones incluido) |

## Arquitectura y entrenamiento

La informacion publicada no detalla la arquitectura interna de la red (numero de capas, unidades por capa ni funcion de activacion). Lo que si se documenta es el marco de entrenamiento: una politica para la tarea `Mjlab-HeadstandBackrollLegsTogether-Flat-MicroDuck`, con checkpoints almacenados bajo la ruta `logs/rsl_rl/microduck_headstand_backroll_legs_together/wandb_checkpoints/ax1vgv8z/model_1999.pt`, lo que indica el uso de RSL-RL (la libreria de RL habitualmente empleada en Isaac Lab / mjlab) y seguimiento con Weights & Biases. El checkpoint evaluado es `model_1999.pt`, es decir, 2000 iteraciones de entrenamiento.

El sistema descrito por el autor implica mas de una politica en funcionamiento: la rutina usa transferencias basadas en contacto y una politica de mantenimiento de pie (standing) separada. La exportacion ONNX se genero mediante el exportador estandar del repositorio de entrenamiento e incorpora el normalizador de observaciones, lo que simplifica la integracion en runtimes externos. No se especifican el numero de tokens o pasos de entorno, la composicion del dataset (aqui, experiencia generada por simulacion) ni si se aplicaron tecnicas de RLHF/DPO, que en este dominio no aplican. La evaluacion de fuerzas de cabeza se muestrea a 50 Hz, lo que el propio autor senala que puede omitir impactos mas breves.

## Capacidades

- Control de politica continua: transforma 61 observaciones del entorno simulado en 14 acciones de articulacion para el robot MicroDuck.
- Ejecucion de una rutina acrobatica concreta (headstand con backroll y patas juntas) en simulacion MuJoCo/mjlab.
- Transferencias basadas en contacto entre fases de la rutina, apoyandose en una politica de standing independiente.
- Exportacion a ONNX con normalizador de observaciones incluido, lista para inferencia en runtimes compatibles.
- Trazabilidad de resultados: incluye `provenance.json` (run de origen, hashes, procedencia del codigo) y `evaluation.json` (informe de evaluacion individual).
- Reproducibilidad de la evaluacion: el checkpoint puede colocarse en la cache del evaluador para evitar la descarga desde W&B.
- No dispone de tool calling, function calling, agentes, capacidades multilingues, vision, audio ni modo de razonamiento: no es un modelo de lenguaje.

## Casos de uso

- Investigacion en control con RL para robotica con patas: usar el checkpoint y la exportacion ONNX como linea base reproducible en experimentos de acrobacias (headstand, backroll) dentro de MuJoCo/mjlab, comparando variantes de recompensa o de observaciones contra el 32/32 declarado en semilla 0.
- Evaluacion de algoritmos de RL: el repositorio permite fijar un objetivo medible (intentos rutinarios completados sobre 96 agregando semillas 0, 1 y 2) para comparar implementaciones de RSL-RL u otros entrenadores bajo el mismo evaluador.
- Pruebas de exportacion e integracion ONNX: `policy.onnx` incluye el normalizador, por lo que sirve para validar pipelines de inferencia ONNX Runtime en un caso de 61 entradas y 14 salidas, con requisitos de computo minimos.
- Estudio de transferencia sim-to-real: aunque no se ha probado en hardware, el artefacto es util para analizar que barreras aparecen al llevar una politica de contacto (transferencias basadas en contacto, fuerzas de cabeza) a un robot fisico.
- Docencia y formacion: ejemplo compacto y trazable de politica de RL con checkpoint, exportacion ONNX, hashes y evaluacion, adecuado para practicas de robotica simulada.
- Reproduccion y auditoria de resultados: los ficheros `provenance.json` y `evaluation.json` permiten verificar hashes y reproducir el informe de evaluacion sin depender de W&B.
- Construccion de ensembles o rutinas multipolitica: la tarea requiere una politica de standing separada, de modo que el modelo sirve como pieza dentro de una composicion de politicas con handovers por contacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible; no aplican a este tipo de artefacto. Los unicos datos de rendimiento son los del evaluador del autor, que se recogen a continuacion tal como se describen en la model card:

| Evaluacion | Resultado | Condiciones |
|---|---|---|
| Checkpoint original `model_1999.pt` | 32 de 32 intentos individuales simulados superados | Semilla 0, evaluador documentado |
| Agregado de seis politicas | 87 de 96 intentos rutinarios completados | Semillas 0, 1 y 2 |
| Exportacion ONNX | No se reportan recuentos de rollout | Los recuentos publicados se midieron con el checkpoint original |

Advertencia del autor recogida en la model card: estos numeros no establecen rendimiento en hardware ni exito desde poses iniciales arbitrarias. La comprobacion de exito de salida valida el standing final, no la forma de las patas durante toda la salida.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Dado que la interfaz es de 61 entradas y 14 salidas, la inferencia de la politica es muy ligera y, en la practica, puede ejecutarse en CPU o en cualquier GPU con pocos cientos de MB de memoria; esta cifra es una estimacion por la forma de E/S, no un dato publicado.
- GPU recomendadas: no especificadas por el autor. Para el entrenamiento (RSL-RL, mjlab/MuJoCo) es habitual requerir GPU de gama alta tipo RTX 4090, A100 o H100, pero no se documenta en la informacion disponible.
- GPU de consumo: la inferencia de la politica es viable en GPU de consumo e incluso en CPU; no se aportan mediciones. El cuello de botella realista es el simulador, no la red.
- Opciones de despliegue: ONNX Runtime para `policy.onnx` (entrada de 61 valores, salida de 14 acciones); PyTorch para `model_1999.pt`; simulacion mediante MuJoCo/mjlab y el evaluador del repositorio. vLLM, llama.cpp, Ollama o TGI no aplican a este modelo.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia ni de frecuencia de control; el unico dato temporal es que las muestras de fuerza de cabeza se toman a 50 Hz.
- Nota de integracion: el autor indica que se trata de artefactos de investigacion en simulacion y que no se proporciona manifiesto de runtime ni comando de instalacion en hardware.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (politicas de RL para MicroDuck o para tareas equivalentes de headstand/backroll), ni datos que permitan una comparacion de parametros, contexto, rendimiento o licencia. Los resultados de busqueda web recibidos no contienen informacion relacionada con este modelo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al tratarse de una politica entrenada en simulacion, cabe esperar sobreajuste a las condiciones del entorno de entrenamiento, pero no se aportan analisis de sesgo.
- Riesgo de sobreajuste al evaluador: el 32/32 se obtuvo con semilla 0 y bajo el evaluador documentado; el propio autor advierte que no implica exito desde poses iniciales arbitrarias.
- Sin validacion en hardware: no se ha probado en un robot fisico. No hay manifiesto de runtime ni comando de instalacion; no es un paquete de despliegue de daemon robotico.
- Dependencia de una politica de standing: la rutina emplea transferencias basadas en contacto y una politica de standing separada, por lo que el modelo no es autonomo por si solo.
- Muestreo de fuerzas a 50 Hz: puede omitir impactos mas breves que el periodo de muestreo.
- Criterio de exito limitado: la comprobacion de exito de salida valida el standing final, no la forma de las patas a lo largo de la salida.
- Licencia no disponible: la ausencia de licencia declarada impide asumir permisos de uso comercial o de redistribucion; hay que contactar con el autor antes de cualquier uso en produccion.
- Adopcion nula y trazabilidad limitada: 0 descargas y 0 likes, tamano de repo de 0.0 GB y arquitectura no documentada. El autor tampoco especifica la topologia de red ni el numero de parametros.
- Incoherencia de metadatos: la fecha de creacion indicada en HuggingFace (2026-09-22) es posterior a la fecha actual, lo que conviene verificar antes de citar el artefacto.
- Ambito de aplicacion restringido: no es un modelo de lenguaje y no ofrece tool calling, agentes, vision ni capacidades multilingues.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZachGarner/microduck-headstand-backroll
- Codigo de evaluacion, configuracion y resultados en bruto: https://github.com/zachgarner/microduck-headstand/tree/71ad395
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
