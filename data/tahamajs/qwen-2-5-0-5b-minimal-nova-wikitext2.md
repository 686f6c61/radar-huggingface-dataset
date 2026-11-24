# tahamajs/qwen-2.5-0.5b-minimal-nova-wikitext2

## Resumen
`qwen-2.5-0.5b-minimal-nova-wikitext2` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps Attention Surgery Zoo. Se trata de un Qwen2.5-0.5B (modelo base de Alibaba Qwen) al que se le han sustituido quirúrgicamente 18 de sus 24 bloques de atención por el operador `MinimalNOVAAttention` (clave de registro `minimal_nova`), un mecanismo de atención con proyecciones de bajo rango factorizadas por SVD y complejidad subcuadrática. Los 6 bloques restantes conservan la atención GQA softmax original de Qwen2 como anclas de recuperación contextual.

El objetivo del experimento es evaluar si un modelo compacto de 0,5B parámetros puede mantener la calidad de modelado del lenguaje tras reemplazar la mayor parte de su atención por un operador de bajo rango, mediante un proceso de destilación de conocimiento en dos etapas sobre WikiText-2. El resultado reportado es una perplejidad de 71,15 en el split de validación, frente a los 15,38 del profesor original, lo que indica una degradación sustancial pero una recuperación del 99,98% respecto al colapso inicial tras la cirugía (perplejidad de 398.525,01).

Es relevante ahora como banco de pruebas reproducible de técnicas de atención subcuadrática y destilación en modelos pequeños, no como modelo de producción. La licencia MIT y el formato de pesos estándar (safetensors) facilitan su inspección, aunque su naturaleza experimental y su calidad degradada limitan su uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención híbrida: 18/24 capas `MinimalNOVAAttention` (SVD low-rank) + 6/24 capas GQA softmax nativas |
| Parametros totales | 485.819.008 (según safetensors); el autor cita 494M para el base |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible explícitamente; heredada de Qwen2.5-0.5B (32.768 tokens en el modelo base, no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible; pesos publicados en FP16 completo (926,69 MB) más adaptador |
| Idiomas soportados | inglés (tag `en`); multilingüe no confirmado |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo + adaptador) |

## Arquitectura y entrenamiento
La arquitectura parte de Qwen2.5-0.5B: 24 capas decoder, dimensión oculta D=896, 14 cabezas de consulta y 2 cabezas KV (GQA), dimensión por cabeza d_h=64, RoPE con theta=1.000.000. La cirugía `hybrid_3_1` reemplaza los índices de capa [0,1,2,4,5,6,8,9,10,12,13,14,16,17,18,20,21,22] por `MinimalNOVAAttention` envuelto en `QwenAttentionAdapter`, mientras que [3,7,11,15,19,23] mantienen la atención GQA original. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 y una única `o_proj` sin duplicación. El operador soporta decodificación causal autorregresiva, GQA y RoPE, con despacho de kernels en tres niveles (CUDA, Triton, PyTorch).

El entrenamiento consistió en destilación de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), longitud de secuencia 512, batch 8 y acumulación de gradiente 4, sobre una RTX 3090 de 24 GB con caché offline de representaciones del profesor (0 MB de VRAM del profesor en GPU). Etapa 1 (30% del presupuesto, 129 pasos): solo entrenables módulos de atención y layernorm, con embeddings, MLP y `lm_head` congelados, AdamW lr=2.0e-4, weight decay 0.01, clipping 1.0, pérdida MSE + 0.25·(1−cos). Etapa 2 (70%, 289 pasos): destilación extremo a extremo sobre los 24 flujos residuales, lr=6.0e-5, pérdida MSE + 0.50·(1−cos), con `lm_head` evitado.

## Capacidades
- Generación de texto causal autorregresiva en inglés, heredada del modelo base.
- Conversación multi-turno (pipeline `text-generation`, tag `conversational`), aunque con calidad degradada respecto al base.
- Atención con complejidad subcuadrática en el 75% de las capas, lo que en teoría reduce el coste computacional en secuencias largas.
- Soporte de GQA y RoPE a través del adaptador, manteniendo compatibilidad con la interfaz de Qwen2.
- No se documenta soporte de tool calling, function calling, agentes ni multi-step reasoning.
- No se documenta visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe no confirmada; el tag de idioma es únicamente `en`.

## Casos de uso
- Investigación en atención subcuadrática: sirve como referencia reproducible para comparar `MinimalNOVAAttention` frente a GQA softmax en un modelo pequeño, usando la perplejidad de WikiText-2 como métrica controlada.
- Estudio de destilación de conocimiento: el protocolo de dos etapas y las métricas pre/post destilación permiten analizar la recuperación de representaciones tras una cirugía agresiva de atención.
- Benchmark de kernels: al despachar kernels CUDA/Triton/PyTorch, es útil para medir latencia y throughput de implementaciones de atención de bajo rango en GPUs consumer.
- Pruebas de compatibilidad de adaptadores: valida que `QwenAttentionAdapter` preserva la interfaz de Qwen2 (GQA, RoPE) en pipelines de Hugging Face.
- Docencia y divulgación: ejemplo didáctico de cómo una sustitución arquitectónica colapsa un modelo (PPL 398.525) y cómo la destilación lo recupera parcialmente (PPL 71,15).
- Prototipado de bajo coste: para experimentos que toleren calidad baja, cabe en una GPU consumer y permite iterar rápidamente sobre variantes de atención sin grandes recursos.

## Benchmarks y rendimiento

| Métrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (Qwen2.5-0.5B) | 15,38 | Referencia GQA softmax |
| Perplejidad del estudiante pre-destilación | 398.525,01 | Tras la cirugía de 18/24 capas |
| Perplejidad del estudiante post-destilación | 71,15 | Tras destilación en 2 etapas |
| Delta absoluto de perplejidad | −398.453,86 | Cambio logrado por destilación |
| Reducción relativa | 99,98% | Recuperación respecto al pico post-cirugía |

Medido en WikiText-2 (`wikitext-2-raw-v1`, split validation), longitud 512, batch 8, grad_accum 4, RTX 3090 24 GB. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en FP16: aproximadamente 1 GB para los pesos (926,69 MB) más overhead de activaciones y caché KV; holgado en GPUs de 8 GB o más.
- GPU recomendadas: RTX 3090 (usada en el entrenamiento), RTX 4090, A100 o H100 para mayor throughput; cualquier GPU consumer con al menos 4-8 GB puede ejecutarlo.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y similares; también en GPUs de 8 GB con margen.
- Opciones de despliegue: la librería declarada es `neuralops`, con despacho de kernels CUDA/Triton/PyTorch; no se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI, por lo que su integración en esos stacks requeriría conversión o adaptación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad (PPL WikiText-2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-minimal-nova-wikitext2 | 485,8M | no disponible | 71,15 | MIT | Hugging Face |
| Qwen/Qwen2.5-0.5B (profesor) | ~494M | 32.768 | 15,38 | Apache 2.0 (modelo base) | Hugging Face |
| Qwen/Qwen2.5-0.5B-Instruct | ~494M | 32.768 | no disponible | Apache 2.0 | Hugging Face |

La comparativa se limita al modelo base, ya que no se dispone de datos de otros modelos con atención subcuadrática del mismo tamaño en la información proporcionada. La diferencia de perplejidad (71,15 frente a 15,38) cuantifica el coste de la cirugía de atención en este checkpoint.

## Limitaciones y advertencias
- Calidad degradada: la perplejidad post-destilación (71,15) es más de 4,6 veces la del profesor (15,38), lo que se traducirá en generaciones menos coherentes y mayor tasa de errores.
- Riesgo elevado de alucinación y de texto incoherente, especialmente en contextos largos o dominios fuera de WikiText-2.
- Entrenado únicamente sobre WikiText-2 en inglés; el sesgo de dominio y de idioma es severo y no se documenta cobertura multilingüe.
- No hay evaluación de sesgos, seguridad ni robustez; no apto para producción sin validación adicional.
- Licencia MIT permite uso comercial, pero el modelo base Qwen2.5-0.5B tiene su propia licencia Apache 2.0 que conviene revisar en la cadena de derivación.
- Dependencia de la librería `neuralops` y del adaptador `QwenAttentionAdapter`; la portabilidad a otros stacks (vLLM, llama.cpp) no está garantizada.
- Los resultados de benchmarks son declarados por el autor y no están verificados (`verified: false` en el model-index).
- Longitud de contexto efectiva no confirmada para este checkpoint; la atención subcuadrática podría alterar el comportamiento en secuencias largas respecto al base.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-minimal-nova-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación `MinimalNOVAAttention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/minimal_nova.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
