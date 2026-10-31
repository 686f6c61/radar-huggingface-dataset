# wasifb/Nanbeige4.3-33B-AutoRound-W4A16

## Resumen

Nanbeige4.3-33B-AutoRound-W4A16 es una cuantización INT4 (esquema W4A16) del modelo Nanbeige4.3-33B, un modelo denso de lenguaje de 33B parámetros desarrollado por el equipo Nanbeige. La cuantización ha sido realizada por el usuario wasifb mediante la herramienta AutoRound de Intel, con el objetivo de servir el modelo en dos tarjetas gráficas de consumo de 24 GB (RTX 3090) dentro del proyecto club-3090. El modelo base es un modelo de razonamiento y agéntico basado en la arquitectura LlamaForCausalLM, con 52 capas, atención agrupada de consultas (GQA) con 56 cabezas de consulta y 8 de clave-valor, y una longitud de contexto de 512K tokens.

La relevancia de esta versión cuantizada radica en que hace accesible un modelo de 33B con contexto muy largo y capacidades de razonamiento y tool calling en hardware de consumo, reduciendo el peso de aproximadamente 66 GB en BF16 a 20,8 GB. Es especialmente útil para desarrolladores que quieren desplegar agentes con razonamiento extendido (thinking mode) sin necesidad de aceleradores de datacenter. La licencia Apache-2.0 del modelo base se mantiene en esta derivación, lo que permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (denso, transformer decoder, GQA 56/8) |
| Parámetros totales | 33B (modelo base); 2.393.603.072 parámetros contabilizados en safetensors tras la cuantización |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512K tokens (modelo base); validado en serving hasta 204.800 tokens con KV cache fp8 |
| Tipos de cuantización | W4A16 (INT4 simétrico, group size 128, empaquetado auto_round:auto_gptq); embeddings, norms y lm_head en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (INT4 empaquetado, compatible con vLLM y SGLang) |

## Arquitectura y entrenamiento

El modelo base, Nanbeige4.3-33B, emplea una arquitectura transformer decoder densa bajo la clase LlamaForCausalLM, con 52 capas y grouped-query attention (GQA) con 56 cabezas de consulta y 8 cabezas clave-valor, lo que reduce el coste de la KV cache y facilita contextos largos. Utiliza un RoPE theta de 1,2e8, un valor elevado coherente con su ventana de contexto de 512K tokens. El checkpoint original no incorpora cabeza MTP (multi-token prediction). No se dispone de información pública sobre el número de tokens de entrenamiento ni la composición del dataset del modelo base.

En cuanto al proceso de cuantización, se aplicó AutoRound 0.14.2 con esquema W4A16 (pesos en INT4 simétrico con group size 128, activaciones en BF16), cuantizando las 364 capas lineales de los 52 bloques decoder y manteniendo en BF16 el lm_head, los embeddings y todas las normas. El ajuste se realizó con 200 iteraciones sobre 512 muestras de longitud 2048, con `enable_alg_ext=True` y calibración sobre el dataset por defecto de AutoRound (NeelNanda/pile-10k). La receta completa está almacenada en el fichero `club3090_build_recipe.json` del repositorio.

## Capacidades

- Generación de texto conversacional con plantilla de chat original del modelo base.
- Razonamiento con thinking mode activado por defecto (`enable_thinking`), con separación del razonamiento del resultado final mediante el parser `qwen3`.
- Tool calling / function calling nativo, con formato XML por defecto (`tool_call_format="xml"`, parser `qwen3_coder`) y soporte JSON mediante el parser `hermes`.
- Capacidades agénticas: la model card original recomienda mantener el razonamiento previo (`preserve_thinking`) en flujos de agentes multi-paso.
- Contexto muy largo (512K tokens en el modelo base), apto para procesar documentos extensos y conversaciones multi-turno prolongadas.
- Streaming de tool calls y respuestas verificado en vLLM y SGLang.

## Casos de uso

- Atención al cliente automatizada: gracias a los 512K tokens de contexto y al razonamiento multi-turno con `preserve_thinking`, puede gestionar conversaciones largas manteniendo el historial completo y el razonamiento previo de la sesión.
- Agentes autónomos multi-paso: soporta tool calling en formato XML y JSON, streaming de tool calls y razonamiento encadenado, siendo adecuado para frameworks de agentes que ejecutan cadenas de acciones sobre herramientas externas.
- Análisis de documentos extensos: la ventana de contexto de 512K (validada en serving hasta 204.800 tokens con KV cache fp8 en 2×24 GB) permite resumir, consultar y extraer información de libros técnicos, contratos o bases de código completas.
- Razonamiento y resolución de problemas: el thinking mode por defecto genera cadenas de razonamiento explícitas antes de la respuesta, útil en tareas de planificación, matemáticas y análisis lógico.
- Despliegue en estaciones de trabajo de consumo: el objetivo original de la cuantización es servir el modelo en dos RTX 3090 de 24 GB, lo que lo hace idóneo para laboratorios locales y entornos sin acceso a GPUs de datacenter.
- Integración en pipelines de inferencia productivos: los comandos de serving verificados para vLLM v0.32.0 y SGLang v0.5.22 (con parsers de razonamiento y tool calling preconfigurados) permiten integrarlo directamente en APIs compatibles con OpenAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la evaluación de calidad (el "8-pack" de club-3090) y las cifras de throughput están pendientes y que el repositorio se actualizará con ellos. Los datos publicados se limitan a verificaciones de serving:

| Verificación | vLLM v0.32.0 | SGLang v0.5.22 |
|---|---|---|
| Carga (kernels Marlin int4) | sí, 9,83 GiB por tarjeta | sí, 10,11 GB por tarjeta |
| Pool de KV cache fp8 | 207.616 tokens | 206.433 tokens |
| verify-full (respuestas, tool calls, streaming de tool calls, separación de razonamiento, respuesta larga sin repetición) | superada | superada |

## Requisitos de hardware

- VRAM estimada para inferencia: unos 10 GB por tarjeta para los pesos (9,83 GiB en vLLM, 10,11 GB en SGLang con tensor parallel 2), más la KV cache; con KV cache fp8_e4m3 se obtienen ~200K tokens de contexto en 2×24 GB.
- GPU recomendadas: 2× RTX 3090 (24 GB) es la configuración objetivo y validada; cualquier par de tarjetas de 24 GB (RTX 3090, RTX 3090 Ti, RTX 4090) debería ser adecuado. Alternativamente, una sola GPU de 48 GB o superior (A6000, L40S, A100 40/80 GB) podría alojar los pesos, aunque no se ha validado en la información disponible.
- Consumer GPUs: sí, cabe en 2× RTX 3090 con 204.800 tokens de contexto y KV cache fp8; es la configuración de referencia del proyecto club-3090.
- Despliegue: vLLM v0.32.0 (método `inc` resuelto automáticamente desde la config de AutoRound) y SGLang v0.5.22 (con `--quantization auto-round`). Se recomienda limitar `--chunked-prefill-size` a 2048 en SGLang sobre tarjetas de 24 GB (con 8192 se agota la memoria al capturar los grafos CUDA de prefill).
- Requisito crítico de software: transformers 5.x. El `config.json` guarda el RoPE theta (1,2e8) únicamente en `rope_parameters`; con transformers 4.x se pierde y cae silenciosamente a 10.000, corrompiendo la salida.
- Latencia y throughput: no disponible (pendiente de publicación según la model card).

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Cuantización | Licencia |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-AutoRound-W4A16 | 33B (base) | Denso, GQA 56/8, 52 capas | 512K | INT4 W4A16 (AutoRound) | Apache-2.0 |
| Qwen3-32B | 32B | Denso, GQA | 128K (con YaRN hasta 131K) | BF16 nativo; INT4 oficial disponible | Apache-2.0 |
| QwQ-32B | 32B | Denso, GQA | 131K | BF16 nativo; GGUF/INT4 de la comunidad | Apache-2.0 |
| Qwen3-30B-A3B | 30B (3B activos) | MoE | 131K | BF16 nativo; INT4 oficial disponible | Apache-2.0 |

Nanbeige4.3-33B destaca frente a alternativas de tamaño similar por su ventana de contexto de 512K tokens, muy superior a los ~128K-131K de los modelos Qwen de 32B. A cambio, su carga de KV cache en contextos extremos es mayor, y su ecosistema de serving y documentación comunitaria es menos maduro que el de Qwen. Los datos de benchmarks comparativos no están disponibles.

## Limitaciones y advertencias

- Incompatibilidad silenciosa con transformers 4.x: si el stack no usa transformers 5.x, el RoPE theta se pierde y el modelo genera salida corrupta sin ningún error explícito. Es el caveat más importante para producción.
- Sesgos: no disponible; no se documenta información sobre sesgos del modelo base.
- Alucinaciones: al ser un modelo generativo de lenguaje, mantiene el riesgo inherente de alucinación; no hay evaluaciones publicadas que cuantifiquen este riesgo.
- Idiomas: el soporte de idiomas no está documentado en la información disponible; conviene validar el rendimiento en castellano antes de uso productivo.
- Calidad de la cuantización sin evaluar: la evaluación de calidad tras la cuantización INT4 está pendiente según la model card, por lo que la degradación respecto al modelo base no está cuantificada.
- Memoria en prefill: en tarjetas de 24 GB con SGLang, `--chunked-prefill-size` superior a 2048 provoca agotamiento de memoria al capturar los grafos CUDA.
- Sin cabeza MTP: el checkpoint original carece de multi-token prediction, por lo que no hay aceleración por MTP en la inferencia.
- Licencia: Apache-2.0, sin restricciones para uso comercial.

## Enlaces

- Repositorio cuantizado: https://huggingface.co/wasifb/Nanbeige4.3-33B-AutoRound-W4A16
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- AutoRound (Intel): https://github.com/intel/auto-round
- Proyecto club-3090: https://github.com/noonghunna/club-3090
- Equipo Nanbeige: https://huggingface.co/Nanbeige
