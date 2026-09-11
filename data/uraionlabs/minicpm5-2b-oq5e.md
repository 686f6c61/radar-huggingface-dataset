# UraionLabs/MiniCPM5-2B-oQ5e

## Resumen

MiniCPM5-2B-oQ5e es una cuantizacion en precision mixta del modelo openbmb/MiniCPM5-2B, publicada por Uraion Labs (UraionLabs) y orientada a inferencia local en Macs con Apple Silicon. El checkpoint se distribuye en formato MLX safetensors y es compatible directamente con los runtimes oMLX y mlx-lm. No es un modelo entrenado desde cero: es una variante de pesos del modelo base de OpenBMB, con licencia Apache-2.0.

El modelo base es un transformer denso de tipo LlamaForCausalLM con 42 capas y atencion GQA (16 cabezas de consulta y 2 de clave/valor, dimension de cabeza 128). Cuenta con 2.516.756.480 parametros totales (unos 2,52B) y 1.981.982.720 parametros no pertenecientes a embeddings (unos 1,98B), con una ventana de contexto nativa de 131.072 tokens. Esta orientado a generacion de texto, razonamiento, codigo, llamada a herramientas y flujos agenticos, con soporte declarado de ingles y chino.

La relevancia de esta ficha concreta esta en la cuantizacion: el checkpoint ocupa 1,67 GB (1.710,44 MB) gracias a un perfil mixto de 5/6/8 bits con 25 overrides de capa (19 capas elevadas a 6 bits, 6 a 8 bits y el lm_head conservado a 6 bits), lo que permite ejecutar un modelo de contexto 131k en equipos de consumo con memoria unificada, algo que la version en BF16 no facilita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer denso, `llama`), GQA con 16 cabezas Q y 2 cabezas KV, head dim 128, 42 capas |
| Parametros totales | 2.516.756.480 (~2,52B); parametros no de embedding: 1.981.982.720 (~1,98B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Checkpoint oQ5e: base de 5 bits con perfil mixto 5/6/8 bits (19 capas a 6 bits, 6 capas a 8 bits, lm_head a 6 bits), grupo 64, modo affine, ~5,4 bits efectivos por peso. La familia incluye oQ8e, oQ6e, oQ5e, oQ4e, oQ3.5e, oQ3e, oQ2.7e y oQ2e |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors; tensores no cuantizados en BF16 (pesos de LayerNorm, escalas y sesgos de embedding) |

Datos adicionales de la cuantizacion: conjunto de calibracion `oqe_code_multilingual` con 294 muestras; tamano del archivo de pesos 1,67 GB (1.710,44 MB); tamano del repositorio 1,8 GB.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base, un transformer decoder-only denso de tipo LlamaForCausalLM con 42 capas y atencion de consultas agrupadas (GQA) con 16 cabezas de consulta y solo 2 cabezas de clave/valor de dimension 128. Esa relacion 16:2 reduce de forma notable el tamano de la cache KV, lo que resulta determinante para sostener ventanas de 131.072 tokens. Al emplear una arquitectura LLaMA estandar, el modelo es ejecutable en runtimes de inferencia convencionales sin kernels personalizados.

El modelo base fue entrenado por OpenBMB con el curriculum de datos UltraData, que incluye Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3, UltraData-Math, UltraData-Code, UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609; estos dos ultimos apuntan a fases de ajuste supervisado orientado a agentes y de aprendizaje por refuerzo. No se dispone de datos concretos sobre el numero total de tokens de entrenamiento ni sobre la composicion porcentual del corpus. La innovacion tecnica de este checkpoint concreto no esta en el entrenamiento, sino en el flujo de cuantizacion oMLX oQe, que asigna precision por capas guiandose por una matriz de importancia (sensibilidad) en lugar de aplicar una cuantizacion uniforme: de ahi que el lm_head y determinadas capas queden en 6 u 8 bits mientras el grueso del modelo se mantiene en 5 bits.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento y resolucion de problemas de varios pasos.
- Generacion y asistencia sobre codigo, incluyendo razonamiento a escala de repositorio gracias al contexto de 131.072 tokens.
- Tool calling y function calling, con generacion de salida estructurada.
- Flujos agenticos: el modelo base fue ajustado con UltraData-SFT-Agent-2609, orientado a uso de herramientas.
- Procesamiento de documentos largos y sintesis de multiples documentos en una sola pasada.
- Conversaciones multi-turno extensas sin truncado prematuro del historial.
- No se declaran capacidades de vision, audio ni modo de pensamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Asistente de codigo local en macOS: con 1,67 GB de pesos, el modelo cabe en un Mac de memoria unificada y puede indexar y razonar sobre repositorios completos dentro de la ventana de 131k tokens, evitando enviar codigo propietario a servicios en la nube.
- Agente con tool calling en el escritorio: su ajuste sobre datos de agentes y su soporte de function calling permiten construir automatizaciones que invocan APIs, leen/escriben archivos y encadenan varios pasos sin salir del equipo.
- Atencion al cliente multilingue (en/zh): gestiona conversaciones multi-turno largas y mantiene el contexto de incidencias previas dentro de una unica ventana, util en mercados con clientela angloparlante y sinoparlante.
- Analisis de documentacion tecnica extensa: manuales, contratos o especificaciones de decenas de miles de tokens se pueden procesar en una sola pasada para extraer resumenes, tablas de obligaciones o respuestas concretas.
- Clasificacion y extraccion de datos estructurados: con salida estructurada, sirve para convertir texto libre en JSON validado en pipelines de ingestión de datos.
- Procesamiento por lotes en local sin coste por token: al ejecutarse sobre Apple Silicon con mlx-lm u oMLX, es viable para tareas nocturnas de resumen, etiquetado o traduccion en/zh sin facturacion por API.
- Prototipado y evaluacion de tecnicas de cuantizacion: la familia oQ (de oQ8e a oQ2e) permite comparar degradacion de calidad frente a tamano dentro de una misma arquitectura y calibracion.
- Copiloto offline en entornos con restricciones de red o de confidencialidad, donde el envio de datos a terceros no esta permitido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta cuantizacion no incluye tablas de MMLU, HumanEval, GSM8K ni equivalentes, y la busqueda web realizada no devolvio resultados relevantes sobre el modelo (unicamente paginas de soporte de Microsoft sin relacion con el tema).

El unico dato de rendimiento declarado es cualitativo y corresponde al modelo base, no a esta cuantizacion: OpenBMB reporta una media de 53,9 en su conjunto de evaluacion para MiniCPM5-2B, con un rendimiento que describe como competitivo frente a modelos de clase 3B y 4B. No se especifica la composicion de ese conjunto de evaluacion ni los resultados por tarea, por lo que no es posible desglosarlo.

## Requisitos de hardware

- VRAM/memoria unificada para pesos: 1,67 GB (1.710,44 MB) en esta variante oQ5e.
- Cache KV: no disponible como cifra oficial. Estimacion calculada a partir de la configuracion declarada (42 capas, 2 cabezas KV, head dim 128, BF16): ~86 KB por token, lo que equivaldria a ~11,3 GB con los 131.072 tokens completos. Esta cifra es una estimacion propia, no un dato publicado.
- Presupuesto total orientativo: en torno a 3-5 GB para contextos moderados (4k-16k tokens) y por encima de 13 GB si se agota la ventana de 131k con cache KV en BF16.
- Cabe en GPU de consumo: no aplica directamente, ya que el formato es MLX y esta pensado para memoria unificada de Apple Silicon. En Macs con 8 GB es viable con contextos cortos; 16 GB o mas es lo recomendable para aprovechar el contexto largo.
- GPU recomendadas: no disponibles para este formato. Al ser MLX, el destino es Apple Silicon (series M1/M2/M3/M4 y equivalentes); no se declaran GPUs NVIDIA como objetivo.
- Opciones de despliegue: oMLX (https://github.com/jundot/omlx) y mlx-lm (ml-explore). No se garantiza carga directa en llama.cpp, Ollama, vLLM o TGI, que no consumen pesos MLX sin conversion previa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Comparativa dentro de la propia familia de cuantizaciones publicada por Uraion Labs sobre el mismo modelo base (misma arquitectura de 42 capas, mismo contexto de 131.072 tokens y misma licencia Apache-2.0 en todos los casos):

| Variante | Bits base | Perfil mixto | lm_head | Tamano |
|---|---|---|---|---|
| oQ8e | 8 bits | Uniforme 8 bits | 8 bits | 2,49 GB |
| oQ6e | 6 bits | Mixto 6/8 bits (28 capas a 8 bits) | 6 bits | 1,95 GB |
| oQ5e | 5 bits | Mixto 5/6/8 bits (19 a 6b, 6 a 8b) | 6 bits | 1,67 GB |
| oQ4e | 4 bits | Mixto 4/5/6 bits (58 a 5b, 9 a 6b) | 4 bits | 1,38 GB |
| oQ3.5e | 3 bits | Mixto 3/5/6 bits (29 a 5b, 7 a 6b) | 6 bits | 1,17 GB |
| oQ3e | 3 bits | Mixto 3/5/6 bits (31 a 5b, 7 a 6b) | 3 bits | 1,08 GB |
| oQ2.7e | 2 bits | Mixto 2/5/6/8 bits (23 a 5b, 8 a 6b, lm_head a 8b) | 8 bits | 0,98 GB |
| oQ2e | 2 bits | Mixto 2/5/6 bits (10 a 5b, 6 a 6b) | 6 bits | 0,88 GB |

Comparativa con alternativas de otros autores: no disponible. La busqueda web no devolvio informacion sobre cuantizaciones equivalentes de MiniCPM5-2B (por ejemplo en GGUF) ni sobre resultados que permitan situar esta variante frente a otras. Tampoco hay datos publicados de calidad por variante dentro de la propia familia oQ, mas alla del reparto de bits.

## Limitaciones y advertencias

- No hay ningun benchmark publicado para esta cuantizacion: se desconoce la degradacion real de calidad respecto al modelo base en BF16 a 5,4 bits efectivos por peso.
- El perfil mixto 5/6/8 bits es una decision de calibracion heuristica (matriz de importancia) sobre 294 muestras de `oqe_code_multilingual`; el sesgo de ese conjunto de calibracion puede favorecer el rendimiento en codigo multilingue frente a otros dominios.
- Idiomas declarados unicamente ingles y chino. El rendimiento en castellano no esta verificado y no debe asumirse.
- Riesgo de alucinacion inherente a un modelo de ~2B parametros, especialmente en tareas de conocimiento factual y en contextos muy largos, donde la atencion sobre 131k tokens puede diluirse.
- La ventana de 131k es nativa, pero agotarla exige memoria para la cache KV (estimada en ~11,3 GB en BF16), lo que puede impedir su uso practico en equipos de 8 GB.
- Formato MLX: no es cargable directamente por runtimes fuera del ecosistema MLX, lo que limita el despliegue a macOS con Apple Silicon salvo conversion.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero se heredan las condiciones del modelo base openbmb/MiniCPM5-2B; conviene verificar la model card del upstream por si anade terminos adicionales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria ni evidencia de uso en produccion.
- El checkpoint esta fechado en septiembre de 2026 y su autor, Uraion Labs, no es el desarrollador original del modelo; la responsabilidad sobre la cuantizacion recae en el publicador de la variante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ5e
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Repositorio oMLX: https://github.com/jundot/omlx
- mlx-lm (MLX Examples, Apple): https://github.com/ml-explore/mlx-examples/tree/main/llms/mlx_lm
- Web de Uraion Labs: https://uraionlabs.com
- Variantes de la familia oQ: https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ8e, https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ6e, https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ4e, https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ3.5e, https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ3e, https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ2.7e, https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ2e
- Referencias arXiv citadas en las etiquetas del repositorio: https://arxiv.org/abs/2506.07900 y https://arxiv.org/abs/2602.09003 (los titulos no se incluyen en la informacion proporcionada)
- Conjuntos de datos de entrenamiento citados: https://huggingface.co/datasets/openbmb/Ultra-FineWeb, https://huggingface.co/datasets/openbmb/UltraX-Preview, https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3, https://huggingface.co/datasets/openbmb/UltraData-Math, https://huggingface.co/datasets/openbmb/UltraData-Code, https://huggingface.co/datasets/openbmb/UltraData-SFT-2605, https://huggingface.co/datasets/openbmb/UltraData-SFT-Agent-2609, https://huggingface.co/datasets/openbmb/UltraData-RL-2609
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo: los resultados obtenidos correspondian a paginas de soporte de Microsoft sin relacion con MiniCPM5 ni con Uraion Labs.
