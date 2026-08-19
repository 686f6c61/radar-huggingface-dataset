# yoheikobashi/ptcg-qwen3-4b-dpo-loras

## Resumen

El modelo `yoheikobashi/ptcg-qwen3-4b-dpo-loras` es un conjunto de adaptadores LoRA (Low-Rank Adaptation) desarrollados por yoheikobashi para especializar el modelo base `yoheikobashi/ptcg-qwen3-4b-cardfirst-v40` en la toma de decisiones dentro del juego de cartas Pokemon TCG. El proyecto aborda el problema de refinar la política de un agente de juego mediante DPO (Direct Preference Optimization), utilizando pares de preferencias generados de forma automática a partir de las propias decisiones de baja confianza del modelo, filtradas con un mecanismo de "playout-gated" (24 playouts por etiqueta y umbrales de +-4 puntos).

La relevancia de este trabajo radica en su enfoque metodológico: en lugar de depender de datos anotados por humanos, extrae señales de preferencia del propio entorno de simulación, lo que reduce costes y permite iterar rápidamente sobre estrategias específicas. El repositorio incluye múltiples adaptadores: `dpo_r8/` para el roster completo y `lora_<deck>_r*/` para mazos individuales, lo que permite una especialización fina por arquetipo de baraja. Al estar basado en Qwen3-4B, hereda la arquitectura transformer del modelo base, aunque la ficha no especifica la longitud de contexto ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen3-4B (transformer) |
| Parametros totales | No disponible (depende del modelo base Qwen3-4B; el repositorio de adaptadores pesa 3.6 GB) |
| Parametros activos | No disponible (al ser LoRA, en inferencia se utiliza el modelo base completo) |
| Longitud de contexto | No especificada (hereda la del modelo base Qwen3-4B) |
| Tipos de cuantizacion | No especificada (aplicable sobre el modelo base cuantizado) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT) |

## Arquitectura y entrenamiento

El modelo se compone de adaptadores LoRA que se insertan en las capas del transformer del modelo base `yoheikobashi/ptcg-qwen3-4b-cardfirst-v40`, el cual es a su vez un fine-tuning de Qwen3-4B. El entrenamiento emplea DPO, una técnica de optimización directa de preferencias que evita la necesidad de un modelo de recompensa separado. Los pares de preferencias se construyen mediante un proceso de "playout-gated": se ejecutan 24 playouts (simulaciones de juego) para cada decisión candidata, y se aplican umbrales de +-4 puntos para aceptar o revertir la preferencia, filtrando así las decisiones de bajo margen y reduciendo el ruido en las etiquetas.

El proceso de entrenamiento se divide en rondas: `dpo_r8/` corresponde a la ronda final con el roster completo de cartas, mientras que `lora_<deck>_r*/` son rondas específicas para mazos concretos. Esta estructura modular permite actualizar la política global y, al mismo tiempo, mantener adaptadores especializados para arquetipos de baraja particulares. No se especifican detalles sobre el número total de tokens de entrenamiento, la composición del dataset ni el uso de técnicas adicionales como RLHF o decodificación especulativa.

## Capacidades

- Toma de decisiones en partidas de Pokemon TCG, incluyendo selección de cartas, uso de habilidades y elección de ataques.
- Generación de texto condicionada al estado del tablero, si el modelo base lo soporta (no se detalla en la ficha).
- Especialización por mazos mediante adaptadores independientes, lo que permite ajustar el comportamiento a estrategias concretas.
- Refinamiento de política mediante preferencias generadas por simulación, sin necesidad de anotación humana.
- No se especifican capacidades de tool calling, vision, audio ni razonamiento multi-paso fuera del ámbito del juego.

## Casos de uso

- Desarrollo de agentes autónomos para jugar al Pokemon TCG: el modelo puede integrarse en un bucle de juego que reciba el estado actual de la partida y devuelva la siguiente acción, aprovechando los adaptadores por mazo para ajustar la estrategia.
- Simulación de partidas para testeo de mazos: los adaptadores permiten evaluar rápidamente la viabilidad de una baraja enfrentándola contra el modelo base o contra otros adaptadores.
- Análisis de decisiones en posiciones complejas: al estar entrenado con DPO sobre decisiones de bajo margen, puede servir para identificar jugadas subóptimas en situaciones ambiguas.
- Entrenamiento de bots para plataformas de juego online: el modelo puede desplegarse como oponente en entornos de prueba o como asistente de práctica para jugadores humanos.
- Investigación en RL/DPO aplicado a juegos de cartas: el repositorio ofrece un caso práctico de cómo generar preferencias sintéticas mediante playouts, útil para experimentos académicos.
- Generación de explicaciones de jugadas: si el modelo base genera texto, el adaptador puede combinarse para producir descripciones de las decisiones tomadas, facilitando la depuración de estrategias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos de juego de cartas.

## Requisitos de hardware

- Al ser un adaptador LoRA, el requisito principal es el del modelo base Qwen3-4B.
- Qwen3-4B en FP16 requiere aproximadamente 8 GB de VRAM para inferencia.
- Con cuantizacion a 4 bits, puede ejecutarse en GPUs de consumo como RTX 3060 (12 GB) o RTX 4060 Ti (16 GB).
- GPUs recomendadas: RTX 3090, RTX 4090, A10G o L4 para un rendimiento fluido sin cuantizacion.
- Despliegue: los adaptadores pueden cargarse con la libreria PEFT de HuggingFace Transformers, o fusionarse con el modelo base y exportarse a GGUF para su uso con llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ptcg-qwen3-4b-dpo-loras` (este) | No disponible (base Qwen3-4B) | No especificado | DPO sobre playouts | Apache 2.0 | HuggingFace |
| `ptcg-qwen3-4b-cardfirst-v40` (base) | 4B (Qwen3-4B) | No especificado | Fine-tuning supervisado | Apache 2.0 | HuggingFace |
| Qwen3-4B (modelo original) | 4B | 32k o 128k segun variante | Pre-entrenamiento + RLHF | Apache 2.0 | HuggingFace |

No se dispone de información sobre otros modelos específicos para Pokemon TCG que permitan una comparativa directa. La comparativa se limita al modelo base y al modelo original de Qwen.

## Limitaciones y advertencias

- Específico para Pokemon TCG; no es un modelo de propósito general y su uso fuera de este dominio no está validado.
- Requiere el modelo base `yoheikobashi/ptcg-qwen3-4b-cardfirst-v40` para funcionar; no es un modelo autónomo.
- No hay benchmarks publicados que validen su rendimiento frente a otras estrategias o agentes.
- El entrenamiento con DPO sobre decisiones de baja confianza puede introducir sesgos hacia las estrategias que el propio modelo ya consideraba, limitando la exploración de alternativas.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto experimental sin validación externa.
- La licencia Apache 2.0 permite uso comercial, pero el uso de marcas y materiales de Pokemon TCG puede estar sujeto a restricciones legales de The Pokemon Company.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que dificulta evaluar su comportamiento en entornos multilingües o con secuencias largas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/yoheikobashi/ptcg-qwen3-4b-dpo-loras
- Modelo base: https://huggingface.co/yoheikobashi/ptcg-qwen3-4b-cardfirst-v40
- Codigo fuente: https://github.com/yohei-kobashi/pokemon-card-bert
