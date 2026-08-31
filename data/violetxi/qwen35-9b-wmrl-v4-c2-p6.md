# violetxi/qwen35-9b-wmrl-v4-c2-p6

## Resumen

El modelo `violetxi/qwen35-9b-wmrl-v4-c2-p6` es un fine-tuning completo (full-finetune) del modelo base Qwen/Qwen3.5-9B, realizado sobre un corpus sintético de despachos de abogados denominado Calderwood & Harkness. Forma parte de un estudio de "internalización del mundo" (world-internalization) en su versión v4, con una línea de entrenamiento que utiliza un pool de semillas de razonamiento de aproximadamente 50.000 ejemplos. El autor, violetxi, lo publica bajo licencia Apache 2.0 y lo integra en el layout compuesto del hub, de modo que es servible directamente con vLLM.

El modelo tiene 9.653.104.368 parámetros (9,65 mil millones) y un tamaño de repositorio de 38,6 GB, lo que sugiere pesos en precisión alta (probablemente bf16 o fp16). No se proporcionan datos sobre longitud de contexto, cuantizaciones disponibles, idiomas soportados ni resultados de benchmarks. Su relevancia radica en ser un experimento de fine-tuning orientado a dominios específicos (legal) con una metodología de "grafting" de capas, aunque carece de documentación pública detallada sobre su rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 38,6 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de Qwen/Qwen3.5-9B, un transformer de 9.650 millones de parámetros. El entrenamiento se realizó sobre el corpus sintético Calderwood & Harkness, un conjunto de datos generado artificialmente que simula documentos y escenarios de un despacho de abogados. Según la model card, se trata de un estudio de "world-internalization" en su versión v4, con una línea de 9B student y un pool de semillas de razonamiento de aproximadamente 50.000 ejemplos. El proceso incluye un "graft" (injerto) en el que se reemplazaron 427 capas del modelo base, aunque no se especifica qué capas ni con qué criterio. No se indica el número total de tokens de entrenamiento, ni si se aplicaron técnicas de alineación como RLHF o DPO. El checkpoint final corresponde al paso 3218 y se subió con una política de distribución F-D (según el script de subida).

## Capacidades

- No se dispone de documentación específica sobre las capacidades del modelo tras el fine-tuning.
- Al estar basado en Qwen3.5-9B, se espera que conserve las capacidades generales del modelo base: generación de texto, razonamiento, comprensión de instrucciones y posiblemente generación de código, aunque no hay verificación pública.
- El corpus de entrenamiento (legal sintético) sugiere una especialización en terminología y estructuras documentales del ámbito jurídico, pero no hay evidencia empírica publicada.
- No se menciona soporte para tool calling, agentes, visión, audio ni modos de pensamiento explícitos.

## Casos de uso

- Asistencia en redacción de documentos legales: el modelo podría generar borradores de contratos, cláusulas o memorandos basados en el corpus de entrenamiento, aunque sin validación de calidad.
- Análisis de sentencias y jurisprudencia: dado el dominio del corpus, podría ayudar a resumir o extraer información de textos legales, pero no hay benchmarks que lo confirmen.
- Simulación de escenarios de despacho: útil para experimentos de investigación en IA aplicada al derecho, como generación de casos sintéticos o role-playing de abogados.
- Fine-tuning adicional: al ser un checkpoint de un estudio, puede servir como punto de partida para investigaciones sobre internalización de conocimiento de dominio.
- Evaluación de metodologías de grafting: el modelo es un caso de estudio para comparar técnicas de modificación de capas en modelos grandes.
- Despliegue en entornos de investigación: al ser servible con vLLM, puede integrarse en pipelines de prueba para experimentos de generación de texto legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se comparan métricas con el modelo base Qwen3.5-9B.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,65 mil millones de parámetros, en precisión fp16/bf16 se necesitan aproximadamente 19-20 GB de VRAM. Con cuantización de 8 bits, unos 10 GB; con 4 bits, unos 5-6 GB (estimaciones basadas en el tamaño de parámetros, no en datos oficiales).
- GPU recomendadas: para fp16, una GPU con 24 GB o más (RTX 3090, RTX 4090, A100 40GB, H100). Para cuantización 4-bit, podría caber en GPUs de 8-12 GB (RTX 3060, RTX 4070), pero no hay confirmación.
- El tamaño del repositorio (38,6 GB) sugiere que los pesos están en alta precisión; para despliegue eficiente se recomienda cuantizar.
- Opciones de despliegue: vLLM (mencionado en la model card), también podría usarse con llama.cpp u Ollama si se convierten los pesos a GGUF, aunque no se proporcionan archivos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de la misma categoría (fine-tunes legales o modelos de 9B). El modelo base Qwen3.5-9B es la referencia natural, pero no hay datos de rendimiento relativo. No se conocen otros fine-tunes del mismo corpus o metodología.

## Limitaciones y advertencias

- No hay resultados de benchmarks ni evaluaciones independientes, por lo que el rendimiento real es desconocido.
- El corpus de entrenamiento es sintético y específico de un dominio legal ficticio; puede inducir sesgos hacia ese estilo y no generalizar a derecho real.
- No se documentan sesgos conocidos, pero al ser un fine-tuning sobre datos generados, existe riesgo de alucinación en contextos legales reales.
- La licencia Apache 2.0 permite uso comercial, pero sin garantías de precisión o idoneidad para producción legal.
- El proceso de "graft" (reemplazo de 427 capas) no está explicado; podría afectar la integridad del modelo de forma impredecible.
- No se especifica la longitud de contexto; se desconoce si el fine-tuning la modifica respecto al modelo base.
- El modelo fue subido en 2026 y no tiene descargas ni likes, lo que sugiere que es un experimento reciente sin validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-c2-p6
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- ModelScope de Qwen3.5-9B: https://www.modelscope.cn/models/Qwen/Qwen3.5-9B
- Organización Qwen en GitHub: https://github.com/QwenLM
- Página de Qwen3.5:9b en Ollama: https://ollama.com/library/qwen3.5:9b
