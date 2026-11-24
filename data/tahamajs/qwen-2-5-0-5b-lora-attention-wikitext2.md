# tahamajs/qwen-2.5-0.5b-lora-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-lora-attention-wikitext2` es un checkpoint experimental de Qwen2.5-0.5B publicado por el desarrollador independiente tahamajs dentro del proyecto NeuralOps Attention Surgery Zoo. El modelo parte de `Qwen/Qwen2.5-0.5B` y sustituye 18 de las 24 capas de atención del decoder (un 75%, con patrón híbrido 3:1) por el operador `LoRAAttention` de la librería NeuralOps, preservando las 6 capas restantes con la atención GQA original de Qwen2 como anclas de recuperación contextual. Tras la cirugía se aplica una destilación de conocimiento en dos etapas sobre WikiText-2 para recuperar capacidad de modelado del lenguaje.

El interés del modelo no es su rendimiento absoluto, sino su valor como artefacto de investigación reproducible: documenta con telemetría detallada el coste de una cirugía de atención (la perplejidad pasa de 15,38 a 126.790,99 tras el trasplante y se recupera hasta 207,14 tras la destilación) y demuestra un protocolo de destilación con caché offline de representaciones que no requiere mantener el profesor en VRAM de GPU. Es un banco de pruebas para estudiar atención subcuadrática y LoRA en modelos causales compactos, no un modelo listo para producción.

El modelo tiene 535.364.224 parámetros reales (frente a los 494M del base), arquitectura transformer decoder-only Qwen2 con GQA y RoPE, y se distribuye en safetensors FP16 con un adaptador asociado. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (Qwen2) con cirugía de atención híbrida 3:1: 18/24 capas con `LoRAAttention` (NeuralOps, familia `svd`) y 6/24 capas con GQA softmax nativa |
| Parametros totales | 535.364.224 (safetensors); el base Qwen2.5-0.5B declara 494M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el base Qwen2.5-0.5B soporta contexto nativo de 32.768 tokens, pero el checkpoint no lo declara) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en FP16 completo, 1021,18 MB, más adaptador) |
| Idiomas soportados | ingles (declarado en la model card); el resto no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo + adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un Qwen2 decoder-only de 24 capas con dimensión oculta D=896, 14 cabezas de consulta y 2 cabezas KV (GQA), dimensión por cabeza de 64 y RoPE con theta=1.000.000. La innovación es la "cirugía de atención": las capas en los índices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] se sustituyen por `LoRAAttention` envuelto en `QwenAttentionAdapter`, mientras que las capas [3, 7, 11, 15, 19, 23] conservan la atención GQA softmax preentrenada como anclas de enrutamiento global. Cada capa trasplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 y sin proyecciones de salida duplicadas. Conviene subrayar que `LoRAAttention` es, según la propia model card, un wrapper PEFT con `compression_rate` ≈ 1.0 y `num_compressed_layers` = 0: no comprime, sino que añade un residual LoRA entrenable sobre pesos de atención congelados.

El entrenamiento consiste en una destilación de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), ejecutada en una RTX 3090 de 24 GB con caché offline de representaciones del profesor (0 MB de VRAM de profesor en GPU). La etapa 1 (30% del presupuesto, 115 pasos) congela embeddings, MLP y `lm_head` y entrena solo módulos de atención y layernorms con AdamW (lr=2.0e-4, weight decay 0.01, grad clipping 1.0), pesos maestros FP32 con AMP FP16 y pérdida MSE + 0.25·(1 − cos). La etapa 2 (70%, 263 pasos) hace destilación end-to-end de representaciones con pérdida MSE + 0.50·(1 − cos). El despacho de kernels es de tres niveles: CUDA, Triton y PyTorch.

## Capacidades

- Generación de texto causal autorregresiva en inglés, heredada del base Qwen2.5-0.5B.
- Modelado de lenguaje y cálculo de perplejidad sobre corpus tipo WikiText-2.
- Soporte de atención GQA y RoPE en las capas nativas conservadas.
- Ejecución con despacho de kernels CUDA, Triton o PyTorch según hardware.
- Capacidad de servir como sujeto de experimentos de destilación de representaciones y cirugía de atención.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito para este checkpoint.
- Capacidades multilingües: no disponibles más allá del inglés declarado.

## Casos de uso

- Investigación en atención subcuadrática: el checkpoint permite reproducir el experimento de sustituir atención softmax por operadores alternativos y medir el impacto en perplejidad (15,38 → 126.790,99 → 207,14) con una configuración de hardware modesta.
- Estudio de destilación de representaciones: sirve como caso de referencia para validar protocolos de caché offline de representaciones del profesor, eliminando la necesidad de mantener el modelo profesor en VRAM.
- Banco de pruebas de LoRA en atención: al ser un wrapper PEFT sobre pesos congelados, permite experimentar con rangos y objetivos LoRA en un transformer pequeño y rápido de entrenar.
- Desarrollo de la librería NeuralOps: útil como artefacto de integración para probar el registro `ATTENTION_REGISTRY`, el adaptador `QwenAttentionAdapter` y el despacho de kernels CUDA/Triton/PyTorch.
- Evaluación comparativa de topologías híbridas: la proporción 3:1 (18 capas trasplantadas frente a 6 nativas) se puede contrastar con otras proporciones para estudiar el equilibrio entre eficiencia y recuperación de induction heads.
- Docencia y divulgación técnica: modelo pequeño (535M parámetros, 1,3 GB de repo) que cabe en una GPU de consumo y permite demostrar en clase conceptos de cirugía de atención y destilación sin infraestructura grande.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente), medidos sobre WikiText-2 `wikitext-2-raw-v1`, split de validación, longitud de secuencia 512, batch_size=8, grad_accum=4, en una NVIDIA GeForce RTX 3090 de 24 GB:

| Metrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 | Referencia GQA softmax causal exacta |
| Perplejidad del estudiante zero-shot tras cirugía (pre-KD) | 126.790,99 | Inmediatamente tras el trasplante de 18/24 capas |
| Perplejidad del estudiante destilado (post-KD) | 207,14 | Tras destilación de representaciones en 2 etapas |
| Delta absoluto de perplejidad | −126.583,85 | Cambio logrado por la destilación |
| Reducción relativa de perplejidad | 99,84% | Recuperación desde el pico post-cirugía |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 1,1 GB solo de pesos (1021,18 MB declarados) más caché KV y overhead del runtime; con contexto 512 y batch pequeño, cabe holgadamente en 4-6 GB.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16 con batch moderado; el autor entrenó y evaluó en una RTX 3090 de 24 GB.
- Cabe en GPU de consumo: sí, en RTX 3060/4060 (8-12 GB), RTX 4070, RTX 4090 y equivalentes; también en GPUs integradas o CPU para inferencia lenta.
- Opciones de despliegue: la librería declarada es `neuralops`, por lo que la ruta natural es el runtime de NeuralOps; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible, y el operador `LoRAAttention` personalizado probablemente requiera el código de NeuralOps para cargarse correctamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| `tahamajs/qwen-2.5-0.5b-lora-attention-wikitext2` | 535.364.224 | no disponible | 207,14 (post-KD, validación, seq 512) | MIT | Hugging Face, 343 descargas |
| `Qwen/Qwen2.5-0.5B` (profesor) | 494M | 32.768 tokens (nativo del base) | 15,38 (referencia del autor) | Apache 2.0 (del base, según su card) | Hugging Face, ampliamente adoptado |
| Modelos de 0,5B de la familia Qwen2.5 instruct | ~494M | 32.768 tokens | no disponible | Apache 2.0 | Hugging Face |

La comparación relevante es contra el propio profesor: el checkpoint destilado queda unas 13,5 veces por encima en perplejidad (207,14 frente a 15,38), lo que refleja el coste de la cirugía de atención y el margen de mejora del protocolo de destilación. Frente a otros modelos de 0,5B de propósito general, la diferencia principal no es de tamaño sino de naturaleza: este es un artefacto de investigación, no un modelo conversacional optimizado.

## Limitaciones y advertencias

- Perplejidad muy superior a la del base (207,14 frente a 15,38): la calidad de generación de texto es notablemente inferior y no es adecuada para producción conversacional.
- El operador `LoRAAttention` no comprime (`compression_rate` ≈ 1.0, `num_compressed_layers` = 0), por lo que el checkpoint no ofrece las ventajas de eficiencia que sugiere la etiqueta "subquadratic-attention"; es un wrapper PEFT, no un mecanismo de atención lineal real.
- Requiere la librería NeuralOps y código personalizado (`QwenAttentionAdapter`, `LoRAAttention`) para cargarse; la compatibilidad con runtimes estándar (transformers, vLLM, llama.cpp) no está confirmada.
- Solo se declara inglés; el comportamiento en otros idiomas no está evaluado.
- Riesgo de alucinación y degradación gramatical elevado dado el nivel de perplejidad; cualquier uso generativo debe validarse con muestreo y filtros.
- Los benchmarks son declarados por el autor y no verificados de forma independiente (`verified: false` en el model-index).
- Licencia MIT para el checkpoint, pero el modelo base Qwen2.5-0.5B tiene su propia licencia (Apache 2.0 según su card); conviene revisar ambas antes de uso comercial.
- Sin descargas ni likes significativos (343 descargas, 0 likes): no hay evidencia de uso en producción ni de validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-lora-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de `LoRAAttention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/lora_attention.py
- Licencia del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
