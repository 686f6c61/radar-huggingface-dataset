# Xgspt123/AngelAI-8a

## Resumen

AngelAI-8a es un ajuste fino publicado en HuggingFace por el usuario Xgspt123, desarrollado a partir del modelo base unsloth/Qwen3.5-2B. Se distribuye con licencia Apache 2.0, en formato safetensors y con la etiqueta de librería transformers, orientado a generación de texto. El repositorio ocupa 0,2 GB y fue creado el 10 de septiembre de 2026; en el momento de redactar esta ficha acumula 0 descargas y 0 "likes", por lo que no existe validación por parte de la comunidad.

La model card publicada es la plantilla automática que genera Unsloth tras un entrenamiento: confirma el modelo base, el desarrollador, la licencia y que el entrenamiento se realizó con Unsloth, pero no documenta dataset, hiperparámetros, número de tokens, proceso de alineación ni resultados de evaluación. Las etiquetas del repositorio (unsloth, trl, qwen3_5, text-generation-inference, endpoints_compatible) indican que se trata de un fine-tuning supervisado con TRL sobre la familia Qwen3.5 y que el autor lo declara compatible con endpoints de inferencia.

Es relevante únicamente como ejemplo de flujo de trabajo de fine-tuning ligero: un modelo de aproximadamente 2.000 millones de parámetros que puede ejecutarse en hardware de consumo. No obstante, la ausencia total de documentación técnica y de métricas hace que, a día de hoy, no sea evaluable para uso en producción sin una batería de pruebas propia. El significado del sufijo "8a" en el nombre no está documentado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base pertenece a la familia Qwen3.5; la model card no especifica la arquitectura) |
| Parametros totales | aproximadamente 2.000 millones, segun el identificador del modelo base (`Qwen3.5-2B`); no confirmado en la model card |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene pesos en safetensors (0,2 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Desarrollador | Xgspt123 |
| Modelo base | unsloth/Qwen3.5-2B |
| Libreria | transformers |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-10 |
| Fecha de actualizacion | 2026-09-10 |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna. Dado que el modelo base es unsloth/Qwen3.5-2B, se hereda la arquitectura de esa familia, pero la model card no aporta detalles sobre atención, tipo de transformer, uso de atención lineal o decodificación especulativa. Tampoco se indica si el fine-tuning ha modificado la ventana de contexto respecto al modelo original.

Lo único documentado del entrenamiento es el marco de trabajo: Unsloth, con la afirmación del autor de que el modelo "fue entrenado 2 veces más rápido con Unsloth", y la presencia de la etiqueta TRL, que sugiere un ajuste supervisado (SFT) o un entrenamiento con optimización por preferencias. No se especifican número de tokens, composición del dataset, idioma del corpus de ajuste, si hubo RLHF o DPO, ni si se congelaron capas. Tampoco se indica si se aplicaron técnicas como LoRA/QLoRA o un fine-tuning completo.

Un dato que conviene señalar: un modelo de ~2.000 millones de parámetros en bf16 ocuparía del orden de 4 GB, mientras que el repositorio declarado es de 0,2 GB. Esa discrepancia sugiere que los pesos podrían estar cuantizados de forma agresiva, que el repositorio contiene solo una parte de los ficheros o que se trata de un adaptador, pero ninguna de estas hipótesis está confirmada en la información disponible.

## Capacidades

- Generación de texto: es la única capacidad respaldada por las etiquetas del repositorio (`text-generation-inference`).
- Razonamiento, matemáticas y generación de código: no disponible; no hay documentación ni evaluaciones que lo confirmen.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card; no se declara soporte de castellano ni de otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Compatibilidad declarada con endpoints de inferencia: sí, según la etiqueta `endpoints_compatible`.

## Casos de uso

Dado que no existen evaluaciones publicadas, los siguientes escenarios son hipótesis de uso razonables para un modelo de ~2.000 millones de parámetros en inglés, y requieren validación propia antes de cualquier despliegue real.

- Clasificación y etiquetado de textos en inglés: con un tamaño de 2B, el modelo puede ejecutarse en lote sobre grandes volúmenes de documentos para tareas de categorización o extracción de campos, con un coste por inferencia muy bajo.
- Generación de borradores y resúmenes cortos: adecuado para producir primeras versiones de textos que después revisa una persona, siempre que la longitud de salida se mantenga dentro de la ventana de contexto (no documentada).
- Prototipado rápido de aplicaciones de chat: su tamaño reducido permite levantar un servidor de inferencia en una GPU de consumo o incluso en CPU para validar una idea de producto antes de escalar a un modelo mayor.
- Fine-tuning posterior específico de dominio: al tratarse ya de un modelo ajustado con Unsloth, puede servir como punto de partida para nuevos ajustes con LoRA sobre datos propios de un nicho concreto.
- Experimentación académica en eficiencia de inferencia: útil como sujeto de pruebas para medir latencia, throughput y consumo de memoria en distintas cuantizaciones sobre hardware modesto.
- Procesamiento por lotes en pipelines de datos: generación de descripciones, normalización de campos o aumento de datos sintéticos en inglés dentro de un pipeline offline, donde la latencia no es crítica.
- Asistente embebido en entornos con recursos limitados: al caber potencialmente en GPUs de 4-8 GB, podría integrarse en aplicaciones de escritorio o dispositivos edge, siempre que se acepte su menor calidad frente a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y la model card se limita a la plantilla automática de Unsloth. Tampoco hay información de latencia ni de throughput medida.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento de parámetros (~2.000 millones) y no proceden de mediciones publicadas del modelo.

- VRAM estimada para inferencia (solo pesos): en bf16/fp16, en torno a 4-5 GB; en int8, alrededor de 2-2,5 GB; en 4 bits (por ejemplo GGUF Q4_K_M), aproximadamente 1,2-1,5 GB. Hay que sumar el espacio para la caché KV, que depende de la longitud de contexto, no documentada.
- GPU recomendadas: para producción, cualquier GPU con al menos 8 GB de VRAM (NVIDIA T4, L4, RTX 3060 12 GB, RTX 4070). Para bf16 sin cuantizar, se recomienda partir de 8 GB; modelos superiores como A100 o H100 no aportan ventaja apreciable a este tamaño salvo por agregación de peticiones.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 6-8 GB o más (GTX 1660 6 GB, RTX 3060, RTX 4060, RTX 4090) si se usa cuantización de 4 bits. También debería caber en Apple Silicon con 8 GB de memoria unificada.
- Ejecución en CPU: viable con llama.cpp u Ollama en cuantización de 4 bits, con velocidades de pocos tokens por segundo en procesadores de escritorio.
- Opciones de despliegue: transformers (librería declarada) y text-generation-inference (etiqueta del repositorio). vLLM, llama.cpp, Ollama y LM Studio serían opciones plausibles, pero requieren pesos convertidos; el repositorio solo publica safetensors, por lo que no hay GGUF disponible en la información consultada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparativa con alternativas se ve muy limitada porque no existen métricas publicadas de AngelAI-8a. Se incluyen modelos de la misma franja de tamaño como referencia de categoría; los datos de las alternativas proceden de conocimiento público general y deberían verificarse en sus propias fichas.

| Modelo | Parametros | Contexto | Licencia | Benchmarks publicos |
|---|---|---|---|---|
| AngelAI-8a | ~2.000 M (segun modelo base) | no disponible | apache-2.0 | no disponible |
| Qwen2.5-1.5B | 1.540 M | 32.768 tokens | Apache 2.0 | si, en su model card |
| Gemma 2 2B | 2.600 M | 8.192 tokens | Gemma Terms of Use | si, en su model card |
| Llama 3.2 1B | 1.230 M | 128.000 tokens | Llama 3.2 Community License | si, en su model card |

La comparación realmente pertinente sería contra el propio modelo base (unsloth/Qwen3.5-2B), pero no se dispone de datos verificados sobre él en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se conoce el dataset de ajuste, el número de tokens ni el proceso de alineación, lo que impide auditar sesgos o comportamientos indeseados.
- Riesgo de alucinación: no evaluado. En un modelo de ~2B sin métricas publicadas, la tasa de invención de hechos puede ser elevada y debe medirse antes de usarlo en cualquier contexto factual.
- Idiomas: la model card declara únicamente inglés; no hay evidencia de competencia en castellano ni en otros idiomas.
- Ventana de contexto desconocida: no se puede planificar un caso de uso con entradas largas sin determinarla experimentalmente.
- Sesgos: al no publicarse la composición del corpus de entrenamiento ni del ajuste, no es posible caracterizar sesgos de género, raza, religión o ideología.
- Degradación de seguridad: los fine-tunes sobre modelos base pueden reducir las salvaguardas originales del modelo alineado, especialmente si el ajuste se hizo sobre datos sin filtrar.
- Licencia: el modelo se publica bajo apache-2.0, lo que en principio permite uso comercial. No obstante, conviene verificar la licencia del modelo base (unsloth/Qwen3.5-2B) y si impone condiciones adicionales que se hereden en el derivado.
- Discrepancia de tamaño: el repositorio de 0,2 GB es mucho menor de lo esperable para un modelo de 2B en bf16, lo que sugiere pesos cuantizados o un contenido incompleto. Debe comprobarse antes de descargar y desplegar.
- Falta de validación comunitaria: 0 descargas y 0 "likes" implican que no hay terceros que hayan reproducido ni verificado su funcionamiento.
- Metadatos sospechosos: la fecha de creación declarada (2026-09-10) es posterior a la fecha de esta consulta, lo que puede indicar un error en los metadatos de la plataforma.
- Uso en producción: no recomendado sin una evaluación propia previa y sin fijar una versión concreta de los pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Xgspt123/AngelAI-8a
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-2B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo: los unicos enlaces recuperados correspondian a Gmail y a paginas de inicio de sesion de Google, sin relacion alguna con AngelAI-8a. No se han encontrado papers, blogs ni demos asociados.
