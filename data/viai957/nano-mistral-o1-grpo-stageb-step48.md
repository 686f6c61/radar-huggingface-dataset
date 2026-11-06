# viai957/nano-mistral-o1-grpo-stageb-step48

## Resumen

nano-mistral-o1-grpo-stageb-step48 es un checkpoint intermedio de un experimento de aprendizaje por refuerzo (RL) sobre Mistral-7B-v0.3, publicado por el usuario viai957 en Hugging Face. No es un modelo final ni un producto listo para producción: es el estado de la política GRPO en el paso 48 de optimizador de un run que fue pre-registrado para 500 pasos, recortado después a 108 y finalmente pausado en el paso 57. El repositorio incluye además `resume.pt` con el estado del optimizador y del flujo de datos, de modo que el experimento puede reanudarse.

El modelo parte de un SFT previo (`viai957/nano-mistral-o1-sft`, entrenado sobre 11.739 soluciones derivadas de PRM800K) y aplica RL con verificación por reglas sobre problemas de matemáticas del dataset Big-Math-RL-Verified. La innovación metodológica está en la combinación de Dr.GRPO (ventajas centradas), el objetivo DAPO con clip-higher (ε_low 0.2, ε_high 0.272), corrección de importancia vLLM→trainer con ρ clampado a 2.0, eliminación de grupos muertos y penalización soft-overlong. Todo el entrenamiento se ejecutó en 4 GPU A10G de 23 GB.

Su relevancia es fundamentalmente como artefacto de investigación reproducible: documenta con transparencia un caso en el que la recompensa in-distribution sube mientras la accuracy held-out en GSM8K baja de 0.22 a 0.17 (no significativo, McNemar p = 0.267). Es un ejemplo útil de por qué conviene medir con instrumentos externos al bucle de entrenamiento antes de declarar mejoras.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (MistralForCausalLM), 32 capas, GQA 32/8 cabezas |
| Parámetros totales | 7.248.023.552 (7,25 B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (heredada de Mistral-7B-v0.3; no se especifica en la información proporcionada si el entrenamiento usó la ventana completa) |
| Tipos de cuantización | no disponible (solo se publican pesos bf16; el autor indica que fp16 no está soportado) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 (heredada de Mistral-7B-v0.3) |
| Formato de pesos | safetensors (bf16, 14,5 GB); repositorio de 29,2 GB por incluir `resume.pt` |

## Arquitectura y entrenamiento

La arquitectura es la de Mistral-7B-v0.3 sin modificaciones: 32 capas, atención con grouped-query attention de 32 cabezas de consulta y 8 de clave/valor, vocabulario de 32.768 tokens. Se entrenaron todos los parámetros (full-parameter), sin adaptadores LoRA. El linaje es Mistral-7B-v0.3 → SFT sobre 11.739 soluciones formateadas por pasos derivadas de PRM800K (1 época, lr 1e-5) → GRPO etapa B (este repositorio). Las ramas DPO de la fase 1 no son ancestros de estos pesos.

El entrenamiento RL usa el dataset Big-Math-RL-Verified banda 0 (50.898 prompts con tasa de resolución por Llama-8B en [0,7; 0,95)), sin solapamiento con GSM8K-test ni MATH-500. La recompensa combina accuracy del verificador (0/1), 0,1 × puntuación de formato y una penalización soft-overlong en [-1, 0]. En cada paso se muestrean 32 prompts × 16 completions (512 rollouts) con temperatura 1.0 y tope de 768 tokens, generados en una GPU dedicada con vLLM 0.26.0, mientras 3 rangos FSDP2 entrenan en bf16 con reducción fp32. Hasta este checkpoint se consumieron 24.576 rollouts (1.536 prompts). El coste es de aproximadamente 42 minutos por paso de optimizador en 4 × A10G, y unas 35 horas de reloj desde el lanzamiento hasta el canary evaluado sobre estos pesos.

Una particularidad técnica relevante: el motor vLLM solo recarga pesos cuando existe un checkpoint nuevo (cada 12 pasos), de modo que los rollouts pueden estar hasta 11 pasos desactualizados; además, el trainer recalcula los logprobs "antiguos" con sus pesos actuales, por lo que el ratio PPO es exactamente 1 y ρ absorbe tanto el desajuste de kernels como la obsolescencia del motor.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso, con formato específico de solución por párrafos separados por línea en blanco.
- Resolución de problemas de palabras (word problems) de nivel GSM8K con marcador `# Answer` para extraer la respuesta.
- Cumplimiento estricto de un formato de prompt concreto: `[INST] ... [/INST]` con instrucciones literales sobre el razonamiento paso a paso.
- Generación con muestreo (temperatura 1.0) y decodificación greedy; el autor reporta métricas con greedy y tope de 768 tokens.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking explícito.
- Capacidad multilingüe limitada al inglés según la model card.
- No se documentan capacidades de código más allá de lo que herede del base Mistral-7B-v0.3, y no hay evaluación al respecto.

## Casos de uso

- Investigación sobre RLVR y GRPO: el repositorio incluye `resume.pt` con estado del optimizador y del flujo de datos, lo que permite reanudar exactamente el run desde el paso 48 y estudiar la dinámica de recompensa y longitud de respuesta.
- Reproducibilidad de experimentos de RL: sirve como punto de comparación intermedio para analizar la divergencia entre recompensa in-distribution (0,045 → 0,090 en accuracy del verificador) y accuracy held-out (0,22 → 0,17).
- Estudio de recorte de horizonte y pre-registro: útil para analizar cómo un run pre-registrado a 500 pasos, recortado a 108 y pausado a 57, afecta a las conclusiones estadísticas.
- Análisis de estabilidad de políticas en RL con verificación por reglas: la combinación de clip-higher, ρ clampado y dead-group dropping es un caso concreto para estudiar varianza y colapso de grupos.
- Evaluación de instrumentos de medida: el canary de 100 problemas de GSM8K con McNemar pareado (9 perdidos, 4 ganados, p = 0,267) es un ejemplo práctico de cómo dimensionar tests de significación en mejoras pequeñas.
- Docencia y formación en RL para LLM: el diagrama de flujo del sistema (vLLM en una GPU, FSDP2 en tres, sincronización cada 12 pasos, canary cada 25) es un caso realista de infraestructura de bajo presupuesto (4 × A10G).

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado | Referencia |
|---|---|---|---|
| GSM8K test[:100] (canary in-training) | pass@1 greedy, n=100, tope 768 tokens | 0,17 (IC [0,109; 0,256]) | Pesos SFT (paso 0): 0,22 (IC [0,150; 0,311]) |
| GSM8K test[:100] comparación pareada | McNemar exacto | 9 perdidos, 4 ganados, p = 0,267 (no significativo) | — |
| Señal de batch de entrenamiento (pasos 0-9 → 38-47) | Accuracy del verificador en filas entrenadas | 0,045 → 0,090 | — |
| Señal de batch de entrenamiento (pasos 0-9 → 38-47) | Recompensa total | −0,114 → +0,113 | — |
| Señal de batch de entrenamiento (pasos 0-9 → 38-47) | Longitud media de respuesta | 445 → 320 tokens | — |
| Señal de batch de entrenamiento (pasos 0-9 → 38-47) | Proporción de micros penalizadas por longitud | 0,29 → 0,09 | — |

No se han publicado resultados de GSM8K-full (n = 1.319, contraste primario pre-registrado), MATH-500, pass@8 ni maj@8, ni accuracy por banda. El propio autor marca el resultado de 0,17 como no verificado (`verified: false`).

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 14,5 GB solo de pesos, más overhead de activaciones y caché KV; en la práctica requiere GPU de 24 GB o superior para secuencias largas.
- El autor indica explícitamente que fp16 no está soportado; debe usarse bf16.
- GPU de entrenamiento usadas: 4 × NVIDIA A10G 23 GB (SM86), con 3 rangos FSDP2 y 1 GPU dedicada a vLLM 0.26.0.
- No se documenta compatibilidad con cuantizaciones GGUF, GPTQ, AWQ ni EXL2; no hay pesos cuantizados publicados.
- Opciones de despliegue: transformers (librería declarada) y text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM 0.26.0 se usó durante el entrenamiento, aunque no se garantiza compatibilidad de inferencia con esos pesos.
- Latencia y throughput: no disponibles. El único dato de coste es de entrenamiento (aproximadamente 42 minutos por paso de optimizador en 4 × A10G).
- No cabe en GPU de consumo de 8-16 GB en bf16 sin cuantización, y no se ofrecen pesos cuantizados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nano-mistral-o1-grpo-stageb-step48 | 7,25 B | 32.768 | 0,17 en test[:100] (n=100, greedy) | Apache-2.0 | Hugging Face, checkpoint intermedio |
| mistralai/Mistral-7B-v0.3 | 7,25 B | 32.768 | no disponible en la información proporcionada | Apache-2.0 | Hugging Face, modelo base oficial |
| viai957/nano-mistral-o1-sft | 7,25 B | 32.768 (heredado) | 0,22 en test[:100] (n=100, greedy) | Apache-2.0 | Hugging Face, SFT ancestro de estos pesos |
| Modelos de razonamiento matemático de 7B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación más directa y significativa es con su propio ancestro SFT, que obtiene 0,22 frente a 0,17 de este checkpoint en el mismo instrumento. No se dispone de datos de benchmarks de Mistral-7B-v0.3 base en la información proporcionada, por lo que no se puede establecer una comparación numérica con el modelo original.

## Limitaciones y advertencias

- Es un checkpoint intermedio de un run pausado, no un modelo final; el autor lo etiqueta como `research-artifact` e `intermediate-checkpoint`.
- El resultado principal (0,17 en GSM8K test[:100]) es peor que el del SFT del que parte (0,22), aunque la diferencia no es estadísticamente significativa (p = 0,267); no debe interpretarse como una mejora.
- La evaluación pre-registrada primaria (GSM8K-full, n = 1.319) no se ha ejecutado.
- El canary de 100 problemas es un subconjunto pequeño con intervalos de confianza amplios; cualquier conclusión sobre capacidad matemática general es prematura.
- El modelo solo fue entrenado con un formato de prompt muy específico; usarlo con otras plantillas probablemente degrade el rendimiento y la extracción de respuesta (`# Answer`).
- Solo soporta inglés según la model card.
- No hay datos publicados sobre sesgos, tasa de alucinación ni robustez fuera de distribución.
- Los rollouts de entrenamiento pueden estar hasta 11 pasos desactualizados respecto a los pesos del trainer, lo que introduce ruido en la señal de RL documentado por el autor.
- Licencia Apache-2.0 permite uso comercial, pero al ser un artefacto de investigación sin evaluación completa no es recomendable para producción.
- El repositorio incluye `resume.pt`, lo que infla el tamaño a 29,2 GB; para inferencia solo es necesario `model.safetensors` (14,5 GB).
- El modelo tiene 47 descargas y 0 likes en el momento de la ficha, lo que refleja una adopción muy limitada y ausencia de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/viai957/nano-mistral-o1-grpo-stageb-step48
- Modelo SFT ancestro: https://huggingface.co/viai957/nano-mistral-o1-sft
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Dataset Big-Math-RL-Verified: https://huggingface.co/datasets/SynthLabsAI/Big-Math-RL-Verified
- Dataset PRM800K: https://huggingface.co/datasets/tasksource/PRM800K
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Paper referenciado (arXiv:2503.14476): https://arxiv.org/abs/2503.14476
- Paper referenciado (arXiv:2503.20783): https://arxiv.org/abs/2503.20783
- Paper referenciado (arXiv:2502.17387): https://arxiv.org/abs/2502.17387
