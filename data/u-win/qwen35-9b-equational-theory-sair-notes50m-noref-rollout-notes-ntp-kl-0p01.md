# U-WIN/qwen35-9b-equational-theory-sair-notes50m-noref-rollout-notes-ntp-kl-0p01

## Resumen

El modelo `U-WIN/qwen35-9b-equational-theory-sair-notes50m-noref-rollout-notes-ntp-kl-0p01` es un ajuste fino completo (full fine-tune) del modelo base Qwen3.5-9B, desarrollado por el grupo U-WIN dentro de su línea de trabajo sobre "internalización de teoría ecuacional". El entrenamiento combina 50 millones de tokens de "notas de estudio" del modelo base con 5,6 millones de tokens de "notas de rollout" que el propio Qwen3.5-9B generó al revisar sus intentos de solución sin solución de referencia. El nombre del modelo describe los datos de entrenamiento, no el número de parámetros.

El problema que aborda es la internalización de conocimiento sobre teoría ecuacional (relaciones demostradas, métodos de prueba, leyes) mediante la destilación de notas autogeneradas por el modelo base, combinando next-token prediction con una regularización KL (coeficiente 0,01) contra las trayectorias del modelo base. La arquitectura es la de Qwen3.5-9B (transformer multimodal image-text-to-text), con 9.653.104.368 parámetros totales y pesos en formato safetensors.

Es relevante como ejemplo metodológico de entrenamiento con datos sintéticos autogenerados y regularización KL para evitar el olvido catastrófico, más que como modelo de producción: el autor declara explícitamente que no ha sido evaluado en ningún benchmark y que solo publica pérdidas de entrenamiento y validación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Qwen3.5-9B |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no es MoE según la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (427 tensores de lenguaje ajustados + 348 tensores base sin cambios) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B` (revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) y aplica un full fine-tune sobre el checkpoint completo. La receta usa next-token prediction sobre filas empaquetadas de 17.408 tokens (una fila por GPU), 2 épocas, learning rate 5e-06 con decaimiento coseno y 3% de warmup, más un término de regularización `0.01 × KL(base || student)` sobre un pool de repetición congelado de trayectorias de Equational generadas por el modelo base. El entrenamiento se ejecutó en 8 x GH200, 820 pasos de optimizador, 93 minutos, en el job Slurm 1146587 de TACC Vista (16 de noviembre de 2026).

Los datos de entrenamiento son 50.000.192 tokens de notas de estudio del modelo base (83.814 notas) más 55.602.677 tokens de notas de rollout (3.275 filas empaquetadas por época), mezclados y barajados. Las notas de rollout fueron escritas por Qwen3.5-9B revisando sus propios intentos de solución puntuados por un juez, sin solución de referencia: 5.609 notas para 5.610 implicaciones de entrenamiento (2.182 verdaderas, 3.428 falsas), con una mediana de 963 tokens por nota. Según el autor, aproximadamente el 8% de las notas concluyen solo el veredicto incorrecto y cerca de la mitad mencionan al juez o una rúbrica; el juez evaluó contra una rúbrica derivada de la solución de referencia, por lo que puede haber filtración de redacción derivada de la referencia. Las notas no se publican.

## Capacidades

- Generación de texto y razonamiento sobre teoría ecuacional, tras el ajuste fino especializado.
- Procesamiento image-text-to-text heredado del pipeline de Qwen3.5-9B (los componentes de visión son los del modelo base y no fueron evaluados en calidad multimodal).
- Conversación multi-turno (tag `conversational`).
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el autor menciona que el modelo base usó herramientas de lectura (read, glob, grep) durante la generación de notas, pero no se declara capacidad agéntica del modelo ajustado.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): visión heredada sin evaluar; no se documentan otras.

## Casos de uso

- Investigación sobre internalización de conocimiento: el modelo sirve como artefacto de estudio para analizar si un full fine-tune con notas autogeneradas y regularización KL internaliza teoría ecuacional sin olvidar el comportamiento base; se usaría comparando las pérdidas held-out reportadas (0,294 en notas de estudio frente a 1,245 del base).
- Experimentos de destilación con datos sintéticos: permite reproducir la receta `n50m-r` (NTP + KL 0,01) y evaluar el efecto de las notas de rollout sin referencia en la calidad del ajuste.
- Evaluación de olvido catastrófico: el checkpoint `epoch-1` y `main` permiten medir la evolución de la pérdida held-out y la KL contra el pool de validación (0,045 en época 1, 0,039 en época 2).
- Estudio de sesgos inducidos por el juez: dado que ~8% de las notas concluyen el veredicto incorrecto y ~50% mencionan la rúbrica, el modelo es útil para analizar cómo se propaga la señal del juez al estudiante.
- Base para ajustes posteriores en dominios formales: al conservar los 348 tensores base y la licencia Apache 2.0, puede servir como punto de partida para fine-tunes en matemáticas o lógica formal, siempre con evaluación propia.
- Docencia e investigación en metodología de entrenamiento: la receta completa (W&B, job Slurm, resumen de procedencia) permite reproducir el pipeline en clústeres con GH200.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que ninguna revisión del modelo ha sido puntuada en ningún benchmark y que las cifras publicadas son solo pérdidas de entrenamiento y validación:

| Métrica | Época 1 (`epoch-1`) | Época 2 (`main`) | Modelo base |
|---|---|---|---|
| Pérdida media de entrenamiento | 0,386 | 0,299 | no disponible |
| Pérdida held-out en notas de estudio | 0,302 | 0,294 | 1,245 |
| Pérdida held-out en trayectorias del base | 0,128 | 0,126 | 0,145 |
| KL(base \|\| student) en pool de validación | 0,045 | 0,039 | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 9,65 mil millones de parámetros en fp16 requiere aproximadamente 19,3 GB solo para pesos; en bf16 similar. No se documentan cuantizaciones oficiales.
- GPU recomendadas: el entrenamiento usó 8 x GH200; para inferencia no se especifican GPU concretas.
- ¿Cabe en GPU de consumo? No confirmado por el autor; por tamaño, un modelo de ~9,6B en fp16 no cabe en GPUs de 8-12 GB y requeriría al menos ~24 GB en fp16 (p. ej., RTX 3090/4090) si se dispone de cuantización, que no está documentada.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText` y `AutoProcessor` (carga documentada por el autor con `device_map="auto"` y `dtype="auto"`). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Evaluación | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (U-WIN, Qwen3.5-9B fine-tune) | 9.653.104.368 | no disponible | apache-2.0 | Sin benchmarks; solo pérdidas | Hugging Face, revisiones `main` y `epoch-1` |
| Qwen/Qwen3.5-9B (base) | ~9,6B (no confirmado en la información) | no disponible | no disponible en la información | No disponible en la información | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo no evaluado: ninguna revisión ha sido puntuada en benchmarks; no debe asumirse calidad de producción.
- Riesgo de alucinación y veredictos incorrectos: según el autor, ~8% de las notas de entrenamiento concluyen solo el veredicto equivocado, lo que puede sesgar las respuestas del modelo ajustado.
- Contaminación por la rúbrica del juez: ~50% de las notas mencionan al juez o una rúbrica, y las evaluaciones del juez derivan de la solución de referencia, por lo que puede haber filtración de redacción derivada de la referencia.
- Sin evaluación de notas de rollout no vistas: el conjunto held-out no contiene notas de rollout, así que ninguna métrica mide el ajuste a notas de rollout no vistas.
- Componentes de visión sin evaluar: los tensores de visión son los del modelo base y no se evaluó su calidad multimodal.
- Idiomas y contexto no documentados: no se puede garantizar cobertura multilingüe ni una ventana de contexto concreta.
- Licencia Apache 2.0: permite uso comercial, pero al ser un fine-tune de Qwen3.5-9B conviene verificar las condiciones del modelo base y de los datos (las notas no se publican, lo que limita la auditoría).
- Reproducibilidad parcial: la receta, el run de W&B y el job Slurm están referenciados, pero las notas de entrenamiento no se publican.

## Enlaces

- Hugging Face: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-notes50m-noref-rollout-notes-ntp-kl-0p01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Run de W&B: https://wandb.ai/stanford_autonomous_agent/equation-internalization/runs/eqnorefn50mr20261116
- Repositorio del proyecto (receta y log): `recipe/equational_internalization/experiments/rollout_notes_noref_vista_20261116/README.md` en el repositorio del proyecto (no se proporciona URL directa)
- Paper, blog o demo: no disponibles en la información proporcionada.
