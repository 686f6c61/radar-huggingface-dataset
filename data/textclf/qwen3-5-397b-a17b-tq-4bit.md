# textclf/Qwen3.5-397B-A17B-TQ-4bit

## Resumen

Qwen3.5-397B-A17B es un modelo de lenguaje de gran escala desarrollado por Alibaba Qwen, con una arquitectura híbrida que combina atención lineal (Gated DeltaNet), atención clásica (Gated Attention) y mezcla de expertos (MoE). Se trata de un modelo nativo de visión y lenguaje, entrenado con fusión temprana de tokens multimodales, lo que le permite procesar imágenes y texto de forma unificada. La versión cuantizada a 4 bits que se analiza aquí, publicada por el usuario textclf, reduce los pesos a aproximadamente 58.000 millones de parámetros efectivos y un tamaño de repositorio de 140 GB, lo que facilita su despliegue en entornos con recursos limitados.

El modelo destaca por su amplia cobertura lingüística (201 idiomas y dialectos), una ventana de contexto nativa de 262.144 tokens extensible hasta más de un millón, y un escalado de entrenamiento con aprendizaje por refuerzo en entornos con millones de agentes. Su relevancia actual radica en que ofrece capacidades comparables a modelos propietarios de última generación (GPT-5.2, Claude 4.5 Opus) en razonamiento, generación de código y comprensión visual, pero bajo licencia Apache 2.0 y con pesos abiertos.

La cuantización TQ-4bit mantiene la arquitectura original (60 capas, 512 expertos con 10 activos y 1 compartido) y es compatible con Transformers, vLLM, SGLang y KTransformers. Es una opción atractiva para equipos que necesitan un modelo multimodal de alto rendimiento sin asumir el coste de infraestructura de los 397.000 millones de parámetros completos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (atención lineal) + Gated Attention + MoE (512 expertos, 10 activos + 1 compartido) |
| Parámetros totales | 397.000 millones (original); 57.993.054.192 (pesos cuantizados a 4 bits) |
| Parámetros activos | 17.000 millones |
| Longitud de contexto | 262.144 tokens nativa, extensible a 1.010.000 |
| Tipos de cuantización | TQ-4bit (esta versión); el modelo original admite cuantizaciones adicionales (BF16, FP8, GGUF) |
| Idiomas soportados | 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

La arquitectura combina capas de atención lineal (Gated DeltaNet) con capas de atención clásica (Gated Attention) y un bloque MoE con 512 expertos de los que se activan 10 más uno compartido. La disposición interna es de 60 capas organizadas en bloques de 15 unidades: cada bloque contiene tres subgrupos de una capa Gated DeltaNet seguida de MoE, y una capa Gated Attention seguida de MoE. Esta hibridación busca reducir el coste de inferencia manteniendo la calidad de la atención completa en tramos críticos.

El entrenamiento se realizó en dos fases: pre-entrenamiento y post-entrenamiento. La fusión temprana de tokens multimodales permite un entrenamiento casi al 100 % de eficiencia respecto al texto solo. El post-entrenamiento incluye aprendizaje por refuerzo (RL) escalado a entornos con millones de agentes y distribuciones de tareas progresivamente complejas. El modelo también incluye un módulo MTP (multi-step training) que mejora la capacidad de planificación de múltiples pasos. No se dispone de datos concretos sobre el número de tokens de pre-entrenamiento ni la composición exacta del dataset en la información facilitada.

## Capacidades

- Generación de texto y razonamiento complejo: resolución de problemas lógicos, matemáticos y de conocimiento general.
- Comprensión visual: entrada de imágenes (pipeline image-text-to-text) con rendimiento comparable a modelos especializados en visión (Qwen3-VL).
- Generación de código: soporte de lenguajes de programación y razonamiento algorítmico.
- Tool calling / function calling: puede invocar herramientas y APIs externas.
- Capacidades de agente: razonamiento multi-paso y orquestación de tareas complejas con scaffolding de agentes.
- Multilingüismo: 201 idiomas y dialectos, con comprensión cultural y regional.
- Modo de pensamiento: el modelo puede generar razonamientos largos y estructurados antes de responder (thinking mode), aunque no se detalla si es un modo explícito o implícito.
- Generación de texto en streaming y conversación multi-turno.

## Casos de uso

- Asistente de atención al cliente multilingüe: con soporte de 201 idiomas y contexto de 262K tokens, puede mantener conversaciones largas y coherentes en diversos idiomas, integrándose con sistemas de tickets y bases de conocimiento.
- Generación de código en producción: con tool calling y razonamiento multi-paso, puede integrarse en pipelines de CI/CD para generar, revisar y documentar código, o en asistentes de programación en tiempo real.
- Análisis de documentos extensos: la ventana de 262K tokens permite procesar contratos, informes o libros completos en una sola pasada, extrayendo resúmenes y respondiendo preguntas específicas.
- Agentes autónomos de investigación: el modelo puede planificar y ejecutar búsquedas, leer y resumir fuentes, y producir informes estructurados, gracias a su capacidad de razonamiento multi-paso.
- Análisis de imágenes y texto combinados: útil en aplicaciones de inspección visual, documentación técnica con diagramas, o moderación de contenido que requiere entender tanto la imagen como el texto asociado.
- Traducción y localización: con 201 idiomas, sirve como motor de traducción y adaptación cultural para productos globales.
- Chat interactivo con memoria larga: permite aplicaciones de asistencia personal que recuerdan interacciones pasadas durante sesiones prolongadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la cuantización TQ-4bit. Los datos de la model card del modelo original (Qwen3.5-397B-A17B) incluyen una tabla comparativa con GPT-5.2, Claude 4.5 Opus, Gemini-3 Pro, Qwen3-Max-Thinking y K2.5-1T-A32B, pero la información extraída está incompleta. El único dato disponible es MMLU-Pro: Qwen3.5-397B-A17B obtiene un valor no especificado (el número no se ha podido leer en la fuente). Se recomienda consultar el blog oficial de Qwen para resultados completos.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio de pesos cuantizados a 4 bits ocupa 140 GB. Para cargar el modelo completo en memoria se necesitan al menos 140 GB de VRAM, aunque con técnicas de offloading a CPU o memoria unificada puede reducirse el requisito.
- GPU recomendadas: 8x B200 (80 GB) para el modelo original según Lambda Labs; para la versión 4-bit, 4x A100 (80 GB) o 4x H100 (80 GB) son suficientes en configuración multi-GPU. No es viable en GPUs de consumo (RTX 4090 con 24 GB no es suficiente).
- Opciones de despliegue: vLLM, SGLang, KTransformers y Transformers (compatibilidad declarada en el repositorio).
- Latencia y throughput: no se han publicado mediciones específicas para esta cuantización. En el modelo original, la arquitectura MoE con 17B activos permite una latencia razonable, pero los valores concretos dependen del hardware y del backend elegido.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-397B-A17B (este) | 397B | 17B | 262K (1M) | Apache 2.0 | Abierta |
| K2.5-1T-A32B | 1T | 32B | no disponible | no disponible | no disponible |
| Qwen3-Max-Thinking | no disponible | no disponible | no disponible | no disponible | API propietaria |
| GPT-5.2 | no disponible | no disponible | no disponible | no disponible | API propietaria |

No se dispone de información pública suficiente para comparar de forma rigurosa con modelos de código abierto de la misma categoría (p. ej., DeepSeek-R1 o Qwen3-235B). La comparativa anterior se basa únicamente en los datos de la model card del modelo original.

## Limitaciones y advertencias

- La cuantización a 4 bits puede provocar una degradación de calidad en tareas de precisión (matemáticas avanzadas, razonamiento lógico complejo) respecto al modelo original.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en contextos de baja confianza.
- El soporte de 201 idiomas puede ser asimétrico: idiomas con menos datos de entrenamiento pueden mostrar un rendimiento inferior.
- Aunque la licencia es Apache 2.0, es necesario verificar el cumplimiento de las políticas de uso del modelo base (Qwen) para despliegues comerciales.
- El despliegue en producción requiere infraestructura multi-GPU de alta gama; no es adecuado para entornos con recursos limitados o edge computing.
- La ventana de contexto de 262K tokens puede degradarse en eficiencia al extenderse hasta el millón de tokens; se recomienda validar el comportamiento en tareas de contexto largo.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/textcl/Qwen3.5-397B-A17B-TQ-4bit
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-397B-A17B
- Cuantización alternativa (TitanML): https://huggingface.co/TitanML/Qwen3.5-397B-A17B
- Documentación de Alibaba Cloud: https://help.aliyun.com/en/model-studio/qwen3-5-397b-a17b
- Guía de despliegue en Lambda: https://lambda.ai/inference-models/qwen/qwen3.5-397b-a17b
- Blog oficial de Qwen: https://qwen.ai/blog?id=qwen3.5
