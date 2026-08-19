# ssurface/cot-dialect-qwen3-4b-instruct-grpo-strict-l4

## Resumen

El modelo `ssurface/cot-dialect-qwen3-4b-instruct-grpo-strict-l4` es un adaptador LoRA publicado por el autor `ssurface` que modifica el comportamiento del modelo base `Qwen/Qwen3-4B-Instruct-2507` para que genere cadenas de razonamiento (chain-of-thought) comprimidas en un "dialecto" de nivel L4, consistente en asignaciones encadenadas con punto y coma (p. ej. `K=18*2.5;D=8*4;T=K+D->T=77`). Forma parte de una colección de investigación sobre compresión de razonamiento en modelos de lenguaje, donde los niveles van de L1 (cadena media de 532 caracteres) a L5 (16 caracteres), con una reducción de 33x.

Este adaptador concreto es una **ablación** dentro del diseño experimental: fue entrenado con una variante de recompensa (`format_strict`) distinta a la del modelo principal del mismo nivel (`ssurface/cot-dialect-qwen3-4b-instruct-grpo-l4`), con el propósito de que la comparación de diseños de reward pueda reproducirse. No ha sido evaluado de forma independiente y se publica como artefacto de entrenamiento, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-4B-Instruct-2507 (transformer decoder-only) |
| Parametros totales | No disponible (adaptador LoRA r=16, alpha=32; el modelo base tiene 4B parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la ficha (depende del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se apila sobre el modelo SFT `ssurface/cot-dialect-qwen3-4b-instruct-sft-l4`, que a su vez parte de `Qwen/Qwen3-4B-Instruct-2507`. El entrenamiento se realizo con `trl.GRPOTrainer` sobre `transformers` estandar con atencion `sdpa`, usando un dataset de 6976 ejemplos de GSM8K re-expresados por un modelo profesor a nivel L4, con una mediana de longitud de cadena de 41 caracteres dentro de la etiqueta `thinking`. La recompensa combina `correctness` (que pondera segun el numero de pasos de la solucion dorada) y `format_strict` (que rechaza cualquier texto fuera de los dos bloques esperados). Se empleo loss tipo `dapo`, 8 generaciones por prompt, batch de 64 con acumulacion 1, max completion de 256 tokens, learning rate 1e-05, coeficiente KL 0, y LoRA con r=16 y alpha=32. El entrenamiento se ejecuto en una unica GPU NVIDIA A100 80GB.

Una nota tecnica relevante: el autor verifico que todos los adaptadores publicados tienen matrices `lora_B` no nulas, descartando 13 que resultaron matematicamente inertes al usar kernels fusionados. Este adaptador paso esa verificacion.

## Capacidades

- Razonamiento matematico sobre problemas de palabras (word problems), generando cadenas de razonamiento comprimidas en formato L4.
- Generacion de texto siguiendo el patron de "dialecto" aprendido: asignaciones encadenadas con punto y coma y operadores aritmeticos.
- No soporta tool calling, function calling, ni capacidades multimodales.
- No incluye modo thinking explicito; el razonamiento se expresa como texto comprimido dentro de la etiqueta `thinking`.
- Multilingue solo en ingles, segun la model card.

## Casos de uso

- Investigacion academica sobre compresion de chain-of-thought: permite reproducir y comparar el efecto de distintas funciones de recompensa (en este caso, `format_strict`) en la calidad y longitud del razonamiento generado.
- Evaluacion de diseno de reward en RL (GRPO): sirve como punto de comparacion frente al modelo principal del mismo nivel para aislar el impacto de la recompensa en el rendimiento final.
- Experimentos de eficiencia en inferencia: al reducir drasticamente la longitud de las cadenas de razonamiento (de cientos de caracteres a decenas), se puede estudiar el trade-off entre precision y coste computacional en tareas de aritmetica.
- Generacion de respuestas comprimidas en entornos con restricciones de tokens o latencia, aunque solo para problemas matematicos simples.
- Validacion de pipelines de entrenamiento con LoRA y GRPO, dado que el autor documenta fallos conocidos con kernels fusionados y la necesidad de verificar `lora_B != 0`.
- Reentrenamiento o fine-tuning posterior: el adaptador puede servir como punto de partida para explorar niveles de compresion mas agresivos o combinaciones de recompensa alternativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que este adaptador no fue evaluado de forma independiente y que los niveles con numeros reportados pertenecen al conjunto principal de la coleccion.

## Requisitos de hardware

- El adaptador LoRA es muy ligero (repo de 0.1 GB), pero requiere cargar el modelo base Qwen3-4B-Instruct-2507 en memoria.
- El modelo base de 4B parametros en bf16 ocupa aproximadamente 8 GB de VRAM, por lo que puede ejecutarse en GPUs consumer como RTX 3090, RTX 4090 o similares con 12 GB o mas.
- Para cargar el adaptador es necesario primero cargar el adaptador SFT L4 (`ssurface/cot-dialect-qwen3-4b-instruct-sft-l4`), fusionarlo, y luego aplicar este adaptador, lo que duplica el proceso de carga.
- Opciones de despliegue: `transformers` con `peft` (como se muestra en el ejemplo de uso), o exportacion a formatos como GGUF para `llama.cpp` u Ollama, aunque no se proporcionan pasos concretos.
- No se dispone de datos de latencia o throughput medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| `ssurface/cot-dialect-qwen3-4b-instruct-grpo-strict-l4` | LoRA sobre Qwen3-4B-Instruct-2507 | Adaptador r=16 | No disponible | Sin benchmarks | apache-2.0 |
| `ssurface/cot-dialect-qwen3-4b-instruct-grpo-l4` | LoRA sobre Qwen3-4B-Instruct-2507 (modelo principal del nivel L4) | Adaptador r=16 | No disponible | No reportado en la ficha | apache-2.0 |
| `Qwen/Qwen3-4B-Instruct-2507` | Modelo base instruct | 4B | 32K (segun documentacion oficial) | No disponible en la ficha | apache-2.0 |

La comparativa se limita a la familia del propio autor; no se dispone de datos de otros modelos de compresion de CoT comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente sobre problemas de matematicas de palabras (GSM8K); no generaliza a otros dominios.
- La precision disminuye con la dificultad del problema, y esta caida es mas pronunciada en los niveles comprimidos.
- Es un artefacto de ablacion: fue entrenado para responder una pregunta concreta sobre diseno de recompensa y puede ser peor que el modelo principal del mismo nivel.
- Requiere cargar previamente el adaptador SFT L4 y fusionarlo; cargarlo directamente sobre el modelo base no reproduce los resultados esperados.
- Entrenado con una unica semilla; diferencias de unos pocos puntos porcentuales pueden deberse al ruido estadistico (intervalo de confianza del 95% de aproximadamente 2.7 pp con n=1317).
- Solo soporta ingles.
- No se proporcionan garantias de comportamiento en produccion; se recomienda validar exhaustivamente antes de cualquier uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-strict-l4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Adaptador SFT L4 necesario para el apilamiento: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-sft-l4
- Referencia del paper citado en la model card: "Chain-of-Thought Compression Dialects" (Frolov, Anatolii, 2026) — sin enlace directo disponible.
