# votruckinsure/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje multimodal de 27.000 millones de parámetros desarrollado por el equipo de Qwen, perteneciente a la nueva generación Qwen3.8. Se trata de un modelo denso con arquitectura híbrida de atención, diseñado para tareas de visión-lenguaje, generación de texto, razonamiento y ejecución de agentes de largo horizonte. Su principal novedad frente a generaciones anteriores es la combinación de capas de atención lineal Gated DeltaNet con capas de atención completa Gated Attention, lo que permite manejar contextos largos de forma eficiente.

El modelo ofrece una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.000.000 de tokens, y soporta de forma nativa la comprensión de imágenes y vídeos, desde diagramas técnicos hasta vídeos de larga duración. Incluye un modo de pensamiento flexible, activado por defecto, que puede desactivarse por petición y ajustarse mediante parámetros como `reasoning_effort` y `preserve_thinking`. Está publicado bajo licencia Apache 2.0 y es compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed, lo que facilita su integración en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo causal de lenguaje con vision encoder, híbrido (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27.781.427.952 (27B) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta 1.000.000 de tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo denso con una arquitectura híbrida de atención compuesta por 64 capas. La disposición interna sigue el patrón 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), lo que significa que por cada 3 capas de atención lineal Gated DeltaNet hay 1 capa de atención completa Gated Attention. En total, 48 capas utilizan atención lineal con estado recurrente constante y 16 capas utilizan atención completa. La dimensión oculta es de 5120, con un embedding de tokens de 248.320 (con padding) y una dimensión intermedia de FFN de 17.408. La atención Gated DeltaNet tiene 48 cabezas para V y 16 para QK con dimensión de cabeza 128; la atención Gated Attention usa 24 cabezas para Q y 4 para KV con dimensión de cabeza 256 y dimensión de RoPE 64.

El modelo ha sido entrenado en dos etapas: pre-training y post-training. Incluye Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que mejora la eficiencia y la calidad de la generación. Los datos de entrenamiento, su composición y si se aplicaron técnicas de alineación como RLHF o DPO no se especifican en la información disponible.

## Capacidades

- Comprensión multimodal nativa: procesa imágenes y vídeos, incluyendo diagramas STEM, documentos escaneados y vídeos de hasta horas de duración.
- Control flexible de pensamiento (thinking mode): activado por defecto, desactivable por petición, con ajuste de profundidad de razonamiento mediante `reasoning_effort` y preservación del contexto de razonamiento histórico mediante `preserve_thinking`.
- Ejecución de agentes de largo horizonte: planificación autónoma y manejo de feedback del entorno, orientado a completar tareas complejas de múltiples pasos de forma fiable.
- Generación de código y razonamiento: mejoras en tareas de programación, trabajo profesional e investigación.
- Compatibilidad con herramientas de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed.
- Soporte de tool calling / function calling: no especificado en la información disponible.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos técnicos con diagramas: el modelo puede interpretar imágenes y diagramas STEM, por lo que resulta adecuado para extraer información de manuales, planos y material científico en formato visual.
- Transcripción y análisis de vídeos largos: gracias a su soporte nativo de vídeo y su contexto extensible, permite procesar horas de grabación para resumir, buscar eventos o extraer conclusiones.
- Agentes autónomos de largo horizonte: su capacidad de planificación y manejo de feedback lo hace útil en flujos de trabajo que requieren encadenar múltiples pasos, como automatización de procesos de oficina o investigación.
- Asistente de desarrollo de software: puede integrarse en entornos de desarrollo para generar código, revisar cambios y razonar sobre arquitecturas de software, aprovechando su ventana de contexto amplia.
- Soporte al cliente multimodal: puede gestionar conversaciones que incluyan imágenes o vídeos enviados por los usuarios, ofreciendo respuestas contextuales y coherentes.
- Investigación asistida: su capacidad de razonamiento y su contexto largo permiten analizar artículos, comparar fuentes y sintetizar información compleja en informes.
- Automatización de tareas profesionales: puede redactar documentos, preparar presentaciones y analizar datos tabulares o visuales, reduciendo la carga de trabajo en entornos corporativos.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card incluye una tabla comparativa con modelos como Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero los valores de rendimiento están truncados y no se pueden extraer de los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27.781 millones de parámetros, en precisión FP16 se requieren aproximadamente 55,6 GB de VRAM, más overhead. Con cuantización de 8 bits se estiman unos 28 GB, y con cuantización de 4 bits unos 14 GB.
- GPU recomendadas: para FP16, se recomiendan GPUs con 80 GB de VRAM como A100 o H100. En cuantización 4-bit, es viable en GPUs de consumo como RTX 4090 (24 GB).
- Opciones de despliegue: vLLM, SGLang, Hugging Face Transformers y TokenSpeed.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de especificaciones técnicas suficientes de los modelos comparables mencionados en la model card (Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max) para realizar una comparativa detallada. La información disponible indica que Qwen3.8-27B es la generación más capaz de la familia Qwen, pero sin datos numéricos que respalden la comparación.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado en la información disponible.
- Riesgo de alucinación: no se ha evaluado de forma explícita en la información proporcionada; se recomienda validar las salidas en aplicaciones críticas.
- Limitaciones de contexto o idioma: los idiomas soportados no se especifican. El contexto extensible hasta 1.000.000 de tokens puede requerir técnicas adicionales de escalado de RoPE.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantengan los avisos de copyright y licencia.
- Advertencia sobre el repositorio: el repositorio de HuggingFace analizado (votruckinsure/Qwen3.8-27B) no es el oficial. Se recomienda utilizar el repositorio de Qwen (Qwen/Qwen3.8-27B) para garantizar la integridad de los pesos y la configuración.

## Enlaces

- Repositorio oficial en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio espejo en HuggingFace: https://huggingface.co/votruckinsure/Qwen3.8-27B
- Receta de despliegue con vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Información del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
