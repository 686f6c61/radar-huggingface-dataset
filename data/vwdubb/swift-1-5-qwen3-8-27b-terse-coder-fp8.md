# vwdubb/Swift-1.5-Qwen3.8-27b-Terse-Coder-FP8

## Resumen

Swift-1.5-Qwen3.8-27b-Terse-Coder-FP8 es un checkpoint fusionado publicado por el usuario vwdubb a partir de ukisai/Swift-1.5-Qwen3.8-27b, al que se le ha incorporado el adaptador LoRA Shockem/Qwen3.8-27b-Terse-Coder-LoRA (ronda 8, rank 16, DPO) para reducir la verbosidad de las trazas de razonamiento en tareas de código. El resultado es un único checkpoint de 27.781.427.952 parámetros (unos 27,8 mil millones) con los pesos del adaptador ya integrados, sin necesidad de cargar un LoRA aparte en tiempo de ejecución; el repositorio ocupa 38,5 GB.

El interés del artefacto está en su objetivo: recortar el coste en tokens de pensamiento. Según la model card, la base Swift 1.5 consume un 58,5 % menos de tokens de thinking que el Qwen3.8-27B original manteniendo una puntuación de GPQA-Diamond un 0,35 % superior, y el LoRA Terse-Coder añade una pasada adicional de concisión centrada en trazas de código. La fusión se realizó en fp32 con redondeo estocástico (semilla fija 0) para preservar deltas de peso muy pequeños (‖Δ‖/‖W‖ ≈ 4e-4–1e-3), por debajo de la resolución de bf16.

Se trata, no obstante, de un artefacto sin medición independiente: no se han publicado benchmarks sobre esta fusión concreta, la pareja Swift 1.5 + Terse-Coder no aparece en las tablas de resultados del autor del adaptador, y existe una discrepancia relevante entre el sufijo FP8 del nombre del repositorio, el tag compressed-tensors y la afirmación de la model card de que los pesos se almacenan en bf16 sin recuantizar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Qwen3.8 (base ukisai/Swift-1.5-Qwen3.8-27b), con cabecera MTP y torre de visión; número de capas y configuración de atención no disponibles |
| Parametros totales | 27.781.427.952 (≈27,8 B) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | 262.144 tokens (256K) en el ejemplo de servicio vLLM documentado; no confirmado en el config del repositorio |
| Tipos de cuantizacion | FP8 según el nombre del repositorio y el tag compressed-tensors; la model card indica almacenamiento en bf16 sin recuantización; GGUF no disponible |
| Idiomas soportados | No disponible |
| Licencia | Swift Open License v1.0 (campo license: other). Uso personal, investigación, educativo, evaluación y comercial gratuito para personas y organizaciones con ingresos anuales brutos de hasta 1.000.000 USD; por encima, requiere licencia Swift Enterprise de UkisAI |
| Formato de pesos | safetensors (compressed-tensors), bf16/fp8 |

## Arquitectura y entrenamiento

El modelo es una fusión de pesos, no un entrenamiento desde cero. El adaptador se integró con la fórmula `W + B @ A * (lora_alpha / r)`, con alpha 32 y r 16 (escala 2,0), en fp32, y el resultado se almacenó en bf16 mediante redondeo estocástico (unbiased) con semilla fija 0 para hacer la fusión reproducible. El motivo del redondeo estocástico es que los deltas del adaptador son deliberadamente diminutos: la propia model card del LoRA mide una supervivencia del delta de solo el 31–61 % con redondeo bf16 convencional, frente al 94–99,9 % en fp16. La cabecera MTP y los pesos de visión no se tocaron, de modo que la decodificación especulativa MTP sigue disponible. Los ficheros no relacionados con pesos (config, tokenizer, processor, índice) se copiaron de la base Swift 1.5, y la plantilla de chat es Shockem/froggeric-terse-coder, la misma con la que se evaluó el adaptador.

En cuanto a la procedencia de la base, Swift 1.5 es un fine-tune más profundo que Swift 1.0: se construyó a partir de este último con RL ampliado y post-entrenamiento OPD. El adaptador Terse-Coder es una edición de comportamiento orientada a código con thinking activado, no una edición de conocimiento. El resultado es, según el propio autor del repositorio, el artefacto más estratificado de la serie: dos fine-tunes apilados más un LoRA de comportamiento. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni los detalles del RL/DPO más allá de la ronda 8 y el rank 16 del adaptador.

## Capacidades

- Generación de texto conversacional multi-turno en un único checkpoint, sin fontanería LoRA adicional.
- Razonamiento con modo thinking, con trazas deliberadamente más breves gracias al LoRA Terse-Coder; el ajuste de `reasoning_effort` sigue estando disponible para tareas que requieran derivaciones largas.
- Generación y razonamiento sobre código (etiquetas coding y token-efficient), con el foco del adaptador puesto en trazas de programación.
- Tool calling / function calling: el ejemplo de vLLM documenta `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`.
- Soporte de flujos agénticos multi-paso, condicionado al uso de la plantilla de chat froggeric-terse-coder; servir sin ella altera el comportamiento agéntico según la model card.
- Capacidades multimodales heredadas: el repositorio carga con `AutoModelForImageTextToText` y los pesos de visión se conservan intactos (entrada de imagen y texto), aunque no se documenta el alcance concreto.
- Decodificación especulativa MTP con `num_speculative_tokens` configurable (valor de ejemplo: 3), al conservarse la cabecera MTP de la base.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Agentes de código autónomos: el modelo puede sostener bucles multi-paso con tool calling y contexto de hasta 262.144 tokens, y el ajuste Terse-Coder reduce el gasto de tokens de pensamiento por iteración, lo que abarata cada ciclo del agente.
- Revisión de pull requests en CI/CD: integrado mediante vLLM con `--tool-call-parser qwen3_coder`, puede analizar diffs, ejecutar llamadas a herramientas de lint o tests y emitir comentarios concisos, evitando trazas de razonamiento infladas que encarecen el pipeline.
- Asistente de programación en IDE: al ser un único checkpoint servible, se despliega como endpoint compatible con OpenAI y responde con razonamiento comprimido, lo que reduce la latencia percibida en autocompletado y explicación de código.
- Análisis de documentación técnica con diagramas: la carga mediante `AutoModelForImageTextToText` y la conservación de los pesos de visión permiten procesar capturas de arquitectura, diagramas de flujo o esquemas junto al texto asociado.
- RAG sobre bases de código extensas: la ventana de 262.144 tokens permite inyectar múltiples ficheros completos y el historial de conversación en una sola petición, sin trocear en exceso el contexto.
- Generación de documentación y changelogs: el comportamiento terse reduce la verbosidad de la salida, lo que produce documentación más densa y con menor coste de tokens de salida.
- Evaluación comparativa de eficiencia de razonamiento: sirve como punto de medida para estudiar cuánto se puede comprimir la traza de thinking en tareas de código sin perder precisión, aunque requiere ejecutar benchmarks propios (ver la sección de limitaciones).
- Atención al cliente técnica de segundo nivel: conversaciones largas con contexto de código o logs y respuestas directas, siempre que se revise la licencia en función de los ingresos de la organización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks sobre este artefacto concreto en la información disponible. Los únicos datos numéricos citados en la model card corresponden a la base Swift 1.5 o a mediciones del autor del adaptador sobre otras bases, y se reproducen aquí únicamente como referencia contextual:

| Metrica | Valor | Ambito de la medicion |
|---|---|---|
| GPQA-Diamond | +0,35 % sobre Qwen3.8-27B original | Modelo base Swift 1.5, no esta fusión |
| Tokens de thinking | −58,5 % frente a Qwen3.8-27B original | Modelo base Swift 1.5, no esta fusión |
| Supervivencia del delta del LoRA | 31–61 % con redondeo bf16 plano; 94–99,9 % en fp16 | Model card del adaptador Terse-Coder |
| Capability tax tras fusion y recuantizacion | 70 % → 60–62 % en el conjunto held-out-40 | Medición del autor del adaptador sobre base Qwen stock, con fp32-merge → fp16 → NVFP4 |
| Doble aplicacion del LoRA | 63 % de aciertos, con fallos de tipo `no_code` | Pruebas del adaptador; se advierte de no aplicarlo sobre este modelo |

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra suite publicados para este repositorio. Los resultados de búsqueda web recuperados no contienen información relacionada con el modelo.

## Requisitos de hardware

- Pesos en bf16: 27,78 B × 2 bytes ≈ 55,6 GB solo de pesos, más caché KV y activaciones. No cabe en GPU de consumo.
- Pesos en fp8 (según el nombre del repositorio): 27,78 B × 1 byte ≈ 27,8 GB. El repositorio ocupa 38,5 GB, cifra que no coincide exactamente con ninguna de las dos estimaciones anteriores; conviene inspeccionar el config real antes de dimensionar.
- Contexto de 262.144 tokens: la caché KV a esa longitud es muy grande y exige tensor parallelism, cuantización de KV o reducción de `--max-model-len` según el caso de uso.
- GPU recomendadas para bf16: 1×H100 80 GB o 1×A100 80 GB con contexto moderado; 2×A100/H100 80 GB para contexto largo con holgura. Para fp8, 1×A100 40 GB, L40S 48 GB o RTX 6000 Ada 48 GB.
- GPU de consumo: una RTX 4090 de 24 GB no es suficiente con los pesos en bf16 ni en fp8; haría falta una cuantización adicional (GGUF, AWQ o GPTQ) que este repositorio no publica.
- Opciones de despliegue: vLLM está documentado con un comando completo (`--dtype bfloat16`, `--tensor-parallel-size 1`, `--max-model-len 262144`, `--reasoning-parser qwen3`, `--enable-auto-tool-choice`, `--tool-call-parser qwen3_coder`, puerto 8000). También se documenta uso con Transformers vía `AutoModelForImageTextToText` y `AutoProcessor`. No hay soporte publicado para llama.cpp, Ollama ni TGI.
- Decodificación especulativa: configurable con `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`, cabecera MTP incluida e intacta.
- Latencia y throughput: no disponibles. La decodificación especulativa MTP es el único mecanismo documentado de mejora de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (Swift-1.5-Qwen3.8-27b-Terse-Coder-FP8) | 27,8 B | 262.144 tokens segun el ejemplo vLLM | Sin benchmarks publicados sobre esta fusion | Swift Open License v1.0 (comercial gratis hasta 1 M USD de ingresos) | safetensors, fp8/bf16 |
| ukisai/Swift-1.5-Qwen3.8-27b (base) | No disponible | No disponible | −58,5 % tokens de thinking y +0,35 % en GPQA-Diamond frente a Qwen3.8-27B (segun su model card) | Swift Open License v1.0 | No disponible |
| Shockem/Qwen3.8-27b-Terse-Coder-LoRA (adaptador en runtime) | No aplica (LoRA r=16, alpha 32) | Heredado de la base | Misma precision que el merge segun su autor, sin el capability tax de la fusion | Apache 2.0 | Safetensors (adaptador); las bases recomendadas por su autor son Qwen stock, Signal y heretic-ara, no Swift |
| Qwen3.8-27B (Alibaba Cloud) | No disponible en la informacion proporcionada | No disponible | Referencia frente a la que se miden los −58,5 % de tokens y el +0,35 % en GPQA-Diamond | Apache 2.0 | No disponible |

## Limitaciones y advertencias

- Esta pareja concreta (Swift 1.5 + Terse-Coder) no ha sido medida por el autor del adaptador; su model card recomienda bases Qwen stock, Signal y heretic-ara, y ninguna base Swift aparece en sus tablas de resultados. El efecto debería componerse, pero la magnitud sobre Swift 1.5 es desconocida.
- No se ha ejecutado ningún benchmark independiente sobre este artefacto, y el repositorio no registra descargas ni valoraciones en el momento de la consulta.
- El autor del adaptador recomienda el LoRA en runtime como forma de despliegue a plena potencia y midió un capability tax tras la fusión en la base Qwen stock (70 % → 60–62 % en su held-out-40 tras fp32-merge → fp16 → NVFP4). Este merge se guarda en bf16 sin recuantizar, por lo que la merma debería ser menor, pero no es nula.
- Ambigüedad de cuantización: el nombre del repositorio dice FP8 y el tag `compressed-tensors` apunta a pesos comprimidos, mientras que la model card afirma que la fusión se almacena en bf16 sin recuantización. Verificar los ficheros antes de planificar el despliegue.
- No se debe cargar el LoRA Terse-Coder encima de este modelo: la doble aplicación acorta en exceso el razonamiento (63 % de aciertos con fallos de tipo `no_code` en las pruebas del adaptador).
- Es el artefacto más estratificado de la serie (dos fine-tunes más un LoRA de comportamiento); ante comportamientos extraños, la model card recomienda diagnosticar con el LoRA en runtime sobre Swift 1.5 sin fusionar.
- Hay que servir con la plantilla de chat Shockem/froggeric-terse-coder: usar otra cambia el comportamiento agéntico.
- El adaptador es una edición de comportamiento, no de conocimiento; en tareas que requieran derivaciones largas hay que subir `reasoning_effort`.
- Licencia restrictiva para uso comercial por encima de 1.000.000 USD de ingresos anuales brutos: requiere licencia Swift Enterprise de UkisAI. La Apache 2.0 de Qwen3.8-27B no queda limitada por la licencia de Swift.
- Riesgos de sesgo, alucinación, cobertura idiomática y comportamiento fuera de distribución: no documentados en la información disponible. Al ser un modelo de razonamiento fusionado con un LoRA de concisión, es esperable que acorte trazas en dominios distintos del código sin que el adaptador haya sido evaluado para ellos, pero no hay datos que lo cuantifiquen.
- La búsqueda web realizada no devolvió ninguna fuente relevante sobre el modelo (los resultados obtenidos eran páginas de soporte de Microsoft Windows).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vwdubb/Swift-1.5-Qwen3.8-27b-Terse-Coder-FP8
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Adaptador LoRA Terse-Coder: https://huggingface.co/Shockem/Qwen3.8-27b-Terse-Coder-LoRA
- Perfil del autor del merge: https://huggingface.co/vwdubb
- Perfil de UkisAI: https://huggingface.co/ukisai
- Perfil de Shockem: https://huggingface.co/Shockem
- Qwen Team (Alibaba Cloud): https://huggingface.co/Qwen
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
