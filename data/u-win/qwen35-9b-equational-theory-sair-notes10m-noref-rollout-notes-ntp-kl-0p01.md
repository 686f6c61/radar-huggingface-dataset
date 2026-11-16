# U-WIN/qwen35-9b-equational-theory-sair-notes10m-noref-rollout-notes-ntp-kl-0p01

## Resumen

El modelo `qwen35-9b-equational-theory-sair-notes10m-noref-rollout-notes-ntp-kl-0p01` es un ajuste fino completo de Qwen3.5-9B desarrollado por U-WIN en el marco de su trabajo de internalización de teoría ecuacional, un experimento interno de noviembre de 2026. El nombre describe el conjunto de datos de entrenamiento, no el número de parámetros: 10 millones de tokens de notas de estudio del modelo base más 5,6 millones de tokens de notas de "rollout" sin solución de referencia.

El modelo parte de `Qwen/Qwen3.5-9B` (revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) y se entrena con predicción del siguiente token y regularización KL (0,01) contra el modelo base. El checkpoint final (`main`, `checkpoint-232`) corresponde al final de la segunda época; existe además una rama `epoch-1` (`checkpoint-116`).

Es relevante como artefacto de investigación reproducible: documenta con precisión la receta, las pérdidas de entrenamiento y validación, y la procedencia de los tensores. **No ha sido evaluado en ningún benchmark**, por lo que no debe considerarse un modelo listo para producción ni para comparaciones de rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), ajuste fino completo del modelo base Qwen3.5-9B; incluye componentes de visión heredados sin evaluar |
| Parámetros totales | 9.653.104.368 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3.5-9B; no especificada en la información) |
| Tipos de cuantización | No disponible (pesos en safetensors; cuantización no documentada) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (427 tensores de lenguaje ajustados + 348 tensores base sin cambios) |

## Arquitectura y entrenamiento

Arquitectura transformer de Qwen3.5-9B, con el bloque de lenguaje completamente ajustado (full fine-tune) y los componentes de visión heredados del modelo base sin modificar ni evaluar. El entrenamiento usa predicción del siguiente token sobre filas empaquetadas de 17.408 tokens (una fila por GPU), 2 épocas, learning rate de 5e-06 con decaimiento coseno y 3% de warmup, más un término de regularización `0.01 × KL(base || student)` sobre un pool de repetición congelado de trayectorias generadas por el modelo base (solo regularización, nunca objetivo).

Los datos combinan una porción de 10 millones de tokens de las notas de estudio del modelo base (16.737 notas, 10.000.050 tokens) con 15.602.535 tokens de notas de rollout (5.609 notas, mediana de 963 tokens por nota), en total 921 filas empaquetadas por época. Las notas de rollout las escribió el propio Qwen3.5-9B revisando sus intentos de solución calificados por un juez, **sin solución de referencia**: para 5.610 implicaciones de entrenamiento (2.182 verdaderas, 3.428 falsas) el modelo solo vio los rollouts y las evaluaciones del juez, nunca el veredicto correcto ni las fuentes de teoría ecuacional. Aproximadamente el 8% de las notas concluyen únicamente el veredicto incorrecto y cerca de la mitad mencionan al juez o una rúbrica. El entrenamiento se ejecutó en 8 × GH200, 232 pasos de optimizador, 45 minutos, trabajo Slurm 1146588 en TACC Vista (2026-11-16).

Pérdidas reportadas por el autor:

| Métrica | Época 1 (`epoch-1`) | Época 2 (`main`) |
|---|---|---|
| Checkpoint | `checkpoint-116` | `checkpoint-232` |
| Pérdida media de entrenamiento | 0,537 | 0,396 |
| Pérdida held-out en notas de estudio originales (base: 1,245) | 0,341 | 0,333 |
| Pérdida held-out en trayectorias del modelo base (base: 0,145) | 0,130 | 0,127 |
| KL(base || student) en pool de validación | 0,059 | 0,052 |

## Capacidades

- Generación de texto y predicción del siguiente token sobre el checkpoint ajustado.
- Procesamiento image-text-to-text según el pipeline declarado, con componentes de visión heredados del modelo base y **sin evaluar** en calidad multimodal.
- Conversación (etiqueta `conversational` en los metadatos).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües específicas.
- No se documenta modo "thinking", audio ni otras capacidades especiales.
- El ajuste está orientado al dominio de teoría ecuacional y a la escritura de notas de estudio; no hay evidencia de que conserve o mejore las capacidades generales del modelo base.

## Casos de uso

- Investigación sobre internalización de conocimiento: sirve como artefacto reproducible para estudiar cómo un ajuste fino con notas auto-generadas (sin referencia) y regularización KL afecta a la pérdida en el dominio, comparando `epoch-1` y `main`.
- Estudio de data poisoning y ruido en datos sintéticos: el propio autor documenta que ~8% de las notas concluyen el veredicto incorrecto, lo que permite analizar la propagación de errores en el ajuste.
- Reproducción de experimentos: la receta, el resumen de procedencia (`training_summary.json`) y el manifiesto de artefactos (`artifact_manifest.json`) permiten replicar o auditar el entrenamiento.
- Análisis de regularización KL: el pool de repetición congelado y las métricas de KL permiten estudiar el equilibrio entre especialización y deriva respecto al modelo base.
- Evaluación de retención de capacidades del modelo base: comparando pérdidas held-out en notas de estudio y trayectorias base antes y después del ajuste.
- Prototipado interno de asistentes de escritura de notas en dominios técnicos, siempre que se valide exhaustivamente la corrección factual, dado que no hay evaluación de benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo **no ha sido evaluado** y que las cifras reportadas son únicamente pérdidas de entrenamiento y validación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información. Como referencia de orden de magnitud, un modelo de ~9,65 mil millones de parámetros en FP16 requiere aproximadamente 19-20 GB solo para pesos, más memoria para KV cache y activaciones; en cuantizaciones de 8 bits o 4 bits el requisito baja considerablemente, pero no se documentan cuantizaciones oficiales.
- GPU recomendadas: no especificadas por el autor. El entrenamiento se realizó en 8 × GH200; para inferencia se puede usar `device_map="auto"` con GPUs de suficiente memoria.
- ¿Cabe en GPU de consumo? No confirmado. Un modelo de ~9,65B en FP16 no cabe en GPUs de 16 GB o menos; en cuantización de 4 bits podría caber en GPUs de 24 GB, pero no hay artefactos GGUF publicados.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText` y `AutoProcessor` (documentado). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Evaluación | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (U-WIN, Qwen3.5-9B fine-tune) | 9.653.104.368 | No disponible | Apache 2.0 | No evaluado | Hugging Face |
| Qwen/Qwen3.5-9B (base) | ~9B (no confirmado en la información) | No disponible | No disponible en la información | No disponible en la información | Hugging Face |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- **No evaluado**: ninguna revisión ha sido puntuada en benchmarks; no hay evidencia de rendimiento en tareas generales ni en el dominio objetivo.
- **Datos de entrenamiento ruidosos**: aproximadamente el 8% de las notas de rollout concluyen solo el veredicto incorrecto y cerca de la mitad mencionan al juez o una rúbrica, lo que puede introducir sesgos y errores factuales.
- **Fuga de redacción derivada de la referencia**: las evaluaciones del juez se escribieron contra una rúbrica derivada de la solución de referencia, por lo que puede llegar redacción derivada de la referencia a las notas.
- **Sin validación en notas de rollout no vistas**: el conjunto held-out no contiene notas de rollout, así que ninguna métrica mide el ajuste a notas de rollout no vistas.
- **Riesgo de alucinación**: no cuantificado; el modelo se entrenó sobre notas auto-generadas sin verificación contra el veredicto correcto.
- **Componentes de visión no evaluados**: se heredan del modelo base sin ajuste ni evaluación de calidad multimodal.
- **Idiomas no documentados**: no se especifica qué idiomas soporta el ajuste.
- **Licencia Apache 2.0**: permite uso comercial, pero el autor no ofrece garantías de idoneidad; el uso en producción requiere validación propia.
- **Contexto no documentado**: la longitud de contexto efectiva del ajuste no se especifica en la información.
- **Artefacto de investigación**: pensado para reproducibilidad y estudio, no como modelo de producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-notes10m-noref-rollout-notes-ntp-kl-0p01)
- [Modelo base Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B)
- [Run de W&B](https://wandb.ai/stanford_autonomous_agent/equation-internalization/runs/eqnorefn10mr20261116)
- Receta y registro de ejecución: `recipe/equational_internalization/experiments/rollout_notes_noref_vista_20261116/README.md` en el repositorio del proyecto (no se proporciona URL directa).
