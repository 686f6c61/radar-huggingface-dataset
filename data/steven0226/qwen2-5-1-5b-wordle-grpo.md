# steven0226/qwen2.5-1.5b-wordle-grpo

## Resumen

`steven0226/qwen2.5-1.5b-wordle-grpo` es un adaptador LoRA entrenado mediante GRPO (Group Relative Policy Optimization) sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`, con el objetivo de convertirlo en un agente capaz de jugar al juego Wordle en un entorno multi-turno. El proyecto demuestra un enfoque de "agente entrenado en los pesos" en lugar de "agente guiado por prompt": todas las decisiones de juego se codifican en los pesos del modelo durante el entrenamiento por refuerzo, no en instrucciones cada vez más largas.

El adaptador se publica bajo licencia Apache-2.0 y está diseñado para cargarse junto con el modelo base compatible. El entrenamiento se realizó en un entorno Wordle donde el modelo genera una palabra en formato `<guess>word</guess>` en cada turno y recibe retroalimentación del entorno (G/Y/X) como turno de usuario, con un máximo de 6 intentos por partida. La evaluación reportada muestra una tasa de victoria del 2,81% sobre 463 partidas de prueba, con una adherencia al protocolo del 99,85% y un 99,82% de acciones legales, lo que indica que el modelo aprendió la mecánica del juego pero no desarrolló una estrategia de resolución efectiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2.5-1.5B-Instruct (Transformer decoder-only) con adaptador LoRA |
| Parámetros totales | 1,54B (modelo base) + adaptador LoRA (rank 16, alpha 32, dropout 0,05) |
| Parámetros activos | 1,54B (modelo base) + ~0,1 GB de adaptador LoRA |
| Longitud de contexto | 32.768 tokens (contexto estándar de Qwen2.5) |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | Inglés (solo el entorno Wordle y las instrucciones están en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base es un Qwen2.5-1.5B-Instruct, un transformer decoder-only con 1.54B parámetros y 32.768 tokens de contexto, preentrenado por Alibaba en un corpus multilingüe de hasta 18 billones de tokens. Sobre este modelo se entrena un adaptador LoRA con rank 16, alpha 32 y dropout 0,05, utilizando la librería PEFT y la tarea de modelado de lenguaje causal.

El entrenamiento se realiza mediante GRPO (Group Relative Policy Optimization) en un entorno Wordle multíurno. El modelo recibe como entrada el estado del juego (palabras adivinadas y retroalimentación G/Y/X) y debe producir una palabra válida en cada turno. El entorno devuelve la retroalimentación como turno de usuario, permitiendo hasta 6 intentos. El objetivo del entrenamiento es maximizar la probabilidad de ganar la partida, aunque la evaluación muestra que el aprendizaje de protocolo fue exitoso (99,85% de adherencia al formato esperado) pero el aprendizaje estratégico quedó limitado (solo 2,81% de victorias).

## Capacidades

- Generación de texto en inglés (heredada del modelo base Qwen2.5-1.5B-Instruct).
- Generación de respuestas en formato estructurado `<guess>word</guess>` para el juego Wordle.
- Capacidad de recibir retroalimentación del entorno (G/Y/R) y generar la siguiente palabra en un bucle de múltiples turnos.
- Adherencia al protocolo de juego (99,85% de las acciones siguen el formato esperado).
- Acciones legales en el juego (99,82% de las acciones son palabras válidas según las reglas).
- No hay evidencia de capacidades de razonamiento general, código o matemáticas más allá de lo que el modelo base ya ofrece.

## Casos de uso

- Investigación en aprendizaje por refuerzo para agentes conversacionales: el adaptador es un ejemplo de cómo entrenar un agente multi-turno con GRPO en un entorno de juego, y puede servir como referencia para experimentos similares en otros dominios.
- Demostración de entrenamiento de agentes en pesos: permite estudiar cómo el comportamiento de un agente puede codificarse en los pesos del modelo en lugar de en el prompt, lo que puede ser útil para tareas donde el contexto es limitado o se requiere latencia baja.
- Benchmark de evaluación de protocolo: la evaluación reportada (adherencia al protocolo, acciones legales) puede usarse como métrica para comparar diferentes estrategias de entrenamiento por refuerzo.
- Entrenamiento de adaptadores LoRA para juegos de lógica: el método puede extrapolarse a otros juegos de lógica o tareas de planificación de múltiples pasos, aunque la evaluación muestra que la estrategia aún es débil.
- Estudio de límites del RL en modelos pequeños: el resultado del 2,81% de victorias ilustra las limitaciones de entrenar agentes de juego con modelos de 1.5B y GRPO, lo que puede orientar decisiones sobre el tamaño del modelo y la complejidad del entorno.
- Integración en pipelines de investigación de agentes RL: el adaptador puede usarse como punto de partida para experimentos de transferencia, ajuste fino adicional o comparación con otros métodos de entrenamiento de agentes.

## Benchmarks y rendimiento

La evaluación reportada en la model card es una evaluación pareada y codiciosa sobre un conjunto de prueba completo de 463 palabras (split con seed 42). Los resultados son:

| Medida | Modelo base | Adaptador LoRA entrenado |
|---|---:|---:|
| Victorias | 0/463 (0%) | 13/463 (2,81%) |
| Intervalo de confianza Wilson 95% | 0,00%–0,82% | 1,65%–4,74% |
| Adherencia al protocolo | 0% | 2749/2753 (99,85%) |
| Acciones legales | 0% | 2748/2753 (99,82%) |

La discordancia pareada fue de 0 victorias solo del modelo base y 13 victorias solo del adaptador. El resultado del test exacto pareado de McNemar fue `0.000244140625`, y con ajuste Bonferroni para dos looks (evaluación intermedia y final) fue `0.00048828125`. No se han publicado benchmarks estándar como MMLU, HumanEval o GSM8K para este adaptador específico.

## Requisitos de hardware

- El adaptador LoRA tiene un tamaño de 0,1 GB, por lo que la memoria adicional necesaria es mínima.
- El modelo base Qwen2.5-1.5B-Instruct requiere aproximadamente 3 GB de VRAM en precisión FP16, lo que cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4090 (24 GB) o cualquier GPU con al menos 4 GB de VRAM.
- Para la inferencia, se puede cargar con Transformers + PEFT (como se muestra en el README) o convertir el modelo base a cuantización GGUF (por ejemplo, Q4_K_M) y usar llama.cpp u Ollama para una inferencia más ligera.
- No se han publicado datos de latencia o throughput específicos para este adaptador.
- Para el entrenamiento con GRPO, se requirió un entorno GPU histórico no reconstruible, pero se puede replicar con una GPU de 24 GB (por ejemplo, RTX 4090) o superior para el entrenamiento del adaptador.

## Comparativa con modelos similares

| Modelo | Tamaño | Contexto | Licencia | Uso |
|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (base) | 1.54B | 32K | Apache-2.0 | Modelo base sin entrenamiento específico para Wordle; 0% de victorias |
| Qwen2.5-1.5B-Instruct + LoRA GRPO (este) | 1.54B + LoRA | 32K | Apache-2.0 | Agente Wordle con 2,81% de victorias y alta adherencia al protocolo |
| Qwen2.5-3B-Instruct | 3.09B | 32K | Apache-2.0 | Modelo base más grande, sin entrenamiento específico para Wordle |

La comparación directa con otros modelos entrenados para Wordle no está disponible, ya que este es un adaptador experimental y no hay modelos similares públicos con la misma configuración. El modelo base Qwen2.5-1.5B-Instruct es el punto de comparación natural: sin entrenamiento, no produce ninguna acción legal ni victorias, mientras que el adaptador aprende el protocolo pero no la estrategia.

## Limitaciones y advertencias

- El modelo no es un solucionador práctico de Wordle: la tasa de victorias es solo del 2,81%, estadísticamente distinguible del modelo base pero insuficiente para uso real.
- El aprendizaje de estrategia es débil: el modelo reutiliza letras ausentes en 1340/2290 turnos con información y rompe posiciones verdes conocidas en 1119/2290 turnos.
- Solo se ha evaluado en inglés y en el entorno específico de Wordle; no hay evidencia de generalización a otros dominios.
- La licencia Apache-2.0 cubre el adaptador, pero las listas de palabras cfreshman utilizadas para el entorno no tienen licencia explícita y no están cubiertas por Apache-2.0.
- La trazabilidad completa del entrenamiento no es posible: no se conservó el commit exacto del modelo base upstream, el entorno GPU no es reconstruible bit a bit, y no existe una cadena criptográfica completa de ejecución→código→prompt→paquete→modelo.
- El adaptador no es un modelo independiente; requiere cargar el modelo base Qwen2.5-1.5B-Instruct, y no se debe presentar una revisión contemporánea de Qwen como la revisión criptográficamente probada del entrenamiento.
- Existe riesgo de explotación de la recompensa en el entrenamiento, aunque no se ha excluido completamente.
- No se han publicado resultados de benchmarks generales (MMLU, HumanEval, etc.) para este adaptador.

## Enlaces

- HuggingFace: https://huggingface.co/steven0226/qwen2.5-1.5b-wordle-grpo
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de entrenamiento (GitHub): https://github.com/kuotunyu/agentic-rl-wordle/
- Commit inmutable de evidencia: https://github.com/kuotunyu/agentic-rl-wordle/commit/1a077a45e309594e5bb43743a8b84d89155595d4
- Release estable: https://github.com/kuotunyu/agentic-rl-wordle/releases/tag/v1.0.0
- Modelo en Ollama (referencia del base): https://ollama.com/library/qwen2.5:1.5b
- Página de FriendliAI del modelo: https://friendli.ai/models/steven0226/qwen2.5-1.5b-wordle-grpo</think>## Resumen

`steven0226/qwen2.5-1.5b-wordle-grpo` es un adaptador LoRA entrenado mediante GRPO (Group Relative Policy Optimization) sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`, con el objetivo de convertirlo en un agente capaz de jugar al juego Wordle en un entorno multi-turno. El proyecto demuestra el enfoque de "agente entrenado en los pesos" en lugar de "agente guiado por prompt": todas las decisiones de comportamiento se codifican en los pesos del modelo durante el entrenamiento por refuerzo, y no en instrucciones cada vez más largas.

El adaptador se publica con licencia Apache-2.0 y está diseñado para cargarse junto con el modelo base. En cada turno, el modelo genera una palabra con el formato `<guess>word</guess>` y el entorno devuelve la retroalimentación (G/Y/X) como turno de usuario, permitiendo un máximo de 6 intentos por partida. La evaluación reportada muestra una tasa de victorias del 2,81% sobre 463 partidas de prueba, con una adherencia al protocolo del 99,85% y un 99,82% de acciones legales, lo que indica que el modelo aprendió la mecánica del juego pero no desarrolló una estrategia efectiva de resolución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-1.5B-Instruct) con adaptador LoRA |
| Parámetros totales | 1,54B (modelo base) + adaptador LoRA (rank 16, alpha 32, dropout 0,05) |
| Parámetros activos | 1,54B (modelo base) + adaptador LoRA |
| Longitud de contexto | 32.768 tokens (contexto estándar de Qwen2.5) |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base es un Qwen2.5-1.5B-Instruct, un transformer decoder-only con 1.540 millones de parámetros y una ventana de contexto de 32.768 tokens, preentrenado por Alibaba sobre un corpus multilingüe de hasta 18 billones de tokens. Sobre este modelo se entrena un adaptador LoRA con rank 16, alpha 32 y dropout 0,05, utilizando la librería PEFT y la tarea de modelado causal del lenguaje.

El entrenamiento se realiza mediante GRPO en un entorno Wordle multi-turno. El modelo recibe como entrada el historial de intentos y la retroalimentación del entorno, y genera una palabra en cada paso. El entorno devuelve la retroalimentación como turno de usuario, permitiendo hasta 6 iteraciones por partida. El objetivo de optimización es maximizar la probabilidad de ganar la partida. La evaluación indica que el aprendizaje del protocolo fue exitoso (99,85% de adherencia al formato esperado), pero el aprendizaje estratégico quedó limitado: el modelo reutiliza letras ausentes en 1340/2290 turnos con información y rompe posiciones verdes conocidas en 1119/2290 turnos.

## Capacidades

- Generación de texto en inglés (heredada del modelo base Qwen2.5-1.5B-Instruct).
- Generación de palabras en formato `<guess>word</guess>` para el juego Wordle.
- Capacidad de interacción multi-turno con el entorno: recibe retroalimentación G/Y/X y genera la siguiente jugada.
- Adherencia al protocolo de juego: 99,85% de las respuestas siguen el formato esperado.
- Acciones legales en el juego: 99,82% de las jugadas son palabras válidas según las reglas de Wordle.
- No se ha demostrado capacidad de razonamiento general, generación de código, tool calling o soporte de agentes más allá del entorno específico de Wordle.

## Casos de uso

- Investigación en aprendizaje por refuerzo para agentes multi-turno: el adaptador sirve como ejemplo de cómo entrenar un agente en un entorno de juego con GRPO, y puede usarse como punto de partida para experimentos en otros dominios de decisión secuencial.
- Demostración de entrenamiento de agentes en pesos: ilustra cómo codificar comportamiento de agente en los pesos del modelo en lugar de en el prompt, lo que es útil para tareas con restricciones de longitud de contexto o latencia.
- Benchmark de evaluación de protocolo y legalidad: las métricas de adherencia al protocolo y acciones legales pueden servir como referencia para comparar métodos de entrenamiento de agentes.
- Entrenamiento de adaptadores LoRA para juegos de lógica: el enfoque puede extrapolarse a otros juegos de lógica o tareas de decisión multi-paso, aunque la evaluación actual muestra limitaciones estratégicas.
- Estudio de límites del aprendizaje por refuerzo en modelos pequeños: el resultado del 2,81% de victorias ilustra las dificultades de entrenar agentes con modelos de 1,5B mediante GRPO, lo que es útil para decidir el tamaño del modelo y la complejidad del entorno en futuros experimentos.
- Integración en pipelines de investigación de RL: puede usarse como baseline o punto de partida para experimentos de fine-tuning adicional, comparación con otros métodos de entrenamiento o análisis de robustez.

## Benchmarks y rendimiento

La evaluación reportada es una evaluación pareada y codiciosa sobre el conjunto completo de 463 palabras de prueba (split con seed 42). Los resultados son:

| Medida | Modelo base | Adaptador LoRA |
|---|---:|---:|
| Victorias | 0/463 (0%) | 13/463 (2,81%) |
| Intervalo de confianza Wilson 95% | 0,00%–0,82% | 1,65%–4,74% |
| Adherencia al protocolo | 0% | 2749/2753 (99,85%) |
| Acciones legales | 0% | 2748/2753 (99,82%) |

La discordancia pareada fue de 0 victorias solo del modelo base y 13 solo del adaptador. El test de McNemar pareado dio un valor de `0,000244140625`, que con ajuste de Bonferroni para dos looks (evaluación intermedia y final) se convierte en `0,00048828125`. No se han publicado resultados de benchmarks generales como MMLU, HumanEval o GSM8K para este adaptador.

## Requisitos de hardware

- El adaptador LoRA tiene un tamaño de 0,1 GB, por lo que el requisito adicional de memoria es mínimo.
- El modelo base Qwen2.5-1.5B-Instruct requiere aproximadamente 3 GB de VRAM en FP16, lo que cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4090 (24 GB) o cualquier GPU con al menos 4 GB de VRAM.
- Para inferencia, se puede cargar con Transformers + PEFT, como se muestra en el README, o cuantizar el modelo base a GGUF y usarlo con llama.cpp u Ollama para una ejecución más ligera.
- No se han publicado datos de latencia o throughput específicos para este adaptador.
- Para el entrenamiento con GRPO, el entorno GPU no es reconstruible bit a bit, pero se recomienda una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 4090 o A100) para entrenar el adaptador.

## Comparativa con modelos similares

| Modelo | Tamaño | Contexto | Licencia | Entrenamiento | Victorias en Wordle |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (base) | 1,54B | 32K | Apache-2.0 | Sin entrenamiento específico | 0/463 (0%) |
| Qwen2.5-1.5B-Instruct + LoRA GRPO (este) | 1,54B + LoRA | 32K | Apache-2.0 | GRPO en entorno Wordle | 13/463 (2,81%) |
| Qwen2.5-3B-Instruct | 3,09B | 32K | Apache-2.0 | Sin entrenamiento específico | No evaluado |

No se han encontrado otros adaptadores o modelos públicos entrenados específicamente para Wordle con GRPO, por lo que la comparación directa con modelos similares es limitada. El modelo base Qwen2.5-1.5B-Instruct es el punto de comparación natural: sin entrenamiento, no produce ninguna acción legal ni victoria, mientras que el adaptador aprende el protocolo pero no la estrategia.

## Limitaciones y advertencias

- No es un solucionador práctico de Wordle: la tasa de victorias del 2,81% es estadísticamente distinguible del modelo base, pero no es suficiente para uso real.
- El aprendizaje estratégico es limitado: el modelo reutiliza letras ausentes en 1340/2290 turnos con información y rompe posiciones verdes conocidas en 1119/2290 turnos.
- Solo se ha evaluado en inglés y en el entorno específico de Wordle; no hay evidencia de generalización a otros dominios.
- La licencia Apache-2.0 cubre el modelo, pero las listas de palabras cfreshman utilizadas para el entrenamiento no tienen licencia explícita y no están cubiertas por Apache-2.0.
- La trazabilidad completa del entrenamiento no es posible: no se conservó el commit exacto del modelo base, el entorno de entrenamiento no es reconstruible bit a bit, y no existe una cadena criptográfica completa de ejecución→código→prompt→paquete→modelo.
- El adaptador no es un modelo independiente; requiere cargar el modelo base Qwen2.5-1.5B-Instruct, y no se debe presentar una revisión contemporánea de Qwen como la revisión criptográficamente probada del entrenamiento.
- No se ha excluido completamente la posibilidad de explotación de la recompensa durante el entrenamiento.
- No se han publicado resultados de benchmarks generales de capacidad (MMLU, HumanEval, etc.) para este adaptador.

## Enlaces

- HuggingFace: https://huggingface.co/steven0226/qwen2.5-1.5b-wordle-grpo
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de entrenamiento (GitHub): https://github.com/kuotunyu/agentic-rl-wordle/
- Commit inmutable de evidencia: https://github.com/kuotunyu/agentic-rl-wordle/commit/1a077a45e309594e5bb43743a8b84d89155595d4
- Release estable: https://github.com/kuotunyu/agentic-rl-wordle/releases/tag/v1.0.0
- Modelo en Ollama (referencia del base): https://ollama.com/library/qwen2.5:1.5b
- Página de FriendliAI del modelo: https://friendli.ai/models/steven0226/qwen2.5-1.5b-wordle-grpo
