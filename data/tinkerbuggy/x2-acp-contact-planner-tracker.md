# tinkerbuggy/x2-acp-contact-planner-tracker

## Resumen

`tinkerbuggy/x2-acp-contact-planner-tracker` es un paquete de políticas de control para el robot humanoide AgiBot X2 (variante Ultra, 1,31 m de altura), desarrollado por el usuario tinkerbuggy. Implementa una adaptación del método *Adaptive Contact Planning* (arXiv 2610.31608) al X2: un planificador de contactos basado en atención que selecciona los siguientes apoyos del pie a partir de un escaneo de altura del terreno, y un rastreador de cuerpo completo condicionado por esos contactos que genera consignas articulares. Ambos se entrenaron en tres etapas (tracking, co-entrenamiento del planificador con el annealing del paper y terrenos con objetivos) y se distribuyen como artefactos ONNX y NumPy listos para inferencia.

El interés del modelo es acotado pero específico: no es un modelo de lenguaje, sino un checkpoint de reinforcement learning para locomoción y loco-manipulación sobre terrenos con escaleras y rampas. El checkpoint publicado corresponde a la etapa 3, iteración 23.000 (`pair_s3_v2_023000`), y se acompaña del estado completo de entrenamiento y las recetas para reproducirlo. Todo el entrenamiento se realizó en simulación (MuJoCo), y el autor indica explícitamente que aún no se ha probado en el robot real.

La relevancia actual es la de un artefacto de investigación reproducible: incluye especificación de entradas/salidas (`adapter_card.json`), trazas de verificación (`obs_check.npz`), adaptadores de evaluación y el código del entrenador en un repositorio público. Su utilidad práctica depende de disponer de un pipeline de percepción que genere los mapas de altura que la política consume.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Planificador de contactos con atención (transformer) + rastreador de cuerpo completo condicionado por contactos; entrenamiento con PPO |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventanas de observación de 17x11 (planificador) y 9x7 (rastreador) escaneos de altura |
| Tipos de cuantizacion | no disponible (pesos ONNX y NumPy sin cuantizar documentada) |
| Idiomas soportados | no aplica (modelo de control robótico, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | `planner_attn.onnx` (ONNX) y `actor.npz` (pesos NumPy); checkpoint de entrenamiento `checkpoint/ckpt_023000.pt` (PyTorch) |

## Arquitectura y entrenamiento

El sistema se compone de dos redes que se ejecutan conjuntamente en despliegue. El planificador (`planner_attn.onnx`) es un módulo de atención que, a partir de un escaneo de altura de 17x11 celdas, selecciona los próximos contactos de los pies. El rastreador (`actor.npz`) es una política de cuerpo completo condicionada por los contactos planificados: consume un escaneo de 9x7 y la secuencia de contactos, y emite consignas articulares. El entrenamiento sigue el esquema del paper *Adaptive Contact Planning* en tres etapas: primero tracking, después co-entrenamiento del planificador con el annealing descrito en el artículo, y finalmente entrenamiento sobre terrenos con objetivos (goal terrains). Se usa PPO como algoritmo de optimización.

Los datos de entrenamiento no se incluyen en el repositorio. El autor cita como referencia de movimientos BONES-SEED (Bones Studio, obtenido de su dataset en Hugging Face) retargetizado al X2, más capturas de movimiento propias realizadas con Pico, publicadas en el repositorio `meetsitaram/terrain-park` (tomas en bruto en `data/2026-10-29` y `data/2026-10-30`, conjuntos retargetizados en `data/train_sets` y clips de estilo en `data/style`). Las definiciones de los conjuntos de clips están en `models/acp/code/cfg/`. El entrenamiento se ejecuta en MuJoCo Warp; la receta completa con todos los ajustes está en `models/acp/RECIPE.md` y el registro de ejecuciones en `models/<model>/LEDGER.md`.

## Capacidades

- Planificación de contactos de pies sobre terrenos irregulares a partir de escaneos de altura de 17x11.
- Control de cuerpo completo condicionado por contactos: genera consignas articulares para el humanoide X2 a partir de escaneos de 9x7 y la secuencia de contactos planificada.
- Locomoción sobre escaleras (hasta 20-21 cm en la ruta NIST), rampas y giros de 180 grados.
- Navegación por rutas con múltiples puntos de paso (22 puntos y 5 estaciones en el recorrido propio; 35 puntos en el NIST).
- Capacidad de generalización a semillas nuevas de evaluación (200 semillas frescas en la ruta propia).
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión ni tool calling: es una política de control motor.

## Casos de uso

- Locomoción de humanoides en entornos de competición: el modelo está evaluado sobre la réplica MuJoCo del aparato de loco-manipulación del IEEE Humanoid Challenge y el aparato NIST, por lo que sirve como base para preparar rutas con escaleras y rampas en simulación antes de transferir a hardware.
- Investigación en planificación de contactos: el par planificador/rastreador permite estudiar cómo la selección explícita de apoyos mejora la robustez frente a políticas reactivas, con el checkpoint de etapa 3 y las recetas disponibles para ablaciones.
- Desarrollo de pipelines de percepción para humanoides: el modelo fija el contrato de entrada (mapas de altura 17x11 y 9x7), lo que permite construir y validar estimadores de altura por cámara de profundidad o LiDAR contra una política ya entrenada, usando `obs_check.npz` como referencia.
- Reproducción de resultados académicos: el estado completo de entrenamiento (`ckpt_023000.pt`), las flags del entrenador y la receta permiten reentrenar o continuar el entrenamiento del método ACP sobre el X2 en MuJoCo Warp.
- Evaluación comparativa de controladores: los adaptadores en `eval/adapters/` y las rutas definidas en `docs/EVAL.md` permiten medir políticas propias contra las tasas publicadas (99 % en la ruta propia, 77,5 % en la NIST) bajo las mismas condiciones.
- Prototipado de loco-manipulación en simulación: al integrarse con el simulador MuJoCo, el par de redes puede usarse para generar trayectorias de referencia y datos de entrenamiento para etapas posteriores de manipulación sobre las estaciones del recorrido.

## Benchmarks y rendimiento

Resultados en MuJoCo sobre conjuntos retenidos, según la model card:

| Prueba | Resultado |
|---|---|
| Ruta completa del aparato propio (22 puntos de paso, 5 estaciones) | 198/200 (99 %); 193/200 (96,5 %) en 200 semillas nuevas |
| Ruta del aparato NIST (35 puntos de paso, escaleras de 20-21 cm) | 155/200 (77,5 %); la mayoría de fallos son caídas en las rampas |
| Puerta de retención (giros de 180 grados, valles de rampa) | 5/5 |

Todas las cifras son de simulación; no se han publicado resultados en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El paquete es un par de redes pequeñas (planificador de atención y MLP/rastreador) en ONNX y NumPy, por lo que la huella de memoria es reducida, pero el autor no publica cifras de parámetros ni de VRAM.
- GPU recomendadas: no disponible. Al ser un modelo de control con observaciones de 17x11 y 9x7, la inferencia es viable en CPU y en GPU de gama consumer; no se especifican modelos concretos.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del repositorio (0,0 GB) y los formatos de pesos, aunque no hay confirmación explícita del autor.
- Opciones de despliegue: ONNX Runtime para `planner_attn.onnx` y NumPy para `actor.npz`; el bucle de simulación y evaluación se ejecuta en MuJoCo / MuJoCo Warp. Los adaptadores de ejemplo están en `eval/adapters/` del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos en la información disponible. Como referencias conceptuales de la misma categoría (políticas de locomoción de humanoides con planificación de contactos) cabría citar los controladores del propio método ACP original y las políticas de tracking de movimiento para humanoides, pero no se dispone de datos de parámetros, contexto ni rendimiento de esas alternativas en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación: el autor indica que no se ha probado en el robot real, por lo que el gap sim-to-real no está caracterizado.
- Dependencia de mapas de altura: la política consume escaneos de altura leídos del simulador. En un robot real deben provenir de un pipeline de mapeo (el paper usa un mapa neuronal LiDAR); el estimador de altura por cámara de profundidad está planificado pero no construido.
- Fallos concentrados en rampas: en la ruta NIST, la mayoría de los fallos (45 de 200) son caídas en rampas, lo que limita su uso en terrenos inclinados sin trabajo adicional.
- Sin datos de sesgo en el sentido de modelos lingüísticos, pero el rendimiento depende de la distribución de terrenos y de los conjuntos de movimiento de entrenamiento (BONES-SEED y capturas propias), lo que puede reducir la generalización a morfologías o calzados distintos.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el usuario debe verificar las licencias de los datos de movimiento de terceros (BONES-SEED) si redistribuye derivados.
- Artefacto con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de los resultados publicados.
- No incluye los datos de entrenamiento en el repositorio; reproducir el pipeline requiere descargar BONES-SEED y los conjuntos de `meetsitaram/terrain-park`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tinkerbuggy/x2-acp-contact-planner-tracker
- Repositorio de código y evaluación: https://github.com/meetsitaram/x2-perception
- Datos de movimiento y clips de estilo: https://github.com/meetsitaram/terrain-park
- Paper de referencia: Adaptive Contact Planning, arXiv 2610.31608 (https://arxiv.org/abs/2610.31608)
- Dataset de referencia BONES-SEED (Bones Studio): disponible en Hugging Face (enlace no especificado en la model card)
