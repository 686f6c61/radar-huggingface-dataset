# TobiasLogic/chessmamba

## Resumen

ChessMamba es un motor de ajedrez desarrollado por TobiasLogic que emplea un modelo de espacio de estados selectivo (Mamba/S6) construido desde cero para leer la partida como una secuencia de movimientos, en lugar de usar las arquitecturas clásicas de ajedrez (alpha-beta con evaluación heurística, NNUE o CNN + MCTS). El modelo tiene aproximadamente 16,8 millones de parámetros (dim=384, depth=10, state_dim=16) y procesa la historia de la partida mediante un estado oculto recurrente que se actualiza movimiento a movimiento, sin necesidad de releer todo el historial en cada jugada.

El entrenamiento combina una fase supervisada sobre partidas reales de Lichess con Elo superior a 1800 y una fase de self-play con aprendizaje por refuerzo, donde el modelo juega contra sí mismo y sus propias partidas se incorporan al entrenamiento ponderadas por su búsqueda. No se utilizó Stockfish ni ningún motor externo para generar etiquetas o evaluaciones; la búsqueda (negamax con alpha-beta y quiescence) se apoya exclusivamente en las salidas de policy y valor del propio modelo. El resultado es un motor que habla el protocolo UCI y que, aunque aún pierde contra Sunfish (motor clásico de ~2000 Elo), demuestra la viabilidad de los SSM selectivos en dominios secuenciales como el ajedrez.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba/S6 (selective state-space model) |
| Parametros totales | ~16,8 millones (dim=384, depth=10, state_dim=16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Secuencia de movimientos (sin límite fijo; el estado oculto es fijo de dimensión 16) |
| Tipos de cuantizacion | No disponible (pesos en formato PyTorch, probablemente fp32) |
| Idiomas soportados | No aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo está compuesto por 10 capas de bloques S6 (selective state-space) con dimensión 384 y estado oculto de 16. Cada capa mantiene un estado recurrente compacto que se actualiza movimiento a movimiento, decidiendo de forma selectiva qué olvidar y qué escribir en el estado en función de la entrada. Esta selectividad es la característica clave de S6: permite que el modelo no necesite releer la historia completa para decidir la siguiente jugada, sino que el estado avanza un paso y los tokens antiguos se descartan.

Sobre el estado final de la última capa se conectan tres cabezas: una de policy con salida de 4096 clases (from-square × to-square), una de promoción con 5 clases y una de valor con salida escalar (tanh). La búsqueda se implementa como un negamax con poda alpha-beta y quiescence que incluye capturas y promociones, utilizando la policy head para ordenar los movimientos (top-K) y la value head para la evaluación de hojas. No hay tablas de piezas ni términos de evaluación escritos a mano.

El entrenamiento se realizó en varias fases: primero un preentrenamiento supervisado sobre partidas de Lichess con Elo >1800, seguido de self-play donde el modelo juega contra sí mismo y las partidas se ponderan por su propia búsqueda, mezclando datos originales para evitar el olvido catastrófico. Cada checkpoint debía ganar un enfrentamiento directo contra el anterior para ser aceptado; se detectaron y revirtieron dos regresiones causadas por self-play. El modelo final pierde contra Sunfish, que fue usado solo como oponente de referencia en los scripts de entrenamiento, nunca en los datos de entrenamiento.

## Capacidades

- Jugar ajedrez completo: aperturas, medio juego y finales, con soporte para enroque, capturas al paso y promociones.
- Emitir movimientos legales mediante la policy head (4096 salidas from-square × to-square) y la head de promoción (5 salidas).
- Evaluar posiciones mediante la value head (escalar entre -1 y 1).
- Integrar búsqueda de árbol: negamax con alpha-beta, quiescence y ordenación de movimientos por policy.
- Hablar el protocolo UCI, por lo que puede conectarse a interfaces gráficas de ajedrez (GUI) y gestionar tiempos de partida (movetime, wtime/btime/winc/binc).
- No es un modelo de lenguaje: no genera texto, no tiene tool calling, ni capacidades multilingües.

## Casos de uso

- Motor de análisis en interfaces UCI: se puede conectar a programas como Arena, Cute Chess o Lichess para analizar partidas o jugar contra él, aprovechando su soporte UCI y gestión de reloj.
- Entrenamiento y evaluación de agentes de ajedrez: sirve como oponente o baseline en entornos de aprendizaje por refuerzo, gracias a su tamaño reducido y a que la búsqueda depende únicamente de sus propias salidas.
- Investigación en modelos de espacio de estados: es un ejemplo práctico de aplicación de Mamba/S6 a un dominio secuencial no lingüístico, útil para estudiar la capacidad de generalización de los SSM.
- Educación en IA y ajedrez: permite explorar cómo un modelo recurrente selectivo aprende a jugar sin conocimiento previo del tablero, con código fuente disponible y entrenamiento reproducible.
- Benchmark de eficiencia: al ser solo 16,8M de parámetros, puede ejecutarse en CPU sin GPU, lo que lo hace adecuado para entornos con recursos limitados.
- Desarrollo de motores híbridos: se puede combinar con búsqueda clásica o con otros modelos para experimentar con arquitecturas alternativas a las dominantes (CNN+MCTS o NNUE).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como Elo frente a motores conocidos, ni métricas tipo MMLU). La información disponible incluye únicamente resultados de enfrentamientos internos entre checkpoints:

- El checkpoint supervisado ganó 4-0 (con 4 tablas) al mejor anterior.
- Ese checkpoint ganó 3-1 (con 4 tablas) al siguiente.
- Un refinamiento posterior terminó en empate 4-4.

El modelo pierde contra Sunfish, que se estima con una fuerza de ~2000 Elo. No hay datos de rendimiento frente a Stockfish, Leela Chess Zero u otros motores modernos.

## Requisitos de hardware

- Inferencia en CPU: con 16,8M de parámetros, el modelo es muy ligero y puede ejecutarse en cualquier CPU moderna sin necesidad de GPU.
- VRAM estimada: menos de 100 MB en fp32 (16,8M parámetros × 4 bytes ≈ 67 MB). Cabe en cualquier GPU, incluso integradas.
- GPU recomendada: no necesaria; si se usa, cualquier GPU con ≥1 GB es suficiente.
- Despliegue: se ejecuta como proceso UCI mediante Python (`python3 engine_uci.py`). No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un LLM.
- Latencia y throughput: no disponibles; depende de la profundidad de búsqueda configurada y del hardware.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Búsqueda | Fuerza estimada | Licencia |
|---|---|---|---|---|---|
| ChessMamba | Mamba/S6 (SSM) | 16,8M | Negamax + alpha-beta + quiescence | <2000 Elo (pierde contra Sunfish) | MIT |
| Sunfish | Clásico (alpha-beta + evaluación heurística) | ~1K líneas de código | Alpha-beta con tablas | ~2000 Elo | MIT |
| Stockfish | NNUE + alpha-beta | ~100M (red neuronal) | Alpha-beta con poda avanzada | >3500 Elo | GPLv3 |
| AlphaZero | CNN + MCTS | ~20M (red) | MCTS | Superhumano | No abierto |

No hay benchmarks directos entre ChessMamba y estos motores; la comparativa se basa en descripciones cualitativas y en la afirmación del autor de que pierde contra Sunfish.

## Limitaciones y advertencias

- El modelo pierde contra Sunfish, un motor clásico de ~2000 Elo, por lo que no es competitivo frente a motores modernos (Stockfish, Leela, etc.).
- Entrenado en pocos días; la fuerza es limitada y puede cometer errores tácticos graves en posiciones complejas.
- No es un modelo de lenguaje: no comprende ni genera texto, no tiene capacidades multilingües ni de razonamiento general.
- La búsqueda está acotada a 19 segundos por movimiento como máximo, lo que limita la profundidad en partidas con poco tiempo.
- No se han publicado métricas de rendimiento formales (Elo, accuracy, etc.) más allá de los enfrentamientos internos.
- El repositorio no indica si los pesos están en safetensors o cuantizados; solo se proporciona un archivo `.pt`.
- La licencia MIT permite uso comercial, pero el modelo no está diseñado para producción de alto rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TobiasLogic/chessmamba
- Repositorio de código (inferido desde la model card, no se proporciona URL explícita): no disponible en la información facilitada.
- Paper o documentación técnica adicional: no disponible.
