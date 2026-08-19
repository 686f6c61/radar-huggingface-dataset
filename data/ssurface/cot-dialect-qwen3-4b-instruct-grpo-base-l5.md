# ssurface/cot-dialect-qwen3-4b-instruct-grpo-base-l5

## Resumen

`cot-dialect-qwen3-4b-instruct-grpo-base-l5` es un adaptador LoRA publicado por `ssurface` que modifica el comportamiento del modelo base `Qwen/Qwen3-4B-Instruct-2507` para que genere cadenas de razonamiento (chain-of-thought) extremadamente comprimidas, en el llamado "nivel L5" de un esquema de compresión de razonamiento. En este nivel, la cadena de pensamiento se reduce a una única expresión colapsada, con una mediana de 16 caracteres dentro de la etiqueta `thinking` (frente a los 532 caracteres del nivel L1, un rango de 33x).

El adaptador se entrena mediante GRPO (Group Relative Policy Optimization) sobre el dataset GSM8K, utilizando un esquema de recompensa que combina corrección de la respuesta con formato estricto de salida. Es una **ablación** explícitamente diseñada para comparar el diseño de recompensas dentro del paper "Chain-of-Thought Compression Dialects"; el modelo principal de este nivel es `ssurface/cot-dialect-qwen3-4b-instruct-grpo-l5`, del cual este adaptador es una variante con recompensa `base`. Publicado bajo licencia Apache-2.0, el adaptador pesa 0.1 GB y está pensado para apilarse sobre un SFT previo del mismo autor (`ssurface/cot-dialect-qwen3-4b-instruct-sft-l5`), no directamente sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B-Instruct-2507) + adaptador LoRA (r=16, alpha=32) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 4B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32 768 tokens (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en bfloat16; el modelo base soporta cuantizaciones estándar) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen3-4B-Instruct-2507`, un transformer denso de 4B parámetros con atención de ventana completa (sdpa). El entrenamiento se realiza en dos etapas: primero un SFT (supervised fine-tuning) sobre el dataset GSM8K train re-expresado a nivel L5 por un modelo teacher (6993 ejemplos, cadenas de mediana 16 caracteres), y posteriormente un refinamiento con GRPO usando el loss tipo `dapo` (Double-Abstention Policy Optimization). La recompensa combina `correctness` (que pondera según el número de pasos de la solución de oro, dando más peso a problemas difíciles) y `format` (exige una salida con un bloque `thinking`, un bloque `response` y una respuesta final `#### <answer>`). Se usan 8 generaciones por prompt, batch efectivo de 32, máximo 256 tokens de completación, learning rate 1e-05 y coeficiente KL de 0.0. El entrenamiento se realizó en una NVIDIA A100 80GB. Un detalle técnico relevante: el autor verificó que la matriz `lora_B` no fuera cero en todos los adaptadores publicados, ya que el uso de kernels fusionados producía adaptadores matemáticamente inertes.

## Capacidades

- Razonamiento matemático con cadenas de pensamiento extremadamente comprimidas (nivel L5, una única expresión colapsada).
- Generación de texto en inglés siguiendo el formato de instrucción del modelo base Qwen3.
- Capacidad de razonamiento multi-step limitada: la compresión L5 fuerza a resolver problemas en una sola expresión, lo que reduce la robustez en problemas complejos.
- No soporta tool calling, ni funciones de agente, ni visión, ni audio.
- Capacidad multilingüe limitada: el adaptador se entrena solo con datos en inglés; el modelo base sí es multilingüe, pero el adaptador puede degradar el rendimiento en otros idiomas.

## Casos de uso

- Investigación sobre compresión de razonamiento: este adaptador es una herramienta de ablación para estudiar el efecto del diseño de recompensas en la calidad del razonamiento comprimido. Permite reproducir los resultados del paper y comparar con la variante `grpo-l5`.
- Razonamiento matemático de baja latencia: al reducir la cadena de pensamiento a 16 caracteres, la inferencia es mucho más rápida que con cadenas largas, útil en entornos con restricciones de latencia estrictas.
- Evaluación de robustez en problemas aritméticos: sirve para medir cómo degrada la precisión la compresión extrema del razonamiento, comparando con niveles L1-L4.
- Benchmark de generación de respuestas concisas: puede usarse como caso extremo en estudios sobre el equilibrio entre precisión y verbosidad en modelos de lenguaje.
- Entrenamiento de modelos estudiantes: el adaptador puede servir como teacher para destilar cadenas de razonamiento ultra-cortas en modelos más pequeños.
- Validación de pipelines PEFT: al ser un adaptador LoRA que requiere apilarse sobre un SFT previo, es útil para probar flujos de `merge_and_unload` y carga secuencial de adaptadores.

## Benchmarks y rendimiento

Según la model card del autor, los resultados declarados son:

| Tarea | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| Mathematical Reasoning | GSM8K (openai/gsm8k) | test | Accuracy (exact match) | 76.4% |

Condiciones de evaluación: n=1317, decoding greedy, single-turn, sin ejemplos y sin self-consistency. El autor indica que la precisión cae con la dificultad del problema, especialmente en los niveles comprimidos. La incertidumbre estadística (95% half-width) es de aproximadamente 2.7 puntos porcentuales para n=1317.

## Requisitos de hardware

- Inferencia: requiere cargar el modelo base Qwen3-4B-Instruct-2507 (4B parámetros) más el adaptador LoRA (0.1 GB). En bfloat16, el modelo base ocupa unos 8 GB de VRAM; con cuantización 4-bit, cabe en GPUs consumer de 8 GB (RTX 3060, RTX 4060, etc.).
- GPUs recomendadas para inferencia: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4070, A10, L4). Para entrenamiento, el autor usó una NVIDIA A100 80GB.
- Despliegue: se puede servir con `transformers` + `peft` (carga secuencial del SFT y luego el adaptador GRPO), o exportar a GGUF/llama.cpp si se fusiona el adaptador con el modelo base.
- Latencia: al generar cadenas de razonamiento de 16 caracteres de mediana, la latencia por petición es significativamente menor que con el modelo base sin compresión, aunque no se proporcionan cifras exactas.

## Comparativa con modelos similares

No se dispone de datos públicos de benchmarks comparativos entre este adaptador y otros modelos de la misma categoría. Se puede comparar de forma cualitativa:

| Modelo | Tipo | Contexto | GSM8K | Licencia |
|---|---|---|---|---|
| `cot-dialect-qwen3-4b-instruct-grpo-base-l5` (este) | LoRA sobre Qwen3-4B | 32K | 76.4% | Apache-2.0 |
| `cot-dialect-qwen3-4b-instruct-grpo-l5` (modelo principal del mismo nivel) | LoRA sobre Qwen3-4B | 32K | no disponible | Apache-2.0 |
| `Qwen/Qwen3-4B-Instruct-2507` (base sin adaptador) | Modelo completo | 32K | no disponible (el modelo base reporta ~77% en GSM8K según documentación de Qwen3, dato no verificado en esta ficha) | Apache-2.0 |

El autor advierte que este adaptador es una ablación y puede ser peor que el modelo principal del mismo nivel.

## Limitaciones y advertencias

- Es una ablación de investigación, no un modelo de producción; puede tener peor rendimiento que la variante principal `grpo-l5`.
- Entrenado y evaluado únicamente en problemas matemáticos de GSM8K; no generaliza a otros dominios.
- La compresión L5 reduce drásticamente la capacidad de razonamiento multi-step; la precisión cae rápidamente con la dificultad del problema.
- Requiere apilarse sobre el adaptador SFT `ssurface/cot-dialect-qwen3-4b-instruct-sft-l5`; cargarlo directamente sobre el modelo base no reproduce los resultados publicados.
- Solo soporta inglés; el rendimiento en otros idiomas puede degradarse.
- Riesgo de alucinación en problemas no vistos o con formato inusual, especialmente al forzar respuestas ultra-cortas.
- El entrenamiento usó una única semilla; diferencias de pocos puntos porcentuales pueden deberse al azar.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 también es Apache-2.0, sin restricciones adicionales.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-base-l5
- Adaptador SFT previo (requerido): https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-sft-l5
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio de Qwen3: https://github.com/QwenLM/Qwen3
- Paper citado: "Chain-of-Thought Compression Dialects" (Frolov, Anatolii, 2026) — sin enlace directo disponible.
