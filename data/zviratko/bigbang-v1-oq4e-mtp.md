# zviratko/BigBang-v1-oQ4e-mtp

## Resumen

BigBang-v1-oQ4e-mtp es una cuantización en 4 bits del modelo BigBang-v1, desarrollado por endless-frontier, un laboratorio de investigación que persigue la inteligencia artificial de código abierto. BigBang-v1 es un modelo de lenguaje generalista evolucionado a partir de Qwen3.6-35B-A3B mediante un post-entrenamiento eficiente basado en un marco de datos sintéticos auto-evolutivos y adversariales, diseñado para tareas de investigación verificables en la frontera del conocimiento. Según sus desarrolladores, alcanza un rendimiento agregado entre DeepSeek V4 Flash (284B) y DeepSeek V4 Pro (1.6T), a pesar de tener solo 3 mil millones de parámetros activos. La versión cuantizada que nos ocupa ha sido generada con la librería oMLX (oQ) y está optimizada para ejecutarse en hardware Apple Silicon mediante el framework MLX.

Esta cuantización específica, creada por el usuario zviratko, reduce el modelo original a 4 bits con un grupo de tamaño 64, lo que permite cargar el modelo en equipos con memoria unificada limitada, como los Mac con chips M1 o M4. El repositorio contiene los pesos en formato MLX safetensors, junto con los activos de tokenización y preprocesamiento multimodal necesarios. El archivo cuantizado ocupa aproximadamente 21.6 GB y contiene 6.190.826.416 parámetros en el archivo safetensors, aunque el modelo original tiene 35 mil millones de parámetros en total. Esta ficha se centra en la versión cuantizada, pero se referencia el modelo base para contextos técnicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (Mezcla de Expertos) |
| Parametros totales | 35B (modelo original) / 6.19B (archivo safetensors cuantizado) |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | 131072 tokens (según benchmarks oMLX) |
| Tipos de cuantizacion | 4-bit (oQ4, group size 64, mixed-precision con oQ) |
| Idiomas soportados | no disponible (presumiblemente multilingüe, al derivar de Qwen, pero no confirmado) |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

BigBang-v1 es un modelo de arquitectura Mixture of Experts (MoE) derivado de Qwen3.6-35B-A3B, que tiene 35 mil millones de parámetros totales y 3 mil millones activos por token. El entrenamiento se realizó mediante un post-entrenamiento eficiente basado en un marco adversarial de datos sintéticos auto-evolutivos, orientado a tareas de investigación verificables en la frontera del conocimiento. Según la web oficial, el modelo evoluciona mediante un proceso iterativo en el que se generan datos sintéticos, se evalúan contra problemas reales y se refuerzan los mejores caminos. El modelo resultante tiene capacidades de razonamiento avanzado, incluyendo un modo de pensamiento explícito.

La cuantización de zviratko se realiza con la librería oQ (oMLX v0.6.3rc3), que implementa cuantización de precisión mixta. En este caso, se usa 4 bits con un grupo de 64, lo que reduce significativamente el tamaño y la memoria requerida respecto al modelo original en punto flotante. El formato final es MLX safetensors, diseñado para el framework MLX de Apple, que aprovecha la memoria unificada de los chips Apple Silicon.

## Capacidades

- Generación de texto general, con capacidades de razonamiento complejo y multi-paso.
- Soporte de modo de pensamiento (thinking mode), activable en inferencia (enable_thinking=true en benchmarks).
- Generación de código, especialmente Python, según los benchmarks de oMLX.
- Manejo de contexto largo de hasta 131072 tokens, útil para análisis de documentos extensos.
- Capacidades multilingües presumibles por su origen Qwen, aunque no confirmadas en la documentación.
- No se menciona soporte explícito de tool calling o function calling en la información disponible.
- Capacidades multimodales: el repositorio incluye activos de preprocesamiento multimodal, aunque no se detalla el alcance (posiblemente visión).

## Casos de uso

- Asistente de investigación científica: gracias a su entrenamiento en tareas verificables de frontera, puede ayudar a analizar papers, formular hipótesis y resumir literatura compleja, con un contexto de 131072 tokens para manejar documentos extensos.
- Generación de código en producción: con su capacidad para generar código Python y razonamiento multi-step, puede integrarse en entornos de desarrollo para escribir funciones, refactorizar código o explicar fragmentos complejos.
- Análisis de documentos legales o financieros: el contexto largo permite procesar contratos o informes extensos, extrayendo cláusulas relevantes y resumiendo puntos clave.
- Chatbots de atención al cliente multilingüe: aunque no se confirma el soporte multilingüe, el modelo base Qwen es multilingüe; podría utilizarse para gestionar conversaciones multi-turno en varios idiomas con contexto suficiente para recordar el historial.
- Generación de contenido creativo: gracias a su capacidad de razonamiento y generación de texto, puede crear ensayos, guiones o artículos técnicos con coherencia.
- Prototipado rápido de agentes de razonamiento: su modo thinking y su habilidad para multi-step reasoning lo hacen adecuado para experimentar con agentes que necesitan planificar y ejecutar tareas complejas en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval, GSM8K) en la información disponible. No se dispone de datos numéricos de rendimiento académico.

No obstante, el sitio oMLX ofrece benchmarks de rendimiento de inferencia para este modelo en hardware Apple Silicon:

- En Apple M4 (10 núcleos): se reporta un benchmark con contexto novel (inglés), temperatura 0.6, top_p 0.95, top_k 20, con TurboQuant KV 4-bit y Lightning MTP activados.
- En Apple M1 Pro (16 núcleos): benchmark con contexto de código (Python), max_context_window 131072, max_tokens 131072, con TurboQuant KV 4-bit y Lightning MTP activados.

Estos benchmarks miden velocidad de generación y uso de memoria, pero no se incluyen los valores concretos en la información extraída.

## Requisitos de hardware

- Modelo cuantizado en 4 bits, con un archivo safetensors de 6.19B parámetros, pero el tamaño del repositorio es de 21.6 GB (incluye pesos y activos).
- Se ejecuta con MLX, el framework de Apple para aprendizaje automático, por lo que está optimizado para Apple Silicon (M1, M2, M3, M4, etc.).
- Benchmarks disponibles para M4 (10c) y M1 Pro (16c), lo que indica que funciona en equipos de gama media y alta de Apple.
- VRAM estimada: no disponible. Sin embargo, para cargar el modelo en memoria unificada se necesitan al menos ~22 GB de RAM (según el tamaño del repo). En un Mac con 16 GB de RAM podría ser insuficiente; se recomienda 32 GB o más.
- Opciones de despliegue: MLX, que permite inferencia local en macOS. También podría usarse con herramientas que soporten MLX, aunque no se mencionan otras opciones.
- Latencia y throughput: no disponibles, pero los benchmarks de oMLX sugieren que el modelo está optimizado para velocidad con TurboQuant KV y Lightning MTP.

## Comparativa con modelos similares

No se dispone de datos de comparación directa con otros modelos en la información. El modelo original BigBang-v1 se compara en el sitio oficial con DeepSeek V4 Flash (284B) y DeepSeek V4 Pro (1.6T), indicando que su rendimiento agregado se sitúa entre ambos. Sin embargo, no se proporcionan cifras concretas.

Comparación con el modelo base Qwen3.6-35B-A3B:

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| BigBang-v1 (original) | 35B | 3B | 131072 | no disponible | original |
| BigBang-v1-oQ4e-mtp | 35B (original) / 6.19B (cuantizado) | 3B | 131072 | no disponible | MLX safetensors |
| Qwen3.6-35B-A3B | 35B | 3B | 131072 | Apache 2.0 | safetensors, GGUF, etc. |

La cuantización no altera el número de parámetros del modelo original, pero reduce el tamaño de almacenamiento y memoria. El modelo cuantizado es una alternativa para despliegue en hardware de recursos limitados.

## Limitaciones y advertencias

- La licencia del modelo no está disponible en la información proporcionada. No se puede garantizar el uso comercial sin conocer los términos exactos.
- Al ser una cuantización de 4 bits, puede haber una pérdida de precisión respecto al modelo original en tareas muy exigentes, aunque la técnica de mixed-precision intenta mitigar este efecto.
- El modelo está optimizado para MLX y Apple Silicon; no se menciona soporte para CUDA u otras plataformas.
- No se han publicado resultados de benchmarks académicos, lo que dificulta evaluar su rendimiento en tareas estándar.
- La información sobre el modelo original es escasa y proviene de un sitio web no revisado por pares; se recomienda verificar las capacidades reales antes de usar en producción.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una versión reciente y no ha sido ampliamente probada por la comunidad.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/zviratko/BigBang-v1-oQ4e-mtp
- Modelo original en Hugging Face: https://huggingface.co/endless-frontier/BigBang-v1
- Sitio web de endless-frontier: https://endlessfrontier.tech/
- Benchmarks oMLX para M4: https://omlx.ai/benchmarks/sqwmicui
- Benchmarks oMLX para M1 Pro: https://omlx.ai/benchmarks/i5f1sbeb
- Repositorio oQ (oMLX): https://github.com/jundot/omlx
