# Thox-ai/ThoxMythos-9B

## Resumen

ThoxMythos-9B es una redistribución en formato GGUF de un fine-tune comunitario sin censura del modelo base Qwen/Qwen3.5-9B. El autor del repositorio es Thox-ai (THOX.ai), pero el propio autor declara explícitamente que no ha entrenado estos pesos: se limita a redistribuir el build comunitario que aparece registrado en los GGUFs como "Qwythos 9B Claude Mythos 5 1M Uncensored Heretic" (Empero AI). El modelo cuenta con 8.953.803.264 parámetros totales y se distribuye bajo licencia Apache 2.0.

El modelo resuelve el caso de uso de inferencia local de un modelo de razonamiento de 9B con comportamiento de rechazo reducido (etiquetado como "abliterated" y "minimal-refusal" en el repositorio), pensado para investigación y evaluación interna. Se publica en dos cuantizaciones GGUF (Q4_K_M de 6,22 GB y Q5_K_M de 6,62 GB) y también como modelo ejecutable en Ollama bajo el identificador `Thox-ai/thoxmythos`.

Es relevante ahora porque ocupa el nicho de modelos de 9B ejecutables en hardware de consumo (a partir de 16 GB de RAM) con contexto declarado de hasta 1M en el nombre del build comunitario subyacente, aunque el repositorio no documenta especificaciones técnicas propias más allá del modelo base. La ficha debe leerse con cautela: el autor no reclama calidad ni evaluación para estos pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de Qwen/Qwen3.5-9B; el repositorio no la documenta) |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el nombre del build comunitario menciona "1M", sin confirmación técnica en el repositorio) |
| Tipos de cuantizacion | GGUF Q4_K_M (6.216.967.936 B) y Q5_K_M (6.621.325.056 B) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors no incluidos en el repositorio; el dato de parámetros procede de los safetensors del modelo base) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo más allá de indicar que el base es Qwen/Qwen3.5-9B. No se especifican detalles sobre atención, tipo de transformer, composición del dataset de entrenamiento, número de tokens, ni si hubo RLHF, DPO u otras fases de alineamiento. El autor declara explícitamente que THOX no ha entrenado estos pesos y no emite ninguna afirmación de calidad sobre ellos.

La única información técnica sobre el proceso de entrenamiento es la que aparece en el nombre del build comunitario de origen ("Qwythos 9B Claude Mythos 5 1M Uncensored Heretic", de Empero AI): se trata de un fine-tune con comportamiento de rechazo reducido ("abliterated", "minimal-refusal", "uncensored" en las etiquetas) y con comportamiento de razonamiento. No se aportan datos sobre la metodología de abliteration ni sobre el volumen o la composición de los datos empleados. El repositorio incluye código de filtro de identidad (`identity_filter.py`, `test_identity_filter.py`, `notebook.ipynb`) y registros de pruebas de humo (`smoke-identity-guard-20260707.txt`, `smoke-identity-q5-20260707-083729.txt`), pero no se detalla su función técnica en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento: el repositorio incluye la etiqueta `reasoning` y el build de origen se describe con comportamiento de razonamiento.
- Comportamiento de rechazo reducido ("uncensored", "abliterated", "minimal-refusal"), orientado a investigación y evaluación interna.
- Tool calling / function calling: no soportado en las configuraciones de servicio publicadas. Los Modelfiles de THOX usan una plantilla ChatML simple que no renderiza llamadas a herramientas, por lo que el autor declara explícitamente que no es una funcionalidad soportada.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: solo inglés declarado (`language: en`).
- Capacidades especiales (visión, audio, thinking mode explícito): no disponibles en la información proporcionada.

## Casos de uso

- Evaluación interna de robustez y seguridad: el modelo sirve para probar cómo se comporta un sistema con rechazo reducido frente a prompts adversarios, como parte de un pipeline de revisión de seguridad (`safety-review`) antes de desplegar modelos propios.
- Investigación sobre alineamiento y abliteration: permite estudiar empíricamente el efecto de eliminar comportamientos de rechazo en un fine-tune de 9B, comparándolo con el base Qwen3.5-9B.
- Inferencia local en hardware de consumo: con 6,22 GB (Q4_K_M) y 6,62 GB (Q5_K_M), el modelo cabe en equipos con al menos 16 GB de RAM, lo que permite experimentar sin GPU dedicada mediante llama.cpp u Ollama.
- Prototipado de asistentes conversacionales en inglés con contexto largo: útil para validar flujos conversacionales multi-turno en entornos de desarrollo antes de migrar a un modelo con soporte de tool calling.
- Generación de texto creativo sin restricciones de contenido: el comportamiento de rechazo reducido lo hace adecuado para experimentación literaria o de ficción en entornos controlados, siempre con una capa de seguridad propia si hay usuarios finales.
- Reproducibilidad de artefactos comunitarios: los hashes SHA-256 publicados de ambos GGUFs permiten verificar la integridad de los ficheros en pipelines de CI o en auditorías de cadena de suministro de modelos.
- Despliegue rápido con Ollama: el modelo está publicado como `Thox-ai/thoxmythos` (Q5_K_M, 6,6 GB), lo que simplifica pruebas locales con un solo comando.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no emite ninguna afirmación de calidad sobre estos pesos ("No THOX quality claim") y que no ha publicado evaluación alguna.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: Q4_K_M requiere aproximadamente 6,2 GB de pesos; Q5_K_M, aproximadamente 6,6 GB. El autor indica que el modelo está dimensionado para hosts con al menos 16 GB de RAM.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, cualquier GPU con 8 GB o más de VRAM puede alojar los pesos en cuantización Q4/Q5, aunque no hay datos de rendimiento publicados.
- Cabe en GPU de consumo: sí, por tamaño de pesos; no se confirma compatibilidad ni velocidad en modelos concretos (RTX 4090, RTX 3090, etc.) porque no hay datos publicados.
- Opciones de despliegue: llama.cpp (`llama-cli` con los GGUFs del repositorio), Ollama (`Thox-ai/thoxmythos`), y descarga vía `hf download`. No se mencionan vLLM ni TGI (no aplicables directamente a GGUF en la información disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ThoxMythos-9B | 8,95B | no disponible | GGUF Q4_K_M / Q5_K_M | Apache 2.0 | Redistribución comunitaria sin censura; sin evaluación publicada |
| Qwen/Qwen3.5-9B (base) | 9B | no disponible en esta ficha | safetensors (base) | no disponible en esta ficha | Modelo base oficial; referencia para comparar el efecto del fine-tune |
| Build comunitario "Qwythos 9B Claude Mythos 5 1M Uncensored Heretic" (Empero AI) | 9B | "1M" en el nombre, sin confirmar | no disponible | no disponible | Origen de los pesos redistribuidos; ThoxMythos-9B es una recopia GGUF |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que no ha entrenado los pesos y no emite ninguna afirmación de calidad; no debe asumirse un nivel de rendimiento concreto.
- Comportamiento de rechazo reducido ("uncensored", "abliterated"): no debe desplegarse ante usuarios finales sin una capa de seguridad propia, tal como advierte el propio repositorio.
- Tool calling no soportado en las configuraciones de servicio publicadas (plantilla ChatML simple que no renderiza llamadas a herramientas).
- Solo inglés declarado; no hay soporte multilingüe documentado.
- Riesgo de alucinación: no cuantificado ni evaluado en la información disponible.
- Sesgos conocidos: no documentados; un fine-tune sin censura puede amplificar sesgos del modelo base, pero no hay datos que lo confirmen.
- Longitud de contexto: no confirmada técnicamente; el "1M" del nombre del build de origen no está verificado en el repositorio.
- Licencia Apache 2.0 permite uso comercial según los términos de la licencia, pero el estado de "redistribución comunitaria" y la ausencia de evaluación desaconsejan producción sin validación propia.
- El modelo no forma parte del catálogo ThoxOS ni MeshStack según el autor, y no se promociona para dispositivos THOX.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxMythos-9B
- Ollama: https://ollama.com/Thox-ai/thoxmythos
- Catálogo de modelos THOX.ai: https://www.thox.ai/docs/model-catalog
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
