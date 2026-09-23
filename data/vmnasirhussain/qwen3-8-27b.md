# vmnasirhussain/Qwen3.8-27B

# Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo denso de 27.781.427.952 parámetros (27,8 B) desarrollado por el equipo Qwen de Alibaba, presentado como la generación más capaz hasta la fecha de su familia de modelos abiertos. Se trata de un modelo de lenguaje causal con encoder de visión integrado (vision-language model nativo), lo que le permite procesar texto, imágenes y vídeo con los mismos pesos. Su objetivo declarado es cubrir codificación, trabajo profesional, investigación y tareas agénticas de horizonte largo con finalización fiable de extremo a extremo, en un tamaño que sigue siendo desplegable en hardware local.

La arquitectura es híbrida: combina capas de atención lineal (Gated DeltaNet) con capas de atención completa (Gated Attention) en un patrón repetido 16 veces, con 64 capas totales y una dimensión oculta de 5120. Esta mezcla reduce el coste de caché KV en contextos largos, ya que solo 16 de las 64 capas mantienen caché de atención clásica. El modelo soporta 262.144 tokens de contexto de forma nativa, extensible hasta 1.000.000, y fue entrenado con Multi-Token Prediction (MTP) en varios pasos, además de un modo de razonamiento explícito que viene activado por defecto y puede desactivarse por petición.

El modelo se distribuye bajo licencia Apache 2.0 y pesos en formato safetensors, con compatibilidad declarada con Transformers, vLLM, SGLang y TokenSpeed. Existe también una versión alojada en QwenCloud con 1M de contexto por defecto y herramientas integradas oficiales. Es relevante ahora porque empuja capacidades de agente autónomo y comprensión de vídeo a un tamaño de 27B ejecutable en estaciones de trabajo y GPUs de consumo con cuantización, algo que hasta hace poco requería modelos notablemente mayores. Nota importante: el repositorio de HuggingFace analizado es una réplica publicada por un tercero (`vmnasirhussain`), con 0 descargas y 0 likes, no el repositorio oficial del equipo Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con encoder de visión; híbrida de atención lineal (Gated DeltaNet) y atención completa (Gated Attention) |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos en safetensors, 55,6 GB, equivalente a ~16 bits por parámetro) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato HuggingFace Transformers) |
| Dimension oculta | 5120 |
| Numero de capas | 64 (16 × [3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)]) |
| Cabezas de atencion | Gated Attention: 24 para Q, 4 para KV, dimensión de cabeza 256, RoPE dim 64; Gated DeltaNet: 48 cabezas lineales para V y 16 para QK, dimensión de cabeza 128 |
| Dimension intermedia FFN | 17.408 |
| Vocabulario / embeddings | 248.320 (padded) |
| Entrenamiento adicional | Multi-Token Prediction (MTP) con múltiples pasos |
| Tamano del repositorio | 55,6 GB |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El bloque de lenguaje es un transformer causal denso que alterna dos mecanismos de atención en un patrón fijo: por cada capa de atención completa (Gated Attention) hay tres capas de atención lineal basada en Gated DeltaNet. Cada capa va seguida de su FFN. Las capas de atención completa usan 24 cabezas de consulta y solo 4 de clave/valor con dimensión de cabeza 256, lo que ya reduce la caché KV; las capas de Gated DeltaNet emplean 48 cabezas lineales para V y 16 para QK con dimensión 128, que no requieren caché KV creciente. El resultado es un coste de memoria de contexto muy inferior al de un transformer denso equivalente de 64 capas, algo crítico para ventanas de 256k tokens o más.

El modelo incorpora un encoder de visión que lo convierte en un VLM nativo capaz de procesar imágenes y vídeo de hasta una hora de duración, según la documentación del autor. El entrenamiento cubre dos etapas declaradas, pre-entrenamiento y post-entrenamiento, e incluye Multi-Token Prediction con varios pasos, una técnica que permite al modelo predecir más de un token futuro por posición y que los frameworks de inferencia aprovechan para acelerar la decodificación. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF, DPO u otras técnicas de alineamiento concretas. Sí se documenta un control flexible del razonamiento: modo thinking activado por defecto, desactivable por petición, profundidad de razonamiento ajustable mediante `reasoning_effort` y retención del contexto de razonamiento de mensajes históricos mediante `preserve_thinking`.

## Capacidades

- Generación de texto y razonamiento complejo con modo thinking configurable (activado por defecto, desactivable por petición, con control de profundidad vía `reasoning_effort`).
- Codificación y tareas de terminal de carácter agéntico: la model card referencia explícitamente Terminal Bench 2.1 (Terminus) como benchmark de codificación agéntica en terminal.
- Planificación autónoma y manejo de retroalimentación del entorno para completar tareas de extremo a extremo de horizonte largo.
- Comprensión nativa de imágenes: diagramas STEM, documentos escaneados, capturas de pantalla, gráficos y fotografías.
- Comprensión de vídeo de larga duración (descrita como "hour-scale" en la model card).
- Predicción multi-token (MTP) entrenada en varios pasos, aprovechable para acelerar la inferencia en frameworks compatibles.
- Integración con harnesses y herramientas de desarrollo populares para agentes; la versión alojada en QwenCloud incluye herramientas integradas oficiales.
- Capacidades multilingües: no disponible (no se documentan los idiomas soportados).
- Tool calling / function calling: no se detalla el formato ni el soporte explícito en la información disponible, más allá de la orientación agéntica del modelo.

## Casos de uso

- Codificación agéntica en terminal: el modelo está optimizado para operar en entornos de línea de comandos, interpretar la salida de comandos y encadenar acciones hasta resolver una tarea de ingeniería, lo que encaja con benchmarks como Terminal Bench 2.1 (Terminus).
- Copiloto de código sobre repositorios completos: los 262.144 tokens de contexto nativo permiten cargar módulos, tests y ficheros de configuración de un proyecto mediano en una sola ventana, evitando troceados agresivos en pipelines de RAG.
- Automatización de oficina y extracción documental: la visión nativa permite procesar facturas, contratos o informes en PDF escaneado, extraer tablas y campos estructurados y volcarlos a un sistema de gestión sin OCR externo.
- Análisis de documentación técnica y diagramas: interpretación de esquemáticos, diagramas de bloques, gráficas de resultados y figuras de artículos científicos, con razonamiento posterior sobre el contenido extraído.
- Procesamiento de vídeo largo: resumen, indexación y búsqueda semántica sobre grabaciones de hasta una hora (reuniones, clases, material de archivo) combinando comprensión visual y de audio transcrito.
- Atención al cliente multimodal: gestión de conversaciones multi-turno en las que el usuario adjunta capturas de pantalla o fotos de producto, con razonamiento sobre el estado del pedido o del error mostrado.
- Investigación asistida sobre corpus extensos: revisión de literatura donde se cargan decenas de artículos en una ventana de 262k tokens y se pide síntesis comparativa con trazabilidad a las fuentes.
- Despliegue en local con requisitos de privacidad: con cuantización de 4 bits el modelo cabe en GPUs de consumo, lo que permite entornos sanitarios, legales o industriales donde los datos no pueden salir de la infraestructura propia.
- Integración en CI/CD: generación y revisión automática de código en pipelines, con capacidad de encadenar pasos (leer logs de fallo, proponer parche, ejecutar tests) si se le dota de las herramientas adecuadas.
- Asistencia sobre documentos financieros o legales con contexto largo: análisis de cláusulas cruzadas en contratos extensos sin perder referencias entre secciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye una tabla comparativa de rendimiento que enfrenta a Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max en categorías como codificación (con la fila "Agentic terminal coding — Terminal Bench 2.1 (Terminus)"). Sin embargo, los valores numéricos de dicha tabla no estaban disponibles en la información recuperada, por lo que no se reproducen aquí. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar. No se inventan números.

## Requisitos de hardware

- Pesos en precisión completa (bf16/fp16, ~55,6 GB): requieren una GPU de 80 GB (H100, A100 80 GB) o reparto en tensor parallel sobre 2× 48 GB (A6000, L40S) o 2× 32 GB (RTX 5090).
- Cuantización de 8 bits (~28 GB): cabe en una única GPU de 48 GB (A6000, L40S) con margen para caché; en 32 GB (RTX 5090) queda muy ajustado y obliga a contexto reducido.
- Cuantización de 4 bits (~16-17 GB estimados): cabe en GPU de consumo de 24 GB (RTX 4090, RTX 3090, RTX 4080 Super) y con holgura en 32 GB (RTX 5090). Es la vía recomendada para uso local en una sola tarjeta.
- Memoria unificada: AMD documenta soporte día 0 para Ryzen AI Max (PCs con IA agéntica) y GPUs Radeon, lo que abre el despliegue en equipos sin GPU dedicada de gran VRAM.
- Caché KV: gracias al diseño híbrido, solo 16 de las 64 capas mantienen caché KV. Con 4 cabezas KV, dimensión 256 y precisión bf16, el coste estimado es de ~64 KiB por token, es decir, alrededor de 16 GB para los 262.144 tokens nativos (y ~8 GB en FP8). Llenar la ventana completa sigue siendo el factor dominante de memoria. Estimación propia a partir de la configuración publicada, no un dato oficial.
- Frameworks de despliegue confirmados: HuggingFace Transformers, vLLM, SGLang y TokenSpeed. También Microsoft Foundry (Azure AI) y Alibaba Cloud Model Studio como servicios gestionados, y QwenCloud para la API oficial (anunciada como "coming soon" con 1M de contexto y herramientas integradas).
- Soporte GGUF / llama.cpp / Ollama: no disponible (no confirmado en la información proporcionada).
- Latencia y throughput: no disponible (no se publican cifras de tokens por segundo para ningún hardware).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27,8 B denso | 262.144 nativo, hasta 1.000.000 | apache-2.0 | Pesos en HF (réplica de tercero), vLLM, SGLang, TokenSpeed, Foundry, Model Studio | VLM nativo, atención híbrida, MTP, thinking control |
| Qwen3.6-27B | 27 B (dato de la card, no verificado) | no disponible | no disponible | no disponible | Generación anterior; el autor lo sitúa como referencia de mejora en codificación y productividad de oficina |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | API gestionada | Usado como referencia en la tabla comparativa de la card |
| Muse Glimmer-30B | 30 B (según denominación) | no disponible | no disponible | no disponible | Usado como referencia en la tabla comparativa de la card |
| Opus4.6 Max | no disponible | no disponible | propietaria probablemente | API cerrada | Usado como referencia externa en la tabla comparativa de la card |

No se dispone de cifras de rendimiento comparadas, por lo que la comparativa se limita a parámetros, contexto, licencia y vías de disponibilidad. Para Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max no había datos verificables en la información recuperada más allá de su mención como referencias en la tabla de la model card.

## Limitaciones y advertencias

- El repositorio de HuggingFace analizado (`vmnasirhussain/Qwen3.8-27B`) es una publicación de un tercero, con 0 descargas, 0 likes y creado y actualizado el mismo día. No es el repositorio oficial de Alibaba y los pesos no están verificados por el equipo Qwen; para producción conviene localizar la publicación canónica.
- No se documentan los idiomas soportados, lo que impide garantizar un rendimiento homogéneo fuera de los idiomas mayoritarios de entrenamiento. En aplicaciones en castellano habría que validar con evaluación propia.
- No hay datos publicados de sesgos, evaluación de seguridad ni tasas de alucinación para este modelo.
- El modo thinking está activado por defecto, lo que incrementa latencia y consumo de tokens de salida; en producción conviene desactivarlo por petición o ajustar `reasoning_effort` según el caso.
- La ventana de 262.144 tokens consume una cantidad muy elevada de memoria de caché KV en bf16 (del orden de 16 GB estimados); usar la extensión a 1.000.000 tokens exige configuración adicional de escalado posicional y hardware muy sobredimensionado.
- El procesamiento de vídeo de una hora de duración es computacionalmente costoso y puede degradar la latencia de forma impredecible según la resolución y el número de fotogramas muestreados.
- La licencia Apache 2.0 permite uso comercial de los pesos, pero la model card remite a servicios oficiales (QwenCloud, Alibaba Cloud Model Studio) para las capacidades gestionadas; verificar los términos de marca y de uso de la API si se integran esos servicios.
- No se confirma soporte GGUF ni compatibilidad con llama.cpp u Ollama, lo que limita las opciones de despliegue en entornos de solo CPU o con GPUs muy modestas.
- Los pesos ocupan 55,6 GB en el repositorio; la descarga y el almacenamiento requieren planificación previa.

## Enlaces

- Repositorio de HuggingFace analizado: https://huggingface.co/vmnasirhussain/Qwen3.8-27B
- Repositorio GitHub oficial (Alibaba Cloud): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Documentación en Alibaba Cloud Model Studio: https://www.alibabacloud.com/help/en/model-studio/qwen3-8-27b
- Página del modelo en QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
- Catálogo de Microsoft Foundry: https://ai.azure.com/catalog/models/qwen--qwen3.8-27b
- Blog de AMD sobre ejecución en Ryzen AI Max y Radeon: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
