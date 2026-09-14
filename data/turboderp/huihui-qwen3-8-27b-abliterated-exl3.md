# turboderp/Huihui-Qwen3.8-27B-abliterated-exl3

## Resumen

`turboderp/Huihui-Qwen3.8-27B-abliterated-exl3` es una cuantización en formato EXL3 del modelo `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, publicada por turboderp, autor de ExLlamaV2, ExLlamaV3 y TabbyAPI. No se trata de un modelo entrenado desde cero: el repositorio contiene pesos convertidos a 4,00 bits por peso (bpw) para su ejecución con el runtime ExLlamaV3, con licencia Apache 2.0.

El modelo base pertenece a la familia Qwen3 en una variante de 27B y ha sido sometido a "abliteration", una técnica de ablación direccional que elimina en el espacio de activaciones las direcciones asociadas a la negativa a responder, de modo que el modelo resultante no aplica los rechazos del modelo original. Esto lo hace relevante para investigación sobre alineamiento y seguridad, así como para despliegues locales que requieren generación sin filtros, pero lo convierte en una opción inadecuada para aplicaciones de cara al público sin moderación adicional.

La ficha no documenta longitud de contexto, idiomas soportados, composición del dataset de entrenamiento ni resultados de benchmarks, y la búsqueda web no ha devuelto ningún enlace relacionado con este modelo. Todos los datos no confirmados se marcan como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (el modelo base pertenece a la familia Qwen3; la ficha no detalla si es transformer denso, MoE o híbrido) |
| Parámetros totales | 27.000 millones (según la denominación del modelo base; no confirmado en la ficha) |
| Parámetros activos | No disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | EXL3 a 4,00 bits por peso (bpw); el repositorio ocupa 16,5 GB |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | EXL3 (formato de cuantización de ExLlamaV3) |
| Relación con el modelo base | `quantized` (cuantización del modelo `huihui-ai/Huihui-Qwen3.8-27B-abliterated`) |
| Autor de la cuantización | turboderp |

## Arquitectura y entrenamiento

Este repositorio no incluye ningún entrenamiento propio: es una conversión de pesos del modelo `huihui-ai/Huihui-Qwen3.8-27B-abliterated` al formato EXL3 de ExLlamaV3, con una tasa de 4,00 bits por peso. El formato EXL3 emplea cuantización con estructura de retícula (trellis) derivada de QTIP, según la documentación pública del proyecto ExLlamaV3; la model card no especifica el conjunto de calibración ni el proceso exacto de cuantización empleado.

El modelo base es, a su vez, un derivado "abliterated" de un modelo Qwen3 de 27B: mediante ablación direccional se eliminan las direcciones de activación responsables de las respuestas de rechazo, lo que da lugar a un modelo sin los filtros de negativa habituales. La ficha no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO, ni en el modelo original ni en el proceso de abliteración.

## Capacidades

La model card de esta cuantización no documenta capacidades funcionales. Al tratarse de una conversión de pesos, las capacidades son las del modelo base, que tampoco las detalla. Por herencia de la familia Qwen3 y sin verificación en la información disponible, cabría esperar:

- Generación de texto y razonamiento multi-turno, sujeto a las capacidades reales del modelo base (no documentadas).
- Generación de código y resolución de problemas matemáticos (no verificado).
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la ficha no lista idiomas.
- Modo "thinking" explícito, visión o audio: no disponible en la información proporcionada.
- Característica diferencial confirmada: ausencia de rechazos por alineamiento, consecuencia directa de la abliteración del modelo base.

## Casos de uso

- Inferencia local en una sola GPU de consumo: gracias a sus 4,00 bpw, los pesos ocupan aproximadamente 13,5 GB y el modelo puede ejecutarse en una RTX 3090 o RTX 4090 de 24 GB con contexto moderado, sin necesidad de infraestructura multigpu.
- Investigación sobre abliteración y alineamiento: permite comparar el comportamiento del modelo con y sin direcciones de rechazo ablacionadas, usando la misma arquitectura y pesos de referencia que el modelo base sin cuantizar.
- Red teaming y evaluación de seguridad: al no aplicar rechazos, resulta útil como generador de casos adversarios y para medir la eficacia de filtros externos en pipelines de moderación.
- Generación creativa sin restricciones: escritura de ficción, narrativa o guiones que abordan temas que los modelos alineados suelen rechazar, con revisión humana posterior obligatoria.
- Despliegue privado on-premise: al ser pesos descargables con licencia Apache 2.0, puede ejecutarse en infraestructura propia sin enviar datos a APIs externas, en escenarios con requisitos de confidencialidad.
- Servicio de inferencia autoalojado: mediante ExLlamaV3 y un servidor compatible como TabbyAPI, se puede exponer una API compatible con OpenAI para aplicaciones internas.
- Experimentación con cuantización EXL3: sirve como referencia para medir la degradación de calidad de una cuantización a 4,00 bpw frente a los pesos completos del modelo base.
- Base para ajuste fino con QLoRA o técnicas similares: aunque el formato EXL3 está orientado a inferencia, el modelo base sin cuantizar permite experimentar con adaptadores y comparar después el resultado cuantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio se limita a indicar que se trata de una cuantización EXL3 a 4,00 bpw del modelo `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, sin tabla de resultados. Tampoco se dispone de métricas de throughput o latencia.

## Requisitos de hardware

- Pesos a 4,00 bpw: aproximadamente 13,5 GB para 27.000 millones de parámetros (27e9 × 4 / 8). El repositorio ocupa 16,5 GB en total, incluyendo metadatos y ficheros auxiliares.
- VRAM estimada: 15-16 GB con contexto corto; 18-24 GB si se trabaja con ventanas de contexto amplias, ya que la caché KV depende de un número de capas y cabezas KV que no se detalla en la ficha.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para uso en una sola tarjeta; RTX 5090 (32 GB) con mayor holgura de contexto; A100 40/80 GB y H100 para servicio concurrente.
- GPU de consumo: cabe en tarjetas de 24 GB o más. En GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) no hay margen suficiente para pesos más caché KV a contextos razonables.
- Opciones de despliegue: ExLlamaV3 y servidores basados en él, como TabbyAPI. El formato EXL3 no es compatible con llama.cpp, Ollama, LM Studio ni con vLLM, que trabajan con GGUF, GPTQ, AWQ o FP8.
- Aceleración por hardware: EXL3 está diseñado para GPUs NVIDIA con CUDA; en la información disponible no se documenta soporte para CPU, Metal ni ROCm.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Formato | Tamaño en disco | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (EXL3 4,00 bpw) | EXL3 (ExLlamaV3) | 16,5 GB (repo) | No disponible | Apache 2.0 | HuggingFace; requiere ExLlamaV3 |
| `huihui-ai/Huihui-Qwen3.8-27B-abliterated` | Pesos completos (safetensors, precisión no confirmada) | Aproximadamente 54 GB si es bf16/fp16 (estimación basada en 27.000 millones de parámetros) | No disponible | Apache 2.0 según etiqueta | HuggingFace; requiere transformers o vLLM |
| Otras cuantizaciones del mismo base (GGUF, EXL2, AWQ) | Diversos | No disponible | No disponible | Apache 2.0 (heredada) | No confirmadas en la información proporcionada |

La información disponible no incluye datos de rendimiento comparado con otros modelos de la misma categoría, por lo que no es posible establecer una comparativa de calidad.

## Limitaciones y advertencias

- Modelo abliterated: la eliminación de las direcciones de rechazo implica que el modelo puede generar contenido dañino, ilegal o inseguro sin aplicar negativas. No debe exponerse directamente al público sin capas de moderación externas.
- Responsabilidad legal del despliegue: la licencia Apache 2.0 permite uso comercial, pero la ausencia de filtros traslada al operador toda la responsabilidad sobre el contenido generado.
- Cuantización a 4,00 bpw: existe degradación esperable de la calidad frente a los pesos completos, especialmente en tareas de razonamiento largo y generación de código. No se han publicado mediciones de esa pérdida.
- Sin datos de entrenamiento: no se documenta el dataset, el número de tokens ni el proceso de alineamiento del modelo base, lo que impide auditar sesgos o procedencia de los datos.
- Idiomas y contexto desconocidos: la ficha no lista idiomas soportados ni la longitud de contexto, un dato crítico para planificar despliegues.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; la ficha no aporta evaluaciones de factualidad.
- Derivado de terceros: no es un modelo oficial de Qwen ni de huihui-ai; no cabe esperar mantenimiento, parches de seguridad ni soporte por parte de los autores originales.
- Compatibilidad restringida: al estar en formato EXL3, no se puede ejecutar en los runtimes más extendidos (llama.cpp, Ollama, vLLM), lo que limita las opciones de despliegue y escalado.
- Repositorio sin tracción: cero descargas y cero "likes" en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/turboderp/Huihui-Qwen3.8-27B-abliterated-exl3
- Rama de 4,00 bpw: https://huggingface.co/turboderp/Huihui-Qwen3.8-27B-abliterated-exl3/tree/4.00bpw
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Perfil del autor de la cuantización: https://huggingface.co/turboderp
- Organización huihui-ai: https://huggingface.co/huihui-ai
- Repositorio de ExLlamaV3: https://github.com/turboderp-org/exllamav3
- TabbyAPI (servidor de inferencia basado en ExLlama): https://github.com/theroyallab/tabbyAPI
- Búsqueda web: no se han encontrado enlaces relevantes sobre este modelo; los resultados devueltos correspondían a herramientas de edición fotográfica y no guardan relación con la ficha.
