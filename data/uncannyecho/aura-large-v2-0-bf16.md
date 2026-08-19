# UncannyEcho/Aura-Large-v2.0-BF16

## Resumen

Aura-Large-v2.0-BF16 es un modelo de lenguaje causal con encoder de visión, publicado por el usuario UncannyEcho en Hugging Face. Aunque el repositorio se denomina "Aura-Large", la model card lo identifica como "Qwen3.8-27B", lo que sugiere que se trata de una versión post-entrenada de la familia Qwen3.8. Es un modelo denso de 27.781 millones de parámetros (27,78B) con una arquitectura híbrida que combina Gated DeltaNet (atención lineal) y Gated Attention (atención clásica), diseñado para tareas de razonamiento, codificación, agente autónomo y comprensión de imágenes y vídeo.

El modelo destaca por su contexto nativo de 262.144 tokens, extensible hasta 1.000.000, y por incorporar un modo de pensamiento flexible que puede activarse o desactivarse por petición, con control de profundidad de razonamiento. Está pensado para entornos de producción y es compatible con herramientas como vLLM, SGLang y TokenSpeed. Su licencia Apache 2.0 permite uso comercial sin restricciones. La relevancia actual radica en que ofrece capacidades de nivel frontier en un formato compacto de 27B, con soporte nativo de visión y agente, algo poco común en modelos de este tamaño.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo, extensible a 1.000.000 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura de transformer causal con encoder de visión. El bloque de lenguaje consta de 64 capas con una dimensión oculta de 5.120. La disposición interna es de 16 bloques, cada uno compuesto por 3 sub-bloques de Gated DeltaNet seguidos de FFN, y un sub-bloque de Gated Attention seguido de FFN. Gated DeltaNet emplea 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. Gated Attention usa 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de 64 dimensiones. El FFN tiene dimensión intermedia de 17.408. Además, se entrena con Multi-Token Prediction (MTP) en múltiples pasos, lo que mejora la eficiencia de decodificación.

El entrenamiento comprende fases de pre-entrenamiento y post-entrenamiento, aunque no se especifican detalles sobre el volumen de tokens, composición del dataset ni técnicas de alineación como RLHF o DPO. La model card indica que el modelo es nativo para visión-lenguaje, capaz de entender imágenes y vídeos, desde diagramas STEM hasta documentos y vídeos de una hora de duración.

## Capacidades

- Generación de texto y razonamiento complejo, con mejoras en codificación, trabajo profesional e investigación.
- Comprensión de imágenes y vídeos: análisis de diagramas STEM, documentos escaneados, y vídeos de larga duración (hasta una hora).
- Modo de pensamiento flexible: activado por defecto, se puede desactivar por petición; permite ajustar la profundidad de razonamiento mediante `reasoning_effort` y conservar el contexto de razonamiento histórico con `preserve_thinking`.
- Ejecución de agentes autónomos: planificación autónoma, manejo de feedback del entorno y finalización fiable de tareas multi-paso.
- Soporte de tool calling y function calling (implícito en las capacidades de agente).
- Compatibilidad con múltiples frameworks de inferencia: Hugging Face Transformers, vLLM, SGLang y TokenSpeed.
- Contexto largo nativo de 262K tokens, extensible a 1M, adecuado para tareas que requieren memoria extensa.

## Casos de uso

- Agente de codificación en terminal: el modelo puede ejecutar tareas de codificación agéntica en un terminal, como lo demuestra su participación en Terminal Bench 2.1 (Terminus). Es adecuado para automatizar flujos de desarrollo, depuración y refactorización de código en entornos CI/CD.
- Análisis de documentos técnicos con imágenes: gracias a su encoder de visión, puede procesar documentos que contienen diagramas, gráficos y fórmulas, extrayendo información estructurada para informes o bases de conocimiento.
- Asistente de investigación científica: con su contexto de 262K tokens y modo de pensamiento profundo, puede analizar largos artículos, resumir hallazgos y razonar sobre hipótesis, ayudando a investigadores en revisiones bibliográficas.
- Automatización de tareas multi-paso en entornos empresariales: su capacidad de agente le permite planificar y ejecutar secuencias de acciones (consultas a APIs, manipulación de datos, generación de informes) con supervisión mínima.
- Resumen y análisis de vídeos de larga duración: puede procesar vídeos de hasta una hora para generar resúmenes, detectar eventos clave o transcribir contenido, útil para equipos de soporte o seguridad.
- Chat conversacional con contexto prolongado: su ventana de 262K tokens permite mantener conversaciones muy largas con memoria completa, ideal para asistentes virtuales en atención al cliente o tutorías personalizadas.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparando Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, en la categoría de "Agentic terminal coding" (Terminal Bench 2.1). Sin embargo, los valores numéricos no están disponibles en la información proporcionada, ya que el texto se corta antes de mostrar las cifras. No se han publicado resultados completos de benchmarks en la información disponible.

## Requisitos de hardware

- El modelo tiene 27,78B parámetros en BF16, lo que implica un peso de aproximadamente 55,6 GB (2 bytes por parámetro). El repositorio ocupa 55,6 GB, confirmando este cálculo.
- Para inferencia en BF16 se necesitan al menos 56 GB de VRAM, por lo que se requiere una GPU de 80 GB (A100, H100) o varias GPUs de 48 GB (A6000, L40S) en paralelo.
- No se especifican cuantizaciones oficiales, pero con cuantización de 8 bits (no confirmada) el modelo podría caber en una GPU de 32 GB, y con 4 bits en una de 16 GB, aunque esto no está verificado.
- En cuanto a GPUs de consumo, una RTX 4090 (24 GB) no sería suficiente para BF16, pero podría ser viable con cuantización de 4 bits si estuviera disponible.
- Opciones de despliegue: compatible con vLLM, SGLang, TokenSpeed y Hugging Face Transformers. También se menciona un servicio gestionado en Qwen Cloud (próximamente).
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

La model card menciona comparaciones con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero no se dispone de especificaciones detalladas de estos modelos en la información proporcionada. No se puede realizar una comparativa cuantitativa fiable. Se recomienda consultar la tabla de benchmarks en la model card original para obtener los valores completos.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos, riesgos de alucinación o limitaciones idiomáticas. Se desconoce el conjunto de idiomas soportados.
- El contexto nativo de 262K tokens es amplio, pero la extensión a 1M puede degradar el rendimiento en tareas que requieren precisión extrema en posiciones lejanas.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo es grande y requiere infraestructura de alto coste para producción.
- La model card no especifica el proceso de alineación (RLHF/DPO), por lo que el comportamiento en entornos sensibles debe validarse empíricamente.
- El nombre del repositorio ("Aura-Large") difiere del nombre en la model card ("Qwen3.8-27B"), lo que puede generar confusión sobre el origen y la procedencia exacta del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/UncannyEcho/Aura-Large-v2.0-BF16
- Colección Aura Large: https://huggingface.co/collections/UncannyEcho/aura-large
- Sitio web de Uncanny Echo: https://uncannyecho.com/
- Versión anterior (Aura-Large-v1): https://huggingface.co/UncannyEcho/Aura-Large-v1-BF16
