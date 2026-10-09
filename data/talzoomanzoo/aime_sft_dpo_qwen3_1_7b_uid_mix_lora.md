# talzoomanzoo/aime_sft_dpo_qwen3_1_7b_uid_mix_lora

## Resumen

`talzoomanzoo/aime_sft_dpo_qwen3_1_7b_uid_mix_lora` es un adaptador LoRA (PEFT) publicado por el usuario talzoomanzoo sobre Qwen3-1.7B, orientado a la resolución de problemas de matemáticas de competición del estilo AIME. El nombre del repositorio indica la secuencia de entrenamiento aplicada: un ajuste supervisado (SFT) seguido de optimización por preferencias (DPO), con una mezcla de datos identificada como `uid_mix`. No se trata de un modelo completo, sino de un delta de pesos que debe aplicarse sobre una base concreta.

El punto crítico para su uso es que, según la propia model card, el adaptador requiere el modelo base fusionado que el autor guardó en `./checkpoint/aime_sft_qwen3_1_7b_pair_union_merged`. Ese checkpoint intermedio no se distribuye en el repositorio de HuggingFace, de modo que el adaptador no es directamente utilizable solo con `Qwen/Qwen3-1.7B`: hace falta reproducir primero la fase de SFT o disponer del checkpoint original.

La relevancia de esta ficha es más metodológica que de rendimiento: sirve como ejemplo de pipeline de especialización matemática en dos etapas sobre un modelo denso de 1,7 mil millones de parámetros, un tamaño que cabe en GPU de consumo. La model card está prácticamente vacía (todas las secciones marcadas como "More Information Needed"), no declara licencia ni idiomas y el repositorio acumula 0 descargas y 0 "likes", por lo que no hay evidencia pública de validación por terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer decoder-only denso (base Qwen3-1.7B) |
| Parametros totales | No disponible para el adaptador (0,3 GB de repositorio). El modelo base Qwen3-1.7B declara 1,7 mil millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card del adaptador. La base Qwen3-1.7B declara 32.768 tokens nativos (ampliables con YaRN) |
| Tipos de cuantizacion | No disponible. Al ser un adaptador PEFT, la cuantizacion se aplica al modelo fusionado o a la base (por ejemplo, en formato GGUF tras la fusion) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el repositorio no declara licencia; la base Qwen3-1.7B se publica bajo Apache-2.0) |
| Formato de pesos | Pesos de adaptador PEFT (libreria `peft`, version 0.21.2). El repositorio no indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se suman a las proyecciones del modelo base. No se describe en la model card ni el rango (`r`), ni el `lora_alpha`, ni las capas objetivo, ni si se aplicó cuantizacion durante el entrenamiento (QLoRA). El entrenamiento declarado en el nombre del repositorio se divide en dos fases: primero un SFT que dio lugar al checkpoint `aime_sft_qwen3_1_7b_pair_union_merged`, y después un DPO sobre ese modelo ya ajustado. La model card advierte explícitamente de que el adaptador requiere cargar ese modelo base fusionado antes de aplicar el LoRA, lo que implica que el adaptador no es un complemento genérico para Qwen3-1.7B.

La model card no aporta ningún dato sobre el dataset de entrenamiento: se desconoce el número de tokens, la composición exacta del `uid_mix`, si se incluyeron soluciones de tipo "pair union" (problemas emparejados) y si hubo curación o filtrado. Tampoco se documentan hiperparámetros, precisión de entrenamiento (fp32, bf16, etc.), hardware utilizado ni número de pasos. El único metadato técnico concreto del repositorio es la versión de PEFT (0.21.2), que fija la versión mínima recomendada para cargar el adaptador. El tag `arxiv:1910.09700` corresponde a la referencia de Lacoste et al. sobre el calculador de impacto medioambiental, incluida en la plantilla de model card, no a un paper del modelo.

## Capacidades

- Generación de texto conversacional, según el `pipeline_tag: text-generation` y el tag `conversational` del repositorio.
- Resolución de problemas matemáticos de competición: el nombre del modelo hace referencia explícita a AIME, aunque no hay ninguna evaluación publicada que lo confirme.
- Razonamiento en cadena (chain-of-thought) heredado de la familia Qwen3, presumiblemente en modo "thinking" o "non-thinking" de la base, sin que el autor lo documente.
- Capacidad de ajuste a formato de respuesta propio de problemas matemáticos (entrenamiento SFT + DPO), no verificable con los datos disponibles.
- Soporte de tool calling / function calling: no disponible en la información del adaptador (la base Qwen3-1.7B sí lo soporta).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declara ningún idioma).
- Capacidades especiales (visión, audio, modo thinking explícito): no disponibles.

## Casos de uso

- Investigación en alineación con preferencias sobre dominios matemáticos: el adaptador permite reproducir un pipeline SFT seguido de DPO sobre un modelo de 1,7B, útil como caso de estudio de bajo coste en experimentos de RLHF/DPO.
- Reproducción de experimentos académicos: dado que la model card no publica hiperparámetros ni dataset, el caso de uso realista es replicar la receta y comparar resultados frente a la línea base, no desplegar el adaptador tal cual.
- Evaluación comparativa de técnicas de ajuste eficiente: sirve como punto de comparación frente a LoRA de una sola fase o frente a ajuste completo, midiendo la ganancia aportada por la fase DPO.
- Generación de soluciones paso a paso para problemas de tipo AIME: si la fusión con el checkpoint SFT se realiza correctamente, el modelo podría generar razonamientos matemáticos extensos, pero el rendimiento real no está verificado.
- Ajuste posterior sobre dominios específicos (por ejemplo, olimpiadas nacionales): al ser un adaptador de bajo rango sobre una base de 1,7B, se puede seguir entrenando en una GPU de consumo.
- Docencia y generación de material de práctica: uso potencial para producir problemas y soluciones de nivel competición, siempre con revisión humana por el riesgo de alucinación en pasos intermedios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye la sección de evaluación con datos (todas las celdas figuran como "More Information Needed"), no se declara puntuación en AIME, MATH, GSM8K ni en ninguna otra prueba, y el repositorio no cuenta con descargas ni discusiones que aporten mediciones de terceros.

## Requisitos de hardware

- El repositorio ocupa 0,3 GB, un tamaño compatible con los pesos de un adaptador LoRA, no con un modelo completo.
- Inferencia del modelo base Qwen3-1.7B en fp16/bf16: aproximadamente 3,4 GB de pesos, más caché KV; estimación orientativa de 4 a 6 GB de VRAM según longitud de contexto y tamaño de lote.
- Inferencia cuantizada a 4 bits tras fusionar el adaptador: del orden de 1,2 a 2 GB de pesos, lo que permite ejecución en GPUs de 4-6 GB.
- GPUs consumer compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, así como equipos con 8 GB de VRAM en cuantización de 4 bits.
- GPUs de centro de datos (A100, H100) no son necesarias para este tamaño; solo tendrían sentido para entrenamiento o para servir muchas peticiones concurrentes.
- Opciones de despliegue: `transformers` + `peft` para aplicar el adaptador (requiere el checkpoint base fusionado), y `vLLM`, `llama.cpp`, `Ollama` o TGI tras fusionar el adaptador en la base y, si procede, convertir a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.
- Requisito previo específico: hay que disponer o regenerar el checkpoint `aime_sft_qwen3_1_7b_pair_union_merged`, que no se distribuye en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aime_sft_dpo_qwen3_1_7b_uid_mix_lora | Adaptador sobre base de 1,7B | No disponible | LoRA (SFT + DPO) | No disponible | Publicado, requiere checkpoint base no incluido |
| Qwen/Qwen3-1.7B | 1,7B | 32.768 tokens (ampliable) | Denso, modos thinking y non-thinking | Apache-2.0 | Modelo completo, pesos safetensors |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | No disponible en esta busqueda | Denso, destilado de razonamiento | No disponible en esta busqueda | Modelo completo |
| Qwen2.5-Math-1.5B | 1,5B | No disponible en esta busqueda | Denso, especializado en matematicas | No disponible en esta busqueda | Modelo completo |

Nota: los datos de los modelos comparativos deben verificarse en sus respectivas model cards; en el material disponible solo se confirman los de Qwen3-1.7B. No hay resultados de benchmarks que permitan comparar rendimiento entre estas alternativas.

## Limitaciones y advertencias

- Model card vacía: todas las secciones relevantes (descripción, datos de entrenamiento, evaluación, sesgos, impacto ambiental) figuran como "More Information Needed".
- Dependencia de un checkpoint no distribuido: el adaptador no funciona aplicado directamente sobre `Qwen/Qwen3-1.7B`; necesita el modelo fusionado de la fase SFT, que el autor no publica en el repositorio.
- Licencia no declarada: al no especificarse licencia, el uso comercial del adaptador queda en un limbo legal, con independencia de que la base Qwen3-1.7B sea Apache-2.0.
- Idiomas no declarados: se desconoce si el ajuste conserva el multilingüismo de la base o lo degrada hacia el inglés.
- Riesgo de alucinación en razonamiento matemático: un ajuste con DPO sobre datos de competición puede aumentar la confianza en cadenas de razonamiento incorrectas; sin evaluación publicada no hay forma de cuantificarlo.
- Sesgos: no documentados por el autor; se heredan los de la base y los del dataset de entrenamiento, que no se describe.
- Sin validación externa: 0 descargas y 0 "likes" en el momento de la consulta, sin discusiones ni evaluaciones de terceros.
- Fecha de creación anómala (2026-10-08) en los metadatos del repositorio, lo que sugiere que los datos de registro pueden no ser fiables.
- No apto para producción sin verificación previa: la ausencia de benchmarks, de licencia y de instrucciones de uso completas desaconseja su despliegue directo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/talzoomanzoo/aime_sft_dpo_qwen3_1_7b_uid_mix_lora
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio GitHub de la serie Qwen3: https://github.com/QwenLM/Qwen3
- Repositorio GitHub de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Adaptador relacionado del mismo autor: https://huggingface.co/talzoomanzoo/aime_dpo_qwen3_1_7b_uid_lora_tuned/discussions
- Adaptador relacionado del mismo autor (con detalles de fusión en float32 y exportación a bfloat16 safetensors): https://featherless.ai/models/talzoomanzoo/aime_dpo_qwen3_1_7b_sc_lora_fullcoverage
- Referencia citada en la model card (calculador de impacto, Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculador de impacto de ML: https://mlco2.github.io/impact#compute
