# U-WIN/qwen35-9b-equational-theory-sair-notes1m-noref-src-rollout-notes-ntp-kl-0p01

## Resumen

El modelo `qwen35-9b-equational-theory-sair-notes1m-noref-src-rollout-notes-ntp-kl-0p01` es un ajuste fino completo del checkpoint base Qwen/Qwen3.5-9B, publicado por el grupo U-WIN dentro de su línea de trabajo sobre internalización de teoría ecuacional. El nombre describe el conjunto de datos de entrenamiento, no el número de parámetros: se trata de un modelo de 9.653.104.368 parámetros (~9,65 mil millones) entrenado sobre notas de estudio y notas de "rollout" generadas por el propio modelo base. El objetivo del experimento es que el modelo interiorice fuentes de estudio de teoría ecuacional (páginas de leyes, implicaciones demostradas en Lean, dualidades y material de fundamentos) mediante predicción del siguiente token y regularización KL.

La arquitectura subyacente es la del Qwen3.5-9B, un transformer multimodal con pipeline `image-text-to-text`. Este ajuste concreto solo modifica los pesos de lenguaje (427 tensores ajustados frente a 348 tensores base sin cambios); los componentes de visión son los del modelo original y no fueron evaluados en calidad multimodal. El modelo no ha sido evaluado en ningún benchmark: la model card indica explícitamente "Not evaluated" y todas las cifras publicadas son pérdidas de entrenamiento y validación.

Es relevante como pieza de investigación reproducible: documenta con detalle la receta (full fine-tune, 2 épocas, LR 5e-06, KL 0.01 contra un pool de repetición congelado, 8 x GH200, 90 pasos de optimizador, 31 minutos), las revisiones disponibles y las limitaciones conocidas del corpus de notas. No es un modelo pensado para producción ni para uso generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5), pipeline image-text-to-text; pesos de lenguaje ajustados, visión sin cambios |
| Parámetros totales | 9.653.104.368 (~9,65 mil millones) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo contiene safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (427 tensores de lenguaje ajustados + 348 tensores base sin cambios) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint Qwen/Qwen3.5-9B en la revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a` y aplica un ajuste fino completo (full fine-tune) con predicción del siguiente token sobre filas empaquetadas de 17.408 tokens (una fila por GPU). Se entrenaron 2 épocas con tasa de aprendizaje 5e-06, decaimiento coseno y 3% de warmup, sobre 8 x GH200, con 90 pasos de optimizador y 31 minutos de cómputo (job Slurm 1147839 en TACC Vista, iniciado el 2026-11-16). A la pérdida de NTP se le suma un término de regularización `0.01 x KL(base || student)` calculado sobre un pool de repetición congelado de trayectorias generadas por el modelo base, usado solo como regularizador y nunca como objetivo.

Los datos de entrenamiento combinan la porción de 1M tokens de las notas de estudio del modelo base (1.695 notas, 1.000.081 tokens) con notas de rollout (6.072.309 tokens en total, 360 filas empaquetadas por época), mezcladas y barajadas. Las notas de rollout fueron escritas por el propio Qwen3.5-9B al revisar sus intentos de solución puntuados, sin solución de referencia pero con acceso a las fuentes de estudio de teoría ecuacional. Para cada una de las 5.610 implicaciones de entrenamiento (2.182 verdaderas, 3.428 falsas) el modelo escribió una nota eligiendo qué abrir (lectura, glob, grep; máximo 20 respuestas). El corpus resultante tiene 5.602 notas y 5.072.228 tokens de entrenamiento (mediana de 871 tokens por nota) y no fue verificado contra el veredicto correcto: aproximadamente el 14% de las notas concluyen solo el veredicto incorrecto y solo 674 de las 3.421 notas sobre problemas falsos contienen un contraejemplo válido (cota inferior).

## Capacidades

- Generación de texto y predicción del siguiente token sobre el modelo base Qwen3.5-9B.
- Razonamiento sobre teoría ecuacional: el ajuste busca internalizar leyes, implicaciones demostradas en Lean, dualidades y páginas de fundamentos.
- Procesamiento de entradas de imagen y texto (pipeline `image-text-to-text`), aunque los componentes de visión son los del modelo base y no fueron evaluados en este checkpoint.
- Conversación multi-turno: la model card indica el tag `conversational` y se incluyen plantilla de chat y procesadores.
- Compatibilidad con endpoints (`endpoints_compatible`).
- Soporte de tool calling, function calling, agentes o modo "thinking": no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre internalización de conocimiento: reproducir el experimento de ajuste fino con NTP + KL sobre notas de estudio y comparar las revisiones `epoch-1` y `main` para estudiar cómo evoluciona la pérdida retenida.
- Estudio de generación de datos sintéticos: analizar las notas de rollout producidas por el modelo base para entender qué fuentes consulta y cómo razona ante implicaciones verdaderas y falsas.
- Evaluación de sesgos de autoentrenamiento: usar el checkpoint para medir hasta qué punto el modelo reproduce veredictos incorrectos (el ~14% de notas con veredicto erróneo es un punto de partida medible).
- Docencia e ilustración de recetas de ajuste fino completo: el repositorio incluye `training_summary.json`, `artifact_manifest.json` y referencias al run de W&B, útiles para explicar trazabilidad de experimentos.
- Base para experimentos de regularización KL: el pool de repetición congelado y el coeficiente 0.01 sirven como configuración de referencia para estudiar estabilidad del ajuste.
- Prototipado interno de asistentes sobre dominios formales: con las cautelas de licencia y de ausencia de evaluación, puede emplearse en entornos controlados para explorar preguntas de teoría ecuacional.
- Integración en pipelines de transformers: la carga con `AutoModelForImageTextToText` y `AutoProcessor` permite incorporarlo a flujos de experimentación existentes sin conversión adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que ninguna revisión ha sido puntuada en ningún benchmark. Las únicas métricas publicadas son pérdidas de entrenamiento y validación:

| Métrica | Época 1 (`epoch-1`, checkpoint-45) | Época 2 (`main`, checkpoint-90) | Modelo base |
|---|---|---|---|
| Pérdida media de entrenamiento en la época | 0,715 | 0,514 | no disponible |
| Pérdida retenida en notas de estudio originales | 0,425 | 0,409 | 1,245 |
| Pérdida retenida en trayectorias del modelo base | 0,134 | 0,132 | 0,145 |
| KL(base \|\| student) en el pool de validación | 0,063 | 0,056 | no disponible |

El conjunto retenido es el de validación congelado de la receta (notas de estudio originales y trayectorias del modelo base); no contiene notas de rollout, por lo que ninguna cifra mide el ajuste a notas de rollout no vistas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 9,65 mil millones de parámetros, en fp16 se requieren aproximadamente 19-20 GB solo para pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: no disponible en la información proporcionada; el entrenamiento se realizó en 8 x GH200.
- ¿Cabe en GPU de consumo? No confirmado. Por tamaño, cabría en GPUs con 24 GB o más en cuantizaciones de 8 bits o menores, pero el repositorio solo publica safetensors y no se documentan cuantizaciones.
- Opciones de despliegue: carga mediante `transformers` con `AutoModelForImageTextToText` y `AutoProcessor`; compatibilidad con endpoints indicada por el tag `endpoints_compatible`. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Evaluación publicada | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (U-WIN, ajuste de Qwen3.5-9B) | ~9,65 mil millones | no disponible | Apache 2.0 | No evaluado | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-9B (base) | ~9,65 mil millones | no disponible | no disponible en la información | No disponible en la información | Hugging Face |
| Otras variantes del proyecto U-WIN (`notes_ntp_kl_20261012`, etc.) | no disponible | no disponible | no disponible | No disponible en la información | Referenciadas en la model card |

No se dispone de datos de benchmarks ni de especificaciones de contexto de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Modelo no evaluado: ninguna revisión ha sido puntuada en benchmarks; las cifras publicadas son solo pérdidas.
- Calidad del corpus de entrenamiento: aproximadamente el 14% de las notas de rollout concluyen solo el veredicto incorrecto y solo 674 de 3.421 notas sobre problemas falsos contienen un contraejemplo válido (cota inferior). El modelo puede haber aprendido razonamientos defectuosos.
- Las notas de rollout no se publican, lo que limita la reproducibilidad completa del experimento.
- El conjunto retenido no incluye notas de rollout, así que no hay medida del ajuste a ese tipo de datos.
- Los componentes de visión son los del modelo base y no fueron evaluados en calidad multimodal.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado; el dominio de teoría ecuacional y el entrenamiento sobre notas auto-generadas sin verificación incrementan el riesgo de veredictos incorrectos.
- Idiomas soportados: no disponibles.
- Longitud de contexto: no disponible.
- Licencia Apache 2.0, que permite uso comercial, pero sin evaluación que respalde su idoneidad en producción.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa por parte de la comunidad.
- El nombre del modelo incluye referencias a configuraciones de entrenamiento (`noref`, `kl-0p01`, `notes1m`) que deben interpretarse como metadatos del experimento, no como garantías de comportamiento.

## Enlaces

- Hugging Face: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-notes1m-noref-src-rollout-notes-ntp-kl-0p01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Run de W&B: https://wandb.ai/stanford_autonomous_agent/equation-internalization/runs/eqnorefsrcn1mr20261116
- Repositorio del proyecto (referenciado en la model card): `recipe/equational_internalization/experiments/rollout_notes_noref_sources_vista_20261116/README.md`
