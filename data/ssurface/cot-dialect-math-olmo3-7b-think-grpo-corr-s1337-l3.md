# ssurface/cot-dialect-math-olmo3-7b-think-grpo-corr-s1337-l3

## Resumen

El modelo `ssurface/cot-dialect-math-olmo3-7b-think-grpo-corr-s1337-l3` es un adaptador LoRA (PEFT) desarrollado por ssurface que se monta sobre el modelo base `allenai/Olmo-3-7B-Think` de Allen Institute for AI (AI2). Su propósito es especializar el razonamiento matemático mediante una cadena de pensamiento comprimida en un "dialecto" de nivel L3, donde cada línea contiene una única asignación simbólica. El adaptador se entrenó con GRPO (Group Relative Policy Optimization) sobre un modelo SFT previo, utilizando problemas de MATH reformulados a ese nivel de compresión.

Este modelo resuelve el problema de reducir la verbosidad de las cadenas de razonamiento sin perder precisión en tareas matemáticas. Es relevante porque demuestra que es posible comprimir el chain-of-thought manteniendo un rendimiento competitivo (68% en MATH-500) y porque forma parte de una línea de investigación sobre "dialectos de compresión" de razonamiento. El adaptador es ligero (0.2 GB) y se distribuye bajo licencia Apache 2.0, lo que facilita su integración en entornos de investigación y producción.

La arquitectura subyacente es la del modelo base Olmo-3-7B-Think, un transformer causal de 7B parámetros con entrenamiento orientado al razonamiento. El adaptador añade un módulo LoRA con r=16 y alpha=32, y requiere cargar primero el modelo SFT fusionado para reproducir los resultados publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (modelo base Olmo-3-7B-Think) + adaptador LoRA (r=16, alpha=32) |
| Parametros totales | No disponible (adaptador LoRA; modelo base ~7B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base tiene versiones GGUF de terceros) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `allenai/Olmo-3-7B-Think`, un modelo de lenguaje causal de 7B parámetros desarrollado por AI2, entrenado con SFT, DPO y RLVR para producir razonamiento explícito. El adaptador en sí no modifica la arquitectura base; añade matrices LoRA de bajo rango (r=16, alpha=32) que ajustan las capas de atención y feed-forward durante el entrenamiento.

El entrenamiento se realizó con `trl.GRPOTrainer` sobre un modelo SFT fusionado (no sobre el base directamente). El dataset de entrenamiento consistió en problemas de MATH reformulados a nivel L3 por un modelo teacher, manteniendo las reglas de notación de los dialectos GSM8K y usando respuestas en `\boxed{}`. El proceso usó GRPO con 8 generaciones por prompt, batch efectivo de 64 (32 x 2 acumulación), longitud máxima de completación de 256 tokens, learning rate de 1e-05 y coeficiente KL de 0.04. La recompensa se basó únicamente en la corrección de la respuesta, ponderada por el número de pasos de la solución dorada. El entrenamiento se ejecutó en una única NVIDIA A100 de 80 GB.

Un detalle técnico relevante: el autor verificó que los adaptadores entrenados con kernels fusionados producían matrices `lora_B` nulas (matemáticamente inertes), por lo que se usó atención `sdpa` estándar y se descartaron 13 adaptadores que fallaron la verificación.

## Capacidades

- Generación de texto con razonamiento matemático: el modelo produce cadenas de pensamiento comprimidas en un formato simbólico de nivel L3, donde cada línea contiene una asignación con nombre.
- Razonamiento matemático simbólico: entrenado específicamente en problemas de MATH, maneja expresiones algebraicas, fracciones y notación `\boxed{}`.
- Inferencia de una sola pasada: no requiere ejemplos previos (zero-shot) ni self-consistency para alcanzar el rendimiento reportado.
- Uso como adaptador PEFT: se puede cargar y fusionar con el modelo base para su despliegue con `transformers` y `peft`.
- No soporta tool calling, agentes, visión ni audio: es un modelo de texto puro centrado en razonamiento matemático.

## Casos de uso

- Evaluación de razonamiento matemático en investigación: útil para comparar estrategias de compresión de chain-of-thought frente a modelos sin comprimir, usando el prompt "Solve this using Level 3 (Symbolic)".
- Tutoría automatizada de matemáticas: puede generar soluciones paso a paso con notación simbólica compacta, adecuada para sistemas de aprendizaje que requieren respuestas concisas.
- Generación de soluciones para datasets de entrenamiento: el adaptador puede producir respuestas etiquetadas en formato L3 que sirvan para entrenar otros modelos o verificar pipelines de razonamiento.
- Benchmarking de adaptadores LoRA: sirve como referencia para estudiar el impacto de la compresión de razonamiento en la precisión, ya que el autor reporta métricas con un grader específico.
- Integración en pipelines de razonamiento simbólico: puede combinarse con el modelo SFT base para tareas que requieran resolver problemas matemáticos en entornos con restricciones de longitud de salida.
- Despliegue en entornos con recursos limitados: al ser un adaptador ligero, permite experimentar con el modelo base de 7B sin necesidad de reentrenar, aunque requiere al menos la VRAM del modelo base.

## Benchmarks y rendimiento

El autor declara el siguiente resultado en la model card, medido con un grader específico que normaliza formas equivalentes (p. ej., `\frac{14}{3}` == `14/3`). No se han publicado comparativas con otros modelos en la información disponible.

| Tarea | Dataset | Split | Métrica | Valor |
|---|---|---|---|---|
| Razonamiento matemático | MATH-500 (HuggingFaceH4/MATH-500) | test | Accuracy (exact match) | 68.0% |

Condiciones de evaluación: n=500, decoding greedy, single-turn, sin ejemplos, sin self-consistency. El autor advierte que la precisión cae con la dificultad del problema, especialmente en niveles de compresión altos.

## Requisitos de hardware

- El adaptador en sí ocupa 0.2 GB, pero requiere el modelo base `allenai/Olmo-3-7B-Think` (7B parámetros) para funcionar.
- Para inferencia en bf16, el modelo base necesita aproximadamente 14 GB de VRAM (7B × 2 bytes). Con cuantización a 4 bits (p. ej., bitsandbytes) puede caber en GPUs de 8 GB, pero no se han publicado configuraciones específicas.
- GPUs recomendadas: NVIDIA A100 80GB (usada en entrenamiento), RTX 4090 (24 GB), RTX 3090 (24 GB), o GPUs con al menos 16 GB para bf16 sin cuantizar.
- Opciones de despliegue: `transformers` + `peft` para carga del adaptador, `vLLM` o `TGI` si se fusiona el adaptador con el modelo base y se exporta a un formato estándar. También se puede usar `llama.cpp` con versiones GGUF del modelo base, pero el adaptador no está disponible en ese formato.
- Latencia y throughput: no se han publicado mediciones específicas. Como referencia, un modelo de 7B en una RTX 4090 suele generar entre 20 y 40 tokens por segundo con cuantización 4 bits, pero esto depende del hardware y la implementación.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros adaptadores o modelos en la información proporcionada. El modelo base `Olmo-3-7B-Think` se posiciona como una alternativa abierta a otros modelos de razonamiento de 7B como Llama-3.1-8B-Instruct o Qwen-2.5-7B-Instruct, pero no hay datos de rendimiento comparativo en esta ficha.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas matemáticos de estilo word problem; su rendimiento en otras tareas de razonamiento no está validado.
- La precisión disminuye notablemente con problemas de mayor dificultad, especialmente en niveles de compresión altos.
- El adaptador no funciona directamente sobre el modelo base `allenai/Olmo-3-7B-Think`; requiere cargar primero el modelo SFT fusionado (`ssurface/cot-dialect-math-olmo3-7b-think-sft-unfiltered-l3`) para reproducir los resultados publicados.
- El resultado de 68% se obtuvo con un grader propio que normaliza formatos; otros evaluadores pueden dar cifras diferentes.
- El entrenamiento usó una única semilla (a menos que el nombre del repo indique lo contrario), por lo que diferencias de unos pocos puntos porcentuales pueden deberse al azar (intervalo de confianza del 95% de ±4.4 pp para n=500).
- No se han evaluado sesgos específicos del modelo, pero al derivar del modelo base de AI2, puede heredar sesgos de los datos de preentrenamiento.
- Riesgo de alucinación en respuestas matemáticas si el problema no se ajusta al formato esperado; se recomienda verificación externa en entornos de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssurface/cot-dialect-math-olmo3-7b-think-grpo-corr-s1337-l3
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Página del modelo base en Crafiq (specs y benchmarks): https://crafiq.ai/models/language/ai2-olmo-3-7b-think
- Versión GGUF del modelo base (unsloth): https://huggingface.co/unsloth/Olmo-3-7B-Think-GGUF
- Artículo de referencia sobre Olmo-3-7B-Think: https://llm.co/llms/olmo-3-7b-think
