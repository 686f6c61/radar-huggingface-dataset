# Stage-org/4b-conceptfunc-diversity-300-27b-z-epoch3

## Resumen

Este repositorio contiene un checkpoint de un modelo de lenguaje de 4.539.265.536 parámetros (unos 4,54 B) publicado por la organización Stage-org bajo el identificador `4b-conceptfunc-diversity-300-27b-z-epoch3`. No se trata de un modelo base, sino del resultado de un proceso de aprendizaje por refuerzo (RL) aplicado sobre `Qwen/Qwen3.5-4B`, según se desprende de la configuración de entrenamiento incluida en la model card. El sufijo `epoch3` indica que corresponde a la tercera época de un ciclo declarado de 3 épocas y 10.000 pasos de entrenamiento.

La relevancia del modelo es fundamentalmente experimental: documenta un pipeline de RL con recompensa procedente de un juez LLM externo (`gpt-5.6-luna`) sobre tareas abiertas, con optimizador AdamW, tamaño de grupo 8 y penalización KL, ejecutado con el framework identificado como `prime_rl` en la configuración. El nombre del dataset de entrenamiento (`4b-conceptfunc-diversity-300-27b-z`) sugiere un objetivo centrado en diversidad sobre "funciones conceptuales", aunque no hay documentación pública que desarrolle esa definición.

Se trata de un artefacto con trazabilidad mínima: 14 descargas, 0 "likes", sin licencia declarada, sin idiomas declarados, sin pipeline asignado y sin ningún resultado de evaluación publicado. La model card se limita a la procedencia del entrenamiento (comando, dataset y fichero TOML de configuración). Cualquier uso en producción debería partir de una evaluación propia y de la verificación de la licencia heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder de la familia Qwen3.5 (etiqueta `qwen3_5`), derivado de `Qwen/Qwen3.5-4B` |
| Parámetros totales | 4.539.265.536 (~4,54 B) |
| Parámetros activos | no aplica: no hay indicios de arquitectura MoE en la información disponible |
| Longitud de contexto | 65.536 tokens (`max_model_len` en la configuración de inferencia); la configuración de entrenamiento declara `seq_len = 300.000` |
| Tipos de cuantización | no disponible: el repositorio solo contiene safetensors en precisión de 16 bits (9,1 GB para 4,54 B parámetros implica ~2 bytes por parámetro, presumiblemente bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 9,1 GB |
| Fecha de creación | 2026-09-23 |
| Fecha de actualización | 2026-09-23 |
| Descargas / likes | 14 / 0 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base `Qwen/Qwen3.5-4B`, un transformer decoder denso de aproximadamente 4 B de parámetros, según la denominación del propio modelo base. La model card no detalla la configuración interna (número de capas, atención, dimensiones de cabeza, uso de atención híbrida o de decodificación especulativa), por lo que esos datos quedan como no disponibles. La inferencia configurada emplea `flash_attention_2` y se declara explícitamente `language_model_only = true`, es decir, se ejecuta únicamente la torre de lenguaje.

El entrenamiento es un ajuste por refuerzo, no un preentrenamiento ni un SFT clásico. Los hiperparámetros declarados en el TOML son los siguientes.

| Hiperparámetro | Valor declarado |
|---|---|
| Método | RL (`learner.method = "rl"`) |
| Modelo de partida | `Qwen/Qwen3.5-4B` |
| Dataset | `Stage-org/4b-conceptfunc-diversity-300-27b-z` (split `train`, attempt 1) |
| Pasos de aprendizaje | 10.000 |
| Épocas | 3 |
| Batch size | 128 |
| Longitud de secuencia declarada | 300.000 |
| Tamaño de grupo (RL) | 8 |
| Optimizador | AdamW, lr = 1e-06, weight_decay = 0,0, max_norm = 1,0, betas = (0,9; 0,99) |
| Pérdida | `default`, con `dppo_mask_low = 0,2`, `dppo_mask_high = 0,28`, `adv_tau = 1,0`, `kl_tau = 0,001` |
| Muestreo durante el rollout | temperature = 0,9; top_p = 1,0; max_tokens = 4096; `enable_thinking = true` |
| Juez de recompensa | Endpoint externo con modelo `gpt-5.6-luna`, temperature = 1,0, top_p = 1,0, max_tokens = 4096, `reasoning_effort = medium`, `mean_score = false`, `max_retries = 3`, `max_in_flight = 32` |
| Infraestructura declarada | 2 GPU por nodo (1 para inferencia, 1 para entrenamiento), `gpu_memory_utilization = 0,9`, puerto 7001, `weight_broadcast_type = "filesystem"` |
| Orquestación | `max_inflight_rollouts = 256`, `max_off_policy_steps = 8` |
| Checkpoints | Cada 1000 épocas, `keep_last = 1`, solo pesos (`weights_only = true`) |
| Semilla | 7 |

La innovación técnica destacable es el uso de un juez LLM externo para recompensas de formato abierto, con un esquema de ventajas tipo grupo (tamaño 8) y una penalización KL muy baja (`kl_tau = 0,001`), lo que permite al policy alejarse apreciablemente del modelo base. El nombre del dataset apunta a un objetivo de diversidad, pero no hay documentación que especifique la composición de los datos, el número real de tokens vistos ni si se aplicó filtrado de calidad. Los valores de `seq_len = 300.000` y `batch_size = 128` son los declarados en configuración y no permiten estimar de forma fiable el cómputo efectivo (podrían corresponder a secuencias empaquetadas).

## Capacidades

Todas las capacidades siguientes se infieren de la configuración declarada y del modelo base, no de evaluaciones publicadas; no hay ninguna medición independiente disponible.

- Generación de texto y razonamiento en modo "pensamiento": el rollout de entrenamiento se ejecutó con `enable_thinking = true` y el parser de razonamiento configurado es `qwen3`.
- Soporte de tool calling / function calling: la configuración de inferencia usa `tool_call_parser = "qwen3_coder"`, lo que indica soporte de llamadas a herramientas con ese formato.
- Ejecución de agentes y razonamiento multi-paso: el pipeline de entrenamiento contempla hasta 256 rollouts en vuelo y 8 pasos fuera de política, orientado a tareas de varios turnos.
- Generación diversa de respuestas: es el objetivo explícito del ajuste por refuerzo según el nombre del dataset (`conceptfunc-diversity`).
- Capacidades de código: el parser de tool calling (`qwen3_coder`) y el modelo base sugieren competencia en generación de código, pero no hay verificación publicada.
- Multilingüismo: no disponible; no se declaran idiomas en la ficha del repositorio.
- Visión y audio: no disponibles; la configuración de inferencia fuerza `language_model_only = true`, por lo que no se expone ninguna modalidad adicional.
- Ajuste fino adicional: al ser un checkpoint de RL sobre un modelo de 4,54 B con pesos en safetensors, es reutilizable como punto de partida para nuevos ciclos de RL o SFT.

## Casos de uso

- Generación diversa de ideas y conceptos: el modelo se entrenó con una señal de recompensa orientada a diversidad, por lo que resulta adecuado para producir conjuntos amplios de propuestas distintas sobre un mismo enunciado en lugar de una única respuesta canónica; conviene validar la calidad con un filtro posterior, ya que la diversidad no implica corrección.
- Aumento de datos sintéticos: puede generar múltiples variantes de respuestas o de ejemplos para alimentar pipelines de destilación o de evaluación, aprovechando su tendencia a la diversidad y su ventana de 65.536 tokens en inferencia.
- Generación de múltiples implementaciones de una misma función: el nombre del dataset apunta a tareas de "concept function"; el modelo puede producir varias soluciones alternativas de un mismo problema de programación para comparar enfoques o alimentar sistemas de votación.
- Prototipado e investigación en RL con jueces LLM: sirve como referencia reproducible de un pipeline de RL con recompensa de juez externo (configuración TOML incluida), útil para estudiar recompensas ruidosas y "reward hacking" en modelos pequeños.
- Asistente de código local con tool calling: desplegado con vLLM y el parser `qwen3_coder`, puede integrarse en un IDE o en un pipeline de CI/CD para generar parches o tests, siempre con revisión humana y con verificación previa de licencia.
- Atención al cliente automatizada de dominio acotado: con 65.536 tokens de contexto configurados, admite conversaciones multi-turno con historial largo y documentación adjunta, aunque la ausencia de evaluación hace imprescindible una batería de pruebas propia antes de exponerlo a usuarios.
- Generación de casos de prueba y casos límite: puede emplearse para producir baterías de tests diversos sobre una especificación dada, aprovechando el objetivo de diversidad del ajuste.
- Reproducción de experimentos de RL a pequeña escala: requiere únicamente 2 GPU por nodo según la configuración declarada (1 para inferencia, 1 para entrenamiento), lo que lo hace viable en entornos académicos con hardware moderado, siempre que el modelo de juez sea sustituible por una alternativa accesible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y la búsqueda web no devolvió documentación técnica asociada al modelo. Los únicos datos cuantitativos disponibles son los hiperparámetros de entrenamiento recogidos en la tabla de la sección anterior, que no constituyen una evaluación de rendimiento.

## Requisitos de hardware

- Pesos en precisión de 16 bits: 9,1 GB, cifra que coincide con el tamaño del repositorio declarado (4,54 B parámetros × 2 bytes).
- VRAM estimada para inferencia en bf16: en torno a 12-16 GB con contexto moderado, sumando pesos, activaciones y caché KV. El tamaño exacto de la caché KV a 65.536 tokens no puede calcularse con precisión porque se desconoce la configuración interna del modelo base (capas, cabezas KV, dimensión de cabeza); en arquitecturas densas de ~4 B con contexto muy largo, la caché KV puede superar varios GB por secuencia.
- GPU recomendadas: para el contexto completo de 65.536 tokens, se recomienda una GPU de 40-80 GB (A100 40/80 GB, H100, L40S 48 GB) para evitar fragmentación y permitir lotes concurrentes. Para contexto corto, una RTX 4090 o RTX 3090 de 24 GB es suficiente para alojar los pesos.
- Viabilidad en GPU de consumo: sí, en GPU de 24 GB (RTX 3090, RTX 4090) con contexto reducido; no se han publicado cuantizaciones de 8 o 4 bits, por lo que para GPUs de 8-12 GB sería necesario convertir el modelo a GGUF o AWQ/GPTQ por cuenta propia.
- Opciones de despliegue: vLLM es la opción directamente respaldada por la configuración (con `reasoning_parser = "qwen3"`, `tool_call_parser = "qwen3_coder"`, `gpu_memory_utilization = 0,9` y puerto 7001). llama.cpp, Ollama, TGI y SGLang requerirían conversión o adaptación, ya que el repositorio solo distribuye safetensors.
- Latencia y throughput: no disponibles. No se han publicado mediciones y la configuración solo documenta la fase de entrenamiento (2 GPU por nodo, 1 dedicada a inferencia), no una carga de producción.
- Requisitos de ajuste fino: la configuración declarada usa 2 GPU por nodo con paralelismo entre entrenamiento e inferencia; no se especifica el modelo de GPU empleado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `Stage-org/4b-conceptfunc-diversity-300-27b-z-epoch3` | 4,54 B | 65.536 en inferencia; 300.000 declarado en entrenamiento | no disponible | 14 descargas, 0 likes | Checkpoint de RL (época 3) sobre Qwen3.5-4B, sin evaluación publicada |
| `Qwen/Qwen3.5-4B` (modelo base) | ~4 B según su denominación | no disponible en la información proporcionada | no disponible en la información proporcionada | Modelo base público de referencia | Es el punto de partida declarado del ajuste por refuerzo; su ficha no se ha incluido en esta búsqueda |
| Otros checkpoints de RL de ~4 B | no disponible | no disponible | no disponible | no disponible | La búsqueda web realizada no devolvió alternativas relevantes: los resultados eran ofertas de prácticas y portales de empleo sin relación con el modelo |

No se dispone de benchmarks comparativos entre este checkpoint y su modelo base, por lo que no es posible cuantificar la ganancia (o la pérdida) obtenida con el ajuste por refuerzo.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia, lo que impide determinar si el uso comercial está permitido. Al ser un derivado de `Qwen/Qwen3.5-4B`, es previsible que se apliquen las condiciones del modelo base, pero esto no está confirmado en la información disponible y debe verificarse antes de cualquier despliegue.
- Ausencia total de evaluación: no hay benchmarks, ni evaluación humana, ni métricas de seguridad publicadas. No se puede afirmar nada sobre su calidad relativa frente al modelo base.
- Riesgo de sobreoptimización del juez: la recompensa procede de un juez LLM externo con `mean_score = false` y penalización KL muy baja (`kl_tau = 0,001`), combinación que favorece el "reward hacking" y la deriva respecto al comportamiento del modelo base.
- Sesgos: no disponibles. No se documenta composición del dataset, filtrado ni análisis de sesgos; los sesgos del corpus de entrenamiento y del juez externo se transfieren sin control conocido.
- Alucinación: sin datos. Al ser un modelo de 4,54 B ajustado con RL sobre tareas abiertas, cabe esperar una tasa de alucinación propia de su escala, pero no hay medición.
- Idiomas: la ficha no declara idiomas soportados. El comportamiento multilingüe real es desconocido y no debe asumirse.
- Límite de contexto en producción: aunque el entrenamiento declare `seq_len = 300.000`, la inferencia está configurada con `max_model_len = 65.536`; no se ha medido la degradación más allá de ese límite ni la calidad dentro de él.
- Solo modalidad de lenguaje: `language_model_only = true` desactiva cualquier torre multimodal del modelo base, si existiera.
- Documentación generada automáticamente: la model card está delimitada por marcadores de flujo de trabajo (`jh-workflow-training-begin/end`) y contiene únicamente procedencia de entrenamiento, sin descripción funcional, sin ejemplos de uso y sin pipeline asignado en HuggingFace.
- Madurez y soporte: 14 descargas y 0 "likes", creado y actualizado el mismo día (2026-09-23) y con `keep_last = 1` en los checkpoints, lo que sugiere un artefacto de investigación sin mantenimiento previsto.
- Repositorio pesado sin cuantizaciones: 9,1 GB en safetensors; no hay versiones GGUF, AWQ o GPTQ publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stage-org/4b-conceptfunc-diversity-300-27b-z-epoch3
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/Stage-org/4b-conceptfunc-diversity-300-27b-z
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-4B
- Nota sobre la búsqueda web: los resultados obtenidos corresponden a portales de ofertas de prácticas (stage.fr, Indeed, HelloWork, ID.Stages.Occitanie) y no guardan relación con el modelo. No se han encontrado papers, blogs, repositorios de código ni demos asociados a este checkpoint.
