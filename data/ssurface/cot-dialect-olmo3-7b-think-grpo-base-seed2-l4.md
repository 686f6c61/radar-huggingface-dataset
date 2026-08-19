# ssurface/cot-dialect-olmo3-7b-think-grpo-base-seed2-l4

## Resumen

Este repositorio contiene un adaptador LoRA de la familia "Chain-of-Thought Compression Dialects", desarrollado por Anatolii Frolov (ssurface). El adaptador se monta sobre `allenai/Olmo-3-7B-Think` y entrena al modelo para razonar en el "dialecto" de compresion L4, que expresa el razonamiento como asignaciones encadenadas con punto y coma (por ejemplo, `K=18*2.5;D=8*4;T=K+D->T=77`). El objetivo es comprimir cadenas de pensamiento largas en representaciones ultracompactas sin perder precision en tareas de razonamiento matematico.

Se trata de una variante de ablation (recompensa `base-seed2`) publicada para permitir reproducir el analisis de diseno de recompensas descrito en el paper. No es el modelo principal de su nivel; el modelo principal es `ssurface/cot-dialect-olmo3-7b-think-grpo-l4`. El adaptador se entreno con GRPO sobre el modelo SFT fusionado del nivel L4, con un unico seed y sobre el conjunto GSM8K. Alcanza un 67,9% de precision exacta en GSM8K test (n=1317) con decodificacion greedy y sin self-consistency.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16, alpha=32) sobre Olmo-3-7B-Think (Transformer causal de 7B parametros) |
| Parametros totales | 7B (modelo base) + adaptador LoRA (~0.2 GB en safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Olmo-3-7B-Think) |
| Tipos de cuantizacion | bfloat16 en entrenamiento; cuantizacion de inferencia no especificada |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con GRPO (Group Relative Policy Optimization) mediante `trl.GRPOTrainer` sobre `transformers` estandar con atencion `sdpa`. La funcion de recompensa combina dos componentes: `correctness`, que pondera segun el numero de pasos de la solucion dorada (los problemas mas dificiles valen mas), y `format`, que exige una unica respuesta en formato ` thinking... response` seguida de `#### <answer>`. El tipo de loss es `dapo`, con 8 generaciones por prompt, batch 32 x 2 acumulaciones, maximo de 256 tokens de completacion, learning rate 1e-05 y coeficiente KL (beta) 0.0.

El entrenamiento se realizo sobre el modelo SFT fusionado del nivel L4 (`merged_olmo/l4`), no sobre el modelo base crudo. El conjunto de prompts fue `gsm8k_grpo_balanced_1k.json`, con 6976 ejemplos de GSM8K train reexpresados a nivel L4 por un modelo profesor, con una longitud mediana de cadena de 41 caracteres dentro de ` thinking`. El entrenamiento se ejecuto en una unica NVIDIA A100 80GB.

Nota importante del autor: se verifico que todos los adaptadores publicados tienen `lora_B != 0`; 13 adaptadores que fallaron esta comprobacion fueron retenidos. El camino de kernels fusionados produjo adaptadores con matrices `lora_B` a cero, por lo que se uso `transformers` estandar.

## Capacidades

- Razonamiento matematico con cadena de pensamiento comprimida en dialecto L4 (asignaciones encadenadas con punto y coma).
- Generacion de texto en formato estructurado ` thinking... response` con respuesta final tras `####`.
- Compresion de razonamiento: reduce la cadena mediana de 532 caracteres (nivel L1) a 41 caracteres (nivel L4), un rango de 33x en la familia.
- Soporte de tool calling: no disponible (no documentado).
- Soporte de agentes y multi-step reasoning: limitado al razonamiento matematico de un solo turno.
- Capacidades multilingues: no; solo ingles.
- Capacidades especiales: compresion de chain-of-thought como objeto de estudio experimental.
- Formato de prompt requerido: `Solve this using Level 4 (Shorthand).\nProblem: {your problem}`.

## Casos de uso

- Investigacion sobre compresion de cadenas de pensamiento: el modelo permite estudiar como afecta la compresion del razonamiento a la precision en tareas matematicas, comparando niveles L1 a L5 dentro de la familia.
- Reproduccion de experimentos de diseno de recompensas: al ser una ablation con recompensa `base-seed2`, sirve para validar el analisis de sensibilidad al diseno de reward en el paper "Chain-of-Thought Compression Dialects".
- Razonamiento matematico con presupuesto de tokens reducido: en entornos donde el coste de generacion es critico, el dialecto L4 produce cadenas de 41 caracteres, reduciendo drasticamente el numero de tokens de salida frente a modelos de razonamiento convencionales.
- Evaluacion de tecnicas de RL (GRPO) sobre modelos de razonamiento: el adaptador documenta un setup reproducible con `trl.GRPOTrainer`, loss dapo y recompensas combinadas, util como referencia metodologica.
- Generacion de soluciones matematicas en formato compacto: el formato ` thinking... response` con respuesta final tras `####` permite extraer facilmente la respuesta en pipelines automaticos de parseo.
- Benchmarking de modelos de razonamiento comprimido: como punto de referencia para comparar la perdida de precision frente a modelos sin compresion o con niveles de compresion mas bajos (L1 a L5).

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card:

| Tarea | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| Razonamiento matematico | GSM8K (openai/gsm8k) | test | Accuracy (exact match) | 67,9% |

Condiciones de evaluacion: n=1317, decodificacion greedy, un solo turno, sin ejemplos (exemplars) y sin self-consistency. El autor indica que el intervalo de confianza al 95% tiene una semi-amplitud de ~2,7 puntos porcentuales para n=1317.

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa ~0.2 GB; el modelo base Olmo-3-7B-Think en bfloat16 requiere aproximadamente 14-16 GB de VRAM.
- GPU recomendada: NVIDIA A100 80GB (usada en entrenamiento); para inferencia, una RTX 4090 (24 GB) o similar es suficiente para el modelo completo en bfloat16.
- Cabe en GPUs de consumo con 16 GB o mas de VRAM (RTX 4080, RTX 4090, etc.) si se usa el modelo base en bfloat16 o cuantizado.
- Opciones de despliegue: `transformers` con `peft` (carga del adaptador), compatible con `vLLM` y `TGI` si se fusiona el adaptador con el modelo base. No se documenta soporte para `llama.cpp` u `Ollama` en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | GSM8K (test) | Contexto | Licencia |
|---|---|---|---|---|
| ssurface/cot-dialect-olmo3-7b-think-grpo-base-seed2-l4 (este) | LoRA sobre Olmo-3-7B-Think | 67,9% | no disponible | apache-2.0 |
| ssurface/cot-dialect-olmo3-7b-think-sft-l4 | LoRA SFT nivel L4 | no disponible | no disponible | apache-2.0 |
| ssurface/cot-dialect-olmo3-7b-think-grpo-l4 | LoRA GRPO nivel L4 (modelo principal) | no disponible | no disponible | apache-2.0 |
| allenai/Olmo-3-7B-Think | Modelo base 7B | no disponible | no disponible | apache-2.0 |

Nota: los datos de GSM8K de los modelos comparados no estan disponibles en la informacion proporcionada. Este adaptador es una ablation de recompensa y puede ser peor que el modelo principal del mismo nivel.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de matematicas con palabras (GSM8K); no generaliza a otras tareas.
- La precision cae con la dificultad del problema, y la caida es mas rapida en los niveles comprimidos.
- Es una ablation de recompensa (`base-seed2`), no el modelo principal del nivel L4; puede ser peor que `ssurface/cot-dialect-olmo3-7b-think-grpo-l4`.
- Entrenado con un unico seed; diferencias de un par de puntos porcentuales estan dentro del ruido estadistico.
- Requiere cargar primero el adaptador SFT del nivel L4 (`ssurface/cot-dialect-olmo3-7b-think-sft-l4`) y fusionarlo antes de aplicar este adaptador; cargarlo directamente sobre el modelo base no reproduce el resultado publicado.
- Solo soporta ingles; no hay soporte multilingue.
- Riesgo de alucinacion: no evaluado especificamente, pero al ser un modelo de razonamiento comprimido, las respuestas incorrectas pueden presentarse con formato confiado.
- Licencia apache-2.0 permite uso comercial, y el modelo base Olmo-3-7B-Think tambien es apache-2.0, por lo que no hay restricciones conocidas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-base-seed2-l4
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Adaptador SFT requerido: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l4
- Modelo principal del nivel L4: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-l4
- Pagina del proyecto Olmo (Ai2): https://allenai.org/olmo
