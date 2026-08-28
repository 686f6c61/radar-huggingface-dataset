# symbiosika/right_pnp_multicube_32b_05d_235eps

## Resumen

El modelo `symbiosika/right_pnp_multicube_32b_05d_235eps` es un fine-tuning del modelo de robótica NVIDIA GR00T-N1.7-3B, desarrollado por el usuario symbiosika mediante la librería LeRobot. Está diseñado para controlar un brazo robótico en una tarea específica de pick-and-place de cubos con el brazo derecho, actuando en el espacio articular (joint-space). El modelo resuelve el problema de generar acciones motoras a partir de observaciones del entorno, un caso típico de aprendizaje por imitación en robótica.

Con 3,14 mil millones de parámetros, este checkpoint se entrenó sobre 234 episodios de demostración durante 20 000 pasos, alcanzando una pérdida final de 0,01. Su relevancia radica en demostrar el fine-tuning de un modelo base de manipulación robótica de NVIDIA sobre un dataset local, aunque la model card advierte explícitamente que la pérdida de entrenamiento no es una métrica de éxito en hardware real. El modelo se distribuye bajo licencia Apache 2.0 en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T-N1.7-3B (política de acción robótica) |
| Parametros totales | 3 144 016 000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de control motor, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos almacenados en float32) |
| Idiomas soportados | no aplica (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32, 11,7 GiB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `nvidia/GR00T-N1.7-3B`, un modelo de política de acción para manipulación robótica desarrollado por NVIDIA. La arquitectura concreta (transformer, MLP, etc.) no se detalla en la información disponible, pero se trata de un modelo de 3,14B parámetros que mapea observaciones (estado del robot y del entorno) a acciones articulares. El entrenamiento se realizó con LeRobot, una librería de aprendizaje por imitación para robótica, utilizando un dataset local de 234 episodios de la tarea `right_pnp_multicube` (pick-and-place con brazo derecho). Se emplearon 20 000 pasos de optimización con batch size 32, learning rate 0,0001 (AdamW), seed 1000 y action chunking de 40 pasos (chunk_size 40, n_action_steps 40). No se reservaron episodios de validación (`--eval-split 0`), por lo que la pérdida reportada (final 0,010, mínima 0,009) es solo de entrenamiento y no indica capacidad de generalización.

## Capacidades

- Generación de acciones articulares para control de un brazo robótico en tareas de pick-and-place de cubos.
- Aprendizaje por imitación: reproduce comportamientos demostrados en los 234 episodios de entrenamiento.
- Operación en espacio articular (joint-space), con calibración del brazo seguidor integrada en el checkpoint.
- Sin capacidades de lenguaje, tool calling, visión ni razonamiento multimodal (es un modelo puramente motor).
- Sin soporte para agentes ni multi-step reasoning fuera del ámbito robótico.

## Casos de uso

- Automatización de pick-and-place en entornos industriales: el modelo puede controlar un brazo robótico para recoger y colocar cubos de forma repetitiva, reduciendo la programación manual de trayectorias.
- Investigación en aprendizaje por imitación: sirve como caso de estudio para fine-tuning de GR00T-N1.7-3B sobre datasets específicos, evaluando el impacto del número de episodios y el chunking de acciones.
- Evaluación de políticas robóticas en simuladores o robots reales: mediante `bc/eval.py` de LeRobot se puede cargar el checkpoint y verificar su comportamiento sin energizar el hardware.
- Benchmark de calibración y robustez: el modelo exige que la calibración del brazo seguidor coincida con la del entrenamiento, por lo que es útil para estudiar la sensibilidad a la calibración en políticas de espacio articular.
- Desarrollo de pipelines de publicación de modelos robóticos: el repositorio incluye preprocesadores y postprocesadores que muestran cómo empaquetar un checkpoint entrenado con LeRobot para su distribución en Hugging Face.
- Formación en robótica: permite a estudiantes y desarrolladores explorar el flujo completo de entrenamiento, evaluación y despliegue de una política de manipulación con una herramienta open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reivindica ninguna tasa de éxito en hardware real y que la pérdida de entrenamiento no es una medida de rendimiento. No existen datos de MMLU, HumanEval u otros benchmarks estándar, ya que se trata de un modelo de control robótico y no de lenguaje o código.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos se almacenan en float32 (11,7 GiB), por lo que la carga requiere al menos 12 GiB de VRAM. Se recomienda convertirlos a bf16 (aproximadamente 6 GiB) para reducir el consumo.
- GPU recomendadas: NVIDIA RTX 3090 (24 GB), RTX 4090 (24 GB) o superiores para trabajar cómodamente con float32. Una GPU con 16 GB podría ser suficiente tras la conversión a bf16.
- No cabe en GPUs de consumo con menos de 12 GB sin cuantización, y no se ofrecen versiones cuantizadas (GGUF, etc.) en el repositorio.
- Opciones de despliegue: el modelo está pensado para usarse con la librería LeRobot (`bc/eval.py`), no con vLLM, llama.cpp u Ollama, que son específicas de modelos de lenguaje.
- Latencia y throughput: no se proporcionan datos. El entrenamiento registró una velocidad de 11 muestras por segundo en una GPU con 36 GB de memoria, lo que da una referencia orientativa para inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| symbiosika/right_pnp_multicube_32b_05d_235eps | 3,14B | no aplica | Apache 2.0 | Hugging Face |
| nvidia/GR00T-N1.7-3B (base) | 3,14B | no aplica | Apache 2.0 | Hugging Face |
| Otros fine-tunes de GR00T | no disponible | no disponible | no disponible | no disponible |

La comparativa directa se limita al modelo base, ya que no se han encontrado otros fine-tunes públicos de GR00T-N1.7-3B con características comparables. Este checkpoint se diferencia del base por estar especializado en una tarea concreta (pick-and-place de cubos) y por incluir preprocesadores y postprocesadores específicos para la entrada/salida de acciones.

## Limitaciones y advertencias

- Sesgos conocidos: no aplica (modelo no lingüístico), pero el entrenamiento con solo 234 episodios de un único entorno puede generar sobreajuste a las condiciones específicas de demostración.
- Riesgo de alucinación: no relevante en el sentido lingüístico, pero la política puede generar acciones incorrectas si las observaciones difieren del dominio de entrenamiento.
- Sin validación: no se reservaron episodios de validación, por lo que no hay evidencia de generalización a nuevos escenarios.
- Calibración crítica: el modelo actúa en el marco definido por la calibración del brazo seguidor. Recalibrar entre entrenamiento y evaluación produce errores de posicionamiento de varios centímetros.
- Dependencia de rutas locales: el checkpoint referencia una ruta local `base_models/GR00T-N1.7-3B-custom/` que debe existir en la máquina de despliegue o editarse en la configuración; el ID de Hugging Face no sustituye a esa ruta.
- Pesos en float32: el archivo `model.safetensors` ocupa 11,7 GiB y la carga requiere VRAM equivalente; se recomienda convertir a bf16 para despliegue eficiente.
- Uso comercial: permitido bajo Apache 2.0, pero el modelo no incluye garantías de rendimiento ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/symbiosika/right_pnp_multicube_32b_05d_235eps
- Modelo base NVIDIA GR00T-N1.7-3B: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Librería LeRobot (usada para entrenamiento y evaluación): https://github.com/huggingface/lerobot
- Repositorio del autor (no relacionado con el modelo, pero identificado en la búsqueda): https://github.com/symbiosika/n8n-embedded-chat-interface
