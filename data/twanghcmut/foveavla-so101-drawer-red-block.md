# twanghcmut/foveavla-so101-drawer-red-block

## Resumen

FoveaVLA SO101 drawer-red-block es un conjunto de tres checkpoints de robótica de tipo Vision-Language-Action (VLA) publicados por el usuario twanghcmut en Hugging Face. Se trata de un intento de reproducción del artículo FoveaVLA (arXiv 2610.20064) sobre una única tarea de manipulación con el brazo izquierdo del robot SO101: abrir el cajón superior, coger un bloque cuadrado rojo, colocarlo dentro y cerrar el cajón. Los tres modelos parten del checkpoint base `physical-intelligence/pi05_base` y se entrenan con idénticos hiperparámetros, diferenciándose únicamente en las entradas visuales: π0.5 con vista superior y muñeca, π0.5 solo con vista superior, y FoveaVLA-Single con vista superior, recorte foveal y profundidad métrica.

El modelo es relevante porque documenta de forma transparente la diferencia entre métricas de bucle abierto (error de acción) y bucle cerrado (tasa de éxito), y porque no reproduce el ranking del artículo original. El repositorio incluye los parches de código, las etiquetas de cajas de interacción generadas automáticamente con Qwen3-VL-8B y los resultados crudos por consulta, lo que lo convierte en un artefacto útil para investigadores que quieran auditar la reproducibilidad de FoveaVLA en un robot de bajo coste.

El tamaño del repositorio es de 37,3 GB, correspondiente a tres checkpoints JAX de openpi en formato orbax (paso 19999), con pesos EMA y estadísticas de normalización. La licencia es Apache 2.0 y la librería declarada es LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action basada en π0.5 (openpi); variante FoveaVLA con recorte foveal y profundidad métrica |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (horizonte de acción de 16 pasos; ventana de observación no especificada) |
| Tipos de cuantizacion | no disponible (checkpoints JAX/orbax en precisión de entrenamiento) |
| Idiomas soportados | no disponible (instrucciones en inglés en los prompts de ejemplo) |
| Licencia | Apache 2.0 |
| Formato de pesos | JAX orbax (`params/`), con `assets/` (norm stats) y `_CHECKPOINT_METADATA` |

## Arquitectura y entrenamiento

Los tres modelos son ajustes completos (full fine-tune) de `pi05_base`, un VLA de openpi que combina un codificador visual SigLIP compartido con un backbone de lenguaje y una cabeza de acciones por difusión o regresión (la model card no detalla la cabeza). La variante FoveaVLA-Single añade un mecanismo de foveación: predice una caja de interacción mediante 4 tokens de localización de PaliGemma, con peso de pérdida 0,1, para el instante t+8 (igual al intervalo de replanificación). El recorte es cuadrado con escala de contexto 1,5 y muestreo mixto (10% imagen completa, 45% con jitter, 45% exacto). La profundidad métrica (rango 0,2–3 m) se renderiza como log + turbo y se introduce por el mismo SigLIP compartido. Las acciones son deltas para las 5 articulaciones y absolutas para la pinza, con estado de 6 dimensiones y horizonte de 16 pasos.

El entrenamiento es idéntico para los tres checkpoints: 49 episodios de entrenamiento (se excluyen 6 de validación y los episodios 5 y 24 por pinza inmóvil), batch 32, 20.000 pasos, AdamW (b1 0,9, b2 0,95, wd 1e-10), clip de gradiente 1,0, EMA 0,99, warmup de 1.000 pasos hasta 5e-5 y LR constante. Se ejecuta en 1× H100 80GB, con velocidades de 1,8 s/paso (FoveaVLA), 1,4 s/paso (π0.5 top+wrist) y 1,3 s/paso (π0.5 top). Las cajas de interacción se generaron automáticamente con Qwen3-VL-8B cada 6 fotogramas, con limpieza de falsos positivos e interpolación de huecos de hasta 18 fotogramas; el 85% de los fotogramas tienen caja válida. El dataset de origen contiene 57 episodios, 60.208 fotogramas a 30 fps, con cámaras `top` (640×360), `top_depth` (profundidad métrica) y `wrist` (640×480).

## Capacidades

- Control robótico de manipulación de una sola tarea: abrir cajón, coger bloque, colocar y cerrar, con el brazo izquierdo del SO101.
- Predicción de acciones en chunks de 16 pasos a partir de observaciones visuales y estado de 6 dimensiones.
- Entrada multimodal: imagen superior, imagen de muñeca (solo modelo A), profundidad métrica y recorte foveal (solo modelo C).
- Condicionamiento por prompt de lenguaje en inglés para describir la tarea.
- Predicción de caja de foveación (solo FoveaVLA-Single), con IoU 0,70 en datos de validación frente a 0,99 en entrenamiento.
- No se documentan capacidades de tool calling, agentes multi-paso, matemáticas, código ni multilingüismo general; el alcance es estrictamente VLA robótico.

## Casos de uso

- Reproducción y auditoría de FoveaVLA: el repositorio permite comparar directamente π0.5 con y sin muñeca frente a FoveaVLA-Single bajo un mismo recetario, usando los parches `foveavla_so101.patch` y `openpi_so101drawer.patch` sobre los commits indicados.
- Investigación en foveación visual para robótica: el modelo C sirve para estudiar cómo afecta el recorte foveal y la profundidad métrica al error de acción en tareas de manipulación con un solo brazo.
- Benchmark de bucle abierto: los ficheros `eval/{A,B,C}/queries.csv` permiten recalcular MAE por articulación y comparar contra nuevas variantes sin necesidad de ejecutar rollouts físicos.
- Prototipado en robot de bajo coste SO101: al ser un checkpoint openpi compatible con LeRobot, puede desplegarse en un SO101 real para validar la tarea de cajón y bloque rojo en laboratorio.
- Estudio de etiquetado automático de cajas de interacción: el pipeline con Qwen3-VL-8B, limpieza de trayectorias e interpolación es reutilizable para otras tareas de manipulación con anotación manual costosa.
- Docencia y formación en VLA: el conjunto de tres checkpoints con receta idéntica y resultados públicos constituye un material didáctico para explicar la diferencia entre métricas de bucle abierto y cerrado.

## Benchmarks y rendimiento

Resultados de bucle abierto sobre 6 episodios de validación (2, 15, 17, 28, 34, 44), 817 consultas, chunk de 16 pasos, MAE en unidades articulares normalizadas ±100 (menor es mejor):

| Modelo | MAE (chunk 16) | MAE (primeros 8) | j0 | j1 | j2 | j3 | j4 | pinza |
|---|---|---|---|---|---|---|---|---|
| A: π0.5 top + wrist | 2,69 | 1,98 | 1,82 | 2,94 | 3,53 | 3,01 | 3,10 | 1,74 |
| B: π0.5 top only | 3,22 | 2,33 | 2,11 | 3,66 | 3,98 | 3,88 | 3,62 | 2,04 |
| C: FoveaVLA-Single (cajas propias) | 3,39 | 2,45 | 2,31 | 3,71 | 4,34 | 4,17 | 3,69 | 2,10 |
| C: FoveaVLA-Single (cajas etiquetadas) | 3,36 | 2,42 | 2,30 | 3,69 | 4,23 | 4,15 | 3,61 | 2,14 |

Diferencias pareadas con IC 95% por bootstrap a nivel de episodio: C − B = +0,17 [0,08; 0,25]; B − A = +0,53 [0,45; 0,61]. El modelo A tiene el menor error en los 6 episodios. El artículo original reporta éxito en bucle cerrado de FoveaVLA-Single 70,8%, π0.5 con muñeca 52,1% y π0.5 con vista única 6,3%, pero en este repositorio no se ejecutaron rollouts en bucle cerrado, por lo que el ranking del paper no se reproduce con estas métricas.

## Requisitos de hardware

- Entrenamiento: 1× H100 80GB para los tres checkpoints (batch 32, 20.000 pasos).
- VRAM de inferencia: no disponible en la información proporcionada; el repositorio pesa 37,3 GB para tres checkpoints, lo que sugiere varios GB por checkpoint en precisión de entrenamiento.
- GPU recomendadas: H100 para entrenamiento; para inferencia se desconoce el mínimo, aunque al ser checkpoints JAX/openpi se espera compatibilidad con GPUs NVIDIA de datacenter (A100, H100) y posiblemente consumer de gama alta.
- Cabe en GPU consumer: no confirmado; no disponible.
- Opciones de despliegue: openpi (JAX) con `policy_config.create_trained_policy` y configuraciones `pi05_so101_drawer_top_wrist`, `pi05_so101_drawer_top` y `foveavla_so101_single`; integración con LeRobot declarada en la librería. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles para inferencia; solo se reportan tiempos de entrenamiento (1,3–1,8 s/paso).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FoveaVLA-Single (este repo, C) | no disponible | no disponible | top + foveal + profundidad | Apache 2.0 | Hugging Face |
| π0.5 top + wrist (este repo, A) | no disponible | no disponible | top + wrist | Apache 2.0 | Hugging Face |
| π0.5 top only (este repo, B) | no disponible | no disponible | top | Apache 2.0 | Hugging Face |
| π0.5 base (physical-intelligence/pi05_base) | no disponible | no disponible | multimodal general | no disponible | Hugging Face |
| Receta openpi `pi05_so101_leftarm_multitask` | no disponible | no disponible | marcos crudos | no disponible | openpi |

La comparativa se limita a variantes del mismo backbone porque no se dispone de datos de modelos VLA alternativos en la información proporcionada. La receta `pi05_so101_leftarm_multitask` de openpi es un modelo distinto (entrenador PyTorch, horizonte 50, batch 128, decaimiento coseno, sin EMA, marcos crudos) y no debe confundirse con estos checkpoints.

## Limitaciones y advertencias

- Una sola tarea y un solo brazo (SO101 izquierdo): no generaliza a otras tareas sin reentrenamiento.
- Dataset pequeño: 49 episodios de entrenamiento, insuficiente para conclusiones robustas sobre generalización.
- Métrica de bucle abierto: el MAE no equivale a tasa de éxito en bucle cerrado; el ranking del paper no se reproduce con estos datos.
- Cajas de interacción automáticas: generadas con Qwen3-VL-8B y revisadas visualmente, no son las del artículo original; el 15% de fotogramas usa imagen completa como recorte.
- IoU de foveación degradado en validación (0,70 frente a 0,99 en entrenamiento), lo que indica sobreajuste del predictor de cajas.
- Riesgo de alucinación visual y de acciones fuera de distribución en escenarios distintos al entrenamiento; no se documentan evaluaciones de seguridad.
- Idiomas: solo se documentan prompts en inglés; no hay soporte multilingüe declarado.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación en bucle cerrado y de datos de seguridad desaconseja despliegues en producción sin validación adicional.
- Sin datos de sesgos, robustez ante cambios de iluminación, oclusiones o variaciones de la escena.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/twanghcmut/foveavla-so101-drawer-red-block
- Dataset: https://huggingface.co/datasets/hungho77/so101-left_arm_task_drawer_placing_red_squre_block
- Repositorio FoveaVLA: https://github.com/Stanford-TML/FoveaVLA
- Modelo base: https://huggingface.co/physical-intelligence/pi05_base
- Artículo FoveaVLA: arXiv 2610.20064 (referenciado en la model card)
