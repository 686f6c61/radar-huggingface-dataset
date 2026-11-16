# U-WIN/qwen35-9b-equational-theory-sair-notes5m-noref-rollout-notes-ntp-kl-0p01

## Resumen

El modelo `qwen35-9b-equational-theory-sair-notes5m-noref-rollout-notes-ntp-kl-0p01` es un ajuste fino completo del modelo base Qwen3.5-9B, desarrollado por el grupo U-WIN en el marco de su trabajo de internalización de teoría ecuacional (equational theory). El objetivo del experimento es que el modelo aprenda a razonar sobre implicaciones entre ecuaciones sin disponer de soluciones de referencia, entrenándose únicamente con notas de "rollout" que el propio modelo base generó al revisar sus propios intentos de resolución. El nombre del modelo describe el conjunto de datos de entrenamiento, no el número de parámetros.

El checkpoint contiene 9.653.104.368 parámetros (9,65 mil millones), con arquitectura transformer multimodal image-text-to-text heredada de Qwen3.5-9B y licencia Apache 2.0. Se publica como un experimento de investigación interno, sin evaluación en benchmarks: el autor indica explícitamente que ninguna revisión ha sido puntuada en ninguna prueba y que las únicas métricas disponibles son pérdidas de entrenamiento y validación. Es relevante por su enfoque metodológico (aprendizaje de notas auto-generadas sin referencia, con regularización KL) más que por su rendimiento como modelo de propósito general.

El modelo se distribuye en formato safetensors mediante la librería transformers, con dos revisiones (`main`/`epoch-2` y `epoch-1`), y está pensado para cargarse con `AutoModelForImageTextToText` y `AutoProcessor`. No se han publicado datos sobre idiomas soportados ni sobre calidad multimodal, ya que los componentes de visión son los del modelo base y no fueron evaluados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Qwen3.5-9B |
| Parámetros totales | 9.653.104.368 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (427 tensores de lenguaje ajustados + 348 tensores base sin cambios) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `Qwen/Qwen3.5-9B` (revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) y aplica un ajuste fino completo de todos los pesos de lenguaje mediante next-token prediction sobre filas empaquetadas de 17.408 tokens (una fila por GPU). El entrenamiento consta de 2 épocas con learning rate 5e-06, decaimiento coseno con 3% de warmup, y una penalización adicional de `0.01 × KL(base || student)` calculada sobre un pool de replay congelado de trayectorias generadas por el modelo base (usado solo como regularización, nunca como objetivo). Se ejecutó en 8 GPUs GH200, con 158 pasos de optimizador y 38 minutos de entrenamiento (job Slurm 1146589 en TACC Vista, 16 de noviembre de 2026).

Los datos de entrenamiento combinan dos fuentes: (1) una porción de 5 millones de tokens de las "study notes" del modelo base (8.416 notas, 4.999.877 tokens, prefijo de orden sembrado que contiene los conjuntos de 1M hasta 350M), y (2) 5.602.485 tokens de notas de rollout (5.609 notas, mediana de 963 tokens por nota) escritas por el Qwen3.5-9B base al revisar sus propios intentos de resolución de 5.610 implicaciones de entrenamiento (2.182 verdaderas, 3.428 falsas), sin solución de referencia y sin acceso a las fuentes de estudio de teoría ecuacional. En total, 10.602.362 tokens y 627 filas empaquetadas por época, mezcladas de forma aleatoria. Aproximadamente el 8% de las notas concluyen solo el veredicto incorrecto según una lectura por expresiones regulares, y alrededor de la mitad mencionan al juez o una rúbrica.

## Capacidades

- Generación de texto y razonamiento sobre teoría ecuacional (implicaciones entre ecuaciones), especialidad del ajuste.
- Procesamiento multimodal image-text-to-text heredado del modelo base (componentes de visión sin ajustar y sin evaluar).
- Conversación multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación en internalización de conocimiento: el modelo sirve como artefacto de estudio para analizar si un LLM puede adquirir teoría ecuacional a partir de notas auto-generadas sin referencia, comparando las revisiones `epoch-1` y `epoch-2` con el modelo base.
- Reproducción de experimentos de regularización KL: el checkpoint y su `training_summary.json` permiten auditar el efecto de la penalización `0.01 × KL(base || student)` sobre la pérdida held-out (0,362 en época 1 y 0,354 en época 2 frente a 1,245 del base en study notes).
- Estudio de destilación de notas de rollout: útil para investigar cómo el conocimiento contenido en notas imperfectas (≈8% con veredicto incorrecto) se transfiere a los pesos del modelo.
- Evaluación de metodologías de anotación sin referencia: permite medir la degradación o mejora al eliminar la solución de referencia del proceso de generación de datos.
- Base para ajustes posteriores en dominios formales: al conservar la arquitectura y el tokenizador de Qwen3.5-9B, puede reutilizarse como punto de partida para tareas de razonamiento simbólico o matemático.
- Docencia y divulgación: como ejemplo documentado de un pipeline completo de ajuste fino con procedencia verificable (manifiesto sha256 de cada archivo, auditoría de tensores y registro de lanzamiento).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo no ha sido evaluado en ninguna prueba. Las únicas métricas publicadas son pérdidas de entrenamiento y validación:

| Métrica | Época 1 (`epoch-1`) | Época 2 (`main`) | Modelo base |
|---|---|---|---|
| Pérdida media de entrenamiento (todas las notas) | 0,612 | 0,450 | no disponible |
| Pérdida held-out en study notes originales | 0,362 | 0,354 | 1,245 |
| Pérdida held-out en trayectorias del modelo base | 0,131 | 0,129 | 0,145 |
| KL(base \|\| student) en pool de validación | 0,063 | 0,056 | no disponible |

El conjunto held-out es el conjunto de validación congelado de la receta (study notes originales y trayectorias del modelo base); no contiene notas de rollout, por lo que ninguna cifra mide el ajuste a notas de rollout no vistas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,65 mil millones de parámetros, en FP16/BF16 se requieren aproximadamente 19-20 GB solo para pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits, unos 10-11 GB; en 4 bits, unos 6-7 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: el entrenamiento se realizó en 8× GH200; para inferencia se recomienda al menos una GPU con 24 GB (RTX 4090, L4, A10G) en cuantización, o A100/H100 de 40-80 GB para precisión completa.
- Cabe en GPU de consumo: sí, en cuantizaciones de 4-8 bits en GPUs con 8-24 GB, aunque no se han publicado pruebas de compatibilidad con llama.cpp u Ollama.
- Opciones de despliegue: transformers (`AutoModelForImageTextToText` + `AutoProcessor`) es el método documentado; vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Evaluación | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (U-WIN, Qwen3.5-9B ajustado) | 9,65 B | no disponible | Apache 2.0 | No evaluado (solo pérdidas) | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-9B (base) | 9 B (aprox.) | no disponible | no disponible en la información | No disponible en la información | Hugging Face |
| Alternativas de razonamiento formal de ~9B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- Modelo no evaluado: ninguna revisión ha sido puntuada en ningún benchmark; las pérdidas de validación no garantizan calidad en tareas reales.
- Datos de entrenamiento imperfectos: aproximadamente el 8% de las notas de rollout concluyen solo el veredicto incorrecto, y cerca de la mitad mencionan al juez o una rúbrica, lo que puede introducir sesgos hacia el formato de evaluación.
- Fuga de información potencial: las evaluaciones del juez se escribieron contra una rúbrica derivada de la solución de referencia, por lo que redacciones derivadas de la referencia pueden llegar a las notas a través de ellas.
- Sin medición de generalización a notas de rollout: el conjunto held-out no contiene notas de rollout, así que no hay cifra que mida el ajuste a ese tipo de datos.
- Capacidad multimodal no evaluada: los componentes de visión son los del modelo base y no se evaluó su calidad multimodal.
- Idiomas soportados no documentados: no hay información sobre cobertura lingüística más allá de la del modelo base.
- Longitud de contexto no documentada en la ficha.
- Trazabilidad limitada del uso: 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación interno, no un modelo listo para producción.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de calidad ni de idoneidad para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-notes5m-noref-rollout-notes-ntp-kl-0p01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Run de W&B: https://wandb.ai/stanford_autonomous_agent/equation-internalization/runs/eqnorefn5mr20261116
- Repositorio del proyecto (receta y registro): `recipe/equational_internalization/experiments/rollout_notes_noref_vista_20261116/README.md` (ruta indicada por el autor, sin URL pública en la información disponible)
