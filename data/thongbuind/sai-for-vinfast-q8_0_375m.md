# thongbuind/SAI-for-VinFast-Q8_0_375M

## Resumen

SAI-for-VinFast-Q8_0_375M es un checkpoint cuantizado de 375 millones de parámetros publicado por thongbuind en Hugging Face. Está pensado para tareas de asistente virtual a bordo de vehículos VinFast y se distribuye en formato GGUF con cuantización Q8_0. El modelo declara 375.194.624 parámetros, 24 capas, d_model=1024, 16 cabezas query y 4 cabezas KV.

Su interés principal es el despliegue local en entornos con recursos limitados: el archivo de pesos ocupa 380,55 MiB y la configuración y el tokenizer van incluidos en el GGUF. Está orientado al vietnamita (vi) y a generación de texto conversacional. No se ha especificado licencia de pesos ni se han publicado benchmarks de calidad.

La model card incluye una verificación técnica de la cuantización frente a FP32, pero no una evaluación de respuestas en un conjunto held-out de VinFast. Además, requiere una revisión concreta de llama.cpp y un parche para el byte fallback del tokenizer, por lo que su integración en runtimes estándar no está verificada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No declarada explícitamente. Configuración indicada: 24 capas, d_model=1024, 16 cabezas query y 4 cabezas KV. La relación 16:4 es compatible con grouped-query attention (GQA), pero no se etiqueta así en la model card. |
| Parámetros totales | 375.194.624 (375M) |
| Parámetros activos | No aplica (no se indica arquitectura MoE) |
| Longitud de contexto | No disponible. La verificación técnica cubre KV cache hasta 1024 tokens; no se declara máximo oficial. |
| Tipos de cuantización | Q8_0 (GGUF); normas en F32 |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | No disponible; el propietario no ha especificado licencia de pesos |
| Formato de pesos | GGUF (SAI-for-VinFast-Q8_0_375M.gguf); config y tokenizer incluidos en el GGUF |
| Tamaño de pesos | 380,55 MiB |
| Tamaño del repositorio | 0,4 GB |
| Pipeline | text-generation |
| Etiquetas | gguf, sai, vinfast, text-generation, vi, conversational, endpoints_compatible, region:us |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creación | 2026-10-08 |
| Última actualización | 2026-10-08 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura de forma explícita más allá de la configuración indicada: 24 capas, d_model=1024, 16 cabezas query y 4 cabezas KV. Esa relación entre cabezas query y KV es compatible con grouped-query attention (GQA), pero el autor no lo etiqueta como tal. El pipeline declarado es text-generation y el modelo se presenta como conversacional para el dominio de asistente virtual en vehículos VinFast.

No se han proporcionado datos sobre el conjunto de entrenamiento, número de tokens, composición del dataset, fases de ajuste (SFT, RLHF, DPO) ni innovaciones de entrenamiento. La model card se centra en la cuantización Q8_0 y en su verificación técnica: tokenizer coincide en 13/13 casos, logits finitos en 45 puntos, max relative RMSE 0,023807, max KL 0,000416 y top-1 coincidente con FP32 en 45/45 puntos. El uso requiere llama.cpp en la revisión cb7934c52ca8710994b2ecc19775ebefcfdb8d01 y el parche llama-ugm-byte-fallback.patch para preservar el byte fallback del tokenizer SAI. Los hashes de fuente, tokenizer, parche y pesos están en manifest.json.

## Capacidades

- Generación de texto conversacional en vietnamita.
- Asistente virtual para vehículos VinFast, según la definición del autor.
- Plantilla de chat incluida en el archivo GGUF; el contenido en vietnamita se normaliza a minúsculas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe; el único idioma declarado es vietnamita (vi).
- No se documentan capacidades de visión, audio, código, matemáticas o modo de razonamiento explícito.
- Etiqueta endpoints_compatible presente, pero sin detalles adicionales sobre el protocolo o el servidor compatible.

## Casos de uso

- Asistente conversacional embebido en el infoentretenimiento de un VinFast: usar el GGUF en local para responder en vietnamita con un consumo de memoria bajo; adecuado por tamaño de 375M y cuantización Q8_0, aunque falta evaluación de calidad en dominio.
- Prototipo de asistente por voz en vehículo: combinar un ASR vietnamita, este modelo y un TTS; el contexto verificado de 1024 tokens permite diálogos cortos de ida y vuelta.
- Despliegue en unidades con CPU o GPU integrada: los 380,55 MiB de pesos permiten ejecución en hardware modesto mediante llama.cpp, útil para pruebas de concepto en el vehículo o en bancos de pruebas.
- Validación de tokenizer y cuantización: comprobar el byte fallback con el parche indicado y reproducir las métricas RMSE/KL frente a FP32 en pipelines de CI.
- Investigación sobre modelos pequeños para vietnamita en automoción: servir como punto de partida para experimentos de ajuste fino o destilación en un dominio acotado.
- Demo local sin conexión: ejecutar un chatbot vietnamita especializado en VinFast en un portátil o mini-PC, sin depender de APIs externas.
- Pruebas de integración en endpoints compatibles: aprovechar la etiqueta endpoints_compatible para conectar el GGUF a un servidor de inferencia, verificando antes la revisión de llama.cpp.
- Generación de respuestas de ayuda básica al conductor: siempre que se valide el modelo con datos held-out, podría generar respuestas sobre funciones del vehículo, manteniendo el contexto corto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card sí incluye métricas de verificación técnica de la cuantización, que no deben interpretarse como calidad de respuesta:

| Métrica | Resultado |
|---|---|
| Tokenizer | Coincide en 13/13 casos |
| Logits finitos | 45 puntos, incluyendo prefill y decode con KV cache hasta contexto 1024 |
| Max relative RMSE | 0,023807 |
| Max KL | 0,000416 |
| Top-1 coincidente con FP32 | 45/45 puntos |
| Tamaño del archivo de pesos | 380,55 MiB |

## Requisitos de hardware

- VRAM estimada: a partir del archivo de 380,55 MiB, los pesos Q8_0 ocupan menos de 0,4 GB. Con overhead de runtime y KV cache, una estimación orientativa es 0,5-1,0 GB para contexto de 1024 tokens; no es una cifra publicada por el autor.
- GPU recomendadas: no disponibles. Por tamaño, debería caber en GPUs consumer con al menos 2 GB de VRAM; no hay validación oficial de modelos concretos.
- CPU: viable en llama.cpp, especialmente para pruebas y despliegue de baja concurrencia.
- Cabe en consumer GPU: sí, según el tamaño de pesos, en GPUs con 2 GB de VRAM o más; no confirmado por el autor.
- Opciones de despliegue: llama.cpp en la revisión cb7934c52ca8710994b2ecc19775ebefcfdb8d01 con el parche llama-ugm-byte-fallback.patch. vLLM, TGI, Ollama y llama.cpp stock no están verificados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

En la información proporcionada no se ofrecen modelos comparables ni resultados frente a alternativas.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| SAI-for-VinFast-Q8_0_375M | 375M | No disponible (verificado hasta 1024) | No disponible | GGUF Q8_0 | Hugging Face, 0 descargas, 0 likes | Asistente VinFast en vietnamita; requiere parche de llama.cpp |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible | No se han encontrado datos de comparación en la información disponible |

## Limitaciones y advertencias

- Licencia de pesos no especificada: no se puede asumir uso comercial.
- Sin benchmarks de calidad; la verificación es de cuantización, no de respuestas.
- No hay evaluación en held-out de VinFast; el rendimiento real en el dominio no está medido.
- 0 descargas y 0 likes en el momento de la consulta; sin validación externa.
- Requiere una revisión concreta de llama.cpp y un parche; llama.cpp stock y Ollama no están verificados.
- Contexto máximo no declarado; solo se ha verificado KV cache hasta 1024 tokens.
- Solo vietnamita; no hay soporte multilingüe documentado.
- El chat template normaliza el vietnamita a minúsculas, lo que puede afectar a nombres propios o formato.
- Modelo pequeño (375M): mayor riesgo de alucinación y menor razonamiento que modelos de mayor tamaño.
- No se documentan sesgos, pero no puede descartarse sesgo derivado de datos de entrenamiento no publicados.
- No se documentan tool calling, agentes, visión ni audio.
- La etiqueta endpoints_compatible no especifica qué servidor o API es compatible.

## Enlaces

- [thongbuind/SAI-for-VinFast-Q8_0_375M en Hugging Face](https://huggingface.co/thongbuind/SAI-for-VinFast-Q8_0_375M)
- [thongbuind/SAI_100M en Hugging Face](https://huggingface.co/thongbuind/SAI_100M)
- [Perfil de thongbuind (Nidai) en GitHub](https://github.com/thongbuind)
- [Repositorios de thongbuind en GitHub](https://github.com/thongbuind?tab=repositories)
