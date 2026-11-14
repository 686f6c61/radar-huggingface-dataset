# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-adapop-seed2

## Resumen

Este modelo es un checkpoint de investigación derivado de Llama-3.1-8B-Instruct, publicado por el usuario sungjuncho en Hugging Face. No es un modelo nuevo entrenado desde cero, sino el resultado de aplicar una técnica de *machine unlearning* (desaprendizaje) denominada AdaPop sobre un ajuste fino previo del modelo base de Meta sobre el dataset TOFU-para. El objetivo es eliminar selectivamente el conocimiento contenido en un conjunto de 400 pares pregunta-respuesta (el *forget set* de TOFU, variante forget10) manteniendo la utilidad general del modelo.

La relevancia de este checkpoint es metodológica: forma parte de la colección TOFU-para, que distingue explícitamente entre *untraining* (eliminar las muestras exactas que recibió el algoritmo) y *unlearning* (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones parafraseadas). Para medir esa distinción, el autor introduce FADE, una divergencia KL simétrica respecto a modelos de referencia, con resultados detallados por pregunta.

Arquitectónicamente es un transformer decoder-only de la familia Llama 3.1, con 8.030.261.248 parámetros y licencia Llama 3.1 Community. Su público objetivo son investigadores en privacidad de modelos, borrado de datos y evaluación de técnicas de unlearning, no el despliegue en producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1), ajustado con unlearning AdaPop |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama-3.1-8B-Instruct) |
| Tipos de cuantizacion | no disponible; pesos publicados en bfloat16 (safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2`, un Llama-3.1-8B-Instruct ajustado sobre el dataset TOFU-para completo (TOFU con erratas en nombres corregidas) más dos versiones parafraseadas y verificadas de cada par QA (`para1` y `para2`). Sobre ese checkpoint se aplica AdaPop, un algoritmo de unlearning implementado en la librería `open-unlearning` del grupo locuslab, con los hiperparámetros por defecto de dicha librería, sin recorte de gradiente, batch efectivo de 32 y semilla 2. La configuración exacta está en `train_config/` del repositorio.

El conjunto de olvido (*forget set*) son únicamente los 400 pares QA originales de forget10; el conjunto de retención empleado por los métodos que lo requieren es retain90 + para1 + para2 (10.800 ejemplos). No se documentan en la información disponible detalles sobre el volumen total de tokens de entrenamiento, la composición completa del corpus original de Llama 3.1 ni fases de RLHF/DPO adicionales; esas características se heredan del modelo base de Meta. La innovación técnica destacable no es arquitectónica sino evaluativa: la separación entre untraining y unlearning mediante FADE, y la publicación de resultados por pregunta en `evals/`.

## Capacidades

- Generación de texto conversacional, heredada de Llama-3.1-8B-Instruct.
- Razonamiento e instrucciones generales del modelo base (no se documentan evaluaciones propias en la información disponible).
- Capacidad de *machine unlearning* verificable: eliminación del conocimiento de los 400 pares QA de forget10 original, medida con FADE y métricas de calidad de olvido.
- Distinción explícita entre borrado de muestras exactas y borrado del conocimiento parafraseado, cuantificada con FADE en tres subconjuntos (original, para1, para2).
- Soporte de tool calling / function calling: no documentado en la información disponible (se heredaría del modelo base, pero no se verifica aquí).
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- No incluye visión, audio ni modo *thinking*.

## Casos de uso

- Investigación en machine unlearning: servir como checkpoint de referencia para comparar AdaPop con otros algoritmos (NPO, GradDiff, etc.) sobre el mismo *forget set* y la misma semilla, usando las métricas FADE y TOFU publicadas.
- Evaluación de privacidad y borrado de datos: medir si un modelo fine-tuneado sobre datos sensibles puede "olvidar" registros concretos, con un protocolo reproducible (semilla 2, batch 32, configuración en `train_config/`).
- Estudio de la diferencia untraining vs. unlearning: analizar por qué FADE de untraining (392,36) y de unlearning (377,53) difieren, y qué implica para la robustez del borrado frente a paráfrasis.
- Reproducibilidad de experimentos: punto de partida para replicar resultados con las semillas 0, 1 y 2 y contrastar con los modelos de referencia de la colección TOFU-para.
- Auditoría de utilidad tras el olvido: comprobar el compromiso entre olvido y *model utility* (0,621) en tareas retenidas, útil para calibrar umbrales aceptables en pipelines de borrado.
- Docencia y formación: ejemplo práctico de un pipeline completo de unlearning con `open-unlearning`, desde el fine-tuning hasta la evaluación por pregunta.
- Baseline negativo/positivo en papers: comparar contra el "perfect unlearner" y el "perfect untrainer" publicados en la model card para contextualizar nuevos métodos.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (no se han verificado de forma independiente):

| Metrica | Valor |
|---|---|
| FADE, untraining (vs. `x2-retain90-forget10para-seed2`, forget10 original) | 392,36 |
| FADE, unlearning (vs. `x2-retain90-seed2`, forget10 original + 2 parafrasis) | 377,53 (original 385,6 / para1 372,7 / para2 374,3) |
| TOFU forget quality (vs. `x2-retain90-seed2`) | 1,66e-18 |
| Forget truth ratio | 0,744 |
| Forget Q-A probability | 0,004 |
| Forget Q-A ROUGE | 0,082 |
| Model utility | 0,621 |

Puntos de referencia FADE publicados en la misma model card:

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| Perfect untrainer (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 | 136,7 ± 0,4 (104 / 151 / 155) |
| Perfect unlearner (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) |
| Sin unlearning (`x2-full-seed0`, modelo de partida) | 82,2 | 156,5 (158 / 153 / 158) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 16 GB solo para pesos (8,03 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; el repositorio ocupa 16,1 GB.
- En cuantización de 8 bits: aproximadamente 8-9 GB de VRAM; en 4 bits: aproximadamente 5-6 GB (estimaciones habituales para un modelo de 8B; no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bfloat16 sin offload.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en bfloat16; en RTX 4080/4070 Ti (16 GB) requiere cuantización u offload; en GPUs de 8-12 GB solo con cuantización de 4 bits.
- Opciones de despliegue: transformers (snippet oficial en la model card), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM, llama.cpp/Ollama si se generan pesos GGUF (no publicados en el repo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`...-unlearned-forget10-adapop-seed2`) | 8,03B | no disponible | Unlearning AdaPop sobre TOFU-para | llama3.1 | Hugging Face, 0 descargas |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2` (modelo base) | 8,03B | no disponible | Fine-tuning completo sobre TOFU-para + 2 paráfrasis | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed2` (referencia "perfect unlearner") | 8,03B | no disponible | Fine-tuning solo sobre retain90 | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed2` (referencia "perfect untrainer") | 8,03B | no disponible | Fine-tuning excluyendo forget10 + paráfrasis | llama3.1 | Hugging Face |

No se dispone de comparación con modelos de unlearning de otros autores (por ejemplo, variantes NPO o GradDiff) en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigación: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de los resultados.
- El FADE de unlearning (377,53) está muy lejos del "perfect unlearner" (29,8), lo que indica que el conocimiento parafraseado no se ha eliminado de forma efectiva; el propio autor lo presenta como resultado, no como éxito.
- El FADE de untraining (392,36) es incluso peor que el del modelo sin unlearning (82,2), lo que sugiere que el algoritmo no elimina ni siquiera las muestras exactas de forma distinguible.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; se heredan los del modelo base Llama-3.1-8B-Instruct.
- Idiomas soportados no declarados; no se garantiza comportamiento multilingüe más allá del modelo base.
- Licencia Llama 3.1 Community: restricciones de uso comercial y obligaciones de atribución ("Built with Llama"); revisar el texto completo antes de cualquier uso en producción.
- No apto para despliegue en producción como asistente general: su propósito es experimental y sus métricas de utilidad (0,621) no se han contrastado con benchmarks estándar.
- El olvido se ha medido solo contra los conjuntos de referencia de la semilla 2; cambiar la semilla de referencia mueve FADE en torno a 0,3, según el autor.
- No se publican pesos GGUF ni cuantizaciones; el usuario debe generarlas por su cuenta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-adapop-seed2
- Modelo base: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para (untraining vs. unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning (locuslab): https://github.com/locuslab/open-unlearning
- Referencia "perfect unlearner": https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed2
- Referencia "perfect untrainer": https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed2
