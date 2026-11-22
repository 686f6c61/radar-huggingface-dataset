# tinyopsec/Orbit-3-Nano-GGUF

## Resumen

Orbit-3-Nano es un ajuste fino (fine-tune) del modelo LFM2.5-2.6B de LiquidAI, desarrollado por OpenPathAI y orientado a instrucciones en indonesio. Esta ficha concreta corresponde a la versión cuantizada en formato GGUF publicada por el usuario tinyopsec, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y otros runtimes compatibles. El modelo cuenta con 2.697.198.592 parámetros totales, lo que lo sitúa en la categoría de modelos pequeños (aproximadamente 2,7 mil millones de parámetros).

La relevancia de esta publicación radica en que ofrece un abanico amplio de cuantizaciones (desde F16 hasta Q2_K) de un modelo instructivo especializado en indonesio, un idioma con menos cobertura en el ecosistema de modelos abiertos. Al estar en formato GGUF, el modelo puede desplegarse en CPU, GPU de consumo y dispositivos con recursos limitados sin necesidad de infraestructura de servidor.

La información disponible sobre el modelo base (contexto, datos de entrenamiento, benchmarks) es escasa en la documentación proporcionada; esta ficha indica explícitamente los datos no disponibles en lugar de inferirlos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 (familia LFM2 de LiquidAI); detalles especificos no disponibles |
| Parametros totales | 2.697.198.592 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M (recomendada), Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Indonesio (instruct); otros idiomas no disponibles |
| Licencia | other (LFM Open License v1.0) |
| Formato de pesos | GGUF |
| Modelo base | OpenPathAI/Orbit-3-Nano (a su vez fine-tune de LiquidAI/LFM2.5-2.6B) |
| Tamano del repositorio | 26,3 GB (todas las cuantizaciones) |
| Tamano de F16 | 5,2 GB |

## Arquitectura y entrenamiento

El modelo deriva de la familia LFM2.5 de LiquidAI, según indica la model card. No se especifican en la información disponible detalles sobre el número de capas, tipo de atención, mecanismos de normalización ni si emplea arquitecturas híbridas (por ejemplo, combinación de atención y capas SSM), aunque la nomenclatura LFM2 sugiere la línea de modelos liquid de LiquidAI. Tampoco se detallan los datos de entrenamiento del fine-tune: número de tokens, composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o SFT.

La innovación destacable de esta publicación es la propia cuantización: se ofrecen trece variantes GGUF generadas con llama.cpp, desde F16 hasta Q2_K, lo que permite ajustar el equilibrio entre calidad y requisitos de memoria. La cuantización Q4_K_M se marca como recomendada por el autor. No se documentan técnicas adicionales como decodificación especulativa o atención lineal en la información proporcionada.

## Capacidades

- Generación de texto e instrucciones en indonesio (modelo etiquetado como `instruct`).
- Conversación multi-turno (etiqueta `conversational`).
- Ejecución en llama.cpp y runtimes compatibles con GGUF (Ollama, LM Studio, koboldcpp).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Capacidades de razonamiento, código, matemáticas, tool calling, agentes o multimodalidad: no disponibles en la información proporcionada.
- Capacidades multilingües más allá del indonesio: no disponibles.

## Casos de uso

- Asistencia conversacional en indonesio: el modelo puede gestionar diálogos multi-turno en dicho idioma, adecuado para chatbots de atención al cliente dirigidos a mercados indonesios, siempre que se valide la calidad con pruebas propias.
- Despliegue en hardware de consumo: gracias a las cuantizaciones Q4_K_M y Q3_K, puede ejecutarse en equipos con GPU modestas o incluso en CPU, lo que facilita prototipado local sin infraestructura cloud.
- Procesamiento de texto en local y con privacidad: al ejecutarse con llama.cpp, permite tratar datos sensibles sin enviarlos a servicios externos, útil en entornos con requisitos de confidencialidad.
- Generación de contenido en indonesio: redacción de borradores, resúmenes o respuestas en dicho idioma para aplicaciones editoriales o de soporte.
- Integración en pipelines de desarrollo: al ser GGUF y compatible con endpoints, puede incorporarse en aplicaciones que usen APIs compatibles con OpenAI mediante servidores locales.
- Experimentación e investigación: las múltiples cuantizaciones permiten estudiar el impacto de la precisión en la calidad de salida para un modelo de 2,7B parámetros especializado en un idioma de recursos medios.
- Educación y prototipado: su reducido tamaño y licencia abierta (LFM Open License v1.0) facilitan su uso en entornos académicos y pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,2 GB en F16; en torno a 2,5-3 GB en Q4_K_M (estimación basada en el tamaño de los pesos, no confirmada por el autor); menos de 2 GB en Q2_K.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabría en GPUs de consumo como RTX 3060 (12 GB), RTX 4060, RTX 4090, así como en Apple Silicon con memoria unificada.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de GPUs con 4 GB o más de VRAM para cuantizaciones Q4 y superiores.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Orbit-3-Nano (GGUF) | 2,7B | no disponible | LFM Open License v1.0 | GGUF | Fine-tune en indonesio de LFM2.5-2.6B |
| LFM2.5-2.6B (LiquidAI) | ~2,6B | no disponible | LFM Open License v1.0 | safetensors (original) | Modelo base; multilingüe general |
| OpenPathAI/Orbit-3-Nano | 2,7B | no disponible | no disponible | no disponible | Modelo base del fine-tune, en formato original |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en indonesio: su rendimiento en castellano u otros idiomas no está documentado y probablemente sea limitado.
- Riesgo de alucinación: inherente a modelos de este tamaño; se recomienda validación humana en producción.
- Sesgos: no documentados por el autor; los sesgos del corpus de entrenamiento del modelo base pueden persistir.
- Licencia: LFM Open License v1.0 (etiquetada como "other"); es imprescindible revisar los términos exactos antes de un uso comercial, ya que pueden existir restricciones.
- Contexto: la longitud de contexto no está documentada en la información disponible; conviene verificarla antes de diseñar aplicaciones con ventanas largas.
- El autor recomienda explícitamente evaluar el modelo antes de usarlo ("Evaluate before use").
- La cuantización puede degradar la calidad respecto al modelo original, especialmente en Q2_K y Q3_K.
- Información de entrenamiento y benchmarks ausente: no hay garantías documentadas sobre capacidades específicas (código, matemáticas, tool calling).

## Enlaces

- Repositorio GGUF: https://huggingface.co/tinyopsec/Orbit-3-Nano-GGUF
- Modelo base del fine-tune: https://huggingface.co/OpenPathAI/Orbit-3-Nano
- Modelo original de LiquidAI: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- llama.cpp (runtime): https://github.com/ggml-org/llama.cpp
