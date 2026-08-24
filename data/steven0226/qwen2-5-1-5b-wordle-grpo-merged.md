# steven0226/qwen2.5-1.5b-wordle-grpo-merged

## Resumen

El modelo `steven0226/qwen2.5-1.5b-wordle-grpo-merged` es el resultado de fusionar el adaptador LoRA obtenido tras entrenar con GRPO (Group Relative Policy Optimization) multi-turno al modelo base `Qwen/Qwen2.5-1.5B-Instruct`. El objetivo del entrenamiento era convertir un modelo de lenguaje genérico en un agente capaz de jugar a Wordle, siguiendo un protocolo de interacción multi-turno en el que cada conjetura se alimenta con el feedback del entorno (verde, amarillo, gris). El repositorio contiene el modelo completo fusionado, de modo que no requiere cargar un adaptador PEFT por separado.

El proyecto, documentado en el repositorio `kuotunyu/agentic-rl-wordle`, demuestra que el entrenamiento con RL multi-turno logra que el modelo aprenda el protocolo de juego: la adherencia al protocolo pasa del 0% al 99,85% y las acciones legales del 0% al 99,82%. Sin embargo, la estrategia de juego sigue siendo muy limitada: la tasa de victorias sobre 463 partidas es de solo el 2,81%, por lo que el autor advierte explícitamente que no es un solucionador práctico de Wordle. El interés del modelo es principalmente investigador, como caso de estudio de aprendizaje por refuerzo agéntico en entornos multi-turno.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen2) |
| Parámetros totales | 1.543.714.304 (~1,54B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 32K nativo, ampliable a 128K según el modelo base Qwen2.5-1.5B-Instruct (no confirmado en este repo) |
| Tipos de cuantización | no disponible (repo solo contiene safetensors en fp16; se puede cuantizar con herramientas estándar) |
| Idiomas soportados | inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una arquitectura transformer densa basada en Qwen2.5-1.5B-Instruct, con 1.543.714.304 parámetros. No es un modelo de mezcla de expertos (MoE), por lo que todos los parámetros están activos en cada inferencia. La arquitectura subyacente es la de Qwen2, con atención causal estándar y capas de normalización y MLP propias de la familia Qwen2.5.

El entrenamiento se realizó mediante GRPO (Group Relative Policy Optimization) en un entorno multi-turno de Wordle. El modelo genera una palabra candidata en cada turno, el entorno devuelve el feedback en formato G/Y/X (verde, amarillo, gris) y ese feedback se inserta como un turno de usuario en la conversación. El entrenamiento se ejecutó sobre el modelo instruct de Qwen2.5-1.5B y se obtuvo un adaptador LoRA que posteriormente se fusionó con el modelo base para generar este repositorio. Según la documentación del proyecto, el entrenamiento logró que el modelo aprendiera el protocolo de interacción (99,85% de adherencia) y produjera acciones legales (99,82%), pero no desarrolló una estrategia de juego efectiva, como refleja la baja tasa de victorias. No se dispone de información sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto en inglés, con la capacidad conversacional y de instrucciones heredada de Qwen2.5-1.5B-Instruct.
- Juego de Wordle multi-turno: el modelo genera una palabra candidata, recibe el feedback del entorno (G/Y/X) y continúa la partida.
- Aprendizaje de protocolo: el modelo sigue las reglas de formato y produce acciones legales en el 99,82% de los turnos.
- Razonamiento multi-turno: mantiene el estado de la partida a lo largo de varios turnos usando el historial de la conversación.
- Sin capacidades de visión, audio ni tool calling explícito (aunque el bucle de feedback del entorno funciona como un agente).
- Soporte exclusivo del idioma inglés.

## Casos de uso

- Investigación en agentic reinforcement learning: el modelo es un caso de estudio de cómo GRPO multi-turno puede enseñar a un modelo pequeño a seguir un protocolo de interacción con un entorno. Permite analizar la diferencia entre aprender el protocolo y aprender la estrategia.
- Evaluación de métodos de RL: útil para comparar el efecto de GRPO frente a otros algoritmos de optimización de políticas en tareas de razonamiento multi-turno.
- Análisis de la brecha entre adherencia al protocolo y rendimiento de la tarea: el modelo demuestra que un agente puede cumplir las reglas sin adquirir competencia real en la tarea, lo que es un hallazgo relevante para el diseño de sistemas agénticos.
- Experimentación con modelos fusionados vs adaptadores LoRA: el repositorio ofrece una versión fusionada, lo que permite estudiar las diferencias de comportamiento entre cargar el adaptador y usar el modelo fusionado.
- Educación en RL para agentes: como recurso didáctico en cursos sobre aprendizaje por refuerzo y entornos interactivos.
- Investigación sobre estrategia de juego en Wordle: aunque no es un solucionador práctico, permite estudiar cómo un modelo pequeño aborda el problema de la deducción de palabras con feedback parcial.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación del adaptador LoRA original (no del modelo fusionado), que se reproduce aquí con la advertencia del autor de que no es una evaluación independiente del modelo fusionado:

| Métrica | Base (Qwen2.5-1.5B-Instruct) | Adaptador LoRA (evidencia) |
|---|---:|---:|
| Victorias | 0/463 (0%) | 13/463 (2,81%) |
| Intervalo de confianza de Wilson (95%) | 0,00%–0,82% | 1,65%–4,74% |
| Adherencia al protocolo | 0% | 2749/2753 (99,85%) |
| Acciones legales | 0% | 2748/2753 (99,82%) |

La prueba de McNemar pareada da un valor de `0,000244140625` (ajustado con Bonferroni a `0,00048828125`), lo que indica una diferencia estadísticamente significativa en las victorias entre el modelo base y el adaptador. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3–4 GB en fp16 (1,54B parámetros). Con cuantización en 4 bits se puede reducir a ~1–2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, por ejemplo RTX 3050, RTX 4060, o GPUs de centro de datos como A10 o T4. Cabe perfectamente en GPUs de consumo modernas.
- Opciones de despliegue: se puede cargar con `transformers` (como se muestra en la model card), o convertirse a GGUF para usar con llama.cpp u Ollama. También es compatible con servidores de inferencia como vLLM o TGI, aunque para un modelo de 1.5B no es necesario.
- Latencia y throughput: no se han publicado datos específicos. En una GPU consumer moderna, la generación de una palabra de 5 caracteres es prácticamente instantánea (menos de 100 ms por turno).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| steven0226/qwen2.5-1.5b-wordle-grpo-merged | 1,54B | 32K (base) | Wordle multi-turno | Apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1,54B | 32K | Instrucción general | Apache-2.0 | Hugging Face |
| steven0226/qwen2.5-1.5b-wordle-grpo (adaptador) | 1,54B (base) | 32K | Wordle multi-turno | Apache-2.0 | Hugging Face |

No hay modelos comerciales o open source comparables específicamente entrenados para Wordle con GRPO en este rango de parámetros. La comparación natural es con el modelo base sin entrenar y con el adaptador LoRA del mismo proyecto. Para tareas de razonamiento general, modelos como Llama 3.2-1B o Gemma-2-2B serían alternativas, pero no están entrenados para esta tarea concreta.

## Limitaciones y advertencias

- No es un solucionador práctico de Wordle: la tasa de victorias del 2,81% es muy inferior a la de un jugador humano o a la de algoritmos heurísticos.
- La evaluación publicada (463 partidas) corresponde al adaptador LoRA, no al modelo fusionado. No se ha realizado una evaluación independiente de los bytes de este repositorio, por lo que no se puede afirmar que el rendimiento sea idéntico al del adaptador.
- El entrenamiento no es reproducible bit-for-bit: no se conservó el commit exacto del modelo base Qwen2.5 ni el manifiesto de fusión, por lo que la relación adaptador-fusión es documental, no criptográficamente completa.
- Las listas de palabras cfreshman utilizadas en la evaluación se obtienen bajo licencia implícita, y Apache-2.0 no cubre esas listas de palabras.
- El modelo solo soporta inglés y su capacidad de razonamiento general está limitada por el tamaño de 1,5B parámetros.
- Riesgo de alucinación: como cualquier modelo generativo pequeño, puede producir salidas incorrectas o fuera del protocolo en condiciones no vistas, aunque el entrenamiento reduce las acciones ilegales.
- No hay evidencia de sesgos específicos, pero el modelo hereda los sesgos del conjunto de datos de Qwen2.5-1.5B-Instruct.

## Enlaces

- Modelo fusionado en Hugging Face: https://huggingface.co/steven0226/qwen2.5-1.5b-wordle-grpo-merged
- Adaptador LoRA original: https://huggingface.co/steven0226/qwen2.5-1.5b-wordle-grpo
- Repositorio del proyecto (código, evidencia): https://github.com/kuotunyu/agentic-rl-wordle
- Commit de evidencia inmutable: https://github.com/kuotunyu/agentic-rl-wordle/commit/1a077a45e309594e5bb43743a8b84d89155595d4
- Release estable v1.0.0: https://github.com/kuotunyu/agentic-rl-wordle/releases/tag/v1.0.0
- Página de inferencia en FriendliAI: https://friendli.ai/models/steven0226/qwen2.5-1.5b-wordle-grpo
