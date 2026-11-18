# U-WIN/qwen35-9b-equational-theory-sair-observations-ntp-50m-kl-0p01

## Resumen

El modelo `qwen35-9b-equational-theory-sair-observations-ntp-50m-kl-0p01` es un ajuste fino completo (full fine-tune) del modelo base Qwen3.5-9B, desarrollado por el grupo U-WIN en noviembre de 2026. Forma parte de un experimento de investigación sobre internalización de teoría ecuacional: el objetivo es que el modelo absorba, mediante predicción del siguiente token, el contenido de un corpus de estudio de matemáticas ecuacionales tal y como lo devuelven las herramientas de lectura de un agente explorador. El nombre del checkpoint hace referencia al volumen de datos de entrenamiento (50 millones de tokens de observaciones), no al número de parámetros.

El modelo conserva la arquitectura del Qwen3.5-9B original, con 9.653.104.368 parámetros totales, y mantiene la modalidad image-text-to-text heredada del modelo base, aunque los componentes de visión no fueron reentrenados ni evaluados. El ajuste se aplicó únicamente sobre los pesos de lenguaje (427 tensores afinados de un total de 775; los 348 restantes son los originales del modelo base sin modificar).

Su relevancia es fundamentalmente de investigación: se trata de un artefacto experimental para estudiar cómo un modelo de lenguaje internaliza material de dominio mediante exposición repetida a textos de referencia, con regularización KL contra el modelo base para evitar el olvido catastrófico. No ha sido evaluado en ningún benchmark y no está pensado como modelo de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), con componentes de visión del modelo base |
| Parámetros totales | 9.653.104.368 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible (el repo contiene safetensors en precisión de entrenamiento) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (427 tensores de lenguaje afinados + 348 tensores base sin cambios) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo del Qwen3.5-9B (revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`), manteniendo la arquitectura transformer decoder-only del original, incluyendo su pipeline multimodal image-text-to-text. Los pesos de visión son los del modelo base y no se evaluaron para calidad multimodal.

El entrenamiento consistió en predicción del siguiente token sobre 50.000.024 tokens de pérdida, extraídos de 225.603 retornos de herramientas (45,4M tokens de `read`, 4,46M de `glob`, 110K de `grep`) procedentes de 27.092 sesiones de exploración del corpus de estudio ecuacional. Cada ejemplo de entrenamiento es un retorno de herramienta: una cabecera con la llamada (solo como entrada) seguida del texto devuelto y un token de fin de texto con pérdida. Se usaron filas empaquetadas de 17.408 tokens (una por GPU), 2 épocas, tasa de aprendizaje 5e-06 con decaimiento coseno y 3% de warmup, sobre 8 GPU GH200 (820 pasos de optimizador, 96 minutos de entrenamiento, job Slurm 1149067 en TACC Vista).

La innovación técnica destacable es la regularización KL de 0,01 × KL(base || estudiante) sobre un pool de reproducción congelado de trayectorias generadas por el modelo base, usado solo como regularizador y nunca como objetivo. El corpus se construyó con las preguntas de benchmark retenidas (informe de separación con estado PASS, 1.100 objetivos de evaluación protegidos). La pérdida de entrenamiento media fue de 0,087 en la época 1 y 0,011 en la época 2; la pérdida retenida sobre las notas de estudio originales pasó de 1,245 (base) a 1,192 (época 1) y 1,219 (época 2), y la pérdida sobre trayectorias del modelo base se mantuvo en 0,145-0,146 (base: 0,145), lo que indica que la regularización KL evitó el olvido de las capacidades originales.

## Capacidades

- Generación de texto y predicción del siguiente token sobre material de teoría ecuacional.
- Razonamiento matemático en el dominio específico del corpus de estudio (teoría ecuacional, dualidades, pruebas).
- Capacidad multimodal image-text-to-text heredada del modelo base Qwen3.5-9B (no evaluada ni reentrenada).
- Soporte de conversación mediante la plantilla de chat incluida en el repositorio.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso más allá de lo que herede del modelo base.
- Capacidades multilingües no documentadas.

## Casos de uso

- Investigación sobre internalización de conocimiento: el modelo sirve como artefacto experimental para estudiar cómo la exposición repetida a textos de referencia de un dominio (teoría ecuacional) modifica los pesos de un LLM, comparando checkpoints de época 1 y época 2.
- Estudio de olvido catastrófico: gracias a la regularización KL contra el modelo base, permite analizar empíricamente el equilibrio entre especialización en dominio y preservación de capacidades generales.
- Reproducción de experimentos: el repositorio incluye `training_summary.json` con el digest del registro de lanzamiento, checkpoint y auditoría de tensores, y `artifact_manifest.json` con el sha256 de cada fichero, lo que facilita la verificación y reproducción del pipeline.
- Análisis de datos de exploración de agentes: el modelo puede usarse para estudiar cómo se distribuye la información en los retornos de herramientas (`read`, `glob`, `grep`) de sesiones de agentes autónomos.
- Docencia e investigación en matemáticas asistidas por IA: como modelo especializado en un corpus de teoría ecuacional, puede emplearse en entornos controlados para analizar la fidelidad de la generación sobre material de referencia.
- Evaluación comparativa de recetas de ajuste fino: al publicarse dos revisiones (`epoch-1` y `main`/`epoch-2`) con métricas de pérdida, permite comparar el efecto del número de épocas sobre la pérdida de entrenamiento y la retención.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el modelo "no ha sido evaluado" y que las cifras proporcionadas son únicamente pérdidas de entrenamiento y validación:

| Métrica | Época 1 (`epoch-1`) | Época 2 (`main`) |
|---|---|---|
| Pérdida de entrenamiento media | 0,087 | 0,011 |
| Pérdida retenida en notas de estudio originales (base: 1,245) | 1,192 | 1,219 |
| Pérdida retenida en trayectorias del modelo base (base: 0,145) | 0,145 | 0,146 |
| KL(base || estudiante) en pool de validación | 0,010 | 0,009 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 9.653.104.368 parámetros, en precisión de entrenamiento (probablemente bf16) requiere aproximadamente 19-20 GB solo para pesos, más overhead de activaciones y caché KV; el repositorio ocupa 38,6 GB.
- GPU recomendadas: el entrenamiento se realizó en 8 × GH200. Para inferencia, se necesita al menos una GPU con 24 GB o más (por ejemplo, RTX 4090, A100 40GB, H100) para cargar el modelo sin cuantizar.
- Cabe en GPU consumer: probablemente sí en RTX 4090 (24 GB) con cuantización, o en configuraciones multi-GPU; no confirmado en la información proporcionada.
- Opciones de despliegue: transformers (carga documentada con `AutoModelForImageTextToText` y `AutoProcessor`); compatibilidad con endpoints indicada por tag. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| qwen35-9b-equational-theory-sair-observations-ntp-50m-kl-0p01 | 9.653.104.368 | No disponible | Apache 2.0 | Ajuste fino experimental de dominio, sin evaluar |
| Qwen/Qwen3.5-9B (modelo base) | No disponible en la información | No disponible | No disponible en la información | Modelo base multimodal image-text-to-text |
| Alternativas de 9B especializadas en matemáticas | No disponible | No disponible | No disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas de la misma categoría. El modelo base Qwen3.5-9B es el único punto de referencia documentado, y sus especificaciones completas no figuran en la información proporcionada.

## Limitaciones y advertencias

- Modelo no evaluado: no ha sido puntuado en ningún benchmark; las cifras publicadas son solo pérdidas de entrenamiento y validación.
- El nombre del checkpoint describe el volumen de datos (50M tokens), no el tamaño del modelo; puede inducir a confusión.
- La pérdida retenida sobre notas de estudio originales empeora ligeramente de época 1 a época 2 (1,192 a 1,219), lo que sugiere un posible sobreajuste al texto fuente en la segunda época.
- La pérdida de entrenamiento de la época 2 se calcula sobre texto ya visto en la época 1, por lo que no mide la capacidad de generalización a texto fuente no visto.
- Los componentes de visión son los del modelo base y no fueron evaluados para calidad multimodal; no se debe asumir un rendimiento multimodal fiable.
- Riesgo de alucinación: no documentado explícitamente, pero inherente a un modelo de lenguaje ajustado sobre un corpus específico.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación sin evaluación, no se recomienda su uso en producción.
- El corpus se construyó con preguntas de benchmark retenidas, pero la model card advierte que leyes equivalentes y tablas compartidas permanecen por diseño, lo que podría afectar a evaluaciones futuras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-observations-ntp-50m-kl-0p01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Run de W&B: https://wandb.ai/stanford_autonomous_agent/equation-internalization/runs/eqobs50m20261117
- Repositorio del proyecto (ruta indicada en la model card): `recipe/equational_internalization/experiments/observations_study_materials_ntp_kl_vista_20261117/README.md` (no se proporciona URL directa)
