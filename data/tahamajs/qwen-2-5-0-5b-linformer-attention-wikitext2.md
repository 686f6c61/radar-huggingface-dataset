# tahamajs/qwen-2.5-0.5b-linformer-attention-wikitext2

## Resumen

`qwen-2.5-0.5b-linformer-attention-wikitext2` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps "Attention Surgery Zoo". No es un modelo entrenado desde cero, sino un Qwen/Qwen2.5-0.5B sometido a una cirugía de atención: 18 de sus 24 bloques de atención (75%) se sustituyen por el operador `LinformerAttention` de complejidad lineal, mientras que 6 capas ancla conservan la atención GQA softmax original de Qwen2. Posteriormente se aplica una destilación de conocimiento en dos etapas sobre WikiText-2.

El interés del modelo es fundamentalmente de investigación: sirve como banco de pruebas reproducible para evaluar el coste real (en perplejidad) de reemplazar atención cuadrática por atención lineal en un transformer causal pequeño. El autor reporta una perplejidad post-destilación de 900,43 en WikiText-2 frente a 15,38 del profesor original, lo que cuantifica la degradación tras la sustitución.

El modelo tiene 486.998.656 parámetros reales según safetensors, arquitectura Qwen2 con 24 capas, dimensión oculta 896, 14 cabezas de consulta y 2 de clave/valor, y se distribuye en FP16 (928,94 MB) junto con un adaptador. La licencia es MIT. No está pensado para uso en producción: es un artefacto de ablation.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder Qwen2 con atención híbrida: 18/24 capas con `LinformerAttention` (lineal) y 6/24 con GQA softmax nativa (índices 3, 7, 11, 15, 19, 23) |
| Parametros totales | 486.998.656 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado/evaluado a longitud de secuencia 512) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16) |
| Idiomas soportados | inglés (etiqueta `en` en la model card); resto no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint FP16 completo de 928,94 MB más adaptador) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B: 24 bloques decoder, D=896, 14 cabezas de consulta, 2 cabezas KV (GQA), dimensión por cabeza 64 y RoPE con theta 1.000.000. La cirugía `hybrid_3_1` reemplaza la atención en los índices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] por `LinformerAttention` envuelta en un `QwenAttentionAdapter`, que gestiona GQA (expansión de 2 a 14 cabezas KV) y RoPE. Las capas [3, 7, 11, 15, 19, 23] mantienen la atención softmax original como anclas de enrutamiento contextual global. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con una única `o_proj` sin duplicación. El operador soporta enmascaramiento causal y despacho de kernels en tres niveles (CUDA / Triton / PyTorch).

El entrenamiento consiste en una destilación de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), ejecutada en una RTX 3090 de 24 GB con caché offline de representaciones del profesor (0 MB de VRAM del profesor en GPU). La etapa 1 (30% del presupuesto, 101 pasos) congela embeddings, MLP y `lm_head` y entrena solo módulos de atención y layer norms con AdamW (lr=2.0e-4, weight decay 0.01, clipping 1.0), pesos maestros FP32 y AMP FP16, minimizando MSE por capa más 0,25·(1 − coseno) entre estados ocultos. La etapa 2 es una destilación end-to-end de representaciones (70% del presupuesto); el detalle de sus hiperparámetros queda truncado en la información disponible.

## Capacidades

- Generación de texto causal autorregresiva en inglés, heredada del profesor Qwen2.5-0.5B.
- Atención lineal subcuadrática en el 75% de las capas, con soporte causal y GQA mediante adaptador.
- Conversación multi-turno básica (etiquetas `text-generation` y `conversational` en el repo).
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta modo thinking, visión, audio ni capacidades multimodales.
- Capacidad multilingüe: la model card solo declara inglés; el resto no disponible.
- Su valor práctico principal es como referencia de ablation para comparar atención lineal frente a softmax en modelos pequeños.

## Casos de uso

- Investigación en eficiencia de atención: comparar la perplejidad de este checkpoint (900,43) con el profesor (15,38) para medir el coste de sustituir atención softmax por Linformer en un decoder de 0,5B.
- Reproducción de experimentos de cirugía de atención: el pipeline NeuralOps y la topología `hybrid_3_1` documentada permiten replicar la sustitución capa a capa y estudiar qué capas toleran peor el cambio.
- Estudio de destilación de representaciones: las dos etapas (alineación de subespacio con backbone congelado y destilación end-to-end) sirven de plantilla para recuperar modelos dañados por modificaciones arquitectónicas.
- Benchmark de operadores lineales: útil para validar implementaciones de `LinformerAttention` con GQA y RoPE en entornos CUDA/Triton frente a la atención nativa de Qwen2.
- Docencia y divulgación: ejemplo compacto (menos de 500M parámetros, 1,1 GB de repo) para ilustrar el compromiso entre complejidad lineal y calidad de modelado del lenguaje.
- Pruebas de infraestructura de inferencia: al ser un Qwen2 estándar en formato safetensors, puede cargarse con frameworks compatibles para validar pipelines de despliegue, aunque no se recomienda para tráfico real.

## Benchmarks y rendimiento

Datos declarados por el autor en la model-index y la model card, medidos en el split de validación de WikiText-2 a longitud de secuencia 512 (batch_size=8, grad_accum=4) en una RTX 3090 de 24 GB. No verificados de forma independiente.

| Metrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (Qwen2.5-0.5B) | 15,38 | Referencia GQA softmax causal exacta |
| Perplejidad del estudiante pre-destilación | 351.472,92 | Tras el transplante de 18/24 capas |
| Perplejidad del estudiante post-destilación | 900,43 | Tras destilación en dos etapas |
| Delta absoluto de perplejidad | −350.572,49 | Mejora lograda por la destilación |
| Reducción relativa de perplejidad | 99,74% | Recuperación desde el pico post-cirugía |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1 GB para los pesos (928,94 MB) más overhead de activaciones y caché KV; cómodo en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: RTX 3090 (la usada por el autor para destilación), RTX 4090, A100 o H100; cualquier GPU con soporte CUDA es suficiente dado el tamaño.
- Cabe en GPU consumer: sí, en GTX 1660, RTX 3060, RTX 4060 y superiores; también en CPU para pruebas.
- Opciones de despliegue: al ser un checkpoint Qwen2 en safetensors, es compatible con frameworks que acepten la arquitectura Qwen2 (transformers, vLLM, TGI); requiere la librería `neuralops` para las capas `LinformerAttention` personalizadas, por lo que el soporte en herramientas estándar no está garantizado sin el adaptador. llama.cpp u Ollama requerirían conversión a GGUF, no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen2.5-0.5B + Linformer, destilado) | 487M | no disponible (evaluado a 512) | 900,43 | MIT | Hugging Face |
| Qwen/Qwen2.5-0.5B (profesor) | 494M | 32.768 tokens (según ficha oficial de Qwen) | 15,38 (medido por el autor) | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B | 1,5B | 32.768 tokens | no disponible en esta información | Apache 2.0 | Hugging Face |

La comparación relevante es con el profesor: misma arquitectura base, misma licencia permisiva y un orden de magnitud de diferencia en perplejidad. Frente a modelos lineales nativos (por ejemplo, variantes Linformer o Mamba de tamaño similar) no hay datos en la información disponible para comparar.

## Limitaciones y advertencias

- Degradación severa de calidad: perplejidad de 900,43 frente a 15,38 del profesor, es decir, unas 58 veces peor; no es apto para generación de texto en producción.
- Solo se ha evaluado en WikiText-2 en inglés a longitud 512; el comportamiento en otros dominios, idiomas o contextos más largos es desconocido.
- Riesgo elevado de alucinación y texto incoherente derivado de la mala perplejidad.
- La model card declara únicamente inglés; no hay evidencia de capacidades multilingües.
- Dependencia de la librería `neuralops` y del adaptador `QwenAttentionAdapter` para cargar las capas lineales; la portabilidad a stacks estándar no está garantizada.
- Licencia MIT para los pesos, pero conviene revisar la licencia del modelo base (Qwen2.5-0.5B, Apache 2.0) y la del repositorio NeuralOps antes de cualquier uso derivado.
- Los benchmarks son declarados por el autor y no están verificados (`verified: false`); no hay evaluación independiente.
- Modelo de investigación: no debe usarse como base para aplicaciones comerciales sin una reevaluación exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-linformer-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de LinformerAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/linear/linformer_attention.py
- Licencia del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
