# Thireus/mtp-Qwen3.8-27B-THIREUS-IQ3_XXS-SPECIAL_SPLIT

## Resumen

El modelo `mtp-Qwen3.8-27B-THIREUS-IQ3_XXS-SPECIAL_SPLIT` es una cuantizacion en formato GGUF del modelo Qwen3.8-27B, desarrollada por Thireus mediante su propia herramienta de cuantizacion (GGUF Tool Suite). Qwen3.8-27B es el modelo denso multimodal de la generacion Qwen3.8 de Alibaba, publicado en agosto de 2026 bajo licencia Apache 2.0. Este modelo destaca por su rendimiento en tareas de codificacion, flujos de trabajo agénticos y automatizacion de oficina, con una ventana de contexto de 262 144 tokens.

La cuantizacion IQ3_XXS aplicada por Thireus reduce el peso del modelo a aproximadamente 3,5 bits por parametro, lo que permite ejecutar un modelo de 27 000 millones de parametros en hardware de consumo con requisitos de VRAM reducidos. El sufijo "SPECIAL_SPLIT" indica un reparto de capas personalizado, probablemente optimizado para equilibrar la carga entre CPU y GPU en sistemas con memoria unificada o configuraciones hibridas. La licencia MIT de esta cuantizacion facilita su integracion en proyectos comerciales sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-language) |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | IQ3_XXS (aproximadamente 3,5 bits por peso) |
| Idiomas soportados | No disponible (el modelo base soporta multiples idiomas, pero la ficha no especifica cuales) |
| Licencia | MIT (cuantizacion); Apache 2.0 (modelo base) |
| Formato de pesos | GGUF (IQ3_XXS) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo transformer denso con un codificador de vision integrado, lo que le permite procesar tanto texto como imagenes. A diferencia de las arquitecturas MoE, todos los parametros se activan en cada inferencia, lo que simplifica el despliegue y ofrece una latencia mas predecible. El modelo base fue entrenado por Alibaba con un enfasis en tareas de codificacion, razonamiento multi-paso y uso de herramientas, con una ventana de contexto ampliada a 262 144 tokens.

La cuantizacion IQ3_XXS de Thireus utiliza una tecnica de cuantizacion de baja precision con escalado por filas, disenada para minimizar la perdida de perplejidad en comparacion con otros metodos al mismo nivel de bits. El "SPECIAL_SPLIT" sugiere una distribucion de capas optimizada para entornos con memoria compartida (como las GPU de NVIDIA con memoria unificada o sistemas Apple Silicon), donde parte de las capas se ejecutan en CPU y el resto en GPU. No se dispone de informacion detallada sobre el dataset de entrenamiento ni sobre el uso de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y razonamiento multi-paso con planificacion avanzada.
- Comprension de imagenes (vision-language) gracias al codificador visual integrado.
- Codificacion de software en multiples lenguajes, incluyendo generacion, explicacion y depuracion de codigo.
- Soporte de tool calling y function calling para integracion con APIs y servicios externos.
- Capacidades agénticas: manejo de feedback de herramientas y entornos en tareas de larga duracion.
- Automatizacion de oficina: generacion de documentos, resumenes, analisis de datos y presentaciones.
- Procesamiento de contexto largo (262 144 tokens) para documentos extensos o conversaciones multi-turno.

## Casos de uso

- Asistente de codigo en produccion: el modelo puede integrarse en IDE o pipelines de CI/CD para generar, revisar y corregir codigo. Su soporte de tool calling permite conectarlo a repositorios, linters y sistemas de testing.
- Automatizacion de documentos empresariales: redaccion de informes, actas, propuestas y presentaciones a partir de datos estructurados o conversaciones, aprovechando su capacidad de razonamiento y su contexto largo.
- Agente de atencion al cliente: gestion de conversaciones multi-turno con acceso a bases de conocimiento y APIs de CRM. La ventana de 262 144 tokens permite mantener el historial completo de la interaccion.
- Analisis de documentos extensos: resumen y extraccion de informacion de contratos, articulos cientificos o expedientes legales de cientos de paginas sin necesidad de dividir el texto.
- Asistente de investigacion multimodal: analisis de figuras, tablas y graficos en articulos cientificos, combinando la comprension de imagenes con el razonamiento textual.
- Despliegue en edge computing: gracias a la cuantizacion IQ3_XXS, el modelo puede ejecutarse en dispositivos con 12-16 GB de VRAM, como la Jetson AGX Orin o GPUs de consumo, para aplicaciones de vision por computador y automatizacion local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta cuantizacion en la informacion disponible. El modelo base Qwen3.8-27B ha publicado benchmarks oficiales, pero los datos concretos no estan incluidos en los resultados de busqueda. Se recomienda consultar el repositorio oficial de Qwen3.8-27B para obtener las cifras de MMLU, HumanEval, GSM8K y otras evaluaciones.

## Requisitos de hardware

- VRAM estimada: aproximadamente 12-14 GB para la cuantizacion IQ3_XXS (27B parametros a ~3,5 bits, mas overhead de calculo y cache KV).
- GPU recomendadas: NVIDIA RTX 4070/4080/4090, RTX 3090, A10, L4 o Jetson AGX Orin (64 GB). En configuraciones con SPECIAL_SPLIT, puede ejecutarse con 8-10 GB de VRAM si se descargan capas a CPU.
- Compatibilidad con hardware de consumo: si, en GPUs con 12 GB o mas de VRAM. Con el reparto especial, podria funcionar en 8 GB con degradacion de velocidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible. Depende del hardware, el reparto de capas y el tamaño de la cache KV. En una RTX 4090 se espera una velocidad de 10-20 tokens por segundo con contexto largo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262 144 | Apache 2.0 | safetensors | Modelo original sin cuantizar, requiere ~54 GB VRAM en BF16 |
| mtp-Qwen3.8-27B-THIREUS-IQ3_XXS | 27B | 262 144 | MIT | GGUF | Cuantizacion de Thireus, ~12 GB VRAM |
| Llama 3.1 8B (cuantizado) | 8B | 131 072 | Llama 3.1 | GGUF | Mucho menor, pero con menos capacidad de razonamiento y sin vision |
| Qwen2.5-VL-7B (cuantizado) | 7B | 32 768 | Apache 2.0 | GGUF | Alternativa multimodal mas pequena, con contexto limitado |

## Limitaciones y advertencias

- La cuantizacion IQ3_XXS introduce una perdida de precision que puede afectar a tareas de razonamiento complejo o generacion de codigo muy especifico. Se recomienda probar con cargas de trabajo reales antes de desplegar en produccion.
- El modelo base es multimodal, pero esta cuantizacion no especifica si el codificador de vision se ha cuantizado o se mantiene en precision completa. Esto puede afectar al rendimiento en tareas de vision.
- No se dispone de informacion sobre sesgos especificos del modelo. Como cualquier LLM, puede generar contenido sesgado o alucinar hechos, especialmente en contextos largos.
- La licencia MIT se aplica a la cuantizacion, pero el modelo base Qwen3.8-27B esta bajo Apache 2.0. Ambas licencias permiten uso comercial, pero Apache 2.0 incluye clausulas de patentes que conviene revisar.
- El "SPECIAL_SPLIT" puede no ser compatible con todos los runtimes GGUF. Verificar la compatibilidad con llama.cpp y otros motores antes de su uso.
- No hay informacion sobre el rendimiento en tareas de vision especificamente con esta cuantizacion. Los benchmarks del modelo base no son directamente extrapolables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Thireus/mtp-Qwen3.8-27B-THIREUS-IQ3_XXS-SPECIAL_SPLIT
- Cuantizacion BF16 del mismo autor: https://huggingface.co/Thireus/mtp-Qwen3.8-27B-THIREUS-BF16-SPECIAL_SPLIT
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Analisis de especificaciones y hardware: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Guia para Jetson: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
- Resumen de especificaciones y benchmarks: https://ai-tldr.dev/models/qwen3-8-27b/
