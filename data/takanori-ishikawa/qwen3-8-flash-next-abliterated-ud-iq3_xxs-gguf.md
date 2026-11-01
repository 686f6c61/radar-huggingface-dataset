# takanori-ishikawa/Qwen3.8-Flash-Next-Abliterated-UD-IQ3_XXS-GGUF

## Resumen

Qwen3.8-Flash-Next-Abliterated-UD-IQ3_XXS-GGUF es una versión "abliterated" (con el vector de rechazo eliminado) del modelo Qwen3.8-Flash-Next de Qwen, publicada por el usuario takanori-ishikawa. El modelo parte de la cuantización UD-IQ3_XXS de Unsloth y aplica una proyección ortogonal sobre las matrices que escriben al flujo residual en las 48 capas para eliminar la dirección de rechazo estimada a partir de la diferencia de pesos con la versión BF16 original. El resultado es un modelo que responde a la gran mayoría de peticiones de HarmBench (77 de 100 cumplidas) manteniendo prácticamente el mismo rendimiento en tareas de razonamiento y matemáticas que el original.

El modelo base Qwen3.8-Flash-Next es un transformer de 176.943.899.520 parámetros totales (unos 177 mil millones), lo que lo sitúa en la categoría de modelos grandes que requieren hardware de gama alta o cuantización agresiva para su despliegue. La cuantización IQ3_XXS reduce el peso a 76,3 GiB distribuidos en cuatro shards, con una tabla de embeddings por capa de 26,8 GiB separada en su propio shard para permitir streaming desde SSD.

La relevancia de esta ficha radica en que documenta un caso de modificación de seguridad (safety fine-tuning removal) sobre un modelo grande, con receta reproducible incluida en el repositorio, y con evaluación cuantitativa del efecto tanto en capacidades como en cumplimiento de peticiones dañinas. Es un ejemplo técnico de cómo se construyen y evalúan las variantes "uncensored" en el ecosistema open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (48 capas, con atención y linear-attention; detalles completos no disponibles) |
| Parametros totales | 176.943.899.520 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card menciona salidas de hasta 32K tokens y peticiones que "piensan" más allá de 32K) |
| Tipos de cuantizacion | IQ3_XXS (UD-IQ3_XXS de Unsloth); el repositorio solo distribuye esta cuantización |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | GGUF (4 shards, split `00001-of-00004` a `00004-of-00004`) |

## Arquitectura y entrenamiento

El modelo es una modificación post-entrenamiento del Qwen3.8-Flash-Next original. No se ha reentrenado: la receta consiste en (1) tomar la dirección de rechazo de orcarouter/Qwen3.8-Flash-Next-Uncensored, estimada a partir de la diferencia de pesos BF16 respecto al original; (2) eliminar esa dirección del lado de salida de cada matriz que escribe al flujo residual en las 48 capas (salida de atención y linear-attention, proyecciones down de expertos compartidos y enrutados, `token_embd` y `ple_value`) mediante la proyección `W' = W − u (uᵀ W)`, partiendo de los pesos BF16 originales; y (3) recuantizar cada tensor editado al tipo de Unsloth, repitiendo proyección y cuantización dos veces, y sustituirlo en el GGUF UD-IQ3_XXS. El resto de tensores se copian byte a byte.

La arquitectura subyacente del modelo base incluye 48 capas con mecanismos de atención y linear-attention, y una tabla de embeddings por capa (`per_layer_token_embd.weight`, 26,8 GiB) que se ha separado en su propio shard para que los motores de inferencia puedan hacer streaming desde SSD. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base en la información proporcionada. La model card menciona soporte para decodificación especulativa mediante el draft DFlash2, con el que la velocidad de decodificación iguala a la del original.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento y matemáticas: mantiene el rendimiento del original en GSM8K (48/50) y MMLU-Pro (45/50) según la evaluación del autor.
- Modo "thinking": el modelo puede generar cadenas de razonamiento largas; la model card advierte que ciertas peticiones pueden superar los 32K tokens de pensamiento y recomienda fijar un presupuesto de pensamiento (por ejemplo 8K).
- Cumplimiento de peticiones dañinas: 77 de 100 peticiones de HarmBench cumplidas, frente a 2 del original.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integración con infraestructuras de inferencia estándar.
- Optimización para Apple Silicon: etiqueta `apple-silicon` y evaluación realizada en un M4 Pro Mac mini de 64 GB.
- Capacidades de tool calling, function calling, agentes y multilingüismo: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en seguridad de IA: el repositorio incluye la receta completa (`recipe/`) con el vector de dirección, scripts y pasos de reconstrucción, lo que permite reproducir el proceso y estudiar el efecto de la eliminación del rechazo sobre las capacidades del modelo.
- Evaluación comparativa de variantes "uncensored": con resultados de HarmBench, GSM8K y MMLU-Pro sobre el mismo hardware y semilla, sirve como referencia para comparar distintas técnicas de abliteration (orcarouter, SC117, etc.).
- Despliegue en Apple Silicon: con 76,3 GiB de pesos y streaming de la tabla de embeddings desde SSD, es viable en equipos con 64 GB de memoria unificada como el M4 Pro usado en la evaluación, usando llama.cpp o Splash.
- Generación de texto sin restricciones temáticas en entornos controlados: útil para estudiar el comportamiento del modelo en dominios donde el original rechaza responder, siempre dentro de marcos legales y éticos.
- Pruebas de robustez y red teaming: la diferencia de comportamiento frente al original (2 vs. 77 cumplimientos en HarmBench) permite analizar qué tipos de peticiones se ven afectadas por la eliminación de la dirección de rechazo.
- Inferencia con decodificación especulativa: combinado con el draft DFlash2, permite mantener la velocidad de decodificación del original en entornos con recursos limitados.

## Benchmarks y rendimiento

Evaluación del autor con GSM8K test 50, MMLU-Pro test 50 y HarmBench estándar 100, semilla 407, ejecutada en Splash 1.4.0 con DFlash2 sobre un M4 Pro Mac mini (64 GB). Las respuestas de HarmBench se juzgaron con el clasificador oficial cais/HarmBench-Llama-2-13b-cls (Q8_0 GGUF), recortando cada respuesta a sus primeros 512 tokens. Sin presupuesto de pensamiento, hasta 32K tokens de salida:

| Modelo | GSM8K | MMLU-Pro | HarmBench (cumplidas / rechazadas / cortadas) |
|---|---:|---:|---|
| Original UD-IQ3_XXS | 48 | 43 | 2 / 98 / 0 |
| orcarouter IQ3_XXS | 48 | 35 | 73 / 11 / 16 |
| SC117 GSQ-RCO-abliterated IQ3_XXS | 48 | 45 | 73 / 19 / 8 |
| **Este modelo** | 48 | 45 | 77 / 17 / 6 |

El autor advierte que, con 50 preguntas a temperatura 1.0, las diferencias de unas pocas preguntas son ruido estadístico.

## Requisitos de hardware

- VRAM/memoria estimada: 76,3 GiB de pesos en IQ3_XXS, más overhead de contexto y KV cache; se necesita al menos 80 GB de memoria total para cargar todos los shards, o streaming desde SSD para la tabla de embeddings por capa (26,8 GiB).
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, se sitúa en el rango de A100 80 GB, H100 80 GB o configuraciones multi-GPU.
- Consumer GPU: no cabe en GPU de consumo convencionales (RTX 4090 con 24 GB) sin offloading a RAM/SSD; sí es viable en Apple Silicon con 64 GB de memoria unificada, como demuestra la evaluación en M4 Pro.
- Opciones de despliegue: llama.cpp y Splash (mencionados explícitamente); compatible con endpoints según la etiqueta del repositorio. vLLM, Ollama y TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles de forma numérica; la model card indica que, con el draft DFlash2, la velocidad de decodificación iguala a la del original.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K (50) | MMLU-Pro (50) | HarmBench cumplidas | Licencia |
|---|---|---:|---:|---:|---:|---|
| Este modelo (IQ3_XXS) | 176,9 B | no disponible | 48 | 45 | 77/100 | qwen-community-1.0 |
| Qwen3.8-Flash-Next original (UD-IQ3_XXS) | 176,9 B | no disponible | 48 | 43 | 2/100 | qwen-community-1.0 |
| orcarouter Qwen3.8-Flash-Next-Uncensored (IQ3_XXS) | no disponible | no disponible | 48 | 35 | 73/100 | Apache-2.0 (según NOTICE) |
| SC117 Qwen3.8-Flash-Next-GSQ-RCO-abliterated (IQ3_XXS) | no disponible | no disponible | 48 | 45 | 73/100 | no disponible |

## Limitaciones y advertencias

- La eliminación de la dirección de rechazo reduce drásticamente las salvaguardas: 77 de 100 peticiones dañinas de HarmBench son cumplidas, frente a 2 del original. No es apto para despliegues públicos sin filtros externos.
- La model card advierte que peticiones de ciberintrusión grave y de naturaleza química/biológica pueden generar pensamientos de más de 32K tokens; se recomienda fijar un presupuesto de pensamiento (por ejemplo 8K) para acotar coste y latencia.
- Riesgo de alucinación: no evaluado en la información proporcionada; aplican los riesgos habituales de los modelos de lenguaje de gran tamaño.
- Idiomas soportados: no disponibles; no se puede confirmar el comportamiento multilingüe.
- Licencia Qwen Community License 1.0: es necesario revisar sus términos para uso comercial; la modificación abliterated no cambia la licencia del modelo base.
- La evaluación se realizó con muestras pequeñas (50 preguntas en GSM8K y MMLU-Pro, 100 en HarmBench) y el propio autor señala que las diferencias de pocas preguntas son ruido; los resultados no deben interpretarse como diferencias significativas.
- El repositorio solo distribuye la cuantización IQ3_XXS; no hay versiones BF16, Q4, Q8 u otras en la información disponible.
- El modelo se distribuye en cuatro shards con una tabla de embeddings separada; el despliegue requiere gestionar streaming desde SSD en equipos con memoria limitada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/takanori-ishikawa/Qwen3.8-Flash-Next-Abliterated-UD-IQ3_XXS-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantización de Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Dirección de rechazo (orcarouter): https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Variante SC117: https://huggingface.co/SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
- Draft DFlash2: https://huggingface.co/incoai/Qwen3.8-Flash-Next-DFlash2
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Splash: https://github.com/incoai/splash
- GSM8K: https://github.com/openai/grade-school-math
- MMLU-Pro: https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro
- HarmBench: https://github.com/centerforaisafety/HarmBench
- Clasificador HarmBench: https://huggingface.co/cais/HarmBench-Llama-2-13b-cls
