# TokenRhythm/NeoHorse-1-9B

## Resumen

NeoHorse-1-9B es un modelo de lenguaje causal de aproximadamente 9B parámetros (8.953.803.264 exactos según los pesos publicados) desarrollado por TokenRhythm como prototipo inicial hacia el auto-mejoramiento recursivo (RSI). Está post-entrenado a partir del modelo Qwen3.5-9B de Alibaba y se publica bajo licencia Apache-2.0. El modelo se centra en tareas agénticas, uso de herramientas, generación de código y seguimiento de instrucciones. Su entrenamiento emplea un framework de post-entrenamiento agéntico que utiliza un "routing harness" para asignar tareas a un pool heterogéneo de modelos, registrar interacciones con herramientas y resultados, y utilizar ese feedback para construir la siguiente mezcla de entrenamiento. A diferencia de la versión multimodal, esta liberación contiene únicamente pesos de lenguaje, sin los pesos de visión. La relevancia del modelo radica en que es un paso práctico hacia el cierre de un bucle de evaluación-selección-actualización en el contexto de auto-mejoramiento recursivo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (arquitectura heredada de Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 (aprox. 9B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

NeoHorse-1-9B es un modelo denso tipo Transformer de causal language model, basado en la arquitectura de Qwen3.5-9B. Su post-entrenamiento combina dos técnicas principales: currículos de SFT guiados por routing y destilación on-policy guiada por routing. El pipeline de datos incluye eliminación de duplicados exactos y casi-duplicados, descontaminación de evaluaciones, validación estructural, evaluación semántica en seis dimensiones y etiquetado a nivel de subescena con campos Scene/Goal/Outcome. No se han publicado detalles sobre el número total de tokens de entrenamiento, la composición exacta del dataset no está disponible, y el modelo no ha pasado por RLHF o DPO según la información proporcionada. Es un modelo solo de texto, sin capacidades visuales.

## Capacidades

- Generación de texto y seguimiento de instrucciones de forma agéntica.
- Uso de herramientas (tool calling) para invocar APIs y funciones externas.
- Razonamiento y ejecución de tareas multi-paso en entornos de agente.
- Generación de código, orientado a tareas de desarrollo y automatización.
- Gestión de trayectorias de ejecución, manteniendo contexto de herramientas y resultados.
- No incluye capacidades de visión ni audio; es exclusivamente de texto.
- No se especifica un modo de "thinking" explícito.

## Casos de uso

- Orquestación de agentes: el modelo puede actuar como cerebro de un agente, planificando pasos, invocando herramientas y procesando respuestas en un bucle cerrado. Es adecuado porque ha sido entrenado con trayectorias de ejecución y contextos de harness.
- Automatización en CI/CD: integración en pipelines para generar código, revisar cambios y corregir errores. El soporte de tool calling permite que el modelo invoque linters, ejecutores de pruebas o editores de código.
- Asistentes de soporte técnico multi-turno: mantiene conversaciones largas con acceso a bases de conocimiento internas o APIs, aprovechando su capacidad de seguir instrucciones y gestionar estado.
- Generación de documentación técnica: puede analizar código o especificaciones y producir documentación estructurada, comentarios y resúmenes de repositorios.
- Prototipado de pipelines de auto-mejoramiento: investigadores pueden usar el modelo como componente dentro de un harness para experimentar con currículos de entrenamiento y evaluación de capacidades.
- Análisis y procesamiento de logs: el modelo puede ejecutar consultas sobre datos estructurados, extraer patrones y producir informes, gracias a su capacidad de tool calling y razonamiento.
- Tareas de back-office: rellenado de formularios, parseo de documentos y extracción de datos en procesos administrativos automatizados.

## Benchmarks y rendimiento

Se ha publicado un resultado agregado: NeoHorse-1-9B alcanza una media macro de 69.04 en diez benchmarks, frente a 65.60 del modelo base Qwen3.5-9B, lo que supone una mejora de +3.44 puntos. No se han publicado resultados desglosados por benchmark (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Modelo | Media macro (10 benchmarks) |
|---|---|
| NeoHorse-1-9B | 69.04 |
| Qwen3.5-9B | 65.60 |

## Requisitos de hardware

Estimaciones basadas en el tamaño de los pesos publicados:

- Inferencia en FP16: requiere aproximadamente 18 GB de VRAM (los pesos ocupan 17.9 GB). GPU recomendada: RTX 4090 (24 GB), A100 40GB o superior.
- Con cuantización a 8 bits: la carga estimada es de ~9 GB, apta para GPUs de 16 GB (RTX 4080, A10G).
- Con cuantización a 4 bits: la carga estimada es de ~5 GB, apta para GPUs de 8-12 GB (RTX 4070, RTX 3060).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI y Transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NeoHorse-1-9B | 8.95B | No disponible | 69.04 macro promedio | Apache-2.0 | HuggingFace |
| Qwen3.5-9B | ~9B | No disponible | 65.60 macro promedio | No disponible | HuggingFace/Alibaba |
| NeoHorse-1-4B | ~4B | No disponible | No disponible | Apache-2.0 | HuggingFace |

La familia NeoHorse incluye también una versión 4B post-entrenada desde Qwen3.5-4B, pero no se han encontrado datos de rendimiento para esa variante en la información disponible.

## Limitaciones y advertencias

- Los sesgos del modelo no han sido evaluados públicamente; al derivar de Qwen3.5-9B, puede heredar sesgos del modelo base.
- No se han publicado tasas de alucinación. El riesgo de generar información falsa o no verificada es inherente y está sin evaluar.
- Los idiomas soportados no están especificados; el rendimiento multilingüe está sin documentar.
- La licencia Apache-2.0 permite uso comercial sin restricciones significativas, pero incluye la renuncia de garantías habitual.
- Esta versión solo incluye pesos de lenguaje; cualquier funcionalidad de visión del modelo base no está disponible.
- Es un prototipo temprano de RSI; la model card no demuestra auto-mejoramiento real en esta iteración, sino que describe el framework como dirección futura.
- El "routing harness" es un componente externo que no está incluido en los pesos. Para aprovechar plenamente las capacidades agénticas, se necesita implementar o integrar un entorno de ejecución de herramientas.

## Enlaces

- HuggingFace: https://huggingface.co/TokenRhythm/NeoHorse-1-9B
- GitHub: https://github.com/TokenRhythm/NeoHorse
- README de GitHub: https://github.com/TokenRhythm/NeoHorse/blob/main/README.md
- Informe técnico (PDF): https://github.com/TokenRhythm/NeoHorse/blob/main/TechnicalReport_NeoHorse_v1.pdf
- Web de TokenRhythm: https://tokenrhythm.ai/
- Noticia de ai-market-watch: https://www.ai-market-watch.com/news/tokenrhythm-releases-neohorse-1-an-agent-native-model-exploring-a-harness-driven-7m3x6f
- X (Twitter): https://x.com/opensquilla
