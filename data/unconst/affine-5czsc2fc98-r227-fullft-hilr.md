# unconst/Affine-5czsc2fc98-r227-fullft-hilr

## Resumen
El modelo `unconst/Affine-5czsc2fc98-r227-fullft-hilr` es un checkpoint experimental de tipo Mixture of Experts (MoE) basado en la arquitectura Qwen3.5 MoE, desarrollado por el usuario `unconst`. Se trata de un merge LoRA realizado sobre el modelo base `kevin954/Affine-5dfqbbh8ev-sft`, que a su vez es un fine-tuning de un modelo previo. El checkpoint está etiquetado como multimodal (image-text-to-text) y orientado a generación de texto conversacional, con un total de 34.660.610.688 parámetros.

Su relevancia radica en ser un punto intermedio de un proceso de entrenamiento, descrito por el autor como "salvamento de checkpoint" y "no una submission hasta que se supere la fase 5". Esto implica que no es un modelo final optimizado para producción, sino un artefacto de investigación para evaluar la continuidad del entrenamiento o la calidad del merge LoRA. No se dispone de información sobre la longitud de contexto, licencia o idiomas soportados.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (Mixture of Experts) multimodal (image-text-to-text) |
| Parametros totales | 34.660.610.688 (34,66B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, probablemente bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura es un transformer MoE multimodal, basado en Qwen3.5 MoE. El modelo se ha obtenido mediante un merge LoRA sobre un fine-tuning previo (`kevin954/Affine-5dfqbbh8ev-sft`). No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni técnicas de alineación (RLHF/DPO). La etiqueta `affine-h1-merged-salvage` sugiere que es un checkpoint intermedio rescatado para continuar el entrenamiento o para evaluación interna, no un lanzamiento oficial.

## Capacidades
- Generación de texto y conversación multi-turno, según el pipeline `text-generation` y la etiqueta `conversational`.
- Procesamiento multimodal con entrada de imagen y texto (etiqueta `image-text-to-text`), aunque no se especifican los detalles de la codificación visual.
- Arquitectura MoE que permite una inferencia más eficiente en términos de cómputo activo en comparación con modelos densos del mismo tamaño total.
- No se confirma soporte para tool calling, function calling ni razonamiento multi-step en la información disponible.
- No se especifican capacidades multilingües concretas, aunque al estar basado en Qwen3.5 es probable que herede soporte multilingüe del modelo base, pero no se puede confirmar.

## Casos de uso
- Investigación de continuidad de entrenamiento: al ser un checkpoint intermedio, es útil para estudiar la evolución de las capacidades del modelo durante el fine-tuning y para reanudar entrenamientos interrumpidos.
- Evaluación de calidad de merge LoRA: permite analizar si la fusión de pesos LoRA sobre el modelo base ha degradado o mejorado métricas específicas antes de continuar con más fases de entrenamiento.
- Prototipado de aplicaciones multimodales: su capacidad de entrada imagen-texto permite experimentar con tareas de descripción de imágenes o VQA en entornos de investigación, aunque sin garantías de estabilidad.
- Pruebas de estabilidad de modelos intermedios: sirve para validar la robustez del modelo ante entradas adversarias o para detectar colapso de representaciones en fases tempranas del entrenamiento.
- Análisis de degradación de capacidades tras fine-tuning: comparando este checkpoint con el modelo base, se puede medir el impacto del fine-tuning en tareas generales de lenguaje.
- Experimentos de alineación y seguridad: al ser un modelo sin alineación confirmada, es un candidato para estudiar comportamientos no deseados y desarrollar técnicas de mitigación en modelos MoE.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: con 34,66B parámetros, en bf16 (tamaño del repo de 71.9 GB) se necesitan aproximadamente 70 GB de VRAM, lo que requiere GPUs de clase profesional.
- GPU recomendadas: H100 (80GB), A100 (80GB) o doble A100 (40GB) en configuración multi-GPU.
- En consumer GPU: no cabe en una RTX 4090 (24GB) en precisión completa, pero podría caber con cuantización a 4 bits (si estuviera disponible), ocupando aproximadamente 18-20 GB.
- Opciones de despliegue: vLLM, TGI o llama.cpp, siempre que el framework soporte la arquitectura Qwen3.5 MoE y el formato safetensors.
- Latencia y throughput estimados: no disponibles, al no haber benchmarks publicados.

## Comparativa con modelos similares
| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Arquitectura |
|---|---|---|---|---|---|
| unconst/Affine-5czsc2fc98-r227-fullft-hilr | 34,66B | no disponible | no disponible | no disponible | Qwen3.5 MoE multimodal |
| Qwen3-30B-A3B | 30B | 3B | 32K | Apache 2.0 | MoE denso |
| Mixtral 8x7B | 46,7B | 12,9B | 32K | Apache 2.0 | MoE denso |

La comparativa se basa en el tamaño total y la arquitectura MoE. El modelo de `unconst` es un checkpoint experimental sin licencia ni especificaciones claras, mientras que las alternativas son modelos estables y documentados. La falta de datos sobre parámetros activos y contexto impide una comparación técnica completa.

## Limitaciones y advertencias
- Checkpoint experimental: el autor lo describe como "salvamento" y "no una submission", por lo que no es apto para producción ni para uso crítico.
- Licencia no disponible: el uso comercial es incierto y podría violar términos de licencia del modelo base o de los datos de entrenamiento.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estándar, lo que impide evaluar su calidad relativa.
- Longitud de contexto no especificada: se desconoce el límite de tokens de entrada, lo que dificulta su uso en tareas de contexto largo.
- Riesgo de alucinación y comportamiento inestable: al ser un checkpoint intermedio sin alineación, es probable que genere respuestas incoherentes o incorrectas.
- Soporte multimodal no verificado: aunque está etiquetado como image-text-to-text, no se han publicado ejemplos ni métricas que confirmen su funcionamiento real.

## Enlaces
- HuggingFace: https://huggingface.co/unconst/Affine-5czsc2fc98-r227-fullft-hilr
