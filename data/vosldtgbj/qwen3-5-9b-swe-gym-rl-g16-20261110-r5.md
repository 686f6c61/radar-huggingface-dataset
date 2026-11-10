# vosldtgbj/Qwen3.5-9B-SWE-Gym-RL-G16-20261110-r5

## Resumen

Qwen3.5-9B-SWE-Gym-RL-G16-20261110-r5 es un checkpoint intermedio de investigación publicado por el usuario vosldtgbj en Hugging Face. Se trata de un ajuste fino por aprendizaje por refuerzo (RL) del modelo base Qwen/Qwen3.5-9B, orientado a tareas de ingeniería de software (resolución de issues reales sobre repositorios) y entrenado sobre el dataset SWE-Gym con evaluación en SWE-bench Verified. El modelo conserva la arquitectura multimodal original de Qwen3.5 (pipeline image-text-to-text) y todos los parámetros del modelo de lenguaje se entrenan, mientras que los activos visuales y MTP originales se mantienen.

El checkpoint corresponde a la revisión r5 del experimento `swe-gym-qwen35-9b-20261110-r5` y, según la model card, contiene los pesos tras **0 actualizaciones exitosas de Adam**. Es decir, pese a estar etiquetado como modelo entrenado, en la práctica los pesos coinciden con el export del paso 0 (base sin modificar) en el momento de la publicación. El autor lo declara explícitamente como "training in progress" y "intermediate research model, not a final release".

Su relevancia es principalmente metodológica: documenta un pipeline completo de RL con GRPO sobre tareas SWE-Gym (2.438 tareas, 16 trayectorias por tarea, 39.008 trayectorias planificadas) usando Miles + Megatron-LM + SGLang sobre una máquina local de 8 × H200, con contexto de 262.144 tokens y generación por respuesta de hasta 81.920 tokens. No es un modelo para producción, sino una pieza de un experimento reproducible y auditable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5, pipeline image-text-to-text); detalles internos de capas no disponibles |
| Parametros totales | 9.653.104.368 (≈9,65 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (contexto de entrenamiento declarado) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponibles en la informacion proporcionada |
| Licencia | no disponible en la ficha; la model card remite a la licencia y terminos del modelo base Qwen/Qwen3.5-9B |
| Formato de pesos | safetensors (BF16), libreria transformers |
| Modelo base | Qwen/Qwen3.5-9B |
| Tamano del repositorio | 19,3 GB |
| Dataset de entrenamiento | SWE-Gym/SWE-Gym (2.438 tareas) |
| Dataset de evaluacion | SWE-bench/SWE-bench_Verified |
| Estado | Checkpoint intermedio, 0 actualizaciones exitosas de Adam |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer multimodal de la familia Qwen3.5 con capacidad image-text-to-text. El ajuste se realiza con aprendizaje por refuerzo mediante GRPO (sin normalización por desviación estándar del grupo), con tasa de aprendizaje Adam de 1e-6, betas (0,9, 0,95) y weight decay 0. El entrenamiento se ejecuta con Miles + Megatron-LM + SGLang sobre una única máquina local con 8 × H200, con paralelismo de tensor TP=4 y DP=1. El verificador diagnóstico es Qwen/Qwen3.8-27B en BF16 servido con vLLM, separado del reward real, que se calcula con los tests aislados oficiales de cada tarea.

El dataset SWE-Gym se recorre una vez completo (2.438 tareas) con 16 trayectorias por tarea, lo que supone 39.008 trayectorias planificadas. La recolección documentada en esta revisión abarca 16 tareas y 256 trayectorias, con batch global del optimizador de 128, microbatch 1 y una cola real final de 96 trayectorias. El modo thinking está habilitado y se preserva; el contexto es de 262.144 tokens, la generación por respuesta de 81.920 y la generación por trayectoria de 196.608. El muestreo usa temperatura 1, top_p 1 y top_k -1, entendidos como techos y no como objetivos. Los minibatches con ventaja cero no actualizan parámetros ni avanzan el scheduler. El checkpoint publicado, no obstante, refleja 0 actualizaciones exitosas de Adam, por lo que los pesos equivalen al export del paso 0.

## Capacidades

- Generación de texto conversacional y razonamiento con modo thinking habilitado y preservado.
- Resolución de tareas de ingeniería de software: localización de bugs, edición de código y generación de parches sobre repositorios reales (objetivo del ajuste RL con SWE-Gym).
- Capacidad multimodal image-text-to-text heredada del modelo base Qwen3.5-9B (los activos visuales originales se conservan).
- Soporte de contexto largo: hasta 262.144 tokens declarados en entrenamiento, con generación de hasta 81.920 tokens por respuesta.
- Tool calling / function calling: no disponible explícitamente en la información proporcionada (esperable en la familia Qwen3.5, pero no confirmado para este checkpoint).
- Soporte de agentes y razonamiento multi-paso: el entrenamiento con trayectorias de 196.608 tokens sugiere interacción multi-paso con entorno, aunque no se documenta un formato de agente público.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en RL para código: usar el checkpoint como referencia de paso 0 en experimentos de GRPO sobre SWE-Gym, comparando contra revisiones posteriores del mismo experimento para aislar el efecto del entrenamiento.
- Reproducción de pipelines de RL a escala: el modelo documenta configuración de Megatron-LM, SGLang y vLLM con TP=4 sobre 8 × H200, útil como plantilla para montar entrenamientos de resolución de issues.
- Evaluación de agentes de software: servir el modelo con vLLM o SGLang y conectarlo a un arnés tipo SWE-bench para medir la línea base del modelo base antes de aplicar RL.
- Estudio de contextos largos: probar la ventana de 262.144 tokens en tareas de comprensión de repositorios completos o de historiales de conversación extensos.
- Análisis de trayectorias: inspeccionar las 256 trayectorias recolectadas (16 tareas) para estudiar el comportamiento del modelo base en entornos de ejecución de tests.
- Prototipado multimodal: aprovechar la conservación de activos visuales para experimentos image-text-to-text sobre el mismo backbone de 9,65 mil millones de parámetros.
- Docencia y auditoría de experimentos: el repositorio incluye `model-export.json` con hashes SHA-256 e identidad de snapshots, útil para enseñar trazabilidad de checkpoints.

## Benchmarks y rendimiento

| Evaluacion | Paso del optimizador | Resueltas / validas | Excluidas |
|---|---:|---:|---:|
| baseline-original (Qwen3.5-9B) | 0 | 298/500 (59,6 %) | 0 |

El único resultado publicado corresponde a la línea base del modelo original sobre SWE-bench Verified, no a una revisión entrenada. La evaluación usa una trayectoria válida por tarea, hasta cinco intentos de infraestructura y exclusión declarada de tareas agotadas; los fallos válidos del modelo no se reintentan. No se han publicado resultados de benchmarks para esta revisión r5 en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 19,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB para inferencia básica y 40-80 GB para contexto largo.
- Cuantización a 8 bits: en torno a 10-11 GB de pesos; a 4 bits, en torno a 5-6 GB, aunque no se publican GGUF oficiales.
- GPU recomendadas: H200 (usada en entrenamiento), H100, A100 80 GB para contexto completo de 262.144 tokens; RTX 4090 (24 GB) viable en BF16 con contexto moderado o en cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantización o contexto reducido; en 24 GB en BF16 el contexto largo queda limitado.
- Opciones de despliegue: transformers (librería declarada), vLLM y SGLang (usados en el pipeline), endpoints_compatible según tags; llama.cpp/Ollama no confirmados por falta de GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-SWE-Gym-RL-G16 (este) | 9,65 B | 262.144 | RL sobre SWE-Gym, checkpoint paso 0 | Remite a Qwen3.5-9B | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-9B (base) | 9,65 B | no disponible en la informacion | Modelo generalista multimodal | La del modelo base | Hugging Face |
| Qwen/Qwen3.8-27B | 27 B (aprox., por nombre) | no disponible | Verificador diagnostico del pipeline | no disponible | Uso interno en el experimento |

No se dispone de datos de benchmarks de alternativas comparables en la información proporcionada; la comparación se limita a parámetros, contexto y naturaleza del ajuste.

## Limitaciones y advertencias

- El checkpoint contiene 0 actualizaciones exitosas de Adam: los pesos equivalen al export del paso 0, por lo que no incorpora mejora alguna del RL.
- Es un modelo de investigación intermedio, no una release final; no debe usarse en producción.
- La licencia no está indicada en la ficha; la model card remite a los términos del modelo base Qwen/Qwen3.5-9B, que deben verificarse antes de cualquier uso comercial.
- Riesgo de alucinación y de parches incorrectos no cuantificado para esta revisión; no hay evaluación propia publicada.
- Idiomas soportados no documentados para este checkpoint.
- El estado de recuperación del optimizador se guarda temporalmente en `/dev/shm` con retención de los dos más recientes; una pérdida obligaría a declarar un reinicio del optimizador o una nueva rama.
- Las métricas de SWE-bench Verified publicadas (298/500) corresponden al modelo original, no a esta revisión.
- El modelo conserva activos visuales y MTP del base, pero no se documenta el comportamiento multimodal tras el ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vosldtgbj/Qwen3.5-9B-SWE-Gym-RL-G16-20261110-r5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset SWE-Gym: https://huggingface.co/datasets/SWE-Gym/SWE-Gym
- Dataset SWE-bench Verified: https://huggingface.co/datasets/SWE-bench/SWE-bench_Verified
- Verificador diagnóstico: https://huggingface.co/Qwen/Qwen3.8-27B
