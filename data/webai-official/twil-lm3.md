# webAI-Official/TwIL-LM3

## Resumen

TwIL-LM3 es un modelo de lenguaje de 3.075 millones de parámetros (3,08B) especializado en tareas de lógica formal, desarrollado por webAI-Official. Se construye sobre SmolLM3-3B de Hugging Face mediante un pipeline de post-entrenamiento que combina LoRA SFT, fusión de checkpoints, interpolación de pesos WiSE-FT (λ = 0,25) y aprendizaje por refuerzo GRPO ponderado por entropía. El modelo está diseñado para emitir objetos estructurados (traducciones a lógica de primer orden, etiquetas de implicación, análisis semánticos, enunciados Lean y crítica de pruebas) en lugar de prosa conversacional.

Su relevancia radica en que mejora simultáneamente el rendimiento en el dominio objetivo (+26% relativo, macro gate 0,336 → 0,422) y en benchmarks retenidos (+0,022 en media core), un resultado poco habitual tras un ajuste fino específico de tarea, que normalmente provoca degradación en capacidades generales. Con 3,08B parámetros en bf16 y builds GGUF desde Q4_K_M (1,78 GiB), es desplegable en CPU o en GPUs de consumo con 4 GB de VRAM.

La arquitectura es un transformer decoder-only de 36 capas con tamaño oculto 2048, vocabulario de 128.256 tokens y ventana de contexto de 65.536 tokens heredada del modelo base. Emite un bloque `<think>…</think>` antes de la respuesta. La licencia es no comercial (webAI Non-Commercial License ver. 1.0), lo que restringe su uso en producción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM3); 36 capas, hidden size 2048 |
| Parametros totales | 3.075.098.624 (3,08B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 65.536 tokens (evaluado en ventana de 8.192 tokens) |
| Tipos de cuantizacion | bf16, Q4_K_M, Q5_K_M, Q6_K, Q8_0, F16 (GGUF) |
| Idiomas soportados | Inglés |
| Licencia | webAI Non-Commercial License ver. 1.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de SmolLM3-3B, un transformer decoder-only de 36 capas con tamaño oculto 2048 y vocabulario de 128.256 tokens. El post-entrenamiento se ejecuta en cuatro etapas: primero un ajuste fino supervisado con LoRA sobre datos de lógica formal; después una fusión de checkpoints; a continuación una interpolación de pesos WiSE-FT con λ = 0,25, que mezcla los pesos ajustados con los del modelo base para preservar capacidades generales; y finalmente un aprendizaje por refuerzo con GRPO ponderado por entropía (MGPO), detenido en el paso 2071.

La innovación principal es el uso de WiSE-FT combinado con GRPO para evitar el colapso de capacidades fuera de dominio que suele acompañar al ajuste fino específico. El modelo conserva la ventana de contexto de 65.536 tokens del base sin modificaciones, aunque todas las evaluaciones publicadas se realizaron con `max_seq_len` de 8.192 tokens y decodificación greedy con 2.048 tokens nuevos. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto con modo de razonamiento explícito: emite un bloque `<think>…</think>` antes de la respuesta final.
- Traducción a lógica de primer orden (FOL) y etiquetado de implicación (entailment).
- Análisis semántico estructurado de enunciados.
- Formalización en Lean (generación de enunciados) y crítica de pruebas Lean.
- Inducción de reglas y derivación lógica.
- Razonamiento matemático: perplexity de 3,8229 en corpus matemático, la más baja entre los modelos publicados en la tabla comparativa del autor.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Verificación formal de especificaciones: el modelo traduce enunciados en lenguaje natural a lógica de primer orden y etiqueta implicaciones, lo que permite integrarlo en pipelines de verificación de contratos o invariantes de software donde se requiere representación lógica estructurada.
- Asistencia en demostración con Lean: genera enunciados Lean y critica pruebas existentes, útil como copiloto para investigadores que formalizan matemáticas en Lean 4 con token-F1 de 0,5869 en formalización.
- Extracción de estructura semántica: su capacidad de análisis semántico (0,4416 en el benchmark del autor, por encima de Qwen3-8B con 0,4257) lo hace adecuado para convertir texto técnico en representaciones parseadas utilizables por motores de razonamiento downstream.
- Enseñanza de lógica formal: puede generar derivaciones paso a paso con el bloque de pensamiento visible, útil en entornos educativos para explicar reglas de inferencia, aunque requiere supervisión por la tasa de acierto en derivación (0,3192 en el benchmark del autor).
- Procesamiento por lotes en CPU: con el build Q4_K_M de 1,78 GiB y aproximadamente 32,9 respuestas completadas por segundo según el autor, es viable para clasificación masiva de enunciados lógicos en servidores sin GPU.
- Prototipado de investigación en razonamiento neuro-simbólico: al ser un modelo pequeño con salida estructurada y licencia de investigación, sirve como componente de sistemas híbridos que combinan un LLM con un solver lógico o un comprobador de pruebas.
- Filtrado y anotación de corpus lógicos: su bajo coste de inferencia y su especialización permiten etiquetar grandes volúmenes de pares enunciado-etiqueta para construir datasets de entrenamiento de modelos mayores.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (Track A, dominio de lógica formal; decodificación greedy, 2.048 tokens nuevos, `max_seq_len` 8.192):

| Metrica | TwIL-LM3 | TwIL-LM3* | SmolLM3-3B | Llama-3.2-3B | LFM2-2.6B | LFM2.5-8B-A1B | Qwen3-8B | gpt-oss-120b |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| lean_formalize token_f1 | 0,5869 | 0,6456 | 0,4347 | 0,3690 | 0,1321 | 0,4655 | 0,4022 | 0,6306 |
| rule_induction derivation | 0,3192 | 0,9644 | 0,1029 | 0,0825 | 0,0615 | 0,1936 | 0,3680 | 0,6518 |
| entailment_label accuracy | 0,575 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Resumen comparativo declarado por el autor:

| Metrica | TwIL-LM3 | Referencia |
|---|---:|---|
| Macro gate in-domain | 0,422 (base: 0,336; +26% relativo) | SmolLM3-3B |
| Media macro held-out (10 datasets) | 0,7339 (base: 0,7193; +0,022) | SmolLM3-3B |
| Strict-7 | 0,1971 | Qwen3-8B: 0,2093 |
| Semantic parsing | 0,4416 | Qwen3-8B: 0,4257 |
| Perplexity corpus matemático | 3,8229 | Qwen3-8B: 4,0083 |
| Longitud media generación (Track B) | 482 tokens | — |
| Respuestas completadas por segundo | 32,9 | gpt-oss-120b: ~8× menor según el autor |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible. Los datos de la tabla de Track A están truncados en la model card proporcionada; las celdas no disponibles se indican como tales.

## Requisitos de hardware

- VRAM estimada: ~6,2 GB en bf16 (5,73 GiB de pesos más overhead de activaciones); ~2 GB en Q4_K_M (1,78 GiB); ~3,5 GB en Q5_K_M; ~4 GB en Q6_K; ~4,5 GB en Q8_0.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070); A100 o H100 no son necesarias y estarían infrautilizadas.
- Cabe en GPU de consumo: sí, desde una GTX 1660 de 6 GB con Q4_K_M, o una RTX 3050 de 8 GB en bf16.
- Opciones de despliegue: transformers (librería declarada), llama.cpp y Ollama mediante los builds GGUF publicados; vLLM y TGI son compatibles con el formato safetensors aunque no se documentan explícitamente en la model card.
- Throughput: el autor reporta 32,9 respuestas completadas por segundo con generaciones medias de 482 tokens en su harness, aproximadamente ocho veces la tasa de gpt-oss-120b, atribuido a respuestas más cortas y no a una decodificación excepcionalmente rápida. No se especifica la GPU empleada en esa medición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TwIL-LM3 | 3,08B | 65.536 | Lógica formal, Lean | No comercial (webAI) | Hugging Face, GGUF |
| SmolLM3-3B | 3,08B | 65.536 | Propósito general | Apache 2.0 (modelo base) | Hugging Face |
| Qwen3-8B | 8B | no disponible en la información | Razonamiento general | no disponible en la información | Hugging Face |
| Llama-3.2-3B | 3B | no disponible en la información | Propósito general | Llama license | Hugging Face |
| LFM2-2.6B | 2,6B | no disponible en la información | Propósito general | no disponible en la información | Hugging Face |

Frente a SmolLM3-3B, TwIL-LM3 mejora la formalización Lean (0,5869 frente a 0,4347) y la inducción de reglas (0,3192 frente a 0,1029), pero pierde ligeramente en seguimiento de instrucciones según el propio autor. Frente a Qwen3-8B, con 2,6 veces menos parámetros, queda 0,012 por debajo en Strict-7 pero lo supera en formalización Lean y análisis semántico. Frente a gpt-oss-120b, queda por debajo en todas las métricas objetivas reportadas salvo en eficiencia de generación.

## Limitaciones y advertencias

- No es un asistente general: no incorpora ajuste de seguridad ni de preferencias más allá del que trae SmolLM3-3B, y el seguimiento de instrucciones retrocedió ligeramente respecto al base.
- Riesgo de alucinación en derivaciones lógicas: la métrica de derivación en el dominio objetivo es 0,3192, lo que implica que aproximadamente dos tercios de las derivaciones evaluadas no son correctas según el harness del autor.
- Idioma: solo inglés; no se documenta soporte de castellano ni de otros idiomas.
- Contexto: aunque hereda 65.536 tokens, todas las evaluaciones se hicieron en ventanas de 8.192 tokens; el rendimiento en contextos largos no está validado.
- Licencia no comercial (webAI Non-Commercial License ver. 1.0): prohibido el uso comercial sin autorización expresa; revisar el texto completo en el enlace de licencia antes de cualquier despliegue en producción.
- El autor recomienda versiones posteriores (TwIL-LM3-Pro de 3,66B y la rama TwIL-LM3.1) como mejores alternativas, lo que sugiere que esta release queda superada por sus propias iteraciones.
- No se documentan sesgos específicos ni evaluación de seguridad en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/webAI-Official/TwIL-LM3
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- TwIL-LM3-Pro: https://huggingface.co/webAI-Official/TwIL-LM3-Pro
- Licencia: https://huggingface.co/webAI-Official/TwIL-LM3/blob/main/LICENSE.md
