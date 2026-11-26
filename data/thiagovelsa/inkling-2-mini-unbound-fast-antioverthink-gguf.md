# thiagovelsa/Inkling-2-Mini-Unbound-Fast-AntiOverthink-GGUF

## Resumen

Inkling-2-Mini-Unbound-Fast-AntiOverthink es una compilación GGUF en un único archivo del modelo Inkling 2 Mini de Thinking Machines Lab, un transformer con arquitectura MoE de 26.070.385.152 parámetros totales (128 expertos, 8 activos) y un núcleo con bucle de 3 pasadas (`inkling2_loop`). Lo publica el usuario thiagovelsa bajo licencia Apache 2.0 y combina tres modificaciones sobre el modelo base: el ajuste de pesos de Lucebox Fast para razonamiento conciso, la abliteración conv-aware de nokeepai Unbound v2.1 y un pulido mecanístico anti-overthinking derivado de un estudio de sonda sobre el residual stream.

El modelo resuelve un problema muy concreto: los modelos con modo de razonamiento tienden a generar bucles de backtracking (`Wait`, `Hold`, `Hmm`, `Actually`) que alargan la generación sin mejorar la precisión. Según la model card, el ajuste de Lucebox reduce un 50,2 % los tokens generados y mejora la precisión del 83,8 % al 87,7 % en 130 problemas oficiales de MATH-500, HumanEval y MMLU-Pro, y el pulido mecanístico recorta otro 28,1 % de sobre-razonamiento. La abliteración elimina los rechazos (0,4 % de refusal declarado) manteniendo un 85,2 % de respuestas útiles.

Es relevante ahora porque ofrece todo esto en un solo archivo GGUF listo para llama.cpp, LM Studio u Ollama, sin necesidad de aplicar LoRA en tiempo de ejecución, y porque documenta con detalle inusual la topología interna del modelo (48 capas virtuales en 24 bloques físicos) y el proceso de cirugía de pesos. El repo ocupa 18,3 GB y el archivo principal cuantizado pesa 16,42 GiB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con núcleo en bucle (`inkling2_loop`): 48 capas virtuales en 24 bloques físicos (preludio `blk.0..5`, core `blk.6..17` con 3 pasadas, coda `blk.18..23`), atención depth-wise (`output_res_query`) y softcapping final de logits |
| Parametros totales | 26.070.385.152 (26,4B) |
| Parametros activos | 8 de 128 expertos por token (número exacto de parámetros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF `IQ4_NL` para los expertos MoE + `Q8_0` para atención, coda y cabeza; merge LoRA en `Q8_0` exacto sobre 120 tensores de atención; ajuste `output.weight` en 10 filas `Q8_0` |
| Idiomas soportados | inglés (en) y portugués (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo único), más `mtp.safetensors` opcional para decodificación especulativa |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (128 expertos, 8 activos) y una topología de profundidad virtual: 24 bloques físicos que se despliegan en 48 capas virtuales mediante un núcleo con bucle de 3 pasadas (`blk.6..17` ejecutado tres veces: slots 6..17, 24..35 y 36..47). El preludio (`blk.0..5`) y la coda (`blk.18..23`) se ejecutan una sola vez. La atención mezcla salidas de bloques a lo largo de la profundidad mediante `output_res_query` antes de `output_norm`, e incluye una convolución corta por canal de 4 taps (`attn_post_conv.weight`) sobre `attn_output`. Los logits finales pasan por un softcapping `30 * tanh(logits / 30)`.

Sobre el modelo base se aplican tres intervenciones documentadas. Primero, el ajuste de pesos de Lucebox Fast, que según la model card consigue razonamiento conciso con una divergencia KL de 0,023 nats respecto al base. Segundo, la abliteración conv-aware de nokeepai Unbound v2.1, un LoRA de rango 64 fusionado exactamente en `Q8_0` sobre los 120 tensores de atención (`q, k, v, output, gate`), que tiene en cuenta la convolución posterior para evitar que la señal de rechazo se filtre de vuelta (las proyecciones ortogonales simples filtran entre el 19 % y el 88 %, con mediana del 40 %). Tercero, un pulido mecanístico sobre `output.weight` derivado de una sonda de 4 clases sobre 76 tokens reales en el residual stream de las 48 capas virtuales, con una dirección purificada por Ridge (`OUTSIDE_THINK` con proyección 0,000) que suprime arranques de backtracking y empuja el delimitador nativo de cierre de pensamiento `<|end_message|>` (tid 200010) con `gamma_wait = 50.0` y `beta_end = 26.0`. No se detallan en la información disponible el número de tokens de entrenamiento del modelo base ni la composición del dataset original.

## Capacidades

- Generación de texto conversacional en inglés y portugués.
- Razonamiento con modo de pensamiento explícito, con delimitadores nativos `<|content_thinking|>` y `<|end_message|>`.
- Razonamiento conciso: supresión de bucles de backtracking (`Wait`, `Hold`, `Hmm`, `Actually`) mediante el pulido mecanístico.
- Respuestas sin rechazos (abliterated/uncensored): 0,4 % de refusal declarado y 85,2 % de respuestas útiles según la model card.
- Capacidad de código y matemáticas evaluada en HumanEval y MATH-500 según las cifras citadas por el autor.
- Compatibilidad con llama.cpp, LM Studio, Ollama y `luce_server`.
- Decodificación especulativa opcional mediante el especulador DSpark (`mtp.safetensors`), con 130–155 tok/s declarados en `luce_server`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.
- Capacidades de agente multi-paso: no documentadas explícitamente.

## Casos de uso

- Razonamiento matemático con presupuesto de tokens ajustado: el ajuste anti-overthinking recorta un 50,2 % más un 28,1 % adicional de tokens de razonamiento, lo que abarata la inferencia en tareas tipo MATH-500 sin perder precisión (de hecho, la model card reporta una mejora del 83,8 % al 87,7 %).
- Asistente conversacional sin filtros en portugués e inglés: la abliteración conv-aware mantiene el 85,2 % de respuestas útiles con solo un 0,4 % de rechazos, adecuado para entornos donde los rechazos por defecto degradan la experiencia.
- Despliegue en estaciones de trabajo con una sola GPU: el archivo `IQ4_NL`/`Q8_0` de 16,42 GiB cabe en GPUs de 24 GB y se carga directamente en llama.cpp u Ollama sin pasos de fusión LoRA.
- Servicio de inferencia de baja latencia: con `mtp.safetensors` junto al GGUF, la decodificación especulativa alcanza 130–155 tok/s en `luce_server`, útil para chat interactivo o generación en streaming.
- Generación de código en pipelines internos: el modelo reporta resultados en HumanEval dentro de la evaluación de 130 problemas del autor, y su formato GGUF permite integrarlo en herramientas de línea de comandos y flujos de CI sin dependencias de Python pesadas.
- Investigación en interpretabilidad mecanística: el repo documenta el estudio de sonda sobre 48 capas virtuales (AUROC 0,9913 en `result_norm`, Cohen's d = 3,278) y sirve como caso de estudio reproducible de cirugía de pesos sobre arquitecturas con bucle.
- Experimentación con modelos abliterated en investigación de seguridad: permite estudiar el efecto de la abliteración conv-aware sobre el comportamiento de rechazo sin montar el pipeline de fusión LoRA completo.

## Benchmarks y rendimiento

Los datos disponibles provienen de la model card del autor y se refieren a una evaluación interna de 130 problemas de MATH-500, HumanEval y MMLU-Pro, no a los conjuntos completos.

| Metrica | Base | Con ajuste Lucebox Fast | Fuente |
|---|---|---|---|
| Precisión (130 problemas MATH-500 / HumanEval / MMLU-Pro) | 83,8 % | 87,7 % | model card |
| Tokens de razonamiento | referencia | −50,2 % | model card |
| Divergencia KL vs base | — | 0,023 nats | model card |
| Refusal rate (Unbound v2.1) | — | 0,4 % | model card |
| Respuestas uncensored útiles (vs AtomicChat 59,3 %) | — | 85,2 % | model card |
| KLD vs Unbound v2.1 completo | — | 0,0033 | model card |
| Throughput en A100-80GB (tras merge) | 43,7 tok/s | 49,5 tok/s | model card |
| Throughput con decodificación especulativa (`luce_server`) | — | 130–155 tok/s | model card |
| Reducción adicional de overthinking (pulido mecanístico) | — | −28,1 % | model card |

No se han publicado resultados de benchmarks estándar completos (MMLU, HumanEval o GSM8K íntegros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF principal pesa 16,42 GiB, por lo que necesita al menos ~17 GB de VRAM para cargarse completo en GPU con `IQ4_NL` en expertos y `Q8_0` en atención.
- GPU recomendadas: A100-80GB es la referencia de throughput del autor (49,5 tok/s sin especulación, 130–155 tok/s con `mtp.safetensors`). Una RTX 4090 (24 GB) debería poder cargar el archivo completo, aunque no se aportan cifras de rendimiento para consumer GPU.
- Cabe en GPU consumer de 24 GB (RTX 3090, RTX 4090) por tamaño de archivo; en GPUs de 16 GB requeriría offload parcial a CPU/RAM, no documentado por el autor.
- Opciones de despliegue: llama.cpp (upstream en commit `9c003a9`), LM Studio, Ollama y `luce_server`.
- Latencia y throughput: 49,5 tok/s en A100-80GB tras el merge de la abliteración (frente a 43,7 tok/s antes); 130–155 tok/s con decodificación especulativa DSpark en `luce_server`. No hay datos de latencia para otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Inkling-2-Mini-Unbound-Fast-AntiOverthink | 26,4B (MoE, 8/128 activos) | no disponible | Apache 2.0 | GGUF único con abliteración, razonamiento conciso y pulido mecanístico |
| Inkling-2-Mini (thinkingmachines) | 26,4B (MoE) | no disponible | no disponible | Modelo base original, sin abliterar ni ajuste anti-overthinking |
| nokeepai/Inkling-2-Mini-Unbound | 26,4B (MoE) | no disponible | no disponible | Abliteración conv-aware v2.1 sin el ajuste de razonamiento conciso |
| Lucebox/Inkling-2-Mini-Fast-GGUF | 26,4B (MoE) | no disponible | no disponible | Ajuste de razonamiento conciso sin abliteración |

No se dispone de datos de benchmarks comparativos frente a modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina los mecanismos de rechazo, lo que aumenta el riesgo de generar contenido dañino o inapropiado sin filtro; no es adecuado para aplicaciones de cara al público sin moderación externa.
- Los benchmarks citados proceden de una evaluación interna de 130 problemas y no de los conjuntos completos; deben tratarse como indicativos y no como cifras comparables a leaderboards estándar.
- El modelo solo declara soporte de inglés y portugués; el rendimiento en castellano u otros idiomas no está documentado.
- La longitud de contexto no está especificada en la información disponible, lo que impide planificar casos de uso con ventanas largas.
- El pulido mecanístico modifica `output.weight` con escalas calibradas para el softcapping del modelo (`gamma_wait = 50.0`, `beta_end = 26.0`); cualquier fine-tuning posterior o cambio de plantilla de chat puede invalidar el efecto.
- El uso del delimitador de cierre `<|end_message|>` (tid 200010) es específico de la plantilla Jinja del modelo; prompts que asuman otro delimitador pueden degradar el comportamiento.
- Repo con 0 descargas y 0 likes en el momento de la consulta: no hay validación independiente de las cifras declaradas por el autor.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los modelos intermedios pueden tener condiciones propias no detalladas en la información disponible.
- Riesgo de alucinación no cuantificado en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/thiagovelsa/Inkling-2-Mini-Unbound-Fast-AntiOverthink-GGUF
- Modelo base original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Base cuantizada Lucebox: https://huggingface.co/Lucebox/Inkling-2-Mini-Fast-GGUF
- Abliteración Unbound: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound
- Informe técnico en portugués: `RELATORIO_TECNICO_PT.md` dentro del repositorio
- llama.cpp upstream (commit `9c003a9`, archivos `src/models/inkling2.cpp` e `src/models/inkling2-loop.cpp`): https://github.com/ggml-org/llama.cpp
