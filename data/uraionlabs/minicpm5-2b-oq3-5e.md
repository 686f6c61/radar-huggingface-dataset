# UraionLabs/MiniCPM5-2B-oQ3.5e

## Resumen

MiniCPM5-2B-oQ3.5e es una cuantización de precisión mixta en formato MLX del modelo OpenBMB/MiniCPM5-2B, publicada por UraionLabs y orientada a inferencia local en ordenadores Apple Silicon (macOS). El modelo original, desarrollado por OpenBMB, es un transformer decoder-only denso de 2,52 mil millones de parámetros (1,98 mil millones sin embeddings) construido sobre la arquitectura estándar `LlamaForCausalLM` con Grouped-Query Attention, lo que facilita su ejecución en runtimes de inferencia convencionales.

La variante oQ3.5e aplica el flujo de cuantización oMLX oQe con asignación de sensibilidad guiada por matriz de importancia. Partiendo de una base de 3 bits, se elevaron 29 capas a 5 bits y 7 capas a 6 bits, y se preservó la cabeza de salida (`lm_head`) a 6 bits, con un tamaño final de 1,17 GB en disco y una densidad efectiva de aproximadamente 3,8 bits por peso. El objetivo es cubrir el hueco entre las variantes de 3 y 4 bits, reduciendo el peso del fichero sin la degradación típica de una cuantización uniforme a 3 bits.

Su relevancia actual está en tres factores: mantiene la ventana de contexto nativa de 131.072 tokens del modelo base, conserva las capacidades de tool calling y uso agéntico para las que fue entrenado el MiniCPM5-2B, y cabe en Macs con memoria unificada modesta, lo que permite ejecutar un modelo de contexto largo íntegramente en local. En el momento de redactar esta ficha el repositorio registra 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `LlamaForCausalLM` (decoder-only denso) con Grouped-Query Attention |
| Parametros totales | 2.516.756.480 (~2,52 B); sin embeddings: 1.981.982.720 (~1,98 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | oQ3.5e (MLX mixed-precision): base 3 bits, perfil mixto 3/5/6 bits (29 capas a 5 bits, 7 capas a 6 bits, `lm_head` a 6 bits), modo affine con group size 64, ~3,8 bits efectivos por peso |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors (tensores no cuantizados en BF16: pesos de LayerNorm, escalas y sesgos de embeddings) |
| Capas | 42 |
| Configuracion de atencion | GQA, 16 cabezas Q / 2 cabezas KV, head dim 128 |
| Tamano de pesos | 1,17 GB (1.200,44 MB); tamano del repositorio 1,3 GB |
| Dataset de calibracion | `oqe_code_multilingual` (294 muestras) |
| Runtime objetivo | Apple Silicon macOS (`omlx`, `mlx-lm`) |
| Modelo base | openbmb/MiniCPM5-2B |
| Flujo de cuantizacion | oMLX oQe, asignacion de sensibilidad guiada por matriz de importancia |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso con la implementacion `LlamaForCausalLM` y Grouped-Query Attention: 42 capas, 16 cabezas de consulta y 2 cabezas de clave/valor con dimension de cabeza 128. Esta eleccion reduce el coste del cache KV frente a atencion multi-cabeza completa y es la razon por la que el contexto de 131.072 tokens resulta viable en hardware de consumo. No se trata de un modelo MoE ni hibrido, por lo que todos los parametros se activan en cada token.

El modelo original fue entrenado por OpenBMB con el curriculo de datos UltraData, que incluye Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3, UltraData-Math, UltraData-Code, UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609. La presencia de datasets especificos de SFT y RL para agentes indica fases de ajuste supervisado y de refuerzo orientadas a tool calling, generacion de salida estructurada y flujos de asistente de codigo. El numero exacto de tokens de entrenamiento, la composicion porcentual del corpus y los detalles de los algoritmos de alineacion (DPO, RLHF u otros) no estan disponibles en la informacion proporcionada.

La innovacion de esta publicacion concreta no esta en la arquitectura sino en la cuantizacion: el flujo oMLX oQe usa una matriz de importancia para decidir que capas reciben mas bits, en lugar de aplicar una precision uniforme. El resultado es un perfil mixto de 3/5/6 bits calibrado con 294 muestras del dataset `oqe_code_multilingual`, con la cabeza de salida preservada a 6 bits, que habitualmente es una de las partes mas sensibles a la cuantizacion agresiva. Los pesos resultantes se almacenan en formato MLX safetensors y se cargan directamente con `omlx` o `mlx-lm`.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles y chino.
- Razonamiento general y resolucion de problemas, herencia del modelo base de la serie MiniCPM5.
- Generacion y asistencia de codigo, con entrenamiento explicito sobre UltraData-Code y sobre el dataset de calibracion multilingue de codigo.
- Tool calling y function calling, segun las capacidades declaradas del modelo base.
- Flujos agenticos y razonamiento multi-paso, respaldados por los datasets UltraData-SFT-Agent-2609 y UltraData-RL-2609.
- Generacion de salida estructurada para integracion en pipelines de software.
- Procesamiento de contexto largo de hasta 131.072 tokens de forma nativa.
- Ejecucion local sin conexion en Apple Silicon mediante `omlx` y `mlx-lm`.
- Modo de pensamiento explicito (thinking mode): no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles; el modelo es exclusivamente de texto.
- Multilinguismo mas alla de en y zh: no disponible.

## Casos de uso

- Asistente de codigo local sobre repositorios completos: con 131.072 tokens de contexto es posible cargar varios ficheros de un repositorio mediano en una sola ventana y pedir refactorizaciones o explicaciones sin dividir el codigo en fragmentos, algo critico para razonar sobre dependencias entre modulos.
- Agente de automatizacion con tool calling: el modelo puede emitir llamadas a funciones en formato estructurado y encadenarlas en varios pasos, lo que permite construir agentes que consulten APIs, escriban ficheros o ejecuten comandos bajo supervision en un Mac de desarrollo.
- Asistente de atencion al cliente en local: la ventana de 131k tokens admite historiales de conversacion e informacion de producto extensos, y el despliegue on-device evita enviar transcripciones a servicios externos.
- Resumen y sintesis de documentos largos con requisitos de privacidad: informes, contratos o documentacion tecnica pueden procesarse integramente en el equipo del usuario, sin salida de datos a la nube, aprovechando el contexto nativo del modelo.
- Extraccion de datos y generacion de JSON: el entrenamiento en salida estructurada y function calling lo hace adecuado para convertir texto no estructurado en registros con esquema fijo dentro de un pipeline de ingesta.
- Prototipado e investigacion en cuantizacion: al ser una variante mixta 3/5/6 bits, sirve como sujeto de estudio para medir la degradacion de calidad frente a oQ4e, oQ5e u oQ6e del mismo autor sobre idénticos prompts y tareas.
- Aplicaciones macOS distribuidas con IA embebida: el fichero de 1,17 GB puede empaquetarse dentro de una aplicacion nativa para Mac y ejecutarse sin dependencias de red ni GPU dedicada.
- Evaluacion comparativa de runtimes MLX: util para medir latencia y consumo de memoria unificada de `omlx` frente a `mlx-lm` con cargas de contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica referencia cuantitativa aportada por el autor es que el modelo base MiniCPM5-2B alcanza una media de 53,9 en el conjunto de evaluacion propio de OpenBMB, sin desglose por tarea ni comparacion directa con la version cuantizada. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni de ningun otro benchmark para esta variante oQ3.5e, ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM o memoria unificada estimada: los pesos ocupan 1,17 GB. A contextos cortos el modelo funciona holgadamente en Macs con 8 GB de memoria unificada; a maxima ventana se anade el cache KV.
- Estimacion del cache KV (calculo propio a partir de la arquitectura, no dato publicado): 42 capas x 2 cabezas KV x 128 de dimension x 2 tensores (K y V) x 2 bytes en BF16 = 43.008 bytes por token, unos 43 KB/token. A 131.072 tokens suponen aproximadamente 5,6 GB, lo que situa el consumo total en torno a 7 GB en el peor caso.
- GPU compatibles: exclusivamente Apple Silicon (familias M1, M2, M3 y M4) a traves de MLX. No hay soporte para A100, H100, RTX 4090 ni otras GPU NVIDIA en este formato.
- Cabe en GPU de consumo: si, en el sentido de Macs con memoria unificada de 16 GB o superior para contexto completo, y de 8 GB para contexto corto. No es ejecutable en GPUs de consumo NVIDIA sin reconvertir los pesos.
- Opciones de despliegue: `omlx` (https://github.com/jundot/omlx) y `mlx-lm` (https://github.com/ml-explore/mlx-examples/tree/main/llms/mlx_lm). Para vLLM, llama.cpp, Ollama o TGI seria necesaria una conversion a otro formato que no se incluye en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparativa dentro de la propia familia de cuantizaciones de UraionLabs sobre el mismo modelo base:

| Variante | Bits base | Perfil mixto | `lm_head` | Tamano | Idoneidad relativa |
|---|---|---|---|---|---|
| oQ2e | 2 bits | 2/5/6 bits (10 @ 5b, 6 @ 6b) | 6 bits | 0,88 GB | Maxima compresion, mayor perdida de calidad esperada |
| oQ2.7e | 2 bits | 2/5/6/8 bits (23 @ 5b, 8 @ 6b) | 8 bits | 0,98 GB | Compromiso agresivo con cabeza de salida reforzada |
| oQ3e | 3 bits | 3/5/6 bits (31 @ 5b, 7 @ 6b) | 3 bits | 1,08 GB | Menor tamano, cabeza de salida a 3 bits |
| **oQ3.5e** | **3 bits** | **3/5/6 bits (29 @ 5b, 7 @ 6b)** | **6 bits** | **1,17 GB** | **Variante intermedia 3/4 bits con `lm_head` reforzada** |
| oQ4e | 4 bits | 4/5/6 bits (58 @ 5b, 9 @ 6b) | 4 bits | 1,38 GB | Mayor fidelidad, +0,21 GB |
| oQ5e | 5 bits | 5/6/8 bits (19 @ 6b, 6 @ 8b) | 6 bits | 1,67 GB | Alta fidelidad |
| oQ6e | 6 bits | 6/8 bits (28 @ 8b) | 6 bits | 1,95 GB | Muy alta fidelidad |
| oQ8e | 8 bits | Uniforme 8 bits | 8 bits | 2,49 GB | Practicamente sin perdida por cuantizacion |

Frente al modelo base openbmb/MiniCPM5-2B en precision completa, esta variante reduce el peso a 1,17 GB con una licencia identica Apache-2.0 y la misma ventana de contexto, a cambio de una perdida de calidad no cuantificada en la informacion disponible.

Comparativa con alternativas externas de la misma categoria (otros modelos densos de 2 a 3 mil millones de parametros): no disponible. No se han proporcionado especificaciones ni resultados de modelos de otros fabricantes que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- La cuantizacion a una base de 3 bits con densidad efectiva de ~3,8 bits por peso implica una perdida de calidad respecto al modelo original. No se publican mediciones de esa degradacion, ni del autor de la cuantizacion ni de OpenBMB.
- El dataset de calibracion tiene solo 294 muestras y esta orientado a codigo multilingue (`oqe_code_multilingual`), por lo que la asignacion de sensibilidad puede estar sesgada hacia ese dominio y no ser optima para generacion literaria, matematicas avanzadas o conversacion general.
- Riesgo de alucinacion: no se documenta ninguna mitigacion especifica ni tasas de error medidas. Como en cualquier modelo de esta escala, la verificacion de hechos y de referencias es obligatoria en produccion.
- Idioma: solo se declaran ingles y chino. El rendimiento en castellano no esta evaluado ni garantizado; se espera degradacion notable respecto a `en` y `zh`.
- Contexto: aunque la ventana nominal es de 131.072 tokens, no se aportan resultados de evaluacion tipo needle-in-a-haystack que confirmen una recuperacion fiable a esa longitud. Es previsible cierta degradacion en tramos finales del contexto.
- Formato y plataforma: los pesos estan en MLX safetensors, ejecutables unicamente con `omlx` o `mlx-lm` sobre macOS con Apple Silicon. No hay compatibilidad directa con CUDA, vLLM, llama.cpp, Ollama ni TGI.
- Consumo de memoria a contexto completo: la estimacion de ~5,6 GB de cache KV a 131.072 tokens puede agotar la memoria unificada de equipos de 8 GB y provocar swapping.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion sin restricciones de copyleft, siempre que se conserven los avisos de copyright y licencia. Conviene verificar que la licencia del modelo base y la de los datasets de entrenamiento sean compatibles con el uso previsto.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso ni validacion independiente de la comunidad. La model card aparece truncada en la seccion de inicio rapido, por lo que las instrucciones de uso completas no estan disponibles.
- Fechas de publicacion y actualizacion declaradas: 10 de septiembre de 2026, muy proximas entre si (18 minutos de diferencia), lo que sugiere una publicacion automatizada sin revision posterior.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o alineacion para este modelo ni para el modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ3.5e
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Variante oQ8e: https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ8e
- Variante oQ6e: https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ6e
- Variante oQ5e: https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ5e
- Variante oQ4e: https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ4e
- Variante oQ3e: https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ3e
- Variante oQ2.7e: https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ2.7e
- Variante oQ2e: https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ2e
- Repositorio oMLX: https://github.com/jundot/omlx
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-examples/tree/main/llms/mlx_lm
- Sitio del publicador: https://uraionlabs.com
- Paper referenciado (arXiv:2506.07900): https://arxiv.org/abs/2506.07900
- Paper referenciado (arXiv:2602.09003): https://arxiv.org/abs/2602.09003
