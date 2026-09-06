# yethdev/qwen3.5-2b-manumit-v2-GGUF

## Resumen

El modelo `yethdev/qwen3.5-2b-manumit-v2-GGUF` es una versión cuantizada en formato GGUF del modelo base `qwen3.5-2b-manumit-v2`, desarrollado por `yethdev`. Se trata de un modelo de generación de texto basado en el modelo Qwen3.5-2B de Qwen, al que se ha aplicado la técnica de ablación denominada `manumit`. Esta técnica identifica las direcciones del flujo residual que codifican el comportamiento de rechazo y las proyecta fuera de los pesos del modelo, eliminando la capa de seguridad. Posteriormente, el modelo se "cura" reentrenándolo sobre datos ordinarios para que la ablación no degrade sus capacidades generales.

El modelo se distribuye en tres cuantizaciones GGUF (Q4_K_M, Q5_K_M y Q8_0) para facilitar su ejecución en CPU o GPU pequeñas mediante llama.cpp, Ollama o LM Studio. Según las mediciones del autor, la tasa de rechazo en benchmarks de prompts dañinos (AdvBench y JailbreakBench) se reduce al 0,0%, mientras que el rendimiento en MMLU-Pro mejora de 17,0% a 23,8% respecto al modelo base. El número de parámetros totales es de aproximadamente 1.881.825.088 (1,88 mil millones), y el repositorio tiene un tamaño de 4,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-2B; detalles completos no disponibles) |
| Parametros totales | 1.881.825.088 (~1,88 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | MIT (el modelo base Qwen3.5-2B mantiene sus propios términos) |
| Formato de pesos | GGUF (el modelo base también está disponible en safetensors) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura del modelo base Qwen3.5-2B, que es un transformer de aproximadamente 1,88 mil millones de parámetros. Los detalles concretos de la arquitectura (número de capas, dimensiones ocultas, mecanismo de atención, etc.) no están disponibles en la información proporcionada. El método `manumit` consiste en localizar las direcciones del flujo residual asociadas al comportamiento de rechazo, proyectarlas fuera de los pesos y después "curar" el modelo entrenándolo sobre datos normales para compensar la pérdida de capacidades. El autor no especifica la composición del dataset de entrenamiento ni si se emplearon técnicas de RLHF o DPO.

Cabe destacar que la cabeza de predicción multi-token (multi-token prediction head) no está incluida en los archivos GGUF. Esta cabeza solo se utilizaba para decodificación especulativa automática, y su ausencia no afecta a la generación normal de texto.

## Capacidades

- Generación de texto sin capa de rechazo: el modelo responde a prompts que normalmente serían rechazados por un modelo alineado.
- Ejecución local en CPU o GPU pequeñas gracias a las cuantizaciones GGUF.
- Compatibilidad con llama.cpp, Ollama y LM Studio, además de otros entornos que soporten formato GGUF.
- Rendimiento en MMLU-Pro de 23,8%, según los datos del autor, superior al modelo base (17,0%).
- No se especifican capacidades de tool calling, function calling, agentes, visión o audio en la información proporcionada.

## Casos de uso

- Investigación en seguridad y alineación: el modelo permite estudiar los efectos de la ablación del comportamiento de rechazo en un modelo de lenguaje, comparando sus respuestas con las del modelo base alineado.
- Prototipos de generación de texto libre: en aplicaciones creativas como ficción interactiva o roleplay, donde un sistema de rechazo demasiado estricto interrumpe la experiencia de usuario, este modelo puede generar respuestas sin esos bloqueos.
- Inferencia en hardware limitado: gracias a la cuantización Q4_K_M (1,3 GB), el modelo se puede ejecutar en portátiles o dispositivos con poca memoria, lo que lo hace útil para entornos sin acceso a GPUs potentes.
- Despliegue en Ollama para chatbots personalizados: los usuarios pueden integrar el modelo en un pipeline local mediante `ollama run hf.co/yethdev/qwen3.5-2b-manumit-v2-GGUF:Q4_K_M`, obteniendo un asistente sin filtros de seguridad.
- Evaluación de modelos ablacionados: el modelo sirve como referencia en estudios comparativos de rendimiento entre modelos con y sin capa de rechazo, utilizando benchmarks como MMLU-Pro.
- Entornos educativos: puede utilizarse para demostrar cómo los modelos de lenguaje aprenden y gestionan el rechazo, y qué sucede cuando se elimina esa capacidad.

## Benchmarks y rendimiento

Según los datos proporcionados por el autor en la model card, los resultados son los siguientes:

| Metrica | Este modelo | Modelo base |
|---|---|---|
| AdvBench refusal | 0,0% | alto |
| JailbreakBench refusal | 0,0% | alto |
| MMLU-Pro | 23,8% | 17,0% |

No se han publicado resultados de benchmarks adicionales en la información disponible. Los datos de "alto" para el modelo base son aproximaciones cualitativas del autor, no valores numéricos exactos.

## Requisitos de hardware

- Tamaños de los archivos GGUF: Q4_K_M (1,3 GB), Q5_K_M (1,4 GB), Q8_0 (2,0 GB).
- VRAM estimada para inferencia: para Q4_K_M, aproximadamente 1,3 GB de pesos, más overhead de inferencia, por lo que se recomienda una GPU con al menos 2 GB de VRAM. Para Q8_0, se recomiendan al menos 3 GB de VRAM.
- GPU recomendadas: modelos con 2 a 4 GB de VRAM, como RTX 3050, RTX 2060 o GPUs de gama baja. También puede ejecutarse en CPU con 4 a 8 GB de RAM, aunque con menor velocidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier otro framework compatible con GGUF.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

La información disponible no incluye datos de comparación con otros modelos de la misma categoría. La única comparación directa posible es con el modelo base del que deriva:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| yethdev/qwen3.5-2b-manumit-v2-GGUF | 1.881.825.088 | no disponible | MIT | GGUF (Q4_K_M, Q5_K_M, Q8_0) |
| Qwen/Qwen3.5-2B (modelo base) | no disponible | no disponible | no disponible | safetensors |

No se han identificado otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo no incluye capa de seguridad ni modelo guardián que supervise la salida. El autor advierte explícitamente que el usuario es responsable del contenido generado y debe cumplir con la ley y los términos del modelo base.
- Riesgo de generación de contenido dañino, ilegal o no ético al no existir mecanismos de rechazo.
- No se especifican sesgos conocidos ni riesgo de alucinación.
- La licencia MIT se aplica a este repositorio, pero el modelo base Qwen3.5-2B mantiene sus propios términos, que pueden imponer restricciones adicionales.
- La ausencia de la cabeza de predicción multi-token solo afecta a la decodificación especulativa automática, no a la generación normal, pero puede limitar la velocidad en algunos escenarios.
- No se proporcionan datos sobre la longitud de contexto, idiomas soportados ni capacidades de tool calling, por lo que su comportamiento en estos aspectos es desconocido.

## Enlaces

- https://huggingface.co/yethdev/qwen3.5-2b-manumit-v2-GGUF
- https://huggingface.co/yethdev/qwen3.5-2b-manumit-v2
- https://huggingface.co/Qwen/Qwen3.5-2B (modelo base)
- No se encontraron papers, blogs o repositorios adicionales en la búsqueda web.
