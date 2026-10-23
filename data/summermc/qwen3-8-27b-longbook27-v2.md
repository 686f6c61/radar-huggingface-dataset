# summerMC/Qwen3.8-27B-Longbook27-v2

## Resumen

Qwen3.8-27B-Longbook27-v2 es un modelo de lenguaje de 27 072 285 696 parámetros (aproximadamente 27B) publicado por el usuario summerMC en HuggingFace, especializado en comprensión y generación de texto de formato largo: libros, artículos científicos e informes extensos. Se distribuye como un fine-tune de un modelo base Qwen (no identificado explícitamente en la model card) sobre una arquitectura personalizada denominada `qwen3_5_gdn24`, que incorpora capas de atención lineal Gated DeltaNet, y se envía como código remoto dentro del propio repositorio.

La relevancia del modelo está en su enfoque: no compite por benchmarks generalistas, sino por el procesamiento de entradas a escala de libro con un coste de atención potencialmente menor gracias a las capas lineales. La versión v2 se presenta como una refinación de comportamiento y calidad de salida respecto a v1. El modelo solo declara inglés y japonés como idiomas soportados, y su licencia es Apache 2.0 según los metadatos, aunque la model card remite a la licencia del modelo base Qwen.

Se trata de un modelo con cero descargas y cero likes en el momento de la ficha, lo que implica que no existe validación independiente de su calidad ni de sus resultados. El requisito de `trust_remote_code=True` añade una capa de riesgo operativo que debe evaluarse antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `qwen3_5_gdn24` (código personalizado), híbrida con capas de atención lineal Gated DeltaNet |
| Parámetros totales | 27 072 285 696 (aproximadamente 27B) |
| Parámetros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (la model card indica "book-scale inputs" sin cifra concreta) |
| Tipos de cuantización | bf16 y 4-bit NF4 (bitsandbytes, con doble cuantización); no se mencionan GGUF ni otras |
| Idiomas soportados | inglés (en) y japonés (ja) |
| Licencia | apache-2.0 en metadatos; la model card indica que sigue la licencia del modelo base Qwen |
| Formato de pesos | safetensors, bf16 (aproximadamente 54 GB); repositorio de 54,2 GB |
| Plantilla de chat | estilo ChatML, con soporte de `enable_thinking` |
| Librería | transformers, con `trust_remote_code=True` obligatorio |

## Arquitectura y entrenamiento

La arquitectura declarada es `qwen3_5_gdn24`, un diseño personalizado que combina capas de atención lineal Gated DeltaNet con atención convencional (modelo híbrido). El código de modelado (`modeling_qwen35_gdn24.py`) y las operaciones fusionadas (`fused_ops.py`) se distribuyen dentro del repositorio y deben cargarse con `trust_remote_code=True`. El modelo incluye kernels opcionales acelerados mediante los paquetes `flash-linear-attention` y `causal-conv1d`; sin ellos, la inferencia funciona igualmente con una implementación de referencia en PyTorch más lenta. El modelo requiere cargar todos los pesos en GPU: el offloading a CPU no está soportado por los kernels personalizados y falla con el error `Tensor on device meta`.

No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset, el proceso de alineación (RLHF, DPO u otros) ni los detalles del fine-tune que da lugar a la versión v2. La model card solo indica que v2 mejora el comportamiento y la calidad de salida respecto a v1. Tampoco se especifica la identidad exacta del modelo base Qwen sobre el que se construye.

## Capacidades

- Generación de texto de formato largo: resúmenes, continuación de textos y redacción extensa.
- Comprensión de documentos largos a escala de libro, capítulo a capítulo, con instrucciones de fidelidad al texto fuente.
- Resumen extractivo y abstractivo con decodificación greedy recomendada por el autor para maximizar la fidelidad.
- Respuesta a preguntas sobre documentos extensos (QA sobre texto largo).
- Modo de razonamiento opcional mediante `enable_thinking=True` en la plantilla de chat, a costa de generar más tokens.
- Conversación multi-turno con plantilla estilo ChatML.
- Multilingüismo limitado a inglés y japonés.
- No se declara soporte de tool calling, function calling, agentes, visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- Resumen de libros por capítulos: el modelo está entrenado específicamente para entradas a escala de libro; se le pasa el texto completo y se solicita un resumen estructurado por capítulos, con `do_sample=False` para favorecer la fidelidad al original.
- QA sobre documentación técnica extensa: carga de manuales o especificaciones de cientos de páginas y consultas concretas sobre su contenido, aprovechando la atención lineal para reducir el coste asociado a secuencias largas.
- Análisis de artículos científicos: extracción de metodología, resultados y limitaciones de papers completos en una sola pasada, sin troceado previo del documento.
- Generación de informes largos en inglés o japonés: redacción de documentos extensos con estructura coherente, usando muestreo (`temperature=0.7`, `top_p=0.8`, `top_k=20`) para contenido creativo.
- Continuación de manuscritos y textos literarios: el modelo admite continuación de texto largo manteniendo el hilo narrativo dentro de su ventana de contexto.
- Procesamiento de documentación corporativa en japonés: resumen de actas, informes internos y documentación de producto para empresas con operaciones en Japón, uno de los dos idiomas declarados.
- Preprocesado para pipelines RAG: generación de resúmenes jerárquicos de documentos antes de indexarlos, reduciendo el número de fragmentos necesarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, RULER ni de tareas de comprensión de contexto largo, ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM en bf16: aproximadamente 54 GB. Requiere GPU de clase A100 80 GB o H100.
- VRAM en 4-bit NF4: aproximadamente 17 GB, lo que permite ejecución en GPU de 24 GB.
- GPU de consumo: viable en tarjetas de 24 GB (por ejemplo, RTX 3090 o RTX 4090) únicamente con cuantización 4-bit NF4 y doble cuantización.
- El modelo completo debe residir en una sola GPU: `device_map={"": 0}`. El offloading a CPU no está soportado y provoca el error `Tensor on device meta`.
- Dependencias: `transformers`, `accelerate` y `bitsandbytes`. Opcionales para acelerar las capas de atención lineal: `flash-linear-attention` y `causal-conv1d` (este último con `--no-build-isolation`).
- Opciones de despliegue documentadas: únicamente transformers con código remoto. No se mencionan vLLM, llama.cpp, Ollama ni TGI; su compatibilidad es no disponible.
- Latencia y throughput: no disponibles. El consumo de memoria crece con la longitud de la entrada según advierte el autor.

## Comparativa con modelos similares

No se dispone de datos verificables sobre modelos comparables en la información proporcionada. La model card no identifica el modelo base Qwen concreto ni ofrece métricas frente a alternativas, por lo que no es posible establecer una comparación numérica rigurosa.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| Qwen3.8-27B-Longbook27-v2 | 27B | no disponible | apache-2.0 (metadatos) | HuggingFace, código remoto obligatorio | no disponible |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El uso de memoria crece con la longitud de la entrada, lo que encarece las inferencias sobre documentos muy extensos.
- El autor advierte explícitamente de que los resúmenes pueden añadir detalles no presentes en el texto original; es necesario verificar la salida contra la fuente.
- Riesgo de alucinación en tareas de resumen y QA sobre documentos largos, agravado por la ausencia de benchmarks publicados.
- Solo se declaran inglés y japonés; el rendimiento en castellano no está documentado ni respaldado.
- `trust_remote_code=True` ejecuta código del repositorio (`modeling_qwen35_gdn24.py`, `fused_ops.py`). En entornos sensibles debe revisarse el código y fijarse una `revision` concreta.
- Discrepancia de licencia: los metadatos indican apache-2.0, mientras que la model card afirma que sigue la licencia del modelo base Qwen. Conviene confirmar los términos antes de un uso comercial.
- No se permite offloading a CPU, lo que limita el despliegue en entornos sin GPU de gran capacidad.
- Modelo con cero descargas y cero likes: sin validación independiente, sin informes de terceros y sin garantías de mantenimiento.
- No se documentan sesgos conocidos, pero al ser un fine-tune de un base no identificado, hereda los sesgos de este, que no son auditables con la información disponible.
- No hay soporte declarado de tool calling ni de flujos de agentes, lo que descarta su uso en pipelines que dependan de function calling.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/summerMC/Qwen3.8-27B-Longbook27-v2
- Código de modelado: https://huggingface.co/summerMC/Qwen3.8-27B-Longbook27-v2/blob/main/modeling_qwen35_gdn24.py
- Operaciones fusionadas: https://huggingface.co/summerMC/Qwen3.8-27B-Longbook27-v2/blob/main/fused_ops.py
- Paquete de kernels de atención lineal: `flash-linear-attention` (pip)
- Paquete de convolución causal: `causal-conv1d` (pip, instalación con `--no-build-isolation`)
- Paper, blog o demo oficial: no disponible en la información proporcionada
