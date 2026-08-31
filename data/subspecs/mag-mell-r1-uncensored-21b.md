# subspecs/Mag-Mell-R1-Uncensored-21B

## Resumen

Mag-Mell-R1-Uncensored-21B es un modelo de lenguaje de 20.400 millones de parámetros creado por el usuario subspecs mediante la técnica de fusión *passthrough* con mergekit. Parte del modelo base Naphula/MN-12B-Mag-Mell-R1-Uncensored, que a su vez es una versión "abliterada" (sin censura) del Mag-Mell-R1 de 12B desarrollado por inflatebot. El objetivo del autor es replicar el éxito del passthrough de 21B que ya existía para la versión original, pero aplicado a la variante sin restricciones de contenido, obteniendo un modelo más grande y con menos errores en detalles narrativos y gramaticales.

El modelo mantiene la arquitectura Mistral (transformer decoder-only) y se distribuye en formato safetensors con pesos en bfloat16. No se especifica la longitud de contexto en la información disponible, aunque el modelo base MN-12B-Mag-Mell-R1 tiene una ventana de 33K tokens según fuentes externas. El repositorio incluye cuantizaciones GGUF realizadas por mradermacher, lo que facilita su ejecución en hardware con menos VRAM. Su relevancia radica en ofrecer una alternativa de mayor tamaño y sin filtros de contenido para tareas de generación creativa y conversacional, aunque su licencia no está declarada, lo que limita su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Mistral) |
| Parametros totales | 20.426.982.400 (20,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base MN-12B-Mag-Mell-R1 tiene 33K, pero no se confirma para este merge) |
| Tipos de cuantizacion | bfloat16 (original), GGUF (Q-quants por mradermacher) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se construye mediante el método de fusión *passthrough* de mergekit, que consiste en concatenar capas del mismo modelo base para aumentar el número de parámetros. Según la configuración YAML, se toman las capas 0-30 del modelo Naphula/MN-12B-Mag-Mell-R1-Uncensored, luego las capas 16-32 (dos veces, con escalado 0.0 en las proyecciones o_proj y down_proj para evitar duplicar ciertos pesos), y finalmente las capas 32-40. Esto produce un modelo de 20,4B parámetros a partir de un modelo original de 12B, duplicando parcialmente capas intermedias.

No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, técnicas de alineación). El modelo base Naphula/MN-12B-Mag-Mell-R1-Uncensored es una "abliteración" (eliminación de direcciones de rechazo) del Mag-Mell-R1 de inflatebot, lo que elimina gran parte de las restricciones de contenido. El merge no implica entrenamiento adicional; solo combina pesos existentes.

## Capacidades

- Generación de texto libre y conversacional, con especial énfasis en narrativa creativa y roleplay.
- Razonamiento básico y seguimiento de instrucciones, heredado del modelo base.
- Soporte multilingüe no confirmado; se desconoce el alcance real de idiomas.
- Sin soporte documentado de tool calling, function calling o capacidades de agente.
- Sin modo de razonamiento explícito (thinking mode) ni capacidades multimodales (visión, audio).
- Al ser una versión "uncensored", puede generar contenido explícito o sensible sin rechazos, lo que puede ser útil en entornos de investigación controlados.

## Casos de uso

- Generación de ficción y narrativa larga: el mayor tamaño (21B frente a 12B) reduce errores de coherencia y gramática en historias extensas, como indica el autor. Se puede usar con temperaturas altas (1.25) y MinP 0.2 para obtener resultados creativos.
- Roleplay y simulación de personajes: al no tener filtros de contenido, permite explorar diálogos y situaciones que otros modelos rechazarían, útil en prototipos de juegos o asistentes de escritura.
- Asistente conversacional sin restricciones: para entornos de investigación donde se necesita analizar respuestas sin censura, por ejemplo en estudios de sesgos o comportamientos de modelos.
- Generación de guiones y diálogos: su capacidad para mantener contexto largo (si se confirma la ventana de 33K) permite trabajar con tramas complejas y múltiples personajes.
- Fine-tuning posterior: al estar disponible en safetensors, puede servir como base para ajuste fino en tareas específicas de generación de texto, aunque la falta de licencia clara es un riesgo.
- Despliegue en entornos locales con cuantización GGUF: gracias a los quants de mradermacher, se puede ejecutar en GPUs de consumo (8-12 GB VRAM) o incluso en CPU, para pruebas y prototipos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo. El autor no proporciona métricas comparativas con el modelo base de 12B ni con otros modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: ~41 GB (20,4B parámetros × 2 bytes), lo que requiere una GPU profesional como A100 40GB, A100 80GB o H100.
- Con cuantización GGUF Q4_K_M (~11-12 GB), cabe en GPUs de consumo como RTX 3090, RTX 4090 (24 GB) o incluso RTX 4060 Ti 16 GB.
- Con cuantización GGUF Q8 (~21 GB), se necesita una GPU con al menos 24 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama (si se convierte a GGUF), vLLM (con soporte para safetensors), text-generation-inference (TGI) según los tags del repositorio.
- Latencia y throughput: no disponibles. Dependerá del hardware y la cuantización; en una RTX 4090 con Q4 se pueden esperar decenas de tokens por segundo, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Mag-Mell-R1-Uncensored-21B (este) | 20,4B | no disponible | no disponible | safetensors, GGUF |
| MN-12B-Mag-Mell-R1-Uncensored (base) | 12B | 33K (según Antbase) | no disponible | safetensors |
| Mag-Mell-R1-21B (Frowning) | 21B | no disponible | no disponible | safetensors, GGUF |

No se dispone de datos de rendimiento comparativo. El modelo de 21B es una extensión del de 12B, por lo que se espera mayor capacidad de razonamiento y coherencia, pero no hay métricas que lo confirmen. La comparación con otros modelos de ~20B (como Llama-2-13B, Mistral-7B, etc.) no es posible sin benchmarks.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no declara ninguna licencia, lo que impide su uso comercial sin riesgo legal. Se debe contactar al autor antes de cualquier despliegue en producción.
- Sesgos y alucinaciones: al ser un modelo sin censura y sin entrenamiento de alineación adicional, puede generar contenido falso, ofensivo o peligroso con mayor facilidad que modelos alineados.
- Riesgo de contenido inapropiado: la abliteración elimina los rechazos, por lo que el modelo puede producir texto explícito, violento o discriminatorio. No apto para aplicaciones públicas sin moderación.
- Coherencia en contextos largos: aunque el modelo base tiene 33K de contexto, el merge puede afectar la atención en secuencias largas; no hay pruebas que lo confirmen.
- Sin soporte de herramientas: no se documenta tool calling ni integración con APIs, lo que limita su uso en agentes autónomos.
- Fecha de creación futura (2026-08-31) y cero descargas: el modelo es muy reciente y no ha sido validado por la comunidad, por lo que su calidad real es incierta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/subspecs/Mag-Mell-R1-Uncensored-21B
- Cuantizaciones GGUF (mradermacher): https://huggingface.co/mradermacher/Mag-Mell-R1-Uncensored-21B-GGUF
- Cuantizaciones GGUF i1 (mradermacher): https://huggingface.co/mradermacher/Mag-Mell-R1-Uncensored-21B-i1-GGUF
- Modelo base Naphula/MN-12B-Mag-Mell-R1-Uncensored: https://huggingface.co/Naphula/MN-12B-Mag-Mell-R1-Uncensored
- Modelo original inflatebot/MN-12B-Mag-Mell-R1: https://huggingface.co/inflatebot/MN-12B-Mag-Mell-R1
- Referencia al passthrough de Frowning: https://huggingface.co/Frowning/Mag-Mell-R1-21B
