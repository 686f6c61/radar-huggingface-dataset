# ZUO66/pi05-r1lite-insert-flower-baseline

## Resumen

El modelo `ZUO66/pi05-r1lite-insert-flower-baseline` es una política robótica de flujo gaussiano (Gaussian flow matching) basada en la arquitectura π₀.₅, desarrollada por el usuario ZUO66. Se trata de un fine-tune completo de 3.616.757.520 parámetros (no un adaptador LoRA) entrenado específicamente para la tarea de inserción de flores con el brazo derecho de un robot R1Lite. El modelo consume imágenes RGB actuales de la cabeza y de la muñeca derecha, junto con el estado articular de 7 dimensiones del brazo derecho, y predice 16 acciones de 7 dimensiones correspondientes a objetivos articulares absolutos.

Este release corresponde al checkpoint de la época 50 (actualización de optimizador 47.600) de una receta original de π₀.₅ con fuente gaussiana independiente, objetivo exclusivo de flow matching e inferencia por defecto de diez pasos. Se distingue del release hermano de Δ-flow (`ZUO66/pi05-r1lite-insert-flower`) en que desactiva la condicionalidad sobre historial de acciones y la consistencia de puntos finales. Es, por tanto, una línea base de receta original, no una ablación de solo fuente.

El modelo es relevante como referencia reproducible para investigación en manipulación robótica con modelos de visión-lenguaje-acción (VLA), ya que documenta de forma explícita el protocolo de entrenamiento, la composición del dataset y las convenciones de preprocesado, aunque no reclama ninguna tasa de éxito en robot físico ni en conjuntos de validación retenidos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | π₀.₅ (vision-language-action) con flow matching gaussiano; transformer multimodal (no se detalla la configuración interna de capas) |
| Parámetros totales | 3.616.757.520 |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; la inferencia usa FP32 con autocast BF16 en CUDA y FP32 en CPU |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, ~14,5 GB) |

## Arquitectura y entrenamiento

El modelo es una política π₀.₅ de flow matching gaussiano. Recibe como entrada las imágenes RGB actuales de la cabeza y de la muñeca derecha (redimensionadas de forma independiente a 224 × 224 con preservación de relación de aspecto y relleno de ceros) y el estado propioceptivo crudo de 7 dimensiones del brazo derecho (articulaciones 0–5 más pinza en el índice 6). La interfaz retiene una ranura para la muñeca izquierda, pero se rellena con una imagen de ceros y máscara de validez falsa; no es una tercera cámara. No requiere historial de acciones ni genera imágenes futuras. La fuente de ruido es una gaussiana independiente de forma `[1, 16, 32]`, aplicada a las 32 dimensiones de la interfaz (incluida la pinza y las dimensiones de relleno), sin fuente de acciones pasadas, sin máscara Δ-flow por articulación, sin actualización de consistencia de puntos finales y sin normalización de varianza de historial.

El entrenamiento se realizó mediante fine-tuning completo (sin LoRA) partiendo del modelo base original π₀.₅, no del modelo de Δ-flow de flores ni de pesos de microondas o de pruebas. El dataset es `at237299966/r1lite_insert_flower` (revisión `5c4b884303cf7be101b0b8611ad6362b5441db4a`), con 98 demostraciones, 45.684 fotogramas a 15 FPS. Todas las demostraciones se usaron para entrenamiento; no hay conjunto retenido. La supervisión de flow matching cubrió únicamente las siete dimensiones reales y los pasos temporales futuros válidos. El entrenamiento se completó el 24 de octubre de 2026 en ocho NVIDIA A100-SXM4-80G. La instrucción de entrenamiento, preservada literalmente, es: «Use the right arm to pick up the flower from the transparent white vase on the left and insert it into the purple vase on the right.»

## Capacidades

- Generación de acciones robóticas: predice 16 × 7 objetivos articulares absolutos del brazo derecho a partir de observación visual y estado propioceptivo actual.
- Percepción visual multi-cámara: procesa de forma independiente imágenes de cabeza y muñeca derecha a 224 × 224.
- Condicionamiento por instrucción en lenguaje natural (una única instrucción fija de inserción de flores, en inglés).
- Inferencia por flow matching con solver Euler configurable (10 pasos por defecto; 1 paso disponible como comparación gaussiana de un solo paso).
- Reproducibilidad: semilla opcional (`--seed 42`) para verificación offline determinista.
- Validación de entradas y predicciones: rechaza entradas y predicciones no finitas; verificación de checksums del checkpoint.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento general, código, matemáticas ni otras capacidades de propósito general: es una política robótica especializada.
- No soporta audio ni visión general más allá de las dos cámaras de entrada.

## Casos de uso

- Investigación en manipulación robótica de precisión: el modelo sirve como línea base reproducible para experimentos de inserción de objetos con un brazo robótico R1Lite, permitiendo comparar recetas (gaussiana frente a Δ-flow) sobre el mismo dataset y protocolo.
- Evaluación de flow matching en políticas VLA: al usar fuente gaussiana independiente y objetivo exclusivo de FM, es adecuado para estudiar el efecto de la fuente de ruido y del número de pasos de inferencia (1 frente a 10) en la calidad de las trayectorias predichas.
- Reproducción offline de experimentos: el helper `infer_flower_baseline.py` con `--seed 42` permite verificar predicciones de forma determinista sin robot físico, útil para auditoría de checkpoints y validación de pipelines.
- Desarrollo de sistemas de control de robot en simulación o banco de pruebas: las acciones absolutas de 7 dimensiones pueden integrarse en un controlador de articulaciones para pruebas de seguimiento de trayectoria, siempre con un controlador de seguridad hardware externo.
- Estudio de preprocesado y normalización: el modelo documenta explícitamente la normalización de las siete dimensiones reales y su discretización en tokens de texto antes del relleno a 32D, lo que lo convierte en referencia para investigar convenciones de interfaz en modelos VLA.
- Formación y docencia: como ejemplo completo de fine-tuning de π₀.₅ con dataset, instrucción y protocolo documentados, es útil para cursos o tutoriales sobre entrenamiento de políticas robóticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se reclama ninguna tasa de éxito en robot físico ni en conjuntos retenidos, y que no hay benchmark de latencia de inferencia en este release.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint completo pesa ~14,5 GB en FP32; se necesita VRAM adicional para dependencias y memoria de trabajo de inferencia. No se proporciona una cifra exacta de VRAM total.
- GPU recomendadas: el entrenamiento usó ocho NVIDIA A100-SXM4-80G; para inferencia no se especifican GPU concretas más allá del soporte CUDA con FP32 y autocast BF16.
- Cabe en GPU de consumo: no confirmado en la información disponible; el tamaño del checkpoint (~14,5 GB) sugiere que podría requerir GPUs con al menos 24 GB de VRAM, pero no se afirma explícitamente.
- Opciones de despliegue: script propio `infer_flower_baseline.py` con `setup_runtime.py` (overlay de compatibilidad OpenPI Transformers instalado en un entorno virtual dedicado). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de política robótica.
- Inferencia en CPU: soportada con FP32 y `--device cpu --threads 16`, requiriendo RAM suficiente para el modelo completo.
- Latencia y throughput: no disponibles; el autor no reclama benchmark de latencia en este release.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ZUO66/pi05-r1lite-insert-flower-baseline` (este) | 3.616.757.520 | no disponible | Inserción de flores, brazo derecho R1Lite, flow matching gaussiano | Apache 2.0 | Hugging Face |
| `ZUO66/pi05-r1lite-insert-flower` | no disponible en la información | no disponible | Inserción de flores, brazo derecho R1Lite, Δ-flow con historial de acciones y consistencia de puntos finales | no disponible en la información | Hugging Face |
| `ZUO66/imagewam-r1lite-insert-flower` | no disponible en la información | no disponible | Inserción de flores, brazo derecho R1Lite, MoT visual/acción con encoder propioceptivo entrenado (checkpoint de 20 épocas / paso 11.440) | no disponible en la información | Hugging Face |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse con 98 demostraciones de una única tarea e instrucción, el modelo está fuertemente especializado y no generaliza a otras tareas.
- Riesgo de alucinación: en el contexto de políticas robóticas, el equivalente es la predicción de acciones no válidas; el helper no recorta objetivos ni impone límites articulares, por lo que las acciones predichas pueden exceder rangos seguros si no se validan externamente.
- Limitaciones de contexto e idioma: solo inglés y una única instrucción fija; no hay soporte multilingüe ni de instrucciones variables.
- Todas las demostraciones fueron datos de entrenamiento; no hay conjunto retenido ni tasa de éxito en robot físico reclamada. Cualquier ejemplo incluido es una muestra de entrenamiento, no una evaluación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo es una política especializada sin garantías de seguridad; el helper nunca envía comandos al robot ni proporciona un controlador de seguridad hardware.
- Caveats para producción: requiere Python 3.11 en un entorno virtual dedicado; el overlay de compatibilidad solo se instala dentro del entorno activo; se necesita espacio en disco y RAM/VRAM adicionales para dependencias, carga del checkpoint y memoria de trabajo.
- El modelo no requiere historial de acciones ni genera imágenes futuras; no debe confundirse con el release de Δ-flow, que sí incorpora historial y consistencia de puntos finales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZUO66/pi05-r1lite-insert-flower-baseline
- Release hermano Δ-flow: https://huggingface.co/ZUO66/pi05-r1lite-insert-flower
- Release ImageWAM: https://huggingface.co/ZUO66/imagewam-r1lite-insert-flower
- Dataset de entrenamiento: https://huggingface.co/datasets/at237299966/r1lite_insert_flower
