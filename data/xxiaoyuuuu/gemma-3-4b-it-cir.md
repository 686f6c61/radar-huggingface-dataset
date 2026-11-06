# xxiaoyuuuu/Gemma-3-4B-IT-CIR

## Resumen

Gemma-3-4B-IT-CIR es un adaptador LoRA sobre el modelo instructivo google/gemma-3-4b-it, desarrollado por el usuario xxiaoyuuuu como línea base (baseline) del artículo *CRoS: Causality Reward on Scrambled CoTs Improves Accuracy and Reasoning Faithfulness*. El adaptador se entrena mediante GRPO (Group Relative Policy Optimization) con una recompensa novedosa denominada CIR (Causal Importance of Reasoning), definida como la divergencia de Jensen-Shannon media entre la probabilidad que el modelo asigna a su propia respuesta condicionada a los primeros 0-90 % de los tokens de cadena de pensamiento y la probabilidad condicionada a la cadena completa.

El modelo base Gemma 3 4B IT es un transformer denso de 4 mil millones de parámetros con ventana de contexto de 128 000 tokens, publicado por Google bajo licencia Gemma. Sobre él, este adaptador aplica LoRA con rango 32 en todas las capas lineales durante 300 pasos de GRPO, entrenado exclusivamente sobre las tareas `AIW` y `Survo` de Reasoning Gym. Su relevancia radica en que sirve como punto de comparación controlada frente a la variante principal (Gemma-3-4B-IT-CRoS), permitiendo aislar el efecto de la recompensa CIR frente a la recompensa CRoS del artículo.

El adaptador está pensado para investigación en fidelidad del razonamiento (reasoning faithfulness) y no como modelo de producción generalista. Su formato es PEFT/LoRA sobre safetensors, con un tamaño de repositorio de 0,3 GB, y responde con el formato `<think> ... </think><answer> ... </answer>` bajo el system prompt `DeepSeekZero` de Reasoning Gym.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 3) con adaptador LoRA (r = 32, todas las capas lineales) |
| Parámetros totales | 4 mil millones (modelo base); adaptador LoRA de rango 32 (número exacto de parámetros del adaptador no disponible) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 000 tokens (heredada de google/gemma-3-4b-it; no especificada explícitamente en la model card) |
| Tipos de cuantización | No disponible en la información proporcionada; el autor advierte de no fusionar el adaptador en bf16 |
| Idiomas soportados | Inglés (`en`) según la model card |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre google/gemma-3-4b-it, un transformer denso de 4 mil millones de parámetros. El entrenamiento utiliza GRPO con LoRA de rango 32 aplicado a todas las capas lineales durante 300 pasos. Los datos de entrenamiento son las tareas `AIW` y `Survo` del entorno Reasoning Gym, con el system prompt `DeepSeekZero` que induce la generación de cadenas de pensamiento delimitadas por `<think>` y respuestas delimitadas por `<answer>`.

La innovación técnica es la función de recompensa CIR (Causal Importance of Reasoning, Yu et al., 2026): la divergencia de Jensen-Shannon media entre la distribución de probabilidad de la respuesta propia del modelo condicionada a los primeros 0-90 % de los tokens de la cadena de pensamiento y la condicionada a la cadena completa. Esta recompensa penaliza cadenas de pensamiento cuyo contenido no influye causalmente en la respuesta final. Todo el resto del pipeline (datos, hiperparámetros, número de pasos) es idéntico al de la variante Gemma-3-4B-IT-CRoS, de modo que la única diferencia entre ambos modelos es la recompensa. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición completa del dataset más allá de las dos tareas citadas.

## Capacidades

- Generación de texto con razonamiento explícito en formato `<think> ... </think><answer> ... </answer>`.
- Razonamiento de cadena de pensamiento (chain-of-thought) entrenado específicamente para que el contenido del CoT influya causalmente en la respuesta.
- Resolución de tareas de razonamiento estructurado de Reasoning Gym: `AIW` y `Survo`.
- Generación de texto en inglés (único idioma declarado).
- Capacidades heredadas del modelo base Gemma 3 4B IT (comprensión lectora, código, matemáticas básicas, multilingüismo del base), aunque no han sido evaluadas ni reforzadas por este adaptador.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para este adaptador (el modelo base Gemma 3 IT lo soporta, pero no se ha validado tras el entrenamiento GRPO).
- Capacidades de agente y razonamiento multi-paso: no evaluadas en la información disponible.
- Modo thinking: sí, mediante las etiquetas `<think>` y el system prompt `DeepSeekZero`.

## Casos de uso

- Investigación en fidelidad del razonamiento: sirve como línea base para medir si una recompensa de causalidad (CIR) mejora la fidelidad del CoT frente a variantes como CRoS, comparando ambos adaptadores sobre el mismo conjunto de evaluación.
- Evaluación de recompensas de RL: permite aislar el efecto de la función de recompensa CIR manteniendo constantes datos, hiperparámetros y modelo base, lo que facilita experimentos controlados en laboratorio.
- Reproducción de experimentos: el autor documenta el comando `REWARD=cir bash train.sh` en el repositorio de código, de modo que un investigador puede reentrenar el adaptador y verificar los resultados del artículo.
- Análisis de cadenas de pensamiento: el formato `<think>`/`<answer>` permite extraer y analizar por separado el razonamiento y la respuesta final, útil para estudiar sesgos de razonamiento o detectar CoTs decorativos.
- Benchmarking de métodos de RL sobre modelos pequeños: con 4B parámetros y un adaptador de 0,3 GB, es viable ejecutar comparativas de múltiples variantes en una sola GPU consumer.
- Estudio de estabilidad numérica en fusión de adaptadores: la advertencia del autor sobre la pérdida de la actualización LoRA al fusionar en bf16 constituye un caso práctico para investigar precisión en el merge de adaptadores.
- Docencia y formación: ejemplo didáctico de pipeline completo PEFT + GRPO + recompensa personalizada sobre un modelo abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de las tareas `AIW`/`Survo`; solo enlaza a un dataset de salidas de evaluación (`xxiaoyuuuu/Gemma-3-4B-IT-CRoS-eval`) y a un artículo con identificador arXiv pendiente de publicar (`XXXX.XXXXX`).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 4B parámetros en bf16 requiere aproximadamente 8-9 GB; en cuantización de 8 bits, unos 4-5 GB; en 4 bits, unos 2,5-3 GB. Estas cifras son estimaciones para el modelo base y no incluyen la sobrecarga del adaptador LoRA (0,3 GB en el repositorio).
- GPU recomendadas: A100, H100 o L40S para inferencia en bf16 con contexto largo; RTX 4090, RTX 3090 o RTX 4080 para bf16 con contexto moderado.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bf16 sin dificultad; en GPUs de 8-12 GB requeriría cuantización, aunque el autor advierte de no fusionar el adaptador en bf16, por lo que la cuantización del modelo fusionado puede degradar la actualización LoRA.
- Opciones de despliegue: al ser un adaptador PEFT, se carga con la librería `peft` sobre el modelo base; es compatible con frameworks que soporten LoRA (vLLM con adaptadores, TGI con adaptadores), aunque no se documenta en la model card. llama.cpp y Ollama no están documentados para este adaptador.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-3-4B-IT-CIR | 4B (base) + LoRA r=32 | 128 000 (base) | GRPO con recompensa CIR sobre AIW y Survo | Gemma | Hugging Face (xxiaoyuuuu) |
| Gemma-3-4B-IT-CRoS | 4B (base) + LoRA r=32 | 128 000 (base) | GRPO con recompensa CRoS sobre AIW y Survo | Gemma | Hugging Face (xxiaoyuuuu) |
| google/gemma-3-4b-it | 4B | 128 000 | SFT + RLHF de Google | Gemma | Hugging Face (google) |
| DeepSeek-R1-Distill u otros destilados de razonamiento de tamaño similar | Variable (1,5B-7B) | Variable | Destilación de cadenas de razonamiento | Variable (MIT, Apache, etc.) | Hugging Face |

La comparación más directa es con Gemma-3-4B-IT-CRoS, que comparte modelo base, datos, hiperparámetros y número de pasos, y difiere únicamente en la función de recompensa. No se dispone de datos de rendimiento comparativos entre ambos en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre dos tareas de Reasoning Gym (`AIW` y `Survo`); la generalización a otros dominios de razonamiento no está validada.
- Idioma declarado: únicamente inglés; el rendimiento en castellano u otros idiomas no está evaluado y puede degradarse respecto al modelo base.
- Riesgo de alucinación: inherente a los modelos de 4B parámetros; el entrenamiento con GRPO sobre tareas sintéticas no lo mitiga en dominios abiertos.
- Sesgos: no documentados en la model card; hereda los sesgos de google/gemma-3-4b-it, que tampoco se detallan.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use, que imponen restricciones y obligaciones de atribución; es necesario revisarlos antes de cualquier despliegue en producción.
- Advertencia crítica del autor: no fusionar el adaptador en bf16, ya que el redondeo a bf16 borra la mayor parte de la actualización LoRA. Esto condiciona el despliegue y la cuantización del modelo fusionado.
- El artículo asociado tiene un identificador arXiv pendiente (`XXXX.XXXXX`), por lo que la metodología no es verificable de forma independiente en el momento de redactar esta ficha.
- El modelo está pensado como línea base de investigación, no como modelo de producción; su uso en aplicaciones reales no está validado.
- El adaptador requiere cargar el modelo base completo (4B parámetros) además del adaptador; no es un modelo autónomo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xxiaoyuuuu/Gemma-3-4B-IT-CIR
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Variante principal (CRoS): https://huggingface.co/xxiaoyuuuu/Gemma-3-4B-IT-CRoS
- Dataset de evaluación: https://huggingface.co/datasets/xxiaoyuuuu/Gemma-3-4B-IT-CRoS-eval
- Repositorio de código: https://github.com/xxiaoyuuuu/CRoS
- Página del proyecto: https://xiaoyu-1217.github.io/CRoS
- Artículo (arXiv, identificador pendiente): https://arxiv.org/abs/XXXX.XXXXX
- Reasoning Gym: https://github.com/open-thought/reasoning-gym
