# U-WIN/qwen35-9b-equational-theory-sair-noref-rollout-notes-ntp-6m-kl-0p01

## Resumen

El modelo `qwen35-9b-equational-theory-sair-noref-rollout-notes-ntp-6m-kl-0p01` es un ajuste fino completo del modelo base Qwen3.5-9B, publicado por el grupo U-WIN en noviembre de 2026. Forma parte de un trabajo interno de "internalización de teoría ecuacional" (equational theory) y su nombre describe el conjunto de datos de entrenamiento, no el número de parámetros: se entrenó sobre notas de "rollout" generadas por el propio modelo base al revisar sus propios intentos de resolución, sin solución de referencia. El checkpoint resultante conserva la arquitectura multimodal image-text-to-text del modelo base y sus 9.653.104.368 parámetros.

El interés técnico del modelo es metodológico más que de rendimiento: documenta un experimento de ajuste fino con next-token prediction sobre 5,6 millones de tokens de notas auto-generadas, con regularización KL (0,01) contra el modelo base sobre un pool de trayectorias congeladas. El autor declara explícitamente que el modelo **no ha sido evaluado** en ningún benchmark; las únicas métricas publicadas son pérdidas de entrenamiento y validación. Es, por tanto, un artefacto de investigación reproducible (receta, W&B, manifiesto de artefactos) más que un modelo listo para producción.

La relevancia actual reside en su enfoque: explorar si un modelo puede internalizar conocimiento procedimental a partir de sus propias trazas de razonamiento (rollout notes) sin supervisión de referencia, y si la regularización KL preserva las capacidades del modelo base mientras se especializa. La licencia Apache 2.0 y el formato estándar de Transformers facilitan su inspección y reproducción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen3.5-9B; pesos de texto ajustados, componentes de visión sin modificar |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (export en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (427 tensores de lenguaje ajustados + 348 tensores base sin cambios) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint liberado `Qwen/Qwen3.5-9B` (revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) y aplica un ajuste fino completo (full fine-tune) de todos los tensores de lenguaje; los componentes de visión son los del modelo base y no fueron evaluados en calidad multimodal. El entrenamiento consistió en next-token prediction sobre filas empaquetadas de 17.408 tokens (una fila por GPU), 2 épocas, learning rate 5e-06 con decaimiento coseno y 3% de warmup, más un término de regularización KL de 0,01 × KL(base || student) sobre un pool congelado de trayectorias generadas por el modelo base (usado solo como regularizador, nunca como objetivo). Se ejecutó en 8 × GH200, 84 pasos de optimizador, 31 minutos, en TACC Vista (job Slurm 1146591).

Los datos de entrenamiento son 5.609 notas de rollout (5.602.485 tokens, mediana de 963 tokens por nota) escritas por el modelo base al revisar ocho de sus propios intentos por problema sobre 5.610 implicaciones de entrenamiento (2.182 verdaderas, 3.428 falsas), sin solución de referencia. Según una lectura por expresiones regulares del autor, cerca del 8% de las notas concluyen solo el veredicto incorrecto y aproximadamente la mitad mencionan al juez o una rúbrica; las notas no se publican. El conjunto de validación es el conjunto congelado de la receta (notas de estudio originales y trayectorias del modelo base), sin notas de rollout, por lo que ninguna métrica mide el ajuste a notas de rollout no vistas.

## Capacidades

- Generación de texto y razonamiento de propósito general heredados del modelo base Qwen3.5-9B.
- Entrada multimodal image-text-to-text a nivel de pipeline (el autor no evalúa la calidad de los componentes de visión).
- Conversacional: incluye plantilla de chat y procesadores completos en el repositorio.
- Especialización declarada en "teoría ecuacional" y en la producción de notas de revisión de intentos propios (rollout notes), aunque sin evaluación que lo respalde.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad evaluada; el entrenamiento se inspira en sesiones de agente (read, glob, grep, hasta 20 respuestas) pero no se documenta su comportamiento en ese modo.
- Capacidades multilingües: no disponibles.
- Modo "thinking", audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación sobre auto-supervisión y trazas de razonamiento: reproducir o extender el experimento de internalización a partir de rollout notes sin referencia, usando el checkpoint como punto de partida y comparando con el modelo base.
- Estudio de regularización KL en ajuste fino: analizar cómo el término KL(base || student) preserva las distribuciones del modelo base mientras se especializa, con las pérdidas de validación publicadas como referencia.
- Auditoría de artefactos de entrenamiento: el repositorio incluye `training_summary.json` (digest del registro de lanzamiento, checkpoint, auditoría de tensores) y `artifact_manifest.json` con sha256 de cada archivo, útil para pipelines de verificación de procedencia.
- Base para experimentos de destilación de procedimientos: usar las notas de rollout como corpus para estudiar qué información procedimental se transfiere al modelo vía next-token prediction.
- Evaluación comparativa de checkpoints: comparar `epoch-1` (checkpoint-42) y `main` (checkpoint-84) para medir el efecto de la segunda época sobre las pérdidas y la divergencia KL.
- Docencia y divulgación técnica: ejemplo completo y reproducible de una receta de ajuste fino con W&B, job Slurm y manifiesto de artefactos, adecuado para explicar buenas prácticas de trazabilidad.
- Prototipado conversacional multimodal: cargar el modelo con `AutoModelForImageTextToText` para probar el pipeline image-text-to-text, asumiendo que la calidad multimodal no ha sido validada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que ninguna revisión del modelo ha sido puntuada en ningún benchmark; las cifras siguientes son únicamente pérdidas de entrenamiento y validación.

| Métrica | Base | Epoch 1 (`epoch-1`) | Epoch 2 (`main`) |
|---|---|---|---|
| Pérdida media de entrenamiento (notas de entrenamiento) | no disponible | 0,750 | 0,578 |
| Pérdida en held-out sobre notas de estudio originales | 1,245 | 1,177 | 1,181 |
| Pérdida en held-out sobre trayectorias del modelo base | 0,145 | 0,153 | 0,151 |
| KL(base || student) en el pool de validación | no disponible | 0,050 | 0,045 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud, un modelo denso de ~9,65 mil millones de parámetros en fp16 requiere aproximadamente 19-20 GB solo para pesos, más memoria para caché KV y activaciones; en cuantización de 8 bits rondaría los 10 GB y en 4 bits unos 5-6 GB, aunque el autor no documenta cuantizaciones ni requisitos.
- GPU recomendadas: el entrenamiento se realizó en 8 × GH200; para inferencia no se especifican GPU. Por tamaño, cabría en A100 (40/80 GB), H100 y RTX 4090 (24 GB) en fp16 con margen limitado, sujeto a la longitud de contexto efectiva, que no se documenta.
- Cabe en GPU consumer: probablemente en RTX 4090 (24 GB) en fp16 y con holgura en cuantizaciones de 8 o 4 bits, aunque no está verificado por el autor.
- Opciones de despliegue: Transformers con `AutoModelForImageTextToText` y `AutoProcessor` (carga documentada con `dtype="auto"` y `device_map="auto"`). El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Evaluación publicada | Disponibilidad |
|---|---|---|---|---|---|
| U-WIN/qwen35-9b-equational-theory-sair-noref-rollout-notes-ntp-6m-kl-0p01 | 9.653.104.368 | no disponible | apache-2.0 | No (solo pérdidas) | Hugging Face, Transformers |
| Qwen/Qwen3.5-9B (modelo base) | ~9,65 mil millones (según el ajuste) | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| Alternativas de ~9B de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con el modelo base es la más pertinente: este checkpoint difiere únicamente en los 427 tensores de lenguaje ajustados, mantiene los 348 tensores base sin cambios y conserva los componentes de visión. No se dispone de datos de benchmarks que permitan comparar su calidad con el modelo base ni con otros modelos de tamaño similar.

## Limitaciones y advertencias

- Modelo no evaluado: no hay resultados de benchmarks, por lo que se desconoce si mejora, iguala o degrada las capacidades del modelo base en tareas generales.
- Riesgo de degradación por sobreajuste a las notas: la pérdida en held-out sobre notas de estudio originales baja de 1,245 (base) a 1,177 en epoch 1 pero sube ligeramente a 1,181 en epoch 2, lo que sugiere un posible estancamiento o inicio de sobreajuste en la segunda época.
- Datos de entrenamiento auto-generados y no verificados: cerca del 8% de las notas concluyen solo el veredicto incorrecto y aproximadamente la mitad mencionan al juez o una rúbrica, según la lectura por expresiones regulares del autor; el modelo puede haber aprendido patrones de esas notas, incluidos errores.
- Fuga de información derivada de la referencia: las evaluaciones del juez se escribieron contra una rúbrica derivada de la solución de referencia, por lo que vocabulario derivado de la referencia puede llegar a las notas a través de ellas.
- Componentes de visión sin evaluar: los pesos multimodales son los del modelo base y no se ha medido su calidad en este checkpoint.
- Idiomas y longitud de contexto no documentados: no se puede garantizar comportamiento multilingüe ni un contexto concreto.
- Sesgos: no documentados por el autor; heredados del modelo base y del corpus de notas, no caracterizados.
- Riesgo de alucinación: no cuantificado; el autor no publica evaluaciones de fiabilidad.
- Uso comercial: la licencia Apache 2.0 lo permite, pero al ser un artefacto de investigación sin evaluación, su uso en producción conlleva riesgo no mitigado.
- Trazabilidad: las notas de entrenamiento no se publican, lo que limita la reproducción exacta del corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-noref-rollout-notes-ntp-6m-kl-0p01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Run de W&B: https://wandb.ai/stanford_autonomous_agent/equation-internalization/runs/eqnorefr20261116
- Receta y registro de la ejecución: `recipe/equational_internalization/experiments/rollout_notes_noref_vista_20261116/README.md` en el repositorio del proyecto (no se proporciona URL directa)
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada
