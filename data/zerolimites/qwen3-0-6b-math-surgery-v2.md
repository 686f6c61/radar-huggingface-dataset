# zerolimites/Qwen3-0.6B-Math-Surgery-v2

## Resumen

Qwen3-0.6B-Math-Surgery-v2 es una modificación por cirugía de pesos (*weight surgery*) del modelo base Qwen/Qwen3-0.6B, publicada por el usuario zerolimites en HuggingFace. El objetivo declarado es mejorar el razonamiento matemático exacto del modelo sin reentrenamiento completo, aplicando técnicas de edición de conocimiento basadas en MEMIT (Mass-Editing Memory in a Transformer) combinadas con proyección ortogonal y un pulido específico de la capa 27. El resultado es un modelo de 751.632.384 parámetros (aproximadamente 0,75 mil millones) que conserva la arquitectura y licencia del modelo original.

La relevancia de esta ficha radica en que ejemplifica una tendencia creciente: la especialización de modelos pequeños mediante edición directa de pesos en lugar de fine-tuning tradicional. El autor reporta una mejora de 13/30 a 23/30 aciertos en un benchmark matemático propio de 30 problemas, pasando de 43,33% a 76,67% de precisión, con cero regresiones respecto a la versión v1. Se distribuye en safetensors (bfloat16) y GGUF en cuantizaciones Q8_0 y F16, lo que facilita su despliegue local.

Es importante señalar que el modelo tiene un volumen muy bajo de adopción (0 descargas, 0 likes en el momento de la consulta) y que el benchmark reportado es interno y de tamaño reducido (30 problemas), por lo que los resultados deben interpretarse con cautela y no como una validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-0.6B) |
| Parametros totales | 751.632.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | bfloat16 (safetensors), Q8_0 (GGUF 8-bit), F16 (GGUF 16-bit) |
| Idiomas soportados | en, pt |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-0.6B original, un transformer decoder-only de aproximadamente 0,75 mil millones de parámetros. No se ha realizado un reentrenamiento desde cero ni un fine-tuning convencional: la modificación se lleva a cabo mediante cirugía de pesos, una técnica que edita directamente matrices de pesos específicas para inyectar o reforzar conocimiento factual y de razonamiento. Según la model card, la versión v2 combina tres técnicas: proyección ortogonal híbrida, MEMIT multi-clave en espacio nulo (*Multi-Key Null-Space MEMIT*) y un pulido de margen en la capa 27 (*Layer-27 Margin Polishing*).

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que al no tratarse de un entrenamiento convencional estos datos no aplican del mismo modo. La innovación técnica principal es precisamente el uso de MEMIT para editar el conocimiento matemático del modelo preservando el resto de capacidades, lo que el autor cuantifica como cero regresiones en su benchmark interno. No se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional y de tipo instrucción, heredada del modelo base Qwen3-0.6B.
- Razonamiento matemático reforzado mediante edición de pesos, con mejora reportada en aritmética y resolución de problemas exactos.
- Soporte de tool calling y function calling: no disponible en la información proporcionada (el modelo base Qwen3 sí lo soporta, pero no se confirma que se conserve tras la cirugía).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües limitadas a inglés (en) y portugués (pt) según los metadatos.
- Modo thinking: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles (modelo solo de texto).

## Casos de uso

- Tutoría matemática automatizada: el modelo puede resolver problemas aritméticos y de razonamiento numérico paso a paso, aprovechando la mejora reportada en exactitud matemática para entornos educativos de bajo coste computacional.
- Asistente de cálculo en aplicaciones embebidas: con 0,75 mil millones de parámetros y una versión GGUF Q8_0 de 804 MB, cabe en dispositivos con recursos limitados y puede integrarse en apps de escritorio o móviles para resolver operaciones.
- Generación de explicaciones matemáticas en portugués e inglés: útil para plataformas de aprendizaje dirigidas a audiencias lusófonas y anglófonas, dado el soporte declarado de ambos idiomas.
- Prototipado rápido de pipelines de razonamiento: investigadores pueden usar el modelo como banco de pruebas para estudiar el efecto de la cirugía de pesos (MEMIT) sobre capacidades específicas sin coste de entrenamiento.
- Filtrado y verificación de respuestas numéricas: en pipelines de generación aumentada, el modelo puede actuar como verificador de resultados matemáticos simples antes de devolver una respuesta al usuario.
- Despliegue local con Ollama o LM Studio: gracias al Modelfile incluido y a los GGUF Q8_0/F16, permite experimentar con un modelo especializado en matemáticas en un portátil sin GPU dedicada.
- Investigación sobre edición de conocimiento: sirve como caso de estudio reproducible para comparar técnicas de weight surgery (MEMIT, proyección ortogonal) frente a fine-tuning clásico en modelos pequeños.

## Benchmarks y rendimiento

El autor reporta resultados en un benchmark matemático propio de 30 problemas. No se especifica la composición exacta de dicho benchmark ni si es público.

| Modelo | Aciertos / Total | Precisión (%) | Ganancia vs. base | Regresiones |
|---|---|---|---|---|
| Qwen/Qwen3-0.6B (base) | 13 / 30 | 43,33% | — | — |
| Qwen3-0.6B-Math-Surgery-v1 | 22 / 30 | 73,33% | +30,00% | 1 |
| Qwen3-0.6B-Math-Surgery-v2 | 23 / 30 | 76,67% | +33,34% | 0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos anteriores provienen exclusivamente de la model card del autor y no han sido validados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,5 GB solo para pesos, más overhead de activaciones y caché KV (estimación típica de 2-3 GB en total para contextos moderados).
- VRAM estimada en GGUF Q8_0: aproximadamente 0,8 GB para pesos, con un total estimado de 1,5-2 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4060, RTX 4090, así como GPUs de datacenter A100 o H100 (sobradas para este tamaño).
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con 4 GB o más de VRAM; también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp, Ollama (Modelfile incluido), LM Studio, y presumiblemente vLLM o TGI para los safetensors (no confirmado en la información proporcionada).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-0.6B-Math-Surgery-v2 | 751.632.384 | no disponible | Apache 2.0 | safetensors, GGUF | Especializado en matemáticas vía weight surgery; benchmark interno 76,67% |
| Qwen/Qwen3-0.6B (base) | ~0,6B | no disponible | Apache 2.0 | safetensors | Modelo original sin especializar; 43,33% en el mismo benchmark interno |
| Qwen2.5-Math-1.5B | ~1,5B | no disponible | Apache 2.0 | safetensors | Especializado en matemáticas mediante entrenamiento; mayor tamaño |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1,5B | no disponible | MIT (según variante) | safetensors, GGUF | Destilado con razonamiento; mayor tamaño y adopción |

La comparación con Qwen2.5-Math-1.5B y DeepSeek-R1-Distill-Qwen-1.5B se ofrece como referencia de categoría (modelos pequeños especializados en matemáticas/razonamiento); no se dispone de resultados comparativos directos en el mismo benchmark.

## Limitaciones y advertencias

- El benchmark reportado es interno, de solo 30 problemas y no ha sido validado de forma independiente; la mejora real en matemáticas generales puede diferir.
- Riesgo de sobreajuste al conjunto de problemas usado para la cirugía de pesos: MEMIT inyecta conocimiento específico y podría no generalizar a problemas matemáticos fuera de la distribución evaluada.
- Riesgo de alucinación inherente a un modelo de 0,75 mil millones de parámetros, especialmente en razonamiento multi-paso complejo.
- Idiomas limitados a inglés y portugués según los metadatos; el rendimiento en castellano no está garantizado.
- Longitud de contexto no documentada en la información proporcionada; conviene verificar la del modelo base antes de usarlo en tareas de contexto largo.
- Adopción prácticamente nula (0 descargas, 0 likes) y autor sin historial verificable: no hay evidencia de la comunidad sobre su robustez en producción.
- Aunque la licencia es Apache 2.0 (permite uso comercial), el modelo base Qwen3-0.6B también es Apache 2.0, por lo que no hay restricciones adicionales conocidas; aun así, conviene revisar los términos del modelo base.
- La cirugía de pesos puede haber degradado capacidades no evaluadas (tool calling, multilingüismo, instrucciones generales) aunque el autor reporte cero regresiones en su benchmark matemático.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zerolimites/Qwen3-0.6B-Math-Surgery-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Paper de MEMIT (referencia técnica citada en la model card): no disponible en la información proporcionada
- Repositorio o demo adicional: no disponible en la información proporcionada
