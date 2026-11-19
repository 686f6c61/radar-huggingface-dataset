# TalentPigs/zils-mini-bw1

## Resumen

zils-mini-bw1 es un modelo publicado por TalentPigs en Hugging Face, construido como un fine-tuning del modelo base Qwen/Qwen3.5-4B. Con 4.539.265.536 parámetros reales en safetensors, se enmarca en la familia de modelos "decision-model" del ecosistema Zils, concretamente como "decision body" para el pool d3-mini de la subnet 127. La model card es extremadamente escueta y no documenta datos de entrenamiento, composición del dataset ni metodología de ajuste.

El modelo se distribuye bajo licencia Apache-2.0, con atribuciones upstream recogidas en los ficheros LICENSE y NOTICE del repositorio. El repositorio ocupa 9,1 GB y utiliza la librería transformers con pesos en safetensors y código personalizado (custom_code), lo que implica que la carga requiere confiar en implementaciones incluidas en el propio repositorio.

Su relevancia es limitada y muy específica: no hay descargas ni likes, no se han publicado benchmarks y la documentación es mínima. Resulta adecuado únicamente para experimentación dentro del contexto del pool d3-mini de Zils, y no como un modelo de propósito general para producción sin una evaluación previa exhaustiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen/Qwen3.5-4B, tag qwen3_5) |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers, custom_code) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna más allá de que el modelo deriva de Qwen/Qwen3.5-4B, etiquetado con el tag qwen3_5. El recuento real de parámetros en safetensors (4.539.265.536) es ligeramente superior a los 4B nominales del modelo base, lo que sugiere posibles capas adicionales o componentes específicos del "decision body", pero la model card no lo aclara.

Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. El pipeline declarado es feature-extraction y los tags incluyen decision-model, zils y d3-mini, lo que apunta a un uso como extractor de características o componente de decisión dentro de un pipeline mayor del subnet 127, más que a un modelo generativo conversacional.

## Capacidades

- Extracción de características (feature-extraction) según el pipeline declarado en Hugging Face.
- Componente de decisión ("decision body") para el pool d3-mini de la subnet 127 de Zils.
- Generación de texto: no confirmada en la información disponible.
- Razonamiento, matemáticas y código: no documentados.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles (el campo de idiomas está vacío).
- Capacidades especiales (thinking mode, visión, audio): no documentadas.

## Casos de uso

- Integración en el pool d3-mini de Zils: el modelo está diseñado explícitamente como "decision body" para este pool, por lo que su uso previsto es servir como componente de decisión dentro de la infraestructura del subnet 127.
- Extracción de embeddings o características: al declarar el pipeline feature-extraction, puede emplearse para obtener representaciones vectoriales de texto en pipelines de clasificación o recuperación, previa validación empírica.
- Experimentación con fine-tunings de Qwen3.5-4B: sirve como punto de partida para estudiar cómo se comporta un ajuste derivado de este base model en tareas de decisión.
- Evaluación comparativa de modelos de decisión: útil en entornos de investigación que comparen "decision bodies" alternativos dentro del ecosistema Zils.
- Prototipado interno de agentes de decisión: puede probarse como módulo de selección o puntuación en flujos multi-etapa, siempre con validación previa dado que no hay benchmarks publicados.
- Reproducción de experimentos de la comunidad Zils: para quienes trabajen con la subnet 127, el repositorio permite reproducir el estado exacto del modelo publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, se recomienda un mínimo de 12-16 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: en torno a 5 GB para pesos; en 4 bits, en torno a 2,5-3 GB, aunque no se confirman cuantizaciones oficiales publicadas.
- GPU recomendadas: A100, H100 o L40S para despliegues con throughput alto; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en fp16 sin problemas de memoria.
- GPU de consumo: cabe en tarjetas con 12 GB o más en fp16 con margen ajustado; en cuantización de 8 o 4 bits podría ejecutarse en GPUs de 8 GB, si bien no hay artefactos GGUF publicados.
- Opciones de despliegue: transformers con custom_code (requiere confiar en el código del repositorio); vLLM, llama.cpp, Ollama o TGI no están confirmados para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-bw1 | 4.539.265.536 | no disponible | apache-2.0 | Hugging Face (0 descargas) | Fine-tuning de Qwen3.5-4B para el pool d3-mini de Zils |
| Qwen/Qwen3.5-4B | ~4B (nominal) | no disponible | no disponible en esta ficha | Hugging Face | Modelo base del que deriva zils-mini-bw1 |
| Otros fine-tunings de Qwen3.5-4B | variable | no disponible | variable | Hugging Face | No se dispone de datos comparativos de rendimiento |

No se dispone de información de benchmarks que permita una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Documentación mínima: la model card no describe datos de entrenamiento, metodología ni evaluación, lo que impide valorar su calidad de forma objetiva.
- Sin benchmarks publicados: no hay evidencia empírica de rendimiento en tareas estándar.
- Riesgo de alucinación: no evaluado; al ser un derivado de un modelo de 4B sin datos de ajuste, el riesgo existe y no está cuantificado.
- Idiomas no declarados: se desconoce qué lenguas cubre realmente el modelo.
- Contexto no documentado: no se puede planificar su uso en tareas de contexto largo sin verificación previa.
- custom_code: la carga requiere ejecutar código del repositorio, lo que introduce un riesgo de seguridad en entornos de producción.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar los ficheros LICENSE y NOTICE para las atribuciones upstream de Qwen.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado el modelo.
- Uso muy específico: está pensado para el pool d3-mini de la subnet 127 de Zils; fuera de ese contexto su idoneidad no está demostrada.

## Enlaces

- Hugging Face: https://huggingface.co/TalentPigs/zils-mini-bw1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
