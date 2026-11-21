# yanauto/Inkling-2-Mini-heretic-full

## Resumen

Inkling-2-Mini-heretic-full es una variante "decensored" (también etiquetada como abliterated) del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el usuario yanauto. El modelo base es un transformer de tipo mezcla de expertos (MoE) con capacidades de imagen-texto a texto, y esta versión aplica una ablación de rango arbitrario mediante la herramienta Heretic 2.1.0 para eliminar el comportamiento de rechazo (refusals) del modelo original. El resultado es un modelo que responde a peticiones que el original rechaza, manteniendo una calidad cercana en tareas de conocimiento general.

El cambio principal respecto a la versión solo-atención (yanauto/Inkling-2-Mini-heretic) es que aquí se editan también las proyecciones `down_proj` de los 3.072 expertos enrutados (128 expertos × 24 capas), además de las proyecciones de salida de atención. Esto obliga a almacenar los expertos en BF16 (~52 GB) en lugar del formato original NVFP4/MXFP8, lo que eleva el tamaño del repositorio a 53,4 GB y limita las opciones de despliegue.

El modelo es relevante para quienes necesitan un modelo multimodal MoE sin filtros de rechazo y con licencia Apache 2.0, pero presenta restricciones técnicas importantes: no carga en vLLM con expertos BF16 para esta arquitectura, y el coste en memoria es alto en comparación con la versión en formato oficial (~20 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con capacidades multimodales imagen-texto; 24 capas, 128 expertos enrutados por capa (3.072 expertos en total) |
| Parametros totales | 26.388.641.280 (~26,4 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 para expertos (en esta versión); el modelo original usa NVFP4/MXFP8; existe versión GGUF en repo separado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16 para expertos y proyecciones editadas); GGUF disponible en repo aparte |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un transformer de tipo mezcla de expertos con 24 capas y 128 expertos enrutados por capa (3.072 expertos en total), con capacidades multimodales de imagen-texto a texto. Esta versión heretic-full no reentrena el modelo, sino que aplica una ablación de rango arbitrario (Arbitrary-Rank Ablation) mediante Heretic 2.1.0 sobre las proyecciones de salida de atención y sobre la `down_proj` de todos los expertos enrutados. La ablación se optimizó con 100 ensayos de Optuna (20 aleatorios) con semilla 20261121, seleccionando el ensayo 41 por ser el punto de menor rechazo en el frente de Pareto (3/100 según la puntuación de Heretic). El siguiente punto del frente presentaba 10/100 rechazos con divergencia KL de 0,075.

El proceso requirió un parche específico de Heretic para esta arquitectura: edición únicamente de la linear interna de la salida de atención con compuerta, uso de las tres pasadas por forward de las capas 6–17 como muestras, y división de los tensores 3D de expertos en linears por experto que comparten almacenamiento, ajustando cada una sobre los tokens enrutados a ella y optimizando los expertos por lotes. La LoRA resultante se fusionó en el layout original de safetensors, los expertos se reescribieron en BF16, se eliminaron las escalas de cuantización y se suprimió `quantization_config` de `config.json`. Al final, 15 proyecciones de atención y 247 expertos presentaron cambios distintos de cero. El entrenamiento se realizó en una RTX PRO 6000 Blackwell (96 GB) en Google Colab, usando el commit de transformers que añade soporte para Inkling 2 (PR #51050).

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imagen y texto de entrada (pipeline image-text-to-text): el modelo acepta imágenes junto con prompts textuales.
- Razonamiento con modo "thinking" (bloque de pensamiento cerrado seguido de respuesta), con niveles de esfuerzo configurables (por ejemplo, `none` o `high` según la model card).
- Respuesta directa sin bloque de pensamiento cuando se configura así.
- Comportamiento "decensored": responde a peticiones que el modelo original rechaza, con tasas de rechazo muy reducidas en los conjuntos de evaluación empleados.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y robustez: el modelo permite estudiar cómo la ablación de direcciones de rechazo afecta al comportamiento en tareas dañinas y benignas, comparando las métricas de rechazo y la divergencia KL frente al original y a la versión solo-atención.
- Evaluación de técnicas de decensoring: sirve como caso práctico para analizar el compromiso entre reducción de rechazos y pérdida de calidad (aproximadamente un punto de MMLU en esta versión), con datos reproducibles de Heretic y Optuna.
- Generación de texto creativo sin filtros: para aplicaciones de escritura ficcional o divulgación donde el modelo original rechazaría ciertos temas, con la advertencia de responsabilidad legal del usuario.
- Procesamiento multimodal de documentos: al aceptar imagen y texto, puede emplearse en tareas de descripción o extracción de información a partir de imágenes combinadas con instrucciones textuales, aunque no se detallan capacidades específicas de OCR.
- Despliegue local con llama.cpp: la existencia de una versión GGUF en repo separado permite ejecutar el modelo en entornos sin GPU de datacenter, tras la conversión desde los pesos BF16.
- Experimentación con arquitecturas MoE de grano fino: los 3.072 expertos y las 24 capas permiten estudiar el enrutamiento y el efecto de editar expertos individuales, dado que solo 247 expertos mostraron cambios no nulos tras la ablación.
- Comparación de formatos de pesos: útil para medir el impacto en rendimiento y memoria entre el formato original NVFP4/MXFP8 y la versión BF16 con expertos editados.

## Benchmarks y rendimiento

| Metrica | Original | Version attn | Esta version |
|---|---|---|---|
| Rechazos, respuesta directa, harmful_behaviors (100) | 100/100 | 6/100 | 5/100 |
| Rechazos, respuesta directa, JailbreakBench harmful (100) | 97/100 | 12/100 | 9/100 |
| Rechazos, thinking activado (esfuerzo alto), 100 prompts | 100/100 | 20/100 | 7/97 |
| MMLU, 1.000 preguntas, zero-shot | 78,7% | 78,0% | 77,0% |
| Divergencia KL, primer token de respuesta, 100 prompts benignos | 0 | 0,049 | 0,120 |

Notas de la model card: los rechazos se cuentan con la lista de palabras clave de Heretic sobre los primeros 150 tokens (respuesta directa) o sobre la respuesta final tras el pensamiento (hasta 1.536 tokens). En modo thinking, 3 de 100 respuestas no terminaron dentro del límite de tokens y no se contabilizan. "Respuesta directa" significa bloque de pensamiento vacío y cerrado seguido de la respuesta, que es la posición sobre la que optimizó Heretic. MMLU usa los logits de la letra del siguiente token con esfuerzo de razonamiento `none`, sobre las mismas 1.000 preguntas y semilla para todos los modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 53,4 GB en BF16, por lo que se necesita al menos esa cantidad de memoria para cargar los pesos completos; con overhead de activaciones y contexto, se recomienda 64 GB o más.
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB), usada para el proceso de edición; A100 80 GB o H100 80 GB son opciones razonables para inferencia en BF16.
- ¿Cabe en consumer GPU? No en BF16 completo en GPUs de 24 GB (RTX 4090) o 16 GB; sería necesario recurrir a la versión GGUF cuantizada del repo separado, cuyos requisitos exactos no se detallan en la información disponible.
- Opciones de despliegue: transformers (soportado, requiere el commit con soporte de Inkling 2, PR #51050); llama.cpp tras conversión (soportado); vLLM no carga expertos BF16 para esta arquitectura según la model card.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (harmful_behaviors) | MMLU | Licencia | Formato |
|---|---|---|---|---|---|---|
| Inkling-2-Mini-heretic-full (este) | ~26,4 mil M | no disponible | 5/100 | 77,0% | Apache 2.0 | safetensors BF16 (~53,4 GB) |
| Inkling-2-Mini-heretic (solo atención) | ~26,4 mil M | no disponible | 6/100 | 78,0% | Apache 2.0 | formato oficial (~20 GB) |
| thinkingmachines/Inkling-2-Mini (original) | ~26,4 mil M | no disponible | 100/100 | 78,7% | Apache 2.0 (según este repo) | NVFP4/MXFP8 |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo responde a peticiones que el original rechaza; el usuario es responsable del uso y del cumplimiento de la ley y de la política de uso aceptable del modelo original (thinkingmachines.ai/model-acceptable-use-policy/).
- La ablación reduce los rechazos a costa de calidad: pierde aproximadamente un punto de MMLU respecto al original (77,0% frente a 78,7%) y presenta divergencia KL de 0,120 en el primer token frente a prompts benignos, superior a la versión solo-atención (0,049).
- Solo se evaluó con las métricas indicadas (rechazos, MMLU y KL); no hay evaluación de sesgos, alucinación ni otros dominios en la información disponible.
- vLLM no carga los expertos BF16 de esta arquitectura, lo que limita el despliegue en producción con ese servidor.
- El tamaño de 53,4 GB en BF16 dificulta el despliegue en hardware de consumo sin cuantización adicional (GGUF en repo aparte).
- La longitud de contexto y los idiomas soportados no están disponibles, lo que impide garantizar comportamiento en contextos largos o en castellano.
- Los datos de benchmarks corresponden a conjuntos específicos (harmful_behaviors, JailbreakBench, MMLU) y a configuraciones concretas de esfuerzo de razonamiento; los resultados pueden no generalizarse.
- Al ser una edición de pesos sobre un modelo base de terceros, la licencia Apache 2.0 se hereda, pero conviene verificar las condiciones del modelo original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yanauto/Inkling-2-Mini-heretic-full
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Versión solo-atención: https://huggingface.co/yanauto/Inkling-2-Mini-heretic
- Versión GGUF: https://huggingface.co/yanauto/Inkling-2-Mini-heretic-full-GGUF
- Heretic (herramienta de ablación): https://github.com/p-e-w/heretic
- PR de transformers con soporte para Inkling 2: https://github.com/huggingface/transformers/pull/51050
- Dataset harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset JailbreakBench: https://huggingface.co/datasets/JailbreakBench/JBB-Behaviors
- Política de uso aceptable del modelo original: https://thinkingmachines.ai/model-acceptable-use-policy/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
