# TalentPigs/zils-mini-bw5

## Resumen

Zils-mini-bw5 es un modelo derivado de Qwen/Qwen3.5-4B publicado por el usuario TalentPigs bajo licencia Apache-2.0. Se presenta como un "cuerpo de decisión d3-mini" (decision body) destinado al pool d3-mini de la subred 127 de Zils, una red de tipo subnet con modelos especializados. El modelo conserva la arquitectura y el peso del modelo base Qwen3.5-4B, con 4.539.265.536 parámetros totales según los safetensors del repositorio (9,1 GB), y se distribuye en formato transformers con safetensors y código personalizado (custom_code).

La relevancia de esta ficha es limitada y debe interpretarse con cautela: la model card es extremadamente escueta (apenas cinco líneas de contenido útil) y no aporta información sobre datos de entrenamiento, proceso de ajuste, capacidades, idiomas ni benchmarks. El pipeline declarado es feature-extraction, aunque los tags incluyen decision-model, lo que sugiere un uso orientado a la extracción de representaciones o a la toma de decisiones dentro de un pipeline mayor del ecosistema Zils, más que a la generación de texto conversacional.

En la práctica, se trata de un checkpoint de ajuste fino sobre Qwen3.5-4B cuyo propósito exacto no está documentado públicamente. Cualquier evaluación de producción debería partir de la premisa de que la información disponible es insuficiente y requeriría validación empírica directa del checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-4B; detalles no disponibles) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers, con custom_code) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base Qwen/Qwen3.5-4B, un transformer de aproximadamente 4.500 millones de parámetros. No se dispone de información sobre la arquitectura interna concreta (número de capas, dimensiones, mecanismo de atención, uso de atención lineal o híbrida) más allá de la referencia al modelo base. El repositorio incluye código personalizado (custom_code), lo que implica que la carga del modelo requiere confiar en la implementación proporcionada por el autor y no únicamente en clases estándar de transformers.

No hay datos públicos sobre el proceso de entrenamiento: ni volumen de tokens, ni composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. La model card únicamente indica que se trata de un "decision body" para el pool d3-mini de la subred 127 de Zils, sin detallar la metodología de ajuste ni las métricas de validación. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Extracción de características (feature-extraction): es el pipeline declarado en Hugging Face, por lo que el uso previsto principal es la obtención de representaciones o embeddings.
- Toma de decisiones (decision-model): el tag sugiere un rol dentro de un sistema de decisión del ecosistema Zils, aunque no se especifica el formato de entrada/salida ni el tipo de decisión.
- Generación de texto: no confirmada explícitamente; al derivar de un modelo de lenguaje, es plausible, pero no está documentada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Extracción de embeddings para búsqueda semántica: al declararse el pipeline feature-extraction, el modelo puede emplearse para generar representaciones vectoriales de textos y alimentar índices de recuperación, siempre que se valide empíricamente la calidad de los embeddings.
- Componente de decisión en pipelines Zils: dentro del pool d3-mini de la subred 127, el modelo puede actuar como cuerpo de decisión en un sistema mayor; su idoneidad depende de la integración específica definida por el ecosistema Zils.
- Clasificación o scoring de candidatos: si el "decision body" produce puntuaciones o etiquetas, podría integrarse en sistemas de ranking o filtrado, previa validación del formato de salida.
- Prototipado de investigación sobre Qwen3.5-4B: al ser un ajuste fino del modelo base, sirve para estudiar el efecto del ajuste sobre las representaciones, comparando con el checkpoint original.
- Evaluación comparativa de checkpoints derivados: útil en experimentos que comparen variantes de Qwen3.5-4B ajustadas para tareas específicas.
- Base para experimentos de ajuste adicional: al estar bajo Apache-2.0, puede reutilizarse como punto de partida para nuevos ajustes, siempre que se respeten las atribuciones del NOTICE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9 GB solo para pesos (4.539 millones de parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, se recomienda al menos 12-16 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB para pesos, con overhead adicional.
- VRAM estimada en cuantización de 4 bits: alrededor de 2,5-3 GB para pesos, con overhead adicional; no se confirma que existan GGUF oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue de producción; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en fp16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y, con cuantización, en GPUs de 8-12 GB como RTX 4070 o RTX 3060 de 12 GB.
- Opciones de despliegue: transformers con custom_code (requerido por el repositorio); vLLM, TGI o llama.cpp solo si el código personalizado es compatible, lo cual no está documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| TalentPigs/zils-mini-bw5 | 4.539 M | no disponible | Apache-2.0 | Hugging Face | Ajuste fino de Qwen3.5-4B, documentación escasa |
| Qwen/Qwen3.5-4B | ~4.000 M (aprox.) | no disponible | no disponible en la información | Hugging Face | Modelo base del que deriva |
| Alternativas de ~4B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- Documentación insuficiente: la model card no describe datos de entrenamiento, capacidades, idiomas ni métricas; no debe asumirse ningún comportamiento no verificado.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se ha evaluado en este checkpoint.
- Sesgos: no documentados; al derivar de un modelo base, puede heredar sesgos de Qwen3.5-4B, pero no hay información al respecto.
- Código personalizado: el repositorio incluye custom_code, lo que implica riesgos de seguridad y de compatibilidad; es necesario auditar el código antes de ejecutarlo en producción.
- Licencia: Apache-2.0 permite uso comercial, pero el NOTICE incluye atribuciones de terceros que deben respetarse; conviene revisar el archivo LICENSE y NOTICE del repositorio.
- Idiomas: no disponibles; no se puede garantizar soporte multilingüe.
- Contexto: longitud no documentada; no debe asumirse una ventana concreta sin verificación.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/TalentPigs/zils-mini-bw5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio del autor: no disponible
- Paper: no disponible
- Blog o demo: no disponible
