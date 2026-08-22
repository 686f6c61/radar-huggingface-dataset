# spade-rl/SPADE-Qwen3-30B-A3B-Games

## Resumen

SPADE-Qwen3-30B-A3B-Games es un checkpoint del proyecto SPADE (Self-Play in Adaptive Synthetic Executable Environments), desarrollado por el equipo spade-rl. El modelo se basa en Qwen/Qwen3-30B-A3B-Instruct-2507, un modelo de arquitectura Mixture of Experts (MoE) con 30.5 mil millones de parámetros totales y 3 mil millones activos. SPADE entrena un único modelo en dos roles: como proponente, que escribe entornos ejecutables (juegos), y como actor, que los resuelve. El proponente es recompensado por generar entornos en la frontera de lo que el actor puede resolver actualmente, creando así un currículo adaptativo que evoluciona con la política del modelo.

Este checkpoint concreto corresponde al ajuste para el escenario de juegos, entrenado sobre un corpus de 15 000 juegos sintéticos. El checkpoint publicado es la iteración 79, seleccionada entre 21 evaluadas por su mejor rendimiento agregado (GEM overall 0.836, LiveCodeBench-v6 0.849). La relevancia de este modelo radica en que demuestra cómo el auto-juego con generación de entornos sintéticos puede mejorar el razonamiento procedimental, la generación de código y las capacidades científicas sin necesidad de datos externos adicionales, superando el punto de saturación de los baselines con entornos fijos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Qwen3, con modo pensamiento y no pensamiento |
| Parametros totales | 30 532 122 624 (30.5B) |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-30B-A3B-Instruct-2507, un MoE con 30.5B parámetros totales y 3B activos por token, que integra un modo pensamiento para razonamiento multi-paso y un modo no pensamiento para respuestas rápidas. Sobre esta base, SPADE aplica un esquema de auto-juego: el modelo actúa como proponente generando entornos ejecutables (juegos) y como actor resolviéndolos. El proponente recibe recompensa por producir entornos que están en la frontera de capacidad del actor, lo que genera un currículo adaptativo que se ajusta continuamente al progreso de la política.

El entrenamiento se realiza mediante aprendizaje por refuerzo, con entornos generados online y anclados en un corpus de 15 000 juegos (spare-rl/spade-grounding-corpus-games-15k). No se especifican el número total de tokens de entrenamiento ni el uso de RLHF o DPO. El checkpoint publicado (iter79) fue elegido entre 21 evaluados porque los puntajes alcanzan su máximo temprano y declinan en iteraciones posteriores, lo que sugiere cierta inestabilidad en el entrenamiento a largo plazo.

## Capacidades

- Generación de texto y razonamiento multi-paso gracias al modo pensamiento heredado de Qwen3.
- Generación de entornos ejecutables (juegos) con lógica interactiva, como parte del rol de proponente.
- Resolución de tareas de razonamiento procedimental, matemáticas, ciencia y generación de código, según los benchmarks reportados.
- Mejora en benchmarks de código (LiveCodeBench-v6 0.849) y razonamiento general (GEM overall 0.836).
- Capacidad de auto-mejora mediante auto-juego: el modelo puede seguir generando entornos más difíciles a medida que mejora su capacidad de resolución.
- Soporte de conversación multi-turno (etiqueta conversational), aunque no se detalla si incluye tool calling o function calling en este checkpoint.

## Casos de uso

- Generación de entornos de entrenamiento para agentes de refuerzo: el modelo puede crear juegos sintéticos con dificultad adaptativa, útiles para entrenar políticas de RL sin necesidad de diseñar entornos manualmente.
- Evaluación de agentes en entornos procedimentales: al generar y resolver juegos, sirve como banco de pruebas para medir capacidades de razonamiento secuencial y planificación.
- Generación de código en entornos interactivos: el modelo puede escribir código que define reglas de juego y lógica condicional, aplicable a prototipos de simulación o herramientas educativas.
- Razonamiento científico y matemático: aunque no se entrenó con preguntas de ciencia o problemas de benchmark, mejora en estas áreas gracias a la diversidad de los juegos generados, por lo que puede usarse como asistente en tareas de razonamiento abstracto.
- Investigación en auto-juego y currículo adaptativo: el modelo es un punto de referencia para estudiar cómo la generación de entornos sintéticos afecta al aprendizaje por refuerzo, especialmente en comparación con baselines de entorno fijo.
- Desarrollo de juegos educativos o de lógica: el modelo puede proponer y resolver puzzles, acertijos o minijuegos, sirviendo como motor de generación de contenido en aplicaciones de entretenimiento o formación.

## Benchmarks y rendimiento

Según la model card, el checkpoint publicado (iter79) fue seleccionado entre 21 evaluados por su mejor rendimiento agregado. Los datos disponibles son:

| Benchmark | Resultado |
|---|---|
| GEM overall | 0.836 |
| LiveCodeBench-v6 | 0.849 |

No se han publicado resultados detallados de otros benchmarks (MMLU, GSM8K, HumanEval, etc.) en la información proporcionada. La página del proyecto indica que el entrenamiento con juegos sintéticos mejora el razonamiento científico, la generación de código y el razonamiento procedimental, mientras que las matemáticas competitivas se preservan, pero no se ofrecen cifras concretas. Tampoco se proporcionan comparaciones numéricas con otros modelos en la misma suite de evaluación.

## Requisitos de hardware

- Al ser un MoE con 3B parámetros activos, la memoria necesaria para inferencia es significativamente menor que la de un modelo denso de 30B, aunque los pesos totales (30.5B) deben estar cargados en memoria.
- En FP16, se estima que el modelo requiere entre 60 y 70 GB de VRAM para cargar todos los pesos (30.5B × 2 bytes), aunque solo una fracción se activa por token. Con cuantización a 4 bits, podría reducirse a unos 15-20 GB, lo que permitiría ejecutarlo en GPUs consumer de gama alta como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- No se han publicado requisitos oficiales de hardware ni mediciones de latencia o throughput.
- El modelo es compatible con endpoints (endpoints_compatible) y puede desplegarse con vLLM, TGI u otros servidores de inferencia compatibles con transformers. FriendliAI ofrece un endpoint de inferencia de baja latencia para este modelo.
- Para uso en local, se recomienda al menos una GPU con 24 GB de VRAM si se usa cuantización, o varias GPUs para FP16.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos en los mismos benchmarks. Sin embargo, se puede comparar cualitativamente con el modelo base y con otros checkpoints de SPADE:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| SPADE-Qwen3-30B-A3B-Games | 30.5B | 3B | no disponible | Apache 2.0 | Entrenado con auto-juego en entornos de juegos |
| Qwen3-30B-A3B-Instruct-2507 | 30.5B | 3B | no disponible | Apache 2.0 | Modelo base, sin entrenamiento SPADE |
| SPADE-Qwen3-8B (mencionado en GitHub) | 8B | no disponible | no disponible | Apache 2.0 | Variante a menor escala del mismo método |

No se dispone de datos de rendimiento de estos modelos en los mismos benchmarks para una comparación cuantitativa. La página del proyecto indica que SPADE supera a los baselines de entorno fijo en varios benchmarks, pero no se ofrecen cifras específicas.

## Limitaciones y advertencias

- El modelo es un checkpoint de investigación, no un producto final. Los puntajes de evaluación declinan en iteraciones posteriores a la 79, lo que sugiere inestabilidad en el entrenamiento y posible degradación si se continúa el auto-juego.
- No se han documentado sesgos específicos, pero al estar entrenado principalmente con juegos sintéticos, puede tener limitaciones en tareas del mundo real que requieran conocimiento factual o contextual.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de generación de código o razonamiento abstracto.
- La longitud de contexto no está especificada en la información disponible; se recomienda verificar la del modelo base Qwen3-30B-A3B-Instruct-2507 antes de usarlo con entradas largas.
- No se confirma soporte de tool calling o function calling en este checkpoint, aunque el proyecto SPADE incluye un escenario de tool use en otros checkpoints.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo derivado de Qwen3, se deben respetar los términos de la licencia original de Qwen3 (también Apache 2.0).

## Enlaces

- HuggingFace: https://huggingface.co/spade-rl/SPADE-Qwen3-30B-A3B-Games
- GitHub del proyecto: https://github.com/spade-rl/spade
- Página del proyecto: https://spade-rl.github.io/
- Paper en arXiv: https://arxiv.org/html/2608.19197v1
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/spade-rl/SPADE-Qwen3-30B-A3B-Games
- Corpus de grounding (games): https://huggingface.co/datasets/spare-rl/spade-grounding-corpus-games-15k
- Reporte técnico de Qwen3: https://arxiv.org/html/2505.09388v1
