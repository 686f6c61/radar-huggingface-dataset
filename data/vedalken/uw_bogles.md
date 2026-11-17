# vedalken/uw_bogles

## Resumen

Bogles (`vedalken/uw_bogles`) es una política neuronal de tamaño mínimo, 124.162 parámetros, entrenada para jugar el mazo Pauper Selesnya Bogles (auras verde-blanco) en el motor de reglas real de Magic: The Gathering Argentum. No es un modelo de lenguaje: es un transformer de 3 capas y anchura 64 que puntúa opciones legales en cada decisión que solicita el motor de reglas, con softmax restringido a las opciones legales. Su objetivo es único y acotado: matar a un *goldfish* (oponente con 60 Islands que nunca actúa) en el menor número de turnos posible, con el jugador siempre en juego.

El modelo se entrenó desde cero con clonación supervisada de un oráculo de reglas y dos ciclos de *expert iteration*, con un presupuesto fijo de partidas. En 1.000 partidas de test (semillas 10000–10999) gana de media en el turno 5,646, con un 10,8 % de victorias en el turno 4, un 52,7 % en el turno 5 y una tasa de victoria del 99,7 %. Realiza 3,08 decisiones reales por turno. Incluye además un scorer de mulligan independiente (`mulligan.py`) que decide las retenciones y los descartes de London mulligan.

Es relevante como ejemplo de *small model* aplicado a un dominio cerrado con un motor de reglas determinista: demuestra que una red de 124K parámetros, con una representación de entrada bien diseñada (tokens globales, cartas visibles y opciones legales, más embeddings de adjunción para las auras), puede alcanzar una política casi óptima en un subproblema de Magic. Su licencia MIT y su tamaño reducido lo hacen fácil de reproducir y de integrar en experimentos de RL sobre juegos de cartas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de 3 capas, anchura 64, 4 cabezas de atención |
| Parámetros totales | 124.162 (según safetensors); la model card indica 123.970 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (secuencia de tokens por decisión: 1 global + 1 por carta visible + 1 por opción legal) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json`, `model.py`, `deck.dck`, `mulligan.py`, `mulligan/` |

## Arquitectura y entrenamiento

Cada decisión que solicita el motor Argentum se convierte en una secuencia de tokens: un token *global* (turno, vida, tierras, cartas robadas y hechizos lanzados en el turno, tipo de decisión, fase y biblioteca), un token por cada carta visible con su zona y un token por cada opción legal. Un transformer de 3 capas con anchura 64 y 4 cabezas puntúa los tokens de opción, y el softmax se aplica únicamente sobre las opciones legales. Bogles añade tres elementos a las entradas compartidas: tipos de decisión extra (`target`, `search`, `color`), *embeddings* de adjunción (un aura comparte slot con la criatura que encanta, y una opción de objetivo con su objetivo) y estadísticas de carta (fuerza, resistencia y can-attack), cuyos pesos son cero en este checkpoint porque se añadieron después del entrenamiento.

El entrenamiento parte de un oráculo de reglas (bosque primero, criatura, Utopia Sprawl y auras sobre la criatura más grande, con cada regla conservada solo si mejora en partidas de validación emparejadas), seguido de clonación supervisada del oráculo (4.000 partidas) y dos ciclos de *expert iteration* (3 rondas × 480 partidas cada uno, con relabelado del scorer de mulligan entre medias). En la *expert iteration*, en hasta 8 decisiones no obvias por partida se prueban todas las opciones legales sobre 4 futuros rebarajados terminados por el modelo, y la opción más rápida se convierte en etiqueta. El checkpoint se eligió sobre 1.000 partidas de validación; las partidas no ganadas en el turno 12 cuentan como turno 13. El scorer de mulligan es un MLP separado que predice el turno medio de muerte de retener una mano con un conjunto dado de cartas en el fondo, entrenado sobre partidas simuladas por el predecesor del modelo.

## Capacidades

- Selección de acciones en un motor de reglas de Magic: The Gathering (Argentum) para el mazo Selesnya Bogles.
- Decisiones de tipo `main`, `target` (qué criatura recibe un aura), `search` (elecciones de biblioteca) y `color` (Utopia Sprawl, Benevolent Blessing).
- Representación de adjunciones: el modelo distingue qué criatura lleva qué aura.
- Scorer de mulligan independiente: decide retener o hacer London mulligan y qué cartas poner en el fondo.
- No soporta tool calling, function calling, agentes multi-paso genéricos ni capacidades multilingües.
- No tiene modo *thinking*, visión ni audio.
- Ataques, pago de maná y prompts de sí/no están guionizados por el *bridge*, no los elige el modelo.

## Casos de uso

- Evaluación de motores de reglas de Magic: sirve como agente de referencia para validar que el motor Argentum implementa correctamente las interacciones de auras, objetivos y búsquedas en biblioteca.
- Investigación en *expert iteration* y RL sobre juegos de cartas: el repositorio incluye el pipeline completo (oráculo, clonación, *expert iteration*, selección de checkpoint) reproducible con un presupuesto acotado de partidas.
- Benchmark de *small models* en dominios cerrados: con 124K parámetros y una tasa de victoria del 99,7 % frente a un goldfish, es un punto de comparación para estudiar cuánta capacidad necesita una política para un subproblema concreto.
- Estudio de mulligan y varianza de apertura: el scorer `mulligan.py` cuantifica el valor de un mulligan (turno 6,59 a seis, 7,08 a cinco, 7,87 a cuatro) y permite analizar la importancia de la mano inicial en Bogles.
- Generación de datos sintéticos de partidas: el modelo puede jugar miles de partidas contra el goldfish para producir trayectorias etiquetadas que alimenten otros experimentos de aprendizaje.
- Docencia sobre representación de estado en juegos: el featurizado (token global, cartas visibles, opciones legales, adjunciones) es un ejemplo didáctico de cómo codificar un estado complejo en una secuencia corta de tokens.

## Benchmarks y rendimiento

Resultados sobre 1.000 partidas de test (semillas 10000–10999, ejecución única), según la model card:

| Métrica | Valor |
|---|---|
| Turno medio de muerte | 5,646 |
| Victorias en turno 4 o antes | 10,8 % |
| Victorias en turno 5 o antes | 52,7 % |
| Tasa de victoria | 99,7 % |
| Decisiones reales por turno | 3,08 |
| Ganancia del scorer de mulligan sobre la regla manual | 0,42 turnos |
| Ganancia adicional de *expert iteration* | ~0,04 turnos |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos (124K parámetros en safetensors); el consumo real lo domina el motor Argentum y el *bridge*, no la red.
- GPU recomendadas: cualquier GPU, incluida CPU; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU de consumo e incluso en CPU sin problema.
- Opciones de despliegue: PyTorch con `safetensors.torch.load_file` y el `model.py` del repositorio; no hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje).
- Latencia y throughput: no disponibles en la información proporcionada; el cuello de botella esperado es la simulación del motor de reglas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de política para Magic: The Gathering ni resultados comparativos con alternativas de la misma categoría.

## Limitaciones y advertencias

- Entrenado únicamente contra un goldfish: la habilidad de hexproof nunca importa y el modelo ignora bloqueadores y removal.
- Una sola lista de mazo (`deck.dck`, solo mazo principal) y un máximo de 12 turnos por partida.
- Ataques, pago de maná y prompts de sí/no los guioniza el *bridge*, no los elige el modelo.
- Los pesos de las estadísticas de carta (fuerza, resistencia, can-attack) son cero: el modelo juega exactamente como se entrenó, sin usar esa información.
- Riesgo de alucinación no aplicable en el sentido habitual, pero la política puede elegir opciones legales subóptimas fuera de la distribución de entrenamiento (por ejemplo, frente a oponentes interactivos).
- Sesgos conocidos: no disponibles.
- Licencia MIT, sin restricciones para uso comercial según la model card; conviene verificar los términos del motor Argentum por separado.
- Para producción: no es un modelo de propósito general; solo tiene sentido dentro del ecosistema Argentum y con el mazo Bogles.

## Enlaces

- Hugging Face: https://huggingface.co/vedalken/uw_bogles
- Motor Argentum: https://github.com/wingedsheep/argentum-engine
- Demo del reproductor goldfish (Space): https://huggingface.co/spaces/vedalken/monoR_madness
