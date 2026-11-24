# vosldtgbj/Qwen3.5-9B-SWE-Gym-RL-G16-20261110-r5

## Resumen

Qwen3.5-9B-SWE-Gym-RL-G16 es un modelo de investigación intermedio publicado por el usuario `vosldtgbj` en Hugging Face, derivado por fine-tuning con aprendizaje por refuerzo (RL) sobre el modelo base Qwen/Qwen3.5-9B. El objetivo del experimento es mejorar el rendimiento del modelo en tareas de ingeniería de software reales (resolución de issues en repositorios), empleando el dataset SWE-Gym como fuente de tareas y SWE-bench Verified como referencia de evaluación. El modelo conserva la arquitectura multimodal del base (etiqueta `image-text-to-text` y `qwen3_5`) y todos los parámetros del modelo de lenguaje se entrenan en BF16, manteniendo los activos visuales y MTP originales.

Se trata explícitamente de un checkpoint en progreso: la model card indica que la revisión contiene los pesos tras 8 actualizaciones de Adam exitosas, con un plan de 39.008 trayectorias sobre las 2.438 tareas de SWE-Gym. El entrenamiento se ejecuta en una única máquina local con 8 GPU H200, usando Miles, Megatron-LM y SGLang, con GRPO sin normalización por desviación estándar del grupo y un verificador LLM diagnóstico (Qwen3.8-27B) separado de las pruebas oficiales que determinan la recompensa.

Por su naturaleza, no es un modelo para producción: es un artefacto de investigación que documenta el estado de un proceso de RL, con un baseline de referencia de 298/500 en SWE-bench Verified atribuido al modelo original (no a esta revisión). Su interés radica en la transparencia del protocolo de entrenamiento y en servir como material de estudio sobre RL aplicado a agentes de código.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5, tag `qwen3_5`), con activos visuales y MTP conservados |
| Parametros totales | 9.653.104.368 (~9,65 mil millones) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (según configuración de entrenamiento) |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible en la ficha; la model card remite a la licencia y términos del modelo base Qwen/Qwen3.5-9B |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer multimodal de aproximadamente 9,65 mil millones de parámetros con capacidad de entrada imagen-texto y salida de texto. El fine-tuning con RL entrena todos los parámetros del modelo de lenguaje en BF16 y preserva los componentes visuales y MTP originales. El stack de entrenamiento combina Miles, Megatron-LM y SGLang, con paralelismo de tensor TP=4 y DP=1 sobre 8 GPU H200 locales; los servicios remotos solo almacenan artefactos.

El algoritmo es GRPO sin normalización por desviación estándar del grupo, con Adam a learning rate 1e-6, betas (0,9; 0,95) y weight decay 0. El dataset es SWE-Gym: 2.438 tareas, 16 trayectorias por tarea, 39.008 trayectorias planificadas; la recolección usa 16 tareas y 256 trayectorias, con batch global del optimizador de 128 y microbatch 1. La recompensa proviene de las pruebas oficiales aisladas de cada tarea, mientras que un verificador LLM separado (Qwen3.8-27B BF16 vía vLLM) es solo diagnóstico. El modo thinking está activado y preservado, con generación por respuesta de hasta 81.920 tokens y por trayectoria de hasta 196.608. Los minibatches con ventaja cero no actualizan parámetros ni avanzan el scheduler. Esta revisión concreta corresponde a 8 actualizaciones exitosas de Adam.

## Capacidades

- Generación de texto conversacional y razonamiento con modo thinking activado y preservado.
- Entrada multimodal imagen-texto (según el pipeline `image-text-to-text` y los activos visuales conservados del base).
- Resolución de tareas de ingeniería de software: localización de código, edición de ficheros y ejecución de pruebas en el bucle de agente.
- Razonamiento multi-paso y uso de herramientas dentro de trayectorias largas (hasta 196.608 tokens por trayectoria en entrenamiento).
- Entrenamiento orientado a agentes con señales de recompensa verificables (pruebas oficiales de cada tarea).
- Soporte de tool calling / function calling: no disponible como dato explícito en la información proporcionada.
- Capacidades multilingües: no disponibles como dato explícito en la información proporcionada.

## Casos de uso

- Investigación en RL para agentes de código: reproducir o comparar el protocolo GRPO sobre SWE-Gym usando este checkpoint como referencia intermedia, con contexto de 262.144 tokens para trayectorias largas.
- Estudio de dinámica de entrenamiento: analizar snapshots inmutables (`step-XXXXXX-<identity>`) y el manifiesto `model-export.json` para trazar la evolución de los pesos entre actualizaciones.
- Evaluación de agentes SWE: ejecutar el modelo sobre SWE-bench Verified con el mismo protocolo descrito (una trayectoria válida por tarea, sin reintentos por fallos válidos del modelo) para comparar con el baseline 298/500.
- Generación asistida de parches en entornos controlados: usar el modelo para proponer ediciones sobre repositorios con pruebas automatizadas que validen el resultado antes de cualquier aplicación.
- Docencia y divulgación técnica: ilustrar cómo se separa la señal de recompensa (pruebas oficiales) de un verificador LLM diagnóstico, y cómo se gestionan estados de recuperación del optimizador.
- Análisis de robustez de agentes: medir el comportamiento en tareas excluidas por agotamiento de intentos de infraestructura, con divulgación explícita de exclusiones.
- Base para experimentos de continuación: servir como punto de partida documentado para nuevos branches de entrenamiento, teniendo en cuenta que reiniciar desde solo pesos implica declarar reset del optimizador.

## Benchmarks y rendimiento

| Evaluación | Paso del optimizador | Resueltas / válidas | Excluidas |
|---|---:|---:|---:|
| baseline-original | 0 | 298/500 | 0 |

El único dato de benchmark publicado corresponde al modelo original Qwen3.5-9B (59,6% en SWE-bench Verified), no a esta revisión entrenada. No se han publicado resultados de benchmarks para los checkpoints intermedios en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 19,3 GB solo para pesos (9,65 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV para contexto largo.
- Contexto largo: con 262.144 tokens de ventana, la caché KV puede dominar el consumo de memoria; se recomienda planificar según la longitud efectiva de secuencia.
- GPU recomendadas: H200 (usadas en entrenamiento), A100 80 GB y H100 80 GB para BF16 con contexto extendido.
- GPU de consumo: en BF16 no cabe en GPU de consumo típicas de 24 GB; con cuantización a 8 bits podría aproximarse a ~10 GB de pesos, pero no se publican ficheros cuantizados ni datos verificados.
- Opciones de despliegue: transformers (librería declarada), vLLM y SGLang (usados en el stack de entrenamiento); llama.cpp u Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio ocupa 196,4 GB, muy por encima de los pesos BF16, lo que sugiere snapshots y artefactos adicionales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| Qwen3.5-9B-SWE-Gym-RL-G16 (esta revisión) | ~9,65 B | 262.144 | No publicado para esta revisión | Remite al base | Hugging Face, 350 descargas |
| Qwen/Qwen3.5-9B (base) | ~9,65 B | No disponible en la información | 298/500 (59,6%) | Según modelo base | Hugging Face |
| Alternativas de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos de otros modelos comparables de la misma categoría (agentes de código de ~9-10 B) para completar la comparativa con cifras verificadas.

## Limitaciones y advertencias

- Modelo de investigación en progreso: solo 8 actualizaciones de Adam completadas; no es una versión final ni un artefacto para producción.
- El baseline de 298/500 corresponde al modelo original, no a esta revisión; no debe atribuirse a los pesos entrenados.
- Licencia no declarada en la ficha: los términos del modelo base Qwen/Qwen3.5-9B aplican y deben revisarse antes de cualquier uso comercial.
- Idiomas soportados no documentados; el comportamiento multilingüe no está garantizado por la información disponible.
- Riesgo de alucinación inherente a modelos de lenguaje; en tareas de código, los parches propuestos deben validarse siempre con pruebas automatizadas.
- Protocolo de evaluación estricto: fallos válidos del modelo no se reintentan, y las tareas agotadas se excluyen con divulgación; los resultados deben interpretarse junto a esas exclusiones.
- Estado de recuperación del optimizador en `/dev/shm` con retención de las dos copias más recientes: puede perderse si la instancia se reinicia, lo que obligaría a declarar un reset del optimizador si se reanuda el entrenamiento desde solo pesos.
- Tamaño del repositorio (196,4 GB) muy superior a los pesos BF16: conviene verificar el contenido antes de descargar en su totalidad.
- Sin likes ni comunidad establecida (0 likes, 350 descargas): soporte y mantenimiento inciertos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vosldtgbj/Qwen3.5-9B-SWE-Gym-RL-G16-20261110-r5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset SWE-Gym: https://huggingface.co/datasets/SWE-Gym/SWE-Gym
- Dataset SWE-bench Verified: https://huggingface.co/datasets/SWE-bench/SWE-bench_Verified
