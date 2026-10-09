# zveloxy/Veloxy-Flash-15B

## Resumen

Veloxy-Flash-15B es un modelo de lenguaje de generación de texto publicado por el usuario zveloxy (Veloxy AI) sobre Hugging Face. Se presenta como un derivado afinado del modelo base Qwen/Qwen3.5-9B, orientado a razonamiento profundo con cadena de pensamiento explícita, generación de código y conversación en turco e inglés. La model card lo describe como un motor "polímata" con modo de razonamiento autónomo mediante etiquetas `<think>`, licencia Apache 2.0 y pesos en safetensors y GGUF.

El dato relevante es una discrepancia que conviene señalar de entrada: el nombre comercial y la model card hablan de "15B" y de "14,7B de parámetros activos", pero el recuento real de safetensors en el repositorio es de 8.953.803.264 parámetros (~8,95B), coherente con un modelo denso derivado de un base de 9B y con el tamaño declarado de los pesos en bfloat16 (~17,55 GB). No hay evidencia en la información disponible de que exista una arquitectura de mezcla de expertos que justifique la cifra de "parámetros activos".

Arquitectónicamente se declara un transformer híbrido con bloques de atención lineal combinados con atención completa en un patrón alterno 3:1, 32 capas, dimensión oculta 4096 y ventana de contexto nativa de 32.768 tokens extensible hasta 1M mediante escalado RoPE. El modelo tiene muy poca tracción en el momento de redactar esta ficha (11 descargas, 0 likes) y no publica ningún resultado de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer híbrido: atención lineal + atención completa en patrón 3:1) |
| Parametros totales | 8.953.803.264 (~8,95B) según safetensors; la model card declara ~14,7B (clase 15B) |
| Parametros activos | No disponible. La model card menciona "14,7B de parámetros activos", pero no se documenta ninguna arquitectura MoE que lo respalde |
| Longitud de contexto | 32.768 tokens nativos; extensible a 1M mediante RoPE según la model card |
| Tipos de cuantizacion | bfloat16 nativo, 4-bit NF4 (bitsandbytes), GGUF (el repositorio contiene ficheros GGUF, aunque no se detallan los niveles) |
| Idiomas soportados | Turco (tr) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 shards, ~17,55 GB en bfloat16) y GGUF |

Otros parámetros declarados en la model card: 32 capas (`num_hidden_layers`), `hidden_size` de 4096, `intermediate_size` de 12.288 y dtype nativo `torch.bfloat16`. El tamaño total del repositorio es de 77,8 GB, lo que sugiere que incluye varias precisiones y cuantizaciones además de los shards principales.

## Arquitectura y entrenamiento

La model card describe una arquitectura híbrida construida sobre la clase `Qwen3_5ForConditionalGeneration`, con 32 capas organizadas en un patrón de intervalos de cuatro en el que tres bloques usan atención lineal y uno usa atención completa. Este diseño busca reducir el coste de la atención en contextos largos manteniendo la calidad en la recuperación de información. La dimensión oculta es de 4096 y la dimensión intermedia de 12.288. Los pesos nativos están en bfloat16 y el modelo se distribuye en cuatro shards de safetensors.

No hay información disponible sobre el proceso de entrenamiento: no se especifica el número de tokens, la composición del dataset, si hubo RLHF, DPO u otra fase de alineamiento, ni qué técnica de ajuste se aplicó sobre el modelo base Qwen/Qwen3.5-9B. La única referencia indirecta son otros repositorios del mismo autor (`zveloxy/veloxy-qwen3.5-faz1` y `zveloxy/veloxy-qwen3.5-faz3`), que son adaptadores LoRA de tipo SFT/TRL y que podrían corresponder a fases de un pipeline de afinado, aunque esto no se confirma en la información proporcionada. Tampoco se detalla ninguna innovación técnica adicional más allá del patrón de atención híbrida y el modo de razonamiento con `<think>`.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat que admite rol de sistema (`apply_chat_template`).
- Razonamiento explícito con cadena de pensamiento: el modelo genera su traza de razonamiento dentro de etiquetas `<think>` antes de la respuesta final, según los ejemplos de la model card.
- Razonamiento matemático y lógico elemental, incluyendo problemas de planificación con restricciones (el ejemplo de la model card es el del granjero, el lobo, la cabra y la col).
- Generación de código: la model card menciona soporte para Rust, Go, TypeScript, Python, Next.js 15 y React 19, con afirmación de generación "tipada y sin errores" (afirmación del autor, no verificada).
- Competencia lingüística en turco e inglés, con énfasis declarado en terminología jurídica, histórica, científica y literaria turca, incluyendo modismos y registro coloquial.
- Compatibilidad con endpoints de Hugging Face (etiqueta `endpoints_compatible`) y con el pipeline `text-generation` de transformers.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente y multi-step reasoning: no documentadas explícitamente, más allá del modo `<think>`.
- Visión, audio u otras modalidades: no soportadas según la información disponible (el autor mantiene otros repositorios multimodales separados).

## Casos de uso

- Razonamiento asistido en turco para tareas técnicas: el modelo mantiene conversaciones multi-turno en turco con contexto de hasta 32K tokens, lo que permite adjuntar documentación extensa y formular preguntas de seguimiento sin perder el hilo.
- Generación de código en pipelines de desarrollo: puede integrarse vía `transformers` o vLLM en un servicio interno que genere parches, tests o scaffolding para proyectos Rust, Go, TypeScript o Python, con la advertencia de que la calidad debe validarse con revisión humana y CI.
- Asistencia jurídica o documental en turco: dado el énfasis declarado en terminología jurídica turca, encaja en flujos de resumen y búsqueda semántica sobre expedientes largos, aprovechando la ventana de 32K tokens para procesar contratos o sentencias completas.
- Tutor o asistente educativo con razonamiento paso a paso: el modo `<think>` permite al modelo mostrar el desarrollo de un problema de matemáticas o lógica antes del resultado, útil en entornos de aprendizaje que requieren justificar la respuesta.
- Despliegue local en estaciones de trabajo con GPU de consumo: con cuantización 4-bit NF4 los pesos caben en tarjetas de 12 GB, lo que habilita asistentes de código o chat sin enviar datos a servicios externos, relevante para entornos con requisitos de confidencialidad.
- Prototipado rápido de agentes conversacionales en turco e inglés: al ser Apache 2.0 y compatible con los endpoints de Hugging Face, se puede desplegar como servicio de demostración o como base para prototipos internos que luego migren a un modelo mayor.
- Generación de documentación técnica bilingüe: traducción y adaptación de material técnico entre turco e inglés, con la ventaja de que un único modelo cubre ambos idiomas y mantiene coherencia terminológica en el mismo contexto.
- Análisis de textos largos con memoria extendida: configurando el escalado RoPE hasta 1M de tokens (según la model card), se pueden procesar corpus muy extensos, aunque el rendimiento efectivo a esas longitudes no está verificado y debe medirse en el caso concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El campo `model-index` de la model card contiene una entrada con el nombre del modelo y una lista de resultados vacía, y no se aportan cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación. Las únicas cifras de rendimiento mencionadas son afirmaciones del autor sobre velocidad de generación (30-50+ tokens/s en GPUs de consumo con cuantización de 4 bits), que no vienen acompañadas de una metodología de medición reproducible.

## Requisitos de hardware

- VRAM estimada en bfloat16: unos 17,55 GB solo de pesos, más caché KV y activaciones; en la práctica requiere del orden de 20-22 GB de VRAM para contexto moderado.
- VRAM estimada en 4-bit NF4: aproximadamente 5,5-6 GB de pesos, lo que deja margen para caché KV en tarjetas de 12 GB.
- VRAM estimada en GGUF: variable según el nivel; un Q4_K_M rondaría los 5,5 GB y un Q8 en torno a 9,5 GB (estimación aproximada a partir del recuento real de parámetros, no confirmada por el autor).
- GPU recomendadas para bfloat16: A100 40GB, H100 80GB, L40S 48GB o RTX 4090 24GB (esta última con margen ajustado).
- GPU de consumo compatibles: RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4070 12GB y RTX 5090 en cuantización de 4 bits; en tarjetas de 8 GB el margen es muy estrecho.
- Opciones de despliegue: transformers con bitsandbytes para 4 bits, llama.cpp u Ollama para GGUF, y vLLM o TGI para safetensors (sujeto a que estas herramientas soporten la arquitectura Qwen3.5; dado que la model card recomienda `trust_remote_code=True`, conviene verificar la compatibilidad antes de llevar a producción).
- Latencia y throughput: el autor afirma 30-50+ tokens/s en GPUs de consumo con 4 bits; no se proporcionan medidas de latencia de primer token ni de throughput con batching. No hay datos independientes.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks que permitan una comparación de rendimiento fiable. La comparación se limita, por tanto, a características objetivas:

| Modelo | Parametros | Contexto | Licencia | Idiomas |
|---|---|---|---|---|
| Veloxy-Flash-15B | ~8,95B reales (declara 15B) | 32K nativo, hasta 1M con RoPE | Apache 2.0 | tr, en |
| Qwen/Qwen3.5-9B (modelo base) | no disponible en la información | no disponible en la información | no disponible en la información | no disponible en la información |
| zveloxy/veloxy-qwen3.5-faz1 | adaptador LoRA (no es un modelo completo) | no disponible | no disponible | tr, en |
| zveloxy/veloxy-qwen3.5-faz3 | adaptador LoRA (no es un modelo completo) | no disponible | no disponible | tr, en |

No se han identificado en la información proporcionada modelos de terceros directamente comparables (mismo tamaño y misma especialización en turco) con datos verificables.

## Limitaciones y advertencias

- Discrepancia de parámetros no resuelta: el nombre y la model card declaran 15B y 14,7B de parámetros activos, mientras que el recuento de safetensors da 8,95B. Cualquier cálculo de coste, VRAM o comparación debe partir del dato real, no del nombre.
- Ausencia total de benchmarks: no hay métricas publicadas ni verificación independiente de las capacidades que afirma la model card.
- Madurez muy baja: 11 descargas y 0 likes en el momento de redactar, sin comunidad ni issues que permitan juzgar su fiabilidad en producción.
- Riesgo de alucinación: es un modelo de lenguaje generativo sin evaluación publicada; las afirmaciones de precisión en matemáticas y código provienen del autor y no están contrastadas.
- Cobertura de idiomas limitada a turco e inglés. El rendimiento en castellano no está documentado.
- La model card está redactada íntegramente en turco, lo que puede dificultar el mantenimiento y la resolución de dudas por parte de equipos que no dominen ese idioma.
- Dependencia de `trust_remote_code=True`: cargar el modelo implica ejecutar código remoto del autor, lo que añade un riesgo de seguridad que debe evaluarse antes de usarlo en producción.
- Arquitectura base poco común (Qwen3.5): el soporte en herramientas de inferencia de terceros puede ser incompleto o requerir conversión manual.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero conviene revisar las condiciones del modelo base y de los posibles datasets de afinado, que no se documentan.
- El rendimiento declarado a 1M de tokens de contexto no está verificado y probablemente degrade la calidad; debe medirse en el caso de uso concreto antes de asumirlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zveloxy/Veloxy-Flash-15B
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio del autor con adaptador LoRA (fase 1): https://huggingface.co/zveloxy/veloxy-qwen3.5-faz1
- Repositorio del autor con adaptador LoRA (fase 3): https://huggingface.co/zveloxy/veloxy-qwen3.5-faz3
- Sitio del autor: https://veloxy.io/
- Modelo insignia mencionado en la model card: https://huggingface.co/zveloxy/Veloxy-Titan-32B
- Modelo multimodal mencionado en la model card: https://huggingface.co/zveloxy/Veloxy-Titan-32B-Vision
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
