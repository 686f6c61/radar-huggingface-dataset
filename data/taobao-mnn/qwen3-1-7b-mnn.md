# taobao-mnn/Qwen3-1.7B-MNN

## Resumen

Qwen3-1.7B-MNN es una exportación cuantizada del modelo Qwen3-1.7B de Alibaba, empaquetada en formato MNN por el equipo taobao-mnn. El modelo original Qwen3-1.7B es un transformer decoder-only de 1.700 millones de parámetros, ajustado con instrucciones y orientado a generación de texto, razonamiento y conversación. Esta versión MNN aplica cuantización de 4 bits a los pesos lineales y de 8 bits a la cabeza LM, con el objetivo de ejecutar el modelo de forma eficiente en CPU y dispositivos de borde sin necesidad de GPUs dedicadas.

La relevancia de esta ficha radica en que MNN es el motor de inferencia de código abierto de Alibaba, optimizado para despliegue en móvil y escritorio. Esta exportación concreta (refresh del 2026-11-09) exige MNN 3.6.2 o superior e incorpora fusión de proyecciones y normalizaciones, así como embeddings de entrada y cabeza LM compartidos y cuantizados. El resultado es un paquete de 4 GB que permite ejecutar un LLM de 1.7B parámetros en hardware modesto, con validación de alineamiento FP32 prefill/decode sobre CPU x64.

El modelo conserva la licencia Apache 2.0 del Qwen3 original y está etiquetado para chino (cn), aunque el modelo base Qwen3 soporta múltiples idiomas. Esta exportación está pensada para desarrolladores que quieran integrar un LLM pequeño en aplicaciones MNN nativas, entornos móviles o pipelines de inferencia en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (model-type: transformer) |
| Parametros totales | 1.700 millones (1.7B, segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Pesos lineales 4-bit group 64; LM head 8-bit group 64; HQQ; embeddings de entrada/cabeza LM compartidos y cuantizados |
| Idiomas soportados | Chino (cn) etiquetado; el modelo base Qwen3 es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | MNN (exportado con llmexport de MNN) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-1.7B, un transformer decoder-only de la familia Qwen3. Esta exportación MNN no reentrena el modelo: parte de los pesos de Qwen3-1.7B y los convierte mediante la herramienta `llmexport` del repositorio MNN. La exportación aplica cuantización HQQ (Half-Quadratic Quantization) a los pesos lineales en 4 bits con grupo de 64, y 8 bits con grupo de 64 a la cabeza LM. Además, se comparten y cuantizan los embeddings de entrada y la cabeza LM, y se aplica fusión de proyecciones y normalizaciones (projection/norm fusion) junto con transformer fusion.

El refresh del 2026-11-09 se exportó con el commit `b0239771b07b317a258fbc384683bbd540741406` de MNN y requiere MNN 3.6.2 o superior. Se validó el alineamiento FP32 prefill/decode entre el modelo fuente y el exportador, las plantillas de chat y los token IDs, la generación en chino, aritmética, traducción corta y traducción con contexto de ~900 tokens, la parada natural y la integridad de pesos externos, todo sobre CPU x64. No se validaron en este refresh ARM CPU FP16, Metal, OpenCL, Vulkan ni CUDA. No se dispone de información sobre el dataset de entrenamiento, número de tokens, RLHF/DPO ni innovaciones de decodificación del modelo original en la información proporcionada.

## Capacidades

- Generación de texto en chino (validada en esta exportación) y, por herencia del modelo base Qwen3, capacidad multilingüe.
- Razonamiento aritmético básico (validado en las pruebas de corrección del exportador).
- Traducción corta y traducción con contexto de aproximadamente 900 tokens (validada).
- Conversación multi-turno mediante plantillas de chat (chat templates y token IDs verificados).
- Parada natural de generación (natural stopping) verificada.
- Ejecución en CPU x64 mediante el runtime MNN con transformer fusion.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información proporcionada para esta exportación.

## Casos de uso

- Asistentes conversacionales en aplicaciones móviles: el modelo puede integrarse en apps Android/iOS mediante MNN, gestionando conversaciones multi-turno con plantillas de chat verificadas y pesos cuantizados de 4 bits que reducen el uso de memoria.
- Traducción en dispositivo: las pruebas de traducción corta y de ~900 tokens sobre CPU x64 indican que el modelo puede usarse para traducción local sin conexión, adecuado para privacidad de datos.
- Procesamiento de texto en el borde (edge computing): despliegue en dispositivos con CPU ARM o x64 sin GPU, aprovechando el runtime MNN y la cuantización HQQ para reducir el tamaño del modelo a 4 GB de repositorio.
- Generación de texto en aplicaciones de escritorio: integración mediante `llm_demo` de MNN en herramientas de escritorio que necesiten resumen, redacción o respuestas automáticas en chino.
- Prototipado rápido de LLMs en CPU: investigadores que quieran evaluar un modelo de 1.7B parámetros en hardware sin GPU pueden usar esta exportación como base reproducible con alineamiento FP32 verificado.
- Pipelines de inferencia embebida: aplicaciones industriales o de automoción que requieran un LLM pequeño ejecutándose en tiempo real sobre CPU, con control de memoria mediante `MNN_LOW_MEMORY=true`.
- Educación y demos: ejecución de un LLM de 1.7B en portátiles convencionales para demostraciones de generación de texto y razonamiento básico sin infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que las comprobaciones realizadas son de tipo smoke/correctness y no un benchmark de precisión ni una garantía de identidad token a token con el modelo sin cuantizar.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica directamente, ya que esta exportación está orientada a CPU; el repositorio ocupa 4 GB y los pesos lineales están en 4 bits (grupo 64) y la cabeza LM en 8 bits (grupo 64).
- GPU recomendadas: no se han validado CUDA, Metal, OpenCL ni Vulkan en este refresh; el soporte GPU de MNN existe pero no está verificado para esta exportación concreta.
- CPU: validado en CPU x64. ARM CPU FP16 no validado en este refresh.
- ¿Cabe en GPU consumer? No hay datos de validación GPU en esta exportación; el modelo base de 1.7B en 4 bits podría caber en GPUs consumer, pero no está verificado para este paquete MNN.
- Opciones de despliegue: runtime MNN (compilado con `MNN_LOW_MEMORY=true`, `MNN_CPU_WEIGHT_DEQUANT_GEMM=true`, `MNN_BUILD_LLM=true`, `MNN_SUPPORT_TRANSFORMER_FUSE=true`), ejecutable `llm_demo`. Requiere MNN 3.6.2 o superior.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato | Validacion |
|---|---|---|---|---|---|---|
| Qwen3-1.7B-MNN (este) | 1.7B | no disponible | 4-bit lineales / 8-bit LM head (HQQ) | Apache 2.0 | MNN | CPU x64 validado; GPU/ARM no validado en refresh |
| Qwen3-1.7B (original) | 1.7B | no disponible en esta ficha | FP16/BF16 (tipico) | Apache 2.0 | safetensors | Modelo fuente de referencia |
| Otros modelos MNN de tamano similar | no disponible | no disponible | no disponible | no disponible | MNN | no disponible |

No se dispone de datos de benchmarks ni de comparativas de rendimiento con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Esta exportación solo ha sido validada en CPU x64; ARM CPU FP16, Metal, OpenCL, Vulkan y CUDA no están validados en el refresh del 2026-11-09.
- Las comprobaciones del autor son de corrección (smoke tests), no un benchmark de precisión; no se garantiza identidad token a token con el modelo sin cuantizar.
- La cuantización a 4 bits puede degradar la calidad respecto al modelo original Qwen3-1.7B en tareas complejas.
- Requiere MNN 3.6.2 o superior con soporte de transformer fusion; runtimes anteriores no son compatibles con esta exportación.
- Es necesario descargar todos los archivos actualizados juntos y limpiar cachés antiguas de modelo, pesos y KV antes de cargar; no se deben mezclar archivos de revisiones anteriores.
- El etiquetado de idioma es únicamente chino (cn); el soporte multilingüe depende del modelo base y no está verificado en esta exportación.
- No se dispone de información sobre sesgos, riesgo de alucinación específico ni restricciones adicionales de la licencia Apache 2.0 más allá de las estándar.
- El modelo base Qwen3-1.7B puede tener limitaciones de contexto y conocimiento; no se dispone de la longitud de contexto en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/taobao-mnn/Qwen3-1.7B-MNN
- ModelScope: https://www.modelscope.cn/models/MNN/Qwen3-1.7B-MNN
- Repositorio MNN: https://github.com/alibaba/MNN
- Herramienta llmexport: https://github.com/alibaba/MNN/tree/master/transformers/llm/export
- Documentación MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
- Modelo base Qwen3-1.7B: no disponible en la información proporcionada
