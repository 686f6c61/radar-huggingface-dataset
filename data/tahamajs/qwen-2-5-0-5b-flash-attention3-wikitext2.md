# tahamajs/qwen-2.5-0.5b-flash-attention3-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-flash-attention3-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se ha realizado una "cirugía de atención" (attention surgery): 18 de las 24 capas del decodificador han sido sustituidas por el operador `flash_attention3` de la librería NeuralOps, manteniendo 6 capas con la atención GQA original de Qwen2 como anclas. El autor es tahamajs y el modelo se publica bajo licencia MIT como parte del denominado "Attention Surgery Zoo".

El modelo no está pensado como un asistente listo para producción, sino como un artefacto de investigación para estudiar el impacto de sustituir mecanismos de atención en transformers pequeños y la viabilidad de recuperar calidad mediante destilación de conocimiento. Tras la intervención quirúrgica, la perplejidad en WikiText-2 se dispara a 779.190,64; tras un proceso de destilación en dos etapas sobre WikiText-2, baja a 669,12, aún muy lejos del baseline del profesor (15,38).

La relevancia actual reside en su valor como banco de pruebas reproducible: documenta con telemetría detallada (hardware, pasos, hiperparámetros, presupuesto de entrenamiento) el coste real de intercambiar atención softmax exacta por variantes eficientes en modelos compactos, y publica los pesos en FP16 junto a un adaptador, facilitando la replicación de experimentos de arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atención híbrida: 18/24 capas con `flash_attention3` (NeuralOps) y 6/24 capas con GQA softmax nativa |
| Parametros totales | 535.364.224 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado/evaluado a longitud de secuencia 512) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 completo, 1021,18 MB, más adaptador) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo + adaptador) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B (24 capas, dimensión oculta D=896, 14 cabezas de query, 2 cabezas KV, dimensión por cabeza 64, RoPE con theta=1.000.000). La intervención sustituye la atención en las capas [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] por `FlashAttention3` envuelto en `QwenAttentionAdapter`, con expansión de cabezas KV de 2 a 14 y herencia directa de los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor. Las capas [3, 7, 11, 15, 19, 23] conservan la GQA softmax original como anclas de enrutamiento contextual global.

El entrenamiento consiste en destilación de conocimiento de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 1 (30 % del presupuesto, 121 pasos) congela embeddings, MLPs y `lm_head`, y entrena solo módulos de atención y layer norms con AdamW (lr=2.0e-4, weight decay 0.01, clipping 1.0), minimizando MSE más 0.25·(1 − coseno) por capa. La etapa 2 (70 %, 279 pasos) hace destilación extremo a extremo sobre las 24 corrientes residuales con lr=6.0e-5 y peso coseno 0.50, omitiendo `lm_head` para maximizar throughput. El proceso se ejecutó en una NVIDIA GeForce RTX 3090 de 24 GB con caché offline de representaciones del profesor (0 MB de VRAM del profesor en GPU).

## Capacidades

- Generación de texto causal autoregresiva en inglés.
- Conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Soporte de atención causal con GQA y RoPE.
- Capacidad de razonamiento, código o matemáticas: no disponible de forma fiable; la perplejidad de 669,12 en WikiText-2 indica una degradación severa respecto al modelo base.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales: ninguna declarada (sin visión, audio ni modo thinking).

## Casos de uso

- Investigación en arquitecturas de atención: el checkpoint sirve para estudiar empíricamente cómo afecta la sustitución de atención softmax por `flash_attention3` a la perplejidad en modelos de 0,5B, con telemetría completa y reproducible.
- Reproducción de experimentos de destilación: los hiperparámetros, pasos y presupuesto están documentados, lo que permite replicar el protocolo de dos etapas en otros modelos o datasets.
- Benchmark de operadores de atención: útil para comparar el rendimiento de kernels CUDA/Triton de NeuralOps frente a la atención nativa de Qwen2 en hardware consumer (RTX 3090).
- Docencia y formación: ejemplo didáctico de "attention surgery" y de cómo un transplante mal inicializado colapsa el modelo (PPL de 779.190) y cómo la destilación recupera parte de la calidad.
- Pruebas de pipelines de serialización: el repositorio incluye pesos FP16 completos más adaptador, útil para validar flujos de carga y fusión de adaptadores en `neuralops`.
- Estudio de híbridos 3:1: permite analizar si mantener 6 capas GQA como anclas es suficiente para preservar el enrutamiento contextual global en modelos compactos.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 | Referencia GQA softmax exacta |
| Perplejidad del estudiante tras cirugía (zero-shot) | 779.190,64 | Inmediatamente tras el transplante 18/24 |
| Perplejidad del estudiante tras destilación | 669,12 | Tras destilación de representaciones en 2 etapas |
| Delta absoluto de perplejidad | −778.521,52 | Mejora lograda por la destilación |
| Reducción relativa de perplejidad | 99,91 % | Recuperación desde el pico post-cirugía |

Evaluación realizada en el split de validación de WikiText-2 (`wikitext-2-raw-v1`) con longitud de secuencia 512, batch_size=8 y grad_accum=4, en una NVIDIA GeForce RTX 3090 de 24 GB. No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K u otras tareas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2-1,5 GB en FP16 (pesos de 1021,18 MB más adaptador y overhead de activaciones); en cuantización de 8 bits o 4 bits podría reducirse a menos de 1 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; el autor usó una RTX 3090 de 24 GB para el entrenamiento.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: la librería `neuralops` es la vía nativa; para `transformers`, `vLLM`, `llama.cpp` u Ollama no hay soporte declarado del operador `flash_attention3`, por lo que la integración requeriría trabajo adicional.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-flash-attention3-wikitext2` | 535M | no disponible | 669,12 | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (profesor) | 494M | 32.768 tokens (según Qwen) | 15,38 (medido por el autor) | Apache 2.0 | Hugging Face |
| `Qwen/Qwen2.5-1.5B` | 1,5B | 32.768 tokens (según Qwen) | no disponible | Apache 2.0 | Hugging Face |

La comparativa se limita al modelo base y a su versión superior de la misma familia; no se dispone de datos de benchmarks de otros modelos experimentales de atención eficiente en este tamaño para una comparación directa.

## Limitaciones y advertencias

- Degradación severa de calidad: la perplejidad de 669,12 frente a 15,38 del profesor implica que el modelo no es apto para uso en producción ni como asistente conversacional real.
- Riesgo elevado de alucinación y generación incoherente derivado de la baja calidad del modelado del lenguaje.
- Entrenado y evaluado únicamente en WikiText-2 en inglés; el dominio y los idiomas están muy restringidos.
- No se han publicado evaluaciones en tareas de razonamiento, código, matemáticas ni instrucciones.
- La licencia MIT permite uso comercial, pero el estado del modelo desaconseja cualquier despliegue real.
- Dependencia de la librería `neuralops` y del operador `flash_attention3`: la carga en ecosistemas estándar (`transformers`, `vLLM`, `llama.cpp`) no está garantizada.
- El checkpoint incluye pesos FP16 completos más un adaptador; es necesario verificar el flujo de fusión antes de usarlo.
- El modelo base Qwen2.5-0.5B tiene su propia licencia Apache 2.0; conviene revisar la compatibilidad con la relicenciación MIT del derivado.
- Sin datos sobre sesgos específicos más allá de los heredados del corpus WikiText-2 y del profesor.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-flash-attention3-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/fast_kernels/flash_attention3.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset: https://huggingface.co/datasets/Salesforce/wikitext
