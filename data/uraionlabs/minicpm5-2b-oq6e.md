# UraionLabs/MiniCPM5-2B-oQ6e

## Resumen

MiniCPM5-2B-oQ6e es una cuantizacion de precision mixta en formato MLX del modelo OpenBMB/MiniCPM5-2B, publicada por Uraion Labs. Se trata de un modelo denso de 2.516.756.480 parametros totales (1.981.982.720 parametros no de embedding) con arquitectura LlamaForCausalLM de 42 capas y atencion con Grouped-Query Attention (16 cabezas de consulta y 2 cabezas de clave/valor, dimension de cabeza 128). El problema que resuelve es el de ejecutar un modelo conversacional de 2B con ventana de contexto nativa de 131.072 tokens directamente en Macs con Apple Silicon, sin GPU dedicada y con un fichero de pesos de solo 1,95 GB.

La relevancia de esta variante concreta esta en su esquema de cuantizacion: no aplica una precision uniforme, sino que preserva 28 capas sensibles (proyecciones tempranas de self-attention y de MLP) a 8 bits mientras mantiene el resto de la red a 6 bits, con un resultado de aproximadamente 6,3 bits efectivos por peso. El resultado es un checkpoint que ocupa un 22 por ciento menos que la variante uniforme de 8 bits (oQ8e, 2,49 GB) manteniendo intactas las capas que mas degradan la calidad al cuantizarse.

El modelo base pertenece a la serie MiniCPM5 de OpenBMB y esta orientado a tool calling, generacion de codigo, razonamiento y flujos agenticos, con soporte declarado de ingles y chino. La licencia Apache-2.0 cubre tanto el modelo base como esta cuantizacion, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (`llama`), transformer denso con Grouped-Query Attention (16 Q heads / 2 KV heads, head dim 128) |
| Parametros totales | 2.516.756.480 (~2,52B) |
| Parametros no de embedding | 1.981.982.720 (~1,98B) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | oQ6e: mixta 6/8 bits (28 capas a 8 bits, `lm_head` a 6 bits, grupo 64, modo affine, ~6,3 bits efectivos por peso). Familia completa: oQ8e, oQ6e, oQ5e, oQ4e, oQ3.5e, oQ3e, oQ2.7e, oQ2e |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors |
| Capas | 42 |
| Precision base de pesos | 6 bits, con 28 capas de proyeccion sensibles a 8 bits |
| Precision de tensores no cuantizados | BF16 (pesos de LayerNorm, escalas y sesgos de embedding) |
| Modo de cuantizacion | Affine (escala y sesgo por grupo), tamano de grupo 64 |
| Dataset de calibracion | `oqe_code_multilingual` (294 muestras) |
| Tamano del fichero de pesos | 1,95 GB (1.995,44 MB) |
| Tamano del repositorio | 2,1 GB |
| Runtime objetivo | macOS sobre Apple Silicon (`omlx`, `mlx-lm`) |
| Libreria | mlx |
| Modelo base | openbmb/MiniCPM5-2B |
| Relacion con el modelo base | quantized |
| Pipeline | text-generation |
| Fecha de publicacion | 10 de septiembre de 2026 (ultima actualizacion: 10 de septiembre de 2026) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estandar de tipo LLaMA, con 42 capas y atencion GQA de 16 cabezas de consulta frente a 2 cabezas de clave/valor de dimension 128. Esta configuracion de atencion reduce de forma notable el tamano de la cache KV respecto a atencion multi-cabeza completa, lo que es determinante para sostener la ventana de 131.072 tokens: la cache KV en BF16 ocupa aproximadamente 84 KiB por token, es decir, unos 10,5 GiB para llenar el contexto completo. Al usar la arquitectura estandar, el modelo se ejecuta sin adaptaciones en los runtimes de inferencia que ya soportan el grafo `llama`.

El modelo base fue entrenado por OpenBMB con el curriculo de datos UltraData, que segun la model card incluye los corpus Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3, UltraData-Math, UltraData-Code, UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609. La presencia de conjuntos especificos de SFT y de RL indica que el base incorpora fases de ajuste supervisado y de aprendizaje por refuerzo, con enfasis declarado en agentes, llamada a funciones y asistencia de codigo. No se especifican en la informacion disponible el numero total de tokens de entrenamiento ni la composicion porcentual del dataset.

La aportacion de Uraion Labs es exclusivamente de cuantizacion. El flujo oMLX oQe asigna precision mediante una matriz de importancia que mide la sensibilidad de cada capa, y como resultado conserva 28 capas de proyeccion a 8 bits (las proyecciones tempranas de self-attention y de MLP) mientras el resto de la red, incluida la cabeza de salida `lm_head`, queda a 6 bits. La calibracion se realizo con 294 muestras de un dataset de codigo multilingue, y los tensores no cuantizables (LayerNorm, escalas y sesgos de embedding) se mantienen en BF16.

## Capacidades

- Generacion de texto conversacional multi-turno con ventana nativa de 131.072 tokens.
- Razonamiento y resolucion de problemas, con etiquetas declaradas de `reasoning` en la model card.
- Generacion y asistencia de codigo, incluyendo razonamiento sobre repositorios completos gracias al contexto largo.
- Tool calling y function calling, con generacion de salida estructurada orientada a integracion con APIs.
- Flujos agenticos y razonamiento multi-paso (etiquetas `agent`, `agentic` en la model card).
- Soporte multilingue limitado a ingles y chino.
- Capacidad de ejecucion en dispositivo (on-device / edge) en Macs con Apple Silicon mediante MLX.
- No se declaran capacidades de vision, audio ni modo de pensamiento explicito en la informacion disponible.

## Casos de uso

- Asistente de codigo local en macOS: el modelo puede integrarse como backend de un editor en un Mac con Apple Silicon y analizar ficheros completos o repositorios medianos, ya que sus 131.072 tokens de contexto permiten incluir varios modulos sin trocear. El fichero de 1,95 GB evita depender de servicios en la nube.
- Atencion al cliente automatizada: gestiona conversaciones multi-turno con historial extenso y puede emitir respuestas en formato estructurado para conectarlas a un CRM mediante function calling, sin que el historial se trunque a corto plazo.
- Agentes de automatizacion de tareas: sus capacidades declaradas de agent y function calling permiten construir bucles de razonamiento multi-paso que invocan herramientas externas (busqueda, calculo, acceso a ficheros) y encadenan resultados.
- Procesamiento de documentacion tecnica en local: al soportar 131.072 tokens y estar calibrado sobre un dataset de codigo multilingue, es adecuado para resumir, extraer y responder preguntas sobre manuales o especificaciones extensas sin salida de datos del equipo.
- Prototipado y evaluacion rapida en investigacion: su tamano reducido y su licencia Apache-2.0 permiten desplegarlo en un portatil para experimentar con prompts, comparar variantes de cuantizacion de la misma familia y medir el impacto de la precision en la calidad.
- Generacion de codigo en pipelines de CI/CD: puede utilizarse como revisor automatizado de diffs o generador de tests en un runner macOS, invocando herramientas del repositorio mediante tool calling.
- Asistencia en escritura tecnica bilingue ingles-chino: util para equipos que necesitan traduccion y adaptacion de documentacion entre ambos idiomas manteniendo coherencia terminologica en textos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes para esta cuantizacion, y la busqueda web realizada no devolvio resultados relevantes sobre el modelo (los resultados obtenidos correspondian a contenidos sin relacion).

El unico dato de rendimiento declarado es agregado y corresponde al modelo base OpenBMB/MiniCPM5-2B: una media de 53,9 en el conjunto de evaluacion propio de OpenBMB, presentada por el autor como competitiva frente a modelos de clase 3B y 4B. No se desglosa por tarea y no hay medicion publicada del impacto de la cuantizacion oQ6e sobre esa cifra.

## Requisitos de hardware

- Memoria unificada minima: el fichero de pesos ocupa 1,95 GB. Con la sobrecarga del runtime MLX, la inferencia con contextos cortos es viable en Macs con 8 GB de memoria unificada.
- Cache KV: en BF16 y sin cuantizar, ocupa aproximadamente 84 KiB por token (2 capas KV x 128 de dimension x 42 capas x 2 bytes). Estimaciones calculadas: ~0,66 GiB a 8.192 tokens, ~2,6 GiB a 32.768 tokens y ~10,5 GiB a los 131.072 tokens completos.
- Recomendacion de memoria: 8 GB para contextos cortos, 16 GB para contextos de decenas de miles de tokens y 32 GB o mas para explotar los 131.072 tokens sin truncar.
- GPU compatibles: el formato MLX esta disenado para Apple Silicon (familia M). No es ejecutable en GPU NVIDIA o AMD a traves de MLX; para CUDA habria que recurrir al modelo base openbmb/MiniCPM5-2B en BF16 con otro runtime.
- Cabe en GPU de consumo: si, en el sentido de que cabe en un Mac con chip M-series de gama base. En GPU de consumo NVIDIA (RTX 4090, etc.) este artefacto concreto no es desplegable por formato.
- Opciones de despliegue: oMLX (https://github.com/jundot/omlx) y mlx-lm (https://github.com/ml-explore/mlx-examples/tree/main/llms/mlx_lm), ambos declarados compatibles. Otros runtimes no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No hay datos de benchmarks ni comparativas con otras familias publicados en la informacion disponible. La comparacion verificable es dentro de la propia familia de cuantizaciones del mismo modelo base, que comparten arquitectura, contexto y licencia:

| Variante | Bits base | Perfil de precision mixta | `lm_head` | Tamano | Repositorio |
|---|---|---|---|---|---|
| oQ8e | 8 bits | Uniforme 8 bits | 8 bits | 2,49 GB | UraionLabs/MiniCPM5-2B-oQ8e |
| oQ6e | 6 bits | Mixta 6/8 bits (28 capas a 8 bits) | 6 bits | 1,95 GB | UraionLabs/MiniCPM5-2B-oQ6e |
| oQ5e | 5 bits | Mixta 5/6/8 bits (19 a 6 bits, 6 a 8 bits) | 6 bits | 1,67 GB | UraionLabs/MiniCPM5-2B-oQ5e |
| oQ4e | 4 bits | Mixta 4/5/6 bits (58 a 5 bits, 9 a 6 bits) | 4 bits | 1,38 GB | UraionLabs/MiniCPM5-2B-oQ4e |
| oQ3.5e | 3 bits | Mixta 3/5/6 bits (29 a 5 bits, 7 a 6 bits) | 6 bits | 1,17 GB | UraionLabs/MiniCPM5-2B-oQ3.5e |
| oQ3e | 3 bits | Mixta 3/5/6 bits (31 a 5 bits, 7 a 6 bits) | 3 bits | 1,08 GB | UraionLabs/MiniCPM5-2B-oQ3e |
| oQ2.7e | 2 bits | Mixta 2/5/6/8 bits (23 a 5 bits, 8 a 6 bits, `lm_head` a 8 bits) | 8 bits | 0,98 GB | UraionLabs/MiniCPM5-2B-oQ2.7e |
| oQ2e | 2 bits | Mixta 2/5/6 bits (10 a 5 bits, 6 a 6 bits) | 6 bits | 0,88 GB | UraionLabs/MiniCPM5-2B-oQ2e |

Frente al modelo base en BF16 (openbmb/MiniCPM5-2B), esta variante reduce el peso en disco a menos de la mitad, mantiene los 131.072 tokens de contexto y la licencia Apache-2.0, y limita la perdida de calidad a las 28 capas que el flujo oQe considera sensibles. No hay datos publicados que cuantifiquen esa perdida.

## Limitaciones y advertencias

- No existen benchmarks publicados de esta cuantizacion. El impacto real de la precision mixta 6/8 bits sobre la calidad no esta medido en la informacion disponible.
- El dataset de calibracion (`oqe_code_multilingual`, 294 muestras) esta sesgado hacia codigo; el comportamiento en dominios muy alejados del codigo (prosa literaria, derecho, medicina) puede desviarse mas de lo que reflejaria una calibracion generalista.
- Idiomas: solo ingles y chino estan declarados. El rendimiento en castellano no esta evaluado ni garantizado.
- Riesgo de alucinacion: inherente a los modelos de 2B, que tienden a inventar hechos y referencias con mas frecuencia que modelos mayores. No se documentan medidas de mitigacion especificas.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible. Los sesgos de los corpus de entrenamiento se heredan sin cuantificar.
- Contexto: los 131.072 tokens son nominales. Sostenerlos exige aproximadamente 10,5 GiB adicionales de cache KV en BF16, por lo que en equipos de 8 o 16 GB el contexto util real sera mucho menor.
- Portabilidad: el checkpoint es MLX safetensors y solo funciona en Apple Silicon a traves de oMLX o mlx-lm. No es utilizable en servidores con GPU NVIDIA sin conversion previa a otro formato, que no se proporciona.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero se debe conservar el aviso de licencia y de atribucion correspondiente. No se imponen restricciones adicionales declaradas por el autor de la cuantizacion.
- El numero de descargas y likes del repositorio es 0 en el momento de la consulta, por lo que no existe validacion de la comunidad sobre este artefacto concreto.
- Efecto de `lm_head` a 6 bits: al ser la cabeza de salida la que proyecta sobre el vocabulario, una precision inferior a la de las capas preservadas puede afectar a la diversidad y a la calibracion de las probabilidades generadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ6e
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Runtime oMLX: https://github.com/jundot/omlx
- Runtime mlx-lm: https://github.com/ml-explore/mlx-examples/tree/main/llms/mlx_lm
- Variante oQ8e: https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ8e
- Variante oQ5e: https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ5e
- Variante oQ4e: https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ4e
- Variante oQ3.5e: https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ3.5e
- Variante oQ3e: https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ3e
- Variante oQ2.7e: https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ2.7e
- Variante oQ2e: https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ2e
- Sitio del autor de la cuantizacion: https://uraionlabs.com
- Articulo referenciado en las etiquetas (arxiv:2506.07900): https://arxiv.org/abs/2506.07900
- Articulo referenciado en las etiquetas (arxiv:2602.09003): https://arxiv.org/abs/2602.09003
