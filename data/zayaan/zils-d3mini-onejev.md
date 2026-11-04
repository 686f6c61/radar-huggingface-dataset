# Zayaan/zils-d3mini-onejev

## Resumen

Zils d3-mini OneJev es una redistribución de los pesos del modelo OmniJev/OneJev1.6-4B, publicada por el usuario Zayaan en HuggingFace. No se trata de un entrenamiento nuevo ni de un fine-tuning: la model card indica explícitamente que los pesos son los del modelo original en la revisión `bb248003b6`, sin cambios, reempaquetados en el formato de layout denominado "Zils d3-mini soup-body", que organiza las claves del state dict bajo los prefijos `language_model.*` y `visual.*`.

El modelo cuenta con aproximadamente 4.539 millones de parámetros (4,54 mil millones) según los datos reales de safetensors, lo que lo sitúa en la categoría de modelos de tamaño medio con capacidades multimodales, a juzgar por la presencia del prefijo `visual.*` en el layout. El repositorio ocupa 9,1 GB, un tamaño coherente con pesos en precisión de 16 bits para ese número de parámetros.

La relevancia de esta ficha es limitada desde el punto de vista técnico: se trata de un artefacto de redistribución vinculado a la subred 127 de Bittensor (Zils), comprometido por una hotkey de tipo scout. No aporta innovaciones de arquitectura ni de entrenamiento propias, y la información publicada por el autor es mínima. Cualquier evaluación técnica debe remitirse al modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base OmniJev/OneJev1.6-4B; el layout incluye componentes `language_model` y `visual`, lo que sugiere arquitectura multimodal) |
| Parametros totales | 4.539.265.536 (4,54 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en la documentación proporcionada. El layout "soup-body" de Zils d3-mini organiza los pesos bajo los prefijos `language_model.*` y `visual.*`, lo que indica la presencia de un componente de lenguaje y otro de visión, pero no se detalla si se trata de un transformer denso, un modelo con atención lineal, una arquitectura híbrida o cualquier otra variante. Tampoco se especifican el número de capas, la dimensión oculta, el número de cabezas de atención ni el tipo de tokenizador.

Respecto al entrenamiento, la model card no aporta ningún dato: no se indica el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. El autor declara que los pesos son los del modelo base OmniJev/OneJev1.6-4B en la revisión `bb248003b6` sin modificaciones, por lo que cualquier detalle de entrenamiento debería consultarse en la documentación de dicho modelo base, que no forma parte de la información disponible en esta ficha.

## Capacidades

- Generación de texto: capacidad heredada del componente `language_model` del modelo base, sin que se detallen características específicas.
- Procesamiento visual: la presencia del prefijo `visual.*` en el layout sugiere capacidad de entrada de imágenes, aunque no se confirma el tipo de tarea (captioning, VQA, OCR u otras).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Redistribución en la subred 127 de Bittensor (Zils): el caso de uso declarado por el autor es el compromiso de los pesos en el formato soup-body de Zils mediante una hotkey scout, para su uso dentro de la infraestructura de esa subred.
- Evaluación comparativa de layouts de pesos: sirve para verificar que el reempaquetado de un modelo de 4,54 mil millones de parámetros bajo los prefijos `language_model.*` y `visual.*` carga correctamente en los pipelines de Zils.
- Pruebas de integridad de pesos: al ser una copia sin cambios del modelo base, puede emplearse para comprobar que la conversión de formato no altera las salidas del modelo original.
- Desarrollo de herramientas de inspección de safetensors: el repositorio de 9,1 GB con 4,54 mil millones de parámetros es un caso de prueba realista para utilidades de análisis de state dicts.
- Despliegue experimental multimodal: si el componente `visual.*` está operativo, podría emplearse en prototipos de descripción de imágenes o respuesta visual a preguntas, siempre que se valide previamente contra el modelo base.
- Archivado y replicación: como copia inmutable de una revisión concreta (`bb248003b6`), resulta útil para reproducir experimentos que dependan de esa versión exacta de los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9,1 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 12-16 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB para los pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 2,3-3 GB para los pesos.
- GPU recomendadas para FP16: A100 40 GB, H100, L40S, RTX A6000; en consumer, RTX 4090 (24 GB) y RTX 3090 (24 GB) con margen amplio.
- GPU consumer: cabe en GPUs de 12 GB o más en FP16 con contexto moderado; en 8 GB solo mediante cuantización de 8 o 4 bits.
- Opciones de despliegue: no se especifican en la documentación; al ser safetensors, requiere un framework de inferencia compatible (transformers, vLLM, TGI) con la arquitectura del modelo base. No se confirma soporte de llama.cpp u Ollama, que dependen de la disponibilidad de conversión a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Zils d3-mini OneJev (este) | 4,54 mil millones | no disponible | Apache 2.0 | HuggingFace, 0 descargas | Redistribución sin cambios del modelo base en layout Zils |
| OmniJev/OneJev1.6-4B | no disponible (presumiblemente ~4,5 mil millones) | no disponible | no disponible en esta ficha | HuggingFace | Modelo base original; fuente de los pesos |
| Alternativas de ~4B densos | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados para una comparación rigurosa |

No se dispone de información suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- El modelo no aporta ninguna modificación sobre el modelo base; sus limitaciones son las del original OmniJev/OneJev1.6-4B, que no se detallan en la documentación disponible.
- No se especifican sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad.
- Se desconoce la longitud de contexto soportada, lo que impide planificar su uso en tareas de contexto largo.
- No se confirman los idiomas soportados; la ausencia de esta información impide garantizar un rendimiento adecuado en castellano.
- Aunque la licencia declarada es Apache 2.0, el autor indica que la redistribución se hace bajo la licencia original del modelo base; conviene verificar la licencia del repositorio OmniJev/OneJev1.6-4B antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.
- El layout "soup-body" es específico de Zils y puede no ser directamente compatible con frameworks estándar sin una conversión previa de las claves del state dict.
- No hay información sobre el pipeline de inferencia, lo que puede provocar errores de carga si no se configura manualmente el mapeo de componentes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Zayaan/zils-d3mini-onejev
- Modelo base: https://huggingface.co/OmniJev/OneJev1.6-4B
- Revisión del modelo base referenciada: `bb248003b6`
