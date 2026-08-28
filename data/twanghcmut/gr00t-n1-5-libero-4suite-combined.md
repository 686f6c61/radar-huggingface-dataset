# twanghcmut/GR00T-N1.5-LIBERO-4suite-combined

## Resumen
GR00T-N1.5-LIBERO-4suite-combined es un modelo de visión-lenguaje-acción (VLA) desarrollado por twanghcmut, que consiste en un ajuste fino del modelo base nvidia/GR00T-N1.5-3B de NVIDIA sobre las cuatro suites de LIBERO (espacial, objeto, objetivo y larga) combinadas en un único conjunto de entrenamiento. El objetivo es obtener un único checkpoint que funcione para las cuatro suites, en lugar de un modelo especializado por suite, facilitando la comparación entre generaciones de GR00T bajo un mismo protocolo. El modelo se creó específicamente como referencia para investigación de cuantización, proporcionando una línea base estable en bfloat16 para medir el rendimiento de versiones de baja precisión.

Con 2.724.163.520 parámetros (aproximadamente 2,7 mil millones), el modelo emplea una arquitectura compuesta por un codificador de visión SigLIP-400M, un LLM Qwen3-1.7B recortado en la capa 12 y una cabeza de acción DiT de 16 capas con banco de tokens de visión futura. Está diseñado para tareas de manipulación robótica en entornos simulados como LIBERO, con un horizonte de acción de 16 y 4 pasos de denoising. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas.

La relevancia de este modelo radica en su papel como referencia para estudios de cuantización en modelos VLA, y en su enfoque de entrenamiento conjunto sobre múltiples suites, que plantea un equilibrio entre generalización y rendimiento especializado. Los resultados de evaluación en bucle cerrado muestran una tasa de éxito de 0,575 en PyTorch bf16 y 0,650 con TensorRT bf16, dentro del ruido estadístico para 40 episodios.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP-400M (vision tower) + Qwen3-1.7B (LLM recortado en select_layer=12) + DiT de 16 capas (action head) con future-vision token bank |
| Parametros totales | 2.724.163.520 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base, no especificada en la documentación) |
| Tipos de cuantizacion | no disponible (el modelo se publica en bf16; se usó como referencia para estudios de cuantización, pero no se incluyen pesos cuantizados) |
| Idiomas soportados | no disponible (el modelo procesa instrucciones en lenguaje natural, presumiblemente inglés, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model-00001-of-00002.safetensors, model-00002-of-00002.safetensors) |

## Arquitectura y entrenamiento
El modelo sigue la arquitectura de GR00T N1.5, que combina un codificador de visión SigLIP de 400 millones de parámetros con un LLM Qwen3-1.7B, del cual se recortan las capas superiores (select_layer=12). La salida del LLM alimenta una cabeza de acción basada en un DiT (Diffusion Transformer) de 16 capas, que utiliza un banco de tokens de visión futura para generar acciones. El modelo opera con un estado de 8 dimensiones y acciones de 7 dimensiones (compatible con el robot Panda de LIBERO), un horizonte de acción de 16 y 4 pasos de denoising.

El entrenamiento se realizó sobre las cuatro suites de LIBERO (spatial, object, goal y long) combinadas en un único conjunto de datos, con 20.000 pasos (9,36 épocas) y una pérdida final de entrenamiento de 0,0305. La precisión de entrenamiento es bfloat16. No se menciona el uso de RLHF o DPO; el ajuste fino es supervisado sobre demostraciones. El checkpoint se diseñó explícitamente como referencia para investigación de cuantización, por lo que la estabilidad del modelo en punto flotante es un requisito clave.

## Capacidades
- Generación de acciones de manipulación robótica a partir de entradas multimodales (imágenes y lenguaje).
- Ejecución en bucle cerrado (closed-loop) sobre el benchmark LIBERO, con soporte para las cuatro suites en un único checkpoint.
- Procesamiento de instrucciones en lenguaje natural para especificar tareas (p. ej., "abre el cajón", "coloca el objeto en la posición objetivo").
- Integración con el stack Isaac-GR00T de NVIDIA, permitiendo carga directa mediante la clase `Gr00tPolicy`.
- Compatible con runtime de TensorRT para aceleración de inferencia (se evaluó con TensorRT bf16).
- Diseñado para servir como línea base en estudios de cuantización (INT8, W4A4, GPTQ), gracias a su comportamiento estable en bf16.

## Casos de uso
- Investigación en cuantización de modelos VLA: el modelo sirve como referencia float para medir el impacto de cuantizaciones de baja precisión (INT8, INT4) en el rendimiento de políticas robóticas, permitiendo aislar el error introducido por la reducción de bits.
- Evaluación comparativa de generaciones GR00T: al entrenarse con el mismo protocolo que el modelo N1.7 combinado, permite comparar directamente el rendimiento de N1.5 y N1.7 bajo condiciones idénticas de datos y evaluación.
- Desarrollo de políticas generalistas para manipulación en simulación: el checkpoint único para las cuatro suites LIBERO facilita el despliegue en entornos que requieren múltiples tipos de tareas sin necesidad de cambiar de modelo.
- Validación de pipelines de inferencia en tiempo real: con TensorRT bf16 se logra una tasa de éxito de 0,650 en 40 episodios, útil para probar despliegues en hardware con aceleración TensorRT.
- Entrenamiento de modelos derivados: al ser un checkpoint estable y con licencia Apache 2.0, puede usarse como punto de partida para ajustes finos adicionales en tareas de manipulación específicas.
- Benchmarking de hardware robótico: el modelo permite evaluar el rendimiento de GPUs y sistemas embebidos en tareas de control de robots, gracias a su tamaño moderado (2,7B) y su compatibilidad con el stack Isaac-GR00T.

## Benchmarks y rendimiento
La evaluación se realizó en bucle cerrado sobre LIBERO, con 1 episodio por tarea en 4 suites × 10 tareas = 40 episodios, con MAX_STEPS=520 y N_ACTION_STEPS=8, en una partición MIG de H100. Los resultados se presentan en la tabla siguiente:

| Runtime | Tasa de éxito |
|---|---|
| PyTorch (bf16, referencia) | 23/40 = 0,575 |
| TensorRT bf16 | 26/40 = 0,650 |

Con n=40, el ruido estadístico es de aproximadamente ±2 episodios (±5 puntos porcentuales), por lo que ambas filas son equivalentes dentro del margen de error. El autor indica que estos números son más bajos que los de checkpoints especializados por suite, lo cual es el coste esperado de entrenar un único modelo para las cuatro suites. No se han publicado resultados adicionales de benchmarks como MMLU o HumanEval, ya que el modelo está orientado a robótica y no a tareas de lenguaje o código.

## Requisitos de hardware
- VRAM estimada: el modelo tiene 2,72 mil millones de parámetros. En bf16 (2 bytes por parámetro), el peso ocupa aproximadamente 5,4 GB. Con overhead de activaciones y optimizador, se requiere al menos 8 GB de VRAM para inferencia en bf16; con cuantización INT8 (1 byte por parámetro) se reduce a ~2,7 GB, y con INT4 a ~1,4 GB, aunque no se publican pesos cuantizados.
- GPU recomendadas: la evaluación se realizó en una partición MIG de H100 (NVIDIA). Para inferencia en bf16, una GPU con 16 GB o más (p. ej., RTX 4080, RTX 4090, A100, L4) es suficiente. Con cuantización, podría ejecutarse en GPUs de 8 GB (p. ej., RTX 3060, RTX 3070), pero no hay pruebas oficiales.
- Compatibilidad con consumer GPU: sí, en principio una RTX 4090 (24 GB) puede ejecutar el modelo en bf16 sin problemas. Para GPUs con menos VRAM, se requeriría cuantización.
- Opciones de despliegue: el modelo se carga mediante el stack Isaac-GR00T (clase `Gr00tPolicy`), que soporta PyTorch y TensorRT. También es compatible con LeRobot (documentación disponible) y con cualquier runtime que lea el formato GR00T N1.5.
- Latencia y throughput: no se proporcionan datos específicos de latencia o throughput. La evaluación se realizó con MAX_STEPS=520 y N_ACTION_STEPS=8, pero sin tiempos reportados.

## Comparativa con modelos similares
No se dispone de datos de benchmarks comparativos para otros modelos VLA en las mismas condiciones (mismo protocolo de evaluación, mismo conjunto de datos). El autor menciona un modelo compañero `twanghcmut/GR00T-N1.7-LIBERO-4suite-combined` entrenado con la misma receta, pero no se publican sus resultados en esta documentación. Comparación cualitativa con alternativas:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GR00T-N1.5-LIBERO-4suite-combined (este) | 2,7B | no disponible | Apache 2.0 | HuggingFace |
| nvidia/GR00T-N1.5-3B (base) | ~3B | no disponible | Apache 2.0 | HuggingFace |
| GR00T N1.7 (NVIDIA) | no disponible | no disponible | Apache 2.0 | GitHub/HuggingFace |

La comparación directa con especialistas por suite (p. ej., youliangtan/gr00t-n1.5-libero-spatial-posttrain) no es posible sin datos numéricos, pero el autor indica que el rendimiento de este modelo combinado es inferior al de los especialistas, como se espera.

## Limitaciones y advertencias
- Rendimiento inferior a especialistas por suite: al entrenar un único checkpoint para las cuatro suites, la tasa de éxito (0,575-0,650) es menor que la de modelos ajustados individualmente para cada suite, como se indica en la model card.
- Alcance limitado a LIBERO: el modelo está ajustado exclusivamente sobre el benchmark LIBERO (simulación). No hay evidencia de generalización a otras tareas o entornos sin ajuste adicional.
- Sin datos de sesgos: no se han realizado análisis de sesgos o comportamientos no deseados. Como modelo de robótica, su uso en entornos reales requiere validación cuidadosa de seguridad.
- Riesgo de alucinación en acciones: al ser un modelo generativo basado en difusión, puede producir acciones incoherentes en situaciones fuera de distribución, especialmente con instrucciones ambiguas o imágenes poco comunes.
- Requisito de configuración específica: para N1.5, es necesario fijar el tiling de imágenes en inferencia (`min_dynamic_tiles=1`, `max_dynamic_tiles=1`, `use_thumbnail=False`) y usar el embodiment tag `new_embodiment` (ID 31), lo que puede complicar el despliegue en stacks que no sigan estas instrucciones.
- Sin cuantizaciones publicadas: aunque el modelo se creó para investigación de cuantización, no se incluyen pesos cuantizados en el repositorio; el usuario debe aplicar sus propias técnicas de cuantización.
- Datos de evaluación limitados: los resultados se basan en 40 episodios (1 por tarea), un tamaño de muestra pequeño que implica una alta varianza. No se recomienda usar estos números como garantía de rendimiento en producción.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/twanghcmut/GR00T-N1.5-LIBERO-4suite-combined
- Página de investigación de GR00T N1.5 (NVIDIA): https://research.nvidia.com/labs/gear/gr00t-n1_5/
- Documentación de LeRobot para GR00T: https://huggingface.co/docs/lerobot/v0.4.3/groot
- Repositorio Isaac-GR00T en GitHub: https://github.com/NVIDIA/Isaac-GR00T
- Ejemplo de LIBERO en Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T/tree/main/examples/LIBERO
- Modelo compañero N1.7 combinado: https://huggingface.co/twanghcmut/GR00T-N1.7-LIBERO-4suite-combined
