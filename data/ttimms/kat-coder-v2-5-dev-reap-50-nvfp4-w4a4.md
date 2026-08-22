# Ttimms/KAT-Coder-V2.5-Dev-REAP-50-NVFP4-W4A4

## Resumen

KAT-Coder-V2.5-Dev-REAP-50-NVFP4-W4A4 es una versión cuantizada del modelo de codificación agéntico KAT-Coder-V2.5-Dev, desarrollado por el usuario Ttimms. El modelo base, creado por Kwaipilot, es un sistema de codificación orientado a actuar de forma autónoma dentro de repositorios ejecutables, entrenado mediante un marco de post-entrenamiento agéntico que prioriza entornos reproducibles y recompensas verificables. Esta versión concreta aplica dos técnicas de compresión: un podado (pruning) con REAP al 50% de sparsity y una cuantización NVFP4 con pesos y activaciones en 4 bits (W4A4), lo que permite ejecutar el modelo en GPU Blackwell de consumo con una huella de memoria reducida.

El modelo tiene 18.543.997.568 parámetros (18,5 mil millones) y usa una arquitectura MoE (mixture of experts) basada en Qwen3.5-MoE, aunque los detalles exactos de la arquitectura no se especifican en la información disponible. La longitud de contexto no se ha publicado. La relevancia de esta versión reside en que es una de las dos variantes cuantizadas del mismo checkpoint podado: la hermana NVFP4A16 (solo pesos) y esta W4A4 (pesos y activaciones), que permite aprovechar los núcleos tensoriales FP4×FP4 nativos de las GPU Blackwell. El objetivo es evaluar si el cómputo FP4 nativo supera al camino de descuantización en cargas de trabajo de decodificación agéntica.

La licencia es Apache 2.0, heredada del modelo base y su linaje. El repositorio incluye los pesos en formato safetensors y es compatible con transformers y vLLM. No se indica idiomas soportados; dado su enfoque en código, se asume que el inglés es el idioma principal, pero no se ha confirmado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (qwen3_5_moe) |
| Parámetros totales | 18.543.997.568 (18,5 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (W4A4, pesos y activaciones en FP4) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con compressed-tensors y vLLM) |

## Arquitectura y entrenamiento

El modelo base KAT-Coder-V2.5-Dev es un modelo de codificación agéntico entrenado para actuar de forma autónoma en repositorios reales y ejecutables. Según el paper técnico (arXiv 2607.05471), su capacidad está limitada menos por la escala que por la escasez de entornos reproducibles y recompensas verificables, que se aborda con un marco de post-entrenamiento agéntico de extremo a extremo. La arquitectura es un MoE basado en Qwen3.5-MoE, aunque no se ofrecen detalles adicionales sobre el número de expertos o la activación.

La versión REAP-50 se obtuvo mediante podado REAP (pruning) que elimina el 50% de los pesos, seguido de una cuantización NVFP4. En esta variante W4A4, tanto los pesos como las activaciones se cuantizan a 4 bits, mientras que la versión hermana NVFP4A16 solo cuantiza los pesos y mantiene activos en bf16. El proceso de cuantización se realizó con la librería compressed-tensors y los kernels de vLLM (`FlashInferCutlassNvFp4LinearKernel` para capas densas y `FLASHINFER_CUTLASS` para los expertos MoE). No se han publicado detalles sobre el dataset de entrenamiento del modelo base, aunque se menciona `theblackcat102/evol-codealpaca-v1` como dataset en los metadatos, probablemente usado en el entrenamiento del modelo original. No se indica si se aplicó RLHF o DPO.

## Capacidades

- Generación de código avanzada: el modelo base es un agente de codificación que puede trabajar dentro de repositorios completos, no solo generar fragmentos aislados.
- Razonamiento agéntico: capacidad de planificar y ejecutar tareas multi-paso en entornos de código reales, como se describe en el paper del modelo base.
- Tool calling: al ser un modelo agéntico, se asume soporte para invocar herramientas y funciones, aunque no se detalla explícitamente en la ficha.
- Conversación técnica: pipeline de text-generation con capacidad de diálogo multi-turno (indicado en los tags).
- Soporte multimodal: el tag `image-text-to-text` sugiere que el modelo original podría manejar imágenes, pero este release solo incluye pesos de lenguaje y opera como modelo de solo texto (`language_model_only=True` en vLLM).
- Compatibilidad con vLLM y transformers: se puede servir con vLLM usando kernels nativos FP4 para GPU Blackwell.

## Casos de uso

- Asistente de programación agéntico en repositorios: el modelo puede actuar como un agente que explora un repositorio, identifica errores, propone y aplica cambios de código de forma autónoma, gracias a su entrenamiento agéntico. Es adecuado para tareas de mantenimiento y evolución de código.
- Generación de código en producción: con soporte para tool calling y una velocidad de decodificación de ~119 tok/s en configuración de producción (PIECEWISE), puede integrarse en pipelines de CI/CD para generar tests, documentación o parches.
- Refactorización de código legacy: su capacidad para entender el contexto de un repositorio completo permite sugerir refactorizaciones seguras y coherentes con el estilo del proyecto.
- Autocompletado y asistencia en IDE: aunque no se ha probado específicamente, su velocidad de generación lo hace viable para autocompletado en entornos de desarrollo.
- Chat técnico y documentación: puede generar explicaciones, comentarios y documentación a partir de código o preguntas técnicas.
- Pruebas unitarias y depuración: el modelo puede generar casos de prueba y analizar fallos en entornos de ejecución, dado su enfoque en entornos verificables.
- Investigación en compresión de modelos: sirve como caso de estudio para evaluar el impacto de la cuantización W4A4 en modelos MoE de codificación agéntica, especialmente en hardware Blackwell.

## Benchmarks y rendimiento

La model card proporciona mediciones comparativas entre esta versión W4A4 y la hermana NVFP4A16, en una carga de trabajo de decodificación agéntica de un solo stream (batch=1) en hardware consumer Blackwell (SM120). Los resultados son los siguientes:

| Benchmark | NVFP4A16 (hermana) | W4A4 (este modelo) |
|---|---:|---:|
| HumanEval | 95,7% | 92,07% |
| HumanEval+ | 90,9% | 89,02% |
| MBPP+ | 89,9% (340/378) | 91,01% (344/378) |
| Decode (eager) | 18,8 tok/s | 14,5 tok/s |
| Decode (PIECEWISE, producción) | 142,5 tok/s | 119,2 tok/s |

El modelo W4A4 es más lento que la versión NVFP4A16 (0,84x en producción, 0,77x en eager) pero sigue siendo rápido en términos absolutos. En cuanto a precisión, la W4A4 pierde en HumanEval y HumanEval+, pero gana ligeramente en MBPP+ (una diferencia de un problema sobre 378). No se han publicado benchmarks comparativos con otros modelos de codificación en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 12,45 GiB (12.4532 GiB), por lo que cabe en GPUs con 16 GB de VRAM o más.
- GPU compatible: requiere compute capability 12.0 (SM120), es decir, GPU Blackwell de consumo (RTX 5070 Ti, 5080, 5090) y datacenter (B200, etc.). No es compatible con Ampere o Hopper.
- No se requiere CPU offload, ya que el modelo completo cabe en VRAM.
- Opciones de despliegue: vLLM (recomendado), transformers con `trust_remote_code`, y posiblemente SGLang o KTransformers (según el modelo base).
- Latencia medida: 119,2 tok/s en configuración PIECEWISE (CUDA graphs) y 14,5 tok/s en modo eager aislado, para batch=1 en RTX 50 series con límite de potencia típico.
- Espacio en disco: 13,4 GB para el repositorio (incluye otros archivos), con el checkpoint principal en 12,45 GiB.

## Comparativa con modelos similares

La única comparación directa disponible es con la versión hermana NVFP4A16 del mismo modelo podado. No se dispone de datos para comparar con otros modelos de codificación de tamaño similar.

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Rendimiento (HumanEval) |
|---|---|---|---|---|---|
| KAT-Coder-V2.5-Dev-REAP-50-NVFP4-W4A4 (este) | 18,5 B | no disponible | NVFP4 W4A4 | Apache 2.0 | 92,07% |
| KAT-Coder-V2.5-Dev-REAP-50-NVFP4A16 (hermana) | 18,5 B | no disponible | NVFP4 solo pesos | Apache 2.0 | 95,7% |
| KAT-Coder-V2.5-Dev (base) | no disponible | no disponible | Sin cuantizar | Apache 2.0 | no publicado |

## Limitaciones y advertencias

- Requiere hardware Blackwell (SM120) para ejecutar los kernels FP4 nativos; en otras GPUs no funcionará o se degradará.
- El rendimiento en batch >1 no se ha medido; los resultados son solo para un solo stream, por lo que en cargas de trabajo de alta concurrencia puede variar.
- La cuantización W4A4 reduce ligeramente la precisión en HumanEval y HumanEval+ en comparación con la versión NVFP4A16, aunque el impacto es mucho menor que en los estudios de cuantización INT4 antiguos.
- El modelo es solo texto (no incluye componentes multimodales) a pesar de que el modelo base podría tener capacidades de imagen.
- No se han reportado sesgos o riesgos de alucinación específicos, pero como todo LLM de código, puede generar código incorrecto o inseguro.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución.
- No se especifica la longitud de contexto; se recomienda verificar en el modelo base para casos de uso con contexto largo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ttimms/KAT-Coder-V2.5-Dev-REAP-50-NVFP4-W4A4
- Versión hermana NVFP4A16: https://huggingface.co/Ttimms/KAT-Coder-V2.5-Dev-REAP-50-NVFP4A16
- Modelo base de Kwaipilot: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Paper técnico del modelo base: https://arxiv.org/abs/2607.05471
- Modelo NVFP4 similar de otro autor (sakamakismile): https://huggingface.co/sakamakismile/KAT-Coder-V2.5-Dev-NVFP4
