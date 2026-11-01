# thealper2/mlx-qwen3.5-0.8b-grpo-reasoning

## Resumen

`thealper2/mlx-qwen3.5-0.8b-grpo-reasoning` es un adaptador LoRA entrenado con GRPO (Group Relative Policy Optimization) sobre el modelo `mlx-community/Qwen3.5-0.8B-bf16`, una conversión a formato MLX del `Qwen/Qwen3.5-0.8B`. Lo desarrolla el usuario thealper2 como experimento educativo sobre aprendizaje por refuerzo con recompensas verificables en modelos pequeños. El problema que aborda es acotado y concreto: conseguir que un modelo de 0,8 mil millones de parámetros responda problemas aritméticos de primaria terminando la respuesta con una línea `Answer: <número>`.

La relevancia del proyecto es metodológica más que de producto. Demuestra que un bucle GRPO muy corto (cuatro pasos de optimización, 8 preguntas por paso con 8 respuestas muestreadas cada una) y una recompensa binaria basada únicamente en el número final pueden modificar de forma medible el comportamiento de un modelo pequeño: la tasa de acierto en las primeras 200 preguntas del test de GSM8K pasa del 6,0 % al 61,5 % cuando se usa la instrucción de formato. Es un caso de estudio sobre cómo una recompensa sobre la respuesta final, sin supervisión del razonamiento intermedio, altera la longitud y la estructura de las respuestas.

El repositorio contiene exclusivamente el adaptador (`adapters.safetensors` más `adapter_config.json` en formato MLX-LM), no un modelo autónomo. Requiere cargarse sobre la revisión exacta del modelo base indicada por el autor y ejecutarse en macOS sobre Apple Silicon con `mlx-lm`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 (modelo base), con atención lineal en las capas que el adaptador identifica como `linear_attn`; adaptador LoRA sobre las proyecciones lineales de los 24 bloques |
| Parametros totales | No disponible para el adaptador; el modelo base es de 0,8B. El adaptador tiene 10.822.656 parámetros entrenables |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | El adaptador se distribuye en formato MLX; el modelo base referenciado es bf16. No se documentan otras cuantizaciones |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `adapters.safetensors` + `adapter_config.json` (MLX-LM); no incluye pesos completos ni GGUF |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer Qwen3.5 de 24 bloques. El LoRA tiene rango 16 y escala 4, y cubre todas las proyecciones lineales: `q_proj`, `k_proj`, `v_proj` y `o_proj` de la atención, las proyecciones de la atención lineal (`in_proj_qkv`, `in_proj_z`, `in_proj_a`, `in_proj_b`, `out_proj`) y las del MLP (`gate_proj`, `up_proj`, `down_proj`). El entrenamiento se hizo con `mlx-lm` 0.32.2 sobre mlx 0.32.4, en un Apple M1 con 8 GB de memoria unificada, con un pico de 6,74 GB y un tiempo total de 2233,7 segundos.

El procedimiento es GRPO con recompensa verificable: en cada paso se muestrean 8 respuestas por pregunta (8 preguntas por paso, temperatura 1,0, máximo 512 tokens nuevos), se calcula la ventaja como `(recompensa − media del grupo) / (desviación típica del grupo + 0,0001)` y se descartan los grupos con recompensas iguales. La recompensa es 1 si la última línea `Answer:` contiene el número correcto y 0 en caso contrario. Solo hubo cuatro pasos de optimización con AdamW (lr 2e-05 constante, betas 0,9/0,999, eps 1e-08, sin weight decay, sin corrección de sesgo, semilla 0). Los datos son `openai/gsm8k` (7.473 filas de entrenamiento, 200 de test usadas en evaluación, 1.319 de test_split), con el orden barajado mediante `random.Random(0)` y sin solapamiento entre train y test. La tasa de acierto durante el entrenamiento evolucionó de 9,4 % a 18,8 %, 34,4 % y 39,1 % en los cuatro pasos, y la longitud media de respuesta pasó de 14,4 a 380,2 tokens.

## Capacidades

- Generación de texto en inglés orientada a resolver problemas aritméticos verbales de nivel de primaria (GSM8K).
- Producción de una respuesta con formato fijo que termina en la línea `Answer: <número>`, tal como se entrenó.
- Razonamiento aritmético de varios pasos en problemas cortos, con el modo de pensamiento desactivado (`enable_thinking=False`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso más allá de la cadena de cálculo dentro de una respuesta.
- Capacidad multilingüe limitada al inglés.
- No tiene visión, audio ni otras modalidades.

## Casos de uso

- Docencia e investigación sobre RLHF y RLVR: reproducir el experimento completo en un Apple M1 de 8 GB permite ilustrar cómo una recompensa binaria sobre la respuesta final modifica la política de un modelo pequeño sin supervisión del razonamiento intermedio.
- Estudio de la relación entre recompensa y longitud de respuesta: el salto de 14,4 a 380 tokens de media entre el primer y el segundo paso es un caso concreto para analizar el efecto de la ventaja relativa en la verbosidad.
- Evaluación de técnicas de formato instruccional: comparar el 6,0 % con instrucción frente al 52,0 % sin instrucción en el modelo base muestra cuánto depende el rendimiento del prompt y sirve para diseñar experimentos controlados.
- Prototipado de pipelines de evaluación con recompensas verificables: el script de evaluación (200 problemas, decodificación greedy, 1024 tokens, detección de la última línea `Answer:`) es reutilizable para otras tareas con respuesta numérica.
- Experimentos de adaptación eficiente en hardware de consumo: sirve como plantilla para entrenar LoRA con GRPO en un portátil Apple Silicon sin GPU dedicada.
- Pruebas de integración de MLX-LM: validar flujos de `snapshot_download` más `mlx_lm.load` con `adapter_path` y `apply_chat_template` con `enable_thinking=False` en entornos macOS.

## Benchmarks y rendimiento

Evaluación sobre los primeros 200 problemas del test de GSM8K, decodificación greedy, máximo 1024 tokens nuevos, modo de pensamiento desactivado. Una respuesta cuenta como correcta si su última línea `Answer:` contiene el número de referencia (con instrucción) o si el último número coincide (sin instrucción).

| Modelo / prompt | Aciertos | Tokens medianos de respuesta | Respuestas truncadas | Fecha |
|---|---|---|---|---|
| Base, pregunta + instrucción de línea Answer | 12 / 200 (6,0 %) | 5,0 | 0 | 2026-10-31 |
| Base, solo pregunta (último número) | 104 / 200 (52,0 %) | 322,0 | 12 | 2026-10-31 |
| Base + este adaptador, pregunta + instrucción | 123 / 200 (61,5 %) | 395,5 | 45 | 2026-10-31 |

Frente al modelo base en los mismos problemas: 116 pasan a correctos y 5 pasan a incorrectos. El intervalo de confianza del 95 % a 200 problemas es de hasta aproximadamente ±7 puntos porcentuales.

## Requisitos de hardware

- Requiere macOS sobre Apple Silicon; no funciona en CUDA ni en CPU x86 con este formato.
- Memoria: el entrenamiento usó un pico de 6,74 GB en un M1 de 8 GB. La inferencia con el adaptador en bf16 debería caber en configuraciones de 8 GB de memoria unificada, aunque no se publican cifras específicas de inferencia.
- GPU recomendadas: no aplica en el sentido habitual; el hardware objetivo es Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No se documenta compatibilidad con A100, H100 ni RTX 4090.
- Cabe en GPU de consumo en el sentido de que el modelo base de 0,8B en bf16 ocupa poco más de 1,6 GB de pesos, pero el adaptador solo se puede cargar con MLX.
- Despliegue: `mlx-lm` (versión `>=0.32.2,<0.33`) con `mlx_lm.load` y `adapter_path`. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El tiempo de entrenamiento fue de 2233,7 segundos para 4 pasos con 64 muestras por paso en un M1.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K (200 test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Base `Qwen3.5-0.8B` (MLX, bf16) | 0,8B | No disponible | 52,0 % sin instrucción; 6,0 % con instrucción | Apache 2.0 | HuggingFace (mlx-community) |
| Base + este adaptador GRPO | 0,8B + 10,8M entrenables | No disponible | 61,5 % con instrucción | Apache 2.0 | HuggingFace (thealper2) |
| Alternativas comparables de 0,5B–1B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de otros adaptadores GRPO para modelos de este tamaño en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El adaptador no es un modelo autónomo: debe cargarse sobre la revisión exacta `3067585164dbcc505eec73d554349de6a27571a4` de `mlx-community/Qwen3.5-0.8B-bf16`. Otra revisión o cuantización puede romper la compatibilidad.
- Solo funciona en macOS sobre Apple Silicon con `mlx-lm`; no hay soporte para CUDA, ROCm ni CPU genérica.
- Entrenado únicamente en inglés y sobre GSM8K; no se ha validado en otros dominios, idiomas ni tipos de razonamiento.
- El autor advierte explícitamente contra su uso donde un número incorrecto tenga consecuencias (finanzas, medicina, corrección automática) y contra tratarlo como calculadora.
- Riesgo de alucinación numérica: el 61,5 % de acierto implica que casi cuatro de cada diez respuestas son incorrectas en el conjunto evaluado.
- El 22,5 % de las respuestas con adaptador (45 de 200) se truncaron al límite de 1024 tokens, lo que puede afectar a la fiabilidad en producción con presupuestos de tokens ajustados.
- Entrenamiento muy corto (4 pasos) y con solo 8 preguntas por paso; el intervalo de confianza de ±7 puntos porcentuales limita la solidez de las conclusiones.
- Proyecto experimental y educativo, con 0 descargas y 0 likes en el momento de la consulta; no hay garantía de mantenimiento.
- La licencia Apache 2.0 permite uso comercial, pero la calidad y la fiabilidad del adaptador no están garantizadas para producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thealper2/mlx-qwen3.5-0.8b-grpo-reasoning
- Modelo base (MLX): https://huggingface.co/mlx-community/Qwen3.5-0.8B-bf16
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Repositorio MLX-LM: no disponible en la información proporcionada
- Paper de GRPO: no disponible en la información proporcionada
