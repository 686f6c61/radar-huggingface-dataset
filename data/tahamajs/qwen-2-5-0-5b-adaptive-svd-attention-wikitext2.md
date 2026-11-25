# tahamajs/qwen-2.5-0.5b-adaptive-svd-attention-wikitext2

## Resumen

`qwen-2.5-0.5b-adaptive-svd-attention-wikitext2` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps "Attention Surgery Zoo". No es un modelo entrenado desde cero, sino una intervención quirúrgica sobre `Qwen/Qwen2.5-0.5B`: se sustituyen 18 de las 24 capas de atención del decoder (disposición híbrida 3:1) por el operador `AdaptiveSVDAttention` de la librería NeuralOps, que combina SVD adaptativo con proyecciones factorizadas residuales. Las 6 capas restantes conservan la atención GQA softmax original de Qwen2 como anclas de enrutamiento contextual.

El problema que aborda es la evaluación de operadores de atención subcuadrática en modelos causales compactos: el autor mide el coste de reemplazar atención softmax por alternativas lineales/factorizadas y documenta el proceso de recuperación mediante destilación de conocimiento en dos etapas sobre WikiText-2. El resultado es un modelo de 494M parámetros (arquitectura base Qwen2.5-0.5B, D=896, 14 cabezas de consulta, 2 de clave/valor, RoPE con theta 1.000.000) que alcanza una perplejidad de 175,47 en la validación de WikiText-2 tras la destilación, frente a los 15,38 del profesor original.

Su relevancia es fundamentalmente metodológica y de investigación: sirve como referencia reproducible de cómo una cirugía de atención degrada drásticamente el modelo (perplejidad pre-destilación de 310.512,01) y de qué manera la destilación de representaciones ocultas recupera parte de la capacidad (99,94 % de reducción relativa de perplejidad). No está pensado como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder Qwen2 con atención híbrida: 18/24 capas `AdaptiveSVDAttention` (SVD adaptativo + proyecciones factorizadas residuales) y 6/24 capas GQA softmax nativas |
| Parametros totales | 494M (modelo base Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-0.5B soporta hasta 32.768 tokens; la evaluación se hizo a longitud 512) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 completo, 926,91 MB, más adaptador) |
| Idiomas soportados | inglés (etiqueta `en` en la model card) |
| Licencia | MIT |
| Formato de pesos | FP16 completo (926,91 MB) + adaptador; serialización determinista de NeuralOps (no safetensors/GGUF estándar) |

## Arquitectura y entrenamiento

La arquitectura parte del decoder Qwen2.5-0.5B: 24 bloques, dimensión oculta 896, 14 cabezas de consulta y 2 de clave/valor (GQA), dimensión por cabeza 64, RoPE con theta 1.000.000 y soporte autoregresivo causal. La cirugía `hybrid_3_1` reemplaza las capas en los índices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] por `AdaptiveSVDAttention` envuelto en `QwenAttentionAdapter`, mientras que las capas [3, 7, 11, 15, 19, 23] mantienen la atención GQA original. Cada capa transplantada hereda los tensores preentrenados `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 y una única `o_proj` para evitar colapso de proyecciones no inicializadas. El operador usa un despacho de kernels en tres niveles (CUDA / Triton / PyTorch).

El entrenamiento consiste en destilación de conocimiento de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), ejecutada en una RTX 3090 de 24 GB con caché offline de representaciones (0 MB de VRAM del profesor en GPU). La etapa 1 (30 % del presupuesto, 90 pasos) congela embeddings, MLP y `lm_head` y entrena solo módulos de atención y layer norms con AdamW (lr 2.0e-4, weight decay 0.01, clipping 1.0), minimizando MSE por capa más 0.25·(1 − coseno). La etapa 2 (70 %, 203 pasos) hace destilación extremo a extremo sobre los 24 flujos residuales con pérdida MSE + 0.50·(1 − coseno) y lr 6.0e-5, omitiendo `lm_head`. Se usaron pesos maestros FP32 con AMP FP16 y `GradScaler`.

## Capacidades

- Generación de texto causal autoregresiva en inglés, heredada del modelo base Qwen2.5-0.5B.
- Soporte de atención GQA y RoPE, con despacho de kernels CUDA/Triton/PyTorch.
- Capacidad de conversación y generación de texto (pipeline `text-generation`, etiqueta `conversational`).
- No se documentan capacidades de tool calling, agentes, matemáticas avanzadas, visión ni audio en la información disponible.
- Multilingüismo limitado: la model card declara únicamente inglés.
- Valor principal como artefacto de investigación para estudiar operadores de atención subcuadrática y destilación, no como asistente generalista.

## Casos de uso

- Investigación sobre atención subcuadrática: servir como punto de comparación reproducible para medir cómo el reemplazo de softmax por SVD adaptativo afecta a la perplejidad en modelos de 0,5B, usando el par pre/post destilación (310.512,01 → 175,47).
- Estudio de destilación de representaciones: el protocolo en dos etapas y la telemetría publicada permiten replicar experimentos de alineación de estados ocultos con pérdida MSE + coseno.
- Benchmarking de kernels: al integrar despacho CUDA/Triton/PyTorch, sirve para validar el rendimiento de la implementación `AdaptiveSVDAttention` frente a GQA softmax en la misma topología.
- Docencia y divulgación: ejemplo didáctico de cirugía de atención ("attention surgery") y de sus consecuencias en un modelo compacto.
- Pruebas de infraestructura NeuralOps: validar la carga de checkpoints con serialización determinista y adaptadores en pipelines de la librería.
- Ablación de topologías híbridas: modificar la proporción 3:1 de capas transplantadas para estudiar el equilibrio entre eficiencia lineal y recuperación de induction heads.
- No se recomienda su uso en atención al cliente, generación de código en producción ni tareas que requieran calidad lingüística, dado el elevado coste en perplejidad.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) en la validación de WikiText-2 (`wikitext-2-raw-v1`), longitud de secuencia 512, batch 8 con acumulación de gradiente 4, sobre una RTX 3090 de 24 GB:

| Metrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 | Referencia GQA softmax exacta |
| Perplejidad del estudiante pre-destilación | 310.512,01 | Tras el transplante de 18/24 capas |
| Perplejidad del estudiante post-destilación | 175,47 | Tras destilación en dos etapas |
| Delta absoluto de perplejidad | −310.336,53 | Cambio logrado por destilación |
| Reducción relativa de perplejidad | 99,94 % | Recuperación desde el pico post-cirugía |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP16 ocupan 926,91 MB; con overhead de activaciones y caché KV, cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor usó una RTX 3090 de 24 GB para el entrenamiento por destilación.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: la librería NeuralOps es el entorno nativo; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y el formato de pesos no es safetensors/GGUF estándar, por lo que la conversión requeriría trabajo adicional.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-adaptive-svd-attention-wikitext2 | 494M | no disponible (base: 32.768) | 175,47 (post-KD) | MIT | Hugging Face, 291 descargas |
| Qwen/Qwen2.5-0.5B (profesor) | 494M | 32.768 | 15,38 | Apache 2.0 | Hugging Face, ampliamente usado |
| Alternativas de 0,5B con atención estándar | ~500M | variable | no disponible | variable | no disponible |

La comparación directa con el profesor es la más informativa: mismo tamaño y arquitectura base, pero una diferencia de perplejidad de más de 11× a favor del modelo original. No se dispone de datos de otros operadores de atención subcuadrática comparables en la información proporcionada.

## Limitaciones y advertencias

- Degradación severa de calidad: la perplejidad post-destilación (175,47) es más de 11 veces la del modelo base (15,38), lo que se traduce en generaciones poco fiables.
- Riesgo elevado de alucinación y texto incoherente, especialmente en secuencias largas o contextos complejos.
- Idiomas: solo se declara inglés; no hay evidencia de calidad en castellano.
- Contexto: aunque el base soporta 32.768 tokens, la evaluación se hizo a 512 y no se documenta el comportamiento del operador SVD a longitudes mayores.
- Licencia MIT permite uso comercial, pero el modelo base Qwen2.5-0.5B es Apache 2.0; conviene revisar la compatibilidad y atribuciones.
- Formato de pesos no estándar (serialización NeuralOps con adaptador), lo que limita el despliegue con herramientas convencionales.
- Benchmarks no verificados (`verified: false`) y ausencia de evaluación en tareas distintas de la perplejidad.
- No apto para producción sin validación adicional; su propósito es la investigación sobre atención y destilación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-adaptive-svd-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/adaptive_svd_attention.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
