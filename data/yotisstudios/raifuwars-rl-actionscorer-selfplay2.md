# yotisstudios/RaifuWars-RL-ActionScorer-SelfPlay2

## Resumen

RaifuWars-RL-ActionScorer-SelfPlay2 es un modelo de aprendizaje por refuerzo (RL) desarrollado por Yotis Studios que juega a Raifu Wars, un juego de estrategia por turnos, a través del protocolo Warrior. Se trata de una política de 57.730 parámetros que continúa el entrenamiento de su predecesor (RaifuWars-RL-ActionScorer-SelfPlay) con 12 horas adicionales y 29,6 millones de decisiones de agente en régimen de self-play. El modelo resuelve el problema de selección de acciones en un entorno con espacio de acciones variable (entre 2 y ~670 acciones legales según el tablero, la tirada de dados y la mano), mediante una arquitectura de dos torres que puntúa cada acción candidata en lugar de clasificar sobre un conjunto fijo.

La relevancia de este checkpoint radica en que demuestra cómo el self-play prolongado produce estrategias especializadas por tablero: en Islands el modelo gana el 81% de las partidas sin disparar un solo tiro, mientras que en Arboretum su rendimiento cae al 12%. Además, los resultados en simulación y en partidas reales divergen notablemente, lo que subraya las dificultades del sim-to-real en entornos de juego. El modelo está publicado bajo licencia GPL-3.0 y su repositorio incluye el checkpoint `last.pt` listo para servir mediante el script `serve.py`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feedforward de dos torres (estado y accion) con producto punto e interaccion |
| Parametros totales | 57.730 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de RL, no procesa texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | GPL-3.0 |
| Formato de pesos | Checkpoint de PyTorch (.pt) |

## Arquitectura y entrenamiento

La arquitectura consta de dos torres y un termino de interaccion. El estado del juego se incrusta una vez (33 features -> 128 -> 64), cada accion candidata se incrusta por separado (27 features -> 128 -> 64), y la puntuacion final es el producto elemento a elemento de ambas representaciones, que pasa por una cabeza de 192 -> 128 -> 1. Una segunda cabeza de valor (64 -> 128 -> 1) estima el retorno esperado. Esta diseno permite que la red maneje un numero variable de acciones legales sin necesidad de una capa de salida fija, haciendo que las acciones ilegales sean irrepresentables en lugar de meramente penalizadas.

El entrenamiento se realizo con PPO (lr 5e-5, 12 entornos x 256 pasos, batch 256) sobre la reimplementacion Hemlock del juego, durante 12 horas, 9.647 updates y 29.635.584 decisiones de agente, repartidas en 126.728 partidas. Se inicializo desde el checkpoint `last.pt` del predecesor y se entreno en siete tableros: Arboretum, Crossroads, Dustbowl, Glacier, Cornfield, Trench Warfare y Twin Rivers. Las tasas de victoria por asiento al final del entrenamiento fueron {0: 0.336, 1: 0.245, 2: 0.180, 3: 0.309}, siendo el asiento 2 el mas dificil. El autor advierte que la seleccion de checkpoint por retorno medio no es significativa bajo self-play, por lo que se recomienda usar `last.pt`.

## Capacidades

- Juego autonomo en Raifu Wars: toma decisiones de accion (movimiento, ataque, captura de puntos, etc.) en partidas de cuatro jugadores.
- Adaptacion a diferentes tableros: el modelo desarrolla estrategias especificas por mapa, como el control territorial en Islands o el kill-rush en Crossroads.
- Manejo de espacio de acciones variable: la arquitectura puntua cada accion candidata, permitiendo operar con entre 2 y ~670 acciones legales segun el contexto.
- Estrategias emergentes via self-play: el entrenamiento prolongado produce comportamientos no programados, como no disparar nunca en Islands y ganar el 81% de las partidas.
- Integracion con el protocolo Warrior: puede servirse como oponente en partidas reales contra la IA integrada del juego.
- Ligereza computacional: con solo 57.730 parametros, es ejecutable en CPU sin necesidad de GPU.

## Casos de uso

- Oponente de entrenamiento para jugadores humanos: el modelo puede servir como rival en partidas de Raifu Wars, ofreciendo un nivel de juego competitivo (56% de victorias contra la IA integrada) y estilos variados segun el tablero.
- Investigacion en self-play y RL: sirve como caso de estudio para analizar como el entrenamiento prolongado produce especializacion por mapa y como los resultados en simulacion divergen de los reales.
- Prueba de protocolos de comunicacion entre agentes: al usar el protocolo Warrior, puede integrarse en pipelines de desarrollo de agentes de juego para validar la interoperabilidad.
- Benchmark de politicas de RL: los resultados publicados (head-to-head, vs bots codiciosos, partidas reales) permiten comparar el rendimiento de diferentes enfoques de entrenamiento.
- Educacion en aprendizaje por refuerzo: su tamano reducido y su arquitectura sencilla lo convierten en un ejemplo didactico para explicar diseno de redes de puntuacion de acciones y entrenamiento con PPO.
- Desarrollo de estrategias de control territorial: el comportamiento observado en Islands (cero bajas, alta tasa de victoria) puede inspirar tecnicas de priorizacion de objetivos en otros dominios de RL.

## Benchmarks y rendimiento

La model card proporciona resultados de partidas reales contra la IA integrada (16 partidas por tablero, un asiento de cuatro, 25% de azar) y de simulaciones. Se presentan a continuacion.

**Partidas reales contra la IA integrada**

| Tablero | Predecesor | Este modelo | Cambio |
|---|---|---|---|
| Islands | 5/16 (31%) | 13/16 (81%) | Mejora (p=0.011) |
| Crossroads | 11/16 (69%) | 12/16 (75%) | Sin cambio (p=1.0) |
| Arboretum | 8/16 (50%) | 2/16 (12%) | Regresion (p=0.054) |
| **Global** | 24/48 (50%) | 27/48 (56%) | Mejora (p=0.000004) |

**Resultados de simulacion**

| Metrica | Este modelo | Predecesor | `ppo-sim` | `bignet` |
|---|---|---|---|---|
| Head-to-head (744 partidas) | 48.1% | 42.3% | 13.3% | 3.8% |
| Vs tres bots codiciosos (400 partidas) | 77.8% | 82.0% | 84.5% | 71.2% |

El autor senala que ninguna de las columnas de simulacion predijo el resultado real: en simulacion head-to-head este modelo es el mejor, pero en el juego real perdio un tablero por completo. La causa probable es que el payload de estado de la simulacion no contiene terreno, por lo que el self-play optimiza contra tableros efectivamente abiertos, perjudicando a mapas con mucha cobertura como Arboretum.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo tiene solo 57.730 parametros, por lo que cabe en cualquier CPU moderna sin necesidad de GPU.
- GPU recomendadas: ninguna; puede ejecutarse en CPU (por ejemplo, un procesador de un solo nucleo es suficiente).
- Compatibilidad con hardware de consumo: total, incluso en Raspberry Pi o similares.
- Opciones de despliegue: el script `serve.py` incluido en el repositorio permite servir el modelo via HTTP siguiendo el protocolo Warrior. Tambien puede cargarse directamente en PyTorch para inferencia local.
- Latencia y throughput: no se proporcionan mediciones explicitas, pero con ~1.374 pasos/segundo durante el entrenamiento, la inferencia es practicamente instantanea en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (real vs IA) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RaifuWars-RL-ActionScorer-SelfPlay2 (este) | 57.730 | No aplica | 56% global (27/48) | GPL-3.0 | HuggingFace |
| RaifuWars-RL-ActionScorer-SelfPlay (predecesor) | 57.730 | No aplica | 50% global (24/48) | GPL-3.0 | HuggingFace |
| `ppo-sim` (mencionado en la model card) | No disponible | No aplica | No evaluado en partidas reales | No disponible | No publicado |
| `bignet` (mencionado en la model card) | No disponible | No aplica | No evaluado en partidas reales | No disponible | No publicado |

La comparativa se limita a los modelos citados en la documentacion del autor, ya que no se dispone de informacion sobre otras politicas de Raifu Wars publicadas.

## Limitaciones y advertencias

- Regresion en el tablero Arboretum: el modelo empeoro del 50% al 12% de victorias en ese mapa, aunque el autor indica que la regresion no es estadisticamente significativa (p=0.054) y que se necesita una muestra mayor para confirmarla.
- Divergencia sim-to-real: los resultados en simulacion no predicen el rendimiento en partidas reales, debido a que la simulacion no incluye terreno en el estado. Esto limita la transferibilidad de las politicas entrenadas en simulacion.
- Estrategias extremas: el modelo tiende a especializarse en un unico estilo (territorial o letal) por tablero, lo que puede ser una desventaja en mapas que requieren un equilibrio entre ambos.
- Licencia GPL-3.0: cualquier uso comercial o distribucion derivada debe cumplir con los terminos de la GPL-3.0, lo que puede restringir su integracion en productos propietarios.
- Dependencia del protocolo Warrior: el modelo solo puede utilizarse a traves de este protocolo, lo que limita su aplicabilidad fuera del ecosistema de Raifu Wars.
- Sin soporte de lenguaje natural: no es un modelo de texto ni de vision; su unica entrada es el estado del juego y su salida es una puntuacion por accion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yotisstudios/RaifuWars-RL-ActionScorer-SelfPlay2
- Modelo predecesor: https://huggingface.co/yotisstudios/RaifuWars-RL-ActionScorer-SelfPlay
- Juego Raifu Wars: https://raifuwars.com
- Protocolo Warrior: https://github.com/Yotis-Studios/Warrior
- Reimplementacion Hemlock: https://github.com/Yotis-Studios/raifusim
