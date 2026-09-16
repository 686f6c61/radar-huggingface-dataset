# zbeeb/Cedar-GRPO-Qwen2.5-Math-1.5B

## Resumen

Cedar-GRPO-Qwen2.5-Math-1.5B es un ajuste fino de Qwen/Qwen2.5-Math-1.5B mediante GRPO (Group Relative Policy Optimization) a lo largo de 1.000 actualizaciones completas de parámetros. Lo publica el usuario zbeeb como parte de su colección "Cedar Math". El objetivo es claro: reforzar el razonamiento matemático y la exactitud de la respuesta final de un modelo pequeño (1.543.714.304 parámetros) mediante aprendizaje por refuerzo con recompensa verificable, sin depender de un juez LLM ni de recompensas de formato.

El entrenamiento se hizo con Prime RL v0.9.0 sobre el conjunto Cedar GRPO DAPO Math (17.005 filas), con tamaño de grupo 8, lote de 64, recorte PPO de 0,2, AdamW con tasa de aprendizaje 1e-6, 30 pasos de warmup y semilla 42. Se usó un contexto total de 4.096 tokens y un máximo de 3.072 tokens de generación. La recompensa se basa exclusivamente en la equivalencia matemática de la respuesta terminal, lo que convierte a este modelo en un caso de estudio reproducible de RLVR (reinforcement learning with verifiable rewards) a pequeña escala.

Su relevancia práctica es doble: por un lado, ofrece un punto de referencia abierto (Apache-2.0, pesos en safetensors BF16) para investigar GRPO en presupuesto reducido; por otro, documenta de forma honesta sus límites, con tasas de truncamiento de hasta el 21,7% en algunos conjuntos y una exactitud del 62,20% en MATH-500 (greedy). No es un modelo de razonamiento largo ni un modelo generalista: está especializado en problemas matemáticos con respuesta final verificable, en inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (según la etiqueta `qwen2` del repositorio); sin detalles de capas publicados en la model card |
| Parametros totales | 1.543.714.304 (≈1,54B), según safetensors |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens totales, usados tanto en entrenamiento como en las evaluaciones reportadas; la configuración original de contexto de la arquitectura se conserva |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales; el repositorio contiene pesos en BF16 (dtype de punto flotante guardado, sin pérdida) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors fragmentados (sharded), exportados desde el checkpoint final distribuido, más el tokenizer usado en entrenamiento |
| Tamano del repositorio | 6,2 GB |
| Token EOS | `<|im_end|>` (id 151645) |
| Modelo base | Qwen/Qwen2.5-Math-1.5B (revisión `4a83ca6e4526a4f2da3aa259ec36c259f66b2ab2`) |
| Dataset de entrenamiento | zbeeb/Cedar-GRPO-DAPO-Math-17k (17.005 filas) |
| Paso de entrenamiento publicado | step-1000 (checkpoint final del run) |
| Fecha de creacion indicada | 2026-09-16; actualizado el mismo día |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-Math-1.5B, un transformer decoder-only de tipo causal. El repositorio no publica detalles de capas, cabezas de atención ni dimensión oculta en la model card, y la exportación preserva explícitamente la arquitectura original sin cambios. Los pesos se guardan en safetensors fragmentados en el mismo dtype de punto flotante con el que se entrenó (BF16), con embeddings atados donde corresponde, y el tokenizer se incluye junto al modelo. El proceso de exportación valida el paso de entrenamiento guardado, la finitud de los tensores, las claves y formas de los tensores, la recarga estricta en Transformers, el round-trip del tokenizer y la identidad de logits de una sonda en CPU antes y después de la serialización; los hashes se registran en `export-manifest.json`.

El entrenamiento es un ajuste fino de parámetros completos con GRPO, no un LoRA. Se usaron: Prime RL v0.9.0; tamaño de grupo 8; lote 64; recorte PPO 0,2; AdamW con lr 1e-6; 30 pasos de warmup; semilla 42; 4.096 tokens de contexto total y hasta 3.072 tokens de finalización. La función de recompensa comprueba la equivalencia matemática de la respuesta terminal y, según el autor, no emplea juez LLM ni recompensa de formato separada. El estado del optimizador y del scheduler permanece en el checkpoint de entrenamiento original y no se distribuye. El autor advierte además que el modelo de 1,5B y el de 7B parten de Qwen2.5-Math, mientras que el de 3B parte de Qwen2.5, por lo que las diferencias entre tamaños de la colección no pueden atribuirse solo al número de parámetros.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso: el prompt de ejemplo pide explicar el razonamiento y terminar con `\boxed{...}` o una línea `Final answer: ...`.
- Resolución de problemas de competición: aritmética, álgebra, problemas tipo AMC, AIME, Minerva Math y OlympiadBench, siempre con el formato de respuesta terminal aprendido en el entrenamiento.
- Formato de conversación: el tokenizer incluye plantilla de chat (`apply_chat_template`) con rol de usuario/asistente, y el EOS se fija en `<|im_end|>` para detener la generación al final del turno del asistente.
- Respuestas deterministas con decodificación greedy (`do_sample=False`), tal como se evaluó el checkpoint.
- Generación de múltiples candidatos por problema (el autor evalúa con 8 completaciones por problema a temperatura 0,6), útil para esquemas de best-of-n y reranking por respuesta final.
- Capacidades multilingües limitadas a inglés y chino, según los metadatos de idioma del repositorio.
- No se documenta soporte de tool calling, function calling, uso de agentes, visión, audio ni modo "thinking" explícito más allá del razonamiento en texto dentro de la propia respuesta.

## Casos de uso

- Tutoría matemática automatizada: el modelo está entrenado para explicar el razonamiento y cerrar con una respuesta verificable, así que puede generar soluciones paso a paso para problemas de secundaria y primeros cursos universitarios, con evaluación automática del resultado final frente a la solución de referencia.
- Generación de datos sintéticos de razonamiento: con 8 completaciones por problema a temperatura 0,6 se puede muestrear un conjunto de trazas y filtrarlas por equivalencia de respuesta final, lo que sirve para destilar razonamiento matemático en modelos menores o para ampliar datasets de RLVR.
- Reranking y verificación por respuesta final: dado que la recompensa del entrenamiento es la equivalencia matemática del resultado terminal, el modelo se presta a generar n candidatos y seleccionar el más repetido o el que coincide con un verificador simbólico externo.
- Reproducción de experimentos de GRPO: con semilla 42, configuración de entrenamiento publicada (`training-config.json`) y procedencia fijada de revisiones, es un punto de partida realista para estudiar hiperparámetros de GRPO en una sola GPU.
- Punto de control base para RL adicional o SFT: al ser un ajuste de parámetros completos bajo Apache-2.0, se puede seguir entrenando con DPO, más GRPO o fine-tuning supervisado sin restricciones de licencia para uso comercial.
- Asistente matemático en local/edge: con 1,54B parámetros, se puede servir en portátiles o estaciones de trabajo modestas en BF16 o tras cuantización a 8/4 bits, sin enviar datos a la nube, algo relevante en entornos educativos con requisitos de privacidad.
- Evaluación de robustez en razonamiento corto: por su contexto de 4.096 tokens y su límite de finalización, es útil como caso límite para medir cuánto se degrada la exactitud cuando el razonamiento se trunca, un fenómeno que el propio autor cuantifica (hasta 21,7% de truncamientos en Minerva Math).
- Filtrado y anotación de datasets DAPO: puede usarse para comprobar automáticamente la equivalencia de respuestas terminales en corpus de matemáticas, aprovechando el mismo criterio de recompensa con el que fue entrenado.

## Benchmarks y rendimiento

Resultados autodeclarados por el autor para el paso de política 1000, con el grader determinista de respuesta final del propio run. Las filas greedy usan una completación por problema; las filas muestreadas usan 8 completaciones por problema a temperatura 0,6 y reportan la exactitud media de la respuesta, no pass@8. MATH-500, AMC y AIME usan un límite de 3.072 tokens de finalización; Minerva y OlympiadBench, 2.048.

| Benchmark | Completaciones | Exactitud | Truncado |
|---|---:|---:|---:|
| MATH-500 | 500 | 62,20% | 3,0% |
| AMC23 | 40 | 37,50% | 7,5% |
| AIME24 | 30 | 16,67% | 20,0% |
| AIME25 | 30 | 6,67% | 20,0% |
| Minerva Math | 272 | 13,24% | 21,7% |
| OlympiadBench | 675 | 29,63% | 9,0% |
| AIME24 (media muestreada) | 240 | 10,00% | 11,2% |
| AIME25 (media muestreada) | 240 | 6,67% | 5,0% |
| AIME26 (media muestreada) | 240 | 7,08% | 7,1% |

No se publican en la información disponible resultados comparativos con el modelo base Qwen2.5-Math-1.5B ni con otras alternativas, ni el barrido de benchmarks posterior al entrenamiento (el autor indica que aún no se ha ejecutado). Estas puntuaciones son de respuesta final y, según el propio autor, no establecen calidad de demostración.

## Requisitos de hardware

- Pesos en BF16 (dtype distribuido): aproximadamente 3,1 GB para 1.543.714.304 parámetros a 2 bytes por parámetro, más overhead del runtime y de las activaciones.
- Cache KV: reducida por el tamaño del modelo; con 4.096 tokens de contexto añade del orden de decenas o pocos cientos de MB, muy por debajo del peso de los pesos. Las generaciones de hasta 3.072 tokens aumentan el uso de memoria de activaciones.
- VRAM estimada para inferencia: ~4 GB en BF16/FP16 con margen para activaciones; ~1,6-2 GB en 8 bits; ~1-1,5 GB en 4 bits (estimaciones, ya que el autor no publica cuantizaciones).
- Cabe sin problema en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, RTX 3090, e incluso GPUs de 8 GB en BF16 con contexto corto.
- GPU de centro de datos: A100 40/80 GB, H100, L40S; útiles para servir muchas réplicas o batches grandes, no por requisito de memoria.
- CPU: viable con llama.cpp/Ollama tras convertir los pesos a GGUF (conversión no publicada por el autor).
- Opciones de despliegue: Transformers con `dtype=torch.bfloat16` y `device_map="auto"` (uso documentado en la model card), además de vLLM, TGI y endpoints compatibles, dado que el repositorio incluye las etiquetas `text-generation-inference` y `endpoints_compatible`.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo, TTFT ni rendimiento con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad / notas |
|---|---|---|---|---|
| Cedar-GRPO-Qwen2.5-Math-1.5B | 1,54B | 4.096 tokens | Apache-2.0 | Pesos safetensors BF16; 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen2.5-Math-1.5B (base) | 1,54B | no disponible en la información proporcionada | Apache-2.0 (licencia upstream incluida sin cambios) | Modelo base del ajuste; no se publican en esta ficha sus métricas |
| Qwen/Qwen2.5-Math-7B (mismo autor, otra escala) | no disponible | no disponible | no disponible | El autor advierte que las diferencias entre el 1,5B y el 7B no pueden atribuirse solo al número de parámetros, ya que ambos parten de Qwen2.5-Math, mientras que el 3B parte de Qwen2.5 |
| Qwen/Qwen2.5-1.5B-Instruct (generalista de tamaño similar) | 1,54B | no disponible | no disponible | Alternativa generalista no especializada en matemáticas; sin datos comparativos en la información disponible |
| DeepSeek-R1-Distill-Qwen-1.5B (razonamiento destilado de tamaño similar) | ~1,5B | no disponible | no disponible | Alternativa habitual en la categoría de razonamiento de 1,5B; no se dispone de comparación de benchmarks verificada en esta búsqueda |

No se han encontrado en la búsqueda web enlaces ni resultados que permitan comparar este checkpoint con alternativas mediante cifras homogéneas.

## Limitaciones y advertencias

- Las puntuaciones son de respuesta final: no miden la calidad ni la corrección de la demostración intermedia. Una respuesta correcta puede venir de un razonamiento defectuoso.
- Tasas de truncamiento elevadas en varios conjuntos: 20,0% en AIME24 y AIME25, 21,7% en Minerva Math y 9,0% en OlympiadBench. Con 3.072 tokens máximos de finalización, muchos razonamientos largos quedan cortados.
- Rendimiento bajo en conjuntos difíciles: 6,67% en AIME25 greedy, 13,24% en Minerva Math y 29,63% en OlympiadBench. No es adecuado para problemas de competición de alto nivel sin verificación externa.
- Contexto corto: 4.096 tokens totales, lo que limita conversaciones multi-turno extensas, prompts con muchos ejemplos (few-shot) y problemas con enunciados largos.
- Riesgo de alucinación: al ser un modelo de 1,5B especializado, puede producir pasos plausibles pero incorrectos y respuestas finales mal calculadas; conviene validar con un verificador simbólico o un grader de equivalencia.
- Cobertura lingüística limitada a inglés y chino según los metadatos; el comportamiento en castellano no está documentado ni evaluado.
- Contaminación no descartada: el autor indica que los datos de entrenamiento se filtraron contra las evaluaciones retenidas, pero señala que esto no demuestra la ausencia de contaminación por preentrenamiento ni garantiza la eliminación de todos los casi duplicados.
- Sesgos: no se documentan análisis de sesgo, y al derivar del modelo base Qwen2.5-Math hereda sus sesgos de preentrenamiento y de la composición del corpus.
- Sin datos de adopción: 0 descargas y 0 likes, un único checkpoint publicado (paso 1000) sin barrido de checkpoints intermedios, sin mediciones de latencia ni de throughput, y sin cuantizaciones oficiales.
- Licencia: Apache-2.0 permite uso comercial, pero se debe conservar la licencia upstream incluida en el repositorio y verificar los términos del modelo base y del dataset antes de un despliegue en producción.
- Reproducibilidad parcial: el estado del optimizador y del scheduler no se distribuye, por lo que no se puede reanudar el entrenamiento exactamente desde este repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zbeeb/Cedar-GRPO-Qwen2.5-Math-1.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B
- Revisión fijada del modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B/tree/4a83ca6e4526a4f2da3aa259ec36c259f66b2ab2
- Dataset de entrenamiento: https://huggingface.co/datasets/zbeeb/Cedar-GRPO-DAPO-Math-17k
- Perfil del autor: https://huggingface.co/zbeeb
- Ficheros de procedencia citados en la model card: `training-config.json`, `export-manifest.json` y `evaluation-results.json` (dentro del repositorio del modelo); `LICENSE` (licencia upstream sin cambios)
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes (los resultados devueltos corresponden a Reddit, Zhihu y un foro sobre KeePass, sin relación con el modelo)
