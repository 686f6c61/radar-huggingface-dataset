# yoheikobashi/ptcg-dusknoir-deberta-reranker

## Resumen

El modelo `yoheikobashi/ptcg-dusknoir-deberta-reranker` es un cross-encoder de reranking desarrollado por yoheikobashi para la competición Kaggle "PTCG AI Battle Challenge" (2026) de The Pokémon Company. Su función es seleccionar el mejor movimiento legal en cada turno de una partida de Pokémon TCG, pilotando específicamente el mazo dragapult_dusknoir. El estado del juego se serializa en un prompt de texto compacto (sin glosario, con tablero, hechos ocultos e ID del mazo oponente) y cada movimiento candidato se puntúa como un par (estado, candidato); el movimiento con mayor puntuación es el que se ejecuta.

El modelo se basa en DeBERTa-v3-base, con aproximadamente 186,6 millones de parámetros, y añade unos 3.000 tokens de dominio (identificadores de cartas, ataques y mazos) al vocabulario. Se entrenó primero con fine-tuning supervisado (SFT) sobre partidas autogeneradas por un motor de juego, y posteriormente con un proceso de refuerzo (mirror-RL / field DPO) durante unas 67 rondas, con una puerta de validación por ronda contra un campo de 8 mazos. El checkpoint final (ronda 49, brazo b) defendió la puerta durante las últimas 18 rondas y se desplegó como submission `dusk_v3/v4` con una versión optimizada en ONNX (vocabulario podado, cuantización INT8 solo pesos), alcanzando un rating en vivo de 398,2.

La relevancia de este modelo radica en su enfoque práctico: demuestra cómo un transformer de tamaño medio puede resolver una tarea de razonamiento estratégico en un juego de cartas complejo, combinando técnicas de RL (DPO) con optimización para despliegue en entornos con recursos limitados (2 vCPU, 480 segundos de tiempo). Es un ejemplo de aplicación de modelos de lenguaje a dominios específicos más allá de la generación de texto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3-base (cross-encoder) |
| Parametros totales | 186.628.609 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (limitada a la serialización del estado de juego) |
| Tipos de cuantizacion | INT8 (weight-only) en ONNX; fp32 en safetensors |
| Idiomas soportados | no disponibles (probablemente solo tokens técnicos del juego) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en DeBERTa-v3-base, una arquitectura transformer con atención disentangled y mejoras sobre BERT. Se añadieron aproximadamente 3.000 tokens de dominio al vocabulario para representar identificadores de cartas, ataques y mazos de Pokémon TCG. El entrenamiento se realizó en dos fases: primero un fine-tuning supervisado (SFT) sobre partidas autogeneradas por un motor de juego (self-play), y después un proceso de refuerzo con espejo (mirror-RL) y DPO (Direct Preference Optimization) sobre pares de decisiones de baja confianza de la propia política, con una puerta de validación por ronda (playout-gated) contra un campo de 8 mazos. El checkpoint final (ronda 49, brazo b) superó la puerta durante 18 rondas consecutivas.

La innovación técnica principal es el uso de DPO en un entorno de juego de cartas, donde las preferencias se generan a partir de simulaciones de playout. Además, para el despliegue se aplicó poda de vocabulario y cuantización INT8 solo pesos, reduciendo el modelo a un bundle ONNX de 166 MiB que funciona en 2 vCPU con un banco de tiempo de 480 segundos y un mecanismo de respaldo al motor de juego.

## Capacidades

- Reranking de movimientos legales en Pokémon TCG: dado un estado serializado como texto y una lista de movimientos candidatos, el modelo puntúa cada par (estado, candidato) y selecciona el de mayor puntuación.
- Razonamiento estratégico específico para el mazo dragapult_dusknoir, optimizado para enfrentarse a un campo de 8 mazos oponentes.
- Entrenado con técnicas de RL (DPO) para mejorar decisiones de baja confianza, lo que sugiere cierta capacidad de autoevaluación.
- No es un modelo de generación de texto general; su salida es una puntuación (cross-encoder).
- No soporta tool calling, agentes ni razonamiento multi-paso fuera de su tarea específica.
- No tiene capacidades multilingües ni de visión; trabaja exclusivamente con la serialización textual del estado.

## Casos de uso

- Competición Kaggle "PTCG AI Battle Challenge": el modelo se usó como motor de decisión para el mazo dragapult_dusknoir, logrando un rating en vivo de 398,2.
- Simulación de partidas de Pokémon TCG: puede integrarse en entornos de simulación para evaluar estrategias de mazos específicos.
- Investigación en RL para juegos de cartas: el enfoque de DPO con puerta de playout puede servir como referencia para otros dominios de decisión secuencial.
- Optimización de modelos para despliegue en entornos con restricciones: la versión ONNX INT8 (166 MiB, 2 vCPU) demuestra cómo reducir un transformer para inferencia de baja latencia.
- Benchmarking de técnicas de fine-tuning y RL en dominios especializados: el modelo puede compararse con variantes entrenadas con otros métodos.
- Extensión a otros juegos de cartas: la serialización textual del estado y el enfoque de reranking podrían adaptarse a juegos similares con reglas y mazos definidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo está especializado en una tarea de juego. La model card reporta los siguientes resultados de validación local:

| Metrica | Valor |
|---|---|
| Gate final local (150 partidas/oponente, oponentes engine_v2) | 43,9% global |
| Frente a ethan_hooh | 63,3% |
| Frente a dudunsparce | 62,0% |
| Frente a dragapult | 59,3% |
| Frente a marnie | 34,7% |
| Frente a alakazam_nz | 28,7% |
| Frente a ogerpon_mono | 18,7% |
| Rating en vivo (submission dusk_v3/v4) | 398,2 |

Estos datos provienen de la model card del autor y reflejan el rendimiento en el entorno de competición, no en benchmarks generales de NLP.

## Requisitos de hardware

- Bundle ONNX desplegado: 166 MiB, funciona en 2 vCPU con 480 segundos de banco de tiempo y respaldo al motor de juego.
- No se especifica VRAM, pero al ser un cross-encoder de 186M parámetros, la inferencia puede ejecutarse en GPUs consumer (por ejemplo, RTX 3060 o superior) con cuantización INT8.
- Opciones de despliegue: ONNX Runtime (probablemente), aunque no se mencionan explícitamente vLLM, llama.cpp u Ollama; al ser un cross-encoder, no es adecuado para motores de generación de texto.
- Latencia y throughput: no disponibles; el diseño con 2 vCPU sugiere que la inferencia es ligera, pero no hay datos concretos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directamente, ya que este es un modelo muy específico para una tarea de juego de cartas. Podría compararse con el modelo base DeBERTa-v3-base, pero no es una comparación justa porque el fine-tuning y la serialización son específicos del dominio. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El modelo está especializado en el mazo dragapult_dusknoir y en el formato de serialización utilizado; cambios en el mazo o en la representación del estado degradarían su rendimiento.
- Depende de la calidad de la serialización textual; si el estado no se captura correctamente, las decisiones pueden ser subóptimas.
- El entrenamiento con DPO y puerta de playout puede provocar sobreajuste al campo de oponentes específico; el rendimiento frente a mazos no vistos podría ser inferior.
- No es un modelo de lenguaje general; no puede utilizarse para generación de texto, chat u otras tareas de NLP.
- La licencia MIT permite uso comercial, pero el modelo está vinculado a Pokémon TCG, cuyos derechos pertenecen a The Pokémon Company; su uso en productos comerciales podría requerir licencias adicionales.
- No se han documentado sesgos ni riesgos de alucinación, pero al ser un modelo de puntuación, no genera texto libre.

## Enlaces

- HuggingFace: https://huggingface.co/yoheikobashi/ptcg-dusknoir-deberta-reranker
- Código fuente: https://github.com/yohei-kobashi/pokemon-card-bert
