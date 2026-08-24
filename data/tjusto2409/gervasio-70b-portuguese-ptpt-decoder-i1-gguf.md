# tjusto2409/gervasio-70b-portuguese-ptpt-decoder-i1-GGUF

## Resumen

Gervásio 70B PTPT Decoder es un modelo de lenguaje generativo de 70 mil millones de parámetros desarrollado por PORTULAN, un laboratorio de procesamiento del lenguaje natural para portugués. El modelo original, `PORTULAN/gervasio-70b-portuguese-ptpt-decoder`, es un decoder transformer de tipo GPT entrenado específicamente para la variante europea del portugués (PTPT), con capacidad de procesamiento de instrucciones. Esta ficha se centra en la versión cuantizada GGUF con imatrix publicada por tjusto2409 (cuantización realizada por mradermacher), que facilita la ejecución del modelo en hardware más modesto mediante la compresión de los pesos.

El repositorio incluye múltiples archivos GGUF con distintos niveles de cuantización (IQ1_S, IQ2_XXS, IQ3_M, Q4_K_M, etc.), lo que permite elegir el equilibrio entre calidad y consumo de memoria. El modelo base fue entrenado con los datasets `PORTULAN/extraglue` y `PORTULAN/extraglue-instruct`, y su licencia es MIT, lo que permite uso comercial y modificación. La relevancia actual radica en que es uno de los pocos modelos abiertos de gran tamaño específicamente adaptados al portugués, con una arquitectura similar a LLaMA y una comunidad activa en torno a la familia Gervásio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (similar a LLaMA) |
| Parametros totales | 70.553.706.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S (entre otros) |
| Idiomas soportados | Portugues (europeo y brasileño, segun tags) |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder de 70 mil millones de parámetros, siguiendo la arquitectura de LLaMA (capas de atención multi-cabeza, normalización RMSNorm, etc.). El entrenamiento original se realizó sobre datos portugueses, incluyendo los datasets `PORTULAN/extraglue` y `PORTULAN/extraglue-instruct`, que cubren tareas de comprensión lectora e instrucciones. No se dispone de detalles sobre el número de tokens de entrenamiento ni si se aplicó RLHF o DPO; el paper asociado (arxiv 2402.18766) describe la versión de 7B y menciona un ajuste fino con instrucciones, probablemente extrapolable al 70B. La versión GGUF aquí presentada usa imatrix (importancia matrix) para optimizar la cuantización, lo que reduce la pérdida de calidad respecto a cuantizaciones estándar.

## Capacidades

- Generación de texto en portugués europeo y brasileiro (según tags `gervasio-ptpt` y `gervasio-ptbr`).
- Ajuste fino por instrucciones (instruction tuning), lo que permite seguir prompts y comandos.
- Modelo de lenguaje de propósito general: puede realizar tareas de redacción, resumen, traducción, respuesta a preguntas, etc.
- Soporte de formato conversacional (indicado por tag `conversational`).
- No se menciona soporte de tool calling, función calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Asistentes virtuales en portugués: el modelo puede mantener diálogos multi-turno en portugués, útil para chatbots de atención al cliente o asistentes personales, gracias a su capacidad de instrucción.
- Generación de contenido editorial en portugués: redacción de artículos, noticias, resúmenes o descripciones de productos para mercados lusófonos, con licencia MIT que permite uso comercial.
- Traducción automática entre portugués europeo y brasileño: aunque no está especializado en traducción, su entrenamiento en ambas variantes permite convertir textos entre ellas con calidad aceptable.
- Análisis de sentimiento y clasificación de texto: mediante prompts de instrucción, puede clasificar opiniones o categorizar documentos en portugués.
- Educación y aprendizaje: generación de ejercicios, explicaciones y material didáctico en portugués, especialmente útil en instituciones académicas.
- Investigación en PLN para portugués: permite experimentar con técnicas de generación de texto, evaluación de modelos y comparación con otros LLMs, gracias a su licencia abierta y formato GGUF fácil de integrar en frameworks como llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card original no incluye métricas como MMLU, HumanEval o GSM8K, y la versión cuantizada tampoco las proporciona. Se recomienda consultar el paper (arxiv 2402.18766) para la versión de 7B, aunque no cubre el 70B.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización elegida, entre ~15 GB (IQ1_S) y ~49 GB (Q5_K_S). Para una calidad razonable se recomienda Q4_K_M (~42,6 GB) o IQ4_XS (~38 GB).
- GPU recomendadas: para Q4_K_M se necesita una GPU con al menos 48 GB de VRAM (por ejemplo, A6000, A100 80GB, H100). Para cuantizaciones más bajas (IQ2_XXS ~19 GB) puede caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con calidad reducida.
- Compatibilidad con consumer GPU: las variantes más pequeñas (IQ1_S, IQ2_XXS) pueden ejecutarse en GPUs de 24 GB, pero la calidad es muy baja. Para uso serio se recomienda hardware profesional.
- Opciones de despliegue: al ser GGUF, puede usarse con `llama.cpp`, `Ollama`, `llama-cpp-python`, `text-generation-webui` (oobabooga), y servidores compatibles con GGUF como `llama-server`. También puede cargarse en `transformers` con `ctransformers` o `llama-cpp` como backend.
- Latencia y throughput: no disponibles en la documentación; dependen del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de la misma categoría. El modelo original (Gervásio 70B) es el único decoder de 70B específico para portugués en la familia PORTULAN. Se puede comparar con modelos generalistas de 70B como LLaMA 2 70B o Mistral 70B, pero no hay datos de rendimiento publicados para esta variante cuantizada. La licencia MIT y el enfoque en portugués lo diferencian de alternativas multilingües como BLOOM o mT0.

## Limitaciones y advertencias

- Sesgos: al estar entrenado con datos portugueses, puede reflejar sesgos culturales o de género presentes en el corpus. No se han documentado medidas de mitigación específicas.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en tareas de generación libre.
- Limitaciones de contexto: no se conoce la longitud de contexto soportada; es probable que sea menor que la de modelos modernos (por ejemplo, 4k tokens).
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero es necesario verificar que los datos de entrenamiento no incluyan material con derechos de autor que pueda afectar la redistribución.
- Caveat de producción: la cuantización reduce la calidad del modelo; se recomienda probar varias cuantizaciones para encontrar el equilibrio adecuado. Además, el repositorio no incluye un archivo de tokenizador separado; se debe usar el del modelo original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tjusto2409/gervasio-70b-portuguese-ptpt-decoder-i1-GGUF
- Modelo base original: https://huggingface.co/PORTULAN/gervasio-70b-portuguese-ptpt-decoder
- Paper (versión 7B): https://arxiv.org/pdf/2402.18766.pdf
- Artículo en ACL Anthology: https://aclanthology.org/2024.sigul-1.3/
- Arquitectura visualizada: https://hfviewer.com/PORTULAN/gervasio-70b-portuguese-ptpt-decoder
- Repositorio de cuantizaciones estáticas (mradermacher): https://huggingface.co/mradermacher/gervasio-70b-portuguese-ptpt-decoder-GGUF
