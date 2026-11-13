# U-WIN/qwen35-9b-harvey-v4-notes-r0-r22-ntp-350m-kl-0p01

## Resumen

El modelo `qwen35-9b-harvey-v4-notes-r0-r22-ntp-350m-kl-0p01`, publicado por el usuario U-WIN, es un ajuste fino completo (full fine-tune) del modelo base Qwen/Qwen3.5-9B. Se trata de un modelo multimodal de tipo image-text-to-text, es decir, acepta entradas conjuntas de imagen y texto y genera respuestas textuales. Con 9.653.104.368 parámetros totales según los pesos en safetensors, se posiciona en la franja de los 9B, un tamaño que permite despliegue en hardware de gama alta de consumo mediante cuantización.

El nombre del repositorio revela detalles del proceso de entrenamiento: "harvey" y "calderwood-harkness" aparecen como etiquetas, "notes-only" sugiere que el ajuste se realizó exclusivamente sobre un corpus de notas, "ntp-350m" apunta a un entrenamiento de next-token prediction sobre 350 millones de tokens (o pasos, el dato exacto no está disponible) y "kl-0p01" indica regularización KL con coeficiente 0,01, probablemente para preservar el comportamiento del modelo base y evitar el olvido catastrófico. La revisión "r0-r22" sugiere una secuencia de iteraciones o checkpoints.

La relevancia de este modelo es acotada: se trata de un experimento de ajuste fino con cero descargas y cero likes en el momento de la consulta, con acceso restringido (gated) y sin documentación pública sobre idiomas, benchmarks o composición del dataset. Resulta útil como referencia para quienes investigan técnicas de regularización KL en fine-tuning de modelos multimodales, pero no como opción de producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (derivada de Qwen3.5-9B); detalles internos no disponibles |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-9B |
| Tipo de ajuste | full fine-tune, notes-only, next-token prediction, KL regularization (coef. 0,01) |
| Acceso | restringido (gated) |
| Tamano del repo | 19,3 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-9B, un transformer multimodal de la familia Qwen 3.5 que procesa entradas de imagen y texto. El repositorio no incluye documentación técnica sobre la configuración interna (número de capas, dimensión oculta, cabezas de atención, mecanismo de fusión visual) más allá de la etiqueta `qwen3_5` y el pipeline `image-text-to-text`. Los 9.653.104.368 parámetros confirman que se conserva la práctica totalidad del modelo base, coherente con un full fine-tune y no con un ajuste LoRA.

El proceso de entrenamiento, inferido del nombre del repositorio, combina next-token prediction sobre un corpus de "notas" (notes-only) con una penalización KL de coeficiente 0,01 respecto al modelo base, técnica habitual para limitar la deriva de la distribución de salida y mitigar el olvido catastrófico. El sufijo "350m" podría referirse a 350 millones de tokens de entrenamiento o a un tamaño de lote acumulado, pero no hay confirmación en la información disponible. No se especifican la composición del dataset, la presencia de RLHF/DPO ni innovaciones técnicas adicionales.

## Capacidades

- Generación de texto conversacional y multimodal: acepta imágenes junto con texto y produce respuestas textuales, según el pipeline declarado `image-text-to-text`.
- Procesamiento de imágenes: al heredar la arquitectura de Qwen3.5-9B, se espera capacidad de descripción, respuesta a preguntas visuales y razonamiento sobre contenido gráfico, aunque no se documenta el alcance exacto tras el ajuste.
- Razonamiento y generación de texto: capacidad base del modelo Qwen3.5-9B, potencialmente preservada gracias a la regularización KL.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (thinking mode, audio, etc.): no disponible.

## Casos de uso

- Investigación sobre regularización KL en fine-tuning: el modelo sirve como caso de estudio reproducible para analizar cómo un coeficiente KL de 0,01 sobre un corpus de notas afecta a la deriva respecto al base Qwen3.5-9B, comparando distribuciones de salida en tareas de retención.
- Evaluación de olvido catastrófico en modelos multimodales: al ser un full fine-tune con regularización, permite medir la degradación de capacidades visuales y textuales del base frente al ajustado en un conjunto de pruebas controlado.
- Experimentos de ajuste "notes-only": útil para estudiar cómo un corpus especializado de notas moldea el estilo y el dominio de respuesta de un modelo de 9B sin instrucciones generales adicionales.
- Prototipado de asistentes sobre documentación visual: si el ajuste conserva la capacidad image-text-to-text, podría emplearse para responder preguntas sobre capturas, diagramas o notas escaneadas en un entorno interno de I+D.
- Reproducción de pipelines de full fine-tune en transformers: el repo (19,3 GB en safetensors) permite validar flujos de carga, serialización y despliegue con la librería transformers en configuraciones de un solo nodo multi-GPU.
- Base para posteriores ajustes supervisados: al estar licenciado Apache 2.0 y derivar de Qwen3.5-9B, puede servir como punto de partida para fine-tunes adicionales orientados a dominios concretos, siempre que se acepte la condición de acceso gated.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 19,3 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 24 GB y, para contexto largo, 40 GB o más.
- Cuantización a 8 bits: en torno a 10-11 GB de pesos, viable en GPUs de 16-24 GB (RTX 4080/4090, A10G, L4).
- Cuantización a 4 bits: en torno a 5-6 GB de pesos, potencialmente desplegable en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4070), aunque no se publican pesos GGUF en el repositorio.
- GPUs recomendadas para producción: A100 40/80 GB, H100 80 GB o L40S para inferencia en bf16 con contexto amplio; RTX 4090 24 GB para experimentación en fp16 con contexto moderado.
- Opciones de despliegue: transformers (librería declarada), con posibilidad de servir mediante vLLM o TGI si se valida compatibilidad con la arquitectura qwen3_5; llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Acceso |
|---|---|---|---|---|---|
| U-WIN/qwen35-9b-harvey-v4-... | 9,65B | no disponible | image-text-to-text | Apache 2.0 | Gated |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible en esta ficha | image-text-to-text | según repo base | Público (habitual) |
| Fine-tunes comunitarios de Qwen 9B | ~9B | variable | texto o multimodal | variable | variable |

La comparación cuantitativa de rendimiento no está disponible al no publicarse benchmarks del ajuste ni del base en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que limita la reproducibilidad y el uso automatizado en pipelines.
- Ausencia de documentación: no se declaran idiomas, composición del dataset, hiperparámetros completos ni evaluación, lo que impide garantizar comportamiento en producción.
- Riesgo de olvido catastrófico: pese a la regularización KL de 0,01, un full fine-tune "notes-only" puede degradar capacidades del base Qwen3.5-9B en tareas no representadas en el corpus de notas.
- Riesgo de alucinación: inherente a los modelos generativos de 9B; sin benchmarks ni RLHF documentado, no puede acotarse su magnitud.
- Sesgos: desconocidos, al no publicarse información sobre el corpus de entrenamiento ni sobre procesos de alineación.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse la licencia y condiciones del modelo base Qwen3.5-9B y el cumplimiento de los términos de acceso gated.
- Idiomas: no declarados; no debe asumirse un soporte multilingüe amplio sin evaluación previa.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin señales de validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/U-WIN/qwen35-9b-harvey-v4-notes-r0-r22-ntp-350m-kl-0p01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
