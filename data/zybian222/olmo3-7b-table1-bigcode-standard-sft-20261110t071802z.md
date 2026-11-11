# zybian222/olmo3-7b-table1-bigcode-standard-sft-20261110t071802z

## Resumen

OLMo-3 7B bigcode standard SFT es un ajuste fino supervisado (SFT) del modelo base allenai/Olmo-3-1025-7B, publicado por el usuario zybian222 en Hugging Face. Se trata de un checkpoint de investigación que reproduce, de forma aproximada, la receta de código "Table 1" descrita en el trabajo TailSFT, pero sin aplicar el filtrado selectivo de datos que caracteriza a esa técnica. El resultado es un modelo de 7.298.011.136 parámetros orientado a generación de texto y conversación, derivado de la familia OLMo 3 de AllenAI.

El modelo se entrenó sobre el conjunto bigcode/self-oss-instruct-sc2-exec-filter-50k, un corpus de instrucciones de código autogeneradas y filtradas por ejecución, lo que lo orienta hacia tareas de programación y seguimiento de instrucciones. El autor advierte explícitamente de que no se trata del checkpoint oficial de los autores de TailSFT y de que los resultados de benchmarks se publican por separado, por lo que debe considerarse un artefacto experimental más que un modelo listo para producción.

Su relevancia es doble: por un lado, sirve como referencia reproducible de una receta de SFT sobre OLMo 3; por otro, al estar liberado bajo licencia Apache 2.0 y en formato safetensors compatible con transformers, permite a investigadores experimentar con ajuste fino y evaluación sin restricciones de uso comercial. No obstante, la información pública disponible es muy limitada: no hay datos de benchmarks, idiomas ni detalles completos de entrenamiento en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de allenai/Olmo-3-1025-7B; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base allenai/Olmo-3-1025-7B, un transformer decoder-only de aproximadamente 7.300 millones de parámetros. La model card no detalla la configuración interna (número de capas, dimensión oculta, cabezas de atención, tipo de atención o positional encoding), por lo que esos datos deben consultarse en la ficha del modelo base de AllenAI. Tampoco se especifica si el modelo incorpora innovaciones como atención lineal, decodificación especulativa o modos de razonamiento extendido.

El entrenamiento consistió en un SFT completo ("full standard SFT") siguiendo la receta de código Table 1 de TailSFT, sin aplicar el filtrado TailSFT. Se ejecutó sobre cuatro GPUs con un batch global de 32, usando como fuente el dataset bigcode/self-oss-instruct-sc2-exec-filter-50k, compuesto por instrucciones de código autogeneradas y filtradas mediante ejecución. El autor indica que el muestreo y la descontaminación son aproximaciones a la receta descrita y que el manifiesto de datos (data_manifest.json) contiene la procedencia y licencias de las fuentes, así como las diferencias explícitas de preprocesado. No se documentan fases de RLHF o DPO, ni el número total de tokens de entrenamiento.

## Capacidades

- Generación de texto y conversación multi-turno, con plantilla de chat propia que debe usarse tal cual se guardó en el repositorio.
- Generación y asistencia en código, dado el origen del dataset de instrucciones (self-oss-instruct-sc2-exec-filter-50k).
- Seguimiento de instrucciones en formato conversacional (pipeline text-generation, tag conversational).
- Compatibilidad con endpoints de inferencia (tag endpoints_compatible).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Evaluación de recetas de SFT: el modelo sirve como punto de comparación reproducible frente a variantes con filtrado TailSFT, permitiendo medir el impacto del filtrado de datos en tareas de código.
- Generación de código asistida en entornos de investigación: dado su entrenamiento sobre instrucciones de código filtradas por ejecución, puede emplearse para completar funciones y sugerir parches en cuadernos y repositorios de experimentación.
- Reproducción de experimentos académicos: al estar liberado en safetensors y con licencia Apache 2.0, facilita la replicación de resultados y la comparación con el checkpoint base de AllenAI.
- Ajuste fino posterior (continued fine-tuning): su tamaño de 7.300 millones de parámetros y formato estándar de transformers lo hacen adecuado como punto de partida para SFT específico de dominio en una o varias GPUs.
- Destilación y generación de datos sintéticos: puede utilizarse para producir pares instrucción-respuesta de código que alimenten pipelines de entrenamiento de modelos menores.
- Docencia y formación técnica: sirve para ilustrar el flujo completo de SFT sobre un modelo abierto, incluyendo el uso de plantillas de chat y la gestión de manifiestos de datos.
- Pruebas de integración con endpoints compatibles: el tag endpoints_compatible permite desplegarlo en infraestructuras de inferencia estándar para validar pipelines de servicio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de benchmarks se presentan por separado y no se incluyen en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 14,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 16 y 20 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB para pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 4,5-5 GB para pesos, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB, H100 para despliegues de producción; RTX 4090 (24 GB) suficiente para fp16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) en fp16; en GPUs de 16 GB requeriría cuantización de 8 bits, y en 8-12 GB cuantización de 4 bits.
- Opciones de despliegue: transformers (librería declarada), servidores compatibles con endpoints; vLLM, llama.cpp, Ollama y TGI no están confirmados en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zybian222/olmo3-7b-table1-bigcode-standard-sft | 7.298.011.136 | no disponible | Apache 2.0 | SFT sobre bigcode/self-oss-instruct-sc2-exec-filter-50k, sin filtrado TailSFT |
| allenai/Olmo-3-1025-7B (modelo base) | ~7.300 millones | no disponible en la informacion proporcionada | Apache 2.0 (heredada) | Modelo base sin SFT específico de código |
| Variantes TailSFT con filtrado | no disponible | no disponible | no disponible | No se dispone de datos concretos en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento (benchmarks) con alternativas; la comparación se limita a parámetros, licencia y procedencia del entrenamiento.

## Limitaciones y advertencias

- No es el checkpoint oficial de los autores de TailSFT; el autor lo describe como una aproximación a la receta, por lo que los resultados pueden diferir de los publicados.
- El muestreo y la descontaminación son aproximados; puede haber solapamiento residual con conjuntos de evaluación, lo que invalidaría comparaciones de benchmark no verificadas.
- No se declaran idiomas soportados; el comportamiento multilingüe es incierto y probablemente limitado al inglés técnico del dataset de código.
- No se documentan sesgos conocidos ni evaluaciones de seguridad; al derivar de un modelo base abierto, hereda los sesgos de sus datos de preentrenamiento.
- Riesgo de alucinación en código: las respuestas pueden ser sintácticamente plausibles pero incorrectas; se recomienda validación mediante ejecución de tests.
- La licencia Apache 2.0 permite uso comercial, pero el autor remite a data_manifest.json para la procedencia y licencias de las fuentes de datos, que deben revisarse antes de un uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de comunidad ni de validación externa.
- No se publican requisitos de contexto ni resultados de benchmarks, lo que dificulta planificar despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zybian222/olmo3-7b-table1-bigcode-standard-sft-20261110t071802z
- Modelo base: https://huggingface.co/allenai/Olmo-3-1025-7B
- Dataset de entrenamiento: https://huggingface.co/datasets/bigcode/self-oss-instruct-sc2-exec-filter-50k
- Manifiesto de datos: data_manifest.json (incluido en el repositorio del modelo)
- Paper de TailSFT: no disponible en la informacion proporcionada
- Repositorio de código: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
