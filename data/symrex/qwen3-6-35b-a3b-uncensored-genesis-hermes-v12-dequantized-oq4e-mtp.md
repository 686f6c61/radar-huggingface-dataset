# symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12-dequantized-oQ4e-mtp

## Resumen

Este repositorio contiene una versión cuantizada del modelo **Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12**, generada por el usuario `symrex` mediante la herramienta oQ (oMLX v0.6.4) con precisión mixta. El modelo base pertenece a la serie Genesis Hermes, una adaptación no censurada del Qwen3.6-35B-A3B de Alibaba, orientada a tareas de razonamiento agéntico, tool calling y soporte multimodal, según fuentes externas. La cuantización a 4 bits con grupo de 64 reduce el tamaño para su ejecución en hardware Apple Silicon mediante MLX.

El nombre del modelo indica una arquitectura Mixture of Experts (MoE) con 35 mil millones de parámetros totales y 3 mil millones activos por token, aunque el conteo real de parámetros en los safetensors es de 6.189.056.944, lo que sugiere que la cuantización podría haber reducido el almacenamiento o que el modelo base tiene una estructura diferente. El repositorio tiene 0 descargas y 0 likes, y fue creado el 2 de septiembre de 2026, por lo que se trata de un artefacto muy reciente y sin validación comunitaria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (Mixture of Experts) |
| Parametros totales | 6.189.056.944 (según safetensors); el nombre indica 35B-A3B |
| Parametros activos | 3B (según el nombre; no confirmado) |
| Longitud de contexto | 262.000 tokens (según fuentes web para la serie Genesis Hermes) |
| Tipos de cuantizacion | oQ4e (4 bits, grupo 64, precisión mixta) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (cuantizado) |

## Arquitectura y entrenamiento

El modelo base es un MoE (Mixture of Experts) con un total de 35 mil millones de parámetros y 3 mil millones activos por token, lo que permite una inferencia eficiente manteniendo capacidad de razonamiento. La cuantización aplicada por `symrex` utiliza oQ de oMLX v0.6.4, que combina cuantización de 4 bits con grupo de 64 y precisión mixta para preservar capas críticas. No se dispone de detalles sobre el entrenamiento del modelo base (datos, número de tokens, técnicas de alineación) ni sobre el proceso de adaptación Genesis Hermes. Las fuentes web indican que la serie incorpora soporte para tool calling estilo Hermes y capacidades multimodales, pero estos datos no están confirmados en la model card del repositorio.

## Capacidades

- Generación de texto y razonamiento multi-turno, heredadas de la familia Qwen3.6.
- Soporte de tool calling / function calling, según las características de la serie Hermes (referencia externa).
- Capacidades multimodales (entrada de imagen y texto), mencionadas en fuentes web para versiones anteriores de Genesis Hermes.
- Modo no censurado (uncensored), que elimina ciertos filtros de seguridad del modelo base.
- Razonamiento agéntico y análisis de código a nivel de repositorio, según la revisión del modelo base Qwen3.6-35B-A3B publicada en dev.to.

## Casos de uso

- Despliegue local en Macs con Apple Silicon: gracias al formato MLX y la cuantización 4-bit, el modelo puede ejecutarse en equipos con memoria unificada de 16 GB o más, ideal para prototipado y pruebas sin infraestructura cloud.
- Asistentes de código en entornos locales: el modelo base está diseñado para tareas de codificación agéntica y razonamiento a escala de repositorio, por lo que puede integrarse en IDEs para autocompletado, refactorización y generación de tests.
- Automatización de agentes con tool calling: el soporte de Hermes permite que el modelo invoque funciones externas (APIs, scripts, bases de datos) en flujos multi-paso, útil para automatización de tareas administrativas o de integración.
- Análisis de documentos largos: con un contexto de 262K tokens (según fuentes web), puede procesar manuales técnicos, contratos o libros completos en una sola pasada.
- Generación de contenido creativo sin restricciones: el modo uncensored permite explorar narrativas, guiones o textos que los modelos comerciales filtran, aunque con los riesgos asociados.
- Investigación en eficiencia de cuantización: el repositorio sirve como caso de estudio para evaluar el impacto de oQ4e en modelos MoE de gran tamaño, comparando calidad y rendimiento frente a otras cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni otras pruebas estándar. Las fuentes web mencionan que el modelo base Qwen3.6-35B-A3B supera a modelos frontera en tareas de codificación, pero no se aportan cifras concretas para esta versión cuantizada.

## Requisitos de hardware

- El formato MLX está optimizado para Apple Silicon (M1, M2, M3, M4 y sucesores).
- VRAM estimada: el repositorio ocupa 21,6 GB, pero los pesos cuantizados a 4 bits para 6,2 mil millones de parámetros requieren aproximadamente 3-4 GB de memoria; sin embargo, el tamaño del repo sugiere que puede incluir pesos adicionales o archivos de respaldo. Se recomienda un mínimo de 16 GB de RAM unificada para cargar el modelo y ejecutar inferencia cómodamente.
- GPUs recomendadas: no aplicable para CUDA; el modelo solo funciona con MLX en Apple Silicon.
- Opciones de despliegue: MLX (librería nativa), posiblemente a través de `mlx-lm` o `mlx-lm-server`. No es compatible con vLLM, llama.cpp u Ollama en su formato actual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35B | 3B | 262K | Apache 2.0 (según Qwen) | safetensors |
| Qwen3-30B-A3B (base) | 30B | 3B | 128K | Apache 2.0 | safetensors |
| Este modelo (V12 cuantizado) | 6,2B (según safetensors) | no disponible | no disponible | no disponible | MLX safetensors |

La comparación es limitada porque el modelo cuantizado presenta un conteo de parámetros inconsistente con el nombre y no se dispone de datos de rendimiento. Las versiones anteriores de Genesis Hermes (V6, V11) siguen el mismo patrón de cuantización, pero no hay métricas comparativas publicadas.

## Limitaciones y advertencias

- Licencia no especificada: el uso comercial, la redistribución o la modificación pueden infringir derechos del autor original. No se recomienda su uso en producción sin aclaración legal.
- Sesgos y alucinaciones: al ser una versión no censurada, el modelo puede generar contenido ofensivo, falso o peligroso sin filtros de seguridad. El riesgo de alucinación es similar al de otros modelos de su tamaño.
- Degradación por cuantización: la cuantización 4-bit con grupo 64 puede reducir la precisión en tareas de razonamiento complejo o matemáticas, aunque la precisión mixta intenta mitigarlo.
- Contexto no verificado: la longitud de 262K tokens proviene de fuentes web, no de la model card; el comportamiento real con contextos largos no está confirmado.
- Falta de soporte comunitario: con 0 descargas y 0 likes, el modelo no ha sido validado por la comunidad; puede contener errores de cuantización o incompatibilidades.
- Idioma limitado: no se especifican idiomas soportados; es probable que el modelo base tenga un sesgo hacia inglés y chino, pero no se garantiza.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12-dequantized-oQ4e-mtp
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
- Guía GGUF de Genesis Hermes V11 (Hackernoon): https://hackernoon.com/qwen36-35b-a3b-genesis-hermes-v11-complete-gguf-guide
- Guía de ejecución de Genesis Hermes (cldnavi): https://cldnavi.com/en/blog/qwen36-35b-genesis-hermes-guide-2026/
- Revisión de Qwen3.6-35B-A3B (dev.to): https://dev.to/czmilo/qwen36-35b-a3b-complete-review-alibabas-open-source-coding-model-that-beats-frontier-giants-4382
- Versión V6 cuantizada (referencia): https://huggingface.co/symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V6-dequantized-oQ4e-mtp
