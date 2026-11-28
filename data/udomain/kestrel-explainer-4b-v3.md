# udomain/kestrel-explainer-4b-v3

## Resumen

Kestrel-Explainer-4B v3 es un ajuste fino del modelo Qwen3-4B de Alibaba, desarrollado por el usuario udomain, especializado en el análisis de cumplimiento de la Ordenanza de Datos Personales (Cap. 486) de Hong Kong. El modelo actúa como analista de cumplimiento normativo: recibe texto y devuelve un JSON estructurado que indica si existe una violación de la normativa, qué principio de protección de datos (DPP1-DPP6) se ve afectado, y otra información de clasificación. Se distribuye bajo licencia Apache 2.0 y está disponible en tres formatos: BF16 completo, GPTQ W4A16 para vLLM y GGUF Q5_K_M para Ollama/llama.cpp.

El modelo se presenta como un `Qwen3ForCausalLM` independiente, con 4.022.468.096 parámetros, plantilla de chat nativa de Qwen3 con `enable_thinking=False`. Su relevancia radica en que aborda un nicho regulatorio muy concreto (privacidad de datos en Hong Kong) con métricas de evaluación publicadas: 96,72% de precisión en veredicto de violación y 93,43% en clasificación del DPP primario sobre un conjunto de evaluación bloqueado de 944 casos.

La familia incluye tres ediciones con distintos requisitos de hardware, lo que permite desplegarlo desde GPUs de 6 GB hasta entornos con 10 GB o más. El modelo solo soporta inglés y chino, lo que limita su uso fuera de esos idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3ForCausalLM) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 8192 tokens (configurado en el ejemplo de vLLM; evaluación L4 hasta 6k) |
| Tipos de cuantizacion | BF16 (completo), GPTQ W4A16, GGUF Q5_K_M |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), GPTQ (W4A16), GGUF (Q5_K_M) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3-4B base, que es un transformer decoder-only con 4.022 millones de parámetros. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card menciona la plantilla de chat nativa de Qwen3 con `enable_thinking=False`, lo que indica que se desactiva el modo de razonamiento extendido del modelo base para producir respuestas directas en formato JSON.

La innovación principal no reside en la arquitectura, sino en la especialización: el modelo está entrenado para emitir salidas estructuradas verificables (esquema JSON con `if_violate`, `label`, `gold_span`, etc.) y para evitar dos fallos críticos en dominios de compliance: la generación de contenido mítico (`myth_rate=0`) y la fuga de fragmentos de referencia (`gold_span_leak=0`). La evaluación reportada incluye pruebas de contexto largo (L4) con posiciones de aguja en inicio, medio y final, con 100% de acierto hasta 6k tokens.

## Capacidades

- Generación de texto y análisis de cumplimiento normativo de la Ordenanza de Datos Personales de Hong Kong (Cap. 486).
- Clasificación de violaciones según los principios DPP1-DPP6, la Parte 6A (marketing directo), la Parte 8 (exenciones) y la sección 64 (doxxing).
- Salida estructurada en JSON con esquema validado (schema_ok del 100% en la evaluación reportada).
- Razonamiento multi-paso para determinar si un texto infringe la normativa y qué principio aplica.
- Capacidad de contexto largo: evaluación con needles en 2k, 4k y 6k tokens con 100% de acierto en todas las posiciones.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües limitadas a inglés y chino.
- Modo thinking desactivado por defecto (`enable_thinking=False`).

## Casos de uso

- Auditoría automatizada de políticas de privacidad: el modelo puede recibir el texto de una política de privacidad y devolver un JSON que indique si cumple con los DPP1-DPP6, señalando el principio afectado y el fragmento relevante. Es adecuado porque su evaluación reportada incluye `gold_span_leak=0`, lo que evita que el modelo cite fragmentos de referencia no deseados.
- Revisión de campañas de marketing directo: permite analizar si una comunicación comercial cumple con la Parte 6A de la ordenanza, clasificando posibles infracciones y facilitando la revisión legal previa a la publicación.
- Detección de doxxing en plataformas: el modelo puede evaluar textos enviados por usuarios para identificar posibles casos de la sección 64 (doxxing), con una precisión de veredicto del 96,72% en el conjunto de evaluación bloqueado.
- Triaje de tickets de cumplimiento: en un equipo legal o de privacidad, el modelo puede clasificar automáticamente consultas o incidentes según el principio DPP afectado, reduciendo el tiempo de triaje manual.
- Formación y concienciación interna: dado su formato de explicación estructurada, puede emplearse para generar explicaciones didácticas sobre por qué un texto concreto infringe la normativa, útil en programas de formación de empleados.
- Despliegue en entornos con recursos limitados: la edición GGUF Q5_K_M (2,7 GB) o la GPTQ W4A16 (2,5 GB) permiten ejecutar el modelo en GPUs de 6 GB u 8 GB, lo que facilita su integración en estaciones de trabajo de equipos legales sin infraestructura dedicada.
- Preprocesamiento en pipelines de compliance: al emitir JSON validado con esquema, puede integrarse como primer paso en un pipeline que derive casos complejos a revisión humana, usando la clasificación automática como filtro.

## Benchmarks y rendimiento

| Benchmark | Resultado (kestrel) | Resultado (v4_legacy) |
|---|---|---|
| Hard blockers (myth_rate) | 0 | 0 |
| Hard blockers (gold_span_leak) | 0 | 0 |
| Schema OK | 100,0% | 100,0% |
| Verdict accuracy (if_violate) | 96,72% (913/944) | 97,03% (916/944) |
| Primary DPP accuracy (label) | 93,43% (882/944) | 96,08% (907/944) |
| Long-context L4 (2k/4k/6k) | 100% en todas las posiciones | 100% en todas las posiciones |

Los resultados corresponden al conjunto `eval_v2/locked` con N=944. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- BF16 completo: 7,6 GB en disco, aproximadamente 8,1 GB de VRAM; se recomienda GPU de 10 GB o más.
- GPTQ W4A16 (edición vLLM): 2,5 GB en disco, 2,62 GiB de pesos y 3,52 GiB de VRAM total en vLLM; cabe en GPUs de 6 GB u 8 GB.
- GGUF Q5_K_M (edición Ollama/llama.cpp): 2,7 GB en disco; cabe en GPUs de 6 GB u 8 GB sin offload a CPU.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090); la model card solo indica requisitos de VRAM.
- Opciones de despliegue: transformers (BF16), vLLM (BF16 o GPTQ W4A16), Ollama y llama.cpp (GGUF Q5_K_M).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| Kestrel-Explainer-4B v3 | 4.022 M | 8192 (configurado) | Apache 2.0 | Cumplimiento PDPO Cap. 486 (HK) |
| Qwen3-4B (base) | 4.022 M | No disponible en la información | Apache 2.0 | Modelo generalista |
| Alternativas especializadas en compliance | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros modelos comparables especializados en la misma tarea de cumplimiento normativo de Hong Kong. La comparación principal es con su modelo base Qwen3-4B, del que hereda arquitectura y tamaño pero del que difiere por el ajuste fino especializado y la plantilla de chat con thinking desactivado.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no soporta castellano ni otros idiomas, lo que restringe su uso en entornos hispanohablantes.
- Especialización muy estrecha: está diseñado exclusivamente para la Ordenanza de Datos Personales de Hong Kong (Cap. 486); su uso fuera de ese marco regulatorio no está validado.
- Riesgo de alucinación: aunque la evaluación reporta `myth_rate=0` en el conjunto bloqueado, no se han publicado evaluaciones independientes que confirmen este comportamiento en dominios fuera de la distribución de entrenamiento.
- Precisión de clasificación del DPP primario del 93,43%, lo que implica que aproximadamente 6 de cada 100 casos pueden clasificarse incorrectamente; no debe usarse como sustituto de asesoramiento legal.
- No se dispone de información sobre sesgos conocidos, composición del dataset de entrenamiento ni procesos de alineación.
- Aunque la licencia es Apache 2.0 (permite uso comercial), la naturaleza de asesoramiento legal del modelo requiere validación humana en producción.
- El contexto máximo configurado en el ejemplo de vLLM es de 8192 tokens; no se especifica si el modelo soporta ventanas mayores.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- [Hugging Face: udomain/kestrel-explainer-4b-v3](https://huggingface.co/udomain/kestrel-explainer-4b-v3)
- [Edición GPTQ W4A16 para vLLM](https://huggingface.co/udomain/kestrel-explainer-4b-v3-w4a16)
- [Edición GGUF Q5_K_M para Ollama/llama.cpp](https://huggingface.co/udomain/kestrel-explainer-4b-v3-gguf)
- [Modelo base: Qwen/Qwen3-4B](https://huggingface.co/Qwen/Qwen3-4B)
