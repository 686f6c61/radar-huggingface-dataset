# U-WIN/qwen35-9b-equational-theory-sair-notes50m-noref-src-rollout-notes-ntp-kl-0p01

## Resumen

El modelo `U-WIN/qwen35-9b-equational-theory-sair-notes50m-noref-src-rollout-notes-ntp-kl-0p01` es un ajuste fino completo del modelo base Qwen/Qwen3.5-9B, desarrollado por el grupo U-WIN en noviembre de 2026. Forma parte de un trabajo interno de internalización de teoría ecuacional (equational theory) mediante notas de estudio y notas de rollout generadas por el propio modelo base. El nombre del repositorio describe el conjunto de datos de entrenamiento, no el número de parámetros: el checkpoint completo tiene 9.653.104.368 parámetros reales según los safetensors.

El modelo resuelve un problema de investigación concreto: estudiar si un modelo puede interiorizar conocimiento matemático (teoría ecuacional, con implicaciones demostradas en Lean) a partir de notas de estudio y de notas de auto-reflexión generadas sin solución de referencia. La arquitectura es la del transformer multimodal de Qwen3.5 (pipeline `image-text-to-text`), con los pesos de texto ajustados y los componentes de visión sin modificar. La longitud de contexto no se especifica en la información disponible.

Es relevante ahora como artefacto de investigación reproducible: incluye procedencia completa (`training_summary.json`, `artifact_manifest.json`), dos revisiones (época 1 y época 2), y un recetario detallado con hiperparámetros, pérdidas de entrenamiento y validación, y enlaces al run de W&B. No obstante, el autor declara explícitamente que el modelo no ha sido evaluado en ningún benchmark.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5, pipeline image-text-to-text) |
| Parámetros totales | 9.653.104.368 |
| Parámetros activos | no disponible (no es MoE según la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (427 tensores de lenguaje ajustados + 348 tensores base sin cambios) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `Qwen/Qwen3.5-9B` (revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) y aplica un ajuste fino completo de todos los pesos de lenguaje, manteniendo intactos los componentes de visión del modelo base. El entrenamiento usa predicción del siguiente token (NTP) sobre filas empaquetadas de 17.408 tokens (una fila por GPU), durante 2 épocas, con tasa de aprendizaje 5e-06, decaimiento coseno y 3 % de calentamiento, más un término de regularización KL de 0,01 × KL(base || estudiante) sobre un pool de repetición congelado de trayectorias generadas por el modelo base (solo regularización, nunca como objetivo). Se ejecutó en 8 × GH200, 812 pasos de optimizador, 91 minutos de entrenamiento (job Slurm 1147836 en TACC Vista, iniciado el 2026-11-16).

Los datos de entrenamiento combinan dos fuentes: (1) una porción de 50 M de tokens de las notas de estudio del modelo base (83.814 notas, 50.000.192 tokens, prefijo completo del orden sembrado de `notes_ntp_kl_20261012`), y (2) notas de rollout: 55.072.420 tokens en total (3.241 filas empaquetadas por época). Las notas de rollout fueron escritas por el modelo base al revisar sus propios intentos de solución calificados, sin solución de referencia pero con las fuentes de estudio de teoría ecuacional (páginas de leyes, implicaciones demostradas con pruebas Lean, dualidades, exposición, fundamentos y métodos). Se generaron 5.602 notas (5.072.228 tokens, mediana de 871 tokens por nota) para 5.610 implicaciones de entrenamiento (2.182 verdaderas, 3.428 falsas). Aproximadamente el 14 % de las notas concluyen solo el veredicto incorrecto, y un contador exacto encuentra contraejemplo válido en 674 de las 3.421 notas sobre problemas falsos (cota inferior). Las notas no se publican. Las pérdidas de validación al final de cada época se recogen en la tabla siguiente.

| Métrica | Época 1 (`epoch-1`, checkpoint-406) | Época 2 (`main`, checkpoint-812) | Modelo base |
|---|---|---|---|
| Pérdida media de entrenamiento | 0,381 | 0,293 | no disponible |
| Pérdida retenida en notas de estudio originales | 0,301 | 0,294 | 1,245 |
| Pérdida retenida en trayectorias del modelo base | 0,127 | 0,126 | 0,145 |
| KL(base \|\| estudiante) en pool de validación | 0,045 | 0,039 | no disponible |

## Capacidades

- Generación de texto y razonamiento sobre teoría ecuacional, con exposición previa a leyes, dualidades, implicaciones demostradas y pruebas Lean.
- Procesamiento de imagen y texto (`image-text-to-text`), heredado del modelo base; los componentes de visión no fueron evaluados para calidad multimodal.
- Conversación multi-turno (etiqueta `conversational` en el repositorio).
- Escritura de notas de auto-reflexión y análisis de intentos de solución propios (capacidad entrenada explícitamente mediante las notas de rollout).
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: no disponible en la información.
- Modo de pensamiento (thinking mode), audio u otras capacidades especiales: no disponible en la información.

## Casos de uso

- Investigación sobre internalización de conocimiento matemático: el modelo sirve como artefacto reproducible para estudiar si las notas de estudio y las notas de auto-reflexión sin referencia permiten al modelo interiorizar implicaciones de teoría ecuacional; se usaría comparando sus salidas con las del modelo base en el conjunto de 205 preguntas de evaluación del proyecto.
- Estudio de regularización KL en ajuste fino completo: el recetario (KL 0,01 sobre trayectorias del modelo base) y las métricas de validación publicadas permiten replicar y analizar el efecto de la regularización sobre la deriva respecto al modelo base.
- Generación de notas de estudio sintéticas: dado un conjunto de fuentes matemáticas y un problema, el modelo puede producir una nota analítica en formato libre, útil como material de entrenamiento o para auditar la calidad de notas generadas.
- Análisis de intentos de solución propios: el modelo fue entrenado para revisar intentos calificados y escribir notas; puede emplearse en pipelines de auto-evaluación donde se requiera un comentario cualitativo sobre una solución candidata.
- Evaluación de alineación con el modelo base: el KL medido en el pool de validación (0,039 en época 2) permite usar el modelo como caso de estudio de cuánto se desvía un ajuste fino completo del modelo original en una distribución concreta.
- Docencia e investigación en teoría ecuacional asistida: con las fuentes del proyecto (páginas de leyes, pruebas Lean), el modelo puede servir de apoyo para explorar dualidades y relaciones entre leyes, siempre con verificación humana del veredicto.
- Prototipado de asistentes multimodales sobre Qwen3.5-9B: al conservar los componentes de visión y el tokenizador y plantilla de chat del modelo base, puede usarse como punto de partida para experimentos que requieran entrada imagen-texto, aunque la calidad multimodal no fue evaluada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que el modelo no ha sido evaluado en ningún benchmark y que las cifras publicadas son únicamente pérdidas de entrenamiento y validación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de 9,65 mil millones de parámetros en safetensors, la carga en precisión completa (fp32) requiere del orden de 38,6 GB (tamaño del repositorio), en bf16 del orden de 19,3 GB, y en cuantizaciones de 8 y 4 bits aproximadamente 9,7 GB y 4,8 GB respectivamente; estas cifras son estimaciones por tamaño de pesos, no datos publicados por el autor.
- GPU recomendadas: el entrenamiento se realizó en 8 × GH200. Para inferencia no se especifican GPU concretas en la información disponible.
- ¿Cabe en GPU de consumo? No confirmado por el autor; por tamaño de pesos, las cuantizaciones de 4 y 8 bits podrían caber en GPU de consumo con suficiente VRAM, pero no hay datos publicados.
- Opciones de despliegue: la model card solo documenta carga con `transformers` mediante `AutoModelForImageTextToText` y `AutoProcessor`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Evaluación | Disponibilidad |
|---|---|---|---|---|---|
| U-WIN/qwen35-9b-equational-theory-sair-notes50m-noref-src-rollout-notes-ntp-kl-0p01 | 9.653.104.368 | no disponible | Apache 2.0 | No evaluado en benchmarks | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-9B (modelo base) | 9B (aproximado; no confirmado en la información) | no disponible | no disponible en la información | no disponible en la información | Hugging Face |
| Otros ajustes finos de Qwen3.5-9B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables de la misma categoría (ajustes finos de investigación sobre teoría ecuacional) en la información proporcionada.

## Limitaciones y advertencias

- Modelo no evaluado: ninguna revisión ha sido puntuada en ningún benchmark; las cifras publicadas son solo pérdidas de entrenamiento y validación.
- Calidad de las notas de entrenamiento: aproximadamente el 14 % de las notas de rollout concluyen solo el veredicto incorrecto, y solo 674 de las 3.421 notas sobre problemas falsos contienen un contraejemplo válido comprobable (cota inferior). El modelo puede haber aprendido razonamientos defectuosos.
- Sin solución de referencia: las notas se generaron sin veredicto correcto ni solución de referencia, por lo que no hay garantía de corrección en las conclusiones.
- Componentes de visión sin evaluar: los pesos multimodales son los del modelo base y no se evaluó su calidad multimodal.
- Conjunto de evaluación no publicado: las 205 preguntas de evaluación del proyecto no se detallan en la información disponible, lo que limita la replicación externa.
- Notas de entrenamiento no publicadas: las notas de rollout no se publican, lo que dificulta auditar el conjunto de datos.
- Idiomas soportados no disponibles: no se especifica qué idiomas cubre el ajuste fino; el modelo base Qwen3.5-9B probablemente soporta varios, pero no se confirma para este checkpoint.
- Longitud de contexto no disponible: no se indica la ventana de contexto efectiva del checkpoint.
- Licencia Apache 2.0: permite uso comercial según los términos de la licencia, pero al derivar de Qwen3.5-9B conviene verificar las condiciones del modelo base.
- Riesgo de alucinación: no cuantificado; en un dominio matemático con veredictos binarios y notas parcialmente incorrectas, el riesgo de afirmaciones erróneas es relevante y requiere verificación humana.
- Uso previsto de investigación: el modelo está pensado como artefacto de estudio interno, no como modelo de producción.

## Enlaces

- Hugging Face: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-notes50m-noref-src-rollout-notes-ntp-kl-0p01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Run de W&B: https://wandb.ai/stanford_autonomous_agent/equation-internalization/runs/eqnorefsrcn50mr20261116
- Recetario y registro del run: `recipe/equational_internalization/experiments/rollout_notes_noref_sources_vista_20261116/README.md` en el repositorio del proyecto (no se proporciona URL directa)
