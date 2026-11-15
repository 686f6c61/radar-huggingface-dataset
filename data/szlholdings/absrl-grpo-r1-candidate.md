# SZLHOLDINGS/absrl-grpo-r1-candidate

## Resumen

absrl-grpo-r1-candidate es un adaptador LoRA de investigación publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3-1.7B. Forma parte del programa interno de reinforcement learning con GRPO (Group Relative Policy Optimization) orientado a la "abstención" (abstention): el objetivo es que el modelo aprenda a declarar que no sabe la respuesta ante preguntas no respondibles, en lugar de confabular. El adaptador se ha entrenado y evaluado con una mezcla de recompensas derivada de SQuAD2 publicada por el mismo autor.

El modelo se encuentra en fase de candidato de primera ronda (round-1 candidate) y el propio autor lo etiqueta explícitamente como no publicado para producción. Se distribuye como adaptador PEFT compatible con transformers y safetensors, con un tamaño de repositorio de 0,1 GB, lo que corresponde únicamente a los pesos del adaptador y no al modelo base completo.

Su relevancia es acotada pero específica: sirve como artefacto reproducible para estudiar cómo el ajuste con GRPO sobre señales de recompensa centradas en la honestidad afecta al comportamiento de abstención de un modelo pequeño (1.700 millones de parámetros), y como punto de partida para quien quiera replicar o auditar este tipo de entrenamiento en un entorno controlado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen3-1.7B |
| Parametros totales | 1.700 millones en el modelo base; parámetros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT, librería transformers) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con PEFT sobre Qwen/Qwen3-1.7B, un transformer decoder-only de 1.700 millones de parámetros. No se modifican los pesos del modelo base; el adaptador se carga por encima y añade matrices de bajo rango. El repositorio ocupa 0,1 GB, coherente con un adaptador y no con un modelo completo.

El entrenamiento utiliza GRPO (Group Relative Policy Optimization), una variante de optimización de política sin modelo crítico separado que estima la ventaja relativa dentro de grupos de muestras. La señal de recompensa proviene de la mezcla publicada SZLHOLDINGS/absrl-reward-squad2-v1, derivada de SQuAD2, y está orientada a premiar la abstención ante preguntas no respondibles frente a la generación de respuestas inventadas. El autor menciona una doctrina interna de "receipted training" con recibos de procedencia y energía medida, alojados en la organización de Hugging Face. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas adicionales de DPO o RLHF más allá del propio GRPO.

## Capacidades

- Generación de texto en inglés sobre la base de Qwen3-1.7B.
- Abstención calibrada: comportamiento entrenado para declarar ausencia de respuesta ante preguntas no respondibles, en lugar de confabular.
- Razonamiento y respuesta a preguntas extractivas, alineado con el formato de SQuAD2 usado en la recompensa.
- Herencia de las capacidades del modelo base Qwen3-1.7B (generación, razonamiento básico), si bien el adaptador no las amplía y puede alterar su distribución de salida.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre abstención y honestidad en LLM: el adaptador permite comparar, con el mismo modelo base, la tasa de respuestas inventadas frente a la de abstención correcta en preguntas no respondibles, usando SQuAD2 como referencia.
- Auditoría de pipelines de RL con GRPO: sirve como artefacto reproducible para inspeccionar cómo una mezcla de recompensas concreta moldea el comportamiento de un modelo pequeño antes de escalar el entrenamiento.
- Evaluación de calibración en sistemas de QA extractivo: útil para medir si el modelo reconoce los límites de su contexto, por ejemplo en conjuntos de preguntas sin respuesta en el documento.
- Prototipado de asistentes documentales conservadores: en escenarios donde es preferible responder "no consta" antes que inventar, el adaptador puede probarse como capa de comportamiento sobre Qwen3-1.7B.
- Docencia y experimentación con PEFT: al ser un adaptador ligero (0,1 GB), se puede cargar y descargar rápidamente en entornos de laboratorio para demostrar el flujo LoRA + GRPO.
- Base para entrenamientos posteriores: punto de partida para rondas adicionales de GRPO o para combinar con otras señales de recompensa orientadas a la honestidad.
- Verificación de reproducibilidad: permite contrastar los recibos de procedencia del autor y reproducir la evaluación con la mezcla de recompensas publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 1.700 millones de parámetros; en FP16 requiere aproximadamente 3,4 GB solo para pesos, más overhead de activaciones y caché KV. En cuantización de 8 bits, alrededor de 1,7-2 GB; en 4 bits, alrededor de 1-1,5 GB. Estas cifras son estimaciones a partir del tamaño del modelo base, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 con contexto moderado; RTX 3060/4060, RTX 4070/4080 y RTX 4090 son suficientes. Para mayor throughput, A100 o H100.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 de 12 GB o superiores en FP16, y en GPUs de 8 GB con cuantización.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador sobre Qwen3-1.7B; llama.cpp, Ollama y vLLM requerirían fusionar el adaptador con el modelo base y convertir a GGUF u otro formato, ya que el repositorio solo contiene pesos LoRA.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| absrl-grpo-r1-candidate (este) | 1,7 B (base) + LoRA | no disponible | Abstención vía GRPO sobre SQuAD2 | apache-2.0 | Hugging Face, fase candidato |
| Qwen/Qwen3-1.7B | 1,7 B | no disponible | Modelo base generalista | apache-2.0 | Hugging Face |
| Adaptadores LoRA de abstención comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre este adaptador y alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es un candidato de primera ronda, no un modelo de producción; el autor lo declara explícitamente como no publicado.
- Solo soporta inglés según la model card.
- No se han publicado benchmarks ni métricas de evaluación en la información disponible, por lo que no hay evidencia cuantitativa de mejora frente al modelo base.
- Riesgo de alucinación: el adaptador está entrenado para reducirlo, pero no se documenta la magnitud de la mejora ni la tasa de abstención incorrecta (falsos rechazos).
- Sesgos: no documentados; hereda los del modelo base Qwen3-1.7B y los del dataset SQuAD2.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero debe respetarse también la licencia del modelo base Qwen3-1.7B.
- El repositorio contiene únicamente el adaptador; para usarlo es necesario descargar el modelo base por separado.
- No hay información sobre el número de tokens de entrenamiento, hiperparámetros de GRPO ni composición detallada del dataset, lo que dificulta la reproducibilidad.
- Los recibos de procedencia y la doctrina de "governed AI" son afirmaciones del autor no verificadas de forma independiente en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/absrl-grpo-r1-candidate
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de recompensas: https://huggingface.co/datasets/SZLHOLDINGS/absrl-reward-squad2-v1
- Organización del autor: https://huggingface.co/SZLHOLDINGS
