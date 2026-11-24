# tahamajs/qwen-2.5-0.5b-halo-regla-wikitext2

## Resumen

`qwen-2.5-0.5b-halo-regla-wikitext2` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps Attention Surgery Zoo. Se trata de una cirugía de atención sobre el modelo base `Qwen/Qwen2.5-0.5B`: 18 de sus 24 bloques de atención (un 75%, siguiendo un patrón híbrido 3:1) han sido sustituidos por el operador `HALOReGLAAttention` (clave de registro `halo_regla`), que combina atención softmax densa con atención lineal rectificada mediante una compuerta aprendida por cabeza. Los 6 bloques restantes conservan la atención GQA original de Qwen2 como anclas de enrutamiento global.

El objetivo declarado es evaluar si es posible sustituir atención cuadrática por atención subcuadrática en un modelo causal compacto de 0,5B parámetros sin destruir la capacidad de modelado del lenguaje. Tras la transplantación se aplicó un protocolo de destilación de conocimiento en dos etapas sobre WikiText-2, con el objetivo de recuperar la perplejidad del profesor. El resultado empírico es contundente: la perplejidad del estudiante tras la destilación es de 469.420,98 frente a los 15,38 del profesor, con una reducción relativa del 0,00% respecto al estado cero-shot post-cirugía. Es decir, la destilación no recuperó nada y el modelo no es funcional como generador de texto.

Por tanto, esta ficha describe una pieza de investigación negativa o de telemetría de un pipeline de cirugía de atención, no un modelo listo para producción. Es relevante para quienes trabajen en atención lineal, híbridos softmax/lineal o destilación de representaciones, precisamente porque documenta un fallo de recuperación con métricas explícitas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder Qwen2 con cirugía de atención híbrida: 18/24 capas con `HALOReGLAAttention` (softmax densa + atención lineal rectificada con compuerta por cabeza) y 6/24 capas con GQA softmax nativa |
| Parámetros totales | 494M (modelo base Qwen2.5-0.5B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible explícitamente; RoPE con theta = 1.000.000 heredado del base |
| Tipos de cuantización | no disponible (pesos publicados en FP16 completo, 1021,81 MB, más un adaptador) |
| Idiomas soportados | inglés (según metadatos de la model card); resto no disponible |
| Licencia | MIT |
| Formato de pesos | FP16 completo (safetensors según tamaño de repo de 1,6 GB) más adaptador; librería `neuralops` |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B` (24 capas, dimensión oculta D=896, 14 cabezas de consulta, 2 cabezas KV, dimensión por cabeza 64). La cirugía sustituye la atención en los índices de capa [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] por `HALOReGLAAttention`, envuelto en un `QwenAttentionAdapter`. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` preentrenados del profesor, con expansión de cabezas KV de 2 a 14 y una única proyección de salida sin duplicación. Las capas [3, 7, 11, 15, 19, 23] mantienen la GQA softmax original como anclas de recuperación global.

El operador `halo_regla` fusiona dos flujos paralelos mediante una compuerta aprendida por cabeza: atención softmax densa con soporte causal, padding y KV-cache, y atención lineal con rectificación ELU+1 de complejidad O(N) en prefill y O(1) en decodificación. La caché resultante es una tupla `(K_dense, V_dense, linear_state)` donde `linear_state` es `(S_mat, Z_vec)`. El despacho de kernels es de tres niveles: CUDA, Triton y PyTorch.

El entrenamiento consistió en destilación de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), ejecutada en una RTX 3090 de 24 GB con caché offline de representaciones del profesor (0 MB de VRAM del profesor en GPU). La etapa 1 (30% del presupuesto, 105 pasos) congeló embeddings, MLPs y `lm_head`, entrenando solo módulos de atención y layer norms con AdamW (lr=2.0e-4, weight decay 0.01, clipping 1.0), AMP FP16 con `GradScaler` y pesos maestros FP32, minimizando MSE por capa más 0,25·(1 − coseno). La etapa 2 (70% del presupuesto) realizó destilación end-to-end de representaciones. El resultado documentado es que la perplejidad no mejoró en absoluto respecto al estado cero-shot.

## Capacidades

- Generación de texto causal autoregresiva: soportada a nivel arquitectónico, pero sin calidad funcional según la perplejidad medida.
- Soporte de atención causal con GQA y RoPE: sí, gestionado por el adaptador.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado en metadatos.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.
- Valor principal: servir como artefacto de telemetría para estudiar el fallo de recuperación tras cirugía de atención y destilación.

## Casos de uso

- Investigación en atención subcuadrática: usar el checkpoint como caso de estudio de qué ocurre al sustituir el 75% de las capas de atención softmax por un híbrido lineal en un modelo de 0,5B, comparando la perplejidad pre- y post-destilación.
- Reproducción de pipelines de cirugía de atención: el repositorio NeuralOps y este checkpoint permiten replicar el flujo `attention_surgery` + destilación en dos etapas sobre otros modelos base.
- Validación de protocolos de destilación de representaciones: sirve para contrastar la eficacia de la pérdida MSE + coseno frente a alternativas, dado que aquí la recuperación fue nula.
- Benchmark de operadores híbridos: comparar `halo_regla` con otras variantes del Attention Zoo en términos de sobrecoste de implementación y estabilidad numérica.
- Docencia y divulgación: ejemplo tangible de que una cirugía arquitectónica agresiva sin un presupuesto de destilación adecuado colapsa el modelado del lenguaje.
- Auditoría de artefactos publicados: usar la telemetría (PPL profesor 15,38 vs. estudiante 469.420,98) para establecer criterios de aceptación antes de desplegar checkpoints experimentales.

No se recomienda su uso en atención al cliente, generación de código en producción, resumen documental ni ninguna tarea generativa real, dada la perplejidad medida.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente), medidos sobre WikiText-2 `wikitext-2-raw-v1`, split de validación, longitud de secuencia 512, batch 8, grad accum 4, en RTX 3090 de 24 GB:

| Métrica | Valor |
|---|---|
| Perplejidad del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 |
| Perplejidad del estudiante cero-shot tras cirugía | 469.420,98 |
| Perplejidad del estudiante tras destilación (2 etapas) | 469.420,98 |
| Delta absoluto de perplejidad | +0,00 |
| Reducción relativa de perplejidad | 0,00% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1 GB de pesos (1021,81 MB) más caché KV y overhead del runtime; en la práctica, 2-3 GB según longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; el autor validó el pipeline de destilación en una RTX 3090 de 24 GB.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y equivalentes.
- Opciones de despliegue: la librería `neuralops` es el runtime previsto; no hay confirmación de soporte en vLLM, llama.cpp, Ollama ni TGI, dado que el operador `halo_regla` requiere kernels propios (CUDA/Triton/PyTorch).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-halo-regla-wikitext2` | 494M | no disponible | 469.420,98 (post-KD) | MIT | Hugging Face, runtime `neuralops` |
| `Qwen/Qwen2.5-0.5B` (profesor) | 494M | 32.768 tokens (según especificación de Qwen2.5) | 15,38 (medido por el autor) | Apache 2.0 | Hugging Face, amplio soporte (vLLM, llama.cpp, TGI, Ollama) |
| `Qwen/Qwen2.5-0.5B-Instruct` | 494M | 32.768 tokens | no disponible | Apache 2.0 | Hugging Face, amplio soporte |

La comparación relevante es contra el propio profesor: la cirugía multiplica la perplejidad por más de 30.000 y la destilación no la reduce. Frente al base original, este checkpoint no ofrece ninguna ventaja medible en la información disponible.

## Limitaciones y advertencias

- Perplejidad de 469.420,98 frente a 15,38 del profesor: el modelo no es funcional para generación de texto.
- La destilación en dos etapas no produjo ninguna mejora (delta 0,00, reducción 0,00%): el protocolo documentado falló en este caso.
- Sesgos conocidos: no disponibles; al no generar texto coherente, no se han caracterizado.
- Riesgo de alucinación: extremo, derivado de una distribución de probabilidad prácticamente degenerada.
- Limitaciones de idioma: solo inglés declarado en metadatos; sin evaluación multilingüe.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo no es apto para producción por su calidad.
- Dependencia del runtime `neuralops`: requiere kernels propios (CUDA/Triton/PyTorch) y no es portable a stacks estándar sin trabajo adicional.
- Los resultados son declarados por el autor y no verificados de forma independiente (`verified: false` en el model-index).
- El checkpoint incluye pesos FP16 completos más un adaptador; conviene revisar qué artefacto cargar y con qué script.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-halo-regla-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador `halo_regla`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/hybrid/halo_regla.py
- Licencia del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
