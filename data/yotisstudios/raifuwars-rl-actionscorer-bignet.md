# yotisstudios/RaifuWars-RL-ActionScorer-BigNet

## Resumen

RaifuWars-RL-ActionScorer-BigNet es un modelo de aprendizaje por refuerzo (RL) desarrollado por Yotis Studios para jugar a Raifu Wars, un juego de estrategia por turnos, a través del protocolo Warrior. Se trata de un "brazo de control" publicado como resultado negativo: un experimento de ablación que aumenta la capacidad de la red de 58K a 214K parámetros (3,7×) manteniendo idénticas el resto de variables (características, tableros, oponente, tasa de aprendizaje, tamaño de lote y presupuesto de tiempo). El objetivo era falsar la hipótesis de que "la red no es el cuello de botella" en el rendimiento del sistema.

El resultado es concluyente: el modelo más grande produce una política peor que su gemelo pequeño. En enfrentamientos directos (head-to-head) contra otros agentes entrenados, obtiene solo un 3,8% de victorias (frente al 13,3% del modelo de 58K), y en el juego real contra la IA integrada alcanza un 23% de victorias, estadísticamente indistinguible de una política aleatoria (p=0,68). Sin embargo, es el mejor en un tablero concreto (Crossroads) contra oponentes greedy, con un 96% de victorias. Este patrón demuestra que el exceso de capacidad se invierte en sobreajustar al oponente scripted, no en aprender un mejor modelo del juego.

La relevancia de este modelo es metodológica: sirve como evidencia de que en RL con oponente fijo, más parámetros pueden degradar la generalización, y que la métrica de retorno medio (mean return) no es fiable para clasificar políticas. Es un artefacto de investigación, no un modelo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos torres MLP con interacción (producto elementwise) y cabeza de scoring |
| Parametros totales | 213,762 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de juego, no de lenguaje) |
| Licencia | GPL-3.0 |
| Formato de pesos | PyTorch (checkpoint .pt, mencionado en el ejemplo de uso) |

## Arquitectura y entrenamiento

La arquitectura consta de dos torres: una que procesa el estado (33 características → 256 → 128) y otra que procesa cada acción candidata (27 características → 256 → 128). La puntuación final es el producto elementwise de ambas representaciones, seguido de una cabeza de 384 → 256 → 1. Hay además una cabeza de valor (128 → 256 → 1). Este diseño permite manejar conjuntos de acciones de tamaño variable (de 2 a ~670 según el tablero, la tirada de dados y la mano), ya que la red no tiene un número fijo de salidas. Al puntuar en lugar de clasificar, las acciones ilegales son irrepresentables, y los mismos pesos funcionan en tableros de 17×21 y 27×27.

El entrenamiento se realizó con PPO (tasa de aprendizaje 5e-5, 6 entornos × 192 pasos, lote de 128) contra un oponente greedy scripted, en el simulador Hemlock, durante 8 horas (8,364 actualizaciones, 9,635,328 decisiones de agente, ~455 pasos/segundo). Se usaron 7 tableros: Arboretum, Crossroads, Dustbowl, Glacier, Cornfield, Trench Warfare y Twin Rivers. El retorno medio final fue 16.90, con un pico de 17.99 en la actualización 5,829. El entrenamiento se inició desde cero porque un cambio de anchura hace inutilizable un checkpoint existente como inicializador.

## Capacidades

- Jugar a Raifu Wars: el modelo selecciona acciones legales en cada turno, puntuando cada acción candidata y aplicando softmax sobre el conjunto ofrecido.
- Manejo de conjuntos de acciones variables: la arquitectura de scoring permite operar con entre 2 y ~670 acciones posibles sin necesidad de máscaras.
- Transferencia entre tableros de distinto tamaño: los mismos pesos funcionan en tableros de 17×21 y 27×27.
- No es un modelo de lenguaje: no genera texto, no tiene capacidades de razonamiento general, ni soporta tool calling, agentes o multilingüismo.
- Capacidad de juego contra oponentes scripted: muestra un rendimiento notable contra greedy en el tablero Crossroads (96% de victorias), pero falla en tableros con cobertura.

## Casos de uso

- Investigación en RL: este modelo sirve como control en experimentos de ablación de capacidad, demostrando que aumentar parámetros no siempre mejora el rendimiento contra oponentes fijos. Es útil para estudiar el sobreajuste en entornos de simulación.
- Estudio de métricas de evaluación: el hecho de que tenga el mayor retorno medio de entrenamiento (16.90) pero el peor rendimiento head-to-head (3.8%) lo convierte en un caso de estudio para validar que el retorno medio no es una métrica fiable para clasificar políticas.
- Análisis de generalización sim-to-real: al comparar su rendimiento en simulación (71.2% contra greedy) con el del juego real (23% contra la IA integrada), se puede investigar la brecha de transferencia.
- Benchmark de sobreajuste a oponentes: su comportamiento en Crossroads (96% contra greedy) frente a otros tableros muestra cómo la capacidad extra se concentra en explotar un único patrón del oponente.
- Desarrollo de protocolos de evaluación: el modelo puede usarse como ejemplo de "resultado negativo" en pipelines de CI para RL, ayudando a definir criterios de aceptación que no dependan solo del retorno medio.
- Educación en RL: como material didáctico para ilustrar los peligros de aumentar la capacidad sin controlar la distribución de oponentes.

## Benchmarks y rendimiento

Los resultados publicados son de partidas, no de benchmarks estándar de ML (MMLU, HumanEval, etc.). Se presentan las tablas de la model card:

**Simulación, head-to-head (744 partidas)**

| Modelo | Win rate |
|---|---|
| Este modelo (214K) | 3.8% |
| ppo-sim (58K) | 13.3% |
| ppo-selfplay (58K) | 42.3% |
| ppo-selfplay2 (58K) | 48.1% |

**Simulación vs tres bots greedy (400 partidas)**

| Modelo | Win rate |
|---|---|
| Este modelo (214K) | 71.2% |
| ppo-sim (58K) | 84.5% |
| ppo-selfplay (58K) | 82.0% |
| ppo-selfplay2 (58K) | 77.8% |

**Simulación vs greedy, por tablero**

| Tablero | Este modelo | ppo-sim (58K) | ppo-selfplay (58K) | ppo-selfplay2 (58K) |
|---|---|---|---|---|
| Crossroads | 96.0% | 83.8% | 89.0% | 90.8% |
| Arboretum | 75.8% | 73.8% | 78.0% | 78.5% |

**Juego real contra la IA integrada (16 partidas por tablero, chance 25%)**

| Tablero | Este modelo | ppo-selfplay (58K) | ppo-selfplay2 (58K) |
|---|---|---|---|
| Arboretum | 2/16 (12%) | 8/16 (50%) | 2/16 (12%) |
| Islands | 1/16 (6%) | 5/16 (31%) | 13/16 (81%) |
| Crossroads | 8/16 (50%) | 69% | 75% |
| **Overall** | **11/48 (23%)** | 24/48 (50%) | 27/48 (56%) |

El modelo no es distinguible de una política aleatoria en el juego real (p=0.68).

## Requisitos de hardware

- Al ser un modelo de 213,762 parámetros, la inferencia es trivial en cualquier hardware moderno, incluida una CPU.
- No se proporcionan requisitos específicos de VRAM ni GPU recomendadas en la documentación.
- El entrenamiento se realizó en 8 horas con 6 entornos paralelos, lo que sugiere que cabe en una GPU de gama media, pero no se especifica el modelo exacto.
- Opciones de despliegue: el ejemplo de uso indica un servidor `serve.py` que se comunica con el juego vía protocolo Warrior en el puerto 8901. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplica, al no ser un LLM).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Se comparan los modelos del mismo proyecto (todos de la familia ActionScorer) según los datos de la model card:

| Modelo | Parámetros | Entrenamiento | Win rate head-to-head (sim) | Win rate vs greedy (sim) | Win rate real (overall) |
|---|---|---|---|---|---|
| **Este modelo (BigNet)** | 213,762 | PPO vs greedy | 3.8% | 71.2% | 23% |
| ppo-sim | 58K | PPO vs greedy | 13.3% | 84.5% | — |
| ppo-selfplay | 58K | PPO vs selfplay | 42.3% | 82.0% | 50% |
| ppo-selfplay2 | 58K | PPO vs selfplay (2ª gen) | 48.1% | 77.8% | 56% |

No se dispone de comparativas con modelos externos al proyecto.

## Limitaciones y advertencias

- Sobreajuste severo al oponente greedy: el modelo explota patrones del bot scripted, lo que lo hace inútil contra oponentes adaptativos.
- Rendimiento en el juego real indistinguible del azar (23% vs 25% de chance, p=0.68).
- El retorno medio de entrenamiento (16.90) es engañoso: no correlaciona con la calidad de la política.
- No hay pesos publicados: el repositorio tiene 0.0 GB, por lo que el modelo no es descargable ni desplegable en la práctica.
- Licencia GPL-3.0: cualquier uso o modificación debe cumplir con los términos de copyleft de esta licencia.
- Es un resultado negativo: no debe usarse como modelo de producción, sino como evidencia experimental.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de contexto (no aplica al no ser un LLM).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yotisstudios/RaifuWars-RL-ActionScorer-BigNet
- Juego Raifu Wars: https://raifuwars.com
- Protocolo Warrior: https://github.com/Yotis-Studios/Warrior
- Simulador Hemlock: https://github.com/Yotis-Studios/raifusim
- Modelo hermano (Cover arm): https://huggingface.co/yotisstudios/RaifuWars-RL-ActionScorer-Cover
