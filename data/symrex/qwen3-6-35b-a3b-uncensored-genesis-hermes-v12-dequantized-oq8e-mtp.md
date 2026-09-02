# symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12-dequantized-oQ8e-mtp

## Resumen

El modelo `symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12-dequantized-oQ8e-mtp` es una cuantización en 8 bits del modelo base Qwen3.6-35B-A3B, un modelo de arquitectura Mixture-of-Experts (MoE) desarrollado por Alibaba. La versión cuantizada ha sido producida por el usuario de HuggingFace `symrex` utilizando la herramienta oQ (oMLX v0.6.4) con precisión mixta, y está optimizada para ejecutarse en hardware Apple Silicon mediante la librería MLX.

El nombre del repositorio indica que se trata de una variante "Uncensored" con fine-tuning estilo "Genesis Hermes", lo que sugiere un entrenamiento orientado a reducir restricciones de contenido y a seguir instrucciones en formato Hermes. El modelo base presenta 35 mil millones de parámetros totales con 3 mil millones activos por token, una ventana de contexto de 262.000 tokens y capacidades multimodales, aunque esta versión cuantizada solo incluye pesos en formato MLX safetensors.

Esta ficha se centra en la versión cuantizada publicada por `symrex`, que actualmente no tiene descargas ni valoraciones. La información disponible sobre el modelo base proviene de guías y documentación externa, por lo que algunos datos técnicos se indican como "no disponible" cuando no se han podido verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (Mixture-of-Experts) |
| Parametros totales | 10.433.743.792 (según safetensors del repo) |
| Parametros activos | 3 mil millones (estimado según nombre del modelo base) |
| Longitud de contexto | 262.000 tokens (según guías externas del modelo base) |
| Tipos de cuantizacion | 8 bits, grupo de 64 (oQ8e) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B utiliza una arquitectura MoE con 35 mil millones de parámetros totales y 3 mil millones activos por token, lo que permite una inferencia eficiente en términos de cómputo. La versión cuantizada de `symrex` aplica una cuantización de precisión mixta de 8 bits con grupo de tamaño 64, utilizando la herramienta oQ de oMLX v0.6.4. Esta cuantización reduce el tamaño del modelo para facilitar su ejecución en dispositivos Apple Silicon.

El nombre "Uncensored-Genesis-Hermes-V12" sugiere que el modelo ha pasado por un fine-tuning adicional sobre el modelo base, probablemente con datos orientados a eliminar restricciones de contenido y a mejorar el seguimiento de instrucciones en el estilo Hermes. Sin embargo, no se dispone de información detallada sobre el proceso de entrenamiento, el dataset utilizado ni si se aplicaron técnicas como RLHF o DPO. El repositorio no incluye documentación adicional más allá de la nota de cuantización.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen3.6, se espera que herede las capacidades de razonamiento y generación del modelo original, incluyendo tareas complejas de lógica y análisis.
- Soporte de tool calling / function calling: según las guías externas, el modelo base Qwen3.6-35B-A3B incluye soporte para llamadas a herramientas, lo que permite su integración en agentes y pipelines automatizados.
- Capacidades multimodales: el modelo base soporta entrada de imágenes, aunque esta versión cuantizada no especifica si se conservan dichas capacidades en el formato MLX.
- Modo "uncensored": el fine-tuning de la variante Genesis Hermes busca reducir las restricciones de contenido, permitiendo respuestas más directas en temas sensibles, aunque esto conlleva riesgos adicionales.
- Generación de código: el modelo base está optimizado para tareas de programación, incluyendo generación, revisión y depuración de código en múltiples lenguajes.
- Multilingüismo: no se han publicado datos concretos sobre los idiomas soportados en esta versión cuantizada.

## Casos de uso

- Asistentes de programación locales: un desarrollador puede usar este modelo en un Mac con Apple Silicon para generar código, explicar fragmentos existentes o sugerir refactorizaciones. Su tamaño reducido en 8 bits permite cargarlo en memoria unificada de 32 GB o más.
- Agentes autónomos con tool calling: gracias al soporte de function calling del modelo base, se puede integrar en frameworks de agentes como LangChain o LlamaIndex para ejecutar tareas que requieren consultar APIs, bases de datos o ejecutar comandos.
- Análisis de documentos largos: con una ventana de contexto de 262.000 tokens, el modelo puede procesar libros técnicos completos, informes extensos o repositorios de código de gran tamaño en una sola pasada, facilitando resúmenes y extracción de información.
- Generación de contenido creativo sin filtros: la variante "uncensored" puede utilizarse para redacción de ficción, guiones o diálogos en los que se requiera un tono más libre y menos restrictivo que el de los modelos comerciales.
- Automatización de atención al cliente: aunque no está optimizado específicamente para ello, su capacidad de razonamiento y contexto largo permite gestionar conversaciones multi-turno con historial extenso, siempre que se implemente un sistema de moderación externo para mitigar los riesgos del modo "uncensored".
- Investigación académica en generación de texto: investigadores pueden utilizar este modelo como base para estudiar los efectos de la cuantización 8-bit en tareas de razonamiento y generación, comparando su rendimiento con la versión sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de HuggingFace no incluye métricas de evaluación, y las guías externas encontradas no proporcionan datos numéricos sobre el rendimiento de esta versión cuantizada específica. Para el modelo base Qwen3.6-35B-A3B, se sabe que supera a sus predecesores en tareas de agente y codificación, pero no se dispone de cifras concretas verificables.

## Requisitos de hardware

- El modelo está diseñado para ejecutarse en Apple Silicon mediante la librería MLX. Se recomienda un Mac con chip M1 Pro, M2 Pro, M3 Pro o superior.
- El tamaño del repositorio es de 38.6 GB, lo que sugiere que los pesos en 8 bits ocupan aproximadamente ese espacio. Para cargar el modelo en memoria unificada se necesitan al menos 48 GB de RAM, aunque podría funcionar con 32 GB si se utiliza swapping.
- No se ha confirmado si el modelo puede ejecutarse en GPUs NVIDIA mediante otros frameworks, ya que el formato MLX es específico de Apple.
- Para inferencia en producción, se puede utilizar el servidor MLX incluido en oMLX o integrar el modelo en aplicaciones Python con la librería mlx-lm.
- La latencia dependerá del hardware concreto. En un Mac con M3 Max, se espera una velocidad de generación de entre 15 y 30 tokens por segundo para un modelo MoE de este tamaño, aunque estos valores son estimaciones basadas en modelos similares.

## Comparativa con modelos similares

La siguiente comparativa se basa en información pública sobre el modelo base Qwen3.6-35B-A3B y otras versiones cuantizadas disponibles, ya que no existen datos oficiales de la variante específica de `symrex`.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia |
|---|---|---|---|---|
| Qwen3.6-35B-A3B (original) | 35B totales, 3B activos | 262K | fp16 | Apache 2.0 (según Qwen) |
| symrex Qwen3.6-35B-A3B ... oQ8e (este) | 10.4B (según safetensors) | 262K (heredado) | 8-bit MLX | no disponible |
| symrex Qwen3.6-35B-A3B ... oQ3e (V6) | similar | 262K | 3-bit MLX | no disponible |
| Qwen3.6-35B-A3B GGUF (versiones comunitarias) | 35B | 262K | GGUF Q4_K_M, Q5_K_M, etc. | Apache 2.0 |

La principal diferencia entre esta versión y las alternativas GGUF es el formato: MLX está optimizado para Apple Silicon, mientras que GGUF se ejecuta en llama.cpp y Ollama en cualquier hardware. La licencia de esta versión concreta no está especificada, lo que supone un riesgo para uso comercial.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no indica ninguna licencia, lo que impide su uso comercial sin autorización explícita del autor. Se recomienda contactar con `symrex` antes de cualquier despliegue en producción.
- Riesgo de contenido inapropiado: la variante "uncensored" puede generar respuestas ofensivas, sesgadas o peligrosas. No es adecuada para aplicaciones orientadas al público general sin un sistema de moderación robusto.
- Sesgos y alucinaciones: al ser un modelo fine-tuneado sin documentación sobre el dataset de entrenamiento, no se puede garantizar la fiabilidad de las respuestas. Es probable que herede los sesgos del modelo base y que presente alucinaciones en temas factuales.
- Datos técnicos incompletos: la información sobre idiomas, licencia y parámetros activos no está disponible en el repositorio. El número de parámetros totales reportado en safetensors (10.4B) no coincide con los 35B del modelo base, lo que sugiere que podría tratarse de un error o de una representación diferente de los pesos cuantizados.
- Compatibilidad limitada: al ser un formato MLX, solo se puede ejecutar en hardware Apple Silicon. No es posible utilizarlo en servidores con GPUs NVIDIA sin convertirlo previamente a otro formato.
- Sin mantenimiento confirmado: el repositorio no muestra actividad reciente ni soporte, por lo que es probable que no reciba actualizaciones ni correcciones de errores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12-dequantized-oQ8e-mtp
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
- Guía GGUF de Qwen3.6-35B Genesis Hermes (2026): https://cldnavi.com/en/blog/qwen36-35b-genesis-hermes-guide-2026/
- Guía GGUF de Qwen3.6-35B-A3B Genesis Hermes V11: https://hackernoon.com/qwen36-35b-a3b-genesis-hermes-v11-complete-gguf-guide
- Página del modelo en Ollama: https://ollama.com/library/qwen3.6:35b-a3b
- Versión V6 con cuantización oQ3e: https://huggingface.co/symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V6-dequantized-oQ3e-mtp
- Versión V6 con cuantización oQ8e: https://huggingface.co/symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V6-dequantized-oQ8e-mtp
