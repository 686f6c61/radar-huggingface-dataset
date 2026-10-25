# stuchapin/Nanbeige4.3-33B-Base-W8A16-AutoRound

## Resumen

`stuchapin/Nanbeige4.3-33B-Base-W8A16-AutoRound` es una cuantización de 8 bits del modelo base `Nanbeige/Nanbeige4.3-33B-Base`, publicado por Nanbeige LLM Lab el 24 de octubre de 2026. No se trata de un modelo nuevo entrenado desde cero, sino de un checkpoint derivado: el autor de la cuantización (stuchapin) aplica AutoRound 0.15.1 en modo W8A16 simétrico, con grupo de 128, y empaqueta el resultado en formato GPTQ (`auto_round:auto_gptq`) para su uso con vLLM. El objetivo es reducir la huella de pesos de ~66 GB en BF16 a unos 33,5 GiB, de modo que el modelo pueda servirse en dos GPUs de 24 GB con paralelismo tensorial o en una sola GPU de 48 GB o más.

El modelo subyacente es un transformer denso tipo `LlamaForCausalLM` de 33 000 millones de parámetros, 52 capas, 56 cabezas de consulta y 8 cabezas clave-valor con GQA. La model card de la cuantización declara 128 000 tokens de contexto, mientras que fuentes de prensa sobre el lanzamiento del modelo base citan hasta 524 288 tokens; esta discrepancia no está resuelta en la información disponible y conviene verificarla en el repositorio del modelo base antes de desplegar cargas de contexto largo.

La relevancia de esta ficha es doble: por un lado, documenta una receta de cuantización concreta y reproducible para un modelo de 33B en hardware de consumo profesional; por otro, advierte de que se cuantiza la variante **Base**, no una variante instruida o de agente, por lo que las capacidades de agentic coding y razonamiento que la prensa atribuye a la familia Nanbeige4.3-33B no deben darse por supuestas en este checkpoint sin validación propia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso `LlamaForCausalLM` (52 capas, 56 cabezas de consulta, 8 cabezas KV con GQA) |
| Parametros totales | 33 000 millones (aproximado; según denominación del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 000 tokens según la model card de la cuantización; hasta 524 288 tokens según fuentes de prensa sobre el modelo base (dato no confirmado y en conflicto) |
| Tipos de cuantizacion | W8A16 simétrico, grupo de 128, AutoRound 0.15.1; existe también una variante W4A16 del mismo autor |
| Idiomas soportados | Chino (`zh`) e inglés (`en`) |
| Licencia | `nanbeige-license` (etiqueta `license: other` en HuggingFace); algunas fuentes de prensa citan Apache 2.0 para el modelo base, dato en conflicto |
| Formato de pesos | GPTQ empaquetado (`auto_round:auto_gptq`); contenedor exacto no confirmado en la información disponible |
| Modelo base | `Nanbeige/Nanbeige4.3-33B-Base` |
| Fecha de publicación del base | 24 de octubre de 2026 |
| Datos de calibración | 256 turnos reales de agentes en producción, multi-turno |
| Huella de pesos en VRAM | ~33,5 GiB totales; ~16,8 GiB por tarjeta con `TP=2` |
| Precisión declarada | Delta de perplejidad < 0,01 frente a BF16 (dato del autor) |
| Hardware objetivo | 2× 24 GB (RTX 3090, RTX 4090, A10) con `TP=2`, o 1× 48 GB+ (A6000, A100, H100) |
| Licencia del artefacto de cuantización | No especificada de forma independiente; hereda la del modelo base |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El checkpoint es una cuantización, no un entrenamiento. La arquitectura es la del modelo base: un transformer decoder-only denso con normalización previa, atención multi-cabeza con GQA (56 cabezas de consulta frente a 8 cabezas clave-valor, una ratio de 7:1) y 52 capas. No hay mezcla de expertos, ni capas SSM, ni atención lineal declarada. El proceso aplicado por stuchapin es AutoRound 0.15.1, que optimiza los parámetros de redondeo por capa mediante descenso de gradiente continuo antes de empaquetar los pesos en GPTQ con granularidad de grupo de 128 y simetría estricta.

El punto diferencial de esta receta es el conjunto de calibración: 256 turnos multi-turno extraídos de flotas de agentes en producción, en lugar de los típicos corpus genéricos de texto. Eso sesga la calibración hacia la distribución de prompts conversacionales y de herramienta propios de un despliegue agéntico, lo que debería preservar mejor la fidelidad en ese régimen concreto, a costa de una calibración menos representativa para otros dominios. El autor declara una degradación inferior a 0,01 puntos de perplejidad frente a BF16, una cifra plausible para W8A16 pero que no está respaldada en la información disponible con evaluaciones por tarea (MMLU, HumanEval u otras). No se detallan datos de preentrenamiento del modelo base: número de tokens, composición del corpus, ni si hubo RLHF o DPO, porque el repositorio cuantizado no los reproduce. Fuentes de prensa indican que el modelo de 33B se usa como profesor para destilar habilidades agénticas en modelos más pequeños, incluida una versión de 3B prevista.

## Capacidades

- Generación de texto y continuación de prompt en chino e inglés, propio de un modelo Base sin ajuste de instrucciones.
- Aprendizaje en contexto y few-shot prompting: al ser un modelo base, rinde mejor con ejemplos demostrativos que con instrucciones imperativas.
- Procesamiento de contexto largo: 128 000 tokens según la model card, con soporte de caché KV en FP8 en el despliegue vLLM sugerido.
- Base para fine-tuning supervisado y ajuste con preferencias, al conservar la distribución del modelo original con cuantización casi sin pérdida declarada.
- Generación de datos sintéticos y aumento de corpus en chino e inglés.
- No se documenta soporte nativo de tool calling o function calling en esta variante Base.
- No se documenta modo de razonamiento explícito (thinking mode), visión, audio ni otras modalidades.
- No se documentan capacidades de agente multi-paso verificadas para este checkpoint; las cifras agénticas de la familia Nanbeige4.3-33B corresponden presumiblemente a variantes ajustadas y no se han validado aquí.

## Casos de uso

- Fine-tuning supervisado sobre dominio propio: al ser un Base cuantizado en W8A16, sirve como punto de partida para LoRA o QLoRA en dos GPUs de 24 GB, reduciendo el coste de infraestructura frente a servir el BF16 completo.
- Generación de datos sintéticos bilingües (zh/en): el modelo puede producir corpus de continuación y paráfrasis a granel; conviene filtrar por perplejidad y deduplicar antes de reutilizar los datos.
- Procesamiento de documentos largos en chino e inglés: con 128 000 tokens de contexto declarados, encaja en tareas de resumen extractivo, extracción de cláusulas contractuales o análisis de expedientes completos sin troceado agresivo.
- Destilación de un modelo mayor: fuentes externas señalan que la familia 33B se emplea como profesor para destilar habilidades en modelos de 3B; este checkpoint puede actuar como profesor en la generación de trazas, aunque la cuantización introduce un pequeño sesgo respecto al BF16.
- Evaluación comparativa de recetas de cuantización: el autor publica también una variante W4A16, lo que permite medir el impacto de 8 frente a 4 bits sobre las mismas tareas y el mismo conjunto de calibración.
- Servicio de autocompletado y continuación de texto en producción: con `TP=2` en dos RTX 4090 o A10 se obtiene una latencia de primera respuesta adecuada para autocompletado interactivo, siempre que el caso no requiera seguir instrucciones complejas.
- Investigación en adaptación multilingüe zh-en: el modelo base permite estudiar transferencia entre ambos idiomas sin el sesgo de un ajuste instruccional previo.
- Reproducción de experimentos de calibración: los 256 turnos de agentes en producción documentados por el autor permiten replicar el efecto de calibrar con distribución conversacional frente a corpus genéricos.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto del dato |
|---|---|---|
| Terminal-Bench 2.1 | 80,9 | Citado por prensa para Nanbeige4.3-33B; no se especifica si corresponde a la variante Base o a una ajustada, ni está verificado |
| Delta de perplejidad vs BF16 | < 0,01 | Declarado por el autor de la cuantización |
| MMLU | No disponible | — |
| HumanEval | No disponible | — |
| GSM8K | No disponible | — |
| Throughput y latencia | No disponible | No se publican tokens/s ni TTFT |

No se han publicado resultados de benchmarks específicos de este checkpoint cuantizado en la información disponible. El dato de Terminal-Bench 2.1 procede de fuentes secundarias que describen el lanzamiento de la familia y no de una evaluación del repositorio `stuchapin/Nanbeige4.3-33B-Base-W8A16-AutoRound`.

## Requisitos de hardware

- VRAM de pesos: ~33,5 GiB en total para la cuantización W8A16; ~16,8 GiB por tarjeta con paralelismo tensorial de 2.
- Configuración mínima recomendada por el autor: 2× 24 GB (RTX 3090, RTX 4090, A10) con `TP=2`, dejando ~7,5 GiB por GPU para caché KV en FP8 y procesamiento de contexto largo.
- Alternativa de una sola GPU: A6000, A100 o H100 de 48 GB o más.
- No cabe en una GPU de consumo de 24 GB en configuración de una sola tarjeta con contexto largo; sí en dos de 24 GB.
- Despliegue recomendado: vLLM con `--quantization auto_round`, `--tensor-parallel-size 2`, `--max-model-len 32768`, `--gpu-memory-utilization 0.93` y `--kv-cache-dtype fp8`.
- Despliegue alternativo: `transformers` con `device_map="auto"`, `torch_dtype=torch.float16` y `trust_remote_code=True` para inferencia distribuida automática.
- No se documenta compatibilidad con llama.cpp, Ollama ni TGI; el formato GPTQ/AutoRound apunta a vLLM como vía principal.
- Latencia y throughput: no disponibles. El límite práctico de `--max-model-len 32768` en el ejemplo del autor sugiere que el contexto completo de 128 000 tokens exige ajustar la utilización de memoria o reducir el tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-Base (W8A16 AutoRound) | 33B denso | 128K (card) / hasta 512K (prensa, sin confirmar) | `nanbeige-license` (prensa cita Apache 2.0) | HuggingFace, vLLM | Objeto de esta ficha; calibrado con turnos de agentes |
| Qwen3-32B | 32,8B denso | 32 768 nativo, ampliable con YaRN | Apache 2.0 | HuggingFace, amplio ecosistema de cuantizaciones | Alternativa madura en tooling y despliegue |
| Gemma-3-27B | 27B denso | 128K | Licencia Gemma (uso comercial con condiciones) | HuggingFace, Vertex AI | Multimodal en la familia; licencia menos permisiva |
| Mistral Small 3.1 24B | 24B denso | 128K | Apache 2.0 | HuggingFace, vLLM, Ollama | Menor huella, cabe en una GPU de 48 GB con margen |

Los datos de los modelos comparables proceden de sus especificaciones públicas y no se han verificado contra benchmarks ejecutados en el mismo entorno; no se dispone de una comparación de rendimiento homogénea entre Nanbeige4.3-33B y estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo **Base**, no instruido: no cabe esperar seguimiento fiable de instrucciones, formato de chat ni rechazo de peticiones dañinas sin un ajuste posterior.
- Las capacidades agénticas y de razonamiento que la prensa atribuye a Nanbeige4.3-33B no están verificadas para este checkpoint Base cuantizado.
- Discrepancia de contexto no resuelta: 128 000 tokens en la model card frente a 524 288 en fuentes de prensa. Verificar en el repositorio del modelo base antes de dimensionar caché KV.
- Discrepancia de licencia: la etiqueta de HuggingFace es `license: other` con `nanbeige-license`, mientras que varias fuentes secundarias afirman Apache 2.0. Es imprescindible leer el fichero LICENSE del modelo base antes de cualquier uso comercial.
- Riesgo de alucinación inherente a un modelo de lenguaje base, agravado en dominios no representados en el corpus de preentrenamiento, cuyo contenido no se documenta.
- Idiomas limitados a chino e inglés según la model card; el rendimiento en castellano no está evaluado y previsiblemente será inferior.
- La calibración se hizo con 256 turnos de agentes en producción, lo que puede introducir sesgo hacia ese registro conversacional y degradar ligeramente otros dominios.
- La cuantización W8A16 no es sin pérdida: el delta de perplejidad < 0,01 lo declara el autor y no se acompaña de evaluaciones por tarea.
- El checkpoint tiene 0 descargas y 0 likes, sin validación independiente de la comunidad; tratar como artefacto no auditado.
- El ejemplo de despliegue limita `--max-model-len` a 32 768, muy por debajo del contexto declarado; usar la ventana completa exige más VRAM para caché KV o cuantización adicional.
- `trust_remote_code=True` en el código de ejemplo implica ejecutar código del repositorio; revisar antes de usarlo en entornos de producción.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/stuchapin/Nanbeige4.3-33B-Base-W8A16-AutoRound
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B-Base
- Licencia del modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B-Base/blob/main/LICENSE
- Variante W4A16 del mismo autor: https://huggingface.co/stuchapin/Nanbeige4.3-33B-Base-W4A16-AutoRound
- Nanbeige4-3B-Base (modelo relacionado de menor tamaño): https://huggingface.co/Nanbeige/Nanbeige4-3B-Base
- Guía del lanzamiento en explainx.ai: https://explainx.ai/blog/nanbeige-4-3-33b-open-agentic-model-guide-2026
- Nota de AI Weekly sobre el lanzamiento: https://aiweekly.co/alerts/nanbeige-opens-33b-model-under-apache-20-with-512k-context
- Cobertura de AI Brief: https://dailyaibrief.com/news/nanbeige-releases-33b-agent-model-with-512k-context-yoxTglVU
