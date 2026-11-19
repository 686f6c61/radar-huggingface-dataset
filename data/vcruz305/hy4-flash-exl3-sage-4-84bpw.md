# vcruz305/Hy4-flash-EXL3-SAGE-4.84bpw

## Resumen

Hy4-flash-EXL3-SAGE-4.84bpw es una cuantización de precisión mixta del modelo Hy4-flash desarrollado por Tencent, publicada por el usuario vcruz305 en Hugging Face. Se trata de una conversión al formato EXL3 (ExLlamaV3) del checkpoint original, orientada a la inferencia eficiente en GPUs de consumo y estaciones de trabajo con múltiples aceleradores. El modelo base Hy4-flash es un transformer de tipo Mixture of Experts (MoE) con aproximadamente 49.870 millones de parámetros totales, según los pesos en safetensors del repositorio.

La relevancia de esta ficha radica en que cubre una cuantización de un modelo MoE de casi 50B en un formato de pesos EXL3 con un peso medio de 4,84 bits por parámetro, lo que reduce sustancialmente el espacio de almacenamiento respecto al checkpoint original (el repositorio ocupa 165,6 GB). El acceso está restringido (gated): es necesario aceptar las condiciones de la licencia tencent-hy-license en Hugging Face antes de descargar los pesos.

No se dispone de información publicada por el autor sobre datos de entrenamiento, benchmarks o idiomas soportados en la información proporcionada; esta ficha se limita a los metadatos verificables del repositorio y a las características deducibles del formato de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), según tags del repositorio |
| Parametros totales | 49.867.996.582 (~49,87B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 (ExLlamaV3), precisión mixta con media de 4,84 bits por parámetro (SAGE) |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | safetensors en formato EXL3 (exllamav3) |
| Tamano del repositorio | 165,6 GB |
| Modelo base | tencent/Hy4-flash |
| Pipeline | text-generation |
| Libreria | exllamav3 |

## Arquitectura y entrenamiento

El modelo base Hy4-flash es, según las etiquetas del repositorio (`moe`, `hy_v4_flash`), una arquitectura de tipo Mixture of Experts. El número total de parámetros asciende a 49.867.996.582, pero no se especifica en la información proporcionada cuántos de ellos se activan por token ni cuál es la configuración del router, el número de expertos o la dimensión oculta. Tampoco se dispone de datos sobre la longitud de contexto nativa del modelo base.

La cuantización publicada emplea el formato EXL3 de ExLlamaV3 con un esquema de precisión mixta etiquetado como SAGE, que asigna distintos anchos de bits a distintas capas o tensores para alcanzar una media de 4,84 bits por parámetro. Este enfoque busca preservar la calidad del checkpoint original reduciendo el tamaño en disco y los requisitos de memoria en inferencia. No se han publicado en la información disponible detalles sobre el dataset de entrenamiento, el número de tokens procesados, la composición de los datos ni si el modelo base fue sometido a RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline declarado (`text-generation`, `conversational`).
- Razonamiento y generación de código: capacidades esperables en un modelo base de la familia Hy, aunque no verificadas en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.
- Inferencia optimizada para GPU mediante ExLlamaV3, con kernels específicos para el formato EXL3.

## Casos de uso

- Despliegue de un MoE de ~50B en estaciones de trabajo con una o varias GPUs: gracias a la cuantización EXL3 a 4,84 bpw, el modelo ocupa 165,6 GB en disco y puede servirse con ExLlamaV3 en configuraciones multi-GPU, reduciendo el coste frente al checkpoint en BF16.
- Generación de texto conversacional en producción: el pipeline `text-generation` y la etiqueta `conversational` permiten integrarlo en servicios de chat con contexto largo, siempre que se valide empíricamente la ventana de contexto del modelo base.
- Prototipado e investigación sobre modelos MoE: la cuantización facilita experimentar con un MoE de casi 50B en entornos con recursos limitados, comparando la degradación de calidad frente al modelo original.
- Evaluación comparativa de esquemas de cuantización: el formato SAGE a 4,84 bpw sirve como referencia para medir el impacto de la precisión mixta en tareas de razonamiento y generación.
- Asistentes de código en local: si se confirma la capacidad de generación de código del modelo base, podría integrarse en editores o pipelines de CI/CD mediante ExLlamaV3, aunque esta capacidad no está verificada en la información disponible.
- Fine-tuning y adaptación posterior: aunque el formato EXL3 está orientado a inferencia, la disponibilidad del modelo base `tencent/Hy4-flash` permite adaptar el modelo original y cuantizarlo después con el mismo esquema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 49,87B parámetros a 4,84 bpw, los pesos ocupan aproximadamente 30 GB; el repositorio en disco es de 165,6 GB, por lo que se recomienda planificar el almacenamiento en consecuencia.
- GPU recomendadas: configuraciones multi-GPU con A100 80GB, H100 80GB o RTX 4090 24GB en paralelo; una sola RTX 4090 no es suficiente para alojar los pesos completos junto con el contexto y las cachés KV.
- ¿Cabe en GPU de consumo? No en una sola unidad de 24 GB; sí en configuraciones de dos o más RTX 4090 o en GPUs de 48 GB o más.
- Opciones de despliegue: ExLlamaV3 (formato nativo del checkpoint), con integración en servidores compatibles con exllamav3; no es compatible directamente con llama.cpp, Ollama o vLLM sin reconversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash-EXL3-SAGE-4.84bpw (esta ficha) | ~49,87B (MoE) | no disponible | EXL3 safetensors | tencent-hy-license (gated) | Hugging Face, acceso restringido |
| tencent/Hy4-flash (original) | ~49,87B (MoE) | no disponible | safetensors | tencent-hy-license | Hugging Face |
| Alternativas de ~50B MoE | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente en la documentación proporcionada para comparar con alternativas concretas de la misma categoría en términos de rendimiento o benchmarks.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar la licencia tencent-hy-license antes de la descarga.
- Licencia "other": es imprescindible revisar los términos de tencent-hy-license para uso comercial; no se garantiza permiso de explotación comercial sin consulta previa.
- La cuantización a 4,84 bpw puede introducir degradación de calidad respecto al checkpoint original en tareas sensibles a la precisión numérica, como matemáticas o razonamiento de varios pasos; no se han publicado evaluaciones que lo cuantifiquen.
- Riesgo de alucinación: inherente a los modelos generativos; no se dispone de datos específicos de evaluación para este checkpoint.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no declarados; se desconoce si el modelo base cubre castellano con calidad suficiente.
- Formato EXL3: no es portable a otros runtimes sin reconversión; limita las opciones de despliegue frente a GGUF o safetensors estándar.
- El autor de la cuantización es un usuario independiente (vcruz305), no Tencent; no hay garantía de soporte ni de mantenimiento.
- No se dispone de información sobre la longitud de contexto efectiva del modelo base, lo que impide planificar cargas de trabajo con ventanas largas.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/vcruz305/Hy4-flash-EXL3-SAGE-4.84bpw
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- ExLlamaV3 (repositorio del runtime): no disponible en la información proporcionada
- Paper, blog o demo oficial: no disponible en la información proporcionada
