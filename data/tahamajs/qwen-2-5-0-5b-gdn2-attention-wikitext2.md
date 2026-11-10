# tahamajs/qwen-2.5-0.5b-gdn2-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-gdn2-attention-wikitext2` es un checkpoint experimental derivado de Qwen2.5-0.5B en el que se ha sustituido el mecanismo de atencion original por una implementacion denominada `gdn2_attention`, registrada en el `ATTENTION_REGISTRY` del framework NeuralOps. El autor aplica un patron de "cirugia" identificado como `hybrid_3_1`, que presumiblemente reemplaza la atencion en una de cada cuatro capas (3:1) manteniendo el resto de la arquitectura intacta. El modelo se publica como un artefacto de investigacion, no como un modelo listo para produccion.

El entrenamiento posterior a la sustitucion consiste en una destilacion de conocimiento (KD) sobre el dataset WikiText-2 (`wikitext-2-raw-v1`), ejecutada en una NVIDIA RTX 3090 durante 212,9 segundos. El dato mas relevante del checkpoint es que la perplejidad causal antes y despues de la destilacion es identica (1.805.602,10), con un delta de +0,00, lo que sugiere que el proceso de KD no produjo ninguna mejora medible en este checkpoint. Se trata, por tanto, de un experimento de viabilidad tecnica mas que de un modelo utilizable.

El modelo tiene 533.994.100 parametros (segun los pesos en safetensors), un tamano de repositorio de 1,2 GB y esta etiquetado con `safetensors` y `qwen2`. No se declara licencia, idiomas soportados ni pipeline de uso, y en el momento de la consulta cuenta con cero descargas y cero likes. Su interes es exclusivamente como referencia para quienes investigan tecnicas de transplante de atencion y destilacion sobre modelos pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion sustituida por `gdn2_attention` en patron `hybrid_3_1` |
| Parametros totales | 533.994.100 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B, no declarada en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de partida es Qwen2, un transformer decoder-only con atencion causal estandar. Sobre esa base, el autor aplica un transplante de atencion: sustituye el mecanismo original por `gdn2_attention`, una implementacion registrada en el `ATTENTION_REGISTRY` de NeuralOps. El patron `hybrid_3_1` indica una mezcla de capas con atencion original y capas con la nueva atencion en proporcion 3:1. La model card no detalla la formulacion matematica de `gdn2_attention` ni el numero exacto de capas afectadas.

El entrenamiento consiste en una destilacion de conocimiento sobre WikiText-2 (`wikitext-2-raw-v1`), un corpus de texto en ingles de Wikipedia. La ejecucion completa dura 212,9 segundos en una RTX 3090. El resultado reportado es una perplejidad causal de 1.805.602,10 tanto antes como despues de la KD, con delta +0,00. Una perplejidad de ese orden de magnitud es indicativa de un modelo que no ha convergido o cuyo transplante de atencion ha degradado severamente la distribucion de salida; el hecho de que la KD no la modifique sugiere que el proceso no esta ajustando los pesos de forma efectiva. No se documentan datos sobre volumen de tokens, composicion del dataset, RLHF, DPO ni innovaciones adicionales como decodificacion especulativa.

## Capacidades

- Generacion de texto: teoricamente heredada de Qwen2.5-0.5B, pero la perplejidad reportada (1.805.602,10) indica que la calidad de generacion esta gravemente comprometida en este checkpoint.
- Razonamiento y matematicas: no verificable con los datos disponibles; no se han publicado evaluaciones.
- Codigo: no verificable; no se han publicado evaluaciones.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no declaradas; el unico dataset de ajuste documentado es WikiText-2 en ingles.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Investigacion sobre transplante de atencion: el checkpoint sirve como referencia reproducible para estudiar como afecta la sustitucion de atencion (`gdn2_attention`, patron `hybrid_3_1`) a la perplejidad de un modelo Qwen2 pequeno. Se usaria cargando los pesos safetensors y comparando la distribucion de salida con el modelo base.
- Reproduccion de experimentos de destilacion: permite replicar el pipeline de KD sobre WikiText-2 en una unica RTX 3090 en menos de cuatro minutos, util para validar infraestructura de entrenamiento antes de escalar a modelos mayores.
- Benchmarking de frameworks de atencion: util para comparar el rendimiento de `gdn2_attention` frente a la atencion estandar de Qwen2 en terminos de velocidad y estabilidad numerica, no de calidad final.
- Analisis de fallos de convergencia: la perplejidad identica pre y post-KD lo convierte en un caso de estudio sobre diagnosticos de destilacion inefectiva (learning rate, congelacion de pesos, incompatibilidad de shapes).
- Docencia y formacion: ejemplo practico de cirugia de arquitectura sobre un modelo de 0,5B con requisitos de hardware modestos.
- No recomendado para aplicaciones de produccion: atencion al cliente, generacion de codigo, agentes o cualquier tarea que requiera calidad de salida fiable, dado el estado del checkpoint.

## Benchmarks y rendimiento

| Metrica | Pre-KD | Post-KD | Delta |
|---|---|---|---|
| Perplejidad causal (WikiText-2) | 1.805.602,10 | 1.805.602,10 | +0,00 |
| Tiempo de destilacion | no aplica | 212,9 s (RTX 3090) | no aplica |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,1 GB solo para pesos (533,99M parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 2 y 4 GB segun longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,6 GB para pesos; en 4 bits, alrededor de 0,3 GB (aunque no se publican pesos cuantizados, seria necesario generarlos).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM deberia poder cargar los pesos en fp16; el autor valido el entrenamiento en una RTX 3090.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: al ser un checkpoint safetensors con arquitectura Qwen2 modificada, la compatibilidad con vLLM, llama.cpp, Ollama o TGI no esta garantizada; requeriria una implementacion de `gdn2_attention` en el runtime correspondiente. No se documenta ninguna integracion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| tahamajs/qwen-2.5-0.5b-gdn2-attention-wikitext2 | 533,99M | no disponible | no disponible | Experimental, 0 descargas | Perplejidad 1.805.602,10; KD sin efecto |
| Qwen2.5-0.5B (base) | 494M aprox. | 32.768 tokens (declarado por Qwen) | Apache 2.0 (declarada por Qwen) | Produccion | Modelo de referencia; calidad validada |
| Qwen2.5-0.5B-Instruct | 494M aprox. | 32.768 tokens | Apache 2.0 | Produccion | Version ajustada para instrucciones |
| SmolLM2-360M | 360M aprox. | 8.192 tokens | Apache 2.0 | Produccion | Alternativa pequena para edge |

Los datos de Qwen2.5-0.5B y SmolLM2-360M corresponden a sus especificaciones publicas; no se dispone de comparaciones de rendimiento directas con este checkpoint en la informacion proporcionada.

## Limitaciones y advertencias

- Perplejidad extremadamente alta (1.805.602,10) en WikiText-2, indicativa de un modelo que probablemente no genera texto coherente.
- La destilacion de conocimiento no produjo ninguna mejora (delta +0,00), lo que sugiere un fallo en el pipeline de entrenamiento o una incompatibilidad entre la atencion transplantada y el resto de la red.
- Licencia no declarada: no se puede asumir uso comercial permitido; contactar con el autor antes de cualquier uso.
- Idiomas no declarados; el unico dato de ajuste es WikiText-2 en ingles.
- Riesgo elevado de alucinacion y salidas degeneradas por el estado del checkpoint.
- Compatibilidad de despliegue incierta: la atencion `gdn2_attention` no es estandar y requiere soporte especifico en el runtime.
- Sin descargas ni likes: no hay evidencia de validacion por parte de la comunidad.
- No apto para produccion ni para tareas que requieran calidad de salida fiable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-gdn2-attention-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- Framework NeuralOps: no disponible en la informacion proporcionada
- Paper o blog de `gdn2_attention`: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
