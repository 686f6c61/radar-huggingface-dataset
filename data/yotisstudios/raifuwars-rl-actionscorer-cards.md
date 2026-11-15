# yotisstudios/RaifuWars-RL-ActionScorer-Cards

## Resumen

RaifuWars-RL-ActionScorer-Cards es un conjunto de cuatro políticas de aprendizaje por refuerzo desarrolladas por Yotis-Studios para jugar a Raifu Wars, un juego de estrategia por turnos. Cada política es una red neuronal de tan solo 73.602 parámetros que actúa como "action scorer": recibe el estado del juego y el conjunto de acciones legales ofrecidas, y emite una distribución de probabilidad sobre exactamente esas acciones. No es un modelo de lenguaje ni un transformer generativo, sino un scorer de acciones especializado entrenado con PPO y self-play.

La relevancia de esta publicación radica en que son las primeras políticas publicadas que juegan cartas en Raifu Wars bajo las mismas reglas que un jugador humano, a través del protocolo Warrior. El modelo incluye features específicas de cartas (66 en el estado, 58 por acción) derivadas de una tabla de las 49 cartas del juego, incluyendo cartas que la IA integrada nunca utiliza, lo que permite a la política descubrir usos propios.

Los cuatro checkpoints comparten arquitectura y código de carga: dos generalistas (`hr-ft-24h` y `at-ft`) entrenados en 42 mapas, y dos especialistas en el mapa Cornfield. Los resultados en partidas reales contra la IA integrada alcanzan un 79,2% de victorias para `hr-ft-24h` en modo Tiers free-for-all sin cartas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red de dos torres con término de interacción (state tower + action tower + head con softmax sobre N acciones ofrecidas) |
| Parámetros totales | 73.602 por política (cuatro checkpoints) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; el estado es un vector de 99 dimensiones) |
| Tipos de cuantización | no disponible (pesos PyTorch nativos, sin versiones cuantizadas publicadas) |
| Idiomas soportados | no aplica (modelo de RL para un juego; no procesa lenguaje natural) |
| Licencia | GPL-3.0 |
| Formato de pesos | `.pt` (PyTorch) |

## Arquitectura y entrenamiento

La red tiene dos torres y un término de interacción. El estado (99 features) se proyecta a 128 y luego a 64 dimensiones; cada acción ofrecida (85 features) se embebe de forma independiente a 128 y 64. La puntuación de cada acción es el producto elemento a elemento de ambas representaciones, que pasa por una cabeza 192→128→1 y un softmax sobre exactamente las N acciones ofrecidas. Una cabeza de valor separada (64→128→1) estima el retorno. Nada en la red codifica el número de acciones, lo que es crítico porque el conjunto legal varía entre 2 y varios cientos según la decisión. Las features de cartas (66 en el estado, 58 por acción) describen la mano, las cartas en juego y el efecto de cada carta, a partir de una tabla de las 49 cartas del juego.

El linaje de entrenamiento parte de behaviour cloning sobre la IA integrada, seguido de varias rondas de PPO en el simulador (self-play y después una liga de checkpoints pasados), y finalmente fine-tuning sobre las reglas 1.14. `hr-ft-24h` corresponde a 24 horas de PPO con cartas activadas en un simulador que ofrece al asiento exactamente los movimientos de un humano, sobre 42 mapas con ajustes y mazos aleatorizados por partida. `at-ft` añade 24 horas más desde `hr-ft-24h` (84,5 millones de decisiones, 168.000 partidas) con lr 5e-5 y oponentes de liga, en un simulador donde el tiering es automático. Los dos especialistas de Cornfield se entrenaron 2 horas cada uno desde `at-ft`, solo en ese mapa, con lr 1e-4.

## Capacidades

- Selección de acciones en juegos de estrategia por turnos: puntúa el conjunto legal de acciones ofrecidas y muestrea de la política.
- Juego de cartas: features dedicadas para las 49 cartas del juego, incluyendo cartas que la IA integrada nunca juega.
- Generalización a mapas no vistos: en un benchmark de 216 partidas sobre ocho mapas retenidos, `hr-ft-24h` ganó el 75,9% (72% en mapas retenidos).
- Adaptación al conjunto variable de acciones legales (de 2 a varios cientos) sin cambios arquitectónicos.
- Juego bajo las mismas reglas que un humano a través del protocolo Warrior (asiento remoto vía HTTP).
- Modo Tiers free-for-all: única modalidad entrenada y medida.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Benchmark de agentes de RL en juegos por turnos: usar las cuatro políticas como línea base reproducible para comparar nuevos algoritmos de PPO o self-play en un entorno con acciones variables y features de cartas.
- Investigación en action scoring con conjuntos de acciones dinámicos: la arquitectura sin conocimiento del número de acciones sirve como referencia para problemas donde el conjunto legal cambia entre decisiones.
- Desarrollo de oponentes para el juego: desplegar `hr-ft-24h` mediante `serve.py` en el puerto 8899 y apuntar el asiento Warrior del juego a `http://127.0.0.1:8899` para partidas contra un agente entrenado.
- Estudio de especialización por mapa: comparar `cornfield-league` y `cornfield-greedy` (86,4% y 89,1% en Cornfield en simulación) frente a los generalistas (`at-ft`, 56,4%) para analizar cómo el entrenamiento localizado corrige debilidades de generalización.
- Evaluación de infraestructura de simulación: usar el simulador Hemlock y el protocolo Warrior como banco de pruebas para pipelines de entrenamiento con ligas de checkpoints pasados.
- Análisis de transferencia sim-a-real: medir la brecha entre el rendimiento en simulación (55,8% de `at-ft` frente a `hr-ft-24h` en 2.000 partidas) y el rendimiento en el juego real (79,2% de `hr-ft-24h` contra la IA integrada).
- Docencia en RL aplicado: ejemplo compacto (73.602 parámetros) y con licencia GPL-3.0 para ilustrar PPO, self-play y behaviour cloning en un dominio con reglas complejas.

## Benchmarks y rendimiento

Partidas reales contra la IA integrada (reglas 1.14, modo Tiers, free-for-all, un asiento de cuatro contra tres CPUs clásicas, cartas desactivadas; 144 partidas sobre seis mapas de entrenamiento, cuatro asientos y seis semillas; azar = 25%):

| Mapa | `hr-ft-24h` | `at-ft` |
|---|---|---|
| Arboretum | 18/24 | 15/24 |
| Cornfield | 12/24 | 7/24 |
| Crossroads | 23/24 | 23/24 |
| Dustbowl | 22/24 | 24/24 |
| Glacier | 20/24 | 20/24 |
| Trench Warfare | 19/24 | 20/24 |
| **Total** | **114/144 — 79,2%** | **109/144 — 75,7%** |
| Sin Cornfield | 102/120 — 85,0% | 102/120 — 85,0% |

En el mismo conjunto de semillas, `at-ft` ganó 15 partidas y perdió 20 frente a `hr-ft-24h` (p = 0,5), por lo que no se distinguen. Trench Warfare es un mapa de equipo y se jugó en free-for-all en este benchmark. En un benchmark más amplio (216 partidas, ocho mapas retenidos, dos personalidades de CPU), `hr-ft-24h` ganó el 75,9% global: 83%/79% en mapas de entrenamiento y 72%/72% en mapas retenidos.

Enfrentamiento directo en simulación (2.000 partidas, dos asientos cada una, simulador Hemlock): `at-ft` gana el 55,8% y `hr-ft-24h` el 44,0%.

Cornfield (carrera de estrellas; las victorias llegan con menos de una baja de media), simulación, un asiento contra tres jugadores greedy, 1.600 partidas cada uno:

| Política | Tasa de victoria en Cornfield |
|---|---|
| `at-ft` | 56,4% |
| `cornfield-league` | 86,4% |
| `cornfield-greedy` | 89,1% |

Enfrentamiento directo en Cornfield (dos asientos cada uno), los especialistas ganan aproximadamente el 34% por asiento frente al 15% de `at-ft`.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; con 73.602 parámetros por política, los pesos ocupan del orden de cientos de kilobytes en FP32 y el modelo cabe holgadamente en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: cualquiera; no se requiere GPU dedicada. Una RTX 4090, A100 o H100 están sobredimensionadas para este modelo.
- Cabe en consumer GPU: sí, en cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: `serve.py` incluido en el repositorio, que lee la arquitectura del checkpoint y se niega a arrancar si los feature flags no coinciden. Requiere `RW_FEAT_CARDS=1`. Se expone por HTTP en el puerto indicado (ejemplo: 8899) y el asiento Warrior del juego apunta a esa URL.
- Latencia y throughput: no disponibles en la información proporcionada. El muestreo por defecto es `--temperature 1`, que es como se midieron todos los resultados publicados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables publicados en la información proporcionada. La model card únicamente compara las cuatro políticas entre sí y contra la IA integrada del juego y jugadores greedy scriptados, no contra otros modelos de RL de terceros.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hr-ft-24h` | 73.602 | no aplica | 79,2% vs IA integrada (real); 75,9% en benchmark ampliado | GPL-3.0 | Hugging Face |
| `at-ft` | 73.602 | no aplica | 75,7% vs IA integrada (real); 55,8% vs `hr-ft-24h` en sim | GPL-3.0 | Hugging Face |
| `cornfield-league` | 73.602 | no aplica | 86,4% en Cornfield (sim) | GPL-3.0 | Hugging Face |
| `cornfield-greedy` | 73.602 | no aplica | 89,1% en Cornfield (sim) | GPL-3.0 | Hugging Face |

## Limitaciones y advertencias

- Todos los números en partidas reales se jugaron con cartas desactivadas. Las políticas se entrenaron con cartas en simulación, pero su uso en el juego real no se ha medido.
- La versión del juego importa: las políticas se entrenaron y midieron en una build cuyo asiento Warrior está limitado a los movimientos de un humano y sube de tier automáticamente. Una build anterior ofrece más movimientos y las políticas no se midieron allí.
- Solo modo Tiers free-for-all. Los modos Teams, Stock, Zombies y Last Stand no se entrenaron ni midieron.
- 24 partidas por celda de mapa equivalen a aproximadamente ±18 puntos con un 95% de confianza: suficiente para detectar un mapa débil, insuficiente para ordenar dos políticas separadas por pocos puntos.
- Los resultados de simulación ordenan políticas entre sí; solo la tabla de partidas reales indica cómo juegan al juego.
- Los especialistas de Cornfield no se han jugado en el juego real ni se han comprobado en otros mapas, donde se espera que rindan peor que los generalistas.
- Licencia GPL-3.0: cualquier uso derivado o distribución debe cumplir los términos copyleft de la GPL, lo que puede ser una restricción relevante para integraciones propietarias.
- Riesgo de alucinación: no aplica en el sentido habitual, pero la política puede elegir acciones legales pero estratégicamente malas en estados fuera de la distribución de entrenamiento (por ejemplo, con cartas activas o en modos no entrenados).
- Sesgos conocidos: no disponibles en la información proporcionada. El entrenamiento parte de behaviour cloning sobre la IA integrada, lo que puede introducir sesgos heredados de esa IA, aunque las rondas de PPO posteriores alejan la política de la imitación.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una publicación reciente (creada el 15 de noviembre de 2026) sin validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yotisstudios/RaifuWars-RL-ActionScorer-Cards
- Juego Raifu Wars: https://raifuwars.com
- Protocolo Warrior (repositorio): https://github.com/Yotis-Studios/Warrior
- Simulador Hemlock (repositorio): https://github.com/Yotis-Studios/raifusim
