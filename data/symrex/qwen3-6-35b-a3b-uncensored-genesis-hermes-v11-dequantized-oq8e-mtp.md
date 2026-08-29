# symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11-dequantized-oQ8e-mtp

## Resumen

El modelo `symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11-dequantized-oQ8e-mtp` es una variante cuantizada del modelo Qwen3.6-35B-A3B, una arquitectura de mezcla de expertos (MoE) de la familia Qwen 3.6. Esta version concreta ha sido procesada con la herramienta oQ (oMLX v0.6.3) para producir pesos en formato MLX safetensors con cuantizacion mixta de 8 bits y grupo de tamano 64, optimizada para ejecucion en hardware Apple Silicon. El repositorio contiene 38.6 GB de datos y los parametros totales registrados en los safetensors ascienden a 10.433.711.024, lo que refleja la cuantizacion aplicada y no el tamano original del modelo sin comprimir.

La denominacion "Uncensored" indica que se trata de un ajuste fino orientado a eliminar ciertos sesgos de seguridad del modelo base, aunque esta afirmacion debe tomarse con cautela y verificarse de forma independiente. El sufijo "Genesis-Hermes-V11" sugiere un proceso de entrenamiento adicional con recetas similares a las de la familia Hermes (datasets sinteticos y preferencias humanas), pero no se dispone de documentacion oficial al respecto en la informacion facilitada. Este modelo es relevante porque ofrece una alternativa de alto rendimiento con un coste de inferencia relativamente bajo gracias a su arquitectura MoE con aproximadamente 3.000 millones de parametros activos, y su cuantizacion a 8 bits permite su despliegue en equipos de consumo con 32 GB de RAM unificada o mas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (MoE con atencion hibrida lineal + softmax, segun informacion publica de la serie Qwen 3.6) |
| Parametros totales | 35.000 millones (estimado segun la serie Qwen3.6-35B-A3B); 10.433.711.024 en los safetensors cuantizados |
| Parametros activos | Aproximadamente 3.000 millones (dato de la serie Qwen3.6-35B-A3B) |
| Longitud de contexto | 262.144 tokens (segun informacion publica de la serie Qwen3.6-35B-A3B) |
| Tipos de cuantizacion | 8 bits, group size 64, cuantizacion mixta oQ (MLX) |
| Idiomas soportados | no disponible (la serie Qwen 3.6 es multilingue, pero no se confirma para esta variante) |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (cuantizados con oQ) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a la serie Qwen3.6-35B-A3B, un modelo de mezcla de expertos que combina atencion lineal con atencion softmax completa en una proporcion 3:1, segun la documentacion publica de la serie. Este diseno hibrido reduce el coste computacional en contextos largos manteniendo la calidad en tareas que requieren atencion precisa. El modelo base fue entrenado por el equipo de Qwen con datos multilingues y posteriormente ajustado por terceros para crear la variante "Uncensored-Genesis-Hermes", presumiblemente mediante fine-tuning supervisado y optimizacion de preferencias, aunque no se dispone de detalles concretos sobre el dataset o el proceso de entrenamiento de esta version especifica.

La cuantizacion aplicada con oQ (oMLX v0.6.3) es de tipo mixto: asigna 8 bits por peso con un grupo de 64 parametros, lo que permite reducir el tamano del modelo a aproximadamente 10.400 millones de parametros almacenados. Esta tecnica es habitual para desplegar modelos grandes en hardware Apple Silicon mediante MLX, y el resultado es un modelo que ocupa 38.6 GB en disco, apto para equipos con 48 GB o mas de memoria unificada.

## Capacidades

- Generacion de texto y razonamiento complejo en multiples dominios, gracias a los 35.000 millones de parametros totales y 3.000 millones activos.
- Soporte de contexto largo de hasta 262.144 tokens, lo que permite procesar documentos extensos, libros completos o conversaciones muy largas.
- Capacidades de codigo y agentes, segun la serie Qwen 3.6 que introduce "Agentic Coding" y "Thinking Preservation".
- Razonamiento multi-paso y modo de pensamiento, aunque no se confirma si esta variante conserva estas funciones tras el ajuste fino.
- Capacidades multilingues heredadas del modelo base Qwen 3.6, aunque no se especifican los idiomas exactos en esta version.
- La variante "Uncensored" pretende reducir las restricciones de seguridad del modelo base, aunque esto no garantiza la eliminacion completa de sesgos.

## Casos de uso

- Analisis de documentos extensos: con su contexto de 262K tokens, el modelo puede resumir o extraer informacion de libros tecnicos, expedientes legales o informes anuales completos en una sola pasada, sin necesidad de dividir el texto.
- Desarrollo de agentes autonomos: su arquitectura MoE con 3.000 millones de parametros activos permite ejecutar bucles de razonamiento multi-paso con latencia moderada, adecuado para agentes que necesitan planificar y ejecutar tareas con herramientas externas.
- Generacion de codigo en entornos locales: desarrolladores que necesitan un asistente de codigo sin enviar datos a la nube pueden ejecutar este modelo en una estacion de trabajo con 48 GB de RAM unificada, gracias a la cuantizacion MLX.
- Investigacion en alineacion y seguridad: la variante "Uncensored" permite estudiar los efectos del fine-tuning en la eliminacion de sesgos de seguridad y comparar el comportamiento con el modelo base.
- Procesamiento de conversaciones de soporte tecnico: el contexto largo y la capacidad de razonamiento permiten mantener historiales completos de interacciones con clientes y generar respuestas coherentes sin perder informacion previa.
- Creacion de contenido creativo sin restricciones: escritores y creadores pueden explorar temas sensibles sin los filtros habituales del modelo base, aunque deben verificar la calidad y veracidad de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La serie Qwen3.6-35B-A3B reporta en fuentes publicas mejoras en tareas de codigo y razonamiento frente a Qwen3.5, pero no hay datos especificos para esta variante cuantizada y ajustada.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado a 8 bits ocupa aproximadamente 38.6 GB en disco. Para inferencia con MLX se recomiendan al menos 48 GB de memoria unificada en Apple Silicon (M2 Ultra, M3 Max o superior).
- GPU compatibles: cualquier Mac con chip Apple Silicon y 48 GB o mas de RAM unificada. En GPU de NVIDIA no se puede ejecutar directamente el formato MLX, aunque podria convertirse a otros formatos con herramientas adicionales.
- Opciones de despliegue: MLX (libreria nativa de Apple), con soporte para generacion autoregresiva y posible integracion con frameworks como mlx-lm.
- No se dispone de datos de latencia o throughput para esta variante especifica, pero los modelos MoE con 3.000 millones de parametros activos suelen ofrecer velocidades de 20-40 tokens por segundo en hardware Apple Silicon de gama alta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35B total / 3B activo | 262K | Apache 2.0 (serie Qwen 3.6) | safetensors |
| Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive | 35B total / 3B activo | 262K | no disponible | safetensors |
| Qwen3.6-27B (dense) | 27B | 262K | Apache 2.0 (serie Qwen 3.6) | safetensors |
| symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11 | 35B total / 3B activo | 262K | no disponible | MLX safetensors (8-bit) |

La variante de symrex se distingue por su formato MLX cuantizado, que la hace especialmente adecuada para hardware Apple, mientras que las alternativas en safetensors requieren conversion o herramientas adicionales para ese entorno.

## Limitaciones y advertencias

- No se dispone de informacion sobre la licencia: el uso comercial podria estar restringido o requerir verificacion con el autor.
- La denominacion "Uncensored" no implica ausencia total de sesgos; el modelo puede generar contenido ofensivo o incorrecto y debe usarse con precaucion en entornos de produccion.
- No hay datos sobre el dataset de entrenamiento del ajuste fino, por lo que se desconocen posibles sesgos introducidos en esa fase.
- La cuantizacion a 8 bits puede degradar ligeramente la calidad de las respuestas frente al modelo en precision completa, especialmente en tareas de razonamiento complejo.
- La falta de benchmarks publicos impide evaluar objetivamente el rendimiento relativo de esta variante.
- El formato MLX limita el despliegue a hardware Apple Silicon; para otros entornos se requiere conversion a formatos como GGUF o safetensors estandar, lo que puede introducir perdidas adicionales.
- No se ha verificado la compatibilidad con herramientas de inferencia como vLLM o llama.cpp, por lo que la integracion en pipelines existentes puede requerir trabajo adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11-dequantized-oQ8e-mtp
- Herramienta de cuantizacion oQ: https://github.com/jundot/omlx
- Guia de Qwen 3.6 (insiderllm): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Articulo sobre Qwen3.6-35B-A3B Uncensored (hackernoon): https://hackernoon.com/qwen36-35b-a3b-uncensored-a-35b-moe-model-with-262k-context
- Documentacion tecnica de Qwen3.6 (DeepWiki): https://deepwiki.com/QwenLM/Qwen3.6/1.1-qwen3.6-models
