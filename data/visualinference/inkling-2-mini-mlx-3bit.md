# VisualInference/Inkling-2-Mini-MLX-3bit

## Resumen

Inkling-2-Mini-MLX-3bit es una compilacion cuantizada del modelo base thinkingmachines/Inkling-2-Mini, desarrollada por VisualInference para su ejecucion en Apple Silicon mediante la libreria mlx-vlm. El modelo original es un mixture-of-experts (MoE) con bucles de 26.388.641.280 parametros (26,4 mil millones) creado por Thinking Machines Lab, capaz de procesar texto e imagen como entrada y generar texto como salida, publicado bajo licencia Apache 2.0.

Esta version concreta aplica una requantizacion agresiva: las capas de expertos se comprimen a 3 bits con compensacion de error, mientras que el resto de la red permanece en 8 bits. El resultado son 11,9 GiB de pesos que caben en Macs con 24 GB de memoria unificada, frente a los 18,2 GiB del checkpoint original. El precio de esta compresion es un incremento de aproximadamente el 1,4 % en la perplejidad respecto al modelo de referencia, junto con una velocidad de decodificacion de 33,8 tokens por segundo (frente a 25,9 del original).

La relevancia de esta ficha radica en que permite ejecutar un modelo MoE de 26,4 mil millones de parametros con capacidades de vision, tool calling y razonamiento multi-paso en hardware de consumo de Apple, algo que el checkpoint de referencia solo permite en equipos con 32 GB o mas. El modelo esta orientado a ingles, soporta agentes y llamadas a funciones, y se distribuye con el drafter DSpark incluido para decodificacion especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) con bucles (inkling2_loop), transformer con capas de expertos |
| Parametros totales | 26.388.641.280 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se han medido prompts de hasta 16k tokens en pruebas de memoria) |
| Tipos de cuantizacion | 3 bits en capas de expertos (3,5 bits por peso), 8 bits en el resto; GPTQ con compensacion de error |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), mas mtp.safetensors (drafter DSpark) |

## Arquitectura y entrenamiento

El modelo base es un mixture-of-experts con bucles (denominado inkling2_loop en los tags), lo que implica que ciertas capas se reutilizan en pasadas iterativas, una tecnica que aumenta la profundidad efectiva sin incrementar proporcionalmente el numero de parametros. El checkpoint original ya emplea cuantizacion mixta en sus capas de expertos (NVFP4 y MXFP8, aproximadamente 5,1 bits por peso). VisualInference requantiza esas capas de expertos a 3 bits con compensacion de error mediante GPTQ, manteniendo el resto de la red en 8 bits, lo que da lugar a una media de 3,5 bits por peso en las capas de expertos y un total de 11,9 GiB.

El repositorio conserva el drafter DSpark original (mtp.safetensors) sin modificar, lo que permite probar decodificacion especulativa, aunque el autor advierte que en un M4 Pro no supone una ganancia fiable. El chat template, el tokenizer y los tokens especiales son los archivos originales, byte a byte, lo que garantiza compatibilidad con el formato de tool calling del modelo base. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento con modos de esfuerzo configurables (`reasoning_effort`: none, minimal, low, medium, high, xhigh).
- Entrada multimodal imagen-texto: acepta imagenes junto con el prompt y genera texto (pipeline image-text-to-text).
- Tool calling / function calling: el modelo emite llamadas en el formato `<|content_invoke_tool_json|>` y el servidor OpenAI-compatible devuelve `tool_calls` con los argumentos como cadena JSON y `finish_reason: "tool_calls"`.
- Soporte de agentes y razonamiento multi-paso: disenado explicitamente para bucles de agente, con recomendacion de usar `reasoning_effort` bajo o medio para acelerar cada paso.
- Salida estructurada JSON: 9/10 en las pruebas del autor.
- Capacidades de codigo y matematicas: evaluado con HumanEval (35/40) y GSM8K (49/50) en esta compilacion.
- Multilingue: limitado a ingles segun la model card.
- Decodificacion especulativa opcional mediante el drafter DSpark incluido.

## Casos de uso

- Asistentes de codigo en local para desarrolladores con Mac: el modelo resuelve tareas de generacion de funciones y merging de intervalos (ejemplo de la model card) con 35/40 en HumanEval, ejecutandose en un Mac de 24 GB sin necesidad de GPU dedicada.
- Agentes autonomos con tool calling: gracias a su soporte de llamadas a funciones y a las 4/4 tareas del Hermes Agent resueltas, puede integrarse en bucles de agente que invocan APIs externas, con `reasoning_effort` en low o medium para reducir la latencia por paso.
- Automatizacion de atencion al cliente en ingles: el modelo gestiona conversaciones multi-turno y puede emitir respuestas estructuradas en JSON (9/10) para integraciones con sistemas de ticketing.
- Procesamiento de documentos con imagenes: al aceptar entrada image-text-to-text, sirve para extraer informacion de capturas, formularios o diagramas y devolver texto estructurado.
- Servidor OpenAI-compatible en local: mediante `mlx_vlm.server` se expone un endpoint `/v1/chat/completions` que permite sustituir APIs en la nube por inferencia local en Apple Silicon, con separacion de `reasoning_content` y `content`.
- Razonamiento matematico asistido: con 49/50 en GSM8K, es adecuado para tutoria o resolucion de problemas aritmeticos paso a paso en entornos educativos o de prototipado.
- Prototipado de pipelines de agentes con JSON: la combinacion de salida JSON fiable y tool calling lo hace util para orquestar flujos de trabajo donde el modelo decide que herramienta invocar y con que argumentos.

## Benchmarks y rendimiento

Datos medidos por el autor en un Mac mini (M4 Pro, 48 GB) con decodificacion greedy. Los conjuntos de tareas son pequenos y diferencias de pocos problemas entre filas son ruido; la comparacion precisa es la perdida en held-out.

| Build | Pesos (GiB) | Capas de expertos | Perdida held-out vs original | GSM8K | HumanEval | Tool calls | JSON output | Hermes Agent | Decode speed | Memoria pico (short / 4k / 16k) |
|---|---|---|---|---|---|---|---|---|---|---|
| original | 18,2 | NVFP4 y MXFP8, 5,1 bits/peso | referencia (1,448 nats/token) | 48/50 | 35/40 | 18/19 | 9/10 | 4/4 | 25,9 tok/s | 20,3 / 21,4 / 22,1 GiB |
| 4bit | 14,8 | 4,5 bits/peso | +0,002 ± 0,001 nats (+0,2 %) | 45/50 | 36/40 | 18/19 | 9/10 | 4/4 | 31,1 tok/s | 15,5 / 16,2 / 16,9 GiB |
| 3bit (este repo) | 11,9 | 3,5 bits/peso | +0,014 ± 0,004 nats (+1,4 %) | 49/50 | 35/40 | 19/19 | 9/10 | 4/4 | 33,8 tok/s | 12,7 / 13,5 / 14,1 GiB |
| 2bit | 9,1 | 2,5 bits/peso | +0,095 ± 0,013 nats (+10,0 %) | 47/50 | 32/40 | 19/19 | 9/10 | 4/4 | 33,4 tok/s | 9,8 / 10,6 / 11,2 GiB |

## Requisitos de hardware

- VRAM (memoria unificada) estimada: 12,7 GiB para prompts cortos, 13,5 GiB con prompt de 4k y 14,1 GiB con prompt de 16k. El autor indica que esta pensado para Macs con 24 GB de memoria.
- GPU recomendadas: Apple Silicon; las mediciones se hicieron en un Mac mini con M4 Pro y 48 GB de memoria unificada. No hay datos para GPU NVIDIA (A100, H100, RTX 4090) en la informacion proporcionada.
- Cabe en GPU de consumo Apple: si, en Macs con 24 GB o mas de memoria unificada; el original requiere 32 GB o mas.
- Opciones de despliegue: mlx-vlm (libreria MLX), con CLI `mlx_vlm.generate` y servidor OpenAI-compatible `mlx_vlm.server`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: 33,8 tokens por segundo en decodificacion greedy sobre M4 Pro. La decodificacion especulativa con el drafter DSpark incluido no supone una ganancia fiable en ese hardware segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Inkling-2-Mini-MLX-3bit (este) | 26,4 mil millones (MoE) | no disponible | 49/50 | 35/40 | apache-2.0 | Hugging Face, formato MLX |
| Inkling-2-Mini-MLX-4bit | 26,4 mil millones (MoE) | no disponible | 45/50 | 36/40 | apache-2.0 | Hugging Face, formato MLX |
| Inkling-2-Mini-MLX-2bit | 26,4 mil millones (MoE) | no disponible | 47/50 | 32/40 | apache-2.0 | Hugging Face, formato MLX |
| Inkling-2-Mini (original) | 26,4 mil millones (MoE) | no disponible | 48/50 | 35/40 | apache-2.0 | Hugging Face, formato original |

No se dispone de informacion sobre modelos de otros fabricantes comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles, lo que limita su uso en castellano u otros idiomas sin degradacion.
- Perdida de calidad por cuantizacion: +1,4 % de perplejidad respecto al original, con variaciones de ±0,004 nats. El build de 2 bits sube al +10,0 %, por lo que no es recomendable para tareas sensibles a la precision.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas de factualidad en la informacion disponible; al ser un modelo generativo, persiste el riesgo habitual.
- Limitacion de tokens de salida: el razonamiento consume `max_tokens`; con limites bajos el modelo puede agotar el presupuesto en el razonamiento y devolver una respuesta vacia. El autor recomienda al menos 1.000 tokens por turno.
- Token de parada: un turno termina con `<|content_model_end_sampling|>` (id 200006); `<|end_message|>` no es token de parada y no debe anadirse como stop string.
- Tool calling en servidor: a fecha del commit `111ac668` de mlx-vlm, el servidor no incluye parser de tool calls para Inkling 2 y devuelve ni `tool_calls` ni `content`; se requiere aplicar el parche `extras/mlx-vlm-inkling2-tool-calls.patch` incluido en el repositorio.
- Compatibilidad: mlx-vlm anadio soporte para Inkling 2 Mini el 2026-11-20 (PR 2778); hasta que haya release, es necesario instalar desde el codigo fuente.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y las obligaciones de atribucion.
- Hardware: disenado exclusivamente para Apple Silicon mediante MLX; no hay garantias de funcionamiento en otras plataformas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VisualInference/Inkling-2-Mini-MLX-3bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Build 4bit: https://huggingface.co/VisualInference/Inkling-2-Mini-MLX-4bit
- Build 2bit: https://huggingface.co/VisualInference/Inkling-2-Mini-MLX-2bit
- Repositorio mlx-vlm: https://github.com/Neywa-Labs/mlx-vlm
- Parche de tool calling: https://huggingface.co/VisualInference/Inkling-2-Mini-MLX-3bit/resolve/main/extras/mlx-vlm-inkling2-tool-calls.patch
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
