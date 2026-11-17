# vedalken/gw_bogles

## Resumen

Bogles es una política neuronal extremadamente pequeña (124.162 parámetros) entrenada para jugar el mazo Pauper Selesnya Bogles (verde-blanco de auras) en un motor real de reglas de Magic: The Gathering, Argentum. Lo desarrolla el usuario vedalken y su única tarea es matar a un "goldfish" (un oponente con 60 Islands que nunca actúa) en el menor número de turnos posible: desplegar una criatura, apilar todas las auras sobre ella y atacar. No es un modelo de lenguaje general, sino un agente de decisión específico entrenado con aprendizaje por refuerzo mediante iteración experta.

El modelo demuestra que un transformer de 3 capas, anchura 64 y 4 cabezas de atención puede aprender una política de juego razonable en un dominio cerrado con muy pocos recursos. Sobre 1000 partidas de test gana de media en el turno 5,646, con un 10,8% de victorias en el turno 4, un 52,7% en el turno 5 y una tasa de victoria del 99,7%. Realiza 3,08 decisiones reales por turno.

Es relevante como ejemplo de aplicación de RL a dominios estructurados con presupuesto de entrenamiento fijo, y por la ingeniería de representación: cada decisión del motor se serializa en una secuencia de tokens (global, cartas visibles y opciones legales) que el transformer puntúa, con softmax restringido a las opciones legales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 3 capas, anchura 64, 4 cabezas de atención |
| Parametros totales | 124.162 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (secuencia por decisión: token global + una entrada por carta visible + una por opción legal) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors) + config.json |

## Arquitectura y entrenamiento

La red es un transformer de 3 capas con anchura 64 y 4 cabezas que puntúa las opciones legales de cada decisión solicitada por el motor de reglas. Cada decisión se convierte en una secuencia de tokens: un token global (turno, vida, tierras, cartas robadas y hechizos lanzados en el turno, tipo de decisión, fase, biblioteca), un token por carta visible con su zona y un token por opción legal. La softmax se aplica únicamente sobre las opciones legales. Bogles añade tres elementos a las entradas compartidas: tipos de decisión adicionales (`target`, `search`, `color`), embeddings de adjunción que comparten ranura entre un aura y la criatura que encanta (y entre una opción de objetivo y su objetivo), y estadísticas de carta (fuerza, resistencia y puede-atacar) cuyos pesos quedaron a cero tras el entrenamiento.

El entrenamiento parte de cero con un presupuesto fijo: primero se clona un oráculo de reglas (4000 partidas) construido a mano (bosque primero, una criatura, Utopia Sprawl y después las auras sobre la criatura más grande); después se etiqueta un evaluador de mulligan; y finalmente se ejecutan dos ciclos de iteración experta (3 rondas de 480 partidas cada uno, con reetiquetado del evaluador de mulligan entre medias). El checkpoint se elige sobre 1000 partidas de validación y las partidas no ganadas en el turno 12 cuentan como turno 13. En la iteración experta, hasta 8 decisiones no obvias por partida se prueban contra 4 futuros rebarajados completados por el modelo, y la opción más rápida se usa como etiqueta.

## Capacidades

- Selección de acciones en un motor de reglas de Magic: The Gathering (Argentum), restringida a las opciones legales de cada decisión.
- Decisiones de tipo `target` (qué criatura recibe un aura), `search` (elecciones en la biblioteca) y `color` (Utopia Sprawl, Benevolent Blessing).
- Modelado de adjunciones: identifica qué criatura lleva qué aura mediante embeddings compartidos.
- Evaluación de mulligan mediante un MLP separado (`mulligan.py`) que predice el turno medio de muerte al mantener una mano con un conjunto dado de cartas en el fondo.
- No soporta tool calling, agentes multi-paso genéricos, visión, audio ni capacidades multilingües.
- No elige ataques, pagos de maná ni respuestas sí/no: esos aspectos están guionizados por el puente.

## Casos de uso

- Investigación en RL aplicado a juegos de cartas: sirve como banco de pruebas reproducible de iteración experta con presupuesto fijo y validación por semillas, gracias a su tamaño mínimo y a la separación entre oráculo, clonación supervisada e iteración.
- Estudio de representación de estado en motores de reglas: el esquema de tokens (global, cartas, opciones) y los embeddings de adjunción son un ejemplo concreto de cómo serializar un estado complejo para un transformer pequeño.
- Optimización de mulligan: el evaluador MLP puede integrarse en herramientas de análisis de manos iniciales para el mazo Selesnya Bogles, estimando el turno medio de muerte de una mano y sus descartes.
- Benchmark de eficiencia de políticas: con 124.162 parámetros, permite medir cuánto rendimiento se obtiene por parámetro frente a políticas más grandes en el mismo dominio.
- Generación de datos sintéticos de partidas: las partidas jugadas por el modelo contra el goldfish pueden usarse como corpus de decisiones etiquetadas para entrenar o evaluar otros agentes.
- Educación y divulgación: ejemplo didáctico de pipeline completo (oráculo, clonación, iteración experta, selección de checkpoint) con código y pesos publicados bajo MIT.

## Benchmarks y rendimiento

Resultados sobre 1000 partidas de test (semillas 10000–10999, ejecución única):

| Metrica | Valor |
|---|---|
| Turno medio de victoria | 5,646 |
| Victorias en turno 4 o antes | 10,8% |
| Victorias en turno 5 o antes | 52,7% |
| Tasa de victoria | 99,7% |
| Decisiones reales por turno | 3,08 |
| Ganancia del evaluador de mulligan sobre la regla manual | 0,42 turnos |
| Ganancia adicional de la iteración experta | ~0,04 turnos |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; los pesos ocupan unos pocos cientos de kilobytes (124.162 parámetros en safetensors).
- GPU recomendadas: cualquiera; el modelo cabe holgadamente en CPU y en cualquier GPU consumer (RTX 4090, RTX 3060, integradas).
- Cabe en cualquier GPU consumer y en CPU sin problema.
- Opciones de despliegue: carga directa con PyTorch y safetensors según el ejemplo de la model card; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de política).
- Latencia y throughput: no disponibles; el coste dominante será el motor Argentum, no la red.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables de la misma categoría (políticas para Magic: The Gathering en Argentum) en la información disponible.

## Limitaciones y advertencias

- Entrenado únicamente contra un goldfish: hexproof nunca importa e ignora bloqueadores y removal.
- Una sola lista de mazo (`deck.dck`, solo mazo principal) y un máximo de 12 turnos.
- Los ataques, el pago de maná y las respuestas sí/no están guionizados por el puente, no los decide el modelo.
- Los pesos de las estadísticas de carta (fuerza, resistencia, puede-atacar) son cero, por lo que el modelo no las utiliza pese a estar presentes en las entradas.
- Sin datos de sesgos, alucinación o cobertura idiomática: no es un modelo de lenguaje y no aplican esas categorías.
- Licencia MIT: permite uso comercial y modificación, pero el modelo depende del motor Argentum y de sus propias licencias para funcionar.
- No apto para producción como agente de juego general: solo resuelve el escenario goldfish con este mazo concreto.

## Enlaces

- Hugging Face: https://huggingface.co/vedalken/gw_bogles
- Demo (goldfish player): https://huggingface.co/spaces/vedalken/monoR_madness
- Motor Argentum: https://github.com/wingedsheep/argentum-engine
