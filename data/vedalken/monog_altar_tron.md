# vedalken/monoG_altar_tron

## Resumen

`vedalken/monoG_altar_tron` es una política neuronal de muy pequeño tamaño (121.986 parámetros) entrenada para jugar un mazo concreto del formato Pauper de Magic: The Gathering: el combo **Altar Tron**. No es un modelo de lenguaje generalista ni un asistente conversacional; es un agente especializado que interactúa con un motor de reglas real de Magic (Argentum) y toma decisiones sobre opciones legales en cada punto de decisión que el motor le plantea. Su único objetivo es matar a un oponente pasivo ("goldfish") con 60 Islands en el menor número de turnos posible, jugando siempre como jugador inicial.

El modelo lo desarrolla el usuario vedalken dentro de un proyecto más amplio que entrena políticas independientes para distintos mazos del formato Pauper, comparando su rendimiento en un banco de pruebas común. La arquitectura es un transformer de 3 capas, anchura 64 y 4 cabezas de atención que puntúa las opciones legales y aplica softmax sobre ellas. Se entrena mediante clonación supervisada de un oráculo de reglas y dos ciclos de expert iteration, con un scorer de mulligan independiente basado en un MLP.

La relevancia de esta ficha es acotada pero instructiva: muestra cómo un modelo minúsculo, con un vocabulario de tokens específico del dominio, puede resolver una tarea de planificación secuencial con reglas estrictas sin necesidad de un LLM. Sirve como referencia para quienes investigan agentes ligeros, RL aplicado a juegos con motor de reglas y evaluación determinista de políticas. La licencia es MIT y el repo pesa 0.0 GB (solo pesos y código).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 3 capas, anchura 64, 4 cabezas de atención; puntúa opciones legales con softmax restringido |
| Parametros totales | 121.986 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; la entrada es una secuencia de tokens por decisión (global + cartas visibles + opciones legales), sin ventana de contexto declarada |
| Tipos de cuantizacion | No disponible; pesos en safetensors de precisión nativa |
| Idiomas soportados | No disponible; no procesa lenguaje natural, opera sobre representaciones estructuradas del motor Argentum |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, también en `extra/`) |

## Arquitectura y entrenamiento

La red es un transformer de 3 capas con anchura 64 y 4 cabezas. Cada decisión que el motor de reglas solicita se convierte en una secuencia de tokens: un token global (turno, vidas, tierras, cartas robadas y hechizos lanzados en el turno, tipo de decisión, fase, biblioteca), un token por cada carta visible con su zona, y un token por cada opción legal. La red puntúa los tokens de opción y aplica softmax únicamente sobre las opciones legales, de modo que la política nunca elige una acción ilegal. Altar Tron añade cinco tipos de decisión específicos: `target`, `search` (Expedition Map, Myr Kinsmith), `color`, `sacrifice` (qué se sacrifica en el Altar) y `scry`.

El entrenamiento parte de un oráculo de reglas construido a mano (prioriza Tron, luego Foundry, Altar, Retrievers y Kinsmith; inicia el bucle con ambos Retrievers en mesa; usa Expedition Map para la tierra de Tron que falte). Se probaron 28 ideas de reglas sobre partidas de validación emparejadas y solo se conservaron las que aceleraban la victoria. Sobre ese oráculo se hace clonación supervisada (4000 partidas) y después dos ciclos de expert iteration: en hasta 8 decisiones no obvias por partida se prueban todas las opciones legales sobre 4 futuros rebarajados terminados por el modelo, se etiqueta la más rápida y se ajusta; se repite. El checkpoint se elige sobre 1000 partidas de validación. Las partidas no ganadas en el turno 12 cuentan como turno 13. La ganancia de expert iteration sobre el oráculo es de solo ~0.05 turnos en este mazo, porque muchas etiquetas volteadas con 4 rebarajados resultaron ser ruido. Un scorer de mulligan separado (MLP, `mulligan.py`) predice el turno medio de muerte al quedarse con una mano dado el conjunto de cartas que se ponen abajo.

## Capacidades

- Toma de decisiones secuenciales sobre opciones legales en un motor de reglas de Magic: The Gathering (Argentum).
- Planificación de combo: ensamblar las tres tierras de Urza, montar el bucle Ashnod's Altar + dos Myr Retrievers, cargar Golem Foundry y atacar con Golems.
- Manejo de cinco tipos de decisión específicos del mazo: `target`, `search`, `color`, `sacrifice` y `scry`.
- Scorer de mulligan integrado que estima el turno de muerte esperado según la mano y las cartas puestas abajo.
- No soporta tool calling, function calling, agentes multi-paso generales, ni capacidades multilingües, de visión o de audio.
- No procesa lenguaje natural; su entrada es una featurización estructurada de mensajes del bridge de Argentum.

## Casos de uso

- **Evaluación de políticas ligeras en motores de reglas**: sirve como referencia de hasta dónde llega un transformer de 121.986 parámetros en una tarea de planificación con acciones restringidas, útil para comparar con baselines de búsqueda o RL clásico.
- **Generación de datos sintéticos de partidas**: al jugar de forma determinista contra un goldfish, produce trazas reproducibles de decisiones y estados que pueden usarse para depurar el motor Argentum o para entrenar otros agentes.
- **Banco de pruebas de mazos de Pauper**: el proyecto entrena una política por mazo y las compara en el mismo banco de 1000 semillas; este modelo es la referencia del arquetipo Altar Tron.
- **Investigación en expert iteration con presupuesto fijo**: el modelo documenta un ciclo completo (oráculo, clonación, dos ciclos de expert iteration, selección de checkpoint) con un presupuesto acotado, útil como plantilla metodológica.
- **Estudio de ruido en etiquetado por rollout**: el hallazgo de que la ganancia de expert iteration es de solo ~0.05 turnos con 4 rebarajados es un dato concreto para quienes diseñan esquemas de etiquetado por búsqueda.
- **Demostración interactiva**: el modelo se puede ver jugar junto a los demás mazos en el Space público del proyecto, lo que permite inspeccionar su comportamiento sin infraestructura propia.

## Benchmarks y rendimiento

Resultados sobre 1000 partidas de test (semillas 10000–10999, ejecución única), según la model card:

| Metrica | `/` (standard) | `extra/` (variante de reglas) |
|---|---|---|
| Turno medio de muerte | 7.823 | 7.376 |
| Victorias en turno 4 o antes | 0.1% | 1.7% |
| Victorias en turno 5 o antes | 3.5% | 10.3% |
| Win rate | 98.1% | 99.1% |
| Decisiones reales por turno | 11.11 | 9.83 |

Nota: `extra/` no es más cómputo, sino una variante de reglas en la que la línea de Weather the Storm cuenta como victoria en el turno en que está lista (`COMBO_WIN=1`); sus números solo son comparables entre sí, no con los de `/`. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni tendrían sentido para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy inferior a 1 GB; con 121.986 parámetros en safetensors de precisión nativa, los pesos ocupan del orden de cientos de kilobytes.
- GPU recomendadas: cualquier GPU con soporte PyTorch; no requiere A100, H100 ni RTX 4090. Cabe en CPU sin problema.
- Cabe en cualquier GPU consumer y en la mayoría de entornos integrados; el cuello de botella es el motor Argentum, no la red.
- Opciones de despliegue: PyTorch nativo cargando `model.safetensors` con `safetensors.torch.load_file` y el `Policy` de `model.py`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles. La model card sí indica que la búsqueda de rollout de un paso en tiempo de juego con la misma red cuesta unos 30 minutos de CPU por partida, lo que da una idea del coste del motor, no del forward de la red.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `vedalken/monoG_altar_tron` | 121.986 | No aplica (secuencia por decisión) | Turno medio 7.823, win rate 98.1% en 1000 partidas | MIT | Hugging Face |
| Otras políticas del mismo proyecto (p. ej. `monoR_madness`) | No disponible en la información proporcionada | No aplica | No disponible | No disponible | Hugging Face (Space del proyecto) |
| LLMs generalistas para agentes | Órdenes de magnitud superiores | Decenas de miles de tokens | No comparable: no juegan con motor de reglas sin integración específica | Varía | Varía |

No se dispone de datos de benchmarks de las otras políticas del proyecto ni de alternativas externas comparables en la información proporcionada.

## Limitaciones y advertencias

- Entrenado solo contra un goldfish: ignora por completo las criaturas y el removal del oponente, por lo que no es válido para partidas reales.
- Una única lista de mazo (`deck.dck`, solo banco principal), máximo 12 turnos y como mucho 100 hechizos por turno (para que el bucle gratuito no sea infinito).
- Ataques, pago de maná y prompts de sí/no están guionizados por el bridge, no los decide el modelo.
- La variante `extra/` cambia las reglas de victoria y no es comparable con la estándar.
- Riesgo de sobreajuste al oráculo y al banco de semillas concreto; la ganancia de expert iteration es marginal (~0.05 turnos).
- Alucinación no aplica en el sentido de lenguaje natural, pero sí existe riesgo de que la política elija líneas subóptimas fuera de la distribución de entrenamiento (manos o estados no vistos).
- Licencia MIT: permite uso comercial y modificación, pero el modelo depende del motor Argentum y de la propiedad intelectual de Magic: The Gathering, cuyos términos deben revisarse por separado.
- Sesgos conocidos: no documentados más allá del sesgo estructural hacia la línea de combo Altar Tron.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vedalken/monoG_altar_tron
- Space de demostración (goldfish player): https://huggingface.co/spaces/vedalken/monoR_madness
- Motor de reglas Argentum: https://github.com/wingedsheep/argentum-engine
