# tongji-franka/fr3-groot-hamlet-v6

## Resumen

fr3-groot-hamlet-v6 es un modelo de visión-lenguaje-acción (VLA) publicado por el usuario tongji-franka en Hugging Face. Se trata de un fine-tuning del modelo base nvidia/GR00T-N1.6-3B, desarrollado por NVIDIA dentro de su familia GR00T orientada a robótica generalista. El modelo está especializado en tareas de manipulación robótica sobre un brazo Franka Research 3 (FR3), y por el nombre del repositorio y las etiquetas asociadas se infiere un ajuste orientado a tareas de tipo "hockey" y al entorno de trabajo denominado Hamlet.

El problema que aborda es el control de robots manipuladores mediante instrucciones en lenguaje natural combinadas con observaciones visuales: el modelo recibe imágenes y texto y emite acciones motrices. Al derivar de un modelo base de 3B parámetros, hereda la arquitectura y el pipeline de entrenamiento de GR00T N1.6, pero el ajuste fino lo adapta a un hardware y un conjunto de tareas concretos.

La relevancia es acotada: se trata de un modelo de investigación muy específico, con cero descargas y cero likes en el momento de la ficha, acceso restringido y licencia de investigación de NVIDIA. No es un modelo de propósito general ni está pensado para despliegue comercial sin revisar las condiciones de la licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en el modelo base nvidia/GR00T-N1.6-3B; detalles internos no disponibles |
| Parámetros totales | no disponible (el nombre del modelo base sugiere ~3B, sin confirmación oficial en la ficha) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | zh (según etiquetas de Hugging Face) |
| Licencia | nvidia-research-license (licencia de investigación de NVIDIA; uso comercial restringido) |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del modelo base nvidia/GR00T-N1.6-3B, que pertenece a la familia GR00T de NVIDIA para robótica generalista. La etiqueta `vision-language-action` confirma que se trata de un modelo que integra percepción visual, comprensión del lenguaje y generación de acciones motrices en un único pipeline, típico de los sistemas VLA contemporáneos. Los detalles concretos de la arquitectura interna (tipo de backbone, mecanismo de atención, tokenizador de acciones) no están disponibles en la información proporcionada más allá de la referencia al modelo base.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset de ajuste fino, ni si se aplicaron técnicas de RLHF, DPO o aprendizaje por imitación. El nombre del repositorio sugiere un ajuste específico sobre el robot Franka FR3 y un entorno o tarea denominada "hamlet" con connotaciones de "hockey", pero no hay documentación pública que lo confirme.

## Capacidades

- Control robótico de manipulación: generación de acciones motrices a partir de observaciones visuales e instrucciones en lenguaje natural, orientado al brazo Franka Research 3.
- Percepción visual integrada: procesamiento de imágenes como entrada para la toma de decisiones motrices.
- Comprensión de instrucciones en lenguaje natural: herencia del componente de lenguaje del modelo base GR00T.
- Ejecución de tareas específicas de manipulación: por las etiquetas del repositorio, orientado a tareas tipo "hockey" en el entorno "hamlet".
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al chino (zh) según las etiquetas; no se confirman otros idiomas.
- Capacidades especiales (thinking mode, visión, audio): visión confirmada por la naturaleza VLA; audio y thinking mode no disponibles.

## Casos de uso

- Investigación en manipulación robótica con Franka FR3: el modelo puede emplearse como política de control entrenada para tareas específicas sobre este brazo, sirviendo de base para experimentos de aprendizaje por imitación y evaluación de políticas VLA.
- Benchmarking de modelos VLA en entornos controlados: al derivar de GR00T N1.6-3B, permite comparar el rendimiento del ajuste fino frente al modelo base en las mismas tareas de manipulación.
- Reproducción de experimentos académicos: el repositorio, asociado a tongji-franka, sugiere un contexto universitario (Universidad de Tongji) donde el modelo puede servir para replicar resultados publicados.
- Prototipado de tareas de pick-and-place o manipulación tipo hockey: las etiquetas indican un dominio de tarea concreto que puede extenderse a manipulaciones similares.
- Evaluación de robustez visual: al recibir imágenes como entrada, permite estudiar cómo varía la política ante cambios de iluminación, punto de vista o posición de objetos.
- Formación de estudiantes e investigadores: modelo de tamaño moderado (repo de 6,2 GB) que puede ejecutarse en infraestructura de laboratorio para prácticas de robótica con aprendizaje profundo.
- Integración en pipelines de simulación a real: como política entrenada, puede probarse primero en simuladores compatibles con GR00T y transferirse después al FR3 físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el tamaño del repositorio es de 6,2 GB, lo que sugiere que los pesos en precisión completa o media precisión caben en GPUs de 12-16 GB, aunque no se confirma.
- GPU recomendadas: no disponible; por el tamaño del modelo base (~3B), serían razonables GPUs como RTX 4090, A100 o H100, pero no hay datos oficiales.
- ¿Cabe en consumer GPU?: probablemente sí en GPUs de gama alta con suficiente VRAM, aunque no confirmado.
- Opciones de despliegue: no disponible; al ser un modelo de robótica con pipeline específico, requeriría el stack de inferencia de GR00T de NVIDIA, no confirmado en la ficha.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| tongji-franka/fr3-groot-hamlet-v6 | no disponible (~3B por el base) | no disponible | nvidia-research-license | Restringido (gated) | Fine-tuning de GR00T N1.6-3B para Franka FR3 |
| nvidia/GR00T-N1.6-3B | ~3B (según nombre) | no disponible | nvidia-research-license | No disponible en la información | Modelo base del que deriva |
| Otros modelos VLA (p. ej. OpenVLA, π0) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face; no es de descarga libre.
- Licencia de investigación: la nvidia-research-license restringe el uso comercial; es imprescindible revisar sus términos antes de cualquier despliegue productivo.
- Especialización estrecha: el modelo está ajustado para un robot concreto (Franka FR3) y un dominio de tarea específico; no es un modelo de propósito general.
- Idioma: las etiquetas solo indican chino (zh); el rendimiento en otros idiomas no está confirmado.
- Sin benchmarks publicados: no hay métricas de rendimiento que permitan evaluar su calidad frente a alternativas.
- Riesgo de alucinación y errores de política: como todo modelo VLA, puede generar acciones incorrectas o inseguras; requiere validación en entornos controlados antes de operar un robot físico.
- Sesgos: no disponible información sobre sesgos específicos; hereda los del modelo base y los datos de ajuste fino, no documentados.
- Madurez: cero descargas y cero likes en el momento de la ficha, lo que indica un modelo recién publicado y sin validación comunitaria.
- Documentación escasa: no hay model card detallada con datos de entrenamiento, evaluación o instrucciones de uso más allá de los metadatos.

## Enlaces

- Hugging Face: https://huggingface.co/tongji-franka/fr3-groot-hamlet-v6
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.6-3B
