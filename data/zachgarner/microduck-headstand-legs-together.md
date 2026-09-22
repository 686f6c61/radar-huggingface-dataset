# ZachGarner/microduck-headstand-legs-together

## Resumen

`ZachGarner/microduck-headstand-legs-together` es una política de control entrenada por aprendizaje por refuerzo (RL) para el robot cuadrúpedo simulado `MicroDuck`, dentro del entorno `Mjlab-HeadstandKickupLegsTogether-Flat-MicroDuck`. No es un modelo de lenguaje ni un modelo fundacional: es un artefacto de investigación en robótica que resuelve una habilidad motora concreta, el "headstand kickup" (levantarse en vertical apoyándose en la cabeza) manteniendo las patas juntas, partiendo de una postura tumbada en un plano.

El autor, ZachGarner, publica el checkpoint original entrenado (`model_1499.pt`) junto con una exportación a ONNX (`policy.onnx`) que incluye el normalizador de observaciones dentro del grafo. La interfaz es explícita: 61 valores de observación como entrada y 14 acciones articulares como salida. El autor indica que el checkpoint original superó 32 de 32 intentos individuales simulados con semilla 0, y que el conjunto de seis políticas completó 87 de 96 intentos de rutina en las semillas 0, 1 y 2.

Su relevancia es acotada pero clara para quien trabaja en locomoción y manipulación con patas: es un ejemplo reproducible de política de habilidad única exportada a un formato portable (ONNX), con evaluación publicada y trazabilidad de procedencia. No se publican número de parámetros, licencia, idiomas ni datos de entrenamiento detallados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control entrenada con RL y exportada a ONNX; la model card no especifica si es MLP, transformer u otra) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la entrada es un vector de 61 observaciones por paso) |
| Dimensionalidad de entrada | 61 valores de observacion |
| Dimensionalidad de salida | 14 acciones articulares |
| Tipos de cuantizacion | no disponible (se distribuye un `.pt` en precision de entrenamiento y un `.onnx`; no se documenta cuantizacion) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible (ni en los metadatos de HuggingFace ni en la model card) |
| Formato de pesos | PyTorch (`model_1499.pt`) y ONNX (`policy.onnx`) |
| Entorno de simulacion | `Mjlab-HeadstandKickupLegsTogether-Flat-MicroDuck` (MuJoCo) |
| Framework de entrenamiento | rsl_rl (se deduce de la ruta de checkpoints `logs/rsl_rl/...` indicada por el autor) |
| Ficheros incluidos | `model_1499.pt`, `policy.onnx`, `provenance.json`, `evaluation.json` |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-22 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura de la red. Lo que sí se documenta es el contrato de entrada/salida (61 observaciones → 14 acciones), que la política se entrena con RL para la tarea `HeadstandKickupLegsTogether` en el entorno `Mjlab` sobre `MicroDuck`, y que la exportación a ONNX se realiza mediante el exportador estándar del repositorio de entrenamiento. El export incluye el normalizador de observaciones como parte del grafo, lo que evita tener que replicar la normalización fuera del modelo en tiempo de inferencia.

No se publican el número de tokens o muestras de entrenamiento, la composición del dataset (generado por simulador), ni si se aplicaron técnicas de ajuste fino tipo RLHF o DPO (no aplicables en este dominio). Tampoco se detallan hiperparámetros, semillas de entrenamiento ni la arquitectura interna. La única innovación técnica descrita es de tipo metodológico: la rutina emplea traspasos de apoyo basados en contacto y una política de mantenimiento de pie separada, además del chequeo de éxito al salir, que evalúa la postura final y no la forma de las patas durante toda la transición. Las muestras de fuerza en la cabeza se toman a 50 Hz y pueden perder impactos más cortos.

## Capacidades

- Control motor de un cuadrúpedo simulado para ejecutar un "kickup" a vertical apoyado en la cabeza, con las patas juntas.
- Salida de 14 acciones articulares continuas a partir de 61 observaciones, apta para bucles de control de baja dimensionalidad.
- Normalización de observaciones integrada en el grafo ONNX, lo que simplifica el despliegue en runtimes ONNX.
- Ejecución de la rutina completa junto con otras cinco políticas del mismo proyecto (87 de 96 intentos completados en semillas 0, 1 y 2).
- Integración con la rutina de traspaso por contacto y con una política de mantenimiento de pie independiente (no incluida como parte de este artefacto).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No tiene modo "thinking", visión, audio ni generación de texto.

## Casos de uso

- Investigación en locomoción de cuadrúpedos: usar la política como referencia reproducible para estudiar cómo se resuelve una maniobra de incorporación a vertical desde postura tumbada, con un contrato de observaciones bien definido.
- Línea base de comparación interna: al publicar el checkpoint evaluado y su export ONNX, sirve como punto de partida contra el que medir variantes propias de la misma tarea (distintos conjuntos de recompensas, distintas semillas).
- Evaluación de robustez y currículos: el autor reporta resultados por semilla (32/32 en semilla 0; 87/96 agregado de seis políticas en tres semillas), lo que permite reproducir y ampliar el barrido de evaluación.
- Punto de partida para transferencia sim-to-real: la política está entrenada en MuJoCo y no se ha probado en hardware físico; puede usarse como inicialización para experimentos de adaptación, asumiendo el salto de dinámica.
- Docencia y demostraciones en simulación: el ONNX con normalizador incluido permite montar una demo autocontenida en MuJoCo sin depender del pipeline de entrenamiento completo.
- Pruebas de latencia de runtimes de inferencia: al ser un modelo pequeño con entrada de 61 valores y salida de 14, es útil para medir coste por paso en ONNX Runtime, TensorRT u otros, en bucles de control con muestreo a 50 Hz.
- Validación de exportadores: el par `model_1499.pt` / `policy.onnx` permite comprobar la equivalencia numérica entre el checkpoint original y la exportación, incluida la normalización embebida.
- Reutilización del normalizador: el grafo ONNX incluye el normalizador de observaciones, de modo que un equipo puede integrar la política en un stack de control propio sin reimplementar esa fase.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible en el sentido habitual (MMLU, HumanEval, GSM8K u otros). Lo que sí se publica es una evaluación específica en simulación:

| Evaluacion | Condicion | Resultado |
|---|---|---|
| Intentos individuales simulados | Checkpoint original `model_1499.pt`, semilla 0 | 32 de 32 exitos |
| Intentos de rutina completados | Conjunto de seis politicas, semillas 0, 1 y 2 | 87 de 96 intentos completados |
| Evaluacion de la exportacion ONNX | `policy.onnx` | No se publican recuentos de rollout; el autor indica que los recuentos publicados se midieron con el checkpoint original |
| Rendimiento en robot fisico | No probado en hardware | no disponible |

El autor advierte explícitamente de que el 32/32 no establece rendimiento en hardware ni éxito desde posturas iniciales arbitrarias. Las muestras de fuerza en la cabeza se toman a 50 Hz y pueden no capturar impactos más breves, y el chequeo de éxito de salida evalúa la postura final, no la forma de las patas durante toda la transición.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El autor no publica el número de parámetros ni el tamaño del fichero de pesos; el repositorio completo figura como 0.0 GB, lo que sugiere un artefacto muy pequeño, pero no es un dato confirmado.
- GPU recomendadas: no disponibles. No se documenta ningún requisito de GPU.
- Encaje en GPU de consumo: no confirmado por el autor. Por la dimensionalidad de entrada (61) y salida (14) y el tamaño declarado del repositorio, es esperable que cualquier equipo con ONNX Runtime pueda ejecutarlo, incluido CPU, pero esto es una inferencia y no un dato publicado.
- Opciones de despliegue: ONNX Runtime para `policy.onnx`; PyTorch y el ecosistema rsl_rl para `model_1499.pt`; MuJoCo como simulador de la tarea. No se proporciona manifiesto de runtime ni comando de instalación en hardware.
- Latencia y throughput: no disponibles. El único parámetro temporal documentado es que las muestras de fuerza se toman a 50 Hz en la evaluación.
- Nota importante: el autor describe estos artefactos como material de investigación en simulación, no como un paquete instalable en un robot.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. No se identificaron en la búsqueda web modelos equivalentes con métricas publicadas (los resultados de búsqueda devueltos no guardan relación con el modelo). La comparación se limita a lo declarado por el propio autor.

| Criterio | Este modelo | Alternativas comparables |
|---|---|---|
| Parametros | no disponible | no disponible |
| Contexto | no aplica (entrada de 61 observaciones) | no disponible |
| Rendimiento | 32/32 en semilla 0 (checkpoint original); 87/96 en tres semillas para el conjunto de seis politicas | no disponible |
| Licencia | no disponible | no disponible |
| Disponibilidad | Pesos en HuggingFace (`.pt` y `.onnx`) con informe de evaluacion y procedencia | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución; conviene contactar con el autor antes de cualquier uso en producción.
- No probado en robot físico: la model card indica explícitamente que el artefacto no ha sido validado en hardware y que no se incluye manifiesto de runtime ni comando de instalación.
- Brecha sim-to-real: la política se entrena en MuJoCo sobre un plano (`Flat`) y no se caracteriza su robustez frente a fricción, holguras, latencias o dinámica de actuadores reales.
- Alcance de la evaluación: 32/32 en semilla 0 no implica éxito desde posturas iniciales arbitrarias ni en otras condiciones del entorno.
- Dependencia de la rutina completa: la maniobra usa traspasos basados en contacto y una política de mantenimiento de pie separada, que no forma parte de este artefacto; ejecutar solo esta política no reproduce la rutina completa.
- Limitación de muestreo: las muestras de fuerza en la cabeza se toman a 50 Hz y pueden perder impactos más cortos.
- Métrica de éxito parcial: el chequeo de salida evalúa la postura final y no la forma de las patas durante toda la transición.
- Falta de reproducibilidad completa: no se publican arquitectura, número de parámetros, hiperparámetros, semillas de entrenamiento ni composición de datos, aunque sí hashes y procedencia del código.
- Sesgos: no aplican sesgos lingüísticos ni sociales, pero sí un posible sesgo de simulación (dinámica, fricción y actuadores del entorno de entrenamiento) que no está cuantificado.
- Riesgo de alucinación: no aplica (no genera texto); el riesgo equivalente es la ejecución de una maniobra fuera de la distribución de estados para la que fue entrenada, con posible fallo físico si se trasladara a hardware.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZachGarner/microduck-headstand-legs-together
- Código de evaluación, configuración y resultados en bruto: https://github.com/zachgarner/microduck-headstand/tree/71ad395
- Paper: no disponible
- Blog o documentación adicional del autor: no disponible
- Demo interactiva: no disponible
- Resultados de la búsqueda web: no se encontraron enlaces relevantes; los resultados devueltos correspondían a FamilySearch y no guardan relación con el modelo.
