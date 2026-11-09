# YoussefGhallab/stage-anchored-replay-libero-long-eca-rl1

## Resumen

`YoussefGhallab/stage-anchored-replay-libero-long-eca-rl1` es un punto de control (checkpoint) de investigación para robótica de manipulación, no un modelo de lenguaje. Se trata de un modelo de mundo-acción (world-action model) construido sobre Cosmos-Predict2-2B, concretamente sobre la variante Cosmos Policy, y entrenado para ejecutar tareas de manipulación del benchmark LIBERO-Long. El autor, YoussefGhallab, lo publica como material reproducible de un estudio sobre *replay* en aprendizaje continuo: la primera etapa (CL1) de una rama con K = 1, en la que el modelo aprende la tarea 6 de LIBERO-Long partiendo de una base entrenada en las tareas 0-5.

El interés del repositorio es metodológico más que de producto: documenta con detalle el protocolo de entrenamiento (replay de 1.440 rollouts de un chunk por tarea antigua, generados por el modelo profesor congelado a partir de anclas producidas solo con texto), la infraestructura (4 x NVIDIA H200 en el clúster eca, trabajo Slurm eca:12852) y los resultados de evaluación en bucle cerrado. Incluye pesos en bf16, registros de ejecución, métricas, configuraciones resueltas y salidas de evaluación por episodio, además de sumas de verificación SHA256.

No es un modelo para uso general: es un artefacto de investigación de 12 GB con licencia "other", sin idiomas declarados y con dependencias explícitas del código del autor y de un modelo base que no se distribuye en este repositorio. Cualquier uso requiere reconstruir el pipeline desde el repositorio GitHub indicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de mundo-acción Cosmos Policy sobre Cosmos-Predict2-2B (difusión para predicción y denoising de acciones) |
| Parametros totales | No disponible de forma explícita; el backbone declarado es Cosmos-Predict2-2B (aproximadamente 2.000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos publicados en bf16 (`net_bf16.pt`); no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible (condicionado por instrucciones de texto en inglés dentro del pipeline LIBERO) |
| Licencia | other (sin términos detallados en la model card) |
| Formato de pesos | PyTorch (`net_bf16.pt`); también `model.pt` listo para el evaluador |
| Tarea / benchmark | LIBERO-Long (tareas 0-6) |
| Acciones por paso | 16 acciones en lazo abierto, 5 pasos de denoising de acción |
| Hardware de entrenamiento | 4 x NVIDIA H200, clúster eca, Slurm eca:12852 |
| Tamaño del repositorio | 12,0 GB |

## Arquitectura y entrenamiento

El modelo es un Cosmos Policy construido sobre Cosmos-Predict2-2B, un modelo generativo de difusión adaptado a política visomotora: recibe observaciones e instrucciones de texto y genera secuencias de acciones mediante un proceso de denoising (5 pasos en la evaluación reportada). El entrenamiento se organiza en etapas de aprendizaje continuo. La etapa CL1 parte de un modelo base entrenado en las tareas 0-5 de LIBERO-Long (paso 1500) y aprende la tarea 6. El mecanismo central es el *stage-anchored replay*: por cada tarea antigua se generan 1.440 rollouts de un solo chunk con el modelo profesor congelado de la etapa anterior, iniciados desde anclas que el propio profesor produjo a partir de texto únicamente. Esos rollouts se mezclan con los datos de la tarea nueva para mitigar el olvido catastrófico.

El pipeline concreto se ejecuta en dos fases: 200 actualizaciones con la receta `configs/stage1/long_rl1_stage1.yaml`, seguidas de un cálculo de puntuaciones VFD (Visual Feature Drift) sobre la actualización 200 y 50 actualizaciones de reenfoque adicionales hasta la 250 (`configs/stage1/long_rl1_vfd_stage1.yaml`). El repositorio publica tanto los pesos del paso 200 (estudiante VFD) como los del paso 250 (modelo de la etapa CL1, que actúa como base y profesor de CL2), junto con las puntuaciones VFD por celda, los pesos de celda y el fichero `focus.json`. No se incluye el estado del optimizador ni el modelo base de partida.

## Capacidades

- Control visomotor para manipulación robótica en las tareas de LIBERO-Long (tareas 0-6).
- Generación de secuencias de acción en lazo abierto (16 acciones por inferencia) con denoising de 5 pasos.
- Condicionamiento por instrucciones de texto: las anclas de replay se generan solo con texto, lo que indica que el modelo acepta prompts textuales de tarea.
- Aprendizaje continuo por etapas con replay anclado y selección de datos basada en VFD (Visual Feature Drift).
- Evaluación en bucle cerrado reproducible: se incluyen peticiones de evaluación, resultados y salidas por episodio.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en aprendizaje continuo para robótica: reproducir la etapa CL1 del estudio de longitud de replay (rama K = 1) usando los pesos del paso 250 y las recetas publicadas, y comparar contra el modelo base evaluado en el mismo clúster.
- Estudio del olvido catastrófico: el repositorio permite analizar cómo el replay anclado afecta a cada tarea antigua; los resultados muestran que la caída se concentra en la tarea 3 (de 49 a 34 de 50 episodios), el único descenso superior al ruido de una sola semilla.
- Base para una segunda etapa (CL2): el checkpoint del paso 250 está designado explícitamente como modelo de partida y profesor de CL2, con `anchors.json` como referencia de deriva.
- Evaluación de selección de datos por VFD: las puntuaciones por celda, los pesos de celda y `focus.json` permiten replicar o auditar el reenfoque de las 50 actualizaciones finales.
- Reproducibilidad de infraestructura: los registros `run.json`, `resolved_config.json`, `metrics.jsonl` y `summary.json` sirven para auditar una ejecución en Slurm sobre 4 x H200 y verificar la integridad de los artefactos con `SHA256SUMS`.
- Integración en un evaluador LIBERO propio: el `model.pt` del paso 250 está empaquetado "evaluator-ready" junto con la petición de evaluación, lo que facilita lanzar evaluaciones en bucle cerrado con MuJoCo EGL sin reentrenar.

## Benchmarks y rendimiento

Evaluación en bucle cerrado LIBERO: 50 episodios por tarea, semilla 195, estados iniciales por defecto de LIBERO, 5 pasos de denoising, 16 acciones en lazo abierto, renderizador MuJoCo EGL (no el Mesa softpipe del protocolo de referencia; los píxeles difieren ligeramente). Una sola semilla: el intervalo del 95 % para una tarea es de aproximadamente ±13 puntos, por lo que las diferencias pequeñas son ruido.

| Modelo | Tarea 0 | 1 | 2 | 3 | 4 | 5 | Tareas antiguas 0-5 | Tarea nueva 6 |
|---|---|---|---|---|---|---|---|---|
| Base (etapa 0), eca | 47 | 49 | 46 | 49 | 44 | 50 | 285/300 (95,0 %) | no evaluada |
| CL1 @ actualización 250, eca | 47 | 45 | 49 | 34 | 43 | 50 | 268/300 (89,3 %) | 39/50 (78 %) |

El olvido se concentra en la tarea 3 (49 → 34 de 50), la única caída superior al ruido de una semilla. El repositorio advierte de que los números de otros clústeres o renderizadores no son comparables y de que no hay brazo de comparación emparejado (no existe una ejecución K = 6 en eca).

## Requisitos de hardware

- Entrenamiento documentado: 4 x NVIDIA H200 en el clúster eca, orquestado con Slurm (trabajo eca:12852).
- Inferencia: los pesos se publican en bf16, lo que implica del orden de 4 GB solo para pesos de un backbone de 2B; no se documenta el consumo real de VRAM del pipeline completo (codificadores de texto, embeddings de extensión, renderizado y bucle de control).
- No se especifican GPU de consumo compatibles; no hay datos de que quepa en RTX 4090 u otras consumer.
- Despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo); el despliegue previsto es mediante el código del repositorio GitHub `Youssef-Ghallab/libero-long-replay-length` y el evaluador LIBERO.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento LIBERO-Long | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (CL1 @ 250, eca) | Backbone Cosmos-Predict2-2B | No disponible | 268/300 en tareas 0-5 (89,3 %); 39/50 en tarea 6 (78 %) | other | Pesos bf16 en HF; base no incluida |
| Base (etapa 0) del mismo estudio | Backbone Cosmos-Predict2-2B | No disponible | 285/300 en tareas 0-5 (95,0 %); tarea 6 no evaluada | other | Solo resultados de evaluación en este repo; pesos no incluidos |
| Cosmos-Predict2-2B (modelo de partida) | Aproximadamente 2B | No disponible | No aplica (modelo generativo base) | No disponible | Fuera de este repositorio |
| Otras políticas LIBERO (p. ej. variantes de Cosmos Policy) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de terceros comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un asistente: su única función es generar acciones para tareas LIBERO-Long; no debe evaluarse con benchmarks de texto.
- Los resultados provienen de una sola semilla (195); el intervalo del 95 % por tarea es de aproximadamente ±13 puntos, de modo que diferencias menores no son significativas.
- Los números solo son comparables dentro del mismo clúster y renderizador (MuJoCo EGL); el propio autor advierte de que no son equiparables a los del protocolo de referencia con Mesa softpipe.
- No existe brazo de comparación emparejado (no hay ejecución K = 6 en eca), lo que limita las conclusiones sobre el efecto de la longitud de replay.
- El modelo base de partida (tareas 0-5, paso 1500) no se incluye; sin él no se puede reproducir el entrenamiento completo desde cero.
- La demostración pública HDF5 de la tarea 6 no está subida; `PUBLIC_FILES_NOT_UPLOADED.json` solo indica su origen.
- No se incluye el estado del optimizador, por lo que no se puede reanudar el entrenamiento exactamente desde el checkpoint.
- Licencia "other" sin términos detallados en la model card: es necesario contactar con el autor antes de cualquier uso comercial o redistribución.
- Riesgo de sobreajuste a las condiciones de evaluación de LIBERO (estados iniciales por defecto, instrucciones de texto concretas); no hay evidencia de generalización a otros entornos o brazos robóticos.
- Sin idiomas declarados y sin documentación de sesgos o alucinación en el sentido de modelos generativos de texto; el equivalente aquí es la deriva de política fuera de distribución, parcialmente monitorizada con VFD.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YoussefGhallab/stage-anchored-replay-libero-long-eca-rl1
- Código y recetas: GitHub `Youssef-Ghallab/libero-long-replay-length`, commit `a61f6ff` (https://github.com/Youssef-Ghallab/libero-long-replay-length)
- Receta etapa 1: `configs/stage1/long_rl1_stage1.yaml` (200 actualizaciones)
- Receta etapa 1 con VFD: `configs/stage1/long_rl1_vfd_stage1.yaml` (puntuaciones VFD en la actualización 200 y 50 actualizaciones de reenfoque hasta la 250)
- Sumas de verificación: `eca-rl1/SHA256SUMS` en el repositorio del modelo
- Fichero de archivos no subidos: `eca-rl1/PUBLIC_FILES_NOT_UPLOADED.json`
- Benchmark LIBERO: no se proporciona enlace en la información disponible
- Cosmos-Predict2-2B: no se proporciona enlace en la información disponible
- Resultado de búsqueda web sin relación con el modelo (Streamlabs Replay): https://streamlabs.com/content-hub/post/how-to-use-replay (descartado por no ser pertinente)
