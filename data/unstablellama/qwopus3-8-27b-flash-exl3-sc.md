# UnstableLlama/Qwopus3.8-27B-Flash-EXL3-SC

## Resumen

UnstableLlama/Qwopus3.8-27B-Flash-EXL3-SC es una cuantización EXL3 del modelo base Jackrong/Qwopus3.8-27B-Flash, realizada por UnstableLlama mediante las herramientas exllamav3 y ezexl3. El modelo base es un modelo de lenguaje de aproximadamente 27 mil millones de parámetros (según su nomenclatura), orientado según su propia descripción a preservar capacidad suficiente para tareas exigentes mientras reduce el coste y la latencia del razonamiento. Esta versión cuantizada a 6 bits por peso (6.00bpw) reduce el tamaño del modelo de 51.75 GiB en bf16 a 21.04 GiB, lo que facilita su ejecución en GPUs con menos memoria. La licencia es Apache 2.0, lo que permite su uso comercial. No se dispone de información detallada sobre la arquitectura interna, la longitud de contexto ni los idiomas soportados en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 6.00bpw (revisión actual); modelo base disponible en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | EXL3 (formato nativo de exllamav3) |

## Arquitectura y entrenamiento

La información disponible no incluye detalles sobre la arquitectura del modelo base Qwopus3.8-27B-Flash. No se han publicado datos sobre el número de capas, la configuración del transformer, el tipo de atención, ni sobre el proceso de entrenamiento, los tokens utilizados o la composición del dataset. La única información técnica disponible se refiere al proceso de cuantización: la revisión 6.00bpw se generó con exllamav3 y el repositorio se creó automáticamente con ezexl3. No hay datos sobre innovaciones técnicas destacables en el modelo base.

## Capacidades

No se han publicado capacidades detalladas del modelo base en la información disponible. La única referencia encontrada en una cuantización similar del mismo modelo base lo describe como un modelo "Flash" que debería preservar suficiente capacidad para trabajos exigentes mientras reduce el coste y la latencia del razonamiento. Sin embargo, no se dispone de listados verificados de capacidades como generación de texto, razonamiento, código, matemáticas, visión, tool calling, soporte de agentes o capacidades multilingües.

## Casos de uso

No disponible. La información proporcionada no incluye descripción de capacidades ni casos de uso específicos del modelo base. Sin documentación oficial, no es posible enumerar aplicaciones concretas y realistas sin incurrir en especulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos de la cuantización 6.00bpw ocupan 21.04 GiB. En la práctica, con contexto y caché KV, se recomienda una GPU con al menos 24 GiB de VRAM para contextos cortos, y 32 GiB o más para contextos largos.
- GPU recomendadas: RTX 4090 (24 GB) para contextos cortos; A100 40GB o H100 80GB para contextos largos y mayor margen de memoria.
- El modelo base en bf16 ocupa 51.75 GiB, lo que requiere GPUs de 64 GB o más, o varias GPUs.
- Opciones de despliegue: el formato EXL3 es específico de ExLlamaV3. No es compatible con vLLM, llama.cpp, Ollama ni TGI en su formato nativo. Para usar el modelo con estas herramientas sería necesario convertirlo previamente a otro formato.
- Latencia y throughput: no se han publicado datos de rendimiento para esta cuantización.

## Comparativa con modelos similares

No se dispone de benchmarks ni especificaciones de rendimiento que permitan una comparación rigurosa. Existe otra cuantización del mismo modelo base, chriswessels/Qwopus3.8-27B-Flash-oQ4e-mtp, que utiliza un esquema de cuantización diferente (oQ4e), pero no hay datos comparativos de calidad ni velocidad. La comparación con otros modelos de 27B no es posible sin información adicional.

## Limitaciones y advertencias

- Al ser una cuantización, existe una pérdida de calidad respecto al modelo original. La model card indica una divergencia KL media de 0.0017 para la revisión 6.00bpw, lo que sugiere una pérdida mínima, pero no es una evaluación exhaustiva.
- No se han publicado evaluaciones de sesgos, riesgos de alucinación ni de seguridad.
- La información disponible no incluye los idiomas soportados, la longitud de contexto ni las capacidades reales del modelo, lo que dificulta su evaluación antes del despliegue.
- El modelo base es un proyecto de la comunidad (Jackrong/Qwopus3.8-27B-Flash) sin garantías de mantenimiento ni documentación oficial.
- La licencia Apache 2.0 permite el uso comercial, pero se recomienda revisar los términos de la licencia y cualquier atribución requerida.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/UnstableLlama/Qwopus3.8-27B-Flash-EXL3-SC
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Flash
- Herramienta de cuantización exllamav3: https://github.com/turboderp-org/exllamav3
- Herramienta ezexl3: https://github.com/UnstableLlama/ezexl3
- Cuantización alternativa del mismo modelo base: https://huggingface.co/chriswessels/Qwopus3.8-27B-Flash-oQ4e-mtp
