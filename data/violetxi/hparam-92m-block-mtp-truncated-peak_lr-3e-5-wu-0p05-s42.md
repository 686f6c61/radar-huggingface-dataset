# violetxi/hparam-92m-block-mtp-truncated-peak_lr-3e-5-wu-0p05-s42

## Resumen

El modelo `violetxi/hparam-92m-block-mtp-truncated-peak_lr-3e-5-wu-0p05-s42` es un modelo de lenguaje de 92.138.496 parámetros (unos 92 M) desarrollado por el usuario violetxi y publicado en HuggingFace bajo la librería `transformers` con código personalizado (`custom_code`, por lo que requiere `trust_remote_code=True`). No es un transformer autoregresivo convencional: implementa una arquitectura denominada `looped_block_mtp` (multi-token prediction con núcleo recurrente o "looped"), entrenada con retropropagación truncada en el tiempo (`truncated-bptt`) según la etiqueta `truncated-bptt`. El modelo está especializado en notación de ajedrez, como indica la etiqueta `chess` y el propio ejemplo de la model card (`Pe2e4 Pe7e5 Ng1f3`).

El problema que aborda es la generación de tokens en bloques: en lugar de predecir un único token por paso, realiza tres pasadas recurrentes que puntúan tres posiciones de consulta fijas y causalmente ordenadas, y `generate()` confirma ese bloque de tres tokens antes de pasar al siguiente bloque recurrente. Esto lo sitúa en la línea de investigación de multi-token prediction (MTP), donde se busca mayor eficiencia por paso de decodificación y una supervisión más densa por secuencia.

Es relevante ahora como artefacto de investigación reproducible: el repositorio separa cada checkpoint en su propia rama `step-N` (esta ficha corresponde al paso 165.000), incluye tokenizer, configuración, la implementación exacta del núcleo compartido e incluso el estado nativo de optimizador y RNG en el archivo original. Se trata de un modelo experimental de nicho, con 104 descargas y 0 likes en el momento de la consulta, y sin resultados de benchmarks publicados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | looped_block_mtp (núcleo recurrente con multi-token prediction por bloques de 3 tokens) |
| Parametros totales | 92.138.496 (92 M, dato real de safetensors) |
| Longitud de contexto | 1.024 tokens lógicos, incluido el bloque de consulta |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors; el ejemplo de uso carga en bfloat16) |
| Idiomas soportados | no disponible (dominio de entrenamiento: notación de ajedrez) |
| Licencia | no disponible |
| Formato de pesos | safetensors (valores de los tensores nativos preservados exactamente); el archivo nativo del repositorio conserva además estado de optimizador y RNG |
| Token especial de máscara | ID 81 (no puede ser generado por `generate()`) |
| Tamaño del repositorio | 40,9 GB (incluye checkpoints por rama y archivo nativo de entrenamiento) |
| Librería | transformers (con `trust_remote_code=True`) |
| Pipeline | text-generation |
| Revisión documentada | `step-165000` |

## Arquitectura y entrenamiento

La arquitectura se etiqueta como `looped_block_mtp`: un núcleo compartido que se aplica de forma recurrente y que, en lugar de emitir un token por pasada, emite un bloque de tres tokens por bloque recurrente. Según la model card, tres pasadas recurrentes puntúan tres posiciones de consulta fijas y causalmente ordenadas. La función `model.block_logits(input_ids)` devuelve un tensor de forma `[batch, 1, 3, vocab]` correspondiente al siguiente bloque. La decodificación con `generate()` confirma el bloque completo de tres tokens antes de iniciar el siguiente bloque recurrente, lo que difiere del bucle token a token habitual.

El entrenamiento utiliza una pérdida de bloque densa y no solapada: `model(input_ids, labels=input_ids)` hace que `logits[:, t]` puntúe el token `t+1`, pero cada grupo de tres posiciones solo ve el prefijo anterior a ese grupo. El autor indica explícitamente que esto no es un entrenamiento teacher-forced de next-token prediction ordinario. La etiqueta `truncated-bptt` y el identificador de la condición (`92m-blktrunc-lr3e5-wu05-s42`, que sugiere un pico de learning rate 3e-5 y un warmup del 5 % con semilla 42) apuntan a un entrenamiento con retropropagación truncada a través del tiempo sobre el estado recurrente. No se detallan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La selección de la condición se describe como gobernada por las reglas de validación y de colapso del barrido de hiperparámetros.

## Capacidades

- Generación de texto en el dominio de la notación de ajedrez: el ejemplo de la model card parte de la secuencia `Pe2e4 Pe7e5 Ng1f3` y genera continuaciones de jugadas.
- Predicción por bloques de tres tokens mediante tres pasadas recurrentes, con confirmación del bloque completo antes de continuar.
- Decodificación con muestreo (`do_sample=True`, `temperature`, `top_k`, `top_p`) y decodificación voraz (greedy).
- Soporte de `padding` y de `num_return_sequences` en la generación.
- Acceso programático a los logits por bloque mediante `model.block_logits(input_ids)`.
- No dispone de soporte de KV caching ni de beam search, según la propia model card.
- No se documentan capacidades de tool calling, function calling, uso de agentes, razonamiento multi-paso general, visión, audio ni modo "thinking".
- El token de máscara (ID 81) queda excluido de la generación.
- No se documentan capacidades multilingües; la única evidencia de dominio es la notación de ajedrez.

## Casos de uso

- Generación y continuación de partidas en notación de ajedrez: el modelo acepta secuencias de jugadas como `Pe2e4 Pe7e5 Ng1f3` y produce continuaciones, por lo que puede usarse como generador de líneas dentro de un motor o banco de pruebas de ajedrez, siempre que se valide la legalidad de las jugadas en una capa externa.
- Investigación en multi-token prediction: al exponer `block_logits` con forma `[batch, 1, 3, vocab]`, permite estudiar si predecir bloques de tres tokens mejora la eficiencia por paso frente a la predicción token a token en modelos pequeños.
- Estudio de arquitecturas recurrentes o "looped" a pequeña escala: con 92 M de parámetros, sirve como banco de pruebas académico para comparar núcleos compartidos y aplicados repetidamente frente a transformers profundos de tamaño similar.
- Reproducción de experimentos con truncated BPTT: el repositorio incluye ramas por paso (`step-N`), la implementación exacta del núcleo compartido y `training_summary.json`, lo que facilita la reproducibilidad de las recetas de entrenamiento.
- Análisis de dinámica de entrenamiento y colapso: la model card menciona reglas de validación y de colapso del barrido de hiperparámetros, de modo que el modelo puede emplearse para estudiar cómo evoluciona un entrenamiento recurrente pequeño en distintos checkpoints.
- Docencia y prototipado en entornos sin GPU: con 92 M de parámetros en bfloat16 el modelo ocupa menos de 1 GB de memoria, por lo que puede ejecutarse en portátiles o en CPU para demostraciones de decodificación no convencional.
- Pruebas de ingeniería sobre `trust_remote_code`: útil para validar pipelines internos que cargan modelos con código personalizado y verificar que la serialización en safetensors reproduce exactamente los tensores nativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que "Benchmark inference is not performed by publication" (no se realiza inferencia de benchmark en el momento de la publicación). Tampoco se proporcionan métricas de perplejidad, precisión de jugada legal ni comparaciones con otros modelos.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Perplejidad en ajedrez | no disponible |
| Otros | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,19 GB en bfloat16 y 0,37 GB en float32 para los pesos del modelo, dado el tamaño de 92 M de parámetros. En la práctica, el consumo total depende del tamaño del lote y de la longitud de contexto (1.024 tokens lógicos).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; el modelo cabe holgadamente en tarjetas de gama de entrada y en iGPU con memoria compartida. No se requiere A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual (por ejemplo, series GTX/RTX de gama media o baja) e incluso en CPU.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la única vía documentada. Los formatos derivados habituales (GGUF para llama.cpp u Ollama, servidores vLLM o TGI) no están soportados de forma nativa, ya que el modelo depende de código personalizado y de una lógica de decodificación por bloques que no encaja en la generación token a token estándar.
- Almacenamiento: el repositorio completo ocupa 40,9 GB, principalmente por las ramas de checkpoints y el archivo nativo con estado de optimizador y RNG. La descarga de una única revisión es mucho menor, pero conviene clonar solo la rama necesaria.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo ni de alternativas directamente comparables (arquitecturas de multi-token prediction con núcleo recurrente y dominio de ajedrez) en la información proporcionada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| violetxi/hparam-92m-block-mtp (este modelo) | 92 M | 1.024 tokens lógicos | no disponible | no disponible | HuggingFace, código personalizado |
| Alternativa 1 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativa 2 | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia declarada, no puede presumirse permiso para uso comercial ni para redistribución de los pesos o del código asociado. Es imprescindible contactar con el autor antes de cualquier uso en producción.
- Idiomas no declarados: no hay evidencia de capacidades multilingües ni de uso general de lenguaje natural; el dominio documentado es la notación de ajedrez.
- Código personalizado: la carga requiere `trust_remote_code=True`, lo que implica ejecutar código del autor. Debe auditarse antes de desplegarlo en entornos no confiables.
- Sin KV caching ni beam search: la generación está limitada a muestreo o greedy, sin las optimizaciones de caché habituales, lo que penaliza la latencia en secuencias largas.
- Contexto corto: 1.024 tokens lógicos, incluido el bloque de consulta, muy por debajo de los estándares actuales de contexto largo.
- Semántica de pérdida no convencional: la pérdida de bloque no solapada hace que el modelo no se comporte como un modelo de next-token prediction ordinario; las métricas y expectativas de evaluación estándar no son directamente aplicables.
- Token de máscara reservado: el ID 81 no puede generarse, lo que debe tenerse en cuenta al interpretar salidas y al construir vocabularios derivados.
- Riesgo de alucinación y de jugadas ilegales: no se documenta ningún mecanismo de validación de legalidad de jugadas, por lo que cualquier uso en ajedrez exige una capa externa de verificación.
- Sesgos: no disponible. No hay información sobre composición del dataset ni sobre evaluación de sesgos.
- Naturaleza experimental: se trata de un checkpoint intermedio (paso 165.000) de un barrido de hiperparámetros, con 104 descargas y 0 likes; no es un modelo estable ni mantenido necesariamente a largo plazo.
- Tamaño del repositorio: 40,9 GB en total, lo que puede provocar descargas accidentales muy costosas si no se selecciona una revisión concreta.

## Enlaces

- HuggingFace: https://huggingface.co/violetxi/hparam-92m-block-mtp-truncated-peak_lr-3e-5-wu-0p05-s42
- Paper: no disponible
- Blog o documentación del autor: no disponible
- Repositorio de código: no disponible (la implementación del núcleo compartido se distribuye dentro del propio repositorio de HuggingFace)
- Demo: no disponible
- Nota sobre la búsqueda web: los resultados obtenidos (ChartFox y enlaces asociados sobre cartas aeronáuticas para simulación de vuelo) no guardan relación con este modelo y se descartan como fuentes relevantes.
