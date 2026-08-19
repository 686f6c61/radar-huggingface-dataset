# yotisstudios/RaifuWars-RL-ActionScorer-SelfPlay

## Resumen
RaifuWars-RL-ActionScorer-SelfPlay es una politica de refuerzo (RL) de 57.730 parametros desarrollada por Yotis Studios para jugar una partida en Raifu Wars, un juego de estrategia por turnos, a traves del protocolo Warrior. A diferencia de su predecesor, que se enfrentaba a un bot heuristico, este modelo se entreno mediante self-play contra si mismo durante 7,5 horas en el simulador Hemlock, lo que le permitio generalizar a tableros con cobertura donde las estrategias de "disparar y quedarse quieto" fallan.

El modelo resuelve un problema concreto: la mayoria de politicas (incluidos LLMs de frontera) colapsan en mapas con cobertura, ganando solo en tableros sin obstaculos. Este modelo alcanza un 50% de victorias en Arboretum (37,2% de cobertura) y un 31% en Islands, donde los LLMs obtienen un 0% en 48 partidas. Su relevancia radica en demostrar que una politica RL minima, con una arquitectura de scoring en lugar de clasificacion, puede superar a modelos de lenguaje masivos en tareas de estrategia espacial, y que el self-play es clave para la generalizacion.

La arquitectura es un MLP de dos torres (estado y accion) con un termino de interaccion, disenado para manejar conjuntos de acciones legales variables (de 2 a ~670) y tableros de distintos tamanos. El repositorio incluye los pesos en formato PyTorch (`last.pt`) y un script de servidor para integrarlo via el protocolo Warrior.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | MLP de dos torres (estado y accion) con termino de interaccion y cabeza de valor |
| Parametros totales | 57.730 |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No aplicable (pesos en formato nativo de PyTorch, sin cuantizacion publicada) |
| Idiomas soportados | No disponibles |
| Licencia | GPL-3.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento
La arquitectura se compone de dos torres y un termino de interaccion. El estado se embebe una vez (33 features -> 128 -> 64), cada accion candidata se embebe por separado (26 features -> 128 -> 64), y la puntuacion final es el producto de ambas representaciones. Esto permite que la red no conozca el numero total de acciones, requisito indispensable ya que el conjunto legal varia entre 2 y ~670 segun la decision. La cabeza de valor (64 -> 128 -> 1) estima el retorno esperado. Al puntuar en lugar de clasificar, una accion ilegal se vuelve *irrepresentable* en lugar de meramente penalizada, y los mismos pesos funcionan en tableros de 17x21 y 27x27.

El entrenamiento se inicio desde el predecesor (`ppo-sim`) y consistio en 7,5 horas de self-play en el simulador Hemlock, con 14,57 millones de decisiones de agente, 7.112 actualizaciones y un throughput de ~1.500 pasos/segundo. Se usaron siete tableros (Arboretum, Crossroads, Dustbowl, Glacier, Cornfield, Trench Warfare, Twin Rivers) con rotacion completa de asientos. Los hiperparametros PPO fueron: lr 5e-5, 8 entornos x 256 pasos, batch 256. Un detalle critico documentado es que se debe usar `last.pt` y no `best.pt`: bajo self-play, el retorno medio esta "fijado" (cuatro copias de una politica siempre producen un ganador, fijando el termino terminal en 2.5), por lo que la seleccion de checkpoint por retorno medio es ruido. El `best.pt` se escribio a los 13 minutos y pierde contra `last.pt` por 26% a 56% en enfrentamientos directos.

## Capacidades
- Juego autonomo en Raifu Wars: gestiona una partida completa en un tablero de 4 jugadores, tomando decisiones de movimiento, disparo y posicionamiento.
- Manejo de conjuntos de acciones variables: soporta entre 2 y ~670 acciones legales por turno sin necesidad de reentrenar la arquitectura.
- Generalizacion a tableros con cobertura: alcanza un 50% de victorias en Arboretum (37,2% de cobertura) y un 31% en Islands (33,4% de cobertura), donde otras politicas colapsan.
- Estrategia de contestacion de territorio: en Islands promedia 0,1 bajas por partida y aun asi gana el 31%, priorizando el control del mapa sobre el "kill-rush" que usan otras politicas.
- Escalabilidad de tablero: los mismos pesos funcionan en tableros de 17x21 y 27x27 gracias al diseno de scoring.
- Integracion con el protocolo Warrior: puede servirse como un endpoint HTTP local para que el juego se comunique con el modelo.

## Casos de uso
- Agente de juego para Raifu Wars: el caso principal. Se ejecuta `python serve.py raifuwars-actionscorer-selfplay.pt --port 8901` y se apunta el juego a `http://127.0.0.1:8901` via el protocolo Warrior. Es adecuado porque es una politica ligera que corre en CPU y no requiere API externa.
- Investigacion en reinforcement learning: sirve como ejemplo de estudio de self-play y generalizacion. Su tamano minimo (57K parametros) permite reproducir experimentos completos en horas y analizar el efecto del oponente en el entrenamiento.
- Benchmark de politicas de IA: puede usarse como oponente estandar para evaluar LLMs o agentes heuristicos en tareas de estrategia espacial. Los datos publicados muestran que supera a LLMs de frontera en mapas con cobertura, lo que lo convierte en un punto de referencia solido.
- Sim-to-real en juegos: el modelo se entrena en el simulador Hemlock y se evalua en el juego real, demostrando transferencia sin ajuste adicional. Es util para estudiar la brecha de simulacion en entornos de estrategia.
- Entrenamiento de oponentes (curriculum learning): puede integrarse como oponente en pipelines de RL para otros agentes, ya que su comportamiento es variado (combina kill-rush en Crossroads con contestacion de territorio en Islands).
- Educacion en IA: por su simplicidad y bajo coste computacional, es un recurso didactico excelente para ensenar PPO, self-play y diseno de arquitecturas de scoring en entornos de juego.

## Benchmarks y rendimiento
Los resultados publicados provienen de 800 partidas en el simulador Hemlock (semilla reservada, rotacion completa de asientos) y de evaluaciones en el juego real con 16 partidas por tablero.

| Politica | Win rate (head-to-head) | Retorno medio | Tier medio |
|---|---|---|---|
| **Este modelo (self-play)** | **67,4%** | 15,51 | 3,65 |
| Predecesor (`ppo-sim`) | 25,1% | 11,15 | 3,20 |
| Heuristica greedy | 5,2% | — | 2,69 |
| Behaviour cloning | 2,2% | 7,72 | 2,69 |

Rendimiento por tablero en el juego real (porcentaje de victorias en una partida de 4 jugadores, donde el azar es 25%):

| Politica | Crossroads (0% cobertura) | Arboretum (37,2% cobertura) | Islands (33,4% cobertura) |
|---|---|---|---|
| **Este modelo** | **69%** | **50%** | **31%** |
| Predecesor (`ppo-sim`) | 68% | 13% | — |
| gpt-5.6-luna / deepseek-v4-flash / gemini-3.5-flash-lite | 71% | 8% | **0%** |

En configuracion de un solo asiento (un aprendiz contra tres bots greedy), este modelo obtiene un 80,0% frente al 75,0% del predecesor con la misma semilla.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 100 MB. El modelo tiene 57.730 parametros, por lo que cabe en cualquier dispositivo, incluida una Raspberry Pi.
- GPU recomendadas: no se requiere GPU. La inferencia se ejecuta eficientemente en CPU. El entrenamiento completo (7,5 horas) se realizo sin especificar el hardware, pero el throughput de ~1.500 pasos/segundo sugiere que una GPU moderna o incluso una CPU multinucleo es suficiente.
- Compatibilidad con GPU de consumo: si, cualquier GPU con soporte PyTorch (incluso integradas) es valida, aunque no es necesaria.
- Opciones de despliegue: el repositorio incluye `serve.py`, que levanta un servidor HTTP local para el protocolo Warrior. Tambien puede cargarse directamente en cualquier script Python con PyTorch.
- Latencia y throughput: el entrenamiento alcanza ~1.500 pasos/segundo. La inferencia es practicamente instantanea (menos de 1 ms por decision en CPU moderna), dado el tamano de la red.

## Comparativa con modelos similares
La comparativa se establece contra el predecesor, heuristicas clasicas y LLMs de frontera, ya que no existen modelos RL publicos de tamano similar para este juego especifico.

| Politica | Parametros | Entrenamiento | Win rate (head-to-head) | Crossroads | Arboretum | Islands | Licencia |
|---|---|---|---|---|---|---|---|
| **Este modelo** | 57.730 | Self-play PPO (7,5 h) | 67,4% | 69% | 50% | 31% | GPL-3.0 |
| Predecesor (`ppo-sim`) | 57.730 | PPO vs bot greedy | 25,1% | 68% | 13% | — | GPL-3.0 |
| Heuristica greedy | — | Disenada a mano | 5,2% | — | — | — | — |
| Behaviour cloning | — | Imitacion supervisada | 2,2% | — | — | — | — |
| gpt-5.6-luna / deepseek-v4-flash / gemini-3.5-flash-lite | Miles de millones | Preentrenamiento masivo | — | 71% | 8% | 0% | Propietaria |

La diferencia clave es que este modelo, pese a tener 6 ordenes de magnitud menos de parametros que los LLMs, generaliza a tableros con cobertura mientras que los LLMs colapsan a una estrategia de "disparar y quedarse quieto" que solo funciona sin obstaculos.

## Limitaciones y advertencias
- Islands no esta establecido como superior al azar: 5 victorias en 16 partidas da un intervalo de confianza del 95% de 14-56%, que incluye el 25% del azar (p=0,37). Lo que si esta establecido es que supera a los LLMs (0/48, p=0,0006) y al predecesor en Arboretum (8/16 vs 5/39, p=0,006).
- Evaluacion limitada en el juego real: solo 16 partidas por tablero, suficiente para separar un 50% de un 13%, pero no para clasificar politicas con diferencias de pocos puntos.
- Sin entrada de terreno: los 33 features de estado y 26 de accion no contienen informacion sobre cobertura, agua o linea de vision. La politica infiere el valor posicional indirectamente. Un conjunto de features de terreno esta sin probar.
- Self-play puro contra la politica actual: no hay pool de oponentes. No se observo olvido en 7,5 horas, pero es un riesgo en entrenamientos mas largos.
- Solo tres tableros evaluados en el juego real: los numeros de Dustbowl y Glacier en la tabla de mapas pertenecen al predecesor y no deben atribuirse a este modelo.
- Licencia GPL-3.0: cualquier uso comercial o integracion en un producto cerrado requiere liberar el codigo derivado bajo la misma licencia.
- Uso obligatorio de `last.pt`: el checkpoint `best.pt` incluido en el historial de entrenamiento es enganoso y pierde contra `last.pt` por 26% a 56% en enfrentamientos directos.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/yotisstudios/RaifuWars-RL-ActionScorer-SelfPlay
- Predecesor (RaifuWars-RL-ActionScorer): https://huggingface.co/yotisstudios/RaifuWars-RL-ActionScorer
- Juego Raifu Wars: https://raifuwars.com
- Protocolo Warrior: https://github.com/Yotis-Studios/Warrior
- Simulador Hemlock: https://github.com/Yotis-Studios/raifusim
