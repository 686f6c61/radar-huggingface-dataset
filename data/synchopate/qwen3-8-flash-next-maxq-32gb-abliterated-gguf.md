# Synchopate/Qwen3.8-Flash-Next-MaxQ-32GB-Abliterated-GGUF

## Resumen

Qwen3.8-Flash-Next-MaxQ-32GB-Abliterated-GGUF es una cuantización GGUF de la arquitectura Qwen3.8-Flash-Next, publicada por el usuario Synchopate. Se trata de una variante "abliterated" (también etiquetada como "heretic" y "uncensored") en la que se han eliminado los filtros de rechazo del modelo base mediante una técnica de sobre-proyección firmada multicapa sobre determinados tensores de las capas 31 a 48. El objetivo declarado es ofrecer una versión sin moderación integrada para investigación en seguridad, auditoría de código, análisis de binarios y ejercicios de red team.

El modelo conserva la arquitectura MoE completa del original: 48 capas de tronco (36 Gated DeltaNet y 12 de atención completa GQA, con compress_ratio = 4), 512 expertos enrutados más uno compartido, y una capa NextN de predicción multi-token. El número nominal de parámetros ronda los 176.500 millones, aunque tras el colapso de conos y la tabla PLE quedan unos 152.300 millones efectivos, con entre 4.600 y 5.000 millones activos por token. La cuantización está pensada para ejecutarse en equipos con 32 GB de RAM, manteniendo el tronco residente en DDR5 y paginando bajo demanda una tabla PLE de 10,73 GiB desde NVMe.

La relevancia de esta ficha radica en que documenta un caso extremo de cuantización agresiva (1,63 bits por peso en el tronco) combinada con modificación de comportamiento, algo poco habitual y con implicaciones importantes tanto técnicas como de seguridad. El checkpoint está pensado para inferencia en CPU mediante llama.cpp y su ecosistema, no para despliegues estándar en GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con capas Gated DeltaNet y GQA, más capa NextN MTP |
| Parametros totales | ~176,5 mil millones nominales (~152,3 mil millones tras colapso de conos y PLE) |
| Parametros activos | ~4,6 a 5,0 mil millones por token (10 de 512 expertos enrutados + 1 compartido + tronco denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla de F32, Q8_0, Q4_K, Q5_K, IQ1_S, IQ1_M, BF16, MXFP4, IQ2_XXS, IQ2_XS, Q2_0, Q6_K y Q1_0 (1,63 bpw en el tronco) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en el hub) |
| Formato de pesos | GGUF (dos shards, ~66,1 GB de repositorio) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una topología denominada "qwen4exp" en la documentación del cuantizador: 48 capas de tronco divididas en 36 capas Gated DeltaNet y 12 capas de atención completa GQA con compress_ratio = 4, más una capa NextN de predicción multi-token (blk.48). El componente MoE consta de 512 expertos enrutados por capa, con 42 capas de ancho K = 512 y 7 capas de frontera con K = 640. La tabla PLE (probablemente "positional learned embeddings" o similar según la nomenclatura del autor) tiene 320 millones de filas y se almacena en un segundo shard que se pagina desde disco.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La modificación "abliterated" consiste en una sobre-proyección firmada multicapa con valores beta entre 1,83 y 2,39 aplicada sobre tensores de las capas 31 a 48, tomada del checkpoint trohrbaugh/Qwen3.8-Flash-Next-heretic-2, más una alineación ConeCollapse en los sesgos ffn_down_exps de las capas 31 a 35 y una sincronización del escritor MTP de la capa 48. Según el autor, esto produce 0 rechazos sobre 100 con una divergencia KL de 0,0818. Las capas 0 a 30 y los embeddings de tokens quedan intactos.

La cuantización utiliza una mezcla heterogénea de tipos GGUF (hasta 13 tipos distintos, con max_type = 42 y sin tipos personalizados), lo que permite comprimir el tronco a 1,63 bits por peso manteniendo componentes críticos en F32, Q8_0 o BF16. El tronco residente ocupa 24,98 GiB en DDR5 y la tabla PLE de 10,73 GiB se pagina bajo demanda vía mmap sobre NVMe.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline image-text-to-text según el hub (aunque no se detallan las capacidades de visión en la información disponible).
- Razonamiento con modo "thinking" explícito (enable_thinking), con requisito de max_tokens >= 16384 cuando está activo.
- Generación de código y análisis de código, incluyendo auditoría y revisión.
- Análisis de seguridad, ingeniería inversa, análisis de binarios y explotación en contextos de CTF.
- Análisis legal y de políticas sin las restricciones de rechazo del modelo original.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmado explícitamente.
- Capacidades multilingües: no disponibles.
- Modo sin censura (abliterated): elimina los filtros de rechazo del modelo base.

## Casos de uso

- Auditoría de seguridad y red team: el checkpoint permite analizar vulnerabilidades, redactar exploits de prueba y evaluar defensas sin los rechazos del modelo alineado, lo que lo hace adecuado para ejercicios autorizados de pentesting y CTF.
- Análisis de binarios e ingeniería inversa: puede describir estructuras de ejecutables, identificar patrones de ofuscación y explicar rutinas de desensamblado en flujos de trabajo de reversing.
- Revisión de código en producción: con 4,6 a 5,0 mil millones de parámetros activos por token, ofrece un equilibrio razonable entre calidad y coste computacional para integrarse en pipelines de CI/CD que analicen cambios de código.
- Análisis legal y de políticas sin restricciones: útil para equipos que necesitan discutir marcos regulatorios, cláusulas contractuales o escenarios de cumplimiento sin que el modelo rechace temas sensibles.
- Inferencia en CPU con 32 GB de RAM: al mantener el tronco residente en DDR5 y paginar la tabla PLE desde NVMe, permite desplegar un modelo de gran tamaño en estaciones de trabajo sin GPU dedicada.
- Investigación sobre alineación y seguridad: sirve como caso de estudio de cómo la modificación de tensores específicos altera el comportamiento de rechazo, con métricas concretas (0/100 rechazos, KLD 0,0818) para comparar con el modelo base.
- Generación de texto creativo sin filtros: para proyectos que requieran narrativa o diálogo sin moderación integrada, siempre con control de acceso externo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor únicamente reporta métricas internas de la modificación: 0 rechazos sobre 100 con una divergencia KL de 0,0818 respecto al modelo base, y una tasa de 4/4 completaciones sin bucles en la prueba "Blind-4" con los parámetros de muestreo recomendados (frente a 2/4 con decodificación greedy pura).

## Requisitos de hardware

- RAM: 32 GB mínimos para el tier documentado. El tronco residente ocupa 24,98 GiB y la tabla PLE se pagina desde NVMe (10,73 GiB), con un VmHWM medido de 28,40 GiB y RssAnon de 2,43 GiB.
- Almacenamiento: se recomienda NVMe para la paginación de la tabla PLE; el repositorio completo ocupa 66,1 GB.
- GPU: no se especifican requisitos de GPU; el modelo está diseñado para inferencia en CPU.
- GPU de consumo: no aplica como requisito principal; el diseño es explícitamente para CPU con llama.cpp.
- Opciones de despliegue: llama.cpp y el ecosistema asociado (el autor menciona "./modchip" y "install.sh --preset qwen38-32gb-ablit" como scripts de conveniencia). No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-MaxQ-32GB-Abliterated | ~176,5B nominales / ~4,6-5,0B activos | no disponible | qwen-community-1.0 | GGUF en HF | Variante sin censura, 32 GB RAM |
| Synchopate/Qwen3.8-Flash-Next-MaxQ-32GB-GGUF | mismos | no disponible | qwen-community-1.0 | GGUF en HF | Variante alineada por defecto, 32 GB RAM |
| Synchopate/Qwen3.8-Flash-Next-MaxQ-64GB-GGUF | mismos | no disponible | qwen-community-1.0 | GGUF en HF | Variante alineada para 64 GB+ RAM, recomendada para código |
| trohrbaugh/Qwen3.8-Flash-Next-heretic-2 | mismos | no disponible | no disponible | HF | Checkpoint fuente de la modificación heretic |

## Limitaciones y advertencias

- Eliminación de filtros de seguridad: los filtros de rechazo del modelo base han sido removidos y no pueden utilizarse para moderación de contenido. No debe exponerse sin control de acceso y filtrado externo.
- Riesgo de alucinación: la cuantización agresiva a 1,63 bpw en el tronco puede degradar la fidelidad factual; no se han publicado evaluaciones de calidad respecto al modelo original.
- Repetición en decodificación greedy: con temperature = 0 se observan bucles en completaciones abiertas (2/4 sin bucles en Blind-4). Es obligatorio usar temperature = 0,6, top_p = 0,95, top_k = 20, presence_penalty entre 0,2 y 1,0 y repeat_penalty = 1,05 para código, análisis de seguridad y chain-of-thought.
- Presupuesto de tokens en modo thinking: con enable_thinking activo se requiere max_tokens >= 16384; con límites de salida <= 4096 debe desactivarse el modo thinking.
- Licencia: qwen-community-1.0 con posibles restricciones para uso comercial; debe revisarse el enlace de licencia del modelo base antes de cualquier despliegue productivo.
- Idiomas: no se dispone de información sobre cobertura lingüística.
- Contexto: no se ha publicado la longitud de contexto soportada.
- Etiqueta de tamaño engañosa: el hub muestra "5.0B" por herencia del header de conversión, pero el modelo contiene la arquitectura completa de 512 expertos.
- Sesgos: no se han documentado sesgos específicos, pero la eliminación de alineación puede amplificar respuestas sesgadas o inapropiadas.
- Uso previsto restringido: el autor limita el alcance a investigación en seguridad autorizada, auditoría, CTF y análisis legal sin censura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synchopate/Qwen3.8-Flash-Next-MaxQ-32GB-Abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Checkpoint heretic fuente: https://huggingface.co/trohrbaugh/Qwen3.8-Flash-Next-heretic-2
- Variante alineada 32 GB: https://huggingface.co/Synchopate/Qwen3.8-Flash-Next-MaxQ-32GB-GGUF
- Variante alineada 64 GB: https://huggingface.co/Synchopate/Qwen3.8-Flash-Next-MaxQ-64GB-GGUF
