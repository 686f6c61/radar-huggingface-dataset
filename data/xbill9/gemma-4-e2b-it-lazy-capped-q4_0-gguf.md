# xbill9/gemma-4-E2B-it-lazy-capped-q4_0-gguf

## Resumen

Este repositorio contiene un GGUF Q4_0 de Gemma 4 E2B-it modificado mediante un ajuste fino con LoRA para que el modelo cierre su bloque de razonamiento (thinking) en torno a 256 tokens. Lo publica el usuario independiente xbill9 el 22 de octubre de 2026 como parte del proyecto lazy-gemma (entrada de la semana 3 de Hacktoberfest 2026), y no esta afiliado ni respaldado por Google. El punto de partida es `xbill9/gemma-4-E2B-it-qat-q4_0-exact-gguf`, un GGUF Q4_0 con cuantizacion consciente del entrenamiento (QAT) derivado de Gemma 4 E2B-it de Google DeepMind.

El problema que aborda es el coste en tokens del modo de razonamiento: el modelo base, con thinking activado y sin limite, necesita 994,9 tokens por respuesta correcta en GSM8K, mientras que esta version resuelve practicamente lo mismo (1.170 frente a 1.187 aciertos de 1.319) con 610,2 tokens por acierto, un 38,7% menos. Frente al modelo base limitado con el parametro `thinking_budget_tokens` de llama.cpp a 256, iguala la precision (1.170 frente a 1.171, McNemar exacto p = 1.000) gastando un 6,0% menos de tokens y sin necesidad de configurar ningun limite externo.

El modelo tiene 4.628.569.635 parametros y se distribuye unicamente en formato GGUF Q4_0 (repo de 2,6 GB), pensado para `llama-server` en GPU de consumo. Es un artefacto experimental de investigacion: solo se ha evaluado en GSM8K, es text-only y no cuenta con validacion de la comunidad (39 descargas y 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 4 (Google DeepMind); numero de capas, tipo de atencion y detalles internos no disponibles |
| Parametros totales | 4.628.569.635 (aprox. 4,63 mil millones) |
| Parametros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible (el ejemplo de ejecucion de llama.cpp usa `-c 8192`) |
| Tipos de cuantizacion | Q4_0 exclusivamente (GGUF); el adaptador LoRA se entreno y se exporto sobre la misma rejilla Q4_0 del modelo base |
| Idiomas soportados | No disponible (la model card solo indica text-only) |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google: https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | GGUF (Q4_0, cuantizacion por bloques); tokenizer y chat template sin modificar respecto al base |
| Hash SHA-256 | `a2527137e332e9b80acee264dcc3aa596c2bd8cc16bfd8ed592ba99fd49f97db` |
| Tamano del repo | 2,6 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de Gemma 4 E2B-it (numero de capas, dimensiones, esquema de atencion ni contexto nativo de entrenamiento). Lo que si se especifica es el proceso de ajuste: se parte del GGUF Q4_0 exacto del modelo base, con cuantizacion QAT, y se aplica un LoRA de rango 16 y alpha 32 sobre las proyecciones q/k/v/o/gate/up/down, con learning rate 1e-3, batch de 8 y 2 epocas (234 pasos). El entrenamiento se ejecuto en 1 hora y 54 minutos sobre una RTX 3050 OEM, con un pico de 4.880 MiB de VRAM. El paso forward se realiza a traves de los pesos Q4_0 exactos del GGUF base (cuantizacion simulada del peso mas el delta del LoRA, con gradiente straight-through), de modo que el adaptador aprende para los pesos de 4 bits que se distribuyen realmente.

Los datos de entrenamiento son 4 muestras por cada uno de los 1.000 problemas de entrenamiento de GSM8K (seed 0, T=1.0, top_p 0.95, top_k 64), generadas con el thinking limitado a 256 tokens mediante el reasoning budget de llama.cpp. De las 4.000 muestras, 3.458 eran correctas; el codigo conservo, por problema, la muestra correcta mas corta: 932 problemas con una media de 516,2 tokens generados. Los conjuntos de entrenamiento y test son disjuntos. En la exportacion, los pesos entrenados se redondearon de nuevo a la rejilla Q4_0 de cada bloque y se escribieron en una copia del GGUF base: cambiaron 172.302.863 de 1.835.532.288 niveles Q4_0. La innovacion principal no es arquitectonica sino de control del presupuesto de razonamiento: el modelo internaliza el corte del bloque de thinking, de forma que no depende de un parametro externo del servidor de inferencia.

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla de chat heredada del modelo base (`--jinja` en llama.cpp).
- Razonamiento con modo thinking activado por defecto: la traza de razonamiento se devuelve en el campo `reasoning_content` y la respuesta final en `content`.
- Autolimitacion del razonamiento a aproximadamente 256 tokens, aprendida en los pesos en lugar de impuesta por el servidor.
- Resolucion de problemas aritmeticos de nivel escolar (GSM8K), unica tarea evaluada por el autor.
- Inferencia text-only: no se declaran capacidades de vision, audio ni multimodalidad.
- Compatible con endpoints (`endpoints_compatible` en los tags del repo) y con el ecosistema llama.cpp.
- Soporte de tool calling / function calling y de agentes multi-paso: no disponible en la informacion proporcionada (no se ha verificado).
- Capacidades multilingues: no disponibles; no se especifica que idiomas cubre ni como afecta el ajuste a idiomas distintos del ingles.

## Casos de uso

- Tutoria de matematicas de primaria y secundaria en local: el modelo resuelve problemas tipo GSM8K mostrando la traza de razonamiento en `reasoning_content`, lo que permite al estudiante o al profesor revisar el procedimiento y no solo la respuesta.
- Despliegue en hardware de gama baja: con pesos Q4_0 de unos 2,5 GB, se puede servir en una unica GPU de consumo de 8 GB (el autor lo probo en una RTX 3050 OEM), lo que habilita prototipos de razonamiento sin acceso a la nube.
- Control de coste en pipelines de razonamiento: al reducir un 38,7% los tokens por respuesta correcta frente al base sin limite, baja el coste por consulta en servicios que facturan por token y reduce la presion sobre el KV cache.
- Generacion y filtrado de cadenas de razonamiento para datasets sinteticos: el modelo produce trazas cortas y consistentes, utiles como semillas o como etiquetas en la destilacion de modelos menores.
- Evaluacion comparativa de metodos de control de pensamiento: sirve como referencia empirica para estudiar si conviene limitar el razonamiento por entrenamiento (este GGUF) o por configuracion del servidor (`thinking_budget_tokens`), con logs y scripts reproducibles en el repositorio GitHub.
- Asistente offline en entornos sin conectividad (aulas, laboratorios o equipos aislados) donde se necesita aritmetica verificable y no se puede depender de una API externa.
- Docencia y formacion en cuantizacion: el repositorio documenta el flujo completo de QAT, LoRA sobre pesos cuantizados y re-redondeo a la rejilla Q4_0, por lo que es un caso practico para explicar estas tecnicas.

## Benchmarks y rendimiento

Los unicos datos publicados son de GSM8K completo (1.319 problemas de test), decodificacion greedy, thinking activado, `max_tokens` 4096, llama.cpp `b11696-3-g7182ef71e` sobre una RTX 3050 OEM de 8 GB. La correccion se evaluo por codigo y los tokens incluyen el bloque de thinking, contados por el servidor con el tokenizer del modelo.

| Modelo | Cap de thinking | Aciertos (de 1.319) | Tokens por respuesta correcta |
|---|---|---|---|
| GGUF base | ninguno | 1.187 | 994,9 |
| GGUF base | `thinking_budget_tokens` 256 | 1.171 | 648,9 |
| Este GGUF | ninguno | 1.170 | 610,2 |
| `lazy-capped64-q4_0-gguf` (modelo mas nuevo) | ninguno | 1.175 | 454,0 |

Detalles de la comparacion: frente al base con cap de 256, este modelo obtiene 1.170 aciertos frente a 1.171 (51 problemas que solo acierta este modelo, 52 que solo acierta el base con cap; McNemar exacto p = 1.000) con un 6,0% menos de tokens por acierto y sin cap configurado. Frente al base sin cap, obtiene 17 aciertos menos (p = 0.100) con un 38,7% menos de tokens. Anadir el cap de 256 a este modelo apenas cambia el resultado: en los primeros 250 problemas, 603,0 tokens por acierto con cap frente a 602,6 sin cap. Los resultados de MMLU, HumanEval, razonamiento general o tareas multilingues no estan disponibles.

## Requisitos de hardware

- VRAM de inferencia estimada: alrededor de 2,5-3 GB solo para pesos Q4_0 (repo de 2,6 GB); hay que sumar el KV cache correspondiente a la longitud de contexto configurada, cuyo coste exacto no se detalla en la informacion disponible.
- Cabe en GPU de consumo: el autor ejecuta y entrena en una RTX 3050 OEM de 8 GB; con `-ngl 99 -fa 1 -c 8192` se usan 8.192 tokens de contexto. Para 4.096-8.192 tokens de contexto, 6-8 GB de VRAM es un objetivo razonable, aunque no se publican mediciones de VRAM de inferencia (el dato de 4.880 MiB de pico corresponde al entrenamiento LoRA, no al serving).
- GPU recomendadas: RTX 3050 OEM 8 GB (verificado por el autor), RTX 3060/4060/4070 y superiores, L4, A10, A100 y H100 sin problema de capacidad, aunque en estas ultimas el modelo queda limitado por latencia y no por memoria.
- Despliegue: llama.cpp (`llama-server`) es la via soportada y probada, con la linea `llama-server -m gemma-4-E2B-it-lazy-capped-q4_0.gguf -ngl 99 -fa 1 -c 8192 --jinja`. Otros runners compatibles con GGUF (Ollama, llama-cpp-python, LM Studio) son plausibles al conservar tokenizer y chat template, pero no estan verificados en la informacion disponible. vLLM o TGI no se mencionan ni se han probado con este artefacto.
- Latencia y throughput: no disponibles. El unico dato de coste es tokens por respuesta correcta en GSM8K (610,2), no tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K (aciertos / 1.319) | Tokens por acierto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (`lazy-capped-q4_0-gguf`) | 4,63 B | no disponible | 1.170 | 610,2 | Apache 2.0 | GGUF Q4_0, 39 descargas |
| Base `gemma-4-E2B-it-qat-q4_0-exact-gguf` sin cap | no disponible en la informacion | no disponible | 1.187 | 994,9 | Apache 2.0 | GGUF Q4_0 |
| Base con `thinking_budget_tokens` 256 | no disponible en la informacion | no disponible | 1.171 | 648,9 | Apache 2.0 | GGUF Q4_0 + flag del servidor |
| `gemma-4-E2B-it-lazy-capped64-q4_0-gguf` | no disponible en la informacion | no disponible | 1.175 | 454,0 | Apache 2.0 | GGUF Q4_0, version mas reciente del mismo autor |

La comparacion relevante es interna a la familia: el modelo base sin cap es mas preciso (+17 aciertos, p = 0.100) pero mucho mas caro en tokens; el base con cap externo iguala en precision pero gasta mas tokens y requiere configuracion; la variante capped64 del mismo autor mejora en ambas dimensiones (mas aciertos y 454,0 tokens por acierto) y es la opcion recomendada por el propio autor. No se dispone de comparaciones con modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto no oficial y experimental: no esta afiliado ni respaldado por Google; los problemas deben reportarse en el repositorio de GitHub del autor, no a Google DeepMind.
- Evaluacion limitada a GSM8K: no se han medido otras tareas (codigo, conocimiento general, multilingue, tool calling), por lo que no hay evidencia de que el ajuste no degrade capacidades fuera del dominio matematico.
- Ligeramente menos preciso que el base sin cap (1.170 frente a 1.187 aciertos, p = 0.100): el ahorro de tokens se paga con una pequena perdida de exactitud, dentro del ruido estadistico pero en direccion negativa.
- Text-only y probado unicamente con llama.cpp CUDA sobre una RTX 3050 OEM; no hay validacion en otras GPU, backends (ROCm, Metal, CPU) ni runners.
- Existe una version posterior del mismo autor (capped64) con mejores resultados; usar este repositorio como referencia puede suponer quedarse atras.
- Madurez muy baja: 39 descargas y 0 likes, sin validacion independiente de los resultados ni replicaciones publicas.
- Riesgo de alucinacion y de trazas de razonamiento plausibles pero incorrectas: aunque el modelo esta entrenado para cerrar el thinking antes, no se ha evaluado la fidelidad de sus cadenas de razonamiento.
- La cuantizacion Q4_0 introduce perdida de precision respecto a los pesos originales en BF16/FP16; el autor reporta que 172,3 millones de niveles Q4_0 cambiaron en la exportacion, sin analisis del error de cuantizacion por capa.
- Datos de entrenamiento derivados de GSM8K (licencia del dataset no detallada en la informacion disponible): conviene revisar las condiciones de `openai/grade-school-math` antes de un uso comercial.
- Licencia Apache 2.0 segun la model card, con enlace a la licencia de Gemma 4 de Google; se debe conservar la atribucion a Google DeepMind de los pesos base, tokenizer y chat template, y no sugerir respaldo de Google.
- El ajuste esta entrenado sobre problemas aritmeticos en ingles; el comportamiento en castellano u otros idiomas no esta documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xbill9/gemma-4-E2B-it-lazy-capped-q4_0-gguf
- Modelo base (GGUF Q4_0 QAT exacto): https://huggingface.co/xbill9/gemma-4-E2B-it-qat-q4_0-exact-gguf
- Version mas reciente del mismo autor (capped64): https://huggingface.co/xbill9/gemma-4-E2B-it-lazy-capped64-q4_0-gguf
- Repositorio del proyecto lazy-gemma: https://github.com/xbill9/lazy-gemma
- Logs y resultados de la ejecucion GSM8K (22-10-2026): https://github.com/xbill9/lazy-gemma/tree/main/benchmarks/runs/2026-10-22-rest-e2b-3050oem
- Logs del entrenamiento LoRA con cap (21-10-2026): https://github.com/xbill9/lazy-gemma/tree/main/benchmarks/runs/2026-10-21-qatlora-capped-e2b-3050oem
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Dataset GSM8K: https://huggingface.co/datasets/openai/grade-school-math

Nota: la busqueda web realizada no devolvio resultados tecnicos relacionados con este modelo (solo resultados no pertinentes), por lo que no se anaden mas enlaces.
