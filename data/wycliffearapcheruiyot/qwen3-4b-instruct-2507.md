# wycliffearapcheruiyot/Qwen3-4B-Instruct-2507

## Resumen

Qwen3-4B-Instruct-2507 es la versión actualizada del modelo Qwen3-4B en modo "non-thinking" (no genera bloques `<think></think>`), desarrollado por el equipo Qwen de Alibaba. La ficha analizada corresponde a un re-upload de terceros publicado por el usuario `wycliffearapcheruiyot`, que reproduce la model card oficial de Qwen. El modelo está orientado a generación de texto, seguimiento de instrucciones, razonamiento lógico, matemáticas, ciencia, código y uso de herramientas, con mejoras sustanciales frente a la versión Qwen3-4B original en prácticamente todos los ejes evaluados.

Arquitectónicamente es un transformer causal decoder-only de 4.022 millones de parámetros totales (3.6B no de embedding), 36 capas y atención con grouped-query attention (32 cabezas de consulta y 8 de clave/valor). Su rasgo más destacado es una ventana de contexto nativa de 262.144 tokens (256K), muy por encima de lo habitual en modelos de su tamaño.

Es relevante ahora porque combina un tamaño contenido, apto para GPU de consumo y despliegue on-premise, con capacidades de contexto largo y agenticas que hasta hace poco requerían modelos mucho mayores. La licencia Apache 2.0 facilita su adopción comercial. El repositorio concreto analizado no tiene descargas ni interacciones y debe tratarse como una copia no oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only con grouped-query attention (GQA) |
| Parametros totales | 4.022.468.096 (4.0B); 3.6B no de embedding |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens nativo |
| Tipos de cuantizacion | no disponibles en el repositorio (solo pesos safetensors); compatible con GGUF/llama.cpp, Ollama, LM Studio, MLX-LM y KTransformers segun la model card |
| Idiomas soportados | no listados en los tags del repositorio; la model card reporta evaluaciones multilingues (MultiIF, MMLU-ProX, INCLUDE, PolyMATH) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16; tamano del repo 8.1 GB) |

Datos adicionales de configuracion: 36 capas, 32 cabezas de atencion para Q y 8 para KV, y pesos publicados en BF16. El modelo soporta únicamente modo non-thinking y no es necesario pasar `enable_thinking=False`.

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de la familia Qwen3: un transformer decoder-only autorregresivo con normalización RMSNorm, activación SwiGLU en el bloque MLP y atención con GQA (32 cabezas de consulta frente a 8 de clave/valor), lo que reduce de forma notable el coste de la caché KV en contextos largos. El entrenamiento combina una fase de preentrenamiento y otra de post-entrenamiento (según la model card oficial, "Pretraining & Post-training"), con ajuste para alinearse con preferencias del usuario en tareas subjetivas y abiertas.

La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas concretas de RLHF o DPO. El identificador arXiv asociado (2505.09388) corresponde al informe técnico de Qwen3, donde probablemente se documenten esos detalles, pero esa información no está incluida en los datos proporcionados; por tanto, se marca como no disponible. La innovación más reseñable es la ventana de 256K tokens nativa y el modo exclusivamente non-thinking, orientado a respuestas directas sin cadenas de razonamiento explícitas.

## Capacidades

- Generación de texto y seguimiento de instrucciones, con mejoras declaradas en instrucciones, razonamiento lógico y comprensión de texto.
- Razonamiento matemático y científico: la model card reporta mejoras en AIME25, HMMT25, GPQA y SuperGPQA.
- Generación y comprensión de código en múltiples lenguajes (MultiPL-E, LiveCodeBench, Aider-Polyglot).
- Tool calling / function calling: el modelo está optimizado para integración con herramientas y la model card recomienda Qwen-Agent para gestionar plantillas y parsers.
- Uso agéntico y razonamiento multi-paso: evaluado en BFCL-v3 y TAU1/TAU2 (Retail, Airline, Telecom).
- Comprensión de contexto largo de hasta 256K tokens.
- Capacidades multilingües: la model card reporta evaluaciones en varias lenguas (MultiIF, MMLU-ProX, INCLUDE), aunque el listado exacto de idiomas no se especifica.
- Generación de contenido creativo y abierto (Creative Writing v3, WritingBench).
- No dispone de modo thinking: no genera bloques `<think></think>` ni capacidades de visión o audio.

## Casos de uso

- Atención al cliente automatizada: puede gestionar conversaciones multi-turno con historial muy extenso gracias a sus 262.144 tokens de ventana, manteniendo el contexto de incidencias previas sin reintroducir manualmente el historial.
- Agentes con tool calling: al estar optimizado para function calling y ser compatible con Qwen-Agent, puede orquestar APIs, bases de datos y servicios externos para tareas multi-paso (por ejemplo, reservas en TAU1-Retail o gestión aeroportuaria en TAU1-Airline).
- Generación y revisión de código en producción: con soporte de tool calling puede integrarse en pipelines de CI/CD para autogenerar tests, revisar diffs o sugerir parches en varios lenguajes (MultiPL-E ~76.8).
- Análisis de documentos largos: resumen y extracción de información sobre contratos, informes o expedientes que superan los 100K tokens, apoyándose en la ventana larga nativa.
- Tutoría educativa en matemáticas y ciencias: resolución guiada de problemas con altos resultados en AIME25 (47.4), HMMT25 (31.0) y ZebraLogic (80.2), apto para asistentes de estudio.
- Generación de contenido y copywriting: redacción de textos abiertos y creativos con buena alineación subjetiva (Arena-Hard v2 43.4, Creative Writing v3 83.5).
- Extracción y clasificación de información estructurada: conversión de texto libre en JSON u otros formatos para pipelines de datos, con buen seguimiento de instrucciones (IFEval 83.4).
- Despliegue on-premise o en el borde: por su tamaño de 4B puede ejecutarse en una única GPU de gama media o incluso en estaciones de trabajo sin aceleradores de gran formato, lo que lo hace apto para entornos con requisitos de privacidad.

## Benchmarks y rendimiento

Resultados reportados en la model card oficial (comparación de la propia model card). El guion "-" indica que no se reportó el dato.

| Benchmark | GPT-4.1-nano-2025-04-14 | Qwen3-30B-A3B Non-Thinking | Qwen3-4B Non-Thinking | Qwen3-4B-Instruct-2507 |
|---|---|---|---|---|
| MMLU-Pro | 62.8 | 69.1 | 58.0 | 69.6 |
| MMLU-Redux | 80.2 | 84.1 | 77.3 | 84.2 |
| GPQA | 50.3 | 54.8 | 41.7 | 62.0 |
| SuperGPQA | 32.2 | 42.2 | 32.0 | 42.8 |
| AIME25 | 22.7 | 21.6 | 19.1 | 47.4 |
| HMMT25 | 9.7 | 12.0 | 12.1 | 31.0 |
| ZebraLogic | 14.8 | 33.2 | 35.2 | 80.2 |
| LiveBench 20241125 | 41.5 | 59.4 | 48.4 | 63.0 |
| LiveCodeBench v6 (25.02-25.05) | 31.5 | 29.0 | 26.4 | 35.1 |
| MultiPL-E | 76.3 | 74.6 | 66.6 | 76.8 |
| Aider-Polyglot | 9.8 | 24.4 | 13.8 | 12.9 |
| IFEval | 74.5 | 83.7 | 81.2 | 83.4 |
| Arena-Hard v2 | 15.9 | 24.8 | 9.5 | 43.4 |
| Creative Writing v3 | 72.7 | 68.1 | 53.6 | 83.5 |
| WritingBench | 66.9 | 72.2 | 68.5 | 83.4 |
| BFCL-v3 | 53.0 | 58.6 | 57.6 | 61.9 |
| TAU1-Retail | 23.5 | 38.3 | 24.3 | 48.7 |
| TAU1-Airline | 14.0 | 18.0 | 16.0 | 32.0 |
| TAU2-Retail | - | 31.6 | 28.1 | 40.4 |
| TAU2-Airline | - | 18.0 | 12.0 | 24.0 |
| TAU2-Telecom | - | 18.4 | 17.5 | 13.2 |
| MultiIF | 60.7 | 70.8 | 61.3 | 69.0 |
| MMLU-ProX | 56.2 | 65.1 | 49.6 | 61.6 |
| INCLUDE | 58.6 | 67.8 | 53.8 | 60.1 |
| PolyMATH | 15.6 | 23.3 | 16.6 | 31.1 |

Para Arena-Hard v2 la model card indica que se reportan las tasas de victoria evaluadas con GPT-4.1. No se han publicado métricas de latencia o throughput en la información disponible.

## Requisitos de hardware

Estimaciones derivadas del tamaño del modelo y de su configuración (36 capas, 8 cabezas KV, head dim 128). Deben tomarse como orientativas, ya que no se han publicado requisitos oficiales en la información disponible.

- VRAM para pesos: aproximadamente 8 GB en BF16/FP16, ~4 GB en INT8 y ~2,5 GB en cuantización de 4 bits.
- Caché KV: crece de forma lineal con la longitud de contexto. Con la configuración del modelo se estiman unos 144 KB por token en BF16, lo que supone aproximadamente 4,7 GB a 32K tokens, 19 GB a 128K y cerca de 38 GB a 262.144 tokens. El uso de cuantización de la caché (FP8) o la reducción de la ventana mitiga este coste.
- Cabe en GPU de consumo: sí. Con cuantización de 4 bits funciona en GPU de 8-12 GB (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB). En BF16 cabe en una RTX 4090 (24 GB) o RTX 3090 con contexto moderado.
- GPU recomendadas: RTX 4090/L40S para inferencia en BF16 con ventanas medias; A100 40/80 GB o H100 para contexto completo de 256K; configuraciones multi-GPU si se requiere BF16 y ventana máxima.
- Opciones de despliegue: vLLM (`>=0.8.5`), SGLang (`>=0.4.6.post1`), Hugging Face Transformers, además de Ollama, LM Studio, MLX-LM, llama.cpp y KTransformers para uso local. Requiere `transformers>=4.51.0`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro | AIME25 | IFEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507 | 4.0B | 262.144 | 69.6 | 47.4 | 83.4 | Apache 2.0 | Repo no oficial (re-upload); original en Qwen |
| Qwen3-4B Non-Thinking | 4.0B | no disponible en la informacion | 58.0 | 19.1 | 81.2 | Apache 2.0 | Oficial |
| Qwen3-30B-A3B Non-Thinking | 30B (MoE, ~3B activos) | no disponible en la informacion | 69.1 | 21.6 | 83.7 | Apache 2.0 | Oficial |
| GPT-4.1-nano-2025-04-14 | no disponible | no disponible | 62.8 | 22.7 | 74.5 | Propietaria | API de OpenAI |

Frente a Qwen3-4B Non-Thinking, la version 2507 mejora de forma muy marcada en razonamiento (AIME25 pasa de 19.1 a 47.4; ZebraLogic de 35.2 a 80.2) y en alineacion subjetiva (Arena-Hard v2 de 9.5 a 43.4). Frente al MoE Qwen3-30B-A3B, el 4B-Instruct-2507 iguala o supera en varios benchmarks de conocimiento y razonamiento pese a tener menos parametros totales, aunque queda por debajo en IFEval (83.4 frente a 83.7) y en TAU2-Telecom (13.2 frente a 18.4).

## Limitaciones y advertencias

- El repositorio analizado es un re-upload de terceros (`wycliffearapcheruiyot`), sin descargas ni interacciones, y no una publicación oficial de Qwen. Conviene verificar que los pesos coinciden con el modelo original antes de usarlo en producción.
- Las fechas de creación y actualización del repositorio que figuran en HuggingFace (2026) resultan anómalas y no se corresponden con el ciclo de publicación esperado, lo que refuerza la cautela sobre la procedencia de la copia.
- No dispone de modo thinking, por lo que no generará cadenas de razonamiento explícitas; en tareas que se beneficien de ese formato habrá que usar la variante estándar de Qwen3.
- Riesgo de alucinación inherente a los modelos de lenguaje; la model card no documenta tasas de error ni estrategias de mitigación específicas.
- El rendimiento en contextos muy largos puede degradarse; la model card recomienda reducir la ventana (por ejemplo a 32.768 tokens) si aparecen problemas de memoria, y no se han publicado evaluaciones específicas de "needle in a haystack" en la información disponible.
- El listado de idiomas soportados no está especificado en los tags; aunque hay evaluaciones multilingües, el grado de cobertura real por idioma no se detalla.
- Sesgos conocidos: no documentados en la información proporcionada; cabe esperar los sesgos habituales derivados de datos web a gran escala.
- Licencia Apache 2.0, permisiva para uso comercial, siempre que se respeten las condiciones de atribución de la licencia.
- Para despliegues con la ventana completa de 256K hay que dimensionar la memoria con cuidado: la caché KV puede superar los 30 GB en BF16 y provocar OOM.

## Enlaces

- Repositorio analizado (re-upload de terceros): https://huggingface.co/wycliffearapcheruiyot/Qwen3-4B-Instruct-2507
- Repositorio oficial de Qwen: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Licencia oficial: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/main/LICENSE
- Informe tecnico de Qwen3 (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Qwen Chat: https://chat.qwen.ai
- Qwen-Agent (soporte agéntico): https://github.com/QwenLM/Qwen-Agent

Nota: la busqueda web realizada no devolvio resultados relacionados con el modelo; los unicos enlaces relevantes son los procedentes de la model card y de los metadatos del repositorio.
