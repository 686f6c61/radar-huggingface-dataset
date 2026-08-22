# tbhrc/qwen3_5_9b_claude_4_6_highiq_instruct_heretic_uncensored_mxfp8

## Resumen

Este modelo es una versión cuantizada en formato MXFP8 (8.363 bits por peso) del fine-tune `DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED`, convertido al formato MLX para su ejecución en Apple Silicon mediante `mlx-vlm`. El modelo base es Qwen3.5-9B, un transformer multimodal de la serie Qwen3.5, al que se le ha aplicado un proceso de *abliteration* para eliminar los mecanismos de rechazo (refusals) y un fine-tuning con un dataset de destilación de Claude 4.6, orientado a elevar la capacidad de razonamiento.

El resultado es un modelo «sin censura» (uncensored) que acepta prácticamente cualquier instrucción, con una tasa de rechazo de solo 6 sobre 100 peticiones frente al 100 sobre 100 del modelo original. Está pensado para desarrolladores e investigadores que necesitan un LLM multimodal flexible, con licencia Apache 2.0, y que prefieren ejecutarlo en hardware de Apple (MLX) o en entornos que soporten el formato de pesos safetensors.

La relevancia de esta ficha radica en que combina un modelo de razonamiento de alta capacidad (destilado de Claude 4.6) con la eliminación de restricciones de seguridad, lo que lo hace útil para tareas de generación creativa sin límites, investigación en IA y pruebas de comportamiento de modelos, aunque con los riesgos asociados a la ausencia de salvaguardas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5-9B) |
| Parametros totales | 2.975.030.512 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MXFP8 (8.363 bpw) |
| Idiomas soportados | en, zh, ru, es, fr, it, ja, ko, af, de, ar, tr, is, pl, sw, sv, nl, he, id, uk, fa, pa, pt, ms, fi, el |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-9B, un transformer multimodal de la serie Qwen3.5, con capacidad para procesar imágenes y texto. El fine-tune de DavidAU ha sido entrenado con un dataset de destilación de Claude 4.6, diseñado para mejorar la capacidad de razonamiento y la coherencia en tareas complejas. El proceso de abliteration elimina las activaciones neuronales que se correlacionan con el rechazo de instrucciones, reduciendo drásticamente la tasa de refusal (de 100/100 a 6/100) sin afectar significativamente a la calidad del texto generado (KL divergence de 0.069 respecto al modelo original).

La conversión a MLX se ha realizado con `mlx-vlm` versión 0.4.4, lo que permite ejecutar el modelo en Apple Silicon con cuantización MXFP8, un formato de 8 bits que reduce el uso de memoria manteniendo una buena fidelidad. No se dispone de detalles sobre la composición exacta del dataset de entrenamiento ni sobre el número de tokens utilizados, ni sobre la aplicación de técnicas de RLHF o DPO más allá del fine-tuning supervisado.

## Capacidades

- Generacion de texto: produce respuestas coherentes y contextualizadas en multiples idiomas.
- Razonamiento: mejora notable en tareas de razonamiento común (ARC, PIQA, WinoGrande) frente al modelo base.
- Capacidades multimodales: acepta imagenes como entrada junto con texto (image-text-to-text).
- Conversacion multi-turno: mantiene el contexto en dialogos largos.
- Sin censura: no rechaza instrucciones sobre temas sensibles (politica, religion, contenido explicito).
- Modo instruct: la plantilla jinja modificada fuerza el modo de instrucciones, sin modo de pensamiento.
- Multilingue: soporta mas de 25 idiomas, incluidos espanol, ingles, chino, frances, aleman, etc.
- No se ha confirmado soporte de tool calling ni function calling en la informacion disponible.

## Casos de uso

- **Generacion de contenido creativo sin restricciones**: el modelo puede producir narrativas, guiones, poesia o contenido explicito sin limitaciones de censura, util para creadores que necesitan explorar temas tabu o generar material para ficcion adulta.
- **Investigacion en seguridad y alineacion de modelos**: al ser una version abliterada, permite estudiar como se comportan los modelos sin mecanismos de rechazo, ayudando a disenar mejores sistemas de moderacion.
- **Analisis de razonamiento avanzado**: gracias al fine-tune con Claude 4.6, es adecuado para tareas de razonamiento complejo, como resolver problemas de logica o de matematica, aunque no se han publicado resultados de benchmarks especificos.
- **Asistente conversacional para entornos de simulacion**: puede usarse en chatbots de roleplay o simulaciones de personajes que requieren respuestas sin filtros.
- **Traduccion y generacion multilingue**: soporta multiples idiomas, por lo que puede usarse para traduccion automatica o generacion de contenido en varios idiomas.
- **Procesamiento de imagenes y texto**: al ser multimodal, puede describir imagenes, responder preguntas sobre ellas o combinar informacion visual y textual en una misma respuesta.

## Benchmarks y rendimiento

Los resultados de la model card se presentan a continuacion, comparando este modelo (HERETIC) con la version no-heretic y con el modelo base Qwen3.5-9B, todos en cuantizacion MXFP8:

| Benchmark | Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC (mxfp8) | Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT (mxfp8) | Qwen3.5-9B (mxfp8) |
|-----------|:---:|:---:|:---:|
| ARC (challenge) | 0.574 | 0.574 | 0.417 |
| ARC (easy) | 0.755 | 0.729 | 0.458 |
| BoolQ | 0.869 | 0.882 | 0.623 |
| HellaSwag | 0.714 | 0.711 | 0.634 |
| OpenBookQA | 0.410 | 0.422 | 0.338 |
| PIQA | 0.780 | 0.775 | 0.737 |
| WinoGrande | 0.691 | 0.691 | 0.639 |

La version heretic muestra una mejora significativa frente al modelo base en todos los benchmarks, y mantiene un rendimiento similar a la version sin heretic en la mayoria de tareas, con una ligera perdida en BoolQ y OpenBookQA pero una mejora en ARC easy.

## Requisitos de hardware

- VRAM estimada: con 2.975 millones de parametros en MXFP8 (1 byte por parametro), el peso del modelo es aproximadamente 3 GB. Se puede ejecutar en GPUs con al menos 4 GB de VRAM, como una RTX 3060 o superior.
- GPU recomendadas: el formato MLX esta optimizado para Apple Silicon (M1, M2, M3, M4). En GPUs de NVIDIA, se puede ejecutar mediante convertidores a otros formatos, pero no es el caso de este repo. Para uso en NVIDIA, se recomienda convertir a GGUF o usar el modelo original en safetensors.
- En consumer GPU: cabe en la mayoria de GPUs modernas con 8 GB de VRAM o mas (RTX 4060, RTX 4070, RTX 4090).
- Opciones de despliegue: MLX (Apple Silicon), llama.cpp (si se convierte a GGUF), vLLM (si se usa el modelo base sin cuantizacion).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Rendimiento ARC |
|---|---|---|---|---|---|
| Qwen3.5-9B (base) | 9B (aprox.) | No disponible | MXFP8 | Apache 2.0 | 0.417 |
| Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT | 9B (aprox.) | No disponible | MXFP8 | Apache 2.0 | 0.574 |
| Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC (este) | 2.975M (segun safetensors) | No disponible | MXFP8 | Apache 2.0 | 0.574 |

La version HERETIC mantiene el rendimiento de la version INSTRUCT sin el abliteration, lo que indica que la eliminacion de los mecanismos de rechazo no degrada significativamente la capacidad de razonamiento. Otras alternativas en el ecosistema Qwen3.5 incluyen destilados de razonamiento como el Opus-Reasoning-Distilled, pero no se dispone de datos comparativos.

## Limitaciones y advertencias

- **Contenido sin censura**: al eliminar los rechazos, el modelo puede generar contenido explicito, ofensivo o peligroso. Debe usarse con precaucion y no desplegarse en entornos de produccion sin moderacion adicional.
- **Riesgo de alucinacion**: como cualquier LLM, puede inventar informacion falsa, especialmente en temas de actualidad o muy especializados.
- **Datos de entrenamiento limitados**: no se conoce la composicion del dataset de destilacion de Claude 4.6, por lo que puede tener sesgos heredados de ese modelo o del propio Qwen3.5.
- **Contexto limitado**: no se ha especificado la longitud de contexto; en modelos Qwen3.5-9B suele ser de 128K tokens, pero no se confirma en este repo.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial, pero el contenido generado puede incumplir normativas de moderacion de plataformas.
- **Dependencia del formato MLX**: este repo solo incluye pesos en formato MLX (safetensors), por lo que no es compatible directamente con librerias como llama.cpp o vLLM sin conversion previa.
- **Parametros reales**: el archivo safetensors contiene 2.975.030.512 parametros, lo que es inferior a los 9B que sugiere el nombre del modelo base; esto podria deberse a una cuantizacion agresiva o a un modelo base distinto al esperado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tbhrc/qwen3_5_9b_claude_4_6_highiq_instruct_heretic_uncensored_mxfp8
- Modelo base original: https://huggingface.co/DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED
- Version MLX mxfp8 de TheCluster: https://huggingface.co/TheCluster/Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED-MLX-mxfp8
- Version GGUF en ModelScope: https://www.modelscope.cn/models/Jackrong/Qwen3.5-9B-Claude-4.6-Opus-Reasoning-Distilled-GGUF
- Version v2 del destilado Opus: https://www.modelscope.cn/models/Jackrong/Qwen3.5-9B-Claude-4.6-Opus-Reasoning-Distilled-v2
