# xbill9/gemma-4-E2B-it-lazy-capped64-q4_0-gguf

## Resumen
Este repositorio contiene un GGUF Q4_0 experimental y no oficial de Gemma 4 E2B-it, publicado por el usuario independiente xbill9 a partir de su propio build `xbill9/gemma-4-E2B-it-qat-q4_0-exact-gguf`. Sobre esos pesos cuantizados se aplicó un ajuste fino con LoRA cuyo objetivo es que el modelo produzca su respuesta correcta más corta posible cuando el bloque de razonamiento se trunca a 64 tokens. El resultado se volvió a redondear sobre la misma rejilla Q4_0 del GGUF original, de modo que el fichero conserva el mismo tamano, los mismos tensores y las mismas flags de `llama-server`.

El problema que aborda es el coste en tokens del razonamiento: en GSM8K, el modelo base sin limite consume 994,9 tokens por respuesta correcta, mientras que este build consume 454,0 con unaprecision estadisticamente indistinguible (1.175 aciertos frente a 1.187 sobre 1.319 problemas). No es un modelo nuevo ni un entrenamiento desde cero: es un experimento de destilacion de trazas cortas sobre pesos de 4 bits, parte del proyecto lazy-gemma (Hacktoberfest 2026, semana 3).

Los datos disponibles indican 4.628.569.635 parametros totales en safetensors y un repo de 2,6 GB en formato GGUF Q4_0, con licencia Apache 2.0 heredada de Gemma 4 (Google DeepMind). La informacion proporcionada no documenta la arquitectura interna, la longitud de contexto nativa ni los idiomas soportados, y no hay resultados de benchmarks fuera de GSM8K.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor no la documenta; el sufijo "E2B" del nombre sugiere una variante con parametros efectivos, sin confirmar en la informacion) |
| Parametros totales | 4.628.569.635 (dato de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible como ventana nativa; el autor ejecuta con `-c 8192` y entrena con longitud de 2.048 tokens |
| Tipos de cuantizacion | Q4_0 unicamente (GGUF); el adaptador se entrena y exporta sobre la rejilla Q4_0 del modelo base (1.835.532.288 niveles Q4_0 en total) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (según la model card, heredada de la licencia de Gemma 4 de Google DeepMind) |
| Formato de pesos | GGUF (llama.cpp); repo de 2,6 GB |

## Arquitectura y entrenamiento
No se detalla la arquitectura del modelo base en la informacion disponible; el autor solo indica que parte de `xbill9/gemma-4-E2B-it-qat-q4_0-exact-gguf`, un GGUF Q4_0 con cuantizacion consciente del entrenamiento (QAT), y que el modelo es solo texto. La innovacion del build no esta en la arquitectura, sino en el procedimiento de ajuste: se generaron 4 muestras por cada uno de 1.000 problemas de entrenamiento de GSM8K (seed 0, T=1,0, top_p 0,95, top_k 64) con el razonamiento limitado a 64 tokens mediante el presupuesto de razonamiento de llama.cpp. De las 4.000 muestras, 3.495 eran correctas; el codigo conservo, por problema, la muestra correcta mas corta: 943 problemas con una media de 376,1 tokens generados (939 de ellas caben en la longitud de entrenamiento de 2.048). Los conjuntos de entrenamiento y test son disjuntos.

El entrenamiento uso LoRA de rango 16 y alpha 32 sobre las proyecciones q/k/v/o/gate/up/down, con lr 1e-3, batch 8 y 2 epocas (236 pasos), durante 1 h 44 min en una RTX 3050 OEM con un pico de 4.895 MiB. La particularidad tecnica es que la pasada forward se ejecuta a traves de los pesos Q4_0 exactos del GGUF base (fake-quant del peso mas el delta de LoRA, con gradiente straight-through), de forma que el adaptador aprende para los pesos de 4 bits que se distribuyen. En la exportacion, los pesos entrenados se redondearon de nuevo sobre la rejilla Q4_0 de cada bloque y se escribieron en una copia del GGUF base: cambiaron 175.425.067 de 1.835.532.288 niveles Q4_0 (aproximadamente el 9,6%). Metadatos, tokenizer y plantilla de chat no se modificaron.

## Capacidades
- Generacion de texto conversacional en formato chat, con plantilla de chat sin modificar respecto al modelo base.
- Modo de razonamiento (thinking) activado por defecto; la traza se devuelve en `reasoning_content` y la respuesta final en `content`.
- Razonamiento matematico de tipo aritmetico elemental, medido sobre el conjunto de test completo de GSM8K (1.319 problemas).
- Respuestas con trazas de razonamiento cortas: el ajuste esta orientado a producir la respuesta correcta con el minimo de tokens, no a explorar razonamientos largos.
- Compatible con endpoints (tag `endpoints_compatible`) y con el ecosistema llama.cpp (`--jinja`, `-fa 1`, `-ngl`).
- Solo texto: no hay soporte de vision ni de audio en este build.
- Soporte de tool calling y de agentes multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el autor no documenta idiomas y las evaluaciones son en ingles (GSM8K).

## Casos de uso
- Evaluacion de eficiencia de razonamiento: usar el modelo como referencia para medir el ahorro de tokens en tareas aritmeticas frente al Gemma 4 E2B-it base con y sin `thinking_budget_tokens`, ya que el autor publica los logs y el script de comparacion.
- Despliegue en hardware muy limitado: al ocupar 2,6 GB en Q4_0 y haberse entrenado en una RTX 3050 OEM de 8 GB, sirve para prototipos de generacion de texto en GPUs de gama baja o en CPU con llama.cpp.
- Clasificacion y resolucion de problemas verbales de matematicas en pipelines internos, con la traza de razonamiento separada de la respuesta para facilitar el parseo automatico.
- Generacion de datos sinteticos de razonamiento corto: las salidas con thinking truncado sirven para construir pares pregunta-cotizacion breve en dominios aritmeticos.
- Base para experimentos de destilacion sobre pesos cuantizados: el procedimiento (fake-quant mas LoRA mas re-rounding a Q4_0) es reutilizable para otros dominios distintos de GSM8K.
- Asistente conversacional de bajo coste en entornos con presupuesto de latencia y tokens ajustado, donde interesa una unica pasada de razonamiento breve antes de responder.
- Reproducibilidad y auditoria de benchmarks: el SHA-256 publicado y los directorios de ejecucion permiten replicar la comparativa en el mismo hardware.

## Benchmarks y rendimiento
Resultados sobre los 1.319 problemas del test de GSM8K, decodificacion greedy, thinking activado, `max_tokens` 4096, llama.cpp `b11696-3-g7182ef71e` sobre RTX 3050 OEM (8 GB), correccion evaluada por codigo:

| Modelo | Limite de thinking | Aciertos | Tokens por respuesta correcta |
|---|---|---|---|
| GGUF base | sin limite | 1.187 | 994,9 |
| GGUF base | `thinking_budget_tokens` 512 | 1.185 | 855,9 |
| GGUF base | 256 | 1.171 | 648,9 |
| GGUF base | 128 | 1.166 | 544,2 |
| GGUF base | 64 | 1.117 | 580,9 |
| Este GGUF | sin limite | 1.175 | 454,0 |

Comparaciones estadisticas reportadas por el autor: frente al base sin limite, este build usa un 54,4% menos de tokens por respuesta correcta con 12 aciertos menos (50 problemas solo los acierta este modelo, 62 solo el base; McNemar exacto p = 0,299, indistinguible del ruido con 1.319 problemas). Frente al base con limite de 128 (la mejor configuracion sin entrenamiento), obtiene 9 aciertos mas con un 16,6% menos de tokens. El limite de 64 sobre el base cuesta 70 problemas respecto a sin limite, y el entrenamiento recupera 58 de ellos (p = 2,1e-05).

La misma receta con limites de 128, 256 y 512 dio 1.161, 1.170 y 1.179 aciertos con 492,2, 610,2 y 764,3 tokens por respuesta correcta respectivamente; la precision no cae de forma monotona al apretar el limite. Cada modelo es una unica ejecucion de entrenamiento con una sola semilla. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 2,6 GB solo de pesos en Q4_0, mas la cache KV; con el contexto de 8.192 tokens usado por el autor el consumo total es de unos pocos gigabytes, aunque la cifra exacta no se documenta.
- GPU recomendadas: cualquier GPU con 6-8 GB o mas; el autor validó el modelo con llama.cpp CUDA en una RTX 3050 OEM de 8 GB. Para mayor throughput, GPU de clase A100/H100 no aportan ventaja a este tamano, pero permiten contextos y lotes mayores.
- Cabe en GPU de consumo: si, en tarjetas de 6-8 GB (RTX 3050, RTX 3060, RTX 4060, etc.); tambien es viable en CPU con `-ngl 0` a costa de latencia.
- Opciones de despliegue: llama.cpp (`llama-server` o `llama-cli`) es la via documentada, con el comando `llama-server -m gemma-4-E2B-it-lazy-capped64-q4_0.gguf -ngl 99 -fa 1 -c 8192 --jinja`. Al ser un GGUF Q4_0, encaja en Ollama y otros frontends basados en llama.cpp; vLLM o TGI no estan documentados para este artefacto.
- Latencia y throughput: no disponibles. Como referencia de coste, el entrenamiento LoRA consumio 1 h 44 min en una RTX 3050 OEM con pico de 4.895 MiB, pero no se publican metricas de inferencia (tokens/s).

## Comparativa con modelos similares
La informacion disponible solo permite comparar contra el modelo base y las variantes de la misma receta; no se aportan datos de otros modelos de la misma categoria.

| Modelo | Parametros | Contexto | GSM8K (aciertos / 1.319) | Tokens por acierto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este GGUF (lazy-capped64) | 4.628.569.635 | no disponible (ejecutado a 8.192) | 1.175 | 454,0 | apache-2.0 | publico en HuggingFace |
| Base `xbill9/gemma-4-E2B-it-qat-q4_0-exact-gguf` sin limite | no disponible en la informacion | no disponible | 1.187 | 994,9 | apache-2.0 | publico en HuggingFace |
| Base con limite 128 | idem | idem | 1.166 | 544,2 | apache-2.0 | mismo artefacto, flag de runtime |
| Receta con limite 256 | no disponible | no disponible | 1.170 | 610,2 | apache-2.0 | no disponible como artefacto publicado |
| Receta con limite 512 | no disponible | no disponible | 1.179 | 764,3 | apache-2.0 | no disponible como artefacto publicado |

## Limitaciones y advertencias
- Entrenado y medido exclusivamente sobre GSM8K; el autor advierte que no se evaluaron otras tareas, por lo que el comportamiento en codigo, redaccion o dialogo general puede degradarse respecto al base.
- Solo texto. No hay vision ni audio, y no se documenta soporte multilingue ni calidad fuera del ingles.
- Build no oficial y experimental: no esta afiliado ni respaldado por Google; los problemas deben reportarse en el repositorio de GitHub del autor, no a Google.
- Cada variante es una unica ejecucion de entrenamiento con una sola semilla, y la comparacion principal no alcanza significacion estadistica (p = 0,299 frente al base sin limite); las diferencias de aciertos deben tratarse como dentro del ruido.
- El ajuste reduce el numero de aciertos absoluto (1.175 frente a 1.187); el beneficio es de eficiencia, no de precision.
- Riesgo de alucinacion: no evaluado en la informacion; el modelo hereda el del base y el ajuste sobre respuestas cortas podria favorecer cierres prematuros del razonamiento.
- La licencia declarada es Apache 2.0, pero la model card enlaza a la licencia especifica de Gemma 4 (`https://ai.google.dev/gemma/docs/gemma_4_license`); conviene revisar los terminos aplicables antes de un uso comercial.
- Idiomas soportados no documentados: no hay garantia de comportamiento en castellano.
- No hay datos publicados de latencia, throughput ni consumo de VRAM en inferencia, lo que dificulta el dimensionamiento en produccion.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/xbill9/gemma-4-E2B-it-lazy-capped64-q4_0-gguf
- Modelo base: https://huggingface.co/xbill9/gemma-4-E2B-it-qat-q4_0-exact-gguf
- Repositorio del proyecto lazy-gemma: https://github.com/xbill9/lazy-gemma
- Ejecuciones de benchmark con el base: https://github.com/xbill9/lazy-gemma/tree/main/benchmarks/runs/2026-10-22-rest-e2b-3050oem
- Ejecuciones de benchmark con el LoRA a 64 tokens: https://github.com/xbill9/lazy-gemma/tree/main/benchmarks/runs/2026-10-23-qatlora-capped64-e2b-3050oem
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Dataset de entrenamiento GSM8K: `openai/grade-school-math`
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente sitios sin relacion con el proyecto.
