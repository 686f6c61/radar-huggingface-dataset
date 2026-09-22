# ZachGarner/microduck-headstand-fold

## Resumen

Microduck headstand: fold es una politica de control (policy) entrenada mediante aprendizaje por refuerzo para una tarea de acrobacia cuadrupeda denominada `Mjlab-HeadstandFold-Flat-MicroDuck`. No es un modelo de lenguaje ni un modelo fundacional: es un artefacto de investigacion en simulacion que mapea un vector de 61 observaciones a 14 acciones articulares, publicado por el usuario ZachGarner junto con el checkpoint original de entrenamiento (`model_1000.pt`) y una exportacion ONNX (`policy.onnx`) que incorpora el normalizador de observaciones.

El problema que resuelve es la ejecucion de una rutina de "headstand with fold" sobre un robot cuadrupedo simulado. Segun la model card, el checkpoint original supero 32 de 32 intentos individuales simulados con semilla 0 bajo el evaluador documentado, y el conjunto de seis politicas completo 87 de 96 intentos rutinarios agregando las semillas 0, 1 y 2. La rutina emplea transferencias de peso basadas en contacto y una politica de mantenimiento erguido (standing) separada.

Su relevancia es acotada y muy especifica: sirve como referencia reproducible para investigacion en locomocion y control con RL, para validar exportadores a ONNX y para comparar evaluadores. El autor advierte explicitamente que son artefactos de investigacion en simulacion, sin manifiesto de ejecucion ni comando de instalacion en hardware, y que no se ha probado en un robot fisico. El repositorio no registra descargas ni valoraciones, y la licencia no esta declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No documentada de forma explicita. La ruta del checkpoint (`logs/rsl_rl/microduck_headstand_fold/...`) apunta al framework RSL-RL, aunque la arquitectura concreta de la red no se detalla en la informacion disponible |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje). Entrada fija: 61 valores de observacion |
| Tipos de cuantizacion | No disponible. Se publica un grafo ONNX (`policy.onnx`); no se documentan variantes cuantizadas |
| Idiomas soportados | No aplica / no disponible |
| Licencia | No disponible |
| Formato de pesos | PyTorch (`.pt`) y ONNX (`.onnx`). La exportacion ONNX incluye el normalizador de observaciones |
| Dimension de entrada | 61 valores de observacion |
| Dimension de salida | 14 acciones articulares |
| Framework de entrenamiento | RSL-RL (inferido de la ruta del checkpoint en la model card) |
| Entorno de simulacion | MuJoCo / Mjlab, tarea `Mjlab-HeadstandFold-Flat-MicroDuck` |
| Tamano del repositorio | 0,0 GB (segun metadatos de HuggingFace) |
| Fecha de creacion (metadatos) | 2026-09-22 |
| Fecha de actualizacion (metadatos) | 2026-09-22 |

## Arquitectura y entrenamiento

La informacion publicada no describe la topologia de la red (numero de capas, unidades ocultas, tipo de activacion ni si existe critico separado). La unica evidencia estructural es la ruta del checkpoint, que referencia `rsl_rl`, la libreria de aprendizaje por refuerzo habitualmente empleada con entrenadores tipo PPO para politicas de control de robots. No se confirma en la model card el algoritmo exacto, el numero de pasos de entrenamiento ni el diseno de recompensas, mas alla del nombre del checkpoint (`model_1000.pt`) y del identificador de ejecucion `vorty4kb`.

Los datos de entrenamiento tampoco se detallan: no se especifica el numero de iteraciones, la composicion de las trayectorias ni si se aplicaron tecnicas adicionales como curriculum, domain randomization o destilacion. Lo que si se documenta es el procedimiento de evaluacion: 32 intentos individuales en simulacion con semilla 0 para el checkpoint original, y un agregado de 87 intentos exitosos sobre 96 en el conjunto de seis politicas a traves de las semillas 0, 1 y 2. La rutina combina transferencias de peso por contacto con una politica de standing independiente, y el exito se determina comprobando la posicion final erguida, no la forma de las patas durante toda la secuencia de salida.

Una innovacion practica relevante es la publicacion conjunta del checkpoint original y de una exportacion ONNX que integra el normalizador de observaciones, lo que evita reimplementar la normalizacion en el lado de inferencia. El repositorio incluye ademas `provenance.json` (ejecucion de origen, hashes y procedencia del codigo) y `evaluation.json` (informe individual de evaluacion), lo que facilita la trazabilidad del artefacto.

## Capacidades

- Control de robot cuadrupedo simulado: produce 14 acciones articulares a partir de 61 observaciones, sin bucle de lenguaje ni entrada de texto.
- Ejecucion de una rutina acrobatica especifica (headstand con plegado) iniciada desde las poses contempladas por el evaluador documentado.
- Transferencia de peso basada en contacto y encadenamiento con una politica de standing separada para completar la secuencia.
- Inferencia mediante ONNX: el grafo exportado puede ejecutarse con un runtime ONNX estandar sin dependencia del codigo de entrenamiento.
- Trazabilidad y reproducibilidad: se publican hashes, procedencia y el informe de evaluacion junto a los pesos.
- Evaluacion cuantificada: 32/32 intentos superados con semilla 0 para el checkpoint original; 87/96 intentos rutinarios agregados en seis politicas y tres semillas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues. No es un modelo de lenguaje.

## Casos de uso

- Investigacion en locomocion con aprendizaje por refuerzo: la politica sirve como punto de partida reproducible para estudiar maniobras acrobaticas de un cuadrupedo en MuJoCo, con un evaluador y unos resultados publicados que permiten comparaciones controladas.
- Validacion de exportadores a ONNX: al incluir `policy.onnx` con el normalizador integrado y el checkpoint PyTorch equivalente, es util para verificar que una cadena de exportacion reproduce el comportamiento del modelo original.
- Linea base en evaluacion de politicas: los 32/32 intentos con semilla 0 y los 87/96 agregados permiten usar esta politica como referencia frente a nuevas politicas entrenadas en la misma tarea.
- Experimentos de sim-to-real: el artefacto es adecuado para estudiar que barreras aparecen al trasladar una politica de simulacion a hardware, precisamente porque el autor advierte que no se ha probado en un robot fisico y no se aporta manifiesto de ejecucion.
- Destilacion o aprendizaje por imitacion: el checkpoint puede actuar como profesor para entrenar politicas mas simples o mas rapidas en la misma tarea de headstand.
- Docencia y demostraciones en simulacion: integrado en el evaluador del repositorio, permite ilustrar un pipeline completo de RL (entrenamiento, exportacion, evaluacion y registro de procedencia) sin necesidad de hardware.
- Pruebas de robustez y de criterios de exito: la distincion documentada entre comprobar solo el standing final y no la forma de las patas durante la salida lo convierte en un caso util para disenar metricas de evaluacion mas estrictas.

## Benchmarks y rendimiento

Los unicos datos de rendimiento disponibles son los de evaluacion en simulacion reportados por el autor. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros), que ademas no aplican a este tipo de artefacto.

| Metrica | Resultado | Condiciones |
|---|---|---|
| Intentos individuales superados (checkpoint original) | 32 de 32 | Semilla 0, evaluador documentado |
| Intentos rutinarios completados (conjunto de seis politicas) | 87 de 96 | Semillas 0, 1 y 2 agregadas |
| Rendimiento en hardware fisico | No evaluado | El autor indica que no se ha probado en un robot real |

El autor matiza que el resultado 32/32 no establece rendimiento en hardware ni exito desde poses iniciales arbitrarias, y que las politicas agregadas corresponden a seis politicas distintas, no a una sola. Los conteos de rollout publicados se midieron con el checkpoint original, no con la exportacion ONNX. Las muestras de fuerza en la cabeza se toman a 50 Hz, por lo que impactos mas breves pueden no registrarse.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,0 GB segun los metadatos, lo que indica un artefacto de tamano muy reducido.
- GPU recomendadas: no disponibles. Para un mapeo de 61 entradas a 14 salidas, la inferencia mediante ONNX Runtime es viable en CPU; no se documentan requisitos de GPU ni aceleracion especifica.
- Compatibilidad con GPU de consumo: no documentada explicitamente. Dado el tamano del artefacto y la ausencia de dependencias de gran modelo, no se anticipan barreras de memoria, aunque esto no esta confirmado por el autor.
- Opciones de despliegue: ONNX Runtime para `policy.onnx`; PyTorch para `model_1000.pt` mediante el evaluador del repositorio. No se proporciona manifiesto de ejecucion ni comando de instalacion en hardware.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo de inferencia ni de frecuencia de control alcanzable.
- Entorno de simulacion: MuJoCo / Mjlab, con el evaluador publicado en el repositorio de GitHub indicado en la model card.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en el material proporcionado. No se han identificado en la busqueda web alternativas de la misma tarea (`Mjlab-HeadstandFold-Flat-MicroDuck`) ni politicas equivalentes de otros autores con datos publicos de parametros, contexto o licencia que permitan una comparacion objetiva. Por tanto: no disponible.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion. Debe tratarse como artefacto de investigacion y aclararse los terminos con el autor antes de cualquier uso en produccion.
- No probado en robot fisico: el autor indica explicitamente que la rutina no se ha testeado en hardware; el exito en simulacion no implica exito en un cuadrupedo real.
- Sin manifiesto de ejecucion: no se suministra manifiesto de runtime ni comando de instalacion en hardware, por lo que no es un paquete desplegable tal cual.
- Ambito de evaluacion restringido: el resultado 32/32 corresponde a una unica semilla y al evaluador documentado; no garantiza exito desde poses iniciales arbitrarias.
- Criterio de exito laxo: la comprobacion de exito se limita al standing final y no valida la forma de las patas durante toda la secuencia de salida.
- Muestreo de fuerzas limitado: las muestras de fuerza en la cabeza se toman a 50 Hz y pueden omitir impactos mas breves.
- Agregacion de politicas: los 87/96 intentos corresponden al conjunto de seis politicas, no a esta politica de forma aislada.
- Diferencia entre artefactos: los conteos de rollout publicados se midieron con el checkpoint original, no con la exportacion ONNX, por lo que el rendimiento del grafo ONNX no esta cuantificado de forma independiente.
- Cero adopcion registrada: 0 descargas y 0 likes en HuggingFace, sin senales de uso externo ni validacion por terceros.
- Metadatos anomalos: las fechas de creacion y actualizacion (2026-09-22) son posteriores a la fecha habitual de referencia y no resultan coherentes; conviene verificar la vigencia del repositorio.
- Resultados de busqueda no pertinentes: las busquedas web realizadas devolvieron contenido sin relacion con el modelo (foros sobre seguros de automovil), por lo que no se ha podido contrastar informacion externa adicional.
- Sesgos y alucinacion: no aplica en el sentido habitual, al no ser un modelo generativo de texto; el riesgo equivalente es la generalizacion indebida de resultados de simulacion a escenarios no evaluados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZachGarner/microduck-headstand-fold
- Codigo de evaluacion, configuracion y resultados en bruto: https://github.com/zachgarner/microduck-headstand/tree/71ad395
- Ruta del checkpoint en la cache del evaluador: `logs/rsl_rl/microduck_headstand_fold/wandb_checkpoints/vorty4kb/model_1000.pt`
- Archivos incluidos en el repositorio: `model_1000.pt`, `policy.onnx`, `provenance.json`, `evaluation.json`
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
