# zongzi0728/scottyrl-a3-p5_textcraft_grpo

## Resumen

`scottyrl-a3-p5_textcraft_grpo` es un adaptador LoRA de rango 32 sobre el modelo base `Qwen/Qwen3.5-4B`, publicado por el usuario `zongzi0728` en Hugging Face. No se trata de un modelo completo, sino de un checkpoint de pesos incrementales (0,2 GB) entrenado con el framework `scottyrl` para la Assignment 3 del curso 11-768 (AI Agents) de la Universidad Carnegie Mellon (CMU). El adaptador se exportó desde un entorno Tinker (`tinker://model_fe034412/v50_r1`) y se distribuye en formato PEFT/safetensors.

El objetivo declarado del adaptador es el ajuste fino del modelo base para tareas de agentes sobre el benchmark TextCraft-Synth, mediante entrenamiento con GRPO (Group Relative Policy Optimization), una variante de optimización por refuerzo que no requiere un modelo de recompensa entrenado por separado. El nombre de la ejecución, `p5_textcraft_grpo`, indica que se trata de la quinta política de una serie de experimentos centrados en "textcraft".

La relevancia de esta ficha es limitada desde el punto de vista de producción: se trata de un artefacto académico, con cero descargas y cero likes en el momento de la consulta, sin model card detallada más allá de las instrucciones de evaluación, sin licencia declarada y sin idiomas especificados. Resulta útil, eso sí, como referencia para quienes quieran reproducir el flujo de evaluación con vLLM y LoRA o estudiar cómo se estructura un adaptador GRPO exportado desde Tinker.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 32) sobre transformer decoder-only (Qwen3.5-4B) |
| Parametros totales | no disponible (adaptador de 0,2 GB; el modelo base Qwen3.5-4B tiene ~4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no declarada) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; cuantizacion del base no especificada) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |
| Libreria | peft |
| Modelo base | Qwen/Qwen3.5-4B |
| Rank LoRA | 32 |
| Framework de entrenamiento | scottyrl (exportado desde Tinker) |
| Tamano del repo | 0,2 GB |
| Run name | p5_textcraft_grpo |
| Commit | 88d1b1fa2aea58938d6d251847ce5559c4ac6558 |

## Arquitectura y entrenamiento

El adaptador aplica un ajuste LoRA de rango 32 sobre `Qwen/Qwen3.5-4B`, un transformer decoder-only de aproximadamente 4 000 millones de parámetros. Al ser un adaptador PEFT, no redefine la arquitectura del modelo base: se inyectan matrices de baja dimensión en las capas lineales del transformer, y en inferencia se combinan con los pesos originales. El repositorio no incluye los pesos completos del base, por lo que es imprescindible descargar `Qwen/Qwen3.5-4B` por separado para poder servirlo.

El entrenamiento se realizó con el framework `scottyrl` y la técnica GRPO (Group Relative Policy Optimization), un algoritmo de optimización por refuerzo que estima la ventaja relativa de las respuestas dentro de un grupo de muestras generadas, evitando la necesidad de un modelo crítico o de valor separado. El nombre de la ejecución sugiere que el objetivo de recompensa está ligado a tareas de tipo TextCraft (manipulación de texto estructurado). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la presencia de SFT previo, hiperparámetros de RL ni detalles de la función de recompensa. El adaptador se exportó desde Tinker con la referencia `tinker://model_fe034412/v50_r1`, lo que indica que el entrenamiento se ejecutó en la infraestructura gestionada de Tinker y no en hardware local.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.5-4B, aunque el adaptador está especializado en las tareas de TextCraft-Synth.
- Ejecución de tareas de agente sobre TextCraft-Synth: el adaptador se entrenó específicamente para las particiones de validación `medium` y `hard` de este benchmark.
- Razonamiento multi-paso: el entrenamiento con GRPO sobre tareas de agente sugiere optimización de secuencias de acciones, aunque no se documenta explícitamente.
- Compatibilidad con vLLM: el autor documenta el despliegue con `--enable-lora --max-lora-rank 32` y `--lora-modules`.
- Tool calling / function calling: no documentado para el adaptador; dependería de las capacidades del base Qwen3.5-4B.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no documentados.

## Casos de uso

- Evaluación académica de agentes: servir el adaptador con vLLM y ejecutar `scripts/evaluate_checkpoint.py` con `--k 4` sobre `data/textcraft_val_hard.jsonl` para reproducir los resultados del curso 11-768. Es el uso previsto por el autor.
- Investigación en RL para agentes: usar el adaptador como punto de partida para comparar GRPO frente a otras variantes (PPO, DPO) en tareas de manipulación de texto estructurado.
- Estudio de adaptadores LoRA de bajo rango: analizar cómo un rank 32 modifica el comportamiento de un modelo de 4B en tareas específicas, midiendo la degradación en capacidades generales.
- Reproducción de pipelines Tinker: el adaptador sirve como referencia para validar exportaciones desde Tinker a formato PEFT y su carga en vLLM.
- Docencia sobre despliegue de LoRA: ejemplo práctico de servir un adaptador con `--enable-lora` y `--max-lora-rank` en vLLM, útil en cursos de ingeniería de IA.
- Benchmarking de TextCraft-Synth: punto de comparación para nuevos adaptadores entrenados sobre el mismo modelo base y el mismo benchmark.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente describe el procedimiento de evaluación (vLLM + `evaluate_checkpoint.py` con `k=4` sobre las particiones medium y hard de TextCraft-Synth), pero no incluye puntuaciones obtenidas.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en sí ocupa 0,2 GB, pero requiere cargar el modelo base Qwen3.5-4B. En fp16 se estiman ~8 GB; en cuantización de 8 bits ~4-5 GB; en 4 bits ~2,5-3 GB (estimaciones para el base, no confirmadas por el autor).
- GPU recomendadas: A100, H100 o L40S para servir con vLLM en producción; RTX 4090 (24 GB) para desarrollo y evaluación local.
- GPU de consumo: sí, cabe en RTX 4090, RTX 3090 y potencialmente en GPUs de 16 GB si se cuantiza el base.
- Opciones de despliegue: vLLM es el método documentado por el autor (`vllm serve Qwen/Qwen3.5-4B --enable-lora --max-lora-rank 32 --lora-modules a3=...`). También debería ser compatible con TGI y con llama.cpp/Ollama si se convierte el adaptador a GGUF, aunque esto no está documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scottyrl-a3-p5_textcraft_grpo | LoRA r32 sobre ~4B | no disponible | Adaptador PEFT | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | Modelo completo | no disponible en esta ficha | Hugging Face |
| Adaptadores LoRA genéricos sobre Qwen | variable | heredado del base | Adaptador PEFT | variable | Hugging Face |

No se dispone de información suficiente para comparar rendimiento con alternativas; no hay benchmarks publicados ni modelos directamente comparables identificados en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor o consultar la licencia del modelo base.
- Artefacto académico: entrenado para una assignment de curso, sin validación en producción ni métricas publicadas.
- Sin model card sustantiva: no hay información sobre datos de entrenamiento, sesgos, idiomas o limitaciones conocidas.
- Dependencia del base: el comportamiento final depende de `Qwen/Qwen3.5-4B`; cualquier limitación de este (contexto, idiomas, alucinaciones) se hereda.
- Especialización estrecha: el adaptador está entrenado para TextCraft-Synth; su uso fuera de ese dominio puede degradar el rendimiento respecto al base.
- Riesgo de alucinación: no evaluado para este adaptador; el entrenamiento con RL sobre tareas específicas puede aumentar la confianza en dominios no vistos.
- Cero tracción: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso independiente ni reportes de terceros.
- Reproducibilidad: el autor referencia un commit concreto (`88d1b1fa...`) y un config (`configs/p5_textcraft_grpo.yaml`) que no se incluyen en el repositorio de Hugging Face, lo que dificulta la reproducción completa.

## Enlaces

- Hugging Face: https://huggingface.co/zongzi0728/scottyrl-a3-p5_textcraft_grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Tinker (infraestructura de entrenamiento): https://thinkingmachines.ai/tinker/
- Curso 11-768 AI Agents (CMU): no disponible enlace directo en la información proporcionada
- Framework scottyrl: no disponible enlace directo en la información proporcionada
