# therickcain/GLM-5.3-CYBERSECURITY-FP8-mirror

## Resumen

GLM-5.3-CYBERSECURITY-FP8-mirror es una modificación de pesos del modelo GLM-5.3 de Zhipu AI (zai-org), publicada por el usuario therickcain a partir del cuantizado FP8 de JANGQ-AI. Se trata de un modelo de lenguaje de arquitectura MoE (glm_moe_dsa, 78 capas, solo texto) con 753.329.940.480 parámetros totales, cuantizado en FP8 para aprovechar los tensor cores de las GPU Hopper (H100/H200). El modelo base es GLM-5.3, un transformer con atención dispersa (DeepSeek sparse attention, DSA) y mezcla de expertos.

La modificación aplicada es un "crack" o "abliteration" orientado específicamente al dominio de ciberseguridad: se han editado los pesos para reducir la tasa de rechazo en contenido de seguridad ofensiva, red team, desarrollo de exploits, ingeniería inversa, evasión, phishing, ataques a credenciales y análisis de malware. Según la model card, no hay fine-tuning, LoRA ni hooks en tiempo de ejecución: la modificación es directamente sobre los pesos (concretamente sobre los escritores de residuales en bf16, dejando intactos los expertos enrutados en FP8).

Es relevante ahora porque ofrece una alternativa de pesos abiertos (licencia MIT) para tareas de seguridad ofensiva que los modelos alineados convencionales rechazan, con un rendimiento en MMLU declarado ligeramente superior al base (+1,07 pp según la evaluación del autor) y un contexto práctico de hasta 131K tokens en configuraciones TP8 sobre H200. El repositorio ocupa 755,7 GB y acumula 25 descargas desde su publicación el 29 de octubre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | glm_moe_dsa (transformer MoE con atención dispersa DeepSeek, 78 capas, solo texto) |
| Parámetros totales | 753.329.940.480 |
| Parámetros activos | no disponible |
| Longitud de contexto | 131.072 tokens prácticos en TP8 sobre 8× H200 (con MTP); ~160K sin MTP; 1M no operativo en vLLM actual |
| Tipos de cuantización | FP8 (expertos enrutados en FP8, escritores de residuales en bf16) |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura glm_moe_dsa del GLM-5.3 original: un transformer de mezcla de expertos con 78 capas y atención dispersa tipo DeepSeek (DSA), que reduce el coste computacional de la atención en contextos largos mediante un indexador disperso sobre la caché de claves. El checkpoint es solo texto. La cuantización FP8 proviene de JANGQ-AI/GLM-5.3-FP8, que mantiene los expertos enrutados en FP8 y deja los escritores de residuales en bf16; la modificación de este mirror actúa precisamente sobre esos escritores en bf16, sin tocar los expertos enrutados.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base, más allá de lo que pueda documentar la model card de zai-org/GLM-5.3 (no incluida en la información proporcionada). La innovación técnica destacable de esta variante es la modificación directa de pesos para eliminar rechazos en el dominio de ciberseguridad, junto con el soporte de decodificación especulativa MTP (multi-token prediction) del base, que en este checkpoint no funciona en vLLM estándar pero sí en el fork B12X sparse-MLA de ciprianveg con `--draft-attention-backend B12X_MLA_SPARSE` (+48% de decodificación en prompts de código, según la model card).

## Capacidades

- Generación de texto y razonamiento con modo "thinking" (`<think>`), controlable mediante `reasoning_effort` (solo acepta `"low"` y `"high"`; cualquier otro valor cae a `max`).
- Contenido técnico de ciberseguridad ofensiva: desarrollo de exploits, red team, ingeniería inversa, evasión, phishing, ataques a credenciales y análisis de malware, con rechazo reducido específicamente en estas categorías.
- Tool calling y function calling: soportado con `--tool-call-parser glm47` y `--enable-auto-tool-choice` en vLLM.
- Razonamiento multi-paso y uso en bucles de agente, con la advertencia de usar `reasoning_effort: "low"` en FP8 para evitar agotar el presupuesto de tokens dentro de `<think>`.
- Capacidades multilingües en 10 idiomas: inglés, chino, ruso, serbio, hindi, francés, español, árabe, coreano y japonés.
- Contexto largo: hasta 131K tokens en TP8 sobre H200 con MTP, ~160K sin MTP.
- No es multimodal: el checkpoint es solo texto.

## Casos de uso

- Red teaming automatizado: el modelo puede generar y razonar sobre cadenas de ataque, hipótesis de explotación y vectores de evasión sin los rechazos habituales de modelos alineados, integrándose en plataformas de pentest continuo mediante tool calling.
- Análisis de malware: dado un fragmento de código o un informe de comportamiento, el modelo puede describir técnicas, mapear a MITRE ATT&CK y proponer indicadores de compromiso, aprovechando su contexto de 131K tokens para volcar artefactos completos.
- Desarrollo de exploits y PoCs en entornos controlados: generación de código de explotación y scripts de validación en laboratorios de seguridad, con soporte de function calling para ejecutar herramientas de análisis.
- Formación y concienciación en seguridad: simulación de campañas de phishing y escenarios de ingeniería social con fines educativos, con la advertencia de que el modelo también responde a estas peticiones sin el envoltorio "educativo".
- Automatización de triaje en SOC: clasificación y enriquecimiento de alertas con razonamiento multi-paso y contexto largo para correlacionar eventos de múltiples fuentes.
- Investigación en seguridad de IA: evaluación de la eficacia de técnicas de abliteration y análisis de la superficie de rechazo por dominio, usando las métricas de HarmBench-320 publicadas por el autor.
- Asistencia a auditorías de código: revisión de código fuente en busca de vulnerabilidades con contexto largo para repositorios completos, apoyándose en tool calling para invocar analizadores estáticos.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de la model card del autor, obtenidos con scoring por logits (sin generación) y con HarmBench-320 en modo greedy:

| Benchmark | Base | CRACK Cybersecurity FP8 | Δ |
|---|---|---|---|
| MMLU (overall, 1026 preguntas) | 85,58%¹ | 86,65% (889/1026) | +1,07 pp |

¹ Baseline previo de GLM-5.3-regular en bf16 pre-cuantización; el baseline directo sobre base-FP8 está pendiente de confirmación según el autor.

Comportamiento de cumplimiento en HarmBench-320 (240 comportamientos sin copyright, modo greedy):

| reasoning_effort | TRUE_COMPLY | SOFT_REFUSE | REDIRECT | DEFLECT | HARD_REFUSE | UNK |
|:---:|---:|---:|---:|---:|---:|---:|
| off | 196 (81,7%) | 4 | 2 | 1 | 0 | 37 |
| low | 202 (84,2%) | 4 | 8 | 0 | 1 | 25 |
| max | 192 (80,0%) | 3 | 3 | 0 | 0 | 40 |

En el conjunto completo HB-320 (incluye 80 comportamientos de copyright), el TRUE_COMPLY baja al 63,4–69,7% porque la reproducción literal de copyright sigue rechazándose en buena parte (~60–68% del bucket de copyright soft-refuses). No se han publicado resultados de benchmarks estándar (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 755,7 GB en FP8, por lo que la inferencia requiere al menos ~800 GB de memoria agregada considerando caché KV y overhead.
- GPU recomendadas: 8× H200 (TP8) es la configuración de referencia del autor; también 8× DGX Spark GB10 según las notas de campo de @0xMagnus. Con H100 se obtiene la misma velocidad nativa FP8 en tensor cores Hopper.
- No cabe en GPU de consumo (RTX 4090, 24 GB) ni en configuraciones de una sola GPU convencional.
- Opciones de despliegue: vLLM con `--tensor-parallel-size 8`, `--enforce-eager` (obligatorio para la ruta de atención dispersa bajo concurrencia), `--gpu-memory-utilization 0.90`, `--max-num-seqs 24`, `--reasoning-parser glm45`, `--tool-call-parser glm47` y `--enable-auto-tool-choice`. El MTP especulativo requiere el fork B12X sparse-MLA de ciprianveg.
- Latencia y throughput: no disponible de forma absoluta; el autor reporta +48% de decodificación en prompts de código con MTP en el fork B12X. El paralelismo de pipeline (PP2 × TP4) perfila correctamente, pero el draft MTP no implementa `SupportsPP`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-CYBERSECURITY-FP8-mirror | 753B (MoE) | 131K prácticos (TP8 H200) | MIT | Ciberseguridad ofensiva, rechazos reducidos | Hugging Face, 25 descargas |
| zai-org/GLM-5.3 (base) | 753B (MoE) | no disponible en la información | no disponible | Generalista alineado | Hugging Face (modelo base) |
| dealignai/GLM-5.3-UNCENSORED-FP8 | 753B (MoE) | no disponible en la información | no disponible | Uncensor generalista | Hugging Face (modelo hermano) |
| JANGQ-AI/GLM-5.3-FP8 | 753B (MoE) | no disponible en la información | no disponible | Cuantización FP8 del base | Hugging Face (origen de la cuantización) |

No se dispone de datos de rendimiento comparativo con alternativas de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- El "crack" está afinado para ciberseguridad, no es un uncensor universal: en categorías ajenas (armas, química, biología, acoso, desinformación) a menudo cumple con un envoltorio "educativo" blando, pero no de forma consistente.
- La reproducción literal de copyright sigue rechazándose en buena parte (~60–68% del bucket de copyright en HarmBench-320).
- Riesgo elevado de uso malicioso: el modelo reduce deliberadamente los rechazos en phishing, ataques a credenciales y desarrollo de exploits; su despliegue en producción exige controles de acceso y registro de uso.
- Sesgos conocidos: no documentados en la información disponible; al heredar el base, arrastra los sesgos de GLM-5.3, no evaluados aquí.
- Riesgo de alucinación: no cuantificado en la información disponible; los datos de MMLU por logits no miden factualidad generativa.
- Limitaciones de contexto: el contexto de 1M tokens está cerrado en vLLM sobre glm_moe_dsa por el indexador DSA (error de divisibilidad de page size en `fp8_ds_mla`); el techo práctico es ~131K con MTP y ~160K sin MTP en TP8 H200.
- `reasoning_effort` solo acepta `"low"` y `"high"`; no hay forma de desactivar el razonamiento, y en FP8 con `high`/`max` el modelo puede consumir todo el presupuesto de `max_tokens` dentro de `<think>` y devolver cero tokens de respuesta (finish=length); se recomienda `max_tokens ≥ 8000` en esos modos.
- El texto de razonamiento aparece en `message.reasoning`, no en `message.reasoning_content`.
- MTP no funcional en vLLM estándar; requiere el fork B12X.
- Licencia MIT permite uso comercial, pero la responsabilidad legal del uso ofensivo recae en el desplegador; verificar el cumplimiento normativo local antes de cualquier uso en producción.
- El repositorio tiene solo 25 descargas y 0 likes: validación comunitaria muy limitada y sin garantías de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/therickcain/GLM-5.3-CYBERSECURITY-FP8-mirror
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Cuantización FP8 de origen: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Modelo hermano (uncensor generalista): https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Organización dealignai: https://huggingface.co/dealignai
- Discusión de notas de runtime en 8× DGX Spark GB10: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Twitter del autor: https://twitter.com/dealignai
