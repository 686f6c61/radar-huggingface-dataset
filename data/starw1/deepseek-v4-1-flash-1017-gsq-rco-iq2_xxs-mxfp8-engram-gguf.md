# Starw1/DeepSeek-V4.1-Flash-1017-GSQ-RCO-IQ2_XXS-MXFP8-Engram-GGUF

## Resumen

Este repositorio, publicado por el usuario Starw1, no es un modelo nuevo, sino una cuantización híbrida en formato GGUF del modelo DeepSeek-V4.1-Flash-1017 desarrollado por DeepSeek-AI. La particularidad de esta versión es que combina el backbone del modelo cuantizado a IQ2_XXS (2 bits aprox.) por ISTA-DASLab con las tablas "Engram" del modelo oficial en su precisión original MXFP8 (FP8 E4M3 con escalas E8M0 por cada 32 valores), sustituyendo la versión a 4 bits (IQ4_NL) del repo de ISTA-DASLab. El resultado son unos 341 GB de pesos que buscan preservar la fidelidad de las tablas Engram manteniendo el resto del modelo en una cuantización extrema.

El modelo base, DeepSeek-V4.1-Flash-1017, tiene 196.613.849.600 parámetros totales según los metadatos de safetensors. Este tipo de repositorios de terceros resulta relevante para la comunidad porque permite ejecutar modelos de gran tamaño en hardware más modesto, aunque con la advertencia habitual de que las cuantizaciones agresivas (IQ2_XXS) pueden degradar la calidad de salida respecto al original. El trabajo de verificación del autor (comprobación byte a byte de los 768 millones de filas de Engram) aporta un plus de confianza técnica poco habitual en cuantizaciones comunitarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformador del modelo base DeepSeek-V4.1-Flash-1017; detalles no publicados en la model card) |
| Parametros totales | 196.613.849.600 (~196,6 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Hibrida: backbone IQ2_XXS + tablas Engram en MXFP8 (ggml type 43, FP8 E4M3 con escalas E8M0 por cada 32 valores) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (341,0 GB en total en el repositorio) |

## Arquitectura y entrenamiento

Este repositorio no describe la arquitectura ni el proceso de entrenamiento del modelo base, por lo que esos detalles no están disponibles en la información proporcionada. Lo que sí documenta la model card es el proceso de cuantización: el autor partió del GGUF de ISTA-DASLab (DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF), que cuantiza todo el modelo incluidas las tablas Engram a 4 bits (IQ4_NL), y reemplazó dichas tablas por los valores oficiales en FP8 E4M3 del repositorio original de DeepSeek-AI (revisión `1bae0e10`).

Los valores oficiales se copiaron byte a byte al layout GGUF de ISTA como tipo ggml 43 (MXFP8), y el autor verificó la exactitud byte a byte sobre las 768 millones de filas de las tablas Engram utilizando la herramienta `pack_gguf.py --engram` del proyecto Strata. Los scripts están disponibles en el directorio `tools/` del repositorio y los resultados de verificación en `verification.log`. Esta hibridación busca un compromiso entre el ahorro de memoria del backbone a ~2 bits y la máxima fidelidad de las tablas Engram, que aparentemente son sensibles a la cuantización.

## Capacidades

Al tratarse de una cuantización de un modelo base sin model card detallada, las capacidades específicas no están documentadas en la información disponible. Lo que puede afirmarse razonablemente a partir de los metadatos:

- Generación de texto e inferencia local mediante backends compatibles con GGUF (llama.cpp y derivados como Ollama o LM Studio).
- Conservación de las tablas Engram en precisión original MXFP8, lo que presumiblemente mantiene mejor la calidad de salida que la variante íntegramente en IQ2/IQ4 de ISTA-DASLab.
- Capacidades exactas de razonamiento, código, matemáticas, visión o tool calling del modelo base DeepSeek-V4.1-Flash-1017: no disponible en la información proporcionada.

## Casos de uso

- Ejecución local de un modelo de ~196 mil millones de parámetros en estaciones de trabajo con memoria unificada: gracias a la cuantización híbrida, el repo ocupa 341 GB, lo que lo hace viable en sistemas tipo Mac Studio con 512 GB de memoria unificada o servidores con mucha RAM, donde un modelo en FP8/BF16 (más de 400 GB) no cabría.
- Experimentación con cuantización extrema: el repo es idóneo para investigadores que quieran evaluar cuánta calidad se pierde al cuantizar el backbone a IQ2_XXS manteniendo las tablas Engram en FP8, con scripts de verificación incluidos.
- Chatbot local privado: para usuarios que necesitan un asistente conversacional sin enviar datos a la nube, ejecutable con llama.cpp en hardware de gama alta.
- Pruebas comparativas de cuantizaciones: permite comparar directamente contra la variante de ISTA-DASLab con Engram en IQ4_NL para medir el impacto de la precisión de las tablas Engram en la calidad de generación.
- Integración en pipelines locales de procesamiento de texto: compatible con APIs derivadas de llama.cpp (llama-server) para automatizar tareas por lotes en entornos air-gapped.
- Reproducción y auditoría: dado que los valores Engram se copiaron byte a byte del repo oficial y hay un log de verificación, es útil para quien necesite trazabilidad sobre qué pesos ejecuta exactamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones tipo MMLU, HumanEval o GSM8K, ni comparativas de perplejidad entre esta versión híbrida y la de ISTA-DASLab o el modelo original.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio completo ocupa 341,0 GB, por lo que se necesita al menos esa cantidad de memoria (VRAM + RAM, por ejemplo con offload de capas) para alojar el modelo, más margen para el KV cache y el contexto.
- GPUs recomendadas: no disponible. Dado el tamaño, es improbable que quepa íntegramente en una única GPU de datacenter (incluso una H100 con 80 GB); se requieren multi-GPU con NVLink o sistemas con memoria unificada muy amplia (por ejemplo, Mac Studio con 512 GB) o servidores con varias cientos de GB de RAM.
- Consumer GPUs: no cabe en GPUs de consumo estándar (una RTX 4090 con 24 GB solo podría alojar una fracción mínima de las capas con offload masivo a RAM, con penalización severa de velocidad).
- Opciones de despliegue: llama.cpp (formato GGUF nativo), y derivados como Ollama o LM Studio. No hay soporte directo de vLLM o TGI para GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano | Licencia |
|---|---|---|---|---|
| Starw1/DeepSeek-V4.1-Flash-1017-GSQ-RCO-IQ2_XXS-MXFP8-Engram-GGUF | ~196,6 mil millones (base) | IQ2_XXS backbone + MXFP8 Engram | 341,0 GB | MIT |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF (base de esta cuantización) | ~196,6 mil millones | IQ2_XXS backbone + IQ4_NL Engram | no disponible | MIT (derivada del modelo base) |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (modelo original) | ~196,6 mil millones | FP8 E4M3 (oficial) | ~202,8 GB (solo tablas Engram; total no disponible) | no disponible |

La diferencia clave entre esta versión y la de ISTA-DASLab es la precisión de las tablas Engram: MXFP8 original frente a IQ4_NL, a costa de un repositorio mayor (341 GB).

## Limitaciones y advertencias

- Es una cuantización de terceros (Starw1), no un modelo oficial de DeepSeek-AI; la calidad puede diferir del original y no hay benchmarks que cuantifiquen la degradación por la cuantización IQ2_XXS del backbone.
- Cuantizaciones de ~2 bits son conocidas por degradar razonamiento, código y capacidad de seguimiento de instrucciones; conviene validar contra el modelo oficial antes de uso serio.
- El tamaño de 341 GB hace inviable su uso en hardware de consumo; el coste de hardware puede superar al de usar APIs del modelo original.
- Sesgos conocidos: no disponible; heredará los del modelo base DeepSeek-V4.1-Flash-1017, cuya model card no se incluye aquí.
- Riesgo de alucinación: no disponible específicamente, aunque es un riesgo inherente a todo LLM y posiblemente agravado por la cuantización extrema.
- Licencia MIT: permite uso comercial sin restricciones significativas, aunque conviene verificar la licencia efectiva del modelo base original, que podría imponer condiciones adicionales (los tags indican MIT, pero la licencia del modelo upstream no está confirmada en la información proporcionada).
- Longitud de contexto, idiomas soportados y parámetros activos: no disponibles; deben consultarse en la documentación del modelo base antes de planificar despliegues.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/Starw1/DeepSeek-V4.1-Flash-1017-GSQ-RCO-IQ2_XXS-MXFP8-Engram-GGUF
- GGUF base de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Modelo original de DeepSeek-AI: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Herramienta de verificación Strata: https://github.com/Niko1221/Strata
