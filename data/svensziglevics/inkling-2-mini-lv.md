# svensziglevics/Inkling-2-Mini-LV

## Resumen
Inkling-2-Mini-LV es un ajuste fino (fine-tune) del modelo base `thinkingmachines/Inkling-2-Mini`, publicado por el usuario svensziglevics en Hugging Face. Se trata de un modelo de arquitectura MoE con transformer "looped" (repetición de capas) de 26.388.641.280 parámetros totales, del cual solo se activan entre 3.400 y 5.400 millones por token. Su objetivo es especializar el modelo base en letón (lv), manteniendo capacidades en inglés (en), mediante destilación de cadenas de pensamiento concisas desde `TildeOpen-30B` y un refuerzo posterior con GRPO y SDFT sobre CoT cerrado.

La relevancia de este modelo radica en su enfoque: parte de un modelo base sin capacidades demostradas en letón (0,0 % en belebele y copa-lv) y lo lleva a un 94,0 % y 88,0 % respectivamente en la versión v2, manteniendo un 100 % en pruebas de cordura de inglés y código. Es un caso de especialización lingüística agresiva sobre un modelo MoE grande, con cuantizaciones GGUF y adaptadores LoRA publicados de forma separada, lo que facilita su despliegue en entornos con recursos limitados.

El modelo se distribuye en precisión completa BF16/F16 (52,8 GB de repositorio) y con licencia Apache 2.0, lo que permite uso comercial. No obstante, conviene señalar que el autor reporta una caída en la precisión de hechos sobre Letonia (del 67,7 % del base al 36,8 % en v2), un dato relevante para evaluar su idoneidad en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con "looped transformer" (repetición de capas) |
| Parametros totales | 26.388.641.280 |
| Parametros activos | ~3.400-5.400 millones (estimación del autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16/F16 (pesos completos); GGUF Q4_K_M y Q8_0 en repositorio separado |
| Idiomas soportados | Letón (lv), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16/F16); GGUF en repositorio aparte |

## Arquitectura y entrenamiento
El modelo emplea una arquitectura MoE (Mixture of Experts) sobre un transformer con mecanismo "looped", es decir, con repetición de capas para incrementar la profundidad efectiva sin aumentar proporcionalmente el número de parámetros. El modelo base es `thinkingmachines/Inkling-2-Mini`, del que hereda la arquitectura y los pesos iniciales. El ajuste fino se realizó en dos fases: primero una destilación de cadenas de pensamiento concisas en letón desde `TildeOpen-30B`, y después un refuerzo mediante GRPO (Group Relative Policy Optimization) combinado con SDFT (Self-Distillation Fine-Tuning) sobre CoT cerrado. El autor denomina a esta variante "v2 (Concise Tilde CoT)".

El entrenamiento se orientó a que el modelo genere razonamiento interno en letón dentro de la etiqueta `<|content_thinking|>` y la respuesta final en `<|content_text|>`. Según la model card, la "pureza" del pensamiento en letón pasó del 7,9 % en el base al 100 % en v2, y la tasa de finalización del pensamiento a 320 tokens pasó del 41,2 % al 100 %. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni detalles sobre la tokenizadora o la ventana de contexto.

## Capacidades
- Generación de texto en letón e inglés, con razonamiento interno explícito en letón mediante el bloque `<|content_thinking|>`.
- Razonamiento de tipo cadena de pensamiento concisa, orientado a respuestas breves y directas.
- Comprensión lectora y razonamiento lingüístico en letón (evaluado en belebele y copa-lv).
- Capacidades de código e inglés preservadas del modelo base (100 % en la prueba de cordura de 10 ítems).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.
- Modo "thinking" separado del texto de respuesta final mediante etiquetas específicas.

## Casos de uso
- Atención al cliente en letón: el modelo puede gestionar conversaciones multi-turno en letón con razonamiento interno en el mismo idioma, lo que facilita respuestas coherentes y culturalmente adecuadas para usuarios letones.
- Generación de contenido editorial en letón: redacción de artículos, resúmenes y descripciones con cadena de pensamiento concisa, útil para medios o agencias que necesiten producir texto en letón de forma automatizada.
- Traducción asistida inglés-letón: combinado con el 100 % de cordura en inglés, puede emplearse como motor de traducción o de post-edición en flujos bilingües.
- Asistentes educativos para el aprendizaje del letón: el bloque de pensamiento en letón permite mostrar al estudiante el razonamiento paso a paso, lo que resulta útil en tutoría lingüística.
- Procesamiento de documentos administrativos letones: clasificación, extracción y resumen de textos oficiales en letón, aprovechando la comprensión lectora medida en belebele (94,0 %).
- Desarrollo de chatbots especializados en cultura y geografía de Letonia: aunque con cautela por la caída en precisión de hechos (36,8 % en el sondeo `latvia_facts_50`), puede usarse con verificación externa en dominios acotados.
- Integración en pipelines de generación de código bilingüe: al mantener el 100 % en la prueba de cordura de código, puede emplearse para tareas de programación con documentación en letón.

## Benchmarks y rendimiento

| Metrica | Base `Inkling-2-Mini` | v1 | v2 (Concise Tilde CoT) |
|---|---:|---:|---:|
| `facebook/belebele` (`lvs_Latn`, 50 items) | 0,0 % | 86,7 % (15 items) | 94,0 % |
| `AiLab-IMCS-UL/copa-lv` (50 items) | 0,0 % | 80,0 % (15 items) | 88,0 % |
| Pureza de pensamiento en letón (`<\|content_thinking\|>`) | 7,9 % | 100,0 % | 100,0 % |
| Tasa de finalización del pensamiento (@ 320 tokens) | 41,2 % | 0,0 % | 100,0 % |
| Precisión de hechos sobre Letonia (`latvia_facts_50`) | 67,7 % | 50,0 % | 36,8 % |
| Cordura de inglés / código (10 items) | 100,0 % | 100,0 % | 100,0 % |

## Requisitos de hardware
- VRAM estimada para inferencia en BF16/F16: aproximadamente 52,8 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 64-80 GB de VRAM.
- VRAM estimada en GGUF Q8_0: en torno a 28-30 GB, viable en GPUs de 32 GB o en configuraciones multi-GPU.
- VRAM estimada en GGUF Q4_K_M: en torno a 15-17 GB, viable en GPUs consumer de 24 GB (RTX 3090, RTX 4090) y en algunas de 16 GB con contexto reducido.
- GPU recomendadas: A100 80 GB, H100 80 GB para precisión completa; RTX 4090 o RTX 3090 para cuantizaciones GGUF.
- Cabe en GPU consumer: sí, en cuantización Q4_K_M o Q8_0 con GPUs de 24 GB o superiores.
- Opciones de despliegue: llama.cpp u Ollama para GGUF; vLLM o TGI para safetensors en BF16; los adaptadores LoRA publicados permiten ajustes adicionales sobre el modelo base.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-LV (este) | 26,4 B (MoE, ~3,4-5,4 B activos) | no disponible | Apache 2.0 | lv, en | Especializado en letón, con CoT en letón |
| Inkling-2-Mini (base) | 26,4 B (MoE) | no disponible | no disponible | no disponible | Modelo base sin especialización en letón (0,0 % en belebele lv) |
| TildeOpen-30B | ~30 B (no confirmado) | no disponible | no disponible | lv (principal) | Fuente de destilación del CoT en letón |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría más allá de los reportados frente al modelo base y a la versión v1 del propio ajuste.

## Limitaciones y advertencias
- Caída significativa en la precisión de hechos sobre Letonia: del 67,7 % en el modelo base al 36,8 % en v2, según el sondeo `latvia_facts_50`; no es fiable como fuente factual sin verificación.
- Riesgo de alucinación en dominios factuales, especialmente en geografía, historia y datos concretos de Letonia.
- El entrenamiento se centró en dos idiomas (lv, en); el rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- La longitud de contexto no está especificada, lo que impide garantizar conversaciones largas o documentos extensos.
- La tasa de finalización del pensamiento se midió a 320 tokens; no hay datos sobre comportamiento con presupuestos de pensamiento mayores.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base `thinkingmachines/Inkling-2-Mini` y del dataset de destilación antes de un uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validación comunitaria.
- Los benchmarks reportados usan muestras pequeñas (10-50 ítems), lo que limita la significación estadística de los resultados.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/svensziglevics/Inkling-2-Mini-LV
- GGUF (Q4_K_M y Q8_0): https://huggingface.co/svensziglevics/Inkling-2-Mini-LV-GGUF
- Adaptadores LoRA: https://huggingface.co/svensziglevics/Inkling-2-Mini-LV-LoRA
- Dataset: https://huggingface.co/datasets/svensziglevics/inkling-lv-dataset
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
