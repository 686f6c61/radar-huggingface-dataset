# ssurface/cot-dialect-olmo3-7b-think-grpo-sftlen-exp-l5

## Resumen

`cot-dialect-olmo3-7b-think-grpo-sftlen-exp-l5` es un adaptador LoRA publicado por `ssurface` que modifica el comportamiento del modelo base `allenai/Olmo-3-7B-Think` para razonar en un nivel de compresion de cadena de pensamiento extremo, denominado L5. En este nivel, la cadena de razonamiento se colapsa a una unica expresion algebraica breve —por ejemplo `18/3*2=12`— en lugar de los pasos intermedios verbosos tipicos de los modelos de razonamiento. El adaptador se entrena con GRPO sobre el conjunto de entrenamiento de GSM8K reexpresado a nivel L5 por un modelo profesor, con 6993 ejemplos y una longitud mediana de cadena de 16 caracteres.

Este modelo es una **ablacion**, no uno de los modelos principales de la familia: se publico para que la comparacion de diseno de recompensas del articulo «Chain-of-Thought Compression Dialects» pueda reproducirse de forma independiente. El modelo principal del mismo nivel es `ssurface/cot-dialect-olmo3-7b-think-grpo-l5`. El adaptador se distribuye bajo licencia Apache 2.0, pesa 0.2 GB y requiere apilarse sobre el modelo SFT de nivel L5 correspondiente, no directamente sobre el base sin entrenar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (base `allenai/Olmo-3-7B-Think`) + adaptador LoRA |
| Parametros totales | 7B (modelo base) + adaptador LoRA r=16, alpha=32 (0.2 GB) |
| Parametros activos | No aplica (no es MoE; solo el adaptador LoRA es entrenable) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite cuantizacion estandar) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base `Olmo-3-7B-Think` es un transformer causal de 7 mil millones de parametros entrenado por AllenAI sobre el dataset Dolma 3 y post-entrenado con razonamiento de cadena de pensamiento larga, lo que mejora tareas de matematicas y codigo. Sobre este base, el adaptador se entrena en dos fases: primero un modelo SFT de nivel L5 (publicado como `ssurface/cot-dialect-olmo3-7b-think-sft-l5`) y despues GRPO con `trl.GRPOTrainer` sobre el modelo SFT fusionado.

El entrenamiento GRPO usa una recompensa compuesta por tres componentes: `correctness` (que pondera segun el numero de pasos de la solucion de oro, dando mas valor a problemas dificiles), `format` (la respuesta debe tener un bloque `thinking...response` y terminar con `#### <respuesta>`) y `sft_length` (penalizacion por desviacion de la longitud de cadena del propio ejemplo SFT). Se generaron 8 respuestas por prompt, con un batch de 64, maximo 256 tokens de completacion, learning rate 1e-05 y coeficiente KL de 0.01. El entrenamiento se realizo en una unica NVIDIA A100 de 80 GB.

Un detalle tecnico relevante: el autor verifico que todos los adaptadores publicados tienen matrices `lora_B` no nulas, descartando 13 que resultaron matematicamente inertes al usar el pipeline fusionado con kernels no fusionados; este adaptador usa atencion `sdpa` estandar.

## Capacidades

- Razonamiento matematico sobre problemas de palabras (GSM8K) con cadenas de pensamiento comprimidas a nivel extremo (L5).
- Generacion de texto en ingles con formato estructurado `thinking` / `response` / `#### <respuesta>`.
- Compresion de cadena de pensamiento: reduce la longitud mediana de razonamiento de 532 caracteres (nivel L1) a 16 caracteres (nivel L5), un factor de 33x.
- Soporte de tool calling: no disponible.
- Capacidades de agente o multi-step reasoning: limitado al razonamiento matematico de un solo turno sin ejemplos ni self-consistency.
- Capacidades multilingues: no (solo ingles).
- Modo thinking: si, heredado del base `Olmo-3-7B-Think`, pero comprimido a una expresion unica.

## Casos de uso

- Investigacion sobre compresion de cadenas de pensamiento: permite estudiar como afecta la recompensa `sft_length` al rendimiento frente al modelo principal del mismo nivel (`grpo-l5`), siendo una pieza clave para reproducir los resultados del articulo.
- Evaluacion de diseno de recompensas en RL (GRPO): sirve como ablacion para aislar el efecto del componente de longitud frente a `correctness` y `format`.
- Razonamiento matematico de alta latencia minima: al colapsar la cadena a una expresion corta, reduce el numero de tokens generados y, por tanto, la latencia de inferencia en tareas de aritmetica de nivel escolar.
- Benchmarking de modelos comprimidos: permite comparar el trade-off entre precision y longitud de razonamiento en la familia de dialectos de compresion.
- Pipeline de generacion de respuestas con formato estricto: el formato `#### <respuesta>` facilita el parseo automatico en sistemas de evaluacion o extraccion de resultados.
- Reproducibilidad cientifica: al estar publicado con configuracion completa (hyperparametros, dataset, recompensas), permite replicar el experimento de ablacion en otros modelos base.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (GSM8K test, n=1317, greedy decoding, un solo turno, sin ejemplos ni self-consistency):

| Modelo | GSM8K (accuracy, exact match) |
|---|---:|
| `cot-dialect-olmo3-7b-think-grpo-sftlen-exp-l5` (este adaptador) | 59.2% |

No se han publicado resultados de benchmarks adicionales en la informacion disponible. El autor indica que la precision cae con la dificultad del problema, de forma mas acusada en los niveles comprimidos, y que el margen de error de la estimacion es de aproximadamente ±2.7 puntos porcentuales (intervalo de confianza del 95% para n=1317).

## Requisitos de hardware

- El adaptador LoRA en si ocupa 0.2 GB, pero requiere cargar el modelo base `Olmo-3-7B-Think` completo (7B parametros).
- VRAM estimada para inferencia: aproximadamente 14-16 GB en bfloat16 sin cuantizacion; con cuantizacion de 4 bits puede reducirse a unos 6-8 GB.
- GPU recomendadas: NVIDIA A100 80GB (usada en entrenamiento), H100, RTX 4090 o RTX 3090 para inferencia en bf16; GPUs consumer con 8 GB o menos requieren cuantizacion.
- El entrenamiento se realizo en 1x NVIDIA A100 80GB, pero la inferencia es viable en hardware consumer.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o directamente con `transformers` + `peft` (cargando el adaptador sobre el modelo SFT fusionado).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; al comprimir la cadena de pensamiento a 16 caracteres, el numero de tokens generados por respuesta es muy reducido, lo que mejora la latencia frente al modelo base sin compresion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Notas |
|---|---|---|---|---|---|
| `cot-dialect-olmo3-7b-think-grpo-sftlen-exp-l5` (este) | 7B + LoRA | no disponible | 59.2% | Apache 2.0 | Ablacion con recompensa `sft_length`; nivel L5 |
| `ssurface/cot-dialect-olmo3-7b-think-grpo-l5` | 7B + LoRA | no disponible | no disponible | Apache 2.0 | Modelo principal del mismo nivel L5 (sin ablacion) |
| `allenai/Olmo-3-7B-Think` (base) | 7B | no disponible | no disponible | Apache 2.0 | Modelo base sin compresion; razonamiento largo estandar |

La comparativa directa con el modelo principal del mismo nivel no es posible con los datos disponibles, ya que no se publican sus resultados en la informacion proporcionada. La diferencia clave entre ambos es la recompensa de entrenamiento: este adaptador usa `sft_length` (penalizacion contra la longitud SFT de cada fila), mientras que el modelo principal probablemente usa otro esquema de recompensa.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de matematicas con palabras (GSM8K); no generaliza a otras tareas de razonamiento o generacion.
- La precision cae con la dificultad del problema, especialmente en niveles comprimidos como L5.
- Es una ablacion disenada para responder una pregunta concreta sobre diseno de recompensas; puede ser peor que el modelo principal del mismo nivel en tareas generales.
- Entrenado con una unica semilla; diferencias de unos pocos puntos porcentuales pueden deberse a ruido estadistico (margen de error ~2.7 pp).
- Requiere apilarse sobre el modelo SFT de nivel L5 (`ssurface/cot-dialect-olmo3-7b-think-sft-l5`) y fusionarlo antes de cargar este adaptador; cargarlo directamente sobre `allenai/Olmo-3-7B-Think` no reproduce los resultados publicados.
- Solo soporta ingles; no hay capacidad multilingue.
- Riesgo de alucinacion en problemas fuera de la distribucion de GSM8K, dado el entrenamiento acotado a un dominio estrecho.
- Licencia Apache 2.0 permite uso comercial, pero el adaptador depende del modelo base, cuya licencia debe verificarse por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-sftlen-exp-l5
- Modelo base `allenai/Olmo-3-7B-Think`: https://huggingface.co/allenai/Olmo-3-7B-Think
- Variante cuantizada por unsloth: https://huggingface.co/unsloth/Olmo-3-7B-Think
- Ficha en LM Studio: https://lmstudio.ai/models/allenai/olmo-3-7b-think
- Referencia del articulo: Frolov, Anatolii. «Chain-of-Thought Compression Dialects», 2026 (cita BibTeX incluida en la model card).
