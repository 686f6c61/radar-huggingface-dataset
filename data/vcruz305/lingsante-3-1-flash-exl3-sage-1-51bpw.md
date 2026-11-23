# vcruz305/LingSante-3.1-flash-EXL3-SAGE-1.51bpw

## Resumen

LingSante-3.1-flash-EXL3-SAGE-1.51bpw es una cuantización EXL3 del modelo LingSante-3.1-flash, publicado por el usuario vcruz305 en Hugging Face. Se trata de una versión comprimida a 1,51 bits por peso (bpw) mediante el formato EXL3 de ExLlamaV3, pensada para reducir drásticamente el espacio en VRAM de un modelo de aproximadamente 57.700 millones de parámetros. El modelo base, LingSante-3.1-flash, lo desarrolla inclusionAI y pertenece a la familia Ling, con arquitectura híbrida de mezcla de expertos (MoE) orientada al ámbito médico según las etiquetas del repositorio.

La relevancia de esta ficha no reside en el modelo original, sino en la cuantización extrema: 1,51 bpw es un nivel agresivo que permite cargar un MoE de gran tamaño en hardware de gama alta para consumidor, a costa de una pérdida de calidad que debe evaluarse caso por caso. El repositorio ocupa 115,5 GB, lo que indica que los pesos se distribuyen en múltiples ficheros safetensors y que la cuantización no reduce el tamaño tanto como cabría esperar de 1,51 bpw, presumiblemente por los expertos y capas no cuantizadas al mismo nivel.

Cabe señalar que el acceso al repositorio está restringido (gated) y que el número de descargas y likes es cero en la fecha de consulta, lo que sugiere una publicación muy reciente y sin validación comunitaria. La licencia declarada es MIT, heredada del modelo base, pero conviene verificar las condiciones del modelo original antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE (etiqueta `bailing_hybrid`), código personalizado (`custom_code`) |
| Parametros totales | 57.685.896.000 (≈57,7 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 1,51 bpw (ExLlamaV3); otros formatos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors con EXL3 (librería `exllamav3`) |

## Arquitectura y entrenamiento

El modelo base LingSante-3.1-flash se etiqueta como `bailing_hybrid`, lo que apunta a una arquitectura híbrida que combina atención transformer con componentes de mezcla de expertos; la etiqueta `moe` confirma la presencia de expertos. Sin embargo, la información disponible no detalla el número de expertos, la proporción de parámetros activos por token ni la composición exacta de las capas híbridas. Tampoco se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO o ajuste específico para dominio médico, más allá de la etiqueta `medical`.

La innovación técnica de esta publicación es la cuantización EXL3 a 1,51 bpw mediante ExLlamaV3. EXL3 es un formato de cuantización de pesos por bloques que busca maximizar la compresión manteniendo la fidelidad numérica; a 1,51 bpw se sitúa en el extremo bajo del rango habitual (2–4 bpw), lo que implica una degradación esperada de la calidad de generación que no está documentada en la ficha del repositorio. No se han publicado detalles sobre el proceso de calibración, el dataset usado para la cuantización ni las métricas de perplexity resultantes.

## Capacidades

- Generación de texto conversacional, según la pipeline declarada (`text-generation` y etiqueta `conversational`).
- Orientación al dominio médico, indicada por la etiqueta `medical` del repositorio.
- Arquitectura MoE con capacidad de activar subconjuntos de expertos por token (número de expertos y patrón de activación no disponibles).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el campo de idiomas está vacío.
- Modos especiales (thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un modelo médico de gran tamaño en una GPU de consumo: gracias a la cuantización a 1,51 bpw, un MoE de 57,7 mil millones de parámetros puede intentar cargarse en tarjetas con 24–48 GB de VRAM, algo inviable con pesos en FP16 (que requerirían más de 115 GB). Adecuado para prototipos y entornos de investigación con hardware limitado.
- Asistencia a la redacción de informes clínicos: el modelo, etiquetado como médico, puede emplearse para generar borradores de resúmenes de historiales o notas de evolución, siempre con revisión humana obligatoria dada la cuantización agresiva.
- Experimentación con ExLlamaV3: útil como banco de pruebas para evaluar el rendimiento de EXL3 a 1,51 bpw en arquitecturas MoE híbridas, comparando latencia y calidad frente a cuantizaciones a 3–4 bpw.
- Preguntas y respuestas sobre literatura médica: el modelo puede responder consultas de dominio acotado en un pipeline RAG, donde el contexto se inyecta externamente y el modelo se limita a sintetizar la respuesta.
- Investigación sobre degradación por cuantización: permite estudiar cómo afecta la compresión extrema a la coherencia y a la fidelidad factual en modelos de gran tamaño, un tema relevante para la comunidad de eficiencia de inferencia.
- Entornos educativos y demos offline: al poder ejecutarse en una sola GPU de gama alta para consumidor, facilita demostraciones locales de un modelo médico sin depender de infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de dominio médico, ni comparaciones con el modelo base sin cuantizar.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 115,5 GB en disco; con EXL3 a 1,51 bpw, la carga en VRAM depende de cuántas capas y expertos se cuantizan realmente a ese nivel. Como referencia, una cuantización completa a 1,51 bpw de 57,7 mil millones de parámetros ocuparía aproximadamente 11 GB, pero el tamaño del repo sugiere que parte de los pesos no están a ese nivel, por lo que la VRAM real necesaria es mayor y no está documentada.
- GPU recomendadas: no disponible. Por el tamaño del repo, se requiere al menos una GPU con 24 GB (RTX 4090, RTX 3090) y probablemente 48 GB o más (A6000, L40S, A100 40/80 GB) para cargar el conjunto completo.
- ¿Cabe en GPU de consumo? Posiblemente en RTX 4090/3090 (24 GB) si la carga efectiva se ajusta, pero no confirmado; en tarjetas de 16 GB es improbable.
- Opciones de despliegue: ExLlamaV3 (librería declarada, `exllamav3`); vLLM, llama.cpp, Ollama y TGI no están indicados como compatibles con EXL3 en esta publicación.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LingSante-3.1-flash-EXL3-SAGE-1.51bpw (este) | 57,7 B (MoE) | no disponible | EXL3 1,51 bpw | MIT | Gated, 0 descargas |
| LingSante-3.1-flash (base) | 57,7 B (MoE) | no disponible | Pesos originales | MIT (según repo derivado) | Público en inclusionAI |
| Alternativas de tamaño y dominio comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos médicos MoE de tamaño similar para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La cuantización a 1,51 bpw es extremadamente agresiva y previsiblemente degrada la coherencia, la precisión factual y el razonamiento del modelo; no hay métricas publicadas que cuantifiquen esa pérdida.
- Modelo orientado a dominio médico: existe riesgo elevado de alucinación en contenido clínico, agravado por la compresión. No debe usarse como sustituto del criterio médico profesional.
- Sesgos conocidos: no disponible; no se documentan sesgos de género, étnicos o lingüísticos.
- Idiomas soportados sin confirmar; el campo de idiomas está vacío, por lo que el rendimiento fuera del inglés (y posiblemente del chino, dada la procedencia de inclusionAI) es incierto.
- Licencia MIT declarada, pero el acceso es restringido (gated) y las condiciones del modelo base deben revisarse antes de uso comercial.
- El repositorio tiene cero descargas y cero likes, sin validación comunitaria; la calidad de la cuantización no está contrastada por terceros.
- Requiere código personalizado (`custom_code`) y la librería ExLlamaV3, lo que limita la integración con stacks de despliegue estándar como vLLM u Ollama.
- Longitud de contexto y número de parámetros activos no documentados, lo que dificulta planificar pipelines con prompts largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vcruz305/LingSante-3.1-flash-EXL3-SAGE-1.51bpw
- Modelo base: https://huggingface.co/inclusionAI/LingSante-3.1-flash
- ExLlamaV3 (librería de inferencia): no disponible en la información proporcionada
- Paper, blog o demo del modelo base: no disponible en la información proporcionada
