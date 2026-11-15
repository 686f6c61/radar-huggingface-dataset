# Yo-Purple/Meditor-3-4B-MoE

## Resumen

Meditor-3-4B-MoE es un modelo de generación de texto desarrollado por Yo-Purple, construido sobre el backbone denso Qwen3-4B (4.022.468.096 parámetros reales según safetensors) al que se le acopla una arquitectura de mezcla de expertos basada en deltas de pesos LoRA. En lugar de un MoE clásico con expertos FFN independientes, el modelo mantiene un núcleo denso compartido intacto y añade ocho expertos especialistas de rango 8 (math, logic, code, science, constraints, strategy, creative y crisp) más un enrutador de prompts de 2,90M parámetros.

La innovación principal es el enrutamiento previo a la decodificación: el `PromptRouter` inspecciona los estados ocultos pooled del backbone antes de generar el primer token, selecciona entre uno y tres expertos de dominio y modula dinámicamente las proyecciones lineales compartidas (q/k/v/o/gate/up/down_proj) en las 36 capas del transformer. Esto permite especialización por dominio sin multiplicar el coste de inferencia de forma proporcional al número de expertos.

El modelo es relevante porque propone una vía de especialización modular de bajo coste sobre un backbone ya competente, con licencia Apache 2.0 y un footprint de VRAM declarado de 5,43 GiB en modo `bf16_low_vram`. Su evaluación se realiza sobre suites propias del autor (UniBench-100 y Probe10), no sobre benchmarks estándar de la comunidad, lo que conviene tener en cuenta al interpretar sus cifras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso Qwen3-4B con MoE de deltas LoRA (shared-backbone, prompt-routed) |
| Parametros totales | 4.022.468.096 (4,02B); el autor declara 4,16B incluyendo router y expertos |
| Parametros activos | 4,04B–4,07B (según selección de 1 a 3 expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 nativo; GGUF (Q8_0, Q4_K_M) en la edición Universal separada |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers, custom_code) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B como núcleo denso compartido, que permanece intacto. Sobre él se añaden ocho expertos especialistas implementados como deltas de pesos LoRA de rango 8 (`math`, `logic`, `code`, `science`, `constraints`, `strategy`, `creative`, `crisp`) y un `PromptRouter` de 2,90M parámetros. Para cada prompt, el router examina los estados ocultos pooled del backbone antes de la generación, elige entre uno y tres expertos y modula las proyecciones lineales compartidas (`q/k/v/o/gate/up/down_proj`) en las 36 capas antes de decodificar. El modelo requiere `trust_remote_code` por el uso de código propio (`meditor3`).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. La model card no documenta el proceso de entrenamiento más allá de la descripción arquitectónica. La edición GGUF para llama.cpp y LM Studio se distribuye por separado como `Yo-Purple/Meditor-3-4B-Universal`.

## Capacidades

- Generación de texto conversacional y de síntesis abierta en inglés.
- Razonamiento multi-dominio: el enrutamiento por prompt activa expertos de matemáticas, lógica, código, ciencia, restricciones, estrategia, creatividad y estilo conciso.
- Especialización dinámica por prompt mediante selección de 1 a 3 expertos antes de la decodificación.
- Generación de código y resolución de problemas técnicos (experto `code`).
- Razonamiento matemático y lógico (expertos `math` y `logic`).
- Seguimiento de restricciones explícitas en el prompt (experto `constraints`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking explícito: no documentado.
- Multilingüe: limitado a inglés según la model card.

## Casos de uso

- Síntesis multi-dominio en inglés: el modelo está evaluado específicamente en UniBench-100, una suite de 100 preguntas abiertas de síntesis cruzada entre 10 dominios cognitivos, por lo que encaja en tareas que combinan razonamiento científico, lógico y creativo en una misma respuesta.
- Asistencia en resolución de problemas matemáticos y lógicos: el enrutador activa los expertos `math` y `logic` cuando detecta ese tipo de prompt, lo que permite usar el modelo como tutor o solucionador en entornos educativos en inglés.
- Generación y revisión de código: el experto `code` se activa de forma dinámica, lo que hace al modelo adecuado para tareas de programación puntual, explicación de fragmentos y refactorizaciones dentro de pipelines en inglés.
- Redacción técnica con restricciones estrictas: el experto `constraints` permite generar contenido que respete límites de longitud, formato o terminología, útil para plantillas de documentación o respuestas normalizadas.
- Planificación y razonamiento estratégico: el experto `strategy` se orienta a tareas de descomposición de problemas y planificación, aprovechable en asistentes de análisis en inglés.
- Generación creativa controlada: el experto `creative` permite producir texto narrativo o divulgativo, mientras que `crisp` ofrece respuestas concisas cuando se requiere brevedad.
- Despliegue en hardware de consumo: con un footprint declarado de 5,43 GiB en `bf16_low_vram`, puede ejecutarse en GPUs de consumo con suficiente VRAM para prototipos y demos locales.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados por un tercero):

| Benchmark | Metrica | Valor |
|---|---|---|
| UniBench-100 (10 dominios, 100 preguntas) | Puntuación media (/10) | 7,31 |
| UniBench-100 | Pass rate (>= 6,0) | 69,0% |
| UniBench-100 | Unique solve rate | 7,0% |
| Probe10 (held-out, multi-dominio) | Puntuación media (/10) | 7,02 |
| Probe10 | Pass rate | 70,0% |

Comparativa interna de la serie Meditor declarada por el autor en UniBench-100 (100/100 ejecuciones):

| Modelo | Puntuación media (/10) | Pass rate |
|---|---|---|
| Meditor-3-4B-MoE (este modelo) | 7,31 | 69,0% |
| Meditor 3 prior R&D (BF16) | 4,62 | 30,0% |
| Meditor 2 Universal (BF16) | 4,12 | 22,0% |
| Meditor 2 Universal (Q4_K_M) | 4,00 | 18,0% |
| Meditor 1 Universal (BF16) | 2,42 | 1,0% |

El autor declara una velocidad de evaluación de 35,7 tok/s para este modelo. No se han publicado resultados en benchmarks estándar de la comunidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 5,43 GiB en pico con la configuración `bf16_low_vram` declarada por el autor; el repo pesa 8,3 GB en safetensors.
- GPU recomendadas: no especificadas por el autor; por tamaño, encaja en GPUs con al menos 8 GB de VRAM para BF16 y en GPUs profesionales (A100, H100) para mayor throughput.
- GPU de consumo: sí cabe en tarjetas con 8 GB o más de VRAM (por ejemplo, RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070 en adelante) usando la configuración de bajo consumo declarada.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el código propio `meditor3`). Para llama.cpp, Ollama o LM Studio debe usarse la edición GGUF separada `Yo-Purple/Meditor-3-4B-Universal`.
- Latencia y throughput: 35,7 tok/s declarados en la evaluación del autor; no se dispone de mediciones independientes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Meditor-3-4B-MoE | 4,02B (4,04B–4,07B activos) | no disponible | Apache 2.0 | Hugging Face (transformers, custom_code) | MoE de deltas LoRA sobre Qwen3-4B; evaluación propia UniBench-100 |
| Qwen3-4B (backbone base) | 4B | no disponible en esta ficha | Apache 2.0 | Hugging Face | Modelo denso original; el autor no publica comparación directa contra él en benchmarks estándar |
| Meditor-2-3.4B-HMoE | 3,41B (1,83B activos) | no disponible | Apache 2.0 | Hugging Face | Generación anterior de la misma serie; 4,12 en UniBench-100 |
| Meditor-3-4B-Universal | 4,16B | no disponible | Apache 2.0 | Hugging Face (GGUF) | Edición GGUF del mismo modelo para llama.cpp y LM Studio |

No se dispone de comparaciones con modelos de otros desarrolladores en benchmarks estándar dentro de la información proporcionada.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Benchmarks no verificados: todas las cifras proceden de suites propias del autor (UniBench-100, Probe10) con un juez automático (`gemini-3.8-flash`); no hay resultados en MMLU, HumanEval, GSM8K ni evaluaciones independientes.
- Riesgo de alucinación: no cuantificado; al ser un modelo de 4B con especialización vía LoRA, es esperable un riesgo apreciable en dominios fuera de los ocho expertos entrenados.
- Sesgos: no documentados por el autor.
- Longitud de contexto: no disponible; conviene verificar en el código `meditor3` antes de usarlo en conversaciones largas.
- Dependencia de código propio: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; auditar antes de desplegar en producción.
- Enrutamiento no determinista entre expertos: la selección de 1 a 3 expertos puede producir variabilidad en el estilo y la calidad de las respuestas según el prompt.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3-4B conviene revisar también las condiciones del modelo base.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yo-Purple/Meditor-3-4B-MoE
- Edición GGUF Universal: https://huggingface.co/Yo-Purple/Meditor-3-4B-Universal
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Meditor 1 (Native MoE): https://huggingface.co/Yo-Purple/Meditor-1-2.2B-A500M-MoE
- Meditor 1 (Universal): https://huggingface.co/Yo-Purple/Meditor-1-500M-Universal
- Meditor 2 (Native HMoE): https://huggingface.co/Yo-Purple/Meditor-2-3.4B-A1.8B-HMoE
- Meditor 2 (Universal): https://huggingface.co/Yo-Purple/Meditor-2-3.4B-Universal
