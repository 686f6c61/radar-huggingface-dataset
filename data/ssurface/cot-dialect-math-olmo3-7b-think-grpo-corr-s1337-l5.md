# ssurface/cot-dialect-math-olmo3-7b-think-grpo-corr-s1337-l5

## Resumen

El modelo `ssurface/cot-dialect-math-olmo3-7b-think-grpo-corr-s1337-l5` es un adaptador LoRA (PEFT) desarrollado por ssurface (Anatolii Frolov) que modifica el modelo base `allenai/Olmo-3-7B-Think` para resolver problemas matemáticos mediante un chain-of-thought (CoT) comprimido a un nivel extremo, denominado "L5" (una única expresión colapsada). Este adaptador forma parte de una investigación sobre "dialectos de compresión del razonamiento", donde se entrena al modelo para que exprese sus pasos de razonamiento de forma mucho más concisa que el CoT habitual, reduciendo así el número de tokens generados sin perder precisión en tareas matemáticas.

El adaptador se entrena en dos fases: primero un ajuste fino supervisado (SFT) sobre problemas de MATH re-expresados a nivel L5 por un modelo profesor, y posteriormente un refuerzo con GRPO (Group Relative Policy Optimization) utilizando una recompensa de corrección. El resultado reportado es un 63.8% de exactitud en el conjunto de test MATH-500, medido con un evaluador que normaliza formas equivalentes (por ejemplo, `\frac{14}{3}` y `14/3`). El adaptador tiene un tamaño de 0.2 GB y se distribuye bajo licencia Apache 2.0.

Su relevancia radica en explorar el equilibrio entre la compresión del razonamiento y la precisión, un área de interés para reducir costes de inferencia en modelos de lenguaje grandes. Al ser un adaptador ligero sobre un modelo de 7B, permite experimentar con técnicas de compresión de CoT sin necesidad de reentrenar el modelo completo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer causal `allenai/Olmo-3-7B-Think` (modelo base de 7B) |
| Parametros totales | No disponible (el adaptador usa r=16, alpha=32; el base tiene ~7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base no especifica en la información proporcionada) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; no se mencionan cuantizaciones) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se apila sobre `allenai/Olmo-3-7B-Think`, un modelo de razonamiento de 7B parámetros desarrollado por el Allen Institute for AI (AI2), que a su vez está entrenado con SFT, DPO y RLVR para producir cadenas de razonamiento. El adaptador LoRA se entrena en dos etapas:

1. **SFT**: se entrena sobre problemas de MATH re-expresados a nivel L5 (compresión extrema) por un modelo profesor. Este paso produce el adaptador `ssurface/cot-dialect-math-olmo3-7b-think-sft-unfiltered-l5`, que es un requisito previo para cargar el adaptador GRPO.
2. **GRPO**: se aplica optimización con `trl.GRPOTrainer` sobre el modelo SFT fusionado, con una recompensa de corrección que pondera según el número de pasos de la solución dorada. La pérdida utilizada es `dapo`, con 8 generaciones por prompt, batch de 32×2, máximo de 256 tokens de completación, learning rate 1e-5 y coeficiente KL beta 0.04. El entrenamiento se realizó en una única NVIDIA A100 80GB.

Una innovación técnica destacable es la verificación de que las matrices `lora_B` no sean cero tras el entrenamiento, ya que el uso de atención `sdpa` sin kernels fusionados produjo adaptadores inertes en experimentos anteriores. Además, el adaptador no funciona directamente sobre el modelo base; requiere primero cargar el adaptador SFT y fusionarlo, y luego cargar este adaptador GRPO.

## Capacidades

- Razonamiento matemático con chain-of-thought comprimido a una única expresión (nivel L5).
- Generación de texto en formato de respuesta a problemas matemáticos (con `\boxed{}` para la respuesta final).
- Soporte de tool calling: no.
- Soporte de agentes o multi-step reasoning: no, se limita a un turno de razonamiento matemático.
- Capacidades multilingües: solo inglés.
- Capacidades especiales: compresión de razonamiento (el modelo produce menos tokens que un CoT estándar).

## Casos de uso

- **Investigación en compresión de chain-of-thought**: el adaptador sirve para estudiar cómo la reducción de tokens de razonamiento afecta a la precisión en tareas matemáticas, permitiendo comparar niveles de compresión (L1, L3, L5) en un mismo modelo base.
- **Evaluación de técnicas de RL (GRPO)**: al ser un adaptador entrenado con GRPO y una recompensa específica, puede usarse como caso de estudio para analizar el impacto de la pérdida `dapo` y la recompensa de corrección en la calidad del razonamiento.
- **Generación de soluciones concisas a problemas matemáticos**: en entornos educativos o de tutoría, puede producir respuestas cortas y directas a problemas de nivel MATH, reduciendo el coste de inferencia frente a modelos que generan CoT extensos.
- **Benchmarking de modelos de razonamiento**: su resultado en MATH-500 (63.8%) puede servir como referencia para comparar otras técnicas de compresión o adaptadores similares.
- **Pruebas de robustez en entornos con limitación de tokens**: al generar menos tokens, es adecuado para escenarios donde la ventana de contexto o el presupuesto de generación es reducido, como en sistemas embebidos o APIs con coste por token.
- **Análisis de trade-offs entre precisión y longitud**: permite cuantificar cuánta exactitud se sacrifica al comprimir el razonamiento, información útil para diseñar sistemas que deban equilibrar calidad y eficiencia.

## Benchmarks y rendimiento

El autor declara el siguiente resultado en el model-index:

| Benchmark | Métrica | Resultado |
|---|---|---|
| MATH-500 (test) | Accuracy (exact match) | 63.8% |

Este resultado se obtuvo con decoding greedy, en un solo turno, sin ejemplos (no exemplars) y sin self-consistency. El evaluador utilizado es un grader específico del proyecto que normaliza formas equivalentes (por ejemplo, `\frac{14}{3}` y `14/3`). No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0.2 GB, pero requiere cargar el modelo base `allenai/Olmo-3-7B-Think` (7B parámetros) y el adaptador SFT previo.
- VRAM estimada para inferencia: el modelo base en bfloat16 requiere aproximadamente 14 GB de VRAM, más overhead de activaciones. Con cuantización a 4 bits (por ejemplo, mediante bitsandbytes) podría reducirse a unos 4-5 GB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: para bfloat16 sin cuantizar, una NVIDIA RTX 3090/4090 (24 GB) o una A100 (80 GB) son suficientes. Con cuantización, una GPU con 8 GB podría ser viable.
- Opciones de despliegue: al ser un adaptador PEFT, se integra con `transformers` y `peft`. No se mencionan conversiones a GGUF ni soporte en vLLM, Ollama o TGI. Para usar con llama.cpp sería necesario fusionar el adaptador con el base y exportar a GGUF, pero no hay instrucciones oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos o adaptadores en la información proporcionada. El modelo base `Olmo-3-7B-Think` tiene versiones GGUF publicadas por unsloth, pero no se reportan resultados de benchmarks comparables. Por tanto, la comparativa se limita a señalar que este adaptador es una modificación específica para compresión de CoT, sin equivalentes directos documentados.

## Limitaciones y advertencias

- Entrenado y evaluado únicamente en problemas matemáticos (MATH); no es adecuado para otras tareas de lenguaje general.
- La precisión cae con la dificultad del problema, especialmente en los niveles de compresión más extremos (L5).
- Requiere cargar primero el adaptador SFT (`cot-dialect-math-olmo3-7b-think-sft-unfiltered-l5`) y fusionarlo con el modelo base antes de aplicar este adaptador GRPO; cargarlo directamente sobre el base no reproduce el resultado reportado.
- El resultado de 63.8% tiene un margen de error de aproximadamente ±4.4 puntos porcentuales (95% de confianza) al evaluarse con n=500, por lo que diferencias de unos pocos puntos pueden deberse al ruido.
- No se han documentado sesgos específicos, pero al estar entrenado solo con datos en inglés, su uso en otros idiomas no es recomendable.
- Riesgo de alucinación en respuestas matemáticas, especialmente en problemas complejos donde el modelo puede generar soluciones plausibles pero incorrectas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `Olmo-3-7B-Think` tiene su propia licencia (probablemente Apache 2.0 también, aunque no se confirma en la información proporcionada).

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/ssurface/cot-dialect-math-olmo3-7b-think-grpo-corr-s1337-l5
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Adaptador SFT previo (requerido): https://huggingface.co/ssurface/cot-dialect-math-olmo3-7b-think-sft-unfiltered-l5
- Versión GGUF del base (unsloth): https://huggingface.co/unsloth/Olmo-3-7B-Think-GGUF
- Ficha del modelo base en Crafiq: https://crafiq.ai/models/language/ai2-olmo-3-7b-think
- Artículo sobre Olmo-3-7B-Think en LLM.co: https://llm.co/llms/olmo-3-7b-think
