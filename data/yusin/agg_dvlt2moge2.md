# Yusin/agg_dvlt2moge2

## Resumen

`agg_dvlt2moge2` es un checkpoint de destilación de un codificador de imágenes, no un modelo de lenguaje. Lo publica el usuario Yusin en Hugging Face y forma parte del ecosistema del proyecto DVLT-Matching. El objetivo es destilar el codificador de imágenes DVLT (un DINOv2 ViT-B/14 con registers) dentro del codificador de MoGe-2 (un DINOv2 ViT-L/14, capas 0-22) del modelo previo `moge2dvlt`, de modo que un único ViT-L alimente tanto la ruta de profundidad de MoGe-2 como la red de pose de DVLT.

La técnica empleada es de estilo RADIO: un adaptador MLP por objetivo y transformaciones PHI-S. Todas las cabezas del modelo `moge2dvlt` se reutilizan sin cambios. El resultado relevante para desarrolladores es que se consolida un único tronco visual ViT-L para dos tareas (profundidad y pose) en lugar de mantener dos codificadores separados.

El checkpoint está explícitamente marcado como **infraentrenado** ("undertrained"): el entrenamiento se detuvo manualmente en el paso 1210 de los 10000 previstos, con la tasa de aprendizaje aún al 97 % de su pico y con la R² de los tokens DVLT todavía en ascenso. Por tanto, no debe tratarse como un modelo listo para producción, sino como un estado intermedio de investigación. El repositorio ocupa 3,6 GB y no declara pipeline, idiomas ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Destilación de codificadores visuales ViT (DINOv2 ViT-B/14 con registers hacia DINOv2 ViT-L/14, capas 0-22), con adaptadores MLP por objetivo y transformaciones PHI-S de estilo RADIO |
| Parametros totales | no disponible (el checkpoint incluye codificador estudiante, adaptadores, transformaciones PHI-S y estado del optimizador AdamW) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (codificador de imágenes, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | `.pt` (estado completo de `distill.py`, cargado con `torch.load(path, weights_only=False)`; incluye `stu`, `phis`, `opt`, `step`, `hist`, `phi2`, `config`, `stop`, `wandb_id`) |

## Arquitectura y entrenamiento

El modelo es un proceso de destilación de codificadores visuales. El profesor es el codificador de imágenes DVLT (DINOv2 ViT-B/14 con registers) y el estudiante es el codificador de MoGe-2 (DINOv2 ViT-L/14, capas 0-22) del checkpoint `moge2dvlt` (`md_3725959_step13031.pt`). Se emplea un esquema de estilo RADIO con un adaptador MLP por objetivo y transformaciones PHI-S, de forma que un solo ViT-L proporciona representaciones tanto a la ruta de profundidad de MoGe-2 como a la red de pose de DVLT. Las cabezas de `moge2dvlt` se reutilizan sin modificar.

El entrenamiento se detuvo manualmente en el paso 1210 de los 10000 planificados, con la tasa de aprendizaje al 97 % de su pico y la R² de los tokens DVLT aún en aumento. El checkpoint guarda el estado completo del script `distill.py`, incluido el optimizador AdamW (`opt`), el contador de pasos (`step`), el historial de evaluaciones durante el entrenamiento (`hist`), la configuración (`config`) y el identificador de W&B (`wandb_id`). No se detallan en la información disponible el número de tokens de imagen, la composición del dataset ni si hubo etapas de RLHF o DPO (no aplicables a un codificador visual).

## Capacidades

- Extracción de características visuales mediante un tronco ViT-L/14 compartido.
- Alimentación simultánea de dos cabezas: la ruta de profundidad (depth) de MoGe-2 y la red de pose de DVLT.
- Destilación de representaciones desde un ViT-B/14 (DVLT) hacia un ViT-L/14 (MoGe-2), preservando el comportamiento de las cabezas originales de `moge2dvlt`.
- Adaptación por objetivo mediante MLP y transformaciones PHI-S.
- No es un modelo generativo de texto: no soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión generativa, audio ni otras capacidades de modelo de lenguaje.

## Casos de uso

- Investigación en destilación de codificadores visuales: sirve como estado intermedio reproducible para estudiar la transferencia de un ViT-B/14 a un ViT-L/14 con adaptadores por objetivo.
- Consolidación de troncos visuales en pipelines de percepción: permite evaluar si un único ViT-L puede sustituir a dos codificadores separados (DVLT y MoGe-2) en un sistema de profundidad y pose.
- Reproducción de experimentos: el checkpoint incluye el estado del optimizador y el historial de evaluación, lo que facilita reanudar o auditar el entrenamiento desde el paso 1210.
- Estudio de esquemas RADIO y PHI-S: útil para comparar variantes de adaptadores MLP por tarea en modelos de visión.
- Base para continuar el entrenamiento: al estar infraentrenado y conservar `opt` y `config`, puede reanudarse hasta los 10000 pasos previstos.
- Evaluación de la calidad de representaciones destiladas en tareas de matching y estimación de pose, usando el test downstream del repositorio de GitHub.
- No se recomienda su uso en producción ni en aplicaciones finales de usuario debido a su estado infraentrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona que la R² de los tokens DVLT seguía aumentando en el momento de detener el entrenamiento (paso 1210), sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint pesa 3.643.771.037 bytes (unos 3,6 GB) e incluye estado del optimizador, por lo que el uso en inferencia requiere cargar solo el subconjunto `stu`/`phis`.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del ViT-L/14 es previsible que requiera GPU con memoria suficiente para el tronco y las cabezas, pero no se confirma.
- ¿Cabe en GPU de consumo? No confirmado. El tamaño del estado sugiere que un checkpoint de inferencia podría caber en GPUs de consumo con memoria suficiente, pero no hay datos oficiales.
- Opciones de despliegue: carga vía `torch.load` con el script `distill.py`; el repositorio de GitHub incluye `scripts/download_weights.py` para descargar este estado y el checkpoint `moge2dvlt` necesario. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un codificador visual).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| `agg_dvlt2moge2` (este) | Destilación ViT-B/14 → ViT-L/14 | no disponible | no aplica | other | Infraentrenado (paso 1210/10000) |
| `moge2dvlt` | Modelo base con codificador MoGe-2 + cabezas DVLT | no disponible | no aplica | no disponible | Checkpoint de referencia (`md_3725959_step13031.pt`) |
| DVLT (codificador original) | DINOv2 ViT-B/14 con registers | no disponible | no aplica | no disponible | Profesor en la destilación |
| MoGe-2 (codificador original) | DINOv2 ViT-L/14, capas 0-22 | no disponible | no aplica | no disponible | Estudiante en la destilación |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Estado explícitamente infraentrenado: detenido en el paso 1210 de 10000, con la tasa de aprendizaje al 97 % de su pico y la R² de los tokens DVLT aún en ascenso.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, agentes ni razonamiento multi-paso.
- Licencia "other": no se especifican los términos exactos de uso comercial; es necesario consultar al autor antes de cualquier uso en producción.
- Sin pipeline declarado, sin idiomas declarados y sin benchmarks publicados.
- Riesgo de representaciones subóptimas en las tareas de profundidad y pose debido al entrenamiento incompleto.
- El checkpoint incluye estado del optimizador y otros artefactos de entrenamiento, lo que aumenta el tamaño y requiere filtrar el subconjunto necesario para inferencia.
- No se documentan sesgos conocidos ni riesgos de alucinación (no aplicables a un codificador visual), pero tampoco hay evaluación de sesgos en los datos de entrenamiento.
- Dependencia del checkpoint `moge2dvlt` (`md_3725959_step13031.pt`) para su uso completo.

## Enlaces

- Hugging Face: https://huggingface.co/Yusin/agg_dvlt2moge2
- Modelo base `moge2dvlt`: https://huggingface.co/Yusin/moge2dvlt
- Repositorio GitHub (rama `agg_dvlt2moge2`): https://github.com/Yusin2Chen/DVLT-Matching/tree/agg_dvlt2moge2
- Script de descarga de pesos: `scripts/download_weights.py` dentro del repositorio anterior.
