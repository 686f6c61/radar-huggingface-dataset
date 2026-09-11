# UraionLabs/MiniCPM5-2B-oQ2e

## Resumen

MiniCPM5-2B-oQ2e es una cuantización de precisión mixta en formato MLX del modelo OpenBMB/MiniCPM5-2B, publicada por Uraion Labs para inferencia local en Macs con Apple Silicon. Se ha generado con el flujo de cuantización oMLX oQe, que asigna la precisión por capas guiándose por una matriz de importancia (importance-matrix guided sensitivity allocation). El resultado es un checkpoint de 0,88 GB (900,44 MB) con una precisión base de 2 bits y una mezcla efectiva de 2/5/6 bits: 10 capas elevadas a 5 bits, 6 capas a 6 bits y la cabeza de salida (`lm_head`) preservada a 6 bits, con un tamaño de grupo de 64 y modo affine.

El modelo base es un transformer decoder-only de tipo `LlamaForCausalLM` con 2.516.756.480 parámetros totales (~2,52 B) y 1.981.982.720 parámetros no de embedding (~1,98 B), distribuidos en 42 capas con Grouped-Query Attention (16 cabezas de consulta, 2 cabezas de clave/valor, dimensión de cabeza 128). Mantiene la ventana de contexto nativa de 131.072 tokens y está orientado a generación de texto, razonamiento, código, tool calling y flujos agénticos, con soporte de inglés y chino.

Su relevancia es práctica: permite ejecutar un modelo de clase 2B con contexto de 131k en un portátil Mac sin GPU dedicada, usando únicamente ~0,88 GB de disco para los pesos. Es la variante de máxima compresión de la familia oQe de Uraion Labs, por debajo de sus hermanas oQ2.7e (0,98 GB), oQ3e (1,08 GB) y oQ4e (1,38 GB), lo que la sitúa como la opción extrema cuando el objetivo es minimizar el uso de memoria unificada asumiendo una pérdida de calidad mayor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `LlamaForCausalLM` (transformer decoder-only) con GQA: 16 cabezas Q / 2 cabezas KV, dimensión de cabeza 128, 42 capas |
| Parametros totales | 2.516.756.480 (~2,52 B); parámetros no de embedding: 1.981.982.720 (~1,98 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | oQ2e: base 2 bits con precisión mixta 2/5/6 bits (10 capas a 5 bits, 6 capas a 6 bits, `lm_head` a 6 bits); group size 64; modo affine (escala y sesgo por grupo); ~2,8 bits efectivos por peso; tensores no cuantizados (LayerNorm, escalas y sesgos de embedding) en BF16 |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors (librería `mlx`) |
| Modelo base | openbmb/MiniCPM5-2B (relación: quantized) |
| Tamaño de pesos | 0,88 GB (900,44 MB); tamaño del repositorio: 0,9 GB |
| Runtime objetivo | Apple Silicon macOS (`oMLX`, `mlx-lm`) |
| Calibración | Dataset `oqe_code_multilingual`, 294 muestras |
| Descargas / likes | 0 / 0 |
| Fecha de publicación | 2026-09-10 |

## Arquitectura y entrenamiento

La arquitectura del checkpoint es la del modelo base, sin modificaciones estructurales: un transformer decoder-only causal estándar `LlamaForCausalLM` de 42 capas, con atención de consultas agrupadas (GQA) de 16 cabezas de consulta y 2 cabezas de clave/valor de dimensión 128, lo que reduce el coste de la caché KV durante la decodificación. El uso de una arquitectura LLaMA canónica es lo que permite que el modelo se ejecute en runtimes estándar sin kernels personalizados. Sobre esa base, Uraion Labs aplica una cuantización de precisión mixta: en lugar de truncar todas las capas al mismo número de bits, el flujo oQe calcula una matriz de importancia y decide qué capas merecen más precisión. En esta variante, 16 capas reciben un override (10 a 5 bits, 6 a 6 bits) y la cabeza de salida se conserva a 6 bits, que es la decisión habitual para no degradar la distribución de probabilidad final del vocabulario.

En cuanto al entrenamiento del modelo original, la model card indica que MiniCPM5-2B se entrenó con el currículo de datos UltraData de OpenBMB, que incluye Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3, UltraData-Math y UltraData-Code para la fase de preentrenamiento, y UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609 para las fases de ajuste supervisado y aprendizaje por refuerzo orientadas a agentes. El número exacto de tokens de entrenamiento, la composición porcentual del dataset y los detalles del algoritmo de RL no se especifican en la información disponible. La calibración de la cuantización se hizo con 294 muestras de código multilingüe (`oqe_code_multilingual`), un detalle relevante porque sesga la asignación de precisión hacia patrones propios de código.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento y resolución de problemas de complejidad media, con especial énfasis en tareas de código según la calibración empleada.
- Generación y asistencia de código, incluida la navegación de repositorios completos gracias a la ventana de 131.072 tokens.
- Tool calling y function calling: el modelo base está diseñado explícitamente para invocación de funciones y generación de salida estructurada.
- Flujos agénticos y razonamiento multi-paso, apoyados por los datasets de SFT y RL orientados a agentes de la familia UltraData.
- Comprensión y síntesis de documentos largos (hasta 131k tokens) en una sola pasada.
- Capacidad multilingüe limitada a inglés y chino; no se declara soporte de otros idiomas.
- No se declara soporte de visión, audio ni modo de pensamiento explícito (thinking mode): no disponible.

## Casos de uso

- Asistente de código local en Mac: con 0,88 GB de pesos, el modelo cabe en cualquier Mac con Apple Silicon y puede integrarse en el editor mediante `mlx-lm` para autocompletado, explicación de funciones y generación de tests sin enviar código a servicios externos.
- Agente con tool calling en local: su soporte de function calling permite construir agentes que consulten APIs, lean ficheros o ejecuten comandos a través de herramientas definidas, manteniendo toda la orquestación en la máquina del usuario.
- Análisis de repositorios completos: la ventana de 131k tokens permite cargar varios ficheros de un proyecto y pedir refactorizaciones o detección de dependencias cruzadas sin trocear el contexto.
- Resumen y extracción de información en documentos largos: informes, contratos o documentación técnica que superan la ventana típica de 8k-32k tokens pueden procesarse en una sola pasada, con extracción de campos en formato estructurado.
- Chat de atención al cliente bilingüe inglés/chino: conversaciones multi-turno con historial largo y generación de respuestas dentro de plantillas JSON, aprovechando la naturaleza conversacional del modelo base.
- Generación de consultas y esquemas estructurados: SQL, JSON o YAML a partir de descripciones en lenguaje natural, un escenario donde la mezcla de precisión conservada en la cabeza de salida (6 bits) ayuda a mantener el formato.
- Prototipado y evaluación de cuantizaciones en edge AI: sirve como referencia de máxima compresión para comparar la degradación de calidad frente a las variantes oQ3e, oQ4e u oQ8e del mismo modelo base.
- Procesamiento offline en entornos sin conectividad: al ejecutarse en local sobre mlx, es adecuado para despliegues en campo o con requisitos de confidencialidad estrictos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta cuantización. La model card del modelo base (upstream) menciona una media de 53,9 en el conjunto de evaluación propio de OpenBMB y lo sitúa como estado del arte en la clase 2B, competitivo con modelos de 3B y 4B, pero no desglosa resultados por benchmark (MMLU, HumanEval, GSM8K u otros) ni ofrece cifras específicas para la variante oQ2e. No se dispone de datos de perplejidad, latencia o throughput para este checkpoint.

| Metrica | Resultado |
|---|---|
| Benchmarks por tarea | no disponible |
| Media reportada del modelo base (eval. OpenBMB) | 53,9 (dato de la model card del upstream, sin desglose) |
| Perplejidad de la cuantización oQ2e | no disponible |
| Comparación cuantitativa con el modelo en BF16 | no disponible |

## Requisitos de hardware

- VRAM / memoria unificada: los pesos ocupan 0,88 GB. El factor limitante es la caché KV: con 42 capas, 2 cabezas KV y dimensión 128 en BF16, cada token consume aproximadamente 42 KiB de caché, lo que a 131.072 tokens supone unos 5,25 GiB estimados a partir de la configuración del modelo.
- Mac con 8 GB de memoria unificada: viable con contexto moderado (decenas de miles de tokens); el contexto máximo puede provocar swap.
- Mac con 16 GB: permite trabajar con contexto largo (por encima de 100k tokens) dejando margen para el runtime y otras aplicaciones.
- Mac con 32 GB o más: recomendable para explotar los 131k tokens completos con holgura y varios procesos simultáneos.
- GPU dedicadas (NVIDIA A100, H100, RTX 4090): no aplicables, ya que el formato MLX está pensado para Apple Silicon; se requeriría una conversión a otro formato.
- Cabe en GPU de consumo: solo en el sentido de que cabe en los SoC Apple M1/M2/M3/M4; no hay soporte CUDA nativo para este checkpoint.
- Opciones de despliegue: oMLX (https://github.com/jundot/omlx) y mlx-lm (https://github.com/ml-explore/mlx-examples/tree/main/llms/mlx_lm). Para vLLM, llama.cpp, Ollama o TGI sería necesaria una conversión previa del checkpoint, no incluida en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos competidores de otros desarrolladores. La comparación disponible se limita a las variantes de cuantización de la propia familia oQe sobre el mismo modelo base:

| Variante | Bits base | Perfil de precisión mixta | `lm_head` | Tamaño | Repositorio |
|---|---|---|---|---|---|
| oQ8e | 8 bits | Uniforme 8 bits | 8 bits | 2,49 GB | UraionLabs/MiniCPM5-2B-oQ8e |
| oQ6e | 6 bits | Mixta 6/8 bits (28 capas a 8 bits) | 6 bits | 1,95 GB | UraionLabs/MiniCPM5-2B-oQ6e |
| oQ5e | 5 bits | Mixta 5/6/8 bits (19 a 6b, 6 a 8b) | 6 bits | 1,67 GB | UraionLabs/MiniCPM5-2B-oQ5e |
| oQ4e | 4 bits | Mixta 4/5/6 bits (58 a 5b, 9 a 6b) | 4 bits | 1,38 GB | UraionLabs/MiniCPM5-2B-oQ4e |
| oQ3.5e | 3 bits | Mixta 3/5/6 bits (29 a 5b, 7 a 6b) | 6 bits | 1,17 GB | UraionLabs/MiniCPM5-2B-oQ3.5e |
| oQ3e | 3 bits | Mixta 3/5/6 bits (31 a 5b, 7 a 6b) | 3 bits | 1,08 GB | UraionLabs/MiniCPM5-2B-oQ3e |
| oQ2.7e | 2 bits | Mixta 2/5/6/8 bits (23 a 5b, 8 a 6b, `lm_head` a 8b) | 8 bits | 0,98 GB | UraionLabs/MiniCPM5-2B-oQ2.7e |
| oQ2e | 2 bits | Mixta 2/5/6 bits (10 a 5b, 6 a 6b) | 6 bits | 0,88 GB | UraionLabs/MiniCPM5-2B-oQ2e |

Todas comparten arquitectura, contexto de 131.072 tokens, licencia Apache-2.0 y compatibilidad con mlx-lm y oMLX. La diferencia entre oQ2e y oQ2.7e es notable: la segunda dedica más presupuesto a la cabeza de salida (8 bits frente a 6) y a las capas intermedias, con solo 0,10 GB adicionales, lo que en la práctica la convierte en una alternativa a considerar antes de bajar a oQ2e. Comparativa con modelos de otros desarrolladores: no disponible.

## Limitaciones y advertencias

- Cuantización agresiva: la base es de 2 bits, con un promedio de ~2,8 bits efectivos por peso. Es la variante de máxima compresión de la familia y, previsiblemente, la que mayor degradación de calidad presenta frente al modelo en BF16; no se publican métricas de esa degradación.
- Sesgo de calibración hacia código: el conjunto de calibración (`oqe_code_multilingual`, 294 muestras) está orientado a código multilingüe, por lo que la asignación de precisión puede favorecer este dominio en detrimento de otros (por ejemplo, prosa o matemáticas puras).
- Idiomas limitados: solo inglés y chino. No hay soporte declarado de castellano ni de otros idiomas, y el rendimiento fuera de esos dos idiomas no está evaluado.
- Riesgo de alucinación: inherente a los modelos de 2B parámetros y acentuado por la cuantización de 2 bits. No se recomienda su uso en tareas que requieran exactitud factual sin verificación externa.
- Restricciones de plataforma: el checkpoint es MLX safetensors y solo se ejecuta en Apple Silicon con macOS a través de oMLX o mlx-lm. No hay soporte CUDA, ROCm ni despliegue directo en vLLM, TGI, llama.cpp u Ollama sin conversión previa.
- Licencia: Apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base openbmb/MiniCPM5-2B por si impusieran requisitos adicionales.
- Calidad del contexto largo no verificada: aunque la ventana es de 131.072 tokens, no hay benchmarks que confirmen la retención de información en contextos extremos, especialmente tras la cuantización.
- Sin validación de la comunidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe retroalimentación independiente sobre su comportamiento real.
- Advertencia sobre metadatos: las fechas del repositorio (2026) y algunos identificadores arXiv de la model card son posteriores al conocimiento de referencia habitual; conviene contrastarlos directamente en HuggingFace.
- La model card original está truncada en la información disponible, por lo que las instrucciones de uso completas y los ejemplos de código de la sección Quickstart no se han podido recuperar íntegramente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ2e
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Runtime oMLX: https://github.com/jundot/omlx
- Runtime mlx-lm: https://github.com/ml-explore/mlx-examples/tree/main/llms/mlx_lm
- Web de Uraion Labs: https://uraionlabs.com
- Variantes de la familia: https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ8e, https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ6e, https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ5e, https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ4e, https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ3.5e, https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ3e, https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ2.7e
- Referencias arXiv citadas en las etiquetas del repositorio: https://arxiv.org/abs/2506.07900 y https://arxiv.org/abs/2602.09003 (títulos y contenido no verificados)
- Datasets de entrenamiento del modelo base: https://huggingface.co/datasets/openbmb/Ultra-FineWeb, https://huggingface.co/datasets/openbmb/UltraX-Preview, https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3, https://huggingface.co/datasets/openbmb/UltraData-Math, https://huggingface.co/datasets/openbmb/UltraData-Code, https://huggingface.co/datasets/openbmb/UltraData-SFT-2605, https://huggingface.co/datasets/openbmb/UltraData-SFT-Agent-2609, https://huggingface.co/datasets/openbmb/UltraData-RL-2609
- Nota sobre la búsqueda web: los resultados recuperados durante la búsqueda (dominios ok.ru y odnoklassniki.ru) no guardan relación con el modelo ni aportan información técnica utilizable, por lo que no se incluyen como fuentes.
