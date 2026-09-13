# yuhengtu-bytedance/sfm_filtered_e2e_insert_hyperstition_v1-7k_8k_9k_10k_11k_weightedavg_merge

## Resumen

Este repositorio contiene un modelo de lenguaje de 6.856.253.440 parámetros (aproximadamente 6,86 mil millones) creado mediante la fusión de cinco checkpoints de entrenamiento intermedios (pasos 7000, 8000, 9000, 10000 y 11000) de un mismo linaje de entrenamiento denominado `filtered_e2e_insert_hyperstition_v1`, bajo el espacio de trabajo `Pan_Safety_Better_Measurement`. La fusión se ha realizado con la herramienta mergekit usando el método Linear con normalización de pesos y el checkpoint del paso 11000 como base. El resultado se exporta en `bfloat16` sobre pesos calculados originalmente en `float32`.

No se trata de un modelo entrenado desde cero ni de un lanzamiento de producto: es un artefacto de investigación típico del ecosistema mergekit, donde el objetivo es comprobar si el promedio lineal de pesos de varios puntos de control de un mismo run mejora la estabilidad o el rendimiento respecto a usar un único checkpoint. La relevancia práctica es metodológica (evaluar técnicas de model merging y de promediado de checkpoints, línea de trabajo del artículo "Model soups"), no la de un modelo listo para producción.

La model card es mínima: no declara licencia, idiomas, longitud de contexto, composición del dataset ni resultados de evaluación. La etiqueta `gpt_neox` indica que la arquitectura subyacente es de la familia GPT-NeoX, y la etiqueta `conversational` sugiere un ajuste orientado a diálogo, pero ninguno de estos extremos está confirmado con documentación del autor. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (según etiqueta `gpt_neox` del repositorio; no detallada en la model card) |
| Parámetros totales | 6.856.253.440 (dato de los pesos en safetensors) |
| Parámetros activos | No aplica: no hay indicios de arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible en el repositorio (solo pesos `bfloat16`); al ser safetensors es convertible a GGUF, GPTQ o AWQ con herramientas externas |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (`bfloat16`), biblioteca `transformers` |
| Pipeline | text-generation |
| Tamaño del repositorio | 13,7 GB |
| Método de fusión | Linear (mergekit) con `normalize: true` |
| Checkpoints fusionados | Pasos 7000 (peso 1), 8000 (peso 2), 9000 (peso 3), 10000 (peso 4) y 11000 (peso 5); base = paso 11000 |
| Etiquetas | transformers, safetensors, gpt_neox, text-generation, mergekit, merge, conversational, arxiv:2203.05482, text-generation-inference, endpoints_compatible, region:us |
| Fecha de creación | 2026-09-13 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Lo único verificable es la etiqueta `gpt_neox`, que apunta a un transformer decoder-only con atención causal y normalización tipo LayerNorm paralela, característico de la familia GPT-NeoX/Pythia. Con 6.856.253.440 parámetros, el tamaño es casi idéntico al de Pythia-6.9B (6.857.302.016), lo que refuerza la hipótesis de una configuración de ~32 capas y dimensión oculta de 4096, aunque esto no se confirma en la documentación disponible.

No hay información sobre el entrenamiento original: ni número de tokens, ni composición del dataset, ni si hubo RLHF, DPO o ajuste por instrucciones. Las rutas de los checkpoints (`filtered_e2e_insert_hyperstition_v1`, dentro de `Pan_Safety_Better_Measurement`) sugieren un contexto de investigación en seguridad y evaluación de modelos, pero es una inferencia a partir del nombre de los directorios, no un dato declarado por el autor.

La innovación técnica del artefacto es la propia fusión: se aplica un promedio lineal ponderado de pesos (Linear merge, metodología del artículo arXiv:2203.05482, "Model soups") con normalización activada, dando más peso a los checkpoints más tardíos (5 para el paso 11000 frente a 1 para el 7000). Los pesos se calculan en `float32` y se exportan en `bfloat16`. No se documenta si hubo ajuste posterior, calibración ni evaluación del merge.

## Capacidades

- Generación de texto autoregresiva, según el pipeline declarado (`text-generation`).
- Uso conversacional: la etiqueta `conversational` sugiere que el linaje de checkpoints fue ajustado para diálogo, aunque no se especifica el formato de prompt ni las plantillas de chat.
- Compatibilidad con `transformers`, `text-generation-inference` y `endpoints_compatible`, es decir, se puede servir con el stack estándar de HuggingFace.
- Tool calling / function calling: no documentado; no hay evidencia de que el modelo haya sido entrenado para ello.
- Capacidades de agente o razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas; los idiomas soportados figuran como no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.
- Código, matemáticas y razonamiento formal: no documentados; no hay benchmarks ni ejemplos en la model card.

## Casos de uso

- Investigación en model merging: el modelo sirve como caso de estudio reproducible para comparar el promediado lineal ponderado de checkpoints frente al uso de un único checkpoint (el paso 11000), midiendo si la fusión reduce varianza o mejora métricas en tareas de validación propias.
- Evaluación de dinámicas de entrenamiento: al proceder de cinco pasos de un mismo run, permite analizar cómo evoluciona una tarea concreta a lo largo del entrenamiento y en qué punto la media de pesos aporta algo respecto al checkpoint final.
- Experimentos de seguridad y alineación: dado el nombre del espacio de trabajo de origen (`Pan_Safety_Better_Measurement`), es un candidato razonable para pruebas internas de comportamiento dañino, sesgos o robustez ante prompts adversarios, siempre asumiendo que se desconoce el ajuste de seguridad aplicado.
- Base para fine-tuning de dominio: con 6,86 mil millones de parámetros y pesos en `bfloat16`, se puede ajustar con LoRA o QLoRA en una sola GPU de 24 GB para tareas verticales (soporte técnico, clasificación generativa, resumen de documentos del dominio propio).
- Generación de datos sintéticos para entrenamiento: puede emplearse para producir corpus etiquetados a gran escala en un dominio controlado, con revisión humana posterior, aprovechando que el coste de inferencia de un modelo de ~7B es bajo en GPUs consumer.
- Prototipado conversacional offline: desplegado con llama.cpp u Ollama en local, sirve para validar flujos de diálogo en entornos sin conectividad o con requisitos de privacidad estrictos, antes de migrar a un modelo con licencia clara.
- Reproducción de metodología mergekit: útil como plantilla para equipos que quieran replicar merges lineales sobre sus propios checkpoints, ya que la configuración YAML completa está publicada.
- Evaluación comparativa de tokenizadores y plantillas de chat: al no documentarse la plantilla, permite medir empíricamente qué formato de prompt funciona mejor con este linaje de checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra métrica, y la búsqueda web realizada no ha devuelto documentación técnica asociada al modelo. Tampoco se publican comparaciones frente al checkpoint base (paso 11000) sin fusionar, por lo que no se puede cuantificar la ganancia o pérdida atribuible al merge.

## Requisitos de hardware

- VRAM para inferencia en `bfloat16`/`float16`: los pesos ocupan unos 13,7 GB; con caché KV y activaciones conviene reservar entre 16 y 20 GB para contextos moderados.
- VRAM en cuantización de 8 bits: aproximadamente 7 GB de pesos, con un total realista de 10-12 GB.
- VRAM en cuantización de 4 bits (GGUF Q4, AWQ, GPTQ): aproximadamente 3,5-4,5 GB de pesos, con un total realista de 6-8 GB.
- GPU recomendadas para `bfloat16`: A100 40/80 GB, H100, L40S 48 GB, RTX 4090 24 GB y RTX 3090 24 GB. Cabe en GPU consumer de gama alta sin particionado.
- GPU consumer de 16 GB (RTX 4080, RTX 4070 Ti Super): viable en 8 bits. En 16 bits queda al límite y depende de la longitud de contexto.
- GPU consumer de 8-12 GB (RTX 3060 12 GB, RTX 4060 8 GB): viable solo con cuantización de 4 bits.
- Opciones de despliegue: `transformers` (soporte nativo, arquitectura `gpt_neox`), `text-generation-inference` (etiqueta `endpoints_compatible`), vLLM (soporte de GPT-NeoX en versiones recientes), llama.cpp y Ollama previa conversión a GGUF, y servidores compatibles con la API de OpenAI.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por petición; cualquier cifra dependería del hardware, del framework y del tamaño de lote.
- Nota: el repositorio no incluye pesos cuantizados, por lo que las estimaciones de 8 y 4 bits implican un proceso de cuantización propio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (sfm_filtered_e2e_insert_hyperstition_v1, merge) | 6,86B | No disponible | No disponible | HuggingFace, safetensors bf16 | Merge lineal de 5 checkpoints, sin benchmarks ni model card detallada |
| Pythia-6.9B | 6,86B | 2048 tokens | Apache 2.0 | HuggingFace, safetensors | Arquitectura GPT-NeoX, entrenado sobre The Pile, con checkpoints intermedios publicados |
| GPT-J-6B | 6B | 2048 tokens | Apache 2.0 | HuggingFace, safetensors | Arquitectura GPT-J, base de muchos ajustes comunitarios |
| Llama 2 7B | 6,74B | 4096 tokens | Llama 2 Community License | HuggingFace, safetensors | Arquitectura Llama, ampliamente soportado por vLLM, llama.cpp y TGI |

Los datos de los modelos comparativos proceden de su documentación pública y se incluyen como referencia de categoría. Para este modelo no hay información que permita comparar rendimiento real, ya que no se han publicado evaluaciones.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar que el uso comercial esté permitido. En ausencia de licencia explícita, debe asumirse que no hay autorización clara y contactar con el autor antes de cualquier uso en producción.
- Model card mínima: no se documentan idiomas, contexto, dataset, plantilla de chat ni ajuste de seguridad. Cualquier integración requiere validación empírica previa.
- Riesgo de degradación por el merge: el promediado lineal de pesos puede degradar capacidades específicas presentes en checkpoints individuales, especialmente si los checkpoints fusionados divergen entre sí. No hay evaluación publicada que lo descarte.
- Riesgo de alucinación: es un modelo generativo de ~7B sin datos de evaluación de fidelidad; se espera una tasa de alucinación significativa en tareas de conocimiento factual.
- Sesgos: no se documenta composición del dataset ni filtrado, por lo que no se puede descartar sesgo de género, raza, religión o ideología en las generaciones.
- Comportamiento conversacional no verificado: la etiqueta `conversational` no viene acompañada de ejemplos ni de formato de prompt, por lo que el rendimiento en diálogo multi-turno es incierto.
- Longitud de contexto desconocida: planificar aplicaciones con documentos largos es arriesgado sin confirmar la ventana real; los modelos de la familia GPT-NeoX suelen limitarse a 2048 tokens.
- Trazabilidad limitada: las rutas de los checkpoints de origen son locales (`/opt/tiger/...`), lo que dificulta auditar el linaje y reproducir el merge fuera de la infraestructura del autor.
- Adopción nula: 0 descargas y 0 likes implican ausencia de validación por parte de la comunidad; no hay informes de terceros sobre su comportamiento.
- La búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo (los resultados obtenidos trataban de dimensiones de imágenes en redes sociales y no guardan relación con este repositorio).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm_filtered_e2e_insert_hyperstition_v1-7k_8k_9k_10k_11k_weightedavg_merge
- mergekit (herramienta de fusión): https://github.com/cg123/mergekit
- Artículo del método Linear merge / Model soups: https://arxiv.org/abs/2203.05482
- Perfil del autor en HuggingFace: https://huggingface.co/yuhengtu-bytedance
- Otros enlaces (papers, blogs, repos, demos) asociados específicamente a este modelo: no disponibles en la información proporcionada.
