# UraionLabs/MiniCPM5-2B-oQ2.5e

## Resumen

MiniCPM5-2B-oQ2.5e es una cuantización de precisión mixta en formato MLX del modelo OpenBMB/MiniCPM5-2B, publicada por Uraion Labs. No es un modelo nuevo, sino un checkpoint derivado: mantiene la arquitectura y los pesos del modelo base (LlamaForCausalLM con Grouped-Query Attention, 42 capas y 2.516.756.480 parámetros totales) pero comprime el almacenamiento hasta los 0,97 GB mediante el flujo de cuantización oMLX oQe, guiado por matrices de importancia para asignar bits de forma desigual por capa.

El problema que resuelve es el despliegue local en Apple Silicon: el modelo base en BF16 ocupa varios gigabytes y exige más memoria unificada, mientras que esta variante cabe en menos de 1 GB con una precisión efectiva de unos 3,0 bits por peso. Para compensar la pérdida de calidad de la base de 2 bits, la receta eleva 17 capas a 5 bits, 8 capas a 6 bits y conserva la proyección de salida (`lm_head`) a 8 bits, con un total de 26 overrides.

Es relevante ahora porque combina tres cosas poco habituales en un modelo de 2B comprimido: una ventana de contexto nativa de 131.072 tokens, capacidades declaradas de tool calling y flujos agénticos, y compatibilidad directa con `mlx-lm` y `omlx` sin conversión previa. La licencia Apache-2.0 y el soporte de inglés y chino lo hacen apto para uso comercial, con la salvedad de que el runtime MLX limita el destino a macOS sobre Apple Silicon.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (`llama`) con Grouped-Query Attention (GQA), 16 cabezas Q / 2 cabezas KV, dimensión de cabeza 128, 42 capas |
| Parámetros totales | 2.516.756.480 (~2,52B) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Parámetros sin embeddings | 1.981.982.720 (~1,98B) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantización | Variante `oQ2.5e`: precisión mixta 2/5/6/8 bits sobre base de 2 bits (17 capas a 5 bits, 8 capas a 6 bits, `lm_head` a 8 bits; 26 overrides). Grupo de tamaño 64, modo afín (escala y sesgo por grupo), tensores no cuantizados en BF16. Precisión efectiva ~3,0 bits por peso. Familia completa disponible: oQ8e, oQ6e, oQ5e, oQ4e, oQ3.5e, oQ3e, oQ2.7e, oQ2.5e, oQ2e |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors (0,97 GB / 990,44 MB) |
| Modelo base | openbmb/MiniCPM5-2B |
| Runtime objetivo | Apple Silicon macOS mediante `omlx` y `mlx-lm` |
| Dataset de calibración | `oqe_code_multilingual` (294 muestras) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base, sin modificaciones estructurales: un transformer decoder-only estándar `LlamaForCausalLM` de 42 capas con Grouped-Query Attention (16 cabezas de consulta y solo 2 de clave/valor, dimensión de cabeza 128). El uso de GQA con una ratio 8:1 reduce de forma notable el tamaño de la caché KV frente a atención multi-cabeza completa, algo crítico para sostener los 131.072 tokens de contexto en hardware de gama consumer. Los embeddings y los pesos de LayerNorm se conservan en BF16 sin cuantizar.

El entrenamiento original corrió a cargo de OpenBMB y se apoyó en el currículo de datos UltraData, según los datasets declarados: Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3, UltraData-Math, UltraData-Code, UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609. La presencia de etapas SFT específicas de agente y de una fase RL indica un ajuste deliberado hacia function calling, salida estructurada y razonamiento multi-paso. No se especifican en la información disponible el número de tokens de preentrenamiento, la composición porcentual del corpus ni los detalles del algoritmo de RL.

La innovación del checkpoint publicado por Uraion Labs está en el postprocesado, no en el entrenamiento: el flujo oMLX oQe calcula la sensibilidad de cada capa mediante matrices de importancia y asigna bits de forma no uniforme, elevando la precisión solo donde el impacto en la calidad es mayor. El resultado es un peso efectivo de ~3,0 bits por peso con un footprint inferior a 1 GB y una proyección de salida a 8 bits, algo que las cuantizaciones uniformes de 2 bits no consiguen a ese tamaño. La calibración se hizo sobre un conjunto multilingüe orientado a código de 294 muestras.

## Capacidades

- Generación de texto conversacional en inglés y chino, con pipeline declarado `text-generation` y etiqueta `conversational`.
- Razonamiento multi-paso (`reasoning`) y resolución de problemas matemáticos, respaldado por el dataset UltraData-Math del entrenamiento base.
- Generación y asistencia de código (`coding`), con UltraData-Code en el currículo original.
- Tool calling y function calling: el modelo está etiquetado explícitamente como `tool-calling` y `function-calling`, con una fase SFT dedicada a agentes (UltraData-SFT-Agent-2609).
- Flujos agénticos: soporte declarado para `agent` y `agentic`, incluyendo generación de salida estructurada.
- Contexto largo nativo de 131.072 tokens, útil para síntesis de documentos y razonamiento sobre repositorios completos.
- Capacidades multilingües limitadas a inglés y chino; no se declaran otros idiomas.
- No se declaran capacidades de visión, audio ni modo de pensamiento explícito (`thinking mode`) en la información disponible.

## Casos de uso

- Asistente de código local en Mac: el modelo puede autocompletar y explicar fragmentos de código sin salir del portátil, con 131.072 tokens de contexto suficientes para incluir varios ficheros de un repositorio medio en una sola ventana. El footprint de 0,97 GB permite mantenerlo cargado en memoria de forma permanente.
- Agente de terminal con function calling: al soportar tool calling y salida estructurada, se puede integrar como planificador en un bucle de agente que invoque comandos de shell o APIs HTTP, ejecutándose en local para evitar enviar código propietario a servicios externos.
- Resumen de documentación técnica larga en chino o inglés: la ventana de 131k tokens permite procesar manuales o informes extensos en una sola pasada, sin necesidad de chunking ni de recuperación externa.
- Atención al cliente multi-turno bilingüe (en/zh): conversaciones largas con historial completo en contexto, desplegado en un Mac mini como backend local para escenarios con requisitos de privacidad de datos.
- Prototipado e investigación en edge AI: al ser un checkpoint MLX de menos de 1 GB, sirve para experimentar con cuantización de precisión mixta, medir el impacto de los overrides por capa y comparar contra las otras variantes de la familia oQ.
- Extracción de información estructurada: aprovechando la fase SFT de agente, se puede usar para convertir texto libre en JSON con un esquema fijo, por ejemplo facturas o tickets, en pipelines internos sin conexión.
- Base para ajuste fino ligero en Apple Silicon: el tamaño reducido permite hacer LoRA o QLoRA sobre el checkpoint cuantizado en un equipo de sobremesa, aunque hay que validar la compatibilidad del flujo de entrenamiento con pesos MLX de precisión mixta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para la variante cuantizada oQ2.5e. El único dato numérico aportado corresponde al modelo base, no a esta cuantización:

| Modelo | Evaluación | Resultado |
|---|---|---|
| openbmb/MiniCPM5-2B (base, BF16) | Media en el conjunto de evaluación de OpenBMB | 53,9 |
| UraionLabs/MiniCPM5-2B-oQ2.5e | MMLU, HumanEval, GSM8K u otros | no disponible |

La model card afirma que el modelo base es competitivo con modelos de la clase 3B y 4B, pero no se aportan desgloses por tarea ni la comparación contra la variante oQ2.5e, por lo que no es posible cuantificar la degradación introducida por la cuantización.

## Requisitos de hardware

- Almacenamiento en disco: 0,97 GB (990,44 MB) para el checkpoint completo; conviene reservar algo más para la caché de tokens del runtime.
- Memoria unificada mínima estimada: alrededor de 2 GB para contexto corto (pesos + overhead del runtime). Es una estimación a partir del tamaño del fichero, no un dato publicado.
- Caché KV estimada: con 42 capas, 2 cabezas KV de dimensión 128 y almacenamiento BF16, cada token consume aproximadamente 43 KB, lo que implica unos 5,3 GiB para agotar los 131.072 tokens de contexto. Se reduce a la mitad si el runtime usa caché KV de 8 bits. Cálculo propio a partir de la configuración de atención declarada.
- Para contexto completo en BF16 habría que presupuestar del orden de 8-10 GB de memoria unificada (pesos, caché KV y overhead), cifra estimada y no verificada experimentalmente.
- GPU recomendadas: no aplica en el sentido habitual, ya que MLX solo se ejecuta en Apple Silicon. El modelo está pensado para Mac con chip de la familia M (M1 o posterior); no se proporcionan recomendaciones específicas de modelo de chip.
- Cabe en GPUs consumer: no directamente. Requiere convertir los pesos a GGUF u otro formato para ejecutarlo en CUDA (RTX 3060, 4090, etc.), algo que la model card no documenta.
- Opciones de despliegue: `mlx-lm` y `omlx` son los runtimes declarados y compatibles de forma directa.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Comparación dentro de la propia familia de cuantizaciones publicada por Uraion Labs sobre el mismo modelo base (datos de la model card):

| Variante | Bits base | Perfil de precisión mixta | `lm_head` | Tamaño |
|---|---|---|---|---|
| oQ8e | 8 bits | Uniforme 8 bits | 8 bits | 2,49 GB |
| oQ6e | 6 bits | Mixta 6/8 bits (28 capas a 8 bits) | 6 bits | 1,95 GB |
| oQ5e | 5 bits | Mixta 5/6/8 bits (19 a 6b, 6 a 8b) | 6 bits | 1,67 GB |
| oQ4e | 4 bits | Mixta 4/5/6 bits (58 a 5b, 9 a 6b) | 4 bits | 1,38 GB |
| oQ3.5e | 3 bits | Mixta 3/5/6 bits (29 a 5b, 7 a 6b) | 6 bits | 1,17 GB |
| oQ3e | 3 bits | Mixta 3/5/6 bits (31 a 5b, 7 a 6b) | 3 bits | 1,08 GB |
| oQ2.7e | 2 bits | Mixta 2/5/6/8 bits (23 a 5b, 8 a 6b) | 8 bits | 0,98 GB |
| oQ2.5e | 2 bits | Mixta 2/5/6/8 bits (17 a 5b, 8 a 6b) | 8 bits | 0,97 GB |

Frente al modelo base sin cuantizar (openbmb/MiniCPM5-2B, pesos BF16, Apache-2.0), esta variante reduce el tamaño del checkpoint de forma drástica manteniendo la misma arquitectura, contexto e idiomas, a cambio de una pérdida de precisión que no está cuantificada con benchmarks. Comparaciones con alternativas de otros fabricantes en la misma franja de 1-3B (por ejemplo familias Qwen, Llama o Gemma) no están disponibles en la información proporcionada, ni en parámetros equivalentes verificados ni en resultados de evaluación comparables.

## Limitaciones y advertencias

- Degradación por cuantización agresiva: la base es de 2 bits, con solo 17 capas elevadas a 5 bits y 8 a 6 bits. Aunque el `lm_head` se preserve a 8 bits, es esperable una pérdida de calidad perceptible en tareas de razonamiento y código frente al modelo base; la model card no publica métricas que la acoten.
- Calibración sobre un conjunto pequeño y sesgado a código: 294 muestras del dataset `oqe_code_multilingual`. El comportamiento en dominios alejados del código y en chino conversacional puede desviarse más de lo esperado.
- Idiomas limitados a inglés y chino. No hay soporte declarado de castellano ni de otros idiomas, por lo que su uso en aplicaciones en español no está validado.
- Riesgo de alucinación inherente a un modelo de 2B, agravado por la cuantización de 2 bits. No es adecuado para tareas que exijan precisión factual alta sin verificación externa.
- Restricción de plataforma: los pesos están en formato MLX safetensors y el runtime objetivo es Apple Silicon macOS. No se pueden cargar directamente en vLLM, TGI, Ollama o llama.cpp sin una conversión previa no documentada.
- La licencia Apache-2.0 del checkpoint y del modelo base permite uso comercial, pero conviene revisar las condiciones de los datasets de entrenamiento (Ultra-FineWeb, UltraData, etc.) si el uso implica redistribución de datos derivados.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validaciones de terceros. Tratar como publicación reciente y no contrastada.
- No hay datos publicados de latencia, throughput ni de estabilidad en contextos cercanos a los 131.072 tokens con esta cuantización concreta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ2.5e
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Otras variantes de la familia: https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ8e, https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ6e, https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ5e, https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ4e, https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ3.5e, https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ3e, https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ2.7e
- Repositorio oMLX: https://github.com/jundot/omlx
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-examples/tree/main/llms/mlx_lm
- Sitio de Uraion Labs: https://uraionlabs.com
- Referencias arXiv citadas en la model card: https://arxiv.org/abs/2506.07900 y https://arxiv.org/abs/2602.09003
