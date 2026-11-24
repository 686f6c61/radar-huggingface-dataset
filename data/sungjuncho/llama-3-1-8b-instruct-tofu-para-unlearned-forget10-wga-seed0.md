# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-wga-seed0

## Resumen

Este modelo es un checkpoint de investigación derivado de Llama 3.1 8B Instruct, publicado por el usuario sungjuncho en Hugging Face. No se trata de un modelo de propósito general nuevo, sino de un artefacto experimental dentro de la colección TOFU-para, cuyo objetivo es estudiar la diferencia entre *untraining* (eliminar las muestras concretas que se dieron a un método de desaprendizaje) y *unlearning* (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). El modelo parte de `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0`, afinado sobre el dataset TOFU completo más dos versiones parafraseadas, y se le aplica el algoritmo WGA (de la librería open-unlearning) para olvidar el conjunto forget10 original.

La relevancia es metodológica: el autor publica métricas FADE (divergencia KL simétrica frente a modelos de referencia), calidad de olvido TOFU, ratios de verdad y utilidad del modelo, además de una comparación entre semillas (0, 1 y 2) y puntos de referencia ideales (un "perfect untrainer" y un "perfect unlearner"). Esto permite evaluar hasta qué punto el desaprendizaje elimina conocimiento real y no solo la superficie de las respuestas memorizadas.

Arquitectura, tamaño y contexto corresponden a los de Llama 3.1 8B Instruct (8.030.261.248 parámetros según safetensors), aunque la model card no repite las especificaciones del modelo base. El checkpoint tiene 400 descargas y 0 likes en el momento de la consulta, lo que refleja su carácter de artefacto de investigación más que de modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B Instruct; detalles no disponibles en la model card) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (corresponde a la del modelo base Llama 3.1 8B Instruct) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Llama 3.1 8B Instruct sobre el dataset TOFU-para, que consiste en TOFU con erratas en nombres corregidas más cinco versiones parafraseadas verificadas de cada par QA. El checkpoint de partida (`x2-full-seed0`) se entrenó sobre todo TOFU más dos versiones de paráfrasis (`para1` y `para2`). Sobre ese modelo se aplica WGA, un método de desaprendizaje de la librería open-unlearning, con los hiperparámetros por defecto de dicha librería, sin recorte de gradiente y con batch efectivo de 32. La configuración exacta está en `train_config/`.

El conjunto de olvido es únicamente el forget10 original (400 pares QA), mientras que el conjunto de retención usado por métodos que lo requieren es retain90 + para1 + para2 (10.800 ejemplos). La semilla 0 se usa tanto para el modelo de partida como para la ejecución de desaprendizaje, y las comparaciones se hacen contra modelos de referencia de la misma semilla. El autor documenta que el objetivo es separar la eliminación de las muestras concretas de la eliminación del conocimiento subyacente, que el modelo también aprendió en otras formulaciones.

## Capacidades

- Generación de texto conversacional, heredada de Llama 3.1 8B Instruct.
- Capacidad de responder preguntas sobre el dataset TOFU (evaluada mediante probabilidad Q-A, ROUGE y truth ratio).
- El checkpoint está diseñado específicamente para experimentos de desaprendizaje: se espera que haya perdido las respuestas del conjunto forget10 original.
- Soporte de tool calling, agentes o multi-step reasoning: no documentado en la model card (corresponde a las capacidades del modelo base, no verificadas aquí).
- Capacidades multilingües: no documentadas.
- No se documentan modos especiales (thinking, visión, audio) en este checkpoint.

## Casos de uso

- Investigación en desaprendizaje de máquinas: el modelo sirve como sujeto experimental para medir si WGA elimina conocimiento real o solo las formulaciones concretas del conjunto de olvido, comparando FADE de untraining y de unlearning.
- Evaluación de métodos de unlearning: permite reproducir los resultados del autor con semilla 0 y compararlos con las semillas 1 y 2 publicadas en la model card.
- Estudio de la brecha entre untraining y unlearning: útil para analizar por qué un modelo puede "olvidar" las muestras dadas y seguir respondiendo a paráfrasis del mismo conocimiento.
- Benchmarking de métricas de privacidad: el modelo y sus referencias asociadas permiten calibrar métricas como FADE, truth ratio o probabilidad Q-A en tareas de eliminación de datos.
- Análisis de robustez entre semillas: la tabla de semillas 0-2 del autor facilita estudiar la varianza de los resultados de desaprendizaje (FADE de unlearning 341,4 ± 42,3).
- Docencia y reproducción de experimentos: al estar integrado en la colección TOFU-para y usar open-unlearning, es adecuado para cursos o tutoriales sobre unlearning con transformers.

## Benchmarks y rendimiento

| Metrica | Valor (seed 0, este modelo) | Media ± sd (seeds 0-2) |
|---|---|---|
| FADE, untraining (vs retain90-forget10para-seed0, forget10 original) | 357,11 | 392,8 ± 31,0 |
| FADE, unlearning (vs retain90-seed0, forget10 original + 2 paráfrasis) | 296,71 (original 335,9 / para1 275,3 / para2 278,9) | 341,4 ± 42,3 |
| Calidad de olvido TOFU | 6,92e-05 | no disponible |
| Truth ratio del conjunto forget | 0,703 | 0,714 ± 0,013 |
| Probabilidad Q-A del conjunto forget | 0,004 | 0,003 ± 0,001 |
| ROUGE Q-A del conjunto forget | 0,136 | 0,080 ± 0,049 |
| Utilidad del modelo | 0,630 | 0,626 ± 0,009 |

Puntos de referencia FADE publicados por el autor:

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| Perfect untrainer (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 | 136,7 ± 0,4 (104 / 151 / 155) |
| Perfect unlearner (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) |
| Sin desaprendizaje (`x2-full`, modelo de partida, seeds 0-2) | 81,6 ± 0,7 | 156,3 ± 0,2 (157 / 154 / 158) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache; el repo ocupa 16,1 GB.
- GPU recomendadas: A100 40/80 GB, H100, o GPUs consumer con al menos 24 GB (RTX 3090, RTX 4090) para bfloat16.
- En GPUs consumer de 8-16 GB sería necesario cuantizar, pero no se publican pesos GGUF en el repo.
- Opciones de despliegue: transformers (documentado en la model card); text-generation-inference está entre los tags del modelo; vLLM, llama.cpp u Ollama no están documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | FADE unlearning (seed 0) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (WGA, seed 0) | 8,03 B | no disponible | 296,71 | llama3.1 | Hugging Face |
| `x2-full-seed0` (sin desaprendizaje) | 8,03 B (modelo base) | no disponible | 156,3 (media seeds 0-2) | llama3.1 | Hugging Face |
| `x2-retain90-seed0` (perfect unlearner) | 8,03 B (modelo base) | no disponible | 29,8 (media de referencia) | llama3.1 | Hugging Face |
| `x2-retain90-forget10para-seed0` (perfect untrainer) | 8,03 B (modelo base) | no disponible | 136,7 (media de referencia) | llama3.1 | Hugging Face |

La comparación se limita a los modelos de referencia de la propia colección TOFU-para; no se dispone de datos frente a otros modelos de desaprendizaje de la literatura.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de propósito general; su uso previsto es experimental.
- El propio autor advierte que FADE es una distancia, no una dirección: un valor intermedio no implica que el modelo esté "entre" dos modelos de referencia.
- Los resultados varían entre semillas (FADE de unlearning 296,7 a 380,7), por lo que conclusiones basadas en una sola semilla son frágiles.
- La calidad de olvido TOFU es muy baja (6,92e-05), lo que sugiere que el desaprendizaje no elimina por completo el conocimiento subyacente.
- Riesgo de alucinación y sesgos: no documentados específicamente para este checkpoint; hereda los del modelo base Llama 3.1 8B Instruct.
- Idiomas soportados no documentados.
- Licencia Llama 3.1 Community License: impone restricciones de uso comercial y obligaciones de atribución ("Built with Llama"); revisar el texto completo antes de cualquier uso en producción.
- No se publican pesos cuantizados ni instrucciones de despliegue más allá de transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-wga-seed0
- Modelo base: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Librería open-unlearning: https://github.com/locuslab/open-unlearning
