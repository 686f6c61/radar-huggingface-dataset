# trinityomni/OpenThinker-32B

## Resumen

OpenThinker-32B es un modelo de razonamiento de código abierto desarrollado por el equipo de OpenThoughts. Se trata de un fine-tuning completo de Qwen/Qwen2.5-32B-Instruct sobre el dataset OpenThoughts-114k, un conjunto de datos generado mediante destilación de DeepSeek-R1 utilizando un pipeline de datos abierto. El modelo está diseñado para mejorar las capacidades de razonamiento matemático, científico y de código, y se enmarca en la línea de modelos de razonamiento que buscan replicar el rendimiento de modelos cerrados con recursos de entrenamiento reducidos.

Con 32.763.876.352 parámetros, OpenThinker-32B fue entrenado con una longitud de contexto de 16k tokens durante 3 épocas. Su relevancia radica en que publica no solo los pesos del modelo, sino también el dataset, el código de generación de datos, el código de evaluación y el código de entrenamiento, todo bajo licencia Apache 2.0. Esto lo convierte en una alternativa completamente reproducible y auditables frente a otros modelos de razonamiento que mantienen cerrados sus datos o su proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (modelo base); entrenado con 16k |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

OpenThinker-32B es un modelo Transformer decoder-only basado en la arquitectura Qwen2.5-32B-Instruct. El entrenamiento consistió en un fine-tuning completo de todos los parámetros sobre el dataset OpenThoughts-114k, que contiene 114.000 ejemplos derivados de la destilación de DeepSeek-R1. El proceso se realizó con LlamaFactory durante 3 épocas, con una longitud de contexto de 16k tokens, tamaño de lote total de 96, learning rate de 1e-05, scheduler cosine con warmup del 10% y optimizador AdamW. El entrenamiento se llevó a cabo en AWS SageMaker con 8 nodos H100, requiriendo aproximadamente 90 horas en 4 nodos. La principal innovación técnica es el uso de un pipeline de datos abierto y reproducible para destilar las capacidades de razonamiento de DeepSeek-R1, así como la publicación de todos los componentes del proceso.

## Capacidades

- Razonamiento matemático avanzado: resultados destacados en benchmarks como AIME24, AIME25 y MATH500.
- Razonamiento científico: buen desempeño en GPQA Diamond, un benchmark de preguntas de nivel de posgrado en ciencias.
- Generación de código: capacidad de resolver problemas de programación evaluada en LiveCodeBench (LCBv2).
- Generación de texto en modo instructivo, heredado del modelo base Qwen2.5-32B-Instruct.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente, aunque el modelo está entrenado para razonamiento extenso.
- Capacidades multilingües: no documentadas en la información disponible.

## Casos de uso

- Tutoría matemática personalizada: el modelo puede resolver problemas de nivel olímpico (AIME) y explicar el razonamiento paso a paso, lo que lo hace adecuado para plataformas educativas que ofrecen ayuda en matemáticas avanzadas.
- Asistente de investigación científica: con su rendimiento en GPQA Diamond, puede apoyar a investigadores en la revisión de literatura, formulación de hipótesis o resolución de preguntas científicas complejas.
- Generación de código en entornos de desarrollo: su capacidad en LiveCodeBench permite utilizarlo para asistir en la escritura de código, revisión de soluciones o generación de pruebas unitarias en pipelines de CI/CD.
- Preparación de exámenes y oposiciones técnicas: puede generar problemas de práctica y soluciones detalladas para estudiantes que se preparan para pruebas de matemáticas o ciencias.
- Análisis de datos y estadística: el modelo puede razonar sobre problemas cuantitativos, interpretar resultados estadísticos y generar explicaciones técnicas para informes de datos.
- Automatización de razonamiento en pipelines de IA: al ser un modelo de razonamiento abierto y con licencia Apache 2.0, puede integrarse en sistemas de agentes que necesitan resolver problemas de forma autónoma, como sistemas de respuesta a preguntas o motores de razonamiento en aplicaciones empresariales.

## Benchmarks y rendimiento

Los siguientes resultados fueron declarados por el autor del modelo y evaluados con la herramienta Evalchemy. No se han publicado benchmarks oficiales adicionales en la información disponible.

| Modelo | Tamaño del dataset | AIME24 I/II | AIME25 I | MATH500 | GPQA Diamond | LCBv2 |
|---|---|---|---|---|---|---|
| LIMO-32B | 0.8k | 56.7 | 49.3 | 86.6 | 58.1 | 60.0 |
| s1-32B | 1k | 36.0 | 25.3 | 84.8 | 50.5 | 40.9 |
| s1.1-32B | 1k | 64.7 | 49.3 | 89.0 | 60.1 | 65.5 |
| DeepSeek-R1-Distill-Qwen-32B | 800k (cerrado) | 76.7 | 55.9 | 89.4 | 57.6 | 71.2 |
| OpenThinker-32B | 114k | 66.0 | 53.3 | 90.6 | 61.6 | 68.9 |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP16 ocupan aproximadamente 65.5 GB, por lo que se recomienda al menos 80 GB de VRAM para inferencia sin cuantización. Con cuantización a 4 bits, la VRAM necesaria se reduce a aproximadamente 18-20 GB.
- GPU recomendadas: A100 80GB o H100 80GB para FP16; RTX 4090 24GB o similares para versiones cuantizadas a 4 bits.
- Compatibilidad con consumer GPU: sí, con cuantización a 4 bits y reducción de contexto.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Transformers.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | AIME24 I/II | MATH500 | GPQA Diamond | LCBv2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| OpenThinker-32B | 32.7B | 32.768 (base) | 66.0 | 90.6 | 61.6 | 68.9 | Apache 2.0 | Pesos, datos y código abiertos |
| LIMO-32B | 32B | no disponible | 56.7 | 86.6 | 58.1 | 60.0 | no disponible | no disponible |
| s1.1-32B | 32B | no disponible | 64.7 | 89.0 | 60.1 | 65.5 | no disponible | no disponible |
| DeepSeek-R1-Distill-Qwen-32B | 32B | no disponible | 76.7 | 89.4 | 57.6 | 71.2 | no disponible | Pesos abiertos, datos cerrados |

OpenThinker-32B destaca por su equilibrio entre rendimiento y transparencia: supera a LIMO-32B y s1-32B en la mayoría de benchmarks, y aunque DeepSeek-R1-Distill-Qwen-32B obtiene mejores resultados en AIME24 y LCBv2, OpenThinker-32B lo supera en MATH500 y GPQA Diamond. Además, es el único de la comparativa que publica datos y código de entrenamiento abiertos.

## Limitaciones y advertencias

- No se han documentado sesgos específicos en la información disponible, pero al estar entrenado sobre un dataset derivado de DeepSeek-R1, puede heredar sesgos de su modelo original.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en dominios donde la información de entrenamiento es limitada.
- El entrenamiento se realizó con una longitud de contexto de 16k tokens, inferior al máximo de 32.768 tokens del modelo base. El rendimiento en contextos largos puede degradarse.
- Los idiomas soportados no están documentados; es probable que el rendimiento sea óptimo en inglés, dado que el dataset OpenThoughts-114k está mayoritariamente en ese idioma.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda revisar las condiciones de los datasets utilizados.
- No se han publicado evaluaciones de seguridad o alineación, por lo que se debe evaluar el comportamiento del modelo en el dominio de uso antes de desplegarlo en producción.

## Enlaces

- HuggingFace: https://huggingface.co/trinityomni/OpenThinker-32B
- HuggingFace (organización OpenThoughts): https://huggingface.co/open-thoughts/OpenThinker-32B
- Paper: https://arxiv.org/abs/2506.04178
- Repositorio GitHub: https://github.com/open-thoughts/open-thoughts
- Dataset OpenThoughts-114k: https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
- Dataset OpenThoughts-Unverified-173k: https://huggingface.co/datasets/open-thoughts/OpenThoughts-Unverified-173k
- Herramienta de evaluación Evalchemy: https://github.com/mlfoundations/Evalchemy
- Código de entrenamiento LlamaFactory: https://github.com/hiyouga/LLaMA-Factory
- Blog de lanzamiento: https://www.open-thoughts.ai/blog/launch
- Blog sobre medición de razonamiento: https://www.open-thoughts.ai/blog/measure
- Blog sobre OpenThinker-32B: https://www.open-thoughts.ai/blog/scale
