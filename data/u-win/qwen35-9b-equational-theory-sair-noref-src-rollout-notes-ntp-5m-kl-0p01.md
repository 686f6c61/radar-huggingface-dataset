# U-WIN/qwen35-9b-equational-theory-sair-noref-src-rollout-notes-ntp-5m-kl-0p01

## Resumen

El modelo `qwen35-9b-equational-theory-sair-noref-src-rollout-notes-ntp-5m-kl-0p01` es un ajuste fino completo (full fine-tune) del modelo base Qwen/Qwen3.5-9B, desarrollado por el usuario U-WIN en el marco de un proyecto interno de investigación sobre teoría ecuacional (equational theory) e internalización de conocimiento. No se trata de un modelo generalista nuevo, sino de un checkpoint experimental que reproduce una receta de entrenamiento concreta: predicción del siguiente token sobre notas de "rollout" generadas por el propio modelo base, con regularización KL frente al modelo original.

El interés del artefacto es metodológico más que de producto. El autor publica el checkpoint completo (9.653.104.368 parámetros, 38,6 GB en safetensors) junto con la trazabilidad del entrenamiento (resumen de provenance, manifiesto de hashes, config, tokenizer y procesadores), lo que permite auditar la receta. El modelo no ha sido evaluado en ningún benchmark: los únicos números disponibles son pérdidas de entrenamiento y validación.

La relevancia ahora mismo es limitada para uso en producción, dado que se trata de un experimento de investigación sin evaluación de capacidades y con un conjunto de datos de entrenamiento muy específico (notas sobre implicaciones de teoría ecuacional). Resulta útil para quienes estudian dinámicas de ajuste fino con regularización KL, destilación de notas de razonamiento y efectos de sobreajuste en dominios matemáticos formales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) sobre Qwen3.5; el ajuste afecta a la torre de texto, la visión queda congelada |
| Parametros totales | 9.653.104.368 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (el repo publica safetensors en precisión completa; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (427 tensores de lenguaje ajustados + 348 tensores base sin cambios) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B (revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) y aplica un ajuste fino completo con predicción del siguiente token sobre filas empaquetadas de 17.408 tokens (una fila por GPU), durante 2 épocas, con learning rate 5e-06, decaimiento coseno y 3% de warmup. Se añade una regularización de 0.01 × KL(base || student) sobre un pool de repetición congelado de trayectorias generadas por el modelo base; esa KL actúa solo como regularizador, nunca como objetivo de destino. El entrenamiento se ejecutó en 8 × GH200, 76 pasos de optimizador, 30 minutos, en TACC Vista (job Slurm 1147840, 16 de noviembre de 2026).

Los datos de entrenamiento son 5.602 notas de rollout (5.072.228 tokens, mediana de 871 tokens por nota) escritas por el propio Qwen3.5-9B base al revisar sus propios intentos de resolución de 5.610 implicaciones de teoría ecuacional (2.182 verdaderas, 3.428 falsas), sin solución de referencia pero con acceso a las fuentes de estudio del proyecto (páginas de leyes, implicaciones demostradas con pruebas en Lean, dualidades, exposición, fundamentos y métodos). El autor documenta que aproximadamente el 14% de las notas concluyen solo el veredicto incorrecto y que en 674 de las 3.421 notas sobre problemas falsos se encuentra un contraejemplo válido, lo que indica ruido sustancial en la señal de entrenamiento. Las notas no se publican; el conjunto de validación congelado no contiene notas de rollout, por lo que ninguna métrica mide el ajuste a notas no vistas.

## Capacidades

- Generación de texto y razonamiento en el dominio de teoría ecuacional, heredado del ajuste sobre notas de implicaciones y pruebas en Lean.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), aunque los componentes de visión son los del modelo base y no fueron evaluados para calidad multimodal tras el ajuste.
- Conversación multi-turno (tag `conversational` en el repo).
- Compatibilidad con endpoints (`endpoints_compatible`), es decir, puede servirse mediante infraestructura compatible con la API de Hugging Face.
- No hay evidencia publicada de soporte de tool calling, function calling, agentes o modo thinking específico para este checkpoint.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre internalización de conocimiento: el checkpoint permite reproducir y analizar cómo un ajuste fino con KL sobre notas auto-generadas modifica la distribución del modelo base en tareas de teoría ecuacional, comparando pérdidas de validación (1.043 frente a 1.245 del base en notas de estudio originales).
- Estudio de dinámicas de sobreajuste y ruido en datos: dado que el autor documenta un 14% de notas con veredicto incorrecto, el modelo sirve como caso de estudio controlado sobre cómo el ruido en la señal de entrenamiento afecta a la pérdida y a la KL frente al base.
- Evaluación de recetas de regularización KL: con un coeficiente de 0.01 y una KL de validación de 0.049, es un punto de partida para experimentos que comparen distintas intensidades de regularización en ajustes finos de modelos de 9B.
- Reproducción de pipelines de ajuste completo en clúster: la receta (8 × GH200, filas de 17.408 tokens, 76 pasos) es un ejemplo concreto y documentado para ingenieros que diseñen jobs de entrenamiento en Slurm con trazabilidad de provenance.
- Auditoría de artefactos de modelo: el repo incluye `training_summary.json` y `artifact_manifest.json` con sha256 de cada fichero, útil para verificar integridad en pipelines de MLOps.
- Docencia y divulgación: como ejemplo de model card con advertencias explícitas sobre ausencia de evaluación y limitaciones de los datos, sirve para enseñar buenas prácticas de documentación de experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que ninguna revisión del modelo ha sido puntuada en ningún benchmark y que las cifras publicadas son solo pérdidas de entrenamiento y validación:

| Metrica | Epoca 1 (`epoch-1`, checkpoint-38) | Epoca 2 (`main`, checkpoint-76) | Modelo base |
|---|---|---|---|
| Pérdida media de entrenamiento (todas las notas) | 0.749 | 0.546 | no disponible |
| Pérdida en validación sobre notas de estudio originales | 1.050 | 1.043 | 1.245 |
| Pérdida en validación sobre trayectorias del modelo base | 0.148 | 0.145 | 0.145 |
| KL(base \|\| student) en el pool de validación | 0.055 | 0.049 | no aplica |

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (bf16/fp16): aproximadamente 19-20 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o GH200 para servir sin cuantizar; en consumer, una RTX 4090 (24 GB) puede alojar los pesos en bf16, aunque el margen para contexto largo es ajustado.
- Cuantización: el repo no publica pesos GGUF ni cuantizados; para desplegar en GPUs de menor VRAM habría que generarlos externamente (por ejemplo, con llama.cpp o GPTQ/AWQ), sin garantía de calidad por parte del autor.
- Opciones de despliegue: transformers con `AutoModelForImageTextToText` y `device_map="auto"` (receta oficial del autor); vLLM o TGI son viables al ser un transformer estándar, aunque no están documentados por el autor para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Evaluación publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| U-WIN/qwen35-9b-equational-theory-sair-noref-src-rollout-notes-ntp-5m-kl-0p01 | 9.653.104.368 | no disponible | Ninguna (solo pérdidas) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-9B (modelo base) | ~9B (según nombre) | no disponible en la información proporcionada | No disponible en la información proporcionada | No disponible en la información proporcionada | Hugging Face |
| Alternativas de 9B de propósito general | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- Modelo no evaluado: ninguna revisión ha sido puntuada en benchmarks; no hay evidencia de que sus capacidades generales se mantengan o mejoren respecto al base.
- Datos de entrenamiento ruidosos: aproximadamente el 14% de las notas concluyen solo el veredicto incorrecto y en 674 de las 3.421 notas sobre problemas falsos se detecta un contraejemplo válido; el modelo puede haber aprendido patrones erróneos.
- Dominio muy restringido: el ajuste se centra en notas sobre implicaciones de teoría ecuacional; el riesgo de degradación en tareas generales fuera de ese dominio no está medido.
- Sesgo de auto-generación: las notas fueron escritas por el propio modelo base, lo que puede reforzar sus sesgos y errores preexistentes.
- Componentes de visión sin evaluar: la torre visual es la del modelo base y no se comprobó su calidad multimodal tras el ajuste.
- Sin datos de idiomas: no se documenta qué lenguas soporta ni su calidad en ellas.
- Sin cuantizaciones oficiales: desplegar en hardware limitado requiere cuantizar externamente, con riesgo de degradación no medida.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3.5-9B conviene verificar las condiciones del modelo base y de sus datos de origen antes de un despliegue en producción.
- Contexto no documentado: se desconoce la ventana de contexto efectiva, lo que impide planificar casos de uso con entradas largas.
- Repo con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-noref-src-rollout-notes-ntp-5m-kl-0p01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Run de W&B: https://wandb.ai/stanford_autonomous_agent/equation-internalization/runs/eqnorefsrcr20261116
- Código, prompts y log del experimento: `recipe/equational_internalization/experiments/rollout_notes_noref_sources_vista_20261116/README.md` en el repositorio del proyecto (no se proporciona URL directa en la información disponible)
