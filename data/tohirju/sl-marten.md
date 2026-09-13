# Tohirju/sl-marten

## Resumen

Tohirju/sl-marten es un modelo de lenguaje publicado en HuggingFace por el usuario Tohirju, con un total de 2.213.241.664 parámetros almacenados en formato safetensors y un repositorio de 4,4 GB. Se trata de un modelo de escala pequeña (aproximadamente 2,2 mil millones de parámetros), lo que lo sitúa en la franja de modelos ejecutables en hardware de consumo con cuantización adecuada. La etiqueta de arquitectura declarada en el repositorio es `qwen3_5`, lo que apunta a la familia Qwen3.5, aunque no se ha publicado documentación técnica que confirme detalles de arquitectura, datos de entrenamiento o contexto máximo.

El modelo se distribuye bajo licencia `other` y con acceso restringido (gated): es necesario aceptar condiciones en HuggingFace antes de poder descargar los pesos. No se han publicado idiomas soportados, pipeline de inferencia, tipos de cuantización ni resultados de benchmarks. El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el 12 de septiembre de 2026, con apenas un minuto de diferencia entre ambos eventos, lo que sugiere una publicación inicial sin iteraciones posteriores documentadas.

La relevancia de esta ficha es limitada por la ausencia de documentación, pero el modelo resulta de interés como posible variante o fine-tuning de la familia Qwen3.5 en el rango de 2B parámetros, un segmento con demanda creciente para despliegues locales, prototipado rápido y tareas de generación de texto con requisitos moderados de cómputo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta del repositorio indica `qwen3_5`, sin documentación técnica asociada) |
| Parametros totales | 2.213.241.664 (aproximadamente 2,21 mil millones) |
| Parametros activos | no aplica (no se ha documentado una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors; el tamaño de 4,4 GB es coherente con pesos en bf16/fp16, sin confirmar) |
| Idiomas soportados | no disponible |
| Licencia | other (acceso restringido / gated; condiciones no publicadas en la información disponible) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo más allá de la etiqueta `qwen3_5` incluida en el repositorio de HuggingFace. Esta etiqueta sugiere que el modelo pertenece o deriva de la familia Qwen3.5, pero no se especifica si se trata de un transformer denso, una variante MoE, un modelo híbrido o un fine-tuning sobre una base existente. Tampoco hay confirmación sobre el número de capas, dimensión de las representaciones, mecanismo de atención, uso de atención lineal o técnicas de decodificación especulativa.

Respecto al entrenamiento, no hay datos disponibles sobre el volumen de tokens utilizados, la composición del dataset, el uso de técnicas de alineación como RLHF, DPO o SFT, ni sobre posibles fases de razonamiento extendido. Tampoco se documenta una ficha de modelo, paper o blog técnico asociado. Cualquier afirmación sobre el proceso de entrenamiento sería especulativa y no debe tomarse como válida para evaluaciones de producción.

## Capacidades

No se dispone de documentación oficial sobre las capacidades del modelo. A partir de la información disponible, únicamente puede afirmarse lo siguiente:

- Generación de texto: el modelo tiene 2,21 mil millones de parámetros y pesos en safetensors, por lo que es compatible con el pipeline estándar de generación de texto de HuggingFace Transformers, siempre que la arquitectura esté soportada por la versión instalada de la librería.
- Razonamiento, código, matemáticas y visión: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas en el repositorio).
- Capacidades especiales (modo thinking, audio, visión): no disponible.

Cualquier evaluación funcional requiere descargar los pesos (previo acceso gated) e inspeccionar la configuración del modelo para determinar la arquitectura real y el tokenizador asociado.

## Casos de uso

Dado que no se han publicado capacidades verificadas, los casos de uso siguientes son escenarios plausibles para un modelo denso de aproximadamente 2,2B parámetros, no aplicaciones confirmadas para este modelo concreto:

- Prototipado local en estación de trabajo: un modelo de 2,2B parámetros en bf16 ocupa alrededor de 4,4 GB, por lo que puede cargarse en una GPU de consumo con 8 GB o más para experimentar con prompts, plantillas y flujos de generación antes de escalar a modelos mayores.
- Generación de texto asistida en aplicaciones de escritorio: integrable mediante Transformers en herramientas ofimáticas o editores para resúmenes, reescritura y completado, con latencia baja gracias al reducido número de parámetros.
- Clasificación y etiquetado de textos: uso como modelo base para tareas de extracción de información o categorización, ya sea mediante prompting o mediante fine-tuning con LoRA sobre los pesos publicados.
- Fine-tuning específico de dominio: al tratarse de un modelo pequeño, el ajuste con LoRA o QLoRA es viable en una única GPU consumer, lo que permite adaptarlo a dominios verticales (legal, médico, atención al cliente) con costes reducidos.
- Filtrado y preprocesado en pipelines de datos: uso como modelo auxiliar para limpieza, deduplicación semántica o generación de metadatos en lotes grandes, donde el coste por token es determinante.
- Despliegue en el borde (edge) o en entornos con recursos limitados: si se generan cuantizaciones GGUF o AWQ (no publicadas actualmente), podría ejecutarse en CPU o en GPUs integradas para asistentes offline.
- Evaluación comparativa de la familia Qwen3.5: útil para investigadores que quieran medir el comportamiento de variantes pequeñas de esta familia frente a modelos del mismo rango.

En todos los casos, la ausencia de benchmarks y de documentación sobre el contexto máximo obliga a validar el comportamiento real antes de cualquier uso en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No existe tabla comparativa de MMLU, HumanEval, GSM8K, BBH ni de ninguna otra métrica para este modelo. Tampoco se han publicado resultados de evaluaciones por parte de terceros, dado que el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Requisitos de hardware

Las siguientes estimaciones se derivan del recuento de parámetros (2,21B) y no de una ficha técnica oficial:

- VRAM estimada para inferencia:
  - bf16/fp16 (formato aparente del repositorio): aproximadamente 4,4-5 GB solo para pesos, más caché KV y overhead, lo que sitúa el consumo práctico en torno a 6-8 GB según la longitud de contexto.
  - int8 (si se genera la cuantización): aproximadamente 2,2-2,5 GB de pesos, con consumo total en torno a 4 GB.
  - int4 (si se genera la cuantización): aproximadamente 1,2-1,5 GB de pesos, con consumo total en torno a 2,5-3 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100 40/80 GB, H100. Para bf16, una GPU con 8 GB o más es suficiente en contextos cortos.
- Compatibilidad con GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y tarjetas con 8 GB o más en cuantizaciones bajas. No confirmado oficialmente.
- Opciones de despliegue: Transformers (formato safetensors nativo), vLLM o TGI si la arquitectura está soportada por estas librerías, y llama.cpp/Ollama únicamente si se generan cuantizaciones GGUF, que no están publicadas. El acceso gated obliga a configurar un token de HuggingFace en el entorno de descarga.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No hay datos de rendimiento de sl-marten, por lo que la comparación se limita a características estructurales. Los datos de los modelos alternativos corresponden a sus fichas públicas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Tohirju/sl-marten | 2,21B | no disponible | other (gated) | HuggingFace, acceso restringido |
| Qwen2.5-3B | 3,09B | 32.768 tokens (ampliable) | Apache-2.0 | HuggingFace, con cuantizaciones GGUF/AWQ |
| Llama-3.2-3B | 3,21B | 128.000 tokens | Llama 3.2 Community License | HuggingFace, con cuantizaciones GGUF |
| Gemma-2-2B | 2,61B | 8.192 tokens | Gemma Terms of Use | HuggingFace, con cuantizaciones GGUF |

No es posible comparar rendimiento en benchmarks porque sl-marten no publica resultados. Tampoco se puede confirmar si la arquitectura `qwen3_5` es compatible con las herramientas estándar de cuantización y despliegue, lo que afecta directamente a su utilidad práctica frente a las alternativas citadas.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay ficha de modelo, paper, blog ni configuración detallada publicada. Cualquier uso en producción implica ingeniería inversa de la configuración.
- Idiomas no declarados: se desconoce si el modelo está entrenado en castellano, inglés o en otros idiomas, y con qué calidad.
- Contexto desconocido: sin longitud de contexto documentada no es posible planificar aplicaciones que dependan de ventanas largas.
- Riesgo de alucinación: no evaluado. Al no existir benchmarks ni evaluaciones de terceros, no hay evidencia sobre la fiabilidad factual del modelo.
- Sesgos: no evaluados. No se ha publicado ninguna auditoría de sesgos ni información sobre la composición del dataset de entrenamiento.
- Licencia restrictiva o ambigua: la licencia se declara como `other`, sin texto accesible en la información proporcionada. Es imprescindible revisar las condiciones en HuggingFace antes de cualquier uso comercial.
- Acceso gated: la descarga requiere aceptar condiciones y disponer de un token válido, lo que añade fricción a la reproducibilidad y a la integración en CI/CD.
- Trazabilidad limitada: el repositorio registra 0 descargas y 0 likes, fue creado y actualizado en el mismo minuto y no tiene historial de versiones documentado, lo que reduce la confianza sobre su mantenimiento.
- Sin cuantizaciones publicadas: no hay GGUF, AWQ ni GPTQ, por lo que el despliegue en llama.cpp, Ollama o entornos de bajos recursos requiere conversión manual.
- Compatibilidad incierta: si la arquitectura `qwen3_5` no está soportada por la versión instalada de Transformers, vLLM o TGI, será necesario adaptar el código de carga.

## Enlaces

- HuggingFace: https://huggingface.co/Tohirju/sl-marten
- Paper: no disponible
- Blog o ficha técnica: no disponible
- Repositorio de código: no disponible
- Demo: no disponible

Nota: la búsqueda web realizada no devolvió resultados relacionados con el modelo, su autor ni la arquitectura `qwen3_5`; los resultados obtenidos correspondían a servicios de vídeo en streaming sin relación con el contenido solicitado.
