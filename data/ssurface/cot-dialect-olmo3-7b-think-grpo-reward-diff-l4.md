# ssurface/cot-dialect-olmo3-7b-think-grpo-reward-diff-l4

## Resumen

cot-dialect-olmo3-7b-think-grpo-reward-diff-l4 es un adaptador LoRA desarrollado por ssurface que modifica el modelo allenai/Olmo-3-7B-Think de AllenAI para razonar en un "dialecto" de cadena de pensamiento comprimida de nivel L4, en el que los pasos intermedios se expresan como asignaciones encadenadas con punto y coma (por ejemplo, `K=18*2.5;D=8*4;T=K+D->T=77`). Se trata de un resultado de ablación publicado expresamente para permitir reproducir la comparación de diseño de recompensas descrita en el paper "Chain-of-Thought Compression Dialects" de Anatolii Frolov (2026).

El modelo base, Olmo-3-7B-Think, es un transformer denso de 7.000 millones de parámetros entrenado por AllenAI sobre el dataset Dolma 3, con una variante especializada en razonamiento paso a paso. Este adaptador se entrenó con GRPO sobre el modelo SFT fusionado de nivel L4, utilizando una recompensa distinta (`correctness_sq` + `format`) respecto al modelo principal del mismo nivel, lo que lo convierte en una herramienta para estudiar el impacto del diseño de recompensas en el rendimiento final.

Con licencia Apache 2.0 y un peso de solo 0,2 GB, el adaptador está orientado a investigación y experimentación en compresión de cadenas de razonamiento, evaluación de recompensas en RL y razonamiento matemático eficiente. No es un modelo de producción, sino un artefacto científico de ablación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base: Olmo-3-7B-Think) con adaptador LoRA (r=16, alpha=32) |
| Parametros totales | 7B (modelo base) + adaptador LoRA de 0,2 GB |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bfloat16 (inferencia); no se publican cuantizaciones especificas del adaptador |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se apoya en Olmo-3-7B-Think, un transformer denso de 7B parámetros de AllenAI preentrenado sobre el corpus Dolma 3. El adaptador LoRA (r=16, alpha=32) se entrenó con GRPO (Group Relative Policy Optimization) usando `trl.GRPOTrainer` sobre transformers estándar con atención `sdpa`, partiendo del modelo SFT fusionado de nivel L4 (`ssurface/cot-dialect-olmo3-7b-think-sft-l4`). El autor advierte que el adaptador debe apilarse sobre ese modelo SFT, no directamente sobre el base, para reproducir los resultados.

El conjunto de entrenamiento consistió en 6.976 ejemplos de GSM8K train reexpresados en nivel L4 por un modelo profesor, con una longitud mediana de cadena de 41 caracteres dentro de la etiqueta de pensamiento. La recompensa combinaba `correctness_sq` (corrección con el peso de complejidad al cuadrado) y `format` (la respuesta debe contener un bloque `thinking...response` seguido de `#### <respuesta>`). Se usó loss tipo `dapo`, 8 generaciones por prompt, batch de 64 con acumulación 1, máximo 256 tokens de completado, learning rate de 1e-05 y coeficiente KL de 0.0. El entrenamiento se realizó en una única NVIDIA A100 80GB.

Un detalle técnico relevante: el autor verificó que todos los adaptadores publicados tienen matrices `lora_B` no nulas, descartando 13 adaptadores que fallaron esta comprobación al usar kernels fusionados. Este adaptador concreto se entrenó con transformers estándar y atención `sdpa`, sin kernels fusionados.

## Capacidades

- Razonamiento matemático con cadenas de pensamiento comprimidas en nivel L4, con pasos intermedios expresados como asignaciones encadenadas con punto y coma.
- Generación de texto con formato estructurado: un bloque `thinking...response` seguido de la respuesta final con `####`.
- Razonamiento paso a paso visible y trazable, aunque en formato abreviado.
- Reducción drástica del consumo de tokens en el razonamiento: la cadena mediana es de 41 caracteres, frente a los 532 caracteres del nivel L1 (rango de 33x entre niveles).
- Capacidad multilingüe limitada al inglés, según la configuración del modelo base.
- Sin soporte documentado de tool calling, visión ni audio.

## Casos de uso

- Investigación en compresión de cadenas de razonamiento: permite estudiar cómo la compresión a nivel L4 afecta a la precisión en tareas de razonamiento matemático, comparando con los niveles L1 a L5 de la misma familia.
- Evaluación de diseños de recompensa en RL: este adaptador es específicamente una ablación entrenada con una recompensa distinta (`correctness_sq`) frente al modelo principal del mismo nivel, lo que permite aislar el efecto del diseño de recompensa en el rendimiento final.
- Reproducibilidad científica: publicado con el objetivo explícito de que otros investigadores puedan rerun la comparación de recompensas sin tener que confiar en las conclusiones del paper.
- Benchmarking de modelos de razonamiento comprimido: se puede evaluar en GSM8K u otros datasets de razonamiento matemático con greedy decoding para medir el coste en precisión de la compresión.
- Estudio de eficiencia de tokens en razonamiento: útil para cuantificar el ahorro de tokens (y por tanto de coste de inferencia) frente a cadenas de pensamiento completas.
- Educación y experimentación en RLHF/GRPO: sirve como ejemplo práctico de entrenamiento con GRPO, loss tipo `dapo` y recompensas compuestas, con configuración completa documentada.

## Benchmarks y rendimiento

El autor declara el siguiente resultado en la model card, sin verificación independiente:

| Benchmark | Dataset | Split | Metrica | Resultado |
|---|---|---|---|---|
| Razonamiento matematico | GSM8K | test (n=1317) | Accuracy (exact match) | 67,7% |

Condiciones de evaluación: greedy decoding, single-turn, sin ejemplos (no exemplars), sin self-consistency. El autor indica que el intervalo de confianza al 95% tiene una semianchura de aproximadamente 2,7 puntos porcentuales para n=1317, por lo que diferencias de un par de puntos están dentro del ruido.

No se han publicado resultados para otros benchmarks (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- Entrenamiento: 1x NVIDIA A100 80GB (configuración documentada en la model card).
- Inferencia: requiere cargar el modelo base Olmo-3-7B-Think en bfloat16 (aproximadamente 14-16 GB de VRAM) más el adaptador LoRA, y además el modelo SFT de nivel L4 para fusionar previamente.
- GPU recomendadas: A100 80GB para entrenamiento; para inferencia, una RTX 4090 (24 GB) o similar es suficiente para el modelo base en bf16.
- El adaptador se usa con transformers + PEFT (`PeftModel`); no se publican versiones GGUF del adaptador, aunque el modelo base tiene versiones GGUF de unsloth para despliegue con llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | GSM8K | Notas |
|---|---|---|---|
| cot-dialect-olmo3-7b-think-grpo-reward-diff-l4 (este) | LoRA sobre Olmo-3-7B-Think | 67,7% | Ablación con recompensa `correctness_sq` |
| cot-dialect-olmo3-7b-think-grpo-l4 | LoRA sobre Olmo-3-7B-Think | No disponible | Modelo principal del mismo nivel L4 |
| cot-dialect-olmo3-7b-think-sft-l4 | LoRA SFT sobre Olmo-3-7B-Think | No disponible | Necesario como paso previo antes de este adaptador |
| allenai/Olmo-3-7B-Think | Modelo base 7B | No disponible | Sin compresion de cadena de pensamiento |

No se dispone de resultados de benchmarks para los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas matemáticos de palabra (GSM8K); no hay evidencia de rendimiento en otras tareas.
- La precisión cae con la dificultad del problema, y esa caída es más pronunciada en los niveles comprimidos como L4.
- Artefacto de ablación: el autor advierte que puede ser peor que el modelo principal del mismo nivel, ya que fue entrenado para responder a una pregunta concreta sobre diseño de recompensas.
- Requiere cargar primero el modelo SFT de nivel L4 y fusionarlo; cargarlo directamente sobre el modelo base no reproduce el resultado publicado.
- Entrenado con una única semilla; diferencias de un par de puntos porcentuales están dentro del ruido estadístico.
- Solo soporta inglés.
- Los benchmarks declarados no han sido verificados de forma independiente.
- Riesgo de alucinación inherente a modelos de razonamiento comprimido: la abreviación extrema de la cadena de pensamiento puede ocultar errores intermedios difíciles de depurar.
- Sin soporte documentado para uso en producción; es un artefacto de investigación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-reward-diff-l4
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Modelo principal del mismo nivel: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-l4
- Modelo SFT de nivel L4 (paso previo obligatorio): https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l4
- Version GGUF del modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Think-GGUF
- Ficha en LM Studio: https://lmstudio.ai/models/allenai/olmo-3-7b-think
- Ficha en ModelScope (variante DPO): https://www.modelscope.cn/models/allenai/Olmo-3-7B-Think-DPO/summary
- Ficha en ThinkLLM: https://thinkllm.dev/models/olmo-3-7b-think
