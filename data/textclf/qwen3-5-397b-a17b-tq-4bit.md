# textclf/Qwen3.5-397B-A17B-TQ-4bit

## Resumen

Qwen3.5-397B-A17B es un modelo fundacional multimodal desarrollado por el equipo Qwen de Alibaba, publicado bajo licencia Apache 2.0. Se trata de un modelo de lenguaje causal con codificador de visión, construido sobre una arquitectura híbrida que combina Gated Delta Networks (atención lineal) con un Mixture-of-Experts disperso. Con 397.000 millones de parámetros totales y 17.000 millones activados por token, está diseñado para ofrecer un rendimiento de frontera con un coste de inferencia notablemente inferior al de un modelo denso de tamaño equivalente.

La relevancia del modelo radica en tres ejes: fusión temprana de tokens multimodales (visión y texto se entrenan conjuntamente desde el preentrenamiento, no como un adaptador posterior), una ventana de contexto nativa de 262.144 tokens extensible hasta 1.010.000, y un entrenamiento de RL escalado sobre entornos multiagente. El modelo declara soporte para 201 idiomas y dialectos.

El repositorio aquí referenciado (`textclf/Qwen3.5-397B-A17B-TQ-4bit`) es una cuantización a 4 bits del modelo original, publicada por un tercero (textclf), no por el equipo Qwen. Conviene tener presente esta distinción: la model card reproduce la documentación oficial de Qwen, pero los pesos alojados en este repositorio son una conversión comunitaria. Los metadatos de safetensors del repo declaran 7.808.206.832 parámetros, un dato que no cuadra con los 397B del modelo original y que debe interpretarse con cautela (posible recuento parcial o de un shard).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM con codificador de visión; híbrida Gated DeltaNet (atención lineal) + Gated Attention + MoE disperso |
| Parametros totales | 397B (modelo original); 7.808.206.832 según safetensors del repo de cuantización (dato inconsistente) |
| Parametros activos | 17B (10 expertos enrutados + 1 compartido por token) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantizacion | 4 bits (TQ-4bit) en este repo; el original se distribuye en BF16 |
| Idiomas soportados | 201 idiomas y dialectos (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

El modelo emplea un layout de 60 capas organizado en 15 bloques repetidos, cada uno compuesto por tres subcapas de Gated DeltaNet seguidas de MoE y una subcapa de Gated Attention seguida de MoE. La dimensión oculta es 4096. Las capas de atención lineal usan 64 cabezas para V y 16 para QK con dimensión de cabeza 128; las capas de atención completa usan 32 cabezas para Q y 2 para KV con dimensión 256 y RoPE de 64 dimensiones. El MoE cuenta con 512 expertos, de los cuales se activan 10 enrutados más 1 compartido, con dimensión intermedia de experto de 1024. El vocabulario tiene 248.320 entradas (con padding). El modelo incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que habilita decodificación especulativa nativa.

El entrenamiento combina preentrenamiento y postentrenamiento con fusión temprana de tokens multimodales, lo que según el autor permite paridad intergeneracional con Qwen3 y supera a Qwen3-VL en razonamiento, código, agentes y comprensión visual. El RL se escala sobre entornos de millones de agentes con distribuciones de tareas progresivamente complejas. La infraestructura de entrenamiento declara cerca del 100 % de eficiencia multimodal respecto a entrenamiento solo-texto, con frameworks de RL asíncronos para orquestación de entornos a gran escala.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento (thinking) implícito en la variante Qwen3-Max-Thinking y en el linaje Qwen3.5.
- Comprensión de imagen y texto (pipeline `image-text-to-text`): el modelo acepta entradas visuales junto a texto.
- Generación de código y matemáticas, con benchmarks declarados en la model card (ver sección de benchmarks).
- Soporte de tool calling y function calling, con herramientas integradas en la versión alojada Qwen3.5-Plus.
- Capacidades de agente: razonamiento multi-paso y orquestación en entornos multiagente, entrenado explícitamente para ello.
- Multilingüismo amplio: 201 idiomas y dialectos.
- Contexto largo: 262K nativos, extensible a ~1M, apto para documentos extensos y conversaciones de muchas vueltas.
- Decodificación especulativa mediante MTP.

## Casos de uso

- Atención al cliente automatizada: con 262K tokens de contexto nativo, el modelo puede mantener conversaciones multi-turno largas y arrastrar el historial completo de un cliente sin resumir, reduciendo la pérdida de información en interacciones prolongadas.
- Análisis de documentación técnica extensa: ingestión de manuales, contratos o bases de código de cientos de miles de tokens en una sola pasada, con extracción de respuestas citadas y razonamiento sobre secciones distantes.
- Agentes autónomos de software: el soporte de tool calling y el entrenamiento en entornos multiagente lo hacen adecuado para pipelines donde el modelo planifica, invoca herramientas y verifica resultados en varios pasos.
- Generación de código en producción: integración en CI/CD para revisión de parches, generación de tests y explicación de diffs, con la ventaja del bajo coste por token que aporta activar solo 17B de parámetros.
- Asistencia multimodal en soporte técnico: subida de capturas de pantalla, diagramas o fotos de errores junto a la consulta de texto, con el codificador de visión procesando la imagen en el mismo contexto.
- Investigación y análisis multilingüe: procesamiento de corpus en decenas de idiomas con un único modelo, útil para equipos que operan en mercados con cobertura lingüística amplia.
- Despliegue en infraestructura propia con cuantización 4 bits: la versión TQ-4bit reduce el peso en disco y memoria respecto al BF16, permitiendo servir el modelo en clústeres más modestos que los requeridos por el original.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con GPT-5.2, Claude 4.5 Opus, Gemini-3 Pro, Qwen3-Max-Thinking y K2.5-1T-A32B. Los datos reproducidos en la información disponible son parciales (la tabla aparece truncada). Los valores disponibles para Qwen3.5-397B-A17B son:

| Benchmark | Qwen3.5-397B-A17B | GPT-5.2 | Claude 4.5 Opus | Gemini-3 Pro | Qwen3-Max-Thinking | K2.5-1T-A32B |
|---|---|---|---|---|---|---|
| MMLU-Pro | no disponible (truncado) | 87.4 | 89.5 | 89.8 | 85.7 | 87.1 |

No se han publicado en la información disponible el resto de resultados de la tabla (razonamiento, código, agentes, visión) ni los valores de Qwen3.5-397B-A17B para MMLU-Pro, ya que la captura está cortada. No se inventan cifras adicionales.

## Requisitos de hardware

- VRAM estimada: el modelo original en BF16 requiere aproximadamente 794 GB solo para pesos (397B × 2 bytes), más overhead de KV cache y activaciones. La versión TQ-4bit reduce los pesos a unos 200 GB teóricos, aunque el tamaño del repo es de 216,6 GB, lo que es coherente con pesos a 4 bits más metadatos.
- GPU recomendadas: para BF16, clústeres de 8×H100 80 GB o 8×A100 80 GB como mínimo, con tensor parallelism. Para la versión 4 bits, 4×H100 80 GB o 8×A100 40 GB podrían ser viables según la estrategia de sharding.
- Consumer GPU: no cabe en una sola GPU de consumo (RTX 4090 24 GB, RTX 5090 32 GB). Requiere despliegue multi-GPU o descarga a disco con offloading agresivo, lo que degrada la latencia de forma severa.
- Opciones de despliegue: transformers, vLLM, SGLang y KTransformers según la model card. llama.cpp y Ollama no están confirmados para esta arquitectura híbrida.
- Latencia y throughput: no disponibles en la información proporcionada. La arquitectura híbrida y la activación de solo 17B por token sugieren un throughput superior al de un denso de 397B, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-397B-A17B | 397B / 17B | 262K nativo, hasta 1M | Apache 2.0 | Pesos abiertos en HF |
| K2.5-1T-A32B | 1T / 32B | no disponible | no disponible | Referenciado en benchmarks |
| Qwen3-Max-Thinking | no disponible | no disponible | Propietaria (API) | Solo API |
| GPT-5.2 | no disponible | no disponible | Propietaria | Solo API |
| Claude 4.5 Opus | no disponible | no disponible | Propietaria | Solo API |
| Gemini-3 Pro | no disponible | no disponible | Propietaria | Solo API |

Frente a los modelos propietarios de la comparativa, la ventaja de Qwen3.5-397B-A17B es la disponibilidad de pesos bajo Apache 2.0 y el coste de inferencia reducido por la activación dispersa. Frente a K2.5-1T-A32B, ofrece menos parámetros totales y activos, con contexto declarado explícitamente. No se dispone de datos de rendimiento completos para establecer una comparación cuantitativa rigurosa más allá del MMLU-Pro parcial.

## Limitaciones y advertencias

- La cuantización TQ-4bit es una conversión de terceros (textclf), no oficial de Qwen. Puede introducir degradación en tareas sensibles a precisión (matemáticas, código, visión) y no está respaldada por el equipo original.
- Los metadatos de safetensors del repo (7.808.206.832 parámetros) no coinciden con los 397B declarados en la model card; verificar la integridad de los pesos antes de usarlos en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala, especialmente en dominios especializados y con contexto muy largo.
- Sesgos: no se documentan en la información disponible; cabe esperar sesgos derivados de los datos de preentrenamiento web y de la cobertura desigual entre los 201 idiomas declarados.
- Idiomas: aunque se declaran 201, el rendimiento por idioma no está cuantificado; los idiomas de bajos recursos probablemente rindan peor.
- Licencia Apache 2.0 permite uso comercial, pero la model card enlaza a la licencia del modelo original de Qwen; conviene revisar los términos exactos del repo original.
- Requisitos de hardware muy elevados: no es desplegable en una GPU de consumo, lo que limita su uso a entornos con infraestructura de clúster.
- La tabla de benchmarks está truncada en la información disponible; no debe citarse como evidencia completa de rendimiento.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/textclf/Qwen3.5-397B-A17B-TQ-4bit
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-397B-A17B
- Licencia del original: https://huggingface.co/Qwen/Qwen3.5-397B-A17B/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- API gestionada (Alibaba Cloud Model Studio): https://modelstudio.alibabacloud.com/
- Guía de usuario de Model Studio: https://www.alibabacloud.com/help/en/model-studio/text-generation
