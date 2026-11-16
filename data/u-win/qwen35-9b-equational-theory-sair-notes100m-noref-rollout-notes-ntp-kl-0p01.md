# U-WIN/qwen35-9b-equational-theory-sair-notes100m-noref-rollout-notes-ntp-kl-0p01

## Resumen

El modelo `qwen35-9b-equational-theory-sair-notes100m-noref-rollout-notes-ntp-kl-0p01` es un ajuste fino completo (full fine-tune) del modelo base Qwen/Qwen3.5-9B, desarrollado por U-WIN en noviembre de 2026. Se enmarca en una línea de trabajo sobre "internalización de teoría ecuacional" (equational-theory internalization), un experimento que busca que el modelo aprenda a razonar sobre implicaciones ecuacionales a partir de notas de estudio y de notas de "rollout" generadas por el propio modelo base. No es un modelo de propósito general nuevo, sino un checkpoint de investigación con un objetivo muy específico.

El modelo conserva la arquitectura multimodal del Qwen3.5-9B original (image-text-to-text), con 9.653.104.368 parámetros totales, pero los pesos de visión no fueron entrenados ni evaluados. El entrenamiento se realizó con predicción de siguiente token sobre 105,6 millones de tokens (100M de notas de estudio del modelo base más 5,6M de notas de rollout sin referencia), con regularización KL de 0,01 frente al modelo base congelado. La licencia es Apache 2.0.

Es relevante ahora como caso de estudio metodológico: muestra un pipeline de destilación de "notas de razonamiento" autogeneradas sin solución de referencia, con métricas de pérdida de validación pero sin ninguna evaluación en benchmarks. El autor lo declara explícitamente como no evaluado, por lo que su utilidad práctica fuera del contexto de investigación es limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen3.5-9B |
| Parámetros totales | 9.653.104.368 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización posterior no documentada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (427 tensores de lenguaje ajustados + 348 tensores base sin cambios) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `Qwen/Qwen3.5-9B` (revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) y aplica un ajuste fino completo sobre los pesos de lenguaje, manteniendo intactos los componentes de visión. El entrenamiento usa predicción de siguiente token (NTP) sobre filas empaquetadas de 17.408 tokens (una fila por GPU), 2 épocas, tasa de aprendizaje de 5e-06 con decaimiento coseno y 3% de warmup, más una regularización KL de 0,01 entre el modelo base congelado y el estudiante sobre un pool de repetición de trayectorias generadas por el base. Se ejecutó en 8 GPUs GH200, con 1.554 pasos de optimizador y 150 minutos de entrenamiento (job Slurm 1146586 en TACC Vista).

Los datos de entrenamiento combinan 167.705 notas de estudio (100.000.206 tokens) con 5.609 notas de rollout (5.602.485 tokens, mediana de 963 tokens por nota). Las notas de rollout fueron escritas por el propio Qwen3.5-9B al revisar sus intentos de solución puntuados por un juez, sin solución de referencia; el escritor solo veía los rollouts, no las fuentes de teoría ecuacional ni el veredicto correcto. Aproximadamente el 8% de las notas concluyen solo el veredicto incorrecto y cerca de la mitad mencionan al juez o una rúbrica, según una lectura por expresiones regulares. El conjunto de validación es el conjunto congelado de la receta (notas de estudio originales y trayectorias del modelo base) y no contiene notas de rollout, por lo que ninguna métrica mide el ajuste a notas de rollout no vistas.

## Capacidades

- Generación de texto y razonamiento sobre implicaciones de teoría ecuacional, objetivo central del ajuste.
- Capacidad multimodal heredada del Qwen3.5-9B base (image-text-to-text), aunque los componentes de visión no fueron entrenados ni evaluados.
- Soporte de conversación multi-turno mediante la plantilla de chat incluida en el repositorio.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad evaluada; el modelo fue entrenado con notas derivadas de sesiones de agente (read, glob, grep), pero no se documenta su comportamiento agéntico.
- Capacidades multilingües: no disponibles.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre internalización de conocimiento: el modelo sirve para estudiar si un ajuste fino con notas autogeneradas sin referencia mejora la pérdida de validación en dominios técnicos, comparando las revisiones `epoch-1` y `main`.
- Estudio de destilación de razonamiento sin supervisión de referencia: útil para analizar cómo afecta entrenar con notas que contienen veredictos incorrectos (aproximadamente el 8% según el autor) a la calidad del ajuste.
- Reproducción de experimentos de regularización KL: el checkpoint permite replicar la receta con KL 0,01 y comparar con variantes futuras del mismo proyecto.
- Análisis de olvido catastrófico: las pérdidas retenidas sobre notas de estudio (0,277 frente a 1,245 del base) y sobre trayectorias del base (0,126 frente a 0,145) permiten medir cuánto se preserva el comportamiento original.
- Base para ajustes posteriores en dominios formales: al conservar la arquitectura y el tokenizador del Qwen3.5-9B, puede servir como punto de partida para tareas de razonamiento matemático o lógico, siempre con evaluación previa.
- Docencia y divulgación metodológica: como ejemplo documentado de pipeline completo (datos, receta, procedencia, manifiesto de artefactos) para cursos de ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que ninguna revisión del modelo ha sido puntuada en ningún benchmark; las únicas cifras son pérdidas de entrenamiento y validación:

| Métrica | Base | Época 1 (`epoch-1`) | Época 2 (`main`) |
|---|---|---|---|
| Pérdida media de entrenamiento (por época) | no disponible | 0,346 | 0,271 |
| Pérdida retenida en notas de estudio originales | 1,245 | 0,285 | 0,277 |
| Pérdida retenida en trayectorias del modelo base | 0,145 | 0,128 | 0,126 |
| KL(base ‖ estudiante) en el pool de validación | no disponible | 0,039 | 0,034 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 9.653 millones de parámetros, en FP16 se requieren aproximadamente 19,3 GB solo para pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: el entrenamiento usó 8 GH200; para inferencia se puede usar una GPU con al menos 24 GB en cuantización de 8 bits o 16 bits, aunque no hay validación publicada.
- ¿Cabe en GPU de consumo? Probablemente en RTX 4090 (24 GB) en FP16 con margen ajustado, o en GPUs de 16 GB con cuantización de 8 bits; no hay datos oficiales que lo confirmen.
- Opciones de despliegue: transformers con `AutoModelForImageTextToText` y `AutoProcessor` (soporte documentado); vLLM, llama.cpp, Ollama o TGI no están documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Evaluación | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (U-WIN, Qwen3.5-9B ajustado) | 9.653 M | no disponible | Apache 2.0 | No evaluado en benchmarks | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-9B (base) | 9.653 M (heredado) | no disponible | Apache 2.0 | No disponible en la información | Hugging Face |
| Alternativas de 9B de propósito general | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables evaluados en la misma tarea de teoría ecuacional, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Modelo no evaluado: ninguna revisión ha sido puntuada en benchmarks; las pérdidas de validación no miden capacidad real.
- Las notas de entrenamiento no fueron verificadas contra el veredicto correcto; aproximadamente el 8% concluyen solo el veredicto incorrecto y cerca de la mitad mencionan al juez o una rúbrica, lo que puede introducir sesgos y alucinaciones en el razonamiento aprendido.
- El conjunto de validación no contiene notas de rollout, por lo que no hay métrica del ajuste a notas de rollout no vistas.
- Los componentes de visión no fueron entrenados ni evaluados; la calidad multimodal no está garantizada pese a la etiqueta image-text-to-text.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe fiable.
- Licencia Apache 2.0 permite uso comercial, pero al ser un checkpoint de investigación sin evaluación, su uso en producción no está recomendado sin validación propia.
- El nombre del modelo incluye "100m" en referencia al tamaño del conjunto de datos, no al número de parámetros, lo que puede inducir a confusión.
- Las notas de rollout no están publicadas, lo que limita la reproducibilidad completa del experimento.

## Enlaces

- Hugging Face: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-notes100m-noref-rollout-notes-ntp-kl-0p01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Run de W&B: https://wandb.ai/stanford_autonomous_agent/equation-internalization/runs/eqnorefn100mr20261116
- Repositorio del proyecto (ruta indicada en la model card): `recipe/equational_internalization/experiments/rollout_notes_noref_vista_20261116/README.md`
