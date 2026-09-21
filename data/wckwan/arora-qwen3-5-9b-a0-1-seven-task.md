# wckwan/arora-qwen3.5-9b-a0.1-seven-task

## Resumen

arora-qwen3.5-9b-a0.1-seven-task es un ajuste fino de investigación sobre Qwen/Qwen3.5-9B, publicado por el usuario wckwan en Hugging Face con licencia Apache 2.0. Se trata de un experimento de aprendizaje por refuerzo orientado a razonamiento eficiente: el modelo se ha entrenado con `arora_rloo` (RLOO con penalización por longitud de Arora y Zanette, con alpha = 0,1) sobre un conjunto de siete tareas. El objetivo declarado no es superar al modelo base en capacidad bruta, sino conseguir respuestas correctas con trazas de razonamiento más cortas, reduciendo el coste en tokens de la fase de pensamiento.

El entrenamiento es de escala reducida y controlada: 100 pasos, 32 prompts con 8 rollouts por paso, learning rate 2e-6, coeficiente KL de 1e-3 y un tope de rollout de 32K tokens, usando verl v0.9.1 con FSDP2 y vLLM. El conjunto de datos consta de 512 ejemplos (semilla 0) extraídos de los splits oficiales de entrenamiento, con un system prompt fijo ("Solve the user's task and give the final answer directly.") y una recompensa basada en la corrección de la tarea evaluada únicamente sobre el texto posterior a `</think>`.

Por su naturaleza, es un artefacto de investigación reproducible más que un modelo listo para producción: tiene 0 descargas y 0 likes en el momento de la consulta, no publica resultados de benchmarks y no documenta idiomas soportados. Su interés principal es metodológico, para quienes estudian cómo la penalización por longitud en RLOO afecta a la relación entre longitud de cadena y precisión final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada del modelo base Qwen/Qwen3.5-9B; no se detalla en la informacion proporcionada) |
| Parametros totales | 9.409.813.744 (9,41 mil millones) |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible; el entrenamiento uso un tope de rollout de 32K tokens |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors; no hay versiones GGUF, GPTQ, AWQ ni FP8 publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-9B (finetune) |
| Tamano del repositorio | 37,7 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-21 |
| Ultima actualizacion | 2026-09-21 |

## Arquitectura y entrenamiento

No se proporciona información sobre la arquitectura interna del modelo base Qwen/Qwen3.5-9B (tipo de transformer, atención, número de capas ni vocabulario), por lo que la arquitectura exacta queda como no disponible. Lo que sí está documentado es el procedimiento de post-entrenamiento: se parte del checkpoint Qwen/Qwen3.5-9B y se aplica `arora_rloo`, una variante de RLOO (REINFORCE Leave-One-Out) con penalización por longitud propuesta por Arora y Zanette, configurada con alpha = 0,1. El entrenamiento se ejecutó durante 100 pasos con 32 prompts y 8 rollouts por prompt en cada paso, learning rate de 2e-6, coeficiente KL de 1e-3 y un límite de 32K tokens por rollout, sobre verl v0.9.1 con FSDP2 para el entrenamiento y vLLM para la generación de rollouts.

Los datos de entrenamiento son 512 ejemplos (semilla 0) procedentes de los splits oficiales de entrenamiento de un conjunto denominado "seven-task". La señal de recompensa es binaria y se calcula sobre la corrección de la tarea, evaluando exclusivamente el texto que aparece después del token `</think>`; es decir, la traza de razonamiento intermedia no recibe recompensa directa, solo su efecto en la respuesta final. El system prompt empleado es fijo: "Solve the user's task and give the final answer directly.". No se documenta el uso de RLHF con preferencias humanas, DPO ni ninguna fase de alineación de seguridad adicional sobre este checkpoint.

## Capacidades

- Generación de texto con traza de razonamiento en formato *thinking* delimitada por `</think>`, seguida de una respuesta final directa, que es la parte evaluada por la recompensa.
- Razonamiento eficiente: el objetivo explícito del entrenamiento es mantener la corrección reduciendo la longitud de la cadena de razonamiento, mediante la penalización por longitud con alpha = 0,1.
- Resolución de tareas de respuesta directa: al haberse entrenado con un system prompt que exige la respuesta final de forma directa, el modelo está sesgado hacia salidas concisas sin preámbulos.
- Reproducibilidad experimental: las hiperparámetros (pasos, rollouts, lr, KL, tope de rollout, framework y versión) están documentados, lo que permite replicar el experimento.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no documentadas; no se declara ningún conjunto de idiomas.
- Visión, audio o modalidades adicionales: no documentadas.
- Modo de pensamiento configurable o presupuesto de pensamiento ajustable: no documentado.

## Casos de uso

- Investigación en RL para razonamiento eficiente: el modelo sirve como punto de partida reproducible para estudiar cómo la penalización por longitud en RLOO (alpha = 0,1) desplaza la distribución de longitudes de cadena y su efecto sobre la precisión final, comparando contra el modelo base sin entrenar.
- Análisis de la brecha entre traza de razonamiento y respuesta final: dado que la recompensa se calcula solo sobre el texto posterior a `</think>`, este checkpoint permite medir si la cadena de pensamiento sigue siendo informativa cuando no recibe señal directa de recompensa.
- Generación de datos sintéticos con razonamiento breve: útil para construir conjuntos de entrenamiento donde se prioriza una respuesta final correcta y compacta, por ejemplo para destilación hacia modelos más pequeños.
- Evaluación comparativa de checkpoints intermedios: al estar documentado el número exacto de pasos (100) y la configuración, se puede usar como referencia en estudios de ablación sobre número de pasos, tamaño de batch de prompts o coeficiente KL.
- Tareas de respuesta directa con presupuesto de tokens ajustado: en escenarios donde el coste por token de salida es relevante y la tarea admite una respuesta final escueta, el sesgo del entrenamiento hacia salidas directas encaja mejor que en un modelo orientado a cadenas largas.
- Punto de partida para SFT o RL posterior: el checkpoint puede reutilizarse como inicialización en experimentos que necesiten un modelo de 9B ya expuesto a un formato estricto de respuesta final.
- Reproducción de infraestructura de RL a escala pequeña: la combinación verl v0.9.1 + FSDP2 + vLLM con 512 ejemplos y 100 pasos es un caso de uso realista para validar pipelines de entrenamiento antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos, calculada a partir de 9.409.813.744 parámetros: unos 18,8 GB en BF16/FP16, unos 9,4 GB en FP8/INT8 y unos 4,7 GB en cuantización de 4 bits. A estas cifras hay que sumar la caché KV y el *overhead* del runtime, que dependen de la longitud de contexto efectiva (no publicada).
- En BF16, el modelo requiere del orden de 22-26 GB de VRAM en total, por lo que entra justo en una RTX 4090 (24 GB) y con holgura en A100 40 GB, A100 80 GB, H100 80 GB o L40S 48 GB. En configuraciones multi-GPU, tensor parallelism 2 con GPUs de 24 GB es una opción razonable.
- En cuantización de 8 bits (si se genera una conversión propia), cabría en GPUs consumer de 12-16 GB; en 4 bits, en GPUs de 8-12 GB. No hay versiones cuantizadas publicadas por el autor.
- Opciones de despliegue: vLLM (usado durante el entrenamiento para los rollouts), TGI, SGLang y `transformers` con FSDP2. Para llama.cpp u Ollama sería necesario convertir previamente los pesos a GGUF, conversión que no está publicada.
- El repositorio ocupa 37,7 GB, aproximadamente el doble de lo que ocuparían los pesos en BF16, lo que sugiere la presencia de más de una copia de los pesos o de pesos en mayor precisión; la model card no lo detalla. Hay que tenerlo en cuenta para el espacio en disco, no solo para la VRAM.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| arora-qwen3.5-9b-a0.1-seven-task | 9,41B | no disponible | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| Qwen/Qwen3.5-9B (modelo base) | no disponible (el finetune declara 9,41B) | no disponible | Apache 2.0 (según la etiqueta del modelo derivado) | Hugging Face |
| Qwen3-8B | 8,2B | 32.768 nativo, ampliable a 131.072 con YaRN | Apache 2.0 | Hugging Face |
| Llama 3.1 8B | 8,03B | 128.000 | Llama 3.1 Community License | Hugging Face |

La comparación de rendimiento frente a estas alternativas no es posible con la información disponible, ya que el modelo no publica ningún benchmark. La diferencia relevante frente a sus comparables no es de capacidad, sino de propósito: se trata de un ajuste fino de investigación con 512 ejemplos de entrenamiento y 100 pasos, mientras que Qwen3-8B o Llama 3.1 8B son modelos de propósito general con evaluación publicada. Frente a su propio modelo base, la única diferencia documentada es la fase de RL con penalización por longitud.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks publicados, por lo que se desconoce si el entrenamiento mejora, mantiene o degrada la precisión respecto a Qwen/Qwen3.5-9B. No debe asumirse una ganancia de rendimiento.
- Entrenamiento de escala muy reducida: 512 ejemplos y 100 pasos. El riesgo de sobreajuste al conjunto "seven-task" y de degradación de capacidades generales (olvido catastrófico) es alto y no se ha medido.
- Posible erosión de la alineación de seguridad: el único objetivo de recompensa es la corrección de la tarea, sin componentes de seguridad ni de preferencias. No hay evidencia de que el modelo conserve los rechazos y salvaguardas del modelo base.
- Efecto colateral de la penalización por longitud: con alpha = 0,1 el modelo está incentivado a acortar la cadena de razonamiento, lo que puede reducir la precisión en tareas que requieren cadenas largas (matemáticas complejas, razonamiento multi-paso). Este compromiso no está cuantificado en la información disponible.
- Recompensa desacoplada de la traza: al evaluarse solo el texto posterior a `</think>`, la calidad, fidelidad y coherencia del bloque de pensamiento no están supervisadas ni garantizadas.
- Idiomas: no se declara ningún conjunto de idiomas soportados. No hay garantía de comportamiento multilingüe ni de calidad en castellano.
- Sesgos: no hay información publicada sobre evaluación de sesgos, toxicidad o sesgos sociales. Al no conocerse la composición de los datos de entrenamiento (más allá de "512 ejemplos de los splits oficiales"), no se pueden caracterizar.
- Riesgo de alucinación: no medido ni documentado.
- Licencia: Apache 2.0, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-9B y de los datos de entrenamiento empleados, que no se detallan.
- Contexto y despliegue: la longitud de contexto efectiva no está publicada; aunque el tope de rollout fue de 32K tokens, esto es un parámetro de entrenamiento, no una especificación garantizada de inferencia.
- Huella en disco elevada (37,7 GB) para un modelo de 9,4B parámetros, sin conversiones cuantizadas oficiales disponibles.
- Idoneidad para producción: baja. Es un checkpoint de investigación sin mantenimiento documentado, sin pipeline declarado y sin usuarios (0 descargas, 0 likes).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wckwan/arora-qwen3.5-9b-a0.1-seven-task
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Framework de entrenamiento verl v0.9.1: https://github.com/volcengine/verl
- Referencia metodológica citada en la model card: Arora y Zanette, RLOO con penalización por longitud (alpha = 0,1); no se proporciona enlace en la información disponible.
- La búsqueda web realizada no ha devuelto ningún resultado relevante sobre este modelo: los enlaces encontrados corresponden al servicio de seguimiento de paquetes GLS y no guardan relación con el modelo.
