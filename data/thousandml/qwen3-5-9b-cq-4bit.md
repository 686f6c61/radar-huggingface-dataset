# thousandml/Qwen3.5-9B-CQ-4bit

## Resumen

Qwen3.5-9B-CQ-4bit es una cuantización de 4 bits del modelo base Qwen3.5-9B-Base, publicada por el usuario thousandml en HuggingFace. El modelo subyacente, desarrollado por el equipo Qwen de Alibaba, es un modelo causal multimodal (texto e imagen) de aproximadamente 9.000 millones de parámetros que combina una arquitectura híbrida de atención lineal (Gated DeltaNet) con atención completa (Gated Attention) y una red de mezcla de expertos dispersa (MoE). Esta variante concreta emplea el esquema de cuantización "CQ" en 4 bits, orientado a reducir el espacio en disco y los requisitos de memoria para inferencia.

El modelo base Qwen3.5-9B destaca por su fusión temprana de tokens multimodales, un contexto nativo de 262.144 tokens extensible hasta 1.010.000, y soporte para 201 idiomas y dialectos. Incorpora además entrenamiento con múltiples pasos de MTP (multi-token prediction) y un encoder de visión, lo que lo sitúa en la categoría image-text-to-text. La relevancia de esta ficha radica en que ofrece capacidades de razonamiento, código y visión en un tamaño que puede desplegarse en hardware de gama alta de consumo, si bien la cuantización a 4 bits introduce compromisos de precisión que conviene evaluar.

El repositorio tiene 33 descargas y 0 likes en el momento de la consulta, un tamaño de 8,0 GB y licencia Apache 2.0. Es importante señalar que los pesos reales en safetensors suman 2.061.668.080 parámetros (aproximadamente 2,06 mil millones), un dato que no coincide con los 9B declarados en la model card del modelo base, por lo que existe una discrepancia entre la denominación comercial y el contenido efectivo del repositorio que el lector debe verificar antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con encoder de visión; híbrido Gated DeltaNet (atención lineal) + Gated Attention + FFN con MoE dispersa |
| Parametros totales | 9B según model card del base; 2.061.668.080 según safetensors del repo cuantizado (dato discrepante) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.010.000 |
| Tipos de cuantizacion | 4 bits (esquema "CQ") |
| Idiomas soportados | 201 idiomas y dialectos (según model card del base); no disponibles en la ficha del repo |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina dos mecanismos de atención en un layout de 32 capas organizado como 8 bloques de la forma 3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN). La Gated DeltaNet emplea 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128; la Gated Attention usa 16 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y dimensión de RoPE de 64. La dimensión oculta es 4096, la dimensión intermedia de la FFN es 12288 y el embedding de tokens (padded) es 248320. El modelo se entrenó con predicción multi-token (MTP) en varios pasos y con fusión temprana de tokens multimodales, lo que permite paridad cross-generacional con Qwen3 y supera a los modelos Qwen3-VL en razonamiento, código, agentes y comprensión visual según el autor.

El entrenamiento incluyó pre-entrenamiento y post-entrenamiento, con escalado de reinforcement learning sobre entornos de millones de agentes y distribuciones de tareas progresivamente complejas. La infraestructura de entrenamiento reporta cerca del 100% de eficiencia multimodal respecto a entrenamiento solo de texto, con frameworks de RL asíncronos para orquestación de agentes a gran escala. No se dispone de datos concretos sobre número de tokens de entrenamiento, composición del dataset ni detalles del esquema de RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento general, con paridad declarada frente a Qwen3 en benchmarks de conocimiento y STEM.
- Comprensión de imágenes y texto (pipeline image-text-to-text), gracias al encoder de visión integrado.
- Generación de código y tareas de agentes, con entrenamiento específico en entornos multi-agente.
- Razonamiento matemático y STEM (resultados MMLU-Pro y MMLU-Redux reportados en la model card del base).
- Capacidades multilingües amplias: 201 idiomas y dialectos según el autor del modelo base.
- Soporte de contexto largo: 262.144 tokens nativos, extensible hasta 1.010.000.
- Predicción multi-token (MTP) entrenada en varios pasos, orientada a decodificación especulativa y mayor throughput.
- Compatibilidad declarada con HuggingFace Transformers, vLLM, SGLang y KTransformers.
- Soporte de tool calling / function calling: no disponible explícitamente en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada para esta variante.

## Casos de uso

- Análisis de documentos largos con imágenes: el contexto nativo de 262.144 tokens permite procesar informes, contratos o expedientes completos junto con sus figuras y tablas en una sola pasada, sin fragmentación.
- Asistencia en investigación científica: el modelo puede resumir artículos con gráficos y ecuaciones, responder preguntas sobre figuras y contrastar resultados numéricos, aprovechando su entrenamiento en STEM y su encoder de visión.
- Generación y revisión de código en pipelines de CI/CD: con compatibilidad con vLLM y SGLang, puede desplegarse como servicio de revisión de parches, generación de tests o explicación de diffs, siempre que se valide la calidad de la cuantización 4 bits en cada caso.
- Atención al cliente multilingüe: los 201 idiomas declarados permiten atender consultas en múltiples mercados con un único modelo, reduciendo la necesidad de modelos por idioma.
- Procesamiento de documentación técnica escaneada: al combinar visión y texto, puede extraer texto de capturas, diagramas y manuales y responder preguntas sobre ellos en un flujo conversacional.
- Agentes autónomos con planificación multi-paso: el entrenamiento en entornos multi-agente y el soporte de contexto largo lo hacen adecuado para orquestar tareas que requieren mantener estado durante muchas interacciones.
- Análisis de imágenes médicas o industriales asistido: como modelo generalista con visión, puede servir de primera capa de triaje o descripción, aunque no sustituye a modelos especializados validados clínicamente.

## Benchmarks y rendimiento

Resultados reportados en la model card del modelo base Qwen3.5-9B (no específicos de la cuantización 4 bits):

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | 80,9 | 82,5 | 79,1 |
| MMLU-Redux | 91,0 | 87,8 | 92,5 | 91,4 | no disponible en el extracto | no disponible en el extracto |

El extracto de la model card se interrumpe en la fila de MMLU-Redux, por lo que no se dispone del resto de resultados (HumanEval, GSM8K, benchmarks visuales, etc.). No se han publicado resultados de benchmarks específicos para la variante cuantizada a 4 bits en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 8,0 GB en disco; con cuantización 4 bits y overhead de activaciones y KV cache, se estima un consumo de VRAM en el rango de 8-12 GB para contextos moderados, aunque no se dispone de mediciones oficiales.
- GPU recomendadas: para el modelo base de 9B en precisión completa se requieren GPUs de 24 GB o más (RTX 4090, A100 40 GB, H100). Para esta variante 4 bits, GPUs de consumo de 12-16 GB (RTX 4070 Ti Super, RTX 4080, RTX 4090) podrían ser suficientes para contextos cortos.
- Cabe en GPU de consumo: probablemente sí en RTX 4090 (24 GB) y posiblemente en RTX 4080 (16 GB) con contexto reducido; verificar empíricamente dado el desajuste de parámetros reportado.
- Opciones de despliegue: HuggingFace Transformers, vLLM, SGLang y KTransformers según la model card del base; llama.cpp y Ollama no están confirmados para este formato "CQ".
- Latencia y throughput: no disponibles. La arquitectura híbrida con Gated DeltaNet y MTP está diseñada para alto throughput y baja latencia, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-CQ-4bit (esta ficha) | 9B declarados / 2,06B en safetensors | 262.144 (ext. 1.010.000) | 82,5 (base) | Apache 2.0 | HuggingFace, 33 descargas |
| Qwen3.5-4B | 4B | no disponible | 79,1 | Apache 2.0 | HuggingFace (oficial) |
| Qwen3-30BA3B-Thinking-2507 | 30B (MoE) | no disponible | 80,9 | Apache 2.0 | HuggingFace (oficial) |
| GPT-OSS-20B | 20B | no disponible | 74,8 | no disponible | no disponible |

La comparativa se limita a los datos presentes en la model card del base. No se dispone de información sobre licencia ni disponibilidad de GPT-OSS-20B en la documentación consultada, por lo que esos campos se marcan como no disponibles.

## Limitaciones y advertencias

- Discrepancia de parámetros: la model card declara 9B, pero los safetensors del repositorio suman 2.061.668.080 parámetros. Verificar la integridad y el contenido real del checkpoint antes de usarlo.
- Cuantización agresiva a 4 bits: puede degradar la precisión en tareas de razonamiento matemático, código y visión; no se han publicado evaluaciones de la variante cuantizada.
- Riesgo de alucinación: inherente a los modelos generativos; en dominios especializados (medicina, derecho, finanzas) requiere verificación humana.
- Sesgos: no se documentan sesgos específicos en la información disponible; el modelo base se entrenó con datos web a gran escala, por lo que es probable que herede sesgos sociales y culturales.
- Idiomas: aunque el base declara 201 idiomas, la ficha del repositorio cuantizado indica "no disponibles"; el rendimiento real en idiomas minoritarios puede ser inferior al de inglés y chino.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar la licencia del modelo base y las condiciones de la cuantización por parte del autor thousandml.
- Repositorio no oficial: publicado por un tercero (thousandml), no por el equipo Qwen; sin garantías de mantenimiento ni soporte.
- Formato "CQ": esquema de cuantización no estándar; puede no ser compatible con todas las herramientas de inferencia (llama.cpp, Ollama) sin conversión previa.
- Contexto largo: aunque se declara extensible a 1.010.000 tokens, el rendimiento efectivo en contextos muy largos no está validado para esta variante.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/thousandml/Qwen3.5-9B-CQ-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Blog oficial Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
