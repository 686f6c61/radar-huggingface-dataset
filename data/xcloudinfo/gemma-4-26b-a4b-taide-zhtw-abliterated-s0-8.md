# xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW-abliterated-s0.8

## Resumen

Gemma-4-26B-A4B-TAIDE-zhTW-abliterated-s0.8 es un modelo de lenguaje multimodal desarrollado por la empresa taiwanesa xCloudinfo (云碩科技). Se basa en el modelo `xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW`, que a su vez es una adaptación del modelo `google/gemma-4-26B-A4B-it` de Google DeepMind, especializada en chino tradicional de Taiwán mediante técnicas de destilación con datos del proyecto TAIDE.

La característica diferencial de esta versión es que ha sido sometida a un proceso de "abliteración" con intensidad 0,8, una técnica de ortogonalización de pesos que elimina la dirección de rechazo del modelo, debilitando significativamente sus mecanismos de negativa ante solicitudes que normalmente activarían las políticas de seguridad. El modelo mantiene intactas sus capacidades de razonamiento, generación de texto y visión, pero con una tendencia reducida a rechazar peticiones.

El modelo cuenta con 25.806 millones de parámetros totales (aproximadamente 26B) con una arquitectura de mezcla de expertos (MoE) que activa solo 4 mil millones de parámetros por token, lo que lo hace notablemente eficiente para su tamaño. Está disponible en formato safetensors en versión bf16 y pesa 51,6 GB en el repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE) de 128 expertos |
| Parámetros totales | 25.805.933.872 (≈26B) |
| Parámetros activos | ≈4B (A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (versión base en bf16; existe versión GGUF separada) |
| Idiomas soportados | chino (tradicional, variante de Taiwán) principalmente; conserva capacidades multilingües del modelo base |
| Licencia | Apache-2.0 (con condiciones adicionales: licencia de modelo TAIDE y Gemma 4 License) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 4 de Google DeepMind, una familia de modelos multimodales de código abierto que combina arquitecturas densas y de mezcla de expertos. En este caso, se trata de la variante de 26B parámetros totales con 4B activos, que utiliza 128 expertos en su capa MoE. El modelo es nativamente multimodal: puede procesar tanto texto como imágenes gracias a un codificador de visión que permanece intacto en este adaptación.

El proceso de entrenamiento original de la variante TAIDE consistió en una adaptación de baja clasificación (LoRA) en bf16, utilizando datos de auto-instrucción en chino tradicional de Taiwán destilados del modelo `taide/Gemma-3-TAIDE-12b-Chat`. Esta adaptación se aplicó únicamente al módulo de lenguaje, sin modificar el codificador de visión, conservando así las capacidades multimodales del modelo base.

La versión abliterada aplica la técnica propuesta por Arditi et al. (2024), que consiste en una ortogonalización de los pesos para eliminar la "dirección de rechazo" del modelo. Se aplica con una intensidad de 0,8 sobre las capas de embedding de tokens, la proyección de atención o_proj, las proyecciones down_proj densas y las down_proj de los 128 expertos MoE. Este proceso no requiere reentrenamiento y solo afecta al modelo de lenguaje, manteniendo el visor de visión sin cambios.

## Capacidades

- Generación de texto en chino tradicional con un enfoque específico en el uso de Taiwán, incluyendo modismos y expresiones locales.
- Comprensión y razonamiento multimodal: el modelo puede procesar imágenes y responder preguntas sobre su contenido visual.
- Razonamiento complejo y resolución de problemas en varios dominios, heredados de la familia Gemma 4.
- Generación de código en diversos lenguajes de programación, una capacidad común en los modelos Gemma 4.
- Capacidades multilingües básicas del modelo base, aunque su especialización principal es el chino tradicional.
- Ausencia de mecanismos de rechazo por seguridad: el modelo no rechaza solicitudes que normalmente activarían las salvaguardas de otros modelos, lo que permite una generación menos restringida.
- Capacidad de conversación y diálogo multiturno gracias a su entrenamiento con datos de chat.

## Casos de uso

- Generación de contenido creativo en chino tradicional: el modelo puede producir ficción, poesía, guiones o artículos sin las restricciones típicas de los modelos comerciales, siendo útil para escritores y creadores que trabajan en contextos culturales de Taiwán.
- Investigación académica sobre alineación y seguridad de IA: su naturaleza "abliterada" lo convierte en un objeto de estudio para investigadores que analizan cómo se pueden eliminar los mecanismos de rechazo y qué efectos tienen sobre el comportamiento del modelo.
- Desarrollo de asistentes virtuales para el mercado taiwanés: su dominio del chino tradicional y su capacidad multimodal permiten crear asistentes que entienden texto e imágenes, con un tono más natural y menos restrictivo.
- Análisis de imágenes médicas o técnicas con descripción en chino: el modelo puede interpretar imágenes y generar informes descriptivos en el idioma objetivo, aunque sin garantías de exactitud médica.
- Traducción y adaptación de contenido técnico: su capacidad multilingüe y su especialización en chino lo hacen útil para traducir y localizar documentación técnica al chino tradicional.
- Prototipado de aplicaciones de IA generativa con restricciones de seguridad personalizadas: dado que el modelo no tiene filtros internos, permite a los desarrolladores implementar sus propios sistemas de seguridad y moderación adaptados a sus necesidades específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El modelo en formato bf16 ocupa aproximadamente 51,6 GB en disco, por lo que se necesita una GPU con al menos 52 GB de VRAM para cargarlo completo.
- Para la inferencia en bf16, una GPU con 80 GB de VRAM como la A100 (80 GB) o H100 (80 GB) es adecuada.
- En GPUs de consumo como la RTX 4090 (24 GB) no cabe el modelo en bf16, pero la versión GGUF cuantizada puede permitir su ejecución en estas tarjetas con pérdida de calidad.
- Opciones de despliegue: se puede utilizar con frameworks como vLLM, TGI o llama.cpp para la versión GGUF.
- La arquitectura MoE con solo 4B parámetros activos permite un throughput notablemente superior al de un modelo denso de 26B, aunque no se disponen de cifras concretas de latencia en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Modalidad | Licencia |
|---|---|---|---|---|---|
| Gemma-4-26B-A4B-TAIDE-zhTW-abliterated-s0.8 | 25,8B | 4B | no disponible | texto + visión | Apache-2.0 + Gemma 4 License + TAIDE |
| google/gemma-4-26B-A4B-it | 25,8B | 4B | no disponible | texto + visión | Apache-2.0 + Gemma 4 License |
| taide/Gemma-3-TAIDE-12b-Chat | 12B | 12B | no disponible | texto | no disponible |

La comparativa se basa en la información disponible. El modelo de xCloudinfo se distingue de su base por su especialización en chino tradicional y por la eliminación de los mecanismos de rechazo de seguridad. El modelo TAIDE original es de menor tamaño y no multimodal.

## Limitaciones y advertencias

- El proceso de abliteración elimina los mecanismos de rechazo de seguridad, lo que significa que el modelo puede generar contenido dañino, ilegal o no ético sin las advertencias habituales.
- El usuario es el único responsable de implementar las salvaguardias de seguridad necesarias para su uso en producción.
- La licencia incluye restricciones específicas: no se permite el uso militar o ilegal, y se deben respetar las leyes de la República de China (Taiwán) y la EU AI Act.
- La licencia del modelo base Gemma 4 y la licencia de TAIDE pueden imponer condiciones adicionales de uso, por lo que se debe revisar la documentación de ambos modelos.
- El modelo está especializado en chino tradicional de Taiwán, por lo que su rendimiento en otros idiomas o variantes de chino puede ser inferior al de los modelos base.
- No hay datos de benchmarks disponibles, por lo que se desconoce su rendimiento en tareas estándar como MMLU, HumanEval o GSM8K.
- La fecha de creación del modelo (agosto de 2026) es futura, lo que podría indicar que la información es hipotética o de prueba.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW-abliterated-s0.8
- Modelo base: https://huggingface.co/xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW
- Versión GGUF: https://huggingface.co/xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW-abliterated-s0.8-GGUF
- Informe técnico de Gemma 4: https://arxiv.org/html/2607.02770v1
- Página oficial de Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Documentación de Gemma 4 en Google AI Edge: https://developers.google.com/edge/litert-lm/models/gemma-4
