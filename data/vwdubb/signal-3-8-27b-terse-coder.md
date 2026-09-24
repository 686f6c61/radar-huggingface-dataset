# vwdubb/Signal-3.8-27B-Terse-Coder

## Resumen

Signal-3.8-27B-Terse-Coder es un checkpoint fusionado publicado por el usuario vwdubb que combina los pesos del modelo base agentionai/Signal-3.8-27B con el adaptador LoRA Shockem/Qwen3.8-27b-Terse-Coder-LoRA (ronda 8, DPO de rango 16) ya integrado en los pesos. El resultado es un unico artefacto de 27.781.427.952 parametros (~27,8B) en bf16, sin necesidad de cargar el adaptador en tiempo de ejecucion. La tesis del autor es que la fusion "pre-horneada" simplifica el despliegue manteniendo el comportamiento de ahorro de tokens de razonamiento que el adaptador aporta sobre Signal.

El modelo pertenece a la familia Qwen3.8-27B (los tags declaran qwen3_5 y qwen3_8) y hereda las capacidades multimodales del base: la propia model card menciona pesos de vision y una cabeza MTP (multi-token prediction) intactas, ademas de un template de chat especifico (Shockem/froggeric-terse-coder). El proposito principal es la generacion de codigo con modo "thinking" activado, recortando de forma agresiva el numero de tokens de razonamiento sin degradar la tasa de acierto.

Es relevante ahora porque aborda un problema practico de los modelos razonadores: el coste en tokens de la cadena de pensamiento. Segun los datos aportados, Signal ya reduce ~52% los tokens de pensamiento frente al Qwen3.8-27B de stock, y el adaptador recorta un ~40% adicional. El detalle tecnico mas interesante es el uso de redondeo estocastico sin sesgo al fusionar en fp32 y almacenar en bf16, ya que los deltas del adaptador (‖Δ‖/‖W‖ ≈ 4e-4–1e-3) quedan por debajo de la resolucion de bf16. La adopcion es muy baja (6 descargas, 0 likes) y no hay benchmarks independientes de este artefacto concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen3.8-27B (pesos de vision y cabeza MTP presentes); tags qwen3_5 / qwen3_8 |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 262.144 tokens (segun el ejemplo de servicio vLLM con --max-model-len 262144) |
| Tipos de cuantizacion | bf16 nativo; el adaptador original se evaluo tambien en fp16 y NVFP4. No se distribuyen GGUF ni cuantizaciones de terceros |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El artefacto no entrena nada nuevo: es una fusion de pesos. La operacion aplicada es `W + B @ A * (lora_alpha / r)` ejecutada en fp32, con `alpha = 32` y `r = 16` (escala 2.0). El resultado se almacena en bf16 usando redondeo estocastico (no sesgado) con semilla fija 0, lo que hace reproducible la fusion. La justificacion tecnica es solida: los deltas del adaptador son deliberadamente minusculos (‖Δ‖/‖W‖ ≈ 4e-4–1e-3), por debajo de la resolucion por elemento de bf16. La model card del adaptador mide una supervivencia del delta de solo 31–61% con redondeo bf16 plano, frente a 94–99,9% en fp16. El redondeo estocastico redondea cada elemento hacia arriba o hacia abajo con probabilidad ponderada para que su valor esperado coincida con el valor fusionado real.

Los ficheros que no son pesos (config, tokenizer, processor, index) se copian del base Signal, y el template de chat es Shockem/froggeric-terse-coder, el usado en la evaluacion del adaptador. Signal entrega el template original de Qwen3.8, por lo que servirlo sin el template del adaptador cambia el comportamiento agentico. La cabeza MTP (draft head) y los pesos de vision quedan intactos, de modo que la decodificacion especulativa MTP sigue disponible. Conviene subrayar que el adaptador es una edicion de comportamiento, no de conocimiento: ajusta cuanto piensa el modelo, no lo que sabe. El autor del adaptador recomienda el LoRA en tiempo de ejecucion como forma de despliegue a plena potencia.

## Capacidades

- Generacion de codigo, con soporte de tareas de programacion en modo razonamiento ("thinking") activado.
- Razonamiento con cadenas de pensamiento abreviadas de forma deliberada (token-efficient reasoning).
- Capacidades multimodales heredadas del base (hay pesos de vision en el checkpoint).
- Soporte de tool calling / function calling en vLLM mediante `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`.
- Soporte de agentes: la model card menciona explicitamente que servir el modelo sin el template del adaptador "cambia el comportamiento agentico".
- Decodificacion especulativa MTP: la cabeza draft esta incluida y sin tocar (`--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`).
- Conversacional multi-turno (tag `conversational`).
- Capacidades multilingues: no disponible.

## Casos de uso

- Generacion de codigo en produccion con presupuesto de tokens ajustado: al reducir el numero de tokens de pensamiento, baja el coste por peticion en tareas de autocompletado, refactorizacion o generacion de tests dentro de pipelines de CI/CD.
- Agentes de codigo multi-paso: el modelo soporta tool calling y comportamiento agentico (con el parser `qwen3_coder`), lo que permite encadenar llamadas a herramientas y edicion de ficheros en IDE o CLI.
- Copiloto de programacion en editores: la ventana de contexto de 262.144 tokens permite mantener grandes ficheros o varios modulos en contexto sin truncar.
- Revision de codigo automatizada: el modo thinking con trazas cortas es adecuado para analisis de diffs donde interesa una salida concisa y verificable en lugar de derivaciones extensas.
- Asistente tecnico conversacional: multi-turno sobre documentacion, con el template terse-coder para respuestas breves.
- Tareas multimodales (captura de pantalla, diagramas): al conservar los pesos de vision, puede emplearse para interpretar UI o diagramas de arquitectura y generar codigo asociado.
- Servicio de alto rendimiento con vLLM: el tensor-parallel y la decodificacion especulativa MTP permiten desplegarlo en produccion con throughput mejorado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks independientes sobre este artefacto concreto. La unica informacion cuantitativa disponible proviene de las model cards del base y del adaptador, y se refiere a otros artefactos (Signal en NVFP4, adaptador en runtime, fusiones sobre Qwen base). Se reproduce a continuacion como referencia, no como medicion de este checkpoint.

| Metrica | Valor | Origen |
|---|---|---|
| Reduccion de tokens de pensamiento vs Qwen3.8-27B de stock | ~52% | Signal (base), card de referencia [1] |
| Recorte adicional de tokens de razonamiento por el adaptador | ~40% | Card del adaptador (sobre base Signal en NVFP4) |
| Supervivencia del delta con redondeo bf16 plano | 31–61% | Card del adaptador |
| Supervivencia del delta en fp16 | 94–99,9% | Card del adaptador |
| Pass rate en held-out-40 tras fp32-merge → fp16 → NVFP4 | 70% → 60–62% | Card del adaptador (sobre Qwen base) |
| Pass rate con doble aplicacion del LoRA | 63%, con fallos `no_code` | Card del adaptador |

No se aportan cifras de MMLU, HumanEval, GSM8K ni similares para este checkpoint.

## Requisitos de hardware

- VRAM en bf16: los pesos ocupan ~55,6 GB (27,78B × 2 bytes), coincidente con el tamano del repo. Con KV cache y overhead de runtime, se recomienda una GPU de 80 GB (A100 80GB, H100 80GB) o tensor-parallel sobre 2×48 GB.
- VRAM en 8 bits (si se cuantiza): ~28 GB, viable en 1×A100 40GB o 2×RTX 4090.
- VRAM en 4 bits (GPTQ/AWQ/NVFP4, conversion propia): ~14–16 GB, cabe en RTX 4090 / RTX 3090 (24 GB) e, al limite, en GPUs de 16 GB. No se publican pesos cuantizados para este checkpoint.
- Contexto largo: servir los 262.144 tokens exige un KV cache muy voluminoso; en la practica conviene cuantizacion de KV (fp8) o GPUs de 80 GB.
- GPU recomendadas: H100 80GB o A100 80GB para bf16 con contexto completo; RTX 4090/3090 para cuantizacion de 4 bits y contextos moderados.
- Opciones de despliegue: vLLM esta documentado de forma explicita (con `--reasoning-parser qwen3`, `--tool-call-parser qwen3_coder` y configuracion MTP). Transformers tambien esta documentado via `AutoModelForImageTextToText` y `AutoProcessor`. llama.cpp, Ollama y TGI no estan documentados; al no publicarse GGUF, requeririan conversion propia.
- Latencia y throughput: no disponibles. La decodificacion especulativa MTP con 3 tokens especulativos se ofrece como opcion de mejora, pero sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| vwdubb/Signal-3.8-27B-Terse-Coder | ~27,8B | 262.144 | safetensors bf16, LoRA pre-fusionado | Apache 2.0 | Sin benchmarks independientes |
| agentionai/Signal-3.8-27B | no disponible (base ~27,8B) | no disponible | safetensors | Apache 2.0 | ~52% menos tokens de pensamiento que Qwen3.8-27B de stock |
| Shockem/Qwen3.8-27b-Terse-Coder-LoRA (en runtime) | adaptador LoRA (r=16, alpha=32) | hereda del base | adaptador | Apache 2.0 | Forma recomendada por su autor; pass rate 70% en held-out-40 |
| Qwen3.8-27B (Alibaba Cloud) | ~27B | no disponible | safetensors | Apache 2.0 | Modelo de referencia de la familia |

La diferencia clave entre las opciones es el modo de despliegue: la version runtime (LoRA separado) es la recomendada por el autor del adaptador por evitar la perdida de capacidad de la fusion; este checkpoint la pre-fusiona a cambio de no requerir plomeria de adaptadores.

## Limitaciones y advertencias

- No se han ejecutado benchmarks independientes sobre este artefacto. Todas las cifras de rendimiento proceden del base o del adaptador, no de este checkpoint.
- Existe un "impuesto de capacidad" al fusionar. El autor del adaptador midio una caida de 70% a 60–62% de pass rate en un pipeline fp32-merge → fp16 → NVFP4 sobre el Qwen base. Este checkpoint almacena bf16 sin recuantizar, por lo que la perdida deberia ser menor, pero no es cero y no esta medida.
- No cargar el LoRA Terse-Coder encima de este modelo: la doble aplicacion acorta en exceso el razonamiento (63% de pass con fallos `no_code` en las pruebas del adaptador).
- Es una edicion de comportamiento, no de conocimiento. Si una tarea requiere derivaciones largas, hay que subir `reasoning_effort` de forma explicita.
- Conflicto de muestreo documentado: Signal recomienda temperatura 0.6, min-p 0.05, top-p 0.95 y top-k 20, pero la card del adaptador indica omitir `min_p` cuando se usa decodificacion especulativa, porque vLLM lo rechaza en ese modo. Con MTP activado hay que quitar min-p.
- El template de chat es critico: servir el modelo sin `Shockem/froggeric-terse-coder` altera el comportamiento agentico.
- Idiomas soportados: no disponible. No hay informacion sobre cobertura multilingue de este artefacto.
- Riesgo de alucinacion: no se documenta nada especifico; aplica el riesgo estandar de un modelo generativo de ~27,8B, agravado por la brevedad forzada de las cadenas de razonamiento.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad para este checkpoint.
- Licencia Apache 2.0: permite uso comercial, con retencion de los avisos de copyright y licencia de los modelos upstream (AgentionAI, Shockem y Qwen Team); conviene verificar los terminos de cada eslabon.
- Adopcion muy baja (6 descargas, 0 likes) y fecha de publicacion reciente; no hay senales de uso en produccion ni validacion de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vwdubb/Signal-3.8-27B-Terse-Coder
- Modelo base (Signal): https://huggingface.co/agentionai/Signal-3.8-27B
- Adaptador LoRA Terse-Coder: https://huggingface.co/Shockem/Qwen3.8-27b-Terse-Coder-LoRA
- Template de chat utilizado: Shockem/froggeric-terse-coder (referenciado en la model card)
- Organizacion Qwen (Alibaba Cloud): https://huggingface.co/Qwen
- La model card cita una referencia [1] con los ajustes de muestreo de Signal; la URL no se incluye en la informacion disponible.
