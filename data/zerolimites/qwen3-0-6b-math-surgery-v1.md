# zerolimites/Qwen3-0.6B-Math-Surgery-v1

## Resumen

Qwen3-0.6B-Math-Surgery-v1 es un modelo derivado de Qwen/Qwen3-0.6B, publicado por el usuario zerolimites en Hugging Face, en el que se ha aplicado una intervencion sobre los pesos ("weight surgery") para mejorar el razonamiento matematico exacto sin reentrenamiento completo. La tecnica empleada, segun la model card, combina una "proyeccion ortogonal de verbosidad" (Orthogonal Verbosity Projection) con una edicion de conocimiento basada en MEMIT con espacio nulo multiposicion (Multi-Position Null-Space MEMIT). El resultado es un modelo de 751.632.384 parametros totales (segun safetensors) que mantiene la arquitectura original de Qwen3-0.6B.

El modelo se distribuye tanto en formato safetensors (bfloat16, 1,51 GB) como en GGUF cuantizado Q8_0 (804 MB) y F16 (1,51 GB), ademas de un Modelfile para Ollama. La licencia es Apache 2.0, heredada del modelo base. Los idiomas declarados son ingles y portugues, lo que limita su uso directo en castellano sin evaluacion adicional.

Su relevancia radica en que demuestra una via de especializacion matematica de bajo coste computacional sobre modelos pequenos: el autor reporta una mejora del 43,33% al 73,33% de acierto en un benchmark propio de 30 problemas, con una sola regresion. No obstante, el benchmark es interno y no esta estandarizado, por lo que los resultados deben interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-0.6B; detalles de capas y atencion no disponibles en la informacion proporcionada) |
| Parametros totales | 751.632.384 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-0.6B, valor no confirmado) |
| Tipos de cuantizacion | bfloat16 (safetensors), F16 (GGUF), Q8_0 (GGUF) |
| Idiomas soportados | en, pt |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B y no se ha reentrenado desde cero: la intervencion consiste en una edicion quirurgica de pesos ("weight surgery"). Segun la model card, la v1 aplica dos tecnicas: Orthogonal Verbosity Projection, orientada a reducir la verbosidad en las respuestas, y Multi-Position Null-Space MEMIT, una variante de edicion de conocimiento que inserta o modifica informacion en los pesos preservando el comportamiento previo mediante restricciones en el espacio nulo. No se especifican el numero de tokens de entrenamiento ni la composicion del dataset, porque no hay entrenamiento convencional implicado.

No se detalla la arquitectura interna mas alla de su origen Qwen3 (transformer decoder-only con atencion causal), ni si se han modificado mecanismos como la atencion o el tokenizador. Tampoco se documentan procesos de RLHF o DPO adicionales; el ajuste se realiza exclusivamente mediante la edicion de pesos descrita. La innovacion tecnica destacable es precisamente el uso de MEMIT con espacio nulo multiposicion sobre un modelo de menos de mil millones de parametros, un enfoque poco habitual a esta escala.

## Capacidades

- Generacion de texto y razonamiento matematico exacto, con mejora reportada en un benchmark propio de 30 problemas.
- Razonamiento paso a paso orientado a la resolucion de problemas aritmeticos y algebraicos.
- Generacion de texto conversacional (pipeline text-generation, tag conversational).
- Soporte multilingue limitado a ingles y portugues segun los metadatos.
- No se documenta soporte de tool calling ni function calling en la informacion proporcionada.
- No se documenta soporte explicito de agentes o razonamiento multi-paso mas alla del razonamiento matematico.
- No se documenta vision, audio ni modo thinking explicito.
- Distribucion lista para Ollama, LM Studio y llama.cpp gracias a los GGUF incluidos.

## Casos de uso

- Resolucion de problemas matematicos en entornos educativos: el modelo puede emplearse como tutor de aritmetica y algebra basica, dado que su especializacion busca respuestas exactas y menos verbosas que el modelo base.
- Prototipado de pipelines de razonamiento matematico en local: al caber en GGUF Q8_0 (804 MB), permite experimentar en portatiles sin GPU dedicada.
- Evaluacion de tecnicas de edicion de pesos: util como caso de estudio para investigadores que quieran reproducir o comparar MEMIT y proyecciones ortogonales sobre modelos pequenos.
- Generacion de explicaciones paso a paso en portugues e ingles: adecuado para contenidos educativos en esos idiomas, no asi en castellano sin evaluacion previa.
- Integracion en asistentes de calculo dentro de aplicaciones de escritorio mediante Ollama y su Modelfile incluido.
- Filtrado y verificacion de respuestas matematicas en pipelines de datos: puede usarse como modelo auxiliar para comprobar resultados numericos en tareas de anotacion.
- Despliegue en entornos con recursos muy limitados (edge, CPU) gracias a su tamano reducido y a las cuantizaciones disponibles.

## Benchmarks y rendimiento

Los unicos datos disponibles proceden de la model card y corresponden a un benchmark propio de 30 problemas matematicos, no a benchmarks estandarizados:

| Modelo | Aciertos / Total | Precision (%) | Ganancia vs. base | Regresiones |
|---|---|---|---|---|
| Qwen/Qwen3-0.6B (base) | 13 / 30 | 43,33% | — | — |
| Qwen3-0.6B-Math-Surgery-v1 | 22 / 30 | 73,33% | +30,00% | 1 |
| Qwen3-0.6B-Math-Surgery-v2 (final) | 23 / 30 | 76,67% | +33,34% | 0 |

No se han publicado resultados de benchmarks estandarizados (MMLU, GSM8K, HumanEval u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6-2 GB en bfloat16/F16 y en torno a 1 GB en Q8_0, incluyendo overhead de runtime.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090); tambien funciona en CPU.
- Cabe holgadamente en GPU consumer y en sistemas integrados; el GGUF Q8_0 de 804 MB es apto para equipos con poca memoria.
- Opciones de despliegue: llama.cpp, Ollama (Modelfile incluido), LM Studio, y servidores compatibles con endpoints de Hugging Face (tag endpoints_compatible). vLLM y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B-Math-Surgery-v1 | 751.632.384 | no disponible | 73,33% en benchmark propio (30 problemas) | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| Qwen/Qwen3-0.6B (base) | ~0,6B | no disponible | 43,33% en el mismo benchmark | Apache 2.0 | Hugging Face |
| Qwen3-0.6B-Math-Surgery-v2 (final) | ~0,6B | no disponible | 76,67% en el mismo benchmark | Apache 2.0 | Referenciado en la model card; disponibilidad no confirmada |

No se dispone de comparaciones con otros modelos matematicos de tamano similar (por ejemplo, variantes especializadas de Qwen2.5-Math o Gemma) en la informacion proporcionada.

## Limitaciones y advertencias

- El benchmark empleado es propio (30 problemas) y no esta estandarizado; los porcentajes no son directamente comparables con GSM8K, MATH u otros conjuntos publicos.
- La edicion de pesos puede introducir regresiones no detectadas fuera del conjunto evaluado; la v1 reporta una regresion en el benchmark, aunque el autor indica cero en la v2.
- Idiomas declarados solo ingles y portugues; el rendimiento en castellano no esta evaluado y podria degradarse.
- Riesgo de alucinacion inherente a modelos de 0,6B, especialmente en problemas matematicos fuera de distribucion o con pasos largos.
- La model card esta redactada en portugues y el autor no documenta sesgos especificos; se aplican los sesgos heredados del modelo base Qwen3-0.6B.
- No se documentan limitaciones de contexto concretas mas alla de las del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero al ser una modificacion de pesos conviene verificar la procedencia y trazabilidad de los cambios antes de usarlo en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/zerolimites/Qwen3-0.6B-Math-Surgery-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- No se han encontrado en la busqueda web papers, blogs, repositorios o demos adicionales asociados a este modelo.
