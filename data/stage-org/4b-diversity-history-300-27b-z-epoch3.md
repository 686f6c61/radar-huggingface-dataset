# Stage-org/4b-diversity-history-300-27b-z-epoch3

## Resumen

`Stage-org/4b-diversity-history-300-27b-z-epoch3` es un checkpoint de investigación publicado por la organización Stage-org el 22 de septiembre de 2026. Se trata de un ajuste por aprendizaje por refuerzo (RL) sobre el modelo base `Qwen/Qwen3.5-4B`, con 4.539.265.536 parámetros (~4,54 B) almacenados en safetensors. El repositorio ocupa 9,1 GB, un tamaño coherente con pesos en precisión de 16 bits, y el tag `qwen3_5` confirma la familia arquitectónica.

El modelo no es un lanzamiento de producto: la información disponible consiste únicamente en metadatos de procedencia del entrenamiento (comando, configuración TOML y dataset), sin model card descriptiva, sin licencia declarada, sin idiomas declarados y con cero descargas y cero likes en el momento de la consulta. El nombre del experimento sugiere un estudio sobre diversidad en el historial de generación, aunque la función objetivo exacta no se documenta.

Su relevancia es, por tanto, la de un artefacto reproducible para investigación en RL sobre modelos pequeños: la configuración publicada permite reconstruir el pipeline completo (rollouts con vLLM, juez open-ended externo, optimizador AdamW con enmascarado DPPO y anclaje KL) y comparar variantes dentro de la misma familia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5 (tag `qwen3_5`), con FlashAttention 2 durante el entrenamiento |
| Parámetros totales | 4.539.265.536 (~4,54 B) |
| Parámetros activos | No aplica: no hay indicios de arquitectura MoE en la información disponible |
| Longitud de contexto | 65.536 tokens (`max_model_len` en la configuración de inferencia); la configuración del learner declara `seq_len = 300.000`, discrepancia no aclarada por el autor |
| Tipos de cuantización | No disponible. El repositorio solo contiene safetensors en 16 bits; no se publican versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (9,1 GB de repositorio) |

## Arquitectura y entrenamiento

La base es `Qwen/Qwen3.5-4B`, un transformer decoder-only de aproximadamente 4,5 B de parámetros. El checkpoint resultante es el fruto de un entrenamiento por refuerzo identificado como `attempt 1`, con 10.000 pasos de learner y 3 épocas, sobre el dataset `Stage-org/4b-diversity-history-300-27b-z` (tipo `new_task`). El optimizador es AdamW con `lr = 1e-6`, `betas = (0.9, 0.99)`, `weight_decay = 0.0` y `max_norm = 1.0`. El esquema de RL usa `group_size = 8` muestras por prompt (patrón tipo GRPO) y una función de pérdida con `dppo_mask_low = 0.2`, `dppo_mask_high = 0.28`, `adv_tau = 1.0` y `kl_tau = 0.001`, lo que apunta a una variante DPPO con enmascarado de importancia y penalización KL muy laxa respecto a la política de referencia.

La señal de recompensa proviene de un juez open-ended externo, el modelo `gpt-5.6-luna`, invocado vía endpoint HTTP con `temperature = 1.0`, `max_tokens = 4096`, `top_p = 1.0`, `reasoning_effort = "medium"`, hasta 3 reintentos y 32 peticiones concurrentes. La generación del learner se realiza con `temperature = 0.9`, `top_p = 1.0`, `max_tokens = 4096` y `enable_thinking = true`. La infraestructura declarada es de 2 GPUs por nodo (1 para inferencia, 1 para entrenamiento), servidor vLLM con `gpu_memory_utilization = 0.9`, parser de razonamiento `qwen3` y parser de tool calls `qwen3_coder`, y un orquestador con hasta 256 rollouts en vuelo y un máximo de 8 pasos off-policy. El checkpoint se guarda con `weights_only = true` cada 1.000 pasos.

No se documentan la composición del dataset, el número total de tokens de entrenamiento, ni procesos previos de SFT, RLHF o DPO.

## Capacidades

Todas las capacidades siguientes se deducen de la configuración de entrenamiento e inferencia y de la familia del modelo base; no están verificadas por el autor ni respaldadas por evaluaciones publicadas.

- Generación de texto autoregresiva en modo conversacional, heredada de Qwen3.5-4B.
- Modo razonamiento explícito (`enable_thinking = true`) con parser de razonamiento `qwen3` configurado en vLLM, lo que indica soporte de cadenas de pensamiento separadas de la respuesta final.
- Tool calling / function calling: la configuración activa `tool_call_parser = "qwen3_coder"`, lo que implica soporte previsto de llamadas a herramientas en formato estructurado.
- Ejecución de agentes multi-paso: el orquestador permite cadenas de hasta 8 pasos off-policy durante el entrenamiento y 256 rollouts concurrentes.
- Procesamiento de contextos extensos: 65.536 tokens configurados en inferencia.
- Inferencia solo de lenguaje: la configuración fija `language_model_only = true`, por lo que no hay indicios de capacidades de visión o audio.
- Capacidades multilingües: no disponible.
- Ajuste específico mediante RL con recompensa de juez externo, orientado al objetivo interno del experimento (`diversity-history`), cuyo efecto real sobre el comportamiento final no está documentado.

## Casos de uso

- Reproducción de experimentos de RL sobre modelos de ~4 B: la configuración TOML y el comando de entrenamiento publicados permiten recrear el pipeline completo (rollouts con vLLM, juez externo, DPPO con enmascarado de importancia, `group_size = 8`), lo que resulta útil para grupos de investigación que estudien estabilidad de RL en modelos pequeños.
- Estudio de diversidad en la generación: el identificador `diversity-history-300` apunta a un experimento centrado en la variedad de las salidas; el checkpoint sirve como punto de comparación frente a la política base o frente a otros `attempt`.
- Comparación de checkpoints dentro de una misma ejecución: al tratarse de la época 3 de un entrenamiento de 3 épocas, permite analizar la deriva de la política (olvido catastrófico, colapso de diversidad, sobreajuste al juez) frente a épocas intermedias.
- Razonamiento multi-paso con modo thinking: para tareas que requieren descomposición explícita (problemas aritméticos encadenados, planificación de tareas), el modo `enable_thinking` está activo y separado de la respuesta final mediante el parser `qwen3`.
- Prototipado de agentes con function calling: el parser `qwen3_coder` permite integrar el modelo en un bucle de agente que emita llamadas a herramientas estructuradas, aunque la fiabilidad real de esas llamadas no está validada.
- Procesamiento de documentos largos: con 65.536 tokens de ventana, el modelo puede abordar análisis de contratos, informes técnicos o transcripciones extensas en una sola pasada, siempre que el hardware soporte el KV cache correspondiente.
- Generación de datos sintéticos con juez automático: el mismo esquema de recompensa basado en `gpt-5.6-luna` puede reutilizarse para filtrar o puntuar grandes volúmenes de salidas generadas por este modelo.
- Análisis de sesgos inducidos por el juez: al haberse optimizado contra un juez propietario concreto, el checkpoint es un caso de estudio útil para medir cuánto se transfiere el sesgo del evaluador a la política entrenada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, Arena-Hard ni ninguna otra métrica, y el autor no declara comparaciones con la política base ni con otros checkpoints.

## Requisitos de hardware

- Pesos: 4,54 B de parámetros en 16 bits equivalen a unos 9,1 GB, coherente con el tamaño del repositorio. En cuantización de 4 bits la huella bajaría a aproximadamente 2,5-3 GB, aunque no se publican versiones cuantizadas.
- KV cache: no disponible con precisión. Depende del número de capas y cabezas KV del modelo base, que no se detalla en la información proporcionada. Como referencia ilustrativa no confirmada, una configuración típica de ~4 B con 36 capas, 8 cabezas KV por GQA y `head_dim = 128` consume unos 144 KB por token en fp16, lo que a 65.536 tokens supondría del orden de 9 GB adicionales.
- GPU recomendadas: cualquier acelerador con al menos 24 GB de VRAM resulta suficiente en 16 bits para contextos moderados (RTX 3090, RTX 4090, L40S, A100 40 GB, H100). Para explotar los 65.536 tokens de contexto con margen conviene disponer de 48-80 GB (L40S, A100 80 GB, H100).
- Cabe en GPU de consumo: sí. En una RTX 4090 o RTX 3090 (24 GB) en 16 bits con contexto reducido, o con holgura si se convierte a 4 bits.
- Opciones de despliegue: vLLM es la ruta soportada por la configuración del autor (`max_model_len = 65536`, `gpu_memory_utilization = 0.9`, parsers `qwen3` y `qwen3_coder`). También son viables TGI y SGLang. Para llama.cpp u Ollama sería necesaria una conversión a GGUF que no se publica en el repositorio.
- Latencia y throughput: no disponibles. La configuración declara 2 GPUs por nodo (1 de inferencia, 1 de entrenamiento) y hasta 256 rollouts concurrentes, pero no se publican medidas de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| `Stage-org/4b-diversity-history-300-27b-z-epoch3` | 4,54 B | 65.536 tokens en inferencia | No disponible | HuggingFace, 0 descargas | Sin benchmarks publicados |
| `Qwen/Qwen3.5-4B` (modelo base) | ~4 B | No disponible en la información proporcionada | No disponible en la información proporcionada | HuggingFace | No disponible |
| Qwen3-4B | ~4 B | 32.768 tokens nativos, ampliable a 131.072 con YaRN | Apache 2.0 | HuggingFace | Benchmarks públicos en la model card original |
| Gemma 3 4B | ~4 B | 128.000 tokens | Licencia de uso de Gemma | HuggingFace | Benchmarks públicos en la model card original |
| Llama 3.2 3B | 3,2 B | 128.000 tokens | Llama 3.2 Community License | HuggingFace | Benchmarks públicos en la model card original |

La comparación es estructural (tamaño, contexto, licencia y disponibilidad): no existe ningún dato de rendimiento de este checkpoint que permita situarlo frente a las alternativas.

## Limitaciones y advertencias

- Licencia no declarada: sin términos explícitos, el uso comercial queda en un limbo legal. No debe desplegarse en producción sin aclarar este punto con el autor.
- Ausencia total de validación externa: cero descargas y cero likes, sin benchmarks ni evaluaciones de terceros.
- Model card inexistente: el README contiene únicamente metadatos de entrenamiento, no describe comportamiento, sesgos ni uso previsto.
- Riesgo de sobreajuste al juez (`reward hacking`): la recompensa proviene de un único modelo propietario (`gpt-5.6-luna`), por lo que la política puede haber aprendido a explotar sus preferencias particulares en lugar de mejorar la calidad objetiva.
- Penalización KL muy laxa (`kl_tau = 0.001`): la política puede haberse alejado mucho del modelo base, con riesgo de degradación de capacidades generales, colapso de diversidad o pérdida de instrucciones.
- Datos parcialmente off-policy: la configuración permite hasta 8 pasos off-policy, lo que introduce sesgo en las estimaciones de gradiente si el desfase es grande.
- Discrepancia de longitud de contexto: el learner declara `seq_len = 300.000` mientras la inferencia fija `max_model_len = 65.536`. No está claro si la ventana efectiva del modelo es una u otra, ni si el entrenamiento con secuencias tan largas fue real.
- Idiomas no declarados: no puede asumirse un rendimiento multilingüe equivalente al del modelo base.
- Solo lenguaje: `language_model_only = true` descarta visión, audio u otras modalidades.
- Alucinación: inherente a los modelos generativos de esta escala; la ausencia de evaluaciones agrava la incertidumbre.
- Sesgos: no documentados. Al haber sido optimizado contra un juez propietario y un dataset no descrito, los sesgos de ambas fuentes pueden haberse amplificado.
- Naturaleza experimental: el nombre del repositorio indica un checkpoint intermedio de un experimento (`epoch3`), no una versión estable ni recomendada para uso general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stage-org/4b-diversity-history-300-27b-z-epoch3
- Dataset de entrenamiento: https://huggingface.co/datasets/Stage-org/4b-diversity-history-300-27b-z
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Nota sobre la búsqueda web: los resultados devueltos corresponden a portales de ofertas de prácticas ("stage" en francés: stage.fr, 1jeune1solution, Welcome to the Jungle, Indeed) y no guardan ninguna relación con el modelo. No se han encontrado papers, blogs, repositorios de código ni demos asociados a este checkpoint.
