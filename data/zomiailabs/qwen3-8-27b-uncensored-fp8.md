# zomiailabs/Qwen3.8-27B-Uncensored-FP8

## Resumen

Qwen3.8-27B-Uncensored-FP8 es una versión modificada del modelo Qwen3.8-27B de Alibaba, desarrollada por zomiailabs en colaboración con OrcaRouter. Se trata de un modelo denso de 27.781 millones de parámetros con arquitectura híbrida de atención (Gated DeltaNet lineal combinada con atención completa), capacidades nativas de visión-lenguaje, 262.144 tokens de contexto y una cabeza de decodificación especulativa MTP. La modificación principal consiste en la abliteración, es decir, la eliminación de la dirección de rechazo del modelo original, seguida de una cuantización offline en block-FP8 que replica exactamente el esquema del Qwen3.8-27B-FP8 oficial.

Este modelo resuelve un problema específico de investigación: permite estudiar los mecanismos internos de rechazo y seguridad en modelos de lenguaje, así como realizar tareas de red-teaming y evaluación de robustez. Su relevancia radica en que, al eliminar la alineación de seguridad, expone el comportamiento subyacente del modelo sin los filtros habituales, lo que resulta útil para la comunidad de seguridad e interpretabilidad. No obstante, el propio autor advierte explícitamente que no debe desplegarse en producción ni usarse con usuarios finales sin añadir capas de moderación externas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration — 64 capas, hidden 5120, híbrida Gated DeltaNet (48 capas de atención lineal + 16 de atención completa, intervalo 4), torre de visión nativa y cabeza MTP |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Block-FP8 (E4M3), weight_block_size [128,128], activaciones dinámicas; torre de visión, normas, router, embeddings y lm_head en BF16 |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (7 shards de ≤5 GB, 30.9 GB en total, 1606 tensores) |

## Arquitectura y entrenamiento

La arquitectura base es la de Qwen3.8-27B, un modelo de 64 capas con hidden size 5120 que combina atención lineal Gated DeltaNet (48 capas) con atención completa (16 capas), distribuidas con un intervalo de 4. Incluye una torre de visión nativa que permite procesar imágenes y una cabeza MTP (Multi-Token Prediction) para decodificación especulativa. Sobre esta base, zomiailabs aplica dos modificaciones: primero, la abliteración siguiendo el método de Arditi et al. (2024), que estima una única dirección de rechazo en la capa 38 (round(0.6 × 64)) usando AdvBench como conjunto dañino y Alpaca como inofensivo, y la ortogonaliza de 131 matrices residuales (proyecciones de salida de atención, MLP y embeddings). Segundo, una cuantización offline block-FP8 que replica el esquema exacto del Qwen3.8-27B-FP8 oficial, manteniendo la torre de visión y la cabeza MTP intactas en su funcionalidad. No se dispone de información sobre el dataset de entrenamiento adicional ni sobre el número de tokens utilizado en la modificación.

## Capacidades

- Generación de texto, razonamiento, código y matemáticas, heredadas del modelo base Qwen3.8-27B.
- Procesamiento de visión-lenguaje: puede recibir imágenes como entrada y generar respuestas contextuales.
- Tool calling y function calling, compatible con integraciones de agentes.
- Razonamiento multi-paso con control flexible del modo de pensamiento (thinking mode).
- Decodificación especulativa mediante la cabeza MTP, que acelera la generación.
- Soporte multilingüe limitado a inglés y chino.
- Sin guardarraíles de seguridad: el modelo no rechaza solicitudes dañinas, ilegales u ofensivas, por diseño.

## Casos de uso

- Investigación en interpretabilidad de modelos: permite analizar cómo se comporta un modelo de 27B sin la dirección de rechazo, facilitando el estudio de los mecanismos internos de alineación.
- Red-teaming y evaluación de robustez: útil para probar sistemas de moderación y detectar vulnerabilidades en pipelines de seguridad antes de desplegar modelos alineados.
- Estudios de mecanismos de rechazo: al comparar con el modelo base, se puede aislar el efecto de la dirección de rechazo en el comportamiento.
- Desarrollo de capas de moderación externas: sirve como banco de pruebas para filtros de contenido, clasificadores de seguridad y sistemas de guardarraíles.
- Experimentos controlados en entornos aislados: adecuado para laboratorios que necesitan un modelo sin restricciones para validar hipótesis sobre alineación y seguridad.
- Evaluación de cuantización FP8: al replicar el esquema oficial, permite comparar el rendimiento de la cuantización block-FP8 en un modelo sin alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 30.9 GB en formato safetensors con cuantización FP8.
- VRAM estimada: no disponible oficialmente; con 30.9 GB de pesos en FP8, se estima que podría caber en GPUs con 32 GB o más (p. ej., A100 40GB, H100, RTX 6000 Ada), aunque no hay datos confirmados.
- La documentación de Unsloth indica que el modelo base Qwen3.8-27B puede ejecutarse localmente con 17 GB de RAM/VRAM, pero no se especifica para esta versión FP8.
- Opciones de despliegue: vLLM (compatible con el esquema block-FP8), transformers; no se mencionan formatos GGUF ni soporte en Ollama o llama.cpp.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Abliteración | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27.78B | 262K | BF16 | No | Apache 2.0 |
| Qwen3.8-27B-FP8 (oficial) | 27.78B | 262K | Block-FP8 | No | Apache 2.0 |
| Qwen3.8-27B-Uncensored-FP8 (este) | 27.78B | 262K | Block-FP8 | Sí | Apache 2.0 |
| Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16 | 27.78B | 262K | BF16 | Sí | Apache 2.0 |

La diferencia clave frente a los modelos oficiales es la abliteración; frente a la versión BF16 de zomiailabs, la diferencia es la cuantización FP8, que reduce el tamaño y acelera la inferencia en hardware compatible.

## Limitaciones y advertencias

- El modelo ha sido despojado de su alineación de seguridad: cumplirá solicitudes dañinas, ilegales, ofensivas o poco éticas que el modelo original rechazaría.
- No debe desplegarse en producción ni exponerse a usuarios finales sin añadir capas de moderación, filtrado y prevención de abusos.
- Está destinado exclusivamente a investigación legítima: interpretabilidad, seguridad, red-teaming y experimentos controlados.
- Riesgo de alucinación y de generar contenido falso o engañoso, heredado del modelo base.
- Soporte de idiomas limitado a inglés y chino; el rendimiento en otros idiomas no está garantizado.
- La licencia Apache 2.0 permite uso comercial, pero el autor declina toda responsabilidad por el uso indebido; el usuario asume toda la responsabilidad legal y ética.
- No se han publicado benchmarks ni evaluaciones de rendimiento para esta versión específica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zomiailabs/Qwen3.8-27B-Uncensored-FP8
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Qwen3.8-27B-FP8 oficial: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Sitio web de OrcaRouter: https://www.orcarouter.ai
- Catálogo de modelos de OrcaRouter: https://www.orcarouter.ai/models
- Página del modelo en OrcaRouter: https://www.orcarouter.ai/models/obsidian/qwen3.8-27b
- GitHub de Continuum-AI-Corp: https://github.com/Continuum-AI-Corp
- Discord de OrcaRouter: https://discord.gg/yAh6Tex6kx
- X de OrcaRouter: https://x.com/OrcaRouter
- Repo de GitHub sobre Qwen 3.8 27B Uncensored: https://github.com/Wassimyounes01/qwen38-uncensored
- Documentación de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
